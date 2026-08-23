# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 6

## Overview

**Scope of this round.** I re-reviewed only the delta. My v5 was a delta confirmation against
TSPEC v1.4 and returned **Needs revision** on one High (F-01) plus two Mediums and two Lows.
PROPERTIES has moved 1.3 → 1.5 since the bytes I reviewed (`91ce118c`); the diff is
`git diff 91ce118c..HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`, 158 lines,
touching the front-matter, two revision-history rows, PROP-OVERRIDE-01, PROP-OVERRIDE-05,
PROP-COV-03, two oracle rows, the mutation → oracle map, the run-depth paragraph, § 11's local-red
table, the PLAN-task trace and the routed-errata ledger. I did not re-read the sections that did not
move.

**Verdict of the delta: every v5 finding is resolved, and I verified each one against the upstream
document at HEAD rather than against the revision-history claim.**

| v5 finding | Sev | State | Evidence checked at HEAD |
|---|---|---|---|
| F-01 write-side conjunct + fifth mutation missing | High | **Resolved** | PROP-OVERRIDE-01 now carries the conjunct in both the property row and the oracle row; PROP-COV-03 counts five; the mutation → oracle map has the fifth row with T-07 as the task that runs it |
| F-02 §5.7 run-count row asserts "still open" | Medium | **Resolved** | The row now reads "**Closed by the owner** … routed at v1.1, landed at TSPEC v1.4", the `ERRATUM: TSPEC` routing is dropped, and the run-depth paragraph is restated as three-way agreement |
| F-03 §5.8 c8-include row asserts "open" | Medium | **Resolved** | The row reads "**Closed by the owner** … routed at v1.3 (PM F-02), landed at TSPEC v1.4"; § 11's measured baseline untouched, as I said it should be |
| F-04 PROP-OVERRIDE-05 rationale on the rejected-value conjunct | Low | **Resolved** | Restated on the discriminating conjunct — "emitted **before any resume decision runs**" — and it now names PROP-OVERRIDE-03's clamped past-the-end case as the counter-example, which is exactly TSPEC §2.4's argument |
| F-05 raw `TSPEC:838` anchor | Low | **Resolved** | No `TSPEC:838` remains anywhere in the file (`grep -nE '\.(md|js|mjs|json):[0-9]+'`) |

**What the revision also did, unprompted and correctly.** v1.5 is a second, self-initiated pass that
re-verified the routed-errata ledger against **PLAN** at HEAD, closing the two `ERRATUM: PLAN` halves
that had landed and adding the two missing PLAN-task trace rows (T-11, T-12). That work was not asked
for by any v5 finding and it closes a gap I would otherwise have raised this round — see
`## Fixtures`.

**What I found new.** Three Lows, all record-accuracy rather than substance: one mis-attributed PLAN
version in the revision history, one stale "this round" in a ledger row, and one new raw `file:line`
anchor. No property, oracle, fixture or requirement mapping is wrong. Nothing blocks.

**Lens note.** This is the product lens: requirement traceability, acceptance-criterion fidelity,
scope. Test-design depth and engineering feasibility stay with te-review and se-review.

## Properties

### PROP-OVERRIDE-01 now owns AT-05 whole (v5 F-01, High — resolved)

The property row at HEAD adds:

> **Write-side conjunct (AT-05, TSPEC v1.4):** the operator-pointed run must itself **write** a
> record — `ledgerWrites(writes)` is non-empty and the written `lastGreenWave` is the
> **plan-absolute** number of the last wave this run completed, never a run-relative count — so a
> build that suppresses the write while `explicitPointer` is true reds here rather than nowhere
> (TSPEC §5.5 mutation 5).

That is a faithful transcription of upstream, not a paraphrase: TSPEC §5.4's AT-05 row carries
"**Write-side conjunct (PM):** … `ledgerWrites` is non-empty and the written `lastGreenWave` is the
**plan-absolute** number of the last wave this run completed, not a run-relative count", and TSPEC
§5.5's fifth mutation says it is "Killed **only** by AT-05's write-side conjunct" (TSPEC
§5.4 AT-05 row; §5.5 mutation 5). The `Traces` cell grew to
`AT-05 (TE F-05), BR-04, REQ-WVR-04, REQ-WVR-09, TSPEC §5.5 row 5` — REQ-WVR-09 is a real
requirement (`REQ-pdlc-wave-resume.md` § "REQ-WVR-09 — a wave that was verified but not committed is
never recorded complete (P0, Phase 1)"), and it is the right one: the failure this conjunct now
catches is precisely "the operator's recovery run leaves no record to recover from next time",
which is the REQ-WVR-04 + REQ-WVR-09 pairing I argued for in v5. The product-level hole I named —
a build that passes every property while removing resume from the operator's recovery path — is
closed.

### PROP-COV-03 now counts five, and the count's owner is named (v5 F-01, second half — resolved)

PROP-COV-03 reads "Each of TSPEC §5.5's **five** mutations … TSPEC §5.5 owns the count and PLAN §4.3
agrees with it at HEAD: PLAN v1.4's §4.3 carries the fifth row (suppressed write under
`explicitPointer`, oracle `AT-05's **write-side** conjunct only`, owner T-07)". Verified against the
document, not the claim: PLAN §4.3 is headed "Mutation resistance — **five** mutations, each with an
owner who **runs** it" and its fifth row is
`| Suppress the record write while explicitPointer is true (write only on automatic runs) | AT-05's **write-side** conjunct only … | T-07 |`. PLAN T-07's task row carries the matching duty
("**Mutation duty (§4.3 rows 1–5, including row 5's suppressed write on operator-pointed runs, whose
only oracle is AT-05's write-side conjunct)**"), and PLAN §4.5's DoD checkbox and RK-5's sizing both
say five. The three-way agreement PROP-COV-03 asserts is real. My v5 Q-01 — should PROP-COV-03 trace
to TSPEC §5.5 as the count's owner — is answered in the document rather than deferred.

**One record-accuracy slip in the same material (F-01, Low).** The v1.5 revision-history row says
"PLAN §4.3 landed its fifth mutation row at **PLAN v1.4**". PLAN's own revision history files that
landing at **v1.3** ("| 1.3 | … **F-01 (High, both reviewers, unlanded since v4) landed:** §4.3 gains
a **fifth** mutation row"); PLAN v1.4 is the round-6 pass that corrected RK-5's sizing from four to
five. PROP-COV-03's own wording ("PLAN v1.4's §4.3 carries the fifth row") is *true* — it carries it
at v1.4 — so no property text is wrong; only the revision history mis-cites the landing version. This
is the same class of defect as my v5 F-02/F-03, where I asked for the landing version to be recorded,
so it is worth getting right: change "at PLAN v1.4" to "at PLAN v1.3 (carried unchanged at v1.4)".

### PROP-OVERRIDE-05's rationale now matches TSPEC's discriminator (v5 F-04, Low — resolved)

The rejected-value framing is gone. At HEAD the property says the notice "is emitted **before any
resume decision runs**, so no provenance has been resolved when it is written — TSPEC §2.4 names this
first conjunct as the discriminating one. Being 'about a rejected value' does not discriminate: a
clamped past-the-end pointer is also a rejected value yet its notice **does** carry the token
(PROP-OVERRIDE-03's own case)." That is TSPEC §2.4's exclusion column restated, including the
counter-example TSPEC uses. The oracle is unchanged, as I said it should be, so the announcement
catalogue's count of three changed shipped assertions is undisturbed.

### Properties confirmed unaffected

No other property row moved in this diff. PROP-OVERRIDE-02/-03/-04, the PROP-RECORD, PROP-DISREGARD,
PROP-SKIP, PROP-SAFETY, PROP-REPO, PROP-LAW and PROP-PRE families are byte-identical to the set I
approved at v4 and re-confirmed at v5; I did not re-litigate them.

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
