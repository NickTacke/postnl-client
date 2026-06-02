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

describe("barcode.generate (v4)", () => {
  it("posts to v4 barcode and returns barcodes", async () => {
    const fetchMock = mockFetch(200, { barcodes: ["3SDEVC090807060"] });
    const client = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await client.barcode.generate({ customerNumber: "11", customerCode: "DEVC" });
    expect(out.barcodes).toEqual(["3SDEVC090807060"]);
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/delivery/v4/barcode");
    expect(req[1].method).toBe("POST");
  });

  it("applies sdk defaults to the request body", async () => {
    const fetchMock = mockFetch(200, { barcodes: ["3SX"] });
    const client = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await client.barcode.generate({ customerNumber: "11", customerCode: "DEVC" });
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(req[1].body as string);
    expect(body).toEqual({
      customerNumber: "11",
      customerCode: "DEVC",
      serieStart: "000000000",
      serieEnd: "999999999",
      numberOfBarcodes: 1,
    });
  });
});
