import { useEffect } from "react";

const SITE = "Eben Studios";

// Sets the browser tab title, e.g. "Shop | Eben Studios". No title means the home page.
export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | ${SITE}` : `${SITE} | Streetwear from Cape Town`;
    }, [title]);
}
