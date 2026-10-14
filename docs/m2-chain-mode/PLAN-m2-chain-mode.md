# PLAN: Opt-in M2 chain mode

Each row owns disjoint paths. Complete artifact validation before implementation changes; gate each task by its focused tests. No queue-row flip is planned because there is no `m2-chain-mode` row in `docs/_queue/QUEUE.md`.

| Task | Deps | Owner paths | Gate |
| --- | --- | --- | --- |
| A. Input validator and one-pass artifact author/gates | Accepted issue and REQ, seam map, issue decisions | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/chain-mode.test.js` | Nonempty inputs and issue URL pass before authoring; missing later artifacts get one author pass; empty artifacts or FSPEC REQ-ID mismatch halt; review dispatch count zero. |
| B. CLI opt-in and help | A interface agreed | `pdlc/engine/bin/cli.mjs`, `pdlc/engine/__tests__/cli.test.js` | Paired mode and accepted-issue options parse and pass URL; default bytes/behavior preserved. |
| C. Exact branch-head Actions CI and bounded repair | A interface agreed | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/chain-ci.test.js` | Every returned exact-SHA branch push run completes successfully; no/stale/failed runs halt; one repair then fresh result; second red halts. |
| D. One-verdict pre-PR DoD and integrated report gate | A-C | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/chain-mode.test.js`, `pdlc/workflows/__tests__/chain-report.test.js` | One verifier writes issue-citing `CODE_REVIEW` with local test/privacy evidence; missing or failed verdict halts without remediation. PUB owns PR/head CI and red/repair evidence; PR stays open and MERGE is skipped. Default tests pass. |

Tasks A, C, and D share the orchestrator file and must run sequentially. Task B owns only CLI paths and may run parallel with A once the option contract is fixed. Pathspec commits must include only task-owned files. The gatekeeper checks the artifact set and diff before each commit.
