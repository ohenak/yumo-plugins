# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** Delta re-review — testing lens. Verified each v1 finding is resolved and scanned only the changed sections for new issues.

## Delta scope

Reviewed at HEAD `67aceb2`. The document I reviewed in v1 was `6703b20`; the delta is
`git diff 6703b20 67aceb2 -- docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md` — ten commits,
touching the grounding pin, the shared Context, the register's DEC-ADV-01 reversibility cell,
DEC-ADV-01/03/04/05/06/07/08/10, the "Decisions deliberately NOT taken here" closing paragraphs, and
standing obligations 3–5. Unchanged sections (DEC-ADV-02, DEC-ADV-09, the Options Considered table,
the Costs paragraph) are not re-litigated here.

Every citation *newly introduced* by the delta was re-read at HEAD rather than trusted:

| New claim | Verified how | Result |
|---|---|---|
| Grounding pin's re-confirmation commit `4db9b4a`, `22b310e` an ancestor of it | `git cat-file -t`, `git merge-base --is-ancestor` (both directions) | exact; `4db9b4a` is also an ancestor of HEAD |
| FSPEC §4.1 preamble `FSPEC:232-237` — "steps 5 and 7 complete **before** that durable git operation", both seams named | `sed -n '230,240p'` | exact, verbatim |
| A2-6 at `FSPEC:454`; A5-8 at `FSPEC:635` ("the produced-change check and the record write both complete **before** the push"); R-2 at `FSPEC:690` ("At A5 the write completes before the push") | `sed -n` at each | all three exact |
| C-2 at `FSPEC:145` — report-only-when-enabled, naming `advisory.enabled` and §12 D-5 / §10.3 S-4 | `sed -n '143,147p'` | exact, verbatim |
| `CLI_DEV_EXPORTS` is **ten** names at `build:243-254` | read the literal | exact — ten entries, `isComplete` … `defaultListFiles` |
| `dodVerifyLoop` at `dev:6273`; the `CODE_REVIEW-{feature}-v{N}` filename in its log at `dev:6297` | `grep -n`, `sed -n` | exact (the `_log(` call opens at `:6297`, the template at `:6298`) |
| `devModule` precedes `queueModule` in **both** `contents` arrays (`build:281`, `build:288`) | read both lines | exact — the detector's ordering conjunct is falsifiable as written |
| TSPEC §11.3 is the section holding "deliberate C-2 deviation" (v1 cited only the line) | heading scan before `TSPEC:1238` | exact — `### 11.3 Disabled-mode edge cases` at `:1230`; the citation correction is right |
| `MODEL_DEFAULT = "opus"` at `dev:1578` (basis for the AC-1.4 unreachability paragraph) | `sed -n` | exact |
| `MERGE_GUARD_DEFAULTS` frozen at `dev:47-52`; `guardVerdict` exported at `dev:731`; `commitPaths` `dev:6905` / `gitWithLockRetry` `dev:6862` still un-exported | `sed -n`, `grep -n` | exact — the one live TSPEC erratum is still real |
| `AWAIT_SCAN_SOURCES` at `bundleTest:997`; `BUNDLES` at `:23`; the `realMain` hit at `:446` is a `stripModuleSyntax` unit case | read all three lines | exact — the "no bundle is ever loaded or scanned" premise still holds at HEAD |

## Prior findings — disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
