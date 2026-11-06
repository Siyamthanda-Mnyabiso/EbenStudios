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
    // The launch collection. Photos are uploaded in the admin.
    const products = [
        {
            name: "White tee",
            description: "An oversized white tee in a boxy fit with dropped shoulders, finished with a small embroidered Eben Studios logo on the chest. Also available in black.",
            price: 549,
            stock: 10,
            tag: "New",
            category: "T-shirts",
            sizes: ["S", "M", "L", "XL"],
            colors: ["White", "Black"],
        },
        {
            name: "Red shorts",
            description: "Lightweight red shorts with an elastic waist and the Eben Supply script logo on the leg. Made for warm Cape Town days and easy layering with a white tee.",
            price: 799,
            stock: 10,
            tag: null,
            category: "Bottoms",
            sizes: ["S", "M", "L", "XL"],
            colors: ["Red"],
        },
        {
            name: "Cap",
            description: "A red cap with a soft crown and a short curved brim. The finishing touch on any Eben Studios fit.",
            price: 399,
            stock: 10,
            tag: null,
            category: "Accessories",
            sizes: [],
            colors: ["Red"],
        },
    ];

    const { error } = await supabase.from("products").upsert(products, { onConflict: "name", ignoreDuplicates: true });
    if (error) throw error;
}

await ensureAdmin();
await seedProducts();
console.log(`Seed complete. Admin login: ${ADMIN_EMAIL}`);
