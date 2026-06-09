do $$
declare
  v_pgcrypto_schema text;
begin
  select n.nspname
  into v_pgcrypto_schema
  from pg_catalog.pg_extension e
  join pg_catalog.pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';

  if v_pgcrypto_schema is null then
    raise exception 'The pgcrypto extension is required';
  end if;

  execute format(
    'alter function public.reserve_cake_order(jsonb) set search_path = pg_catalog, %I',
    v_pgcrypto_schema
  );
  execute format(
    'alter function public.reserve_class_booking(jsonb) set search_path = pg_catalog, %I',
    v_pgcrypto_schema
  );
end;
$$;
