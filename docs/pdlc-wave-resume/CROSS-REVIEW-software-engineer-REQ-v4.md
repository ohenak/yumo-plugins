# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** Technical lens; delta re-review of v1.5 against my v3 findings (F-01..F-03).

## Findings Disposition

**Delta base:** v3 reviewed `f256d767`; this revision is `b5715498..1b24056a` (6 commits touching
the REQ), document version 1.4 → 1.5. Every check below was re-run against the **default branch**
(`git show main:pdlc/workflows/orchestrate-dev.js`), because this branch's tree is 1,637 commits
behind and does not carry the mechanism at all (BL-04, §5) — `git rev-list --count HEAD..main`
returns `1637`, so the REQ's own branch-base note is still exact.

| v3 finding | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| F-01 — §1 deleted the gate-mode precondition and asserted the write is guarded by the git transport, not the gate mode | High | **Resolved — and my finding was wrong; the document was right** | See below. The revision keeps the v1.4 claim (correctly) and adds a re-derivable, greppable anchor that names exactly how I misread it. |
| F-02 — OQ-1's grep recipe matched one banner, not two | Low | **Resolved** | Recipe now greps `to force a`: `grep -n "to force a" main:orchestrate-dev.js` returns exactly two hits, `:15331` (complete-record skip, inside the `allWavesRecorded` arm) and `:15342` (mid-plan resume, the `else` arm). `grep -c "to force a full run"` returns `1`, matching only `:15342` — precisely as the new text states, including the reason (the skip banner wraps `to force a ` / `full run.` across `:15331`–`:15332`). The recipe now reproduces what the sentence claims. |
| F-03 — "discard" mis-described item 1, which is never-written, not discarded | Low | **Resolved** | Preamble now reads "**one prevents it from ever being written, two discard what was written** — two shapes, two oracles" (§1). The writer/reader split I asked for is explicit, and the added "two oracles" clause hands FSPEC the reason the split matters. |

### F-01 was a false positive on my part — recorded, because the correction is load-bearing

My v3 High claimed `writeWaveLedger` (`main:pdlc/workflows/orchestrate-dev.js:15600`) is nested
inside **both** `if (scriptGate)` (`:15432`) and `if (waveGit)` (`:15531`), and that a degraded-gate
run therefore records nothing. That is false. The `scriptGate` block **closes at `:15494`**, after
its own `else` arm at `:15492` (`evaluateBatchGate(waveResults, waveIndex, wave)` — the self-report
gate). `if (waveGit)` at `:15531` is a **sibling** of it, not a child.

Mechanical re-check (brace-depth accumulated from `:15432`, counting `{` and `}` per line, which is
the step my v3 check got wrong by not accounting for the `else`):

| Line (`main:pdlc/workflows/orchestrate-dev.js`) | Depth after line | Source |
|---|---|---|
| `:15432` | +1 | `if (scriptGate) {` |
| `:15492` | +1 | `} else {` — the self-report arm |
| `:15494` | **0** | `}` — `scriptGate` block **closed here** |
| `:15531` | +1 | `if (waveGit) {` — opens at depth 0, a sibling |
| `:15600` | +1 | `await writeWaveLedger(` |
| `:15604` | 0 | `}` — `waveGit` block closes |

So v1.4's claim — the write is guarded by the git transport, not by the gate mode, and a
self-report-gate run *with* a transport records normally — is correct at HEAD of the default
branch, and REQ-WVR-09's premise (`:15211-15215`'s "verified but NOT committed" notice path)
stands. v1.5 does not merely restate it: it adds the anchor that makes it checkable in one grep —
the comment `Only now — verified — does anything get committed` (`:15530`, `grep -c` returns `1`,
so it is unique) opening the write's branch, plus the fact that the gate-mode branch "closed at its
own `else` (the self-report arm)". Naming the misreading in the text is the right disposition: the
next reviewer who repeats my arithmetic gets stopped by the document.

## Findings

## Questions

## Positive Observations

## Recommendation

