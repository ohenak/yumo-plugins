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

function resultMessage(overrides = {}) {
  return {
    type: "result",
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
