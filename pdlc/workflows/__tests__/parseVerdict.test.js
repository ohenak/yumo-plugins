/**
 * Tests for parseVerdict (TSPEC-PARSE-01 through TSPEC-PARSE-04)
 * PROP-PARSE-01 through PROP-PARSE-12
 */

import { parseVerdict } from "../orchestrate-dev.js";

// Capture log calls
let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => {
    logMessages.push(args.join(" "));
  };
});

afterEach(() => {
  console.log = originalLog;
});

function lastWarning() {
  return logMessages.find((m) => m.includes("WARNING"));
}

describe("parseVerdict — TSPEC-PARSE-01 through TSPEC-PARSE-04", () => {
  // PROP-PARSE-01: Normal path — Approved with counts
  it("PROP-PARSE-01: returns correct verdict and counts for valid Approved + JSON", () => {
    const result =
      'Review text.\nVERDICT: Approved\n{"high": 1, "medium": 2, "low": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Approved",
      high: 1,
      medium: 2,
      low: 0,
    });
    expect(lastWarning()).toBeUndefined();
  });

  // PROP-PARSE-02: Wrong casing → fallback + warning
  it("PROP-PARSE-02: wrong casing in verdict value triggers fallback and warning", () => {
    const result = "Some text.\nVERDICT: approved\n";
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("se-review");
    expect(lastWarning()).toContain("no VERDICT");
  });

  // PROP-PARSE-03: Invalid JSON after VERDICT → fallback + warning
  it("PROP-PARSE-03: invalid JSON immediately after VERDICT line triggers fallback and warning", () => {
    const result = "Review.\nVERDICT: Approved\n{high: 0}\n";
    expect(parseVerdict(result, "te-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("te-review");
  });

  // PROP-PARSE-04: Intervening text → fallback + warning
  it("PROP-PARSE-04: intervening text between VERDICT and JSON triggers fallback", () => {
    const result =
      'Review text.\nVERDICT: Approved\nSome extra line\n{"high": 0, "medium": 0, "low": 0}\n';
    expect(parseVerdict(result, "pm-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("pm-review");
  });

  // PROP-PARSE-05: VERDICT is last line (no following line) → truncated, zero counts, no warning
  it("PROP-PARSE-05: VERDICT as very last line returns zero counts and no warning", () => {
    const result = "Review text.\nVERDICT: Approved";
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Approved",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeUndefined();
  });

  // PROP-PARSE-06: Needs revision as last line → zero counts, no warning, FAIL
  it("PROP-PARSE-06: VERDICT: Needs revision as last line returns Needs revision with zero counts", () => {
    const result = "Review text.\nVERDICT: Needs revision";
    const r = parseVerdict(result, "se-review");
    expect(r.verdict).toBe("Needs revision");
    expect(r.high).toBe(0);
    expect(r.medium).toBe(0);
    expect(r.low).toBe(0);
    expect(lastWarning()).toBeUndefined();
  });

  // PROP-PARSE-07: VERDICT followed by only blank lines → zero counts, no warning
  it("PROP-PARSE-07: VERDICT followed by blank lines and EOF returns zero counts, no warning", () => {
    const result = "Review text.\nVERDICT: Approved\n\n\n";
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Approved",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeUndefined();
  });

  // PROP-PARSE-08: Reverse scan — last VERDICT wins
  it("PROP-PARSE-08: reverse scan returns the last VERDICT occurrence", () => {
    const result =
      'VERDICT: Needs revision\n{"high": 2, "medium": 0, "low": 0}\nMore text.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Approved",
      high: 0,
      medium: 0,
      low: 0,
    });
  });

  // PROP-PARSE-09: null/undefined/empty string → fallback + warning
  it("PROP-PARSE-09: null result triggers fallback and warning", () => {
    expect(parseVerdict(null, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("se-review");
  });

  it("PROP-PARSE-09: undefined result triggers fallback and warning", () => {
    expect(parseVerdict(undefined, "te-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("te-review");
  });

  it("PROP-PARSE-09: empty string triggers fallback and warning", () => {
    expect(parseVerdict("", "pm-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("pm-review");
  });

  it("PROP-PARSE-09: whitespace-only string triggers fallback and warning", () => {
    expect(parseVerdict("   \n  ", "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toContain("no VERDICT");
  });

  // PROP-PARSE-10: JSON with extra or missing keys → fallback + warning
  it("PROP-PARSE-10: JSON with extra keys triggers fallback", () => {
    const result =
      'VERDICT: Approved\n{"high": 0, "medium": 0, "low": 0, "extra": 1}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeTruthy();
  });

  it("PROP-PARSE-10: JSON with missing key triggers fallback", () => {
    const result = 'VERDICT: Approved\n{"high": 0, "medium": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeTruthy();
  });

  // PROP-PARSE-11: Negative values or non-integers → fallback + warning
  it("PROP-PARSE-11: negative value in JSON triggers fallback", () => {
    const result =
      'VERDICT: Approved\n{"high": -1, "medium": 0, "low": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeTruthy();
  });

  it("PROP-PARSE-11: float value in JSON triggers fallback", () => {
    const result =
      'VERDICT: Approved\n{"high": 1.5, "medium": 0, "low": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeTruthy();
  });

  // PROP-PARSE-12: Case-sensitive prefix check
  it("PROP-PARSE-12: lowercase verdict: prefix is NOT recognised", () => {
    const result = 'verdict: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Needs revision",
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(lastWarning()).toBeTruthy();
  });

  // "Approved with minor changes" variant
  it("correctly parses Approved with minor changes verdict", () => {
    const result =
      'Some review.\nVERDICT: Approved with minor changes\n{"high": 0, "medium": 1, "low": 2}\n';
    expect(parseVerdict(result, "se-review")).toEqual({
      verdict: "Approved with minor changes",
      high: 0,
      medium: 1,
      low: 2,
    });
    expect(lastWarning()).toBeUndefined();
  });
});
