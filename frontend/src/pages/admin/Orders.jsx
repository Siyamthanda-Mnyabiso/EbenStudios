import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../service/orderService";

const ORDER_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        getOrders()
            .then(setOrders)
            .catch((err) => setError(err.message || "Failed to load orders."))
            .finally(() => setLoading(false));
    }, []);

    async function handleStatusChange(orderId, status) {
        setUpdatingId(orderId);
        setError("");

        try {
            const updated = await updateOrderStatus(orderId, status);
            setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
        } catch (err) {
            setError(err.message || "Failed to update order status.");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div>
            <h1 className="headline mb-8">
                Orders
            </h1>

            {error && (
                <p className="field-error mb-4">{error}</p>
            )}

            <div className="bg-white border border-line overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-line text-sm text-mute">
                            <th className="px-6 py-4 font-medium">Order</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Total</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-mute">
                                    Loading orders
                                </td>
                            </tr>
                        )}

                        {!loading && orders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-mute">
                                    No orders yet.
                                </td>
                            </tr>
                        )}

                        {!loading && orders.map((order) => (
                            <tr key={order.id} className="border-b border-line last:border-0">
                                <td className="px-6 py-4 font-semibold">#EB-{order.id}</td>
                                <td className="px-6 py-4 text-ink-soft">{order.user?.name}</td>
                                <td className="px-6 py-4 text-ink-soft">
                                    R {Number(order.total).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.status}
                                        disabled={updatingId === order.id}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="field !w-auto !min-h-12 font-bold"
                                    >
                                        {ORDER_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
