---
feature: pdlc-help
status: draft
---

# FSPEC: pdlc help

Source: [approved REQ](REQ-pdlc-help.md), [issue decision record](_evidence/issue-decisions.md), and the operator's [invocation and setup decision](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163384317), [command output decision](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163650686), and [M1 sign-off](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163694833).

## User-visible behavior

`pdlc --help` and `pdlc help` show the general command list and finish with exit status 0. The list names all current supported commands: `dev`, `queue`, `decide`, `stats`, `doctor`, `hello`, `spike:sdk`, and `version`. Both forms give the operator the same general usage information. They produce no unknown-command error.

`pdlc <command> --help` shows the selected command's invocation syntax and applicable flags, then finishes with exit status 0. The command set is the eight named commands above. For `dev`, `queue`, `decide`, `stats`, and `doctor`, the display covers every currently supported flag for that command and distinguishes value flags from switches. `version` also shows the flags that affect its existing version-inspection path (`--cwd`, `--plugin-root`, and `--dev`). `hello` and `spike:sdk` show their invocation syntax; neither has a defined command flag set. General text may also appear, but it cannot replace the selected command's syntax and applicable flags. See the [CLI seam map](_evidence/seam-map.md) for the current command and flag definitions.

Every help form works from an empty temporary directory outside a Git repository, with provider credentials and project-specific PDLC settings absent. It needs no plugin root or REQ path. Help does not start version resolution, authentication, startup checks, delivery, or provider dispatch, and it creates no project files.

The installed package maps `pdlc` to `pdlc/engine/bin/pdlc.mjs`; checks use that entry point. An unknown command or an invalid flag on a **non-help** request keeps its existing usage-error behavior. This spec does not define `-h`, combined help and malformed flags, or help for an unknown command.

## Acceptance and traceability

| Acceptance check | REQ clause | Evidence expected |
|---|---|---|
| AC-HELP-01: top-level flag | REQ-HELP-01 | Spawn the package entry point with `--help`; general list includes all eight named commands; status 0; no unknown-command message. |
| AC-HELP-02: top-level word | REQ-HELP-02 | Spawn it with `help`; same general command information; status 0. |
| AC-HELP-03: selected command | REQ-HELP-03 | Spawn each of the eight named commands with `--help`; each result shows that command's syntax and its applicable flags; status 0. |
| AC-HELP-04: no setup | REQ-HELP-04 | Repeat AC-HELP-01 through AC-HELP-03 from a temporary non-project directory with provider credentials and project settings removed from the subprocess environment; pass no plugin-root or REQ argument; all still pass. |
| AC-HELP-05: no work started | REQ-HELP-05 | Help calls make no dispatch or project writes. For `dev` and `queue`, verify the launcher does not resolve an engine version or enter startup work before showing help. |
| AC-HELP-06: existing errors | REQ scope statement | Existing unknown-command and invalid non-help flag tests keep their status and error behavior. |
