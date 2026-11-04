// Creates the admin account and starter products.
// Run with: npm run seed   (reads .env via node --env-file)
import { createClient } from "@supabase/supabase-js";

const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
}

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureAdmin() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { name: "Admin" },
    });

    let userId = data?.user?.id;

    if (error) {
        if (!/already/i.test(error.message)) {
            throw error;
        }

        const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        if (listError) throw listError;
        userId = list.users.find((u) => u.email === ADMIN_EMAIL)?.id;
    }

    const { error: roleError } = await supabase.from("profiles").update({ role: "ADMIN" }).eq("id", userId);
    if (roleError) throw roleError;
}

async function seedProducts() {
    // Placeholders based on the items visible on the brand's Instagram. Replace in the admin.
    const description = "Placeholder product. Replace the name, price and photo in the admin.";
    const products = [
        { name: "White tee", description, price: 549, stock: 10, tag: "Placeholder", sizes: ["S", "M", "L", "XL"], colors: ["White", "Black"] },
        { name: "Red shorts", description, price: 799, stock: 10, tag: "Placeholder", sizes: ["S", "M", "L", "XL"], colors: ["Red"] },
        { name: "Cap", description, price: 399, stock: 10, tag: "Placeholder", sizes: [], colors: ["Red"] },
    ];

    const { error } = await supabase.from("products").upsert(products, { onConflict: "name", ignoreDuplicates: true });
    if (error) throw error;
}

await ensureAdmin();
await seedProducts();
console.log(`Seed complete. Admin login: ${ADMIN_EMAIL}`);
