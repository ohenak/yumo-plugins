# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.2, bytes unchanged)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v4.md` (`REVIEWED-COMMIT: 9c56d0c5`)
**Upstream that moved:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.6 → v1.7 (`e12b78fd8`)
**Date:** 2026-08-31
**Iteration:** 5

## Overview

**Scope of this round.** Upstream-cascade confirmation, not a re-review. `PLAN-pdlc-stats.md`'s own
bytes are unchanged since `9c56d0c5`, the commit my v4 approval was taken against. What moved is the
REQ my approval was pinned to: `UPSTREAM-STATE: REQ sha256:5f3e8051…` in v4 no longer exists on the
branch, and REQ is now `sha256:f75c348f…` (v1.7, `e12b78fd8`). FSPEC is unmoved
(`sha256:c7d2c832…`, identical to my v4 pin). The single question I owe an answer to: does the PLAN
still hold against the REQ as it now stands? I did not re-open settled decisions, did not re-read the
PLAN from scratch, and did not re-litigate v4's recommendation.

**What the erratum changed.** One clause, decided rather than reconciled — 12 insertions, 3 deletions,
all inside REQ-STATS-06 plus a changelog block. REQ v1.6 had asserted that "the predicate is
set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type
catalogue is **a survivor** even where REQ-STATS-03 reports it malformed." That clause is **withdrawn**.
REQ-STATS-06 now reads (`REQ-pdlc-stats.md:208-215`): the predicate "is evaluated over exactly the
file set whose bytes the process side sums, so a basename the driver's document-type catalogue does
not recognise … contributes no process bytes and counts as no file of its family remaining: a feature
whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio
that would silently undercount."

**Direction of the change is the one this PLAN was already built for.** The withdrawn clause was the
REQ half of the REQ-versus-FSPEC contradiction TSPEC §4.3 named explicitly and routed to the owning
phase without deciding: "the sketch below is written against BR-16, the immediate upstream, and §8.3
routes the reconciliation to the owning phase" (`TSPEC-pdlc-stats.md:796-797`). FSPEC BR-16 v1.7 —
unchanged by this erratum — already said the out-of-catalogue basename "counts as no file remaining"
and that such a directory "reports `harvested`, not a measured ratio"
(`FSPEC-pdlc-stats.md:364-374`). The erratum moved REQ **onto** FSPEC's reading. PLAN derives from
FSPEC and TSPEC, so every task it owns was already written to the surviving answer.

**Method.** I read my v4 cross-review, took `git show e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`
for the exact delta, then re-read the current REQ-STATS-06, FSPEC BR-16 and AT-17, and TSPEC §4.3/§8.3
at HEAD — not the versions I reviewed against — and traced each into the PLAN rows that lean on them.
"The items landed" is necessary, not sufficient; what follows measures PLAN's text against upstream
text as it now reads.

## Batches

Every PLAN row that touches REQ-STATS-06's ratio, re-measured against REQ v1.7 / FSPEC v1.7 at HEAD.
The PLAN cites no REQ section directly — its only REQ reference is the lineage row at
`PLAN-pdlc-stats.md:9` and `REQ C-5` in the Overview — so the cascade reaches it through FSPEC BR-14…BR-16
and TSPEC §4.3. That indirection is what makes this confirmation cheap, and it is worth stating
plainly rather than treating as an accident.

| PLAN row | What it leans on | REQ v1.7 reading | Holds? |
|---|---|---|---|
| **T-04** — `computeFeatureStats` reds, "byte ratio (AT-15 incl. the removal probe, AT-16, **AT-17's four directories**)" (`PLAN:96`) | FSPEC AT-17, whose fourth leg is the directory "holding `CODE_REVIEW` files intact plus, as its only `CROSS-REVIEW-` basenames, the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form BR-16 names," expecting `harvested` (`FSPEC:749-757`) | REQ-STATS-06 v1.7 now states the same outcome for the same shape in its own words — "reports **harvested**, not a measured ratio" | **Yes.** The leg PLAN owns was the contested one; it is now the decided one. No expected value changes. |
| **T-04** — the `unmeasurable`/`harvested` mutant's dedicated fixture (`PLAN:96`) | TSPEC §6.6 mutant set; branch order harvested-before-zero-denominator | REQ-STATS-06 is silent on precedence ("How much of the numerator harvest removes is not asserted here"); BR-16 owns it, unchanged | **Yes.** Untouched by the erratum. |
| **T-18** — AT-09 over `docs/completed/pdlc-advisory-wave-gate/`: "TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed" (`PLAN:110`) | REQ-STATS-03's malformed classification, not the ratio | REQ v1.7 *strengthens* the tie — it now cites "the same one REQ-STATS-03 reports malformed (C-5)" as the basis for the harvested reading | **Yes**, and the erratum removes the tension that previously made one basename malformed under REQ-STATS-03 and a survivor under REQ-STATS-06. BR-16 still classes this directory itself as a measured ratio because it also carries grammar-matching cross-reviews ("only the shape is borrowed, not the verdict", `FSPEC:373-374`); PLAN never claimed otherwise. |
| **T-18** — AT-10 (`pdlc-headless-engine`, "five rows `harvested`") (`PLAN:110`) | Per-document-type harvested split, BR-08 | Unchanged by the erratum | **Yes.** |
| **T-26** — mutation evidence, "swap BR-16's harvested test with BR-15's zero-denominator test" (`PLAN:118`) | BR-16 precedence | Unchanged | **Yes.** |
| **T-08** — doc-type set-equality over `REVIEW_DOC_TYPE_ROWS` (`PLAN:100`) | C-4's grammars as the driver catalogue | REQ v1.7 leans harder on the catalogue being *the* discriminator, which is exactly what this oracle pins | **Yes**, and marginally better motivated than before. |

**No PLAN task acquires, loses or changes an acceptance criterion.** The AC coverage table
(`PLAN:300-327`) assigns AT-17 to T-04 and AT-15 to T-04 plus T-18; both assignments are unchanged and
both remain correct against the FSPEC at HEAD. No task was written to the withdrawn survivor clause,
so nothing needs restoring; no task now over-covers, so nothing is scope creep.

## Dependencies

**Ordering is untouched.** The erratum changed no observable, so it changed no dependency edge. TSPEC
§4.3 anticipated exactly this and bounded the blast radius in advance: "When it settles, exactly three
things here re-stamp — this paragraph, BR-16's version pin above, and AT-17's fourth-leg expectation
named next. **No type, signature, exit code or other oracle depends on the outcome**"
(`TSPEC-pdlc-stats.md:797-800`). All three re-stamp sites are TSPEC's and FSPEC's, none is PLAN's.
The PLAN's batch derivation (`PLAN:210-233`), its ordering-edge rationale (`PLAN:234-266`) and its
integration points (`PLAN:267-277`) each survive byte-for-byte correct.

**One PLAN section is now stale in the direction of *less* to carry, not more.** My v4 F-01 (Medium,
inherited from v3) held that the Residual-risks table (`PLAN:375-385`) named one open erratum where
TSPEC §8.3 named two: it carried RK-5's provisional leading-underscore predicate but not the
REQ-STATS-06-versus-BR-16 disagreement. **That second erratum is now closed by this very commit.**
There is no longer a second open erratum for the table to carry, so the omission I flagged is now
simply correct. F-01's basis is superseded upstream rather than addressed by the author — which is a
legitimate way for a finding to die, and I record it as resolved rather than carrying it forward.

The residual risk the table *does* carry — "The leading-underscore discovery predicate is
**provisional** on an open FSPEC erratum … blast radius is `discoverFeatures` plus AT-26's fixture"
— remains open and remains correctly stated. TSPEC §8.3's own header still reads "**Two remain open**"
and still carries the now-decided REQ-STATS-06 bullet, but that is TSPEC's bookkeeping to re-stamp,
not the PLAN's, and it is out of scope for a PLAN confirmation. I note it as a question below so the
orchestrator can route it rather than lose it.

## Verification

Claims I re-measured at HEAD for this round, rather than carrying from v4:

| Claim | How measured | Result |
|---|---|---|
| REQ at HEAD is the dispatch's `f75c348f…` | `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` | **Matches** the dispatch pin exactly |
| My v4 approval pinned a REQ that no longer exists | `git show 1847dd9c0:…/REQ-pdlc-stats.md \| shasum -a 256` → `5f3e8051…`, equal to v4's `UPSTREAM-STATE: REQ` | **Confirmed**; the cascade is real, not a spurious re-stamp |
| FSPEC did **not** move in this cascade | dispatch pin `c7d2c832…` vs v4's `UPSTREAM-STATE: FSPEC c7d2c832…` | **Identical.** REQ moved onto FSPEC; FSPEC held still |
| The erratum is one clause, not a restructuring | `git show e12b78fd8 --stat` | 1 file, **12 insertions, 3 deletions** — consistent with the "one clause decided, no rule added" the changelog claims |
| The withdrawn text is gone from REQ | `grep -n "is a survivor" docs/pdlc-stats/REQ-pdlc-stats.md` | No hit outside the changelog's own description of the withdrawal |
| PLAN carries no REQ version pin that would now be stale | `grep -n "v1\.[0-9]" PLAN-pdlc-stats.md` filtered of its own review/PLAN version strings | **Zero hits.** PLAN pins no upstream version in prose; only the lineage row at `PLAN:9` names REQ at all |
| PLAN cites no REQ-STATS-06 text directly | `grep -n "REQ-STATS-06" PLAN-pdlc-stats.md` | **Zero hits.** The cascade reaches PLAN only through FSPEC/TSPEC, both of which already held the surviving reading |
| AT-17's fourth leg still expects `harvested` | `FSPEC-pdlc-stats.md:749-757` read at HEAD | **Yes** — "all four report `harvested` — the third not `n/a`, the fourth not a measured ratio" |
| T-04 still owns AT-17 | AC coverage table, `PLAN:300-327` | **Yes**, `AT-17 → T-04`, unchanged |

**The two Low findings from v4 remain open in PLAN bytes.** Since the PLAN was not edited, T-24's
transcription still carries the added backticks around `` `lib/` `` and T-23's citation still anchors
`loop-distribution.test.js:73-77` where the quoted message sits at `:77`. Both are inherited and
non-gating, exactly as in v4; I re-record them below only so the ledger stays honest across the
cascade, not as new objections.

**Nothing in the Definition of Done (`PLAN:387-416`) references the withdrawn clause.** Its ratio-
adjacent items — the four mutants killed by named tests, the doc-type-catalogue and exclusion-set
oracles green — are stated over TSPEC oracles, none of which the erratum moved.

## Delta-Confirmation Findings

No finding is caused by this cascade. The two below are the unaddressed Lows from v4, carried at
unchanged severity because the PLAN was not edited; both are `inherited` and `nonlocal` — they sit
outside anything this round touched, since this round touched nothing in the PLAN at all.

| ID | Severity | Provenance | Locality | Scope | Finding | Requirement ref |
|----|----------|-----------|----------|-------|---------|----------------|
| F-01 | Low | inherited | nonlocal | Local | T-24's second P9-02 test title is claimed transcribed verbatim but prints backticks around `` `lib/` `` that the source string at `coverageInstrumentation.test.js:278` does not carry. Unchanged from v4 F-02. | te F-04 (round 2), TSPEC §6.4 |
| F-02 | Low | inherited | nonlocal | Local | T-23's citation of the `assertAdditiveOnly` message anchors `loop-distribution.test.js:73-77`; the quoted message sits at `:77` and its `assert.equal` statement spans `:74-78`. Quotation exact, anchor off by one. Unchanged from v4 F-03. | DEC-DOC-01 |

**Resolved since v4, recorded rather than carried:** v4's F-01 (Medium, inherited) — the Residual-risks
table naming one open erratum where TSPEC §8.3 named two — is **closed by this cascade**. The second
erratum was the REQ-STATS-06-versus-BR-16 disagreement, and REQ v1.7 decides it. There is nothing left
for the table to carry, so the gap I flagged no longer exists. I am not re-raising it, and the DoD
reviewer no longer inherits it.

FINDING: Low | inherited | nonlocal | T-24, second P9-02 title transcription | Claimed verbatim, but adds backticks around `lib/` that the source string at `coverageInstrumentation.test.js:278` does not carry. Carried unchanged from v4 F-02; not caused by this cascade.
FINDING: Low | inherited | nonlocal | T-23, `assertAdditiveOnly` message citation | Quoted text exact; anchor `loop-distribution.test.js:73-77` off by one (message at `:77`, statement `:74-78`). Carried unchanged from v4 F-03; not caused by this cascade.

## Questions

| ID | Question |
|----|---------|
| Q-01 | **TSPEC §8.3 is now stale in the direction of over-reporting.** Its header reads "**Two remain open**" and it still carries the REQ-STATS-06-versus-BR-16 bullet that REQ v1.7 has just decided. §8.3's own stated policy is that a settled bullet must be removed, not left standing — "an erratum bullet whose upstream answer has landed re-routes a settled question, which is `DEC-ERR-01`'s anti-pattern" (`TSPEC-pdlc-stats.md:1296-1298`). By its own rule the count word and that bullet now need re-stamping, along with TSPEC §4.3's "contested upstream and is not decided here" paragraph (`:790-800`). This is TSPEC's bookkeeping, not the PLAN's, so I have not raised it as a finding against the document under review — but it should reach TSPEC's own cascade confirmation rather than be discovered at DoD. |
| Q-02 | Carried from v4, still non-gating and still owed nothing this round: T-08's Status `✅` while the PLAN is itself under review — whether status ticks belong in a spec document or a live ledger is an operator decision for harvest, not a fidelity defect. |

## Positive Observations

- **The erratum was decided, not reconciled — and that was the right product call.** REQ v1.6's
  survivor clause dissented from three things at once: REQ-STATS-06's own preceding rationale (a family
  gone from the numerator must be visibly absent, not silently undercounted), REQ-STATS-03's malformed
  classification of the identical basename, and C-5's no-independent-parsing-rule constraint. A clause
  at odds with its own paragraph's reasoning is not a position to be split the difference with. The new
  text (`REQ:208-215`) makes the argument the old one had already made and then contradicted, and it
  names the reason in user terms — "not a measured ratio that would **silently undercount**." That is
  the sentence a pipeline operator needs, and it now appears in the REQ rather than only in the FSPEC.

- **The blast radius TSPEC predicted was the blast radius that materialised.** §4.3 committed in advance
  to exactly three re-stamp sites and asserted that no type, signature, exit code or oracle depended on
  the outcome. Measured at HEAD, that holds: the PLAN needed no edit, no task changed owner, no expected
  value moved, no dependency edge shifted. Writing down the blast radius *before* the answer arrived is
  what made this confirmation a read rather than a rewrite, and it is a practice worth harvesting.

- **The PLAN's indirection is why the cascade was cheap.** The PLAN cites zero REQ sections and pins
  zero upstream versions in prose; it derives from FSPEC business rules and TSPEC oracles, and names
  REQ only in its lineage row. A REQ erratum therefore cannot strand a PLAN citation. Contrast this with
  the residual-risk table, whose one genuinely REQ-coupled entry (RK-5) is precisely the one still open.
  Loose coupling to upstream prose is doing real work here.

- **My v4 Medium died the right way.** I asked for a second open-erratum row in the Residual-risks
  table so the DoD reviewer would inherit it. The pipeline instead closed the erratum. Both outcomes
  protect the reviewer; the one that landed protects the implementer too, because there is now one fewer
  provisional predicate to code against.

## Recommendation

**Approved with minor changes.**

The PLAN still holds against the REQ as it now stands. This cascade moved REQ-STATS-06 **onto** the
reading the PLAN was already built for: FSPEC BR-16 v1.7 and TSPEC §4.3's sketch both already classed
the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basename as no file remaining and its
directory as `harvested`, and TSPEC had explicitly declined to decide the REQ-versus-FSPEC conflict at
its own layer, routing it upstream instead. REQ v1.7 answers it in FSPEC's favour. Every PLAN row that
leans on the ratio — T-04's AT-17 four directories, T-04's `unmeasurable`/`harvested` mutant fixture,
T-18's AT-09 and AT-10 legs, T-26's mutant, T-08's doc-type set-equality — reads correctly against the
new text without a byte changing.

On my only lens, product fidelity: **no acceptance criterion is narrowed, broadened, reinterpreted or
dropped by this cascade.** The AC coverage table's assignments are unchanged and remain correct;
AT-17's fourth-leg expectation the PLAN owns is now decided rather than contested, which strengthens
traceability rather than weakening it. There is no scope creep — the PLAN gained no behaviour — and no
scope gap, because no task was ever written to the withdrawn clause and so none needs restoring.

Nothing gates. The two Low findings are inherited from v4 and unaddressed only because the PLAN was
not edited this round; neither changes what an implementer does. Changes to make at the next PLAN
touch, in priority order:

1. Drop the added backticks from T-24's "verbatim" P9-02 title (F-01).
2. Re-anchor T-23's `assertAdditiveOnly` citation from `:73-77` to `:77` (F-02).

And one item that is **not** the PLAN's to fix but should not be lost: TSPEC §8.3's "Two remain open"
header and its now-decided REQ-STATS-06 bullet need re-stamping under §8.3's own DEC-ERR-01 policy
(Q-01). Route it to TSPEC's cascade confirmation.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:87b439eafbb04c37b9f4419fec1d8bc3f9166e51ec91bcd6e70384ac1c3d0baf
APPROVAL-HASH-NORMALIZED: sha256:ffcff5ae7787002783194f1bb62999ea8a9b801abf1ecf131f243555c3a3c133
REVIEWED-COMMIT: 034205d4120bc5ce1c553027ee6e08f0fdf1fca4
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
UPSTREAM-STATE: DECISIONS sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
