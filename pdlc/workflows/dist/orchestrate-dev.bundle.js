export const meta = {
  name: "orchestrate-dev",
  description:
    "Full PDLC pipeline for one REQ — spec authoring, reviews, TDD implementation, DoD, harvest, PR.",
  whenToUse: "Run the pipeline for a single named REQ path.",
  phases: [
    { title: "Phase R", detail: "REQ review" },
    { title: "Phase F", detail: "FSPEC author + review" },
    { title: "Phase T", detail: "TSPEC author + review" },
    { title: "Phase D", detail: "PLAN author + review" },
    { title: "Phase P", detail: "PROPERTIES author + review" },
    { title: "Phase I", detail: "implementation batches (sonnet)" },
    { title: "Phase CR", detail: "final codebase review" },
    { title: "Phase DOD", detail: "definition-of-done verify + remediate" },
    { title: "Phase H", detail: "harvest learnings" },
    { title: "Phase PUB", detail: "raise PR + verify CI" },
  ],
};

// ⚠️  GENERATED FILE — DO NOT EDIT.
// Built by `node pdlc/workflows/build-runtime.mjs` from:
//   pdlc/workflows/orchestrate-dev.js
//   pdlc/workflows/orchestrate-queue.js
//   pdlc/workflows/runtime-adapter.js
// Edit those, then rebuild. See pdlc/workflows/build-runtime.mjs for why this
// bundle exists (the workflow runtime allows no imports, exports past meta, or fs).

/**
 * runtime-adapter.js — bridges the PDLC workflow modules to the Claude Code
 * workflow runtime.
 *
 * This file is NOT an ES module and is never imported. `build-runtime.mjs`
 * inlines it verbatim at the top level of a generated bundle, above the
 * IIFE-wrapped module bodies.
 *
 * Why it exists
 * -------------
 * orchestrate-dev.js / orchestrate-queue.js are written as testable ES modules:
 * static imports, named exports, sync `fs` and `child_process` defaults. The
 * workflow runtime accepts none of that — probed 2026-07-27, the sandbox has
 * NO `import` (static or dynamic), no `process`, no `fs`, no `fetch`; the only
 * host globals are: agent, parallel, pipeline, phase, log, workflow, args,
 * budget, console, setTimeout, clearTimeout.
 *
 * So every capability the modules take from Node is re-expressed here in terms
 * of `agent()`:
 *   - file read / write / existence  → an agent with Read/Write tools
 *   - `gh` and `git` invocations     → an agent with Bash
 * The modules already expose these as injection points (_readFile, _writeFile,
 * _checkFile, _checkCi, _mergeWorktree, _agent, _parallel, _pipeline, _log,
 * _phase), so the bundle passes adapters in rather than patching module bodies.
 *
 * Signature mismatch handled here: the modules call `agent(skill, prompt, opts)`;
 * the runtime's global is `agent(prompt, opts)`. rtAgent() maps one to the other
 * and turns the skill name into an explicit Skill-tool instruction.
 */

// Host globals, captured before any module-scope shadowing.
const RT = {
  agent,
  parallel,
  pipeline,
  phase,
  log,
};

// Model for the mechanical IO agents (file reads/writes, git/gh status reads).
// Deliberately the cheapest rung: these calls do no reasoning.
const RT_IO_MODEL = "haiku";

const RT_MISSING = "__PDLC_FILE_MISSING__";

/** Wrap a pdlc skill invocation into a single runtime agent prompt. */
function rtSkillPrompt(skill, prompt) {
  return (
    `You are the "${skill}" agent in the PDLC pipeline.\n` +
    `Before doing anything else, invoke the Skill tool with skill "pdlc:${skill}" ` +
    `and follow its instructions exactly for the task below.\n\n` +
    `Task:\n${prompt}`
  );
}

/** (skill, prompt, opts) → runtime agent(prompt, opts). */
async function rtAgent(skill, prompt, opts = {}) {
  const { model, label, ...rest } = opts || {};
  return await RT.agent(rtSkillPrompt(skill, prompt), {
    label: label || skill,
    ...(model ? { model } : {}),
    ...rest,
  });
}

/** The modules hand `parallel()` already-started promises, not thunks. */
async function rtParallel(promises) {
  return await Promise.all(promises);
}

/** The modules use `pipeline(label, fn)` as a labelled section, not a fan-out. */
async function rtPipeline(label, fn) {
  return await fn();
}

function rtPhase(label) {
  RT.phase(label);
}

function rtLog(message) {
  RT.log(String(message));
}

/** Read a file through an agent. Returns null when absent. */
async function rtReadFile(path) {
  const out = await RT.agent(
    `Read the file at "${path}", relative to the repository root.\n` +
      `Return ONLY its exact, complete contents as your final message: no commentary, ` +
      `no summary, no markdown code fences, no leading or trailing blank lines you add yourself.\n` +
      `If the file does not exist or cannot be read, return exactly: ${RT_MISSING}`,
    { label: `read:${path}`, model: RT_IO_MODEL }
  );
  if (typeof out !== "string") return null;
  if (out.trim() === RT_MISSING) return null;
  return out;
}

/** Write a file through an agent, verbatim. */
async function rtWriteFile(path, contents) {
  await RT.agent(
    `Write the following content to "${path}", relative to the repository root, ` +
      `replacing the file's current contents exactly. Do not reformat, re-wrap, ` +
      `summarise, or add anything. Reply with "ok" when written.\n\n` +
      `<<<PDLC_CONTENT_BEGIN\n${contents}\nPDLC_CONTENT_END`,
    { label: `write:${path}`, model: RT_IO_MODEL }
  );
}

/**
 * Existence/non-empty gate. Mirrors checkFileNonEmpty's contract:
 * { ok: true } | { ok: false, reason: "file_missing" | "file_empty" }
 */
async function rtCheckFile(path) {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return { ok: false, reason: "file_missing" };
  }
  const out = await RT.agent(
    `Run this exact command from the repository root and report the result:\n` +
      `  test -f "${path}" && test -s "${path}" && echo OK || { test -f "${path}" && echo EMPTY || echo MISSING; }\n` +
      `Return ONLY one word: OK, EMPTY, or MISSING.`,
    { label: `check:${path}`, model: RT_IO_MODEL }
  );
  const verdict = String(out || "").trim().toUpperCase();
  if (verdict.includes("OK")) return { ok: true };
  if (verdict.includes("EMPTY")) return { ok: false, reason: "file_empty" };
  return { ok: false, reason: "file_missing" };
}

/**
 * CI status for a PR. The agent only fetches raw `gh` JSON; classification
 * reuses the module's own tested checkPrCi() via a sync execFn closure, so the
 * none/pending/passed/failed/unknown mapping stays in one place.
 */
function rtMakeCheckCi(devModule) {
  return async function rtCheckCi(prUrl) {
    const raw = await RT.agent(
      `Run exactly: gh pr view ${prUrl} --json statusCheckRollup\n` +
        `Return ONLY the raw JSON it prints — no commentary, no code fences.\n` +
        `If the command fails, return exactly: ${RT_MISSING}`,
      { label: `ci:${prUrl}`, model: RT_IO_MODEL }
    );
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text || text === RT_MISSING) return "unknown";
    return await devModule.checkPrCi(prUrl, { execFn: () => text });
  };
}

/**
 * Merge a worktree branch. Contract mirrors mergeWorktree():
 * { ok: true } | { ok: false, conflictingFiles: string[] }
 */
async function rtMergeWorktree(repoPath, worktreeBranch, targetBranch) {
  const out = await RT.agent(
    `In the repository at "${repoPath}", the current branch is "${targetBranch}".\n` +
      `Run: git merge --no-ff ${worktreeBranch}\n` +
      `If it succeeds, return exactly: {"ok":true}\n` +
      `If it conflicts, capture the conflicting files with ` +
      `\`git diff --name-only --diff-filter=U\`, then run \`git merge --abort\`, and return ` +
      `exactly: {"ok":false,"conflictingFiles":["path/one","path/two"]}\n` +
      `Return ONLY that JSON object — no commentary, no code fences. Do not resolve conflicts yourself.`,
    { label: `merge:${worktreeBranch}`, model: RT_IO_MODEL }
  );
  try {
    const parsed = JSON.parse(String(out).trim());
    if (parsed && parsed.ok === true) return { ok: true };
    return {
      ok: false,
      conflictingFiles: Array.isArray(parsed && parsed.conflictingFiles)
        ? parsed.conflictingFiles
        : [],
    };
  } catch {
    return { ok: false, conflictingFiles: [] };
  }
}

/** Injection bundle handed to orchestrate-dev's main(). */
function rtDevInjections(devModule) {
  return {
    _agent: rtAgent,
    _parallel: rtParallel,
    _pipeline: rtPipeline,
    _phase: rtPhase,
    _log: rtLog,
    _checkFile: rtCheckFile,
    _readFile: rtReadFile,
    _checkCi: rtMakeCheckCi(devModule),
    _mergeWorktree: rtMergeWorktree,
  };
}


const __dev = (function () {
/**
 * orchestrate-dev.js — Full PDLC pipeline orchestrator
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-dev.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-dev.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Concurrent-agent ceiling analysis (REQ-NFR-01):
 * max fan-out is 5 se-implement agents per batch (Phase I) + 2 reviewers per reviewLoop
 * iteration = 7 concurrent max. Well under the 16-agent runtime ceiling.
 *
 * // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
 * // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
 */


// TSPEC-HARVEST-01: compile-time flag
const PHASE_H_ENABLED = true; // Set to false until feature-branch-consistency fix lands

// DOD-01: compile-time flag for Definition of Done verification (Phase DOD)
const PHASE_DOD_ENABLED = true; // Set to false to skip DoD verification gate

// DOD-02: maximum remediation iterations before halt
const DOD_MAX_ITERATIONS = 3;

// TSPEC-SHIP-01: compile-time flag for the PR-raise / CI-verify phase (Phase PUB)
const PHASE_PUB_ENABLED = true; // Set to false to skip auto-PR + CI verification

// TSPEC-SHIP-02: CI poll timing (milliseconds). All overridable via main() injection.
// Checks usually register within ~5 min; if none appear within the no-checks window
// we conclude the repo has no PR checks configured and treat the phase as a pass.
const CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000; // 10 min — no checks ⇒ assume none configured
const CI_POLL_INTERVAL_MS = 30 * 1000; // 30 s between status polls
const CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — overall cap once checks are running

// MODEL-01: per-phase model selection. Every phase runs on Opus for reasoning
// depth EXCEPT the Phase I implementation batches, which run on Sonnet for
// throughput/cost. Passed to the runtime via the agent() opts.model field.
const MODEL_DEFAULT = "opus"; // all phases except Phase I

// ── TSPEC §4.8 — review-loop / authoring budgets ───────────────────────────────
// Module-level, not main() parameters: they are policy, not capability, and the
// workflow runtime's bundle has no configuration channel to override them from.
// They are deliberately NOT exported — an export widens the bundle's published
// surface for no caller. Tests reach them through observable behaviour (round
// windows, dispatch counts), the same discipline DOD_MAX_ITERATIONS lives under.

// TSPEC-ROUNDS-01: per-invocation review-round budget (AC-1.6a). NOT an absolute
// round index — the gate and the reported counts derive from this plus the
// branch-derived starting index.
const MAX_REVIEW_ROUNDS = 5;

const MAX_AUTHORING_ATTEMPTS = 3; // consecutive no-progress dispatches, per episode
const MAX_AUTHORING_DISPATCHES = 6; // total dispatches, per episode
const MAX_AUTHORING_WRITE_BYTES = 12000; // per-tool-call emission ceiling stated to authors

// ── TSPEC §4.1 — the four closed failure catalogues (DC-01) ────────────────────
// Frozen so a test can enumerate them and a switch can be checked exhaustive.
// §4.2: `dir_missing` is the sole benign ListFailure; the other three mean
// "cannot judge" and halt.
const LIST_FAILURES = Object.freeze([
  "dir_missing",
  "not_a_directory",
  "unreadable",
  "bad_argument",
]);
const FILENAME_FAILURES = Object.freeze([
  "not_cross_review",
  "bad_role",
  "bad_doc_type",
  "bad_round",
  "trailing_junk",
]);
const HASH_FAILURES = Object.freeze(["absent", "duplicated", "unparseable"]);
const TRAILER_FAILURES = Object.freeze([
  "declared_incomplete",
  "absent",
  "duplicated",
  "unparseable",
]);

const MODEL_IMPLEMENTATION = "sonnet"; // Phase I se-implement batches only

// TSPEC-SCRIPT-03: Exported meta object
const meta = {
  name: "orchestrate-dev",
  description: "Full PDLC pipeline orchestrator — REQ to harvest.",
  inputs: [
    {
      name: "reqPath",
      description:
        "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
    {
      name: "forcePhases",
      description:
        "Optional comma- or space-separated phases to re-run despite a recorded approval. Valid: R, F, T, P, D, PR, all.",
      type: "string",
      required: false,
    },
  ],
};

// TSPEC-DISPATCH-01: Normative Phase Dispatch Table
const PHASE_DISPATCH = {
  R: {
    phase: "R",
    label: "REQ Cross-Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  F: {
    phase: "F",
    label: "FSPEC Creation + Review",
    creator: "pm-author",
    creatorInputs: ["REQ"],
    creatorOutputPath: "docs/{feature}/FSPEC-{feature}.md",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  T: {
    phase: "T",
    label: "TSPEC Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC"],
    creatorOutputPath: "docs/{feature}/TSPEC-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  D: {
    phase: "D",
    label: "DECISIONS Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC"],
    creatorOutputPath: "docs/{feature}/DECISIONS-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  P: {
    phase: "P",
    label: "PLAN Creation + Review",
    creator: "se-author",
    // DECISIONS input is conditional — append if DECISIONS doc exists on branch
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "DECISIONS?"],
    creatorOutputPath: "docs/{feature}/PLAN-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  PR: {
    phase: "PR",
    label: "PROPERTIES Creation + Review",
    creator: "te-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "PLAN"],
    creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md",
    reviewers: ["pm-review", "se-review"],
    optimizer: "te-author",
  },
  CR: {
    phase: "CR",
    label: "Final Codebase Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  DOD: {
    phase: "DOD",
    label: "Definition of Done Verification",
    verifier: "dod-verify",
    remediator: "se-implement",
  },
};

// ─── Halt helper ───────────────────────────────────────────────────────────────

/**
 * Creates a halt error with the given message.
 * @param {string} message
 * @returns {Error}
 */
function haltError(message) {
  const err = new Error(message);
  err.isHalt = true;
  return err;
}

// ─── Deterministic file-existence check (replaces the guard agent) ────────────

/**
 * Verify a file exists and is non-empty. Deterministic replacement for the
 * former `guard` agent's file-existence check — a filesystem read needs no LLM.
 * A size-0 file, or one whose contents are whitespace-only, counts as empty.
 * Mirrors mergeWorktree's injectable-dependency style via the `fsMod` param.
 *
 * @param {string} path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true } | { ok: false, reason: "file_missing" | "file_empty" }}
 */
function checkFileNonEmpty(path, { fsMod = fs } = {}) {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return { ok: false, reason: "file_missing" };
  }
  try {
    if (!fsMod.existsSync(path)) {
      return { ok: false, reason: "file_missing" };
    }
    const stat = fsMod.statSync(path);
    if (stat.size === 0) {
      return { ok: false, reason: "file_empty" };
    }
    const contents = fsMod.readFileSync(path, "utf8");
    if (typeof contents === "string" && contents.trim() === "") {
      return { ok: false, reason: "file_empty" };
    }
  } catch {
    return { ok: false, reason: "file_missing" };
  }
  return { ok: true };
}

// ─── TSPEC-IMPL-01: parsePlanTasks — deterministic PLAN task-table parse ───────

/**
 * Parse a PLAN markdown task table into the DAG task list the implementation
 * phase batches over. Deterministic replacement for the former se-author DAG
 * agent — a markdown table needs no LLM to read.
 *
 * Header row is matched case-insensitively and tolerates column-order variation
 * (mirrors parseQueue's header-mapping approach). A parseable table needs at
 * minimum an id column and a dependencies column; without both this returns null
 * so the caller can fall back to the agent path. The dependencies cell is a
 * comma/space separated list of ids, with "-"/"—"/"none"/"" meaning none.
 *
 * @param {string | null | undefined} markdown - Raw PLAN.md contents
 * @returns {{ tasks: Array<{ id: string, description: string, dependencies: string[], planBatch: number|undefined }> } | null}
 */
function parsePlanTasks(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  if (rows.length === 0) return null;

  const isIdCell = (c) => c === "#" || c.includes("id");
  const isDepsCell = (c) =>
    c.includes("depend") || c.includes("deps") || c.includes("prereq");
  const isDescCell = (c) =>
    c.includes("desc") ||
    c.includes("task") ||
    c.includes("summary") ||
    c.includes("name") ||
    c.includes("title");
  const isBatchCell = (c) =>
    c.includes("batch") || c.includes("phase") || c.includes("wave");

  // Locate the header row: the first pipe row that carries both an id-like and a
  // dependencies-like column. Without an explicit dependency column the DAG can't
  // be derived from the table alone — return null and let the agent path read it.
  let cols = null;
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const cells = splitPipeRow(rows[i]).map((c) => c.toLowerCase());
    if (cells.some(isIdCell) && cells.some(isDepsCell)) {
      cols = cells;
      headerIdx = i;
      break;
    }
  }
  if (!cols) return null;

  const findCol = (pred, exclude = -1) => {
    for (let i = 0; i < cols.length; i++) {
      if (i === exclude) continue;
      if (pred(cols[i])) return i;
    }
    return -1;
  };

  const idIdx = findCol(isIdCell);
  const depsIdx = findCol(isDepsCell);
  const descIdx = findCol(isDescCell, idIdx);
  const batchIdx = findCol(isBatchCell);
  if (idIdx < 0 || depsIdx < 0) return null;

  const tasks = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const cells = splitPipeRow(rows[i]);
    // Skip the markdown separator row (|---|---|).
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;

    const id = (cells[idIdx] || "").trim();
    if (!id) continue;

    const description = descIdx >= 0 ? (cells[descIdx] || "").trim() : "";
    const dependencies = parsePlanDepsCell(cells[depsIdx]);

    let planBatch;
    if (batchIdx >= 0) {
      const raw = (cells[batchIdx] || "").trim();
      const m = raw.match(/\d+/);
      if (m) planBatch = parseInt(m[0], 10);
    }

    tasks.push({ id, description, dependencies, planBatch });
  }

  if (tasks.length === 0) return null;
  return { tasks };
}

/** Split a markdown table row on pipes, trimming leading/trailing pipe + cells. */
function splitPipeRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Parse a dependencies cell: comma/space list of ids; "-"/"—"/"none"/"" ⇒ []. */
function parsePlanDepsCell(cell) {
  if (!cell) return [];
  const trimmed = cell.trim();
  if (
    trimmed === "" ||
    trimmed === "-" ||
    trimmed === "—" ||
    trimmed === "–" ||
    trimmed.toLowerCase() === "none"
  ) {
    return [];
  }
  return trimmed
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter(
      (d) =>
        d &&
        d !== "-" &&
        d !== "—" &&
        d !== "–" &&
        d.toLowerCase() !== "none"
    );
}

// ─── TSPEC-PARSE-01: parseVerdict ─────────────────────────────────────────────

/**
 * The closed verdict catalogue (TSPEC §3.9, §5.9; FSPEC §16.3).
 *
 * Lifted out of `parseVerdict`'s body to module scope — the same single-source
 * move RLH-05 made for `reviewerRoleSlug`'s `MAP`, and for the same reason: §5.9's
 * cross-review completeness criterion asks "is at least one `VERDICT: ` value in
 * the catalogue?", and a second, hand-copied catalogue beside this one is exactly
 * the desync defect this feature exists to remove (TSPEC §3.9 — "reused verbatim",
 * one grammar family, three carriers).
 *
 * `parseVerdict` itself is otherwise untouched: same reverse-scan, same
 * `malformed: true` fallback, same returns for every input (PLAN §12.3).
 */
const VALID_VERDICTS = Object.freeze([
  "Approved",
  "Approved with minor changes",
  "Needs revision",
]);

/**
 * Extract VERDICT from a reviewer agent result string.
 *
 * When the trailer is missing or malformed (any path that logs the "returned no
 * VERDICT" warning) the fallback additionally carries `malformed: true` so the
 * caller can distinguish a genuine "Needs revision" verdict from an unparseable
 * response and attempt a cheap trailer recovery. Genuine parses — including the
 * truncated-output zero-counts case — never set `malformed`. The extra field is
 * additive: existing consumers only read verdict/high/medium/low.
 *
 * @param {string | null | undefined} result - Raw agent result
 * @param {string} skillName - Reviewer skill identifier for warning messages
 * @returns {{ verdict: string, high: number, medium: number, low: number, malformed?: boolean }}
 */
function parseVerdict(result, skillName) {
  const fallback = {
    verdict: "Needs revision",
    high: 0,
    medium: 0,
    low: 0,
    malformed: true,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  let verdictLine = null;
  let verdictLineIndex = -1;

  for (let i = 0; i < reversed.length; i++) {
    const trimmed = reversed[i].trim();
    if (trimmed.startsWith("VERDICT: ")) {
      verdictLine = trimmed;
      verdictLineIndex = lines.length - 1 - i;
      break;
    }
  }

  if (verdictLine === null) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const rawVerdict = verdictLine.slice("VERDICT: ".length).trim();

  if (!VALID_VERDICTS.includes(rawVerdict)) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Find next non-empty line after the VERDICT line
  let nextNonEmpty = null;
  for (let j = verdictLineIndex + 1; j < lines.length; j++) {
    if (lines[j].trim() !== "") {
      nextNonEmpty = lines[j].trim();
      break;
    }
  }

  // Truncated-output special case (TSPEC-PARSE-03)
  if (nextNonEmpty === null) {
    return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };
  }

  // Parse JSON
  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Validate JSON structure: exactly keys {high, medium, low}, all non-negative integers
  const keys = Object.keys(parsed).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== "high" ||
    keys[1] !== "low" ||
    keys[2] !== "medium"
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  if (
    !Number.isInteger(parsed.high) ||
    parsed.high < 0 ||
    !Number.isInteger(parsed.medium) ||
    parsed.medium < 0 ||
    !Number.isInteger(parsed.low) ||
    parsed.low < 0
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  return {
    verdict: rawVerdict,
    high: parsed.high,
    medium: parsed.medium,
    low: parsed.low,
  };
}

// ─── TSPEC-PARSE-05: parseDecisionsWarranted ──────────────────────────────────

/**
 * Extract DECISIONS_WARRANTED value from an se-author post-PASS result.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {boolean}  true if warranted (or absent/malformed); false only on explicit false
 */
function parseDecisionsWarranted(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
    );
    return true;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  for (const line of reversed) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DECISIONS_WARRANTED: ")) {
      const rawValue = trimmed
        .slice("DECISIONS_WARRANTED: ".length)
        .trim()
        .toLowerCase();
      if (rawValue === "true") {
        return true;
      }
      if (rawValue === "false") {
        return false;
      }
      // value not recognized — fall through to absent handling
      break;
    }
  }

  // Field absent or value not recognized
  log(
    "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
  );
  return true;
}

// ─── TSPEC §5.0 — the one fenced-region-aware scanner ─────────────────────────

/**
 * Visit every line of `text` that lies OUTSIDE a fenced code region.
 *
 * FSPEC §1.2 rule 5 governs every mechanical scan this pipeline performs over a
 * markdown artifact; it is expressed here once and every scanner calls it. There
 * is no per-site fence handling anywhere else.
 *
 * Three properties the callers depend on:
 *  1. A closer must use the same fence character and a run at least as long as
 *     the opener — a three-backtick line inside a four-backtick block is content,
 *     which is exactly the case a quoted fenced template produces.
 *  2. An unclosed fence swallows the remainder of the file. That fails closed in
 *     the correct direction: fewer matches, so a phase runs rather than skipping.
 *  3. The exclusion governs which lines may *match a scanned pattern*; it does
 *     not empty a section's body (§5.9 counts a fenced block as body content).
 *
 * Total: any input is coerced, nothing throws, the return is undefined.
 *
 * @param {string} text - the artifact text.
 * @param {function(string, number): void} visit - called as `visit(line, index)`
 *   for each unfenced line, where `index` is the line's index in `text.split("\n")`.
 * @returns {void}
 */
function scanLines(text, visit) {
  const lines = String(text ?? "").split("\n");
  let fenceChar = null; // "`" | "~" | null
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceChar === null) {
      if (m) {
        fenceChar = m[1][0];
        fenceLen = m[1].length;
      } // opener: the line is not visited
      else visit(line, i);
    } else if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
      fenceChar = null;
      fenceLen = 0; // closer: the line is not visited
    }
    // lines inside a fence, and the fence lines themselves, are never visited
  }
}

// ─── TSPEC §5.3 — the content digest: inlined, pure, no seam ──────────────────
//
// The workflow runtime has no `crypto` and no `TextEncoder`, so SHA-256 and the
// UTF-8 encoding beneath it are hand-rolled here in `Number`-only arithmetic (no
// `BigInt`). This family is deliberately NOT a seam: a seam exists to reach a
// capability the runtime lacks, and a deterministic synchronous digest over an
// in-memory string needs none — a seam would only add an awaitable boundary on
// the hot path of every approval comparison and let a double return a hash the
// production code never computes (§3.7).

/**
 * Canonicalise `text` before it is digested.
 *
 * N-1 normalises line endings (CRLF and lone CR both become LF); N-2 forces
 * exactly one trailing newline. Both are applied INSIDE `sha256Hex`, never by a
 * caller, so no two call sites can disagree about which bytes were digested —
 * the defect class where a write path and a read path produce different hashes
 * and every approval reads STALE.
 *
 * Total and idempotent: `canonicaliseForDigest(canonicaliseForDigest(t))` is
 * `canonicaliseForDigest(t)` for every input, including `null` and `undefined`.
 *
 * @param {string} text
 * @returns {string} the canonical form — LF-only, exactly one trailing newline.
 */
function canonicaliseForDigest(text) {
  const lf = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n"); // N-1
  return lf.replace(/\n*$/, "\n"); // N-2
}

/**
 * Encode `text` as UTF-8, by hand, because the runtime has no `TextEncoder`.
 *
 * Surrogate pairs are combined into their astral scalar value (the case a wrong
 * encoder gets wrong); an UNPAIRED surrogate is encoded as the three-byte form
 * of its own code unit, which is deterministic and total rather than throwing.
 *
 * @param {string} text
 * @returns {number[]} the bytes, each in 0…255.
 */
function utf8Bytes(text) {
  const s = String(text ?? "");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i);
    if (cp > 0xffff) i++; // a well-formed surrogate pair consumed two code units
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

/** SHA-256 round constants (FIPS 180-4) — the first 32 bits of the fractional
 *  parts of the cube roots of the first 64 primes. */
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/** Right-rotate a 32-bit word. */
function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** Two 32-bit words added modulo 2^32. Both operands are < 2^32, so the sum is
 *  < 2^33 and therefore exactly representable as a `Number` before truncation. */
function add32(a, b) {
  return (a + b) >>> 0;
}

/**
 * SHA-256 of `text`, as 64 lowercase hex characters.
 *
 * `canonicaliseForDigest` is applied HERE, inside the digest, so no call site can
 * digest un-canonicalised bytes (§5.3 N-1/N-2) — that is the whole reason this
 * function, and not its callers, owns the normalisation.
 *
 * `Math`, `>>>`, `|`, `^` and `Number` only: no `crypto`, no `BigInt`, no
 * `TextEncoder` (C-2).
 *
 * @param {string} text
 * @returns {string} 64 lowercase hex characters.
 */
function sha256Hex(text) {
  const bytes = utf8Bytes(canonicaliseForDigest(text));

  // Message length in BITS, as two 32-bit halves — `bytes.length * 8` can exceed
  // 2^32, and `<<` would silently wrap.
  const bitLenHi = Math.floor((bytes.length * 8) / 4294967296) >>> 0;
  const bitLenLo = (bytes.length * 8) % 4294967296 >>> 0;

  const padded = bytes.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push(
    (bitLenHi >>> 24) & 0xff,
    (bitLenHi >>> 16) & 0xff,
    (bitLenHi >>> 8) & 0xff,
    bitLenHi & 0xff,
    (bitLenLo >>> 24) & 0xff,
    (bitLenLo >>> 16) & 0xff,
    (bitLenLo >>> 8) & 0xff,
    bitLenLo & 0xff
  );

  // Initial hash values: the fractional parts of the square roots of the first
  // eight primes.
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) {
      const o = block + t * 4;
      w[t] =
        ((padded[o] << 24) |
          (padded[o + 1] << 16) |
          (padded[o + 2] << 8) |
          padded[o + 3]) >>>
        0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr32(w[t - 15], 7) ^ rotr32(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr32(w[t - 2], 17) ^ rotr32(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = add32(add32(w[t - 16], s0), add32(w[t - 7], s1));
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = add32(add32(add32(h, S1), add32(ch, SHA256_K[t])), w[t]);
      const S0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = add32(S0, maj);

      h = g;
      g = f;
      f = e;
      e = add32(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add32(temp1, temp2);
    }

    h0 = add32(h0, a);
    h1 = add32(h1, b);
    h2 = add32(h2, c);
    h3 = add32(h3, d);
    h4 = add32(h4, e);
    h5 = add32(h5, f);
    h6 = add32(h6, g);
    h7 = add32(h7, h);
  }

  const words = [h0, h1, h2, h3, h4, h5, h6, h7];
  let hex = "";
  for (const word of words) hex += `0000000${(word >>> 0).toString(16)}`.slice(-8);
  return hex;
}

/**
 * The prefixed form persisted as `APPROVAL-HASH:` (§4.4) and compared by §5.5.
 * There is exactly one digest in this pipeline: this is `sha256Hex` plus the
 * prefix, so the write path and the read path cannot diverge (A-11).
 *
 * @param {string} text
 * @returns {string} `sha256:{64 lowercase hex}`
 */
function approvalHashOf(text) {
  return `sha256:${sha256Hex(text)}`;
}

// ─── TSPEC §4.3 / §5.3 / §5.8 — the record parsers ────────────────────────────
//
// All five are total, synchronous, take no seam, and read the artifact through
// `scanLines`, so a marker quoted inside a fenced region never counts.

/** `sha256:` + 64 lowercase hex — the only well-formed APPROVAL-HASH value. */
const APPROVAL_HASH_VALUE_RE = /^sha256:[0-9a-f]{64}$/;
/** A commit sha as `REVIEWED-COMMIT:` may carry it: abbreviated or full lowercase hex. */
const REVIEWED_COMMIT_VALUE_RE = /^[0-9a-f]{7,40}$/;
/** The literal stored when no usable commit sha could be determined (§4.3, §4.4). */
const COMMIT_UNAVAILABLE = "unavailable";

/**
 * Read the tier-1 approval record out of a cross-review file (§4.4, §5.3).
 *
 * `HASH_FAILURES` describes the `APPROVAL-HASH:` line and nothing else.
 * `REVIEWED-COMMIT:` has no failure value because it has no failure: when it is
 * absent outside a fence, duplicated, or carries a value that is not lowercase
 * hex, `reviewedCommit` is the literal `"unavailable"` and `ok` stays `true`.
 * That is safe in the only direction that matters — §5.5's comparison never
 * reads the field (content-addressing is what makes the mechanism rebase-proof),
 * and degrading such a record to UNEVALUABLE would re-run a converged phase over
 * a field nothing consults.
 *
 * @param {string} fileText
 * @returns {{ok: true, hash: string, reviewedCommit: string}
 *          |{ok: false, reason: string}} `reason` is a `HASH_FAILURES` member.
 */
function parseApprovalHash(fileText) {
  const hashes = [];
  const commits = [];
  scanLines(fileText, (line) => {
    const h = /^\s*APPROVAL-HASH:\s*(\S*)\s*$/.exec(line);
    if (h) hashes.push(h[1]);
    const c = /^\s*REVIEWED-COMMIT:\s*(\S*)\s*$/.exec(line);
    if (c) commits.push(c[1]);
  });

  if (hashes.length === 0) return { ok: false, reason: "absent" };
  if (hashes.length > 1) return { ok: false, reason: "duplicated" };
  if (!APPROVAL_HASH_VALUE_RE.test(hashes[0])) return { ok: false, reason: "unparseable" };

  const reviewedCommit =
    commits.length === 1 && REVIEWED_COMMIT_VALUE_RE.test(commits[0])
      ? commits[0]
      : COMMIT_UNAVAILABLE;

  return { ok: true, hash: hashes[0], reviewedCommit };
}

/**
 * Read an author's `REVISION-COMPLETE:` trailer out of its response (§4.3).
 *
 * Called ONLY on a revision episode (§5.6.2): a greenfield episode's terminal
 * test is structural completeness alone, so `absent` never arises there and no
 * greenfield episode can be held back by a trailer its SKILL was never amended
 * to emit. All four failure reasons are non-terminal — none of them ends an
 * episode, `declared_incomplete` least of all, which is the normal paced path.
 *
 * @param {string} response
 * @returns {{complete: true}|{complete: false, reason: string}} `reason` is a
 *   `TRAILER_FAILURES` member.
 */
function parseRevisionComplete(response) {
  const values = [];
  scanLines(response, (line) => {
    const m = /^\s*REVISION-COMPLETE:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { complete: false, reason: "absent" };
  if (values.length > 1) return { complete: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { complete: true };
  if (value === "no") return { complete: false, reason: "declared_incomplete" };
  return { complete: false, reason: "unparseable" };
}

/**
 * Read a POSTMORTEM's `RESOLVED:` marker (§5.8).
 *
 * The marker is positionally unconstrained — a `RESOLVED:` line anywhere outside
 * a fenced region counts — and is HUMAN-WRITTEN ONLY. No agent and no script
 * ever writes `yes`; a POSTMORTEM resolves when a person says it did.
 *
 * Absence and malformation are reported here as `ok: false`; §5.8's
 * `checkPostmortem` maps both onto `unresolved`, failing closed, because a
 * POSTMORTEM whose marker cannot be read costs an operator one edit whereas the
 * opposite default silently re-runs a phase that failed for an unfixed reason.
 *
 * @param {string} fileText
 * @returns {{ok: true, resolved: boolean}|{ok: false, reason: string}}
 */
function parseResolvedMarker(fileText) {
  const values = [];
  scanLines(fileText, (line) => {
    const m = /^\s*RESOLVED:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { ok: false, reason: "absent" };
  if (values.length > 1) return { ok: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { ok: true, resolved: true };
  if (value === "no") return { ok: true, resolved: false };
  return { ok: false, reason: "unparseable" };
}

/** §5.8's truncation ceiling for the recommendation carried into a halt message. */
const RECOMMENDATION_MAX_BYTES = 4000;

/**
 * Take the `## Recommendation` section of a POSTMORTEM — heading located via
 * `scanLines`, so a quoted heading inside a fence is not mistaken for the real
 * one — up to the next top-level heading or EOF (§5.8).
 *
 * The BODY is sliced from the raw lines rather than from the visited ones: the
 * fenced-region exclusion governs which lines may match a scanned pattern, it
 * does not empty a section's body (§5.0 property 3), so a recommendation whose
 * content is a code fence survives intact.
 *
 * Truncated at 4,000 bytes with an explicit notice, because this text feeds the
 * halt message so the operator sees what to do without opening the file.
 *
 * @param {string} fileText
 * @returns {string} the recommendation body, or `""` when there is no such section.
 */
function extractRecommendation(fileText) {
  const lines = String(fileText ?? "").split("\n");
  let headingIndex = -1;
  let nextHeadingIndex = -1;
  scanLines(fileText, (line, index) => {
    if (headingIndex === -1) {
      if (/^\s*##\s+Recommendation\s*$/.test(line)) headingIndex = index;
    } else if (nextHeadingIndex === -1 && /^#{1,2}\s/.test(line)) {
      nextHeadingIndex = index;
    }
  });

  if (headingIndex === -1) return "";
  const end = nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;
  const body = lines.slice(headingIndex + 1, end).join("\n").trim();

  if (body.length <= RECOMMENDATION_MAX_BYTES) return body;
  return `${body.slice(0, RECOMMENDATION_MAX_BYTES)}\n\n[truncated at ${RECOMMENDATION_MAX_BYTES} bytes — see the POSTMORTEM for the rest]`;
}

/**
 * Parse the operator's raw `forcePhases` string (§5.7).
 *
 * Total, case-sensitive, whitespace- and comma-tolerant. Absent and empty are
 * the same thing: the empty set. An invalid token halts before any phase runs,
 * with the operator-facing text ending `Valid: R, F, T, P, D, PR, all.` — the
 * token catalogue and that message are derived from the SAME array, so they
 * cannot desynchronise. That derivation is load-bearing: `PR` entered the
 * catalogue at REQ/FSPEC v1.6, and a hand-written message would have been the
 * one site that silently kept teaching the operator the old five-token set.
 *
 * `all` means SIX phases, not five.
 *
 * Precedence (§5.7): forcing overrides a recorded APPROVAL — §2.5 steps 3 and 4
 * only — and never a recorded FAILURE. Step 2 is NOT skipped: `deriveRoundWindow`
 * still runs, because entering `reviewLoop` on the shipped `iteration = 1`
 * default on a branch that already carries `-v1` files re-creates H-1 on the one
 * path an operator reaches for precisely because the phase was reviewed before.
 *
 * @param {string} raw
 * @returns {{ok: true, phases: Set<string>}|{ok: false, badTokens: string[]}}
 */
function parseForcePhases(raw) {
  if (raw == null || String(raw).trim() === "") return { ok: true, phases: new Set() };
  const tokens = String(raw).split(/[,\s]+/).filter(Boolean);
  const valid = ["R", "F", "T", "P", "D", "PR"]; // six — "PR" added at REQ/FSPEC v1.6
  const bad = tokens.filter((t) => t !== "all" && !valid.includes(t));
  if (bad.length) return { ok: false, badTokens: bad };
  return { ok: true, phases: tokens.includes("all") ? new Set(valid) : new Set(tokens) };
}

// ─── TSPEC §5.5 — staleness ───────────────────────────────────────────────────

/**
 * Is a recorded approval hash still describing the document on disk?
 *
 * Three rules with teeth (§5.5), all of them structural rather than documented:
 *
 * 1. **Read at comparison time.** `documentBytes` is whatever the caller read at
 *    the moment of comparison — never a read cached earlier in the run, which is
 *    how a document edited between phases gets skipped as fresh.
 * 2. **No history walk** (O-8, as narrowed at FSPEC v1.5). One hash equality. No
 *    `git log` of the document, no reconstruction of past bytes.
 * 3. **Rebase invariance.** The comparison never reads `REVIEWED-COMMIT`. Phase
 *    DOD rebases `feat-{feature}` before every PR and rewrites every sha on the
 *    branch; a sha- or timestamp-based test would report every approval stale at
 *    that moment. Content-addressing is unaffected because content is unaffected.
 *    This is enforced by the signature, not by a comment: neither parameter is a
 *    commit, so there is no argument through which a sha could reach the compare.
 *
 * Only `FRESH` grants the skip. `STALE` and `UNEVALUABLE` both fall to §2.5 step
 * G and run the phase — FSPEC §1.2 rule 4's uniform direction: wherever a
 * machine-readable field cannot be read, the behaviour is *more* work, never less.
 *
 * Pure, total and synchronous: no seam, no throw, no IO (§3.7).
 *
 * @param {string} recordedHash - the `sha256:{64 hex}` literal carried by the
 *   approval record, copied verbatim — never recomputed over the working tree.
 * @param {string} documentBytes - the document's bytes, read at comparison time.
 * @returns {"FRESH"|"STALE"|"UNEVALUABLE"}
 */
function isStale(recordedHash, documentBytes) {
  if (typeof recordedHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(recordedHash))
    return "UNEVALUABLE";
  return approvalHashOf(documentBytes) === recordedHash ? "FRESH" : "STALE";
}

// ─── TSPEC §5.9 / FSPEC §16 — structural completeness ─────────────────────────
//
// Four wrapped artifact classes. The criterion is deliberately **shallow** and
// script-decidable (C-5) over the only evidence available — the artifact on disk.
// Anything richer would need an agent in the terminal decision, which is the loop
// this feature exists to bound; §4.5's counters, not this test, are what bound a
// badly behaved episode (FSPEC §16.2).

/**
 * The six spec classes' required top-level headings (TSPEC §5.9 = FSPEC §16.2).
 *
 * `title` is the **canonical** name — the form §5.9 lists first, and the form
 * `missing` carries even when the document rendered `alt` or a case/spacing/
 * numeric-prefix variant. `alt` is §5.9's parenthesised alternative, accepted as
 * equivalent; `null` where the row states none.
 */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: Object.freeze([
    { title: "Problem / Context", alt: null },
    { title: "Goals", alt: null },
    { title: "Non-Goals", alt: "Scope" },
    { title: "Constraints", alt: null },
    { title: "Acceptance Criteria", alt: null },
    { title: "Risks", alt: null },
    { title: "Obligations", alt: "Open Questions" },
  ]),
  FSPEC: Object.freeze([
    { title: "Overview", alt: "Scope" },
    { title: "Linked Requirements", alt: null },
    { title: "Behavioral Flow", alt: null },
    { title: "Business Rules", alt: null },
    { title: "Edge Cases and Error Scenarios", alt: null },
    { title: "Acceptance Tests", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  TSPEC: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Architecture", alt: "Design" },
    { title: "Interfaces", alt: null },
    { title: "Data Model", alt: "State" },
    { title: "Test Strategy", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  PLAN: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Batches", alt: "Tasks" },
    { title: "Dependencies", alt: null },
    { title: "Verification", alt: null },
  ]),
  PROPERTIES: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Properties", alt: null },
    { title: "Oracles", alt: null },
    { title: "Fixtures", alt: null },
  ]),
  DECISIONS: Object.freeze([
    { title: "Context", alt: null },
    { title: "Options Considered", alt: null },
    { title: "Decision", alt: null },
    { title: "Consequences", alt: null },
  ]),
});

/**
 * LEARNINGS' five numbered sections, as `harvest-learnings/SKILL.md` mandates
 * them (FSPEC §16.5). `## 6. Approval Record` is **deliberately absent**: the
 * record is best-effort (AC-4.2c), and making it part of the terminal criterion
 * would let a record-writing bug re-dispatch harvest to MAX_AUTHORING_DISPATCHES
 * and then halt the phase over an optimisation's bookkeeping.
 *
 * Matched by normalised prefix, so `## 3. Rejected Proposals (with rationale)`
 * satisfies `Rejected Proposals`.
 */
const LEARNINGS_SECTIONS = Object.freeze([
  "Non-Convergences",
  "Cross-Feature Patterns",
  "Rejected Proposals",
  "Process Learnings",
  "Open Items for Consolidation",
]);

/** A top-level `##` heading — never `###`, up to three leading spaces. */
const TOP_LEVEL_HEADING = /^ {0,3}##(?!#)\s+(.+?)\s*$/;

/**
 * §5.9's matching rules as one function: case-insensitive, whitespace-normalised,
 * a leading `N.` / `N)` numeric prefix ignored.
 */
function normaliseHeadingTitle(raw) {
  return String(raw ?? "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * The document's top-level sections, in document order.
 *
 * Headings are located through `scanLines`, so a `## …` line **quoted inside a
 * fenced block is not a section** (§1.2 rule 5) — a reviewer stall-killed after
 * quoting §6.2's template must not look like it reached the end. Bodies, by
 * contrast, are the **raw** lines between one heading and the next, fences
 * included: §5.0's exclusion governs which lines may *match a scanned pattern*,
 * it does not empty a section's body. Both directions matter and they pull
 * opposite ways (SE-v4 F-18 / TE-v4 F-01).
 */
function topLevelSections(fileText) {
  const lines = String(fileText ?? "").split("\n");
  const heads = [];
  scanLines(fileText, (line, index) => {
    const m = TOP_LEVEL_HEADING.exec(line);
    if (m) heads.push({ index, title: m[1] });
  });
  return heads.map((h, i) => ({
    title: h.title,
    normalised: normaliseHeadingTitle(h.title),
    index: h.index,
    body: lines.slice(h.index + 1, i + 1 < heads.length ? heads[i + 1].index : lines.length),
  }));
}

/**
 * §5.9's body rule. A body consisting only of `TBD`, `TODO`, `_TBD_` or an HTML
 * comment counts as **empty** — otherwise a skeleton written with placeholders
 * would score complete on write 1.
 *
 * The **accepted shallowness** (FSPEC v1.5, SE-v5 F-20 / TE-v5 Q-01): a body that
 * is only a fenced block containing `TBD` scores **non-empty**, because the fence
 * lines themselves are ordinary body content here. A fence-aware placeholder test
 * would reintroduce exactly the coupling that produced v1.4's false-halt.
 */
function isEmptyBody(bodyLines) {
  const stripped = bodyLines.join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const meaningful = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (meaningful.length === 0) return true;
  return meaningful.every((l) => /^[_*`~\s]*(?:TBD|TODO)[_*`~\s]*$/i.test(l));
}

/**
 * Does `line` carry a catalogue verdict? One grammar, shared with `parseVerdict`
 * (TSPEC §3.9): the same `VERDICT: ` prefix over the trimmed line, the same
 * slice, the same `VALID_VERDICTS` array — which is why that array is now module
 * scoped rather than copied here.
 */
function isCatalogueVerdictLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed.startsWith("VERDICT: ")) return false;
  return VALID_VERDICTS.includes(trimmed.slice("VERDICT: ".length).trim());
}

/**
 * FSPEC §16.3's cross-review criterion: the **trailing** `## Verdict` section
 * carries **at least one** `VERDICT: ` line whose value is in the catalogue.
 *
 * "Exactly one" was **withdrawn from the terminal test** at FSPEC v1.x and is
 * retained only in §6.3's *approval* test. Under the old reading a duplicated
 * verdict field made a finished review permanently non-terminal: the wrapper
 * re-dispatched to MAX_AUTHORING_DISPATCHES and halted the phase over a review
 * whose reviewer plainly reached the end (E-58). Terminal and approving are two
 * questions — a duplicated field is terminal **yes**, approving **no**, and
 * §5.1's own duplicate pre-count is what answers the second.
 *
 * The `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines §7 appends are not part of this
 * criterion: they are written *after* the episode reaches terminal.
 */
function crossReviewComplete(fileText) {
  const visited = [];
  scanLines(fileText, (line, index) => visited.push({ line, index }));
  let headingAt = -1;
  for (const v of visited) {
    const m = TOP_LEVEL_HEADING.exec(v.line);
    if (m && normaliseHeadingTitle(m[1]) === "verdict") headingAt = v.index;
  }
  if (headingAt === -1) return false;
  return visited.some((v) => v.index > headingAt && isCatalogueVerdictLine(v.line));
}

/**
 * Structural completeness of one wrapped artifact (§5.9, §3.7).
 *
 * Pure, total and synchronous — no seam, no throw, no IO. Unknown class or doc
 * type is **not complete**: FSPEC §1.2 rule 4's uniform direction is more work,
 * never less.
 *
 * `T` (top-level headings present) and `S` (those with non-empty bodies) are
 * carried for the run report and are **measured, not fixed**, so a document
 * richer than the minimum reports honestly. `missing` names the **canonical**
 * required titles that are absent or short; it is `[]` on the complete arm.
 *
 * @param {string} artifactClass - "spec" | "cross-review" | "code-review" | "LEARNINGS"
 * @param {string} docType - the spec doc type for the "spec" class; ignored otherwise
 * @param {string} fileText - the artifact's bytes
 * @returns {{complete: boolean, missing: string[], T: number, S: number}}
 */
function isComplete(artifactClass, docType, fileText) {
  const sections = topLevelSections(fileText);
  const T = sections.length;
  const S = sections.filter((s) => !isEmptyBody(s.body)).length;
  const done = (complete, missing) => ({ complete, missing, T, S });

  // A required row is satisfied when SOME section matches its canonical title or
  // its alternative AND that section's body is non-empty. Extra headings are
  // permitted, counted in `T`, and never subtract — a document richer than the
  // minimum is not incomplete. Order is not required.
  const shortfall = (rows) => {
    const satisfied = new Set();
    for (const s of sections) {
      for (const row of rows) {
        const matches = row.prefix
          ? s.normalised.startsWith(normaliseHeadingTitle(row.title))
          : s.normalised === normaliseHeadingTitle(row.title) ||
            (row.alt && s.normalised === normaliseHeadingTitle(row.alt));
        if (matches && !isEmptyBody(s.body)) satisfied.add(row.title);
      }
    }
    return rows.map((r) => r.title).filter((t) => !satisfied.has(t));
  };

  if (artifactClass === "spec") {
    const rows = REQUIRED_HEADINGS[docType];
    if (!rows) return done(false, []);
    const missing = shortfall(rows);
    return done(missing.length === 0, missing);
  }

  if (artifactClass === "cross-review") {
    return done(crossReviewComplete(fileText), []);
  }

  if (artifactClass === "code-review") {
    // §16.4: the `Scope:` field — matched with the SAME expression
    // `hooks/scripts/check-scope-field.sh` uses, so this criterion and the
    // existing hook agree on one marker rather than drifting apart — plus the
    // findings section the skill mandates. No verdict field: Phase DOD is out of
    // AC-4's scope entirely (§10.7), so a verdict on it would carry no meaning.
    const scoped = /scope|cross-feature/i.test(String(fileText ?? ""));
    const findings = sections.some((s) => s.normalised.includes("findings") && !isEmptyBody(s.body));
    return done(scoped && findings, []);
  }

  if (artifactClass === "LEARNINGS") {
    // §16.5: "its five numbered sections each with a non-empty body". The
    // criterion is POSITIONAL, not title-based: harvest-learnings is free to name
    // its five sections for the feature it distilled, and LEARNINGS_SECTIONS is
    // this module's default naming, not a contract the skill is held to. What is
    // fixed is that sections `1.`…`5.` all exist and all carry content.
    //
    // The approval record is EXCLUDED — it is section 6 when present, and
    // best-effort (AC-4.2c); see LEARNINGS_SECTIONS.
    const numbered = new Map();
    for (const s of sections) {
      const m = /^\s*(\d+)[.)]/.exec(String(s.title ?? ""));
      if (!m) continue;
      const n = Number(m[1]);
      if (n < 1 || n > LEARNINGS_SECTIONS.length) continue;
      if (!numbered.has(n) && !isEmptyBody(s.body)) numbered.set(n, s.title);
    }
    const missing = LEARNINGS_SECTIONS.filter((_, i) => !numbered.has(i + 1));
    return done(missing.length === 0, missing);
  }

  return done(false, []);
}

// ─── isPass helper ────────────────────────────────────────────────────────────

function isPass(verdict) {
  return verdict === "Approved" || verdict === "Approved with minor changes";
}

// ─── TSPEC §5.6.1 — selectMode; §5.6.2 — isTerminal ───────────────────────────

/**
 * Compute an episode's `mode` (TSPEC §5.6.1, FSPEC §15.2, AC-3.5 scope (d)).
 *
 * `EpisodeKey.mode` is not an input the caller invents. It is computed **once per
 * episode, at that episode's entry**, by this pure function, from what the phase
 * is dispatching an author to *do* — never from the artifact's structural state.
 *
 * **Invariant S-INV is the caller's obligation, not this function's.** `present`
 * and `reviewFiles` must be the state of the branch at the instant the episode
 * begins, read inside `reviewLoop` by `refreshReviewState`, never a snapshot taken
 * before the loop. Under an entry-time snapshot on a clean branch `present` is
 * empty for the life of the phase, every optimizer episode selects greenfield,
 * `isTerminal` requires no trailer, and the wrapper reports success on a round
 * whose findings were never addressed (TE-v2 N-01).
 *
 * The four rules, in the order §5.6.1 states them:
 *
 * 1. **The revision test is evaluated first** — structural completeness is never
 *    consulted here, so it can never move an episode out of revision mode.
 * 2. **Which round** — the highest round `present` holds that is not carrying
 *    same-round dual approval: the round still owed an authoring pass. A resuming
 *    invocation therefore re-enters the *same* round. §5.2's `max + 1` governs the
 *    next *reviewer* dispatch and is a different question over the same map.
 * 3. **Non-authoring wrapped dispatches are always greenfield**, without
 *    evaluating rule 1 — a review / dod-verify / harvest episode is never
 *    dispatched to address findings in its own artifact.
 * 4. **Greenfield needs positive evidence.** An episode is greenfield *only if*
 *    this episode's own refresh observed the branch and found no review round for
 *    this (feature, doc type) — i.e. `present` is empty. Everything else, including
 *    a non-empty `present` whose verdicts are unreadable, is revision. "Not read"
 *    is never "no findings"; the directions are not symmetric.
 *
 * The unread-*listing* axis never reaches rule 4: a `refreshReviewState` whose
 * `_listFiles` cannot be judged **halts** (§4.2, §6.2 rows 2 and 17), so `present`
 * is a `Map` at every call — the input domain has no third value to rule on, which
 * is what makes the rule total.
 *
 * @param {{dispatchKind: string, docType: string,
 *          present: Map<string, number[]>,
 *          reviewFiles: Map<string, {verdict: string, verdictReadable: boolean, anchorHash: string|null}>,
 *          startIndex: number}} arg
 * @returns {{mode: "authoring"|"revision", round: number|null, reason: string}}
 */
function selectMode({ dispatchKind, docType, present, reviewFiles, startIndex }) {
  // Rule 3 — evaluated before rule 1, not after it.
  if (dispatchKind !== "authoring") {
    return {
      mode: "authoring",
      round: null,
      reason: `non-authoring dispatch kind ${dispatchKind} is greenfield by construction`,
    };
  }

  const rounds = new Set();
  const roles = [];
  if (present && typeof present.forEach === "function") {
    present.forEach((list, role) => {
      roles.push(role);
      for (const n of list || []) rounds.add(n);
    });
  }

  // Rule 4 — greenfield needs positive evidence: an observed, EMPTY `present`.
  if (rounds.size === 0) {
    return {
      mode: "authoring",
      round: null,
      reason: `no review round on the branch for ${docType}`,
    };
  }

  // Rule 2 — the highest round not carrying same-round dual approval.
  const files = reviewFiles && typeof reviewFiles.get === "function" ? reviewFiles : new Map();
  const dualApproved = (round) =>
    roles.length > 0 &&
    roles.every((role) => {
      const rec = files.get(`${role}:${round}`);
      return !!rec && rec.verdictReadable === true && isPass(rec.verdict);
    });

  const descending = [...rounds].sort((a, b) => b - a);
  const owed = descending.find((r) => !dualApproved(r));
  const round = owed === undefined ? descending[0] : owed;

  return {
    mode: "revision",
    round,
    reason:
      owed === undefined
        ? `every observed ${docType} round is dual-approved; addressing round ${round}`
        : `${docType} round ${round} is still owed an authoring pass`,
  };
}

/**
 * The terminal test (TSPEC §5.6.2, FSPEC §8.4, AC-3.5b). Per mode, and it returns
 * a **record, not a boolean**, because the trailer reason it computes is the only
 * place that reason exists.
 *
 * | Mode | Terminal condition | Trailer |
 * |---|---|---|
 * | Greenfield | the required member of the artifact set is structurally complete | none required, none expected — `parseRevisionComplete` is not called |
 * | Revision | structurally complete **and** `parseRevisionComplete(response)` → `{complete: true}` | required |
 *
 * **Why the conjunct is absent from the greenfield path rather than reconciled.**
 * §7.4 amends only the three *author* SKILLs to emit `REVISION-COMPLETE:`; the
 * three review SKILLs, `dod-verify` and `harvest-learnings` never will, and
 * §5.6.1 rule 3 puts every one of those episodes in greenfield by construction. A
 * mode-blind conjunct would make the numerically dominant episode population
 * unable to *ever* reach terminal — H-3's own failure mode rebuilt by the
 * mechanism meant to remove it.
 *
 * **Both members are read, and `structural` is not one of them** — v1.2 returned
 * it as a third member no caller read, which is the shape AC-4.7a forbids, so it
 * lives as the local below where its only two readers are.
 *
 * @param {string} mode - the episode's mode, from `selectMode`
 * @param {string} response - the dispatch's response text
 * @param {string} artifactClass - §5.9's wrapped artifact class
 * @param {string} docType
 * @param {string|null} after - the target's bytes read AFTER the dispatch
 * @returns {{terminal: boolean, trailerReason: string|null}}
 */
function isTerminal(mode, response, artifactClass, docType, after) {
  const structural = isComplete(artifactClass, docType, after).complete;
  if (mode !== "revision") return { terminal: structural, trailerReason: null };
  const t = parseRevisionComplete(response);
  return {
    terminal: structural && t.complete,
    trailerReason: t.complete ? null : t.reason,
  };
}

// ─── REQ-GATE-04: Non-convergence halt helper ─────────────────────────────────

/**
 * If the reviewLoop result did not converge, throw a haltError that identifies
 * the phase, the non-approving reviewers, and their unresolved finding counts.
 * Also records the phase as ❌ in the phases array (PM-F03 / REQ-OBS-02).
 *
 * @param {{ converged: boolean, iterations: number, lastResults?: Array }} loopResult
 * @param {string} phaseId  - e.g. "R"
 * @param {string} phaseLabel - human-readable phase label
 * @param {Function} recordPhase - the local recordPhase callback
 */
function checkConverged(loopResult, phaseId, phaseLabel, recordPhase) {
  if (loopResult.converged !== false) return;

  // Build reviewer detail string (PM-F02)
  let reviewerDetail = "";
  if (Array.isArray(loopResult.lastResults) && loopResult.lastResults.length > 0) {
    const details = loopResult.lastResults
      .filter((r) => !isPass(r.verdict))
      .map((r) => `${r.skill} (high:${r.high}, medium:${r.medium}, low:${r.low})`)
      .join("; ");
    reviewerDetail = details ? ` — non-approving reviewers: [${details}]` : "";
  }

  const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md`;
  recordPhase(phaseId, phaseLabel, "❌", `Non-convergence after 5 iterations${reviewerDetail}`, 5);

  throw haltError(
    `Phase ${phaseId} did not converge after 5 iterations${reviewerDetail}. POSTMORTEM written.`
  );
}

// ─── TSPEC-LOOP-01 through TSPEC-LOOP-08: reviewLoop ─────────────────────────

/**
 * @param {object} params
 * @param {string} params.doc       - Path to the document under review (or feature dir for Phase CR)
 * @param {string} params.phase     - Phase label: "R" | "F" | "T" | "D" | "P" | "PR" | "CR"
 * @param {string[]} params.reviewers - Exactly two reviewer skill identifiers
 * @param {string} params.optimizer - Optimizer skill identifier
 * @param {string} params.feature   - Feature name
 * @param {number} [params.iteration=1] - Starting iteration (always 1 for fresh runs)
 * @param {function} [params._agent] - Injected agent function (for testing)
 * @param {function} [params._parallel] - Injected parallel function (for testing)
 * @param {function} [params._checkFile] - Injected file-existence check (for testing)
 * @returns {Promise<{converged: boolean, iterations: number, lastOptimizerResult?: string|null}>}
 */
async function reviewLoop({
  doc,
  phase,
  reviewers,
  optimizer,
  feature,
  iteration = 1,
  _agent = agent,
  _parallel = parallel,
  _checkFile = checkFileNonEmpty,
}) {
  // TSPEC-LOOP-02: Entry precondition check (skip for Phase CR)
  if (phase !== "CR") {
    const checkResult = await _checkFile(doc);
    if (!checkResult.ok) {
      throw haltError(
        `Error: ${doc} does not exist — cannot enter reviewLoop for phase ${phase}`
      );
    }
  }

  let result1, result2;
  // Retain the most recent optimizer result so callers (Phase T) can read the
  // DECISIONS_WARRANTED trailer without a separate post-PASS agent session. Null
  // when the loop converges on iteration 1 with no optimizer run.
  let lastOptimizerResult = null;

  // TSPEC-LOOP-03: Iteration loop
  while (true) {
    // (a) Check iteration cap at loop-top
    if (iteration > 5) {
      // POSTMORTEM trigger
      const postmortemPath = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
      const postmortemPrompt = [
        `Write ${postmortemPath}.`,
        `Include the required sections: Phase, Iterations (5 — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`,
        `Read all cross-review files for this phase (all versioned suffixes) to identify unresolved findings.`,
        `Commit and push.`,
      ].join(" ");

      let postmortemFailed = false;
      try {
        const postmortemResult = await _agent(optimizer, postmortemPrompt);
        if (
          postmortemResult == null ||
          (typeof postmortemResult === "string" &&
            postmortemResult.trim() === "")
        ) {
          postmortemFailed = true;
        }
      } catch {
        postmortemFailed = true;
      }

      if (postmortemFailed) {
        log(
          `WARNING: POSTMORTEM agent failed — artifact not written for phase ${phase}`
        );
      }

      // Build lastResults from the final iteration's reviewer verdicts (PM-F02)
      const lastResults = [
        { skill: reviewers[0], ...parseVerdict(result1, reviewers[0]) },
        { skill: reviewers[1], ...parseVerdict(result2, reviewers[1]) },
      ];

      return { converged: false, iterations: 5, lastResults };
    }

    // (b) Emit iteration log
    if (iteration === 1) {
      log("Starting iteration 1");
    } else {
      log(`Resuming from iteration ${iteration}`);
    }

    // (c) Dispatch reviewers in parallel. On iteration ≥2 each reviewer gets a
    // delta re-review prompt (read prior cross-review, diff-only scan) — see
    // reviewerPrompt. Iteration 1 is the full first-pass review.
    const reviewerPrompt1 = reviewerPrompt(doc, phase, feature, iteration, reviewers[0]);
    const reviewerPrompt2 = reviewerPrompt(doc, phase, feature, iteration, reviewers[1]);

    const [r1, r2] = await _parallel([
      _agent(reviewers[0], reviewerPrompt1),
      _agent(reviewers[1], reviewerPrompt2),
    ]);
    result1 = r1;
    result2 = r2;

    // (d) Parse verdicts. A missing/malformed VERDICT trailer sets malformed:true —
    // make one cheap Haiku recovery attempt to re-emit the trailer from the reviewer's
    // own output before paying for a full optimizer + re-review round.
    let verdict1 = parseVerdict(result1, reviewers[0]);
    if (verdict1.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[0],
        rawResult: result1,
        _agent,
      });
      if (recovered) verdict1 = recovered;
    }
    let verdict2 = parseVerdict(result2, reviewers[1]);
    if (verdict2.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[1],
        rawResult: result2,
        _agent,
      });
      if (recovered) verdict2 = recovered;
    }

    // (e) Evaluate gate
    const gatePass = isPass(verdict1.verdict) && isPass(verdict2.verdict);

    // (f) PASS branch
    if (gatePass) {
      return { converged: true, iterations: iteration, lastOptimizerResult };
    }

    // (g) Invoke optimizer (FAIL path)
    const optPrompt = optimizerPrompt(doc, phase, feature, iteration, reviewers);
    const optimizerResult = await _agent(optimizer, optPrompt);
    lastOptimizerResult = optimizerResult;

    if (
      optimizerResult == null ||
      (typeof optimizerResult === "string" && optimizerResult.trim() === "") ||
      (typeof optimizerResult === "string" &&
        optimizerResult.toLowerCase().includes("non-zero exit"))
    ) {
      throw haltError(
        `Error: optimizer agent ${optimizer} failed during phase ${phase}, iteration ${iteration} — pipeline halted. Document at ${doc} may be in an inconsistent state.`
      );
    }

    iteration += 1;
  }
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

/**
 * Map a reviewer skill id to the role slug it uses in its cross-review filename
 * (`CROSS-REVIEW-{role}-{DOC-TYPE}[-v{N}].md`). Slugs are taken from each reviewer
 * skill's Cross-Review File Format section. Returns null for unknown skills so
 * prompts degrade to the generic glob rather than an invented path.
 * @param {string} skill
 * @returns {string|null}
 */
/**
 * The single reviewer-skill → role-slug MAP (TSPEC §3.9). Lifted to module scope
 * so the filename grammar's role alternation (§5.2 G-2), the dispatch table and
 * the reverse accessor below all read the SAME catalogue and cannot desynchronise.
 */
const MAP = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

/** The closed role catalogue G-2 validates a parsed filename's role against. */
const REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP));

function reviewerRoleSlug(skill) {
  return MAP[skill] || null;
}

/**
 * The reverse of `reviewerRoleSlug` (TSPEC §3.9): a role slug as it appears in a
 * `CROSS-REVIEW-{role}-…` basename back to the reviewer skill that produced it.
 *
 * @param {string} slug
 * @returns {string|null} the reviewer skill id, or `null` for a non-catalogue slug.
 */
function reviewerSkillForSlug(slug) {
  for (const skill of Object.keys(MAP)) {
    if (MAP[skill] === slug) return skill;
  }
  return null;
}

// ─── TSPEC §5.2 — filename grammar and round-index derivation (the H-1 fix) ────

/** The G-1…G-4 cross-review basename grammar, applied to a BASENAME. */
const CROSS_REVIEW_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$/;

/** The same grammar with the round/extension tail left unconsumed, so a basename
 *  that fails only on its tail can be told apart: `bad_round` from `trailing_junk`. */
const CROSS_REVIEW_LOOSE_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?<rest>.*)$/;

const CROSS_REVIEW_PREFIX = "CROSS-REVIEW-";

/** The closed doc-type catalogue a cross-review may be written against (§4.4). */
const REVIEW_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
]);

/**
 * Parse a cross-review basename against the §5.2 grammar. Total: a string goes
 * in, a tagged union comes out, and it never throws.
 *
 * The four rules the grammar encodes, and the rejection each produces:
 *   G-1 (case)                  — `[a-z]` role / `[A-Z]` doc type
 *   G-2 (closed role catalogue) — validated AFTER the regex against `MAP`'s
 *                                 values, not baked into the pattern ⇒ `bad_role`
 *   G-3 (no leading zeros)      — `[1-9][0-9]*` ⇒ `bad_round`
 *   G-4 (no other optional part)— `$` immediately after `\.md` ⇒ `trailing_junk`
 *
 * The un-suffixed form IS round 1: `CROSS-REVIEW-{role}-{DOC}.md` and
 * `…-v1.md` denote the same round. That is not a convenience — the un-suffixed
 * form is what pre-existing branches in this repo carry, and treating it as "no
 * round" would make every historical approval invisible.
 *
 * @param {string} basename
 * @returns {{ok: true, role: string, docType: string, round: number, suffixed: boolean}
 *          |{ok: false, reason: string}} `reason` is a `FILENAME_FAILURES` member.
 */
function parseReviewFilename(basename) {
  const name = typeof basename === "string" ? basename : "";
  if (!name.startsWith(CROSS_REVIEW_PREFIX)) {
    return { ok: false, reason: "not_cross_review" };
  }

  const m = CROSS_REVIEW_RE.exec(name);
  if (m) {
    const { role, docType, n } = m.groups;
    if (!REVIEWER_ROLE_SLUGS.includes(role)) return { ok: false, reason: "bad_role" };
    if (!REVIEW_DOC_TYPES.includes(docType)) return { ok: false, reason: "bad_doc_type" };
    return {
      ok: true,
      role,
      docType,
      round: n === undefined ? 1 : Number(n),
      suffixed: n !== undefined,
    };
  }

  // The prefix is right but the rest is not. Classify the tail rather than
  // collapsing every such name onto `not_cross_review`, so E-03/E-07's notice
  // can tell an operator WHICH rule the file broke.
  const loose = CROSS_REVIEW_LOOSE_RE.exec(name);
  if (!loose) return { ok: false, reason: "bad_role" }; // G-1: the role segment itself
  const rest = loose.groups.rest;
  // Reachable only for a round token the strict pattern rejected — `-v0`, `-v01`.
  if (/^-v[0-9]+\.md$/.test(rest)) return { ok: false, reason: "bad_round" };
  return { ok: false, reason: "trailing_junk" };
}

/**
 * Derive the round window for one phase entry from ONE directory listing.
 *
 * Step 4 is the H-1 fix in a line: `startIndex` is one past the highest round
 * index already on the branch, so re-entering a phase never rewrites an existing
 * `-v{N}` cross-review. Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET
 * rather than an absolute cap — on a branch whose highest existing round is 3,
 * the re-entered phase starts at 4 and gets rounds 4…8, five rounds, not two.
 *
 * `present` and `skipped` are both carried out (step 7) precisely so one listing
 * suffices for the whole phase entry: a caller that had to re-enumerate, or
 * re-parse the listing itself, would violate AC-1.2 and the §2.4 layering rule.
 *
 * Step 5 halts rather than guessing: two files claiming round 1 for one role and
 * doc type may carry different verdicts, so picking either is a coin flip on
 * whether the phase is skipped, and picking "the newer" would import a filesystem
 * timestamp into an otherwise purely content-addressed decision.
 *
 * Synchronous, total, and takes no seam (§3.7).
 *
 * @param {string[]} basenames - the directory listing, basenames only.
 * @param {string} docType - the document type under derivation.
 * @returns {{ok: true, startIndex: number, endIndex: number,
 *            present: Map<string, number[]>,
 *            skipped: Array<{basename: string, reason: string}>}
 *          |{ok: false, reason: "malformed_round_one_duplicate", role: string}}
 */
function deriveRoundWindow(basenames, docType) {
  const listing = Array.isArray(basenames) ? basenames : [];
  // Deduplicated by basename, in the listing's own order — `skipped` is reported
  // in that order and `present` records each round index once.
  const unique = listing.filter((b, i) => listing.indexOf(b) === i);

  // Step 1 — parse every basename, keeping BOTH the entries and the rejects.
  const present = new Map();
  const skipped = [];
  // Per (role) record of which round-1 spelling was seen, for step 5.
  const roundOneForms = new Map();

  for (const basename of unique) {
    const result = parseReviewFilename(basename);
    if (!result.ok) {
      skipped.push({ basename, reason: result.reason });
      continue;
    }
    // A well-formed cross-review for a DIFFERENT doc type is a third outcome:
    // neither an entry nor a reject (§5.2, §8.2's partition property).
    if (result.docType !== docType) continue;

    // Step 2 — per-role round indices, deduplicated.
    const rounds = present.get(result.role) || [];
    if (!rounds.includes(result.round)) rounds.push(result.round);
    present.set(result.role, rounds);

    if (result.round === 1) {
      const forms = roundOneForms.get(result.role) || { plain: false, v1: false };
      if (result.suffixed) forms.v1 = true;
      else forms.plain = true;
      roundOneForms.set(result.role, forms);
      // Step 5 — one role, one doc type, two files both claiming round 1.
      if (forms.plain && forms.v1) {
        return {
          ok: false,
          reason: "malformed_round_one_duplicate",
          role: result.role,
        };
      }
    }
  }

  // Steps 3, 4 and 6.
  const indices = [];
  for (const rounds of present.values()) for (const round of rounds) indices.push(round);
  const startIndex = indices.length ? Math.max(...indices) + 1 : 1;
  const endIndex = windowEnd(startIndex);

  // Step 7.
  return { ok: true, startIndex, endIndex, present, skipped };
}

/**
 * The last round index of the review window that opens at `startIndex`.
 *
 * This is the SOLE place in the module where the window width is expressed in
 * terms of `MAX_REVIEW_ROUNDS`. `reviewLoop` takes `endIndex` as a parameter and
 * defaults it through this helper rather than recomputing the arithmetic, so the
 * budget can never be re-derived (and so drift) inside the loop itself.
 *
 * @param {number} startIndex
 * @returns {number}
 */
function windowEnd(startIndex) {
  return startIndex + MAX_REVIEW_ROUNDS - 1;
}

// ─── TSPEC §5.6.3 — the two prompt kinds, and the section walk behind them ────

/** The doc type an artifact path names, e.g. `docs/f/FSPEC-f.md` → `"FSPEC"`. */
function docTypeFromPath(path) {
  const m = /\/([A-Z]+)-[^/]+\.md$/.exec(String(path ?? ""));
  return m ? m[1] : null;
}

/**
 * §5.9's artifact class for a target path. The three special classes are
 * recognised by their filename convention; everything else is a spec-class
 * document, which is also the safe default for Phase CR's directory target
 * (`topLevelSections` of an unreadable target is empty, so the wrapper's
 * unmeasurable-target escape takes over — see `dispatchAndVerify`).
 */
function artifactClassOf(path) {
  const name = String(path ?? "");
  if (/\/CROSS-REVIEW-[^/]*$/.test(name)) return "cross-review";
  if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";
  if (/\/LEARNINGS-[^/]*$/.test(name)) return "LEARNINGS";
  return "spec";
}

/**
 * The heading the resume prompt names — **never empty** (§15.5's closing
 * guarantee). It reuses the same module-scope walk `isComplete` uses; a second
 * heading walker would be a second oracle for the same question.
 *
 * Resolution order:
 * 1. an absent or blank target has no sections at all, so the resume prompt names
 *    the skeleton rather than a heading;
 * 2. a cross-review is scored whole-file (§5.9), so its one unwritten "section" is
 *    the trailing verdict block — the only thing its criterion can be missing;
 * 3. otherwise the first top-level section whose body is empty, by document order;
 * 4. otherwise the first required heading `isComplete` reports missing.
 *
 * @param {string} artifactClass
 * @param {string} docType
 * @param {string|null} text
 * @returns {string}
 */
function firstUnwrittenSection(artifactClass, docType, text) {
  const body = String(text ?? "");
  if (body.trim() === "") return "the document skeleton (no content on disk yet)";
  if (artifactClass === "cross-review" && !crossReviewComplete(body)) {
    return '(the trailing "## Verdict" section)';
  }
  const sections = topLevelSections(body);
  const unwritten = sections.find((s) => isEmptyBody(s.body));
  if (unwritten) return unwritten.title;
  const { missing } = isComplete(artifactClass, docType, body);
  if (Array.isArray(missing) && missing.length > 0) return missing[0];
  return "the closing pass over the whole document";
}

/**
 * §5.6.3's shared clause, carried by every wrapped authoring **and** review
 * dispatch. `skillFiles.test.js` pins the same three literals in the SKILL
 * templates, so the runtime prompt and the SKILL text say one thing.
 */
const PACING_CONTRACT_CLAUSE = [
  "Pacing contract (H-3): lay down the skeleton first, then write ONE top-level",
  "section per edit, keep every single write under 12,000 bytes, and commit after",
  "each section. A monolithic write is killed by the 180 s stall watchdog and loses",
  "everything it had not yet flushed.",
].join(" ");

/** The greenfield opener for a target that is not on disk yet. */
function skeletonClause() {
  return (
    "This artifact is not on disk yet. Begin by laying out its top-level headings " +
    "as a skeleton, then fill them one at a time under the pacing contract above."
  );
}

/**
 * The resume opener (§5.6.3 clause 2, FSPEC §15.5): the target already carries
 * partial content, so the dispatch continues it instead of starting over. The
 * section count and the heading are computed by THIS script's walk — the agent is
 * never asked where it got to.
 */
function resumeClause(artifactClass, docType, text, targetPath) {
  const { T, S } = isComplete(artifactClass, docType, text);
  return [
    `RESUMED: ${targetPath} already carries partial content`,
    `(${S} of ${T} top-level sections carry a body).`,
    "Read the document on disk first and do NOT rewrite what is already written.",
    `The first unwritten section is ${firstUnwrittenSection(artifactClass, docType, text)}.`,
    "Continue from there, one section per write, under the pacing contract above.",
  ].join(" ");
}

/**
 * The continuation opener (§5.6.3 clause 3, FSPEC §15.5): a revision-mode episode
 * is addressing a specific round's findings on a document an earlier, interrupted
 * dispatch may already have partly edited. The five clauses `RLH-AT-48` inspects
 * are all here, and the cross-review basenames are the ones the episode's own
 * refresh actually saw on disk — never a name derived from arithmetic.
 *
 * The round is written in lower case deliberately: the acceptance harness reads
 * `Iteration N` out of prompts to key episodes, and a capitalised restatement here
 * would re-key the episode mid-flight.
 */
function continuationClause(round, reviewBasenames, targetPath) {
  const named = reviewBasenames.length > 0 ? reviewBasenames.join(", ") : "the cross-reviews of this round";
  return [
    `CONTINUATION of round ${round}. ${targetPath} may have been partially edited`,
    "already by an earlier dispatch that was interrupted mid-write.",
    `Address the findings in: ${named}.`,
    "Read the document on disk first and apply only what is not already reflected",
    "there; do NOT rewrite passages that already carry the change.",
    "When every finding this round owes has been applied, end your reply with the",
    "line `REVISION-COMPLETE: yes`. If you were stopped before finishing, end it",
    "with `REVISION-COMPLETE: no` instead.",
  ].join(" ");
}

/**
 * Build the reviewer dispatch prompt. Iteration 1 is a full first-pass review.
 * Iteration ≥2 appends the delta re-review protocol so the reviewer reads its own
 * previous cross-review and scans only the diff instead of re-reviewing the whole
 * document from scratch — the approval bar and VERDICT contract are unchanged.
 * @param {string} doc
 * @param {string} phase
 * @param {string} feature
 * @param {number} iteration
 * @param {string} [reviewer] - reviewer skill id (for the prior-cross-review path)
 * @returns {string}
 */
function reviewerPrompt(doc, phase, feature, iteration, reviewer) {
  const base = `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.`;
  if (iteration < 2) return base;

  const prev = iteration - 1;
  const role = reviewerRoleSlug(reviewer);
  const priorFile = role
    ? `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${prev}.md (your reviewer role is "${role}"; find the file for the previous iteration v${prev} matching this document's type)`
    : `your own previous cross-review file for this document (docs/${feature}/CROSS-REVIEW-{role}-{DOC-TYPE}-v${prev}.md — find your reviewer role's file for iteration v${prev})`;

  return (
    `${base}\n` +
    `This is a re-review — follow the delta re-review protocol:\n` +
    `1. First read your own previous cross-review file: ${priorFile}.\n` +
    `2. Run \`git diff\` on ${doc} against the commit you last reviewed to see exactly what changed.\n` +
    `3. Verify each of your previous findings is resolved; scan ONLY the changed sections for new issues. ` +
    `Do not re-review unchanged sections you already approved.\n` +
    `4. The approval bar is unchanged: any open High or Medium finding anywhere in the document — old or new — means Needs revision.\n` +
    `Write your new cross-review as v${iteration} and end with the standard VERDICT trailer.`
  );
}

function optimizerPrompt(doc, phase, feature, iteration, reviewers = []) {
  const base = `Address reviewer feedback on ${doc} for phase ${phase} of feature ${feature}. Iteration ${iteration} reviewers found issues. Update and commit.`;

  // Point the optimizer straight at this iteration's cross-review files so it does
  // not hunt for them. Both reviewer roles' expected paths for v{iteration}.
  const roles = reviewers.map(reviewerRoleSlug).filter(Boolean);
  let feedback = "";
  if (roles.length > 0) {
    const paths = roles
      .map((role) => `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md`)
      .join(" and ");
    feedback =
      `\nRead the reviewers' cross-review files for this iteration directly: ${paths} ` +
      `(equivalently, all CROSS-REVIEW-*-v${iteration}.md files for this document type in docs/${feature}/). ` +
      `Address every High and Medium finding in them.`;
  }

  // Phase T: fold the DECISIONS_WARRANTED signal into the convergence loop so no
  // separate post-PASS agent session is needed. The last optimizer result carries
  // the trailer; if the loop converges on iteration 1 the creator result carries it.
  if (phase === "T") {
    return `${base}${feedback}\n${decisionsWarrantedTrailerRequirement()}`;
  }
  return `${base}${feedback}`;
}

/**
 * Cheap trailer recovery for a reviewer whose VERDICT trailer was missing or
 * malformed. Re-asks the same reviewer — on Haiku — to re-emit ONLY the two
 * trailer lines from its own prior output (no re-review). Returns the re-parsed
 * verdict if it now parses cleanly, else null so the caller keeps the original
 * Needs-revision fallback and proceeds to the optimizer.
 *
 * @param {object} params
 * @param {string} params.reviewer - reviewer skill id
 * @param {string|null|undefined} params.rawResult - the reviewer's original output
 * @param {function} params._agent - injected agent function
 * @returns {Promise<{verdict: string, high: number, medium: number, low: number}|null>}
 */
async function recoverVerdict({ reviewer, rawResult, _agent = agent }) {
  const recoveryPrompt =
    `Your previous review response did not end with a machine-readable VERDICT trailer. ` +
    `Do not redo the review. Based ONLY on the text below (your own previous output), ` +
    `re-emit exactly the two trailer lines and nothing else:\n` +
    `VERDICT: <Approved | Approved with minor changes | Needs revision>\n` +
    `{"high": N, "medium": N, "low": N}\n\n` +
    `--- previous output ---\n${rawResult ?? ""}`;

  const recovered = await _agent(reviewer, recoveryPrompt, { model: "haiku" });
  const parsed = parseVerdict(recovered, reviewer);
  return parsed.malformed ? null : parsed;
}

/**
 * The DECISIONS_WARRANTED trailer requirement appended to the Phase T creator and
 * optimizer prompts (formerly the body of the standalone post-PASS TSPEC session).
 * @returns {string}
 */
function decisionsWarrantedTrailerRequirement() {
  return (
    `End your final message with:\n` +
    `DECISIONS_WARRANTED: true if load-bearing architectural alternatives were weighed and rejected during the TSPEC review; ` +
    `DECISIONS_WARRANTED: false if this is a trivial feature with no real alternatives considered.`
  );
}

function creatorPrompt(phase, featureName, inputs) {
  const dispatch = PHASE_DISPATCH[phase];
  return `Create ${dispatch.creatorOutputPath.replace(/\{feature\}/g, featureName)} for feature ${featureName}. Input documents: ${inputs.join(", ")}. Commit and push.`;
}

function implementPrompt(task, featureName) {
  return (
    `Implement task ${task.id}: ${task.description}\n` +
    `Feature: ${featureName}\n` +
    `TSPEC: docs/${featureName}/TSPEC-${featureName}.md\n` +
    `PROPERTIES: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `Dependencies completed: ${task.dependencies.join(", ") || "none"}\n` +
    `Follow TDD. Run tests. Commit and push.`
  );
}

function propertiesTestPrompt(featureName) {
  return (
    `Implement PROPERTIES tests for feature ${featureName}.\n` +
    `Read: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `For each property without a corresponding test, write it using TDD at the specified test level.\n` +
    `Run the full test suite. All tests must pass before committing. Commit and push.`
  );
}

function harvestPrompt(featureName) {
  return (
    `Harvest learnings for feature ${featureName}:\n` +
    `1. Read all CROSS-REVIEW-*.md and CODE_REVIEW-*.md files (every doc type, every -vN suffix) for docs/${featureName}/.\n` +
    `2. Read all POSTMORTEM-*.md files for docs/${featureName}/ (if any).\n` +
    `3. Write docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `4. Commit and push LEARNINGS before any delete operation.\n` +
    `5. Only after the LEARNINGS commit is confirmed on remote, delete the harvested CROSS-REVIEW-* and CODE_REVIEW-* files.\n` +
    `6. Commit and push the deletions.`
  );
}

// ─── TSPEC-SHIP: PR-raise + CI-verify (Phase PUB) ─────────────────────────────

function createPrPrompt(featureName) {
  return (
    `Raise a pull request for feature ${featureName}. ` +
    `The branch was already rebased onto the latest default branch in Phase DOD — do NOT rebase again.\n` +
    `1. Push the branch if needed: git push origin feat-${featureName}.\n` +
    `2. Open a pull request from feat-${featureName} into the default branch. ` +
    `If a PR is already open for this branch, reuse it — do not open a duplicate.\n` +
    `3. Base the PR title and description on the feature's REQ/FSPEC.\n` +
    `Do NOT merge the PR. End your final message with this trailer as the last line:\n` +
    `PR_URL: <the full https URL of the pull request>\n` +
    `If the PR could not be created, end with:\n` +
    `PR_URL: none`
  );
}

// ─── DOD rebase: ship-pr rebases feat-{feature} onto the latest default branch ─
function rebasePrompt(featureName) {
  return (
    `Rebase the feature branch onto the latest default branch for feature ${featureName}.\n` +
    `1. Fetch the latest default branch from remote: git fetch origin <default-branch>.\n` +
    `2. Rebase feat-${featureName} onto origin/<default-branch>: git rebase origin/<default-branch>.\n` +
    `   If the rebase conflicts, abort it (git rebase --abort) and report the conflict.\n` +
    `3. If the rebase succeeded, force-push the rebased branch: git push --force-with-lease origin feat-${featureName}.\n` +
    `Do NOT open a pull request. End your final message with exactly one trailer line:\n` +
    `REBASE_STATUS: clean     — rebase succeeded (or branch already current) and was pushed\n` +
    `REBASE_STATUS: conflict  — rebase produced conflicts; aborted, branch left unchanged`
  );
}

/**
 * Query the current GitHub Actions check status for a PR directly via the `gh`
 * CLI — no agent needed for a mechanical status read. Uses the same
 * execSync-with-injectable-execFn pattern as mergeWorktree.
 *
 * Maps `gh pr view <url> --json statusCheckRollup` to exactly one of:
 *   "none"    — the rollup array is empty/absent (no checks registered yet)
 *   "pending" — at least one check has not completed yet
 *   "passed"  — all completed and every conclusion is a success (SUCCESS/NEUTRAL/SKIPPED)
 *   "failed"  — at least one completed check has a failure/error conclusion
 *   "unknown" — exec threw or the JSON was unparseable
 *
 * @param {string} prUrl
 * @param {{ execFn?: function }} [opts] - injection point for tests (override execSync)
 * @returns {Promise<"none" | "pending" | "passed" | "failed" | "unknown">}
 */
async function checkPrCi(prUrl, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  let raw;
  try {
    raw = exec(`gh pr view ${prUrl} --json statusCheckRollup`, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch {
    return "unknown";
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return "unknown";
  }

  const rollup = parsed && parsed.statusCheckRollup;
  if (!Array.isArray(rollup) || rollup.length === 0) {
    return "none";
  }

  let anyPending = false;
  let anyFailure = false;
  let allSuccess = true;
  for (const check of rollup) {
    const state = classifyCheckRollupEntry(check);
    if (state === "pending") anyPending = true;
    if (state === "failure") anyFailure = true;
    if (state !== "success") allSuccess = false;
  }

  if (anyPending) return "pending";
  if (anyFailure) return "failed";
  if (allSuccess) return "passed";
  return "unknown";
}

/**
 * Classify a single statusCheckRollup entry (CheckRun or StatusContext).
 * @param {object} check
 * @returns {"pending" | "success" | "failure" | "other"}
 */
function classifyCheckRollupEntry(check) {
  const SUCCESS = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
  const FAILURE = new Set([
    "FAILURE",
    "ERROR",
    "CANCELLED",
    "TIMED_OUT",
    "ACTION_REQUIRED",
    "STARTUP_FAILURE",
  ]);

  if (check && typeof check.status === "string") {
    // CheckRun: status is QUEUED/IN_PROGRESS/COMPLETED, conclusion is set once done.
    if (check.status.toUpperCase() !== "COMPLETED") return "pending";
    const conclusion = (check.conclusion || "").toUpperCase();
    if (FAILURE.has(conclusion)) return "failure";
    if (SUCCESS.has(conclusion)) return "success";
    return "other";
  }

  if (check && typeof check.state === "string") {
    // StatusContext: legacy commit-status API.
    const st = check.state.toUpperCase();
    if (st === "PENDING" || st === "EXPECTED") return "pending";
    if (st === "SUCCESS") return "success";
    if (st === "FAILURE" || st === "ERROR") return "failure";
    return "other";
  }

  return "other";
}

/**
 * Extract the PR URL from a ship-pr create result's trailer.
 * @param {string | null | undefined} result
 * @returns {string | null}  the URL, or null if absent / "none"
 */
function parsePrUrl(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return null;
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("PR_URL: ")) {
      const value = trimmed.slice("PR_URL: ".length).trim();
      if (value === "" || value.toLowerCase() === "none") return null;
      return value;
    }
  }
  return null;
}

/**
 * Extract the REBASE_STATUS from a ship-pr rebase result's trailer (Phase DOD step 0).
 * @param {string | null | undefined} result
 * @returns {"clean" | "conflict" | "unknown"}
 */
function parseRebaseStatus(result) {
  const VALID = ["clean", "conflict"];
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return "unknown";
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("REBASE_STATUS: ")) {
      const token = trimmed
        .slice("REBASE_STATUS: ".length)
        .trim()
        .toLowerCase()
        .split(/\s/)[0];
      return VALID.includes(token) ? token : "unknown";
    }
  }
  return "unknown";
}

// ─── DOD-03: parseDodStatus ──────────────────────────────────────────────────

/**
 * Extract DOD_STATUS from a dod-verify agent result string.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {{ status: "passed" | "failed" | "unknown", stubs: number, mock_data: number, unwired_integrations: number, coverage_below_threshold: boolean, branch_coverage_pct: number, req_gaps: number, boundary_gaps: number }}
 */
function parseDodStatus(result) {
  const fallback = {
    status: "unknown",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");

  let statusLine = null;
  let statusLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("DOD_STATUS: ")) {
      statusLine = trimmed;
      statusLineIndex = i;
      break;
    }
  }

  if (statusLine === null) {
    return fallback;
  }

  const rawStatus = statusLine.slice("DOD_STATUS: ".length).trim().toLowerCase();

  if (rawStatus === "passed") {
    return {
      status: "passed",
      stubs: 0,
      mock_data: 0,
      unwired_integrations: 0,
      coverage_below_threshold: false,
      branch_coverage_pct: 100,
      req_gaps: 0,
      boundary_gaps: 0,
    };
  }

  if (rawStatus !== "failed") {
    return fallback;
  }

  // Find next non-empty line after the DOD_STATUS line
  let nextNonEmpty = null;
  for (let j = statusLineIndex + 1; j < lines.length; j++) {
    if (lines[j].trim() !== "") {
      nextNonEmpty = lines[j].trim();
      break;
    }
  }

  const failedZeros = {
    status: "failed",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (nextNonEmpty === null) {
    return failedZeros;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    return failedZeros;
  }

  return {
    status: "failed",
    stubs: Number.isInteger(parsed.stubs) && parsed.stubs >= 0 ? parsed.stubs : 0,
    mock_data: Number.isInteger(parsed.mock_data) && parsed.mock_data >= 0 ? parsed.mock_data : 0,
    unwired_integrations: Number.isInteger(parsed.unwired_integrations) && parsed.unwired_integrations >= 0 ? parsed.unwired_integrations : 0,
    coverage_below_threshold: parsed.coverage_below_threshold === true,
    branch_coverage_pct: typeof parsed.branch_coverage_pct === "number" && parsed.branch_coverage_pct >= 0 ? parsed.branch_coverage_pct : 0,
    req_gaps: Number.isInteger(parsed.req_gaps) && parsed.req_gaps >= 0 ? parsed.req_gaps : 0,
    boundary_gaps: Number.isInteger(parsed.boundary_gaps) && parsed.boundary_gaps >= 0 ? parsed.boundary_gaps : 0,
  };
}

// ─── DOD-04: dodVerifyLoop ───────────────────────────────────────────────────

function dodVerifyPrompt(featureName, version) {
  // Round ≥2 is a delta re-verify after remediation — verify each prior finding is
  // fixed and scan only the remediation diff, instead of re-running the full scan.
  if (version >= 2) {
    return dodReVerifyPrompt(featureName, version);
  }
  return (
    `Challenge the Definition of Done for feature ${featureName} (review version v${version}). ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read the specs first (before touching any code):\n` +
    `  docs/${featureName}/REQ-${featureName}.md — acceptance criteria and success conditions\n` +
    `  docs/${featureName}/FSPEC-${featureName}.md — functional requirements, user flows, error cases\n` +
    `  docs/${featureName}/PROPERTIES-${featureName}.md — testable system properties\n` +
    `Build a checklist of every acceptance criterion, requirement, error case, and property.\n` +
    `\n` +
    `Step 2 — Scan production code (non-test files changed by this feature via git diff --name-only) for:\n` +
    `1. Stubs, TODOs, placeholders, NotImplementedError in production code (read function bodies, not signatures)\n` +
    `2. Unwired integrations — unused imports, dead config, placeholder URLs (trace request-to-response paths)\n` +
    `3. Mock/fake data in production code — hardcoded test data, mock variables outside test files\n` +
    `4. Branch coverage ≥85% for all new modules with property-based tests for parameterisable components\n` +
    `5. Requirements delivered — for each checklist item: trace it to a production code path AND a test that ` +
    `would fail if the implementation broke. Trace to the FINAL operator-visible artifact (after any ` +
    `entry-point re-render/overwrite), not the node/builder output; enumerate all writers of the traced ` +
    `output (grep the filename/key) and confirm no later writer clobbers the AC value without a test pinning ` +
    `the final artifact. Missing either one is a gap (req_gaps count). ` +
    `An assertion-free test does not count. A stub-backed test does not count.\n` +
    `6. Integration-boundary integrity (boundary_gaps count) — two checks:\n` +
    `   (a) Adjacent-surface falsification: does the diff make any existing artifact, disclosure string, ` +
    `comment, config default, or doc claim FALSE? For every output file the feature writes, grep for other ` +
    `writers of the same file/key and check for a later overwrite. When the feature touches one member of a ` +
    `same-shape family (one tools/get_* among several, one writer of a multi-writer artifact), enumerate the ` +
    `family and require each sibling covered or explicitly out-of-scope in the REQ.\n` +
    `   (b) Deferral binding: every deferral this feature introduces or leaves in place must name a successor ` +
    `that exists as a queue row (docs/_queue/QUEUE.md) or a named successor REQ file in docs/. A runbook step, ` +
    `operator config, or bare prose mention is NOT a successor.\n` +
    `\n` +
    `Document every finding (all six criteria) with a Scope tag (Local | Cross-Feature | Process) in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — include a §2 Requirements Traceability ` +
    `table listing every criterion with implementation path, test path, and Gap? column. ` +
    `Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

/**
 * Round ≥2 (v2, v3…) delta re-verify prompt. After remediation, the previous
 * round's CODE_REVIEW findings and the remediation diff are the only things worth
 * re-reading — the rest of the tree was already verified. The evidence bar and the
 * DOD_STATUS trailer contract are unchanged from v1.
 */
function dodReVerifyPrompt(featureName, version) {
  const prev = version - 1;
  return (
    `This is re-verification round v${version} after remediation for feature ${featureName}. ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read docs/${featureName}/CODE_REVIEW-${featureName}-v${prev}.md. For EACH finding in it, ` +
    `verify remediation: trace the fix to a production code path AND a test that would fail if the fix broke. ` +
    `An assertion-free or stub-backed test does not count as remediation.\n` +
    `\n` +
    `Step 2 — Run \`git diff\` covering the remediation commits since v${prev} and scan ONLY that diff for new ` +
    `stubs, mock data, unwired integrations, integration-boundary gaps (adjacent surfaces the fixes silently ` +
    `falsify), or regressions introduced by the fixes. Do NOT re-scan unchanged ` +
    `code you already verified in the previous round.\n` +
    `\n` +
    `Carry the §2 Requirements Traceability table forward from v${prev}, updating only the rows affected by the ` +
    `remediation (update the Gap? column). Document the result in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md with Scope tags (Local | Cross-Feature | Process) ` +
    `as before. Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `DOD_STATUS: passed only when every prior finding is verified remediated AND the remediation diff is clean. ` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

function dodRemediatePrompt(featureName, version) {
  return (
    `Address every finding in the Definition of Done code review for feature ${featureName}.\n` +
    `1. Read docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — the latest DoD review.\n` +
    `2. Fix every finding via strict TDD: write or update the failing test first, then the minimum production code. ` +
    `Derive correct behavior from the TSPEC/FSPEC/PROPERTIES (REQ for intent).\n` +
    `3. Run the full test suite with branch coverage. All tests must pass.\n` +
    `4. Commit and push the fixes. Do NOT edit the CODE_REVIEW file.`
  );
}

/**
 * Phase DOD step 0: rebase the feature branch onto the latest default branch so the
 * DoD scan (and the subsequent PR) sees the real merge state. Delegated to ship-pr.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @returns {Promise<"clean" | "conflict" | "unknown">}
 */
async function rebaseOntoDefault({ feature, _agent = agent, _log = log }) {
  _log(`Rebasing feat-${feature} onto the latest default branch`);
  const result = await _agent("ship-pr", rebasePrompt(feature));
  return parseRebaseStatus(result);
}

/**
 * Phase DOD: verify the Definition of Done, then dispatch remediation, then re-verify.
 * dod-verify is the evaluator — it documents findings in a versioned CODE_REVIEW file
 * but does not fix them. se-implement is the optimizer — it addresses the findings via
 * TDD. The loop alternates verify → remediate → verify, capped at DOD_MAX_ITERATIONS.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {number} [params.maxIterations]
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @returns {Promise<{ passed: boolean, iterations: number, lastStatus?: object }>}
 */
async function dodVerifyLoop({
  feature,
  maxIterations = DOD_MAX_ITERATIONS,
  _agent = agent,
  _log = log,
}) {
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    _log(`DoD verification — iteration ${iteration}`);

    const verifyResult = await _agent(
      "dod-verify",
      dodVerifyPrompt(feature, iteration)
    );
    const status = parseDodStatus(verifyResult);

    if (status.status === "passed") {
      _log("DoD verification passed");
      return { passed: true, iterations: iteration };
    }

    if (status.status === "unknown") {
      _log("WARNING: dod-verify returned no DOD_STATUS — treating as failed");
    }

    _log(
      `DoD findings recorded in CODE_REVIEW-${feature}-v${iteration}: ` +
      `stubs=${status.stubs}, mock_data=${status.mock_data}, ` +
      `unwired=${status.unwired_integrations}, coverage_gap=${status.coverage_below_threshold} ` +
      `(branch_coverage=${status.branch_coverage_pct}%), req_gaps=${status.req_gaps}, ` +
      `boundary_gaps=${status.boundary_gaps}`
    );

    if (iteration === maxIterations) {
      return { passed: false, iterations: iteration, lastStatus: status };
    }

    // Dispatch remediation: se-implement addresses the findings recorded in this
    // version's CODE_REVIEW file, then the next iteration re-verifies.
    _log(`Dispatching remediation for CODE_REVIEW-${feature}-v${iteration}`);
    await _agent("se-implement", dodRemediatePrompt(feature, iteration));
  }

  // Should not reach here, but guard
  return { passed: false, iterations: maxIterations };
}

/**
 * Phase PUB: raise (or reuse) the PR for the feature branch, then poll GHA checks
 * until they pass, fail, or the no-checks window expires. The poll-timing logic
 * lives here (in the script), not in the agent — the agent only reports the
 * current state. Returns the PR URL and the resolved CI status.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._checkCi] - (prUrl) => Promise<ci status>; injectable for tests
 * @param {function} [params._log]
 * @param {function} [params._now]   - clock (ms); injectable for tests
 * @param {function} [params._sleep] - async sleep(ms); injectable for tests
 * @param {number} [params.noChecksTimeoutMs]
 * @param {number} [params.pollIntervalMs]
 * @param {number} [params.completionTimeoutMs]
 * @returns {Promise<{ prUrl: string, ciStatus: "passed" | "no-checks" }>}
 */
async function raisePrAndVerifyCi({
  feature,
  _agent = agent,
  _checkCi = checkPrCi,
  _log = log,
  _now = () => Date.now(),
  _sleep = sleep,
  noChecksTimeoutMs = CI_NO_CHECKS_TIMEOUT_MS,
  pollIntervalMs = CI_POLL_INTERVAL_MS,
  completionTimeoutMs = CI_COMPLETION_TIMEOUT_MS,
}) {
  // 1. Create (or reuse) the PR. The branch was already rebased onto the latest
  //    default branch in Phase DOD, so ship-pr does not rebase here.
  const prResult = await _agent("ship-pr", createPrPrompt(feature));

  const prUrl = parsePrUrl(prResult);
  if (!prUrl) {
    throw haltError(
      `Error: Phase PUB — PR creation failed for feature ${feature} (no PR_URL returned)`
    );
  }
  _log(`PR raised: ${prUrl}`);

  // 2. Poll GHA checks directly via `gh`. The script owns the cadence and the
  //    timeouts; the poll itself is a mechanical status read, not an agent turn.
  const start = _now();
  let completionStart = null;
  while (true) {
    const status = await _checkCi(prUrl);

    if (status === "passed") {
      _log(`GHA checks passed for PR ${prUrl}`);
      return { prUrl, ciStatus: "passed" };
    }
    if (status === "failed") {
      throw haltError(`Error: Phase PUB — GHA checks failed for PR ${prUrl}`);
    }
    if (status === "pending" && completionStart === null) {
      // First time checks register — start the completion budget from here so
      // slow-registering checks get a full window regardless of registration latency.
      completionStart = _now();
    }

    if (completionStart !== null) {
      // Checks are registered and running — wait for completion up to the overall
      // cap, measured from when checks first appeared (not from PR-raise).
      if (_now() - completionStart >= completionTimeoutMs) {
        throw haltError(
          `Error: Phase PUB — GHA checks did not complete within ` +
            `${Math.round(completionTimeoutMs / 60000)} minutes for PR ${prUrl}`
        );
      }
    } else if (_now() - start >= noChecksTimeoutMs) {
      // No checks ever appeared (status none/unknown) within the window —
      // assume the repo has no PR checks configured and treat the phase as a pass.
      _log(
        `No GHA checks detected within ${Math.round(
          noChecksTimeoutMs / 60000
        )} minutes — assuming repo has no PR checks configured`
      );
      return { prUrl, ciStatus: "no-checks" };
    }

    await _sleep(pollIntervalMs);
  }
}

// ─── TSPEC-IMPL-06: Per-batch test gate helpers ───────────────────────────────

/**
 * Evaluates whether a batch of se-implement agents all passed their tests.
 * @param {Array<string|null>} results - Array of agent results
 * @param {number} batchIndex - Zero-based batch index
 * @param {Array<{id: string}>} batch - Array of task objects
 * @throws {Error} halt error if any test failed
 */
function evaluateBatchGate(results, batchIndex, batch) {
  const batchNum = batchIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = batch[i];

    // Rule 1: empty-result check
    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Batch ${batchNum} agent returned empty result — treating as failure`
      );
    }

    // Rule 2: failure marker scan
    if (/Tests: \d+ failed/.test(result)) {
      const match = result.match(/Tests: (\d+) failed/);
      const count = match ? match[1] : "?";
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — Tests: ${count} failed`
      );
    }

    if (result.toLowerCase().includes("non-zero exit")) {
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — non-zero exit detected`
      );
    }
  }

  log(`Batch ${batchNum} complete — all tests passing`);
}

/**
 * Evaluates whether a single-agent phase passed its tests.
 * @param {string|null} agentResult - The agent result string
 * @param {string} phaseName - Phase name for error messages (e.g. "PT")
 * @returns {{ passed: boolean, reason?: string }}
 */
function evaluateSingleAgentGate(agentResult, phaseName) {
  // Rule 1: empty-result check
  if (
    agentResult == null ||
    (typeof agentResult === "string" && agentResult.trim() === "")
  ) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} agent returned empty result — treating as failure`,
    };
  }

  // Rule 2: failure marker scan
  if (/Tests: \d+ failed/.test(agentResult)) {
    const match = agentResult.match(/Tests: (\d+) failed/);
    const count = match ? match[1] : "?";
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — Tests: ${count} failed`,
    };
  }

  if (agentResult.toLowerCase().includes("non-zero exit")) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — non-zero exit detected`,
    };
  }

  return { passed: true };
}

// ─── Topological batching ─────────────────────────────────────────────────────

/**
 * Compute topological batches from task array (TSPEC-IMPL-02).
 * @param {Array<{id: string, dependencies: string[], planBatch: number}>} tasks
 * @returns {Array<Array<{id: string, dependencies: string[], planBatch: number}>>}
 */
function computeTopologicalBatches(tasks) {
  const completed = new Set();
  const batches = [];
  let maxCompletedBatch = -1;

  while (completed.size < tasks.length) {
    const ready = tasks.filter(
      (t) =>
        !completed.has(t.id) && t.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0 && completed.size < tasks.length) {
      throw haltError(
        "Error: PLAN dependency graph contains a cycle — cannot compute topological batches"
      );
    }

    if (ready.length === 0) break;

    // Detect PLAN batch label inconsistency
    const inconsistent = ready.some(
      (t) => t.planBatch !== undefined && t.planBatch <= maxCompletedBatch
    );
    if (inconsistent) {
      log(
        "WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches"
      );
    }

    // Sort by original array index (document order)
    ready.sort(
      (a, b) =>
        tasks.findIndex((t) => t.id === a.id) -
        tasks.findIndex((t) => t.id === b.id)
    );

    // Split into sub-batches of at most 5
    for (let i = 0; i < ready.length; i += 5) {
      batches.push(ready.slice(i, i + 5));
    }

    for (const t of ready) {
      completed.add(t.id);
      if (t.planBatch !== undefined && t.planBatch > maxCompletedBatch) {
        maxCompletedBatch = t.planBatch;
      }
    }
  }

  return batches;
}

// ─── Runtime API stubs (replaced by real runtime in production) ───────────────

/* These are no-op stubs for the module-level functions that the real Claude Code
   runtime provides. Tests override them via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  // Provided by runtime
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
async function parallel(promises) {
  return Promise.all(promises);
}

// eslint-disable-next-line no-unused-vars
async function pipeline(label, fn) {
  return fn();
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  // In tests this is overridden; in production it's the runtime log
  if (typeof console !== "undefined") {
    console.log("[orchestrate-dev]", message);
  }
}

// Real wall-clock sleep used by Phase PUB's poll loop. Injectable in tests via _sleep.
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Default file read — real fs, returns null on any error (mirrors orchestrate-queue's
// defaultReadFile). Injectable in tests via _readFile. Used for PLAN DAG parsing.
function defaultReadFile(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

// ─── TSPEC §3.2 — the listing seam's Node default ─────────────────────────────

/**
 * List a directory's file basenames. Never throws: every failure is reported as
 * `{ ok: false, reason }` with `reason` drawn from the closed LIST_FAILURES
 * catalogue (§4.2). Non-recursive; directories are excluded; basenames only, so
 * parseReviewFilename's anchored grammar sees what it expects.
 *
 * The `{ fsMod = fs }` second-argument idiom is copied from checkFileNonEmpty so
 * the two file-touching Node defaults are tested the same way.
 *
 * @param {string} dirPath - repo-relative directory path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true, files: string[] } | { ok: false, reason: string }}
 */
function defaultListFiles(dirPath, { fsMod = fs } = {}) {
  if (typeof dirPath !== "string" || dirPath.trim() === "") {
    return { ok: false, reason: "bad_argument" };
  }
  try {
    const entries = fsMod.readdirSync(dirPath, { withFileTypes: true });
    return {
      ok: true,
      files: entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => entry.name),
    };
  } catch (err) {
    const code = err && err.code;
    if (code === "ENOENT") return { ok: false, reason: "dir_missing" };
    if (code === "ENOTDIR") return { ok: false, reason: "not_a_directory" };
    return { ok: false, reason: "unreadable" };
  }
}

// ─── TSPEC §3.3 — the two write seams' Node defaults ──────────────────────────

/**
 * Write a file, replacing its contents entirely. Throws on failure — deliberately
 * the exception to §3.2's never-throw rule: a failed write is not a condition a
 * caller can meaningfully continue past, and defaultReadFile / checkFileNonEmpty
 * already establish throw-on-IO-failure as this module's idiom. Callers wrap it
 * where FSPEC prescribes a specific halt.
 *
 * @param {string} path
 * @param {string} contents
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
function defaultWriteFile(path, contents, { fsMod = fs } = {}) {
  fsMod.writeFileSync(path, contents, "utf8");
}

/**
 * Append text to a file. APPEND-SHAPED, NEVER A WHOLE-FILE REWRITE (FSPEC §7.4):
 * a read-modify-write would re-emit the reviewer's prose, and any divergence
 * between what was read and what was written would silently rewrite a
 * cross-review file. Hence appendFileSync, not writeFileSync(existing + text).
 * Throws on failure, for the same reason defaultWriteFile does.
 *
 * @param {string} path
 * @param {string} text
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
function defaultAppendFile(path, text, { fsMod = fs } = {}) {
  fsMod.appendFileSync(path, text, "utf8");
}

// ─── TSPEC §3.4 — the transport seam's Node default ───────────────────────────

/**
 * Run a git command. The caller branches on `ok`; the seam interprets nothing.
 * Never throws. `argv` is an array, not a command string: a string would need
 * quoting rules at the seam boundary and would make a feature name containing a
 * space a shell-injection surface. The `{ execFn }` injection point mirrors
 * mergeWorktree, which resolves child_process's execSync the same way.
 *
 * @param {string[]} argv - git arguments, NOT including the leading "git"
 * @param {{ execFn?: function }} [opts] - injection point for tests
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec =
    execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));

  const args = Array.isArray(argv) ? argv : [];
  const execOpts = { stdio: "pipe", encoding: "utf8" };

  try {
    const stdout = exec("git", args, execOpts);
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: String((err && err.stdout) ?? ""),
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

// ─── TSPEC §3.5 — the queue-row seam's Node default ───────────────────────────

/**
 * Record a halt against the feature's queue row. The default is a NO-OP that
 * reports "none": a unit test, or a direct invocation in a repo with no queue,
 * has no row to write and must not fail for it.
 *
 * The seam exists to preserve the dependency direction — row location and row
 * writing stay in orchestrate-queue.js; orchestrate-dev.js never learns the
 * queue's table grammar. orchestrate-queue's _runPipeline and the dev bundle's
 * DEV_ENTRY supply the real closures.
 *
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 */
async function defaultRecordHalt(/* { feature, status } */) {
  return { queueRow: "none" };
}

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _checkFile?: function, _readFile?: function, _phase?: function, _pipeline?: function }} params
 * @returns {Promise<FinalReport>}
 */
async function main({
  reqPath,
  forcePhases = null,
  _agent: rawAgentFn = agent,
  _parallel: parallelFn = parallel,
  _log: logFn = log,
  _checkFile: checkFileFn = checkFileNonEmpty,
  _readFile: readFileFn = defaultReadFile,
  _phase: phaseFn = phase,
  _pipeline: pipelineFn = pipeline,
  _mergeWorktree: mergeWorktreeFn = mergeWorktree,
  _rebaseOntoDefault: rebaseOntoDefaultFn = rebaseOntoDefault,
  _dodVerifyLoop: dodVerifyLoopFn = dodVerifyLoop,
  _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
  _checkCi: checkCiFn = checkPrCi,
  _phaseDodEnabled: phaseDodEnabled = PHASE_DOD_ENABLED,
  _phasePubEnabled: phasePubEnabled = PHASE_PUB_ENABLED,
  _now,
  _sleep,
  _listFiles: listFilesFn = defaultListFiles,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _git: gitFn = defaultGit,
  _recordHalt: recordHaltFn = defaultRecordHalt,
} = {}) {
  // Override module-level log for injection
  const emit = logFn;

  // MODEL-01: pin every agent call to Opus by default. Phase I overrides this to
  // Sonnet at its dispatch site. An explicit opts.model always wins over the default,
  // so downstream helpers (reviewLoop, dodVerifyLoop, ship/rebase, harvest) inherit Opus.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts });

  const phases = [];
  let haltReason;

  function recordPhase(phaseId, label, status, detail, iterations) {
    phases.push({
      phase: phaseId,
      label,
      status,
      ...(iterations !== undefined ? { iterations } : {}),
      ...(detail ? { detail } : {}),
    });
  }

  // ─── TSPEC-ENTRY-01: REQ path validation ─────────────────────────────────

  if (!reqPath || reqPath.trim() === "") {
    haltReason = `Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const PATTERN = /^docs\/([^/]+)\/REQ-\1\.md$/;
  const match = PATTERN.exec(reqPath);
  if (!match) {
    haltReason = `Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: ${reqPath}`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const featureName = match[1];

  // ─── TSPEC-ENTRY-03: deterministic REQ file existence check ───────────────

  const reqCheck = await checkFileFn(reqPath);

  if (!reqCheck.ok) {
    if (reqCheck.reason === "file_empty") {
      haltReason = `Error: REQ file at ${reqPath} is empty`;
    } else {
      haltReason = `Error: REQ file not found at ${reqPath}`;
    }
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  const artifactPaths = [reqPath];
  let testSummary = "Not run";
  let harvestStatus = "Not run";
  let prUrl;
  let ciStatus;

  try {
    await pipelineFn("PDLC Pipeline", async () => {
      // ─── Phase R: REQ Cross-Review ───────────────────────────────────────
      phaseFn("Phase R: REQ Cross-Review");
      const rLoop = await reviewLoop({
        doc: reqPath,
        phase: "R",
        reviewers: PHASE_DISPATCH.R.reviewers,
        optimizer: PHASE_DISPATCH.R.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(rLoop, "R", PHASE_DISPATCH.R.label, recordPhase);
      recordPhase("R", PHASE_DISPATCH.R.label, "✅", `Approved (${rLoop.iterations} iteration${rLoop.iterations !== 1 ? "s" : ""})`, rLoop.iterations);

      // ─── Phase F: FSPEC Creation + Review ───────────────────────────────
      phaseFn("Phase F: FSPEC Creation + Review");
      const fspecPath = `docs/${featureName}/FSPEC-${featureName}.md`;
      const fCreatorResult = await agentFn(
        PHASE_DISPATCH.F.creator,
        creatorPrompt("F", featureName, PHASE_DISPATCH.F.creatorInputs)
      );
      if (!fCreatorResult || fCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.F.creator} failed to produce ${fspecPath} for phase F`
        );
      }
      artifactPaths.push(fspecPath);
      const fLoop = await reviewLoop({
        doc: fspecPath,
        phase: "F",
        reviewers: PHASE_DISPATCH.F.reviewers,
        optimizer: PHASE_DISPATCH.F.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(fLoop, "F", PHASE_DISPATCH.F.label, recordPhase);
      recordPhase("F", PHASE_DISPATCH.F.label, "✅", `Approved (${fLoop.iterations} iterations)`, fLoop.iterations);

      // ─── Phase T: TSPEC Creation + Review ───────────────────────────────
      phaseFn("Phase T: TSPEC Creation + Review");
      const tspecPath = `docs/${featureName}/TSPEC-${featureName}.md`;
      const tCreatorResult = await agentFn(
        PHASE_DISPATCH.T.creator,
        `${creatorPrompt("T", featureName, PHASE_DISPATCH.T.creatorInputs)}\n${decisionsWarrantedTrailerRequirement()}`
      );
      if (!tCreatorResult || tCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.T.creator} failed to produce ${tspecPath} for phase T`
        );
      }
      artifactPaths.push(tspecPath);
      const tLoop = await reviewLoop({
        doc: tspecPath,
        phase: "T",
        reviewers: PHASE_DISPATCH.T.reviewers,
        optimizer: PHASE_DISPATCH.T.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(tLoop, "T", PHASE_DISPATCH.T.label, recordPhase);
      recordPhase("T", PHASE_DISPATCH.T.label, "✅", `Approved (${tLoop.iterations} iterations)`, tLoop.iterations);

      // ─── TSPEC-DECISIONS-01: DECISIONS_WARRANTED read from Phase T ─────────
      // The trailer requirement is appended to the Phase T creator and optimizer
      // prompts, so its answer arrives inside the convergence loop — no separate
      // post-PASS agent session. The last optimizer result carries it; if the loop
      // converged on iteration 1 (no optimizer run) the creator result does.
      const decisionsWarranted = parseDecisionsWarranted(
        tLoop.lastOptimizerResult ?? tCreatorResult
      );

      // ─── Phase D: DECISIONS (conditional) ───────────────────────────────
      let decisionsPath = null;
      if (!decisionsWarranted) {
        phaseFn("Phase D: ⏭ Skipped");
        emit("Phase D skipped — no load-bearing alternatives");
        recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives");
      } else {
        phaseFn("Phase D: DECISIONS Creation + Review");
        decisionsPath = `docs/${featureName}/DECISIONS-${featureName}.md`;
        const dCreatorResult = await agentFn(
          PHASE_DISPATCH.D.creator,
          creatorPrompt("D", featureName, PHASE_DISPATCH.D.creatorInputs)
        );
        if (!dCreatorResult || dCreatorResult.trim() === "") {
          throw haltError(
            `Error: creator agent ${PHASE_DISPATCH.D.creator} failed to produce ${decisionsPath} for phase D`
          );
        }
        artifactPaths.push(decisionsPath);
        const dLoop = await reviewLoop({
          doc: decisionsPath,
          phase: "D",
          reviewers: PHASE_DISPATCH.D.reviewers,
          optimizer: PHASE_DISPATCH.D.optimizer,
          feature: featureName,
          _agent: agentFn,
          _parallel: parallelFn,
          _checkFile: checkFileFn,
        });
        checkConverged(dLoop, "D", PHASE_DISPATCH.D.label, recordPhase);
        recordPhase("D", PHASE_DISPATCH.D.label, "✅", `Approved (${dLoop.iterations} iterations)`, dLoop.iterations);
      }

      // ─── Phase P: PLAN Creation + Review ────────────────────────────────
      phaseFn("Phase P: PLAN Creation + Review");
      const planPath = `docs/${featureName}/PLAN-${featureName}.md`;
      const pInputs = [...PHASE_DISPATCH.P.creatorInputs.filter(i => i !== "DECISIONS?")];
      if (decisionsPath) pInputs.push("DECISIONS");
      const pCreatorResult = await agentFn(
        PHASE_DISPATCH.P.creator,
        creatorPrompt("P", featureName, pInputs)
      );
      if (!pCreatorResult || pCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.P.creator} failed to produce ${planPath} for phase P`
        );
      }
      artifactPaths.push(planPath);
      const pLoop = await reviewLoop({
        doc: planPath,
        phase: "P",
        reviewers: PHASE_DISPATCH.P.reviewers,
        optimizer: PHASE_DISPATCH.P.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(pLoop, "P", PHASE_DISPATCH.P.label, recordPhase);
      recordPhase("P", PHASE_DISPATCH.P.label, "✅", `Approved (${pLoop.iterations} iterations)`, pLoop.iterations);

      // ─── Phase PR: PROPERTIES Creation + Review ──────────────────────────
      phaseFn("Phase PR: PROPERTIES Creation + Review");
      const propertiesPath = `docs/${featureName}/PROPERTIES-${featureName}.md`;
      const prCreatorResult = await agentFn(
        PHASE_DISPATCH.PR.creator,
        creatorPrompt("PR", featureName, PHASE_DISPATCH.PR.creatorInputs)
      );
      if (!prCreatorResult || prCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.PR.creator} failed to produce ${propertiesPath} for phase PR`
        );
      }
      artifactPaths.push(propertiesPath);
      const prLoop = await reviewLoop({
        doc: propertiesPath,
        phase: "PR",
        reviewers: PHASE_DISPATCH.PR.reviewers,
        optimizer: PHASE_DISPATCH.PR.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(prLoop, "PR", PHASE_DISPATCH.PR.label, recordPhase);
      recordPhase("PR", PHASE_DISPATCH.PR.label, "✅", `Approved (${prLoop.iterations} iterations)`, prLoop.iterations);

      // ─── Phase I: Implementation ─────────────────────────────────────────
      phaseFn("Phase I: Implementation");

      // TSPEC-IMPL-01: PLAN DAG parsing. Parse the PLAN task table in-script
      // first — a markdown table needs no LLM. Only if the table is not parseable
      // (e.g. dependencies live in prose) fall back to the extraction agent, which
      // runs on Haiku since this is mechanical extraction, not reasoning.
      let tasks;
      const planParsed = parsePlanTasks(await readFileFn(planPath));
      if (planParsed && Array.isArray(planParsed.tasks) && planParsed.tasks.length > 0) {
        tasks = planParsed.tasks;
      } else {
        const dagAgentResult = await agentFn(
          "se-author",
          `Read docs/${featureName}/PLAN-${featureName}.md and extract the task table. ` +
            `Return a JSON object with this exact structure: ` +
            `{"tasks": [{"id": "TASK-01", "description": "...", "dependencies": ["TASK-00"], "planBatch": 1}]}`,
          { model: "haiku" }
        );

        try {
          const parsed = JSON.parse(dagAgentResult);
          if (!parsed || !Array.isArray(parsed.tasks)) {
            throw new Error("Invalid schema");
          }
          tasks = parsed.tasks;
        } catch {
          throw haltError(
            "Error: PLAN parsing agent failed to return structured task list"
          );
        }
      }

      // TSPEC-IMPL-02: Topological batching
      const batches = computeTopologicalBatches(tasks);

      // TSPEC-IMPL-03: Batch plan logging — must precede first agent() call
      emit("Implementation batch plan:");
      for (let i = 0; i < batches.length; i++) {
        const deps = batches[i].some((t) => t.dependencies.length > 0)
          ? `  (depends on: Batch ${i})`
          : "";
        emit(
          `  Batch ${i + 1}: [${batches[i].map((t) => t.id).join(", ")}]${deps}`
        );
      }
      emit(`  Total: ${tasks.length} tasks in ${batches.length} batches`);

      // TSPEC-IMPL-04: Per-batch se-implement dispatch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        phaseFn(
          `Phase I: Batch ${batchIndex + 1}/${batches.length}`
        );

        const batchResults = await parallelFn(
          batch.map((task) =>
            agentFn(
              "se-implement",
              implementPrompt(task, featureName),
              { isolation: "worktree", model: MODEL_IMPLEMENTATION }
            )
          )
        );

        // TSPEC-IMPL-05: Worktree merge-back
        // The Claude Code runtime handles worktree isolation and merge-back automatically
        // when agents are called with { isolation: "worktree" } (Assumption A2).
        // mergeWorktree() is the testable implementation for environments where the
        // runtime does not handle this transparently.
        for (let i = 0; i < batch.length; i++) {
          const task = batch[i];
          const worktreeBranch = `feat-${featureName}-${task.id}-worktree`;
          const mergeResult = await mergeWorktreeFn(".", worktreeBranch, `feat-${featureName}`);
          if (mergeResult && mergeResult.ok === false) {
            const fileList = (mergeResult.conflictingFiles || []).join(", ") || "(unknown)";
            throw haltError(
              `Error: merge conflict merging worktree for task ${task.id} into feat-${featureName} — conflicting files: ${fileList}. Pipeline halted.`
            );
          }
        }

        // TSPEC-IMPL-06: Per-batch test gate
        evaluateBatchGate(batchResults, batchIndex, batch);
      }

      recordPhase("I", "Implementation", "✅", "All batches complete");

      // ─── Phase PT: PROPERTIES Tests ─────────────────────────────────────
      phaseFn("Phase PT: PROPERTIES Tests");
      const ptResult = await agentFn(
        "se-implement",
        propertiesTestPrompt(featureName)
      );
      const ptGate = evaluateSingleAgentGate(ptResult, "PT");
      if (!ptGate.passed) {
        throw haltError(ptGate.reason);
      }
      testSummary = "All tests passing";
      recordPhase("PT", "PROPERTIES Tests", "✅", "All properties tests passing");

      // ─── Phase CR: Final Codebase Review ─────────────────────────────────
      phaseFn("Phase CR: Final Codebase Review");
      const crResult = await reviewLoop({
        doc: `docs/${featureName}/`,
        phase: "CR",
        reviewers: PHASE_DISPATCH.CR.reviewers,
        optimizer: PHASE_DISPATCH.CR.optimizer,
        feature: featureName,
        _agent: agentFn,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
      });
      checkConverged(crResult, "CR", PHASE_DISPATCH.CR.label, recordPhase);
      recordPhase("CR", PHASE_DISPATCH.CR.label, "✅", `Approved (${crResult.iterations} iterations)`, crResult.iterations);

      // ─── Phase DOD: Definition of Done Verification ─────────────────────
      if (!phaseDodEnabled) {
        phaseFn("Phase DOD: ⏭ Skipped");
        emit("Phase DOD skipped — DoD verification disabled");
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "⏭", "Skipped — DoD verification disabled");
      } else {
        phaseFn("Phase DOD: Definition of Done Verification");
        // DOD step 0: rebase onto the latest default branch so the scan — and the PR
        // raised later in Phase PUB — reflects the real merge state. Moved here from
        // ship-pr so DoD evaluates the post-rebase tree.
        const rebaseStatus = await rebaseOntoDefaultFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (rebaseStatus === "conflict") {
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", "Rebase onto default branch conflicted — resolve manually");
          throw haltError(
            `Phase DOD — rebase conflict for feature ${featureName}. ` +
            `The feature branch cannot be cleanly rebased onto the default branch. ` +
            `Resolve conflicts manually and re-run.`
          );
        }
        const dodResult = await dodVerifyLoopFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (!dodResult.passed) {
          const detail =
            dodResult.lastStatus
              ? `stubs=${dodResult.lastStatus.stubs}, mock_data=${dodResult.lastStatus.mock_data}, unwired=${dodResult.lastStatus.unwired_integrations}, coverage_gap=${dodResult.lastStatus.coverage_below_threshold}, req_gaps=${dodResult.lastStatus.req_gaps}`
              : "verification failed";
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", `Failed after ${dodResult.iterations} iterations — ${detail}`, dodResult.iterations);
          throw haltError(
            `Phase DOD failed after ${dodResult.iterations} iterations — Definition of Done not met. ${detail}`
          );
        }
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "✅", `Passed (${dodResult.iterations} iteration${dodResult.iterations !== 1 ? "s" : ""})`, dodResult.iterations);
      }

      // ─── Phase H: Harvest ────────────────────────────────────────────────
      // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
      // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
      if (!PHASE_H_ENABLED) {
        phaseFn("Phase H: ⏭ Skipped (prerequisite)");
        emit("Phase H skipped — prerequisite not yet landed");
        harvestStatus = "Skipped (prerequisite not yet landed)";
        recordPhase("H", "Harvest", "⏭", "Phase H: ⏭ Skipped (prerequisite not yet landed)");
      } else {
        phaseFn("Phase H: Harvest");
        const harvestResult = await agentFn(
          "harvest-learnings",
          harvestPrompt(featureName)
        );

        // TSPEC-HARVEST-04: Guard block detection
        if (
          typeof harvestResult === "string" &&
          harvestResult.includes(
            "pdlc guard: refusing to delete CROSS-REVIEW files"
          )
        ) {
          // Extract blocked file path from the guard hook's canonical error message
          let blockedPath = "(path not parseable)";
          const dirMatch = harvestResult.match(
            /pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/
          );
          if (dirMatch) {
            blockedPath = dirMatch[1];
          }
          harvestStatus = `Halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`;
          throw haltError(
            `Phase H halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`
          );
        }

        harvestStatus = "Harvested";
        recordPhase("H", "Harvest", "✅", "Learnings harvested");
      }

      // ─── Phase PUB: Raise PR & Verify CI ─────────────────────────────────
      // Runs last so the PR captures the complete feature branch, including the
      // harvested LEARNINGS. The poll-timing logic lives in raisePrAndVerifyCi.
      if (!phasePubEnabled) {
        phaseFn("Phase PUB: ⏭ Skipped");
        emit("Phase PUB skipped — auto-PR disabled");
        recordPhase("PUB", "Raise PR & Verify CI", "⏭", "Skipped — auto-PR disabled");
      } else {
        phaseFn("Phase PUB: Raise PR & Verify CI");
        const pubResult = await raisePrAndVerifyCiFn({
          feature: featureName,
          _agent: agentFn,
          _checkCi: checkCiFn,
          _log: emit,
          _now,
          _sleep,
        });
        prUrl = pubResult.prUrl;
        ciStatus = pubResult.ciStatus;
        const ciDetail =
          ciStatus === "passed"
            ? `PR ${prUrl} — all GHA checks passed`
            : `PR ${prUrl} — no GHA checks detected within timeout (assumed none configured)`;
        recordPhase("PUB", "Raise PR & Verify CI", "✅", ciDetail);
      }
    });
  } catch (err) {
    haltReason = err.message;
    if (testSummary === "Not run" && haltReason) {
      testSummary = haltReason;
    }
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths,
      testSummary,
      harvestStatus: harvestStatus === "Not run" ? "Not run" : harvestStatus,
      prUrl,
      ciStatus,
      haltReason,
    });
  }

  return buildFinalReport({
    feature: featureName,
    outcome: "success",
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    prUrl,
    ciStatus,
  });
}

// ─── Merge worktree helper (TSPEC-IMPL-05) ────────────────────────────────────

/**
 * Merges a worktree branch into the current HEAD of the given repo directory.
 *
 * Steps:
 *   1. Run `git merge --no-ff {worktreeBranch}` in {repoPath}.
 *   2. On non-zero exit: run `git diff --name-only --diff-filter=U` to get conflicting files.
 *   3. Run `git merge --abort`.
 *   4. Return `{ ok: false, conflictingFiles: string[] }`.
 *   On success: return `{ ok: true }`.
 *
 * @param {string} repoPath       - Path to the git repo (cwd for git commands)
 * @param {string} worktreeBranch - Branch name to merge (e.g. "feat-task-01-worktree")
 * @param {string} [targetBranch] - Target branch name (informational only; repo must already be on it)
 * @param {{ execFn?: function }} [opts] - Injection point for tests (override execSync)
 * @returns {Promise<{ ok: true } | { ok: false, conflictingFiles: string[] }>}
 */
async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  const execOpts = { cwd: repoPath, stdio: "pipe", encoding: "utf8" };

  try {
    exec(`git merge --no-ff ${worktreeBranch}`, execOpts);
    return { ok: true };
  } catch {
    // Non-zero exit: capture conflicting files before aborting
    let conflictingFiles = [];
    try {
      const diffOutput = exec(
        "git diff --name-only --diff-filter=U",
        execOpts
      );
      conflictingFiles = diffOutput
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);
    } catch {
      // If diff fails (e.g. nothing staged), return empty list
    }

    try {
      exec("git merge --abort", execOpts);
    } catch {
      // Abort may fail if merge wasn't in progress — ignore
    }

    return { ok: false, conflictingFiles };
  }
}

// ─── Final report builder ─────────────────────────────────────────────────────

function buildFinalReport({
  feature,
  outcome,
  phases,
  artifactPaths,
  testSummary,
  harvestStatus,
  prUrl,
  ciStatus,
  haltReason,
}) {
  return {
    feature,
    outcome,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    ...(prUrl ? { prUrl } : {}),
    ...(ciStatus ? { ciStatus } : {}),
    ...(haltReason ? { haltReason } : {}),
  };
}

return { main, meta, checkPrCi, mergeWorktree, checkFileNonEmpty, parsePlanTasks };
})();


// ─── Entrypoint ───────────────────────────────────────────────────────────────
const __reqPath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.reqPath
      ? args.reqPath
      : null;

if (!__reqPath) {
  return { outcome: "halted", haltReason: "No reqPath supplied — pass the REQ path as args." };
}

return await __dev.main({ reqPath: __reqPath, ...rtDevInjections(__dev) });
