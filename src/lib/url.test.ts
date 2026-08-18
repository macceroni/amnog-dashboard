import { describe, expect, it } from "vitest";
import { isSafeHttpUrl } from "./url";

describe("isSafeHttpUrl", () => {
  it("akzeptiert https-URLs", () => {
    expect(isSafeHttpUrl("https://www.g-ba.de/foo")).toBe(true);
  });

  it("akzeptiert http-URLs", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
  });

  it("lehnt javascript: ab", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("lehnt JavaScript: ab (Großschreibung)", () => {
    expect(isSafeHttpUrl("JavaScript:alert(1)")).toBe(false);
  });

  it("lehnt JaVaScRiPt: ab (Mixed-Case)", () => {
    expect(isSafeHttpUrl("JaVaScRiPt:alert(1)")).toBe(false);
  });

  it("lehnt javascript: mit führendem Leerzeichen ab", () => {
    expect(isSafeHttpUrl(" javascript:alert(1)")).toBe(false);
  });

  it("lehnt data: ab", () => {
    expect(isSafeHttpUrl("data:text/html,<h1>x</h1>")).toBe(false);
  });

  it("lehnt leeren String ab", () => {
    expect(isSafeHttpUrl("")).toBe(false);
  });

  it("lehnt undefined ab", () => {
    expect(isSafeHttpUrl(undefined)).toBe(false);
  });

  it("lehnt null ab", () => {
    expect(isSafeHttpUrl(null)).toBe(false);
  });
});
