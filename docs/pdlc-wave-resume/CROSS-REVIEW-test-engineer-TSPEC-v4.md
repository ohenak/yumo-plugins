# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4 (upstream-cascade confirmation, not a re-review)

## Overview

This round is an **upstream-cascade confirmation**, not a re-review. TSPEC's own bytes are
unchanged since my v2 approval and my v3 confirmation (`REVIEWED-COMMIT: 4cbd5814`). What moved
this time is **FSPEC**: my v3 anchors pinned `UPSTREAM-STATE: FSPEC sha256:1c05f511…`, and FSPEC at
HEAD is `sha256:9a6be7b5…` (v1.2). REQ is unmoved — `sha256:17e83bfc…` matches the byte-state my v3
anchors recorded — so the REQ-facing half of TSPEC, which v3 confirmed in full, is untouched here.

The single question answered: **does TSPEC still hold as approved against FSPEC v1.2?**

The FSPEC delta, read from `git diff 1dc235e0..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md`,
is five hunks and three substantive items:

| # | Hunk | Change |
|---|------|--------|
| 1 | header `Version` cell + §1 | `1.1` → `1.2`; "derives entirely from `REQ-pdlc-wave-resume.md` v1.5" → **v1.7** |
| 2 | §3.4, new paragraph | **"An operator-pointed run records exactly as any other run does."** Recording follows what the run committed, not how the start point was chosen; same high-water form counted from the plan's first wave; a later automatic invocation can therefore resume above operator-asserted waves; bounded by BR-10; attributable because the run announced provenance `operator-set` (BR-07); **"No record content distinguishes the two provenances."** |
| 3 | §7 OB-F1 | the trailing clause "Raised as an erratum against the REQ, whose §10 records BL-04 as *discharged at FSPEC authoring*" → "…which now records BL-04 as **open and unmet** in §5 and §10 (v1.7)" |
| 4 | §7 amendment history | new "Erratum, v1.2 (Phase T)" paragraph naming the three items above |

**All three items are ones this TSPEC itself raised** — §6.3 items 1, 2 and 3, in that order. As at
v3, the upstream did not move away from the document; it moved *toward* it, adopting TSPEC's
diagnosis in each case. My verification is nevertheless the full DEC-ERR-03 one: I re-read the
FSPEC text TSPEC leans on at v1.2 and asked whether TSPEC is still a faithful compression of it,
not merely whether the three items landed.

Outcome, stated up front: **TSPEC still holds.** No High. One Medium and three Low.

The Medium is the one thing item-landing alone would have missed, and it is the reason this
confirmation is not a formality. FSPEC §3.4 has gone from *silent* on operator-pointed recording to
*specifying* it — and a newly specified observable behaviour arrived **without an FSPEC AT**, so
TSPEC's AT-keyed test map (§5.4) has no home for it and no oracle discriminates it. TSPEC's §2.5
already ratifies exactly the behaviour FSPEC now states, so this is a missing conjunct on an
existing test, not a design divergence. The three Lows are bookkeeping lag in §2.5/§6.2/§6.3, where
TSPEC narrates upstream defects this round (and the previous one) fixed.

## Architecture

**Where TSPEC touches the changed FSPEC material.** I grepped the document for every surface the
delta could reach — `operator-set`, `explicitPointer`, `startWave`, `§3.4`, `BR-07`, `BR-08`,
`BR-10`, `high-water`, `lastGreenWave`, `OB-F1`, `provenance` — and resolved each hit against FSPEC
v1.2 rather than against my memory of v1.1.

| TSPEC site | Leans on | FSPEC v1.2 says | Still faithful? |
|---|---|---|---|
| §2.5 item 5 | each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number, "not a count of waves this run executed" | §3.4: high-water, "counted from the plan's first wave, whichever invocation carried it there" — and the new paragraph restates the same form for pointer runs | **Yes — and now covers the pointer case too.** TSPEC's rule was already unconditional on how the run started, which is exactly what the new clause makes upstream-explicit. |
| §2.5 items 1–2 | write inside `if (waveGit)`, after the wave's pathspec-scoped commits | §3.4 unchanged first half: "Recording follows what the run committed"; new paragraph repeats "records completed waves as it goes" | **Yes — converged.** The new clause's premise ("follows what the run committed, not how its start point was chosen") is the *transport-and-commit* guard TSPEC already ratified, restated upstream. |
| §2.5 paragraph "One interaction the FSPEC does not state" | asserts FSPEC is silent on pointer-run writes; ratifies the shipped behaviour; routes an erratum | FSPEC **now states it**, and states it the way TSPEC ratified it | **Substance yes, sentence no.** The ratified behaviour matches upstream verbatim in effect; the sentence claiming upstream silence is now false. See F-02. |
| §2.5 final paragraph "the record carries no provenance of its own" (PM Q-02) | provenance is announced content, never a record field; §4.1's shape stays four-or-five fields | §3.4: "**No record content distinguishes the two provenances**", provenance is announced (BR-07) | **Yes — vindicated exactly.** TSPEC pre-empted the risk that the requested clause be read as asking for a persisted field; FSPEC's clause explicitly forecloses that field. This is the strongest fidelity signal in the delta. |
| §2.5 bounding argument | "The damage is bounded exactly as FSPEC BR-10 bounds it — the first executed wave's gate verifies the whole tree" | §3.4: "That is bounded by BR-10 — the first executed wave's gate verifies the whole tree" | **Yes — same sentence, same mechanism.** BR-10's own text is byte-unmoved by this delta (verified: no §4 hunk). |
| §2.4 / D-2 / §3.1 `RESUME_PROVENANCE` | `operator-set` announced on the operator banner; frozen two-member catalogue | §3.4 now *also* cites BR-07's `operator-set` announcement as the attribution mechanism for the recorded assertion | **Yes — load extended, not changed.** The announcement TSPEC already specifies is now doing a second job upstream (attributing a recorded assertion). No new token, no new site; AT-05's named-announcement conjunct still carries it. |
| §6.2 OB-F1 rationale ("the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently") | FSPEC OB-F1 said "discharged" | FSPEC OB-F1 now says "open and unmet in §5 and §10 (v1.7)" | **No — stale.** The inconsistency named is resolved; the obligation itself (rebase, PLAN sequencing) is untouched and stands. See F-03. |
| §6.2 OB-F1 obligation body | BL-04 unmet; AT-14 red until rebase; wave carrying AT-14 must not be dispatched first | FSPEC OB-F1's *substance* (tree 1,637 behind, mechanism and baseline absent, rebase owed) is byte-unchanged | **Yes.** Only OB-F1's trailing provenance clause moved. The sequencing precondition is untouched and now agrees with upstream on BL-04's disposition. |
| §6.3 items 1–3 | narrated as open errata against FSPEC | all three landed in v1.2 | **No — stale ledger.** See F-03. |
| §6.3 item 4 | erratum against REQ OB-1 | landed in REQ v1.7 at the *previous* round | **No — stale, carried.** See F-04. |
| §1.2, §3.2, §5.4 (EC-17, EC-15, EC-15a, AT-14, AT-18) | FSPEC edge cases and ATs by id | §5 and §6 carry **no hunk** in this delta | **Yes — untouched.** No AT text, no EC text, no BR text changed; the diff is confined to the header, §1's grounding sentence, one §3.4 paragraph, and §7. |

**Structural conclusion.** The delta contradicts no TSPEC claim, invalidates no oracle, changes no
obligation's disposition, and removes no citation target. Every id TSPEC cites into FSPEC — BR-07,
BR-08, BR-10, EC-13, EC-15, EC-15a, EC-17, AT-01…AT-18, OB-F1…OB-F5 — still exists and, apart from
OB-F1's trailing clause, still says what TSPEC says it says. The one architecturally interesting
move is that a paragraph TSPEC wrote as *"recorded here and routed upstream"* is now upstream text,
in TSPEC's own terms.

## Interfaces

The delta names no symbol, path, config key, encoding, or string literal, and I confirmed that
positively rather than by absence — the diff is 14 added and 3 removed lines, and I read every one.

TSPEC's interface surface is §3: the three frozen catalogues (`WAVE_IGNORE_REASONS`,
`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, plus `ANCESTRY_INDEPENDENT_CODES`), the pure classifier
extracted from `orchestrate-dev.js`, `parseWaveLedger` / `computePlanHash` / `formatWaveLedger`
ratified unchanged, `WAVE_STATE_PATH`, the injected seams (`_readFile`, `_git`, `_runCommand`), and
the `implementation.*` configuration surface including `startWave`. Three checks, because the
confirmation bar is fidelity and not item-landing:

1. **`RESUME_PROVENANCE` is now load-bearing upstream, and its contract is unchanged.** FSPEC §3.4
   newly leans on the `operator-set` announcement as the *attribution* for an operator-asserted
   completion — "the assertion is attributable, because the run that made it announced provenance
   `operator-set` (BR-07)". That is a new **use** of an existing announcement, not a new interface:
   the token, the two-member catalogue, and the banner it rides on (§2.3/V-18, asserted by AT-05's
   named-announcement conjunct) are all untouched. Worth stating precisely, because it raises the
   stakes on AT-05's discipline: the provenance token is now the only artefact distinguishing an
   operator-asserted record from a pipeline-observed one, so AT-05's rule that the token must be
   found **on the operator banner specifically**, not anywhere in the log, is doing more work at
   v1.2 than it was at v1.1. It is unchanged and still sufficient.

2. **`startWave` remains a pointer, not persisted state.** The new clause could have been read as
   asking the record to carry the pointer's influence. It says the opposite — "No record content
   distinguishes the two provenances" — which ratifies §3.5's configuration surface and §4.1's
   record shape exactly as TSPEC states them. AT-08's set-equality over
   `Object.keys(IMPLEMENTATION_DEFAULTS)` against the four transcribed keys is unaffected, and
   remains the closure oracle that would red if a fifth key were smuggled in.

3. **`WAVE_STATE_PATH` and the write seam.** The write site's guard structure — inside
   `if (waveGit)`, outside `!explicitPointer` — is the interface fact the new clause depends on.
   FSPEC does not name the guard (correctly: that is TSPEC altitude); it states the observable
   consequence. TSPEC §2.5 names the guard and V-6 pins the `!explicitPointer` block as wrapping
   only the read/decide chain. The two documents meet at the right altitude with no contradiction.

No interface finding.

## Data Model

The delta is the closest any round has come to touching this feature's data model, and it lands on
the safe side of the line. Stating why, explicitly, is the point of this section.

**What the clause could have changed and did not.** "An operator-pointed run records exactly as any
other run does" is a statement about the record's *content* under a new condition. It resolves in
the direction TSPEC already modelled, and it closes the door TSPEC identified as dangerous:

| Model element (TSPEC §4.1) | Could the clause move it? | FSPEC v1.2 | Verdict |
|---|---|---|---|
| `lastGreenWave` semantics — plan-absolute, high-water | Yes: a pointer run could have been specified to record run-relative, or not at all | "in the same high-water form counted from the plan's first wave" | **Unchanged.** TSPEC §2.5 item 5 already says plan-absolute unconditionally. |
| Record shape (the four-or-five fields) | Yes: a `provenance` field would have been the obvious way to make operator assertions distinguishable | "No record content distinguishes the two provenances" | **Unchanged, and explicitly closed.** §4.4's "deliberately not modelled" reasoning survives intact. |
| `head` stamping | No — the clause says nothing about corroboration | untouched | **Unchanged.** V-7's `head: null` tolerance stands. |
| The `{}` cleared shape (DEC-WVR-04) | No | untouched | **Unchanged.** |
| Retention (§3.4's later paragraphs) | No — those paragraphs are byte-unmoved | untouched | **Unchanged.** |

**The one modelled consequence that is now upstream-visible.** FSPEC v1.2 states, as an accepted
outcome, that "a later automatic invocation can resume above waves whose completion only the
operator asserted". TSPEC models exactly this state and reaches the same safety conclusion by the
same mechanism (BR-10: the first executed wave's gate verifies the whole tree). The *state space*
is identical before and after the delta — the record cannot express the difference, by design in
both documents. What changed is that the state is now sanctioned rather than merely tolerated.

That distinction is a data-model non-event and a **test-strategy event**, which is where I take it
up: a sanctioned behaviour is one an implementation may not quietly drop, and nothing currently
reds if it does. See F-01.

No data-model finding.

## Test Strategy

This is my lens, so it gets the closest reading: **does any TSPEC test, oracle, or sequencing
precondition change meaning under FSPEC v1.2, and does the delta owe a test nobody is writing?**

**The one real finding: a newly specified behaviour with no oracle.** Before this round, FSPEC was
silent on what a pointer run writes; TSPEC ratified the shipped behaviour in §2.5 and routed the
gap upstream (§6.3 item 3) precisely so there would be something to trace a test to. The clause has
now landed — and it landed **without an accompanying AT in FSPEC §6**. TSPEC's §5.4 test map is
keyed to FSPEC's AT list ("the contract that no AT is left without a home"), so a clause with no AT
gets no home, and I can find no oracle in the document that would fail if the behaviour were
removed:

- **AT-05** (operator override wins) runs with `startWave: 2` and a valid record. Its conjuncts are
  the resume point, the absence of a `wave ledger … was ignored` line, and the provenance token on
  the operator banner. It asserts **nothing about writes**.
- **AT-07** (pointer past the end) asserts the notice, three waves dispatched, no skip, no ledger
  consultation. Again nothing about writes.
- **AT-09 / AT-10 / AT-15 / AT-18** all exercise the write path, but every one of them runs
  **without** an operator pointer, so each is green under an implementation that moved the write
  site inside the `!explicitPointer` guard.
- **V-6** pins that `!explicitPointer` wraps the read/decide chain; it is a shipped-behaviour
  verification row against `origin/main`, not a test the suite runs, so it does not red on
  regression either.

The failing implementation is not exotic — it is the *intuitive* one. An implementer reading
"the operator asserted these predecessors, the pipeline did not observe them" can very reasonably
conclude that such a run should not write a record at all, widen the `!explicitPointer` guard to
cover the write site, and ship a green suite that violates FSPEC §3.4's new paragraph outright.
That is the definition of an untested specified behaviour. **The fix is small**: add a write
conjunct to AT-05 — with `startWave: 2` on a 3-wave plan and green gates, `ledgerWrites(writes)` is
non-empty and the last write carries `lastGreenWave = 3` (plan-absolute, not `2` counted from the
run's own first executed wave), which discriminates both against "pointer runs don't record" and
against a run-relative counter. A second arm asserting the *next* automatic invocation resumes
above the operator-asserted waves would carry FSPEC's "so a later automatic invocation can resume
above…" sentence end to end. This is one conjunct on an existing integration fixture, not a new
suite. Medium, not High: TSPEC's §2.5 states the correct behaviour and states it precisely, so no
design is wrong and no oracle is false — what is missing is the discriminator. Filed as F-01.

**Everything else in the test strategy is unaffected, checked positively.**

- **AT-14 and the rebase precondition — untouched, and unaffected by OB-F1's rewording.** The delta
  edits OB-F1's trailing provenance clause only; the obligation's substance (tree 1,637 behind,
  mechanism and baseline absent, rebase owed) is byte-unchanged. TSPEC §5.4's ordering precondition
  — AT-14 is red in this tree, a red gate in wave mode halts the wave and every wave after it, so
  the wave carrying AT-14 must not be dispatched before the rebase — rests on that substance, and
  it now agrees with both upstreams on BL-04's disposition rather than only with the REQ. AT-14's
  three conjuncts (line-equality, root-anchoring, `git check-ignore -v` resolution) read this
  repo's tracked `.gitignore`, which no hunk touches. The prohibition on weakening it to "no churn
  observed" or a `some(line => line.includes(…))` still stands on its own rationale.
- **AT-18's discriminator — reinforced, not disturbed.** AT-18 exists to falsify a record that
  counts only the waves the previous run itself executed. FSPEC's new paragraph applies the same
  high-water form to pointer runs, which extends AT-18's invariant to a case AT-18 does not cover
  — the extension is exactly what F-01 asks AT-05 to pick up. AT-18's own oracle (halt at 2 →
  resume → halt at 4 → third run announces wave 4 and skips 1–3 individually) is unchanged.
- **AT-15's partial-write arms — unaffected.** §3.4's best-effort and per-wave paragraphs are
  byte-unmoved; arm 2 (wave-1 write succeeds, wave-M throws) remains the discriminator against an
  implementation that discards the record on any failure.
- **AT-09's transport/gate-mode discrimination — reinforced.** FSPEC's new premise, "recording
  follows what the run committed, not how its start point was chosen", is the same shape of claim
  as AT-09's companion arm ("the guard is the transport, not the gate mode"). Two independent
  conditions are now upstream-stated as *not* affecting recording; AT-09 covers one, and F-01 asks
  for the other.
- **Set-equality oracles (AT-02, AT-08, AT-13) — unaffected.** The delta adds no reason code, no
  outcome, no config key, no announcement row. All three catalogues remain closed at their
  transcribed sizes.
- **Call-count / laziness oracles (AT-03, AT-11) — unaffected.** No claim about `merge-base`,
  ancestry, or probe ordering appears in the delta.
- **My v2 F-01 (missing set-equality oracle on `ANCESTRY_INDEPENDENT_CODES`, Medium, routed to
  Phase P) — untouched and stays routed.** It is not re-raised here and is not tagged `inherited`,
  because it is not open against this document.
- **Coverage strategy — untouched.** §5.8's `npm run test:coverage` as the last wave's
  `postWaveCommand` (RT-7, the 85% per-file branch floor) and RT-5's `postWavePathspecs` obligation
  for `pdlc/workflows/dist/` are unmentioned by the delta.

**Restraint check.** I asked whether the "attributable because the run announced `operator-set`"
sentence creates a *new* oracle obligation beyond F-01 — e.g. correlating a log line with a record
written in the same run. It does not: attribution here is a property of the run's announcement,
already asserted by AT-05, and correlating the two artefacts would test the fixture harness rather
than the product. One conjunct on AT-05 is the honest ask; a correlation suite would be theatre.

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
