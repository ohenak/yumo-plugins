// loopSessionState.test.js — PLAN P1-05 (red) / P1-06 (green).
//
// State-codec cases for `decodeLoopState` / `encodeLoopState` (TSPEC *Interfaces*, Data Model
// §3, E-24, AT-48, PROP-ITER-14/PROP-ITER-15):
//
//   - round-trip over an arbitrary well-formed `SessionState`
//   - totality over `null`, empty, non-base64, non-JSON, non-object and wrong-`v` tokens — every
//     one decodes to the fresh-session value, never throws
//   - the reserved literal `new` decodes to the SAME fresh-session value as every other
//     undecodable token (this file's part of PROP-ITER-15's differential) — the other half of
//     that differential ("different notice sets") needs `collectNotices`, which is P1-10's
//     deliverable, so those two blocks stay `test.skip`, titled "P1-10: ..."
//   - free-text members (`halted[].reason`, `escalationsRaised[].sourceLabel`) truncated to 200
//     characters at encode time (Data Model §3, Q-04's token-growth bound)
//
// `pdlc/workflows/lib/loop-session.mjs` exists (P1-02) but does not yet export
// `decodeLoopState`/`encodeLoopState` — those are P1-06's deliverable. Every block below is
// therefore committed `.skip`ped, titled with its owning green task's id, and un-skipped by that
// task. The dynamic `await import` (rather than a top-level static import) lets this file load
// and its skips take effect even though the target exports are absent.

// The fresh-session value, transcribed literally from TSPEC Data Model §3 — never derived from
// the module under test (PROP-CFG-02-style: the constant-compared-with-itself defect).
const FRESH_SESSION = Object.freeze({
  v: 1,
  preflightRan: false,
  consecutiveIdle: 0,
  schedulePos: 0,
  iteration: 0,
  merged: [],
  halted: [],
  escalationsRaised: [],
});

describe("decodeLoopState / encodeLoopState — round-trip (PLAN P1-05/P1-06, PROP-ITER-14)", () => {
  test("P1-06: round-trips an arbitrary well-formed SessionState through encode then decode", async () => {
    const { decodeLoopState, encodeLoopState } = await import("../lib/loop-session.mjs");

    const wellFormed = {
      v: 1,
      preflightRan: true,
      consecutiveIdle: 2,
      schedulePos: 2,
      iteration: 5,
      merged: [{ feature: "a", prUrl: "https://example.com/pr/1" }],
      halted: [{ feature: "b", reason: "blocked on upstream review" }],
      escalationsRaised: [{ feature: "c", sourceLabel: "pipeline-halt" }],
    };

    const token = encodeLoopState(wellFormed);
    expect(decodeLoopState(token)).toEqual(wellFormed);
  });

  test("P1-06: round-trips a fresh SessionState (empty arrays) unchanged", async () => {
    const { decodeLoopState, encodeLoopState } = await import("../lib/loop-session.mjs");

    const token = encodeLoopState(FRESH_SESSION);
    expect(decodeLoopState(token)).toEqual(FRESH_SESSION);
  });

  test("P1-06: encodeLoopState produces a base64url string (no +, /, = characters)", async () => {
    const { encodeLoopState } = await import("../lib/loop-session.mjs");

    const token = encodeLoopState(FRESH_SESSION);
    expect(typeof token).toBe("string");
    expect(token).toMatch(/^[A-Za-z0-9_-]*$/);
  });
});

describe("decodeLoopState — totality (PLAN P1-05/P1-06, PROP-ITER-14, E-24/AT-48)", () => {
  test("P1-06: null decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    expect(() => decodeLoopState(null)).not.toThrow();
    expect(decodeLoopState(null)).toEqual(FRESH_SESSION);
  });

  test("P1-06: an empty string decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    expect(() => decodeLoopState("")).not.toThrow();
    expect(decodeLoopState("")).toEqual(FRESH_SESSION);
  });

  test("P1-06: a non-base64 token decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    const nonBase64 = "not base64! has spaces and punctuation @@@";
    expect(() => decodeLoopState(nonBase64)).not.toThrow();
    expect(decodeLoopState(nonBase64)).toEqual(FRESH_SESSION);
  });

  test("P1-06: a base64url token whose bytes are not JSON decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    const nonJson = Buffer.from("this is not JSON at all", "utf8").toString("base64url");
    expect(() => decodeLoopState(nonJson)).not.toThrow();
    expect(decodeLoopState(nonJson)).toEqual(FRESH_SESSION);
  });

  test("P1-06: a base64url token of valid JSON that is not an object decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    const nonObject = Buffer.from(JSON.stringify([1, 2, 3]), "utf8").toString("base64url");
    expect(() => decodeLoopState(nonObject)).not.toThrow();
    expect(decodeLoopState(nonObject)).toEqual(FRESH_SESSION);
  });

  test("P1-06: a base64url token of a well-shaped object with the wrong v decodes to the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    const wrongV = Buffer.from(
      JSON.stringify({
        v: 2,
        preflightRan: true,
        consecutiveIdle: 1,
        schedulePos: 1,
        iteration: 1,
        merged: [],
        halted: [],
        escalationsRaised: [],
      }),
      "utf8",
    ).toString("base64url");
    expect(() => decodeLoopState(wrongV)).not.toThrow();
    expect(decodeLoopState(wrongV)).toEqual(FRESH_SESSION);
  });
});

describe("the reserved literal 'new' (PLAN P1-05/P1-06/P1-10, PROP-ITER-15, E-24/AT-48)", () => {
  test("P1-06: decodeLoopState('new') returns the fresh-session value", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    expect(decodeLoopState("new")).toEqual(FRESH_SESSION);
  });

  test("P1-06: decodeLoopState('new') and decodeLoopState(<other undecodable token>) return the identical fresh-session value — the state alone cannot distinguish them", async () => {
    const { decodeLoopState } = await import("../lib/loop-session.mjs");

    const otherUndecodable = "totally-unrecognised-token-###";
    expect(decodeLoopState("new")).toEqual(decodeLoopState(otherUndecodable));
    expect(decodeLoopState(otherUndecodable)).toEqual(FRESH_SESSION);
  });

  // The other half of PROP-ITER-15's differential — "different notice sets" — is not observable
  // from `decodeLoopState` alone: TSPEC's `collectNotices({..., restarted: boolean}, ...)` takes
  // the restart flag as caller-supplied input and is the sole producer of the
  // `session-restarted` code (TSPEC *Interfaces* → notice channel table). `collectNotices` is
  // P1-10's deliverable, so these two blocks stay skipped until then.
  test("P1-10: collectNotices raises no session-restarted notice when restarted is false ('new' was supplied)", async () => {
    const { collectNotices } = await import("../lib/loop-session.mjs");

    const notices = collectNotices({
      configResult: { case: "explicit-default", invalidKeys: [] },
      preflight: null,
      parseNotices: [],
      appendFailures: [],
      report: null,
      queue: { readable: true },
      restarted: false,
    });

    expect(notices.some((n) => n.code === "session-restarted")).toBe(false);
  });

  test("P1-10: collectNotices raises a session-restarted notice when restarted is true (any other undecodable token was supplied)", async () => {
    const { collectNotices } = await import("../lib/loop-session.mjs");

    const notices = collectNotices({
      configResult: { case: "explicit-default", invalidKeys: [] },
      preflight: null,
      parseNotices: [],
      appendFailures: [],
      report: null,
      queue: { readable: true },
      restarted: true,
    });

    expect(notices.some((n) => n.code === "session-restarted")).toBe(true);
  });
});

describe("encodeLoopState — free-text truncation (PLAN P1-05/P1-06, Data Model §3/Q-04)", () => {
  test("P1-06: halted[].reason is truncated to 200 characters at encode time", async () => {
    const { decodeLoopState, encodeLoopState } = await import("../lib/loop-session.mjs");

    const longReason = "r".repeat(250);
    const state = {
      ...FRESH_SESSION,
      halted: [{ feature: "b", reason: longReason }],
    };

    const decoded = decodeLoopState(encodeLoopState(state));
    expect(decoded.halted[0].reason).toHaveLength(200);
    expect(decoded.halted[0].reason).toBe(longReason.slice(0, 200));
  });

  test("P1-06: escalationsRaised[].sourceLabel is truncated to 200 characters at encode time", async () => {
    const { decodeLoopState, encodeLoopState } = await import("../lib/loop-session.mjs");

    const longSourceLabel = "s".repeat(250);
    const state = {
      ...FRESH_SESSION,
      escalationsRaised: [{ feature: "c", sourceLabel: longSourceLabel }],
    };

    const decoded = decodeLoopState(encodeLoopState(state));
    expect(decoded.escalationsRaised[0].sourceLabel).toHaveLength(200);
    expect(decoded.escalationsRaised[0].sourceLabel).toBe(longSourceLabel.slice(0, 200));
  });

  test("P1-06: a free-text member at exactly 200 characters is left unchanged (boundary)", async () => {
    const { decodeLoopState, encodeLoopState } = await import("../lib/loop-session.mjs");

    const exactly200 = "x".repeat(200);
    const state = {
      ...FRESH_SESSION,
      halted: [{ feature: "b", reason: exactly200 }],
    };

    const decoded = decodeLoopState(encodeLoopState(state));
    expect(decoded.halted[0].reason).toBe(exactly200);
  });
});
