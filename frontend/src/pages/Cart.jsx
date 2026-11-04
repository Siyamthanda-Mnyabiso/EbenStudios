import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { getProductImage } from "../lib/productImage";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

const qtyButton = "inline-flex items-center justify-center w-12 h-12 hover:text-ember transition-colors";

export default function Cart() {
    const { items, updateQuantity, removeFromCart, subtotal } = useCart();

    if (items.length === 0) {
        return (
            <section className="page page-section">
                <PageHeader eyebrow="Your bag" title="Cart" />

                <h2 className="title mb-2">Your cart is empty</h2>
                <p className="text-ink-soft mb-8">Add something from the shop and it will show up here.</p>
                <Button to="/shop">Browse the shop</Button>
            </section>
        );
    }

    return (
        <section className="page page-section">
            <PageHeader eyebrow="Your bag" title="Cart" />

            <div className="grid lg:grid-cols-12 gap-12">
                <ul className="lg:col-span-8 border-t border-line">
                    {items.map((item) => (
                        <li key={item.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6 border-b border-line">
                            <img
                                src={getProductImage(item)}
                                alt={item.name}
                                className="w-24 h-32 object-cover bg-paper-deep shrink-0"
                            />

                            <div className="flex-1 min-w-[10rem]">
                                <h2 className="title">{item.name}</h2>
                                <p className="text-ink-soft">R {Number(item.price).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center border border-mute">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    aria-label={`Decrease quantity of ${item.name}`}
                                    className={qtyButton}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold" aria-live="polite">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label={`Increase quantity of ${item.name}`}
                                    className={qtyButton}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <p className="w-24 text-right font-bold">
                                R {Number(item.price * item.quantity).toLocaleString()}
                            </p>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`Remove ${item.name}`}
                                className={`${qtyButton} text-mute hover:!text-danger`}
                            >
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>

                <aside className="lg:col-span-4 h-fit bg-paper-deep p-8" aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="title mb-6">Order summary</h2>

                    <div className="flex items-baseline justify-between mb-8">
                        <span className="text-ink-soft">Subtotal</span>
                        <span className="text-3xl font-bold">
                            R {Number(subtotal).toLocaleString()}
                        </span>
                    </div>

                    <Button to="/checkout" className="w-full">Go to checkout</Button>
                </aside>
            </div>
        </section>
    );
}
