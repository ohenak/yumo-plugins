# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md (v1.1)
**Date:** 2026-08-04
**Iteration:** 3

**Scope:** Delta confirmation of DECISIONS v1.1 — the single additive entry DEC-ADV-11 plus the
version bump and v1.1 blockquote note (commit c7dc98f), dispatched per POSTMORTEM-PR R-1 ("record
the decision explicitly"). Settled decisions approved at CROSS-REVIEW-test-engineer-DECISIONS-v2.md
are not re-litigated. The same commit's FSPEC amendment is reviewed by FSPEC's approvers, not here.

## Delta verification

- `git show c7dc98f -- DECISIONS-pdlc-advisory-tier.md`: the diff is exactly (1) the metadata row
  version bump 1.0 → 1.1 with date 2026-08-04, (2) the v1.1 blockquote note, (3) the new DEC-ADV-11
  section. No prior entry changed.
- `git log --oneline 7097b57..HEAD -- DECISIONS-pdlc-advisory-tier.md`: c7dc98f is the only commit
  touching DECISIONS since my v2 review. Append-only history holds.

## Assessment of DEC-ADV-11 (testing lens)

**(a) Testability argument — correct.** The original FSPEC §5.4 A3 gate ("verify step → no findings
remaining") was unsatisfiable by every correct invocation: A3 fires on DoD round exhaustion with
findings open (FSPEC §7.2) and is forbidden from touching any production file, test file, or DoD
criterion (A3-6, `FSPEC:516`), so a verify-step re-run reads a tree A3 never changed and must repeat
the same findings. A test of that gate either always fails against a correct build or is weakened
until vacuous — untestable-or-vacuous, exactly as the entry argues. The adopted gateless form keeps
the oracle falsifiable rather than absent: TSPEC §4.3 (`TSPEC:434-436`) states that with
`verifyGate: null` no trivially-passing `async () => ({ passed: true })` stub exists to be mistaken
for a gate, which is what FSPEC T-03-6(b)'s gate-exclusivity criterion treats as the falsifying
mutation — installing a stub gate at A3 turns the suite RED. PROPERTIES §6 gives A1 and A3 "the
stronger form": `resolved` unreachable on every path, each path terminating in `escalated` or
`no-action` with its own O-1 positive triple (`PROPERTIES:562-571`) — a positive-conjunct oracle,
not an absence-only one.

**(b) Output-validity check correctly identified.** A3's real validity check is the malformedness
rule A3-1 (§4 V-4): a classification that is not whole-picture, or a malformed verdict, consumes one
attempt and never passes (`FSPEC:267`, `FSPEC:511`, `FSPEC:524`). Calling this a "gate" would indeed
break the gate concept: BR-6 (`FSPEC:1028`) defines gates as re-verification of an *applied*
resolution — an enacted change of world state — which A3 never produces. The entry's rejection of
the "classification-validity gate" alternative is sound for the same reason.

**(c) Citations and trigger — verified.**

| Claim in DEC-ADV-11 | Verified at |
|---|---|
| `permittedActions` is `[]` for A3 | `FSPEC:516` (A3-6, structural form per TSPEC), `TSPEC:430-434` (§4.3) |
| TSPEC §5.5/§7.2 declare `verifyGate: null` | `TSPEC:648` (§5.5 table), `TSPEC:856` (§7.2), `TSPEC:434` |
| FSPEC §5.4 A3 row restated in A1's form (v1.5) | `FSPEC:378` — "none", cites A3-6 and DEC-ADV-11 |
| A3-1/V-4 consumes an attempt | `FSPEC:267`, `FSPEC:524` |
| AC-4.5 is conditional ("Given a resolution is applied") | `REQ:177` — A3 is outside its quantification |
| PROPERTIES §6 asserts both-seams gateless form, predicted the failure at `PROPERTIES:568` | `PROPERTIES:562-572` — "Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches" |
| Re-evaluation trigger: non-empty `permittedActions` ⇒ gate mandatory per BR-6 | `FSPEC:1028` — BR-6 quantifies over every applied resolution; sound and observable (a code-level `permittedActions` change is detectable by PROP-GATE-06-style set assertions and T-03-6) |

Reversibility statement ("moderate — requires a scope change to the seam, not a table edit") is
consistent with how the design is actually testable: re-adding a gate without a non-empty
`permittedActions` would recreate the unsatisfiable row.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings | — |

## Questions

| ID | Question |
|----|---------|
| — | None |

## Positive Observations

- The entry names the *mechanism* of the original defect (a gate row copied from A4/A5's shape, which
  do enact actions) rather than just the symptom — that is the durable half of the record.
- The re-evaluation trigger is stated as an observable code-level condition, not a vague "revisit if
  requirements change", so a monitor or reviewer can detect when the decision should reopen.
- Recording the untestable-or-vacuous dichotomy explicitly gives future reviewers the exact test-lens
  argument, preventing a third recurrence of the divergence.

## Recommendation

**Approved**

The delta is exactly the additive record R-1 asked for; the testability argument is correct, the
validity check is correctly identified as A3-1/V-4 rather than a gate, and every citation checks out
against the cited documents at HEAD.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
