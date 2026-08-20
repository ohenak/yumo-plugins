# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 1

## Review basis

Every claim below was re-measured in this working tree at `9cf48051` (branch tip, identical to
`origin/feat-pdlc-advisory-wave-gate`) and, where the claim is about shipped baseline behaviour, at
`origin/main` `11420461`. Commands are given inline so each finding is re-runnable.

Branch hygiene checked before review: `git rev-parse --abbrev-ref HEAD` → `feat-pdlc-advisory-wave-gate`;
local tip equals its remote (no stale base).

Size budget (C-5): the REQ measures 636 lines / 51,165 bytes against
`pdlc/hooks/scripts/check-req-size.sh` limits `LINE_LIMIT=700` / `BYTE_LIMIT=61440` — inside budget on
both axes. No finding.

**Maturity note (DEC-FRZ-01).** This document carries eleven authored versions and a long prior
approval history, and the feature it specifies is merged. I have therefore held myself to the
blocking bar DEC-FRZ-01 names for a matured document: a finding blocks only where it is a defect a
revision introduced, or a factual contradiction with the repository at HEAD. I filed no
restructuring, altitude-taste or wording findings, and I re-opened no settled decision. The one High
below is squarely in class (ii) — it is a contradiction with HEAD, not a preference.


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | The REQ's `ready: false` frontmatter and QUEUE row 19's `pending` status both contradict HEAD — the feature is merged — and the stale row mechanically blocks two dependent queue rows | frontmatter; §9 BL-05 |
| F-02 | Medium | Cross-Feature | M-WG-8, cited as load-bearing by AC-1.1 and R-5, is false at today's `origin/main`; the baseline is pinned at a commit whose own re-verification rule has fired | §6 AC-1.1, §7 R-5 |
| F-03 | Low | Process | AC-1.2's inline raw `file:line` anchor does not resolve at HEAD and violates both DEC-DOC-01 and the REQ's own C-5 measured-fact discipline | §6 AC-1.2 |
| F-04 | Low | Local | §1's runtime-drift claim is not reproducible by the repository's drift-check tooling; the drift that does exist is gitignored and machine-local | §1 |

### F-01 (High, Cross-Feature) — control-plane state contradicts HEAD, and blocks successors

The REQ's frontmatter carries `ready: false`
(`docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` frontmatter), and `docs/_queue/QUEUE.md`
row 19 carries status `pending`. Both are false at HEAD:

- `git merge-base --is-ancestor HEAD origin/main` succeeds; `git log origin/main --oneline --grep=advisory-wave-gate`
  shows `bb4d36fb Merge pull request #66 from ohenak/feat-pdlc-advisory-wave-gate`.
- The feature's deliverables are on the default branch:
  `git show origin/main:pdlc/workflows/orchestrate-dev.js | grep -n "ADVISORY_SEAMS = "` →
  `1952: export const ADVISORY_SEAMS = Object.freeze(["A1", …, "A6"]);`, and `ENVELOPE_DEFAULTS` at
  `:1942` carries `E-5`/`E-6`.

This is not cosmetic. `pdlc/workflows/orchestrate-queue.js:881-884` blocks any row whose declared
dependency is present in the queue with a non-`done` status
(`if (match && match.status !== "done") … reason: \`dependency ${dep} is ${match.status} in queue (not done)\``).
QUEUE row 20 (`pdlc-wave-resume`) and row 6 (`pdlc-engineering-loop`) both declare
`pdlc-advisory-wave-gate` as a dependency, so both are permanently unpickable by `/pdlc:orchestrate-queue`
while row 19 reads `pending`. Independently, `ready: false` means "not pickable" by design
(`orchestrate-queue.js:257`, `:1341` — `Skip … REQ not marked ready: true (still a draft)`), so the
document that governs a shipped feature still describes itself as a draft.

**What must change:** flip QUEUE row 19 to `done`, and settle the REQ's frontmatter to match shipped
reality (either `ready: true` if the row is to remain queue-visible, or relocate the feature's docs to
`docs/completed/pdlc-advisory-wave-gate/`, which is the convention BL-05 itself cites for
`pdlc-consolidation-agent` and the Upstream row cites for `pdlc-advisory-tier`). Note the REQ's own
Upstream row points at `docs/completed/pdlc-advisory-tier/…`, a path that does exist — so the
relocation convention is established and this feature is the one that has not followed it.


## Questions

## Positive Observations

## Recommendation

## Verdict
