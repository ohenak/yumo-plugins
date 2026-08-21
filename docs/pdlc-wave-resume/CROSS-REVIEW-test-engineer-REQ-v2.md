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

All ten round-1 findings are closed. The two blocking ones are closed on their merits, not by
restatement.

| Round-1 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — REQ-WVR-04 unwritable when the manual point is its default | High | **Resolved** | §7 REQ-WVR-04 gains the *Boundary* paragraph: a manual point equal to the plan's first wave is **defined as not an explicit setting**, the automatic determination is consulted, provenance announces as automatic. This matches the shipped ladder exactly (`explicitPointer = startWave > 1`, ledger read guarded by `if (!explicitPointer)`), and the third reading I flagged — a point past the last wave — is now stated too, as a full run announced as such, which is also what the clamp does (the clamp runs *after* `explicitPointer` is computed, so the ledger stays unconsulted). The AT's *When* is now writable in all three cases. |
| F-02 — R-2's strand-prevention property was a risk with no AC | High | **Resolved** | §7 REQ-WVR-09 promotes it to a P0 acceptance criterion with a positive oracle: implementation starts at *that same wave*, not after it, and announces it as not previously completed. §8 R-2 is re-attributed to it ("the acceptance test traces to REQ-WVR-09 rather than being deferred to the FSPEC"). The *Given* is reachable at HEAD — the ledger write is downstream of the commit step, so a run that verifies without committing records nothing. |
| F-03 — OF-1's "15-wave plan" did not reproduce | Medium | **Resolved** | §4 OF-1 now reads **16** waves (17 counting Phase PT's appended V-wave) and carries the re-derivation command. Matches my own derivation. |
| F-04 — "each re-invocation paid seven no-op dispatches" overgeneralised | Medium | **Resolved** | §4 OF-1 now distinguishes the wave-4 halt (seven) from the wave-2 halt (one task, `T00`) and restates the cost as "the task count of every wave below the halted one". |
| F-05 — REQ-WVR-06 was an absence-only oracle | Medium | **Resolved** | REQ-WVR-06 keeps the negative clause but pairs it on the same path with a positive conjunct — the no-commit task's wave is treated complete and the re-invocation announces the **next** wave — and names that announcement as the oracle. The SE F-04 carve-out correctly excludes ancestry corroboration from "archaeology", which is the right line: falsifying a record is not deriving completion from commits. |
| F-06 — REQ-WVR-02's rejection reasons were open-ended | Medium | **Resolved** (one residual, G-02 below) | REQ-WVR-02 now carries the closed IG-1..5 table and explicitly owes PROPERTIES a set-equality check rather than containment. The five rows do cover every rejection branch in the shipped ladder. |
| F-07 — C-1 had no acceptance criterion | Medium | **Resolved** | REQ-WVR-10 is the observable, and C-1's precedent claim is now true rather than borrowed: the resume record has its own root-anchored ignore rule at `origin/main:.gitignore:41`, not merely a sibling's. |
| F-08 — REQ-WVR-05's clearing lifecycle contradicted the shipped ledger | Low | **Resolved** | Restated as retention-with-invalidation, with the decision and its accepted cost recorded. The "staleness is a property the reader proves, not one the writer promises" framing is the testable one — it puts the burden on three checks a test can drive. |
| F-09 — "exists at HEAD" was ambiguous about which HEAD | Low | **Resolved** | The v1.3 header note states plainly that claims are verified against the default branch and not against this branch, "where the mechanism does not exist at all". A reader now knows which tree to grep. |
| F-10 — REQ-WVR-07 was a restatement, not an oracle | Low | **Resolved** | REQ-WVR-07 now names the queue-specific observable that can fail while REQ-WVR-01..05 pass: same working-directory resolution on both paths, so a resume point that differs between a direct and a delegated run of the same feature and plan fails the AC. That is a differential oracle a test can drive. |

## Findings

## Finding Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
