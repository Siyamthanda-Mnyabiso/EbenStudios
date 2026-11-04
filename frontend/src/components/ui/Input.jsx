import { useId } from "react";

// Label sits above the field. Required fields are marked in the label text itself.
export default function Input({ label, optional = false, hint, className = "", ...props }) {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;

    return (
        <div className={className}>
            <label htmlFor={id} className="field-label">
                {label}
                {optional && <span className="font-normal text-mute"> (optional)</span>}
            </label>
            {hint && (
                <p id={hintId} className="text-mute mb-2">
                    {hint}
                </p>
            )}
            <input id={id} aria-describedby={hintId} required={!optional} className="field" {...props} />
        </div>
    );
}
