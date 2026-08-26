// waveResume.test.js — T-02 (batch 2). Pure-unit suite for the pdlc-wave-resume
// extraction (D-5, D-1, D-4): the three frozen catalogues, `ANCESTRY_INDEPENDENT_CODES`,
// `classifyWaveLedger`'s ordered guard table, `parseWaveLedger`'s three arms, and
// `formatWaveLedger`'s two shapes.
//
// Oracle rule (TSPEC §5.1): every expected value here is transcribed as a literal
// from TSPEC §3.1/§3.2 — never read back out of the module under test. This is what
// lets AT-02, AT-08 and AT-13 fail on a deletion instead of trivially agreeing with
// itself.

import {
  RESUME_OUTCOMES,
  RESUME_PROVENANCE,
  WAVE_IGNORE_REASONS,
  ANCESTRY_INDEPENDENT_CODES,
  IMPLEMENTATION_DEFAULTS,
  classifyWaveLedger,
  parseWaveLedger,
  formatWaveLedger,
} from "../orchestrate-dev.js";

// ─── §3.1 Frozen catalogues (AT-02, AT-13 unit halves) ─────────────────────────

describe("RESUME_OUTCOMES — the outcome catalogue, closed at three (TSPEC §3.1, FSPEC BR-01)", () => {
  it("is exactly [\"full-run\", \"resume\", \"skip-phase\"], by set equality", () => {
    expect(new Set(RESUME_OUTCOMES)).toEqual(new Set(["full-run", "resume", "skip-phase"]));
    expect(RESUME_OUTCOMES.length).toBe(3);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(RESUME_OUTCOMES)).toBe(true);
  });
});

describe("RESUME_PROVENANCE — the provenance vocabulary, closed at two (TSPEC §3.1, FSPEC BR-07)", () => {
  it("is exactly [\"operator-set\", \"automatic\"], by set equality", () => {
    expect(new Set(RESUME_PROVENANCE)).toEqual(new Set(["operator-set", "automatic"]));
    expect(RESUME_PROVENANCE.length).toBe(2);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(RESUME_PROVENANCE)).toBe(true);
  });
});

describe("WAVE_IGNORE_REASONS — the disregard-reason codes, closed at seven (TSPEC §3.1, FSPEC BR-02/AT-02)", () => {
  it("is set-equal to the seven transcribed codes — not a containment check", () => {
    expect(new Set(Object.keys(WAVE_IGNORE_REASONS))).toEqual(
      new Set([
        "unreadable-json",
        "not-an-object",
        "wrong-shape",
        "feature-mismatch",
        "plan-changed",
        "head-unreachable",
        "over-count",
      ])
    );
  });

  it("every code renders to a function", () => {
    for (const code of Object.keys(WAVE_IGNORE_REASONS)) {
      expect(typeof WAVE_IGNORE_REASONS[code]).toBe("function");
    }
  });

  // Phase CR round 1, TE F-06: PLAN §4.5's DoD row asserts all three
  // catalogues are `Object.freeze`d exports, but only RESUME_OUTCOMES and
  // RESUME_PROVENANCE were checked. A closed catalogue an importer can extend
  // at runtime is not closed.
  it("is frozen", () => {
    expect(Object.isFrozen(WAVE_IGNORE_REASONS)).toBe(true);
  });
});

describe("ANCESTRY_INDEPENDENT_CODES — the guard-1..4 codes ancestry cannot affect (TSPEC §2.2/§3.2)", () => {
  it("is exactly [null, unreadable-json, not-an-object, wrong-shape, feature-mismatch, plan-changed]", () => {
    expect([...ANCESTRY_INDEPENDENT_CODES]).toEqual([
      null,
      "unreadable-json",
      "not-an-object",
      "wrong-shape",
      "feature-mismatch",
      "plan-changed",
    ]);
  });

  // Phase CR round 1, TE F-06 — see the WAVE_IGNORE_REASONS note above.
  it("is frozen", () => {
    expect(Object.isFrozen(ANCESTRY_INDEPENDENT_CODES)).toBe(true);
  });
});

describe("IMPLEMENTATION_DEFAULTS — the configuration surface, closed at four keys (TSPEC §3.5, AT-08 iii)", () => {
  it("is set-equal to testCommand, postWaveCommand, postWavePathspecs, startWave", () => {
    expect(new Set(Object.keys(IMPLEMENTATION_DEFAULTS))).toEqual(
      new Set(["testCommand", "postWaveCommand", "postWavePathspecs", "startWave"])
    );
  });
});

// ─── parseWaveLedger — three no-record literals, three rejecting arms (D-4, AT-02) ─

describe("parseWaveLedger — the three no-record literals close IG-6 (TSPEC §4.1, D-4, PROP-DISREGARD-04)", () => {
  it.each([
    ["null", null],
    ["the empty string", ""],
    ["the cleared object \"{}\"", "{}"],
  ])("%s returns exactly {state: null, reason: null}", (_label, input) => {
    expect(parseWaveLedger(input)).toEqual({ state: null, reason: null });
  });
});

describe("parseWaveLedger — the three IG-1 arms, exact shipped sentences (TSPEC §3.1, PROP-DISREGARD-05)", () => {
  it("unreadable JSON returns \"it is not readable JSON\"", () => {
    expect(parseWaveLedger("not json{")).toEqual({
      state: null,
      reason: "it is not readable JSON",
    });
  });

  it("valid JSON that is not an object returns \"it is not a JSON object\"", () => {
    expect(parseWaveLedger("[1,2,3]")).toEqual({
      state: null,
      reason: "it is not a JSON object",
    });
  });

  it("a JSON object missing required fields returns \"its fields are not the shape this workflow writes\"", () => {
    expect(parseWaveLedger(JSON.stringify({ version: 1 }))).toEqual({
      state: null,
      reason: "its fields are not the shape this workflow writes",
    });
  });
});

// ─── formatWaveLedger — the two record shapes (TSPEC §3.3) ─────────────────────

describe("formatWaveLedger — the two record shapes", () => {
  it("with a head, serialises the five-field record, pretty-printed and newline-terminated", () => {
    const text = formatWaveLedger("my-feat", "deadbeef", 2, "abc123");
    expect(text).toBe(
      `${JSON.stringify(
        { version: 1, feature: "my-feat", planHash: "deadbeef", lastGreenWave: 2, head: "abc123" },
        null,
        2
      )}\n`
    );
  });

  it("with no head, serialises the four-field record, omitting head entirely", () => {
    const text = formatWaveLedger("my-feat", "deadbeef", 2);
    expect(text).toBe(
      `${JSON.stringify(
        { version: 1, feature: "my-feat", planHash: "deadbeef", lastGreenWave: 2 },
        null,
        2
      )}\n`
    );
  });
});

// ─── WAVE_IGNORE_REASONS — one renderer per code, from a transcribed ReasonContext ─
// (TSPEC §3.2, TE F-11 — no caller builds a ReasonContext; the classifier does, so
// the unit test transcribes one literal per code instead of reading it back out.)

describe("WAVE_IGNORE_REASONS — one unit case per reason renderer", () => {
  it("unreadable-json renders the shipped parseWaveLedger sentence", () => {
    const ctx = { feature: "my-feat", waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["unreadable-json"](ctx)).toBe("it is not readable JSON");
  });

  it("not-an-object renders the shipped parseWaveLedger sentence", () => {
    const ctx = { feature: "my-feat", waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["not-an-object"](ctx)).toBe("it is not a JSON object");
  });

  it("wrong-shape renders the shipped parseWaveLedger sentence", () => {
    const ctx = { feature: "my-feat", waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["wrong-shape"](ctx)).toBe(
      "its fields are not the shape this workflow writes"
    );
  });

  it("feature-mismatch names both the recorded feature and this run's feature", () => {
    const ctx = { feature: "my-feat", recordedFeature: "other-feat", waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["feature-mismatch"](ctx)).toBe(
      'it records feature "other-feat", not "my-feat"'
    );
  });

  it("plan-changed renders the shipped sentence", () => {
    const ctx = { feature: "my-feat", waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["plan-changed"](ctx)).toBe(
      "the PLAN's wave layout has changed since it was written"
    );
  });

  it("head-unreachable names the recorded commit's short sha", () => {
    const ctx = {
      feature: "my-feat",
      recordedHead: "0123456789abcdef0123456789abcdef01234567",
      waveCount: 3,
    };
    expect(WAVE_IGNORE_REASONS["head-unreachable"](ctx)).toBe(
      "the commit it records (0123456789ab) is not an ancestor of HEAD — the branch was " +
        "reset or re-cut since it was written, so the work it records is not in this tree"
    );
  });

  it("over-count names the recorded and actual wave counts", () => {
    const ctx = { feature: "my-feat", recordedLastGreenWave: 9, waveCount: 3 };
    expect(WAVE_IGNORE_REASONS["over-count"](ctx)).toBe(
      "it records 9 wave(s) green and this plan has only 3"
    );
  });
});

// ─── classifyWaveLedger — the ordered guard table, all eight rows (TSPEC §3.2) ──

describe("classifyWaveLedger — the ordered guard table, all eight rows", () => {
  const feature = "my-feat";
  const planHash = "deadbeef";
  const waveCount = 3;

  it("guard 1 (IG-6): no record at all classifies full-run, silent, code null", () => {
    const parsed = { state: null, reason: null };
    expect(classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true })).toEqual({
      outcome: "full-run",
      startWave: 1,
      provenance: "automatic",
      silent: true,
      code: null,
    });
  });

  it.each([
    ["it is not readable JSON", "unreadable-json"],
    ["it is not a JSON object", "not-an-object"],
    ["its fields are not the shape this workflow writes", "wrong-shape"],
  ])("guard 2 (IG-1): parseWaveLedger reason %s classifies full-run, code %s", (reason, code) => {
    const parsed = { state: null, reason };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true });
    expect(d.outcome).toBe("full-run");
    expect(d.startWave).toBe(1);
    expect(d.provenance).toBe("automatic");
    expect(d.silent).toBe(false);
    expect(d.code).toBe(code);
    expect(typeof d.reason).toBe("string");
  });

  it("guard 3 (IG-2): a recorded feature mismatch classifies full-run, code feature-mismatch", () => {
    const parsed = {
      state: { feature: "other-feat", planHash, lastGreenWave: 1, head: null },
      reason: null,
    };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true });
    expect(d.outcome).toBe("full-run");
    expect(d.silent).toBe(false);
    expect(d.code).toBe("feature-mismatch");
  });

  it("guard 4 (IG-3): a recorded planHash mismatch classifies full-run, code plan-changed", () => {
    const parsed = {
      state: { feature, planHash: "00000000", lastGreenWave: 1, head: null },
      reason: null,
    };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true });
    expect(d.outcome).toBe("full-run");
    expect(d.code).toBe("plan-changed");
  });

  it("guard 5 (IG-5): an unreachable head classifies full-run, code head-unreachable", () => {
    const parsed = {
      state: { feature, planHash, lastGreenWave: 1, head: "abc123" },
      reason: null,
    };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: false });
    expect(d.outcome).toBe("full-run");
    expect(d.code).toBe("head-unreachable");
  });

  it("guard 6 (IG-4): lastGreenWave beyond this plan's wave count classifies full-run, code over-count", () => {
    const parsed = {
      state: { feature, planHash, lastGreenWave: 9, head: null },
      reason: null,
    };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true });
    expect(d.outcome).toBe("full-run");
    expect(d.code).toBe("over-count");
  });

  it("guard 7: lastGreenWave equal to the wave count classifies skip-phase", () => {
    const parsed = {
      state: { feature, planHash, lastGreenWave: 3, head: "abc123" },
      reason: null,
    };
    expect(classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true })).toEqual({
      outcome: "skip-phase",
      startWave: 4,
      provenance: "automatic",
    });
  });

  it("otherwise (row 8): a mid-plan lastGreenWave classifies resume, starting at lastGreenWave + 1", () => {
    const parsed = {
      state: { feature, planHash, lastGreenWave: 1, head: "abc123" },
      reason: null,
    };
    expect(classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true })).toEqual({
      outcome: "resume",
      startWave: 2,
      provenance: "automatic",
      lastGreenWave: 1,
    });
  });

  it("AT-03 (unit half), PROP-DISREGARD-06: a record failing BOTH ancestry and over-count classifies head-unreachable, never over-count — guard 5 precedes guard 6", () => {
    const parsed = {
      state: { feature, planHash, lastGreenWave: 9, head: "abc123" },
      reason: null,
    };
    const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: false });
    expect(d.code).toBe("head-unreachable");
  });

  it("PROP-SAFETY-04: every decision the classifier returns carries provenance \"automatic\" — \"operator-set\" never originates here", () => {
    const fixtures = [
      { state: null, reason: null },
      { state: null, reason: "it is not readable JSON" },
      { state: { feature: "other-feat", planHash, lastGreenWave: 1, head: null }, reason: null },
      { state: { feature, planHash: "00000000", lastGreenWave: 1, head: null }, reason: null },
      { state: { feature, planHash, lastGreenWave: 1, head: "abc123" }, reason: null },
      { state: { feature, planHash, lastGreenWave: 9, head: null }, reason: null },
      { state: { feature, planHash, lastGreenWave: 3, head: "abc123" }, reason: null },
    ];
    for (const parsed of fixtures) {
      const d = classifyWaveLedger({ parsed, feature, planHash, waveCount, headOk: true });
      expect(d.provenance).toBe("automatic");
      expect(RESUME_PROVENANCE).toContain(d.provenance);
      expect(RESUME_OUTCOMES).toContain(d.outcome);
    }
  });
});
