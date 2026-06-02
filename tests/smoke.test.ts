import { describe, expect, it } from "bun:test";
import { version } from "../src/index";

// baseline smoke test; package keeps a version export
describe("package", () => {
  it("exposes version", () => {
    expect(version).toBe("0.1.0");
  });
});
