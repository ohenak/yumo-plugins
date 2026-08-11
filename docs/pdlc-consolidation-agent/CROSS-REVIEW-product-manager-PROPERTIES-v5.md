# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 5
**Scope:** Delta confirmation of an erratum round against a previously approved PROPERTIES (v4 approved at `c568c4c`, 0/0/0). Product lens only.

## Method

Re-review is delta-scoped per the protocol: prior cross-review v4 re-read, then
`git diff c568c4c..HEAD` over the document. The diff is **three hunks, 24 insertions / 7
deletions** — the version/changelog block (`:13`), §O-5's parenthetical (`:306`), and
PROP-COR-09 (`:394`). No fourth hunk, so no section outside the erratum's stated scope
moved, and no previously-approved section is re-litigated below.

The routing question was checked first, per DEC-ERR-01: REQ §4b and TSPEC §7.1 already
decided **omission**, so the finding was a genuine downstream contradiction rather than a
demand to re-open a settled decision. The erratum absorbs the upstream decision; it does not
re-decide it.

## Erratum Item Disposition

| # | Erratum item (raised by) | Governing clause | State at HEAD | Confirmed |
|---|---|---|---|---|
| 1 | PROP-COR-09 conjunct (2) asserted `renderConsumedPair` contains **both** basenames (pm-review) | REQ §4b, TSPEC §12.2 | `:397-399` now reads set-equal `{readable}` — readable present, unreadable **absent**, **no third name** | Yes |
| 2 | Title and conjunct (2) contradicted each other (se-author) | REQ §4b | Title `:395` (*omitted from the consumed pair*) and conjunct (2) now assert the same direction | Yes |
| 3 | Duplicate of item 1 at `:386-387` (pm-review) | REQ §4b | Same hunk; single fix closes both raisings | Yes |
| 4 | §O-5 parenthetical still carried the pre-erratum inclusion arm (pm-review) | REQ §4b | `:309-310` now reads *(counted, **omitted from** the consumed pair … and named)* | Yes |
| 5 | Title/conjunct (`:386-387`) and §O-5 (`:299`) both placed the unreadable basename "in consumed pair" (se-author) | REQ §4b, TSPEC §7.1 | Both sites corrected in the same round; no site left on the old arm | Yes |
| 6 | Duplicate of items 1 and 4 at `:386-387` / `:296` (pm-review) | REQ | Closed by the same two hunks | Yes |

All six raisings reduce to two distinct defect sites (PROP-COR-09, §O-5). Both are corrected,
and corrected **in the same direction** — the mutual contradiction that made this an erratum
rather than a wording nit is gone.

## Verification Against the Upstream Decision

REQ §4b (`REQ:615-628`) states the unreadable entry is *omitted from the `<!-- pdlc:consumed
{passId} -->` pair, so it stays un-consolidated and the next pass retries it*, and gives the
product reason: an entry marked consumed while contributing no evidence can only push an
AC-5.2 verdict toward `prevented` or `insufficient-evidence` and never toward `recurred`,
corrupting REQ-CONS-05's falsifiability loop in one direction. PROP-COR-09 `:404-407` now
restates exactly that rationale and explicitly asserts **no `unread:` field, no new reason
code, no vocabulary row** — matching REQ §4b's "needs no new field, no new reason code and no
vocabulary row" and the v2.5 erratum note at `REQ:26-30` that keeps the vocabulary doc at
`Version` 1.4. TSPEC §12.2 (`TSPEC:2835`) carries the same set-equality oracle and the same
"no third name" clause. Three layers now agree; nothing is left stale.

The set-equality choice is the product-correct one and worth naming: NFR-5 requires the block
to name *exactly* the consumed set. A containment-plus-one-absence oracle would be satisfied
by an implementation that also names a basename the enumeration never returned, which would
under-report consumption to the very loop REQ-CONS-05 depends on. The document says this in
so many words at `:399-401`.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings. No prior High finding is open; the delta introduces none. | — |

The one remaining occurrence of the old inclusion wording is `:20`, inside the v1.4 changelog
sentence that *describes* the corrected defect ("conjunct (2) said … contains **both**"). That
is historical narrative in the past tense, not a live assertion, and the changelog is the
correct place to record what changed. Not a finding.

## Questions

| ID | Question |
|----|---------|
| — | None. The erratum is self-contained and the governing decision is unambiguous upstream. |

## Positive Observations

- **The fix restores an oracle rather than merely reconciling prose.** Conjunct (2) could
  previously have been satisfied by an implementation that marked an unreadable file consumed
  — the exact defect REQ §4b was written to prevent. The set-equality form now falsifies it.
- **Both halves of each conjunct keep their control.** `:402-404` preserves the mixed
  readable/unreadable fixture as a two-directional control: the readable member stops (1) and
  (3) passing where nothing was readable, and its positive half stops (2) passing on an
  implementation that renders an empty pair. Correcting the direction did not cost the pairing
  that §O-5 requires.
- **Blast radius was held to the defect.** 118 unique property ids before and after; none
  added, removed or renumbered, exactly as the v1.4 note claims. Traceability rows
  (`:1728`, `:1770`, `:1810`, `:1936`) still reference PROP-COR-09 and needed no edit, which
  is the correct outcome for a wording-direction fix.
- **The changelog is honest about what was wrong.** It names the pre-erratum inclusion arm
  instead of quietly rewriting history, which is what makes item 1's closure auditable.

## Recommendation

**Approved**

The erratum is fully absorbed at every cited site, consistent with REQ §4b and TSPEC §7.1,
with no scope creep and no regression to previously approved sections. The v4 approval stands
and is re-anchored to this revision.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
