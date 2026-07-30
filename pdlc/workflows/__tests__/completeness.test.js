/**
 * completeness.test.js — TSPEC §5.9 (`isComplete(artifactClass, docType, fileText)`, the four
 * wrapped artifact classes and the six spec-class heading tables), FSPEC AT-59 / AT-60 / AT-62
 * (§16.2, §16.3), and PROPERTIES `PROP-COMPLETE-01` (the exact required set, falsifiable in
 * both directions — TSPEC §8.2, PLAN §7.2).
 *
 * RED-terminal (Phase I, batch 4, PLAN RLH-12). Neither `isComplete` (§5.9) nor `isTerminal`
 * (§5.6.2) exists at this batch:
 *
 *   - `isComplete`  is written by **RLH-16** (batch 6) — greens `RLH-AT-60`, `RLH-AT-62` and
 *                   `PROP-COMPLETE-01`.
 *   - `isTerminal`  is written by **RLH-23** (batch 7) — greens `RLH-AT-59`, which therefore
 *                   stays red for one batch after RLH-16 lands, exactly as PLAN §7.3's ledger
 *                   requires ("`RLH-AT-59` | green from batch 7 | permitted red batches 4–6").
 *
 * Every assertion below fails on **its own oracle** — the subject is `undefined` — not on a
 * module-parse error. The import is a **namespace** import for that reason: a named ESM import
 * of a missing export is a link-time `SyntaxError`, and a suite that fails to *run* is not a
 * valid red (PLAN §12.1 step 1).
 *
 * File ownership (PLAN §5.3, single-writer-per-file): RLH-12 owns this file and every fixture
 * under `__tests__/fixtures/completeness/`. `__tests__/helpers/driftGenerators.js` is consumed
 * **unmodified** (PLAN §7.2, §5.2): it supplies the primitives (`seeded`, `resolveSeed`,
 * `shrink`) and the D4 heading-set *domain* generator below is file-local and unexported. No
 * second primitive library is written.
 *
 * ── Fixture provenance (PLAN §10.2, PROPERTIES §6.4) ────────────────────────────────────────
 *
 * `fixtures/completeness/cross-review-template.md` is a **byte-verbatim** copy of the
 * `## Cross-Review File Format` template block of `pdlc/skills/se-review/SKILL.md` (the fenced
 * `markdown` block, lines 146–178 at HEAD `6561c0a`, i.e. as the SKILL reads at the end of
 * batch 3, after RLH-07). `cross-review-duplicated-verdict.md` and
 * `cross-review-quoted-verdict.md` are that template with its `{…}` / `<verdict-value>`
 * placeholders filled and with AT-59's / AT-60's own defect introduced; the quoted block in the
 * latter is likewise copied verbatim from that SKILL's own trailing `## Verdict` grammar
 * example (lines 226–231).
 *
 * The three `tspec-*.md` fixtures are **not** copied from a SKILL, and that is a measured fact
 * rather than an omission: at HEAD **no author SKILL declares a spec-class top-level heading
 * template** — that is precisely TSPEC §10.2 **Q-09**, carried and bound to QUEUE.md Order 9.
 * Their heading sets are therefore taken from TSPEC §5.9's own per-class table, and their
 * *shape* (a skeleton of every required `##` heading with empty bodies) from the Authoring
 * Pacing Contract's "Skeleton first" clause, which every author SKILL does carry at HEAD.
 *
 * This copy is a **point-in-time snapshot and detects no later SKILL edit whatever** (PLAN
 * §10.2, PROPERTIES §6.4). No drift detector is built here, and none is added as a bonus:
 * PLAN §11.3 `H-j` binds that work to QUEUE.md Order 9.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { seeded, resolveSeed, shrink } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = join(__dirname, "fixtures", "completeness");

/** Reads a byte-exact fixture (PROPERTIES §6.3 — never reformatted, never re-indented). */
function readFixture(name) {
  return readFileSync(join(FIXTURE_DIR, name), "utf8");
}

// ─────────────────────── the artifact-class catalogue (TSPEC §5.9) ───────────────────────
//
// §5.9 names four wrapped classes in prose but pins no literal for `isComplete`'s first
// argument, and §3.7's signature line does not either. These are the literals this suite
// drives, and therefore the literals **RLH-16 must accept**; they are the kebab-cased forms of
// §5.9's own four row labels. Declared as one frozen catalogue rather than sprinkled inline so
// a later correction is a one-line change (PROPERTIES §6.5 — cite, never retype).
const CLASS_SPEC = "spec";
const CLASS_CROSS_REVIEW = "cross-review";

// The greenfield mode literal. §5.6.2's `isTerminal` branches on `mode !== "revision"`, and
// §5.6.1's `selectMode` returns `"authoring" | "revision"`.
const MODE_GREENFIELD = "authoring";

// ─────────────────── the trailing `## Verdict` locator (TSPEC §5.1 step 1) ───────────────────
//
// `isComplete`'s cross-review criterion is stated over the **trailing** `## Verdict` section,
// located under §1.2 rule 5's fenced-region exclusion. `scanLines` already ships (RLH-05 (c),
// batch 3), so this suite locates the section with the production scanner rather than with a
// second, re-implemented one — a private regex walk here would let a fixture pass this file and
// fail the subject for reasons neither reports.

const VERDICT_HEADING = /^\s*##\s+Verdict\s*$/;
const isVerdictField = (line) => line.trim().startsWith("VERDICT: ");

/**
 * Returns `{ headingIndex, lines, fieldCount }` for the LAST unfenced `## Verdict` heading.
 * `lines` are the section's own unfenced lines (heading excluded); `fieldCount` is §5.1 step
 * 2's duplicate pre-count over them. `headingIndex` is -1 when there is no such section.
 */
function trailingVerdictSection(text) {
  const visited = [];
  devModule.scanLines(text, (line, index) => visited.push({ line, index }));

  let headingAt = -1;
  for (const v of visited) {
    if (VERDICT_HEADING.test(v.line)) headingAt = v.index;
  }
  if (headingAt === -1) return { headingIndex: -1, lines: [], fieldCount: 0 };

  const lines = visited.filter((v) => v.index > headingAt).map((v) => v.line);
  return { headingIndex: headingAt, lines, fieldCount: lines.filter(isVerdictField).length };
}

/** The whole-file `VERDICT: ` count — the count §16.3 says is **never consulted** (AT-60). */
function wholeFileFieldCount(text) {
  return text.split("\n").filter(isVerdictField).length;
}

// ─────────────── the six spec-class required-heading tables (TSPEC §5.9) ───────────────
//
// Transcribed from §5.9's table, one row per spec class. `title` is the **canonical** name —
// the form §5.9 lists first, and the form this suite asserts `missing` carries. `alt` is
// §5.9's parenthesised alternative, which the matching rules accept as equivalent; `null`
// where the row states none.
//
// This table is what makes `PROP-COMPLETE-01` an oracle over the required set itself: it
// derives both its expectation and its non-vacuity floors from these rows, so a heading
// quietly dropped from the subject's own table reds the property (PROPERTIES §5.2 4th row).
const REQUIRED_HEADINGS = Object.freeze({
  REQ: Object.freeze([
    { title: "Problem / Context", alt: null },
    { title: "Goals", alt: null },
    { title: "Non-Goals", alt: "Scope" },
    { title: "Constraints", alt: null },
    { title: "Acceptance Criteria", alt: null },
    { title: "Risks", alt: null },
    { title: "Obligations", alt: "Open Questions" },
  ]),
  FSPEC: Object.freeze([
    { title: "Overview", alt: "Scope" },
    { title: "Linked Requirements", alt: null },
    { title: "Behavioral Flow", alt: null },
    { title: "Business Rules", alt: null },
    { title: "Edge Cases and Error Scenarios", alt: null },
    { title: "Acceptance Tests", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  TSPEC: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Architecture", alt: "Design" },
    { title: "Interfaces", alt: null },
    { title: "Data Model", alt: "State" },
    { title: "Test Strategy", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  PLAN: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Batches", alt: "Tasks" },
    { title: "Dependencies", alt: null },
    { title: "Verification", alt: null },
  ]),
  PROPERTIES: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Properties", alt: null },
    { title: "Oracles", alt: null },
    { title: "Fixtures", alt: null },
  ]),
  DECISIONS: Object.freeze([
    { title: "Context", alt: null },
    { title: "Options Considered", alt: null },
    { title: "Decision", alt: null },
    { title: "Consequences", alt: null },
  ]),
});

/** The canonical required-title set `R` for a spec doc type. */
function requiredSet(docType) {
  return REQUIRED_HEADINGS[docType].map((h) => h.title);
}

/** `missing` as a Set, tolerating the `{ complete: true }` shape that omits the field. */
function missingSet(result) {
  return new Set(result.missing === undefined ? [] : result.missing);
}

// ═══════════════ the acceptance tests (FSPEC §19; TSPEC §8.3's `completeness.test.js` row) ═══
//
// Jest names are namespaced `RLH-AT-{N}`, never bare `AT-{N}`: `documentOracles.test.js`
// carries a foreign, intentional `AT-22` red, and two tests of one name in one run make a
// failure report ambiguous exactly when it matters (TSPEC §8.3, PLAN §1.3 / §7.4).

describe("structural completeness — the cross-review class (TSPEC §5.9, FSPEC §16.3)", () => {
  test("RLH-AT-59: a duplicated verdict field is terminal but not approving", () => {
    const text = readFixture("cross-review-duplicated-verdict.md");

    // Non-vacuity: the fixture really does carry two catalogue-valued `VERDICT:` lines, both
    // inside the trailing `## Verdict` section. A fixture with one, or with the second one
    // fenced, would pass under the very implementation this AT exists to red.
    const section = trailingVerdictSection(text);
    expect(section.headingIndex).toBeGreaterThan(0);
    expect(section.lines.filter(isVerdictField)).toEqual(["VERDICT: Approved", "VERDICT: Approved"]);
    expect(section.fieldCount).toBe(2);

    // (a) TERMINAL. §16.3's table: "two or more `VERDICT: ` lines, at least one carrying a
    //     catalogue value" ⇒ terminal **yes**. The "exactly one" clause was withdrawn from the
    //     terminal test at FSPEC v1.x precisely because it made a finished review permanently
    //     non-terminal — the wrapper re-dispatches to `MAX_AUTHORING_DISPATCHES` and halts the
    //     phase over a review whose reviewer plainly reached the end (E-58).
    const completeness = devModule.isComplete(CLASS_CROSS_REVIEW, "FSPEC", text);
    expect(completeness.complete).toBe(true);

    // …and observed where the wrapper observes it. A review episode is greenfield, so
    // §5.6.2's terminal record is `{ terminal: isComplete(...).complete, trailerReason: null }`
    // — `parseRevisionComplete` is not called and no trailer is required (§6.2 row 9a). This
    // conjunct is why `RLH-AT-59` stays red one batch past RLH-16: `isTerminal` is RLH-23's.
    const terminal = devModule.isTerminal(
      MODE_GREENFIELD,
      "review written; see the cross-review file.",
      CLASS_CROSS_REVIEW,
      "FSPEC",
      text,
    );
    expect(terminal).toEqual({ terminal: true, trailerReason: null });

    // (b) NOT APPROVING. §5.1 step 2's duplicate pre-count over the located section fails
    //     closed, so the phase runs. The phase-level halves — that no halt occurs and that the
    //     phase actually runs — are `approvalSearch.test.js`'s AT-11 and `haltAndQueue.test.js`
    //     (PLAN §7.4); what this file owns is that the *same* section is simultaneously
    //     terminal and non-approving, which is the whole content of "terminal but not
    //     approving".
    expect(section.fieldCount).toBeGreaterThan(1);
  });

  test("RLH-AT-60: quoted verdict grammar does not make a file unparseable", () => {
    const text = readFixture("cross-review-quoted-verdict.md");

    // Non-vacuity: two `VERDICT:` lines exist in the file — one fenced quotation of the SKILL's
    // own grammar block, one real field in the trailing section. Without both, the "count of
    // two is never consulted" clause has nothing to be true about.
    expect(wholeFileFieldCount(text)).toBe(2);
    expect(text).toContain("VERDICT: Approved with minor changes");
    expect(text).toContain("```markdown\n## Verdict\n");

    // The fenced occurrence is excluded under §1.2 rule 5, so the located trailing section
    // carries exactly one field — and the located heading is the unfenced one.
    const section = trailingVerdictSection(text);
    expect(section.fieldCount).toBe(1);
    expect(section.lines.filter(isVerdictField)).toEqual(["VERDICT: Approved"]);

    // (a) The file is CONFORMING — exactly the judgement a whole-file count of two would
    //     destroy, and the one RLH-16 must get right.
    expect(devModule.isComplete(CLASS_CROSS_REVIEW, "TSPEC", text).complete).toBe(true);

    // (b) The verdict READS `Approved` — the trailing section's value, not the quotation's.
    //     `parseVerdict` is unchanged by this feature (TSPEC §3.9) and is driven over the
    //     located section text, which is §5.1 step 3.
    const parsed = devModule.parseVerdict(section.lines.join("\n"), "software-engineer");
    expect(parsed.verdict).toBe("Approved");
    expect(parsed.malformed).toBeUndefined();

    // (c) The whole-file count is never consulted: it is 2, and 2 is the count that would make
    //     §5.1's fail-closed duplicate branch fire. The located count is what governs.
    expect(wholeFileFieldCount(text)).not.toBe(section.fieldCount);
  });
});

describe("structural completeness — the spec classes (TSPEC §5.9, FSPEC §16.2)", () => {
  test("RLH-AT-62: a placeholder skeleton is not structurally complete", () => {
    const R = requiredSet("TSPEC");

    // ── (a) every required heading written, every body a placeholder ──────────────────────
    //
    // `TBD`, `TODO`, `_TBD_` and an HTML comment all count as an **empty** body (§5.9), so
    // `S` is 0 and every required heading is short. Reds for a body test of "any non-blank
    // line", under which write 1 of a skeleton scores complete and the episode terminates
    // before a single word of content exists.
    const skeleton = readFixture("tspec-placeholder-skeleton.md");
    for (const title of R) expect(skeleton).toContain(`## ${title}\n`);
    expect(skeleton).toContain("TBD");
    expect(skeleton).toContain("TODO");
    expect(skeleton).toContain("_TBD_");
    expect(skeleton).toContain("<!-- to be written -->");

    const skeletonResult = devModule.isComplete(CLASS_SPEC, "TSPEC", skeleton);
    expect(skeletonResult.complete).toBe(false);
    // `S` is 0, observed through the only surface §3.7's return exposes: every member of `R`
    // is short, so `missing` is set-equal to `R` itself.
    expect(missingSet(skeletonResult)).toEqual(new Set(R));

    // ── (b) a fenced `## …` line does not inflate `T` ─────────────────────────────────────
    //
    // The same skeleton with `## Data Model` written as a *quotation* inside a fenced block
    // instead of as a section of its own (§1.2 rule 5, which §16.2 inherits). The fenced
    // heading is not a top-level section, so `Data Model` is still short — while the fenced
    // block **is** body content for the heading it sits under, so `Interfaces` is not.
    // Both directions in one fixture: an implementation that scans fences reds on the first
    // conjunct, one that strips fenced lines out of bodies reds on the second (SE-v4 F-18).
    const fencedHeading = readFixture("tspec-fenced-heading-skeleton.md");
    expect(fencedHeading).toContain("```markdown\n## Data Model\n");
    expect(fencedHeading.split("\n").filter((l) => l === "## Data Model")).toHaveLength(0);

    const fencedHeadingResult = devModule.isComplete(CLASS_SPEC, "TSPEC", fencedHeading);
    expect(fencedHeadingResult.complete).toBe(false);
    expect(missingSet(fencedHeadingResult).has("Data Model")).toBe(true);
    expect(missingSet(fencedHeadingResult).has("Interfaces")).toBe(false);

    // ── (c) a body that is ONLY a fenced block is non-empty ───────────────────────────────
    //
    // All six required headings present, `## Interfaces` carrying nothing but one signature
    // block. That body counts toward `S` and the artifact scores structurally **complete**.
    // Reds for a strip-then-scan body test, under which `S < T` forever and §15.6 halts the
    // phase on a correct document (SE-v4 F-18 / TE-v4 F-01).
    const fencedBody = readFixture("tspec-fenced-body-complete.md");
    for (const title of R) expect(fencedBody).toContain(`## ${title}\n`);
    expect(fencedBody).toContain("## Interfaces\n\n```js\n");

    const fencedBodyResult = devModule.isComplete(CLASS_SPEC, "TSPEC", fencedBody);
    expect(fencedBodyResult.complete).toBe(true);
    expect(missingSet(fencedBodyResult)).toEqual(new Set());
  });
});
