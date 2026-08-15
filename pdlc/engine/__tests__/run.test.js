// Unit tests for lib/run.mjs — the wiring between the engine and the canonical
// workflow modules. NO model dispatch: every seam is a double.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import {
  WORKFLOW_MODULE_URLS,
  workflowModulePath,
  devInjection,
  queueInjection,
  runDev,
  runQueue,
  runQueueLoop,
  loadDispatchableSkills,
} from "../lib/run.mjs";
import { runPrepack } from "../scripts/prepack.mjs";
import { DISPATCHABLE_SKILLS as DEV_SKILLS } from "../../workflows/orchestrate-dev.js";
import { DISPATCHABLE_SKILLS as QUEUE_SKILLS } from "../../workflows/orchestrate-queue.js";

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

// T41 (TSPEC §5.2): restated in two-root terms. This was true unconditionally
// at HEAD because only one root existed; it is false the moment a vendor root
// resolves, so the vendor-absent case is asserted explicitly (positively —
// the checkout path is asserted, not merely "not the vendor path") rather
// than left to depend on whether `pdlc/engine/vendor/workflows/` happens to
// be absent from the real disk when this test runs.
test("workflow modules resolve to the repo's canonical pdlc/workflows sources when the vendor root does not resolve (TSPEC §5.2)", () => {
  const checkoutRoot = path.join(repoRoot, "pdlc", "workflows");
  const fs = { existsSync: (p) => p.startsWith(checkoutRoot) };

  const dev = workflowModulePath("dev", { fs });
  const queue = workflowModulePath("queue", { fs });

  assert.equal(dev, path.join(repoRoot, "pdlc", "workflows", "orchestrate-dev.js"));
  assert.equal(queue, path.join(repoRoot, "pdlc", "workflows", "orchestrate-queue.js"));
  assert.ok(existsSync(dev), "orchestrate-dev.js must exist at the canonical path");
  assert.ok(existsSync(queue), "orchestrate-queue.js must exist at the canonical path");
});

// TSPEC §5.3, AF-1 — replaces V-05's directory walk. Vendoring (T33) makes a
// build tree legitimately contain `orchestrate-{dev,queue}.js` under
// `vendor/workflows/`, so the walk is false by construction the moment
// `prepack` runs locally. Tracked-ness, read from `git ls-files` and never
// from a directory listing, is strictly stronger against the failure that
// matters: a *committed* fork cannot hide behind `.gitignore` the way a
// build artefact legitimately does.
test("no git-tracked file under pdlc/engine/ is named orchestrate-{dev,queue}.js (C-4, AF-1)", () => {
  const result = spawnSync("git", ["ls-files", "--", "pdlc/engine"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `git ls-files failed: ${result.stderr}`);

  const tracked = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const offenders = tracked.filter((file) => /(^|\/)orchestrate-(dev|queue)\.js$/.test(file));

  assert.deepEqual(offenders, []);
});

// TSPEC §5.3, AF-2 — the property the walk above was only a proxy for, now
// asserted directly and at the byte level. Runs the real `prepack.mjs`
// (rather than a `--dry-run`-shaped stub) so the manifest under test is the
// one a real `npm pack` / `npm publish` would produce; the vendor directory
// is git-ignored build output (§5.2), so it is removed again once the
// assertions have read it.
test("prepack vendors the workflow modules byte-for-byte with a verifiable manifest (AF-2)", () => {
  const tmpRoot = mkdtempSync(path.join(tmpdir(), "pdlc-run-prepack-"));
  const vendorDir = path.join(tmpRoot, "vendor", "workflows");
  const sourceDir = path.join(repoRoot, "pdlc", "workflows");
  try {
    const manifest = runPrepack({ sourceDir, vendorDir, engineVersion: "0.0.0-test" });

    const onDiskManifest = JSON.parse(
      readFileSync(path.join(vendorDir, "VENDOR-MANIFEST.json"), "utf8"),
    );
    assert.deepEqual(onDiskManifest, manifest, "written manifest must match runPrepack's return value");

    // Set-equality, not `length > 0` (§5.3): a prepack that silently
    // vendored nothing, or vendored a third file, must still fail this
    // assertion.
    const names = manifest.modules.map((m) => m.name).sort();
    assert.deepEqual(names, ["orchestrate-dev.js", "orchestrate-queue.js"]);

    for (const entry of manifest.modules) {
      const vendoredBytes = readFileSync(path.join(vendorDir, entry.name));
      const canonicalBytes = readFileSync(path.join(sourceDir, entry.name));
      const vendoredHash = createHash("sha256").update(vendoredBytes).digest("hex");
      const canonicalHash = createHash("sha256").update(canonicalBytes).digest("hex");

      assert.equal(
        entry.sha256,
        vendoredHash,
        `${entry.name}: manifest hash must equal hash of the vendored bytes`,
      );
      assert.equal(
        entry.sha256,
        canonicalHash,
        `${entry.name}: manifest hash must equal the canonical pdlc/workflows/ source's hash`,
      );
      assert.ok(
        vendoredBytes.equals(canonicalBytes),
        `${entry.name}: vendored copy must be byte-for-byte identical to the canonical source`,
      );

      // One-byte-mutation falsifier: prove the byte-for-byte comparison
      // above is actually sensitive to corruption, not vacuously true
      // (e.g. two empty buffers, or a bug that always reports equal).
      const mutatedBytes = Buffer.from(vendoredBytes);
      mutatedBytes[0] ^= 0xff;
      assert.ok(
        !vendoredBytes.equals(mutatedBytes),
        `${entry.name}: a one-byte mutation must be detected as unequal`,
      );
      assert.notEqual(
        createHash("sha256").update(mutatedBytes).digest("hex"),
        entry.sha256,
        `${entry.name}: a one-byte mutation must change the sha256`,
      );
    }
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

// T41 (TSPEC §5.2, PROP-PACK-7): `WORKFLOW_MODULE_URLS` became a function —
// a resolved root, not a fixed frozen object — so `Object.entries(...)` on
// the export ITSELF would now silently iterate zero entries (a function's
// own enumerable properties), turning this into a zero-assertion pass at
// exactly the moment vendoring makes it load-bearing. The non-zero member
// count is asserted before the per-member equality for that reason.
test("module URLs resolve to the exact repo-relative pdlc/workflows/ path, not just a file: URL (PROP-FORK-1)", () => {
  // Stronger than "starts with file://": each resolved specifier must equal
  // the repo-relative orchestrate-{dev,queue}.js path exactly, so a fork
  // sitting anywhere else under pdlc/workflows/ (or elsewhere) fails closed.
  const checkoutRoot = path.join(repoRoot, "pdlc", "workflows");
  const fs = { existsSync: (p) => p.startsWith(checkoutRoot) };
  const expected = {
    dev: path.join(repoRoot, "pdlc", "workflows", "orchestrate-dev.js"),
    queue: path.join(repoRoot, "pdlc", "workflows", "orchestrate-queue.js"),
  };
  const urls = WORKFLOW_MODULE_URLS({ fs });
  const entries = Object.entries(urls);
  // PROP-PACK-7: a lazily-computed shape must not turn this oracle into a
  // zero-assertion pass.
  assert.equal(entries.length, 2, "WORKFLOW_MODULE_URLS() must resolve both module URLs");
  for (const [name, url] of entries) {
    assert.ok(url.startsWith("file://"), url);
    assert.equal(fileURLToPath(url), expected[name]);
  }
});

// ─── Rule 2: only the seams that MUST be overridden are passed ────────────────

test("devInjection overrides exactly the eight runtime-only seams", () => {
  const keys = Object.keys(devInjection(fakeAdapter())).sort();
  assert.deepEqual(keys, [
    "_agent",
    "_git",
    "_log",
    "_parallel",
    "_phase",
    "_pipeline",
    "_provenance",
    "_runCommand",
  ]);
});

test("queueInjection overrides exactly the six seams the queue declares", () => {
  const keys = Object.keys(queueInjection(fakeAdapter(), async () => ({}))).sort();
  assert.deepEqual(keys, ["_agent", "_git", "_log", "_phase", "_provenance", "_runPipeline"]);
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

// BR-LOOP-4 (TSPEC §4.5, PROP-QUEUE-6): a halted pass no longer stops the
// loop — the queue's own row already records the halt, so the loop continues
// to the next ready feature and only stops once the queue exhausts.
test("runQueueLoop continues past a halted pass and stops on the following idle", async () => {
  const outcomes = ["halted", "ran", "idle"];
  let i = 0;
  const queueStub = { default: async () => ({ outcome: outcomes[i++] }) };
  const devStub = { default: async () => ({}) };
  const { passes, outcome, stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: async (n) => (n === "dev" ? devStub : queueStub),
  });
  assert.equal(passes.length, 3, "a subsequent iteration must run after the halt");
  assert.equal(passes[0].report.outcome, "halted");
  assert.equal(outcome, "idle");
  assert.equal(stopReason, "exhausted");
});

// ─── loadDispatchableSkills (TSPEC §3.3 / R-ARCH-1) ──────────────────────────

test("loadDispatchableSkills returns the union of both modules' DISPATCHABLE_SKILLS, sorted, deduped", async () => {
  const identifiers = await loadDispatchableSkills();

  const expected = [...new Set([...DEV_SKILLS, ...QUEUE_SKILLS])].sort();
  assert.deepEqual(identifiers, expected);
  // se-review is reached only through the queue's delegated pipeline / advisory
  // seam (TSPEC §3.3), so it must survive the union even though it is not a
  // queue-module dispatch call site directly.
  assert.ok(identifiers.includes("se-review"));
});

test("loadDispatchableSkills honours the importWorkflow seam (no real import required)", async () => {
  const devStub = { DISPATCHABLE_SKILLS: ["b", "a"] };
  const queueStub = { DISPATCHABLE_SKILLS: ["a", "c"] };
  const identifiers = await loadDispatchableSkills({
    importWorkflow: async (n) => (n === "dev" ? devStub : queueStub),
  });
  assert.deepEqual(identifiers, ["a", "b", "c"]);
});
