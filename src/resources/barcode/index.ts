import { BaseResource } from "../../core/base-resource";
import { BarcodeLegacyResource } from "./legacy";
import {
  type BarcodeV4Request,
  type BarcodeV4Response,
  barcodeV4RequestSchema,
  barcodeV4ResponseSchema,
} from "./schema";

export class BarcodeResource extends BaseResource {
  // legacy barcode generation (GET /shipment/v1_1/barcode)
  readonly legacy = new BarcodeLegacyResource(this.transport);

  // v4 server-side barcode generation
  generate(input: BarcodeV4Request): Promise<BarcodeV4Response> {
    return this.call({
      operation: "barcodeV4",
      input,
      requestSchema: barcodeV4RequestSchema,
      responseSchema: barcodeV4ResponseSchema,
    });
  }
}
