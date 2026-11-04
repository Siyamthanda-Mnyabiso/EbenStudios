import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { getProductImage } from "../../lib/productImage";
import { useCart } from "../../hooks/useCart";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const soldOut = product.stock <= 0;

    function handleAdd() {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <article className="group">
            <Link to={`/products/${product.id}`} className="block" aria-label={product.name}>
                <div className="relative aspect-[4/5] bg-paper-deep overflow-hidden">
                    <img
                        src={getProductImage(product)}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-500"
                    />

                    {product.tag && (
                        <span className="absolute top-3 left-3 bg-white text-black text-xs font-bold px-2.5 py-1 rounded-full">
                            {product.tag}
                        </span>
                    )}
                </div>
            </Link>

            <div className="flex items-start justify-between gap-3 pt-3 pb-3 border-b border-black">
                <div className="min-w-0">
                    <p className="font-bold">R {Number(product.price).toLocaleString()}</p>
                    <Link to={`/products/${product.id}`} className="block text-ink-soft truncate hover:text-black hover:underline underline-offset-4">
                        {product.name}
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={soldOut}
                    aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
                    className="shrink-0 inline-flex items-center justify-center w-12 h-12 -mt-2 -mr-3 hover:bg-black hover:text-white rounded-full transition-colors disabled:opacity-40"
                >
                    {added ? <Check size={18} /> : <Plus size={18} />}
                </button>
            </div>

            <p className="pt-3">
                <span className="inline-block border border-black/30 rounded-full px-3 py-1 text-sm text-ink-soft">
                    {soldOut ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
                </span>
            </p>
        </article>
    );
}
