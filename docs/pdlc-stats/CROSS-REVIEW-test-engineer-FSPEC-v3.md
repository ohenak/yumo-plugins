# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v2.md` (0 High, 4 Medium, 2 Low) — *Approved with minor changes*
**Delta reviewed:** `git diff 18b65a517..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` (107 insertions, 40 deletions), commits `826d8d6ff` … `c3ee2c0ef`

## Prior Findings Disposition

| Prior | Sev | Status | Evidence in revision |
|---|---|---|---|
| F-01 BR-13's newly-named collation had no multi-halt fixture; §6.11 credited AT-14, which asserts nothing about order | Medium | **Resolved** | AT-14b added, and it takes the exact shape the finding asked for: the real `docs/completed/pdlc-headless-engine/` directory, four post-mortems, the **sequence** `D, F, I, T` asserted as a literal, with the reason stated ("an implementation ordering by directory-listing or insertion order passes any set-shaped oracle"). Verified on disk: that directory carries exactly `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md`, each with a line-leading `RESOLVED: yes` (`POSTMORTEM-D…:14`, `-F…:14`, `-I…:93`, `-T…:14`). The second leg (`P`, `PR` → literal `P, PR`) pins the two-character case BR-13 names as its own justification. `BR-13 → AT-14, AT-14b` in §6.11. |
| F-02 AT-27's root oracle contradicted EC-09's absent/unreadable distinction | Medium | **Resolved** | The "same root message" phrasing is gone. AT-27 now asserts each message names the root, each carries the clause matching its own condition, and the two are explicitly **not** byte-identical — the reading EC-09 requires, stated so a test author cannot pick the other one. |
| F-03 AT-13's *Given* named fixture files absent from the real directory, inviting a test author to pollute the tree the real-path ATs measure | Medium | **Resolved** | *Given* now reads "`docs/completed/pdlc-wave-resume/` **copied into a temporary root**", with the added files "added to the copy and never to the repository", and names AT-09/AT-10/AT-18 as the tests that copy protects. The `resolved` literal is still stated as carried over from real bytes, so the falsifying-pair design survives intact. |
| F-04 BR-20 promised a JSON document on the not-found path while no rule gave that document a shape; AT-23's oracle was absence-shaped | Medium | **Resolved for the not-found path** | BR-30 now fixes the error shape: top-level keys exactly `schemaVersion`, `error`, `feature`; `error` exactly `reason` and `message`; `reason` one of `not_found` / `no_docs_root`; `schemaVersion` hoisted as BR-21 hoists it, governed by BR-24's increment rule. AT-23 converts from "a caller can distinguish" to a three-key set-equality plus `error.reason` exactly `not_found`. The widening also opened a new hole on a *third* exit-1 path — F-01 below. |
| F-05 AT-25's five-row conjunct asserted "unchanged" against no baseline | Medium | **Resolved** | *Given* now names the five indices (`REQ` 3, `FSPEC` 2, `PLAN` 5, `PROPERTIES` 1, `DECISIONS` 4) and *Then* transcribes them back as `3`, `2`, `5`, `1`, `4`, with the reason recorded — the collision-poisoning risk can now fail the test. |
| F-06 §6.11 credited EC-14 to AT-13, which carries no duplicated-marker case | Low | **Resolved** | Row reads `EC-14 | AT-14`. |
| F-11 (v1) `lstat` decision | Low | **Still resolved, and hardened** | AT-15 now states that the symbolic-link leg is the only skippable leg and that the enumeration and removal-probe legs run with a regular file in that member's place — the removal probe is the sole set-equality oracle for BR-14 and a skipped platform must not take it along. |

All six prior findings resolved, and none of the fixes is a wording patch: each landed as a rule or an oracle a test can fail.

## Claim verification against HEAD

| Claim in the revision | Verdict | Evidence |
|---|---|---|
| AT-14b: `docs/completed/pdlc-headless-engine/` carries four post-mortems over four distinct phases | **Holds** | `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md`; no other `POSTMORTEM-*` in the directory |
| AT-14b: lexicographic ascending yields `D, F, I, T` and `P, PR` | **Holds** | Both sequences are correct under BR-13's stated collation; the `P` / `PR` pair is the prefix case that separates codepoint order from insertion order |
| AT-24: `doctor`'s flag row is `["plugin-root","cwd","allow-api-key-billing","dev"]` | **Holds, quoted exactly** | `pdlc/engine/bin/cli.mjs:184` — the row is byte-for-byte what AT-24 transcribes, so the "copied from a neighbour" failure mode it defends against is a real one, not a hypothetical |
| BR-01: `--dev` / `--plugin-root` are accepted elsewhere and refused by `stats` | **Holds** | `FLAGS_BY_COMMAND` (`cli.mjs:168-185`) carries `dev` on `dev`, `queue`, `doctor` and `decide`, and `plugin-root` on all four; `stats` has no row, and `validateFlags` (`cli.mjs:199`) refuses every flag absent from the row |
| AT-24: `--dry-run` is in no command's list | **Partly wrong, harmlessly** | `dry-run` is in `dev` and `queue` (`cli.mjs:169-171`), not in `doctor` — which is the row AT-24's argument is about, so the reasoning survives; the phrase "in no command's list" is the inaccuracy (F-04 below) |
| §2.1: REQ-STATS-09 now also traces to AT-27's root leg per D-9 | **Holds structurally**, but the leg omits one conjunct — F-02 below |
