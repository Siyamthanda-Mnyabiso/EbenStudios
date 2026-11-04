import { useEffect, useState } from "react";
import CartContext from "./cart-context";
import { lineKey } from "../lib/productOptions";

const STORAGE_KEY = "eben_cart_items";

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            // Carts saved before sizes and colours existed get a key on load.
            return stored
                ? JSON.parse(stored).map((item) => ({ ...item, key: item.key ?? lineKey(item.id, item.size, item.color) }))
                : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addToCart(product, { quantity = 1, size = null, color = null } = {}) {
        const key = lineKey(product.id, size, color);

        setItems((current) => {
            const existing = current.find((item) => item.key === key);

            if (existing) {
                return current.map((item) =>
                    item.key === key ? { ...item, quantity: item.quantity + quantity } : item
                );
            }

            return [
                ...current,
                {
                    key,
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    tag: product.tag,
                    imageUrl: product.imageUrl,
                    size,
                    color,
                    quantity,
                },
            ];
        });
    }

    function updateQuantity(key, quantity) {
        if (quantity <= 0) {
            removeFromCart(key);
            return;
        }

        setItems((current) => current.map((item) => (item.key === key ? { ...item, quantity } : item)));
    }

    function removeFromCart(key) {
        setItems((current) => current.filter((item) => item.key !== key));
    }

    function clearCart() {
        setItems([]);
    }

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, subtotal }}
        >
            {children}
        </CartContext.Provider>
    );
}
