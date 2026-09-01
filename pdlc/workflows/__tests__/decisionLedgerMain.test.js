// decisionLedgerMain.test.js — PLAN T-10a, TSPEC §7.2, PROPERTIES PROP-WIRE-01..12 / PROP-OFF-01,
// DC-07 (pdlc-decision-ledger).
//
// T-11's source census (`decisionLedgerCensus.test.js`) proves the wiring block's TEXT is present
// in `orchestrate-dev.js`. A census proves a string is present, never that a line runs: a
// transposed argument, a seam installed under the wrong key, an un-`await`ed injector, or a wiring
// block placed after the last `reviewerPrompt` call would leave every other task green. This file
// is the one place that drives the shipped composition root — `main()`, the default export — and
// checks that the wiring actually executes on a live, served reviewer-dispatch flow (TE F-03,
// DC-07). Following the shape `advisoryWaveGateMain.test.js` established for exactly this reason
// (its own header cites the same DC-07 lesson): every test below drives `mainDev` end to end, with
// NO seam standing in for `gatherDecisionCorpus`, `selectDecisions`, `renderDecisionLedgerBlock` or
// the `wrapperSeams._injectDecisionLedger` assignment itself — the wiring under test is the shipped
// one.
//
// Three arms (TSPEC §7.2, PLAN T-10a):
//
//   1. **Flag on — seam reached (PROP-WIRE-04).** A call-count spy on the scripted `_git` double
//      asserts `gatherDecisionCorpus`'s listing call (`DECISION_CORPUS_ARGV`, an `ls-files`
//      invocation) fires >= 1 on the served reviewer-dispatch flow — a fake of the OUTER
//      (`_injectDecisionLedger`) interface could never satisfy this, only a live traversal of
//      `gatherDecisionCorpus` itself can.
//   2. **Flag on — positive presence (PROP-WIRE-05, -12).** The reviewer prompt actually handed to
//      a reviewer dispatch during the served flow ends with the bytes `renderDecisionLedgerBlock`
//      itself produces for the same corpus/thresholds — not merely "differs from some baseline".
//   3. **Flag off — three positive conjuncts (PROP-OFF-01, PROP-WIRE-12, PM F-01/TE F-01 re-pin to
//      TSPEC §7.2).**
//        (a) the reviewer prompt is byte-identical to T-02's COMMITTED merge-base recording
//            (`fixtures/decision-ledger-baseline/REVIEW-LOOP-REVIEWER-PROMPTS/*.txt`) — never a
//            string computed by subtracting the ledger block from the flag-on prompt (TE Q-02: that
//            form would define the flag-off prompt by the code under test, an implementation echo);
//        (b) the SYMMETRIC DIFFERENCE between this arm's own flag-off and flag-on `report` key sets
//            is exactly `{decisionLedger}`, asserted as a set equality in BOTH directions, so a key
//            spuriously added or dropped on either arm fails — never a comparison against
//            `FX-BASELINE`, which records reviewer-prompt streams only and holds no `report` key
//            set at all (TSPEC §7.4's referent split, PROP-WIRE-12);
//        (c) the emitted `NTC-DECLEDGER-*` notice set on the flag-off run is SET-EQUAL to empty,
//            not merely "contains no `NTC-DECLEDGER-*`" (TE F-05).
//
// `assertNoLiveGitWrites` runs in `afterEach` (the `f325016` lesson: an unscripted live git write
// is a defect in the test, not a thing to tolerate).
//
// Committed skipped — the wiring these tests exercise does not exist until T-18 (PLAN batch 8)
// lands. Every block below is titled `T-18: ...` per the wave-gate skip convention; T-18 removes
// the `.skip` wrapper, observes each block fail for the right reason, and implements until it
// passes. Do not delete a skipped block or write a new test beside it instead of un-skipping it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mainDev, * as dev from "../orchestrate-dev.js";
import { assertNoLiveGitWrites } from "./helpers/decisionLedgerDoubles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── The exact scenario T-02's committed baseline recorded ────────────────────────────────────
//
// `fixtures/decision-ledger-baseline/scenarios.mjs`'s `REVIEW-LOOP-REVIEWER-PROMPTS` case drives
// `reviewLoop` directly with feature `decledger-review`, phase `T`, docType `TSPEC`, reviewers
// `["pm-review", "te-review"]`, optimizer `se-author` — exactly `PHASE_DISPATCH.T` in
// `orchestrate-dev.js`. Reusing the SAME feature name here means a fresh, first-ever `main()` run
// that reaches Phase T through the identical two-round dynamic (round 1: pm-review files a High
// finding, forcing the optimizer branch; round 2: both reviewers approve) produces byte-identical
// `reviewerPrompt` output with the flag off, because `reviewerPrompt` is a pure function of its
// arguments and every argument this scenario varies is reproduced exactly. This is what makes
// conjunct 3(a) checkable at all without inventing a second, un-committed recording.
const FEATURE = "decledger-review";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const TSPEC_PATH = `docs/${FEATURE}/TSPEC-${FEATURE}.md`;
const CONFIG_PATH = ".claude/pdlc.config.json";

const BASELINE_DIR = path.join(
  __dirname,
  "fixtures",
  "decision-ledger-baseline",
  "REVIEW-LOOP-REVIEWER-PROMPTS"
);

/** The four committed reviewer prompts, in T-02's recorded dispatch order. */
const EXPECTED_BASELINE_PROMPTS = ["0.txt", "1.txt", "2.txt", "3.txt"].map((name) =>
  fs.readFileSync(path.join(BASELINE_DIR, name), "utf8")
);

// Markers unique to the Phase T creator dispatch and the Phase T optimizer (revision) dispatch —
// `creatorPrompt`/`optimizerPrompt` in `orchestrate-dev.js` open with these exact literals, so a
// `startsWith` check can never mistake the PLAN's or PROPERTIES' creator prompt (which merely
// names "TSPEC" as an input, never this literal path) for Phase T's own dispatch.
const CREATOR_TSPEC_MARKER = `Create ${TSPEC_PATH} for feature ${FEATURE}.`;
const OPTIMIZER_TSPEC_MARKER = `Address reviewer feedback on ${TSPEC_PATH} for phase T`;
// `reviewerPrompt`'s own opening line for Phase T (TSPEC §4.5's fourth positional argument is
// `feature`), distinct from Phase R's/F's/P's/PR's reviewer prompts, which name a different doc.
const REVIEWER_TSPEC_MARKER = `for phase T of feature ${FEATURE}.`;

const DECISIONS_WARRANTED_FALSE = "DECISIONS_WARRANTED: false";

// Mirrors `orchestrate-dev.js`'s own `REQUIRED_HEADINGS` table (the canonical `title` of each row
// only — an alias would work equally well against `isComplete`, but the canonical title is the
// unambiguous choice) for every docType a generic creator dispatch below might be asked to write.
// REQ and TSPEC are deliberately absent: REQ is pre-seeded by `runPipeline`, and TSPEC is written
// by the explicit `CREATOR_TSPEC_MARKER` branch above (its exact bytes are this file's subject).
const GENERIC_REQUIRED_HEADINGS = Object.freeze({
  FSPEC: [
    "Overview",
    "Linked Requirements",
    "Behavioral Flow",
    "Business Rules",
    "Edge Cases and Error Scenarios",
    "Acceptance Tests",
    "Open Questions",
  ],
  PLAN: ["Overview", "Batches", "Dependencies", "Verification"],
  PROPERTIES: ["Overview", "Properties", "Oracles", "Fixtures"],
  DECISIONS: ["Context", "Options Considered", "Decision", "Consequences"],
});

// A minimal wave-mode PLAN task table: one task, one file, so Phase P's mechanical parser finds a
// task graph (exact `Task ID` / `Dependencies` header cells) and Phase I dispatches exactly one
// `se-implement` call against a satisfiable file-ownership manifest.
const WAVE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/** A minimal document, structurally complete per `isComplete`'s heading table, for any docType a
 *  generic `Create {path} for feature {feature}.` creator dispatch names (§the makeAgent branch
 *  below). Falls back to a single `Overview` section for an unrecognised docType rather than
 *  throwing, so an unanticipated phase degrades to a retry instead of crashing the fixture. PLAN
 *  is special-cased to fold `WAVE_PLAN`'s real task table into its `Batches` section — Phase P's
 *  parser needs an actual table, not prose, to build a task graph.
 */
function genericCompleteDoc(targetPath) {
  const docType = (/\/([A-Z]+)-[^/]+\.md$/.exec(targetPath) || [])[1];
  const headings = GENERIC_REQUIRED_HEADINGS[docType] || ["Overview"];
  return (
    `# ${docType || "Document"}\n\n` +
    headings
      .map((h) =>
        docType === "PLAN" && h === "Batches"
          ? `## ${h}\n\n${WAVE_PLAN}\n`
          : `## ${h}\n\nMinimal fixture body for ${h}.\n`
      )
      .join("\n")
  );
}

// The fixture DECISIONS corpus `gatherDecisionCorpus` enumerates on the flag-on run, matched
// against `DECISION_CORPUS_ARGV`'s project-level glob (`docs/_decisions/DECISIONS-*.md`) — TSPEC
// §3.1, §3.2. Project-level, not tied to `FEATURE`'s own directory, so it survives §3.1's scope
// narrowing (project-level records are unconditionally in-scope) regardless of which single
// feature directory `gatherDecisionCorpus` picks — the flag-on arm's corpus is therefore never
// empty and `renderDecisionLedgerBlock` never degrades to `""` (FSPEC F-7's total-leg guard).
const CORPUS_FEATURE = "decledger-corpus-fixture";
const CORPUS_DECISIONS_PATH = `docs/_decisions/DECISIONS-${CORPUS_FEATURE}.md`;
const CORPUS_DECISIONS_TEXT = [
  "# DECISIONS",
  "",
  "## DEC-DECLEDGERFX-01: Ship the fixture corpus as a feature-level decisions file",
  "",
  "Context: this file exists only so PROP-WIRE-05/-12's flag-on arm has a non-empty corpus.",
  "",
].join("\n");

/**
 * The `.claude/pdlc.config.json` text for the flag-on arm. `maxEntries`/`maxBytes` are transcribed
 * from the shipped example config's `decisionLedger` block (TSPEC §5.3) so the thresholds this
 * test hands `dev.selectDecisions` for its own expected-block derivation, below, match what a real
 * operator config would carry.
 */
const ENABLED_CONFIG_TEXT = JSON.stringify({
  decisionLedger: { enabled: true, maxEntries: 70, maxBytes: 12500 },
});

/**
 * The flag-off arm's config read. `null` — the file is absent — mirrors
 * `scenarios.mjs`'s `KEYS_ABSENT_CONFIG_TEXT` exactly, which is what makes conjunct 3(a)'s
 * byte-identity claim meaningful: T-02's recording was captured against an absent config too.
 */
const DISABLED_CONFIG_TEXT = null;

/**
 * A `decisionLedger` value that is present but NOT a plain object — TSPEC §4.1's
 * `sectionMalformed` leg, the input that must make `NTC-DECLEDGER-MALFORMED` fire on the run
 * report while the run itself proceeds on defaults (REQ-DECLEDGER-05's fail-open story).
 */
const MALFORMED_CONFIG_TEXT = JSON.stringify({ decisionLedger: "enabled, please" });

const DECISION_LEDGER_THRESHOLDS = { maxEntries: 70, maxBytes: 12500 };

// ─── The harness: an in-memory doc store + a scripted `_git`, following the shape
// `advisoryWaveGateMain.test.js`'s local scenario harness documents as its own "decision 3" (never
// `defaultWriteFile`/`defaultGit`, which touch the real filesystem) ─────────────────────────────

function makeDocStore(seed = {}) {
  const files = new Map(Object.entries(seed));
  return {
    files,
    readFile: (p) => (files.has(String(p)) ? files.get(String(p)) : null),
    writeFile: (p, text) => {
      files.set(String(p), text);
      return { ok: true };
    },
    appendFile: (p, text) => {
      files.set(String(p), (files.get(String(p)) ?? "") + text);
      return { ok: true };
    },
    checkFile: (p) =>
      files.has(String(p))
        ? files.get(String(p)) === ""
          ? { ok: false, reason: "file_empty" }
          : { ok: true }
        : { ok: false, reason: "file_not_found" },
    hashFile: (p) => (files.has(String(p)) ? `hash:${String(p)}` : null),
  };
}

/**
 * The `_git` double. `gitCalls` (shared, mutable, per-run) is what the flag-on arm's call-count
 * spy (PROP-WIRE-04) and `afterEach`'s `assertNoLiveGitWrites` both read.
 */
function makeGit({ gitCalls, currentBranchRef, corpusFiles }) {
  return async (argv) => {
    const args = Array.isArray(argv) ? argv : [argv];
    gitCalls.push(args.slice());
    if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
      return { ok: true, stdout: `${currentBranchRef.value}\n`, stderr: "" };
    }
    if (args[0] === "checkout") {
      currentBranchRef.value = args[args.length - 1];
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "rev-parse" || args[0] === "write-tree" || args[0] === "commit-tree") {
      return { ok: true, stdout: "abc1234abc1234abc1234abc1234abc1234abcd\n", stderr: "" };
    }
    // `DECISION_CORPUS_ARGV` — TSPEC §3.1. `gatherDecisionCorpus`'s ONE listing call, scripted to
    // return the fixture corpus path(s) regardless of what THIS run's own pipeline authored, since
    // the corpus is repo-wide, never scoped to the running feature.
    if (args[0] === "ls-files") {
      return { ok: true, stdout: corpusFiles.join("\n") + (corpusFiles.length ? "\n" : ""), stderr: "" };
    }
    if (args[0] === "add") {
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "diff" && args.includes("--name-only")) {
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "diff") {
      return { ok: true, stdout: "", stderr: "" };
    }
    return { ok: true, stdout: "", stderr: "" };
  };
}

/**
 * The all-approve pipeline agent. Auto-approves every phase's review round on its first pass
 * EXCEPT Phase T's, which reproduces T-02's committed two-round scenario exactly: round 1's
 * `pm-review` files a High finding (forcing the optimizer branch), round 2 both reviewers approve.
 * Every Phase T reviewer-dispatch prompt is pushed onto `tPrompts`, in dispatch order, regardless
 * of which arm is running — the flag-on/flag-off difference lives entirely in the PROMPT BYTES the
 * production wiring composes, never in this agent's own branching.
 */
function makeAgent({ store, tPrompts, dispatched }) {
  return async (skill, prompt) => {
    const text = String(prompt ?? "");
    dispatched.push({ skill, text });

    if (skill === "se-author" && text.startsWith(CREATOR_TSPEC_MARKER)) {
      store.writeFile(TSPEC_PATH, "# TSPEC\n\n§1: body.\n");
      return `Authored TSPEC.\n${DECISIONS_WARRANTED_FALSE}`;
    }
    if (skill === "se-author" && text.startsWith(OPTIMIZER_TSPEC_MARKER)) {
      store.writeFile(TSPEC_PATH, "# TSPEC\n\n§1: body, revised per pm-review.\n");
      return `Revised.\nREVISION-COMPLETE: yes\n${DECISIONS_WARRANTED_FALSE}`;
    }

    if ((skill === "pm-review" || skill === "te-review") && text.includes(REVIEWER_TSPEC_MARKER)) {
      tPrompts.push(text);
      const isRound1 = text.includes("This is iteration 1.");
      if (isRound1 && skill === "pm-review") {
        return 'Reviewed.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';
      }
      return `Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n${DECISIONS_WARRANTED_FALSE}`;
    }

    // Every OTHER review dispatch — Phase R (se-review/te-review over the REQ itself), Phase F
    // (se-review/te-review over the FSPEC), Phase P/PR (pm-review/te-review or pm-review/se-review
    // over PLAN/PROPERTIES) — converges in one round.
    if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
      return 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    if (skill === "se-author" || skill === "pm-author" || skill === "te-author") {
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      // A creator dispatch for any OTHER document (FSPEC, PLAN, PROPERTIES, …) — `creatorPrompt`'s
      // own opening line (`orchestrate-dev.js`, "Create {path} for feature {feature}."). Unlike
      // TSPEC (handled explicitly above, since its reviewer-dispatch bytes are this file's whole
      // subject), these documents are load-bearing only insofar as the pipeline needs to walk
      // PAST them to reach Phase T — so this writes the minimal structurally-complete document
      // `isComplete`'s required-heading table asks for, generically, rather than one hand-rolled
      // branch per phase.
      const createMatch = /^Create (\S+) for feature/.exec(text);
      if (createMatch) {
        store.writeFile(createMatch[1], genericCompleteDoc(createMatch[1]));
        return `Created ${createMatch[1]}.\n${DECISIONS_WARRANTED_FALSE}`;
      }
      return "Created/updated document successfully.";
    }

    if (skill === "guard") return "{ ok: true }";
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
    if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written and committed.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };
}

/** Drives `mainDev` end to end for one flag setting, returning everything an arm needs. */
async function runPipeline({ configText, corpusFiles = [] }) {
  const store = makeDocStore({
    [REQ_PATH]: "# REQ\n\nA trivial feature, decision-ledger main() fixture.\n",
    [CONFIG_PATH]: configText,
    [CORPUS_DECISIONS_PATH]: CORPUS_DECISIONS_TEXT,
  });
  const gitCalls = [];
  const currentBranchRef = { value: `feat-${FEATURE}` };
  const tPrompts = [];
  const dispatched = [];
  const logs = [];

  const result = await mainDev({
    reqPath: REQ_PATH,
    forcePhases: null,
    _agent: makeAgent({ store, tPrompts, dispatched }),
    _parallel: (promises) => Promise.all(promises),
    _checkFile: async (p) => store.checkFile(p),
    _readFile: async (p) => store.readFile(p),
    _writeFile: async (p, text) => store.writeFile(p, text),
    _appendFile: async (p, text) => store.appendFile(p, text),
    _hashFile: async (p) => store.hashFile(p),
    _hashNormalizedFile: async (p) => store.hashFile(p),
    _git: makeGit({ gitCalls, currentBranchRef, corpusFiles }),
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
    _log: (msg) => logs.push(String(msg)),
  });

  return { result, tPrompts, dispatched, logs, gitCalls, store };
}

// ─── afterEach leak guard (the `f325016` lesson, TSPEC §10 / PLAN T-10a) ──────────────────────

let lastGitCalls = [];

afterEach(() => {
  assertNoLiveGitWrites(lastGitCalls);
  lastGitCalls = [];
});

describe("decisionLedgerMain — `main()`-driven composition-root wiring (TSPEC §7.2, PLAN T-10a)", () => {
  test("T-18: flag on — gatherDecisionCorpus's `_git` listing call fires >= 1 on the served reviewer flow (PROP-WIRE-04)", async () => {
    const { result, gitCalls } = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = gitCalls;

    expect(result.outcome).toBe("success");

    // `DECISION_CORPUS_ARGV`'s own glob literal (TSPEC §3.1) — distinguishes
    // `gatherDecisionCorpus`'s ONE listing call from any other `ls-files` invocation the pipeline
    // might otherwise issue, so this is a call-count spy on the SPECIFIC seam under test, not on
    // "some `_git` call happened".
    const corpusListingCalls = gitCalls.filter(
      (argv) => argv[0] === "ls-files" && argv.some((a) => String(a).includes("DECISIONS-*.md"))
    );
    expect(corpusListingCalls.length).toBeGreaterThanOrEqual(1);
  });

  test("T-18: flag on — the served reviewer prompt ends with renderDecisionLedgerBlock's own output for the same corpus (PROP-WIRE-05, PROP-WIRE-12 presence-and-shape)", async () => {
    const { result, tPrompts, gitCalls } = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = gitCalls;

    expect(result.outcome).toBe("success");
    expect(tPrompts.length).toBe(4);

    // The expected block is derived by calling the SAME pure renderer the production wiring calls,
    // over the identical corpus this run's own `_git`/`_readFile` doubles served — never a second,
    // hand-authored copy of the rule text or the index, and never a string computed by subtracting
    // anything from the served prompt (TE Q-02's rejected form is about the FLAG-OFF prompt, but
    // the same discipline — derive from the real pure function, not from the code under test's own
    // output — applies here too).
    const corpus = await dev.gatherDecisionCorpus({
      feature: FEATURE,
      _git: makeGit({ gitCalls: [], currentBranchRef: { value: `feat-${FEATURE}` }, corpusFiles: [CORPUS_DECISIONS_PATH] }),
      _readFile: async (p) =>
        p === CORPUS_DECISIONS_PATH ? CORPUS_DECISIONS_TEXT : null,
    });
    expect(corpus.unlistable).toBe(false);
    const { selected } = dev.selectDecisions({
      entries: corpus.entries,
      feature: FEATURE,
      thresholds: DECISION_LEDGER_THRESHOLDS,
    });
    const expectedBlock = dev.renderDecisionLedgerBlock({ selected });
    expect(expectedBlock.length).toBeGreaterThan(0);

    for (const prompt of tPrompts) {
      expect(prompt.endsWith(expectedBlock)).toBe(true);
    }

    // Presence-and-shape (PROP-WIRE-12's flag-on half): `report.decisionLedger` is the sink,
    // non-null, non-empty — the field's ONLY proof, per TSPEC §7.3/§5.4 and PROPERTIES PROP-INV-09.
    expect(result.report.decisionLedger).toBeTruthy();
    expect(Array.isArray(result.report.decisionLedger.dispatches)).toBe(true);
    expect(result.report.decisionLedger.dispatches.length).toBeGreaterThanOrEqual(1);
  });

  test("T-18: flag off — three positive conjuncts: byte-identical to T-02's committed recording, the flag-off/flag-on report key-set symmetric difference is exactly {decisionLedger} in both directions, and the flag-off NTC-DECLEDGER-* notice set is empty (PROP-OFF-01, PROP-WIRE-12)", async () => {
    const off = await runPipeline({ configText: DISABLED_CONFIG_TEXT, corpusFiles: [] });
    lastGitCalls = off.gitCalls;
    expect(off.result.outcome).toBe("success");
    expect(off.tPrompts.length).toBe(4);

    // Conjunct (a): byte-identical to T-02's COMMITTED recording, never to a string computed by
    // subtracting the ledger block from a flag-on run's prompt (TE Q-02 — that form makes the
    // flag-off prompt an implementation echo of the code under test; the committed recording is
    // the independent referent REQ-DECLEDGER-02 / AT-04 actually name).
    expect(off.tPrompts).toEqual(EXPECTED_BASELINE_PROMPTS);

    // Conjunct (c): the emitted `NTC-DECLEDGER-*` notice set is SET-EQUAL to empty, not merely
    // "contains none" — an absent `decisionLedger` config block emits no notice (TSPEC §2.2), and
    // this pins that positively rather than by containment.
    // Filtered on the notice's `id`, never `String(n)`: the decision-ledger notices are pushed
    // as OBJECTS (`{ id, detail }`), and `String({…})` is `"[object Object]"` — a predicate over
    // the stringified object matches nothing whatever the run emitted, so the conjunct could not
    // fail (CR F-03). The positive pair for this empty set is the malformed-section case below.
    const offDecledgerNotices = new Set(
      (off.result.report.notices ?? [])
        .map((n) => String(n?.id ?? n))
        .filter((id) => id.includes("NTC-DECLEDGER-"))
    );
    expect(offDecledgerNotices).toEqual(new Set());

    // Conjunct (b): the paired run. Same pipeline, same corpus-bearing config, flag on this time —
    // driven INSIDE this same arm so the referent is the paired runs themselves, never
    // FX-BASELINE (TSPEC §7.4's recording holds no `report` key set at all).
    const on = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    assertNoLiveGitWrites(on.gitCalls);
    expect(on.result.outcome).toBe("success");

    const offKeys = new Set(Object.keys(off.result.report));
    const onKeys = new Set(Object.keys(on.result.report));
    const addedOnOn = [...onKeys].filter((k) => !offKeys.has(k));
    const droppedOnOff = [...offKeys].filter((k) => !onKeys.has(k));
    const symmetricDifference = new Set([...addedOnOn, ...droppedOnOff]);

    // Both directions, asserted as positives rather than as a single negative each — a key
    // spuriously ADDED on the flag-on run and a key spuriously DROPPED on the flag-off run both
    // fail this the same way a key that never moved does not.
    expect(symmetricDifference).toEqual(new Set(["decisionLedger"]));
    expect(offKeys.has("decisionLedger")).toBe(false);
    expect(onKeys.has("decisionLedger")).toBe(true);
  });

  // The block must reach REVIEWER dispatches ALONE (REQ G-2, REQ-DECLEDGER-03's "Who"). The
  // harness already records every dispatch (`dispatched.push({ skill, text })`) and never asserted
  // on it, so a regression appending the ledger block to the creator or optimizer dispatch was
  // invisible: the reviewer conjuncts still passed and the flag-off baseline is a different run
  // (TE CR F-03). Asserted positively — byte-identity of the non-reviewer dispatches across the
  // paired arms — not as an absence of the block's bytes.
  test("T-18: flag on — the TSPEC creator and optimizer dispatches are BYTE-IDENTICAL to their flag-off counterparts, while the reviewer prompts differ (REQ G-2, PROP-OFF-01)", async () => {
    const off = await runPipeline({ configText: DISABLED_CONFIG_TEXT, corpusFiles: [] });
    const on = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = on.gitCalls;
    assertNoLiveGitWrites(off.gitCalls);
    expect(off.result.outcome).toBe("success");
    expect(on.result.outcome).toBe("success");

    const textsMatching = (run, marker) =>
      run.dispatched.filter((d) => d.skill === "se-author" && d.text.startsWith(marker)).map((d) => d.text);

    const offCreator = textsMatching(off, CREATOR_TSPEC_MARKER);
    const onCreator = textsMatching(on, CREATOR_TSPEC_MARKER);
    const offOptimizer = textsMatching(off, OPTIMIZER_TSPEC_MARKER);
    const onOptimizer = textsMatching(on, OPTIMIZER_TSPEC_MARKER);

    // Non-vacuity: both arms really issued the two non-reviewer dispatches this asserts over.
    expect(onCreator.length).toBeGreaterThanOrEqual(1);
    expect(onOptimizer.length).toBeGreaterThanOrEqual(1);
    expect(onCreator).toEqual(offCreator);
    expect(onOptimizer).toEqual(offOptimizer);

    // The anchor conjunct: the flag-on run DID inject somewhere, so the byte-identity above is a
    // statement about routing, not about a run in which nothing happened.
    expect(on.tPrompts).not.toEqual(off.tPrompts);
  });

  // The POSITIVE pair for the flag-off empty-notice-set conjunct above (CR F-03). Without it the
  // notice half of REQ-DECLEDGER-05 is absence-only: `parseDecisionLedgerConfig`'s own unit tests
  // prove `sectionMalformed` is computed, but nothing drove the parser -> `notices.push` wiring
  // through `main()`, so a run that emitted no notice at all would have looked identical.
  test("T-18: a malformed `decisionLedger` section drives NTC-DECLEDGER-MALFORMED onto the run report through main(), and the run still completes on defaults (REQ-DECLEDGER-05)", async () => {
    const malformed = await runPipeline({ configText: MALFORMED_CONFIG_TEXT, corpusFiles: [] });
    lastGitCalls = malformed.gitCalls;

    expect(malformed.result.outcome).toBe("success");

    const emitted = new Set(
      (malformed.result.report.notices ?? [])
        .map((n) => String(n?.id ?? n))
        .filter((id) => id.includes("NTC-DECLEDGER-"))
    );
    // SET-EQUAL, not "contains": a second, spurious decision-ledger notice fails this too.
    expect(emitted).toEqual(new Set(["NTC-DECLEDGER-MALFORMED"]));

    // "Proceeds on defaults" — `enabled` defaults false, so the feature stays off and the report
    // carries no `decisionLedger` key, exactly as the absent-config run does.
    expect(Object.keys(malformed.result.report).includes("decisionLedger")).toBe(false);
    expect(malformed.tPrompts).toEqual(EXPECTED_BASELINE_PROMPTS);
  });

  // CODE_REVIEW v1 F-4/F-5 (PROP-CFG-08's F-5 leg): the sibling wrong-typed-key leg of the
  // malformed-section test above. `NTC-DECLEDGER-MALFORMED` fires when the section itself isn't
  // a plain object; `NTC-DECLEDGER-KEYTYPE` fires when the section IS a plain object but one of
  // its keys is wrong-typed — a distinct branch in `main()` (`:15589-15596`) that the malformed
  // test above never reaches. `enabled: false` keeps the run on the disabled path (byte-identical
  // baseline prompts), isolating the notice-emission assertion from the flag-on dispatch machinery.
  test("T-18: a wrong-typed `decisionLedger` key drives NTC-DECLEDGER-KEYTYPE onto the run report through main(), and the run still completes on per-key defaults (PROP-CFG-08's F-5 leg)", async () => {
    const keytypeConfigText = JSON.stringify({
      decisionLedger: { enabled: false, maxEntries: "seventy" },
    });
    const keytype = await runPipeline({ configText: keytypeConfigText, corpusFiles: [] });
    lastGitCalls = keytype.gitCalls;

    expect(keytype.result.outcome).toBe("success");

    const emitted = new Set(
      (keytype.result.report.notices ?? [])
        .map((n) => String(n?.id ?? n))
        .filter((id) => id.includes("NTC-DECLEDGER-"))
    );
    // SET-EQUAL, not "contains": a spurious NTC-DECLEDGER-MALFORMED alongside it fails this too.
    expect(emitted).toEqual(new Set(["NTC-DECLEDGER-KEYTYPE"]));

    // The wrong-typed key is named in the notice detail (TSPEC §4.4).
    const keytypeNotice = (keytype.result.report.notices ?? []).find(
      (n) => String(n?.id ?? n) === "NTC-DECLEDGER-KEYTYPE"
    );
    expect(String(keytypeNotice?.detail ?? "")).toContain("maxEntries");

    // Enabled falls back to its own default (`false`), so the run stays on the disabled path.
    expect(Object.keys(keytype.result.report).includes("decisionLedger")).toBe(false);
    expect(keytype.tPrompts).toEqual(EXPECTED_BASELINE_PROMPTS);
  });

  // CODE_REVIEW v1 F-1: the run's own `_log` emitter must be threaded onto the decision-ledger
  // injector so the per-dispatch observability line is live in production, not only under test
  // doubles that construct `buildDecisionLedgerInjector` directly (mirrors the learnings-injector
  // lesson at `:15645-15649`).
  test("T-18: flag on — the per-dispatch decision-ledger log line fires through main()'s own `_log` on a served reviewer dispatch (CODE_REVIEW v1 F-1)", async () => {
    const { result, logs, gitCalls } = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = gitCalls;

    expect(result.outcome).toBe("success");

    const ledgerLogs = logs.filter((line) => line.startsWith("decision-ledger:"));
    expect(ledgerLogs.length).toBeGreaterThanOrEqual(1);
  });

  // CODE_REVIEW v1 F-2: the sole production call site (`reviewLoop`'s `await
  // _injectDecisionLedger({ feature })`) must thread real `phaseId`/`docType`/`round` values from
  // the enclosing review-loop context, not leave them `undefined` — TSPEC §5.1's
  // `DecisionLedgerDispatchRecord` declares `phaseId: string | null`, `docType: string | null`,
  // `round: number`.
  test("T-18: flag on — the production dispatch row's phaseId/docType/round are all non-undefined (CODE_REVIEW v1 F-2)", async () => {
    const { result, gitCalls } = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = gitCalls;

    expect(result.outcome).toBe("success");
    const dispatches = result.report.decisionLedger.dispatches;
    expect(dispatches.length).toBeGreaterThanOrEqual(1);
    for (const record of dispatches) {
      expect(record.feature).not.toBeUndefined();
      expect(record.phaseId).not.toBeUndefined();
      expect(record.docType).not.toBeUndefined();
      expect(record.round).not.toBeUndefined();
    }
  });

  // CODE_REVIEW v1 F-3: `decisionLedgerSink.ruleInputs.thresholds` (TSPEC §5.1) must be populated
  // once per run from the parsed config, independent of whether any dispatch ever calls the
  // injector — mirroring the learnings-injector analogue at `:15657-15663`.
  test("T-18: flag on — report.decisionLedger.ruleInputs.thresholds discloses the config's own maxEntries/maxBytes (CODE_REVIEW v1 F-3)", async () => {
    const { result, gitCalls } = await runPipeline({
      configText: ENABLED_CONFIG_TEXT,
      corpusFiles: [CORPUS_DECISIONS_PATH],
    });
    lastGitCalls = gitCalls;

    expect(result.outcome).toBe("success");
    expect(result.report.decisionLedger.ruleInputs).toEqual({
      thresholds: DECISION_LEDGER_THRESHOLDS,
    });
  });
});

