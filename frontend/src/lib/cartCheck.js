// What stops a cart line from being ordered, or null when it is fine.
// `quantityOfProduct` is the total across every line of the same product, because stock is shared.
export function lineProblem(item, product, quantityOfProduct) {
    if (!product) {
        return { message: "No longer available", fixable: false };
    }

    if (product.sizes.length > 0 && !product.sizes.includes(item.size)) {
        return { message: "Choose a size", fixable: true };
    }

    if (product.colors.length > 0 && !product.colors.includes(item.color)) {
        return { message: "Choose a colour", fixable: true };
    }

    if (product.stock < quantityOfProduct) {
        return { message: product.stock === 0 ? "Sold out" : `Only ${product.stock} left`, fixable: false };
    }

    return null;
}
