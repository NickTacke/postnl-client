import { describe, expect, it } from "bun:test";
import {
  PostNLApiError,
  PostNLAuthError,
  PostNLBadRequestError,
  PostNLRateLimitError,
  PostNLServerError,
  inlineApiError,
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
  it("cif inline Error envelope reads ErrorMessage (live api field, not ErrorDescription)", () => {
    const err = parseError(400, {
      Date: "2026-06-02T13:32:41Z",
      Error: { ErrorCode: "0010", ErrorMessage: "No results found." },
      RequestId: "abc",
    });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toBe("No results found.");
    expect(err.code).toBe("0010");
  });
  it("legacy barcode errors[] -> bad request", () => {
    const err = parseError(400, { errors: [{ ErrorMsg: "bad serie", ErrorNumber: "11" }] });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toContain("bad serie");
    expect(err.code).toBe("11");
  });
  it("v4 rfc9457 with errors object map -> title branch (not error-list)", () => {
    const err = parseError(400, {
      type: "x",
      title: "Validation failed",
      status: 400,
      errors: { a: ["b"] },
      traceId: "t",
    });
    expect(err).toBeInstanceOf(PostNLBadRequestError);
    expect(err.message).toBe("Validation failed");
    // title branch sets code from `type`; error-list branch would not
    expect(err.code).toBe("x");
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

describe("inlineApiError", () => {
  it("detects a http-200 inline Error envelope", () => {
    const err = inlineApiError({
      Date: "2026-06-02T13:32:41Z",
      Error: { ErrorCode: "0010", ErrorMessage: "No results found." },
      RequestId: "abc",
    });
    expect(err).toBeInstanceOf(PostNLApiError);
    expect(err?.message).toBe("No results found.");
    expect(err?.code).toBe("0010");
  });
  it("keeps the code when an inline Error has ErrorCode but no message", () => {
    const err = inlineApiError({ Error: { ErrorCode: "0010" } });
    expect(err).toBeInstanceOf(PostNLApiError);
    expect(err?.code).toBe("0010");
    expect(err?.message).toBe("error");
  });
  it("returns undefined for a normal success body", () => {
    expect(inlineApiError({ GetLocationsResult: { ResponseLocation: [] } })).toBeUndefined();
    expect(inlineApiError({ DeliveryDate: "04-06-2026" })).toBeUndefined();
    expect(inlineApiError(undefined)).toBeUndefined();
  });
});
