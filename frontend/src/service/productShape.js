// Shared snake_case -> camelCase mapping for a products row (used by order embeds).
export function toProductShape(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        stock: row.stock,
        tag: row.tag,
        sizes: row.sizes ?? [],
        colors: row.colors ?? [],
        imageUrl: row.image_url,
        createdAt: row.created_at,
    };
}
