/**
 * orchestrate-dev.js — Full PDLC pipeline orchestrator
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-dev.js
 * Consumer runtime copy:  .claude/workflows/orchestrate-dev.js
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

// TSPEC-SCRIPT-03: Exported meta object
export const meta = {
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
export const PHASE_DISPATCH = {
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

// ─── TSPEC-PARSE-01: parseVerdict ─────────────────────────────────────────────

/**
 * Extract VERDICT from a reviewer agent result string.
 * @param {string | null | undefined} result - Raw agent result
 * @param {string} skillName - Reviewer skill identifier for warning messages
 * @returns {{ verdict: string, high: number, medium: number, low: number }}
 */
export function parseVerdict(result, skillName) {
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
export function parseDecisionsWarranted(result) {
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
 * @param {function} [params._guardAgent] - Injected guard agent (for testing)
 * @returns {Promise<{converged: boolean, iterations: number}>}
 */
export async function reviewLoop({
  doc,
  phase,
  reviewers,
  optimizer,
  feature,
  iteration = 1,
  _agent = agent,
  _parallel = parallel,
  _guardAgent = null,
}) {
  // TSPEC-LOOP-02: Entry precondition check (skip for Phase CR)
  if (phase !== "CR") {
    const guardFn = _guardAgent ?? _agent;
    const guardResult = await guardFn("guard", `check-exists:${doc}`);
    if (!guardResult.ok) {
      throw haltError(
        `Error: ${doc} does not exist — cannot enter reviewLoop for phase ${phase}`
      );
    }
  }

  let result1, result2;

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

    // (c) Dispatch reviewers in parallel
    const reviewerPrompt1 = reviewerPrompt(doc, phase, feature, iteration);
    const reviewerPrompt2 = reviewerPrompt(doc, phase, feature, iteration);

    const [r1, r2] = await _parallel([
      _agent(reviewers[0], reviewerPrompt1),
      _agent(reviewers[1], reviewerPrompt2),
    ]);
    result1 = r1;
    result2 = r2;

    // (d) Parse verdicts
    const verdict1 = parseVerdict(result1, reviewers[0]);
    const verdict2 = parseVerdict(result2, reviewers[1]);

    // (e) Evaluate gate
    const gatePass = isPass(verdict1.verdict) && isPass(verdict2.verdict);

    // (f) PASS branch
    if (gatePass) {
      return { converged: true, iterations: iteration };
    }

    // (g) Invoke optimizer (FAIL path)
    const optPrompt = optimizerPrompt(doc, phase, feature, iteration);
    const optimizerResult = await _agent(optimizer, optPrompt);

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

function reviewerPrompt(doc, phase, feature, iteration) {
  return `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.`;
}

function optimizerPrompt(doc, phase, feature, iteration) {
  return `Address reviewer feedback on ${doc} for phase ${phase} of feature ${feature}. Iteration ${iteration} reviewers found issues. Update and commit.`;
}

function postPassTSPECPrompt(featureName) {
  return (
    `Finalize docs/${featureName}/TSPEC-${featureName}.md by addressing all outstanding TSPEC cross-review findings. ` +
    `After completing your response, end your final message with:\n` +
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
    `1. Read all CROSS-REVIEW-*.md files (every doc type, every -vN suffix) for docs/${featureName}/.\n` +
    `2. Read all POSTMORTEM-*.md files for docs/${featureName}/ (if any).\n` +
    `3. Write docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `4. Commit and push LEARNINGS before any delete operation.\n` +
    `5. Only after the LEARNINGS commit is confirmed on remote, delete the harvested CROSS-REVIEW-* files.\n` +
    `6. Commit and push the deletions.`
  );
}

// ─── TSPEC-IMPL-06: Per-batch test gate helpers ───────────────────────────────

/**
 * Evaluates whether a batch of se-implement agents all passed their tests.
 * @param {Array<string|null>} results - Array of agent results
 * @param {number} batchIndex - Zero-based batch index
 * @param {Array<{id: string}>} batch - Array of task objects
 * @throws {Error} halt error if any test failed
 */
export function evaluateBatchGate(results, batchIndex, batch) {
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
export function evaluateSingleAgentGate(agentResult, phaseName) {
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
export function computeTopologicalBatches(tasks) {
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

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _guardAgent?: function, _phase?: function, _pipeline?: function }} params
 * @returns {Promise<FinalReport>}
 */
export default async function main({
  reqPath,
  _agent: agentFn = agent,
  _parallel: parallelFn = parallel,
  _log: logFn = log,
  _guardAgent: guardAgentFn = null,
  _phase: phaseFn = phase,
  _pipeline: pipelineFn = pipeline,
} = {}) {
  // Override module-level log for injection
  const emit = logFn;

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

  // ─── TSPEC-ENTRY-03: file existence check via guard agent ─────────────────

  const guardFn = guardAgentFn ?? agentFn;
  const guardResult = await guardFn("guard", `check-exists:${reqPath}`);

  if (!guardResult.ok) {
    if (guardResult.reason === "file_empty") {
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
        _guardAgent: guardAgentFn,
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
        _guardAgent: guardAgentFn,
      });
      checkConverged(fLoop, "F", PHASE_DISPATCH.F.label, recordPhase);
      recordPhase("F", PHASE_DISPATCH.F.label, "✅", `Approved (${fLoop.iterations} iterations)`, fLoop.iterations);

      // ─── Phase T: TSPEC Creation + Review ───────────────────────────────
      phaseFn("Phase T: TSPEC Creation + Review");
      const tspecPath = `docs/${featureName}/TSPEC-${featureName}.md`;
      const tCreatorResult = await agentFn(
        PHASE_DISPATCH.T.creator,
        creatorPrompt("T", featureName, PHASE_DISPATCH.T.creatorInputs)
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
        _guardAgent: guardAgentFn,
      });
      checkConverged(tLoop, "T", PHASE_DISPATCH.T.label, recordPhase);
      recordPhase("T", PHASE_DISPATCH.T.label, "✅", `Approved (${tLoop.iterations} iterations)`, tLoop.iterations);

      // ─── TSPEC-DECISIONS-01: Post-PASS TSPEC Finalization ────────────────
      phaseFn("Phase T: Post-PASS TSPEC Finalization");
      let decisionsWarranted = true;

      const postPassResult = await agentFn(
        "se-author",
        postPassTSPECPrompt(featureName)
      );
      if (
        postPassResult == null ||
        (typeof postPassResult === "string" && postPassResult.trim() === "")
      ) {
        emit(
          "Warning: TSPEC post-PASS agent failed — defaulting decisionsWarranted to true"
        );
        decisionsWarranted = true;
      } else {
        decisionsWarranted = parseDecisionsWarranted(postPassResult);
      }

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
          _guardAgent: guardAgentFn,
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
        _guardAgent: guardAgentFn,
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
        _guardAgent: guardAgentFn,
      });
      checkConverged(prLoop, "PR", PHASE_DISPATCH.PR.label, recordPhase);
      recordPhase("PR", PHASE_DISPATCH.PR.label, "✅", `Approved (${prLoop.iterations} iterations)`, prLoop.iterations);

      // ─── Phase I: Implementation ─────────────────────────────────────────
      phaseFn("Phase I: Implementation");

      // TSPEC-IMPL-01: PLAN DAG parsing
      const dagAgentResult = await agentFn(
        "se-author",
        `Read docs/${featureName}/PLAN-${featureName}.md and extract the task table. ` +
          `Return a JSON object with this exact structure: ` +
          `{"tasks": [{"id": "TASK-01", "description": "...", "dependencies": ["TASK-00"], "planBatch": 1}]}`
      );

      let tasks;
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
              { isolation: "worktree" }
            )
          )
        );

        // TSPEC-IMPL-05: Worktree merge-back
        for (let i = 0; i < batch.length; i++) {
          const task = batch[i];
          // In production: git merge --no-ff <worktree-branch>
          // Conflict detection via exit code, then git diff --name-only --diff-filter=U, then git merge --abort
          await mergeWorktree(task, featureName, agentFn);
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
        _guardAgent: guardAgentFn,
      });
      checkConverged(crResult, "CR", PHASE_DISPATCH.CR.label, recordPhase);
      recordPhase("CR", PHASE_DISPATCH.CR.label, "✅", `Approved (${crResult.iterations} iterations)`, crResult.iterations);

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
  });
}

// ─── Merge worktree helper (production: real git; tests: mocked) ──────────────

async function mergeWorktree(task, featureName, agentFn) {
  // In production this would call git commands; in workflow context, the runtime handles worktrees.
  // This stub is overridden in integration tests via dependency injection.
  void task;
  void featureName;
  void agentFn;
}

// ─── Final report builder ─────────────────────────────────────────────────────

function buildFinalReport({
  feature,
  outcome,
  phases,
  artifactPaths,
  testSummary,
  harvestStatus,
  haltReason,
}) {
  return {
    feature,
    outcome,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    ...(haltReason ? { haltReason } : {}),
  };
}
