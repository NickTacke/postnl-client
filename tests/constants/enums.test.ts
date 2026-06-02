import { describe, expect, it } from "bun:test";
import {
  BarcodeType,
  CheckoutWarningOption,
  LabellingCurrency,
  OutputType,
  Resolution,
  ReturnPeriodV4,
  ShipmentTypeV4,
  StatusLanguage,
} from "../../src/constants/enums";
import { ProductCode } from "../../src/constants/product";

describe("enums", () => {
  it("barcode types", () => expect(BarcodeType).toContain("3S"));
  it("output types", () => expect(OutputType).toEqual(["zpl", "pdf", "gif", "jpg", "png"]));
  it("resolutions are numeric", () => expect(Resolution).toEqual([200, 300, 600]));
  it("v4 return periods are numeric", () => expect(ReturnPeriodV4).toEqual([20, 35]));
  it("v4 shipment types", () => expect(ShipmentTypeV4).toContain("parcel"));
  it("status language adds cn/de", () => {
    expect(StatusLanguage).toContain("CN");
    expect(StatusLanguage).toContain("DE");
  });
  it("checkout warning option keeps 08:00-09:00", () =>
    expect(CheckoutWarningOption).toContain("08:00-09:00"));
  it("labelling currency keeps upstream USS typo and omits USD", () =>
    expect(LabellingCurrency).toEqual(["EUR", "USS"]));
});

describe("product codes", () => {
  it("exposes legacy domestic parcel code", () => expect(ProductCode.domesticParcel).toBe("3085"));
});
