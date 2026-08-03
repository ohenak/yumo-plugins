/**
 * mergeConfig.test.js — Phase MERGE's configuration reader (PLAN A1, TSPEC §3).
 *
 * Covers:
 *   - E1-E5 (TSPEC §12's error-handling catalogue): config file absent/unreadable,
 *     not-JSON / not-an-object, `merge` section present but not an object, one bad
 *     key defaulting only itself (incl. the mergeableRetries boundary and the
 *     mergeableRetryDelay seconds unit), and a throwing `_readFile`.
 *   - PROP-M-09 — config totality: for any input text, `parseMergeConfig` returns a
 *     complete config whose every key is inside its accepted domain, and never
 *     throws.
 *   - PROP-M-10 — independent fallback: one bad key never defaults another.
 *
 * RED-terminal (PLAN batch 2, task A1): `parseMergeConfig`, `readMergeConfigSafely`,
 * `MERGE_DEFAULTS`, `MERGE_MODES`, `MERGE_STATUSES`, `MERGE_GUARD_DEFAULTS`,
 * `MERGE_MAX_RETRIES`, `MERGE_MAX_DECISION_STEPS` are not yet exported by
 * orchestrate-dev.js — under this project's native-ESM jest runtime, importing a
 * named binding a module does not yet provide fails the whole file to load with a
 * SyntaxError naming the missing export.
 */

import {
  parseMergeConfig,
  readMergeConfigSafely,
  MERGE_DEFAULTS,
  MERGE_MODES,
  MERGE_STATUSES,
  MERGE_GUARD_DEFAULTS,
  MERGE_MAX_RETRIES,
  MERGE_MAX_DECISION_STEPS,
} from "../orchestrate-dev.js";
import { seeded, resolveSeed, MERGE_PROP_SEED } from "./helpers/mergeDoubles.js";

const MERGE_KEYS = Object.freeze([
  "mergeMode",
  "mergeRequiresCi",
  "allowSquashMerge",
  "deleteBranchOnPdlcMerge",
  "mergeableRetries",
  "mergeableRetryDelay",
  "guardPaths",
]);

// A snapshot of MERGE_DEFAULTS taken before any test runs, so PROP-M-09's
// "MERGE_DEFAULTS never mutated" conjunct has something non-circular to compare
// against (TE F-11's discipline, imported by name from PROPERTIES §5's precedent).
const MERGE_DEFAULTS_SNAPSHOT = JSON.parse(JSON.stringify(MERGE_DEFAULTS));

function assertDefaultsUntouched() {
  expect(MERGE_DEFAULTS).toEqual(MERGE_DEFAULTS_SNAPSHOT);
  expect(Object.isFrozen(MERGE_DEFAULTS)).toBe(true);
}

// ─── The frozen catalogues themselves ──────────────────────────────────────────

describe("Phase MERGE constants", () => {
  test("MERGE_MODES is the closed catalogue TSPEC §2.2 names", () => {
    expect(MERGE_MODES).toEqual(["off", "gated", "on"]);
    expect(Object.isFrozen(MERGE_MODES)).toBe(true);
  });

  test("MERGE_STATUSES is the closed catalogue FSPEC §9.1 names", () => {
    expect(MERGE_STATUSES).toEqual(["merged", "deferred", "refused", "skipped"]);
    expect(Object.isFrozen(MERGE_STATUSES)).toBe(true);
  });

  test("MERGE_GUARD_DEFAULTS is frozen and non-empty", () => {
    expect(Object.isFrozen(MERGE_GUARD_DEFAULTS)).toBe(true);
    expect(MERGE_GUARD_DEFAULTS.length).toBeGreaterThan(0);
    for (const p of MERGE_GUARD_DEFAULTS) expect(p.endsWith("/")).toBe(true);
  });

  test("MERGE_DEFAULTS carries exactly the seven documented keys, frozen", () => {
    expect(Object.keys(MERGE_DEFAULTS).sort()).toEqual([...MERGE_KEYS].sort());
    expect(Object.isFrozen(MERGE_DEFAULTS)).toBe(true);
    expect(MERGE_DEFAULTS).toEqual({
      mergeMode: "off",
      mergeRequiresCi: true,
      allowSquashMerge: false,
      deleteBranchOnPdlcMerge: true,
      mergeableRetries: 3,
      mergeableRetryDelay: 10,
      guardPaths: [],
    });
  });

  test("frozen constants resist mutation (strict-mode ESM throws on write)", () => {
    expect(() => {
      MERGE_DEFAULTS.mergeMode = "on";
    }).toThrow(TypeError);
    expect(MERGE_DEFAULTS.mergeMode).toBe("off");
  });

  test("MERGE_MAX_DECISION_STEPS is the derived expression, not a bare literal", () => {
    expect(MERGE_MAX_RETRIES).toBe(10);
    expect(MERGE_MAX_DECISION_STEPS).toBe(1 + MERGE_MAX_RETRIES + 4 + 3 + 1 + 5);
    expect(MERGE_MAX_DECISION_STEPS).toBe(24);
  });
});

// ─── E1 — config file absent / unreadable ──────────────────────────────────────

describe("E1 — absent or unreadable config file", () => {
  test("parseMergeConfig(null) is all defaults, section not malformed", () => {
    const { config, sectionMalformed } = parseMergeConfig(null);
    expect(config).toEqual(MERGE_DEFAULTS);
    expect(sectionMalformed).toBe(false);
  });

  test("readMergeConfigSafely returns null when the injected read resolves null", async () => {
    const readFileFn = async () => null;
    const text = await readMergeConfigSafely(readFileFn, ".claude/pdlc.config.json");
    expect(text).toBeNull();
    const { config, sectionMalformed } = parseMergeConfig(text);
    expect(config).toEqual(MERGE_DEFAULTS);
    expect(sectionMalformed).toBe(false);
  });
});

// ─── E2 — not JSON, or JSON but not an object with a `merge` key ───────────────

describe("E2 — unparseable or non-object config", () => {
  const nonMalformedTexts = [
    "",
    "not json at all {{{",
    "42",
    '"just a string"',
    "true",
    "[1, 2, 3]",
    "{}",
    JSON.stringify({ otherField: 1 }),
  ];

  test.each(nonMalformedTexts)("%p -> defaults, sectionMalformed: false", (text) => {
    const { config, sectionMalformed } = parseMergeConfig(text);
    expect(config).toEqual(MERGE_DEFAULTS);
    expect(sectionMalformed).toBe(false);
  });
});

// ─── E3 — `merge` present but not a plain object ───────────────────────────────

describe("E3 — merge section present but not a plain object", () => {
  const malformedSections = ["a string", 42, true, [1, 2, 3], null];

  test.each(malformedSections)("merge: %p -> defaults, sectionMalformed: true", (merge) => {
    const text = JSON.stringify({ merge });
    const { config, sectionMalformed } = parseMergeConfig(text);
    expect(config).toEqual(MERGE_DEFAULTS);
    expect(sectionMalformed).toBe(true);
  });
});

// ─── E4 — one config key wrong type / out of domain defaults only itself ──────

describe("E4 — independent per-key fallback (PROP-M-10)", () => {
  // A fully valid, NON-DEFAULT section — every key differs from MERGE_DEFAULTS,
  // so "everything defaulted" cannot pass this property's positive half.
  const VALID_NON_DEFAULT = Object.freeze({
    mergeMode: "on",
    mergeRequiresCi: false,
    allowSquashMerge: true,
    deleteBranchOnPdlcMerge: false,
    mergeableRetries: 7,
    mergeableRetryDelay: 42,
    guardPaths: ["custom-guard/"],
  });

  // Four corruption modes per key (wrong type, out of domain, null, missing —
  // "missing" via `undefined`, which JSON.stringify drops from the emitted
  // object, exactly simulating an absent key). 7 keys x 4 modes = 28 cases.
  const CORRUPTIONS = Object.freeze({
    mergeMode: [42, "not-a-mode", null, undefined],
    mergeRequiresCi: [1, "true", null, undefined],
    allowSquashMerge: [0, "false", null, undefined],
    deleteBranchOnPdlcMerge: [{}, "true", null, undefined],
    mergeableRetries: [11, "3", null, undefined],
    mergeableRetryDelay: [-1, "10", null, undefined],
    guardPaths: ["not-an-array", 42, null, undefined],
  });

  const cases = [];
  for (const key of MERGE_KEYS) {
    for (const bad of CORRUPTIONS[key]) {
      cases.push({ key, bad });
    }
  }

  test("the case table has exactly 28 cases (7 keys x 4 corruption modes)", () => {
    expect(cases.length).toBe(28);
  });

  test.each(cases)(
    "corrupting only $key ($bad) defaults only $key; the other six keep their non-default values",
    ({ key, bad }) => {
      const section = { ...VALID_NON_DEFAULT, [key]: bad };
      const text = JSON.stringify({ merge: section });
      const { config, sectionMalformed } = parseMergeConfig(text);

      expect(sectionMalformed).toBe(false);
      expect(config[key]).toEqual(MERGE_DEFAULTS[key]);
      for (const otherKey of MERGE_KEYS) {
        if (otherKey === key) continue;
        expect(config[otherKey]).toEqual(VALID_NON_DEFAULT[otherKey]);
      }
    },
  );

  afterAll(assertDefaultsUntouched);
});

describe("E4 — the mergeableRetries boundary pair, and the seconds unit", () => {
  test("mergeableRetries: 10 is accepted (the upper bound)", () => {
    const text = JSON.stringify({ merge: { mergeableRetries: 10 } });
    const { config } = parseMergeConfig(text);
    expect(config.mergeableRetries).toBe(10);
  });

  test("mergeableRetries: 11 is defaulted (one past the upper bound)", () => {
    const text = JSON.stringify({ merge: { mergeableRetries: 11 } });
    const { config } = parseMergeConfig(text);
    expect(config.mergeableRetries).toBe(MERGE_DEFAULTS.mergeableRetries);
  });

  test("mergeableRetries: 0 is honoured, not treated as falsy/absent", () => {
    const text = JSON.stringify({ merge: { mergeableRetries: 0 } });
    const { config } = parseMergeConfig(text);
    expect(config.mergeableRetries).toBe(0);
  });

  test("mergeableRetryDelay: 0 is honoured (seconds unit, not milliseconds)", () => {
    const text = JSON.stringify({ merge: { mergeableRetryDelay: 0 } });
    const { config } = parseMergeConfig(text);
    expect(config.mergeableRetryDelay).toBe(0);
  });

  test("mergeableRetryDelay is documented and read in seconds, not milliseconds", () => {
    const text = JSON.stringify({ merge: { mergeableRetryDelay: 10 } });
    const { config } = parseMergeConfig(text);
    // The default (10) is itself the "seconds, not ms" fixture: TSPEC §2.2 pins
    // the unit as seconds, and no scaling happens inside the reader.
    expect(config.mergeableRetryDelay).toBe(10);
  });
});

// ─── E5 — a throwing `_readFile` is treated as E1 ──────────────────────────────

describe("E5 — readMergeConfigSafely never propagates a throw", () => {
  test("a throwing readFileFn resolves to null, not a rejection", async () => {
    const readFileFn = async () => {
      throw new Error("ENOENT: simulated read failure");
    };
    await expect(
      readMergeConfigSafely(readFileFn, ".claude/pdlc.config.json"),
    ).resolves.toBeNull();
  });

  test("a synchronously-throwing readFileFn is also caught", async () => {
    const readFileFn = () => {
      throw new Error("synchronous failure");
    };
    await expect(
      readMergeConfigSafely(readFileFn, ".claude/pdlc.config.json"),
    ).resolves.toBeNull();
  });

  test("readMergeConfigSafely is awaited at its call site (returns a Promise)", () => {
    const readFileFn = async () => "{}";
    const result = readMergeConfigSafely(readFileFn, ".claude/pdlc.config.json");
    expect(result).toBeInstanceOf(Promise);
  });
});

// ─── PROP-M-09 — Config totality ───────────────────────────────────────────────

describe("PROP-M-09 — config totality: never throws, always a complete, in-domain config", () => {
  const DETERMINISTIC_INPUTS = [
    null,
    "",
    "not json {{{",
    "42",
    '"a string"',
    "true",
    "false",
    "[1,2,3]",
    "{}",
    JSON.stringify({ merge: "nope" }),
    JSON.stringify({ merge: 42 }),
    JSON.stringify({ merge: [1, 2] }),
    JSON.stringify({ merge: null }),
    JSON.stringify({ merge: {} }),
    JSON.stringify({ merge: { mergeableRetries: 10 } }),
    JSON.stringify({ merge: { mergeableRetries: 11 } }),
    JSON.stringify({ merge: { mergeableRetries: 0 } }),
    JSON.stringify({ merge: { mergeableRetryDelay: 0 } }),
  ];

  function assertTotal(config) {
    expect(Object.keys(config).sort()).toEqual([...MERGE_KEYS].sort());
    expect(MERGE_MODES.includes(config.mergeMode)).toBe(true);
    expect(typeof config.mergeRequiresCi).toBe("boolean");
    expect(typeof config.allowSquashMerge).toBe("boolean");
    expect(typeof config.deleteBranchOnPdlcMerge).toBe("boolean");
    expect(Number.isInteger(config.mergeableRetries)).toBe(true);
    expect(config.mergeableRetries).toBeGreaterThanOrEqual(0);
    expect(config.mergeableRetries).toBeLessThanOrEqual(MERGE_MAX_RETRIES);
    expect(Number.isInteger(config.mergeableRetryDelay)).toBe(true);
    expect(config.mergeableRetryDelay).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(config.guardPaths)).toBe(true);
    for (const p of config.guardPaths) {
      expect(typeof p).toBe("string");
      expect(p.length).toBeGreaterThan(0);
    }
  }

  test.each(DETERMINISTIC_INPUTS)("never throws, and totality holds for %p", (text) => {
    let result;
    expect(() => {
      result = parseMergeConfig(text);
    }).not.toThrow();
    assertTotal(result.config);
  });

  // Seeded loop (rule 1): the literal seed is a module constant, overridable via
  // PDLC_PROP_SEED, and a failure prints the seed and the case value (via the
  // case index below) so a red is reproducible.
  const rng = seeded(resolveSeed(MERGE_PROP_SEED));
  const RUN_COUNT = 500;
  const KEY_STATE_VALUES = Object.freeze({
    mergeMode: {
      valid: () => rng.pick(MERGE_MODES),
      wrongType: () => 42,
      outOfDomain: () => "totally-not-a-mode",
      nullValue: () => null,
      missing: () => undefined,
    },
    mergeRequiresCi: {
      valid: () => rng.pick([true, false]),
      wrongType: () => "true",
      outOfDomain: () => 1,
      nullValue: () => null,
      missing: () => undefined,
    },
    allowSquashMerge: {
      valid: () => rng.pick([true, false]),
      wrongType: () => "false",
      outOfDomain: () => 0,
      nullValue: () => null,
      missing: () => undefined,
    },
    deleteBranchOnPdlcMerge: {
      valid: () => rng.pick([true, false]),
      wrongType: () => "true",
      outOfDomain: () => 1,
      nullValue: () => null,
      missing: () => undefined,
    },
    mergeableRetries: {
      valid: () => rng.int(0, MERGE_MAX_RETRIES),
      wrongType: () => "3",
      outOfDomain: () => rng.int(MERGE_MAX_RETRIES + 1, MERGE_MAX_RETRIES + 50),
      nullValue: () => null,
      missing: () => undefined,
    },
    mergeableRetryDelay: {
      valid: () => rng.int(0, 120),
      wrongType: () => "10",
      outOfDomain: () => -1 * rng.int(1, 50),
      nullValue: () => null,
      missing: () => undefined,
    },
    guardPaths: {
      valid: () => [`seeded-${rng.int(0, 1000)}/`],
      wrongType: () => "not-an-array",
      outOfDomain: () => 42,
      nullValue: () => null,
      missing: () => undefined,
    },
  });
  const STATE_NAMES = ["valid", "wrongType", "outOfDomain", "nullValue", "missing"];

  test(`a seeded loop of ${RUN_COUNT} random configs (seed ${MERGE_PROP_SEED}) always holds totality`, () => {
    for (let i = 0; i < RUN_COUNT; i++) {
      const section = {};
      for (const key of MERGE_KEYS) {
        const state = rng.pick(STATE_NAMES);
        const value = KEY_STATE_VALUES[key][state]();
        if (value !== undefined) section[key] = value;
      }
      const text = JSON.stringify({ merge: section });
      let result;
      try {
        result = parseMergeConfig(text);
      } catch (err) {
        throw new Error(
          `parseMergeConfig threw on seed ${rng.seed}, case #${i}: ${JSON.stringify(section)} — ${err}`,
        );
      }
      try {
        assertTotal(result.config);
      } catch (err) {
        err.message = `seed ${rng.seed}, case #${i}, section=${JSON.stringify(section)}: ${err.message}`;
        throw err;
      }
    }
  });

  afterAll(assertDefaultsUntouched);
});
