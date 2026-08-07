# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v7.0)
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `26c9e15` (the commit at which my v6 was written); diff
`26c9e15..HEAD` — 50 insertions, 18 deletions across 6 FSPEC commits. Only the changed sections were
re-read for new issues.

## Prior findings — disposition

All five v6 findings and all three v6 questions were re-checked against the revision and, where they
made a claim about HEAD, against the code. **All eight are closed as filed.** This is the sixth
consecutive round in which every prior item was addressed rather than argued with, and the first in
which the repairs did not manufacture a Medium in the text they rewrote.

| v6 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — AT-F21's stated falsifier for the middle prohibited behaviour was inverted, and the fixture never pinned `E`'s `action` | **Resolved as filed, on all three points.** The Given now gives `E` **`action: retire`** missing `route` and has the later pass derive a **`retire`** proposal for the same pair, so §6.4's carrier is actually consulted rather than the conjunct being vacuous (`:2060`). The unsafe default is restated as a **non-`degraded`** one (`route ?? "constraints"`, or any value outside `degraded`), and the conjunct mapping is now spelled explicitly and asymmetrically: halt ⇒ (1), non-`degraded` default ⇒ (3), silent rewrite ⇒ (4), and `route ?? "degraded"` is named as the **fourth reachable default that is not unsafe on either reader** and caught by (2) alone. I re-derived all four against the predicates: BR-33c (`:2454`) closes `E` on a `retire` with `route` other than `degraded`, and BR-25 reads the pair `enacted` on the same condition — so (3) is red on exactly that default and green on `degraded`, which is what the row now says |
| F-02 (Medium) — §8.1's reader table declared itself the enumeration and omitted §8.6, which the paragraph directly beneath it names | **Resolved as filed, and the arm is not §5.1's.** The table gains a **§8.6 remediation routing** row (`:1142`) whose arm is argued from the differing state — a remediation has already been *chosen* by §8.5 and has nowhere to go, so it is not routed on a guessed path and is re-proposed later — which is the distinction I said was not obvious. The lead is now an explicit set-equality claim naming all seven readers (`:1134-1137`), and E-12b's field list reads `target` for **`§5.1 / §8.6`** (`:2507`) |
| F-03 (Medium) — O-C8's subject-axis compensation was obliged by no rule and asserted by no test | **Resolved by the repair I recommended first, not by withdrawing the claim.** §10.4 item 4 is widened (`:1774-1781`): any promotion whose merge invoked the subject tie-break names, beside the surviving `artifact`, **every** canonical subject path the tie-break elided — with the reason stated (the id is one, BR-35a runs on the survivor, §8.3 carries the survivor). O-C8 (`:2128`) is rewritten to point at that obligation and **explicitly withdraws** the `symptom` claim ("It is not carried by the merged `symptom`, which §8.1 pins as one non-keying line"). BR-33b carries it (`:2453`), and AT-R6b fixture 2 gains the conjunct naming the literal elided path `pdlc/skills/a/b.md` |
| F-04 (Low) — §6.5's closed-read-set paragraph was scoped to no domain and its `gh pr list` example contradicted the PR seam's obliged `read-pr` | **Resolved as filed.** `:937-943` now opens "**On the two git rows** …", states the scope in its own sentence, names `read-pr` as the PR seam's obliged verb resolving a `gh pr list`, and swaps the third example for `git show` |
| F-05 (Low) — the tie-break's key word "normalised" was §8.1's word for the transform that makes its candidates identical | **Resolved as filed, with the parenthetical I asked for.** `:1281-1285` now says "byte order over the **canonical** root-relative paths of §8.1, i.e. each candidate's `artifact` value **as written**, before any slug substitution", and names the collision explicitly |
| Q-01 — is the precedence rule scoped to one `action`? | **Answered in the document, in the direction I flagged.** `:1232-1235`: the precedence rule is scoped to one `action` because the merge is; a `promote` and a `revise` over one subject at one phase are two keys, no merge fires, and **both writes happen — including a guard-set one**; consequence 2 is therefore an absolute about *merged* records only |
| Q-02 — does AT-F21 reuse AT-F19's computation or its fixture? | **Answered: its own fixture, its own set-equality.** The conjunct now reads "asserted as a set-equality over this fixture's ids in AT-F19's form, not as containment" — the stronger of the two readings. What the fixture does not yet pin is the *expected set* itself; filed as L-03 below, not as a reopening |
| Q-03 — is `unavailable` a literal or prose? | **Answered, and settled the layer question rather than inventing a literal.** `:1146`: the cell "carries **no path** and is rendered as an explicit unavailable statement rather than as an empty cell or a guessed path (§10.4's receive-side totality, DC-01)", and "'Unavailable' is the **observable**, not a literal this document pins — the spelling of that cell is TSPEC's, per DEC-LAYER-01, and §15.2's lexicon owns no such value." Both cited authorities exist and say what is claimed: `docs/_constraints/DOMAIN-CONSTRAINTS.md:20` (DC-01, closed and total across a component boundary) and `docs/_decisions/DECISIONS-spec-layer-boundary.md:10` |

## Findings

All findings below are in sections the revision changed, or are made visible by text it added.
Nothing unchanged since v6 is re-litigated. **No High or Medium finding is open.** Three of the five
Lows are of classes `DEC-LAYER-01` (`docs/_decisions/DECISIONS-spec-layer-boundary.md:21-33`)
assigns to TSPEC or PROPERTIES; per that decision's review consequence (`:35-39`), a finding of one
of those classes whose downstream owner is named is **Low, deferred and tracked**, not a blocking
Medium — and in every case here the FSPEC does state the observable, which is the part that stays
blocking at this layer. I applied that bar deliberately rather than by default, and say so per
finding.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **§8.1's reader table omits `passId` from §6.4's indexed-field column, and §6.4 demonstrably indexes it.** The new lead makes the table a set-equality claim — ""For that contract" is per field, per reader — the enumeration, so no reader is left to infer its own arm" (`:1133-1137`) — so the *field* column carries as much weight as the row list. The §6.4 row lists `failure-mode-id`, `action`, `route` (`:1143`). But §6.4's consuming-repo carrier does not merely decide `enacted`; it writes the evidence, and §10.3's field table pins that evidence as `pass:{passId}` — "the literal prefix `pass:` followed by **the enacting record's `passId`**" (`:1710`), which AT-Q10 asserts as literal text (`:2020`). The enacting record is exactly the sort of earlier-pass record E-12b contemplates being short a field, so a record missing `passId` leaves §6.4 with a suppression it has decided and cannot spell. As the table reads, §6.4 does not index `passId` ⇒ does not skip on it ⇒ writes something — and `pass:undefined` is precisely the guessed default `:1127-1128` forbids. The **observable is nevertheless decided** by the general rule one paragraph up (parse notice, skip that contract, never a guessed default ⇒ no suppression ⇒ re-proposed, the direction NFR-4 already sanctions), which is why this is Low and not Medium: the per-field reader index is DEC-LAYER-01's second bullet (TSPEC-owned) and the FSPEC's own generic statement covers the case. Repair is one cell: add `passId` to the §6.4 row's field list. | §8.1 `:1133-1147`, §10.3 `:1710`, AT-Q10 `:2020` |
| F-02 | Low | Local | **AT-F21's new set-equality conjunct has no transcribable expected set — the fixture pins neither `F`'s `action` nor the well-formed record's `action`/`route`.** Conjunct (3) now says `E` is "**present** in the open-promotion list §8.4 step 1 computes, asserted as a set-equality over this fixture's ids in AT-F19's form, not as containment" (`:2060`). That is the strengthening I asked for in v6 Q-02, and it is the right shape. But a set-equality needs a literal expected set, and AT-F19 supplies one (`{B, C, D}`) precisely because its Given pins all four ids' `action` and `route`. Here the Given pins only `E`'s (`action: retire`, `route` missing). `F`'s record is described solely as "missing `target`", and the third record only as "well-formed" — and membership of the open list is decided by BR-33c on `action` and `route` alone (`:2454`), so the expected set is `{E, …}` with two undetermined members. A test author cannot transcribe it; one who writes `{E}` and one who writes `{E, F, G}` both claim conformance. Fixture construction and set-equality domains are DEC-LAYER-01's fourth bullet (PROPERTIES / the AT layer, te-review's call there), which is why this is Low — the observable and the oracle *form* are both stated. Repair is one clause in the Given: give `F` and the well-formed record an `action` (and the latter a `route`), which makes the expected set literal. | AT-F21 `:2060`, AT-F19 `:2058`, BR-33c `:2454` |
| F-03 | Low | Local | **§8.1's normativity sentence still enumerates four readers, one paragraph above the table now declared set-equal to seven.** `:1081-1085` reads "**This table is normative for the record's shape** — every other section that reads a field off a failure-mode record (§5.1's routing predicate, §6.4's consuming-repo carrier, §8.4 step 1, §10.2 order 2) reads it from here". "Every other section … reads it from here" with a four-member parenthetical is an enumeration by construction, and the reader table fifty lines later names **seven** (`:1139-1147`) — §8.3, §8.5 and §8.6 are absent from the earlier list. This is unchanged text, so I am not reopening it; it is the *new* set-equality lead that puts the two enumerations of one set side by side and makes the mismatch checkable. It is also not the same defect as v6's F-02: no arm is left to infer here, since the table below is explicitly normative and complete. The cost is that a TSPEC author who transcribes the earlier parenthetical builds four readers. One-word repair: make the parenthetical "e.g." or extend it to the table's seven. | §8.1 `:1081-1085` vs `:1133-1147` |
| F-04 | Low | Local | **Two BR rows' AT columns now overclaim relative to the coverage the revision explicitly moved to PROPERTIES.** The revision correctly narrows two coverage claims where a fixture does not exist: §8.2's third note says AT-R6b "**cannot** assert the `target`-follows clause" because its colliding fixture is kind 2 on both sides, and names that case PROPERTIES-owned (`:1300-1307`); E-12b likewise splits its AT cell, giving AT-F21 the `route` and `target` arms and naming the `artifact` arms PROPERTIES-owned (`:2507`). Neither narrowing propagated to §18 (the business-rule tables). **BR-33b** still states the `target`-follows half of the tie-break and cites "AT-R6b (fixture 2 for the subject tie-break; …)" with no split (`:2453`); **BR-33a** states the whole reader-side rule and cites "**AT-F21** (the reader half)" (`:2452`) although the `artifact` arms of that rule are now unfixtured here. §18's stated purpose is that every rule names what falsifies it, so an unqualified AT citation for a half-covered rule is exactly the drift this table exists to prevent — and the document has now shown twice this round that it knows how to write the qualified form. Repair: mirror E-12b's split into both AT columns. | BR-33a `:2452`, BR-33b `:2453`, §8.2 `:1300-1307`, E-12b `:2507` |
| F-05 | Low | Local | **§6.5's new closing sentence tells the reader a widening is "made here" and then that it is a TSPEC decision.** `:943-948`: "a pass that needs a third **git** read verb … is a change to this table, **made here**, not a reading of it. "Made here" is a statement about which layer owns the **decision**, not about which document a later widening is written in: under DEC-LAYER-01 the seam verb permitted-sets are TSPEC's to transcribe and, with a recorded reason, to widen — this table is the frozen statement TSPEC inherits, so a widening is a **recorded TSPEC decision** against this set". The gloss says "made here" names the layer that owns the decision, and the very next clause says the decision is TSPEC's — so the gloss falsifies itself on its own reading. DEC-LAYER-01's third bullet is unambiguous ("**Seam verb permitted-sets** … — TSPEC", `:30`), and the operative content of the paragraph — this table is the frozen set TSPEC inherits, and a widening is a recorded TSPEC decision against it, never a silent reading — is both correct and sufficient. Repair: drop "made here" from the first sentence and keep the second; nothing else changes, and the oracle the paragraph protects (a transcribed closed set) is untouched. | §6.5 `:937-948`, `DECISIONS-spec-layer-boundary.md:30` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §10.4 item 4's subject-axis clause obliges the report to name "**every** canonical subject path the tie-break elided" (`:1774-1776`). §8.2's tie-break selects the lexicographically first of the candidates, and §8.2 consequence 1 already contemplates a merge "of **three** failure modes under one key" (`:1256-1257`) — so the elided set can have more than one member. AT-R6b fixture 2 asserts the two-candidate case (one elided path, named literally). Nothing in §13 exercises three, and nothing needs to at this layer — but is the three-candidate case in scope for the PROPERTIES row §8.2's third note already opens (the two-process-learning colliding merge)? If so, one clause naming it there would keep the whole tie-break surface under one downstream owner rather than two. |
| Q-02 | E-12b now names the `artifact` arms PROPERTIES-owned (`:2507`) and §8.2's third note names the `target`-follows clause PROPERTIES-owned (`:1300-1307`). Both are the right call under DEC-LAYER-01. Is there a place in this document that collects those deferrals — the way §14.4 collects errata — so the PROPERTIES author inherits a list rather than a grep? Two are easy to carry in the head; the count rose from zero to two in one round, and §14.2 ("Open questions — decided here, recorded for review", `:2117`) is the nearest existing shape. |
| Q-03 | AT-F21's Given has the later pass "re-derive `F`'s promotion", and conjunct (3)'s `F` arm asserts a set of negatives — not routed, no write on its behalf, no `route` guessed, no §8.6 remediation — with "re-proposed on a later pass" as the positive. That positive is not observable inside the pass under test. The pairing is nonetheless satisfied on the same path by conjunct (2)'s parse notice naming `F`, and by conjunct (1)'s terminal status, so the row is not an absence-only oracle as it stands. Is the intent that (2) is the positive for `F`'s arm? If so it is worth half a clause, because the arm currently reads as if "re-proposed on a later pass" were the assertion, and a test author may go looking for a second-pass fixture the row does not require. |

## Positive Observations

- **AT-F21's repair fixed the reasoning *and* the fixture, and then went one step past what I
  asked.** I asked for three things: restate the middle prohibited behaviour as a non-`degraded`
  default, give `E` a `retire` record so the open-list conjunct is not vacuous, and reassign the
  conjunct mapping. All three landed. What was not asked for is the fourth line: the row now names
  `route ?? "degraded"` explicitly as a **reachable default that is not unsafe on either reader** —
  it leaves `E` open and the pair `absent`, the same outcome the skip rule produces — and assigns it
  to conjunct (2) as "an implementation that defaults silently instead of reporting the notice".
  That is the honest version of a conjunct map: it says which behaviours are caught where, *and*
  which behaviour is caught only by the notice. My v6 finding was that "each is red on exactly one"
  was false; the repair did not weaken the claim to "each is red on at least one", it enumerated the
  four cases and stated the asymmetry. I re-derived all four against BR-33c (`:2454`) and BR-25
  (`:2433`) and the mapping is now correct in both directions.
- **The §8.6 reader row argues its arm from the state rather than copying §5.1's.** The cheap repair
  to my v6 F-02 was one row reading "as §5.1". Instead `:1142` spells why the state differs — a
  remediation has already been *chosen* by §8.5 and has nowhere to go, which is not the same as a
  promotion that was never routed — and lands on the same safe direction by a different argument
  ("not routed on a guessed path — neither the PR route nor the proposal file is picked by default").
  Sitting beside §8.5's row, the two now read as one policy applied at two points: never guess a
  path, never guess a `retirement`, let the notice be the report.
- **§10.4 item 4's widening states why the subject axis is the load-bearing one, not merely that it
  is symmetric.** "The two axes are one rule read twice" would have been enough to close F-03. The
  revision adds the asymmetry that matters (`:1778-1781`): on the kind axis the elided content still
  exists as a re-proposable proposal, but on the subject axis **the id is one**, BR-35a's
  file-existence test runs on the survivor only, and §8.3's row carries the survivor — "the report is
  the operator's only handle on the elided one". That is a blast-radius argument for a report line,
  which is a rare thing to find written down.
- **Two coverage claims were narrowed rather than defended.** §8.2's third note now says outright
  that AT-R6b "**cannot** assert the `target`-follows clause" — its fixture is kind 2 on both sides,
  so `target` is a function of the id and invariant under the tie-break — and hands the case to
  PROPERTIES with the observable it owes stated (`artifact` and `target` are the same path on the
  merged record). E-12b splits its AT cell the same way for the `artifact` arms. Both are places
  where the easy move was to leave the citation unqualified and let a reviewer not notice. F-04 is
  that the same split has not yet reached §18's BR rows — a propagation lag, not a retreat.
- **Every code and upstream citation in this round's diff is exact — re-verified at HEAD.**
  `MERGE_GUARD_DEFAULTS` is `Object.freeze` over four members with `pdlc/workflows/` first at
  `pdlc/workflows/orchestrate-dev.js:48-53`; `readHeadBranch` is at `:3520` and issues
  `_git(["rev-parse", "--abbrev-ref", "HEAD"])` at `:3524`. The vocabularies `suppressed-by:` row is
  verbatim at `docs/_constraints/pdlc-consolidation-vocabularies.md:63` — still `` `{id}:{action} →
  PR URL` entries, or empty ``, so ER-5 remains correctly open. Both new authority citations resolve:
  `docs/_decisions/DECISIONS-spec-layer-boundary.md:10` (DEC-LAYER-01) and
  `docs/_constraints/DOMAIN-CONSTRAINTS.md:20` (DC-01), and each says what the FSPEC says it says —
  DEC-LAYER-01's third bullet does assign seam verb permitted-sets to TSPEC (`:30`) and its fourth
  does assign fixture construction and set-equality domains to PROPERTIES (`:31-33`). Third
  consecutive round with no citation drift.
- **The version bump is honest.** `7.0`, not `6.2`: this round changed a report obligation
  (§10.4 item 4), a business rule (BR-33b) and an edge-case row (E-12b), which is a contract change,
  not an editorial pass. Documents that bump their own minor for a rule change are how the pinned-
  version oracles downstream stay meaningful.

## Recommendation

**Approved with minor changes**

All five v6 findings and all three v6 questions are closed as filed — the sixth consecutive round in
which every prior item was addressed rather than argued with. **No High finding remains, and none has
since v3. No Medium finding remains either**, which is the first time in this window. What is open is
five Lows, every one of them a correction of record inside text this round added or made checkable,
none of them blocking a downstream author from deciding anything today:

1. **F-01 — add `passId` to the §6.4 row's field list** in §8.1's reader table. The carrier writes
   `pass:{passId}` evidence (§10.3 `:1710`, AT-Q10 `:2020`), so it indexes a field the table does not
   list. The observable is already decided by the section's general rule; this is the per-field index
   DEC-LAYER-01 assigns to TSPEC.
2. **F-02 — give AT-F21's `F` and its well-formed record an `action`** (and the latter a `route`), so
   the new set-equality conjunct has a literal expected set the way AT-F19's `{B, C, D}` does.
   Fixture construction is PROPERTIES-owned per DEC-LAYER-01; the oracle *form* is correctly stated.
3. **F-03 — reconcile §8.1's four-reader parenthetical (`:1082`) with the seven-reader table**
   (`:1139-1147`). One word ("e.g.") or three added references.
4. **F-04 — propagate the two coverage narrowings into §18.** BR-33a and BR-33b still cite AT-F21 and
   AT-R6b unqualified for rules whose `artifact` and `target`-follows halves the document has just
   named PROPERTIES-owned; mirror E-12b's split.
5. **F-05 — drop "made here"** from §6.5's closing sentence. The clause that follows already says the
   widening is a recorded TSPEC decision, which is DEC-LAYER-01's answer and is the operative content.

None of the five changes an oracle, a rule's meaning, or a settled decision. I would take all five,
but I do not need to see them before approving: each is a one-clause edit whose direction is stated
above, and a TSPEC author who hit any of them today would reach the same answer from the text already
present.

**No erratum is emitted with this review.** The only upstream defect in scope remains the
`suppressed-by:` value grammar at `docs/_constraints/pdlc-consolidation-vocabularies.md:63`, already
routed as §14.4 ER-5 and re-verified verbatim at HEAD this round; nothing new was found upstream.

## Verdict

No High and no Medium finding is open. Five Low findings (F-01 … F-05) remain, each a one-clause
correction of record. Per the approval rule — Low findings only ⇒ Approved with minor changes — this
iteration **approves** `FSPEC-pdlc-consolidation-agent.md` at version 7.0.

VERDICT: Approved with minor changes
