# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2 (delta confirmation, erratum round — continuation of round 1)

## Overview

**Question answered.** Does the erratum delta resolve the five routed items without breaking what v1
approved, and is this PROPERTIES still a faithful compression of its upstream *at HEAD*? Answer:
**yes on both**, with two Low findings — neither gating, both inside text this round added.

**Re-grounding first (DEC-ERR-03).** All five upstream documents were re-hashed on disk before
reading the delta, and all five match the dispatch byte for byte: REQ `c62cfc35…`, FSPEC
`91ef2557…`, TSPEC `3fa21acf…`, DECISIONS `84deee10…`, PLAN `f7de7fcb…`. Nothing this document
cites has moved underneath it since round 1, so the confirmation reduces to: are the delta's new
claims true of that upstream, and did the edit disturb anything else?

**Delta measured.** `git diff 1e297117..HEAD` on the document: **26 insertions, 10 deletions**,
across exactly six sites — the v1.4 changelog row, PROP-ENV-13 (§C), PROP-REST-03 and PROP-REST-08
(§E), Fixtures hazard 2, the C-3 PLAN-home matrix rows for A6-13/A6-15, and §G-3's preamble plus a
new item 3. No property was added or removed; no category, oracle form or level assignment moved
except PROP-ENV-13's, which the round's own items required. The changelog's closing claim — "no
other property statement, category, level assignment, oracle form or PLAN home changed in this
round" — is true of the diff as measured.

**Round-1 findings, all three closed.**

| v1 finding | Disposition at HEAD |
|---|---|
| F-01 (Medium) — undecided `attempts` literal | **Closed.** The conjunct now reads `attempts` **unchanged**, sourced to FSPEC BR-15 and §3.3's flow table |
| F-02 (Medium) — Home vs. where PLAN mints the case | **Closed.** Home and the C-3 row move to the former-A6-13 red step; the un-minted run-level conjuncts are routed, not dropped |
| F-03 (Low) — E-34 untraced | **Closed.** PROP-REST-08's Traces cell carries `E-34` and its text names the observable |

The two items raised by se-review (the `attempts` literal, and PROP-REST-03 / hazard 2 over-asserting
against BR-9) are closed by the same edit; I re-checked both against upstream rather than taking the
changelog's word for it, and both check out — see the sections below.

## Properties

### PROP-ENV-13 — the `attempts` conjunct (v1 F-01, SE F-01)

The replacement expected value is **transcribed, and the transcription is correct**. I checked each
of the three sources the row now cites, at HEAD:

- **FSPEC BR-15** (line 249) lists `post-action-verification-failed` inside the tier's closed
  eight-member *refusal* reason set. So this disposition is a refusal, not a diagnosis-only
  escalation.
- **FSPEC §3.3's flow table, step 5** (line 140) reads, verbatim: *"escalate with a refusal reason,
  no attempt consumed"*. That is the rule governing refusals, and it decides the literal the v1
  round found undecided.
- **The shipped driver** agrees: `runAdvisorySeam`'s step-4 `ACT` arm calls `doRevert()` and then
  `terminate({outcome:"escalated", reason: refuse({"post-action-verification-failed": true}),
  verdict, attempts, appliedSuccessfully:false})` with `attempts` passed through unincremented.

So the property no longer mints a red test that a spec-following implementation fails — which was
the whole of the v1 concern. The row also records *why* the earlier literal was wrong, which is the
right disposition: it stops the "one attempt consumed" reading being re-derived by a later reader.

One imprecision in the supporting prose, not in the expected value: the row says the increments live
"only on the malformed-verdict and red-re-gate arms". At HEAD the driver also increments on the
seam-budget preemption arm and on the dispatch-error arm, both of which terminate or re-enter with
`budget-exhausted`. The asserted conjunct is unaffected — this is an over-strong "only" in an aside
about the shipped code — but it is the kind of claim a later reader will check, so F-01 below.

### PROP-ENV-13 — the re-home (v1 F-02, SE F-02)

Correct, and the residue is routed rather than dropped. PLAN at HEAD mints this case in exactly one
place, **A6-14's former-A6-13 red step**: *"`apply` … returning `{ok:true}` iff `producedPaths()` is
non-empty (an empty set is `{ok:false}` ⇒ `post-action-verification-failed`, which is also the
disposition for a repair writing only `.gitignore`d paths — OQ-11, stands independently of OQ-7)"*.
A6-18's row enumerates the former-A6-15/-16/-17 red steps in full and names no such case. The new
Home cell and the C-3 matrix row both point there.

The honest part of this fix is §G-3 item 3. That red step is a `buildA6SeamOps` member contract, so
it mints the `producedPaths() === []` / `{ok:false}` half directly; the property's run-level
conjuncts (escalation entry written, no re-gate token appended past the anchor) need a
`runWaveGateSeam` run that PLAN does not enumerate. Rather than silently narrow the property to what
PLAN happens to mint — which would have lost product behaviour AC-3.4 requires — the document keeps
every conjunct, levels the property `Unit + Integration`, names the two acceptable PLAN resolutions,
and routes the choice to se-author. From the product lens that is the right trade: no acceptance
criterion is quietly dropped, and the open question is visible to whoever owns it.

One consistency nit the re-home introduces: the new Home cell is spelled in PLAN's **HEAD**
numbering (`A6-14, former-A6-13 red step`) while every sibling Home cell and the whole C-3 matrix
are spelled in the retired **v1.2** numbering the matrix preamble declares (`A6-15`, `A6-09`, …).
The two spellings are individually correct and reconcilable — the matrix's own row for this property
is `A6-13`, which is the v1.2 name of the same step — but a reader who takes the matrix preamble at
face value reads that A6-14 is a GREEN task "carrying no properties by construction" and then finds
a Home cell pointing at it. F-02 below; the fix is one spelling, not a re-home.

## Oracles

### PROP-REST-03 — presence, not bytes (SE F-03)

The narrowing is right, and it is right for a product reason worth stating: BR-9 at FSPEC v1.6 puts
`.gitignore`d paths outside the restoration map **in both directions**, and says in terms that *"an
ignored path the re-gate mutated is not a restoration defect"*. An oracle asserting the ignored file
is unchanged byte for byte would therefore fail an implementation that did exactly what the rule
permits — a re-run post-wave command writing into an ignored cache. That is a false red against
correct behaviour, which is the same defect class as v1's `attempts` finding, and it is now gone.

What survives is still enough to do the job the property exists for. TSPEC §5.2's case 4 states the
observable as *"a `.gitignore`d file the wave added is still present after restore — the assertion
that pins `git clean -fd` over `-fdx`"*, and presence alone discriminates `-fd` from `-fdx`: the
`-fdx` implementation deletes the file and fails. The non-ignored half is untouched and still
asserts **absent, not merely reset**, which is FSPEC AT-05-1's word. So the edit removed a conjunct
that over-asserted and kept the one that falsifies.

The row also keeps its OQ-7 closure paragraph and its "an implementation that deleted or restored
over the ignored file therefore **fails** this property" close, both of which I checked against
FSPEC BR-9 / AT-05-1 and REQ AC-5.1 in round 1 and neither of which this edit disturbed.

### PROP-REST-08 — the E-34 trace (v1 F-03)

Closed, and closed as a trace rather than a new property, which is what round 1 asked for. FSPEC
E-34 reads: *"The pre-A6 tree state cannot be captured at all … the safe branch: no repair is
proposed and none is applied. A6 escalates without dispatching a repair, the wave halts on its own
red gate exactly as today … The escalation names the capture as the cause."* Every clause of that
has an assertion on this row: no `_agent` call (nothing dispatched), `attempts === 0` and budget
unchanged (nothing attempted), the halt on the wave's own gate literal with `repairApplied: false`
and `repairPaths: []` (nothing applied, and the report says so), and an escalation entry whose text
contains the failing git verb (the capture named as the cause). `E-34` is now in the Traces cell,
so §Scope's `E-01…E-34` claim is discharged by a property rather than by assertion.

I re-checked the two coverage matrices for collateral damage: C-1 is keyed by AC and C-2 by AT
id, so neither ranges over E-ids and neither needed an edit for this. `AC-3.4`, `AC-6.1` and
`AC-6.3` still list PROP-REST-08, and PROP-ENV-13 is still under `AC-3.4`. No matrix row was
orphaned by the delta.

## Fixtures

**Hazard 2 now matches the oracle it describes.** The fixture note and PROP-REST-03 previously
disagreed with BR-9 in the same way and have been corrected in the same way — the ignored file the
wave added is *"asserted still **present**, and only present"*, with the reason given inline (BR-9
puts a mutated ignored path outside the map in both directions, so a byte-for-byte conjunct would
assert more than the rule it exists to enforce). Fixture note and property row now say the same
thing, which is the point of the hazard note existing.

The rest of hazard 2 is intact and still correct against upstream: the non-ignored untracked file
asserted **absent** after restore, and the non-ignored generated output the re-run post-wave command
rewrites over an already-dirty path as PROP-REST-02's discriminator, with the standing warning that
substituting an ignored path for that last one makes AT-05-2 vacuous — which is exactly what FSPEC
AT-05-2 says (*"whose generated output is `.gitignore`d tests nothing here, since BR-9 puts it
outside the map"*). The three-file fixture therefore still exercises all three of BR-9's domain
boundaries and no fixture element was made redundant by the narrowing.

**No new fixture obligations.** PROP-ENV-13's re-home does not change what the fixture must contain
— the ignored-path-only repair and its non-ignored positive control are the same pair as before —
only which PLAN task mints the assertions over it. PROP-REST-08's E-34 trace adds no fixture: the
`captureTreeSnapshot`-returns-`null` case was already fixtured. So the delta introduces no fixture
the PLAN's file-ownership manifest does not already assign.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §G-3 item 3 leaves PLAN a two-way choice (name the end-to-end ignored-path-only case in A6-18's former-A6-15 step, or state that A6-14's red step carries it end to end). Product-side either is fine; is there a preference to record so the choice does not re-open in Phase I? |

## Positive Observations

- **Every one of the five routed items landed, and each landed with its source quoted rather than
  asserted.** The `attempts` correction cites BR-15, FSPEC §3.3 step 5 and the shipped driver on the
  row itself; PROP-REST-03 quotes BR-9's exact clause. A later reader can re-derive both without
  re-opening the upstream, which is what makes an erratum durable.
- **The round re-grounded before editing, and said so.** The v1.4 changelog names all five upstream
  hashes and records that the re-grounding surfaced no missed decision — and the hashes match HEAD
  byte for byte, so the claim is checkable and true.
- **Two of the corrections removed false reds rather than adding assertions.** Both the `attempts`
  literal and the byte-for-byte ignored-path conjunct would have failed implementations that
  followed the spec. Catching that class before Phase I is worth more than any conjunct added.
- **The un-minted conjuncts were routed, not narrowed away.** Trimming PROP-ENV-13 to what PLAN
  happens to mint would have made the mismatch disappear at the cost of AC-3.4 coverage. Keeping
  every conjunct and routing the levelling gap to its owner is the disposition that protects the
  requirement.
- **The changelog's "nothing else changed" claim is true as measured.** I diffed rather than trusted
  it, and the 26/10 diff touches exactly the six sites it names.

## Recommendation

**Approved with minor changes**

The delta resolves all five routed items and breaks nothing v1 approved. Both findings below are Low,
both sit in prose this round added, and neither touches an expected value, a trace, a level or a
PLAN home. Neither gates the round; both are one-line edits whenever this document is next open.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | PROP-ENV-13's new supporting prose says the driver's `attempts` increments live "only on the malformed-verdict and red-re-gate arms". At HEAD `runAdvisorySeam` also increments on the seam-budget preemption arm (the in-flight attempt counts as consumed by the preemption) and on the dispatch-error arm. The asserted conjunct — `attempts` unchanged across a `post-action-verification-failed` refusal — is correct and unaffected; only the "only" is over-strong. Fix: drop "only", or list the four increment sites. | §C, PROP-ENV-13 |
| F-02 | Low | delta | local | PROP-ENV-13's Home cell is spelled in PLAN's HEAD numbering (`A6-14, former-A6-13 red step`) while every sibling Home cell and the whole C-3 matrix use the retired v1.2 numbering the matrix preamble declares — and that preamble lists A6-14 among the GREEN tasks that "carry no properties of their own by construction". Both spellings name the same step and the C-3 row (`A6-13`) is right under the matrix's own convention, so this is legibility, not a wrong home. Fix: spell the Home cell `A6-13` like its siblings and keep the "PLAN A6-14's former-A6-13 red step" gloss in the row text, or add one sentence to the C-3 preamble reconciling the two numberings. | §C PROP-ENV-13 Home; §C-3 preamble |

FINDING: Low | delta | local | §C, PROP-ENV-13 | the new prose claims the driver's attempts increments live "only on the malformed-verdict and red-re-gate arms", but at HEAD the seam-budget preemption arm and the dispatch-error arm also increment; the asserted unchanged-attempts conjunct is correct and unaffected, only the "only" is over-strong
FINDING: Low | delta | local | §C PROP-ENV-13 Home and the §C-3 preamble | the Home cell is spelled in PLAN's HEAD numbering (A6-14) while every sibling Home cell and the C-3 matrix use the retired v1.2 numbering, whose preamble lists A6-14 as a GREEN task carrying no properties — same step, two spellings, one of which the preamble contradicts

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:89deeaf8b614c7cc36ded278cd74fa4619a13fbf083b2cd7c75bf6f6b562211d
APPROVAL-HASH-NORMALIZED: sha256:31e8479a7da065287cc5a67f2e3c89c3f292420158f0aa6803a8aed0c1a858fa
REVIEWED-COMMIT: 32a459ef6ca703e0c22bd601600df4e1b8c13799
UPSTREAM-STATE: REQ sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
UPSTREAM-STATE: FSPEC sha256:91ef25574e678b3c5433467ff31f800bdcb17bcff54e5f1a59c2e6da28e5cb34
UPSTREAM-STATE: TSPEC sha256:3fa21acf346e987c39d625133e5d56f4873b0cf2a205cad9460a6b4944eb7a00
UPSTREAM-STATE: DECISIONS sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc
UPSTREAM-STATE: PLAN sha256:f7de7fcb0f1199f3846d6fa94eba18d5243bc64b94dc8a5b81b38e43664db563
