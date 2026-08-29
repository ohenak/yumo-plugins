# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.7, `6fd604320`)
**Date:** 2026-08-28
**Iteration:** 7
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v6.md`. Diff base `3feee9461`
(v1.6, the version v6 reviewed) → HEAD (v1.7, four commits: `3bdf541b6` Baseline v1.1,
`d90a3a297` header/disposition, `84d1a2fe5` AC-01, `479716725` O-1/O-6). The round also edits the
cited substrate `docs/_constraints/pdlc-decision-corpus-baseline.md` to **v1.1**, whose two new
facts (`M-1d`, `M-2e`) are now the literal expected value of AC-01; both were re-derived from the
corpus in full rather than read. Unchanged REQ sections approved in earlier rounds are not
re-litigated.

## Round-6 finding disposition

| v6 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-26 | Medium | **Resolved, and resolved in the shape asked for** | The gap was that AC-01 claimed "equality against those ids" while the Baseline recorded only cardinalities, so the expected set had no referent an implementer could transcribe. Baseline v1.1 adds `M-1d` (the 41 project-level ids, grouped by file, in `M-1b` path order) and `M-2e` (the 100 feature-level ids per directory, under the directory-glob reading), and AC-01:189 now cites those two ids as the expected value, "transcribed, not re-derived from a predicate here". This is the pure-measurement fix, not a new rule — exactly the character of everything else in the file. |
| F-27 | Medium | **Resolved** | O-1:336–339 now states outright that **membership reads the directory glob**, names the two-valued case it settles (`M-2c`'s 14 vs 22), and grounds the choice in the floor C-5 already took from `M-6b`. Sizing and membership now read the same extent; the "selects between two measured numbers, minting no rule" framing is correct and keeps the altitude decision intact. |
| F-28 | Medium | **Resolved, and widened past what I asked** | O-6:360–365 names all three of REQ-DECLEDGER-04's construction-only legs — every-source-unavailable, one-of-several-fails-while-the-rest-render, and the empty-file boundary taking the ordinary path rather than the partial one — and cites `M-4e` as the reason the last is separable only by construction. It additionally puts the frozen corpus copy AC-01 asserts against under the same obligation, which I had not asked for and which is the right home for it. The empty-vs-unreadable absence-only oracle risk is closed. |
| F-29 | Low | **Resolved** | The Baseline's provenance note now says plainly that `8c673a09f` *is* the post-mortem commit, and that the measurement tree differed from it only by the then-untracked Baseline itself and the in-progress REQ v1.6, neither a `DECISIONS-*.md`. The added sentence on why a tree-walking measurement is perturbed by untracked files is worth keeping — it is the exact failure mode a re-verifier hits. |

SE's round-6 High (F-01, the same defect as my F-26) is resolved by the same edit; SE F-02
(id-only equality invariant under `M-3c`) by AC-01's widening to the rendered line; SE F-03
(pinned corpus vs live corpus that grows on this branch) by the frozen-fixture clause at
AC-01:190–192 plus O-6; SE F-04 by the Baseline's `Cited by` list, which now carries
REQ-DECLEDGER-04, O-5 and O-6 and states that the list is the propagation path for a version bump.

## Re-derivation of the new expected value (`M-1d`, `M-2e`)

These two facts are the only thing standing between AC-01 and an unfalsifiable test, so I derived
them from the tree rather than reading them: `git ls-files` filtered to `(^|/)DECISIONS-[^/]*\.md$`,
then every markdown heading whose content — after the marker and any leading section number —
opens with `DEC-{NAMESPACE}-{NUMBER}`, `NUMBER` decimal, fenced blocks skipped. Baseline §1's
stated reading, applied blind, then diffed against the file.

| Fact | Claim | Re-derived | |
|---|---|---|---|
| `M-1d` | 41 ids, grouped by file in `M-1b` path order | Identical id-for-id and file-for-file: `(none)`; `DEC-ANCHOR-01`; `DEC-ERRROUTE-01…04`; `DEC-TERM-01,02`; `DEC-MODEL-01,02`; `DEC-DIST-01…07`; `DEC-CONV-01`, `DEC-DW-01`; `DEC-SEV-01,02,03`, `DEC-ERR-01`, `DEC-BAR-01,02`, `DEC-ERR-02,03`, `DEC-DOC-01`, `DEC-FRZ-01`, `DEC-ERR-04`, `DEC-SEV-04`; `DEC-SEAM-01`; `DEC-LAYER-01`; `DEC-ORACLE-01…06`; `DEC-WAVE-01,02,03`. Sum 41, distinct 41 | ✓ |
| `M-1d` note | Two files hold more than one namespace — `review-convergence` two, `review-severity-bars` five, interleaved | Confirmed, and the interleaving is real: the severity-bars order is SEV, SEV, SEV, ERR, BAR, BAR, ERR, ERR, DOC, FRZ, ERR, SEV — not groupable. The claim that the list is not reconstructible from `M-1b`'s counts holds | ✓ |
| `M-2e` | 12 directories: 22, 11, 10, 10, 10, 8, 8, 7, 6, 4, 4, 0; sum 100 | Identical, directory for directory, including the elided runs: `DEC-ENG-01…14` + `DEC-HE-01…08` = 22; `DEC-ADV-01…11`; `DEC-EDIST-01…10`; `DEC-LI-01…10`; `DEC-LOOPECON-01…10`; `DEC-CONS-01…08`; `DEC-WVR-01…08`; `DEC-LOOP-01…07`; `DEC-ODW-01…06`; `DEC-A6-01…04`; `DEC-BUD-01…04`; `pdlc-plugin-retirement` 0 | ✓ |
| `M-2e` note | Every namespace is held by exactly one directory | Confirmed across all 100; no namespace spans two directories, consistent with `M-5a` from the other side | ✓ |

No discrepancy in either enumeration. The two elision forms (`…` runs and `(none)`) are
unambiguous because each expands to a contiguous decimal range that the sums independently pin —
a transcriber who expands `DEC-ENG-01…14` wrongly gets a directory total that fails against 22.
That is the property F-26 was asking for: the expected value is now checkable by transcription,
and a deleted-and-replaced id no longer survives a count-preserving swap.

Citations checked this round: `REQ-LOOPECON-01b` (AC-01:196) exists and is a shipped, tested
contract — `docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md:146`, covered by
`PROP-LOOPECON-03` and `loopEconomicsAnchorFreshness.test.js`; `M-4e` and `M-3c` say what O-6 and
AC-01 report them saying (Baseline `:86`, `:75`, the latter with the two openings quoted verbatim
at `:237` and `:363`).

## Findings

No High findings. The clause that blocked rounds 1–5, and the enumeration gap that blocked
round 6, are both closed, and nothing in this round's edit broke a previously approved section.
Three Mediums follow — all created by AC-01's widening, all additive, none gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-30 | Medium | Local | **AC-01 widened equality to three fields but pinned an expected value for only one of them.** The check is now "equality of the rendered line set — not containment, and not equality over ids alone: the runs agree only where each line's id, statement and citation all agree" (`:186–187`), and the expected value is `M-1d`/`M-2e` (`:188–190`). But `M-1d` and `M-2e` enumerate **ids**. Nothing in the Baseline enumerates the 63 expected *statements* or *citations*; only `M-3c`'s one line has a verbatim (`### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file`, `:363`), which is precisely the discriminating case SE F-02 raised. So a te-author writing this test has a transcribable expected for one field and none for the other two, and the cheapest way to fill them is to run the renderer over the fixture and freeze its output — an implementation echo, where the expectation derives from the code under test and the test can never fail for a wrong statement. The fix is one clause, not a table: say that the statement and citation expectations are transcribed **from the frozen fixture's own heading text and record location** (data, not code), with `M-3c`'s verbatim as the pinned case that discriminates the two openings. That keeps the transcription property F-26 won for ids and extends it to the fields the widening added. | §5 REQ-DECLEDGER-01:186–190 |
| F-31 | Medium | Local | **"`M-2e` per feature directory" leaves the expected cardinality two-valued, and one of the two readings collides with C-5.** `M-2e` enumerates **100** ids across twelve directories, but G-1's in-scope set is "the project's closed decisions, plus the feature whose document is under review" (`:67–68`) — that is 41 plus **one** directory, at most 41 + 22 = 63, which is exactly the floor `M-6b` gives and `maxEntries` 70 clears. Read literally, "the expected value is the Baseline's enumeration — `M-1d` project-level, `M-2e` per feature directory" admits a 141-line expected set, which exceeds `maxEntries` and would put AC-01 in direct conflict with REQ-DECLEDGER-07's over-budget omission — the same criterion AC-01 defers to two lines later. The intended reading is inferable from G-1 and from C-5's rationale, so this is not a correctness hazard; it is a fixture-sizing ambiguity a test author has to resolve by cross-reading three sections. Naming the fixture's own feature directory ("`M-2e`'s entry for the fixture's feature directory") closes it in six words. | §5 REQ-DECLEDGER-01:189; §2 G-1:67; §4 C-5 |
| F-32 | Medium | Local | **The frozen fixture makes AC-01's own recompute-at-dispatch clause unfalsifiable, and no obligation records the gap.** AC-01 closes by asserting that the index "reflects records as they exist at dispatch-construction time, never a snapshot carried forward within the round window" (`:194–197`), mirroring `REQ-LOOPECON-01b`. But the same criterion now asserts against a **frozen** corpus copy that by construction never changes (`:190–192`). Over a corpus that cannot move, an implementation that builds the index once per round window and reuses it passes every leg of AC-01 — the clause has no falsifying test. The shipped precedent shows the shape that does falsify it: `loopEconomicsAnchorFreshness.test.js` moves the underlying value between two dispatch constructions and asserts the second quote moved. This is the same class as O-5 and O-6 — a leg with no HEAD instance, coverable only by construction — and this REQ's established practice is to record that class rather than leave it to be discovered. One more clause in O-6 ("and to a fixture mutated between two dispatch constructions inside one round window, for the recompute leg") is the whole fix. | §5 REQ-DECLEDGER-01:190–197; §7 O-6 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | On F-30: is the intended expected for statement and citation a transcription from the frozen fixture's own heading text and record location? If so, one clause in AC-01 says it and forecloses the render-and-freeze shortcut. If instead only the id field is meant to be asserted with full equality, the "id, statement and citation all agree" sentence overstates what the criterion can check. |
| Q-06 | On F-32: does the frozen fixture stay byte-frozen for the whole of REQ-DECLEDGER-01, or is a second, mutated copy expected for the recompute leg? Either answer is fine; only the silence is a problem, because the freeze is what makes the leg unobservable. |
