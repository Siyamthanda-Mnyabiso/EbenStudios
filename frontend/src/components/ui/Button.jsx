import { Link } from "react-router-dom";

const baseStyles =
    "inline-flex items-center justify-center gap-3 whitespace-nowrap min-h-12 px-8 rounded-full font-semibold border transition-colors duration-200 disabled:opacity-60";

const variants = {
    // One black pill per section.
    primary: "bg-black border-black text-white hover:bg-neutral-700 hover:border-neutral-700",
    secondary: "bg-transparent border-black/30 text-black hover:bg-black hover:text-white hover:border-black",
    outline: "bg-transparent border-black/30 text-black hover:bg-black hover:text-white hover:border-black",
    // For dark or photographic backgrounds.
    inverse: "bg-white border-white text-black hover:bg-neutral-200 hover:border-neutral-200",
};

export default function Button({ children, variant = "primary", to, className = "", ...props }) {
    const classes = `${baseStyles} ${variants[variant]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
