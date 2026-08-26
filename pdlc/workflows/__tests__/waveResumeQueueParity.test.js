/**
 * waveResumeQueueParity.test.js — PLAN T-04.
 *
 * PROP-PARITY-01..04 (TSPEC §5.4 AT-16 "queue parity", DEC-WVR-07-scoped).
 * The oracle this suite carries is narrow BY DESIGN (DEC-WVR-07 rejects
 * alternatives (a)/(b)/(c)): it proves the DELEGATION BOUNDARY is honest —
 * `orchestrate-queue.js` leaves `_runPipeline` at its default (the real
 * `orchestrate-dev.js` export) and forwards exactly `{reqPath}` — and,
 * separately, that the DIRECT path reads the ledger at exactly
 * `WAVE_STATE_PATH`. It does NOT observe a real delegated Phase I resolving a
 * resume record end-to-end through the queue.
 *
 * Where that narrowing is written down (corrected, Phase CR round 1, PM F-04):
 * it is DEC-WVR-07's, recorded against option O-9 ("Make AT-16 assert a real
 * delegated resume") with its rejected alternatives, and restated by TSPEC §5.4's
 * AT-16 row — whose closing sentence is the source of the phrase "REQ-WVR-07-
 * structural, not behavioural". It is NOT in FSPEC AT-16's own text, which asks
 * for behavioural parity without qualification; this header previously
 * attributed it there. Cite DEC-WVR-07 and TSPEC §5.4, never the FSPEC, for why
 * this suite stops where it does. The behavioural half is covered on the DIRECT
 * path by AT-01..05 in `waveExecution.test.js`, and DEC-WVR-07 carries the
 * re-evaluation trigger for closing the delegated half.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

import queueMain, { DEFAULT_QUEUE_PATH } from "../orchestrate-queue.js";
import realMain, { WAVE_STATE_PATH, MERGE_CONFIG_PATH } from "../orchestrate-dev.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORCHESTRATE_QUEUE_SOURCE = readFileSync(
  path.join(__dirname, "..", "orchestrate-queue.js"),
  "utf8"
);

const CONFIG_PATH = MERGE_CONFIG_PATH;
const FEATURE = "queue-parity-feature";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;

// PROPERTIES § "Queue fixtures (two required, and the one that is not)" —
// fixture 1: a QUEUE.md table with exactly one `pending` row for this
// feature and no `in-progress` row.
const QUEUE_MD = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | pending | ${FEATURE} | ${REQ_PATH} | — |
`;

const READY_REQ = "---\nready: true\n---\n# REQ body\n";

// PROPERTIES fixture 2: a Phase-0 readiness-triage `_agent` double whose
// last MATCHING `TRIAGE:` line is `TRIAGE: ready` (SE F-08 — the scan is
// bottom-up over lines matching the verdict regex, not "the last line").
const readyTriageAgent = async () => "Looked at the tree.\nTRIAGE: ready\nSigned, triage.\n";

/**
 * A hand-rolled call recorder, matching this repo's `record.push(...)`
 * convention (`makeAgent` in `waveExecution.test.js`) rather than a
 * `jest.fn()` bound to a seam-shaped name.
 */
function makeRecorder(impl) {
  const calls = [];
  const fn = async (...args) => {
    calls.push(args);
    return impl ? impl(...args) : { outcome: "success" };
  };
  fn.calls = calls;
  return fn;
}

// ─── PROP-PARITY-01 — `_runPipeline` is left at its default (structural) ────
//
// TSPEC §5.4's AT-16 row, oracle (i): "the queue's `_runPipeline` is left at
// its default and that fact is asserted — an unconfigured queue call reaches
// `orchestrate-dev`'s exported default, checked by asserting the module's
// delegation is not overridden anywhere on the default path." Asserted on the
// module's OWN source, per that row's "integration + structural" test level —
// the level is TSPEC §5.4's word, not the FSPEC's — never by invoking the real,
// multi-phase `orchestrate-dev` pipeline just to prove a default parameter
// was not overridden.

describe("PROP-PARITY-01 — _runPipeline's default is orchestrate-dev's real, unwrapped main", () => {
  it("wires _runPipeline's default parameter directly to the imported realMain", () => {
    expect(ORCHESTRATE_QUEUE_SOURCE).toMatch(/_runPipeline:\s*runPipelineFn\s*=\s*realMain/);
  });

  it("imports realMain as the default export of orchestrate-dev.js — the same binding this suite calls directly for PROP-PARITY-03", () => {
    expect(ORCHESTRATE_QUEUE_SOURCE).toMatch(
      /import\s+realMain\s*,\s*\{[^}]*\}\s*from\s*["']\.\/orchestrate-dev\.js["']/
    );
    expect(typeof realMain).toBe("function");
  });

  it("assigns runPipelineFn exactly once — its default parameter — never reassigned before dispatch", () => {
    // `main`'s destructured parameters are declared `const` (belt-only), so a
    // second `runPipelineFn = ...` assignment is impossible to parse legally
    // outside the default-parameter position itself. This asserts there is
    // exactly one `=`-assignment token for the name, at that position.
    const assignments = ORCHESTRATE_QUEUE_SOURCE.match(/\brunPipelineFn\s*=/g) || [];
    expect(assignments).toEqual(["runPipelineFn ="]);
  });
});

// ─── PROP-PARITY-02 — the delegation payload's key set is exactly {reqPath} ─

describe("PROP-PARITY-02 — the delegation payload carries only reqPath", () => {
  it("Object.keys(arg) toEqual(['reqPath']) on the spy _runPipeline is called with", async () => {
    const store = { [DEFAULT_QUEUE_PATH]: QUEUE_MD, [REQ_PATH]: READY_REQ };
    const readFile = async (p) => (p in store ? store[p] : null);
    const writeFile = async (p, c) => {
      store[p] = c;
    };
    const spy = makeRecorder();

    const report = await queueMain({
      _readFile: readFile,
      _writeFile: writeFile,
      _agent: readyTriageAgent,
      _runPipeline: spy,
      _log: () => {},
      _phase: () => {},
    });

    // Positive outcome first (PROPERTIES § Fixtures — "the queue properties
    // therefore assert `expect(result.outcome).toBe(...)` positively"), so a
    // fixture regression that returns `blocked`/`idle` reds here, not by
    // silently emptying the spy's call list below.
    expect(report.outcome).toBe("ran");
    expect(report.picked).toBe(FEATURE);

    expect(spy.calls.length).toBe(1);
    const [arg] = spy.calls[0];
    expect(Object.keys(arg)).toEqual(["reqPath"]);
    expect(arg.reqPath).toBe(REQ_PATH);
  });
});

// ─── PROP-PARITY-04 — falsification arm ─────────────────────────────────────

describe("PROP-PARITY-04 — falsification: forwarding an additional key reds PROP-PARITY-02's assertion", () => {
  it("a delegation call carrying {reqPath, startWave} fails toEqual(['reqPath']) while other candidates still resolve", async () => {
    const store = { [DEFAULT_QUEUE_PATH]: QUEUE_MD, [REQ_PATH]: READY_REQ };
    const readFile = async (p) => (p in store ? store[p] : null);
    const writeFile = async (p, c) => {
      store[p] = c;
    };
    const spy = makeRecorder();

    // Simulates the mutation DEC-WVR-07 names as the discriminating arm: a
    // queue that forwards one extra key (e.g. queue-side `startWave`
    // forwarding). The mutation is expressed at the call site the queue
    // itself would use, not inside orchestrate-queue.js — this arm proves
    // PROP-PARITY-02's oracle is falsifiable, not vacuously true.
    const mutatedRunPipeline = ({ reqPath }) => spy({ reqPath, startWave: 2 });

    const report = await queueMain({
      _readFile: readFile,
      _writeFile: writeFile,
      _agent: readyTriageAgent,
      _runPipeline: mutatedRunPipeline,
      _log: () => {},
      _phase: () => {},
    });

    expect(report.outcome).toBe("ran");
    const [arg] = spy.calls[0];
    expect(Object.keys(arg)).not.toEqual(["reqPath"]);
    // The falsification is executed, not merely asserted possible: running
    // PROP-PARITY-02's own oracle against this arm's captured call throws.
    expect(() => expect(Object.keys(arg)).toEqual(["reqPath"])).toThrow();
  });
});

// ─── PROP-PARITY-03 — the direct run reads the ledger at exactly WAVE_STATE_PATH ──
//
// Run through orchestrate-dev's real, unwrapped `main` (the same binding
// PROP-PARITY-01 confirms is `_runPipeline`'s default) — not through the
// queue at all. AT-16 (iii) is a claim about the DIRECT path's own
// `_readFile` call list; the queue "adds nothing that could change it"
// because (per PROP-PARITY-02) it forwards only `{reqPath}`.

const DIRECT_FEATURE = "queue-parity-direct";
const DIRECT_REQ_PATH = `docs/${DIRECT_FEATURE}/REQ-${DIRECT_FEATURE}.md`;

/** One wave, two independent tasks with disjoint file ownership. */
const PLAN_ONE_WAVE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "| T2 | Second task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
  "| T2 | `src/two.js` |",
].join("\n");

const CONFIG_WITH_TEST_COMMAND = JSON.stringify({
  implementation: { testCommand: "npm test" },
});

/** Mirrors `makeAgent` in waveExecution.test.js — every phase this direct run reaches. */
function makeAgent() {
  return async (skill, prompt) => {
    if (["se-review", "te-review", "pm-review"].includes(skill)) {
      return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (["pm-author", "se-author", "te-author"].includes(skill)) {
      if (String(prompt).includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nDECISIONS_WARRANTED: false";
      }
      if (String(prompt).includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.";
    }
    if (skill === "se-implement") return "Implemented. Tests: 2 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (String(prompt).includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/a/b/pull/1";
      }
      return "Rebased.\nREBASE_STATUS: clean";
    }
    return "Success.";
  };
}

/** Mirrors `makeGit` in waveExecution.test.js — a green transport double. */
function makeGit(calls) {
  return async (argv) => {
    calls.push(argv);
    const joined = argv.join(" ");
    if (joined === "rev-parse --abbrev-ref HEAD") {
      return { ok: true, stdout: `feat-${DIRECT_FEATURE}\n`, stderr: "" };
    }
    if (argv[0] === "diff") {
      return { ok: true, stdout: `${argv.slice(4).join("\n")}\n`, stderr: "" };
    }
    return { ok: true, stdout: "", stderr: "" };
  };
}

describe("PROP-PARITY-03 — direct run's _readFile call list, filtered to the ledger path", () => {
  it("string-equals WAVE_STATE_PATH for every call on that path", async () => {
    const readFileCalls = [];
    const gitCalls = [];

    const result = await realMain({
      reqPath: DIRECT_REQ_PATH,
      _agent: makeAgent(),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _checkCi: async () => "passed",
      _phase: () => {},
      _pipeline: async (_label, fn) => fn(),
      _log: () => {},
      _mergeWorktree: async () => ({ ok: true }),
      _readFile: (p) => {
        const path = String(p);
        readFileCalls.push(path);
        if (path === CONFIG_PATH) return CONFIG_WITH_TEST_COMMAND;
        if (path.includes("/PLAN-")) return PLAN_ONE_WAVE;
        return null;
      },
      _git: makeGit(gitCalls),
      _runCommand: async () => ({ ok: true, output: "Tests: 2 passed\n" }),
    });

    expect(result).toBeDefined();

    const ledgerCalls = readFileCalls.filter((path) => path === WAVE_STATE_PATH);
    // A vacuous filter (never called) would make the equality below trivially
    // true, so the call count is asserted positively first.
    expect(ledgerCalls.length).toBeGreaterThan(0);
    for (const path of ledgerCalls) {
      expect(path).toBe(WAVE_STATE_PATH);
    }
  });
});
