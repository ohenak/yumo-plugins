# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/PROPERTIES-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 2

Reviewed against REQ v1.7 (Canonical Matrix M01–M90/S01–S07), FSPEC v1.4, TSPEC v1.1 (§§ 3.5.4, 3.6, 5, 6.1–6.2), PLAN v1.1 (TASK-02/03/04/05/07), DECISIONS v1.2 (CFD-1–CFD-8), and the diff `b9eca32..01b9b05` (v1.0 → v1.1). No `docs/_constraints/` or `docs/_decisions/` exist (re-checked 2026-07-02) — no standing project-level constraints apply.

## Iteration-1 disposition (verified against actual sections, not just the changelog)

| Iter-1 ID | Sev | Claimed fix | Verified against | Result |
|---|---|---|---|---|
| F-01 | Medium | Δ4 pins the spawn mechanism | Δ4 (delta table) + PROP-SCOPE-02 oracle: case routes through `runScopeCheck` → `spawnSync(BASH_ABS, [scriptPath], …)`, never `runHookScript`'s by-name spawn; spawn pin lands with the helper at TASK-02. Upstream claim re-verified: PLAN TASK-02 (line 48) **defines** `runScopeCheck(filePath, content)` but does **not** state its spawn mechanism, so pinning it here is correct and answers iter-1 Q-01. | ✅ Resolved |
| F-02 | Medium | Δ6 P-SORT-01 discriminator + PROP-DEC-02 oracle split | PROP-DEC-02 oracle now split into (1) run-to-run stability (P-DET) and (2) sorted-order independence (P-SORT-01); Δ6 adds the mixed two-feature fixture. Discriminator logic checked against TSPEC § 3.5.4 step 4 ("multiple affected features → features in sorted order, first unverified decides") — sound. | ✅ Resolved (see F-01 below for a fixture-precision nit) |
| F-03 | Medium | *(claimed area: PROP-COV-01 re-grounding)* | **No diff hunk touches PROP-COV-01.** Lines 255–267 are byte-identical to v1.0; the parenthetical "coverage.py cannot attach to a heredoc-embedded script without splitting the single-file deployable" is unchanged. No acknowledgment, no trace-option mention, no revision-history note. | ❌ **NOT resolved — carried forward (F-01 below)** |
| F-04 | Medium | Landing-task column + layer reclassification | Delta table gains a "Lands at" column (Δ1→TASK-02, Δ2/Δ3→TASK-05, Δ4→TASK-04 red/TASK-07 green + TASK-02 spawn pin, Δ5→TASK-03, Δ6→TASK-05 case/TASK-02 builder); preamble reclassifies Δ1 (amends TSPEC § 6.2) and Δ5 (amends § 6.3 meta-test 1) as supersessions, not § 6.6 additions, with a reconciliation note. | ✅ Resolved |
| F-05 | Low | PROP-DEG-01 remainder prose verbatim | Class (ii) now "**M66/M80** (M65 is the corresponding **ALLOW**-side RR-5 row, not a remainder member)"; class (iii) now `find . -name '*.md' -delete` (M50) / `find docs -delete` (M51); full remainder `{M08, M48–M51, M63, M66, M80}` stated verbatim. | ✅ Resolved |
| F-06 | Low | SELF_TEST_MIN_CASES derivation owner | PROP-TEST-04 now attributes the 38 (11+11+5+11) to "**PLAN v1.1 TASK-05 / CFD-6**", noting TSPEC § 6.6 enumerates areas without counts. | ✅ Resolved |
| F-07 | Low | Δ5 / PROP-MSG-03 scoped to block entries | Δ5 now "every **block** MATRIX entry's (`expect.exit === 2`)"; PROP-MSG-03 oracle (a) mirrors the scoping. | ✅ Resolved |

Net: 3 of 4 Mediums and all 3 Lows resolved. **F-03 (Medium) is unaddressed** and is re-raised below as F-01.

## Existing-Code / Upstream Claim Verification (single pass, v1.1 deltas)

| Claim in PROPERTIES v1.1 | Verified against | Result |
|---|---|---|
| Δ4: "routes through `runScopeCheck` (PLAN TASK-02)" and "PLAN TASK-02 does not state `runScopeCheck`'s spawn mechanism" | PLAN TASK-02 line 48 — `runScopeCheck(filePath, content)` companion defined; spawn mechanism unstated (only `runGuard` states `spawnSync(BASH_ABS, …)`) | ✅ accurate |
| Δ6 / PROP-DEC-02: "first unverified decides" is normative | TSPEC § 3.5.4 step 4 (line 239) — verbatim | ✅ holds |
| Δ6: feature `a` (committed LEARNINGS, branch unpushed) → `verify_feature(a) = NOT_PUSHED` + `git push -u origin` | REQ G4 (line 190) + TSPEC § 3.6 line 269 + § 3.7 line 281 | ✅ **iff origin remote exists** — see F-01 below |
| Δ6: single `rm -rf docs` affects both features (D2 iv ancestor) | TSPEC § 3.5.4 step 4 D2 clause (iv) — recursive-capable ancestor `docs` | ✅ full-runtime block; the M48 degraded-remainder listing is irrelevant here (Δ6 runs full runtime) |
| Δ5 supersedes / Δ1 supersedes upstream helper contracts | TSPEC § 6.2 / PLAN TASK-02 `expectAllow` exit-0-only (line 48) | ✅ contradiction correctly flagged with reconciliation note |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PROP-COV-01's coverage-waiver premise was flagged Medium in iteration 1 (iter-1 F-03) and is entirely unaddressed in v1.1** — no edit, no acknowledgment, no revision-history entry. The section still discharges the ≥85% branch criterion by declaring the number *impossible* to produce: "coverage.py cannot attach to a heredoc-embedded script without splitting the single-file deployable that DEC-01 deliberately preserves." That absolute is falsifiable — a test-side **verbatim extraction** of the heredoc (byte-checksum-pinned to the deployed text) run under `python3 -m coverage run --branch`, replaying the self-test corpus + MATRIX stdin payloads, yields a numeric branch percentage for the whole Python engine without splitting the deployable. Because this section self-declares "**binding for dod-verify**" — and this repo's Phase DOD literally runs `dod-verify`, which scans coverage gaps — a verifier can refute the premise and reject the waiver (or demand a number). The structural-proxy *decision* is sound; the *justification* must rest on the true constraints: (a) coverage.py / bashcov / kcov are new non-npm toolchain deps breaching the zero-new-dependency convention; (b) it measures an extracted copy (adds a checksum-equality obligation); (c) the bash wrapper stays unmeasured; (d) stdlib `python -m trace` needs no dep but gives **line**, not **branch**, counts — failing the *branch* criterion. Reword the measurement decision on those grounds and name `trace` as considered/rejected. | PROP-COV-01 |
| F-02 | Low | Local | **Δ6's `mixed` fixture says "one repo, branch with no upstream," which is under-specified for feature `a`'s asserted G4 state and can silently collapse the very discriminator F-02 added.** For `verify_feature(a) = NOT_PUSHED` with the `git push -u origin` substring, feature `a` must be **G4** (origin remote exists, `origin/{branch}` ref absent — REQ line 190; TSPEC § 3.6 line 269; message § 3.7 line 281). But TSPEC § 3.6 line 266 checks `git remote` *first*: **no origin remote → G2 → `NOT_COMMITTED`**. If an implementer reads "no upstream" as "no remote configured" and omits the bare origin, feature `a` becomes G2/`NOT_COMMITTED` — identical to feature `b` — so the sorted-first selection is no longer observable *and* `expectBlock(res, "NOT_PUSHED", ["git push -u origin"])` fails regardless of iteration order (permanently red, or "fixed" by weakening the assertion, destroying the discriminator). The `NOT_PUSHED` + `git push -u origin` assertions do pin G4, so this is Low, but the `mixed` builder spec should state it explicitly: reuse the existing § 6.2 / PLAN TASK-02 **G4 builder discipline** (origin bare remote present, branch never pushed, LEARNINGS-a committed), not "no upstream." | Δ6; PROP-DEC-02 oracle §2 |
| F-03 | Low | Local | **Frontmatter is bumped to Version 1.1 but the Revision History table (lines 321–323) has no v1.1 row** — a reader cannot see what changed between v1.0 and v1.1 (the five iter-1 fixes, PROP-COMPAT trace correction, Δ6, PROP-DEC-02 oracle split). Add a `1.1` row summarizing the iteration-1 PM/SE remediation. | Revision History |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was PROP-COV-01's non-revision (F-01) a deliberate rejection of iter-1 F-03 or an oversight? If deliberate, record the disposition inline (a one-line "iter-1 F-03 rebuttal") so harvest and dod-verify see the reasoning rather than an unexplained gap. |

## Positive Observations

- **The F-02 → Δ6 resolution is genuinely well-engineered.** PROP-DEC-02's oracle is now honestly split: the doc states outright that a double-run *cannot* falsify the sorted-order clause and that every § 6.2 fixture holds exactly one guarded feature, making the selection rule dead code under P-DET alone. The "add the case rather than re-scope the clause" decision is correctly justified by the coverage-proxy's own row-totality claim — re-scoping would have left a specified branch untested by the whole suite. The discriminator (a=NOT_PUSHED sorted-first vs b=NOT_COMMITTED, single `rm -rf docs`) exactly matches TSPEC § 3.5.4 step 4.
- **F-01 → Δ4 spawn-discipline fix is exactly right and verified against PLAN.** Routing the degraded scope case through `runScopeCheck`/`BASH_ABS` avoids the empty-child-`PATH` ENOENT trap, and the doc correctly identifies that PLAN TASK-02 leaves `runScopeCheck`'s spawn mechanism unstated — so pinning it here is a legitimate, non-contradicting refinement.
- **F-04 → landing-task bindings + supersession honesty is above bar.** Δ1/Δ5 are correctly reclassified as upstream-mechanism amendments (not § 6.6 additions), each with a named reconciliation obligation, and every delta now names the task whose implementer owns it — closing the "TASK-05 implementer can't retro-edit earlier-batch files" gap.
- **F-05/F-06/F-07 are all fixed verbatim against the matrix and derivation owners** — the PROP-DEG-01 remainder now reads exactly `{M08, M48–M51, M63, M66, M80}` with M65 correctly excluded as the ALLOW-side RR-5 row.

## Recommendation

**Needs revision**

One Medium remains: **F-01 — PROP-COV-01's coverage-waiver justification (iteration-1 F-03) is unaddressed.** It is a documentation-soundness defect in a section explicitly binding for dod-verify, and must be re-grounded on the true dependency/portability/measured-copy constraints (naming `trace` as rejected) rather than a refutable impossibility claim — or, if the te-author intends to hold the current wording, record an explicit rebuttal of iter-1 F-03 inline (Q-01). F-02 (Δ6 fixture must be G4, not "no upstream"/G2) and F-03 (missing v1.1 revision-history row) are minor and can ride the same revision. Every test *oracle* in the document is implementable as written; the blocker is the waiver's grounding, not any oracle.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
