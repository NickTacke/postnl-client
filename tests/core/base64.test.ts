import { describe, expect, it } from "bun:test";
import { decodeBase64, labelContentType } from "../../src/core/base64";

describe("base64 helpers", () => {
  it("decodes base64 to bytes", () => {
    const bytes = decodeBase64(btoa("hello"));
    expect(new TextDecoder().decode(bytes)).toBe("hello");
  });
  it("round-trips arbitrary binary bytes", () => {
    const src = new Uint8Array(256);
    for (let i = 0; i < 256; i++) src[i] = i;
    const b64 = btoa(String.fromCharCode(...src));
    expect([...decodeBase64(b64)]).toEqual([...src]);
  });
  it("maps output types to content types", () => {
    expect(labelContentType("pdf")).toBe("application/pdf");
    expect(labelContentType("gif")).toBe("image/gif");
    expect(labelContentType("jpg")).toBe("image/jpeg");
    expect(labelContentType("png")).toBe("image/png");
    expect(labelContentType("zpl")).toBe("text/plain");
  });
});
