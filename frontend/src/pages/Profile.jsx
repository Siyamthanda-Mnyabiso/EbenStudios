import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

export default function Profile() {
    const location = useLocation();
    const { user, loading, logout } = useAuth();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <section className="page page-section">
            <PageHeader eyebrow="Account" title={user.name || "Your account"} />

            <dl className="max-w-md border-t border-line mb-10">
                <div className="py-4 border-b border-line">
                    <dt className="eyebrow mb-1">Email</dt>
                    <dd className="font-medium">{user.email}</dd>
                </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button to="/orders">View orders</Button>
                {user.role === "ADMIN" && (
                    <Button variant="secondary" to="/admin">Admin dashboard</Button>
                )}
                <Button variant="secondary" onClick={logout}>Log out</Button>
            </div>
        </section>
    );
}
