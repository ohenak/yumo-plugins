export const meta = {
  name: "orchestrate-queue",
  description:
    "Serial PDLC queue driver — picks the next ready REQ from docs/_queue/QUEUE.md and runs the orchestrate-dev pipeline for it.",
  whenToUse:
    "Driven by /loop to work a dependency-ordered feature queue one feature per invocation.",
  phases: [
    { title: "Queue: Load", detail: "read docs/_queue/QUEUE.md" },
    { title: "Queue: Select", detail: "pick pending entries in order" },
    { title: "Queue: Triage", detail: "Phase-0 readiness check (sonnet)" },
    { title: "Queue: Run", detail: "delegate to the orchestrate-dev pipeline" },
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
  const VALID_VERDICTS = [
    "Approved",
    "Approved with minor changes",
    "Needs revision",
  ];
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

// ─── isPass helper ────────────────────────────────────────────────────────────

function isPass(verdict) {
  return verdict === "Approved" || verdict === "Approved with minor changes";
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
function reviewerRoleSlug(skill) {
  const MAP = {
    "se-review": "software-engineer",
    "pm-review": "product-manager",
    "te-review": "test-engineer",
  };
  return MAP[skill] || null;
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

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _checkFile?: function, _readFile?: function, _phase?: function, _pipeline?: function }} params
 * @returns {Promise<FinalReport>}
 */
async function main({
  reqPath,
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

const __queue = (function () {
const realMain = __dev.main;
/**
 * orchestrate-queue.js — Serial queue driver around orchestrate-dev
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-queue.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-queue.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Purpose
 * -------
 * The PDLC pipeline (orchestrate-dev) is NOT stateless: each FSPEC/TSPEC/PLAN is
 * authored against the codebase as it exists at fire time. Two REQs that touch the
 * same subsystem must therefore run in a dependency-respecting order, one at a time.
 *
 * This wrapper turns a human-curated queue into a Claude loop ("/loop run
 * /pdlc:orchestrate-queue"). On each invocation it picks AT MOST ONE ready REQ from
 * docs/_queue/QUEUE.md, runs a Phase-0 readiness check, and — if ready — delegates
 * the whole pipeline to orchestrate-dev's main(). One feature per invocation keeps
 * each run bounded and observable; the loop fires again for the next.
 *
 * Design axes (resolved with the developer):
 *   1. Ordering   — QUEUE.md gives the high-level order (Option A) AND each REQ
 *                   declares its own `depends-on` in frontmatter (Option B). The
 *                   effective dependency set is the UNION of both. A REQ that is not
 *                   marked `ready: true` in its frontmatter is never auto-picked,
 *                   so an in-progress draft can sit safely in the queue.
 *   2. Concurrency— Serial. One pipeline per invocation; an existing `in-progress`
 *                   queue entry blocks new pickups until a human resolves it.
 *   3. Readiness  — A Phase-0 triage agent (se-author, which knows the current
 *                   implementation) verifies declared dependencies are actually
 *                   present in the base before the dependent's specs are authored.
 *                   A deterministic pre-check (precheckDependencies) runs FIRST and
 *                   short-circuits candidates the queue already proves blocked (a
 *                   dependency present with a non-`done` status), so no Sonnet triage
 *                   agent is spawned to rediscover what QUEUE.md already states.
 *
 * Manual single-REQ runs remain available via /pdlc:orchestrate-dev — this wrapper
 * does not replace it, it drives it.
 */


// ─── Exported meta object (mirrors orchestrate-dev) ──────────────────────────
const meta = {
  name: "orchestrate-queue",
  description:
    "Serial PDLC queue driver — picks the next ready REQ from docs/_queue/QUEUE.md and runs orchestrate-dev for it. Designed to be driven by /loop.",
  inputs: [
    {
      name: "queuePath",
      description:
        "Path to the queue file. Defaults to docs/_queue/QUEUE.md.",
      type: "string",
      required: false,
    },
  ],
};

// Default location of the queue file.
const DEFAULT_QUEUE_PATH = "docs/_queue/QUEUE.md";

// Location of the drift-state artifact the queue's gate reads (FSPEC §6.1). Written by the
// sync hook / manual sync / manifest check — never by this module.
const DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json";

// MODEL-01: the queue driver's own agent work (the Phase-0 readiness triage) runs
// on Sonnet — it is a bounded lookup against git/working-tree state, not deep
// reasoning. The delegated pipeline (orchestrate-dev) pins its OWN models: Opus for
// every phase except its Phase I implementation batches. See orchestrate-dev.js.
const MODEL_QUEUE = "sonnet";

// Recognized queue statuses. Only `pending` entries are eligible for pickup.
// `in-progress` is a crash/active marker; `awaiting-merge`/`done`/`blocked`/`halted`
// are terminal-for-this-loop and skipped.
const QUEUE_STATUSES = [
  "pending",
  "in-progress",
  "awaiting-merge",
  "done",
  "blocked",
  "halted",
];

// ─── Halt helper (same shape as orchestrate-dev) ─────────────────────────────
function haltError(message) {
  const err = new Error(message);
  err.isHalt = true;
  return err;
}

// ─── QUEUE-PARSE-01: parseQueue ──────────────────────────────────────────────

/**
 * Parse a QUEUE.md markdown table into an ordered list of entries.
 *
 * Expected table columns (header row is matched case-insensitively, extra columns
 * are ignored): Order | Status | Feature | REQ Path | Depends-On
 *
 * Depends-On is a comma/space separated list of feature names, or "-"/"—"/"" for none.
 *
 * @param {string | null | undefined} markdown - Raw QUEUE.md contents
 * @returns {Array<{order: number|null, status: string, feature: string, reqPath: string, dependsOn: string[], rawStatus: string}>}
 */
function parseQueue(markdown) {
  if (markdown == null || typeof markdown !== "string") return [];

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (rows.length === 0) return [];

  // Locate header to map columns; fall back to positional if header missing.
  let headerIdx = -1;
  let cols = null;
  for (let i = 0; i < rows.length; i++) {
    const cells = splitRow(rows[i]).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("req"))) {
      headerIdx = i;
      cols = cells;
      break;
    }
  }

  const colIndex = (names) => {
    if (!cols) return -1;
    for (let i = 0; i < cols.length; i++) {
      if (names.some((n) => cols[i].includes(n))) return i;
    }
    return -1;
  };

  const idxOrder = colIndex(["order", "#"]);
  const idxStatus = colIndex(["status"]);
  const idxFeature = colIndex(["feature"]);
  const idxReq = colIndex(["req path", "req", "path"]);
  const idxDeps = colIndex(["depends", "depends-on", "deps"]);

  const entries = [];
  const startIdx = headerIdx === -1 ? 0 : headerIdx + 1;

  for (let i = startIdx; i < rows.length; i++) {
    const cells = splitRow(rows[i]);
    // Skip the markdown separator row (|---|---|).
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if (cells.length === 0) continue;

    const rawStatus = pick(cells, idxStatus, 1);
    const status = (rawStatus || "").toLowerCase();
    const feature = pick(cells, idxFeature, 2);
    const reqPath = pick(cells, idxReq, 3);
    if (!feature && !reqPath) continue; // not a data row

    const orderRaw = pick(cells, idxOrder, 0);
    const order = /^\d+$/.test(orderRaw) ? parseInt(orderRaw, 10) : null;

    entries.push({
      order,
      status,
      rawStatus: rawStatus || "",
      feature,
      reqPath,
      dependsOn: parseDepsCell(pick(cells, idxDeps, 4)),
    });
  }

  return entries;
}

function splitRow(row) {
  // Drop leading/trailing pipe, then split. Keeps internal spacing trimmed.
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function pick(cells, idx, fallbackIdx) {
  const i = idx >= 0 ? idx : fallbackIdx;
  return i >= 0 && i < cells.length ? cells[i] : "";
}

function parseDepsCell(cell) {
  if (!cell) return [];
  const cleaned = cell.replace(/[—–-]/g, (m) => (m === "-" ? "-" : "")).trim();
  if (cleaned === "" || cleaned === "-" || cleaned.toLowerCase() === "none") {
    return [];
  }
  return cell
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter((d) => d && d !== "-" && d !== "—" && d !== "–" && d.toLowerCase() !== "none");
}

// ─── QUEUE-PARSE-02: parseReqFrontmatter ─────────────────────────────────────

/**
 * How far into a REQ to look for the frontmatter block. Large enough to clear
 * an agent-added preamble, small enough that a `---` rule in the body is never
 * mistaken for frontmatter.
 */
const FRONTMATTER_SCAN_LIMIT = 4000;

/**
 * Parse the YAML-ish frontmatter block of a REQ document.
 *
 * Recognized keys:
 *   ready: true|false       — gate. Absent or non-true means "not pickable".
 *   depends-on: [a, b]      — inline list, or comma/space list, or "-"/none.
 *   feature: name           — informational.
 *
 * Tolerant of missing frontmatter (returns ready:false so nothing is auto-run by
 * accident) and of simple YAML list syntaxes.
 *
 * @param {string | null | undefined} text - Raw REQ contents
 * @returns {{ ready: boolean, dependsOn: string[], feature: string|null }}
 */
function parseReqFrontmatter(text) {
  const empty = { ready: false, dependsOn: [], feature: null };
  if (text == null || typeof text !== "string") return empty;

  // The frontmatter is normally the first thing in the file, but the runtime
  // reads files by round-tripping them through an agent's final message: for a
  // large REQ the agent may prepend a line explaining it could not return the
  // whole file verbatim. Scan a bounded prefix for the first `---` block rather
  // than anchoring at offset 0, so a preamble does not read as "no frontmatter"
  // (which silently degrades to ready:false and skips a genuinely ready REQ).
  const head = text.slice(0, FRONTMATTER_SCAN_LIMIT);
  const fm = /(?:^|\n)\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(head);
  if (!fm) return empty;

  const body = fm[1];
  const lines = body.split("\n");

  let ready = false;
  let feature = null;
  let dependsOn = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();

    if (key === "ready") {
      ready = value.toLowerCase() === "true";
    } else if (key === "feature") {
      feature = value || null;
    } else if (key === "depends-on" || key === "dependson" || key === "deps") {
      if (value.startsWith("[")) {
        // inline flow list: [a, b]
        dependsOn = value
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter(Boolean);
      } else if (value === "" ) {
        // block list on following indented "- item" lines
        for (let j = i + 1; j < lines.length; j++) {
          const item = /^\s*-\s*(.+)$/.exec(lines[j]);
          if (!item) break;
          dependsOn.push(item[1].trim().replace(/['"]/g, ""));
        }
      } else if (value !== "-" && value.toLowerCase() !== "none") {
        dependsOn = value
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter((d) => d && d !== "-");
      }
    }
  }

  return { ready, dependsOn, feature };
}

// ─── QUEUE-PARSE-03: parseTriageVerdict ──────────────────────────────────────

/**
 * Extract the Phase-0 triage verdict from an se-author result.
 * Looks for the last line of form `TRIAGE: ready|blocked|needs-human`.
 * Defaults to "needs-human" (the safe, no-auto-run option) when absent/malformed.
 *
 * @param {string | null | undefined} result
 * @returns {{ verdict: "ready"|"blocked"|"needs-human", reason: string }}
 */
function parseTriageVerdict(result) {
  const fallback = {
    verdict: "needs-human",
    reason: "triage agent returned no TRIAGE verdict — treating as needs-human",
  };
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    const m = /^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i.exec(trimmed);
    if (m) {
      return {
        verdict: m[1].toLowerCase(),
        reason: m[2].trim() || "(no reason given)",
      };
    }
  }
  return fallback;
}

// ─── QUEUE-WRITE-01: updateQueueStatus ───────────────────────────────────────

/**
 * Return a new QUEUE.md string with `feature`'s row Status cell set to newStatus.
 * Pure string transform — preserves all other formatting. If the feature row is not
 * found, returns the input unchanged (caller decides whether that's an error).
 *
 * @param {string} markdown
 * @param {string} feature
 * @param {string} newStatus
 * @returns {string}
 */
function updateQueueStatus(markdown, feature, newStatus) {
  if (typeof markdown !== "string" || !feature) return markdown;

  const lines = markdown.split("\n");

  // Resolve column indices from the header (same logic as parseQueue).
  let statusCol = 1;
  let featureCol = 2;
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      const s = cells.findIndex((c) => c.includes("status"));
      const f = cells.findIndex((c) => c.includes("feature"));
      if (s >= 0) statusCol = s;
      if (f >= 0) featureCol = f;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if ((cells[featureCol] || "").trim() !== feature) continue;

    // Replace the status cell, preserving the original pipe layout.
    const newCells = cells.slice();
    newCells[statusCol] = newStatus;
    lines[i] = `| ${newCells.join(" | ")} |`;
    return lines.join("\n");
  }

  return markdown; // feature row not found
}

// ─── selectNextPending ───────────────────────────────────────────────────────

/**
 * Decide which queue entry to attempt next, BEFORE the async readiness triage.
 * Pure: returns the first `pending` entry whose REQ-gate could let it run, or a
 * structured "nothing to pick" reason. Also surfaces an `in-progress` blocker.
 *
 * @param {Array} entries - parseQueue() output
 * @returns {{ kind: "blocked-active", entry: object }
 *          | { kind: "candidates", candidates: object[] }
 *          | { kind: "empty", reason: string }}
 */
function selectNextPending(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { kind: "empty", reason: "queue is empty" };
  }

  const active = entries.find((e) => e.status === "in-progress");
  if (active) {
    return { kind: "blocked-active", entry: active };
  }

  const candidates = entries.filter((e) => e.status === "pending");
  if (candidates.length === 0) {
    return {
      kind: "empty",
      reason: "no pending entries (all done, awaiting-merge, blocked, or halted)",
    };
  }

  // Preserve queue order: by explicit order field when present, else document order.
  candidates.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    return 0;
  });

  return { kind: "candidates", candidates };
}

// ─── precheckDependencies ─────────────────────────────────────────────────────

/**
 * Deterministic dependency pre-check run BEFORE the Sonnet triage agent.
 *
 * The queue file already records the lifecycle status of every feature it knows
 * about. If a declared dependency is present in the queue with a non-`done` status
 * it is *definitely* not merged into the base yet — no agent session is needed to
 * conclude the candidate is blocked. This short-circuits that case to avoid burning
 * a triage agent spawn on an answer the queue already gives.
 *
 * Conservative on purpose: a dependency that is `done`, or one that is absent from
 * the queue entirely, CANNOT be judged from the queue alone (it may live outside the
 * queue, or `done` may not yet be reflected in the working tree) — those fall
 * through to the triage agent, which inspects git/working-tree state.
 *
 * @param {string[]} dependsOn - union of QUEUE ∪ REQ-frontmatter dependency names
 * @param {Array} entries      - parseQueue() output
 * @returns {{ blocked: boolean, reason?: string }}
 */
function precheckDependencies(dependsOn, entries) {
  if (!Array.isArray(dependsOn) || dependsOn.length === 0) {
    return { blocked: false };
  }
  const rows = Array.isArray(entries) ? entries : [];

  for (const dep of dependsOn) {
    const match = rows.find((e) => e.feature === dep);
    // Present in the queue but not yet done → definitely blocked. First one wins.
    if (match && match.status !== "done") {
      return {
        blocked: true,
        reason: `dependency ${dep} is ${match.status} in queue (not done)`,
      };
    }
    // Dependency done, or not in the queue at all → inconclusive here; defer to triage.
  }

  return { blocked: false };
}

// ─── Prompt helper ───────────────────────────────────────────────────────────

function triagePrompt(feature, reqPath, dependsOn) {
  const depList = dependsOn.length ? dependsOn.join(", ") : "(none declared)";
  return (
    `Phase-0 readiness triage for feature "${feature}".\n` +
    `REQ: ${reqPath}\n` +
    `Declared dependencies (must already be merged into the base branch): ${depList}\n\n` +
    `Determine whether the PDLC pipeline can author correct FSPEC/TSPEC/PLAN for this REQ NOW, ` +
    `given the current state of the codebase. Specifically verify, using git history and the ` +
    `working tree, that every declared dependency's implementation is present in the base. ` +
    `Also flag if the REQ references subsystems that do not yet exist.\n\n` +
    `Do NOT modify any files. End your final message with exactly one line:\n` +
    `TRIAGE: ready        <one-line reason>   — dependencies satisfied, safe to run\n` +
    `TRIAGE: blocked      <one-line reason>   — a dependency is not yet in the base; skip for now\n` +
    `TRIAGE: needs-human  <one-line reason>   — ambiguous; a human must decide`
  );
}

// ─── Runtime API stubs (replaced by real runtime in production) ──────────────
/* Mirror orchestrate-dev: tests override these via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  if (typeof console !== "undefined") {
    console.log("[orchestrate-queue]", message);
  }
}

// Default file IO — real fs, injectable for tests (mirrors mergeWorktree style).
async function defaultReadFile(path) {
  const { readFileSync } = await import("fs");
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

async function defaultWriteFile(path, contents) {
  const { writeFileSync } = await import("fs");
  writeFileSync(path, contents, "utf8");
}

// ─── main() ───────────────────────────────────────────────────────────────────

/**
 * Drive the queue: pick at most one ready REQ and run the full pipeline for it.
 *
 * @param {object} params
 * @param {string} [params.queuePath]   - Defaults to DEFAULT_QUEUE_PATH.
 * @param {function} [params._agent]      - Injected agent (triage).
 * @param {function} [params._readFile]   - async (path) => string|null.
 * @param {function} [params._writeFile]  - async (path, contents) => void.
 * @param {function} [params._runPipeline]- async ({reqPath}) => FinalReport.
 * @param {function} [params._log]        - Injected logger.
 * @param {function} [params._phase]      - Injected phase marker.
 * @returns {Promise<QueueReport>}
 */
async function main({
  queuePath = DEFAULT_QUEUE_PATH,
  _agent: rawAgentFn = agent,
  _readFile: readFileFn = defaultReadFile,
  _writeFile: writeFileFn = defaultWriteFile,
  _runPipeline: runPipelineFn = realMain,
  _log: logFn = log,
  _phase: phaseFn = phase,
} = {}) {
  const emit = logFn;

  // MODEL-01: pin the queue's own agent calls (Phase-0 triage) to Sonnet. The
  // delegated orchestrate-dev pipeline is invoked without _agent below, so it uses
  // its OWN runtime agent and its OWN Opus-default model pinning — unaffected by this.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_QUEUE, ...opts });

  // ─── Drift gate (O-19, FSPEC §6.2/§6.4, TSPEC §12.3/§12.4) ───────────────
  // Runs BEFORE the queue is even read, so a blocked drift state costs no queue
  // work. `readDriftStateSafely` is the O-19(d) wrapper: the injected read is
  // agent-mediated (rtReadFile, runtime-adapter.js:85-96), not a raw filesystem
  // call, and that seam never throws in production — it maps a missing/unreadable
  // file to `null` itself. The wrapper exists anyway (defence in depth, O-19(c)):
  // if some future/alternate read implementation DID throw, propagating that
  // exception here would abort the whole queue invocation instead of yielding a
  // `blocked` verdict, which is the wrong failure mode for something that must
  // fail closed onto row 1 (FSPEC §6.2 row 1 — "hook never ran").
  phaseFn("Queue: Drift gate");
  const driftRaw = await readDriftStateSafely(readFileFn, DRIFT_STATE_PATH);
  const driftGate = mapDriftState(validateDriftRecord(driftRaw));
  if (driftGate.outcome === "blocked") {
    emit(
      `Queue blocked by drift gate (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
    return buildQueueReport({
      outcome: "blocked",
      reason: `Drift gate row ${driftGate.row}: ${driftGate.reasons.join("; ")}`,
      remaining: 0,
      driftReport: driftGate.report,
    });
  }

  // ─── Load queue ─────────────────────────────────────────────────────────
  phaseFn("Queue: Load");
  const queueText = await readFileFn(queuePath);
  if (queueText == null) {
    return buildQueueReport({
      outcome: "no-queue",
      reason: `Queue file not found at ${queuePath}`,
      remaining: 0,
    });
  }

  const entries = parseQueue(queueText);
  const remainingPending = entries.filter((e) => e.status === "pending").length;

  // ─── Select candidate(s) ─────────────────────────────────────────────────
  phaseFn("Queue: Select");
  const selection = selectNextPending(entries);

  if (selection.kind === "blocked-active") {
    emit(
      `Queue blocked: "${selection.entry.feature}" is still in-progress. ` +
        `Resolve it (mark done/awaiting-merge or reset to pending) before new work is picked up.`
    );
    return buildQueueReport({
      outcome: "blocked",
      reason: `An entry is in-progress: ${selection.entry.feature}`,
      remaining: remainingPending,
      active: selection.entry.feature,
    });
  }

  if (selection.kind === "empty") {
    emit(`Nothing to pick up — ${selection.reason}.`);
    return buildQueueReport({
      outcome: "idle",
      reason: selection.reason,
      remaining: 0,
    });
  }

  // ─── Walk candidates in order; run readiness triage on each until one is ready ──
  phaseFn("Queue: Triage");
  const skipped = [];

  for (const entry of selection.candidates) {
    // REQ-gate: frontmatter must mark ready:true and contributes extra deps.
    const reqText = await readFileFn(entry.reqPath);
    if (reqText == null) {
      emit(`Skip "${entry.feature}": REQ not found at ${entry.reqPath}.`);
      skipped.push({ feature: entry.feature, reason: "REQ file missing" });
      continue;
    }

    const fm = parseReqFrontmatter(reqText);
    if (!fm.ready) {
      emit(`Skip "${entry.feature}": REQ not marked ready: true (still a draft).`);
      skipped.push({ feature: entry.feature, reason: "REQ not marked ready" });
      continue;
    }

    // Union of declared dependencies (QUEUE ∪ REQ frontmatter).
    const dependsOn = Array.from(
      new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])])
    );

    // Deterministic pre-check: if the queue already shows a dependency as not done,
    // it is definitely blocked — skip without spawning a (Sonnet) triage agent.
    const precheck = precheckDependencies(dependsOn, entries);
    if (precheck.blocked) {
      emit(`Skip "${entry.feature}": blocked (pre-check) — ${precheck.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `blocked (pre-check): ${precheck.reason}`,
      });
      continue;
    }

    // Phase-0 readiness triage against the actual codebase.
    const triageResult = await agentFn(
      "se-author",
      triagePrompt(entry.feature, entry.reqPath, dependsOn)
    );
    const triage = parseTriageVerdict(triageResult);

    if (triage.verdict === "blocked") {
      emit(`Skip "${entry.feature}": blocked — ${triage.reason}.`);
      skipped.push({ feature: entry.feature, reason: `blocked: ${triage.reason}` });
      continue;
    }
    if (triage.verdict === "needs-human") {
      emit(
        `Skip "${entry.feature}": needs human decision — ${triage.reason}.`
      );
      skipped.push({
        feature: entry.feature,
        reason: `needs-human: ${triage.reason}`,
      });
      continue;
    }

    // ─── triage.verdict === "ready": run the pipeline for exactly this entry ──
    return runPicked({
      entry,
      dependsOn,
      triageReason: triage.reason,
      queuePath,
      queueText,
      remainingPending,
      skipped,
      runPipelineFn,
      writeFileFn,
      readFileFn,
      phaseFn,
      emit,
    });
  }

  // No candidate became ready this pass.
  emit(`No ready REQ this pass (${skipped.length} candidate(s) skipped).`);
  return buildQueueReport({
    outcome: "idle",
    reason: "no candidate passed the readiness gate",
    remaining: remainingPending,
    skipped,
  });
}

/**
 * Mark the picked entry in-progress, run the pipeline, then record the outcome.
 * Status transitions: pending → in-progress → awaiting-merge (success) | halted.
 * Note: success is `awaiting-merge`, NOT `done` — a human merges the PR and sets
 * `done`, which is the signal a dependent's Phase-0 triage looks for in the base.
 */
async function runPicked({
  entry,
  dependsOn,
  triageReason,
  queuePath,
  queueText,
  remainingPending,
  skipped,
  runPipelineFn,
  writeFileFn,
  readFileFn,
  phaseFn,
  emit,
}) {
  phaseFn(`Pipeline: ${entry.feature}`);
  emit(
    `Picked "${entry.feature}" (deps: ${
      dependsOn.length ? dependsOn.join(", ") : "none"
    }) — ${triageReason}. Running orchestrate-dev.`
  );

  // Persist in-progress BEFORE running so a crash leaves a visible marker.
  await writeFileFn(queuePath, updateQueueStatus(queueText, entry.feature, "in-progress"));

  let report;
  try {
    report = await runPipelineFn({ reqPath: entry.reqPath });
  } catch (err) {
    await rewriteStatus(queuePath, entry.feature, "halted", readFileFn, writeFileFn);
    return buildQueueReport({
      outcome: "halted",
      reason: `Pipeline threw for ${entry.feature}: ${err && err.message}`,
      remaining: remainingPending - 1,
      picked: entry.feature,
    });
  }

  const succeeded = report && report.outcome === "success";
  const newStatus = succeeded ? "awaiting-merge" : "halted";
  await rewriteStatus(queuePath, entry.feature, newStatus, readFileFn, writeFileFn);

  emit(
    succeeded
      ? `"${entry.feature}" complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents.`
      : `"${entry.feature}" halted: ${report && report.haltReason}. Status set to halted.`
  );

  return buildQueueReport({
    outcome: succeeded ? "ran" : "halted",
    reason: succeeded
      ? `Pipeline succeeded for ${entry.feature}`
      : `Pipeline halted for ${entry.feature}: ${report && report.haltReason}`,
    remaining: remainingPending - 1,
    picked: entry.feature,
    pipelineReport: report,
    skipped,
  });
}

/** Re-read the queue (the pipeline may have touched it) and set a feature's status. */
async function rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn) {
  const current = (await readFileFn(queuePath)) ?? "";
  await writeFileFn(queuePath, updateQueueStatus(current, feature, status));
}

// ─── Report builder ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} QueueReport
 * @property {"ran"|"halted"|"idle"|"blocked"|"no-queue"} outcome
 * @property {string} reason
 * @property {number} remaining        - pending entries left after this pass
 * @property {string} [picked]         - feature run this pass (if any)
 * @property {string} [active]         - in-progress feature blocking pickup (if any)
 * @property {object} [pipelineReport] - the orchestrate-dev FinalReport (if a pipeline ran)
 * @property {Array}  [skipped]        - candidates skipped this pass with reasons
 */
function buildQueueReport({
  outcome,
  reason,
  remaining,
  picked,
  active,
  pipelineReport,
  skipped,
  driftReport,
}) {
  return {
    outcome,
    reason,
    remaining: typeof remaining === "number" ? Math.max(0, remaining) : 0,
    ...(picked ? { picked } : {}),
    ...(active ? { active } : {}),
    ...(pipelineReport ? { pipelineReport } : {}),
    ...(skipped && skipped.length ? { skipped } : {}),
    ...(driftReport ? { driftReport } : {}),
  };
}

// ─── DRIFT-01: validateDriftRecord (TSPEC §12.1, FSPEC §1.3 / §6.2 row 1) ────
//
// Shape validator for the single injected read of `.claude/workflows/.pdlc-drift-state.json`
// (FSPEC §6.1). Pure — no filesystem, no model calls. Defence in depth only: the hook is the
// primary drift detector; this validator exists to fail closed (⇒ `blocked`) on any relay that
// is not byte-faithful to what the writer produced, since the read is LLM-mediated (an agent
// turn), not a raw filesystem read (§6.1). It does not, and cannot, detect a relay that mangles
// a *value* while staying inside that value's closed set (§6.1's stated residual) — only shapes.
//
// Clause order is significant: clauses are checked D1 → D8 and the FIRST failing clause is
// reported, matching FSPEC §6.2's row-1 predicate table and TSPEC §12.1's one-clause-per-row
// fixtures. `mapDriftState` (T-12) consumes this function's `{ok, record}` / `{ok, clause}`
// result as its own row 1; the mapping/report/gate-wiring layers are out of this task's scope.

const DRIFT_CLOSED_ROW_STATES = ["in-sync", "missing", "stale", "local-edit", "unverified", "unknown"];

const DRIFT_CLOSED_ROW_REASONS = [
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
];

// §2.8's declared precedence order is irrelevant here — D4 only needs closed-set membership,
// not ranking.
const DRIFT_CLOSED_BASELINE_REASONS = [
  "drift-state-invalidated",
  "manifest-empty",
  "json-tool-absent",
  "manifest-malformed",
  "manifest-absent",
  "repo-root-unresolved",
  "plugin-root-unreadable",
  "plugin-root-unset",
];

const DRIFT_CLOSED_GENERATED_BY = ["hook", "check", "sync"];

function isDriftPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// D3 — schemaVersion present, integer 1.
function failsD3(record) {
  return !(typeof record.schemaVersion === "number" && Number.isInteger(record.schemaVersion) && record.schemaVersion === 1);
}

// D4 — baselineStatus one of "resolved" | "unresolved"; baselineReason present and either
// null or one of the eight closed baseline reasons (FSPEC §6.2's literal clause text, TSPEC
// §12.1 row 6/7). Note (T-12): this clause does NOT correlate baselineReason's null-ness with
// baselineStatus — a "resolved" record carrying a closed baseline reason (e.g.
// "drift-state-invalidated") is shape-valid under D4. §2.8/§4.4 describe what real writers
// produce (baselineStatus:"unresolved" alongside "drift-state-invalidated"), but that is a
// writer-side invariant, not a reader-side shape constraint — §6.2's row 3 precedence fixture
// (TSPEC §12.2) is exactly a shape-valid "resolved" record carrying that reason, and mapDriftState
// must still be able to reach it.
function failsD4(record) {
  if (record.baselineStatus !== "resolved" && record.baselineStatus !== "unresolved") {
    return true;
  }
  return record.baselineReason !== null && !DRIFT_CLOSED_BASELINE_REASONS.includes(record.baselineReason);
}

// D5 — checkEnabled present boolean (not the string "false", not absent).
function failsD5(record) {
  return typeof record.checkEnabled !== "boolean";
}

// D6 — rows, retiredPresent, writeFailures all present arrays.
function failsD6(record) {
  return (
    !Array.isArray(record.rows) ||
    !Array.isArray(record.retiredPresent) ||
    !Array.isArray(record.writeFailures)
  );
}

// D7 — every member of rows / retiredPresent / writeFailures is shape-valid. Only called once
// D6 has already confirmed all three are arrays.
function failsD7(record) {
  const rowsOk = record.rows.every(
    (row) =>
      isDriftPlainObject(row) &&
      typeof row.id === "string" &&
      row.id.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(row.state) &&
      (row.reason === null || DRIFT_CLOSED_ROW_REASONS.includes(row.reason))
  );
  if (!rowsOk) return true;

  const retiredOk = record.retiredPresent.every(
    (entry) =>
      isDriftPlainObject(entry) &&
      typeof entry.path === "string" &&
      entry.path.length > 0 &&
      typeof entry.supersededBy === "string" &&
      entry.supersededBy.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(entry.supersedingState)
  );
  if (!retiredOk) return true;

  return !record.writeFailures.every(
    (failure) =>
      isDriftPlainObject(failure) &&
      typeof failure.path === "string" &&
      typeof failure.operation === "string"
  );
}

// D8 — generatedBy closed-set; pluginVersion null-or-string; syncCommand, if present,
// null-or-string. Absence of syncCommand is the one thing D8 tolerates (FSPEC §1.3, SE F-16).
function failsD8(record) {
  if (!DRIFT_CLOSED_GENERATED_BY.includes(record.generatedBy)) return true;
  if (!(record.pluginVersion === null || typeof record.pluginVersion === "string")) return true;
  if ("syncCommand" in record) {
    if (!(record.syncCommand === null || typeof record.syncCommand === "string")) return true;
  }
  return false;
}

const DRIFT_CLAUSE_CHECKS = [
  ["D3", failsD3],
  ["D4", failsD4],
  ["D5", failsD5],
  ["D6", failsD6],
  ["D7", failsD7],
  ["D8", failsD8],
];

// Runs D3–D8 against a parsed top-level object, in order, returning the first failing clause
// id or `null` when every clause is satisfied. Shared by the top-level validation and by the
// single-level envelope check below (TSPEC §12.1 row 4).
function firstFailingDriftClause(record) {
  for (const [clauseId, fails] of DRIFT_CLAUSE_CHECKS) {
    if (fails(record)) return clauseId;
  }
  return null;
}

/**
 * Validate the shape of a drift-state record as relayed by the injected read (FSPEC §6.1,
 * §6.2 row 1; TSPEC §12.1). `value` is whatever the injected read returned — the caller is
 * responsible for normalising a throw to `null` (O-19(d)); this function only judges shape.
 *
 * @param {unknown} value
 * @returns {{ok:true, record:object} | {ok:false, clause:"D1"|"D2"|"D3"|"D4"|"D5"|"D6"|"D7"|"D8"}}
 */
function validateDriftRecord(value) {
  // D1 — a usable value. In production this is always a string (or `null`, per §6.1) because the
  // seam is a raw, LLM-mediated file read; some callers validate an already-parsed record object
  // obtained by other means (e.g. AT-24's end-to-end fresh-clone assertion, which reads the
  // written drift-state JSON directly off disk), so a plain object is accepted here too and
  // treated as already having passed D2's JSON-parse step. Anything else (`null`, an array, a
  // scalar) is D1.
  let parsed;
  if (typeof value === "string") {
    // D2 — parses as JSON, and the top level is an object (not an array or a scalar).
    try {
      parsed = JSON.parse(value);
    } catch {
      return { ok: false, clause: "D2" };
    }
  } else if (isDriftPlainObject(value)) {
    parsed = value;
  } else {
    return { ok: false, clause: "D1" };
  }

  if (!isDriftPlainObject(parsed)) {
    return { ok: false, clause: "D2" };
  }

  // D2's single-level known-envelope check (TSPEC §12.1 row 4, v2.1 TE Q-02): a top-level
  // object with exactly one key, "result", whose value is ITSELF fully shape-valid, is a
  // mangled relay (re-wrapped), not a record to unwrap. This check goes exactly one level
  // deep — it does not recurse the inner value through this same envelope check again — so
  // `{"result": 42}` is judged on its own top-level shape (⇒ D3, schemaVersion missing) rather
  // than being treated as an envelope, because 42 is not itself shape-valid.
  const keys = Object.keys(parsed);
  if (
    keys.length === 1 &&
    keys[0] === "result" &&
    isDriftPlainObject(parsed.result) &&
    firstFailingDriftClause(parsed.result) === null
  ) {
    return { ok: false, clause: "D2" };
  }

  const clause = firstFailingDriftClause(parsed);
  if (clause) {
    return { ok: false, clause };
  }

  return {
    ok: true,
    record: {
      ...parsed,
      syncCommand: "syncCommand" in parsed ? parsed.syncCommand : null,
    },
  };
}

// ─── T-12: mapDriftState — the ten-row precedence mapping (AC-4.1, TSPEC §12.2) ─────────────
//
// A pure function of `validateDriftRecord`'s result (never of the raw injected read — the
// call site is O-19(d)'s job, T-13). Every branch below is ordered exactly as FSPEC §6.2's
// precedence table and each later branch's fixture is required (TSPEC §12.2) to "defeat" every
// row above it, so the ORDER of these checks is itself the spec, not an implementation detail.
//
// Report shape: the three reason sets (Manifest / Row / Run, FSPEC §6.3) are disjoint, so
// `report` is always `{ manifest: string[], row: string[], run: string[] }` — never a flat
// list — because a flat list would let a Row-level reason print under Manifest with nothing
// to catch it (TSPEC §12.2, rows 3/4/7's structural assertions).

function emptyReport() {
  return { manifest: [], row: [], run: [] };
}

function gate(outcome, row, reasons, report) {
  return { outcome, row, reasons, report };
}

/**
 * Map a `validateDriftRecord` result to the queue's gate verdict (FSPEC §6.2, TSPEC §12.2).
 *
 * @param {{ok:true, record:object} | {ok:false, clause:string} | null | undefined} validated
 * @returns {{outcome:"blocked"|"proceed", row:number, reasons:string[], report:{manifest:string[], row:string[], run:string[]}}}
 */
function mapDriftState(validated) {
  // Row 1 — the read did not yield a shape-valid record (FSPEC §6.2 row 1; D1-D8 upstream).
  // This is the mapping's own fail-closed floor: every one of validateDriftRecord's negative
  // clauses (D1-D8) lands here, undifferentiated, because none of rows 2-10 below can be
  // trusted to mean what they say once the shape itself is unverified.
  if (!validated || validated.ok !== true) {
    const clause = validated && typeof validated.clause === "string" ? validated.clause : "D1";
    const reasons = [`drift state did not yield a usable record (${clause})`];
    return gate("blocked", 1, reasons, { manifest: reasons, row: [], run: [] });
  }

  const record = validated.record;

  // Row 2 — checkEnabled:false is the operator's opt-out. It sits above every row below EXCEPT
  // row 1 (FSPEC §6.2's "three further design points") — so it must be checked before rows
  // 3-10, deliberately even when the record also carries their conditions (TSPEC §12.2 row 2).
  if (record.checkEnabled === false) {
    const reasons = ["checkEnabled is false — drift check skipped by operator opt-out (AC-4.3)"];
    return gate("proceed", 2, reasons, { manifest: reasons, row: [], run: [] });
  }

  // Row 3 — a non-empty writeFailures blocks even with checkEnabled:true (AT-31(a)). Named at
  // Run level, one line per entry; `drift-state-invalidated`, when carried, renders at Manifest
  // level (FSPEC §6.3 — "drift-state-invalidated's rendering site is the Manifest-level line").
  if (Array.isArray(record.writeFailures) && record.writeFailures.length > 0) {
    const run = record.writeFailures.map(
      (failure) => `write failure: ${failure.path} (${failure.operation})`
    );
    const manifest =
      record.baselineReason === "drift-state-invalidated" ? ["drift-state-invalidated"] : [];
    return gate("blocked", 3, [...manifest, ...run], { manifest, row: [], run });
  }

  // Row 4 — baselineStatus:"unresolved" blocks once writeFailures is empty (defeats row 3).
  // Named at Manifest level only.
  if (record.baselineStatus === "unresolved") {
    const manifest = [String(record.baselineReason)];
    return gate("blocked", 4, manifest, { manifest, row: [], run: [] });
  }

  // Row 5 — any row "unknown" blocks, ordered above a co-occurring stale row (defeats row 6).
  if (record.rows.some((row) => row.state === "unknown")) {
    const row = record.rows
      .filter((r) => r.state === "unknown")
      .map((r) => `${r.id}: unknown${r.reason ? ` (${r.reason})` : ""}`);
    return gate("blocked", 5, row, { manifest: [], row, run: [] });
  }

  // Row 6 — any row "missing" or "stale" blocks, ordered above a co-occurring retired path
  // (defeats row 7).
  if (record.rows.some((row) => row.state === "missing" || row.state === "stale")) {
    const row = record.rows
      .filter((r) => r.state === "missing" || r.state === "stale")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("blocked", 6, row, { manifest: [], row, run: [] });
  }

  // Row 7 — retiredPresent non-empty blocks even with every row in-sync (AT-31(b)). Named at
  // Row level, never Manifest level (a flat list would hide it there — TSPEC §12.2).
  if (Array.isArray(record.retiredPresent) && record.retiredPresent.length > 0) {
    const row = record.retiredPresent.map((entry) => `retired artifact present: ${entry.path}`);
    return gate("blocked", 7, row, { manifest: [], row, run: [] });
  }

  // Row 8 — local-edit / unverified rows proceed, named in the run report (FSPEC §6.2 row 8's
  // literal text: "rows named in the run report").
  if (record.rows.some((row) => row.state === "local-edit" || row.state === "unverified")) {
    const run = record.rows
      .filter((r) => r.state === "local-edit" || r.state === "unverified")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("proceed", 8, run, { manifest: [], row: [], run });
  }

  // Row 9 — resolved, non-empty rows, all in-sync, both arrays empty ⇒ proceed silently.
  if (
    record.baselineStatus === "resolved" &&
    record.rows.length > 0 &&
    record.rows.every((row) => row.state === "in-sync") &&
    record.retiredPresent.length === 0 &&
    record.writeFailures.length === 0
  ) {
    return gate("proceed", 9, [], emptyReport());
  }

  // Row 10 — the terminal row: shape-valid but matches no row 1-9 (FSPEC §6.2's totality
  // argument — e.g. `resolved` with `rows: []`, which row 9 explicitly excludes).
  const reasons = ["drift state does not describe a recognised outcome"];
  return gate("blocked", 10, reasons, { manifest: reasons, row: [], run: [] });
}

// ─── T-13: readDriftStateSafely — the O-19(d) wrapper (TSPEC §12.3) ─────────
//
// O-19(c): the injected read this wraps (`_readFile`, production: `rtReadFile`,
// runtime-adapter.js:85-96) is LLM-mediated — an agent turn that reads a file and
// relays its contents as the agent's final message — not a raw filesystem call.
// `rtReadFile` itself never throws today: it maps "file absent / unreadable" to a
// returned `null`, the same as this module's own `defaultReadFile`. This wrapper's
// `try`/`catch` is therefore defence in depth (O-19(d)), not dead code covering an
// impossible path: it is what stands between a hypothetical throwing read (a
// transport failure some other future/alternate injected implementation surfaces
// as an exception rather than a `null`) and an *aborted* queue invocation. Without
// it, that throw would propagate out of `main` entirely instead of mapping to
// `mapDriftState`'s row 1 `blocked` verdict with a returned report — the fail-closed
// behavior FSPEC §6.2 row 1 ("hook never ran") requires. The call site (`main`,
// below) `await`s this — per CLAUDE.md's runtime rule, every injected IO call must
// be awaited because the runtime adapter's implementations are async.
//
// @param {function} readFileFn - async (path) => string|null (or throws)
// @param {string} path - DRIFT_STATE_PATH
// @returns {Promise<unknown>} the raw read result, or `null` on any throw
async function readDriftStateSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

return { main, meta, DEFAULT_QUEUE_PATH };
})();


// ─── Entrypoint ───────────────────────────────────────────────────────────────
const __devInjections = rtDevInjections(__dev);
const __queuePath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.queuePath
      ? args.queuePath
      : __queue.DEFAULT_QUEUE_PATH;

return await __queue.main({
  queuePath: __queuePath,
  _agent: rtAgent,
  _readFile: rtReadFile,
  _writeFile: rtWriteFile,
  _log: rtLog,
  _phase: rtPhase,
  _runPipeline: ({ reqPath }) => __dev.main({ reqPath, ...__devInjections }),
});
