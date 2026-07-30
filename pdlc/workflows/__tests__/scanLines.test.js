/**
 * scanLines.test.js — TSPEC §5.0 (`scanLines(text, visit)`, the one fenced-region-aware
 * scanner), FSPEC AT-65 / AT-66 (§1.2 rule 5, both directions plus the unclosed fence), and
 * PROPERTIES `PROP-SCAN-01` (totality and partition, TSPEC §8.2).
 *
 * RED-terminal (Phase I, batch 2, PLAN RLH-03). `scanLines` is written by **RLH-05 (c)** in
 * batch 3, in `pdlc/workflows/orchestrate-dev.js`. It does not exist at this batch, so
 * `devModule.scanLines` is `undefined` and every assertion below fails on that one oracle —
 * the subject does not exist yet. PLAN §7.3: `RLH-AT-65`, `RLH-AT-66` and the `scanLines`
 * property are **green from batch 3, permitted red at batch 2 only**.
 *
 * The import is a **namespace** import on purpose. A named ESM import of an export that does
 * not exist is a link-time `SyntaxError` in Node, which would make this suite fail to *run* —
 * and a suite that fails to run is not a valid red (PLAN §12.1 step 1).
 *
 * File ownership (PLAN, single-writer-per-file): RLH-03 owns this file and the three fixtures
 * under `__tests__/fixtures/cross-reviews/`. `__tests__/helpers/driftGenerators.js` is
 * consumed **unmodified** (PLAN §7.2): it supplies the primitives (`seeded`, `resolveSeed`,
 * `shrink`) and the D2 fenced-markdown *domain* generator below is file-local and unexported,
 * exactly as §7.2 requires. No second primitive library is written.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { seeded, resolveSeed, shrink } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = join(__dirname, "fixtures", "cross-reviews");

/** Reads a byte-exact fixture (PROPERTIES §6.3 — never reformatted). */
function readFixture(name) {
  return readFileSync(join(FIXTURE_DIR, name), "utf8");
}

/**
 * Drives `scanLines` with a recording visitor and returns the observation set.
 *
 * At batch 2 this throws `TypeError: devModule.scanLines is not a function`, which is this
 * file's single permitted red oracle. It is deliberately **not** guarded: swallowing the
 * absence would turn the red into a vacuous green.
 */
function observe(text) {
  const visited = [];
  devModule.scanLines(text, (line, index) => {
    visited.push({ line, index });
  });
  return visited;
}

/** The lines the visitor actually saw, in visit order. */
function visitedLines(text) {
  return observe(text).map((v) => v.line);
}

// ─────────────────── the two acceptance tests (FSPEC §19, AT-65 / AT-66) ───────────────────
//
// The literals below are the *callers'* patterns (TSPEC §5.0's caller list), not `scanLines`'s:
// the trailing-`## Verdict` locator's `/^\s*##\s+Verdict\s*$/` (§5.1 step 1), the duplicate
// pre-count's `trimmed.startsWith("VERDICT: ")` (§5.1 step 2), and §5.3's `APPROVAL-HASH:`
// pre-count. `scanLines` itself classifies nothing; each AT asserts that the caller's pattern
// has nothing to match *because the quoted occurrence was never visited*.

const VERDICT_HEADING = /^\s*##\s+Verdict\s*$/;
const verdictLine = (line) => line.trim().startsWith("VERDICT: ");
const approvalHashLine = (line) => line.trim().startsWith("APPROVAL-HASH:");

describe("scanLines — fenced-region exclusion (TSPEC §5.0, FSPEC §1.2 rule 5)", () => {
  test("RLH-AT-65: a quoted verdict template is not a verdict — the nested four-in-three block is never visited", () => {
    const text = readFixture("quoted-verdict.md");

    // Non-vacuity: the fixture really does carry both markers, and carries them in the
    // *nested* form. A three-in-three fixture passes under a boolean-toggle implementation,
    // so this pair of guards is what makes the assertions below discriminating (TSPEC §8.2).
    expect(text).toContain("## Verdict");
    expect(text).toContain("VERDICT: Approved with minor changes");
    expect(text).toContain("````markdown\n```markdown\n");
    // …and it carries no unfenced verdict section: every occurrence is inside the wrapper.
    expect(text.split("\n").filter((l) => VERDICT_HEADING.test(l))).toHaveLength(1);

    const lines = visitedLines(text);

    // The quoted block contributes no heading and no verdict line, so the file has no
    // trailing verdict section: it is not approving, §16.3 scores the episode not terminal,
    // and the phase runs.
    expect(lines.filter((l) => VERDICT_HEADING.test(l))).toEqual([]);
    expect(lines.filter(verdictLine)).toEqual([]);

    // The inner three-backtick lines are *content* of the four-backtick block, not closers —
    // this is the conjunct a "next fence line closes it" implementation reds on.
    expect(lines.filter((l) => l.trim().startsWith("```"))).toEqual([]);

    // Falsifier control: the unfenced prose around the quotation is still visited, so the
    // test cannot pass by visiting nothing at all.
    expect(lines).toContain("## Findings");
    expect(lines).toContain("## Recommendation");
  });

  test("RLH-AT-66: a quoted APPROVAL-HASH does not poison the pre-count, and an unclosed fence swallows the remainder", () => {
    // (a) the fenced append shape — §7.4's pre-count must count zero.
    const quoted = readFixture("quoted-hash.md");
    expect(quoted).toContain("APPROVAL-HASH: sha256:");
    const quotedLines = visitedLines(quoted);
    expect(quotedLines.filter(approvalHashLine)).toEqual([]);
    // The `>`-quoted occurrence *is* visited — it is outside every fence — and is excluded by
    // the caller's own trimmed-prefix test rather than by the scanner. Asserting it stays in
    // the observation set keeps the exclusion narrow: fences only, not "anything quotation-ish".
    expect(quotedLines.some((l) => l.trim().startsWith("> APPROVAL-HASH:"))).toBe(true);
    // This file's own genuine trailing verdict section is unfenced and must be visible.
    expect(quotedLines.filter((l) => VERDICT_HEADING.test(l))).toHaveLength(1);
    expect(quotedLines.filter(verdictLine)).toEqual(["VERDICT: Approved"]);

    // (b) the unclosed fence — every line after the opener is swallowed (TSPEC §5.0 rule 2),
    // which fails closed in the correct direction: fewer matches, so the phase runs.
    const unclosed = readFixture("unclosed-fence.md");
    expect(unclosed).toContain("VERDICT: Approved");
    expect(unclosed).toContain("APPROVAL-HASH: sha256:");
    const unclosedLines = visitedLines(unclosed);
    expect(unclosedLines.filter(approvalHashLine)).toEqual([]);
    expect(unclosedLines.filter(verdictLine)).toEqual([]);
    expect(unclosedLines.filter((l) => VERDICT_HEADING.test(l))).toEqual([]);
    // Everything before the opener is still visited.
    expect(unclosedLines).toContain("## Findings");
    const openerIndex = unclosed.split("\n").indexOf("```markdown");
    expect(openerIndex).toBeGreaterThan(0);
    expect(observe(unclosed).every((v) => v.index < openerIndex)).toBe(true);
  });
});
