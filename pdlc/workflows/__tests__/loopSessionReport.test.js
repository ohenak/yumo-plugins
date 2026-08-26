// loopSessionReport.test.js — PLAN P1-09 (red) / P1-10 (green).
//
// Notice channel and report field sets: `notice()` throws on a code outside
// `LOOP_NOTICE_CODES`; each of the ten codes has exactly one producer inside
// `collectNotices`; `iterationLine`'s `fields` key set and `sessionSummary`'s
// nine members are `deepEqual`'d against literal transcriptions of FSPEC
// §3.4 (TSPEC "Oracle discipline" item 2) — `LOOP_NOTICE_CODES` /
// `LOOP_STOP_KINDS` appear on NEITHER side of those comparisons.
//
// `LOOP_STOP_KINDS` and `LOOP_NOTICE_CODES` themselves already exist
// (P1-02), so the module-level pinning tests below run unskipped. Every
// block that exercises `notice`, `collectNotices`, `iterationLine` or
// `sessionSummary` — none of which exist yet — is committed `.skip`ped,
// titled "P1-10: ...", and un-skipped by P1-10. The dynamic `await import`
// lets this file load and its skips take effect even though those exports
// are absent.

describe("LOOP_STOP_KINDS / LOOP_NOTICE_CODES — module-level pinning (PLAN P1-09)", () => {
  test("P1-09: LOOP_STOP_KINDS is deepEqual to a ten-member literal naming engine-dispatch-refused (module-level half of AT-37)", async () => {
    const { LOOP_STOP_KINDS } = await import("../lib/loop-session.mjs");

    // Transcribed literally from FSPEC §3.4 / TSPEC §Interfaces — never
    // derived from the module's own export (Oracle discipline item 2).
    expect(LOOP_STOP_KINDS).toEqual([
      "preflight-refused",
      "queue-blocked",
      "pipeline-halted",
      "no-queue",
      "awaiting-merge",
      "idle-exhausted",
      "invocation-threw",
      "queue-unreadable",
      "backoff-unenterable",
      "engine-dispatch-refused",
    ]);
    expect(Object.isFrozen(LOOP_STOP_KINDS)).toBe(true);
  });

  test("P1-09: LOOP_NOTICE_CODES is deepEqual to a ten-member literal (consistency test, TSPEC Test Strategy)", async () => {
    const { LOOP_NOTICE_CODES } = await import("../lib/loop-session.mjs");

    expect(LOOP_NOTICE_CODES).toEqual([
      "config-case",
      "config-key-defaulted",
      "preflight-warning",
      "preflight-held",
      "engine-version-mismatch",
      "escalation-parse",
      "escalation-append-failed",
      "candidate-skipped-not-ready",
      "queue-unreadable",
      "session-restarted",
    ]);
    expect(Object.isFrozen(LOOP_NOTICE_CODES)).toBe(true);
  });

  test("P1-09: LOOP_NOTICE_CODES and LOOP_STOP_KINDS are different sets (nine fields, ten stop reasons — BR-28)", async () => {
    const { LOOP_NOTICE_CODES, LOOP_STOP_KINDS } = await import("../lib/loop-session.mjs");

    expect(LOOP_NOTICE_CODES).not.toEqual(LOOP_STOP_KINDS);
    expect(LOOP_NOTICE_CODES.length).toBe(10);
    expect(LOOP_STOP_KINDS.length).toBe(10);
  });
});

describe("notice() — the ONLY constructor of a Notice (P1-10)", () => {
  test("P1-10: throws when code is outside LOOP_NOTICE_CODES", async () => {
    const { notice } = await import("../lib/loop-session.mjs");

    expect(() => notice("not-a-real-code", "subject", "text")).toThrow();
  });

  test("P1-10: constructs a Notice carrying code, subject and text for every valid code", async () => {
    const { notice, LOOP_NOTICE_CODES } = await import("../lib/loop-session.mjs");

    for (const code of LOOP_NOTICE_CODES) {
      const n = notice(code, "some-subject", "some text");
      expect(n).toEqual({ code, subject: "some-subject", text: "some text" });
    }
  });
});

describe("collectNotices — one producer per code, AT-51's collected-set oracle (P1-10)", () => {
  test("P1-10: a session fixture exercising all ten conditions produces a collected set deepEqual to a literal ten-member array (LOOP_NOTICE_CODES appears on NEITHER side)", async () => {
    const { collectNotices } = await import("../lib/loop-session.mjs");

    // One condition per row of TSPEC's notice-producer table (§Interfaces),
    // engineered so every one of the ten codes fires exactly once.
    const input = {
      configResult: {
        case: "explicit-default", // config-case
        invalidKeys: ["idleStopAfter"], // config-key-defaulted
      },
      preflight: {
        conditions: [
          { id: "engine-readiness", held: false, detail: "engine not ready", remediation: "run pdlc doctor" }, // preflight-warning
          { id: "working-tree", held: true, detail: null, remediation: null }, // preflight-held
        ],
        notices: [],
        versionMismatch: { mismatched: true, detail: "engine v1 vs skill v2" }, // engine-version-mismatch
      },
      parseNotices: ["skipped an unparseable escalation block"], // escalation-parse
      appendFailures: [{ path: "docs/_queue/ESCALATIONS.md", message: "EACCES" }], // escalation-append-failed
      report: { skipped: [{ feature: "feat-x", reason: "REQ not marked ready" }] }, // candidate-skipped-not-ready
      queue: { readable: false }, // queue-unreadable
      restarted: true, // session-restarted
    };

    const codes = collectNotices(input)
      .map((n) => n.code)
      .sort();

    // Transcribed literally from FSPEC §3.4's notice-channel table — never
    // derived from LOOP_NOTICE_CODES (Oracle discipline item 2).
    expect(codes).toEqual(
      [
        "config-case",
        "config-key-defaulted",
        "preflight-warning",
        "preflight-held",
        "engine-version-mismatch",
        "escalation-parse",
        "escalation-append-failed",
        "candidate-skipped-not-ready",
        "queue-unreadable",
        "session-restarted",
      ].sort(),
    );
  });
});

describe("iterationLine — fields key set, AT-36 (P1-10)", () => {
  test("P1-10: fields key set is deepEqual to a literal transcription of FSPEC §3.4's per-iteration set (LOOP_NOTICE_CODES/LOOP_STOP_KINDS appear on neither side)", async () => {
    const { iterationLine } = await import("../lib/loop-session.mjs");

    const { fields } = iterationLine({
      iteration: 1,
      outcome: "ran",
      feature: "feat-x",
      mergeStatus: "merged",
      prUrl: "https://example.com/pr/1",
      wait: { requestedMinutes: 5, actualMinutes: 5 },
      notices: [],
    });

    expect(Object.keys(fields).sort()).toEqual(
      ["iteration", "outcome", "feature", "mergeStatus", "prUrl", "wait", "notices"].sort(),
    );
  });

  test("P1-10: mergeStatus is the literal \"n/a\" on an outcome that ran no pipeline (AT-36)", async () => {
    const { iterationLine } = await import("../lib/loop-session.mjs");

    const { fields } = iterationLine({
      iteration: 1,
      outcome: "idle",
      feature: null,
      mergeStatus: "n/a",
      prUrl: null,
      wait: null,
      notices: [],
    });

    expect(fields.mergeStatus).toBe("n/a");
  });
});

describe("sessionSummary — nine members, module-level field-set half of AT-37 (P1-10)", () => {
  test("P1-10: fields key set is deepEqual to a literal transcription of FSPEC §3.4's nine-member summary set (LOOP_NOTICE_CODES/LOOP_STOP_KINDS appear on neither side)", async () => {
    const { sessionSummary } = await import("../lib/loop-session.mjs");

    const { fields } = sessionSummary({
      state: {
        v: 1,
        preflightRan: true,
        consecutiveIdle: 0,
        schedulePos: 0,
        iteration: 1,
        merged: [],
        halted: [],
        escalationsRaised: [],
      },
      stopReason: "idle-exhausted",
      iterations: 1,
      merged: [],
      halted: [],
      escalationsRaised: [],
      operatorView: { items: [] },
      openEscalations: 0,
      nextActionable: null,
      notices: [],
    });

    // Transcribed literally from FSPEC §3.4's summary set — never derived
    // from LOOP_NOTICE_CODES or LOOP_STOP_KINDS (different sets — nine
    // fields, ten stop reasons, BR-28).
    expect(Object.keys(fields).sort()).toEqual(
      [
        "stopReason",
        "iterations",
        "merged",
        "halted",
        "escalationsRaised",
        "openEscalations",
        "nextActionable",
        "operatorView",
        "notices",
      ].sort(),
    );
    expect(Object.keys(fields).length).toBe(9);
  });
});

// ─── CR v1 F-08 — the WaitRecord has to reach the operator's eye ───────────
//
// `iterationLine` carried `wait` on `fields` and dropped it from `text`, and `cli.mjs`
// prints only `text` — so E-25's "the report states both the requested and the actual
// length" had no surface at all, which is why a bare number could be passed for a
// `WaitRecord` without any oracle noticing.
describe("iterationLine — the rendered line states the wait (E-25, AT-49, PROP-RPT-01)", () => {
  test("a requested/actual pair is rendered with both lengths", async () => {
    const { iterationLine } = await import("../lib/loop-session.mjs");

    const { text } = iterationLine({
      iteration: 2,
      outcome: "idle",
      feature: null,
      mergeStatus: "n/a",
      prUrl: null,
      wait: { requestedMinutes: 5, actualMinutes: 2 },
      notices: [],
    });

    expect(text).toContain("requested 5m");
    expect(text).toContain("actual 2m");
  });

  test("an unknown actual length is named as unknown, never silently reported as the requested one", async () => {
    const { iterationLine } = await import("../lib/loop-session.mjs");

    const { text } = iterationLine({
      iteration: 2,
      outcome: "idle",
      feature: null,
      mergeStatus: "n/a",
      prUrl: null,
      wait: { requestedMinutes: 5, actualMinutes: null },
      notices: [],
    });

    expect(text).toContain("requested 5m");
    expect(text).toContain("actual unknown");
  });

  test("no wait taken renders no wait clause — the line is byte-identical to the shipped one", async () => {
    const { iterationLine } = await import("../lib/loop-session.mjs");

    const { text } = iterationLine({
      iteration: 1,
      outcome: "ran",
      feature: "feat-x",
      mergeStatus: "merged",
      prUrl: null,
      wait: null,
      notices: [],
    });

    expect(text).toBe("Iteration 1: ran (feat-x) — merge merged.");
  });
});

// ─── PROP-RPT-04 — the ten-member stop-reason enumeration, exercised (AT-37) ─
//
// A session summary must be emittable on every member of FSPEC §3.4's ten-member
// stop-reason enumeration. The oracle's operand is the SET OF STOP REASONS ACTUALLY
// EXERCISED across session fixtures, set-equal to a ten-member literal transcribed into
// the test — `LOOP_STOP_KINDS` appears on neither side, so a catalogue-code-no-condition-
// raises regression (a stop reason added to the enumeration later without a fixture
// exercising it) reds here rather than passing by construction.
//
// Eight of the ten are produced by `nextDirective` itself (module comment, `loop-session.mjs`):
// this block drives all eight through `nextDirective` directly. The remaining two are
// produced OUTSIDE `nextDirective` — `preflight-refused` on `orchestrate-queue.js`'s own
// preflight-refusal path (proven through a real `main()` invocation in
// `loopQueueDriver.test.js`'s AT-13/AT-14 and CR v1 F-03 blocks) and `engine-dispatch-refused`
// on the engine's `cmdQueue` preflight path (proven through a real CLI invocation in
// `pdlc/engine/__tests__/loop-cli.test.js`). Both are named here by their exact literal so
// this file's own ten-member set-equality can't be satisfied by the eight
// `nextDirective`-producible members alone.
describe("PROP-RPT-04 — the ten-member stop-reason set, exercised (AT-37)", () => {
  test("eight stop reasons are exercised through nextDirective, plus the two produced outside it, set-equal to the ten-member literal", async () => {
    const { nextDirective } = await import("../lib/loop-session.mjs");

    const LOOP_DEFAULTS = Object.freeze({
      backoffSchedule: Object.freeze([5, 15, 30, 60]),
      idleStopAfter: 4,
      preflight: "strict",
      dirtyTreePolicy: "tracked",
    });

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

    const fixtures = [
      makeInput({ threw: "ECONNRESET", state: makeState({ consecutiveIdle: 2, schedulePos: 1 }) }),
      makeInput({ report: { outcome: "no-queue", reason: "queue empty", remaining: 0 } }),
      makeInput({
        report: {
          outcome: "blocked",
          reason: "feat-checkout-flow is in-progress and holds the merge lock",
          active: "feat-checkout-flow",
          remaining: 2,
        },
      }),
      makeInput({
        report: { outcome: "halted", reason: "PROPERTIES fixture halt", remaining: 3, active: null },
      }),
      makeInput({
        report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
        queue: { readable: false, awaitingMerge: [] },
      }),
      makeInput({
        report: { outcome: "idle", reason: "no ready candidate", remaining: 2 },
        queue: { readable: true, awaitingMerge: ["feat-billing-portal"] },
      }),
      makeInput({
        report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
        config: { ...LOOP_DEFAULTS, backoffSchedule: [] },
        state: makeState({ consecutiveIdle: 0, schedulePos: 0 }),
      }),
      makeInput({
        report: { outcome: "idle", reason: "no ready candidate", remaining: 0 },
        config: LOOP_DEFAULTS,
        state: makeState({ consecutiveIdle: 3, schedulePos: 3 }),
      }),
    ];

    const exercisedViaNextDirective = fixtures
      .map((input) => nextDirective(input).stopReason)
      .filter(Boolean);

    // Non-vacuity: exactly the eight expected members, none dropped, none duplicated away.
    expect(new Set(exercisedViaNextDirective).size).toBe(8);

    const exercised = new Set([
      ...exercisedViaNextDirective,
      // Proven through main()/CLI integration elsewhere (see block comment above) — named
      // here by literal so this test's own set-equality is not satisfiable without them.
      "preflight-refused",
      "engine-dispatch-refused",
    ]);

    // Transcribed literally from FSPEC §3.4's stop-reason enumeration — never derived from
    // LOOP_STOP_KINDS (Oracle discipline item 2).
    expect(exercised).toEqual(
      new Set([
        "preflight-refused",
        "queue-blocked",
        "pipeline-halted",
        "no-queue",
        "awaiting-merge",
        "idle-exhausted",
        "invocation-threw",
        "queue-unreadable",
        "backoff-unenterable",
        "engine-dispatch-refused",
      ]),
    );
  });
});

// ─── PROP-RPT-08 (negative) — the session report is never read back for a ──
// later render ────────────────────────────────────────────────────────────
//
// The session report is the authoritative RECORD, never a SOURCE — a re-run must
// reproduce the view from the on-disk log alone, never from a prior report. Proven at
// integration level: a second session over the same on-disk log, with no prior report
// handed anywhere in its input, still produces the correct view — there is no seam through
// which a prior report even *could* be threaded back in. See
// `loopQueueDriver.test.js`'s PROP-VIEW-12 block ("two renders over unchanged inputs are
// deep-equal") for the full IO-mediated proof; this block pins the narrower, purely
// structural half of the same claim: `main`'s signature carries no parameter through which
// a previous report could flow back in as an input to a later render.
describe("PROP-RPT-08 (negative) — the session report is never read back for a later render (AC-4.1 sole-input rule)", () => {
  test("main's own module source names no parameter re-admitting a prior report as an input", async () => {
    const { readFileSync } = await import("fs");
    const { dirname, join } = await import("path");
    const { fileURLToPath } = await import("url");
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(__dirname, "..", "orchestrate-queue.js"), "utf8");
    const start = source.indexOf("export default async function main(");
    const signature = source.slice(start, source.indexOf("} = {}) {", start));

    // `main`'s destructured parameter list (TSPEC §Interfaces) carries seams for reading
    // QUEUE.md/REQ files/config/ESCALATIONS.md and a `loopState` token — never a
    // `priorReport` / `previousReport` / `lastReport` shaped parameter. Sliced to the
    // signature itself (not the whole file) so this can't pass merely because those words
    // are absent from unrelated code elsewhere in a 17,000-line module.
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).not.toMatch(/\bpriorReport\b/);
    expect(signature).not.toMatch(/\bpreviousReport\b/);
    expect(signature).not.toMatch(/\blastReport\b/);
    expect(signature).not.toMatch(/\bloop(State)?Summary\b/);
  });
});
