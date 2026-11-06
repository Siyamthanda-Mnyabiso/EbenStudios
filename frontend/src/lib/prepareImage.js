// Makes a photo safe to upload: the bucket accepts JPEG, PNG, WebP or GIF up to 5 MB.
// Phone photos are often bigger than that (or HEIC on iPhone), so anything large or in
// another format is redrawn as a JPEG no wider or taller than MAX_SIDE.

const MAX_SIDE = 2000;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const KEEP_AS_IS_BELOW = 1.5 * 1024 * 1024;

export async function prepareImage(file) {
    if (ACCEPTED.includes(file.type) && file.size <= KEEP_AS_IS_BELOW) {
        return file;
    }

    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        // Chrome and Firefox cannot open HEIC; Safari can.
        throw new Error("This photo format can't be used here. Save it as a JPG or PNG and try again.");
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));

    if (!blob || blob.size > MAX_BYTES) {
        throw new Error("This photo is too large. Use one under 5 MB.");
    }

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
}
