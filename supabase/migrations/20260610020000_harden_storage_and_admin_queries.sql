drop policy if exists "public reads cake flavour images" on storage.objects;

revoke execute on function public.expire_cake_holds() from anon, authenticated;
revoke execute on function public.is_owner() from anon;

create index if not exists cake_order_items_order_id_idx
  on public.cake_order_items(order_id);
create index if not exists cake_order_items_product_id_idx
  on public.cake_order_items(product_id);
create index if not exists cake_order_items_variant_id_idx
  on public.cake_order_items(variant_id);
create index if not exists cake_orders_customer_id_idx
  on public.cake_orders(customer_id);
create index if not exists pickup_slots_availability_date_id_idx
  on public.pickup_slots(availability_date_id);
create index if not exists audit_log_actor_user_id_idx
  on public.audit_log(actor_user_id);
