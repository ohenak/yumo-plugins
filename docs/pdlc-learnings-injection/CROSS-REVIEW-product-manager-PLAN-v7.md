# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 7
**Mode:** upstream-cascade confirmation — FSPEC moved under a recorded approval

## Overview

My v6 approval of PLAN v0.4 recorded FSPEC at `sha256:fb18dbda…` (commit `c1d7218e`, FSPEC v0.12).
FSPEC at HEAD is `sha256:ae75fa62…` (commit `cfb3d4d6`, FSPEC **v0.13**) — six commits later, one
erratum round, 38 insertions and 18 deletions. PLAN's own bytes have not moved
(`REVIEWED-COMMIT: c374c449`), and REQ, TSPEC and DECISIONS are at the same shas my v6 approval
recorded. So the one question is whether PLAN v0.4 is still a faithful compression of FSPEC v0.13.

The v0.13 erratum lands **three decisions**, and they do not point the same way:

| FSPEC locus | v0.12 (the version I approved against) | v0.13 (HEAD) | Effect on PLAN |
|---|---|---|---|
| **§D.5 byte-accounting basis** | Contributed bytes are "every byte the block carries on its account: its identification line, its delimiters and source-path label (BR-7), **and** the section headings and bodies taken"; only the block preamble is exempt | Contributed bytes are the document's **material** — "the section headings and bodies taken from it, and nothing else"; the identification line, delimiters, source-path label and preamble are charged to **no** threshold (REQ AC-2.3, "the material taken") | **Moves FSPEC toward PLAN.** PLAN already says material-only |
| **BR-6 / BR-9 / D-12 zero-bound** | D-12 reads "Does the document carry any priority section?"; `RSN-NO-MATERIAL` means "carries none of BR-6's priority sections"; `maxBytesPerDocument: 0` undecided | D-12 reads "Does the document **yield any material**?"; `RSN-NO-MATERIAL` gains a second cause — "or the per-document bound is zero and admits none"; new edge **E-36** and a widened **AT-30** | **PLAN under-commissions the new case** — F-01, F-02 |
| **§Named obligations F-O-1** | Owns one rule: the "presents as a LEARNINGS document" predicate (BR-3) | Owns **two** heading-recognition rules: that predicate **and** the rule by which a heading counts as one of BR-6's named sections | Mapping holds — LI-16 already owns both |

**The headline:** one of the three moves closes a latent conflict in PLAN's favour, one is inert,
and one opens a real gap. The zero-bound decision is not a wording tidy — it is a new behavioural
branch with a new edge id, a new `RSN-NO-MATERIAL` cause and a third case bolted onto an acceptance
test PLAN commissions by name. PLAN's LI-12 row enumerates AT-30 as **two** cases, which was an
exact compression of FSPEC v0.12 and is a narrowing of FSPEC v0.13. That is the substantive finding
of this round, and it is a High: an operator who configures `maxBytesPerDocument: 0` gets a
behaviour FSPEC now guarantees and this PLAN commissions no test for.

Note on the chain: **TSPEC has not absorbed E-36 either** (§T.5 still gives `learningsConfig.test.js`
two ATs, and §D.7's decision-branch table still reads "No BR-6 section present ⇒ `RSN-NO-MATERIAL`").
PLAN is a faithful compression of *TSPEC*; it is TSPEC that now lags FSPEC. But my scope is this
PLAN measured against its upstream **at HEAD**, and against FSPEC v0.13 the gap is real regardless
of where the fix is authored first. I raise it here as `delta`/`local` — the bounded-follow-up
reading — rather than swallowing it because an intermediate document shares the lag.

## Batches

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
