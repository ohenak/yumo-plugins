// Shared fixture builders and per-run scripted-transport drivers for the T48
// five-configuration corpus harness (pdlc-headless-engine).
//
// Each of M-ENG-07's seven model-map rows is witnessed by a REAL dispatch
// through the REAL adapter and the REAL `pdlc/workflows/orchestrate-dev.js` /
// `orchestrate-queue.js` modules — offline, throwaway git repos, the transport
// doubled exactly as `smoke.test.js` doubles it. Nothing here edits, stubs, or
// monkey-patches either workflow module; every halt or skip below is the
// module's OWN mechanism (an unparseable table, a rebase conflict, a
// malformed verdict trailer), reached through pre-seeded fixture content or
// scripted transport responses — never forced from the test.
//
// `corpusRun` is threaded into `createAdapter()` so every settlement line this
// harness produces carries its run id, letting `corpus-model-map.test.js`
// (T50, not this task) attribute a witnessed row to the run that produced it.

import path from "node:path";
import os from "node:os";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  appendFileSync,
  rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { approvalHashOf } from "../../workflows/orchestrate-dev.js";
import { TransportError } from "../lib/transport.mjs";
import { createAdapter } from "../lib/adapter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const engineRoot = path.dirname(__dirname);
export const repoRoot = path.dirname(path.dirname(engineRoot));
export const PLUGIN_ROOT = path.join(repoRoot, "pdlc");
export const FIXTURES_DIR = path.join(__dirname, "fixtures", "corpus");

/** The module's own reviewer-skill → cross-review-role-slug map (mirrored, not imported —
 *  `orchestrate-dev.js`'s copy is module-private; this one only ever needs to match it, and
 *  `smoke.test.js`'s existing assertions are the check that it does). */
export const ROLE_SLUG = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

export function git(cwd, args) {
  return execFileSync("git", args, { cwd, stdio: "pipe", encoding: "utf8" });
}

export function readFixture(name) {
  return readFileSync(path.join(FIXTURES_DIR, name), "utf8");
}

function write(root, rel, text) {
  const abs = path.join(root, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, text, "utf8");
  return abs;
}
export const writeFile = write;

// ─── text builders — each satisfies REQUIRED_HEADINGS' containment rule for its docType ──

export function reqText(feature) {
  return [
    "---",
    `feature: ${feature}`,
    "ready: true",
    "depends-on: []",
    "---",
    `# REQ — ${feature}`,
    "",
    "## 1. Problem / Context",
    "A corpus-harness fixture feature; exists only to exercise the pipeline offline.",
    "",
    "## 2. Goals",
    "- G-1 Witness a model-map row through a real dispatch.",
    "",
    "## 3. Non-Goals",
    "- NG-1 No production behavior is implied.",
    "",
    "## 4. Constraints",
    "- C-1 Offline only; no network, no real model calls.",
    "",
    "## 5. Acceptance Criteria",
    "- AC-1.1 The corpus run reaches its documented witness point.",
    "",
    "## 6. Risks",
    "- R-1 None — this document is never shipped.",
    "",
    "## 7. Obligations",
    "- O-1 None.",
    "",
  ].join("\n");
}

export function fspecText(feature, reqPath) {
  return [
    `# FSPEC — ${feature}`,
    "",
    "## 1. Overview",
    "The corpus fixture's functional surface.",
    "",
    "## 2. Linked Requirements",
    `Derives from ${reqPath} (AC-1.1).`,
    "",
    "## 3. Behavioral Flow",
    "n/a — fixture only.",
    "",
    "## 4. Business Rules",
    "- BR-1 n/a.",
    "",
    "## 5. Edge Cases and Error Scenarios",
    "- E-1 n/a.",
    "",
    "## 6. Acceptance Tests",
    "- AT-1 n/a.",
    "",
    "## 7. Open Questions",
    "- OQ-1 n/a.",
    "",
  ].join("\n");
}

export function tspecText(feature) {
  return [
    `# TSPEC — ${feature}`,
    "",
    "## 1. Overview",
    "n/a — fixture only.",
    "",
    "## 2. Architecture",
    "n/a.",
    "",
    "## 3. Interfaces",
    "n/a.",
    "",
    "## 4. Data Model",
    "n/a.",
    "",
    "## 5. Test Strategy",
    "n/a.",
    "",
    "## 6. Open Questions",
    "n/a.",
    "",
  ].join("\n");
}

/** DECISIONS is conditional on Phase T's `DECISIONS_WARRANTED` trailer — and when Phase T is
 *  SKIPPED on a recorded approval the trailer was never re-emitted, so
 *  `parseDecisionsWarranted(null)` takes its conservative default of TRUE
 *  (`orchestrate-dev.js:9875`, warning at `:4324`) and Phase D runs. A run that pre-approves
 *  its way to Phase I therefore owes a DECISIONS document as well; without one the pipeline
 *  halts on `reviewLoop`'s entry precondition at Phase D, upstream of the witness point. */
export function decisionsText(feature) {
  return [
    `# DECISIONS — ${feature}`,
    "",
    "## 1. Context",
    "n/a — fixture only.",
    "",
    "## 2. Options Considered",
    "n/a.",
    "",
    "## 3. Decision",
    "n/a.",
    "",
    "## 4. Consequences",
    "n/a.",
    "",
  ].join("\n");
}

export function propertiesText(feature) {
  return [
    `# PROPERTIES — ${feature}`,
    "",
    "## 1. Overview",
    "n/a — fixture only.",
    "",
    "## 2. Properties",
    "n/a.",
    "",
    "## 3. Oracles",
    "n/a.",
    "",
    "## 4. Fixtures",
    "n/a.",
    "",
  ].join("\n");
}

/** A single-task PLAN: a parseable task table AND a parseable file-ownership manifest,
 *  so Phase P's self-parse gate (afterConverged) accepts it and Phase I derives wave mode. */
export function planTextValid(feature) {
  return [
    `# PLAN — ${feature}`,
    "",
    "## 1. Overview",
    "One task, one wave.",
    "",
    "## 2. Batches",
    "",
    "| Task ID | Description | Dependencies | Batch |",
    "|---|---|---|---|",
    "| T-01 | Write the corpus note | - | 1 |",
    "",
    "## 3. Dependencies",
    "T-01 has no dependencies.",
    "",
    "## 4. Verification",
    "`true` — the corpus harness stubs the test-gate command.",
    "",
    "## 5. File Ownership",
    "",
    "| Task | Files |",
    "|---|---|",
    `| T-01 | \`docs/${feature}/NOTES.md\` |`,
    "",
  ].join("\n");
}

export function crossReviewText(role, docType, round, doc) {
  return [
    `# Cross-Review — ${role} — ${docType} v${round}`,
    "",
    `Scope: ${doc}`,
    "",
    "## Findings",
    "No blocking findings.",
    "",
    "## Verdict",
    "",
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
  ].join("\n");
}

// ─── the throwaway consumer repo ────────────────────────────────────────────

export function makeRepo(feature, { files = {} } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-corpus-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "corpus@example.invalid"]);
  git(root, ["config", "user.name", "pdlc corpus"]);
  git(root, ["config", "commit.gpgsign", "false"]);
  git(root, ["checkout", "-q", "-b", `feat-${feature}`]);

  for (const [rel, text] of Object.entries(files)) write(root, rel, text);
  write(root, "README.md", "# corpus consumer\n");
  git(root, ["add", "-A"]);
  git(root, ["commit", "-q", "-m", "corpus fixture"]);
  return root;
}

/**
 * Pre-seed an ALREADY-APPROVED phase: the document on disk plus tier-1 approving
 * cross-review files for every reviewer, hashed with the module's OWN
 * `approvalHashOf` — so `phaseGate`'s freshness comparison reads FRESH and the
 * phase is skipped without a single dispatch (§2.5 step 3/4 of the review-loop
 * mechanics). Used only by run v(b), which needs Phase P skipped so its
 * pre-baked unparseable task table survives to reach Phase I's fallback.
 */
export function seedApproved(root, feature, { docType, docPath, text, reviewers }) {
  write(root, docPath, text);
  const hash = approvalHashOf(text);
  for (const skill of reviewers) {
    const role = ROLE_SLUG[skill];
    const file = `docs/${feature}/CROSS-REVIEW-${role}-${docType}-v1.md`;
    const body =
      crossReviewText(role, docType, 1, docPath) +
      `\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ${"a".repeat(40)}\n`;
    write(root, file, body);
  }
}

export function corpusAdapter(root, transport, corpusRun, opts = {}) {
  return createAdapter({
    transport,
    pluginRoot: PLUGIN_ROOT,
    cwd: root,
    log: () => {},
    corpusRun,
    // Never spawn a real shell in a test — the corpus harness stubs the
    // implementation test-gate command; its exit status is asserted through
    // the report, never through a real subprocess.
    runCommandFn: async () => ({ ok: true, output: "corpus: stubbed command" }),
    ...opts,
  });
}

// ─── the doc-type-from-path helper every transport below shares ────────────

function docTypeOf(docPath) {
  if (/REQ-/.test(docPath)) return "REQ";
  if (/FSPEC-/.test(docPath)) return "FSPEC";
  if (/TSPEC-/.test(docPath)) return "TSPEC";
  if (/PLAN-/.test(docPath)) return "PLAN";
  if (/PROPERTIES-/.test(docPath)) return "PROPERTIES";
  return "UNKNOWN";
}

/**
 * The composed prompt is `role definition bytes` + `Task:\n{module prompt}`
 * (`lib/skills.mjs`'s `composeDispatchPrompt`). Every pattern below must be read
 * against the TASK half only: the inlined SKILL.md bytes contain the same
 * phrasings the modules use (e.g. `se-author/SKILL.md:146`'s
 * "Create `docs/{feature-name}/PLAN-{feature-name}.md`"), so a whole-prompt match
 * makes a scripted double answer the wrong dispatch. Falls back to the whole
 * prompt if the marker is ever absent, so the double degrades loudly, not silently.
 */
function taskOf(prompt) {
  const text = String(prompt);
  const marker = /--- END ROLE DEFINITION: [a-z-]+ ---\n/.exec(text);
  return marker ? text.slice(marker.index + marker[0].length) : text;
}

const REVIEW_RE =
  /Review the document at (\S+) for phase (\S+) of feature (\S+)\. This is iteration (\d+)\./;
const RECOVERY_RE = /did not end with a machine-readable VERDICT trailer/;
const REBASE_RE = /Rebase the feature branch onto the latest default branch/;
const DAG_EXTRACTION_RE = /extract the task table/;

/**
 * Run i / run v(a)'s shared driver: the REAL R→F→T→P→PR→I(wave) pipeline, every
 * response well-formed unless `malformedOnce` or `authorTspec: false` says
 * otherwise. Reviewer dispatches are role-generic (REQ/FSPEC/TSPEC/PLAN/PROPERTIES),
 * so the same transport serves every phase this pipeline reaches.
 *
 * @param {string} root
 * @param {string} feature
 * @param {{
 *   authorTspec?: boolean,           - false ⇒ se-author writes nothing at Phase T (the
 *                                       existing smoke halt, reused verbatim for run v(a)).
 *   malformedOnce?: {role: string, docType: string} - exactly one reviewer's ONE response,
 *                                       for the ONE docType named, ends in the pinned
 *                                       malformed-verdict-trailer fixture instead of a
 *                                       parseable VERDICT line (row 6, run v(a)).
 *   rebaseStatus?: "clean"|"conflict" - ship-pr's DOD-step-0 rebase trailer (run i uses
 *                                       "conflict" to reach a clean halt before Phase PUB's
 *                                       real `gh`-polling, which this harness cannot double).
 * }} [cfg]
 */
export function makeFullPipelineTransport(root, feature, cfg = {}) {
  const { authorTspec = true, malformedOnce = null, rebaseStatus = "clean" } = cfg;
  const calls = [];
  let malformedConsumed = false;

  async function dispatch(prompt, opts = {}) {
    const roleMatch = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/.exec(prompt);
    const role = roleMatch ? roleMatch[1] : "unknown";
    const task = taskOf(prompt);
    calls.push({ role, model: opts.model, cwd: opts.cwd, prompt });

    // ── the haiku verdict-recovery re-dispatch (row 6) — no file write, matching
    //    a live reviewer that re-emits only the trailer from its own prior text ──
    if (RECOVERY_RE.test(task)) {
      return {
        text: "Recovered.\nVERDICT: Approved\n{\"high\": 0, \"medium\": 0, \"low\": 0}\n",
        sessionId: "corpus",
      };
    }

    const review = REVIEW_RE.exec(task);
    if (review && ROLE_SLUG[role]) {
      const [, doc, , feat, iterationStr] = review;
      const iteration = Number(iterationStr);
      const docType = docTypeOf(doc);
      const roleSlug = ROLE_SLUG[role];
      const file = `docs/${feat}/CROSS-REVIEW-${roleSlug}-${docType}-v${iteration}.md`;

      if (
        malformedOnce &&
        !malformedConsumed &&
        role === malformedOnce.role &&
        docType === malformedOnce.docType
      ) {
        malformedConsumed = true;
        const malformed = readFixture("malformed-verdict-trailer.txt").trim();

        // It is the reviewer's RESPONSE trailer that is malformed, not its file —
        // which is what M-ENG-07 run v(a) names ("a reviewer response whose
        // `VERDICT` trailer is malformed") and the only shape that reaches
        // `recoverVerdict` at all. `dispatchAndVerify` judges a review episode
        // terminal on the FILE's structural completeness alone
        // (`terminalFrom`'s `mode !== "revision"` arm → `measured.complete`), and
        // §5.9's cross-review criterion is "at least one catalogue `VERDICT: `
        // value in the file". A file carrying the malformed trailer is therefore
        // incomplete, the episode re-dispatches inside itself, and the SECOND
        // (well-formed) response is the one `reviewLoop` parses — no recovery
        // dispatch is ever provoked. The response half is where the defect
        // belongs: `recoverVerdict` reads `rawResult`, never the file.
        write(root, file, crossReviewText(roleSlug, docType, iteration, doc));
        return { text: `Reviewed ${doc}.\n${malformed}\n`, sessionId: "corpus" };
      }

      write(root, file, crossReviewText(roleSlug, docType, iteration, doc));
      return {
        text: `Reviewed ${doc}.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`,
        sessionId: "corpus",
      };
    }

    if (role === "pm-author") {
      write(root, `docs/${feature}/FSPEC-${feature}.md`, fspecText(feature, `docs/${feature}/REQ-${feature}.md`));
      return { text: `Wrote FSPEC.\nREVISION-COMPLETE: yes\n`, sessionId: "corpus" };
    }

    if (role === "se-author") {
      if (DAG_EXTRACTION_RE.test(task)) {
        // Not reached by run i (the PLAN's task table parses in-script) — present
        // only so this shared transport degrades safely if it ever were.
        return { text: "ok", sessionId: "corpus" };
      }
      if (/Create \S*PLAN-/.test(task)) {
        write(root, `docs/${feature}/PLAN-${feature}.md`, planTextValid(feature));
        return { text: "Wrote PLAN.\nREVISION-COMPLETE: yes\n", sessionId: "corpus" };
      }
      // Phase T's creator (and, were it ever reached, its optimizer).
      if (authorTspec) {
        write(root, `docs/${feature}/TSPEC-${feature}.md`, tspecText(feature));
        return {
          text: "Wrote TSPEC.\nDECISIONS_WARRANTED: false\n",
          sessionId: "corpus",
        };
      }
      // Deliberately writes NOTHING — reviewLoop's own entry precondition then
      // halts Phase T, exactly as smoke.test.js's existing halt does.
      return { text: "Could not author the TSPEC.\nDECISIONS_WARRANTED: false\n", sessionId: "corpus" };
    }

    if (role === "te-author") {
      write(root, `docs/${feature}/PROPERTIES-${feature}.md`, propertiesText(feature));
      return { text: "Wrote PROPERTIES.\nREVISION-COMPLETE: yes\n", sessionId: "corpus" };
    }

    if (role === "se-implement") {
      // Wave-mode task dispatch (row 2, Sonnet). Writes the ONE file the PLAN's
      // ownership manifest names, so the wave's pathspec-scoped commit is non-empty.
      write(root, `docs/${feature}/NOTES.md`, "Implemented by the corpus harness's se-implement double.\n");
      return { text: "Task T-01 done.\n", sessionId: "corpus" };
    }

    if (role === "ship-pr" && REBASE_RE.test(task)) {
      // Phase DOD step 0. `rebaseStatus: "conflict"` reaches a clean halt through
      // the module's own mechanism, before Phase PUB's real `gh pr view` polling —
      // which this offline harness has no double for.
      return { text: `REBASE_STATUS: ${rebaseStatus}\n`, sessionId: "corpus" };
    }

    return { text: "ok", sessionId: "corpus" };
  }

  return { transport: { dispatch }, calls };
}

/**
 * Run ii's driver: Phase-0 queue triage only (row 5). `triageLine` is returned
 * verbatim as the triage dispatch's full response; `"TRIAGE: blocked …"` is the
 * verdict that costs exactly one dispatch and never delegates the full pipeline.
 */
export function makeQueueTriageTransport(triageLine) {
  const calls = [];
  async function dispatch(prompt, opts = {}) {
    const roleMatch = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/.exec(prompt);
    const role = roleMatch ? roleMatch[1] : "unknown";
    const task = taskOf(prompt);
    calls.push({ role, model: opts.model, prompt });
    return { text: triageLine, sessionId: "corpus" };
  }
  return { transport: { dispatch }, calls };
}

/**
 * Runs iii/iv's driver: queue triage returns `needs-human [SEAM:A1]`, then the
 * A1 advisory-seam dispatch (`se-review`, model `fable` first) is answered per
 * `fableOutcome`:
 *   - `"ok"`    (run iii, row 3) — a well-formed advisory verdict at `fable`.
 *   - `"throw"` (run iv, row 4)  — a real `TransportError` whose message matches
 *     the module's `isModelResolutionError` regex, forcing the SAME prompt to
 *     re-dispatch at `opus` (`MODEL_ADVISORY_FALLBACK`), answered there instead.
 */
export function makeAdvisoryTransport({ triageReason = "ambiguous dependency state", fableOutcome }) {
  const calls = [];
  async function dispatch(prompt, opts = {}) {
    const roleMatch = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/.exec(prompt);
    const role = roleMatch ? roleMatch[1] : "unknown";
    const task = taskOf(prompt);
    calls.push({ role, model: opts.model, prompt });

    if (/Phase-0 readiness triage for feature/.test(task)) {
      return { text: `TRIAGE: needs-human [SEAM:A1] ${triageReason}\n`, sessionId: "corpus" };
    }

    if (/A1 triage-abstention adjudication for/.test(task)) {
      if (opts.model === "fable" && fableOutcome === "throw") {
        throw new TransportError('unrecognised model "fable"');
      }
      return {
        text: [
          "SEAM: A1",
          "DIAGNOSIS: Triage abstained; nothing in the evidence blocks the candidate.",
          "PROPOSED-ACTION: hold",
          "CONFIDENCE: high",
          "WITHIN-ENVELOPE: yes",
          "EVIDENCE: precheck clear, no dependency conflicts observed",
        ].join("\n"),
        sessionId: "corpus",
      };
    }

    return { text: "ok", sessionId: "corpus" };
  }
  return { transport: { dispatch }, calls };
}

/**
 * Run v(b)'s driver: every phase up to Phase I is pre-seeded as already
 * approved (`seedApproved`, called by the test before `runDev`), so the ONLY
 * dispatch this transport ever answers is Phase I's Haiku PLAN-DAG-extraction
 * fallback (row 7) — fired because the pre-baked PLAN's task table (the pinned
 * `unparseable-task-table.md` fixture) does not parse in-script. The response is
 * deliberately not JSON, so the module's own `JSON.parse` catch reaches a clean
 * halt right after the witnessing dispatch.
 */
// ─── the settlement-line seam (mirrors adapter-descriptor.test.js's pattern) ──
//
// Not imported from that test file — importing another `*.test.js` module would
// re-register ITS `test()` calls under this file's run, double-executing them.
// Duplicated here (both read-only, both tiny) so each file stays independently
// runnable, exactly as `crossReviewText` is already duplicated rather than
// imported across the two files.

// ─── publishing a corpus run's records into the suite-wide run dir ───────────
//
// The scratch dir below exists so that each corpus run reads back ONLY its own
// settlement lines (run ii and run v(b) assert an exact record COUNT, which a
// shared per-pid file would break). But TSPEC §7.4's model-map row and
// pre-phase row are suite-wide assertions over records carrying
// `corpusRun != null` — `_assert-suite-wide.mjs` (T52) reads the union under
// the runner-minted `PDLC_TEST_RUN_DIR`, and would find no corpus record at
// all if the scratch dir were simply deleted. So every scratch record is
// appended into the real run dir under a distinct `.jsonl` name before the
// scratch dir goes away: isolation for the per-run reads, union for the
// suite-wide step. The name is per-pid and per-call, so no two corpus runs (or
// two test-file processes) ever append to the same published file.
let publishSeq = 0;

function publishRecords(scratchDir, suiteRunDir) {
  if (!suiteRunDir) return;
  let names;
  try {
    names = readdirSync(scratchDir).filter((n) => n.endsWith(".jsonl"));
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  if (names.length === 0) return;
  const body = names.map((n) => readFileSync(path.join(scratchDir, n), "utf8")).join("");
  if (!body.trim()) return;
  mkdirSync(suiteRunDir, { recursive: true });
  const out = path.join(suiteRunDir, `corpus-${process.pid}-${publishSeq++}.jsonl`);
  appendFileSync(out, body.endsWith("\n") ? body : `${body}\n`);
}

/** Run `fn(runDir)` with `PDLC_TEST_RUN_DIR` pointed at a scratch dir, cleaning up either way. */
export function withRunDir(fn) {
  const runDir = mkdtempSync(path.join(os.tmpdir(), "pdlc-corpus-rundir-"));
  const prior = process.env.PDLC_TEST_RUN_DIR;
  process.env.PDLC_TEST_RUN_DIR = runDir;
  return (async () => {
    try {
      return await fn(runDir);
    } finally {
      if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
      else process.env.PDLC_TEST_RUN_DIR = prior;
      publishRecords(runDir, prior);
      rmSync(runDir, { recursive: true, force: true });
    }
  })();
}

// ─── a synthetic population that witnesses all seven M-ENG-07 rows ──────────
//
// The real witnesses are the five corpus runs above, whose records are
// published into the suite-wide run dir. This builder is the same population in
// synthetic form, for the two test files that drive `_assert-suite-wide.mjs`
// over hand-built scratch run dirs (`assert-suite-wide.test.js`, which needs a
// population that passes all five rows before it can isolate one row's failure,
// and `corpus-model-map.test.js`, which mutates it row by row). It lives here
// rather than in either test file because importing one `*.test.js` from
// another would re-register its `test()` calls — the same reason the settlement
// helpers above are duplicated rather than imported.
//
// Field values are transcribed from a real corpus run's records, not invented:
// see `_assert-suite-wide.mjs`'s `M_ENG_07` witness table for what each one
// witnesses.
export function modelMapWitnessRecords() {
  const d = (r) => ({
    kind: "dispatch",
    attempt: 0,
    outcome: "ok",
    errorText: null,
    promptHash: "0000000000000000",
    ...r,
  });
  return [
    // run i — row 1 (opus outside the wave set) and row 2 (sonnet inside it,
    // both members present, so wave mode is asserted rather than assumed).
    d({ corpusRun: "run-i", seq: 0, skill: "se-review", phase: "Phase R", model: "opus" }),
    d({ corpusRun: "run-i", seq: 1, skill: "se-author", phase: "Phase P", model: "opus" }),
    d({ corpusRun: "run-i", seq: 2, skill: "se-implement", phase: "Phase I", model: "sonnet" }),
    d({ corpusRun: "run-i", seq: 3, skill: "se-implement", phase: "Phase PT", model: "sonnet" }),
    // run ii — row 5, queue Phase-0 readiness triage.
    d({ corpusRun: "run-ii", seq: 0, skill: "se-author", phase: "Queue", model: "sonnet" }),
    // run iii — row 3, the advisory rung resolving on fable.
    d({ corpusRun: "run-iii", seq: 0, skill: "se-author", phase: "Queue", model: "sonnet" }),
    d({ corpusRun: "run-iii", seq: 1, skill: "se-review", phase: "Queue", model: "fable" }),
    // run iv — row 4's (F, B) pair: same skill, same composed prompt, B later.
    d({ corpusRun: "run-iv", seq: 0, skill: "se-author", phase: "Queue", model: "sonnet" }),
    d({
      corpusRun: "run-iv",
      seq: 1,
      skill: "se-review",
      phase: "Queue",
      model: "fable",
      outcome: "transport-contract-violation",
      errorText: 'unrecognised model "fable"',
      promptHash: "0ba9f715a260c529",
    }),
    d({
      corpusRun: "run-iv",
      seq: 2,
      skill: "se-review",
      phase: "Queue",
      model: "opus",
      promptHash: "0ba9f715a260c529",
    }),
    // run v(a) — row 6, the haiku verdict-recovery re-emit.
    d({ corpusRun: "run-va", seq: 0, skill: "se-review", phase: "Phase R", model: "haiku" }),
    // run v(b) — row 7, the haiku PLAN-DAG extraction fallback.
    d({ corpusRun: "run-vb", seq: 0, skill: "se-author", phase: "Phase I", model: "haiku" }),
  ];
}

/** Every `kind: "dispatch"` settlement line the current process has appended to `runDir`. */
export function readSettlementLines(runDir) {
  const file = path.join(runDir, `${process.pid}.jsonl`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line)).filter((r) => r.kind === "dispatch");
}

export function makeDagFallbackTransport() {
  const calls = [];
  async function dispatch(prompt, opts = {}) {
    const roleMatch = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/.exec(prompt);
    const role = roleMatch ? roleMatch[1] : "unknown";
    const task = taskOf(prompt);
    calls.push({ role, model: opts.model, prompt });

    if (DAG_EXTRACTION_RE.test(task)) {
      return { text: "I could not extract a task list from that table.\n", sessionId: "corpus" };
    }
    return { text: "ok", sessionId: "corpus" };
  }
  return { transport: { dispatch }, calls };
}
