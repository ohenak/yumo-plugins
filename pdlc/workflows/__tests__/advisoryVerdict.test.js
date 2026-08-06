/**
 * advisoryVerdict.test.js — PLAN A-05 (batch 3, depends on A-02).
 *
 * RED (authored `skipped-describe`, un-skipped by the 🟢 owner). Every case below lives inside
 * `skipped-describe("A-19 — verdict + budgets", ...)` — the block A-19 (batch 6) un-skips, per
 * PLAN §3's un-skipper rule: A-19 is the task that lands `parseAdvisoryVerdict` and
 * `budgetExceeded` on `orchestrate-dev.js`.
 *
 * **No FSPEC T-02 case lives here.** T-02-1/T-02-2/T-02-3 (FSPEC:284-286) and T-02-4/T-02-5
 * (FSPEC:287-288) are whole-lifecycle / attempt-loop cases provable only against
 * `runAdvisorySeam`, and — per PLAN §3's un-skipper rule — belong to A-07/A-22 in
 * `advisoryDriver.test.js`, not to a file un-skipped at batch 6. This file's obligation is the
 * **unit** surface of the two leaves: `parseAdvisoryVerdict`'s five malformedness rules
 * (TSPEC §4.2/§4.4) and `budgetExceeded`'s arithmetic including the A5 rollup-wait carve-out
 * (TSPEC §4.5), over injected values with no driver in the picture. Carries PLAN §6.5 properties
 * P-2 (`parseAdvisoryVerdict` totality + partition) and P-3 (`budgetExceeded` monotone in
 * elapsed time, invariant under the `waitMs` carve-out).
 *
 * **Import shape.** Under this project's native-ESM jest runtime, a named import of a binding a
 * module does not yet provide fails the whole file to load with a `SyntaxError` naming the
 * missing export (see `mergeConfig.test.js`'s header for the precedent). Neither
 * `parseAdvisoryVerdict` nor `budgetExceeded` (nor `ADVISORY_SEAMS`) is exported by
 * `orchestrate-dev.js` yet at A-05, so this file imports the module as a namespace
 * (`import * as dev`) and reaches both symbols as `dev.parseAdvisoryVerdict` /
 * `dev.budgetExceeded` from inside the (skipped) case bodies only — mirroring
 * `advisoryPreflight.test.js`'s own `devModule` import.
 *
 * **`parseAdvisoryVerdict`'s second parameter.** FSPEC §4.2 row 1 and PROPERTIES PROP-VER-03(a)
 * both require a "wrong seam" rule stated as "`seam` ≠ dispatched seam" — a comparison that
 * needs the seam `runAdvisorySeam` actually dispatched, which a single `raw`-only parameter
 * cannot supply. This RED task therefore fixes the contract A-19 implements against as
 * `parseAdvisoryVerdict(raw, dispatchedSeam)`: pure, still total, `dispatchedSeam` never
 * mutated or inferred from `raw`.
 *
 * **Raw-text grammar.** `makeAdvisoryGenerators` (`advisoryDoubles.js`, A-02) already fixes the
 * trailer-line grammar `parseAdvisoryVerdict` must parse — one `KEY: value` line per field,
 * keys `SEAM` / `DIAGNOSIS` / `PROPOSED-ACTION` / `CONFIDENCE` / `WITHIN-ENVELOPE` / `EVIDENCE`,
 * `EVIDENCE` a comma-joined list — predating this parser per that module's own header ("A later
 * task authoring the parser its generator feeds may need to adjust field-name spelling"). This
 * file's directly-authored fixtures below use the identical grammar so the two never drift.
 */

import * as dev from "../orchestrate-dev.js";
import { makeAdvisoryGenerators, seeded, resolveSeed } from "./helpers/advisoryDoubles.js";

/** This file's literal seed. `PDLC_PROP_SEED` overrides it — see `resolveSeed`. */
const VERDICT_PROP_SEED = 20260805;

/** Builds one well-formed raw verdict trailer, grammar owned by `advisoryDoubles.js`. */
function verdictFixture({
  seam = "A1",
  diagnosis = "diagnosis text",
  proposedAction = "do the thing",
  confidence = "high",
  withinEnvelope = "yes",
  evidence = ["file.js:12"],
} = {}) {
  const lines = [
    `SEAM: ${seam}`,
    `DIAGNOSIS: ${diagnosis}`,
    `PROPOSED-ACTION: ${proposedAction}`,
    `CONFIDENCE: ${confidence}`,
    `WITHIN-ENVELOPE: ${withinEnvelope}`,
    `EVIDENCE: ${evidence.join(", ")}`,
  ];
  return lines.join("\n");
}

/** Drops one line entirely — used for the "absent handling" (missing `proposedAction`) rule. */
function verdictFixtureMissingKey(key) {
  const full = verdictFixture().split("\n");
  const prefix = { seam: "SEAM", diagnosis: "DIAGNOSIS", proposedAction: "PROPOSED-ACTION" }[key];
  return full.filter((line) => !line.startsWith(`${prefix}:`)).join("\n");
}

describe("A-19 — verdict + budgets", () => {
  describe("parseAdvisoryVerdict — PROP-VER-01/02/04/05, five malformedness rules (PROP-VER-03)", () => {
    // ─── PROP-VER-01 — pure, total, never throws ──────────────────────────
    test.each([
      ["empty string", ""],
      ["whitespace only", "   \n\t  "],
      ["prose with no trailer at all", "The agent thought about it and decided to punt."],
      ["truncated JSON-looking text", '{"seam": "A1", "diagn'],
      ["the trailer repeated twice", `${verdictFixture()}\n\n${verdictFixture({ seam: "A2" })}`],
    ])("never throws on: %s", (_label, raw) => {
      expect(() => dev.parseAdvisoryVerdict(raw, "A1")).not.toThrow();
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result).toHaveProperty("verdict");
      expect(result).toHaveProperty("malformed");
      expect(result).toHaveProperty("why");
      expect(typeof result.malformed).toBe("boolean");
    });

    test("a bare empty/prose input is malformed, not a false well-formed parse", () => {
      const result = dev.parseAdvisoryVerdict("not a verdict at all", "A1");
      expect(result.malformed).toBe(true);
      expect(result.verdict).toBeNull();
    });

    // ─── PROP-VER-02 — well-formed verdict carries exactly six fields ────
    test("a well-formed verdict parses to exactly the six AdvisoryVerdict fields", () => {
      const raw = verdictFixture({
        seam: "A3",
        diagnosis: "the rebase conflict is in a branch-created file",
        proposedAction: "resolve the conflict",
        confidence: "high",
        withinEnvelope: "yes",
        evidence: ["docs/FEATURE.md:10", "src/thing.js:22"],
      });
      const result = dev.parseAdvisoryVerdict(raw, "A3");
      expect(result.malformed).toBe(false);
      expect(result.verdict).toEqual({
        seam: "A3",
        diagnosis: "the rebase conflict is in a branch-created file",
        proposedAction: "resolve the conflict",
        confidence: "high",
        withinEnvelope: true,
        evidence: ["docs/FEATURE.md:10", "src/thing.js:22"],
      });
      expect(Object.keys(result.verdict).sort()).toEqual(
        ["confidence", "diagnosis", "evidence", "proposedAction", "seam", "withinEnvelope"].sort()
      );
    });

    // ─── PROP-VER-03 — the five malformedness rules, each falsifiable alone ─
    test("(a) seam ≠ dispatched seam ⇒ malformed, why names the seam field", () => {
      const raw = verdictFixture({ seam: "A2" });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(true);
      expect(result.why).toBe("seam");
    });

    test("(b) empty evidence ⇒ malformed, why names the evidence field", () => {
      const raw = verdictFixture({ evidence: [] });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(true);
      expect(result.why).toBe("evidence");
    });

    test("(c) empty diagnosis ⇒ malformed, why names the diagnosis field", () => {
      const raw = verdictFixture({ diagnosis: "" });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(true);
      expect(result.why).toBe("diagnosis");
    });

    test("(d) absent proposedAction handling ⇒ malformed, why names the proposedAction field", () => {
      const raw = verdictFixtureMissingKey("proposedAction");
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(true);
      expect(result.why).toBe("proposedAction");
    });

    test('an explicit "nothing" proposedAction is NOT malformed (FSPEC §4.4 row 4 — distinct from absent)', () => {
      const raw = verdictFixture({ proposedAction: "nothing" });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(false);
      expect(result.verdict.proposedAction).toBe("nothing");
    });

    test("(e) confidence outside the two-value enum ⇒ malformed, why names the confidence field", () => {
      const raw = verdictFixture({ confidence: "medium" });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(true);
      expect(result.why).toBe("confidence");
    });

    // ─── PROP-VER-04 — confidence exactly two-valued, never coerced ──────
    test.each([["medium"], ["HIGH"], ["1"], [""]])(
      "confidence %j is malformed, never silently coerced to a valid value",
      (badConfidence) => {
        const raw = verdictFixture({ confidence: badConfidence });
        const result = dev.parseAdvisoryVerdict(raw, "A1");
        expect(result.malformed).toBe(true);
        expect(result.verdict).toBeNull();
      }
    );

    test.each([["high"], ["low"]])("confidence %j parses cleanly, unmodified", (goodConfidence) => {
      const raw = verdictFixture({ confidence: goodConfidence });
      const result = dev.parseAdvisoryVerdict(raw, "A1");
      expect(result.malformed).toBe(false);
      expect(result.verdict.confidence).toBe(goodConfidence);
    });

    // ─── PROP-VER-05 — withinEnvelope is preserved data, never the membership decision ─
    test.each([
      ["yes", true],
      ["no", false],
    ])("withinEnvelope %j parses to %j and never blocks or forces a clean parse by itself", (raw_, expected) => {
      const result = dev.parseAdvisoryVerdict(verdictFixture({ withinEnvelope: raw_ }), "A1");
      expect(result.malformed).toBe(false);
      expect(result.verdict.withinEnvelope).toBe(expected);
    });

    // ─── P-2 — totality + partition over the generator's own shape space ──
    //
    // The shared generator (`advisoryDoubles.js`, A-02) draws one of six shapes per call:
    // well-formed, empty-evidence, empty-diagnosis, missing-action, nothing-action (itself
    // well-formed — "nothing" is a valid `proposedAction`, per FSPEC §4.4 row 4), and
    // bad-confidence. Its shape space does not include a "wrong seam" draw (there is no second
    // "dispatched seam" concept inside a single generated string), so that rule is covered
    // separately above by directly-authored fixtures (case (a)); P-2 is asserted here over the
    // four malformedness rules the generator does draw from, plus the well-formed case, and
    // requires every draw to land in exactly one of those five buckets.
    test("P-2: every generated raw verdict matches exactly one rule, or parses cleanly, never two, never none", () => {
      const seed = resolveSeed(VERDICT_PROP_SEED);
      const generators = makeAdvisoryGenerators(seed);
      const CASE_COUNT = 60;

      const buckets = { wellFormed: 0, emptyEvidence: 0, emptyDiagnosis: 0, missingAction: 0, badConfidence: 0 };

      for (let i = 0; i < CASE_COUNT; i++) {
        const raw = generators.verdictText();
        let result;
        expect(() => {
          result = dev.parseAdvisoryVerdict(raw, undefined);
        }).not.toThrow();

        const matchedRules = [];
        if (!result.malformed) matchedRules.push("wellFormed");
        if (result.malformed && result.why === "evidence") matchedRules.push("emptyEvidence");
        if (result.malformed && result.why === "diagnosis") matchedRules.push("emptyDiagnosis");
        if (result.malformed && result.why === "proposedAction") matchedRules.push("missingAction");
        if (result.malformed && result.why === "confidence") matchedRules.push("badConfidence");

        expect({ caseIndex: i, raw, matchedRules }).toEqual({ caseIndex: i, raw, matchedRules: [matchedRules[0]] });
        buckets[matchedRules[0]] += 1;
      }

      // Every named bucket is actually reachable at this seed and case count — a partition
      // proof over an empty bucket would be vacuous.
      for (const [bucket, count] of Object.entries(buckets)) {
        expect({ bucket, count, seed }).toEqual({ bucket, count: expect.any(Number), seed });
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  describe("budgetExceeded — PROP-BUD-01/02, P-3", () => {
    const BUDGET = { attemptBudget: 3, seamBudgetMinutes: 10 };
    const SEAM_BUDGET_MS = BUDGET.seamBudgetMinutes * 60_000;

    // ─── PROP-BUD-01 — pure arithmetic, true iff either bound is reached ──
    test.each([
      ["neither bound reached", { attempts: 1, elapsedMs: 1000, waitMs: 0 }, false],
      ["attempts at the budget", { attempts: 3, elapsedMs: 0, waitMs: 0 }, true],
      ["attempts past the budget", { attempts: 5, elapsedMs: 0, waitMs: 0 }, true],
      ["attempts one short of the budget, no time pressure", { attempts: 2, elapsedMs: 0, waitMs: 0 }, false],
      ["elapsed time exactly at the bound", { attempts: 1, elapsedMs: SEAM_BUDGET_MS, waitMs: 0 }, true],
      ["elapsed time one ms short of the bound", { attempts: 1, elapsedMs: SEAM_BUDGET_MS - 1, waitMs: 0 }, false],
      ["elapsed time past the bound", { attempts: 1, elapsedMs: SEAM_BUDGET_MS + 5000, waitMs: 0 }, true],
      [
        "elapsed time past the raw bound, but waitMs carve-out brings it back under",
        { attempts: 1, elapsedMs: SEAM_BUDGET_MS + 1000, waitMs: 2000 },
        false,
      ],
      [
        "elapsed time exactly at the bound after subtracting waitMs",
        { attempts: 1, elapsedMs: SEAM_BUDGET_MS + 2000, waitMs: 2000 },
        true,
      ],
      ["both bounds reached at once", { attempts: 3, elapsedMs: SEAM_BUDGET_MS, waitMs: 0 }, true],
    ])("%s", (_label, partial, expected) => {
      expect(dev.budgetExceeded({ ...BUDGET, ...partial })).toBe(expected);
    });

    test("is pure: repeated calls with the same arguments return the same result, arguments untouched", () => {
      const args = { ...BUDGET, attempts: 1, elapsedMs: 1000, waitMs: 0 };
      const snapshot = JSON.parse(JSON.stringify(args));
      const first = dev.budgetExceeded(args);
      const second = dev.budgetExceeded(args);
      expect(second).toBe(first);
      expect(args).toEqual(snapshot);
    });

    // ─── PROP-BUD-02 / P-3 carve-out — adding waitMs never flips false → true ─
    test("P-3 carve-out: for any fixed elapsedMs, increasing waitMs never flips false to true", () => {
      const seed = resolveSeed(VERDICT_PROP_SEED + 1);
      const rng = seeded(seed);
      const CASE_COUNT = 50;

      for (let i = 0; i < CASE_COUNT; i++) {
        const elapsedMs = rng.int(0, SEAM_BUDGET_MS * 2);
        const waitMsLow = rng.int(0, SEAM_BUDGET_MS);
        const waitMsHigh = waitMsLow + rng.int(0, SEAM_BUDGET_MS);

        const before = dev.budgetExceeded({ ...BUDGET, attempts: 1, elapsedMs, waitMs: waitMsLow });
        const after = dev.budgetExceeded({ ...BUDGET, attempts: 1, elapsedMs, waitMs: waitMsHigh });

        // before=false, after must also be false (never false -> true as waitMs grows).
        if (before === false) {
          expect({ caseIndex: i, seed, elapsedMs, waitMsLow, waitMsHigh, before, after }).toEqual({
            caseIndex: i,
            seed,
            elapsedMs,
            waitMsLow,
            waitMsHigh,
            before: false,
            after: false,
          });
        }
      }
    });

    // ─── P-3 monotonicity — true at t stays true at every t' > t, same budget ─
    test("P-3: once true at elapsed time t, stays true at every later t' > t (same budget)", () => {
      const seed = resolveSeed(VERDICT_PROP_SEED + 2);
      const rng = seeded(seed);
      const CASE_COUNT = 50;

      for (let i = 0; i < CASE_COUNT; i++) {
        const waitMs = rng.int(0, SEAM_BUDGET_MS);
        const t = rng.int(0, SEAM_BUDGET_MS * 3);
        const laterT = t + rng.int(1, SEAM_BUDGET_MS);

        const atT = dev.budgetExceeded({ ...BUDGET, attempts: 1, elapsedMs: t, waitMs });
        if (atT === true) {
          const atLaterT = dev.budgetExceeded({ ...BUDGET, attempts: 1, elapsedMs: laterT, waitMs });
          expect({ caseIndex: i, seed, t, laterT, waitMs, atT, atLaterT }).toEqual({
            caseIndex: i,
            seed,
            t,
            laterT,
            waitMs,
            atT: true,
            atLaterT: true,
          });
        }
      }
    });

    test("attempts alone can trip the bound with zero elapsed time and zero waitMs", () => {
      expect(dev.budgetExceeded({ ...BUDGET, attempts: 3, elapsedMs: 0, waitMs: 0 })).toBe(true);
    });
  });
});
