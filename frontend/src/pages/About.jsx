import heroImage from "../assets/hero_img.png";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function About() {
    useDocumentTitle("About");
    return (
        <section className="page page-section">
            <PageHeader eyebrow="Our story" title="About Eben Studios" />

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                <img
                    src={heroImage}
                    alt="Eben Studios streetwear"
                    className="lg:col-span-7 w-full aspect-[4/3] object-cover"
                />

                <div className="lg:col-span-5 text-lg text-ink-soft space-y-6 max-w-prose">
                    <p className="text-3xl font-bold tracking-tight text-ink leading-tight">
                        Nested in the heart of Woodstock.
                    </p>
                    <p>
                        Eben Studios delivers modern streetwear inspired by culture, movement and
                        self expression. Founded in 2023, we design contemporary streetwear for
                        creators, visionaries and individuals inspired by urban culture.
                    </p>
                    <Button to="/shop">Shop the collection</Button>
                </div>
            </div>
        </section>
    );
}
