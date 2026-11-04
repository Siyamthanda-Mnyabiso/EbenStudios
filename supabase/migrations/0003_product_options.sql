-- Sizes and colours.
-- Products list the options a customer can choose; order lines record the choice.
-- Stock is still one number per product (shared across sizes and colours).

alter table public.products
    add column sizes  text[] not null default '{}',
    add column colors text[] not null default '{}';

alter table public.order_items
    add column size  text,
    add column color text;

-- Same signature as before, so existing grants still apply.
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

        if not found then
            raise exception 'A product in your cart no longer exists';
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
