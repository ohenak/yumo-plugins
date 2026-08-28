/**
 * loopEconomicsConfig.test.js — PLAN T-04 (batch 2, `[red]`, deps T-00/T-01), pdlc-loop-economics.
 *
 * Falsifies TSPEC §2 (`cascade.pinCheck` / `review.derivativeStop` config parsing) and drives
 * REQ-LOOPECON-08 / PROP-LOOPECON-12. Owns exactly this file — the pure-function batch's
 * per-file-ownership manifest (PLAN §4) assigns `orchestrate-dev.js`'s config-parsing surface to
 * this test file across T-04 (red) and T-10 (green, batch 3).
 *
 * At T-04 none of `PIN_CHECK_DEFAULTS`, `DERIVATIVE_STOP_DEFAULTS`, `parsePinCheckConfig`,
 * `parseDerivativeStopConfig` exist on `orchestrate-dev.js` yet (T-10 lands them). This file
 * therefore imports the module as a namespace (`import * as devModule`, the `advisoryDisabled`/
 * `learningsConfig.test.js` pattern) so every not-yet-existing symbol is reached only from
 * inside a test body — RED here means "export missing" or "behaviour unimplemented", never an
 * import-time crash.
 *
 * TSPEC §2.2 pins both parsers as **direct structural clones** of the shipped
 * `parseLearningsConfig` precedent (`orchestrate-dev.js:2252`): a local `degraded(sectionMalformed)`
 * closure returning the frozen defaults with `invalidKeys: []`; `text == null` ⇒ `degraded(false)`;
 * a `JSON.parse` failure ⇒ `degraded(false)`; a missing top-level block ⇒ `degraded(false)`; a
 * present-but-not-plain-object block ⇒ `degraded(true)`; then per-key independent `boolField` /
 * `nonNegativeInt`-shaped helpers that push the offending key onto `invalidKeys` and substitute
 * that key's own default alone. TSPEC §2.2 also names two deliberate divergences from that
 * precedent: both blocks default `enabled` to `false` (REQ C-2, these features ship off), and
 * `rounds` validates as a **positive** integer (`Number.isInteger(v) && v >= 1`), not a
 * non-negative one — `rounds: 0` would mean "converge after zero flat rounds", the exact
 * over-suppression REQ R-2 names, so `0` is invalid and falls back to `2`.
 *
 * TSPEC §2.3 additionally requires **two-level** descent (`cascade.pinCheck`,
 * `review.derivativeStop` — `learningsInjection` is one level, §2.1), with `sectionMalformed`
 * true if *either* level is present-but-not-an-object, and never leaking into the sibling block
 * (REQ-LOOPECON-08's independence obligation — a malformed `cascade` block cannot retune
 * `review.derivativeStop`, and vice versa).
 */

import * as devModule from "../orchestrate-dev.js";
import fc from "fast-check";

// ─── T-04 conjunct 1: exported symbols exist and have the declared shape ──────────────────────

describe("T-04 exports (TSPEC §2.2)", () => {
  test("PIN_CHECK_DEFAULTS is exported as the frozen object { enabled: false }", () => {
    expect(devModule.PIN_CHECK_DEFAULTS).toEqual({ enabled: false });
    expect(Object.isFrozen(devModule.PIN_CHECK_DEFAULTS)).toBe(true);
  });

  test("DERIVATIVE_STOP_DEFAULTS is exported as the frozen object { enabled: false, rounds: 2 }", () => {
    expect(devModule.DERIVATIVE_STOP_DEFAULTS).toEqual({ enabled: false, rounds: 2 });
    expect(Object.isFrozen(devModule.DERIVATIVE_STOP_DEFAULTS)).toBe(true);
  });

  test("parsePinCheckConfig is exported as a function", () => {
    expect(typeof devModule.parsePinCheckConfig).toBe("function");
  });

  test("parseDerivativeStopConfig is exported as a function", () => {
    expect(typeof devModule.parseDerivativeStopConfig).toBe("function");
  });
});

// ─── Shared fixtures ────────────────────────────────────────────────────────────────────────

/** Builds `.claude/pdlc.config.json` text carrying an arbitrary `cascade.pinCheck` section. */
function pinCheckText(section) {
  return JSON.stringify({ cascade: { pinCheck: section } });
}

/** Builds `.claude/pdlc.config.json` text carrying an arbitrary `review.derivativeStop` section. */
function derivativeStopText(section) {
  return JSON.stringify({ review: { derivativeStop: section } });
}

// ─── T-04 conjunct 2: parsePinCheckConfig behaviour (TSPEC §2.2/§2.3) ──────────────────────────

describe("T-04 parsePinCheckConfig (TSPEC §2.2, §2.3)", () => {
  test("text === null returns the defaults, sectionMalformed false, invalidKeys empty", () => {
    const result = devModule.parsePinCheckConfig(null);
    expect(result).toEqual({
      config: devModule.PIN_CHECK_DEFAULTS,
      sectionMalformed: false,
      invalidKeys: [],
    });
  });

  test("non-JSON text degrades to defaults, sectionMalformed false", () => {
    const result = devModule.parsePinCheckConfig("{not valid json");
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(false);
    expect(result.invalidKeys).toEqual([]);
  });

  test("top-level `cascade` key absent entirely degrades to defaults, sectionMalformed false", () => {
    const result = devModule.parsePinCheckConfig(JSON.stringify({ review: {} }));
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(false);
  });

  test("`cascade` present but not a plain object degrades sectionMalformed TRUE (level 1)", () => {
    const result = devModule.parsePinCheckConfig(JSON.stringify({ cascade: "not-an-object" }));
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(true);
    expect(result.invalidKeys).toEqual([]);
  });

  test("`cascade.pinCheck` absent (cascade is a well-formed object without the key) is NOT malformed — block simply not configured", () => {
    const result = devModule.parsePinCheckConfig(JSON.stringify({ cascade: { other: 1 } }));
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(false);
  });

  test("`cascade.pinCheck` present but not a plain object degrades sectionMalformed TRUE (level 2)", () => {
    const result = devModule.parsePinCheckConfig(pinCheckText(42));
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(true);
    expect(result.invalidKeys).toEqual([]);
  });

  test("well-typed `enabled: true` is honoured, no invalidKeys", () => {
    const result = devModule.parsePinCheckConfig(pinCheckText({ enabled: true }));
    expect(result).toEqual({
      config: { enabled: true },
      sectionMalformed: false,
      invalidKeys: [],
    });
  });

  test("wrong-typed `enabled` falls back to the default and is named in invalidKeys", () => {
    const result = devModule.parsePinCheckConfig(pinCheckText({ enabled: "yes" }));
    expect(result.config).toEqual({ enabled: false });
    expect(result.sectionMalformed).toBe(false);
    expect(result.invalidKeys).toEqual(["enabled"]);
  });

  test("array-typed `enabled` also falls back and is named in invalidKeys", () => {
    const result = devModule.parsePinCheckConfig(pinCheckText({ enabled: [] }));
    expect(result.config).toEqual({ enabled: false });
    expect(result.invalidKeys).toEqual(["enabled"]);
  });
});

// ─── T-04 conjunct 3: parseDerivativeStopConfig behaviour (TSPEC §2.2/§2.3) ────────────────────

describe("T-04 parseDerivativeStopConfig (TSPEC §2.2, §2.3)", () => {
  test("text === null returns the defaults, sectionMalformed false, invalidKeys empty", () => {
    const result = devModule.parseDerivativeStopConfig(null);
    expect(result).toEqual({
      config: devModule.DERIVATIVE_STOP_DEFAULTS,
      sectionMalformed: false,
      invalidKeys: [],
    });
  });

  test("non-JSON text degrades to defaults, sectionMalformed false", () => {
    const result = devModule.parseDerivativeStopConfig("not json at all");
    expect(result.config).toEqual({ enabled: false, rounds: 2 });
    expect(result.sectionMalformed).toBe(false);
  });

  test("top-level `review` key absent entirely degrades to defaults, sectionMalformed false", () => {
    const result = devModule.parseDerivativeStopConfig(JSON.stringify({ cascade: {} }));
    expect(result.config).toEqual({ enabled: false, rounds: 2 });
    expect(result.sectionMalformed).toBe(false);
  });

  test("`review` present but not a plain object degrades sectionMalformed TRUE (level 1)", () => {
    const result = devModule.parseDerivativeStopConfig(JSON.stringify({ review: 7 }));
    expect(result.config).toEqual({ enabled: false, rounds: 2 });
    expect(result.sectionMalformed).toBe(true);
  });

  test("`review.derivativeStop` absent (review is a well-formed object without the key) is NOT malformed", () => {
    const result = devModule.parseDerivativeStopConfig(JSON.stringify({ review: { other: 1 } }));
    expect(result.config).toEqual({ enabled: false, rounds: 2 });
    expect(result.sectionMalformed).toBe(false);
  });

  test("`review.derivativeStop` present but not a plain object degrades sectionMalformed TRUE (level 2)", () => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText("nope"));
    expect(result.config).toEqual({ enabled: false, rounds: 2 });
    expect(result.sectionMalformed).toBe(true);
  });

  test("well-typed `{ enabled: true, rounds: 3 }` is honoured, no invalidKeys", () => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText({ enabled: true, rounds: 3 }));
    expect(result).toEqual({
      config: { enabled: true, rounds: 3 },
      sectionMalformed: false,
      invalidKeys: [],
    });
  });

  test("wrong-typed `enabled` falls back and is named in invalidKeys, `rounds` unaffected", () => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText({ enabled: "on", rounds: 5 }));
    expect(result.config).toEqual({ enabled: false, rounds: 5 });
    expect(result.invalidKeys).toEqual(["enabled"]);
  });

  test("wrong-typed `rounds` falls back and is named in invalidKeys, `enabled` unaffected", () => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText({ enabled: true, rounds: "5" }));
    expect(result.config).toEqual({ enabled: true, rounds: 2 });
    expect(result.invalidKeys).toEqual(["rounds"]);
  });

  // ─── TSPEC §2.2 divergence 2: `rounds` is a POSITIVE integer, not non-negative ───────────────
  // `rounds: 0` means "converge after zero flat rounds" — immediate convergence, the exact
  // over-suppression REQ R-2 names — so 0 is invalid, distinct from `parseLearningsConfig`'s
  // sibling fields which accept 0 (TE F-06 precedent explicitly permits 0 there).
  test.each([
    [0, "zero (over-suppression boundary, REQ R-2)"],
    [-1, "negative"],
    ["2", "numeric string"],
    [2.5, "non-integer float"],
    [null, "null"],
    [true, "boolean"],
    [[], "array"],
    [{}, "object"],
  ])("`rounds: %j` (%s) is INVALID and falls back to the default 2", (badRounds) => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText({ rounds: badRounds }));
    expect(result.config.rounds).toBe(2);
    expect(result.invalidKeys).toEqual(["rounds"]);
  });

  test.each([1, 2, 3, 10, 1000])("`rounds: %d` is a VALID positive integer and is honoured", (goodRounds) => {
    const result = devModule.parseDerivativeStopConfig(derivativeStopText({ rounds: goodRounds }));
    expect(result.config.rounds).toBe(goodRounds);
    expect(result.invalidKeys).toEqual([]);
  });
});

// ─── T-04 conjunct 4: cross-block independence (REQ-LOOPECON-08) ──────────────────────────────
//
// A single `.claude/pdlc.config.json` document carries BOTH blocks. A malformed `cascade` must
// never retune `review.derivativeStop`'s resolved keys, and vice versa — each parser reads only
// its own two-level path via `descendSection` (TSPEC §2.3) and `sectionMalformed` at any level
// never leaks into the sibling block.

describe("T-04 cross-block independence (TSPEC §2.3, REQ-LOOPECON-08)", () => {
  test("a malformed `cascade` block leaves a well-formed `review.derivativeStop` block fully resolved", () => {
    const text = JSON.stringify({
      cascade: "totally malformed, not even an object",
      review: { derivativeStop: { enabled: true, rounds: 4 } },
    });
    const pin = devModule.parsePinCheckConfig(text);
    const dstop = devModule.parseDerivativeStopConfig(text);
    expect(pin.sectionMalformed).toBe(true);
    expect(pin.config).toEqual({ enabled: false });
    expect(dstop.sectionMalformed).toBe(false);
    expect(dstop.config).toEqual({ enabled: true, rounds: 4 });
    expect(dstop.invalidKeys).toEqual([]);
  });

  test("a malformed `review.derivativeStop` block leaves a well-formed `cascade.pinCheck` block fully resolved", () => {
    const text = JSON.stringify({
      cascade: { pinCheck: { enabled: true } },
      review: { derivativeStop: "totally malformed, not even an object" },
    });
    const pin = devModule.parsePinCheckConfig(text);
    const dstop = devModule.parseDerivativeStopConfig(text);
    expect(pin.sectionMalformed).toBe(false);
    expect(pin.config).toEqual({ enabled: true });
    expect(pin.invalidKeys).toEqual([]);
    expect(dstop.sectionMalformed).toBe(true);
    expect(dstop.config).toEqual({ enabled: false, rounds: 2 });
  });

  test("an invalid `rounds` key never affects the resolved `enabled` value in the same block", () => {
    const text = derivativeStopText({ enabled: true, rounds: -5 });
    const result = devModule.parseDerivativeStopConfig(text);
    expect(result.config.enabled).toBe(true);
    expect(result.config.rounds).toBe(2);
    expect(result.invalidKeys).toEqual(["rounds"]);
  });
});

// ─── T-04 conjunct 5: PROP-LOOPECON-12 (fast-check) ────────────────────────────────────────────
//
// "Per-key independent fail-open: one malformed key never retunes the block." Domain: arbitrary
// JSON-shaped config objects for BOTH blocks, each key independently {absent, correctly-typed
// valid value, wrong-typed value}, full cross-product per block, plus a corpus-level case where
// the whole document is unreadable/non-JSON/absent. Invariant: for every combination each key
// independently resolves to its own default OR its own parsed value, never influenced by any
// other key or the sibling block; the corpus-level failure resolves BOTH blocks to their full
// defaults simultaneously, asserted as one joint conjunct (TSPEC §6 PROP-LOOPECON-12,
// REQ-LOOPECON-08, REQ C-1/C-3).

describe("T-04 PROP-LOOPECON-12: per-key independent fail-open (fast-check)", () => {
  const invalidGeneric = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.constant(null),
    fc.array(fc.integer(), { maxLength: 3 }),
    fc.dictionary(fc.string(), fc.integer(), { maxKeys: 3 })
  );

  /** Field outcome: absent | valid | invalid, tagged so the assertion can re-derive the expected resolved value. */
  const boolFieldArb = fc.oneof(
    fc.constant({ present: false }),
    fc.boolean().map((value) => ({ present: true, value, valid: true })),
    invalidGeneric.map((value) => ({ present: true, value, valid: false }))
  );

  const roundsFieldArb = fc.oneof(
    fc.constant({ present: false }),
    fc.integer({ min: 1, max: 100000 }).map((value) => ({ present: true, value, valid: true })),
    fc
      .oneof(
        fc.integer({ min: -100000, max: 0 }), // includes the 0 boundary — invalid, REQ R-2
        fc.double({ noNaN: false, noDefaultInfinity: false }).filter((v) => !Number.isInteger(v)),
        fc.string(),
        fc.boolean(),
        fc.constant(null),
        fc.array(fc.integer(), { maxLength: 3 }),
        fc.dictionary(fc.string(), fc.integer(), { maxKeys: 3 })
      )
      .map((value) => ({ present: true, value, valid: false }))
  );

  function buildSection(fields) {
    const obj = {};
    for (const [key, field] of Object.entries(fields)) {
      if (field.present) obj[key] = field.value;
    }
    return obj;
  }

  function resolved(field, fallback) {
    return field.present && field.valid ? field.value : fallback;
  }

  const corpusModeArb = fc.constantFrom("well-formed", "unparseable-json", "absent");

  test("cross-product per block, plus joint corpus-level failure", () => {
    fc.assert(
      fc.property(boolFieldArb, boolFieldArb, roundsFieldArb, corpusModeArb, (pinEnabled, dstopEnabled, dstopRounds, corpusMode) => {
        let text;
        if (corpusMode === "absent") {
          text = null;
        } else if (corpusMode === "unparseable-json") {
          text = "{ this is not valid JSON at all";
        } else {
          text = JSON.stringify({
            cascade: { pinCheck: buildSection({ enabled: pinEnabled }) },
            review: { derivativeStop: buildSection({ enabled: dstopEnabled, rounds: dstopRounds }) },
          });
        }

        const pin = devModule.parsePinCheckConfig(text);
        const dstop = devModule.parseDerivativeStopConfig(text);

        // invariant: both parsers are total (never throw — the call above already proves it)
        // and always return the declared shape.
        expect(Array.isArray(pin.invalidKeys)).toBe(true);
        expect(Array.isArray(dstop.invalidKeys)).toBe(true);
        expect(typeof pin.sectionMalformed).toBe("boolean");
        expect(typeof dstop.sectionMalformed).toBe("boolean");

        if (corpusMode !== "well-formed") {
          // corpus-level failure ⇒ BOTH blocks resolve to their full default, jointly.
          expect(pin.config).toEqual(devModule.PIN_CHECK_DEFAULTS);
          expect(dstop.config).toEqual(devModule.DERIVATIVE_STOP_DEFAULTS);
          return;
        }

        // well-formed corpus ⇒ every key independently resolves to its own value or default,
        // never influenced by any other key or the sibling block.
        expect(pin.config.enabled).toBe(resolved(pinEnabled, false));
        expect(dstop.config.enabled).toBe(resolved(dstopEnabled, false));
        expect(dstop.config.rounds).toBe(resolved(dstopRounds, 2));
      }),
      { numRuns: 500 }
    );
  });

  test("`invalidKeys` is always a duplicate-free subset of the block's own declared keys", () => {
    fc.assert(
      fc.property(boolFieldArb, boolFieldArb, roundsFieldArb, (pinEnabled, dstopEnabled, dstopRounds) => {
        const text = JSON.stringify({
          cascade: { pinCheck: buildSection({ enabled: pinEnabled }) },
          review: { derivativeStop: buildSection({ enabled: dstopEnabled, rounds: dstopRounds }) },
        });
        const pin = devModule.parsePinCheckConfig(text);
        const dstop = devModule.parseDerivativeStopConfig(text);

        expect(new Set(pin.invalidKeys).size).toBe(pin.invalidKeys.length);
        for (const key of pin.invalidKeys) expect(["enabled"]).toContain(key);

        expect(new Set(dstop.invalidKeys).size).toBe(dstop.invalidKeys.length);
        for (const key of dstop.invalidKeys) expect(["enabled", "rounds"]).toContain(key);
      }),
      { numRuns: 300 }
    );
  });
});

// ─── T-04 conjunct 6: totality over arbitrary raw text (never throws) ──────────────────────────

describe("T-04 totality: both parsers never throw over arbitrary raw text", () => {
  const arbitraryText = fc.oneof(fc.string(), fc.constant(null), fc.jsonValue().map((v) => JSON.stringify(v)));

  test("parsePinCheckConfig is total", () => {
    fc.assert(
      fc.property(arbitraryText, (text) => {
        expect(() => devModule.parsePinCheckConfig(text)).not.toThrow();
      }),
      { numRuns: 300 }
    );
  });

  test("parseDerivativeStopConfig is total", () => {
    fc.assert(
      fc.property(arbitraryText, (text) => {
        expect(() => devModule.parseDerivativeStopConfig(text)).not.toThrow();
      }),
      { numRuns: 300 }
    );
  });
});
