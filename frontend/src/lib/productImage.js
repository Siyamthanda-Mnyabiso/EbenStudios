// Neutral tile shown for products that have no photo yet (no external stock images).
const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">` +
            `<rect width="400" height="500" fill="#f2f2f0"/>` +
            `<text x="200" y="258" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3" fill="#6b6b6b">EBEN STUDIOS</text>` +
            `</svg>`
    );

export function getProductImage(product) {
    return product.imageUrl || PLACEHOLDER;
}
