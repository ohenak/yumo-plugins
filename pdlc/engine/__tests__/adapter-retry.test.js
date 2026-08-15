// Tests for the generalised retry machine in pdlc/engine/lib/adapter.mjs
// (TSPEC §5.2, FSPEC §8.2, PLAN T21 -> T45). This file is RED at T21: HEAD's
// `_agent` only pauses on RateLimitedError (rate-limit-only), so every test
// below that exercises a `timeout` retry, a recorded terminal reason, or the
// shared-budget/one-timeout-cap interaction is expected to fail until T45
// lands the generalised machine. `computeRateLimitWaitMs`'s own laws
// (PROP-RETRY-6/7) already hold today and are asserted here as a property
// strategy, per PLAN T21.
//
// Interface this file specifies for T45 (none of it exists at HEAD beyond
// `getPauseLog`/`computeRateLimitWaitMs`):
//   - `adapter.getRetryLog()` -> RetryRow[], `{ timestamp, skill, phase,
//     attempt, outcome, delayMs }`, mirroring `getPauseLog()`'s shape
//     (TSPEC §4.4). A RetryRow is written only when a retry is actually
//     taken (mirrors PauseRow); the *last* RetryRow of a dispatch that ends
//     by exhaustion is annotated `terminal: "timeout-cap" | "budget-exhausted"`
//     (TSPEC:1386). A dispatch that never retries at all (EC-FAIL-3, budget
//     0) therefore leaves `getRetryLog()` returning `[]`, not a row carrying
//     a terminal reason with nothing to terminate (PROP-RETRY-10).
//   - `timeout` is retried like `retryable`, drawing from the SAME budget
//     (`maxRateLimitPauses`, BR-RETRY-1), with a per-dispatch cap of at most
//     one timeout retry ever (BR-RETRY-2).
//   - `auth-failure` (`AuthPolicyError`) and `transport-contract-violation`
//     (`TransportError`) are never retried, at any budget (§5.2).

import { test } from "node:test";
import assert from "node:assert/strict";

import { createAdapter, computeRateLimitWaitMs } from "../lib/adapter.mjs";
import {
  RateLimitedError,
  TimeoutError,
  AuthPolicyError,
  TransportError,
} from "../lib/transport.mjs";

function loaderFor(map) {
  return (root, name) => {
    if (!Object.hasOwn(map, name)) throw new Error(`skill "${name}" not found (fake, root=${root})`);
    return { name, path: `${root}/skills/${name}/SKILL.md`, text: map[name] };
  };
}

const SKILLS = { "se-implement": "# se-implement\n\nTDD only." };

/**
 * A transport whose calls settle according to `kinds`, one element per
 * dispatch attempt: "RL" throws RateLimitedError, "TO" throws TimeoutError,
 * "AUTH" throws AuthPolicyError, "TCV" throws TransportError, "OK" resolves.
 * Extra `resolveExtra` fields (e.g. `rateLimitEvents`) are merged onto every
 * successful resolution, for EC-FAIL-2's post-success-signal fixture.
 */
function seqTransport(kinds, { text = "DONE", resolveExtra = {} } = {}) {
  const calls = [];
  let i = 0;
  return {
    calls,
    dispatch: async (prompt, opts) => {
      calls.push({ prompt, opts });
      const kind = kinds[i];
      i += 1;
      if (kind === undefined) throw new Error(`seqTransport: sequence exhausted at call ${i}`);
      if (kind === "RL") {
        throw new RateLimitedError("rate limited", { rateLimitType: "five_hour", status: 429 });
      }
      if (kind === "TO") {
        throw new TimeoutError("dispatch exceeded timeoutMs", { timeoutMs: 1_800_000 });
      }
      if (kind === "AUTH") {
        throw new AuthPolicyError("apiKeySource not in policy", { apiKeySource: "sk-ant-api03" });
      }
      if (kind === "TCV") {
        throw new TransportError("unparseable output", {});
      }
      return {
        text,
        sessionId: "s",
        costUsd: 0,
        usage: {},
        rateLimitEvents: [],
        apiKeySource: "none",
        ...resolveExtra,
      };
    },
  };
}

function makeAdapter(transport, extra = {}) {
  const logs = [];
  const adapter = createAdapter({
    transport,
    pluginRoot: "/plugin",
    log: (m) => logs.push(String(m)),
    cwd: "/repo",
    loadSkillFn: loaderFor(SKILLS),
    sleep: async () => {},
    jitterFn: () => 0,
    now: () => 1_700_000_000_000,
    ...extra,
  });
  return { adapter, logs };
}

async function settle(promise) {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, err };
  }
}

// ── FSPEC §8.2's eight sequences (AC-4.2, PROP-RETRY-1, PROP-RETRY-2) ────────
// Default budget (`maxRateLimitPauses` = 3, i.e. dispatch.retryAttempts = 3
// retries after the first attempt) throughout, matching "at the default of
// 3" (FSPEC:822). Row 6 (`timeout, retryable, retryable` -> non-terminal, a
// 4th attempt follows) has no terminal outcome of its own to assert; it is
// the 3-attempt prefix of row 7 below, and row 7's 4th dispatch call is the
// proof that row 6 did not terminate early.

const SEQUENCES = [
  {
    row: 1,
    name: "retryable x3, then success -> ok, 4 attempts",
    kinds: ["RL", "RL", "RL", "OK"],
    attempts: 4,
    outcome: "ok",
  },
  {
    row: 2,
    name: "retryable x4 -> retryable, budget exhausted, 4 attempts",
    kinds: ["RL", "RL", "RL", "RL"],
    attempts: 4,
    outcome: "retryable",
    terminalReason: "budget-exhausted",
  },
  {
    row: 3,
    name: "timeout, then success -> ok, 2 attempts",
    kinds: ["TO", "OK"],
    attempts: 2,
    outcome: "ok",
  },
  {
    row: 4,
    name: "timeout, timeout -> timeout, terminal by the cap, 2 attempts",
    kinds: ["TO", "TO"],
    attempts: 2,
    outcome: "timeout",
    terminalReason: "timeout-cap",
  },
  {
    row: 5,
    name: "retryable, timeout, then success -> ok, 3 attempts",
    kinds: ["RL", "TO", "OK"],
    attempts: 3,
    outcome: "ok",
  },
  {
    row: 7,
    name: "timeout, retryable, retryable, retryable -> retryable, budget exhausted, 4 attempts (subsumes row 6)",
    kinds: ["TO", "RL", "RL", "RL"],
    attempts: 4,
    outcome: "retryable",
    terminalReason: "budget-exhausted",
  },
  {
    row: 8,
    name: "retryable, timeout, timeout -> timeout, terminal by the cap (not the budget), 3 attempts",
    kinds: ["RL", "TO", "TO"],
    attempts: 3,
    outcome: "timeout",
    terminalReason: "timeout-cap",
  },
];

test("§8.2 row 2: getRetryLog() has one row per actual retry, never one per failed attempt (PROP-RETRY-2/4)", async () => {
  // retryable x4, budget 3: attempts 1-3 each retry (3 RetryRows); attempt 4
  // fails but is NOT retried (no attempt 5 follows) -- the terminal reason
  // lands on the LAST of the 3 rows that were actually written, not on a
  // 4th row invented for an attempt that never retried anything.
  const transport = seqTransport(["RL", "RL", "RL", "RL"]);
  const { adapter } = makeAdapter(transport);
  await settle(adapter._agent("se-implement", "task"));

  const retries = adapter.getRetryLog();
  assert.equal(retries.length, 3, "one RetryRow per retry actually taken, not per failed attempt");
  assert.equal(retries[0].terminal, undefined);
  assert.equal(retries[1].terminal, undefined);
  assert.equal(retries[2].terminal, "budget-exhausted");
  for (const row of retries) {
    assert.equal(row.skill, "se-implement");
    assert.equal(row.outcome, "retryable");
    assert.equal(typeof row.attempt, "number");
    assert.equal(typeof row.timestamp, "number");
  }
});

test("EC-FAIL-3: dispatch.retryAttempts=0 makes the first retryable terminal with an EMPTY retry-row set (PROP-RETRY-10)", async () => {
  const transport = seqTransport(["RL"]);
  const { adapter } = makeAdapter(transport, { maxRateLimitPauses: 0 });

  const result = await settle(adapter._agent("se-implement", "task"));

  assert.equal(transport.calls.length, 1, "no retries at all");
  assert.equal(result.ok, false);
  assert.ok(result.err instanceof RateLimitedError);
  assert.deepEqual(
    adapter.getRetryLog(),
    [],
    "zero retries were ever taken, so there is no 'last RetryRow' to carry a terminal reason -- the set is empty, never a row invented to hold one (FSPEC EC-FAIL-3)"
  );
});

test("EC-FAIL-4: a timeout on the very last attempt of the budget is terminal, cap and budget agreeing (PROP-RETRY-11)", async () => {
  // 3 retryable retries exhaust the budget; the 4th attempt is a timeout,
  // never retried because the budget (not the cap) is what is out.
  const transport = seqTransport(["RL", "RL", "RL", "TO"]);
  const { adapter } = makeAdapter(transport);

  const result = await settle(adapter._agent("se-implement", "task"));

  assert.equal(transport.calls.length, 4);
  assert.equal(result.ok, false);
  assert.ok(result.err instanceof TimeoutError, "the terminal classification is timeout");
  const retries = adapter.getRetryLog();
  assert.equal(retries[retries.length - 1].terminal, "budget-exhausted");
});

test("PROP-RETRY-5 / AT-ENG-36: budgets are per dispatch -- a dispatch succeeding on attempt 3 leaves the NEXT dispatch a full budget", async () => {
  const transport = seqTransport(["RL", "RL", "RL", "OK", "RL", "RL", "RL", "OK"]);
  const { adapter } = makeAdapter(transport);

  const first = await adapter._agent("se-implement", "task-1");
  assert.equal(first, "DONE");
  assert.equal(transport.calls.length, 4, "first dispatch: 3 retries + success");

  // If the budget were run-scoped rather than per-dispatch, this second
  // dispatch would have zero pauses left and its first retryable would be
  // immediately terminal, never reaching its own success on attempt 4.
  const second = await adapter._agent("se-implement", "task-2");
  assert.equal(second, "DONE");
  assert.equal(transport.calls.length, 8, "second dispatch: its own 3 retries + success, budget did not carry over");
});

test("auth-failure is never retried, at any budget (PROP-RETRY-13, AC-4.4)", async () => {
  const transport = seqTransport(["AUTH"]);
  const sleeps = [];
  const { adapter } = makeAdapter(transport, { sleep: async (ms) => sleeps.push(ms) });

  const result = await settle(adapter._agent("se-implement", "task"));

  assert.equal(transport.calls.length, 1, "zero retries attempted");
  assert.equal(result.ok, false);
  assert.ok(result.err instanceof AuthPolicyError);
  assert.deepEqual(sleeps, [], "no backoff, no second attempt");
  assert.deepEqual(adapter.getRetryLog(), []);
});

test("transport-contract-violation is never retried, at any budget (§5.2)", async () => {
  const transport = seqTransport(["TCV"]);
  const { adapter } = makeAdapter(transport);

  const result = await settle(adapter._agent("se-implement", "task"));

  assert.equal(transport.calls.length, 1);
  assert.equal(result.ok, false);
  assert.ok(result.err instanceof TransportError);
  assert.deepEqual(adapter.getRetryLog(), []);
});

test("NEG-9: a retryable IS retried on the same fixture shape an auth-failure is not, proving the machine is running", async () => {
  const transport = seqTransport(["RL", "OK"]);
  const { adapter } = makeAdapter(transport);
  const out = await adapter._agent("se-implement", "task");
  assert.equal(out, "DONE");
  assert.equal(transport.calls.length, 2, "the retryable case, unlike auth-failure, does retry");
});

// ── remaining §8.5 edge cases (AT-ENG-40, PROP-RETRY-9/12) ───────────────────

test("EC-FAIL-2: a rate-limit signal arriving AFTER a usable result yields ok, recorded as a pause note (PROP-RETRY-9)", async () => {
  const transport = seqTransport(["OK"], {
    resolveExtra: { rateLimitEvents: [{ type: "five_hour_limit", resetsAt: 1_700_003_600 }] },
  });
  const { adapter } = makeAdapter(transport);

  const out = await adapter._agent("se-implement", "task");

  assert.equal(out, "DONE", "the result is ok, not a failure");
  assert.equal(transport.calls.length, 1, "the signal never triggers a retry of an already-usable result");
  assert.deepEqual(adapter.getRetryLog(), [], "no retry taken -- a post-success signal is not a retry");
  const pauses = adapter.getPauseLog();
  assert.equal(pauses.length, 1, "the signal is recorded as a pause note, not dropped");
  assert.equal(pauses[0].waitedMs, 0, "nothing was actually waited for -- the dispatch had already succeeded");
});

test("EC-FAIL-6: a retry succeeding after a long pause still yields ok, with no module-visible behaviour change (PROP-RETRY-12)", async () => {
  const transport = seqTransport(["RL", "OK"]);
  const { adapter } = makeAdapter(transport, {
    sleep: async () => {}, // the phase's "own expectations" are irrelevant here (offline clock)
    retryBackoffBaseMs: 20 * 60 * 1000, // deliberately longer than a typical phase's patience
  });

  const out = await adapter._agent("se-implement", "task");

  assert.equal(out, "DONE", "success, regardless of how long the pause was");
  const pauses = adapter.getPauseLog();
  assert.equal(pauses.length, 1);
  assert.ok(pauses[0].waitedMs >= 15 * 60 * 1000, "the pause IS in the report, capped at 15 min");
});

// ── pause delay ladder, recorded (BR-RETRY-3, PROP-RETRY-6, PROP-RETRY-8) ────

test("every pause's recorded delay falls in [d, d+1000]ms for its row's base d, on a three-pause no-hint fixture (AT-ENG-37)", async () => {
  const transport = seqTransport(["RL", "RL", "RL", "OK"]);
  const sleeps = [];
  const { adapter } = makeAdapter(transport, {
    sleep: async (ms) => sleeps.push(ms),
    jitterFn: () => Math.floor(Math.random() * 1001), // real jitter -- only the BAND is asserted
  });

  await adapter._agent("se-implement", "task");

  const bases = [30_000, 60_000, 120_000]; // 30s, 60s, 120s -- BR-RETRY-3's no-hint ladder
  const pauses = adapter.getPauseLog();
  assert.equal(pauses.length, 3);
  pauses.forEach((row, idx) => {
    assert.ok(row.waitedMs >= bases[idx] && row.waitedMs <= bases[idx] + 1000, `pause ${idx + 1}: ${row.waitedMs}ms in [${bases[idx]}, ${bases[idx] + 1000}]`);
  });
  assert.deepEqual(sleeps, pauses.map((r) => r.waitedMs), "the report's delay is the delay actually slept for");
});

// ── computeRateLimitWaitMs's three laws, over generated attempt indices ─────
// (PLAN T21 property strategy; PROP-RETRY-6, PROP-RETRY-7). This function
// already implements the laws at HEAD -- these assertions are expected GREEN
// even before T45, and stay green afterward since T45 does not change
// `computeRateLimitWaitMs` itself, only its callers.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("computeRateLimitWaitMs: monotone non-decreasing in the attempt, over 0..40 (unjittered)", () => {
  const err = new RateLimitedError("x", {});
  let prev = -Infinity;
  for (let attempt = 0; attempt <= 40; attempt++) {
    const w = computeRateLimitWaitMs(err, attempt, { jitterFn: () => 0 });
    assert.ok(w >= prev, `attempt ${attempt}: ${w} must be >= previous ${prev}`);
    prev = w;
  }
});

test("computeRateLimitWaitMs: never above the 15-minute cap, over generated attempt indices and hint shapes", () => {
  const capMs = 15 * 60 * 1000;
  const rnd = mulberry32(42);
  const hintShapes = [
    () => ({}), // exponential arm
    () => ({ retryAfterMs: Math.floor(rnd() * 1e9) }),
    () => ({ resetsAt: 1_700_000_000 + Math.floor(rnd() * 1e7) }),
  ];
  for (let i = 0; i < 200; i++) {
    const attempt = Math.floor(rnd() * 60); // includes 0, small, and absurdly large
    const shape = hintShapes[Math.floor(rnd() * hintShapes.length)]();
    const err = new RateLimitedError("x", shape);
    const w = computeRateLimitWaitMs(err, attempt, {
      now: () => 1_700_000_000_000,
      jitterFn: () => Math.floor(rnd() * 1001),
    });
    assert.ok(w <= capMs + 1000, `attempt=${attempt} shape=${JSON.stringify(shape)} -> ${w} must be <= cap+jitter`);
  }
});

test("computeRateLimitWaitMs: the jittered value is always within [unjittered, unjittered+jitterMs]", () => {
  const rnd = mulberry32(7);
  for (let i = 0; i < 200; i++) {
    const attempt = Math.floor(rnd() * 40);
    const err = new RateLimitedError("x", {});
    const jitterSample = Math.floor(rnd() * 1001);
    const unjittered = computeRateLimitWaitMs(err, attempt, { jitterFn: () => 0 });
    const jittered = computeRateLimitWaitMs(err, attempt, { jitterFn: () => jitterSample });
    assert.ok(
      jittered >= unjittered && jittered <= unjittered + 1000,
      `attempt=${attempt}: jittered ${jittered} must be within [${unjittered}, ${unjittered + 1000}] (jitter added, never subtracted)`
    );
  }
});

test("computeRateLimitWaitMs: a reset timestamp in the past never yields a negative delay, and NaN hints never propagate (S-3 falsifier)", () => {
  const past = computeRateLimitWaitMs(
    new RateLimitedError("x", { resetsAt: 1_699_999_990 }),
    0,
    { now: () => 1_700_000_000_000, jitterFn: () => 0 }
  );
  assert.ok(past >= 0);

  const nanHint = computeRateLimitWaitMs(new RateLimitedError("x", { retryAfterMs: NaN }), 2, {
    baseMs: 30_000,
    jitterFn: () => 0,
  });
  assert.equal(nanHint, 120_000, "a NaN hint must fall through to the exponential arm, never propagate as NaN");
  assert.ok(!Number.isNaN(nanHint));
});

for (const seq of SEQUENCES) {
  test(`§8.2 row ${seq.row}: ${seq.name}`, async () => {
    const transport = seqTransport(seq.kinds);
    const { adapter } = makeAdapter(transport);

    const result = await settle(adapter._agent("se-implement", "task"));

    assert.equal(transport.calls.length, seq.attempts, "total dispatch attempts");

    if (seq.outcome === "ok") {
      assert.equal(result.ok, true, "the dispatch must resolve, not reject");
      assert.equal(result.value, "DONE");
    } else if (seq.outcome === "retryable") {
      assert.equal(result.ok, false, "budget exhaustion rejects, handed to the module (BR-RETRY-5)");
      assert.ok(result.err instanceof RateLimitedError);
    } else if (seq.outcome === "timeout") {
      assert.equal(result.ok, false, "cap exhaustion rejects, handed to the module (BR-RETRY-5)");
      assert.ok(result.err instanceof TimeoutError);
    }

    if (seq.terminalReason) {
      const retries = adapter.getRetryLog();
      assert.ok(retries.length > 0, "an exhausted dispatch must have retried at least once");
      const last = retries[retries.length - 1];
      assert.equal(
        last.terminal,
        seq.terminalReason,
        "the last RetryRow records why the chain ended (TSPEC:1386)"
      );
    } else {
      // A dispatch that reaches `ok` was not terminated by cap or budget —
      // no RetryRow may claim it was.
      for (const row of adapter.getRetryLog()) assert.equal(row.terminal, undefined);
    }
  });
}

// ── exhaustion routed to the module, cleanly (PROP-RETRY-14/15, AT-ENG-38) ──
// TSPEC §5.3/§8.3: on exhaustion the engine hands the failure to the module,
// which owns the halt artifacts (POSTMORTEM, `halted` row) -- that full path
// is exercised at integration level elsewhere (smoke.test.js's corpus, T48).
// What belongs to THIS file, at the adapter's own boundary, is the negative
// half PROP-RETRY-15 states for the primary transport: no child process is
// ever spawned (true by construction here -- `transport` is the injected
// fake, never a real `claude` child), and the adapter itself must not crash
// or hang -- exhaustion is an ordinary rejection the caller can await.

test("exhaustion rejects cleanly -- no adapter crash, no unhandled rejection, no child process (PROP-RETRY-14/15 negative half)", async () => {
  const transport = seqTransport(["RL", "RL", "RL", "RL"]);
  const { adapter } = makeAdapter(transport);

  await assert.rejects(() => adapter._agent("se-implement", "task"), RateLimitedError);
  // Reaching this line at all is the proof: the rejection propagated as an
  // ordinary promise rejection, not a thrown-past-await crash. The fake
  // transport above is the only thing `dispatch()` ever called -- by
  // construction, in an offline test, zero real child processes exist.
  assert.equal(transport.calls.length, 4);
});

// ── EC-FAIL-5 / PROP-FAIL-10: transport unavailable is a host problem ───────
// The SDK-import-fails / `claude`-binary-absent case itself is asserted at
// `transport.mjs`'s own construction boundary and at `run.mjs`'s top-level
// catch (exit 1, §5.3) -- neither file is this task's to touch. What this
// file can assert, at the adapter boundary, is the half of §5.2 that a
// transport-unavailable-shaped failure shares with `transport-contract-
// violation`: it is never retried, at any budget, and it propagates as an
// ordinary rejection rather than hanging the adapter.

test("EC-FAIL-5-shaped failure (transport-contract-violation) propagates immediately, never retried, never hangs", async () => {
  const transport = seqTransport(["TCV"]);
  const { adapter } = makeAdapter(transport);

  const settled = await Promise.race([
    settle(adapter._agent("se-implement", "task")),
    new Promise((resolve) => setTimeout(() => resolve({ ok: false, timedOut: true }), 2000)),
  ]);

  assert.notEqual(settled.timedOut, true, "the adapter must reject immediately, never hang waiting on a dead transport");
  assert.equal(settled.ok, false);
  assert.ok(settled.err instanceof TransportError);
  assert.equal(transport.calls.length, 1);
});
