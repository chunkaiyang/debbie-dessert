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
        availability_date_id, location_name, address, starts_at, ends_at, active
      )
      values (
        v_date_id,
        v_slot->>'locationName',
        v_slot->>'address',
        (v_slot->>'startsAt')::timestamptz,
        (v_slot->>'endsAt')::timestamptz,
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
security definer
set search_path = pg_catalog, public
as $$
  with committed_by_date as (
    select availability_date_id, coalesce(sum(total_capacity_units), 0)::integer as committed_units
    from public.cake_orders
    where status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now())
    group by availability_date_id
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
            'startsAt', ps.starts_at, 'endsAt', ps.ends_at
          ) order by ps.starts_at)
          from public.pickup_slots ps
          where ps.availability_date_id = pd.id and ps.active
        ), '[]'::jsonb)
      ) order by pd.service_date)
      from public_dates pd
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_cake_ordering_data() from public;
grant execute on function public.get_cake_ordering_data() to anon, authenticated;

create or replace function public.reserve_cake_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_date public.cake_availability_dates;
  v_slot public.pickup_slots;
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_total_units integer := 0;
  v_total_cents integer := 0;
  v_committed_units integer;
  v_item jsonb;
  v_variant public.product_variants;
  v_product public.products;
  v_lookup_token text := encode(gen_random_bytes(32), 'hex');
  v_owner_email text;
begin
  if coalesce((payload->>'termsAccepted')::boolean, false) = false then
    raise exception 'Terms must be accepted';
  end if;

  select * into v_date from public.cake_availability_dates
  where id = (payload->>'availabilityDateId')::uuid
  for update;

  if v_date.id is null or v_date.status <> 'published' or v_date.ordering_cutoff_at <= now() then
    raise exception 'Cake date is unavailable';
  end if;

  select * into v_slot from public.pickup_slots
  where id = (payload->>'pickupSlotId')::uuid
    and availability_date_id = v_date.id
    and active
  for update;
  if v_slot.id is null then raise exception 'Pickup slot is unavailable'; end if;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    select pv.* into v_variant
    from public.product_variants pv
    where pv.id = (v_item->>'variantId')::uuid and pv.active;
    if v_variant.id is null then raise exception 'Product variant is unavailable'; end if;
    v_total_units := v_total_units + v_variant.capacity_units * (v_item->>'quantity')::integer;
    v_total_cents := v_total_cents + v_variant.price_cents * (v_item->>'quantity')::integer;
  end loop;

  select coalesce(sum(total_capacity_units), 0) into v_committed_units
  from public.cake_orders
  where availability_date_id = v_date.id
    and status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
    and (hold_expires_at is null or hold_expires_at > now());
  if v_committed_units + v_total_units > v_date.capacity_units then raise exception 'Cake date is sold out'; end if;

  insert into public.customers(name, email, phone)
  values (payload#>>'{customer,name}', lower(payload#>>'{customer,email}'), payload#>>'{customer,phone}')
  returning id into v_customer_id;

  insert into public.cake_orders(customer_id, availability_date_id, pickup_slot_id, status, payment_status, subtotal_cents, total_capacity_units, customer_notes, hold_expires_at, lookup_token_hash, idempotency_key)
  values (v_customer_id, v_date.id, v_slot.id, 'pending_confirmation', 'unpaid', v_total_cents, v_total_units, payload#>>'{customer,notes}', null, encode(digest(v_lookup_token, 'sha256'), 'hex'), payload->>'idempotencyKey')
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    select * into v_variant
    from public.product_variants
    where id = (v_item->>'variantId')::uuid;
    select * into v_product
    from public.products
    where id = v_variant.product_id;
    insert into public.cake_order_items(order_id, product_id, variant_id, product_name_en_snapshot, product_name_zh_snapshot, variant_name_snapshot, quantity, unit_price_cents, capacity_units_each)
    values (v_order_id, v_product.id, v_variant.id, v_product.name_en, v_product.name_zh, v_variant.label_en, (v_item->>'quantity')::integer, v_variant.price_cents, v_variant.capacity_units);
  end loop;

  select u.email into v_owner_email
  from auth.users u
  join public.staff_roles sr on sr.user_id = u.id
  where sr.role = 'owner'
  order by sr.created_at
  limit 1;

  insert into public.notification_outbox(template_code, recipient, entity_type, entity_id, payload, idempotency_key)
  values
    ('cake_order_received', payload#>>'{customer,email}', 'cake_order', v_order_id, jsonb_build_object('orderId', v_order_id, 'orderNumber', v_order_number), 'cake-order-customer-' || v_order_id),
    ('cake_order_needs_confirmation', coalesce(v_owner_email, 'owner@local'), 'cake_order', v_order_id, jsonb_build_object('orderId', v_order_id, 'orderNumber', v_order_number), 'cake-order-owner-' || v_order_id);

  return jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'lookupToken', v_lookup_token,
    'status', 'pending_confirmation',
    'message', 'Order received. Debbie will confirm your cake order manually.'
  );
end;
$$;

alter table public.pickup_slots drop column capacity_units;
