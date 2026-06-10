create extension if not exists pg_trgm with schema extensions;

create index if not exists cake_orders_status_created_at_idx
  on public.cake_orders(status, created_at desc);
create index if not exists cake_orders_payment_status_created_at_idx
  on public.cake_orders(payment_status, created_at desc);
create index if not exists cake_orders_order_number_search_idx
  on public.cake_orders using gin (lower(order_number) extensions.gin_trgm_ops);
create index if not exists customers_name_search_idx
  on public.customers using gin (lower(name) extensions.gin_trgm_ops);
create index if not exists customers_email_search_idx
  on public.customers using gin (lower(email) extensions.gin_trgm_ops);

create or replace function public.owner_order_report(
  p_filters jsonb default '{}'::jsonb,
  p_page integer default 1,
  p_page_size integer default 25,
  p_include_items boolean default false,
  p_export boolean default false
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, extensions
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 25), 1), 100);
  v_search text := nullif(trim(p_filters->>'search'), '');
  v_result jsonb;
begin
  if not public.is_owner() then
    raise exception 'Owner access required';
  end if;

  with filtered as materialized (
    select
      o.id,
      o.order_number,
      o.status,
      o.payment_status,
      o.payment_method,
      o.subtotal_cents,
      o.paid_cents,
      o.refunded_cents,
      o.currency,
      o.created_at,
      c.name as customer_name,
      c.email as customer_email,
      d.service_date,
      ps.location_name as pickup_location
    from public.cake_orders o
    join public.customers c on c.id = o.customer_id
    join public.cake_availability_dates d on d.id = o.availability_date_id
    join public.pickup_slots ps on ps.id = o.pickup_slot_id
    where
      (nullif(p_filters->>'orderFrom', '') is null
        or o.created_at >= ((p_filters->>'orderFrom')::date::timestamp at time zone 'Australia/Brisbane'))
      and (nullif(p_filters->>'orderTo', '') is null
        or o.created_at < (((p_filters->>'orderTo')::date + 1)::timestamp at time zone 'Australia/Brisbane'))
      and (nullif(p_filters->>'pickupFrom', '') is null
        or d.service_date >= (p_filters->>'pickupFrom')::date)
      and (nullif(p_filters->>'pickupTo', '') is null
        or d.service_date <= (p_filters->>'pickupTo')::date)
      and (nullif(p_filters->>'status', '') is null
        or o.status::text = p_filters->>'status')
      and (nullif(p_filters->>'paymentStatus', '') is null
        or o.payment_status::text = p_filters->>'paymentStatus')
      and (
        v_search is null
        or lower(o.order_number) like '%' || lower(v_search) || '%'
        or lower(c.name) like '%' || lower(v_search) || '%'
        or lower(c.email) like '%' || lower(v_search) || '%'
      )
  ),
  summary as (
    select
      count(*)::integer as total_count,
      coalesce(sum(subtotal_cents), 0)::bigint as gross_cents,
      coalesce(sum(paid_cents), 0)::bigint as paid_cents,
      coalesce(sum(refunded_cents), 0)::bigint as refunded_cents
    from filtered
  ),
  result_rows as (
    select *
    from filtered
    order by created_at desc, id desc
    limit case when p_export then null else v_page_size end
    offset case when p_export then 0 else (v_page - 1) * v_page_size end
  )
  select jsonb_build_object(
    'orders',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'orderNumber', r.order_number,
          'customerName', r.customer_name,
          'customerEmail', r.customer_email,
          'createdAt', r.created_at,
          'serviceDate', r.service_date,
          'pickupLocation', r.pickup_location,
          'status', r.status,
          'paymentStatus', r.payment_status,
          'paymentMethod', r.payment_method,
          'subtotalCents', r.subtotal_cents,
          'paidCents', r.paid_cents,
          'refundedCents', r.refunded_cents,
          'currency', r.currency,
          'items', case when p_include_items then coalesce((
            select jsonb_agg(jsonb_build_object(
              'name', i.product_name_en_snapshot,
              'variant', i.variant_name_snapshot,
              'quantity', i.quantity,
              'lineTotalCents', i.line_total_cents
            ) order by i.id)
            from public.cake_order_items i
            where i.order_id = r.id
          ), '[]'::jsonb) else '[]'::jsonb end
        )
        order by r.created_at desc, r.id desc
      )
      from result_rows r
    ), '[]'::jsonb),
    'totalCount', s.total_count,
    'page', v_page,
    'pageSize', v_page_size,
    'totalPages', case
      when s.total_count = 0 then 0
      else ceil(s.total_count::numeric / v_page_size)::integer
    end,
    'totals', jsonb_build_object(
      'grossCents', s.gross_cents,
      'paidCents', s.paid_cents,
      'refundedCents', s.refunded_cents,
      'netReceivedCents', s.paid_cents - s.refunded_cents
    )
  )
  into v_result
  from summary s;

  return v_result;
end;
$$;

revoke all on function public.owner_order_report(jsonb, integer, integer, boolean, boolean) from public;
grant execute on function public.owner_order_report(jsonb, integer, integer, boolean, boolean) to authenticated;

notify pgrst, 'reload schema';
