-- Cancelling an order puts its items back in stock. Moving a cancelled order back
-- to another status takes them out again, and fails if there is not enough stock.
-- Orders cancelled before this migration are not changed.

create function public.sync_stock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    line record;
begin
    if new.status = 'Cancelled' and old.status <> 'Cancelled' then
        update public.products p
        set stock = p.stock + i.quantity
        from (
            select product_id, sum(quantity) as quantity
            from public.order_items
            where order_id = new.id
            group by product_id
        ) i
        where p.id = i.product_id;

    elsif old.status = 'Cancelled' and new.status <> 'Cancelled' then
        -- Lock the products first so a checkout cannot take the same stock meanwhile.
        perform 1
        from public.products
        where id in (select product_id from public.order_items where order_id = new.id)
        order by id
        for update;

        for line in
            select p.id, p.name, p.stock, sum(oi.quantity) as quantity
            from public.order_items oi
            join public.products p on p.id = oi.product_id
            where oi.order_id = new.id
            group by p.id
            order by p.id
        loop
            if line.stock < line.quantity then
                raise exception 'Cannot reopen order #EB-%: only % of "%" left in stock', new.id, line.stock, line.name;
            end if;

            update public.products set stock = stock - line.quantity where id = line.id;
        end loop;
    end if;

    return new;
end;
$$;

create trigger orders_sync_stock_on_cancel
    after update of status on public.orders
    for each row
    when (old.status is distinct from new.status)
    execute function public.sync_stock_on_cancel();
