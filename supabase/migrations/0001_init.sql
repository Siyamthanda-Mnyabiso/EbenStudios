-- Eben Studios — initial schema, row level security, order RPC and storage.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
    id         uuid primary key references auth.users (id) on delete cascade,
    name       text not null default '',
    email      text not null default '',
    role       text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
    created_at timestamptz not null default now()
);

create table public.products (
    id          bigint generated always as identity primary key,
    name        text not null unique,
    description text,
    price       numeric(10, 2) not null check (price >= 0),
    stock       integer not null default 0 check (stock >= 0),
    tag         text,
    image_url   text,
    created_at  timestamptz not null default now()
);

create table public.orders (
    id               bigint generated always as identity primary key,
    user_id          uuid not null references public.profiles (id),
    total            numeric(10, 2) not null,
    status           text not null default 'Pending'
                     check (status in ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')),
    shipping_address text,
    created_at       timestamptz not null default now()
);

create table public.order_items (
    id         bigint generated always as identity primary key,
    order_id   bigint not null references public.orders (id) on delete cascade,
    product_id bigint not null references public.products (id),
    quantity   integer not null check (quantity > 0),
    price      numeric(10, 2) not null
);

create index orders_user_id_idx on public.orders (user_id);
create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Profile row is created automatically when someone signs up
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, name, email)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.email, ''));
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
    );
$$;

-- Place an order atomically. Prices and totals come from the database, never
-- from the client. Rows are locked so concurrent checkouts cannot oversell.
create function public.create_order(items jsonb, shipping_address text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
    uid         uuid := auth.uid();
    new_order   bigint;
    running     numeric(10, 2) := 0;
    line        jsonb;
    prod        public.products%rowtype;
    qty         integer;
begin
    if uid is null then
        raise exception 'Not authenticated' using errcode = '28000';
    end if;

    if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
        raise exception 'Cart is empty';
    end if;

    insert into public.orders (user_id, total, shipping_address)
    values (uid, 0, shipping_address)
    returning id into new_order;

    for line in select * from jsonb_array_elements(items) loop
        qty := (line ->> 'quantity')::integer;

        if qty is null or qty < 1 then
            raise exception 'Invalid quantity';
        end if;

        select * into prod
        from public.products
        where id = (line ->> 'productId')::bigint
        for update;

        if not found then
            raise exception 'A product in your cart no longer exists';
        end if;

        if prod.stock < qty then
            raise exception 'Not enough stock for "%"', prod.name;
        end if;

        update public.products set stock = stock - qty where id = prod.id;

        insert into public.order_items (order_id, product_id, quantity, price)
        values (new_order, prod.id, qty, prod.price);

        running := running + prod.price * qty;
    end loop;

    update public.orders set total = running where id = new_order;

    return new_order;
end;
$$;

revoke all on function public.create_order(jsonb, text) from public, anon;
grant execute on function public.create_order(jsonb, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- profiles: read your own, admins read all. No update policy, so nobody can
-- promote themselves to ADMIN from the browser.
create policy "profiles: read own"   on public.profiles for select using (id = auth.uid());
create policy "profiles: admin read" on public.profiles for select using (public.is_admin());

-- products: public catalogue, admin-only writes
create policy "products: public read" on public.products for select using (true);
create policy "products: admin insert" on public.products for insert with check (public.is_admin());
create policy "products: admin update" on public.products for update using (public.is_admin()) with check (public.is_admin());
create policy "products: admin delete" on public.products for delete using (public.is_admin());

-- orders: customers read their own, admins read and update all.
-- There is no insert policy: orders are only created through create_order().
create policy "orders: read own"     on public.orders for select using (user_id = auth.uid());
create policy "orders: admin read"   on public.orders for select using (public.is_admin());
create policy "orders: admin update" on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items: read own" on public.order_items for select
    using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items: admin read" on public.order_items for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public bucket for product images, admin-only writes
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects for select
    using (bucket_id = 'product-images');
create policy "product-images: admin insert" on storage.objects for insert
    with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin update" on storage.objects for update
    using (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin delete" on storage.objects for delete
    using (bucket_id = 'product-images' and public.is_admin());
