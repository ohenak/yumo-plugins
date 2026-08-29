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

## 3. Behavioral Flow

## 4. Business Rules

## 5. Edge Cases & Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions
