# Cross-Review: test-engineer — REQ (v4)

**Reviewer:** test-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md (Version 1.3)
**Date:** 2026-07-02
**Iteration:** 4
**Scope:** Testing lens — verification that v1.3 resolves the iteration-3 finding F3-01 against the actual revised text, plus a new-issue scan of everything v1.3 added or touched: REQ-GUARD-01 step-4 initial-effective-cwd union rule, RR-5, `&>`/`>& file` truncation forms and the lexical fd-duplication disambiguation, `rm --recursive` in D2's recursive-capable set, matrix rows M60–M65, S-rows S01–S06, and the M33 expansion-set update.

## Prior-Finding Disposition Verification

| Iter-3 finding | Status in v1.3 | Evidence |
|---|---|---|
| F3-01 (Low) scope-check cases were prose, not bound by REQ-GUARD-05's one-test-per-row oracle | **Resolved** | The six cases are now Canonical Matrix rows S01–S06 (three silent: P1 plain field, P2 bold, P3 table-header cell; three warning: "telescope", prose "the scope of this change", lowercase `scope:`) with a stated fixture (file written with exactly the stated content) and oracle (warning vs silent). REQ-GUARD-05's description now binds "both the M-rows … and the S-rows", and its AC restates "M-rows and S-rows alike". Both hooks now share one uniform row-per-test contract — the durable oracle is complete for both scripts, exactly as requested. |

SE iteration-3 items were also spot-checked as part of the new-machinery scan (they are the machinery): the step-4 union rule + RR-5 (SE F-01/Q-01), `&>`/`>&`/`--recursive` (SE F-02), and the `unlink` row M60 (SE F-03) all landed as real normative text and matrix rows, not disposition-table fiat.

## New-Issue Scan (v1.3 machinery)

Hostile pass over each addition, checked for a decidable, hermetically writable test:

- **Union rule (step 4):** both candidate roots are concretely defined — (A) stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`; (B) hook process cwd — and both are controllable from the jest harness (stdin JSON content, env var, spawn cwd). M64 pins the root-(A) block; M65 pins the neither-root allow and cites RR-5. The rule's "blocks if **either**" disjunction, however, has no row in which root (B) alone triggers the block — see F4-01 below.
- **RR-5:** the register entry names the exact surviving bypass shape (`cd docs/f` in call 1, `rm *.md` in call 2, no candidate root reflecting the persisted shell) and points at M65 as its pinned allow row. The stdin-`cwd`-is-a-candidate-not-a-guarantee caveat answers SE Q-01 honestly rather than assuming the API is stronger than documented. Consistent with step 4 and M64/M65.
- **Redirection additions:** the lexical disambiguation (`>&` + digit = fd-duplication, never a target; `>&` + non-digit word = truncating file redirection) is decidable at tokenization time and is consistent with M56 (`2>&1` excluded) on one side and M61/M62 (blocked) on the other. The `>&-` fd-close spelling falls into the static-non-guarded-operand allow class — no row needed, no false-block risk.
- **`rm --recursive` (M63):** same D2 iv ancestor class as M48; the REQ's stated spelling policy ("all spellings of the same flag") plus the v1.3 text naming `--recursive` explicitly makes `-R`/`-rf` rowless-but-decided. Fine.
- **M60 (`unlink`):** the last defended verb with zero rows now has one, and it is included in M33's G6 re-run set, so both decision outcomes for `unlink` are pinned.
- **M33 expansion set update (`… M60–M64`):** re-derived every added row under G6 — M64's glob resolves inside a *verified* guarded directory → allow; the INDETERMINATE rows already in the set (M08/M20/M21/M24) correctly flip to allow because D3(b)/D4 require an unverified guarded directory to exist. No reason-code mismatches diffing M-rows against the G-matrix and the REQ-GUARD-07 catalog.
- **S-rows:** each is writable as-is (write file → run hook → assert warning/silence). P3's ERE (`\|[[:space:]]*Scope[[:space:]]*\|`) matches S03's mid-row header cell as claimed.

Deliberately not filed: the unset-`CLAUDE_PROJECT_DIR` fallback for candidate root (A) is TSPEC territory (the guard runs inside a repo per Assumptions and can derive the root; tests will set the env var), and `check-scope-field.sh`'s interpreter-missing silent no-op is explicitly scoped out of REQ-GUARD-06 ("Only the blocking guard is subject to this requirement") — the advisory script's degraded path is a design statement, not a requirement.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F4-01 | Low | Local | The step-4 union rule blocks "if **either** resolution lands in or over an unverified guarded directory", but the matrix exercises only one disjunct positively: M64 pins a block via candidate root (A) (stdin `cwd`), and M65 pins the neither-root allow. No row pins a block driven by candidate root **(B)** alone — e.g. stdin carries no `cwd` signal (or reports the repo root) while the hook *process* cwd is `docs/f`. An implementation that resolves static relative operands against root (A) only would pass every M-row and S-row green while silently dropping half the union rule — precisely the class of regression US-04's matrix exists to catch. The row is hermetically writable today (spawn the hook with cwd `docs/f`, stdin without `cwd`). Add e.g. M66: "No cwd signal in hook stdin; hook process cwd = `docs/f`: `rm *.md` → BLOCK, NOT_COMMITTED" (and include it in M33's G6 re-run set). | REQ-GUARD-01 step 4, Canonical Matrix M64/M65 |

## Questions

| ID | Question |
|----|---------|
| — | None. Every v1.3 behavior I attempted to write a test for has a decided outcome, a reason code, and (with the single exception filed as F4-01) a matrix row. |

## Positive Observations

- The union rule is the right shape for a fail-closed guard facing an unobservable shell: rather than trusting the stdin `cwd` field beyond what the hook API promises, it treats both signals as candidates and takes the conservative union, then names the surviving remainder (RR-5) instead of claiming it away. M65 pinning the *accepted bypass* as an explicit ALLOW row is exactly how a residual risk should be bound to the oracle.
- The redirection family is now closed under bash's truncation spellings (`>`, `1>`, `>|`, `2>`, `&>`, `>& file`) with a purely lexical, tokenizer-level fd-duplication rule — decidable without semantic analysis, and the M56/M61/M62 triple tests both sides of the boundary.
- S01–S06 complete the one-oracle promise: REQ-GUARD-05's "every row has exactly one asserting test" is now a mechanical obligation over both hooks, with no prose remainder.
- Five review iterations in, the disposition tables remain honest — every v1.3 row points at real normative text, and the residual-risk register (RR-W, RR-1–RR-5) still accounts for every allow-side row that accepts a bypass (M25, M26, M55, M56, M65).

## Recommendation

**Approved with minor changes**

F4-01 is an oracle-completeness gap of the same class and severity as iteration-3's F3-01 and SE F-03 (a specified behavior missing its pinned matrix row), not a specification defect: the union rule's text is decidable and the missing test is writable from this document without a clarifying question. It can be absorbed into the FSPEC's matrix carry-forward (add the M66 row there) rather than forcing a REQ v1.4. All prior findings across all three previous iterations are verifiably resolved in the v1.3 text.
