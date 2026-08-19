# Cross-Review: test-engineer — FSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 6
**Scope:** Delta only. Diff `7b8b314c..HEAD` on the FSPEC (26 insertions, 17 deletions across the
changelog, §4 BR-11, §5 E-25, §6.1 AT-01-5, §6.4 AT-04-1/1a/1b, §7.3 A-1/A-4). Prior round:
`CROSS-REVIEW-test-engineer-FSPEC-v5.md` (1 High, 1 Medium, 2 Low). Unchanged sections not
re-litigated.

## Prior findings — disposition

| Prior ID | Severity | Status | Evidence |
|----------|----------|--------|----------|
| F-02 | High | **Resolved** | §6.4 now carries three ATs on three runs, one per REQ AC-4.1 conjunct: AT-04-1a = (i) applies + green re-gate ⇒ resolved, proceeds, green invocation in AT-04-2's sequence (FSPEC:391-393); AT-04-1 = (ii) applies + red re-gate ⇒ `escalated`, halt reason equals the pre-A6 gate failure literal, resolved-wave count `0`, restoration delegated to AT-05-1 (FSPEC:389-390); AT-04-1b = (iii) applies + **no** gate invocation ⇒ wave halts, fixture suppresses the re-gate (FSPEC:394-398). The "No existential negative — 'no path exists' is not assertable" sentence is gone (`grep -c "not assertable"` → 0). Matches REQ AC-4.1 (REQ:382-390) conjunct-for-conjunct. |
| F-01 | Medium | **Resolved** | BR-11 now measures the seam budget over "a single **attempt** … the window AC-2.4 pins — dispatch→verdict on the attempt, the deadline restarting each attempt" and states the invocation worst case as `attemptBudget` × value (FSPEC:213-218); E-25 reads "exceeded on one **attempt** … measured over BR-11's per-attempt dispatch→verdict window" (FSPEC:290). The stale "REQ AC-2.4 defines" attribution is gone. AT-02-7's fixture wording ("one dispatch, dispatch→verdict", FSPEC:355-361) is consistent with an attempt being one repair-and-re-gate cycle, so no fixture changed — as predicted. |
| F-03 | Low | **Resolved** | AT-01-5's population now reads "runs that reach Phase I **and evaluate wave mode** — wave-executing and no-manifest legacy alike, the legacy arm a fixture, not an exclusion (ledger-skip and early-halt runs stay out)" (FSPEC:330), extensionally matching REQ AC-1.5 (REQ:274-283) and closing the "build only the wave-mode arm" reading. |
| F-04 | Low | **Resolved** | A-1 now names the mutual exclusivity of the two carriers inside BL-06's re-measurement obligation ("re-measurement covers the BL-03 no-manifest notice E-04's cardinality rests on, the notice's mutual exclusivity with BL-04's, and …", FSPEC:505), so the fact E-04 consumes has recorded provenance. |

Also checked in the delta and clean: A-4's `invocation` → `single run` rewrite (FSPEC:512-514) is
faithful to REQ R-3's post-erratum text ("the per-run knob bounds drift within a single run only,
drift across runs bounded by the operator arriving at them, not by a number", REQ:512-516), and the
v1.2 changelog row is correctly marked superseded by v1.4 rather than silently rewritten.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | **AT-04-1b's Then is the weakest of the three conjunct oracles, and its fixture is the one that most needs a strong one.** The oracle reads "the wave halts: not resolved, resolved-wave count `0`" (FSPEC:395). One conjunct is negative (`not resolved`), one is a positive exact value (`count == 0`), and "the wave halts" names no disposition value or reason literal — unlike sibling AT-04-1, which pins `escalated` plus the pre-A6 gate-failure literal (FSPEC:389-390). The fixture deliberately mutates shipped control flow to suppress the re-gate; a mutation that makes the wave halt for *any* other reason (restoration path, dispatch error, a precedence branch reached before the prohibition) satisfies all three assertions and green-lights a test that never exercised the prohibition it exists to falsify. This is the precedence-chain false-green shape. Suggested revision: give AT-04-1b the same shape as AT-04-1 — a named terminal disposition value and a named halt reason attributable to the wave's own gate, alongside the `0` count. | §6.4 AT-04-1b (FSPEC:394-398), cf. AT-04-1 (FSPEC:389-390) |

## Questions

| ID | Question |
|----|----------|
| Q-01 | AT-04-1b defers fixture construction to the TSPEC under O-1 (FSPEC:398). Does the FSPEC intend the halt AT-04-1b asserts to be *distinguishable* from a mutation-induced failure, or is distinguishability itself the TSPEC's obligation? If the latter, an explicit O-1 clause saying so would stop the TSPEC from shipping the weaker oracle by default. |

## Positive Observations

- **The AC-4.1 split landed exactly as the upstream erratum specified, and no further.** Three fixtures, one conjunct each, with the note "each conjunct gets its own run — none exhibits two" (FSPEC:390). Nothing was merged for convenience, and AT-04-1a's cross-reference to AT-04-2's invocation sequence keeps the green re-gate provable from a sequence already pinned elsewhere rather than by a second bespoke oracle.
- **The per-attempt sweep cost no fixture, which is the sign the round-2 partition was right.** BR-11 and E-25 changed vocabulary; AT-02-7 needed no edit, and its companion positive-disposition arm still discriminates `resolved` from the shared `budget-exhausted` literal.
- **AT-01-5's population clause now states its exclusions positively** (ledger-skip and early-halt runs stay out) rather than leaving them to inference, which is the difference between a population an implementer can build and one they must guess at.

## Recommendation

**Approved with minor changes**

The High finding from round 5 is closed: AC-4.1's three conjuncts now have three acceptance tests
on three runs, the falsified "not assertable" rationale is gone, and the prohibition conjunct has a
named fixture strategy. The three lesser findings are closed as well, each by the precise
one-clause edit suggested. Nothing in the delta broke a previously approved section: the changed
lines touch only the changelog, BR-11, E-25, AT-01-5, §6.4 and two assumptions, and the fixtures
that depended on the old wording remain valid. The one open finding is Medium — AT-04-1b's oracle
would be stronger if it named its disposition the way its sibling does — and does not gate.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
