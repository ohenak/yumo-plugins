# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-20
**Iteration:** 2

Delta re-review. Base last reviewed: `9f5299ae` (FSPEC v1.5). Delta under review:
`106ec502`, `3d0fd378`, `0d4215bd`, `33634b3d`, `9f80247a`. Scope of attention: the v1 findings
and the changed sections only.

## Prior-Finding Disposition

| v1 ID | Severity | Status | Evidence in the delta |
|-------|----------|--------|------------------------|
| F-01 | High | **Resolved** | BR-9 now pins both boundaries the oracle was missing. **Domain:** "the path-to-content-hash map over tracked files and **non-ignored** untracked files", with `.gitignore`d paths declared outside restoration's reach in both directions. **Observation point:** "taken immediately after restoration completes and **before** the record and escalation writes BR-13 requires". AT-05-1 carries both verbatim, adds the absent-not-reset conjunct for repair-created files, and AT-05-2 excludes an ignored generated output from its case. E-23 now admits the halt's own writes — record, escalation entry, and the `halted` queue row (M-WG-7) — as the halt's, not a restoration defect. That is the exact conflict I flagged: with the observation point ahead of `terminate`'s step-7 RECORD append (`pdlc/workflows/orchestrate-dev.js:4026`, called after `doRevert` at `:4244`/`:4251`), AT-05-1 and AT-06-1 can now both hold. |
| F-02 | High | **Resolved** | Both literals now live spec-side. BR-5 transcribes the exclusion order `X-a`, `X-e`, `X-d`, `X-b`, `X-c` — byte-for-byte the shipped `ADVISORY_EXCLUSIONS` (`orchestrate-dev.js:2459`) and its evaluation comment (`:2456-2458`), including the deliberate non-alphabetical order. BR-15 transcribes the eight reasons in shipped order — `prohibited-action`, `revert-on-test-touch`, `out-of-envelope`, `post-action-verification-failed`, `record-write-failed`, `malformed-verdict`, `low-confidence`, `budget-exhausted` — matching `ADVISORY_REFUSAL_REASONS` (`:2445-2456`) exactly. AT-03-7 and AT-03-8 now compare against *those* literals rather than "its transcribed literal", so the comparand no longer has to be copied out of the module under test. AT-03-2 goes further and names the resolved reason `revert-on-test-touch`, which is what `classifyEnvelope`'s `X-a` branch returns (`:2564-2566`) ahead of `X-d`'s `out-of-envelope` (`:2573-2578`) — the precedence claim is now falsifiable from the spec alone. |
| F-03 | Medium | **Resolved** | §2's new "Where 'before' is measured" paragraph anchors the three red-before oracles: A6 merged at `bb4d36fb` (verified: merge of PR #66, 2026-08-20), post-change readings at `11420461` (PR #67), before-readings at `c8aa22a4` (2026-08-09), which is exactly the base `pdlc-wave-gate-baseline.md:70` names for M-WG-8's five-member reading. "A green result for one of those three at any later base is a vacuum, not a pass" is the sentence the implementer needed. AT-04-5's companion now carries the anchor inline. |
| F-04 | Medium | **Resolved** | E-34 added beside E-28 with a *distinct* observable — no repair proposed, none applied, wave halts on its own red gate, wave agents' work untouched, escalation names the capture as the cause — and §7.1 O-1 now reads "failure modes are E-28 (restoration fails) and E-34 (capture fails)". The two rows are no longer collapsed onto one behaviour. |
| F-05 | Medium | **Resolved** | AT-07-1 moves BR-4 across the partition: "**Proposable, asserted here:** … BR-4 (E-5's scope rule and E-6's two halves, the arms the *Given* names first)", and BR-4 is struck from the not-proposable list, which now reads "BR-1, BR-9…BR-16". The *Given* and the partition name the same rule ids. |
| F-06 | Low | **Resolved** | AT-03-7's *When* now reads "compared by **ordered-sequence** equality against the eight-member literal BR-15 transcribes"; both halves name one oracle unit. |
| F-07 | Low | **Resolved** | AT-04-1's closing sentence restated: "The three assertions share this one run; it is AC-4.1's *conjuncts* that are split one per run across AT-04-1/-1a/-1b." No longer self-contradicting. |
| F-08 | Low | **Resolved** | AT-02-9's *Given* now pins "`advisory.seamBudgetMinutes` pinned high enough that no window can exhaust it", so the shared `budget-exhausted` literal (E-24/E-25, `budgetExceeded` at `orchestrate-dev.js:2363-2365`) can only have come from attempt exhaustion. |

All eight v1 findings are resolved, both Highs among them. Nothing in the delta reopens a section
I approved at v1.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
