# DECISIONS — pdlc-wave-resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | *(none yet — this round)* |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. Records DEC-WVR-01..08, the alternatives weighed against them, and the cost each alternative was measured at. |

## Context

`pdlc-wave-resume` does not build a mechanism; it **formalises one that already ships**. Automatic
Phase I wave resume exists on the default branch today, written as an explicitly INTERIM block
inside `pdlc/workflows/orchestrate-dev.js` and marked as such in its own header comment ("INTERIM,
and marked as such deliberately. The formalized mechanism is the `pdlc-wave-resume` feature").
REQ BL-03 and R-4 therefore close the largest decision before this document opens: the shipped
contract is **ratified or revised, never duplicated alongside**. Every decision below is taken
inside that frame.

**Verification frame.** This branch is 1,637 commits behind the default branch
(`git rev-list --count HEAD..origin/main` → `1637`) and carries neither the mechanism
(`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `0`) nor
`docs/_constraints/pdlc-wave-gate-baseline.md`. Every claim in this document about shipped code or
shipped tests is therefore verified against **`origin/main` at `345ae358`**, by name — exported
symbol, enclosing test, comment text or config key, per DEC-DOC-01
(`docs/_decisions/DECISIONS-review-severity-bars.md`) — so that it re-verifies after the rebase
that TSPEC OB-F1 owes. Where a *cost* is claimed below it is a counted cost, and the count is
stated with the command that produced it, not asserted from intuition.

**The measured surface these decisions trade against.**

| Fact | Measurement (`origin/main` at `345ae358`) |
|---|---|
| The module the feature edits is the largest tracked file in the repo | `git ls-tree -r -l origin/main` sorted by size: `pdlc/workflows/orchestrate-dev.js`, 734,711 bytes / 16,336 lines; the runner-up is a document at 314,472 bytes |
| The shipped resume mechanism is three module-level pure functions plus one read site and one write site | `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`; the read chain under `if (!explicitPointer) {`; the single `writeWaveLedger(` call site inside the `if (waveGit)` branch |
| The decision itself is an inline `if / else if` chain in `main()` | the chain from `if (ledger.reason) {` through the final `else` that sets `startWave = recorded.lastGreenWave + 1` — ~81 lines, every arm reachable only through a full `main()` run |
| The regression net over that chain is one `describe` block of 32 tests | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` in `pdlc/workflows/__tests__/waveExecution.test.js`, plus 8 tests in the `implementation.startWave` block and 4 in `describe("computePlanHash — the ledger's plan fingerprint")` |
| `main()` already carries ~35 injected seams, `_git` among them | the destructured parameter list of `export default async function main({ … })`; `_git: gitFn = defaultGit` is one of them, and `branchGuardTransport(_git)` is how the ancestry probe reaches it |
| The runtime adapter already wires that transport for both bundles | `runtime-adapter.js` binds `_git: rtGit` twice — once for the dev injections, once for the queue's |

**What the decisions are about.** Given a shipped, tested, fail-open mechanism, the open questions
are not "what should resume do" — the REQ and FSPEC closed those — but four engineering questions:
(1) how much of the shipped shape to keep (DEC-WVR-01, DEC-WVR-05); (2) how to make the decision
*testable at unit level* without moving IO (DEC-WVR-02, DEC-WVR-08); (3) how to make provenance and
the disregard reasons **assertable** rather than inferable (DEC-WVR-03, DEC-WVR-06); and (4) what to
do with the two loose ends the FSPEC handed down — the tolerated `{}` shape (DEC-WVR-04) and the
queue/direct parity claim the queue's delegation cannot honestly support (DEC-WVR-07).

## Options Considered

## Decision

## Consequences
