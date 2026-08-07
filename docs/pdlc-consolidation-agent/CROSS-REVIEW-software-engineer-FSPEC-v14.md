# Cross-Review: software-engineer — FSPEC (delta re-review, round 14)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 14
**Scope:** Delta only. Diff reviewed: `0499e532..HEAD` (commits `bbd0c255`, `fabe861b`,
`d13c9ea8`, `99aff9bc`) against the FSPEC I approved at v13 (`0499e532`, anchors `ba91e4c9`).
50 insertions / 16 deletions in one file. No section outside that diff was re-reviewed.

## 1. Prior finding disposition

| # | My v13 finding | Disposition | Evidence |
|---|---|---|---|
| F-01 (Low) | §4.1's justification overloads "the existence seam alone" — the seam separates absent/empty/non-empty and cannot separate `RELEASED:` from `IN-PROGRESS:`, which needs §4.2's read | **Resolved, as suggested** | `:447-451` now scopes the seam claim to the pair it is actually arguing about ("those two are separable by the existence seam alone: a released marker is non-empty, a half-written one is reported `file_empty` and an absent one `file_missing`") and hands the two-non-empty-forms discrimination to §4.2 explicitly ("decided not by existence but by §4.2's read of the single line"). The seam citation is unchanged and still correct: `runtime-adapter.js:817-838` maps `test -f && test -s` ⇒ `OK`, `test -f` alone ⇒ `EMPTY`, else `MISSING` |
| Q-01 (question) | Under the sentinel a released marker persists indefinitely; if an operator ever asks "is a pass running?", the answer is "read the line", not "does the file exist" — worth a TSPEC operator note | **Answered, in the right register** | §4.2 gains a *declined option* paragraph (`:485-494`): aging a released marker was weighed and rejected, with a reason that is a real trade (the cadence datum in `.consolidation-log.md` already answers "how long since the last pass" from a durable, **committed** source, where the marker's timestamp is lost on a fresh clone), an explicit statement that the silence is a decision, and the routing of the operator note to TSPEC rather than another FSPEC round. Declining with a reason is a stronger answer than adopting it |

Both are closed. The remaining three edits in the delta answer te-review's Lows; I re-verified
each against the codebase rather than accepting it (§2).

## 2. Verification of the delta's new claims

I re-ran every citation the delta added or moved.

| Claim (location) | Verified? | Evidence |
|---|---|---|
| AT-P7: the hook's set is the block's **`pending` binding**, bound at `:41`, **before** the `THRESHOLD` comparison at `:43` (`:2106`) | **Yes** | `nudge-consolidation.sh:41` is `pending = [p for p in learnings if os.path.basename(p) not in logtext]`; `:42` is `n = len(pending)`; `:43` is `if n >= THRESHOLD:`. The binding genuinely precedes the gate, so the channel is threshold-independent — which is what makes the differential test statable at all |
| AT-P7: the block early-exits at `if not learnings: sys.exit(0)` (`:29-30`), so an empty-corpus case reads as an empty set, not an error | **Yes, mechanically** | `:29-30` are exactly those two lines. The harness must catch the `SystemExit` the exit raises before `pending` is bound; the FSPEC states the intended reading ("`pending` is unbound and the hook's set is read as empty") rather than leaving it to be discovered as a spurious red. Naming the unbound-name case is the point of the clause |
| AT-P7: `THRESHOLD` gate at `:25`, glob at `:28`, read block at `:36-41` | **Yes** | `THRESHOLD = 5` at `:25`; `glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))` at `:28`; the `open`/`read`/`except` block at `:34-39` feeding `:41` |
| AT-P7: this feature widens the glob at `:28` and re-scopes the predicate at `:41`, so "the shipped block" means the post-edit block and every line number is a drifting locator | **Yes** | The change register row exists and says exactly that — `pdlc/hooks/scripts/nudge-consolidation.sh` \| "predicate at `:41` scoped to the two regions; corpus glob at `:28` widened to include `docs/completed/*/`" (FSPEC `:2435`). Stating that the locators will drift under the feature's own edit is the honest framing, and it is what keeps AT-P7 from being a source-inspection test |
| §4.2 producers table: a pass killed inside the **release** at step 16 has already appended its terminal row, because §4.3 orders release after the append | **Yes** (claim true; its *locator* is wrong — F-01 below) | FSPEC `:543-544`: "Release is unconditional for every marker-holding pass, including `failed`: it runs at step 16 after the terminal row is appended". The cited `:511-512` is not that sentence |
| E-12b's narrowing agrees with T-10 and BR-33a | **Yes — three-way** | E-12b (`:2681`) now says LD-5 holds **§8.3's** `phase` arm because §8.4 steps 2–3's `phase` half is collected field-agnostically by §8.1's §8.4 steps 2–3 reader row. T-10 (`:2245`) excludes "§8.3's `phase` arm and §8.1's `failure-mode-id` arm" from its unavailable-spelling collection with the same reasoning; BR-33a (`:2625`) carries the matching conjunct. The off-by-one-arm disagreement I flagged at v12 is now closed in all three places, and the first cell's *reader* enumeration (`phase` for §8.3 / §8.4's harvest question) is untouched — correctly, since it enumerates which readers index the field, not which arm LD-5 owns |
| BR-13 narrowed to a fresh **`IN-PROGRESS:`** marker, plus "a `RELEASED:` marker is not held, so it is never refused on at any age" (`:2583`) | **Yes, consistent** | Matches BR-14 (`IN-PROGRESS:` only, `:2584`), BR-14a (`:2585`), E-11b (`:2679`) and §4.2's four-row table. The AT cell gains AT-M11, whose oracle (`:2119`) asserts the positive — marker taken, pass proceeds — beside the two negatives (no `reclaimed-stale-lock`, no `consolidation-in-progress`), on two fixtures one of which is older than `staleLockMinutes`. Not an absence-only oracle |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | Two **stale intra-document locators**, both introduced by this delta and both wrong at HEAD because the delta's own 34-line insertion moved the targets. (a) §4.2's new producers table cites "§4.3 `:511-512` orders release after the append"; `:511-512` is now the header row and first data row of that same producers table, and the sentence it means is at `:543-544`. (b) AT-P7 cites "§14's change register (`:2401`)"; the change register is **§15.3** (`:2431`), its `nudge-consolidation.sh` row is at `:2435`, and `:2401` is the `no-cadence-datum` row of §15.2's vocabulary-coverage table. Neither has a contract consequence — both targets are named by section and by content, so a reader finds them — but a locator that points at an unrelated table is worse than no locator, and AT-P7 in particular is the row that just told the reader line numbers here are drifting locators. Suggested: cite `§4.3` and `§15.3` by section only, or re-point to `:543-544` and `:2435` | §4.2 `:513`; §13 AT-P7 `:2106` |

No High or Medium findings. Nothing in the delta blocks implementation.

## 4. Regression check — did the delta break anything previously approved?

The only edit with reach beyond its own paragraph is §4.2's two-producer concession, which
changes what a `reclaimed-stale-lock` row *can* mean. I traced its readers.

| Previously approved surface | Still holds? | Why |
|---|---|---|
| E-11 / AT-M3 (`:2678`, `:2118`) — empty or unparseable marker ⇒ reclaimed, id `unknown` | **Yes** | Both outcomes are unchanged; the delta explains *why* the same record is written for both producers rather than adding an arm. AT-M3's fixture-(a) rationale ("the only durable trace of a pass that died inside its own take") remains true of the producer it names, and the producers table is the place the second producer is stated — a rationale cell, not an oracle, so no test changes |
| §12.1 S-10 (`:2022`) — "marker held and stale" ⇒ `reclaimed-stale-lock`, released, one row | **Yes** | S-10's composition semantics are untouched. The delta widens the *population* that can produce the code, not the code's obligations; and the FSPEC says so out loud ("over-recording, never under-recording") instead of leaving a reader to discover that a `reclaimed-stale-lock` row does not prove a pass was lost |
| BR-14 / BR-14a / E-11b / AT-M11 | **Yes** | BR-13's narrowing moves it *onto* the same `IN-PROGRESS:` subject BR-14 and §4.2's table already used; the released arm stays wholly BR-14a/E-11b/AT-M11's. No rule now claims a released marker for two owners |
| §4.1's sentinel justification and the `.gitignore` entry (§5.4 pathspec set-equality, AT-M5) | **Yes** | The rewrite is prose-scoping only — no change to the release form, the seam, or which paths are committed. The declined-aging paragraph restates the git-ignored status rather than altering it |
| AT-P2…AT-P6, AT-P8…AT-P10, BR-09, T-08 | **Yes** | AT-P7's *Given* and *Then* are byte-identical; only the *When* gained the observation-channel clause. The fixture table it ranges over, the set-equality oracle, and T-08's openness (two implementations permitted, differential form unchanged if it resolves to shared code) are all untouched |
| T-10 / BR-33a / LD-5 / §14.1 registers | **Yes** | The E-12b edit is the third statement converging on the reading T-10 and BR-33a already carried; it moves E-12b onto them, not them onto it. The `failure-mode-id` arm — the one that genuinely emits no row — is untouched in all three |

No previously approved statement is contradicted, and no AT that was green before the delta
becomes unstateable after it. No AT, BR, AC, fixture or oracle changed shape in this round, which
is what the header note (`:14`) claims and what the diff shows.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | Non-blocking, for TSPEC rather than another FSPEC round: AT-P7 executes the hook's Python block "verbatim … read out of the namespace the block was executed in", and the empty-corpus case reaches `sys.exit(0)` before `pending` exists. TSPEC will need to say how the harness distinguishes *that* `SystemExit` from a `SystemExit` raised by a genuine failure, since both surface identically to the caller. The FSPEC is right not to specify the harness; I raise it only so it is not rediscovered at implementation |

## 6. Positive Observations

- The Q-01 answer is written as a **declined option with its reason**, not as a silent omission or
  a hedge. "The cadence datum already answers this from a committed source; the marker's timestamp
  is lost on a fresh clone" is a real trade with a falsifiable premise, and the closing sentence
  routes the operator consequence to TSPEC rather than accreting it here. That is the correct
  disposition of a reviewer question that was never a defect.
- The two-producer table is the round's best edit: the previous text asserted a single producer,
  which was simply false under the sentinel, and the repair does not paper over it — it names both
  producers, concedes the second is recorded spuriously, and argues the *direction* of the error
  (over-recording legible beside the completed pass's own row; under-recording unrecoverable).
  A spec that states where it is deliberately imprecise is far cheaper to implement against.
- AT-P7 now names its observation channel, its early-exit corner, and the fact that its own line
  numbers are edited by this feature. Naming the channel is what separates a differential test from
  a test that silently compares the wrong thing; every line number in it reproduces at HEAD.
- BR-13's narrowing was the last place a released marker could have been claimed by the refusal
  arm. With it, `IN-PROGRESS:` and `RELEASED:` have disjoint rule owners across BR-13/14/14a and
  E-11/E-11b, and AT-M1/AT-M11 are the paired tests.

## Recommendation

**Approved with minor changes**

Both of my v13 items are closed on the merits, all five Low repairs landed, and the regression pass
found nothing broken. F-01 is two stale intra-document line locators with no contract consequence;
fold them in if either section is touched again — they do not warrant a further round.

## Verdict

VERDICT: Approved with minor changes
