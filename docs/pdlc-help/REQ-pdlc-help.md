---
feature: pdlc-help
ready: true
depends-on:
---

# REQ: pdlc help

| Field | Value |
|---|---|
| Status | Approved for M1 build by the operator on 2026-10-14 |
| Decision source | [yumo-plugins issue #86](https://github.com/ohenak/yumo-plugins/issues/86), the [decision on invocation and setup](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163384317), the [decision on command-specific output](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163650686), and [operator sign-off](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163694833) |
| Delivery target | The installed `pdlc` command, mapped by `pdlc/engine/package.json` to `pdlc/engine/bin/pdlc.mjs` |

## Problem

The current `pdlc --help` prints general usage, then reports `Unknown command: --help` and exits with status 1. An operator should be able to ask for usage before setting up a project or credentials.

## Requirements

| ID | Requirement | Observable acceptance check |
|---|---|---|
| REQ-HELP-01 | `pdlc --help` prints general usage and exits successfully. | Invoke the package CLI entry point with `--help`; output names the available commands, contains no unknown-command error, and exit status is 0. |
| REQ-HELP-02 | `pdlc help` has the same successful general-help behavior. | Invoke the package CLI entry point with `help`; check the same general usage and exit status 0. |
| REQ-HELP-03 | `pdlc <command> --help` prints that command's syntax and applicable flags, then exits successfully. | Invoke the package CLI entry point with each supported named command listed below followed by `--help`; output identifies the command's invocation and its applicable flags, and exit status is 0. Commands with no applicable flags need no invented flags. |
| REQ-HELP-04 | All three help forms work without provider credentials or project setup. | Run the preceding subprocess checks from a newly created temporary directory outside a Git repository, with provider credential variables and project-specific PDLC settings absent. Do not pass a plugin root or create a REQ file. Every help invocation still exits 0 and prints its usage. |
| REQ-HELP-05 | Help is informational and does not start a delivery workflow. | The help checks produce no dispatch or workflow run, and do not create project files. |

## Scope and decision record

The operator approved all three invocation forms, successful exits, and use without credentials or project setup in the first linked comment. The second linked comment requires each command's syntax and flags in command-specific help. The third linked comment approves this M1 requirement for build. These are recorded decisions, not open questions.

The current CLI's supported named commands are `dev`, `queue`, `decide`, `stats`, `doctor`, `hello`, `spike:sdk`, and `version` (`pdlc/engine/bin/cli.mjs`, `main()` dispatch). REQ-HELP-03 covers these names. The existing top-level `--version` and `-v` aliases are version requests, not additional `<command> --help` forms. The exact wording and layout of help text remain implementation choices, provided the checks above pass.

The existing command behavior outside help is not part of this feature. Unknown commands and invalid non-help flags continue to report usage errors.

## Evidence available before implementation

`pdlc/engine/package.json` maps `pdlc` to `bin/pdlc.mjs`, which delegates to `bin/cli.mjs`. The latter holds the general `USAGE` text, the named-command dispatch, and command flag lists. `pdlc/engine/__tests__/cli.test.js` already exercises the package entry point as a subprocess, including unknown-command behavior. Running `node pdlc/engine/bin/pdlc.mjs --help` in the isolated worktree prints `Unknown command: --help` and exits 1.
