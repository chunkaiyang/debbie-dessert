alter type public.order_status add value if not exists 'pending_confirmation';

create or replace function public.get_cake_ordering_data()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with committed_by_date as (
    select
      availability_date_id,
      coalesce(sum(total_capacity_units), 0)::integer as committed_units
    from public.cake_orders
    where status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now())
    group by availability_date_id
  ),
  committed_by_slot as (
    select
      pickup_slot_id,
      coalesce(sum(total_capacity_units), 0)::integer as committed_units
    from public.cake_orders
    where status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now())
    group by pickup_slot_id
  ),
  public_dates as (
    select
      d.id,
      d.service_date,
      d.capacity_units,
      d.ordering_cutoff_at,
      greatest(d.capacity_units - coalesce(cbd.committed_units, 0), 0)::integer as remaining_units
    from public.cake_availability_dates d
    left join committed_by_date cbd on cbd.availability_date_id = d.id
    where d.status = 'published'
      and d.ordering_cutoff_at > now()
    order by d.service_date
  )
  select jsonb_build_object(
    'products',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'slug', p.slug,
          'variantId', pv.id,
          'nameEn', p.name_en,
          'nameZh', p.name_zh,
          'descriptionEn', p.description_en,
          'descriptionZh', p.description_zh,
          'priceCents', pv.price_cents,
          'imagePath', p.image_path,
          'ingredientsEn', p.ingredients_en,
          'allergensEn', p.allergens_en
        )
        order by p.created_at
      )
      from public.products p
      join public.product_variants pv on pv.product_id = p.id
      where p.active and pv.active
    ), '[]'::jsonb),
    'dates',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', pd.id,
          'serviceDate', pd.service_date,
          'capacityUnits', pd.capacity_units,
          'remainingUnits', pd.remaining_units,
          'orderingCutoffAt', pd.ordering_cutoff_at,
          'slots', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', ps.id,
                'locationName', ps.location_name,
                'startsAt', ps.starts_at,
                'endsAt', ps.ends_at,
                'capacityUnits', ps.capacity_units,
                'remainingUnits',
                  case
                    when ps.capacity_units is null then null
                    else greatest(ps.capacity_units - coalesce(cbs.committed_units, 0), 0)
                  end
              )
              order by ps.starts_at
            )
            from public.pickup_slots ps
            left join committed_by_slot cbs on cbs.pickup_slot_id = ps.id
            where ps.availability_date_id = pd.id
              and ps.active
          ), '[]'::jsonb)
        )
        order by pd.service_date
      )
      from public_dates pd
    ), '[]'::jsonb)
  );
$$;

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
  v_slot_committed integer;
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

  if v_slot.capacity_units is not null then
    select coalesce(sum(total_capacity_units), 0) into v_slot_committed
    from public.cake_orders
    where pickup_slot_id = v_slot.id
      and status::text in ('pending_confirmation', 'held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now());
    if v_slot_committed + v_total_units > v_slot.capacity_units then raise exception 'Pickup slot is full'; end if;
  end if;

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
