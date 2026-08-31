# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.5)
**Date:** 2026-08-31
**Iteration:** 7 (erratum round 5 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v6.md` (Approved, v1.4 @ `c61ed537c`)

## Overview

The dispatched erratum item was that §2.1 and §8/RK-1 still listed **five** in-repo co-change sites
while `DEC-STATS-01`'s `K-1` derived more, and that `K-7`'s two sibling-feature document edits
appeared in no site list.

**The item is landed, and it was landed correctly.** I verified this against the body rather than
against the changelog's assertion of it. §2.1's table carries ten in-repo rows — `prepack.mjs`,
`publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`,
`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js`, `README.md` — and two further rows (§2.1:215, :216) name the sibling
edits explicitly: `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and that feature's
FSPEC §5.2 per-class count five → six, both tagged `K-7`-owned and both placed **outside** the ten.
§1, §6.4, §7.3 and RK-1 all carry `ten`. `DECISIONS-pdlc-stats.md` is itself now at ten (`:33`,
`:249`, `:294`), so the dispatch's own premise that `K-1` "derives nine" is the stale number here —
the TSPEC agrees with the current DECISIONS, not with the dispatch's summary of it.

The four wording corrections (§1's "including" → "and", RK-1's matching mis-scoping, §6.4's
"script-side" → "the four enumerations `assertAdditiveOnly` reads", §2.1's verbatim P-1 title) are
scoping and citation only. I diffed them: no oracle, type, signature, exit code or fixture changed.

**But landing the item is necessary, not sufficient.** Both upstream documents moved under this
TSPEC since v1.4 was approved, and one of those moves reversed a disposition the TSPEC's oracles
depend on. That is F-01, and it is why this confirmation does not approve.

## Architecture

No structural change. The edit is confined to the changelog block, §1's cost sentence, §2.1's table
and surrounding prose, §6.4's subset naming and §7.3/RK-1's opening clause. Module boundaries, the
seam design, the injected-parser bundle and the `lib/stats.mjs` / `cmdStats` split are byte-identical
to the v1.4 bytes I approved at round 6.

The one architectural claim worth re-checking is the scoping move in §1 and RK-1 — sibling-feature
document edits now sit *outside* the ten rather than being folded into it with "including". That is
the correct direction: the ten is the in-repo co-change set a PLAN task can be given and a CI check
can red on, whereas the two sibling rows are amendments to a frozen completed feature's documents
with no mechanical falsifier on the existence half. Collapsing them into one number would have
handed PLAN a set whose members are discharged by different mechanisms. The correction restores the
partition `DEC-STATS-01`'s `K-1`/`K-9`/`K-7` already encode.

## Interfaces

Unchanged and unaffected. `deriveRoundWindow`, `parseResolvedMarker`, `computeReviewRounds`, the
`StatsIo` injection surface (`listDir` / `readFile` / `stat`) and the renderer signatures over
`StatsReport` are untouched by the delta. I re-read §3.3's signatures against the diff to confirm no
incidental edit reached them; none did.

The `readFile` contract comment — "only ever called on `POSTMORTEM-*` files" — still holds against
REQ v1.6, which did not add a read of any other body. The read-only stance (REQ-STATS-08, G-4) is
also unmoved upstream.

## Data Model

The types in §5 are unchanged by the delta, so the question is whether they still match upstream
after REQ moved v1.4 → v1.6. On the largest REQ change, they do — and by luck rather than by
re-grounding.

REQ v1.6 **withdrew** REQ-STATS-05's harvested halt state and restored a measured `0`, recording the
conflation of "never halted" with "post-mortems deleted" as an accepted residual in R-6 rather than
mitigating it. Had the TSPEC modelled halts with a `MetricState`, that withdrawal would have
invalidated the type. It does not: §5 declares

```
halts: HaltEntry[];              // possibly empty — BR-13, no state needed
```

`HaltEntry[]` carries no `state` discriminator, and an empty array is exactly the measured `0` REQ
v1.6 now mandates. `MetricState` is applied only to `reviewRounds`, `dodRounds` and `byteRatio` —
the three metrics REQ-STATS-03/04/06 still attach a harvested state to. So the data model survives
the REQ v1.6 reversal intact, and NG-6's narrowed scope ("the two families harvest removes") is
satisfied rather than contradicted.

I checked the JSON key-set literals for the same reason: `["schemaVersion","reviewRounds","dodRounds","halts","byteRatio"]`
still matches REQ-STATS-02's "printed metric set plus one schema-version field", whose v1.6 rewording
was compression, not a set change. The five-key count in §6.2's table is still right.

This is worth stating explicitly because it is the near-miss: the TSPEC was not re-grounded this
round, and on this axis it happened not to need it. On the axis below, it did.

## Test Strategy

The delta touches no oracle. §6.4's purity split, the vendoring oracle, the catalogue-agreement
set-equality, the exact-key-set conjuncts, the snapshot isolation property and the named mutation
kills are all unchanged, and §6.4's renaming of the four-enumeration subset is a naming improvement:
"the four enumerations `assertAdditiveOnly` reads" identifies the subset by its falsifier, which is
checkable, where "script-side" was a directory claim falsified by `_tspec-packed-set.mjs` sitting
under `__tests__/`. Good correction.

**The problem is F-01, and it lands on a load-bearing oracle.**

§4.3 (`:725`–`:737`) argues that the harvested test is asked over grammar-passing cross-reviews, so a
directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` form reports `harvested`. It closes that argument with:

> `REQ-STATS-06` at v1.4 carries the same scoping. … Nothing on this point is routed upstream
> (FSPEC §7.3 records it closed).

At REQ **v1.6**, REQ-STATS-06 no longer carries the same scoping. It now states:

> The predicate is set-membership over C-4's grammars, so a grammatical basename outside the
> driver's document-type catalogue is **a survivor** even where REQ-STATS-03 reports it malformed.

`CROSS-REVIEW-test-engineer-REVIEW-v1.md` parses against C-4's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`
with `doc-type = REVIEW` — a doc-type outside the driver's catalogue. REQ v1.6 therefore classes it a
**survivor**, which makes the cross-review family non-empty and the ratio **measured**. FSPEC BR-16
(still, at v1.7) and TSPEC §4.3 both class the same directory **harvested**. These cannot both hold.

This is not a prose nit — it flips an expected value on a named fixture:

- **AT-17's fourth leg**, the boundary fixture §4.3 calls out by name: `LEARNINGS` present,
  `CODE_REVIEW` files intact, only out-of-catalogue `CROSS-REVIEW-` basenames. TSPEC expects
  `harvested`; REQ v1.6's predicate yields `measured`.
- The **precedence** leg (harvested before zero-denominator) is unaffected in ordering but its
  third fixture's expectation inherits the same flip.
- §4.3's disjunction analysis — that keeping the DoD family populated is "what makes the grammatical
  cross-review test the disjunct that fires" — is precisely the reasoning that breaks: under REQ
  v1.6 that disjunct no longer fires on this fixture.

A test engineer writing to this TSPEC today would write an assertion that contradicts the REQ. That
is the definition of an infidelity worth a High.

**Where the fix belongs.** The root contradiction is REQ v1.6 against FSPEC BR-16, not a TSPEC
authoring error — the TSPEC faithfully compresses FSPEC, and FSPEC has not yet absorbed REQ v1.6's
new sentence. So F-01 is tagged `inherited`: it routes back to the owning phase to reconcile
REQ-STATS-06 and BR-16 first. Once BR-16 settles, §4.3's two version pins ("at v1.4") and its
"FSPEC §7.3 records it closed" clause need re-stamping to whatever disposition wins. The TSPEC should
not be edited to guess the outcome.

## Open Questions

_TBD_

## Recommendation

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
