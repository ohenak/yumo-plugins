# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.8)
**Upstream read:** `REQ-pdlc-headless-engine.md` (C-11 `:284-286`), `FSPEC-pdlc-headless-engine.md` (ladder row 4a `:300`, BR-START-1 `:302-303`, EC-START-10/11 `:406-407`, BR-GUARD-6 `:918-925`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v9.md` (0 High, 2 Medium, 1 Low)
**Diff reviewed:** `71a5b949..HEAD` — TSPEC +151/−29 across four commits (`a9e17ee2`, `d1d42fda`, `f4819dbf`, `ed0e0eec`)
**Date:** 2026-08-11
**Iteration:** 10

**Scope:** delta re-review. Disposition of v9's three findings, then the changed sections only.

## 1. Disposition of prior findings

All three resolved, and each verified against HEAD rather than against the revision's own prose.

| Prior finding | Disposition |
|---|---|
| **F-01 (Medium)** — §3.3's class 3 selected five `skill:` sites at HEAD, not one, and the "cannot resolve ⇒ failure" rule therefore specified a permanently red guard | **Resolved** (`a9e17ee2`). Classes 3 and 4 now require "a string literal or an identifier bound to a module-level constant" (`:535-537`), and a third outcome — **indirect dispatch**, "neither a site nor a failure" (`:543-553`) — absorbs the parameter/local/member-expression forms. Re-measured at HEAD: `grep -n "skill:" orchestrate-dev.js` returns exactly the five the document names — `:5909`, `:5910` (`reviewers[0]`/`[1]`), `:9288` (`authorSkill`), `:9528` (`dispatch.creator`), `:10448` (`"harvest-learnings"`) — so 1 direct + 4 indirect is right. The four uncounted sites that made the guard red are now classified, not exempted. |
| **F-02 (Medium)** — §7.8's two script anchors were off, and §9.3's note wrongly alleged an off-by-one in FSPEC | **Resolved** (`d1d42fda`, `f4819dbf`). Measured at HEAD: `PY_BIN=""` is `:14`, the candidate loop `for cand in python3 python py; do … done` is `:15-20`, the fail-open `[ -z "$PY_BIN" ] && exit 0` is `:21`, and the probe `"$cand" -c "import sys"` is `:16`. §7.8 now cites `:16` for the probe (`:2200`) and `:15-20` / `:21` for the loop and fail-open (`:2229`); §9.3 **withdraws** the note in its own voice — "The off-by-one was this document's, in §7.8" (`:2443-2447`) — rather than quietly deleting it, and the v1.7 changelog line carries the correction inline (`:72-73`) so the superseded `:15` is not left standing in history. Exactly the sweep discipline I asked for last round, applied to the document's own error. |
| **F-03 (Low)** — the census was labelled "at HEAD" while class 1's figure was a post-edit projection | **Resolved.** §3.3 now reads "**Classes 2 and 4's figures are measured at HEAD** … **class 1's 7 is counted after the edit** — only `ADVISORY_RUNG_SKILL` (`orchestrate-dev.js:1797`) exists today" (`:582-586`), and the v1.7 changelog line carries the same qualifier plus a supersession pointer (`:63-65`). Verified: `:1797` is `const ADVISORY_RUNG_SKILL = "se-review";` and no `SKILL_*` constant exists in either module at HEAD. |

## 2. What else changed, and what I re-grounded

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
