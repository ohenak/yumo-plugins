# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 5
**Scope:** Delta confirmation of a Phase-F erratum edit. Testing lens only. Not a re-review: the raised item was checked for discharge, and the whole document was re-measured against upstream at HEAD per DEC-ERR-03. Sections approved in rounds 1–4 were not re-read for their own sake.

## Method

`git diff d377dbc7..HEAD` over the PLAN — the commit my v4 pinned in `REVIEWED-COMMIT`. Four commits, and the diff touches exactly four regions: the lineage header's upstream versions, a new `0.5` changelog row, the **T16** row, and §7's erratum paragraph (one paragraph rewritten, one added). No other table row, no batch cell, no dependency cell, no ownership-manifest row is in the diff.

Every claim below was re-measured at HEAD rather than read off the revision's prose:

- The FSPEC's AT-3.8a and AT-3.8b bodies, read in full at `FSPEC:730-749`.
- REQ **AC-1.3**'s current wording at `REQ:264-274`.
- TSPEC §5.4's `PK-*` rows and its derived total, `TSPEC:347-359` and `:388-398`.
- The two errata PLAN still declares open, each re-checked against the tree, not against the TSPEC's description of the tree.
- The §2.1 ↔ FSPEC acceptance-criterion set-equality, re-derived mechanically.

## The raised item

**Discharged, and the discharge is real in the upstream bytes.** The erratum was that FSPEC AT-3.8a still restated the packed set literally as "the manifest, `bin/pdlc.mjs`, the twelve named `lib/*.mjs` modules" — a set wrong by four members once E-4b's `bin/cli.mjs` and §3.1's three new `lib` modules land, so an implementer reading the acceptance test instead of the TSPEC would transcribe the wrong expectation into T16.

I grepped for that literal at HEAD. It is **gone**. AT-3.8a now reads, in its own words, "The expected list is a literal one, never a listing of `pdlc/engine/lib/`; its **classes and count are §5.2's**, and its **member names are downstream, in TSPEC §5.4's `PK-*` table**, which is the single source the verifier transcribes. This document does not restate the member list (an FSPEC-local copy is what diverged)." The failure mode the erratum named cannot recur by construction: there is no second copy to drift.

T16's row tracks that exactly. It drops the deferral, states the two-sided source (members from TSPEC §5.4, classes and per-class counts from FSPEC §5.2), and carries the count conjunct's transcribed-list rule. The row now says it "transcribes now and defers to nothing" — which is true, because nothing it depends on is still open.

Three details I checked rather than assumed, because each is the kind of thing that reads correct and measures wrong:

1. **The member count.** PLAN says 23 before N-2, 24 after. TSPEC §5.4 no longer authors that total — it *derives* it: four manifest-adjacent/`bin/` members (PK-1, PK-2, PK-4, PK-4b) + fifteen `lib/*.mjs` (PK-5…PK-19) + three vendored (PK-20…PK-22) + `scripts/postinstall.mjs` (PK-23) + the licence (PK-3, 0 before N-2, 1 after). That sums to **23 / 24**. The FSPEC states the same pair independently. Both sides agree, and the TSPEC side is now a derivation, so a `PK-*` row added or re-classed moves the number instead of silently contradicting it.
2. **The count conjunct is not a tautology.** T16 asserts the count against the *transcribed* `PK-*` list, never `len(actual)`. This is the exact remedy my FSPEC round-4 F-03 asked for, and FSPEC AT-3.8a now carries it in the same terms (BR-8.1 forbids the self-derived expectation). Against the transcription the conjunct can actually go red — when the transcription has drifted from §5.2 — which is the only version of that check worth shipping.
3. **AT-3.8b is a sub-assertion, not a competing expected side.** FSPEC declares AT-3.8a authoritative over the whole set and AT-3.8b a sub-assertion over the one vendored-module class, and has dropped `[blocked on O-10]` from `PK-20`…`PK-22` (O-10 now blocks only BR-8.2). T16 states this the same way, so there is no second expected set for an implementer to wire against.

## The raised item

<!-- pending -->

## Upstream re-grounding (DEC-ERR-03)

This was the part of the confirmation that could have gone wrong quietly. Three of the four upstream documents moved between v0.4 and v0.5 — REQ **v0.10 → v0.11**, FSPEC **v0.2 → v0.5** (three versions), TSPEC **v0.11 → v0.12** — while the PLAN edited only T16 and §7. A PLAN whose lineage header is updated but whose body still compresses the older upstream is stale in exactly the way the raised item list would never surface.

**Lineage header.** Verified row by row against each upstream's own version cell at HEAD: REQ `0.11`, FSPEC `0.5`, TSPEC `0.12`, DECISIONS `0.3` (unchanged). The header states those four. Correct.

**Did FSPEC's three-version move disturb §2.1's set-equality?** This is the load-bearing check, because §2.1 is a set-equality against the FSPEC's acceptance-criterion catalogue and an id added or renumbered upstream would break it silently — no batch cell changes, no row changes, the table simply stops being a bijection. I enumerated the `AT-` ids defined in FSPEC at HEAD and the ids appearing in PLAN §2.1, and compared:

- FSPEC defines **35** ids: AT-1.1…1.6, AT-2.1…2.6, AT-3.1…3.7, AT-3.8a, AT-3.8b, AT-4.1…4.5, AT-5.1, 5.2, 5.3, 5.3b, 5.4, 5.5, 5.6, AT-6.1, AT-6.2.
- PLAN §2.1 carries **35** ids, and the two sets are **identical** — no id on one side missing from the other.

So FSPEC v0.3/v0.4/v0.5 added, removed and renumbered nothing in the `AT-` namespace; the changes were to AT-3.8a/AT-3.8b *bodies* and to §5.2's class rows. §2.1's set-equality, re-derived here rather than trusted, still returns zero disagreements. The transpose my v4 verified survives untouched.

**REQ AC-1.3's re-wording.** The absorbed decision claims REQ v0.11 re-worded AC-1.3 to the ownership split the downstream documents already held. Read at HEAD, AC-1.3 now requires the tarball list to equal "an expected set whose **classes and per-class member counts are stated in the FSPEC** and whose **member names are stated downstream in the TSPEC**". That is the split, stated at REQ altitude, and it is the same split T16 and AT-3.8a implement. AC-1.3 still keeps the oracle on the packed tarball (not a declared `files` list, which would pass vacuously) and still requires that a removed module fail, not merely a missing one — both of which T16 preserves. Nothing in the re-wording loosens what T16 must prove.

**The two errata PLAN still declares open — re-checked against the tree, not the prose.** §7 drops from three open errata to two. A confirmation that only counted them would miss the case where TSPEC v0.12 quietly closed one and §7 is now overstating the block:

- **T45, below-floor emission.** Still open. `node.below-floor` is genuinely **absent** from `pdlc/engine/lib/catalogue.mjs` at HEAD, and `pdlc/engine/lib/` holds exactly the twelve modules V-03 measures. TSPEC v0.12 *does* touch this area — it extends §12.1's fixture-machine row to name `node:18-alpine` as AT-2.5's runner — but that names a **runtime for the refusal to execute in**, not an **emitter for the registered catalogue id**. The erratum is about `checkMessageCatalogue` failing on the registered-but-unemitted arm while §9.3's guard admits zero static imports and three top-level statements. That contradiction is untouched. §7's description remains accurate.
- **T50, fixture-machine home.** Still open. `.github/workflows/pr-tests.yml` at HEAD defines exactly **five** jobs — `unit-tests`, `engine-tests`, `artifact-freshness`, `fresh-clone-bootstrap`, `script-syntax` — and none is a fixture-machine job, matching the C-5 / BR-7.5 closure PLAN cites. `publish.yml` **does not exist at HEAD** at all (it is a file this feature creates, tag-triggered per TSPEC §8). So no stated file runs the fixture-machine legs. §7's description remains accurate.

Both still-open errata are correctly attributed to TSPEC, and §7 no longer says "three... two are against TSPEC, the third against FSPEC" — it now says two, both against TSPEC, which is what the tree shows.

**Graph and manifest.** Unchanged by construction: T16 is the only task row in the diff, and its `Batch` (2) and `Deps` (T01, T03) cells are byte-identical across the edit. No row added, removed, re-batched or re-scoped, so the batch arithmetic, histogram and ownership bijection I re-derived in round 4 carry forward untouched. T16 gains no new file ownership, so no same-batch same-new-file collision can have been introduced.

**Citation spot-check.** T16 attributes the transcribed-list rule to "TE round-4 F-03". That is a real finding — my own `CROSS-REVIEW-test-engineer-FSPEC-v4.md` F-03, on AT-3.8a's count conjunct being wired against `len(actual)` — and the use here matches what it asked for. The cross-document round-4 reference is to the FSPEC review, not the PLAN review (whose round 4 had only F-01 and F-02); the citation is right, though a reader tracing "TE round-4" inside a PLAN row could reasonably look in the wrong file first.

## Findings

**No new findings.** The delta introduced no defect, and the re-grounding surfaced no staleness.

Two Low findings from round 4 remain open in the document. They are **carried forward, not re-filed and not re-litigated** — this was a scoped erratum round, and the revision says plainly that no round-4 cross-review finding is addressed here, which is the correct discipline for an erratum edit. I record them only so the count stays honest about the document's state:

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | *(Carried forward from round 4, unaddressed by design.)* DoD items 14/15 justify the fixture-machine gate by saying AT-2.1, AT-2.4 and AT-2.5 have no observer outside T50, but §2.1 names hermetic carriers for all three. Only AT-2.3 and AT-2.6 are genuinely T50-only. The gate is right; the justification is overstated, and a reader reconciling the two passages may wrongly conclude the gate is over-built. One-sentence fix, keeps the gate exactly as is. | §7 items 14, 15; §2.1 |
| F-02 | Low | Local | *(Carried forward from round 4, unaddressed by design.)* T50's capability predicate does not distinguish "probe ran and reported the capability absent" from "probe could not run at all"; only the second is declared a failure, leaving one state unnamed. The implementer needs to be told which way `docker version`'s non-zero exit routes. | §2, T50 clause (i) |

Neither blocks. Both are one-sentence edits to otherwise-correct text, and neither touches the graph, the traceability transpose, or any floor.

## Questions

None. Round 4's Q-01 (T59's eight-batch red interval) was not re-opened here and remains a question for the implementer rather than the plan.

## Positive Observations

- **The erratum was discharged at the source, not annotated around.** The cheap fix would have been to leave AT-3.8a's literal in place and have T16 say "prefer the TSPEC". Instead the FSPEC *removed* the duplicated member list and named the single downstream source, so the divergence cannot recur — there is no second copy left to drift. That is the same move round 3 made on §2.1's carve-out, and it is the one that actually retires a class of defect.
- **The ownership split is now stated at all three altitudes and they agree.** REQ AC-1.3 states the split abstractly (classes and counts in the FSPEC, member names in the TSPEC), FSPEC §5.2/AT-3.8a owns the classes and the 23/24 count, TSPEC §5.4 owns the member names and *derives* the total from its own rows. I checked all three at HEAD and re-summed the derivation. They agree, and each side owns exactly one thing — so the reciprocal co-change obligation is enforceable rather than aspirational.
- **The count conjunct kept its falsifiability through the rewrite.** It would have been easy, while removing the literal, to let the count collapse to `len(actual)` — which passes for free once set-equality passes. Both the FSPEC and T16 explicitly forbid that and pin the count to the transcribed list, so the conjunct still has a state in which it goes red. The remedy from my FSPEC F-03 survived transit into the PLAN intact.
- **§7 records the discharge instead of quietly renumbering.** The paragraph states it was three errata when v0.4 was written, names which one closed and why, and keeps the two that remain with their full mechanism descriptions. A reader of §7 alone can tell what changed and what still blocks Phase I — and I was able to falsify the "still open" half against the tree in two greps.
- **The scoping discipline held.** The diff is four regions. No row was added, removed, re-batched or re-scoped, no round-4 finding was opportunistically swept in, and the batch cells are byte-identical. An erratum round that also "just fixes" two Lows is an erratum round whose blast radius nobody can bound.

## Recommendation

**Approved with minor changes**

The delta resolves the raised item and breaks nothing previously approved.

The raised item is **discharged at the upstream source**: FSPEC AT-3.8a's "the manifest, `bin/pdlc.mjs`, the twelve named `lib/*.mjs` modules" literal is gone from HEAD, replaced by a pointer to TSPEC §5.4's `PK-*` table as the single source the verifier transcribes, with the classes and the 23/24 count retained FSPEC-side as the change-control point. **T16's block therefore lifts correctly** — the row transcribes now, reads the two-sided source, and asserts the count against the transcribed list rather than the tarball's own length, so the conjunct remains falsifiable. I re-derived TSPEC §5.4's total from its `PK-*` rows (4 + 15 + 3 + 1, plus the licence 0-before/1-after) and it sums to 23/24 on both sides.

The re-grounding is sound where it mattered most. FSPEC moved three versions while the PLAN edited two regions, so I re-derived the §2.1 ↔ FSPEC acceptance-criterion set-equality mechanically rather than trusting it: **35 ids on each side, sets identical, zero disagreements**. Nothing was added, removed or renumbered in the `AT-` namespace, so the transpose approved in round 4 still holds. The lineage header's four versions match each upstream's own version cell at HEAD.

I also re-checked the two errata §7 still declares open, against the tree rather than the prose, because TSPEC itself moved: `node.below-floor` is genuinely absent from `lib/catalogue.mjs`, and TSPEC v0.12's new `node:18-alpine` row names a *runtime* for AT-2.5, not an *emitter* for the catalogue id — so T45's erratum is untouched. `pr-tests.yml` has exactly five jobs and none is a fixture-machine job, and `publish.yml` does not exist at HEAD — so T50's erratum is untouched. §7's count of two, both against TSPEC, is accurate.

Nothing previously approved is broken: the graph is byte-identical in the cells that define it (T16's batch and deps unchanged), no row was added, removed, re-batched or re-scoped, the ownership manifest is untouched, and no same-batch same-new-file collision can have been introduced.

Two Low findings from round 4 remain open and are carried forward unaddressed — correctly so, since an erratum round should not sweep in unrelated findings. Neither gates: the DoD items 14/15 justification is overstated relative to §2.1's hermetic carriers, and T50's capability predicate still leaves "probe reports absent" and "probe cannot run" indistinguishable. Both are one-sentence edits whenever the PLAN next opens for its own reasons.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:a59bb90cbf90d3df2a0425a4e2f7e8f732e3305ed0301a70e18a9e3a7b0719aa
APPROVAL-HASH-NORMALIZED: sha256:9659b0b277e1229a919e7660b5989a59b4e12b1201ffda6889fddf4c12730f61
REVIEWED-COMMIT: 4097aec7db2db9f3554c8ff4e4f048d06fad2822
