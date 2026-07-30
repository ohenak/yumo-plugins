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
    // Exactly one `## Data Model` line exists in the file, and it is the fenced one — the
    // opener immediately above it (asserted on the line before) is what makes that so. A
    // second, unfenced occurrence would make the conjunct below vacuous.
    expect(fencedHeading.split("\n").filter((l) => l === "## Data Model")).toHaveLength(1);

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

// ══════════ D4 — heading sets (PROPERTIES §3.2 / §5.2), file-local and unexported ══════════
//
// Built over `driftGenerators.js`'s primitives only (`int` / `pick` / `shuffle`). PLAN §7.2:
// the domain generator lives in the file that consumes it, no shared module is created, and no
// primitive is re-implemented. The generator **constructs** the expected `S` — it never
// re-derives it by scanning the text it just emitted, which would make the property a
// comparison of two heading walkers rather than an oracle over one.

/** Ordinary prose bodies — never placeholder-shaped, never heading-shaped, never fenced. */
const PROSE_BODIES = Object.freeze([
  "This section carries real content written by the author.",
  "One paragraph of substance, sufficient to satisfy the non-empty-body criterion.",
  "Content. More content on a second line.\nAnd a third.",
]);

/** §5.9's placeholder catalogue — each of these makes a body count as **empty**. */
const PLACEHOLDER_BODIES = Object.freeze(["TBD", "TODO", "_TBD_", "<!-- to be written -->"]);

/**
 * §5.9's **accepted shallowness** (FSPEC v1.5, SE-v5 F-20 / TE-v5 Q-01): a body consisting
 * only of a fenced block containing `TBD` scores **non-empty**, because §5.0's exclusion
 * deliberately does not empty a section body. Generated so conjunct (iv) is forced in both
 * directions rather than only the one an over-eager emptiness test gets right.
 */
const FENCED_TBD_BODY = "```text\nTBD\n```";

/** Non-required heading titles — the extras of conjunct (iii). `Decisions` sits deliberately
 *  one character from `DECISIONS`' required `Decision`, so a matcher that normalises too
 *  aggressively cannot hide a genuine shortfall behind an extra. */
const EXTRA_TITLES = Object.freeze(["Decisions", "Learnings", "Appendix", "Foo"]);

const SPEC_DOC_TYPES = Object.freeze(Object.keys(REQUIRED_HEADINGS));

/** The body kinds, and whether each counts toward `S` (§5.9). */
const BODY_KINDS = Object.freeze({
  prose: { nonEmpty: true },
  placeholder: { nonEmpty: false },
  fencedTbd: { nonEmpty: true },
});

/** Renders one heading line, exercising §5.9's matching rules on their own axis. */
function renderHeading(rng, heading, variant) {
  const t = heading.title;
  switch (variant) {
    case "lower":
      return `## ${t.toLowerCase()}`;
    case "upper":
      return `## ${t.toUpperCase()}`;
    case "spaced":
      return `##   ${t.split(" ").join("  ")}   `;
    case "numDot":
      return `## ${rng.int(1, 9)}. ${t}`;
    case "numParen":
      return `## ${rng.int(1, 9)}) ${t}`;
    case "alt":
      return `## ${heading.alt}`;
    default:
      return `## ${t}`;
  }
}

/** The rendering variants available for a heading — `alt` only where §5.9 states one. */
function variantsFor(heading, nonIdentity) {
  const base = ["lower", "upper", "spaced", "numDot", "numParen"];
  if (heading.alt) base.push("alt");
  return nonIdentity ? base : ["identity"];
}

/** Renders one body of the drawn kind. */
function renderBody(rng, kind) {
  if (kind === "prose") return rng.pick(PROSE_BODIES);
  if (kind === "placeholder") return rng.pick(PLACEHOLDER_BODIES);
  return FENCED_TBD_BODY;
}

/** One `## heading` + body block. */
function renderSection(headingLine, body) {
  return `${headingLine}\n\n${body}\n`;
}

function assemble(docType, sections) {
  return [`# ${docType} — generated`, "", ...sections].join("\n");
}

/**
 * Builds one generated case.
 *
 * Returns the document text, the same text **without** its extra headings (conjunct (iii)'s
 * differential base), the constructed expectation, and the shapes it realises for the
 * non-vacuity floors.
 */
function genCase(rng, plan) {
  const docType = plan.docType;
  const R = REQUIRED_HEADINGS[docType];
  const titles = R.map((h) => h.title);

  // 1. Which required headings are emitted, and with what body kind.
  const emitted = new Map(); // title → body kind
  const dropped = new Set();
  if (plan.kind === "oneShort") {
    dropped.add(plan.dropTitle);
    for (const t of titles) if (t !== plan.dropTitle) emitted.set(t, "prose");
  } else if (plan.kind === "emptyOnly") {
    const victim = rng.pick(titles);
    for (const t of titles) emitted.set(t, t === victim ? "placeholder" : "prose");
    dropped.add(victim); // short, though present — this is conjunct (iv)'s first direction
  } else if (plan.kind === "fencedComplete") {
    const lucky = rng.pick(titles);
    for (const t of titles) emitted.set(t, t === lucky ? "fencedTbd" : "prose");
  } else if (plan.kind === "complete") {
    for (const t of titles) emitted.set(t, "prose");
  } else {
    const keep = rng.shuffle(titles).slice(rng.int(0, titles.length));
    for (const t of titles) {
      if (!keep.includes(t)) {
        dropped.add(t);
        continue;
      }
      const kind = rng.pick(["prose", "prose", "placeholder", "fencedTbd"]);
      emitted.set(t, kind);
      if (!BODY_KINDS[kind].nonEmpty) dropped.add(t);
    }
  }

  // 2. Render the required sections, forcing ≥1 non-identity rendering when scheduled.
  const byTitle = new Map(R.map((h) => [h.title, h]));
  const emittedTitles = [...emitted.keys()];
  const forcedVariantTitle = plan.nonIdentity && emittedTitles.length > 0 ? rng.pick(emittedTitles) : null;
  let nonIdentityUsed = false;

  const requiredSections = rng.shuffle(emittedTitles).map((title) => {
    const heading = byTitle.get(title);
    const nonIdentity = plan.nonIdentity && (title === forcedVariantTitle || rng.int(0, 1) === 0);
    const variant = rng.pick(variantsFor(heading, nonIdentity));
    if (variant !== "identity") nonIdentityUsed = true;
    return renderSection(renderHeading(rng, heading, variant), renderBody(rng, emitted.get(title)));
  });

  // 3. Extras — never in `R`, always ordinary prose, inserted at random positions.
  const extraCount = plan.extras ? rng.int(1, 4) : 0;
  const withExtras = requiredSections.slice();
  for (const title of rng.shuffle(EXTRA_TITLES).slice(0, extraCount)) {
    withExtras.splice(rng.int(0, withExtras.length), 0, renderSection(`## ${title}`, rng.pick(PROSE_BODIES)));
  }

  const missing = new Set(titles.filter((t) => dropped.has(t)));
  return {
    docType,
    text: assemble(docType, withExtras),
    baseText: assemble(docType, requiredSections),
    expected: { complete: missing.size === 0, missing },
    shapes: {
      complete: missing.size === 0,
      oneShort: missing.size === 1,
      soleShortfall: missing.size === 1 ? [...missing][0] : null,
      emptyBodyShort: plan.kind === "emptyOnly",
      fencedTbdComplete: plan.kind === "fencedComplete",
      extras: extraCount > 0,
      nonIdentity: nonIdentityUsed,
    },
  };
}

/**
 * The forced case schedule (PROPERTIES §3.3 rule 1, §5.2's floors). Floors are **constructed**,
 * never sampled: a floor met by sampling is green at the literal seed and a seed-dependent red
 * the first time somebody sets `PDLC_PROP_SEED`.
 *
 * The 32 `oneShort` plans are the (docType, required-heading) pairs enumerated exhaustively —
 * 7 + 7 + 6 + 4 + 4 + 4 — so **every** element of every `R` is the sole shortfall in ≥1 case.
 * That is what makes the property red when a heading is quietly dropped from the subject's own
 * table (PROPERTIES §5.2, 4th row) rather than merely untested.
 */
function buildPlans(rng, count) {
  const plans = [];
  for (const docType of SPEC_DOC_TYPES) {
    for (const h of REQUIRED_HEADINGS[docType]) {
      plans.push({ kind: "oneShort", docType, dropTitle: h.title });
    }
  }
  const add = (n, kind) => {
    for (let i = 0; i < n; i++) plans.push({ kind, docType: rng.pick(SPEC_DOC_TYPES) });
  };
  add(25, "complete");
  add(12, "emptyOnly");
  add(12, "fencedComplete");
  add(count - plans.length, "filler");

  // Extras on 40 and a non-identity rendering on 50, assigned by position after the shuffle so
  // both floors are structural rather than drawn.
  return rng.shuffle(plans).map((p, i) => ({ ...p, extras: i % 5 < 2, nonIdentity: i % 2 === 0 }));
}

// ═══ PROP-COMPLETE-01 (PROPERTIES §4; TSPEC §8.2's `isComplete` row; PLAN §7.2) ═══════════════
//
// **The exact required set, falsifiable in both directions** — NOT monotonicity. PLAN §7.2 and
// PROPERTIES §5.2 both record why the weaker v1.1 form was withdrawn and must not return: a
// matcher recognising *no* required heading at all is incomplete before and after any addition,
// so monotonicity holds while the oracle detects nothing. Conjunct (i) below reds on exactly
// that subject, in the `R ⊆ S` direction.

/** This file's literal seed. `PDLC_PROP_SEED` overrides it — see `resolveSeed`. */
const PROP_COMPLETE_SEED = 20260730;
const CASE_COUNT = 100;

/** Replay-based reproduction (PROPERTIES §3.3 rule 3): the seed and the case index are printed
 *  with every failure, plus `shrink`'s first simpler candidate. `shrink` is never on the pass
 *  path — it is read only while building this report. */
function failureReport(seed, caseIndex, kase, detail) {
  const [simpler] = shrink({ kind: "bytes", bytes: Buffer.from(kase.text, "utf8") });
  const shrunk = simpler ? `${simpler.bytes.length} bytes` : "already minimal";
  return [
    `PROP-COMPLETE-01 failed: ${detail}`,
    `  seed=${seed} (override with PDLC_PROP_SEED); reproduce case ${caseIndex} by replaying draws 1…${caseIndex + 1}`,
    `  docType=${kase.docType}; expected complete=${kase.expected.complete}; expected missing=${JSON.stringify([...kase.expected.missing])}`,
    `  shrink candidate: ${shrunk}`,
    `  document:\n${kase.text}`,
  ].join("\n");
}

describe("PROP-COMPLETE-01 — isComplete is exactly the required set (TSPEC §5.9, §8.2)", () => {
  test("PROP-COMPLETE-01: complete iff R ⊆ S, missing is exactly R \\ S, and extras never subtract", () => {
    const seed = resolveSeed(PROP_COMPLETE_SEED);
    const rng = seeded(seed);
    const plans = buildPlans(rng, CASE_COUNT);

    const floors = { complete: 0, oneShort: 0, emptyBodyShort: 0, fencedTbdComplete: 0, extras: 0, nonIdentity: 0 };
    const soleShortfalls = new Map(SPEC_DOC_TYPES.map((d) => [d, new Set()]));

    for (let caseIndex = 0; caseIndex < plans.length; caseIndex++) {
      const kase = genCase(rng, plans[caseIndex]);
      for (const key of Object.keys(floors)) if (kase.shapes[key]) floors[key] += 1;
      if (kase.shapes.soleShortfall) soleShortfalls.get(kase.docType).add(kase.shapes.soleShortfall);

      // jest's `expect` takes exactly one argument, so the seed/replay report is attached by
      // re-throwing rather than passed as a message.
      try {
        const result = devModule.isComplete(CLASS_SPEC, kase.docType, kase.text);

        // (i) The `iff`, at the right level. Both directions: a subject that always returns
        //     `true` dies on the `R ⊄ S` half, one that always returns `false` on the `R ⊆ S`
        //     half. The extras generated below are what stop monotonicity hiding here.
        expect(result.complete).toBe(kase.expected.complete);

        // (ii) `missing` is exactly the shortfall — a positive-presence conjunct, not an
        //      absence. Set-equal to `R \ S`: every shortfall named, nothing outside `R`, and
        //      nothing that is in `S`. This distinguishes a subject returning `false` for the
        //      right reason from one returning it for the wrong reason.
        if (kase.expected.complete) {
          expect(missingSet(result)).toEqual(new Set());
        } else {
          expect(missingSet(result)).toEqual(kase.expected.missing);
          // …and no name outside `R` was invented, which set equality already implies but
          // which is asserted separately so the failure message says which rule broke.
          const R = new Set(requiredSet(kase.docType));
          expect([...missingSet(result)].filter((m) => !R.has(m))).toEqual([]);
        }

        // (iii) Extras never subtract — stated as a **differential** between the extras-added
        //       text and the same document without them, so it cannot be satisfied vacuously
        //       by a case that had no extras to begin with.
        if (kase.shapes.extras) {
          const base = devModule.isComplete(CLASS_SPEC, kase.docType, kase.baseText);
          expect(result.complete).toBe(base.complete);
          expect(missingSet(result)).toEqual(missingSet(base));
        }
      } catch (err) {
        throw new Error(failureReport(seed, caseIndex, kase, err && err.message ? err.message : String(err)));
      }
    }

    // ── Non-vacuity (PROPERTIES §5.2). All forced by `buildPlans`, asserted here so a
    //    generator that stops producing an adversarial shape fails loudly rather than passing.
    const REQUIRED_FLOORS = {
      complete: 25,
      oneShort: 25,
      emptyBodyShort: 10,
      fencedTbdComplete: 10,
      extras: 15,
      nonIdentity: 20,
    };
    const shortfalls = Object.entries(REQUIRED_FLOORS)
      .filter(([shape, min]) => floors[shape] < min)
      .map(([shape, min]) => `seed=${seed}: ${shape} floor ${floors[shape]} < ${min} (observed ${JSON.stringify(floors)})`);
    expect(shortfalls).toEqual([]);

    // …and each element of every `R` was the sole shortfall in ≥1 case, asserted as set
    // equality against `R` itself — so a heading added to (or removed from) the required set
    // without this generator knowing fails here rather than going untested.
    for (const docType of SPEC_DOC_TYPES) {
      expect([...soleShortfalls.get(docType)].sort()).toEqual([...requiredSet(docType)].sort());
    }
  });
});

