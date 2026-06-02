import { describe, expect, it, mock } from "bun:test";
import { resolveConfig } from "../../src/config";
import { PostNLRateLimitError } from "../../src/core/errors";
import { Transport } from "../../src/core/http";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("Transport", () => {
  it("sends apikey header and returns parsed body", async () => {
    const fetchMock = mock(() => Promise.resolve(jsonResponse(200, { Barcode: "3SX" })));
    const t = new Transport(
      resolveConfig({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch }),
    );
    const out = await t.send({
      family: "legacy",
      method: "GET",
      path: "/shipment/v1_1/barcode",
      query: { CustomerCode: "DEVC" },
    });
    expect(out).toEqual({ Barcode: "3SX" });
    const req = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(req[0]).toContain("https://api.postnl.nl/shipment/v1_1/barcode?CustomerCode=DEVC");
    expect((req[1].headers as Record<string, string>).apikey).toBe("k");
  });

  it("retries GET on 503 then succeeds", async () => {
    const responses = [
      jsonResponse(503, { fault: { faultstring: "x" } }),
      jsonResponse(200, { ok: true }),
    ];
    let i = 0;
    const fetchMock = mock(() => Promise.resolve(responses[i++] as Response));
    const t = new Transport(
      resolveConfig({
        apiKey: "k",
        fetch: fetchMock as unknown as typeof fetch,
        retry: { backoffFactor: 0 },
      }),
    );
    const out = await t.send({ family: "legacy", method: "GET", path: "/x" });
    expect(out).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry POST on 503", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(jsonResponse(503, { fault: { faultstring: "x" } })),
    );
    const t = new Transport(
      resolveConfig({
        apiKey: "k",
        fetch: fetchMock as unknown as typeof fetch,
        retry: { backoffFactor: 0 },
      }),
    );
    await expect(
      t.send({ family: "v4", method: "POST", path: "/x", body: {} }),
    ).rejects.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps 429 to rate limit error with retry-after", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(jsonResponse(429, { message: "slow" }, { "retry-after": "3" })),
    );
    const t = new Transport(
      resolveConfig({
        apiKey: "k",
        fetch: fetchMock as unknown as typeof fetch,
        retry: { maxRetries: 0 },
      }),
    );
    await expect(t.send({ family: "legacy", method: "GET", path: "/x" })).rejects.toBeInstanceOf(
      PostNLRateLimitError,
    );
  });
});
