import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Register() {
    useDocumentTitle("Create account");
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // Set by pages that need a login, so the visitor lands back where they were going.
    const from = location.state?.from ?? "/";
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await register(name, email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="page page-section">
            <div className="max-w-md">
                <p className="eyebrow mb-3">Join Eben Studios</p>
                <h1 className="display mb-10">Create account</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && <p role="alert" className="field-error">{error}</p>}

                    <Input label="Full name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                        label="Password"
                        hint="At least 6 characters"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Creating account" : "Create account"}
                        </Button>
                    </div>
                </form>

                <p className="text-ink-soft mt-8">
                    Already have an account?{" "}
                    <Link to="/login" state={{ from }} className="font-bold text-ember underline underline-offset-4">
                        Log in
                    </Link>
                </p>
            </div>
        </section>
    );
}
