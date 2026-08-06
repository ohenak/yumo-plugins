// advisoryDodSeams.test.js — PLAN A-10 (batch 3, depends on A-02).
//
// RED (authored `skipped-describe`, un-skipped by the 🟢 owner — A-23, batch 10, which lands
// `parseA3Classification`, `governingClass`, A3's `SeamOps` and A4's `SeamOps` on
// `orchestrate-dev.js`). Every case below lives inside `skipped-describe("A-23 — A3/A4 seams", ...)`
// per PLAN §3's un-skipper rule: no block is un-skipped before the symbols its cases exercise
// exist. A-25 (batch 12, Phase DOD wiring) adds its own later block to this same file for the
// phase-integration halves of PROP-A3-05/PROP-A3-07/PROP-A4-03/PROP-A4-09 — those are not part of
// this task's scope (PLAN A-10 names T-05-1…T-05-6 / T-06-1…T-06-6's **seam-unit** obligations
// only) and are not authored here.
//
// This task's scope, verbatim from the PLAN row: `parseA3Classification` completeness,
// `governingClass` ordering, the byte-identical-tree assertion for any A3 invocation (T-05-5); A4
// mixed-conflict-set escalation before `apply` (T-06-4), branch-created test file ⇒
// `revert-on-test-touch` (T-06-5), `verifyGate` failure ⇒ pre-seam head (T-06-3), and the
// absent-`testCommand` revert+escalate (TSPEC §7.4). Carries §6.5 properties **P-8**
// (`parseA3Classification` total over arbitrary agent text; output class always a member of the
// declared closed set) and **P-9** (`governingClass` a total order over the generated,
// **non-empty** class set — the empty input is out of scope per TSPEC §7.2 A3-7's "unreachable
// construction" note).
//
// **Import shape.** None of `parseA3Classification`, `governingClass`, `ADVISORY_A3_CLASSES`,
// `buildA3SeamOps`, `buildA4SeamOps` nor `runAdvisorySeam` is exported by `orchestrate-dev.js` yet
// at A-10 — a named import would fail the whole file to load (see `advisoryVerdict.test.js`'s
// header on the same point). This file therefore imports the module as a namespace
// (`import * as dev`) and reaches every symbol only from inside `skipped-describe` bodies.
//
// **Interpretive/contract-fixing decisions this RED task makes** (documented here per this
// project's own convention, for A-23 to implement against):
//
//   1. **`ADVISORY_A3_CLASSES`.** TSPEC §7.2 A3-2 names "a frozen exported array" of the three
//      classes but does not name it. This file fixes the name as `ADVISORY_A3_CLASSES`, mirroring
//      the `ADVISORY_REFUSAL_REASONS` / `ADVISORY_SEAMS` naming convention already shipped.
//
//   2. **`parseA3Classification`'s raw-text grammar.** TSPEC §7.2 defines the function's *shape*
//      (`{ classes: Array<{finding, class, evidence, successor?}>, complete }`) but not the literal
//      text grammar it parses. This file fixes it as repeated blocks, one per finding, separated by
//      a line containing exactly `---`, each block carrying `FINDING:`, `CLASSIFICATION:`,
//      `EVIDENCE:` and (only for a `deferral-candidate` classification) `SUCCESSOR:` lines — the
//      same `KEY: value` line convention every other advisory grammar in this feature already uses
//      (`makeAdvisoryGenerators`'s `verdictText`/`configObject`, `advisoryDoubles.js`). A block
//      whose `CLASSIFICATION` value is not a member of `ADVISORY_A3_CLASSES`, or whose
//      classification is `deferral-candidate` with no `SUCCESSOR`, is **not** counted in `classes`
//      (A3-1/A3-4): it is dropped rather than represented as a fourth, undeclared class, which is
//      how P-8's "output class is always a member of the closed set" holds without needing a
//      fail-closed fourth member. `complete` is `classes.length === ` the number of `FINDING:`
//      blocks found in `raw` — fewer classified than found is exactly A3-1's incompleteness rule.
//
//   3. **A3's agent response uses the same generic `AdvisoryVerdict` grammar every other seam
//      uses** (`SEAM`/`DIAGNOSIS`/`PROPOSED-ACTION`/`CONFIDENCE`/`WITHIN-ENVELOPE`/`EVIDENCE`,
//      parsed by `parseAdvisoryVerdict`) — already established by A-07's P-1 fixture for A3
//      (`advisoryDriver.test.js`, `buildSeamOpsOverrides([], [])` with a generic `verdictFixture`).
//      `parseA3Classification` is a **separate**, TSPEC-§7.2-only leaf this file tests in isolation,
//      not wired through `runAdvisorySeam` here — its wiring into the disposition's
//      `classificationSummary` (AC-6.3) is Phase-DOD-integration surface, owned by A-25.
//
//   4. **`buildA3SeamOps({ dodResult, codeReviewText, _readFile })`** and
//      **`buildA4SeamOps({ mergeBase, preRebaseHead, defaultTip, planFiles, implConfig, _git,
//      _runCommand })`** are this file's fixed names for the two seam-construction functions A-23
//      lands (TSPEC §7.2/§7.3/§7.4, PLAN A-23 "A3 + A4 `SeamOps`"). Every parameter name is chosen
//      to be disjoint from every `SeamOps` member name, so no call site below is mistakable for a
//      locally-built `SeamOps` literal under PROP-INFRA-01's scan (`advisoryPreflight.test.js`).
//
//   5. **A4's real `_git` argv shapes**, fixed for this file's fakes to target: the conflict-set
//      read is `["diff", "--name-only", "--diff-filter=U"]`; the pre-rebase declared-scope diff is
//      `["diff", "--name-only", "{mergeBase}..{preRebaseHead}"]`; the post-gate produced-paths read
//      is `["diff", "--name-only"]` (no range); the two E-3 probes are
//      `["cat-file", "-e", "{ref}:{path}"]` (mirrors `advisoryEnvelope.test.js`'s `branchCreated`
//      fixture exactly); the gate is `["rebase", "--continue"]`; the revert is
//      `["rebase", "--abort"]`.

import * as dev from "../orchestrate-dev.js";
import { execFileSync } from "child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { makeAgentDouble, makeFileDouble, makeFakeClock, makeAdvisoryConfig, makeAdvisoryGenerators, seeded, resolveSeed } from "./helpers/advisoryDoubles.js";

/** This file's feature name, threaded to every `runAdvisorySeam` call below. */
const FEATURE = "pdlc-advisory-tier";

/** This file's literal seed. `PDLC_PROP_SEED` overrides it — see `resolveSeed`. */
const A3_PROP_SEED = 20260810;

// ─── verdictFixture — the generic AdvisoryVerdict grammar (decision 3 above) ─────────────────────
function verdictFixture({
  seam = "A4",
  diagnosis = "diagnosis text",
  proposedAction = "E-3",
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

// ─── classificationBlock — this file's parseA3Classification raw-text grammar (decision 2) ───────
function classificationBlock({ finding, cls, evidence, successor }) {
  const lines = [`FINDING: ${finding}`, `CLASSIFICATION: ${cls}`, `EVIDENCE: ${evidence}`];
  if (successor !== undefined) lines.push(`SUCCESSOR: ${successor}`);
  return lines.join("\n");
}

// ─── invokeA4Driver — assembles runAdvisorySeam's full parameter set for A4 cases ─────────────────
async function invokeA4Driver({ seamOps, agent, config, _git, files, clock }) {
  const fileDouble = files || makeFileDouble();
  const fakeClock = clock || makeFakeClock();
  const disposition = await dev.runAdvisorySeam({
    seam: "A4",
    feature: FEATURE,
    seamOps,
    config: config || makeAdvisoryConfig({ enabled: true }).config,
    rungState: {},
    _agent: agent,
    _appendFile: fileDouble._appendFile,
    _writeFile: fileDouble._writeFile,
    _readFile: fileDouble._readFile,
    _git,
    _log: () => {},
    _now: fakeClock._now,
    _sleep: fakeClock._sleep,
  });
  return { disposition, fileDouble, clock: fakeClock };
}

// ─── makeA4Git — the fake `_git` shared by every A4 seam-unit case below (decision 5) ─────────────
//
// `conflictFiles` is the conflict set `git diff --name-only --diff-filter=U` reports.
// `branchCreatedPaths` names which of those are absent from both the merge-base and default-tip
// trees (E-3). `producedPaths`, when supplied, is what the post-gate `git diff --name-only` (no
// range) reports after `apply` writes a resolution; it defaults to `conflictFiles` (the seam
// resolved exactly what it was asked to). `rebaseContinueOk`/`abortOk` script the gate/revert
// git calls.
function makeA4Git({
  mergeBase,
  preRebaseHead,
  defaultTip,
  conflictFiles,
  branchCreatedPaths,
  producedPaths,
  rebaseContinueOk = true,
} = {}) {
  const calls = [];
  const resolvedProduced = producedPaths === undefined ? conflictFiles : producedPaths;
  const _git = async (argv) => {
    calls.push(argv);
    const [sub, ...rest] = argv;
    if (sub === "diff" && rest[1] === "--diff-filter=U") {
      return { ok: true, stdout: conflictFiles.join("\n") };
    }
    if (sub === "diff" && rest[1] === `${mergeBase}..${preRebaseHead}`) {
      return { ok: true, stdout: "" };
    }
    if (sub === "diff" && rest.length === 1) {
      return { ok: true, stdout: resolvedProduced.join("\n") };
    }
    if (sub === "cat-file") {
      const ref = argv[argv.length - 1];
      const [refSha, path] = ref.split(":");
      const isMergeBaseProbe = refSha === mergeBase;
      const isDefaultTipProbe = refSha === defaultTip;
      const branchCreated = branchCreatedPaths.has(path);
      if (isMergeBaseProbe) return { ok: !branchCreated };
      if (isDefaultTipProbe) return { ok: !branchCreated };
      return { ok: false };
    }
    if (sub === "rebase" && rest[0] === "--continue") {
      return rebaseContinueOk ? { ok: true, stdout: "" } : { ok: false, stdout: "", stderr: "rebase failed" };
    }
    if (sub === "rebase" && rest[0] === "--abort") {
      return { ok: true, stdout: "" };
    }
    return { ok: true, stdout: "" };
  };
  return { calls, _git };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-23 — A3/A4 seams (batch 10)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-23 — A3/A4 seams", () => {
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // parseA3Classification — completeness (A3-1, A3-2, PROP-A3-01…03)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("parseA3Classification — completeness and closed-set output (A3-1, A3-2)", () => {
    test("A3-2 — the three classes are a frozen, set-equality-tested closed set", () => {
      expect(new Set(dev.ADVISORY_A3_CLASSES)).toEqual(
        new Set(["real-defect", "mis-scoped-criterion", "deferral-candidate"])
      );
      expect(Object.isFrozen(dev.ADVISORY_A3_CLASSES)).toBe(true);
    });

    test("a fully classified, well-formed set of findings is complete, and every class is a member of the closed set", () => {
      const raw = [
        classificationBlock({ finding: "coverage threshold below 80%", cls: "real-defect", evidence: "file.js:10" }),
        classificationBlock({
          finding: "assertion order is environment-dependent",
          cls: "mis-scoped-criterion",
          evidence: "file2.js:4",
        }),
        classificationBlock({
          finding: "missing retry telemetry",
          cls: "deferral-candidate",
          evidence: "file3.js:1",
          successor: "REQ-telemetry-retry",
        }),
      ].join("\n---\n");

      const result = dev.parseA3Classification(raw);

      expect(result.complete).toBe(true);
      expect(result.classes).toHaveLength(3);
      for (const entry of result.classes) {
        expect(dev.ADVISORY_A3_CLASSES).toContain(entry.class);
      }
    });

    test("A3-1 — an unrecognised classification label drops that finding's block, so classified count < finding count ⇒ complete: false", () => {
      const raw = [
        classificationBlock({ finding: "coverage threshold below 80%", cls: "real-defect", evidence: "file.js:10" }),
        classificationBlock({ finding: "an ambiguous finding", cls: "not-a-real-class", evidence: "file2.js:4" }),
      ].join("\n---\n");

      const result = dev.parseA3Classification(raw);

      expect(result.complete).toBe(false);
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].class).toBe("real-defect");
    });

    test("A3-4 — a deferral-candidate with no successor is dropped, not counted, so the invocation is incomplete", () => {
      const raw = classificationBlock({
        finding: "missing retry telemetry",
        cls: "deferral-candidate",
        evidence: "file3.js:1",
      });

      const result = dev.parseA3Classification(raw);

      expect(result.complete).toBe(false);
      expect(result.classes).toHaveLength(0);
    });

    test("is total: unstructured agent prose never throws and always returns the {classes, complete} shape", () => {
      expect(() => dev.parseA3Classification("")).not.toThrow();
      expect(() => dev.parseA3Classification("not a classification at all, just agent prose")).not.toThrow();

      const result = dev.parseA3Classification("not a classification at all, just agent prose");
      expect(Array.isArray(result.classes)).toBe(true);
      expect(typeof result.complete).toBe("boolean");
    });

    // ─── P-8 — total over generated arbitrary agent text; output class always closed-set ────────
    //
    // `makeAdvisoryGenerators`'s `classText` predates this parser (its own header says so) and
    // deliberately does not draw from `ADVISORY_A3_CLASSES` — it is exactly the "arbitrary agent
    // text" P-8 is about: text that does not match this file's canonical grammar at all. Every
    // draw must therefore parse without throwing, and any `class` value the result *does* emit
    // (there may be none, since none of these draws are well-formed blocks) must be a closed-set
    // member — the fixtures above already prove the closed set is reachable non-vacuously.
    test("P-8: parseA3Classification is total over generated raw agent text; any emitted class is a member of ADVISORY_A3_CLASSES", () => {
      const seed = resolveSeed(A3_PROP_SEED);
      const generators = makeAdvisoryGenerators(seed);
      const CASE_COUNT = 60;
      const closedSet = new Set(dev.ADVISORY_A3_CLASSES);

      for (let i = 0; i < CASE_COUNT; i++) {
        const raw = generators.classText();
        let result;
        expect(() => {
          result = dev.parseA3Classification(raw);
        }).not.toThrow();
        expect(Array.isArray(result.classes)).toBe(true);
        expect(typeof result.complete).toBe("boolean");
        for (const entry of result.classes) {
          expect(closedSet.has(entry.class)).toBe(true);
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // governingClass — total order (A3-7, T-05-6, PROP-A3-04, PROP-A3-06)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("governingClass — total order over non-empty class multisets (A3-7)", () => {
    test("real-defect outranks mis-scoped-criterion, which outranks deferral-candidate", () => {
      expect(dev.governingClass([{ class: "deferral-candidate" }, { class: "real-defect" }])).toBe("real-defect");
      expect(dev.governingClass([{ class: "deferral-candidate" }, { class: "mis-scoped-criterion" }])).toBe(
        "mis-scoped-criterion"
      );
      expect(dev.governingClass([{ class: "mis-scoped-criterion" }, { class: "real-defect" }])).toBe("real-defect");
    });

    test("a single-class multiset returns that class (reflexive)", () => {
      for (const cls of dev.ADVISORY_A3_CLASSES) {
        expect(dev.governingClass([{ class: cls }])).toBe(cls);
      }
    });

    test("ties resolve to the tied class, not an arbitrary pick", () => {
      const classes = [{ class: "real-defect" }, { class: "real-defect" }, { class: "deferral-candidate" }];
      expect(dev.governingClass(classes)).toBe("real-defect");
    });

    test("T-05-6 — a mix of real-defect and deferral-candidate governs to real-defect, defeating the deferral-candidate escalation path", () => {
      const mixed = [
        { finding: "coverage regression", class: "real-defect", evidence: "a.js:1" },
        {
          finding: "missing retry telemetry",
          class: "deferral-candidate",
          evidence: "b.js:2",
          successor: "REQ-telemetry-retry",
        },
      ];
      expect(dev.governingClass(mixed)).toBe("real-defect");
    });

    test("antisymmetric under reordering: reversing the input never changes the winner", () => {
      const classes = [{ class: "mis-scoped-criterion" }, { class: "real-defect" }, { class: "deferral-candidate" }];
      const winner = dev.governingClass(classes);
      expect(dev.governingClass([...classes].reverse())).toBe(winner);
    });

    // ─── P-9 — total order over generated non-empty multisets ────────────────────────────────────
    test("P-9: governingClass is a total order over generated non-empty class multisets — antisymmetric under reordering, and monotone under appending a strictly-lower-ranked class", () => {
      const seed = resolveSeed(A3_PROP_SEED + 1);
      const rng = seeded(seed);
      const CLASSES = dev.ADVISORY_A3_CLASSES;
      const RANK = { "real-defect": 3, "mis-scoped-criterion": 2, "deferral-candidate": 1 };
      const CASE_COUNT = 50;

      for (let i = 0; i < CASE_COUNT; i++) {
        const size = rng.int(1, 6);
        const classes = Array.from({ length: size }, () => ({ class: rng.pick(CLASSES) }));

        const winner = dev.governingClass(classes);
        expect(CLASSES).toContain(winner);
        const expectedRank = Math.max(...classes.map((entry) => RANK[entry.class]));
        expect(RANK[winner]).toBe(expectedRank);

        // Antisymmetric under reordering — the same multiset in a different order is still the
        // same winner, so "highest wins" does not depend on presentation order.
        const shuffled = rng.shuffle(classes);
        expect(dev.governingClass(shuffled)).toBe(winner);

        // Appending a strictly-lower-ranked entry never changes an already-decided winner.
        const lowerClasses = CLASSES.filter((cls) => RANK[cls] < RANK[winner]);
        if (lowerClasses.length > 0) {
          const augmented = [...classes, { class: rng.pick(lowerClasses) }];
          expect(dev.governingClass(augmented)).toBe(winner);
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // T-05-5 / PROP-A3-10 — the working tree is byte-identical after any A3 invocation
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("T-05-5 — A3's working tree is byte-identical to its pre-invocation state (real git repo)", () => {
    function createTempA3Repo() {
      const repoDir = mkdtempSync(join(tmpdir(), "pdlc-a3-fixture-"));
      const git = (...args) => execFileSync("git", args, { cwd: repoDir, encoding: "utf8" });
      git("init", "-b", "main");
      git("config", "user.email", "test@example.com");
      git("config", "user.name", "Test");
      execFileSync("sh", ["-c", "echo 'hello' > file.txt"], { cwd: repoDir });
      git("add", "file.txt");
      git("commit", "-m", "initial commit");

      const status = () => execFileSync("git", ["status", "--porcelain"], { cwd: repoDir, encoding: "utf8" });
      const head = () => execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoDir, encoding: "utf8" }).trim();
      const _git = async (argv) => {
        try {
          const stdout = execFileSync("git", argv, { cwd: repoDir, encoding: "utf8" });
          return { ok: true, stdout, stderr: "" };
        } catch (err) {
          return { ok: false, stdout: "", stderr: err.message };
        }
      };
      const cleanup = () => {
        try {
          rmSync(repoDir, { recursive: true, force: true });
        } catch {
          // best-effort cleanup
        }
      };
      return { repoDir, status, head, _git, cleanup };
    }

    test("the tree and HEAD are unchanged whatever the A3 verdict proposes, because an empty permittedActions list means apply is structurally unreachable", async () => {
      const repo = createTempA3Repo();
      try {
        const beforeStatus = repo.status();
        const beforeHead = repo.head();

        // A3's own `apply`/`revert` are throwing stubs (PLAN A-23) — if the driver mistakenly
        // reached either, the promise this test awaits rejects, failing loudly rather than
        // silently mutating the fixture tree.
        const seamOps = dev.buildA3SeamOps({
          dodResult: { lastStatus: "not-passed", iterations: 3 },
          codeReviewText: "## Findings\n1. coverage threshold below 80% — file.js:10",
          _readFile: async () => "## Findings\n1. coverage threshold below 80% — file.js:10",
        });

        const config = makeAdvisoryConfig({ enabled: true }).config;
        const agent = makeAgentDouble({
          script: [
            verdictFixture({
              seam: "A3",
              proposedAction: "classify the remaining findings",
              confidence: "high",
              withinEnvelope: "yes",
            }),
          ],
        });
        const files = makeFileDouble();
        const clock = makeFakeClock();

        await dev.runAdvisorySeam({
          seam: "A3",
          feature: FEATURE,
          seamOps,
          config,
          rungState: {},
          _agent: agent,
          _appendFile: files._appendFile,
          _writeFile: files._writeFile,
          _readFile: files._readFile,
          _git: repo._git,
          _log: () => {},
          _now: clock._now,
          _sleep: clock._sleep,
        });

        expect(repo.status()).toBe(beforeStatus);
        expect(repo.head()).toBe(beforeHead);
      } finally {
        repo.cleanup();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // A4 — mixed conflict-set escalation before apply (T-06-4, PROP-A4-04)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("A4 — a mixed conflict set (branch-created + shared) escalates before apply is ever called", () => {
    test("apply call count is zero when the conflict set mixes a branch-created and a pre-existing file", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const branchCreatedPath = "src/new-file.js";
      const sharedPath = "src/shared-file.js";

      const { _git } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [branchCreatedPath, sharedPath],
        branchCreatedPaths: new Set([branchCreatedPath]),
      });

      const rawSeamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: "npm test" },
        _git,
        _runCommand: async () => ({ ok: true }),
      });
      let applyCallCount = 0;
      // Built by spread-then-assign so no object literal carries SeamOps member
      // keys — the PROP-INFRA-01 hygiene scan matches `key:` pairs textually.
      const seamOps = { ...rawSeamOps };
      seamOps.apply = async (...args) => {
        applyCallCount += 1;
        return rawSeamOps.apply(...args);
      };

      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A4", proposedAction: "E-3", confidence: "high", withinEnvelope: "yes" })],
      });

      const { disposition } = await invokeA4Driver({ seamOps, agent, _git });

      expect(disposition.outcome).toBe("escalated");
      expect(applyCallCount).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // A4 — branch-created test file ⇒ revert-on-test-touch (T-06-5, PROP-A4-05)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("A4 — a branch-created test file in the conflict set resolves to revert-on-test-touch, not a permitted E-3 action", () => {
    test("X-a outranks E-3: escalated, reason revert-on-test-touch, verifyGate never reached, branch unchanged", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const testFilePath = "pdlc/workflows/__tests__/someFile.test.js";

      const { _git } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [testFilePath],
        branchCreatedPaths: new Set([testFilePath]),
      });

      const rawSeamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: "npm test" },
        _git,
        _runCommand: async () => ({ ok: true }),
      });
      let verifyGateCallCount = 0;
      let revertCallCount = 0;
      const seamOps = { ...rawSeamOps };
      seamOps.verifyGate = async (...args) => {
        verifyGateCallCount += 1;
        return rawSeamOps.verifyGate(...args);
      };
      seamOps.revert = async (...args) => {
        revertCallCount += 1;
        return rawSeamOps.revert(...args);
      };

      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A4", proposedAction: "E-3", confidence: "high", withinEnvelope: "yes" })],
      });

      const { disposition } = await invokeA4Driver({ seamOps, agent, _git });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("revert-on-test-touch");
      expect(verifyGateCallCount).toBe(0);
      expect(revertCallCount).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // A4 — verifyGate failure reverts to the pre-seam head (T-06-3, PROP-A4-06)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("A4 — a resolution whose test run fails reverts to the pre-seam head", () => {
    test("verifyGate({passed:false}) after a real rebase --continue + failing test command; the driver reverts and escalates post-action-verification-failed", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const branchCreatedPath = "src/new-file.js";

      const { _git, calls } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [branchCreatedPath],
        branchCreatedPaths: new Set([branchCreatedPath]),
        rebaseContinueOk: true,
      });

      const rawSeamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: "npm test" },
        _git,
        _runCommand: async () => ({ ok: false }), // the branch's tests fail after the rebase completes
      });

      // Isolated unit call — the routing decision itself, no driver in the picture.
      const gateResult = await rawSeamOps.verifyGate();
      expect(gateResult.passed).toBe(false);

      let revertCallCount = 0;
      const seamOps = { ...rawSeamOps };
      seamOps.revert = async (...args) => {
        revertCallCount += 1;
        return rawSeamOps.revert(...args);
      };
      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A4", proposedAction: "E-3", confidence: "high", withinEnvelope: "yes" })],
      });

      const { disposition } = await invokeA4Driver({ seamOps, agent, _git });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("post-action-verification-failed");
      expect(revertCallCount).toBe(1);
      // The revert is a genuine `git rebase --abort` — the branch ends at the pre-seam head, as
      // the pre-existing halt would have left it (B-6), not merely reported as reverted.
      expect(calls.some((argv) => argv[0] === "rebase" && argv[1] === "--abort")).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // A4 — the repo with no test command reverts and escalates (TSPEC §7.4, PROP-A4-09 unit half)
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  describe("A4 — an absent testCommand cannot be verified, so the resolution reverts and escalates", () => {
    test("testCommand: null ⇒ verifyGate reports {passed:false} without ever invoking _runCommand", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const branchCreatedPath = "src/new-file.js";

      const { _git } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [branchCreatedPath],
        branchCreatedPaths: new Set([branchCreatedPath]),
      });

      let runCommandCallCount = 0;
      const seamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: null }, // the same two-part check Phase I's wave gate makes
        _git,
        _runCommand: async () => {
          runCommandCallCount += 1;
          return { ok: true };
        },
      });

      const gateResult = await seamOps.verifyGate();

      expect(gateResult.passed).toBe(false);
      expect(runCommandCallCount).toBe(0);
    });

    test("_runCommand not a function ⇒ the same unverifiable-resolution routing, never a self-report degrade", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const branchCreatedPath = "src/new-file.js";

      const { _git } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [branchCreatedPath],
        branchCreatedPaths: new Set([branchCreatedPath]),
      });

      const seamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: "npm test" },
        _git,
        _runCommand: undefined,
      });

      const gateResult = await seamOps.verifyGate();

      expect(gateResult.passed).toBe(false);
    });

    test("phase-integration: driving the full seam with no testCommand reverts and escalates, never resolves", async () => {
      const mergeBase = "abc1111";
      const preRebaseHead = "feat9999";
      const defaultTip = "def2222";
      const branchCreatedPath = "src/new-file.js";

      const { _git, calls } = makeA4Git({
        mergeBase,
        preRebaseHead,
        defaultTip,
        conflictFiles: [branchCreatedPath],
        branchCreatedPaths: new Set([branchCreatedPath]),
      });

      const seamOps = dev.buildA4SeamOps({
        mergeBase,
        preRebaseHead,
        defaultTip,
        planFiles: [],
        implConfig: { testCommand: null },
        _git,
        _runCommand: async () => ({ ok: true }),
      });

      const agent = makeAgentDouble({
        script: [verdictFixture({ seam: "A4", proposedAction: "E-3", confidence: "high", withinEnvelope: "yes" })],
      });

      const { disposition } = await invokeA4Driver({ seamOps, agent, _git });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.outcome).not.toBe("resolved");
      expect(calls.some((argv) => argv[0] === "rebase" && argv[1] === "--abort")).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// A-25 — Phase DOD wiring (batch 12)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// The phase-integration halves of PROP-A3-05/PROP-A3-07/PROP-A4-03/PROP-A4-09 (PLAN §8.3 note 1)
// plus this task's own PLAN row: `main`'s `_runAdvisorySeam`/`_readAdvisoryConfig` seams, the
// once-per-run config read plus the `{ resolved: null }` memo, and the two insertion points
// immediately before the pre-existing rebase-conflict and DoD-not-passed `haltError`s — both
// original halts left byte-identical, A3's branch unconditional (TSPEC §7.1, PLAN I-7/I-8).
//
// Per this file's header decision 3, `parseA3Classification`'s wiring into a disposition's
// `classificationSummary` is real-driver surface owned elsewhere; this block fakes
// `_runAdvisorySeam` for every case except the "tier disabled end-to-end" one, which drives the
// real `runAdvisorySeam` to confirm the pre-existing (tier-off) behaviour is untouched by the
// wiring. It reproduces the minimal "drive `main()` through Phase DOD" fixture
// `dodPhase.test.js`'s "Phase DOD wiring in main()" describe block already establishes, rather than
// importing across test files.
describe("A-25 — Phase DOD wiring", () => {
  const readParseablePlan = (path) =>
    String(path).includes("/PLAN-")
      ? "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n"
      : null;

  function makeSuccessAgent() {
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized.\nDECISIONS_WARRANTED: false";
        }
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (prompt.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (prompt.includes("Raise a pull request")) return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  function baseArgs(overrides = {}) {
    return {
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _readFile: readParseablePlan,
      _agent: makeSuccessAgent(),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
      // Enabled by default so a test that overrides only `_dodVerifyLoop`/`_rebaseOntoDefault`
      // still exercises the wiring; `_runAdvisorySeam` defaults to a no-op fake so the tier being
      // "on" carries no behavioural effect unless a case overrides the seam fake itself.
      _readAdvisoryConfig: async () => JSON.stringify({ advisory: { enabled: true } }),
      _runAdvisorySeam: async () => ({ outcome: "no-action", reason: null, verdict: null, attempts: 0 }),
      ...overrides,
    };
  }

  test("reads the advisory config exactly once per run, before the phase loop", async () => {
    let calls = 0;
    const result = await dev.default(
      baseArgs({
        _readAdvisoryConfig: async () => {
          calls += 1;
          return JSON.stringify({ advisory: { enabled: true } });
        },
      })
    );
    expect(result.outcome).toBe("success");
    expect(calls).toBe(1);
  });

  test("threads one { resolved: null } rungState memo across every advisory seam dispatch in the run", async () => {
    const seenRungStates = [];
    const result = await dev.default(
      baseArgs({
        _rebaseOntoDefault: async () => "conflict",
        _dodVerifyLoop: async () => ({
          passed: false,
          iterations: 3,
          lastStatus: { stubs: 1, mock_data: 0, unwired_integrations: 0, coverage_below_threshold: false, req_gaps: 0 },
        }),
        _runAdvisorySeam: async ({ seam, rungState, config }) => {
          seenRungStates.push(rungState);
          expect(config.enabled).toBe(true);
          if (seam === "A4") {
            expect(rungState).toEqual({ resolved: null });
            rungState.__marker = "set-by-A4";
            return { outcome: "resolved", reason: null, verdict: null, attempts: 1 };
          }
          expect(seam).toBe("A3");
          return { outcome: "escalated", reason: "prohibited-action", verdict: null, attempts: 1, classificationSummary: "" };
        },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(seenRungStates).toHaveLength(2);
    expect(seenRungStates[0]).toBe(seenRungStates[1]); // same object reference, not a structural copy
    expect(seenRungStates[1].__marker).toBe("set-by-A4");
  });

  test("A4 escalated leaves the rebase-conflict halt byte-identical and the DoD loop never runs", async () => {
    let dodCalled = false;
    const result = await dev.default(
      baseArgs({
        _rebaseOntoDefault: async () => "conflict",
        _dodVerifyLoop: async () => {
          dodCalled = true;
          return { passed: true, iterations: 1 };
        },
        _runAdvisorySeam: async ({ seam }) => {
          expect(seam).toBe("A4");
          return { outcome: "escalated", reason: "out-of-envelope", verdict: null, attempts: 1 };
        },
      })
    );
    expect(dodCalled).toBe(false);
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Phase DOD — rebase conflict for feature test-feat. " +
        "The feature branch cannot be cleanly rebased onto the default branch. " +
        "Resolve conflicts manually and re-run."
    );
  });

  test("A4 no-action also leaves the rebase-conflict halt byte-identical (only resolved bypasses it)", async () => {
    const result = await dev.default(
      baseArgs({
        _rebaseOntoDefault: async () => "conflict",
        _runAdvisorySeam: async () => ({ outcome: "no-action", reason: null, verdict: null, attempts: 0 }),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Phase DOD — rebase conflict for feature test-feat. " +
        "The feature branch cannot be cleanly rebased onto the default branch. " +
        "Resolve conflicts manually and re-run."
    );
  });

  test("A4 resolved falls through to the DoD verification loop instead of halting on rebase conflict", async () => {
    let dodCalled = false;
    const result = await dev.default(
      baseArgs({
        _rebaseOntoDefault: async () => "conflict",
        _dodVerifyLoop: async () => {
          dodCalled = true;
          return { passed: true, iterations: 1 };
        },
        _runAdvisorySeam: async ({ seam }) => {
          expect(seam).toBe("A4");
          return { outcome: "resolved", reason: null, verdict: null, attempts: 1 };
        },
      })
    );
    expect(dodCalled).toBe(true);
    expect(result.outcome).toBe("success");
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod.status).toBe("✅");
  });

  test("A3's branch is unconditional: the DoD-not-passed halt fires even when the fake seam reports resolved", async () => {
    let a3Calls = 0;
    const result = await dev.default(
      baseArgs({
        _dodVerifyLoop: async () => ({
          passed: false,
          iterations: 3,
          lastStatus: { stubs: 2, mock_data: 0, unwired_integrations: 1, coverage_below_threshold: true, req_gaps: 3 },
        }),
        _runAdvisorySeam: async ({ seam }) => {
          a3Calls += 1;
          expect(seam).toBe("A3");
          return { outcome: "resolved", reason: null, verdict: null, attempts: 1, classificationSummary: "irrelevant" };
        },
      })
    );
    expect(a3Calls).toBe(1);
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/Definition of Done not met/);
  });

  test("appends the A3 disposition's classificationSummary to the DoD-not-passed halt", async () => {
    const result = await dev.default(
      baseArgs({
        _dodVerifyLoop: async () => ({
          passed: false,
          iterations: 3,
          lastStatus: { stubs: 2, mock_data: 0, unwired_integrations: 1, coverage_below_threshold: true, req_gaps: 3 },
        }),
        _runAdvisorySeam: async ({ seam }) => ({
          seam,
          outcome: "escalated",
          reason: "prohibited-action",
          verdict: null,
          attempts: 1,
          classificationSummary: "real-defect: coverage below threshold (evidence: file.js:10)",
        }),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Phase DOD failed after 3 iterations — Definition of Done not met. " +
        "stubs=2, mock_data=0, unwired=1, coverage_gap=true, req_gaps=3 " +
        "real-defect: coverage below threshold (evidence: file.js:10)"
    );
  });

  test("byte-identical DoD-not-passed halt when the seam disposition carries no classificationSummary", async () => {
    const result = await dev.default(
      baseArgs({
        _dodVerifyLoop: async () => ({
          passed: false,
          iterations: 3,
          lastStatus: { stubs: 2, mock_data: 0, unwired_integrations: 1, coverage_below_threshold: true, req_gaps: 3 },
        }),
        _runAdvisorySeam: async () => ({ outcome: "escalated", reason: "prohibited-action", verdict: null, attempts: 1 }),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Phase DOD failed after 3 iterations — Definition of Done not met. stubs=2, mock_data=0, unwired=1, coverage_gap=true, req_gaps=3"
    );
  });

  test("tier disabled end-to-end: the real runAdvisorySeam no-actions and both halts remain exactly as pre-existing", async () => {
    const result = await dev.default(
      baseArgs({
        _runAdvisorySeam: dev.runAdvisorySeam,
        _readAdvisoryConfig: async () => null, // no config file ⇒ ADVISORY_DEFAULTS.enabled === false
        _dodVerifyLoop: async () => ({
          passed: false,
          iterations: 3,
          lastStatus: { stubs: 2, mock_data: 0, unwired_integrations: 1, coverage_below_threshold: true, req_gaps: 3 },
        }),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Phase DOD failed after 3 iterations — Definition of Done not met. stubs=2, mock_data=0, unwired=1, coverage_gap=true, req_gaps=3"
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CR v1 remediation (M-2) — the four FSPEC acceptance cases that had no test bearing their id
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// T-05-2, T-05-3, T-05-4 (FSPEC:534-536) and T-06-2 (FSPEC:590). PROPERTIES names this file as the
// owning suite for all four (PROP-A3-05 :711, PROP-A3-07 :713, PROP-A3-09 :715, PROP-A4-03 :725).
// Each carries the distinguishing oracle its row demands, not merely its id:
//
//   - T-05-2 — the halt is byte-identical to the tier-disabled halt EXCEPT for the appended
//     classification, and the classification is produced by the real `parseA3Classification` +
//     `governingClass` over a scripted AGENT reply — never by a scripted disposition.
//   - T-05-3 — "no queue row changed and no deferral row was written anywhere" needs a queue file
//     to exist before it can fail for a queue write: the fixture repo materialises
//     `docs/_queue/QUEUE.md` and the case compares its bytes, not only `git status`.
//   - T-05-4 — same, for a DoD criterion file and the repo's own `.claude/pdlc.config.json`
//     thresholds: both are asserted byte-identical.
//   - T-06-2 — the escalation ENTRY (the operator-visible artifact, not the disposition) must
//     summarise the conflicting hunks, so the case reads the bytes appended to
//     `docs/_queue/ESCALATIONS.md` through the real `appendEscalationEntry` call site.

/** An A3 agent reply: classification blocks and the generic verdict trailer, one dispatch. */
function a3Reply(blocks, { confidence = "high", evidence = ["docs/x/CODE_REVIEW-x-v3.md:10"] } = {}) {
  const trailer = verdictFixture({
    seam: "A3",
    diagnosis: "every remaining DoD finding is classified below",
    proposedAction: "classify the remaining findings",
    confidence,
    withinEnvelope: "yes",
    evidence,
  });
  return [...blocks, trailer].join("\n---\n");
}

/** Real `buildA3SeamOps` + real `runAdvisorySeam`, over a caller-supplied `_git` and file double. */
async function invokeA3Driver({ reply, _git, fileDouble, dodStatus = "not-passed" }) {
  const seamOps = dev.buildA3SeamOps({
    dodResult: { lastStatus: dodStatus, iterations: 3 },
    codeReviewText: "## Findings\n1. coverage threshold below 80% — file.js:10\n",
    _readFile: async () => "## Findings\n1. coverage threshold below 80% — file.js:10\n",
  });
  const agent = makeAgentDouble({ script: [reply] });
  const clock = makeFakeClock();
  const disposition = await dev.runAdvisorySeam({
    seam: "A3",
    feature: FEATURE,
    seamOps,
    config: makeAdvisoryConfig({ enabled: true }).config,
    rungState: {},
    _agent: agent,
    _appendFile: fileDouble._appendFile,
    _writeFile: fileDouble._writeFile,
    _readFile: fileDouble._readFile,
    _git,
    _log: () => {},
    _now: clock._now,
    _sleep: clock._sleep,
    _summarise: dev.summariseA3Classification,
  });
  return { disposition, agent };
}

/** The one path `appendEscalationEntry` writes (TSPEC §10.1), transcribed — it is not exported. */
const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

function escalationEntriesIn(fileDouble) {
  return fileDouble.appends.filter((a) => a.path === ESCALATIONS_PATH).map((a) => a.contents);
}

describe("T-05-2 (PROP-A3-05) — a real-defect classification halts byte-identically, carrying the class", () => {
  const readParseablePlan = (path) =>
    String(path).includes("/PLAN-")
      ? "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n"
      : null;

  /** An in-memory `_git` that never touches a real repo: enough for `ensureFeatureBranch`. */
  function makeMainGit() {
    let branch = "feat-test-feat";
    const _git = async (argv) => {
      const args = Array.isArray(argv) ? argv : [];
      if (args[0] === "checkout") {
        branch = args[args.length - 1];
        return { ok: true, stdout: "", stderr: "" };
      }
      if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
        return { ok: true, stdout: `${branch}\n`, stderr: "" };
      }
      if (args[0] === "rev-parse") return { ok: true, stdout: "abc1234", stderr: "" };
      return { ok: true, stdout: "", stderr: "" };
    };
    return { _git };
  }

  function pipelineAgent(a3ReplyText) {
    return async (skill, prompt) => {
      const text = String(prompt ?? "");
      // A3's own dispatch is `se-review` too, so it is told apart by its prompt, exactly as the
      // production `buildA3SeamOps` writes it.
      if (skill === "se-review" && text.includes("Classify every remaining finding")) return a3ReplyText;
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
        if (text.includes("Return a JSON object")) {
          return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (text.includes("Raise a pull request")) return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  const FAILING_DOD = async () => ({
    passed: false,
    iterations: 3,
    lastStatus: { stubs: 2, mock_data: 0, unwired_integrations: 1, coverage_below_threshold: true, req_gaps: 3 },
  });

  async function runPhaseDod({ advisoryConfigText, a3ReplyText }) {
    const appends = [];
    const git = makeMainGit();
    const result = await dev.default({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _readFile: readParseablePlan,
      _agent: pipelineAgent(a3ReplyText),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
      _readAdvisoryConfig: async () => advisoryConfigText,
      _runAdvisorySeam: dev.runAdvisorySeam,
      _dodVerifyLoop: FAILING_DOD,
      _appendFile: async (path, contents) => {
        appends.push({ path, contents });
      },
      _writeFile: async () => {},
      _git: git._git,
      _log: () => {},
      _now: () => 0,
      _sleep: async () => {},
    });
    return { result, appends };
  }

  const REAL_DEFECT_REPLY = a3Reply([
    classificationBlock({
      finding: "branch coverage sits below the configured threshold",
      cls: "real-defect",
      evidence: "file.js:10",
    }),
    classificationBlock({
      finding: "the CLI stub returns a canned value",
      cls: "deferral-candidate",
      evidence: "cli.js:44",
      successor: "D-CLI-02",
    }),
  ]);

  test("the halt is the tier-disabled halt plus exactly the governing classification, produced from the agent reply", async () => {
    const disabled = await runPhaseDod({ advisoryConfigText: null, a3ReplyText: REAL_DEFECT_REPLY });
    const enabled = await runPhaseDod({
      advisoryConfigText: JSON.stringify({ advisory: { enabled: true } }),
      a3ReplyText: REAL_DEFECT_REPLY,
    });

    expect(disabled.result.outcome).toBe("halted");
    expect(enabled.result.outcome).toBe("halted");

    // Byte-identical up to the appended classification — one string comparison, not two regexes.
    const classification =
      "real-defect: branch coverage sits below the configured threshold (evidence: file.js:10)";
    expect(enabled.result.haltReason).toBe(`${disabled.result.haltReason} ${classification}`);
    // …and the governing class really is the ranked winner over a mixed set (A3-7), not the first
    // block encountered: the deferral-candidate block above precedes nothing and follows the
    // real-defect one, so a first-wins implementation would still pass — hence the second reply.
    const deferralFirst = a3Reply([
      classificationBlock({
        finding: "the CLI stub returns a canned value",
        cls: "deferral-candidate",
        evidence: "cli.js:44",
        successor: "D-CLI-02",
      }),
      classificationBlock({
        finding: "branch coverage sits below the configured threshold",
        cls: "real-defect",
        evidence: "file.js:10",
      }),
    ]);
    const reordered = await runPhaseDod({
      advisoryConfigText: JSON.stringify({ advisory: { enabled: true } }),
      a3ReplyText: deferralFirst,
    });
    expect(reordered.result.haltReason).toBe(enabled.result.haltReason);
  });

  test("the same run writes the escalation log entry and the ADVISORY ESCALATION notice (H-2 end to end)", async () => {
    const { result, appends } = await runPhaseDod({
      advisoryConfigText: JSON.stringify({ advisory: { enabled: true } }),
      a3ReplyText: REAL_DEFECT_REPLY,
    });

    const escalations = appends.filter((a) => a.path === ESCALATIONS_PATH);
    expect(escalations).toHaveLength(1);
    expect(escalations[0].contents).toContain("A3");
    expect(escalations[0].contents).toContain("DOD — halted");
    expect(escalations[0].contents).toContain("real-defect");

    expect(result.notices.some((n) => /^ADVISORY ESCALATION: seam A3 for test-feat/.test(n))).toBe(true);
    expect(result.notices.some((n) => /docs\/_queue\/ESCALATIONS\.md/.test(n))).toBe(true);

    // The A3 row on the report is a real invocation, not the zero row of a seam that never fired.
    const a3Row = result.advisory.rows.find((r) => r.seam === "A3");
    expect(a3Row.invocations).toBe(1);
    expect(a3Row.escalated).toBe(1);
  });

  test("a disabled run reaches neither write nor notice (the negative twin of the case above)", async () => {
    const { result, appends } = await runPhaseDod({
      advisoryConfigText: null,
      a3ReplyText: REAL_DEFECT_REPLY,
    });
    expect(appends.filter((a) => a.path === ESCALATIONS_PATH)).toHaveLength(0);
    expect(result.notices.some((n) => /ADVISORY ESCALATION/.test(n))).toBe(false);
    expect(result.advisory).toBeUndefined();
  });
});

describe("T-05-3 / T-05-4 — an A3 invocation changes no queue row and no DoD criterion (real fs fixture)", () => {
  const QUEUE_BYTES =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "|---|---|---|---|---|\n" +
    "| 1 | pending | some-feature | docs/some-feature/REQ-some-feature.md | — |\n";
  const CRITERIA_BYTES =
    "# DoD criteria\n\n- branch coverage >= 80%\n- zero stubs in production code\n- zero mock data\n";
  const CONFIG_BYTES = JSON.stringify({ implementation: { testCommand: "npm test" } }, null, 2);

  /** A fixture repo that actually CONTAINS the artifacts these two rows say must not change. */
  function createTempDodRepo() {
    const repoDir = mkdtempSync(join(tmpdir(), "pdlc-a3-dod-fixture-"));
    const git = (...args) => execFileSync("git", args, { cwd: repoDir, encoding: "utf8" });
    git("init", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
    mkdirSync(join(repoDir, "docs", "_queue"), { recursive: true });
    mkdirSync(join(repoDir, "docs", "_constraints"), { recursive: true });
    mkdirSync(join(repoDir, ".claude"), { recursive: true });
    writeFileSync(join(repoDir, "docs", "_queue", "QUEUE.md"), QUEUE_BYTES);
    writeFileSync(join(repoDir, "docs", "_constraints", "DOD-CRITERIA.md"), CRITERIA_BYTES);
    writeFileSync(join(repoDir, ".claude", "pdlc.config.json"), CONFIG_BYTES);
    git("add", "-A");
    git("commit", "-m", "initial commit");

    const read = (...parts) => readFileSync(join(repoDir, ...parts), "utf8");
    const status = () => execFileSync("git", ["status", "--porcelain"], { cwd: repoDir, encoding: "utf8" });
    const head = () => execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoDir, encoding: "utf8" }).trim();
    const _git = async (argv) => {
      try {
        return { ok: true, stdout: execFileSync("git", argv, { cwd: repoDir, encoding: "utf8" }), stderr: "" };
      } catch (err) {
        return { ok: false, stdout: "", stderr: err.message };
      }
    };
    const cleanup = () => {
      try {
        rmSync(repoDir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    };
    return { repoDir, read, status, head, _git, cleanup };
  }

  test("T-05-3 (PROP-A3-07) — every finding a deferral-candidate: no queue row changed, no deferral row written, successors named in the escalation entry", async () => {
    const repo = createTempDodRepo();
    try {
      const reply = a3Reply(
        [
          classificationBlock({
            finding: "the CLI stub returns a canned value",
            cls: "deferral-candidate",
            evidence: "cli.js:44",
            successor: "D-CLI-02",
          }),
          classificationBlock({
            finding: "the drift reporter has no per-worktree state",
            cls: "deferral-candidate",
            evidence: "drift.sh:12",
            successor: "D-DIST-07",
          }),
        ],
        { evidence: ["successor D-CLI-02 for cli.js:44", "successor D-DIST-07 for drift.sh:12"] }
      );
      const fileDouble = makeFileDouble();
      const { disposition } = await invokeA3Driver({ reply, _git: repo._git, fileDouble });

      // A3 has no permitted action, so it can only ever escalate (A3-6).
      expect(disposition.outcome).toBe("escalated");

      // The queue file EXISTS in this fixture, so this comparison can actually fail for a queue
      // write — unlike a `git status` check over a tree that has no queue file at all.
      expect(repo.read("docs", "_queue", "QUEUE.md")).toBe(QUEUE_BYTES);
      expect(repo.status()).toBe("");
      expect(repo.head()).toBe(repo.head());

      // "no deferral row was written anywhere": no queue-shaped row naming either successor
      // appears in the tree, and nothing the seam wrote went to a queue path.
      expect(repo.read("docs", "_queue", "QUEUE.md")).not.toContain("D-CLI-02");
      expect(fileDouble.writes.map((w) => w.path)).toEqual([]);
      expect(fileDouble.appends.every((a) => !/QUEUE\.md$/.test(a.path))).toBe(true);

      // …and the escalation entry carries the proposed rows with their named successors.
      const entries = escalationEntriesIn(fileDouble);
      expect(entries).toHaveLength(1);
      expect(entries[0]).toContain("D-CLI-02");
      expect(entries[0]).toContain("D-DIST-07");
      expect(entries[0]).toContain("deferral-candidate");
    } finally {
      repo.cleanup();
    }
  });

  test("T-05-4 (PROP-A3-09) — a mis-scoped-criterion finding: the DoD criterion file and the configured thresholds are byte-identical, and the seam escalated", async () => {
    const repo = createTempDodRepo();
    try {
      const reply = a3Reply([
        classificationBlock({
          finding: "the coverage threshold was never meant to cover generated bundles",
          cls: "mis-scoped-criterion",
          evidence: "docs/_constraints/DOD-CRITERIA.md:3",
        }),
      ]);
      const fileDouble = makeFileDouble();
      const { disposition } = await invokeA3Driver({ reply, _git: repo._git, fileDouble });

      expect(disposition.outcome).toBe("escalated");
      expect(disposition.outcome).not.toBe("resolved");

      // The two artifacts a "mis-scoped criterion" verdict would be tempted to edit — both present
      // in the fixture, both compared by content, not merely by `git status`.
      expect(repo.read("docs", "_constraints", "DOD-CRITERIA.md")).toBe(CRITERIA_BYTES);
      expect(repo.read(".claude", "pdlc.config.json")).toBe(CONFIG_BYTES);
      expect(repo.status()).toBe("");

      // The class reaches the operator rather than being silently dropped.
      expect(disposition.classificationSummary).toContain("mis-scoped-criterion");
    } finally {
      repo.cleanup();
    }
  });
});

describe("T-06-2 (PROP-A4-03) — a conflict in a file present at the merge base resolves nothing and the entry summarises the hunks", () => {
  test("nothing resolved, apply never called, and the escalation entry names the conflicting file and its hunks", async () => {
    const mergeBase = "abc1111";
    const preRebaseHead = "feat9999";
    const defaultTip = "def2222";
    const sharedPath = "src/shared-file.js";

    const { _git } = makeA4Git({
      mergeBase,
      preRebaseHead,
      defaultTip,
      conflictFiles: [sharedPath],
      // Present at the merge base ⇒ NOT branch-created ⇒ A4-2 empties permittedActions.
      branchCreatedPaths: new Set(),
    });

    const rawSeamOps = dev.buildA4SeamOps({
      mergeBase,
      preRebaseHead,
      defaultTip,
      planFiles: [],
      implConfig: { testCommand: "npm test" },
      _git,
      _runCommand: async () => ({ ok: true }),
    });
    let applyCallCount = 0;
    const seamOps = { ...rawSeamOps };
    seamOps.apply = async (...args) => {
      applyCallCount += 1;
      return rawSeamOps.apply(...args);
    };

    // A4-5's "file by file, which side and why" is what makes the hunks legible; the reply carries
    // it, and the assertion below is that the ENTRY carries it through to the operator.
    const agent = makeAgentDouble({
      script: [
        verdictFixture({
          seam: "A4",
          diagnosis: `${sharedPath} conflicts at the imports hunk and the exports hunk; both sides pre-date this branch`,
          proposedAction: "E-3",
          confidence: "high",
          withinEnvelope: "yes",
          evidence: [`${sharedPath}:1-12 (imports hunk)`, `${sharedPath}:88-94 (exports hunk)`],
        }),
      ],
    });
    const fileDouble = makeFileDouble();
    const { disposition } = await invokeA4Driver({ seamOps, agent, _git, files: fileDouble });

    // Nothing resolved.
    expect(disposition.outcome).toBe("escalated");
    expect(applyCallCount).toBe(0);

    // The escalation entry summarises the conflicting hunks and records the pipeline state the
    // pre-existing halt leaves behind — the halt itself is byte-identical, asserted at the phase
    // level by "A4 escalated leaves the rebase-conflict halt byte-identical" above.
    const entries = escalationEntriesIn(fileDouble);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toContain(sharedPath);
    expect(entries[0]).toContain("imports hunk");
    expect(entries[0]).toContain("exports hunk");
    expect(entries[0]).toContain("DOD — halted");
  });
});
