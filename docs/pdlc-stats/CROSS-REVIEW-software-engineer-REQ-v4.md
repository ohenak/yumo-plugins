# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (erratum round 2 — delta confirmation)


**Delta base:** `bb6f56af2` (the commit carrying my v3 approval) → `50dffe8c8` (REQ v1.3, "erratum
round 2, nine targeted wording fixes"). I read `git diff bb6f56af2 50dffe8c8 --
docs/pdlc-stats/REQ-pdlc-stats.md` (24 insertions, 15 deletions), which touches the metadata block,
C-5, and REQ-STATS-02/03/04/06/07/08/09. Sections unchanged since v3 are re-read for continued
fidelity but not re-litigated.

## Routed-item disposition

| Routed item | Disposition | Evidence |
|---|---|---|
| C-5 unsatisfiable against REQ-STATS-05 (driver owns no `POSTMORTEM-*` basename classification to defer to) | **Landed** | C-5 now carves discovery out explicitly: "the driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*` basename, so there is nothing to defer to. That listing is this REQ's own (REQ-STATS-05); fidelity binds the `RESOLVED:` marker, not the discovery." Verified against HEAD: post-mortem paths are constructed per phase (`orchestrate-dev.js:8618`, `:15293`), never derived from a directory listing, so there is genuinely no upstream rule for the REQ to defer to. The carve-out is the correct repair and it does not reopen C-5's general no-independent-rules stance — the `RESOLVED:` half is untouched. |
| REQ-STATS-03 malformed disposition for pipeline-authored `CROSS-REVIEW-{role}-REVIEW-v{N}.md` | **Landed, and correct against HEAD** | REQ-STATS-03 now decides the label rather than adding a bucket. I re-verified the driver: `parseReviewFilename` (`pdlc/workflows/orchestrate-dev.js:10134-10163`) short-circuits on `not_cross_review` for a name that does not carry the prefix, and only then reaches the four grammar reasons — `bad_role`, `bad_doc_type`, `bad_round`, `trailing_junk`. `CROSS-REVIEW-product-manager-REVIEW-v1.md` carries a valid role slug and an out-of-catalogue doc type, so the driver's per-file reason is `bad_doc_type`, not `not_cross_review`. C-5's retained sentence ("a basename it rejects as not a cross-review is not malformed here") therefore does **not** contradict the new REQ-STATS-03 text: it names the `not_cross_review` reason specifically, and the prefix test the AC uses selects exactly the complement. The four such files in `docs/completed/pdlc-advisory-wave-gate/` are real; the claim checks out. |
| REQ-STATS-09 `Given` sweeps in the no-`docs/`-root case | **Landed** | Given now reads "in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure". Matches FSPEC EC-09 and D-9 exactly, including the missing/unreadable pairing. |
| REQ-STATS-07 gap disposition vs BR-27's readable-but-empty zero state | **Landed** | "for any feature whose directory cannot be read, reports it by name with the reason … a readable but empty directory is not a gap but a normal row whose metrics report their zero states." Word-for-word compatible with FSPEC BR-27 and EC-03. |
| REQ-STATS-06 harvested predicate parses two ways | **Landed** | Now "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" — the same three-disjunct spelling FSPEC BR-16 uses, so the at-least-one reading is now stated, not inferred from adjacent rationale. |
| REQ-STATS-04 harvested clause lost its subject; bare `CODE_REVIEW-*` prefix test | **Landed** | "this metric reports **harvested**" restores the subject, and the predicate is now "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains". That is consistent with the AC's own earlier sentence (a `CODE_REVIEW-` basename failing the version grammar "simply does not contribute"), so a near-miss file no longer both fails to contribute and blocks the harvested state. |
| REQ-STATS-02 state enumeration over-distributes across ACs | **Landed in part** — see F-01 | The malformed/unmeasurable states are now attributed to REQ-STATS-03 alone and harvested to 03/04/06, which is the correct redistribution. The rewritten clause still omits REQ-STATS-06's not-available. |
| REQ-STATS-08 conjunct (b) lost its list separator | **Landed** | The serial comma is restored: "…by path and modification time, issues no network request, and runs no `git` write command". Conjunct (b) now reads as three items rather than two. |

