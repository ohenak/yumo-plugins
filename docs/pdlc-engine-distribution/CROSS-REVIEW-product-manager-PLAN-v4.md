# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.4)
**Date:** 2026-08-13
**Iteration:** 4
**Scope:** Delta re-review. Product lens only — traceability, scope compliance, acceptance-criteria
fidelity. Diffed `7c03dcc8..HEAD` on the PLAN (38 insertions, 27 deletions: version cell and
changelog row, §1.2's AC-4.4 paragraph, T58, T59, T31, T49, T50, §2.1's AT-3.1 row and closing
prose, §4's kind-1 T58→T49 gloss and the T05 note, §5.1, DoD items 2, 4, 14, 15).

## Round-3 findings disposition

| Round-3 finding | Severity | Status | Evidence in v0.4 |
|---|---|---|---|
| F-01 fixture-machine observation obligation only implied | High | **Resolved, both halves taken** | DoD item 14 now has four checkable parts: (a) a `{name, capability, unverifiedInvariants}` inventory in `scripts/fixture-machine.mjs`, one entry per gated leg; (b) the workflow **fails** on any skip absent from it; (c) the check is a **positive** observation — on `ubuntu-latest` the recorded skip set is **empty** and the DoD cites the run URL; (d) any non-empty set is a subset of the inventory and item 15 covers every `AT-` id it leaves unverified. Item 15 adds the matching skip-coverage obligation and states outright that its three evidence documents cover **no** AT-2 criterion. The `skipSink` precedent it cites is real at HEAD: `skipSinkTeardown.js:15-33` throws on any violation, `validateSkipRecords` (`skipSink.js:120`) checks records against `driftCapabilities.js:93`'s `SKIP_INVENTORY`, the capability key set is closed at `skipSink.js:55` (`bash`, `git`, `hash`, `uid-nonroot`), and a record with an empty `unverifiedInvariants` list is a violation on the record side too (`skipSink.js:173-182`). |
| F-02 AT-3.1 lost its red carrier | Medium | **Resolved as recommended** | T58 gains the whole-gate-green leg as **AT-3.1**'s red-member conjugate on the same stub configuration, its trailing list now names AT-3.1, and §2.1's AT-3.1 row reads `T58, T49, T52`. §4's kind-1 gloss updated five → **six** stub legs to match. |
| F-03 floor rule stated for five files, floors named for three | Medium | **Resolved, and I re-measured** | §5.1 and DoD item 2 both now carry `ci-arrangement.test.js` **≥ 6** (T17) and `seam-contract.test.js` **≥ 12** (T48). Measured at HEAD with `node --test __tests__/<file>`: 6, 12, and the three prior numbers 9 / 21 / 32 all still hold. |
| F-04 §2.1's exempted asymmetry | Low | **Resolved, and now mechanically true** | T31's AT-3.8a pointer moved into body prose; its trailing list is `(AT-2.2, AC-1.5)`. I transposed §2's 59 trailing lists and diffed against §2.1's 35 rows: **zero mismatches**, no sanctioned-hit list needed. |

Round-2 Q-01 / round-3 Q-01 (the licence obligation) is answered in §4's T05 note: no queue row,
deliberately — T05 blocks, its wave halts at batch 4 with nine batches behind it, and the halt is
the notification. That is the third answer the question offered, and saying so is fine.

All four closed. Everything below is new and confined to text this round added.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **AC-4.4 is P0 and now rests on a single stated reason that the plan's own T50 row contradicts.** §1.2 withdraws round 2's skippability argument (correctly — item 14 closed it) and then says the machine-global mutation "is the whole of the remaining argument, and it is enough on its own": the change-then-revert sequence "mutates machine-global state (which plugin version is current) across three sequential runs, which is not a shape a single workflow run holds." T50 holds a weaker form of exactly that shape, and this plan says so twice. §1.2's own preceding sentence: T50's legs "already make a different plugin version current, which is what AT-2.6's pairing leg establishes." T50's AT-2.3 leg: two consumer repos "both having completed a run at N", **one** machine-level upgrade, "then both runs execute N+1" — a run, a machine-global version mutation, and a further run, inside one workflow run. So the difference between what T50 already does and what AT-4.4 needs is **degree** (a third run and a revert), not kind, and the sentence as written states kind. The consequence is the one §1.2 already names in bold: a hardcoded provenance pair introduced later by T20/T27/T29/T35/T36/T38/T39/T42/T44 reddens nothing, and the only guard on a P0 criterion is a document written once. *Fix (either):* restate the reason in terms of degree — the revert leg needs a third sequential run and the ability to restore the prior plugin root, which the AT-2.6 capability does not by itself provide — so a later reader can see what would have to change; or schedule the revert leg on T50 now that the gate no longer skips silently. The Phase-H LEARNINGS home for the follow-on is a good answer to *where*; this finding is about *why*. | AC-4.4 (P0, REQ-EDIST-04) |
| F-02 | Low | Local | **DoD item 14's "no other observer" claim is false for AT-2.5, by this plan's own traceability table.** Item 14 says AT-2.1, AT-2.3, AT-2.4, **AT-2.5** and AT-2.6 "have no other observer: T50 keeps those legs out of the local suite by construction." §2.1's AT-2.5 row names `T13, T25, T34, T45, T50`, and DoD item 9 checks the below-floor behaviour locally — named failure, no stack trace, no partial tree. AT-2.5's *container* leg on `node:18-alpine` is the gated one; the criterion is not. The obligation item 14 imposes is unaffected and I would not weaken it, but the sentence overstates its own justification, and a later reader who checks it against §2.1 will find the plan disagreeing with itself in the one paragraph whose whole point is that a green check means "ran". *Fix:* name AT-2.5's container leg rather than AT-2.5, or drop AT-2.5 from that list — the remaining four carry the argument unaided. | AC-2.4, DoD item 14 |
| F-03 | Low | Local | **§4's T05 note points at the wrong DoD item for the licence.** The note closes "O-8 blocker 3 is **in** this feature's Definition of Done … and item 12 stands as written." Item 12 is the AT-2 fixture-machine item (`AT-2.1, AT-2.3, AT-2.4, AT-2.6`); the licence obligation is **item 16** (`DECISIONS-plugin-distribution.md` carries the npm scope and the licence). Numbering did not shift this round — the same items sat at 12 and 16 in v0.3 — so this is a stale pointer, not a renumbering casualty. It matters because this round *appended* the tracking answer to that same sentence, so the paragraph a reader consults for "where is the licence obligation recorded" ends by sending them to the wrong item. *Fix:* item 12 → item 16. | O-8 blocker 3, DoD item 16 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Item 14(c) makes the empty recorded skip set a **positive** DoD observation on `ubuntu-latest`, citing that run's URL. T50 says the `docker`, `real-spawn` and `npm-pack` probes all succeed there. Is the fixture-machine workflow pinned to `runs-on: ubuntu-latest` (not `ubuntu-latest` as an alias that GitHub re-points, and not a self-hosted label), so that the "set is empty" claim is about a runner the DoD can actually name? One clause in T50's row would fix the reading; if the intent is that any runner is fine because item 15's skip-coverage obligation catches the difference, saying that is equally good. |

## Positive Observations

- **The round's High closed with a mechanism, not a promise, and every code claim in it is true at
  HEAD.** I checked all four cited anchors: `skipSinkTeardown.js:15-33` throws on any violation,
  `skipSink.js:55` freezes the four-key capability set, `driftCapabilities.js:93` is the
  `SKIP_INVENTORY`, and `validateSkipRecords` rejects a record with an empty invariant list on the
  record side (`:173-182`), not only on the inventory side. The plan also corrected its own earlier
  reading of that precedent — v0.3 called it loud-but-green, v0.4 calls it fail-closed and says so
  in the changelog. Adopting a precedent *as it behaves* rather than as it was remembered is the
  strongest kind of grounding.
- **T59 gives the new comparator a real red predecessor at a level that can run locally.** It names
  `driftHelpers.test.js` as the shape to follow, and that file does exactly this at HEAD — it
  imports `validateSkipRecords` (`:35`) and exercises it directly over records and inventory
  (`:121-191`), including the empty-violations case. So "tested the way `driftHelpers.test.js`
  tests `validateSkipRecords`" is a reproducible instruction, and the four violation cases T59
  enumerates match the comparator's four rejection paths.
- **§2.1 is now a clean set-equality and I verified it as one.** I transposed §2's trailing
  parenthesised lists across all 59 task rows and diffed against §2.1's 35 rows: zero mismatches,
  and no carve-out to remember. The closing prose states the rule that makes it stay true — "a
  trailing list is a claim, body prose is a pointer" — which is what a later reviewer or a checker
  script needs, not just a one-time fix.
- **Both new floors are the numbers the runner prints, and both guard exactly the rewrite that
  would hide a deletion.** `ci-arrangement.test.js` ≥ 6 and `seam-contract.test.js` ≥ 12 measured
  identically here, and §5.1 says why these two files in particular need floors: T17 "absorbs
  V-19's older overlapping matrix assertions" and T48 rewrites the key lists at `:47,57`, so an
  absorbing rewrite that drops assertions is the case the floor exists to redden.
- **AT-3.1's fix landed at the right end.** T58 does not merely acquire the id; it acquires the
  *green-member conjugate on the same stub configuration* as AT-3.2's red-member leg, which is why
  it belongs on the red row. §4's kind-1 gloss moved five → six in the same edit, so the two places
  that count stub legs still agree.

## Recommendation

**Approved with minor changes.**

The round's one High is closed with a mechanism I could verify end to end, and the three lower
findings are closed and now mechanically re-checkable. Nothing in the changed text blocks Phase I.

Three things to fold into the next edit of this document, none of them gating:

1. **F-01 (Medium)** — restate §1.2's remaining AC-4.4 reason as a matter of degree (a third
   sequential run plus a revert to the prior plugin root), or schedule the leg. As written the
   sentence is contradicted by T50's AT-2.3 leg and by §1.2's own preceding sentence.
2. **F-02 (Low)** — item 14 should name AT-2.5's *container leg*, not AT-2.5; §2.1 gives the
   criterion four local carriers and DoD item 9 checks it.
3. **F-03 (Low)** — §4's T05 note: DoD item 12 → item 16 for the licence.

No erratum: nothing in the changed text turns on a defect in an upstream document. §7's open items
still gate Phase PUB as before.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
