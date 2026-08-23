# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-23
**Iteration:** 5
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.4 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 was last confirmed in `CROSS-REVIEW-test-engineer-DECISIONS-v4.md`
(*Approved with minor changes*, 0 High / 3 Medium / 4 Low), recorded against
`REVIEWED-COMMIT: 2eb5e237` with `UPSTREAM-STATE: TSPEC sha256:5ed76227…` (TSPEC v1.3). TSPEC is now
`sha256:4b5f7f5b…` (v1.4). REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical
to the versions all three prior approvals were taken against, so this confirmation is again entirely
about the TSPEC delta. DECISIONS' own bytes have not changed since `a0cb8d32`.

**The delta, measured rather than described.** `git diff 2eb5e237..HEAD --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 68 insertions / 37 deletions across eight hunks —
a materially larger round-5 erratum than the round-4 one I confirmed last time:

| TSPEC hunk | What changed | Touches a DECISIONS claim? |
|---|---|---|
| Header + revision history | Version 1.3 → **1.4**, with a round-5 erratum row enumerating the eight corrections below. | No |
| §1.3 / §6.3 item 4 | REQ OB-1's worktree framing re-grounded: the `.worktreeinclude` evidence bullet is retired because REQ v1.7 landed the consumer-local framing. | No |
| **§2.4, excluded-notice row** | The exclusion is re-argued: **the discriminating conjunct is now the first one — “the resume decision emits it”** — and the row states explicitly that the second conjunct (“about a resolved start point”) does **not** discriminate, because a past-the-end pointer is also a rejected value, is clamped, and still carries a token. Credited `(TE)`. | **Yes — O-5, DEC-WVR-03** |
| §2.5 / §3.4 interaction note | “One interaction FSPEC does not state, **routed upstream**” → “One interaction FSPEC **now states**, ratified here”: FSPEC §3.4 at HEAD carries the operator-pointed-run record clause verbatim, so the erratum is discharged, not open. | No |
| **§3.1 and §6.1 DEC-WVR-06** | Still **three** interpolating reasons, but the value count moves **four → five** (`feature-mismatch`'s renderer names *both* the recorded feature and the run's). | **Yes — O-8, DEC-WVR-06** |
| §5.4 AT-05 | Gains a **write-side conjunct** (PM): `ledgerWrites` non-empty, written `lastGreenWave` plan-absolute. | Yes — reinforces DEC-WVR-04 |
| §5.5 mutation 5 | New mutation: suppressing the record write while `explicitPointer` is true, killed only by AT-05's new write-side conjunct. | Yes — reinforces DEC-WVR-04 |
| §5.7 / §5.8 | `numRuns: 500` pinned rather than left to fast-check's default; `c8.include` grows to four entries with `allow-external`. | No |
| §6.2 OB-F1; §6.3 | OB-F1's re-raise retired — the REQ §10 / FSPEC OB-F1 characterisation inconsistency is closed at HEAD; all four §6.3 errata are marked landed and no `ERRATUM:` line is re-emitted. | No — and it *confirms* DECISIONS' Open row |

**What I checked, beyond the item list (DEC-ERR-03).** The items landing is necessary, not
sufficient, so I went at this from the DECISIONS side rather than the diff side: I grepped the
document for every surface the delta could have moved under it — `interpolat`, `four`, `five`,
`§3.1`, `DEC-WVR-06`, `§2.4`, `resume decision`, `rejected value`, `OB-F1`, `OB-F4`, `RT-1`, `RT-5`,
`postWave`, `V-13`, `§3.4`, `lastGreenWave`, `numRuns`, `coverage`, `85`, `1,637` — and re-read each
hit against TSPEC at v1.4. Two of those surfaces moved:

| DECISIONS site | What it asserts | TSPEC v1.4 at HEAD | Verdict |
|---|---|---|---|
| O-8 (lines 201–207); DEC-WVR-06 (line 360) | “three interpolate run-specific values … **four** interpolated values”, and separately that §3.1 “says *four of the seven reasons* interpolate” | §3.1: three reasons, “carrying **five** interpolated values between them”, because `feature-mismatch` names both the recorded feature and the run's; §6.1 DEC-WVR-06 restates “five values in total” | **Stale — F-01 (delta), F-04 (inherited)** |
| O-5 (line 161); DEC-WVR-03 criterion (lines 146–148, 288) | The past-the-end notice is on the token side “because it is emitted **inside** the resume decision”; the criterion is stated as a two-conjunct biconditional | §2.4 has **adopted the code-location discriminant** as *the* discriminating conjunct and demoted the second — resolving my v4 F-06 in DECISIONS' favour, while leaving DECISIONS' criterion carrying a conjunct upstream now says does not discriminate | **Faithful but over-specified — F-03 (delta)** |

Everything else re-read clean and byte-for-byte unchanged: RT-1's two figures (734,711 B / 738,924 B
at `345ae358`) behind DECISIONS' rebase-churn bullet; RT-5's `M-WG-2` ordering behind the
generated-artifacts bullet (line 472); §3.4's “the diff adds no parameter to `main()`” and the
“no new IO” claim behind O-3, DEC-WVR-02 and DEC-WVR-08 (lines 103, 113, 270, 413); §2.4's “the
shipped assertions that do change remain exactly **three**” behind line 132 and DEC-WVR-03;
V-13's four-key `implementation` surface behind O-5's key-generic-loop argument (line 153); and the
Open table's OB-F1 / OB-F4 / RT-6 rows (lines 446–448). DECISIONS makes **no claim at all** about the
85% floor, `c8.include`, `numRuns`, or the FSPEC §3.4 ratification — those four hunks pass it
without contact.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
