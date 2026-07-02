# Cross-Review: test-engineer — FSPEC (v4)

**Reviewer:** test-engineer
**Document reviewed:** docs/harden-harvest-guard/FSPEC-harden-harvest-guard.md (Version 1.3; oracle: REQ-harden-harvest-guard.md Version 1.6, Canonical Matrix M01–M86 / S01–S07)
**Date:** 2026-07-02
**Iteration:** 4

**Scope:** Testing lens — (1) disposition verification of my three iteration-3 findings (F3-01 → M84 + destination-destruction test; F3-02 → M86; F3-03 → REQ step-4 prose) against the actual REQ v1.6 / FSPEC v1.3 sections, including re-derivation that each row kills the wrong-implementation class it was filed against; (2) new-testability-defect scan of the v1.3 deltas: rows M84–M86, the FSPEC-GUARD-02 step-4 destination-destruction test, the step-5 rescoping, BR-02-1, the M33 re-run extension, and the M66/M80 fixture pinning.

## Prior-Finding Disposition Verification (iteration 3 → v1.3 / REQ v1.6)

| Iter-3 finding | Claimed resolution | Verified against actual sections | Status |
|---|---|---|---|
| F3-01 (Medium) — fully static `mv`-overwrite of an existing guarded file undecided (fall-through ALLOW vs literal-D2 BLOCK, no row, no RR entry) | Decided BLOCK: step-4 destination-destruction test + row M84 | REQ-GUARD-02 mv semantics now open with the destination-destruction test, stated **first** and with source guardedness explicitly irrelevant; a new mv-table row and AC pin `mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`; matrix row **M84** exists exactly as requested and is in M33's G6 re-run set with correct rationale (destination Verified → destruction test unmet → unguarded-source fall-through ALLOW). Re-derived the kill: an implementation lacking the test misses at steps 2–3 (all static, source unguarded), step 5 is guarded-source-scoped → fall-through ALLOW → fails M84. Re-traced the *existing* qualifier: M11 (`…-x-v2.md`) and M52 (`archive/CROSS-REVIEW-x.md`) resulting paths name no existing file → step 4 misses → still ALLOW; M79's `/tmp/…` resulting paths are unguarded → still blocks via step 5. BR-02-1 now states which reading governs (the mv flow, not plain D2 — M11 forecloses literal D2(i)), and FSPEC-GUARD-06's D2-hit rows name both mv-flow static tests, so the reason-code mapping is total. REQ v1.6 revision history honestly labels this a real semantic extension (the v1.5 flow allowed the cell). | **Resolved — correctly** |
| F3-02 (Low) — unified enumeration-anchor fallback had no discriminating row (process-cwd-rev-parsing implementation passed all 83 rows) | Matrix row M86 | REQ M86 exists exactly as requested: `CLAUDE_PROJECT_DIR` unset; stdin `cwd` = fixture repo root (unverified guarded `docs/f`); process cwd = a **second** guarded-directory-free git repo; `rm docs/f/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`, kill condition stated in the row. Re-derived: G-DP1 tests root (A) = fixture repo (passes); the wrong-anchor implementation rev-parses the process cwd, enumerates the second repo, finds no guarded directories → BR-01-2 ALLOW → fails; the conformant anchor enumerates `docs/f` → D2 → BLOCK. Operand resolution is union-safe (root (A) resolves the relative path). Cited in FSPEC step 8; in M33's re-run set (Verified → ALLOW); hermetic — § Acceptance Tests names the second fixture repo and the `CLAUDE_PROJECT_DIR` unset control. | **Resolved — correctly** |
| F3-03 (Low) — REQ-GUARD-01 step-4 prose still scoped the union rule to "segment 1's" operands, diverging from M80/FSPEC step 6 | REQ v1.6 step-4 rewording | REQ-GUARD-01 step 4 now reads "in **every** segment, not only segment 1: segment position never changes the resolution root until a `cd` segment updates it (row M80 pins the every-segment application discriminatingly)" — normative prose and matrix now agree. | **Resolved — correctly** |

Cross-checks on the v1.3/v1.6 promotion mechanics: the FSPEC § Acceptance Tests extension list (M66, M67, M73, M74, M79, M80, M82, M84–M86) matches REQ M33's row exactly; the twenty-two-row count is correct (M66; M67–M79 + S07; M80–M83; M84–M86); M85/M86 are correctly *inside* the G6 re-run set (both trivially ALLOW once `docs/f` is Verified) while M83 stays outside (root (A) is non-repo regardless of LEARNINGS state); the SE F3-02 fixture pinning landed — M66 and M80 both now state `CLAUDE_PROJECT_DIR` = fixture repo root, preserving their root-(B)-alone discriminating purpose; and M85 is a genuine neither-signal discriminator (an implementation emitting `NO_REPO`, or allowing, when both signals are absent fails it, while G-DP1 conformantly tests the process cwd and the deletion blocks `NOT_COMMITTED` via root (B) resolution).

## New-Defect Scan of the v1.3 Deltas

Swept: M84 (fixture constructible in the default state — destination file already on disk; reason code matches G8; discriminating per the disposition table); M85 (hermetic — `CLAUDE_PROJECT_DIR` unset control stated; consistent with M65, which ALLOWs because its glob resolves nothing at the repo root under either branch); M86 (above); the step-4/step-3 interaction (an indeterminate source with a static existing-guarded-file destination — `mv "$SRC" docs/f/CROSS-REVIEW-x.md` — is decided: step 3 fires unconditionally before step 4, D3(a) is satisfied by the destination operand's own `docs/` literal → BLOCK `INDETERMINATE`; the flow is total, so the reason-code asymmetry against M84 is a decided design choice, not an undecidable cell); the FSPEC-GUARD-06 table extension; and the Linked Requirements row mapping (M84 → GUARD-02, M85 → GUARD-03, M86 → GUARD-01 — all consistent).

Two row-level gaps survive the scan, both in the same F-09 residue class as prior iterations' Lows: decided behavior, one cheap discriminating row missing. Neither makes a test unwritable — the flow decides both cells; what is missing is the matrix pin that stops a plausible wrong implementation from passing the whole suite.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F4-01 | Low | Local | **The "source guardedness irrelevant" clause of the step-4 destruction test has no discriminating row.** M84's fixture uses an *unguarded* source, so an implementation that applies the destruction test only to unguarded sources (a literal generalization of M84's spelling — e.g. step 5 first for guarded sources, or an "unguarded source only" qualifier on step 4) passes all 86 rows yet ALLOWs `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md`: guarded source, resulting path in the same feature subtree, basename still matching the guarded pattern → step-5 ALLOW — destroying the existing guarded destination file. The conformant flow blocks at step 4 (`NOT_COMMITTED`) before step 5 is reached, and the REQ prose decides this ("First… source guardedness irrelevant"), so the cell is decided — but exit codes differ between the two readings and no row arbitrates. Missing row (M87-class): `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md` → BLOCK `NOT_COMMITTED`; both files exist in the default fixture (zero fixture cost); eligible for M33's G6 re-run set (destination's directory Verified → step 4 unmet → step-5 same-subtree/pattern ALLOW). | FSPEC-GUARD-02 steps 4–5; REQ-GUARD-02 mv semantics; M84 |
| F4-02 | Low | Local | **The resulting-path branch of the destruction test has no discriminating row — M84 exercises only the literal-destination branch.** Step 4 blocks when "the resulting file path… or the static destination itself" is an existing guarded file, and the resulting-path arm is what catches the directory-destination collision: `mv /tmp/CROSS-REVIEW-x.md docs/f/` → resulting path `docs/f/CROSS-REVIEW-x.md` = existing guarded file → BLOCK. An implementation that tests only the literal destination path sees `docs/f/` (a directory, not a guarded file), misses, and falls through step 5 (unguarded source) to ALLOW — silently overwriting the guarded file — while passing M84 (whose destination *is* the literal file path) and every other row (M52's dest/basename computation is exercised only on the allow side, where both readings agree). Decided behavior, one cheap row: `mv /tmp/CROSS-REVIEW-x.md docs/f/` → BLOCK `NOT_COMMITTED` (source need not exist on disk — the guard's decision is static; destination directory exists in the default fixture); eligible for the G6 re-run set. | FSPEC-GUARD-02 step 4; REQ-GUARD-02 mv semantics; M84, M52 |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- All three iteration-3 dispositions survive adversarial re-derivation — M84 kills the missing-destruction-test implementation, M86 kills the wrong-anchor implementation, and the REQ step-4 prose now agrees with its own matrix.
- The *existing*-file qualifier on step 4 is exactly the right discriminator: it decides the destruction cell as BLOCK without regressing a single allow row (M11, M52 re-traced), and the § Acceptance Tests G6 rationale for M84 is stated and correct.
- The step-3/step-4 order makes the mv flow total: every combination of {static, indeterminate} × {guarded, unguarded} × {source, destination} now lands on exactly one decision path with one reason code — the indeterminate-source/static-guarded-destination cell resolves deterministically to `INDETERMINATE` rather than being a second undecided cell.
- M85 closes the neither-signal branch with a row whose kill condition is stated inline, and the M66/M80 `CLAUDE_PROJECT_DIR` fixture pinning (SE F3-02) prevents both rows from degenerating into single-root tests.
- The REQ v1.6 revision-history row continues the honest-labeling precedent: the destruction test is called out as a real semantic extension of the v1.5 flow, not a row-only addition.

## Recommendation

**Approved with minor changes**

Both findings are Low: the destruction test's two branches are decided by the normative flow, so tests are writable from the spec as it stands — what is missing is one discriminating matrix row per branch (M87-class: guarded-source overwrite; directory-destination basename collision), each constructible in the default fixture at zero cost and eligible for M33's G6 re-run set. Per the F-09 process rule these should land as REQ matrix rows in the next REQ/FSPEC touch, or be folded into the TSPEC/PROPERTIES test enumeration for the mv flow — no FSPEC re-review round is required for either.

> Any High or Medium finding → Needs revision (mandatory).
