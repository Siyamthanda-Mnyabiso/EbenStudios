import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function AdminLogin() {
    useDocumentTitle("Admin log in");
    const { user, loading, login, logout } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user?.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const loggedInUser = await login(email, password);

            if (loggedInUser.role === "ADMIN") {
                navigate("/admin");
            } else {
                await logout();
                setError("This account does not have admin access.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center bg-paper">
            <div className="page w-full">
                <div className="max-w-md">
                    <p className="eyebrow mb-3">Eben Studios</p>
                    <h1 className="display mb-10">Admin log in</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {error && <p role="alert" className="field-error">{error}</p>}

                        <Input label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />

                        <div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Logging in" : "Log in"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
