// Tests for pdlc/engine/lib/transport-cli.mjs — the `claude -p` fallback
// transport (T37, not yet built as of this file landing; this file is the
// RED half of that pair, T23). No live CLI spawn, no network — every case
// supplies its own fake `spawnFn` over a message stream, and the streamed
// messages themselves come from the recorded fixtures under
// `__tests__/fixtures/transport-cli/` (AC-6.3, TSPEC §7.2), never
// hand-invented, per PLAN T23.
//
// Design of the `spawnFn` seam, mirrored deliberately off `transport.mjs`'s
// `queryFn` seam (`lib/transport.mjs:128-129`): `createCliTransport` calls
// `spawnFn({ prompt, options })` and expects back an async-iterable stream of
// already-parsed message objects — the same shape `queryFn` returns. The real
// `defaultSpawnFn` (T37) is the one that actually spawns
// `claude -p --output-format stream-json`, writes `prompt` to the child's
// stdin, and JSON-parses each stdout line into that same message shape; that
// spawning and parsing is exactly what the injectable seam lets tests skip,
// per TSPEC §7.1 (no real child spawn from inside the suite). Every message
// shape a scenario yields is read verbatim off disk from a `.jsonl` fixture,
// never constructed inline, so this file is asserting the fallback transport
// against the same recorded contract T18 fixed, not a second, drifting copy
// of it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  createTransport,
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
} from "../lib/transport.mjs";
import { createCliTransport } from "../lib/transport-cli.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures", "transport-cli");

/**
 * Reads a recorded `.jsonl` fixture and parses it into the same
 * already-parsed message shape `queryFn`/`spawnFn` streams yield. One JSON
 * object per non-blank line, per `fixtures/README.md`'s documented shape.
 */
function loadFixtureMessages(name) {
  const text = readFileSync(path.join(FIXTURES_DIR, `${name}.jsonl`), "utf8");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

/** An async-iterable stream over a fixed array of already-parsed messages. */
function streamOf(messages) {
  return (async function* () {
    for (const message of messages) yield message;
  })();
}

// ─── same DispatchResult shape as the SDK transport (§4.2) ────────────────

test("success path over the recorded CLI fixture returns the same DispatchResult shape as the SDK transport", async () => {
  const messages = loadFixtureMessages("success");
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  const out = await dispatch("hi", { model: "haiku" });

  assert.equal(out.text, "HELLO-PDLC-FIXTURE");
  assert.equal(out.sessionId, "fixture-cli-success-0001");
  assert.equal(out.costUsd, 0.037099);
  assert.deepEqual(out.usage, {
    input_tokens: 10,
    cache_creation_input_tokens: 18272,
    cache_read_input_tokens: 0,
    output_tokens: 109,
    service_tier: "standard",
  });
  assert.equal(out.apiKeySource, "none");
  assert.deepEqual(out.permissionDenials, []);
  assert.equal(out.rateLimitEvents.length, 1);
  assert.equal(out.rateLimitEvents[0].status, "allowed");
});

// ─── same four error classes as the SDK transport ──────────────────────────
//
// Per TSPEC:783-786, both transports "throw from the same four-class error
// set", which is why `classifyOutcome` can stay transport-blind. Each case
// below asserts the thrown error is an `instanceof` the class imported from
// `transport.mjs` — not a parallel, transport-cli-local class of the same
// name — so a copy-pasted-then-diverged class would fail this file.

test("apiKeySource outside policy throws AuthPolicyError, from the recorded auth-policy-violation fixture", async () => {
  const messages = loadFixtureMessages("auth-policy-violation");
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof AuthPolicyError);
      assert.equal(err.apiKeySource, "user");
      assert.deepEqual(err.allowedSources, ["none"]);
      return true;
    }
  );
});

test("a stream ending without a terminal result is classified TransportError, from the recorded no-terminal-result fixture", async () => {
  const messages = loadFixtureMessages("no-terminal-result");
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(() => dispatch("hi"), TransportError);
});

test("an error-subtype terminal result is classified TransportError, from the recorded rate-limited fixture", async () => {
  // Parity with the SDK transport's own handling of this same scenario shape
  // (`transport.test.js`'s "error-subtype terminal result" case): only a
  // `subtype: "success"` result carries text, so an `error_during_execution`
  // terminal result is a TransportError here too, not a RateLimitedError —
  // the stream-content classification is identical across transports.
  // RateLimitedError is reachable on this transport a different way, below.
  const messages = loadFixtureMessages("rate-limited");
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.match(err.message, /error_during_execution/);
      return true;
    }
  );
});

test("a spawnFn throw that looks like a rate-limit error is classified RateLimitedError", async () => {
  const spawnFn = async () => {
    const err = new Error("Rate limit exceeded");
    err.status = 429;
    throw err;
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(() => dispatch("hi"), RateLimitedError);
});

test("a dispatch that never completes is classified TimeoutError", async () => {
  async function* hangingStream({ signal }) {
    yield loadFixtureMessages("success")[0]; // the init line only
    await new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")));
    });
  }
  const spawnFn = async ({ options }) => hangingStream({ signal: options.abortController.signal });
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi", { timeoutMs: 20 }),
    (err) => {
      assert.ok(err instanceof TimeoutError);
      assert.equal(err.timeoutMs, 20);
      return true;
    }
  );
});

test("a spawnFn throw not matching timeout/rate-limit is classified TransportError", async () => {
  const spawnFn = async () => {
    throw new Error("boom");
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.equal(err.cause.message, "boom");
      return true;
    }
  );
});

// ─── composed prompt identical across transports (AT-ENG-22, AC-6.3) ───────

test("the composed prompt for the same dispatch is byte-identical across the SDK and CLI transports", async () => {
  // PROP-SKILL-9: the fixture must supply non-trivial prompt text, so the
  // equality below cannot be satisfied by two empty strings.
  const composedPrompt =
    "You are the Senior Product Manager. Author REQ-example.md per the " +
    "attached FSPEC template, addressing every open cross-review finding " +
    "before requesting the next round.";

  let sdkSeenPrompt = null;
  const sdkMessages = loadFixtureMessages("success").map((message) =>
    message.type === "result" ? { ...message } : message
  );
  const sdkQueryFn = async ({ prompt }) => {
    sdkSeenPrompt = prompt;
    return streamOf(sdkMessages);
  };
  const { dispatch: sdkDispatch } = createTransport({ queryFn: sdkQueryFn, env: {} });

  let cliSeenPrompt = null;
  const cliMessages = loadFixtureMessages("success");
  const cliSpawnFn = async ({ prompt }) => {
    cliSeenPrompt = prompt;
    return streamOf(cliMessages);
  };
  const { dispatch: cliDispatch } = createCliTransport({ spawnFn: cliSpawnFn, env: {} });

  await sdkDispatch(composedPrompt);
  await cliDispatch(composedPrompt);

  assert.equal(sdkSeenPrompt, composedPrompt);
  assert.equal(cliSeenPrompt, composedPrompt);
  assert.equal(sdkSeenPrompt, cliSeenPrompt);
});

// ─── coverage remediation, DoD F-02 ───────────────────────────────────────
//
// Every case below still supplies its own fake `spawnFn` over an in-memory
// message stream (never a real `claude` child, per TSPEC §7.1) and, where a
// message shape is needed, clones it from an already-recorded `.jsonl`
// fixture rather than hand-inventing a new one — same rule the file's own
// header states for every other case here. Deliberately does not attempt to
// exercise `defaultSpawnFn`: it is reachable only via a real `claude` child
// process, which the hermeticity guard (`_bootstrap.mjs`) blocks by
// construction inside this suite (TSPEC §7.1). `parseStreamJsonLines`
// (`lib/transport-cli.mjs:117-140`) is not in the same boat — it is a pure
// `async function*` over any async-iterable of chunks and never touches
// `spawn`, so it could be exercised directly with a fixture-byte generator
// if it were exported; it currently is not (module-private), so this file
// covers it only indirectly through `dispatch()` — see this file's own DoD
// report for the residual coverage note (v1 F-07, still open).

test("a stream message missing a `type` field is classified as TransportError (malformed message)", async () => {
  const spawnFn = async () => streamOf([{ hello: "world" }]);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.match(err.message, /malformed message/);
      return true;
    }
  );
});

test("dispatch forwards both `cwd` and `maxTurns` through to spawnFn's options", async () => {
  const messages = loadFixtureMessages("success");
  let seenOptions = null;
  const spawnFn = async ({ options }) => {
    seenOptions = options;
    return streamOf(messages);
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await dispatch("hi", { model: "haiku", cwd: "/tmp/pdlc-cli-cwd", maxTurns: 4 });

  assert.equal(seenOptions.cwd, "/tmp/pdlc-cli-cwd");
  assert.equal(seenOptions.maxTurns, 4);
});

test("an init message with no apiKeySource field at all is reported as \"absent\" (`??` null fallback)", async () => {
  const [initMessage] = loadFixtureMessages("auth-policy-violation");
  const { apiKeySource: _drop, ...initWithoutApiKeySource } = initMessage;
  const spawnFn = async () => streamOf([initWithoutApiKeySource]);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof AuthPolicyError);
      assert.equal(err.apiKeySource, null);
      assert.match(err.message, /reported apiKeySource "absent"/);
      return true;
    }
  );
});

test("a rate_limit_event message with no rate_limit_info field is recorded verbatim (`??` message fallback)", async () => {
  const messages = loadFixtureMessages("success").map((message) => {
    if (message.type !== "rate_limit_event") return message;
    const { rate_limit_info: _drop, ...rest } = message;
    return rest;
  });
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  const out = await dispatch("hi");

  assert.equal(out.rateLimitEvents.length, 1);
  assert.deepEqual(out.rateLimitEvents[0], { type: "rate_limit_event" });
});

test("a success terminal result with no permission_denials field falls back to an empty array", async () => {
  const messages = loadFixtureMessages("success").map((message) => {
    if (message.type !== "result") return message;
    const { permission_denials: _drop, ...rest } = message;
    return rest;
  });
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  const out = await dispatch("hi");

  assert.deepEqual(out.permissionDenials, []);
});

test("an error-subtype terminal result with no errors field fails with an unsuffixed TransportError message", async () => {
  const messages = loadFixtureMessages("rate-limited").map((message) => {
    if (message.type !== "result") return message;
    const { errors: _drop, ...rest } = message;
    return rest;
  });
  const spawnFn = async () => streamOf(messages);
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.equal(err.message, "CLI dispatch failed: error_during_execution");
      return true;
    }
  );
});

test("a stream that finishes normally after the timer already fired is still classified as TimeoutError (post-loop check)", async () => {
  const messages = loadFixtureMessages("success");
  const spawnFn = async () =>
    (async function* () {
      await new Promise((resolve) => setTimeout(resolve, 30));
      yield* messages;
    })();
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi", { timeoutMs: 5 }),
    (err) => {
      assert.ok(err instanceof TimeoutError);
      assert.equal(err.timeoutMs, 5);
      return true;
    }
  );
});

test("a spawnFn throwing a bare string is classified as TransportError via String(err), not err.message", async () => {
  const spawnFn = async () => {
    throw "boom";
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.equal(err.message, "boom");
      return true;
    }
  );
});

test("a spawnFn throwing a plain object with neither name nor message is classified as TransportError", async () => {
  const spawnFn = async () => {
    throw {};
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof TransportError);
      assert.equal(err.message, "[object Object]");
      return true;
    }
  );
});

test("a rate-limit error (status 429) with no message falls back to the generic \"rate limited\" text", async () => {
  const spawnFn = async () => {
    const err = new Error();
    err.status = 429;
    throw err;
  };
  const { dispatch } = createCliTransport({ spawnFn, env: {} });

  await assert.rejects(
    () => dispatch("hi"),
    (err) => {
      assert.ok(err instanceof RateLimitedError);
      assert.equal(err.message, "rate limited");
      return true;
    }
  );
});
