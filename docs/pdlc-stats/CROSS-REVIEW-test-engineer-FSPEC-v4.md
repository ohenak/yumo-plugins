# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (1 High, 2 Medium, 2 Low) — *Needs revision*
**Delta reviewed:** `git diff c3ee2c0ef..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` (42 insertions, 29 deletions), commit `32a23e013`

## Prior Findings Disposition

| Prior | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — BR-20's widened "every path but one" guarantee and BR-30's closed two-value `reason` enum contradicted each other on EC-11's single-feature path, and no oracle was written either way | High | **Resolved** | The contradiction is closed the way the finding asked, in the rule rather than in the exception list: D-10 is a new decision row (line 894) that names the choice explicitly ("Third `reason`, or a second BR-20 exception?") and takes the third `reason`, with the rationale that a second exception "would make BR-20's guarantee path-by-path again — the rot it was rewritten to prevent". BR-30's enum is now `not_found`, `no_docs_root` and `unreadable_feature` (line 499); EC-11 carries the `--json` stdout clause (line 530); BR-20 now reads "a report and every BR-30 refusal … all emit one" (line 398), which is the shape that does not rot — the enumeration is delegated to a closed enum rather than restated as a path list; BR-29's exit-1 list gains "unreadable feature directory in single-feature mode" (line 493); §3.3 C3 names the path (line 174). AT-27 gains a leg asserting stdout content, `error.reason` exactly `unreadable_feature`, "not empty stdout". All three enum values are now pinned by a test: `not_found` at AT-23, `no_docs_root` and `unreadable_feature` at AT-27. |
| F-02 — AT-27's root leg never pinned `feature` on the single-feature JSON root failure, the exact path D-9 was written to decide; and "four runs" was ambiguous over three axes | Medium | **Resolved** | Both halves. The run set is now spelled as an explicit cross product — "the eight root-failure runs — {`docs/` root absent, `docs/` root unreadable} × {single-feature, fleet} × {human, `--json`}" — so the count follows from the axes instead of the reader guessing. And `feature` is asserted per mode: "the supplied name in the single-feature runs and `null` in the fleet runs — D-9's carve-out turns on that name, so hardcoding `null` on every root failure must fail here". That last clause states the falsifying implementation, which is the form that survives transcription into a test. |
| F-03 — §6.11 credited EC-21 to AT-20, but AT-20 tested B5's read failure, a different path; the catch-all had no oracle | Medium | **Resolved** | AT-20 gains a second leg over "a fleet in which one feature's directory is readable but computing its metrics fails unexpectedly", asserting the gap row carries a reason, other features report normally, exit 0 — and it states the discrimination in the AT itself: "B5's read failure and EC-21's catch-all are different paths: only this leg fails an implementation whose guard is around the read alone." That is the sentence that stops a TSPEC author collapsing the two legs back into one fixture. One rule-side consequence is left open — F-02 below. |
| F-04 — AT-24's rationale claimed `--dry-run` is "in no command's list"; HEAD contradicts it | Low | **Resolved** | Now reads "`--dry-run`, which `doctor`'s row does not carry" (line 774), which is the claim the argument actually needs. Re-verified at HEAD: `dry-run` sits in the `dev` and `queue` rows and not in `doctor`'s (`pdlc/engine/bin/cli.mjs:169-185`). |
| F-05 — §3.3's C3 promised the JSON error object on paths whose flow rows terminated in place with no route to Flow C | Low | **Resolved** | A2, A3 and B2 now read "the refusal renders through Flow C, exit 1" (lines 137-138, 156). The flow tables now compose into the call graph they describe. |

Five findings, five resolved. None was resolved by wording alone: each one landed a rule change or an
AT conjunct that can fail. The High in particular was fixed at the level it was raised — the enum
grew a value rather than BR-20 growing a second exception — and the document records why at D-10.
