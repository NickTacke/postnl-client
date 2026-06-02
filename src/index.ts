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
export type { BarcodeV4Request, BarcodeV4Response } from "./resources/barcode/schema";
export type {
  ShipmentV4Request,
  LabellingV4Request,
  ConfirmV4Request,
  ShipmentPostResponse,
} from "./resources/shipping/schema";
export type { ReturnGenerateRequest } from "./resources/return/schema";
