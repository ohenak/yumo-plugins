/**
 * Tests for parseDecisionsWarranted (TSPEC-PARSE-05)
 * PROP-PARSE-13 through PROP-PARSE-19
 */

import { parseDecisionsWarranted } from "../orchestrate-dev.js";

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

function hadWarning() {
  return logMessages.some((m) => m.includes("WARNING"));
}

describe("parseDecisionsWarranted — TSPEC-PARSE-05", () => {
  // PROP-PARSE-13: explicit false (lowercase) → false, no warning
  it("PROP-PARSE-13: DECISIONS_WARRANTED: false returns false without warning", () => {
    const result =
      "Some text.\nDECISIONS_WARRANTED: false\nMore text.";
    expect(parseDecisionsWarranted(result)).toBe(false);
    expect(hadWarning()).toBe(false);
  });

  // PROP-PARSE-14: no field present → true + warning
  it("PROP-PARSE-14: absent DECISIONS_WARRANTED field returns true with warning", () => {
    const result = "Some text with no decisions warranted field.";
    expect(parseDecisionsWarranted(result)).toBe(true);
    expect(hadWarning()).toBe(true);
    expect(logMessages.join("")).toContain(
      "DECISIONS_WARRANTED field absent or malformed"
    );
  });

  // PROP-PARSE-15: explicit true → true, no warning
  it("PROP-PARSE-15: DECISIONS_WARRANTED: true returns true without warning", () => {
    const result = "Some text.\nDECISIONS_WARRANTED: true";
    expect(parseDecisionsWarranted(result)).toBe(true);
    expect(hadWarning()).toBe(false);
  });

  // PROP-PARSE-16: mixed case False → false, no warning
  it("PROP-PARSE-16: DECISIONS_WARRANTED: False (mixed case) returns false without warning", () => {
    const result = "Text.\nDECISIONS_WARRANTED: False";
    expect(parseDecisionsWarranted(result)).toBe(false);
    expect(hadWarning()).toBe(false);
  });

  // PROP-PARSE-17: all uppercase TRUE → true, no warning
  it("PROP-PARSE-17: DECISIONS_WARRANTED: TRUE (uppercase) returns true without warning", () => {
    const result = "Text.\nDECISIONS_WARRANTED: TRUE";
    expect(parseDecisionsWarranted(result)).toBe(true);
    expect(hadWarning()).toBe(false);
  });

  // PROP-PARSE-18: reverse scan — last occurrence wins
  it("PROP-PARSE-18: reverse scan returns the last DECISIONS_WARRANTED occurrence", () => {
    const result =
      "DECISIONS_WARRANTED: true\nSome text.\nDECISIONS_WARRANTED: false";
    expect(parseDecisionsWarranted(result)).toBe(false);
    expect(hadWarning()).toBe(false);
  });

  // PROP-PARSE-19: null/undefined/empty → true + warning
  it("PROP-PARSE-19: null result returns true with warning", () => {
    expect(parseDecisionsWarranted(null)).toBe(true);
    expect(hadWarning()).toBe(true);
  });

  it("PROP-PARSE-19: undefined result returns true with warning", () => {
    expect(parseDecisionsWarranted(undefined)).toBe(true);
    expect(hadWarning()).toBe(true);
  });

  it("PROP-PARSE-19: empty string returns true with warning", () => {
    expect(parseDecisionsWarranted("")).toBe(true);
    expect(hadWarning()).toBe(true);
  });

  it("PROP-PARSE-19: whitespace-only string returns true with warning", () => {
    expect(parseDecisionsWarranted("   ")).toBe(true);
    expect(hadWarning()).toBe(true);
  });

  // Case-sensitive prefix check (uppercase key, case-insensitive value)
  it("lowercase prefix decisions_warranted: is NOT recognised", () => {
    const result = "decisions_warranted: false";
    // prefix is case-sensitive, lowercase prefix won't match
    expect(parseDecisionsWarranted(result)).toBe(true);
    expect(hadWarning()).toBe(true);
  });
});
