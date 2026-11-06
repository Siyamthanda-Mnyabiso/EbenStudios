-- Simulated payments (test mode). The browser checks a test card number and,
-- on success, calls pay_order. No card details ever reach the database.
-- Replace this with a payment provider's webhook before taking real money.

create function public.pay_order(order_id bigint)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    uid            uuid := auth.uid();
    current_status text;
begin
    if uid is null then
        raise exception 'Not authenticated' using errcode = '28000';
    end if;

    select status into current_status
    from public.orders
    where id = order_id and user_id = uid
    for update;

    if not found then
        raise exception 'Order not found';
    end if;

    if current_status <> 'Pending' then
        raise exception 'This order is already %', lower(current_status);
    end if;

    update public.orders set status = 'Paid' where id = order_id;

    return 'Paid';
end;
$$;

revoke all on function public.pay_order(bigint) from public, anon;
grant execute on function public.pay_order(bigint) to authenticated;
