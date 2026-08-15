/**
 * parseConfirmationFindings (PLAN §2.1, task T1).
 *
 * Two halves:
 *   1. The three halt-hardening confirmation fixtures parse into the records the
 *      gate (T2) will read — a delta-tagged High, an inherited-only set, and the
 *      legacy untagged confirmation that must yield nothing at all.
 *   2. The grammar's edges: fences, pipes in free text, bad tokens, casing, CRLF.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { parseConfirmationFindings } from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "fixtures", "halt-hardening");

const fixture = (name) => readFileSync(join(FIXTURES, name), "utf8");

describe("parseConfirmationFindings — halt-hardening fixtures", () => {
  it("confirmation-delta-high.md: yields a High / delta / local finding with its section anchor", () => {
    const { findings, malformed } = parseConfirmationFindings(fixture("confirmation-delta-high.md"));

    expect(malformed).toEqual([]);
    expect(findings).toHaveLength(3);

    const high = findings.filter((f) => f.severity === "High");
    expect(high).toHaveLength(1);
    expect(high[0].provenance).toBe("delta");
    expect(high[0].locality).toBe("local");
    expect(high[0].section).toBe("§3-02");
    expect(high[0].text).toContain("frozenset");

    // The rest are recorded, not gating — but they are still parsed.
    expect(findings.map((f) => f.severity)).toEqual(["High", "Medium", "Low"]);
    expect(findings[2].provenance).toBe("inherited");
    expect(findings[2].locality).toBe("nonlocal");
  });

  it("confirmation-inherited-high.md: every High is tagged inherited (R2's input)", () => {
    const { findings, malformed } = parseConfirmationFindings(
      fixture("confirmation-inherited-high.md")
    );

    expect(malformed).toEqual([]);
    expect(findings).toHaveLength(4);
    expect(findings.every((f) => f.provenance === "inherited")).toBe(true);
    expect(findings.every((f) => f.locality === "nonlocal")).toBe(true);

    const highs = findings.filter((f) => f.severity === "High");
    expect(highs).toHaveLength(2);
    expect(highs.map((f) => f.section)).toEqual(["§8.3", "§8.2"]);
  });

  it("confirmation-untagged.md: no findings and no malformed lines (the legacy case)", () => {
    const { findings, malformed } = parseConfirmationFindings(fixture("confirmation-untagged.md"));

    // Prose findings and a Needs revision verdict, but nothing this grammar can
    // read. The parser reports emptiness; failing closed is the caller's job.
    expect(findings).toEqual([]);
    expect(malformed).toEqual([]);
  });
});

describe("parseConfirmationFindings — grammar edges", () => {
  it("ignores FINDING: lines inside fenced blocks", () => {
    const text = [
      "## Findings",
      "",
      "The grammar, for reference:",
      "",
      "```",
      "FINDING: High | delta | local | §1 | template line, not a finding",
      "```",
      "",
      "FINDING: High | delta | local | §2 | the real one",
      "",
      "## Verdict",
      "",
      "VERDICT: Needs revision",
    ].join("\n");

    const { findings, malformed } = parseConfirmationFindings(text);

    expect(malformed).toEqual([]);
    expect(findings).toHaveLength(1);
    expect(findings[0].section).toBe("§2");
    expect(findings[0].text).toBe("the real one");
  });

  it("preserves pipes in the free text — only the first four delimiters split", () => {
    const { findings, malformed } = parseConfirmationFindings(
      "FINDING: Medium | delta | nonlocal | §4.2 | the cell reads `list[str] | None` | it should read `list[str]`"
    );

    expect(malformed).toEqual([]);
    expect(findings).toHaveLength(1);
    expect(findings[0].section).toBe("§4.2");
    expect(findings[0].text).toBe("the cell reads `list[str] | None` | it should read `list[str]`");
  });

  it("routes an unknown severity, provenance or locality token to malformed", () => {
    const text = [
      "FINDING: Critical | delta | local | §1 | severity outside the closed set",
      "FINDING: High | regression | local | §2 | provenance outside the closed set",
      "FINDING: High | delta | remote | §3 | locality outside the closed set",
      "FINDING: High | delta | local | §4 | this one is fine",
    ].join("\n");

    const { findings, malformed } = parseConfirmationFindings(text);

    expect(findings).toHaveLength(1);
    expect(findings[0].section).toBe("§4");
    expect(malformed).toHaveLength(3);
    expect(malformed[0]).toContain("Critical");
    expect(malformed[1]).toContain("regression");
    expect(malformed[2]).toContain("remote");
  });

  it("routes a line with fewer than four delimiters to malformed", () => {
    const { findings, malformed } = parseConfirmationFindings(
      "FINDING: High | delta | local | §5 no text delimiter"
    );

    expect(findings).toEqual([]);
    expect(malformed).toEqual(["FINDING: High | delta | local | §5 no text delimiter"]);
  });

  it("matches keywords case-insensitively and returns canonical casing", () => {
    const { findings, malformed } = parseConfirmationFindings(
      "finding: HIGH | Delta | LOCAL | §6 | shouty"
    );

    expect(malformed).toEqual([]);
    expect(findings).toEqual([
      { severity: "High", provenance: "delta", locality: "local", section: "§6", text: "shouty" },
    ]);
  });

  it("tolerates whitespace around the pipes and around the tag", () => {
    const { findings } = parseConfirmationFindings(
      "   FINDING:High|delta|local|   §7   |   padded text   "
    );

    expect(findings).toEqual([
      { severity: "High", provenance: "delta", locality: "local", section: "§7", text: "padded text" },
    ]);
  });

  it("parses CRLF text identically to LF text", () => {
    const lf = [
      "FINDING: High | delta | local | §8 | first",
      "FINDING: Low | inherited | nonlocal | §9 | second",
    ].join("\n");

    expect(parseConfirmationFindings(lf.replace(/\n/g, "\r\n"))).toEqual(
      parseConfirmationFindings(lf)
    );
  });

  it("is total: null, undefined and non-strings yield empty results", () => {
    for (const input of [null, undefined, "", 42, {}]) {
      expect(parseConfirmationFindings(input)).toEqual({ findings: [], malformed: [] });
    }
  });
});
