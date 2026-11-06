import { supabase, unwrap, PRODUCT_IMAGE_BUCKET } from "./supabase";
import { toProductShape as toProduct } from "./productShape";
import { parseList } from "../lib/productOptions";

// The shop only lists products on sale. The admin passes includeArchived to see everything.
export async function getProducts({ includeArchived = false } = {}) {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (!includeArchived) {
        query = query.eq("archived", false);
    }

    return unwrap(await query).map(toProduct);
}

export async function getProduct(id) {
    // Ids are whole numbers; anything else (e.g. /products/abc) is simply not found.
    if (!/^\d+$/.test(String(id))) {
        throw new Error("Product not found.");
    }

    const row = unwrap(await supabase.from("products").select("*").eq("id", id).maybeSingle());

    if (!row) {
        throw new Error("Product not found.");
    }

    return toProduct(row);
}

async function uploadImage(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;

    unwrap(await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, { contentType: file.type }));

    return supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best effort: only touches files in our own bucket (external image links are ignored).
async function deleteImage(imageUrl) {
    const marker = `/${PRODUCT_IMAGE_BUCKET}/`;

    if (!imageUrl || !imageUrl.includes(marker)) {
        return;
    }

    const path = decodeURIComponent(imageUrl.split(marker).pop());
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
}

function toRow({ name, description, price, stock, tag, category, sizes, colors }) {
    return {
        name,
        description: description || null,
        price: Number(price),
        stock: Number(stock ?? 0),
        tag: tag || null,
        category: category || null,
        sizes: parseList(sizes),
        colors: parseList(colors),
    };
}

// Turns database errors into messages an admin can act on.
function friendlySaveError(err) {
    if (err.code === "23505") {
        return new Error("A product with this name already exists. If it is archived, restore it instead.");
    }

    return err;
}

export async function createProduct({ image, ...fields }) {
    const row = toRow(fields);

    if (image) {
        row.image_url = await uploadImage(image);
    }

    try {
        return toProduct(unwrap(await supabase.from("products").insert(row).select().single()));
    } catch (err) {
        throw friendlySaveError(err);
    }
}

export async function updateProduct(id, { image, ...fields }) {
    const row = toRow(fields);
    let previousUrl = null;

    if (image) {
        const existing = unwrap(await supabase.from("products").select("image_url").eq("id", id).single());
        previousUrl = existing.image_url;
        row.image_url = await uploadImage(image);
    }

    let product;

    try {
        product = toProduct(unwrap(await supabase.from("products").update(row).eq("id", id).select().single()));
    } catch (err) {
        throw friendlySaveError(err);
    }

    await deleteImage(previousUrl);

    return product;
}

// Deletes the product, or archives it when it has been ordered (the database decides).
// Returns "deleted" or "archived". The photo is only removed when the product is really gone.
export async function deleteProduct(id) {
    const row = unwrap(await supabase.from("products").select("image_url").eq("id", id).maybeSingle());
    const result = unwrap(await supabase.rpc("delete_product", { product_id: id }));

    if (result === "deleted") {
        await deleteImage(row?.image_url);
    }

    return result;
}

export async function restoreProduct(id) {
    unwrap(await supabase.from("products").update({ archived: false }).eq("id", id));
}

// Fresh data for the products in a cart, so stock, price and options are checked before checkout.
export async function getProductsByIds(ids) {
    if (ids.length === 0) {
        return [];
    }

    const rows = unwrap(await supabase.from("products").select("*").in("id", ids));
    return rows.map(toProduct);
}
