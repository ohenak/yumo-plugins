# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.1, se-author)
**Date:** 2026-08-28
**Iteration:** 1
**Scope:** Local

## Findings

Verified at HEAD on `feat-pdlc-decision-ledger`. Every file the task table names was checked for
existence; every coverage claim was checked against the current suite layout.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T-03's cited verification command cannot run.** The row reads "count verified: `git ls-tree -r --name-only 8c673a09f` under the four `DECISION_CORPUS_ARGV` globs yields 25". `git ls-tree` rejects `:(glob)` pathspec magic — running it verbatim returns `fatal: :(glob)docs/_decisions/DECISIONS-*.md: pathspec magic not supported by this command: 'glob'`. The **number is right** (25 at `8c673a09f`, 26 live, both re-derived here by another route), so this is an evidence/reproducibility defect, not an arithmetic one. It matters because the frozen-fixture provenance is the whole anti-drift argument for REQ-DECLEDGER-01's expected value, and the implementer of T-03 will hit a fatal error on the first command the PLAN hands them. **Fix:** cite a command that actually runs at that commit (e.g. `git ls-tree -r --name-only 8c673a09f \| grep -E '...DECISIONS-[^/]*\.md$'`), or state the enumeration is `git ls-files`-only and the historical count was taken by a documented equivalent. | REQ-DECLEDGER-01 (frozen-corpus expected value); REQ §7 O-6 |
| F-02 | Medium | Local | **T-20's version bump names no target and omits the constraint that binds it.** The row says bump `pdlc/.claude-plugin/plugin.json` `version` "from `0.23.6`" — no destination value. The bump is not free: `pdlc/engine/package.json` declares `"pdlcPluginCompat": "^0.23.0"` (line 18), and `pdlc/workflows/__tests__/documentOracles.test.js`'s post-sweep AT-1.6 / DEC-09 handshake check asserts the plugin version satisfies that range (the older `advertisedVersionViolation` oracle it replaced is retired — the file's own header records this). A `0.24.0` bump therefore reds batch 10 and halts the wave at the last task, after all six serialised production batches have landed. **Fix:** name the target explicitly (`0.23.7`) and cite the `^0.23.0` range plus the handshake check as the reason, so the constraint travels with the task. | Repo release convention (`CLAUDE.md` runtime-build rule, `pdlc/RELEASE-CHECKLIST.md`); no REQ AC |
| F-03 | Medium | Local | **T-19's three documentation deliverables have no test owner, and the test file it names carries no assertion about them.** T-19 ships four artefacts: the `.claude/pdlc.config.example.json` block (covered — T-12's engine disclosure test un-skips here) and prose in `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` (**uncovered**). The row lists `pdlc/workflows/__tests__/documentOracles.test.js` as a test file and the ownership manifest assigns it to T-19, but the Red-before-green table pairs T-12→T-19 on the *engine* test only, and no task adds a `decisionLedger` assertion to `documentOracles.test.js`. That file's live oracle families are the D-1/D-3 doc-correction checks, the advisory-tier disclosure family (explicitly *confined* to OPERATIONS.md by its own test at ~:625) and the DEC-09 handshake — none of which moves when the decision-ledger prose is absent. So the only thing standing behind three of T-19's four deliverables is a manual DoD checkbox, which is an absence-only guarantee. This is precisely the `pdlc-loop-economics` F-6 stale-catalogue lesson the row itself cites as its motivation. **Fix:** either give T-19 a real red predecessor that adds a positive oracle (each of the three docs names `decisionLedger` and its three keys), or delete `documentOracles.test.js` from T-19's Test File column and the ownership manifest and state plainly that the prose is operator-verified. | FSPEC Q-3 (disclosure precedent); REQ NG-6 |
| F-04 | Low | Local | **The Overview's scope statement understates what ships outside `orchestrate-dev.js`.** "Two files outside it change: the tracked `.claude/pdlc.config.example.json` disclosure … and a new `pdlc/engine/__tests__/decision-ledger-config-example.test.js`." The task table — which is correct and complete — also ships `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` (T-19), `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` (T-20), plus fourteen new test/fixture paths. The Overview is where a PM reads the blast radius; it should agree with the manifest. **Fix:** say "two *production-adjacent config/test* files, plus T-19's three documentation files and T-20's two generated/manifest files", or drop the count. | Scope statement vs. §Batches / ownership manifest |
| F-05 | Low | Local | **"greens land in batches 3–8" is contradicted by the task table.** §Overview's "Two RED-terminal batches" paragraph says the greens land in batches 3–8, but T-19 is tagged `[green]` and sits in batch 9. The intended claim is that the six greens *writing `orchestrate-dev.js`* land in 3–8, which is true and is what the ownership manifest states. **Fix:** qualify the sentence with "the six production-file greens". | §Overview vs. §Batches T-19 |

**Nothing rises to High.** Every P0 and P1 acceptance criterion has a named owning task, and both
coverage tables are complete against the live upstreams (verified below).

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
