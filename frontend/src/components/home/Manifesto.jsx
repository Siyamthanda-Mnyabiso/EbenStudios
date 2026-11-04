import Reveal from "../ui/Reveal";

export default function Manifesto() {
    return (
        <section className="bg-black text-white">
            <Reveal className="page page-section">
                <p className="eyebrow !text-white/70 mb-6">Our story</p>

                <blockquote className="font-display font-extrabold tracking-tight leading-[1.05] text-[clamp(1.75rem,4vw,3.5rem)] max-w-5xl">
                    Nested in the heart of Woodstock, we make streetwear shaped by culture, movement and
                    self expression.
                </blockquote>
            </Reveal>
        </section>
    );
}
