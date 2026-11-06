// One list for the home page, footer, shop filter and admin form.
// `name` matches the products.category check in migration 0008.
export const CATEGORIES = [
    { slug: "hoodies", name: "Hoodies", description: "Heavyweight fleece built for the streets" },
    { slug: "t-shirts", name: "T-shirts", description: "Everyday essentials in a boxy fit" },
    { slug: "bottoms", name: "Bottoms", description: "Shorts and pants for every season" },
    { slug: "outerwear", name: "Outerwear", description: "Jackets made for Cape Town winters" },
    { slug: "accessories", name: "Accessories", description: "Caps, bags and the finer details" },
];

export function findCategory(slug) {
    return CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function categoryLink(category) {
    return `/shop?category=${category.slug}`;
}
