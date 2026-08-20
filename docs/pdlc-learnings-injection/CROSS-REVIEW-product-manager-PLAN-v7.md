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

I walked the task rows that carry material the delta touched. **Three hold; one is narrowed.**

**LI-12 (batch 5, RED configuration suite) — the one row the delta falsifies.** PLAN commissions
`LI-AT-30` as exactly: "(`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ an **enabled** run whose BR-8 rows
are present and empty)". FSPEC AT-30 at HEAD reads:

> *Given* thresholds configured to admit nothing — `maxDocuments: 0`, separately `maxTotalBytes: 0`,
> **and separately `maxBytesPerDocument: 0`** — … *and* in the `maxBytesPerDocument: 0` case **every
> corpus document carries `RSN-NO-MATERIAL`** (E-36).

Three cases, not two, and the third carries a per-document reason assertion the other two do not.
PLAN's parenthetical is not decorative here — this PLAN's own precedent settled that. AT-15 was
rewritten in v0.3 to spell out **four** clauses precisely because a test author works from the task
row, and an under-enumerated gloss ships an under-asserted test that the AT-partition oracle
(`LI-T-SUITEMAP`, which keys on ids, not clauses) will green anyway. The same failure mode is now
live for AT-30, and nothing else in the document mentions the zero bound: `maxBytesPerDocument: 0`
appears nowhere in PLAN, and `E-36` appears nowhere in PLAN.

**Which task would own it is not obvious from the current text, and that is part of the finding.**
The zero-bound behaviour spans two seams PLAN assigns to different tasks — `extractInjectableMaterial`
must yield nothing at bound zero (LI-16, batch 7) and `selectLearnings` must drop the document with
`RSN-NO-MATERIAL` before the total bound and consume no slot (LI-16 too), while the enabled-run,
empty-selection report shape is LI-12's red and LI-21's green (batch 13). LI-16's row commissions
`extractInjectableMaterial` with "`bounded` decided at the cut" and `selectLearnings` with a
`rejected[]` "total over `entries`", so the production behaviour is plausibly inside existing task
scope — but no row states the zero case, and a scope that has to be inferred is not commissioned.

**The AT count claim survives.** §Traceability opens "All 35 FSPEC acceptance tests, each appearing
**exactly once**", and closes with the arithmetic "(8 + 1) + 3 + 3 + (5 + 1) + 12 + 2 = 35". FSPEC
v0.13 added an **edge** (E-36) and widened an **existing** AT; it added no AT. The partition, its
per-suite assignment and `LI-T-SUITEMAP`'s closure are untouched, and the row `| AT-30, AT-32 |
learningsConfig.test.js | LI-12 | LI-21 |` still names the right suite and the right owners. It is
the clause enumeration inside LI-12's prose that is stale, not the partition.

**LI-08 and LI-17 (batches 3 and 9) — the byte-accounting delta moves FSPEC to meet them.** LI-08
requires expected byte counts "hand-computed from the fixture over **material only**, ignoring every
delimiter (§D.5)"; LI-17 requires that "Framing is never charged to any byte bound (§D.5)". Under
FSPEC v0.12 both sentences were in tension with §D.5's own text, which charged the identification
line and the per-document delimiters to `maxBytesPerDocument`. They were faithful to TSPEC §D.5,
which has said material-only throughout ("**`maxBytesPerDocument` bounds material only, and so does
`bytesInjected`.** This is the whole of it"). FSPEC v0.13 adopts that reading verbatim and grounds
it in REQ AC-2.3. Two task rows that were quietly divergent from FSPEC are now exactly right, and
LI-08's hand-computed fixture arithmetic — the thing that would have had to be recomputed had the
decision gone the other way — needs no change.

**LI-16 (batch 7) absorbs F-O-1's widening without an edit.** §Traceability maps `F-O-1 … F-O-7` with
"LI-16 (F-O-1)". F-O-1 now owns two heading-recognition rules rather than one. Both land in LI-16:
that row already commissions `looksLikeLearningsDocument` (the BR-3 predicate, "deliberately weak")
**and** `extractInjectableMaterial` ("BR-6 priority order"), and the second rule — whether a heading
is matched by numbered form, bare title or prefix — is exactly the internal of the latter. The
obligation grew; its owner did not change, and the owner's row already reaches the new surface. No
finding. The matching assertion also exists: LI-08's `LI-AT-11` is "section-set equality over what
BR-6 selected", which is the oracle the widened F-O-1 needs.

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
