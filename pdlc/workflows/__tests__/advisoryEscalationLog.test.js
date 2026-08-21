// advisoryEscalationLog.test.js — PLAN A-09 (batch 4, depends on A-02).
//
// RED (authored as `skipped-describe`, un-skipped by the 🟢 owner A-21). This file owns
// PROP-ESC-01, PROP-ESC-02, PROP-ESC-03, PROP-ESC-04, PROP-ESC-05, PROP-ESC-07, PROP-ESC-08,
// PROP-ESC-09 and P-7 (PROPERTIES §9.2, §11) — the escalation-log half of `docs/_queue/
// ESCALATIONS.md` (TSPEC §10.1) and the sibling report-notice catalogue `ADVISORY_ESCALATIONS`
// (TSPEC §10.2). It exercises FSPEC-ADV-09 cases T-09-1, T-09-2, T-09-5, T-09-6, T-09-7, T-09-8.
//
// What this file does NOT claim: PROP-ESC-06 (L-3/F-5 — "escalation never changes control flow";
// the halt or skip happens byte-identically to a disabled run) is Integration-level and homed in
// `advisoryDodSeams.test.js` / `advisoryQueueSeams.test.js` (T-09-3, T-09-4) — those files drive a
// real seam through `runAdvisorySeam`, which this file never constructs. `renderAdvisoryEntry` /
// `appendAdvisoryEntry` / `advisorySummaryRows` (the *advisory record*, TSPEC §9) are
// `advisoryRecord.test.js`'s (A-08 🔴 / A-21 🟢), not this file's, even though both land via the
// same 🟢 owner.
//
// Every canonical double/generator comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) —
// no locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else.
//
// `renderEscalationEntry`, `appendEscalationEntry` and `ADVISORY_ESCALATIONS` do not exist on
// `orchestrate-dev.js` yet — they land at A-21. This file therefore imports the module as a
// namespace (`* as devModule`) and reaches the not-yet-existing symbols only from *inside*
// `skipped-describe` bodies (property access on a namespace object for a missing member yields
// `undefined` at runtime rather than a link-time SyntaxError, unlike a named import of a
// nonexistent export). Every `skipped-describe` block therefore imports cleanly today and will run,
// unmodified, the moment A-21 adds the exports.
//
// Field-name extraction (PROP-ESC-01/P-7's "exactly the eight declared fields") is done
// structurally, against TSPEC §10.1's own markdown shape (a table of `| Field | Value |` rows for
// the short scalar fields, and `**Label.**`-prefixed sections for the longer prose fields) —
// never against this file's own guess at renderEscalationEntry's internals, since no
// implementation exists yet to echo. `FIELD_LABEL_MAP` is the transcribed literal of TSPEC §10.1 /
// FSPEC §11.1's eight declared field labels; any emitted label outside that map surfaces as an
// `UNKNOWN(...)` sentinel, which fails both the set-equality and order assertions rather than
// being silently ignored.

import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";

import {
  makeFileDouble,
  makeAdvisoryGenerators,
  resolveSeed,
  FIXED_NOW_MS,
  // A6 (pdlc-advisory-wave-gate) additions — see the `AWG PROP-REC-*` blocks at the end of this
  // file, which drive the shipped `runWaveGateSeam` rather than calling the renderer directly.
  makeRealRepoFixture,
  makeAgentDouble,
  makeA6ReplyText,
  makeFakeClock,
  makeAdvisoryConfig,
  makeSeamOps,
} from "./helpers/advisoryDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const QUEUE_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-queue.js"), "utf8");

// The one artifact path TSPEC §10.1 names — a single, non-feature-scoped log, unlike
// `ADVISORY-{feature}.md` — transcribed as a literal because it is not exported as a named
// constant.
const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

const FEATURE = "pdlc-advisory-tier";

// ─── SeamOps overrides — positional, never a multi-key object literal ────────────────────────────
// PROP-INFRA-01's doubles-hygiene scan (`advisoryPreflight.test.js`, "locally-built SeamOps
// literal") refuses any brace block in an `advisory*.test.js` file that carries two or more
// `SeamOps` member keys, because such a literal is indistinguishable from a test that built its
// own seam contract instead of driving the canonical `makeSeamOps` factory. Passing the overrides
// positionally is the shipped way a sibling suite satisfies that guard while still overriding more
// than one member — see `advisoryDriver.test.js`'s `buildSeamOpsOverrides`, whose convention this
// mirrors for the two members this file needs.
function buildSeamOpsOverrides(permittedActions, declaredScope) {
  const o = {};
  if (permittedActions !== undefined) o.permittedActions = permittedActions;
  if (declaredScope !== undefined) o.declaredScope = declaredScope;
  return o;
}

// Arbitrary literal seed for this file's generator-driven property (P-7), overridable via
// `PDLC_PROP_SEED` per `driftGenerators.js`'s §1.3 rule 1, reached only through
// `makeAdvisoryGenerators` (PROP-INFRA-02).
const ADV_ESC_SEED = 0x41445609;
const SEED = resolveSeed(ADV_ESC_SEED);

// ---------------------------------------------------------------------------
// Field-label extraction and the PROPERTIES PROP-ESC-01 transcribed literal.
// ---------------------------------------------------------------------------

// The eight declared field labels (TSPEC §10.1 / FSPEC §11.1), keyed by their normalised markdown
// label text and mapped to the canonical field key PROP-ESC-01 states, in the order that row
// states it: "the one-sentence decision statement first, then feature, seam, refusal reason,
// diagnosis, proposed action, evidence, pipeline state".
const FIELD_LABEL_MAP = {
  decide: "decision",
  feature: "feature",
  seam: "seam",
  "refusal reason": "refusalReason",
  diagnosis: "diagnosis",
  "proposed action": "proposedAction",
  evidence: "evidence",
  "pipeline state": "pipelineState",
  // AC-6.2 (pdlc-advisory-wave-gate) — the class a seam ANNOTATES. A1–A5 annotate nothing, so
  // their entries still carry exactly the eight labels above and PROP-ESC-01's set-equality is
  // unchanged; A6's entry carries this ninth row, pinned by `AWG_A6_FIELD_ORDER` below. Mapping it
  // here (rather than leaving it to surface as `UNKNOWN(root cause)`) is what lets the A6 block
  // assert its position, not merely its presence.
  "root cause": "rootCause",
};

const REQUIRED_FIELD_ORDER = [
  "decision",
  "feature",
  "seam",
  "refusalReason",
  "diagnosis",
  "proposedAction",
  "evidence",
  "pipelineState",
];

// Extracts, in appearance order, every markdown label this entry text declares — either a
// `| Label | Value |` table row or a `**Label.**` / `**Label:**` bold section marker (the two
// structural shapes TSPEC §10.1's worked example uses). Table header/separator noise
// (`| Field | Value |`, `|---|---|`) is dropped. A label outside `FIELD_LABEL_MAP` becomes an
// `UNKNOWN(...)` sentinel rather than being silently swallowed, so an invented ninth field is
// detectable by both the set-equality and the order assertion.
function extractFieldLabels(entryText) {
  const labels = [];
  const lineRe = /^(?:\|\s*([^|]+?)\s*\||\*\*\s*([^*]+?)\s*\*\*)/gm;
  let match;
  while ((match = lineRe.exec(entryText)) !== null) {
    const raw = (match[1] ?? match[2]).trim().replace(/[.:]$/, "").toLowerCase();
    if (raw === "field" || raw === "value" || /^-+$/.test(raw)) continue;
    labels.push(Object.prototype.hasOwnProperty.call(FIELD_LABEL_MAP, raw) ? FIELD_LABEL_MAP[raw] : `UNKNOWN(${raw})`);
  }
  return labels;
}

function buildDisposition(overrides = {}) {
  return {
    outcome: "escalated",
    reason: "out-of-envelope",
    verdict: {
      seam: "A5",
      diagnosis: "the lint failure also fails on the default branch",
      proposedAction: "nothing",
      confidence: "high",
      withinEnvelope: false,
      evidence: [".github/workflows/pr-tests.yml:31"],
    },
    attempts: 1,
    model: "opus",
    fallback: false,
    ...overrides,
  };
}

function buildCtx(overrides = {}) {
  return {
    feature: FEATURE,
    seam: "A5",
    phase: "PUB",
    phaseOutcome: "halted",
    decision: "whether the lint failure is the feature's to fix, given it also fails on the default branch",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PROP-ESC-01 — renderEscalationEntry is pure and emits exactly the eight declared fields, decision
// sentence first (T-09-1, AC-10.1, AC-10.2, L-2).
// ---------------------------------------------------------------------------

describe("PROP-ESC-01 — renderEscalationEntry: exactly eight fields, decision sentence first", () => {
  test("emitted field-name set equals the TSPEC §10.1 literal — no invented, no missing field", () => {
    const entry = devModule.renderEscalationEntry(buildDisposition(), buildCtx(), { now: FIXED_NOW_MS });
    const labels = extractFieldLabels(entry);
    expect(new Set(labels)).toEqual(new Set(REQUIRED_FIELD_ORDER));
  });

  test("emitted field order equals the declared order, decision first", () => {
    const entry = devModule.renderEscalationEntry(buildDisposition(), buildCtx(), { now: FIXED_NOW_MS });
    const labels = extractFieldLabels(entry);
    expect(labels).toEqual(REQUIRED_FIELD_ORDER);
    expect(labels[0]).toBe("decision");
  });

  test("the decision sentence text itself appears before any other declared field's label", () => {
    const ctx = buildCtx({ decision: "a uniquely identifiable decision sentence 9f3c" });
    const entry = devModule.renderEscalationEntry(buildDisposition(), ctx, { now: FIXED_NOW_MS });
    const decisionIndex = entry.indexOf("a uniquely identifiable decision sentence 9f3c");
    const featureLabelIndex = entry.search(/\bFeature\b/);
    expect(decisionIndex).toBeGreaterThanOrEqual(0);
    expect(featureLabelIndex).toBeGreaterThanOrEqual(0);
    expect(decisionIndex).toBeLessThan(featureLabelIndex);
  });

  test("carries the heading's feature and seam, and the rendered timestamp round-trips to `now`", () => {
    const entry = devModule.renderEscalationEntry(buildDisposition(), buildCtx(), { now: FIXED_NOW_MS });
    expect(entry).toContain(FEATURE);
    expect(entry).toContain("A5");
    const tsMatch = entry.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/);
    expect(tsMatch).not.toBeNull();
    expect(new Date(tsMatch[0]).getTime()).toBe(FIXED_NOW_MS);
  });

  test("carries the refusal reason, diagnosis, proposed action and evidence content", () => {
    const disposition = buildDisposition({ reason: "budget-exhausted" });
    const entry = devModule.renderEscalationEntry(disposition, buildCtx(), { now: FIXED_NOW_MS });
    expect(entry).toContain("budget-exhausted");
    expect(entry).toContain(disposition.verdict.diagnosis);
    expect(entry).toContain(disposition.verdict.proposedAction);
    expect(entry).toContain(disposition.verdict.evidence[0]);
  });

  test("carries the pipeline state — phase id and that phase's outcome", () => {
    const ctx = buildCtx({ phase: "MERGE", phaseOutcome: "skipped" });
    const entry = devModule.renderEscalationEntry(buildDisposition(), ctx, { now: FIXED_NOW_MS });
    expect(entry).toContain("MERGE");
    expect(entry).toContain("skipped");
  });

  test("is pure — takes the timestamp as an argument rather than reading a clock; two calls with the same inputs deep-equal", () => {
    const disposition = buildDisposition();
    const ctx = buildCtx();
    const a = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
    const b = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
    expect(a).toBe(b);
  });

  test("does not mutate its disposition or ctx arguments", () => {
    const disposition = buildDisposition();
    const ctx = buildCtx();
    const dispositionBefore = JSON.parse(JSON.stringify(disposition));
    const ctxBefore = JSON.parse(JSON.stringify(ctx));
    devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
    expect(disposition).toEqual(dispositionBefore);
    expect(ctx).toEqual(ctxBefore);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-02 — append-only, newest-last; the first entry is byte-unmodified (T-09-2, AC-10.4, L-1).
// ---------------------------------------------------------------------------

describe("PROP-ESC-02 — append-only, newest-last; the first entry is unmodified (T-09-2)", () => {
  test("two escalations for the same feature and seam produce two entries, newest last", async () => {
    const file = makeFileDouble();
    const disposition = buildDisposition();
    const ctx = buildCtx();

    await devModule.appendEscalationEntry({
      disposition,
      ctx,
      _appendFile: file._appendFile,
      _now: () => FIXED_NOW_MS,
    });
    const afterFirst = file.files[ESCALATIONS_PATH];

    const laterCtx = buildCtx({ decision: "a second, later decision sentence" });
    await devModule.appendEscalationEntry({
      disposition,
      ctx: laterCtx,
      _appendFile: file._appendFile,
      _now: () => FIXED_NOW_MS + 1000,
    });
    const afterSecond = file.files[ESCALATIONS_PATH];

    // The first entry's bytes are an unmodified prefix of the file after the second append.
    expect(afterSecond.startsWith(afterFirst)).toBe(true);
    // The second entry's own content is present, appended after the first.
    expect(afterSecond.slice(afterFirst.length)).toContain("a second, later decision sentence");
    // Exactly two `##` entry headings.
    expect((afterSecond.match(/^## /gm) || []).length).toBe(2);
  });

  test("appendEscalationEntry only ever calls the append transport, never a write/overwrite transport", async () => {
    const file = makeFileDouble();
    await devModule.appendEscalationEntry({
      disposition: buildDisposition(),
      ctx: buildCtx(),
      _appendFile: file._appendFile,
      _now: () => FIXED_NOW_MS,
    });
    expect(file.writes).toEqual([]);
    expect(file.appends.length).toBe(1);
    expect(file.appends[0].path).toBe(ESCALATIONS_PATH);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-03 — nothing in the tier reads ESCALATIONS.md (TSPEC §17.2, L-1, DEC-ADV-09).
// ---------------------------------------------------------------------------

describe("PROP-ESC-03 — nothing in the tier reads docs/_queue/ESCALATIONS.md", () => {
  // Unlike the other blocks in this file, this scan needs no not-yet-existing symbol, so it runs
  // today (not `skipped-describe`) — the absence-of-a-reader claim is true vacuously before A-21 too,
  // and stays true afterward because it is enforced by this same scan every run.
  const READ_CALL_NEAR_ESCALATIONS = /\b(?:_readFile|readFile|readFileSync)\s*\([^)]*ESCALATIONS/;

  test("orchestrate-dev.js has no read call naming ESCALATIONS", () => {
    expect(DEV_SOURCE).not.toMatch(READ_CALL_NEAR_ESCALATIONS);
  });

  test("orchestrate-queue.js has no read call naming ESCALATIONS", () => {
    expect(QUEUE_SOURCE).not.toMatch(READ_CALL_NEAR_ESCALATIONS);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-04 — docs/_queue/ and ESCALATIONS.md are created when absent (T-09-7).
// ---------------------------------------------------------------------------

describe("PROP-ESC-04 — docs/_queue/ is created when absent (T-09-7)", () => {
  let scratch;

  beforeEach(() => {
    scratch = mkdtempSync(join(tmpdir(), "pdlc-adv-esc-scratch-"));
  });

  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  test("neither ESCALATIONS.md nor docs/_queue/ exists: both are created and the entry is written (real fs)", () => {
    const queueDir = join(scratch, "docs", "_queue");
    const escalationsFile = join(queueDir, "ESCALATIONS.md");
    expect(existsSync(queueDir)).toBe(false);
    expect(existsSync(escalationsFile)).toBe(false);

    devModule.defaultAppendFile(escalationsFile, "## entry one\n\ncontent\n");

    expect(existsSync(queueDir)).toBe(true);
    expect(existsSync(escalationsFile)).toBe(true);
    expect(readFileSync(escalationsFile, "utf8")).toContain("entry one");
  });

  test("docs/_queue/ already exists: the append still succeeds and the file is created", () => {
    const queueDir = join(scratch, "docs", "_queue");
    const escalationsFile = join(queueDir, "ESCALATIONS.md");
    devModule.defaultAppendFile(join(queueDir, ".keep"), "");
    expect(existsSync(queueDir)).toBe(true);
    expect(existsSync(escalationsFile)).toBe(false);

    devModule.defaultAppendFile(escalationsFile, "## entry one\n\ncontent\n");

    expect(existsSync(escalationsFile)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-05 — the write-failure asymmetry with a failed record write (T-09-8, R-2).
// ---------------------------------------------------------------------------

describe("PROP-ESC-05 — a failed escalation-log write is asymmetric with a failed record write (T-09-8)", () => {
  // Transcribed call-site mechanism (TSPEC §10.1 / §4.6): `appendEscalationEntry` is invoked
  // OUTSIDE the try/catch that governs the seam's action, so its own throw can only ever be
  // downgraded to a report notice — it never has the chance to veto or revert an already-decided
  // disposition, unlike a failed *record* write (§9.2, R-2), which is invoked inside that try and
  // does revert. This mini call-site re-statement is a pure re-expression of that one control-flow
  // fact, not a new implementation to test against itself — it exercises real `appendEscalationEntry`.
  async function simulateEscalationLogStep(disposition, appendCall, notices) {
    try {
      await appendCall();
    } catch (err) {
      notices.push(`escalation log write failed: ${err.message}`);
    }
    return disposition; // unchanged regardless of the try/catch outcome above
  }

  test("all five conjuncts hold when appendEscalationEntry throws", async () => {
    const file = makeFileDouble({ throwOn: new Set([ESCALATIONS_PATH]) });
    const disposition = buildDisposition({ outcome: "escalated" });
    const notices = [];
    let applied = false; // stands in for "nothing was applied" — never set inside this step.

    const finalDisposition = await simulateEscalationLogStep(
      disposition,
      () =>
        devModule.appendEscalationEntry({
          disposition,
          ctx: buildCtx(),
          _appendFile: file._appendFile,
          _now: () => FIXED_NOW_MS,
        }),
      notices
    );

    // 1. the seam still reports `escalated`.
    expect(finalDisposition.outcome).toBe("escalated");
    // 2. the disposition is not `resolved`.
    expect(finalDisposition.outcome).not.toBe("resolved");
    // 3. nothing was applied.
    expect(applied).toBe(false);
    // 4. the attempted write is recorded (the pre-advisory behaviour proceeds independently of it).
    expect(file.appends.length).toBe(1);
    // 5. the failed write is named on the run report (the notices channel).
    expect(notices.some((n) => /escalation log write failed/.test(n))).toBe(true);
  });

  test("appendEscalationEntry itself still throws on a failing transport (the driver, not this function, catches it)", async () => {
    const file = makeFileDouble({ throwOn: new Set([ESCALATIONS_PATH]) });
    await expect(
      devModule.appendEscalationEntry({
        disposition: buildDisposition(),
        ctx: buildCtx(),
        _appendFile: file._appendFile,
        _now: () => FIXED_NOW_MS,
      })
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-07 — MERGE_ESCALATIONS is byte-identical to its pre-feature value; ADVISORY_ESCALATIONS
// is a sibling, never a widening (T-09-5, N-1, AC-10.5).
// ---------------------------------------------------------------------------

describe("PROP-ESC-07 — MERGE_ESCALATIONS is untouched; a frozen own-property snapshot (T-09-5)", () => {
  // MERGE_ESCALATIONS already exists at HEAD (pre-feature) — this half of the property needs no
  // not-yet-existing symbol, so it runs today.
  const MERGE_ESCALATIONS_KEYS = ["guard", "ci", "queue", "tree"];

  test("own-property key set is exactly the pre-feature four members", () => {
    expect(Object.keys(devModule.MERGE_ESCALATIONS).sort()).toEqual([...MERGE_ESCALATIONS_KEYS].sort());
  });

  test("is frozen", () => {
    expect(Object.isFrozen(devModule.MERGE_ESCALATIONS)).toBe(true);
  });

  test("every member is a function of the pre-feature arity/shape", () => {
    for (const key of MERGE_ESCALATIONS_KEYS) {
      expect(typeof devModule.MERGE_ESCALATIONS[key]).toBe("function");
    }
  });
});

describe("PROP-ESC-07 — ADVISORY_ESCALATIONS is a sibling catalogue, not a widening of MERGE_ESCALATIONS", () => {
  test("MERGE_ESCALATIONS' own-property set does not gain the advisory member", () => {
    expect(Object.keys(devModule.MERGE_ESCALATIONS)).not.toContain("seam");
  });

  test("ADVISORY_ESCALATIONS is its own frozen object, not merged onto MERGE_ESCALATIONS", () => {
    expect(devModule.ADVISORY_ESCALATIONS).toBeDefined();
    expect(devModule.ADVISORY_ESCALATIONS).not.toBe(devModule.MERGE_ESCALATIONS);
    expect(Object.isFrozen(devModule.ADVISORY_ESCALATIONS)).toBe(true);
    expect(Object.keys(devModule.ADVISORY_ESCALATIONS)).toEqual(["seam"]);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-08 — the advisory notice carries its own distinct prefix and one grep for `ESCALATION:`
// finds both catalogues (T-09-6, N-2, N-3, AC-10.5).
// ---------------------------------------------------------------------------

describe("PROP-ESC-08 — a distinct advisory prefix; one grep finds both notice kinds (T-09-6)", () => {
  test("the advisory notice names the seam and points at ESCALATIONS.md", () => {
    const notice = devModule.ADVISORY_ESCALATIONS.seam({ seam: "A5", feature: FEATURE, reason: "budget-exhausted" });
    expect(notice).toContain("A5");
    expect(notice).toContain(FEATURE);
    expect(notice).toContain("ESCALATIONS.md");
  });

  test("the advisory prefix is distinct from the merge prefix", () => {
    const advisoryNotice = devModule.ADVISORY_ESCALATIONS.seam({ seam: "A5", feature: FEATURE, reason: "x" });
    const mergeNotice = devModule.MERGE_ESCALATIONS.guard({ prUrl: "https://x/pr/1", tail: "y" });
    expect(advisoryNotice.slice(0, advisoryNotice.indexOf(":"))).not.toBe(mergeNotice.slice(0, mergeNotice.indexOf(":")));
  });

  test("one grep for ESCALATION: finds both a merge notice and an advisory notice on the same report", () => {
    const mergeNotice = devModule.MERGE_ESCALATIONS.ci({ prUrl: "https://x/pr/1" });
    const advisoryNotice = devModule.ADVISORY_ESCALATIONS.seam({ seam: "A2", feature: FEATURE, reason: "record-write-failed" });
    const notices = [mergeNotice, advisoryNotice];

    const matches = notices.filter((n) => /ESCALATION:/.test(n));
    expect(matches.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-09 — advisory notices ride the existing notices channel (N-4, AC-10.5).
// ---------------------------------------------------------------------------

describe("PROP-ESC-09 — advisory notices ride the existing notices array, not a new channel", () => {
  test("a merge notice and an advisory notice can share one plain notices array", () => {
    const notices = [];
    notices.push(devModule.MERGE_ESCALATIONS.tree({ prUrl: "https://x/pr/1", reason: "dirty", branch: "feat-x" }));
    notices.push(devModule.ADVISORY_ESCALATIONS.seam({ seam: "A5", feature: FEATURE, reason: "low-confidence" }));
    expect(notices.length).toBe(2);
    expect(notices.every((n) => typeof n === "string" && /ESCALATION:/.test(n))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// P-7 — generator-driven: renderEscalationEntry is total over reason × seam × disposition, always
// leads with the decision sentence, and is append-safe (PROPERTIES §11).
// ---------------------------------------------------------------------------

describe("P-7 — renderEscalationEntry: totality + decision-first + append-safety over generated inputs", () => {
  const DRAWS = 40; // bounded per §11's Hypothesis-style hygiene note for P-6/P-7.

  function fromDraw(draw, i) {
    const disposition = {
      outcome: draw.disposition,
      reason: draw.reason,
      verdict: {
        seam: draw.seam,
        diagnosis: `diagnosis-${i}`,
        proposedAction: `action-${i}`,
        confidence: "high",
        withinEnvelope: false,
        evidence: [`file-${i}.js:${i}`],
      },
      attempts: draw.attempts,
      model: draw.model,
      fallback: draw.fallback,
    };
    const ctx = {
      feature: FEATURE,
      seam: draw.seam,
      phase: "PUB",
      phaseOutcome: "halted",
      decision: `decision-${i}`,
    };
    return { disposition, ctx };
  }

  test(`is total (never throws) and always emits exactly the eight fields, decision first, over ${DRAWS} generated draws`, () => {
    const gen = makeAdvisoryGenerators(SEED);

    for (let i = 0; i < DRAWS; i += 1) {
      const draw = gen.entryFields();
      const { disposition, ctx } = fromDraw(draw, i);

      let entry;
      expect(() => {
        entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
      }).not.toThrow();

      const labels = extractFieldLabels(entry);
      expect(new Set(labels)).toEqual(new Set(REQUIRED_FIELD_ORDER));
      expect(labels[0]).toBe("decision");
    }
  });

  test("is append-safe: two independently rendered entries, concatenated, equal two sequential appends", async () => {
    const gen = makeAdvisoryGenerators(SEED);

    for (let i = 0; i < 10; i += 1) {
      const draw1 = gen.entryFields();
      const draw2 = gen.entryFields();
      const first = fromDraw(draw1, `${i}-a`);
      const second = fromDraw(draw2, `${i}-b`);

      const renderedConcat =
        devModule.renderEscalationEntry(first.disposition, first.ctx, { now: FIXED_NOW_MS }) +
        devModule.renderEscalationEntry(second.disposition, second.ctx, { now: FIXED_NOW_MS + 1 });

      const file = makeFileDouble();
      await devModule.appendEscalationEntry({
        disposition: first.disposition,
        ctx: first.ctx,
        _appendFile: file._appendFile,
        _now: () => FIXED_NOW_MS,
      });
      await devModule.appendEscalationEntry({
        disposition: second.disposition,
        ctx: second.ctx,
        _appendFile: file._appendFile,
        _now: () => FIXED_NOW_MS + 1,
      });

      expect(file.files[ESCALATIONS_PATH]).toBe(renderedConcat);
    }
  });

  test("is reproducible: replaying the same seed from the start draws the same sequence", () => {
    const genA = makeAdvisoryGenerators(SEED);
    const genB = makeAdvisoryGenerators(SEED);
    for (let i = 0; i < 5; i += 1) {
      expect(genA.entryFields()).toEqual(genB.entryFields());
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// A6-17 — pdlc-advisory-wave-gate's escalation-log properties (AWG PROP-REC-03, -04, -06, -07).
//
// Two features' property ids collide on the `PROP-REC-*` prefix; every block below is titled
// `AWG` for the wave-gate feature's numbering, and the tier's own `PROP-ESC-*` blocks above are
// untouched.
//
// These are Integration-level, and the caller they drive is the SHIPPED one: `runWaveGateSeam`
// (orchestrate-dev.js:3490+), the production A6 call site, which builds the real `buildA6SeamOps`,
// enters the real `runAdvisorySeam`, and reaches the real `appendEscalationEntry` through the
// driver's own step-7 writer at orchestrate-dev.js:4076-4078. Nothing below constructs a
// disposition literal and hands it to the renderer — a renderer that emitted the class perfectly
// while no production path ever annotated one would pass such a test and fail the operator
// (CR round 1: an AC claiming an operator-visible artifact is only met when a production caller
// produces it). `_git` is a real, disposable repository (`makeRealRepoFixture`) because A6's step 4
// captures a tree snapshot before dispatching; every other collaborator is a canonical double.
// ═══════════════════════════════════════════════════════════════════════════

const AWG_FEATURE = "pdlc-advisory-wave-gate";

// The escalation entry's field order for an A6 escalation: the tier's eight, with the annotated
// class immediately after the refusal reason (orchestrate-dev.js:3762).
const AWG_A6_FIELD_ORDER = Object.freeze([
  "decision",
  "feature",
  "seam",
  "refusalReason",
  "rootCause",
  "diagnosis",
  "proposedAction",
  "evidence",
  "pipelineState",
]);

const AWG_GATE_OUTPUT = "the gate went red at the eslint step";

// One full A6 invocation through the shipped call site. `reply` is the agent's raw text; the
// returned handle exposes the seam's own result plus everything the run wrote or said, so each
// property below reads its oracle off the written artifact rather than off an internal.
async function runA6Escalation({ reply, appendThrowsOn = new Set(), waveNum = 2, files: sharedFiles, feature = AWG_FEATURE } = {}) {
  const repo = makeRealRepoFixture({ prefix: "pdlc-a6-esc-" });
  // A caller may pass its own file double to accumulate several runs' entries in ONE
  // `ESCALATIONS.md`, which is exactly what AWG PROP-REC-06's counting oracle needs.
  const files = sharedFiles || makeFileDouble({ throwOn: appendThrowsOn });
  const clock = makeFakeClock();
  const notices = [];
  try {
    const result = await devModule.runWaveGateSeam({
      feature,
      waveNum,
      waves: [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["b.js"] }]],
      waveIndex: 1,
      tasks: [],
      implConfig: { postWaveCommand: null, testCommand: "npm test" },
      scriptGate: true,
      gateResult: { output: AWG_GATE_OUTPUT },
      invocations: [],
      advisoryTierOn: true,
      advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 1 }).config,
      rungState: {},
      waveBudget: { resolved: 0 },
      _git: repo._git,
      _agent: makeAgentDouble({ script: [reply] }),
      _runCommand: async () => ({ ok: true }),
      _appendFile: files._appendFile,
      _readFile: files._readFile,
      _now: clock._now,
      _sleep: clock._sleep,
      _notice: (n) => notices.push(n),
      _log: () => {},
    });
    return { result, notices, log: files.files[ESCALATIONS_PATH] };
  } finally {
    repo.cleanup();
  }
}

// An out-of-envelope A6 reply: well-formed, cites the gate output verbatim, names a class, and
// proposes an action A6's envelope does not permit (E-2) — so the seam refuses at GATE and
// escalates without touching the tree.
function awgOutOfEnvelopeReply(rootCause = "plan-ordering-defect") {
  return makeA6ReplyText({
    proposedAction: "E-2",
    rootCause,
    evidence: [AWG_GATE_OUTPUT],
    diagnosis: "wave 2's gate needs a symbol a later task owns",
  });
}

describe("A6-17 / AWG PROP-REC-03 — an A6 escalation logs the root-cause class alongside the tier's fields", () => {
  test("the written entry declares exactly the tier's eight fields plus Root cause, in order", async () => {
    const { result, log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply() });

    expect(result.disposition.outcome).toBe("escalated");
    expect(log).toBeDefined();
    expect(extractFieldLabels(log)).toEqual([...AWG_A6_FIELD_ORDER]);
    expect(log).toContain("| Root cause | plan-ordering-defect |");
    expect(log).toContain(`| Feature | ${AWG_FEATURE} |`);
    expect(log).toContain("| Refusal reason | out-of-envelope |");
  });

  test("the decision sentence is first and states what the operator must decide", async () => {
    const { log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply() });
    const decideLine = log.split("\n").find((l) => l.startsWith("**Decide:**"));

    expect(decideLine).toBeDefined();
    expect(extractFieldLabels(log)[0]).toBe("decision");
    expect(decideLine).toContain("out-of-envelope");
    expect(decideLine).toContain("changed nothing");
  });

  test.each(["plan-ordering-defect", "wave-internal-defect", "environmental"])(
    "the class the reply named (%s) is the class the log carries — not a fixed literal",
    async (rootCause) => {
      const { log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply(rootCause) });
      expect(log).toContain(`| Root cause | ${rootCause} |`);
    }
  );

  test("a reply naming no class still logs one row, reading `unclassified` — the field is total", async () => {
    const reply = makeA6ReplyText({ proposedAction: "E-2", rootCause: "not-a-class", evidence: [AWG_GATE_OUTPUT] });
    const { log } = await runA6Escalation({ reply });

    expect(extractFieldLabels(log)).toEqual([...AWG_A6_FIELD_ORDER]);
    expect(log).toContain("| Root cause | unclassified |");
  });
});

// ---------------------------------------------------------------------------
// AWG PROP-REC-07 — *Pipeline state* is derived PER SEAM, never passed per call site: A6's entry
// reads phase `I` with outcome `halted`, while A3–A5's entries written by the same shipped writer
// keep their own values. The oracle is the WRITTEN ENTRY, not the constant: `ADVISORY_SEAM_PHASES`
// is module-private (orchestrate-dev.js:3805) and unexported, but an unregistered seam falls back
// to the literal `unknown` at the call site (orchestrate-dev.js:4079-4080), so a missing `A6` row
// would be observable here as `unknown — unknown`. That fallback is the negative control.
// ---------------------------------------------------------------------------

// Drives the tier driver directly for seams that have no wave-gate call site — the only way to
// observe the per-seam derivation for a seam OTHER than A6, and the only way to reach the
// unregistered-seam fallback (no shipped call site passes an unknown seam).
async function runDriverEscalation({ seam, files = makeFileDouble() }) {
  const clock = makeFakeClock();
  const reply = [
    `SEAM: ${seam}`,
    "DIAGNOSIS: the gate is red for a reason this seam may not act on",
    "PROPOSED-ACTION: E-2",
    "CONFIDENCE: high",
    "WITHIN-ENVELOPE: yes",
    "EVIDENCE: the gate output line this reply cites verbatim",
  ].join("\n");

  const terminal = await devModule.runAdvisorySeam({
    seam,
    feature: AWG_FEATURE,
    // `permittedActions: []` refuses whatever is proposed at GATE, so the invocation escalates
    // `out-of-envelope` without any seam-specific machinery.
    seamOps: makeSeamOps(buildSeamOpsOverrides([], [])),
    config: makeAdvisoryConfig({ enabled: true, attemptBudget: 1 }).config,
    rungState: {},
    _agent: makeAgentDouble({ script: [reply] }),
    _appendFile: files._appendFile,
    _readFile: files._readFile,
    _git: async () => ({ ok: true, stdout: "", stderr: "" }),
    _now: clock._now,
    _sleep: clock._sleep,
    _notice: () => {},
    _log: () => {},
  });
  return { terminal, log: files.files[ESCALATIONS_PATH] };
}

describe("A6-17 / AWG PROP-REC-07 — Pipeline state is derived per seam", () => {
  test("A6's written entry reads phase I, outcome halted", async () => {
    const { log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply() });
    expect(log).toContain("**Pipeline state.** I — halted");
  });

  test.each([
    ["A3", "DOD — halted"],
    ["A4", "DOD — halted"],
    ["A5", "PUB — halted"],
  ])("%s's entry keeps its own value on the same shipped writer", async (seam, expected) => {
    const { terminal, log } = await runDriverEscalation({ seam });
    expect(terminal.outcome).toBe("escalated");
    expect(log).toContain(`**Pipeline state.** ${expected}`);
  });

  test("negative control — an unregistered seam falls back to `unknown — unknown`, which is what a missing A6 row would look like", async () => {
    const { log } = await runDriverEscalation({ seam: "A9" });
    expect(log).toContain("**Pipeline state.** unknown — unknown");
  });

  test("A6 and A5 entries appended to the same log keep DIFFERENT pipeline states", async () => {
    const files = makeFileDouble();
    await runDriverEscalation({ seam: "A5", files });
    const before = files.files[ESCALATIONS_PATH];
    const { log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply(), files });

    expect(before).toContain("**Pipeline state.** PUB — halted");
    expect(log.startsWith(before)).toBe(true);
    expect(log.slice(before.length)).toContain("**Pipeline state.** I — halted");
  });
});

// ---------------------------------------------------------------------------
// AWG PROP-REC-04 — a failed escalation-log write never changes the disposition. The seam stays
// `escalated`, the halt fields are byte-for-byte what a successful write would have produced, the
// failure is surfaced on the report's notice channel, and nothing is upgraded to `resolved`
// (E-30; the asymmetry with §9.2's record write, which does revert — PROP-ESC-05 above).
// ---------------------------------------------------------------------------

describe("A6-17 / AWG PROP-REC-04 — a failed escalation-log write is surfaced, never healed", () => {
  test("the seam's result is identical to the succeeding-write run, and the failure rides the notice channel", async () => {
    const reply = awgOutOfEnvelopeReply();
    const clean = await runA6Escalation({ reply });
    const failed = await runA6Escalation({ reply, appendThrowsOn: new Set([ESCALATIONS_PATH]) });

    expect(failed.result).toEqual(clean.result);
    expect(failed.result.resolved).toBe(false);
    expect(failed.result.disposition.outcome).toBe("escalated");
    expect(failed.log).toBeUndefined();

    // All three notices are present: the operator is told the seam escalated EVEN THOUGH the log
    // could not be reached, is told separately that the log write itself failed, and is told
    // (BR-14/PROP-REC-11) that a pre-repair snapshot was captured before this halt.
    // Order is not asserted: no upstream document fixes the notices' relative order, and pinning
    // the shipped one would be a property inventing a choice (PLAN P-9). Count and content ARE
    // asserted — exactly three notices, one of each kind.
    expect(failed.notices).toHaveLength(3);
    expect(failed.notices).toEqual(
      expect.arrayContaining([
        expect.stringContaining("ADVISORY ESCALATION: seam A6"),
        expect.stringContaining("ADVISORY escalation log write failed for seam A6"),
        expect.stringMatching(/overwrit/i),
      ])
    );
  });

  test("no notice claims a resolution, and the advisory record still carries the escalated disposition", async () => {
    const files = makeFileDouble({ throwOn: new Set([ESCALATIONS_PATH]) });
    const { result } = await runA6Escalation({ reply: awgOutOfEnvelopeReply(), files });
    const record = files.files[`docs/${AWG_FEATURE}/ADVISORY-${AWG_FEATURE}.md`];

    expect(result.disposition.outcome).toBe("escalated");
    expect(record).toContain("| Disposition | escalated — out-of-envelope |");
    expect(record).not.toContain("| Disposition | resolved |");
  });
});

// ---------------------------------------------------------------------------
// AWG PROP-REC-06 — `plan-ordering-defect` escalations are countable PER FEATURE from
// `ESCALATIONS.md` alone: no run log, no advisory record. The paired negative is specified, not a
// gap: resolutions are NOT countable from this log, because the driver writes here only for an
// `escalated` terminal disposition (orchestrate-dev.js:4075) and the advisory record that does
// carry resolutions is distilled into LEARNINGS and deleted after Phase PUB (REQ O-2).
// ---------------------------------------------------------------------------

// The counting oracle an operator would actually run, expressed once: split the append-only log on
// its entry headings and read the two fields the count is scoped by. Deliberately structural — it
// reads only the log's own bytes, so a count it produces is a count a human with `grep` can too.
function countEscalations(log, { feature, rootCause }) {
  return log
    .split(/^## /m)
    .slice(1)
    .filter((entry) => entry.includes(`| Feature | ${feature} |`) && entry.includes(`| Root cause | ${rootCause} |`))
    .length;
}

describe("A6-17 / AWG PROP-REC-06 — the class is countable per feature from the log alone", () => {
  test("four runs across two features and two classes yield the right per-feature count", async () => {
    const files = makeFileDouble();
    await runA6Escalation({ reply: awgOutOfEnvelopeReply("plan-ordering-defect"), files, waveNum: 2 });
    await runA6Escalation({ reply: awgOutOfEnvelopeReply("environmental"), files, waveNum: 3 });
    await runA6Escalation({ reply: awgOutOfEnvelopeReply("plan-ordering-defect"), files, waveNum: 4 });
    const { log } = await runA6Escalation({
      reply: awgOutOfEnvelopeReply("plan-ordering-defect"),
      files,
      feature: "some-other-feature",
    });

    expect(countEscalations(log, { feature: AWG_FEATURE, rootCause: "plan-ordering-defect" })).toBe(2);
    expect(countEscalations(log, { feature: AWG_FEATURE, rootCause: "environmental" })).toBe(1);
    expect(countEscalations(log, { feature: "some-other-feature", rootCause: "plan-ordering-defect" })).toBe(1);
    expect(countEscalations(log, { feature: AWG_FEATURE, rootCause: "wave-internal-defect" })).toBe(0);
  });

  test("the count needs no run log and no advisory record — the log's own bytes suffice", async () => {
    const files = makeFileDouble();
    await runA6Escalation({ reply: awgOutOfEnvelopeReply("plan-ordering-defect"), files });
    const { log } = await runA6Escalation({ reply: awgOutOfEnvelopeReply("plan-ordering-defect"), files, waveNum: 3 });

    // Re-parsed from a copy of the bytes alone, with every other artifact discarded.
    expect(countEscalations(String(log), { feature: AWG_FEATURE, rootCause: "plan-ordering-defect" })).toBe(2);
  });

  test("negative half — a RESOLVED invocation writes an advisory-record entry and nothing to ESCALATIONS.md, so resolution counts are not derivable from this log", async () => {
    const files = makeFileDouble();
    const clock = makeFakeClock();
    const reply = [
      "SEAM: A3",
      "DIAGNOSIS: a stale citation the seam may rewrite",
      "PROPOSED-ACTION: E-2",
      "CONFIDENCE: high",
      "WITHIN-ENVELOPE: yes",
      "EVIDENCE: the citation line this reply names verbatim",
    ].join("\n");

    const terminal = await devModule.runAdvisorySeam({
      seam: "A3",
      feature: AWG_FEATURE,
      seamOps: makeSeamOps(buildSeamOpsOverrides(["E-2"], [])),
      config: makeAdvisoryConfig({ enabled: true, attemptBudget: 1 }).config,
      rungState: {},
      _agent: makeAgentDouble({ script: [reply] }),
      _appendFile: files._appendFile,
      _readFile: files._readFile,
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _now: clock._now,
      _sleep: clock._sleep,
      _notice: () => {},
      _log: () => {},
    });

    expect(terminal.outcome).toBe("resolved");
    expect(files.files[`docs/${AWG_FEATURE}/ADVISORY-${AWG_FEATURE}.md`]).toContain("| Disposition | resolved |");
    expect(files.files[ESCALATIONS_PATH]).toBeUndefined();
  });
});
