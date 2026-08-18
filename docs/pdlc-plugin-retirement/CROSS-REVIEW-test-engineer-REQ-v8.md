# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.10, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 8
**Round type:** Delta confirmation on a previously approved REQ (approved at v7, `REVIEWED-COMMIT: 2a782ec2`).

**Scope of this round.** Not a re-review. I read the erratum edit
(`git diff 06fb8361..HEAD -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`,
three commits `449dd890`, `820e1936`, `0eef4d31`, +17/-9 across AC-4.3, AC-5.2 and O-3)
and asked one question of each routed item: does the delta resolve it without breaking
anything else in the REQ. Everything I assert about HEAD below I measured at HEAD; no
number or field name is carried over from the pinned baseline on trust (DEC-ERR-03).
Sections the edit did not touch are not re-litigated.

## Delta disposition

| Routed item | Landed? | Evidence at HEAD |
|---|---|---|
| **1 — O-3 vs AC-1.1: does the manifest survive?** | **Yes, cleanly** | O-3 now says the manifest does **not** survive, for a stated mechanical reason (it is a retired term of AC-1.2 at `REQ:293`, so a surviving copy would red that criterion permanently) and leaves open only *which* directory holds the probe CLI's build. AC-1.1's set-equality with `{M-9}` now stands unopposed. Cross-checked against the inventory rather than the prose: `docs/_constraints/pdlc-retirement-baseline.md:44` already pins M-7 as "reduced — keeps emitting M-9 only", so the reduced build step is committed to *not* emitting the manifest. The decision, the criterion and the inventory row now agree; a test author reading any one of the three reaches the same expected `dist/` entry set. |
| **2 — AC-5.2's allowed-difference set omits run-variable fields** | **No — same defect survives, narrowed** | The edit added `engineVersion`, `pluginVersion`, `dispatches` and `outcomes`. It did not add the other run-variable members of the same `engine` block, and read literally the criterion still fails on a correct sweep. See F-01. |
| **3 — AC-4.3's undetectable hand-modification case** | **Yes** | AC-4.3 now scopes to an **unexpected entry** — "an entry the cleanup's own expected set does not name" — and records why the hand-modification case is deliberately out (no post-sweep artifact records hashes). The refusal is fully specified as a black-box test: place a stray file, run the cleanup, assert the file byte-identical, its path on stderr, exit non-zero. The "non-zero" fix is specific enough to write. `grep -n "hand-modif"` finds the term nowhere else in the REQ except the v0.10 changelog line, so nothing downstream still assumes the dropped case. One residual gap in the same paragraph is inherited, not introduced — see F-02. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-5.2's widened allowed-difference set is still incomplete, so the criterion still cannot pass on a correct sweep.** The `engine` block that AC-5.2 compares carries more run-variable members than the four the edit named. Measured at HEAD in `pdlc/engine/lib/report.mjs`: `authSources` is a *per-dispatch* `{skill, phase, attempt, apiKeySource}` row set (`:33`–`:34`, `:82`); `retries` rows carry a `timestamp` per row (`:39`–`:40`, `:86`); `pauses` and `denials` are the adapter's per-run logs (`:41`–`:42`); `startup` is the six-rung ladder (`:37`); `loop` carries `{iterations, …}` (`:46`–`:47`). Every one of these differs in *content* between the pre-sweep BL-08 baseline run and the post-sweep run, for the same reason `dispatches`/`outcomes` do — different runs of different features dispatch differently. A test author implementing AC-5.2 literally today writes a comparison that reds on a completely correct sweep, and the only way to green it is to quietly widen the allow-list at test-authoring time, which is exactly the implementer-side narrowing AC-1.2 elsewhere in this REQ is careful to forbid. **Fix (one clause, no new decision):** stop enumerating fields and state the rule the enumeration is groping for — field sets are compared for **equality**; values are compared for equality only on the fields that are invariant across two correct runs, and every run-variable field (provenance versions, timestamps, ids, paths, and the per-dispatch/per-outcome/per-retry/per-pause/per-denial/startup/loop collections) is compared for **presence and shape**, not content. That formulation is closed under the engine adding another run-variable field, which the enumeration is not — and the enumeration has now failed to be exhaustive twice. | §6.5 AC-5.2 |
| F-02 | Medium | Local | **AC-4.3 still does not say what happens to the *expected* entries when the cleanup refuses.** The criterion pins the fate of the unexpected entry (byte-identical, named on stderr, exit non-zero) but is silent on whether the refusal is all-or-nothing — does `.claude/workflows/` still hold its expected entries afterwards, or were they removed before the stray was hit? Both are operator-visible outcomes and they are not equivalent: a partial delete leaves the consumer in a state AC-4.2's idempotence claim does not describe, and a black-box test cannot assert the post-refusal directory state without choosing one. This is **inherited**, not introduced — the pre-erratum text had the same silence — but it sits inside the paragraph the edit rewrote and is a one-clause fix while that paragraph is open: add "and leaves the directory otherwise unchanged" (or the partial-delete alternative, if that is the intent). | §6.4 AC-4.3, AC-4.2 |
| F-03 | Low | Local | **"Those last three" miscounts the list it refers to.** AC-5.2 now enumerates six terms (feature name, timestamps, ids, paths, provenance versions, run-variable collections) and then says "Those last three vary between two *correct* runs". Counting terms, the last three are *paths*, provenance versions and collections — which reads as newly declaring paths a run-variable quantity compared for presence only. Counting the *added* phrases, it means the two the erratum appended. The sentence is load-bearing (it is what tells a test author which comparisons are presence-only), so the ambiguity is worth a word. F-01's rule-shaped rewrite dissolves it; otherwise, name the fields instead of counting them. | §6.5 AC-5.2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from round 7, now sharper because O-3 closed.) O-3 pins that the manifest does not survive and `baseline:44` pins M-7 as "keeps emitting M-9 only" — so the reduced build step must stop *writing* `distribution-manifest.json`, not merely have it deleted from the tree. No AC asserts that: AC-1.1 asserts the tree's `dist/` entry set, which a build that still emits the manifest reds only after someone runs the build. Which surviving test re-runs the reduced build and asserts its emitted set equals `{M-9}`? One sentence in the TSPEC's O-3 resolution closes it; it does not need to reopen this REQ. |

## Positive Observations

- **Item 1 is the model of what an erratum round should do.** O-3 did not merely pick a side; it gave the mechanical reason the side is forced (`distribution-manifest` is a retired AC-1.2 term, so survival would red that criterion forever), and the reason is checkable against an artifact I did not have to take on faith — the baseline inventory already says M-7 keeps emitting M-9 only. Decision, criterion and inventory agree, so no downstream reader can reconstruct the contradiction.
- **Item 3 improved testability twice over.** Dropping a case because *no artifact exists that could make it observable* is exactly the right reason to drop a criterion, and the REQ says so in the criterion itself rather than in a changelog line — the next author who wonders why hand-modification is unguarded finds the answer where they are standing. Pinning the exit status as "non-zero" turns a previously unwritable assertion into a writable one.
- **The edit stayed inside its blast radius.** +17/-9 across three paragraphs; no criterion outside the routed set moved, and nothing the round-7 approval rested on changed underneath it.

## Recommendation

**Needs revision**

One High is open (F-01), so this is Needs revision by the mandatory rule — but the scope is one clause in one criterion. Routed items 1 and 3 have landed and should not be reopened. Item 2 has not: AC-5.2 read literally still fails on a correct sweep, because the erratum extended an enumeration that cannot be made exhaustive by inspection rather than replacing it with the rule it is approximating. Replacing the enumerated list with "field sets equal; run-variable fields compared for presence and shape, not content" resolves F-01 and F-03 together and is closed under future engine fields. F-02 is a one-clause addition to the paragraph the edit already has open. None of the three needs a decision that is not already made.

FINDING: High | delta | local | §6.5 AC-5.2 | Widened allowed-difference set still omits `authSources`, `retries`, `pauses`, `denials`, `startup` and `loop` (`pdlc/engine/lib/report.mjs:33,37,39,41,46`), all run-variable between two correct runs, so the criterion still fails on a correct sweep — the routed item is not landed.
FINDING: Medium | inherited | local | §6.4 AC-4.3 | Criterion does not say whether the expected entries survive the refusal, so a black-box test cannot assert the post-refusal directory state.
FINDING: Low | delta | local | §6.5 AC-5.2 | "Those last three" miscounts the six-term enumeration it refers to, ambiguously pulling `paths` into the presence-only comparison.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
