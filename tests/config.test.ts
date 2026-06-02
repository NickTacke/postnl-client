import { describe, expect, it } from "bun:test";
import { resolveConfig } from "../src/config";

describe("resolveConfig", () => {
  it("applies sdk-mirrored defaults", () => {
    const c = resolveConfig({ apiKey: "k" });
    expect(c.baseUrl).toBe("https://api.postnl.nl");
    expect(c.timeoutMs).toBe(60_000);
    expect(c.retry.maxRetries).toBe(3);
    expect(c.retry.backoffFactor).toBe(2);
    expect(c.retry.retryMethods).toEqual(["GET", "PUT"]);
    expect(c.retry.retryStatuses).toContain(429);
    expect(c.retry.retryStatuses).toContain(503);
  });
  it("selects sandbox base url", () => {
    expect(resolveConfig({ apiKey: "k", environment: "sandbox" }).baseUrl).toBe(
      "https://api-sandbox.postnl.nl",
    );
  });
  it("throws on missing apiKey", () => {
    // @ts-expect-error intentional
    expect(() => resolveConfig({})).toThrow();
  });
});
