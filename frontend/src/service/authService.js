import { supabase, unwrap } from "./supabase";

function toUser(profile) {
    return { id: profile.id, name: profile.name, email: profile.email, role: profile.role };
}

export async function getProfile(userId) {
    const profile = unwrap(
        await supabase.from("profiles").select("id, name, email, role").eq("id", userId).single()
    );

    return toUser(profile);
}

export async function login(email, password) {
    const { user } = unwrap(await supabase.auth.signInWithPassword({ email, password }));
    return getProfile(user.id);
}

export async function register(name, email, password) {
    const { user, session } = unwrap(
        await supabase.auth.signUp({ email, password, options: { data: { name } } })
    );

    if (!session) {
        throw new Error("Check your email to confirm your account, then log in.");
    }

    return getProfile(user.id);
}

export async function logout() {
    await supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    return data.session ? getProfile(data.session.user.id) : null;
}
