# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5

**Scope:** Delta re-review of the four commits since the last reviewed state (`27d3129f`):
`643f4ea2` (completes the composition-site expected set, names the probe plumbing — answers PM
F-01), `8aee8c22` (gives both `.baseline-worktree` obligations oracles — answers TE F-02 / PM
F-02), `9cbcaa1e` (fixes the `advisoryDisabled.test.js` citation), `16f30820` (v0.5 bump,
cross-review lineage). `git diff 27d3129f..HEAD` on the TSPEC is **+72 / −13**; every deletion is
inside the two paragraphs my v4 findings named. Sections approved in v3/v4 are not re-litigated.
Frozen-round bar applied: only a defect this delta introduced, or a load-bearing claim contradicted
by HEAD, can block.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v4) — composition-site expected set incomplete, reds a correct implementation | High | **Resolved** | The delta takes fix (b) from my v4 finding verbatim in substance: expected value at the composition site is now `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` with `LEARNINGS_TARGET_DOCTYPES` alone as the *accepted* set (TSPEC:200-209). Both extra members re-verified at HEAD: Phase CR passes `docType: null` (`orchestrate-dev.js:14556`) and `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` (`:7306`) preserves an explicit `null`; Phase H passes `docType: "LEARNINGS"` (`:14730`) through `wrappedDispatch` (`:12397`) which spreads `wrapperSeams` into `dispatchAndVerify` (`:12406`). Set equality is not weakened — the text explicitly forecloses the containment repair ("Set equality stands on both sides; containment is never the fix", TSPEC:208-209). |
| F-02 (v4) — both `.baseline-worktree` obligations lacked oracles | Low | **Resolved** | TSPEC:832-846 gives each obligation a named assertion. Obligation 1's oracle inverts the measurement I made in v4 into an expectation — `git check-ignore .baseline-worktree` exits 0; re-measured at HEAD it still exits **1**, so the assertion is genuinely red-before / green-after. Obligation 2 asserts two conjuncts (path absent **and** no `git worktree list` entry), which is a positive-plus-negative pair, not an absence-only oracle. |

No prior findings remain open.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **FINDING: Low \| delta \| local \| TSPEC:219-233 \| §(d)'s prose says "all four hand-written hops" while the table beneath it enumerates five edit sites.** The count is reconcilable (site 1, `main`'s own params, is the origin rather than a forwarding hop, leaving four hops), but a PLAN transcriber reading the sentence before the table can carry four tasks. The table rows are individually correct at HEAD: the `wrapperSeams` literal is enumerated, not a spread (`orchestrate-dev.js:12381-12393`); `reviewLoop` destructures a fixed list (`:7266-7301`); the `wrapped` closure re-lists exactly seven seams by hand (`:7342-7359`); `dispatchAndVerify` destructures the same fixed seven (`:8862-8878`). Row 4's stronger claim — that Phase CR's `null` reaches the composition site "through this path and no other" — also holds: `dispatchAndVerify` has exactly two call sites, `:7343` and `:12398`. Fix is one word ("five edit sites, four of them forwarding hops"). | AC-1.2; NG-5 |
| F-02 | Low | Local | **FINDING: Low \| delta \| local \| TSPEC:220,227 \| §(d) names the first edit site `mainDev`, which is the test file's import alias, not the production symbol.** The default export is `main` (`orchestrate-dev.js:11982`); `mainDev` is how `advisoryDisabled.test.js:70` aliases it, as the same delta correctly states at TSPEC:923. Resolvable within the document, so not a traceability break — but the PLAN task should name `main`'s destructure so the implementer greps for a symbol that exists. The precedent cited in the same row is real: `_recordQueueRow: recordQueueRowFn = defaultRecordQueueRow` sits in that destructure (`:12013`). | AC-4.3 |

## Questions

| ID | Question |
|----|---------|
| — | None. Both v4 questions are answered in the delta and neither answer opened a new product decision. |

## Positive Observations

- **F-01 was fixed on the axis that protects the product boundary, not the axis that quiets the test.** The revision could have satisfied my finding by relaxing to containment; it explicitly names that repair and rejects it (TSPEC:206-209). NG-5's "a seventh authoring phase must force a product decision" stays mechanical, which was the whole point of the finding.
- **The two-conjunct oracle for obligation 2 is better than what I asked for.** I asked for a materialise-then-throw check that the path is gone; the delta adds the `git worktree list` conjunct and explains why the first conjunct alone would pass for the `rm -rf` this section rejects (TSPEC:842-846). That is exactly the absence-only failure mode a reviewer should catch, caught by the author.
- **Every measured claim in the delta holds at HEAD.** I independently re-verified nine of them (Phase CR `null`, `roundDocType`, Phase H `"LEARNINGS"`, the `wrapperSeams` spread, the four destructure sites, the `_recordQueueRow` precedent, the two-call-site claim, `advisoryDisabled.test.js:70`'s exact import line, and `check-ignore`'s non-zero exit). None was overstated.
- **The citation fix is a real fix, not a cosmetic one.** `import mainDev, * as dev from "../orchestrate-dev.js"` at `advisoryDisabled.test.js:70` is quoted verbatim, so the "pattern" the PLAN is told to follow is now checkable rather than gestured at.
- **The delta stayed inside its two findings.** No previously approved section was reopened, and no new product decision was taken in a frozen round.

DEFERRED: fold "five edit sites, four forwarding hops" and the `main` (not `mainDev`) symbol name into the PLAN task text at authoring time.

## Recommendation

**Approved with minor changes**

Both v4 findings are resolved, and resolved on the product-protecting side. No High finding: nothing
in the delta contradicts HEAD, and nothing that worked before is broken. F-01 and F-02 are naming
precision inside new prose and are non-gating — fold them into the PLAN task wording.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:72712bd87b4f5d762be9049cfe680fa0c378d83a0002690097a129e3efb79fdb
APPROVAL-HASH-NORMALIZED: sha256:d8e84e1ef487632eeeb7d6da36a20c83a2410f4a959fead9c310d203dead7c4c
REVIEWED-COMMIT: 16f308209781bec914dca9f6b7a58cc042f0c44b
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:57b71e0c5687067aa34ec4c4afc0c2ce58ff3dce61b1813f21b42cca5f048fcf
