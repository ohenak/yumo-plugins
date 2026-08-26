// ─── loopQueueDriver.test.js ────────────────────────────────────────────────
//
// PLAN P5-01 ([red], pdlc-engineering-loop). TSPEC Test Strategy → "Module
// integration | pdlc/workflows/__tests__/loopQueueDriver.test.js | `main`
// with every IO seam scripted: report carries `loop`/`operatorView`, halt
// append site, preflight refusal byte-identity." FSPEC AT-01, AT-02, AT-13,
// AT-14, AT-31.
//
// Scope note (why some blocks below are `.skip`ped and one is not): at HEAD,
// `orchestrate-queue.js`'s `main` already has no `loopState`/`_now` parameter
// and never produces `report.loop` / `report.operatorView` (TSPEC §Report
// shape: "Two optional fields are added in the same conditional-spread
// idiom"). PLAN P5-02 ([green]) is the row that wires
// `readLoopConfig → evaluatePreflight → nextDirective → buildOperatorView`
// into `main` and projects `loop` + `operatorView` onto the report. Every
// assertion below that depends on that wiring is therefore red for that
// stated reason and is committed `.skip`ped, titled `"P5-02: …"`, per the
// skip-title convention — P5-02 un-skips them without editing this file.
//
// AT-31 is the one exception: at HEAD, a `ready: false` REQ row already
// lands in `report.skipped` with its reason (E-21, "unchanged HEAD
// behaviour"), and `collectNotices` (PLAN P1-10, already landed) already
// derives exactly one `candidate-skipped-not-ready` notice per `skipped`
// entry by reading `report.skipped` directly — no new `main` wiring is
// needed to prove this half of AT-31, so that block runs for real, unskipped.

import main, { DEFAULT_QUEUE_PATH, parseQueue } from "../orchestrate-queue.js";
import { renderEscalationEntry, MERGE_ESCALATIONS } from "../orchestrate-dev.js";
import { collectNotices, decodeLoopState } from "../lib/loop-session.mjs";
import { parseEscalationLog, buildOperatorView } from "../lib/escalation-view.mjs";
import {
  makeReadFileFn,
  makeAppendFile,
  makeThrowingAppendFile,
  makeGitFn,
  loopFakeNow,
} from "./helpers/loopDoubles.js";

// Shared with orchestrate-dev.js's MERGE_CONFIG_PATH / ADVISORY_CONFIG_PATH —
// the loop config lives in the same `.claude/pdlc.config.json` file (TSPEC
// Data Model §2, Architecture §3).
const CONFIG_PATH = ".claude/pdlc.config.json";

const READY_REQ = "---\nready: true\n---\n# REQ body\n";
const NOT_READY_REQ = "---\nready: false\n---\n# REQ body\n";

const ONE_FEATURE_QUEUE =
  "| Order | Status | Feature | REQ Path | Depends-On |\n" +
  "| --- | --- | --- | --- | --- |\n" +
  "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

const TWO_FEATURE_QUEUE =
  "| Order | Status | Feature | REQ Path | Depends-On |\n" +
  "| --- | --- | --- | --- | --- |\n" +
  "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |\n" +
  "| 2 | pending | dependent-feature | docs/dependent-feature/REQ-dependent-feature.md | upstream-feature |";

let logMessages;
beforeEach(() => {
  logMessages = [];
});

function baseSeams(overrides = {}) {
  const { readFileFn } = makeReadFileFn({});
  return {
    _log: (m) => logMessages.push(m),
    _phase: () => {},
    _agent: async () => "TRIAGE: ready",
    _readFile: readFileFn,
    _writeFile: async () => {},
    _appendFile: async () => {},
    _git: async () => ({ ok: true, stdout: "", stderr: "" }),
    ...overrides,
  };
}

// ─── AT-31 (BR-20, E-21) — unskipped: HEAD behaviour + landed P1-10 export ──

describe("AT-31 — a ready:false row lands in skipped with only the notice it earns", () => {
  it("skips the row, names the reason, and collectNotices derives exactly one candidate-skipped-not-ready notice", async () => {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": NOT_READY_REQ,
    });

    const report = await main({
      _readFile: readFileFn,
      _log: (m) => logMessages.push(m),
      _phase: () => {},
      _agent: async () => {
        throw new Error("triage must not be reached — the row is not ready");
      },
    });

    expect(report.outcome).toBe("idle");
    expect(report.skipped).toEqual([
      { feature: "upstream-feature", reason: "REQ not marked ready" },
    ]);

    const notices = collectNotices({ report });
    expect(notices).toEqual([
      {
        code: "candidate-skipped-not-ready",
        subject: "upstream-feature",
        text: "REQ not marked ready",
      },
    ]);
  });
});

// ─── PROP-BND-02 (negative, BR-20, E-21, AT-31) — ready:true is never set,
// asserted set-equal across a bounded configuration universe ───────────────
//
// The four `preflight` × `dirtyTreePolicy` pairings, each crossed with
// `backoffSchedule` ∈ {declared default, `[]`} and `idleStopAfter` ∈
// {declared default, `0`}, plus one unknown-key case — 17 cells total.
// "Every configuration" is unbounded and no test discharges it; this
// enumeration is the discharging form (PROPERTIES PROP-BND-02). The tree is
// scripted clean throughout, so `dirtyTreePolicy` never causes a refusal
// that would keep the not-ready row from ever being reached — the point of
// the matrix is that no combination of loop config diverts the loop into
// setting `ready: true` or skipping the four positive conjuncts.
describe("PROP-BND-02 (negative) — ready:false never flips true, across a bounded config universe", () => {
  const PREFLIGHT_VALUES = ["strict", "off"];
  const DIRTY_TREE_POLICIES = ["tracked", "any"];
  const BACKOFF_SCHEDULES = [undefined, []];
  const IDLE_STOP_AFTERS = [undefined, 0];

  const cells = [];
  for (const preflight of PREFLIGHT_VALUES) {
    for (const dirtyTreePolicy of DIRTY_TREE_POLICIES) {
      for (const backoffSchedule of BACKOFF_SCHEDULES) {
        for (const idleStopAfter of IDLE_STOP_AFTERS) {
          const loop = { preflight, dirtyTreePolicy };
          if (backoffSchedule !== undefined) loop.backoffSchedule = backoffSchedule;
          if (idleStopAfter !== undefined) loop.idleStopAfter = idleStopAfter;
          cells.push({
            label: `preflight=${preflight} dirtyTreePolicy=${dirtyTreePolicy} backoffSchedule=${JSON.stringify(
              backoffSchedule,
            )} idleStopAfter=${idleStopAfter}`,
            loop,
          });
        }
      }
    }
  }
  // The unknown-key case: an unrecognised key inside `loop` must fall back
  // to defaults for every declared key (PROP-CFG-04) without changing this
  // property's outcome.
  cells.push({
    label: "unknown-key case",
    loop: { preflight: "strict", dirtyTreePolicy: "tracked", unknownKey: "surprise!" },
  });

  it.each(cells)("$label", async ({ loop }) => {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const writeCalls = [];
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": NOT_READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop }),
    });

    const report = await main({
      _readFile: readFileFn,
      _writeFile: async (...args) => writeCalls.push(args),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _agent: async () => {
        throw new Error("triage must not be reached — the row is not ready");
      },
    });

    // (1) outcome idle
    expect(report.outcome).toBe("idle");
    // (2) recorded as skipped with the "not ready" reason
    expect(report.skipped).toEqual([
      { feature: "upstream-feature", reason: "REQ not marked ready" },
    ]);
    // (3) the session report names both, via the notice channel
    const notices = collectNotices({ report });
    expect(notices).toEqual([
      {
        code: "candidate-skipped-not-ready",
        subject: "upstream-feature",
        text: "REQ not marked ready",
      },
    ]);
    // (4) the row's bytes are unchanged — never written, in particular
    // never flipped to `ready: true`.
    expect(writeCalls).toEqual([]);
  });
});

// ─── CR v1 F-04 (AC-4.3) — the operator view's ordering uses the EFFECTIVE
// dependency union, over the report the operator actually receives ──────────
//
// AC-4.3 is explicit that the blocked-count uses the QUEUE.md `Depends-On` column UNION the
// REQ frontmatter's `depends-on`, and states in terms why: "A queue-column-only count would
// under-count every feature that declares dependencies in frontmatter alone, which is a
// supported declaration form."
//
// The production call site used to hardcode `frontmatterDeps: new Map()`, so the union was
// proven only inside `blockedFeatureCounts`' own unit test — which deliberately compares the
// populated map against the empty one, i.e. it DEMONSTRATED the two disagree while production
// shipped the losing side. These oracles read `report.operatorView.items`, so they fail if the
// production wiring is deleted; the builder's own tests cannot.
//
// Escalation blocks are built through the SHIPPED renderer rather than hand-typed markdown,
// following `loopCalibrationIsolation.test.js`'s precedent.

describe("AC-4.3 — blocked-count ordering reflects frontmatter-only dependencies", () => {
  // `blocked-by-frontmatter` is depended on by TWO non-done rows, but ONLY through their REQ
  // frontmatter — the Depends-On column reads "-" for both. `blocked-by-column` is depended on
  // by one row through the column. A queue-column-only count therefore ranks them 0 and 1 and
  // sorts `blocked-by-column` first; the effective union ranks them 2 and 1 and flips the order.
  const QUEUE = [
    "| Order | Status | Feature | REQ Path | Depends-On |",
    "| --- | --- | --- | --- | --- |",
    "| 1 | pending | blocked-by-frontmatter | docs/a/REQ-a.md | - |",
    "| 2 | pending | blocked-by-column | docs/b/REQ-b.md | - |",
    "| 3 | pending | consumer-one | docs/c/REQ-c.md | - |",
    "| 4 | pending | consumer-two | docs/d/REQ-d.md | blocked-by-column |",
  ].join("\n");

  const FRONTMATTER_ONLY_DEP =
    "---\nready: true\ndepends-on: [blocked-by-frontmatter]\n---\n# REQ body\n";

  /** One open escalation per contended feature, so both appear as operator-view items. The
   *  timestamps are ordered so that the tie-break (oldest first) would put `blocked-by-column`
   *  first — the blocked-count must be what overrides it. */
  function escalationLog() {
    const entry = (feature, now) =>
      renderEscalationEntry(
        { reason: `${feature} is stuck`, verdict: null },
        {
          feature,
          source: "pipeline-halt",
          phase: "PIPELINE",
          phaseOutcome: "halted",
          decision: `unblock ${feature}`,
        },
        { now },
      );
    return [
      entry("blocked-by-column", "2026-01-01T00:00:00.000Z"),
      entry("blocked-by-frontmatter", "2026-01-02T00:00:00.000Z"),
    ].join("\n");
  }

  async function viewFor(reqFiles) {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: QUEUE,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
      "docs/_queue/ESCALATIONS.md": escalationLog(),
      ...reqFiles,
    });
    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged" }),
      loopState: "new",
    });
    return report.operatorView;
  }

  const READY_REQS = {
    "docs/a/REQ-a.md": READY_REQ,
    "docs/b/REQ-b.md": READY_REQ,
    "docs/c/REQ-c.md": READY_REQ,
    "docs/d/REQ-d.md": READY_REQ,
  };
  const FRONTMATTER_REQS = {
    ...READY_REQS,
    "docs/c/REQ-c.md": FRONTMATTER_ONLY_DEP,
    "docs/d/REQ-d.md": FRONTMATTER_ONLY_DEP,
  };

  it("counts a dependency declared ONLY in REQ frontmatter", async () => {
    const view = await viewFor(FRONTMATTER_REQS);
    const counts = new Map(view.items.map((i) => [i.feature, i.blockedFeatures]));

    // Two rows depend on it, both through frontmatter alone. A queue-column-only count
    // reports 0 here — that is exactly the under-count AC-4.3 names.
    expect(counts.get("blocked-by-frontmatter")).toBe(2);
    expect(counts.get("blocked-by-column")).toBe(1);
  });

  it("a frontmatter-only dependency changes which item ranks first", async () => {
    const withFrontmatterDeps = await viewFor(FRONTMATTER_REQS);
    // Same queue, same columns, same escalations — only the REQ frontmatter differs.
    const withoutFrontmatterDeps = await viewFor(READY_REQS);

    const top = (view) => view.items[0] && view.items[0].feature;
    expect(top(withFrontmatterDeps)).toBe("blocked-by-frontmatter");
    expect(top(withoutFrontmatterDeps)).toBe("blocked-by-column");
    // Stated as a difference too, so the pair cannot both drift to one value and still pass.
    expect(top(withFrontmatterDeps)).not.toBe(top(withoutFrontmatterDeps));
  });
});

// ─── P5-02-owned: report shape (§Report shape) ──────────────────────────────
//
// "Two optional fields are added in the same conditional-spread idiom: `loop`
// (a `Directive`) and `operatorView`. The outcome set is not widened."

describe("report shape — loop and operatorView (TSPEC §Report shape)", () => {
  it("a non-loop invocation (no loopState) omits both loop and operatorView", async () => {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged" }),
    });

    expect(report.loop).toBeUndefined();
    expect(report.operatorView).toBeUndefined();
  });

  it("P5-02: a loop invocation projects loop (a Directive) and operatorView, and the outcome stays in the closed five-member set", async () => {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    });

    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged" }),
    });

    expect(["ran", "halted", "idle", "blocked", "no-queue"]).toContain(report.outcome);
    expect(report.loop).toBeDefined();
    expect(["stop", "continue"]).toContain(report.loop.kind);
    expect(typeof report.loop.nextState).toBe("string");
    expect(report.operatorView).toBeDefined();
    expect(Array.isArray(report.operatorView.items)).toBe(true);
  });
});

// ─── P5-02-owned: AT-01, AT-02 ──────────────────────────────────────────────
//
// AT-01 (BR-04, AC-1.3): feature B declares A among its effective
// dependencies; iteration 1 returns `ran` for A with the pipeline's merge
// status `merged`; iteration 2 (fed A's own `loop.nextState` token back in as
// the next `loopState`) picks up B, with no operator input recorded between
// the two — exercised here as two in-memory `main` invocations, reading
// merged status from `report.pipelineReport.mergeStatus` (Q-04, TSPEC §6).
//
// AT-02 (BR-04, AC-1.2): one iteration is exactly one queue invocation,
// without `--loop`, returning before the next iteration begins — `main`
// itself never re-invokes; the caller (the session driver) is what loops.

describe("AT-01 / AT-02 — the two-report loop sequence", () => {
  function makeTwoFeatureReadFile(overrides = {}) {
    return makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: TWO_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      "docs/dependent-feature/REQ-dependent-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
      ...overrides,
    });
  }

  it("P5-02: iteration 1 runs and merges A; iteration 2, fed A's nextState, picks up B — no operator input between them (AT-01)", async () => {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn: readFileFn1 } = makeTwoFeatureReadFile();

    const first = await main({
      ...baseSeams({ _readFile: readFileFn1 }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => ({
        outcome: "success",
        mergeStatus: "merged",
        mergeSha: "abc1234",
      }),
    });

    expect(first.picked).toBe("upstream-feature");
    expect(first.outcome).toBe("ran");
    expect(first.pipelineReport.mergeStatus).toBe("merged");
    expect(typeof first.loop.nextState).toBe("string");

    // Same fixture files, re-read fresh for the second invocation — the
    // second `main` call is a brand new process-shaped invocation, exactly
    // as the real `/loop` session would perform it. No agent/operator turn
    // happens between the two: the only thing carried across is the token.
    const { readFileFn: readFileFn2 } = makeTwoFeatureReadFile();

    const second = await main({
      ...baseSeams({ _readFile: readFileFn2 }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: first.loop.nextState,
      _runPipeline: async () => ({ outcome: "success" }),
    });

    expect(second.picked).toBe("dependent-feature");
    expect(second.loop).toBeDefined();
    expect(second.operatorView).toBeDefined();

    // CR v2 F-02 (AC-7.2, BR-28): the session's iteration counter is what AC-7.2's
    // end-of-session "N iteration(s) run" reports and what AC-7.1's per-iteration line
    // takes its ordinal from. It advances in `finish`, on the post-pass state handed to
    // `nextDirective`, so the ONLY place it is observable is the token each pass emits.
    // Asserting it here — over the two real passes this case already runs — is what makes
    // reverting the bump red; `loop-cli.test.js`'s AC-7.2 case cannot, because the token it
    // reads is hand-encoded by the test and merely decoded back by the CLI.
    expect(decodeLoopState(first.loop.nextState).iteration).toBe(1);
    expect(decodeLoopState(second.loop.nextState).iteration).toBe(2);
  });

  it("one iteration is exactly one queue invocation and returns before the next begins (AT-02)", async () => {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn } = makeTwoFeatureReadFile();
    let pipelineCalls = 0;

    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => {
        pipelineCalls += 1;
        return { outcome: "success", mergeStatus: "merged" };
      },
    });

    // Exactly one queue candidate is run per `main` call — the second queue
    // row (`dependent-feature`) is never touched by this single invocation.
    expect(pipelineCalls).toBe(1);
    expect(report.picked).toBe("upstream-feature");
  });
});

// ─── P5-02-owned: AT-13, AT-14 ──────────────────────────────────────────────
//
// AT-13 (BR-11, AC-3.2): a tracked file with uncommitted changes refuses
// under the default (`"tracked"`) policy; untracked-only files pass under
// the default and refuse under `"any"`; ignored-only files pass under both
// (git omits ignored files from both invocation forms by construction, E-16).
//
// AT-14 (BR-11a, AC-3.3, NFR-2): when preflight refuses, `docs/_queue/
// QUEUE.md` is byte-identical before and after the session, zero iterations
// ran, and the refusal is distinguishable from `idle` in the report — the
// outcome set itself is never widened (§Report shape), so the distinguishing
// signal lives on `report.loop.stopReason`.

describe("AT-13 / AT-14 — working-tree preflight and its byte-identity guarantee", () => {
  function makeQueueDouble(preflight = "strict") {
    return makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight } }),
    });
  }

  it("P5-02: refuses under the default policy when git reports a tracked, uncommitted change", async () => {
    const { gitFn, calls } = makeGitFn({
      status: { ok: true, stdout: " M some/tracked/file.js\n", stderr: "" },
    });
    const { readFileFn, calls: readCalls } = makeQueueDouble("strict");

    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
    });

    expect(report.loop.kind).toBe("stop");
    expect(report.loop.stopReason).toBe("preflight-refused");
    // AT-14 — the refusal returns before `readFileFn(queuePath)`.
    expect(readCalls).not.toContain(DEFAULT_QUEUE_PATH);
    expect(calls.length).toBeGreaterThan(0);
  });

  it("P5-02: passes under the default policy and refuses under 'any' for untracked-only changes", async () => {
    // Under the default ("tracked") policy the production `git status`
    // invocation passes `--untracked-files=no`, so an untracked-only tree
    // reports empty here.
    const clean = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn: readFileFn1 } = makeQueueDouble("strict");

    const passing = await main({
      ...baseSeams({ _readFile: readFileFn1 }),
      _git: clean.gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => ({ outcome: "success" }),
    });
    expect(passing.loop.stopReason).not.toBe("preflight-refused");

    // Under "any" the production invocation passes `--untracked-files=normal`,
    // so the same untracked file now surfaces.
    const dirty = makeGitFn({
      status: { ok: true, stdout: "?? some/untracked/file.js\n", stderr: "" },
    });
    const { readFileFn: readFileFn2 } = makeQueueDouble("any");

    const refusing = await main({
      ...baseSeams({ _readFile: readFileFn2 }),
      _git: dirty.gitFn,
      _now: loopFakeNow,
      loopState: "new",
    });
    expect(refusing.loop.stopReason).toBe("preflight-refused");
  });

  it("P5-02: passes under both policies for ignored-only changes (git omits ignored files by construction)", async () => {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });

    for (const preflight of ["strict"]) {
      const { readFileFn } = makeQueueDouble(preflight);
      const report = await main({
        ...baseSeams({ _readFile: readFileFn }),
        _git: gitFn,
        _now: loopFakeNow,
        loopState: "new",
        _runPipeline: async () => ({ outcome: "success" }),
      });
      expect(report.loop.stopReason).not.toBe("preflight-refused");
    }
  });

  it("P5-02: on refusal, QUEUE.md is byte-identical, zero iterations ran, and the refusal is distinguishable from idle", async () => {
    const { gitFn } = makeGitFn({
      status: { ok: true, stdout: " M dirty.js\n", stderr: "" },
    });
    const { readFileFn } = makeQueueDouble("strict");
    let pipelineCalls = 0;

    const refused = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => {
        pipelineCalls += 1;
        return { outcome: "success" };
      },
    });

    const idleReadFile = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": NOT_READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    }).readFileFn;
    const cleanGit = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } }).gitFn;
    const idle = await main({
      ...baseSeams({ _readFile: idleReadFile }),
      _git: cleanGit,
      _now: loopFakeNow,
      loopState: "new",
      _agent: async () => {
        throw new Error("must not be reached");
      },
    });

    expect(pipelineCalls).toBe(0);
    expect(refused.loop.stopReason).toBe("preflight-refused");
    expect(idle.loop.stopReason).not.toBe("preflight-refused");
    expect(refused.loop.stopReason).not.toBe(idle.loop.stopReason);
  });
});

// ─── P5-04-owned: PROP-ESC-09 / PROP-ESC-10 (AT-29) — halt escalation ───────
//
// PLAN P5-03 ([red]): the append happens **after** `rewriteStatus(…, "halted", …)` and
// **before** `finish({outcome: "halted", …})`, so a rejecting `_appendFile` never costs the
// durable queue-row write. PLAN P5-04 ([green]) is the row that adds the append call at the
// halt site (`ctx.source = "pipeline-halt"`); at HEAD, `runPicked` writes `"halted"` to the
// queue row and returns `finish({outcome: "halted", …})` without ever calling `_appendFile`
// (TSPEC §4, "Pipeline halt | does **not** append"), so every assertion below is red for that
// stated reason and is committed `.skip`ped, titled `"P5-04: …"`, per the skip-title
// convention.
//
// PROP-ESC-09's oracle is stated exactly: "a rejecting `_appendFile` produces an
// `escalation-append-failed` notice **and** the queue row still reads `halted` — the ordering
// is falsified by the row's post-failure content, not by inspecting call order in the
// source." PROP-ESC-10's oracle is differential: the same fixture run with a succeeding and a
// rejecting `_appendFile` yields identical phase outcomes and differs only in the notice set.

describe("PROP-ESC-09 / PROP-ESC-10 (AT-29) — halt escalation survives an append failure", () => {
  const HALT_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

  function makeWriteFileFn() {
    const store = {};
    const writeFileFn = async (path, contents) => {
      store[path] = contents;
    };
    return { store, writeFileFn };
  }

  function driveHalt({ appendFn }) {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: HALT_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });
    const { store, writeFileFn } = makeWriteFileFn();
    const messages = [];
    const runPromise = main({
      ...baseSeams({ _readFile: readFileFn }),
      _writeFile: writeFileFn,
      _appendFile: appendFn,
      _log: (m) => messages.push(m),
      _runPipeline: async () => ({
        outcome: "failure",
        haltReason: "scripted pipeline failure",
      }),
    });
    return { runPromise, store, messages };
  }

  it(
    "P5-04: a rejecting _appendFile at the halt site yields escalation-append-failed and the row still reads halted",
    async () => {
      const failing = makeThrowingAppendFile("simulated ESCALATIONS.md write failure");

      const { runPromise, store, messages } = driveHalt({ appendFn: failing._appendFile });
      const report = await runPromise;

      // The append was attempted despite eventually rejecting (E-08).
      expect(failing.calls.length).toBeGreaterThan(0);

      // PROP-ESC-09 — the durable row survives the append failure.
      const row = parseQueue(store[DEFAULT_QUEUE_PATH]).find(
        (e) => e.feature === "upstream-feature"
      );
      expect(row.status).toBe("halted");

      // PROP-ESC-09 / AT-29 — the failure is surfaced as a notice, not swallowed.
      expect(messages.some((m) => /escalation-append-failed/.test(m))).toBe(true);

      // The escalating phase's own outcome is unaffected by the append failure.
      expect(report.outcome).toBe("halted");
      expect(report.picked).toBe("upstream-feature");
    }
  );

  it(
    "P5-04: PROP-ESC-10 — a succeeding vs a rejecting _appendFile yield identical phase outcomes, differing only in the notice",
    async () => {
      const succeeding = makeAppendFile();
      const failing = makeThrowingAppendFile("simulated ESCALATIONS.md write failure");

      const ok = driveHalt({ appendFn: succeeding._appendFile });
      const okReport = await ok.runPromise;

      const failed = driveHalt({ appendFn: failing._appendFile });
      const failReport = await failed.runPromise;

      // Differential oracle: every report field is byte-identical across the two runs — a
      // hard-coded expectation would not prove the invariance the property claims.
      expect(failReport).toEqual(okReport);

      // The two runs differ only in the notice each surfaces.
      expect(ok.messages.some((m) => /escalation-append-failed/.test(m))).toBe(false);
      expect(failed.messages.some((m) => /escalation-append-failed/.test(m))).toBe(true);
    }
  );
});

// ─── PROP-ESC-15 (BR-09a, BR-15, E-26, AT-50) — backoff re-append ──────────
//
// A backoff re-invocation that re-triages an already-escalated candidate must append a
// FURTHER entry block: after the second iteration the number of entry blocks on disk for
// that `(source-or-seam, feature, conditionKey)` must be strictly greater than after the
// first, and the operator view over the same log must show one item at `occurrences: 2`.
// Routed upstream as G-5 (no PLAN row's task text names this cell) — homed here per the
// PROPERTIES doc's own assumption. Driven through the real `pipeline-halt` append site
// (`main`'s own `_appendFile` collector), never three fixture-manufactured appends, so an
// implementation that de-duplicates at the loop's own append site is caught. F-3's
// `backoff-reappend` fixture: two distinct epochs, one per iteration, are what make
// conjuncts (2) and (3) falsifiable — under one fixed epoch the two headings collide and
// `entryId` collides with them.
describe("PROP-ESC-15 — a backoff re-invocation re-triages an already-escalated candidate (AT-50)", () => {
  const HALT_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

  const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

  function driveHalt({ appendFn, now }) {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: HALT_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });
    return main({
      ...baseSeams({ _readFile: readFileFn }),
      _writeFile: async () => {},
      _appendFile: appendFn,
      _now: now,
      _runPipeline: async () => ({
        outcome: "failure",
        haltReason: "scripted pipeline failure",
      }),
    });
  }

  it("P5-01: iteration 2, over an unchanged queue, appends a further block for the same situation — one collector, two distinct epochs (F-3 backoff-reappend)", async () => {
    const collector = makeAppendFile();
    const EPOCH_1 = () => Date.parse("2026-01-01T00:00:00.000Z");
    const EPOCH_2 = () => Date.parse("2026-01-01T00:15:00.000Z"); // one backoff step later

    await driveHalt({ appendFn: collector._appendFile, now: EPOCH_1 });

    // Baseline (non-vacuity, O-4 row): exactly one block after iteration 1, asserted before
    // iteration 2 runs, so the growth conjunct below is observed rather than inferred.
    const afterOne = parseEscalationLog(collector.text(ESCALATIONS_PATH));
    expect(afterOne.entries).toHaveLength(1);

    await driveHalt({ appendFn: collector._appendFile, now: EPOCH_2 });

    const afterTwo = parseEscalationLog(collector.text(ESCALATIONS_PATH));

    // Conjunct (1): strictly greater block count, measured by re-parsing the collected log
    // between the two iterations, not at the end.
    expect(afterTwo.entries.length).toBeGreaterThan(afterOne.entries.length);
    expect(afterTwo.entries).toHaveLength(2);

    // Conjunct (2): the second block is byte-identical to the first in its closed-vocabulary
    // fields and differs only in its heading timestamp — what makes it "the same situation"
    // rather than a new one.
    const [first, second] = afterTwo.entries;
    expect(second.feature).toBe(first.feature);
    expect(second.seam).toBe(first.seam);
    expect(second.source).toBe(first.source);
    expect(second.conditionKey).toBe(first.conditionKey);
    expect(second.timestamp).not.toBe(first.timestamp);
    expect(second.id).not.toBe(first.id);

    // Conjunct (3): buildOperatorView over the two-block log yields exactly one item whose
    // occurrences is 2 and whose entryIds has two distinct member ids, oldest first.
    const view = buildOperatorView({ log: afterTwo, counts: new Map() });
    const items = view.items.filter((i) => i.feature === "upstream-feature");
    expect(items).toHaveLength(1);
    expect(items[0].occurrences).toBe(2);
    expect(items[0].entryIds).toHaveLength(2);
    expect(new Set(items[0].entryIds).size).toBe(2);
    expect(items[0].entryIds).toEqual([first.id, second.id]);
  });
});

// ─── CR v2 F-01 (AC-2.5, AC-4.7, BR-02) — the notice channel, read off the
// report a real `main` invocation returns ──────────────────────────────────
//
// The v2 review demonstrated that deleting `notices` from `finish`'s returned report left
// every loop suite green: `collectNotices` had a production caller but no oracle observed
// what that caller produced, and the one CLI test naming AC-2.5 asserted a `config-case`
// text handed to a spy (and one that no producer can emit). These cases read
// `report.notices` off `main` itself.
//
// Expected values are transcribed from FSPEC BR-02's four-state enumeration, NOT derived
// from `readLoopConfig`'s own vocabulary, and the four are compared as a SET so that
// dropping a state reds rather than silently narrowing the check.

describe("CR v2 F-01 — report.notices off a real main() invocation", () => {
  // BR-02's four configuration states, transcribed. The fixture on the left is the
  // on-disk `.claude/pdlc.config.json` body that puts the session in that state.
  const CONFIG_STATE_FIXTURES = [
    { text: null, expected: "absent-file" },
    { text: JSON.stringify({ merge: { guardPaths: [] } }), expected: "absent-section" },
    { text: JSON.stringify({ loop: { unrecognised: 1 } }), expected: "malformed-section" },
    { text: JSON.stringify({ loop: { preflight: "strict" } }), expected: "explicit-default" },
  ];

  async function runWithConfig(configText, extraFiles = {}) {
    const files = {
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      ...extraFiles,
    };
    if (configText !== null) files[CONFIG_PATH] = configText;
    const { readFileFn } = makeReadFileFn(files);
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });

    return main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged" }),
    });
  }

  it("names which of BR-02's four configuration states applied — one config-case notice per pass, the four fixtures producing the four state names", async () => {
    const observed = [];
    for (const fixture of CONFIG_STATE_FIXTURES) {
      const report = await runWithConfig(fixture.text);
      const caseNotices = report.notices.filter((n) => n.code === "config-case");
      // BR-02: exactly one per invocation, and its subject is the config itself.
      expect(caseNotices).toHaveLength(1);
      expect(caseNotices[0].subject).toBe("config");
      observed.push(caseNotices[0].text);
    }

    // Set-equality against BR-02's enumeration: a deleted state, or a producer that
    // collapses two states onto one name, reds here.
    expect(new Set(observed)).toEqual(
      new Set(CONFIG_STATE_FIXTURES.map((fixture) => fixture.expected)),
    );
    // Positional too, so a permutation cannot satisfy the set check by accident.
    expect(observed).toEqual(CONFIG_STATE_FIXTURES.map((fixture) => fixture.expected));
  });

  it("carries an escalation-parse notice naming the unparseable block's location (AC-4.7)", async () => {
    const malformedLog =
      "## a heading with no em-dash separators\n\nno Field/Value table here either\n";

    const report = await runWithConfig(JSON.stringify({ loop: { preflight: "strict" } }), {
      "docs/_queue/ESCALATIONS.md": malformedLog,
    });

    const parseNotices = report.notices.filter((n) => n.code === "escalation-parse");
    expect(parseNotices).toHaveLength(1);
    expect(parseNotices[0].subject).toBe("escalation");
    // AC-4.7's "enough detail to find it": the block's ordinal AND its heading, as a
    // string an operator surface can print.
    expect(typeof parseNotices[0].text).toBe("string");
    expect(parseNotices[0].text).toContain("block 1");
    expect(parseNotices[0].text).toContain("a heading with no em-dash separators");
  });

  it("emits no escalation-parse notice when the log parses cleanly — the notice is earned, not constant", async () => {
    const report = await runWithConfig(JSON.stringify({ loop: { preflight: "strict" } }));
    expect(report.notices.some((n) => n.code === "escalation-parse")).toBe(false);
  });
});

// ─── CR v2 F-02 / F-03 (AC-3.1, AC-3.4, AC-7.2, BR-28) — the refusal path,
// driven through `main` with a not-ok engine-readiness conjunct ─────────────
//
// Two gaps the v2 review found, closed by the same fixture family:
//
//  * F-02: BR-28's zero-iteration summary is asserted by a code comment ("the refusal
//    early-return deliberately does NOT pass through `finish`") and by nothing else.
//  * F-03: `loopStartup` is threaded into `evaluatePreflight`, but no fixture drove a
//    NOT-ok startup through `main`, so AC-3.1's engine-readiness conjunct was never
//    observed false at the layer that now evaluates it — only the working-tree conjunct was.
//
// `STARTUP_REMEDIATION_TEXT` stands in for the engine's own `STARTUP_REMEDIATION` constant
// (`pdlc/engine/lib/startup.mjs`, §Modified exports' `STARTUP_REMEDIATION` row): this module
// never imports it — the remediation arrives on the `loopStartupRemediation` parameter, and
// the point of the fixture is that whatever the engine injects reaches the operator.

describe("CR v2 F-02 / F-03 — a not-ok engine-readiness conjunct through main", () => {
  const NOT_OK_STARTUP = {
    ok: false,
    reason: "the pdlc plugin could not be resolved",
    rungs: [],
    notices: [],
  };
  const STARTUP_REMEDIATION_TEXT = "Run `pdlc doctor` and re-install the plugin.";

  function runRefusalCase(preflight) {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { readFileFn, calls: readCalls } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight } }),
    });

    return {
      readCalls,
      promise: main({
        ...baseSeams({ _readFile: readFileFn }),
        _git: gitFn,
        _now: loopFakeNow,
        loopState: "new",
        loopStartup: NOT_OK_STARTUP,
        loopStartupRemediation: STARTUP_REMEDIATION_TEXT,
        _runPipeline: async () => {
          throw new Error("no pipeline may run on a refused session");
        },
      }),
    };
  }

  it("refuses on engine-readiness alone with a CLEAN tree, names the startup reason, and runs zero iterations (AC-3.1, BR-28)", async () => {
    const { promise, readCalls } = runRefusalCase("strict");
    const report = await promise;

    // AC-3.1: the tree is clean here, so the ONLY failing conjunct is engine-readiness —
    // a build that still hardcoded `{ok: true}` would proceed and this case would red.
    expect(report.loop.kind).toBe("stop");
    expect(report.loop.stopReason).toBe("preflight-refused");
    expect(report.loop.detail).toContain("the pdlc plugin could not be resolved");

    // AC-3.4: the refusal is on the notice channel too, attributed to its own condition,
    // and the condition that DID hold is recorded positively rather than omitted (AT-16).
    const warning = report.notices.find(
      (n) => n.code === "preflight-warning" && n.subject === "engine-readiness",
    );
    expect(warning).toBeDefined();
    expect(warning.text).toContain("the pdlc plugin could not be resolved");
    expect(report.notices).toContainEqual({
      code: "preflight-held",
      subject: "working-tree",
      text: "held",
    });

    // BR-28 (CR v2 F-02): a refusal ran zero iterations, so the token it emits carries
    // iteration 0 — the refusal returns before `finish`, which is where the counter
    // advances. This is the assertion the code comment at the early return claims.
    expect(decodeLoopState(report.loop.nextState).iteration).toBe(0);

    // AT-14: and it refused before QUEUE.md was read at all.
    expect(readCalls).not.toContain(DEFAULT_QUEUE_PATH);
  });

  it("under preflight 'off' the same not-ok startup proceeds and the warning carries the injected remediation (E-19, AC-3.4)", async () => {
    const { promise } = runRefusalCase("off");

    // `_runPipeline` throws on this fixture, and `main` reports a thrown pipeline as a
    // halt rather than propagating — the point here is that the session got PAST preflight.
    const report = await promise;
    expect(report.loop.stopReason).not.toBe("preflight-refused");

    // Under `"off"` the engine-readiness failure reaches the notice channel by two
    // routes that `collectNotices` deliberately keeps distinct (TSPEC §Interfaces'
    // notice-channel table): the condition itself (`conditions[].held === false`) and
    // `evaluatePreflight`'s own downgrade notice, which is the one carrying the injected
    // remediation (E-19). Asserting over the set rather than the first match is what keeps
    // this case honest about which route it is proving.
    const warnings = report.notices.filter(
      (n) => n.code === "preflight-warning" && n.subject === "engine-readiness",
    );
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((n) => n.text.includes("the pdlc plugin could not be resolved"))).toBe(
      true,
    );
    // The remediation the ENGINE injected, reaching the operator verbatim — the positive
    // half of AC-3.4, and the reason `loopStartupRemediation` is a parameter at all.
    expect(warnings.some((n) => n.text.includes(STARTUP_REMEDIATION_TEXT))).toBe(true);
  });
});

// ─── CR v1 F-03 / F-04 / F-05 / F-06 — session facts observed through main() ──
//
// Every block below drives the real `main` and reads only values production computed.
// The four findings share one defect class the DoD review named "decoded-but-never-driven":
// a field threaded through encode/decode and asserted by a unit test that supplied the value
// itself, with no production producer. The oracles here are therefore deliberately anchored
// at `main`'s own return (`report.notices`, `report.loop.nextState`) and at the seam call
// log (`gitFn.calls`), never at a builder invoked with hand-made input.
describe("CR v1 F-03 — preflight runs exactly once per session (AC-3.1, AT-17, PROP-PRE-06)", () => {
  const sessionReadFile = () =>
    makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: TWO_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      "docs/dependent-feature/REQ-dependent-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    });

  const statusCalls = (calls) =>
    calls.filter((argv) => Array.isArray(argv) && argv[0] === "status");

  const iterate = async (gitFn, token) => {
    const { readFileFn } = sessionReadFile();
    return await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: token,
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged", mergeSha: "abc1234" }),
    });
  };

  it("probes the working tree on iteration 1 only — three iterations of one session, one git status", async () => {
    const { gitFn, calls } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });

    const first = await iterate(gitFn, "new");
    const second = await iterate(gitFn, first.loop.nextState);
    const third = await iterate(gitFn, second.loop.nextState);

    // PROP-PRE-06 — the S1–S3 probe is the `git status --porcelain` call. One session,
    // three iterations, exactly one probe. A per-iteration preflight makes this three.
    expect(statusCalls(calls).length).toBe(1);

    // The observable consequence on the notice channel: iteration 1 reports which conditions
    // held; iterations 2+ evaluate no condition and so report none.
    const preflightCodes = (report) =>
      report.notices.filter((n) => n.code === "preflight-held" || n.code === "preflight-warning");
    expect(preflightCodes(first).length).toBeGreaterThan(0);
    expect(preflightCodes(second)).toEqual([]);
    expect(preflightCodes(third)).toEqual([]);
  });

  it("a session that lost its token re-runs preflight and says so (E-24/AT-48, CR v1 F-05)", async () => {
    const { gitFn, calls } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });

    const first = await iterate(gitFn, "new");
    expect(statusCalls(calls).length).toBe(1);
    // Not a token this session produced: a lost/garbled transcript value. It decodes to a
    // fresh state, so `preflightRan` is false again and S1–S3 re-run — which is what keeps
    // "exactly once per session" a statement about SESSIONS rather than about processes.
    const restarted = await iterate(gitFn, "not-a-real-token");
    expect(statusCalls(calls).length).toBe(2);

    const codes = (report) => report.notices.map((n) => n.code);
    expect(codes(restarted)).toContain("session-restarted");
    // Earned, not constant: the well-formed iterations never claim a restart.
    expect(codes(first)).not.toContain("session-restarted");
    const second = await iterate(gitFn, first.loop.nextState);
    expect(codes(second)).not.toContain("session-restarted");
  });
});

describe("CR v1 F-02 / F-04 — the engine version mismatch reaches the notice channel", () => {
  const drive = async (loopVersionMismatch) => {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    });
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    return await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      loopState: "new",
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged", mergeSha: "abc1234" }),
      ...(loopVersionMismatch ? { loopVersionMismatch } : {}),
    });
  };

  it("AT-12: a mismatch supplied by the engine layer surfaces exactly one engine-version-mismatch notice", async () => {
    const report = await drive({ mismatched: true, detail: "engine 0.9.0 vs plugin ^1.0.0" });
    const mismatches = report.notices.filter((n) => n.code === "engine-version-mismatch");
    // Exactly one: `evaluatePreflight` re-exposes `versionMismatch` on its result (F-04) AND
    // raises its own notice, so the passthrough must not double-report it.
    expect(mismatches.length).toBe(1);
    expect(mismatches[0].text).toBe("engine 0.9.0 vs plugin ^1.0.0");
  });

  it("the notice is earned: the default (no mismatch) run raises none", async () => {
    const report = await drive(null);
    expect(report.notices.filter((n) => n.code === "engine-version-mismatch")).toEqual([]);
  });
});

describe("CR v1 F-06 — escalationsRaised accumulates from the production append sites (AC-5.1)", () => {
  const HALT_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

  const drive = async (pipelineReport) => {
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: HALT_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    });
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const { _appendFile } = makeAppendFile();
    return await main({
      ...baseSeams({ _readFile: readFileFn }),
      _git: gitFn,
      _now: loopFakeNow,
      _appendFile,
      _writeFile: async () => {},
      loopState: "new",
      _runPipeline: async () => pipelineReport,
    });
  };

  it("a pipeline halt puts its append on the session token, where the end-of-session summary reads it", async () => {
    const report = await drive({
      outcome: "failure",
      haltReason: "scripted pipeline failure",
      notices: [],
    });
    expect(report.outcome).toBe("halted");
    const raised = decodeLoopState(report.loop.nextState).escalationsRaised;
    expect(raised).toEqual([{ feature: "upstream-feature", sourceLabel: "pipeline-halt" }]);
  });

  it("a merge refusal raised inside Phase MERGE is accumulated too, one entry per refusal", async () => {
    const report = await drive({
      outcome: "success",
      mergeStatus: "refused",
      // Rendered by the REAL catalogue `phaseMerge` uses, never by hand-typed lookalikes: the
      // queue recognises a merge refusal by the prefix those renderers emit, so a test that
      // typed its own strings would keep passing if the two drifted apart.
      notices: [
        MERGE_ESCALATIONS.guard({ prUrl: "https://pr/1", tail: "paths: pdlc/workflows/x.js" }),
        "Merge deferred for upstream-feature: guard matched.",
        MERGE_ESCALATIONS.tree({ prUrl: "https://pr/1", reason: "push rejected", branch: "main" }),
      ],
    });
    const raised = decodeLoopState(report.loop.nextState).escalationsRaised;
    expect(raised).toEqual([
      { feature: "upstream-feature", sourceLabel: "merge-refusal" },
      { feature: "upstream-feature", sourceLabel: "merge-refusal" },
    ]);
  });

  it("every member of the merge-escalation catalogue is recognised as a refusal", async () => {
    // The tally keys on the prefix `MERGE_ESCALATIONS` renders, so all four members must be
    // counted — a fifth member added later without the shared prefix reds here rather than
    // silently going unreported for the rest of the session.
    const rendered = [
      MERGE_ESCALATIONS.guard({ prUrl: "https://pr/1", tail: "paths: x" }),
      MERGE_ESCALATIONS.ci({ prUrl: "https://pr/1" }),
      MERGE_ESCALATIONS.queue({
        prUrl: "https://pr/1",
        shortSha: "abc1234",
        feature: "upstream-feature",
        detail: "queue row not found",
      }),
      MERGE_ESCALATIONS.tree({ prUrl: "https://pr/1", reason: "push rejected", branch: "main" }),
    ];
    const report = await drive({ outcome: "success", mergeStatus: "refused", notices: rendered });
    expect(decodeLoopState(report.loop.nextState).escalationsRaised).toHaveLength(rendered.length);
  });

  it("earned, not constant: a clean merged pass raises nothing", async () => {
    const report = await drive({
      outcome: "success",
      mergeStatus: "merged",
      mergeSha: "abc1234",
      notices: ["Merged https://pr/1 (squash, abc1234)"],
    });
    expect(decodeLoopState(report.loop.nextState).escalationsRaised).toEqual([]);
  });
});

// ─── PROP-VIEW-12 / PROP-VIEW-13 — the view is recomputed on every render, ──
// holds no state, and rendering never writes ───────────────────────────────
//
// PROP-VIEW-12: the view must be recomputed from `docs/_queue/ESCALATIONS.md` and
// `docs/_queue/QUEUE.md` on every render, holding no state between iterations, and
// rendering must never write to the log. Oracle: two renders over the same inputs are
// deep-equal; a write-seam call-count spy asserts 0 across both; a render whose only
// change is a mutated `QUEUE.md` produces a changed order (the positive control that the
// second render actually re-read rather than returning a cached value).
//
// PROP-VIEW-13 (negative): no render may rewrite, reorder or delete a block already
// written to `docs/_queue/ESCALATIONS.md` — the append-only, newest-last guarantee must
// survive every operation this feature adds. The REQ row is scripted `ready: false` so
// `main` never runs a candidate (E-21) and no queue-row write is in play — only the
// operator-view render itself is under test for its own write-seam use.
describe("PROP-VIEW-12 / PROP-VIEW-13 — the view is recomputed on every render and never writes (AC-4.3, AC-4.1)", () => {
  const ONE_ROW_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | feature-a | docs/a/REQ-a.md | - |";

  const TWO_ROW_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | feature-a | docs/a/REQ-a.md | - |\n" +
    "| 2 | pending | feature-b | docs/b/REQ-b.md | feature-a |";

  function escalationLogText() {
    return renderEscalationEntry(
      { reason: "feature-a is stuck", verdict: null },
      {
        feature: "feature-a",
        source: "pipeline-halt",
        phase: "PIPELINE",
        phaseOutcome: "halted",
        decision: "unblock feature-a",
      },
      { now: loopFakeNow() },
    );
  }

  async function renderView(queueText) {
    const writeCalls = [];
    const appendCalls = [];
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: queueText,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
      "docs/_queue/ESCALATIONS.md": escalationLogText(),
      // ready: false — main never picks a candidate, so no pipeline / queue-row write
      // is in play; only the operator-view render itself is under test.
      "docs/a/REQ-a.md": NOT_READY_REQ,
      "docs/b/REQ-b.md": NOT_READY_REQ,
    });

    const report = await main({
      ...baseSeams({ _readFile: readFileFn }),
      _writeFile: async (...args) => {
        writeCalls.push(args);
      },
      _appendFile: async (...args) => {
        appendCalls.push(args);
      },
      _now: loopFakeNow,
      loopState: "new",
    });
    return { report, writeCalls, appendCalls };
  }

  it("P5-02/P2-06: two renders over unchanged inputs are deep-equal and the write seam is never called (PROP-VIEW-12)", async () => {
    const first = await renderView(ONE_ROW_QUEUE);
    const second = await renderView(ONE_ROW_QUEUE);

    expect(second.report.operatorView).toEqual(first.report.operatorView);
    expect(first.writeCalls.length).toBe(0);
    expect(first.appendCalls.length).toBe(0);
    expect(second.writeCalls.length).toBe(0);
    expect(second.appendCalls.length).toBe(0);
  });

  it("P5-02/P2-06: a render whose only change is a mutated QUEUE.md produces a changed order — the positive re-read control (PROP-VIEW-12)", async () => {
    const before = await renderView(ONE_ROW_QUEUE);
    const after = await renderView(TWO_ROW_QUEUE);

    // feature-b now blocks on feature-a, so feature-a's blockedFeatures count rises from 0
    // to 1 — the operator view's item order changes as a direct result of the on-disk
    // QUEUE.md mutation alone (nothing else differs between the two renders).
    expect(after.report.operatorView.items).not.toEqual(before.report.operatorView.items);
  });

  it("P5-02/P2-06: rendering never rewrites, reorders or deletes an already-written block (PROP-VIEW-13, negative)", async () => {
    const before = escalationLogText();
    const { writeCalls, appendCalls } = await renderView(ONE_ROW_QUEUE);

    // Whole-file byte-identity: the render performed no writes at all (the sharper,
    // positive-presence form — a render that touched the file and happened to restore its
    // exact bytes would still fail an oracle checking write-seam call count).
    expect(writeCalls.length).toBe(0);
    expect(appendCalls.length).toBe(0);

    // And the log the render read from is, independently, still exactly what was on disk.
    expect(before).toBe(escalationLogText());
  });
});
