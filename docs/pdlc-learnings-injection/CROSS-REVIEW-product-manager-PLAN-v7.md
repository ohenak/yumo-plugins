# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 7
**Mode:** upstream-cascade confirmation — FSPEC moved under a recorded approval

## Overview

My v6 approval of PLAN v0.4 recorded FSPEC at `sha256:fb18dbda…` (commit `c1d7218e`, FSPEC v0.12).
FSPEC at HEAD is `sha256:ae75fa62…` (commit `cfb3d4d6`, FSPEC **v0.13**) — six commits later, one
erratum round, 38 insertions and 18 deletions. PLAN's own bytes have not moved
(`REVIEWED-COMMIT: c374c449`), and REQ, TSPEC and DECISIONS are at the same shas my v6 approval
recorded. So the one question is whether PLAN v0.4 is still a faithful compression of FSPEC v0.13.

The v0.13 erratum lands **three decisions**, and they do not point the same way:

| FSPEC locus | v0.12 (the version I approved against) | v0.13 (HEAD) | Effect on PLAN |
|---|---|---|---|
| **§D.5 byte-accounting basis** | Contributed bytes are "every byte the block carries on its account: its identification line, its delimiters and source-path label (BR-7), **and** the section headings and bodies taken"; only the block preamble is exempt | Contributed bytes are the document's **material** — "the section headings and bodies taken from it, and nothing else"; the identification line, delimiters, source-path label and preamble are charged to **no** threshold (REQ AC-2.3, "the material taken") | **Moves FSPEC toward PLAN.** PLAN already says material-only |
| **BR-6 / BR-9 / D-12 zero-bound** | D-12 reads "Does the document carry any priority section?"; `RSN-NO-MATERIAL` means "carries none of BR-6's priority sections"; `maxBytesPerDocument: 0` undecided | D-12 reads "Does the document **yield any material**?"; `RSN-NO-MATERIAL` gains a second cause — "or the per-document bound is zero and admits none"; new edge **E-36** and a widened **AT-30** | **PLAN under-commissions the new case** — F-01, F-02 |
| **§Named obligations F-O-1** | Owns one rule: the "presents as a LEARNINGS document" predicate (BR-3) | Owns **two** heading-recognition rules: that predicate **and** the rule by which a heading counts as one of BR-6's named sections | Mapping holds — LI-16 already owns both |

**The headline:** one of the three moves closes a latent conflict in PLAN's favour, one is inert,
and one opens a real gap. The zero-bound decision is not a wording tidy — it is a new behavioural
branch with a new edge id, a new `RSN-NO-MATERIAL` cause and a third case bolted onto an acceptance
test PLAN commissions by name. PLAN's LI-12 row enumerates AT-30 as **two** cases, which was an
exact compression of FSPEC v0.12 and is a narrowing of FSPEC v0.13. That is the substantive finding
of this round, and it is a High: an operator who configures `maxBytesPerDocument: 0` gets a
behaviour FSPEC now guarantees and this PLAN commissions no test for.

Note on the chain: **TSPEC has not absorbed E-36 either** (§T.5 still gives `learningsConfig.test.js`
two ATs, and §D.7's decision-branch table still reads "No BR-6 section present ⇒ `RSN-NO-MATERIAL`").
PLAN is a faithful compression of *TSPEC*; it is TSPEC that now lags FSPEC. But my scope is this
PLAN measured against its upstream **at HEAD**, and against FSPEC v0.13 the gap is real regardless
of where the fix is authored first. I raise it here as `delta`/`local` — the bounded-follow-up
reading — rather than swallowing it because an intermediate document shares the lag.

## Batches

I walked the task rows that carry material the delta touched. **Three hold; one is narrowed.**

**LI-12 (batch 5, RED configuration suite) — the one row the delta falsifies.** PLAN commissions
`LI-AT-30` as exactly: "(`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ an **enabled** run whose BR-8 rows
are present and empty)". FSPEC AT-30 at HEAD reads:

> *Given* thresholds configured to admit nothing — `maxDocuments: 0`, separately `maxTotalBytes: 0`,
> **and separately `maxBytesPerDocument: 0`** — … *and* in the `maxBytesPerDocument: 0` case **every
> corpus document carries `RSN-NO-MATERIAL`** (E-36).

Three cases, not two, and the third carries a per-document reason assertion the other two do not.
PLAN's parenthetical is not decorative here — this PLAN's own precedent settled that. AT-15 was
rewritten in v0.3 to spell out **four** clauses precisely because a test author works from the task
row, and an under-enumerated gloss ships an under-asserted test that the AT-partition oracle
(`LI-T-SUITEMAP`, which keys on ids, not clauses) will green anyway. The same failure mode is now
live for AT-30, and nothing else in the document mentions the zero bound: `maxBytesPerDocument: 0`
appears nowhere in PLAN, and `E-36` appears nowhere in PLAN.

**Which task would own it is not obvious from the current text, and that is part of the finding.**
The zero-bound behaviour spans two seams PLAN assigns to different tasks — `extractInjectableMaterial`
must yield nothing at bound zero (LI-16, batch 7) and `selectLearnings` must drop the document with
`RSN-NO-MATERIAL` before the total bound and consume no slot (LI-16 too), while the enabled-run,
empty-selection report shape is LI-12's red and LI-21's green (batch 13). LI-16's row commissions
`extractInjectableMaterial` with "`bounded` decided at the cut" and `selectLearnings` with a
`rejected[]` "total over `entries`", so the production behaviour is plausibly inside existing task
scope — but no row states the zero case, and a scope that has to be inferred is not commissioned.

**The AT count claim survives.** §Traceability opens "All 35 FSPEC acceptance tests, each appearing
**exactly once**", and closes with the arithmetic "(8 + 1) + 3 + 3 + (5 + 1) + 12 + 2 = 35". FSPEC
v0.13 added an **edge** (E-36) and widened an **existing** AT; it added no AT. The partition, its
per-suite assignment and `LI-T-SUITEMAP`'s closure are untouched, and the row `| AT-30, AT-32 |
learningsConfig.test.js | LI-12 | LI-21 |` still names the right suite and the right owners. It is
the clause enumeration inside LI-12's prose that is stale, not the partition.

**LI-08 and LI-17 (batches 3 and 9) — the byte-accounting delta moves FSPEC to meet them.** LI-08
requires expected byte counts "hand-computed from the fixture over **material only**, ignoring every
delimiter (§D.5)"; LI-17 requires that "Framing is never charged to any byte bound (§D.5)". Under
FSPEC v0.12 both sentences were in tension with §D.5's own text, which charged the identification
line and the per-document delimiters to `maxBytesPerDocument`. They were faithful to TSPEC §D.5,
which has said material-only throughout ("**`maxBytesPerDocument` bounds material only, and so does
`bytesInjected`.** This is the whole of it"). FSPEC v0.13 adopts that reading verbatim and grounds
it in REQ AC-2.3. Two task rows that were quietly divergent from FSPEC are now exactly right, and
LI-08's hand-computed fixture arithmetic — the thing that would have had to be recomputed had the
decision gone the other way — needs no change.

**LI-16 (batch 7) absorbs F-O-1's widening without an edit.** §Traceability maps `F-O-1 … F-O-7` with
"LI-16 (F-O-1)". F-O-1 now owns two heading-recognition rules rather than one. Both land in LI-16:
that row already commissions `looksLikeLearningsDocument` (the BR-3 predicate, "deliberately weak")
**and** `extractInjectableMaterial` ("BR-6 priority order"), and the second rule — whether a heading
is matched by numbered form, bare title or prefix — is exactly the internal of the latter. The
obligation grew; its owner did not change, and the owner's row already reaches the new surface. No
finding. The matching assertion also exists: LI-08's `LI-AT-11` is "section-set equality over what
BR-6 selected", which is the oracle the widened F-O-1 needs.

## Dependencies

**No edge in the batch ladder changes, and the delta adds none.** The v0.13 erratum touched a
byte-accounting basis, a decision-table branch, an edge row, an acceptance test and a named
obligation. None of those is an ordering constraint, an integration point or a structural obligation
that §Dependencies leans on. I checked the edges that touch the affected rows.

| Edge | Justification PLAN gives | Against FSPEC v0.13 | Verdict |
|---|---|---|---|
| LI-12 → LI-06 | LI-12 is L3 and drives `main()` over the full seam set, so it depends on the baseline capture (T-O-2) | Unaffected — AT-30 gaining a third case does not change which seams the suite drives or when the baseline must exist | Holds |
| LI-21 → LI-12 | red-before-green: LI-21 greens `learningsConfig.test.js` | Unaffected — if LI-12's row is widened to three cases, LI-21 remains the green and the edge is the same edge | Holds |
| LI-16 → LI-07 | red-before-green over the selection suite | Unaffected — the zero-bound behaviour, wherever it is commissioned, lands inside seams LI-16 already owns | Holds |
| LI-15 → LI-06 | **T-O-2**, structural: the first production edit may not precede the baseline capture | Unaffected | Holds |
| LI-23 → LI-06 | the L3 fixture matrix the twelve arms are driven through | The arm inventory's `RSN-NO-MATERIAL` arm gains a second *cause* upstream, not a thirteenth arm — `LEARNINGS_CORPUS_OUTCOMES` and the reason catalogue are unchanged in TSPEC and in FSPEC's reason table (the row's text widened; the id set did not) | Holds |

**The twelve-arm inventory is worth one extra sentence, because it is the place a widened reason
could have leaked into a count.** LI-23 asserts set equality over non-`null` `corpusOutcome`
observations against a frozen catalogue, and FSPEC v0.13's edit to the `RSN-NO-MATERIAL` row widens
what the id *means* without minting an id. The reason catalogue in FSPEC's §Reason ids and TSPEC's
`LEARNINGS_*` frozen sets both carry the same six document-level reasons before and after. So
LI-23's arithmetic, its `Deps` edge and P-A-4's answer ("no thirteenth fixture shape is scheduled")
all stand. What changes is only which *fixtures* can reach the `RSN-NO-MATERIAL` arm — and P-A-4
already routes that: "If implementation finds an arm that no declared fixture reaches, the shape
belongs in **LI-02**." The zero-bound case is reached through `parseLearningsConfig` inputs, not a
new corpus shape, so even that clause is not invoked.

**§Upstream and downstream documents still holds in substance, and is stale in its pins.** The
`depends-on` list is still empty and no queue row binds this feature; PROPERTIES still owes T-O-4,
T-O-5 and T-O-6, and TSPEC's §Named obligations still carries all three. What is now wrong is the
version pin: PLAN's §Overview reads "Behaviour lives in REQ v0.9 / FSPEC **v0.10** / TSPEC v0.6",
and the upstream matter row, the LI-01 edge rationale and the changelog's 0.1 row repeat the same
three numbers. FSPEC is at **v0.13** and TSPEC at v0.7. This is the same defect I raised as v6's
F-03, two FSPEC versions deeper; it remains Low, because no reading of a version number changes
what a task builds, and it remains **inherited** — the v0.13 edit made it staler, it did not
introduce it.

## Verification

**The decision-branch table is the second place the zero-bound decision lands, and it is narrowed
the same way.** §Traceability's reason-branch table carries the row:

> `| no BR-6 section ⇒ RSN-NO-MATERIAL | AT-28 | LI-07 / LI-16 |`

FSPEC v0.13 restated both the branch and the reason. D-12 is now "Does the document **yield any
material**?", and `RSN-NO-MATERIAL` is now "Eligible, but yields no material — it carries none of
BR-6's priority sections, **or the per-document bound is zero and admits none**". FSPEC's own
closure sentence is explicit that this must be exercised: "Every branch of the D-1 … D-12 decision
table is exercised" (DC-05), and the new edge row names its test — "E-36 … AT-30". PLAN's table
states one of the two causes and names AT-28 alone. This is a Medium rather than a second High: the
row is a *branch-to-owner* map, and the owners it names (LI-07 red, LI-16 green) are the same owners
the second cause would get. The gap is that the branch's second cause is unstated and its AT
(AT-30) is not cross-referenced, so nothing in PLAN connects the reason to the config suite.

**The expected-red ledger absorbs the fix without amendment.** Batches 7–13 gate on a per-batch
ledger stated in **test names**. Widening `LI-AT-30` adds cases to a test name that is already in
the ledger — `learningsConfig.test.js` is red from batch 5 and greened by LI-21 at batch 13 — so
no ledger row is added, removed or moved. Had FSPEC minted a new AT, the ledger and the 35-count
partition would both have needed edits; it did not, and they do not. This is why F-01 is a bounded
correction to two rows rather than a re-plan.

**DoD 1 still reads correctly.** "All 35 FSPEC acceptance tests implemented, each in exactly one
suite, each named `LI-AT-{N}`" — 35 is still the count at FSPEC v0.13, and AT-30 is still one test
in one suite. The DoD is satisfied by a three-case `LI-AT-30` exactly as by a two-case one, which is
precisely why the DoD cannot catch F-01 and why the task row has to carry the clause count itself.

**Claim 4's baseline scoping is unchanged and still narrower than upstream.** §Verification scopes
the measured baseline's byte-identity to "every **non-authoring** dispatch (AC-4.3)". FSPEC AT-03
and AT-29, and TSPEC §A.2, both say the promise is over dispatches **outside BR-1's rule** — which
deliberately includes the authoring-classified Phase CR optimizer round with no C-1 target. This is
v5's F-03 and v6's F-02, still open because PLAN has had no revision pass since. The v0.13 edit did
not touch AT-03 or AT-29, so I record it **inherited** and at the Scope tag the earlier rounds
reconciled (Local, Medium) rather than escalating it for a third appearance.

**§Open questions and upstream errata still misdescribes TSPEC, unchanged from v6.** The section's
preamble routes two defects to FSPEC as "first raised in TSPEC v0.6 (as ERR-3 and ERR-7)" and the
BR-1 row asserts that TSPEC §A.2 **adds** a `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct that BR-1
forbids. TSPEC v0.7 marks both errata CLOSED by name and §A.2 now says the opposite in terms — the
predicate "implements BR-1 directly", not a divergence from it. FSPEC v0.13 is, if anything, one
more witness that the routed items landed: its changelog records the erratum rounds and nothing in
the BR-1 or AT-02/AT-33 material was reopened. Inherited, Medium, unchanged from v6's F-01 —
recorded so the revision pass that lands F-01 and F-02 lands this too.

## Positive Observations

- **The byte-accounting decision went PLAN's way, and PLAN was already written for it.** LI-08's
  "material only, ignoring every delimiter" and LI-17's "framing is never charged to any byte bound"
  were the *contested* reading under FSPEC v0.12, which charged the identification line and the
  delimiters. FSPEC v0.13 adopts material-only and grounds it in REQ AC-2.3's "the material taken",
  with the product rationale stated outright — "a document is never abridged to pay for the
  annotation that says it was abridged". That is the right call for the user, and two task rows and
  a fixture's hand-computed arithmetic needed no edit to receive it. Second round running that this
  PLAN's precision has propagated upward rather than been flattened.
- **The 35-AT partition and the expected-red ledger both survived a behavioural addition.** FSPEC
  added an edge and widened an existing AT rather than minting AT-36. Because PLAN's two most
  brittle structures — the exactly-once partition with its stated arithmetic, and the per-batch
  ledger keyed on test names — are keyed on AT ids and suite names, neither needed touching. That
  is a design property of the PLAN worth keeping: a document whose gates key on stable ids absorbs
  upstream growth cheaply.
- **F-O-1 grew and its owner already covered the new surface.** The obligation went from one
  heading-recognition rule to two; LI-16 already commissions both the BR-3 predicate and BR-6's
  priority-order extraction, and LI-08's `LI-AT-11` section-set equality is already the oracle the
  second rule needs. No mapping edit, no new task.
- **The finding this round raises is bounded and locatable.** Two rows — LI-12's AT-30 gloss and
  §Traceability's `RSN-NO-MATERIAL` branch — carry the entire gap. Nothing in the batch ladder, the
  dependency graph, the file-ownership manifest or the DoD moves.

## Recommendation

**Needs revision**

PLAN v0.4 does **not** still hold as approved against FSPEC v0.13. Two of the erratum's three
decisions are inert or favourable; the third — `maxBytesPerDocument: 0` decided, edge E-36 minted,
AT-30 widened to three cases, `RSN-NO-MATERIAL` given a second cause — is a new behavioural branch
that this PLAN commissions no test for and names in no task row. `maxBytesPerDocument` appears in
PLAN only inside LI-21's `ruleInputs.thresholds` key list; the value `0` and the id `E-36` appear
nowhere.

What must change, bounded to two rows:

1. **F-01 (High)** — widen LI-12's `LI-AT-30` gloss to FSPEC AT-30's three cases: `maxDocuments: 0`,
   separately `maxTotalBytes: 0`, and separately `maxBytesPerDocument: 0`; and state the third
   case's extra clause, that **every** corpus document carries `RSN-NO-MATERIAL` and consumes no
   slot (E-36), the run staying enabled with BR-8 rows present and empty. State which task owns the
   production half — on the current text that is LI-16 (`extractInjectableMaterial` yields nothing
   at bound zero; `selectLearnings` drops the document with `RSN-NO-MATERIAL` before the total
   bound) — so the branch has a named owner rather than an inferred one.
2. **F-02 (Medium)** — restate §Traceability's decision-branch row as D-12 now reads: `no material
   yielded ⇒ RSN-NO-MATERIAL`, with both causes (no BR-6 section; per-document bound zero admits
   none) and both ATs (AT-28; AT-30/E-36).

Fold in with the same pass, all inherited and non-gating:

3. **F-03 (Medium, inherited)** — rewrite §Open questions and upstream errata: TSPEC v0.7 marks
   ERR-3 and ERR-7 CLOSED by name and §A.2 now says its `docType` predicate implements BR-1 rather
   than diverging from it. Retire the BR-1 row, keep one provenance line for harvest.
4. **F-04 (Medium, inherited)** — widen §Verification's claim 4 from "every non-authoring dispatch"
   to "every dispatch outside BR-1's rule, including an authoring-classified dispatch with no C-1
   target", matching FSPEC AT-03/AT-29 and TSPEC §A.2.
5. **F-05 (Low, inherited)** — update the four stale pins (upstream matter row, §Overview,
   LI-01's edge rationale, changelog 0.1) to FSPEC v0.13 / TSPEC v0.7.

A note for the orchestrator on routing: F-01 is tagged `delta`/`local` deliberately. The FSPEC edit
created the mismatch, and it lands in the PLAN material that corresponds to the edited AT-30, D-12,
BR-9 and E-36 — so it is one bounded follow-up edit to this document, not a halt. TSPEC has not
absorbed E-36 either (§T.5 still gives `learningsConfig.test.js` two ATs; §D.7 still reads "No BR-6
section present ⇒ `RSN-NO-MATERIAL`"), which is TSPEC's own cascade to answer, not this PLAN's
licence to stay narrow.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | FSPEC v0.13 decides `maxBytesPerDocument: 0`, mints edge E-36 and widens AT-30 to **three** cases with an extra clause (every corpus document carries `RSN-NO-MATERIAL`, consumes no slot, run stays enabled and empty). LI-12 commissions `LI-AT-30` as two cases — `maxDocuments: 0` and `maxTotalBytes: 0`. `maxBytesPerDocument: 0` and `E-36` appear nowhere in PLAN, and no task row owns the production half. AT-15's four-clause rewrite in v0.3 settled that an under-enumerated gloss ships an under-asserted test, since `LI-T-SUITEMAP` keys on ids not clauses. Widen LI-12's gloss and name LI-16 as the production owner | §Batches, LI-12 (batch 5, RED configuration suite) |
| F-02 | Medium | delta | local | §Traceability's reason-branch table reads `no BR-6 section ⇒ RSN-NO-MATERIAL \| AT-28`. At HEAD, D-12 is "Does the document yield any material?" and `RSN-NO-MATERIAL` carries two causes — no BR-6 section, **or** the per-document bound is zero and admits none. FSPEC's DC-05 closure requires every D-1…D-12 branch exercised and names AT-30 for E-36. Restate the row with both causes and both ATs | §Traceability, decision-branch → owner table |
| F-03 | Medium | inherited | nonlocal | §Open questions and upstream errata still routes two defects as "first raised in TSPEC v0.6 (as ERR-3 and ERR-7)" and asserts TSPEC §A.2 **adds** a `docType` conjunct BR-1 forbids. TSPEC v0.7 marks both CLOSED by name and §A.2 says the predicate implements BR-1 directly. PLAN is the last document routing a conflict that no longer exists. Unchanged from v6 F-01; the v0.13 edit did not touch it | §Open questions and upstream errata, preamble and BR-1 row |
| F-04 | Medium | inherited | nonlocal | §Verification claim 4 scopes the measured baseline's byte-identity to "every **non-authoring** dispatch (AC-4.3)"; FSPEC AT-03/AT-29 and TSPEC §A.2 scope it to dispatches **outside BR-1's rule**, deliberately including the authoring-classified Phase CR optimizer round with no C-1 target. PLAN's compression promises less than upstream. Same defect as v5 F-03 and v6 F-02; Scope tag reconciled with those rounds (Local, Medium), not escalated | §Verification, claim 4 ("measured baseline") |
| F-05 | Low | inherited | nonlocal | Four version pins name upstreams that no longer exist: the upstream matter row, §Overview's "Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6", LI-01's edge rationale ("since TSPEC v0.6") and the changelog's 0.1 row. HEAD is FSPEC v0.13 / TSPEC v0.7. Unchanged from v6 F-03, now three FSPEC versions stale | §Overview, §Dependencies upstream matter row, LI-01 edge rationale, §Changelog |

FINDING: High | delta | local | §Batches, LI-12 (batch 5, RED configuration suite) | FSPEC v0.13 widens AT-30 to three cases and mints E-36 for `maxBytesPerDocument: 0` (every document carries `RSN-NO-MATERIAL`, consumes no slot, run stays enabled and empty); LI-12 commissions `LI-AT-30` as two cases only, `maxBytesPerDocument: 0` and `E-36` appear nowhere in PLAN, and no task row owns the production half of the zero-bound branch.
FINDING: Medium | delta | local | §Traceability, decision-branch → owner table | The `RSN-NO-MATERIAL` row states one cause ("no BR-6 section") and one AT (AT-28); at HEAD D-12 asks "yields any material" and the reason carries a second cause — per-document bound zero admits none — exercised by AT-30/E-36 under DC-05.
FINDING: Medium | inherited | nonlocal | §Open questions and upstream errata, preamble and BR-1 row | PLAN still routes ERR-3/ERR-7 as live and claims TSPEC §A.2 adds a `docType` conjunct BR-1 forbids; TSPEC v0.7 marks both CLOSED and §A.2 says the predicate implements BR-1 directly.
FINDING: Medium | inherited | nonlocal | §Verification, claim 4 ("measured baseline") | Baseline byte-identity is scoped to "every non-authoring dispatch" where FSPEC AT-03/AT-29 and TSPEC §A.2 scope it to dispatches outside BR-1's rule, including the authoring-classified Phase CR optimizer round with no C-1 target.
FINDING: Low | inherited | nonlocal | §Overview, upstream matter row, LI-01 edge rationale, §Changelog | Four pins still read FSPEC v0.10 / TSPEC v0.6; HEAD is FSPEC v0.13 / TSPEC v0.7.

## Verdict
