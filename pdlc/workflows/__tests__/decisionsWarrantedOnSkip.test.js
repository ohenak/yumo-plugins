/**
 * decisionsWarrantedOnSkip.test.js — DEC-DW-01 (2026-08-09).
 *
 * Owns one seam of Phase T's DECISIONS_WARRANTED read: what the value is when
 * **Phase T did not run**, because its TSPEC was already approved and the
 * two-tier approval search skipped it.
 *
 * The defect this pins closed: `converge` returns a bare `{skipped: true}` — no
 * `loop`, no `creatorResult` — so the trailer read collapsed to `null` and took
 * `parseDecisionsWarranted`'s absent/malformed branch. That branch logged
 * "DECISIONS_WARRANTED field absent or malformed" about an agent nobody had
 * asked, and defaulted `true`, so re-running a fully-approved pipeline authored
 * a DECISIONS document for a feature a previous run had correctly judged not to
 * need one. Two different situations arriving as one value.
 *
 * The replacement reads the durable trace instead of re-guessing: the DECISIONS
 * document is either on disk or it is not.
 *
 * ## Shape of this suite
 *
 * Driven **through `main()`** over injected seams, in the manner of
 * `approvalSearch.test.js` — whose tier-1 approval fixture this file reuses,
 * retargeted from Phase F/FSPEC to Phase T/TSPEC. Nothing here imports the read
 * itself; it is a call-site branch with no exported identifier. The oracles are
 * the ones an operator has:
 *
 *   - the final report's `D` row (authored vs. skipped),
 *   - the reviewer dispatches naming the DECISIONS document (did Phase D run),
 *   - the run log (which of the two notices was emitted).
 *
 * Seam doubles come from `__tests__/helpers/seams.js`. No ad-hoc seam object is
 * defined here.
 */

import { createHash } from "crypto";
import main from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";

// ───────────────────────────── the fixture branch ─────────────────────────────

const FEATURE = "dw-feat";
const DOCS_DIR = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS_DIR}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS_DIR}/TSPEC-${FEATURE}.md`;
const DECISIONS_PATH = `${DOCS_DIR}/DECISIONS-${FEATURE}.md`;
const PLAN_PATH = `${DOCS_DIR}/PLAN-${FEATURE}.md`;
const PROPERTIES_PATH = `${DOCS_DIR}/PROPERTIES-${FEATURE}.md`;

/**
 * `PHASE_DISPATCH.T.reviewers` is `["pm-review", "te-review"]`, and the role-slug
 * MAP renders those two as below. Both are restated rather than imported: the MAP
 * is module-private, and a test that imported it could not disagree with a wrong
 * catalogue.
 */
const PM_SLUG = "product-manager";
const TE_SLUG = "test-engineer";

/** Phase T reviews the TSPEC, so tier-1 basenames carry `-TSPEC-`. */
const DOC_TYPE = "TSPEC";

/** @returns {string} the tier-1 cross-review basename `_listFiles` returns. */
function crossReviewBasename(roleSlug, round) {
  return `CROSS-REVIEW-${roleSlug}-${DOC_TYPE}-v${round}.md`;
}

/** @returns {string} the same file as the repo-relative path `_readFile` sees. */
function crossReviewPath(roleSlug, round) {
  return `${DOCS_DIR}/${crossReviewBasename(roleSlug, round)}`;
}

// ─────────────────── the approval digest, recomputed locally ──────────────────

/** Canonicalisation before hashing: CRLF/CR → LF, then exactly one trailing LF. */
function canonicaliseForDigest(text) {
  const lf = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return lf.replace(/\n*$/, "\n");
}

/**
 * `approvalHashOf` — `sha256:` plus 64 lowercase hex. Computed with node's own
 * SHA-256 so the fixture is an independent oracle rather than a restatement of
 * the (deliberately hand-rolled, unexported) production digest.
 */
function approvalHashOf(text) {
  const hex = createHash("sha256")
    .update(Buffer.from(canonicaliseForDigest(text), "utf8"))
    .digest("hex");
  return `sha256:${hex}`;
}

/**
 * One tier-1 cross-review carrying an approving verdict, zero High findings and
 * the script-appended anchor pair. Deliberately minimal: this suite's subject is
 * what happens *after* the skip, and the approval fixture's own edge cases are
 * `approvalSearch.test.js`'s and `parseVerdict.test.js`'s to own.
 */
function approvingCrossReview(hash) {
  return [
    `# Cross-review — ${DOC_TYPE} (${FEATURE})`,
    "",
    "Scope: whole document.",
    "",
    "## Findings",
    "",
    "- No blocking findings.",
    "",
    "## Verdict",
    "",
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
    `APPROVAL-HASH: ${hash}`,
    "REVIEWED-COMMIT: unavailable",
    "",
  ].join("\n");
}

// ───────────────────────────── the pipeline driver ────────────────────────────

/** The TSPEC's bytes are what the staleness comparison hashes. */
const TSPEC_BODY = `# TSPEC — ${FEATURE}\n\nThe technical specification, as it stands on the branch.\n`;

/** The digest the TSPEC's working-tree bytes actually have — the FRESH value. */
const TSPEC_HASH = approvalHashOf(TSPEC_BODY);

/**
 * The documents on the branch before a fixture's own overlay. Note what is NOT
 * here: `DECISIONS-{feature}.md`. Its presence is the single variable this suite
 * turns, so each test states it (or its absence) itself.
 */
function baseFiles() {
  return {
    [REQ_PATH]: `# REQ — ${FEATURE}\n\nready: true\n`,
    [FSPEC_PATH]: `# FSPEC — ${FEATURE}\n`,
    [TSPEC_PATH]: TSPEC_BODY,
    // Phase P's self-parse gate refuses a PLAN whose task table the mechanical
    // parser cannot read, so the seeded PLAN carries one.
    [PLAN_PATH]:
      `# PLAN — ${FEATURE}\n\n| Task ID | Description | Batch | Dependencies |\n` +
      `|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | \`src/one.js\` |\n`,
    [PROPERTIES_PATH]: `# PROPERTIES — ${FEATURE}\n`,
  };
}

/** The listing that makes Phase T — and only Phase T — skip on a recorded approval. */
const TSPEC_APPROVED_LISTING = [
  crossReviewBasename(PM_SLUG, 2),
  crossReviewBasename(TE_SLUG, 2),
];

/** The matching tier-1 files for that listing. */
const TSPEC_APPROVED_FILES = {
  [crossReviewPath(PM_SLUG, 2)]: approvingCrossReview(TSPEC_HASH),
  [crossReviewPath(TE_SLUG, 2)]: approvingCrossReview(TSPEC_HASH),
};

/**
 * A recording agent that converges every review loop on its first iteration and
 * satisfies every downstream phase gate.
 *
 * One thing it deliberately does NOT do: answer the DECISIONS_WARRANTED trailer.
 * Phase T is skipped in every test here, so no agent is ever asked — and an agent
 * that volunteered an answer would hide exactly the substitution under test.
 */
function makeConvergingAgent(log) {
  return async (skill, prompt) => {
    log.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
    if (/-review$/.test(skill)) {
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (/-author$/.test(skill)) {
      if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Created/updated document successfully.";
    }
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
    if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written.";
    return "Success.";
  };
}

/**
 * Drive the whole pipeline over one fixture branch and hand back everything the
 * assertions observe.
 *
 * Phases DOD and PUB are disabled: they rebase, poll CI and shell out, and
 * neither bears on the read under test.
 *
 * Both log channels are captured, because the two notices this suite
 * distinguishes travel on different ones — the skip notice through the injected
 * `_log`, and the absent/malformed warning through the module-level `log`, which
 * is not an injection point and reaches `console.log`.
 */
async function runPipeline({ files = {} } = {}) {
  const fs = fakeFs({ ...baseFiles(), ...TSPEC_APPROVED_FILES, ...files });
  const listFiles = fakeListFiles({ [DOCS_DIR]: TSPEC_APPROVED_LISTING });
  const agentCalls = [];
  const emitted = [];
  const consoleLines = [];

  const originalConsoleLog = console.log;
  console.log = (...args) => consoleLines.push(args.join(" "));
  let result;
  try {
    result = await main({
      reqPath: REQ_PATH,
      _agent: makeConvergingAgent(agentCalls),
      _parallel: (promises) => Promise.all(promises),
      _log: (m) => emitted.push(String(m)),
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _listFiles: listFiles,
      ...fs.injections(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
      _phaseDodEnabled: false,
      _phasePubEnabled: false,
    });
  } finally {
    console.log = originalConsoleLog;
  }

  return { result, fs, agentCalls, emitted, consoleLines };
}

/** The final report's record for one phase. */
function phaseRecord(result, phaseId) {
  return (result.phases || []).find((p) => p.phase === phaseId) || null;
}

/** Agent dispatches whose prompt names a given document — the "did the phase run" oracle. */
function dispatchesNaming(agentCalls, docPath) {
  return agentCalls.filter((c) => c.prompt.includes(docPath));
}

/** The absent/malformed warning, on whichever channel it was written. */
function warningLines({ emitted, consoleLines }) {
  return [...emitted, ...consoleLines].filter((line) =>
    line.includes("DECISIONS_WARRANTED field absent or malformed")
  );
}

// ── Phase T really is skipped: the precondition every test below stands on ────
//
// Asserted once, on its own, rather than repeated inside each case. If the
// approval fixture ever stops skipping Phase T, this test fails alone and says
// so — instead of the two cases below silently passing through the phase-ran
// branch and testing nothing.
describe("DEC-DW-01 precondition: the fixture skips Phase T on its recorded approval", () => {
  test("Phase T is recorded ⏭ and no reviewer is dispatched for the TSPEC", async () => {
    const { result, agentCalls } = await runPipeline();

    const tRecord = phaseRecord(result, "T");
    expect(tRecord).not.toBeNull();
    expect(tRecord.status).toBe("⏭");
    expect(tRecord.detail).toBe("Skipped — approved round 2, hash FRESH");

    const tspecReviews = agentCalls.filter(
      (c) => /-review$/.test(c.skill) && c.prompt.includes(TSPEC_PATH)
    );
    expect(tspecReviews).toHaveLength(0);
  });
});

// ─── The DECISIONS document is on disk ⇒ warranted, and Phase D runs ──────────
//
// A previous run judged the alternatives load-bearing and left the artifact. The
// skip says nothing about whether that document is still adequate — Phase D's own
// convergence gate decides that, which is precisely why this branch hands it the
// phase rather than deciding for it.
describe("DEC-DW-01: a DECISIONS document present on a skipped Phase T means warranted", () => {
  test("Phase D runs, and the read is reported as coming from disk", async () => {
    const { result, agentCalls, emitted, consoleLines } = await runPipeline({
      files: { [DECISIONS_PATH]: `# DECISIONS — ${FEATURE}\n\nOne load-bearing choice.\n` },
    });

    // The D row is NOT the skip row: the phase was entered.
    const dRecord = phaseRecord(result, "D");
    expect(dRecord).not.toBeNull();
    expect(dRecord.detail).not.toBe("Skipped — no load-bearing alternatives");

    // And it was entered for real — the document went to agents.
    expect(dispatchesNaming(agentCalls, DECISIONS_PATH).length).toBeGreaterThan(0);

    // The notice names its provenance. The point is not the wording but that a
    // skip is reported as a skip, with the disk read stated as the source.
    const notice = emitted.find((line) => line.startsWith("DECISIONS_WARRANTED: true"));
    expect(notice).toBeDefined();
    expect(notice).toMatch(/Phase T skipped/);
    expect(notice).toMatch(/present/);

    // No agent was asked for a trailer, so nothing may be blamed for omitting one.
    expect(warningLines({ emitted, consoleLines })).toEqual([]);
  });
});

// ─── No DECISIONS document ⇒ unwarranted, and the run stays a no-op ───────────
//
// This is the case the defect broke. A previous run decided this feature had no
// load-bearing alternatives; re-running a fully-approved pipeline must not
// manufacture the document that decision declined to write.
describe("DEC-DW-01: no DECISIONS document on a skipped Phase T means unwarranted", () => {
  test("Phase D is skipped, nothing is authored, and no omission is reported", async () => {
    const { result, fs, agentCalls, emitted, consoleLines } = await runPipeline();

    // Asserted first, and deliberately: this is the defect itself. Under the old
    // read the run enters Phase D, whose gate then fails on a document no one
    // wrote — so a report-row assertion would red on the resulting halt and
    // describe a consequence rather than the cause.
    expect(dispatchesNaming(agentCalls, DECISIONS_PATH)).toEqual([]);
    expect(fs.writes.map((w) => w.path)).not.toContain(DECISIONS_PATH);

    const dRecord = phaseRecord(result, "D");
    expect(dRecord).not.toBeNull();
    expect(dRecord.status).toBe("⏭");
    expect(dRecord.detail).toBe("Skipped — no load-bearing alternatives");

    // The notice states the probe's own reason for the absence rather than
    // asserting one, so a future probe that distinguishes empty from missing
    // reports the distinction it drew.
    const notice = emitted.find((line) => line.startsWith("DECISIONS_WARRANTED: false"));
    expect(notice).toBeDefined();
    expect(notice).toMatch(/Phase T skipped/);

    expect(warningLines({ emitted, consoleLines })).toEqual([]);
  });
});
