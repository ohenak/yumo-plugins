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

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
