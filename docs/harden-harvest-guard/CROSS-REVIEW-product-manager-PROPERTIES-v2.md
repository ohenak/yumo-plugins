# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/PROPERTIES-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 2

## Review basis

Re-verified against REQ v1.7 (Canonical Matrix M01–M90, S01–S07), FSPEC v1.4, TSPEC v1.1 (§§ 3.5.4 sorted-feature determinism, 3.7 catalog, 6.1–6.6), PLAN v1.1 (TASK-01–TASK-14 table + dependencies + DoD bullets), DECISIONS v1.2 (CFD-1–CFD-8). No `docs/_constraints/` or `docs/_decisions/` exist (checked 2026-07-02) — no standing project-level constraint applies. This pass (a) confirms disposition of my three v1.0 Lows and (b) scans the v1.1 deltas the author added in response to the SE PROPERTIES review (Δ6 P-SORT-01 mixed fixture, PROP-COV-01 re-grounding, landing-task bindings, PROP-DEC-02 oracle split, Δ5 block-scoping) for new coverage/scope defects.

### Disposition of my v1.0 findings

| v1.0 ID | Sev | Status in v1.1 | Evidence |
|---|---|---|---|
| F-01 (BR-01-4 mis-cited as allow-silence source) | Low | **Resolved** | PROP-MSG-02 now carries the *Trace correction (PM F-01)* note (line 63) — BR-01-4 declared not-a-source, silence contract declared TSPEC-owned; Traces line reads `TSPEC §§ 3.2–3.3`; Δ1's supersession note grounds the strengthening in TSPEC § 3.3, not the FSPEC. |
| F-02 (PROP-COV-01 "binding for dod-verify" overreach) | Low | **Not addressed** — re-raised below as F-02 | The `Honest limitation (binding for dod-verify):` label and the sentence "A DoD verifier should check this list against the diff rather than demand an instrumenter number that cannot exist for this artifact class" survive verbatim (line 263). No disposition note; the wording was neither reframed nor disputed. |
| F-03 (delta preamble overclaims all deltas are § 6.6-supplementary) | Low | **Resolved** | New "Layer classification (corrected in v1.1 — SE F-04, PM F-03)" paragraph (lines 27–29) explicitly names Δ1 as a TSPEC **§ 6.2** helper-contract amendment and Δ5 as a **§ 6.3** self-audit amendment, both "behavior-neutral strengthenings … both upstream documents must be read as superseded on those points." Δ1's and Δ5's own rows now carry the supersession notes. |

Two of three cleared. F-02's Local wording is the only carry-over.

### v1.1 delta scan (new coverage / scope defects)

**Δ6 — P-SORT-01 mixed two-feature fixture (PROP-DEC-02 clause 2).** Verified in scope and sound.
- The clause it falsifies — "multiple affected features resolve in **sorted order**, first unverified decides" — is normative in **TSPEC § 3.5.4 step 4** (line 239: "multiple affected features → features in sorted order, first unverified decides (deterministic)"). This is a *specified decision branch*, so adding a discriminating case is an in-scope coverage addition, not scope creep. It also repairs a genuine gap my v1.0 pass missed: I certified the G-state map "total" but did not scrutinize the multi-feature selection rule, which every § 6.2 single-feature fixture leaves as dead code. SE F-02 caught it; Δ6 closes it.
- Reason-code arithmetic checks out against TSPEC § 3.5.4 + § 3.7: feature `a` (LEARNINGS committed, branch never pushed) = G4/`NOT_PUSHED` → substring `git push -u origin` (§ 3.7 line 281); feature `b` (LEARNINGS disk-only) = `NOT_COMMITTED`; both unverified; sorted-first `a` decides → `expectBlock(res, "NOT_PUSHED", ["git push -u origin"])`. An iteration-order-dependent implementation that reaches `b` first emits `NOT_COMMITTED` and fails — a real discriminator.
- The self-consistency argument for *adding* rather than *re-scoping* (line 94) is correct: PROP-COV-01 item 1's totality proxy claims every specified branch has ≥ 1 discriminating case, so re-scoping the clause would contradict the coverage waiver this document leans on. Add-the-case is the coherent choice.

**Landing-task bindings — verified accurate against PLAN v1.1.** A misattribution here would silently drop a delta (a coverage defect), so I checked each against the PLAN task table:
- Δ1 → **TASK-02** ✓ (TASK-02 defines `expectAllow`); Δ2/Δ3 → **TASK-05** ✓ (supplementary suite in `guardMatrix.test.js`); Δ4 case → **TASK-04** red / **TASK-07** green ✓ (S-rows in `hookCompatibility.test.js`; TASK-07 green-checks S01–S07), `runScopeCheck` spawn pin → **TASK-02** ✓; Δ5 → **TASK-03** ✓ (meta-tests 1/2/4); Δ6 case → **TASK-05** ✓, `mixed` builder → **TASK-02** ✓. Dependency chain TASK-02 → TASK-03 → TASK-05 means every builder exists before its consuming case. No orphaned or mis-owned delta. The per-task-dispatch correction (line 31 — replacing v1.0's blanket TASK-05 attribution) genuinely prevents a TASK-02/03/04 implementer from skipping their delta.

**PROP-COV-01 re-grounding — no product-scope defect.** The ≥ 85% branch criterion remains pipeline-owned (dod-verify), not a REQ AC of this feature; no REQ P0/P1 is re-scoped, and the named-untested-surfaces list is unchanged and still accurate. The re-grounding's remaining wording issues (measurement-impossibility framing) are SE-lens concerns tracked in the SE review; from the product lens the only residual is the authority-overreach wording (F-02).

### Coverage matrix — re-confirmed

Every REQ requirement still maps to ≥ 1 property; the v1.1 edits are additive (Δ6, oracle split) or wording. No property, verdict, reason code, or requirement mapping was dropped or narrowed between v1.0 and v1.1. REQ-GUARD-05's durable-reproducibility intent is now *better* served (sorted-order determinism gains a falsifying oracle).

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Revision History omits the v1.1 entry.** Frontmatter declares `Version: 1.1`, but the Revision History table (lines 321–323) ends at the 1.0 row — the v1.1 changes (Δ6/P-SORT-01 added, PROP-DEC-02 oracle split, layer-classification correction, landing-task bindings, Δ5 block-scoping, PROP-COV-01 re-grounding, PM F-01/F-03 + SE F-01/-02/-04/-05/-06/-07 dispositions) are unrecorded in the doc's own history. Traceability defect only — no property content is affected. Fix: add a 1.1 row summarizing the delta. | REQ-GUARD-05 (change traceability) |
| F-02 | Low | Process | **PROP-COV-01's "binding for dod-verify" phrasing still overreaches (v1.0 F-02, unaddressed).** A feature-level PROPERTIES doc records a measurement decision and supplies evidence; it should not instruct the pipeline's DoD verifier what *not* to demand ("A DoD verifier should check this list … rather than demand an instrumenter number that cannot exist for this artifact class," line 263). Reframe as a recorded measurement decision with the named-untested-surfaces list as evidence for the verifier to weigh. Durable process signal (unchanged from v1.0, still worth harvesting): dod-verify criterion 4 presumes instrumentable JS/Python/TS toolchains and has no sanctioned path for non-instrumentable artifact classes (bash + heredoc-embedded Python); this feature's structural-proxy-plus-named-untested-surfaces pattern is the durable answer and should be promoted so the next shell-deliverable feature does not re-derive it. | pdlc DoD criterion 4 (dod-verify SKILL.md) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Δ6 describes feature `a`'s fixture as "one repo, branch with no upstream … → `verify_feature(a) = NOT_PUSHED`". For G4/`NOT_PUSHED` (rather than G2 → VERIFIED) the `mixed` builder must configure an **origin remote** that this branch was simply never pushed to; a remote-*less* repo would route `a` through the G2 no-remote fallback → VERIFIED → ALLOW and break the stated outcome. The stated outcome (`NOT_PUSHED`) is unambiguous and any deviation fails the test loudly (not a silent gap), so this is builder-construction guidance for the TASK-02 implementer, not a defect — but confirm the `mixed` builder sets up `origin` so `a` lands in G4, matching the existing G4/M35 state builder. |

## Positive Observations

- The v1.1 response to the SE review is substantive, not cosmetic: Δ6 converts PROP-DEC-02's sorted-order clause from an unfalsifiable assertion into a mechanically discriminated one, and the "add the case, don't re-scope" reasoning is anchored in the document's own coverage-proxy contract rather than convenience.
- The layer-classification paragraph (Δ1/Δ5 as § 6.2/§ 6.3 amendments vs Δ2/Δ3/Δ4/Δ6-case as § 6.6 supplementary) plus the landing-task column is exactly the fix my v1.0 F-03 asked for, and it generalizes it — each delta now names its owning task so per-task se-implement dispatch cannot legitimately drop one.
- Trace hygiene improved: PROP-MSG-02/Δ1 no longer mis-cite BR-01-4; the allow-silence contract is correctly attributed to TSPEC § 3.3.
- Δ5's scoping of the catalog meta-conjunct to block entries (`expect.exit === 2`) correctly avoids the spurious `undefined ∉ catalog` failure on ALLOW rows.

## Recommendation

**Approved with minor changes**

Two Low findings, no High or Medium. F-01 is a one-row Revision-History addition; F-02 is a one-phrase reframe plus a carried-over harvest signal. Neither changes a property, verdict, reason code, binding, or requirement mapping. Two of my three v1.0 Lows are resolved; the v1.1 deltas (Δ6, landing-task bindings, PROP-COV-01 re-grounding) introduce no new coverage or scope defect and materially strengthen sorted-order determinism coverage.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
