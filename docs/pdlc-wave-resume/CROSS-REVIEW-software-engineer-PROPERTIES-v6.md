# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 6 (delta re-review — PROPERTIES v1.3 → v1.5)

## Overview

**Scope of this pass.** My v5 was a delta confirmation against TSPEC v1.4 and returned *Needs
revision* on one High (F-01) plus two Medium bookkeeping items (F-02, F-03). PROPERTIES has since
moved from v1.3 to v1.5 across nine commits (`git log --oneline -- PROPERTIES-…`, `6156ad69` …
`6eef4a83`). I diffed the document against `cedf0a74` — the commit carrying my v5 — and reviewed
only what changed, per the delta protocol. The measured delta is 66 changed lines across seven
surfaces:

| Changed surface | Answers |
|---|---|
| Header version 1.3 → 1.5; revision rows 1.4, 1.5 | bookkeeping |
| PROP-OVERRIDE-01 gains the AT-05 write-side conjunct (`PROPERTIES:171`) | **F-01** |
| PROP-OVERRIDE-05's rationale restated on the discriminating conjunct (`PROPERTIES:175`) | PM F-04 |
| PROP-COV-03 four → five mutations (`PROPERTIES:235`) | **F-01** |
| Oracle rows for PROP-OVERRIDE-01 and PROP-COV-03; mutation → oracle map gains row 5 (`PROPERTIES:337, 371, 375-385`) | **F-01** |
| § Fixtures run-depth paragraph restated as three-way agreement (`PROPERTIES:504`) | **F-02** |
| § "Findings routed upstream" ledger re-verified; PLAN-task trace gains T-11 and T-12 (`PROPERTIES:620-627, 741-760`) | **F-02**, **F-03**, plus the PLAN v1.2/v1.4 cascade |

**Result.** All three of my v5 findings are resolved, and I verified each against the repository
rather than against the revision-history prose. Two new items surfaced inside the changed text —
one Medium, one Low. Neither gates.

**Not re-litigated.** The AT-14 split, the outcome-catalogue set-equality design, the H-1 event-sink
ordering oracles, the coverage-floor scoping to `orchestrate-dev.js`, the pyramid budget, the eight
guard rows of §3.2 and the string-ownership rules are byte-identical across the diff and stay
approved.

## Properties

**F-01 (High, v5) — resolved. The AT-05 write-side conjunct is now owned.** PROP-OVERRIDE-01
(`PROPERTIES:171`) carries the third conjunct verbatim in substance: on the `startWave: 2` run
`ledgerWrites(writes)` is non-empty and the written `lastGreenWave` is the plan-absolute number of
the last wave the run completed, "never a run-relative count", with the reason stated — a build that
suppresses the write while `explicitPointer` is true "reds here rather than nowhere (TSPEC §5.5
mutation 5)". The trace cell was widened to `AT-05 (TE F-05), BR-04, REQ-WVR-04, REQ-WVR-09, TSPEC
§5.5 row 5`, so the new obligation is traceable, not merely present. Level stays `I`, owner stays
T-07, no fixture added — exactly the bounded shape I asked for, and no property was deleted or
weakened to make room.

I checked this against the upstream text rather than the revision row. TSPEC §5.5 at HEAD opens
"**Five** mutations this suite is specifically designed to kill" and its row 5 reads "Suppressing
the record write while `explicitPointer` is true (writing only on automatic runs). Killed only by
AT-05's write-side conjunct" — the conjunct PROPERTIES now asserts. The value is right too: the
integration harness builds every ledger run on `PLAN_THREE_WAVES`
(`origin/main:pdlc/workflows/__tests__/waveExecution.test.js:2205`), so a run entering at wave 2
completes waves 2 and 3 and the plan-absolute last-completed wave is **3** — which is what the
oracle pins, and which differs from the run-relative **2** a mutated build would write. The
discriminator is real, not nominal.

**PROP-COV-03 — resolved, and correctly re-anchored.** `PROPERTIES:235` now requires each of
**TSPEC §5.5's five** mutations to be applied, observed RED, reverted and recorded. My v5 asked for
the count change while noting PLAN §4.3 still read four; v1.4 of PROPERTIES noted the pending
cascade rather than resolving it silently, and v1.5 closed it once PLAN landed. I verified PLAN at
HEAD: it is **v1.4** (`PLAN:7`), §4.3 is headed "five mutations, each with an owner who **runs** it"
and its table carries the fifth row — "Suppress the record write while `explicitPointer` is true …
AT-05's **write-side** conjunct only … T-07" (`PLAN:400`). So PROPERTIES' claim of three-way
agreement between TSPEC §5.5, PLAN §4.3 and this map is true at HEAD, not aspirational. The row's
owners also match PLAN row by row, including row 1's split (`unit half T-02, integration half
T-07`).

**PROP-OVERRIDE-05 — the restated rationale is an improvement, and it is correct.** The property now
excludes the config-validation notice because it "is emitted **before any resume decision runs**, so
no provenance has been resolved when it is written", and explicitly retires the weaker
rejected-value framing: "a clamped past-the-end pointer is also a rejected value yet its notice
**does** carry the token (PROP-OVERRIDE-03's own case)". That cross-check holds — PROP-OVERRIDE-03
(`PROPERTIES:174`) requires the past-the-end notice to end with ` (provenance: operator-set)`, so
the two properties would contradict each other under the old rationale. This is the kind of
self-consistency check I would otherwise have had to file; it is now in the document.

**PLAN-task trace — complete against PLAN at HEAD.** The trace gains rows for **T-11** and **T-12**
(`PROPERTIES:620-621`), both property-free with the reason stated, and PLAN files both with
`**ATs:** none; this is a wave-gate precondition` (`PLAN:133-134`). The trace now covers all nine
tasks the parser sees — `T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12` (`PLAN:510`) — with
`T-05`/`T-06`/`T-09` called out as retired. The claim "every task that lands feature behaviour
carries at least one property" is true of the table as written. Named test files check out too:
`waveExecution.test.js` and `documentOracles.test.js` exist at HEAD; the five `*(new)*` files are
marked new, not assumed present.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
