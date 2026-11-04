// True when a customer has to pick between several sizes or colours.
export function needsChoice(product) {
    return (product.sizes?.length ?? 0) > 1 || (product.colors?.length ?? 0) > 1;
}

// A product with at most one size and one colour needs no picking: use what it offers.
export function defaultSelection(product) {
    return {
        size: product.sizes?.length === 1 ? product.sizes[0] : null,
        color: product.colors?.length === 1 ? product.colors[0] : null,
    };
}

// "Size M, Black" style summary for cart and order lines. Empty when no options chosen.
export function describeOptions({ size, color }) {
    return [size && `Size ${size}`, color].filter(Boolean).join(", ");
}

// Admin form helper: "S, M, L" -> ["S", "M", "L"] without blanks or repeats.
export function parseList(text) {
    return [...new Set(String(text ?? "").split(",").map((part) => part.trim()).filter(Boolean))];
}

// One cart line per product, size and colour.
export function lineKey(id, size, color) {
    return `${id}|${size ?? ""}|${color ?? ""}`;
}
