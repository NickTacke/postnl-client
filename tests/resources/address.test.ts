import { describe, expect, it, mock } from "bun:test";
import { PostNLError } from "../../src/core/errors";
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

describe("address.check", () => {
  it("throws on sandbox before any fetch", async () => {
    const fetchMock = mockFetch(200, {});
    const c = new PostNLClient({
      apiKey: "k",
      environment: "sandbox",
      fetch: fetchMock as unknown as typeof fetch,
    });
    await expect(c.address.check({ postalCode: "1011AB", houseNumber: "1" })).rejects.toThrow(
      /production/i,
    );
    await expect(
      c.address.check({ postalCode: "1011AB", houseNumber: "1" }),
    ).rejects.toBeInstanceOf(PostNLError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps camelCase response on production", async () => {
    const fetchMock = mockFetch(200, {
      city: "Amsterdam",
      postalCode: "1011AB",
      streetName: "Nieuwe Amstelstraat",
      houseNumber: 1,
      houseNumberAddition: "A",
      formattedAddress: ["Nieuwe Amstelstraat 1A", "1011AB Amsterdam"],
    });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    const out = await c.address.check({ postalCode: "1011AB", houseNumber: "1" });
    expect(out).toEqual({
      city: "Amsterdam",
      postalCode: "1011AB",
      streetName: "Nieuwe Amstelstraat",
      houseNumber: 1,
      houseNumberAddition: "A",
      formattedAddress: ["Nieuwe Amstelstraat 1A", "1011AB Amsterdam"],
    });
    const u = url(fetchMock);
    expect(u).toContain("/shipment/checkout/v1/postalcodecheck?postalcode=1011AB&housenumber=1");
  });

  it("stringifies numeric houseNumber and includes addition query", async () => {
    const fetchMock = mockFetch(200, { city: "Utrecht" });
    const c = new PostNLClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });
    await c.address.check({ postalCode: "3571ZZ", houseNumber: 74, houseNumberAddition: "bis" });
    const u = url(fetchMock);
    expect(u).toContain("postalcode=3571ZZ");
    expect(u).toContain("housenumber=74");
    expect(u).toContain("housenumberaddition=bis");
  });
});
