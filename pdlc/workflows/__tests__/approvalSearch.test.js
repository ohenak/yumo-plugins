/**
 * approvalSearch.test.js — the H-4 fix: the two-tier approval search (TSPEC §5.4),
 * §5.1's file-verdict extraction and §5.5's staleness verdict, observed **through
 * `main()`** with injected seams.
 *
 * Owns, per PLAN §4 row RLH-24 and TSPEC §8.3's AT→file map:
 *   RLH-AT-08, RLH-AT-09, RLH-AT-10, RLH-AT-11, RLH-AT-56, RLH-AT-57.
 *
 * ## This is an L2 suite, deliberately
 *
 * PLAN §4 (RLH-24) and §11.5: the search is driven **through the composition root
 * with injected seams**, so it needs **no exported identifier** and §11.5's `N-b`
 * name for the search function is *not* observable here. Nothing below imports a
 * search symbol; every oracle is one of
 *   - `main()`'s returned final report — the phase record's status/detail (§4.7), or
 *   - the recorded `_readFile` fan-out — §5.4's "at most two `_readFile` per phase
 *     entry, tier 1 **or** tier 2, never both".
 *
 * ## RED on arrival (batch 3), green at batch 8 (PLAN §7.3)
 *
 * No approval search exists in `orchestrate-dev.js`: a skip-eligible phase entry
 * reads no cross-review file and unconditionally runs its `reviewLoop`. Every
 * assertion below therefore reds on a **missing behaviour**, not a mis-shaped one,
 * and none of them can be greened by RLH-05's round-derivation work in this same
 * batch — the oracles are the search's reads and the `"⏭"` skip record, neither of
 * which `deriveRoundWindow` produces. RLH-26 (batch 8) greens all six.
 *
 * Test names are namespaced `RLH-AT-{N}` (PLAN §1.3 / TSPEC §8.3): bare `AT-{N}`
 * collides with `documentOracles.test.js`'s pre-existing intentional red
 * `AT-22 [red-until-L-06]`.
 *
 * ## Fixture provenance
 *
 * The tier-1 `## Verdict` block and the tier-2 `## 6. Approval Record` table are
 * built from **TSPEC §4.4**, which is normative for both grammars. They are *not*
 * copied from the review / harvest SKILL.md files: RLH-07 and RLH-09, which write
 * those templates into the SKILLs, do not run in this batch, so the SKILLs do not
 * yet carry them.
 *
 * Seam doubles come from `__tests__/helpers/seams.js` (RLH-02) — the one canonical
 * seam-double module. No ad-hoc seam object is defined here.
 */

import { createHash } from "crypto";

import main from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";

// ───────────────────────────── the fixture branch ─────────────────────────────

/** The feature every fixture below sits on. */
const FEATURE = "approval-feat";

/** `docs/{feature}` — the one directory `_listFiles` is ever asked about. */
const DOCS_DIR = `docs/${FEATURE}`;

const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS_DIR}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS_DIR}/TSPEC-${FEATURE}.md`;
const PLAN_PATH = `${DOCS_DIR}/PLAN-${FEATURE}.md`;
const PROPERTIES_PATH = `${DOCS_DIR}/PROPERTIES-${FEATURE}.md`;
const LEARNINGS_PATH = `${DOCS_DIR}/LEARNINGS-${FEATURE}.md`;

/**
 * TSPEC §3.9's reviewer-skill → role-slug `MAP`, restated as the two role slugs
 * Phase F's `PHASE_DISPATCH.F.reviewers` pair (`["se-review", "te-review"]`)
 * resolves to. Restated rather than imported: `MAP` is module-private, and a test
 * that imported it would agree with a wrong catalogue by construction.
 */
const SE_SLUG = "software-engineer";
const TE_SLUG = "test-engineer";

/** Phase F reviews the FSPEC, so every tier-1 fixture below is `-FSPEC-`. */
const DOC_TYPE = "FSPEC";

/**
 * A tier-1 cross-review basename (TSPEC §5.2 G-1…G-4).
 * @param {string} roleSlug
 * @param {number} round  branch-absolute; `1` still gets its `-v1` suffix here,
 *   because every fixture in this file is explicit about the round it claims.
 * @returns {string}
 */
function crossReviewBasename(roleSlug, round) {
  return `CROSS-REVIEW-${roleSlug}-${DOC_TYPE}-v${round}.md`;
}

/**
 * The same file as a repo-relative path, which is the form `_readFile` sees.
 * @param {string} roleSlug
 * @param {number} round
 * @returns {string}
 */
function crossReviewPath(roleSlug, round) {
  return `${DOCS_DIR}/${crossReviewBasename(roleSlug, round)}`;
}

// ─────────────────────── §5.3's digest, recomputed locally ────────────────────

/**
 * TSPEC §5.3's `canonicaliseForDigest`: N-1 normalises CRLF/CR to LF, N-2 forces
 * exactly one trailing newline.
 *
 * Restated here rather than imported. The production digest is deliberately
 * unexported and hand-rolled (no `crypto`, no `TextEncoder`, C-2); this file needs
 * only *a* value the production hash must agree with, and computing it with node's
 * own SHA-256 makes the fixture an **independent** oracle instead of a tautology.
 *
 * @param {string} text
 * @returns {string}
 */
function canonicaliseForDigest(text) {
  const lf = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return lf.replace(/\n*$/, "\n");
}

/**
 * TSPEC §5.3's `approvalHashOf` — `sha256:` plus 64 lowercase hex over the UTF-8
 * bytes of the canonicalised text.
 * @param {string} text
 * @returns {string}
 */
function approvalHashOf(text) {
  const hex = createHash("sha256")
    .update(Buffer.from(canonicaliseForDigest(text), "utf8"))
    .digest("hex");
  return `sha256:${hex}`;
}

/** A syntactically valid anchor that is **not** any fixture document's digest. */
const WRONG_HASH = `sha256:${"b".repeat(64)}`;

// ──────────────────────── tier-1 fixture: TSPEC §4.4's block ──────────────────

/** `parseVerdict`'s `VALID_VERDICTS`, as TSPEC §4.4's Verdict column names them. */
const APPROVED = "Approved";
const APPROVED_MINOR = "Approved with minor changes";
const NEEDS_REVISION = "Needs revision";

/**
 * One tier-1 cross-review file, shaped like TSPEC §4.4's `## Verdict` template —
 * the same template RLH-07 writes into `pdlc/skills/{se,pm,te}-review/SKILL.md`,
 * taken from the TSPEC because that task is not in this batch.
 *
 * Two carriers, two producers (§4.4): the reviewer agent writes `VERDICT:` plus
 * the JSON counts as the file's **last section**, and the script *appends*
 * `APPROVAL-HASH:` / `REVIEWED-COMMIT:` afterwards. The prose above the section is
 * real content, not filler: §5.1 locates the section by the **last** visited
 * `## Verdict` heading, and a fixture with no body would not exercise that.
 *
 * @param {{
 *   verdict: string,
 *   hash?: string|null,          // omit/null ⇒ no APPROVAL-HASH: line at all (§6.2 row 6)
 *   commit?: string,
 *   counts?: {high: number, medium: number, low: number},
 *   duplicateVerdict?: boolean,  // emit a SECOND `VERDICT:` line (E-09, AT-11)
 * }} spec
 * @returns {string}
 */
function crossReviewFile({
  verdict,
  hash = null,
  commit = "unavailable",
  counts = { high: 0, medium: 0, low: 0 },
  duplicateVerdict = false,
}) {
  const countsLine = JSON.stringify(counts);
  const lines = [
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
    `VERDICT: ${verdict}`,
    countsLine,
  ];
  if (duplicateVerdict) {
    // E-09 / AT-11: a second trailer in the SAME trailing section. `parseVerdict`
    // scans from the end and would happily return this one; §5.1 step 2's
    // pre-count must fail closed before it is ever consulted.
    lines.push("", `VERDICT: ${verdict}`, countsLine);
  }
  if (hash) {
    lines.push("", `APPROVAL-HASH: ${hash}`, `REVIEWED-COMMIT: ${commit}`);
  }
  return `${lines.join("\n")}\n`;
}

// ──────────────────── tier-2 fixture: TSPEC §4.4's §6 table ───────────────────

/** TSPEC §4.4's six Approval Record columns, in order. */
const APPROVAL_RECORD_COLUMNS = Object.freeze([
  "Document Type",
  "Round",
  "Role",
  "Verdict",
  "Approval Hash",
  "Reviewed Commit",
]);

/**
 * A `LEARNINGS-{feature}.md` carrying TSPEC §4.4's tier-2 `## 6. Approval Record`
 * section as its final top-level section, with the five pre-existing sections'
 * numbers untouched. A feature with no approving round still emits the heading and
 * the header row with no data rows, so `rows: []` is a legal fixture.
 *
 * @param {Array<{docType?: string, round: number, role: string, verdict: string,
 *                hash?: string, commit?: string}>} rows
 * @returns {string}
 */
function learningsWithApprovalRecord(rows = []) {
  const body = rows.map((r) =>
    `| ${r.docType ?? DOC_TYPE} | ${r.round} | ${r.role} | ${r.verdict} | ` +
    `${r.hash ?? "unavailable"} | ${r.commit ?? "unavailable"} |`
  );
  return [
    `# LEARNINGS — ${FEATURE}`,
    "",
    "## 1. What went well",
    "",
    "## 2. What went badly",
    "",
    "## 3. Surprises",
    "",
    "## 4. Process changes",
    "",
    "## 5. Open questions",
    "",
    "## 6. Approval Record",
    "",
    `| ${APPROVAL_RECORD_COLUMNS.join(" | ")} |`,
    `|${APPROVAL_RECORD_COLUMNS.map(() => "---").join("|")}|`,
    ...body,
    "",
  ].join("\n");
}

// ───────────────────────────── the pipeline driver ────────────────────────────

/** Document bodies for the fixture branch. The FSPEC's bytes are what §5.5 hashes. */
const FSPEC_BODY = `# FSPEC — ${FEATURE}\n\nThe functional specification, as it stands on the branch.\n`;

/** The branch documents every fixture starts from, before its own overlay. */
function baseFiles() {
  return {
    [REQ_PATH]: `# REQ — ${FEATURE}\n\nready: true\n`,
    [FSPEC_PATH]: FSPEC_BODY,
    [TSPEC_PATH]: `# TSPEC — ${FEATURE}\n`,
    [PLAN_PATH]: `# PLAN — ${FEATURE}\n`,
    [PROPERTIES_PATH]: `# PROPERTIES — ${FEATURE}\n`,
  };
}

/**
 * A recording agent that converges every review loop on its first iteration and
 * satisfies every downstream phase gate. It is **not** a seam double — seams come
 * from `helpers/seams.js`; this is the runtime's `agent()` capability, which
 * `main()` already parameterises as `_agent`.
 *
 * @param {Array<{skill: string, prompt: string}>} log
 */
function makeConvergingAgent(log) {
  return async (skill, prompt) => {
    log.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
        return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
      }
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
 * Phases DOD and PUB are disabled: they rebase, poll CI and shell out, and neither
 * is skip-eligible (§5.5's scope is `R`, `F`, `T`, `P`, `D`, `PR`), so they can
 * only add failure modes unrelated to the search.
 *
 * @param {{ files?: Record<string, string>, listing?: string[] }} spec
 *   `files` overlays `baseFiles()`; `listing` is what `_listFiles(DOCS_DIR)`
 *   returns — basenames, not paths (§3.2).
 */
async function runPipeline({ files = {}, listing = [] } = {}) {
  const fs = fakeFs({ ...baseFiles(), ...files });
  const listFiles = fakeListFiles({ [DOCS_DIR]: listing });
  const agentCalls = [];

  const result = await main({
    reqPath: REQ_PATH,
    _agent: makeConvergingAgent(agentCalls),
    _parallel: (promises) => Promise.all(promises),
    _log: () => {},
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _listFiles: listFiles,
    ...fs.injections(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phaseDodEnabled: false,
    _phasePubEnabled: false,
  });

  return { result, fs, listFiles, agentCalls };
}

/**
 * The final report's record for one phase (§4.7 — `recordPhase`'s row).
 * @param {{phases: Array<{phase: string}>}} result
 * @param {string} phaseId
 */
function phaseRecord(result, phaseId) {
  return (result.phases || []).find((p) => p.phase === phaseId) || null;
}

/** Every path `_readFile` was called with, in order. */
function readPaths(fs) {
  return fs.reads.map((r) => r.path);
}

/** The digest the FSPEC's working-tree bytes actually have (§5.5's `FRESH` value). */
const FSPEC_HASH = approvalHashOf(FSPEC_BODY);

// `reviewLoop`'s per-iteration progress lines go through the module-level `log`,
// which is not one of `main()`'s injection points. Silenced so a failure report is
// the assertion and not two hundred lines of pipeline chatter.
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = () => {};
});
afterEach(() => {
  console.log = originalConsoleLog;
});

/** Reviewer dispatches that name a given document — the "did the phase run" oracle. */
function reviewerDispatchesFor(agentCalls, docPath) {
  return agentCalls.filter(
    (c) => /-review$/.test(c.skill) && c.prompt.includes(docPath)
  );
}

// ─── RLH-AT-08: same-round dual approval skips the phase (AC-4.1, AC-4.1a) ────
//
// Round 2's two cross-reviews both carry `VERDICT: Approved` and the SAME
// `APPROVAL-HASH:`, and that hash is the FSPEC's working-tree digest. §5.4's
// candidate is 2, tier 1 is unanimous, §5.5 reads `FRESH`, and Phase F is skipped.
describe("RLH-AT-08: same-round dual approval skips the phase", () => {
  const listing = [crossReviewBasename(SE_SLUG, 2), crossReviewBasename(TE_SLUG, 2)];
  const files = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({
      verdict: APPROVED_MINOR,
      hash: FSPEC_HASH,
      counts: { high: 0, medium: 0, low: 3 },
    }),
  };

  test("RLH-AT-08: Phase F is recorded ⏭ with §4.7's skip notice, naming round 2", async () => {
    const { result, fs, agentCalls } = await runPipeline({ files, listing });

    const fRecord = phaseRecord(result, "F");
    expect(fRecord).not.toBeNull();
    // §4.7: the per-phase skip reuses the existing `"⏭"` status marker.
    expect(fRecord.status).toBe("⏭");
    // §4.7's detail string is specified, not left to the writer. No POSTMORTEM
    // exists for (F, feature), so the bracketed clause must be absent.
    expect(fRecord.detail).toBe("Skipped — approved round 2, hash FRESH");
    // …and the row still names the document under review (AT-08's "names the document").
    expect(fRecord.label).toMatch(/FSPEC/);

    // Both approving reviews were consulted — §5.4's two-`_readFile` fan-out.
    const paths = readPaths(fs);
    expect(paths).toContain(crossReviewPath(SE_SLUG, 2));
    expect(paths).toContain(crossReviewPath(TE_SLUG, 2));
    // §5.5 rule 1: the comparison consults the document at comparison time — but
    // through `_hashFile`, which yields the digest without carrying the bytes
    // back across the seam. The comparison never wanted the bytes, and in the
    // workflow runtime `_readFile` is a per-chunk agent fan-out, so the whole
    // document was being transported to produce 64 hex characters. Both halves
    // are asserted: the digest IS taken, and the whole-file read is NOT.
    expect(fs.hashes.map((h) => h.path)).toContain(FSPEC_PATH);
    expect(paths).not.toContain(FSPEC_PATH);

    // A skipped phase dispatches no reviewer for its document.
    expect(reviewerDispatchesFor(agentCalls, FSPEC_PATH)).toEqual([]);
    expect(result.outcome).toBe("success");
  });
});

// ─── RLH-AT-10: an absent role file is not approving; tiers are exclusive ─────
//
// Round 2 has only the SE cross-review, approving, anchored to the FSPEC's real
// digest — and `LEARNINGS-{feature}.md` carries a tier-2 `## 6. Approval Record`
// in which **both** roles approved round 2 at that same digest.
//
// §5.4: tier 1 "produced a file at all", so tier 2 is never consulted; within
// tier 1 the missing `test-engineer` file is a NON-approval, not a partial one.
// The phase therefore runs. An implementation that completed the pair from tier 2
// — the cross-tier completion §5.4 forbids — would find unanimity and skip.
describe("RLH-AT-10: absent role file is not approving, and tier 2 is not read", () => {
  const listing = [
    crossReviewBasename(SE_SLUG, 2),
    `LEARNINGS-${FEATURE}.md`,
  ];
  const files = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [LEARNINGS_PATH]: learningsWithApprovalRecord([
      { round: 2, role: SE_SLUG, verdict: APPROVED, hash: FSPEC_HASH },
      { round: 2, role: TE_SLUG, verdict: APPROVED, hash: FSPEC_HASH },
    ]),
  };

  test("RLH-AT-10: tier 1 governs, LEARNINGS is never read, and Phase F runs", async () => {
    const { result, fs } = await runPipeline({ files, listing });

    // Tier 1's role-asymmetry is a non-approval.
    expect(phaseRecord(result, "F")).not.toBeNull();
    expect(phaseRecord(result, "F").status).not.toBe("⏭");

    const paths = readPaths(fs);
    // Tier 1 WAS consulted — §5.4 walks the reviewer pair in `PHASE_DISPATCH`
    // order, so the present `software-engineer` file is read before the missing
    // `test-engineer` one is discovered. This conjunct is the batch-3 red.
    expect(paths).toContain(crossReviewPath(SE_SLUG, 2));
    // …and tier 2 was NOT, because tier selection is exclusive.
    //
    // The oracle is the reads that PRECEDE Phase F's first read of the FSPEC, not
    // the whole run: Phase H's harvest dispatch reads `LEARNINGS-{feature}.md` for
    // its own, unrelated reasons (`dispatchAndVerify`'s before/after measurement of
    // its `targetPath`), which no correct §5.4 implementation can suppress. Phase F's
    // gate runs strictly before that, and a cross-tier completion would land its
    // tier-2 read inside this window — immediately after the tier-1 SE read above.
    expect(paths).toContain(FSPEC_PATH);
    const gateWindow = paths.slice(0, paths.indexOf(FSPEC_PATH));
    expect(gateWindow).toContain(crossReviewPath(SE_SLUG, 2));
    expect(gateWindow).not.toContain(LEARNINGS_PATH);
  });
});

// ─── RLH-AT-09: cross-round approvals never combine (E-11, TSPEC §5.4) ────────
//
// Round 2 is SE-approving, round 3 is TE-approving; neither round is unanimous.
// Both anchors carry the FSPEC's real digest, so an implementation that merged the
// two rounds' approving halves would find a unanimous pair, read `FRESH`, and skip
// Phase F. §5.4's single-highest-round candidate forbids it: `candidate` is 3 and
// nothing else is consulted.
describe("RLH-AT-09: cross-round approvals never combine", () => {
  const listing = [
    crossReviewBasename(SE_SLUG, 2),
    crossReviewBasename(TE_SLUG, 2),
    crossReviewBasename(SE_SLUG, 3),
    crossReviewBasename(TE_SLUG, 3),
  ];
  const files = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ verdict: NEEDS_REVISION, hash: FSPEC_HASH }),
    [crossReviewPath(SE_SLUG, 3)]: crossReviewFile({ verdict: NEEDS_REVISION, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 3)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
  };

  test("RLH-AT-09: Phase F runs, and only the candidate round 3 is consulted", async () => {
    const { result, fs } = await runPipeline({ files, listing });

    // The phase ran: no `"⏭"` approval skip.
    expect(phaseRecord(result, "F")).not.toBeNull();
    expect(phaseRecord(result, "F").status).not.toBe("⏭");

    const paths = readPaths(fs);
    // The candidate round — and only it — was read (§5.4's single-highest-round rule).
    expect(paths).toContain(crossReviewPath(SE_SLUG, 3));
    expect(paths).toContain(crossReviewPath(TE_SLUG, 3));
    expect(paths).not.toContain(crossReviewPath(SE_SLUG, 2));
    expect(paths).not.toContain(crossReviewPath(TE_SLUG, 2));
  });
});

// ─── RLH-AT-11: a duplicated verdict field fails closed (E-09, TSPEC §5.1) ────
//
// Round 2's SE cross-review carries TWO `VERDICT: Approved` lines inside its
// trailing `## Verdict` section; the TE file is a clean single approval. Both
// anchors are the FSPEC's real digest, so **every other input says "skip"** — the
// only thing standing between this fixture and a wrongly-skipped phase is §5.1
// step 2's duplicate pre-count, which fails closed *before* `parseVerdict` is
// consulted. `parseVerdict` scans from the end and would return `Approved`, so an
// implementation that relied on its result would skip Phase F.
describe("RLH-AT-11: duplicated verdict field fails closed", () => {
  const listing = [crossReviewBasename(SE_SLUG, 2), crossReviewBasename(TE_SLUG, 2)];
  const files = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({
      verdict: APPROVED,
      hash: FSPEC_HASH,
      duplicateVerdict: true,
    }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
  };

  test("RLH-AT-11: Phase F runs even though scan-from-end would read Approved", async () => {
    const { result, fs, agentCalls } = await runPipeline({ files, listing });

    // The pre-count reported unparseable: no approval, so the phase runs.
    expect(phaseRecord(result, "F")).not.toBeNull();
    expect(phaseRecord(result, "F").status).not.toBe("⏭");
    expect(reviewerDispatchesFor(agentCalls, FSPEC_PATH).length).toBeGreaterThan(0);

    // The offending file was actually read — the verdict was extracted from the
    // file's bytes (§5.1), not inferred from its existence.
    expect(readPaths(fs)).toContain(crossReviewPath(SE_SLUG, 2));
  });
});

// ─── RLH-AT-56: a partial or disagreeing anchor pair yields no approval ───────
//
// (E-63, E-64, SE-v1 F-02.) Both of round 2's cross-reviews are `Approved`, so
// §5.4's isPass half of unanimity holds; what fails is the anchor half —
// (a) only the SE file carries an `APPROVAL-HASH:`, (b) the two files carry
// **different** values. §6.2 row 6 dispositions both as `UNEVALUABLE`: the phase
// runs and the offending files are named in the report. Adopting either file's
// value as `recordedHash` — the failure FSPEC §19 calls out — would skip (a) and
// coin-flip (b).
describe("RLH-AT-56: a partial or disagreeing anchor pair yields no approval", () => {
  const listing = [crossReviewBasename(SE_SLUG, 2), crossReviewBasename(TE_SLUG, 2)];

  /** (a) The anchor is on the SE file only; the TE file has none at all. */
  const partialFiles = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: null }),
  };

  /** (b) Both files carry an anchor, and they disagree. */
  const disagreeingFiles = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: WRONG_HASH }),
  };

  test("RLH-AT-56: Phase F runs in both cases and the report names the offending files", async () => {
    // (a) partial pair — the TE file is the one with no anchor.
    const partial = await runPipeline({ files: partialFiles, listing });
    expect(phaseRecord(partial.result, "F")).not.toBeNull();
    expect(phaseRecord(partial.result, "F").status).not.toBe("⏭");
    expect(JSON.stringify(partial.result)).toContain(crossReviewPath(TE_SLUG, 2));

    // (b) disagreeing pair — neither value may be adopted, so both are offending.
    const disagreeing = await runPipeline({ files: disagreeingFiles, listing });
    expect(phaseRecord(disagreeing.result, "F")).not.toBeNull();
    expect(phaseRecord(disagreeing.result, "F").status).not.toBe("⏭");
    const report = JSON.stringify(disagreeing.result);
    expect(report).toContain(crossReviewPath(SE_SLUG, 2));
    expect(report).toContain(crossReviewPath(TE_SLUG, 2));
  });
});

// ─── RLH-AT-57: a higher non-approving round denies an earlier approval ───────
//
// (E-65, TE-v1 F-01.) Round 2 is a complete, unanimous approval anchored to the
// FSPEC's current bytes; round 3 is a complete `Needs revision` pair over the same
// unedited document. §5.4's candidate is the single highest round present — 3 —
// and there is no descending walk, so round 2's approval is unreachable and the
// phase runs. A search that descended past round 3 would fail open and discard a
// completed review round.
describe("RLH-AT-57: a higher non-approving round denies an earlier approval", () => {
  const listing = [
    crossReviewBasename(SE_SLUG, 2),
    crossReviewBasename(TE_SLUG, 2),
    crossReviewBasename(SE_SLUG, 3),
    crossReviewBasename(TE_SLUG, 3),
  ];
  const files = {
    [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ verdict: APPROVED, hash: FSPEC_HASH }),
    // A non-approving round reaches no PASS gate, so §5.3's anchor is never
    // appended to either round-3 file.
    [crossReviewPath(SE_SLUG, 3)]: crossReviewFile({
      verdict: NEEDS_REVISION,
      counts: { high: 1, medium: 0, low: 0 },
    }),
    [crossReviewPath(TE_SLUG, 3)]: crossReviewFile({
      verdict: NEEDS_REVISION,
      counts: { high: 0, medium: 2, low: 0 },
    }),
  };

  test("RLH-AT-57: Phase F runs, round 3 is the candidate, and round 2 is not read", async () => {
    const { result, fs } = await runPipeline({ files, listing });

    expect(phaseRecord(result, "F")).not.toBeNull();
    expect(phaseRecord(result, "F").status).not.toBe("⏭");

    const paths = readPaths(fs);
    expect(paths).toContain(crossReviewPath(SE_SLUG, 3));
    expect(paths).toContain(crossReviewPath(TE_SLUG, 3));
    // No descending walk: the approving round 2 is never opened.
    expect(paths).not.toContain(crossReviewPath(SE_SLUG, 2));
    expect(paths).not.toContain(crossReviewPath(TE_SLUG, 2));
  });
});
