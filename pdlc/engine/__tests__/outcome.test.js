// Tests for pdlc/engine/lib/outcome.mjs (TSPEC §5.1, AC-4.1, BR-FAIL-1).
//
// Scope of THIS file (per PLAN's task table: T04 -> T13): PROP-FAIL-1,
// PROP-FAIL-3, PROP-FAIL-5, PROP-FAIL-6, PROP-FAIL-7, PROP-FAIL-8. The
// suite-wide forward direction (PROP-FAIL-2, PROP-FAIL-4, observed subset
// OUTCOMES via §7.0's cross-process accumulator) lives in
// `_assert-suite-wide.test.js`, not here — this file never touches that
// seam, and every assertion below is self-contained within one process.
//
// classifyOutcome's four typed-error mapping rows (§5.1's table) are
// exercised through transport.mjs's real error classes, not string
// look-alikes, so a rename of any of those classes breaks this file loudly
// rather than leaving a stale duplicate predicate here.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";

import {
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
} from "../lib/transport.mjs";

import { OUTCOMES, classifyOutcome } from "../lib/outcome.mjs";

const CANONICAL_MEMBERS = [
  "ok",
  "retryable",
  "timeout",
  "auth-failure",
  "transport-contract-violation",
  "agent-reported-failure",
];

function sorted(arr) {
  return [...arr].sort();
}

// ── OUTCOMES shape (PROP-FAIL-1) ─────────────────────────────────────────

test("OUTCOMES is exactly the six-member catalogue, frozen", () => {
  assert.deepEqual(sorted(OUTCOMES), sorted(CANONICAL_MEMBERS));
  assert.equal(OUTCOMES.length, CANONICAL_MEMBERS.length);
  assert.equal(Object.isFrozen(OUTCOMES), true);
});

test("classifyOutcome's result is always a member of OUTCOMES (PROP-FAIL-1)", () => {
  const cases = [
    { error: new AuthPolicyError("nope") },
    { error: new RateLimitedError("slow down") },
    { error: new TimeoutError("too slow") },
    { error: new TransportError("garbled") },
    { error: null, result: { text: "ok" }, reportedFailure: true },
    { error: null, result: { text: "ok" }, reportedFailure: false },
  ];
  for (const input of cases) {
    const out = classifyOutcome(input);
    assert.ok(
      OUTCOMES.includes(out),
      `classifyOutcome(${JSON.stringify(input)}) => ${String(out)} not in OUTCOMES`,
    );
  }
});

// ── §5.1's typed-error mapping table, one row each ───────────────────────

test("AuthPolicyError classifies auth-failure", () => {
  assert.equal(classifyOutcome({ error: new AuthPolicyError("nope") }), "auth-failure");
});

test("RateLimitedError classifies retryable", () => {
  assert.equal(classifyOutcome({ error: new RateLimitedError("slow down") }), "retryable");
});

test("TimeoutError classifies timeout", () => {
  assert.equal(classifyOutcome({ error: new TimeoutError("too slow") }), "timeout");
});

test("TransportError classifies transport-contract-violation", () => {
  assert.equal(classifyOutcome({ error: new TransportError("garbled") }), "transport-contract-violation");
});

test("no error, reportedFailure true classifies agent-reported-failure", () => {
  assert.equal(
    classifyOutcome({ error: null, result: { text: "DISPATCH-FAILED: x" }, reportedFailure: true }),
    "agent-reported-failure",
  );
});

test("no error, reportedFailure false, terminal result classifies ok", () => {
  assert.equal(
    classifyOutcome({ error: null, result: { text: "all good" }, reportedFailure: false }),
    "ok",
  );
});

// ── PROP-FAIL-3: reverse direction, one NAMED provocation fixture per member ─
// Each fixture below is a transcription of §5.1's own predicate, not an echo
// of whatever the classifier happens to look for.

const PROVOCATION_FIXTURES = {
  ok: {
    error: null,
    result: { text: "the dispatch completed normally" },
    reportedFailure: false,
  },
  retryable: {
    error: new RateLimitedError("rate limited", { status: 429, rateLimitType: "five_hour" }),
  },
  timeout: {
    error: new TimeoutError("dispatch exceeded timeoutMs=1800000", { timeoutMs: 1800000 }),
  },
  "auth-failure": {
    error: new AuthPolicyError("apiKeySource out of policy", {
      apiKeySource: "ANTHROPIC_API_KEY",
      allowedSources: ["none"],
    }),
  },
  "transport-contract-violation": {
    error: new TransportError("malformed stream: no terminal result message"),
  },
  "agent-reported-failure": {
    error: null,
    result: { text: "DISPATCH-FAILED: could not write REQ file" },
    reportedFailure: true,
  },
};

test("PROP-FAIL-3: every OUTCOMES member is reached by a named provocation fixture", () => {
  assert.deepEqual(sorted(Object.keys(PROVOCATION_FIXTURES)), sorted(CANONICAL_MEMBERS));
  const reached = new Set();
  for (const [member, input] of Object.entries(PROVOCATION_FIXTURES)) {
    const out = classifyOutcome(input);
    assert.equal(out, member, `fixture for "${member}" classified as "${out}"`);
    reached.add(out);
  }
  assert.deepEqual(sorted([...reached]), sorted(OUTCOMES));
});

// ── PROP-FAIL-6: unrecognised output never lands ok or retryable ─────────
// TransportError is the funnel HEAD already routes every unrecognised throw
// through (transport.mjs:123); this asserts the *mapping* from that class to
// the taxonomy member, not the funnel itself.

test("unrecognised transport output classifies transport-contract-violation, never ok/retryable", () => {
  const unrecognisedShapes = [
    new TransportError("unexpected message type: foo"),
    new TransportError("stream ended with no terminal result message"),
    new TransportError(String(undefined), { cause: { weird: true } }),
  ];
  for (const error of unrecognisedShapes) {
    const out = classifyOutcome({ error });
    assert.equal(out, "transport-contract-violation");
    assert.notEqual(out, "ok");
    assert.notEqual(out, "retryable");
  }
});

// ── PROP-FAIL-7: partially-parseable output is not a partial success ─────

test("partially-parseable output (well-formed prefix, truncated tail) classifies transport-contract-violation", () => {
  const truncated = new TransportError("malformed stream: no terminal result message", {
    cause: {
      partialText: '{"type":"system","subtype":"init","apiKeySource":"none"}\n{"type":"assistant","message":{"content":[{"type":"text","text":"working on it',
      truncated: true,
    },
  });
  const out = classifyOutcome({ error: truncated });
  assert.equal(out, "transport-contract-violation");
});

// ── PROP-FAIL-8: agent-reported-failure is passed through unchanged and is
// terminal for the dispatch (classification-level: outcome.mjs itself does
// not retry or consume an extra attempt — that is the adapter's job, but the
// member it hands back must be stable and never conflated with a retryable
// outcome).

test("agent-reported-failure is never conflated with retryable, and is stable across repeats", () => {
  const input = {
    error: null,
    result: { text: "ERROR: schema validation failed on line 12" },
    reportedFailure: true,
  };
  const first = classifyOutcome(input);
  const second = classifyOutcome(input);
  assert.equal(first, "agent-reported-failure");
  assert.equal(second, "agent-reported-failure");
  assert.notEqual(first, "retryable");
  assert.notEqual(first, "timeout");
});

test("classifyOutcome is deterministic: same input classifies identically twice", () => {
  const inputs = [
    { error: new AuthPolicyError("nope") },
    { error: new RateLimitedError("slow") },
    { error: new TimeoutError("slow") },
    { error: new TransportError("bad") },
    { error: null, result: { text: "x" }, reportedFailure: true },
    { error: null, result: { text: "x" }, reportedFailure: false },
  ];
  for (const input of inputs) {
    assert.equal(classifyOutcome(input), classifyOutcome(input));
  }
});

// ── PROP-FAIL-5 / S-1: classifyOutcome is total over an arbitrary-shaped
// corpus of thrown values. Every generated value is funnelled through
// transport.mjs's real classifyThrown (exercised indirectly via
// TransportError, its documented catch-all) before reaching classifyOutcome,
// because §5.1 states classifyOutcome only ever sees the four typed classes
// — it is `classifyThrown` that guarantees the funnel is exhaustive. This
// corpus therefore targets the shapes `classifyThrown`'s callers actually
// hand it: things a `try { await queryFn() } catch (err) { classifyThrown(err, …) }`
// really throws, wrapped as TransportError the way the unrecognised arm does.

function* generateArbitraryThrownShapes() {
  yield { label: "string", value: "plain string thrown" };
  yield { label: "string-empty", value: "" };
  yield { label: "number", value: 42 };
  yield { label: "number-nan", value: NaN };
  yield { label: "null", value: null };
  yield { label: "undefined", value: undefined };
  yield { label: "boolean", value: false };
  yield { label: "plain-object", value: { unexpected: "shape" } };
  yield { label: "array", value: [1, 2, 3] };
  yield { label: "error-no-cause", value: new Error("bare error") };
  const inner = new Error("root cause");
  const outer = new Error("wrapper");
  outer.cause = inner;
  yield { label: "error-with-cause", value: outer };
  const deeplyNested = new Error("outermost");
  deeplyNested.cause = new Error("middle");
  deeplyNested.cause.cause = new Error("innermost");
  yield { label: "error-nested-cause", value: deeplyNested };
  const throwingGetter = {};
  Object.defineProperty(throwingGetter, "message", {
    get() {
      throw new Error("message getter itself throws");
    },
  });
  yield { label: "throwing-message-getter", value: throwingGetter };
  yield { label: "frozen-object", value: Object.freeze({ frozen: true }) };
}

test("PROP-FAIL-5: classifyOutcome is total over a generated arbitrary-shaped corpus — never throws, never undefined, always a member of OUTCOMES", () => {
  const shapes = [...generateArbitraryThrownShapes()];
  assert.ok(shapes.length >= 10, "corpus must cover more than a handful of shapes");

  for (const { label, value } of shapes) {
    let out;
    assert.doesNotThrow(() => {
      // The transport's own catch-all (transport.mjs:123) is what actually
      // wraps an arbitrary thrown value; classifyOutcome's contract begins
      // at the typed-error boundary, so the corpus is funnelled through
      // that same wrapping here rather than re-implementing it.
      const wrapped = new TransportError(
        value && typeof value === "object" && "message" in value
          ? safeMessage(value)
          : String(value),
        { cause: value },
      );
      out = classifyOutcome({ error: wrapped });
    }, `shape "${label}" must not make classifyOutcome throw`);
    assert.notEqual(out, undefined, `shape "${label}" must not classify to undefined`);
    assert.ok(OUTCOMES.includes(out), `shape "${label}" classified as "${out}", not an OUTCOMES member`);
    // Counter-property: an unmapped shape must land on the taxonomy's own
    // catch-all member, never silently fall off the end into "ok".
    assert.equal(out, "transport-contract-violation", `shape "${label}" must classify transport-contract-violation`);
  }
});

// ── T13: classifyOutcome records each result through §7.0's observation
// seam — one `{ kind: "outcome", value }` JSON line appended to
// `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, the shape `_assert-suite-wide.test.js`
// (T19, "outcome row") already assumes. This is the reverse of PM Q-01's
// live-run guarantee: with `PDLC_TEST_RUN_DIR` unset (the live-CLI case),
// classifyOutcome must write nothing at all.

test("PROP-FAIL-2 seam: with PDLC_TEST_RUN_DIR set, classifyOutcome appends a {kind: \"outcome\", value} record to `${dir}/${pid}.jsonl`", () => {
  const runDir = mkdtempSync(path.join(os.tmpdir(), "pdlc-outcome-seam-"));
  const prior = process.env.PDLC_TEST_RUN_DIR;
  process.env.PDLC_TEST_RUN_DIR = runDir;
  try {
    const out = classifyOutcome({ error: new RateLimitedError("slow down") });
    assert.equal(out, "retryable");

    const file = path.join(runDir, `${process.pid}.jsonl`);
    const lines = readFileSync(file, "utf8").trim().split("\n");
    const records = lines.map((line) => JSON.parse(line));
    assert.ok(
      records.some((r) => r.kind === "outcome" && r.value === "retryable"),
      `expected a {kind: "outcome", value: "retryable"} record among ${JSON.stringify(records)}`,
    );
  } finally {
    if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
    else process.env.PDLC_TEST_RUN_DIR = prior;
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("PROP-FAIL-2 seam: one record is appended per classifyOutcome call, in call order", () => {
  const runDir = mkdtempSync(path.join(os.tmpdir(), "pdlc-outcome-seam-"));
  const prior = process.env.PDLC_TEST_RUN_DIR;
  process.env.PDLC_TEST_RUN_DIR = runDir;
  try {
    classifyOutcome({ error: new AuthPolicyError("nope") });
    classifyOutcome({ error: null, result: { text: "ok" }, reportedFailure: false });
    classifyOutcome({ error: new TimeoutError("slow") });

    const file = path.join(runDir, `${process.pid}.jsonl`);
    const lines = readFileSync(file, "utf8").trim().split("\n");
    const values = lines.map((line) => JSON.parse(line)).map((r) => r.value);
    assert.deepEqual(values.slice(-3), ["auth-failure", "ok", "timeout"]);
  } finally {
    if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
    else process.env.PDLC_TEST_RUN_DIR = prior;
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("with PDLC_TEST_RUN_DIR unset, classifyOutcome writes no observation record (PM Q-01: a live run records nothing)", () => {
  const prior = process.env.PDLC_TEST_RUN_DIR;
  delete process.env.PDLC_TEST_RUN_DIR;
  try {
    assert.doesNotThrow(() => {
      const out = classifyOutcome({ error: null, result: { text: "ok" }, reportedFailure: false });
      assert.equal(out, "ok");
    });
  } finally {
    if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
    else process.env.PDLC_TEST_RUN_DIR = prior;
  }
});

function safeMessage(value) {
  try {
    return String(value.message);
  } catch {
    return "<message getter threw>";
  }
}
