import { Link } from "react-router-dom";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

// Phones only: a slim bar that takes a signed-in admin back to the dashboard.
// (On larger screens the header has an Admin button instead.)
export default function AdminBar() {
    const { user } = useAuth();

    if (user?.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="md:hidden bg-paper-deep text-ink border-b border-line">
            <Link
                to="/admin"
                className="page flex items-center justify-between gap-3 min-h-12 font-semibold"
            >
                <span className="inline-flex items-center gap-2">
                    <LayoutDashboard size={18} aria-hidden="true" />
                    Signed in as admin
                </span>
                <span className="inline-flex items-center gap-1 underline underline-offset-4">
                    Go to dashboard
                    <ArrowRight size={16} aria-hidden="true" />
                </span>
            </Link>
        </div>
    );
}
