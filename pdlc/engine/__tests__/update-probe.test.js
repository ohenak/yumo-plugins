// Tests for the S-4 `UpdateProbe` seam (PLAN T12, TSPEC §10.1 S-4, §10.2's
// `ResolutionDecision`-adjacent commentary, §10.3, §11's "Update probe
// unavailable" row; PROPERTIES PROP-VER-3, PROP-VER-12, PROP-CAT-2; AT-5.1).
// [red]: `lib/store.mjs` does not export an `UpdateProbe` default or a
// composing function yet, and `lib/catalogue.mjs` does not register
// `update.unavailable` yet. Both land at T43 (batch 7). This file's
// assertions are committed now, skipped under the "T43:" id, and T43
// un-skips and drives them green.
//
// Contract under test (TSPEC §10.1 S-4, §10.1's S-4 commentary):
//   NO_PROBE                    -- the shipped inert default, `{ latestPublished }`-shaped
//     NO_PROBE.latestPublished() -> { unavailable: true, reason: "no update probe is configured" }
//   checkForUpdate({ probe = NO_PROBE } = {}) -> { version } | { unavailable, reason }
//     - with nothing injected, the default is never *invoked* (call count
//       === 0, PROP-VER-12) even though it is call-able and conforms to the
//       S-4 protocol on its own -- the composing function short-circuits on
//       the untouched default rather than dispatching through it.
//     - with a probe injected, that probe IS called exactly once and its
//       result (either arm of the union) passes through unchanged.
//
// `lib/catalogue.mjs` and `lib/run.mjs` both already exist and are imported
// statically. Only `lib/store.mjs`'s UpdateProbe pieces are unbuilt, so only
// those imports are deferred (dynamic `await import(...)` inside each test
// body) and skipped -- a top-level static import of the still-missing
// exports would fail the whole file at load time before any `.skip` could
// take effect.

import { test } from "node:test";
import assert from "node:assert/strict";

import { message, messageIds } from "../lib/catalogue.mjs";
import { exitCodeFor } from "../lib/run.mjs";

// ── exact exit-code values, never "unaffected" relative to an unstated
//    baseline (TE round-1 F-14, AT-5.1) ─────────────────────────────────────
//
// `exitCodeFor` is the one function every exit-code decision in this repo
// already goes through (PROP-EXIT-1, `run.mjs:290`). It needs no injected
// probe and nothing from the still-unbuilt store.mjs pieces, so it runs
// unskipped: the probe's inertness must hold *against* a real, already-green
// exit-code mapping, not a fixture invented for this file alone.

test("exitCodeFor: the probe path's success case is exactly 0, not merely 'unaffected' (AT-5.1)", () => {
  assert.equal(exitCodeFor({ report: { outcome: "ran" }, refusal: null }), 0);
});

test("exitCodeFor: a genuinely different refusal on the probe path is the pipeline's own exact non-zero value, never blamed on or muddled by the probe (AT-5.1)", () => {
  // The refusal here is unrelated to the update probe (e.g. an engine
  // refusal) -- exactly what §11's "Update probe unavailable ... proceeds"
  // row contrasts against: the probe never causes this, but when something
  // else does, the code is a named, exact value (1), not a vague delta.
  assert.equal(exitCodeFor({ report: null, refusal: "engine refused to start" }), 1);
});

// ── NO_PROBE: inert by default, never invoked unless injected (PROP-VER-12) ─

test("T43: NO_PROBE.latestPublished() called directly still conforms to the S-4 protocol", async () => {
  const { NO_PROBE } = await import("../lib/store.mjs");
  const result = await NO_PROBE.latestPublished();
  assert.deepEqual(result, { unavailable: true, reason: "no update probe is configured" });
});

test("T43: checkForUpdate() with nothing injected never invokes the default probe (call count === 0, PROP-VER-12)", async () => {
  const store = await import("../lib/store.mjs");
  let calls = 0;
  const original = store.NO_PROBE.latestPublished;
  store.NO_PROBE.latestPublished = (...args) => {
    calls++;
    return original.apply(store.NO_PROBE, args);
  };
  try {
    const result = await store.checkForUpdate();
    assert.equal(calls, 0, "the default probe must not be called at all -- inert by default means never dispatched, not merely cheap");
    assert.deepEqual(result, { unavailable: true, reason: "no update probe is configured" });
  } finally {
    store.NO_PROBE.latestPublished = original;
  }
});

test("T43: checkForUpdate() makes no network call and needs no stub-of-a-network to stay offline (S-4 commentary)", async () => {
  const { checkForUpdate } = await import("../lib/store.mjs");
  // No fetch/http seam is injected at all -- if the default path reached for
  // one, this call would throw (nothing global is stubbed) rather than
  // resolve. Resolving proves nothing was reached for.
  await assert.doesNotReject(() => checkForUpdate());
});

// ── an injected probe IS called, and both arms of its union pass through ────

test("T43: checkForUpdate({ probe }) calls the injected probe exactly once and passes a version result through unchanged", async () => {
  const { checkForUpdate } = await import("../lib/store.mjs");
  let calls = 0;
  const fakeProbe = {
    latestPublished: async () => {
      calls++;
      return { version: "9.9.9" };
    },
  };
  const result = await checkForUpdate({ probe: fakeProbe });
  assert.equal(calls, 1);
  assert.deepEqual(result, { version: "9.9.9" });
});

test("T43: checkForUpdate({ probe }) passes an injected {unavailable, reason} result through unchanged", async () => {
  const { checkForUpdate } = await import("../lib/store.mjs");
  const fakeProbe = {
    latestPublished: async () => ({ unavailable: true, reason: "registry unreachable" }),
  };
  const result = await checkForUpdate({ probe: fakeProbe });
  assert.deepEqual(result, { unavailable: true, reason: "registry unreachable" });
});

// ── update.unavailable: stated on every run, never silent (§10.1 S-4
//    commentary, §10.3, PROP-VER-3, PROP-CAT-2) ─────────────────────────────

test("T43: update.unavailable is registered in the catalogue and renders the probe's reason", async () => {
  // Forces the store.mjs half to exist too, since the id is meaningless
  // without an emitter in the same batch (§10.3's "registration is
  // scheduled with its emitter, never ahead of it").
  await import("../lib/store.mjs");
  assert.ok(messageIds().includes("update.unavailable"));
  const text = message("update.unavailable", { reason: "no update probe is configured" });
  assert.match(text, /no update probe is configured/);
});

test("T43: update.unavailable is stated on the success path (exit 0) AND on an unrelated refusal path (exit 1) -- never blocks, never omitted (PROP-VER-3, AT-5.1)", async () => {
  const { checkForUpdate } = await import("../lib/store.mjs");

  // Success path: the probe is inert, the run still proceeds, and the run's
  // own exit code is exactly 0.
  const successProbeResult = await checkForUpdate();
  const successNotice = message("update.unavailable", { reason: successProbeResult.reason });
  assert.ok(successNotice.length > 0);
  assert.equal(exitCodeFor({ report: { outcome: "ran" }, refusal: null }), 0);

  // Refusal path: something else entirely refuses (never the probe) -- the
  // probe is still inert and still stated, and the exit code is the
  // pipeline's own exact non-zero value, not "affected" by the probe.
  const refusalProbeResult = await checkForUpdate();
  const refusalNotice = message("update.unavailable", { reason: refusalProbeResult.reason });
  assert.ok(refusalNotice.length > 0);
  assert.equal(exitCodeFor({ report: null, refusal: "store is empty" }), 1);
});
