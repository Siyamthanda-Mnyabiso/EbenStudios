import Reveal from "./Reveal";

export default function PageHeader({ eyebrow, title, children }) {
    return (
        <Reveal as="header" className="border-b border-black pb-8 mb-12">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="display">{title}</h1>
            {children && <div className="mt-4 text-lg text-ink-soft max-w-2xl">{children}</div>}
        </Reveal>
    );
}
