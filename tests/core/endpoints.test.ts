import { describe, expect, it } from "bun:test";
import { ENDPOINTS } from "../../src/core/endpoints";

describe("ENDPOINTS", () => {
  it("maps v4 paths under /shipment/delivery/v4", () => {
    expect(ENDPOINTS.barcodeV4).toEqual({
      family: "v4",
      method: "POST",
      path: "/shipment/delivery/v4/barcode",
    });
    expect(ENDPOINTS.shippingCreate.path).toBe("/shipment/delivery/v4/labelconfirm");
    expect(ENDPOINTS.shippingLabelV4.path).toBe("/shipment/delivery/v4/label");
    expect(ENDPOINTS.shippingConfirmV4.path).toBe("/shipment/delivery/v4/confirm");
    expect(ENDPOINTS.returnGenerate.path).toBe("/shipment/delivery/v4/return/generate");
  });
  it("maps legacy version segments exactly", () => {
    expect(ENDPOINTS.barcodeLegacy).toEqual({
      family: "legacy",
      method: "GET",
      path: "/shipment/v1_1/barcode",
    });
    expect(ENDPOINTS.shippingLabelLegacy.path).toBe("/shipment/v2_2/label");
    expect(ENDPOINTS.shippingConfirmLegacy.path).toBe("/shipment/v2/confirm");
    expect(ENDPOINTS.trackingByBarcode.path).toBe("/shipment/v2/status/barcode/{barcode}");
    expect(ENDPOINTS.deliveryDateCalculate.path).toBe("/shipment/v2_2/calculate/date/delivery");
    expect(ENDPOINTS.timeframeGet.path).toBe("/shipment/v2_1/calculate/timeframes");
    expect(ENDPOINTS.locationNearest.path).toBe("/shipment/v2_1/locations/nearest");
    expect(ENDPOINTS.checkoutGet.path).toBe("/shipment/v1/checkout");
    expect(ENDPOINTS.addressCheck.path).toBe("/shipment/checkout/v1/postalcodecheck");
  });
});
