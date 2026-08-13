// consolidationRung.test.js — PLAN T06. Authored RED; both blocks are un-skipped and green
// as of T11 and T31.
//
// Two blocks, each un-skipped by its own owning task — never rewritten by it, per PLAN §13.3's
// batch-safety rule 2:
//
//   T11 — AT-M10: the shipped `resolveAdvisoryRung` call site (`orchestrate-dev.js:3132`) is
//     unchanged by the §8.1 signature widening — the default `skill` is `ADVISORY_RUNG_SKILL` on
//     every path (primary rung, fallback rung, memoised path), asserted here BESIDE
//     `advisoryRung.test.js`'s existing PROP-RUNG-*/T-01-* expectations rather than by copying
//     them. This block drives the real, already-shipped `dev.resolveAdvisoryRung` and needs no new
//     production code to go green once T11 adds the optional `skill` parameter (it is optional and
//     defaults to the constant, so the call shape below — no `skill` passed — is unchanged by T11's
//     edit; only the signature grows).
//
//   T31 — AT-M7/AT-M8: the §8.4 `_log` tee captures the resolver's `ADVISORY_MODEL_FALLBACK:`
//     line verbatim while still forwarding it to the caller's sink (nothing swallowed), and
//     captures the resolver's unresolved-model halt message verbatim too (§8.4's "one capture
//     serving both report-body obligations"). This block isolates the tee itself — TSPEC §8.4's
//     `const dispatchLog = []; const teeLog = (msg) => { dispatchLog.push(String(msg)); _log(msg); };`
//     — wrapped around the REAL, shipped `dev.resolveAdvisoryRung`, with no corpus/marker/config
//     fixture in the way. The end-to-end half of the same obligation — `main()` threading its
//     `state.dispatchLog` sink through the resolver (`consolidate-learnings.js:510-516`) and
//     `renderReportBody` folding that log into the body (`:1018`) — is landed, and is asserted
//     through a full pass by `consolidationPass.test.js`'s AT-M7. Kept separate on purpose: this
//     block still falsifies the tee's forward-and-capture shape if the pass-level fixture changes.

import * as dev from "../orchestrate-dev.js";
import { makeAgentDouble } from "./helpers/consolidationDoubles.js";

// Module-private literals (TSPEC §3.1/§8.1) — transcribed, not imported, exactly as
// advisoryRung.test.js already transcribes them for this same reason (no `export`, and absent
// from the bundle prelude list).
const ADVISORY_RUNG_SKILL = "se-review";
const MODEL_ADVISORY = "fable";
const MODEL_ADVISORY_FALLBACK = "opus";

function makeLogs() {
  const logs = [];
  const _log = (message) => logs.push(String(message));
  return { logs, _log };
}

/** TSPEC §8.4's tee, transcribed verbatim: forwards to the caller's sink AND retains the text. */
function makeTee(_log) {
  const dispatchLog = [];
  const teeLog = (msg) => {
    dispatchLog.push(String(msg));
    _log(msg);
  };
  return { dispatchLog, teeLog };
}

// ─── T11 — AT-M10 ───────────────────────────────────────────────────────────
describe("T11 — AT-M10: resolveAdvisoryRung's shipped call site is unchanged by the §8.1 widening", () => {
  describe("no `skill` argument dispatches the default, ADVISORY_RUNG_SKILL, on every path", () => {
    test("primary rung resolves: the one dispatch carries ADVISORY_RUNG_SKILL", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "p" });

      expect(result).toEqual({ kind: "response", raw: "well-formed trailer" });
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls[0].skill).toBe(ADVISORY_RUNG_SKILL);
    });

    test("fallback rung resolves: both dispatches carry ADVISORY_RUNG_SKILL, never a second skill", async () => {
      const agent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, "well-formed trailer"],
        throwOn: new Set([0]),
      });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "p" });

      expect(agent.calls).toHaveLength(2);
      expect(agent.calls[0].skill).toBe(ADVISORY_RUNG_SKILL);
      expect(agent.calls[1].skill).toBe(ADVISORY_RUNG_SKILL);
    });

    test("memoised path: the cached-rung dispatch also carries ADVISORY_RUNG_SKILL", async () => {
      const agent = makeAgentDouble({ script: ["first trailer", "second trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "first" });
      await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "second" });

      expect(agent.calls).toHaveLength(2);
      expect(agent.calls[1].skill).toBe(ADVISORY_RUNG_SKILL);
    });

    test("every other observable of the shipped call site is unchanged (regression pin, beside advisoryRung.test.js's T-01-2/T-01-3 suite rather than a copy of it)", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({
        _agent: agent,
        _log,
        _state,
        prompt: "the seam's own DIAGNOSE prompt",
      });

      expect(result.raw).toBe("well-formed trailer");
      expect(agent.calls[0].prompt).toBe("the seam's own DIAGNOSE prompt");
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
    });
  });
});

// ─── T31 — AT-M7/AT-M8 ──────────────────────────────────────────────────────
describe("T31 — AT-M7/AT-M8: the §8.4 _log tee captures the resolver's text verbatim, and forwards it", () => {
  describe("ADVISORY_MODEL_FALLBACK: and the unresolved-model halt message, through the tee main() builds", () => {
    test("AT-M7 — fallback resolves: the tee retains ADVISORY_MODEL_FALLBACK verbatim AND still forwards it to the caller's sink", async () => {
      const agent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, "well-formed trailer"],
        throwOn: new Set([0]),
      });
      const { logs, _log } = makeLogs();
      const { dispatchLog, teeLog } = makeTee(_log);
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log: teeLog, _state, prompt: "p" });

      // Proceeds (M-2): a resolved response, on the fallback rung — the "non-failed" half of
      // AT-M7 that a pass built on this result reaches a non-`failed` terminal status from.
      expect(result.kind).toBe("response");
      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });

      const line = `ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not resolve — substituting "${MODEL_ADVISORY_FALLBACK}"`;
      // Retained verbatim — this is the text a report body renders (§8.4's obligation).
      expect(dispatchLog).toContain(line);
      // Forwarded verbatim too — "nothing is swallowed": the operator's own run log still sees it.
      expect(logs).toContain(line);
    });

    test("AT-M8 — primary resolves: no ADVISORY_MODEL_FALLBACK line is retained or forwarded (the paired negative)", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { logs, _log } = makeLogs();
      const { dispatchLog, teeLog } = makeTee(_log);
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log: teeLog, _state, prompt: "p" });

      expect(result.kind).toBe("response");
      // The rung actually run on is the primary — the state a pass's own `rung:` field is derived
      // from (PassState.rung, TSPEC §6.1).
      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY, fallback: false });
      expect(dispatchLog.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
    });

    test("neither rung resolves: the tee still retains ADVISORY_MODEL_FALLBACK (emitted before the fallback attempt), and the caller captures the halt message verbatim onto the same buffer (§8.4: one capture serving both report-body obligations)", async () => {
      const agent = makeAgentDouble({
        script: [
          `unrecognised model alias "${MODEL_ADVISORY}"`,
          `unrecognised model alias "${MODEL_ADVISORY_FALLBACK}"`,
        ],
        throwOn: new Set([0, 1]),
      });
      const { logs, _log } = makeLogs();
      const { dispatchLog, teeLog } = makeTee(_log);
      const _state = { resolved: null };

      const error = await dev
        .resolveAdvisoryRung({ _agent: agent, _log: teeLog, _state, prompt: "p" })
        .catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.isHalt).toBe(true);

      // §10.2's one caught exception: `main()` pushes the error's own message onto the same
      // buffer the tee already holds, at the point it dispositions the row as `failed` with no
      // reason code (§2.6 row 4, `failNoReason`). Reproduced here exactly as TSPEC §8.4 states it,
      // since `main()` does not exist yet to do it itself.
      dispatchLog.push(String(error.message));

      const fallbackLine = `ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not resolve — substituting "${MODEL_ADVISORY_FALLBACK}"`;
      // The substitution notice fired before the fallback attempt itself failed — retained AND
      // forwarded, same as AT-M7's positive case.
      expect(dispatchLog).toContain(fallbackLine);
      expect(logs).toContain(fallbackLine);
      // The unresolved-model error message reaches the (future) report verbatim — this buffer is
      // what `renderReportBody` will read (§8.4's "report-body only" buffer).
      expect(dispatchLog).toContain(error.message);
      expect(error.message).toContain(MODEL_ADVISORY);
      expect(error.message).toContain(MODEL_ADVISORY_FALLBACK);
    });
  });
});
