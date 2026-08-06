// advisoryRung.test.js — PLAN A-04 (batch 3, depends on A-02).
//
// RED: authored as a single `skipped-describe` block named for its green owner,
// A-18 (PLAN §5.2 — every new case is reported as skipped until its owner
// un-skips it). Un-skipping this block is A-18's job, not this task's.
//
// Scope: TSPEC §3.4's model-rung ladder —
//   T-01-2  rung resolvable ⇒ summary names the rung, no fallback
//   T-01-3  rung rejected before output ⇒ ADVISORY_MODEL_FALLBACK, re-dispatch, proceed
//   T-01-4  neither rung resolves ⇒ run fails loudly, no advisory agent ran
//   T-01-5  a dispatch that starts and fails mid-flight ⇒ ordinary invocation failure,
//           never the fallback ladder (this is why `isModelResolutionError` is a
//           separately-tested pure predicate, TSPEC §3.4)
//   T-01-7  lazy resolution — a non-null `_state` memo returns immediately, so a run in
//           which the ladder already resolved (or a second seam in the same run) never
//           re-dispatches
//
// Every double is drawn from `advisoryDoubles.js` (PLAN §6.1 AC-INFRA-1); this file
// declares no ad-hoc agent stub, per PROP-INFRA-01's scan (`advisoryPreflight.test.js`).
//
// `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` are module-private constants (TSPEC §3.1 —
// no `export` keyword, and absent from the §2.3 bundle prelude list), so this file
// transcribes their literals directly from TSPEC §3.1 rather than importing them:
//   MODEL_ADVISORY = "fable", MODEL_ADVISORY_FALLBACK = "opus".

//
// Import shape. Under this project's native-ESM jest runtime, a named import of a binding a
// module does not yet provide fails the whole file to load with a SyntaxError naming the missing
// export (see advisoryVerdict.test.js's header for the precedent). Neither
// isModelResolutionError nor resolveAdvisoryRung is exported by orchestrate-dev.js yet at A-04,
// so this file imports the module as a namespace (`import * as dev`) and reaches both symbols as
// dev.isModelResolutionError / dev.resolveAdvisoryRung, including from inside the (skipped) case
// bodies.
import * as dev from "../orchestrate-dev.js";
import { makeAgentDouble } from "./helpers/advisoryDoubles.js";

const MODEL_ADVISORY = "fable";
const MODEL_ADVISORY_FALLBACK = "opus";

function makeLogs() {
  const logs = [];
  const _log = (message) => logs.push(String(message));
  return { logs, _log };
}

describe("A-18 — model rung resolution (isModelResolutionError, resolveAdvisoryRung)", () => {
  // ─── isModelResolutionError — pure predicate (TSPEC §3.4) ─────────────────
  describe("isModelResolutionError — classification", () => {
    test.each([
      ["unknown model alias", new Error('unknown model alias "fable"')],
      ["unrecognised alias (British spelling)", new Error('unrecognised model alias "fable"')],
      ["unrecognized alias (American spelling)", new Error('unrecognized model alias "fable"')],
      ["invalid model", new Error('invalid model "fable" requested')],
      ["unsupported alias", new Error('unsupported alias: "fable"')],
    ])("matches a %s rejection", (_label, err) => {
      expect(dev.isModelResolutionError(err)).toBe(true);
    });

    test.each([
      ["a network error", new Error("ECONNRESET: connection reset by peer")],
      ["a rate-limit error", new Error("429 Too Many Requests")],
      ["a timeout", new Error("dispatch timed out after 30000ms")],
      ["an error naming neither model nor alias", new Error("unknown host")],
    ])("does not match %s", (_label, err) => {
      expect(dev.isModelResolutionError(err)).toBe(false);
    });

    test("does not throw on a non-Error rejection value and returns false when it names neither model nor alias", () => {
      expect(dev.isModelResolutionError("plain string failure")).toBe(false);
      expect(dev.isModelResolutionError(undefined)).toBe(false);
      expect(dev.isModelResolutionError(null)).toBe(false);
      expect(dev.isModelResolutionError({})).toBe(false);
    });

    test("matches when a plain object carries a matching .message, not only an Error instance", () => {
      expect(dev.isModelResolutionError({ message: 'unknown model "fable"' })).toBe(true);
    });
  });

  // ─── T-01-2 — rung resolvable ──────────────────────────────────────────────
  describe("resolveAdvisoryRung — T-01-2 (rung resolvable)", () => {
    test("resolves on the advisory rung, reports no fallback, and dispatches exactly once", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { logs, _log } = makeLogs();
      const _state = { resolved: null };

      const rung = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state });

      expect(rung).toEqual({ model: MODEL_ADVISORY, fallback: false });
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
    });
  });

  // ─── T-01-3 — fallback taken, declared ─────────────────────────────────────
  describe("resolveAdvisoryRung — T-01-3 (fallback declaration)", () => {
    test("re-dispatches on the fallback rung and warns, naming both the unresolvable value and the substitute", async () => {
      const agent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, "well-formed trailer"],
        throwOn: new Set([0]),
      });
      const { logs, _log } = makeLogs();
      const _state = { resolved: null };

      const rung = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state });

      expect(rung).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });
      expect(agent.calls).toHaveLength(2);
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
      expect(agent.calls[1].opts).toMatchObject({ model: MODEL_ADVISORY_FALLBACK });
      // M-2: the same prompt is re-dispatched on the fallback rung.
      expect(agent.calls[1].prompt).toBe(agent.calls[0].prompt);

      const warning = logs.find((line) => line.includes("ADVISORY_MODEL_FALLBACK"));
      expect(warning).toBeDefined();
      expect(warning).toContain(MODEL_ADVISORY);
      expect(warning).toContain(MODEL_ADVISORY_FALLBACK);
    });
  });

  // ─── T-01-4 — neither rung resolves ────────────────────────────────────────
  describe("resolveAdvisoryRung — T-01-4 (both rungs fail ⇒ halt)", () => {
    test("halts loudly naming both rungs, and no advisory agent output was produced", async () => {
      const agent = makeAgentDouble({
        script: [
          `unrecognised model alias "${MODEL_ADVISORY}"`,
          `unrecognised model alias "${MODEL_ADVISORY_FALLBACK}"`,
        ],
        throwOn: new Set([0, 1]),
      });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      const error = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state }).catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.isHalt).toBe(true);
      expect(error.message).toMatch(/model/i);
      expect(error.message).toContain(MODEL_ADVISORY);
      expect(error.message).toContain(MODEL_ADVISORY_FALLBACK);
      // M-3: there is no third rung — exactly the two attempts were made, both rejected,
      // so no advisory agent output was ever produced.
      expect(agent.calls).toHaveLength(2);
    });
  });

  // ─── T-01-5 — ordinary mid-flight failure, ladder never entered ───────────
  describe("resolveAdvisoryRung — T-01-5 (mid-flight failure is not a model error)", () => {
    test("propagates the original error without entering the fallback ladder", async () => {
      const agent = makeAgentDouble({
        script: ["ECONNRESET: connection reset by peer"],
        throwOn: new Set([0]),
      });
      const { logs, _log } = makeLogs();
      const _state = { resolved: null };

      const error = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state }).catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("ECONNRESET");
      // Not the M-3 halt shape — an ordinary invocation failure, dispositioned by the
      // seam's own try/catch (TSPEC §4.6), never by this ladder.
      expect(error.isHalt).not.toBe(true);
      // Only the one attempt was made — no re-dispatch on the fallback rung.
      expect(agent.calls).toHaveLength(1);
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
    });
  });

  // ─── T-01-7 — lazy resolution, memoized once per run ───────────────────────
  describe("resolveAdvisoryRung — T-01-7 (lazy `_state` memo)", () => {
    test("a second call with the same resolved _state returns immediately without a second dispatch", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      const first = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state });
      expect(agent.calls).toHaveLength(1);
      expect(_state.resolved).not.toBeNull();

      const second = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state });

      expect(second).toEqual(first);
      // No further dispatch: the memo satisfied the second call (M-4).
      expect(agent.calls).toHaveLength(1);
    });

    test("a pre-populated memo short-circuits before any dispatch is attempted", async () => {
      const agent = makeAgentDouble({ script: [] });
      const { _log } = makeLogs();
      const _state = { resolved: { model: MODEL_ADVISORY_FALLBACK, fallback: true } };

      const rung = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state });

      expect(rung).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });
      expect(agent.calls).toHaveLength(0);
    });
  });
});
