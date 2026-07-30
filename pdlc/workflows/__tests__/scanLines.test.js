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

// ───────────── D2 — fenced markdown (PROPERTIES §3.2), file-local and unexported ─────────────
//
// Built over `driftGenerators.js`'s primitives only (`int` / `pick` / `shuffle` / `bytes`).
// PLAN §7.2: the domain generator lives in the file that consumes it, and no second primitive
// library is written. The generator *constructs* the fenced-and-fence-line index set `F` — it
// never re-scans the document, which would make the property a comparison of two scanners.

/** Marker literals. `PROP-SCAN-01` asserts no marker *classification*; these exist so the
 *  generator composes markers with fences, which is where an ordering bug lives. */
const MARKER_LINES = Object.freeze([
  "## Verdict",
  "VERDICT: Approved",
  "VERDICT: Approved with minor changes",
  "VERDICT: Needs revision",
  `APPROVAL-HASH: sha256:${"a".repeat(64)}`,
  "REVIEWED-COMMIT: unavailable",
  "RESOLVED: yes",
  "REVISION-COMPLETE: no",
]);

/** Near-miss marker lines: quoted, re-cased, or embedded in a sentence. None is fence-shaped. */
const NEAR_MISS_LINES = Object.freeze([
  "> VERDICT: Approved",
  "the VERDICT: Approved line above is a quotation",
  "## verdict",
  "#### Verdict",
  `> APPROVAL-HASH: sha256:${"0".repeat(64)}`,
  "VERDICT : Approved",
  "RESOLVED:yes",
  "  approval-hash: not the marker",
]);

const FENCE_CHARS = Object.freeze(["`", "~"]);
const INFO_STRINGS = Object.freeze(["", "markdown", "js", "text", " json"]);
const FENCE_RE = /^\s*(`{3,}|~{3,})/;

/** A fence delimiter: 3–6 backticks or tildes, optionally indented, optionally info-stringed. */
function genFence(rng, { char, len, info = true } = {}) {
  const c = char ?? rng.pick(FENCE_CHARS);
  const n = len ?? rng.int(3, 6);
  const indent = " ".repeat(rng.int(0, 3));
  const tail = info ? rng.pick(INFO_STRINGS) : "";
  return { line: `${indent}${c.repeat(n)}${tail}`, char: c, len: n };
}

/** Arbitrary prose (D3): printable ASCII, never fence-shaped, never containing a newline. */
function genProse(rng) {
  const bytes = rng.bytes(rng.int(0, 40));
  let out = "";
  for (const b of bytes) out += String.fromCharCode(32 + (b % 95));
  return FENCE_RE.test(out) ? `x${out}` : out;
}

/** One content line — a true marker, a near-miss, or prose. Never fence-shaped. */
function genContent(rng, kind) {
  const k = kind ?? rng.pick(["marker", "nearMiss", "prose", "prose"]);
  if (k === "marker") return rng.pick(MARKER_LINES);
  if (k === "nearMiss") return rng.pick(NEAR_MISS_LINES);
  return genProse(rng);
}

/**
 * Assembles one document from a forced shape plan and returns
 * `{ lines, fenced, shapes }` — `fenced` being the constructed `F`.
 */
function genDocument(rng, plan) {
  const lines = [];
  const fenced = new Set();
  const shapes = { marker: false, nearMiss: false, balancedWithMarker: false, nested: false, unclosed: false };
  const push = (line, isFenced) => {
    if (isFenced) fenced.add(lines.length);
    lines.push(line);
  };
  const room = () => plan.maxLines - lines.length;

  const emitContent = (count, kind) => {
    for (let i = 0; i < count && room() > 0; i++) {
      const k = kind ?? rng.pick(["marker", "nearMiss", "prose", "prose"]);
      if (k === "marker") shapes.marker = true;
      if (k === "nearMiss") shapes.nearMiss = true;
      push(genContent(rng, k), false);
    }
  };

  // A balanced fence: opener, inner lines, matching closer — every line of it in `F`.
  const emitBalanced = (withMarker) => {
    if (room() < 3) return;
    const open = genFence(rng, {});
    push(open.line, true);
    const inner = Math.min(rng.int(withMarker ? 1 : 0, 3), Math.max(0, room() - 1));
    for (let i = 0; i < inner; i++) {
      const k = withMarker && i === 0 ? "marker" : undefined;
      push(genContent(rng, k), true);
    }
    push(open.char.repeat(open.len), true);
    if (withMarker) shapes.balancedWithMarker = true;
  };

  // The nested four-in-three shape: a 4-run wrapper whose body is a complete 3-run block.
  // The inner opener and inner closer are shorter than the wrapper, so neither closes it —
  // the only shape that distinguishes §5.0's same-char-and-length rule from a boolean toggle.
  const emitNested = () => {
    if (room() < 6) return;
    const char = rng.pick(FENCE_CHARS);
    push(`${char.repeat(4)}${rng.pick(INFO_STRINGS)}`, true);
    push(`${char.repeat(3)}${rng.pick(INFO_STRINGS)}`, true);
    push(genContent(rng, "marker"), true);
    push(genContent(rng, undefined), true);
    push(char.repeat(3), true);
    push(char.repeat(4), true);
    shapes.nested = true;
  };

  // An opener with no closer: every remaining index is swallowed (§5.0 rule 2).
  const emitUnclosed = () => {
    if (room() < 2) return;
    const open = genFence(rng, {});
    push(open.line, true);
    const tail = Math.min(rng.int(1, 5), room());
    for (let i = 0; i < tail; i++) {
      // Deliberately includes shorter same-char runs and markers: all are swallowed.
      const filler = rng.int(0, 3) === 0 ? open.char.repeat(Math.max(3, open.len - 1)) : genContent(rng, undefined);
      push(filler, true);
    }
    shapes.unclosed = true;
  };

  emitContent(rng.int(0, 4));
  if (plan.balancedWithMarker) emitBalanced(true);
  emitContent(rng.int(0, 3));
  if (plan.nested) emitNested();
  emitContent(plan.marker ? rng.int(1, 3) : rng.int(0, 3), plan.marker ? "marker" : undefined);
  if (rng.int(0, 2) === 0) emitBalanced(false);
  emitContent(plan.nearMiss ? rng.int(1, 3) : rng.int(0, 3), plan.nearMiss ? "nearMiss" : undefined);
  if (plan.unclosed) emitUnclosed();

  return { lines, fenced, shapes };
}

/**
 * The forced shape schedule (PROPERTIES §3.3 rule 1). Floors are **constructed**, never
 * sampled: a floor met by sampling is green at the literal seed and a seed-dependent red the
 * first time somebody sets `PDLC_PROP_SEED`. Required minima are 20 / 20 / 15 / 10 / 5.
 */
function buildPlans(rng, count) {
  const plans = [];
  const add = (n, patch) => {
    for (let i = 0; i < n; i++) plans.push({ marker: false, nearMiss: false, balancedWithMarker: false, nested: false, unclosed: false, ...patch });
  };
  add(25, { marker: true });
  add(25, { nearMiss: true });
  add(15, { balancedWithMarker: true, marker: true });
  add(15, { nested: true, marker: true });
  add(10, { unclosed: true });
  add(count - plans.length, {});
  // A forced structural shape needs room to be emitted at all, so its budget floor is raised
  // rather than drawn — otherwise a short draw silently drops the floor it was scheduled for.
  let zeroLengthTaken = false;
  return rng.shuffle(plans).map((p) => {
    const structural = p.balancedWithMarker || p.nested || p.unclosed;
    let maxLines;
    if (structural) {
      maxLines = rng.int(30, 115);
    } else if (!zeroLengthTaken) {
      maxLines = 0; // the 0-line document — §5.0 coerces and `"".split("\n")` is one empty line
      zeroLengthTaken = true;
    } else {
      maxLines = rng.int(1, 120);
    }
    return { ...p, maxLines };
  });
}

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

// ───────────────── PROP-SCAN-01 (PROPERTIES §4, TSPEC §8.2's `scanLines` row) ─────────────────

/** This file's literal seed. `PDLC_PROP_SEED` overrides it — see `resolveSeed`. */
const PROP_SCAN_SEED = 20260729;
const CASE_COUNT = 100;

/** Replay-based reproduction (PROPERTIES §3.3 rule 3): the seed and case index, plus `shrink`'s
 *  first simpler candidate, are printed with every failure. `shrink` is never on the pass path. */
function failureReport(seed, caseIndex, text, detail) {
  const [simpler] = shrink({ kind: "bytes", bytes: Buffer.from(text, "utf8") });
  const shrunk = simpler ? `${simpler.bytes.length} bytes` : "already minimal";
  return [
    `PROP-SCAN-01 failed: ${detail}`,
    `  seed=${seed} (override with PDLC_PROP_SEED); reproduce case ${caseIndex} by replaying draws 1…${caseIndex + 1}`,
    `  shrink candidate: ${shrunk}`,
    `  document (${text.split("\n").length} lines):\n${text}`,
  ].join("\n");
}

describe("PROP-SCAN-01 — scanLines is total and partitions its input (TSPEC §5.0, §8.2)", () => {
  test("PROP-SCAN-01: the visited set and the constructed fenced set partition every generated document, and scanLines is total", () => {
    const seed = resolveSeed(PROP_SCAN_SEED);
    const rng = seeded(seed);
    const plans = buildPlans(rng, CASE_COUNT);

    // (i) Totality — never throws, for any input, including the three §5.0 coerces.
    for (const degenerate of ["", "\n", "\n\n", "```", "~~~~", "\r\n", null, undefined]) {
      expect(() => observe(degenerate)).not.toThrow();
    }
    expect(observe("").map((v) => v.line)).toEqual([""]);
    expect(observe(null).map((v) => v.line)).toEqual([""]);
    expect(observe(undefined).map((v) => v.line)).toEqual([""]);

    const floors = { marker: 0, nearMiss: 0, balancedWithMarker: 0, nested: 0, unclosed: 0 };

    for (let caseIndex = 0; caseIndex < plans.length; caseIndex++) {
      const { lines, fenced, shapes } = genDocument(rng, plans[caseIndex]);
      for (const key of Object.keys(floors)) if (shapes[key]) floors[key] += 1;

      const text = lines.join("\n");
      const allLines = text.split("\n");

      // jest's `expect` takes exactly one argument, so the seed/replay report is attached by
      // re-throwing rather than passed as a message.
      try {
        const observed = observe(text);
        const V = new Set(observed.map((v) => v.index));

        // (ii) Partition — V ∪ F is exactly the index set, and V ∩ F is empty.
        const expectedV = [];
        for (let i = 0; i < allLines.length; i++) if (!fenced.has(i)) expectedV.push(i);
        expect(observed.map((v) => v.index)).toEqual(expectedV);
        expect([...V].filter((i) => fenced.has(i))).toEqual([]);

        // (iii) Conservation — an arithmetic identity, so a silently skipped line fails even
        //       when every line that *is* visited is right.
        expect(V.size + fenced.size).toBe(allLines.length);

        // (iv) Fence discipline — no constructed fenced index is ever visited. The nested and
        //      unclosed shapes are what make this discriminating (§5.0 rules 1 and 2).
        expect([...fenced].filter((i) => V.has(i))).toEqual([]);

        // (v) Positional fidelity — an off-by-one cannot hide behind a correct count.
        expect(observed.map(({ index }) => allLines[index])).toEqual(observed.map(({ line }) => line));
      } catch (err) {
        throw new Error(failureReport(seed, caseIndex, text, err && err.message ? err.message : String(err)));
      }
    }

    // Non-vacuity (PROPERTIES §3.3) — the floors are forced by `buildPlans`, and asserted
    // here so a generator that stops producing the adversarial shape fails loudly rather
    // than passing trivially. Shortfalls carry the seed and the observed counts.
    const REQUIRED_FLOORS = { marker: 20, nearMiss: 20, balancedWithMarker: 15, nested: 10, unclosed: 5 };
    const shortfalls = Object.entries(REQUIRED_FLOORS)
      .filter(([shape, min]) => floors[shape] < min)
      .map(([shape, min]) => `seed=${seed}: ${shape} floor ${floors[shape]} < ${min} (observed ${JSON.stringify(floors)})`);
    expect(shortfalls).toEqual([]);
  });
});
