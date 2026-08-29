# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation)

## Scope

A **delta confirmation**, not a re-review. I previously approved this PLAN; v0.8 is an erratum round
carrying three routed items. I read the routed item list, diffed the erratum edit
(`3fb153a87~1..HEAD`, 23 insertions / 14 deletions, one file), and re-read the upstream text this
PLAN now leans on at its current version.

**Upstream re-grounding (DEC-ERR-03).** All four dispatch hashes verify byte-for-byte at HEAD:

| Upstream | Version at HEAD | `shasum -a 256` | PLAN header pin | Agrees |
|---|---|---|---|---|
| REQ | 1.9 | `ce6b133f…3c7b7c` | v1.9 `ce6b133f…3c7b7c` | ✅ |
| FSPEC | 1.3 | `2bd5c3ef…5aed39` | v1.3 `2bd5c3ef…5aed39` | ✅ |
| TSPEC | **1.1** | `21c913b4…9c8e49` | **v1.1** `21c913b4…9c8e49` | ✅ |
| DECISIONS | — | `13aba061…4fb89a` | `13aba061…4fb89a` | ✅ |

This matters more than usual on this round. The routed items were written by reviewers reading TSPEC
**v1.0**, and TSPEC has since advanced to **v1.1**. v0.8's own revision history states it re-derived
the round against v1.1 before touching any raised item, and the header pin confirms it — the PLAN is
not answering a superseded upstream. v1.1 does not reverse v1.0; §7.3's *The size of the owned list,
stated once* paragraph single-sites the count at **six ∪ eight = fourteen** and declares the
correction direction downstream-to-here. So the routed items are still live at HEAD and this
document was the stale side, exactly as the round asserts.

**Verdict of this confirmation in one line.** Routed items 2 and 3 — the census-constant home and
cardinality — land cleanly and completely, at every site they touch. Routed item 1 — T-10a's
conjunct 3 — is **entirely unlanded**: the erratum edit never touched T-10a's row, and the retired
referents it names are still on disk, at two sites.

## Tasks

Per-routed-item landing audit. "Landed" means I checked the bytes on disk, not the revision history's
claim about them.

### Item 2 + Item 3 — census-constant home and cardinality — **LANDED, all six sites**

Items 2 and 3 are the same correction stated by two reviewers, so I audited them as one sweep. TSPEC
v1.1 §7.3 requires: all three census constants are declarations of the census **test file**; none is
production; none is a member of the owned list; the partition is **six ∪ eight = fourteen**. Every
site v0.7 got wrong now agrees:

| Site | v0.7 (stale) | v0.8 (on disk) | OK |
|---|---|---|---|
| Header pin | TSPEC **v0.9** `eef45ef3…` | TSPEC **v1.1** `21c913b4…` | ✅ |
| Revision history (`:19`–`:23`) | six ∪ nine = fifteen "stands"; fourteen "rejected" | v0.7 entry marked *superseded*, retained as history not contract | ✅ |
| T-11 row (`:158`) | six ∪ nine = fifteen | **six** ∪ **eight** = **fourteen**; "All three are declarations of this task's own test file" | ✅ |
| T-18 row (`:164`) | "Add frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration" | "This task writes **no census constant** … there is no production declaration to add here" | ✅ |
| Manifest row, census test file (`:213`) | sole home of **two** lists; tokens "**not** a test-file constant — it is production" | "the sole home of **all three** frozen census lists" | ✅ |
| Manifest row, `orchestrate-dev.js` T-18 (`:225`) | "**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration**" | "it declares **no** census constant — all three are test-file constants owned by T-11" | ✅ |
| §Definition of Done census bullet | nine / fifteen; tokens "is **production**, declared by T-18" | eight / fourteen; "none is production code or a member of the owned list" | ✅ |

Two things I checked beyond the literal find-and-replace, because a count edit is exactly where a
document goes half-stale:

- **The eight exempt members are enumerated, and the enumeration is eight.** T-11 names
  `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`,
  `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`,
  `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES` — eight, matching TSPEC §7.3's exempt row
  after `DECISION_LEDGER_CENSUS_TOKENS` was removed from it. The count and the list agree; the
  document did not update one and leave the other.
- **`fifteen` still appears at `:99`, and that is correct.** It is the *new test/fixture path* count
  (twelve `decisionLedger*` modules + `helpers/decisionLedgerDoubles.js` + two fixture trees), an
  unrelated cardinality. Not a missed replacement.

The corollary the round also had to absorb landed too: T-11 now carries §7.3's **widened declaration
regex** conjunct ("eight of this feature's fourteen owned declarations are top-level `const`s", so
the precedent's `function`-anchored `DECL_RE` must be widened, not cloned), and keeps the
non-empty-slice and resolves-to-exactly-one conjuncts that stop the census going vacuous. That is the
falsifiability half of the census, and it survived the count edit intact.

### Item 1 — T-10a conjunct 3 — **UNLANDED**

The erratum edit does not touch T-10a's row. `git diff 3fb153a87~1 HEAD` mentions `T-10a` seven
times, every one of them inside the *bodies* of the rewritten T-11 and T-18 rows; the T-10a row
itself is byte-identical to v0.7. Both retired referents are still on disk, verbatim — see
the delta-confirmation findings below, F-01 and F-02.

## Dependencies

The round claims "no batch, dependency, ownership or task-id assignment changes"; I checked rather
than took it.

- **Task inventory unchanged at 24.** The Batches table declares exactly `T-00, T-00a, T-01, T-02,
  T-03, T-04…T-12, T-12a, T-13…T-20` — 24 unique ids, matching §Definition of Done's "All 24 tasks".
- **No `Batch`/`Deps` cell moved.** The diff touches only prose inside the T-11 and T-18 description
  cells; every `Batch` and `Deps` column value is untouched. T-11 stays batch 2 / `T-00, T-01`;
  T-18 stays batch 8 / `T-10, T-10a, T-11, T-17`.
- **The red-before-green edge survives the T-18 rewrite, and this was the one at real risk.** v0.7
  justified T-11-stays-red-until-T-18 partly by "T-18 writes the missing `CENSUS_TOKENS`
  declaration". Removing that instruction could have left T-11's un-skip edge unmotivated. It did
  not: T-18 now grounds the same edge on the surviving reason — "T-11 still stays red until this task
  lands, because the fourteen owned members it resolves against are the declarations batches 3–8
  write" — and keeps "Un-skips T-10, T-10a and T-11". The edge is re-argued, not orphaned.
- **File-ownership manifest stays disjoint.** The two rewritten manifest rows changed only their
  parenthetical annotations; neither moved a path between owners, so the batch-safety
  same-batch/same-new-file property I approved earlier is undisturbed.

## Verification

Sweeping this PLAN against upstream at HEAD for anything it cites that TSPEC v1.1 no longer says the
same way — the DEC-ERR-03 obligation, independent of the item list.

**Checks that pass:**

- **TSPEC §6.1 row count.** PLAN's coverage-gate prose and its failure-row table both say
  **fourteen**; TSPEC §6.1 has exactly 14 `F-n` rows. Agrees.
- **FSPEC AT coverage.** PLAN's AT-owner table names AT-01…AT-18; FSPEC declares AT-01…AT-18. No AT
  is unowned and none is invented.
- **§5.5 → §7.3 re-pointing.** No stale `§5.5` citation survives outside the revision history's own
  record of having re-pointed it.
- **`decisionLedger`-is-not-a-token rationale.** PLAN's version tracks TSPEC §7.3's *Why the report
  field name is not a census token* paragraph faithfully, including the "absent from
  `DECISION_LEDGER_OWNED_DECLS` too, so the partition is unaffected in both directions" corollary
  that v1.1 needs in order for fourteen to be the right number.

**Check that fails — and it is the one the routed item named.** TSPEC §7.2's conjunct 3 was rewritten
at **v0.9** (its own changelog: *"PM F-01 (Medium) — the flag-off `report` key set was cited against
§7.4's recording, which captures reviewer-prompt streams for one narrow `reviewLoop` case and no
`report` key at all"*), and v1.1 §7.3 restates the warning in bold: the referent for the key-set
conjunct is *"the arm's own paired runs, **not** §7.4's recording"*. Upstream now specifies three
conjuncts:

1. prompt byte-identical to §7.4's committed merge-base recording — §7.4 cited **for this conjunct only**;
2. the `report` object *the flag-off `main()` run itself returns* has a key set whose **symmetric
   difference from the flag-on run's key set is exactly `{decisionLedger}`**, asserted as set equality
   in both directions so a spurious add *or* drop on **either** arm fails;
3. the emitted `NTC-DECLEDGER-*` notice set is **set-equal to empty**.

PLAN T-10a still carries the pre-v0.9 form at `:157` and §Definition of Done still carries it at
`:483`–`:484`. This is not a wording nit — as written, conjunct 3 is **unimplementable** and
**unfalsifiable** in the one arm DC-07 requires:

- *"`notices` is set-equal to the baseline notices array"* — the baseline is T-02's committed
  merge-base recording, which records reviewer-prompt streams and holds no notices array at all.
  There is no such array for an implementer to compare against. TSPEC's replacement is concrete and
  buildable: set-equal to **empty**.
- *"`report`'s key set is set-equal to the flag-off key set"* — on the flag-off run this is a
  tautology: the run's key set is trivially equal to itself. It cannot fail, so it does not pair
  `"decisionLedger" not in report` with any positive, which is the entire purpose the conjunct was
  added to serve (TE F-05). TSPEC's replacement — symmetric difference against the **flag-on** run's
  key set, asserted both directions — is the falsifiable form.

TSPEC §7.2 closes that paragraph with *"which is the form PLAN T-10a already states."* At HEAD that
sentence is false. Upstream believes this PLAN has already absorbed the correction; it has not.

## Questions

| ID | Question |
|----|---------|
| Q-01 | When F-01 is fixed, does the *flag-on* arm also need its `report` key set measured explicitly? TSPEC §7.2 asserts the difference "in both directions", which implies both runs' key sets are captured in the same test. T-10a's arms (1) and (2) currently say nothing about `report` keys. Stating it once in conjunct 3 as "the two runs' key sets, compared both ways" is enough — I raise it only so the fix does not land as a one-sided flag-off assertion. |
| Q-02 | §Definition of Done's census bullet says TSPEC §7.3 "is the sole home of that arithmetic; this bullet cites it and does not restate it" — yet the bullet does restate six / eight / fourteen. That is the right call for readability and I am not filing it, but is the intent that a future TSPEC count change must still edit this bullet? If so, the "does not restate it" clause reads as a promise the bytes do not keep. |

## Positive Observations

- **The re-grounding was done first, and it changed the answer.** The round found TSPEC had moved
  v0.9 → v1.0 → v1.1 under reviews written against v1.0, re-derived against v1.1, and only then
  edited. That is DEC-ERR-03 executed properly, and it is why v0.7's "fourteen is the rejected form"
  reading was reversed rather than defended.
- **The superseded v0.7 entry is retained and explicitly labelled** *"superseded in part by v0.8 …
  retained as history"*. Rewriting history to hide a reversed decision is the tempting move; keeping
  it labelled is the correct one and makes the next reviewer's diff legible.
- **Items 2 and 3 landed at every site, including the two easy-to-miss manifest parentheticals.**
  A six-site count correction that leaves one site stale is the common failure mode here; this one
  did not.
- **The widened-`DECL_RE` conjunct came along with the count.** Absorbing "eight of fourteen owned
  declarations are `const`s, so the precedent's `function`-anchored regex must be widened" is what
  keeps the census from passing on a slice it never took — the count edit could easily have landed
  without it.
- **T-18's un-skip edge was re-argued, not merely left standing**, after its original justification
  was deleted.

## Recommendation

**Needs revision**

The census correction (routed items 2 and 3) is complete, and I would approve it on its own. The
block is routed item 1: T-10a's conjunct 3 is untouched, and T-10a is the *only* live execution of
the composition root — the arm DC-07 requires, and the sole home of the `report.decisionLedger`
proof (TSPEC §7.3 names it as such). Leaving it stating a tautology and an assertion against a
non-existent array means the one test that can catch a never-wired seam is specified in a form an
implementer cannot write. Fix F-01 and F-02 together, re-read F-03, and this converges.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | Routed item 1 unlanded: T-10a conjunct 3 still names both retired referents | `## Batches`, T-10a row, conjunct 3 |
| F-02 | High | inherited | local | The same two retired referents restated in the flag-off DoD bullet | `### Definition of Done`, flag-off report/notices bullet |
| F-03 | Low | delta | local | T-11's forward pointer summarises the defective conjunct-3 wording and must move with it | `## Batches`, T-11 row |
| F-04 | Low | delta | local | Two consecutive changelog entries both open with the literal `Revision history:` | Header revision history |

**F-01 (High, delta, local).** T-10a's conjunct 3 reads: *"`report`'s key set is **set-equal** to the
flag-off key set … and `notices` is **set-equal** to the baseline notices array."* Both referents were
retired by TSPEC v0.9 and re-forbidden by v1.1 §7.3. The first is a tautology on the flag-off run and
cannot fail; the second names an array that does not exist in T-02's recording, so the instruction
cannot be implemented. This is the round's routed item, and the edit did not touch the row.
**Fix:** replace conjunct 3's second and third clauses with TSPEC §7.2's form — the symmetric
difference between the flag-off and flag-on runs' `report` key sets is exactly `{decisionLedger}`,
asserted as set equality in **both** directions; and the emitted `NTC-DECLEDGER-*` notice set is
set-equal to **empty**. Keep the first clause (prompt byte-identical to T-02's committed recording)
exactly as it stands — §7.4 remains correctly cited for the prompt conjunct.

**F-02 (High, inherited, local).** The §Definition of Done bullet *"the report's key set is set-equal
to the flag-off key set, and `notices` is set-equal to the baseline notices array"* duplicates F-01's
two defects in the checklist an implementer signs off against. It was not in the routed item list and
this edit did not touch it, so it is inherited — but a fix to T-10a that leaves this bullet behind
re-creates the contradiction inside one document. **Fix:** restate to match the corrected T-10a.

**F-03 (Low, delta, local).** T-11's rewritten row ends *"the flag-off arm pairs its absence with a
set-equality on the report's key set"* — a pointer to the wording F-01 corrects. It names no wrong
referent, so it is not itself wrong, but it should be re-read once F-01 lands so that it points at
the symmetric-difference form. Flagged because it sits in bytes this round rewrote.

**F-04 (Low, delta, local).** The v0.8 and v0.7 entries both begin `Revision history:`, so the
document appears to start its changelog twice. Cosmetic; the v0.7 entry should read as a
continuation.

FINDING: High | delta | local | ## Batches, T-10a row, conjunct 3 | Routed item 1 is unlanded — conjunct 3 still asserts `report`'s key set is set-equal to the flag-off key set (a tautology on the flag-off run, which cannot fail) and `notices` set-equal to the baseline notices array (T-02's recording holds no notices array), both referents retired by TSPEC v0.9 and re-forbidden by v1.1 §7.3; replace with the symmetric difference against the flag-on run's key set asserted in both directions, and the NTC-DECLEDGER-* notice set set-equal to empty
FINDING: High | inherited | local | ### Definition of Done, flag-off report/notices bullet | The DoD checklist restates the same two retired referents ("set-equal to the flag-off key set", "set-equal to the baseline notices array"); untouched by this edit and not in the routed list, but it must be corrected alongside T-10a or the document contradicts itself
FINDING: Low | delta | local | ## Batches, T-11 row | T-11's closing pointer "the flag-off arm pairs its absence with a set-equality on the report's key set" summarises the wording F-01 corrects and should be re-read once F-01 lands
FINDING: Low | delta | local | Header revision history | Two consecutive changelog entries both open with the literal prefix "Revision history:", so the document appears to begin its changelog twice

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 0, "low": 2}
