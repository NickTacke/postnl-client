import type { Family, HttpMethod } from "./types";

export interface Endpoint {
  family: Family;
  method: HttpMethod;
  path: string;
}
const e = (family: Family, method: HttpMethod, path: string): Endpoint => ({
  family,
  method,
  path,
});

export const ENDPOINTS = {
  barcodeV4: e("v4", "POST", "/shipment/delivery/v4/barcode"),
  shippingCreate: e("v4", "POST", "/shipment/delivery/v4/labelconfirm"),
  shippingLabelV4: e("v4", "POST", "/shipment/delivery/v4/label"),
  shippingConfirmV4: e("v4", "POST", "/shipment/delivery/v4/confirm"),
  returnGenerate: e("v4", "POST", "/shipment/delivery/v4/return/generate"),
  barcodeLegacy: e("legacy", "GET", "/shipment/v1_1/barcode"),
  shippingLabelLegacy: e("legacy", "POST", "/shipment/v2_2/label"),
  shippingConfirmLegacy: e("legacy", "POST", "/shipment/v2/confirm"),
  trackingByBarcode: e("legacy", "GET", "/shipment/v2/status/barcode/{barcode}"),
  trackingByReference: e("legacy", "GET", "/shipment/v2/status/reference/{referenceId}"),
  trackingSignature: e("legacy", "GET", "/shipment/v2/status/signature/{barcode}"),
  trackingUpdated: e("legacy", "GET", "/shipment/v2/status/{customernumber}/updatedshipments"),
  deliveryDateCalculate: e("legacy", "GET", "/shipment/v2_2/calculate/date/delivery"),
  deliveryDateSent: e("legacy", "GET", "/shipment/v2_2/calculate/date/shipping"),
  timeframeGet: e("legacy", "GET", "/shipment/v2_1/calculate/timeframes"),
  locationNearest: e("legacy", "GET", "/shipment/v2_1/locations/nearest"),
  locationNearestByGeocode: e("legacy", "GET", "/shipment/v2_1/locations/nearest/geocode"),
  locationArea: e("legacy", "GET", "/shipment/v2_1/locations/area"),
  locationLookup: e("legacy", "GET", "/shipment/v2_1/locations/lookup"),
  checkoutGet: e("legacy", "POST", "/shipment/v1/checkout"),
  addressCheck: e("legacy", "GET", "/shipment/checkout/v1/postalcodecheck"),
} as const satisfies Record<string, Endpoint>;

export type OperationKey = keyof typeof ENDPOINTS;
