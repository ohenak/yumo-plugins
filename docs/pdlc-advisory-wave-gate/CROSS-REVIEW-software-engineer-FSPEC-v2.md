# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-20
**Iteration:** 2

## Prior-Round Disposition

Delta re-review against `5a6e795c` (the commit my v1 was written at). Five FSPEC commits landed
since: `106ec502` (§4), `3d0fd378` (§5), `0d4215bd` (§6), `33634b3d` (§2/§3.2), `9f80247a` (E-34
placement). I read only those diffs plus the code each new claim asserts over.

| v1 finding | Severity | Status | Where resolved |
|---|---|---|---|
| F-01 — BR-2 drops AC-2.2's first-matching-class rule; AT-02-1's set oracle cannot falsify a reorder | High | **Resolved** | BR-2 now states the set is **ordered**, first match wins; E-08b is the two-class row (`plan-ordering-defect`, never both); AT-02-1 is ordered-sequence equality plus the two-way-match arm. All three asked-for edits landed. |
| F-02 — BR-9's map ranges over ignored paths, making restoration destructive and the oracle non-deterministic | High | **Resolved** | BR-9 pins **Domain** (tracked + **non-ignored** untracked; `node_modules/`, tool caches, `.env`, the untracked wave ledger outside the map in both directions) and **Observation point** (immediately after restoration, before BR-13's writes). AT-05-1 and AT-05-2 carry the same domain, and AT-05-2 rules the ignored-output fixture out explicitly. |
| F-03 — AT-03-7's *When* and *Then* state mutually exclusive oracles | Medium | **Resolved** | *When* now reads "compared by **ordered-sequence** equality against the eight-member literal BR-15 transcribes"; the clause a transcribing author copies is now the one the *Then* wants. |
| F-04 — pre-A6 comparands no longer exist and no clause says they are transcribed | Medium | **Resolved** | §6's preamble names exactly the four ATs I named (AT-01-3, AT-01-4, AT-04-1, AT-05-3), sources them to M-WG-3/M-WG-7 at baseline v1.2, and states why a re-derived comparand passes unconditionally. |
| F-05 — BR-12's "told" signal unspecified across re-invocation | Medium | **Resolved** | BR-12 declares the signal **durable**, cites M-WG-6's re-entry, and names the two surviving carriers; AT-04-5 gains the second companion arm that re-invokes and re-dispatches, so an in-run-only signal reds. |
| F-06 — §3.2 step 9's disposition vocabulary enumerated but never asserted | Low | **Resolved** | Step 9 now carries the pointer ("the vocabulary is the tier's… its closed assertion belongs to the tier's own suite… no AT here re-asserts the set"), the AT-06-1 division I asked for. |

**Verified against code, not accepted from the document.** Every literal the revision newly
transcribes is what ships:

- BR-5's exclusion order `X-a, X-e, X-d, X-b, X-c` is `ADVISORY_EXCLUSIONS` verbatim
  (`pdlc/workflows/orchestrate-dev.js:2459`), and it is indeed not alphabetical.
- BR-15's eight reasons, in the order written, are `ADVISORY_REFUSAL_REASONS`
  (`orchestrate-dev.js:2446-2453`).
- BR-2's four classes in the order written are `ADVISORY_ROOT_CAUSES` (`orchestrate-dev.js:1956-1961`).
- AT-03-2's two literals are the ones `classifyEnvelope` returns: `X-a` → `revert-on-test-touch`
  (`:2566`), `X-d` → `out-of-envelope` (`:2573-2577`).
- §2's before-base: `bb4d36fb` is PR #66's merge, `11420461` is PR #67's, and `c8aa22a4` does carry
  the five-member `ADVISORY_SEAMS` M-WG-8 measured (`git show c8aa22a4:pdlc/workflows/orchestrate-dev.js:1669`).
  Baseline §4 lines 69-72 say the same thing, so §2 restates its source correctly.
- BR-9's ignored-path examples: `.claude/pdlc-wave-state.json` — the wave ledger — is in
  `.gitignore`, as are `node_modules/` and `coverage/`. The advisory record is not, which is what
  makes the observation-point clause load-bearing rather than redundant.
- E-23's new clause matches M-WG-7: the halt path rewrites the queue row to `halted` and commits
  that one file pathspec-scoped.

AT-07-1's partition survives the BR-4 move: proposable `{BR-2, 3, 4, 5, 6, 7, 8}`, not proposable
`{BR-1, BR-9…BR-16}` — still disjoint and still total over BR-1…BR-16, and now consistent with the
*Given* clause that named E-5/E-6 (BR-4's content) first.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
