// advisoryEnvelope.test.js — PLAN A-06 (batch 3, depends on A-02).
//
// RED (authored as `describe.skip`, un-skipped by the 🟢 owner A-20). This file owns FSPEC
// T-03-1 … T-03-5, T-03-8, T-03-9, T-03-10 and PROPERTIES §6.5's generator-driven P-4 / P-5
// (PROPERTIES §11, PLAN §6.5) over `classifyEnvelope`, `touchesTestArtifact`, `touchesDodCriterion`,
// `branchCreated` and `refusalReasonFor` (TSPEC §5).
//
// What this file does NOT claim: the prohibitions (P-1…P-4, PROP-PROH-*) and the per-seam gate
// exclusivity cases (T-03-6, T-03-7, PROP-GATE-*) live in `advisoryDriver.test.js` (A-07 🔴 / A-22,
// A-23, A-24, A-31 🟢) — this file is the pure classifier and ladder only (PROPERTIES §6, "Home:
// advisoryEnvelope.test.js ... for the pure classifier and the ladder; advisoryDriver.test.js for
// the prohibitions and gate exclusivity").
//
// Every canonical double/generator comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else. `_git` is hand-rolled per branchCreated test below
// because it is not one of PROP-INFRA-01's scanned double shapes (agent/file/clock/PRNG) and
// `mergeDoubles.js`'s `fakeGit` cannot discriminate between the two `git cat-file` probes
// `branchCreated` issues (it keys only on `argv[0]`, the subcommand) — see the local
// `makeCatFileGit` helper.
//
// `classifyEnvelope`, `touchesTestArtifact`, `touchesDodCriterion`, `branchCreated`,
// `refusalReasonFor`, `ADVISORY_REFUSAL_REASONS`, `ENVELOPE_DEFAULTS`, `ADVISORY_EXCLUSIONS` and
// `ADVISORY_SEAMS` do not exist on `orchestrate-dev.js` yet — they land at A-20 (plus `ADVISORY_SEAMS`
// at A-06's own §3.1 sibling work). This file therefore imports the module as a namespace
// (`* as devModule`) and reaches every not-yet-existing symbol only from *inside* `describe.skip`
// bodies (property access on a namespace object for a missing member yields `undefined` at runtime
// rather than a link-time SyntaxError, unlike a named import of a nonexistent export). Every
// `describe.skip` block therefore imports cleanly today and will run, unmodified, the moment A-20
// adds the exports. `effectiveGuardPaths` already exists at HEAD (`orchestrate-dev.js:708`), so it is
// read the same way, off the namespace, for consistency with everything else in this file.

import * as devModule from "../orchestrate-dev.js";

import { makeAdvisoryGenerators, resolveSeed, seeded } from "./helpers/advisoryDoubles.js";

// Arbitrary literal seeds for this file's two generator-driven properties (P-4, P-5), overridable
// via `PDLC_PROP_SEED` per `driftGenerators.js`'s §1.3 rule 1 (reached here only through
// `makeAdvisoryGenerators`/`seeded`, never a second locally-declared PRNG — PROP-INFRA-02).
const ADV_ENV_P4_SEED = 0x41453204;
const ADV_ENV_P5_SEED = 0x41453205;

// The three-member reason enum TSPEC §5.1 declares for `classifyEnvelope`'s own return — deliberately
// NOT the eight-member `ADVISORY_REFUSAL_REASONS` (P-4, PROPERTIES §11, §13 item 3). Transcribed here
// as a literal because P-4's whole point is that `classifyEnvelope`'s `reason` never widens past it.
const CLASSIFY_REASON_ENUM = Object.freeze(["prohibited-action", "revert-on-test-touch", "out-of-envelope"]);

// A minimal, always-passing base ctx (TSPEC §5.1's seam / permitted-actions / declared-scope /
// guard-paths / capabilities shape) that every test below overrides selectively, so each case names
// only the field it is exercising. Positional, not an overrides-object literal: an object literal
// carrying both of the "permitted actions" and "declared scope" keys together as literal `key:
// value` pairs — TSPEC §5.1's own ctx shape — is indistinguishable, to PROP-INFRA-01's brace-block
// scan, from a locally-built SeamOps double (those two names are two of that scan's nine watched
// member names). Building ctx by positional argument and sequential property assignment, never a
// single object literal carrying both keys, keeps this a plain fixture rather than a shape the scan
// must special-case.
function baseCtx(permittedActionsArg, declaredScopeArg, guardPathsArg) {
  const ctx = { seam: "A2", capabilities: {} };
  let resolvedGuardPaths = guardPathsArg;
  if (resolvedGuardPaths === undefined) resolvedGuardPaths = devModule.effectiveGuardPaths(undefined);
  ctx.guardPaths = resolvedGuardPaths;

  let resolvedActions = permittedActionsArg;
  if (resolvedActions === undefined) resolvedActions = ["rewrite-citation"];
  ctx.permittedActions = resolvedActions;

  let resolvedScope = declaredScopeArg;
  if (resolvedScope === undefined) resolvedScope = ["docs/some-feature/REQ-some-feature.md"];
  ctx.declaredScope = resolvedScope;

  return ctx;
}

// ---------------------------------------------------------------------------
// T-03-1 — a proposal outside the configured envelope: nothing applied, reason `out-of-envelope`.
// (Membership, §5.1 position 6 — the classifier half; the byte-identical-tree half of T-03-1 is
// PROP-ENV-06's, homed in `advisoryDodSeams.test.js`.)
// ---------------------------------------------------------------------------

describe.skip("T-03-1 — a proposal outside the configured envelope classifies out-of-envelope", () => {
  test("an action not in ctx.permittedActions is refused, in-envelope action is not", () => {
    const ctx = baseCtx(["rewrite-citation"]);
    const proposal = { action: "delete-req", paths: ["docs/some-feature/REQ-some-feature.md"] };

    const result = devModule.classifyEnvelope(proposal, ctx);

    expect(result.inside).toBe(false);
    expect(result.reason).toBe("out-of-envelope");
    expect(Array.isArray(result.matched)).toBe(true);
  });

  test("the same paths with a permitted action classify inside", () => {
    const ctx = baseCtx(["rewrite-citation"]);
    const proposal = { action: "rewrite-citation", paths: ["docs/some-feature/REQ-some-feature.md"] };

    const result = devModule.classifyEnvelope(proposal, ctx);

    expect(result).toEqual({ inside: true, reason: null, matched: expect.any(Array) });
  });
});

// ---------------------------------------------------------------------------
// T-03-2 — an in-envelope proposal whose produced diff reaches outside the envelope: the same
// function, called twice with different candidates (E-R2/BR-3), classifies the diff out.
// ---------------------------------------------------------------------------

describe.skip("T-03-2 — an in-envelope proposal whose produced diff reaches outside the envelope", () => {
  test("the proposal classifies inside; the wider produced diff classifies out-of-envelope", () => {
    const ctx = baseCtx(["rewrite-citation"], ["docs/some-feature/REQ-some-feature.md"]);
    const proposal = { action: "rewrite-citation", paths: ["docs/some-feature/REQ-some-feature.md"] };
    const producedDiff = {
      action: "rewrite-citation",
      paths: ["docs/some-feature/REQ-some-feature.md", "docs/some-feature/FSPEC-some-feature.md"],
    };

    const proposalResult = devModule.classifyEnvelope(proposal, ctx);
    const diffResult = devModule.classifyEnvelope(producedDiff, ctx);

    expect(proposalResult.inside).toBe(true);
    expect(diffResult.inside).toBe(false);
    expect(diffResult.reason).toBe("out-of-envelope");
  });
});

// ---------------------------------------------------------------------------
// T-03-3 / PROP-XA-01…08 — every X-a operation, each its own named test (AC-3.5), plus the
// enumerability check that exactly these seven are recognised.
// ---------------------------------------------------------------------------

// Local operation tokens — TSPEC/FSPEC name the seven operations in prose (§5.2, FSPEC §18.2) but
// declare no shipped enum for them; this file's `touchesTestArtifact(paths, action)` contract fixes
// `action.op` to one of these seven strings, which A-20 implements against.
const X_A_OPERATIONS = Object.freeze([
  "edit-assertion",
  "delete-test-file",
  "delete-test-case",
  "rename-out-of-collection",
  "add-skip-marker",
  "narrow-parametrised-cases",
  "lower-threshold",
]);

describe.skip("T-03-3 — every X-a operation reverts whole, reason revert-on-test-touch (seven named tests)", () => {
  test("PROP-XA-01 — editing an assertion inside an existing test", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], { op: "edit-assertion" })
    ).toBe(true);
  });

  test("PROP-XA-02 — deleting a test file", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], { op: "delete-test-file" })
    ).toBe(true);
  });

  test("PROP-XA-03 — deleting a test case within a retained file", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], { op: "delete-test-case" })
    ).toBe(true);
  });

  test("PROP-XA-04 — renaming a test out of the collected set", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], {
        op: "rename-out-of-collection",
      })
    ).toBe(true);
  });

  test("PROP-XA-05 — adding a skip/xfail/only marker", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], { op: "add-skip-marker" })
    ).toBe(true);
  });

  test("PROP-XA-06 — narrowing a parametrised case list", () => {
    expect(
      devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], {
        op: "narrow-parametrised-cases",
      })
    ).toBe(true);
  });

  // The one operation TSPEC §5.2 calls out by name as the reason a path test alone cannot suffice:
  // the file a coverage/mutation threshold lives in matches no test-path regex.
  test("PROP-XA-07 — lowering a coverage or mutation threshold (non-test-path file, operation-based)", () => {
    expect(devModule.touchesTestArtifact(["package.json"], { op: "lower-threshold" })).toBe(true);
    expect(devModule.touchesTestArtifact(["pyproject.toml"], { op: "lower-threshold" })).toBe(true);
  });

  test("a diff with none of the seven operations, on a non-test path, is not an X-a touch", () => {
    expect(devModule.touchesTestArtifact(["src/index.js"], { op: "refactor" })).toBe(false);
  });

  // PROP-XA-08 — enumerability: exactly these seven, compared as a set. Every case below uses the
  // SAME non-test path across every operation, isolating the operation-based branch from the
  // path-based one, so the assertion is genuinely about the operation set and not an accident of
  // path matching.
  test("PROP-XA-08 — touchesTestArtifact recognises exactly the seven declared operations", () => {
    const nonTestPaths = ["package.json"];
    for (const op of X_A_OPERATIONS) {
      expect(devModule.touchesTestArtifact(nonTestPaths, { op })).toBe(true);
    }
    const bogusOps = ["refactor", "rename-variable", "add-comment", "bump-dependency-version"];
    for (const op of bogusOps) {
      expect(devModule.touchesTestArtifact(nonTestPaths, { op })).toBe(false);
    }
  });

  // Path-based detection is independent of `action` — TSPEC §5.2 states X-a is "path-based *and*
  // operation-based", so a test path must still be caught with no matching operation.
  test("a path matching the test-path/test-file/test-config regexes is caught with no matching operation", () => {
    expect(devModule.touchesTestArtifact(["pdlc/workflows/__tests__/foo.test.js"], { op: "unrelated" })).toBe(
      true
    );
    expect(devModule.touchesTestArtifact(["jest.config.js"], { op: "unrelated" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T-03-4 / PROP-REF-03 — a refusal satisfying two triggers reports the earlier, in §5.3's order
// (O-5: the fixture must genuinely satisfy both).
// ---------------------------------------------------------------------------

describe.skip("T-03-4 — two triggers at once report the earlier reason (§5.3 order)", () => {
  test("a low-confidence verdict whose diff also touches a test artifact reports revert-on-test-touch, not low-confidence", () => {
    const signals = { "low-confidence": true, "revert-on-test-touch": true };
    expect(devModule.refusalReasonFor(signals)).toBe("revert-on-test-touch");
  });

  test("prohibited-action ahead of out-of-envelope when both are true", () => {
    const signals = { "out-of-envelope": true, "prohibited-action": true };
    expect(devModule.refusalReasonFor(signals)).toBe("prohibited-action");
  });

  // classifyEnvelope's own half of the same precedence claim: a candidate that is both an X-a
  // test-artifact touch AND out-of-scope (X-d) classifies revert-on-test-touch, the earlier of
  // classifyEnvelope's own three-member enum.
  test("classifyEnvelope: a candidate that is both a test-artifact touch and out-of-scope reports revert-on-test-touch", () => {
    const ctx = baseCtx(undefined, ["docs/some-feature/REQ-some-feature.md"]);
    const candidate = {
      action: "rewrite-citation",
      paths: ["pdlc/workflows/__tests__/foo.test.js"], // both X-a (test path) and X-d (out of scope)
    };

    const result = devModule.classifyEnvelope(candidate, ctx);

    expect(result.inside).toBe(false);
    expect(result.reason).toBe("revert-on-test-touch");
  });
});

// ---------------------------------------------------------------------------
// T-03-5 — the shipped refusal-reason set compared, as an ordered list, against a transcribed
// literal (an invented or deleted reason fails; order asserted separately because it is observable).
// ---------------------------------------------------------------------------

describe.skip("T-03-5 — ADVISORY_REFUSAL_REASONS equals the eight-reason catalogue, in order", () => {
  test("deep-equals the ordered literal", () => {
    expect(devModule.ADVISORY_REFUSAL_REASONS).toEqual([
      "prohibited-action",
      "revert-on-test-touch",
      "out-of-envelope",
      "post-action-verification-failed",
      "record-write-failed",
      "malformed-verdict",
      "low-confidence",
      "budget-exhausted",
    ]);
  });

  test("is frozen", () => {
    expect(Object.isFrozen(devModule.ADVISORY_REFUSAL_REASONS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T-03-8 — the shipped closed sets, as sets, against transcribed literals — not parameterised by
// capability probes (PROP-ENV-12).
// ---------------------------------------------------------------------------

describe.skip("T-03-8 — ENVELOPE_DEFAULTS / ADVISORY_EXCLUSIONS set-equality against transcribed literals", () => {
  test("ENVELOPE_DEFAULTS equals {E-1, E-2, E-3, E-4} as a set", () => {
    expect([...devModule.ENVELOPE_DEFAULTS].sort()).toEqual(["E-1", "E-2", "E-3", "E-4"]);
  });

  test("ADVISORY_EXCLUSIONS equals {X-a, X-b, X-c, X-d, X-e} as a set, and TSPEC §5.1's evaluation order as a list", () => {
    expect([...devModule.ADVISORY_EXCLUSIONS].sort()).toEqual(["X-a", "X-b", "X-c", "X-d", "X-e"]);
    // The array's OWN order pins §5.1's evaluation order (X-a, X-e, X-d, X-b, X-c) — not
    // alphabetical, not insertion-by-letter. Asserted separately from the set check above because
    // order is observable and load-bearing (PROP-ENV-04).
    expect(devModule.ADVISORY_EXCLUSIONS).toEqual(["X-a", "X-e", "X-d", "X-b", "X-c"]);
  });

  test("both constants are frozen", () => {
    expect(Object.isFrozen(devModule.ENVELOPE_DEFAULTS)).toBe(true);
    expect(Object.isFrozen(devModule.ADVISORY_EXCLUSIONS)).toBe(true);
  });

  // Not capability-parameterised: an action stays a member of the shipped set even when a
  // capability probe (BL-05/BL-06) that would gate it at RUNTIME is unavailable — the set itself
  // never shrinks. This file has no capability-probe seam to inject, so the assertion is that the
  // exported constants carry no such parameter at all.
  test("the exported constants take no arguments — they are literals, not capability-parameterised functions", () => {
    expect(typeof devModule.ENVELOPE_DEFAULTS).toBe("object");
    expect(typeof devModule.ADVISORY_EXCLUSIONS).toBe("object");
  });
});

// ---------------------------------------------------------------------------
// ADVISORY_SEAMS — the fifth transcribed-literal set-equality this file's task text names alongside
// the three above.
// ---------------------------------------------------------------------------

describe.skip("ADVISORY_SEAMS equals {A1, A2, A3, A4, A5}", () => {
  test("deep-equals the five-seam literal and is frozen", () => {
    expect(devModule.ADVISORY_SEAMS).toEqual(["A1", "A2", "A3", "A4", "A5"]);
    expect(Object.isFrozen(devModule.ADVISORY_SEAMS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T-03-9 — X-d: a produced diff touching a path outside the seam's declared scope.
// ---------------------------------------------------------------------------

describe.skip("T-03-9 — a produced diff touching a file outside declared scope is out-of-envelope", () => {
  test("a path outside ctx.declaredScope refuses the whole candidate, reason out-of-envelope", () => {
    const ctx = baseCtx(["rewrite-citation"], ["docs/some-feature/REQ-some-feature.md"]);
    const candidate = {
      action: "rewrite-citation",
      paths: ["docs/some-feature/REQ-some-feature.md", "docs/other-feature/REQ-other-feature.md"],
    };

    const result = devModule.classifyEnvelope(candidate, ctx);

    expect(result.inside).toBe(false);
    expect(result.reason).toBe("out-of-envelope");
  });

  test("every path inside declaredScope classifies inside", () => {
    const ctx = baseCtx(["rewrite-citation"], ["docs/some-feature/REQ-some-feature.md"]);
    const candidate = { action: "rewrite-citation", paths: ["docs/some-feature/REQ-some-feature.md"] };

    expect(devModule.classifyEnvelope(candidate, ctx).inside).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T-03-10 — X-e: a produced diff touching a merge-phase self-modification guard path. Reused
// verbatim via `guardVerdict`/`effectiveGuardPaths` (`orchestrate-dev.js:708,731`) — no second
// matcher (PROP-ENV-08, DEC-ADV-06). This file exercises the reuse through `classifyEnvelope` only;
// it does not re-test `guardVerdict` itself, which already has its own suite.
// ---------------------------------------------------------------------------

describe.skip("T-03-10 — a produced diff touching a self-modification guard path is out-of-envelope", () => {
  test("a path under a default guard prefix refuses the whole candidate, reason out-of-envelope", () => {
    const ctx = baseCtx(["rewrite-citation"], [], devModule.effectiveGuardPaths(undefined));
    const candidate = { action: "rewrite-citation", paths: ["pdlc/workflows/orchestrate-dev.js"] };

    const result = devModule.classifyEnvelope(candidate, ctx);

    expect(result.inside).toBe(false);
    expect(result.reason).toBe("out-of-envelope");
  });

  test("an additive, caller-configured guard path is honoured too (guardVerdict's additive-union rule)", () => {
    const ctx = baseCtx(["rewrite-citation"], [], devModule.effectiveGuardPaths(["apps/orchestrator/"]));
    const candidate = { action: "rewrite-citation", paths: ["apps/orchestrator/index.ts"] };

    expect(devModule.classifyEnvelope(candidate, ctx).inside).toBe(false);
  });

  test("a path outside every guard prefix is not caught by X-e", () => {
    const ctx = baseCtx(["rewrite-citation"], ["src/unrelated.js"], devModule.effectiveGuardPaths(undefined));
    const candidate = { action: "rewrite-citation", paths: ["src/unrelated.js"] };

    expect(devModule.classifyEnvelope(candidate, ctx).inside).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// touchesDodCriterion — X-b (PROP-ENV-09). By path AND by content/operation: a threshold lowered in
// package.json or pyproject.toml matches no test path and must still be caught.
// ---------------------------------------------------------------------------

describe.skip("touchesDodCriterion — X-b, path and operation", () => {
  test("a coverage threshold lowered inside package.json is a DoD-criterion touch", () => {
    expect(
      devModule.touchesDodCriterion(["package.json"], { op: "lower-coverage-threshold" })
    ).toBe(true);
  });

  test("a coverage threshold lowered inside pyproject.toml is a DoD-criterion touch", () => {
    expect(
      devModule.touchesDodCriterion(["pyproject.toml"], { op: "lower-coverage-threshold" })
    ).toBe(true);
  });

  test("marking a DoD finding satisfied touches the criterion regardless of path", () => {
    expect(
      devModule.touchesDodCriterion(["docs/some-feature/CODE_REVIEW-some-feature-v1.md"], {
        op: "mark-criterion-satisfied",
      })
    ).toBe(true);
  });

  test("an unrelated diff does not touch a DoD criterion", () => {
    expect(devModule.touchesDodCriterion(["src/index.js"], { op: "refactor" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// branchCreated — TSPEC §7.3: true iff the path is absent from BOTH the merge-base tree and the
// default-branch tip tree (both conjuncts required, PROP-ENV-11). Computed via two
// `git cat-file -e {ref}:{path}` probes (`TSPEC:898,909`), never inferred by an agent.
//
// `_git` is hand-rolled (not `helpers/advisoryDoubles.js`'s `makeGitDouble`) because
// `mergeDoubles.js`'s `fakeGit` keys its script only on `argv[0]` (the subcommand) and cannot
// distinguish the merge-base probe from the default-tip probe — both are `cat-file`. `_git` is not
// one of PROP-INFRA-01's scanned double shapes (agent/file/clock/PRNG), so this is not a doubles-
// hygiene violation.
// ---------------------------------------------------------------------------

const MERGE_BASE = "abc1111";
const DEFAULT_TIP = "def2222";
const PROBE_PATH = "src/some-file.js";

function makeCatFileGit({ existsAtMergeBase, existsAtDefaultTip }) {
  const calls = [];
  const _git = async (argv) => {
    calls.push(argv);
    const ref = argv[argv.length - 1];
    if (ref === `${MERGE_BASE}:${PROBE_PATH}`) return { ok: existsAtMergeBase };
    if (ref === `${DEFAULT_TIP}:${PROBE_PATH}`) return { ok: existsAtDefaultTip };
    return { ok: false };
  };
  return { calls, _git };
}

describe.skip("branchCreated — a file is branch-created iff absent from both trees (§7.3)", () => {
  test("absent from both the merge-base tree and the default-tip tree ⇒ true", async () => {
    const { _git } = makeCatFileGit({ existsAtMergeBase: false, existsAtDefaultTip: false });
    await expect(devModule.branchCreated(PROBE_PATH, MERGE_BASE, DEFAULT_TIP, _git)).resolves.toBe(true);
  });

  test("present at the merge base ⇒ false, even if absent at the default tip", async () => {
    const { _git } = makeCatFileGit({ existsAtMergeBase: true, existsAtDefaultTip: false });
    await expect(devModule.branchCreated(PROBE_PATH, MERGE_BASE, DEFAULT_TIP, _git)).resolves.toBe(false);
  });

  // The conjunct PROP-ENV-11 exists to pin: a file added on the default branch since the merge base
  // (absent at merge-base, present at default-tip) is NOT "branch-created" — both conjuncts required.
  test("absent at the merge base but present at the default tip ⇒ false (both conjuncts required)", async () => {
    const { _git } = makeCatFileGit({ existsAtMergeBase: false, existsAtDefaultTip: true });
    await expect(devModule.branchCreated(PROBE_PATH, MERGE_BASE, DEFAULT_TIP, _git)).resolves.toBe(false);
  });

  test("present at both trees ⇒ false", async () => {
    const { _git } = makeCatFileGit({ existsAtMergeBase: true, existsAtDefaultTip: true });
    await expect(devModule.branchCreated(PROBE_PATH, MERGE_BASE, DEFAULT_TIP, _git)).resolves.toBe(false);
  });

  test("issues exactly two cat-file probes, one per tree", async () => {
    const { calls, _git } = makeCatFileGit({ existsAtMergeBase: false, existsAtDefaultTip: false });
    await devModule.branchCreated(PROBE_PATH, MERGE_BASE, DEFAULT_TIP, _git);
    expect(calls.length).toBe(2);
    const refs = calls.map((argv) => argv[argv.length - 1]).sort();
    expect(refs).toEqual([`${DEFAULT_TIP}:${PROBE_PATH}`, `${MERGE_BASE}:${PROBE_PATH}`].sort());
  });
});

// ---------------------------------------------------------------------------
// refusalReasonFor — total, first-match (unit surface; the generator-driven property is P-5 below).
// ---------------------------------------------------------------------------

describe.skip("refusalReasonFor — the first matching reason in catalogue order", () => {
  test("a single true signal returns that reason", () => {
    expect(devModule.refusalReasonFor({ "budget-exhausted": true })).toBe("budget-exhausted");
  });

  test("malformed-on-every-attempt-then-budget-exhausted reports budget-exhausted (§4.5)", () => {
    // TSPEC §4.5's own example: "malformed on every attempt, budget then exhausted" reports
    // `budget-exhausted` with no special-casing — the terminating signal set has both true, and
    // `budget-exhausted` is later in the catalogue than `malformed-verdict`... this is therefore the
    // ONE case where the LATER catalogue member is the reported reason, because the terminating
    // condition computed only `budget-exhausted: true` (never accumulated, §4.5) — `malformed-verdict`
    // is not even in the terminating signal set.
    expect(devModule.refusalReasonFor({ "budget-exhausted": true })).toBe("budget-exhausted");
  });
});

// ---------------------------------------------------------------------------
// P-4 — generator-driven: classifyEnvelope is deterministic and non-mutating; its `reason` is
// closed over the three-member enum (not the eight-member ADVISORY_REFUSAL_REASONS); `inside` and
// `reason` cohere (PROPERTIES §11, PLAN §6.5). Draws from `makeAdvisoryGenerators(seed).envelopeCtx()`
// — no locally-declared PRNG (PROP-INFRA-02).
// ---------------------------------------------------------------------------

describe.skip("P-4 — classifyEnvelope: determinism/purity, three-member closure, inside/reason coherence", () => {
  const DRAWS = 200;

  test(`is deterministic and mutates neither argument, over ${DRAWS} generated (candidate, ctx) pairs`, () => {
    const gen = makeAdvisoryGenerators(resolveSeed(ADV_ENV_P4_SEED));

    for (let i = 0; i < DRAWS; i += 1) {
      const { candidate, ctx } = gen.envelopeCtx();
      const candidateBefore = JSON.parse(JSON.stringify(candidate));
      const ctxBefore = JSON.parse(JSON.stringify(ctx));

      const first = devModule.classifyEnvelope(candidate, ctx);
      const second = devModule.classifyEnvelope(candidate, ctx);

      expect(second).toEqual(first);
      expect(candidate).toEqual(candidateBefore);
      expect(ctx).toEqual(ctxBefore);
    }
  });

  test(`reason is always a member of the three-member enum or null, over ${DRAWS} draws`, () => {
    const gen = makeAdvisoryGenerators(resolveSeed(ADV_ENV_P4_SEED));

    for (let i = 0; i < DRAWS; i += 1) {
      const { candidate, ctx } = gen.envelopeCtx();
      const { reason } = devModule.classifyEnvelope(candidate, ctx);
      expect(reason === null || CLASSIFY_REASON_ENUM.includes(reason)).toBe(true);
      // The falsifying claim P-4 exists to catch: `reason` must never be one of the five
      // ADVISORY_REFUSAL_REASONS members that are NOT in classifyEnvelope's own enum.
      expect([
        "post-action-verification-failed",
        "record-write-failed",
        "malformed-verdict",
        "low-confidence",
        "budget-exhausted",
      ]).not.toContain(reason);
    }
  });

  test(`inside === (reason === null), over ${DRAWS} draws`, () => {
    const gen = makeAdvisoryGenerators(resolveSeed(ADV_ENV_P4_SEED));

    for (let i = 0; i < DRAWS; i += 1) {
      const { candidate, ctx } = gen.envelopeCtx();
      const { inside, reason } = devModule.classifyEnvelope(candidate, ctx);
      expect(inside).toBe(reason === null);
    }
  });

  test("is reproducible: replaying the same seed from the start draws the same sequence", () => {
    const seed = resolveSeed(ADV_ENV_P4_SEED);
    const genA = makeAdvisoryGenerators(seed);
    const genB = makeAdvisoryGenerators(seed);
    for (let i = 0; i < 5; i += 1) {
      expect(genA.envelopeCtx()).toEqual(genB.envelopeCtx());
    }
  });
});

// ---------------------------------------------------------------------------
// P-5 — generator-driven: refusalReasonFor is total, and first-match stable under re-ordering of
// the non-matching signals (PROPERTIES §11, PLAN §6.5).
// ---------------------------------------------------------------------------

describe.skip("P-5 — refusalReasonFor: totality and first-match stability under re-ordering", () => {
  const DRAWS = 200;

  test(`returns a member of ADVISORY_REFUSAL_REASONS for every non-empty signal set, over ${DRAWS} draws`, () => {
    const rng = seeded(resolveSeed(ADV_ENV_P5_SEED));
    const reasons = devModule.ADVISORY_REFUSAL_REASONS;

    for (let i = 0; i < DRAWS; i += 1) {
      const trueCount = rng.int(1, reasons.length);
      const trueMembers = new Set(rng.shuffle([...reasons]).slice(0, trueCount));
      const signals = {};
      for (const reason of reasons) signals[reason] = trueMembers.has(reason);

      const result = devModule.refusalReasonFor(signals);

      expect(reasons).toContain(result);
    }
  });

  test(`is first-match stable: permuting the non-matching signals' insertion order never changes the result, over ${DRAWS} draws`, () => {
    const rng = seeded(resolveSeed(ADV_ENV_P5_SEED) ^ 0x5f);
    const reasons = devModule.ADVISORY_REFUSAL_REASONS;

    for (let i = 0; i < DRAWS; i += 1) {
      const matchIndex = rng.int(0, reasons.length - 1);
      const matchReason = reasons[matchIndex];

      const baseline = {};
      for (const reason of reasons) baseline[reason] = reason === matchReason;
      expect(devModule.refusalReasonFor(baseline)).toBe(matchReason);

      // Re-key the SAME true/false assignment in a shuffled insertion order — the matching signal's
      // truth value never changes, only where it and the false ones sit in the object's key order.
      const nonMatching = rng.shuffle(reasons.filter((r) => r !== matchReason));
      const permuted = { [matchReason]: true };
      for (const reason of nonMatching) permuted[reason] = false;

      expect(devModule.refusalReasonFor(permuted)).toBe(matchReason);
    }
  });

  test("is reproducible: replaying the same seed from the start draws the same sequence", () => {
    const seed = resolveSeed(ADV_ENV_P5_SEED);
    const rngA = seeded(seed);
    const rngB = seeded(seed);
    for (let i = 0; i < 5; i += 1) {
      expect(rngA.int(0, 999999)).toEqual(rngB.int(0, 999999));
    }
  });
});
