import PageHeader from "../components/ui/PageHeader";

export default function Contact() {
    return (
        <section className="page page-section">
            <PageHeader eyebrow="Get in touch" title="Contact us" />

            <dl className="max-w-2xl border-t border-ink">
                <div className="grid sm:grid-cols-3 gap-2 py-6 border-b border-line">
                    <dt className="eyebrow">Studio</dt>
                    <dd className="sm:col-span-2 title">Woodstock, Cape Town, South Africa</dd>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 py-6 border-b border-line">
                    <dt className="eyebrow">Email</dt>
                    <dd className="sm:col-span-2 title">
                        <a href="mailto:hello@ebenstudios.com" className="hover:text-ember underline underline-offset-4">
                            hello@ebenstudios.com
                        </a>
                    </dd>
                </div>
            </dl>
        </section>
    );
}
