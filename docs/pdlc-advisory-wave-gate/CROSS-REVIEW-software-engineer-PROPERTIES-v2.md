# Cross-Review: software-engineer — PROPERTIES (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2 (delta confirmation, round v2)

## Overview

**Scope of this round.** A delta confirmation over the v1.4 erratum edit to PROPERTIES
(`1e297117..HEAD`, +26/−10 lines), measured against upstream at the SHAs this dispatch names — REQ
`c62cfc35`, FSPEC `91ef2557`, TSPEC `3fa21acf`, DECISIONS `84deee10`, PLAN `f7de7fcb`. I re-read the
upstream text the changed rows now lean on (FSPEC §3.3's flow table, BR-9, BR-15, E-34; TSPEC §5.2
cases 3–5, §5.5's ignored-path-only row; PLAN's A6-14 and A6-18 red steps) rather than trusting the
document's transcription, per DEC-ERR-03.

**Answer to the question asked:** yes. All five routed items land, each on the form upstream actually
states at HEAD, and nothing I approved in v1 is broken by the edit. My one v1 High (F-01,
PROP-ENV-13's "one attempt must be consumed") is resolved on the strongest available replacement.
Two Low findings survive — one inherited PLAN-task-id drift the edit did not fix, one label
inconsistency the edit introduced — and one new Low records a residual the document itself routes to
se-author. None gate.

**Files changed by the delta:** the changelog (new v1.4 row), PROP-ENV-13 (§C), PROP-REST-03 and
PROP-REST-08 (§E), Fixtures hazard 2, the §C-3 PLAN-home matrix (two rows), and §G-3 (new item 3).
No other property statement, category, level or oracle form moved — I diffed to confirm the
changelog's claim to that effect, and it holds.

## Properties

Item-by-item verification of the changed property rows, each against upstream at HEAD.

### Item 1 + 4 — PROP-ENV-13's `attempts` conjunct (my v1 F-01, High) — **resolved**

The row now asserts `attempts` **unchanged** across the refusal, and cites three sources. All three
check out at HEAD:

- **FSPEC BR-15** (`FSPEC §"BR-15 — Refusal reasons are the tier's eight"`) lists
  `post-action-verification-failed` in the closed eight-member refusal set — so this outcome is a
  *refusal*, not a diagnosis-only escalation. Transcription correct.
- **FSPEC §3.3's flow table, step 5** reads, verbatim, `escalate with a refusal reason, no attempt
  consumed`. Transcription correct, and it is the row the conjunct needs.
- **The shipped driver.** `runAdvisorySeam`'s step-4 `ACT` arm returns
  `terminate({ outcome: "escalated", reason: refuse({ "post-action-verification-failed": true }),
  verdict, attempts, appliedSuccessfully: false })` — `attempts` passed through, not incremented.
  Verified at the `// ── step 4 ACT` block of `pdlc/workflows/orchestrate-dev.js`. (I cite by block
  marker rather than by line, DEC-DOC-01; my own v1 finding used a raw line anchor and should not
  have.)

TSPEC §3.3's `apply` row and §5.5's ignored-path-only row remain silent on attempts, which is what
made the old literal undecided upstream rather than merely wrong. The replacement is the strongest
*positive* available — unchanged is falsifiable against an implementation that charges the wave for a
refusal it never got a re-gate for — so this is not a weakening. The row also records what the
earlier revision said and why it was wrong, which is the right thing for a reader of the old bytes.

### Item 2 — PROP-ENV-13's home (my v1 F-02 half, PM F-02) — **resolved**

Verified against PLAN at HEAD:

- **A6-14's red step (former A6-13)** does name this case, verbatim: `apply` … `returning {ok:true}
  iff producedPaths() non-empty`, `empty ⇒ {ok:false} ⇒ post-action-verification-failed, which is
  also the disposition for a repair writing only .gitignore'd paths — OQ-11`. This is the one place
  PLAN mints it.
- **A6-18's red step (former A6-15)** enumerates its cases in full — tier-gate arms (i)–(iv), wave
  budget, capture failure, the two-attempt ledger-anchor fixture, prohibitions `(f)`…`(i)`, BR-1…BR-16
  — and does **not** name the ignored-path-only case. The document's claim is accurate; I re-read the
  full step to confirm it is an omission and not a paraphrase I missed.
- **TSPEC §5.5** assigns the case an oracle but no task, so PLAN is the only home authority. Nothing
  upstream contradicts the move.

The property row's Home cell and the §C-3 matrix now agree in substance. Two residuals, both Low, in
the findings table: the matrix rows still carry PLAN v1.2 task ids while the Home cell carries v1.3
ids, and the property's Integration-level conjuncts still have no minted home (routed as §G-3 item 3).

### Item 3 — E-34's trace (PM F-03) — **resolved**

FSPEC §5.4's E-34 row reads "The pre-A6 tree state cannot be captured at all… **no repair is
proposed and none is applied**. A6 escalates without dispatching a repair, the wave halts on its own
red gate exactly as today." PROP-REST-08's conjuncts are exactly that set of observables — capture
returns `null`, no `_agent` call, `attempts === 0`, budget unchanged, halt on the gate literal with
§4.5's four fields. The added `E-34` trace and the "E-34's only property home" claim are both correct:
no other property in §E covers capture failure (PROP-REST-05 is E-28, restoration failure). The
`E-01…E-34` Scope widening is now covered.

## Oracles

### Item 5 — PROP-REST-03's ignored-path conjunct (my v1 F-03, Low) — **resolved**

The conjunct is now `still **present** after restore`, with the byte-for-byte clause deleted and a
sentence stating why ("BR-9 states that an ignored path the re-gate mutated is not a restoration
defect, so no property may assert an ignored path is unchanged byte for byte"). Checked against the
three upstream sites:

- **FSPEC BR-9 / AT-05-1 (v1.6)** put ignored paths outside the map *in both directions* — the exact
  words the row quotes.
- **TSPEC §5.2, case 4**: "a `.gitignore`d file the wave added is still **present** after restore —
  the assertion that pins `git clean -fd` over `-fdx`." Presence only. The PROPERTIES row is now a
  verbatim-strength match rather than a strengthening.
- **TSPEC §2.5's `clean -fd, not -fdx` bullet** reaches the same boundary from the mechanism side.

The discrimination the conjunct exists for survives the weakening: an implementation running
`clean -fdx` deletes the file and fails the presence assertion. What no longer fails it is an
implementation whose re-run post-wave command writes into an ignored cache — which is precisely what
BR-9 says is not a defect. Correct scoping, not a loss of falsifying power.

**Oracle-level regression check (nothing I approved is broken).** I re-read the four sites that
reference these rows and did not change in this delta, to confirm the edit did not leave one stranded:

| Site | Says | Still consistent? |
|---|---|---|
| §"Falsifiability check" close (~L240) | fixture "must carry a `.gitignore`d file the wave added and assert it **present** afterwards (PROP-REST-03)" | Yes — already presence-only before the delta; the edit brought the property row into line with it, not the other way round |
| §"Three properties are deliberately weak" (~L300) | PROP-REST-03 is no longer weak, OQ-7 closed | Yes — unaffected by a scope narrowing that is still a plain positive assertion |
| §G-2 known-soft bullet (~L484–495) | PROP-REST-03 not soft; PROP-ENV-13 is the ignored-path-only case's home | Yes — the home statement is version-neutral ("PROP-ENV-13 is its home"), so the re-home did not stale it |
| §"Oracle G — fixed strings transcribed verbatim" (~L267) | names PROP-REST-08 | Yes — PROP-REST-08's literals (`n/a`, `unclassified`, the diagnosis sentence) are untouched; only the Traces cell and a trailing clause changed |

Coverage tables: AC-3.4's row still lists PROP-ENV-13, AC-5.1's still lists PROP-REST-03, AC-6.1/AC-6.3
still list PROP-REST-08, and AT-05-1's row still lists PROP-REST-03. No trace was orphaned by the edit.

## Fixtures

**Hazard 2 (A6-09's restoration fixture) — resolved, and resolved consistently with PROP-REST-03.**
The fixture inventory now reads: a tracked file the wave modified, a non-ignored untracked file
asserted **absent** after restore, a `.gitignore`d file asserted still **present** "and only present
— BR-9 puts a mutated ignored path outside the restoration map in both directions, so a byte-for-byte
conjunct on it would assert more than the rule it exists to enforce", and a non-ignored generated
output the re-run post-wave command rewrites (PROP-REST-02's discriminator).

Three checks on that:

1. **Property and fixture now say the same thing.** Before the delta the fixture said "byte for byte"
   and so did the property; both moved together, so there is no new property/fixture split. Verified
   by diff, not by reading one side.
2. **The AT-05-2 vacuity guard survives.** The sentence "Substituting an ignored path for that last
   one makes AT-05-2 vacuous, since BR-9 puts it outside the map" is untouched and still correct —
   it is about the *generated output*, not the ignored file, and the delta did not touch that clause.
3. **No pending marker was reintroduced.** The `test.todo` / `.skip` prohibition on A6-09 above the
   hazard is unchanged, and the presence-only rewrite is still a plain positive assertion — a
   narrowed assertion, not a softened one.

**Fixture-level regression sweep.** PROP-ENV-13's fixture obligation (a repair writing only ignored
paths, plus the same-run positive control writing one non-ignored in-envelope path) is unchanged by
the re-home — it is a `buildA6SeamOps` fixture either way, and A6-14's red step is a
`advisoryWaveGate.test.js` task, the same file the old home named. So the re-home moves a row in the
matrix without inventing a new fixture or orphaning an existing one. Nothing in §Fixtures references
A6-15 for this case, so no fixture text went stale.

## Positive Observations

- **The `attempts` correction took the harder, better road.** It would have been enough to delete the
  conjunct; the row instead replaced it with a falsifiable positive (`attempts` unchanged) and
  recorded the three sources plus the superseded wording. That is a row a red-test author can mint
  from without opening FSPEC.
- **The re-home was verified against PLAN, not asserted.** §G-3 item 3 quotes A6-14's step and states
  what A6-18's step does *not* contain — the shape of claim I can check in one grep, and it held.
- **Item 5 was resolved by narrowing to upstream's exact strength**, matching TSPEC §5.2 case 4 word
  for word, rather than by deleting the conjunct or by inventing a middle position.
- **The unhomed Integration conjuncts were routed, not dropped.** §G-3 item 3 names two acceptable
  PLAN resolutions and states the interim reading. That is the correct handling of a downstream gap a
  PROPERTIES cannot fix itself.
- **The changelog's "no other property statement, category, level assignment, oracle form or PLAN home
  changed" claim is true** — I diffed rather than trusted it, and the delta is exactly the six sites
  it names.

## Recommendation

**Approved with minor changes**

The delta resolves all five routed items on the form upstream states at HEAD, and breaks nothing I
approved in v1. Three Low findings are recorded and none gates: F-01 is inherited task-id drift the
edit did not introduce, F-02 is a label inconsistency worth one sweep whenever the matrix is next
touched, F-03 records a residual the document already routes to se-author. No High, no Medium.


## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | local | The §C-3 PLAN-home matrix keys its rows on PLAN v1.2 task ids (`A6-09`, `A6-13`, `A6-15`), but PLAN v1.3 folded each RED step into its GREEN task — the tasks that exist at HEAD are `A6-10`, `A6-14`, `A6-18`. This is my v1 F-02 unchanged: the edit moved a property between two of these rows without renumbering them. Not gating, and the matrix is readable, but a PLAN reader grepping `A6-15` finds a step that no longer owns what the matrix says it owns. Fix: retitle the matrix rows as `A6-14 (former-A6-13 red step)` etc., matching the convention the property Home cells already use. | §C-3 PLAN-home matrix |
| F-02 | Low | delta | local | The delta introduced a naming split for one and the same home: PROP-ENV-13's Home cell reads `advisoryWaveGate.test.js` (A6-14, former-A6-13 red step)` — PLAN v1.3 ids — while the §C-3 matrix places it under a row headed `A6-13` — PLAN v1.2 ids. Both point at the same step, but a reader diffing the two sites sees two different task numbers for one property and cannot tell without opening PLAN which is current. Same one-line fix as F-01; filed separately because this half is the edit's own, not inherited. | §C PROP-ENV-13 Home cell vs §C-3 matrix |
| F-03 | Low | delta | local | PROP-ENV-13 is now levelled `Unit + Integration`, but only its Unit (seam-op) half has a minted home: A6-14's red step is a `buildA6SeamOps` member-contract step, so it mints `producedPaths() === []` and `{ok:false}` but not the run-level conjuncts (escalation entry written; no re-gate token appended to the ledger after the anchor; `attempts` unchanged across the refusal, which is only observable on a `runWaveGateSeam` run). §G-3 item 3 routes this to se-author with two acceptable resolutions, which is the right handling and why this is Low rather than High — but until PLAN answers, three conjuncts of a property have no test that will be written. Worth a note on the phase's open-items list so the routing is not lost with this cross-review file. | §C PROP-ENV-13 Level; §G-3 item 3 |

FINDING: Low | inherited | local | §C-3 PLAN-home matrix | matrix rows still keyed on PLAN v1.2 task ids (A6-09/A6-13/A6-15) while PLAN v1.3's tasks at HEAD are A6-10/A6-14/A6-18; my v1 F-02, untouched by this edit
FINDING: Low | delta | local | §C PROP-ENV-13 Home cell vs §C-3 matrix | the edit names PROP-ENV-13's home twice in two different id conventions — "A6-14, former-A6-13 red step" in the Home cell, row "A6-13" in the matrix — so one home reads as two task numbers
FINDING: Low | delta | local | §C PROP-ENV-13 Level; §G-3 item 3 | property levelled Unit + Integration but only the seam-op half has a PLAN home; the run-level conjuncts (escalation entry, no post-anchor re-gate token, unchanged attempts) are routed to se-author and unminted until PLAN answers

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:89deeaf8b614c7cc36ded278cd74fa4619a13fbf083b2cd7c75bf6f6b562211d
APPROVAL-HASH-NORMALIZED: sha256:31e8479a7da065287cc5a67f2e3c89c3f292420158f0aa6803a8aed0c1a858fa
REVIEWED-COMMIT: 32a459ef6ca703e0c22bd601600df4e1b8c13799
UPSTREAM-STATE: REQ sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
UPSTREAM-STATE: FSPEC sha256:91ef25574e678b3c5433467ff31f800bdcb17bcff54e5f1a59c2e6da28e5cb34
UPSTREAM-STATE: TSPEC sha256:3fa21acf346e987c39d625133e5d56f4873b0cf2a205cad9460a6b4944eb7a00
UPSTREAM-STATE: DECISIONS sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc
UPSTREAM-STATE: PLAN sha256:f7de7fcb0f1199f3846d6fa94eba18d5243bc64b94dc8a5b81b38e43664db563
