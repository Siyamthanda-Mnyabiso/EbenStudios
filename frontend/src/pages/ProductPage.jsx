import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "../service/productService";
import { useCart } from "../hooks/useCart";
import { getProductImage } from "../lib/productImage";
import Button from "../components/ui/Button";
import OptionGroup from "../components/products/OptionGroup";
import { defaultSelection } from "../lib/productOptions";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Keyed by id so moving from one product to another starts with fresh state.
export default function ProductPage() {
    const { id } = useParams();
    return <ProductView key={id} id={id} />;
}

function ProductView({ id }) {
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);
    const [size, setSize] = useState(null);
    const [color, setColor] = useState(null);
    const [errors, setErrors] = useState({});

    function handleAddToCart() {
        const missing = {};

        if (product.sizes.length > 0 && !size) {
            missing.size = "Choose a size";
        }

        if (product.colors.length > 0 && !color) {
            missing.color = "Choose a colour";
        }

        setErrors(missing);

        if (Object.keys(missing).length > 0) {
            return;
        }

        addToCart(product, { size, color });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    useDocumentTitle(product ? product.name : error ? "Product not found" : "Product");

    useEffect(() => {
        // A slow earlier load is ignored if the page has moved on.
        let ignore = false;

        getProduct(id)
            .then((data) => {
                if (ignore) return;
                setProduct(data);
                // Single option products need no choosing.
                const preset = defaultSelection(data);
                setSize(preset.size);
                setColor(preset.color);
                setErrors({});
                setError("");
            })
            .catch((err) => {
                if (!ignore) setError(err.message || "Product not found.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
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

    // Old links and saved carts can still point at a product that has been taken off sale.
    if (product.archived) {
        return (
            <section className="page page-section">
                <p className="eyebrow mb-3">{product.name}</p>
                <h1 className="headline mb-8">This product is no longer available</h1>
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

                    {product.colors.length > 0 && (
                        <OptionGroup
                            legend="Colour"
                            options={product.colors}
                            value={color}
                            onChange={(value) => {
                                setColor(value);
                                setErrors((current) => ({ ...current, color: undefined }));
                            }}
                            error={errors.color}
                        />
                    )}

                    {product.sizes.length > 0 && (
                        <OptionGroup
                            legend="Size"
                            options={product.sizes}
                            value={size}
                            onChange={(value) => {
                                setSize(value);
                                setErrors((current) => ({ ...current, size: undefined }));
                            }}
                            error={errors.size}
                        />
                    )}

                    <Button onClick={handleAddToCart} disabled={!inStock} className="w-full sm:w-auto">
                        {added ? "Added to cart" : "Add to cart"}
                    </Button>

                    <p role="status" className="sr-only">{added ? `${product.name} added to cart` : ""}</p>
                </div>
            </div>
        </section>
    );
}
