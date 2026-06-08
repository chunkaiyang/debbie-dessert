create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'published', 'closed', 'cancelled');
create type public.order_status as enum ('held', 'awaiting_payment', 'confirmed', 'in_production', 'ready', 'collected', 'cancelled', 'refunded', 'expired');
create type public.payment_status as enum ('unpaid', 'pending', 'paid', 'failed', 'partially_refunded', 'refunded');
create type public.booking_status as enum ('confirmed', 'attended', 'no_show', 'cancelled');

create table public.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner')),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  description_en text not null,
  description_zh text not null,
  ingredients_en text not null,
  ingredients_zh text not null,
  allergens_en text not null,
  allergens_zh text not null,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  label_en text not null,
  label_zh text not null,
  price_cents integer not null check (price_cents >= 0),
  capacity_units integer not null default 1 check (capacity_units > 0),
  active boolean not null default true,
  unique(product_id, label_en)
);

create table public.cake_availability_dates (
  id uuid primary key default gen_random_uuid(),
  service_date date not null unique,
  status public.content_status not null default 'draft',
  capacity_units integer not null check (capacity_units >= 0),
  ordering_cutoff_at timestamptz not null,
  customer_note_en text,
  customer_note_zh text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pickup_slots (
  id uuid primary key default gen_random_uuid(),
  availability_date_id uuid not null references public.cake_availability_dates(id) on delete cascade,
  location_name text not null,
  address text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity_units integer check (capacity_units is null or capacity_units >= 0),
  active boolean not null default true,
  check (ends_at > starts_at)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table public.cake_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('DD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id uuid not null references public.customers(id),
  availability_date_id uuid not null references public.cake_availability_dates(id),
  pickup_slot_id uuid not null references public.pickup_slots(id),
  status public.order_status not null default 'held',
  payment_status public.payment_status not null default 'pending',
  currency text not null default 'AUD' check (currency = 'AUD'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_capacity_units integer not null check (total_capacity_units > 0),
  customer_notes text,
  hold_expires_at timestamptz,
  confirmed_at timestamptz,
  collected_at timestamptz,
  cancelled_at timestamptz,
  lookup_token_hash text not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cake_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.cake_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_name_en_snapshot text not null,
  product_name_zh_snapshot text not null,
  variant_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  capacity_units_each integer not null check (capacity_units_each > 0),
  line_total_cents integer generated always as (quantity * unit_price_cents) stored
);

create table public.class_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text not null,
  description_en text not null,
  description_zh text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  active boolean not null default true
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_type_id uuid not null references public.class_types(id),
  status public.content_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Australia/Brisbane',
  venue_name text not null,
  venue_address text not null,
  capacity_seats integer not null check (capacity_seats > 0),
  price_cents integer not null check (price_cents >= 0),
  minimum_age integer not null default 10 check (minimum_age >= 0),
  booking_cutoff_at timestamptz not null,
  accessibility_en text,
  accessibility_zh text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique default ('MC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  class_session_id uuid not null references public.class_sessions(id),
  customer_id uuid not null references public.customers(id),
  status public.booking_status not null default 'confirmed',
  seat_count integer not null check (seat_count > 0),
  payment_received boolean not null default false,
  payment_method text check (payment_method is null or payment_method in ('cash', 'card', 'bank_transfer')),
  guardian_name text,
  guardian_acknowledged boolean not null default false,
  lookup_token_hash text not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table public.class_attendees (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.class_bookings(id) on delete cascade,
  name text not null,
  is_minor boolean not null default false,
  attended boolean
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  cake_order_id uuid not null references public.cake_orders(id),
  provider text not null,
  provider_reference text unique,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'AUD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'email' check (channel = 'email'),
  template_code text not null,
  recipient text not null,
  entity_type text not null,
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  attempt_count integer not null default 0,
  last_error text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index cake_orders_availability_status_idx on public.cake_orders(availability_date_id, status);
create index cake_orders_pickup_status_idx on public.cake_orders(pickup_slot_id, status);
create index cake_orders_expiring_holds_idx on public.cake_orders(hold_expires_at) where status in ('held', 'awaiting_payment');
create index class_sessions_public_idx on public.class_sessions(starts_at) where status = 'published';
create index class_bookings_session_status_idx on public.class_bookings(class_session_id, status);
create index notification_outbox_pending_idx on public.notification_outbox(scheduled_at) where status = 'pending';

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles
    where user_id = (select auth.uid()) and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

alter table public.staff_roles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cake_availability_dates enable row level security;
alter table public.pickup_slots enable row level security;
alter table public.customers enable row level security;
alter table public.cake_orders enable row level security;
alter table public.cake_order_items enable row level security;
alter table public.class_types enable row level security;
alter table public.class_sessions enable row level security;
alter table public.class_bookings enable row level security;
alter table public.class_attendees enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.audit_log enable row level security;

create policy "public reads active products" on public.products for select to anon, authenticated using (active);
create policy "public reads active variants" on public.product_variants for select to anon, authenticated using (active);
create policy "public reads published cake dates" on public.cake_availability_dates for select to anon, authenticated using (status = 'published' and ordering_cutoff_at > now());
create policy "public reads active pickup slots" on public.pickup_slots for select to anon, authenticated using (active and exists (select 1 from public.cake_availability_dates d where d.id = availability_date_id and d.status = 'published'));
create policy "public reads class types" on public.class_types for select to anon, authenticated using (active);
create policy "public reads published sessions" on public.class_sessions for select to anon, authenticated using (status = 'published' and booking_cutoff_at > now());

create policy "owner full products" on public.products for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full variants" on public.product_variants for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full cake dates" on public.cake_availability_dates for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full pickup slots" on public.pickup_slots for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full class types" on public.class_types for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full class sessions" on public.class_sessions for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner reads customers" on public.customers for select to authenticated using ((select public.is_owner()));
create policy "owner full cake orders" on public.cake_orders for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full order items" on public.cake_order_items for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full bookings" on public.class_bookings for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner full attendees" on public.class_attendees for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner reads payments" on public.payments for select to authenticated using ((select public.is_owner()));
create policy "owner full notifications" on public.notification_outbox for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner reads audit" on public.audit_log for select to authenticated using ((select public.is_owner()));

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
  v_total_units integer := 0;
  v_total_cents integer := 0;
  v_committed_units integer;
  v_slot_committed integer;
  v_item jsonb;
  v_variant public.product_variants;
  v_product public.products;
  v_lookup_token text := encode(gen_random_bytes(32), 'hex');
begin
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
    and status in ('held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
    and (hold_expires_at is null or hold_expires_at > now());
  if v_committed_units + v_total_units > v_date.capacity_units then raise exception 'Cake date is sold out'; end if;

  if v_slot.capacity_units is not null then
    select coalesce(sum(total_capacity_units), 0) into v_slot_committed
    from public.cake_orders
    where pickup_slot_id = v_slot.id
      and status in ('held', 'awaiting_payment', 'confirmed', 'in_production', 'ready')
      and (hold_expires_at is null or hold_expires_at > now());
    if v_slot_committed + v_total_units > v_slot.capacity_units then raise exception 'Pickup slot is full'; end if;
  end if;

  insert into public.customers(name, email, phone)
  values (payload#>>'{customer,name}', lower(payload#>>'{customer,email}'), payload#>>'{customer,phone}')
  returning id into v_customer_id;

  insert into public.cake_orders(customer_id, availability_date_id, pickup_slot_id, status, payment_status, subtotal_cents, total_capacity_units, customer_notes, hold_expires_at, lookup_token_hash, idempotency_key)
  values (v_customer_id, v_date.id, v_slot.id, 'awaiting_payment', 'pending', v_total_cents, v_total_units, payload#>>'{customer,notes}', now() + interval '15 minutes', encode(digest(v_lookup_token, 'sha256'), 'hex'), payload->>'idempotencyKey')
  returning id into v_order_id;

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

  return jsonb_build_object('orderId', v_order_id, 'lookupToken', v_lookup_token, 'holdExpiresAt', now() + interval '15 minutes');
end;
$$;

create or replace function public.reserve_class_booking(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.class_sessions;
  v_customer_id uuid;
  v_booking_id uuid;
  v_seat_count integer := jsonb_array_length(payload->'attendees');
  v_committed integer;
  v_attendee jsonb;
  v_has_minor boolean := false;
  v_lookup_token text := encode(gen_random_bytes(32), 'hex');
begin
  select * into v_session from public.class_sessions
  where id = (payload->>'sessionId')::uuid
  for update;
  if v_session.id is null or v_session.status <> 'published' or v_session.booking_cutoff_at <= now() then raise exception 'Class session is unavailable'; end if;

  select coalesce(sum(seat_count), 0) into v_committed from public.class_bookings
  where class_session_id = v_session.id and status = 'confirmed';
  if v_committed + v_seat_count > v_session.capacity_seats then raise exception 'Not enough seats remain'; end if;

  select exists(select 1 from jsonb_array_elements(payload->'attendees') x where (x->>'isMinor')::boolean) into v_has_minor;
  if v_has_minor and (coalesce((payload->>'guardianAcknowledged')::boolean, false) = false or nullif(payload->>'guardianName', '') is null) then
    raise exception 'Guardian acknowledgement is required';
  end if;

  insert into public.customers(name, email, phone)
  values (payload#>>'{customer,name}', lower(payload#>>'{customer,email}'), payload#>>'{customer,phone}')
  returning id into v_customer_id;

  insert into public.class_bookings(class_session_id, customer_id, seat_count, guardian_name, guardian_acknowledged, lookup_token_hash, idempotency_key)
  values (v_session.id, v_customer_id, v_seat_count, payload->>'guardianName', coalesce((payload->>'guardianAcknowledged')::boolean, false), encode(digest(v_lookup_token, 'sha256'), 'hex'), payload->>'idempotencyKey')
  returning id into v_booking_id;

  for v_attendee in select * from jsonb_array_elements(payload->'attendees')
  loop
    insert into public.class_attendees(booking_id, name, is_minor)
    values (v_booking_id, v_attendee->>'name', (v_attendee->>'isMinor')::boolean);
  end loop;

  insert into public.notification_outbox(template_code, recipient, entity_type, entity_id, payload, idempotency_key)
  values ('class_booking_confirmed', payload#>>'{customer,email}', 'class_booking', v_booking_id, jsonb_build_object('bookingId', v_booking_id), 'class-confirmed-' || v_booking_id);

  return jsonb_build_object('bookingId', v_booking_id, 'lookupToken', v_lookup_token);
end;
$$;

revoke all on function public.reserve_cake_order(jsonb) from public;
revoke all on function public.reserve_class_booking(jsonb) from public;
grant execute on function public.reserve_cake_order(jsonb) to anon, authenticated;
grant execute on function public.reserve_class_booking(jsonb) to anon, authenticated;

create or replace function public.expire_cake_holds()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  update public.cake_orders
  set status = 'expired', payment_status = case when payment_status = 'pending' then 'failed' else payment_status end, updated_at = now()
  where status in ('held', 'awaiting_payment') and hold_expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace view public.owner_daily_production_summary
with (security_invoker = true)
as
with order_totals as (
  select
    availability_date_id,
    count(*) as confirmed_orders,
    sum(total_capacity_units) as committed_units
  from public.cake_orders
  where status in ('confirmed', 'in_production', 'ready')
  group by availability_date_id
),
item_totals as (
  select
    o.availability_date_id,
    sum(i.quantity) as cake_count
  from public.cake_orders o
  join public.cake_order_items i on i.order_id = o.id
  where o.status in ('confirmed', 'in_production', 'ready')
  group by o.availability_date_id
)
select
  d.service_date,
  d.capacity_units,
  coalesce(ot.confirmed_orders, 0) as confirmed_orders,
  coalesce(it.cake_count, 0) as cake_count,
  coalesce(ot.committed_units, 0) as committed_units,
  d.capacity_units - coalesce(ot.committed_units, 0) as available_units
from public.cake_availability_dates d
left join order_totals ot on ot.availability_date_id = d.id
left join item_totals it on it.availability_date_id = d.id;

grant select on public.owner_daily_production_summary to authenticated;
