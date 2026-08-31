# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md
**Date:** 2026-08-30
**Iteration:** 5 (round 5 — upstream-cascade confirmation, PROPERTIES bytes unchanged)

## Overview

**Question answered.** Does PROPERTIES v1.2, which I approved at round 4, still hold as a faithful
compression of its upstream as that upstream now stands? **Yes on substance; no on citation
hygiene.** No property is falsified, no acceptance criterion is narrowed, no requirement has lost
its property, and the routed divergence PROPERTIES itself flagged has now been closed in PROPERTIES'
favour. What is stale is a set of pins, one now-resolved routed item, and three citations into
upstream text that upstream no longer phrases the way PROPERTIES quotes it.

**What moved.** My round-4 approval recorded `UPSTREAM-STATE: PLAN sha256:a8e91304…` and
`UPSTREAM-STATE: TSPEC sha256:b1b603a8…`. At this dispatch:

| Upstream | At my approval | At HEAD | Moved? |
|---|---|---|---|
| REQ | `ce6b133f…` v1.9 | `ce6b133f…` v1.9 | no |
| FSPEC | `2bd5c3ef…` v1.3 | `2bd5c3ef…` v1.3 | no |
| TSPEC | `b1b603a8…` v1.0 | `fc57bc56…` **v1.2** | **yes** |
| DECISIONS | `13aba061…` | `13aba061…` | no |
| PLAN | `a8e91304…` v0.7 | `d1af8e47…` **v0.9** | **yes** |

The dispatch names PLAN only. Per DEC-ERR-03 my scope is this document against its upstream **at
HEAD**, so TSPEC's v1.0 → v1.2 movement is in scope too, and it is where most of what follows comes
from. Neither movement reverses anything PROPERTIES was approved against: TSPEC v1.1/v1.2 sharpen
§7.3 and §4.3, and PLAN v0.9 lands the census-constant correction PROPERTIES had already made and
routed.

**The headline.** PROPERTIES was, at round 3, the document that got the census contract right first:
it re-pinned to TSPEC v1.0's fourteen-member owned list, three test-file census constants, and
§7.2's symmetric-difference conjunct 3, and it routed PLAN v0.7's contradicting fifteen-member form
as an upstream-vs-upstream divergence rather than adjudicating it. PLAN v0.9 has now landed exactly
that correction — six data-carrying names ∪ eight plumbing declarations = fourteen, all three
constants homed in `decisionLedgerCensus.test.js`, T-18 writing no census constant, and T-10a's
conjunct 3 re-pinned to §7.2's referents. **PROPERTIES did not have to move to agree with PLAN;
PLAN moved to agree with PROPERTIES.** That is the strongest possible outcome for this cascade.

The residue is bookkeeping, and all of it is non-gating: the header still pins TSPEC v1.0 / PLAN
v0.7 (F-02, F-03), the §Gaps routed item now describes a divergence that no longer exists (F-01),
and three in-body citations quote §7.3 text that v1.1/v1.2 replaced (F-03, F-04, F-05). One Low
from round 4 (F-08 there) is still open and is re-recorded here as F-06.

## Properties

Checked family by family against upstream at HEAD, looking only for properties that upstream no
longer supports or now supports differently.

**INV family (census) — substance holds, three citations went stale.**

- **PROP-INV-06** asserts the census over `orchestrate-dev.js` minus every member of a
  **fourteen**-member `DECISION_LEDGER_OWNED_DECLS` plus the sentinel-bounded wiring run. TSPEC v1.2
  §7.3 still pins fourteen, and PLAN v0.9 T-11 now carries the same. Substance holds. Two problems
  in how it is said. (a) It attributes the count to "`TSPEC` v1.0" and restates the decomposition
  ("the six functions plus the eight top-level constants") as its own assertion. §7.3 v1.1 added
  *The size of the owned list, stated once*, declared that paragraph the **authority**, and stated
  that "no other section of this document, and **no downstream document**, restates the arithmetic
  as its own assertion; it cites this paragraph instead." PLAN's v0.9 round was made to fix this
  same defect (its PM F-02) and now cites the paragraph by name. PROPERTIES has not been through
  that pass — F-03. (b) It describes the slicer as `loopEconomicsAnchorGuard.test.js`'s `bodyOf`
  over `allTopLevelDecls` with no qualifier. §7.3 v1.1's *Scanned source* row now says the
  precedent's declaration regex "must be widened, not cloned verbatim" — that `DECL_RE` matches
  `function` only, while **eight of the fourteen owned declarations are top-level `const`s**, so a
  verbatim clone leaves each catalogue's body in the remainder and reds the census on its own
  literals. PLAN v0.9 T-11 absorbed this in terms; PROPERTIES did not — F-04.
- **PROP-INV-07** (the partition) holds unchanged: `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` =
  `OWNED_DECLS`, disjoint, both directions, over the fourteen-member list. Its parenthetical
  justification quotes §7.3 as saying "roughly a dozen are declared"; v1.1 replaced that phrase with
  "the fourteen the paragraph above counts" — F-05. The rejection itself (export set-equality is red
  by construction) is unchanged upstream, so this is citation drift, not a substance change.
- **PROP-INV-08** (every slice non-empty) and **PROP-INV-11** (each owned member resolves to exactly
  one top-level declaration) are, by §7.3 v1.1's own words, the two conjuncts that "catch a regex
  that missed a declaration form". Both already exist in PROPERTIES. That is why F-04 is Medium and
  not High: the widened-regex requirement is under-cited, but it is not un-falsified.
- **PROP-INV-09** holds: the `decisionLedger` report field is still not a census token, and its two
  behavioural homes are still §7.2's live composition-root arm. Its "`FSPEC` §7.6" attribution is
  still the mis-citation I raised at round 4 (F-08 there); §7.6 is TSPEC's — F-06.
- **PROP-INV-10** (`MAX_REVIEW_ROUNDS` / `MAX_LIFETIME_ROUNDS` / `MAX_ERRATUM_FOLLOWUP_ROUNDS`
  untouched, REQ NG-5) is unaffected by either upstream move.

**WIRE / OFF families — converged with PLAN, no finding.** PROP-WIRE-12's paired-run symmetric
difference (`report` key sets differing by exactly `{decisionLedger}`, set equality in both
directions) and PROP-OFF-05's "notice set set-equal to **empty**, never compared to a baseline
notices array" are precisely the referents PLAN v0.9 re-pinned T-10a conjunct 3 and its §Definition
of Done bullet to. PROPERTIES was already correct here and needs no edit — this closes my round-4
F-07 (Medium), which routed exactly this divergence to PLAN's author.

**Everything else — CFG, REC, PRE, REND, BND, FAIL, TEXT, DISC.** Neither TSPEC v1.1/v1.2 nor PLAN
v0.9 touches the config grammar, recognition rule, precedence, rendering contract, bounds
arithmetic, fail-open legs or disclosure surface. The four corpus literals (6,305 / 10,859 / 12,059
/ 441) are explicitly unchanged in both TSPEC changelogs, so BND and ORC-03 are unmoved. One
adjacent v1.2 clarification is worth noting and does **not** produce a finding: §4.3 now says the
1,200-byte framing pin covers "four framing **pieces**", of which only two
(`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`) are top-level constants, the header and
trailer shipping as inline literals inside `renderDecisionLedgerBlock`. PROPERTIES' REND/BND
properties assert the pin over **rendered output**, not over a constant count, so they read
correctly against the sharpened wording.

**Requirement coverage.** No REQ acceptance criterion changed (REQ unmoved at v1.9), so the
Coverage Matrix's REQ/FSPEC mapping is unaffected. BR-11 / REQ NG-4 still resolve to
PROP-INV-06/07/08/11 exactly as approved.

## Oracles

The six oracles (ORC-01…ORC-06) are checked against the same question: does any of them lean on
upstream text that has moved?

- **ORC-01 (corpus oracle, whole-line equality, expectations hand-transcribed from the fixture's
  own heading text)** — grounded in the Baseline v1.2 corpus and TSPEC §7.6's non-binding-bounds
  framing. Baseline is unmoved (both TSPEC changelogs re-measure it at v1.2), and PLAN v0.9 does not
  touch T-09. Holds.
- **ORC-02 (citation-resolution chain: parse `sourcePath` and `id` out of the rendered line, re-open
  the file, compare statements, touching no `DecisionRecord` field)** — unaffected by either move.
  Holds.
- **ORC-03 (shipped-default assertions at `maxEntries: 70` / `maxBytes: 12500`, over the whole
  141-record fixture and over the `M-6b` slice)** — depends on the four corpus literals, which TSPEC
  v1.1 and v1.2 both explicitly record as unchanged, and on `DEC-DECLEDGER-13`/`-16`, which
  DECISIONS (unmoved) still carries. Holds.
- **ORC-04 (byte-identity baseline guard, two jobs)** — this is the oracle whose referent PLAN was
  wrong about at v0.7/v0.8 and is right about at v0.9. PROPERTIES already restricts FX-BASELINE to
  the prompt clause alone and forbids it as the referent for key sets or notice arrays; PLAN v0.9's
  T-10a and its Definition of Done bullet now say the same. Converged, no finding.
- **ORC-05 (the bounds property computes its own model rather than reusing the renderer)** —
  untouched by either move. Holds. Note that this is deliberately *not* in tension with
  `DEC-DECLEDGER-11` (which requires `selectDecisions` to obtain `renderedBytes` by calling the
  renderer): the oracle's independent model is the check, the production path is the subject.
- **ORC-06 (replay oracle, anchored so that identical brokenness fails)** — the open-finding ledger
  anchored to a value transcribed from FX-REPLAY. PLAN v0.9 leaves T-10's AT-16 arm untouched.
  Holds.

**The census is not an ORC-* oracle, and that is still the right call.** It is asserted through
PROP-INV-06/07/08/11 as contract-level properties over source text rather than as a behavioural
oracle over a fixture. TSPEC v1.1's widened-regex requirement is a statement about the census
*mechanism*, and the natural home for it in this document is PROP-INV-06's slicing clause — which is
why F-04 lands there and not in this section.

## Fixtures

Five fixtures (FX-CORPUS, FX-PRECEDENCE, FX-FAILOPEN, FX-REPLAY, FX-BASELINE). None is invalidated.

- **FX-CORPUS** — the frozen corpus copy, `DECISION_CORPUS_ARGV`'s four pathspecs against Baseline
  v1.2's `Verified at` commit `8c673a09f`. Baseline unmoved; `DEC-DECLEDGER-14` / D-11's
  never-rewrite discipline unmoved. Holds.
- **FX-PRECEDENCE** — the synthetic two-file corpus for O-5's project-level-wins rule, with the
  positive conjunct (the feature-level statement absent from the whole block) that cardinality alone
  would not catch. FSPEC §3.4 unmoved. Holds.
- **FX-FAILOPEN** — the constructed degradation corpora behind O-6/O-7's `RSN-UNLISTABLE` /
  `RSN-EMPTY` / per-entry `readOk: false` / `emptySources`-not-`failedSources` classification.
  Unmoved upstream. Holds.
- **FX-REPLAY** — the recorded round of reviewer outputs. Unmoved. Holds.
- **FX-BASELINE** — the committed merge-base recording. This is the fixture the whole PLAN erratum
  turned on, and PROPERTIES already carries the correct limit: the §FX-BASELINE non-referent note
  records that the recording captures reviewer-prompt streams **only**, so it holds no `report` key
  set and no baseline notices array and cannot be the referent for PROP-WIRE-12 or PROP-OFF-05.
  TSPEC §7.4 at HEAD is unchanged on this point and PLAN v0.9 now states the same limit in T-10a and
  in the Definition of Done. **Fully converged — this is the single most important thing this
  cascade confirms.**

**Fixture ownership.** The module manifest's census row already homes all three census constants in
`decisionLedgerCensus.test.js`, matching PLAN v0.9's manifest row byte-for-substance. No fixture or
manifest row needs to move for PROPERTIES to agree with PLAN at HEAD.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §7.3 now forbids a downstream document from restating "six ∪ eight = fourteen" as its own assertion. Once F-03 is addressed, should PROPERTIES cite the paragraph **by title** (`TSPEC §7.3, *The size of the owned list, stated once*`) the way PLAN v0.9 does, so the two downstream documents cite it identically? I would prefer yes — a shared citation form is what keeps the next single-siting edit a one-place edit. |
| Q-02 | PROPERTIES' in-body citations still carry version labels (`TSPEC v1.0 §7.3`), while PLAN adopted the `pdlc-wave-resume` lesson at v0.8 and moved version pins to the header row alone. Is the te-author willing to adopt the same convention here? This cascade round is itself the evidence for it: every in-body `v1.0` label went stale in one upstream edit. |

## Positive Observations

- **PROPERTIES was right first, and upstream came to it.** At round 3 this document re-pinned the
  census to TSPEC v1.0's fourteen-member owned list and three test-file constants, and — rather than
  adjudicating PLAN v0.7's contradicting fifteen-member form — routed it in §Gaps as an
  upstream-vs-upstream divergence for the owning phase. PLAN v0.9 has now landed exactly that
  correction, and named the downstream-to-upstream direction the same way. Routing rather than
  adjudicating is what made this cascade a no-substance-change round instead of a re-litigation.
- **The FX-BASELINE non-referent note has now paid for itself twice.** PROPERTIES stated the limit
  (the recording holds prompt bytes only — no `report` key set, no notices array) before PLAN did;
  my round-4 F-07 routed the gap; PLAN v0.9 closes it in T-10a *and* in the Definition of Done
  bullet. That closes F-07 with no PROPERTIES edit.
- **PROP-WIRE-12's both-directions symmetric difference is stronger than what it replaced**, and
  PLAN adopted the stronger form verbatim: a key spuriously added *or* dropped on *either* arm now
  fails. A tautological flag-off key-set equality could never have failed.
- **PROP-INV-08 and PROP-INV-11 pre-empted a defect they were not written for.** TSPEC v1.1 names
  those two conjuncts as the thing that catches a declaration regex that cannot see a `const`. They
  were already in this document. F-04 is therefore a citation gap, not an escaped defect — which is
  a good outcome for a falsifier set.
- **No requirement lost a property and no acceptance criterion was narrowed across two upstream
  version bumps.** REQ v1.9 and FSPEC v1.3 are unmoved, and the Coverage Matrix maps to them
  unchanged.

## Recommendation

**Approved with minor changes**

PROPERTIES still holds as approved against PLAN v0.9 and TSPEC v1.2. No property is falsified, no
requirement is uncovered, no acceptance criterion is narrowed, and the one substantive divergence
this document routed has been closed upstream in PROPERTIES' favour. Nothing here gates Phase P.

Four Medium and two Low items are bookkeeping against upstream that moved after my approval, and are
best folded into the next ordinary revision of PROPERTIES rather than an erratum round of their own:

1. **F-01** — retire the §Gaps routed item; PLAN v0.9 landed it.
2. **F-02 / F-03** — re-measure the header Upstream pins to PLAN v0.9 and TSPEC v1.2, and replace
   the three restatements of "six ∪ eight = fourteen" with a citation of §7.3's
   *The size of the owned list, stated once*.
3. **F-04** — add §7.3's widened-declaration-regex requirement (top-level `const`/`let` alongside
   `function`) to PROP-INV-06's slicing clause.
4. **F-05 / F-06** — drop the retired "roughly a dozen" quotation, and correct PROP-INV-09's
   `FSPEC` §7.6 to `TSPEC` §7.6 (still open from round 4).

## Delta-Confirmation Findings

Provenance legend for this round: **delta** = the PLAN v0.8→v0.9 erratum edit introduced it (or left
a routed item unlanded); **inherited** = it was already in the pre-round bytes — here, staleness
against TSPEC v1.1/v1.2, which landed before this round's PLAN edit and which that edit did not
touch. **Locality:** *local* = the material sits in the sections this document devotes to the census
contract and the routed PLAN divergence, i.e. what the edit changed; *nonlocal* = anywhere else.
No finding is High: every one is citation or bookkeeping drift, none falsifies a property.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §Gaps' second routed item states that "PLAN v0.7 at HEAD says the opposite in five places" and carries a fifteen-member owned list. PLAN at HEAD is v0.9 and carries the fourteen-member form, all three census constants homed in the census test file, and T-18 writing no census constant. The divergence is closed; the routed item now describes a state that no longer exists and would send a reader of §Gaps chasing a resolved contradiction. Retire it and record that it landed in PLAN v0.9. | §Gaps, Risks and Routed Items — routed item 2 (PLAN v0.7 census constants) |
| F-02 | Medium | delta | local | The header Upstream row pins `PLAN-pdlc-decision-ledger.md` **v0.7**. PLAN is at **v0.9** `sha256:d1af8e47…4765a7`, and the v1.2 changelog's item (9) also names v0.7. Re-measure the pin mechanically and update both sites; the pin is what the next cascade round is measured against, so a stale one silently widens the next confirmation's scope. | Header Upstream row; §Revision history v1.2 item (9) |
| F-03 | Medium | inherited | nonlocal | TSPEC is at **v1.2** `sha256:fc57bc56…d4c27504`, not the v1.0 the header and several in-body citations pin. More than the pin: §7.3 v1.1 added *The size of the owned list, stated once*, declared that paragraph the sole authority for the count, and stated that no downstream document may restate the arithmetic as its own assertion — it must cite the paragraph. PROP-INV-06 ("**fourteen** at `TSPEC` v1.0, the six functions plus the eight top-level constants"), PROP-INV-07 ("the same frozen fourteen-member owned list") and PROP-INV-11 ("each of the fourteen members") each restate it. PLAN's v0.9 round fixed this same defect (its PM F-02); PROPERTIES has not had that pass. Replace the restatements with a citation of the named paragraph and re-pin the header to v1.2. | Header Upstream row; §Properties, INV family — PROP-INV-06 / PROP-INV-07 / PROP-INV-11 |
| F-04 | Medium | inherited | nonlocal | PROP-INV-06 specifies the slicer as `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`, with no qualifier. TSPEC §7.3's *Scanned source* row at HEAD requires the precedent's declaration regex to be **widened, not cloned verbatim**: that file's `DECL_RE` is anchored to `function` declarations only, while eight of this feature's fourteen owned declarations are top-level `const`s, so a verbatim clone finds no boundary at a catalogue's declaration line and reds the census on its own literals. PLAN v0.9 T-11 absorbed this in terms. Add the requirement (recognise top-level `const`/`let`, `export`-prefixed or not, alongside `function`) to PROP-INV-06's slicing clause. Medium rather than High because §7.3 itself names PROP-INV-08's non-empty-slice and PROP-INV-11's resolves-to-exactly-one as the conjuncts that catch a missed declaration form, and both already exist here — so this is an under-cited mechanism, not an unfalsified one. | §Properties, INV family — PROP-INV-06, slicing clause |
| F-05 | Low | inherited | nonlocal | PROP-INV-07 attributes to TSPEC §7.3 the parenthetical "roughly a dozen are declared; only six carry decision-record data". §7.3 v1.1 replaced that phrase: the *Forbidden token set* row now cites "the fourteen the paragraph above counts". The rejection PROP-INV-07 encodes (export set-equality is red by construction) is unchanged upstream, so this is a quotation of text upstream no longer says, not a substance divergence. Re-quote or drop the parenthetical. | §Properties, INV family — PROP-INV-07, rejected-form parenthetical |
| F-06 | Low | inherited | nonlocal | PROP-INV-09 states that "`FSPEC` §7.6's AT rows are expressly **not** a home" for `report.decisionLedger`. §7.6 is `TSPEC`'s section; FSPEC's acceptance tests live in its §6/§7. The substance (no AT row's Notes column mentions `report.decisionLedger`) is correct — only the document name is wrong. Raised as F-08 at round 4 and still open; re-recorded here so it is not lost between rounds. | §Properties, INV family — PROP-INV-09 |

FINDING: Medium | delta | local | §Gaps, Risks and Routed Items — routed item 2 | The routed item still says PLAN v0.7 at HEAD carries the opposite census-constant home in five places and a fifteen-member owned list; PLAN at HEAD is v0.9 and carries the fourteen-member form, so the routed divergence is closed and the item now describes a state that no longer exists
FINDING: Medium | delta | local | Header Upstream row; §Revision history v1.2 item (9) | The header pins PLAN v0.7; PLAN at HEAD is v0.9 sha256:d1af8e47…4765a7, and the changelog item (9) names v0.7 too — a stale pin silently widens the next cascade confirmation's scope
FINDING: Medium | inherited | nonlocal | Header Upstream row; PROP-INV-06 / PROP-INV-07 / PROP-INV-11 | TSPEC is at v1.2 sha256:fc57bc56…d4c27504, not the pinned v1.0, and §7.3 v1.1's authority paragraph forbids a downstream document from restating "six ∪ eight = fourteen" as its own assertion — PROP-INV-06, -07 and -11 each restate it instead of citing *The size of the owned list, stated once*
FINDING: Medium | inherited | nonlocal | §Properties, INV family — PROP-INV-06 slicing clause | PROP-INV-06 clones `loopEconomicsAnchorGuard.test.js`'s `bodyOf`/`allTopLevelDecls` unqualified, but TSPEC §7.3 at HEAD requires the precedent's `function`-only `DECL_RE` to be widened to top-level `const`/`let`, since eight of the fourteen owned declarations are consts and a verbatim clone reds the census on its own literals
FINDING: Low | inherited | nonlocal | §Properties, INV family — PROP-INV-07 rejected-form parenthetical | PROP-INV-07 quotes §7.3 as saying "roughly a dozen are declared"; v1.1 replaced that phrase with a citation of the fourteen, so the quotation is of text upstream no longer says
FINDING: Low | inherited | nonlocal | §Properties, INV family — PROP-INV-09 | PROP-INV-09 attributes the non-home AT rows to `FSPEC` §7.6; §7.6 is TSPEC's section and FSPEC's acceptance tests are in §6/§7 — substance correct, document name wrong (round-4 F-08, still open)

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}

APPROVAL-HASH: sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef
APPROVAL-HASH-NORMALIZED: sha256:331c0ae9a79eb82ed54af8a6e48a174accebc836535641c250f86ba043de91c6
REVIEWED-COMMIT: b8d37309477ce8d5727c4a1f71680af334ee97ed
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
UPSTREAM-STATE: PLAN sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63
