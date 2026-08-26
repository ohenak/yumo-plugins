// `pdlc queue --loop-state <token>` CLI surface (Phase 4, pdlc-engineering-loop,
// PLAN P4-04/P4-05/P4-06/P4-07).
//
// RED at P4-04: `--loop-state` is not yet in `VALUE_FLAGS` / `FLAGS_BY_COMMAND.queue`
// (`pdlc/engine/bin/cli.mjs`), so today it is rejected by `checkFlags` as an
// unrecognised flag rather than accepted, threaded into `runQueue`, and used to
// print the directive/operator view. Those behaviours land at P4-05 (accept +
// thread + print) and P4-06/P4-07 (the `!startup.ok` policy-aware branch and the
// zero-iteration `sessionSummary`) — the tests exercising them below are
// committed `.skip`, titled with the owning task id, per the wave-gate
// discipline (SKILLS.md SKIPS). Only the regression checks that hold at HEAD —
// `--loop`/`runQueueLoop` untouched, `LOOP_STOP_REASONS` still four members —
// run unskipped here.
//
// Every case runs `bin/pdlc.mjs` as a real subprocess against this repo's own
// plugin root, the same idiom `cli.test.js` uses: usage-error paths return
// before any dispatch happens, so no SDK, no `claude`, no network.

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { LOOP_STOP_REASONS } from "../lib/run.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const BIN = path.join(engineRoot, "bin", "pdlc.mjs");
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

function run(args, env = {}) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, PDLC_PLUGIN_ROOT: "", ...env },
  });
  return { ...result, out: `${result.stdout}${result.stderr}` };
}

// ─── regressions that hold at HEAD, unskipped ─────────────────────────────

test("LOOP_STOP_REASONS is still the frozen four-member set", () => {
  const expected = ["exhausted", "bound-reached", "blocked", "refused"];
  assert.deepEqual([...LOOP_STOP_REASONS].sort(), [...expected].sort());
  assert.equal(Object.isFrozen(LOOP_STOP_REASONS), true);
});

test("`pdlc queue --loop` --max-iterations validation is untouched by the `--loop-state` addition", () => {
  const r = run(["queue", "--loop", "--max-iterations", "0", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
  assert.equal(/queue --loop: \d+ pass/.test(r.out), false, "the loop must never have started");
});

test("`pdlc queue --loop --max-iterations abc` is still refused the same way", () => {
  const r = run(["queue", "--loop", "--max-iterations", "abc", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
});

// ─── new `--loop-state` surface — implementation owned by later tasks ─────
//
// P4-05 lands `--loop-state` in `VALUE_FLAGS`/`FLAGS_BY_COMMAND.queue`, threads
// it into `runQueue`, and prints the directive/operator view. P4-06/P4-07 land
// the `!startup.ok` policy-aware branch and the zero-iteration `sessionSummary`.
// Until then `--loop-state` is simply not a recognised flag for `queue`, so
// every case below fails for the wrong reason at HEAD — they are `.skip`ped
// rather than left red, per the wave-gate discipline.

// CR v1 F-07: these two were absence-only oracles — `assert.equal(/not a recognised
// flag/.test(out), false)` alone passes for a crash, an empty string or a usage banner.
// Each now carries a POSITIVE conjunct on the same invocation, so the test states what does
// happen and not merely what does not. `--dry-run` is handled in `cmdQueue` before the
// `--loop-state` branch, so it exercises flag acceptance without dispatching a real pass.
test("P4-05: `pdlc queue --loop-state new` is accepted as a queue flag", () => {
  const r = run(["queue", "--loop-state", "new", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(/not.*(allowed|recognised).*flag/i.test(r.out), false, r.out);
  // Positive: the invocation reached the dry-run surface and exited cleanly.
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^dry run: queue$/m, r.out);
});

test("P4-05: `pdlc queue --loop-state <token>=value` shape is accepted the same as `--max-iterations=value`", () => {
  const r = run(["queue", "--loop-state=new", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(/not.*(allowed|recognised).*flag/i.test(r.out), false, r.out);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^dry run: queue$/m, r.out);
});

test("P4-05: `--loop` and `--loop-state` together is a usage error, matching the `--max-iterations` validation shape", () => {
  const r = run(["queue", "--loop", "--loop-state", "new", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /--loop-state.*--loop|--loop.*--loop-state/i);
  assert.equal(/queue --loop: \d+ pass/.test(r.out), false, "the loop must never have started");
});

// ─── CR v1 F-01/F-02/F-03/F-06: the healthy-path protocol contract ───────────
//
// This replaces a test that asserted the shipped PLACEHOLDER print ("directive: …" /
// "operator view: N item(s)"). That print was ALL `--loop-state` ever did on the healthy
// path: `cmdQueue` decoded the token and returned without calling `runQueue`, so the whole
// session-loop branch of `orchestrate-queue.js#main` had no production caller, and the
// shipped `orchestrate-queue` SKILL.md documented a response shape the binary never
// emitted. Because that SKILL's own launch-failure predicate is "exits without producing a
// parseable `loop` block", a correctly installed engine on a healthy repo tripped it on
// every iteration.
//
// The expected values below are transcribed from the SKILL's "Directive protocol (session
// side)" steps 2-3, not re-derived from the implementation:
//   step 2 — "The CLI's response carries a `loop` block naming a directive": `stop` (reason
//            drawn from the closed stop-reason enumeration) or `continue` (`waitMinutes`
//            plus a `nextState` token).
//   step 3 — on `continue` the session "echoes `nextState` back unmodified" as the next
//            iteration's `--loop-state` value.
const SKILL_DIRECTIVE_KINDS = ["stop", "continue"];

const LOOP_SESSION_URL = pathToFileURL(
  path.join(repoRoot, "pdlc", "workflows", "lib", "loop-session.mjs"),
).href;

/** `deps` for a PASSING startup: `runQueue` is a recording spy returning a scripted
 *  loop-active report, so this drives the real `cmdQueue` without a live adapter. */
function healthyDeps({ startup, cwd, report }) {
  const calls = { runQueue: [], runQueueLoop: [] };
  const deps = {
    startupFor: () => startup,
    liveAdapter: () => ({
      adapter: { getApiKeySource: () => "test-fixture", getPauseLog: () => [] },
      cwd,
      tunables: null,
    }),
    runDev: () => {
      throw new Error("runDev is not exercised by `pdlc queue`");
    },
    runQueue: async (args) => {
      calls.runQueue.push(args);
      return { ok: true, report, refusal: null };
    },
    runQueueLoop: async (...args) => {
      calls.runQueueLoop.push(args);
      throw new Error("runQueueLoop must never be reached on the --loop-state path");
    },
  };
  return { deps, calls };
}

/** Drives the real `main`/`cmdQueue` over a fixture cwd with a scripted queue report. */
async function runHealthyLoopStateCase(report, { token = "new" } = {}) {
  const { main, defaultDeps } = await import("../bin/cli.mjs");
  const { dir } = makeLoopFixtureCwd("strict");
  const argv = ["node", "pdlc", "queue", "--loop-state", token, "--plugin-root", PLUGIN_ROOT, "--cwd", dir];
  const startup = defaultDeps.startupFor(argv);
  assert.equal(startup.ok, true, "fixture setup: startup must PASS for the healthy path");
  const { deps, calls } = healthyDeps({ startup, cwd: dir, report });
  try {
    const { stdout, exitCode } = await captureRun(() => main(argv, deps));
    const reportLine = stdout.trim().split("\n").filter(Boolean).pop();
    const stamped = reportLine ? JSON.parse(reportLine) : null;
    return { stdout, exitCode, calls, stamped };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** A real `nextState` token for iteration 2, built with the shipped encoder rather than a
 *  hand-typed literal, so a change to the token format cannot silently desync this test. */
async function continueToken() {
  const { decodeLoopState, encodeLoopState } = await import(LOOP_SESSION_URL);
  return encodeLoopState({ ...decodeLoopState("new"), iteration: 1 });
}

/** A directive whose `nextState` records one completed iteration and one merged feature —
 *  what `finish` produces after a `ran`+merged pass. */
async function mergedStopToken() {
  const { decodeLoopState, encodeLoopState } = await import(LOOP_SESSION_URL);
  return encodeLoopState({
    ...decodeLoopState("new"),
    iteration: 1,
    merged: [{ feature: "feat-merged", prUrl: "https://example.invalid/pr/9" }],
  });
}

test("CR-F01: `--loop-state` dispatches a real `runQueue` pass, forwarding the token as `loopState`", async () => {
  const nextState = await continueToken();
  const { calls, exitCode } = await runHealthyLoopStateCase({
    outcome: "ran",
    picked: "feat-example",
    pipelineReport: { mergeStatus: "merged", prUrl: "https://example.invalid/pr/1" },
    loop: { kind: "continue", stopReason: null, waitMinutes: 0, nextState, detail: null },
    operatorView: { items: [] },
    notices: [],
  });

  // The conjunct that was false at HEAD: the queue driver is actually reached.
  assert.equal(calls.runQueue.length, 1, "runQueue must be dispatched exactly once per iteration");
  assert.equal(calls.runQueue[0].loopState, "new", "the token is forwarded as `loopState`");
  // CR v1 F-06: the REAL startup result is threaded down as `loopStartup`, so AC-3.1's
  // engine-readiness conjunct is evaluated by `main` over the same session as AC-3.2's
  // clean-tree conjunct, instead of being a hardcoded `{ok: true}` no fixture can red.
  assert.equal(calls.runQueue[0].loopStartup.ok, true);
  assert.equal(typeof calls.runQueue[0].loopStartupRemediation, "string");
  assert.equal(exitCode, 0);
});

test("CR-F02: the healthy path emits the `loop` block the SKILL's step 2/3 protocol requires", async () => {
  const nextState = await continueToken();
  const { stamped } = await runHealthyLoopStateCase({
    outcome: "ran",
    picked: "feat-example",
    pipelineReport: { mergeStatus: "merged", prUrl: "https://example.invalid/pr/1" },
    loop: { kind: "continue", stopReason: null, waitMinutes: 0, nextState, detail: null },
    operatorView: { items: [] },
    notices: [],
  });

  const loop = stamped.engine.loop;
  assert.notEqual(loop, null, "a `loop` block MUST be present — its absence is the SKILL's launch-failure predicate");
  // Step 2: the block names a directive drawn from the SKILL's two-member kind set.
  assert.ok(SKILL_DIRECTIVE_KINDS.includes(loop.kind), `loop.kind was ${JSON.stringify(loop.kind)}`);
  assert.equal(loop.kind, "continue");
  // Step 3: `continue` carries a wait and a token the session echoes back unmodified.
  assert.equal(typeof loop.waitMinutes, "number");
  assert.equal(loop.nextState, nextState, "`nextState` must survive to the operator byte-for-byte");
});

test("CR-F03: AC-7.1 — the console carries one per-iteration line naming outcome, feature and merge status", async () => {
  const nextState = await continueToken();
  const { stdout } = await runHealthyLoopStateCase({
    outcome: "ran",
    picked: "feat-example",
    pipelineReport: { mergeStatus: "merged", prUrl: "https://example.invalid/pr/1" },
    loop: { kind: "continue", stopReason: null, waitMinutes: 0, nextState, detail: null },
    operatorView: { items: [] },
    notices: [],
  });

  // All three of AC-7.1's named fields, on one line, from `iterationLine` — which had ZERO
  // production callers before this.
  const line = stdout.split("\n").find((l) => /^Iteration 1:/.test(l));
  assert.ok(line, `no per-iteration line in output:\n${stdout}`);
  assert.match(line, /ran/);
  assert.match(line, /feat-example/);
  assert.match(line, /merge merged/);
});

test("CR-F03: AC-7.2 — a `stop` directive emits a session summary with merged PR URLs, open-escalation count and next actionable", async () => {
  const nextState = await mergedStopToken();
  const { stamped, stdout } = await runHealthyLoopStateCase({
    outcome: "idle",
    picked: null,
    loop: { kind: "stop", stopReason: "exhausted", waitMinutes: 0, nextState, detail: null },
    operatorView: {
      items: [
        { feature: "feat-blocked", blockedCount: 3 },
        { feature: "feat-other", blockedCount: 1 },
      ],
    },
    notices: [],
  });

  const loop = stamped.engine.loop;
  assert.equal(loop.kind, "stop");
  assert.equal(loop.stopReason, "exhausted");
  // AC-7.2's fields, POPULATED — previously reachable only on the engine-refusal branch,
  // i.e. the one path where all of them are empty by construction.
  assert.equal(loop.iterations, 1, "iterations is read back from the directive's own nextState");
  assert.deepEqual(loop.merged, [{ feature: "feat-merged", prUrl: "https://example.invalid/pr/9" }]);
  assert.equal(loop.openEscalations, 2);
  assert.deepEqual(loop.nextActionable, { feature: "feat-blocked", blockedCount: 3 });
  assert.match(stdout, /Session stopped: exhausted\./);
});

test("CR-F03: AC-2.5/AC-4.7 — the emitted report names the config case and carries named parse-notice detail", async () => {
  const nextState = await continueToken();
  const { stamped } = await runHealthyLoopStateCase({
    outcome: "idle",
    picked: null,
    loop: { kind: "stop", stopReason: "exhausted", waitMinutes: 0, nextState, detail: null },
    operatorView: { items: [] },
    notices: [
      // CR v2 F-01 / Q-01: `explicit-default` is a real member of `readLoopConfig`'s closed
      // four-state set ("absent-file" | "absent-section" | "malformed-section" |
      // "explicit-default", FSPEC BR-02). The earlier literal here
      // ("file-present-loop-key-present") was an abandoned working vocabulary no producer can
      // emit, so this passthrough test documented a contract the system does not have. What
      // this test proves is unchanged and deliberately narrow — the CLI copies
      // `report.notices` onto `loop.notices` verbatim; the PRODUCER side of AC-2.5 is oracled
      // over a real `main` invocation in `loopQueueDriver.test.js` ("CR v2 F-01").
      { code: "config-case", subject: "config", text: "explicit-default" },
      { code: "escalation-parse", subject: "escalation", text: "docs/_queue/ESCALATIONS.md:42 malformed row" },
    ],
  });

  const notices = stamped.engine.loop.notices;
  // AC-2.5: which of the four configuration states applied is the ENTIRE observable content
  // of that AC, and `readLoopConfig().case` used to be computed and then discarded.
  const configCase = notices.find((n) => n.code === "config-case");
  assert.ok(configCase, `no config-case notice in ${JSON.stringify(notices)}`);
  assert.equal(configCase.text, "explicit-default");
  // AC-4.7: "enough detail to find it" — the named location, not a bare count.
  const parseNotice = notices.find((n) => n.code === "escalation-parse");
  assert.ok(parseNotice);
  assert.match(parseNotice.text, /ESCALATIONS\.md:42/);
});

// ─── P4-06: the `!startup.ok` refusal, driven through production `cmdQueue`
// (TSPEC "AT-44's engine half runs ... through the production cli.mjs's
// `main()`/`cmdQueue`, `deps.startupFor` scripted ... Asserting
// `evaluatePreflight` in isolation would prove nothing about cli.mjs's
// return and is explicitly not the oracle").
//
// The shipped `!startup.ok` branch itself is UNMODIFIED under every policy
// (DEC-LOOP-06 alternative B) — the three shapes below prove that
// structural identity is still true at HEAD, unskipped, no P4-07 work
// needed. The seven-conjunct behavioural oracle, the `"strict"` case, the
// AT-44 `notEqual` falsifier and AT-37's session half all read the
// `--loop-state`-only extension — the `loop` block P4-07 supplies on the
// existing `emitReport(...)` seam and the BR-28 `sessionSummary` call
// (TSPEC "cmdQueue (modified)" row) — none of which exists at HEAD, so
// those blocks are committed `.skip`, titled "P4-07: ...".

// Transcribed literally from `loop-startup-remediation.test.js` (PLAN
// P4-01) — the same bad `--plugin-root` and the same HEAD golden tail, so
// the three shapes below are asserted against literally the same bytes
// P4-01 captured, not a re-derived approximation.
const BAD_PLUGIN_ROOT = path.join(path.sep, "tmp", "definitely-not-a-plugin-root");
const PLUGIN_ROOT_ENV_NAME = "PDLC_PLUGIN_ROOT";
const RUNG_1_DETAIL =
  `explicit override (--plugin-root) points at ${BAD_PLUGIN_ROOT}, which is not a pdlc plugin root ` +
  `(expected .claude-plugin/plugin.json and skills/ inside it)`;
const REASON_LINE = `rung 1 (plugin resolved (AC-3.2)): ${RUNG_1_DETAIL}`;
const STARTUP_REMEDIATION_LITERAL =
  `Override the plugin root with --plugin-root <path>, or with ${PLUGIN_ROOT_ENV_NAME}=<path> ` +
  `together with --dev (the variable alone is ignored — DEC-EDIST-04).`;
const EXPECTED_TAIL =
  `${REASON_LINE}\n` + `pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).`;

/** Mirrors `loop-startup-remediation.test.js`'s `tail` exactly. */
function tail(text, n) {
  const lines = text.replace(/\n$/, "").split("\n");
  return lines.slice(-n).join("\n");
}

describe("P4-06: the three invocation shapes' refusal tail, byte-for-byte against P4-01's HEAD golden", () => {
  test("P4-06: plain `pdlc queue` under a refused startup matches the HEAD golden tail", () => {
    const r = run(["queue", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", repoRoot]);
    assert.equal(r.status, 1, r.out);
    assert.equal(tail(r.stderr, 2), EXPECTED_TAIL);
  });

  test("P4-06: `pdlc queue --loop` under a refused startup matches the HEAD golden tail, byte-identical to the plain shape", () => {
    const r = run(["queue", "--loop", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", repoRoot]);
    assert.equal(r.status, 1, r.out);
    assert.equal(tail(r.stderr, 2), EXPECTED_TAIL);
  });

  test("P4-06: `pdlc queue --loop-state <token>` under a refused startup matches the HEAD golden tail, byte-identical to the plain shape", () => {
    const r = run(["queue", "--loop-state", "new", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", repoRoot]);
    assert.equal(r.status, 1, r.out);
    // `!startup.ok` is read before `loopStateFlag` is ever inspected
    // (`bin/cli.mjs`), so this shape's refusal tail cannot depend on which
    // of the three invocation shapes was used — same claim P4-01's golden
    // documents structurally, proven behaviourally here.
    assert.equal(tail(r.stderr, 2), EXPECTED_TAIL);
  });
});

// ─── P4-07: the `--loop-state`-only extension to the `!startup.ok` branch —
// the policy-aware `loop` block on `emitReport`'s existing seam, and the
// BR-28 `sessionSummary` call. In-process (`main(argv, deps)`, `deps`
// injected — the seam `cli.test.js` already exercises) rather than a
// subprocess, so `runQueue`/`runQueueLoop` can be scripted spies instead of
// real dispatches.
//
// Not implemented at HEAD: `cmdQueue`'s `!startup.ok` branch returns before
// `loopStateFlag`, `readLoopConfig` or `evaluatePreflight` are ever
// consulted (`bin/cli.mjs`), so every block below fails for the RIGHT
// reason today (the JSON report's `engine.loop` is `null`, not the
// zero-iteration BR-28 summary). Committed `.skip`, titled "P4-07: ...".

/** Mirrors `loop-startup-remediation.test.js`'s `captureRun` exactly. */
async function captureRun(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const exitCodeBefore = process.exitCode;
  let stdout = "";
  let stderr = "";
  console.log = (...args) => {
    stdout += args.map(String).join(" ") + "\n";
  };
  console.error = (...args) => {
    stderr += args.map(String).join(" ") + "\n";
  };
  let returned;
  try {
    returned = await fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
  const exitCode = process.exitCode;
  process.exitCode = exitCodeBefore;
  return { stdout, stderr, exitCode, returned };
}

/**
 * A `.claude/pdlc.config.json` + `docs/_queue/QUEUE.md` fixture tree, wholly
 * owned by the test (never the real repo tree) so the QUEUE.md
 * byte-identity conjunct has something of its own to assert unchanged.
 */
function makeLoopFixtureCwd(policy) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-loop-cli-"));
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".claude", "pdlc.config.json"),
    JSON.stringify({ loop: { preflight: policy } }, null, 2),
  );
  fs.mkdirSync(path.join(dir, "docs", "_queue"), { recursive: true });
  const queueText = "# QUEUE\n\n| feature | status |\n|---|---|\n| feat-example | ready |\n";
  fs.writeFileSync(path.join(dir, "docs", "_queue", "QUEUE.md"), queueText);
  return { dir, queueText };
}

/**
 * `deps` with only `startupFor` scripted (TSPEC's "only `deps.startupFor`
 * scripted" — never `evaluatePreflight` called in isolation). `runQueue`/
 * `runQueueLoop` are spies that throw if ever reached, on top of recording
 * their calls — the "`runQueue` never reached" conjunct gets a loud failure
 * mode, not just an empty-array assertion.
 */
function scriptedDeps(startup) {
  const calls = { runQueue: [], runQueueLoop: [] };
  const deps = {
    startupFor: () => startup,
    liveAdapter: () => {
      throw new Error("liveAdapter must never be reached on a refused startup");
    },
    runDev: () => {
      throw new Error("runDev is not exercised by `pdlc queue`");
    },
    runQueue: async (...args) => {
      calls.runQueue.push(args);
      throw new Error("runQueue must never be reached on a refused startup");
    },
    runQueueLoop: async (...args) => {
      calls.runQueueLoop.push(args);
      throw new Error("runQueueLoop must never be reached on a refused startup");
    },
  };
  return { deps, calls };
}

/** Runs one `--loop-state` case end to end, returning everything the
 * seven-conjunct oracle and the AT-44 falsifier need. */
async function runLoopStateCase(policy) {
  const { main, defaultDeps } = await import("../bin/cli.mjs");
  const { dir, queueText } = makeLoopFixtureCwd(policy);
  const startup = defaultDeps.startupFor([
    "node",
    "pdlc",
    "queue",
    "--plugin-root",
    BAD_PLUGIN_ROOT,
    "--cwd",
    dir,
  ]);
  assert.equal(startup.ok, false, "fixture setup: startup must be refused");
  const { deps, calls } = scriptedDeps(startup);
  try {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "queue", "--loop-state", "new", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", dir], deps),
    );
    const reportLine = stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .pop();
    const stamped = reportLine ? JSON.parse(reportLine) : null;
    // Read back before the fixture dir is removed — byte-identity is asserted
    // by the caller after this helper's cleanup has already run.
    const queueTextAfter = fs.readFileSync(path.join(dir, "docs", "_queue", "QUEUE.md"), "utf8");
    return { stdout, stderr, exitCode, calls, stamped, dir, queueText, queueTextAfter };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test(
  'P4-07: `--loop-state` x loop.preflight "off" under a refused startup — seven positive conjuncts (AT-15b, AT-44, E-19)',
  async () => {
    const { stderr, exitCode, calls, stamped, queueText, queueTextAfter } = await runLoopStateCase("off");

    // (1) exit code 1.
    assert.equal(exitCode, 1);
    // (2) `runQueue` never reached (and `runQueueLoop` — the other driver —
    // never reached either).
    assert.deepEqual(calls.runQueue, []);
    assert.deepEqual(calls.runQueueLoop, []);
    // (3) `emitReport(null, …)` taken: `stampReport(null, engine)` is
    // `{ engine }` — no dispatch-report keys at all, only the provenance
    // block (`lib/report.mjs`).
    assert.deepEqual(Object.keys(stamped).sort(), ["engine"]);
    // (4) iteration count 0.
    assert.equal(stamped.engine.loop.iterations, 0);
    // (6, ahead of 5 — same field) zero waits taken: no rate-limit pause was
    // ever logged, because no adapter was ever built on this path.
    assert.deepEqual(stamped.engine.pauses, []);
    // (5) stop reason `engine-dispatch-refused` — this policy's half of
    // AT-15b/AT-44, distinct from `"strict"`'s `preflight-refused`.
    assert.equal(stamped.engine.loop.stopReason, "engine-dispatch-refused");
    // (7) `docs/_queue/QUEUE.md` byte-identical — this fixture's own copy,
    // never read because `runQueue` was never reached.
    assert.equal(queueTextAfter, queueText);
    // The shipped refusal tail is unmodified under `"off"` too (DEC-LOOP-06
    // alternative B) — same golden as the three-shapes suite above.
    assert.equal(tail(stderr, 2), EXPECTED_TAIL);
  },
);

test(
  'P4-07: `--loop-state` x loop.preflight "strict" under a refused startup — same shape, stop reason `preflight-refused`',
  async () => {
    const { stderr, exitCode, calls, stamped } = await runLoopStateCase("strict");

    assert.equal(exitCode, 1);
    assert.deepEqual(calls.runQueue, []);
    assert.deepEqual(calls.runQueueLoop, []);
    assert.deepEqual(Object.keys(stamped).sort(), ["engine"]);
    assert.equal(stamped.engine.loop.iterations, 0);
    assert.deepEqual(stamped.engine.pauses, []);
    // The loop's OWN refusal under `"strict"` — `preflight-refused`, not
    // `engine-dispatch-refused` (TSPEC E-20(a)).
    assert.equal(stamped.engine.loop.stopReason, "preflight-refused");
    assert.equal(tail(stderr, 2), EXPECTED_TAIL);
  },
);

test(
  "P4-07: AT-44's falsifier — the two rendered `detail` strings, both produced on this one run's off/strict pair, are not equal",
  async () => {
    // Both cases produced in the course of THIS test — not two
    // separately-constructed literals — so the comparison is over real
    // output (TSPEC Data Model §5's distinguishability claim; "otherwise
    // the stated contract has no oracle").
    const off = await runLoopStateCase("off");
    const strict = await runLoopStateCase("strict");

    const offSummary = off.stamped.engine.loop;
    const strictSummary = strict.stamped.engine.loop;
    assert.notEqual(
      JSON.stringify(offSummary),
      JSON.stringify(strictSummary),
      "the tenth stop kind's rendered detail must be textually distinguishable from preflight-refused's",
    );
    // The distinguishing half specifically: two different stop reasons, not
    // (say) an identical object with a coincidentally-differing field.
    assert.notEqual(offSummary.stopReason, strictSummary.stopReason);
  },
);

describe("P4-06/P4-07: AT-37's session half — the set of stop reasons session fixtures exercise", () => {
  test(
    "P4-07: a session fixture set exercising every LOOP_STOP_KINDS member collects to a literal ten-member array (LOOP_STOP_KINDS on neither side)",
    async () => {
      // Eight members come from `nextDirective` — already shipped (P1-08),
      // fixture shapes mirroring `loopSessionDirective.test.js`'s. The other
      // two, `preflight-refused` and `engine-dispatch-refused`, are reachable
      // ONLY through `cmdQueue`'s preflight path (`nextDirective` never
      // returns either) — so this whole test is P4-07's, not P4-06's, even
      // though most of its fixtures already pass today.
      const { nextDirective } = await loopSessionModuleForTest();

      const LOOP_DEFAULTS = Object.freeze({
        backoffSchedule: Object.freeze([5, 15, 30, 60]),
        idleStopAfter: 4,
        preflight: "strict",
        dirtyTreePolicy: "tracked",
      });
      const makeState = (overrides = {}) => ({
        v: 1,
        preflightRan: true,
        consecutiveIdle: 0,
        schedulePos: 0,
        iteration: 1,
        merged: [],
        halted: [],
        escalationsRaised: [],
        ...overrides,
      });
      const makeInput = (overrides = {}) => ({
        report: null,
        threw: null,
        queue: { readable: true, awaitingMerge: [] },
        config: LOOP_DEFAULTS,
        state: makeState(),
        ...overrides,
      });

      const reasons = new Set();

      reasons.add(
        nextDirective(makeInput({ threw: { message: "queue invocation exploded: ECONNRESET" } })).stopReason,
      );
      reasons.add(
        nextDirective(makeInput({ report: { outcome: "no-queue", reason: "queue is empty", remaining: 0 } }))
          .stopReason,
      );
      reasons.add(
        nextDirective(
          makeInput({
            report: { outcome: "blocked", blockedFeature: "feat-checkout-flow", reason: "in-progress" },
          }),
        ).stopReason,
      );
      reasons.add(
        nextDirective(makeInput({ report: { outcome: "halted", reason: "pipeline halted" } })).stopReason,
      );
      reasons.add(
        nextDirective(makeInput({ report: { outcome: "idle" }, queue: { readable: false, awaitingMerge: [] } }))
          .stopReason,
      );
      reasons.add(
        nextDirective(
          makeInput({ report: { outcome: "idle" }, queue: { readable: true, awaitingMerge: ["feat-x"] } }),
        ).stopReason,
      );
      reasons.add(
        nextDirective(
          makeInput({
            report: { outcome: "idle" },
            // Unenterable arises from the config, not the position: an empty
            // schedule (or idleStopAfter 0) is what stops backoff-unenterable
            // (lib/loop-session.mjs, "unenterable first").
            config: { ...LOOP_DEFAULTS, backoffSchedule: [] },
          }),
        ).stopReason,
      );
      reasons.add(
        nextDirective(
          makeInput({ report: { outcome: "idle" }, state: makeState({ consecutiveIdle: LOOP_DEFAULTS.idleStopAfter }) }),
        ).stopReason,
      );
      // `ran` never stops — not a member of this fixture set.

      // The ninth and tenth — `preflight-refused` and
      // `engine-dispatch-refused` — are both produced only through the real
      // `cmdQueue` preflight path this file exercises above, never by
      // `nextDirective` (lib/loop-session.mjs's LOOP_STOP_KINDS note), so
      // both legs run here.
      const off = await runLoopStateCase("off");
      reasons.add(off.stamped.engine.loop.stopReason);
      const strict = await runLoopStateCase("strict");
      reasons.add(strict.stamped.engine.loop.stopReason);

      const TEN_MEMBER_LITERAL = [
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
      ];
      assert.deepEqual([...reasons].sort(), [...TEN_MEMBER_LITERAL].sort());
    },
  );
});

/** Same dynamic-resolution arrangement `bin/cli.mjs`'s `loopSessionModule`
 * uses, reimplemented here rather than imported (this file asserts through
 * the CLI seam, never by importing `bin/cli.mjs`'s internals). */
async function loopSessionModuleForTest() {
  const workflowsRoot = path.join(repoRoot, "pdlc", "workflows");
  return import(pathToFileURL(path.join(workflowsRoot, "lib", "loop-session.mjs")).href);
}

// ─── CR v1 F-02 / F-08 — what `cmdQueue` computes for the pass it dispatches ──

/** `runHealthyLoopStateCase`, with extra argv appended after the shipped flags. */
async function runLoopStateCaseWithArgv(report, extraArgv, { token = "new" } = {}) {
  const { main, defaultDeps } = await import("../bin/cli.mjs");
  const { dir } = makeLoopFixtureCwd("strict");
  const argv = [
    "node",
    "pdlc",
    "queue",
    "--loop-state",
    token,
    "--plugin-root",
    PLUGIN_ROOT,
    "--cwd",
    dir,
    ...extraArgv,
  ];
  const startup = defaultDeps.startupFor(argv);
  assert.equal(startup.ok, true, "fixture setup: startup must PASS for the healthy path");
  const { deps, calls } = healthyDeps({ startup, cwd: dir, report });
  try {
    const { stdout, exitCode } = await captureRun(() => main(argv, deps));
    const reportLine = stdout.trim().split("\n").filter(Boolean).pop();
    return { stdout, exitCode, calls, stamped: reportLine ? JSON.parse(reportLine) : null };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const RAN_REPORT = async () => ({
  outcome: "ran",
  picked: "feat-example",
  pipelineReport: { mergeStatus: "merged", prUrl: "https://example.invalid/pr/1" },
  loop: {
    kind: "continue",
    stopReason: null,
    waitMinutes: 0,
    nextState: await continueToken(),
    detail: null,
  },
  operatorView: { items: [] },
  notices: [],
});

test("CR v1 F-02: AT-12 — `cmdQueue` computes the engine/plugin version comparison and forwards it as `loopVersionMismatch`", async () => {
  // An empty store is pinned deliberately: the developer machine running this suite may hold
  // any set of installed versions, and the value under test is derived from that store, so a
  // real `~/.pdlc` would make the assertion below a statement about the machine.
  const storeHome = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-loop-store-"));
  const previousHome = process.env.PDLC_HOME;
  process.env.PDLC_HOME = storeHome;
  let calls;
  try {
    ({ calls } = await runLoopStateCaseWithArgv(await RAN_REPORT(), []));
  } finally {
    if (previousHome === undefined) delete process.env.PDLC_HOME;
    else process.env.PDLC_HOME = previousHome;
    fs.rmSync(storeHome, { recursive: true, force: true });
  }

  // TSPEC §Interfaces pins the source of this value: "`versionMismatch` … from
  // `versionDoctorFor`". Before this it was a hardcoded `{mismatched:false, detail:null}`
  // literal inside `orchestrate-queue.js`, so no operator could ever see AT-12's notice.
  const forwarded = calls.runQueue[0].loopVersionMismatch;
  assert.ok(forwarded, "runQueue must receive a `loopVersionMismatch` record");
  assert.equal(typeof forwarded.mismatched, "boolean");
  // This repo's own plugin satisfies the engine's declared compat range, so the healthy
  // fixture reports no mismatch — and the value is DERIVED, which the negative case below
  // (a plugin root the engine cannot read a compatible version from) makes falsifiable.
  assert.equal(forwarded.mismatched, false);
  assert.equal(forwarded.detail, null);
});

test("CR v1 F-02: AT-12 — a version store resolving a different engine than the one running is reported as a mismatch, and iteration 1 still runs", async () => {
  // AT-12's scenario precisely: startup is OK (the plugin satisfies this engine's range, so
  // rung 3 passes and nothing refuses), yet the version PREAMBLE has something to say — the
  // store resolves v99.0.0 while these bytes are this package's own version. Startup cannot
  // see that skew; only `versionDoctorFor` can, which is why TSPEC §Interfaces sources
  // `versionMismatch` from it.
  const storeHome = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-loop-store-"));
  fs.mkdirSync(path.join(storeHome, "versions", "99.0.0"), { recursive: true });
  const previousHome = process.env.PDLC_HOME;
  process.env.PDLC_HOME = storeHome;
  try {
    const { calls, exitCode } = await runLoopStateCaseWithArgv(await RAN_REPORT(), []);
    const forwarded = calls.runQueue[0].loopVersionMismatch;
    assert.equal(forwarded.mismatched, true);
    assert.match(forwarded.detail, /99\.0\.0/);
    // "does not refuse on the preamble alone, and iteration 1 runs" — both positive conjuncts.
    assert.equal(calls.runQueue.length, 1);
    assert.equal(exitCode, 0);
  } finally {
    if (previousHome === undefined) delete process.env.PDLC_HOME;
    else process.env.PDLC_HOME = previousHome;
    fs.rmSync(storeHome, { recursive: true, force: true });
  }
});

test("CR v1 F-08: E-25/AT-49 — the per-iteration line states BOTH the requested and the actual wait", async () => {
  // The session is the waiting agent (DEC-LOOP-02), so only it knows what it actually
  // waited; it reports the pair back on the next invocation, exactly as it echoes
  // `nextState`. A bare number cannot express "requested 5, actually waited 2".
  const { stdout } = await runLoopStateCaseWithArgv(await RAN_REPORT(), [
    "--wait-requested",
    "5",
    "--wait-actual",
    "2",
  ]);
  const line = stdout.split("\n").find((l) => /^Iteration /.test(l));
  assert.ok(line, `no per-iteration line in output:\n${stdout}`);
  assert.match(line, /requested 5m/);
  assert.match(line, /actual 2m/);
});

test("CR v1 F-08: a wait the host could not honour at all is reported as actual unknown, never as the requested length", async () => {
  const { stdout } = await runLoopStateCaseWithArgv(await RAN_REPORT(), ["--wait-requested", "5"]);
  const line = stdout.split("\n").find((l) => /^Iteration /.test(l));
  assert.match(line, /requested 5m/);
  assert.match(line, /actual unknown/);
});

test("CR v1 F-08: iteration 1 took no wait at all, and says nothing about one", async () => {
  const { stdout } = await runLoopStateCaseWithArgv(await RAN_REPORT(), []);
  const line = stdout.split("\n").find((l) => /^Iteration /.test(l));
  assert.equal(/requested/.test(line), false, line);
});

// ─── CR v1 F-07 — a production caller for the decision block (AC-4.4) ──────
//
// `renderDecisionEntry` shipped exported, and `appendEscalationEntry` shipped routing on
// `disposition.kind === "decision"`, but nothing in the loop path ever constructed such a
// disposition: decision blocks existed only because tests called the renderer. AC-4.4 is a
// requirement about what an OPERATOR can record, and TSPEC §Architecture names the operator's
// input channel — "`pdlc queue --loop-state …` prints each open item's `entryId` in the
// rendered view, and the renderer takes it as an argument". `pdlc decide` is that argument's
// consumer: the one command that turns a printed id into a durable decision block.

const ESCALATION_LOG_REL = path.join("docs", "_queue", "ESCALATIONS.md");

/** One shipped-shape escalation block, plus the id the reader derives from it. */
async function seedEscalationLog(dir) {
  const { entryId } = await import(
    pathToFileURL(path.join(repoRoot, "pdlc", "workflows", "lib", "escalation-view.mjs")).href
  );
  const chunk = [
    "2026-08-24T00:00:00.000Z — feat-example — merge-refusal",
    "",
    "**Decide:** whether to accept the merge refusal.",
    "",
    "| Field | Value |",
    "|---|---|",
    "| Feature | feat-example |",
    "| Source | merge-refusal |",
    "| Refusal reason | self-modification guard matched |",
    "",
    "**Diagnosis.** none.",
    "",
    "**Pipeline state.** MERGE — refused",
  ].join("\n");
  const text = `## ${chunk}\n`;
  fs.mkdirSync(path.join(dir, "docs", "_queue"), { recursive: true });
  fs.writeFileSync(path.join(dir, ESCALATION_LOG_REL), text);
  return { id: entryId(chunk), text };
}

async function parseLogAt(dir) {
  const { parseEscalationLog, buildOperatorView } = await import(
    pathToFileURL(path.join(repoRoot, "pdlc", "workflows", "lib", "escalation-view.mjs")).href
  );
  const log = parseEscalationLog(fs.readFileSync(path.join(dir, ESCALATION_LOG_REL), "utf8"));
  return { log, view: buildOperatorView({ log, counts: new Map() }) };
}

test("CR v1 F-07: AC-4.4 — `pdlc decide` appends a durable decision block naming the entry it decides", async () => {
  const { main } = await import("../bin/cli.mjs");
  const { dir } = makeLoopFixtureCwd("strict");
  try {
    const { id, text: before } = await seedEscalationLog(dir);

    const { exitCode } = await captureRun(() =>
      main([
        "node",
        "pdlc",
        "decide",
        "--entry",
        id,
        "--outcome",
        "resolved",
        "--by",
        "operator",
        "--rationale",
        "guard match was expected for this feature",
        "--plugin-root",
        PLUGIN_ROOT,
        "--cwd",
        dir,
      ]),
    );
    assert.equal(exitCode, 0);

    const { log, view } = await parseLogAt(dir);
    const decisions = log.entries.filter((e) => e.kind === "decision");
    assert.equal(decisions.length, 1, "exactly one decision block was appended");
    assert.equal(decisions[0].decidesId, id, "the block names the entry it decides");
    assert.equal(decisions[0].decidedOutcome, "resolved");
    assert.equal(decisions[0].decidedBy, "operator");
    assert.ok(typeof decisions[0].decidedAt === "string" && decisions[0].decidedAt.length > 0);

    // AC-4.4: "the decided entry's own block is not rewritten" — the appended file still
    // STARTS with the original bytes.
    const after = fs.readFileSync(path.join(dir, ESCALATION_LOG_REL), "utf8");
    assert.ok(after.startsWith(before), "the decided entry's own block must survive verbatim");

    // The decision is not merely durable, it is CONSUMED: the overlay closes the item.
    assert.equal(view.items.length, 0, "a resolved decision closes the entry in the view");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("CR v1 F-07: `pdlc decide` refuses an entry id the log does not carry, and writes nothing", async () => {
  const { main } = await import("../bin/cli.mjs");
  const { dir } = makeLoopFixtureCwd("strict");
  try {
    const { text: before } = await seedEscalationLog(dir);
    const { exitCode, stdout, stderr } = await captureRun(() =>
      main([
        "node",
        "pdlc",
        "decide",
        "--entry",
        "000000000000",
        "--outcome",
        "resolved",
        "--by",
        "operator",
        "--plugin-root",
        PLUGIN_ROOT,
        "--cwd",
        dir,
      ]),
    );
    assert.notEqual(exitCode, 0);
    assert.equal(fs.readFileSync(path.join(dir, ESCALATION_LOG_REL), "utf8"), before);
    assert.match(stdout + stderr, /000000000000/, "the refusal names the id it could not find");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("CR v1 F-07: `pdlc decide` refuses an outcome outside the two-member set", async () => {
  const { main } = await import("../bin/cli.mjs");
  const { dir } = makeLoopFixtureCwd("strict");
  try {
    const { id, text: before } = await seedEscalationLog(dir);
    const { exitCode } = await captureRun(() =>
      main([
        "node",
        "pdlc",
        "decide",
        "--entry",
        id,
        "--outcome",
        "maybe",
        "--by",
        "operator",
        "--plugin-root",
        PLUGIN_ROOT,
        "--cwd",
        dir,
      ]),
    );
    assert.notEqual(exitCode, 0);
    assert.equal(fs.readFileSync(path.join(dir, ESCALATION_LOG_REL), "utf8"), before);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
