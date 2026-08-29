# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.6)
**Date:** 2026-08-28
**Iteration:** 6
**Scope:** delta re-review of `20a551c7f..HEAD` on the REQ (v1.5 `a0cd343bc`, v1.6 `3feee9461`),
plus the new cited substrate `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.0, which this
delta makes load-bearing for §5. Findings in `CROSS-REVIEW-software-engineer-REQ-v5.md` re-checked
against HEAD. Unchanged sections already approved are not re-litigated.

## Prior-Round Disposition

Both round-5 findings are resolved, and resolved by relocation rather than by narrowing — the
post-mortem's Recommendation 1 form (a) applied as written.

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The second `DECISIONS-*.md` in a feature directory is no longer an undecided reading. `M-2c` names it outright — `docs/completed/pdlc-headless-engine/` holds `DECISIONS-pdlc-headless-engine.md` (14) and `DECISIONS-headless-engine-obligations.md` (8, `## DEC-HE-01`…`08` at `:11,37,62,87,108,130,155,184`) — states that the eight `DEC-HE-*` ids exist nowhere else, and quantifies the divergence ("the two readings differ by 8, and only on this feature"). The floor was then re-taken under the glob reading: `M-6b` = 41 + 22 = 63, and `maxEntries` moved 60 → 70 (`REQ:168`, A-1 at `:345`). I replayed both independently against HEAD: the `pdlc-headless-engine` directory yields 22 distinct ids (14 + 8), and 41 + 22 = 63. `M-6c`'s "clears M-6b by 7" is arithmetically exact. |
| F-02 | Low | **Resolved** | The cross-file leg's absence of a HEAD instance is now recorded as measurement rather than left implicit: `M-5a` states zero ids are held as records in two files, `M-5b` draws the consequence that any precedence rule is inert at this commit, and the REQ carries it forward as **O-5**, a synthetic-fixture obligation owned by te-author (`REQ:348-354`). This is the disposition I asked for — it is a coverage gap, not a REQ defect. I re-swept all 25 files: **zero** ids appear as heading-carried records in more than one file. `M-5a` holds. |

## Baseline Replay

The delta moves the corpus facts out of §2 G-1 and into a new project-level constraints file. That
file is now the expected value behind §5, so I re-derived **every** `M-*` fact from the working
tree rather than reading them. All of them reproduce exactly:

| Fact | Claim | Replayed at HEAD |
|---|---|---|
| corpus extent | 25 tracked `DECISIONS-*.md`; 12 project-level, 13 across 12 feature dirs | **matches** (a basename glob; note the 8 `CROSS-REVIEW-*-DECISIONS-v*.md` files are *not* in it, correctly) |
| `M-1a` | 41 records, 41 distinct ids under `docs/_decisions/` | **41 / 41** |
| `M-1b` | per-file breakdown 0,1,4,2,2,7,2,12,1,1,6,3 in path order, sum 41 | **matches file-for-file** |
| `M-2b` | per-directory distinct ids, `pdlc-headless-engine` 22 … `pdlc-plugin-retirement` 0 | **matches, including the ordering** |
| `M-2c` / `M-2d` | 14 + 8 = 22; largest single file 14, largest directory 22 | **matches** |
| `M-3a` | `DECISIONS-pdlc-engineering-loop.md`: 13 records over 7 distinct ids | **13 / 7** |
| `M-3c` | `:237` opens the question, `:363` opens the outcome | **verbatim** — `### DEC-LOOP-01 — where the session's state lives` vs `### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file` |
| `M-4a` | `DECISIONS-advisory-wave-gate-questions.md` contributes 0; only `DEC-` token is prose at `:14` | **matches** — single hit, `:14`, the range shorthand |
| `M-4b` | `### DEC-01`…`### DEC-10` at `:37,45,53,61,76,84,92,100,108,116`, no namespace | **all ten line numbers exact** |
| `M-4d` | 4 records (`:261,315,362,420`) + 4 question headings (`:208,217,231,251`) + 4 back-references (`:443,493,509,526`) | **all twelve line numbers exact** |
| `M-5a` | zero cross-file duplicate ids | **zero** |
| `M-6b` / `M-6c` | 63; 70 clears it by 7 | **63; 70 − 63 = 7** |

The `Verified at` pin (`8c673a09f`) is an ancestor of HEAD, and no `DECISIONS-*.md` changed between
that commit and HEAD — the only files touched since are the Baseline, the post-mortem and the REQ.
The pin is honest at HEAD today. F-03 below is about whether it stays that way.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
