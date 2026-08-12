// Unit tests for lib/run.mjs — the wiring between the engine and the canonical
// workflow modules. NO model dispatch: every seam is a double.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  WORKFLOW_MODULE_URLS,
  workflowModulePath,
  devInjection,
  queueInjection,
  runDev,
  runQueue,
  runQueueLoop,
} from "../lib/run.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot)); // .../pdlc/engine -> repo root

function fakeAdapter() {
  return {
    _agent: async () => "",
    _parallel: (p) => Promise.all(p),
    _pipeline: async (label, fn) => fn(),
    _phase: () => {},
    _log: () => {},
    _runCommand: async () => ({ ok: true, output: "" }),
    _git: async () => ({ ok: true, stdout: "", stderr: "" }),
    composePrompt: () => "",
  };
}

// ─── AC-1.5: the modules loaded are THIS repo's tested sources ────────────────

test("workflow modules resolve to the repo's canonical pdlc/workflows sources", () => {
  const dev = workflowModulePath("dev");
  const queue = workflowModulePath("queue");

  assert.equal(dev, path.join(repoRoot, "pdlc", "workflows", "orchestrate-dev.js"));
  assert.equal(queue, path.join(repoRoot, "pdlc", "workflows", "orchestrate-queue.js"));
  assert.ok(existsSync(dev), "orchestrate-dev.js must exist at the canonical path");
  assert.ok(existsSync(queue), "orchestrate-queue.js must exist at the canonical path");
});

test("the engine vendors no copy of the workflow modules (C-4)", () => {
  // A fork is a test failure, not a discovery: nothing named like a workflow
  // module may exist anywhere under pdlc/engine (node_modules excluded).
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/^orchestrate-(dev|queue)\.js$/.test(entry.name)) offenders.push(full);
    }
  };
  walk(engineRoot);
  assert.deepEqual(offenders, []);
});

test("module URLs are file: URLs inside the repo's canonical pdlc/workflows/ dir, not package specifiers", () => {
  const workflowsDir = path.join(repoRoot, "pdlc", "workflows") + path.sep;
  for (const url of Object.values(WORKFLOW_MODULE_URLS)) {
    assert.ok(url.startsWith("file://"), url);
    const resolved = fileURLToPath(url);
    assert.ok(
      resolved.startsWith(workflowsDir),
      `${resolved} must resolve under the repo-relative ${workflowsDir}`,
    );
  }
});

// ─── Rule 2: only the seams that MUST be overridden are passed ────────────────

test("devInjection overrides exactly the seven runtime-only seams", () => {
  const keys = Object.keys(devInjection(fakeAdapter())).sort();
  assert.deepEqual(keys, [
    "_agent",
    "_git",
    "_log",
    "_parallel",
    "_phase",
    "_pipeline",
    "_runCommand",
  ]);
});

test("queueInjection overrides exactly the five seams the queue declares", () => {
  const keys = Object.keys(queueInjection(fakeAdapter(), async () => ({}))).sort();
  assert.deepEqual(keys, ["_agent", "_git", "_log", "_phase", "_runPipeline"]);
});

// The branch guard tests seam IDENTITY, not behaviour: `branchGuardTransport`
// (orchestrate-dev.js:3487) returns a transport only when `_git !== defaultGit`,
// so an injection that omits `_git` — or forwards the module's own default —
// makes the guard announce itself inert and skip, and the pipeline then commits
// onto whatever branch the tree happened to be on. Observed live 2026-08-09.
test("devInjection's _git is a function distinct from the module's defaultGit", async () => {
  const injection = devInjection(fakeAdapter());
  const { defaultGit } = await import("../../workflows/orchestrate-dev.js");

  assert.equal(typeof injection._git, "function");
  assert.notEqual(injection._git, defaultGit, "must not forward the module default");

  const { branchGuardTransport } = await import("../../workflows/orchestrate-dev.js");
  assert.equal(
    branchGuardTransport(injection._git),
    injection._git,
    "the branch guard must accept the engine's git seam as an actionable transport"
  );
});

test("queueInjection's _git is likewise an actionable transport", async () => {
  const injection = queueInjection(fakeAdapter(), async () => ({}));
  const { branchGuardTransport } = await import("../../workflows/orchestrate-dev.js");
  assert.equal(branchGuardTransport(injection._git), injection._git);
});

test("an adapter without an _agent seam is refused", () => {
  assert.throws(() => devInjection({}), /_agent seam is required/);
});

// ─── C-10: a failed handshake aborts BEFORE the module import ────────────────

test("runDev refuses and never imports the workflow module when startup failed", async () => {
  let imported = 0;
  const result = await runDev({
    reqPath: "docs/x/REQ-x.md",
    adapter: fakeAdapter(),
    startup: { ok: false, reason: "version handshake (C-10): plugin not found" },
    importWorkflow: async () => {
      imported += 1;
      return {};
    },
  });

  assert.equal(imported, 0, "no workflow module may be imported after a failed handshake");
  assert.equal(result.ok, false);
  assert.equal(result.report, null);
  assert.match(result.refusal, /C-10/);
});

test("runQueue refuses and never imports the workflow modules when startup failed", async () => {
  let imported = 0;
  const result = await runQueue({
    adapter: fakeAdapter(),
    startup: { ok: false, reason: "plugin resolved: not found" },
    importWorkflow: async () => {
      imported += 1;
      return {};
    },
  });

  assert.equal(imported, 0);
  assert.equal(result.ok, false);
  assert.match(result.refusal, /not found/);
});

test("a passing startup does not refuse", async () => {
  let imported = 0;
  await runDev({
    reqPath: "docs/x/REQ-x.md",
    adapter: fakeAdapter(),
    startup: { ok: true, reason: null },
    importWorkflow: async () => {
      imported += 1;
      return { default: async () => ({ outcome: "halted", haltReason: "stub" }) };
    },
  });
  assert.equal(imported, 1);
});

// ─── The entry contract this wiring is bound to ──────────────────────────────

test("runDev forwards reqPath and forcePhases verbatim and returns the module's report", async () => {
  let seen = null;
  const stub = {
    default: async (args) => {
      seen = args;
      return { outcome: "success", feature: "x", phases: [] };
    },
  };

  const result = await runDev({
    reqPath: "docs/x/REQ-x.md",
    forcePhases: "R,F",
    adapter: fakeAdapter(),
    importWorkflow: async () => stub,
  });

  assert.equal(seen.reqPath, "docs/x/REQ-x.md");
  assert.equal(seen.forcePhases, "R,F");
  assert.equal(typeof seen._agent, "function");
  // `_git` IS forwarded — the branch guard skips itself unless the seam is
  // explicitly injected (see the identity tests above).
  assert.equal(typeof seen._git, "function");
  // Every other seam is left to the module's own Node default.
  assert.equal("_readFile" in seen, false);
  assert.equal("_checkFile" in seen, false);
  assert.equal(result.ok, true);
  assert.equal(result.report.outcome, "success");
});

test("runQueue re-attaches the dev seams to the delegated pipeline", async () => {
  // orchestrate-queue.js:1415 calls `_runPipeline({ reqPath })` with NO seams.
  // The engine must therefore wrap it; this asserts the wrapper does so.
  let delegated = null;
  const devStub = {
    default: async (args) => {
      delegated = args;
      return { outcome: "success" };
    },
  };
  const queueStub = {
    default: async ({ _runPipeline }) => {
      await _runPipeline({ reqPath: "docs/y/REQ-y.md" });
      return { outcome: "ran", picked: "y" };
    },
  };

  const result = await runQueue({
    adapter: fakeAdapter(),
    importWorkflow: async (name) => (name === "dev" ? devStub : queueStub),
  });

  assert.equal(delegated.reqPath, "docs/y/REQ-y.md");
  assert.equal(typeof delegated._agent, "function");
  assert.equal(typeof delegated._runCommand, "function");
  assert.equal(result.report.outcome, "ran");
});

test("runQueue forwards queuePath only when given, so the module default applies", async () => {
  let seen = null;
  const queueStub = { default: async (args) => ((seen = args), { outcome: "idle" }) };
  const devStub = { default: async () => ({}) };
  const importWorkflow = async (n) => (n === "dev" ? devStub : queueStub);

  await runQueue({ adapter: fakeAdapter(), importWorkflow });
  assert.equal("queuePath" in seen, false);

  await runQueue({ adapter: fakeAdapter(), queuePath: "docs/_queue/OTHER.md", importWorkflow });
  assert.equal(seen.queuePath, "docs/_queue/OTHER.md");
});

// ─── cwd handling (AC-2.5 / C-3) ─────────────────────────────────────────────

test("the pipeline runs with process.cwd() pinned to the consumer root, then restored", async () => {
  const before = process.cwd();
  let inside = null;
  await runDev({
    reqPath: "docs/x/REQ-x.md",
    cwd: repoRoot,
    adapter: fakeAdapter(),
    importWorkflow: async () => ({
      default: async () => {
        inside = process.cwd();
        return { outcome: "success" };
      },
    }),
  });
  assert.equal(path.resolve(inside), path.resolve(repoRoot));
  assert.equal(process.cwd(), before);
});

test("the previous cwd is restored even when the pipeline throws", async () => {
  const before = process.cwd();
  await assert.rejects(
    runDev({
      reqPath: "docs/x/REQ-x.md",
      cwd: repoRoot,
      adapter: fakeAdapter(),
      importWorkflow: async () => ({
        default: async () => {
          throw new Error("boom");
        },
      }),
    }),
    /boom/
  );
  assert.equal(process.cwd(), before);
});

test("a non-directory consumer root is refused before any import", async () => {
  let imported = 0;
  await assert.rejects(
    runDev({
      reqPath: "docs/x/REQ-x.md",
      cwd: path.join(repoRoot, "definitely-not-here"),
      adapter: fakeAdapter(),
      importWorkflow: async () => (imported++, {}),
    }),
    /not a directory/
  );
  assert.equal(imported, 0);
});

// ─── --loop (AC-1.3, queue.loopIdleExit) ─────────────────────────────────────

test("runQueueLoop repeats while the queue reports 'ran' and stops on 'idle'", async () => {
  const outcomes = ["ran", "ran", "idle"];
  let i = 0;
  const queueStub = { default: async () => ({ outcome: outcomes[i++] }) };
  const devStub = { default: async () => ({}) };

  const { passes, outcome } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: async (n) => (n === "dev" ? devStub : queueStub),
  });

  assert.equal(passes.length, 3);
  assert.equal(outcome, "idle");
});

test("runQueueLoop stops immediately on a halted pass", async () => {
  const queueStub = { default: async () => ({ outcome: "halted", reason: "x" }) };
  const devStub = { default: async () => ({}) };
  const { passes, outcome } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: async (n) => (n === "dev" ? devStub : queueStub),
  });
  assert.equal(passes.length, 1);
  assert.equal(outcome, "halted");
});
