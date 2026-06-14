/**
 * Tests for orchestrate-queue.js — the serial queue driver around orchestrate-dev.
 * Covers queue parsing, REQ frontmatter gate, triage verdict parsing, status
 * rewriting, candidate selection, and the end-to-end main() pickup logic.
 */

import main, {
  meta,
  DEFAULT_QUEUE_PATH,
  parseQueue,
  parseReqFrontmatter,
  parseTriageVerdict,
  updateQueueStatus,
  selectNextPending,
  triagePrompt,
} from "../orchestrate-queue.js";

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
    const out = updateQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
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
    const out = updateQueueStatus(SAMPLE_QUEUE, "mobile-push", "awaiting-merge");
    const entry = parseQueue(out).find((e) => e.feature === "mobile-push");
    expect(entry.dependsOn).toEqual(["notification-v2", "auth-refresh"]);
  });

  it("returns input unchanged when the feature is not found", () => {
    expect(updateQueueStatus(SAMPLE_QUEUE, "ghost", "done")).toBe(SAMPLE_QUEUE);
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
    const q = updateQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
    const sel = selectNextPending(parseQueue(q));
    expect(sel.kind).toBe("blocked-active");
    expect(sel.entry.feature).toBe("notification-v2");
  });

  it("reports empty when nothing is pending", () => {
    const q = SAMPLE_QUEUE.replace(/pending/g, "done");
    expect(selectNextPending(parseQueue(q)).kind).toBe("empty");
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
  // Build an injectable in-memory filesystem.
  function makeFs(files) {
    const store = { ...files };
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
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: SAMPLE_QUEUE,
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
    const q = updateQueueStatus(SAMPLE_QUEUE, "notification-v2", "in-progress");
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
});
