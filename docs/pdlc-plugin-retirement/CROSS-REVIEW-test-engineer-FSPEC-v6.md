# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.5)
**Date:** 2026-08-17
**Iteration:** 6
**Scope:** delta re-review against `CROSS-REVIEW-test-engineer-FSPEC-v5.md` (reviewed commit `f8283ee3`, `UPSTREAM-STATE: REQ sha256:2ace5ac8…`).

`git diff f8283ee3..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` is **empty** — the FSPEC has not changed. What moved is the **upstream**: `REQ-pdlc-plugin-retirement.md` went v0.9 → v0.10 → v0.11 (`68e72db2`, REQ now sha256:1038b816…), landing exactly the three errata this FSPEC raised in §7.2. So this round is an upstream-drift re-review: the delta under scan is the REQ's, and the question is whether the FSPEC's claims about the REQ, and its ATs' coverage of the changed ACs, still hold at HEAD. Three do not.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **§7.2's three errata are all resolved upstream, so every claim in the section is now false against the REQ at HEAD, and the four in-document pointers into it send an implementer to a defunct authority.** §7.2 opens "Three defects in `REQ-pdlc-plugin-retirement.md` v0.9" (:805) and the header pins "Upstream … (v0.9)" (:9, restated :75). At HEAD the REQ is v0.11: (1) O-3 now states the manifest "does **not** survive for that one row … AC-1.1's set-equality of the `dist/` entry set with `{M-9}` holds without exception", so §7.2(1)'s "the two clauses cannot both hold; the REQ must decide" (:809–815) is stale, as are O-C's "whether the manifest survives for one row" (§7 O-C) and class 7's "the manifest (M-6, TSPEC's O-3 branch)" (:159) — the branch is closed, and a TSPEC that still reads it as open may keep a manifest AC-1.1 now forbids; (2) AC-5.2 now carries the exhaustive allowed set §7.2(2) asked for; (3) C-9 dropped the hand-edited clause and AC-4.3 dropped "or hand-modified", which is §7.2(3)'s ask granted. BR-CLN-3a (:512), E-16a (:575) and AT-5.2 (:770) each justify their position by deferring to "§7.2's erratum" — their substance is now *ratified REQ text*, but the citation points at a section describing the REQ as defective. Fix is subtractive: retire §7.2 (or reduce it to a resolved-log line), repoint :512/:575/:770 at REQ C-9 / AC-4.3 / AC-5.2 directly, close O-C to "which surviving directory holds the probe CLI's build" only, drop ":159"'s conditional branch, and bump the upstream pin to v0.11. | §7.2; §7 O-C; :9, :75, :159, :512, :575, :770 |
| F-02 | High | Local | **AT-5.2 and E-21 exclude five run-variable collections; REQ AC-5.2 at HEAD enumerates eight. A test transcribed from AT-5.2 value-compares `authSources`, `startup` and `loop` and reds on a correct sweep — the exact unpassable-gate defect the REQ erratum removed.** AT-5.2 clause 2 names "dispatches, retries, pauses, denials and per-phase outcomes" (:766–769); E-21 repeats the same five (:581). REQ AC-5.2 names "the per-dispatch auth-source rows (`authSources`), the startup ladder (`startup`), the dispatch counts (`dispatches`), the retry, pause and denial logs (`retries`, `pauses`, `denials`), the loop record (`loop`) and the outcome counts (`outcomes`)" — eight, declared exhaustive, "any field outside it must match exactly". All three missing names are real, run-variable report fields at HEAD: `pdlc/engine/__tests__/report-engine.test.js:34–52` lists `authSources`, `startup` and `loop` among the 18 keys `report.engine` carries, and `:195–198` pins `authSources` and `startup` as per-run collections defaulting to `[]`. Because AC-5.2's set is now exhaustive, the FSPEC's shorter list is not a loose restatement but a contradiction: it makes three fields value-compared that the REQ exempts. Fix: transcribe all eight collection names into AT-5.2 clause 2 and E-21, and keep the "two version fields" as the REQ's engine-version/plugin-version provenance values. | §6.5 AT-5.2; §5 E-21 |
| F-03 | High | Local | **AT-4.3 no longer discharges AC-4.3: the REQ now demands a positive whole-directory survival conjunct that the AT's fixture does not construct, leaving the oracle vacuously satisfiable.** AC-4.3 at HEAD adds "The refusal deletes nothing at all: every expected entry the directory held before the run is still present and byte-identical after it, so the post-refusal directory state is checkable as a whole and not only for the unexpected entry." AT-4.3's Given is only "a file inside the target directory whose name the retired channel never installed" (:733–735); the Then is "every file in the directory is byte-identical afterwards (compared by content, before and after)" (:738–739). Nothing in the Given requires any **expected** entry to be present, so an implementer may fixture the directory with the unexpected file alone and the byte-identity clause passes over a set of one — a step that deleted every expected entry it found would still green, which is the failure AC-4.3's new sentence exists to catch. This is a presence-of-survivors assertion, not a not-modified assertion, and only a fixture holding expected entries can falsify it. Fix, two clauses: Given the directory holds **every L-11 member** *plus* the unexpected entry; Then all nine expected entries are still present and byte-identical, the unexpected entry is byte-identical, its path is on stderr, exit is exactly `3`. AT-4.1's fixture already builds the nine-member directory, so this is a fixture reuse, not new construction. | §6.4 AT-4.3 |

## Resolution of round-5 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (Medium) — E-16b's refusal class is unpinned by any AT, and AT-4.3's fixture clause is stated two non-equivalent ways | **Open, unchanged** — the FSPEC is byte-identical since `f8283ee3`, so the Medium stands as filed. It is not re-raised as blocking here; F-03 above supersedes the AT-4.3 half of it, and an AT-4.3 revision that names the `.pdlc-tmp.<pid>.<rand>` construction as a second fixture would close both at once. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3–v5, still open at TSPEC level: AT-3.3's consolidation-nudge entry does not name the stale-LEARNINGS count at which the nudge fires. `pdlc/hooks/scripts/nudge-consolidation.sh:25` sets `THRESHOLD=5` and `:81` gates on `n >= THRESHOLD`, so a four-file fixture yields silence and an absence-shaped false green. Fixture construction is the TSPEC's; flagged so it is not discovered late. |

## Positive Observations

- **The FSPEC's three errata were all upheld upstream, and none was worked around locally.** §7.2 declined to relax AC-1.1, AC-4.3 or AC-5.2 inside the FSPEC and routed each as `ERRATUM: REQ`; v0.10/v0.11 adopted all three, and in the FSPEC's direction each time (AC-5.2 scoped rather than dropped; AC-4.3's hand-modified case dropped rather than reinterpreted; O-3 closed against manifest survival). The findings above are the cost of that being *late* to the FSPEC's text, not of the reasoning being wrong.
- **BR-CLN-3a's substance now matches ratified C-9 word for word in effect.** "No post-sweep artifact can distinguish it" (:510) is the same mechanism C-9 now gives: "no post-sweep artifact records the hashes that would let anything tell a modified copy from an original". Only the citation is stale — the rule needs no rewrite.
- **BR-CLN-4's exit-status literals still hold at HEAD.** I re-derived `pdlc/hooks/scripts/sync-workflows.sh` exit sites this round: `:687`/`:691` → `4`, `:695`/`:699`/`:714` → `3`, `:718` → `2`, `:722` → `1`, `:725` → `0`. The `3`-not-"non-zero" oracle in AT-4.3 remains the right one and is unaffected by F-03.
- **L-11's nine-member set is unchanged and still literal-exact.** The REQ delta touched nothing under §4.2, and no tenth consumer-side writer appeared at HEAD.

DEFERRED: E-16b's `.pdlc-tmp.<pid>.<rand>` refusal class still has no AT of its own (round-5 F-01, Medium); folding it into F-03's AT-4.3 rewrite as a second construction is the cheapest close.

## Recommendation

**Needs revision**

Three High findings, all of the same shape and all cheap: the FSPEC is correct about a REQ that no longer exists. F-01 is subtractive (retire §7.2, repoint four citations, close O-C's manifest branch, bump the upstream pin). F-02 is a three-name transcription into AT-5.2 and E-21, verifiable against `report-engine.test.js:34–52`. F-03 is one fixture clause borrowed from AT-4.1 plus one positive-survival conjunct. None reopens a decision; each is the FSPEC catching up to a REQ that granted its own errata.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 0, "low": 0}
