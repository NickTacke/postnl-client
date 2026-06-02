export const version = "0.1.0";

export { PostNLClient } from "./client";
export type { PostNLClientOptions } from "./config";
export * from "./core/errors";
export { decodeBase64, labelContentType, toDecodedLabel } from "./core/base64";
export type { DecodedLabel } from "./core/base64";
export * from "./constants/enums";
export * from "./constants/product";

export { BarcodeResource } from "./resources/barcode";
export { ShippingResource } from "./resources/shipping";
export { ReturnResource } from "./resources/return";
export { TrackingResource } from "./resources/tracking";
export { DeliveryDateResource } from "./resources/delivery-date";
export type {
  DeliveryDateCalculateInput,
  SentDateInput,
} from "./resources/delivery-date";
export type {
  DeliveryDateResponse,
  SentDateResponse,
} from "./resources/delivery-date/schema";
export { TimeframeResource } from "./resources/timeframe";
export type { TimeframeGetInput } from "./resources/timeframe";
export type { TimeframeResponse } from "./resources/timeframe/schema";
export { LocationResource } from "./resources/location";
export type {
  LocationNearestInput,
  LocationNearestByGeocodeInput,
  LocationAreaInput,
  LocationLookupInput,
} from "./resources/location";
export type {
  Location,
  LocationsResponse,
  LocationLookupResponse,
} from "./resources/location/schema";
export { CheckoutResource } from "./resources/checkout";
export type {
  CheckoutRequestInput,
  CheckoutCutOffTimeInput,
  CheckoutAddressInput,
  CheckoutResponse,
} from "./resources/checkout/schema";
export type {
  TrackingOptions,
  TrackingByReferenceOptions,
  UpdatedShipmentsOptions,
} from "./resources/tracking";
export type {
  ShippingStatusResponse,
  SignatureResponse,
  SignatureImage,
  UpdatedShipmentsResponse,
  UpdatedShipment,
} from "./resources/tracking/schema";
export type { BarcodeV4Request, BarcodeV4Response } from "./resources/barcode/schema";
export type { BarcodeLegacyInput } from "./resources/barcode/legacy";
export type {
  ShipmentV4Request,
  LabellingV4Request,
  ConfirmV4Request,
  ShipmentPostResponse,
} from "./resources/shipping/schema";
export type { ReturnGenerateRequest } from "./resources/return/schema";
export type {
  LabellingRequest,
  LabellingResponse,
  ConfirmingRequest,
  ConfirmingResponse,
} from "./resources/shipping/legacy-schema";
export type { LabelLegacyOptions } from "./resources/shipping/legacy";
