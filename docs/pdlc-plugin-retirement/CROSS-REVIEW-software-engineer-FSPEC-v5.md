# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 5
**Scope:** delta re-review since `b0d711c7` (v4's basis). Diff read with
`git diff b0d711c7 HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(19 insertions, 12 deletions). Unchanged sections approved in v1/v3/v4 are not re-litigated.

## Disposition of v4's findings

| v4 ID | Subject | Status | Evidence checked this round |
|----|---------|--------|------------------------------|
| F-01 (Medium) | L-11 omitted the channel's crash-residue temp files | **Resolved** | The document took the second of the two offered fixes and took it explicitly: L-11 (§4.2) now names the residue as **not** a member, and new **E-16b** (§5) states the operator-facing consequence — refusal, the stderr path, hand-removal before re-running. The temp-name grammar is as cited: `${dir}/.pdlc-tmp.$$.${RANDOM}` for state/manifest writes (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1444`) and `${destDir}/.pdlc-tmp.$$.${RANDOM}` for artifact copies (`:1658`). See F-02 below for one line of rationale in E-16b that the shipped code contradicts. |
| F-02 (Low) | BR-CLN-4's gloss named two of status `4`'s three producers | **Resolved** | The gloss now reads "usage-error, unrecognised-seam-token and write-failure status". Re-verified against the ladder: usage error `sync-workflows.sh:84`,`:91`; unrecognised `PDLC_FAULT` token `:687`; write failure `:691`. |
| Q-01 (which absences AT-4.1 exercises) | Answered by widening, not narrowing | **Closed** | L-11's absence clause now reads "Any member may be absent" rather than "any of the three", so §3.5 step 1 and L-11 word the same rule over the same domain. The AT still constructs one absence; which further absences earn rows stays a PROPERTIES decision, as it should. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **E-18 is not decidable under BR-CLN-3a's name-only predicate, and BR-CLN-5 can be violated on an expected name.** §3.5 step 2 classifies "by name only … No content is compared and no repo artifact is consulted", and E-16a makes the consequence explicit: an expected *name* is removed whatever its content. E-18 then asserts that a **tracked** file in the target directory is "treated as unexpected: refuse per E-16". Those two cannot both hold: tracked-ness is not a property of the name, so a consumer who committed `.claude/workflows/orchestrate-dev.bundle.js` (an expected name at an expected path) gets it deleted, which is exactly what BR-CLN-5 forbids. This is inherited text, not introduced this round — but the round widened L-11 from 7 names to 9, so the surface on which the collision can fire grew by two. Cheapest fix, and it stays inside the step's "no repo artifact is consulted" spirit because it consults *git*, not the deleted manifest: state in BR-CLN-3a that expectation is name-in-L-11 **and** path-untracked, with `git ls-files --error-unmatch` (or an equivalent index probe) as the decidable test the TSPEC implements. Naming it here saves the TSPEC author from choosing between two FSPEC rules. | E-18; BR-CLN-3a; BR-CLN-5; §3.5 step 2 |
| F-02 | Low | Local | **E-16b's stated reason is contradicted by a shipped namespace reservation in the retired channel itself.** E-16b justifies refusing on `.pdlc-tmp.*` with "no post-sweep artifact proves the residue is junk rather than an operator's file". The retired channel reserved the whole `.pdlc-` prefix for itself and enforced the reservation in two directions: its consumer-directory enumeration drops every `.pdlc-*`-prefixed basename unconditionally (`pdlc/hooks/scripts/sync-workflows.sh:299,323`), and its manifest validator **fails** (`M10`) any `consumerPath` or `retires` entry whose remainder starts with `.pdlc-` (`pdlc/hooks/scripts/lib/pdlc-drift.sh:735`). So an operator file at `.pdlc-tmp.*` is not merely unlikely, it is a name the channel forbade to itself and swept out of its own listing. The **outcome** E-16b picks is still the conservative one and I am not asking to change it; only the reason is short by a citation. Suggest replacing the "could be an operator's file" clause with the honest one: the cleanup declines to encode a grammar (`pdlc-tmp.<pid>.<rand>`) whose match it cannot verify was produced by this channel, and refusal costs the operator one `rm`. | E-16b |

## Questions

| ID | Question |
|----|---------|
| Q-01 | L-11's parenthetical says the two pre-bundle names were removed "only [by] a sync run; a drift-check-only consumer still holds them, reported and left in place". Verified true, and more narrowly than the sentence claims: the retire-delete is additionally gated on the superseding row measuring `in-sync` **post-copy** (`sync-workflows.sh:437-444`), so a sync run that could not verify the new bundle also leaves the legacy file behind. That makes the leftovers more likely in the field, not less — no change needed to L-11, but the TSPEC author should not assume "consumer ran sync at least once" implies the two names are absent. |

## Positive Observations

- **The L-11 widening is the finding I did not file, found by the author.** `orchestrate-dev.js` and `orchestrate-queue.js` are real consumer-side installed names of the retired channel, and the evidence is unambiguous: `RETIRES_BY_ID` maps both under `RETIRED_DIR = ".claude/workflows/"` (`pdlc/workflows/build-runtime.mjs:767-771`), and the built manifest carries them in each row's `retires` and in a top-level `retired` array (`pdlc/workflows/dist/distribution-manifest.json`). Without them, a drift-check-only consumer's directory would have refused the cleanup outright — the exact failure class v3's F-01 was about, at two more names.
- **AT-4.3's Given now excludes the trap it could have fallen into.** "A name outside every L-11 member, so neither `orchestrate-dev.js` nor `orchestrate-queue.js`, which the channel did install" pins the negative construction against the *widened* set. A property author reaching for "a leftover-looking `.js` name" would otherwise have had a coin-flip chance of writing a test that asserts refusal on a name the cleanup must now remove.
- **The count word travelled with the set.** L-11's header `(9)`, its enumeration, and AT-4.1's "all nine are gone" agree; 4 bundles/CLI + 2 pre-bundle + 3 state entries = 9. The count word is what makes AT-4.1 a set-equality rather than a containment check, and it did not drift when the set grew.
- **BR-CLN-4's `3` gloss is now exact in both halves.** "An *unknown* row and two unmet evidence preconditions exited `3`" matches the ladder precisely: repo-root evidence `sync-workflows.sh:695`, unresolved baseline `:699`, unknown row `:714`; then `2` at `:718`, `1` at `:722`, `0` at `:725`. Five terminal statuses, and each producer named this round is a real one.
- **I re-enumerated the `.pdlc-*` namespace independently and found nothing L-11 misses.** A repo-wide sweep of consumer-side `.pdlc-` names yields exactly `.pdlc-backups`, `.pdlc-drift-state`, `.pdlc-sync-manifest` and `.pdlc-tmp` — three in the set, one deliberately excluded with an edge case. There is no fifth name waiting to refuse a real consumer's cleanup.

## Recommendation

**Approved with minor changes**

No High findings, old or new. Both of v4's findings are resolved, and the round's own initiative — widening L-11 to the two retired pre-bundle names — closed a refusal path on real consumers that neither reviewer had filed. F-01 is a rule collision the round did not introduce but did enlarge, and its fix is one clause in BR-CLN-3a; F-02 is a citation swap inside a single edge-case cell. Neither changes a behaviour the TSPEC would implement differently once F-01's clause is written. Fold both into the next edit; this document does not need another review round before TSPEC authoring.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
