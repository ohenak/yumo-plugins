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

**DECISIONS still holds as approved against FSPEC at HEAD.** Reading (c). Every decision I approved in
v2 survives the upstream edit; three citation-currency findings are recorded, all non-gating.

Evidence, claim by claim, re-derived against FSPEC sha256:a4f775bd… rather than against my v2 notes:

| DECISIONS claim | FSPEC at HEAD | Verdict |
|---|---|---|
| DEC-LI-06 — "contradicts FSPEC E-32: selection is per-dispatch over the state that dispatch observed" | E-32 untouched by the diff; v0.9 *extends* per-dispatch locus to BR-9's corpus-level catalogue and BR-10's ordering keys | Holds, strengthened |
| DEC-LI-06 re-evaluation trigger — "FSPEC relaxes E-32 to a run-scoped observation (the per-dispatch call-count oracle of `D-O-6` reds)" | The edit moved in the opposite direction; the trigger's mechanism is intact and still detectable | Holds |
| `D-O-6` — enumeration succeeding at dispatch 1 but failing at dispatch 5 records `RSN-UNLISTABLE` at 5 | AT-20 now reads corpus-level outcomes **per dispatch** and exercises AT-18's changing-corpus fixture ("one run-level field fails") | Holds; upstream now names the same shape |
| DEC-LI-07 — "FSPEC v0.7 `BR-14` carries the same five states" | BR-14's bytes are untouched by `fa229bde..HEAD`; the five states are identical. Only the version pin is stale (v0.7 → v0.10) | Holds on substance; F-02 |
| DEC-LI-09 — AC-6.2 baseline, sha-ancestry + positive-absence conjuncts | The AC-6.2 traceability edit narrowed the *rule* column only; AT-31/AT-32 remain AC-6.2's tests, and DEC-LI-09 cites neither by number | Untouched |
| DEC-LI-10 — three closed catalogues, one hand-transcribed completeness test each | BR-9's catalogues and their closure are unchanged in kind; only the recording locus moved. BR-10's record is not one of DEC-LI-10's catalogues | Holds; see F-03 for the unowned second BR-10 locus test |
| §Decisions deliberately NOT taken, row 4 — AC-3.3 locus "not re-raised here… TSPEC keeps the run-level record" | BR-10 now fixes the loci (per-dispatch ordering keys, run-level thresholds), mandates **two** completeness tests, and states a run-level mirror is "additive, not the oracle: nothing asserts on it" (AC-3.2) | **Stale**; F-01 |

F-01 is the only finding with downstream teeth, and its teeth are testability, not correctness: a
PROPERTIES author who takes row 4 at face value would believe the locus is still open and could write
the completeness assertion over the run-level mirror — the one place FSPEC now says nothing asserts.
That is a false-green shape (a mirror can be right for a single-dispatch run and silently wrong for
the divergent run AT-18 exists to produce), which is why I record it rather than waving it through.
It is `delta` (FSPEC's edit created the mismatch) and `local` (it sits on the BR-9/BR-10 material the
edit changed), and Medium, because DECISIONS explicitly disclaims ownership of this question — it
misdescribes upstream, it does not contradict it.

Recommended edit for row 4, for the author, no decision reopened: replace the open-question framing
with "**settled upstream** — FSPEC v0.9 `BR-10` fixes the loci (ordering keys per authoring dispatch,
thresholds once per run) with one completeness test per locus; a run-level mirror is additive and is
not an oracle (AC-3.2). Recorded here for traceability only."

## Consequences

**For this phase.** The confirmation is approving, so the cascade does not halt and DECISIONS does not
re-enter its ordinary revision loop. All three findings are Medium/Low and can land as an erratum
alongside whatever else the phase is carrying; none of them blocks PROPERTIES authoring from starting.

**For PROPERTIES, which is the next reader of this document.** Two ordering notes, because PROPERTIES
transcribes obligations rather than re-deriving them:

- Take BR-10's loci from **FSPEC**, not from §Decisions deliberately NOT taken. Two completeness
  tests, one per locus: ordering key values per authoring dispatch, thresholds once per run. Any
  assertion written over a run-level mirror of the ordering keys is, by FSPEC's own words, an
  assertion over a non-oracle — and it is exactly the assertion that goes green on a single-dispatch
  fixture and stays green through the divergent run AT-18 constructs. Land F-01's row edit before that
  transcription happens and the hazard never reaches a test file.
- `D-O-6`'s per-dispatch call-count oracle is now doubly grounded: DEC-LI-06 rejects the memo on E-32,
  and FSPEC AT-20/AT-22 independently require per-dispatch readback of corpus outcomes and ordering
  keys. My v2 F-03 (unfiltered `_git` counters cannot hold a literal equality across a whole pipeline
  run) is unchanged by this cascade and still worth the one-sentence scoping fix when `D-O-6` is next
  touched — it is inherited, not raised again here, and it is not part of this round's gate.

**For the harvest phase.** The mechanism behind F-01 is reusable and worth a `Cross-Feature` note when
this feature harvests: *a "deliberately not decided / routed elsewhere" row is a citation into another
document's open state, and it goes stale exactly like a quoted rule does.* Non-decision registries read
as inert prose and are therefore the last thing a cascade confirmation checks, but they are what a
downstream author consults when deciding whether a question is theirs to answer. The upstream-cascade
protocol (DEC-ERR-03) already asks for this — the finding is evidence the ask is load-bearing, not a
formality.

**What this round did not do.** I did not re-read DECISIONS end to end, did not re-derive the code
claims at HEAD that v2 verified, and did not revisit any settled decision. Sections of FSPEC outside
`fa229bde..HEAD` were read only where DECISIONS cites them.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | Row 4 of the non-decision registry presents AC-3.3's run-level vs per-dispatch locus as open and routed to REQ via TSPEC `ERR-6`, and states "TSPEC keeps the run-level record (last-write-wins)… which locus the completeness test asserts over is a contract decision". FSPEC v0.9 `BR-10` has since made that contract decision: ordering keys per authoring dispatch, thresholds once per run, **two** completeness tests (one per locus), and a run-level mirror that is "additive, not the oracle: nothing asserts on it" (AC-3.2). A PROPERTIES author following this row can still believe the run-level record is an assertable locus — a false-green shape that holds on a single-dispatch fixture and breaks silently on AT-18's divergent run | §Decisions deliberately NOT taken, row 4 |
| F-02 | Low | delta | nonlocal | DEC-LI-07 cites "FSPEC **v0.7** `BR-14` carries the same five states". FSPEC is v0.10 at HEAD. BR-14's bytes are untouched by `fa229bde..HEAD`, so the substantive claim is true — but a version-pinned citation that names a version no longer on disk cannot be checked by the next reader without redoing this diff | DEC-LI-07 §Context |
| F-03 | Low | delta | local | BR-10's single completeness test became **two**, one per locus. No `D-O` obligation names either. DEC-LI-10's hand-transcription rule (DC-14) is scoped to the three `RSN-*`/corpus-outcome/`NTC-*` catalogues, so the newly split BR-10 locus tests inherit no anti-vacuity obligation from this document — nothing here stops them being written as `X === X` against the emitted record | `D-O-1`…`D-O-9` obligations table; DEC-LI-10 |

FINDING: Medium | delta | local | §Decisions deliberately NOT taken, row 4 | Row describes AC-3.3's record locus as an open question routed to REQ/TSPEC and endorses TSPEC's run-level record, but FSPEC v0.9 BR-10 at HEAD has settled it — per-dispatch ordering keys, run-level thresholds, two completeness tests, and a run-level mirror explicitly declared "additive, not the oracle: nothing asserts on it"; the stale row can send the PROPERTIES author to assert over the non-oracle locus
FINDING: Low | delta | nonlocal | DEC-LI-07 §Context | Version-pinned citation "FSPEC v0.7 BR-14" now names a version that no longer exists (HEAD is v0.10); BR-14's five states are unchanged, so the claim is true but no longer checkable without re-deriving the diff
FINDING: Low | delta | local | D-O obligations table / DEC-LI-10 | BR-10's completeness test split into two per-locus tests upstream; no D-O obligation owns either, and DEC-LI-10's DC-14 hand-transcription rule covers only the three id catalogues, leaving the new locus tests without an anti-vacuity obligation in this document

## Recommendation

**Approved with minor changes** — DECISIONS remains a faithful compression of FSPEC as it now stands.
No decision was invalidated by the erratum; the three findings are citation-currency repairs. F-01 is
worth landing before PROPERTIES authoring transcribes BR-10's oracles.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
APPROVAL-HASH-NORMALIZED: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
REVIEWED-COMMIT: 42515b3e428cb73faea56cd452d38ce46a9bffed
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:a4f775bd64c167994ba62897ffe6c78efd82d017369bdf632c0f49b858dfa9a5
UPSTREAM-STATE: TSPEC sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
