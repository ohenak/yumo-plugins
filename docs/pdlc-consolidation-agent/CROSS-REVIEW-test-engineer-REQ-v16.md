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

## Positive Observations

## Recommendation

## Verdict
