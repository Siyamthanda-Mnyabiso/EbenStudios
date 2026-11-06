-- Products that have been ordered cannot be deleted (order_items points at them),
-- so they are archived instead: hidden from the shop, still shown in past orders.

alter table public.products
    add column archived boolean not null default false;

-- Deletes the product when nobody has ordered it, otherwise archives it.
-- Returns 'deleted' or 'archived' so the admin can be told which happened.
create function public.delete_product(product_id bigint)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Only admins can delete products' using errcode = '42501';
    end if;

    if not exists (select 1 from public.products where id = product_id) then
        raise exception 'Product not found';
    end if;

    if exists (select 1 from public.order_items where order_items.product_id = delete_product.product_id) then
        update public.products set archived = true where id = product_id;
        return 'archived';
    end if;

    delete from public.products where id = product_id;
    return 'deleted';
end;
$$;

revoke all on function public.delete_product(bigint) from public, anon;
grant execute on function public.delete_product(bigint) to authenticated;

-- Archived products cannot be bought, even from a cart saved before archiving.
create or replace function public.create_order(items jsonb, shipping_address text)
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
    chosen_size  text;
    chosen_color text;
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

        if not found or prod.archived then
            raise exception 'A product in your cart is no longer available';
        end if;

        -- A size or colour is required exactly when the product offers them.
        chosen_size  := nullif(line ->> 'size', '');
        chosen_color := nullif(line ->> 'color', '');

        if cardinality(prod.sizes) > 0 then
            if chosen_size is null or not (chosen_size = any (prod.sizes)) then
                raise exception 'Choose a size for "%"', prod.name;
            end if;
        else
            chosen_size := null;
        end if;

        if cardinality(prod.colors) > 0 then
            if chosen_color is null or not (chosen_color = any (prod.colors)) then
                raise exception 'Choose a colour for "%"', prod.name;
            end if;
        else
            chosen_color := null;
        end if;

        if prod.stock < qty then
            raise exception 'Not enough stock for "%"', prod.name;
        end if;

        update public.products set stock = stock - qty where id = prod.id;

        insert into public.order_items (order_id, product_id, quantity, price, size, color)
        values (new_order, prod.id, qty, prod.price, chosen_size, chosen_color);

        running := running + prod.price * qty;
    end loop;

    update public.orders set total = running where id = new_order;

    return new_order;
end;
$$;
