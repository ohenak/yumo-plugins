# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.10, `sha256:9712b6b0…`)
**Date:** 2026-08-20
**Iteration:** 1

## Context

A full review, not a delta: the round history for this document was deleted by the harvest commit
`9cf48051` ("delete harvested cross-reviews and DoD code reviews"), so no
`CROSS-REVIEW-*-DECISIONS-v*.md` exists on disk and this dispatch is iteration 1 against the whole
of v1.10. I read the document end to end rather than diffing it.

**Upstream state, computed rather than trusted.** At `a9148c2f`:

| Document | sha256 | Version cell |
|---|---|---|
| REQ | `c62cfc35…` | 1.15 |
| FSPEC | `91ef2557…` | 1.6 |
| TSPEC | `3fa21acf…` | **1.11** |
| DECISIONS (under review) | `9712b6b0…` | 1.10 |

The document's `Upstream` cell (`:5`) and four prose sites (`:20`, `:81`, `:149`, `:396`) name
**TSPEC v1.10**. TSPEC is at v1.11, and its changelog opens with the change that matters most to
this record: "**OQ-7 is closed upstream, in this TSPEC's favour**"
(`TSPEC-pdlc-advisory-wave-gate.md:19`). That is not a version-cell nit — DECISIONS hedges four of
its own claims on OQ-7 still being open (F-02).

**How I reviewed it.** This document's stated purpose is to hold no tree measurements (`:24-33`,
`:52-55`), and its v1.10 preamble claims every claim was "re-grounded against the working tree". My
lens is testability, so I checked the claims that a PROPERTIES or test author would transcribe into
an oracle: the failure mode of each mechanism, the argv literals, the rejection reasons that
foreclose an alternative, and every "this is now asserted / a regression now fails the suite" claim.
Each was checked against the shipped module and the shipped suite, not against the citing document.

What holds at HEAD, verified and left alone: `stash` has no call site anywhere in
`pdlc/workflows/orchestrate-dev.js`; `reset --hard` has exactly one, on the seam-revert path
(`orchestrate-dev.js:3018`); `ADVISORY_DEFAULTS.enabled` is `false` (`:1945`); `nonNegativeInt`
exists as a sibling of `positiveInt` and `waveBudgetPerRun` is its only caller (`:2073-2077`,
`:2096`); the promotion `commitPaths` call is where DEC-A6-02 says it is, past the same green gate,
with the message literal the entry fixes (`:15472-15482`); and the build-outputs commit precedent it
cites is verbatim at `:15487-15488`.

## Options Considered

Three readings of "review a DECISIONS document through a testing lens" were available.

- **Check the four entries against TSPEC and stop.** Rejected: it is the reading that produced the
  defects this round found. Three of my Highs are places where DECISIONS is a *faithful* compression
  of a document or a tree state that has since moved, or of a channel that has since been retired.
  A citation check against v1.10 would have passed all three.
- **Re-litigate the four decisions on their merits.** Out of lens and out of scope — the mechanism,
  the promotion commit shape, the ref name and the `0` affordance are settled and shipped, and my
  job is not to reopen them.
- **Falsify every claim the document makes about a failure mode, an argv, a test, or a foreclosed
  alternative — against the module and the suite** (chosen). A DECISIONS entry is read downstream by
  PROPERTIES and by an implementing task; the claims that reach an oracle are exactly the claims
  about what throws, what is asserted, and what is impossible. Those are also the only claims in
  this document that a reader cannot check without leaving it.

Executing the chosen reading, claim by claim.

**Claim — "Any capture or restore call returning `ok !== true` throws" (`:318`).** False for
capture, and the document says so itself three lines later. `captureTreeSnapshot` never throws: it
returns `null` on every failed verb through a `fail(verb)` helper (`orchestrate-dev.js:12574-12613`),
and its own docstring states "Returns `null` on any `ok !== true` — never throws"
(`:12558`). `restoreTreeSnapshot` does throw, on all three verbs (`:12635-12662`). TSPEC agrees with
the code, not with this bullet (`TSPEC:1430`, "the capture-failure disposition, with the writers
named"). F-01.

**Claim — the ignored-path boundary is upstream's open question (`:125`, `:199-201`, `:208-210`,
`:331-333`).** Closed upstream, answered *no*. `TSPEC:1755` records OQ-7 as "**Closed upstream,
answered *no***", FSPEC BR-9 at v1.6 and REQ AC-5.1 at v1.14/v1.15 fix the map's domain as tracked
plus non-ignored untracked files (`REQ:503` — ignored paths "are operator files A6 never wrote and
never restores over"), and `TSPEC:504-509` states the scoped ignored-path arm this record holds in
reserve "is **not** built: the decision that would have required it did not come back". F-02.

**Claim — "A new file is not an option" (`:99`).** The premise under it is a retired channel.
`build-runtime.mjs` emits exactly one artifact, `pdlc-cli.mjs` (`build-runtime.mjs:3`, `:11`,
`:24-26`, `:133`); `git ls-files pdlc/workflows/dist/` returns that one path; the consumer sync step
is deleted and its copies are swept by an operator-invoked cleanup script
(`pdlc/hooks/scripts/cleanup-consumer-workflows.sh:4-7`). The shipping channel vendors **two module
files** verbatim — `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`
(`pdlc/engine/scripts/prepack.mjs:20`, copied at `:38-47`). A new module is a three-list edit
(`prepack.mjs:20`, `publish-preflight.mjs:221-224`, `fixture-machine.mjs:426`), not an impossibility.
F-03.

**Claim — "a future 'simplification' collapsing `0` into `enabled: false` now fails the suite rather
than passing it" (`:406-408`).** True of the spec, false of the suite. `TSPEC:1484-1493` does
require the present-and-zero conjunct. The shipped fixture does not carry it: A6-15
(`pdlc/workflows/__tests__/advisoryWaveGate.test.js:1591-1619`) asserts `outcome`, `reason`, zero
`_agent` calls and `commit-tree === 1`, calls `runWaveGateSeam` directly rather than a run, and
never reads the report's advisory summary key. F-05.

**Claim — "The mechanism is two module-private functions" (`:203`).** Both are `export`ed
(`orchestrate-dev.js:12566`, `:12635`) and destructured by name in the suite
(`advisoryWaveGate.test.js:280`). F-04.

**Claim — DEC-A6-03's rejection of option A is a tested commitment (`:149-159`).** Confirmed, and it
is the best-evidenced claim in the document. `advisoryWaveGate.test.js:1624` runs two red waves and
asserts `new Set(targets)` set-equal to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`
(`:1662`) plus one write each (`:1663-1664`) — set-equality, not containment, so a fixed-name
regression fails on both conjuncts exactly as described.

**Claim — no test catches a `-m`-less capture (`:189-192`).** Confirmed: `grep -rn "A6 snapshot"`
over `pdlc/workflows/__tests__/` and `pdlc/engine/__tests__/` returns nothing, so the message literal
`A6 snapshot: wave {waveNum} pre-repair tree ({feature})` (`orchestrate-dev.js:12596-12599`) is
unasserted anywhere. The entry's warning is accurate and still live.

**Claim — DEC-A6-02's reversibility caveat rests on TSPEC's message oracle (`:238-246`).** Confirmed:
`waveExecution.test.js:1347` asserts `chore(test-feat): wave 1 advisory promotion (T2)`, matching
`orchestrate-dev.js:15474` byte for byte. The caveat holds and the citation is now correct.

**Claim — the example gains the key and the engine asserts over it in a file of its own
(`:362-377`).** Confirmed on both channels: `.claude/pdlc.config.example.json` carries
`"advisory":{"enabled":false,"waveBudgetPerRun":1}`, and
`pdlc/engine/__tests__/advisory-config-example.test.js` is a purpose-named file asserting the section
parses with a non-negative integer budget, exactly as the entry allocates.

## Decision

## Findings

## Questions

## Consequences

## Positive Observations

## Recommendation

## Verdict
