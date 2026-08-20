# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (bytes unchanged since v2 approval)
**Upstream re-read:** FSPEC `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (sha256:a4f775bd…, v0.10)
**Date:** 2026-08-19
**Iteration:** 3 (upstream-cascade confirmation)

## Context

My v2 approval of DECISIONS was recorded against `UPSTREAM-STATE: FSPEC sha256:57b71e0c…`
(commit `fa229bde`, FSPEC **v0.7**). FSPEC at HEAD is sha256:a4f775bd… (commit `9a4b7593`, **v0.10**) —
three erratum/follow-through rounds landed on top of the version I read:

| Commit | FSPEC version | Substance |
|---|---|---|
| `a6b42bae` | v0.8 | Re-grounded on REQ v0.9; records the `present && config.enabled && !sectionMalformed` gate / shipping-default item (`ERR-4`) as **TSPEC-scoped**; explicitly no behavioural change here |
| `cbb0a63e` | v0.9 | **Locus change.** BR-9's corpus-level catalogue and BR-10's ordering key values move from *once per run* to **per authoring dispatch**; BR-10 splits into two loci (per-dispatch ordering keys, run-level thresholds) with **two** completeness tests; a run-level mirror is declared "additive, not the oracle: nothing asserts on it"; AT-20/AT-21/AT-22 rewritten to name the locus and to exercise AT-18's changing-corpus fixture |
| `523e2df9`, `9a4b7593` | v0.9/v0.10 | Header Cross-Reviews row; AC-6.2 traceability row's rule column narrowed to `§Acceptance Tests preamble` (AT-31/AT-32 stay in the test column) |

DECISIONS' own bytes have not moved. The one question of this round: **is DECISIONS still a faithful
compression of FSPEC as it now stands?** REQ (sha256:ff605dd3…) is the same version my v2 approval was
taken against, so REQ-derived claims in DECISIONS are undisturbed; TSPEC is downstream of this document
and is not an input to its fidelity.

The load-bearing surface is narrow. FSPEC v0.9's locus change touches exactly the material DECISIONS
leans on in three places: DEC-LI-06's citation of **E-32** (per-dispatch observation), `D-O-6`'s
multi-dispatch call-count and `RSN-UNLISTABLE`-at-dispatch-5 obligation, and the fourth row of
**§Decisions deliberately NOT taken**, which is the only place DECISIONS speaks to AC-3.3's run-level
vs per-dispatch locus. I re-read all three against FSPEC at HEAD rather than against the item list.

## Options Considered

Three readings of the cascade were open to me, and they differ in what they do to the phase:

**(a) The locus change reds DECISIONS — halt.** FSPEC v0.9 moved BR-9's corpus-level catalogue and
BR-10's ordering keys to per-dispatch and forbade asserting on any run-level mirror. If DECISIONS had
decided the record's locus, or had built an oracle obligation on a run-level assertion, the change
would have invalidated a decision and this confirmation would be non-approving with a `delta/local`
High. I checked every candidate and none of them assert at run level: `D-O-6` already names
per-dispatch counts and `RSN-UNLISTABLE` **at dispatch 5**; DEC-LI-06 rejects the run-scoped memo
*because* E-32 is per-dispatch; DEC-LI-10's three catalogue completeness tests are locus-agnostic and
hand-transcribed either way. FSPEC v0.9 moved *toward* DECISIONS' premise, not away from it — the
per-dispatch strengthening makes `D-O-6` more, not less, well-founded. Reading (a) is not supported.

**(b) Nothing to say — approve silently.** Also wrong. The fourth row of §Decisions deliberately NOT
taken describes AC-3.3's locus as an **open question routed elsewhere**, and asserts a standing shape
("TSPEC keeps the run-level record (last-write-wins)… which locus the completeness test asserts over
is a contract decision"). FSPEC v0.10 has since *made* that contract decision, at the layer DECISIONS
said owned it. The row is now a description of a settled question presented as unsettled — stale, and
stale in a direction that misroutes the PROPERTIES author who reads it next. A confirmation that
emits zero findings here would hand that misroute forward under an approval.

**(c) Faithful-but-stale — approve with tagged non-gating findings.** This is what the bytes support.
No decision is invalidated; no obligation in `D-O-1`…`D-O-9` becomes unfalsifiable; the compression
still holds everywhere it makes a behavioural claim. What has drifted is citation currency: one
non-decision row that now understates upstream, one version-pinned FSPEC citation, and one newly
split completeness-test locus that no `D-O` obligation owns. All three are recordable, none is
gating, and each is a one-to-three-sentence edit that does not reopen a decision.

## Decision

_TBD_

## Consequences

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
