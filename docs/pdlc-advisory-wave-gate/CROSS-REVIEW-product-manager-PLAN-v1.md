# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.10)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, erratum round 10)

## Overview

**Question answered.** The erratum edit (commits `b83ecd03`…`1972402c`, +36/−14 lines over
`b902f40b`) was dispatched with an empty item list — every routed item reported ABSORBED against
upstream HEAD. So the only question with content is DEC-ERR-03's: measured against REQ v1.15,
FSPEC v1.6, TSPEC v1.11 and DECISIONS as they stand at this dispatch, is this PLAN still a faithful
compression of what upstream now says?

**On the delta itself: yes.** The edit closes OQ-7 in all four places this document was routing it
as upstream-pending, and every one of those four restatements matches the upstream text verbatim in
substance. Upstream hashes were re-computed locally and match the four the dispatch names, so the
transcriptions were checked against exactly the bytes the orchestrator pinned.

**On the document as a whole: one High divergence, inherited and untouched by this edit.** FSPEC
v1.6 changed more than BR-9. It also re-specified `AT-02-1`'s oracle for the root-cause vocabulary
from set equality to **ordered-sequence** equality, and added a two-class arm (`E-08b`). The PLAN's
`A6-05` — the task that owns `AT-02-1` — still specifies `ADVISORY_ROOT_CAUSES` as "four members"
under a blanket "Set-equality throughout", and no task in the plan claims the two-class arm. That
is a P0 acceptance-criterion (`AC-2.2`, REQ-AWG-02) whose oracle the plan now under-specifies
relative to upstream at HEAD. It predates this edit and this edit did not touch it, so it is tagged
`inherited` — non-gating, routed back to the owning phase rather than halting.

Nothing the erratum changed broke anything previously approved: no task row, batch, wave, dependency
edge or file-ownership cell moved, and I re-checked the manifest and dependency sections to confirm.

## Batches

What the edit changed, and whether each change is faithful to upstream at HEAD.

| Delta site | Change | Upstream at HEAD | Verdict |
|---|---|---|---|
| Changelog row 1.10 | New row recording the re-grounding and the OQ-7 absorption | REQ v1.15 `sha256:c62cfc35…`, FSPEC v1.6 `sha256:91ef2557…`, TSPEC v1.11 `sha256:3fa21acf…`, DECISIONS `sha256:84deee10…` — all four re-computed locally, all four match | Faithful |
| Overview — *Not in scope here* → *Decided upstream, transcribed here* | OQ-7 restated as closed, with domain and observation point spelled out | REQ `AC-5.1`: observation point is "the moment restoration completes", record carriers `AC-6.1`/`AC-6.2`/`AC-5.2` (M-WG-7) excluded, ignored paths are "operator files A6 never wrote and never restores over" | Faithful, quotation included |
| Overview — domain bullet | "ignored paths excluded **on both sides**, so an implementation that restores one *fails* AT-05-1" | FSPEC `AT-05-1`: "Ignored paths are excluded on both sides — an implementation that restores one fails this test rather than passing it" | Faithful; this is the non-obvious half and the PLAN got it right rather than paraphrasing REQ's weaker "excluded from the comparison" |
| `A6-10` task row | Ignored-path round trip becomes a fully asserted live case, no `test.todo`, map taken at BR-9's observation point | FSPEC `BR-9` domain + observation point; TSPEC §5.2 case 4 and §2.5 | Faithful, and it asserts the exclusion positively **and** negatively — stronger than the minimum |
| *Upstream dependency that is still open* → *…was open, and is now closed* | Section retired, closes with "**No upstream dependency of this plan is open.**" | TSPEC §6 `OQ-7` "Closed upstream, answered *no*"; `OQ-9` "Moot, and it never bound"; `OQ-11` "Closed… stands on its own merits" | Faithful; the `OQ-11` independence claim the PLAN leans on is exactly what TSPEC §6 says |
| `AT-05-1` traceability row | Now names the domain, the observation point and the live ignored-path case | FSPEC `AT-05-1` | Faithful |
| DoD checklist leg | Was "either landed and transcribed, or still marked pending"; now a single positive obligation on the landed boundary | The disjunct's second arm is dead now that OQ-7 is closed | Faithful, and correctly drops the arm rather than leaving a vacuously-satisfiable check |

I confirmed by grep that no residual `pending` framing for OQ-7 survives anywhere in the document:
the only remaining occurrences are historical changelog rows (1.1–1.9), which are correct as history.

## Dependencies

**Upstream at HEAD, re-read for this confirmation.** All four hashes re-computed with
`shasum -a 256` and matched against the dispatch: REQ `c62cfc35…` (v1.15), FSPEC `91ef2557…` (v1.6),
TSPEC `3fa21acf…` (v1.11), DECISIONS `84deee10…`.

**The re-grounding interval is wider than OQ-7.** FSPEC's own v1.6 changelog enumerates what moved:

> BR-2/AT-02-1 carry AC-2.2's first-matching-class rule with an ordered oracle and a two-class arm
> (E-08b); BR-9/AT-05-1/AT-05-2 pin the map's domain (non-ignored) and observation point; BR-5 and
> BR-15 transcribe the shipped exclusion and refusal orders; BR-12's signal is durable; §6 states
> the pre-A6 comparands are transcribed literals; E-34, E-23's halt writes, §2's before-base,
> AT-07-1's BR-4, AT-04-1/-02-9/-03-2/-03-7 clarified.

The erratum absorbed the `BR-9` clause of that list. I walked the rest:

- **`BR-5` / `BR-15` orders** — clean. `A6-05` already specifies `ADVISORY_REFUSAL_REASONS` and
  `ADVISORY_EXCLUSIONS` as **ordered-sequence** oracles, and the eight-member refusal count matches
  `BR-15`'s transcribed literal exactly ("unchanged — capture failure adds no ninth" is right;
  `BR-15` says a ninth reason would be a spec defect, not a missing member).
- **`BR-2` / `AT-02-1` ordered oracle** — **not clean.** See `F-01` below. `A6-05` reads
  "`ADVISORY_ROOT_CAUSES` four members … Set-equality throughout, never `toContain`", while FSPEC
  `AT-02-1` at HEAD now requires ordered-sequence equality and says in terms that "a reordering …
  set equality would pass". The PLAN names two *other* constants as ordered-sequence in the same
  sentence, so the set-equality reading of this one is unambiguous rather than a loose paraphrase.
- **`E-08b` two-class arm** — **not claimed by any task.** See `F-02`.
- **`E-23` halt writes / `E-34` capture failure** — clean; the PLAN's observation-point transcription
  and its capture-failure routing are consistent with both at HEAD.
- **`OQ-11` independence** — clean; TSPEC §6 `OQ-11` says exactly what the PLAN attributes to it.

**Note on the propagation path for `F-01`.** TSPEC §5.6's `AT-02-1` row also still reads "set-equal
to the four-member literal", and PROPERTIES `PROP-CTR-01` says "must set-equal". So the PLAN is
faithfully compressing *TSPEC*, and the stale link is one level up. That is why `F-01` is tagged
`inherited` and routes rather than halts — but it is still a finding of this confirmation, because
DEC-ERR-03 measures this document against upstream at HEAD, and FSPEC is upstream.

## Verification

How each conclusion above was reached, so the next round can re-run it rather than re-derive it.

| Check | Method | Result |
|---|---|---|
| Upstream bytes are the ones the dispatch pinned | `shasum -a 256` on all four upstream documents | 4/4 match |
| The delta is bounded | `git diff --stat b902f40b..HEAD` on the PLAN | 36 insertions, 14 deletions, one file — no collateral edits |
| No OQ-7 pending framing survives | grep `OQ-7\|pending\|test.todo` over the PLAN | 4 live sites retired; remaining hits are historical changelog rows and `A6-04`'s unrelated "already exists" note |
| `AC-5.1` transcription | Read REQ §REQ-AWG-05 at HEAD | Observation point and record-carrier exclusions match word for word in substance |
| `AT-05-1` "both sides" claim | Read FSPEC `AT-05-1` at HEAD | Matches, including the "fails this test rather than passing it" direction |
| `A6-10` is a live case | Read the `A6-10` row in full | Asserts both directions, names the observation point, explicitly excludes `test.todo` / `.skip` idioms with the `scanSkipTokens` rationale |
| Graph unchanged | Diff inspected for task/batch/wave/dependency/file-ownership rows | None touched — the edit is prose plus one traceability cell plus one DoD leg |
| `AT-02-1` oracle | Read FSPEC `AT-02-1` + `BR-2` at HEAD against PLAN `A6-05` | Divergence — `F-01` |
| `E-08b` two-class arm | grep `first-match\|matching both\|two-class` over the PLAN | Zero hits outside `A6-05`'s unrelated text — `F-02` |
| `AC-2.2` priority | Read REQ-AWG-02 heading | **P0**, which is what sets `F-01` at High |

**What would close `F-01`.** One sentence in `A6-05`'s red step: `ADVISORY_ROOT_CAUSES` is compared
by **ordered-sequence** equality against the transcribed literal
`["plan-ordering-defect","wave-internal-defect","environmental","unclassified"]`, alongside the two
constants already carrying that oracle — and, for `F-02`, one case in whichever task owns
classification (`A6-08`'s `parseA6RootCause` step is the natural home) asserting that a gate output
matching class 1 and class 2 yields `plan-ordering-defect` and carries exactly one class.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `F-01`'s stale link is one level up — TSPEC §5.6's `AT-02-1` row and PROPERTIES `PROP-CTR-01` both still say "set-equal". Does the orchestrator want the ordered-oracle correction routed to TSPEC first (so PLAN and PROPERTIES re-transcribe a corrected parent), or landed in all three in one pass? The PLAN-only fix would leave the document faithful to upstream but diverging from its immediate parent, which is the worse end state. |
| Q-02 | The PLAN's lineage header still reads `Cross-Reviews: *(none yet — active while Phase P runs)*` and pins no upstream versions in the `Upstream` row, where TSPEC's row names "FSPEC v1.6, over REQ v1.15". With this document now on its tenth erratum round and re-grounded twice, is the unpinned header intentional? Not raised as a finding — it is housekeeping, and the changelog carries the pins. |

## Positive Observations

- **The absorption is the right shape.** The four sites were not patched to say "closed" and left
  otherwise intact — the *Not in scope here* block was rewritten as *Decided upstream, transcribed
  here*, and the "Upstream dependency that is still open" heading was retitled and closed with a flat
  "**No upstream dependency of this plan is open.**" A reader arriving cold cannot mistake the routed
  state for the current one, which is exactly what DEC-ERR-01 is about.
- **`A6-10` transcribes the hard half.** REQ `AC-5.1` says ignored paths are "excluded from the
  comparison", which read alone would permit an implementation that restores one. FSPEC `AT-05-1`
  supplies the direction — restoring one *fails*. The PLAN took the FSPEC reading and asserts it
  **both ways**: mutating an ignored path leaves the round trip green, restoring one fails the case.
  That is stronger than either upstream sentence in isolation and it is the product-correct reading:
  ignored paths are operator files.
- **The DoD leg lost its escape hatch.** The old check passed if the case was "still marked
  upstream-pending with its expected value named". With OQ-7 closed that arm would have been a
  vacuously-satisfiable ship gate. The edit deleted it rather than leaving it as harmless residue.
- **The changelog row states what did *not* move.** "No task, batch, wave, dependency edge or
  file-ownership cell moves" — and I verified it. A prose-only erratum that says so up front is
  cheap to confirm.

## Delta-Confirmation Findings

*(pending)*

## Recommendation

*(pending)*
