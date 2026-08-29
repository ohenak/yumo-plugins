# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-08-28
**Iteration:** 4

Delta re-review against the commit carrying v1.2 (`3c4b499c4`, the base of my v3). The document
moved across five commits since (`ab8d64780`, `de61d3892`, `9d46108e0`, `416195bb2`, `25a19ff88`),
69 insertions / 15 deletions. Changed surface: the header block (Version 1.2 → 1.4), two added
changelog paragraphs, one rewritten paragraph in `## Context`, `DEC-DECLEDGER-03/-13`'s two
`maxEntries`-fires-first passages, the new `DEC-DECLEDGER-16` rejected-alternative section, its
`## Decision` row, its PROPERTIES `## Consequences` row, its re-evaluation trigger, and the
rewritten `DEC-DECLEDGER-10, DEC-DECLEDGER-12` trigger row. I scanned only those hunks for new
issues and re-verified my one prior finding at HEAD. Sections approved in earlier rounds are not
re-litigated.

## Prior findings disposition

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 (v3) — the new discharge list was stated as complete ("Those five sites are the discharge list") but was a containment claim, not set-equality: §4.3's framing-budget rationale derived the retired `~495` figure and sat outside the enumeration | Medium | **Resolved, and resolved wider than asked** | The rewritten `DEC-DECLEDGER-10, DEC-DECLEDGER-12` row now enumerates six sites, not five — *"§3.6's allowance and headroom arithmetic, §4.3's framing-budget argument, §7.3's shipped-default assertions and their rationale, D-10's restatement, and §9.2's erratum record"* — so §4.3, the site I named, is in. Two things make this more than a wording patch. First, the enumeration is no longer an outstanding-work list at all: the row now states the re-measurement *discharged*, and I confirmed that at HEAD rather than taking the claim — §4.3's `~495` derivation is gone (`495` now survives at exactly one TSPEC site, `TSPEC-pdlc-decision-ledger.md:1452`, inside §9.2's ERR-2 record and explicitly tensed *"the retired 8,000-byte bound left roughly 495 bytes"*). Second, the row re-frames the list as *"the worked example of the shape a future one-pass re-measurement takes ... enumerated before the move, not discovered one figure at a time"*, which is the reusable form of the completeness point I was making. |

I re-verified every load-bearing upstream claim the delta makes, since the whole v1.4 edit is a
re-grounding claim about a document this one does not own:

| Claim in the delta | HEAD |
|---|---|
| TSPEC is **v0.7**, pinned REQ **v1.9** / FSPEC **v1.3** / Baseline **v1.2** | Confirmed — `TSPEC-pdlc-decision-ledger.md:9` (REQ v1.9, FSPEC v1.3), `:11` (Baseline v1.2), `:18` (Version 0.7) |
| §3.6 states `12500 − 1200 = 11,300`, ~4,995 bytes of project-level headroom, `M-6b`'s 441 | Confirmed — `TSPEC:503-505` for the allowance and the ~4,995, `:540` for the 441 |
| Every surviving mention of 8,000 in TSPEC is explicitly tensed as retired | Confirmed across all six surviving sites — `TSPEC:471-476` (*"both then current"*, *"even at the retired default"*), `:502`, `:558`, `:1448-1452`. No live 8,000-based arithmetic remains |
| §9.2 marks `ERR-2` resolved | Confirmed — `TSPEC:1448` reads **ERR-2 (RESOLVED upstream — REQ v1.8)** |
| §7.3's corrected rationale states the drop loop's condition as a single disjunction, with the **byte** bound setting the terminal survivor count | Confirmed nearly verbatim — `TSPEC:1048-1053`: *"There is one drop loop and its condition is a disjunction (§3.6), so 'which bound binds first' is not a stage the loop has ... It is the **byte** bound that sets the terminal survivor count, at fewer than 70 lines"* |
| `DEC-DECLEDGER-16` is `POSTMORTEM-D`'s recommendation item 6 | Confirmed — `POSTMORTEM-D-pdlc-decision-ledger.md:258-265`, including the three provenance classes, the larger-side-of-an-inequality clause, and the DOMAIN-CONSTRAINTS promotion suggestion, all carried across |
| The `12,059` literal stood in four coupled sites (TSPEC §0, §3.6, §7.3, D-10) | Confirmed against `POSTMORTEM-D:229-232`, which enumerates the same four |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding | Requirement ref |
|----|----------|-----------|----------|---------------|---------|----------------|
| F-01 | Medium | delta | local | `## Decision` DEC-DECLEDGER-16 row and its PROPERTIES `## Consequences` row | **DEC-DECLEDGER-16's normative rows scope the rule to all TSPEC prose, where POSTMORTEM-D item 6 scopes it to asserted figures — as written the rule reddens five conforming HEAD sites it was authored to bless.** The rejected-alternative narrative gets the scope right: it says `12,059` was *"asserted as an equality a test would transcribe"* and the PROPERTIES row says *"a pinned equality may transcribe only ..."*. But the `## Decision` row states the rule over *"Every byte literal in TSPEC"*, and the PROPERTIES row opens *"DEC-DECLEDGER-16 binds assertions the same way it binds TSPEC prose"*. Under that reading, TSPEC HEAD violates the rule in five places that the source recommendation deliberately permits: `10,859 + 1,200 = 12,059` is a prose **equality with the ceiling as a term** at `TSPEC-pdlc-decision-ledger.md:66` and `:558`, and `12,059 ≤ 12,500` puts a ceiling-bearing term on the **smaller** side of an inequality at `:47`, `:547` and `:1085`. `POSTMORTEM-D:230-232` explicitly carves this out — *"`12,059` may survive as prose describing the worst-case block under the full framing budget — clearly labelled as an upper bound — but nothing may assert it and nothing may call it transcribed"* — and TSPEC is already conformant to that carve-out: `TSPEC:1076-1085` states in terms that the block total *"is deliberately not an equality"* and that the two halves are pinned separately. The decision as recorded is therefore stricter than both the remedy it adopts and the TSPEC it governs, and the strictness lands in the two rows a PROPERTIES author and a future TSPEC author will actually read. Fix is one clause in each of the two rows: scope the prohibition to figures that are **asserted or pinned** (test-transcribable), and say that prose may carry the derivation when it is labelled as an upper bound — which is what `TSPEC:558` and `:1085` already do. Worth getting right before consolidation, since the row itself nominates the rule for promotion to `docs/_constraints/DOMAIN-CONSTRAINTS.md`, where the over-broad form would bind every feature. | REQ-DECLEDGER-07; REQ C-5 |

FINDING: Medium | delta | local | `## Decision` DEC-DECLEDGER-16 row and its PROPERTIES `## Consequences` row | The rule is scoped to "Every byte literal in TSPEC" / "binds ... TSPEC prose", where POSTMORTEM-D item 6 scopes it to asserted figures and item 2 expressly permits `12,059` as labelled prose; as written it reddens five conforming HEAD sites (`TSPEC:66`, `:558` prose equalities; `:47`, `:547`, `:1085` ceiling on the smaller side) — scope both rows to asserted/pinned figures.

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-DECLEDGER-16's re-evaluation trigger says that once the framing constants are written and measured, *"equalities over the measured figure become assertable"*. That is right for the 1,200 ceiling, but the figure that would then become assertable is a **new** measurement, not `12,059` — `12,059` is `10,859 + 1,200`, and the measured framing size will not be 1,200. Non-blocking, and I read the row as already meaning this ("re-classes to a measurement with a fixture source"); flagging only in case a later reader takes the trigger as licence to restore the `12,059` equality rather than to re-derive the sum. |
| Q-02 | Carried from v2 and v3, still open and still non-blocking: DEC-DECLEDGER-13's *"~154-byte mean line"* (`6,305 / 41 = 153.8`) against §3.6's reported project-level mean of **153** (`TSPEC-pdlc-decision-ledger.md:437`). Rounding, no conclusion turns on it. |

## Positive Observations

- **The re-grounding is stated as a closed episode with what it leaves behind, not as a deletion.**
  `## Context`'s exception paragraph could have been cut once `ERR-2` landed; instead it reads
  *"The one exception that used to be live is now closed, and is recorded rather than deleted"* and
  ends by naming the two durable residues (DEC-DECLEDGER-16's provenance rule, the one-pass
  trigger) rather than a *"standing divergence"*. A reader arriving in six months learns why the
  figures were ever split across two homes, which is exactly the thing a ledger of rejected
  alternatives exists to preserve.
- **The `maxEntries`-fires-first correction was made in the mechanism's terms, not by swapping a
  bound name.** Both sites now say there is no "first" — one loop, a disjunctive condition, both
  bounds exceeded at 141 records, byte bound setting the terminal survivor count. I checked this
  against `TSPEC:1048-1053` rather than against the document's own prose, and the reading is
  faithful including the part that is easy to lose: the conclusion the passage exists to protect
  (*"`omitted[]` does not go vacuous under the raise"*) is preserved and now rests on a correct
  premise instead of a wrong one that happened to reach the same place. That is the harder fix and
  it is the one that was made.
- **DEC-DECLEDGER-16 is recorded as a defect *class* with its refutation, which is what item 6
  asked for.** The section states the arithmetic truth and the dimensional falsehood in the same
  sentence (*"`12,059 = 10,859 + 1,200` is arithmetically true and dimensionally false"*), explains
  why prose altitude hid it from three readers, and derives the asymmetry rather than asserting it
  — `12500 − 1200 = 11,300` understates the margin and cannot go green falsely, whereas the
  addition reddens conforming implementations drafted under budget. A rule stated with its
  direction argument survives a future reader who wants to bend it; a bare prohibition does not.
- **The discharge list survived its own discharge.** The obvious edit once `ERR-2` closed was to
  delete the enumeration. Keeping it as the worked shape of a one-pass re-measurement turns a
  one-off status note into the reusable artefact the trigger needs, and it is the direct answer to
  my v3 finding at a higher altitude than the finding asked for.
- **Scope discipline held across a five-commit edit.** Both changelog paragraphs promise *"no
  standing decision is re-litigated and no other section moves"*, and the diff bears that out: 69
  insertions confined to the header, `## Context`, two DEC-DECLEDGER-03/-13 passages, and
  DEC-DECLEDGER-16's four sites. No REQ/FSPEC scope entered through the back door of a
  re-grounding pass.

## Recommendation

**Approved with minor changes**

My one prior finding is resolved, and resolved wider than I asked. The three re-grounding claims
are not merely internally consistent — I confirmed each against TSPEC HEAD (pins at `TSPEC:9-18`,
the raised-bound figures at `:503-505` and `:540`, the disjunction rationale at `:1048-1053`,
`ERR-2` resolved at `:1448`), and against `POSTMORTEM-D:258-265` for the new decision's provenance.
No High finding is open, delta or inherited. The single Medium is a scope-of-wording issue in
DEC-DECLEDGER-16's two normative rows, where the rule as recorded is stricter than the remedy it
adopts and than the TSPEC it governs; the narrative already states the correct scope, so this is a
clause in each of two rows and does not gate the phase. It is worth landing before consolidation
because the row nominates the rule for project-wide promotion.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
