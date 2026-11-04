import { useEffect, useRef, useState } from "react";

// Fades and lifts its children into place the first time they scroll into view.
// Without IntersectionObserver (or with reduced motion) content is simply visible.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...props }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(
        () => typeof IntersectionObserver === "undefined"
    );

    useEffect(() => {
        const node = ref.current;

        if (!node || visible) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <Tag
            ref={ref}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
            className={`reveal ${visible ? "is-visible" : ""} ${className}`}
            {...props}
        >
            {children}
        </Tag>
    );
}
