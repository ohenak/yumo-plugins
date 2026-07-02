# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md (Version 1.1)
**Date:** 2026-07-02
**Iteration:** 2

## Iteration-1 Finding Resolution Verification

The REQ's Reviewer Findings Disposition table was checked against the actual sections, not taken on trust. All nine SE findings and both SE questions are genuinely resolved:

| Iter-1 finding | Claimed resolution | Verified against actual section | Result |
|---|---|---|---|
| F-01 (High — fail-closed circular) | Parsing discipline 1–5, D1–D4 | REQ-GUARD-01: trigger is now detectable (deletion verb in executable position + operand classification + `docs/` discriminator), not circular; per-vector ACs M20–M26 present | Resolved (but see new F-01 below for a hole in D2's coverage) |
| F-02 (High — GUARD-01 vs NFR-01 conflict) | D1 precedence + discrimination rule | D1 stated as first-match-wins; NFR-01 partition statement present; `git commit -m` AC + M27–M31 present | Resolved — the two P0 requirements are now co-implementable (minor wording drift, see new F-03) |
| F-03 (Medium — blocklist vs "any command") | US-01 reworded, RR-1 | US-01 scoped to defended verbs; Residual Risk Register RR-1 lists the exact bypass verbs from the finding; `>>`/`2>` semantics fixed in REQ-GUARD-02 | Resolved |
| F-04 (Medium — no-remote/detached/not-pushed) | G1–G10 matrix | All states present incl. G2 (no remote), G3 (detached), G7 (committed-not-pushed) with per-state ACs and M34/M35/M37–M40 | Resolved |
| F-05 (Medium — interpreter fail-open, Assumptions wrong) | REQ-GUARD-06 + Assumptions fix | REQ-GUARD-06 is P0, covers both degraded paths; Assumptions now names the Python 3 dependency and flags the v1.0 error | Resolved |
| F-06 (Low — message oracle) | REQ-GUARD-07 | Reason-code catalog with substring oracles; prose ownership delegated to TSPEC | Resolved |
| F-07 (Low — Scope patterns too narrow) | P1–P3 EREs | P2 covers both `**Scope:**` and `**Scope**:`; lowercase negative AC present | Resolved |
| F-08 (Low — `git clean` rationale) | Rationale paragraph | Present in REQ-GUARD-02 (protects not-yet-committed Phase-DOD artifacts) | Resolved |
| F-09 (Low — test-harness env) | REQ-GUARD-05 env requirements | Hermetic bare-origin fixture, no-network AC, restricted-PATH degraded cases | Resolved |
| Q-01 (`mv` rename in place) | `mv` decision table | Pattern-preserving rename allowed, pattern-destroying blocked; M09–M13 | Answered |
| Q-02 (docs dir with no guarded files) | Closing paragraph + M32 | Present | Answered |

## Existing-Code Claim Verification (single pass)

| Claim in REQ v1.1 | Verified against | Result |
|---|---|---|
| Fails open on missing interpreter (`guard-harvest-before-delete.sh:21`) | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:21` (`[ -z "$PY_BIN" ] && exit 0`) | Accurate |
| Fails open on unparseable stdin (`:30`) | `:30` (`sys.exit(0)  # unparseable -> don't interfere`) | Accurate |
| Literal-token + verb-list matching (`:35,:37`), disk-existence check (`:52`) | `:35`, `:37`, `:52` | Accurate |
| Scope check bare-substring match (`check-scope-field.sh:41`) | `:41` (`grep -qiE 'scope|cross-feature'`) | Accurate |
| PROP-COMPAT-05 assumes non-repo tmpdir and asserts disk-only `LEARNINGS-*.md` allows deletion (migration note) | `pdlc/workflows/__tests__/hookCompatibility.test.js:156–224` — tmpdir fixture, "exits 0 when LEARNINGS-*.md exists alongside" asserts disk-only allow | Accurate — the migration note is necessary and correctly scoped |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **D2 misses ancestor-path and dir-itself deletion — a trivial static bypass remains.** D2 blocks a static operand that "resolves to, or globs over, any path **inside** an unverified guarded directory". `rm -rf docs`, `rm -rf .`, `find . -name '*.md' -delete` (repo root), and `git clean -fd docs` have static operands that resolve to an *ancestor* of the guarded directory — not a path inside it — so they match no decision rule and fall through to default-allow. These are exactly the class of one-token-different spellings this REQ exists to close (the intro's own complaint is that `rm docs/{feature}/*.md` bypasses today). Even `rm -rf docs/f` (the guarded dir itself) strictly misses D2's wording — M04/M07 imply the dir itself blocks, but no matrix row exercises `rm -rf docs/f` at all. Required: extend D2 to block when a static operand of a recursive-capable deletion form (`rm -r`, `find -delete`, `git clean`, `mv` of a dir) resolves to a guarded file, an unverified guarded directory itself, **or any ancestor of one**; add matrix rows for `rm -rf docs/f`, `rm -rf docs`, and `find . -name '*.md' -delete`. | REQ-GUARD-01 D2 / Canonical Matrix |
| F-02 | Medium | Local | **"Unquoted" is used inconsistently and, read literally, contradicts M24.** Operand-classification step 5 says an operand is static "if it contains no unquoted `$`…". In `rm "$D"/*.md` (M24) the `$` sits *inside double quotes* — under the natural reading of "unquoted" the operand is static, yet M24 requires `INDETERMINATE`. Worse, parsing step 1 says content inside double quotes "is data and is never scanned" — but step 5 must scan inside double quotes to see the `$`. Shell semantics are that double quotes do NOT suppress expansion; only single quotes and backslash do. The REQ must define "unquoted" once: *not single-quoted and not backslash-escaped* (double-quoted `$`/`` ` ``/`$(` still classify the operand as indeterminate), and step 1's never-scanned rule must be limited to single quotes and heredoc bodies for the purposes of steps 3/5. Also clarify that an assignment RHS (`D=docs/f`) counts as an "unquoted path token" for D3(a) — M24 silently depends on it. | REQ-GUARD-01 steps 1/5, D3 / M24 |
| F-03 | Medium | Local | **D3's compound-wide `docs/` discriminator plus redirection-as-deletion creates an undocumented false-block class on routine commands.** D3(a) scans the *entire* compound command for a `docs/` token, and REQ-GUARD-02 makes any indeterminate redirection target deletion-shaped. Consequence: `rm /tmp/scratch.log && git add docs/f/LEARNINGS-f.md` and `npm test > "$LOG" 2>&1; git add docs/f/LEARNINGS-f.md` — command shapes the harvest/commit flow itself produces — block with `INDETERMINATE` whenever any unverified guarded directory exists, i.e. for the whole mid-pipeline window. NFR-01 does not protect these (a deletion verb/redirection is present), so no requirement is violated, but nothing in the REQ acknowledges the class either; TSPEC will discover it as a surprise. Required: (a) explicitly exclude fd-duplication forms (`2>&1`, `>&2`, `>&n`) from redirection targets — as written `2>&1` has an "indeterminate" target and D3 applies; (b) either narrow D3(a) to `docs/` tokens in the deletion segment / its assignment dataflow, or document this over-block class in a register row (like RR-2's mirror image) so the NFR-01 guarantee boundary is honest and the accepted false-block surface is a recorded decision. | REQ-GUARD-01 D3 / REQ-GUARD-02 redirection / REQ-GUARD-NFR-01 |
| F-04 | Low | Local | `GUARD_FETCH_BEFORE_CHECK` is declared "Owner: hook script constant", but G10's AC and M40 set `GUARD_FETCH_BEFORE_CHECK=true` per-invocation — a script-internal constant cannot be toggled by a test without editing the script. Declare the mechanism: environment variable read by the hook, default `false` (same for `GUARD_FETCH_TIMEOUT_SECS`). | REQ-GUARD-03 thresholds / M40 |
| F-05 | Low | Local | REQ-GUARD-06 degraded mode matches "the raw command text" — but with no Python the guard cannot extract `tool_input.command` from the stdin JSON, so the coarse matcher necessarily runs against the raw stdin blob. Specify that (accepting the field-bleed consequence: tokens in other JSON fields, e.g. the Bash tool's `description`, can trigger a degraded block), or specify a bash-only extraction. Also specify precedence when both degradations co-occur (no interpreter AND malformed stdin): interpreter check first ⇒ `DEGRADED`, since `PARSE_ERROR` detection itself needs the interpreter. | REQ-GUARD-06 / M41–M42 |
| F-06 | Low | Local | Matrix rows M37–M40 vary git state but pin no command, and GUARD-05's AC requires "every row … has exactly one asserting test". Pin a concrete command per state row (e.g. re-run M01 under each state) so row-to-test mapping is mechanical; M33's bulk reference ("re-run M01, M02, M04–M24") should also state it expands to one test per referenced row or one parameterized test. | Canonical Matrix M33, M37–M40 / REQ-GUARD-05 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | In degraded mode (REQ-GUARD-06), the guard could still perform the REQ-GUARD-03 git verification in pure bash (`git cat-file -e` needs no Python) — the spec instead blocks unconditionally on the coarse match, which permanently blocks harvest deletion on Python-less machines even after LEARNINGS is pushed. Is permanent-block-until-python3-installed the intended operational posture, or should degraded mode retain the bash-feasible git check? (Answer either way in the REQ; the current text implies the former without saying so.) |

## Positive Observations

- The disposition table is honest: every claimed resolution exists in the named section, verbatim-checkable — no phantom fixes.
- The parsing discipline resolves iteration-1's central circularity correctly: D1's structural precedence makes NFR-01 and GUARD-01 a genuine partition of the input space rather than a precedence fight.
- The Residual Risk Register (RR-W/RR-1/RR-2/RR-3) is the right shape — each accepted bypass is tied to the decision rule that guarantees it and to the NFR that motivated accepting it.
- The Canonical Block/Allow Matrix as the durable test oracle (replacing "failing-before/passing-after") plus the PROP-COMPAT-05 migration note means GUARD-05 is implementable from this document alone.
- The corrected Assumptions section explicitly retracts v1.0's inaccurate dependency claim instead of silently rewording it.

## Recommendation

**Needs revision**

Required changes before FSPEC authoring:
1. F-01: extend D2 to guarded-directory-itself and ancestor-path operands for recursive-capable deletion forms; add matrix rows `rm -rf docs/f`, `rm -rf docs`, `find . -name '*.md' -delete`.
2. F-02: define "unquoted" once (single-quote/backslash suppress; double quotes do not) and reconcile step 1's never-scanned rule with step 5; state that assignment RHS tokens count for D3(a).
3. F-03: exclude fd-dup redirections explicitly; document (or narrow) the D3 compound-wide over-block class.
