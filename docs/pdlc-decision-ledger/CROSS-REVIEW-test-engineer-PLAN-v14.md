# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-09-01
**Iteration:** 14 (delta confirmation)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved PLAN v1.1 in round 13
(`CROSS-REVIEW-test-engineer-PLAN-v13.md`, `REVIEWED-COMMIT: 0869ce263`, *Approved with minor
changes*, one Medium and one Low, neither gating). The alignment round advances the document to
**v1.2**, absorbing TSPEC's own **v1.3 → v1.4** self-correction.

The delta measures **8 insertions / 6 deletions across 5 hunks** and touches nothing else
(`git diff 0869ce263 -- PLAN-…md --stat` names the PLAN alone). The five hunks are exactly the
five the changelog claims: the header pin row, the status row, the new changelog entry, and the
three inverted loci — the §HEAD-verified reuse-surface row (`:122`), T-18's `[green]` instruction
(`:174`) and the §Integration points row (`:335`).

## Re-grounding: four pins re-measured, one moved

DEC-ERR-03 asks for measurement, not assertion. I re-ran `shasum -a 256` at HEAD on all four:

| Upstream | Claimed in v1.2 header | Measured at HEAD | Agrees |
|---|---|---|---|
| REQ v1.10 | `sha256:9bc8bc32…05f10d` | `9bc8bc32d698…cc05f10d` | yes |
| FSPEC v1.4 | `sha256:48691453…a11256` | `48691453921c…99da11256` | yes |
| TSPEC **v1.4** | `sha256:b8dcac11…46db6d` | `b8dcac11a521…31246db6d` | yes |
| DECISIONS v1.6 | `sha256:48e73a41…880240` | `48e73a411481…5b9880240` | yes |

`TSPEC-pdlc-decision-ledger.md:17` reads `| Draft | se-author | 1.4 | 2026-09-01 |`, so the version
numeral and the digest agree. The claim *"TSPEC moved, and only TSPEC"* is a measured fact, and the
re-pin is correct rather than transcribed.

TSPEC v1.4's changelog is what the entry says it is: two self-corrections *against that document*,
declaring the code right and untouched. I checked the id surface — v1.4 mints, retires and re-scopes
no `BR-`, `AC-`, `E-`, `M-`, `O-` or `ERR-` id and moves no threshold or measured value — so nothing
about the PLAN's oracle design, batch arithmetic or acceptance obligations is owed absorption. Only
the two inverted mechanism claims are.

## Do the three loci now match HEAD?

Both corrections are testable against `pdlc/workflows/orchestrate-dev.js` at HEAD, and I checked each
conjunct rather than taking the instruction's word for it:

| Claim now in the PLAN | Checked at HEAD | Result |
|---|---|---|
| `reviewerPrompt` is **unchanged**, at eight parameters, taking no ledger parameter | `orchestrate-dev.js:11906` — `doc, phase, feature, iteration, reviewer, docType, frozen = false, findingGrammar = false` | eight, no ninth |
| `reviewerPrompt` is module-private and called twice from inside `reviewLoop` | the only two call sites are `reviewerPrompt1` / `reviewerPrompt2` in `reviewLoop`; no export | holds |
| `dispatchAndVerify` gains the trailing `ledgerBlock = ""` option | `:11461` `async function dispatchAndVerify({ … ledgerBlock = "", … })` | holds |
| the block threads through `reviewLoop`'s `wrapped` / `runWrapped` closures | `:9759`, `:9785` both take a trailing `ledgerBlock = ""`; `:9777` forwards it into the dispatch options | holds |
| the four-field seam payload `{ feature, phaseId, docType, round }` | `:9997` — `await _injectDecisionLedger({ feature, phaseId: phase, docType: roundDocType, round: iteration })` | character-for-character |
| the `await` sits immediately before the two `reviewerPrompt` calls | `:9995`–`:9997`, then `reviewerPrompt1` at `:9999` | holds |
| concatenated **last**, after the pacing-contract clause, the opener and `learningsBlock` | `:11616` — `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` `` | holds; the quoted expression is byte-exact |
| TSPEC §2.4 / §4.5 name the same mechanism | TSPEC `:517`–`:522` (§2.4, with its own *Corrected in v1.4* note) and §4.5's *`reviewerPrompt` unchanged* declaration | agree |

The reason the builder-side append was unreachable is now stated in the PLAN in the same terms the
source comment at `orchestrate-dev.js:11919`–`:11921` states it, so the instruction and the code no
longer disagree about *why*, not merely about *where*. That matters more than it looks: the whole
class of defect here is a reader "restoring" the deleted parameter to satisfy stale prose, and the
instruction now forecloses that explicitly.

## Do the claimed invariants actually hold?

The entry claims T-18's task id, batch, `Deps`, Test File, Source File cells and every other row are
byte-identical. The diff bears that out mechanically — T-18's row diff shows `| 8 | T-10, T-10a,
T-11, T-17 | ✅ |` on both sides, both Test File and Source File cells unchanged, and the only other
hunks are the pin, the status row, the changelog and two prose rows. T-18's other invariants (the
destructured flag read against PROP-DIS-06, the conditional-spread `report.decisionLedger`, the
writes-no-census-constant rule, the delta-coverage obligations and the un-skip list) survive
verbatim. No batch, dependency edge, ownership-manifest cell, red-before-green edge or measured value
moved, so no batch re-derivation is owed and none of my round-13 batch arithmetic needs redoing.

**Nothing previously approved is broken.** In particular, no oracle design changes: T-09's
hand-transcribed literals, T-07's independently transcribed formatter, T-03's fixture-guard equality
and T-04's set-equality enumeration are untouched, and the red-before-green edges table still
enumerates every `[green]`/`[red]` pair element-for-element.

## The one thing the sweep missed

The entry's premise is *"Both corrections invert claims this PLAN reproduced, so **three** loci here
were stale on the same axis"*. That enumeration is short. Three further sites reproduce the same
inverted claim and were not swept — and one of them is a **`[red]` test-task instruction**, which is
the derivation source for an oracle rather than commentary:

- `:166`, T-10's `[red]` instruction, AT-05's enabled-path clause: *"the block is appended **last**,
  after `oraclePart` and `findingGrammarPart`, on both the iteration-1 and iteration-≥2 return paths
  of `reviewerPrompt`"*. `oraclePart` and `findingGrammarPart` are `reviewerPrompt` internals; the
  delivered-prompt append happens in `dispatchAndVerify` after the pacing/opener suffix. A test
  author re-deriving from this row writes the assertion at a locus that no longer exists.
- `:167`, T-10a's assembly chain, terminates at `→ reviewerPrompt`.
- `:235`, the file-ownership manifest cell for `orchestrate-dev.js`, still reads *"the `reviewLoop` /
  `reviewerPrompt` parameters"*.

This is **not a delivery gap**, and I want that recorded plainly so nobody remediates code over it:
the shipped oracle is correct. `decisionLedgerLoop.test.js:266`/`:279` assert
`round1a.endsWith(LEDGER_MARKER)` on the *delivered* prompt for both reviewers on both the iteration-1
and iteration-≥2 paths — positive presence at the terminal byte, not an absence-shaped
"differs-from-baseline" proxy. The suite is green. What is stale is the prose the test was derived
from (and, downstream, that file's own header comment at `:6`–`:10` and `:254`–`:256`, which recites
the same dead shape). That is precisely the hazard `CODE_REVIEW-pdlc-decision-ledger-v1.md` row 34
named — *"flagging so a later reader does not 'restore' the deleted parameter"* — and this erratum
was the round that could have closed it document-wide.

Related and already routed, recorded here only so the chain stays visible: `PROPERTIES:344`
(PROP-WIRE-08) still pins the append to `reviewerPrompt`'s two return paths at dead anchors
`orchestrate-dev.js:11483`/`:11506`. That is PROPERTIES' erratum, not the PLAN's; it is raised in
`CROSS-REVIEW-test-engineer-TSPEC-v15.md` F-02 and open at HEAD. I do not re-route it here.

My two round-13 items are also still open — the erratum scoped itself to the TSPEC axis, which is
legitimate, but neither was in that scope and neither has been addressed: `:190`–`:191` still reads
*"T-10a and T-12a sit in batch 2"* against T-12a's own `Batch` cell of `4`, and `:257` still says
`decisionLedgerConfig.test.js`'s *"three owners"* where the manifest carries four. Both are recorded
below as `inherited`, non-gating, exactly as in round 13.

## Positive Observations

- The re-pin was **derived, not transcribed**. Three of four digests were re-measured and found
  unmoved, and the entry says so; the one that moved is the one that moved. A no-op re-grounding is
  the cheapest kind of claim to assert and the cheapest to get wrong, and this one was measured.
- The T-18 instruction now quotes the shipped concatenation expression verbatim, so its correctness
  is checkable by string comparison rather than by reading. That is the right shape for an
  instruction whose whole failure mode was a wrong locus.
- The correction records *why* the builder-side append was unreachable, not only that it was. An
  instruction that carries its own rationale resists being "fixed" back to the broken form.
- The blast radius is honestly stated and mechanically true: 5 hunks, 8/6 lines, no batch, edge,
  ownership cell or measured value moved. I re-derived nothing because nothing asked me to.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | The sweep is short by three sites, and one is a `[red]` test-task instruction. T-10's AT-05 enabled-path clause still derives the oracle against *"both the iteration-1 and iteration-≥2 return paths of `reviewerPrompt`"*, after `oraclePart`/`findingGrammarPart` — the exact shape TSPEC v1.4 retired. The shipped test asserts correctly (`decisionLedgerLoop.test.js:266`/`:279`, `endsWith` on the delivered prompt), so there is no delivery gap; the risk is re-derivation restoring the deleted parameter, the hazard `CODE_REVIEW` v1 row 34 named. The changelog's *"three loci"* count is therefore also inaccurate. | T-10 `[red]` row, AT-05 enabled-path clause (`:166`) |
| F-02 | Low | delta | nonlocal | Two further same-axis sites unswept: T-10a's assembly chain terminates at `→ reviewerPrompt` (`:167`), and the file-ownership manifest's `orchestrate-dev.js` cell still reads *"the `reviewLoop` / `reviewerPrompt` parameters"* (`:235`). Both are descriptive rather than derivation sources, so neither can mislead a test author on its own; they should ride along with F-01's fix. | T-10a row (`:167`), §File-ownership manifest (`:235`) |
| F-03 | Medium | inherited | nonlocal | Unresolved from round 13 (F-01): the batch re-derivation subsection still reads *"T-10a and T-12a sit in batch 2"*, four sentences below the derivation that puts T-12a in **4** and against the row's own `Batch` cell of `4`. The conclusion the sentence reaches (no other row's batch moves) is independently true, so no implementer batches wrong; the document contradicts itself on the field the wave planner reads fastest. | §Batch column re-derivation (`:190`–`:191`) |
| F-04 | Low | inherited | nonlocal | Unresolved from round 13 (F-02): the disjointness premise calls `decisionLedgerConfig.test.js` a file *"whose three owners sit in batches 2, 3 and 4"* while the ownership manifest carries **four** rows (T-04 b2, T-13 b3, T-12a b4, T-19 b9) and the sentence itself names the fourth. All four batches are distinct, so the single-writer-per-batch guard still holds; only the count word is short. | §Disjointness premise, multi-owner paragraph (`:257`) |

FINDING: Medium | delta | nonlocal | T-10's `[red]` AT-05 instruction (PLAN:166) still derives the append oracle against `reviewerPrompt`'s two return paths after `oraclePart`/`findingGrammarPart` — the locus TSPEC v1.4 retired; the erratum swept three loci and this is a fourth, so the changelog's "three loci" count is short. Shipped oracle is correct (decisionLedgerLoop.test.js:266/:279 endsWith on the delivered prompt); risk is re-derivation restoring the deleted parameter.
FINDING: Low | delta | nonlocal | Two further unswept same-axis sites: T-10a's assembly chain terminates at `→ reviewerPrompt` (PLAN:167) and the file-ownership manifest's orchestrate-dev.js cell reads "the `reviewLoop` / `reviewerPrompt` parameters" (PLAN:235). Descriptive, not derivation sources; fix alongside F-01.
FINDING: Medium | inherited | nonlocal | Round-13 F-01 still open: §Batch column re-derivation (PLAN:190–191) reads "T-10a and T-12a sit in batch 2" against T-12a's own Batch cell of 4, contradicting the derivation four sentences above. Conclusion unaffected; the batch numeral is the field the wave planner reads.
FINDING: Low | inherited | nonlocal | Round-13 F-02 still open: §Disjointness premise (PLAN:257) says decisionLedgerConfig.test.js has "three owners" while the ownership manifest enumerates four (T-04 b2, T-13 b3, T-12a b4, T-19 b9). Four distinct batches, so the single-writer guard holds; count word only.

## Verdict

The absorption itself is correct and mechanically verified: the TSPEC v1.4 pin re-derives to the
measured digest, the three rewritten loci match `orchestrate-dev.js` at HEAD conjunct by conjunct —
eight-parameter `reviewerPrompt`, `dispatchAndVerify`'s trailing option, the `wrapped`/`runWrapped`
thread, the four-field seam payload and the terminal concatenation — and every claimed invariant
(task id, batch, dependency, ownership cell, measured value) is byte-identical. No High. The sweep
missed three same-axis sites, one of them a red-test derivation source, and my two round-13
bookkeeping items remain open; none of the four gates.

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841
APPROVAL-HASH-NORMALIZED: sha256:1bdbd2a1b2ea237684ce9134fa5813431a5af220d69fda317f3a11345f7852bc
REVIEWED-COMMIT: e366596b8f905bc7bc5da9a6e28cf276ae5ca629
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
