// advisoryConfig.test.js — PLAN A-03 (batch 3, depends on A-02).
//
// RED (authored as `describe.skip`, un-skipped by the 🟢 owner A-17). This file owns
// PROP-CFG-01 … PROP-CFG-07 and P-1 (PROPERTIES §4.1, §11, §12.2) — the full property set over
// `parseAdvisoryConfig` and `readAdvisoryConfigSafely` (TSPEC §3.2). It exercises TSPEC/FSPEC
// cases T-01-1 (no `advisory` section behaves exactly like §12) and T-01-6 (one out-of-range key
// falls back alone, the sibling key keeps its configured value, the substitution is reported).
//
// What this file does NOT claim: T-10-4 ("no advisory section, and separately a malformed config
// file, both behave as T-10-3" — the disabled-run *artifact* claim: no advisory content on the
// report at all) has its single home in `advisoryDisabled.test.js` (A-16 🔴 / A-33 🟢). The
// emit-gate tests below (PROP-CFG-04) assert the gate's boolean *mechanism* — that the notice is
// suppressed at the emit site whenever the effective `enabled` is false, and that the parser keeps
// populating `invalidKeys` regardless of `enabled` — never that a whole disabled run's report or
// created-file set is unaffected. That whole-run equivalence is T-10-4's, not this file's.
//
// Every canonical double/generator comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) —
// no locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else.
//
// `parseAdvisoryConfig`, `readAdvisoryConfigSafely` and `ADVISORY_DEFAULTS` do not exist on
// `orchestrate-dev.js` yet — they land at A-17. This file therefore imports the module as a
// namespace (`* as devModule`) and reaches the not-yet-existing symbols only from *inside*
// `describe.skip` bodies (property access on a namespace object for a missing member yields
// `undefined` at runtime rather than a link-time SyntaxError, unlike a named import of a
// nonexistent export). Every `describe.skip` block therefore imports cleanly today and will run,
// unmodified, the moment A-17 adds the exports.

import * as devModule from "../orchestrate-dev.js";

import { makeFileDouble, makeAdvisoryConfig, makeAdvisoryGenerators, resolveSeed } from "./helpers/advisoryDoubles.js";

// Same per-repo config home Phase MERGE and the distribution gate already use
// (`orchestrate-dev.js:43`), aliased by `ADVISORY_CONFIG_PATH` at TSPEC §3.1/§3.2 — transcribed
// here as a literal because that constant is not exported until A-17 (PROP-CFG-05 spies on the
// *reader*, never on a `_readFile` call scoped to this literal path, per its own "O-3" rule).
const ADVISORY_CONFIG_PATH = ".claude/pdlc.config.json";

// `ADVISORY_DEFAULTS` (TSPEC §3.1), transcribed via the shared double rather than re-declared —
// `makeAdvisoryConfig()` returns `{ config, sectionMalformed, invalidKeys }` at exactly the
// defaults, so `.config` is the literal this file compares against.
const ADVISORY_DEFAULTS = makeAdvisoryConfig().config;

// Arbitrary literal seed for this file's one generator-driven property (P-1), overridable via
// `PDLC_PROP_SEED` per `driftGenerators.js`'s §1.3 rule 1 (reached here only through
// `makeAdvisoryGenerators`, never a locally-declared PRNG — PROP-INFRA-02).
const ADV_CFG_SEED = 0x41445603;
const SEED = resolveSeed(ADV_CFG_SEED);

// One of the four values `makeAdvisoryGenerators().configObject()` uses to corrupt exactly one
// key per draw (`advisoryDoubles.js` — "not-a-number", null, {}, -1). None of the four is ever a
// value the generator's *valid* domain for any key can produce (booleans for `enabled`, positive
// ints for `attemptBudget`/`seamBudgetMinutes`, a string array for `envelope`), so detecting
// corruption this way is grounded in the generator's own contract, not in `parseAdvisoryConfig`'s
// implementation — it does not echo the parser under test.
function isGeneratorCorruptValue(value) {
  if (value === "not-a-number" || value === -1 || value === null) return true;
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// PROP-CFG-01 — totality: never throws, for any input.
// ---------------------------------------------------------------------------

describe("PROP-CFG-01 — parseAdvisoryConfig is total and never throws", () => {
  test.each([
    ["null", null],
    ["empty string", ""],
    ["non-JSON bytes", "not json at all {{{"],
    ["JSON array, not an object", JSON.stringify([1, 2, 3])],
    ["JSON object with no advisory key", JSON.stringify({ other: true })],
    ["advisory key present but not an object", JSON.stringify({ advisory: "nope" })],
    ["advisory key present but null", JSON.stringify({ advisory: null })],
  ])("does not throw given %s", (_label, input) => {
    expect(() => devModule.parseAdvisoryConfig(input)).not.toThrow();
  });

  test("always returns the declared three-key shape", () => {
    const result = devModule.parseAdvisoryConfig(null);
    expect(Object.keys(result).sort()).toEqual(["config", "invalidKeys", "sectionMalformed"]);
    expect(Array.isArray(result.invalidKeys)).toBe(true);
    expect(typeof result.sectionMalformed).toBe("boolean");
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-02 — absent section / absent file / malformed JSON ⇒ defaults
// (T-01-1: no advisory section, a seam condition present, behaves exactly as §12 — the config
// half of that claim is that the section-absent parse yields defaults with no invalidKeys).
// ---------------------------------------------------------------------------

describe("PROP-CFG-02 — absent/unreadable/malformed input yields ADVISORY_DEFAULTS (T-01-1)", () => {
  test.each([
    ["file absent (text === null)", null],
    ["no advisory section", JSON.stringify({ other: 1 })],
    ["unparseable JSON", "{ this is not json"],
    ["top-level JSON is an array", JSON.stringify(["advisory"])],
  ])("%s ⇒ config deep-equals ADVISORY_DEFAULTS, invalidKeys is empty", (_label, input) => {
    const { config, invalidKeys } = devModule.parseAdvisoryConfig(input);
    expect(config).toEqual(ADVISORY_DEFAULTS);
    expect(invalidKeys).toEqual([]);
  });

  test("an advisory section present but not a plain object marks the section malformed, still defaults", () => {
    const { config, invalidKeys, sectionMalformed } = devModule.parseAdvisoryConfig(
      JSON.stringify({ advisory: "not-an-object" })
    );
    expect(config).toEqual(ADVISORY_DEFAULTS);
    expect(invalidKeys).toEqual([]);
    expect(sectionMalformed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-03 — per-key independent fallback (T-01-6).
// ---------------------------------------------------------------------------

describe("PROP-CFG-03 — one out-of-range key falls back alone (T-01-6)", () => {
  test("attemptBudget out of range, seamBudgetMinutes valid ⇒ attemptBudget defaults, seamBudgetMinutes keeps its configured value, invalidKeys names only attemptBudget", () => {
    const raw = JSON.stringify({
      advisory: { attemptBudget: -1, seamBudgetMinutes: 42 },
    });
    const { config, invalidKeys } = devModule.parseAdvisoryConfig(raw);
    expect(config.attemptBudget).toBe(ADVISORY_DEFAULTS.attemptBudget);
    expect(config.seamBudgetMinutes).toBe(42);
    expect(invalidKeys).toEqual(["attemptBudget"]);
  });

  test("seamBudgetMinutes out of range, attemptBudget valid ⇒ the reverse", () => {
    const raw = JSON.stringify({
      advisory: { attemptBudget: 2, seamBudgetMinutes: "not-a-number" },
    });
    const { config, invalidKeys } = devModule.parseAdvisoryConfig(raw);
    expect(config.attemptBudget).toBe(2);
    expect(config.seamBudgetMinutes).toBe(ADVISORY_DEFAULTS.seamBudgetMinutes);
    expect(invalidKeys).toEqual(["seamBudgetMinutes"]);
  });

  test("a malformed enabled key does not reset attemptBudget or seamBudgetMinutes", () => {
    const raw = JSON.stringify({
      advisory: { enabled: "yes", attemptBudget: 4, seamBudgetMinutes: 7 },
    });
    const { config, invalidKeys } = devModule.parseAdvisoryConfig(raw);
    expect(config.enabled).toBe(ADVISORY_DEFAULTS.enabled);
    expect(config.attemptBudget).toBe(4);
    expect(config.seamBudgetMinutes).toBe(7);
    expect(invalidKeys).toEqual(["enabled"]);
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-04 — the invalidKeys emit-gate mechanism (mechanism only — NOT T-10-4's disabled-run
// artifact claim, whose single home is advisoryDisabled.test.js).
// ---------------------------------------------------------------------------

describe("PROP-CFG-04 — degraded-key notice is gated on effective enabled (mechanism, not T-10-4)", () => {
  // TSPEC §3.2's caller-side gate, transcribed verbatim as the mechanism under test:
  //   if (advisory.config.enabled && advisory.invalidKeys.length) { emit(...) }
  // This is a pure re-statement of that one-line gate over `parseAdvisoryConfig`'s own output —
  // it never invokes `main()`, never asserts anything about a run's report or created-file set,
  // and it is not the T-10-4 claim that a whole disabled run carries no advisory content at all.
  function wouldEmitDegradedKeyNotice(parsed) {
    return Boolean(parsed.config.enabled && parsed.invalidKeys.length);
  }

  test("the parser populates invalidKeys regardless of the effective enabled value", () => {
    const raw = JSON.stringify({ advisory: { enabled: false, attemptBudget: "not-a-number" } });
    const { config, invalidKeys } = devModule.parseAdvisoryConfig(raw);
    expect(config.enabled).toBe(false);
    expect(invalidKeys).toEqual(["attemptBudget"]);
  });

  test("gate is false when effective enabled is false, even with a non-empty invalidKeys", () => {
    const raw = JSON.stringify({ advisory: { enabled: false, attemptBudget: "not-a-number" } });
    const parsed = devModule.parseAdvisoryConfig(raw);
    expect(wouldEmitDegradedKeyNotice(parsed)).toBe(false);
  });

  test("gate is false when enabled itself is the malformed key (resolves to the false default)", () => {
    const raw = JSON.stringify({ advisory: { enabled: "not-a-boolean", attemptBudget: "not-a-number" } });
    const parsed = devModule.parseAdvisoryConfig(raw);
    expect(parsed.config.enabled).toBe(ADVISORY_DEFAULTS.enabled); // false
    expect(wouldEmitDegradedKeyNotice(parsed)).toBe(false);
  });

  test("gate is true when effective enabled is true and invalidKeys is non-empty", () => {
    const raw = JSON.stringify({ advisory: { enabled: true, attemptBudget: "not-a-number" } });
    const parsed = devModule.parseAdvisoryConfig(raw);
    expect(wouldEmitDegradedKeyNotice(parsed)).toBe(true);
  });

  test("gate is false when enabled is true but invalidKeys is empty", () => {
    const raw = JSON.stringify({ advisory: { enabled: true, attemptBudget: 3, seamBudgetMinutes: 10 } });
    const parsed = devModule.parseAdvisoryConfig(raw);
    expect(wouldEmitDegradedKeyNotice(parsed)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-05 — readAdvisoryConfigSafely: read exactly once, safely, and the result threads
// without a second read (C-3). Unit half plus one Integration-level harness.
// ---------------------------------------------------------------------------

describe("PROP-CFG-05 — readAdvisoryConfigSafely reads once and threads safely (C-3, F-1)", () => {
  test("returns the file contents on a successful read, calling readFileFn exactly once with ADVISORY_CONFIG_PATH", async () => {
    const file = makeFileDouble({ seed: { [ADVISORY_CONFIG_PATH]: JSON.stringify({ advisory: { enabled: true } }) } });
    const text = await devModule.readAdvisoryConfigSafely(file._readFile, ADVISORY_CONFIG_PATH);
    expect(text).toBe(JSON.stringify({ advisory: { enabled: true } }));
    expect(file.reads).toEqual([ADVISORY_CONFIG_PATH]);
  });

  test("returns null, never throws, when the underlying read throws (absent/unreadable)", async () => {
    const file = makeFileDouble({ throwOn: new Set([ADVISORY_CONFIG_PATH]) });
    await expect(devModule.readAdvisoryConfigSafely(file._readFile, ADVISORY_CONFIG_PATH)).resolves.toBeNull();
    expect(file.reads).toEqual([ADVISORY_CONFIG_PATH]);
  });

  // Integration: a run threads ONE read result to every consumer that needs it — modelled here as
  // two independent "seam-like" consumers sharing the one resolved value, never re-reading. A
  // second `readAdvisoryConfigSafely` call against the same double would show up as a second
  // recorded read, which this asserts never happens across the two consumers.
  test("integration — one read threads to two downstream consumers with no second read", async () => {
    const file = makeFileDouble({ seed: { [ADVISORY_CONFIG_PATH]: JSON.stringify({ advisory: { enabled: true, attemptBudget: 2 } }) } });

    const raw = await devModule.readAdvisoryConfigSafely(file._readFile, ADVISORY_CONFIG_PATH);
    const parsed = devModule.parseAdvisoryConfig(raw);

    // Two downstream "consumers" of the SAME threaded `parsed` value — neither re-reads.
    const consumerA = (advisory) => advisory.config.enabled;
    const consumerB = (advisory) => advisory.config.attemptBudget;

    expect(consumerA(parsed)).toBe(true);
    expect(consumerB(parsed)).toBe(2);
    expect(file.reads).toEqual([ADVISORY_CONFIG_PATH]);
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-06 — no advisory code path writes ADVISORY_CONFIG_PATH; the parsed config is frozen.
// ---------------------------------------------------------------------------

describe("PROP-CFG-06 — parsed config is frozen and never written back (C-4)", () => {
  test("the returned config object is frozen", () => {
    const { config } = devModule.parseAdvisoryConfig(JSON.stringify({ advisory: { enabled: true } }));
    expect(Object.isFrozen(config)).toBe(true);
  });

  test("mutating an attempted assignment on the returned config never changes it", () => {
    const { config } = devModule.parseAdvisoryConfig(null);
    expect(() => {
      "use strict";
      config.enabled = true;
    }).toThrow();
    expect(config.enabled).toBe(ADVISORY_DEFAULTS.enabled);
  });

  test("parseAdvisoryConfig never calls a writer: a file double whose _writeFile throws on any call stays untouched", () => {
    const file = makeFileDouble();
    file._writeFile = () => {
      throw new Error("parseAdvisoryConfig must never write");
    };
    expect(() => devModule.parseAdvisoryConfig(JSON.stringify({ advisory: { enabled: true } }))).not.toThrow();
    expect(file.writes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// PROP-CFG-07 — config.envelope is not widenable at runtime.
// ---------------------------------------------------------------------------

describe("PROP-CFG-07 — config.envelope cannot be widened at runtime (E-R1, BR-1)", () => {
  test("the parsed envelope array is frozen", () => {
    const { config } = devModule.parseAdvisoryConfig(JSON.stringify({ advisory: { envelope: ["E-1", "E-2"] } }));
    expect(Object.isFrozen(config.envelope)).toBe(true);
  });

  test("an attempted push onto the parsed envelope throws and leaves it unchanged", () => {
    const { config } = devModule.parseAdvisoryConfig(JSON.stringify({ advisory: { envelope: ["E-1"] } }));
    const before = [...config.envelope];
    expect(() => config.envelope.push("E-9")).toThrow();
    expect(config.envelope).toEqual(before);
  });

  test("a proposal naming an action outside the parsed envelope leaves config.envelope deep-equal to its parsed value", () => {
    const { config } = devModule.parseAdvisoryConfig(JSON.stringify({ advisory: { envelope: ["E-1", "E-3"] } }));
    const before = [...config.envelope];
    // Simulates a verdict/prompt/agent text proposing an action outside the allow-list — this
    // task owns only the config-side guarantee that such a proposal cannot mutate the config; the
    // classifier that would refuse the proposal itself is A-06's (`classifyEnvelope`).
    const proposedAction = { seam: "A2", action: "widen-envelope", target: "E-9" };
    expect(proposedAction.target).not.toEqual(expect.arrayContaining(config.envelope));
    expect(config.envelope).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// P-1 — generator-driven: parseAdvisoryConfig is total and per-key independent over an arbitrary
// generated JSON config text (PROPERTIES §11, PLAN §6.5). Draws from
// `makeAdvisoryGenerators(seed).configObject()` — no locally-declared PRNG (PROP-INFRA-02).
// ---------------------------------------------------------------------------

describe("P-1 — parseAdvisoryConfig: totality + per-key independence over generated configs", () => {
  const DRAWS = 40; // bounded per §11's Hypothesis-style hygiene note for P-1.

  test(`holds over ${DRAWS} generated configs`, () => {
    const gen = makeAdvisoryGenerators(SEED);

    for (let i = 0; i < DRAWS; i += 1) {
      const raw = gen.configObject();
      const { advisory } = JSON.parse(raw);

      let result;
      expect(() => {
        result = devModule.parseAdvisoryConfig(raw);
      }).not.toThrow();

      const { config, invalidKeys } = result;

      // Every returned key is a member of ADVISORY_DEFAULTS' key set.
      expect(Object.keys(config).sort()).toEqual(Object.keys(ADVISORY_DEFAULTS).sort());

      const expectedInvalid = Object.keys(advisory).filter((key) => isGeneratorCorruptValue(advisory[key]));

      expect([...invalidKeys].sort()).toEqual(expectedInvalid.sort());

      for (const key of Object.keys(ADVISORY_DEFAULTS)) {
        if (expectedInvalid.includes(key)) {
          expect(config[key]).toEqual(ADVISORY_DEFAULTS[key]);
        } else if (Object.prototype.hasOwnProperty.call(advisory, key)) {
          expect(config[key]).toEqual(advisory[key]);
        }
      }
    }
  });

  test("is reproducible: replaying the same seed from the start draws the same sequence", () => {
    const genA = makeAdvisoryGenerators(SEED);
    const genB = makeAdvisoryGenerators(SEED);
    for (let i = 0; i < 5; i += 1) {
      expect(genA.configObject()).toEqual(genB.configObject());
    }
  });
});
