# M1 `pdlc-help` issue decisions

Recon date: 2026-10-14. Read [yumo-plugins issue #86](https://github.com/ohenak/yumo-plugins/issues/86), its body, and all three comments using `gh issue view --json`. The issue is **open**. A search of all yumo-plugins issue titles for `pdlc help` found #86 only. The operator's explicit comments below are rulings despite the issue remaining open; the opening body is a proposal and question list, not a ruling.

| Source and state | Operator decision | Requirement or design point settled |
|---|---|---|
| [#86, operator comment 6163384317](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163384317); issue open | Support `pdlc --help`, `pdlc help`, and `pdlc <command> --help`. Print matching usage, exit successfully, and work without provider credentials or project setup. | REQ-HELP-01 through REQ-HELP-04; settles the opening body's form, exit, and setup questions. |
| [#86, operator comment 6163650686](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163650686); issue open | Command-specific help shows that command's syntax and flags. | REQ-HELP-03 output contract. |
| [#86, operator comment 6163694833](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163694833); issue open | Approve the M1 REQ and build. Keep REQ and proposal under the yumo-plugins repository docs tree; continue the conversation in the yumo-plugins workspace from M2. | REQ `ready: true`, queue row 35 `in-progress`, and M1 documentation location. |

The issue body asks for delivery evidence, including tests, exact command results, an implementation commit, a pull request, and CI evidence. These are requested evidence items, not a claim that delivery occurred. No comment approves `-h`, changes invalid-flag behavior, or closes the issue.
