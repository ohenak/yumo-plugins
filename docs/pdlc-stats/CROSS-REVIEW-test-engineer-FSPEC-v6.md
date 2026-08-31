# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/FSPEC-pdlc-stats.md (v1.4)
**Upstream at dispatch:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.4, sha256:60a516fb2ede…f1c9)
**Date:** 2026-08-31
**Iteration:** 6 (delta confirmation)
**Round type:** erratum delta confirmation — previously approved at v5

## Overview

**Answer to the confirmation question: yes on the routed items, with reservations that are not
gating.** All nine routed items land, and the way they land is the right way: BR-11 and BR-16 now
state their harvested conditions over the *documented basename grammars* rather than bare globs,
which is exactly how REQ v1.4 states them, and AT-12 and AT-17 grew falsifying legs for the two
leftover shapes (`CODE_REVIEW-{feature}-draft.md`, a foreign-feature `CODE_REVIEW-`, and the
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`) that the old wording left undecided. BR-16's
new "evaluated over exactly the file set BR-14's numerator sums" is the sentence that closes the
BR-14/BR-16 disagreement rather than papering over it. BR-25 names the archive root's second loose
file; I verified the archive root holds exactly `REQ-completed.md` and `QUEUE-HISTORY-rows-0-1.md`
and the `docs/` root exactly `PLAN-pdlc-integration-boundary-gates.md`, so the enumeration is now
complete rather than illustrative.

Nothing I previously approved is broken by the delta. No acceptance test became wrong, no traceability
row lost its cover, and no metric's behavior moved.

**The reservations are about fidelity to upstream, not behavior (DEC-ERR-03).** Re-reading REQ v1.4
end to end, the re-grounding this round performed is narrower than its own changelog claims. REQ v1.3
(commit `50dffe8c8`, "nine targeted wording fixes") closed *nine* wording defects, of which this FSPEC
round absorbed only the three harvested-predicate ones. The remaining six were the subject of the
FSPEC's §7.3 errata list, BR-27's narrowing clause, EC-09's departure note and D-9's rationale — and
every one of those passages now describes an upstream that no longer exists:

| FSPEC passage asserts | REQ v1.4 actually says |
|---|---|
| §7.3: C-5 defines no post-mortem-listing classification (High, open) | C-5: "Discovering *which* phases have a post-mortem is carved out … That listing is this REQ's own (REQ-STATS-05)" |
| §7.3: whether the malformed label is intended "is the REQ's to decide" (High, open) | REQ-STATS-03: "one label stands: a third bucket would be an independent rule C-5 forbids", naming `CROSS-REVIEW-{role}-REVIEW-v{N}.md` |
| §7.3 / EC-09 / D-9: REQ-STATS-09's *Given* sweeps in the no-`docs/`-root case | REQ-STATS-09: "in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure" |
| §7.3 / BR-27: REQ-STATS-07 says "reports it by name as missing/malformed" | REQ-STATS-07: "for any feature whose directory cannot be read, reports it by name with the reason … a readable but empty directory is not a gap but a normal row whose metrics report their zero states" |
| §7.3: REQ-STATS-02 over-distributes states; REQ-STATS-08 lost its separators | both repaired in v1.3 |

That is a fidelity defect, not a behavior defect: in every one of these cases the FSPEC's *behavior*
is what the REQ now mandates, so the documents agree and the tests are unaffected. What is wrong is
that the FSPEC still quotes deleted upstream text verbatim (BR-27), still frames its own decisions as
departures from a criterion that has since been carved to match (EC-09, D-9), and still holds two
**High** errata open against a REQ that resolved them. The erratum channel is fail-closed machinery
in this pipeline; leaving two phantom Highs in it is a real cost, and harvest will read them.

All findings are Medium or Low, so this confirmation approves. The `Provenance` split matters here:
the §7.3 rewrite is this round's edit re-affirming staleness (`delta`), while BR-27/EC-09/D-9 carried
it in from the pre-round bytes untouched (`inherited`).

## Linked Requirements

Re-checked at REQ v1.4, not taken from the pre-round bytes.

| Routed item | Where it landed | Faithful to REQ v1.4? |
|---|---|---|
| BR-11 vs REQ-STATS-04 version grammar (pm, se, te) | BR-11 now: "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains (REQ-STATS-04)", plus an explicit leftovers clause | Yes — REQ-STATS-04 line-for-line: "where `LEARNINGS-{feature}.md` is present **and** no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains" |
| BR-16 over `CROSS-REVIEW-*` vs documented grammar (pm, se, te) | BR-16 now names BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` and `CODE_REVIEW-{feature}-v{N}.md` grammars | Yes — REQ-STATS-06 names C-4's grammars identically |
| BR-16 vs BR-14 one-file-set disagreement (pm, se, te) | BR-16: "evaluated over exactly the file set BR-14's numerator sums" | Yes, and it is the right closure: it makes the numerator and the harvested test one predicate |
| Out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` counts as "remaining"? (pm, se, te) | BR-16 says no; AT-17 gained a fourth fixture | Yes — REQ-STATS-03 itself declares those names fail the grammar ("covers the grammatical-but-out-of-catalogue names the pipeline writes"), so "no file matching the grammar remains" is satisfied. This is inherited upstream, not invented here |
| BR-25 second archive-root loose file (se ×2) | BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` | Yes, and verified against the tree: the archive root holds exactly those two files |

**Upstream drift check (DEC-ERR-03).** The header pin moved `v1.2 → v1.4` and the changelog says
"re-grounded on REQ v1.4", but only REQ-STATS-04/06's harvested predicates were re-grounded. The other
six v1.3 fixes (C-5's post-mortem-discovery carve-out, REQ-STATS-03's "one label stands",
REQ-STATS-09's *Given* carve-out, REQ-STATS-07's gap/zero-state disposition, REQ-STATS-02's state
attribution, REQ-STATS-08's separators) are unabsorbed. Every §2.1 / §2.2 traceability row still
resolves — no criterion lost its business rule or its acceptance test — so this is a prose-fidelity
gap, not a coverage gap. Findings F-01, F-04, F-05, F-06.

One row I re-derived rather than trusted: §2.2 maps C-5 to "BR-05, BR-06, BR-10, BR-12". C-5 at v1.4
now carves post-mortem *discovery* out of the fidelity rule, and BR-12 already splits discovery
(this command's own match) from resolution tagging (the driver's). The row is still correct at v1.4 —
BR-12 honors what remains of C-5 — so no finding beyond F-06's citation-freshness point.

## Behavioral Flow

Only one flow cell changed: A6's decision point moved from "Any `CODE_REVIEW-*` file present?" to
"Any `CODE_REVIEW-{feature}-v{N}.md` file present?". That is the correct edit — the old cell was the
flow-level restatement of the same over-broad predicate BR-11 carried, and leaving it would have left
an implementer reading the flow table a second, contradicting rule. A8's cell was already phrased over
"either process family", so it needed no edit and got none.

Steps A5–A8's independence claim is unchanged and still holds under the new predicates: BR-11 and
BR-16 each test their own family, so a directory whose cross-reviews are gone and whose DoD reviews
survive still reports `harvested` rows against a measured DoD number. AT-12's new third leg and
AT-17's new fourth leg are both consistent with that independence rather than in tension with it.

No finding in this section.

## Business Rules

### BR-11 — resolved, and falsifiably

The new leftovers clause ("a basename beginning `CODE_REVIEW-` that does not match — a `-draft`
suffix, another feature's name — contributes nothing to BR-10's value and counts as nothing remaining
here, so it neither raises the number nor suppresses `harvested`") states both directions of the
qualifier. Both directions matter and both are now testable: the "does not raise the number" half is
BR-10/AT-28's territory, the "does not suppress `harvested`" half is AT-12's new third directory. The
two halves are consistent with EC-16's silent-not-malformed disposition, which the delta left alone.
No finding.

### BR-16 — resolved, with two problems in the new prose

The predicate is right and now matches REQ-STATS-06 word for word. Two issues with how it is written.

**1. The `docs/completed/pdlc-advisory-wave-gate/` citation is a false real-path claim (F-02).** The
sentence reads: "A directory holding only the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md`
files BR-06 reports as malformed — the shape `docs/completed/pdlc-advisory-wave-gate/` carries —
reports `harvested`, not a measured ratio". The appositive is meant to point at the *basename shape*,
but its nearest antecedent is the directory, and on that reading the claim is false. I measured it:

```
docs/completed/pdlc-advisory-wave-gate/
  LEARNINGS-pdlc-advisory-wave-gate.md          present
  CROSS-REVIEW-{pm,te}-REVIEW-v{1,2}.md         4 out-of-catalogue
  CROSS-REVIEW-… (REQ/FSPEC/TSPEC/PLAN/…)       many grammatical, TSPEC to v6
  CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md present
```

Neither family is entirely absent there, so that directory reports a **measured** ratio, not
`harvested`. This matters in this document specifically because §6's own preamble licenses real-path
tests with literal expectations: a reader who takes the citation at face value writes AT-17's fourth
leg against the real directory and pins the opposite of BR-16. AT-17 itself is correct — it uses a
constructed fixture whose *only* `CROSS-REVIEW-` basenames are the out-of-catalogue form — so no test
is currently wrong. Fix: say "the basename shape `docs/completed/pdlc-advisory-wave-gate/` carries",
or drop the citation and keep BR-06's, which is already the accurate one.

**2. The new BR-14 equivalence has no falsifying oracle (F-03).** BR-16 now rests on "a basename
failing a grammar contributes no bytes to the process side and counts as no file remaining" — one
sentence carrying two claims. The *remaining* half is pinned by AT-17 leg 4. The *no bytes* half is
pinned by nothing: BR-14 itself never says the doc-type is closed to BR-09's six (it is derivable via
BR-06, but derivable is not asserted), and AT-15's "files on neither list" enumeration is
`LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md` — no `CROSS-REVIEW-`-prefixed member. An
implementation that sums every `CROSS-REVIEW-*` basename into `processBytes` while excluding
out-of-catalogue names from the "remaining" test passes AT-15, AT-17 and every other test in §6, and
reports a `processBytes` an operator would sanity-check against and find inflated. See §Acceptance
Tests for the one-line fix.

### BR-25 — resolved

Enumeration verified complete against the tree. The rewrite also improved the framing ("whatever its
basename claims"), which is the load-bearing part: `QUEUE-HISTORY-rows-0-1.md` is precisely a basename
that no has-a-REQ heuristic would trip over, so naming it adds a second, differently-shaped instance
rather than a duplicate of the first. No finding.

### BR-27 — untouched, and now misquoting upstream (F-04)

BR-27 says: "This narrows REQ-STATS-07's 'missing artifacts fail to parse … reports it by name as
missing/malformed' … but 'as missing' is not what a zero-state row says, so the wording is raised as an
erratum (§7.3)." REQ v1.3 deleted that string. REQ-STATS-07 now reads "for any feature whose directory
cannot be read, reports it by name with the reason … a readable but empty directory is not a gap but a
normal row whose metrics report their zero states" — which is BR-27's rule, adopted upstream verbatim
in substance. So BR-27 narrows nothing, quotes text that no longer exists, and points at an erratum
that has been discharged. The behavior is unchanged and AT-26 stays correct; the citation is stale.

## Edge Cases and Error Scenarios

The delta touched no §5 row. Two rows were re-read against REQ v1.4 anyway, because the routed items
run through them.

**EC-13 and EC-16 still agree with the new predicates.** EC-13 ("`LEARNINGS` present and spec bytes
zero → `harvested`, not `n/a`") depends only on BR-16's precedence, which the delta preserved. EC-16
("a `CODE_REVIEW-` basename that does not match the version grammar contributes nothing and is **not**
reported as malformed") is exactly the disposition BR-11's new leftovers clause now assumes, so the
delta made EC-16 load-bearing where it was previously only asymmetry-explaining. That is an
improvement: AT-28 already pins it and AT-12's third leg now pins the other side of the same file.

**EC-09 asserts a departure from upstream that upstream removed (F-05).** EC-09's Behavior cell says
the root-failure disposition "departs from REQ-STATS-09's *Given*, which sweeps this case in; the
departure is decided in D-9 and raised as an erratum (§7.3), not left implicit." REQ v1.3 carved the
case out: REQ-STATS-09's *Given* is now "in a repository whose `docs/` root is present and readable —
a missing or unreadable `docs/` root is not this criterion's case but a root failure." There is no
departure left to decide, and the two documents do not disagree on a P1 path. The observable behavior
EC-09 specifies is unchanged and is what the REQ now mandates; AT-27's eight root-failure legs stay
correct and stay valuable. Only the justification prose is stale.

I checked whether the staleness could have leaked into an oracle, since a test written to prove a
"departure" would be a test written to prove a disagreement: it did not. AT-27's root-failure legs
assert positive conjuncts (`error.reason` exactly `no_docs_root`, the two messages not byte-identical,
`feature` null in fleet runs) and never assert anything about REQ-STATS-09's *Given*. No test moves.

No new edge case is needed by the delta. BR-16's new out-of-catalogue clause is already covered by
EC-05's "or a document type outside BR-09's six" leg, which the delta correctly did not duplicate.

## Acceptance Tests

Two tests grew legs this round. Both new legs are genuinely falsifying, which is the bar I care about
most in an erratum round — a leg added to answer a wording finding is usually where an unfalsifiable
oracle sneaks in, and neither of these did.

**AT-12's third directory** (`LEARNINGS` + `CODE_REVIEW-{feature}-draft.md` + another feature's
`CODE_REVIEW-{other}-v2.md` → `harvested`) is the right fixture: it carries **two** distinct
non-matching shapes, so an implementation that special-cases only the `-draft` suffix, or only the
foreign-feature name, fails one half. Combined with the first two directories (`4` and `harvested`),
the test now defeats a constant implementation in three directions rather than two. It also composes
with AT-28, which pins the same two shapes on BR-10's numeric side — the pair covers "does not raise
the number" and "does not suppress `harvested`" separately, so neither can false-green the other.

**AT-17's fourth directory** (`CODE_REVIEW` intact, only out-of-catalogue `CROSS-REVIEW-` basenames →
`harvested`) is the leg BR-16's new clause needed, and it is stated over a constructed fixture, not the
real `docs/completed/pdlc-advisory-wave-gate/` — correct, and the reason F-02 is Medium rather than
High: the prose citation is wrong but the test that would have inherited the error does not. The
four-fixture set now covers each family's absence separately, both absent, and the grammar-failure
case, which is set-equal to BR-16's own disjunction. That is the enumeration I would have asked for.

**The one gap the delta opened (F-03).** AT-15 is the only test asserting BR-14's enumeration by
removal, and its "files on neither list" set is `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`,
`SIZING-*.md`. After this round BR-16 asserts an equivalence with BR-14's numerator that AT-15 cannot
falsify, because no `CROSS-REVIEW-`-prefixed non-matching basename appears anywhere in AT-15's fixture.
Minimal fix, one clause: add `CROSS-REVIEW-{role}-REVIEW-v1.md` to AT-15's neither-list enumeration and
assert both totals are unchanged by its presence. That closes the "contributes no bytes" half against
the only implementation that would plausibly get it wrong — one that globs `CROSS-REVIEW-*` for the
numerator while parsing the grammar for the round counts. Alternatively, assert `processBytes` in
AT-17's fourth leg; the AT-15 route is cheaper because the removal-probe machinery is already there.

**Traceability (§6.11) re-derived, not trusted.** BR-11 → AT-12, BR-16 → AT-17, BR-25 → AT-18 all
still resolve, and no EC row lost its cover. The delta added no rule and no edge case, so no row needed
adding; correctly, none was.

**Real-path literals re-measured.** BR-06's "four such files sit in
`docs/completed/pdlc-advisory-wave-gate/`" and AT-09's "the `TSPEC` row still reads `6`" are both
correct at HEAD (four `-REVIEW-v{1,2}` files across two roles; TSPEC cross-reviews run to v6 for both
product-manager and test-engineer). AT-18's loose-file literal is correct and now, via BR-25, complete.

## Open Questions

### §7.3 holds five errata that upstream already closed (F-01)

This is the section the round rewrote, and the rewrite is where the finding sits. It now opens
"Wording findings left open in the REQ text are raised as errata against it", correctly reports the
three harvested-predicate errata as **closed**, and then says "Two errata remain" plus "Three more
follow". All five of those were closed by REQ v1.3 in the same commit that closed the three
(`50dffe8c8`, whose message enumerates all nine fixes). Concretely:

- *REQ-STATS-05's post-mortem-listing classification (High)* — C-5 now carries the carve-out
  explicitly, in the FSPEC's own words: "That listing is this REQ's own (REQ-STATS-05); fidelity binds
  the `RESOLVED:` marker, not the discovery."
- *REQ-STATS-03's malformed disposition (High)* — REQ-STATS-03 now decides it: "one label stands: a
  third bucket would be an independent rule C-5 forbids", naming the `-REVIEW-v{N}` form.
- *REQ-STATS-09's Given (Medium)* — carved out; see §Edge Cases.
- *REQ-STATS-07's "missing/malformed" wording (Medium)* — rewritten to the zero-state-row disposition.
- *REQ-STATS-02's state enumeration and REQ-STATS-08's separators (Low)* — both repaired.

Why this is worth a finding rather than a nit: two of the five are labelled **High** and sit in the
erratum channel, which is fail-closed machinery here, and harvest reads §7.3. Leaving two phantom High
errata pointed upstream costs a downstream reader a re-derivation each, and invites a TSPEC author to
design around a "disagreement on a P1 path" that no longer exists. The fix is a deletion, not a
rewrite: absorb the five the same way the three harvested ones were absorbed, and if none remains, say
so — "§7.3: no errata remain open" is a perfectly good section.

### D-9's rationale, and D-8's (F-05, F-06)

D-9's Rationale column argues at length that "the criterion's wording needs a carve-out, so it is
raised as an erratum rather than left as an unexplained contradiction on a P1 criterion". The carve-out
landed. The *Decision* column is untouched by this and remains right; only the argument for it is
obsolete, and it should now read as a citation ("REQ-STATS-09 as amended in v1.3 carves this out; BR-30's
`reason` values keep both answers machine-distinguishable") rather than as a dissent. D-8's rationale
has the same shape against REQ-STATS-03 and the same fix.

Related and smaller (F-06): §1's fidelity anchor and BR-12 both *argue* that selecting post-mortem
files is not a C-5 divergence. C-5 now says so itself. The argument is still true and still useful to a
reader, but it should cite C-5's carve-out rather than reason around C-5's silence — as written it
implies the REQ is silent where it is not.

### Questions

| ID | Question |
|---|---|
| Q-01 | Is there any reason to keep §7.3's five closed bullets as a record (a "closed errata" ledger) rather than delete them? If yes, say `closed` on each, as the harvested three now do — the current text says `remain`, which is the load-bearing word. |
| Q-02 | Should BR-14 state the doc-type closure directly ("`{doc-type}` is BR-09's six-type catalogue"), rather than leaving BR-16 to assert it on BR-14's behalf? That would make F-03's missing oracle unnecessary at the rule level as well as the test level. |

### Positive observations

- BR-16's "It is evaluated over exactly the file set BR-14's numerator sums" is the right kind of fix:
  it replaces two predicates that happened to agree with one predicate that cannot disagree. Three of
  the nine routed items collapse into that one sentence.
- AT-12 and AT-17 both grew fixtures rather than assertions-about-fixtures. Every new leg can fail.
- The changelog's "No other change." is accurate as to the *body*: I diffed the round and found no
  incidental edit riding along outside the four rules and two tests named.
- BR-25's rewrite generalised the rule ("whatever its basename claims") instead of only appending the
  missing filename — the enumeration is now an illustration of a rule rather than the rule itself.

## Delta-Confirmation Findings

## Verdict
