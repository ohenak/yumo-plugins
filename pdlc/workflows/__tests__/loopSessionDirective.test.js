// loopSessionDirective.test.js — PLAN P1-07 (red) / P1-08 (green).
//
// `nextDirective(DirectiveInput) -> Directive` — TSPEC §Interfaces' single
// decision point. Every rule below is stated in TSPEC's evaluation order:
// throw -> `invocation-threw` (counter unchanged); `no-queue`; `blocked` ->
// `queue-blocked`; `halted` -> `pipeline-halted`; `ran` -> continue at
// `waitMinutes: 0` with both counters reset; `idle` + unreadable queue ->
// `queue-unreadable`; `idle` + non-empty `awaitingMerge` -> `awaiting-merge`;
// then, for a backoff-entering `idle`, `backoff-unenterable` is tested
// BEFORE `idle-exhausted`; otherwise continue with
// `schedule[min(pos, len-1)]`.
//
// `pdlc/workflows/lib/loop-session.mjs` exists (P1-02) but does not export
// `nextDirective`, `decodeLoopState` or `encodeLoopState` yet — those are
// P1-06 (state codec) and P1-08 (this function) deliverables. Every block
// below is therefore committed `.skip`ped, titled "P1-08: ...", and
// un-skipped by P1-08 (which depends on P1-06 for the codec). The dynamic
// `await import` (rather than a top-level static import) lets this file
// load and its skips take effect even though those exports are absent.

const LOOP_DEFAULTS = Object.freeze({
  backoffSchedule: Object.freeze([5, 15, 30, 60]),
  idleStopAfter: 4,
  preflight: "strict",
  dirtyTreePolicy: "tracked",
});

// Fixture feature names/reasons, standing in for rows a real
// `docs/_queue/QUEUE.md` would produce (BR-05/BR-07's naming conjuncts,
// AC-1.4/AC-1.6). `nextDirective` is pure and reads no file itself — the
// caller (a later phase) is responsible for turning QUEUE.md rows into
// exactly these input shapes.
const BLOCKED_FEATURE = "feat-checkout-flow";
const BLOCKED_REASON = "feat-checkout-flow is in-progress and holds the merge lock";
const AWAITING_FEATURES = ["feat-billing-portal", "feat-notifications-v2"];

function makeState(overrides = {}) {
  return {
    v: 1,
    preflightRan: true,
    consecutiveIdle: 0,
    schedulePos: 0,
    iteration: 1,
    merged: [],
    halted: [],
    escalationsRaised: [],
    ...overrides,
  };
}

function makeInput(overrides = {}) {
  return {
    report: null,
    threw: null,
    queue: { readable: true, awaitingMerge: [] },
    config: LOOP_DEFAULTS,
    state: makeState(),
    ...overrides,
  };
}

describe("nextDirective — throw (PLAN P1-07/P1-08, BR-04a, AT-40, PROP-ITER-12)", () => {
  test("P1-08: a throw stops invocation-threw with the counter unchanged from a non-zero prior value", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: null,
      threw: { message: "queue invocation exploded: ECONNRESET" },
      // Non-zero prior value — distinguishes "unchanged" from "reset to
      // zero" (PROP-ITER-12's explicit oracle conjunct).
      state: makeState({ consecutiveIdle: 2, schedulePos: 1 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("invocation-threw");
    expect(directive.waitMinutes).toBe(0);
    expect(directive.detail).toContain("ECONNRESET");

    const decoded = decodeLoopState(directive.nextState);
    expect(decoded.consecutiveIdle).toBe(input.state.consecutiveIdle);
  });
});

describe("nextDirective — no-queue (PLAN P1-07/P1-08, BR-08, AT-09, PROP-ITER-10)", () => {
  test("P1-08: no-queue ends the session immediately with zero waits", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({ report: { outcome: "no-queue", reason: "queue is empty", remaining: 0 } });

    const directive = nextDirective(input);

    expect(directive).toMatchObject({ kind: "stop", stopReason: "no-queue", waitMinutes: 0 });
  });
});

describe("nextDirective — blocked (PLAN P1-07/P1-08, BR-05, AT-03, PROP-ITER-04, AC-1.4)", () => {
  test("P1-08: blocked stops queue-blocked and detail names the blocking feature and the reason", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: {
        outcome: "blocked",
        reason: BLOCKED_REASON,
        active: BLOCKED_FEATURE,
        remaining: 2,
      },
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("queue-blocked");
    // Never `stopReason !== "idle"` (PROP-ITER-04) — the positive conjuncts
    // are the naming of the blocking feature AND the reason.
    expect(directive.detail).toContain(BLOCKED_FEATURE);
    expect(directive.detail).toContain(BLOCKED_REASON);
  });
});

describe("nextDirective — halted (PLAN P1-07/P1-08, BR-06, AT-04, PROP-ITER-05)", () => {
  test("P1-08: halted stops pipeline-halted", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "halted", reason: "PROPERTIES review rejected twice", remaining: 3 },
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("pipeline-halted");
  });
});

describe("nextDirective — ran (PLAN P1-07/P1-08, BR-04, AT-08, PROP-ITER-03)", () => {
  test("P1-08: ran continues immediately at waitMinutes 0 and resets both counters to zero", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "ran", reason: "ok", remaining: 1, picked: "feat-alpha" },
      // Non-zero priors — a reader that forgets to reset would leave these
      // untouched, which this conjunct catches.
      state: makeState({ consecutiveIdle: 3, schedulePos: 2 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("continue");
    expect(directive.waitMinutes).toBe(0);

    const decoded = decodeLoopState(directive.nextState);
    expect(decoded.consecutiveIdle).toBe(0);
    expect(decoded.schedulePos).toBe(0);
  });
});

describe("nextDirective — idle + unreadable queue (PLAN P1-07/P1-08, BR-07, E-05, AT-41, PROP-ITER-13)", () => {
  test("P1-08: idle with an unreadable QUEUE.md stops queue-unreadable without entering backoff", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      queue: { readable: false, awaitingMerge: [] },
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("queue-unreadable");
    expect(directive.detail.length).toBeGreaterThan(0);
  });
});

describe("nextDirective — idle + awaiting-merge (PLAN P1-07/P1-08, BR-07, AT-05, PROP-ITER-06, AC-1.6)", () => {
  test("P1-08: idle with a non-empty awaitingMerge stops awaiting-merge and names the awaited features", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 2 },
      queue: { readable: true, awaitingMerge: AWAITING_FEATURES },
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("awaiting-merge");
    expect(directive.waitMinutes).toBe(0);
    // The names come from `QUEUE.md`, never from the `idle` report itself
    // (REQ NFR-2) — asserted here as the fixture's queue.awaitingMerge.
    for (const feature of AWAITING_FEATURES) {
      expect(directive.detail).toContain(feature);
    }
  });
});

describe("nextDirective — backoff-unenterable tested before idle-exhausted (PLAN P1-07/P1-08, E-03, AT-39, PROP-ITER-11)", () => {
  test("P1-08: empty backoffSchedule stops backoff-unenterable even when the idle-exhausted predicate is also true", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    // consecutiveIdle + 1 (4) >= idleStopAfter (4) is ALSO true here — if the
    // exhaustion predicate were tested first this would wrongly report
    // idle-exhausted. The empty schedule must win (TSPEC §Interfaces,
    // "unenterable first").
    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: { ...LOOP_DEFAULTS, backoffSchedule: [], idleStopAfter: 4 },
      state: makeState({ consecutiveIdle: 3 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("backoff-unenterable");
    expect(directive.waitMinutes).toBeNull();
  });

  test("P1-08: idleStopAfter 0 stops backoff-unenterable on the first backoff-entering idle", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: { ...LOOP_DEFAULTS, idleStopAfter: 0 },
      state: makeState({ consecutiveIdle: 0 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("backoff-unenterable");
    expect(directive.waitMinutes).toBeNull();
  });
});

describe("nextDirective — idle-exhausted (PLAN P1-07/P1-08, BR-09, PROP-ITER-08)", () => {
  test("P1-08: the idleStopAfter-th consecutive backoff-entering idle stops idle-exhausted", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    // Declared default idleStopAfter is 4; consecutiveIdle 3 means this is
    // the 4th consecutive idle (3 + 1 >= 4).
    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: LOOP_DEFAULTS,
      state: makeState({ consecutiveIdle: 3, schedulePos: 3 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    expect(directive.stopReason).toBe("idle-exhausted");
  });

  test("P1-08: a consecutiveIdle below idleStopAfter - 1 continues into backoff instead of exhausting", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: LOOP_DEFAULTS,
      state: makeState({ consecutiveIdle: 1, schedulePos: 1 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("continue");
    expect(directive.stopReason).toBeFalsy();
  });
});

describe("nextDirective — backoff wait sequence (PLAN P1-07/P1-08, BR-09, AT-06, AT-07, PROP-ITER-07, PROP-ITER-08)", () => {
  test("P1-08: the first backoff-entering idle under the declared defaults waits the first schedule interval", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: LOOP_DEFAULTS,
      state: makeState({ consecutiveIdle: 0, schedulePos: 0 }),
    });

    const directive = nextDirective(input);

    expect(directive).toMatchObject({ kind: "continue", waitMinutes: 5 });
  });

  test("P1-08: five consecutive backoff-entering idles report waits sequence-equal to the literal [5, 15, 30, 60, 60]", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    // idleStopAfter is raised so the exhaustion stop (a separate rule,
    // tested above) does not truncate this sequence — FSPEC's own AT-07
    // fixture is unconstructible under the declared default of 4
    // (documented CROSS-REVIEW-software-engineer-FSPEC-v3 F-21): only 3
    // waits precede the 4th-idle exhaustion stop. This isolates the pure
    // wait-sequence conjunct; idle-exhausted's own stop point is asserted
    // separately above.
    let state = makeState({ consecutiveIdle: 0, schedulePos: 0 });
    const config = { ...LOOP_DEFAULTS, idleStopAfter: 10 };
    const waits = [];

    for (let i = 0; i < 5; i += 1) {
      const directive = nextDirective(
        makeInput({
          report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
          config,
          state,
        }),
      );
      expect(directive.kind).toBe("continue");
      waits.push(directive.waitMinutes);
      state = decodeLoopState(directive.nextState);
    }

    // Transcribed literally from BR-01 (never computed from the schedule
    // the code under test read).
    expect(waits).toEqual([5, 15, 30, 60, 60]);
  });
});

describe("nextDirective — ran resets the backoff sequence (PLAN P1-07/P1-08, BR-09, AT-08)", () => {
  test("P1-08: a ran outcome after two idles resets the sequence, restarting waits at the literal [5, 15]", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    let state = makeState({ consecutiveIdle: 0, schedulePos: 0 });
    const config = LOOP_DEFAULTS;
    const preRestartWaits = [];

    for (let i = 0; i < 2; i += 1) {
      const directive = nextDirective(
        makeInput({
          report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
          config,
          state,
        }),
      );
      preRestartWaits.push(directive.waitMinutes);
      state = decodeLoopState(directive.nextState);
    }
    expect(preRestartWaits).toEqual([5, 15]);

    const ranDirective = nextDirective(
      makeInput({
        report: { outcome: "ran", reason: "ok", remaining: 1, picked: "feat-alpha" },
        config,
        state,
      }),
    );
    state = decodeLoopState(ranDirective.nextState);
    expect(state.consecutiveIdle).toBe(0);
    expect(state.schedulePos).toBe(0);

    const postRestartWaits = [];
    for (let i = 0; i < 2; i += 1) {
      const directive = nextDirective(
        makeInput({
          report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
          config,
          state,
        }),
      );
      postRestartWaits.push(directive.waitMinutes);
      state = decodeLoopState(directive.nextState);
    }

    // Asserted as a transcribed literal, never "the first interval again".
    expect(postRestartWaits).toEqual([5, 15]);
  });
});

describe("nextDirective — schedulePos advances exactly once per continue (PLAN P1-08, BR-09, E-25, AT-49, PROP-ITER-09)", () => {
  test("P1-08: a host wait mismatch does not double-count or error — schedulePos advances by exactly one", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    // The host requested 15 minutes and actually waited a different length
    // (E-25) — this is reported elsewhere (iterationLine's WaitRecord); it
    // must not perturb nextDirective's own schedule arithmetic.
    const input = makeInput({
      report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
      config: LOOP_DEFAULTS,
      state: makeState({ consecutiveIdle: 1, schedulePos: 1 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("continue");
    const decoded = decodeLoopState(directive.nextState);
    expect(decoded.schedulePos).toBe(input.state.schedulePos + 1);
  });

  test("P1-08: schedulePos never advances on a stop", async () => {
    const { nextDirective, decodeLoopState } = await import("../lib/loop-session.mjs");

    const input = makeInput({
      report: { outcome: "blocked", reason: BLOCKED_REASON, active: BLOCKED_FEATURE, remaining: 1 },
      state: makeState({ consecutiveIdle: 0, schedulePos: 2 }),
    });

    const directive = nextDirective(input);

    expect(directive.kind).toBe("stop");
    const decoded = decodeLoopState(directive.nextState);
    expect(decoded.schedulePos).toBe(input.state.schedulePos);
  });
});
