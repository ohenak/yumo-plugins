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

**E-34 gains the negative arm — this is what makes the new conjunct falsifiable.** The row now reads
"…this is the arm on which the halt report carries BR-14's diagnosis and class with **no** overwrite
warning, there being no capture to point at." Without this sentence, an implementation that prints
the overwrite warning unconditionally — as a constant string in every halt report — would satisfy
BR-14 and AT-06-4 while lying to the operator on the E-34 path. The row now forbids it, and AT-06-4b
is the test. This is precisely the "a test that can only pass is not yet a test" remedy v4 asked
for, landed as specified.

The rest of E-34 is untouched: no repair proposed, none applied, wave halts on its own red gate,
wave agents' uncommitted work intact because nothing ever wrote to the tree, mechanism deferred to
O-1. The delta appends to the row's escalation sentence and disturbs nothing the earlier rounds
approved.

**E-28 correctly left alone.** E-28 is *restoration fails* — a capture existed and the restore from
it failed. BR-14's clause is conditional on the report pointing at a capture, so E-28's halt falls
under the capture-exists arm and inherits the warning obligation automatically; it needs no row of
its own, and adding one would have duplicated BR-14. AT-05-5's oracle (halt names the failed
restoration, no commit reached) is unaffected. I checked this because E-28/E-34 are the pair most
likely to be conflated, and the delta keeps them distinct exactly as §5.4's "Distinct from E-28"
lead already did.

**E-30 no longer narrows the obligation — v4 F-02 resolved.** The row previously re-listed the halt
report as carrying "BR-14's diagnosis and root-cause class"; it now says the halt report "goes on
carrying **BR-14's halt-report contents in full**." That is the right repair: it stops the row from
being a second, staler definition of the halt report, and it means AT-06-6 — which is written from
this row — inherits the amended contents rather than pinning the pre-erratum pair. The row's actual
subject (the failed escalation-log write surfaces on the run report's notice channel, never upgrades
`escalated` to `resolved`, never changes the halt) is unchanged.

A degraded-carrier interaction worth naming for the TSPEC, not a finding here: on the E-30 path the
escalation log is unwritable while the halt report is fine, so the halt report is the *only* carrier
the operator gets — which makes the co-location obligation load-bearing on exactly that path. E-30's
new phrasing covers it by reference, and AT-06-6 need not restate it.

**E-31, E-32, E-33 byte-identical.** Confirmed by diff, including E-33's non-negative-integer
validator variant and its `resolved: 0` summary-row oracle.

## Acceptance Tests

**AT-06-4 gains the conjunct; AT-06-4b gains the companion.** The pair is the right shape — a
positive arm and a negative arm over one discriminator — and the oracle note ("asserts co-location
and the presence of the overwrite statement, never the capture's name — that is O-1's") tells a
TSPEC author precisely where the assertion boundary sits. AT-06-4b's self-description ("the
companion that makes AT-06-4's conjunct (3) falsifiable rather than a string always present") shows
the author internalised the false-green this lens was worried about.

**F-01, Medium — AT-06-4's *Given* does not pin the arm its *Then* conditions on.** The *Then* is
now:

> (1) it carries the diagnosis, (2) it carries the root-cause class, and (3) **where it points the
> operator at a captured pre-A6 tree state**, the same report states there that re-running this
> feature overwrites that capture.

while the *Given* remains the unqualified "a halt following an A6 escalation". A conditional
consequent whose antecedent the fixture does not pin is **vacuously satisfiable**: instantiate
AT-06-4 with an E-34 fixture and conjunct (3) holds because its antecedent is false, so the test
goes green having never once exercised the warning. That is the classic precedence-chain false-green
— the fixture must defeat the branch that preempts the behavior under test.

The intent is legible (AT-06-4b takes the no-capture arm and names AT-06-4 as its counterpart, so
AT-06-4 is by elimination the capture-exists arm), which is why this is Medium and not High: the
obligation is normatively stated in BR-14, both arms are named in §3 step 10 and E-34, and no
implementer reading §3 could conclude the warning is optional. But an FSPEC acceptance test is the
artifact a TSPEC author transcribes, and this one transcribes into a passing-either-way test.

**The fix is one clause.** Move the discriminator into the *Given* and make the conjunct
unconditional:

> *Given* a halt following an A6 escalation **in which a pre-A6 tree state was captured and the halt
> report points the operator at it**. *When* the report is produced. *Then* (1) … (2) … and (3) the
> same report states, in the same place it names that capture, that re-running this feature
> overwrites it.

That reads as the exact mirror of AT-06-4b's already-pinned *Given* ("in which no pre-A6 tree state
could be captured (E-34)"), and it turns the pair into a true partition where each test can only
pass by exercising its own arm.

**Everything else in §6 is untouched.** AT-06-1/-2/-3/-5/-6 and the AT-05 family are byte-identical;
AT-06-6 now inherits the amended halt-report contents through E-30's reference rather than a stale
re-listing (see above). No AT id collides — `AT-06-4b` follows the `AT-02-7`/`AT-07-2b` suffix
convention already in use — and no count claim elsewhere in the document needed updating (§1's
reading order refers to §6 generically, not by cardinality).

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | AT-06-4's *Given* (F-01): will the TSPEC pin the capture-exists fixture itself, or should the FSPEC land the one-clause *Given* fix so the partition is complete at spec altitude? My preference is the FSPEC, since AT-06-4b already pins its arm and the asymmetry is what invites the vacuous instantiation. |
| Q-02 | On the E-30 path the escalation log is unwritable, so the halt report is the operator's only carrier — is that the strongest case for co-location, and does it deserve a sentence in the TSPEC's halt-message design even though E-30 covers it by reference here? |
| Q-03 | DECISIONS `:468` records "copy the ref before re-running a halted feature" as the documented remedy, and BR-14 deliberately excludes the remedy from the report's observable. Confirming the intent: the halt report warns *that* the capture will be overwritten and need not tell the operator *how* to preserve it — correct? |

## Positive Observations

- **The routed item landed as four coordinated edits, not one.** BR-14 (rule), §3 step 10 (flow),
  E-34 (negative arm), AT-06-4 + AT-06-4b (oracles) — the obligation is expressed once normatively
  and once testably at each altitude it needs to exist at. Erratum edits that touch only the AT, or
  only the rule, are the common failure mode; this one did neither.
- **"Co-location is the observable" is the sentence that makes this testable at all.** Without it,
  "warns in the same place" degrades into a cross-artifact search, and any implementation with a
  runbook entry could argue compliance. Naming co-location as *the* observable gives the oracle a
  single-artifact byte assertion.
- **AT-06-4b exists because the author reasoned about falsifiability, not because it was demanded.**
  Its own text names the failure mode it prevents ("rather than a string always present"), which is
  the reasoning this lens wants to see written down rather than inferred.
- **O-1's boundary held under pressure.** The routing items quoted the ref name (`a6-snapshot`) and
  TSPEC `:534`; the edit resisted importing either and compressed the operator-visible outcome only.
  That is the discipline that kept this a bounded FSPEC edit rather than a decision reopening.
- **E-30's repair generalised rather than patched.** Replacing an enumeration with a reference to
  BR-14's contents means the next amendment to the halt report propagates automatically instead of
  leaving a third stale copy behind.

## Recommendation

**Approved with minor changes**

The erratum resolves both routed items — TE's and PM's are the same item, and it landed at BR-14,
§3 step 10, E-34, E-30, AT-06-4 and AT-06-4b. Upstream faithfulness against REQ v1.16 at the
dispatched sha holds at every site the delta touches. No High finding; nothing previously approved
regressed. F-01 (Medium) is a one-clause *Given* fix to AT-06-4 that can ride the next authoring
round or be landed here; F-02, F-03 (Low) are inherited and non-gating; F-04 (Low) is a one-cell
summary-table refresh the edit left behind.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | AT-06-4's *Given* is the unqualified "a halt following an A6 escalation" while its *Then* conjunct (3) is conditional on the report pointing at a captured pre-A6 tree state. An E-34 fixture satisfies (3) vacuously, so the test can go green without ever exercising the overwrite warning. AT-06-4b pins its own arm explicitly; AT-06-4 should mirror it. Fix: pin the capture-exists arm in the *Given* and make (3) unconditional. | §6.6 AT-06-4 |
| F-02 | Low | inherited | nonlocal | §2's preamble still pins upstream as `REQ-pdlc-advisory-wave-gate` v1.13; REQ is v1.16, and this round's own changelog (line 14) cites v1.16 three lines above. Individual traces still resolve — stale token, not a broken citation. Carried from v3 F-01 / v4 F-03. | §2 Linked Requirements, preamble |
| F-03 | Low | inherited | nonlocal | BR-9's observation-point clause excludes "the record and escalation writes … both carriers"; AC-5.1 v1.16 names three (AC-6.1 record append, AC-6.2 escalation-log append, AC-5.2 M-WG-7 queue-row write). E-23 covers the third and the observation point structurally precedes it, so no oracle is wrong — enumerative gap at the rule site AT-05-1 reads from. Carried from v3 F-02 / v4 F-04. | §4 BR-9, observation point |
| F-04 | Low | delta | local | The edit amended §3.2 step 10 to two arms but left §3.3's one-table summary row 10 reading `halt exactly as today, diagnosis attached` — a single-branch summary of a now-two-branch step. §3.2 is authoritative so no oracle misreads it; a reader working from the flow-at-a-glance table will not see the branch AT-06-4b covers. One-cell fix. | §3.3 flow table, row 10 |

FINDING: Medium | delta | local | §6.6 AT-06-4 | AT-06-4's Given does not pin the capture-exists arm its Then conjunct (3) is conditional on, so an E-34 fixture satisfies the conjunct vacuously and the test passes without exercising the overwrite warning — mirror AT-06-4b's explicitly pinned Given and make conjunct (3) unconditional
FINDING: Low | inherited | nonlocal | §2 Linked Requirements, preamble | FSPEC pins upstream REQ v1.13 while REQ is v1.16 and this round's own changelog cites v1.16; traces still resolve, version token stale
FINDING: Low | inherited | nonlocal | §4 BR-9, observation point | BR-9 names two excluded record carriers ("both") where AC-5.1 v1.16 names three (record append, escalation-log append, M-WG-7 queue-row write); E-23 covers the third, so the gap is enumerative rather than a coverage hole
FINDING: Low | delta | local | §3.3 flow table, row 10 | The edit gave §3.2 step 10 two arms but left §3.3's summary row reading "diagnosis attached", so the flow-at-a-glance table omits the branch AT-06-4b exists to cover

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:d602c440fc9f3e76904419399c787d617e541d798d0348e07b9c2005b39dfe0e
APPROVAL-HASH-NORMALIZED: sha256:d602c440fc9f3e76904419399c787d617e541d798d0348e07b9c2005b39dfe0e
REVIEWED-COMMIT: 0fc601b2cc397fd1f41c2b9bdb5872f1ca74f8b5
UPSTREAM-STATE: REQ sha256:f97f4f6601406b5a6b5adb6dbc2e6f79d81218119c9b4238854f3431e8e6fab7
