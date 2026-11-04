import Button from "../components/ui/Button";

export default function NotFound() {
    return (
        <section className="page page-section">
            <p className="eyebrow mb-3">Error 404</p>
            <h1 className="display mb-8">Lost in Woodstock</h1>
            <p className="text-lg text-ink-soft max-w-xl mb-10">
                The page you are looking for does not exist or has moved.
            </p>
            <Button to="/">Back to home</Button>
        </section>
    );
}
