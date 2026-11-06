import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyOrder, payOrder } from "../service/orderService";
import { TEST_CARDS, checkCard, formatCardNumber, formatExpiry, digitsOnly } from "../lib/testCards";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { describeOptions } from "../lib/productOptions";

// Simulated card payment. The card details stay in this component: only the
// order id is sent to the database once a test card is accepted.
export default function Pay() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [error, setError] = useState("");
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        let ignore = false;

        getMyOrder(id)
            .then((found) => {
                if (!ignore) setOrder(found);
            })
            .catch((err) => {
                if (!ignore) setLoadError(err.message || "Could not load this order.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [id, user]);

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const problem = checkCard({ name, number, expiry, cvc });
        if (problem) {
            setError(problem);
            return;
        }

        setPaying(true);

        try {
            // A short pause so the test payment feels like a real one.
            await new Promise((resolve) => setTimeout(resolve, 800));
            await payOrder(order.id);
            navigate("/orders", { state: { justOrderedId: order.id, paid: true } });
        } catch (err) {
            setError(err.message || "Payment failed. Please try again.");
            setPaying(false);
        }
    }

    return (
        <section className="page page-section">
            <PageHeader eyebrow="Last step" title="Payment" />

            {loading && <p role="status" className="text-ink-soft">Loading your order</p>}
            {loadError && <p role="alert" className="field-error">{loadError}</p>}

            {!loading && !loadError && !order && (
                <div>
                    <h2 className="title mb-2">Order not found</h2>
                    <Button to="/orders">View your orders</Button>
                </div>
            )}

            {order && order.status !== "Pending" && (
                <div>
                    <h2 className="title mb-2">Order #EB-{order.id} is {order.status.toLowerCase()}</h2>
                    <p className="text-ink-soft mb-8">There is nothing to pay for this order.</p>
                    <Button to="/orders">View your orders</Button>
                </div>
            )}

            {order && order.status === "Pending" && (
                <div className="grid lg:grid-cols-12 gap-12">
                    <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 flex flex-col gap-6">
                        <div className="border-l-4 border-ember bg-paper-deep px-6 py-4">
                            <p className="font-bold mb-2">Test mode: no real payment is taken</p>
                            <p className="text-ink-soft mb-2">Use any name, a future expiry date and any 3-digit code with one of these cards:</p>
                            <ul className="flex flex-col gap-1">
                                {TEST_CARDS.map((card) => (
                                    <li key={card.number}>
                                        <button
                                            type="button"
                                            onClick={() => setNumber(card.number)}
                                            className="font-mono font-bold underline underline-offset-4"
                                        >
                                            {card.number}
                                        </button>{" "}
                                        <span className="text-ink-soft">{card.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {error && <p role="alert" className="field-error">{error}</p>}

                        <Input label="Name on card" type="text" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input
                            label="Card number"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="4242 4242 4242 4242"
                            value={number}
                            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Expiry (MM/YY)"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="12/30"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            />
                            <Input
                                label="Security code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 3))}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <Button type="submit" disabled={paying}>
                                {paying ? "Processing payment" : `Pay R ${Number(order.total).toLocaleString()}`}
                            </Button>
                            <Link to="/orders" className="font-bold underline underline-offset-4">Pay later</Link>
                        </div>
                    </form>

                    <aside className="lg:col-span-5 h-fit bg-paper-deep p-8" aria-labelledby="pay-summary-heading">
                        <h2 id="pay-summary-heading" className="title mb-6">Order #EB-{order.id}</h2>

                        <ul className="flex flex-col gap-3 mb-6">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-baseline justify-between gap-4">
                                    <span className="text-ink-soft">
                                        {item.product?.name} x {item.quantity}
                                        {describeOptions(item) && <span className="block text-sm">{describeOptions(item)}</span>}
                                    </span>
                                    <span className="font-bold">R {Number(item.price * item.quantity).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-baseline justify-between border-t border-ink pt-4">
                            <span>Total</span>
                            <span className="text-3xl font-bold">R {Number(order.total).toLocaleString()}</span>
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}
