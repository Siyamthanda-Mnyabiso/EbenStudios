import { supabase, unwrap, PRODUCT_IMAGE_BUCKET } from "./supabase";
import { toProductShape as toProduct } from "./productShape";

export async function getProducts() {
    const rows = unwrap(
        await supabase.from("products").select("*").order("created_at", { ascending: false })
    );

    return rows.map(toProduct);
}

export async function getProduct(id) {
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

function toRow({ name, description, price, stock, tag }) {
    return {
        name,
        description: description || null,
        price: Number(price),
        stock: Number(stock ?? 0),
        tag: tag || null,
    };
}

export async function createProduct({ image, ...fields }) {
    const row = toRow(fields);

    if (image) {
        row.image_url = await uploadImage(image);
    }

    return toProduct(unwrap(await supabase.from("products").insert(row).select().single()));
}

export async function updateProduct(id, { image, ...fields }) {
    const row = toRow(fields);
    let previousUrl = null;

    if (image) {
        const existing = unwrap(await supabase.from("products").select("image_url").eq("id", id).single());
        previousUrl = existing.image_url;
        row.image_url = await uploadImage(image);
    }

    const product = toProduct(
        unwrap(await supabase.from("products").update(row).eq("id", id).select().single())
    );

    await deleteImage(previousUrl);

    return product;
}

export async function deleteProduct(id) {
    const row = unwrap(await supabase.from("products").select("image_url").eq("id", id).maybeSingle());

    unwrap(await supabase.from("products").delete().eq("id", id));
    await deleteImage(row?.image_url);
}
