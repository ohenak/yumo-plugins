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
import { fakeFs, fakeGit, fakeListFiles, recordingRecordQueueRow } from "./helpers/seams.js";
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
  return specDoc(
    headings.map((h) => [
      h,
      // Phase P's self-parse gate (PROPOSAL §3.3) refuses a PLAN whose task
      // table the mechanical parser cannot read, so a complete PLAN carries a
      // parseable one under its `Batches` heading.
      docType === "PLAN" && h === "Batches"
        ? `${body} (${h})\n\n${PARSEABLE_TASK_TABLE}`
        : `${body} (${h})`,
    ])
  );
}

/**
 * The smallest task table `parsePlanTasks` accepts, plus the smallest
 * file-ownership manifest `parsePlanOwnership` accepts (PROPOSAL §3.3). Phase P
 * gates on BOTH, so a "complete PLAN" fixture must carry both.
 */
const PARSEABLE_TASK_TABLE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | first | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
].join("\n");

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
 * `harvest-learnings/SKILL.md`'s metadata table. Its `Harvested from` row is the
 * **second conjunct** of §16.5's completeness criterion (CR F-2), so every
 * fixture that means to score complete must carry it.
 */
const LEARNINGS_METADATA = [
  "| Field | Detail |",
  "|---|---|",
  `| Feature | ${FEATURE} |`,
  "| Harvested from | CROSS-REVIEW-se-review-FSPEC-v1.md, now deleted |",
].join("\n");

/**
 * A LEARNINGS document. `filled` counts how many of the five numbered sections
 * carry a body; the rest are present but empty. `approvalRecord` adds §4.4's
 * record, whose **absence** is what `RLH-AT-51` observes. `harvestedFrom` drops
 * §16.5's metadata row, which is what makes the document incomplete on its own.
 *
 * @param {{ filled?: number, approvalRecord?: boolean, harvestedFrom?: boolean }} [opts]
 * @returns {string}
 */
function learningsDoc({
  filled = LEARNINGS_HEADINGS.length,
  approvalRecord = true,
  harvestedFrom = true,
} = {}) {
  const sections = LEARNINGS_HEADINGS.map((h, i) => [h, i < filled ? `Learned: ${h}.` : null]);
  if (approvalRecord) sections.push(["6. Approval Record", "| Doc | Round | Verdict |\n|---|---|---|\n| FSPEC | 1 | Approved |"]);
  const doc = specDoc(sections);
  if (!harvestedFrom) return doc;
  // The metadata table sits between the `# ` title and the first `## ` section,
  // exactly as the SKILL's output format places it.
  return doc.replace(`# ${FEATURE}\n`, `# ${FEATURE}\n\n${LEARNINGS_METADATA}\n`);
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
    files = {}, author, review, harvest, makeListFiles,
    dod = false, pub = false, dodStatuses = ["passed"], forcePhases,
  } = opts;

  const fs = fakeFs({ [REQ_PATH]: completeDoc("REQ"), ...files });
  // The live view. `makeListFiles(fs)` lets a fixture interpose a per-call
  // ListFailure (RLH-AT-43a(b)) while keeping the rest of the view live.
  const listFiles = makeListFiles
    ? makeListFiles(fs)
    : fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
  const git = fakeGit((argv) => {
    // The branch guard's probe: this harness's tree is, by construction, already
    // on the feature branch, so the guard is a no-op and every assertion below
    // is about the pacing wrapper rather than about branch placement.
    if (argv.join(" ") === "rev-parse --abbrev-ref HEAD") {
      return { ok: true, stdout: `feat-${FEATURE}\n` };
    }
    return argv.some((a) => /numstat|--stat/.test(String(a)))
      ? { ok: true, stdout: `20000\t0\t${FSPEC_PATH}\n` }
      : { ok: true };
  });
  const recordQueueRow = recordingRecordQueueRow({ queueRow: "recorded" });
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
      // The cross-review record on disk *at the instant this episode dispatched* —
      // the state S-INV says `selectMode` must have been given.
      crossReviews: basenamesIn(fs.files, DOCS_DIR).filter((b) => b.startsWith("CROSS-REVIEW-")),
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
      if (out && Object.prototype.hasOwnProperty.call(out, "write")) {
        write(out.write);
      } else if (docType) {
        // Fix B (`orchestrate-dev.js` §5.6's optimizer no-op halt): the default
        // fallback must not write byte-IDENTICAL content across dispatches, or an
        // optimizer episode this fixture does not care about (any phase whose
        // round a shared `reviewersFailing` plan fails, not just the phase under
        // test) reads as a no-op revision and halts. Both `ctx.round` and `ctx.n`
        // are folded in: a fresh episode on a later round starts a new dispatch
        // count (`n` resets to 1 per round), so `n` alone can collide with a
        // prior round's final on-disk bytes. `creator` / `author-other`
        // dispatches are greenfield and need no such distinction, so only
        // `optimizer` gets it.
        write(completeDoc(docType, kind === "optimizer" ? `revision pass round ${ctx.round} #${ctx.n}` : undefined));
      }
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
    _recordQueueRow: recordQueueRow,
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
    result, dispatches, fs, listFiles, git, recordQueueRow, logs,
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

/**
 * A reviewer plan that fails the named rounds and approves every later one, so a
 * revision (optimizer) episode exists for each failed round. Reviewers always
 * write a well-formed cross-review, so §5.9 scores their own episodes terminal and
 * the round record `refreshReviewState` reads is real (S-INV).
 *
 * @param {number[]} failingRounds
 */
function reviewersFailing(failingRounds) {
  return (ctx) => {
    const fails = failingRounds.includes(ctx.round);
    return {
      write: crossReviewDoc({ verdict: fails ? "Needs revision" : "Approved", high: fails ? 1 : 0 }),
      response: reviewResponse(fails ? "Needs revision" : "Approved", fails ? 1 : 0),
    };
  };
}

describe("RLH-AT-35 — no-op-with-trailer is terminal (FSPEC §19 AT-35, AC-3.5b, E-44)", () => {
  test("RLH-AT-35: a revision dispatch that writes nothing and emits REVISION-COMPLETE: yes is terminal in one dispatch, and the phase neither halts nor re-dispatches", async () => {
    // The round is fully applied already, so the author writes NOTHING and simply
    // declares itself done. Under a progress-first ordering this would be scored a
    // no-progress dispatch and re-dispatched; §5.6.2 evaluates terminal FIRST.
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) =>
        ctx.kind === "optimizer" && ctx.phase === "R"
          ? { write: null, response: authorResponse("yes", "Nothing left to change.") }
          : {},
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });

    // (i) The prompt required the trailer at all — §5.6.3 clause 4. Without this
    // the fixture asserts nothing: an episode that never asked for a trailer
    // cannot be "terminal on the trailer".
    expect(optimizer.length).toBeGreaterThan(0);
    expect(optimizer[0].prompt).toMatch(/REVISION-COMPLETE:/);

    // (ii) Terminal in ONE dispatch, despite zero bytes changing.
    expect(optimizer).toHaveLength(1);
    expect(run.fs.writes.filter((w) => w.path === REQ_PATH)).toEqual([]);

    // (iii) The EPISODE itself does not halt — dispatchAndVerify's terminal test
    // fires on the trailer alone, in one dispatch, independent of `wroteBytes`.
    // But the PHASE now halts one level up: `reviewLoop`'s no-op-optimizer guard
    // (production incident SE F-08 / TE F-07) refuses to dispatch the reviewers
    // again over a document this optimizer episode left byte-identical, since
    // that re-review cannot converge. The zero-byte trailer-terminal episode
    // fixture this test builds is exactly that scenario, so the phase-level
    // outcome is "halted", not "success".
    expect(run.result.outcome).toBe("halted");
    expect(run.reportText).toMatch(/re-reviewing an unchanged document cannot converge/);
  });
});

describe("RLH-AT-36 — no trailer is not terminal even when complete (FSPEC §19 AT-36, E-45)", () => {
  test("RLH-AT-36: a revision dispatch that applies part of the round and emits no trailer leaves the artifact structurally complete yet the episode continues", async () => {
    // The artifact is structurally complete throughout — that is the point. A
    // mode-blind terminal test keyed on completeness alone would stop here and
    // report success on a round whose findings were only partly addressed.
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        return ctx.n === 1
          ? { write: completeDoc("REQ", `3 of 5 findings applied (${ctx.n})`), response: "Applied 3 of 5 findings." }
          : { write: completeDoc("REQ", `all findings applied (${ctx.n})`), response: authorResponse("yes") };
      },
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });
    // The oracle: a second dispatch happened, because dispatch 1 carried no trailer.
    expect(optimizer.length).toBeGreaterThanOrEqual(2);
    expect(run.result.outcome).toBe("success");
  });
});

describe("RLH-AT-37 — all three fault surfacings behave identically (FSPEC §19 AT-37, AC-3.5e, E-46)", () => {
  /**
   * The three §4a A-8 surfacings, as a value-returning dispatch, a nothing-returning
   * dispatch, and a throwing one. `faultObserved` is **true only for the throw**
   * (FSPEC §15.4) — an implementation that sets it whenever the trailer reason is
   * `absent` cannot tell a kill from an omission and fails here.
   */
  const SURFACINGS = [
    { name: "returns a value with no trailer", fault: false, first: () => ({ response: "Partial edits made." }) },
    { name: "returns nothing", fault: false, first: () => ({ response: null }) },
    { name: "throws", fault: true, first: () => { throw new Error("dispatch stall-killed"); } },
  ];

  test("RLH-AT-37: all three dispatch-fault surfacings reach the same non-terminal conclusion, and faultObserved is true only for the throw", async () => {
    const conclusions = [];
    for (const surfacing of SURFACINGS) {
      const run = await runPipeline({
        review: reviewersFailing([1]),
        author: (ctx) => {
          if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
          if (ctx.n === 1) return surfacing.first();
          return { write: completeDoc("REQ", `recovered (${ctx.n})`), response: authorResponse("yes") };
        },
      });
      const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });
      conclusions.push({
        surfacing: surfacing.name,
        outcome: run.result.outcome,
        continued: optimizer.length >= 2,
      });

      // The fault boolean is read off the run's whole operator surface, because
      // §4.7 leaves the carrier (report field vs. report line) to the implementer.
      const sawFaultTrue = /faultObserved["']?\s*[:=]\s*true/.test(run.reportText);
      expect({ surfacing: surfacing.name, faultObserved: sawFaultTrue })
        .toEqual({ surfacing: surfacing.name, faultObserved: surfacing.fault });
    }

    // Asserted WITHOUT distinguishing the three: same outcome, same continuation.
    expect(conclusions).toEqual(
      SURFACINGS.map((s) => ({ surfacing: s.name, outcome: "success", continued: true }))
    );
  });
});

describe("RLH-AT-38 — a premature trailer is visible, not silent (FSPEC §19 AT-38, R-12)", () => {
  test("RLH-AT-38: an agent that emits REVISION-COMPLETE: yes while a finding is demonstrably unreflected ends the episode, and the round's report records that the decision was made on the trailer", async () => {
    const UNREFLECTED = "FINDING-H1 is not addressed anywhere in this document";
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) =>
        ctx.kind === "optimizer" && ctx.phase === "R"
          ? { write: completeDoc("REQ", UNREFLECTED), response: authorResponse("yes", "Done (prematurely).") }
          : {},
    });

    // Terminal on the trailer, exactly as claimed — the loss is real.
    expect(select(run, { kind: "optimizer", phase: "R", round: 1 })).toHaveLength(1);
    expect(run.fs.files[REQ_PATH]).toContain(UNREFLECTED);

    // …and therefore attributable: the report says the episode ended because the
    // author declared completion, not merely that the phase passed.
    expect(run.reportText).toMatch(/REVISION-COMPLETE|revision-complete|trailer/);
  });
});

// ─── 4. RLH-AT-39 … RLH-AT-42 — progress, counters, episode scope ─────────────

describe("RLH-AT-39 — a partial over-budget section counts as progress (FSPEC §19 AT-39, E-48)", () => {
  test("RLH-AT-39: three greenfield dispatches killed mid-way through an over-budget section each write bytes, complete no section, score progress, and do not halt the phase", async () => {
    // Each kill leaves MORE bytes on disk than the last but finishes no section:
    // the section is larger than MAX_AUTHORING_WRITE_BYTES, so a whole one never
    // lands. §5.6.2's predicate is `before !== after` over the working tree — NOT
    // "a section was completed" — so every one of these scores progress and the
    // consecutive counter resets each time.
    const oversized = (n) => "x".repeat(MAX_AUTHORING_WRITE_BYTES + 1).slice(0, 4000 * n);
    const run = await runPipeline({
      author: (ctx) => {
        if (ctx.kind !== "creator" || ctx.phase !== "F") return {};
        if (ctx.n <= MAX_AUTHORING_ATTEMPTS) {
          return {
            write: specDoc([["Overview", oversized(ctx.n)], ...REQUIRED_HEADINGS.FSPEC.slice(1).map((h) => [h, null])]),
            response: "Killed mid-section.",
          };
        }
        return { write: completeDoc("FSPEC"), response: authorResponse("yes") };
      },
    });

    const creator = select(run, { kind: "creator", phase: "F" });
    // Three progress-scoring kills must not exhaust MAX_AUTHORING_ATTEMPTS, so a
    // fourth dispatch is reached and the phase survives.
    expect(creator.length).toBeGreaterThanOrEqual(MAX_AUTHORING_ATTEMPTS + 1);
    expect(run.result.outcome).toBe("success");
    expect(run.reportText).not.toMatch(/no progress across/);
  });
});

describe("RLH-AT-40 — a revision dispatch on a complete artifact is not no-progress (FSPEC §19 AT-40, O-19(b))", () => {
  test("RLH-AT-40: three consecutive feedback-addressing dispatches that each edit an already-complete document score progress and do not halt the phase", async () => {
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        // Every dispatch edits a document that is already structurally complete —
        // completeness is not the progress predicate, byte change is.
        const write = completeDoc("REQ", `edit pass ${ctx.n}`);
        return ctx.n <= MAX_AUTHORING_ATTEMPTS
          ? { write, response: authorResponse("declared_incomplete") }
          : { write, response: authorResponse("yes") };
      },
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });
    expect(optimizer.length).toBeGreaterThanOrEqual(MAX_AUTHORING_ATTEMPTS + 1);
    expect(run.result.outcome).toBe("success");
    expect(run.reportText).not.toMatch(/no progress across/);
  });
});

describe("Fix A — a single `_readFile` per authoring dispatch, not two (orchestrate-dev.js dispatchAndVerify)", () => {
  test("Fix A: a 3-dispatch episode reads its target N+1 times, never 2N", async () => {
    const N = 3; // == MAX_AUTHORING_ATTEMPTS, so the episode terminates on progress alone
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        const write = completeDoc("REQ", `edit pass ${ctx.n}`);
        return ctx.n < N
          ? { write, response: authorResponse("declared_incomplete") }
          : { write, response: authorResponse("yes") };
      },
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });
    expect(optimizer).toHaveLength(N);
    expect(run.result.outcome).toBe("success");

    // Every REQ_PATH read, across the whole run: `dispatchAndVerify`'s ONE `before`
    // read at episode entry, plus one `after` read per dispatch (N). Under the OLD
    // per-iteration `before` re-read this would have been `2N` (an extra `before`
    // read on every dispatch); Fix A drops that to `N + 1`.
    //
    // `reviewLoop`'s own `t0` anchor of `doc` USED to add one whole-file read per
    // round Phase R visits (round 1 fails, round 2 passes — the former `+ 2`). It
    // is now a `_hashFile` call: the anchor only ever wanted the digest, and in
    // the workflow runtime `_readFile` is a per-chunk agent fan-out. Those two
    // calls are asserted below off the digest log, so the saving is pinned and not
    // merely absent.
    const reqReads = run.fs.reads.filter((r) => r.path === REQ_PATH);
    expect(reqReads).toHaveLength(N + 1);

    const reqHashes = run.fs.hashes.filter((h) => h.path === REQ_PATH);
    // T5 (PLAN §3.1) adds a second class of REQ digest that this count now
    // includes: every capture of an approval anchor also digests the UPSTREAM
    // CHAIN of the document being approved, and REQ heads every chain. Two of
    // the ten below are Phase R's own per-iteration captures; the other eight
    // are chain digests taken once per later per-iteration capture. What Fix A
    // pins is unchanged and is the reason the number is asserted at all:
    // NEITHER class scales with the N authoring dispatches inside an episode.
    expect(reqHashes).toHaveLength(10);

    // Behaviour is unchanged: progress is still detected every dispatch (each
    // carries distinct content), so the episode never trips the no-progress halt,
    // and the resume clause still sees the PRIOR dispatch's own bytes as `before`
    // (not a stale re-read) — visible as each later dispatch's prompt continuing
    // to carry the full continuation contract for a revision episode.
    expect(run.reportText).not.toMatch(/no progress across/);
    for (const d of optimizer) {
      expect(d.prompt).toMatch(/REVISION-COMPLETE:/);
    }
  });
});

describe("RLH-AT-41 — counter reset with interleaving (FSPEC §19 AT-41, E-50)", () => {
  test("RLH-AT-41: dispatches scoring no-progress, no-progress, progress, no-progress leave the episode running", async () => {
    // The sequence is chosen so that a counter which never resets reaches
    // MAX_AUTHORING_ATTEMPTS on dispatch 4, and a correctly resetting one is at 1.
    const SCORES = ["none", "none", "progress", "none"];
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        const score = SCORES[ctx.n - 1];
        if (score === undefined) return { write: completeDoc("REQ", "final"), response: authorResponse("yes") };
        return score === "progress"
          ? { write: completeDoc("REQ", `progress at ${ctx.n}`), response: authorResponse("declared_incomplete") }
          : { write: null, response: authorResponse("declared_incomplete") };
      },
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });
    expect(optimizer.length).toBeGreaterThanOrEqual(SCORES.length + 1);
    expect(run.result.outcome).toBe("success");
    expect(run.reportText).not.toMatch(/no progress across/);
  });
});

describe("RLH-AT-42 — counters are per episode (FSPEC §19 AT-42, O-19(c), E-51)", () => {
  test("RLH-AT-42: a five-round convergence never reaches MAX_AUTHORING_DISPATCHES, and a greenfield episode spending 4 dispatches followed by a revision episode spending 3 in the same round does not halt", async () => {
    // (i) One dispatch per round across the whole round budget. Under a per-PHASE
    // counter this would be 4 against a 6-dispatch budget and pass by luck; the
    // interesting half is (ii).
    const perRound = await runPipeline({
      review: reviewersFailing([1, 2, 3, 4]),
      // `ctx.docType`, not a literal "REQ": `reviewersFailing` fails round 1 of
      // EVERY phase, so this hook also serves Phase F's/T's round-1 optimizer.
      // Writing a REQ-shaped body at the FSPEC path would leave that episode
      // structurally incomplete, and §5.6.2 makes a revision episode terminal on
      // completeness AND trailer — the episode would stall on an artefact of the
      // fixture rather than on anything AT-42 is about.
      author: (ctx) =>
        ctx.kind === "optimizer"
          ? { write: completeDoc(ctx.docType, `round ${ctx.round}`), response: authorResponse("yes") }
          : {},
    });
    expect(perRound.result.outcome).toBe("success");
    const rOptimizers = select(perRound, { kind: "optimizer", phase: "R" });
    expect(rOptimizers).toHaveLength(4);
    for (const round of [1, 2, 3, 4]) {
      expect(select(perRound, { kind: "optimizer", phase: "R", round })).toHaveLength(1);
    }
    expect(perRound.reportText).not.toMatch(/dispatches without reaching/);

    // (ii) 4 greenfield dispatches then 3 revision dispatches, both inside Phase F
    // round 1. They total 7 against MAX_AUTHORING_DISPATCHES = 6, so a
    // four-coordinate episode key (no `mode`) halts here; §4.5's five-coordinate
    // key gives the revision episode its own fresh budget.
    const GREENFIELD = 4;
    const REVISION = 3;
    const mixed = await runPipeline({
      review: (ctx) => (ctx.phase === "F" && ctx.round === 1
        ? { write: crossReviewDoc({ verdict: "Needs revision", high: 1 }), response: reviewResponse("Needs revision", 1) }
        : { write: crossReviewDoc({ verdict: "Approved" }), response: reviewResponse("Approved") }),
      author: (ctx) => {
        if (ctx.phase !== "F") return {};
        if (ctx.kind === "creator") {
          return ctx.n < GREENFIELD
            ? { write: partialDoc("FSPEC", ctx.n), response: "Killed." }
            : { write: completeDoc("FSPEC"), response: authorResponse("yes") };
        }
        if (ctx.kind === "optimizer") {
          return ctx.n < REVISION
            ? { write: completeDoc("FSPEC", `revision pass ${ctx.n}`), response: authorResponse("declared_incomplete") }
            : { write: completeDoc("FSPEC", "revision done"), response: authorResponse("yes") };
        }
        return {};
      },
    });

    expect(select(mixed, { kind: "creator", phase: "F" })).toHaveLength(GREENFIELD);
    expect(select(mixed, { kind: "optimizer", phase: "F", round: 1 })).toHaveLength(REVISION);
    expect(mixed.result.outcome).toBe("success");
    expect(mixed.reportText).not.toMatch(/dispatches without reaching/);
  });
});

// ─── 5. RLH-AT-43, RLH-AT-43a — mode across the seam, and S-INV freshness ─────

/**
 * The five clauses §5.6.3 and FSPEC §15.5 require of **every** revision-mode
 * dispatch prompt. Each is matched loosely enough to admit any wording and
 * tightly enough that an omitted clause reds — which is what AT-48 asserts
 * directly and what AT-43 and AT-43a assert as a precondition of "revision mode".
 */
const CONTINUATION_CLAUSES = Object.freeze([
  { name: "names the round's findings", re: /CROSS-REVIEW-[a-z-]+-[A-Z]+-v\d+\.md/ },
  { name: "states the partially-edited condition", re: /partial|already (?:been )?edited|interrupted/i },
  { name: "instructs: only what is not already reflected", re: /not already reflected|already reflected/i },
  { name: "directs the agent to the document on disk", re: /on disk|from the (?:file|document) on disk|read the (?:file|document)/i },
  { name: "requires the revision-completion trailer", re: /REVISION-COMPLETE:/ },
]);

/** Which continuation clauses a prompt satisfies. */
function clausesIn(prompt) {
  return CONTINUATION_CLAUSES.filter((c) => c.re.test(String(prompt ?? ""))).map((c) => c.name);
}

/** Every continuation clause name, for a whole-set `toEqual`. */
const ALL_CLAUSES = CONTINUATION_CLAUSES.map((c) => c.name);

/** The highest `-v{N}` round among a list of cross-review basenames, or 0. */
function highestRound(basenames) {
  return basenames.reduce((max, b) => {
    const m = /-v(\d+)\.md$/.exec(b);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
}

describe("RLH-AT-43 — mode survives the invocation seam (FSPEC §19 AT-43, O-19(i), E-52)", () => {
  test("RLH-AT-43: after a revision episode is killed mid-edit and the phase halts on the authoring budget, a fresh invocation re-enters revision mode on the round the branch still owes, not greenfield on structural completeness", async () => {
    // Invocation 1: round 1's reviewers find issues; the optimizer is killed on
    // every dispatch — no bytes written, no trailer — so the episode exhausts
    // MAX_AUTHORING_ATTEMPTS and the phase halts (§6.2 row 10).
    const first = await runPipeline({
      review: reviewersFailing([1, 2, 3, 4, 5]),
      author: (ctx) =>
        ctx.kind === "optimizer" ? { write: null, response: "Killed mid-edit." } : {},
    });
    expect(first.result.outcome).toBe("halted");
    expect(first.reportText).toMatch(/no progress across/);

    // The branch carries round 1's surviving cross-reviews and the REQ, unchanged.
    const survived = { ...first.fs.files };
    expect(Object.keys(survived).filter((p) => p.includes("CROSS-REVIEW-")).length).toBeGreaterThan(0);

    // Invocation 2: same tree, queue row reset, phase re-entered. Nothing about the
    // episode is carried in memory — everything selectMode reads is on disk.
    const second = await runPipeline({
      files: survived,
      review: reviewersFailing([1, 2, 3, 4, 5]),
      author: (ctx) =>
        ctx.kind === "optimizer" && ctx.n === 1
          ? { write: null, response: "Still working." }
          : { write: completeDoc("REQ", "addressed"), response: authorResponse("yes") },
    });

    const authored = select(second, { kind: "optimizer", phase: "R" });
    expect(authored.length).toBeGreaterThan(0);
    const resumed = authored[0];

    // (i) Revision mode, not greenfield: the full continuation contract is present.
    expect(clausesIn(resumed.prompt)).toEqual(ALL_CLAUSES);

    // (ii) The SAME round — the highest round the branch already holds, i.e. the one
    // still owed an authoring pass (§5.6.1 rule 2). Never an invented later round:
    // the findings it names must exist on disk at the instant it dispatched.
    const namedRounds = [...String(resumed.prompt).matchAll(/CROSS-REVIEW-([a-z-]+)-([A-Z]+)-v(\d+)\.md/g)];
    expect(namedRounds.length).toBeGreaterThan(0);
    for (const [basename, , , round] of namedRounds) {
      expect(resumed.crossReviews).toContain(basename);
      expect(Number(round)).toBe(highestRound(resumed.crossReviews));
    }

    // (iii) It does NOT report terminal success on structural completeness alone:
    // the REQ was complete throughout, dispatch 1 emitted no trailer, so a second
    // dispatch was issued.
    expect(authored.length).toBeGreaterThanOrEqual(2);
  });
});

describe("RLH-AT-43a — S-INV: every episode entry re-reads the branch (TSPEC §5.6.1)", () => {
  test("RLH-AT-43a: round 2's optimizer is a revision episode with an EpisodeKey distinct from round 1's, and a mid-loop unreadable listing halts without dispatching an episode", async () => {
    // ── (a) Freshness. `docs/{feature}/` EXISTS and is EMPTY of cross-reviews at
    // entry — §6.2 row 1's successful empty listing, not `dir_missing`. Under an
    // entry-time snapshot `present` stays empty for the life of the phase, every
    // optimizer episode selects greenfield, and the wrapper reports success on a
    // round whose findings were never addressed.
    expect(fakeListFiles([])("docs/absent-on-purpose")).toEqual({ ok: true, files: [] });

    const SPEND = 4; // per episode; 2 × 4 = 8 > MAX_AUTHORING_DISPATCHES = 6
    const run = await runPipeline({
      review: reviewersFailing([1, 2]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        return ctx.n < SPEND
          ? { write: completeDoc("REQ", `round ${ctx.round} pass ${ctx.n}`), response: authorResponse("declared_incomplete") }
          : { write: completeDoc("REQ", `round ${ctx.round} done`), response: authorResponse("yes") };
      },
    });

    expect(run.result.outcome).toBe("success");
    const round1 = select(run, { kind: "optimizer", phase: "R", round: 1 });
    const round2 = select(run, { kind: "optimizer", phase: "R", round: 2 });

    // Both episodes are revision episodes — round 1's included. Round 1's is the
    // S-INV case: the reviews it must see were written by THIS run, moments before.
    expect(round1.length).toBe(SPEND);
    expect(round2.length).toBe(SPEND);
    expect(clausesIn(round1[0].prompt)).toEqual(ALL_CLAUSES);
    expect(clausesIn(round2[0].prompt)).toEqual(ALL_CLAUSES);
    expect(round1[0].crossReviews.length).toBeGreaterThan(0);

    // Distinct EpisodeKeys, observed two ways: the round each addresses, and the
    // fact that 8 dispatches were paid for against a 6-dispatch per-episode budget
    // without the phase halting. One shared key exhausts on dispatch 7.
    expect(highestRound(round2[0].crossReviews)).toBe(2);
    expect(round1.length + round2.length).toBeGreaterThan(MAX_AUTHORING_DISPATCHES);
    expect(run.reportText).not.toMatch(/dispatches without reaching/);

    // Each episode's own refresh happened: at least one listing per episode entry.
    expect(run.listFiles.dirs).toContain(DOCS_DIR);

    // ── (b) A mid-loop `unreadable` halts (§6.2 rows 2 and 17) and dispatches
    // nothing. The failure is at call index 1, i.e. NOT the first listing — the
    // loop is already running, which is what "mid-loop" means.
    const FAIL_AT = 1;
    const failing = await runPipeline({
      review: reviewersFailing([1, 2]),
      makeListFiles: (fs) =>
        fakeListFiles((dirPath, callIndex) =>
          callIndex === FAIL_AT ? "unreadable" : basenamesIn(fs.files, dirPath)
        ),
    });

    expect(failing.result.outcome).toBe("halted");
    expect(failing.reportText).toContain(`Cannot enumerate ${DOCS_DIR}: unreadable`);
    // No episode is dispatched after the listing that could not be judged.
    expect(failing.dispatches.filter((d) => d.listCallCount > FAIL_AT)).toEqual([]);
  });
});

// ─── 6. RLH-AT-44, RLH-AT-45 — artifact sets and working-tree measurement ─────

describe("RLH-AT-44 — artifact-set semantics (FSPEC §19 AT-44, O-19(g), E-53, E-54)", () => {
  test("RLH-AT-44: an se-author dispatch that advances the TSPEC alone scores progress, terminal needs every required member, and a DECISIONS the warrant check does not require is not a member", async () => {
    const run = await runPipeline({
      author: (ctx) => {
        if (ctx.kind !== "creator" || ctx.phase !== "T") return {};
        // Dispatch 1 advances the TSPEC only — bytes change, required headings are
        // not all bodied yet. Progress, not terminal.
        return ctx.n === 1
          ? { write: partialDoc("TSPEC", 2), response: "Wrote the first two sections." }
          : { write: completeDoc("TSPEC"), response: authorResponse("yes") };
      },
    });

    const tCreator = select(run, { kind: "creator", phase: "T" });
    // Progress, so no halt; not terminal, so a second dispatch.
    expect(tCreator).toHaveLength(2);
    expect(run.reportText).not.toMatch(/no progress across/);

    // Terminal required every required member of the set — and DECISIONS is not a
    // member here, because the warrant check answered false (Phase D is skipped).
    // Had DECISIONS been treated as a member, Phase T could never reach terminal.
    expect(run.result.outcome).toBe("success");
    expect(run.fs.files[`${DOCS_DIR}/DECISIONS-${FEATURE}.md`]).toBeUndefined();
    const dPhase = run.result.phases.find((p) => p.phase === "D");
    expect(dPhase && dPhase.status).toBe("⏭");
  });
});

describe("RLH-AT-45 — working-tree measurement (FSPEC §19 AT-45, O-19(g))", () => {
  test("RLH-AT-45: writes that are never committed count as progress, so three uncommitted partial writes do not exhaust MAX_AUTHORING_ATTEMPTS", async () => {
    // Nothing in this fixture ever commits the artifact. A git-based diff would see
    // no change at all across the three dispatches and score them all no-progress,
    // halting the phase; §5.6.2 measures `before !== after` over the working tree.
    const run = await runPipeline({
      author: (ctx) => {
        if (ctx.kind !== "creator" || ctx.phase !== "F") return {};
        return ctx.n <= MAX_AUTHORING_ATTEMPTS
          ? { write: partialDoc("FSPEC", ctx.n), response: "Killed before commit." }
          : { write: completeDoc("FSPEC"), response: authorResponse("yes") };
      },
    });

    const fCreator = select(run, { kind: "creator", phase: "F" });
    expect(fCreator.length).toBeGreaterThanOrEqual(MAX_AUTHORING_ATTEMPTS + 1);
    expect(run.result.outcome).toBe("success");
    expect(run.reportText).not.toMatch(/no progress across/);

    // The artifact was genuinely never committed by the pipeline — the progress
    // reading came from the tree, not from git.
    expect(run.git.commands.filter((c) => /commit/.test(c) && c.includes(FSPEC_PATH))).toEqual([]);
  });
});

// ─── 7. RLH-AT-46, RLH-AT-47 — budget exhaustion and its two reports ──────────

/** The POSTMORTEM path a Phase R non-convergence would use (§6.3). */
const POSTMORTEM_R_PATH = `${DOCS_DIR}/POSTMORTEM-R-${FEATURE}.md`;

/**
 * A revision episode that never writes and never emits a trailer: every dispatch
 * scores no-progress, so `MAX_AUTHORING_ATTEMPTS` is reached (§6.2 row 10).
 */
function stalledRevisionRun() {
  return runPipeline({
    review: reviewersFailing([1]),
    author: (ctx) => (ctx.kind === "optimizer" ? { write: null, response: "Killed." } : {}),
  });
}

describe("RLH-AT-46 — authoring-budget exhaustion writes no POSTMORTEM (FSPEC §19 AT-46, AC-3.5f, E-56)", () => {
  test("RLH-AT-46: the phase halts, no POSTMORTEM is written, the halted queue row is committed, and the report names the queue-row reset as the single recovery act and says no POSTMORTEM was written", async () => {
    const run = await stalledRevisionRun();

    // (i) The phase halts — and on the wrapper's reason, not on non-convergence.
    expect(run.result.outcome).toBe("halted");
    expect(run.reportText).toMatch(/no progress across/);

    // (ii) No POSTMORTEM. Exhausting the budget is the wrapper refusing to keep
    // paying; a POSTMORTEM claiming non-convergence would be false (§6.2, rows
    // 10–11 note). Asserted over the tree AND the structured field.
    expect(run.fs.files[POSTMORTEM_R_PATH]).toBeUndefined();
    expect(run.fs.writes.filter((w) => w.path.includes("POSTMORTEM"))).toEqual([]);
    expect(run.result.postmortemStatus).toBe("none");
    expect(run.result.postmortemPath).toBeNull();

    // (iii) The `halted` row IS committed (§6.5: every halt class, this one included).
    expect(run.recordQueueRow.statuses).toContain("halted");
    expect(run.result.queueRow).toBe("recorded");

    // (iv) The report states both halves, and offers exactly one recovery act — the
    // queue-row reset. A direct re-invocation is deliberately not offered (§14.4).
    expect(run.reportText).toContain("No POSTMORTEM was written.");
    expect(run.reportText).toMatch(
      new RegExp(`Recover: set the ${FEATURE} row in docs/_queue/QUEUE\\.md back to pending`)
    );
    expect(run.reportText).not.toMatch(/\/pdlc:orchestrate-dev/);
  });
});

describe("RLH-AT-47 — two distinct exhaustion reports (FSPEC §19 AT-47, AC-3.5d)", () => {
  test("RLH-AT-47: the consecutive budget reports 'no progress across 3 consecutive attempts' and the cumulative one '6 dispatches without reaching structural completeness', each with the section count and neither claiming a runtime retry count", async () => {
    // ── consecutive (MAX_AUTHORING_ATTEMPTS) ──
    const consecutive = await stalledRevisionRun();
    expect(consecutive.result.outcome).toBe("halted");
    expect(consecutive.reportText).toContain(
      `no progress across ${MAX_AUTHORING_ATTEMPTS} consecutive attempts`
    );
    expect(consecutive.reportText).not.toContain("dispatches without reaching structural completeness");

    // ── cumulative (MAX_AUTHORING_DISPATCHES) ──
    // Every dispatch writes NEW bytes, so the consecutive counter never advances;
    // the artifact still never becomes structurally complete, so only the total
    // budget can end it. The two exhaustion paths are therefore genuinely distinct.
    const cumulative = await runPipeline({
      author: (ctx) =>
        ctx.kind === "creator" && ctx.phase === "F"
          ? { write: partialDoc("FSPEC", Math.min(ctx.n, REQUIRED_HEADINGS.FSPEC.length - 1)), response: "Still going." }
          : {},
    });
    expect(cumulative.result.outcome).toBe("halted");
    expect(cumulative.reportText).toContain(
      `${MAX_AUTHORING_DISPATCHES} dispatches without reaching structural completeness`
    );
    expect(cumulative.reportText).not.toContain("consecutive attempts");
    expect(select(cumulative, { kind: "creator", phase: "F" })).toHaveLength(MAX_AUTHORING_DISPATCHES);

    // Each carries the script's own section count …
    for (const run of [consecutive, cumulative]) {
      expect(run.reportText).toMatch(/\(\d+ of \d+ sections complete\)/);
      // … and neither claims the runtime's internal retry count (§4a A-2/A-3).
      expect(run.reportText).not.toMatch(/runtime retr|internal retr|retry count/i);
    }
  });
});

// ─── 8. RLH-AT-48, RLH-AT-49 — the two prompt kinds ───────────────────────────

/** This file's literal seed (PLAN §7.2); `PDLC_PROP_SEED` overrides it. */
const PACING_SEED = 0x3ac91d05;
/** How many round plans `RLH-AT-48` replays. */
const PACING_CASES = 24;

/**
 * File-local, **unexported** domain generator: a plan for one phase's rounds.
 * Built only over `driftGenerators.js`'s primitives (PLAN §7.2 forbids extending
 * that library and forbids a second one).
 *
 * The case is shaped as a `{ kind: "manifest", rows }` value precisely so that
 * `shrink` — used on the failure path only — reduces a multi-round failure to the
 * single round that causes it.
 *
 * @param {{int: function(number, number): number, pick: function(Array): *}} rng
 * @returns {{ kind: "manifest", rows: Array<{round: number, spend: number, trailer: string}> }}
 */
function genRoundPlan(rng) {
  const rounds = rng.int(1, 3);
  const rows = [];
  for (let round = 1; round <= rounds; round += 1) {
    rows.push({
      round,
      spend: rng.int(1, MAX_AUTHORING_ATTEMPTS),
      trailer: rng.pick(["declared_incomplete", "absent", "duplicated", "unparseable"]),
    });
  }
  return { kind: "manifest", rows };
}

/**
 * Replay one generated round plan and return every revision-mode prompt it
 * produced, together with the clauses each prompt satisfied.
 *
 * @param {{rows: Array<{round: number, spend: number, trailer: string}>}} plan
 */
async function replayRoundPlan(plan) {
  const byRound = new Map(plan.rows.map((r) => [r.round, r]));
  const run = await runPipeline({
    review: reviewersFailing([...byRound.keys()]),
    author: (ctx) => {
      if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
      const row = byRound.get(ctx.round);
      if (!row || ctx.n >= row.spend) {
        return { write: completeDoc("REQ", `round ${ctx.round} done`), response: authorResponse("yes") };
      }
      return {
        write: completeDoc("REQ", `round ${ctx.round} pass ${ctx.n}`),
        response: authorResponse(row.trailer),
      };
    },
  });
  return select(run, { kind: "optimizer", phase: "R" }).map((d) => ({
    round: d.round,
    missing: ALL_CLAUSES.filter((name) => !clausesIn(d.prompt).includes(name)),
  }));
}

describe("RLH-AT-48 — the continuation prompt contract is inspectable (FSPEC §19 AT-48, AC-3.5g)", () => {
  test("RLH-AT-48: every revision-mode dispatch names the round's findings, states the partially-edited condition, gives the not-already-reflected instruction, directs the agent to the document on disk, and requires the trailer", async () => {
    // The named-case half: one round, four dispatches, each of them revision-mode.
    const run = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) => {
        if (ctx.kind !== "optimizer" || ctx.phase !== "R") return {};
        return ctx.n < 4
          ? { write: completeDoc("REQ", `pass ${ctx.n}`), response: authorResponse("declared_incomplete") }
          : { write: completeDoc("REQ", "done"), response: authorResponse("yes") };
      },
    });
    const revisionDispatches = select(run, { kind: "optimizer", phase: "R", round: 1 });
    expect(revisionDispatches.length).toBeGreaterThan(0);
    for (const dispatch of revisionDispatches) {
      // A prompt lacking ANY clause fails the test — the whole set, not a subset.
      expect({ n: dispatch.n, clauses: clausesIn(dispatch.prompt) })
        .toEqual({ n: dispatch.n, clauses: ALL_CLAUSES });
    }

    // The generated half: the contract holds for every round shape, not just this one.
    const seed = resolveSeed(PACING_SEED);
    const rng = seeded(seed);
    for (let caseIndex = 0; caseIndex < PACING_CASES; caseIndex += 1) {
      const plan = genRoundPlan(rng);
      const observed = await replayRoundPlan(plan);
      const bad = observed.filter((o) => o.missing.length > 0);
      if (bad.length > 0) {
        // Failure path only: reduce the multi-round case to the single round at fault.
        let minimal = plan;
        for (const candidate of shrink(plan)) {
          const stillBad = (await replayRoundPlan(candidate)).some((o) => o.missing.length > 0);
          if (stillBad) { minimal = candidate; break; }
        }
        throw new Error(
          `RLH-AT-48 seed=${seed} case=${caseIndex}: revision prompts missing clauses ` +
            `${JSON.stringify(bad)} — minimal plan ${JSON.stringify(minimal.rows)}`
        );
      }
      expect(observed.length).toBeGreaterThan(0);
    }
  });
});

/** The wording a resume prompt must carry (§5.6.3, FSPEC §15.5's resume clause). */
const RESUME_MARKERS = Object.freeze([/RESUMED/i, /first unwritten section/i, /do NOT rewrite/i]);

describe("RLH-AT-49 — the resume prompt names the first unwritten section (FSPEC §19 AT-49, AC-3.3, O-6)", () => {
  test("RLH-AT-49: a partial spec resumes at section 8, a partial cross-review resumes at the trailing Verdict section, a partial LEARNINGS resumes at its fifth numbered section, and the heading field is never empty", async () => {
    // ── (a) Spec class: 21 top-level headings, 1–7 written, 8–21 empty. The FSPEC
    // is already on disk at entry, so the creator episode's FIRST dispatch is a
    // resume ("`invocation === 1` and the target is absent or empty" is false).
    const EXTRA = 14; // 7 required + 14 extra = 21 top-level headings
    const specRun = await runPipeline({
      files: { [FSPEC_PATH]: partialDoc("FSPEC", REQUIRED_HEADINGS.FSPEC.length, EXTRA) },
      author: (ctx) =>
        ctx.kind === "creator" && ctx.phase === "F"
          ? { write: completeDoc("FSPEC"), response: authorResponse("yes") }
          : {},
    });
    const fCreator = select(specRun, { kind: "creator", phase: "F" });
    expect(fCreator.length).toBeGreaterThan(0);
    const resumePrompt = fCreator[0].prompt;
    for (const marker of RESUME_MARKERS) expect(resumePrompt).toMatch(marker);
    // Section 8 is the first unwritten one, and the index was computed by the
    // SCRIPT's own heading walk — the agent was never asked.
    expect(resumePrompt).toContain(extraHeading(8));
    expect(resumePrompt).toMatch(/7 of 21 top-level sections/);

    // ── (b) Cross-review class (§5.9's whole-file criterion, §15.5's per-class
    // mapping). Dispatch 1 writes prose under every heading but no trailing
    // `## Verdict`, so the episode is not terminal and dispatch 2 is a resume.
    const reviewRun = await runPipeline({
      review: (ctx) =>
        ctx.skill === "se-review" && ctx.phase === "R" && ctx.n === 1
          ? { write: crossReviewDoc({ withVerdict: false }), response: "Killed before the verdict." }
          : { write: crossReviewDoc({ verdict: "Approved" }), response: reviewResponse("Approved") },
    });
    const seReview = select(reviewRun, { skill: "se-review", phase: "R", round: 1 });
    expect(seReview.length).toBeGreaterThanOrEqual(2);
    for (const marker of RESUME_MARKERS) expect(seReview[1].prompt).toMatch(marker);
    expect(seReview[1].prompt).toContain('(the trailing "## Verdict" section)');

    // ── (c) LEARNINGS class: four numbered sections bodied, the fifth empty.
    const harvestRun = await runPipeline({
      harvest: (ctx) =>
        ctx.n === 1
          ? { write: learningsDoc({ filled: 4, approvalRecord: false }), response: "Killed." }
          : { write: learningsDoc(), response: authorResponse("yes") },
    });
    const harvestDispatches = select(harvestRun, { skill: "harvest-learnings" });
    expect(harvestDispatches.length).toBeGreaterThanOrEqual(2);
    for (const marker of RESUME_MARKERS) expect(harvestDispatches[1].prompt).toMatch(marker);
    expect(harvestDispatches[1].prompt).toContain(LEARNINGS_HEADINGS[4]);

    // ── The field is never empty or undefined in any of the three (§15.5's closing
    // guarantee: "the resume prompt is never emitted with an undefined field").
    for (const prompt of [resumePrompt, seReview[1].prompt, harvestDispatches[1].prompt]) {
      expect(prompt).not.toMatch(/undefined|\bnull\b/);
      expect(prompt).not.toMatch(/first unwritten section is\s*"?\s*[."]/i);
    }
  });
});

// ─── 9. RLH-AT-50, RLH-AT-51, RLH-AT-58 — the non-authoring wrapped classes ───

/**
 * The pacing contract every **wrapped authoring or review** prompt carries
 * (§5.6.3's shared clause; the same literals `skillFiles.test.js` pins in the
 * SKILL templates). Its *absence* is what distinguishes an unwrapped dispatch.
 */
const PACING_CONTRACT = Object.freeze([/skeleton/i, /commit after each/i, /12,?000/]);

/** How many of the pacing clauses a prompt carries. */
function pacingClauseCount(prompt) {
  return PACING_CONTRACT.filter((re) => re.test(String(prompt ?? ""))).length;
}

describe("RLH-AT-50 — a wrapped review dispatch is terminal on its verdict field (FSPEC §19 AT-50, O-19(f))", () => {
  test("RLH-AT-50: a cross-review with one parseable verdict ends the episode in a single dispatch that carried the pacing contract, while a Phase-DOD se-implement remediation dispatch carries none of it", async () => {
    const run = await runPipeline({
      review: () => ({
        write: crossReviewDoc({ verdict: "Approved" }),
        response: reviewResponse("Approved"),
      }),
    });
    const rReviews = select(run, { skill: "se-review", phase: "R", round: 1 });
    // Terminal on the verdict field alone: exactly one dispatch in the episode.
    expect(rReviews.map((d) => d.n)).toEqual([1]);
    // …and it was *wrapped*: a wrapped review dispatch carries the pacing contract.
    expect(pacingClauseCount(rReviews[0].prompt)).toBe(PACING_CONTRACT.length);

    // Phase-DOD remediation is an implementation dispatch, not an authoring one:
    // §5.6's wrapped classes do not include it, so it must carry none of the
    // contract and must never be asked for a `REVISION-COMPLETE:` trailer.
    const dodRun = await runPipeline({ dod: true, dodStatuses: ["failed", "passed"] });
    const remediation = select(dodRun, { skill: "se-implement" });
    expect(remediation.length).toBeGreaterThan(0);
    for (const dispatch of remediation) {
      expect(pacingClauseCount(dispatch.prompt)).toBe(0);
      expect(dispatch.prompt).not.toMatch(/REVISION-COMPLETE/);
    }
  });
});

describe("RLH-AT-51 — harvest is terminal without the approval record (FSPEC §19 AT-51, E-59)", () => {
  test("RLH-AT-51: a harvest killed after the prose and before the approval record is terminal on its first dispatch, the run still reports success, and the report names the missing approval record", async () => {
    const run = await runPipeline({
      harvest: () => ({
        write: learningsDoc({ approvalRecord: false }),
        response: "Harvest complete.",
      }),
    });
    const harvestDispatches = select(run, { skill: "harvest-learnings" });
    // Terminal: the missing §4.4 record does not make the episode incomplete, so
    // the harvester is not re-dispatched and the run is not halted by it.
    expect(harvestDispatches.map((d) => d.n)).toEqual([1]);
    expect(run.result.outcome).toBe("success");
    // …but the omission is reported rather than swallowed.
    expect(run.reportText).toMatch(/approval record/i);
    expect(run.reportText).toMatch(/missing|absent|not written/i);
  });
});

/** The marker the AT-58 fixture leaves in its stall-killed partial file. */
const PARTIAL_MARKER = "PARTIAL-BYTES-FROM-DISPATCH-1";

describe("RLH-AT-58 — intra-episode re-dispatch onto the episode's own partial file (FSPEC §19 AT-58, E-57)", () => {
  test("RLH-AT-58: after a stall-killed first dispatch leaves a non-empty partial cross-review, §15.4 re-dispatches inside the same episode without evaluating the no-overwrite guard, without an operator error, with the continue-do-not-rewrite instruction, and the partial bytes survive", async () => {
    // Rounds 1–3 already exist on disk, so the FSPEC review episode this fixture
    // targets is round 4 — §15.4's `CROSS-REVIEW-software-engineer-FSPEC-v4.md`.
    const seeded3 = {};
    for (const round of [1, 2, 3]) {
      for (const role of ["software-engineer", "test-engineer"]) {
        seeded3[`${DOCS_DIR}/CROSS-REVIEW-${role}-FSPEC-v${round}.md`] =
          crossReviewDoc({ verdict: "Needs revision", high: 1 });
      }
    }
    const run = await runPipeline({
      files: { ...seeded3, [FSPEC_PATH]: completeDoc("FSPEC") },
      review: (ctx) => {
        if (ctx.docType === "FSPEC" && ctx.skill === "se-review" && ctx.n === 1) {
          // Stall-killed: real bytes on disk, no trailing `## Verdict`.
          return {
            write: crossReviewDoc({ withVerdict: false, extra: ` ${PARTIAL_MARKER}` }),
            response: "Killed mid-write.",
          };
        }
        if (ctx.docType === "FSPEC" && ctx.skill === "se-review" && ctx.n === 2) {
          // A dispatch that OBEYS §15.4's continue-do-not-rewrite instruction:
          // it appends the missing `## Verdict` and leaves dispatch 1's bytes in
          // place. Modelling it as a full rewrite would delete the marker no
          // matter what the implementation did, making the last assertion
          // unsatisfiable rather than discriminating.
          return {
            write: crossReviewDoc({ verdict: "Approved", extra: ` ${PARTIAL_MARKER}` }),
            response: reviewResponse("Approved"),
          };
        }
        return { write: crossReviewDoc({ verdict: "Approved" }), response: reviewResponse("Approved") };
      },
    });

    const seFspec = select(run, { skill: "se-review", docType: "FSPEC" });
    expect(seFspec.length).toBeGreaterThan(0);
    expect(seFspec[0].round).toBe(4);
    // The episode re-dispatches onto its own partial file…
    expect(seFspec.filter((d) => d.round === 4).map((d) => d.n)).toEqual([1, 2]);
    // …the guard is not evaluated and no operator error is raised…
    expect(run.result.outcome).not.toBe("halted");
    expect(run.reportText).not.toMatch(/already exists|refusing to overwrite|no-overwrite/i);
    // …the continuation instruction is present…
    expect(seFspec[1].prompt).toMatch(/do NOT rewrite/i);
    expect(seFspec[1].prompt).toMatch(/RESUMED/i);
    // …and dispatch 1's bytes were still on disk when dispatch 2 was asked for.
    const partialPath = `${DOCS_DIR}/CROSS-REVIEW-software-engineer-FSPEC-v4.md`;
    expect(String(run.fs.files[partialPath] ?? "")).toContain(PARTIAL_MARKER);
  });
});

// ─── 10. RLH-AT-52, RLH-AT-53 — advisory proxy, and no destructive git ────────

describe("RLH-AT-52 — the pacing proxy reports but does not halt (FSPEC §19 AT-52, O-20, E-61)", () => {
  test("RLH-AT-52: a per-section commit diff over MAX_AUTHORING_WRITE_BYTES is named in the report as an advisory violation, the report says the figure is advisory and not a halt condition, and the run continues to completion", async () => {
    // The harness's `_git` answers every `--numstat` / `--stat` probe with
    // 20000 added lines on the FSPEC — comfortably over the 12,000-byte advisory
    // figure, on a run that is otherwise a clean straight-through success.
    const run = await runPipeline();

    // (i) The run is unaffected: the proxy is advisory, never a halt condition.
    expect(run.result.outcome).toBe("success");
    expect(run.result.haltPhase).toBeNull();

    // (ii) …and yet the violation is visible in the report, naming the artifact
    // and the constant that was exceeded (§4.7's advisory pacing line).
    expect(run.reportText).toMatch(/pacing/i);
    expect(run.reportText).toContain(FSPEC_PATH);
    expect(run.reportText).toMatch(new RegExp(String(MAX_AUTHORING_WRITE_BYTES).replace(/^(\d)(\d{3})$/, "$1,?$2")));

    // (iii) The report says so in words: an advisory proxy, not an oracle (O-19,
    // §15.7 — "no oracle for emitted bytes exists").
    expect(run.reportText).toMatch(/advisory/i);

    // (iv) The measurement really was the commit diff, not a guess: the script
    // asked git for it.
    expect(run.git.commands.some((c) => /numstat|--stat/.test(c))).toBe(true);
  });
});

/** Git subcommands that would destroy uncommitted artifact bytes (§O-20). */
const DESTRUCTIVE_GIT = Object.freeze([/\bcheckout\s+--/, /\breset\s+--hard\b/, /\bstash\b/]);

describe("RLH-AT-53 — no git operation discards uncommitted artifact content (FSPEC §19 AT-53, O-20)", () => {
  test("RLH-AT-53: across a clean run and a budget-exhaustion halt, no git invocation is 'checkout --', 'reset --hard' or 'stash', and the partially-written artifact is still on disk after the halt", async () => {
    // A halt is the interesting case: it is the only place a cleanup instinct
    // could plausibly discard the partial work the recovery path depends on.
    const halted = await runPipeline({
      review: reviewersFailing([1]),
      author: (ctx) =>
        ctx.kind === "optimizer"
          ? { write: partialDoc("REQ", 1), response: "Killed mid-section." }
          : {},
    });
    expect(halted.result.outcome).toBe("halted");

    // The partial bytes survive — §14.4's recovery ("the phase resumes from
    // committed partial progress") is a lie if they do not.
    expect(String(halted.fs.files[REQ_PATH] ?? "")).toContain(REQUIRED_HEADINGS.REQ[0]);
    expect(halted.fs.files[REQ_PATH]).not.toBe("");

    const clean = await runPipeline();
    for (const run of [halted, clean]) {
      for (const command of run.git.commands) {
        for (const destructive of DESTRUCTIVE_GIT) {
          expect({ command, destructive: destructive.test(command) })
            .toEqual({ command, destructive: false });
        }
      }
    }
  });
});

// ─── 11. RLH-AT-54 — constant substitution and the round window ───────────────

describe("RLH-AT-54 — constant substitution respects the budget semantics (FSPEC §19 AT-54, AC-5.1, E-06)", () => {
  test("RLH-AT-54: on a branch whose highest FSPEC round is 3 the gate admits rounds 4 through 8, the exhaustion message names the window 'rounds 4..8', and no message claims 'after 5 iterations' against an absolute index", async () => {
    const HIGHEST_EXISTING = 3;
    const FIRST = HIGHEST_EXISTING + 1; // 4
    const LAST = HIGHEST_EXISTING + MAX_REVIEW_ROUNDS; // 8

    // Rounds 1–3 of the FSPEC already sit on the branch, non-approving. Nothing
    // else does, so Phase R starts at round 1 and is undisturbed.
    const seeded = {};
    for (let round = 1; round <= HIGHEST_EXISTING; round += 1) {
      for (const role of ["software-engineer", "test-engineer"]) {
        seeded[`${DOCS_DIR}/CROSS-REVIEW-${role}-FSPEC-v${round}.md`] =
          crossReviewDoc({ verdict: "Needs revision", high: 1 });
      }
    }

    const run = await runPipeline({
      files: { ...seeded, [FSPEC_PATH]: completeDoc("FSPEC") },
      // Phase R approves immediately; Phase F never does, so the whole admitted
      // window is consumed and the exhaustion message must describe it.
      review: (ctx) =>
        ctx.docType === "FSPEC"
          ? { write: crossReviewDoc({ verdict: "Needs revision", high: 1 }),
              response: reviewResponse("Needs revision", 1) }
          : { write: crossReviewDoc({ verdict: "Approved" }), response: reviewResponse("Approved") },
      // Each revision genuinely edits, so no authoring budget can end the phase
      // first — only the review-round window can.
      author: (ctx) =>
        ctx.phase === "F"
          ? { write: `${completeDoc("FSPEC")}\n<!-- pass ${ctx.round ?? 0}.${ctx.n} -->\n`,
              response: authorResponse("yes") }
          : {},
    });

    // (i) The gate admitted exactly rounds 4..8 — a RELATIVE window of
    // `MAX_REVIEW_ROUNDS` rounds starting after the highest existing one.
    const fspecRounds = [
      ...new Set(select(run, { skill: "se-review", docType: "FSPEC" }).map((d) => d.round)),
    ].sort((a, b) => a - b);
    expect(fspecRounds).toEqual([FIRST, FIRST + 1, FIRST + 2, FIRST + 3, LAST]);

    // (ii) …and the round-3 files that were already there were not re-reviewed.
    expect(fspecRounds.some((r) => r <= HIGHEST_EXISTING)).toBe(false);

    // (iii) The exhaustion message names the window, not an absolute count.
    expect(run.result.outcome).toBe("halted");
    expect(run.reportText).toMatch(new RegExp(`rounds ${FIRST}\\.\\.${LAST}`));
    expect(run.reportText).not.toMatch(new RegExp(`after ${MAX_REVIEW_ROUNDS} iterations`));
  });
});

// ─── 12. RLH-AT-61-loop, RLH-AT-61-report — the four trailer reasons ──────────

/**
 * The four §4.3 `TrailerFailure` values, paired with the fixture response that
 * must produce each. Every one is non-terminal; there is no `reason: "trailer"`.
 */
const TRAILER_FIXTURES = Object.freeze([
  { reason: "declared_incomplete", key: "declared_incomplete" },
  { reason: "absent", key: "absent" },
  { reason: "duplicated", key: "duplicated" },
  { reason: "unparseable", key: "unparseable" },
]);

/** Which of the four reasons a serialized surface mentions. */
function reasonsIn(text) {
  return TRAILER_FIXTURES.map((f) => f.reason).filter((r) => String(text ?? "").includes(r));
}

describe("RLH-AT-61-loop — each trailer reason is distinguishable in reviewLoop's return (FSPEC §19 AT-61, E-67, E-68)", () => {
  // Deviation from this suite's L2 stratum, deliberately: the subject of this
  // half of AT-61 is literally "`reviewLoop`'s return" (PLAN §5.4 row RLH-21,
  // TSPEC §3.9), and §3.8 forbids exporting `dispatchAndVerify`, so the exported
  // `reviewLoop` is the only legitimate observation point.
  test("RLH-AT-61-loop: 'REVISION-COMPLETE: no', a missing trailer, two trailer lines and an unparseable value each leave a DIFFERENT reason in reviewLoop's return, and every one of them is non-terminal", async () => {
    const seen = [];
    for (const fixture of TRAILER_FIXTURES) {
      const fs = fakeFs({ [FSPEC_PATH]: completeDoc("FSPEC") });
      const dispatches = [];
      const agent = async (skill, prompt) => {
        dispatches.push({ skill, prompt: String(prompt ?? "") });
        if (REVIEW_SKILLS.includes(skill)) {
          const role = ROLE_SLUG[skill];
          const round = iterationIn(prompt) ?? 1;
          fs.writeFile(
            `${DOCS_DIR}/CROSS-REVIEW-${role}-FSPEC-v${round}.md`,
            crossReviewDoc({ verdict: "Needs revision", high: 1 })
          );
          return reviewResponse("Needs revision", 1);
        }
        // The revision dispatch: no edit, and a trailer of the fixture's shape.
        return authorResponse(fixture.key, "Considered the findings.");
      };

      const result = await devModule.reviewLoop({
        doc: FSPEC_PATH,
        phase: "F",
        docType: "FSPEC",
        reviewers: ["se-review", "te-review"],
        optimizer: "pm-author",
        feature: FEATURE,
        _agent: agent,
        _parallel: (promises) => Promise.all(promises),
        _listFiles: fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath)),
        ...fs.injections(),
      });

      // Non-terminal: the wrapper re-dispatched the optimizer rather than
      // accepting the failed trailer.
      const optimizerCalls = dispatches.filter((d) => !REVIEW_SKILLS.includes(d.skill));
      expect({ reason: fixture.reason, redispatched: optimizerCalls.length > 1 })
        .toEqual({ reason: fixture.reason, redispatched: true });

      const surface = result && result.trailerReason !== undefined
        ? String(result.trailerReason)
        : JSON.stringify(result ?? null);
      seen.push({ reason: fixture.reason, mentioned: reasonsIn(surface) });
    }

    // A parser returning a constant reason for every non-`yes` input fails here.
    expect(seen).toEqual(
      TRAILER_FIXTURES.map((f) => ({ reason: f.reason, mentioned: [f.reason] }))
    );
  });
});

describe("RLH-AT-61-report — each trailer reason is distinguishable in the operator report (FSPEC §19 AT-61, §4.7)", () => {
  test("RLH-AT-61-report: the same four fixtures driven through main() each echo their own reason — declared_incomplete, absent, duplicated, unparseable — into the run report, and no report names a reason it did not observe", async () => {
    const seen = [];
    for (const fixture of TRAILER_FIXTURES) {
      const run = await runPipeline({
        review: reviewersFailing([1]),
        author: (ctx) =>
          ctx.kind === "optimizer" && ctx.phase === "R"
            ? { write: null, response: authorResponse(fixture.key, "Considered the findings.") }
            : {},
      });
      seen.push({ reason: fixture.reason, mentioned: reasonsIn(run.reportText) });
    }

    expect(seen).toEqual(
      TRAILER_FIXTURES.map((f) => ({ reason: f.reason, mentioned: [f.reason] }))
    );
  });
});

// ─── RLH-BASELINE — baseline-relative completeness, observed through `main()` ──
//
// The pre-oracle document: every top-level section written and non-empty, not one
// of them carrying a canonical §5.9 title. This is the shape of every REQ authored
// before the oracle existed, `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
// among them. Under the strict revision test such an episode can NEVER reach
// terminal — the author declares `REVISION-COMPLETE: yes`, the structural conjunct
// stays false, and the wrapper spends all six dispatches before halting the phase
// over findings that were in fact addressed.

/** A REQ whose sections are all substantive and none canonically titled. */
function preOracleReq(marker = "as authored") {
  const titles = [
    "1. Why this exists",
    "2. What good looks like",
    "3. Out of bounds",
    "4. What we must live with",
    "5. How we will know",
    "6. What could go wrong",
    "7. What we still owe",
  ];
  return specDoc(titles.map((t) => [t, `Substantive body for ${t} — ${marker}.`]));
}

describe("RLH-BASELINE — a revision episode is not gated on a shape the document never had", () => {
  test("RLH-BASELINE: an optimizer that addresses the round and emits REVISION-COMPLETE: yes ends the episode in one dispatch, even though the document is missing every canonical heading", async () => {
    const run = await runPipeline({
      files: { [REQ_PATH]: preOracleReq() },
      review: reviewersFailing([1]),
      author: (ctx) =>
        ctx.kind === "optimizer" && ctx.phase === "R"
          ? {
              // Bytes DO change — this is a revision that did work, not the
              // no-op `RLH-AT-35` covers — and the shape is unchanged: still
              // seven non-canonical headings.
              write: preOracleReq("after addressing round 1"),
              response: authorResponse("yes", "Round 1 findings applied."),
            }
          : {},
    });

    const optimizer = select(run, { kind: "optimizer", phase: "R", round: 1 });

    // (i) Non-vacuity: the artifact the episode ended on is still structurally
    // incomplete under the strict test, so a re-dispatch would be the *old*
    // behaviour rather than a coincidence of the fixture.
    const finalReq = run.fs.files[REQ_PATH];
    expect(finalReq).toContain("after addressing round 1");
    const strict = devModule.isComplete("spec", "REQ", finalReq);
    expect(strict.complete).toBe(false);
    expect(strict.missing.length).toBeGreaterThan(0);

    // (ii) ONE dispatch — no re-dispatch loop, no authoring-budget halt.
    expect(optimizer).toHaveLength(1);
    expect(optimizer[0].prompt).toMatch(/REVISION-COMPLETE:/);
    expect(run.result.outcome).toBe("success");
    expect(run.reportText).not.toMatch(new RegExp(`${MAX_AUTHORING_DISPATCHES} dispatches`));

    // (iii) The carried-over shortfall is REPORTED, not silent: an operator has to
    // be able to see that the document never grew the canonical sections.
    expect(run.reportText).toMatch(/pre-existing structural shortfall/);
    for (const title of strict.missing) expect(run.reportText).toContain(title);
  });
});
