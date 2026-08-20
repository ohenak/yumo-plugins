# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.6)
**Date:** 2026-08-19
**Iteration:** 7 (erratum delta confirmation, DEC-ERR-03)

## Overview

Scope of this round is the erratum edit `4857352e` only, plus the mandatory re-verification
of the upstream text the edited passages now lean on (REQ v0.8, and the two code facts the
edit newly asserts). This is not a re-review of the previously approved FSPEC.

**The three routed items all landed, and two of the three landed correctly.** The third —
E-13's provenance — was routed on a mistaken premise, and the edit faithfully implemented
that premise, which has replaced a true claim with a false one. The routed item list was
necessary but, as the erratum contract anticipates, not sufficient: the falsification is
visible only by re-reading the FSPEC's own BR-4 measurement basis, which spans two
repositories, not this one.

| Routed item | Landed | Correct against upstream |
|---|---|---|
| G-1 / AC-5.1a default-enabled contradiction | Yes | Yes — verified against REQ §4.1 and AC-5.1a |
| E-13 `(measured: occurs at HEAD)` provenance | Yes | **No** — see F-01; the original text was right |
| BR-14 `parseAdvisoryConfig` / `ADVISORY_DEFAULTS` contrast | Yes | Yes — verified at `orchestrate-dev.js:1945` |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `delta` `local` — E-13's provenance is now false in the opposite direction. The edit replaced `(measured: occurs at HEAD)` with `(declared; not seen at HEAD)`, but free-text-suffixed `Date Completed` rows **do** occur at HEAD in the corpus this FSPEC measures. BR-4's own evidence table (`:326`) scopes the measurement to **two** repositories — `yumo-plugins` (9 docs) and `regime-ledger` (80 docs), 89 total — and in `regime-ledger` two documents carry trailing free text today: `docs/completed/02-macro-prediction/LEARNINGS-macro-prediction.md:7` (`\| Date Completed \| 2026-06-09 (Phase H harvest; partial close-out) \|`) and `docs/completed/78-structure-options-scoring/LEARNINGS-structure-options-scoring.md:7` (`\| Date Completed \| 2026-07-22 (merged PR #214) \|`). This is the same evidence `CROSS-REVIEW-software-engineer-FSPEC-v1.md:39` confirmed as reproducing at HEAD, and `:25` quotes the first document verbatim. The routed item's premise ("no corpus document carries free text after the date") holds only for `yumo-plugins` and does not hold for the corpus BR-4 declares. **Fix:** restore the measured provenance — E-13 should read as a measured edge with the two occurrence sites citable — rather than demoting it to a declared-but-unobserved edge. The rule itself is unchanged and correct either way; only the provenance is wrong. | E-13 (`:682`), BR-4 (`:326`) |
| F-02 | Medium | Local | `delta` `local` — the AC-6.2 traceability row was narrowed from `AT-31, AT-32` to `AT-31` (`:129`) in the same edit that moved the notice assertions **into** AT-32. AC-6.2 obliges three assertions: byte-identity against the recorded baseline, that AC-5.1b's notice fires on a present-not-object section, and that AC-5.1c's fires on a wrong-typed key (REQ `:409-414`). After the edit, AT-31 carries only the first; the second and third live in AT-32's body (`:881-887`). The row therefore under-reports coverage for two of AC-6.2's three obligations. No test was lost — AT-32 still asserts them, and AC-5.1b/AC-5.1c trace to AT-32 on their own rows — so this is an index defect rather than a coverage hole, but a TSPEC/PROPERTIES author reading the traceability table as the coverage oracle would build AC-6.2 against AT-31 alone. **Fix:** restore `AT-31, AT-32` on the AC-6.2 row. | §Traceability (`:129`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was the E-13 routed item written against a `yumo-plugins`-only reading of the corpus? If BR-4's measurement is intended to stay two-repository, F-01's fix is to restore the measured wording; if the FSPEC now means to scope its evidence to this repo alone, that is a larger change to BR-4's table and should be stated explicitly rather than arrived at through an edge-case parenthetical. |

## Positive Observations

- **The G-1 / AC-5.1a contradiction is now cleanly resolved, and resolved in the right
  direction.** REQ §4.1's config table declares `learningsInjection.enabled` default `true`
  (`REQ:220`), and AC-5.1a states outright that an absent section "must read as §4.1's declared
  defaults, which leave `enabled` at `true`" (`REQ:372-378`). The FSPEC's Step 0, D-1, BR-14
  five-state table, E-21/E-23, and AT-31/AT-32 now all say the same thing in the same direction:
  absent section, absent file, and misspelt section name are one default-enabled state; only
  explicit `enabled: false` is baseline-identical. Reworking D-1's question from "is injection
  configured on?" to "is it disabled by an explicit `enabled: false`?" is the change that makes
  the rest consistent rather than merely reworded — the decision now has the same shape as the
  requirement.
- **The `ADVISORY_DEFAULTS` contrast is correct and now cites the right fact.** `ADVISORY_DEFAULTS`
  is frozen with `enabled: false` at `pdlc/workflows/orchestrate-dev.js:1945`, so the previous
  claim that `parseAdvisoryConfig` defaults an absent file to enabled-with-defaults was simply
  wrong. The replacement bullet keeps the deliberate-divergence argument — which is the load-bearing
  part — while sourcing it correctly to REQ §4.1 rather than to a misread of the sibling reader.
  This is the harder of the two corrections to get right, because the conclusion survives while
  its justification changes.
- **AT-31/AT-32 were genuinely restructured, not just relabelled.** The split now matches the
  behavioural boundary: AT-31 owns the one baseline-identical state, AT-32 owns the three
  default-enabled states plus the two notice cases, with set equality over notices retained.

## Positive Observations

## Recommendation

**Needs revision**

The delta resolves two of the three routed items cleanly and breaks nothing that was
previously approved in the default-enabled rework — that part of the edit is sound and should
stand as written. But it does not answer this round's question in the affirmative, because
the third item introduced a false statement of fact where a true one stood (F-01). Under
DEC-ERR-03 that is exactly the kind of finding this confirmation round exists to catch: the
routed item list was followed faithfully, and following it is what caused the regression.

Two changes close this out, both narrow:

1. **F-01 (High):** restore E-13's measured provenance. Free-text `Date Completed` suffixes
   occur at HEAD in BR-4's declared two-repository corpus, at
   `regime-ledger/docs/completed/02-macro-prediction/LEARNINGS-macro-prediction.md:7` and
   `regime-ledger/docs/completed/78-structure-options-scoring/LEARNINGS-structure-options-scoring.md:7`.
2. **F-02 (Medium):** restore `AT-31, AT-32` on the AC-6.2 traceability row.

No other section needs to be reopened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
