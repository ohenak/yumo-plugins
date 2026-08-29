# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1, bytes unchanged)
**Date:** 2026-08-29
**Iteration:** 3 (upstream-cascade confirmation — TSPEC moved, PROPERTIES did not)

## Overview

**Question answered:** does PROPERTIES v1.1, approved unchanged at round 2, still hold as a faithful
compression of TSPEC as TSPEC now stands? **No.** Three of its properties transcribe operand wording
that TSPEC has since retired *as unsatisfiable*, and one TSPEC assertion newly designated as a
field's sole proof has no property at all.

**Scope of the cascade, measured rather than assumed.** My round-2 approval recorded
`UPSTREAM-STATE: TSPEC sha256:28d25518…`. That blob is TSPEC at `1a2d78cba~1` (v0.8). TSPEC at HEAD
is `sha256:b1b603a8…` (v1.0). Four content commits sit between them, not one:

| Commit | TSPEC version | Sections touched |
|---|---|---|
| `1a2d78cba` | 0.9 (in progress) | §7, §7.2 — re-measured subject file; re-homed the flag-off `report` referent |
| `4b28af44a` | 0.9 (in progress) | §7.3 — census made satisfiable over its whole token set (TE F-01, F-02, both High) |
| `588f4323e` | 0.9 (in progress) | §5.4 — report field pointed at its sole proof (PM Q-01) |
| `452d72c07` | 1.0 (erratum) | §7.3 — the three census constants given a stated home as test-file declarations, removed from the owned-declaration list |

So this confirmation is **not** scoped to the v1.0 erratum alone. The erratum's own three edits are
narrow and, taken by themselves, leave PROPERTIES untouched — no property names
`DECISION_LEDGER_CENSUS_EXEMPT` or `DECISION_LEDGER_OWNED_DECLS`, so nothing in PROPERTIES asserts
the membership the erratum corrected. The damage is in v0.9, which landed between my approval and
this dispatch and which PROPERTIES has never been measured against. Per DEC-ERR-03 I review this
document against upstream **at HEAD**, so those items are findings of this round.

**Why the divergence is High rather than a re-pin chore.** TSPEC v0.9's changelog states that the
operand pair PROPERTIES still transcribes "could not go green on a conforming implementation" —
`gatherDecisionCorpus`, §5.2's three catalogues and every intra-feature mention inside a sibling
declaration all sat in the scanned remainder, so four of the six tokens would have occurred there on
correct code. PROP-INV-06 and PROP-INV-07 are the pre-repair wording verbatim. An implementer
working from PROPERTIES alone — which is the document's job — would build a census that cannot pass,
and the ✖ marks on those rows say a red-first test is owed for exactly that shape. This is the
falsifiability failure mode PROPERTIES exists to prevent, inherited from a stale pin.

Nothing here re-opens a settled decision. Every fix below is a re-transcription of TSPEC's current
operand text into rows that already exist, plus two rows for assertions TSPEC newly makes
load-bearing. No product scope moves: `REQ` BR-11 / NG-4 and `REQ` C-2 are unchanged, and PROPERTIES
still adds no behaviour the REQ does not ask for.

## Properties

I re-read every property that leans on a changed TSPEC section (§7.3, §7.2 conjunct 3, §5.4, §7) at
its current version. Ten rows touch that surface; six still hold, four do not.

| Property | Holds at TSPEC v1.0? | Evidence |
|---|---|---|
| PROP-INV-06 | **No** | Transcribes the retired exclusion set |
| PROP-INV-07 | **No** | Transcribes the retired companion check |
| PROP-INV-08 | Yes, but under-covers | §7.3's honesty rule gained a second conjunct |
| PROP-INV-09 | Partly | Rationale survives; the two named homes do not |
| PROP-INV-10 | Yes | `REQ` NG-5 pins unmoved |
| PROP-INV-01…05 | Yes | §7.7 / §5.5 untouched by the delta |
| PROP-WIRE-04, -05 | Yes | §7.2 conjuncts 1 and 2 unchanged |
| PROP-WIRE-11 | Yes | §5.4's conditional-spread discipline unchanged, and now explicitly re-stated there |
| PROP-OFF-05 | **No** | Names a referent §7.2 now expressly rejects |
| PROP-DISC-07 | Yes | Unrelated to the delta (repo-hygiene census, not the source census) |

**PROP-INV-06 — the exclusion set is the pre-repair one (F-01).** The row scopes the census to
"anywhere in `orchestrate-dev.js` **outside** the four regions this feature owns: the three function
bodies sliced by brace-matching from their declarations, and the `main()` wiring run". TSPEC §7.3 now
subtracts "the body of **every** declaration this feature introduces — the frozen list
`DECISION_LEDGER_OWNED_DECLS`, i.e. §4.1/§4.2/§4.4's six functions plus every top-level constant it
declares: §3.1's `DECISION_CORPUS_ARGV`, §3.2's `DECISION_HEADING_RE`, §4.1's
`DECISION_LEDGER_DEFAULTS`, §4.3's `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT`, and
§5.2's three catalogues". Two divergences, not one:

1. **Membership.** Three bodies versus roughly fourteen. TSPEC states in terms what the three-body
   form costs: `gatherDecisionCorpus` and the three catalogues are top-level declarations that carry
   the token strings, so they land in the remainder and the "zero occurrences" assertion reds on
   conforming code.
2. **Slicing method.** PROP-INV-06 says "brace-matching from their declarations"; TSPEC now says
   "from a declaration's own line to the **next top-level declaration of any name**, boundaries taken
   from *all* of the module's top-level declarations", i.e.
   `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`. Brace-matching is not a
   detail here — three of the newly-owned members (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`,
   the preamble strings) are constants with no brace body, so the method PROPERTIES names cannot
   slice the members TSPEC now requires be sliced.

**PROP-INV-07 — the companion check is the one TSPEC calls red by construction (F-02).** The row
requires `DECISION_LEDGER_CENSUS_TOKENS` be "**set-equal** to the module's exported decision-ledger
symbol names". TSPEC §7.3's *How it is kept honest* column now opens by rejecting precisely that:
"Not set equality against *all* of the module's decision-ledger exports — that comparison is red by
construction, since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only these six are
data-carrying." The replacement is a stated **partition**: `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` =
`OWNED_DECLS`, the two sub-sets **disjoint**. No property states the partition, the disjointness, or
the erratum's own correction — that the three census constants are declarations of the census test
file and therefore members of neither sub-set. The document that is supposed to make the census's
non-vacuity falsifiable currently states its non-vacuity guard in a form TSPEC has retired.

**PROP-INV-08 — true but now under-covers (F-04).** "Every census slice must be asserted non-empty"
is still TSPEC's text. But §7.3's honesty column now carries a second, separable conjunct the delta
introduced: "`DECISION_LEDGER_OWNED_DECLS` is frozen and each member must resolve to **exactly one**
top-level declaration at HEAD, so a rename or a deletion reddens rather than silently shrinking the
exclusion." Non-emptiness does not catch a member resolving to *two* declarations, and a member
resolving to *zero* is what the erratum round was convened over. That conjunct is exactly the one
the v1.0 erratum found violated in the spec itself; leaving it unmapped means no test would have
caught what a review round did.

**PROP-INV-09 — rationale survives, both pointers are stale (F-05).** Its quoted reason (the
`learningsInjectionField` analogue is named at call sites far outside the wiring sentinels, so a
`decisionLedger` token would red on conforming code) is still verbatim TSPEC. Its closing clause —
"What the field is owed instead is behavioural — PROP-OFF-05 and PROP-WIRE-11" — is not. TSPEC now
names "exactly two named homes", both inside §7.2's live composition-root arm, and adds that "§7.6's
AT rows are **not** a home for it". PROP-OFF-05 is the FX-BASELINE guard (owner T-02), not that arm.

**The supporting rationale paragraph is now the retired argument (F-06).** The prose under the INV
table opens "PROP-INV-06's two operands are both frozen and both set-equality-checked, which is the
whole reason the census is implementable", then recounts an *earlier* failure (the ubiquitous `id`
token, the non-existent sentinel regions). Both halves are pre-v0.9. Implementability now rests on
slicing every owned declaration and on the satisfiability predicate §7.3 states in terms — *a token
is unsatisfiable exactly when a conforming implementation mentions it in the scanned remainder* —
and the second operand is no longer "set-equality-checked" against exports at all. A reader auditing
BR-11 through this paragraph is told the census is safe for a reason TSPEC has withdrawn.

## Oracles

Two oracles are implicated by the delta; one is unaffected, one loses an assertion it was assigned.

**The source census (ORC's INV leg, `decisionLedgerCensus.test.js`, owner T-11 → T-18).** The
oracle's shape survives — it still scans `orchestrate-dev.js`, still asserts zero occurrences, still
clones `loopEconomicsAnchorGuard.test.js`. What changes is its two operands, and the oracle is
specified in PROPERTIES only through PROP-INV-06…08. With those three rows carrying retired wording,
the oracle as specified here is unimplementable-as-written (F-01, F-02) and its non-vacuity guard is
under-stated (F-04). One consequential detail for whoever repairs it: the v1.0 erratum establishes
that `DECISION_LEDGER_CENSUS_TOKENS`, `_CENSUS_EXEMPT` and `_OWNED_DECLS` are declarations **of this
test file**, and that "the census never scans the file the three are declared in". PROPERTIES' own
§Module manifest assigns PROP-INV-06…10 to `decisionLedgerCensus.test.js` without recording that
those three constants live there, which is now the fact that makes the partition check coherent —
worth stating so the next reader does not re-derive the erratum's defect.

**The live composition-root arm (`PLAN` T-10a, PROP-WIRE-04/05).** Conjuncts 1 and 2 are untouched
and their properties hold: the `_git` call-count spy on the served reviewer flow (PROP-WIRE-04) and
the positive "prompt ends with the block" assertion (PROP-WIRE-05) both still transcribe §7.2
faithfully. **Conjunct 3 is rewritten and has no property (F-03).** It now reads: "the `report`
object **the flag-off `main()` run itself returns** has a key set whose symmetric difference from the
flag-on run's key set is exactly `{decisionLedger}`, asserted as a set equality in both directions
so a spuriously added or dropped key on **either** arm fails". Three things in that sentence are new
and none is asserted anywhere in PROPERTIES: the *paired-run* referent, the *symmetric difference*
formulation, and the *both-directions* requirement that catches a dropped key as well as an added
one. §5.4's new paragraph makes the stakes explicit — "Deleting that arm deletes the field's only
evidence" — which is precisely the situation a property is supposed to make un-deletable.

This is the DC-07 shape the pipeline has been burned by before: a live production-path assertion
that exists in the spec, is named as an artifact's sole proof, and has no property obliging a test
to carry it. PROP-WIRE-11 does not close it — it is a unit-level contract on the conditional spread
(field absent, never `undefined`), asserted over the injector, not over two `main()` runs.

## Fixtures

**FX-BASELINE is being asked for data it does not contain (F-03, the other half).** PROP-OFF-05
requires that "with the flag off, the `report` key set must be **set-equal** to FX-BASELINE's
flag-off key set … and the emitted notice set must be **set-equal** to the baseline notices array".
PROPERTIES' own FX-BASELINE section records exactly two recorded cases —
`REVIEW-LOOP-REVIEWER-PROMPTS` (exported `reviewLoop`, reviewer-prompt streams) and
`CONFIG-GATE-SPELLINGS` (four config texts through the config gate) — and explains the narrowness
itself: a whole-`main()` recording "would red on this feature's own intended additions — the new
notices, the new report field". So the fixture holds no `report` key set and no notices array to be
set-equal *to*.

TSPEC v0.9 reached the same conclusion and fixed it upstream: §7.2 now states that §7.4's recording
"records one narrow case driving exported `reviewLoop` and captures reviewer-prompt streams, never
`report` keys — §7.4 expressly rejects a whole-`main()` recording *because* it would red on this
feature's new report field — so it cannot serve as the key-set referent". PROP-OFF-05 is the
retired referent, preserved. As written it is not merely mis-pinned, it is unimplementable: the
value it compares against does not exist in the artifact it names.

The other fixtures are unaffected by this delta. FX-CORPUS (25 paths, per-file digests), FX-REPLAY
and FX-FAILOPEN sit under §7.5/§7.6/§6.1, none of which the four commits touched, and the four
corpus literals (6,305 / 10,859 / 12,059 / 441) are stated unchanged in the v1.0 changelog — I
checked that claim against the diff and no literal moves. PROP-DISC-10's 25-path and digest census
therefore still holds, as does PROP-BND's generator range.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v1.0 erratum states the census "never scans the file the three are declared in". Should §Module manifest's `decisionLedgerCensus.test.js` row record that the three constants are declarations of that file? It is the fact that makes the partition check coherent, and it is currently derivable only by reading TSPEC §7.3. |
| Q-02 | F-03's fix needs an owner. PROP-WIRE-04/05 are the live-arm properties (T-10a); PROP-OFF-05 sits in the OFF family under T-02 against FX-BASELINE. Is the paired-run key-set assertion a new PROP-WIRE row under T-10a, with PROP-OFF-05 narrowed to the notice-set half it can actually assert against the fixture? |

## Positive Observations

- **The document's own narrowness argument was right, and upstream came round to it.** PROPERTIES'
  FX-BASELINE section already said a whole-`main()` recording "would red on this feature's own
  intended additions — the new notices, the new report field". TSPEC v0.9 now says the same thing in
  §7.2 as the reason the recording cannot be the key-set referent. PROPERTIES reasoned correctly
  about the fixture; only the assertion built on top of it (PROP-OFF-05) needs to catch up.
- **PROP-WIRE-04's call-count conjunct survived the delta untouched, and is exactly the right
  shape.** "A fake satisfying only the outer interface cannot meet this conjunct" is DC-07's
  builder-not-wired guard stated at the property level, and §7.2's rewrite left it alone.
- **The anti-echo discipline holds through the cascade.** I re-checked the four corpus literals
  (6,305 / 10,859 / 12,059 / 441) against the diff: unchanged, as the v1.0 changelog claims. No byte
  literal, digest or path in PROPERTIES needs re-deriving — every fix below is a re-transcription of
  operand prose, which is the cheap kind of cascade.
- **PROP-INV-09's substantive reasoning is still verbatim-correct upstream.** The `buildFinalReport`
  call-site argument for why `decisionLedger` cannot be a census token survived two erratum rounds
  unchanged; only its downstream pointers moved.
- **The failures are all upstream-pin failures, not authoring failures.** Every finding traces to
  TSPEC v0.9 landing after my approval was recorded. The document was faithful when I approved it.

## Recommendation

**Needs revision**

Three High findings. In order:

1. **F-01** — re-transcribe PROP-INV-06's two operand halves from §7.3 at v1.0: the scanned source
   subtracts every `DECISION_LEDGER_OWNED_DECLS` member, and the slicing runs from a declaration's
   own line to the next top-level declaration of any name.
2. **F-02** — restate PROP-INV-07 as the partition and disjointness check, and record that the three
   census constants are test-file declarations belonging to neither sub-set.
3. **F-03** — give §7.2 conjunct 3's paired-run, both-directions `{decisionLedger}` key-set
   difference a property, and stop asserting a `report` key set against a fixture that has none.

Then F-04 and F-05 (one conjunct and one pointer), and F-06's rationale paragraph, which the F-01/F-02
fixes largely rewrite anyway.

No scope finding: nothing in the delta adds product behaviour, and no acceptance criterion is
narrowed. `REQ` BR-11 / NG-4 and `REQ` C-2 are untouched — what moved is how the spec proves them,
and PROPERTIES has to move with it.

## Delta-Confirmation Findings

All six are **delta**: PROPERTIES was a faithful compression of TSPEC at the version my round-2
approval pinned (`sha256:28d25518…`). The divergences below were created by the upstream edits in
`1a2d78cba..452d72c07`, not by anything present in the pre-round bytes. All six are **local**: every
one sits in a section the upstream edit changed (§7.3, §7.2 conjunct 3, §5.4).

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | PROP-INV-06 transcribes §7.3's retired exclusion set (three brace-matched function bodies + wiring). TSPEC v0.9 subtracts every declaration in `DECISION_LEDGER_OWNED_DECLS` — six functions plus seven top-level constants — sliced declaration-line-to-next-top-level-declaration, and records that the three-body form "could not go green on a conforming implementation". Brace-matching also cannot slice the constant members. Re-transcribe both operand halves. | §Properties, INV family, PROP-INV-06 |
| F-02 | High | delta | local | PROP-INV-07 requires set equality between `DECISION_LEDGER_CENSUS_TOKENS` and the module's exported decision-ledger symbol names — the comparison §7.3 now opens by rejecting as "red by construction". Restate as the partition `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` = `OWNED_DECLS`, disjoint, and record the v1.0 erratum's correction that the three census constants are test-file declarations and members of neither sub-set. | §Properties, INV family, PROP-INV-07 |
| F-03 | High | delta | local | §7.2 conjunct 3's rewritten flag-off assertion has no property: the `report` key sets of the arm's **own paired** flag-off/flag-on `main()` runs must differ by exactly `{decisionLedger}`, asserted in both directions. PROP-OFF-05 states the retired referent (set-equal to FX-BASELINE's flag-off key set) — unimplementable, since FX-BASELINE records reviewer-prompt streams and no `report` key at all. §5.4 names this arm the field's sole evidence. Re-point PROP-OFF-05's notice half at the baseline it can reach, and add a live PROP-WIRE row for the paired-run key-set difference. | §Oracles / §Fixtures; PROP-OFF-05, PROP-WIRE family |
| F-04 | Medium | delta | local | §7.3's honesty column gained a conjunct with no property: each `DECISION_LEDGER_OWNED_DECLS` member must resolve to **exactly one** top-level declaration at HEAD, so a rename or deletion reddens rather than silently shrinking the exclusion. PROP-INV-08's non-emptiness check catches neither a zero-resolution nor a two-resolution member — and zero-resolution is the exact defect the v1.0 erratum round was convened over. Extend PROP-INV-08 or add a sibling row. | §Properties, PROP-INV-08 |
| F-05 | Medium | delta | local | PROP-INV-09's closing clause routes the `report.decisionLedger` field's behavioural obligation to "PROP-OFF-05 and PROP-WIRE-11". TSPEC now names exactly two homes, both inside §7.2's live arm, and states that §7.6's AT rows are **not** a home. PROP-OFF-05 is the FX-BASELINE guard (T-02), not that arm. Re-point at the live arm's two conjuncts once F-03's row exists. | §Properties, PROP-INV-09 |
| F-06 | Low | delta | local | The rationale paragraph under the INV table ("PROP-INV-06's two operands are both frozen and both set-equality-checked, which is the whole reason the census is implementable") states the retired argument: the second operand is no longer set-equality-checked against exports, and implementability now rests on slicing every owned declaration plus §7.3's stated satisfiability predicate. The recounted earlier failure (`id`'s ubiquity, absent sentinel regions) is pre-v0.9 history and no longer the live reason. | §Properties, INV rationale paragraph |

FINDING: High | delta | local | §Properties, PROP-INV-06 | PROP-INV-06 transcribes TSPEC §7.3's retired exclusion set — three brace-matched function bodies plus the wiring run — where §7.3 now subtracts every member of DECISION_LEDGER_OWNED_DECLS (six functions plus seven top-level constants) sliced declaration-line-to-next-top-level-declaration; TSPEC records the old form as unable to go green on conforming code, and brace-matching cannot slice the constant members at all
FINDING: High | delta | local | §Properties, PROP-INV-07 | PROP-INV-07 requires set equality between DECISION_LEDGER_CENSUS_TOKENS and the module's exported decision-ledger symbol names, which §7.3 now rejects as red by construction; the replacement partition (CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS, disjoint) and the v1.0 erratum's test-file homing of the three census constants are stated by no property
FINDING: High | delta | local | §Oracles and §Fixtures, PROP-OFF-05 and the PROP-WIRE family | §7.2 conjunct 3's rewritten flag-off assertion — the arm's own paired flag-off/flag-on main() runs differ by exactly {decisionLedger}, both directions — has no property, while PROP-OFF-05 still asserts the retired referent against FX-BASELINE, which records reviewer-prompt streams and no report key set to be set-equal to; §5.4 names that arm the field's sole evidence
FINDING: Medium | delta | local | §Properties, PROP-INV-08 | §7.3's new honesty conjunct — every DECISION_LEDGER_OWNED_DECLS member resolves to exactly one top-level declaration at HEAD — is unmapped; PROP-INV-08's non-emptiness check catches neither a zero-resolution nor a two-resolution member, and zero-resolution is the defect the v1.0 erratum round existed to fix
FINDING: Medium | delta | local | §Properties, PROP-INV-09 | PROP-INV-09 routes report.decisionLedger's behavioural obligation to PROP-OFF-05 and PROP-WIRE-11, but TSPEC now names exactly two homes both inside §7.2's live arm and expressly denies §7.6's AT rows as a home; PROP-OFF-05 is the FX-BASELINE guard owned by T-02, not that arm
FINDING: Low | delta | local | §Properties, INV rationale paragraph | The paragraph under the INV table grounds the census's implementability in "two operands both frozen and both set-equality-checked" and recounts the pre-v0.9 id-token failure, but the second operand is no longer set-equality-checked against exports and implementability now rests on slicing every owned declaration under §7.3's stated satisfiability predicate

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 2, "low": 1}
