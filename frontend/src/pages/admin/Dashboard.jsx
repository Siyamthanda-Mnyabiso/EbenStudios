import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingBag, Users, Package, Plus } from "lucide-react";
import { getProducts } from "../../service/productService";
import { getOrders } from "../../service/orderService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Dashboard() {
    useDocumentTitle("Admin dashboard");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([getProducts(), getOrders()])
            .then(([productsData, ordersData]) => {
                setProducts(productsData);
                setOrders(ordersData);
            })
            .catch((err) => setError(err.message || "Failed to load dashboard data."))
            .finally(() => setLoading(false));
    }, []);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const customerCount = new Set(orders.map((order) => order.userId)).size;

    const stats = [
        { label: "Revenue", value: `R ${revenue.toLocaleString()}`, icon: DollarSign },
        { label: "Orders", value: orders.length, icon: ShoppingBag },
        { label: "Customers", value: customerCount, icon: Users },
        { label: "Products", value: products.length, icon: Package },
    ];

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="headline">
                    Dashboard
                </h1>

                <Link
                    to="/admin/products?new=1"
                    className="inline-flex items-center gap-2 min-h-12 bg-ember text-white px-5 font-bold hover:bg-ember-deep transition-colors"
                >
                    <Plus size={18} aria-hidden="true" />
                    Add product
                </Link>
            </div>

            {error && (
                <p className="field-error mb-4">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="bg-white p-6 border border-line shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-mute">{label}</span>
                            <Icon size={18} className="text-mute" />
                        </div>

                        <p className="text-2xl font-bold">{loading ? "..." : value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-line overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-mute">Loading recent orders</p>
                ) : orders.length === 0 ? (
                    <p className="p-8 text-mute">
                        No recent activity yet. Orders will show up here once customers
                        start checking out.
                    </p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-line text-sm text-mute">
                                <th className="px-6 py-4 font-medium">Order</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.slice(0, 5).map((order) => (
                                <tr key={order.id} className="border-b border-line last:border-0">
                                    <td className="px-6 py-4 font-semibold">#EB-{order.id}</td>
                                    <td className="px-6 py-4 text-ink-soft">{order.user?.name}</td>
                                    <td className="px-6 py-4 text-ink-soft">
                                        R {Number(order.total).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
