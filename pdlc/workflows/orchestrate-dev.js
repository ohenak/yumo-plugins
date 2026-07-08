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

function pollCiPrompt(featureName, prUrl) {
  return (
    `Report the current GitHub Actions check status for the pull request at ${prUrl} ` +
    `(feature ${featureName}). Inspect the PR's checks once and report the current state — ` +
    `do not wait, sleep, or poll yourself; the workflow owns the polling cadence. ` +
    `End your final message with exactly one of these trailer lines:\n` +
    `CI_STATUS: none     — no GHA checks are registered on the PR yet\n` +
    `CI_STATUS: pending  — one or more checks exist and are still queued/running\n` +
    `CI_STATUS: passed   — all checks have completed and every one succeeded\n` +
    `CI_STATUS: failed   — at least one check has completed with a failure/error`
  );
}

/**
 * Extract the PR URL from a ship-pr create result's trailer.
 * @param {string | null | undefined} result
 * @returns {string | null}  the URL, or null if absent / "none"
 */
export function parsePrUrl(result) {
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
export function parseRebaseStatus(result) {
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

/**
 * Extract the CI status from a ship-pr poll result's trailer.
 * @param {string | null | undefined} result
 * @returns {"none" | "pending" | "passed" | "failed" | "unknown"}
 */
export function parseCiStatus(result) {
  const VALID = ["none", "pending", "passed", "failed"];
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return "unknown";
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("CI_STATUS: ")) {
      const token = trimmed
        .slice("CI_STATUS: ".length)
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
export function parseDodStatus(result) {
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
export async function rebaseOntoDefault({ feature, _agent = agent, _log = log }) {
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
export async function dodVerifyLoop({
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
 * @param {function} [params._log]
 * @param {function} [params._now]   - clock (ms); injectable for tests
 * @param {function} [params._sleep] - async sleep(ms); injectable for tests
 * @param {number} [params.noChecksTimeoutMs]
 * @param {number} [params.pollIntervalMs]
 * @param {number} [params.completionTimeoutMs]
 * @returns {Promise<{ prUrl: string, ciStatus: "passed" | "no-checks" }>}
 */
export async function raisePrAndVerifyCi({
  feature,
  _agent = agent,
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

  // 2. Poll GHA checks. The script owns the cadence and the timeouts.
  const start = _now();
  let completionStart = null;
  while (true) {
    const statusResult = await _agent("ship-pr", pollCiPrompt(feature, prUrl));
    const status = parseCiStatus(statusResult);

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

// Real wall-clock sleep used by Phase PUB's poll loop. Injectable in tests via _sleep.
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _guardAgent?: function, _phase?: function, _pipeline?: function }} params
 * @returns {Promise<FinalReport>}
 */
export default async function main({
  reqPath,
  _agent: rawAgentFn = agent,
  _parallel: parallelFn = parallel,
  _log: logFn = log,
  _guardAgent: guardAgentFn = null,
  _phase: phaseFn = phase,
  _pipeline: pipelineFn = pipeline,
  _mergeWorktree: mergeWorktreeFn = mergeWorktree,
  _rebaseOntoDefault: rebaseOntoDefaultFn = rebaseOntoDefault,
  _dodVerifyLoop: dodVerifyLoopFn = dodVerifyLoop,
  _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
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
        _guardAgent: guardAgentFn,
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
export async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn } = {}) {
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
