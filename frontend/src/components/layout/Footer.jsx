import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";
import { CATEGORIES, categoryLink } from "../../lib/categories";

const footerLink = "inline-flex items-center min-h-12 hover:text-white hover:underline underline-offset-4";

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            <div className="page py-16 lg:py-24">
                <Reveal as="p" className="font-display font-extrabold tracking-tight text-[clamp(2.25rem,9vw,8rem)] leading-[0.9] mb-12">
                    Eben Studios
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/20 pt-10">
                    <div className="md:col-span-1">
                        <p className="max-w-xs text-white/80">
                            Modern streetwear inspired by culture, movement and self expression.
                            Based in Woodstock, Cape Town.
                        </p>
                    </div>

                    <nav aria-label="Shop">
                        <h2 className="eyebrow !text-white/70 mb-2">Shop</h2>
                        <ul>
                            {CATEGORIES.map((category) => (
                                <li key={category.slug}>
                                    <Link to={categoryLink(category)} className={footerLink}>{category.name}</Link>
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
                </div>

                <div className="border-t border-white/20 mt-10 pt-8 text-white/70">
                    <p>&copy; {new Date().getFullYear()} Eben Studios</p>
                </div>
            </div>
        </footer>
    );
}
