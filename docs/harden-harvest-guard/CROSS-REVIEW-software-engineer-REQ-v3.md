# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md (Version 1.2)
**Date:** 2026-07-02
**Iteration:** 3

## Iteration-2 Finding Resolution Verification

Each v2 finding's claimed disposition was checked against the actual v1.2 sections, not taken on trust:

| Iter-2 finding | Claimed resolution | Verified against actual section | Result |
|---|---|---|---|
| F-01 (High — D2 misses ancestor paths and the guarded dir itself) | D2 extended; M47–M51 | D2 now enumerates (iii) the unverified guarded directory itself and (iv) any ancestor for recursive-capable forms, with the recursive-capable set named (`rm -r/-R`, `find <root> -delete`/`-exec`, `git clean` w/ pathspec, `mv` of a dir) and the non-recursive fall-through stated; `find` ancestor-root rule explicitly ignores `-name` filters; mv table gained the ancestor row; matrix rows M47 (`rm -rf docs/f`), M48 (`rm -rf docs`), M49 (`rm -rf .`), M50 (`find . -name '*.md' -delete`), M51 (`find docs -delete`) all present with correct reason codes | Resolved |
| F-02 (Medium — "unquoted" contradictory; quoted-target bypass) | Steps 1/5 rewritten; M44–M46 | Step 1 now separates literal-vs-expandable from scanned-vs-unscanned (quote removal precedes classification; data exclusion is by position, not quoting); step 5 defines "expansion-active" correctly per shell semantics (single quote/backslash suppress, double quotes do not — `"$D"` indeterminate, `'$D'` static); D3(a) literal test declared quote-independent with the assignment-RHS rule M24 depends on now explicit in D3(a)(2); M44/M45 (quoted static targets → BLOCK) and M46 (quoted assignment RHS → INDETERMINATE) present; NFR-01 wording aligned ("quoting alone does not make an operand data") | Resolved |
| F-03 (Medium — compound-wide D3 discriminator over-blocks; `2>&1` a "target") | D3(a) narrowed; fd-dup excluded; M55–M56 | D3(a) now scoped to the deletion segment's own operands/redirection targets plus its dataflow (assignment RHS it expands, piped producers, `cd` context), with the cross-segment negative stated; REQ-GUARD-02 explicitly excludes fd-duplication forms (`2>&1`, `>&2`, `N>&M`) from redirection targets; M55/M56 pin the exact command shapes from the finding as ALLOW; RR-2 rewritten to record the accepted cross-segment-only remainder | Resolved |
| F-04 (Low — fetch toggle declared a script constant) | Env-var mechanism | Both `GUARD_FETCH_BEFORE_CHECK` and `GUARD_FETCH_TIMEOUT_SECS` re-declared as environment variables read at invocation, unset/empty ⇒ default | Resolved |
| F-05 (Low — degraded matcher input; co-occurring degradations) | Raw-stdin matching + precedence | REQ-GUARD-06 pins the coarse matcher to raw stdin text, names and accepts field-bleed, and fixes precedence (`DEGRADED` before `PARSE_ERROR`, with the reason: parse-error detection needs the interpreter) | Resolved |
| F-06 (Low — state rows pin no command; M33 bulk mapping) | Commands pinned | M34–M40 each pin `rm docs/f/CROSS-REVIEW-x.md`; M33 and the GUARD-05 AC state the one-test-per-referenced-row expansion with parameterized tests acceptable | Resolved |
| Q-01 (degraded mode skips bash-feasible git check — intended?) | Answered in REQ-GUARD-06 | REQ-GUARD-06 answers yes, with rationale (replicating path resolution in bash would reintroduce the coarse guard this REQ retires) and states the intended posture (block until `python3` installed) plus the NFR-01 carve-out | Answered |

## Existing-Code Claim Verification (single pass)

No new existing-code claims were added in v1.2; the v1.0/v1.1 citations (`guard-harvest-before-delete.sh:21,:30,:35,:37,:52`, `check-scope-field.sh:41`, PROP-COMPAT-05 migration note) were re-verified as still accurate against the current scripts. One additional observation made for finding F-01 below: the current script resolves relative paths against `CLAUDE_PROJECT_DIR` falling back to `os.getcwd()` (`guard-harvest-before-delete.sh:40`) — a root-selection ambiguity the REQ's rewrite does not yet pin down.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The initial effective cwd — the root against which static relative operands and globs resolve — is unspecified, and cross-call cwd drift silently reopens a static bypass.** Parsing step 4 tracks `cd` only *within* a single compound command; nothing says what the effective cwd is at segment 1. The Claude Code Bash tool persists its shell cwd *across* tool calls, while the hook process runs with its own cwd (and the current script already hedges between two roots: `CLAUDE_PROJECT_DIR` vs `os.getcwd()`, `guard-harvest-before-delete.sh:40`). Consequence: call 1 `cd docs/f` (allowed — D1, no deletion verb), call 2 `rm *.md` — the operand is fully **static** (no expansion-active construct), so D3/RR-2 never apply; the guard resolves the glob against whatever root it assumed (repo root ⇒ no guarded match ⇒ ALLOW) while the real shell deletes the guarded files in `docs/f`. RR-2 does not cover this: its "cd context" and "previous Bash tool call" language is scoped to *indeterminate* deletions, and this command has none. Required: pin the initial-effective-cwd source (the hook stdin's `cwd` field if it tracks the persistent shell cwd; else `CLAUDE_PROJECT_DIR`), and — if the harness cannot expose the persisted shell cwd — record cross-call `cd` drift as an explicit residual-risk row (RR-5) with a matrix row exercising whichever behavior is chosen. Cheap fix, but it is load-bearing for every D2 resolution and must be decided in the REQ, not discovered in TSPEC. | REQ-GUARD-01 step 4 / D2 / Residual Risk Register |
| F-02 | Low | Local | **Truncating-redirection and flag spelling variants of already-defended forms are unclassified.** Bash `&> file` and `>& file` truncate the target exactly like `>` (M14) but appear in neither the defended redirection set (`>`, `1>`, `>|`, `2>`) nor RR-1 (which enumerates *verbs* only); note `>& file` must also be disambiguated from the excluded fd-dup form `>&2`. Similarly, recursive-capable detection pins `-r`/`-R` but not GNU `rm --recursive`, so `rm --recursive docs` misses D2 iv. Same family as iter-2 TE F2-05 (`1>`/`>|`): either add these spellings to the enumerations (with a matrix row each) or extend RR-1's wording to cover spelling variants of defended forms so the residual class is recorded rather than implied. | REQ-GUARD-02 redirection / D2 iv / RR-1 |
| F-03 | Low | Local | **`unlink` is the only defended verb with zero Canonical Matrix rows.** GUARD-05 makes the matrix the exclusive test oracle ("every row … exactly one asserting test"), so a verb absent from the matrix is a verb with no mandated test — a future regression in `unlink` handling would pass the suite. Add one row (e.g. `unlink docs/f/CROSS-REVIEW-x.md` → BLOCK, NOT_COMMITTED). | REQ-GUARD-02 / Canonical Matrix / REQ-GUARD-05 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the Claude Code hook-input `cwd` field track the Bash tool's *persisted* shell cwd, or the session/project directory? The answer decides whether F-01 is resolvable (pin the field as the root) or must be accepted as a residual-risk row. Answer it in the REQ either way. |

## Positive Observations

- All seven iteration-2 SE dispositions are genuine: every claimed fix exists in the named section and the new matrix rows (M44–M59) carry the correct reason codes — checked row by row, no phantom resolutions.
- The literal-vs-expandable rewrite (steps 1/5) is now shell-correct: `"$D"` indeterminate, `'$D'` static, quote removal before classification. This was the hardest v2 defect and it is fixed without collateral contradiction elsewhere in the document.
- The D3(a) dataflow narrowing plus RR-2's rewritten remainder is the right trade: the mid-pipeline false-block class I flagged in v2 is now structurally excluded (M55/M56) and the accepted remainder is a recorded decision rather than a surprise.
- RR-4 (G2/G3 HEAD fallback) closes the register: every deliberate weakening of the fail-closed posture now has a numbered, rationale-carrying row.
- The document remains implementable from itself alone: the matrix, the reason-code catalog, and the env-var thresholds give FSPEC/TSPEC no open interpretation questions beyond the three findings above.

## Recommendation

**Needs revision**

Required change before FSPEC authoring:
1. F-01: specify the initial effective cwd (source and fallback) for static-operand resolution, and either handle or register (RR-5) the cross-call `cd` drift vector, with a matrix row pinning the chosen behavior.

F-02 and F-03 are one-line enumeration/matrix additions and can be folded into the same revision.
