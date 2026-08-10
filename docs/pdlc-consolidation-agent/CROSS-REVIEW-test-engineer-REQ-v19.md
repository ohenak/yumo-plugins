# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.3)
**Date:** 2026-08-10
**Iteration:** 19
**Scope:** Local (per-finding below)
**Delta base:** `39001869` (the tree reviewed at v18) → HEAD

This is a delta re-review of the v2.3 anchor-epoch sweep — the revision that answers v18's
F-61, F-62, F-63, F-55, F-57 and F-59. 45 insertions / 39 deletions in one file across
seven commits (`0cca9502`…`c93f5032`). The delta question is the same one v18 asked and the
sweep now claims to have answered at set scope rather than paragraph scope: **did every
citation family actually move, and did the sweep break anything previously approved?**
Every anchor below was re-measured at HEAD.

## What changed

Seven commits, one document. The version row moves `2.2 · 2026-08-09` → `2.3 · 2026-08-10`,
the v2.1 and v2.2 erratum notes are retired into a single v2.3 note plus a new standing
**"Code anchors: one epoch"** preamble that pins every `file:line` to the post-`b22834b7` tree
and commits to naming the *role* a line plays. That preamble is the right durable fix for the
v18 F-60 process finding: it makes the anchor set a re-measurable unit rather than a set of
independently-rotting strings.

I re-measured all 31 code anchors the REQ carries. Resolved families:

| REQ claim | HEAD state | Correct |
|---|---|---|
| `nudge-consolidation.sh:73-74` — pending filter | `:73-74` is exactly the `legacy`/`block_lines` basename test | yes |
| `nudge-consolidation.sh:60` / `:60-61` — `CORPUS_GLOBS` | `:60` is `CORPUS_GLOBS = (…)`, `:61` the `glob.glob` comprehension | yes |
| `nudge-consolidation.sh:63` — log path | `:63` is `log = os.path.join(proj, "docs", "_decisions", …)` | yes |
| `nudge-consolidation.sh:67-68` — whole-log read | `:67-68` is the `open(log …)` / `fh.read()` pair | yes |
| `nudge-consolidation.sh:85-87` — emit-and-exit tail | `:85-86` `print(json.dumps(…))`, `:87` `sys.exit(0)` | yes |
| `runtime-adapter.js:941` (`rtListFiles`), `:951` | `:941` is the declaration, `:951` the `ls -p -A … \| grep -v '/$'` line | yes |
| `orchestrate-dev.js:2060` `resolveAdvisoryRung`, `:2086` fallback line, `:1879-1880` rungs, `:1896` `ADVISORY_SEAMS`, `:2935` `advisorySummaryRows`, `:9476`/`:9497` `commitPaths`, `:959` `guardVerdict` | each lands on the named symbol or line | yes |
| `orchestrate-queue.js:1583` `commitQueueRow`, `:1584` add, `:1587-1592` commit, `:1622` `commitAdvisoryRecord` | each exact | yes |
| `QUEUE.md:304` | `:304` is the self-modification-guard bullet | yes |

Unchanged-and-still-correct anchors I spot-checked rather than assumed: `nudge-consolidation.sh:25`
(`THRESHOLD = 5`), `:4` (header), `orchestrate-dev.js:48-53` (`MERGE_GUARD_DEFAULTS`, four paths),
`consolidate-learnings/SKILL.md:56` and `:64` and `:75`, `harvest-learnings/SKILL.md:70-79`,
`hooks.json:3`/`:14`/`:29`, `QUEUE.md:11`. All resolve.

`docs/_constraints/` did not move in this delta (`git diff --stat 39001869..HEAD -- docs/_constraints/`
is empty), so the two version pins the REQ carries stay decidable without re-judgment.

## Findings

**0 High.** Six of v18's seven findings are resolved and verified at HEAD. One new Medium: the
sweep claimed set scope but one paragraph was still swept at sentence scope. Three Lows carried
and re-measured.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-64 | Medium | Local | **AC-3.8's guard paragraph is half-swept, and the v2.3 note's "as a set rather than paragraph by paragraph" claim is falsified by it.** The sentence at `:304-306` re-anchored `guardVerdict` (`732` → `959`, correct) but left four sibling bare-colon anchors in the *same two sentences* at their pre-`b22834b7` values. Measured at HEAD: `effectiveGuardPaths` is `orchestrate-dev.js:936`, not `:709` (`:709` is a blank line); Phase MERGE's ladder guard is `:1064-1065` / `:1126`, not `:899-900` (`:899` is `const primaryRaw = …` in an unrelated function, `:900` blank); the advisory-envelope `guardVerdict` call is `:2370`, not `:2143` (`:2143` is a lone `*` inside a doc comment); the refusal is `:1659` (`if (config.mergeMode === "off") return skippedOutcome(2, …)`), not `:838` (`:838` is an `observeCi` comment). Only `mergeMode: "off"` at `:61` still resolves. The *behaviour* the paragraph asserts — that `guardVerdict` is reachable only from those two callers, both deciding about the run's own PR, and that Phase MERGE ships `off` — is **still true at HEAD**: I re-derived it from `grep -n "guardVerdict("`, which returns exactly the declaration plus those two call sites. So this is coordinates, not substance, which is why it is Medium and not High. Fix is mechanical: `709 → 936`, `899-900 → 1064-1065`, `2143 → 2370`, `838 → 1659`, and add the role name each anchor's own preamble now promises ("the guard-path resolver", "Phase MERGE's ladder", "the advisory-envelope check", "the `mergeMode: off` refusal"). | REQ `:304-306`; `orchestrate-dev.js:936`, `:1064-1065`, `:1659`, `:2370` |
| F-56 | Low | Local | **Open — re-measured, moved further the wrong way.** `wc -l -c` at HEAD: **687 lines / 65,991 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **4,551 bytes over**, up 823 from v18's 65,168. Lines have 13 of headroom left. `check-req-size.sh` warns rather than blocks (PostToolUse), so this gates nothing, but the trend is one-directional across four rounds and the line budget is now the binding one. The v2.1/v2.2 note retirement in this delta was the right instinct and did claw bytes back; the new anchor-epoch preamble spent more. F-64's edit is byte-neutral at best — worth pairing it with one compaction. | REQ whole file; `check-req-size.sh:41-42` |
| F-54 | Low | Cross-Feature | **Open — re-measured, unchanged.** `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `Version \| 1.0 · 2026-08-06` and the REQ still pins `1.0` at `:232`/`:504`. The pin is *self-consistent*; the finding is that the file's own change-control clause requires a bump on content change and no content change has occurred, so the pin has never yet been exercised as a test oracle. Decidable outside this REQ. | REQ `:232`, `:504`; `pdlc-advisory-corpus-baseline.md:7` |
| F-60 | Low | Process | **Open, but materially advanced — and F-64 is its third instance.** The durable lesson (v17: an erratum wave corrects upstream and leaves downstream asserting old text; v18: a sweep corrects one citer family and leaves a sibling family) now has a documented counter-measure in the REQ itself — the "Code anchors: one epoch" preamble, which is exactly the right shape because it makes the *whole citation set* the unit of work. F-64 shows the preamble was written but not yet executed against: one paragraph escaped. The process learning to carry into PROPERTIES/TSPEC is that the guarantee has to be **mechanical, not editorial** — a grep-shaped check over `path:NN` in `docs/{feature}/*.md`, set-equality over the enumerated anchors, not "the author swept carefully". | PROPERTIES §13.1, TSPEC §11.5; REQ `:19-21` |

### Prior findings — resolution verified

| Prior ID | Status | Evidence at HEAD |
|---|---|---|
| F-61 (Medium) | **Resolved** | All nine `nudge-consolidation.sh` citation sites re-anchored; `:41 → :73-74`, `:28 → :60`/`:60-61`, `:32 → :63`, `:36-37 → :67-68`, `:47-48 → :85-87`. Each verified line-by-line against the script, not against the commit message. The bracket-matching mis-landing v18 warned about is gone. |
| F-62 (Low) | **Resolved** | `:80` now reads "Two definitions **existed** when this REQ was written, and disagreed", with `SKILL.md:56` correctly labelled "the boundary step". The tense now matches the fact that `SKILL.md:56` at HEAD already states the block/legacy predicate. |
| F-63 (Low) | **Resolved** | Version row `2.3 · 2026-08-10`, and the v2.3 erratum note enumerates the sweep plus the three AC-level corrections. The two superseded notes are retired with a pointer to where their corrections now live. |
| F-59 (Low) | **Resolved** | AC-3.8b `:317` now reads `(AC-3.5, AC-5.4, AC-6.3 — set-equal to AC-3.4's causes)`; AC-3.4 `:276` reads `(AC-3.5, AC-5.4, AC-6.3)`. Set-equal, and the REQ now says so in words, so a downstream oracle can transcribe one list and assert against both. |
| F-55 (Low) | **Resolved** | §4b `:599-600` now names `docs/_constraints/pdlc-consolidation-vocabularies.md` explicitly beside the `Version` 1.4 pin. `:7` of that file reads `1.4 · 2026-08-06`. |
| F-57 (Low) | **Resolved, and well** | §4b `:616-619` now states that an unreadable basename **stays in the un-consolidated set and still counts toward AC-1.2's volume trigger**, and adds the termination consequence explicitly: an entirely-unreadable corpus still fires the trigger and still terminates, each pass reporting a terminal row with nothing consumed. That last clause is the property a PROPERTIES author needed and could not have derived — it turns a potential non-termination question into a stated, testable invariant with a positive oracle (terminal row present, consumed set empty) rather than an absence-only one. |

## Questions

| ID | Question |
|----|---------|
| Q-05 | **New, and F-64 makes it concrete.** The "one epoch" preamble is a promise the document makes about itself, and the only thing checking it today is a reviewer reading every anchor by hand — which is how F-64 survived a sweep that explicitly aimed at it. Is a DoD-time grep-shaped check worth a row: extract every `` `path:NN` `` and `` `:NN` `` continuation from `docs/{feature}/*.md`, resolve each against HEAD, fail on any that lands on a blank line, a comment, or a line whose text does not contain the named role token? It fails the right way — loudly, on a line number, no judgment call — and it is the mechanical form F-60 has been asking for across three rounds. Process-scoped, non-blocking. |
| Q-04 | Carried from v18, now partly answered. The preamble's "names the *role* the line plays" convention is the machine-extractable half of what Q-04 asked for: a role token beside a line number is greppable in a way a bare `:NN` is not. The open half is that the convention is applied unevenly — the `nudge-consolidation.sh` family carries roles ("the pending filter", "the whole-log read", "the emit-and-exit tail"), the `orchestrate-dev.js` guard family in F-64 carries none. Uniform application is what would make Q-05 implementable. |
| Q-03 | Carried, still non-blocking, still PROPERTIES-layer. AC-3.4's "so on this path no proposal file exists to record into" (`:276-277`) is absence-shaped. A fixture asserting `not exists(CONSOLIDATION-PROPOSAL-…)` on the AC-3.4 path would go red on a conforming pass that also carries an AC-5.4 or AC-6.3 cause — and v2.3's set-equalisation of AC-3.8b makes that co-occurrence *more* visible, not less. The oracle a PROPERTIES author should write is positive and conjunctive: PR opened, `pr:` field present in the terminal log row, **and** no independent proposal cause held on that run. Worth one line of convention in the REQ preamble. |
| Q-02 | Carried from v15/v16/v17/v18, unchanged by this delta: does the hook's enumeration and the pass's enumeration get a generator-driven **set-equality** property over a synthetic `docs/` tree (tracked, untracked, gitignored, staged-but-deleted, nested, `docs/discarded/`)? REQ-CONS-01 step 1 states the two mechanisms and the two classes on which they would disagree, so the expected set is transcribable from the spec rather than derived from either implementation. Set-equality, not containment — the failure mode is one enumeration dropping a basename the other keeps, which containment cannot see. |

## Positive Observations

- **The sweep's re-measurements are exact everywhere it reached — 27 of 31 anchors.** I resolved
  each one at HEAD rather than trusting the seven commit messages, including the ones most likely to
  drift: `runtime-adapter.js:951`'s `ls -p -A … | grep -v '/$'` transcription, `orchestrate-queue.js:1587-1592`'s
  multi-line commit array, and `orchestrate-dev.js:1879-1880`'s two adjacent constants. All land.
- **"Code anchors: one epoch" is the right durable artefact, and it generalises past this feature.**
  A standing preamble that pins the whole citation set to one commit and requires a role name beside
  each line number converts an unbounded editorial obligation into a bounded, checkable one. It is
  the first structural answer F-60 has received in three rounds. F-64 is a gap in *executing* it, not
  a defect in the idea.
- **F-57's fix went past what was asked and closed a termination question.** The finding asked only
  that the REQ decide whether an unreadable basename counts toward the volume trigger. The revision
  decides it *and* states the consequence — an entirely unreadable corpus still fires and still
  terminates, each pass writing a terminal row with nothing consumed. That is a positive, falsifiable
  oracle where a weaker fix would have left a PROPERTIES author writing an absence-only one.
- **Retiring the v2.1/v2.2 notes was correct, not merely tidy.** Their corrections now stand in the ACs
  themselves (REQ-CONS-01 step 1, §4b, AC-3.4, AC-6.3), and the retirement note says exactly where —
  so a reader is never left comparing a note against an AC to work out which one is current. That is
  the failure mode that produced F-59 in the first place.
- **The blast radius was checked rather than assumed.** `docs/_constraints/` did not move, both version
  pins (`1.0`, `1.4`) still resolve against their files, and every AC whose text was untouched reads
  identically to the tree approved at v18 — so nothing previously approved needed re-judgment.

## Recommendation

**Approved with minor changes** — 0 High, 1 Medium, 3 Low.

The delta question was whether the v2.3 sweep landed its own claim and whether it broke anything
previously approved.

- **Blocking findings from v18: all resolved.** F-61's Medium is closed — every one of the nine
  `nudge-consolidation.sh` citation sites now resolves at HEAD, verified against the script rather
  than the commit message. F-62, F-63, F-59, F-55 and F-57 are closed too, with F-57's fix going
  past the finding to close a termination question a PROPERTIES author would otherwise have had to
  invent an answer for.
- **Nothing previously approved regressed.** Every AC whose text this delta did not touch is
  byte-identical to the v18-approved tree, `docs/_constraints/` did not move, and both version pins
  still resolve. The three ACs that did change (AC-3.8b, §4b, REQ-CONS-01 step 1) changed in the
  direction their findings asked for and in no other direction.
- **The gap the sweep did not reach.** F-64 is Medium, not High, on the same two grounds v18 applied
  to F-61: no test oracle keys on a REQ line number, and the *behaviour* the stale anchors describe
  is still exactly true at HEAD — I re-derived `guardVerdict`'s complete call graph from source and
  it is still the declaration plus two callers, both about the run's own PR, with Phase MERGE still
  shipping `off`. Only the coordinates moved. The fix is four substitutions and four role names:
  `709 → 936`, `899-900 → 1064-1065`, `2143 → 2370`, `838 → 1659`.

F-64 and F-56 want to land together. The document is 4,551 bytes over the byte budget and 13 lines
under the line budget, so the edit that re-anchors AC-3.8's guard paragraph is the natural place to
also recover some of what the anchor-epoch preamble spent. Neither is gating: `check-req-size.sh`
warns and does not block, and no downstream oracle reads either.

**No upstream defects.** REQ is the root document; nothing upstream of it can be wrong. No ERRATUM
lines are emitted from this review.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}
