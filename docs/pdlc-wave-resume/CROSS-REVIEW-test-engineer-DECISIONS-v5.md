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

Three dispositions were available. I record the rejected two because the interpolated-value drift
makes at least one of them look reachable this round.

### C-1 — Escalate the value-count drift to High and halt the phase *(rejected)*

This round is the first of the four confirmations where the delta actually landed on a DECISIONS
claim rather than passing it by. O-8 and DEC-WVR-06 assert “three reasons carrying **four**
interpolated values”; TSPEC §3.1 at HEAD says **five**. An approved document now contradicts its
upstream on a counted fact, and DEC-ERR-01 is exactly about approved documents asserting things
upstream no longer says. So: is this High?

No, and the test is the one that decides every severity call in my lens — *does a downstream oracle
transcribe the wrong number?*

- **DEC-WVR-06's oracle is over codes, not values.** Consequences (line 436) prescribes “Three
  frozen catalogues, transcribed into a test literal so an addition or deletion reds the
  assertion”, and the decision body (line 361) closes the catalogue as the **code** set —
  `unreadable-json`, `not-an-object`, `wrong-shape`, `feature-mismatch`, `plan-changed`,
  `head-unreachable`, `over-count`. Seven codes. That count is untouched by the delta and is the
  only number the oracle reads. The interpolated-value count appears solely in the *rejected*
  alternative's rationale — it is the reason O-8 loses, not a quantity any assertion pins.
- **Nothing downstream transcribed it.** I grepped PLAN and PROPERTIES for `interpolat`. PLAN's
  only hit is T-07's instruction that the provenance suffix is appended “never interpolated” —
  a different subject. PROPERTIES' only hit (line 512) is the same suffix-never-rebuilt point. No
  fixture, oracle or literal anywhere downstream carries “four” or “five”. The drift is confined to
  a rationale sentence in a rejected alternative.
- **The direction of the correction is DECISIONS-favourable.** §3.1 v1.4 did not overturn
  DECISIONS' position; it refined a count *inside* the position DECISIONS won. Three reasons
  interpolate — the number DECISIONS held against TSPEC v1.1's “four reasons” — is now settled and
  unchanged. Only the value tally moved, and it moved because `feature-mismatch`'s renderer names
  two features, which DECISIONS' own enumeration (line 202, `it records feature "X", not "Y"`)
  visibly contains but counts as one.

A High here would halt Phase D over a parenthetical arithmetic error in a rejected alternative that
no test reads. Rejected: Medium is the honest severity, and Medium routes rather than halts.

### C-2 — Approve with zero findings, since the two settled errata now favour DECISIONS *(rejected)*

Tempting this round in a way it was not last round: the delta actually *resolved* one of my standing
findings. §2.4's re-argument adopts the code-location discriminant, which is precisely what my v4
F-06 (and v3 F-06, v2 F-03) asked for — I filed it three rounds running, upstream has now agreed,
and I retire it below. That is a real reduction in the open set.

But it does not empty the set. Six findings from earlier rounds remain unresolved in DECISIONS'
unchanged bytes, and this round adds two of its own. The erratum machinery reads `FINDING:` lines,
not review history: an open finding that stops being re-filed stops existing, and a non-approving
confirmation carrying zero `FINDING:` lines fails closed and halts the phase. Rejected: it would
launder six live defects through a round that had nothing to do with them.

### C-3 — Approve; re-file every still-open finding as `inherited`, file this round's two as `delta`, retire the one upstream resolved *(chosen)*

Chosen. It states the confirmation's actual answer — DECISIONS still holds, with two claims now in
need of a one-line correction — while keeping the open set honest in both directions: the count
goes down by the finding upstream fixed and up by the two this delta created.

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
