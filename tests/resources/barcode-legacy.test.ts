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

describe("barcode.legacy.generate", () => {
  it("GETs legacy barcode with query params and returns { barcode }", async () => {
    const fetchMock = mockFetch(200, { Barcode: "3SDEVC1234567" });
    const client = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await client.barcode.legacy.generate({
      customerCode: "DEVC",
      customerNumber: "11223344",
      type: "3S",
      serie: "100000-200000",
    });
    expect(out).toEqual({ barcode: "3SDEVC1234567" });
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/v1_1/barcode");
    expect(req[0]).toContain("CustomerCode=DEVC");
    expect(req[0]).toContain("CustomerNumber=11223344");
    expect(req[0]).toContain("Type=3S");
    expect(req[0]).toContain("Serie=100000-200000");
    expect(req[1].method).toBe("GET");
  });
});
