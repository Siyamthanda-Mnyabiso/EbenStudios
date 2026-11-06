import { useEffect, useMemo, useState } from "react";
import { useCart } from "./useCart";
import { getProductsByIds } from "../service/productService";
import { lineProblem } from "../lib/cartCheck";

// Loads the cart's products fresh from the database, refreshes prices in the cart,
// and reports which lines cannot be ordered as they are.
export function useCartCheck() {
    const { items, refreshFromProducts } = useCart();
    const [products, setProducts] = useState(null);
    const [error, setError] = useState("");

    const ids = useMemo(() => [...new Set(items.map((item) => item.id))].sort((a, b) => a - b), [items]);
    const idsKey = ids.join(",");

    useEffect(() => {
        let ignore = false;

        getProductsByIds(ids)
            .then((fresh) => {
                if (ignore) return;
                setProducts(fresh);
                setError("");
                refreshFromProducts(fresh);
            })
            .catch((err) => {
                if (!ignore) setError(err.message || "Could not check your cart.");
            });

        return () => {
            ignore = true;
        };
        // idsKey stands in for ids: refetch only when the set of products changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);

    const problems = useMemo(() => {
        const result = {};

        if (!products) {
            return result;
        }

        const byId = new Map(products.map((product) => [product.id, product]));
        const quantities = {};
        for (const item of items) {
            quantities[item.id] = (quantities[item.id] ?? 0) + item.quantity;
        }

        for (const item of items) {
            const problem = lineProblem(item, byId.get(item.id), quantities[item.id]);
            if (problem) {
                result[item.key] = problem;
            }
        }

        return result;
    }, [items, products]);

    return {
        checking: products === null && !error,
        error,
        problems,
        hasProblems: Object.keys(problems).length > 0,
    };
}
