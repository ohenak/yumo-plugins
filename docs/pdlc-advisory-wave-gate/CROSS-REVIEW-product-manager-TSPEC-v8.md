# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.7)
**Date:** 2026-08-20
**Iteration:** 8
**Scope:** Local

## Re-grounding

Upstream HEAD matches the dispatch hashes exactly, and `git log f6a45cc5..HEAD -- REQ FSPEC`
is empty: REQ and FSPEC are byte-identical to the state v1.6 absorbed (FSPEC v1.4). The
changelog's "nothing upstream decided this round, no absorption owed" is true as written.
No upstream citation in the TSPEC has gone stale.

## Confirmation of raised items

| Item | Raised by | Landed | Evidence |
|---|---|---|---|
| §1.3 omits row-count sites | pm-review | Yes | Table now carries **eight** rows (counted) and the header reads "Eight shipped surfaces". The bare row-count row names four sites; `grep -n "toHaveLength(5)"` returns exactly `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `:726` — the cited lines, no more, no fewer. The `.enabled` row correctly records **unchanged three** as a constraint on A6 rather than an edit. |
| §3.2 step 2 contradicts the once-only read | pm-review | Yes | Step 2 now gates on `advisoryTierOn === false`; the signature block gains `advisoryTierOn` as a resolved boolean sourced at `orchestrate-dev.js:13678`. Prose draws the gate/read distinction explicitly. Verified against `orchestrate-dev.js:13675`–`:13677`, which reads "the tier's own master switch is inspected exactly here". |
| §4.4/E-33 "documented affordance" without a carrier | pm-review | Partly — see F-01 | The README carrier is dropped and its absence is justified with four independent reasons, all verified: `pdlc/README.md` has zero `advisory` occurrences; `docs-uniqueness.test.js:122`–`:123` line-pins `pdlc/README.md:139` and `:145`; the wave loop commits exactly `task.files`. The word "documented" survives, and a new carrier claim replaces the old one. |
| §5.1 map re-points the engine expectation | te-review | Yes | Map row now names `pdlc/engine/__tests__/advisory-config-example.test.js` as a **new file**, matching PLAN v1.1/v1.2. `ci-arrangement.test.js` contains zero `advisory` occurrences, so the stated reason for not hanging it there holds. |
| §5.6 per-AT red-test rule | se-author | Yes | Rule corrected to set-equality of AT ids against PLAN's AT-coverage table. Both cardinality facts check out: FSPEC declares 47 ATs, and PLAN A6-15 alone owns 19 in `advisoryWaveGate.test.js`, so a row-per-AT rule would indeed collide with batch-safety rule 2. |
| Carried: `ledgerAnchor` creation site | pm-review v6/v7 | Yes | Reconciled onto the single step-4 site with the per-wave guarantee stated directly rather than inherited from `invocations`' scope. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §4.4 fixes the carrier problem for the README but re-states it for the example file. The specified example literal is `{"advisory": {"enabled": false, "waveBudgetPerRun": 1}}` — shipped defaults. That literal never shows `0`, never shows `enabled: true`, and therefore does not teach E-33's "keep tier on, keep A6 off" pairing. Yet the section says the block "is the only place the file can teach that `waveBudgetPerRun: 0` **with `enabled: true`** is E-33's documented affordance", and closes "The affordance is carried by the example pairing alone." An operator reading the shipped example sees two keys at their defaults and no signal that `0` is legal-and-honoured rather than misconfiguration. The *behaviour* is fully covered (the `nonNegativeInt` validator plus FSPEC AT-07-2b's companion "`0` in yields `0` back"), so nothing is at risk at runtime; what is unsupported is the discoverability claim. Suggested fix: drop the two carrier sentences and say plainly that E-33's `0` is honoured by the validator and asserted by AT-07-2b, with no operator-facing documentation carrier in this feature's scope — the same resolution already applied one paragraph below for the README. | FSPEC E-33, AT-07-2b |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If operator discoverability of the `0` affordance is genuinely wanted, it is a product decision and belongs in REQ/FSPEC as its own requirement with a named carrier — not in TSPEC rationale. Should it be raised as a follow-up REQ item, or is "validated and asserted, undocumented" the accepted end state for this feature? |

## Positive Observations

- Every factual claim added this round is checkable, and every one I checked was exact: four `toHaveLength(5)` sites at the named lines, three `.enabled` reads at `orchestrate-dev.js:3258`/`:13678` and `orchestrate-queue.js:1318`, zero `advisory` in `ci-arrangement.test.js`, zero in `pdlc/README.md`, and the `docs-uniqueness.test.js` line pins. Line-anchored citations that survive verification are what make an erratum round cheap to confirm.
- The §5.6 correction is the strongest edit in the round. It replaces a cardinality rule that was quietly unsatisfiable — 47 ATs against batch-safety rule 2's single-writer constraint — with a coverage rule that says what the obligation actually is. That defect would have surfaced as an unexplained PLAN-shape argument in Phase I.
- The §4.4 README paragraph gives four independent, mechanically verifiable reasons for an *absence*. Justifying why a row is deliberately not in the file map is exactly what stops a downstream author inventing an unowned carrier.
- §3.2's gate/read distinction is a genuinely subtle correction — keeping AC-1.4's duplicated inertness gate while removing the duplicated `.enabled` read preserves the product guarantee and the PROP-DIS-06 count at once.

## Recommendation

**Approved with minor changes**

All five raised items are landed and verified against HEAD; the sixth carried item is
resolved. The TSPEC remains a faithful compression of unchanged upstream. F-01 is a Medium
overclaim in rationale prose with no behavioural consequence — it does not gate.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
