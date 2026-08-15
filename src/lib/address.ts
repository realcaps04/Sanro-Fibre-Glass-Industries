export function composeCustomerAddress(input: {
  houseName?: string;
  place?: string;
  pincode?: string;
}): string {
  return [input.houseName, input.place, input.pincode]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}
