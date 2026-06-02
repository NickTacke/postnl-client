import { BaseResource } from "../../core/base-resource";
import {
  type ConfirmingRequest,
  type ConfirmingResponse,
  type LabellingRequest,
  type LabellingResponse,
  confirmingRequestSchema,
  confirmingResponseSchema,
  labellingRequestSchema,
  labellingResponseSchema,
} from "./legacy-schema";

export interface LabelLegacyOptions {
  // confirm the shipment in the same call; defaults true (sdk default)
  confirm?: boolean;
}

export class ShippingLegacyResource extends BaseResource {
  // POST /shipment/v2_2/label; confirm query param defaults true
  label(input: LabellingRequest, options?: LabelLegacyOptions): Promise<LabellingResponse> {
    return this.call({
      operation: "shippingLabelLegacy",
      query: { confirm: options?.confirm ?? true },
      input,
      requestSchema: labellingRequestSchema,
      responseSchema: labellingResponseSchema,
    });
  }

  // POST /shipment/v2/confirm
  confirm(input: ConfirmingRequest): Promise<ConfirmingResponse> {
    return this.call({
      operation: "shippingConfirmLegacy",
      input,
      requestSchema: confirmingRequestSchema,
      responseSchema: confirmingResponseSchema,
    });
  }
}
