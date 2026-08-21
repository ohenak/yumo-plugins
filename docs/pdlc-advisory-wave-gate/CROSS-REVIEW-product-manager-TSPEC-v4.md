# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.13)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review)
**Upstream at HEAD:** REQ v1.16 (`REQ-pdlc-advisory-wave-gate.md:18`), FSPEC v1.7 (`FSPEC-pdlc-advisory-wave-gate.md:12`)
**Delta reviewed:** `0f2a9710..033cd093` (one commit, 49 lines changed)

## Scope

This is a delta re-review, not a fresh read. My v3 was a delta confirmation on the v1.12 erratum
round; it closed **Needs revision** on one High (F-01, the `snapshotRef` mechanism landed without an
oracle), two Medium (F-02 lineage row, F-03 §1.3 residue cell) and two Low inherited (F-04 OQ-2,
F-05 OQ-7). The round under review is a single commit — `033cd093`, "v1.13 completion pass" — that
touches 49 lines across the lineage header, the changelog, §1.3's residue table, §4.5's carrier
table, §5.1's file manifest, §5.6's preamble and AT rows, and §6's OQ-2 / OQ-7 dispositions.

I verified each prior finding against the tree rather than against the round's own prose, then read
only the changed sections for new issues. Sections I approved in earlier rounds and this delta did
not touch are not re-litigated here.

## Prior findings — disposition

All five are resolved. Each was checked against the repository, not against the changelog's claim
that it was checked.

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v3 F-01 | High | **Resolved** | §5.6's AT-06-4 row is restated on FSPEC v1.7's three conjuncts and a companion **AT-06-4b** row is added (TSPEC `:1823`, `:1824`); §5.1's `advisoryWaveGate.test.js` row names both ATs (`:1437`). The upstream they compress reads as the rows say: FSPEC `:474-478` carries the three conjuncts and "the oracle asserts co-location and the presence of the overwrite statement, never the capture's name", FSPEC `:479-483` carries AT-06-4b's no-capture arm. The AT ids in §5.6 are **set-equal** to FSPEC §6's — 48 on both sides, `diff` empty — so AT-06-4b's arrival did not silently drop a row elsewhere. (One residual gap sits *inside* the new AT-06-4 row; see F-01 below. The row exists, which is what my v3 finding demanded; what it asserts over is the new problem.) |
| v3 F-02 | Medium | **Resolved** | The `Upstream` cell now reads FSPEC v1.7 / REQ v1.16 with the two hashes (TSPEC `:5`). Verified at HEAD: FSPEC version cell is `1.7` (`FSPEC-pdlc-advisory-wave-gate.md:12`), REQ is `1.16` (`REQ-pdlc-advisory-wave-gate.md:18`). |
| v3 F-03 | Medium | **Resolved** | §1.3's "Per-seam report rows" residue is now `none`, and the re-measurement is transcribed rather than inferred. Verified: `pdlc/workflows/__tests__/advisoryRecord.test.js:496` reads `expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"])`, and `:505` reads `expect(rows.map((r) => r.seam)).toEqual([...devModule.ADVISORY_SEAMS])`. Both line pins are exact. The cell also names *why* v1.12 got it wrong ("that round's scope covered production constants only"), which is the honest form of a retraction. |
| v3 F-04 | Low | **Resolved** | OQ-2 now separates the landed half from the open half: BR-14 / AC-6.3 have landed and the report carries the warning unconditionally; only the **ref-naming** remedy stays contingent (TSPEC `:1849`). That is exactly the split §2.5 points at. |
| v3 F-05 | Low | **Resolved** | OQ-7 now pins both revisions: AC-5.1's observation point at **v1.14**, AC-6.2's escalation-log append entering the excluded-carrier list at **v1.15** (TSPEC `:1854`). Verified against REQ's own changelog: `REQ-pdlc-advisory-wave-gate.md:29` — "AC-5.1's excluded-carrier list adds AC-6.2's escalation-log append (TE F-01, High)" under the v1.15 entry. |

Nothing I approved in v1.12 was broken by this delta: §2.5's hazard text, §4.5's five-member
`haltFields` shape, §3.6's per-promoted-task commit loop and §3.4's envelope example are byte-
unchanged in `0f2a9710..033cd093`.

## What the delta changed

## New findings in changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
