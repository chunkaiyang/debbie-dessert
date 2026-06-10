create policy "owner inserts audit"
on public.audit_log for insert
to authenticated
with check ((select public.is_owner()));
