import { supabase, unwrap } from "./supabase";

function toUser(profile) {
    return { id: profile.id, name: profile.name, email: profile.email, role: profile.role };
}

export async function getProfile(userId) {
    const profile = unwrap(
        await supabase.from("profiles").select("id, name, email, role").eq("id", userId).maybeSingle()
    );

    if (!profile) {
        // Signed in to Supabase but no profile row: sign out so the visitor is not stuck half logged in.
        await supabase.auth.signOut();
        throw new Error("Your account profile could not be found. Please contact us or create a new account.");
    }

    return toUser(profile);
}

export async function login(email, password) {
    const { user } = unwrap(await supabase.auth.signInWithPassword({ email, password }));
    return getProfile(user.id);
}

export async function register(name, email, password) {
    const { user, session } = unwrap(
        await supabase.auth.signUp({
            email,
            password,
            // The confirmation email links back to this site, whatever port or domain it runs on.
            options: { data: { name }, emailRedirectTo: window.location.origin },
        })
    );

    // With email confirmation on, Supabase hides existing accounts by returning a user with no identities.
    if (user && user.identities?.length === 0) {
        throw new Error("An account with this email already exists. Log in instead.");
    }

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
