import { ArrowRight } from "lucide-react";

import heroImage from "../../assets/hero_img.png";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

export default function HeroSection() {
    return (
        <section className="page pt-6">
            <div className="grid lg:grid-cols-12 gap-6 border-y border-black py-6 lg:py-8 items-end">
                <Reveal as="h1" className="display lg:col-span-8">Streetwear from Woodstock</Reveal>

                <Reveal delay={150} className="lg:col-span-4 lg:text-right">
                    <Button to="/shop">
                        Shop the collection
                        <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                </Reveal>
            </div>

            <Reveal as="figure" delay={100} className="mt-4 bg-paper-deep overflow-hidden">
                <img
                    src={heroImage}
                    alt="Eben Studios streetwear in Woodstock, Cape Town"
                    className="scroll-zoom w-full aspect-[16/9] lg:aspect-[21/9] object-cover"
                />
            </Reveal>

            <Reveal as="dl" className="grid grid-cols-3 border-b border-black mt-4 pb-4 gap-4">
                {[
                    ["Location", "Woodstock, Cape Town"],
                    ["Founded", "2023"],
                    ["Style", "Contemporary streetwear"],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-mute text-sm">{label}</dt>
                        <dd className="font-bold">{value}</dd>
                    </div>
                ))}
            </Reveal>
        </section>
    );
}
