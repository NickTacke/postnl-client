// legacy productcodedelivery is a free-form string; common codes for convenience.
// v4 uses product names (server-resolved), no code needed.
export const ProductCode = {
  domesticParcel: "3085",
  domesticInsured: "3087",
  easyReturn: "4910",
} as const;
export type ProductCodeValue = (typeof ProductCode)[keyof typeof ProductCode];
