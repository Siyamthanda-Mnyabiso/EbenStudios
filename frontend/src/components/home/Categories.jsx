import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal";

const categories = [
    { name: "Hoodies", description: "Heavyweight fleece built for the streets" },
    { name: "T-shirts", description: "Everyday essentials in a boxy fit" },
    { name: "Outerwear", description: "Jackets made for Cape Town winters" },
    { name: "Accessories", description: "Caps, bags and the finer details" },
];

export default function Categories() {
    return (
        <section className="page page-section">
            <Reveal className="border-y border-black py-4 mb-2">
                <h2 className="headline">Find your fit</h2>
            </Reveal>

            <ul>
                {categories.map((category, index) => (
                    <Reveal as="li" key={category.name} delay={index * 80} className="border-b border-line">
                        <Link
                            to="/shop"
                            className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 hover:bg-white transition-colors"
                        >
                            <span className="text-mute font-bold">{String(index + 1).padStart(2, "0")}</span>

                            <span className="grid md:grid-cols-2 gap-1 md:gap-6 md:items-baseline">
                                <span className="font-display font-extrabold tracking-tight text-2xl md:text-4xl">
                                    {category.name}
                                </span>
                                <span className="text-ink-soft">{category.description}</span>
                            </span>

                            <ArrowUpRight
                                size={24}
                                aria-hidden="true"
                                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                            />
                        </Link>
                    </Reveal>
                ))}
            </ul>
        </section>
    );
}
