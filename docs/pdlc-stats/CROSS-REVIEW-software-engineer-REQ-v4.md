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

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | REQ-STATS-02's rewritten state enumeration names malformed and unmeasurable (REQ-STATS-03) and harvested (03/04/06), but omits REQ-STATS-06's **not-available**. The clause is normative — these states "ride in their own metric's value, never as extra top-level keys" — so the JSON placement of the fourth operator-visible state is now unstated at REQ level, even though the criterion, R-4 and O-1 all name it. FSPEC §3.1 A8 already puts `n/a` in the metric's value, so this is a wording gap, not a behavioural one. Fix: add not-available to the same list. | REQ-STATS-02, the "ride in their own metric's value" clause |
| F-02 | Medium | inherited | nonlocal | REQ-STATS-08's conjunct (a) enumerates exactly two legitimate outcomes — exit zero with REQ-STATS-01's metric set, or REQ-STATS-09's non-zero not-found report — and then insists conjunct (b) never suffices alone. The `docs/`-root failure path satisfies neither: it exits non-zero with a root message and no metric set and no not-found report. REQ-STATS-07 already carried that path pre-round ("non-zero only when it could not read the `docs/` root"), so the gap is inherited; this round's REQ-STATS-09 carve-out widened it to single-feature mode by moving root failure out of the one AC that did license a non-zero exit. FSPEC EC-09 and EC-11 specify the behaviour, so nothing is ambiguous for an implementer — but a conformance test derived literally from this P0 criterion would fail a correct binary. Fix: add the root-failure (and EC-11 unreadable-feature) exit to (a)'s enumeration. | REQ-STATS-08, conjunct (a) |
| F-03 | Low | delta | local | REQ-STATS-03's new sentence carries an inline shipped-behaviour claim — "the grammatical-but-out-of-catalogue names the pipeline writes (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`)" — with no anchor. The claim is true (I verified `bad_doc_type` in `parseReviewFilename` and the four files in `docs/completed/pdlc-advisory-wave-gate/`), and per the REQ altitude rule the repair is **not** to add a `file:line` citation to the REQ but to relocate the fact to `docs/_constraints/` as a measured fact (`M-*`) and cite that id. No such fact exists there today. | REQ-STATS-03, "the grammatical-but-out-of-catalogue names the pipeline writes" |
| F-04 | Low | delta | nonlocal | The REQ edits landed correctly, which leaves two FSPEC passages quoting upstream text that no longer exists. BR-27 says it "narrows REQ-STATS-07's *missing or fail to parse … reports it by name as missing/malformed*" — that string is gone from the REQ, and BR-27 now merely restates it. The EC-09 row says the root-failure behaviour "departs from REQ-STATS-09's *Given*, which sweeps this case in" — the Given no longer sweeps it in. Both are now stale characterisations of a repaired upstream rather than live departures. (D-8 and D-9's decision records are historical and legitimately retained; it is the two live narrowing/departure claims that need restating as agreement.) | FSPEC BR-27; FSPEC §5 EC-09 row |

## Positive Observations

- The C-5 carve-out is the right shape. It repairs the unsatisfiability without weakening the constraint's purpose: the `RESOLVED:` half — case-insensitive value matching, single-marker, outside-a-fenced-block — still defers to one place, and only the phase listing, which HEAD genuinely does not own, becomes the REQ's own. Nothing was traded away to make the sentence true.
- REQ-STATS-03's malformed decision is the cheaper of the two available answers and the REQ says why: a third bucket would be an independent rule C-5 forbids. It also survives the check I expected it to fail — the driver's per-file reason really does separate `bad_doc_type` from `not_cross_review`, so the AC and C-5 agree rather than collide on the exact file class that prompted the erratum.
- REQ-STATS-06 and REQ-STATS-07 now use FSPEC BR-16's and BR-27's own spellings. Round-tripping the downstream wording back into the criterion is what keeps the next reviewer from re-deriving the ambiguity.
- REQ-STATS-04's harvested predicate is now internally consistent on the near-miss `CODE_REVIEW-` basename, which was the one place where two sentences of the same AC could be read against each other.

## Recommendation

**Approved with minor changes**

Every routed item landed, and the two I most expected to land badly — the C-5 carve-out and the REQ-STATS-03 malformed label — are correct against HEAD rather than merely plausible. No High finding. F-01 and F-02 are wording completeness gaps in criteria whose behaviour the FSPEC already pins; F-03 and F-04 are anchoring and stale-quote hygiene. None blocks TSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126
APPROVAL-HASH-NORMALIZED: sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126
REVIEWED-COMMIT: 50dffe8c8f9dfc6b30f797fc5f7fb6ac1669889b
