# POSTMORTEM — Phase R, pdlc-review-convergence

Written by the operator (with Claude) after stopping run `wf_a985bc0f-d18` on 2026-08-01, before
the loop's own halt path executed. This file is the record that halt would have produced, plus the
resolution.

## Phase

R — REQ review loop for `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`.

## Iterations

5 (`MAX_REVIEW_ROUNDS` — limit reached). Window: rounds 1..5. Review files
`CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v1..v5.md` are all present, all
`VERDICT: Needs revision`.

## Reviewers

software-engineer, test-engineer — dual panel every round.

## Pattern of Disagreement

There is no disagreement about the document's direction: both round-5 reviews close **every**
round-4 finding (SE: 5/5 exactly as recommended; TE: 6/6) and neither contests any mechanism,
decision, scope or priority. The pattern is **generative churn at REQ altitude**: each revision
adds mechanism to close the prior round's findings, and the new mechanism text carries a
comparable number of new defects. Blocking counts by round — SE: 10, 5, 5, 5, 5; TE: 7, 4, 5, 4, 6.
Round 5's twelve findings are all in text v1.3 added, ten of them inside the three mechanisms v1.3
introduced (the durable reset region, the window scoping, the trailer-reader algorithm). Both
reviewers noted their own stopping rule fired (SE: AC-2.1's condition held three consecutive
pairs; TE: 6 ≥ 4 on a comparable pair) — the exact regime the REQ's own R-9 describes.

## Best-Guess Root Cause

The REQ specifies durable machine state (the POSTMORTEM reset region) that must coexist with
shipped readers (`parseResolvedMarker`, `extractFileVerdict`, `checkPostmortem`), and each round's
fix was composed against the finding it answered but not against every rule that already reads the
same state. SE G-07 is the emblem: the preservation rule added to close G-04 collided with the
shipped fail-closed marker reader in both reachable directions. Findings of this class are cheap
to fix once named, but a full dual panel per fix does not converge — it manufactures a fresh
generation each round, which is the finding-turnover fixed point R-9 records.

## Recommendation

Per the SE round-5 recommendation ("fix G-07 and G-10 and stop taking new rounds … the POSTMORTEM
route with a resolved marker after G-07/G-10 land is the same outcome with a record") and the TE
trajectory note ("this is not a plateau … Round 6 should close them"):

1. Land the round-5 blocking findings in the REQ — done as **v1.4** (commits `7454283`, `8a20bda`,
   `6b41d61`, revision note + §10.9 finding map). It addresses all twelve: SE G-07/TE F-02
   (`RESOLVED:` no longer a counter; the halt path strips the prior marker so every halt demands a
   fresh clearance), SE G-10/TE F-01 (S-11 clearance writes `WINDOW-RESUMED: {W}`, counted; no
   banked window), TE F-03 (round `W` dispatches the full panel, exactly as round 1), SE G-11/
   TE Q-07 (`## Reset Region` named as S-12; each halt appends its `HALT-REASON:` to the end),
   SE G-08/G-09 (stopping scan; duplicated `VERDICT:` ⇒ *malformed* row in AC-2.7), TE F-04
   (ordered receive algorithm), TE F-05/SE MF-1 (citations re-baselined; fabricated
   `writePostmortem` symbol replaced), TE F-06/SE MF-2 (§6 rows for `HALT-REASON:`,
   `WINDOW-START:`, `WINDOW-RESUMED:`), SE G-12 and TE F-07 (justifications restated), plus both
   mechanical-fix lists.
2. Resolve this POSTMORTEM so the phase re-enters and the next window (rounds 6..10) reviews v1.4.
   If round 6 again returns only new one-clause findings in new text, prefer carrying
   editorial-scale residue into FSPEC over opening round 7 — that is the SE panel's standing
   advice and R-9's own prescription.

## Resolution Record

v1.4 was verified on this branch before resolving: the revision-note claims were checked against
the document body (AC-1.4 strip clause, `## Reset Region` / `WINDOW-RESUMED:` mechanism present
throughout, AC-2.7 duplicated-`VERDICT:` row, §10.9 map), not against the note alone. Marker set
by the operator's explicit instruction, 2026-08-01.

RESOLVED: yes
