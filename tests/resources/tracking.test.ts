import { describe, expect, it, mock } from "bun:test";
import { PostNLClient } from "../../src/index";

function mockFetch(status: number, body: unknown) {
  return mock(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
    ),
  );
}

const url = (m: ReturnType<typeof mockFetch>) =>
  (m.mock.calls[0] as unknown as [string, RequestInit])[0];

describe("tracking.byBarcode", () => {
  it("hits status/barcode path with detail+language query", async () => {
    const fetchMock = mockFetch(200, { CurrentStatus: { Shipment: { Barcode: "3SX" } } });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.tracking.byBarcode("3SX", { detail: true, language: "EN" });
    expect(url(fetchMock)).toContain("/shipment/v2/status/barcode/3SX?detail=true&language=EN");
  });

  it("parses stringified ShipmentAmount to number and normalizes single Event to array", async () => {
    const fetchMock = mockFetch(200, {
      CompleteStatus: {
        Shipment: {
          Barcode: "3SX",
          ShipmentAmount: "2",
          ShipmentCounter: "1",
          Dimension: { Weight: "2500" },
          Event: {
            Code: "01",
            TimeStamp: "07-11-2022 19:10:28",
          },
          Status: { StatusCode: "7", TimeStamp: "07-11-2022 19:10:28" },
        },
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.byBarcode("3SX", { detail: true });
    expect(out.completeStatus?.shipmentAmount).toBe(2);
    expect(out.completeStatus?.shipmentCounter).toBe(1);
    expect(out.completeStatus?.dimension?.weight).toBe(2500);
    expect(out.completeStatus?.events).toHaveLength(1);
    expect(out.completeStatus?.events?.[0]?.code).toBe("01");
    expect(out.completeStatus?.events?.[0]?.timeStamp).toBeInstanceOf(Date);
    // status codes stay strings
    expect(out.completeStatus?.status?.statusCode).toBe("7");
  });

  it("normalizes top-level Warnings single object to array", async () => {
    const fetchMock = mockFetch(200, {
      CurrentStatus: { Shipment: { Barcode: "3SX" } },
      Warnings: { Code: "1", Message: "heads up" },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.byBarcode("3SX");
    expect(out.warnings).toHaveLength(1);
    expect(out.warnings[0]?.message).toBe("heads up");
  });

  it("accepts a null date value and normalizes it to undefined", async () => {
    const fetchMock = mockFetch(200, {
      CurrentStatus: { Shipment: { Barcode: "3SX", DeliveryDate: null } },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.byBarcode("3SX");
    expect(out.currentStatus?.deliveryDate).toBeUndefined();
  });

  it("accepts an empty CurrentStatus (no shipment found) with warnings", async () => {
    // live shape for a not-yet-scanned barcode: { CurrentStatus: {}, Warnings: [...] }
    const fetchMock = mockFetch(200, {
      CurrentStatus: {},
      Warnings: [{ Message: "No shipment found", Code: "2" }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.byBarcode("3SX");
    expect(out.currentStatus).toBeUndefined();
    expect(out.warnings[0]?.message).toBe("No shipment found");
  });

  it("unwraps ProductOptions single-object wrapper", async () => {
    const fetchMock = mockFetch(200, {
      CurrentStatus: {
        Shipment: {
          Barcode: "3SX",
          ProductOptions: { ProductOption: { OptionCode: "118", CharacteristicCode: "002" } },
        },
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.byBarcode("3SX");
    expect(out.currentStatus?.productOptions).toHaveLength(1);
    expect(out.currentStatus?.productOptions?.[0]?.optionCode).toBe("118");
  });
});

describe("tracking.byReference", () => {
  it("requires customerCode and customerNumber and sends them as query", async () => {
    const fetchMock = mockFetch(200, { CurrentStatus: { Shipment: { Barcode: "3SX" } } });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.tracking.byReference("REF1", { customerCode: "DEVC", customerNumber: "11" });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2/status/reference/REF1");
    expect(u).toContain("customerCode=DEVC");
    expect(u).toContain("customerNumber=11");
  });
});

describe("tracking.signature", () => {
  it("decodes SignatureImage to image/gif label", async () => {
    const fetchMock = mockFetch(200, {
      Signature: {
        Barcode: "3SX",
        SignatureDate: "07-11-2022 19:10:28",
        SignatureImage: btoa("GIF89a"),
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.signature("3SX");
    expect(url(fetchMock)).toContain("/shipment/v2/status/signature/3SX");
    expect(out.signature?.signatureImage?.contentType).toBe("image/gif");
    expect(new TextDecoder().decode(out.signature?.signatureImage?.bytes())).toBe("GIF89a");
  });

  it("accepts an empty Signature (no signature found) with bare-array warnings", async () => {
    // live shape: { Signature: {}, Warnings: [{Message,Code}] }
    const fetchMock = mockFetch(200, {
      Signature: {},
      Warnings: [{ Message: "No signature found", Code: "2" }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.signature("3SX");
    // empty Signature {} must be omitted, not surfaced as a truthy empty object
    expect(out.signature).toBeUndefined();
    expect(out.warnings).toHaveLength(1);
    expect(out.warnings[0]?.message).toBe("No signature found");
  });

  it("unwraps signature Warnings.Warning wrapper", async () => {
    const fetchMock = mockFetch(200, {
      Signature: { Barcode: "3SX" },
      Warnings: { Warning: { Message: "warn", Code: "1" } },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.signature("3SX");
    expect(out.warnings).toHaveLength(1);
    expect(out.warnings[0]?.message).toBe("warn");
    expect(out.warnings[0]?.code).toBe("1");
  });
});

describe("tracking.updated", () => {
  it("emits two repeated period query params", async () => {
    const fetchMock = mockFetch(200, [
      { Barcode: "3SX", Status: { StatusCode: "7", Timestamp: "2022-12-25T10:00:00" } },
    ]);
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.tracking.updated("11223344", {
      period: ["2022-12-25T10:00:00", "2022-12-25T10:12:00"],
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2/status/11223344/updatedshipments");
    expect(u).toContain("period=2022-12-25T10%3A00%3A00");
    expect(u).toContain("period=2022-12-25T10%3A12%3A00");
    expect(out).toHaveLength(1);
    expect(out[0]?.barcode).toBe("3SX");
    expect(out[0]?.status?.statusCode).toBe("7");
  });
});
