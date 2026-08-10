# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 18 (delta re-review over the DOD G/H/J anchor sweep)
**Scope:** Delta only — the citation re-anchoring landed since v17's reviewed commit. No re-review of sections untouched by that delta, except where a changed anchor's own claim class forced a check of its siblings.

## Delta examined

`git diff 54a46433..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` — four hunks across three commits (`a731c101`, `167bb5f9`, `39001869`), all of one kind: **`file:line` citation re-measurement**, plus the proposal-file path `{date}` → `{passId}`.

Changed anchors: `consolidate-learnings/SKILL.md` `:54→:75`, `:35→:56`, `:43→:64`; `harvest-learnings/SKILL.md` `:70-78→:70-79`.

Because the delta's entire subject is anchor correctness, I verified every changed anchor against HEAD, and then every anchor of the same class that the sweep did not touch. That second step is in scope: a re-measurement pass is judged on whether it re-measured.

## Verified clean (the delta's own edits)

Every anchor the sweep changed resolves correctly at HEAD. I checked each by reading the cited line, not by trusting the commit message:

| REQ cite | Claim | HEAD line | |
|---|---|---|---|
| `consolidate-learnings/SKILL.md:75` | the four-column proposal table | `\| Source LEARNINGS \| Target skill \| Proposed change \| Rationale \|` | correct |
| `consolidate-learnings/SKILL.md:56` | the boundary step | `1. **Find the boundary.** …` | correct as a *step* pointer (see F-05) |
| `consolidate-learnings/SKILL.md:64` | log records date, consumed, promoted, deferred | `6. **Record the pass** in \`.consolidation-log.md\`: date, which LEARNINGS files were consumed, what was promoted, what was deferred.` | correct |
| `harvest-learnings/SKILL.md:70-79` | metadata table incl. `Phases exercised` | table runs `# LEARNINGS` (70) → `\| DoD rounds \|` (80); `Phases exercised` at 78 | correct |
| `CONSOLIDATION-PROPOSAL-{passId}.md` | path form | SKILL.md:70 defines `passId` as `{YYYY-MM-DD}-{n}` | correct, and the per-day ordinal justification is now in the SKILL rather than implied |

The `{date}` → `{passId}` rename is the substantive win here: two same-day passes previously collided on one filename, and the REQ now names the same identifier grammar the SKILL defines.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The re-anchor pass stopped mid-sentence.** §5's In-scope paragraph names five citers in one continuous sentence; the sweep corrected two and left three stale *in the same sentence*. Verified at HEAD: the basename predicate is at `nudge-consolidation.sh:74` (`if os.path.basename(p) not in legacy and os.path.basename(p) not in block_lines]`), not `:41` (`start = rest.find("<!-- pdlc:consumed", pos)`, inside `region_split`); the corpus glob is at `:60` (`CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")`), not `:28` (a comment line); `resolveAdvisoryRung` is at `orchestrate-dev.js:2060`, not `:1833` (`// Module-level, not main() parameters:`). A reader following any of the three lands on unrelated text. Fix: re-measure `:41`→`:74`, `:28`→`:60`, `:1833`→`:2060` here and at every other occurrence (`:41` recurs at REQ lines 80, 93, 117, 559, 620; `:28` at 119, 124, 128). | §5 In scope (REQ:617-626) |
| F-02 | High | Cross-Feature | **Every `orchestrate-dev.js` anchor is off by a uniform +227 lines.** Not drift in one cite — one insertion above them all, never re-measured: `guardVerdict` `:732`→**959**; `MODEL_ADVISORY`/`_FALLBACK` `:1652-1653`→**1879**; `ADVISORY_SEAMS` `:1669`→**1896**; `resolveAdvisoryRung` `:1833`→**2060**; `advisorySummaryRows` `:2708`→**2935**. Separately `:8669`/`:8690`, cited for a pathspec-less `git commit -m`, now land on PLAN cycle detection (`throw haltError("Error: PLAN dependency graph contains a cycle …")`) — a different subsystem entirely. The constant offset makes this cheap to fix and cheap to verify: add 227 to each, then re-read. Correct as shipped and needing no change: `MERGE_GUARD_DEFAULTS` `:48-53`, `nudge-consolidation.sh:25` (`THRESHOLD = 5`). | REQ:229, 233, 301, 320, 501, 663, 679 |
| F-03 | Medium | Process | **The anchor warranty was scoped by file type, not by citer.** `167bb5f9` reads "widen the SKILL-anchor warranty to **every citer**", and `39001869` "re-measure the harvest SKILL anchor family, sweep **both** SKILLs" — but "every citer" was implemented as every citer *of a SKILL.md*, leaving the `.js` and `.sh` citers of the same claims untouched (F-01, F-02). Three DOD rounds (G, H, J) each re-measured the same file class. A sweep of line-number citations must enumerate targets by **cited file**, not by cited file's extension; a repo-wide grep for `\.(md\|js\|sh\|mjs\|py):[0-9]` in the artifact would have produced the full set in one pass. | commits a731c101, 167bb5f9, 39001869 |
| F-04 | Medium | Local | **The erratum changelog no longer describes the document.** The version row still reads `2.2` and the v2.2 note still reads "Two targeted corrections, **nothing else changed**" — yet five citation edits and a path rename landed after v2.2 across three commits, recorded in no erratum row. v17 credited this header as "an accumulating usable changelog"; that property has lapsed. Fix: bump to 2.3 with an erratum row naming the anchor re-measurement and the `{date}`→`{passId}` rename, or restate v2.2's "nothing else changed" to cover them. | REQ:17-22 |
| F-05 | Medium | Local | **No anchor declares which epoch it was measured against, and the document now mixes two.** REQ:78 asserts "Two definitions exist **at HEAD** and disagree", then quotes `pending = [p for p in learnings if os.path.basename(p) not in logtext]`. Neither holds at HEAD: this feature's implementation already landed, `SKILL.md:56` already states the block/legacy basename predicate, and the quoted one-line hook predicate no longer exists (it is now the two-region test at `:74`). The re-anchor pass pointed `:56` at *post*-implementation text while the surrounding prose describes *pre*-implementation state, so anchors in one sentence now belong to two different epochs with nothing marking which. Fix: state the convention once ("code anchors are measured at {sha} unless marked") or convert the problem-statement quotes to past tense. | REQ:78-84 |
| F-06 | Low | Local | **v17 F-01 is unresolved.** AC-3.8b still enumerates `CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5, AC-5.4)` while AC-3.4 and FSPEC §5.3 carry three causes. Adding `, AC-6.3` closes it. Non-gating; no behaviour turns on it. Carried forward unchanged, not re-litigated. | AC-3.8b (REQ:313) |
| F-07 | Low | Local | **`orchestrate-queue.js:1576` lands in the docblock, not the definition.** `commitQueueRow` is defined at `:1583`; `:1576` is prose inside the preceding comment. The comment does describe the two-call pathspec shape the REQ cites it for, so the claim is true and only the anchor is imprecise. Same class as F-02; fold into that sweep. | AC-3.8b (REQ:318) |

## Questions

## Positive Observations

## Recommendation

## Verdict
