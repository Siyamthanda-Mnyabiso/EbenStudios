-- Accounts created before the on_auth_user_created trigger existed have no
-- profile row, which leaves them unable to log in. Safe to run more than once.

insert into public.profiles (id, name, email)
select id, coalesce(raw_user_meta_data ->> 'name', ''), coalesce(email, '')
from auth.users
on conflict (id) do nothing;
