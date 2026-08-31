/**
 * decisionLedgerConfig.test.js — PLAN T-04 (batch 2, `[red]`, deps T-00/T-01),
 * pdlc-decision-ledger.
 *
 * Falsifies TSPEC §4.1's `parseDecisionLedgerConfig` / `DECISION_LEDGER_DEFAULTS` against REQ C-3
 * (the `decisionLedger` block holds exactly three keys: `enabled`, `maxEntries`, `maxBytes`) and
 * PROPERTIES PROP-CFG-01…06. `parseDecisionLedgerConfig` does not exist on `orchestrate-dev.js`
 * yet — T-13 (batch 3) lands it as a direct structural clone of the shipped
 * `parseLearningsConfig` (dev:2252). This file imports the module as a namespace so the
 * not-yet-existing export is reached only from inside test bodies, never at import time — the
 * `learningsConfig.test.js` / `loopEconomicsConfig.test.js` precedent restated for this feature.
 *
 * Every block below is committed `describe.skip`, titled `T-13: …` — T-13 is the sole owner that
 * un-skips them. Until then this file must still exit 0 on its own so the wave gate stays green.
 *
 * TSPEC §4.1 shape: `parseDecisionLedgerConfig(text: string | null) => { config:
 * DecisionLedgerConfig; sectionMalformed: boolean; invalidKeys: string[] }`. Validation mirrors
 * `parseLearningsConfig` exactly (`boolField` for `enabled`, `nonNegativeInt` for the two
 * thresholds) with one deliberate divergence (REQ C-5, A-2): `enabled` defaults to `false`, not
 * `true` — this feature ships OFF by default, unlike `learningsInjection`.
 */

import fc from "fast-check";

import { readdirSync, readFileSync, realpathSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";

// ─── fixtures ───────────────────────────────────────────────────────────────────────────

/** Builds `.claude/pdlc.config.json` text carrying an arbitrary `decisionLedger` section. */
function decisionLedgerText(section) {
  return JSON.stringify({ decisionLedger: section });
}

const DEFAULTS = Object.freeze({ enabled: false, maxEntries: 70, maxBytes: 12500 });

// ─── T-13 conjunct 1: exported symbols exist, declared shape (TSPEC §4.1) ────────────────

describe.skip("T-13: DECISION_LEDGER_DEFAULTS / parseDecisionLedgerConfig exports", () => {
  test("DECISION_LEDGER_DEFAULTS is exported frozen with C-3's three keys, C-5's values", () => {
    expect(devModule.DECISION_LEDGER_DEFAULTS).toEqual(DEFAULTS);
    expect(Object.isFrozen(devModule.DECISION_LEDGER_DEFAULTS)).toBe(true);
  });

  test("parseDecisionLedgerConfig is an exported function", () => {
    expect(typeof devModule.parseDecisionLedgerConfig).toBe("function");
  });
});

// ─── T-13 conjunct 2: baseline degraded cases — F-1, F-2, F-3 / PROP-CFG-01 ──────────────
// `text === null` (file absent/unreadable), non-JSON text, and an absent `decisionLedger` block
// all resolve to the three C-5 defaults with `sectionMalformed: false` and `invalidKeys: []` —
// and, per F-1…F-3, none of these three is notice-worthy (the parser's own return shape carries
// no notices field; notice emission is wired downstream of this pure function).

describe.skip("T-13: parseDecisionLedgerConfig baseline degraded cases (F-1, F-2, F-3 / PROP-CFG-01)", () => {
  test("text === null returns defaults, sectionMalformed false, invalidKeys empty (F-1)", () => {
    const result = devModule.parseDecisionLedgerConfig(null);
    expect(result).toEqual({ config: DEFAULTS, sectionMalformed: false, invalidKeys: [] });
  });

  test("non-JSON text returns defaults, sectionMalformed false, invalidKeys empty (F-2)", () => {
    const result = devModule.parseDecisionLedgerConfig("{not valid json at all");
    expect(result).toEqual({ config: DEFAULTS, sectionMalformed: false, invalidKeys: [] });
  });

  test("top-level valid JSON with no `decisionLedger` key returns defaults (F-3)", () => {
    const result = devModule.parseDecisionLedgerConfig(JSON.stringify({ other: "block" }));
    expect(result).toEqual({ config: DEFAULTS, sectionMalformed: false, invalidKeys: [] });
  });

  test("empty-object top level (no keys at all) returns defaults (F-3)", () => {
    const result = devModule.parseDecisionLedgerConfig(JSON.stringify({}));
    expect(result).toEqual({ config: DEFAULTS, sectionMalformed: false, invalidKeys: [] });
  });
});

// ─── T-13 conjunct 3: block-level malformation — F-4 / PROP-CFG-03 ───────────────────────
// `decisionLedger` present but not a plain object (array, string, number, null, boolean) ⇒
// `sectionMalformed: true`, all three defaults, `invalidKeys: []` (no per-key validation runs
// against a non-object section).

describe.skip("T-13: parseDecisionLedgerConfig block-level malformation (F-4 / PROP-CFG-03)", () => {
  test.each([
    ["array", [1, 2, 3]],
    ["string", "not-an-object"],
    ["number", 42],
    ["null", null],
    ["boolean", true],
  ])("`decisionLedger: %s` degrades sectionMalformed TRUE, all defaults, invalidKeys empty", (_label, value) => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText(value));
    expect(result).toEqual({ config: DEFAULTS, sectionMalformed: true, invalidKeys: [] });
  });
});

// ─── T-13 conjunct 4: per-key matrix — AT-11 / PROP-CFG-02, F-5 ──────────────────────────
// Each of C-3's three keys crossed with {valid, wrong-typed, absent}, the other two keys always
// carrying valid non-default operator values. Asserted as set equality over C-3's enumeration:
// `invalidKeys` names exactly the wrong-typed key and nothing else, in every one of the nine
// cells, and the two untouched keys always resolve to the operator's own values, never a default
// leaking sideways (F-5: "only that key defaults; the other two keep operator values").

const KEY_SPECS = Object.freeze({
  enabled: { valid: true, wrongTyped: "yes", default: false },
  maxEntries: { valid: 5, wrongTyped: "5", default: 70 },
  maxBytes: { valid: 999, wrongTyped: -1, default: 12500 },
});
const KEYS = Object.freeze(Object.keys(KEY_SPECS));

/** Builds a `decisionLedger` section with the other two keys at their valid operator values. */
function sectionFor(targetKey, condition) {
  const section = {};
  for (const key of KEYS) {
    if (key === targetKey) {
      if (condition === "absent") continue;
      section[key] = condition === "valid" ? KEY_SPECS[key].valid : KEY_SPECS[key].wrongTyped;
    } else {
      section[key] = KEY_SPECS[key].valid;
    }
  }
  return section;
}

const MATRIX_CASES = KEYS.flatMap((key) =>
  ["valid", "wrong-typed", "absent"].map((condition) => [key, condition])
);

describe.skip("T-13: parseDecisionLedgerConfig per-key matrix (AT-11 / PROP-CFG-02, F-5)", () => {
  test.each(MATRIX_CASES)("key=%s condition=%s — other two keys stay at operator values", (key, condition) => {
    const section = sectionFor(key, condition);
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText(section));

    const expectedConfig = {};
    for (const k of KEYS) {
      if (k === key) {
        expectedConfig[k] = condition === "valid" ? KEY_SPECS[k].valid : KEY_SPECS[k].default;
      } else {
        expectedConfig[k] = KEY_SPECS[k].valid;
      }
    }
    const expectedInvalidKeys = condition === "wrong-typed" ? [key] : [];

    expect(result.sectionMalformed).toBe(false);
    expect(result.config).toEqual(expectedConfig);
    expect(new Set(result.invalidKeys)).toEqual(new Set(expectedInvalidKeys));
    expect(result.invalidKeys.length).toBe(expectedInvalidKeys.length);
  });
});

// ─── T-13 conjunct 5: `nonNegativeInt` accepts 0 on BOTH thresholds — E-7 / DEC-DECLEDGER-15 /
// PROP-CFG-04. `0` is a valid admits-nothing value, never a wrong-typed fallback — this is the
// resolved divergence from `positiveInt`: REQ v1.8 retyped C-5's thresholds non-negative so FSPEC
// E-7 and REQ C-5 now agree (DEC-DECLEDGER-15, "fired closed").

describe.skip("T-13: parseDecisionLedgerConfig nonNegativeInt zero acceptance (E-7 / DEC-DECLEDGER-15 / PROP-CFG-04)", () => {
  test("maxEntries: 0 is accepted as valid, not listed in invalidKeys", () => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxEntries: 0 }));
    expect(result.config).toEqual({ enabled: false, maxEntries: 0, maxBytes: 12500 });
    expect(result.invalidKeys).toEqual([]);
    expect(result.sectionMalformed).toBe(false);
  });

  test("maxBytes: 0 is accepted as valid, not listed in invalidKeys", () => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxBytes: 0 }));
    expect(result.config).toEqual({ enabled: false, maxEntries: 70, maxBytes: 0 });
    expect(result.invalidKeys).toEqual([]);
    expect(result.sectionMalformed).toBe(false);
  });

  test("both maxEntries: 0 and maxBytes: 0 together are both accepted as valid", () => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxEntries: 0, maxBytes: 0 }));
    expect(result.config).toEqual({ enabled: false, maxEntries: 0, maxBytes: 0 });
    expect(result.invalidKeys).toEqual([]);
    expect(result.sectionMalformed).toBe(false);
  });

  test.each([-1, -100])("maxEntries: %i (negative) is rejected, falls back to default 70", (bad) => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxEntries: bad }));
    expect(result.config.maxEntries).toBe(70);
    expect(result.invalidKeys).toEqual(["maxEntries"]);
  });

  test.each([-1, -100])("maxBytes: %i (negative) is rejected, falls back to default 12500", (bad) => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxBytes: bad }));
    expect(result.config.maxBytes).toBe(12500);
    expect(result.invalidKeys).toEqual(["maxBytes"]);
  });

  test.each([2.5, "0", null, [], {}])("non-integer threshold %p is rejected, falls back to default", (bad) => {
    const result = devModule.parseDecisionLedgerConfig(decisionLedgerText({ maxEntries: bad }));
    expect(result.config.maxEntries).toBe(70);
    expect(result.invalidKeys).toEqual(["maxEntries"]);
  });
});

// ─── T-13 conjunct 6: block independence ─────────────────────────────────────────────────
// A malformed `decisionLedger` block never retunes `learningsInjection`, `cascade.pinCheck`, or
// `review.derivativeStop` — and, symmetrically, a malformed one of those never retunes
// `decisionLedger`. Each parser reads only its own top-level key (or two-level path); a
// malformed sibling's `sectionMalformed` never leaks across blocks.

describe.skip("T-13: parseDecisionLedgerConfig block independence (config-block isolation)", () => {
  test("malformed `decisionLedger` leaves `learningsInjection` fully resolved", () => {
    const text = JSON.stringify({
      decisionLedger: "totally malformed, not even an object",
      learningsInjection: { enabled: false, maxDocuments: 3 },
    });
    const ledger = devModule.parseDecisionLedgerConfig(text);
    const learnings = devModule.parseLearningsConfig(text);

    expect(ledger.sectionMalformed).toBe(true);
    expect(ledger.config).toEqual(DEFAULTS);

    expect(learnings.sectionMalformed).toBe(false);
    expect(learnings.config.enabled).toBe(false);
    expect(learnings.config.maxDocuments).toBe(3);
    expect(learnings.invalidKeys).toEqual([]);
  });

  test("malformed `decisionLedger` leaves `cascade.pinCheck` and `review.derivativeStop` fully resolved", () => {
    const text = JSON.stringify({
      decisionLedger: 42,
      cascade: { pinCheck: { enabled: true } },
      review: { derivativeStop: { enabled: true, rounds: 4 } },
    });
    const ledger = devModule.parseDecisionLedgerConfig(text);
    const pin = devModule.parsePinCheckConfig(text);
    const dstop = devModule.parseDerivativeStopConfig(text);

    expect(ledger.sectionMalformed).toBe(true);
    expect(ledger.config).toEqual(DEFAULTS);

    expect(pin.sectionMalformed).toBe(false);
    expect(pin.config).toEqual({ enabled: true });

    expect(dstop.sectionMalformed).toBe(false);
    expect(dstop.config).toEqual({ enabled: true, rounds: 4 });
  });

  test("a malformed `learningsInjection` block leaves well-formed `decisionLedger` fully resolved", () => {
    const text = JSON.stringify({
      learningsInjection: "not even an object",
      decisionLedger: { enabled: true, maxEntries: 10, maxBytes: 5000 },
    });
    const learnings = devModule.parseLearningsConfig(text);
    const ledger = devModule.parseDecisionLedgerConfig(text);

    expect(learnings.sectionMalformed).toBe(true);

    expect(ledger.sectionMalformed).toBe(false);
    expect(ledger.config).toEqual({ enabled: true, maxEntries: 10, maxBytes: 5000 });
    expect(ledger.invalidKeys).toEqual([]);
  });

  test("a malformed `cascade` block leaves well-formed `decisionLedger` fully resolved", () => {
    const text = JSON.stringify({
      cascade: "totally malformed",
      decisionLedger: { enabled: true },
    });
    const pin = devModule.parsePinCheckConfig(text);
    const ledger = devModule.parseDecisionLedgerConfig(text);

    expect(pin.sectionMalformed).toBe(true);

    expect(ledger.sectionMalformed).toBe(false);
    expect(ledger.config).toEqual({ enabled: true, maxEntries: 70, maxBytes: 12500 });
  });
});

// ─── T-13 conjunct 7: PROP-CFG-06 — totality over arbitrary JSON (fast-check) ────────────
// `parseDecisionLedgerConfig` must never throw, never read the filesystem, never mutate its
// argument, for ANY input string — including the empty string, a JSON scalar at top level, a
// top-level array, and deeply nested garbage — and must return the three resolved defaults with
// `invalidKeys: []` and `sectionMalformed: false` on every one of those, because a top-level
// scalar/array/unparseable text all fail the `!isPlainObject(parsed)` guard and short-circuit
// before any `decisionLedger` lookup (mirrors `parseLearningsConfig`'s `degraded(false)`, never
// `degraded(true)`, for these inputs — `degraded(true)` is reserved for a PRESENT non-object
// block, PROP-CFG-03's case, not these).

describe.skip("T-13: parseDecisionLedgerConfig PROP-CFG-06 totality (fast-check)", () => {
  const arbitraryText = fc.oneof(
    fc.constant(""),
    fc.string(),
    fc.constant(null),
    fc.jsonValue().map((v) => JSON.stringify(v))
  );

  test("never throws and always returns the declared shape for arbitrary text", () => {
    fc.assert(
      fc.property(arbitraryText, (text) => {
        expect(() => devModule.parseDecisionLedgerConfig(text)).not.toThrow();
        const result = devModule.parseDecisionLedgerConfig(text);
        expect(Array.isArray(result.invalidKeys)).toBe(true);
        expect(typeof result.sectionMalformed).toBe("boolean");
        expect(typeof result.config).toBe("object");
      }),
      { numRuns: 300 }
    );
  });

  test("top-level scalar / array / unparseable text always resolves defaults, sectionMalformed false", () => {
    const nonObjectTopLevel = fc.oneof(
      fc.constant("not json at all"),
      fc.string().filter((s) => s !== "" && s[0] !== "{"),
      fc.integer().map((n) => JSON.stringify(n)),
      fc.boolean().map((b) => JSON.stringify(b)),
      fc.constant(JSON.stringify(null)),
      fc.array(fc.jsonValue(), { maxLength: 5 }).map((a) => JSON.stringify(a))
    );
    fc.assert(
      fc.property(nonObjectTopLevel, (text) => {
        const result = devModule.parseDecisionLedgerConfig(text);
        expect(result).toEqual({ config: DEFAULTS, sectionMalformed: false, invalidKeys: [] });
      }),
      { numRuns: 300 }
    );
  });

  test("does not mutate its string argument", () => {
    fc.assert(
      fc.property(arbitraryText, (text) => {
        const before = text;
        devModule.parseDecisionLedgerConfig(text);
        expect(text).toBe(before);
      }),
      { numRuns: 100 }
    );
  });
});

// Roots for the relocated T-12a disclosure family below (same derivation as
// documentOracles.test.js; TSPEC §13.4).
const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const LIVE_ROOT = realpathSync(resolve(HERE, "../../.."));

// ---------------------------------------------------------------------------
// PLAN T-12a — documentation disclosure oracle for T-19's decisionLedger prose
// (TE F-04, PM F-03). Hosted here rather than in `documentOracles.test.js`
// (CROSS-REVIEW-software-engineer-IMPLEMENTATION-wave3-v1 F-01): that file is a
// `SWEPT_SURFACE_MODULES` member of consumerCleanup's skip-join orphan-freedom
// oracle (TSPEC §5.5), whose sink accepts only capability-gated skips — a
// committed planned-work `test.skip` there is an unregistrable orphan. This
// module sits inside T-19's twelve-module manifest and outside the swept
// surface, and the `T-19: …` titles stay byte-identical so T-19's batch-9
// un-skip obligation still binds. Shape mirrors the advisory-tier disclosure
// family in `documentOracles.test.js` (~579-641): every list assertion is
// DERIVED from the shipped production
// constants (never hand-transcribed) and is a true set-equality check, so a
// deleted omission reason / notice / config key reds it. T-19 does not exist
// yet — DECISION_LEDGER_OMIT_REASONS / DECISION_LEDGER_NOTICES /
// DECISION_LEDGER_DEFAULTS are not exported by orchestrate-dev.js until
// batches 3-8 land — so every conjunct below is committed `test.skip`,
// titled `T-19: …`, and reaches the constants via a dynamic `await import`
// inside the test body (never a top-level import) so the file still loads
// cleanly while the export does not exist.
// ---------------------------------------------------------------------------

describe("pdlc/OPERATIONS.md decisionLedger disclosure family constants (PLAN T-12a / T-19)", () => {
  function decisionLedgerSection() {
    const operationsMd = readFileSync(join(LIVE_ROOT, "pdlc", "OPERATIONS.md"), "utf8");
    const start = operationsMd.indexOf("### Decision ledger");
    expect(start).toBeGreaterThan(-1);
    const rest = operationsMd.slice(start);
    const end = rest.indexOf("\n## ");
    return end === -1 ? rest : rest.slice(0, end);
  }

  function bulletTokens(section, label) {
    const idx = section.indexOf(label);
    expect(idx).toBeGreaterThan(-1);
    const rest = section.slice(idx + label.length);
    const nextBullet = rest.indexOf("\n- **");
    const bulletText = nextBullet === -1 ? rest : rest.slice(0, nextBullet);
    const tokens = [...bulletText.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    return [...new Set(tokens)].sort();
  }

  test.skip("T-19: the omission-reason list set-equals DECISION_LEDGER_OMIT_REASONS", async () => {
    const { DECISION_LEDGER_OMIT_REASONS } = await import("../orchestrate-dev.js");
    const section = decisionLedgerSection();
    const actual = bulletTokens(section, "- **Omission reasons:**");
    expect(actual).toEqual([...DECISION_LEDGER_OMIT_REASONS].sort());
  });

  test.skip("T-19: the notice-id list set-equals the keys of DECISION_LEDGER_NOTICES", async () => {
    const { DECISION_LEDGER_NOTICES } = await import("../orchestrate-dev.js");
    const section = decisionLedgerSection();
    const actual = bulletTokens(section, "- **Notices:**");
    expect(actual).toEqual(Object.keys(DECISION_LEDGER_NOTICES).sort());
  });

  test.skip("T-19: the config-key list set-equals the keys of DECISION_LEDGER_DEFAULTS", async () => {
    const { DECISION_LEDGER_DEFAULTS } = await import("../orchestrate-dev.js");
    const section = decisionLedgerSection();
    const actual = bulletTokens(section, "- **Config keys:**");
    expect(actual).toEqual(Object.keys(DECISION_LEDGER_DEFAULTS).sort());
  });

  test.skip("T-19: pdlc/README.md and CLAUDE.md name decisionLedger, defer to pdlc/OPERATIONS.md as the catalogue, and carry no key-by-key restatement", async () => {
    const { DECISION_LEDGER_OMIT_REASONS, DECISION_LEDGER_NOTICES, DECISION_LEDGER_DEFAULTS } =
      await import("../orchestrate-dev.js");
    const restatedTokens = new Set([
      ...DECISION_LEDGER_OMIT_REASONS,
      ...Object.keys(DECISION_LEDGER_NOTICES),
      ...Object.keys(DECISION_LEDGER_DEFAULTS),
    ]);
    const referentPaths = [join(LIVE_ROOT, "pdlc", "README.md"), join(LIVE_ROOT, "CLAUDE.md")];
    for (const path of referentPaths) {
      const text = readFileSync(path, "utf8");
      expect(text).toEqual(expect.stringContaining("decisionLedger"));
      expect(text).toEqual(expect.stringContaining("pdlc/OPERATIONS.md"));
      for (const token of restatedTokens) {
        expect(text).not.toEqual(expect.stringContaining(`\`${token}\``));
      }
    }
  });

  test.skip("T-19: pdlc/workflows/__tests__/decisionLedger*.test.js names set-equal the PLAN's twelve-module file-ownership manifest", () => {
    const testDir = resolve(WORKFLOWS, "__tests__");
    const actual = readdirSync(testDir)
      .filter((name) => name.startsWith("decisionLedger") && name.endsWith(".test.js"))
      .sort();
    // Hand-transcribed from this PLAN's Per-phase file-ownership manifest (T-00/T-02/T-03 in
    // batch 1; T-04..T-11 and T-18 completing batch 2) — twelve `decisionLedger*.test.js`
    // modules total. This is a SET assertion, not a count: the terminal `102` post-sweep
    // count re-check is T-19's own obligation (see the T15 describe block above), not this
    // task's — it lives here rather than in T-00a because it is only satisfiable once all
    // twelve modules exist, and staying skipped until T-19 un-skips it at batch 9 keeps it
    // from reddening the wave gate mid-feature.
    const expected = [
      "decisionLedgerBaselineGuard.test.js",
      "decisionLedgerBounds.test.js",
      "decisionLedgerCensus.test.js",
      "decisionLedgerConfig.test.js",
      "decisionLedgerCorpus.test.js",
      "decisionLedgerFixtureGuard.test.js",
      "decisionLedgerInjector.test.js",
      "decisionLedgerLoop.test.js",
      "decisionLedgerMain.test.js",
      "decisionLedgerPreflight.test.js",
      "decisionLedgerRecognise.test.js",
      "decisionLedgerRender.test.js",
    ].sort();
    expect(actual).toEqual(expected);
  });
});

