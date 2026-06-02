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

describe("timeframe.get", () => {
  it("hits timeframes path with mirrored query", async () => {
    const fetchMock = mockFetch(200, { Timeframes: { Timeframe: [] } });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.timeframe.get({
      allowSundaySorting: false,
      startDate: new Date(2022, 5, 30),
      endDate: new Date(2022, 6, 2),
      countryCode: "NL",
      postalCode: "2132WT",
      houseNumber: 42,
      options: ["Daytime", "Evening"],
      houseNrExt: "A",
      city: "Hoofddorp",
      street: "Siriusdreef",
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/v2_1/calculate/timeframes");
    expect(u).toContain("AllowSundaySorting=false");
    expect(u).toContain("StartDate=30-06-2022");
    expect(u).toContain("EndDate=02-07-2022");
    expect(u).toContain("CountryCode=NL");
    expect(u).toContain("PostalCode=2132WT");
    expect(u).toContain("HouseNumber=42");
    expect(u).toContain("Options=Daytime%2CEvening");
    expect(u).toContain("HouseNrExt=A");
  });

  it("normalizes single-object nested lists and unwraps {string:...} options", async () => {
    const fetchMock = mockFetch(200, {
      Timeframes: {
        // single Timeframe object (not array)
        Timeframe: {
          Date: "30-06-2022",
          Timeframes: {
            // single TimeframeTimeframe object (not array)
            TimeframeTimeframe: {
              From: "12:30:00",
              To: "14:30:00",
              Options: { string: "Daytime" },
            },
          },
        },
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.timeframe.get({
      allowSundaySorting: false,
      startDate: new Date(2022, 5, 30),
      endDate: new Date(2022, 6, 2),
      countryCode: "NL",
      postalCode: "2132WT",
      houseNumber: 42,
      options: ["Daytime"],
    });
    expect(out.timeframes).toHaveLength(1);
    expect(out.timeframes[0]?.date).toEqual(new Date(2022, 5, 30));
    expect(out.timeframes[0]?.timeframes).toHaveLength(1);
    expect(out.timeframes[0]?.timeframes[0]?.from).toBe("12:30:00");
    expect(out.timeframes[0]?.timeframes[0]?.options).toEqual(["Daytime"]);
  });

  it("normalizes reason-no-timeframe list with {string:[...]} options", async () => {
    const fetchMock = mockFetch(200, {
      ReasonNoTimeframes: {
        ReasonNoTimeframe: {
          Code: "1",
          Date: "02-07-2022",
          Description: "Delivery date not allowed",
          Options: { string: ["Morning", "Evening"] },
        },
      },
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.timeframe.get({
      allowSundaySorting: false,
      startDate: new Date(2022, 5, 30),
      endDate: new Date(2022, 6, 2),
      countryCode: "NL",
      postalCode: "2132WT",
      houseNumber: 42,
      options: ["Daytime"],
    });
    expect(out.reasonNoTimeframes).toHaveLength(1);
    expect(out.reasonNoTimeframes[0]?.code).toBe("1");
    expect(out.reasonNoTimeframes[0]?.date).toEqual(new Date(2022, 6, 2));
    expect(out.reasonNoTimeframes[0]?.options).toEqual(["Morning", "Evening"]);
  });
});
