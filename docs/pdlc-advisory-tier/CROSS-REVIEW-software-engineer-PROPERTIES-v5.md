# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 5
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `08925cf` (the commit my v4 review was written against) → `865c520` (HEAD).
`git diff 08925cf HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md` is four commits
(`48f7f90`, `a373adc`, `e5670c7`, `6bcd258`; v1.3 → v1.4) touching the header block, §2.1, §3's O-6,
§5.2, §6.5, §12.3's A-34 row, and §13.1 items 1/3/4/6.

## Disposition of v4 findings

All five are closed, and I verified each against the primary source rather than against the
document's own account of it.

| v4 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | Medium | **Resolved** | §6.5 now gives A1/A3 their own mutation control. Line 605 opens "For **both** rows the assertion is therefore **two conjuncts, both required**"; conjunct 2 (`PROPERTIES:612-617`) is "the seam's `SeamOps.verifyGate` is asserted `=== null`, directly and per seam", with the reason stated as the one I filed — with `permittedActions: []` the driver never reaches step 6, so a shipped passing stub is behaviourally indistinguishable and only a structural oracle catches it. Lines 619-623 state the two mutation directions explicitly and warn against transposing them ("at A2/A4/A5 the mutation is to **replace** … at A1/A3 it is to **install** that same stub where the shipped seam declares `null`"), which is exactly what `PLAN:869`'s T-03-6 row and `PLAN:258`'s A-07 row require; both PLAN lines resolve and carry the four block names §6.5's Home cell lists. §3's O-6 (`PROPERTIES:343-352`) was updated in the same direction and no longer contradicts §6.5. The "Two conjuncts, both required" opener is scoped to A2/A4/A5 at line 561. |
| F-02 | Low | **Resolved** | All three §6.5 citations re-ground and now quote text that exists at the cited lines. `TSPEC:432-433` — "(A1, A3) supplies `permittedActions: []` … `apply` never reached — §5.1 gate refuses first" ✓. `TSPEC:655` — A1's row, "**`null`** — A1 declares no post-action gate (§5.4's '—' row) … Deliberately **not** `async () => ({ passed: true })`" ✓. `TSPEC:657` — A3's row, "**`null`** — same shape as A1: `permittedActions: []`, step 6 unreachable, `resolved` never reached" ✓. The new `TSPEC:434-439` citation at line 614 also resolves (`:434` "those two seams also supply **`verifyGate: null`**", `:438-439` the driver invariant). `PLAN:274` still resolves exactly. |
| F-03 | Low | **Resolved** | §2.1's closing clause (`PROPERTIES:196-201`) now reads "owned by task `A-01`" and cites both PLAN sites. Verified: `PLAN:308` is the manifest row `A-01 | pdlc/workflows/__tests__/advisoryPreflight.test.js, pdlc/workflows/__tests__/fixtures/scanFixtures.js`, and `PLAN:252` is A-01's §3 task row carrying the same two files. The "no PLAN ownership row … not absorbed" sentence is gone from the document. |
| F-04 | Low | **Resolved** | §2.1 (`PROPERTIES:179-187`) now cites the primary source first: `pdlc/workflows/package.json:18-22` is exactly `"testPathIgnorePatterns": [ "/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/" ]` (lines 18/19/20/21/22 — the transcription is byte-accurate). The deleted `A-00` pointer is gone, `PLAN:138-141` is retained as the secondary with the reason it matters (`--testPathIgnorePatterns` replaces rather than extends the configured list). |
| F-05 | Low | **Resolved, and beyond what I asked** | §13.1 item 6 is now a closure record citing `TSPEC:1265-1271`, which I re-read: those lines carry the `/\.enabled\b/` matcher, the two-module file set with the `dist/*.bundle.js` exclusion, and "it must return **exactly three** matches" over the same enumerated three (`:1273-1275`). Items 1, 3 and 4 were converted in the same pass and each cites correctly — item 1 → `TSPEC:655`/`:657`/`:416`/`:434`, `PLAN:1024`/`:869`; item 3 → `PLAN:779`, which does state the closure as `{"prohibited-action","revert-on-test-touch","out-of-envelope"} ∪ {null}` and explicitly not `ADVISORY_REFUSAL_REASONS`, and `PLAN:257` (A-06) carries the same three-member set; item 4 → `TSPEC:424`/`:428`/`:489`, all three quoted verbatim. §13.1's preamble is correspondingly rewritten to "None is still open", and the header note records that no `ERRATUM:` line is emitted from this document — which matches: I found none to emit either. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
