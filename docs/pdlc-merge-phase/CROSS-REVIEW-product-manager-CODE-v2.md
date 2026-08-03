# Cross-Review: product-manager — Final Codebase Review (round 2)

**Reviewer:** product-manager
**Document reviewed:** the CR remediation at HEAD `69e3d9d`, branch `feat-pdlc-merge-phase`
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review of `git show 69e3d9d` against my round-1 codebase review only — whether the blocking finding (FSPEC §8.2's ahead-of-remote note firing on three paths where its sentence is false) is genuinely closed on **all three**, whether the advisory note-drop fix is sound, and whether anything new broke. Verified by reading the diff, re-running my round-1 reproduction against the patched module, and running the whole suite. Other reviewers' items in the same commit (row-completeness count, escalation anchors) are outside my lens except as regression surface.

## Disposition

| ID | Round-1 severity | Disposition | Evidence at `69e3d9d` |
|----|------------------|-------------|------------------------|
| 1 | **blocking** | **Resolved on all three paths, and the note still fires where it is true** | `orchestrate-dev.js:1442`–`:1455` now gates the note on `tree.ok && defaultBranch && !(rec && rec.detail)`, with each conjunct commented to the path it closes. I re-ran my round-1 reproduction against the patched module — the same four fixtures, same doubles: **(A) M3 failed** ⇒ `merged`, row 18, tree escalation present, **zero** `Local …` notes; **(B) §2.5 non-overwrite** ⇒ `merged`, the `nonOverwrite` note present, **zero** `Local …` notes, so the two contradictory lines can no longer appear together; **(C) row 3 with `O4` unknown** ⇒ `merged`, row 3, `default branch name unavailable` escalation, **no `Local null …`**; **(D) clean happy path** ⇒ the note emitted verbatim. (D) is the conjunct that matters most to me: the fix narrows the note to the case FSPEC §8.2 describes rather than deleting an operator-facing promise, so the one place an operator learns where their queue-row commit lives is intact and now always true. `mergeStatus` stays `merged` and the escalation sets are unchanged on every path — no downgrade was introduced by the gate. |
| — | test coverage of the fix | **Red-first, and stronger than the finding asked** | Each of the three paths has its own negative assertion: `mergePhase.test.js`'s row-22 case adds `expect(outcome.notes).not.toContain(MERGE_NOTES.aheadOfRemote("main", FEATURE))` **plus** `expect(outcome.notes.some((n) => n.startsWith("Local "))).toBe(false)` — the second catches a differently-parameterised variant that a `not.toContain` alone would miss — and a new `aheadOfRemote gating (CR product-manager finding 1)` describe block covers the non-overwrite case (asserting the `nonOverwrite` note *is* present alongside) and the row-3/`O4`-unknown case ("no note interpolates null"). A regression that re-widens the gate reds three cases, not one. |
| 3 | advisory | **Resolved** | `notes` is hoisted above the `try` (`:1311`–`:1315`) and the catch returns that same array (`:1489`) rather than a fresh `[]`, with both sites commented to the finding. Anything accumulated before a throw — the §10.3 malformed-section note, M2's branch-delete note — now survives onto the `row: "internal"` outcome, which is the one path where an operator most needs whatever context exists. |
| 2, 4, 5 | advisory | **Correctly routed, not silently dropped** | The guard-22/23 ordering erratum, the string row-id domain and US-05's sanctioned non-overwrite hole are recorded in `docs/pdlc-merge-phase/CR-ERRATA.md` as spec errata / LEARNINGS material. All three were documentation or harvest items by construction — none asked for a code change — so routing them to a tracked file rather than editing approved specs mid-implementation is the right disposition. |
| — | regression check | **Nothing new broke** | Whole suite at `69e3d9d`: **61 of 62 suites green, 2 941 tests passing**, 70 skipped. The single red is `documentOracles` **AT-22 `coveredViolations(LIVE_ROOT)`**, confirmed environmental and unchanged from round 1 — `git status --porcelain --ignored` still shows the ignored `.tokensave/` directory, which is exactly the untracked-file false positive CLAUDE.md and PLAN K-6 both document and which V1's step 4 tells the operator to check before treating it as a defect. It is not this diff: the same test failed identically before the remediation, and the diff touches no oracle, no packaging surface and no tracked document. The three regenerated `dist/` artifacts are in the same commit as the source change, per PLAN §9's rebuild rule. |

## Recommendation

**Approved**

The blocking finding is closed at the level I wanted — the sentence is now emitted exactly when it is true, not suppressed wholesale — each false-firing path carries its own red-first assertion, and the advisory note-drop is fixed at the structural level rather than patched at one call site. The suite is in the same state it was before the remediation apart from the new passing cases.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 0}
