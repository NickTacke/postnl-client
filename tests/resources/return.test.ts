import { describe, expect, it, mock } from "bun:test";
import { PostNLClient } from "../../src/index";

const f = (body: unknown) =>
  mock(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ),
  );

const input = {
  receiver: {
    customer: { customerNumber: "11", customerCode: "DEVC", address: { countryIso: "NL" } },
  },
  sender: {
    address: {
      countryIso: "NL",
      city: "Amsterdam",
      postalCode: "1011AB",
      street: "Dam",
      houseNumber: "1",
    },
  },
  labelSettings: { outputType: "pdf" as const, printMethod: "retailPrint" as const },
  shipmentType: "parcel" as const,
};

describe("return.generate (v4)", () => {
  it("posts to v4 return/generate and decodes labels", async () => {
    const fetchMock = f({
      items: [{ barcode: "3SX", labels: [{ label: btoa("PDF"), outputType: "pdf" }] }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.return.generate(input);
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/delivery/v4/return/generate");
    expect(req[1].method).toBe("POST");
    expect(out.items[0]?.labels?.[0]?.contentType).toBe("application/pdf");
  });
});
