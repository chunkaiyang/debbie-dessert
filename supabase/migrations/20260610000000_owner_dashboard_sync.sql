alter table public.products
  add column if not exists display_order integer not null default 0,
  add column if not exists homepage_notes_en text[] not null default '{}'::text[],
  add column if not exists homepage_notes_zh text[] not null default '{}'::text[];

alter table public.cake_orders
  add column if not exists payment_method text
    check (payment_method is null or payment_method in ('cash', 'card', 'bank_transfer', 'other')),
  add column if not exists paid_cents integer not null default 0 check (paid_cents >= 0),
  add column if not exists refunded_cents integer not null default 0 check (refunded_cents >= 0);

create index if not exists cake_orders_created_at_idx
  on public.cake_orders(created_at desc);
create index if not exists cake_orders_service_history_idx
  on public.cake_orders(availability_date_id, created_at desc);
create index if not exists products_display_order_idx
  on public.products(active, display_order, created_at);

update public.products
set
  display_order = case slug when 'original' then 10 when 'chocolate' then 20 when 'taro' then 30 else display_order end,
  homepage_notes_en = case slug
    when 'original' then array['Creamy', 'Rich & smooth', 'Pure comfort']
    when 'chocolate' then array['Chocolatey', 'Balanced', 'Deep flavour']
    when 'taro' then array['Taro', 'Two layers', 'Natural']
    else homepage_notes_en
  end,
  homepage_notes_zh = case slug
    when 'original' then array['濃郁奶香', '綿密細緻', '幸福首選']
    when 'chocolate' then array['香濃可可', '微苦不膩', '層次豐富']
    when 'taro' then array['大甲芋頭', '雙層享受', '天然食材']
    else homepage_notes_zh
  end;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cake-flavours',
  'cake-flavours',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads cake flavour images" on storage.objects;
create policy "public reads cake flavour images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cake-flavours');

drop policy if exists "owner uploads cake flavour images" on storage.objects;
create policy "owner uploads cake flavour images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'cake-flavours' and (select public.is_owner()));

drop policy if exists "owner updates cake flavour images" on storage.objects;
create policy "owner updates cake flavour images"
on storage.objects for update
to authenticated
using (bucket_id = 'cake-flavours' and (select public.is_owner()))
with check (bucket_id = 'cake-flavours' and (select public.is_owner()));

drop policy if exists "owner deletes cake flavour images" on storage.objects;
create policy "owner deletes cake flavour images"
on storage.objects for delete
to authenticated
using (bucket_id = 'cake-flavours' and (select public.is_owner()));

create or replace function public.owner_update_cake_order(payload jsonb)
returns public.cake_orders
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_order public.cake_orders;
  v_before jsonb;
  v_status public.order_status;
  v_payment_status public.payment_status;
  v_allowed boolean := false;
begin
  if not public.is_owner() then
    raise exception 'Owner access required';
  end if;

  select * into v_order
  from public.cake_orders
  where id = (payload->>'orderId')::uuid
  for update;

  if v_order.id is null then raise exception 'Order not found'; end if;
  v_before := to_jsonb(v_order);
  v_status := coalesce((payload->>'status')::public.order_status, v_order.status);
  v_payment_status := coalesce((payload->>'paymentStatus')::public.payment_status, v_order.payment_status);

  v_allowed :=
    v_status = v_order.status
    or (v_order.status = 'pending_confirmation' and v_status in ('confirmed', 'cancelled'))
    or (v_order.status = 'confirmed' and v_status in ('in_production', 'cancelled', 'refunded'))
    or (v_order.status = 'in_production' and v_status in ('ready', 'cancelled', 'refunded'))
    or (v_order.status = 'ready' and v_status in ('collected', 'cancelled', 'refunded'))
    or (v_order.status = 'collected' and v_status = 'refunded')
    or (v_order.status in ('held', 'awaiting_payment') and v_status in ('confirmed', 'cancelled', 'expired'));

  if not v_allowed then
    raise exception 'Invalid order status transition from % to %', v_order.status, v_status;
  end if;

  update public.cake_orders
  set
    status = v_status,
    payment_status = v_payment_status,
    payment_method = nullif(payload->>'paymentMethod', ''),
    paid_cents = greatest(coalesce((payload->>'paidCents')::integer, paid_cents), 0),
    refunded_cents = greatest(coalesce((payload->>'refundedCents')::integer, refunded_cents), 0),
    confirmed_at = case when v_status = 'confirmed' and confirmed_at is null then now() else confirmed_at end,
    collected_at = case when v_status = 'collected' and collected_at is null then now() else collected_at end,
    cancelled_at = case when v_status in ('cancelled', 'refunded') and cancelled_at is null then now() else cancelled_at end,
    updated_at = now()
  where id = v_order.id
  returning * into v_order;

  if v_order.refunded_cents > v_order.paid_cents then
    raise exception 'Refunded amount cannot exceed paid amount';
  end if;

  insert into public.audit_log(actor_user_id, entity_type, entity_id, action, before_data, after_data, reason)
  values (
    auth.uid(),
    'cake_order',
    v_order.id,
    'owner_update',
    v_before,
    to_jsonb(v_order),
    nullif(payload->>'reason', '')
  );

  return v_order;
end;
$$;

revoke all on function public.owner_update_cake_order(jsonb) from public;
grant execute on function public.owner_update_cake_order(jsonb) to authenticated;

create or replace function public.owner_save_cake_availability(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_date_id uuid;
  v_before jsonb;
  v_slot jsonb;
  v_seen_slot_ids uuid[] := '{}'::uuid[];
  v_slot_id uuid;
begin
  if not public.is_owner() then raise exception 'Owner access required'; end if;

  v_date_id := nullif(payload->>'id', '')::uuid;
  if v_date_id is null then
    insert into public.cake_availability_dates(
      service_date, status, capacity_units, ordering_cutoff_at, customer_note_en, customer_note_zh
    )
    values (
      (payload->>'serviceDate')::date,
      (payload->>'status')::public.content_status,
      (payload->>'capacityUnits')::integer,
      (payload->>'orderingCutoffAt')::timestamptz,
      nullif(payload->>'customerNoteEn', ''),
      nullif(payload->>'customerNoteZh', '')
    )
    returning id into v_date_id;
  else
    select to_jsonb(d) into v_before
    from public.cake_availability_dates d where d.id = v_date_id for update;
    if v_before is null then raise exception 'Availability date not found'; end if;

    update public.cake_availability_dates
    set
      service_date = (payload->>'serviceDate')::date,
      status = (payload->>'status')::public.content_status,
      capacity_units = (payload->>'capacityUnits')::integer,
      ordering_cutoff_at = (payload->>'orderingCutoffAt')::timestamptz,
      customer_note_en = nullif(payload->>'customerNoteEn', ''),
      customer_note_zh = nullif(payload->>'customerNoteZh', ''),
      updated_at = now()
    where id = v_date_id;
  end if;

  for v_slot in select * from jsonb_array_elements(payload->'slots')
  loop
    v_slot_id := nullif(v_slot->>'id', '')::uuid;
    if v_slot_id is null then
      insert into public.pickup_slots(
        availability_date_id, location_name, address, starts_at, ends_at, capacity_units, active
      )
      values (
        v_date_id,
        v_slot->>'locationName',
        v_slot->>'address',
        (v_slot->>'startsAt')::timestamptz,
        (v_slot->>'endsAt')::timestamptz,
        nullif(v_slot->>'capacityUnits', '')::integer,
        coalesce((v_slot->>'active')::boolean, true)
      )
      returning id into v_slot_id;
    else
      update public.pickup_slots
      set
        location_name = v_slot->>'locationName',
        address = v_slot->>'address',
        starts_at = (v_slot->>'startsAt')::timestamptz,
        ends_at = (v_slot->>'endsAt')::timestamptz,
        capacity_units = nullif(v_slot->>'capacityUnits', '')::integer,
        active = coalesce((v_slot->>'active')::boolean, true)
      where id = v_slot_id and availability_date_id = v_date_id;
      if not found then raise exception 'Pickup slot not found'; end if;
    end if;
    v_seen_slot_ids := array_append(v_seen_slot_ids, v_slot_id);
  end loop;

  update public.pickup_slots
  set active = false
  where availability_date_id = v_date_id
    and not (id = any(v_seen_slot_ids));

  insert into public.audit_log(actor_user_id, entity_type, entity_id, action, before_data, after_data)
  select auth.uid(), 'cake_availability_date', v_date_id, 'owner_save', v_before, to_jsonb(d)
  from public.cake_availability_dates d where d.id = v_date_id;

  return v_date_id;
end;
$$;

revoke all on function public.owner_save_cake_availability(jsonb) from public;
grant execute on function public.owner_save_cake_availability(jsonb) to authenticated;

create or replace function public.get_cake_ordering_data()
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with committed_by_date as (
    select availability_date_id, coalesce(sum(total_capacity_units), 0)::integer as committed_units
    from public.cake_orders
    where status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now())
    group by availability_date_id
  ),
  committed_by_slot as (
    select pickup_slot_id, coalesce(sum(total_capacity_units), 0)::integer as committed_units
    from public.cake_orders
    where status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now())
    group by pickup_slot_id
  ),
  public_dates as (
    select d.id, d.service_date, d.capacity_units, d.ordering_cutoff_at,
      greatest(d.capacity_units - coalesce(cbd.committed_units, 0), 0)::integer as remaining_units
    from public.cake_availability_dates d
    left join committed_by_date cbd on cbd.availability_date_id = d.id
    where d.status = 'published' and d.ordering_cutoff_at > now()
    order by d.service_date
  )
  select jsonb_build_object(
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'variantId', pv.id,
        'nameEn', p.name_en, 'nameZh', p.name_zh,
        'descriptionEn', p.description_en, 'descriptionZh', p.description_zh,
        'priceCents', pv.price_cents, 'imagePath', p.image_path,
        'ingredientsEn', p.ingredients_en, 'allergensEn', p.allergens_en,
        'displayOrder', p.display_order,
        'homepageNotesEn', p.homepage_notes_en,
        'homepageNotesZh', p.homepage_notes_zh
      ) order by p.display_order, p.created_at)
      from public.products p
      join public.product_variants pv on pv.product_id = p.id
      where p.active and pv.active
    ), '[]'::jsonb),
    'dates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pd.id, 'serviceDate', pd.service_date,
        'capacityUnits', pd.capacity_units, 'remainingUnits', pd.remaining_units,
        'orderingCutoffAt', pd.ordering_cutoff_at,
        'slots', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', ps.id, 'locationName', ps.location_name,
            'startsAt', ps.starts_at, 'endsAt', ps.ends_at,
            'capacityUnits', ps.capacity_units,
            'remainingUnits', case when ps.capacity_units is null then null
              else greatest(ps.capacity_units - coalesce(cbs.committed_units, 0), 0) end
          ) order by ps.starts_at)
          from public.pickup_slots ps
          left join committed_by_slot cbs on cbs.pickup_slot_id = ps.id
          where ps.availability_date_id = pd.id and ps.active
        ), '[]'::jsonb)
      ) order by pd.service_date)
      from public_dates pd
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.get_cake_ordering_data() to anon, authenticated;
