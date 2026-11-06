import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useCartCheck } from "../hooks/useCartCheck";
import { createOrder } from "../service/orderService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { describeOptions } from "../lib/productOptions";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Checkout() {
    useDocumentTitle("Checkout");
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { items, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { checking, problems, hasProblems, error: checkError } = useCartCheck();

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (items.length === 0) {
        return (
            <section className="page page-section">
                <PageHeader eyebrow="Checkout" title="Checkout" />
                <h2 className="title mb-6">Your cart is empty</h2>
                <Button to="/shop">Continue shopping</Button>
            </section>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const order = await createOrder({
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                })),
                shippingAddress: `${address}, ${city}, ${postalCode}`,
            });

            navigate(`/pay/${order.id}`);
            clearCart();
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="page page-section">
            <PageHeader eyebrow="Almost there" title="Checkout" />

            <div className="grid lg:grid-cols-12 gap-12">
                <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
                    <h2 className="title">Delivery address</h2>

                    {error && <p role="alert" className="field-error">{error}</p>}
                    {checkError && <p role="alert" className="field-error">{checkError}</p>}
                    {hasProblems && (
                        <p role="alert" className="field-error">
                            Some items in your order need attention. <Link to="/cart" className="underline underline-offset-4">Go back to your cart</Link> to fix them.
                        </p>
                    )}

                    <Input label="Street address" type="text" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} />

                    <div className="grid sm:grid-cols-2 gap-6">
                        <Input label="City" type="text" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
                        <Input label="Postal code" type="text" autoComplete="postal-code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>

                    <div>
                        <Button type="submit" disabled={submitting || checking || hasProblems}>
                            {submitting ? "Placing order" : `Continue to payment, R ${Number(subtotal).toLocaleString()}`}
                        </Button>
                    </div>
                </form>

                <aside className="lg:col-span-5 h-fit bg-paper-deep p-8" aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="title mb-6">Order summary</h2>

                    <ul className="flex flex-col gap-3 mb-6">
                        {items.map((item) => (
                            <li key={item.key} className="flex items-baseline justify-between gap-4">
                                <span className="text-ink-soft">
                                    {item.name} x {item.quantity}
                                    {describeOptions(item) && <span className="block text-sm">{describeOptions(item)}</span>}
                                    {problems[item.key] && <span className="block text-sm field-error">{problems[item.key].message}</span>}
                                </span>
                                <span className="font-bold">R {Number(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-baseline justify-between border-t border-ink pt-4">
                        <span>Subtotal</span>
                        <span className="text-3xl font-bold">R {Number(subtotal).toLocaleString()}</span>
                    </div>
                </aside>
            </div>
        </section>
    );
}
