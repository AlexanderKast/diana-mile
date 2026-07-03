export type NormalizedPhone = {
  digits: string;
  e164: string;
  display: string;
};

export function normalizeColombianMobile(input: string): NormalizedPhone | null {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("0057")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("57") && digits.length === 12) {
    digits = digits.slice(2);
  }

  if (!/^3\d{9}$/.test(digits)) {
    return null;
  }

  return {
    digits,
    e164: `+57${digits}`,
    display: `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`,
  };
}
