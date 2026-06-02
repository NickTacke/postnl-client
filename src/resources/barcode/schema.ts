import { z } from "zod";

// request: mirror sdk Barcode model (camelCase, native types)
export const barcodeV4RequestSchema = z.object({
  customerNumber: z.string(),
  customerCode: z.string(),
  serieStart: z.string().default("000000000"),
  serieEnd: z.string().default("999999999"),
  numberOfBarcodes: z.number().int().min(1).default(1),
});
export type BarcodeV4Request = z.input<typeof barcodeV4RequestSchema>;

// response: BarcodePostResponse { barcodes: string[] }
export const barcodeV4ResponseSchema = z.object({
  barcodes: z.array(z.string()).default([]),
});
export type BarcodeV4Response = z.infer<typeof barcodeV4ResponseSchema>;
