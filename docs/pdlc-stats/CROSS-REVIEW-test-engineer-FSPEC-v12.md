# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.8)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…a8862)
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation — erratum edit)
**Scope:** Local

## Overview

This is a delta confirmation, not a re-review. The erratum edit (`311910dce`) touches the FSPEC
header block only — 11 insertions, 2 deletions, all inside lines 6–24 — and changes no rule, no
flow, no business rule, no acceptance test and no edge case. Two substantive things happen: the
`Upstream` pin moves from `REQ-pdlc-stats.md` (v1.4) to (v1.7), and a v1.8 erratum paragraph records
that the REQ-STATS-06 / BR-16 contradiction is **absorbed upstream** rather than resolved here.

I confirm both the routed item and the wider obligation. The routed item was reported ABSORBED at
HEAD, and that report is accurate: REQ v1.7 withdrew the "grammatical basename outside the driver's
catalogue is a survivor" clause and decided the case BR-16's way. FSPEC needed no rule edit because
FSPEC never encoded the withdrawn clause — my v11 confirmation already established that `survivor`
appears nowhere in FSPEC's normative text, and it still does not. The only thing FSPEC owed was the
stale pin, which is exactly what this edit pays.

The scope obligation (DEC-ERR-03) is the wider question: does FSPEC v1.8 still faithfully compress
REQ **as it stands at the dispatched hash**, whether or not a defect appears in the routed list? I
re-read REQ-STATS-06 at v1.7 in full and re-walked every FSPEC anchor that leans on it. It does.
Details below; the short version is that the pin correction is the whole delta and it is correct.

## Linked Requirements

The dispatched upstream hash verifies. `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` returns
`f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, byte-identical to the pin in the
dispatch, so I am reading the REQ the orchestrator measured against and no other.

The pin correction itself is sound. FSPEC's header now names REQ v1.7, which is the version the
document is re-grounded against, and v1.7 is genuinely the current REQ. My v11 review recorded that
the v10 approval had been taken against REQ **v1.6** while the header still said v1.4 — that
mismatch is now closed rather than merely re-stated.

I checked that the pin correction did not leave *other* stale version references behind. FSPEC still
mentions "REQ v1.4" at lines 39–48 and 951–978, but every one of those is a historical record, not a
pin: the §7.3 erratum table's "All five are closed at REQ v1.4" and the D-8/D-9 rationales state
*when* a carve-out landed. That remains true at v1.7 — a clause that closed at v1.4 and was never
reopened is still closed. Rewriting those to "v1.7" would in fact make them false. The one
normative pin is the header `Upstream` row, and it is the one that moved.

I verified the v1.4-era carve-outs FSPEC leans on survive in REQ v1.7 rather than trusting the
erratum table: REQ-STATS-09's *Given* still scopes itself to "a repository whose `docs/` root is
present and readable" with the root-failure carve-out (REQ:245–248, FSPEC D-9/EC-09); REQ-STATS-07
still carries "a readable but empty directory is not a gap but a normal row whose metrics report
their zero states" (REQ:223–224, FSPEC BR-27/AT-20/AT-26); REQ-STATS-03 still disposes of every
failing `CROSS-REVIEW-` basename as malformed under one label (REQ:163, FSPEC D-8/BR-06/AT-09).
None of the four traceability rows FSPEC §2 draws to REQ-STATS-06 has lost its upstream anchor.

## Behavioral Flow

Unchanged, and not reopened. The erratum edits no line below the header block, so §3.1 step 8 and
§3.2 Flow B stand at the bytes I approved. The branch inventory a flow-level test derives from Flow
B is identical: the harvested test still precedes the zero-denominator test, and the erratum neither
adds a leaf nor reorders one.

Worth stating explicitly for the test lens, because it is the thing that *could* have gone wrong and
did not: upstream's decision changed which **value** one existing leaf produces for one input class
— a directory whose only `CROSS-REVIEW-` basenames are out-of-catalogue. Under the withdrawn
"survivor" clause that class would have yielded a measured ratio; under REQ v1.7 it yields
`harvested`. FSPEC's leaf already produced `harvested` for that class. So the upstream withdrawal
*removed a contradiction* against FSPEC rather than requiring FSPEC to move. No flow-level oracle is
invalidated, no test level shifts, and no previously-approved acceptance test changes its expected
value. That asymmetry is the reason this is a pin correction and not a rule edit.

## Business Rules

This is where the absorption claim has to hold, so I re-derived it from the current bytes on both
sides rather than from the erratum paragraph's summary.

REQ-STATS-06 at v1.7 (REQ:205–215) now reads: the harvested predicate "is evaluated over exactly the
file set whose bytes the process side sums, so a basename the driver's document-type catalogue does
not recognise … contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured
ratio."

FSPEC BR-16 (FSPEC:373–384) reads: harvested fires when `LEARNINGS-{feature}.md` is present and at
least one of the two harvest-deleted families is entirely absent; "It is evaluated over exactly the
file set BR-14's numerator sums, so the two never disagree: a basename failing a grammar contributes
no bytes to the process side and counts as no file remaining. A directory whose only `CROSS-REVIEW-`
basenames are the out-of-catalogue … files BR-06 reports as malformed reports `harvested`, not a
measured ratio."

That is a faithful compression, near-verbatim on the load-bearing clause, and the two now agree on
the case that was in contradiction. BR-14 (FSPEC:357–365) fixes both sides to REQ C-3/C-4 and states
that files on neither list contribute to neither side, so BR-14 and BR-16 demonstrably read **one**
file set — the property the erratum claims and the one that makes the contradiction unreachable
rather than merely unstated. BR-15's zero-denominator rule is untouched upstream and downstream.

I also checked the direction the erratum does *not* claim, since a withdrawal can over-reach: REQ
v1.7 did not weaken C-5's parsing-fidelity constraint (REQ:121–133 unchanged), so FSPEC's BR-06,
BR-10, BR-12 and §7.3 E-3 still rest on live upstream text. No FSPEC business rule now cites a REQ
clause that v1.7 deleted — the withdrawn sentence was never quoted or leaned on anywhere in FSPEC.

## Edge Cases and Error Scenarios

No edge case is added, removed or re-valued by the delta. EC-12 (zero spec bytes → `n/a`) and EC-13
(harvested wins over `n/a`) stand at approved bytes, and their §8 trace rows are untouched.

EC-13 deserves one sentence because it is the edge case nearest the absorbed contradiction. Its
precedence claim — harvested evaluated before the zero-denominator test — is orthogonal to what
upstream decided. REQ v1.7 settled *which files count as remaining*; EC-13 settles *which test runs
first*. A directory that is harvested and has zero spec bytes still reports `harvested`, and that is
still the single configuration on which the two orders disagree. The withdrawal does not collapse
that configuration or make it unreachable, so EC-13 keeps a falsifying fixture and does not become
vacuous. This is the failure mode I was looking for and it is absent.

## Acceptance Tests

AT-17 is the acceptance test the absorbed item lives in, and it is correct at HEAD without an edit.
Its fourth leg (FSPEC:758–766) already specifies a directory "holding `CODE_REVIEW` files intact
plus, as its only `CROSS-REVIEW-` basenames, the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`
form BR-16 names", expecting `harvested` — "the fourth not a measured ratio, because files whose
bytes BR-14 refuses are equally files BR-16 does not count as remaining". That is precisely the
outcome REQ v1.7 now mandates. Under the withdrawn clause this leg would have been *wrong*; the
withdrawal makes it right. Nothing to change, and the previously-approved expected value survives.

I verified the erratum's forward citation rather than accepting it, since a nonexistent-authority
citation has shipped on this pipeline before. PROP-RATIO-08 (`PROPERTIES-pdlc-stats.md:173`) does
carry four AT-17 legs, and its fourth is "`CODE_REVIEW` files **intact** alongside only
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames", noted as "the one that proves the
condition is a disjunction rather than a DoD-side test". The fixture backing it, `F-HARVEST-FOUR`
(PROPERTIES:331), enumerates the same four directories. The erratum's claim that "PROP-RATIO-08's
fourth leg asserts that same outcome" is accurate as written.

Two further checks against my own review checklist. The oracle is not absence-shaped: PROP-RATIO-08
asserts three positive conjuncts — exact `state` string, the `ratio: null`, and the retained
`processBytes`/`specBytes` — and PROPERTIES:272 records that `state !== "measured"` is never the
assertion. And the precedence chain has a defeating fixture (PROP-RATIO-09, PROPERTIES:278), so the
harvested-before-zero-denominator branch cannot false-green on a fixture that reaches only the
earlier branch. Both properties are unaffected by the delta and remain falsifiable.

The §8 traceability matrix needs no re-derivation: BR-16 → AT-15, AT-17 and BR-14 → AT-15 are the
rows v1.7 already fixed, and the erratum edits no matrix row.

## Open Questions

None blocking this confirmation. One observation is out of my scope here but should not go
unrecorded, because it is the kind of thing that is cheap to see now and expensive to find later.

While grepping the withdrawn clause across the feature's documents I found that **TSPEC still
asserts the "survivor" rule as live** — `TSPEC-pdlc-stats.md:52`, `:792`, `:1310`, `:1321`. Line 52
goes further and frames it as a standing contradiction against BR-16 ("which contradicts BR-16's
'reports `harvested`'"). Upstream has now decided that case the other way, so those TSPEC passages
describe a rule that no longer exists and a conflict that is resolved.

This is **not a finding against FSPEC** and I have deliberately not filed it as one: TSPEC is
downstream of FSPEC, not upstream, so it is outside both this document's scope and this
confirmation's question. FSPEC is faithful to REQ and that is what I was asked. I record it because
the orchestrator, not I, owns whether TSPEC's cascade round has already absorbed this; if TSPEC has
not yet been re-grounded on REQ v1.7, these four sites are where its erratum lands, and a TSPEC that
ships describing `survivor` as live would put the implementation at risk of coding the withdrawn
rule. Flagging it early costs nothing; discovering it at implementation costs a wave.

## Positive Observations

- The erratum does the minimum that is correct. It resists the temptation to "fix" FSPEC prose to
  match a changed upstream when FSPEC was already right — the document needed a pin, not a rule, and
  it got a pin. Rule churn under an erratum is how approved acceptance tests silently lose their
  expected values, and none of that happened here.
- The erratum paragraph states its own reasoning and its own scope ("no rule changed", "No other
  change"), and the diff bears both claims out at 11/2 lines confined to the header. A reviewer can
  check the claim against the diff in one command, which is what makes a delta confirmation cheap.
- The forward citation to PROP-RATIO-08's fourth leg is real and precisely characterised. Given this
  pipeline's history of nonexistent-authority citations, a citation that survives verification
  verbatim is worth naming.
- AT-17's fourth leg and its `F-HARVEST-FOUR` fixture were specified before upstream settled the
  question, and they anticipated the answer upstream ultimately gave. The test layer got this right
  ahead of the requirement layer.

## Recommendation

**Approved**

The delta resolves the routed item — by correctly recording it as absorbed upstream and paying the
one debt FSPEC actually owed, the stale pin — and breaks nothing I previously approved. FSPEC v1.8
remains a faithful compression of REQ v1.7 at the dispatched hash. No High, Medium or Low finding.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
