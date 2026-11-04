import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Reveal from "../ui/Reveal";
import ProductGrid from "../products/ProductGrid";
import { getProducts } from "../../service/productService";

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts()
            .then((all) => setProducts(all.slice(0, 4)))
            .catch(() => setProducts([]));
    }, []);

    // Nothing to feature yet: hide the section rather than show an empty shelf.
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="page page-section">
            <Reveal className="flex items-end justify-between gap-6 border-y border-black py-4 mb-8">
                <h2 className="headline">New arrivals</h2>
                <Link to="/shop" className="inline-flex items-center min-h-12 font-bold underline underline-offset-4 hover:text-ink-soft">
                    View all
                </Link>
            </Reveal>

            <ProductGrid products={products} />
        </section>
    );
}
