// Tests for pdlc/engine/lib/transport.mjs. No live SDK calls, no network —
// every case supplies its own fake `queryFn` async-generator stream.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createTransport,
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
} from "../lib/transport.mjs";

function initMessage(apiKeySource) {
  return { type: "system", subtype: "init", apiKeySource };
}

// A terminal result. `subtype` is part of the real shape, never optional:
// `SDKResultSuccess` is the only variant carrying a `result` field at all
// (sdk.d.ts:4470), and the transport now refuses any other subtype.
function resultMessage(overrides = {}) {
  return {
    type: "result",
    subtype: "success",
    result: "HELLO",
    session_id: "sess-123",
    total_cost_usd: 0.01,
    usage: { input_tokens: 1, output_tokens: 2 },
    ...overrides,
  };
}

test("success path returns text, sessionId, costUsd, usage, empty rateLimitEvents", async () => {
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  const out = await dispatch("hi", { model: "haiku" });

  assert.equal(out.text, "HELLO");
  assert.equal(out.sessionId, "sess-123");
  assert.equal(out.costUsd, 0.01);
  assert.deepEqual(out.usage, { input_tokens: 1, output_tokens: 2 });
  assert.deepEqual(out.rateLimitEvents, []);
});

test("apiKeySource other than \"none\" throws AuthPolicyError before any output", async () => {
  let resultYielded = false;
  async function* stream() {
    yield initMessage("ANTHROPIC_API_KEY");
    resultYielded = true;
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof AuthPolicyError);
      assert.equal(err.apiKeySource, "ANTHROPIC_API_KEY");
      assert.deepEqual(err.allowedSources, ["none"]);
      return true;
    }
  );
  assert.equal(resultYielded, false, "stream must not advance past the auth gate");
});

test("rate_limit_event messages are captured on the success path", async () => {
  const rateLimitInfo = {
    status: "allowed",
    resetsAt: 1786248000,
    rateLimitType: "five_hour",
    overageStatus: "rejected",
    overageDisabledReason: "org_level_disabled",
    isUsingOverage: false,
  };
  async function* stream() {
    yield initMessage("none");
    yield { type: "rate_limit_event", rate_limit_info: rateLimitInfo };
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  const out = await dispatch("hi");

  assert.equal(out.rateLimitEvents.length, 1);
  assert.deepEqual(out.rateLimitEvents[0], rateLimitInfo);
});

test("a dispatch that never completes is classified TimeoutError", async () => {
  async function* stream({ signal }) {
    yield initMessage("none");
    await new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")));
    });
  }
  const queryFn = async ({ options }) => stream({ signal: options.abortController.signal });
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(
    () => dispatch("hi", { timeoutMs: 20 }),
    (err) => {
      assert.ok(err instanceof TimeoutError);
      assert.equal(err.timeoutMs, 20);
      return true;
    }
  );
});

test("a malformed stream message (no type) is classified TransportError", async () => {
  async function* stream() {
    yield initMessage("none");
    yield { unexpected: "shape" };
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      return true;
    }
  );
});

test("a stream ending without a terminal result is classified TransportError", async () => {
  async function* stream() {
    yield initMessage("none");
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(() => dispatch("hi"), TransportError);
});

test("queryFn throw not matching timeout/rate-limit is classified TransportError", async () => {
  const queryFn = async () => {
    throw new Error("boom");
  };
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.equal(err.cause.message, "boom");
      return true;
    }
  );
});

test("a throw that looks like a rate-limit error is classified RateLimitedError", async () => {
  const queryFn = async () => {
    const err = new Error("Rate limit exceeded");
    err.status = 429;
    throw err;
  };
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(() => dispatch("hi"), RateLimitedError);
});

test("dispatch env spreads the provided env rather than replacing it", async () => {
  let capturedEnv = null;
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async ({ options }) => {
    capturedEnv = options.env;
    return stream();
  };
  const baseEnv = { ANTHROPIC_BASE_URL: "http://127.0.0.1:8787", PATH: "/usr/bin" };
  const { dispatch } = createTransport({ queryFn, env: baseEnv });

  await dispatch("hi");

  assert.equal(capturedEnv.ANTHROPIC_BASE_URL, "http://127.0.0.1:8787");
  assert.equal(capturedEnv.PATH, "/usr/bin");
  assert.notEqual(capturedEnv, baseEnv, "must be a spread copy, not the same object reference");
});

test("success path also returns the apiKeySource observed at system/init (Phase 4 provenance)", async () => {
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  const out = await dispatch("hi");
  assert.equal(out.apiKeySource, "none");
});

test("a thrown rate-limit error forwards status/rateLimitType/resetsAt/retryAfterMs onto RateLimitedError", async () => {
  const queryFn = async () => {
    const err = new Error("Rate limit exceeded");
    err.status = 429;
    err.rateLimitType = "five_hour";
    err.resetsAt = 1786248000;
    err.retryAfterMs = 12345;
    throw err;
  };
  const { dispatch } = createTransport({ queryFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof RateLimitedError);
      assert.equal(err.status, 429);
      assert.equal(err.rateLimitType, "five_hour");
      assert.equal(err.resetsAt, 1786248000);
      assert.equal(err.retryAfterMs, 12345);
      return true;
    }
  );
});

test("apiKeySourcePolicy is configurable to allow a wider set", async () => {
  async function* stream() {
    yield initMessage("ANTHROPIC_API_KEY");
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({
    queryFn,
    env: {},
    apiKeySourcePolicy: ["none", "ANTHROPIC_API_KEY"],
  });

  const out = await dispatch("hi");
  assert.equal(out.text, "HELLO");
});

// ─── permission mode and terminal-subtype handling ────────────────────────────
//
// These three cases pin the two transport-side halves of the 2026-08-09 live-run
// failure, where a whole review round produced no cross-review files and every
// reviewer was reported as "returned no VERDICT".

test("permissionMode is set explicitly on every dispatch, never left to the SDK default", async () => {
  // Root cause 1. With the option omitted the SDK session runs
  // `permissionMode: "default"`, and with no `canUseTool` handler an "ask"
  // decision is a terminal DENY. Measured: a `Write` was denied, the dispatch
  // still ended `subtype: "success"`, and no file was created.
  let seen = null;
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async ({ options }) => {
    seen = options;
    return stream();
  };
  const { dispatch } = createTransport({ queryFn, env: {} });

  await dispatch("hi");

  assert.equal(seen.permissionMode, "bypassPermissions");
  // The SDK requires the paired acknowledgement for bypass and rejects it absent.
  assert.equal(seen.allowDangerouslySkipPermissions, true);
});

test("permissionMode is overridable, and the bypass acknowledgement is not sent for other modes", async () => {
  let seen = null;
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async ({ options }) => {
    seen = options;
    return stream();
  };
  const { dispatch } = createTransport({ queryFn, env: {}, permissionMode: "acceptEdits" });

  await dispatch("hi");

  assert.equal(seen.permissionMode, "acceptEdits");
  assert.equal(seen.allowDangerouslySkipPermissions, undefined);
});

test("an error-subtype terminal result throws instead of yielding empty text", async () => {
  // Root cause 2. Only SDKResultSuccess has a `result` field; every error
  // subtype omits it. Reading it unconditionally produced `undefined` -> "" at
  // the adapter, so a dispatch that died on max-turns looked exactly like one
  // that replied with nothing — and surfaced far downstream as a missing VERDICT.
  for (const subtype of [
    "error_during_execution",
    "error_max_turns",
    "error_max_budget_usd",
    "error_max_structured_output_retries",
  ]) {
    async function* stream() {
      yield initMessage("none");
      yield { type: "result", subtype, errors: ["boom"], session_id: "s" };
    }
    const queryFn = async () => stream();
    const { dispatch } = createTransport({ queryFn, env: {} });

    await assert.rejects(
      () => dispatch("hi"),
      (err) => {
        assert.ok(err instanceof TransportError, `${subtype} should be a TransportError`);
        assert.match(err.message, new RegExp(subtype));
        assert.match(err.message, /boom/);
        return true;
      }
    );
  }
});

test("permission denials on an otherwise successful dispatch are surfaced, not swallowed", async () => {
  // Root cause 3 (the reason 1 was invisible): a denied tool call does not fail
  // the dispatch and is never shown to the agent, so the model answers as if the
  // work happened. This channel is the only way a caller can find out.
  const denial = { tool_name: "Write", tool_use_id: "toolu_1", tool_input: { file_path: "x.md" } };
  async function* stream() {
    yield initMessage("none");
    yield resultMessage({ permission_denials: [denial] });
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  const out = await dispatch("hi");

  assert.equal(out.text, "HELLO");
  assert.deepEqual(out.permissionDenials, [denial]);
});

test("permissionDenials is always an array, even when the SDK omits the field", async () => {
  async function* stream() {
    yield initMessage("none");
    yield resultMessage();
  }
  const queryFn = async () => stream();
  const { dispatch } = createTransport({ queryFn, env: {} });

  const out = await dispatch("hi");
  assert.deepEqual(out.permissionDenials, []);
});
