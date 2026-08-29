# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation — Phase P erratum, five routed items)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Scope

I previously approved this TSPEC at v0.7. This round is a **delta confirmation**, not a re-review:
I read the five routed items, ran `git diff 277db8b27..HEAD` over the TSPEC, and re-read the
upstream text the changed sections lean on at its current version. Upstream has **not** moved —
`REQ-pdlc-decision-ledger.md` still measures `sha256:ce6b133f…3c7b7c` (v1.9) and
`FSPEC-pdlc-decision-ledger.md` still measures `sha256:2bd5c3ef…5aed39` (v1.3), exactly the pins
v0.8's changelog re-states — so nothing this document compresses has changed underneath it, and the
document's own claim of "upstream unmoved, no pin advances" is true as measured, not merely asserted.

The edit is confined to §7 plus the changelog row, as the changelog says. The four corpus literals
(6,305 / 10,859 / 12,059 / 441) are untouched, no section outside §7 is touched, and no previously
approved product decision is re-litigated. My check therefore reduces to: did each of the five items
land, and did landing them leave §7 a faithful account of what REQ C-2 / REQ-DECLEDGER-01/02 and
FSPEC's AT rows actually require?

Answer: all five landed, three of them better than the raising review asked for. Two mis-citations
were introduced along the way, both inside §7.3's new closing paragraph, both non-gating.

## Design

**Items 1 and 3 — the coverage-gate claim (landed, and verified against the live gate).** v0.7's §7
said flatly that "the gate is not evidence for this feature, and this spec does not rely on it".
v0.8 splits the claim by clause and I confirmed the split against `pdlc/workflows/package.json`:
`test:coverage` is a four-clause `&&` chain, and the **fourth** clause
(`c8 report --check-coverage --per-file --branches 85 …`) is the one whose per-file percentage is
swamped by a ~817 KB file — that clause, and only that clause, is what the old sentence was true of.
The **third** clause, `node scripts/check-wave-resume-delta-coverage.mjs`, is now named, and every
factual claim §7 makes about it checks out at HEAD: its exported `SUBJECT` is hard-coded to
`pdlc/workflows/orchestrate-dev.js` (this feature's only production file, D-6); `resolveBase()`
prefers the live `merge-base HEAD origin/main` with a `PINNED_BASE_SHA` fallback only where neither
`origin/main` nor `main` resolves; it exits non-zero on any uncovered line inside the post-image hunk
ranges; and it only *warns* on a dirty subject, which is why §7's "commit, then run" instruction is
the right one rather than a stylistic preference.

The framing v0.8 chose — "two facts sit together rather than in tension: the percentage clause is
insensitive to this feature, the delta clause is sensitive to nothing else in it" — is the honest
reading, and it is the one an implementer can act on. The three consequences it then draws (the
fail-closed empty-range reading nothing may rest on; the gate's absence from the wave gate's
`implementation.testCommand`, with the per-wave manual run routed to PLAN T-18; and the delta clause
as mechanical backstop for §6.1's "every failure row owes a named test") are each a real obligation,
each assigned to a named owner rather than left as narrative.

**Item 2 — the live composition-root arm (landed, DC-07 satisfied).** §7.2 now carries a
`Composition root (live)` row and a paragraph stating why §5.5's source census cannot discharge
§4.5/§5.4's wiring: a census proves a string is present, never that a line runs. That is exactly
DC-07's reading in `docs/_constraints/DOMAIN-CONSTRAINTS.md`, and the three conjuncts the design owes
— a call-count assertion on the scripted `_git` seam (the conjunct a fake of the outer interface
cannot satisfy), a positive "ends with the rendered block" presence assertion rather than
"differs from baseline", and a flag-off arm stated as three *positive* conjuncts — are the shape
DC-07's builder-not-wired sweep asks for. PLAN T-10a already owns it, so design and plan agree on the
obligation; they disagree only on one referent, recorded as F-01 below.

## Interfaces

The delta touches no public seam, no notice id, no config key and no rendered-output contract — the
three surfaces a product reader cares about. `decisionLedger`'s three C-5 keys, the omission-reason
catalogue, the `NTC-DECLEDGER-*` ids and §4.3's line format are all byte-unchanged from the version I
approved, and FSPEC §110/§114/§124's config semantics are still compressed the same way.

One interface-adjacent claim is new and worth pinning: §7.2's live arm is specified against the
module's **default-exported `main()`**, citing `advisoryDisabled.test.js`, `advisoryWaveGateMain.test.js`,
`anchorCascade.test.js` and `branchGuard.test.js` as the shipped shape. Those four modules do exist
and do drive `main()`, so the arm is specified against a real entry point rather than an invented
one — the failure mode DC-07 exists to catch (a builder proved in isolation and never assembled) is
closed at the design level, not deferred to implementation discretion.

## Data structures

**Item 5 — the unsatisfiable census token (landed, and landed the right way).** `DECISION_LEDGER_CENSUS_TOKENS`
now reads `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`,
`gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` —
`decisionLedger` is gone. I verified the precedent the reasoning rests on: `orchestrate-dev.js` has
**six** `buildFinalReport(` call sites (16725, 16742, 16767, 16791, 18294, 18326), all far outside any
`main()` wiring sentinel, and `learningsInjectionField` is named at nine points across them. §7.3's
"~six shipped call sites" is the accurate figure — the raising review's "eight" was the loose one, and
the document is right to have written what the source says rather than what the finding said.

The disposition is also the better of the two available: dropping the token rather than carving
`buildFinalReport` out of the scan keeps the census's blind spot small, and — the load-bearing part
for me — keeps the companion **set-equality** check against the module's *exported* decision-ledger
symbol names exact, since `decisionLedger` is a report field, not an exported symbol. A carve-out
would have widened an absence oracle's blind region to buy a token that was never a symbol. Good call,
and §7.3 states the reasoning rather than just the outcome, so a later reader cannot re-add the token
by accident.

What that disposition costs is one *transferred* obligation: the `report.decisionLedger` field
(§5.4, REQ C-2's disabled-path byte-identity) loses its census proof and is now owed behaviourally.
§7.3 names two places that pick it up. Neither citation resolves as written — see F-01 and F-02.

## Verification

**Item 4 — two invariants promoted from examples to properties (landed).** §7.5 now owes three
properties rather than one. The two new ones are stated in the quantified form the design already
used prose-wise:

- **P-REC (§3.2, §3.3)** — over arbitrary file text, `recogniseDecisionRecords` yields one record for
  exactly those lines satisfying §3.2's five conjuncts with a non-empty statement remainder and no
  others; each statement is a verbatim substring of the line; and where two qualifying lines carry the
  same id, §3.3's last-wins keeps the later. I re-read §3.2 and §3.3 at HEAD: the five conjuncts and
  the last-wins rule are stated there in exactly that form, so P-REC is a faithful quantification of
  the design, not a new product rule smuggled in through the test section. The generator families
  named (near-miss ATX depth, missing separator, empty statement, duplicate ids at varying distance)
  cover the Baseline instances §3.2 cites as its own justification — `M-4a`…`M-4d` — which is the
  right coverage target.
- **P-LINE (§4.3)** — every rendered line is one physical line; equivalently the index region's
  `split("\n")` cardinality equals the selected set's. This is the invariant §7.3's transcribed byte
  literals silently assume: "63 lines joined by `\n` = 10,859 bytes" is only a meaningful assertion if
  63 records really produce 63 physical lines. Promoting it closes a genuine hole — a statement
  carrying an embedded newline would have moved both the line count and the byte total with no test
  naming the defect.

Both are given falsifying mutations and both inherit O-8's independent-model discipline (the model
carries its own formatter transcribed from §4.3, never the production renderer), so neither property
can echo the code under test. And §7.5 is explicit that they cost no new seam and no new double —
they target pure functions §7.1 already tests without doubles. That matters to me on the product side
because it means the depth increase does not buy itself with new integration surface.

**§7.6 is unchanged**, and I re-checked its AT rows against FSPEC v1.3 at HEAD: AT-14's row still
names all **three** of FSPEC v1.3's cases (zero-decision set, `maxEntries` `0`, `maxBytes` `0`), and
AT-01/AT-02/AT-18's notes still match the corpus assertions REQ-DECLEDGER-01 requires. No AT row's
meaning drifted under the edit.

## Risks and Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3's dropped token means `report.decisionLedger` is now proved only behaviourally. Once F-01/F-02's referents are corrected, is it worth one sentence in §5.4 pointing forward to §7.2 as the field's sole proof, so a future editor cannot delete the arm without reading what it discharges? Not gating — PLAN T-10a states it, so nothing is unowned today. |

The one risk I would name for the implementer, already stated in §7 and repeated here only because it
is easy to lose: the delta-coverage gate is **fail-closed on empty ranges**, so nothing this feature
adds may rest on the empty-range reading, and the per-wave manual run (PLAN T-18) is the only thing
standing between a wave-3 mistake and a batch-8 discovery.

## Positive Observations

- All five routed items landed, and three landed *better* than raised: the census-token count was
  corrected against the source rather than copied from the finding (six call sites, not eight); the
  coverage-gate correction distinguishes clause three from clause four instead of retracting the
  original sentence wholesale; and item 4's promotion carries falsifying mutations per conjunct.
- The changelog states the erratum's boundary precisely — five items, §7 only, upstream unmoved, four
  corpus literals unchanged — and every one of those claims is true as measured. That is what makes a
  delta confirmation cheap to run.
- §7.3's "why the report field name is not a census token" paragraph records the *rejected* alternative
  (carving `buildFinalReport` out of the scan) and why it was rejected. A future reader tempted to
  re-add the token finds the answer already written.

## Delta-Confirmation Findings

## Recommendation

## Verdict
