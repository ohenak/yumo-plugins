# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, bytes unchanged since v9 approval)
**Date:** 2026-08-31
**Iteration:** 10
**Round type:** Upstream-cascade confirmation (REQ moved; TSPEC did not)

## Overview

**What moved.** Exactly one upstream commit since my v9 approval anchored `REQ sha256:5f3e8051…`:
`e12b78fd8` *"REQ v1.7 erratum — decide REQ-STATS-06 out-of-catalogue basename as harvested"*,
+12/-3 lines in two places — REQ §0's changelog (version 1.6 → 1.7 plus a five-line erratum note)
and REQ-STATS-06's closing predicate paragraph. FSPEC did not move: HEAD measures
`c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, byte-identical to the
`UPSTREAM-STATE` pin my v9 carried. REQ at HEAD measures
`f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, matching the dispatch attestation.

**The substantive change, in one line.** REQ-STATS-06's clause *"the predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is **a
survivor** even where REQ-STATS-03 reports it malformed"* is **withdrawn**. In its place REQ now says
the predicate is evaluated over exactly the file set the process side sums, so an out-of-catalogue
basename *"contributes no process bytes and counts as no file of its family remaining: a feature
whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**"*. The clause was
decided, not reconciled — withdrawn as dissenting from REQ-STATS-06's own rationale, REQ-STATS-03's
malformed classification of the same basename, and C-5.

**What that means for this TSPEC, product lens.** TSPEC §4.3 already implements the harvested reading
(it follows FSPEC BR-16 v1.7, its immediate upstream). So the *behaviour* this document specifies is
now, at HEAD, exactly what REQ requires: no type, signature, exit code, oracle or code sketch is
wrong. The problem is elsewhere and it is real: **TSPEC's live text says this question is contested
upstream, and quotes REQ verbatim for a clause REQ no longer contains.** The dispute TSPEC routes to
the owning phase has been settled — in favour of the side TSPEC already implements. A document that
tells its downstream a P0 acceptance criterion's expected value is provisional, when upstream has
decided it, is no longer a faithful compression of upstream (DEC-ERR-03). That is F-01 below, and it
is mechanical: TSPEC itself names the exact sites that re-stamp.

I re-read my v9 cross-review, diffed `e12b78fd8` in full, re-read REQ-STATS-06 and FSPEC BR-16 at
HEAD, and re-read only the TSPEC regions those clauses bear on (§0 changelog, §4.3's ratio passage,
§8.3). Nothing else was read or re-litigated.

## Architecture

**Does the design still trace to REQ as REQ now stands?** Yes — and on the settled question it now
traces more cleanly than it did.

TSPEC §4.3's harvested test is asked over BR-14's grammars: `crossReviews` is grammatical membership
(`parseReviewFilename(...).ok`), so the disjunct asks whether any grammar-passing cross-review
remains, not whether any basename starting `CROSS-REVIEW-` remains. Separately, §4.3 states that a
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` file "contributes **neither** side" of the byte ratio. Put those
together and the design says: an out-of-catalogue basename adds no process bytes and leaves no file
of its family remaining. That is REQ-STATS-06 v1.7's new sentence, clause for clause. The predicate
REQ now mandates and the predicate §4.3 implements are the same predicate.

So the erratum lands *no* new obligation on this layer. Nothing in §4 must be redesigned, no branch
order changes (harvested still precedes the zero-denominator test, BR-16's stated precedence), and
the `if (harvested && (crossReviews.length === 0 || dodReviews.length === 0))` sketch is untouched by
the decision.

**What the erratum does invalidate is TSPEC's account of its own upstream.** Three passages describe a
live REQ-versus-FSPEC conflict:

- §0's v1.6 changelog entry (b) — `TSPEC:51-55` — "**REQ-STATS-06 v1.6** now calls a grammatical
  basename outside the driver's catalogue **a survivor**, which contradicts BR-16's 'reports
  `harvested`' … §8.3 carries it as the second open erratum (routed, not repaired)."
- §4.3's paragraph "**What the shape itself yields is contested upstream and is not decided here**" —
  `TSPEC:790-799` — which quotes the withdrawn clause verbatim and concludes "Both cannot hold."
- §8.3's second erratum bullet — `TSPEC:1308-1321` — "**REQ-STATS-06 (v1.6) and FSPEC BR-16 (v1.7)
  now disagree** …", again quoting the withdrawn text.

All three are, at HEAD, false statements about REQ. The quoted sentence does not exist in
`REQ-pdlc-stats.md`; REQ v1.7 states the opposite. This is the finding.

**§8.3's own rule decides how to handle it.** That section's preamble already removed three erratum
bullets on exactly this ground: "an erratum bullet whose upstream answer has landed re-routes a
settled question, which is `DEC-ERR-01`'s anti-pattern, and costs a round on something upstream has
already decided." The second bullet is now such a bullet. TSPEC's own policy says to close it and
restate §4.3's behaviour as the specified behaviour it is.

## Interfaces

No interface claim moved. REQ v1.7 adds no verb, no flag, no output token and no exit code; its
erratum note states "one clause decided, no rule added" and "No other change", and the diff bears
that out (§0 changelog plus one paragraph, nothing else).

Checked specifically, because these are the product-visible seams REQ-STATS-06 owns:

| Seam | REQ v1.7 requirement | TSPEC at HEAD | Still faithful? |
|---|---|---|---|
| Ratio outcome vocabulary | `harvested`, not-available, or a measured ratio; tokens per mode are FSPEC material (O-1) | §5's `state: "measured" \| "harvested" \| "unavailable"` | Yes — unchanged, and REQ still delegates tokens to FSPEC |
| Harvested precedence | harvested reported rather than a value that "would silently undercount" | §4.3: harvested disjunct evaluated before `specBytes === 0` | Yes |
| Out-of-catalogue basename, byte side | "contributes no process bytes" | §4.3: the file "contributes **neither** side" | Yes |
| Out-of-catalogue basename, remaining-file side | "counts as no file of its family remaining" → **harvested** | §4.3: `crossReviews` is grammatical membership, so it does not count as remaining | Yes, in the sketch — but §4.3's prose says the opposite is arguable (F-01) |
| Malformed reporting of the same basename | REQ-STATS-03 reports it malformed (C-5) | §5's `malformed: string[]`; §7.2 AT-09 lists the four such basenames with `reason: "bad_doc_type"` | Yes — and REQ v1.7 now explicitly cross-references this, where v1.6 set it in tension |

The last row is worth naming as a gain rather than a risk: REQ v1.6 had the same basename
simultaneously *malformed* (REQ-STATS-03) and *a survivor* (REQ-STATS-06). TSPEC has always reported
both facts — malformed in `malformed[]`, absent from `crossReviews` — which was coherent only under
BR-16's reading. REQ v1.7 makes that coherence upstream-sanctioned rather than a layer-local choice.

## Data Model

Nothing in §5 is disturbed. `RatioState`'s three-valued `state` union, `DodRounds`, `malformed:
string[]` and the five-key JSON literal all predate the erratum and none of them carried a
discriminator for the contested scoping — which is precisely what §4.3 asserted when it wrote "No
type, signature, exit code or other oracle depends on the outcome." That claim was true and the
decision confirms it: the settled question changes no field, no union member and no rendered key.

I re-verified the one place where a decision *could* have leaked into data: §5's `malformed` entries
carry `reason: "bad_doc_type"` for the out-of-catalogue form, and `crossReviews` is a separate
grammar-filtered set. The two sets stay disjoint under REQ v1.7 exactly as under BR-16. No
re-stamp is needed anywhere in §5.

## Test Strategy

Product lens on tests is narrow: does an acceptance criterion still have a test whose expected value
is the one REQ requires? Here, one row matters.

**FSPEC AT-17's fourth leg** is the single place the settled scoping becomes an assertion — TSPEC
§4.3 says so itself (`TSPEC:805-806`: "This leg's expected value is the single place the contested
scoping above becomes an assertion"). The leg's fixture is `LEARNINGS-{feature}.md` present,
`CODE_REVIEW` files intact, and the out-of-catalogue form as the only `CROSS-REVIEW-` basenames.
TSPEC carries it as **`harvested`** — BR-16's value.

At HEAD that is now also REQ's value. The leg is correct and needs no change. What needs changing is
the sentence around it: §4.3 currently annotates the leg "expected `harvested` on BR-16's reading,
and `measured` on REQ-STATS-06 v1.6's … the row to re-stamp if the reconciliation lands the other
way." There is no other way left to land. Leaving that annotation live tells `te-author` and the
implementer that a P0 acceptance test's expected value is provisional, which invites either a
defensive re-derivation or an actual flip during implementation. This is the downstream cost that
makes F-01 High rather than cosmetic.

No other test obligation moves. `PROP-RATIO-08` leg 4 and AT-17 already assert `harvested`; AT-15's
neither-list pins the byte half, which §4.3 correctly noted was never in dispute (neither reading
gave the file spec-side bytes). AT-09's four-file `bad_doc_type` count and §6.1's measured baselines
for `docs/completed/pdlc-advisory-wave-gate/` (62 `CROSS-REVIEW-*`, 4 out-of-catalogue, 58
grammatical, so a **measured** ratio) are untouched — that directory holds grammar-matching
cross-reviews alongside the malformed shape, so it never depended on the contested clause.

## Open Questions

**§8.3's open-erratum ledger is now one item too long.** Of the two bullets it carries:

- **FSPEC BR-26/EC-10's missing feature-recognition predicate** — still genuinely open. FSPEC did not
  move this round; §4.4's leading-underscore discriminant remains provisional on it, and RK-5's
  mitigation stands. No change.
- **REQ-STATS-06 versus FSPEC BR-16** — **closed by `e12b78fd8`**, in favour of BR-16. Per §8.3's own
  preamble rule, this bullet should be removed rather than left standing, with §4.3 restating the
  behaviour as specified rather than contested.

That is the whole of the cascade. I found no other TSPEC claim that leans on REQ text the erratum
touched: I grepped the document for the withdrawn clause's vocabulary (`survivor`, `contested`,
`REQ-STATS-06 v1.6`, `re-stamp`) and every hit falls inside the three sites named in F-01, plus
§0's grounding line at `TSPEC:39` and `TSPEC:20` (F-02). Nothing in §1, §2, §3, §6, §7's other rows
or §8.1/§8.2 cites the moved paragraph.

**One question I am deliberately not raising as a finding.** REQ v1.7 phrases the predicate as
"evaluated over exactly the file set whose bytes the process side sums", which binds the harvested
test and the numerator to one file set. TSPEC §4.3 already derives both from BR-14's grammars, so it
satisfies this. I note it only because it is the one place where REQ's new wording is *stronger* than
its old wording, and a future edit to §4.3 that decoupled the two sets would now violate REQ
directly rather than merely diverge from BR-16.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | TSPEC presents the out-of-catalogue basename question as an open REQ-versus-FSPEC dispute and quotes REQ's withdrawn "a survivor" clause verbatim in three places. REQ v1.7 decided it in favour of BR-16/`harvested` — the side §4.3 already implements. Re-stamp the three sites TSPEC itself names and close the §8.3 bullet per that section's own DEC-ERR-01 rule. No behaviour changes. | §4.3 ratio passage (`TSPEC:790-806`), §8.3 second bullet (`TSPEC:1308-1321`), §0 v1.6 changelog (b) (`TSPEC:51-55`) |
| F-02 | Medium | delta | local | §0's grounding attestation pins upstream at "FSPEC v1.7 / REQ v1.6" and states "no upstream decision is absorbed this round". REQ is v1.7 at HEAD and a decision was absorbed. v1.6's changelog was corrected for exactly this failure mode — citing a hash without diffing it against the previously grounded version — so the pin should move with the re-stamp. | §0 changelog (`TSPEC:20`, `TSPEC:39`) |

FINDING: High | delta | local | §4.3 ratio passage / §8.3 second erratum bullet / §0 changelog (b) | TSPEC states the out-of-catalogue cross-review basename question is contested upstream and quotes REQ-STATS-06 v1.6's withdrawn "a grammatical basename outside the driver's document-type catalogue is a survivor" clause verbatim; REQ v1.7 (commit e12b78fd8) withdrew that clause and now requires harvested, the value §4.3 and AT-17 leg 4 already carry, so the three sites TSPEC names for re-stamp must re-stamp and the §8.3 bullet must close as settled.
FINDING: Medium | delta | local | §0 changelog grounding attestation | §0 pins upstream at "FSPEC v1.7 / REQ v1.6" and claims no upstream decision is absorbed; REQ is v1.7 at HEAD and one decision was absorbed, so the grounding line is stale.

Both findings are `delta`: `e12b78fd8` is what made these sentences false. Both are `local`: they sit
in the exact passages the upstream edit bears on, and §4.3 pre-declares them as the sites that move
when the dispute settles. Neither is a design change — no type, signature, exit code, oracle, code
sketch or acceptance-test expected value moves.

**Scope tags for harvest.** F-01 is `Process` — the durable signal is that a TSPEC which correctly
routes an upstream dispute must also be re-stamped when the dispute settles, and that the settling
edit lands in the *upstream* document where a bytes-unchanged downstream never notices it. That is
the cascade-confirmation round's whole reason to exist, and it worked here. F-02 is `Local`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | When §4.3's contested paragraph is rewritten, does it keep a one-line record that the survivor reading was raised and withdrawn? I would prefer yes — the same in-place-voiding treatment v1.7's changelog gave the stale `six → seven` count — so a later reader does not re-raise it. Not blocking; either treatment satisfies REQ. |
| Q-02 | Does closing this leave §8.3 with a single open erratum (BR-26/EC-10)? If so its "**Two remain open**" count word moves to one, which is the kind of count that goes stale in silence. |

## Positive Observations

- **The design was already right, and right for a stated reason.** §4.3 chose BR-16 — its immediate
  upstream — and refused to guess the reconciliation. REQ has now landed on that side. Implementing
  the nearest upstream and routing the conflict, rather than picking the reading the author preferred,
  is exactly what kept this erratum from becoming a rework.
- **The blast radius was pre-declared and it held.** §4.3 wrote "exactly three things here re-stamp —
  this paragraph, BR-16's version pin above, and AT-17's fourth-leg expectation." I checked the whole
  document against that claim and it is accurate; F-01 is a re-stamp of precisely that list plus the
  §8.3 bullet it also named. A document that states its own contingency footprint in checkable terms
  makes a cascade confirmation cheap, and this one did.
- **"No type, signature, exit code or other oracle depends on the outcome" was a true claim.** It is
  the sentence that lets me say with confidence that a P0 acceptance criterion is unaffected by an
  upstream reversal. Isolating a contested reading to prose plus one expected value, rather than
  letting it reach the type layer, is good defensive design.
- **§8.3's preamble already contains the rule that resolves this round.** The three bullets it removed
  when their answers landed set the precedent, with the reasoning written down (`DEC-ERR-01`'s
  anti-pattern). The remediation needs no new judgement — the document tells the author what to do.
- **The malformed/survivor tension is now resolved in the direction TSPEC's data model always
  reported.** `malformed[]` carrying the basename while `crossReviews` excludes it was coherent only
  under the harvested reading; REQ v1.7 makes that coherence upstream-sanctioned.

## Recommendation

**Needs revision** — one High finding, mechanically bounded.

To close, exactly:

1. **§4.3** (`TSPEC:790-806`) — rewrite "What the shape itself yields is contested upstream and is not
   decided here" as settled: REQ-STATS-06 **v1.7** and FSPEC BR-16 v1.7 agree that an out-of-catalogue
   `CROSS-REVIEW-{role}-REVIEW-v{N}.md` contributes no process bytes and counts as no file of its
   family remaining, so a directory holding only those reports `harvested`. Drop the withdrawn
   "survivor" quotation. Move the REQ pin to v1.7.
2. **§4.3's AT-17 annotation** (`TSPEC:804-807`) — state the fourth leg's expected `harvested` as
   specified by both upstreams; remove "the row to re-stamp if the reconciliation lands the other way".
3. **§8.3** (`TSPEC:1308-1321`) — remove the second erratum bullet as closed at REQ v1.7 / FSPEC v1.7,
   per the section's own preamble rule, and move its "**Two remain open**" count to one (Q-02).
4. **§0** (`TSPEC:20`, `TSPEC:39`) — move the grounding pin to REQ v1.7 and record this round's
   absorbed decision (F-02), replacing "no upstream decision is absorbed this round".

Nothing else. No type, signature, exit code, oracle, code sketch, acceptance-test expected value or
count outside §8.3's "two" changes, and no previously approved section is reopened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
