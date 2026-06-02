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

describe("deliveryDate.calculate", () => {
  it("hits delivery path with mirrored query and per-weekday expansion", async () => {
    const fetchMock = mockFetch(200, {
      DeliveryDate: "30-06-2022",
      Options: { string: "Daytime" },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.deliveryDate.calculate({
      shippingDate: new Date(2022, 4, 29, 14, 0, 0),
      shippingDuration: 1,
      cutOffTime: "17:00:00",
      postalCode: "2132WT",
      countryCode: "NL",
      options: ["Daytime", "Evening"],
      city: "Hoofddorp",
      houseNumber: 42,
      cutOffTimeMonday: "16:00:00",
      availableMonday: true,
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_2/calculate/date/delivery");
    expect(u).toContain("ShippingDate=29-05-2022+14%3A00%3A00");
    expect(u).toContain("ShippingDuration=1");
    expect(u).toContain("CutOffTime=17%3A00%3A00");
    expect(u).toContain("PostalCode=2132WT");
    expect(u).toContain("CountryCode=NL");
    expect(u).toContain("Options=Daytime%2CEvening");
    expect(u).toContain("OriginCountryCode=NL");
    expect(u).toContain("City=Hoofddorp");
    expect(u).toContain("HouseNumber=42");
    expect(u).toContain("CutOffTimeMonday=16%3A00%3A00");
    expect(u).toContain("AvailableMonday=true");
  });

  it("unwraps Options from {string:...} and parses the delivery date", async () => {
    const fetchMock = mockFetch(200, {
      DeliveryDate: "30-06-2022",
      Options: { string: "Daytime" },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.deliveryDate.calculate({
      shippingDate: new Date(2022, 4, 29, 14, 0, 0),
      shippingDuration: 1,
      cutOffTime: "17:00:00",
      postalCode: "2132WT",
      countryCode: "NL",
      options: ["Daytime"],
    });
    expect(out.options).toEqual(["Daytime"]);
    expect(out.deliveryDate).toEqual(new Date(2022, 5, 30));
  });

  it("unwraps a {string:[...]} array Options shape too", async () => {
    const fetchMock = mockFetch(200, {
      DeliveryDate: "30-06-2022",
      Options: { string: ["Daytime", "Evening"] },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.deliveryDate.calculate({
      shippingDate: new Date(2022, 4, 29),
      shippingDuration: 1,
      cutOffTime: "17:00:00",
      postalCode: "2132WT",
      countryCode: "NL",
      options: ["Daytime"],
    });
    expect(out.options).toEqual(["Daytime", "Evening"]);
  });
});

describe("deliveryDate.sentDate", () => {
  it("hits shipping path and parses sent date", async () => {
    const fetchMock = mockFetch(200, { SentDate: "29-06-2022" });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.deliveryDate.sentDate({
      deliveryDate: new Date(2022, 5, 30),
      shippingDuration: 1,
      postalCode: "2132WT",
      countryCode: "NL",
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_2/calculate/date/shipping");
    expect(u).toContain("DeliveryDate=30-06-2022");
    expect(u).toContain("OriginCountryCode=NL");
    expect(out.sentDate).toEqual(new Date(2022, 5, 29));
  });
});
