/**
 * pacingWrapper.test.js — the H-3 fix: `dispatchAndVerify`, episode keys, mode
 * selection, the two prompt kinds, the two authoring budgets, and the trailer
 * reason that carries `REVISION-COMPLETE:` failures into the operator report.
 *
 * Ownership (PLAN §5.2, single-writer-per-file): RLH-21 (batch 3). RED on arrival.
 *
 * Behaviour owner: **TSPEC §5.6** (`selectMode` / S-INV / the loop / the two prompt
 * kinds), §4.3 (`TrailerFailure`), §4.5 (`EpisodeKey`), §4.7 (report fields and
 * lines), §4.8 (the constants), §5.9 (`isComplete`), §6.2 rows 9–11 and 17, §6.4,
 * §6.5. Wording owner: **FSPEC §19** (`AT-35`…`AT-54`, `AT-58`, `AT-61`).
 *
 * | Assertion | Green from (PLAN §7.3) |
 * |---|---|
 * | `RLH-AT-35`…`RLH-AT-54`, `RLH-AT-58`, `RLH-AT-43a`, `RLH-AT-61-loop` | batch 7 (RLH-23) |
 * | `RLH-AT-61-report` | batch 10 (RLH-30) |
 *
 * `RLH-AT-61` is split into two separately named tests because its two conjuncts
 * green in different batches (PLAN §7.3). `RLH-30` writes no test of its own — the
 * report half lives here.
 *
 * ## Stratum
 *
 * **L2.** Behaviour is driven through `main()` with injected seams; the wrapper
 * itself (`dispatchAndVerify`, `selectMode`, `isComplete`) is deliberately *not*
 * imported, because §3.8 makes it non-exported and an L2 suite must not depend on
 * a symbol the TSPEC forbids exporting. The single exception is
 * `RLH-AT-61-loop`, whose subject is literally "`reviewLoop`'s return" (PLAN
 * §5.4 row RLH-21, TSPEC §3.9) — `reviewLoop` is already an exported symbol whose
 * signature §3.9 changes, so that one assertion drives it directly.
 *
 * The module is imported as a **namespace** so the suite *runs* before any new
 * symbol exists: a named import of a missing export is a link-time `SyntaxError`
 * that takes the whole file down, which is not a valid red (PLAN §12.1).
 *
 * ## The two things that make these fixtures mean anything
 *
 * 1. **The listing seam is a live view of the fake tree.** `_listFiles` is
 *    `fakeListFiles(dir => basenames of dir in the fake fs)`, so a cross-review a
 *    reviewer episode writes *during* the run is visible to the next episode's
 *    `refreshReviewState`. That is the whole of S-INV (§5.6.1): round 2's
 *    optimizer must see the reviews round 1 wrote, and this run is what wrote them.
 *    An entry-time snapshot would make every optimizer episode greenfield.
 * 2. **`docs/{feature}/` exists and is empty.** A live view of a directory with no
 *    entries returns `{ ok: true, files: [] }` — TSPEC §6.2 **row 1's successful
 *    empty listing**, not `dir_missing`. The distinction is load-bearing for
 *    `RLH-AT-43a`: both dispositions produce an empty `present`, so a fixture that
 *    accidentally used `dir_missing` would test nothing about freshness.
 *
 * ## File-local generators (PLAN §7.2)
 *
 * `__tests__/helpers/driftGenerators.js` is reused **unmodified**; the domain
 * generators below (document builders, heading-set builders) are file-local and
 * unexported, built over its primitives. The literal seed goes through
 * `resolveSeed`, and `shrink` is used on the failure path only.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordHalt } from "./helpers/seams.js";
import { resolveSeed, seeded, shrink } from "./helpers/driftGenerators.js";

const main = devModule.default;

// ─── 1. Fixture vocabulary ────────────────────────────────────────────────────

const FEATURE = "pace-feat";
const DOCS_DIR = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS_DIR}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS_DIR}/TSPEC-${FEATURE}.md`;
const LEARNINGS_PATH = `${DOCS_DIR}/LEARNINGS-${FEATURE}.md`;

/** TSPEC §4.8, restated rather than read off the subject. */
const MAX_AUTHORING_ATTEMPTS = 3;
const MAX_AUTHORING_DISPATCHES = 6;
const MAX_AUTHORING_WRITE_BYTES = 12000;
const MAX_REVIEW_ROUNDS = 5;

/** The three amended author SKILLs — the only ones §7.4 teaches to emit the trailer. */
const AUTHOR_SKILLS = Object.freeze(["pm-author", "se-author", "te-author"]);
/** The three reviewer SKILLs (`PHASE_DISPATCH`). */
const REVIEW_SKILLS = Object.freeze(["pm-review", "se-review", "te-review"]);

/** TSPEC §4.3's closed `TrailerFailure` catalogue, in declaration order. */
const TRAILER_FAILURES = Object.freeze([
  "declared_incomplete",
  "absent",
  "duplicated",
  "unparseable",
]);

/**
 * Required top-level headings per spec class — TSPEC §5.9's table, verbatim and in
 * its declared order. Parenthesised alternatives are dropped: a fixture only needs
 * *one* accepted spelling, and picking the first keeps the builder total.
 *
 * @type {Readonly<Record<string, readonly string[]>>}
 */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
  FSPEC: ["Overview", "Linked Requirements", "Behavioral Flow", "Business Rules", "Edge Cases and Error Scenarios", "Acceptance Tests", "Open Questions"],
  TSPEC: ["Overview", "Architecture", "Interfaces", "Data Model", "Test Strategy", "Open Questions"],
  PLAN: ["Overview", "Batches", "Dependencies", "Verification"],
  PROPERTIES: ["Overview", "Properties", "Oracles", "Fixtures"],
  DECISIONS: ["Context", "Options Considered", "Decision", "Consequences"],
});

/** Doc type of an artifact path, e.g. `docs/f/FSPEC-f.md` → `"FSPEC"`. */
function docTypeOf(path) {
  const m = /\/([A-Z]+)-[^/]+\.md$/.exec(String(path ?? ""));
  return m ? m[1] : null;
}

/**
 * Build a spec-class document from an explicit heading→body map, in order.
 * A `null` body renders the heading with an **empty** body, which §5.9 scores as
 * an unwritten section.
 *
 * @param {Array<[string, string|null]>} sections
 * @returns {string}
 */
function specDoc(sections) {
  const parts = [`# ${FEATURE}`, ""];
  for (const [heading, body] of sections) {
    parts.push(`## ${heading}`, "");
    if (body !== null && body !== undefined) parts.push(body, "");
  }
  return parts.join("\n");
}

/**
 * A structurally **complete** document of `docType` (§5.9): every required heading
 * present, every top-level heading carrying a non-placeholder body.
 *
 * @param {string} docType
 * @param {string} [body]
 * @returns {string}
 */
function completeDoc(docType, body = "Substantive prose that is not a placeholder.") {
  const headings = REQUIRED_HEADINGS[docType] ?? REQUIRED_HEADINGS.FSPEC;
  return specDoc(headings.map((h) => [h, `${body} (${h})`]));
}

/**
 * A **partial** document: the first `filled` required headings carry bodies, and
 * `extra` further headings — named `Section {n}` — are present but empty. The extra
 * headings make "the first unwritten section" a heading of the fixture's own
 * choosing rather than one of the required six or seven, which is what
 * `RLH-AT-49`'s FSPEC leg needs (sections 1–7 written, 8–21 empty).
 *
 * @param {string} docType
 * @param {number} filled
 * @param {number} [extra=0]
 * @returns {string}
 */
function partialDoc(docType, filled, extra = 0) {
  const headings = REQUIRED_HEADINGS[docType] ?? REQUIRED_HEADINGS.FSPEC;
  const sections = headings.map((h, i) => [h, i < filled ? `Written body for ${h}.` : null]);
  for (let n = 0; n < extra; n += 1) {
    sections.push([extraHeading(headings.length + n + 1), null]);
  }
  return specDoc(sections);
}

/** The name of the `n`th extra (deliberately unwritten) top-level heading. */
function extraHeading(n) {
  return `Section ${n}`;
}

/**
 * A cross-review file. `withVerdict: false` yields the **partial** shape §5.9
 * scores incomplete — prose under every heading but no trailing `## Verdict`
 * section — which is the fixture `RLH-AT-49` and `RLH-AT-58` both need.
 *
 * @param {{ verdict?: string, withVerdict?: boolean, high?: number, extra?: string }} [opts]
 * @returns {string}
 */
function crossReviewDoc({ verdict = "Approved", withVerdict = true, high = 0, extra = "" } = {}) {
  const parts = ["# Cross-review", "", "## Findings", "", `Some findings.${extra}`, ""];
  if (withVerdict) {
    parts.push("## Verdict", "", `VERDICT: ${verdict}`, `{"high": ${high}, "medium": 0, "low": 0}`, "");
  }
  return parts.join("\n");
}

/** The five numbered LEARNINGS sections this suite's fixtures use (§5.9's LEARNINGS row). */
const LEARNINGS_HEADINGS = Object.freeze([
  "1. What Happened",
  "2. What Went Well",
  "3. What Went Badly",
  "4. Root Causes",
  "5. Actions",
]);

/**
 * A LEARNINGS document. `filled` counts how many of the five numbered sections
 * carry a body; the rest are present but empty. `approvalRecord` adds §4.4's
 * record, whose **absence** is what `RLH-AT-51` observes.
 *
 * @param {{ filled?: number, approvalRecord?: boolean }} [opts]
 * @returns {string}
 */
function learningsDoc({ filled = LEARNINGS_HEADINGS.length, approvalRecord = true } = {}) {
  const sections = LEARNINGS_HEADINGS.map((h, i) => [h, i < filled ? `Learned: ${h}.` : null]);
  if (approvalRecord) sections.push(["6. Approval Record", "| Doc | Round | Verdict |\n|---|---|---|\n| FSPEC | 1 | Approved |"]);
  return specDoc(sections);
}

/** A reviewer's response body. The file is the artifact; the response carries the trailer. */
function reviewResponse(verdict = "Approved", high = 0) {
  return `Review complete.\nVERDICT: ${verdict}\n{"high": ${high}, "medium": 0, "low": 0}\n`;
}

/** `REVISION-COMPLETE:` trailer lines, one per §4.3 outcome. */
const TRAILER = Object.freeze({
  yes: "REVISION-COMPLETE: yes",
  declared_incomplete: "REVISION-COMPLETE: no",
  absent: "",
  duplicated: "REVISION-COMPLETE: yes\nREVISION-COMPLETE: no",
  unparseable: "REVISION-COMPLETE: maybe",
});

/** An author response carrying (or omitting) the trailer as its last line. */
function authorResponse(trailerKey, prose = "Edits applied.") {
  const trailer = TRAILER[trailerKey] ?? "";
  return trailer ? `${prose}\n${trailer}` : prose;
}

// ─── 2. The harness ───────────────────────────────────────────────────────────

/** Reviewer skill → the role slug its cross-review filename carries (§5.2). */
const ROLE_SLUG = Object.freeze({
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
});

/** Doc type → the phase that produces it, for prompts that name only the path. */
const PHASE_OF_DOC = Object.freeze({
  REQ: "R", FSPEC: "F", TSPEC: "T", DECISIONS: "D", PLAN: "P", PROPERTIES: "PR",
});

/** The artifact path a prompt names, or `null`. */
function docPathIn(prompt) {
  const m = /docs\/[A-Za-z0-9._-]+\/(?:REQ|FSPEC|TSPEC|DECISIONS|PLAN|PROPERTIES)-[A-Za-z0-9._-]+\.md/.exec(
    String(prompt ?? "")
  );
  return m ? m[0] : null;
}

/** The phase id a prompt names, derived from the phase clause or the doc type. */
function phaseIn(prompt, docType) {
  const m = /for phase ([A-Z]+) of feature/.exec(String(prompt ?? ""));
  if (m) return m[1];
  if (/docs\/[A-Za-z0-9._-]+\/\s*$/.test(String(prompt ?? ""))) return "CR";
  return PHASE_OF_DOC[docType] ?? null;
}

/** The round index a prompt names (`This is iteration N.` / `Iteration N reviewers`). */
function iterationIn(prompt) {
  const m = /(?:This is iteration|Iteration) (\d+)/.exec(String(prompt ?? ""));
  return m ? Number(m[1]) : null;
}

/** What kind of dispatch a prompt represents. Mirrors the call sites in `main()`. */
function kindIn(skill, prompt) {
  const text = String(prompt ?? "");
  if (REVIEW_SKILLS.includes(skill)) {
    return /did not end with a machine-readable VERDICT trailer/.test(text) ? "recover" : "review";
  }
  if (AUTHOR_SKILLS.includes(skill)) {
    if (/POSTMORTEM-/.test(text)) return "postmortem";
    if (/Return a JSON object/.test(text)) return "plan-dag";
    if (/^Address reviewer feedback/.test(text)) return "optimizer";
    if (/^Create /.test(text)) return "creator";
    return "author-other";
  }
  return skill;
}

/** Basenames of the fake tree that live directly under `dirPath` (the live listing). */
function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length))
    .sort();
}

/**
 * Drive `main()` once over an in-memory tree.
 *
 * Every plan hook receives a `ctx` and returns `{ write, response }`:
 * - `write` — the bytes to place at `ctx.path` (omit or `null` to write nothing,
 *   which is what makes a dispatch score *no progress* under §5.6.2's
 *   `before !== after` predicate);
 * - `response` — the agent's reply, i.e. where a `REVISION-COMPLETE:` trailer
 *   lives. Returning a `throw` from the hook models §4a A-8's third fault
 *   surfacing, and returning `null` models the second.
 *
 * `ctx.n` is the **1-based index of this dispatch within its episode**, an episode
 * being keyed here by `(skill, kind, phase, round)` — the observable stand-in for
 * §4.5's `EpisodeKey`, which the suite cannot read directly.
 *
 * @param {{
 *   files?: Record<string, string>,
 *   author?: (ctx: object) => any,
 *   review?: (ctx: object) => any,
 *   harvest?: (ctx: object) => any,
 *   listFiles?: Function,
 *   dod?: boolean,
 *   pub?: boolean,
 *   dodStatuses?: string[],
 *   forcePhases?: string,
 * }} [opts]
 */
async function runPipeline(opts = {}) {
  const {
    files = {}, author, review, harvest, listFiles: listFilesOverride,
    dod = false, pub = false, dodStatuses = ["passed"], forcePhases,
  } = opts;

  const fs = fakeFs({ [REQ_PATH]: completeDoc("REQ"), ...files });
  const listFiles = listFilesOverride ?? fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
  const git = fakeGit((argv) =>
    argv.some((a) => /numstat|--stat/.test(String(a)))
      ? { ok: true, stdout: `20000\t0\t${FSPEC_PATH}\n` }
      : { ok: true }
  );
  const recordHalt = recordingRecordHalt({ queueRow: "halted" });
  const dispatches = [];
  const logs = [];
  const episodes = new Map();
  let dodIndex = 0;

  const agent = async (skill, prompt, options) => {
    const text = String(prompt ?? "");
    const kind = kindIn(skill, prompt);
    const path = docPathIn(text);
    const docType = docTypeOf(path);
    const phase = phaseIn(text, docType);
    const round = iterationIn(text);
    const key = `${skill}|${kind}|${phase}|${round}`;
    const n = (episodes.get(key) ?? 0) + 1;
    episodes.set(key, n);

    const entry = {
      skill, prompt: text, model: options && options.model, kind, phase, docType,
      path, round, n, listCallCount: listFiles.callCount,
    };
    dispatches.push(entry);
    if (dispatches.length > 400) throw new Error("pacingWrapper harness: runaway dispatch count");

    const write = (contents, at = path) => {
      if (contents !== null && contents !== undefined && at) fs.writeFile(at, contents);
    };

    if (kind === "review" || kind === "recover") {
      const role = ROLE_SLUG[skill];
      const reviewPath = `${DOCS_DIR}/CROSS-REVIEW-${role}-${docType ?? "REQ"}-v${round ?? 1}.md`;
      const ctx = { ...entry, role, path: reviewPath, write: (c) => write(c, reviewPath) };
      const out = review ? review(ctx) : null;
      if (out && Object.prototype.hasOwnProperty.call(out, "write")) write(out.write, reviewPath);
      else write(crossReviewDoc({ verdict: "Approved" }), reviewPath);
      return out && out.response !== undefined ? out.response : reviewResponse("Approved");
    }

    if (kind === "postmortem") {
      const pmPath = /docs\/[^\s.]+\/POSTMORTEM-[^\s.]+\.md/.exec(text);
      if (pmPath) fs.writeFile(pmPath[0], "# Postmortem\n\nRESOLVED: no\n");
      return "Postmortem written.";
    }
    if (kind === "plan-dag") {
      return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
    }
    if (kind === "creator" || kind === "optimizer" || kind === "author-other") {
      const ctx = { ...entry, write };
      const out = author ? author(ctx) : null;
      if (out && Object.prototype.hasOwnProperty.call(out, "write")) write(out.write);
      else if (docType) write(completeDoc(docType));
      let response = out && out.response !== undefined ? out.response : authorResponse("yes", "Document written.");
      if (phase === "T" && /DECISIONS_WARRANTED/.test(text)) response = `${response}\nDECISIONS_WARRANTED: false`;
      return response;
    }
    if (skill === "harvest-learnings") {
      const ctx = { ...entry, path: LEARNINGS_PATH, write: (c) => write(c, LEARNINGS_PATH) };
      const out = harvest ? harvest(ctx) : null;
      if (out && Object.prototype.hasOwnProperty.call(out, "write")) write(out.write, LEARNINGS_PATH);
      else write(learningsDoc(), LEARNINGS_PATH);
      return out && out.response !== undefined ? out.response : "Harvest complete.";
    }
    if (skill === "dod-verify") {
      const status = dodStatuses[Math.min(dodIndex++, dodStatuses.length - 1)];
      return `Reviewed.\nDOD_STATUS: ${status}`;
    }
    if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
    return "Success.";
  };

  const result = await main({
    reqPath: REQ_PATH,
    ...(forcePhases ? { forcePhases } : {}),
    _agent: agent,
    _parallel: (promises) => Promise.all(promises),
    _pipeline: async (label, fn) => fn(),
    _phase: (label) => logs.push(String(label)),
    _log: (message) => logs.push(String(message)),
    _listFiles: listFiles,
    _git: git,
    _recordHalt: recordHalt,
    ...fs.injections(),
    _mergeWorktree: async () => ({ ok: true }),
    _rebaseOntoDefault: async () => "clean",
    _raisePrAndVerifyCi: async () => ({ prUrl: "https://example/pull/1", ciStatus: "passed" }),
    _phaseDodEnabled: dod,
    _phasePubEnabled: pub,
    _now: () => 0,
    _sleep: async () => {},
  });

  return {
    result, dispatches, fs, listFiles, git, recordHalt, logs,
    /**
     * Everything an operator can read back from one run: the structured report
     * plus the emitted report lines. §4.7 makes some of this feature's carriers
     * report **lines** rather than fields, so an assertion that pinned only
     * `result` would be unwritable for them.
     */
    reportText: `${JSON.stringify(result, null, 1)}\n${logs.join("\n")}`,
  };
}

/**
 * Dispatches matching every supplied coordinate.
 *
 * @param {{dispatches: object[]}} run
 * @param {{skill?: string, kind?: string, phase?: string, round?: number, docType?: string}} q
 * @returns {object[]}
 */
function select(run, q = {}) {
  return run.dispatches.filter((d) =>
    Object.entries(q).every(([k, v]) => (v === undefined ? true : d[k] === v))
  );
}

/** The prompts of the selected dispatches, in order. */
function promptsOf(run, q) {
  return select(run, q).map((d) => d.prompt);
}

// ─── 3. RLH-AT-35 … RLH-AT-38 — terminality and the trailer ───────────────────

// ─── 4. RLH-AT-39 … RLH-AT-42 — progress, counters, episode scope ─────────────

// ─── 5. RLH-AT-43, RLH-AT-43a — mode across the seam, and S-INV freshness ─────

// ─── 6. RLH-AT-44, RLH-AT-45 — artifact sets and working-tree measurement ─────

// ─── 7. RLH-AT-46, RLH-AT-47 — budget exhaustion and its two reports ──────────

// ─── 8. RLH-AT-48, RLH-AT-49 — the two prompt kinds ───────────────────────────

// ─── 9. RLH-AT-50, RLH-AT-51, RLH-AT-58 — the non-authoring wrapped classes ───

// ─── 10. RLH-AT-52, RLH-AT-53 — advisory proxy, and no destructive git ────────

// ─── 11. RLH-AT-54 — constant substitution and the round window ───────────────

// ─── 12. RLH-AT-61-loop, RLH-AT-61-report — the four trailer reasons ──────────
