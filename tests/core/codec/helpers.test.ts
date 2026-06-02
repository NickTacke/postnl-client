import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { pnlArray, pnlBool, pnlNum, pnlStringWrapped } from "../../../src/core/codec/helpers";

describe("pnlArray", () => {
  const s = pnlArray(z.string());
  it("passes arrays through", () => expect(s.parse(["a", "b"])).toEqual(["a", "b"]));
  it("wraps single object", () => expect(s.parse("a")).toEqual(["a"]));
  it("unwraps {string:[...]}", () => expect(s.parse({ string: ["a", "b"] })).toEqual(["a", "b"]));
  it("treats missing as empty", () => expect(s.parse(undefined)).toEqual([]));
});

describe("pnlStringWrapped", () => {
  const s = pnlStringWrapped(z.string());
  it("unwraps {string:v}", () => expect(s.parse({ string: "Daytime" })).toBe("Daytime"));
  it("passes bare value", () => expect(s.parse("Daytime")).toBe("Daytime"));
});

describe("pnlNum / pnlBool", () => {
  it("coerces stringified number", () => expect(pnlNum().parse("2")).toBe(2));
  it("keeps native number", () => expect(pnlNum().parse(2)).toBe(2));
  it("coerces stringified bool", () => expect(pnlBool().parse("true")).toBe(true));
  it("keeps native bool", () => expect(pnlBool().parse(false)).toBe(false));
});
