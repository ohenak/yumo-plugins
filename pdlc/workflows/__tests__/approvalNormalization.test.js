/**
 * approvalNormalization.test.js — DEC-APPROVAL-03: approval freshness is
 * SEMANTIC, so `file:line` anchor movement no longer stales an approval.
 *
 * ## Why this exists (the measured cost, not a hypothetical)
 *
 * On `pdlc-consolidation-agent`, six edits that changed nothing but a line-number
 * anchor — `SKILL.md:70-78` became `SKILL.md:70-79` because an unrelated line was
 * inserted above it — each staled a recorded `APPROVAL-HASH:` and re-opened its
 * phase's review loop. Four phases, ~25 extra Opus rounds, and not one byte of
 * reviewed *meaning* had moved. The operator decision: anchor churn is not a
 * change to what was approved; every other byte still is.
 *
 * ## What is pinned here, and where the boundary of the claim sits
 *
 * Five groups, matching the five ways this can go wrong:
 *
 *   (a) `normalizeForApproval` neutralises the two documented token shapes and —
 *       the half that actually protects the operator — leaves every NEAR-MISS
 *       shape alone. A normalisation that swallowed `v1.5`, `T20` or a clock time
 *       would silently hold approvals over real edits, which is a worse failure
 *       than the one it fixes, so the near-miss table is the larger of the two.
 *   (b) end-to-end: an approval recorded with BOTH anchors survives an
 *       anchor-only edit — the phase is skipped, no reviewer is dispatched.
 *   (c) end-to-end: one non-anchor byte still stales it. Without this, (b) is
 *       indistinguishable from an approval that never expires.
 *   (d) a LEGACY approval (raw anchor only) behaves exactly as it did before this
 *       feature existed — it stales on the same anchor-only edit (b) survives.
 *   (e) the anchor block's shape, and the harvest/pre-count readers that parse
 *       it, are unchanged by the third line: `approvalAnchorPreCount` still sees
 *       exactly one `APPROVAL-HASH:`, and `parseVerdict` still ignores the
 *       trailing block.
 *
 * ## Seam doubles
 *
 * From `__tests__/helpers/seams.js` (the one canonical module). Note `fakeFs`'s
 * `_hashNormalizedFile` double: the semantic digest is taken through its OWN seam
 * for the same reason the raw one is, so that neither puts the document's bytes
 * back on `_readFile` and undoes the fan-out saving `hashFileSeam.test.js` pins.
 */

import { createHash } from "crypto";

import main, {
  approvalAnchorPreCount,
  approvalHashOfNormalized,
  normalizeForApproval,
  parseApprovalHash,
  parseVerdict,
} from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";

// ───────────────────────── (a) the normalisation itself ───────────────────────

describe("DEC-APPROVAL-03(a): normalizeForApproval neutralises anchors, and only anchors", () => {
  // The shapes that MUST collapse. Each pair is "before" and "after an unrelated
  // line moved above it" — the exact churn that cost the four phases. The oracle
  // is equality of the normalised forms, not a literal expected string, because
  // what the feature promises is that the two compare equal, not that they
  // compare equal to any particular sentinel.
  const MOVED = {
    "a filename with a line range": [
      "See `pdlc/skills/pm-author/SKILL.md:70-78` for the clause.",
      "See `pdlc/skills/pm-author/SKILL.md:71-79` for the clause.",
    ],
    "a filename with a single line": [
      "`orchestrate-dev.js:1842` derives the window.",
      "`orchestrate-dev.js:1851` derives the window.",
    ],
    "a repo-relative path": [
      "docs/feat/REQ-feat.md:12-40 is the source.",
      "docs/feat/REQ-feat.md:13-41 is the source.",
    ],
    "a dotted runtime file": [
      "runtime-adapter.js:929-931 retries.",
      "runtime-adapter.js:930-932 retries.",
    ],
    "the abbreviated backtick cell anchor": [
      "| SKILL.md | `:70-79` | the clause |",
      "| SKILL.md | `:71-80` | the clause |",
    ],
    "several anchors at once, in one document": [
      "a `SKILL.md:70-78` b `orchestrate-dev.js:1842` c `:70-79` d",
      "a `SKILL.md:99-107` b `orchestrate-dev.js:2000` c `:12-21` d",
    ],
  };

  it.each(Object.entries(MOVED))("%s: movement does not change the normalised form", (_label, [before, after]) => {
    expect(before).not.toBe(after); // not vacuous — the raw bytes really differ
    expect(normalizeForApproval(before)).toBe(normalizeForApproval(after));
    expect(approvalHashOfNormalized(before)).toBe(approvalHashOfNormalized(after));
  });

  // The other half, and the one that keeps the feature honest. Every entry is a
  // digit shape a sloppier regex would eat. If any of these normalise away, an
  // approval outlives a real edit — which is why they are asserted as
  // "unchanged", the strongest available statement.
  const UNTOUCHED = [
    ["a version string", "Ships in v1.5 of the plugin."],
    ["a dotted version with a colon after prose", "Version: 1.5 shipped."],
    ["a task id", "T20 depends on T19."],
    ["a section reference", "See §5.3 and §4.4."],
    ["a clock time", "The run started at 12:30 and ended at 14:05."],
    ["a duration", "Timeout 5:00 minutes."],
    ["a ratio", "A 3:1 fan-out."],
    ["a bare line number in prose", "See line 70 of the skill."],
    ["a markdown ordered list", "1. first\n2. second\n"],
    ["a table of counts", '{"high": 0, "medium": 3, "low": 12}'],
    ["a heading with a number", "## 4. Interfaces"],
    ["a filename with no anchor", "`orchestrate-dev.js` derives the window."],
    ["a colon before non-digits", "Note: seventy through seventy-eight."],
  ];

  it.each(UNTOUCHED)("%s is left byte-identical", (_label, text) => {
    expect(normalizeForApproval(text)).toBe(text);
  });

  it("distinguishes a single-line anchor from a range — widening a citation is an edit", () => {
    // `:1842` and `:1842-1850` are different claims about the code, not the same
    // claim that moved. Collapsing both to one token would hold an approval over
    // a reviewer-visible change.
    expect(normalizeForApproval("`a.js:1842`")).not.toBe(normalizeForApproval("`a.js:1842-1850`"));
  });

  it("is total and idempotent", () => {
    // Total: the phase gate calls it on whatever the branch holds, and a throw
    // there would halt a pipeline over a citation.
    expect(() => normalizeForApproval("")).not.toThrow();
    expect(normalizeForApproval(undefined)).toBe("");
    expect(normalizeForApproval(null)).toBe("");

    // Idempotent: the output contains no token either rule still matches, which
    // is what lets a normalised digest be compared to a normalised digest
    // without asking which side was normalised when.
    const once = normalizeForApproval("`SKILL.md:70-78` and `:70-79` and a.js:12");
    expect(normalizeForApproval(once)).toBe(once);
  });
});

// ───────────────────── the end-to-end fixture branch (b–d) ────────────────────

const FEATURE = "approval-norm-feat";
const DOCS_DIR = `docs/${FEATURE}`;

const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS_DIR}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS_DIR}/TSPEC-${FEATURE}.md`;
const PLAN_PATH = `${DOCS_DIR}/PLAN-${FEATURE}.md`;
const PROPERTIES_PATH = `${DOCS_DIR}/PROPERTIES-${FEATURE}.md`;

/** TSPEC §3.9's reviewer-skill → role-slug map, for Phase F's `["se-review", "te-review"]`. */
const SE_SLUG = "software-engineer";
const TE_SLUG = "test-engineer";
const DOC_TYPE = "FSPEC";

const crossReviewBasename = (roleSlug, round) => `CROSS-REVIEW-${roleSlug}-${DOC_TYPE}-v${round}.md`;
const crossReviewPath = (roleSlug, round) => `${DOCS_DIR}/${crossReviewBasename(roleSlug, round)}`;

/**
 * §5.3's digest, recomputed with node's own SHA-256 so the fixture is an
 * INDEPENDENT oracle rather than a tautology against the module's hand-rolled
 * implementation. `normalizeForApproval` is imported rather than restated — it
 * is the grammar under test, and a second copy of it here would only assert that
 * two hand-written regexes agree.
 */
function canonicaliseForDigest(text) {
  return String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n*$/, "\n");
}
function sha256Anchor(text) {
  const hex = createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
  return `sha256:${hex}`;
}
const rawAnchorOf = (text) => sha256Anchor(canonicaliseForDigest(text));
const normalizedAnchorOf = (text) => sha256Anchor(canonicaliseForDigest(normalizeForApproval(text)));

/**
 * The FSPEC as the reviewers approved it, and the same FSPEC after an unrelated
 * insertion pushed every citation down one line. Nothing else differs — that is
 * the whole point of the pair.
 */
const FSPEC_APPROVED = [
  `# FSPEC — ${FEATURE}`,
  "",
  "The functional specification, as the reviewers read it.",
  "",
  "| Claim | Anchor |",
  "|---|---|",
  "| The pacing clause | `pdlc/skills/pm-author/SKILL.md:70-78` |",
  "| The round window | `orchestrate-dev.js:1842` |",
  "| The retry budget | `:929-931` |",
  "",
].join("\n");

const FSPEC_ANCHORS_MOVED = FSPEC_APPROVED.replace("SKILL.md:70-78", "SKILL.md:71-79")
  .replace("orchestrate-dev.js:1842", "orchestrate-dev.js:1843")
  .replace("`:929-931`", "`:930-932`");

/** The same document with one word of MEANING changed, and no anchor touched. */
const FSPEC_SEMANTIC_EDIT = FSPEC_APPROVED.replace("The retry budget", "The retry ceiling");

/**
 * One tier-1 cross-review, shaped like TSPEC §4.4's `## Verdict` block with the
 * script-appended anchors beneath it. `normalizedHash` omitted models a LEGACY
 * approval — one recorded before DEC-APPROVAL-03 existed.
 */
function crossReviewFile({ hash, normalizedHash = null, commit = "unavailable" }) {
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
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
    `APPROVAL-HASH: ${hash}`,
  ];
  if (normalizedHash) lines.push(`APPROVAL-HASH-NORMALIZED: ${normalizedHash}`);
  lines.push(`REVIEWED-COMMIT: ${commit}`);
  return `${lines.join("\n")}\n`;
}

function baseFiles(fspecBody) {
  return {
    [REQ_PATH]: `# REQ — ${FEATURE}\n\nready: true\n`,
    [FSPEC_PATH]: fspecBody,
    [TSPEC_PATH]: `# TSPEC — ${FEATURE}\n`,
    [PLAN_PATH]:
      `# PLAN — ${FEATURE}\n\n| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n` +
      "| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n",
    [PROPERTIES_PATH]: `# PROPERTIES — ${FEATURE}\n`,
  };
}

function makeConvergingAgent(log) {
  return async (skill, prompt) => {
    log.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
    if (/-review$/.test(skill)) {
      return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (/-author$/.test(skill)) {
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
 * Drive the pipeline over one FSPEC body with one pair of round-2 cross-reviews.
 * Phases DOD and PUB are off: they rebase, poll CI and shell out, and neither is
 * skip-eligible, so they can only add failure modes unrelated to the gate.
 */
async function runPipeline({ fspecBody, reviews }) {
  const fs = fakeFs({ ...baseFiles(fspecBody), ...reviews });
  const listFiles = fakeListFiles({
    [DOCS_DIR]: [crossReviewBasename(SE_SLUG, 2), crossReviewBasename(TE_SLUG, 2)],
  });
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

  return { result, fs, agentCalls };
}

const phaseRecord = (result, phaseId) => (result.phases || []).find((p) => p.phase === phaseId) || null;
const reviewerDispatchesFor = (agentCalls, docPath) =>
  agentCalls.filter((c) => /-review$/.test(c.skill) && c.prompt.includes(docPath));

// `reviewLoop`'s per-iteration progress goes through the module-level `log`,
// which is not an injection point. Silenced so a failure report is the assertion.
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = () => {};
});
afterEach(() => {
  console.log = originalConsoleLog;
});

/** Both round-2 reviews, approving, at the given pair of anchors. */
const reviewsAt = (hash, normalizedHash) => ({
  [crossReviewPath(SE_SLUG, 2)]: crossReviewFile({ hash, normalizedHash }),
  [crossReviewPath(TE_SLUG, 2)]: crossReviewFile({ hash, normalizedHash }),
});

// ───────── (b) dual anchors survive an anchor-only edit, end to end ───────────

describe("DEC-APPROVAL-03(b): a dual-anchored approval survives anchor-only movement", () => {
  it("skips Phase F, names the reason, and dispatches no reviewer", async () => {
    const { result, fs, agentCalls } = await runPipeline({
      // The branch holds the MOVED document…
      fspecBody: FSPEC_ANCHORS_MOVED,
      // …while the approval pins the bytes the reviewers actually read.
      reviews: reviewsAt(rawAnchorOf(FSPEC_APPROVED), normalizedAnchorOf(FSPEC_APPROVED)),
    });

    // Not vacuous: the RAW comparison genuinely fails here. If these two were
    // equal the test would pass without the feature existing at all.
    expect(rawAnchorOf(FSPEC_APPROVED)).not.toBe(rawAnchorOf(FSPEC_ANCHORS_MOVED));
    expect(normalizedAnchorOf(FSPEC_APPROVED)).toBe(normalizedAnchorOf(FSPEC_ANCHORS_MOVED));

    const fRecord = phaseRecord(result, "F");
    expect(fRecord.status).toBe("⏭");
    expect(fRecord.detail).toBe(
      "Skipped — approved round 2, approval held: only line-number anchors moved since review"
    );

    // The operator is TOLD, in the report, that a byte-stale document was held
    // approved. A silent widening of FRESH would be the same defect as a silent
    // staleness.
    expect(result.notices.join("\n")).toContain("only in line-number anchors");
    expect(result.notices.join("\n")).toContain(FSPEC_PATH);

    // The saving itself: no reviewer ran on the FSPEC.
    expect(reviewerDispatchesFor(agentCalls, FSPEC_PATH)).toEqual([]);
    expect(result.outcome).toBe("success");

    // The semantic digest is taken through its own seam, so the bytes never
    // return across `_readFile` — the fan-out saving is preserved on this path.
    expect(fs.normalizedHashes.map((h) => h.path)).toContain(FSPEC_PATH);
    expect(fs.reads.map((r) => r.path)).not.toContain(FSPEC_PATH);
  });
});

// ───────── (c) one non-anchor byte still stales the same approval ─────────────

describe("DEC-APPROVAL-03(c): a semantic edit still stales a dual-anchored approval", () => {
  it("runs Phase F when a non-anchor byte changed", async () => {
    const { result, agentCalls } = await runPipeline({
      fspecBody: FSPEC_SEMANTIC_EDIT,
      reviews: reviewsAt(rawAnchorOf(FSPEC_APPROVED), normalizedAnchorOf(FSPEC_APPROVED)),
    });

    // The edit moved no anchor — so ONLY the semantic rule can distinguish it,
    // which is exactly the claim.
    expect(normalizedAnchorOf(FSPEC_APPROVED)).not.toBe(normalizedAnchorOf(FSPEC_SEMANTIC_EDIT));

    const fRecord = phaseRecord(result, "F");
    expect(fRecord.status).not.toBe("⏭");
    expect(reviewerDispatchesFor(agentCalls, FSPEC_PATH).length).toBeGreaterThan(0);
  });
});

// ───────── (d) a legacy raw-only approval is untouched by all of this ─────────

describe("DEC-APPROVAL-03(d): a legacy approval behaves exactly as before", () => {
  it("stales on the very movement a dual-anchored approval survives", async () => {
    const { result, agentCalls } = await runPipeline({
      fspecBody: FSPEC_ANCHORS_MOVED,
      // Raw anchor only — the shape every approval recorded before this feature
      // carries. The normalised rule must not reach back and revive it.
      reviews: reviewsAt(rawAnchorOf(FSPEC_APPROVED), null),
    });

    const fRecord = phaseRecord(result, "F");
    expect(fRecord.status).not.toBe("⏭");
    expect(reviewerDispatchesFor(agentCalls, FSPEC_PATH).length).toBeGreaterThan(0);
  });

  it("still skips when the raw anchor matches, with the unchanged FRESH detail", async () => {
    const { result } = await runPipeline({
      fspecBody: FSPEC_APPROVED,
      reviews: reviewsAt(rawAnchorOf(FSPEC_APPROVED), null),
    });

    // The pre-existing detail string is a pinned report surface; a normalised
    // hold must be a NEW message, not a rewording of this one.
    expect(phaseRecord(result, "F").detail).toBe("Skipped — approved round 2, hash FRESH");
  });
});

// ───────── (e) the anchor block's shape, and its existing readers ─────────────

describe("DEC-APPROVAL-03(e): the third anchor line disturbs no existing reader", () => {
  const RAW = `sha256:${"a".repeat(64)}`;
  const NORM = `sha256:${"b".repeat(64)}`;
  const withBoth = crossReviewFile({ hash: RAW, normalizedHash: NORM, commit: "c".repeat(40) });

  it("keeps the raw anchor first and the normalised line between it and REVIEWED-COMMIT", () => {
    // The order is load-bearing for humans and for `/APPROVAL-HASH: (\S+)/`-style
    // readers, which must still find the RAW value first.
    expect(withBoth).toContain(
      `APPROVAL-HASH: ${RAW}\nAPPROVAL-HASH-NORMALIZED: ${NORM}\nREVIEWED-COMMIT: ${"c".repeat(40)}\n`
    );
    expect(/APPROVAL-HASH: (\S+)/.exec(withBoth)[1]).toBe(RAW);
  });

  it("`approvalAnchorPreCount` still counts exactly one APPROVAL-HASH", () => {
    // §5.3's pre-count decides whether a round already carries an anchor. If the
    // normalised line counted, every dual-anchored file would look duplicated and
    // the idempotent re-append would refuse.
    expect(approvalAnchorPreCount(withBoth)).toEqual([RAW]);
  });

  it("`parseApprovalHash` reads both, and treats the normalised line as advisory", () => {
    expect(parseApprovalHash(withBoth)).toEqual({
      ok: true,
      hash: RAW,
      normalizedHash: NORM,
      reviewedCommit: "c".repeat(40),
    });

    // Every way the normalised line can be wrong degrades to `null` — never to a
    // failure. An approval legible under §5.5 must not be weakened by a field
    // that can only ever GRANT freshness.
    const legacy = crossReviewFile({ hash: RAW });
    expect(parseApprovalHash(legacy)).toMatchObject({ ok: true, hash: RAW, normalizedHash: null });

    const malformed = legacy.replace(
      `APPROVAL-HASH: ${RAW}`,
      `APPROVAL-HASH: ${RAW}\nAPPROVAL-HASH-NORMALIZED: not-a-hash`
    );
    expect(parseApprovalHash(malformed)).toMatchObject({ ok: true, hash: RAW, normalizedHash: null });

    const duplicated = legacy.replace(
      `APPROVAL-HASH: ${RAW}`,
      `APPROVAL-HASH: ${RAW}\nAPPROVAL-HASH-NORMALIZED: ${NORM}\nAPPROVAL-HASH-NORMALIZED: ${RAW}`
    );
    expect(parseApprovalHash(duplicated)).toMatchObject({ ok: true, hash: RAW, normalizedHash: null });
  });

  it("`parseVerdict` still ignores the whole anchor block", () => {
    // §5.1 reads the last non-fenced `VERDICT:` line; the anchors sit BELOW it.
    // A third anchor line the verdict scanner did not recognise would make every
    // approved file look like it had trailing junk after its verdict.
    expect(parseVerdict(withBoth)).toEqual({ verdict: "Approved", high: 0, medium: 0, low: 0 });
  });
});
