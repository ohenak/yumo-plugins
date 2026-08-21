# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.7)
**Erratum delta:** `9f80247a..HEAD` (5 commits, +16 −7)
**Upstream at dispatch:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (sha256:f97f4f66…, v1.16) — verified on disk
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation)

## Overview

**Delta confirmation, not a re-review.** FSPEC moved v1.6 → v1.7 across five commits
(`4b5be292`, `9a4dee38`, `60d7d360`, `11ad45d5`, `0fc601b2`), +16 −7 lines total. I read the full
`git diff 9f80247a..HEAD` for this document, re-read REQ v1.16's AC-6.3 and the AC-5/AC-6 block it
sits in at the sha this dispatch names (`f97f4f66…`, confirmed by `shasum` on disk), and re-read the
five FSPEC sites that compress it. Nothing settled in v1/v2/v3 is re-litigated.

**Answer: yes — the routed item lands, in full, at the right altitude.** v4's F-01 (High) asked for
four things and got all four: the BR-14 co-location clause, both arms of §3 step 10, the E-34
negative arm, and a three-conjunct AT-06-4 with a no-capture companion. v4's F-02 (Medium, E-30
re-enumerating BR-14's contents) is also resolved in the same edit. The capture's name, storage form
and lifetime stay behind O-1, exactly as the routing required — nothing in the delta names
`refs/pdlc/a6-snapshot-{waveNum}` or reaches into DEC-A6-03's mechanics.

**One residual, one degree below gating.** AT-06-4's *Then* now carries the obligation as a
**conditional** conjunct ("where it points the operator at a captured pre-A6 tree state…") while its
*Given* remains the generic "a halt following an A6 escalation". A fixture with no capture satisfies
conjunct (3) vacuously — the antecedent is false, the implication holds, and the warning is never
exercised. AT-06-4b pins the no-capture arm explicitly and calls itself AT-06-4's companion, so the
intended partition is legible; what is missing is one clause in AT-06-4's *Given* that pins the
capture-exists arm so the conjunct cannot pass without being tested. F-01 below, **Medium**,
`delta`/`local`. It is not High: the obligation is normatively stated in BR-14 and §3 step 10, both
arms are named, and the fix is a *Given* clause a TSPEC author would land without reopening anything.

**Nothing previously approved broke.** The delta is additive at every site but E-30, where the
replacement text widens rather than narrows. Two Low findings carry forward untouched (F-02, F-03).

## Linked Requirements

Upstream re-read at the dispatched sha, restricted to the clauses this delta touches plus the ones
the previous rounds pinned (DEC-ERR-03 duty — the scope is this FSPEC against REQ v1.16, not the
item list):

| REQ v1.16 clause | FSPEC v1.7 compression site | Faithful? |
|---|---|---|
| AC-6.3 sentence 1 — halt report carries diagnosis + root-cause class, "not only in a file the operator must go and find" | §3 step 10, BR-14, AT-06-4 conjuncts (1)(2) | Yes — unchanged and still verbatim in substance |
| **AC-6.3 sentence 2** — "Where the halt report points the operator at a captured pre-A6 tree state, it also warns, **in the same place**, that re-running this feature overwrites that capture" (DEC-A6-03) | BR-14 conditional clause; §3 step 10 arm 1; AT-06-4 conjunct (3) | **Yes** — "same report, in the same place" mirrors "in the same place"; co-location named as *the observable*; O-1 deferral preserved |
| AC-5.1 failed-capture outcome — "Given the pre-A6 state cannot be captured at all, Then no repair is proposed, none is applied, and the wave halts on its own gate" | §5.4 E-34 (now also the no-warning arm), AT-06-4b | Yes — the delta adds a halt-report consequence without disturbing the no-dispatch outcome |
| AC-5.1 excluded-carrier list (three carriers: AC-6.1 record append, AC-6.2 escalation-log append, AC-5.2 M-WG-7 queue row) | §4 BR-9 ("both carriers"), §5 E-23 | **Under-enumerated** — F-03, Low, inherited, carried from v3 F-02 / v4 F-04 |
| AC-5.2 — same halt, same M-WG-3 reason, same `halted` queue row; escalation adds information, never control flow | §3 step 10, BR-14 opening | Yes — the delta prepends nothing to control flow; the added clause is report content only |
| AC-6.1 / AC-6.2 / AC-6.4 | BR-13, AT-06-1/-3/-5, E-31 | Yes — untouched by this delta, confirmed unchanged upstream |
| O-1 — capture point, mechanism, and its failure modes stay TSPEC's | §7.1 O-1; BR-14's closing sentence; AT-06-4's oracle note | Yes — and the delta strengthens it: AT-06-4 explicitly forbids asserting the capture's name |

**DEC-A6-03 boundary, checked directly.** DECISIONS `:342-355` fixes the ref name
(`refs/pdlc/a6-snapshot-{waveNum}`), its wave-scoping, and the "copy the ref" remedy; `:462-471`
records that the promise is run-scoped and that what an overwrite costs is *inspectability of a
pre-repair tree, never content*. FSPEC v1.7 compresses only the operator-visible outcome and
explicitly routes name/storage/lifetime to O-1 — the correct altitude for an FSPEC, and it does not
pre-empt the TSPEC's `:534` halt-message wording.

**§2 version token still stale.** §2's preamble reads "Every clause below traces to
`REQ-pdlc-advisory-wave-gate` **v1.13**" while upstream is v1.16 and this round's own changelog entry
(line 14) cites "REQ v1.16" three lines above it. Every individual trace still resolves, so it is a
stale token, not a broken citation — F-02, Low, `inherited`/`nonlocal` (v3 F-01 → v4 F-03, now one
round staler and internally inconsistent with the changelog).

## Behavioral Flow

**§3.2 step 10 — the branch is now written down.** v4's flow-level objection was that AC-6.3
sentence 2 is conditional and therefore a *decision branch in the halt step* that FSPEC did not
name, leaving a test author with no partition to write against. The delta names both arms in one
sentence:

> It has two arms: where the report points the operator at a captured pre-A6 tree state, it also
> warns there that re-running this feature overwrites that capture; where no capture was taken
> (E-34), it carries the diagnosis and class and no such warning.

That is a two-cell partition with a named discriminator (capture taken / not taken), each cell
mapped to an acceptance test (AT-06-4 / AT-06-4b) and each cell mapped to an edge-case row (the
implicit capture-exists path / E-34). A test author can now write both tests without a clarifying
question — the "write the test right now" check passes at FSPEC altitude.

**Control flow untouched.** The added clause is report *content*, not a step, a gate, or a
disposition. Step 10 still halts with M-WG-3 and still writes the `halted` queue row via M-WG-7;
BR-14's headline ("Escalation adds information and never changes control flow") is preserved and
still cited at the end of the step. AC-5.2's "escalation adds information; it never changes control
flow" is therefore still compressed faithfully — I checked this specifically, because a
report-content obligation attached to a halt is the shape that most easily leaks into control flow,
and it did not.

**§3.3 summary table under-summarises the amended step.** The one-table view's row 10 still reads
`halt exactly as today, diagnosis attached` — a single-branch summary of what §3.2 now describes as
two arms. §3.2's prose is authoritative and every other row in that table is summary-grade, so no
oracle reads the wrong thing from it; but a reader who works from the table alone (the table is
offered in §1's reading order as the flow-at-a-glance) will not see the branch that AT-06-4b exists
to cover. One-cell fix: `diagnosis + class attached; overwrite warning where a capture exists`.
F-04, Low, `delta`/`local` — the edit changed step 10's prose and left its own summary row behind.

**No other step touched.** `git diff` confirms steps 1–9, 3b, 4b, 8a/8b and the tie-break paragraph
are byte-identical; nothing in the delta reaches the dispatch, envelope, restoration or budget paths
this lens approved in v1/v2.

## Business Rules

**BR-14 carries the obligation, and carries it testably.** The added clause does four things a test
author needs, and I checked each against REQ v1.16 `:531-536`:

1. **States the conditional as a rule, not a suggestion** — "where that report points the operator at
   a captured pre-A6 tree state, the **same report, in the same place**, states that re-running this
   feature overwrites that capture". The antecedent is observable (does the report point at a
   capture?) and the consequent is observable (is the warning in that same report?).
2. **Names the observable explicitly** — "Co-location is the observable — a pointer in the halt report
   and the warning in a runbook does not satisfy it." This is the single most valuable sentence in
   the delta from a testing standpoint: it forecloses the false-green where an implementer satisfies
   the letter by documenting the remedy elsewhere, which is exactly the gap DECISIONS `:468` records
   as "the documented operator remedy". The oracle it implies is a two-conjunct assertion over one
   artifact's bytes, not a cross-artifact search.
3. **Bounds the rule's reach** — "The clause binds the halt report only; the advisory record entry
   BR-13 mandates is read after the fact and carries no such warning". This is a negative boundary a
   test can hold: an implementation that sprays the warning into the advisory record has not
   satisfied BR-14, and BR-13's AT-06-1 is protected from acquiring a phantom conjunct.
4. **Excludes the remedy from the observable** — "the remedy an operator then chooses is not part of
   the report's observable". Correct call: DEC-A6-03's "copy the ref" remedy is DECISIONS' and the
   TSPEC's wording problem, not an FSPEC acceptance conjunct, and pinning it here would have
   over-specified the halt string.

**O-1 respected at the rule site.** "What the capture is called, how it is stored and how long it
lives are O-1's" — the FSPEC states the outcome and defers the mechanism, which is what kept v4's
finding a bounded FSPEC edit rather than a decision reopening. No `a6-snapshot`, no ref shape, no
lifetime claim appears anywhere in the delta (`grep -n "a6-snapshot\|refs/pdlc" FSPEC` → no hits).

**BR-9 unchanged and still under-enumerated.** BR-9's observation-point clause still excludes "the
record and escalation writes … both carriers" where AC-5.1 v1.16 names three (AC-6.1's record
append, AC-6.2's escalation-log append, AC-5.2's M-WG-7 queue-row write). E-23 covers the third and
the observation point structurally precedes it, so no oracle asserts the wrong thing and AT-05-1 is
not at risk — the gap is enumerative at the rule site the test reads from. F-03, Low,
`inherited`/`nonlocal`, carried from v3 F-02 and v4 F-04, untouched by this delta.

**BR-13, BR-15 and the rest of §4 are byte-identical.** Confirmed by diff; BR-15's transcribed
eight-member refusal set — the literal AT-03-7's oracle depends on — is untouched.

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
