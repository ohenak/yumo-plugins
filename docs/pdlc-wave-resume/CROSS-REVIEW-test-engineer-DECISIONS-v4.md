# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.3 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 was last confirmed in `CROSS-REVIEW-test-engineer-DECISIONS-v3.md`
(*Approved with minor changes*, 0 High / 3 Medium / 4 Low), recorded against
`REVIEWED-COMMIT: 701b8e7b` with `UPSTREAM-STATE: TSPEC sha256:458e9ec6…` (TSPEC v1.2). TSPEC is now
`sha256:5ed76227…` (v1.3). REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical
to the versions both prior approvals were taken against, so this confirmation is again entirely
about the TSPEC delta. DECISIONS' own bytes have not changed since `020b74a0`.

**The delta, measured rather than described.** `git diff b4a628b8..HEAD --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 9 insertions / 4 deletions across three hunks,
and all three say the same thing in three places:

| TSPEC hunk | What changed |
|---|---|
| Header metadata + revision history | Version 1.2 → **1.3**, with a round-4 erratum row recording the reassignment below and stating that the floor, its threshold (`--per-file --branches 85`) and its backstop are unchanged. |
| §5.8 (coverage floor) | The floor's owner moves from “the **last implementation wave's `postWaveCommand`**” to “the **last implementation task** (PLAN T-10, RK-2), which runs it explicitly and reports the measured per-file branch number”, plus the reason: V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a per-wave-scoped setting is not expressible and a global one would run `test:coverage` after every wave. |
| §6.4 RT-7 row | The same reassignment and the same reason, restated in the risk's mitigation cell; the backstop clause (§5.3 per-arm unit coverage, §5.7 generative suite, degrade to a PUB-time finding) is preserved verbatim apart from “if T-10's run proves too slow”. |

This is the erratum PLAN raised as **RK-2** (`PLAN-pdlc-wave-resume.md` §4.4, and the §3.4 row
“Coverage floor | **T-10**, not `postWaveCommand`”). TSPEC has now adopted PLAN's position, so the
two documents agree; nothing was re-litigated and no scope moved.

**What I checked, beyond the item list (DEC-ERR-03).** The item landing is necessary, not
sufficient. The question is whether DECISIONS is still a faithful compression of TSPEC v1.3, so I
went at it from the DECISIONS side: I grepped the document for every surface the delta could have
moved under it — `coverage`, `85%`, `test:coverage`, `§5.8`, `RT-7`, `postWaveCommand`,
`postWavePathspecs`, `V-13`, “four keys” — and re-read each hit against TSPEC at HEAD. There are
exactly two hits, neither of which is a claim about the coverage floor:

| DECISIONS site | What it asserts | TSPEC v1.3 / shipped code at HEAD | Verdict |
|---|---|---|---|
| O-5, the key-generic notice argument (line 153) | The invalid-value notice is emitted by a key-generic loop “shared verbatim by every `implementation` key (`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`)” — four keys | TSPEC V-13 (§2.1) still closes the recognised set at exactly those four, and the erratum **re-asserts** the four-key surface as its own load-bearing premise | **Faithful, and newly reinforced** — the delta leans on the same fact DECISIONS leans on |
| Risks, “Generated artifacts go stale” bullet (line 472) | A wave touching the module must name the dist path in `implementation.postWavePathspecs`; “the post-wave command runs before the gate” | TSPEC §6.4 RT-5 says the same (`M-WG-2`), untouched by this delta; and `pdlc/workflows/orchestrate-dev.js` runs `postWaveCommand` and only then `implConfig.testCommand`, with the comment “The build runs BEFORE the test gate” | **Faithful**, verified against the shipped loop rather than trusted from the doc |

DECISIONS makes **no claim at all** about the 85% branch floor, about §5.8, or about RT-7 — the
floor is a TSPEC-and-PLAN obligation that this DECISIONS never compressed. The delta is therefore
non-interacting with every position this document holds: nothing it cites moved, and nothing it
cites now says the same thing a different way.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
