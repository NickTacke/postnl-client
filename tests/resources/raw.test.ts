import { describe, expect, it, mock } from "bun:test";
import { z } from "zod";
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

describe("client.request", () => {
  it("performs a typed raw call", async () => {
    const fetchMock = mockFetch(200, { Barcode: "3SX" });
    const client = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await client.request({
      family: "legacy",
      method: "GET",
      path: "/shipment/v1_1/barcode",
      query: { CustomerCode: "DEVC" },
      schema: z.object({ Barcode: z.string() }),
    });
    expect(out.Barcode).toBe("3SX");
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/v1_1/barcode?CustomerCode=DEVC");
    expect(req[1].method).toBe("GET");
  });

  it("returns the raw body as-is when no schema is given", async () => {
    const fetchMock = mockFetch(200, { Barcode: "3SX" });
    const client = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await client.request<{ Barcode: string }>({
      family: "legacy",
      method: "GET",
      path: "/shipment/v1_1/barcode",
    });
    expect(out).toEqual({ Barcode: "3SX" });
  });
});
