import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User, Menu } from "lucide-react";

import MobileMenu from "./MobileMenu";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const links = [
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
];

function navLinkClass({ isActive }) {
    return `inline-flex items-center min-h-12 border-b-2 font-medium transition-colors ${
        isActive ? "border-black text-black" : "border-transparent text-mute hover:text-black"
    }`;
}

const iconButton =
    "relative inline-flex items-center justify-center w-12 h-12 text-ink hover:text-mute transition-colors";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { itemCount } = useCart();
    const { user } = useAuth();

    return (
        <>
            <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-black">
                <div className="page grid grid-cols-[1fr_auto_1fr] items-center h-20">
                    <nav aria-label="Main" className="hidden md:flex items-center gap-8">
                        {links.map((link) => (
                            <NavLink key={link.to} to={link.to} className={navLinkClass}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={() => setOpen(true)}
                        className={`${iconButton} md:hidden -ml-3 justify-self-start`}
                    >
                        <Menu size={24} />
                    </button>

                    <Link
                        to="/"
                        className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-center"
                    >
                        Eben Studios
                    </Link>

                    <div className="flex items-center justify-end -mr-3">
                        <Link
                            to={user ? "/profile" : "/login"}
                            aria-label={user ? "Account" : "Log in"}
                            className={`${iconButton} hidden md:inline-flex`}
                        >
                            <User size={22} />
                        </Link>

                        <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className={iconButton}>
                            <ShoppingBag size={22} />
                            {itemCount > 0 && (
                                <span className="absolute top-1.5 right-1 bg-black text-white text-xs font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <MobileMenu isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
