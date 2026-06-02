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

const labelInput = {
  customer: {
    customerCode: "DEVC",
    customerNumber: "11223344",
    collectionLocation: "123456",
  },
  message: { messageId: "1", printertype: "GraphicFile|PDF" },
  shipments: [
    {
      addresses: [
        {
          addressType: "01" as const,
          countrycode: "NL",
          city: "Utrecht",
          street: "Siriusdreef",
          houseNr: "42",
          zipcode: "2132WT",
          name: "Janssen",
        },
      ],
      barcode: "3SDEVC1234567",
      dimension: { weight: 2000 },
      productCodeDelivery: "3085",
    },
  ],
};

describe("shipping.legacy.label", () => {
  it("posts to v2_2/label with confirm=true by default and decodes pdf labels", async () => {
    const fetchMock = mockFetch(200, {
      ResponseShipments: [
        {
          Barcode: "3SDEVC1234567",
          ProductCodeDelivery: "3085",
          Labels: [{ Content: btoa("PDF"), Labeltype: "Label", OutputType: "PDF" }],
        },
      ],
    });
    const client = new PostNLClient({
      apiKey: "k",
      fetch: fetchMock as unknown as typeof fetch,
    });
    const out = await client.shipping.legacy.label(labelInput);

    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("/shipment/v2_2/label");
    expect(req[0]).toContain("confirm=true");
    expect(req[1].method).toBe("POST");

    // request wire keys are PascalCase
    const sentBody = JSON.parse(req[1].body as string);
    expect(sentBody.Customer.CustomerCode).toBe("DEVC");
    expect(sentBody.Message.MessageID).toBe("1");
    expect(typeof sentBody.Message.MessageTimeStamp).toBe("string");
    expect(sentBody.Shipments[0].Barcode).toBe("3SDEVC1234567");
    expect(sentBody.Shipments[0].Dimension.Weight).toBe(2000);
    expect(sentBody.Shipments[0].Addresses[0].AddressType).toBe("01");

    expect(out.responseShipments[0]?.barcode).toBe("3SDEVC1234567");
    expect(out.responseShipments[0]?.labels[0]?.contentType).toBe("application/pdf");
    expect(out.responseShipments[0]?.labels[0]?.bytes()).toBeInstanceOf(Uint8Array);
  });

  it("honours confirm=false", async () => {
    const fetchMock = mockFetch(200, { ResponseShipments: [] });
    const client = new PostNLClient({
      apiKey: "k",
      fetch: fetchMock as unknown as typeof fetch,
    });
    await client.shipping.legacy.label(labelInput, { confirm: false });
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("confirm=false");
  });

  it("normalizes a single-object ResponseShipments into an array (pnlArray)", async () => {
    const fetchMock = mockFetch(200, {
      ResponseShipments: {
        Barcode: "3SDEVC9999999",
        Labels: { Content: btoa("PDF"), OutputType: "PDF" },
        Warnings: { Code: "01", Description: "heads up" },
      },
    });
    const client = new PostNLClient({
      apiKey: "k",
      fetch: fetchMock as unknown as typeof fetch,
    });
    const out = await client.shipping.legacy.label(labelInput);
    expect(Array.isArray(out.responseShipments)).toBe(true);
    expect(out.responseShipments).toHaveLength(1);
    expect(out.responseShipments[0]?.barcode).toBe("3SDEVC9999999");
    expect(out.responseShipments[0]?.labels).toHaveLength(1);
    expect(out.responseShipments[0]?.warnings).toHaveLength(1);
    expect(out.responseShipments[0]?.warnings?.[0]?.code).toBe("01");
  });
});
