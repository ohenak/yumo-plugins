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
