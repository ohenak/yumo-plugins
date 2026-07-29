# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md` (v2.0, Draft)
**Date:** 2026-07-28
**Iteration:** 2

**Upstream at review time:** REQ v17.0, FSPEC v5.1, TSPEC v2.1 — all approved and unmodified by v2.0.
Findings below are PROPERTIES-altitude only.

**Delta protocol.** This is a re-review of v2.0 against
`CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` (5H/4M/6L). Every v1 finding's disposition was
checked at the **site**, not only in §15's ledger, and the arithmetic v1 disputed was re-done
independently. All fifteen v1 findings are resolved. The findings below are new and all Low.

**Verification performed this round**

| Check | Result |
|---|---|
| F-01 — co-holdability of the five state adjacencies against FSPEC §3.3's guards | **Confirmed.** `unknown > missing` (rung 1's `P2 == no` vs rung 2's `P3 == no`, different sides, independent) and `in-sync > unverified` (byte comparison vs manifest lookup) are the only co-holdable *adjacent* pairs; `missing > in-sync` are complements over P3, `unverified > stale` presupposes the entry rung 4 denies, and rung 6 is `otherwise` with no guard. The `unknown > every lower` row is the third legitimate order-observing fixture (see F-08 for its framing) |
| F-01 — PROP-CLS-02(b)'s directed oracles | **Sound and grounded.** L6's `consumerHash === null` / `pluginHash !== null` conjunct is FSPEC §1.3's field rule verbatim ("`pluginHash`/`consumerHash` are `null` when not computed"), so the vacuous-`""`-equality implementation is genuinely red. PROP-CLS-07 and the L9/L10 `pluginHash` pins are real oracles for the defects they name |
| F-02 — E5/E6 determinacy against FSPEC §2.1 Phase 1 | **Correct.** `E5 ⟸ E2 = holds ∨ E4 = holds ∨ E4 indeterminate` and `E6 ⟸ E5 = holds ∨ E5 indeterminate` are FSPEC's "indeterminate if E2 or E4 failed" / "if E5 failed" read correctly (E4 "failed" = no bytes to parse = `manifestAbsent` holds, or E4 itself indeterminate) |
| F-03 — vector recount, done independently | **20 confirmed.** Free axes: E2 (2) × E3 (3), with E4 free only under `E3 = ok` (2), E5 free only under `E2 = E4 = does-not-hold` (2), E6 free only under `E5 = does-not-hold` (2). `E3 ≠ ok`: 2×2 = 4. `E3 = ok`: `E4 = holds` → 2; `E4 = dnh` → E2 `holds` 1, E2 `dnh` → E5 `holds` 1, E5 `dnh` → 2. Total **10**; × E1's 2 = **20**. §5.1's five-row derivation table reproduces exactly this partition |
| F-02 — PROP-BSL-03's first-release conjunct | **Correct.** With `E5/E6 = indeterminate` the computed oracle `precedence.find(c => vector[c] === "holds")` skips `manifest-empty`/`manifest-malformed` and lands on `manifest-absent`, matching FSPEC §2.8 row 3. The regression fixture is named literally |
| F-04 — PROP-MTM-04 against FSPEC §4.2 / §5.5 / §1.2 | **The rescoping is correct and conforming-implementation-green** in both AT-35 sub-cases (pre-existing entry: post-copy `local-edit`, recorded `unverified`; no entry: both `unverified`). Step 6's placement between passes 2 and 3 is now cited, not inferred. §1.2's "no *older* entry outlives a failed copy" confirms the `local-edit` prediction. One wording defect only — F-04 below |
| F-05 — spawn budget, recomputed row by row | Rows §3 (4+2+2+8+4+3 = 23), §4 (1), §5 (20+3+6+10 = 39), §6 (8), §7 (3+3+4+5+3+2+1 = 21), §9 (1+2+1+2+1+2 = 9) all check out. §8 and §10 do **not** — F-01 below. Corrected total **181**, which the stated ≈ 180 ceiling and the 27–45 s wall-clock argument both survive |
| F-06–F-09, F-10–F-15 | All resolved at the site: one skip inventory (§11.1, `git` row reconciled), §8.0 pins form/home/extraction with an independence argument, §2.2's `hash` granularity + P-R-4a's fallback, §0.2 regenerated (O-20 = seven, RSN-01…06 / BSL-01…08, three-precedence account, L3/L4 covered by L2/L5), §1.2 retitled, `itOrSkip` four-parameter signature, §12 reconciled property-by-property (I re-diffed all 11 file rows against every "Lands in" annotation — no disagreement remains), `PDLC_PROP_SEED` + replay, PROP-SEAM-02 scoped to argument 1 with three exclusions, PROP-SEAM-01(b)'s four classes |
| HEAD claims (new in v2.0) | `pdlc/hooks/scripts/` holds only the three existing hook scripts; `pdlc/workflows/lib/` does not exist; `__tests__/helpers/` exists with two files. So C1/C2/C3, `document-oracles.mjs` and `driftGenerators.js` are all correctly marked **new**. TSPEC §5.1.1's 7-bearing / 9-non-bearing partition matches PROP-SEAM-03's list token for token |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Two of the recomputed budget subtotals disagree with their own derivations.** §1.4's **§8 row states 47** but its derivation sums to **48** (PROP-SEAM-01 `16 + 4 + 1 = 21`, -03 `16`, -04 `4`, -05 `3 × 2 = 6`, -07 `1`). §1.4's **§10 row states 27** but its derivation sums to **32** (`3 + 6 + 4 + 5 + 8 + 6`). §15's SE F-05 ledger repeats both figures. The row totals as printed sum to 175; the derivations sum to **181**. This does not damage the conclusion — 181 is what the "≈ 180" ceiling and the 27–45 s wall-clock argument are already stated against, and both survive — but the derivations are the auditable part of the row and two of them do not add up, in the one table v1 F-05 existed to make arithmetically real. Fix the two subtotals (and the ledger's copy) to 48 and 32. | §1.4 rows §8/§10; §15.1 SE F-05 |
| F-02 | Low | Local | **PROP-MTM-07's domain is unscoped, and on §7's generated set two of its conjuncts are red against a conforming implementation.** The property says "For every generated consumer tree", and §7's set explicitly includes write-failing trees (PROP-MTM-06: "green, mixed, and **write-failing**") and trees carrying at least one `local-edit` and one `unverified` row (PROP-MTM-03's added conjuncts). On a write-failing tree the second run's `writeFailures` is non-empty (conjunct 4 red) and on a declined-row tree the second run exits **1** per AC-3.3, not 0 (conjunct 5 red). The intended domain is recoverable from the conjuncts themselves, which is why this is Low rather than a repeat of v1 F-04 — but PROP-MTM-01 states its domain ("whose rows are all `stale` or `missing`") and this one should too: the fault-free trees whose first sync exits 0. | §7 PROP-MTM-07; §15.2 PM F-02 |
| F-03 | Low | Local | **P-R-10 names two unco-holdable adjacencies where the body identifies three, and the omitted one is not actually order-observable either.** §2.1(2)'s table and PROP-CLS-02(b) both list **three**: `missing > in-sync`, `unverified > stale`, `stale > local-edit`. P-R-10's headline and body name only the first and third. `unverified > stale` belongs there too: PROP-CLS-07 is red against the *degraded-manifest fall-through* implementation (a different defect), not against a pure rung-4/5 swap — with no entry, an implementation that evaluates rung 5 first compares `sha1(consumer)` against an absent `entry.consumerHash`, the comparison fails, and the ladder still lands on `unverified`, so the output is identical on every input. Add the third adjacency to P-R-10 and say explicitly that PROP-CLS-07 compensates for a different defect class rather than for the reordering — the same distinction the `stale > local-edit` row already makes for itself ("this row does not pretend otherwise"). | P-R-10; §2.1(2); PROP-CLS-02(b) |
| F-04 | Low | Local | **PROP-MTM-04's scope predicate has two non-equivalent renderings, and the title's "exactly when" is a biconditional the property does not assert.** The heading and conjunct 2's first clause say "step 6 **neither wrote nor removed** an entry for R"; the operational clause says "R's copy verification **passed**, or R was not copied at all". These are not the same set: a verified copy makes step 6 *write* an entry for R, so such runs satisfy the operational clause and violate the structural one. Agreement holds there for a different reason than the heading gives — post-copy R is `in-sync`, and rung 3 fires **before** any manifest lookup, so the entry rewrite cannot move it. Separately, "agrees **exactly when** step 6 left R's entry alone" reads as an iff that conjunct 3's second sub-case falsifies (no pre-existing entry ⇒ both passes `unverified` ⇒ agreement). Keep the operational predicate, drop the "exactly when", and state the real reason for the copy-verified case. | §7 PROP-MTM-04 conjuncts 2–3 |
| F-05 | Low | Local | **§8.0's `readonly PDLC_FAULT_TOKENS` is a re-source hazard against the extraction it specifies.** C1 is a sourced library: C2 and C3 source it, and `readFaultTokens()` sources it again inside its own `bash -c`. In any shell where C1 is sourced twice, `PDLC_FAULT_TOKENS=(…)` against an already-`readonly` name is a bash error and the assignment fails (`readonly variable`), which under `set -e` aborts the sourcing shell. Either give C1 an idempotent-source guard (`[[ -n ${PDLC_DRIFT_LIB_SOURCED:-} ]] && return 0`), or make the `readonly` conditional, or drop it — the mutation protection it buys is worth less than a library that cannot be sourced twice. `readFaultTokens()` should also assert the child's **exit status**, not only the 16-entry count, so a sourcing failure surfaces as a harness error rather than as an empty array. | §8.0 rows "Form" and "JS extraction" |
| F-06 | Low | Local | **Three small body/ledger inaccuracies.** (i) §15.3's SE Q-05 disposition says "L4, L5, L6 and **L7** now spell out their ancestors" — L7's path in §2.3 is still the partial `A4 = yes, A5 = equal`. (ii) PROP-CLS-07 states the N-4 expectation for the absent, unreadable and malformed sub-recipes but is silent on the fourth (**present-without-this-id**), which must also emit none — and it is the sub-recipe most likely to be implemented by the same code path as "malformed". (iii) PROP-SEAM-03's partition sentence says tokens marked **bearing** "produce **no** N-7", but TSPEC §5.1.1's malformed-spec rule puts the bearing forms `backup:` and `backup:a:b` in the N-7 half; the property's parenthetical currently sits inside the *non-bearing* clause where it does not scope to them. | §15.3; §3 PROP-CLS-07; §8.1 PROP-SEAM-03 |
| F-07 | Low | Local | **§13.1 claims to be "the full list" and is not.** It applies §13's absence-disposition contract to "every AC not appearing above", and carries an NFR row (NFR-2), so NFRs are in scope — but **AC-1.1a**, **AC-6.2a**, **NFR-4** and **NFR-5** appear nowhere in the document (verified by grep over the whole file). AC-1.1a is effectively discharged (it is the source of REQ §10's O-11, which §11.1 disposes) and AC-6.2a / NFR-5 are not property-shaped, so this is bookkeeping — except **NFR-4** ("sync never runs implicitly"), whose hook half *is* asserted, by PROP-MTM-04 conjunct 1's `assertPhaseOrder` claim that a hook run has no post-copy phase. Add the four rows; route NFR-4 to that conjunct by name. | §13.1 |
| F-08 | Low | Local | **PROP-CLS-02(a)'s third row is not a co-holding fixture under the section's own criterion.** §2.1(2) defines the split by whether "two guards can simultaneously **hold**". With `A0 = absent`, rungs 3 and 5 cannot be *evaluated* at all — `sha1(consumer)` does not exist — so "the rows would otherwise be `in-sync`, `stale`, `local-edit`" is a counterfactual about a different machine, not a co-holding claim. The row is nonetheless the most valuable order-observing fixture in §3 (FSPEC §3.3's first consequence, and the v1-ladder defect), because a wrong ordering *is* observable there. The criterion the split should state is therefore "**is the reordering observable through some input?**", with co-holdability as the usual — but not the only — way to get it; that framing keeps this row in (a) honestly and leaves (b)'s three rows exactly where they are. | §2.1(2); §3 PROP-CLS-02(a) row 3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-02: is PROP-MTM-07's first sync intended to *reuse* PROP-MTM-01's three plain-sync runs (which would explain §1.4's "1 repeat sync" line), or does it build its own tree? If it reuses them, the domain is already PROP-MTM-01's and only the wording needs the scope; if it builds its own, the budget row should say 2. |
| Q-02 | F-05: is C1 expected to be sourced more than once in one shell — C2 sources C1, and a test that drives C2 while also calling `readFaultTokens()` uses two separate processes, but a future `check-workflow-drift.sh` invoked from `sync-workflows.sh` in-process would not. If C1 already carries a source guard in the implementer's mind, say so in §8.0 and the `readonly` is fine as specified. |

## Positive Observations

- **The F-02/F-03 correction is the strongest repair in this revision.** The determinacy rules are
  now FSPEC §2.1 Phase 1's, the vector count is derived in a table a reviewer can check rather than
  asserted, the axis closure (E1–E6, not E7) is stated, and the manifest-absent vector is carried
  into PROP-BSL-03 as a **named regression fixture** for the exact defect v1.0's narrowing would
  have shipped. I recounted the 10 manifest-chain assignments from the dependency rules
  independently and got the same partition, row for row.
- **PROP-CLS-02's split is the right shape and is honest about what it cannot do.** The refusal to
  build a fixture where none can exist — and the explicit statement that a fake co-holding row is
  *worse than vacuous* because a reviewer stops looking — is the correct disposition. The directed
  oracles are real: L6's `consumerHash === null` / `pluginHash !== null` pair is grounded in FSPEC
  §1.3's field rule, not invented for the occasion.
- **PROP-MTM-04 conjunct 3 is a better property than the one it replaces.** Asserting the *shape* of
  the predicted disagreement, in both sub-cases, keeps the "a red run reopens the spec question"
  intent while making a conforming implementation green. The step-6 citation (FSPEC §4.2 step 6 +
  §5.5 + §1.2's "no older entry outlives a failed copy") is the answer Q-01 asked for, by citation.
- **Re-arguing R-3 on wall clock rather than on spawn count is the correct move**, and the
  re-expression rule now has an ordered priority with named first candidates (§8's two 16-token
  sweeps at 32, PROP-CLS-06's 8 solo runs), so it can actually fire. Owning the ≈ 180 number instead
  of trimming the enumeration to hit a prettier one is the right trade.
- **PROP-MTM-07 conjunct 2 is the property this feature most needed and did not have.** "A sync that
  takes a backup on every invocation is green against every other property in §7 and against AT-9,
  and its cost is that AC-3.4's five-deep window silently evicts" is exactly the operator-visible
  consequence a property should be written against.
- **§12 now reconciles.** I re-diffed all eleven file rows against every per-property "Lands in"
  annotation; the split-half convention is applied consistently and no property claims two homes by
  accident.
- **§8.0's independence argument is genuine**, not a restatement: the runtime array and the
  call-site text are different bytes, the declaration is explicitly excluded from the static scan,
  and the three defect classes it enumerates really are caught by different oracles.
- **P-R-8's "accepted with no owning surface"** and §0.3's rule that nothing may be routed to NFR-2
  are the kind of residual bookkeeping that usually goes missing. A residual routed to a structurally
  discharged NFR is a residual routed to nothing, and saying so is worth more than the mitigation
  would have been.

## Recommendation

**Approved with minor changes**

No High or Medium findings remain. All fifteen v1 findings are resolved at the site, and the five
Highs were verified by recount rather than by reading the ledger.

Severity note, stated rather than left implicit: **F-02** was weighed as a Medium — a property whose
stated domain makes it red against a conforming implementation is the v1 F-04 failure mode — and
lands at Low because the intended domain is unambiguously recoverable from the property's own
conjuncts (`writeFailures === []`, `baselineStatus: "resolved"`, exit 0), so an implementer meets the
mismatch at authoring time rather than after a red run. **F-07** was weighed as a Medium for the same
reason PM F-01 was one, and lands at Low because three of the four omissions are not property-shaped
and the fourth (NFR-4) is already asserted by an existing conjunct that merely needs naming.

Suggested order for the eight Lows, all of which are one-to-three-line edits:
F-02 (scope PROP-MTM-07's domain) → F-04 (PROP-MTM-04's scope predicate) → F-03 (P-R-10's third
adjacency) → F-01 (the two subtotals and the ledger copy) → F-05 (the `readonly` hazard) →
F-06 / F-07 / F-08 (wording and bookkeeping). None blocks PLAN authoring.
