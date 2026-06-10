update public.pickup_slots
set
  starts_at = (starts_at at time zone 'UTC') at time zone 'Australia/Brisbane',
  ends_at = (ends_at at time zone 'UTC') at time zone 'Australia/Brisbane'
where availability_date_id in (
  select id
  from public.cake_availability_dates
  where service_date in ('2026-06-20', '2026-06-27')
);

alter function public.get_cake_ordering_data() security definer;
alter function public.get_cake_ordering_data()
  set search_path = pg_catalog, public;

revoke all on function public.get_cake_ordering_data() from public;
grant execute on function public.get_cake_ordering_data() to anon, authenticated;
