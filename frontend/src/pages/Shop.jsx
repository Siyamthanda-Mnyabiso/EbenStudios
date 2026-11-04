import { useEffect, useState } from "react";
import { getProducts } from "../service/productService";
import Reveal from "../components/ui/Reveal";
import ProductGrid from "../components/products/ProductGrid";

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch((err) => setError(err.message || "Failed to load products."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page pt-6 pb-16">
            <Reveal className="flex items-end justify-between gap-6 border-y border-black py-5 mb-8">
                <h1 className="display">Shop</h1>

                {!loading && !error && (
                    <p className="display" aria-label={`${products.length} products`}>
                        {products.length}
                    </p>
                )}
            </Reveal>

            {loading && <p role="status" className="text-ink-soft">Loading products</p>}

            {error && <p role="alert" className="field-error">{error}</p>}

            {!loading && !error && products.length === 0 && (
                <div className="border border-line bg-white p-10 max-w-2xl">
                    <h2 className="title mb-2">Nothing here yet</h2>
                    <p className="text-ink-soft">
                        New pieces are on the way. Check back soon for the latest Eben Studios drops.
                    </p>
                </div>
            )}

            {!loading && !error && products.length > 0 && <ProductGrid products={products} />}
        </section>
    );
}
