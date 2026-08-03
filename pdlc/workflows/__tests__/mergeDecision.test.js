// ─── mergeDecision.test.js ──────────────────────────────────────────────────
//
// PLAN §12 A4 (pdlc-merge-phase): the pure suite for `decideMerge` and
// `mergeCandidates` (TSPEC §5). Covers PROP-M-01..M-05 (D_core, |D_core| =
// 419, PROPERTIES §2), PROP-M-11's pure half (`mergeCandidates`, enum(40)),
// and PROP-M-21 (the CI 5x2 matrix, enum(10)).
//
// Ownership (PLAN, single-writer-per-file): A4. Reuses A1's constants, A2's
// classifiers (shapes only — this suite builds classified records directly,
// it does not call the classifiers), A3's guard, and F1's shared doubles
// (`__tests__/helpers/mergeDoubles.js`) without re-declaring any of them.
//
// The step loop below (`driveDecision`) is harness code (SE F-06): it
// re-drives `decideMerge` per its `need`/`act` demands until it resolves,
// mirroring `phaseMerge`'s orchestrator loop (TSPEC §5.2) closely enough to
// exercise the demand-driven contract, but it is test-local — `phaseMerge`
// itself (A7) owns the real loop, its IO seams, and the try/catch that maps
// a thrown/exhausted loop to `row: "internal"` (TSPEC §12 E21).

import {
  decideMerge,
  mergeCandidates,
  MERGE_MAX_DECISION_STEPS,
  MERGE_MAX_RETRIES,
  MERGE_STATUSES,
  MERGE_DEFAULTS,
  MERGE_MODES,
} from "../orchestrate-dev.js";
import { seeded, resolveSeed, MERGE_PROP_SEED } from "./helpers/mergeDoubles.js";

const UNRECOGNISED_SENTINEL = "__unrecognised__";
const PR_URL = "https://github.com/o/r/pull/42";

// ─── ROW_IDS — test-local transcription of FSPEC §11's 25-row table ───────
//
// Deliberately NOT exported from source (PROPERTIES §1.1): a test that read
// this list from the implementation's own catalogue would never catch a
// mutation of a row id there. Self-checked below for length and shape.

const ROW_IDS = Object.freeze([
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "11a", "12", "13", "13a", "14", "15", "16", "17", "18",
  "19", "20", "21", "22", "23",
]);

describe("ROW_IDS self-check (FSPEC §11)", () => {
  it("has exactly 25 members", () => {
    expect(ROW_IDS.length).toBe(25);
  });
  it("contains no duplicates", () => {
    expect(new Set(ROW_IDS).size).toBe(25);
  });
  it("contains the two lettered rows", () => {
    expect(ROW_IDS).toContain("11a");
    expect(ROW_IDS).toContain("13a");
  });
});

// ─── Observation fixture builders ──────────────────────────────────────────

function o1(overrides = {}) {
  return {
    ok: true,
    state: "OPEN",
    mergeable: "MERGEABLE",
    mergeStateStatus: "CLEAN",
    number: 42,
    mergeCommitOid: null,
    ...overrides,
  };
}
function o1Fail(reason = "unparseable") {
  return { ok: false, reason };
}
function o3(unresolved = 0, overrides = {}) {
  return { ok: true, hasNextPage: false, endCursor: null, unresolved, ...overrides };
}
function o3Fail(reason = "command-failed") {
  return { ok: false, reason };
}
function o4(overrides = {}) {
  return {
    ok: true,
    rebase: true,
    mergeCommit: true,
    squash: false,
    deleteBranchOnMerge: true,
    defaultBranch: "main",
    ...overrides,
  };
}
function o4Fail(reason = "command-failed") {
  return { ok: false, reason };
}
function o5(files = ["src/example.js"]) {
  return { ok: true, files };
}
function o5Fail(reason = "command-failed") {
  return { ok: false, reason };
}

function baseConfig(overrides = {}) {
  return { ...MERGE_DEFAULTS, mergeMode: "gated", guardPaths: [], ...overrides };
}

// ─── The demand-driven harness (test-local; SE F-06) ───────────────────────

function driveDecision({ recordOverrides = {}, script = {}, attempts = [] }, config) {
  const record = {
    prUrl: PR_URL,
    o1: null,
    o1Count: 0,
    ci: null,
    o3: null,
    o4: null,
    o5: null,
    attempts: [],
    ...recordOverrides,
  };
  const demandSequence = [];
  let o1Calls = 0;

  for (let step = 0; step < MERGE_MAX_DECISION_STEPS; step += 1) {
    const d = decideMerge(record, config);
    if (d.kind === "resolved") {
      return { resolution: d, steps: step, demandSequence, record };
    }
    if (d.kind === "act") {
      demandSequence.push(`act:${d.method}`);
      const next = attempts[record.attempts.length];
      if (!next || next.method !== d.method) {
        throw new Error(`driveDecision: no scripted attempt for act(${d.method})`);
      }
      record.attempts = [...record.attempts, next];
      continue;
    }
    demandSequence.push(d.observation);
    if (d.observation === "O1") {
      const seq = Array.isArray(script.O1) ? script.O1 : [script.O1];
      record.o1 = seq[Math.min(o1Calls, seq.length - 1)];
      o1Calls += 1;
      record.o1Count += 1;
    } else if (d.observation === "O5") {
      record.o5 = script.O5;
    } else if (d.observation === "O2") {
      record.ci = script.O2;
    } else if (d.observation === "O3") {
      record.o3 = script.O3;
    } else if (d.observation === "O4") {
      record.o4 = script.O4;
    } else {
      throw new Error(`driveDecision: unknown observation "${d.observation}"`);
    }
  }
  throw new Error("driveDecision: decideMerge did not resolve within MERGE_MAX_DECISION_STEPS");
}

// ─── The D_core enumerator (PROPERTIES §2) ─────────────────────────────────
//
// Builds the reachability-pruned enumeration of decision-core cases: every
// axis is crossed only where a guard, at that point in the sequence, can
// actually distinguish on it. |D_core| is asserted to be exactly 419 below —
// the breakdown in comments mirrors PROPERTIES §2's derivation table so a
// future reader can check the arithmetic against the spec directly.

const CAPS_COMBOS = [
  { rebase: false, mergeCommit: false, squash: false },
  { rebase: true, mergeCommit: false, squash: false },
  { rebase: false, mergeCommit: true, squash: false },
  { rebase: false, mergeCommit: false, squash: true },
  { rebase: true, mergeCommit: true, squash: false },
  { rebase: true, mergeCommit: false, squash: true },
  { rebase: false, mergeCommit: true, squash: true },
  { rebase: true, mergeCommit: true, squash: true },
];

// candidates level: 36 leaves (16 squash-off + 20 squash-on), built directly
// from `mergeCandidates` itself so the enumerator and the production chain
// builder can never silently disagree on the chain for a given caps/config
// pair.
function buildCandidateLeaves() {
  const leaves = [];
  for (const allowSquashMerge of [false, true]) {
    for (const caps of CAPS_COMBOS) {
      const chain = mergeCandidates(caps, { allowSquashMerge });
      if (chain.length === 0) {
        leaves.push({
          id: `candidates/empty/allowSquash=${allowSquashMerge}/${JSON.stringify(caps)}`,
          allowSquashMerge,
          caps,
          attempts: [],
          expectedRow: "16",
          expectedStatus: "deferred",
        });
        continue;
      }
      // L successes (one per chain position) + 1 all-fail.
      for (let successAt = 0; successAt < chain.length; successAt += 1) {
        const attempts = chain.slice(0, successAt).map((m) => ({
          method: m,
          ok: false,
          detail: `${m} attempt failed`,
        }));
        attempts.push({ method: chain[successAt], ok: true, detail: "", oid: `sha-${chain[successAt]}` });
        leaves.push({
          id: `candidates/success@${successAt}/allowSquash=${allowSquashMerge}/${chain.join(",")}`,
          allowSquashMerge,
          caps,
          attempts,
          expectedRow: "18",
          expectedStatus: "merged",
          expectedMergeMethod: chain[successAt],
          expectedMergeSha: `sha-${chain[successAt]}`,
        });
      }
      leaves.push({
        id: `candidates/all-fail/allowSquash=${allowSquashMerge}/${chain.join(",")}`,
        allowSquashMerge,
        caps,
        attempts: chain.map((m) => ({ method: m, ok: false, detail: `${m} attempt failed` })),
        expectedRow: "17",
        expectedStatus: "deferred",
      });
    }
  }
  return leaves;
}

const CANDIDATE_LEAVES = buildCandidateLeaves();

function candidateCaseDefs() {
  return CANDIDATE_LEAVES.map((leaf) => ({
    id: leaf.id,
    configOverrides: { allowSquashMerge: leaf.allowSquashMerge },
    script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4({ ...leaf.caps }) },
    attempts: leaf.attempts,
    expected: {
      row: leaf.expectedRow,
      mergeStatus: leaf.expectedStatus,
      mergeMethod: leaf.expectedMergeMethod ?? null,
      mergeSha: leaf.expectedMergeSha ?? null,
    },
  }));
}

// 7e onward (37): o4-not-ok (1) + candidates (36).
function build7eOnward() {
  const defs = [
    {
      id: "o4-not-ok",
      script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4Fail() },
      attempts: [],
      expected: { row: "15", mergeStatus: "refused" },
    },
    ...candidateCaseDefs(),
  ];
  return defs;
}

// 7d onward (39): o3-not-ok (1) + unresolved (1) + 7e onward (37).
function build7dOnward() {
  return [
    {
      id: "o3-not-ok",
      script: { O1: o1(), O5: o5(), O2: "passed", O3: o3Fail() },
      attempts: [],
      expected: { row: "13a", mergeStatus: "refused" },
    },
    {
      id: "unresolved-threads",
      script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(2) },
      attempts: [],
      expected: { row: "14", mergeStatus: "deferred" },
    },
    ...build7eOnward(),
  ];
}

// The "65" subtree, reached once per CI-passing combo: sentinel (1) + retry
// x2 (22) + conflict-ish (3) + 7d onward (39) = 65.
function build65() {
  const defs = [];

  // sentinel field (11a), 1 case — a first read whose mergeable is already
  // unrecognised, no retry consumed.
  defs.push({
    id: "sentinel-first-read",
    script: { O1: o1({ mergeable: UNRECOGNISED_SENTINEL }), O5: o5(), O2: "passed" },
    attempts: [],
    expected: { row: "11a", mergeStatus: "refused" },
  });

  // mergeableRetries in 0..10 x terminal re-read {UNKNOWN -> 13, not-ok -> 11a}: 22 cases.
  for (let retries = 0; retries <= MERGE_MAX_RETRIES; retries += 1) {
    defs.push({
      id: `retry-exhausted-unknown/retries=${retries}`,
      configOverrides: { mergeableRetries: retries },
      script: {
        O1: Array.from({ length: retries + 1 }, () => o1({ mergeable: "UNKNOWN" })),
        O5: o5(),
        O2: "passed",
      },
      attempts: [],
      expected: { row: "13", mergeStatus: "deferred" },
    });
    defs.push({
      id: `retry-then-sentinel/retries=${retries}`,
      configOverrides: { mergeableRetries: retries },
      script: {
        O1: [
          ...Array.from({ length: retries }, () => o1({ mergeable: "UNKNOWN" })),
          o1({ mergeable: UNRECOGNISED_SENTINEL }),
        ],
        O5: o5(),
        O2: "passed",
      },
      attempts: [],
      expected: { row: "11a", mergeStatus: "refused" },
    });
  }

  // CONFLICTING / DIRTY / BLOCKED: 3 cases.
  defs.push({
    id: "conflicting",
    script: { O1: o1({ mergeable: "CONFLICTING" }), O5: o5(), O2: "passed" },
    attempts: [],
    expected: { row: "12", mergeStatus: "deferred" },
  });
  defs.push({
    id: "dirty",
    script: { O1: o1({ mergeStateStatus: "DIRTY" }), O5: o5(), O2: "passed" },
    attempts: [],
    expected: { row: "12", mergeStatus: "deferred" },
  });
  defs.push({
    id: "blocked",
    script: { O1: o1({ mergeStateStatus: "BLOCKED" }), O5: o5(), O2: "passed" },
    attempts: [],
    expected: { row: "12", mergeStatus: "deferred" },
  });

  defs.push(...build7dOnward());
  return defs;
}

// The CI-passing combos that lead into the "65" subtree: (passed,true),
// (passed,false), (none,false) — 3 combos x 65 = 195.
const CI_PASSING_COMBOS = [
  { ci: "passed", mergeRequiresCi: true },
  { ci: "passed", mergeRequiresCi: false },
  { ci: "none", mergeRequiresCi: false },
];

// The CI combos that refuse regardless of the sub-tree beneath them: 7 cases.
const CI_REFUSING_COMBOS = [
  { ci: "none", mergeRequiresCi: true, row: "9" },
  { ci: "pending", mergeRequiresCi: true, row: "10" },
  { ci: "pending", mergeRequiresCi: false, row: "10" },
  { ci: "failed", mergeRequiresCi: true, row: "10" },
  { ci: "failed", mergeRequiresCi: false, row: "10" },
  { ci: "unknown", mergeRequiresCi: true, row: "11" },
  { ci: "unknown", mergeRequiresCi: false, row: "11" },
];

// All 10 (ci, mergeRequiresCi) combos, for PROP-M-21's dedicated matrix.
const CI_ALL_COMBOS = [
  ...CI_PASSING_COMBOS.map((c) => ({ ...c, pass: true })),
  ...CI_REFUSING_COMBOS.map((c) => ({ ...c, pass: false })),
];

// The 209-case subtree (mode-independent; mode is applied at instantiation).
function buildSubtree() {
  const defs = [];

  defs.push({
    id: "no-pr-url",
    recordOverrides: { prUrl: null },
    script: {},
    attempts: [],
    expected: { row: "6", mergeStatus: "deferred" },
  });

  defs.push({
    id: "o1-not-ok",
    script: { O1: o1Fail() },
    attempts: [],
    expected: { row: "8", mergeStatus: "refused" },
  });

  defs.push({
    id: "merged-o4-ok",
    script: { O1: o1({ state: "MERGED", mergeCommitOid: "sha-merged-1" }), O4: o4({ defaultBranch: "main" }) },
    attempts: [],
    expected: { row: "3", mergeStatus: "merged", mergeSha: "sha-merged-1", mergeMethod: "unknown", defaultBranch: "main" },
  });
  defs.push({
    id: "merged-o4-not-ok",
    script: { O1: o1({ state: "MERGED", mergeCommitOid: "sha-merged-2" }), O4: o4Fail() },
    attempts: [],
    expected: { row: "3", mergeStatus: "merged", mergeSha: "sha-merged-2", mergeMethod: "unknown", defaultBranch: null },
  });

  defs.push({
    id: "guard-match",
    script: { O1: o1(), O5: o5(["pdlc/workflows/orchestrate-dev.js"]) },
    attempts: [],
    expected: { row: "4", mergeStatus: "refused", escalations: 1 },
  });
  defs.push({
    id: "guard-unretrievable",
    script: { O1: o1(), O5: o5Fail() },
    attempts: [],
    expected: { row: "5", mergeStatus: "refused", escalations: 1 },
  });

  defs.push({
    id: "closed",
    script: { O1: o1({ state: "CLOSED" }), O5: o5() },
    attempts: [],
    expected: { row: "7", mergeStatus: "deferred" },
  });

  for (const combo of CI_REFUSING_COMBOS) {
    defs.push({
      id: `ci-refuse/${combo.ci}/requires=${combo.mergeRequiresCi}`,
      configOverrides: { mergeRequiresCi: combo.mergeRequiresCi },
      script: { O1: o1(), O5: o5(), O2: combo.ci },
      attempts: [],
      expected: {
        row: combo.row,
        mergeStatus: "refused",
        escalations: combo.ci === "none" && combo.mergeRequiresCi ? 1 : 0,
      },
    });
  }

  for (const combo of CI_PASSING_COMBOS) {
    const sub65 = build65();
    for (const leaf of sub65) {
      defs.push({
        ...leaf,
        id: `ci-pass/${combo.ci}/requires=${combo.mergeRequiresCi}/${leaf.id}`,
        configOverrides: { ...(leaf.configOverrides ?? {}), mergeRequiresCi: combo.mergeRequiresCi },
        script: { ...leaf.script, O2: combo.ci },
      });
    }
  }

  return defs;
}

const SUBTREE_DEFS = buildSubtree();

function instantiate(def, mode) {
  return {
    ...def,
    id: `${mode}/${def.id}`,
    config: baseConfig({ mergeMode: mode, ...(def.configOverrides ?? {}) }),
  };
}

function buildDCore() {
  const cases = [];
  cases.push({
    id: "mode-off",
    recordOverrides: {},
    script: {},
    attempts: [],
    expected: { row: "2", mergeStatus: "skipped" },
    config: baseConfig({ mergeMode: "off" }),
  });
  for (const mode of ["gated", "on"]) {
    for (const def of SUBTREE_DEFS) {
      cases.push(instantiate(def, mode));
    }
  }
  return cases;
}

const D_CORE = buildDCore();

describe("D_core enumeration (PROPERTIES §2)", () => {
  it("has exactly 419 cases", () => {
    expect(D_CORE.length).toBe(419);
  });

  it("has exactly 209 cases in the mode-independent subtree", () => {
    expect(SUBTREE_DEFS.length).toBe(209);
  });

  it("has exactly 36 candidate-block leaves (16 squash-off + 20 squash-on)", () => {
    expect(CANDIDATE_LEAVES.length).toBe(36);
    expect(CANDIDATE_LEAVES.filter((l) => !l.allowSquashMerge).length).toBe(16);
    expect(CANDIDATE_LEAVES.filter((l) => l.allowSquashMerge).length).toBe(20);
  });

  it("has exactly 120 row-18 (merged) leaves across the full D_core (20 x 3 CI-passing combos x 2 modes)", () => {
    const row18 = D_CORE.filter((c) => c.expected.row === "18");
    expect(row18.length).toBe(120);
  });
});

// ─── PROP-M-01 — totality & termination over D_core ────────────────────────

describe("PROP-M-01 — decideMerge resolves every D_core case within the step bound", () => {
  const seed = resolveSeed(MERGE_PROP_SEED);
  const rng = seeded(seed);
  // Order-independence check: iterate D_core in a seeded shuffle, not
  // declaration order, so no property here can be an artifact of ordering.
  const shuffled = [...D_CORE];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = rng.int(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  it(`resolves all ${D_CORE.length} cases (seed ${seed})`, () => {
    for (const c of shuffled) {
      let outcome;
      try {
        outcome = driveDecision(c, c.config);
      } catch (err) {
        throw new Error(`case "${c.id}" (seed ${seed}): ${err.message}`);
      }
      expect(outcome.resolution.kind).toBe("resolved");
      expect(ROW_IDS).toContain(outcome.resolution.row);
      expect(MERGE_STATUSES).toContain(outcome.resolution.mergeStatus);
      expect(outcome.steps).toBeLessThan(MERGE_MAX_DECISION_STEPS);
      expect(outcome.resolution.row).toBe(c.expected.row);
      expect(outcome.resolution.mergeStatus).toBe(c.expected.mergeStatus);
      if (c.expected.mergeSha !== undefined) {
        expect(outcome.resolution.mergeSha).toBe(c.expected.mergeSha);
      }
      if (c.expected.mergeMethod !== undefined) {
        expect(outcome.resolution.mergeMethod).toBe(c.expected.mergeMethod);
      }
      if (c.expected.defaultBranch !== undefined) {
        expect(outcome.resolution.defaultBranch).toBe(c.expected.defaultBranch);
      }
      if (c.expected.escalations !== undefined) {
        expect(outcome.resolution.escalations.length).toBe(c.expected.escalations);
      }
    }
  });
});

// ─── PROP-M-02 — purity: same call, twice, deep-equal, no mutation ─────────

describe("PROP-M-02 — decideMerge is pure (838 = 419 x 2 calls)", () => {
  it("returns a deep-equal result on a repeated call, and mutates neither record nor config", () => {
    for (const c of D_CORE) {
      const { record } = driveDecision(c, c.config);
      const recordSnapshot = JSON.parse(JSON.stringify(record));
      const configSnapshot = JSON.parse(JSON.stringify(c.config));

      const first = decideMerge(record, c.config);
      const second = decideMerge(record, c.config);

      expect(second).toEqual(first);
      expect(record).toEqual(recordSnapshot);
      expect(c.config).toEqual(configSnapshot);
    }
  });
});

// ─── PROP-M-03 — fail-closed monotonicity on the 120 row-18 cases ──────────

describe("PROP-M-03 — degrading a precondition from a merged case fails to the assigned row (602 = 120 x 5 + 2)", () => {
  const row18Cases = D_CORE.filter((c) => c.expected.row === "18");

  it("has exactly 120 row-18 cases to degrade", () => {
    expect(row18Cases.length).toBe(120);
  });

  const degradations = [
    { name: "o1", row: "8", apply: (record) => ({ ...record, o1: o1Fail() }) },
    { name: "ci", row: "11", apply: (record) => ({ ...record, ci: "unknown" }) },
    { name: "o3", row: "13a", apply: (record) => ({ ...record, o3: o3Fail() }) },
    { name: "o5", row: "5", apply: (record) => ({ ...record, o5: o5Fail() }) },
    { name: "o4", row: "15", apply: (record) => ({ ...record, o4: o4Fail() }) },
  ];

  it("degrades each of the 5 preconditions on every row-18 case to its assigned fail-closed row (600 assertions)", () => {
    for (const c of row18Cases) {
      const { record } = driveDecision(c, c.config);
      for (const deg of degradations) {
        const degraded = deg.apply(record);
        const result = decideMerge(degraded, c.config);
        expect(result.kind).toBe("resolved");
        expect(result.row).toBe(deg.row);
        expect(result.mergeStatus).not.toBe("merged");
      }
    }
  });

  // The one declared exception (§5.5): on the already-merged path (row 3),
  // O4 is an OBSERVATION, not a precondition — degrading it keeps the
  // resolution merged, asserted here as the positive pair rather than
  // filtered out of the property's domain.
  it("does NOT refuse the already-merged (row 3) case when O4 is degraded — the declared exception", () => {
    const mergedDef = instantiate(
      SUBTREE_DEFS.find((d) => d.id === "merged-o4-ok"),
      "gated",
    );
    const { record } = driveDecision(mergedDef, mergedDef.config);

    const withO4Ok = decideMerge(record, mergedDef.config);
    expect(withO4Ok.row).toBe("3");
    expect(withO4Ok.mergeStatus).toBe("merged");

    const degraded = { ...record, o4: o4Fail() };
    const withO4Degraded = decideMerge(degraded, mergedDef.config);
    expect(withO4Degraded.row).toBe("3");
    expect(withO4Degraded.mergeStatus).toBe("merged");
    expect(withO4Degraded.defaultBranch).toBeNull();
  });
});

// ─── PROP-M-04 — no-bypass equivalence: gated === on ───────────────────────

describe("PROP-M-04 — mergeMode gated and on decide the same 209-case subtree identically", () => {
  it("produces deep-equal resolutions under both modes for every subtree case", () => {
    for (const def of SUBTREE_DEFS) {
      const gated = instantiate(def, "gated");
      const on = instantiate(def, "on");
      const gatedOutcome = driveDecision(gated, gated.config);
      const onOutcome = driveDecision(on, on.config);
      expect(onOutcome.resolution).toEqual(gatedOutcome.resolution);
    }
  });
});

// ─── PROP-M-05 — short-circuit minimality / demand-prefix ──────────────────

const CANONICAL_DEMAND_ORDER = ["O1", "O5", "O2", "O1", "O3", "O4"];

function isPrefixOfCanonicalOrder(demandSequence) {
  // Strip "act:*" entries — those are not observations, and the property is
  // only about the observation-demand prefix.
  const observations = demandSequence.filter((d) => !d.startsWith("act:"));
  if (observations.length === 0) return true;
  // Collapse a run of repeated "O1" (the mergeable retry loop) to a single
  // slot before comparing against the canonical order's single "O1*" slot,
  // EXCEPT the leading O1 which occupies its own, earlier slot.
  const collapsed = [];
  for (const o of observations) {
    if (o === collapsed[collapsed.length - 1] && o === "O1" && collapsed.length > 1) continue;
    collapsed.push(o);
  }
  // Every element of `collapsed` must appear, in order, within
  // CANONICAL_DEMAND_ORDER (allowing "O1" to occupy either its first-slot or
  // its retry-slot position).
  let cursor = 0;
  for (const o of collapsed) {
    const idx = CANONICAL_DEMAND_ORDER.indexOf(o, cursor);
    if (idx === -1) return false;
    cursor = idx + 1;
  }
  return true;
}

describe("PROP-M-05 — short-circuit minimality: demand sequences are prefixes of the canonical order", () => {
  it("never demands a later-slot observation the resolving guard did not need (main flow)", () => {
    for (const c of D_CORE) {
      if (c.id.includes("merged-o4")) continue; // §5.5's declared exception, checked separately below
      const { demandSequence } = driveDecision(c, c.config);
      expect(isPrefixOfCanonicalOrder(demandSequence)).toBe(true);
    }
  });

  it("a row-8 case (O1 whole-observation failure) demands O1 and nothing else", () => {
    const def = instantiate(SUBTREE_DEFS.find((d) => d.id === "o1-not-ok"), "gated");
    const { demandSequence } = driveDecision(def, def.config);
    expect(demandSequence).toEqual(["O1"]);
  });

  it("a row-7 case (CLOSED) never demands O2, O3 or O4", () => {
    const def = instantiate(SUBTREE_DEFS.find((d) => d.id === "closed"), "gated");
    const { demandSequence } = driveDecision(def, def.config);
    expect(demandSequence).not.toContain("O2");
    expect(demandSequence).not.toContain("O3");
    expect(demandSequence).not.toContain("O4");
  });

  it("the already-merged (row 3) case demands O1 then O4 — the declared exception to the canonical order", () => {
    const def = instantiate(SUBTREE_DEFS.find((d) => d.id === "merged-o4-ok"), "gated");
    const { demandSequence } = driveDecision(def, def.config);
    expect(demandSequence).toEqual(["O1", "O4"]);
  });
});

// ─── PROP-M-11 (pure half) — mergeCandidates squash unreachability ─────────

describe("PROP-M-11 (pure half) — mergeCandidates never includes squash unless allowSquashMerge === true (enum(40))", () => {
  const NON_TRUE_ALLOW_SQUASH = [undefined, false, null, "true", 1];

  it("excludes squash from the chain for all 8 caps x 5 non-strict-true allowSquashMerge shapes", () => {
    for (const allowSquashMerge of NON_TRUE_ALLOW_SQUASH) {
      for (const caps of CAPS_COMBOS) {
        const chain = mergeCandidates(caps, { allowSquashMerge });
        expect(chain).not.toContain("squash");
        if (caps.rebase) expect(chain).toContain("rebase");
        if (caps.mergeCommit) expect(chain).toContain("merge");
      }
    }
  });

  it("includes squash last when allowSquashMerge === true (strict) and caps.squash is true", () => {
    const chain = mergeCandidates({ rebase: true, mergeCommit: true, squash: true }, { allowSquashMerge: true });
    expect(chain).toEqual(["rebase", "merge", "squash"]);
  });

  it("never appends squash when caps.squash is false, even with allowSquashMerge === true", () => {
    const chain = mergeCandidates({ rebase: true, mergeCommit: true, squash: false }, { allowSquashMerge: true });
    expect(chain).not.toContain("squash");
  });
});

// ─── PROP-M-21 — the CI 5x2 rule matrix (enum(10)) ─────────────────────────

describe("PROP-M-21 — CI evidence rule matrix: 5 CI values x 2 mergeRequiresCi settings", () => {
  it("has exactly 10 combinations", () => {
    expect(CI_ALL_COMBOS.length).toBe(10);
  });

  it("matches FSPEC §5's table for every combination", () => {
    for (const combo of CI_ALL_COMBOS) {
      const def = {
        script: { O1: o1(), O5: o5(), O2: combo.ci, O3: o3(0), O4: o4() },
        configOverrides: { mergeRequiresCi: combo.mergeRequiresCi },
        attempts: [{ method: "rebase", ok: true, detail: "", oid: "sha-rebase" }],
      };
      const instantiated = instantiate(def, "gated");
      const { resolution } = driveDecision(instantiated, instantiated.config);
      if (combo.pass) {
        expect(resolution.row).not.toBe(combo.row);
        expect(["16", "17", "18"]).toContain(resolution.row);
      } else {
        expect(resolution.row).toBe(combo.row);
        expect(resolution.mergeStatus).toBe("refused");
      }
    }
  });

  it("only ('none', true) escalates; every other refused cell carries no escalation", () => {
    for (const combo of CI_REFUSING_COMBOS) {
      const def = instantiate(
        {
          script: { O1: o1(), O5: o5(), O2: combo.ci },
          configOverrides: { mergeRequiresCi: combo.mergeRequiresCi },
          attempts: [],
        },
        "gated",
      );
      const { resolution } = driveDecision(def, def.config);
      const expectedEscalations = combo.ci === "none" && combo.mergeRequiresCi ? 1 : 0;
      expect(resolution.escalations.length).toBe(expectedEscalations);
    }
  });

  it("mergeRequiresCi relaxes exactly the 'none' cell — every other CI value's outcome is unaffected by the flag", () => {
    for (const ci of ["passed", "pending", "failed", "unknown"]) {
      const attempts = [{ method: "rebase", ok: true, detail: "", oid: "sha-rebase" }];
      const withTrue = instantiate(
        { script: { O1: o1(), O5: o5(), O2: ci, O3: o3(0), O4: o4() }, configOverrides: { mergeRequiresCi: true }, attempts },
        "gated",
      );
      const withFalse = instantiate(
        { script: { O1: o1(), O5: o5(), O2: ci, O3: o3(0), O4: o4() }, configOverrides: { mergeRequiresCi: false }, attempts },
        "gated",
      );
      const outcomeTrue = driveDecision(withTrue, withTrue.config);
      const outcomeFalse = driveDecision(withFalse, withFalse.config);
      expect(outcomeTrue.resolution.row).toBe(outcomeFalse.resolution.row);
    }
  });
});

// ─── Guard-sequence properties: one case per guard, asserting its §11 row ──

describe("guard-sequence properties — one representative case per guard, per its §11 row id", () => {
  const guardCases = [
    ["guard 1 (mergeMode off)", { config: baseConfig({ mergeMode: "off" }), def: { script: {}, attempts: [] } }, "2"],
    ["guard 2 (no prUrl)", { config: baseConfig(), def: { recordOverrides: { prUrl: null }, script: {}, attempts: [] } }, "6"],
    ["guard 4 (O1 not ok)", { config: baseConfig(), def: { script: { O1: o1Fail() }, attempts: [] } }, "8"],
    ["guard 5 (MERGED)", { config: baseConfig(), def: { script: { O1: o1({ state: "MERGED", mergeCommitOid: "s" }), O4: o4() }, attempts: [] } }, "3"],
    ["guard 7 (guard match)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(["pdlc/workflows/x.js"]) }, attempts: [] } }, "4"],
    ["guard 8 (guard unretrievable)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5Fail() }, attempts: [] } }, "5"],
    ["guard 9 (CLOSED)", { config: baseConfig(), def: { script: { O1: o1({ state: "CLOSED" }), O5: o5() }, attempts: [] } }, "7"],
    ["guard 11 (CI none+required)", { config: baseConfig({ mergeRequiresCi: true }), def: { script: { O1: o1(), O5: o5(), O2: "none" }, attempts: [] } }, "9"],
    ["guard 11 (CI pending)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "pending" }, attempts: [] } }, "10"],
    ["guard 11 (CI unknown)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "unknown" }, attempts: [] } }, "11"],
    ["guard 12 (sentinel)", { config: baseConfig(), def: { script: { O1: o1({ mergeable: UNRECOGNISED_SENTINEL }), O5: o5(), O2: "passed" }, attempts: [] } }, "11a"],
    ["guard 14 (UNKNOWN exhausted)", { config: baseConfig({ mergeableRetries: 0 }), def: { script: { O1: [o1({ mergeable: "UNKNOWN" })], O5: o5(), O2: "passed" }, attempts: [] } }, "13"],
    ["guard 15 (CONFLICTING)", { config: baseConfig(), def: { script: { O1: o1({ mergeable: "CONFLICTING" }), O5: o5(), O2: "passed" }, attempts: [] } }, "12"],
    ["guard 17 (O3 not ok)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "passed", O3: o3Fail() }, attempts: [] } }, "13a"],
    ["guard 18 (unresolved threads)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(1) }, attempts: [] } }, "14"],
    ["guard 20 (O4 not ok)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4Fail() }, attempts: [] } }, "15"],
    ["guard 21 (no candidates)", { config: baseConfig(), def: { script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4({ rebase: false, mergeCommit: false, squash: false }) }, attempts: [] } }, "16"],
    [
      "guards 22-23 (first candidate succeeds)",
      {
        config: baseConfig(),
        def: {
          script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4({ rebase: true, mergeCommit: false, squash: false }) },
          attempts: [{ method: "rebase", ok: true, detail: "", oid: "sha-rebase" }],
        },
      },
      "18",
    ],
    [
      "guard 24 (all candidates fail)",
      {
        config: baseConfig(),
        def: {
          script: { O1: o1(), O5: o5(), O2: "passed", O3: o3(0), O4: o4({ rebase: true, mergeCommit: false, squash: false }) },
          attempts: [{ method: "rebase", ok: false, detail: "conflict" }],
        },
      },
      "17",
    ],
  ];

  it.each(guardCases)("%s resolves to §11 row %s", (_label, fixture, expectedRow) => {
    const { resolution } = driveDecision(fixture.def, fixture.config);
    expect(resolution.row).toBe(expectedRow);
    expect(ROW_IDS).toContain(resolution.row);
  });
});

// ─── Both §2.3 tie-break pairs ──────────────────────────────────────────────

describe("§2.3 tie-breaks", () => {
  it("CI pending precedes mergeable CONFLICTING: refused (row 10), not deferred", () => {
    const def = { script: { O1: o1({ mergeable: "CONFLICTING" }), O5: o5(), O2: "pending" }, attempts: [] };
    const config = baseConfig();
    const { resolution } = driveDecision(def, config);
    expect(resolution.row).toBe("10");
    expect(resolution.mergeStatus).toBe("refused");
  });

  it("PR CLOSED precedes the CI rule: deferred (row 7), not refused for CI failed", () => {
    const def = { script: { O1: o1({ state: "CLOSED" }), O5: o5(), O2: "failed" }, attempts: [] };
    const config = baseConfig();
    const { resolution } = driveDecision(def, config);
    expect(resolution.row).toBe("7");
    expect(resolution.mergeStatus).toBe("deferred");
  });
});

// ─── Termination bound — a relation, never the literal 24 (TE N-04) ────────

describe("termination bound", () => {
  it("MERGE_MAX_DECISION_STEPS strictly exceeds 1 + MERGE_MAX_RETRIES + 4 + 3 + 1 (O1 count, the 4 non-retry observations, the up-to-3-candidate act steps, and the final resolving step)", () => {
    expect(MERGE_MAX_DECISION_STEPS).toBeGreaterThan(1 + MERGE_MAX_RETRIES + 4 + 3 + 1);
  });

  it("no D_core case ever reaches the bound", () => {
    for (const c of D_CORE) {
      const { steps } = driveDecision(c, c.config);
      expect(steps).toBeLessThan(MERGE_MAX_DECISION_STEPS);
    }
  });
});

// ─── E21 — the harness's own defensive throw (TSPEC §12) ───────────────────
//
// decideMerge itself never fails to resolve within the bound for any real
// record/config (proven above, exhaustively, over D_core). This models what
// happens to `phaseMerge`'s loop (A7) when something upstream misbehaves
// badly enough that the loop truly never terminates: the loop's own
// defensive throw fires, and it is THAT throw — caught by phaseMerge's outer
// try/catch — that produces `row: "internal"` (TSPEC §12 E21). Both halves
// are exercised here since phaseMerge itself is not yet landed.

describe("E21 — a non-terminating decision loop throws, and the catch maps it to row internal", () => {
  it("driveDecision throws when the demand loop never resolves", () => {
    // A misbehaving stand-in for decideMerge that always demands the same
    // observation forever — models a defect this suite's own D_core proof
    // rules out for the real decideMerge, but which phaseMerge's loop must
    // still defend against.
    const record = { prUrl: PR_URL, o1: null, o1Count: 0, ci: null, o3: null, o4: null, o5: null, attempts: [] };
    const alwaysNeedsO1 = () => ({ kind: "need", observation: "O1" });
    const buggyDrive = () => {
      for (let step = 0; step < MERGE_MAX_DECISION_STEPS; step += 1) {
        const d = alwaysNeedsO1(record);
        if (d.kind === "resolved") return d;
        // Deliberately never fills record.o1 — simulates a script that
        // cannot answer the demand, the case phaseMerge's real loop guards
        // against with the same bound.
      }
      throw new Error("driveDecision: decideMerge did not resolve within MERGE_MAX_DECISION_STEPS");
    };

    let caught = null;
    try {
      buggyDrive();
    } catch (err) {
      caught = err;
    }
    expect(caught).not.toBeNull();

    // The mapping phaseMerge's outer catch performs (TSPEC §12 E21).
    const mapped = { kind: "resolved", row: "internal", mergeStatus: "refused", reason: caught.message };
    expect(mapped.row).toBe("internal");
    expect(mapped.mergeStatus).toBe("refused");
    // "internal" is deliberately outside ROW_IDS — it is not one of FSPEC
    // §11's 25 observable-outcome rows, only the catch-all for E21.
    expect(ROW_IDS).not.toContain("internal");
  });
});
