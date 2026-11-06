import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../service/productService";
import Reveal from "../components/ui/Reveal";
import ProductGrid from "../components/products/ProductGrid";
import { CATEGORIES, categoryLink, findCategory } from "../lib/categories";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const chip =
    "inline-flex items-center min-h-12 px-5 rounded-full border font-semibold whitespace-nowrap transition-colors";
const chipOn = "bg-black border-black text-white";
const chipOff = "border-black/30 hover:border-black";

export default function Shop() {
    const [searchParams] = useSearchParams();
    const category = findCategory(searchParams.get("category"));

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useDocumentTitle(category ? category.name : "Shop");

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch((err) => setError(err.message || "Failed to load products."))
            .finally(() => setLoading(false));
    }, []);

    const shown = category ? products.filter((product) => product.category === category.name) : products;

    return (
        <section className="page pt-6 pb-16">
            <Reveal className="flex items-end justify-between gap-6 border-y border-black py-5 mb-6">
                <h1 className="display">{category ? category.name : "Shop"}</h1>

                {!loading && !error && (
                    <p className="display" aria-label={`${shown.length} products`}>
                        {shown.length}
                    </p>
                )}
            </Reveal>

            <nav aria-label="Categories" className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4">
                <Link to="/shop" aria-current={category ? undefined : "page"} className={`${chip} ${category ? chipOff : chipOn}`}>
                    All
                </Link>
                {CATEGORIES.map((item) => {
                    const active = category?.slug === item.slug;

                    return (
                        <Link
                            key={item.slug}
                            to={categoryLink(item)}
                            aria-current={active ? "page" : undefined}
                            className={`${chip} ${active ? chipOn : chipOff}`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {loading && <p role="status" className="text-ink-soft">Loading products</p>}

            {error && <p role="alert" className="field-error">{error}</p>}

            {!loading && !error && shown.length === 0 && (
                <div className="border border-line bg-white p-10 max-w-2xl">
                    <h2 className="title mb-2">
                        {category ? `No ${category.name.toLowerCase()} yet` : "Nothing here yet"}
                    </h2>
                    <p className="text-ink-soft mb-6">
                        New pieces are on the way. Check back soon for the latest Eben Studios drops.
                    </p>
                    {category && (
                        <Link to="/shop" className="font-bold underline underline-offset-4">
                            See all products
                        </Link>
                    )}
                </div>
            )}

            {!loading && !error && shown.length > 0 && <ProductGrid products={shown} />}
        </section>
    );
}
