---
feature: pdlc-decision-ledger
---

# FSPEC pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` **v1.7** |
| Downstream | TSPEC, DECISIONS, PLAN, PROPERTIES |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1** — cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-28 |

## 1. Overview

**FSPEC-DECLEDGER-01.** This spec describes the behavior of the **decision ledger**: a rendered
index of already-closed decisions, injected into review dispatch prompts, accompanied by rule text
telling the reviewer not to re-open an indexed decision without a High-severity finding citing new
evidence.

The mechanism has exactly two moving parts, and the split between them governs the whole spec:

| Part | Where the behavior lands | Observable |
|---|---|---|
| **The index** | Driver-side. The driver gathers the in-scope closed decisions, renders them, and places the rendered block in the review dispatch prompt. | The dispatch prompt's bytes |
| **The rule** | Reviewer-side. The rule reaches the reviewer as prompt text and changes nothing the driver computes. | The dispatch prompt's bytes; the reviewer's own cross-review artifact is the *intended effect*, never an asserted outcome |

Both parts are gated by one config key (`decisionLedger.enabled`, REQ C-3), default off. **With the
flag off, no behavior in this document happens at all** and the dispatch stream is byte-identical to
the pre-feature baseline — that is REQ-DECLEDGER-02, and it is the reason every flow below opens with
the same gate check.

**What this spec deliberately does not describe.** Three things behavioral complexity might seem to
demand, which are routed rather than decided here:

1. **The recognition rule** — what markup makes a heading a decision record, the id grammar, the key
   that resolves an id opened more than once in a file, and precedence across files. REQ §7 O-1 owns
   this as TSPEC material. This spec describes what the driver does *with* the in-scope set, and
   states the set's extent only by citing the Baseline's `M-1d` / `M-2e` enumerations at v1.1's
   `Verified at` commit.
2. **The rendered line's concrete format** — field order, separators, and the byte-level shape of a
   line. The REQ fixes the line's *field content* (id, one-line statement, source citation naming
   record file and heading); the rendering is TSPEC's, consistent with O-1's ownership of the
   omission order that shares the same renderer.
3. **Which lines are omitted** when the set exceeds a bound. REQ-DECLEDGER-07 fixes the *outcome*
   (never over bound, never truncated mid-line, never aborted); the selection is O-1's.

An FSPEC is warranted here despite that routing, because the parts this spec does own are genuinely
branching and an engineer should not decide them alone: a three-way gate (enabled / disabled /
malformed), a fail-open path with **two distinct legs** that degrade differently (every source
unavailable versus one decision of several failing), a boundary case where an empty file must take
the *ordinary* leg rather than the failure leg, and two size bounds whose interaction at the
single-oversized-line case has a stated outcome. §5 is the substance of this document.

**Precedent.** The shipped `learningsInjection` channel is the behavioral model throughout: derived
at dispatch-construction time, per-key independent fallback, degrading to silence rather than to a
halt, and disclosed in `.claude/pdlc.config.example.json`. Where this spec says "as
`learningsInjection` does," it names a shipped behavior, not a code path.

## 2. Linked Requirements

Every behavior in this document traces to exactly one REQ acceptance criterion. The right-hand
column names where in this spec the criterion's behavior is specified; nothing in §3–§6 exists
without a row here.

| Requirement | What it fixes | Specified in |
|---|---|---|
| **REQ-DECLEDGER-01** | Index rendered when enabled, one line per in-scope decision, sourced fresh at dispatch-construction time | BR-1, BR-2, BR-3, BR-9; flow §3.2 steps 2–5; AT-01, AT-02, AT-03 |
| **REQ-DECLEDGER-02** | Disabled path byte-identical to the pre-feature baseline | BR-4; flow §3.2 step 1; E-1; AT-04, AT-05 |
| **REQ-DECLEDGER-03** | Rule text requires High severity **and** new evidence to re-open | BR-5, BR-6; flow §3.2 step 6; AT-06, AT-07 |
| **REQ-DECLEDGER-04** | Index construction fails open, two legs, never silently stale | BR-7, BR-8; flow §3.3; E-2, E-3, E-4; AT-08, AT-09, AT-10 |
| **REQ-DECLEDGER-05** | Three config keys fail open independently | BR-10; flow §3.1; E-5; AT-11 |
| **REQ-DECLEDGER-06** | Decision id is the reviewer's reopening dedupe key; driver identity unchanged | BR-6, BR-11; AT-12 |
| **REQ-DECLEDGER-07** | Rendered index stays within both declared bounds | BR-12, BR-13; E-6, E-7, E-8; AT-13, AT-14, AT-15 |
| **REQ-DECLEDGER-08** | Driver-side scoring identical whether the flag is on or off | BR-11, BR-14; AT-16, AT-17 |

**User stories** (REQ §8, unchanged here): US-01 reviewer re-litigation — REQ-DECLEDGER-01/-03/-06;
US-02 operator currency and bounded size — REQ-DECLEDGER-04/-07; US-03 operator safe-to-enable —
REQ-DECLEDGER-02/-05/-08.

**Non-goals carried through.** This spec adds no behavior outside the REQ's non-goals. In
particular it specifies **no** driver-side reading of a decision id (NG-4), **no** change to
`MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS` or `MAX_ERRATUM_FOLLOWUP_ROUNDS` (NG-5), and **no**
new record file type or new field on any existing record shape (REQ §2 G-1).

**G-4 has no row**, by REQ design: it is a non-binding rationale note measured retrospectively from
committed `CROSS-REVIEW-*` artifacts, and no gate, test, flow or acceptance test in this document
depends on it.

## 3. Behavioral Flow

## 4. Business Rules

## 5. Edge Cases & Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions
