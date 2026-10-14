---
feature: pdlc-help
status: draft
---

# PROPERTIES: pdlc help

Source: [approved REQ](REQ-pdlc-help.md), [FSPEC](FSPEC-pdlc-help.md), [TSPEC](TSPEC-pdlc-help.md), and [PLAN](PLAN-pdlc-help.md). Test names below are the required executable tests for PLAN task P1; they are not claims that tests already pass.

| ID | Property | Required executable test |
|---|---|---|
| PROP-HELP-01 | Both general forms, `pdlc --help` and `pdlc help`, exit 0 and show the same general command information, including all eight named commands. Neither emits an unknown-command error. | `cli.test.js`: `help: both general forms show all commands and exit zero` — spawn the package entry point for each form, assert status, named commands, and absence of error text. Covers REQ-HELP-01, REQ-HELP-02, AC-HELP-01, and AC-HELP-02. |
| PROP-HELP-02 | For each supported named command (`dev`, `queue`, `decide`, `stats`, `doctor`, `hello`, `spike:sdk`, `version`), `<command> --help` exits 0 and shows that command's syntax and applicable flags. | `cli.test.js`: `help: every named command shows its syntax and applicable flags` — one table-driven subprocess case per name. Check flag-bearing commands against explicit expected flags, including `version`'s existing inspection flags; check `hello` and `spike:sdk` for syntax without invented flags. Covers REQ-HELP-03 and AC-HELP-03. |
| PROP-HELP-03 | The same help inputs under the same environment produce byte-identical standard output, standard error, and exit status. | `cli.test.js`: `help: repeated inputs produce byte-identical output` — run each general and command-specific form twice from the same fixed working directory and environment; compare raw `stdout`, `stderr`, and status. This is the determinism oracle. |
| PROP-HELP-04 | Recognized help from a directory with no Git repository, project files, plugin root, or provider credentials succeeds without dispatch or project writes. | `cli.test.js`: `help: clean directory needs no credentials or project setup` — run all ten forms from a newly made temporary directory with provider credential and PDLC project variables removed; pass no plugin-root or REQ path; assert exit 0 and expected help. Snapshot directory entries before and after and assert byte-identical contents. Covers REQ-HELP-04/05 and AC-HELP-04/05. |
| PROP-HELP-05 | `dev --help` and `queue --help` reach help without resolving an engine version or invoking a workflow. Other recognized help forms never enter their normal command handlers. | `launch-wiring.test.js`: `help: launcher bypasses version resolution and dispatch` — inject an `exec` that fails if called, an `fs` double that fails if the version store is read, and a `runMain` recorder; assert each launcher call takes the help route. `cli.test.js`: `help: command handlers are not entered` — assert no startup, doctor, version report, SDK probe, workflow, or dispatch markers appear in the ten help outputs. Covers REQ-HELP-05 and AC-HELP-05. |
| PROP-HELP-06 | Non-help unknown commands and invalid command flags retain their existing usage-error status and message. | `cli.test.js`: keep `an unknown command prints the usage block naming dev and queue`, `EC-CLI-7: an unknown flag (a typo) is a usage error, exit 1, nothing resolved`, and `EC-CLI-7: a flag valid for one command but not another is still a usage error` green. Covers the REQ scope statement and AC-HELP-06. |

## Applicability of standing properties

| Standing property | Applicability |
|---|---|
| Point-in-time / no lookahead | Not applicable. Help has no as-of date or dated data input, and produces no market or historical result. |
| Product-boundary edge count | Not applicable. This CLI display feature adds no cross-product edge or allowlist entry. This repository has no `tests/boundary/` suite. |
| Default/disabled configuration byte identity | Not applicable. Help is an explicit command request, not a configuration-gated behavior with a default-disabled branch. Preserve ordinary non-help command behavior through PROP-HELP-06. |
