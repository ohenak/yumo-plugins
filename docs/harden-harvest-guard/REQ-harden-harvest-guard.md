---
Status: Draft
Author: pm-author
Version: 1.0
Feature: harden-harvest-guard
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# REQ — harden-harvest-guard

Make the pdlc hook layer fail closed. Today `guard-harvest-before-delete.sh` only blocks deletions whose command text contains the literal tokens `CROSS-REVIEW`/`CODE_REVIEW` and only for `rm`/`unlink`/`git rm` — so `rm docs/{feature}/*.md`, `find -delete`, `git clean`, and `mv` all bypass it, and the guard passes when LEARNINGS merely exists on disk (uncommitted). `check-scope-field.sh` greps the substring `scope` anywhere in the file, so unrelated prose false-passes. The hooks exist to protect process artifacts; right now they protect only against the politest possible deletion.

---

## Background

The Harvest phase (Phase H) distills `CROSS-REVIEW-*` / `CODE_REVIEW-*` files into `LEARNINGS-{feature}.md` and then deletes them. Two hooks defend this:

- `guard-harvest-before-delete` (PreToolUse: Bash) — meant to block deletion until LEARNINGS exists.
- `check-scope-field` (PostToolUse: Write|Edit) — meant to warn when a review doc lacks a `Scope:` field.

Gap review findings (2026-07-01): guard is trivially bypassed by glob deletion or non-`rm` verbs (`guard-harvest-before-delete.sh:35,37`); guard checks disk existence not commit state (`:52`); scope check matches `scope` as a bare substring (`check-scope-field.sh:41`).

---

## Scope

### In Scope

- Rewrite `guard-harvest-before-delete.sh` matching and verification logic
- Anchor `check-scope-field.sh` to an actual `Scope:` field
- Unit-style tests for both hook scripts (bash, runnable in CI)

### Out of Scope

- New hooks or hook events
- Changes to harvest-learnings SKILL.md ordering rules (prompt already correct)
- Blocking non-Bash deletion vectors (Write-tool truncation) — PostToolUse cannot veto; documented as residual risk
- Changes to orchestrate-dev.js phase ordering (separate feature: harvest-after-pub)

### Assumptions

- Hooks remain POSIX-compatible bash, no new runtime dependencies beyond git
- Hook stdin contract (JSON with `tool_input.command` / `tool_input.file_path`) is stable per Claude Code hook API

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a pdlc user, I want any Bash command that would delete files under `docs/{feature}/` to be blocked unless the feature's LEARNINGS is committed and pushed, so that process artifacts cannot be destroyed before their signal is durably preserved. |
| US-02 | As a pdlc user, I want the guard to recognize deletion however it is spelled (globs, `find -delete`, `git clean`, `mv` out of the tree), so that the protection does not depend on the deleting agent's phrasing. |
| US-03 | As a pdlc maintainer, I want the scope-field warning to fire only on a genuinely missing `Scope:` field, so that the nudge is a signal rather than noise. |
| US-04 | As a pdlc maintainer, I want hook behavior covered by tests, so that future edits cannot silently reopen the bypass. |

---

## Requirements

### Domain: GUARD — Deletion Guard

#### REQ-GUARD-01
**Title:** Path-based, fail-closed deletion matching

**Description:** The guard SHALL decide based on the *target paths* a command can affect, not on the presence of literal filename tokens in the command text. Any Bash command whose arguments resolve to (or glob over) paths under a `docs/{feature}/` directory containing `CROSS-REVIEW-*` or `CODE_REVIEW-*` files SHALL be treated as a guarded deletion when the command is a deletion verb. When the guard cannot determine the target paths of a deletion verb aimed at `docs/`, it SHALL block (fail closed) rather than allow.

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** `docs/f/CROSS-REVIEW-x.md` exists and LEARNINGS is not committed / **When:** it runs `rm docs/f/*.md` / **Then:** the hook exits 2 (block) with the canonical refusal message.
- **Who:** harvest agent / **Given:** same state / **When:** it runs `rm docs/f/CROSS-REVIEW-x.md` / **Then:** blocked (existing behavior preserved).
- **Who:** any agent / **Given:** same state / **When:** it runs `rm src/foo.ts` / **Then:** allowed — guard scopes to `docs/` only.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-02

#### REQ-GUARD-02
**Title:** Deletion-verb coverage

**Description:** The guard SHALL recognize at minimum: `rm`, `unlink`, `git rm`, `git clean`, `find … -delete`, `find … -exec rm`, `mv` whose destination is outside the feature's `docs/{feature}/` directory (including `/tmp`, `/dev/null`), and shell redirection truncation (`>` / `truncate`) onto a guarded file. Verbs may appear after `;`, `&&`, `||`, or `|` in a compound command.

**Acceptance criteria:**
- **Who:** agent / **Given:** guarded files present, LEARNINGS uncommitted / **When:** `find docs/f -name 'CROSS-*' -delete` or `git clean -fd docs/f` or `mv docs/f/CODE_REVIEW-f-v1.md /tmp/` / **Then:** blocked.
- **Who:** agent / **Given:** LEARNINGS committed and pushed / **When:** any of the above / **Then:** allowed.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-GUARD-03
**Title:** Committed-and-pushed LEARNINGS verification

**Description:** The guard SHALL verify `LEARNINGS-{feature}.md` is present in the history of the current branch's upstream (`git cat-file` / `git ls-tree` against `origin/{branch}` or `git log --follow` on the remote-tracking ref), not merely present on disk. Disk-only LEARNINGS SHALL block with a message naming the missing commit/push step.

Threshold declaration: **remote-ref freshness window** — the guard uses the local remote-tracking ref as-is (no forced `git fetch`; default: trust last fetch). Config owner: hook script constant `GUARD_FETCH_BEFORE_CHECK` (default `false`).

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** LEARNINGS written to disk but not committed / **When:** it deletes a guarded file / **Then:** blocked, message says "LEARNINGS not committed/pushed".
- **Who:** harvest agent / **Given:** LEARNINGS committed and present on `origin/feat-f` / **When:** deletion / **Then:** allowed.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

### Domain: GUARD — Scope Field Check

#### REQ-GUARD-04
**Title:** Anchored Scope-field detection

**Description:** `check-scope-field.sh` SHALL only pass when the written file contains a line matching `^Scope:` or a `| Scope |`-style table field (anchored, case-sensitive on the field name), scoped to `CROSS-REVIEW-*` / `CODE_REVIEW-*` files. Substring matches inside prose SHALL NOT count.

**Acceptance criteria:**
- **Who:** reviewer agent / **Given:** it writes a CROSS-REVIEW containing the word "telescope" but no `Scope:` line / **When:** hook fires / **Then:** warning emitted.
- **Who:** reviewer agent / **Given:** review has `Scope: Local` line / **When:** hook fires / **Then:** silent.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

### Domain: GUARD — Tests

#### REQ-GUARD-05
**Title:** Hook regression tests

**Description:** Both hook scripts SHALL have automated tests exercising every acceptance criterion above (block/allow matrix), runnable via a single command in the repo and wired into the existing test suite (`pdlc/workflows/__tests__/hookCompatibility.test.js` or a shell-test harness).

**Acceptance criteria:**
- **Who:** maintainer / **Given:** the repo checkout / **When:** they run the test suite / **Then:** guard bypass cases (glob, find -delete, git clean, mv, uncommitted LEARNINGS) each have a failing-before/passing-after test.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-04

### Domain: NFR

#### REQ-GUARD-NFR-01
**Title:** No false blocks on unrelated commands

**Description:** The guard SHALL NOT block Bash commands that neither delete nor move files under `docs/` (e.g. `grep -r CROSS-REVIEW docs/`, `cat docs/f/CROSS-REVIEW-x.md`). Read-only mention of guarded filenames is not deletion.

**Acceptance criteria:**
- **Who:** any agent / **Given:** guarded files exist, LEARNINGS uncommitted / **When:** `grep CROSS-REVIEW docs/f/*.md` / **Then:** allowed.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

---

## Open Questions

None — behavior fully specified by the block/allow matrix above.
