import { describe, expect, it } from "bun:test";
import { PostNLClient } from "../src/index";

// baseline smoke test; the package exposes a constructable client
describe("package", () => {
  it("exports PostNLClient", () => {
    expect(typeof PostNLClient).toBe("function");
    expect(new PostNLClient({ apiKey: "k" })).toBeInstanceOf(PostNLClient);
  });
});
