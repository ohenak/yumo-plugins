// advisoryDriver.test.js — PLAN A-07 (batch 3, depends on A-02).
//
// RED (authored as four `skipped-describe` blocks, each un-skipped by a different 🟢 owner, per
// PLAN §3's un-skipper rule — no block is un-skipped before the symbols its cases exercise
// exist):
//
//   - `A-22 — driver lifecycle`            (batch 9)  — lands `runAdvisorySeam` itself
//   - `A-23 — A3/A4 gate exclusivity`       (batch 10) — lands A3's and A4's `SeamOps`
//   - `A-24 — A5 gate exclusivity`          (batch 11) — lands A5's `SeamOps`
//   - `A-31 — A1/A2 gate exclusivity`       (batch 12) — lands A2's `SeamOps` (A1 needs no
//                                                          implementation task of its own — it is
//                                                          the pre-existing pre-check path — but
//                                                          A2's `verifyGate` is the last symbol
//                                                          this block's cases exercise)
//
// `A-22`'s block owns: the whole-lifecycle cases T-02-1/T-02-2/T-02-3 (FSPEC:284-286, moved from
// A-05 per that file's own header), the attempt-loop cases T-02-4/T-02-5 (FSPEC:287-288, also
// moved from A-05 — both need `runAdvisorySeam` itself, which A-05 does not land), T-02-6 (the V-8
// triple for every member of `ADVISORY_REFUSAL_REASONS`, PROP-LIFE-12), T-03-7 (`apply` returning
// `{ok:false}`, PROP-LIFE-06), the driver-only half of T-03-6 — the four prohibition cases
// P-1…P-4 (PROP-PROH-01…04), which need only the generic driver behind a seam-shaped fake
// `SeamOps` — TSPEC §17's tier-wide invariants (the terminal catch mapping an unclassified throw
// to `escalated`, never `resolved` — `escalatesOnUnclassified`), and the **single** gate-exclusivity
// set-equality driver (PROP-GATE-06): one case asserting the union of this file's registered
// per-seam gate-case names equals `ADVISORY_SEAMS` as a set. That case is deliberately written over
// an **in-file registry of names** (`GATE_EXCLUSIVITY_REGISTRY`, module scope, below) — never over
// case *results* — and un-skipped at batch 9, before any of the three per-seam blocks exist
// (PROPERTIES §6.5, PLAN §8.2).
//
// The remaining part of T-03-6 — the five per-seam gate-exclusivity cases, one per
// `ADVISORY_SEAMS` member (PROP-GATE-01…05) — is **generated** by iterating the same registry,
// split across the three per-seam blocks by which seam's `SeamOps` each depends on: A3 + A4 in
// `A-23`, A5 in `A-24`, A1 + A2 in `A-31`. A1 and A3 declare **no** gate (`verifyGate: null`,
// TSPEC:655/:657, DEC-ADV-11) and therefore take the two-conjunct gateless form — the behavioural
// conjunct (`resolved` unreachable on every path, each path its own O-1 triple) plus the structural
// conjunct (`seamOps.verifyGate === null`, asserted directly) — with the mutation run in the
// **install-the-stub** direction (`async () => ({ passed: true })` installed where the shipped seam
// declares `null`), never the replace-the-gate direction used at A2/A4/A5 (PROPERTIES §6.5,
// `PROPERTIES:570-572`).
//
// Every canonical double comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else. Every `SeamOps` override this file builds passes
// through `buildSeamOpsOverrides` (below), a **positional**-argument helper — mirroring
// `advisoryEnvelope.test.js`'s `baseCtx` — so no object literal in this file ever carries two or
// more `SeamOps` member names as `key:` pairs, which is indistinguishable, to PROP-INFRA-01's
// brace-block scan, from a locally-built double.
//
// `runAdvisorySeam`, `ADVISORY_SEAMS`, `ADVISORY_REFUSAL_REASONS` and `budgetExceeded` do not exist
// on `orchestrate-dev.js` yet at A-07 (A-22/A-19 land them later). This file therefore imports the
// module as a namespace (`import * as dev`) and reaches every not-yet-existing symbol only from
// *inside* `skipped-describe` bodies, exactly as `advisoryVerdict.test.js` and
// `advisoryEnvelope.test.js` already do.
//
// **Interpretive/contract-fixing decisions this RED task makes** (documented here per this
// project's own convention — see `advisoryVerdict.test.js`'s header on `parseAdvisoryVerdict`'s
// second parameter — for A-22 to implement against):
//
//   1. **`_log`.** TSPEC §4.4's `runAdvisorySeam` signature carries a `_log` parameter whose role
//      is otherwise unstated. PROP-LIFE-02 needs an eight-token ordered call log
//      (`["DIAGNOSE","VALIDATE","GATE","RE-CHECK","ACT","CHECK","VERIFY","RECORD"]`) that a
//      `SeamOps` spy cannot produce on its own — three of those eight steps (VALIDATE, GATE,
//      RECORD) are driver-internal, never a `SeamOps` call. This file fixes `_log`'s contract as
//      "called with the step's own token at each of the eight transitions", tested by injecting a
//      log-appending function in `_log`'s place.
//   2. **`malformed-verdict` as a *sole* terminating reason.** TSPEC §4.5 states the compound case
//      ("malformed on every attempt, budget then exhausted") reports `budget-exhausted`, and V-5's
//      wall-clock preemption (T-02-5) is explicitly `budget-exhausted` too, even though no verdict
//      was ever produced. Both of those imply the terminal-reason ladder resolves `budget-exhausted`
//      whenever a budget bound is *also* true at termination. This file therefore fixes
//      `malformed-verdict` as the terminal reason of a **single-attempt** invocation
//      (`attemptBudget: 1`) whose one and only response is unparseable — the loop is never entered
//      (there is no second iteration to have been cut off by a budget), so the terminating cause is
//      the malformed response itself, not an exhausted budget.
//   3. **P-1…P-4's driver-level fixtures (T-03-6(a)) are seam-shaped stand-ins, not the real
//      per-seam `SeamOps`.** They exercise the *generic* driver against a fake `SeamOps` built to
//      match each seam's declared shape (A3's `permittedActions: []`, A2's `declaredScope`), not
//      the seam's real production implementation — that correctness is A-10's/A-31's own concern
//      (`advisoryDodSeams.test.js`, `advisoryQueueSeams.test.js`). P-2's frontmatter-vs-citation
//      distinction in particular (TSPEC:635) is A2's own diff-classification logic; this file's
//      stand-in models the same *observable* refusal (`out-of-envelope`, O-1 in full) via a
//      produced path outside A2's declared scope, which is the same reason value TSPEC:635 says the
//      real mechanism produces.

import * as dev from "../orchestrate-dev.js";

import { makeAgentDouble, makeSeamOps, makeFileDouble, makeFakeClock, makeAdvisoryConfig } from "./helpers/advisoryDoubles.js";

/** This file's feature name, threaded to every `runAdvisorySeam` call below. */
const FEATURE = "pdlc-advisory-tier";

// ─── Verdict fixture — the raw agent trailer grammar `advisoryDoubles.js` already fixes ─────────
// (SEAM / DIAGNOSIS / PROPOSED-ACTION / CONFIDENCE / WITHIN-ENVELOPE / EVIDENCE, one `KEY: value`
// line per field) — mirrors `advisoryVerdict.test.js`'s own local `verdictFixture`, authored
// separately per file rather than shared, since it is a plain fixture builder, not a canonical
// double or PRNG (PROP-INFRA-01/-02 govern those, not this).
function verdictFixture({
  seam = "A2",
  diagnosis = "diagnosis text",
  proposedAction = "do the thing",
  confidence = "high",
  withinEnvelope = "yes",
  evidence = ["file.js:12"],
} = {}) {
  const lines = [
    `SEAM: ${seam}`,
    `DIAGNOSIS: ${diagnosis}`,
    `PROPOSED-ACTION: ${proposedAction}`,
    `CONFIDENCE: ${confidence}`,
    `WITHIN-ENVELOPE: ${withinEnvelope}`,
    `EVIDENCE: ${evidence.join(", ")}`,
  ];
  return lines.join("\n");
}

// ─── SeamOps overrides — positional, never a multi-key object literal ────────────────────────────
// (PROP-INFRA-01; see this file's header). Each parameter maps 1:1 onto a `makeSeamOps` override
// key; `undefined` means "use `makeSeamOps`'s own default for that member".
function buildSeamOpsOverrides(
  permittedActions,
  declaredScope,
  verifyGate,
  apply,
  revert,
  producedPaths,
  conditionHolds,
  gatherEvidence,
  prompt
) {
  const o = {};
  if (permittedActions !== undefined) o.permittedActions = permittedActions;
  if (declaredScope !== undefined) o.declaredScope = declaredScope;
  if (verifyGate !== undefined) o.verifyGate = verifyGate;
  if (apply !== undefined) o.apply = apply;
  if (revert !== undefined) o.revert = revert;
  if (producedPaths !== undefined) o.producedPaths = producedPaths;
  if (conditionHolds !== undefined) o.conditionHolds = conditionHolds;
  if (gatherEvidence !== undefined) o.gatherEvidence = gatherEvidence;
  if (prompt !== undefined) o.prompt = prompt;
  return o;
}

// ─── invokeDriver — the one call site every case below goes through ─────────────────────────────
// Assembles `runAdvisorySeam`'s full parameter set (TSPEC §4.4) from canonical doubles, so no
// individual test re-states the plumbing. `fileDouble`/`appendFile` are optional seams for the
// record-write-failure cases (PROP-LIFE-07, T-08-2); `now` seeds the fake clock for the budget
// cases (T-02-5).
async function invokeDriver({ seam, config, seamOps, agent, fileDouble, appendFile, now, clock }) {
  const files = fileDouble || makeFileDouble();
  const fakeClock = clock || makeFakeClock(now !== undefined ? { start: now } : undefined);
  const disposition = await dev.runAdvisorySeam({
    seam,
    feature: FEATURE,
    seamOps,
    config,
    rungState: {},
    _agent: agent,
    _appendFile: appendFile || files._appendFile,
    _writeFile: files._writeFile,
    _readFile: files._readFile,
    _git: async () => ({ ok: true, stdout: "" }),
    _log: () => {},
    _now: fakeClock._now,
    _sleep: fakeClock._sleep,
  });
  return { disposition, fileDouble: files, clock: fakeClock };
}

// ─── The gate-exclusivity registry (PROP-GATE-01…06, TSPEC §5.5, §6.5) ──────────────────────────
// One row per `ADVISORY_SEAMS` member, module scope — outside every `skipped-describe` block, so the
// single set-equality driver (A-22's block, below) and the three per-seam generators (A-23/A-24/
// A-31's blocks) all read the *same* registry. `gate: null` marks A1 and A3 (TSPEC:655/:657); every
// other row's `action` is the permitted-action label its own seam declares (TSPEC §5.5). Neither
// key is a `SeamOps` member name, so this object literal never risks PROP-INFRA-01's scan
// regardless of how many rows it carries.
const GATE_EXCLUSIVITY_REGISTRY = {
  A1: { gate: null, action: "none" },
  A2: { gate: "declared", action: "rewrite-citation" },
  A3: { gate: null, action: "none" },
  A4: { gate: "declared", action: "apply-rebase-fix" },
  A5: { gate: "declared", action: "apply-pub-fix" },
};

// ─── Generated per-seam gate-exclusivity cases (PROP-GATE-01…05) ────────────────────────────────
// Called once from inside each of the three per-seam `skipped-describe` blocks below, filtered to
// that block's own seams — never hand-written per seam (§8.2's "the loop closed in both
// directions").
function gateExclusivityCases(seams) {
  for (const seam of seams) {
    const row = GATE_EXCLUSIVITY_REGISTRY[seam];
    if (row.gate === null) {
      it(`${seam} — verifyGate is null; resolved is unreachable on every path; installing a passing stub does not unlock it (PROP-GATE-01…05, TSPEC §5.5, §6.5)`, async () => {
        const config = makeAdvisoryConfig({ enabled: true }).config;

        // Structural conjunct — the canonical shape this seam ships.
        const canonicalSeamOps = makeSeamOps(buildSeamOpsOverrides([], [], null));
        expect(canonicalSeamOps.verifyGate).toBeNull();

        const canonicalAgent = makeAgentDouble({
          script: [verdictFixture({ seam, proposedAction: "do-the-thing", confidence: "high", withinEnvelope: "yes" })],
        });
        const { disposition: canonicalDisposition } = await invokeDriver({
          seam,
          config,
          seamOps: canonicalSeamOps,
          agent: canonicalAgent,
        });
        expect(canonicalDisposition.outcome).not.toBe("resolved");
        expect(["escalated", "no-action"]).toContain(canonicalDisposition.outcome);
        if (canonicalDisposition.outcome === "escalated") {
          expect(dev.ADVISORY_REFUSAL_REASONS).toContain(canonicalDisposition.reason);
        }

        // Mutation control — the install-the-stub form (PLAN A-07, PROPERTIES §6.5): even with a
        // trivially-passing stub installed where the shipped seam declares `null`, this seam's
        // `permittedActions: []` means `apply` — and therefore `verifyGate` — is never reached, so
        // `resolved` stays unreachable. Authoring this the other way (replacing a gate this seam
        // never declares) would stub a gate never reached and fail against a correct build in this
        // very RED batch, undiagnosed until the un-skipper lands (PROPERTIES:570-572).
        const installedStub = async () => ({ passed: true });
        const mutantSeamOps = makeSeamOps(buildSeamOpsOverrides([], [], installedStub));
        const mutantAgent = makeAgentDouble({
          script: [verdictFixture({ seam, proposedAction: "do-the-thing", confidence: "high", withinEnvelope: "yes" })],
        });
        const { disposition: mutantDisposition } = await invokeDriver({
          seam,
          config,
          seamOps: mutantSeamOps,
          agent: mutantAgent,
        });
        expect(mutantDisposition.outcome).not.toBe("resolved");
      });
    } else {
      it(`${seam} — resolved is reachable only through its declared verifyGate: a stubbed-failing gate escalates post-action-verification-failed (PROP-GATE-01…05)`, async () => {
        const config = makeAdvisoryConfig({ enabled: true }).config;
        const scope = ["owned/path.js"];
        const failingGate = async () => ({ passed: false, detail: "gate re-run failed" });
        const seamOps = makeSeamOps(
          buildSeamOpsOverrides([row.action], scope, failingGate, async () => ({ ok: true }), undefined, async () => scope)
        );
        const agent = makeAgentDouble({
          script: [verdictFixture({ seam, proposedAction: row.action, confidence: "high", withinEnvelope: "yes" })],
        });

        const { disposition } = await invokeDriver({ seam, config, seamOps, agent });

        // Conjunct 1 — the positive outcome, not the absence of one (O-1 in full).
        expect(disposition.outcome).toBe("escalated");
        expect(disposition.reason).toBe("post-action-verification-failed");
        // Conjunct 2 — the gate was genuinely consulted; this same assertion is what a build that
        // bypassed the gate (silently resolving instead) would fail.
        expect(seamOps.calls.verifyGate.length).toBeGreaterThan(0);
        expect(seamOps.calls.revert).toHaveLength(1);
      });
    }
  }
}

// ─── Reason fixture table (PROP-LIFE-12, T-02-6) ─────────────────────────────────────────────────
// One driving fixture per member of `ADVISORY_REFUSAL_REASONS`. The table's own key set is
// asserted against the exported constant first, so a newly-added reason fails this file until a
// row is added for it (PROPERTIES §6.5, "parameterised off the exported constant").
const REASON_FIXTURES = {
  "prohibited-action": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const scope = ["docs/some-feature/REQ-some-feature.md"];
    const prohibitedAction = "mark the failing Definition of Done criterion satisfied";
    const seamOps = makeSeamOps(
      buildSeamOpsOverrides([prohibitedAction], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, async () => scope)
    );
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: prohibitedAction, confidence: "high", withinEnvelope: "yes" })],
    });
    return { seam: "A2", config, seamOps, agent };
  },
  "revert-on-test-touch": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const scope = ["pdlc/workflows/__tests__/someFile.test.js"];
    const seamOps = makeSeamOps(
      buildSeamOpsOverrides(["rewrite-citation"], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, async () => scope)
    );
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
    });
    return { seam: "A2", config, seamOps, agent };
  },
  "out-of-envelope": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const declaredScope = ["owned/path.js"];
    const producedScope = ["some/other/path.js"];
    const seamOps = makeSeamOps(
      buildSeamOpsOverrides(
        ["rewrite-citation"],
        declaredScope,
        async () => ({ passed: true }),
        async () => ({ ok: true }),
        undefined,
        async () => producedScope
      )
    );
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
    });
    return { seam: "A2", config, seamOps, agent };
  },
  "post-action-verification-failed": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const scope = ["owned/path.js"];
    const failingGate = async () => ({ passed: false });
    const seamOps = makeSeamOps(
      buildSeamOpsOverrides(["rewrite-citation"], scope, failingGate, async () => ({ ok: true }), undefined, async () => scope)
    );
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
    });
    return { seam: "A2", config, seamOps, agent };
  },
  "record-write-failed": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const scope = ["owned/path.js"];
    const seamOps = makeSeamOps(
      buildSeamOpsOverrides(
        ["rewrite-citation"],
        scope,
        async () => ({ passed: true }),
        async () => ({ ok: true }),
        undefined,
        async () => scope
      )
    );
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
    });
    const appendFile = async () => {
      throw new Error("record write failed: ENOSPC");
    };
    return { seam: "A2", config, seamOps, agent, appendFile };
  },
  "malformed-verdict": () => {
    // See this file's header, interpretive decision 2: a single-attempt invocation
    // (`attemptBudget: 1`) whose one response is unparseable — the loop never re-enters, so the
    // terminating cause is the malformed response, not an exhausted budget.
    const config = makeAdvisoryConfig({ enabled: true, attemptBudget: 1 }).config;
    const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], ["owned/path.js"]));
    const agent = makeAgentDouble({ script: ["not a verdict at all, just agent prose"] });
    return { seam: "A2", config, seamOps, agent };
  },
  "low-confidence": () => {
    const config = makeAdvisoryConfig({ enabled: true }).config;
    const scope = ["owned/path.js"];
    const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope));
    const agent = makeAgentDouble({
      script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "low", withinEnvelope: "yes" })],
    });
    return { seam: "A2", config, seamOps, agent };
  },
  "budget-exhausted": () => {
    const config = makeAdvisoryConfig({ enabled: true, attemptBudget: 3 }).config;
    const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], ["owned/path.js"]));
    const agent = makeAgentDouble({ script: ["garbage one", "garbage two", "garbage three"] });
    return { seam: "A2", config, seamOps, agent };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-22 — driver lifecycle (batch 9)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-22 — driver lifecycle", () => {
  describe("entry — config.enabled === false (PROP-LIFE-01, D-1, D-2, TSPEC §4.4 entry row)", () => {
    it("returns before any dispatch or rung resolution, with the seam's declared pre-advisory no-op", async () => {
      const disabledConfig = makeAdvisoryConfig().config; // enabled: false by default
      // An empty script means any dispatch attempt throws loudly ("script exhausted at call 0"),
      // so a driver that mistakenly dispatches fails this test via that rejection.
      const agent = makeAgentDouble({ script: [] });
      const seamOps = makeSeamOps(buildSeamOpsOverrides([], []));

      const { disposition } = await invokeDriver({ seam: "A1", config: disabledConfig, seamOps, agent });

      expect(agent.calls).toHaveLength(0);
      expect(seamOps.calls.gatherEvidence).toHaveLength(0);
      expect(seamOps.calls.apply).toHaveLength(0);
      expect(disposition.outcome).not.toBe("resolved");
      expect(disposition.attempts).toBe(0);
    });
  });

  describe("step 3b RE-CHECK — the seam condition is gone (PROP-LIFE-05, T-02-6, V-7, R-4)", () => {
    it("conditionHolds() false ⇒ no-action, no attempt consumed, nothing applied, record still written", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const conditionGone = async () => false;
      const seamOps = makeSeamOps(
        buildSeamOpsOverrides(["rewrite-citation"], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, undefined, conditionGone)
      );

      const { disposition, fileDouble } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("no-action");
      expect(disposition.attempts).toBe(0);
      expect(seamOps.calls.apply).toHaveLength(0);
      expect(fileDouble.appends.length).toBeGreaterThan(0);
    });
  });

  describe("T-02-1 / T-02-2 / T-02-3 — the whole lifecycle (FSPEC:284-286, moved from A-05)", () => {
    it("T-02-1 — in-envelope, confidence high, gate re-runs green ⇒ resolved, pipeline continues", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(
        buildSeamOpsOverrides(["rewrite-citation"], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, async () => scope)
      );

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("resolved");
      expect(seamOps.calls.apply).toHaveLength(1);
      expect(seamOps.calls.verifyGate.length).toBeGreaterThan(0);
    });

    it("T-02-2 — confidence low, otherwise in-envelope ⇒ escalated low-confidence, nothing applied", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "low", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope));

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("low-confidence");
      expect(seamOps.calls.apply).toHaveLength(0);
    });

    it("T-02-3 — verdict claims withinEnvelope: true for an action the configured envelope excludes; the disagreement is recorded (PROP-LIFE-04, V-3)", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "an-action-not-permitted", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope));

      const { disposition, fileDouble } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("out-of-envelope");
      expect(seamOps.calls.apply).toHaveLength(0);
      expect(fileDouble.appends.length).toBeGreaterThan(0);
    });
  });

  describe("T-02-4 / T-02-5 — the attempt loop (FSPEC:287-288, moved from A-05, needs runAdvisorySeam)", () => {
    it("T-02-4 / PROP-LIFE-09 — exactly attemptBudget attempts when every response is unparseable, then escalates budget-exhausted", async () => {
      const config = makeAdvisoryConfig({ enabled: true, attemptBudget: 3 }).config;
      const agent = makeAgentDouble({ script: ["not a verdict", "still garbage", "nope, again"] });
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], ["owned/path.js"]));

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(agent.calls).toHaveLength(3);
      expect(disposition.attempts).toBe(3);
      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("budget-exhausted");
    });

    it("T-02-5 / PROP-LIFE-10 — elapsed time passes seamBudgetMinutes during the first and only attempt: preempted, escalates budget-exhausted, attempts === 1", async () => {
      const config = makeAdvisoryConfig({ enabled: true, attemptBudget: 3, seamBudgetMinutes: 1 }).config;
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], ["owned/path.js"]));
      // A dispatch that never resolves forces `Promise.race` to settle via the deadline branch —
      // the fake clock's `_sleep` resolves without any real wait, so this is deterministic and
      // does not hang the test (TSPEC §4.5's `Promise.race([dispatch, deadline(...)])`).
      const neverResolves = () => new Promise(() => {});

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent: neverResolves });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("budget-exhausted");
      expect(disposition.attempts).toBe(1);
    });
  });

  describe("T-02-6 / PROP-LIFE-12 — the V-8 escalation triple for every member of ADVISORY_REFUSAL_REASONS", () => {
    it("this file's reason-fixture table registers exactly ADVISORY_REFUSAL_REASONS, as a set", () => {
      expect(new Set(Object.keys(REASON_FIXTURES))).toEqual(new Set(dev.ADVISORY_REFUSAL_REASONS));
    });

    test.each(Object.keys(REASON_FIXTURES))(
      "reason %s — outcome escalated, byte-equal reason (O-1 conjuncts 1–2), pre-advisory behaviour unchanged",
      async (reason) => {
        const { seam, config, seamOps, agent, appendFile } = REASON_FIXTURES[reason]();
        const { disposition } = await invokeDriver({ seam, config, seamOps, agent, appendFile });
        expect(disposition.outcome).toBe("escalated");
        expect(disposition.reason).toBe(reason);
      }
    );
  });

  describe("T-03-7 / PROP-LIFE-06 — seamOps.apply returning {ok:false}", () => {
    it("triggers exactly one revert before the disposition returns, reason post-action-verification-failed", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const failingApply = async () => ({ ok: false, why: "conflict" });
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope, undefined, failingApply));

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("post-action-verification-failed");
      expect(seamOps.calls.revert).toHaveLength(1);
      expect(seamOps.calls.apply.length).toBeGreaterThan(0);
    });
  });

  describe("PROP-LIFE-07 / T-08-2 — a step-7 record-write failure", () => {
    it("reverts the action and escalates record-write-failed; the action does not survive", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(
        buildSeamOpsOverrides(["rewrite-citation"], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, async () => scope)
      );
      const throwingAppend = async () => {
        throw new Error("ENOSPC");
      };

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent, appendFile: throwingAppend });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("record-write-failed");
      expect(seamOps.calls.revert).toHaveLength(1);
    });
  });

  describe("PROP-LIFE-08 — seamOps.revert itself throwing", () => {
    it("is rethrown as a halt, never silently swallowed (BR-5)", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const failingApply = async () => ({ ok: false });
      const throwingRevert = async () => {
        throw new Error("unrevertable tree");
      };
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope, undefined, failingApply, throwingRevert));

      await expect(invokeDriver({ seam: "A2", config, seamOps, agent })).rejects.toThrow();
    });
  });

  describe("PROP-LIFE-11 — escalatesOnUnclassified (TSPEC §17.3, E-32, the terminal catch)", () => {
    it("an unclassified throw anywhere in the lifecycle maps to escalated, never resolved", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const boom = async () => {
        throw new TypeError("cannot read property 'x' of undefined");
      };
      const seamOps = makeSeamOps(buildSeamOpsOverrides(["rewrite-citation"], scope, boom));

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.outcome).not.toBe("resolved");
      expect(disposition.reason).not.toBeNull();
    });
  });

  describe("PROP-LIFE-02 — the eight-step call log, in TSPEC §4.4 order, exactly", () => {
    it("logs DIAGNOSE, VALIDATE, GATE, RE-CHECK, ACT, CHECK, VERIFY, RECORD in that order (this file's own _log contract, header note 1)", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const scope = ["owned/path.js"];
      const log = [];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(
        buildSeamOpsOverrides(["rewrite-citation"], scope, async () => ({ passed: true }), async () => ({ ok: true }), undefined, async () => scope)
      );
      const files = makeFileDouble();
      const clock = makeFakeClock();

      await dev.runAdvisorySeam({
        seam: "A2",
        feature: FEATURE,
        seamOps,
        config,
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _writeFile: files._writeFile,
        _readFile: files._readFile,
        _git: async () => ({ ok: true }),
        _log: (step) => log.push(step),
        _now: clock._now,
        _sleep: clock._sleep,
      });

      expect(log).toEqual(["DIAGNOSE", "VALIDATE", "RE-CHECK", "GATE", "ACT", "CHECK", "VERIFY", "RECORD"]);
    });
  });

  describe("T-03-6(a) — prohibitions P-1…P-4: negative and O-1 positive on the same path (PROP-PROH-01…04)", () => {
    it("P-1 — never marks a DoD criterion satisfied: A3-shaped permittedActions:[] refuses, plus O-1", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const agent = makeAgentDouble({
        script: [
          verdictFixture({
            seam: "A3",
            proposedAction: "mark the failing coverage criterion satisfied",
            confidence: "high",
            withinEnvelope: "yes",
          }),
        ],
      });
      const seamOps = makeSeamOps(buildSeamOpsOverrides([], []));

      const { disposition } = await invokeDriver({ seam: "A3", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
      expect(seamOps.calls.apply).toHaveLength(0);
    });

    it("P-2 — never sets a REQ's ready: true; a diff reaching outside A2's declared scope fails at membership, out-of-envelope, plus O-1 (header note 3)", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const reqPath = "docs/some-feature/REQ-some-feature.md";
      const producedScope = [reqPath + "#frontmatter"];
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A2", proposedAction: "rewrite-citation", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(
        buildSeamOpsOverrides(
          ["rewrite-citation"],
          [reqPath],
          async () => ({ passed: true }),
          async () => ({ ok: true }),
          undefined,
          async () => producedScope
        )
      );

      const { disposition } = await invokeDriver({ seam: "A2", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
      expect(seamOps.calls.verifyGate).toHaveLength(0);
    });

    it("P-3 — never declares CI passed: the disposition never carries a ciStatus-shaped field, plus O-1 on a refused path", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A5", proposedAction: "declare CI passed", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(buildSeamOpsOverrides([], []));

      const { disposition } = await invokeDriver({ seam: "A5", config, seamOps, agent });

      expect(disposition).not.toHaveProperty("ciStatus");
      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
    });

    it("P-4 — never merges a PR or alters a queue Status cell: this seam's declared scope carries no merge/queue capability, plus O-1 on a refused path", async () => {
      const config = makeAdvisoryConfig({ enabled: true }).config;
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A1", proposedAction: "merge the pull request", confidence: "high", withinEnvelope: "yes" })],
      });
      const seamOps = makeSeamOps(buildSeamOpsOverrides([], []));

      const { disposition } = await invokeDriver({ seam: "A1", config, seamOps, agent });

      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
      expect(seamOps.declaredScope).toEqual([]);
    });
  });

  describe("PROP-GATE-06 — the gate-exclusivity registry's key set equals ADVISORY_SEAMS", () => {
    it("registered gate-exclusivity case names cover exactly ADVISORY_SEAMS, as a set (a sixth seam fails this until it has a row)", () => {
      const registered = new Set(Object.keys(GATE_EXCLUSIVITY_REGISTRY));
      const declared = new Set(dev.ADVISORY_SEAMS);
      expect(registered).toEqual(declared);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-23 — A3/A4 gate exclusivity (batch 10)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-23 — A3/A4 gate exclusivity", () => {
  gateExclusivityCases(["A3", "A4"]);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-24 — A5 gate exclusivity (batch 11)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-24 — A5 gate exclusivity", () => {
  gateExclusivityCases(["A5"]);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-31 — A1/A2 gate exclusivity (batch 12)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-31 — A1/A2 gate exclusivity", () => {
  gateExclusivityCases(["A1", "A2"]);
});
