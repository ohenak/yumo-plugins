# FSPEC — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author |
| Version | 1.0 |
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

## 1. Overview

This FSPEC specifies the **observable behaviour** of automatic Phase I wave resume: what an
operator sees, and what a run does, when the pipeline is re-invoked after a Phase I wave-gate
halt. It derives entirely from `REQ-pdlc-wave-resume.md` v1.5 and adds no requirement of its own.

**What is specified here.** The decision an invocation makes about where Phase I starts, the
three outcomes it can reach, the announcement each outcome owes the operator, and the conditions
under which the resume record is disregarded. **What is not specified here:** the record's
location, encoding, field names, matching procedure, and write mechanics — those are
implementation contracts owned by the TSPEC (REQ OB-1), which ratifies or revises the shipped
interim contract rather than inventing one (REQ BL-03).

**Grounding, and one prerequisite that is not met.** REQ BL-04 requires the resume mechanism and
`docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring tree at FSPEC
authoring time. They are **not**: this branch is 1,637 commits behind the default branch
(`git rev-list --count origin/main ^HEAD` → 1637) and neither the mechanism nor the baseline file
exists in it. Every claim this FSPEC makes about shipped behaviour is therefore verified against
`origin/main`, and each such claim names the symbol or file it was verified against, per
DEC-DOC-01. The unmet prerequisite is carried in §7 (OB-F1) and raised as an erratum against the
REQ, because R-4 ("new code alongside") is exactly the risk an authoring tree without the
mechanism invites.

| Claim | Verified against (`origin/main`) |
|---|---|
| A resume record exists as consumer-local, untracked state | `WAVE_STATE_PATH`, `pdlc/workflows/orchestrate-dev.js:12214` |
| Its exclusion is anchored by a root-anchored ignore rule | `.gitignore:41` (`/.claude/pdlc-wave-state.json`), with the anchoring rationale at `.gitignore:24-32` |
| Reading the record is total and never halts the pipeline | `parseWaveLedger`, `pdlc/workflows/orchestrate-dev.js:12267` |
| Commits and the record write are both guarded by the git transport, not by the gate mode | the `if (waveGit)` branch opening at `pdlc/workflows/orchestrate-dev.js:15531` under the comment "Only now — verified — does anything get committed", with the record write at `:15600` inside it |
| An operator pointer is judged explicit before any range clamp | `explicitPointer`, `pdlc/workflows/orchestrate-dev.js:15236`, computed above the clamp at `:15237-15244` |
| The record survives a completed Phase I | the retention comment above the `allWavesRecorded` report row, `pdlc/workflows/orchestrate-dev.js:15607-15615` |
| The queue path runs the same pipeline in-process | `orchestrate-queue.js` imports `orchestrate-dev`'s `main` as `realMain` (`pdlc/workflows/orchestrate-queue.js:45`) and delegates the whole pipeline to it |
| Behaviour is exercised by tests today | the wave-ledger describe block, `pdlc/workflows/__tests__/waveExecution.test.js:2239` |

Line anchors above are positional claims about a revision this branch does not contain; the
symbol and file names are the durable half and are what downstream artifacts should cite.

## 2. Linked Requirements

## 3. Behavioral Flow

## 4. Business Rules

## 5. Edge Cases and Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions
