// advisoryRung.test.js — PLAN A-04 / A-18, re-pointed at the shipped ladder by the DoD v1
// remediation (CODE_REVIEW-pdlc-advisory-tier-v1.md findings 1 and 2, traceability rows 1–5).
//
// What changed and why. This file used to exercise a `resolveAdvisoryRung` that issued its own
// discarded-output *probe* dispatch, while `runAdvisorySeam` shipped a second, private copy of the
// ladder (`dispatchViaRungLadder`) that classified the rejection of the seam's real DIAGNOSE
// dispatch. Two ladders, one shipped and one tested — so every case below was green against code
// no run ever executed, and the shipped fallback/both-rungs-fail branches were uncovered. The two
// have been reconciled to ONE ladder: `resolveAdvisoryRung` now IS the seam's real dispatch (it
// takes the seam's own `prompt` and returns `{kind:"response",raw}` / `{kind:"dispatch-error",err}`,
// rejecting with a halt when neither rung resolves), and `runAdvisorySeam` calls it. Every case
// here therefore drives production bytes, and each of T-01-2…-5/-7 is asserted BOTH directly
// against the ladder and through `runAdvisorySeam`, which is the caller a run actually has.
//
// Scope: TSPEC §3.4's model-rung ladder —
//   T-01-2  rung resolvable ⇒ summary names the rung, no fallback (PROP-RUNG-09)
//   T-01-3  rung rejected before output ⇒ ADVISORY_MODEL_FALLBACK, re-dispatch, proceed
//   T-01-4  neither rung resolves ⇒ run fails loudly, no advisory agent ran
//   T-01-5  a dispatch that starts and fails mid-flight ⇒ ordinary invocation failure,
//           never the fallback ladder (this is why `isModelResolutionError` is a
//           separately-tested pure predicate, TSPEC §3.4)
//   T-01-7  lazy resolution — a non-null `_state` memo dispatches on the cached rung, so a run in
//           which the ladder already resolved (or a second seam in the same run) never re-enters it
// plus PROP-RUNG-01 (the one-constant-per-rung source scan), PROP-RUNG-02 (the fallback rung is a
// separate constant, not an alias of `MODEL_DEFAULT`), PROP-RUNG-08 (the memo is a threaded
// parameter, never module state) and PROP-RUNG-09 (the no-fallback positive control, driven to the
// summary the report carries and to the record's own `Model` row).
//
// Every double is drawn from `advisoryDoubles.js` (PLAN §6.1 AC-INFRA-1); this file
// declares no ad-hoc agent stub, per PROP-INFRA-01's scan (`advisoryPreflight.test.js`).
//
// `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` are module-private constants (TSPEC §3.1 —
// no `export` keyword, and absent from the §2.3 bundle prelude list), so this file
// transcribes their literals directly from TSPEC §3.1 rather than importing them:
//   MODEL_ADVISORY = "fable", MODEL_ADVISORY_FALLBACK = "opus".
// PROP-RUNG-01 below is what keeps that transcription honest in the other direction: it asserts the
// module carries exactly one sanctioned declaration of the advisory-rung literal and no bare copy
// of it anywhere else, in either module.
//
// Import shape: namespace import (`import * as dev`), matching this file's original A-04 shape and
// `advisoryVerdict.test.js`'s precedent.
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as dev from "../orchestrate-dev.js";
import {
  makeAgentDouble,
  makeSeamOps,
  makeFileDouble,
  makeFakeClock,
  makeAdvisoryConfig,
} from "./helpers/advisoryDoubles.js";

const MODEL_ADVISORY = "fable";
const MODEL_ADVISORY_FALLBACK = "opus";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const QUEUE_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-queue.js"), "utf8");

/** This file's feature name, threaded to every `runAdvisorySeam` call below. */
const FEATURE = "pdlc-advisory-tier";

function makeLogs() {
  const logs = [];
  const _log = (message) => logs.push(String(message));
  return { logs, _log };
}

// ─── Fixtures ───────────────────────────────────────────────────────────────────────────────────
// A raw agent trailer in the grammar `parseAdvisoryVerdict` fixes (one `KEY: value` line per
// field) — a plain fixture builder, not a canonical double, exactly as `advisoryDriver.test.js`
// carries its own.
function verdictFixture(seam, proposedAction) {
  return [
    `SEAM: ${seam}`,
    "DIAGNOSIS: diagnosis text",
    `PROPOSED-ACTION: ${proposedAction}`,
    "CONFIDENCE: high",
    "WITHIN-ENVELOPE: yes",
    "EVIDENCE: file.js:12",
  ].join("\n");
}

// `SeamOps` overrides, built positionally so no object literal in this file ever carries two
// `SeamOps` member names as `key:` pairs (PROP-INFRA-01; `advisoryDriver.test.js` does the same).
function seamOpsOverrides(permittedActions, declaredScope, producedPaths) {
  const o = {};
  o.permittedActions = permittedActions;
  o.declaredScope = declaredScope;
  if (producedPaths !== undefined) o.producedPaths = producedPaths;
  return o;
}

const ACTION = "rewrite-citation";
const SCOPE = ["owned/path.js"];

/** A `SeamOps` double whose whole lifecycle succeeds, so the run reaches `resolved`. */
function resolvingSeamOps() {
  return makeSeamOps(seamOpsOverrides([ACTION], SCOPE, async () => SCOPE));
}

/**
 * The one `runAdvisorySeam` call site in this file — the production caller of the ladder. Returns
 * the disposition alongside the file and agent doubles so a case can assert the record bytes and
 * the dispatch sequence, not only the return value.
 */
async function runSeam({ seam = "A2", agent, seamOps, rungState, config }) {
  const files = makeFileDouble();
  // The deadline resolves on a macrotask, so a dispatch settling a few microtask hops deeper than
  // it — which the ladder's fallback re-dispatch necessarily does — is not preempted on hop-count
  // alone. See `makeFakeClock`'s own note; production `_sleep` is a real timer.
  const clock = makeFakeClock({ sleepResolvesOnMacrotask: true });
  const { logs, _log } = makeLogs();
  const disposition = await dev.runAdvisorySeam({
    seam,
    feature: FEATURE,
    seamOps,
    config: config || makeAdvisoryConfig({ enabled: true }).config,
    rungState: rungState || { resolved: null },
    _agent: agent,
    _appendFile: files._appendFile,
    _writeFile: files._writeFile,
    _readFile: files._readFile,
    _git: async () => ({ ok: true, stdout: "" }),
    _log,
    _now: clock._now,
    _sleep: clock._sleep,
  });
  return { disposition, files, logs };
}

describe("A-18 — model rung resolution (isModelResolutionError, resolveAdvisoryRung)", () => {
  // ─── isModelResolutionError — pure predicate (TSPEC §3.4, PROP-RUNG-03) ───
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

  // ─── PROP-RUNG-01 — one constant per rung, no bare literal anywhere ───────
  //
  // AC-1.1 / AC-1.5: exactly one constant names each rung, and every advisory dispatch site in
  // BOTH modules reaches the rung through it. Asserted as a source scan for a bare quoted
  // advisory-model literal outside the single sanctioned declaration — the direction of drift that
  // matters, since a second copy of `"fable"` pinned at a call site would keep every behavioural
  // case in this file green while silently un-pinning that call site from the constant.
  describe("PROP-RUNG-01 — exactly one sanctioned advisory-rung literal, in either module", () => {
    // The declaration line the scan sanctions, transcribed from TSPEC §3.1. Matching the whole
    // declaration (not just the literal) is what makes "outside the constant" decidable.
    const SANCTIONED_DECLARATION = /const MODEL_ADVISORY = "fable";/;
    /** Every quoted occurrence of the advisory-rung literal, in either quote style. */
    const BARE_LITERAL = /["']fable["']/g;

    function bareLiteralsOutsideDeclaration(source) {
      const stripped = source.replace(SANCTIONED_DECLARATION, "");
      return stripped.match(BARE_LITERAL) || [];
    }

    test("falsifiability: the scan catches a planted second literal and passes the sanctioned one alone", () => {
      const sanctionedOnly = 'const MODEL_ADVISORY = "fable";\n';
      expect(bareLiteralsOutsideDeclaration(sanctionedOnly)).toEqual([]);
      const planted = sanctionedOnly + 'await _agent("se-review", p, { model: "fable" });\n';
      expect(bareLiteralsOutsideDeclaration(planted)).toHaveLength(1);
    });

    test("orchestrate-dev.js declares the advisory rung exactly once (positive control)", () => {
      expect(DEV_SOURCE).toMatch(SANCTIONED_DECLARATION);
      expect(DEV_SOURCE.match(BARE_LITERAL)).toHaveLength(1);
    });

    test("orchestrate-dev.js carries no bare advisory-rung literal outside that declaration", () => {
      expect(bareLiteralsOutsideDeclaration(DEV_SOURCE)).toEqual([]);
    });

    test("orchestrate-queue.js carries no advisory-rung literal at all — it reaches the rung through runAdvisorySeam", () => {
      expect(bareLiteralsOutsideDeclaration(QUEUE_SOURCE)).toEqual([]);
      expect(QUEUE_SOURCE).toContain("runAdvisorySeam");
    });

    test("every model option the ladder dispatches under is a constant reference, never a literal", () => {
      // The ladder is the only place in either module that names an advisory rung; both of its
      // dispatch sites pass the constant, so this pins the two `dispatchAt(...)` arguments.
      expect(DEV_SOURCE).toContain("dispatchAt(MODEL_ADVISORY)");
      expect(DEV_SOURCE).toContain("dispatchAt(MODEL_ADVISORY_FALLBACK)");
    });
  });

  // ─── PROP-RUNG-02 — the fallback rung is a separate constant ──────────────
  describe("PROP-RUNG-02 — MODEL_ADVISORY_FALLBACK is its own constant, not an alias of MODEL_DEFAULT", () => {
    test("it is declared with its own literal, so repointing MODEL_DEFAULT cannot move the fallback rung", () => {
      // Both declarations exist independently…
      expect(DEV_SOURCE).toMatch(/const MODEL_DEFAULT = "opus";/);
      expect(DEV_SOURCE).toMatch(/const MODEL_ADVISORY_FALLBACK = "opus";/);
      // …and the fallback is never written as an alias (`= MODEL_DEFAULT`), which is the single
      // edit that would couple them.
      expect(DEV_SOURCE).not.toMatch(/const MODEL_ADVISORY_FALLBACK\s*=\s*MODEL_DEFAULT\b/);

      // The mutation, run as text: repoint MODEL_DEFAULT and the fallback declaration is untouched.
      const mutated = DEV_SOURCE.replace(
        /const MODEL_DEFAULT = "opus";/,
        'const MODEL_DEFAULT = "sentinel-default-model";'
      );
      expect(mutated).toMatch(/const MODEL_DEFAULT = "sentinel-default-model";/);
      expect(mutated).toMatch(/const MODEL_ADVISORY_FALLBACK = "opus";/);
    });

    test("and the rung the ladder actually substitutes is that constant's value (behavioural leg)", async () => {
      const agent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, "well-formed trailer"],
        throwOn: new Set([0]),
      });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "seam prompt" });

      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });
    });
  });

  // ─── T-01-2 — rung resolvable ──────────────────────────────────────────────
  describe("resolveAdvisoryRung — T-01-2 (rung resolvable)", () => {
    test("resolves on the advisory rung, reports no fallback, dispatches exactly once, and hands the caller's prompt back as a response", async () => {
      const agent = makeAgentDouble({ script: ["well-formed trailer"] });
      const { logs, _log } = makeLogs();
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({
        _agent: agent,
        _log,
        _state,
        prompt: "the seam's own DIAGNOSE prompt",
      });

      expect(result).toEqual({ kind: "response", raw: "well-formed trailer" });
      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY, fallback: false });
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
      // The ladder dispatches the SEAM's prompt — it is the real dispatch, never a probe
      // (TSPEC §3.4: "never a separate probe").
      expect(agent.calls[0].prompt).toBe("the seam's own DIAGNOSE prompt");
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
    });

    test("through runAdvisorySeam: one dispatch, the seam's prompt, the disposition names the advisory rung", async () => {
      const seamOps = resolvingSeamOps();
      const agent = makeAgentDouble({ script: [verdictFixture("A2", ACTION)] });

      const { disposition } = await runSeam({ agent, seamOps });

      expect(disposition.outcome).toBe("resolved");
      expect(disposition.model).toBe(MODEL_ADVISORY);
      expect(disposition.fallback).toBe(false);
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
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

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "seam prompt" });

      expect(result).toEqual({ kind: "response", raw: "well-formed trailer" });
      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });
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

    test("through runAdvisorySeam (AC-1.3): the seam PROCEEDS on the substituted rung, and the substitution is on the disposition, the record and the report summary", async () => {
      const seamOps = resolvingSeamOps();
      const agent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, verdictFixture("A2", ACTION)],
        throwOn: new Set([0]),
      });

      const { disposition, files, logs } = await runSeam({ agent, seamOps });

      // (d) proceed — the substitution costs no attempt and the lifecycle completes.
      expect(disposition.outcome).toBe("resolved");
      expect(disposition.attempts).toBe(0);
      expect(seamOps.calls.apply).toHaveLength(1);
      // (b) the disposition carries the substituted rung.
      expect(disposition.model).toBe(MODEL_ADVISORY_FALLBACK);
      expect(disposition.fallback).toBe(true);
      // (a) the warning names both rungs.
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(true);
      // (c) exactly one re-dispatch, on the fallback rung.
      expect(agent.calls).toHaveLength(2);
      expect(agent.calls[1].opts).toMatchObject({ model: MODEL_ADVISORY_FALLBACK });
      // The record's Model row shows the substitution (PROP-RUNG-04, T-08-7)…
      const record = files.appends.find((a) => a.path.endsWith(`ADVISORY-${FEATURE}.md`));
      expect(record.contents).toContain(`| Model | ${MODEL_ADVISORY_FALLBACK} (fallback) |`);
      // …and so does the report summary the run actually carries.
      const summary = dev.advisorySummaryRows([disposition]);
      const a2 = summary.rows.find((row) => row.seam === "A2");
      expect(a2.model).toBe(MODEL_ADVISORY_FALLBACK);
      expect(a2.fallback).toBe(true);
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

      const error = await dev
        .resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "seam prompt" })
        .catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.isHalt).toBe(true);
      expect(error.message).toMatch(/model/i);
      expect(error.message).toContain(MODEL_ADVISORY);
      expect(error.message).toContain(MODEL_ADVISORY_FALLBACK);
      // M-3: there is no third rung — exactly the two attempts were made, both rejected,
      // so no advisory agent output was ever produced.
      expect(agent.calls).toHaveLength(2);
      // And no rung was memoised, so a later call cannot inherit a resolution that never happened.
      expect(_state.resolved).toBeNull();
    });

    test("through runAdvisorySeam (AC-1.4): the halt PROPAGATES — it is never mapped to an escalated disposition, and nothing is applied", async () => {
      const seamOps = resolvingSeamOps();
      const agent = makeAgentDouble({
        script: [
          `unrecognised model alias "${MODEL_ADVISORY}"`,
          `unrecognised model alias "${MODEL_ADVISORY_FALLBACK}"`,
        ],
        throwOn: new Set([0, 1]),
      });

      const error = await runSeam({ agent, seamOps }).catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.isHalt).toBe(true);
      expect(error.message).toContain(MODEL_ADVISORY);
      expect(error.message).toContain(MODEL_ADVISORY_FALLBACK);
      // No third rung and no advisory agent output: exactly two dispatches, nothing applied.
      expect(agent.calls).toHaveLength(2);
      expect(seamOps.calls.apply).toHaveLength(0);
    });
  });

  // ─── T-01-5 — ordinary mid-flight failure, ladder never entered ───────────
  describe("resolveAdvisoryRung — T-01-5 (mid-flight failure is not a model error)", () => {
    test("returns the original error as a dispatch-error without entering the fallback ladder", async () => {
      const agent = makeAgentDouble({
        script: ["ECONNRESET: connection reset by peer"],
        throwOn: new Set([0]),
      });
      const { logs, _log } = makeLogs();
      const _state = { resolved: null };

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "seam prompt" });

      // Not the M-3 halt shape and not a resolution — an ordinary invocation failure, handed to
      // the seam's own attempt loop (TSPEC §4.6) to disposition.
      expect(result.kind).toBe("dispatch-error");
      expect(result.err.message).toContain("ECONNRESET");
      expect(result.err.isHalt).not.toBe(true);
      // Only the one attempt was made — no re-dispatch on the fallback rung.
      expect(agent.calls).toHaveLength(1);
      expect(_state.resolved).toBeNull();
      expect(logs.some((line) => line.includes("ADVISORY_MODEL_FALLBACK"))).toBe(false);
    });

    test("through runAdvisorySeam (PROP-RUNG-05): it consumes attempts as an ordinary failure, fallback stays false, and the fallback rung is never dispatched", async () => {
      const seamOps = resolvingSeamOps();
      const config = makeAdvisoryConfig({ enabled: true, attemptBudget: 2 }).config;
      const agent = makeAgentDouble({
        script: ["ECONNRESET: connection reset by peer", "ECONNRESET: connection reset by peer"],
        throwOn: new Set([0, 1]),
      });

      const { disposition } = await runSeam({ agent, seamOps, config });

      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
      expect(disposition.attempts).toBe(2);
      expect(disposition.fallback).toBe(false);
      // Exactly the two attempt-loop dispatches — a fallback re-dispatch would make it three or
      // four, and every one of them named the advisory rung.
      expect(agent.calls).toHaveLength(2);
      for (const call of agent.calls) {
        expect(call.opts).toMatchObject({ model: MODEL_ADVISORY });
      }
      expect(seamOps.calls.apply).toHaveLength(0);
    });
  });

  // ─── T-01-7 / PROP-RUNG-08 — lazy resolution, memoized once per run ────────
  describe("resolveAdvisoryRung — T-01-7 (lazy `_state` memo)", () => {
    test("a second call with the same resolved _state dispatches on the cached rung without re-entering the ladder", async () => {
      const agent = makeAgentDouble({ script: ["first trailer", "second trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: null };

      await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "first" });
      expect(_state.resolved).toEqual({ model: MODEL_ADVISORY, fallback: false });

      const second = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "second" });

      expect(second).toEqual({ kind: "response", raw: "second trailer" });
      // One dispatch per call and no ladder re-entry: the memo decided the rung (M-4).
      expect(agent.calls).toHaveLength(2);
      expect(agent.calls[1].opts).toMatchObject({ model: MODEL_ADVISORY });
    });

    test("a pre-populated memo dispatches straight onto that rung, with no advisory-rung attempt first", async () => {
      const agent = makeAgentDouble({ script: ["trailer"] });
      const { _log } = makeLogs();
      const _state = { resolved: { model: MODEL_ADVISORY_FALLBACK, fallback: true } };

      const result = await dev.resolveAdvisoryRung({ _agent: agent, _log, _state, prompt: "seam prompt" });

      expect(result).toEqual({ kind: "response", raw: "trailer" });
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY_FALLBACK });
    });

    test("through runAdvisorySeam: two seams sharing one rungState resolve once, and the second inherits the fallback rung", async () => {
      const rungState = { resolved: null };
      const firstAgent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, verdictFixture("A2", ACTION)],
        throwOn: new Set([0]),
      });
      const first = await runSeam({ agent: firstAgent, seamOps: resolvingSeamOps(), rungState });
      expect(first.disposition.fallback).toBe(true);

      const secondAgent = makeAgentDouble({ script: [verdictFixture("A4", ACTION)] });
      const second = await runSeam({
        seam: "A4",
        agent: secondAgent,
        seamOps: resolvingSeamOps(),
        rungState,
      });

      // One dispatch, straight onto the memoised rung — the ladder was not re-entered.
      expect(secondAgent.calls).toHaveLength(1);
      expect(secondAgent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY_FALLBACK });
      expect(second.disposition.model).toBe(MODEL_ADVISORY_FALLBACK);
      expect(second.disposition.fallback).toBe(true);
    });

    test("PROP-RUNG-08 — the memo is a threaded parameter, never module state: two distinct _state objects resolve independently", async () => {
      const fallbackAgent = makeAgentDouble({
        script: [`unrecognised model alias "${MODEL_ADVISORY}"`, verdictFixture("A2", ACTION)],
        throwOn: new Set([0]),
      });
      const stateA = { resolved: null };
      const a = await runSeam({ agent: fallbackAgent, seamOps: resolvingSeamOps(), rungState: stateA });
      expect(a.disposition.fallback).toBe(true);

      // A second, independent memo: nothing leaked, so this run resolves the advisory rung itself.
      const stateB = { resolved: null };
      const cleanAgent = makeAgentDouble({ script: [verdictFixture("A2", ACTION)] });
      const b = await runSeam({ agent: cleanAgent, seamOps: resolvingSeamOps(), rungState: stateB });

      expect(b.disposition.model).toBe(MODEL_ADVISORY);
      expect(b.disposition.fallback).toBe(false);
      expect(cleanAgent.calls[0].opts).toMatchObject({ model: MODEL_ADVISORY });
      expect(stateA.resolved).toEqual({ model: MODEL_ADVISORY_FALLBACK, fallback: true });
      expect(stateB.resolved).toEqual({ model: MODEL_ADVISORY, fallback: false });
    });
  });

  // ─── PROP-RUNG-09 — the no-fallback positive control ──────────────────────
  //
  // Stated as two POSITIVE conjuncts (the exact model value, `fallback: false`), never as the
  // absence of a fallback string (O-1's rule against absence-only oracles). This is what makes
  // T-01-3's fallback assertion falsifiable: a build that reported the substitution
  // unconditionally would pass T-01-3 and be caught only here.
  describe("PROP-RUNG-09 — a run that resolves on the advisory rung reports it, and reports no substitution", () => {
    test("the summary the report carries names MODEL_ADVISORY, fallback: false, and the record's Model row is byte-equal", async () => {
      const seamOps = resolvingSeamOps();
      const agent = makeAgentDouble({ script: [verdictFixture("A2", ACTION)] });

      const { disposition, files } = await runSeam({ agent, seamOps });

      // The disposition — the value every reporting surface is derived from.
      expect(disposition.outcome).toBe("resolved");
      expect(disposition.model).toBe(MODEL_ADVISORY);
      expect(disposition.fallback).toBe(false);

      // The report summary, produced by the same function the final report calls.
      const summary = dev.advisorySummaryRows([disposition]);
      const a2 = summary.rows.find((row) => row.seam === "A2");
      expect(a2.model).toBe(MODEL_ADVISORY);
      expect(a2.fallback).toBe(false);
      // Five rows always — a seam that never fired is visibly zero, not absent.
      expect(summary.rows.map((row) => row.seam)).toEqual([...dev.ADVISORY_SEAMS]);

      // The record's own Model row: byte-equal to the constant, with no " (fallback)" suffix.
      const record = files.appends.find((a) => a.path.endsWith(`ADVISORY-${FEATURE}.md`));
      expect(record.contents).toContain(`| Model | ${MODEL_ADVISORY} |`);

      // The fallback rung was never dispatched — the count leg, alongside the two positives.
      expect(agent.calls).toHaveLength(1);
      expect(agent.calls.filter((c) => c.opts && c.opts.model === MODEL_ADVISORY_FALLBACK)).toHaveLength(0);
    });
  });
});
