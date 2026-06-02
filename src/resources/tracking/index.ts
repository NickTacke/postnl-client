import type { StatusLanguage } from "../../constants/enums";
import { BaseResource } from "../../core/base-resource";
import {
  type ShippingStatusResponse,
  type SignatureResponse,
  type UpdatedShipmentsResponse,
  shippingStatusResponseSchema,
  signatureResponseSchema,
  updatedShipmentsResponseSchema,
} from "./schema";

export interface TrackingOptions {
  // include old statuses (complete status); postnl expects "true"/"false" string
  detail?: boolean;
  language?: StatusLanguage;
  maxDays?: string;
}

export interface TrackingByReferenceOptions extends TrackingOptions {
  customerCode: string;
  customerNumber: string;
}

export interface UpdatedShipmentsOptions {
  // [from, to]; emitted as two repeated period query params
  period: [string, string];
}

export class TrackingResource extends BaseResource {
  // GET /shipment/v2/status/barcode/{barcode}
  byBarcode(barcode: string, options?: TrackingOptions): Promise<ShippingStatusResponse> {
    return this.call({
      operation: "trackingByBarcode",
      pathParams: { barcode },
      query: {
        detail: options?.detail,
        language: options?.language,
        maxDays: options?.maxDays,
      },
      responseSchema: shippingStatusResponseSchema,
    });
  }

  // GET /shipment/v2/status/reference/{referenceId}; customerCode + customerNumber required
  byReference(
    referenceId: string,
    options: TrackingByReferenceOptions,
  ): Promise<ShippingStatusResponse> {
    return this.call({
      operation: "trackingByReference",
      pathParams: { referenceId },
      query: {
        customerCode: options.customerCode,
        customerNumber: options.customerNumber,
        detail: options.detail,
        language: options.language,
        maxDays: options.maxDays,
      },
      responseSchema: shippingStatusResponseSchema,
    });
  }

  // GET /shipment/v2/status/signature/{barcode}
  signature(barcode: string): Promise<SignatureResponse> {
    return this.call({
      operation: "trackingSignature",
      pathParams: { barcode },
      responseSchema: signatureResponseSchema,
    });
  }

  // GET /shipment/v2/status/{customernumber}/updatedshipments; two repeated period params
  updated(
    customerNumber: string,
    options: UpdatedShipmentsOptions,
  ): Promise<UpdatedShipmentsResponse> {
    return this.call({
      operation: "trackingUpdated",
      pathParams: { customernumber: customerNumber },
      query: { period: options.period },
      responseSchema: updatedShipmentsResponseSchema,
    });
  }
}
