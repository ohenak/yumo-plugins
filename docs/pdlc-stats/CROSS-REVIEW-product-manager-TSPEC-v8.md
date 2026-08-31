# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.6, erratum round 6)
**Date:** 2026-08-31
**Iteration:** 8
**Round type:** Delta confirmation (erratum)

## Overview

**Scope.** Three commits since the bytes I reviewed at v7 (`7747eb78f..HEAD`: `3bf753b78`,
`127963b7e`, `4943a8777`), +77/-13 lines in three places — the §0 changelog, §4.3's `BR-16`
paragraph, and §8.3's open-erratum list. I re-read my v7 file, diffed the document, and re-grounded
on REQ / FSPEC **HEAD** (`REQ` v1.6 `sha256:5f3e8051…`, `FSPEC` v1.7 `sha256:c7d2c832…`) rather than
on the round's dispatch list, per `DEC-ERR-03`. I did not re-review unchanged sections.

**Both v7 findings are discharged, and discharged on evidence rather than assertion.**

- **`F-01` (High, inherited) — closed.** §4.3 no longer reads FSPEC `BR-16` as naming
  `docs/completed/pdlc-advisory-wave-gate/` a harvested directory. It now states the citation is a
  basename *shape*, records the HEAD measurement, and re-pins `BR-16` from v1.4 to **v1.7**. I
  measured the archive myself: the directory holds **62** `CROSS-REVIEW-*` files, of which **4** are
  the out-of-catalogue `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` form and
  **58** match `BR-14`'s grammar. §4.3's "62 / 4 / 58, `crossReviews.length` is 58, the harvested
  disjunct does not fire" is exact, and its added sentence — "a real-path test written against this
  directory must expect a measured ratio, not `harvested`" — closes the precise hazard I raised: the
  wrong worked example that would have recommended widening membership to a bare `CROSS-REVIEW-*`
  glob, the mutation `BR-14`/`BR-16` exist to kill.
- **`F-02` (Medium, delta) — closed.** The v1.6 changelog withdraws the false attestation in plain
  terms, names both moves (`FSPEC v1.5 → v1.7`, `REQ v1.4 → v1.6`), and states the mechanism:
  "citing a current hash is not the same check as diffing it against the previously grounded one".
  That is the process lesson `Q-02` asked for, recorded at the site where it failed.

**Nothing I approved at v6 regressed.** The `halts: HaltEntry[]` type, the five-key JSON literal,
§4.3's sketch, §7's expectations, §6's oracles and every count are byte-identical.

**One new Medium and one new Low, both inside the changed passage; no open High.** The round's
handling of the newly surfaced REQ-versus-FSPEC conflict is correct in kind — implement the
immediate upstream, route the reconciliation, do not guess — but it states the conflict's blast
radius narrower than upstream HEAD supports.

## Delta verification — each edit against HEAD

| Edit | Claim | Verified at HEAD | Verdict |
|---|---|---|---|
| §4.3 re-scope | `BR-16` at v1.7 cites the directory for the malformed *shape* only; it carries the four out-of-catalogue files alongside grammar-matching cross-reviews and reports a measured ratio | `FSPEC-pdlc-stats.md` §4.2 `BR-16`: "That basename shape is cited from `docs/completed/pdlc-advisory-wave-gate/`, which carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict" | **Correct**, and quoted faithfully |
| §4.3 measurement | 62 / 4 / 58 | Measured: 62 `CROSS-REVIEW-*`; 4 matching `^CROSS-REVIEW-.*-REVIEW-v[0-9]+\.md$`; 58 remainder | **Correct** |
| §4.3 pin | "`BR-16` at **v1.7**" replaces "at v1.4" | FSPEC header reads v1.7; `BR-16` was revised at v1.6 and v1.7 | **Correct** |
| §4.3 rule statement | The rule itself — harvested evaluated over exactly `BR-14`'s numerator set; a basename failing the grammar contributes no bytes and counts as no file remaining | `BR-16` states this verbatim; unchanged across v1.6/v1.7 | **Unmoved**, correctly restated |
| §4.3 / §8.3 conflict | REQ-STATS-06 v1.6 calls a grammatical out-of-catalogue basename **a survivor**, contradicting `BR-16` | `REQ-pdlc-stats.md`: "The predicate is set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor even where REQ-STATS-03 reports it malformed." C-4's grammar is `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` with `{doc-type}` unconstrained | **Real conflict**, not a reading artefact — see below |
| AT-17 fourth leg | FSPEC-owned; expects `harvested` on `BR-16`'s reading | FSPEC AT-17: the fourth directory holds `CODE_REVIEW` intact plus, as its only `CROSS-REVIEW-` basenames, the out-of-catalogue form; "all four report `harvested` — … the fourth not a measured ratio" | **Correct** |
| §8 trace | FSPEC §8 also maps `BR-16` to `AT-15` | FSPEC §8: `| BR-16 | AT-15, AT-17 |` | **Correct** |
| §8.3 count | "**Two** remain open" | §8.3 lists exactly two bullets (BR-26/EC-10 unclassified predicate; the new REQ-versus-FSPEC item) and correctly distinguishes the live question from closed `E-1` | **Correct** |
| Changelog (c) | §5's types survive REQ v1.6's halt withdrawal — `halts: HaltEntry[]`, no state discriminator, empty array is the measured `0` | REQ-STATS-05 at v1.6: "Where no `POSTMORTEM-{phase}-{feature}.md` file is present, halts report `0`"; REQ R-6 accepts the conflation as residual. TSPEC's type block: `halts: HaltEntry[]; // possibly empty — BR-13, no state needed` | **Correct** — but the block is §4.1, not §5 (`F-02` below) |
| Changelog | REQ moves absorbed: NG-6 rescoped, REQ-STATS-06 predicate reworded | REQ v1.6 changelog and NG-6 text agree | **Correct** |
| Unchanged pins | Other upstream pins re-checked against FSPEC v1.7 | §4.3's `BR-11 at v1.4` pin still accurate (FSPEC v1.5–v1.7 touched §1, BR-06, BR-12, BR-27, EC-09, D-8/D-9, BR-16, AT-15, §8, §7.3 E-5 — not BR-11) | **Still accurate** |

**The conflict is genuine and correctly routed.** I checked it independently rather than taking
§8.3's word: REQ C-4 defines the process side as "every file matching the documented cross-review,
post-mortem and DoD-review basename grammars: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` …", with no
document-type catalogue in the grammar; REQ-STATS-06 v1.6 then makes an out-of-catalogue-but-
grammatical basename a **survivor**. FSPEC `BR-16` v1.7 makes the same file "no file remaining" and
`AT-17`'s fourth leg asserts `harvested` on it. Both cannot hold, the choice decides a named
acceptance test's expected value, and it is a REQ-versus-FSPEC question no downstream layer may
settle. Implementing `BR-16` (the immediate upstream), stating the dispute in the open and naming
the re-stamp sites is the right handling — `DEC-ERR-01`'s anti-pattern would have been to guess.

### Where the round understates the conflict (`F-01`, Medium)

§4.3 tells the reader the dispute touches one assertion and no oracle:

> FSPEC §8 also maps BR-16 to **AT-15**, whose neither-list pins the byte half of the same agreement
> (a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file reaching neither side); **that half is unaffected by
> the dispute, since neither reading gives the file spec-side bytes.**

and §8.3 adds "No type, signature, exit code or other oracle depends on the outcome", with exactly
three re-stamp sites (§4.3's contested paragraph, the `BR-16` pin, `AT-17`'s fourth-leg expectation).

The justification defends the side nobody contests. `AT-15`'s neither-list is not a claim about
*spec* bytes; FSPEC states it as: files on neither list — "including the out-of-catalogue
cross-review, **whose bytes reach neither side**, so an implementation that globs `CROSS-REVIEW-*`
into the process total fails here (BR-14, BR-16)". The contested side is the **process** side. Under
REQ-STATS-06 v1.6's survivor reading the file *is* a C-4 grammar member, so it takes process bytes,
and `AT-15`'s "adding a file on neither list leaves both unchanged" leg no longer holds. Saying
neither reading gives it *spec-side* bytes is true and beside the point.

Two consequences follow, and both are product-visible rather than stylistic:

1. **The re-stamp list under-counts by at least one TSPEC site.** §4.3's preceding paragraph fixes
   the membership itself — "`crossReviews` is grammar membership (`parseReviewFilename(...).ok`), so
   the harvested condition below asks…" — and that membership feeds both the sketch's
   `crossReviews.length === 0` disjunct and `BR-14`'s numerator. If the reconciliation lands REQ's
   way, that paragraph moves too. It is not in the list of three.
2. **The owning phase is being handed an understated decision.** The erratum as written reads as
   deciding one acceptance test's expected value. It actually decides whether an out-of-catalogue
   cross-review contributes process bytes — which reaches `BR-14`'s numerator and `AT-15` as well as
   `BR-16`/`AT-17`. A phase that settles only the harvested verdict leaves the byte half incoherent,
   which is exactly the half `AT-15` exists to pin.

**Why Medium, not High.** Nothing about behaviour *at HEAD* is misstated: on the chosen upstream
(`BR-16`) the implemented rule, the sketch, the membership predicate and `AT-15`'s expectation are
all correct today, and a test author writing them now writes them right. The defect is in the
scoping of a routed, explicitly-open item — a claim about what a future decision costs, not about
what the system does. It is also cheap to close: replace the "unaffected" sentence with the
contested-on-the-process-side reading, and add §4.3's membership paragraph to the re-stamp list.

### Section pointers introduced this round (`F-02`, Low)

Three internal pointers in the new bytes name the wrong section. `AT-09`'s expectation row is in
**§6.1**'s real-path table, not §7.2 — §7.2 is "FSPEC open item → decision" (O-1…O-4) and contains
no `AT-09`; the changelog (§0) and §4.3 both send the reader to "§7.2's AT-09 row". The changelog's
"§5's types" names §5 Error Handling; `halts: HaltEntry[]` and the metric types are in **§4.1**.
The counts and claims those pointers carry are correct and are recorded in the right place — this is
navigation only, which is why it is Low. It is delta-introduced: neither phrase appears in the
pre-round bytes at `7747eb78f`. I seeded "§7.2's AT-09" in my own v7 file; the correction is mine to
name, not the author's to have caught.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §4.3 declares `AT-15`'s neither-list "unaffected by the dispute, since neither reading gives the file spec-side bytes", and §8.3 declares no oracle depends on the outcome with exactly three re-stamp sites. The contested side is the **process** side: FSPEC `AT-15` asserts the out-of-catalogue cross-review's bytes reach *neither* side, and under REQ-STATS-06 v1.6's survivor reading it is a C-4 grammar member and takes process bytes. §4.3's own membership paragraph (`crossReviews` = `parseReviewFilename(...).ok`) would also re-stamp. Fix: state the byte half as contested on the process side, add that paragraph to the re-stamp list, and widen §8.3's routed item so the owning phase settles both halves. | §4.3, "FSPEC §8 also maps BR-16 to AT-15…" sentence; §8.3's REQ-STATS-06/BR-16 bullet | Scope: Local |
| F-02 | Low | delta | local | Wrong internal section pointers in the new bytes: "§7.2's AT-09 row" (§0 changelog and §4.3) — `AT-09`'s row is in §6.1's real-path table, and §7.2 is the FSPEC-open-item table with no `AT-09`; and "§5's types" (§0) — the metric types and `halts: HaltEntry[]` are in §4.1, §5 is Error Handling. Claims and counts are right; only the pointers are wrong. | §0 v1.6 changelog, clauses (a) and (c); §4.3 "§7.2's AT-09 row and §6.1's measured baselines" | Scope: Local |

FINDING: Medium | delta | local | §4.3 AT-15 "unaffected by the dispute" sentence and §8.3's three re-stamp sites | the contested side is the process side, not the spec side: under REQ-STATS-06 v1.6's survivor reading the out-of-catalogue file takes process bytes, so AT-15's neither-list leg and §4.3's own membership paragraph are in the blast radius and the routed item understates the decision
FINDING: Low | delta | local | §0 changelog and §4.3 internal pointers | "§7.2's AT-09 row" (AT-09 is in §6.1; §7.2 has no AT-09) and "§5's types" (types are §4.1; §5 is Error Handling)

## Questions

| ID | Question |
|----|---------|
| Q-01 | If the reconciliation lands REQ's way, does `REQ-STATS-03`'s "malformed" label survive alongside survivor status for the same file? REQ v1.6 says it does ("a survivor even where REQ-STATS-03 reports it malformed"), which leaves `AT-09`'s expectation intact but makes one basename simultaneously malformed for the round count and a counted member of the byte numerator. Not a TSPEC finding — the coherence question belongs to the owning phase — but §8.3's routed item is the place to surface it so the decision is taken with that consequence visible. |
| Q-02 | `RK-4` accepts coupling to the live `docs/completed/` archive, and §4.3 now records a HEAD measurement (62 / 4 / 58) that the archive will drift away from as features complete. §6.1 already says literals are re-measured when the archive changes. Should §4.3's inline measurement carry the same re-measure note, so a future reader does not treat 58 as a spec constant? Low-value now, so not raised as a finding. |

## Positive Observations

- **The round fixed the finding rather than the wording of the finding.** `F-01` at v7 could have
  been closed by softening one sentence. Instead §4.3 states the reading it got wrong, states the
  correct one, records the measurement that settles it, and adds the sentence that stops a test
  author writing the wrong real-path expectation. The repair is durable against the next reader, not
  just against this reviewer.
- **The changelog names the mechanism, not just the mistake.** "Citing a current hash is not the
  same check as diffing it against the previously grounded one, and reading the two as agreeing is
  what let the round skip re-grounding" is the sentence that stops the class recurring. That is the
  `Process` answer `Q-02` at v7 asked for, and it was written without being asked to.
- **The REQ-versus-FSPEC conflict was surfaced, not absorbed.** The path of least resistance was to
  implement `BR-16` silently and say nothing — every artefact would have looked consistent. Naming a
  live upstream contradiction that a downstream author has no authority to settle, and pointing at
  the exact sites that re-stamp when it lands, is what `DEC-ERR-01` asks for and it costs the author
  a round to do. `F-01` narrows that item's scope; it does not diminish the judgement to raise it.
- **`E-1` is explicitly distinguished from the live question.** §8.3 pre-empts the obvious
  mis-reading — that this is the settled bare-glob-versus-grammar item returning — and states the
  narrower live question. That is precisely the re-routing of a settled question `DEC-ERR-01` names
  as an anti-pattern, avoided deliberately.
- **REQ v1.6's halt withdrawal was checked, not assumed.** Clause (c) reasons from the type
  (`halts: HaltEntry[]` has no state discriminator, empty array *is* the measured `0`) to the
  conclusion that nothing changes. I verified it against REQ-STATS-05 and R-6 at HEAD; it holds.

## Recommendation

**Approved with minor changes.**

Both v7 findings are closed on evidence I re-derived independently: §4.3's `BR-16` passage now
matches FSPEC v1.7 and the archive as measured at HEAD (62 / 4 / 58), the pin moved to v1.7, and the
changelog's false no-movement attestation is withdrawn with the mechanism named. No open High
remains anywhere in the document, and nothing approved at v6 regressed — types, sketch, counts,
oracles and expectations are byte-identical.

The two findings recorded here are non-gating and both sit inside the passage this round wrote:

1. **`F-01` (Medium)** — re-scope the dispute's blast radius. The contested side is the process
   side, so `AT-15`'s neither-list leg is *in* the dispute, §4.3's `crossReviews` membership
   paragraph is a fourth re-stamp site, and §8.3's routed item should say so, so the owning phase
   settles both halves of `BR-14`/`BR-16`'s agreement rather than only the harvested verdict.
2. **`F-02` (Low)** — three internal pointers: "§7.2's AT-09 row" → §6.1, twice; "§5's types" →
   §4.1.

Neither blocks the TSPEC from proceeding. The REQ-versus-FSPEC conflict itself is upstream work, is
correctly routed rather than repaired here, and I am raising it on the erratum channel alongside
this review so the owning phase receives it with the process-byte half attached.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:235fd3ddadb3ecaa30cb2cd81cdd0f021941aea003e84c21866feee10c2945f0
APPROVAL-HASH-NORMALIZED: sha256:2e9c4bf4a33c744f84a4183178c51999cf663cbf00a184342e0a2e01d5286223
REVIEWED-COMMIT: 4943a87771e641a853d9f73a27fec25c4b6b89b5
UPSTREAM-STATE: REQ sha256:5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8
UPSTREAM-STATE: FSPEC sha256:c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
