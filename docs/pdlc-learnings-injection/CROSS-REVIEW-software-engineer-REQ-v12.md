# Cross-Review: software-engineer — REQ (delta re-review, round 12)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.10)
**Date:** 2026-08-21
**Iteration:** 12

## Problem / Context

This is a DoD-round erratum re-review. The delta under review is **not yet committed** — it sits in
the working tree over `HEAD` (`bbc88069`, "dod: code review v1"):

```
docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md | 7 +++++--
```

Two hunks, five inserted lines, two removed:

1. **Header row** — version `0.9` → `0.10`, with the erratum note naming its trigger
   (DoD round 1, `CODE_REVIEW-pdlc-learnings-injection-v1.md` F11) and its claim ("what the
   shipped selection does and what FSPEC v0.14's BR-6 now states").
2. **AC-2.4** — a new attribution clause: a document already cut by the count bound (AC-2.2) is
   reported under **that** cause even when the total bound also failed on the documents that
   remained; only documents the total bound drops are reported under it. Closing sentence: "The
   reason ids of AC-3.2 name causes, not coincidences."

Nothing else in the REQ moved. My v11 review anchored `REVIEWED-COMMIT: 4db24c50`; that commit is
not an ancestor of the current `HEAD` (branch history was rewritten by the implementation phase), so
I re-anchored the delta against the REQ's last committed state — `caeb5f54` ("REQ erratum v0.9"),
whose bytes are the v0.9 text I approved in v11 — and diffed the working tree against it. The
result is the two hunks above and nothing more; I verified this with `git diff` on the path, not by
re-reading the document.

Per the delta protocol I did not re-read the sections I approved in rounds 1–11. I verified
(a) the two changed hunks against shipped code at HEAD, (b) the three v11 findings, and
(c) that the delta did not falsify any neighbouring AC it now references (AC-2.2, AC-3.2).

## Goals

1. Confirm the AC-2.4 attribution clause is true of the code that ships at HEAD — that it describes
   the implementation rather than prescribing a change to it.
2. Confirm the header's two factual claims about other documents (FSPEC v0.14's BR-6; CODE_REVIEW v1
   F11) resolve to the cited text.
3. Confirm the clause does not contradict AC-2.2, AC-3.2's reason-id catalogue, or the owning
   acceptance test.
4. Dispose of my three v11 findings (F-01 TSPEC divergence, F-02 FSPEC pointer, F-03 AC-5.1b
   attribution).

## Non-Goals

- Re-litigating settled AC content. DECISION FREEZE is in force; only a defect this delta
  introduced, or a factual contradiction with HEAD or an upstream document, may block.
- Re-reviewing unchanged sections. AC-1.x, AC-2.1/2.3/2.5/2.6, AC-3.x, AC-4.x, AC-5.x, §1–§4 are
  unchanged bytes I have already approved.
- Reviewing the TSPEC, FSPEC or PLAN as artifacts. They are read here only as far as the REQ delta
  cites them.
- Product-strategy or test-pyramid judgement. Engineering lens only.

## Constraints

- **Freeze.** Blocking is reserved for (i) a defect this delta introduced or (ii) a factual
  contradiction with the repository at HEAD or an upstream document. Everything else is `DEFERRED:`.
- **Altitude.** AC-2.4 is REQ-level; it may state the observable attribution outcome and must not
  state the selection algorithm. The delta stays on the right side of that line — it names *which
  cause id a dropped document is reported under*, an operator-visible outcome, and leaves the
  windowing mechanics to FSPEC BR-5/BR-6 and the TSPEC.
- **Shipped-code grounding.** The header asserts the clause is "what the shipped selection does".
  That makes this a verifiable claim about existing code, so it is checked at HEAD, not assumed.

## Acceptance Criteria — delta verification

| Claim in the delta | Verified against | Result |
|---|---|---|
| A document past the count window is reported `RSN-COUNT` whatever the window's byte outcome | `pdlc/workflows/orchestrate-dev.js:2467-2469` splits `ordered` into `window = ordered.slice(0, windowSize)` and `overflow = ordered.slice(windowSize)`; `:2520-2522` `for (const doc of overflow) rejected.push({ path: doc.path, reason: "RSN-COUNT" })` — unconditional, no byte-state guard | **Holds.** The overflow label is a function of position alone. |
| "only documents this bound drops are reported under it" (`RSN-BYTES` confined to the window) | `orchestrate-dev.js:2475-2492` accumulates over `window` only, pushing non-fitting members to `windowRejected`; `:2494` `for (const doc of windowRejected) rejected.push({ path: doc.path, reason: "RSN-BYTES" })` | **Holds.** `RSN-BYTES` cannot escape the window; the two rejected sets are disjoint by construction. |
| The clause describes shipped behaviour rather than requesting a change | `orchestrate-dev.js:2496-2519` — the CR-round-1 comment records that the earlier `propagateBytes` guard was **removed**, and `:2517-2519` closes with "Code and specification now agree; there is nothing left routed" | **Holds.** The code already lost the divergent branch; the REQ is catching up to it, which is the correct direction for an erratum raised by DoD. |
| "what FSPEC v0.14's BR-6 now states" | `FSPEC-pdlc-learnings-injection.md:9-17` header row reads version `0.14`; `:519-525` "**The mixed case, stated.** … each dropped document carries the id of **the bound that removed it** … Documents past the window carry `RSN-COUNT` whatever the window's byte outcome … only documents the total bound dropped from inside the window carry `RSN-BYTES`" | **Holds**, and is a near-verbatim match of the REQ clause — no daylight between the two statements. |
| "DoD round 1, CODE_REVIEW v1 F11" is the trigger | `CODE_REVIEW-pdlc-learnings-injection-v1.md:37` — F11, Medium, remedy "Apply the erratum to FSPEC BR-6 and REQ AC-2.4 on this branch" | **Holds.** The delta is exactly the REQ half of F11's named remedy. |
| No contradiction with AC-3.2's catalogue | `REQ:325-326` defines `RSN-COUNT` as "below the count threshold's cut" and `RSN-BYTES` as "dropped by the total byte bound" | **Consistent.** The new clause narrows attribution to the cause each id already names; it does not redefine either id. |
| No contradiction with AC-2.2 | `REQ:281-289` — AC-2.2 governs *which* documents survive the count bound and is silent on reason ids | **No conflict.** AC-2.4's reference to AC-2.2 is a pointer to the bound, not a claim about its text. |
| The owning acceptance test agrees and does not echo the implementation | `pdlc/workflows/__tests__/learningsSelect.test.js:279` (`LI-16: LI-AT-13`); expectations are literal — `:336` `expect(result.selected.map(d => d.path)).toEqual(orderedPaths.slice(0, 4))`, with the overflow's `RSN-COUNT` and the window drop's `RSN-BYTES` transcribed, and `:294-301` records that the byte-count previously tuned to keep the failure off the window's last slot is gone | **Holds.** Expected values are spec transcriptions, not derived from `selectLearnings`; the reason map is asserted as a whole rather than by containment. |

## Findings

### Disposition of v11 findings

| v11 ID | Was | Now |
|---|---|---|
| F-01 (Medium, Cross-Feature) — TSPEC still gated the injector on `present && config.enabled && !sectionMalformed`, `OQ.2` open | **Resolved.** `TSPEC:506` now reads the gate is on `config.enabled` "**alone**. There is no `!sectionMalformed` conjunct either"; `TSPEC:1524` records `OQ.2` closed with the provisional gate named as the rejected alternative. Shipped code agrees: `orchestrate-dev.js:2637` `if (config && config.enabled === false) return null;` — one key, no second conjunct. `SE-O-1` is discharged. |
| F-02 (Low, Local) — FSPEC's upstream pointer named REQ v0.8 | **Resolved.** `FSPEC:9` now reads `REQ … (v0.10)`, matching this delta's version. `SE-O-2` is discharged. |
| F-03 (Low, Local) — `AC-5.1b` attributes the operator notice to `parseImplementationConfig`, which emits only a flag | **Open, unchanged, still non-gating.** Re-verified at HEAD: `orchestrate-dev.js:191-210` returns `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: [] }` and emits nothing; the notice is a caller's. This delta did not touch `AC-5.1b`. Carried below as F-01 of this round. |

### This round

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | *(inherited, unchanged — v11 F-03, v10 F-01; fourth round carried.)* `AC-5.1b` still attributes the malformed-section operator notice to `parseImplementationConfig` itself ("the same response `orchestrate-dev.js`'s `parseImplementationConfig` ships"). At HEAD the parser ships the `sectionMalformed` flag only (`orchestrate-dev.js:191-210`); the notice is emitted by a caller on the wave-mode path (`orchestrate-dev.js:14130-14135`), and a second call site drops the flag (`:11913`). The AC's decision — malformed fails open on §4.1's defaults, with a notice — is unaffected and implementable as written. **Fix (still not owed):** "the reader-plus-caller path around `parseImplementationConfig`". | `AC-5.1b` |

No High findings. No Medium findings. The delta introduced nothing.

DEFERRED: AC-2.4's new clause is now the longest sentence in Group 2; a future non-frozen edit could split "attributed to the bound that actually removed it" into its own bullet for readability without changing meaning.
DEFERRED: `REQ:480` still notes that `RSN-COUNT` has "no exercise under default thresholds" and owes the TSPEC a named case; `LI-AT-13` now exercises `RSN-COUNT` under explicit non-default thresholds, so that note could be re-pointed at the test on a later REQ touch.
DEFERRED: F-01 above (fourth round as a Low) could be closed with a five-word edit on any later REQ touch; there is no obligation to open one for it alone.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The delta is uncommitted in the working tree alongside modified `FSPEC` and `TSPEC`. Is the intent to land all three in one erratum commit? They are mutually consistent as they stand — REQ v0.10, FSPEC v0.14 BR-6, TSPEC `OQ.2` closed — so committing them together is the state I verified; landing the REQ alone would be equally sound, since the FSPEC half of F11 is already in the same tree. Either way, nothing here blocks. |
| Q-02 | My v11 anchor `REVIEWED-COMMIT: 4db24c50` is no longer reachable from `HEAD`. I re-anchored on the REQ's last committed change (`caeb5f54`) and confirmed its REQ bytes are the v0.9 text I approved, so the delta window is exact. Should the round history record the re-anchor, the next reviewer will hit the same unreachable-anchor step. |

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
