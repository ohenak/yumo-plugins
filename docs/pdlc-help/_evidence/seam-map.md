# M1 `pdlc-help` seam map

Recon date: 2026-10-14. Source requirement: [`REQ-pdlc-help.md`](../REQ-pdlc-help.md). This records existing behavior and likely change seams; it does not choose the implementation.

## Dependency graph and status

`pdlc-help` has no feature dependencies (`depends-on:` is empty in the approved REQ; [queue row 35](../../_queue/QUEUE.md) uses `—`). Its queue status is `in-progress`. No prerequisite branch or feature output must be merged before this work. The package requires Node 20 or later (`pdlc/engine/package.json`).

## Production path

| Path or symbol | Current behavior and relevance |
|---|---|
| `pdlc/engine/package.json` `bin.pdlc` | Maps the installed `pdlc` command to `bin/pdlc.mjs`; acceptance must exercise this entry point. |
| `pdlc/engine/bin/pdlc.mjs` | Checks the Node version and dynamically imports `cli.mjs`, then calls `launch()`. This is the actual packaged entry point, not a direct call to `main()`. |
| `pdlc/engine/bin/cli.mjs:59` `USAGE` | Holds current general usage text. It lists several commands but omits the named `version` form. Its text alone is insufficient to satisfy command-specific syntax and flags. |
| `pdlc/engine/bin/cli.mjs:169` `FLAGS_BY_COMMAND` and `:203` `validateFlags()` | Define/validate flags for `dev`, `queue`, `doctor`, `decide`, and `stats`. `hello`, `spike:sdk`, and `version` follow diagnostic branches without this flag table. A help display must accurately distinguish applicable flags without adding new executable flags. |
| `pdlc/engine/bin/cli.mjs:1336` `main()` | Dispatches `dev`, `queue`, `decide`, `stats`, `doctor`, `hello`, `spike:sdk`, and `version`, plus top-level `--version` and `-v` aliases. No help branch exists. Unknown commands print `USAGE`, then `Unknown command`, and set exit code 1. |
| `pdlc/engine/bin/cli.mjs:1402` `launch()` | Sends commands other than `dev` and `queue` to `main()`. For `dev`/`queue`, it can validate flags and resolve an engine version before `main()`; normal command handling may then reach startup checks or dispatch. Command help must take a safe route before these project-dependent steps. |

## Test and observation seams

| Path or command | Existing proof or test opportunity |
|---|---|
| `pdlc/engine/__tests__/cli.test.js:21` `run()` | Spawns the real `bin/pdlc.mjs`; existing tests cover unknown commands, usage errors, `doctor`, and `hello`. Extend this subprocess seam for all approved help forms, output, exit code, and no setup. Its current helper uses the repository as `cwd`, so a separate temporary non-project directory and clean environment are needed for REQ-HELP-04. |
| `pdlc/engine/__tests__/launch-wiring.test.js` | Exercises launcher routing and guards. Relevant if the implementation adds a help bypass for `dev`/`queue`; verify no version resolution or dispatch occurs. |
| `node pdlc/engine/bin/pdlc.mjs --help` | Observed at recon: general usage, then `Unknown command: --help`; exit 1. |
| `node pdlc/engine/bin/pdlc.mjs help` | Observed at recon: general usage, then `Unknown command: help`; exit 1. |

The approved REQ's symbols and paths exist at this branch tip: package bin mapping, Node guard, `launch()`, `main()`, `USAGE`, `FLAGS_BY_COMMAND`, `validateFlags()`, and the subprocess test file. Tests should also keep unknown-command and invalid non-help flag behavior intact. No provider credentials, plugin root, REQ file, or Git project should be required to obtain help.
