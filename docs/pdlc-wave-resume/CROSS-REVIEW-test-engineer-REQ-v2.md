# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review of the v1.0 → v1.3 revision (`0ed6a731..005dc47d`), testing lens

## Verification Method

The v1.3 amendment relocates the REQ's evidentiary base: code claims are declared verified
against **the default branch**, not this branch, which is 1,637 commits behind
(`git rev-list --count HEAD..origin/main` → `1637`). I re-verified every code claim in the delta
against `origin/main` at `345ae358`, reading `git show origin/main:pdlc/workflows/orchestrate-dev.js`
rather than this branch's tree — the same base the document asks its reader to use.

Two mechanical checks worth naming, because they are what the delta's new claims turn on:

- **`.gitignore` anchor (C-1, REQ-WVR-10).** `origin/main:.gitignore:41` carries
  `/.claude/pdlc-wave-state.json`, root-anchored, directly below `/.claude/workflows/` at `:40`,
  with the comment at `:23-:35` explaining why the anchor matters for the checked-in
  covered-violations fixture tree. The claim is exactly true as scoped.
- **The resume decision block.** `origin/main:pdlc/workflows/orchestrate-dev.js` — `WAVE_STATE_PATH`
  is defined near the top of the ledger section, `parseWaveLedger` returns the three-outcome shape
  the REQ describes, and the read/decide ladder runs feature → planHash → ancestry →
  `lastGreenWave > waves.length` → `=== waves.length` → resume, each rejection an `emit` notice and
  a full run. Every branch the REQ's IG catalogue names is present and each announces, and the
  absent/empty/`{}` case is genuinely silent. The catalogue matches the mechanism.

One live-tree observation matters to the delta and is recorded here rather than inferred:
`.claude/pdlc-wave-state.json` **exists in this working copy right now** (161 bytes, mtime
2026-08-21 00:41), recording `feature: "pdlc-advisory-wave-gate"`, `lastGreenWave: 7`, with a
`head` sha. `git ls-files` does not list it, so the untrackedness half of C-1/REQ-WVR-10 holds in
practice as well as by rule.

## Disposition of Round-1 Findings

## Findings

## Finding Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
