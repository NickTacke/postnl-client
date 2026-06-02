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

const locationBody = (overrides: Record<string, unknown> = {}) => ({
  GetLocationsResult: {
    ResponseLocation: [
      {
        Name: "Tonys Tabakszaak",
        Distance: "102",
        Latitude: "52.10223388",
        Longitude: "5.13634192",
        LocationCode: "163043",
        Address: { City: "Utrecht", Zipcode: "3531AA", HouseNr: "136", Countrycode: "NL" },
        DeliveryOptions: { string: ["RETA", "PG", "DO", "PA"] },
        OpeningHours: {
          Monday: { string: "08:00-18:00" },
          Tuesday: { string: "08:00-18:00" },
        },
        ...overrides,
      },
    ],
  },
});

describe("location.nearest", () => {
  it("hits nearest path with mirrored query (HouseNumberExtension)", async () => {
    const fetchMock = mockFetch(200, locationBody());
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.location.nearest({
      countryCode: "NL",
      postalCode: "2132WT",
      houseNumber: 42,
      houseNumberExtension: "A",
      deliveryOptions: ["PG"],
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_1/locations/nearest");
    expect(u).toContain("CountryCode=NL");
    expect(u).toContain("PostalCode=2132WT");
    expect(u).toContain("HouseNumber=42");
    expect(u).toContain("HouseNumberExtension=A");
    expect(u).toContain("DeliveryOptions=PG");
  });

  it("csv-joins multiple delivery options into a single query param", async () => {
    const fetchMock = mockFetch(200, locationBody());
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.location.nearest({
      countryCode: "NL",
      postalCode: "2132WT",
      deliveryOptions: ["PG", "PA"],
    });
    const u = url(fetchMock);
    expect(decodeURIComponent(u)).toContain("DeliveryOptions=PG,PA");
    expect(u).not.toContain("DeliveryOptions=PG&");
  });

  it("filters internal delivery options, unwraps opening hours, coerces stringified numbers", async () => {
    const fetchMock = mockFetch(200, locationBody());
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.location.nearest({ countryCode: "NL", postalCode: "2132WT" });
    expect(out.locations).toHaveLength(1);
    const loc = out.locations[0];
    expect(loc?.deliveryOptions).toEqual(["PG", "PA"]);
    expect(loc?.latitude).toBe(52.10223388);
    expect(loc?.longitude).toBe(5.13634192);
    expect(loc?.distance).toBe(102);
    expect(loc?.locationCode).toBe(163043);
    expect(loc?.openingHours?.monday).toBe("08:00-18:00");
    expect(loc?.address?.houseNr).toBe(136);
  });

  it("normalizes a single ResponseLocation object to an array", async () => {
    const fetchMock = mockFetch(200, {
      GetLocationsResult: { ResponseLocation: { Name: "Solo", LocationCode: "1" } },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.location.nearest({ countryCode: "NL", postalCode: "2132WT" });
    expect(out.locations).toHaveLength(1);
    expect(out.locations[0]?.name).toBe("Solo");
  });
});

describe("location.nearestByGeocode", () => {
  it("hits geocode path with lat/long", async () => {
    const fetchMock = mockFetch(200, locationBody());
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.location.nearestByGeocode({ latitude: 52.1, longitude: 5.1, countryCode: "NL" });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_1/locations/nearest/geocode");
    expect(u).toContain("Latitude=52.1");
    expect(u).toContain("Longitude=5.1");
  });
});

describe("location.area", () => {
  it("hits area path with bounding box", async () => {
    const fetchMock = mockFetch(200, locationBody());
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.location.area({
      latitudeNorth: 52.2,
      longitudeWest: 5.0,
      latitudeSouth: 52.0,
      longitudeEast: 5.2,
      countryCode: "NL",
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_1/locations/area");
    expect(u).toContain("LatitudeNorth=52.2");
    expect(u).toContain("LongitudeWest=5");
    expect(u).toContain("LatitudeSouth=52");
    expect(u).toContain("LongitudeEast=5.2");
  });
});

describe("location.lookup", () => {
  it("hits lookup path and returns a single location", async () => {
    const fetchMock = mockFetch(200, {
      GetLocationsResult: {
        ResponseLocation: { Name: "Looked up", LocationCode: "163043", Latitude: "52.1" },
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.location.lookup({ locationCode: "163043" });
    expect(url(fetchMock)).toContain("/shipment/v2_1/locations/lookup?LocationCode=163043");
    expect(out.location?.name).toBe("Looked up");
    expect(out.location?.latitude).toBe(52.1);
  });
});
