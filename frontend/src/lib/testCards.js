// Simulated payments. Nothing here talks to a bank: the card number only decides
// whether the test payment succeeds or is declined.

export const TEST_CARDS = [
    { number: "4242 4242 4242 4242", label: "Payment succeeds" },
    { number: "4000 0000 0000 0002", label: "Card declined" },
];

const DECLINED = new Set(["4000000000000002"]);

export function digitsOnly(value) {
    return String(value).replace(/\D/g, "");
}

// "4242424242424242" -> "4242 4242 4242 4242" while typing.
export function formatCardNumber(value) {
    return digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "1228" -> "12/28" while typing.
export function formatExpiry(value) {
    const digits = digitsOnly(value).slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function passesLuhn(digits) {
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
        let digit = Number(digits[digits.length - 1 - i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }

    return sum % 10 === 0;
}

// Returns an error message, or null when the details would be accepted.
export function checkCard({ name, number, expiry, cvc }, today = new Date()) {
    const digits = digitsOnly(number);

    if (!name.trim()) return "Enter the name on the card.";
    if (digits.length !== 16 || !passesLuhn(digits)) return "Enter a valid 16-digit card number.";

    const [month, year] = expiry.split("/").map(Number);
    if (!month || month > 12 || year === undefined || Number.isNaN(year)) return "Enter the expiry date as MM/YY.";

    const endOfMonth = new Date(2000 + year, month, 1);
    if (endOfMonth <= today) return "This card has expired.";

    if (!/^\d{3}$/.test(cvc)) return "Enter the 3-digit security code.";
    if (DECLINED.has(digits)) return "Your card was declined. Try another card.";

    return null;
}
