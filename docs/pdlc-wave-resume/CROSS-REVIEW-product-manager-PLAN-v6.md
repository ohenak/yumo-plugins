# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.3)
**Date:** 2026-08-23
**Iteration:** 6 (delta re-review of the v1.2 → v1.3 revision)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity

## Overview

This is a delta re-review, not a fresh read. PLAN moved from v1.2 to v1.3 across nine commits
(`f1fc897b`…`5d5f15b4`); its bytes are now
`sha256:ea7bdc57ec1c349ddf9275b4cd5ed2ac822e4f8b38b806836afdd298795bdb99`, no longer the
`3cf0229a…` my v5 reviewed. I re-read my own v5, diffed the PLAN across that range, and scanned only
the changed sections.

**All three of my v5 findings are landed, and landed as specified.** The High — TSPEC §5.5's fifth
mutation missing from PLAN §4.3 — is closed with a fifth row, an owning task that *runs* it, and all
five count claims corrected. The two Lows re-pointing §3.4's `Coverage floor` row and §4.4's RK-2 at
TSPEC RT-7's current text are closed, values and mitigations unchanged exactly as asked.

The revision also lands five test-engineer findings and one question, and volunteers one correction
nobody raised (§1.2's baseline table re-dated as a historical measurement now that the OB-F1 rebase
has landed). I checked those changed sections too, since they are part of this delta. One of them —
the §1.2 re-dating — makes a sentence in an *unchanged* section factually false. That is the single
new finding, and it is Low: it moves no task, no requirement and no oracle.

No acceptance criterion was narrowed, broadened or re-triggered by this revision. Every P0/P1
requirement still has an owning task; no task was added, removed or moved between batches.

## Batches

The revision's changes, each checked against the tree or the upstream text at HEAD rather than
against the routing note that asked for it.

| Change | What v1.3 did | Verdict |
|---|---|---|
| **PM/TE F-01 (High) — §4.3's fifth mutation** | §4.3 heading now reads "five mutations"; a fifth row lands: *Suppress the record write while `explicitPointer` is true (write only on automatic runs)* → oracle *AT-05's write-side conjunct only* → owner **T-07**. A new paragraph explains why the mutation is invisible to the automatic-provenance tests. Five count claims corrected: §4.3 heading, §1.1's trade paragraph, T-07's `Mutation duty (§4.3 rows 1–5…)`, RK-1, §4.5's DoD checkbox | **Closed, faithfully.** TSPEC §5.5 at HEAD enumerates five and its item 5 reads "Suppressing the record write while `explicitPointer` is true (writing only on automatic runs). Killed only by AT-05's write-side conjunct… leaves AT-05, AT-07, AT-15 and AT-18 green… removing resume from exactly the recovery path §2.5 ratifies the write for." PLAN's row and paragraph transcribe that, not a paraphrase of it. The oracle pairing is single-oracle, which is the harder and the correct reading. As I asked: no new task, no batch move, no `Deps` edge change |
| **PM F-02 / TE F-03 — §3.4 `Coverage floor` row** | The erratum clause is gone; the row now cites TSPEC RT-7 as agreed ("closed upstream in TSPEC v1.3"). The value (`T-10`, not `postWaveCommand`) and the V-13 four-key reasoning are verbatim unchanged | **Closed exactly as scoped.** TSPEC RT-7 at HEAD assigns the floor to "the last implementation **task** (PLAN T-10, RK-2)"; TSPEC's own v1.3 revision row records the re-assignment. Nothing open |
| **PM F-03 — §4.4 RK-2** | Both false clauses are gone. The row now states the config-surface reasoning without attributing the old wording to TSPEC, and closes "TSPEC §5.8 / RT-7 assigns the floor the same way… so this is a recorded agreement, not a divergence". The merge-gate risk and mitigation text are unchanged | **Closed exactly as scoped** |
| **TE F-04 — T-10's oracle (i) scoped to `orchestrate-dev.js`** | Oracle (i) changes from "`npm run test:coverage` exits 0" to "c8's per-file branch number for `orchestrate-dev.js` is asserted `>= 85`; the whole-command exit status is **reported, not asserted**", with the same scoping applied to §2.2's batch-4 gate wording and §4.5's DoD line | **Faithful, and it is a re-scoping rather than a weakening.** TSPEC §5.8 at HEAD already says the fourth `c8.include` entry "covers no code this feature touches, but `--per-file` applies the floor to it independently, so **a red there is not a red in this feature's module**", and names the obligation as "runs it explicitly and **reports the measured per-file branch number**". PLAN's new wording is *closer* to TSPEC than the old "exits 0" was, and it keeps a positive assertion on the same path (`>= 85` on this feature's module), so the reported-not-gated exit is not an absence-only oracle |
| **TE F-02 — T-12's coverage rationale** | The "diff noise" rationale is replaced by a measured one: 94 tracked files under `pdlc/workflows/coverage`, 81 under `coverage/tmp/`, which `test:coverage` deletes and rewrites, reddening `PROP-SWEEP-2(a)` during T-10's own batch-4 gate. Action and DoD unchanged | **Faithful and measured.** `git ls-files pdlc/workflows/coverage` → 94; `…/coverage/tmp` → 81. This turns a tidiness argument into a precondition argument, which is the stronger and the true one |
| **TE F-05 — §4.6 retired-ids row** | "the parser sees seven tasks" → "**nine** tasks (seven before v1.2 added T-11 and T-12; re-measured v1.3)" | **Correct.** The task table carries T-01…T-04, T-07, T-08, T-10, T-11, T-12 — nine rows |
| **TE Q-01 — T-11's hit count** | T-11 no longer pins the ten paths as the number to record; the implementer re-measures at promotion time, with the reason stated (the set grows one file per cross-review round) | **Correct, and the supporting claim checks out.** `PROP-SWEEP-3` at `documentOracles.test.js:809–817` asserts only `expect(baseline).toEqual(expect.stringContaining(glob))` for each `A1_GLOBS` entry — no count is pinned either way |
| **Volunteered — §1.2's baseline table re-dated** | The table is reframed as the v1.0-authoring measurement and explicitly marked "no longer the tree's current state", with five re-measurements at v1.3 and the reason T-01 survives anyway (permanent gate, not a one-shot check) | **Honest and verified** — see §Verification. Retracting a stale claim while keeping the record of why the task exists is the right call; T-01's lifecycle argument is already in its own row, so nothing new is being asserted to save the task |

**On scope.** Nothing was added to or removed from the plan this round. No task, no batch, no `Deps`
edge, no TSPEC delta row, no acceptance criterion. Every edit is a correction to a description or a
count. The one substantive obligation added — running mutation 5 — is added to a task that already
owned AT-05 and already carried a mutation-duty step, which is exactly the shape I specified in v5.

## Dependencies

PLAN's citations of upstream, restricted to the ones this delta reaches. Citations outside the
changed sections were walked in v3/v4/v5 and are not re-litigated here.

| PLAN citation | Upstream / tree at HEAD | Status |
|---|---|---|
| §4.3 row 5 — "suppress the record write while `explicitPointer` is true", oracle "AT-05's write-side conjunct only" | TSPEC §5.5 item 5 | **Agrees**, including the "leaves AT-07, AT-15 and AT-18 green" reasoning and the §2.5 recovery-path framing |
| T-07's `Mutation duty (§4.3 rows 1–5, including row 5's suppressed write…)` | §4.3's five-row table | **Agrees** — the range and the table now have the same cardinality, and the duty names row 5 explicitly rather than relying on the range alone |
| §1.1's trade paragraph, RK-1, §4.5's DoD checkbox — "five mutations" | §4.3 | **Agrees** — all three corrected; `grep` finds no surviving "four mutations" outside the v1.1 revision-history row, where it is historically correct |
| §3.4 `Coverage floor` row; §4.4 RK-2 | TSPEC RT-7 (`:949`), TSPEC §5.8 | **Agrees.** RT-7 assigns the floor to the last implementation *task*, cites PLAN T-10 and RK-2 by id, and excludes `implementation.postWaveCommand` — which is what both PLAN rows now say |
| T-10 oracle (i); §2.2 batch-4 gate; §4.5 DoD line — per-file `>= 85` on `orchestrate-dev.js`, exit reported | TSPEC §5.8; `pdlc/workflows/package.json` | **Agrees.** `c8.include` has exactly four entries, the fourth `**/scripts/capture-learnings-baseline.mjs` with `allow-external: true`; `test:coverage` is `c8 npm test … && c8 report --check-coverage --per-file --branches 85 …` |
| T-12 — 94 tracked coverage files, 81 under `tmp/`, `PROP-SWEEP-2(a)` | `git ls-files`; `documentOracles.test.js` | **Agrees, measured** |
| T-11 — "no oracle pins the number either way" | `documentOracles.test.js:809–817` | **Agrees.** The assertion is a `stringContaining` over the glob, weaker than the sentence claims, so the claim is safe in the direction that matters |
| §1.2's five v1.3 re-measurements | The tree | **All five verified** — see §Verification |
| §4.6 — "Run against `git show origin/main:…`, since this tree is 1,637 commits behind" | `git rev-list --count HEAD..origin/main` → `0` | **F-01 (Low) — now false.** §1.2's re-dating in this same revision is what makes it false |

**On the one new finding.** The v1.3 edit correctly retracted §1.2's "the branch is behind the
default branch → `1637`" claim by re-framing that whole table as an authoring-time record. But §4.6
carries the same fact as a *live* rationale, outside the reframed table and outside the sections this
edit touched: it justifies parsing against `git show origin/main:pdlc/workflows/orchestrate-dev.js`
"since this tree is 1,637 commits behind". At HEAD the tree is zero commits behind, and
`git diff origin/main -- pdlc/workflows/orchestrate-dev.js` is empty — so the parser used and the
parser in the tree are byte-identical and every parse result in §4.6 stands unchanged. The same
paragraph also still frames the parse as run "after the v1.2 erratum edit", while the retired-ids row
below it says "re-measured v1.3" and the v1.3 revision-history row says "parser re-run confirms 9
tasks and the same four batches". Both are description staleness in one paragraph, no product
consequence, one edit to fix.

## Verification

Every claim above is a command I ran in this tree, not an impression.

| Claim | Verification | Result |
|---|---|---|
| The branch is the one I may commit on | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-wave-resume` |
| PLAN's bytes moved this round | `shasum -a 256` vs. v5's reviewed hash | `ea7bdc57…`, was `3cf0229a…` |
| The delta's shape | `git log --oneline 423d6802..HEAD` on the PLAN | Nine commits, `f1fc897b`…`5d5f15b4`, each one finding |
| TSPEC §5.5 item 5 says what PLAN's new row says | `sed -n '/### 5.5/,/### 5.6/p'` on the TSPEC | "Suppressing the record write while `explicitPointer` is true (writing only on automatic runs). Killed only by AT-05's write-side conjunct… removing resume from exactly the recovery path §2.5 ratifies the write for" |
| §4.3 now has five mutation rows | Count `\|`-leading lines in §4.3 | 7 — header, separator, **five** rows |
| No stale "four mutations" / "rows 1–4" survives | `grep -n "four mutations\|rows 1–4"` | Only the v1.1 revision-history row (`:18`), where it is a historical record and correct |
| The five corrected count claims | `grep -n "five mutations\|rows 1–5"` | §1.1 (`:184`), T-07 (`:129`), §4.3 heading (`:385`), RK-1 (`:421`), §4.5 checkbox (`:446`) — five for five |
| TSPEC RT-7 assigns the floor to the task, not `postWaveCommand` | Read TSPEC `:949` and §5.8 | "the last implementation **task** (PLAN T-10, RK-2)… Not `implementation.postWaveCommand`" |
| No erratum language survives in §3.4 / §4.4 | `grep -n "erratum"` | Only §4.6's reference to the v1.2 edit, which is a factual back-reference |
| `c8.include` has four entries, fourth is the external script | Read `pdlc/workflows/package.json:19–25` | Four; fourth `**/scripts/capture-learnings-baseline.mjs`, `allow-external: true` |
| `test:coverage` is `--per-file --branches 85` | `pdlc/workflows/package.json:9` | `c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0` |
| T-12's 94 / 81 figures | `git ls-files pdlc/workflows/coverage \| wc -l`; same on `coverage/tmp` | `94` and `81` — exact |
| `PROP-SWEEP-3` pins no count | Read `documentOracles.test.js:809–817` | `expect(baseline).toEqual(expect.stringContaining(glob))` per glob — no number |
| The task table really holds nine tasks | Read §2.1's `#` column | `T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12` |
| §1.2's five v1.3 re-measurements | `git rev-list --count HEAD..origin/main`; `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`; `ls docs/_constraints/pdlc-wave-gate-baseline.md`; `sed -n '46p' .gitignore`; `pdlc/workflows/package.json` | `0`; `10`; present; `/.claude/pdlc-wave-state.json`; `test:coverage` with `--per-file --branches 85` — **five for five** |
| §4.6's "1,637 commits behind" is stale | `git rev-list --count HEAD..origin/main`; `git diff origin/main -- pdlc/workflows/orchestrate-dev.js \| wc -l` | `0` and `0` — behind by nothing, and the parser is byte-identical, so §4.6's parse results stand |
| Requirement coverage unchanged by the delta | Re-walked §2.1's owner column against REQ-WVR-01…-10 and FSPEC-WVR-01…-07 | Every P0/P1 still owned; no task added, removed or re-batched this round |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
