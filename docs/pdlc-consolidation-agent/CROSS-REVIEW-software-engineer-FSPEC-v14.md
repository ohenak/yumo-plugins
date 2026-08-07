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
