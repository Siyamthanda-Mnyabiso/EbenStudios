import { useState } from "react";
import { ArrowRight } from "lucide-react";

import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        setEmail("");
    }

    return (
        <section className="page page-section">
            <Reveal className="grid lg:grid-cols-12 gap-10 border-t border-black pt-8">
                <div className="lg:col-span-6">
                    <p className="eyebrow mb-3">Stay connected</p>
                    <h2 className="headline mb-4">Join the movement</h2>
                    <p className="text-lg text-ink-soft max-w-md">
                        Be first to hear about new drops, restocks and Eben Studios events in Cape Town.
                    </p>
                </div>

                <div className="lg:col-span-5 lg:col-start-8 self-end">
                    {submitted ? (
                        <p role="status" className="title">
                            You&apos;re on the list. Welcome to Eben Studios.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="newsletter-email" className="field-label">
                                    Email address
                                </label>
                                <input
                                    id="newsletter-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="field"
                                />
                            </div>

                            <div>
                                <Button type="submit">
                                    Subscribe
                                    <ArrowRight size={18} aria-hidden="true" />
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Reveal>
        </section>
    );
}
