import { BaseResource } from "../../core/base-resource";
import {
  type BarcodeV4Request,
  type BarcodeV4Response,
  barcodeV4RequestSchema,
  barcodeV4ResponseSchema,
} from "./schema";

export class BarcodeResource extends BaseResource {
  // legacy added in slice 4

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
