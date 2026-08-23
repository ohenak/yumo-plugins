# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 5 (upstream-cascade confirmation; DECISIONS bytes unchanged since v4 approval)
**Cascade trigger:** TSPEC erratum round 5 — `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` moved from v1.3 (`03483136`, `sha256:5ed76227…`, the version v4 approved against) to v1.4 (`31df4eda`)

## Context

DECISIONS was approved at v4 against TSPEC `sha256:5ed76227…` (TSPEC v1.3, commit `03483136`). Its own
bytes have not moved since: `git log` shows no commit touching
`DECISIONS-pdlc-wave-resume.md` after `a0cb8d32`, and the v4 approval anchors
(`REVIEWED-COMMIT: 18c629a8`) still describe the file at HEAD. What moved is upstream. TSPEC took an
erratum round (round 5, Phase PR) across nine commits, `e75295b6`…`31df4eda`, and is now v1.4.

The single question this confirmation answers is whether DECISIONS is still a faithful compression of
the TSPEC that now stands — measured against upstream text at HEAD, not against the round's item list.
I re-read my own v4 cross-review, ran `git diff 03483136 31df4eda` over the TSPEC, and then re-read the
current upstream text behind every DECISIONS clause that cites TSPEC (`grep -n 'TSPEC §'` over
DECISIONS returns citations at `:103`, `:132`, `:167`, `:205`, `:232`, `:270`, `:303`, `:413`, `:458`).

The round changed nine things upstream. Mapping them onto DECISIONS' cited surface:

| TSPEC change (round 5) | Does DECISIONS lean on it? |
|---|---|
| §3.1 + §6.1 DEC-WVR-06: interpolated-value count corrected **four → five** (`TSPEC:433`, `TSPEC:897`) | **Yes** — DECISIONS O-8 (`:201`–`:207`) states the count in its own words and quotes the superseded §3.1 sentence. See F-01. |
| §2.4 exclusion column: the discriminating conjunct for the invalid-pointer notice is now named explicitly | **Yes** — DECISIONS O-5 (`:167`–`:169`) characterises §2.4 as omitting that notice. See F-02. |
| §2.5 restated: FSPEC §3.4's write-side clause landed, so §2.5 ratifies rather than routes | No. `grep -n 'write site\|explicitPointer\|§3.4'` over DECISIONS finds only surface counts (`:45`, `:431`) and the no-new-IO citation (`:103`, `:113`, `:270`, `:413`) — none of which the restatement touches. |
| §6.3: all four errata re-recorded as landed upstream, none re-emitted | No. DECISIONS' two "raised as an erratum" parentheticals (`:169`, `:207`) are DECISIONS→TSPEC errata, a different channel; they are reached by F-01/F-02 on their content, not by §6.3. |
| §6.2 OB-F1: the REQ/FSPEC characterisation re-raise closed; **substance untouched** | No change owed. DECISIONS carries OB-F1 only as the sequencing precondition (`:37`, `:446`), which the edit explicitly preserves. |
| §1.3 repointed at REQ OB-1's current framing | No. DECISIONS makes no worktree claim. |
| §5.4 AT-05 write-side conjunct; §5.5 mutations **three → five** | No. `grep -n 'AT-05'` over DECISIONS returns nothing, and DECISIONS' two mutation sentences (`:219`, `:386`) are unquantified ("every mutation this feature could make"). |
| §5.7 generative runs pinned at `numRuns: 500` | No. DECISIONS carries no harness or run-count claim. |
| §5.8 `c8.include` corrected to four entries | No. DECISIONS' only four-key claim is V-13's `implementation` config surface (`:153`), a different object. |

Two of the nine reach DECISIONS. Both land on parentheticals I have already flagged; one of them is
made materially worse by this round, which is why it is recorded as `delta` rather than `inherited`.

## Options Considered

Three dispositions were open for this confirmation, and the choice between them is what the verdict
encodes:

- **(a) Re-confirm unchanged — "no findings, approval carries over."** Rejected. It is the honest answer
  only if no DECISIONS clause leans on text the round moved, and one does: O-8's count claim now
  disagrees with §3.1 at HEAD on the substance, not merely on attribution. Silently re-approving would
  freeze a number in a downstream document that upstream has corrected — exactly the drift this
  cascade check exists to catch.
- **(b) Route the whole document back to a full DECISIONS revision round (a `delta` High).** Rejected on
  evidence. A High here would have to show a decision clause, an alternative's disposition, a
  constraint row or a re-evaluation trigger that no longer follows from upstream. The affected text is
  a supporting parenthetical: DEC-WVR-06's actual claim — *reason codes, not rendered sentences, are the
  closed catalogue* — rests on **three of seven reasons interpolating**, and three is exactly what
  §3.1 still says at HEAD (`TSPEC:432`–`:436`). The count that moved is the count of interpolated
  *values*, which no decision, no obligation and no acceptance criterion turns on. Escalating it would
  be inflating severity to attract attention, which the severity bar forbids.
- **(c) Confirm the decisions as still holding, and record the count divergence as a non-gating
  `delta` Medium alongside the three findings already carried.** Chosen. It keeps the approval
  standing where the evidence supports it, and leaves the author a precise, mechanical fix
  (`four` → `five`, plus a tense change) that the next DECISIONS edit — whenever one is owed — can
  land without reopening anything settled.

I did not consider re-reading DECISIONS from scratch: the delta protocol scopes this round to prior
findings plus the sections upstream churn reaches, and every settled decision is out of scope.

## Decision

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
