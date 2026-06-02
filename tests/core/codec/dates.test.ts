import { describe, expect, it } from "bun:test";
import { formatDate, parsePnlDate } from "../../../src/core/codec/dates";

describe("parsePnlDate", () => {
  it("parses dd-MM-yyyy", () => {
    expect(parsePnlDate("20-04-2024")).toEqual(new Date(2024, 3, 20));
  });
  it("parses dd-MM-yyyy HH:mm:ss", () => {
    expect(parsePnlDate("07-11-2022 19:10:28")).toEqual(new Date(2022, 10, 7, 19, 10, 28));
  });
  it("parses iso yyyy-MM-dd", () => {
    expect(parsePnlDate("2016-04-20")).toEqual(new Date(2016, 3, 20));
  });
  it("throws on garbage input", () => {
    expect(() => parsePnlDate("not-a-date")).toThrow("invalid postnl date: not-a-date");
  });
});

describe("formatDate", () => {
  it("formats dd-MM-yyyy", () => {
    expect(formatDate(new Date(2024, 3, 20), "date")).toBe("20-04-2024");
  });
  it("formats dd-MM-yyyy HH:mm:ss", () => {
    expect(formatDate(new Date(2022, 10, 7, 19, 10, 28), "datetime")).toBe("07-11-2022 19:10:28");
  });
});
