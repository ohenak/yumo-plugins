# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 9
**Round type:** upstream-cascade confirmation (TSPEC bytes unmoved; FSPEC moved under it)

## Overview

**Question answered:** does TSPEC, whose own bytes have not moved, still hold as approved against
FSPEC as it now stands at `sha256:a4f775bd…` (v0.10)?

**Answer: yes.** The cascading edit is `9a4b7593`, a header-only erratum: the FSPEC front-matter
Cross-Reviews row is corrected from `v{1…9}` to `v{1…11}`, the version field moves `0.9 → 0.10`,
and a five-line `v0.10 erratum (header only)` changelog paragraph is inserted below the v0.9
paragraph. `git diff 523e2df9 HEAD -- FSPEC-…md` is 8 insertions / 2 deletions, entirely above
`> **Scope in one line.**`. No rule (BR-*), no acceptance test (AT-*), no error-envelope row
(E-*), no locus assignment and no traceability row is touched.

**State at HEAD, re-measured this round:**

| Artifact | sha256 | Versus my v8 |
|---|---|---|
| TSPEC (under review) | `eff5a19b…` | identical to the v8 `APPROVAL-HASH` |
| REQ (upstream) | `ff605dd3…` | unmoved, matches this dispatch's stated hash |
| FSPEC (upstream) | `a4f775bd…` | moved from `764414d0…`; matches this dispatch's stated hash |

Working tree is clean, HEAD is `15d8f46e` on `feat-pdlc-learnings-injection`.

Per DEC-ERR-03 my scope is not the item list but *whether this TSPEC is still a faithful
compression of upstream at its current version*. I re-read every FSPEC passage this TSPEC leans
on and re-derived the claims whose ground could have shifted; the sections below record that
work. One finding falls out — a version-label citation the erratum made stale — and it is Low.

## Architecture

The TSPEC's architecture rows describe seams in `pdlc/workflows/orchestrate-dev.js`, not FSPEC
prose, so a header-only upstream erratum cannot falsify them by construction. What it *could*
falsify is the compression claim: that each architecture row still transcribes an upstream rule
that says the same thing. Re-checked, by upstream anchor rather than by line number:

| TSPEC row | Upstream sentence it compresses | State at FSPEC v0.10 |
|---|---|---|
| P-2a — four `dispatchKind: "authoring"` sites | "The block is assembled by a **selection step** that runs once per authoring dispatch" (FSPEC §Overview) | verbatim, untouched |
| P-3 — single `dispatchAndVerify` funnel | "The flow runs **once per authoring dispatch**, at the point the dispatch's prompt is being composed" (FSPEC §Flow) | verbatim, untouched |
| P-7 / P-8 / P-10 — read/list/git seams | BR-8's per-document rows and their unlistable/unreadable reasons | untouched |
| P-11 / P-12 — `parseAdvisoryConfig` sibling precedent | the v0.6 erratum paragraph's `ADVISORY_DEFAULTS` contrast | still present, unedited; the v0.10 paragraph is additive and sits below it |

The v0.10 paragraph is worth one explicit note, because it is the only new upstream prose in this
window and a cascade confirmation must read it rather than assume it: it says "Upstream re-read at
HEAD (REQ v0.9, unchanged); no upstream decision to absorb … Header correction only; no
behavioural change." That is a self-describing no-op, and I verified the description against the
bytes rather than trusting it — the diff really is confined to the two header lines plus the
paragraph itself. There is no new decision for the TSPEC to absorb, and therefore no architecture
row that has fallen out of date.

The implementation anchors themselves have not moved since v8 (`472e505c` remains the last commit
to touch `orchestrate-dev.js`), so my v8 by-symbol re-verification of P-2a, P-3, P-11/P-12 and the
seam contracts stands unchanged; I did not re-run it, and nothing in this window invalidates it.

## Interfaces

The interface contracts most exposed to an upstream cascade are the ones whose text quotes or
paraphrases FSPEC, because those are the ones a re-worded upstream silently breaks. Each was
re-read against FSPEC v0.10:

- **§I.2 / §I.4 — the `config.enabled` gate.** The TSPEC states the injector is gated on
  `config.enabled` alone, an absent section reading as REQ §4.1's declared `true`, a malformed
  section failing **open** with `NTC-MALFORMED`. FSPEC's v0.8 erratum paragraph — which is the
  passage that settles this, and which the v0.10 edit did not touch — still says "Step 0(2) and
  BR-14 read an absent section as REQ §4.1's declared defaults with `enabled` at `true`, and there
  is no second gate beyond that key (REQ v0.9 AC-5.1a)". Faithful compression, unchanged.
- **§I.3 — `present` as report shape, not gate.** Same upstream sentence, same disposition. My v8
  F-02 (no behavioural oracle beyond the shape assertion) survives as an *inherited* Medium; the
  cascade neither fixed it nor worsened it.
- **Seam signatures (`_readFile` / `_listFiles` injectables).** FSPEC constrains outcomes, not
  seam design; nothing upstream moved to contradict the TSPEC's choices.
- **Notice catalogue (`NTC-*`, `RSN-*`).** FSPEC's catalogue rows are untouched at v0.10; the
  TSPEC's transcription of them still matches one-for-one.

**The one thing the cascade did break is a citation label, not a contract.** TSPEC's front-matter
Upstream row reads `FSPEC-pdlc-learnings-injection.md` **(v0.9)**, and six body passages cite
"FSPEC v0.9" by version (`:325-326` BR-9/BR-10 loci, `:469` the E-21…E-34 rows, `:943` the AT-20 /
AT-22 halves, `:1275`, `:1295`). Upstream is now v0.10. Every *proposition* those passages
attribute to FSPEC v0.9 is still present verbatim at v0.10 — I checked BR-10's "The rule inputs sit
at **two loci**" (`FSPEC:555`), the "recorded **per authoring dispatch**" clauses (`:511`, `:168`),
the AC-3.3 → BR-10 → AT-22 traceability row (`:143`) and E-26 (`:730`) — so no claim is falsified
and nothing is gating. But a reader resolving "FSPEC v0.9 BR-9/BR-10" against HEAD finds a document
that calls itself v0.10, and the header row now names a version that no longer exists. That is
F-01 below: Low, `delta` (this round's edit created the mismatch), `local` to the header the edit
changed. Fix is a one-line bump when the TSPEC is next opened; it does not warrant reopening a
frozen document on its own.

## Data Model

The TSPEC's data model is where the previous cascade (`523e2df9`, the v0.9 locus corrections) did
real work, so it is where I looked hardest for residue. All four load-bearing shapes still
transcribe upstream exactly at v0.10:

| TSPEC shape | Upstream at FSPEC v0.10 | Verdict |
|---|---|---|
| §D.1 four field domains — `corpusOutcome`, per-document `reason`, `orderKeys`, `runMirror.corpusOutcome` | "Corpus-level outcomes, per-document reasons and ordering key values are recorded **per authoring dispatch**… run-level mirrors are additive, not oracles" (v0.9 paragraph, unedited) | faithful |
| §D.2 `ruleInputs.thresholds` at run level | "§4.1 thresholds stay run-level" (same paragraph); BR-9 body "thresholds once per run" (`FSPEC:247`) | faithful |
| BR-10 two-loci record | "The rule inputs sit at **two loci**, reproducibility being claimed per dispatch, not per run (AC-3.3)" (`FSPEC:555`); "BR-10's rule-input record is separate and closed at its own two loci; the records are not merged" (`:507`) | faithful |
| Per-document catalogue rows | "**Per-document catalogue.** Recorded **per authoring dispatch**, alongside BR-8's rows" (`:511`) | faithful |

The AT closure also still balances against upstream: FSPEC still carries the AT-* set the TSPEC's
2+9+3+3+6+12 = 35 partition maps onto, and the AC-3.3 → BR-10 → AT-22 traceability row (`:143`)
that the v0.9 round corrected is intact — the v0.10 erratum did not disturb the traceability table
it claims (accurately, this time) to have left alone.

Two data-model observations carry forward from v8 unchanged, both `inherited`:

- **F-02 below (was v8 F-01, Medium):** §D.1's fourth domain requires a membership test on
  `runMirror.corpusOutcome` while §A.5 forbids any §T.6 fixture asserting on the mirror. Upstream's
  wording — "run-level mirrors are additive, not oracles" — is the *source* of the tension and is
  unchanged at v0.10, so this is a PLAN-time wording repair exactly as recorded, not a cascade
  defect.
- **F-04 below (was v8 F-03, Low):** still no closure test over `Object.keys(ruleInputs)` itself.
  Upstream asks for two per-locus completeness tests (`FSPEC:868`, "**two** completeness tests
  assert set equality, one per BR-10 locus") and the TSPEC provides exactly two. Additive, as
  before.

## Test Strategy

A header-only upstream erratum cannot change what must be tested, and this one does not. The
strategy checks I would re-run on a substantive cascade were run anyway, against FSPEC v0.10, and
all pass:

- **Every FSPEC AT still has a TSPEC home.** The AT-* population is unchanged (110 `AT-` mentions
  at v0.10, the same text the v0.9 round left), and §T.1–§T.6's suite assignment still partitions
  35 ATs across `learningsSelect`, `learningsRecord`, `learningsConfig`, `learningsNotice`,
  `advisoryDisabled` and the integration suite. No AT was orphaned by the edit, because no AT was
  touched by it.
- **Per-dispatch oracles survive.** §T.2's split — per-dispatch `orderKeys` set equality on
  `dispatches[i]`, run-level set equality over `Object.keys(ruleInputs.thresholds)` — still matches
  `FSPEC:868` word for word. This is the assertion the v0.9 cascade repaired, and it did not
  regress under v0.10.
- **Positive-conjunct discipline holds.** AT-32's positive-presence conjunct (added at FSPEC v0.7
  precisely so its equality check could not be vacuously green) is still in upstream and still
  mirrored in the TSPEC; the `DIVERGENT-CORPUS` fixture still asserts exact status plus named
  reason rather than an absence-shaped `!= ok`.
- **Property-based coverage.** The ordering/selection rule remains the parameterisable component
  here and the TSPEC still calls for a property strategy over corpus permutations alongside the
  example ATs; nothing upstream withdrew the input space that strategy ranges over.
- **Mutation-sensitivity of the load-bearing oracles** is a PLAN/implementation-time obligation and
  is unchanged by this round.

The only testing-lens residue of this cascade is documentary: a PLAN author transcribing §D.1 or
§T.2 will see them cite "FSPEC v0.9" and must resolve that against a v0.10 file. Since the cited
propositions are byte-identical, this misroutes no test — it costs a reader one extra lookup.
That is the whole cost, and it is F-01's Low severity.

No new test obligation is created by this round, and none is retired.

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
