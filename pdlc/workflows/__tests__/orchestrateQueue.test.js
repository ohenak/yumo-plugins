/**
 * Tests for orchestrate-queue.js — the serial queue driver around orchestrate-dev.
 * Covers queue parsing, REQ frontmatter gate, triage verdict parsing, status
 * rewriting, candidate selection, and the end-to-end main() pickup logic.
 */

import main, {
  meta,
  DEFAULT_QUEUE_PATH,
  DRIFT_STATE_PATH,
  parseQueue,
  parseReqFrontmatter,
  parseTriageVerdict,
  updateQueueStatus,
  selectNextPending,
  precheckDependencies,
  triagePrompt,
} from "../orchestrate-queue.js";

// RLH-19: a *namespace* import, deliberately, so this suite can observe whether
// `rewriteStatus` is exported (TSPEC §3.6 — it is not, at HEAD) without a static
// named import. Under native ESM (this package is `"type": "module"` and jest runs
// with `transform: {}`), a static `import { rewriteStatus }` of a name the module
// does not export is a *link-time* SyntaxError that stops the whole suite from
// running. A namespace import yields `undefined` for the missing name instead, so
// the absence is an assertion failure in one test rather than a dead file.
import * as queueModule from "../orchestrate-queue.js";
import { fakeFs, fakeGit } from "./helpers/seams.js";

/**
 * RLH-19: shape-tolerant unwrap of `updateQueueStatus`.
 *
 * TSPEC §4.6 changes the return from a bare string to `{ markdown, matched }`.
 * Call sites below that merely *use* the rewritten markdown as a fixture (rather
 * than asserting the contract) go through this helper so they are correct both
 * before and after `RLH-20` lands the new shape. The contract itself is asserted
 * explicitly, and only, in the `RLH-19` describe block at the end of this file.
 */
function applyQueueStatus(markdown, feature, newStatus) {
  const out = updateQueueStatus(markdown, feature, newStatus);
  return typeof out === "string" ? out : out.markdown;
}

let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => logMessages.push(args.join(" "));
});

afterEach(() => {
  console.log = originalLog;
});

const SAMPLE_QUEUE = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | done | auth-refresh | docs/auth-refresh/REQ-auth-refresh.md | — |
| 2 | pending | notification-v2 | docs/notification-v2/REQ-notification-v2.md | auth-refresh |
| 3 | pending | mobile-push | docs/mobile-push/REQ-mobile-push.md | notification-v2, auth-refresh |
`;

// ─── meta ─────────────────────────────────────────────────────────────────────
describe("meta object", () => {
  it("exports name orchestrate-queue", () => {
    expect(meta.name).toBe("orchestrate-queue");
  });
  it("exposes an optional queuePath input", () => {
    const input = meta.inputs.find((i) => i.name === "queuePath");
    expect(input).toBeTruthy();
    expect(input.required).toBe(false);
  });
  it("defaults the queue path", () => {
    expect(DEFAULT_QUEUE_PATH).toBe("docs/_queue/QUEUE.md");
  });
});

// ─── parseQueue ─────────────────────────────────────────────────────────────
describe("parseQueue", () => {
  it("parses rows into ordered entries", () => {
    const entries = parseQueue(SAMPLE_QUEUE);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      order: 1,
      status: "done",
      feature: "auth-refresh",
      reqPath: "docs/auth-refresh/REQ-auth-refresh.md",
      dependsOn: [],
    });
  });

  it("parses multi-value Depends-On cells", () => {
    const entries = parseQueue(SAMPLE_QUEUE);
    expect(entries[2].dependsOn).toEqual(["notification-v2", "auth-refresh"]);
  });

  it("treats em-dash / none / blank as no dependencies", () => {
    const entries = parseQueue(SAMPLE_QUEUE);
    expect(entries[0].dependsOn).toEqual([]);
  });

  it("ignores the separator row", () => {
    const entries = parseQueue(SAMPLE_QUEUE);
    expect(entries.every((e) => e.feature !== "")).toBe(true);
  });

  it("returns [] on null/garbage input", () => {
    expect(parseQueue(null)).toEqual([]);
    expect(parseQueue("no table here")).toEqual([]);
  });

  it("lower-cases status for comparison while keeping rawStatus", () => {
    const entries = parseQueue(
      "| Status | Feature | REQ Path |\n|--|--|--|\n| Pending | x | docs/x/REQ-x.md |"
    );
    expect(entries[0].status).toBe("pending");
    expect(entries[0].rawStatus).toBe("Pending");
  });
});

// ─── parseReqFrontmatter ─────────────────────────────────────────────────────
describe("parseReqFrontmatter", () => {
  it("reads ready:true and inline depends-on list", () => {
    const text = `---\nfeature: notification-v2\nready: true\ndepends-on: [auth-refresh, sessions]\n---\n# REQ\n`;
    expect(parseReqFrontmatter(text)).toEqual({
      ready: true,
      dependsOn: ["auth-refresh", "sessions"],
      feature: "notification-v2",
    });
  });

  it("reads a YAML block list", () => {
    const text = `---\nready: true\ndepends-on:\n  - auth-refresh\n  - sessions\n---\n`;
    expect(parseReqFrontmatter(text).dependsOn).toEqual([
      "auth-refresh",
      "sessions",
    ]);
  });

  it("reads a comma/space scalar list", () => {
    const text = `---\nready: true\ndepends-on: auth-refresh, sessions\n---\n`;
    expect(parseReqFrontmatter(text).dependsOn).toEqual([
      "auth-refresh",
      "sessions",
    ]);
  });

  it("defaults ready:false when the flag is absent (draft protection)", () => {
    const text = `---\nfeature: x\ndepends-on: -\n---\n`;
    expect(parseReqFrontmatter(text).ready).toBe(false);
  });

  it("defaults ready:false when there is no frontmatter at all", () => {
    expect(parseReqFrontmatter("# Just a heading")).toEqual({
      ready: false,
      dependsOn: [],
      feature: null,
    });
  });

  it("finds the block behind a preamble the file-reading agent prepended", () => {
    const text =
      `Due to the size of this file I cannot return it completely; saved to /tmp/x.txt\n` +
      `---\nfeature: pdlc-workflow-distribution\nready: true\ndepends-on: []\n---\n# REQ\n`;
    expect(parseReqFrontmatter(text)).toEqual({
      ready: true,
      dependsOn: [],
      feature: "pdlc-workflow-distribution",
    });
  });

  it("does not mistake a horizontal rule deep in the body for frontmatter", () => {
    const text = `# REQ\n\n${"filler line\n".repeat(500)}---\nready: true\n---\n`;
    expect(parseReqFrontmatter(text).ready).toBe(false);
  });

  it("treats 'none'/'-' as no dependencies", () => {
    expect(parseReqFrontmatter("---\nready: true\ndepends-on: none\n---\n").dependsOn).toEqual([]);
  });
});

// ─── parseTriageVerdict ──────────────────────────────────────────────────────
describe("parseTriageVerdict", () => {
  it("parses a ready verdict with reason", () => {
    const r = parseTriageVerdict("blah\nTRIAGE: ready deps present in main");
    expect(r.verdict).toBe("ready");
    expect(r.reason).toBe("deps present in main");
  });

  it("parses blocked and needs-human", () => {
    expect(parseTriageVerdict("TRIAGE: blocked dep X not merged").verdict).toBe(
      "blocked"
    );
    expect(parseTriageVerdict("TRIAGE: needs-human ambiguous").verdict).toBe(
      "needs-human"
    );
  });

  it("uses the LAST triage line when several appear", () => {
    const r = parseTriageVerdict(
      "TRIAGE: blocked early\nmore text\nTRIAGE: ready final"
    );
    expect(r.verdict).toBe("ready");
  });

  it("defaults to needs-human when absent or empty (safe default)", () => {
    expect(parseTriageVerdict("no verdict here").verdict).toBe("needs-human");
    expect(parseTriageVerdict("").verdict).toBe("needs-human");
    expect(parseTriageVerdict(null).verdict).toBe("needs-human");
  });
});

// ─── updateQueueStatus ───────────────────────────────────────────────────────
describe("updateQueueStatus", () => {
  it("changes only the targeted feature's status cell", () => {
    const out = applyQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
    const entries = parseQueue(out);
    expect(entries.find((e) => e.feature === "notification-v2").status).toBe(
      "in-progress"
    );
    // others untouched
    expect(entries.find((e) => e.feature === "auth-refresh").status).toBe("done");
    expect(entries.find((e) => e.feature === "mobile-push").status).toBe(
      "pending"
    );
  });

  it("preserves dependency cells through a round-trip", () => {
    const out = applyQueueStatus(SAMPLE_QUEUE, "mobile-push", "awaiting-merge");
    const entry = parseQueue(out).find((e) => e.feature === "mobile-push");
    expect(entry.dependsOn).toEqual(["notification-v2", "auth-refresh"]);
  });

  it("returns input unchanged when the feature is not found", () => {
    expect(applyQueueStatus(SAMPLE_QUEUE, "ghost", "done")).toBe(SAMPLE_QUEUE);
  });
});

// ─── selectNextPending ───────────────────────────────────────────────────────
describe("selectNextPending", () => {
  it("returns pending candidates in order", () => {
    const sel = selectNextPending(parseQueue(SAMPLE_QUEUE));
    expect(sel.kind).toBe("candidates");
    expect(sel.candidates.map((c) => c.feature)).toEqual([
      "notification-v2",
      "mobile-push",
    ]);
  });

  it("flags an in-progress entry as an active blocker", () => {
    const q = applyQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
    const sel = selectNextPending(parseQueue(q));
    expect(sel.kind).toBe("blocked-active");
    expect(sel.entry.feature).toBe("notification-v2");
  });

  it("reports empty when nothing is pending", () => {
    const q = SAMPLE_QUEUE.replace(/pending/g, "done");
    expect(selectNextPending(parseQueue(q)).kind).toBe("empty");
  });
});

// ─── precheckDependencies ────────────────────────────────────────────────────
describe("precheckDependencies", () => {
  const entries = parseQueue(SAMPLE_QUEUE); // auth-refresh:done, notification-v2:pending, mobile-push:pending

  it("blocks when a dependency is present in the queue and not done", () => {
    const r = precheckDependencies(["notification-v2"], entries);
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe(
      "dependency notification-v2 is pending in queue (not done)"
    );
  });

  it("does not block when the dependency is done in the queue", () => {
    expect(precheckDependencies(["auth-refresh"], entries)).toEqual({
      blocked: false,
    });
  });

  it("does not block when the dependency is absent from the queue", () => {
    expect(precheckDependencies(["ghost-feature"], entries)).toEqual({
      blocked: false,
    });
  });

  it("does not block when there are no dependencies", () => {
    expect(precheckDependencies([], entries)).toEqual({ blocked: false });
    expect(precheckDependencies(undefined, entries)).toEqual({ blocked: false });
  });

  it("blocks on the FIRST not-done dependency in a mixed list", () => {
    const q = applyQueueStatus(SAMPLE_QUEUE, "notification-v2", "awaiting-merge");
    const mixed = parseQueue(q);
    // auth-refresh is done, notification-v2 is awaiting-merge → first blocker is notification-v2.
    const r = precheckDependencies(["auth-refresh", "notification-v2"], mixed);
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe(
      "dependency notification-v2 is awaiting-merge in queue (not done)"
    );
  });

  it("passes when every dependency is done or absent (mixed)", () => {
    expect(
      precheckDependencies(["auth-refresh", "ghost-feature"], entries)
    ).toEqual({ blocked: false });
  });
});

// ─── triagePrompt ────────────────────────────────────────────────────────────
describe("triagePrompt", () => {
  it("includes the feature, req path, and declared deps", () => {
    const p = triagePrompt("notification-v2", "docs/notification-v2/REQ-notification-v2.md", [
      "auth-refresh",
    ]);
    expect(p).toContain("notification-v2");
    expect(p).toContain("docs/notification-v2/REQ-notification-v2.md");
    expect(p).toContain("auth-refresh");
    expect(p).toContain("TRIAGE: ready");
  });

  it("says '(none declared)' when there are no deps", () => {
    expect(triagePrompt("x", "docs/x/REQ-x.md", [])).toContain("(none declared)");
  });
});

// ─── main() — end-to-end pickup logic ────────────────────────────────────────
describe("main()", () => {
  // A shape-valid, "everything in sync" drift-state record (T-13, orchestrator-authorized
  // fixture update): these tests predate the drift gate (T-04/T-11/T-12/T-13) and exercise
  // pipeline-selection behavior downstream of it, not the gate itself (that is
  // queueDriftGate.test.js's job) — so every main()-block fixture below supplies a green
  // record at DRIFT_STATE_PATH, letting the gate proceed to the pre-existing QUEUE.md read
  // exactly as it did before the gate was wired.
  const GREEN_DRIFT_STATE = JSON.stringify({
    schemaVersion: 1,
    baselineStatus: "resolved",
    baselineReason: null,
    checkEnabled: true,
    rows: [{ id: "orchestrate-dev", state: "in-sync", reason: null }],
    retiredPresent: [],
    writeFailures: [],
    generatedBy: "hook",
    pluginVersion: "0.10.0",
    syncCommand: null,
  });

  // Build an injectable in-memory filesystem. Every fixture gets a green drift-state record
  // by default (overridable via files[DRIFT_STATE_PATH]) so the gate always proceeds.
  function makeFs(files) {
    const store = { [DRIFT_STATE_PATH]: GREEN_DRIFT_STATE, ...files };
    return {
      store,
      readFile: async (p) => (p in store ? store[p] : null),
      writeFile: async (p, c) => {
        store[p] = c;
      },
    };
  }

  const READY_REQ = "---\nready: true\ndepends-on: [auth-refresh]\n---\n# REQ body\n";
  const DRAFT_REQ = "---\nready: false\n---\n# draft\n";

  it("returns no-queue when the queue file is missing", async () => {
    const fs = makeFs({});
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "success" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(report.outcome).toBe("no-queue");
  });

  it("runs the pipeline for a ready entry and sets awaiting-merge", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: SAMPLE_QUEUE,
      "docs/notification-v2/REQ-notification-v2.md": READY_REQ,
    });
    const runs = [];
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready deps merged",
      _runPipeline: async ({ reqPath }) => {
        runs.push(reqPath);
        return { outcome: "success", feature: "notification-v2" };
      },
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });

    expect(report.outcome).toBe("ran");
    expect(report.picked).toBe("notification-v2");
    expect(runs).toEqual(["docs/notification-v2/REQ-notification-v2.md"]);

    const finalEntry = parseQueue(fs.store[DEFAULT_QUEUE_PATH]).find(
      (e) => e.feature === "notification-v2"
    );
    expect(finalEntry.status).toBe("awaiting-merge");
  });

  it("runs at most ONE pipeline per invocation (serial)", async () => {
    const allReady = SAMPLE_QUEUE; // two pending entries
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: allReady,
      "docs/notification-v2/REQ-notification-v2.md": READY_REQ,
      "docs/mobile-push/REQ-mobile-push.md": READY_REQ,
    });
    let pipelineCalls = 0;
    await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => {
        pipelineCalls += 1;
        return { outcome: "success" };
      },
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(pipelineCalls).toBe(1);
  });

  it("skips a draft REQ (ready:false) and moves to the next candidate", async () => {
    // mobile-push depends only on the done auth-refresh here so the pre-check does
    // not (legitimately) fire on it — the point of this test is the draft skip.
    const queue = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | done | auth-refresh | docs/auth-refresh/REQ-auth-refresh.md | — |
| 2 | pending | notification-v2 | docs/notification-v2/REQ-notification-v2.md | auth-refresh |
| 3 | pending | mobile-push | docs/mobile-push/REQ-mobile-push.md | auth-refresh |
`;
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: queue,
      "docs/notification-v2/REQ-notification-v2.md": DRAFT_REQ,
      "docs/mobile-push/REQ-mobile-push.md": READY_REQ,
    });
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "success" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(report.picked).toBe("mobile-push");
    expect(report.skipped.some((s) => s.feature === "notification-v2")).toBe(true);
  });

  it("skips a blocked entry per triage and reports idle when none are ready", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: SAMPLE_QUEUE,
      "docs/notification-v2/REQ-notification-v2.md": READY_REQ,
      "docs/mobile-push/REQ-mobile-push.md": READY_REQ,
    });
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: blocked dependency not merged",
      _runPipeline: async () => ({ outcome: "success" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(report.outcome).toBe("idle");
    expect(report.picked).toBeUndefined();
    expect(report.skipped).toHaveLength(2);
  });

  it("does not pick up new work while an entry is in-progress", async () => {
    const q = applyQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
    const fs = makeFs({ [DEFAULT_QUEUE_PATH]: q });
    let pipelineCalls = 0;
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => {
        pipelineCalls += 1;
        return { outcome: "success" };
      },
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(report.outcome).toBe("blocked");
    expect(report.active).toBe("notification-v2");
    expect(pipelineCalls).toBe(0);
  });

  it("sets halted status when the pipeline halts", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: SAMPLE_QUEUE,
      "docs/notification-v2/REQ-notification-v2.md": READY_REQ,
    });
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "halted", haltReason: "boom" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(report.outcome).toBe("halted");
    const entry = parseQueue(fs.store[DEFAULT_QUEUE_PATH]).find(
      (e) => e.feature === "notification-v2"
    );
    expect(entry.status).toBe("halted");
  });

  it("persists in-progress before running, then the terminal status after", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: SAMPLE_QUEUE,
      "docs/notification-v2/REQ-notification-v2.md": READY_REQ,
    });
    const seenDuringRun = [];
    await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => {
        // Capture the on-disk status while the pipeline is "running".
        const entry = parseQueue(fs.store[DEFAULT_QUEUE_PATH]).find(
          (e) => e.feature === "notification-v2"
        );
        seenDuringRun.push(entry.status);
        return { outcome: "success" };
      },
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(seenDuringRun).toEqual(["in-progress"]);
  });

  it("pre-check skips a candidate whose queue dep is not done, without spawning triage", async () => {
    // dep-a is awaiting-merge; feat-x depends on it → pre-check blocks (no agent).
    // feat-y has no deps → passes pre-check, gets triaged and picked.
    const queue = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | awaiting-merge | dep-a | docs/dep-a/REQ-dep-a.md | — |
| 2 | pending | feat-x | docs/feat-x/REQ-feat-x.md | dep-a |
| 3 | pending | feat-y | docs/feat-y/REQ-feat-y.md | — |
`;
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: queue,
      "docs/feat-x/REQ-feat-x.md": "---\nready: true\ndepends-on: [dep-a]\n---\n# x\n",
      "docs/feat-y/REQ-feat-y.md": "---\nready: true\n---\n# y\n",
    });

    const agentPrompts = [];
    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async (_skill, prompt) => {
        agentPrompts.push(prompt);
        return "TRIAGE: ready deps merged";
      },
      _runPipeline: async () => ({ outcome: "success" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });

    // feat-x skipped by the deterministic pre-check — no agent spawned for it.
    expect(agentPrompts.some((p) => p.includes("feat-x"))).toBe(false);
    expect(report.skipped.some((s) => s.feature === "feat-x")).toBe(true);
    expect(
      report.skipped.find((s) => s.feature === "feat-x").reason
    ).toContain("blocked (pre-check): dependency dep-a is awaiting-merge");

    // feat-y still triaged (exactly one agent call) and picked.
    expect(agentPrompts).toHaveLength(1);
    expect(agentPrompts[0]).toContain("feat-y");
    expect(report.picked).toBe("feat-y");
  });
});

// ─── RLH-19 — the queue-row write/commit mechanism ───────────────────────────
//
// AT-30…AT-34, **module half only** (PLAN §7.4): the `rewriteStatus` /
// `updateQueueStatus` mechanism itself — the row rewrite, TSPEC §6.5's `_git`
// two-invocation commit, and each commit-failure branch — driven directly
// against `orchestrate-queue.js`. *Which* halting exit of `orchestrate-dev`
// reaches this write is the orchestrator half and belongs to `RLH-25`
// (`RLH-AT-30-orch` …); nothing here asserts it.
//
// Contracts under test:
//   TSPEC §4.6  `updateQueueStatus` returns `{ markdown, matched }`
//   TSPEC §3.6  `rewriteStatus` is **exported**, gains a `_git` parameter,
//               and commits after the write
//   TSPEC §3.5  its return is `{ queueRow, detail? }`, `queueRow` drawn from
//               `QUEUE_ROW_DISPOSITIONS` — "recorded" | "recorded (uncommitted)" |
//               "none" | "error"
//   TSPEC §6.5  exactly two `_git` invocations, `add` then `commit`, both
//               pathspec-scoped to the queue path
//   FSPEC §13.4/§13.5  the three failure dispositions
describe("RLH-19: queue-row write and commit mechanism", () => {
  const QUEUE_PATH = DEFAULT_QUEUE_PATH;

  /** The exported-or-not `rewriteStatus`, read off the namespace (see the import). */
  function rewriteStatusOf() {
    return queueModule.rewriteStatus;
  }

  it("RLH-AT-30-module: an absent row is an error, never a silent no-op", async () => {
    // TSPEC §4.6 — the not-found path stops being indistinguishable from a
    // successful update whose replacement happened to be a no-op.
    const miss = updateQueueStatus(SAMPLE_QUEUE, "ghost", "halted");
    expect(miss).toEqual({ markdown: SAMPLE_QUEUE, matched: false });

    const hit = updateQueueStatus(SAMPLE_QUEUE, "notification-v2", "halted");
    expect(hit).toMatchObject({ matched: true });
    expect(typeof hit.markdown).toBe("string");
    expect(
      parseQueue(hit.markdown).find((e) => e.feature === "notification-v2").status
    ).toBe("halted");

    // FSPEC §13.5 — on `matched: false` `rewriteStatus` writes nothing,
    // performs no git operation, and returns an error result naming the
    // feature, the queue path and the status that was not recorded.
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const fs = fakeFs({ [QUEUE_PATH]: SAMPLE_QUEUE });
    const git = fakeGit();
    const result = await rewriteStatus(
      QUEUE_PATH,
      "ghost",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    expect(fs.writes).toEqual([]);
    expect(git.callCount).toBe(0);
    expect(result).toMatchObject({ queueRow: "error" });
    expect(result.detail).toContain("ghost");
    expect(result.detail).toContain(QUEUE_PATH);
    expect(result.detail).toContain("halted");
    expect(fs.files[QUEUE_PATH]).toBe(SAMPLE_QUEUE);
  });

  it("RLH-AT-31-module: no queue document is 'none', not an error", async () => {
    // FSPEC §14.3 — "No QUEUE.md, or QUEUE.md with no row for this feature"
    // reports `queueRow: "none"`; a direct invocation is never a double failure.
    // The module half is that `rewriteStatus` distinguishes "no document" from
    // §13.5's "document present, row expected, row absent" (RLH-AT-30-module).
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const fs = fakeFs({}); // readFile returns null for the queue path
    const git = fakeGit();
    const result = await rewriteStatus(
      QUEUE_PATH,
      "notification-v2",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    expect(result).toEqual({ queueRow: "none" });
    expect(fs.writes).toEqual([]);
    expect(git.callCount).toBe(0);
  });
  it("RLH-AT-32-module: the row rewrite is re-read, targeted, and committed", async () => {
    // AT-32's module half: `rewriteStatus` is the one function that owns a
    // status write, so the row it leaves on disk is the row the queue reads
    // back — a `halted` row stays `halted` until something calls this function
    // again. (That a *bypass* run never calls it is `RLH-AT-32-orch`'s.)
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const fs = fakeFs({ [QUEUE_PATH]: SAMPLE_QUEUE });
    const git = fakeGit();
    const result = await rewriteStatus(
      QUEUE_PATH,
      "notification-v2",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    // Re-reads at write time rather than trusting a stale snapshot.
    expect(fs.reads.map((r) => r.path)).toEqual([QUEUE_PATH]);

    // Exactly the targeted row moved; every other row is byte-identical.
    const entries = parseQueue(fs.files[QUEUE_PATH]);
    expect(entries.find((e) => e.feature === "notification-v2").status).toBe("halted");
    expect(entries.find((e) => e.feature === "auth-refresh").status).toBe("done");
    expect(entries.find((e) => e.feature === "mobile-push").status).toBe("pending");
    expect(entries.find((e) => e.feature === "mobile-push").dependsOn).toEqual([
      "notification-v2",
      "auth-refresh",
    ]);

    // TSPEC §6.5 — exactly two `_git` invocations, in order, both pathspec-
    // scoped to the queue path after `--`; never `git commit -a`.
    expect(git.commands).toEqual([
      `add -- ${QUEUE_PATH}`,
      `commit -m chore(queue): notification-v2 → halted -- ${QUEUE_PATH}`,
    ]);
    expect(git.calls[1]).toEqual([
      "commit",
      "-m",
      "chore(queue): notification-v2 → halted",
      "--",
      QUEUE_PATH,
    ]);
    expect(git.calls.some((argv) => argv.includes("-a"))).toBe(false);
    expect(git.calls.some((argv) => argv[0] === "push")).toBe(false);

    expect(result).toEqual({ queueRow: "recorded" });
  });

  it("RLH-AT-33-module: a commit failure is non-fatal and surfaced", async () => {
    // FSPEC §13.4 — `git commit` fails (hook rejection, no identity, index
    // lock): the row is correct on disk, the mechanism does not throw, and the
    // result is `"recorded (uncommitted)"` carrying the stderr first line plus
    // the manual-commit instruction. That the *original halt reason* is still
    // reported first is `RLH-AT-33-orch`'s.
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const stderr = "pre-commit hook rejected the commit\nsee .git/hooks/pre-commit";
    const fs = fakeFs({ [QUEUE_PATH]: SAMPLE_QUEUE });
    const git = fakeGit({ commit: { ok: false, stderr } });
    const result = await rewriteStatus(
      QUEUE_PATH,
      "notification-v2",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    expect(result.queueRow).toBe("recorded (uncommitted)");
    expect(typeof result.detail).toBe("string");
    expect(result.detail).toContain("pre-commit hook rejected the commit");
    expect(result.detail).not.toContain("see .git/hooks/pre-commit"); // first line only
    expect(result.detail).toContain(`commit ${QUEUE_PATH} manually`);

    // The row is correct on disk even though its durability was lost.
    expect(
      parseQueue(fs.files[QUEUE_PATH]).find((e) => e.feature === "notification-v2").status
    ).toBe("halted");
    expect(git.callCount).toBe(2);
  });

  it("RLH-AT-33-module: a failing `git add` is surfaced the same way", async () => {
    // FSPEC §13.4's first row — `git add` fails. Same disposition: non-fatal,
    // surfaced, the row already correct on disk.
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const fs = fakeFs({ [QUEUE_PATH]: SAMPLE_QUEUE });
    const git = fakeGit({ add: { ok: false, stderr: "fatal: not a git repository" } });
    const result = await rewriteStatus(
      QUEUE_PATH,
      "notification-v2",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    expect(result.queueRow).toBe("recorded (uncommitted)");
    expect(result.detail).toContain("fatal: not a git repository");
    expect(
      parseQueue(fs.files[QUEUE_PATH]).find((e) => e.feature === "notification-v2").status
    ).toBe("halted");
  });

  it("RLH-AT-34-module: 'nothing to commit' is success, silently", async () => {
    // FSPEC §13.4 / E-39 — the row already read the target status and was
    // already committed, the common case on a re-entry. Idempotence, not an
    // error: `queueRow: "recorded"`, and **no** warning detail.
    const rewriteStatus = rewriteStatusOf();
    expect(typeof rewriteStatus).toBe("function");

    const already = applyQueueStatus(SAMPLE_QUEUE, "notification-v2", "halted");
    const fs = fakeFs({ [QUEUE_PATH]: already });
    const git = fakeGit({
      commit: {
        ok: false,
        stdout: "nothing to commit, working tree clean",
        stderr: "",
      },
    });
    const result = await rewriteStatus(
      QUEUE_PATH,
      "notification-v2",
      "halted",
      fs.readFile,
      fs.writeFile,
      git
    );

    expect(result.queueRow).toBe("recorded");
    expect(result.detail ?? null).toBeNull();
    expect(
      parseQueue(fs.files[QUEUE_PATH]).find((e) => e.feature === "notification-v2").status
    ).toBe("halted");
  });
});
