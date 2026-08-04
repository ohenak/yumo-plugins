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

One Low, and it is a wording residue inside the section this round rewrote — no property, oracle,
level or count is contested. I scanned only the seven changed regions; the header's arithmetic claim
("183 property rows, and §1's and §12.3's 195 / 148 / 40 / 7 / 0 stand unrecomputed") is borne out by
the diff, which touches no property row and no count line.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **§6.5 still calls the A1/A3 form "stronger" in one place after the revision renamed it "different" everywhere else, and the new preamble's parenthetical no longer distinguishes the two families.** The revision deliberately stopped describing A1/A3 as a *stronger* form — line 593 now reads "**A1 and A3 take a different form, and for the same reason**", which is the accurate description now that both families carry exactly two conjuncts. But conjunct 1's parenthetical at `PROPERTIES:565-566` was not updated with it: it still reads "(at the three seams that can apply an action — A2, A4, A5; A1 and A3 take **the stronger form** stated below)". Related, and in the text this round added: the opener's parenthetical at `PROPERTIES:562-563` says A1 and A3 "take the **two-conjunct** form stated below", which was a distinguishing description when A2/A4/A5 had two conjuncts and A1/A3 had one, and is no longer — both are two-conjunct forms now, so the phrase carries no information and a fast reader can take it as saying the two families assert the same thing. The one real distinction is the mutation direction, which lines 619-623 state precisely. Nothing is wrong on the substance and no test author is misled about *what* to assert, which is why this is Low. **Fix:** at `:566` replace "the stronger form" with "the A1/A3 form"; at `:562-563` replace "take the two-conjunct form stated below" with "take the A1/A3 form stated below, whose conjunct 2 runs the mutation in the opposite direction". | §6.5, PROP-GATE-01 … PROP-GATE-05 |

## Questions

Q-09 was answered in the document itself (`PROPERTIES:628-640`), and the answer is one I accept: the
invariant is a *driver* property rather than a `SeamOps` one, no shipped seam constructs the
combination the hypothetical case would need, and conjunct 2 plus PROP-LIFE-*'s step ordering cover
the failure mode that matters today — with an explicit trigger recorded for promoting it if a sixth
seam ever arrives with a permitted action and no gate. I close it. Q-08 stays carried and still
blocks nothing.

| ID | Question |
|----|---------|
| Q-08 (carried) | PROP-DIS-06 counts `/\.enabled\b/` over both modules and expects three, while TSPEC §3.2's C-3 row says `readAdvisoryConfigSafely` is "called once in each `main()`". If the queue's run report is ever expected to carry the C-2 substitution notice, its emit gate is a fourth read and the expected total becomes four. Is the queue's silence on the substitution notice a deliberate D-5 consequence, or the gap that produces the "legitimate fourth read" §10.1 tells Phase I how to handle? Now that TSPEC §11.1 pins the same count at `TSPEC:1271`, an answer either way costs two documents an edit rather than one — worth settling before Phase I rather than after. |

## Positive Observations

- **The Medium was closed by adding an oracle, not by softening the claim.** The cheap way to make
  v4 F-01 go away was to delete the "must fail" language for A1/A3 and leave the behavioural
  conjunct alone. Instead §6.5 added the structural conjunct that actually discharges it and stated
  *why* it is the only one available at those two seams — "with `permittedActions: []` the driver
  never reaches step 6 (`TSPEC:434-439`), so a build that shipped `verifyGate: async () => ({ passed:
  true })` at A1 or A3 would be behaviourally indistinguishable from the correct build and **no**
  behavioural oracle could catch it". That is the reasoning a test author needs to not silently
  weaken the case later.
- **The transposition risk is named before anyone can hit it.** Lines 619-623 do not just state the
  two mutation directions; they say out loud that this is "the one thing an implementer must not
  transpose" and cite the two PLAN lines that agree. A mutation control that reads backwards at two
  of five seams is precisely the defect that would pass review and fail in the RED batch, and the
  document now spends three lines making it hard to get wrong.
- **Four errata were closed as records rather than deleted.** §13.1 items 1, 3, 4 and 6 each state
  the original defect, the resolution, and the upstream line that carries it. I re-checked all four
  and every citation resolves — including `PLAN:779`'s three-member closure and `TSPEC:1265-1271`'s
  matcher and count. The section now reads as a settled ledger instead of a to-do list, which is
  what makes "no `ERRATUM:` line is emitted from this document" a checkable claim rather than an
  assertion.
- **The primary source is now cited before the derived one.** §2.1's jest-exclusion citation leads
  with `pdlc/workflows/package.json:18-22` and keeps `PLAN:138-141` as the secondary *with the
  reason it still matters* — the wave gate's `--testPathIgnorePatterns` replaces rather than extends
  the configured list. That is the right ordering for a citation that has already gone stale once
  under a PLAN revision, and it generalises.
- **Nothing drifted while the text moved.** Four commits, seven regions, and the property inventory
  is untouched: no row added, removed or re-levelled, and §12.3's 148 / 40 / 7 / 0 split is
  byte-identical. The A-34 cross-reference repoint (`§13 item 4` → `§13.2`'s row and `§13.3` risk 1)
  is a consequence of item 4 becoming a closure record, and both targets exist.

## Recommendation

## Verdict
