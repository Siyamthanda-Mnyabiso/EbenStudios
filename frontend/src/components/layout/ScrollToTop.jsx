import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Opening a new page starts at the top. Changing only the query (shop filters) keeps the scroll.
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
