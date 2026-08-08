// Tests for pdlc/engine/lib/adapter.mjs. Offline: injected transport, injected
// skill loader, injected execFile. No SDK, no plugin tree, no subprocess.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createAdapter, createRunCommand } from "../lib/adapter.mjs";

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
