# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md (Version 1.3)
**Date:** 2026-07-02
**Iteration:** 4

## Iteration-3 Finding Resolution Verification

Each v3 finding's claimed disposition was checked against the actual v1.3 sections, not taken on trust:

| Iter-3 finding | Claimed resolution | Verified against actual section | Result |
|---|---|---|---|
| F-01 (Medium — initial effective cwd unspecified; cross-call cwd drift reopens a static bypass) | Step-4 union rule + RR-5 + M64/M65 | REQ-GUARD-01 step 4 now defines the initial-effective-cwd **union rule**: static relative operands/globs resolve against both candidate roots — (A) stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`/repo root; (B) the hook process cwd — and block if **either** resolution lands in/over an unverified guarded directory, with the extra false-block surface named as the accepted cost. The stdin `cwd` field is explicitly declared a candidate root, not a persisted-shell guarantee, which answers my iter-3 Q-01 in the REQ as required. Surviving drift is registered as RR-5 with the union rule as mitigation. ACs added for the stdin-cwd block, the no-cwd-signal allow, and the same-call `cd` case; matrix rows M64 (BLOCK via candidate root A) and M65 (ALLOW, RR-5) pin both sides, M17 retained | Resolved |
| F-02 (Low — `&>` / `>& file` truncation and `rm --recursive` unclassified) | Enumerations extended; M61–M63 | REQ-GUARD-02 redirection set now includes `&> file` and `>& file` (named as the same truncation family as `>`), with a lexical digit/non-digit disambiguation from the excluded fd-duplication forms; D2's recursive-capable `rm` spellings now read `-r`/`-R`/`--recursive` (all spellings, incl. combined `-rf`); redirection AC extended; rows M61 (`&>`), M62 (`>&` + non-digit word), M63 (`rm --recursive docs`) present with correct reason codes | Resolved (one precision residue → new F-01 below) |
| F-03 (Low — `unlink` had zero matrix rows) | M60 added | Row M60 (`unlink docs/f/CROSS-REVIEW-x.md` → BLOCK, NOT_COMMITTED) present; M33's G6 re-run set extended to `M60–M64`, so the verb is exercised on both the block and allow sides | Resolved |

## Existing-Code Claim Verification (single pass)

v1.3 adds no new existing-code claims. The standing citations were re-verified against the current scripts and all remain accurate: fail-open on missing interpreter (`guard-harvest-before-delete.sh:21`), fail-open on unparseable stdin (`:30`), literal-token + `rm|unlink|git rm`-only matching (`:35`, `:37`), `CLAUDE_PROJECT_DIR`-vs-`os.getcwd()` root hedge (`:40`), disk-existence LEARNINGS check (`:52`), case-insensitive `scope` substring grep (`check-scope-field.sh:41`), and the PROP-COMPAT-05 / `runHookScript` migration target (`pdlc/workflows/__tests__/hookCompatibility.test.js:4,47,156`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The `>&` lexical disambiguation is stated as "followed by a digit" but bash's actual rule is "word consists entirely of digits (or `-`)".** As written, a digit-leading non-numeric word is unclassified (it is neither "a digit" nor "a non-digit word"): `>& 2024-notes/CROSS-REVIEW-x.md` (a guarded file in a digit-leading nested subdir, which the Definitions section explicitly guards) reads as fd-duplication under the REQ's rule — never a target, so allowed — while bash truncates the guarded file. Bash treats `>&word` as fd-duplication only when the word expands to *all* digits (or `-` = close); anything else is a truncating both-streams redirect. One-word fix: change the criterion from "followed by a digit" to "the word is entirely digits (or `-`)". Extremely narrow in practice, but the rule is the exact spelling TSPEC will implement, so it should be shell-correct in the REQ. | REQ-GUARD-02 redirection semantics / M62 |
| F-02 | Low | Local | **The degraded-mode matcher's "deletion-verb token" set is undefined relative to REQ-GUARD-02's verb enumeration, which includes redirection operators.** REQ-GUARD-06 case 1 blocks when raw stdin "matches a deletion-verb token" — but the defended set includes `>` / `>|` / `&>` truncation forms and multi-word forms (`git rm`, `find … -delete`), and matching a bare `>` in raw JSON is a very different (far noisier) proposition than matching `rm`/`mv`/`truncate` word tokens. M42/M43 exercise only `rm` and `ls`, so the matrix does not pin the answer either. TSPEC cannot derive the degraded regex from the REQ without deciding this itself. Fix: enumerate the degraded token set explicitly (e.g. word-boundary verbs only — `rm`, `unlink`, `git rm`, `git clean`, `find`, `mv`, `truncate` — with truncation-redirection spellings accepted as a degraded-mode miss, folded into the REQ-GUARD-06 accepted-consequence list) or delegate the set to TSPEC in so many words. | REQ-GUARD-06 case 1 / M42–M43 |

## Questions

None — iteration-3 Q-01 is answered inline in REQ-GUARD-01 step 4 (stdin `cwd` is a candidate root, not a persisted-shell guarantee), which is exactly the disposition requested.

## Positive Observations

- All three iteration-3 dispositions are genuine: every claimed fix exists in the named section, and M60–M65 carry correct decisions and reason codes — checked row by row against the parsing discipline and the G-state matrix.
- The union rule is the right resolution for the cross-call cwd problem given a hook that cannot observe the persisted shell: it converts an unbounded drift bypass into a bounded, registered remainder (RR-5) with both the mitigated case (M64) and the accepted case (M65) pinned as matrix rows. The false-block cost is named rather than discovered later.
- The Residual Risk Register (RR-W, RR-1–RR-5) now covers every deliberate weakening surfaced across four review iterations; nothing in the decision rules relies on an unrecorded assumption.
- The Canonical Matrix (M01–M65 + S01–S06) with the one-test-per-row obligation in REQ-GUARD-05 remains a complete, hermetic oracle; both findings above are refinements to two sentences, not gaps in the matrix's structure.
- The document is implementable from itself alone. Neither Low blocks FSPEC authoring: F-01 is a one-word shell-semantics correction, F-02 a bounded enumeration decision.

## Recommendation

**Approved with minor changes**

The two Low findings are precision fixes that can be folded into the next editorial pass (or resolved in FSPEC with an explicit back-reference); neither is an implementability blocker.
