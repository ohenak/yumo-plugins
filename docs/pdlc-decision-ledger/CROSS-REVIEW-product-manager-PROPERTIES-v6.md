# Cross-Review: product-manager — PROPERTIES (upstream-cascade delta re-confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md
**Date:** 2026-09-01
**Iteration:** 6 (round 6 — bounded upstream-cascade delta re-confirmation, PLAN v0.9 → v1.1)

## What this round is

Not a review. PROPERTIES' own bytes are unchanged since my round-5 approval
(`shasum -a 256` = `2bab7d10…79141ef`, the round-5 `APPROVAL-HASH`; last commit touching the file is
`71ea7cd63`, PROPERTIES v1.2). Exactly one upstream pin moved. The question is narrow: **does PLAN
v1.1 falsify any property, uncover any requirement, or narrow any acceptance criterion this document
was approved against?**

**Answer: no on all three.** The approval stands. What the delta does produce is a fourth site of the
same bookkeeping class I have been recording since round 4 — PROPERTIES' `PLAN`-facing ownership
bookkeeping now disagrees with PLAN HEAD in three places, because PLAN moved a task's host module and
batch and PROPERTIES has had no revision round in which to follow.

## Which pin moved

| Upstream | Round-5 anchor | HEAD | Moved? |
|---|---|---|---|
| REQ | `9bc8bc32…05f10d` | `9bc8bc32…05f10d` | no |
| FSPEC | `48691453…a11256` | `48691453…a11256` | no |
| TSPEC | `2c84d525…1be49b` | `2c84d525…1be49b` | no |
| DECISIONS | `48e73a41…880240` | `48e73a41…880240` | no |
| PLAN | `d1af8e47…4765a7` v0.9 | `4d40cfb2…15fd8e3` **v1.1** | **yes** |

One pin, as dispatched. DEC-ERR-03's re-grounding obligation is satisfied trivially: there is no
second upstream that moved behind the dispatch this time, unlike round 5 where TSPEC had advanced
under it.

## What PLAN v1.1 changed, against the product lens

PLAN v1.1 is a delta re-grounding/alignment pass: it re-measured its own upstream pins (REQ v1.10,
FSPEC v1.4, TSPEC v1.3, DECISIONS v1.6 — all four already the hashes PROPERTIES' round-5
`UPSTREAM-STATE` recorded, so nothing new reaches PROPERTIES through them), swept task Status cells,
re-based the T-00a census figure as a *baseline* rather than a live measurement, did changelog
hygiene, and made one structural move: **T-12a's documentation disclosure oracle is re-hosted from
`documentOracles.test.js` into `decisionLedgerConfig.test.js`, moving from batch 2 to batch 4** (PLAN
PM F-01), with the consequent dependency (T-12a now deps T-13) and disjointness re-derivation.

Checked against every id class PROPERTIES carries:

- **No `BR-`, `E-`, `AC-`, `M-`, `C-`, `F-`, `NG-` or `AT-` id changed meaning.** REQ and FSPEC are
  unmoved at HEAD; the Coverage Matrix's REQ/FSPEC mapping is untouched.
- **No measured value moved.** The four corpus literals (6,305 / 10,859 / 12,059 / 441), the 25-file
  fixture count, the `70` / `12500` shipped defaults, the ≤1,200-byte rule-text budget, the `102`
  census literal and the `0.23.6 → 0.23.7` version target are all identical in PLAN v1.1. The census
  re-base touches only the raw `154` directory figure, which **PROPERTIES never restates** — I
  grepped; PROP-DISC-07 cites the filter and the `102` assertion, not the raw count. That re-base is
  therefore a no-op for this document, and a well-judged one: the live directory now measures 166,
  so PLAN's old "the live directory measures 154" phrasing had already gone stale, and re-basing it
  as a baseline census is what stops the same sentence going stale again next week.
- **No ownership *semantics* changed.** Red-before-green still holds for both of T-19's test files;
  T-12a is still T-19's red predecessor, and PLAN v1.1 says so explicitly ("the predecessor relation
  and the `T-19: …` block titles are unchanged by the move, only the file is").
- **No batch *ordering constraint* changed.** T-12a 2 → 4 does not move T-19, because `max` over its
  deps is still T-18's 8 — PLAN states and re-derives this, and it checks out.

## Property-by-property: is anything falsified?

Every family reads against PLAN v1.1 exactly as it read against v0.9, with one family carrying stale
attribution:

- **CFG, REC, PRE, REND, BND, FAIL, TEXT, INV, WIRE, OFF** — untouched. PLAN v1.1 changes no config
  grammar, recognition conjunct, precedence rule, render contract, bounds arithmetic, fail-open leg
  or census operand. The fourteen-member `DECISION_LEDGER_OWNED_DECLS` form that round 5 confirmed
  converged is carried forward verbatim in T-11, and the three census constants still home in
  `decisionLedgerCensus.test.js`. PROP-INV-06/07/08/11 hold on substance, as in round 5.
- **DISC** — substance holds; three attribution sites are now stale. PROP-DISC-05's content (the
  three documentation files named, every expectation *derived* from `DECISION_LEDGER_OMIT_REASONS`,
  `DECISION_LEDGER_NOTICES` and `DECISION_LEDGER_DEFAULTS` rather than restated) survives PLAN v1.1
  **word for word** in the §Definition of Done bullet — only the file hosting it changed. That is the
  distinction that keeps this out of High: the falsifier is intact, its address moved.
- **ORC-01…ORC-06 and all five fixtures** — none invalidated. PLAN v1.1 touches T-03, T-09, T-10 and
  T-02's recording not at all; FX-BASELINE's non-referent limit, converged in round 5, remains
  agreed on both sides.

**Requirement coverage is intact.** FSPEC Q-3, REQ NG-6 and REQ C-5's three keys are still claimed by
PROP-DISC-01…06 and still mechanically asserted by T-12 and T-12a. BR-11 / REQ NG-4 still land on
PROP-INV-06/07/08/11. Nothing gates Phase P.

## Where PROPERTIES and PLAN HEAD now disagree

Three sites, one root cause (T-12a's move), plus the pin staleness I have already routed:

1. **The module-ownership manifest's `documentOracles.test.js` row** lists owners `T-00a (1, census
   exclusion)` and `T-12a (2)` → `T-19 (9)`, claiming `PROP-DISC-05, PROP-DISC-07`. PLAN v1.1 gives
   that file a **single** owner — T-00a at batch 1 — plus T-19's batch-9 re-run of the terminal `102`
   control, which re-pins no literal. This matters more than an ordinary stale cell because
   PROPERTIES states in the paragraph beneath the manifest that the mapping is **set-equal to PLAN's
   manifest in both directions**. That claim is currently false, and it is exactly the kind of claim
   a reader trusts without re-deriving.
2. **The manifest's `decisionLedgerConfig.test.js` row** lists `T-04 (2)` → `T-13 (3)` and
   `PROP-CFG-01…10`. Under PLAN v1.1 that file has three owners — T-04 (2), T-13 (3), T-12a (4) —
   un-skipped by T-19 (9), and it is now the home of PROP-DISC-05.
3. **PROP-DISC-07's terminal-conjunct attribution**, restated identically in the DISC family's owners
   paragraph and in §Revision history's v1.2 item (3), reads "`PLAN` **T-12a → T-19**, batch 9". PLAN
   v1.1 assigns the terminal `102` positive control to **T-19 alone**, T-12a having left that file.

None of these is a High. No property is falsified by a wrong address; a reader following any of them
lands in the wrong file and re-derives from PLAN in a minute. But all three are the sort of drift
that compounds, and item 1 is a live false claim rather than a stale pointer, which is why it leads.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The manifest's "set-equal to `PLAN`'s manifest in both directions" sentence is the second time in three rounds that a *self-describing consistency claim* in PROPERTIES has been falsified by an upstream edit PROPERTIES did not make (round 5's F-03 was the first, on TSPEC §7.3's arithmetic). Would te-author consider re-phrasing it as an obligation on the next revision ("re-derive against `PLAN`'s manifest whenever the `PLAN` pin moves") rather than an assertion of present fact? An assertion that only a human can re-check goes stale silently; an obligation tells the next author what to do. |
| Q-02 | Round 5's Q-02 stands and this round is further evidence for it: PROPERTIES' in-body citations still carry version labels (`TSPEC v1.0 §7.3`) while PLAN has moved version pins to the header row alone. Three of this round's six findings are version/attribution labels that a header-only convention would have made unfalsifiable-by-cascade. Worth adopting at the next revision? |

## Positive Observations

- **The delta is well-formed and self-documenting.** PLAN v1.1 does not merely make the T-12a move —
  it re-derives the batch arithmetic, re-states the disjointness premise batch by batch, names the
  new serialisation chain (T-04 → T-13 → T-12a → T-19), and explicitly records that the move leaves
  T-19's batch unchanged and the red-predecessor relation intact. I could confirm every downstream
  consequence from PLAN's own prose without re-deriving the graph. That is what makes a cascade round
  cheap.
- **The move is in PROPERTIES' favour on falsifiability grounds.** Hosting the disclosure oracle
  outside `documentOracles.test.js` takes T-12a's blocks off the sweep surface that PROP-DISC-07's
  `102` literal counts, removing a self-reference between the two DISC properties that share that
  file. PROPERTIES did not ask for this and does not need to change to benefit from it.
- **The census re-base pre-empts a defect PROPERTIES was already immune to.** PROPERTIES cites the
  filter and the `102` assertion but never the raw directory count — a discipline chosen rounds ago
  that just paid off, since the live figure has moved 154 → 166 while `102` held.
- **Four of five upstream pins were re-measured and are byte-identical.** The cascade genuinely is
  one-pin-wide, and PROPERTIES' round-5 `UPSTREAM-STATE` anchors already recorded REQ/FSPEC/TSPEC/
  DECISIONS at the very hashes PLAN v1.1 now pins — so PLAN's re-grounding brought PLAN *to* where
  PROPERTIES already was, not the other way round.
- **Two upstream version bumps, three cascade rounds, zero requirements lost and zero acceptance
  criteria narrowed.** Worth saying plainly.

## Recommendation

**Approved with minor changes**

PROPERTIES remains approved against PLAN v1.1. No property falsified, no requirement uncovered, no
acceptance criterion narrowed, no measured value or fixture invalidated. Phase P is not gated.

Six Medium items, all bookkeeping, none blocking. Best folded into the next ordinary revision of
PROPERTIES rather than an erratum round of their own — F-01…F-03 are one edit to the manifest and
three attribution strings; F-04…F-06 have been open since rounds 4–5 and are re-recorded here only so
they are not lost across rounds:

1. **F-01 / F-02** — re-derive the module-ownership manifest's two affected rows against PLAN v1.1,
   and soften or discharge the "set-equal in both directions" claim (Q-01).
2. **F-03** — re-point PROP-DISC-07's terminal-count owner to T-19 in all three sites.
3. **F-04** — re-measure the header Upstream row: PLAN v0.7 → **v1.1** `sha256:4d40cfb2…15fd8e3`,
   TSPEC v1.0 → **v1.3** `sha256:2c84d525…1be49b`.
4. **F-05 / F-06** — the round-4/round-5 items still open: §Gaps' resolved routed item, §7.3's
   widened-declaration-regex requirement, the "roughly a dozen" quotation, and PROP-INV-09's
   `FSPEC` §7.6 → `TSPEC` §7.6.

## Delta-Confirmation Findings

Provenance legend for this round: **delta** = PLAN v0.9 → v1.1 introduced it (F-01…F-03, all
consequences of T-12a's re-host); **inherited** = already in PROPERTIES' pre-round bytes, raised in an
earlier round and still open, untouched by this delta (F-04…F-06). **Locality:** *local* = the
manifest and DISC-family sections the delta bears on; *nonlocal* = elsewhere. No finding is High: all
six are address, pin or quotation bookkeeping, and none falsifies a property or narrows an acceptance
criterion.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | The module-ownership manifest's `documentOracles.test.js` row gives owners `T-00a (1, census exclusion)` and `T-12a (2)` → `T-19 (9)` and claims `PROP-DISC-05, PROP-DISC-07`. PLAN HEAD v1.1 re-hosts T-12a's disclosure family in `decisionLedgerConfig.test.js` at batch 4, leaving `documentOracles.test.js` with a **single** owner (T-00a, batch 1) plus T-19's batch-9 re-run of the terminal `102` control. The paragraph beneath the manifest asserts the mapping is set-equal to PLAN's manifest **in both directions** — that assertion is now false in both directions. Re-derive the row and either discharge or re-phrase the set-equality claim (Q-01). | §Coverage — test-module ownership manifest, `documentOracles.test.js` row and the set-equality paragraph beneath it |
| F-02 | Medium | delta | local | The same manifest's `decisionLedgerConfig.test.js` row lists owners `T-04 (2)` → `T-13 (3)` and properties `PROP-CFG-01…10`. Under PLAN v1.1 that module has a third owner, T-12a at batch 4 (un-skipped by T-19 at batch 9), and is the home of PROP-DISC-05. Add T-12a → T-19 to the owners cell and PROP-DISC-05 to the properties cell. | §Coverage — test-module ownership manifest, `decisionLedgerConfig.test.js` row |
| F-03 | Medium | delta | local | PROP-DISC-07's terminal conjunct ("the filtered count is still `102` once all twelve modules exist") is attributed to `PLAN` **T-12a → T-19**, batch 9 — restated identically in the DISC family's owners paragraph ("**T-12a → T-19** (documentation oracle, PROP-DISC-05 and PROP-DISC-07's terminal count)") and in §Revision history's v1.2 item (3). PLAN v1.1 assigns the terminal positive control to **T-19 alone**; T-12a no longer writes that file. The property's substance (exclude the namespace, still count `102`) is unchanged and the batch-1 exclusion half is still T-00a's. Re-point the owner in all three sites. | §Properties, DISC family — PROP-DISC-07 and the family owners paragraph; §Revision history, v1.2 item (3) |
| F-04 | Medium | inherited | nonlocal | The header Upstream row still pins `PLAN-pdlc-decision-ledger.md` **v0.7** and `TSPEC-pdlc-decision-ledger.md` **v1.0**. PLAN HEAD is **v1.1** `sha256:4d40cfb2…15fd8e3` and TSPEC HEAD is **v1.3** `sha256:2c84d525…1be49b` — two PLAN versions and three TSPEC versions past the recorded pins. Raised as round-5 F-02/F-03 and still open; a stale header pin silently widens the scope any future cascade confirmation has to cover. Re-measure both mechanically. | Header, Upstream row |
| F-05 | Medium | inherited | nonlocal | §Gaps' second routed item states that "PLAN v0.7 at HEAD says the opposite in five places" and carries the fifteen-member owned list. PLAN HEAD (v0.9 then, v1.1 now) has carried the fourteen-member form with all three census constants homed in `decisionLedgerCensus.test.js` for two versions. The divergence is closed; the routed item now sends a reader to §Gaps to resolve a contradiction that no longer exists. Retire it, recording that it landed in PLAN v0.9 and survives unchanged in v1.1. | §Gaps, Risks and Routed Items — routed item 2 (PLAN census constants) |
| F-06 | Medium | inherited | nonlocal | Three open TSPEC-citation items, all raised in rounds 4–5 and all still present: (a) PROP-INV-06's slicing clause clones `loopEconomicsAnchorGuard.test.js`'s `bodyOf` without recording that TSPEC §7.3's declaration regex must be **widened, not cloned verbatim** — `DECL_RE` anchors on `function` only, while eight of the fourteen owned declarations are top-level `const`s (round-5 F-04; PLAN T-11 absorbed this, PROPERTIES did not); (b) PROP-INV-07's rejected-form parenthetical quotes §7.3's "roughly a dozen declared", a phrase v1.1 replaced with the explicit fourteen (round-5 F-05); (c) PROP-INV-09 attributes the non-home AT rows to `FSPEC` §7.6 when §7.6 is `TSPEC`'s section — substance correct, document name wrong (round-4 F-08, round-5 F-06). | §Properties, INV family — PROP-INV-06 slicing clause, PROP-INV-07 rejected-form parenthetical, PROP-INV-09 |

FINDING: Medium | delta | local | §Coverage, test-module ownership manifest, `documentOracles.test.js` row | row gives T-12a (batch 2) as a co-owner claiming PROP-DISC-05, but PLAN HEAD v1.1 re-hosts T-12a in `decisionLedgerConfig.test.js` at batch 4, leaving T-00a the single owner; the manifest's stated set-equality with PLAN's manifest in both directions is now false
FINDING: Medium | delta | local | §Coverage, test-module ownership manifest, `decisionLedgerConfig.test.js` row | row lists only T-04 (2) → T-13 (3) and PROP-CFG-01…10; PLAN HEAD v1.1 adds T-12a (4) → T-19 (9) as owners and makes this module the home of PROP-DISC-05
FINDING: Medium | delta | local | §Properties, DISC family, PROP-DISC-07 and family owners paragraph; §Revision history v1.2 item (3) | PROP-DISC-07's terminal `102` conjunct is attributed to T-12a → T-19 in three sites; PLAN HEAD v1.1 owns that positive control with T-19 alone, T-12a no longer writing `documentOracles.test.js`
FINDING: Medium | inherited | nonlocal | Header, Upstream row | row still pins PLAN v0.7 and TSPEC v1.0; PLAN HEAD is v1.1 sha256:4d40cfb2…15fd8e3 and TSPEC HEAD is v1.3 sha256:2c84d525…1be49b (round-5 F-02/F-03, still open)
FINDING: Medium | inherited | nonlocal | §Gaps, Risks and Routed Items, routed item 2 | routed item describes a PLAN census-constant divergence closed in PLAN v0.9 and still closed in v1.1, so it sends a reader to resolve a contradiction that no longer exists (round-5 F-01, still open)
FINDING: Medium | inherited | nonlocal | §Properties, INV family, PROP-INV-06 / PROP-INV-07 / PROP-INV-09 | three open TSPEC §7.3 citation items: the widened-declaration-regex requirement is uncited in PROP-INV-06's slicing clause, PROP-INV-07 quotes the replaced "roughly a dozen" phrase, and PROP-INV-09 names `FSPEC` §7.6 for a `TSPEC` section (round-5 F-04/F-05/F-06, all still open)

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 6, "low": 0}

APPROVAL-HASH: sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef
APPROVAL-HASH-NORMALIZED: sha256:331c0ae9a79eb82ed54af8a6e48a174accebc836535641c250f86ba043de91c6
REVIEWED-COMMIT: 287f7f1c96482c78f9811329d27a9594e06e4fb1
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
UPSTREAM-STATE: PLAN sha256:4d40cfb228cd181571ad9d6247a23f0cc8974542f9c249a0e0f0fd26015fd8e3
