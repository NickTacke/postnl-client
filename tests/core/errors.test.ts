import { describe, expect, it } from "bun:test";
import {
  PostNLApiError,
  PostNLAuthError,
  PostNLBadRequestError,
  PostNLRateLimitError,
  PostNLServerError,
  parseError,
} from "../../src/core/errors";

describe("parseError", () => {
  it("401 gateway -> auth", () => {
    const err = parseError(401, { message: "Invalid ApiKey", http_status_code: 401 });
    expect(err).toBeInstanceOf(PostNLAuthError);
    expect(err.message).toContain("Invalid ApiKey");
  });
  it("429 -> rate limit", () => {
    const err = parseError(429, { message: "too many" }, { "retry-after": "5" });
    expect(err).toBeInstanceOf(PostNLRateLimitError);
    expect((err as PostNLRateLimitError).retryAfter).toBe(5);
  });
  it("fault envelope -> server (500)", () => {
    const err = parseError(500, { fault: { faultstring: "boom", detail: { errorcode: "X1" } } });
    expect(err).toBeInstanceOf(PostNLServerError);
    expect(err.code).toBe("X1");
  });
  it("legacy barcode errors[] -> bad request", () => {
    const err = parseError(400, { errors: [{ ErrorMsg: "bad serie", ErrorNumber: "11" }] });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toContain("bad serie");
    expect(err.code).toBe("11");
  });
  it("v4 rfc9457 -> bad request", () => {
    const err = parseError(400, {
      type: "x",
      title: "Validation failed",
      status: 400,
      errors: { a: ["b"] },
      traceId: "t",
    });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toContain("Validation failed");
  });
  it("postalcode errors[] -> bad request", () => {
    const err = parseError(400, {
      errors: [{ status: "400", title: "Bad request", detail: "nope" }],
    });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toContain("Bad request");
  });
  it("unknown shape still yields api error", () => {
    const err = parseError(418, { weird: true });
    expect(err).toBeInstanceOf(PostNLApiError);
    expect(err.status).toBe(418);
  });
});
