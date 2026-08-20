# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (TSPEC bytes unmoved; FSPEC moved v0.10 → v0.12)

## Overview

**Question answered:** is TSPEC — bytes unmoved since its v8 approval (`sha256:eff5a19b…`) — still
approved against FSPEC as it now stands at `sha256:fb18dbda…` (v0.12)?

**Answer: yes, with minor changes.** The cascade window is two erratum rounds, not one: my v9
confirmation was recorded against FSPEC v0.10 (`sha256:a4f775bd…`), and HEAD carries v0.11 and
v0.12 on top of it. Both rounds move in TSPEC's direction — v0.11 gives BR-1 the second conjunct
this TSPEC has been carrying (and routing as ERR-7) since v0.5, and v0.12 carries that complement
through BR-11, D-2, A-2, AT-02, AT-03 and AT-29, and restates BR-15's expected set as a set of
paths rather than a count of open attempts. No oracle in this TSPEC is falsified by either round.

What the round does leave is **staleness in the other direction**: TSPEC quotes upstream text that
upstream has now repaired, and its AT-02 transcription is now a strictly weaker fixture list than
the AT-02 it compresses. Those are this confirmation's findings (DEC-ERR-03), and none is High.

**State at HEAD, re-measured this round:**

| Artifact | sha256 | Versus v9 |
|---|---|---|
| TSPEC (under review) | `eff5a19b…` | identical — unmoved since the v8 `APPROVAL-HASH` |
| REQ (upstream) | `ff605dd3…` | unmoved; matches the dispatch's stated hash |
| FSPEC (upstream) | `fb18dbda…` | moved from `a4f775bd…`; matches the dispatch's stated hash |

Working tree on `feat-pdlc-learnings-injection`. The measured diff over the whole window
(`git diff 15d8f46e..HEAD -- FSPEC-…md`) is 80 changed lines, of which the behaviour-bearing edits
are: BR-1's two-conjunct restatement, BR-11's complement, D-2's three branches, AT-02's fourth
fixture, AT-03/AT-29's requantification, BR-15's set-vs-count clarification, A-2's rewording, the
Overview's one-conjunct restatement removed, and two header rows. No new BR, no new AT id, no new
E-row, no locus reassignment, no traceability row retired.

## Architecture

The architecture claim most exposed by this window is §A.2's attachment condition:

```
const injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType);
```

Until v0.10, that conjunction was TSPEC going **beyond** its upstream: BR-1 said a dispatch carries
a block "if and only if the pipeline classifies it as authoring", and added that the rule "consumes
the classification, it does not restate the membership". TSPEC's §A.2 said so plainly ("FSPEC BR-1
as written forbids this conjunct") and routed the divergence as ERR-7 rather than resolving it in
code. That was the right call, and the erratum vindicated it.

At HEAD, BR-1 reads: "**both** hold: the pipeline classifies it as authoring, **and** its target
document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)", and names the
second conjunct "load-bearing, not defensive — an authoring-classified dispatch whose target is
none of those six document types (the code-review phase's optimizer round at HEAD) is outside the
rule". That is §A.2's P-2b/P-2c premise, adopted verbatim in substance. Re-checked, row by row:

| TSPEC architecture claim | Upstream at v0.12 | Status |
|---|---|---|
| P-2a — four `dispatchKind: "authoring"` code sites | BR-1 no longer enumerates call sites; "read off the classification, not maintained here" | unaffected; premise is measured at HEAD, not quoted |
| P-2b/P-2c — classification is **wider** than C-1; Phase CR's `docType: null` optimizer | BR-1's second conjunct and its parenthetical name exactly this dispatch | now upstream-backed rather than TSPEC-only |
| P-3 — single `dispatchAndVerify` funnel | Overview's "runs once per authoring dispatch, immediately before the dispatch is composed" | verbatim, untouched |
| P-7/P-8/P-10 — read/list/git seams | BR-8's per-document unlistable/unreadable rows | untouched by this window |
| P-11/P-12 — `parseAdvisoryConfig` sibling precedent | untouched | unaffected |

Two consequences for this section:

1. **ERR-7's premise is gone.** §A.2's paragraph "FSPEC BR-1 as written forbids this conjunct
   ('consumes the classification, it does not restate the membership'), and AT-02's expected set
   inherits the ambiguity, so the divergence is **routed as ERR-7**" now quotes a sentence upstream
   no longer contains, and routes a question upstream has answered. The engineering content is
   unchanged and correct; the routing note is stale. F-02 below (Low).
2. **`LEARNINGS_TARGET_DOCTYPES` keeps its hand-transcribed status.** BR-1 still declines to
   maintain a list of its own ("Both conjuncts read the pipeline's own existing values"), so DC-14's
   hand-transcription of C-1's six names into `learningsDispatchSet.test.js` remains the right
   oracle — importing the production constant would still be the vacuous form. Nothing to change.

The implementation anchors §A.2 cites (`orchestrate-dev.js:14551-14556`, `:7306`, `:7342-7358`,
`:8978`) have not moved in this window — `472e505c` is still the last commit to touch that file —
so the v8 by-symbol re-verification of P-2a/P-3/P-11/P-12 stands. F-05 (positional anchors, DEC-DOC-01)
carries forward unrepaired and unchanged in severity.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
