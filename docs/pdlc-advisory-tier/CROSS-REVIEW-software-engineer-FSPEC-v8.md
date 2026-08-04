# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md (v1.5)
**Date:** 2026-08-04
**Iteration:** 8

**Scope:** `Local` — delta re-review of FSPEC v1.5 against my own v7 review (`CROSS-REVIEW-software-engineer-FSPEC-v7.md`, VERDICT: Approved, 0/0/0). This round establishes whether the document or any of its upstream counterparties moved since, and re-grounds the FSPEC's repo-path claims at HEAD. Settled decisions are not re-litigated.

## Delta verification (no delta)

| Probe | Command | Result |
|---|---|---|
| Commits touching the FSPEC since the last commit that edited it (`c7dc98f`) | `git log --oneline c7dc98f..HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` | **empty** — no commit has touched the file |
| Uncommitted changes anywhere in the feature directory | `git status --short docs/pdlc-advisory-tier/` | **empty** — nothing staged, nothing unstaged |
| Byte identity with the bytes approved at v6/v7 | `shasum -a 256 docs/…/FSPEC-…md` → `7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c` | **matches** the `APPROVAL-HASH` recorded at `CROSS-REVIEW-software-engineer-FSPEC-v6.md:62`, and the sha this reviewer transcribed at `CROSS-REVIEW-software-engineer-FSPEC-v7.md:17` |
| Upstream counterparties (REQ, TSPEC, DECISIONS) since the v6 `REVIEWED-COMMIT` `08925cf` | `git log --oneline 08925cf..HEAD -- …REQ… …TSPEC… …DECISIONS…` | **empty** — no upstream document has moved under the FSPEC |

HEAD is `85ac394`; my v7 review landed at `5f04d79`. Every commit in between is a PROPERTIES cross-review document. The FSPEC is byte-identical to the version I approved at v6 and re-confirmed at v7, and the three upstream documents it derives from are likewise unchanged since v6's reviewed commit, so the v6 consistency check (FSPEC ⟷ REQ AC-4.5, FSPEC ⟷ TSPEC §5.5/§7.2, DEC-ADV-11) is still verified against unmodified counterparties.

Because there is no diff, step 3 of the delta protocol — "scan only the changed sections" — has an empty scope. What remains re-checkable is the codebase the document asserts facts about, which approval anchors do **not** pin; that sweep is below.

## Prior findings

v7 recorded no findings (`{"high": 0, "medium": 0, "low": 0}`), as did v6 and v5. There is no open High, Medium or Low finding from any prior round of this document to verify as resolved, and nothing was reopened.

## Re-grounding: repo-path claims at HEAD

Re-ran in one pass, as the cross-cutting existing-code claim check requires, over every repo path the FSPEC names:

| Path named by the FSPEC | State at HEAD | Assessment |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | present | Consistent — the pipeline the A1…A5 advisory seams attach to |
| `pdlc/workflows/orchestrate-queue.js` | present | Consistent — the queue driver that consumes the escalation log |
| `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | present | Consistent — the harvest guard the `ADVISORY-*` lifecycle reasons about |
| `.claude/pdlc.config.json` | present | Consistent — the config home for `advisory.enabled` and the tier's other declared settings |
| `docs/_queue/` | present | Consistent |
| `docs/_queue/ESCALATIONS.md` | **absent** | Correct, not a defect — asserted absent, not asserted present (see below) |

The one absent path is the one the FSPEC declares this feature *creates*: `FSPEC:764` calls it "a new artifact (B-16)", `FSPEC:801` pins "A missing log is the normal first-run state, not an error", and acceptance rows `T-09-7` (`FSPEC:818`) and `T-09-8` (`FSPEC:819`) test the create-on-first-entry and failed-write paths respectively. Its absence at HEAD is exactly the precondition those rows assume. No path the FSPEC asserts as *existing* behaviour is missing.

The acceptance rows I called out in v7 are unchanged and still read as they did: `T-09-8` (`FSPEC:819`) pairs its negative ("nothing was applied", disposition **not** `resolved`) with positive assertions on the same path (seam still reports `escalated`, the pre-advisory halt or skip still happened, the failed write named on the report) — no absence-only oracle. `T-10-3` (`FSPEC:859`) states disabled-tier completeness as set-equality ("equals, element for element") against a literal file set transcribed from a pre-feature run at `26c3f1c`, and names the red direction, so a file created outside that set fails whether or not this feature named it — completeness by set-equality, and an expected value transcribed from a fixed commit rather than derived from the code under test.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
