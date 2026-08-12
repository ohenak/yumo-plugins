// Tests for the adapter's per-dispatch descriptor machinery (T20,
// pdlc-headless-engine): the `_phase` run state and its prefix normalisation,
// the engine-stamped `timeoutMs`, the terminal `outcome`/`errorText` on every
// settlement line, one settlement line per attempt, `byPhase`, `authSources`,
// and the `createGit` identity distinct from the modules' own `defaultGit`.
//
// Covers PROP-DISP-2, PROP-DISP-4, PROP-DISP-5, PROP-DISP-6, PROP-PARITY-13,
// PROP-AUTH-12 (PROPERTIES-pdlc-headless-engine.md:545).
//
// Offline: injected transport, injected skill loader, no SDK, no subprocess.
// The settlement-line seam is exercised by pointing PDLC_TEST_RUN_DIR at a
// scratch temp dir, mirroring outcome.test.js's pattern for the same
// cross-process accumulator (TSPEC §7.0).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { createAdapter } from "../lib/adapter.mjs";
import { RateLimitedError, TransportError } from "../lib/transport.mjs";

function loaderFor(map) {
  return (root, name) => {
    if (!Object.hasOwn(map, name)) throw new Error(`skill "${name}" not found (fake, root=${root})`);
    return { name, path: `${root}/skills/${name}/SKILL.md`, text: map[name] };
  };
}

const SKILLS = {
  "pm-author": "# pm-author\n\nAuthor the REQ.",
  "se-implement": "# se-implement\n\nTDD only.",
  "se-review": "# se-review\n\nReview.",
};

function fakeTransport(text = "AGENT-REPLY") {
  const calls = [];
  return {
    calls,
    dispatch: async (prompt, opts) => {
      calls.push({ prompt, opts });
      return { text, sessionId: "s1", costUsd: 0, usage: {}, rateLimitEvents: [], apiKeySource: "none" };
    },
  };
}

function makeAdapter(overrides = {}) {
  const transport = overrides.transport || fakeTransport();
  const logs = [];
  const adapter = createAdapter({
    transport,
    pluginRoot: "/plugin",
    log: (m) => logs.push(String(m)),
    cwd: "/repo",
    loadSkillFn: loaderFor(SKILLS),
    ...overrides.extra,
  });
  return { adapter, transport, logs };
}

/** Run `fn()` with PDLC_TEST_RUN_DIR pointed at a scratch dir, cleaning up either way. */
function withRunDir(fn) {
  const runDir = mkdtempSync(path.join(os.tmpdir(), "pdlc-adapter-descriptor-"));
  const prior = process.env.PDLC_TEST_RUN_DIR;
  process.env.PDLC_TEST_RUN_DIR = runDir;
  return (async () => {
    try {
      return await fn(runDir);
    } finally {
      if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
      else process.env.PDLC_TEST_RUN_DIR = prior;
      rmSync(runDir, { recursive: true, force: true });
    }
  })();
}

function readSettlementLines(runDir) {
  const file = path.join(runDir, `${process.pid}.jsonl`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return []; // nothing appended yet — a valid outcome, not a test error
    throw err;
  }
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line)).filter((r) => r.kind === "dispatch");
}

// ── PROP-DISP-4: `_phase` run state, prefix-normalised ─────────────────────

test("a dispatch composed before any _phase call records phase: null", async () => {
  const { adapter, transport } = makeAdapter();
  await adapter._agent("pm-author", "go");
  assert.equal(transport.calls.length, 1);
  // phase is adapter-internal, not on the transport boundary — observed via
  // the pause/denial rows' phase field and the settlement line (below).
  assert.deepEqual(adapter.getDispatchCounts().byPhase, { "(no phase)": 1 });
});

test("_phase(label) normalises to the prefix up to the first colon and stamps subsequent dispatches", async () => {
  const { adapter } = makeAdapter();
  adapter._phase("Phase I: Wave 1/3");
  await adapter._agent("se-implement", "a");
  adapter._phase("Phase I: Implementation");
  await adapter._agent("se-implement", "b");
  adapter._phase("Queue: Triage");
  await adapter._agent("pm-author", "c");

  assert.deepEqual(adapter.getDispatchCounts().byPhase, { "Phase I": 2, Queue: 1 });
});

test("_phase with no colon normalises to the whole (trimmed) label", async () => {
  const { adapter } = makeAdapter();
  adapter._phase("Pipeline");
  await adapter._agent("pm-author", "a");
  assert.deepEqual(adapter.getDispatchCounts().byPhase, { Pipeline: 1 });
});

test("pause, denial and authSources rows all carry the normalised phase, never label", async () => {
  const denyTransport = {
    dispatch: async () => ({
      text: "done",
      apiKeySource: "none",
      permissionDenials: [{ tool_name: "Write", tool_use_id: "t1" }],
    }),
  };
  const { adapter } = makeAdapter({ transport: denyTransport });
  adapter._phase("Phase R: Author");
  await adapter._agent("pm-author", "go", { label: "R:author" });

  assert.equal(adapter.getDenialLog()[0].phase, "Phase R");
  assert.equal(adapter.getDenialLog()[0].label, "R:author");
  assert.equal(adapter.getAuthSources()[0].phase, "Phase R");
});

// ── PROP-DISP-2: timeoutMs is engine-stamped on every dispatch ─────────────

test("timeoutMs is stamped on every dispatch from the constructor's resolved dispatchTimeoutMs, never from module opts", async () => {
  const { adapter, transport } = makeAdapter({ extra: { dispatchTimeoutMs: 420000 } });
  await adapter._agent("pm-author", "a");
  // The modules never pass a `timeoutMs` opt (measured, TSPEC §4.1); passing
  // one anyway must not leak through, since the engine owns this value.
  await adapter._agent("pm-author", "b", { timeoutMs: 999 });
  for (const call of transport.calls) assert.equal(call.opts.timeoutMs, 420000);
});

test("timeoutMs defaults to 30 minutes when the constructor does not resolve one", async () => {
  const { adapter, transport } = makeAdapter();
  await adapter._agent("pm-author", "a");
  assert.equal(transport.calls[0].opts.timeoutMs, 30 * 60 * 1000);
});

test("dispatchOpts still contains only the permitted four-key set", async () => {
  const { adapter, transport } = makeAdapter();
  await adapter._agent("se-implement", "a", { model: "sonnet" });
  const keys = Object.keys(transport.calls[0].opts).sort();
  for (const k of keys) assert.ok(["model", "cwd", "timeoutMs", "maxTurns"].includes(k), `unexpected key ${k}`);
  assert.ok(keys.includes("cwd"));
  assert.ok(keys.includes("timeoutMs"));
});

// ── PROP-DISP-5: one settlement line per attempt, terminal outcome/errorText ─

test("a successful dispatch appends exactly one settlement line, carrying outcome: ok and errorText: null", () =>
  withRunDir(async (runDir) => {
    const { adapter } = makeAdapter();
    adapter._phase("Phase R: Author");
    await adapter._agent("pm-author", "go", { model: "opus" });

    const records = readSettlementLines(runDir);
    assert.equal(records.length, 1);
    const r = records[0];
    assert.equal(r.skill, "pm-author");
    assert.equal(r.phase, "Phase R");
    assert.equal(r.model, "opus");
    assert.equal(r.attempt, 0);
    assert.equal(r.outcome, "ok");
    assert.equal(r.errorText, null);
    assert.equal(typeof r.promptHash, "string");
    assert.equal(r.promptHash.length, 16);
    assert.equal(r.corpusRun, null);
    assert.equal(typeof r.seq, "number");
  }));

test("composePrompt alone (dry-run) writes no settlement line — only a dispatched _agent call does", () =>
  withRunDir(async (runDir) => {
    const { adapter } = makeAdapter();
    adapter.composePrompt("pm-author", "go");
    assert.deepEqual(readSettlementLines(runDir), []);
  }));

test("corpusRun is stamped verbatim onto every settlement line when supplied", () =>
  withRunDir(async (runDir) => {
    const { adapter } = makeAdapter({ extra: { corpusRun: "run-i" } });
    await adapter._agent("pm-author", "go");
    assert.equal(readSettlementLines(runDir)[0].corpusRun, "run-i");
  }));

test("a dispatch that throws a TransportError settles as transport-contract-violation with the verbatim errorText, and is not retried", () =>
  withRunDir(async (runDir) => {
    const transport = {
      dispatch: async () => {
        throw new TransportError("stream ended without a result");
      },
    };
    const { adapter } = makeAdapter({ transport });
    await assert.rejects(() => adapter._agent("pm-author", "go"), TransportError);

    const records = readSettlementLines(runDir);
    assert.equal(records.length, 1);
    assert.equal(records[0].outcome, "transport-contract-violation");
    assert.equal(records[0].errorText, "stream ended without a result");
  }));

test("a retried dispatch appends one settlement line per attempt, sharing one seq and one promptHash", () =>
  withRunDir(async (runDir) => {
    let n = 0;
    const transport = {
      dispatch: async () => {
        if (n < 2) {
          n += 1;
          throw new RateLimitedError("slow down", { retryAfterMs: 10 });
        }
        return { text: "OK", apiKeySource: "none" };
      },
    };
    const { adapter } = makeAdapter({
      transport,
      extra: { sleep: async () => {}, jitterFn: () => 0 },
    });

    await adapter._agent("pm-author", "go");

    const records = readSettlementLines(runDir);
    assert.equal(records.length, 3, "2 retryable attempts + 1 success = 3 settlement lines");
    assert.deepEqual(
      records.map((r) => r.attempt),
      [0, 1, 2],
      "attempt is 0-based and increments once per try, not per pause"
    );
    assert.deepEqual(
      records.map((r) => r.outcome),
      ["retryable", "retryable", "ok"]
    );
    assert.equal(records[0].errorText, "slow down");
    assert.equal(records[1].errorText, "slow down");
    assert.equal(records[2].errorText, null);
    // Retry attempts share the dispatch's identity: one seq, one prompt (hash).
    assert.equal(records[0].seq, records[1].seq);
    assert.equal(records[1].seq, records[2].seq);
    assert.equal(records[0].promptHash, records[2].promptHash);
  }));

test("exhausting maxRateLimitPauses still appends a settlement line for the final, rethrown attempt", () =>
  withRunDir(async (runDir) => {
    const transport = {
      dispatch: async () => {
        throw new RateLimitedError("slow down", { retryAfterMs: 10 });
      },
    };
    const { adapter } = makeAdapter({
      transport,
      extra: { maxRateLimitPauses: 1, sleep: async () => {}, jitterFn: () => 0 },
    });

    await assert.rejects(() => adapter._agent("pm-author", "go"), RateLimitedError);

    const records = readSettlementLines(runDir);
    assert.equal(records.length, 2, "1 paused attempt + 1 exhausted (rethrown) attempt");
    assert.deepEqual(
      records.map((r) => r.outcome),
      ["retryable", "retryable"]
    );
  }));

// ── authSources: one row per dispatch attempt, never a run-scoped scalar ────

test("authSources records one row per attempt, each with its own attempt index and phase (AC-2.4, AC-4.5)", async () => {
  const { adapter } = makeAdapter();
  adapter._phase("Phase R: Author");
  await adapter._agent("pm-author", "a");
  adapter._phase("Phase T: Design");
  await adapter._agent("se-implement", "b");

  assert.deepEqual(adapter.getAuthSources(), [
    { skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "none" },
    { skill: "se-implement", phase: "Phase T", attempt: 0, apiKeySource: "none" },
  ]);
});

test("PROP-AUTH-12: every dispatch of a no-API-key-source run completes and is recorded exactly once", async () => {
  const transport = fakeTransport("done");
  const { adapter } = makeAdapter({ transport, extra: { loadSkillFn: loaderFor(SKILLS) } });
  await adapter._agent("pm-author", "a");
  await adapter._agent("se-implement", "b");
  await adapter._agent("se-review", "c");

  const sources = adapter.getAuthSources();
  assert.equal(sources.length, 3);
  assert.ok(sources.every((s) => s.apiKeySource === "none"));
});

// ── PROP-DISP-6 / PROP-PARITY-13: `_git` identity distinct from defaultGit ──

test("the adapter's _git seam is a function identity distinct from the modules' own defaultGit", async () => {
  const { adapter } = makeAdapter();
  const { defaultGit, branchGuardTransport } = await import("../../workflows/orchestrate-dev.js");

  assert.equal(typeof adapter._git, "function");
  assert.notEqual(
    adapter._git,
    defaultGit,
    "branchGuardTransport degrades to an inert, no-op branch guard on identity equality"
  );
  assert.equal(
    branchGuardTransport(adapter._git),
    adapter._git,
    "the guard must accept the supplied _git as actionable"
  );
  assert.ok(
    !branchGuardTransport(defaultGit),
    "the module's own default is the exact case the inequality guards against"
  );
});
