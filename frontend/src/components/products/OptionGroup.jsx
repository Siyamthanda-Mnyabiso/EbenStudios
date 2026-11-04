import { useId } from "react";

// A labelled set of choices (sizes or colours) as radio pills.
// Native radios keep keyboard and screen reader behaviour for free.
export default function OptionGroup({ legend, options, value, onChange, error }) {
    const name = useId();

    return (
        <fieldset className="mb-6">
            <legend className="font-bold mb-3">
                {legend}
                {value && <span className="font-normal text-ink-soft">, {value}</span>}
            </legend>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <label key={option} className="cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={value === option}
                            onChange={() => onChange(option)}
                            className="peer sr-only"
                        />
                        <span
                            className={`inline-flex items-center justify-center min-w-12 min-h-12 px-5 rounded-full border font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-700 ${
                                value === option
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-black/30 hover:border-black"
                            }`}
                        >
                            {option}
                        </span>
                    </label>
                ))}
            </div>

            {error && <p role="alert" className="field-error mt-2">{error}</p>}
        </fieldset>
    );
}
