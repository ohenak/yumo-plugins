// ─── loopEconomicsDodRoundIndex.test.js ────────────────────────────────────
//
// PLAN T-05, "[red]" (pdlc-loop-economics, batch 2). TSPEC §5 (M1c — DoD
// round index from disk, FSPEC §3): the pure function `deriveDodRoundIndex`
// and its wiring into `dodVerifyLoop` via the injected `_listFiles` seam.
//
// Two named RED reasons are expected right now, and no other:
//   1. `deriveDodRoundIndex` is not yet exported from orchestrate-dev.js —
//      Node's real ESM loader (this package is `"type": "module"`) fails the
//      whole suite to load with a "does not provide an export named" error
//      until T-12 adds the export.
//   2. Once (1) is fixed, `dodVerifyLoop` still names the round after its own
//      loop counter (`iteration`) rather than a disk-derived version, so the
//      wiring tests below fail on captured-prompt content until T-12 threads
//      `_listFiles` and calls `deriveDodRoundIndex` inside `dodVerifyLoop`.
//
// This file becomes green, unchanged, once T-12 implements TSPEC §5 exactly
// (PLAN §Definition of Done: red-before-green, T-05 → T-12).
//
// PROP-LOOPECON-08 — round index is `max(existing) + 1`, derived fresh from
// disk on every dispatch, never from any in-memory counter.
// PROP-LOOPECON-09 — recomputation after resume is monotonic: no skip, no
// collision; two independent derivations over the same disk state agree.

import fc from "fast-check";

import { deriveDodRoundIndex, dodVerifyLoop } from "../orchestrate-dev.js";
import { makeListFilesFn } from "./helpers/loopEconomicsDoubles.js";

// `_git` is never part of `dodVerifyLoop`'s seam surface (it takes `feature`,
// `maxIterations`, `_agent`, `_log`, `_readFile`, and — once T-12 lands —
// `_listFiles`) so `assertNoLiveGitWrites` (TSPEC §10 / commit f325016) has
// nothing to guard here; every double below is purely in-memory.

const FEATURE = "loop-economics";

// ─── deriveDodRoundIndex — the pure function (TSPEC §5.1) ─────────────────

describe("deriveDodRoundIndex (TSPEC §5.1, PLAN T-05)", () => {
  test.each([
    ["empty listing ⇒ 1", [], 1],
    ["single v1 ⇒ 2", [`CODE_REVIEW-${FEATURE}-v1.md`], 2],
    [
      "gap v1+v3 ⇒ 4 (max, not count)",
      [`CODE_REVIEW-${FEATURE}-v1.md`, `CODE_REVIEW-${FEATURE}-v3.md`],
      4,
    ],
    [
      "v9 then v10 ⇒ 11, numeric not lexicographic",
      [`CODE_REVIEW-${FEATURE}-v9.md`, `CODE_REVIEW-${FEATURE}-v10.md`],
      11,
    ],
    [
      "v10 then v9 ⇒ 11, order in the listing does not matter",
      [`CODE_REVIEW-${FEATURE}-v10.md`, `CODE_REVIEW-${FEATURE}-v9.md`],
      11,
    ],
    [
      "other-feature noise ignored",
      [`CODE_REVIEW-${FEATURE}-v2.md`, "CODE_REVIEW-other-feature-v9.md"],
      3,
    ],
    [
      "draft sibling (non-matching suffix) ignored",
      [`CODE_REVIEW-${FEATURE}-v2.md`, `CODE_REVIEW-${FEATURE}-v3-draft.md`],
      3,
    ],
    [
      "non-numeric suffix ignored",
      [`CODE_REVIEW-${FEATURE}-vX.md`, `CODE_REVIEW-${FEATURE}-v1.md`],
      2,
    ],
    [
      "prefix-only collision (feature name is a substring of another) ignored",
      [`CODE_REVIEW-not-${FEATURE}-v9.md`, `CODE_REVIEW-${FEATURE}-v1.md`],
      2,
    ],
  ])("%s", (_label, basenames, expected) => {
    expect(deriveDodRoundIndex(basenames, FEATURE)).toBe(expected);
  });

  test("a non-array input contributes nothing — returns 1, never throws", () => {
    expect(deriveDodRoundIndex(null, FEATURE)).toBe(1);
    expect(deriveDodRoundIndex(undefined, FEATURE)).toBe(1);
    expect(deriveDodRoundIndex("not-an-array", FEATURE)).toBe(1);
    expect(deriveDodRoundIndex(42, FEATURE)).toBe(1);
  });

  test("feature is matched literally — regex metacharacters in it are escaped", () => {
    // "a.b+c" read as an unescaped regex would be: "a", then "." (any char),
    // then "b+" (one-or-more "b"), then literal "c" — which matches "axbc".
    // A correct literal match must NOT let that basename count.
    const feature = "a.b+c";
    const basenames = [
      `CODE_REVIEW-${feature}-v2.md`,
      "CODE_REVIEW-axbc-v9.md",
    ];
    expect(deriveDodRoundIndex(basenames, feature)).toBe(3);
  });

  // ─── PROP-LOOPECON-08 / PROP-LOOPECON-09 (fast-check) ────────────────────
  //
  // Generator domain per PROPERTIES-pdlc-loop-economics.md: arbitrary sets of
  // CODE_REVIEW-{feature}-v*.md filenames "on disk" — empty, contiguous,
  // gapped — plus non-matching siblings (drafts, other features) that must
  // not be counted.

  const featureArb = fc.constantFrom(FEATURE, "feat-alpha", "another-feature");
  const versionsArb = fc.uniqueArray(fc.integer({ min: 1, max: 30 }), {
    minLength: 0,
    maxLength: 8,
  });

  it("PROP-LOOPECON-08: next version is max(existing)+1, or 1 when none exist, over arbitrary disk listings with noise", () => {
    fc.assert(
      fc.property(featureArb, versionsArb, (feature, existingVersions) => {
        const matching = existingVersions.map(
          (v) => `CODE_REVIEW-${feature}-v${v}.md`
        );
        const noise = [
          `CODE_REVIEW-${feature}-v1-draft.md`,
          `CODE_REVIEW-other-${feature}-v999.md`,
          `CODE_REVIEW-not-${feature}-v999.md`,
        ];
        const basenames = [...matching, ...noise];
        const expected =
          existingVersions.length === 0 ? 1 : Math.max(...existingVersions) + 1;

        expect(deriveDodRoundIndex(basenames, feature)).toBe(expected);
      })
    );
  });

  it("PROP-LOOPECON-09: recomputation after resume is monotonic — two independent derivations over the same disk state agree, never a skip, never a collision", () => {
    fc.assert(
      fc.property(featureArb, versionsArb, (feature, existingVersions) => {
        const basenames = existingVersions.map(
          (v) => `CODE_REVIEW-${feature}-v${v}.md`
        );
        const max = existingVersions.length === 0 ? 0 : Math.max(...existingVersions);

        // Two independent derivations from the identical, unchanged disk
        // state — simulating the first dispatch and a resumed/re-run one.
        const first = deriveDodRoundIndex(basenames, feature);
        const resumed = deriveDodRoundIndex(basenames, feature);

        expect(resumed).toBe(first);
        expect(first).toBe(max + 1); // never max+2 (skip)
        expect(first).toBeGreaterThan(max); // never <= max (collision)
      })
    );
  });
});

// ─── dodVerifyLoop wiring (TSPEC §5.2) ─────────────────────────────────────

describe("dodVerifyLoop — disk-derived round index (TSPEC §5.2, PLAN T-05)", () => {
  const TARGET = "test-feat";

  function makeCapturingAgent() {
    const promptsBySkill = {};
    const agentFn = async (skill, prompt) => {
      (promptsBySkill[skill] ??= []).push(prompt);
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      return "Remediated.";
    };
    return { promptsBySkill, agentFn };
  }

  it("a _listFiles double reporting v1,v2 on disk makes the captured verify prompt name v3, not the loop's own iteration=1", async () => {
    const { listFilesFn, calls: listCalls } = makeListFilesFn({
      [`docs/${TARGET}`]: [
        `CODE_REVIEW-${TARGET}-v1.md`,
        `CODE_REVIEW-${TARGET}-v2.md`,
      ],
    });
    const { promptsBySkill, agentFn } = makeCapturingAgent();

    const result = await dodVerifyLoop({
      feature: TARGET,
      _agent: agentFn,
      _log: () => {},
      _listFiles: listFilesFn,
    });

    expect(result.passed).toBe(true);
    expect(result.iterations).toBe(1); // the loop's own counter — unchanged job: bounding maxIterations
    const verifyPrompt = promptsBySkill["dod-verify"][0];
    expect(verifyPrompt).toContain("v3");
    expect(verifyPrompt).not.toContain("review version v1");
    expect(listCalls).toContain(`docs/${TARGET}`);
  });

  it("a _listFiles double that throws falls back to the pre-M1c `iteration` value (fail-open, FSPEC §7.1)", async () => {
    const throwingListFiles = async () => {
      throw new Error("ENOENT: simulated disk failure");
    };
    const { promptsBySkill, agentFn } = makeCapturingAgent();

    const result = await dodVerifyLoop({
      feature: TARGET,
      _agent: agentFn,
      _log: () => {},
      _listFiles: throwingListFiles,
    });

    expect(result.passed).toBe(true);
    const verifyPrompt = promptsBySkill["dod-verify"][0];
    expect(verifyPrompt).toContain("review version v1");
  });

  it("DOD_MAX_ITERATIONS still bounds the loop, decoupled from the disk-derived version", async () => {
    const { listFilesFn, calls: listCalls } = makeListFilesFn({
      [`docs/${TARGET}`]: [
        `CODE_REVIEW-${TARGET}-v7.md`,
        `CODE_REVIEW-${TARGET}-v8.md`,
      ],
    });
    let verifyCalls = 0;
    const agentFn = async (skill) => {
      if (skill === "dod-verify") {
        verifyCalls++;
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      return "Remediated.";
    };

    const result = await dodVerifyLoop({
      feature: TARGET,
      maxIterations: 2,
      _agent: agentFn,
      _log: () => {},
      _listFiles: listFilesFn,
    });

    expect(result.passed).toBe(false);
    expect(result.iterations).toBe(2); // bound by maxIterations, not by the derived version (9)
    expect(verifyCalls).toBe(2);
  });

  it("derives the version fresh from disk on every round — never cached, never drifting with the loop's own iteration counter (PROP-LOOPECON-08)", async () => {
    const { listFilesFn, calls: listCalls } = makeListFilesFn({
      [`docs/${TARGET}`]: [`CODE_REVIEW-${TARGET}-v4.md`], // ⇒ next version is 5, every round
    });
    const { promptsBySkill, agentFn: baseAgent } = makeCapturingAgent();
    const agentFn = async (skill, prompt) => {
      if (skill === "dod-verify") {
        (promptsBySkill["dod-verify"] ??= []).push(prompt);
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      return baseAgent(skill, prompt);
    };

    await dodVerifyLoop({
      feature: TARGET,
      maxIterations: 3,
      _agent: agentFn,
      _log: () => {},
      _listFiles: listFilesFn,
    });

    const verifyPrompts = promptsBySkill["dod-verify"];
    expect(verifyPrompts).toHaveLength(3);
    for (const prompt of verifyPrompts) {
      expect(prompt).toContain("v5");
      expect(prompt).not.toContain("v1");
      expect(prompt).not.toContain("v2");
      expect(prompt).not.toContain("v3");
    }
    // Fresh from disk on every dispatch — one _listFiles call per round, not one total.
    expect(listCalls).toHaveLength(3);
  });
});
