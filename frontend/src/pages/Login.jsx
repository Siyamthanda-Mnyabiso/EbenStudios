import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="page page-section">
            <div className="max-w-md">
                <p className="eyebrow mb-3">Welcome back</p>
                <h1 className="display mb-10">Log in</h1>

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

                <p className="text-ink-soft mt-8">
                    New to Eben Studios?{" "}
                    <Link to="/register" className="font-bold text-ember underline underline-offset-4">
                        Create an account
                    </Link>
                </p>
            </div>
        </section>
    );
}
