# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5

**Scope:** frozen delta re-review of `27d3129f..HEAD` — four commits, all of them answering v4
findings. Nothing outside the inserted blocks was re-litigated; §T.5's citation fix and the v0.5
front-matter bump are included because they are part of the delta, not because they were reopened.

## Delta inventory

| Commit | Section | What landed |
|---|---|---|
| `643f4ea2` | §A.2 property 1 (`:186-234`) | Restructures "two consequences" into four (a)–(d). Adds the composition-site expected-set table (PM F-01: `"LEARNINGS"` is a second non-member), the once-per-episode probe placement (my Q-01), and the five-site seam-plumbing table (my F-01) |
| `8aee8c22` | §T.3 (`:832-847`) | Gives both `.baseline-worktree` obligations named oracles with shapes (my F-02) |
| `9cbcaa1e` | §T.5 (`:919-925`) | Corrects the `advisoryDisabled.test.js` mis-citation (my F-04) |
| `16f30820` | front matter | v0.4 → v0.5, cross-review lineage completed through v4 |

My F-03 was also taken silently inside `643f4ea2`: `:175` now reads "written only for dispatches the
injector was actually called for" instead of "*accepted*", which removes the collision with §D's
per-source `rejected[]`. All four v4 findings are resolved.

## Verification of the delta's claims

The delta's load-bearing content is a set of factual assertions about `orchestrate-dev.js` at HEAD.
Each was re-measured against the source, not read off the document's prose.

| Claim in the delta | Measured at HEAD | Holds |
|---|---|---|
| Phase H passes `docType: "LEARNINGS"`, `dispatchKind: "harvest"` through `wrappedDispatch` | `orchestrate-dev.js:14726-14732`, verbatim | ✅ |
| …and that dispatch is reachable, not dead code | `PHASE_H_ENABLED = true` at `:24`; the skip arm at `:14712` is not taken | ✅ |
| `wrappedDispatch` spreads `wrapperSeams` straight into `dispatchAndVerify` | `:12398-12406`, `...wrapperSeams` | ✅ |
| Phase CR forwards an explicit `null` because `roundDocType` distinguishes `null` from `undefined` | `:14556` passes `docType: null`; `:7306` is `docType === undefined ? docTypeFromPath(doc) : docType` | ✅ |
| Hop 1 — `mainDev` destructures params, `_recordQueueRow` is the defaulted-recorder precedent | `:12013` `_recordQueueRow: recordQueueRowFn = defaultRecordQueueRow` | ✅ |
| Hop 2 — `wrapperSeams` is an enumerated literal, not a spread | `:12381-12393`, twelve hand-listed keys, no rest | ✅ |
| Hop 3 — `reviewLoop` receives `...wrapperSeams` but destructures a fixed list | `:14565` spreads in; `:7266-7300` destructures a fixed list with no rest element | ✅ |
| Hop 4 — `wrapped` re-lists **seven** seams by hand | `:7342-7358`: `_agent`, `_readFile`, `_listFiles`, `_probeDoc`, `_probeReviewState`, `_log`, `_git` | ✅ |
| Hop 5 — `dispatchAndVerify` is a fixed seven-seam destructure | `:8862-8878`, same seven | ✅ |
| "Phase CR's `null` reaches the composition site through this path and no other" | `dispatchAndVerify` has exactly three call sites: its own definition `:8862`, `wrapped` `:7343`, `wrappedDispatch` `:12398`; `reviewLoop` reaches it only via `wrapped` | ✅ |
| `advisoryDisabled.test.js` imports the default export as `mainDev` | `import mainDev, * as dev from "../orchestrate-dev.js"`, verbatim in the file's import block | ✅ |
| `git check-ignore .baseline-worktree` exits non-zero at HEAD, so the inverted assertion is red-before-green | re-measured: exit 1, no output | ✅ |

**The `∪ {null, "LEARNINGS"}` claim is exhaustive, which is the part worth checking rather than
trusting.** An expected set asserted with set equality is only correct if *no third* non-member
reaches the composition site, so I enumerated the operand space rather than spot-checking it. The
three `dispatchAndVerify` call sites reduce to: `converge`'s creator and its `reviewLoop`, whose
`docType` comes from the six literal `converge({docType: …})` call sites (`:13766` REQ, `:13774`
FSPEC, `:13807` TSPEC, `:13874` DECISIONS, `:13893` PLAN, `:13996` PROPERTIES); the erratum and
cascade dispatches, whose `target`/`downstream` range over `ERRATUM_DOC_TYPES` (`:6845-6852`),
which is exactly those same six; Phase CR's `null`; and Phase H's `"LEARNINGS"`. There is no
seventh value. The delta's expected set is complete, and `erratumDocTypesBelow` (`:6877`) cannot
widen it because it only slices that frozen array.

No claim in the delta contradicts the repository at HEAD.

## Findings

Nothing blocking. Under the frozen-round contract a finding blocks only if the delta broke
something that worked, or if a load-bearing claim contradicts HEAD; neither applies. Both findings
below are completeness gaps *inside* the new text, and both are PLAN task-text fixes.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **(b) widened the expected set with two non-authoring members, but (a)'s run-scope obligation still says only "every authoring phase" — so a fixture can satisfy (a) in full and still red.** `null` enters at Phase CR (a review round, not an authoring one) and `"LEARNINGS"` at Phase H (`dispatchKind: "harvest"`). Neither is an authoring phase, so "the run has to exercise every authoring phase" is now strictly weaker than what the assertion demands: a scripted matrix that drives R→PR faithfully and stops before CR and H observes six members, compares against eight, and reds — for a fixture-scope reason that reads as a product bug, which is the exact failure mode (d) was written to prevent one paragraph later. The information needed is already present — (b)'s table names where each member enters — so this is one clause, not new work: state that the driving run must reach **Phase CR and Phase H as well**, and that Phase H must not be stubbed out (`PHASE_H_ENABLED` is `true` at `:24`, so the shipped path reaches it, but a fixture that scripts around harvest silently drops `"LEARNINGS"`). | §A.2 (a) `:188-190` vs (b) `:192-217` |
| F-02 | Low | Local | **"all four hand-written hops" heads a table of five numbered edit sites.** The prose numeral is the stale one — my v4 F-01 named four sites and the revision correctly found a fifth (`dispatchAndVerify`'s own destructure, `:8862-8878`), which is the terminus rather than a hop, so the sentence is defensible on a careful reading. It is still a count a PLAN author transcribes under time pressure against a table they are told has four rows. Say "five edit sites — four hops and the destination", or drop the numeral and let the table carry the count. | §A.2 (d) `:219` |

DEFERRED: v3 F-01 (AT-32's byte-identity operand still unnamed) and v3 F-02 (`RETRY-ITERATION` is named as a case at `:209` but still owns no suite file) remain open and non-gating; both belong in PLAN task text.

## Questions

None. My v4 Q-01 is answered in (c) (`:210-217`) — once per episode, before the `for(;;)` loop,
beside the injector, on both arms — and the answer names the reason the placement matters
(`RETRY-ITERATION`'s call-log assertions are counting-shaped) rather than merely asserting it.

## Positive Observations

- **The revision found a member I missed and proved it rather than asserting it.** My v4 F-01 said
  the plumbing was unstated; I did not notice that Phase H's harvest dispatch also carries a
  `docType` the accepted set does not contain. `"LEARNINGS"` is real (`:14726-14732`) and reachable
  (`PHASE_H_ENABLED = true`, `:24`), and had it been left out, the very first run of a correct
  implementation would have gone red on a hand-transcribed literal. Catching that *before* the
  fixture exists is worth more than catching it after.
- **"Containment is never the fix" names the repair that would have destroyed the oracle.** The
  paragraph at `:212-217` does something specs rarely do: it predicts how the test will be
  weakened under time pressure (relax set equality to containment when the literal reds), states
  why that weakening is precisely the drift the assertion exists to catch, and forecloses it in
  advance. That is the difference between an oracle that survives its first red and one that gets
  quietly downgraded.
- **The five-site table gives each row a reason, not just an address.** "An enumerated literal, not
  a spread" and "it re-lists its seven seams **by hand**" are the facts that make each hop
  non-optional; a PLAN author can check each one in seconds and cannot skip one by assuming the
  keys flow through. I verified all five independently and the characterisations are exact.
- **Both `.baseline-worktree` oracles are falsifiable, and the second one's second conjunct is the
  whole point.** Asserting `git worktree list` shows no entry *in addition to* the path being
  absent is what distinguishes a real `git worktree remove` from the `rm -rf` the section rejects —
  a positive mechanism conjunct alongside an absence assertion, which is exactly the shape an
  absence-only oracle lacks. And obligation (1)'s assertion is red at HEAD today (`git check-ignore`
  exits 1), so it is a genuine red-before-green, not a tautology written after the fact.
- **The §T.5 citation is now checkable and correct.** `import mainDev, * as dev from
  "../orchestrate-dev.js"` is verbatim, and it makes the pattern claim — the suite drives a whole
  run, not a unit — verifiable by opening one file.

## Recommendation

**Approved with minor changes.** All four v4 findings are resolved, the round's answers are
grounded in measured HEAD evidence rather than restated prose, and the exhaustiveness check on the
composition-site expected set — the one claim whose incompleteness would have cost a debugging
session — holds against the full operand space. Nothing in the delta broke anything that worked and
no load-bearing claim contradicts the repository.

F-01 and F-02 should both land as PLAN task text rather than TSPEC edits: F-01 is one clause
extending the fixture's run scope to Phases CR and H, F-02 is a numeral.

One erratum remains routed and unamended upstream: **FSPEC D-2/BR-1** (`FSPEC:236`) still classifies
the decision as "Is this dispatch an authoring dispatch?" with no `docType` membership conjunct,
while TSPEC's `injectHere` (`:130-131`) requires both. TSPEC already documents this as ERR-7; it is
re-raised only because the FSPEC bytes are unchanged at HEAD, so AT-02's expected set inherits the
ambiguity.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
