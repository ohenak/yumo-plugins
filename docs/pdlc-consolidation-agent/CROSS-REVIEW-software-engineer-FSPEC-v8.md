# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v8.0)
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `27eeab1` (the FSPEC commit at which my v7 was written); diff
`27eeab1..HEAD` — 25 insertions, 18 deletions across 5 FSPEC commits (`82256e9`, `ec352ee`,
`8ed0ba4`, `f18e7d5`, `f264860`). Only the changed sections were re-read for new issues.

## Prior findings — disposition

All five v7 findings were re-checked against the revision and, where they made a claim about HEAD or
about an upstream authority, against the file. **All five are closed as filed.** One of the three v7
questions (Q-03) is answered by the AT-F21 rewrite; the other two are carried forward below, in the
form the revision left them.

| v7 | Verdict | Evidence |
|---|---|---|
| F-01 (Low) — §8.1's reader table omitted `passId` from §6.4's indexed-field column although §6.4 writes `pass:{passId}` evidence | **Resolved as filed, and the arm is spelled rather than left to the general rule.** The §6.4 row's field list is now `failure-mode-id`, `action`, `route`, **`passId`** (`:1144`), and the third column argues why — "the carrier does not only decide `enacted` — it spells the evidence" — then walks the short-record arm to the same safe direction the general rule gives (parse notice, skip that contract, no suppression, re-proposed) and names `pass:undefined` as the guessed default the section forbids. The bookkeeping paragraph below the table was brought into line in a separate commit (`f264860`, `:1152-1156`): `passId` is now listed there too, "to spell its `suppressed-by:` evidence (§6.4, §10.3)", and the paragraph still correctly says **four contracts** — `passId` is a second field read by an already-listed contract, not a fifth reader. The one defect left is the line number the new cell cites; filed as L-01 below, not a reopening |
| F-02 (Low) — AT-F21's set-equality conjunct had no transcribable expected set: the Given pinned neither `F`'s `action`/`route` nor the third record's | **Resolved as filed, and then past it.** The Given now pins all three records (`:2067`): `E` = `action: retire`, `route` missing; `F` = **`action: promote`, `route: degraded`**, missing `target`; and the third record is named `W`, **`action: retire`, `route: constraints`**. The expected set is now the literal **`{E, F}`**, with per-member reasons stated. I re-derived it against BR-33c (`:2461`): `E` open because §8.4 step 1 cannot index its missing `route`, `F` open because it carries no `retire` record, `W` closed because its `retire` at `route: constraints` is a landed retirement. The Given also states *why* each pinned field is pinned ("`route: degraded` is what makes §6.4 read the pair `absent`"), which is the transcription note a fixture author actually needs — and it checks out against BR-25 (`:2440`) |
| F-03 (Low) — §8.1's normativity sentence enumerated four readers one paragraph above a table declared set-equal to seven | **Resolved as filed, on both ends.** `:1081` now closes the parenthetical with "**— e.g., not the whole set**" and adds "The seven readers are enumerated once, below, in the reader table — the parenthetical here is illustrative, not the enumeration". The table's own lead (`:1135-1137`) was strengthened at the same time from a two-part list into a flat seven-member enumeration with a closure clause: "seven, one row each, and **no reader of a failure-mode record anywhere in this document outside that set**". That is a stronger claim than I asked for and I checked it: §8.2's merge and §10.4's report items operate on the pass's own proposals or on §8.4's derived list, not on a stored record's fields, so the closure holds |
| F-04 (Low) — BR-33a and BR-33b cited AT-F21 / AT-R6b unqualified for rules whose `artifact` and `target`-follows halves the document had just named PROPERTIES-owned | **Resolved as filed — E-12b's split mirrored into both rows.** BR-33a's AT column now reads "**AT-F21** (the reader half, `route` and `target` arms only)" and names the `artifact` arms (§8.3's unavailable-path row, §8.5's refusal to guess a `retirement`) as having **no fixture at this layer**, PROPERTIES-owned per DEC-LAYER-01, "as E-12b states" (`:2459`). BR-33b's cites "fixture 2 for the subject tie-break — the `artifact` half only, since that fixture is kind 2 on both sides" and defers the `target`-follows clause to PROPERTIES with §8.2's third note named as the place its observable is stated (`:2460`). Both splits are word-for-word consistent with E-12b (`:2514`), which is what makes them checkable rather than a second paraphrase |
| F-05 (Low) — §6.5's closing sentence said a widening is "made here" and then that the decision is TSPEC's | **Resolved as filed, by the minimal edit.** `:943-946`: "made here" is gone and the self-falsifying gloss with it; what remains is "a pass that needs a third **git** read verb … is a **change** to this table, not a reading of it", followed by the DEC-LAYER-01 answer unchanged — TSPEC transcribes and, with a recorded reason, widens; this table is the frozen statement TSPEC inherits; a widening is a **recorded TSPEC decision**, never a silent reading. DEC-LAYER-01's third bullet (`docs/_decisions/DECISIONS-spec-layer-boundary.md:30`) says exactly that, re-verified at HEAD. The oracle the paragraph protects — a transcribed closed set, `observed ⊆ permitted` — is untouched |
| Q-03 — is conjunct (2) the intended positive for AT-F21's `F` arm? | **Answered by removing the need for the question.** The `F` arm was rewritten rather than annotated: it is now scoped to what a missing `target` actually blocks (§8.6 routes no remediation; no `target` is guessed on the stored record) and paired with a positive **on the same path** — "the re-derived promotion for `F` is a *fresh* proposal whose `target` is a function of its kind (§5.2) and is not missing, so it routes and writes normally". The unobservable "re-proposed on a later pass" is gone. This also closes te-review's v7 M-01 on the same clause |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
