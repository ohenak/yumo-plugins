# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 3 (erratum delta confirmation, not a full re-review)
**Scope:** Erratum round on PROPERTIES v0.4 → v0.5 (`06e74162`). Confirms the raised item landed
and re-measures the document against upstream **at HEAD**, per DEC-ERR-03.

## 1. Raised item

One item was raised. It named two things, and they are in different states at HEAD.

| Raised | State | Evidence |
|---|---|---|
| PROP-LAUNCH-3 (`PROPERTIES:85`) discriminates against the retired `"none installed"` message | **Already discharged before this round — the item arrived stale** | PROP-LAUNCH-3 at HEAD (`:86`) reads "must pin that the text is **not** AT-1.1's `not found` message". That was repointed by v0.4 in `8980ffe7`. It matches FSPEC AT-1.4 (`FSPEC:687-689`) clause for clause, and the string it now discriminates against is emitted at `pdlc/engine/lib/handshake.mjs:164` and pinned by `handshake.test.js:113`. Nothing to do. |
| Align PROP-LAUNCH-9 on the `not found` literal | **Fixed by this edit** | The headline clause read "state that none is installed"; it now reads "**report the plugin version as the literal `not found`**" (`:92`). |

The fix is the right one and it is a *label* fix, not an oracle fix — which matters for judging
blast radius. PROP-LAUNCH-9's conjunct (b) has pinned the exact literal `not found` since v0.3, so
no implementer could ever have written the dead string into a test. What the edit removes is the
last place in this document where a reader was drawn back to a settled question. The new clause is
not merely *compatible* with FSPEC v0.7's AT-1.1 — it is that criterion's own wording:

> **AT-1.1** … the message names the declared range and reports the plugin version as the literal
> `not found`, and no file in the consumer project changed. (`FSPEC:659-663`)

The four conjuncts underneath are byte-unchanged, so the property's assertable content is
identical before and after. The diff is 4 insertions / 3 deletions across the Upstream cell, the
version row, the changelog and this one clause. Nothing else moved.

## 2. Upstream re-grounding at HEAD

This is the half that is not the item list. I re-read the upstream at its current version and
re-measured whether PROPERTIES is still a faithful compression of it.

| Upstream | Version at HEAD | Upstream cell claims | Match |
|---|---|---|---|
| REQ | 0.11 | 0.11 | ✅ (sha `abd47bee…`, as dispatched) |
| FSPEC | 0.7 | 0.7 | ✅ (was 0.6 in v0.4 — correctly advanced) |
| TSPEC | 0.12 | 0.12 | ✅ |
| DECISIONS | 0.3 | 0.3 | ✅ |
| PLAN | 0.8 | 0.8 | ✅ (was 0.7 — correctly advanced; sha `ad3ecdd3…` equals the recorded approval anchor in `22ec5bf6`) |

The two documents that moved after v0.4 were written are exactly the two the changelog names, and
both are named at their current versions. The three that did not move are correctly left alone.

**Set-equality against FSPEC §8 re-run, not assumed.** The changelog asserts §4's set-equality is
unchanged. I checked it mechanically against FSPEC v0.7 rather than taking the claim:

```
AT ids in FSPEC §8:            35
AT ids in PROPERTIES §4:       35
in FSPEC but not PROPERTIES:   (empty)
in PROPERTIES but not FSPEC:   (empty)
```

Set-equality holds in both directions. Since FSPEC v0.7 added, removed and renumbered no `AT-` id
(its own changelog: "No criterion, oracle or count changed"), §5's coverage accounting and the
property counts (89 properties, column sum 95, Unit 74) are undisturbed by construction.

**Residue sweep.** `grep` for the retired literal over PROPERTIES now returns three hits, all
legitimate: `:21` and `:22` are changelog rows recording the fix (append-only history, correct to
retain), and `:89` is PROP-LAUNCH-5's "the exact literal `not found` **when none is installed**".
That third one is not residue — it is FSPEC AT-1.6's own wording verbatim (`FSPEC:695-697`:
"installed plugin version (the literal `not found` when none is installed)"). It describes the
*state*, and the string it asserts is `not found`. Correctly left unchanged.

## 3. Absorbed decisions

DEC-ERR-01 requires the author to enumerate what the upstream decided while this document was
away, and to record absorption *before* the raised items. v0.5 does that — four decisions, each
claimed a no-op here. I verified each claim rather than accepting "no-op".

| # | Upstream decision (FSPEC v0.7 / PLAN v0.8) | Claimed effect | Verified |
|---|---|---|---|
| (a) | FSPEC §5.2's vendored-module class renamed **Workflow members** (`PK-22` is a JSON manifest, not a module) — `FSPEC:537` | No-op: this document never transcribes class names | ✅ Confirmed, and the distinction is real. `FSPEC:537` gives the class **three** members (`PK-20`…`PK-22`). PROP-PACK-5 asserts `VENDOR-MANIFEST.json`'s `modules` array equals `{orchestrate-dev.js, orchestrate-queue.js}` — the *manifest's content*, cardinality 2, not the class's cardinality 3. Those are genuinely different objects, so the rename cannot reach the assertion. The changelog says exactly this. |
| (b) | FSPEC §5.2's CLI-entry and engine-module rows now anchor `PK-4`/`PK-4b` and `PK-5`…`PK-19`; CLI-entry note no longer calls its cardinality downstream-only — `FSPEC:534-535` | No-op: PROP-PACK-1 sources member names from TSPEC §5.4, PROP-PACK-2 sources classes/counts from FSPEC §5.2 | ✅ Confirmed at `PROPERTIES:129-130`. The split matches REQ v0.11's AC-1.3 ("classes and per-class counts in the FSPEC, member names in the TSPEC") and reading rule 3. Anchors added to the FSPEC do not change what either property transcribes. |
| (c) | FSPEC v0.7 states AT-3.8a's count conjunct **positively** — `FSPEC:766-771` | No-op: PROP-PACK-2 is already in the positive form | ✅ Confirmed. AT-3.8a requires the count be asserted against the transcribed `PK-*` list's length, **23 before N-2's licence decision, 24 after**, and explicitly forbids reading it off the tarball. PROP-PACK-2 states the same three things, same numbers, same prohibition ("never the tarball's own length … a self-derived expectation `BR-8.1` forbids"). A wording match, not an oracle change. |
| (d) | PLAN v0.8 retitles §2.1's AT-1.1 trace row to "refusal, plugin reported `not found`", no task/batch/ownership change | No-op: every carrier cell in §2 and §4 stands | ✅ Confirmed. The `AT-1.1` id and its `Carried by` cell are byte-unchanged (corroborated independently by `CROSS-REVIEW-test-engineer-PLAN-v7.md:20`), so PROP-LAUNCH-9's carrier cell `T15 → version-doctor.test.js; T46 → bin/cli.mjs` still resolves. |

No absorbed decision was demoted to a finding, and none was silently skipped. The absorption
ordering (decisions recorded ahead of the raised item) is correct per DEC-ERR-01.

**Citations spot-checked in code, not just in prose.** PROP-LAUNCH-9 claims its decision half is
"already green at HEAD" and cites `handshake.test.js:110-118`. That block is the missing-plugin
test and it does pin all four named things — the range (`:113`), `not found` (`:114`), `Remedy:`
(`:115`) and `PDLC_PLUGIN_ROOT` (`:116`) — with `assert.equal(out.pluginVersion, "not found")` at
`:112`. PROP-LAUNCH-2's cited `:120-126` is the out-of-range test naming both versions and the
range. Both citations are accurate, so the "new work is the launcher path reaching it" framing is
a true statement about the gap, not an optimistic one.

## 4. Findings

**No new findings.** The delta resolves the raised item and breaks nothing previously approved.

Two Low findings from v2 remain open. Neither was in this erratum's scope, neither is gating, and
neither was made worse by the edit. Carried forward unchanged for the next PROPERTIES touch:

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-06 | Low | Local | *(carried from v2, unchanged)* PROP-LAUNCH-1 is presented as an AC-5.5 carrier; AC-5.5 is in fact carried by PROP-VER-5, so this should trace to the `store.empty` precondition state instead. Wording, not coverage — no requirement is left uncovered either way. `PROPERTIES:86` | AC-5.5 |
| F-07 | Low | Local | *(carried from v2, unchanged)* §4's "observed inside AT-5.5's and AT-1.3's legs" clause (`PROPERTIES:316`) is not corroborated by the `AT-` table; drop or qualify it. | AC-1.1 |

I am deliberately not re-raising these as new findings — they are the same two items, at the same
severity, still one-clause edits in §2.1 and §4 respectively.

## 5. Questions

None. The erratum record answers the questions a delta confirmation would otherwise have to ask:
which upstream moved, what it decided, and why each decision is inert here.

## 6. Positive Observations

- **The stale half of the item list was diagnosed rather than re-applied.** PROP-LAUNCH-3 was
  already correct at HEAD; a less careful round would have "fixed" it again, churning a settled
  cell and making the erratum wave look unconverged. The changelog says plainly that the item
  arrived stale and names the commit that discharged it. That is the behaviour that lets a
  multi-layer erratum wave actually terminate.
- **Absorption was done before the raised item, and each no-op was argued from the document's own
  reading rules** rather than asserted. Claim (a) in particular distinguishes the manifest's
  `modules` array from the class's cardinality — a distinction that is easy to miss and would have
  produced a wrong "this rename touches PROP-PACK-5" conclusion.
- **The fix adopts the upstream's wording verbatim instead of paraphrasing it.** PROP-LAUNCH-9's
  new clause reads as AT-1.1 reads. Paraphrase is how this drift started; matching the source
  text is what stops the next round from re-raising it.
- **Scope discipline held under pressure.** Round-3 cross-review findings were available to fold
  in, and none were. No property added, removed or re-scoped; no count moved; set-equality intact.
  An erratum round that stays an erratum round is what keeps the approval anchor meaningful.

## 7. Recommendation

**Approved.**

The delta resolves the raised item, and — the part that is not the item list — PROPERTIES v0.5
remains a faithful compression of REQ v0.11, FSPEC v0.7, TSPEC v0.12, DECISIONS v0.3 and PLAN
v0.8 as those documents read at HEAD. Every upstream citation I checked still says what this
document says it says. The `AT-` set-equality against FSPEC §8 holds in both directions on a
mechanical re-run, the four absorbed decisions are genuinely inert here for the reasons given, and
no product criterion changed hands: AC-1.1's plugin-compat half is still carried by PROP-LAUNCH-9
and PROP-LAUNCH-2 on their two distinct refusal axes.

The two open Lows (F-06, F-07) are recorded, not gating, and were out of this round's scope.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}
