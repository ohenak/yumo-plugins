# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 3 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v2 (`Approved with minor changes`, 0 High / 1 Medium / 1 Low) against
`REVIEWED-COMMIT: d140fbee`, with `UPSTREAM-STATE: FSPEC sha256:57b71e0c…` — that is FSPEC **v0.7**,
commit `fa229bde`. FSPEC at HEAD is `sha256:a4f775bd…` (`9a4b7593`, **v0.10**). DECISIONS' own bytes
have not moved since my approval; the question is only whether it is still a faithful compression of
upstream as upstream now stands.

The upstream delta I actually re-read is the whole span `fa229bde..9a4b7593`, not just the last
commit, because my approval was recorded against the older blob:

| FSPEC round | What it changed |
|---|---|
| v0.8 (`a6b42bae`) | Erratum note only: re-grounded on REQ v0.9, recorded the `present && config.enabled && !sectionMalformed` gate item as TSPEC-scoped. No behavioural text moved. |
| v0.9 (`cbb0a63e`, `523e2df9`) | **Substantive.** BR-9's corpus-level catalogue and BR-10's ordering-key values move from **run-level** to **per authoring dispatch**; §4.1 thresholds stay run-level; BR-10 now closes at **two loci with one completeness test each**; a run-level mirror is "additive, not the oracle — nothing asserts on it". Step 0(21), AT-20, AT-21, AT-22 restated on that locus. AC-6.2 traceability row corrected. |
| v0.10 (`9a4b7593`) | Header only: Cross-Reviews row `v{1…9}` → `v{1…11}`, version 0.9 → 0.10. |

I also re-read the two other upstream documents at the shas named in this dispatch. REQ
(`ff605dd3…`) is byte-identical to the one my v2 approval was taken against, so nothing DECISIONS
draws from REQ has shifted. TSPEC is **not** identical: my approval carried
`TSPEC sha256:72712bd8…`, and HEAD is `eff5a19b…` — TSPEC has since moved from v0.5 to v0.6 and
closed `ERR-4` and `ERR-6`. That matters here because DECISIONS makes several load-bearing
assertions *about* TSPEC's current contents, and those are exactly the kind of citation DEC-ERR-03
puts in scope for this confirmation.

So the confirmation runs on three questions: (1) does any DECISIONS entry transcribe an FSPEC rule
that v0.9 restated; (2) does any entry describe upstream's open questions as open when upstream has
closed them; (3) do the entries' binding decisions themselves survive.

## Options Considered

Three readings of the cascade were live before I checked the text, and the evidence had to pick one.

**Reading A — the delta is cosmetic, confirm and move on.** The dispatch describes the erratum as a
header correction, and the last commit really is header-only. If the only thing that moved were the
Cross-Reviews enumeration and a version label, the confirmation would be a formality: DECISIONS
cites no cross-review filenames. **Rejected as the whole story.** My approval was recorded against
FSPEC v0.7, not v0.9, so the span I own includes the v0.9 locus change. Confirming on the last
commit alone would have approved DECISIONS against two FSPEC rounds I never read.

**Reading B — the v0.9 locus change breaks a DECISIONS transcription, halt.** BR-9 and BR-10 changed
where the record lives and how many completeness tests close it. If a DECISIONS entry had
transcribed the run-level record as a binding constraint — the way DEC-LI-07 transcribes BR-14's
five-state table — the transcription would now be wrong, and wrong in the direction that produces a
red or, worse, an oracle asserted on a mirror FSPEC now says "nothing asserts on". **Rejected on the
evidence.** I traced every DECISIONS mention of `BR-8`/`BR-9`/`BR-10`/`E-32`/`AC-3.2`/`AC-3.3`. The
binding entries are all *per-dispatch* already and get stronger, not weaker, under v0.9: DEC-LI-06's
no-cache argument rests on "selection is per-dispatch over the state that dispatch observed", and
`D-O-6`'s call-count oracle is specified per injecting dispatch, including the case where
enumeration succeeds at dispatch 1 and fails at dispatch 5. FSPEC v0.9 moved *toward* those, not
away.

**Reading C — the decisions hold, but the document'sstatements *about* upstream have gone stale.**
This is what the text shows. The staleness is concentrated in two places that are not decisions:
the "Decisions deliberately NOT taken here" row for AC-3.3's locus, which still describes the
question as routed-and-open with TSPEC "keeping the run-level record", and DEC-LI-07's divergence
paragraph, which still tells the reader that TSPEC v0.5 carries `OQ.2`/`ERR-4` open and disagrees
with this document in writing. Both were true when written and are not true at HEAD. Neither
changes what DECISIONS decides; both change what a downstream author is told to believe about
upstream, which is the product risk worth naming.

I also considered whether to raise the version pins (`FSPEC v0.7`, `TSPEC v0.5` in the header and
the upstream version note) separately or fold them into Reading C's findings. Separately, at Low:
the pin is a distinct defect from the prose, it is a one-token edit, and folding it in would hide it
behind a Medium that a revising author might address narrowly.

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
