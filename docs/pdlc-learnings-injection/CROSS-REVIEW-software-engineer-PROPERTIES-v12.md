# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 12 (upstream-cascade confirmation — PLAN v0.8 → v0.9; PROPERTIES bytes unchanged)

## Overview

**What this round is.** An upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are
unchanged since my v11 approval (`sha256:e9de08bc…`, `REVIEWED-COMMIT: a469ef4b`); PLAN moved from
v0.8 to v0.9 under `ba120270` after that approval was recorded. The single question I answer is
whether PROPERTIES is still a faithful compression of PLAN as PLAN now stands.

**The delta, measured.** `git show ba120270 -- …/PLAN-…md` is 4 insertions / 3 deletions across three
hunks and nothing else:

1. **Version cell** (`PLAN-…md:18`): `| pdlc | Draft | Claude | 0.8 | 2026-08-21 |` → `0.9`.
2. **P-A-7 lead-in**: *"named here, ahead of the run they govern, in the two cases that can arise:"* →
   *"…in the three cases that can arise (A, B and C below):"*. A wording correction only — the table
   below it grew to three rows at v0.8 and the lead-in had not followed; the case A/B/C rows are
   byte-identical.
3. **LI-08's amendment note**: the claim that `renderSection`'s `ordinal`, `gloss` and `body` are
   *"all three unexercised by any landed suite"* was false for `body` and is restated as two
   unexercised knobs plus one already-exercised one, with the counter-evidence named inline
   (`learningsBlock.test.js` on all six section specs, `learningsSelect.test.js` on the non-BR-6
   section). The conclusion — the amendment adds **callers**, not knobs — is unchanged.

Plus a v0.9 changelog row recording both. No task moved batch, no `Deps` edge changed, no AT
partition, fixture or manifest row moved, and the batches 7–13 ledger is untouched.

**Verification method — repository, not documents.** `shasum -a 256` over all six feature documents;
`git log --oneline` on PLAN to confirm `ba120270` is the tip and no later PLAN commit exists;
`git show ba120270` for the full delta; `grep -cF` of every PLAN quotation PROPERTIES carries against
PLAN at HEAD; `git grep -c "body:"` at `21edb7c5` and at HEAD across the two landed suites to
independently check PLAN's *corrected* claim rather than take it on authority.

**Upstream pins.** REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…` all
match the dispatched hashes byte-for-byte and are byte-identical to what I verified at v10/v11 — this
cascade has exactly one moving part. PLAN measures `sha256:eaddd392…`, matching the dispatched hash,
with version cell `0.9`.

**PLAN's corrected claim is true at HEAD.** `git grep -c "body:"` returns 6 in
`learningsBlock.test.js` and 1 in `learningsSelect.test.js` (7 total, same count at `21edb7c5`), which
is exactly what v0.9's restatement asserts. The erratum fixed a real defect and fixed it correctly.

**Conclusion up front.** PROPERTIES holds. Both corrections move PLAN *toward* what PROPERTIES already
said, not away from it: PROPERTIES has described the P-A-7 table as three-case since v0.10 and never
carried the `body`-unexercised claim. One bookkeeping consequence follows — PROPERTIES' PLAN version
pins now read `v0.8` where PLAN reads `v0.9` — filed Low below.

## Properties

**No property statement is disturbed, and I measured that rather than inferring it from the delta's
size.** PROPERTIES' seventy `PROP-` statements, §C.1's 35-of-35 and §C.3's 23-of-23 enumerations, and
the AT/level/owning-task partitions all reconcile against a PLAN task table the erratum did not touch:
the only task row inside the delta is **LI-08**, and inside that row only the amendment note's prose
about which `renderSection` knobs are exercised changed. LI-08's ATs (`LI-AT-05`, `LI-AT-11`,
`LI-AT-12`), its file (`__tests__/learningsBlock.test.js`), its batch (3) and its `Deps` (LI-02) are
byte-identical.

**The one place PROPERTIES leans hardest on PLAN — §C.4 — leans on text the delta did not move.**
§C.4's argument is built out of six quotations from PLAN's P-A-7 material. I checked each with
`grep -cF` against PLAN at HEAD; all six still resolve, verbatim, count 1:

| Quotation carried in §C.4 / §G.3 | Present in PLAN at HEAD |
|---|---|
| *"under case C they owe no ledger row, and they owe green."* | yes |
| *"after batch 13, the case that is live at HEAD"* | yes |
| *"batch 9 through batch 12"* (case B's re-scope) | yes |
| *"any other amendment to a landed suite arriving from here on"* | yes |
| *"**this** heading-form follow-up commit, not a standing exemption for those files"* | yes |
| *"the first point the suite is green"* (P-A-6) | yes |
| *"has found a real defect, not staged a TDD red"* | yes |

So every load-bearing sentence §C.4 compresses is still upstream, still saying the same thing, in the
same words.

**The lead-in correction moves PLAN toward PROPERTIES, not away from it.** PROPERTIES has said since
v0.10 that PLAN carries a *"**three**-case table"* (`:1110`) and enumerated cases A, B and C. PLAN's
stale *"two cases"* lead-in was, at v0.8, a live inconsistency between PLAN's prose and PLAN's own
table — and PROPERTIES had already resolved it the way v0.9 now resolves it, by reading the table.
After this erratum the two documents agree at the wording level as well as the structural one. This is
the rare cascade where the upstream edit *retires* a discrepancy the downstream had been silently
absorbing.

**The `renderSection` correction touches nothing PROPERTIES asserts.** I grepped PROPERTIES for
`renderSection`, `body:`, "free-form" and "knob": zero hits. PROPERTIES never carried the retracted
"all three unexercised" claim, so there is nothing to retract downstream. What PROPERTIES *does* say
about the landed builder's rendering — §C.4:1121, *"the builder renders the canonical glossed
`\"Rejected Proposals (with rationale)\"`"* — is a claim about the **glossed title form**, not about
the `gloss` parameter's exercise, and it remains true at `21edb7c5`. PROPERTIES' §F.1 heading-form
discussion (`:876`, `:891`, `:893`: the ordinal is optional and carries no meaning; the trailing gloss
is optional; 9 of 9 corpus documents write the glossed form) is a statement about the **corpus**, not
about test-double call sites, and is orthogonal to which knobs a landed suite passes.

**Where PROPERTIES is now stale: the version pins.** PROPERTIES pins PLAN as `v0.8` in five places —
the header upstream row (`:11`), §C.4's *"of PLAN's **three**-case table at v0.8"* (`:1110`), *"a
ruling PLAN v0.8 scopes to…"* (`:1155`), *"**P-A-6** (byte-unchanged at v0.8)"* (`:1170`), and §G.3's
*"PLAN at HEAD (**v0.8**)"* (`:1299`, with three further `v0.8` attributions in the struck bullets).
PLAN at HEAD is **v0.9**. Two observations keep this Low rather than gating:

- Every *substantive* claim attached to those pins survives v0.9 unchanged. The table is still
  three-case; the case B re-scope and case C ruling are byte-identical; and **P-A-6 is still
  byte-unchanged** — I re-measured, and the erratum's three hunks are the version cell, the LI-08 row
  and the P-A-7 lead-in, none of which is P-A-6's row.
- The attributions in the struck §G.3 bullets (*"answered by PLAN **v0.8**'s new case C"*) are
  **historical provenance**, not HEAD claims: case C *was* introduced at v0.8, and that stays true
  forever. Those are correct as written and should not be rewritten to v0.9.

Only §G.3:1299's *"PLAN at HEAD (**v0.8**)"* and the header row's version pin are assertions about
HEAD, and only those two are now false. That is the finding below.

## Oracles

**No oracle is inside the cascade, and the three discipline checks I apply to every round still pass
on the text the delta reaches.** §O.1–§O.9, §G.1's obligation table and §O.8's mutation ledger are all
downstream of PLAN material the erratum did not touch, and the four non-PLAN upstreams (REQ, FSPEC,
TSPEC, DECISIONS) are byte-identical to their v11 pins, so the oracle surface has no second input that
moved.

- **No implementation echo introduced.** The erratum adds no expected value anywhere. The one place it
  discusses test-visible values — LI-08's note on which `renderSection` arguments landed suites pass —
  names *call sites*, not assertions, and PROPERTIES carries no corresponding expectation. §C.4's own
  literals (`40` beside "Hand-computed (never derived here)", `66`, the deliberately non-binding
  `100000`) are re-statements of what `learningsBlock.test.js` already ships at `21edb7c5`, and are
  outside the delta.
- **No absence-only oracle created.** The delta's only absence-shaped statement is about *PLAN's*
  ledger ("owe no ledger row"), not about a test assertion. PROPERTIES' one absence-adjacent oracle in
  this neighbourhood, PROP-BOUND-03's zero case, keeps its positive conjunct — the
  `{material: "", bounded: false, bytes: 0, sections: []}` return — and is untouched.
- **Set-equality, not containment.** §C.1's 35-of-35 and §C.3's 23-of-23 enumerations are closed sets
  reconciled against PLAN's task table; since no task row's ATs, file, batch or `Deps` moved, both
  reconciliations still close. §G.3's routed-errata list is itself an enumeration, and the erratum
  neither adds nor removes an item from it.

**The `LI-AT-11` obligation §C.4 tracks is unchanged in substance and better-grounded in fact.** PLAN's
LI-08 row still owes the same four fixture shapes — the un-numbered `## Cross-Feature Patterns`, the
un-glossed `## Rejected Proposals`, the `###`-as-body line and the `## Process Findings` near-miss —
and still declares them in LI-02's spec surface with LI-08's existing `Deps` edge carrying it. What
changed is only the *arithmetic of the reuse argument*: two knobs added as callers plus one reused,
rather than three added. PROPERTIES' §C.4 accounting of what the landed suite carries versus what is
owed (`:1119`–`:1125`) is expressed in terms of **fixture shapes present or absent at `21edb7c5`**,
not in terms of builder parameters, so it is invariant under this correction. I re-measured the two
facts it rests on: at `21edb7c5` `learningsBlock.test.js` carries
`expect(result.sections).toEqual(["Cross-Feature Patterns"])` and has no `extractInjectableMaterial(text, 0)`
call. Both still hold.

**§G.3's one open item is unaffected.** The TSPEC AT-15 suite-assignment mismatch (clauses 2–3
asserted at L2/L3 while §T.5 lists AT-15 wholly under the L1 selection suite) is a TSPEC-side item;
TSPEC is byte-identical this round, so the item is neither resolved nor widened by the erratum, and it
remains correctly routed. No new erratum line is owed from here on its account.

**The DEC-ERR-01 discipline holds.** Neither correction reopens a question PROPERTIES had routed
upward. Both P-A-7 case-B items PROPERTIES raised at v0.6 stay struck under *Also answered — by PLAN*,
and their strike text stays accurate: case C still rules the ledger empty, case B is still re-scoped
to batches 9–12, and batch 14's unqualified gate still replaces the terminus-less span. Re-emitting
either would be the anti-pattern.

## Fixtures

**§F.1–§F.4 are outside the delta, and the one fixture-adjacent claim the erratum touches lands in
PROPERTIES' favour.** The fourteen-row fixture inventory, `fixtures/learnings-baseline/`'s four-path
row (`4a6c1816`), the `helpers/learningsFixtures.js` row (LI-02, `1920f281`), §F.2's byte-identity
baseline, §F.3's verbatim-fixture-string rule and §F.4's seam doubles are all downstream of PLAN rows
the erratum did not move.

**The corrected LI-08 note is a claim about the fixture builder — and PROPERTIES' version of it was
already the accurate one.** PLAN v0.8 said `renderSection`'s `ordinal`, `gloss` and `body` were "all
three unexercised by any landed suite". PROPERTIES never said this. What §F.1 says instead is about
the **corpus** and the **rendered form**: the ordinal prefix is optional and carries no meaning
(`:876`), the trailing gloss is optional and 9 of 9 corpus documents write the glossed form (`:891`,
`:893`), and at `21edb7c5` the builder renders the canonical glossed `"Rejected Proposals (with
rationale)"` (`:1121`). None of those is a statement about which named arguments landed suites pass,
so none is invalidated. I verified the corrected claim independently rather than accepting it:
`git grep -c "body:"` returns 6 in `learningsBlock.test.js` and 1 in `learningsSelect.test.js`, both
at `21edb7c5` and at HEAD — exactly the two counter-examples v0.9 cites.

**The consumer-exemption sentence still tracks PLAN exactly.** §C.4:1155 says
`helpers/learningsFixtures.js` and its other consumers carry no row of their own in *"any of the three
cases"*, a ruling PLAN scopes to *"**this** heading-form follow-up commit, not a standing exemption
for those files"*. That PLAN sentence is present verbatim at HEAD (grep count 1), and the erratum did
not touch the case A/B/C table it sits beneath. The "three cases" phrasing in PROPERTIES is now
*more* aligned with PLAN than it was, since PLAN's lead-in says "three" too.

**The additivity premise is undisturbed.** PLAN still declares the heading-form follow-up commit
additive against `learningsBlock.test.js` and non-additive against the Group D amendments to the
landed `learningsSelect.test.js` (LI-07, `1544fdbd`), with case C governing both — empty ledger, green
at landing, fix owed before batch 14 if one reds. PROPERTIES' §C.4 routes its amendments the same way.
The two documents still agree on which branch is live.

**§F.3's verbatim-fixture rule is unaffected.** Nothing in the delta pins a user-facing string, moves
a normative lexicon entry or paraphrases a fixture body. The `## Cross-Feature Patterns`,
`## Rejected Proposals`, `## Process Findings` and `###` spellings PROPERTIES reproduces are spelled
identically in PLAN's LI-08 row before and after the erratum — I diffed the row and the variant-shape
enumeration is character-for-character unchanged.

**Fixture-side conclusion.** No fixture row, path, hash pin or consumer status moved; the `21edb7c5`
snapshot pin that protects the fourteen-row reconciliation from staleness still resolves to a real
commit; the cascade's fixture half is clean.

## Delta-Confirmation Findings

## Positive Observations

- **The erratum retired a discrepancy PROPERTIES had been absorbing.** PLAN's "two cases" lead-in
  contradicted PLAN's own three-row table since v0.8; PROPERTIES had already read the table and
  described it as three-case. The correction makes the two documents agree at the wording level, not
  just structurally — a cascade that reduces downstream risk instead of adding it.
- **The `body` correction was made the hard way.** v0.9 does not just delete the false claim; it names
  the counter-evidence (six section specs in `learningsBlock.test.js`, the non-BR-6 section in
  `learningsSelect.test.js`) so the claim is checkable rather than asserted. I checked it —
  `git grep -c "body:"` returns 6 and 1 — and the restated conclusion is strictly stronger than the
  original: two knobs gain callers, one is reused, so the reuse argument improves.
- **The blast radius was bounded and the changelog says so checkably.** v0.9's row claims no task moved
  batch, no `Deps` edge changed, no AT partition/fixture/manifest row was touched and the batches 7–13
  ledger is byte-identical. The three-hunk diff confirms every clause; a changelog whose scope claims
  can be diffed is what made this confirmation cheap.
- **PROPERTIES' quotation discipline paid off again.** Because §C.4 quotes PLAN verbatim rather than
  paraphrasing, I could answer "does upstream still say this?" with seven `grep -cF` calls instead of a
  re-reading. Every one resolved.

## Recommendation

**Approved with minor changes.**

PROPERTIES still holds as approved against PLAN v0.9. Both corrections move PLAN toward what
PROPERTIES already said: PROPERTIES has described P-A-7 as a three-case table since v0.10, and it
never carried the retracted `body`-unexercised claim. All seven PLAN quotations §C.4 and §G.3 depend
on resolve verbatim at HEAD; P-A-6 is still byte-unchanged; the case A/B/C rows, LI-08's ATs, file,
batch and `Deps`, and the batches 7–13 ledger are untouched, so §C.1's 35-of-35, §C.3's 23-of-23 and
all seventy `PROP-` statements still reconcile.

The one thing to fix at the next ordinary touch of this document — not now, and not gating — is the
HEAD-facing PLAN version pin: the header upstream row and §G.3's *"PLAN at HEAD (**v0.8**)"* should
read **v0.9**. The historical attributions in the struck §G.3 bullets (*"answered by PLAN v0.8's new
case C"*) are provenance and are correct as written; do not rewrite those.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | PROPERTIES' HEAD-facing PLAN version pins read `v0.8`; PLAN at HEAD is `v0.9` after this erratum. Two sites are assertions about HEAD and are now false: the header upstream row (`:11`, `` `PLAN-…md` (**v0.8** …) ``) and §G.3's *"PLAN at HEAD (**v0.8**)"* (`:1299`). Every substantive claim attached to those pins survives v0.9 unchanged — the table is still three-case, case B's batch 9–12 re-scope and case C's ruling are byte-identical, and P-A-6 is still byte-unchanged — so no property, oracle, fixture or trace moves. Fix: bump both to v0.9 at the next ordinary revision. Leave the struck §G.3 bullets' *"answered by PLAN v0.8"* attributions alone; those are provenance, not HEAD claims, and are correct. | Header upstream row (`:11`); §G.3 *Also answered — by PLAN* (`:1299`) |

FINDING: Low | delta | local | Header upstream row (:11) and §G.3 "PLAN at HEAD (**v0.8**)" (:1299) | Stale HEAD-facing PLAN version pin: PROPERTIES pins PLAN v0.8, PLAN at HEAD is v0.9 after this erratum. Substance is unaffected (three-case table, case B batches 9-12, case C ruling and P-A-6 all byte-identical); bump both pins to v0.9 at the next ordinary revision, and leave the struck §G.3 bullets' historical "answered by PLAN v0.8's new case C" attributions unchanged.


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:e9de08bcefa8e343ce2895301ce0fb39b6e1115eccdbd5e7acaa9875fe842489
APPROVAL-HASH-NORMALIZED: sha256:887efa6a28bdadd78287e7b8d6c1bca23dbddebd6611e19f373eaf9bfa997121
REVIEWED-COMMIT: 72771ffa100c88741e3c76fcd23c40733d534fef
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
UPSTREAM-STATE: TSPEC sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
UPSTREAM-STATE: DECISIONS sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32
UPSTREAM-STATE: PLAN sha256:eaddd3928e3c68853624fb78d2fc43ac900c14a3636e4fba96035d57e793011f
