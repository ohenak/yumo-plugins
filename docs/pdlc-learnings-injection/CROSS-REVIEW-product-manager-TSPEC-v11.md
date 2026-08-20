# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.7)
**Date:** 2026-08-20
**Iteration:** 11 (delta confirmation)

## Overview

**Question answered:** does the erratum delta resolve the four routed items without breaking what
v10 approved, and is the TSPEC still a faithful compression of REQ v0.9 / FSPEC v0.12 **at HEAD**?

**Answer:** yes on both counts. All four routed items landed and each is true against the
repository and upstream at HEAD. Nothing v10 approved regressed. The only findings are Low,
inherited, and citation-hygiene in kind (DEC-DOC-01): the same stale-line-anchor drift the erratum
was raised to fix survives in sibling cells the item list did not name.

**Delta under review** (`git diff ccc739d1..HEAD` on the TSPEC, five commits: `4fe44ecb`,
`2c8b880c`, `cb4dae90`, `35dc817f`, `dfd8c1ff`, `bfe58851`) — +66/-37 lines, header bumped to v0.7
with a v0.7 erratum note, no behavioural claim changed.

| Routed item | Landed | Verified at HEAD |
|---|---|---|
| §D.1 domain-membership false for `corpusOutcome` (`null` healthy path) | Yes | §D.1 now scopes the domain test to **non-`null`** values and states the predicate as `v === null \|\| catalogue.includes(v)`; `LEARNINGS_CORPUS_OUTCOMES` stays the two-member set |
| Same item, re-raised as unrevised since `ccc739d1` | Yes | Landed in `2c8b880c`, inside the diff range; the pre-round contradiction is gone |
| §Ground-truth P-2a anchors stale (`:13515`, `:12821`, `:12915`) | Yes | P-2a restated by enclosing symbol and call shape; the four sites resolve at HEAD to `converge()`'s phase creator, `erratumRound()`'s author and land-proof-retry dispatches, and `reviewLoop()`'s positional `runWrapped(..., "authoring", ...)` |
| §Ground-truth P-10 anchor stale (`:15167`) | Yes | P-10 restated as "one of the trailing conditional spreads (`prUrl`, `ciStatus`, `haltReason`, `advisory`) in `buildFinalReport`'s returned object literal", cited by symbol |

Per DEC-ERR-03 my scope is the document against upstream at HEAD, not the item list; §Architecture
through §Open Questions below record that wider sweep.

## Architecture

The delta's largest change is §A.2's status flip: the `docType` conjunct stops being a **routed
divergence from BR-1** and becomes **BR-1 as written**. That is the product-significant edit, and it
is upstream-true at HEAD.

| TSPEC claim after the delta | Upstream at HEAD | Faithful |
|---|---|---|
| "This is FSPEC BR-1 as it now stands, not a divergence from it" — two-conjunct rule, authoring classification **and** target ∈ {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES} | FSPEC §BR-1: "**both** hold: the pipeline classifies it as authoring, **and** its target document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)" | Yes, verbatim in substance |
| "naming the second conjunct load-bearing and Phase CR's optimizer round as the branch it excludes" | FSPEC BR-1: "The second conjunct is load-bearing, not defensive — an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule" | Yes |
| "v0.12 carried the complement through BR-11, AT-03, AT-29 and D-2" | FSPEC AT-03 quantifies over "each dispatch **outside BR-1's rule**"; AC-4.3 → BR-11 → AT-03, AT-29; D-2 is stated as BR-1's two-conjunct question with all three branches | Yes |
| "AT-02 gained the fixture that reds when the second conjunct is reverted" | FSPEC AT-02: fixtures include "a run containing an authoring-classified dispatch whose target is none of the six C-1 document types — so reverting BR-1's second conjunct reds this test" | Yes |
| AC-4.3 restated as byte-identity for the dispatches **outside BR-1's rule** (was "non-authoring") | FSPEC v0.12's own re-quantification; REQ AC-4.3 unchanged | Yes — the narrower phrase is the correct one now |
| §A.2 "the coincidence is an invariant, and it is asserted, not assumed" — set-equality oracle over the `docType`s reaching the injector | REQ NG-5, C-1; unchanged by the delta | Yes — v10's approved reading preserved |

**Nothing v10 approved regressed here.** The paragraph's product argument is unchanged: the
conjunct still protects AC-1.2's set equality, AC-4.3's byte-identity, and R-4's "prior-feature
decisions must not reach code remediation". What changed is only its provenance — from "TSPEC adds
this, FSPEC forbids it" to "TSPEC implements what FSPEC now says". That is the outcome the erratum
route existed to produce, and §I.3's `docType ∈ LEARNINGS_TARGET_DOCTYPES` predicate is untouched.

One inherited citation defect sits in this section: the six per-phase `docType` anchors
(`orchestrate-dev.js:13766`, `:13774`, `:13807`, `:13874`, `:13893`, `:13996`) are stale at HEAD —
the `converge()` call sites now resolve at `:13908`, `:13916`, `:13949`, `:14016`, `:14035`,
`:14138`, a uniform +142 drift, the same drift that made P-2a's anchors stale. The claim survives
(the `docType` literals name themselves), so this is Low, not a contradiction — filed as F-02.

## Interfaces

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
