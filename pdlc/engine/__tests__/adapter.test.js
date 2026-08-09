// Tests for pdlc/engine/lib/adapter.mjs. Offline: injected transport, injected
// skill loader, injected execFile. No SDK, no plugin tree, no subprocess.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createAdapter,
  createRunCommand,
  createGit,
  computeRateLimitWaitMs,
} from "../lib/adapter.mjs";
import { RateLimitedError } from "../lib/transport.mjs";

function fakeTransport(text = "AGENT-REPLY") {
  const calls = [];
  return {
    calls,
    dispatch: async (prompt, opts) => {
      calls.push({ prompt, opts });
      return { text, sessionId: "s1", costUsd: 0, usage: {}, rateLimitEvents: [] };
    },
  };
}

function loaderFor(map) {
  return (root, name) => {
    if (!Object.hasOwn(map, name)) throw new Error(`skill "${name}" not found (fake, root=${root})`);
    return { name, path: `${root}/skills/${name}/SKILL.md`, text: map[name] };
  };
}

const SKILLS = {
  "pm-author": "# pm-author\n\nAuthor the REQ. Cite file:line.",
  "se-implement": "# se-implement\n\nTDD only.",
};

function makeAdapter(overrides = {}) {
  const transport = overrides.transport || fakeTransport();
  const logs = [];
  const adapter = createAdapter({
    transport,
    pluginRoot: "/plugin",
    log: (m) => logs.push(String(m)),
    cwd: "/repo",
    loadSkillFn: loaderFor(SKILLS),
    runCommandFn: overrides.runCommandFn,
    ...overrides.extra,
  });
  return { adapter, transport, logs };
}

// ── construction guards ───────────────────────────────────────────────────────

test("createAdapter requires a transport and a plugin root", () => {
  assert.throws(() => createAdapter({ pluginRoot: "/p" }), /transport with a dispatch/);
  assert.throws(
    () => createAdapter({ transport: fakeTransport() }),
    /pluginRoot is required/
  );
});

// ── _agent ────────────────────────────────────────────────────────────────────

test("_agent inlines the resolved skill text and returns the dispatch text", async () => {
  const { adapter, transport } = makeAdapter();
  const out = await adapter._agent("pm-author", "Write REQ-foo.md");

  assert.equal(out, "AGENT-REPLY");
  assert.equal(transport.calls.length, 1);
  const { prompt } = transport.calls[0];
  assert.ok(prompt.includes(SKILLS["pm-author"]), "skill text must be inlined verbatim");
  assert.ok(prompt.includes("Task:\nWrite REQ-foo.md"));
  assert.ok(!/Skill tool/i.test(prompt));
  assert.ok(!prompt.includes("pdlc:"));
});

test("_agent forwards model verbatim and never substitutes a default", async () => {
  const { adapter, transport } = makeAdapter();
  await adapter._agent("se-implement", "task", { model: "sonnet", label: "wave-1" });
  assert.equal(transport.calls[0].opts.model, "sonnet");

  await adapter._agent("se-implement", "task");
  assert.equal(
    transport.calls[1].opts.model,
    undefined,
    "a dispatch with no model must reach the transport with no model"
  );
});

test("_agent pins every dispatch's cwd to the consumer repo root (AC-2.5)", async () => {
  const { adapter, transport } = makeAdapter();
  await adapter._agent("pm-author", "a");
  await adapter._agent("se-implement", "b", { model: "sonnet" });
  for (const call of transport.calls) assert.equal(call.opts.cwd, "/repo");
});

test("_agent logs the label when given one, and the skill name otherwise", async () => {
  const { adapter, logs } = makeAdapter();
  await adapter._agent("pm-author", "a", { label: "R:author" });
  await adapter._agent("pm-author", "a");
  assert.ok(logs.some((l) => l.includes("R:author")));
  assert.ok(logs.some((l) => l.includes("pm-author")));
});

test("_agent reads each skill file once and caches it across dispatches", async () => {
  let reads = 0;
  const { adapter } = makeAdapter({
    extra: {
      loadSkillFn: (root, name) => {
        reads += 1;
        return { name, path: "x", text: SKILLS[name] };
      },
    },
  });
  await adapter._agent("pm-author", "a");
  await adapter._agent("pm-author", "b");
  await adapter._agent("se-implement", "c");
  assert.equal(reads, 2);
});

test("_agent surfaces an unknown skill as a throw, never as an empty prompt", async () => {
  const { adapter, transport } = makeAdapter();
  await assert.rejects(() => adapter._agent("no-such-skill", "x"), /not found/);
  assert.equal(transport.calls.length, 0, "nothing may be dispatched for an unresolved skill");
});

test("composePrompt exposes the composed prompt without dispatching (dry-run surface)", async () => {
  const { adapter, transport } = makeAdapter();
  const prompt = adapter.composePrompt("pm-author", "Write REQ.");
  assert.ok(prompt.includes(SKILLS["pm-author"]));
  assert.equal(transport.calls.length, 0);
});

// ── the trivial seams ─────────────────────────────────────────────────────────

test("_parallel awaits already-started promises (not thunks)", async () => {
  const { adapter } = makeAdapter();
  const out = await adapter._parallel([Promise.resolve(1), Promise.resolve(2)]);
  assert.deepEqual(out, [1, 2]);
});

test("_pipeline runs the labelled section and returns its value", async () => {
  const { adapter, logs } = makeAdapter();
  const out = await adapter._pipeline("Phase R", async () => "done");
  assert.equal(out, "done");
  assert.ok(logs.some((l) => l.includes("Phase R")));
});

test("_phase and _log write through the injected log sink", () => {
  const { adapter, logs } = makeAdapter();
  adapter._phase("Phase I");
  adapter._log("hello");
  assert.ok(logs.some((l) => l.includes("Phase I")));
  assert.ok(logs.includes("hello"));
});

// ── _runCommand ───────────────────────────────────────────────────────────────
// Contract (orchestrate-dev.js:6725, consumed at :10159/:10172/:10261):
//   (command) => Promise<{ ok: boolean, output: string }>

test("_runCommand success reports ok:true with combined stdout+stderr", async () => {
  const seen = [];
  const run = createRunCommand({
    cwd: "/repo",
    env: { PATH: "/usr/bin" },
    execFileFn: (file, args, opts, cb) => {
      seen.push({ file, args, opts });
      cb(null, "tests passed\n", "warning: slow\n");
    },
  });
  const out = await run("npm test");

  assert.equal(out.ok, true);
  assert.equal(out.code, 0);
  assert.equal(out.output, "tests passed\nwarning: slow\n");
  assert.equal(out.stdout, "tests passed\n");
  assert.equal(out.stderr, "warning: slow\n");
  assert.equal(seen[0].file, "/bin/sh");
  assert.deepEqual(seen[0].args, ["-c", "npm test"]);
  assert.equal(seen[0].opts.cwd, "/repo");
  assert.equal(seen[0].opts.env.PATH, "/usr/bin");
});

test("_runCommand passes a shell string through unsplit (&& survives)", async () => {
  let args = null;
  const run = createRunCommand({
    execFileFn: (file, a, opts, cb) => {
      args = a;
      cb(null, "", "");
    },
  });
  await run("cd pdlc/workflows && npm test");
  assert.deepEqual(args, ["-c", "cd pdlc/workflows && npm test"]);
});

test("_runCommand failure reports ok:false, the exit code, and the output tail", async () => {
  const run = createRunCommand({
    execFileFn: (file, a, opts, cb) => {
      const err = new Error("Command failed");
      err.code = 1;
      cb(err, "3 passing\n", "1 failing: PROP-X\n");
    },
  });
  const out = await run("npm test");
  assert.equal(out.ok, false);
  assert.equal(out.code, 1);
  assert.ok(out.output.includes("1 failing: PROP-X"), "the failure tail must reach the halt message");
});

test("_runCommand turns a spawn failure with no output into a legible ok:false", async () => {
  const run = createRunCommand({
    execFileFn: (file, a, opts, cb) => cb(new Error("spawn /bin/sh ENOENT"), "", ""),
  });
  const out = await run("anything");
  assert.equal(out.ok, false);
  assert.equal(out.code, 1);
  assert.match(out.output, /ENOENT/);
});

test("createAdapter wires a _runCommand by default and honours an injected one", async () => {
  const { adapter } = makeAdapter();
  assert.equal(typeof adapter._runCommand, "function");

  const injected = makeAdapter({ runCommandFn: async () => ({ ok: true, output: "stub" }) });
  assert.deepEqual(await injected.adapter._runCommand("x"), { ok: true, output: "stub" });
});

// ── rate-limit pause/resume decision ladder (REQ AC-4.1, Phase 4) ─────────────

test("computeRateLimitWaitMs prefers retryAfterMs when present and positive", () => {
  const wait = computeRateLimitWaitMs(
    new RateLimitedError("x", { retryAfterMs: 5000, resetsAt: 999999999 }),
    0,
    { jitterFn: () => 0 }
  );
  assert.equal(wait, 5000);
});

test("computeRateLimitWaitMs falls back to resetsAt - now() when retryAfterMs is absent", () => {
  const nowMs = 1_700_000_000_000;
  const resetsAtSeconds = nowMs / 1000 + 10; // 10s ahead, SDK-style epoch seconds
  const wait = computeRateLimitWaitMs(new RateLimitedError("x", { resetsAt: resetsAtSeconds }), 0, {
    now: () => nowMs,
    jitterFn: () => 0,
  });
  assert.equal(wait, 10_000);
});

test("computeRateLimitWaitMs clamps a resetsAt in the past to zero, not negative", () => {
  const nowMs = 1_700_000_000_000;
  const resetsAtSeconds = nowMs / 1000 - 10; // already passed
  const wait = computeRateLimitWaitMs(new RateLimitedError("x", { resetsAt: resetsAtSeconds }), 0, {
    now: () => nowMs,
    jitterFn: () => 0,
  });
  assert.equal(wait, 0);
});

test("computeRateLimitWaitMs falls back to exponential backoff when neither field is present", () => {
  const err = new RateLimitedError("x", {});
  const w0 = computeRateLimitWaitMs(err, 0, { baseMs: 30_000, jitterFn: () => 0 });
  const w1 = computeRateLimitWaitMs(err, 1, { baseMs: 30_000, jitterFn: () => 0 });
  const w2 = computeRateLimitWaitMs(err, 2, { baseMs: 30_000, jitterFn: () => 0 });
  assert.equal(w0, 30_000);
  assert.equal(w1, 60_000);
  assert.equal(w2, 120_000);
});

test("computeRateLimitWaitMs caps the wait at capMs before adding jitter", () => {
  const err = new RateLimitedError("x", { retryAfterMs: 999_999_999 });
  const wait = computeRateLimitWaitMs(err, 0, { capMs: 900_000, jitterMs: 500, jitterFn: (j) => j });
  assert.equal(wait, 900_000 + 500, "capped wait plus the injected jitter");
});

test("computeRateLimitWaitMs adds jitter via the injected jitterFn, never subtracting", () => {
  const err = new RateLimitedError("x", { retryAfterMs: 1000 });
  const wait = computeRateLimitWaitMs(err, 0, { jitterMs: 200, jitterFn: (j) => j / 2 });
  assert.equal(wait, 1100);
});

function fakeRateLimitedTransport({ failTimes, text = "OK" }) {
  const calls = [];
  let n = 0;
  return {
    calls,
    dispatch: async (prompt, opts) => {
      calls.push({ prompt, opts });
      if (n < failTimes) {
        n += 1;
        throw new RateLimitedError("rate limited", {
          rateLimitType: "five_hour",
          status: 429,
          retryAfterMs: 1000 * n,
        });
      }
      return { text, sessionId: "s", costUsd: 0, usage: {}, rateLimitEvents: [], apiKeySource: "none" };
    },
  };
}

test("_agent pauses, records the pause, and retries the SAME dispatch on RateLimitedError", async () => {
  const transport = fakeRateLimitedTransport({ failTimes: 2 });
  const sleeps = [];
  const { adapter } = makeAdapter({
    transport,
    extra: {
      sleep: async (ms) => sleeps.push(ms),
      jitterFn: () => 0,
      now: () => 1000,
    },
  });

  const out = await adapter._agent("pm-author", "Write REQ-foo.md", { label: "R:author" });

  assert.equal(out, "OK");
  assert.equal(transport.calls.length, 3, "2 failures + 1 success = 3 dispatch attempts");
  // Every attempt dispatches the SAME composed prompt.
  assert.equal(transport.calls[0].prompt, transport.calls[1].prompt);
  assert.equal(transport.calls[0].prompt, transport.calls[2].prompt);

  assert.deepEqual(sleeps, [1000, 2000]);

  const pauses = adapter.getPauseLog();
  assert.equal(pauses.length, 2);
  assert.equal(pauses[0].attempt, 1);
  assert.equal(pauses[0].waitedMs, 1000);
  assert.equal(pauses[0].skill, "pm-author");
  assert.equal(pauses[0].label, "R:author");
  assert.equal(pauses[0].rateLimitType, "five_hour");
  assert.equal(pauses[0].status, 429);
  assert.equal(pauses[0].timestamp, 1000);
  assert.equal(pauses[1].attempt, 2);
  assert.equal(pauses[1].waitedMs, 2000);
});

test("_agent exhausting maxRateLimitPauses rethrows RateLimitedError rather than crashing", async () => {
  const transport = fakeRateLimitedTransport({ failTimes: 10 });
  const sleeps = [];
  const { adapter } = makeAdapter({
    transport,
    extra: {
      maxRateLimitPauses: 3,
      sleep: async (ms) => sleeps.push(ms),
      jitterFn: () => 0,
    },
  });

  await assert.rejects(() => adapter._agent("se-implement", "task"), RateLimitedError);
  assert.equal(sleeps.length, 3, "exactly maxRateLimitPauses pauses are taken, no more");
  assert.equal(transport.calls.length, 4, "3 paused attempts + the 4th that is not retried");
  assert.equal(adapter.getPauseLog().length, 3);
});

test("_agent never pauses for a non-RateLimitedError failure", async () => {
  const transport = {
    calls: [],
    dispatch: async () => {
      throw new Error("boom");
    },
  };
  const sleeps = [];
  const { adapter } = makeAdapter({ transport, extra: { sleep: async (ms) => sleeps.push(ms) } });

  await assert.rejects(() => adapter._agent("pm-author", "x"), /boom/);
  assert.deepEqual(sleeps, []);
  assert.deepEqual(adapter.getPauseLog(), []);
});

test("getDispatchCounts tallies one entry per _agent call, per skill", async () => {
  const { adapter } = makeAdapter();
  await adapter._agent("pm-author", "a");
  await adapter._agent("pm-author", "b");
  await adapter._agent("se-implement", "c");
  assert.deepEqual(adapter.getDispatchCounts(), { "pm-author": 2, "se-implement": 1 });
});

test("getApiKeySource reflects the most recently observed SDK apiKeySource", async () => {
  const transport = {
    dispatch: async () => ({ text: "x", apiKeySource: "none" }),
  };
  const { adapter } = makeAdapter({ transport });
  assert.equal(adapter.getApiKeySource(), null, "no dispatch has completed yet");
  await adapter._agent("pm-author", "a");
  assert.equal(adapter.getApiKeySource(), "none");
});

// ─── the `_git` seam (branch guard) ───────────────────────────────────────────

test("createGit runs argv through execFile and normalises ok/stdout/stderr", async () => {
  const seen = [];
  const git = createGit({
    cwd: "/repo",
    env: { PATH: "/usr/bin" },
    execFileFn: (file, args, opts, cb) => {
      seen.push({ file, args, cwd: opts.cwd });
      cb(null, "feat-x\n", "");
    },
  });

  const out = await git(["rev-parse", "--abbrev-ref", "HEAD"]);

  assert.equal(seen[0].file, "git", "git argv must never go through a shell");
  assert.deepEqual(seen[0].args, ["rev-parse", "--abbrev-ref", "HEAD"]);
  assert.equal(seen[0].cwd, "/repo");
  assert.deepEqual(out, { ok: true, stdout: "feat-x\n", stderr: "" });
});

test("createGit reports a failed command as ok:false with stderr, never throwing", async () => {
  const git = createGit({
    execFileFn: (file, args, opts, cb) => {
      const err = new Error("exit 128");
      cb(err, "", "fatal: not a git repository");
    },
  });

  const out = await git(["status"]);

  assert.equal(out.ok, false);
  assert.equal(out.stderr, "fatal: not a git repository");
});

test("the adapter exposes a _git seam distinct from the module's defaultGit", async () => {
  const { adapter } = makeAdapter();
  const { defaultGit, branchGuardTransport } = await import("../../workflows/orchestrate-dev.js");

  assert.equal(typeof adapter._git, "function");
  assert.notEqual(adapter._git, defaultGit);
  // The guard accepts it as actionable — this identity check is the whole point.
  assert.equal(branchGuardTransport(adapter._git), adapter._git);
});

// ─── silent tool-permission denials ───────────────────────────────────────────

test("a dispatch with permission denials warns and is recorded, without failing", async () => {
  // The failure mode this exists for: the SDK denies a Write, does NOT tell the
  // agent, the agent replies "done", and the pipeline believes it. Live 2026-08-09.
  const transport = {
    dispatch: async () => ({
      text: "Cross-review written.",
      permissionDenials: [
        { tool_name: "Write", tool_use_id: "t1" },
        { tool_name: "Write", tool_use_id: "t2" },
        { tool_name: "Bash", tool_use_id: "t3" },
      ],
    }),
  };
  const { adapter, logs } = makeAdapter({ transport });

  const text = await adapter._agent("pm-author", "go");

  assert.equal(text, "Cross-review written.", "the dispatch itself still succeeds");
  const warning = logs.find((l) => l.includes("[warning]"));
  assert.ok(warning, "a denial must never be silent");
  assert.match(warning, /3 tool call\(s\) DENIED/);
  assert.match(warning, /Write×2/);
  assert.match(warning, /Bash/);

  assert.deepEqual(adapter.getDenialLog(), [
    { skill: "pm-author", label: "pm-author", tools: ["Write", "Write", "Bash"], count: 3 },
  ]);
});

test("a clean dispatch logs no denial warning and leaves the denial log empty", async () => {
  const { adapter, logs } = makeAdapter();

  await adapter._agent("pm-author", "go");

  assert.equal(logs.some((l) => l.includes("[warning]")), false);
  assert.deepEqual(adapter.getDenialLog(), []);
});
