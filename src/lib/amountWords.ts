const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function chunkToWords(value: number): string {
  if (value < 20) return ones[value];
  if (value < 100) {
    const remainder = value % 10;
    return `${tens[Math.floor(value / 10)]}${remainder ? ` ${ones[remainder]}` : ""}`;
  }
  const remainder = value % 100;
  return `${ones[Math.floor(value / 100)]} Hundred${remainder ? ` ${chunkToWords(remainder)}` : ""}`;
}

export function amountInWords(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  if (rounded === 0) return "Zero Rupees only";

  const crore = Math.floor(rounded / 1_00_00_000);
  const lakh = Math.floor((rounded % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((rounded % 1_00_000) / 1000);
  const rest = rounded % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${chunkToWords(crore)} Crore`);
  if (lakh) parts.push(`${chunkToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${chunkToWords(thousand)} Thousand`);
  if (rest) parts.push(chunkToWords(rest));

  return `${parts.join(" ")} Rupees only`;
}
