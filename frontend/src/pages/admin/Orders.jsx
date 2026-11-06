import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getOrders, updateOrderStatus } from "../../service/orderService";
import { getProductImage } from "../../lib/productImage";
import { describeOptions } from "../../lib/productOptions";

const ORDER_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];
const ROW_GRID = "md:grid-cols-[6rem_7rem_minmax(0,1fr)_7rem_10rem_8rem]";

function formatDate(value) {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function OrderDetails({ order }) {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="grid lg:grid-cols-12 gap-8 px-6 py-6 bg-paper-deep">
            <div className="lg:col-span-7">
                <h3 className="eyebrow mb-4">
                    Items ({itemCount})
                </h3>

                <ul className="flex flex-col gap-4">
                    {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-4">
                            <img
                                src={getProductImage(item.product ?? {})}
                                alt=""
                                className="w-14 h-18 object-cover bg-white border border-line shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold">{item.product?.name ?? "Removed product"}</p>
                                <p className="text-ink-soft text-sm">
                                    {[describeOptions(item), `Qty ${item.quantity}`, `R ${Number(item.price).toLocaleString()} each`]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            </div>
                            <p className="font-bold whitespace-nowrap">
                                R {Number(item.price * item.quantity).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="flex items-baseline justify-between border-t border-ink mt-6 pt-4">
                    <span>Total</span>
                    <span className="text-2xl font-bold">R {Number(order.total).toLocaleString()}</span>
                </div>
            </div>

            <dl className="lg:col-span-5 flex flex-col gap-5">
                <div>
                    <dt className="eyebrow mb-1">Deliver to</dt>
                    <dd className="font-medium">{order.user?.name || "No name given"}</dd>
                    <dd className="whitespace-pre-line">
                        {order.shippingAddress
                            ? order.shippingAddress.split(",").map((part) => part.trim()).filter(Boolean).join("\n")
                            : "No address given"}
                    </dd>
                </div>

                <div>
                    <dt className="eyebrow mb-1">Customer email</dt>
                    <dd>
                        {order.user?.email ? (
                            <a href={`mailto:${order.user.email}`} className="underline underline-offset-4 break-all">
                                {order.user.email}
                            </a>
                        ) : (
                            "Unknown"
                        )}
                    </dd>
                </div>

                <div>
                    <dt className="eyebrow mb-1">Placed</dt>
                    <dd>{formatDate(order.createdAt)}</dd>
                </div>
            </dl>
        </div>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        getOrders()
            .then(setOrders)
            .catch((err) => setError(err.message || "Failed to load orders."))
            .finally(() => setLoading(false));
    }, []);

    async function handleStatusChange(orderId, status) {
        const previous = orders.find((order) => order.id === orderId)?.status;
        setUpdatingId(orderId);
        setError("");
        setNotice("");

        try {
            const updated = await updateOrderStatus(orderId, status);
            setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));

            // The database moves stock when an order is cancelled or reopened.
            const units = updated.items.reduce((sum, item) => sum + item.quantity, 0);
            const itemsText = `${units} item${units === 1 ? "" : "s"}`;

            if (status === "Cancelled") {
                setNotice(`Order #EB-${orderId} cancelled. ${itemsText} returned to stock.`);
            } else if (previous === "Cancelled") {
                setNotice(`Order #EB-${orderId} reopened. ${itemsText} taken from stock again.`);
            }
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
                <p role="alert" className="field-error mb-4">{error}</p>
            )}

            {notice && (
                <p role="status" className="border-l-4 border-ember bg-paper-deep px-6 py-4 mb-4 font-medium">{notice}</p>
            )}

            <div className="bg-white border border-line">
                {/* Column headings line up with the rows from md up; on phones each order is a card. */}
                <div className={`hidden md:grid ${ROW_GRID} gap-x-4 px-6 py-4 border-b border-line text-sm text-mute font-medium`} aria-hidden="true">
                    <span>Order</span>
                    <span>Date</span>
                    <span>Customer</span>
                    <span>Total</span>
                    <span>Status</span>
                    <span />
                </div>

                {loading && <p role="status" className="px-6 py-8 text-center text-mute">Loading orders</p>}

                {!loading && orders.length === 0 && <p className="px-6 py-8 text-center text-mute">No orders yet.</p>}

                {!loading && orders.length > 0 && (
                    <ul>
                        {orders.map((order) => {
                            const isOpen = openId === order.id;
                            const detailsId = `order-${order.id}-details`;

                            return (
                                <li key={order.id} className="border-b border-line last:border-0">
                                    <div className={`grid grid-cols-2 ${ROW_GRID} items-center gap-x-4 gap-y-2 px-6 py-4`}>
                                        <p className="font-semibold">#EB-{order.id}</p>
                                        <p className="text-ink-soft text-right md:text-left">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-ink-soft min-w-0 truncate">{order.user?.name || order.user?.email}</p>
                                        <p className="text-ink-soft font-bold md:font-normal text-right md:text-left whitespace-nowrap">
                                            R {Number(order.total).toLocaleString()}
                                        </p>
                                        <select
                                            value={order.status}
                                            disabled={updatingId === order.id}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            aria-label={`Status of order #EB-${order.id}`}
                                            className="field !w-auto !min-h-12 font-bold justify-self-start"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setOpenId(isOpen ? null : order.id)}
                                            aria-expanded={isOpen}
                                            aria-controls={detailsId}
                                            aria-label={`${isOpen ? "Hide" : "Show"} details for order #EB-${order.id}`}
                                            className="inline-flex items-center gap-2 min-h-12 px-4 font-bold justify-self-end hover:text-ember transition-colors"
                                        >
                                            Details
                                            <ChevronDown
                                                size={18}
                                                aria-hidden="true"
                                                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div id={detailsId}>
                                            <OrderDetails order={order} />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
