// advisoryWaveGate.test.js -- PLAN A6-00 (batch 1, no deps).
//
// Pre-flight gate: asserts that the advisory-tier baseline shipped at HEAD
// still exports the seam surface later A6-* tasks build on. Existence only
// -- never shape. A red result here means the baseline drifted underneath
// this feature before a single line of new code was written; it must halt
// the pipeline immediately rather than surface as a confusing failure deep
// inside a later task.
//
// `pathsCollide` is deliberately NOT included in the export-existence table
// below: it is declared `function pathsCollide(a, b)` at
// `orchestrate-dev.js:4726` with no `export` keyword, and is referenced only
// internally (`orchestrate-dev.js:10961`). An import-based existence
// assertion against it would fail at HEAD -- not because the baseline is
// broken, but because the symbol was never meant to cross the module
// boundary. Its behaviour is proved transitively through A6-07's
// `ownedSetCovers` trailing-slash cases; A6-05 exports only `computeWaves`
// directly.

import * as devModule from "../orchestrate-dev.js";

describe("A6-00 pre-flight gate: advisory-tier baseline exports exist at HEAD", () => {
  test.each([
    ["runAdvisorySeam", devModule],
    ["classifyEnvelope", devModule],
    ["appendAdvisoryEntry", devModule],
    ["appendEscalationEntry", devModule],
    ["resolveAdvisoryRung", devModule],
    ["parseAdvisoryVerdict", devModule],
    ["renderAdvisoryEntry", devModule],
    ["computeWaves", devModule],
    ["parsePlanOwnership", devModule],
    ["commitPaths", devModule],
    ["gitWithLockRetry", devModule],
    ["checkWaveUnskips", devModule],
    ["effectiveGuardPaths", devModule],
  ])("%s is exported and importable from orchestrate-dev.js", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });
});

// ─── A6-08 (former A6-07): the pure helpers, TSPEC §3.3 / §3.4 ──────────────
//
// `waveOwnedPaths` / `laterOwnedPaths` read the `files` arrays `computeWaves`
// has already annotated onto every task; `ownedSetCovers` delegates to the
// module-private `pathsCollide`, carrying its trailing-slash precondition;
// `parseA6RootCause` is total over the closed `ADVISORY_ROOT_CAUSES`
// vocabulary; `citesGateOutput` is BR-3's decidable citation rule, floored at
// `A6_MIN_CITATION_CHARS` (24). All five are pure: no `process`, no clock, no
// ambient state.

const {
  waveOwnedPaths,
  laterOwnedPaths,
  ownedSetCovers,
  parseA6RootCause,
  citesGateOutput,
  A6_MIN_CITATION_CHARS,
  ADVISORY_ROOT_CAUSES,
} = devModule;

describe("A6-08: waveOwnedPaths — E-5, the union of task.files over the wave", () => {
  test("unions task.files across every task in the target wave", () => {
    const waves = [
      [{ id: "T1", files: ["a.js"] }, { id: "T2", files: ["b.js", "c.js"] }],
      [{ id: "T3", files: ["d.js"] }],
    ];
    expect(waveOwnedPaths(waves, 0).sort()).toEqual(["a.js", "b.js", "c.js"]);
  });

  test("never reads a later wave's files", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["d.js"] }]];
    expect(waveOwnedPaths(waves, 0)).not.toContain("d.js");
  });

  test("treats a null files array as owning nothing", () => {
    const waves = [[{ id: "T1", files: null }]];
    expect(waveOwnedPaths(waves, 0)).toEqual([]);
  });

  test("de-duplicates a path owned by two tasks in the same wave", () => {
    const waves = [[{ id: "T1", files: ["shared.js"] }, { id: "T2", files: ["shared.js"] }]];
    expect(waveOwnedPaths(waves, 0)).toEqual(["shared.js"]);
  });
});

describe("A6-08: laterOwnedPaths — E-6, the union of task.files over every later wave", () => {
  test("unions task.files across every wave strictly after waveIndex", () => {
    const waves = [
      [{ id: "T1", files: ["a.js"] }],
      [{ id: "T2", files: ["b.js"] }],
      [{ id: "T3", files: ["c.js"] }],
    ];
    expect(laterOwnedPaths(waves, 0).sort()).toEqual(["b.js", "c.js"]);
  });

  test("never reads the target wave's own files", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["b.js"] }]];
    expect(laterOwnedPaths(waves, 1)).not.toContain("a.js");
    expect(laterOwnedPaths(waves, 1)).toEqual([]);
  });

  test("is empty for the last wave — there is no later task to own a promotion", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["b.js"] }]];
    expect(laterOwnedPaths(waves, 1)).toEqual([]);
  });

  test("de-duplicates a path owned by two tasks in different later waves", () => {
    const waves = [
      [{ id: "T1", files: [] }],
      [{ id: "T2", files: ["shared.js"] }],
      [{ id: "T3", files: ["shared.js"] }],
    ];
    expect(laterOwnedPaths(waves, 0)).toEqual(["shared.js"]);
  });
});

describe("A6-08: ownedSetCovers — delegates to pathsCollide (§3.4, TE F-06)", () => {
  test("an exact-path row covers only that path", () => {
    expect(ownedSetCovers(["a/b.js"], "a/b.js")).toBe(true);
    expect(ownedSetCovers(["a/b.js"], "a/c.js")).toBe(false);
  });

  test("a trailing-slash directory row covers a file beneath it", () => {
    expect(ownedSetCovers(["pdlc/workflows/dist/"], "pdlc/workflows/dist/orchestrate-dev.bundle.js")).toBe(
      true,
    );
  });

  test("the same row WITHOUT a trailing slash refuses the same file — the operator-visible precondition", () => {
    expect(ownedSetCovers(["pdlc/workflows/dist"], "pdlc/workflows/dist/orchestrate-dev.bundle.js")).toBe(
      false,
    );
  });

  test("a directory row does not cover an unrelated sibling with a shared prefix", () => {
    expect(ownedSetCovers(["a/b/"], "a/bc.js")).toBe(false);
  });

  test("covers the path if ANY member of the owned set covers it", () => {
    expect(ownedSetCovers(["x/y.js", "a/b/"], "a/b/c.js")).toBe(true);
  });

  test("an empty owned set covers nothing", () => {
    expect(ownedSetCovers([], "a/b.js")).toBe(false);
  });
});

describe("A6-08: parseA6RootCause — total over the closed ADVISORY_ROOT_CAUSES vocabulary", () => {
  test("a well-formed trailer returns the named class", () => {
    expect(parseA6RootCause("ROOT-CAUSE: plan-ordering-defect")).toBe("plan-ordering-defect");
  });

  test.each(ADVISORY_ROOT_CAUSES)("recognises every member of ADVISORY_ROOT_CAUSES: %s", (cls) => {
    expect(parseA6RootCause(`ROOT-CAUSE: ${cls}`)).toBe(cls);
  });

  test("absent ROOT-CAUSE line ⇒ unclassified", () => {
    expect(parseA6RootCause("DIAGNOSIS: something failed")).toBe("unclassified");
  });

  test("empty string input ⇒ unclassified, never throws", () => {
    expect(parseA6RootCause("")).toBe("unclassified");
  });

  test("a trailer whose value is empty ⇒ unclassified", () => {
    expect(parseA6RootCause("ROOT-CAUSE:")).toBe("unclassified");
  });

  test("wrong-cased trailer ⇒ unclassified — membership is case-sensitive", () => {
    expect(parseA6RootCause("ROOT-CAUSE: Plan-Ordering-Defect")).toBe("unclassified");
  });

  test("out-of-set trailer ⇒ unclassified", () => {
    expect(parseA6RootCause("ROOT-CAUSE: agent-was-confused")).toBe("unclassified");
  });

  test("non-string input ⇒ unclassified, never throws", () => {
    expect(parseA6RootCause(null)).toBe("unclassified");
    expect(parseA6RootCause(undefined)).toBe("unclassified");
    expect(parseA6RootCause(42)).toBe("unclassified");
  });

  test("last-wins: a duplicated ROOT-CAUSE line resolves to the LAST occurrence", () => {
    const raw = "ROOT-CAUSE: environmental\nROOT-CAUSE: wave-internal-defect";
    expect(parseA6RootCause(raw)).toBe("wave-internal-defect");
  });

  test("surrounding whitespace on the value is trimmed", () => {
    expect(parseA6RootCause("ROOT-CAUSE:   environmental   ")).toBe("environmental");
  });
});

describe("A6-08: citesGateOutput — BR-3's decidable citation rule, floored at A6_MIN_CITATION_CHARS", () => {
  test("true when a normalised evidence entry is a substring of the normalised gate output", () => {
    const gateOutput = "some preamble\nTypeError: cannot read property 'x' of undefined\nmore log";
    expect(citesGateOutput(["TypeError: cannot read property 'x' of undefined"], gateOutput)).toBe(
      true,
    );
  });

  test("false when no evidence entry appears in the gate output", () => {
    expect(citesGateOutput(["nothing like this is present anywhere"], "totally unrelated output")).toBe(
      false,
    );
  });

  test("false for a short, guessable citation even if it is present verbatim", () => {
    const gateOutput = "Test run FAILED with 3 errors";
    expect(citesGateOutput(["FAILED"], gateOutput)).toBe(false);
  });

  test("the citation floor boundary: 23 normalised characters is refused, 24 is accepted (TE F-09)", () => {
    const twentyThree = "x".repeat(23);
    const twentyFour = "x".repeat(24);
    const gateOutput = `prefix ${twentyFour} suffix`;

    expect(citesGateOutput([twentyThree], gateOutput)).toBe(false);
    expect(citesGateOutput([twentyFour], gateOutput)).toBe(true);
  });

  test("runs of whitespace are collapsed and ends trimmed before comparison", () => {
    const gateOutput = "prefix this is a long citation string right here suffix";
    const evidence = ["  this   is  a   long\ncitation string right here  "];
    expect(citesGateOutput(evidence, gateOutput)).toBe(true);
  });

  test("true when ANY member of a multi-entry evidence array clears the floor and matches", () => {
    const gateOutput = "the real needle appears in this exact gate output stream";
    expect(citesGateOutput(["short", "the real needle appears in this exact gate output stream"], gateOutput)).toBe(
      true,
    );
  });

  test("an empty evidence array never cites anything", () => {
    expect(citesGateOutput([], "any gate output at all, arbitrarily long")).toBe(false);
  });

  test("A6_MIN_CITATION_CHARS is the pinned literal 24", () => {
    expect(A6_MIN_CITATION_CHARS).toBe(24);
  });
});
