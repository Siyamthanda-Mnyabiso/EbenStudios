import { supabase, unwrap } from "./supabase";
import { toProductShape } from "./productShape";

const ORDER_SELECT = `
    id, user_id, total, status, shipping_address, created_at,
    user:profiles ( id, name, email ),
    items:order_items ( id, quantity, price, size, color, product_id, product:products ( * ) )
`;

function toOrder(row) {
    return {
        id: row.id,
        userId: row.user_id,
        total: Number(row.total),
        status: row.status,
        shippingAddress: row.shipping_address,
        createdAt: row.created_at,
        user: row.user,
        items: row.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            productId: item.product_id,
            size: item.size,
            color: item.color,
            product: toProductShape(item.product),
        })),
    };
}

export async function getOrders() {
    const rows = unwrap(
        await supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false })
    );

    return rows.map(toOrder);
}

// RLS limits a customer's query to their own orders; the explicit filter keeps an
// admin's "my orders" page showing only their own purchases too.
export async function getMyOrders() {
    const { data: auth } = await supabase.auth.getUser();

    const rows = unwrap(
        await supabase
            .from("orders")
            .select(ORDER_SELECT)
            .eq("user_id", auth.user.id)
            .order("created_at", { ascending: false })
    );

    return rows.map(toOrder);
}

export async function createOrder({ items, shippingAddress }) {
    const id = unwrap(await supabase.rpc("create_order", { items, shipping_address: shippingAddress }));
    return { id };
}

export async function updateOrderStatus(id, status) {
    unwrap(await supabase.from("orders").update({ status }).eq("id", id));

    const row = unwrap(await supabase.from("orders").select(ORDER_SELECT).eq("id", id).single());
    return toOrder(row);
}

// One of the signed-in customer's orders (RLS hides everyone else's), or null.
export async function getMyOrder(id) {
    const row = unwrap(await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle());
    return row ? toOrder(row) : null;
}

// Test mode: marks a Pending order as Paid once the browser has accepted a test card.
export async function payOrder(id) {
    return unwrap(await supabase.rpc("pay_order", { order_id: id }));
}
