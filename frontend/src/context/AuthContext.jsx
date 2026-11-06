import { useEffect, useState } from "react";
import AuthContext from "./auth-context";
import { supabase } from "../service/supabase";
import {
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    getCurrentUser,
    getProfile,
} from "../service/authService";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));

        // Keeps tabs in sync and clears the user when the session expires.
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                setUser(null);
            } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
                // SIGNED_IN covers logins in another tab and returning from the email confirmation link.
                // Deferred: awaiting Supabase calls inside this callback can deadlock the auth client.
                setTimeout(() => getProfile(session.user.id).then(setUser).catch(() => {}), 0);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    async function login(email, password) {
        const loggedInUser = await apiLogin(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    }

    async function register(name, email, password) {
        const newUser = await apiRegister(name, email, password);
        setUser(newUser);
        return newUser;
    }

    async function logout() {
        await apiLogout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
