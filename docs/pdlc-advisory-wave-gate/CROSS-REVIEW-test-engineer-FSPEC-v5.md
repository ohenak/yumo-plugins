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

_pending_

## Business Rules

_pending_

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
