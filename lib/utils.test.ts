import { describe, it, expect } from "vitest";
import { formatBudget, sanitizeText, timeAgo, CATEGORY_COLORS } from "./utils";

describe("formatBudget", () => {
  it("returns null for empty budget", () => {
    expect(formatBudget(null, null)).toBeNull();
    expect(formatBudget(undefined, undefined)).toBeNull();
  });

  it("returns single price when from === to", () => {
    expect(formatBudget(50000, 50000)).toBe("50,000 ₸");
  });

  it("returns range when from !== to", () => {
    expect(formatBudget(10000, 50000)).toBe("10,000 – 50,000 ₸");
  });

  it("returns from price when only from is given", () => {
    expect(formatBudget(30000, null)).toBe("30,000 ₸");
  });
});

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert('xss')</script>Hello")).toBe("Hello");
    expect(sanitizeText("<b>Bold</b> text")).toBe("Bold text");
  });

  it("respects maxLength", () => {
    const long = "a".repeat(200);
    expect(sanitizeText(long, 100)).toHaveLength(100);
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("timeAgo", () => {
  it("returns Just now for < 1 minute", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("Just now");
  });

  it("returns minutes for < 1 hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours for < 1 day", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days for >= 1 day", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });
});

describe("CATEGORY_COLORS", () => {
  it("has all three categories", () => {
    expect(CATEGORY_COLORS).toHaveProperty("automobiles");
    expect(CATEGORY_COLORS).toHaveProperty("real-estate");
    expect(CATEGORY_COLORS).toHaveProperty("other");
  });

  it("values contain Tailwind class strings", () => {
    for (const cls of Object.values(CATEGORY_COLORS)) {
      expect(typeof cls).toBe("string");
      expect(cls.length).toBeGreaterThan(0);
    }
  });
});
