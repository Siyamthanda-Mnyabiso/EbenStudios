import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyOrders } from "../service/orderService";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { describeOptions } from "../lib/productOptions";

export default function Orders() {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            return;
        }

        getMyOrders()
            .then(setOrders)
            .catch((err) => setError(err.message || "Failed to load orders."))
            .finally(() => setLoading(false));
    }, [user]);

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <section className="page page-section">
            <PageHeader eyebrow="Your orders" title="Orders" />

            {location.state?.justOrderedId && (
                <p role="status" className="border-l-4 border-ember bg-paper-deep px-6 py-4 mb-10 font-bold">
                    Order #EB-{location.state.justOrderedId} placed. Thank you!
                </p>
            )}

            {loading && <p role="status" className="text-ink-soft">Loading orders</p>}

            {error && <p role="alert" className="field-error">{error}</p>}

            {!loading && !error && orders.length === 0 && (
                <div>
                    <h2 className="title mb-2">No orders yet</h2>
                    <p className="text-ink-soft mb-8">When you place an order it will appear here.</p>
                    <Button to="/shop">Browse the shop</Button>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <ul className="border-t border-ink">
                    {orders.map((order) => (
                        <li key={order.id} className="grid lg:grid-cols-12 gap-6 py-8 border-b border-line">
                            <div className="lg:col-span-3">
                                <p className="title">#EB-{order.id}</p>
                                <p className="text-ink-soft">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="mt-3 inline-block border border-ink px-3 py-1 font-bold text-sm">
                                    {order.status}
                                </p>
                            </div>

                            <ul className="lg:col-span-6 flex flex-col gap-2">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex justify-between gap-4">
                                        <span>
                                            {item.product?.name} x {item.quantity}
                                            {describeOptions(item) && <span className="block text-sm text-ink-soft">{describeOptions(item)}</span>}
                                        </span>
                                        <span className="text-ink-soft">R {Number(item.price * item.quantity).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>

                            <p className="lg:col-span-3 lg:text-right">
                                <span className="eyebrow block mb-1">Total</span>
                                <span className="text-3xl font-bold">R {Number(order.total).toLocaleString()}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
