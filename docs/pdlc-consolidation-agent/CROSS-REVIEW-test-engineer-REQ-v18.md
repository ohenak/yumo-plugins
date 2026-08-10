# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.2)
**Date:** 2026-08-10
**Iteration:** 18
**Scope:** Local (per-finding below)
**Delta base:** `54a46433` (tree reviewed at v17) → HEAD

This is a **delta confirmation**, not a re-review. The delta is a DOD-driven anchor sweep:
7 insertions / 7 deletions in one file, no clause of substance moved. One question — did the
sweep land its own claim, and did it break anything previously approved? Everything below is
measured at HEAD.

## Delta

`git diff 54a46433..HEAD -- REQ-…md` is **7 insertions / 7 deletions across four hunks**, all of
them citation edits under DOD v4's J1 ("re-measure the harvest SKILL anchor family, sweep both
SKILLs"). No AC changed meaning. Every edited anchor re-measured at HEAD:

| REQ line | Edit | HEAD state | Correct |
|---|---|---|---|
| `:41` | `CONSOLIDATION-PROPOSAL-{date}` → `{passId}` | `consolidate-learnings/SKILL.md:70` writes `CONSOLIDATION-PROPOSAL-{passId}.md`, `passId = {YYYY-MM-DD}-{n}` | yes |
| `:43` | `SKILL.md:54` → `:75` | `:75` is exactly `\| Source LEARNINGS \| Target skill \| Proposed change \| Rationale \|` | yes |
| `:81-82` | `SKILL.md:35` → `:56` (×2), plus "— the boundary step" | `:56` is step 1, **Find the boundary** | yes (see F-62) |
| `:244` | `SKILL.md:43` → `:64` | `:64` is step 6, "Record the pass … date, which LEARNINGS files were consumed, what was promoted, what was deferred" — set-equal to AC-2.4's four items | yes |
| `:620` | `SKILL.md:35` → `:56` | as above | yes |
| `:626` | `harvest-learnings/SKILL.md:70-78` → `:70-79` | metadata table spans `:70` (`\| Field \| Detail \|`) to `:79` (`\| DoD rounds \|`); `Phases exercised` is `:78`, inside the range | yes |

Six of six edited anchors resolve. The sweep also did not disturb `nudge-consolidation.sh:25`
(`THRESHOLD = 5`, cited at REQ `:175` and `:573`) — still exact.

Nothing previously approved regressed: the untouched remainder is byte-identical to the v17 tree,
and `docs/_constraints/` did not move (`git diff --stat 54a46433..HEAD -- docs/_constraints/`
empty), so the carried constraint findings stay decidable without re-judgment.

## Findings

0 High. One new Medium — the sweep's sibling gap, visible only because the delta half-swept a
line it edited. Two new Lows, plus the carried Lows re-measured at HEAD.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-61 | Medium | Local | **The sweep stopped at the SKILLs; the `nudge-consolidation.sh` anchor family is stale at HEAD, including on a line this delta edited.** REQ `:620-621` reads "the matching edits to `…/SKILL.md:56`, to `pdlc/hooks/scripts/nudge-consolidation.sh:41` (predicate) and to `:28` (the corpus glob widened to `docs/completed/*/`)" — the SKILL anchor in that sentence was bumped by this delta, the two `.sh` anchors beside it were not. At HEAD (after this feature's own T09 commit `b22834b7`) the predicate is `:74` (`… if os.path.basename(p) not in legacy and os.path.basename(p) not in block_lines`), the corpus glob is `:60-61` (`CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")`), and the log path is `:63`. `:41` is now `start = rest.find("<!-- pdlc:consumed", pos)` inside `region_split`; `:28` is a comment. Nine citations are affected: `:80` (`:41`, and `:32` for the log), `:86` (`:41`, `:36-37`), `:93` (`:41`), `:117` (`:41`), `:119`, `:124`, `:128` (`:28`), `:559` (`:41`), `:620-621` (`:41`, `:28`). Testing impact is bounded — no oracle keys on a REQ line number, and the *behaviour* described at each site is still what the script does — but a PROPERTIES or DoD reader who greps `:41` for the basename predicate finds a bracket-matching loop and cannot confirm the premise the AC rests on, which is precisely the failure J1 was raised to close. Fix is mechanical and same-shape as what the delta already did: `41 → 74`, `28 → 60-61`, `32 → 63`, `36-37 → 64`, keeping the role hint in the parenthetical. | REQ `:80`, `:86`, `:93`, `:117`, `:119`, `:124`, `:128`, `:559`, `:620-621`; `pdlc/hooks/scripts/nudge-consolidation.sh:60-61`, `:63`, `:74` |
| F-62 | Low | Local | **`:81`'s present tense outlived its anchor.** The sentence still opens "Two definitions exist at HEAD and disagree", and the delta re-pointed the second one to `SKILL.md:56` — a line that at HEAD reads "un-consolidated per the block/legacy predicate", i.e. **agrees** with the hook. The added qualifier "— the boundary step" is the right instinct (it makes the anchor name a role, not a verbatim string), but the surrounding claim now contradicts the line it cites. This is a post-implementation artefact, not an error of substance: the disagreement was real pre-feature and is what motivates AC-1.1. One clause — "Two definitions existed at HEAD when this REQ was written" — closes it. Not gating; no downstream oracle reads the tense. | REQ `:80-83`; `consolidate-learnings/SKILL.md:56` |
| F-63 | Low | Local | **Version row and erratum note are silent on this round.** The header still reads `2.2 · 2026-08-09` and the newest erratum note is v2.2's. Seven line edits landed after it with no record. Prior correction rounds each earned a row, so the convention exists and this round skipped it — a later reader diffing v2.2-as-recorded against the file sees seven unexplained changes. Cheapest fix is one line in the existing note ("anchor re-measurement, no clause changed"), which costs nothing against F-56's budget note if F-61 is folded into the same edit. | REQ `:15-22` |
| F-56 | Low | Local | **Open — re-measured, moved the wrong way.** `wc -l -c` at HEAD: **681 lines / 65,168 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **3,728 bytes over**, 24 more than at v17. Lines have 19 of headroom. The hook warns rather than blocks, so this is not gating, but any edit closing F-61/F-62/F-63 should be net-neutral or shrinking, and the v2.1/v2.2 erratum notes are the cheapest bytes to retire once the wave closes. | Whole document; `check-req-size.sh:41-42` |
| F-59 | Low | Local | **Open — unchanged.** AC-3.8b (`:315`) still enumerates `CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5, AC-5.4)` while AC-3.4 (`:272-273`) names three causes `(AC-3.5, AC-5.4, AC-6.3)`. Cosmetic residue of the v2.2 erratum; both lists are supersets of what any test asserts. | REQ `:313-315`, `:272-273` |
| F-54 | Low | Cross-Feature | **Open — re-measured, unchanged.** `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `Version \| 1.0 · 2026-08-06`; REQ still pins `1.0`, so the pin is *consistent* — the finding is that the file's own change-control clause says a content change must bump, and the last content change did not. Decidable outside this REQ. | REQ `:226`, `:472`; `pdlc-advisory-corpus-baseline.md:7` |
| F-55 | Low | Local | **Open — unchanged.** §4b's set-equality pin cites "Version 1.4" without naming `docs/_constraints/pdlc-consolidation-vocabularies.md`, whose `:7` does read `1.4 · 2026-08-06`. The pin is correct; only the referent is implicit. | REQ `:589-593` |
| F-57 | Low | Local | **Open — untouched by the delta.** §4b still says "permissions or an I/O error" without stating whether an unreadable basename counts toward the volume trigger. A PROPERTIES author needs that to state the termination property. Excluding the basename from the *count* while keeping it in the *set* closes it. | REQ `:604-607`, REQ-CONS-01 step 2 |
| F-60 | Low | Process | **Open — unchanged, and F-61 is its second instance.** The v17 finding was that an erratum wave corrects the upstream document but leaves downstream prose asserting the old text. F-61 is the same shape one layer down: a sweep corrects one citer family and leaves the sibling family. The durable lesson is that an anchor sweep's unit of work is *the file's whole citation set*, enumerated and re-measured as a set, not the citations that happen to sit in the edited paragraph — set-equality, not containment, applied to the sweep itself. | PROPERTIES §13.1, TSPEC §11.5, PLAN T18; this review's F-61 |

## Questions

## Positive Observations

## Recommendation

## Verdict
