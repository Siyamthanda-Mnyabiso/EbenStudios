import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function MobileMenu({ isOpen, onClose }) {
    const { user } = useAuth();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const links = [
        { to: "/shop", label: "Shop" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
        { to: "/orders", label: "Orders" },
        user ? { to: "/profile", label: "Account" } : { to: "/login", label: "Log in" },
    ];

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            aria-hidden={!isOpen}
            className={`fixed inset-0 z-50 bg-paper transition duration-300 ${
                isOpen ? "visible opacity-100" : "invisible opacity-0"
            }`}
        >
            <div className="page flex items-center justify-between h-20 border-b border-line">
                <span className="font-display text-xl font-extrabold tracking-tight">Eben Studios</span>

                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={onClose}
                    className="inline-flex items-center justify-center w-12 h-12 -mr-3"
                >
                    <X size={24} />
                </button>
            </div>

            <nav aria-label="Mobile" className="page py-8">
                <ul className="divide-y divide-line border-b border-line">
                    {links.map((link, index) => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                onClick={onClose}
                                className="flex items-baseline gap-4 py-5 font-display text-3xl font-extrabold tracking-tight"
                            >
                                <span className="eyebrow w-8">{String(index + 1).padStart(2, "0")}</span>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
