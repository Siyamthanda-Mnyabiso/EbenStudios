import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "../service/productService";
import { useCart } from "../hooks/useCart";
import { getProductImage } from "../lib/productImage";
import Button from "../components/ui/Button";

export default function ProductPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

    function handleAddToCart() {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    useEffect(() => {
        getProduct(id)
            .then((data) => {
                setProduct(data);
                setError("");
            })
            .catch((err) => setError(err.message || "Product not found."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <section className="page page-section">
                <p role="status" className="text-ink-soft">Loading product</p>
            </section>
        );
    }

    if (error || !product) {
        return (
            <section className="page page-section">
                <h1 className="headline mb-8">{error || "Product not found"}</h1>
                <Button variant="secondary" to="/shop">Back to shop</Button>
            </section>
        );
    }

    const inStock = product.stock > 0;

    return (
        <section className="page pt-8 pb-16 lg:pb-24">
            <Link to="/shop" className="inline-flex items-center gap-2 min-h-12 font-medium hover:text-ember">
                <ArrowLeft size={18} aria-hidden="true" />
                All products
            </Link>

            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-4">
                <div className="lg:col-span-7 relative aspect-[4/5] bg-paper-deep overflow-hidden">
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />

                    {product.tag && (
                        <span className="absolute top-0 left-0 bg-ink text-paper text-sm font-bold px-3 py-1.5">
                            {product.tag}
                        </span>
                    )}
                </div>

                <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
                    <p className="eyebrow mb-3">Eben Studios</p>
                    <h1 className="display mb-6">{product.name}</h1>

                    <p className="text-3xl font-bold mb-8">
                        R {Number(product.price).toLocaleString()}
                    </p>

                    {product.description && (
                        <p className="text-lg text-ink-soft max-w-prose mb-8">{product.description}</p>
                    )}

                    <p className={`font-bold mb-8 ${inStock ? "text-ink" : "field-error"}`}>
                        {inStock ? `In stock, ${product.stock} available` : "Sold out"}
                    </p>

                    <Button onClick={handleAddToCart} disabled={!inStock} className="w-full sm:w-auto">
                        {added ? "Added to cart" : "Add to cart"}
                    </Button>

                    <p role="status" className="sr-only">{added ? `${product.name} added to cart` : ""}</p>
                </div>
            </div>
        </section>
    );
}
