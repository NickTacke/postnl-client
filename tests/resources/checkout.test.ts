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

const call = (m: ReturnType<typeof mockFetch>) =>
  m.mock.calls[0] as unknown as [string, RequestInit];

const input = {
  orderDate: new Date(2019, 6, 5, 11, 30, 0),
  cutOffTimes: [
    { day: "00" as const, available: true, type: "Regular" as const, time: "17:00:00" },
  ],
  options: ["Daytime", "Evening"] as const,
  locations: 2,
  days: 5,
  addresses: [
    {
      addressType: "01" as const,
      houseNr: 42,
      zipcode: "2132WT",
      countrycode: "NL" as const,
      city: "Hoofddorp",
    },
  ],
  shippingDuration: 1,
  holidaySorting: true,
};

describe("checkout.get", () => {
  it("posts camelCase input as PascalCase body to /shipment/v1/checkout", async () => {
    const fetchMock = mockFetch(200, { DeliveryOptions: [], PickupOptions: [], Warnings: [] });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.checkout.get(input);
    const [u, init] = call(fetchMock);
    expect(u).toContain("/shipment/v1/checkout");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.OrderDate).toBe("05-07-2019 11:30:00");
    expect(body.Locations).toBe(2);
    expect(body.Days).toBe(5);
    expect(body.Options).toEqual(["Daytime", "Evening"]);
    expect(body.CutOffTimes[0]).toEqual({
      Day: "00",
      Available: true,
      Type: "Regular",
      Time: "17:00:00",
    });
    expect(body.Addresses[0]).toEqual({
      AddressType: "01",
      HouseNr: 42,
      Zipcode: "2132WT",
      Countrycode: "NL",
      City: "Hoofddorp",
    });
    expect(body.ShippingDuration).toBe(1);
    expect(body.HolidaySorting).toBe(true);
  });

  it("parses delivery, pickup and warning options", async () => {
    const fetchMock = mockFetch(200, {
      DeliveryOptions: [
        {
          DeliveryDate: "07-07-2019",
          Timeframe: [
            { From: "18:00:00", To: "22:30:00", ShippingDate: "06-07-2019", Options: ["Daytime"] },
            // live sandbox returns null ShippingDate
            { From: "09:00:00", To: "11:30:00", ShippingDate: null, Options: ["Daytime"] },
          ],
        },
      ],
      PickupOptions: [
        {
          PickupDate: "09-07-2019",
          ShippingDate: "08-07-2019",
          Option: "Pickup",
          Locations: [
            {
              LocationCode: "8101163043",
              Distance: 234,
              Address: { Street: "Street6", Zipcode: "1234AB", HouseNr: 136, Countrycode: "NL" },
              OpeningHours: { Monday: { From: "08:00", To: "18:00" } },
            },
          ],
        },
      ],
      // live returns Options as an array
      Warnings: [{ Code: "5034", Description: "No delivery option found", Options: ["Daytime"] }],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.checkout.get(input);
    expect(out.deliveryOptions[0]?.deliveryDate).toEqual(new Date(2019, 6, 7));
    expect(out.deliveryOptions[0]?.timeframe[0]?.from).toBe("18:00:00");
    expect(out.deliveryOptions[0]?.timeframe[0]?.options).toEqual(["Daytime"]);
    expect(out.pickupOptions[0]?.option).toBe("Pickup");
    expect(out.pickupOptions[0]?.locations[0]?.locationCode).toBe("8101163043");
    expect(out.pickupOptions[0]?.locations[0]?.openingHours?.monday).toEqual({
      from: "08:00",
      to: "18:00",
    });
    expect(out.warnings[0]?.code).toBe("5034");
    expect(out.warnings[0]?.options).toEqual(["Daytime"]);
  });
});
