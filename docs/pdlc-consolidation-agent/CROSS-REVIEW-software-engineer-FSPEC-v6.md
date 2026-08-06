# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v6.1)
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `7ad57c9` (the last FSPEC commit my v5 reviewed); diff
`7ad57c9..HEAD` — 76 insertions, 14 deletions across 6 FSPEC commits. Only the changed sections were
re-read for new issues.

## Prior findings — disposition

All six v5 findings and all three v5 questions were re-checked against the revision and, where they
made a claim about HEAD, against the code. **All nine are closed as filed.** As in the previous four
rounds, the repairs create new checkable defects in the sections they rewrote; those are filed below
on their own merits, not as reopenings.

| v5 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — kind precedence left `target` undetermined on a same-kind merge over colliding subjects, because kind 3's `target` is the subject | **Resolved as filed, and with the tie-break I asked for.** §8.2 gains a block-quoted rule (`:1264-1268`): the merged record's `artifact` is the **lexicographically first** canonical path, `target` follows it wherever precedence returns kind 3. The three notes give the three reasons the rule is spelled — input-purity against "first proposed" (which is a model artifact), the id being unaffected, and BR-35a's file-existence test two passes later. BR-33b carries the rule (`:2421`), O-C8 prices the loss, and **AT-R6b fixture 2 now asserts *which* path survives** — `pdlc/skills/a-b.md`, with the byte reasoning stated. I checked the arithmetic: `-` is 0x2D, `/` is 0x2F, so `pdlc/skills/a-b.md` does sort first. (§8.1's collision table names a third colliding path, `pdlc/skills/a.b.md`, `.` = 0x2E — it sorts between the two and does not disturb the fixture) |
| F-02 (Medium) — AT-R6b's third fixture contradicted itself and the row's lead no longer described it | **Resolved, and over-delivered.** The row is restructured as **five named fixtures**, each stating its §5.2 kinds up front, and the lead sentence is now "five fixtures … named by the §5.2 kinds they merge" rather than "two AC-2.2 promotions". Fixture 3 takes the one-shared-path reading I recommended and says so explicitly — "One subject path, not two: the merge trigger here is key identity, not slug collision, so no tie-break is in play". Fixtures 4 and 5 were added unprompted so the three kind pairs (1,3), (2,3), (1,2) are all covered, and the cell argues *why* sampling one pair is insufficient. This is a completeness-by-enumeration repair, not a wording repair |
| F-03 (Medium) — §8.1's reader-side rule was normative, stated a negative three ways, and had no test | **Resolved as filed, and then some.** §8.1 gains a six-row per-reader table (`:1130-1136`), **AT-F21** is added with five conjuncts on one path (`:2028`), **E-12b** is added as its edge-case row (`:2475`), BR-33a's AT column now splits writer half / reader half, and §15.1's AC-5.1 row cites AT-F21. The positive/negative pairing I asked for is there: conjunct (1) is the "does not halt" negative asserted beside a terminal-status positive, conjunct (3) is the downstream positive. The oracle's *reasoning* about one of the three prohibited behaviours is inverted — filed as F-01 — and the table's own completeness claim has a hole — filed as F-02 |
| F-04 (Low) — `:3585` cited an error string rather than the read | **Resolved, and verified at HEAD.** §6.5 now cites `readHeadBranch` (`orchestrate-dev.js:3520`), its `_git(["rev-parse","--abbrev-ref","HEAD"])` at `:3524`, and the branch guard's call at `:3580`. All three are exact — I re-read the file. `parseAbbrevRef` `:3491-3496` (doc comment `:3491`, body `:3492-3496`), `gitWithLockRetry` `:8617`, `commitPaths` `:8669`, `MERGE_GUARD_DEFAULTS` `:48-53` are all exact too |
| F-05 (Low) — §6.5's closing absolute was falsified by AT-Q7c's own `∅` conjuncts | **Resolved as filed.** `:946-951` now reads "equality **with a domain's permitted set** is asserted on no domain", and the next sentence names AT-Q7c's two `∅` conjuncts as deliberate equalities with the empty set, with the argument for why weakening them to containment would leave the row nothing to catch |
| F-06 (Low) — the "i.e. any pass that promotes anything" gloss widened the Given past §5.4's stages-nothing path | **Resolved as filed.** The gloss is gone; column 5 now reads "a pass that **makes** the §5.4 commit, PR-opening or not", and explicitly excludes the AT-R5 path: "it observes `add` and no `commit`, and the obligation is not asserted on it" |
| Q-01 — is item 10's count asserted equal to the list's cardinality? | **Answered in the document.** AT-F19 now asserts the **literal `3`** and names both drift shapes a presence check admits (a constant, or `4` — every recorded id) |
| Q-02 — which contract owns a record short of `artifact`, §8.3 or §8.5? | **Answered in the document.** Both are rows in the new reader table, with opposite and well-argued arms: §8.3 emits the row anyway (dropping it "would read as `insufficient-evidence` and silently move a verdict"), §8.5 declines to propose ("never a guessed `retirement`") |
| Q-03 — is `symptom` still one line after a merge, and is a two-mode symptom bounded? | **Answered in the document.** §8.2 consequence 1 now states "**One line remains the obligation**", puts the per-kind load on §10.4 item 4's report body instead, and gives the reason (`symptom` is non-keying free text no contract parses). O-C8 restates it. That answer is right — and it is what makes F-03 below visible on the *subject* axis, where no report item plays item 4's part |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
