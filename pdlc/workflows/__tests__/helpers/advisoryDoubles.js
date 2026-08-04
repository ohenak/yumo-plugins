// advisoryDoubles.js — PLAN A-02 (batch 2, depends on A-01).
//
// The single canonical source of every test double the advisory-tier suite is permitted to
// use (TSPEC §13.3, PLAN §6.1 AC-INFRA-1). No `advisory*.test.js` file may build its own
// `SeamOps` literal, agent double, file double or clock — everything comes from this module (or,
// for `_git`/`_ghRun`, from `mergeDoubles.js` through it). PROP-INFRA-01
// (`advisoryPreflight.test.js`) scans the suite's own source text to enforce that.
//
// This file is itself excluded from jest collection by `pdlc/workflows/package.json`'s
// `testPathIgnorePatterns` (`/__tests__/helpers/`) — it is infrastructure, not a suite, and PLAN
// §5.2's batch-2 gate is "the full suite stays green", not "this file has passing tests".
//
// Nothing here touches a real clock, filesystem, network, `gh` or `git` — every export is a
// plain, synchronous or async, pure-data fake (mirroring `mergeDoubles.js`'s own header rule).

import { seeded, resolveSeed, fakeGit, fakeGhRun, passingGh, fakeSleep, fakeNow, FIXED_NOW_MS } from "./mergeDoubles.js";

// ─── Re-exports (PLAN §6.1, §6.5 — reuse, never re-author) ─────────────────
//
// `_git` / `_ghRun`: A-02 wraps the shipped `mergeDoubles.js` fakes rather than re-authoring a
// parallel pair (TSPEC §13.3). `fakeGit`/`fakeGhRun` are the exact shipped factories; advisory
// tests pass their own scripted responses through the same `matchKey`/`script` shape
// `mergeDoubles.js` already documents. `passingGh` is re-exported alongside them so an advisory
// seam test standing up A4/A5 fixtures does not have to reach into `mergeDoubles.js` directly.
export { fakeGit as makeGitDouble, fakeGhRun as makeGhDouble, passingGh, fakeSleep, fakeNow, FIXED_NOW_MS };

// `seeded` / `resolveSeed`: the repo's one seeded-PRNG library (`driftGenerators.js`, owned by a
// prior PLAN's T-40). Re-exported here — never re-declared — so every advisory property test has
// one import site, per PROPERTIES §1.2 / §13.1 item 5 and this file's own PROP-INFRA-01 scan.
export { seeded, resolveSeed };

// ─── makeAgentDouble — the `_agent` double (TSPEC §13.3 row 1) ─────────────
//
// Returns an `(skill, prompt, opts) => Promise<string>` function — never an `{ agent, calls }`
// wrapper — matching the shape `scanFixtures.js`'s `CLEAN_SHAPE` control exercises:
//
//   const agent = makeAgentDouble({ script: ["ok"] });
//   const result = await agent("skill", "prompt text", {});   // => "ok"
//
// `script` is consumed one entry per call, in order. An entry is either the trailer string to
// resolve with, or — for the index positions named in `throwOn` — the *message* of the Error the
// call rejects with instead. This is what "scripted trailers + throwing variants driving
// `isModelResolutionError`" (PLAN A-02, TSPEC §3.4) means in practice: a test scripts
// `["unrecognised model alias \"fable\"", "well-formed trailer"]` with `throwOn: new Set([0])` to
// drive the M-1/M-2 fallback-and-redispatch ladder, and the *message* on the throwing entry is
// exactly the string `isModelResolutionError` is later run against.
//
// Calling past the end of `script` is a scripting bug, not a fixture gap — it fails loudly with a
// diagnostic naming the call index, rather than silently repeating the last entry or defaulting to
// success (the same fail-closed posture `fakeGhRun`'s "no fixture for this command" takes, just as
// a throw here rather than a `{ ok: false }` reply, because the driver's contract is a resolved or
// rejected *promise*, not a result envelope).
export function makeAgentDouble({ script = [], throwOn = new Set() } = {}) {
  const calls = [];
  const agent = async (skill, prompt, opts) => {
    const index = calls.length;
    calls.push({ skill, prompt, opts });
    if (index >= script.length) {
      throw new Error(
        `makeAgentDouble: script exhausted at call ${index} (skill=${JSON.stringify(skill)}); scripted ${script.length} call(s)`
      );
    }
    const entry = script[index];
    if (throwOn.has(index)) {
      throw new Error(entry);
    }
    return entry;
  };
  agent.calls = calls;
  return agent;
}

// ─── makeSeamOps — the `SeamOps` double (TSPEC §13.3 row 5, §4.3) ──────────
//
// Every member is a call-recording spy around either the caller's override or a sensible,
// TSPEC-§4.3-shaped default; this is the double that makes `runAdvisorySeam` testable without any
// real seam (TSPEC §13.3). `overrides` is shallow — one key per `SeamOps` member — and is
// shallow-merged over the defaults below, exactly one call site per member so a test overriding
// `apply` does not have to also restate `revert`.
//
// `verifyGate` is the one member with three-way handling, because `null` is itself a meaningful,
// distinct value (TSPEC §4.3: A1/A3 declare `verifyGate: null`, never a trivially-passing stub —
// see PLAN §5.4(2)/TSPEC:1657(1)). Passing `overrides.verifyGate = null` explicitly keeps it
// `null`; passing a function wraps it as a spy like every other member; omitting the key falls
// back to a passing-gate default spy.
//
// Every function member's calls are recorded on `.calls[memberName]`, an array of that call's
// `arguments` array, in call order — so a test can assert both "was it invoked" and "with what".
export function makeSeamOps(overrides = {}) {
  const calls = {};

  function spy(name, defaultImpl) {
    calls[name] = [];
    const impl = Object.prototype.hasOwnProperty.call(overrides, name) ? overrides[name] : defaultImpl;
    const fn = (...args) => {
      calls[name].push(args);
      return impl(...args);
    };
    return fn;
  }

  const hasVerifyGateOverride = Object.prototype.hasOwnProperty.call(overrides, "verifyGate");
  const verifyGate =
    hasVerifyGateOverride && overrides.verifyGate === null
      ? null
      : spy("verifyGate", hasVerifyGateOverride ? overrides.verifyGate : async () => ({ passed: true }));

  const seamOps = {
    gatherEvidence: spy("gatherEvidence", async () => ""),
    prompt: spy("prompt", (evidence) => evidence ?? ""),
    conditionHolds: spy("conditionHolds", async () => true),
    apply: spy("apply", async () => ({ ok: true })),
    producedPaths: spy("producedPaths", async () => []),
    revert: spy("revert", async () => {}),
    verifyGate,
    declaredScope: Object.prototype.hasOwnProperty.call(overrides, "declaredScope") ? overrides.declaredScope : [],
    permittedActions: Object.prototype.hasOwnProperty.call(overrides, "permittedActions")
      ? overrides.permittedActions
      : [],
  };

  seamOps.calls = calls;
  return seamOps;
}

// ─── makeFileDouble — the `_readFile`/`_writeFile`/`_appendFile` double ────
// (TSPEC §13.3 row 3)
//
// An in-memory `{ path: contents }` store, extending `mergeDoubles.js`'s `fakeQueueFs` shape with
// `_appendFile` and a `throwOn` set — the mechanism TSPEC §13.3 names for driving E-13 (`_git`
// revert-on-throw at an unrevertable tree) and T-08-2 (record-write failure). `throwOn` is a Set
// of exact path strings; any read, write or append against a path in the set throws before the
// operation would otherwise take effect — the call is still recorded first, so a test can assert
// the attempt happened even though it failed.
export function makeFileDouble({ seed = {}, throwOn = new Set() } = {}) {
  const files = { ...seed };
  const reads = [];
  const writes = [];
  const appends = [];

  function scriptedThrow(path, op) {
    if (throwOn.has(path)) {
      const err = new Error(`makeFileDouble: scripted throw on ${op} "${path}"`);
      err.code = "EACCES";
      throw err;
    }
  }

  const _readFile = async (path) => {
    reads.push(path);
    scriptedThrow(path, "read");
    if (!Object.prototype.hasOwnProperty.call(files, path)) {
      const err = new Error(`ENOENT: no such file, open '${path}'`);
      err.code = "ENOENT";
      throw err;
    }
    return files[path];
  };

  const _writeFile = async (path, contents) => {
    writes.push({ path, contents });
    scriptedThrow(path, "write");
    files[path] = contents;
  };

  const _appendFile = async (path, contents) => {
    appends.push({ path, contents });
    scriptedThrow(path, "append");
    files[path] = (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : "") + contents;
  };

  return { files, reads, writes, appends, _readFile, _writeFile, _appendFile };
}

// ─── makeFakeClock — the `_now`/`_sleep` double (TSPEC §13.3 row 4) ────────
//
// `start` is the initial `_now()` reading (defaults to `mergeDoubles.js`'s `FIXED_NOW_MS`, so an
// advisory test that does not care about the literal instant shares the one already-fixed value
// the rest of the suite uses). `_sleep(ms)` advances the virtual clock by `ms` and resolves
// immediately — no real wall-clock wait — recording every requested duration on `.sleeps`, which
// is what a V-5 preemption test needs to assert the driver raced a deadline of the expected
// length. `autoAdvanceMs`, when non-zero, advances the clock by that fixed amount on every `_now()`
// *read* (independent of any `_sleep` call) — the mechanism for scripting elapsed time passing
// during a single in-flight dispatch (an agent double that never calls `_sleep` at all), which is
// exactly V-5/T-02-5's "elapsed time passes `seamBudgetMinutes` during its first and only attempt"
// scenario. `advance(ms)` lets a test move the clock explicitly between two `_now()` reads without
// scripting a sleep or relying on auto-advance.
export function makeFakeClock({ start = FIXED_NOW_MS, autoAdvanceMs = 0 } = {}) {
  let current = start;
  const sleeps = [];

  const _now = () => {
    const value = current;
    current += autoAdvanceMs;
    return value;
  };

  const _sleep = async (ms) => {
    sleeps.push(ms);
    current += ms;
  };

  const advance = (ms) => {
    current += ms;
  };

  return { _now, _sleep, advance, sleeps };
}

// ─── makeAdvisoryConfig — a parsed-config object at ADVISORY_DEFAULTS ──────
// (PLAN §6.1)
//
// `ADVISORY_DEFAULTS` (TSPEC §3.1) is authored by A-17, a downstream task — it does not exist on
// `orchestrate-dev.js` yet at A-02. This function therefore carries its own frozen, literal copy of
// that shape rather than importing a symbol that is not yet exported; the literal below is
// transcribed verbatim from TSPEC §3.1 (`enabled: false, attemptBudget: 3, seamBudgetMinutes: 10,
// envelope: ["E-1","E-2","E-3","E-4"]`) and must be kept in sync with it if that literal ever
// changes. `overrides` is shallow-merged over the defaults, and the return value matches
// `parseAdvisoryConfig`'s own declared shape (`{ config, sectionMalformed, invalidKeys }`,
// TSPEC §3.2) so a test can use this in place of a real parse.
const ADVISORY_DEFAULTS_SHAPE = Object.freeze({
  enabled: false,
  attemptBudget: 3,
  seamBudgetMinutes: 10,
  envelope: Object.freeze(["E-1", "E-2", "E-3", "E-4"]),
});

export function makeAdvisoryConfig(overrides = {}) {
  return {
    config: { ...ADVISORY_DEFAULTS_SHAPE, ...overrides },
    sectionMalformed: false,
    invalidKeys: [],
  };
}

// ─── makeAdvisoryGenerators — the seeded input-space generators ───────────
// (PLAN §6.5)
//
// Reuses `driftGenerators.js`'s `seeded(seed)` xorshift32 PRNG rather than declaring a second one
// (PROP-INFRA-01/PROP-INFRA-02, PLAN §6.5 — "no advisory test file declares its own PRNG"). Returns
// five generator *functions*, each consuming further draws from the same underlying `rng` on every
// call — reproduction is by replay of the whole sequence from the seed, matching
// `driftGenerators.js`'s own "rule 1" convention.
//
// These generators predate the parsers/classifiers that will consume their output (A-05, A-06,
// A-07, A-09 land after A-02): each is a best-effort covering of the input space TSPEC §4.2/§4.4,
// §5.1 and §9's typedefs and grammars describe. A later task authoring the parser its generator
// feeds may need to adjust field-name spelling to match the exact grammar it lands with; the
// generator's *shape* (well-formed cases plus one deliberately-malformed case per named rule) is
// what those later tasks are expected to preserve.
export function makeAdvisoryGenerators(seed) {
  const rng = seeded(seed);

  const SEAMS = ["A1", "A2", "A3", "A4", "A5"];
  const CONFIDENCE = ["high", "low"];
  const REFUSAL_REASONS = [
    "prohibited-action",
    "revert-on-test-touch",
    "out-of-envelope",
    "post-action-verification-failed",
    "record-write-failed",
    "malformed-verdict",
    "low-confidence",
    "budget-exhausted",
  ];
  const DISPOSITIONS = ["resolved", "escalated", "no-action"];

  function verdictLines(fields) {
    return Object.entries(fields)
      .map(([key, value]) => `${key.toUpperCase()}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join("\n");
  }

  // `AdvisoryVerdict`-shaped raw text (TSPEC §4.2/§4.4), covering both a well-formed draw and one
  // deliberately-malformed draw per named §4.4 rule (wrong seam, empty evidence, empty diagnosis,
  // missing/"nothing"-only action, out-of-enum confidence) — P-2's partition space.
  function verdictText() {
    const shape = rng.pick([
      "well-formed",
      "empty-evidence",
      "empty-diagnosis",
      "missing-action",
      "nothing-action",
      "bad-confidence",
    ]);
    const seam = rng.pick(SEAMS);
    const confidence = rng.pick(CONFIDENCE);
    const base = {
      seam,
      diagnosis: `diagnosis-${rng.int(0, 999999)}`,
      "proposed-action": `action-${rng.int(0, 999999)}`,
      confidence,
      "within-envelope": rng.pick(["yes", "no"]),
      evidence: [`file-${rng.int(0, 99)}.js:${rng.int(1, 999)}`],
    };
    switch (shape) {
      case "empty-evidence":
        return verdictLines({ ...base, evidence: [] });
      case "empty-diagnosis":
        return verdictLines({ ...base, diagnosis: "" });
      case "missing-action": {
        const { ["proposed-action"]: _drop, ...rest } = base;
        return verdictLines(rest);
      }
      case "nothing-action":
        return verdictLines({ ...base, "proposed-action": "nothing" });
      case "bad-confidence":
        return verdictLines({ ...base, confidence: "medium" });
      default:
        return verdictLines(base);
    }
  }

  // Raw `.claude/pdlc.config.json` text carrying an `advisory` section (TSPEC §3.1/§3.2),
  // covering the well-formed case and, independently for each key, a corrupted-value case — P-1's
  // per-key-independence space.
  function configObject() {
    const corruptKey = rng.pick(["none", "enabled", "attemptBudget", "seamBudgetMinutes", "envelope"]);
    const advisory = {
      enabled: rng.pick([true, false]),
      attemptBudget: rng.int(1, 5),
      seamBudgetMinutes: rng.int(1, 60),
      envelope: rng.shuffle(["E-1", "E-2", "E-3", "E-4"]).slice(0, rng.int(1, 4)),
    };
    if (corruptKey !== "none") {
      advisory[corruptKey] = rng.pick(["not-a-number", null, {}, -1]);
    }
    return JSON.stringify({ advisory });
  }

  // A `{ candidate, ctx }` pair for `classifyEnvelope(candidate, ctx)` (TSPEC §5.1), spanning the
  // three closed reason values plus the passing case.
  function envelopeCtx() {
    const seam = rng.pick(SEAMS);
    const action = rng.pick(["nothing", "rewrite", "revert", "commit"]);
    const paths = [`file-${rng.int(0, 99)}.js`];
    const declaredScope = rng.pick([[], paths]);
    return {
      candidate: { action, paths },
      ctx: {
        seam,
        permittedActions: rng.pick([[], [action]]),
        declaredScope,
        guardPaths: rng.pick([[], ["pdlc/workflows/"]]),
        capabilities: {},
      },
    };
  }

  // Raw agent text for `parseA3Classification` (TSPEC §7.2) — an unstructured diagnosis string
  // plus a scripted classification line, spanning `governingClass`'s ordering space.
  function classText() {
    const classification = rng.pick(["flaky", "environment", "genuine-regression", "unknown"]);
    return `CLASSIFICATION: ${classification}\nDIAGNOSIS: diagnosis-${rng.int(0, 999999)}`;
  }

  // Field sets for `renderAdvisoryEntry`/`renderEscalationEntry` (TSPEC §9, §10) — P-6/P-7's
  // reason x seam x disposition space.
  function entryFields() {
    return {
      seam: rng.pick(SEAMS),
      disposition: rng.pick(DISPOSITIONS),
      reason: rng.pick(REFUSAL_REASONS.concat([null])),
      attempts: rng.int(1, 3),
      model: rng.pick(["fable", "opus"]),
      fallback: rng.pick([true, false]),
    };
  }

  return { verdictText, configObject, envelopeCtx, classText, entryFields };
}
