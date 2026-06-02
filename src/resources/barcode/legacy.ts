import { z } from "zod";
import type { BarcodeType } from "../../constants/enums";
import { BaseResource } from "../../core/base-resource";

// legacy barcode is GET with query params; response BarcodeResponse { Barcode }
const responseSchema = z.object({ Barcode: z.string() }).transform((r) => ({ barcode: r.Barcode }));

export interface BarcodeLegacyInput {
  customerCode: string;
  customerNumber: string;
  type: BarcodeType;
  serie?: string;
  range?: string;
}

export class BarcodeLegacyResource extends BaseResource {
  generate(input: BarcodeLegacyInput): Promise<{ barcode: string }> {
    return this.call({
      operation: "barcodeLegacy",
      query: {
        CustomerCode: input.customerCode,
        CustomerNumber: input.customerNumber,
        Type: input.type,
        Serie: input.serie,
        Range: input.range,
      },
      responseSchema,
    });
  }
}
