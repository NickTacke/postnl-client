import { describe, expect, it, mock } from "bun:test";
import { PostNLValidationError } from "../../src/core/errors";
import { PostNLClient } from "../../src/index";
import { isoDate } from "../../src/resources/shipping/schema";

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
  sender: { customerNumber: "11", customerCode: "DEVC", address: { countryIso: "NL" } },
  receiver: {
    address: {
      countryIso: "NL",
      city: "Amsterdam",
      postalCode: "1011AB",
      street: "Dam",
      houseNumber: "1",
    },
  },
  shipmentType: "parcel" as const,
};

describe("shipping v4", () => {
  it("create -> labelconfirm", async () => {
    const fetchMock = f({ items: [{ barcode: "3SX" }] });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.shipping.create(input);
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/delivery/v4/labelconfirm");
    expect(req[1].method).toBe("POST");
  });

  it("label -> /label and decodes label", async () => {
    const fetchMock = f({
      items: [{ barcode: "3SX", labels: [{ content: btoa("PDF"), outputType: "pdf" }] }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.shipping.label(input);
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/delivery/v4/label");
    expect(out.items[0]?.labels?.[0]?.contentType).toBe("application/pdf");
    expect(new TextDecoder().decode(out.items[0]?.labels?.[0]?.bytes())).toBe("PDF");
  });

  it("decodes the sdk `label` base64 key too", async () => {
    const fetchMock = f({
      items: [{ barcode: "3SX", labels: [{ label: btoa("PDF"), outputType: "pdf" }] }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.shipping.label(input);
    expect(out.items[0]?.labels?.[0]?.contentType).toBe("application/pdf");
  });

  it("parses productService.services as a string list (live v4 shape)", async () => {
    const fetchMock = f({
      items: [
        {
          barcode: "3SX",
          productService: {
            productData: "Parcels Netherlands",
            services: ["Delivery at neighbours"],
          },
        },
      ],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.shipping.create(input);
    expect(out.items[0]?.productService?.services).toEqual(["Delivery at neighbours"]);
  });

  it("confirm -> /confirm", async () => {
    const fetchMock = f({ items: [{ barcode: "3SX" }] });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.shipping.confirm(input);
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/delivery/v4/confirm");
  });

  it("formats a handOverDate Date to yyyy-MM-dd", async () => {
    const fetchMock = f({ items: [{ barcode: "3SX" }] });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.shipping.create({ ...input, handOverDate: new Date(2026, 5, 2) });
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(req[1].body as string);
    expect(body.handOverDate).toBe("2026-06-02");
  });

  it("rejects an invalid handOverDate Date", async () => {
    const fetchMock = f({ items: [{ barcode: "3SX" }] });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await expect(
      c.shipping.create({ ...input, handOverDate: new Date("nope") }),
    ).rejects.toBeInstanceOf(PostNLValidationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("isoDate schema", () => {
  it("formats a valid Date to yyyy-MM-dd", () => {
    expect(isoDate.parse(new Date(2026, 5, 2))).toBe("2026-06-02");
  });

  it("rejects an invalid Date", () => {
    expect(isoDate.safeParse(new Date("nope")).success).toBe(false);
  });

  it("rejects a malformed bare string", () => {
    expect(isoDate.safeParse("2026/06/02").success).toBe(false);
  });

  it("accepts a valid bare string passthrough", () => {
    expect(isoDate.parse("2026-06-02")).toBe("2026-06-02");
  });
});
