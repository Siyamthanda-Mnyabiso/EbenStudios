-- Some Supabase projects do not auto-grant table access to the API roles.
-- Grants only open the door to the table; row level security (0001) still
-- decides which rows each role can see or change.

grant usage on schema public to anon, authenticated, service_role;

-- Public catalogue
grant select on public.products to anon, authenticated;

-- Signed in users
grant select on public.profiles    to authenticated;
grant select on public.orders      to authenticated;
grant select on public.order_items to authenticated;

-- Admin writes (RLS limits these to ADMIN users)
grant insert, update, delete on public.products to authenticated;
grant update on public.orders to authenticated;

-- Identity columns need sequence access for admin inserts
grant usage, select on all sequences in schema public to authenticated;

-- Seed script and server-side tools
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

grant execute on function public.create_order(jsonb, text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
