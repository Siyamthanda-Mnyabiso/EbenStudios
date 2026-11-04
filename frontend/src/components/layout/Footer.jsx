import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";

function InstagramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...props}>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function TwitterIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
            <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.5L4.5 22H1.3l8.1-9.3L1 2h7.1l4.9 5.9L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
        </svg>
    );
}

function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
            <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-.9.3-1.6 1.7-1.6h1.7V3.5C16.4 3.4 15.3 3.3 14 3.3c-2.6 0-4.4 1.6-4.4 4.5v2.5H6.8v3.3h2.8V22h3.9Z" />
        </svg>
    );
}

const shopLinks = ["Hoodies", "T-shirts", "Outerwear", "Accessories"];

const footerLink = "inline-flex items-center min-h-12 hover:text-white hover:underline underline-offset-4";

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            <div className="page py-16 lg:py-24">
                <Reveal as="p" className="font-display font-extrabold tracking-tight text-[clamp(2.25rem,9vw,8rem)] leading-[0.9] mb-12">
                    Eben Studios
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-t border-white/20 pt-10">
                    <div className="md:col-span-1">
                        <p className="max-w-xs text-white/80">
                            Modern streetwear inspired by culture, movement and self expression.
                            Based in Woodstock, Cape Town.
                        </p>
                    </div>

                    <nav aria-label="Shop">
                        <h2 className="eyebrow !text-white/70 mb-2">Shop</h2>
                        <ul>
                            {shopLinks.map((label) => (
                                <li key={label}>
                                    <Link to="/shop" className={footerLink}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Company">
                        <h2 className="eyebrow !text-white/70 mb-2">Company</h2>
                        <ul>
                            <li><Link to="/about" className={footerLink}>About</Link></li>
                            <li><Link to="/contact" className={footerLink}>Contact</Link></li>
                            <li><Link to="/orders" className={footerLink}>Orders</Link></li>
                        </ul>
                    </nav>

                    <div>
                        <h2 className="eyebrow !text-white/70 mb-2">Follow</h2>
                        <div className="flex items-center -ml-3">
                            <a href="#" aria-label="Instagram" className="inline-flex items-center justify-center w-12 h-12 hover:text-white"><InstagramIcon /></a>
                            <a href="#" aria-label="X" className="inline-flex items-center justify-center w-12 h-12 hover:text-white"><TwitterIcon /></a>
                            <a href="#" aria-label="Facebook" className="inline-flex items-center justify-center w-12 h-12 hover:text-white"><FacebookIcon /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white/70">
                    <p>&copy; {new Date().getFullYear()} Eben Studios</p>

                    <div className="flex items-center gap-6">
                        <a href="#" className={footerLink}>Privacy</a>
                        <a href="#" className={footerLink}>Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
