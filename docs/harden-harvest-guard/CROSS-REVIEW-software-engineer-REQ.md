# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md
**Date:** 2026-07-02
**Iteration:** 1

## Existing-Code Claim Verification (single pass)

| Claim in REQ | Verified against | Result |
|---|---|---|
| Guard matches only literal `CROSS-REVIEW`/`CODE_REVIEW` tokens (`guard-harvest-before-delete.sh:35`) | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35` | Accurate |
| Guard matches only `rm`/`unlink`/`git rm` verbs (`:37`) | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:37` | Accurate |
| Guard checks disk existence, not commit state (`:52`) | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:52` (`glob.glob(... "LEARNINGS-*.md")`) | Accurate |
| Scope check matches bare substring `scope` (`check-scope-field.sh:41`) | `pdlc/hooks/scripts/check-scope-field.sh:41` (`grep -qiE 'scope|cross-feature'`) | Accurate |
| Existing test suite location `pdlc/workflows/__tests__/hookCompatibility.test.js` (REQ-GUARD-05) | File exists | Accurate |
| harvest-learnings prompt ordering "already correct" (Out of Scope) | `pdlc/skills/harvest-learnings/SKILL.md:27,43` — commit+push LEARNINGS first, delete in a second commit | Accurate |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Fail-closed rule is circular: "when the guard cannot determine the target paths of a deletion verb **aimed at `docs/`**, it SHALL block" presupposes the guard already knows the command targets `docs/` — which is exactly the determination that failed. Commands like `rm $FILES`, `cd docs/f && rm *.md`, or `xargs rm < list.txt` contain a deletion verb but no `docs/` literal, so the rule as written neither blocks nor allows them deterministically. REQ must define the *detectable trigger* for fail-closed (e.g. "deletion verb + any argument that is not a statically resolvable path ⇒ block", or explicitly scope out variable/cwd-relative/indirect targets as residual risk alongside the Write-tool vector). | REQ-GUARD-01 |
| F-02 | High | Local | No arbitration between fail-closed (REQ-GUARD-01) and no-false-blocks (REQ-GUARD-NFR-01), and no parsing-strategy constraint. `git commit -m "rm docs/f cleanup"` contains the token `rm` and `docs/` — a text-level matcher must block it under GUARD-01's fail-closed rule, yet NFR-01 (P0) forbids blocking non-deleting commands. Implementing both requires shell-grammar-aware tokenization (verbs in command position only; ignore quoted strings/heredocs), which the REQ neither requires nor acknowledges. State the required parsing discipline or an explicit precedence rule for the conflict; otherwise TSPEC cannot satisfy both P0 requirements simultaneously. | REQ-GUARD-01 / REQ-GUARD-NFR-01 |
| F-03 | Medium | Local | US-01 promises "**any** Bash command that would delete files under `docs/{feature}/`" but REQ-GUARD-02 delivers an enumerated verb blocklist, which is structurally fail-open: `xargs rm`, `rsync --delete`, `perl -e 'unlink'`, `python -c "os.remove(...)"`, `sed -i`, `cp /dev/null <file>`, `shred` all bypass it. Either reword US-01 to the covered verb set and document the enumerated-blocklist residual risk next to the existing Write-tool residual-risk note, or specify a stronger strategy. Also unspecified: is `>>` (append — not destructive) treated like `>`? Is `2>` onto a guarded file in scope? | US-01 / REQ-GUARD-02 |
| F-04 | Medium | Local | Missing error path: no remote, no upstream, or detached HEAD. If `origin` does not exist or the branch has never been pushed, `origin/{branch}` is unresolvable and fail-closed means deletion is permanently blocked in remoteless checkouts (including CI clones and the GUARD-05 test harness itself). Specify the behavior (block with actionable message? fall back to local-commit presence?). Additionally, the AC matrix omits the committed-locally-but-not-pushed case that the requirement title ("Committed-and-pushed") makes normative — add it. | REQ-GUARD-03 |
| F-05 | Medium | Cross-Feature | Interpreter-absent path contradicts the fail-closed headline: both scripts fail **open** when no Python interpreter is found (`guard-harvest-before-delete.sh:21` — `[ -z "$PY_BIN" ] && exit 0`). The REQ is silent on this path while its stated goal is "make the pdlc hook layer fail closed"; on a machine without Python the entire hardening is void. State explicitly whether missing-interpreter is accepted residual risk (fail open) or must fail closed — and note the Assumptions section ("no new runtime dependencies beyond git") is already inaccurate, since the current scripts depend on Python for JSON parsing. | Scope/Assumptions / REQ-GUARD-01 |
| F-06 | Low | Local | "Canonical refusal message" (GUARD-01 AC) and the GUARD-03 message "naming the missing commit/push step" are referenced but never defined. GUARD-05 tests need a stable string oracle — either pin the message text in the REQ/FSPEC or explicitly delegate ownership to TSPEC. | REQ-GUARD-01 / REQ-GUARD-03 |
| F-07 | Low | Local | Accepted `Scope` forms are too narrow: `**Scope:** Local` (bold markdown, common in these docs) matches neither `^Scope:` nor `| Scope |`. An advisory that false-warns on legitimate variants recreates the noise US-03 exists to eliminate. Enumerate the accepted forms against the canonical cross-review template (table column `| Scope |`, line `Scope:`, bold `**Scope:**`). | REQ-GUARD-04 |
| F-08 | Low | Local | `git clean` only removes *untracked* files; cross-review artifacts are committed and pushed per the workflow, so `git clean -fd docs/f` cannot delete them in the normal case. Blocking it mostly guards a non-threat while adding false-block surface during workspace cleanup. Keep it if desired, but state the rationale (protects not-yet-committed review files) so TSPEC doesn't treat it as arbitrary. | REQ-GUARD-02 |
| F-09 | Low | Local | GUARD-05's block/allow matrix for GUARD-03 requires a git *remote* fixture (e.g. `git init --bare` as `origin`) to exercise pushed vs unpushed states, and the hooks themselves silently no-op without Python — an implicit CI environment assumption. One sentence in the REQ scoping the test-harness requirements would prevent TSPEC underestimating this. | REQ-GUARD-05 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is `mv` *within* the same feature directory (e.g. renaming `CODE_REVIEW-f-v1.md` → `CODE_REVIEW-f-v1-old.md`) allowed? REQ-GUARD-02 implies yes (destination inside `docs/{feature}/`), but no acceptance criterion pins it and a rename also destroys the guarded filename pattern. |
| Q-02 | When a deletion verb targets a `docs/{feature}/` directory that contains **no** `CROSS-REVIEW-*`/`CODE_REVIEW-*` files, is the command unguarded even if target paths are only partially resolvable? The fail-closed rule's interaction with "directory containing guarded files" is unstated for the unresolvable case. |

## Positive Observations

- Every existing-code claim carries a file:line citation, and all six verified accurately against the current scripts, SKILL.md, and test suite (see table above) — rare and appreciated.
- The threshold-declaration discipline is followed: remote-ref freshness is explicitly declared with owner and default (`GUARD_FETCH_BEFORE_CHECK`, default `false`).
- Out of Scope correctly identifies the PostToolUse-cannot-veto limitation for Write-tool truncation and documents it as residual risk rather than pretending to cover it.
- Acceptance criteria are written as a concrete block/allow matrix (Who/Given/When/Then), which maps directly onto the GUARD-05 test obligation.

## Recommendation

**Needs revision**

Required changes before FSPEC authoring:
1. F-01: define the detectable trigger condition for fail-closed blocking (what signal, observable in the command text, mandates a block when paths are unresolvable) and state whether cwd-relative/variable-indirected deletions are in scope or residual risk.
2. F-02: specify the parsing discipline (verbs in command position only, quote/heredoc-aware) or a precedence rule between GUARD-01 and NFR-01 — both are P0 and currently unimplementable together.
3. F-03: reconcile US-01's "any Bash command" with GUARD-02's enumerated verb list; document the blocklist residual risk explicitly.
4. F-04: specify no-remote/no-upstream/detached-HEAD behavior and add the committed-but-not-pushed AC.
5. F-05: state the missing-interpreter policy (fail open vs closed) and correct the Assumptions line about runtime dependencies.
