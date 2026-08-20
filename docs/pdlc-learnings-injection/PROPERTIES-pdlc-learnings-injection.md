---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# PROPERTIES — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** — `REQ-pdlc-learnings-injection.md` (v0.9); `FSPEC-pdlc-learnings-injection.md` (v0.10+); `TSPEC-pdlc-learnings-injection.md` (v0.6); `PLAN-pdlc-learnings-injection.md` (v0.4); `DECISIONS-pdlc-learnings-injection.md` |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/learnings*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES[-v{N}].md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-20 |

## Overview

**What this document is.** The falsifiable proof system for pdlc-learnings-injection: 47 properties
over the region PLAN §Batches builds, each traced to a REQ acceptance criterion, an FSPEC business
rule or acceptance test, and the PLAN task that reds and greens it. It restates no behaviour —
behaviour lives in REQ v0.9 / FSPEC / TSPEC v0.6 and is referenced by id (`AC-`, `BR-`, `E-`, `AT-`,
`§`). What this document adds is the **oracle**: for each property, the instrument, the operand, the
positive control that proves the instrument fires, and the mutation that must red it.

**Subject, verified at HEAD on `feat-pdlc-learnings-injection` (2026-08-20).** Every premise the
properties below stand on was re-measured against the repository, not read off a document:

| Premise | Measured |
|---|---|
| The attachment point sees both conjuncts | `dispatchAndVerify` destructures `dispatchKind` and `docType` (`pdlc/workflows/orchestrate-dev.js`, `async function dispatchAndVerify({...})`) |
| Four authoring dispatch sites exist, three object-literal and one positional | three `dispatchKind: "authoring"` object-literal sites (`erratumRound`'s `erratumAuthorPrompt` dispatch, `erratumRound`'s land-proof retry, `converge`'s creator) plus one positional `"authoring"` argument at `reviewLoop`'s `runWrapped(optimizer, optPrompt, doc, "authoring", …)` — a literal grep for `dispatchKind: "authoring"` returns **3**, not 4 |
| Phase CR reaches the composition site with `docType: null` | `reviewLoop` call site carrying `phase: "CR"`; `wrapped` re-lists its seams by hand and forwards `docType: roundDocType` |
| Phase H reaches it with `docType: "LEARNINGS"` | the `harvest-learnings` `wrappedDispatch` in `main()`'s Phase H block |
| The corpus predicate is module-private on the sibling side | `consolidate-learnings.js` keeps `LS_FILES_ARGV` module-private and exports `enumerateCorpus(_git)`; the engine vendors only `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` (`pdlc/engine/scripts/prepack.mjs`) |
| Both `_readFile` failure shapes are real | `orchestrate-dev.js`'s `defaultReadFile` returns `null` on a caught error; `runtime-adapter.js`'s `rtReadFile` **throws** on an exhausted probe |
| `buildFinalReport` already carries a run-level notice channel and a conditional spread | its parameter list includes `notices = []`, and its return spreads `...(advisory ? { advisory } : {})` |
| The config path is shared | `export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json"`; `parseAdvisoryConfig` / `readAdvisoryConfigSafely` are the sibling readers |
| The corpus at HEAD is 9 documents, all well-formed | the predicate's own `git ls-files` returns 9 paths; **all 9** open with `# LEARNINGS — {feature}` and **all 9** carry a bare ISO `Date Completed` value |
| Zero line-initial gate tokens in the shipped corpus | no corpus document carries a line-initial `VERDICT:`, `ERRATUM:` or `REVISION-COMPLETE:` line — so PROP-ISOLATE-01's fixture is a deliberate strengthening, never a transcription |
| The baseline worktree is unignored today | `git check-ignore -v .baseline-worktree` exits **1**; `.gitignore` anchors `/.claude/pdlc.config.json` at the root, the idiom PROP-META-02 follows |
| The document-oracle walk sees everything | `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` (`pdlc/workflows/lib/document-oracles.mjs`) |
| No test file of this feature exists yet | a case-insensitive `learnings` listing of `pdlc/workflows/__tests__/` is empty; the repository root has no `scripts/` directory |

**Test pyramid, and why it lands where it does.** TSPEC §T.1's four layers are the shape:

```
        /   L3   \        12 + 2 + 4 ATs — main() under a scripted _agent; no live model
       /----------\       (dispatch universe, config states, footprint, gate isolation)
      /     L2     \      3 ATs — gatherLearningsCorpus / buildLearningsInjector over seams.js doubles
     /--------------\
    /       L1       \    12 ATs + supporting units — pure functions over literal fixtures
   /__________________\   plus L4: one cross-module pin against consolidate-learnings.js
```

There are **no E2E tests and no live model calls at any layer** (AC-6.1). The L3 tier is large for a
feature this size, and deliberately so: five of this feature's claims — the dispatch-universe set
equality, byte-identity against the recorded baseline, the report key's presence/absence, the
filesystem footprint and gate-input isolation — are *whole-run* claims that no injectable unit can
falsify. Pushing them down would produce green tests over a structurally unfalsifiable seam, which
is the failure mode the oracle checklist names. Everything that *can* be falsified at L1 is at L1.

**Scope boundary.** These properties cover the region between LI-15's sentinel comments in
`pdlc/workflows/orchestrate-dev.js`, the four hand-plumbed seam hops, `.gitignore`'s one added rule,
`scripts/capture-learnings-baseline.mjs`, and the fourteen new test files PLAN §File-ownership
manifest names. `consolidate-learnings.js` is **driven, never edited** — it is the pin's subject.
No SKILL.md text moves (BR-16).

**Property id grammar.** `PROP-{DOMAIN}-{NN}`, domains being `DISPATCH`, `CORPUS`, `ORDER`,
`BOUND`, `BLOCK`, `RECORD`, `FAILOPEN`, `CONFIG`, `ISOLATE`, `FOOTPRINT`, `META`. `META` properties
are the ones whose subject is the test apparatus itself (the baseline, the pin, the suite-map
closure, the arm inventory) — they are properties because PLAN gives each an owning task and an
oracle, and because three of them guard oracles that would otherwise silently stop firing.

## Properties

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Obligations and Routed Errata
