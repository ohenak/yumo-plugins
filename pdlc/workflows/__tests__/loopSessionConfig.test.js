// loopSessionConfig.test.js — PLAN P1-01 (red) / P1-02 (green).
//
// Config-reader cases: the four `case` values (`absent-file`,
// `absent-section`, `malformed-section`, `explicit-default`), `LOOP_DEFAULTS`
// asserted against a literal transcription of FSPEC BR-01's four values, and
// per-key independent defaulting with `invalidKeys` naming each substituted
// key (BR-03, PROP-CFG-04).
//
// `pdlc/workflows/lib/loop-session.mjs` does not exist yet at P1-01 — the
// module is P1-02's deliverable. Every block below is therefore committed
// `.skip`ped, titled "P1-02: ...", and un-skipped by P1-02. The dynamic
// `await import` (rather than a top-level static import) lets this file load
// and its skips take effect even though the target module is absent.

describe("readLoopConfig — case reporting (PLAN P1-01/P1-02)", () => {
  test("P1-02: LOOP_DEFAULTS is set-equal to a literal transcription of BR-01", async () => {
    const { LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    // Transcribed literally from FSPEC BR-01 — never derived from the
    // module under test (PROP-CFG-02: the constant-compared-with-itself
    // defect).
    expect(LOOP_DEFAULTS).toEqual({
      backoffSchedule: [5, 15, 30, 60],
      idleStopAfter: 4,
      preflight: "strict",
      dirtyTreePolicy: "tracked",
    });
    expect(Object.isFrozen(LOOP_DEFAULTS)).toBe(true);
  });

  test("P1-02: absent-file — null text reports case absent-file with defaults applied", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(null);

    expect(result.case).toBe("absent-file");
    expect(result.config).toEqual(LOOP_DEFAULTS);
  });

  test("P1-02: absent-file — unreadable/non-JSON bytes collapse onto absent-file", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig("{not valid json");

    expect(result.case).toBe("absent-file");
    expect(result.config).toEqual(LOOP_DEFAULTS);
  });

  test("P1-02: absent-section — parsed object has no own property loop", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ merge: {} }));

    expect(result.case).toBe("absent-section");
    expect(result.config).toEqual(LOOP_DEFAULTS);
  });

  test("P1-02: malformed-section — loop present but not a plain object", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ loop: "not-an-object" }));

    expect(result.case).toBe("malformed-section");
    expect(result.config).toEqual(LOOP_DEFAULTS);
  });

  test("P1-02: malformed-section — loop is an object every key of which is out-of-domain", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ loop: { unknownKey: 1 } }));

    expect(result.case).toBe("malformed-section");
    expect(result.config).toEqual(LOOP_DEFAULTS);
  });

  test("P1-02: explicit-default — loop present as an object with >=1 in-domain key", async () => {
    const { readLoopConfig } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ loop: { idleStopAfter: 4 } }));

    expect(result.case).toBe("explicit-default");
  });

  test("P1-02: the four reported cases are pairwise distinct", async () => {
    const { readLoopConfig } = await import("../lib/loop-session.mjs");

    const cases = [
      readLoopConfig(null).case,
      readLoopConfig(JSON.stringify({ merge: {} })).case,
      readLoopConfig(JSON.stringify({ loop: "not-an-object" })).case,
      readLoopConfig(JSON.stringify({ loop: { idleStopAfter: 4 } })).case,
    ];

    expect(new Set(cases).size).toBe(4);
    expect(cases).toEqual([
      "absent-file",
      "absent-section",
      "malformed-section",
      "explicit-default",
    ]);
  });
});

describe("readLoopConfig — completeness (PLAN P1-01/P1-02, PROP-CFG-01)", () => {
  test("P1-02: config is complete — all four keys present for every input", async () => {
    const { readLoopConfig } = await import("../lib/loop-session.mjs");

    const inputs = [
      null,
      JSON.stringify({ merge: {} }),
      JSON.stringify({ loop: "not-an-object" }),
      JSON.stringify({ loop: { idleStopAfter: 4, preflight: "off" } }),
    ];

    for (const text of inputs) {
      const { config } = readLoopConfig(text);
      expect(Object.keys(config).sort()).toEqual([
        "backoffSchedule",
        "dirtyTreePolicy",
        "idleStopAfter",
        "preflight",
      ]);
    }
  });
});

describe("readLoopConfig — per-key independent defaulting (PLAN P1-01, BR-03, PROP-CFG-04)", () => {
  test("P1-02: bad keys default independently; good keys keep configured values; invalidKeys names each substituted key", async () => {
    const { readLoopConfig, LOOP_DEFAULTS } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(
      JSON.stringify({
        loop: {
          idleStopAfter: "not-a-number",
          backoffSchedule: { not: "an-array" },
          preflight: "off",
          dirtyTreePolicy: "any",
        },
      }),
    );

    // Bad keys fall back to the declared default.
    expect(result.config.idleStopAfter).toEqual(LOOP_DEFAULTS.idleStopAfter);
    expect(result.config.backoffSchedule).toEqual(LOOP_DEFAULTS.backoffSchedule);

    // Good keys keep their configured (non-default) values — the conjunct
    // that fails a reader which discards the whole section on one bad key.
    expect(result.config.preflight).toBe("off");
    expect(result.config.dirtyTreePolicy).toBe("any");

    expect(result.invalidKeys.slice().sort()).toEqual(["backoffSchedule", "idleStopAfter"]);
  });

  test("P1-02: an empty array is an in-domain backoffSchedule, not a substitution", async () => {
    const { readLoopConfig } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ loop: { backoffSchedule: [] } }));

    expect(result.config.backoffSchedule).toEqual([]);
    expect(result.invalidKeys).not.toContain("backoffSchedule");
  });

  test("P1-02: zero is an in-domain idleStopAfter, not a substitution", async () => {
    const { readLoopConfig } = await import("../lib/loop-session.mjs");

    const result = readLoopConfig(JSON.stringify({ loop: { idleStopAfter: 0 } }));

    expect(result.config.idleStopAfter).toBe(0);
    expect(result.invalidKeys).not.toContain("idleStopAfter");
  });
});
