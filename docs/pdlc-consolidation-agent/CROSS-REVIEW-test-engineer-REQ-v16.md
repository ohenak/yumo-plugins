# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 16
**Scope:** Local (Scope tags per finding below)
**Delta base:** `7c1e0cfb` (the tree v15 reviewed) → HEAD `760ae1c6` — **empty diff on this document**

## Delta

**The document did not change.** `git diff 7c1e0cfb..HEAD --
docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is **empty**, and the stronger check
agrees: `shasum -a 256` of the REQ at HEAD is
`c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0`, byte-for-byte the
`APPROVAL-HASH` I pinned in v15 (`CROSS-REVIEW-test-engineer-REQ-v15.md:199`). So the bytes in front
of me at iteration 16 are the *same bytes* my v15 approval was computed over — not a revision that
happens to look similar, an identity.

That determines the scope of this review entirely. The delta protocol says scan only what changed;
nothing changed, so there is no changed section to scan and no new-issue surface to open. Re-reading
sections I approved at v14 and re-confirmed at v15 would be re-litigation, which the protocol
forbids and which is also how a converging loop stops converging.

What I did check, because a zero-delta document can still be invalidated by the world moving under
it:

| Check | Command | Result |
|---|---|---|
| Did this REQ move? | `git diff 7c1e0cfb..HEAD -- …/REQ-…md` | empty |
| Do the approved bytes still hash to the approval? | `shasum -a 256` | matches `APPROVAL-HASH` at v15 |
| Did the cited shipped code move? | `git diff --stat 7c1e0cfb..HEAD -- pdlc/` | only `skills/{pm,se,te}-author/SKILL.md`, +18 each |
| Did the governed constraint files move? | `git diff --stat 7c1e0cfb..HEAD -- docs/_constraints/` | empty |

The one non-empty row is the three SKILL.md files. Those are **authoring-role prompts**, not any
mechanism this REQ cites: no `file:line` claim in the document resolves into `pdlc/skills/`, so a
change there cannot falsify a citation I verified. Every mechanism the REQ *does* cite —
`orchestrate-dev.js`, `runtime-adapter.js`, `nudge-consolidation.sh`, `check-req-size.sh` — sits in
the untouched remainder of that diffstat, which means the citations I printed at v15 cannot have
drifted since. That is a structural argument, not a spot-check: an empty diff over the files
containing every cited line is stronger evidence than re-printing three of them would be.

`docs/_constraints/` being empty likewise settles both carried constraint-file findings mechanically
— F-54 and F-55 are open at exactly the state v15 left them, because neither the baseline file nor
the vocabularies file moved.

## Findings

**No new findings.** With an empty diff there is no changed text to find a defect in; the four
findings below are carried verbatim from v15, ids never renumbered, each re-checked against the tree
at HEAD rather than copied on faith.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-57 | Low | Local | **Open — unchanged.** §4b's erratum paragraph still ends at "permissions or an IO error" (`:604-607`) without saying whether an unreadable basename counts toward the volume test. The retry decision itself is right — an unreadable entry is omitted from the consumed pair and re-attempted — but it makes such a file a *permanent* member of the un-consolidated set, so at `k >= volumeThreshold` permanently-unreadable files schedule a pass per tick that can consume none of them. One sentence picks either answer; excluding the basename from the *count* while keeping it in the *set* closes it. A PROPERTIES author cannot state the termination property for that case without it. | REQ §4b (`:604-607`), REQ-CONS-01 step 2 |
| F-54 | Low | Cross-Feature | **Open — unchanged, re-measured.** `pdlc-advisory-corpus-baseline.md:7` still reads `Version \| 1.0 · 2026-08-06`, and the clause making an unbumped content change a defect ("Consumers cite this file **at its `Version`**; a content change not accompanied by a version bump is itself a defect") is still in the same change-control paragraph. The REQ still pins the unbumped `1.0`. `git diff --stat 7c1e0cfb..HEAD -- docs/_constraints/` is empty, so this is exactly as v14 and v15 left it. Fix unchanged: bump to `1.1`, repin the REQ's two citations. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7`; REQ `:226`, `:472` |
| F-55 | Low | Local | **Open — unchanged.** §4b's set-equality sentence still fixes the oracle's range by version pin alone — "set-equality over every enumerated row this REQ owns — §1, §2 and §4 entire at Version 1.4" (`:589-593`) — without naming `pdlc-consolidation-vocabularies.md` in that sentence, while the ownership sentence above it spans both governed files. The two files carry *different* versions at HEAD (vocabularies `1.4`, baseline `1.0`), so the pin does disambiguate; it just makes a downstream test author cross-read two files to learn which enumeration to transcribe. Naming the file in the classification sentence is the whole fix. | REQ §4b (`:589-593`) |
| F-56 | Low | Process | **Open — measurement re-taken, identical.** `wc -l -c` at HEAD: **674 lines / 64,397 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — still **2,957 bytes over** the byte ceiling, lines still inside. Unchanged because the document is unchanged. Severity stays Low because enforcement is unchanged: the hook emits a `PostToolUse` `additionalContext` line and exits 0 on every path, so it cannot fail a build or halt the pipeline. Recorded so whoever lands F-54/F-55 knows the budget is spent; cheapest recovery is relocating REQ-CONS-01 step 1's justification prose into the governed vocabularies file the REQ already cites by version. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42` |

**Why no finding is escalated on re-observation.** A carried Low does not accrue severity by
surviving a round. `DEC-SEV-01`'s test is whether the gap leaves a downstream author unable to
decide *today*, and for all four the answer is still no: F-54 and F-55 are citation hygiene that a
PROPERTIES author can route around by reading the governed file directly, F-56 is a warn-only
ceiling with no gate behind it, and F-57 blocks only the termination property for a state
(`>= volumeThreshold` simultaneously unreadable on-disk corpus files) that no reachable state at
HEAD produces — all five corpus files read fine. Inflating any of them to Medium to force another
round would be using severity as an attention mechanism, which the review contract explicitly
forbids.

**Why the zero delta does not itself become a finding.** A document arriving at a review round
unchanged is sometimes a signal that an author ignored the round. It is not that here: v15 was a
*delta confirmation* of a bounded erratum round and returned **Approved with minor changes** with 0
High and 0 Medium — nothing in it obligated an edit. All four open items are Low, and Low findings
are explicitly landable later. An author who changed nothing did exactly what the verdict asked for.

## Questions

| ID | Question |
|---|---|
| Q-02 | Carried from v15, still non-blocking and still addressed to the PROPERTIES layer rather than to this REQ. The v2.1 erratum converted an equality that had been claimed as structural into one that must be *observed*: the hook's enumeration ≡ the pass's enumeration over the two globs. The natural oracle is a property test that generates a docs tree — tracked, untracked, `.gitignore`d, staged-but-deleted, nested deeper than one level, and under `docs/discarded/` — and asserts the two enumerations return the same basename **set**. Both mechanisms are pure functions of the tree, so this parameterises cleanly and should not be example-based. Should PROPERTIES carry it as a property with those six generators named? Set-equality matters specifically here rather than containment: the failure mode this guards is one enumeration *dropping* a basename the other keeps, which a containment assertion would pass. |

## Positive Observations

- **The document is byte-identical to the bytes I approved, and I proved it rather than assumed it.**
  `shasum -a 256` at HEAD returns the exact `APPROVAL-HASH` recorded at
  `CROSS-REVIEW-test-engineer-REQ-v15.md:199`. This is what the tier-1 approval anchors exist for:
  an approval pinned to bytes lets a later round re-establish its own premise in one command instead
  of re-reading 674 lines and hoping. It is worth naming as a positive because the anchor mechanism
  is easy to treat as bookkeeping, and this round is a case where it did real work.
- **The empty `docs/_constraints/` diff makes two carried findings decidable without judgment.** F-54
  and F-55 are both about governed constraint files; neither file moved, so their status this round
  is a mechanical consequence rather than a re-assessment. A finding whose open/closed state can be
  settled by a diffstat is a well-formed finding.
- **The one non-empty code diff is provably out of range.** The three changed files are
  `pdlc/skills/{pm,se,te}-author/SKILL.md`, +18 lines each. No `file:line` claim in this REQ resolves
  into `pdlc/skills/`, and every mechanism it does cite lives in the untouched remainder — so the
  citations verified at v14 and v15 are structurally still true, not merely un-refuted.
- **The erratum's oracle-preserving choices continue to hold.** §4b still refuses an `unread:` field
  and still holds `§3` at `Version 1.4` (`:596-598`), which keeps the fixed expected value that the
  set-equality oracle at `:589-593` gives a downstream test to transcribe. Every round that leaves
  that pin alone is a round in which no downstream transcription has to move.

## Recommendation

**Approved with minor changes** — 0 High, 0 Medium, 4 Low.

The question this round was asked: are my own blocking findings resolved, and did the revision break
anything? There were no blocking findings to resolve — v15 closed at 0 High and 0 Medium — and there
was no revision, so nothing could break. The REQ hashes to the bytes I approved.

- **Nothing regressed**, and the argument is structural rather than a spot-check: an empty diff on
  the document, an empty diff on `docs/_constraints/`, and a `pdlc/` diff confined to three
  authoring-role SKILL.md files that no citation in this REQ resolves into.
- **Four Low findings remain open** — F-54, F-55, F-56, F-57 — each carried verbatim and re-checked
  against HEAD. None blocks the next layer; the approval bar is High/Medium and neither is present.
- **No finding was escalated for surviving a round.** Severity tracks the decision a downstream
  author cannot make today, not the number of rounds a nit has outlived.

Landing order, unchanged from v15 and still small enough to land together:

1. **F-57** — one sentence at §4b or REQ-CONS-01 step 2 saying whether an unreadable basename counts
   toward the volume test. Still the one I would ask for if I could ask for exactly one: without it a
   PROPERTIES author cannot state the termination property for the pathological case.
2. **F-55** — name `pdlc-consolidation-vocabularies.md` in §4b's classification sentence, so the
   oracle's range is readable in one file.
3. **F-54** — bump `pdlc-advisory-corpus-baseline.md` to `Version 1.1` and repin the REQ's two
   citations. Seven characters.
4. **F-56** — the REQ is 2,957 bytes past a warn-only ceiling. Not a blocker; do plan the relocation
   before the next round that adds prose.

If Phase R closes without them, none blocks the next layer. I would, however, note that a document
arriving unchanged at iteration 16 with only Low findings open is a converged document: further
review rounds on unchanged bytes cannot produce new information, and the four items above are better
landed as a single small edit than pursued through additional rounds.

**No upstream defects.** REQ is the root document of this feature; nothing upstream of it exists to
be wrong. No ERRATUM lines are emitted.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0
REVIEWED-COMMIT: 760ae1c64cf3c6152838d2928bac89422f8623fd
