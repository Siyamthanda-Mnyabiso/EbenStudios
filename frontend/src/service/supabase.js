import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
    // Keep the UI rendering so the storefront shell still loads. Data calls will fail until .env is set.
    console.warn("Supabase is not configured. Copy frontend/.env.example to frontend/.env and fill it in.");
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-key");

export const NOT_CONFIGURED_MESSAGE =
    "The shop is not connected to its database yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env and restart the dev server.";

export const PRODUCT_IMAGE_BUCKET = "product-images";

// Throws a plain Error carrying Supabase's message so pages can show err.message.
export function unwrap({ data, error }) {
    if (error) {
        // Without config every call hits the placeholder host and fails with "Failed to fetch".
        throw new Error(isSupabaseConfigured ? error.message : NOT_CONFIGURED_MESSAGE);
    }

    return data;
}
