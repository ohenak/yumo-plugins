# PLAN: pdlc help

Source: [approved REQ](REQ-pdlc-help.md), [FSPEC](FSPEC-pdlc-help.md), [TSPEC](TSPEC-pdlc-help.md), [DECISIONS](DECISIONS-pdlc-help.md). Queue row 35 is `in-progress` with no feature dependency. The package entry point `pdlc/engine/bin/pdlc.mjs` and `pdlc/engine/package.json` require no edit.

| Task | Deps | Work and red-test order | File ownership |
|---|---|---|---|
| P1 · Properties and failing tests | Approved specs | Write testable properties. Add package-entry tests for both general forms and all eight command forms in a clean directory. Add launcher tests for `dev` and `queue` help bypass and mixed-form non-bypass. Run focused tests and record their expected red result before P2 edits production code. | docs/pdlc-help/PROPERTIES-pdlc-help.md; pdlc/engine/__tests__/cli.test.js; pdlc/engine/__tests__/launch-wiring.test.js |
| P2 · CLI help routing | P1 red tests | Add exact-shape classifier, general and command help output, and the early `launch()` and `main()` routes in `cli.mjs`. Keep normal command dispatch and invalid non-help errors. Run P1 tests until green. | pdlc/engine/bin/cli.mjs |
| P3 · Verification record | P2 green tests | Run scoped tests, boundary tests if present, and the full engine suite. Check output determinism, no dispatch or project write, all REQ IDs, and code reachability. Review the diff and record actual commands, results, and limits. | docs/pdlc-help/_evidence/help-verification.md |
| P4 · Learnings | P3 gate pass | Record what the feature-chain run taught and cite the gate evidence. | docs/pdlc-help/LEARNINGS-pdlc-help.md |

The ownership manifest above is disjoint. P1 must finish and show red tests before P2 starts. P3 is the Definition of Done gate; do not report delivery from a dry run or from tests that were not run. The operator creates the pull request, and continuous integration evidence must refer to its current head SHA. Do not start a full `pdlc dev` workflow without a separate operator decision on its automatic PR phase.
