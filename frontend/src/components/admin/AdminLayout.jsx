import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, LogOut, Store } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
];

const itemBase = "flex items-center gap-3 px-4 min-h-12 font-medium transition-colors";

function linkClass({ isActive }) {
    return `${itemBase} ${isActive ? "bg-paper text-ink" : "text-paper/75 hover:bg-paper/10 hover:text-paper"}`;
}

export default function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <aside className="md:w-64 shrink-0 bg-ink text-paper flex flex-col p-4 md:p-6 gap-4 md:gap-0">
                <Link to="/admin" className="font-display text-2xl font-bold tracking-tight md:mb-10">
                    Eben admin
                </Link>

                <nav aria-label="Admin" className="md:flex-1 flex md:flex-col gap-1 overflow-x-auto">
                    {links.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end} className={linkClass}>
                            <Icon size={18} aria-hidden="true" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="md:border-t border-paper/20 md:pt-4 flex md:flex-col gap-1">
                    <Link to="/" className={`${itemBase} text-paper/75 hover:bg-paper/10 hover:text-paper`}>
                        <Store size={18} aria-hidden="true" />
                        View store
                    </Link>

                    <button
                        onClick={logout}
                        className={`${itemBase} text-paper/75 hover:bg-paper/10 hover:text-paper text-left`}
                    >
                        <LogOut size={18} aria-hidden="true" />
                        Log out
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-end px-6 md:px-8 border-b border-line bg-white">
                    <p className="text-mute">
                        Signed in as <span className="font-bold text-ink">{user?.email}</span>
                    </p>
                </header>

                <main className="flex-1 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
