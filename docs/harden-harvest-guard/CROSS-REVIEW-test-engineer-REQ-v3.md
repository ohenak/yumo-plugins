# Cross-Review: test-engineer — REQ (v3)

**Reviewer:** test-engineer
**Document reviewed:** docs/harden-harvest-guard/REQ-harden-harvest-guard.md (Version 1.2)
**Date:** 2026-07-02
**Iteration:** 3
**Scope:** Testing lens — verification that v1.2 resolves iteration-2 findings F2-01–F2-05 and Q2-01 against the actual revised sections (not the disposition table's claims), plus a new-issue scan of the machinery v1.2 added or rewrote: parsing steps 1/5, D2 ancestor extension, D3 segment-scoped discriminator, unified `mv` resulting-path rule, Definitions (nested subdirs, first-segment feature derivation), REQ-GUARD-06 raw-stdin degraded matcher and precedence, env-var thresholds, RR-4, and matrix rows M44–M59.

## Prior-Finding Disposition Verification

Every iteration-2 finding was re-checked against the v1.2 text it claims to be resolved by:

| Iter-2 finding | Status in v1.2 | Evidence |
|---|---|---|
| F2-01 (High) quote semantics contradictory; no quoted-target matrix rows | **Resolved** | All three fix parts landed. (a) Parsing step 1 rewritten: shell-style tokenization **with quote removal** precedes classification; quoting controls literal-vs-expandable, "never whether it is inspected"; a quoted operand of a deletion verb is explicitly a candidate path; the data exclusion is re-scoped to data **by position** (string args of non-deletion verbs, heredoc bodies), with the opaque-payload (`eval`/`bash -c`/`sh -c`) exception stated. (b) Step 5 defines **expansion-active** (neither single-quoted nor backslash-escaped; "double quotes do NOT suppress expansion — `"$D"` is indeterminate, while `'$D'` and `\$D` … are static"), eliminating the old ambiguous "unquoted". The contradiction is gone: `rm "docs/f/CROSS-REVIEW-x.md"` is now unambiguously static→D2 BLOCK under every rule that touches it. (c) Matrix rows M44 (double-quoted target), M45 (single-quoted target), M46 (double-quoted assignment RHS) added, with matching ACs in REQ-GUARD-01. NFR-01 wording aligned ("quoting alone does not make an operand data"). |
| F2-02 (Medium) `mv` directory-destination undecidable; nested-subdir feature derivation | **Resolved** | The `mv` table is unified on one resulting-path rule: directory destination ⇒ resulting path is `destination/basename(source)`; allow iff resulting path stays in the **same feature's** subtree AND basename still matches the guarded pattern. Reading A/B ambiguity is closed (Reading B, correctly formalized). The Definitions interaction I flagged is fixed at the root: guarded files include nested subdirectories, and feature derivation is the **first path segment under `docs/`**, "NOT the immediate parent directory", so `mv docs/f/CROSS-REVIEW-x.md docs/f/archive/` keeps the file guarded as feature `f` and the guard still requires top-level `LEARNINGS-f.md`. AC + matrix row M52 (with the `docs/f/archive/` exists precondition stated) added. |
| F2-03 (Medium) matrix omits G5, G10-default-`false`, fetch-failure | **Resolved** | REQ-GUARD-03 gained the three ACs verbatim as requested: G5 → BLOCK `NOT_COMMITTED`; G10 with `GUARD_FETCH_BEFORE_CHECK` unset (default `false`) → BLOCK `NOT_PUSHED` with `git fetch` hint (the shipped default's accepted false block is now tested at birth); G10 with fetch enabled but origin unreachable/timed out → decision identical to the `false` path. Matrix rows M57, M58, M59 bind all three to the durable oracle. REQ-GUARD-07's `NOT_PUSHED` row also names the G10 `git fetch` hint, so the stderr substring oracle is complete. |
| F2-04 (Low) G2/G3 HEAD fallback absent from Residual Risk Register | **Resolved** | RR-4 added with the exact bypass shape I described (`git checkout --detach` then delete satisfies the guard with a local-only commit) and the acceptance rationale. The register is now the complete containment-boundary statement it claims to be. |
| F2-05 (Low) `1>` / `>\|` unclassified | **Resolved** | Both added to the defended redirection forms with the rationales from the finding (`1>` byte-equivalent; `>\|` is the noclobber-refusal respelling); AC + matrix rows M53–M54. Bonus: fd-duplication forms (`2>&1`, `>&2`, `N>&M`) are explicitly never redirection targets — closing a false-block edge before it shipped. |
| Q2-01 (double-quoted `docs/` token and D3(a)) | **Answered** | D3(a) now tests the **post-quote-removal literal text** and states "quoting style is irrelevant to the literal test"; `D="docs/f"; rm "$D"/*.md` is decided (BLOCK `INDETERMINATE`) and pinned by M46. |

## New-Issue Scan (v1.2 machinery)

Hostile pass over the rewritten rules, each checked for a decidable, writable test:

- **D2 ancestor extension:** recursive-capable forms enumerated; non-recursive `rm docs` fall-through justified (cannot destroy files); M47–M51 pin dir-itself, `docs`, `.`, and both `find` ancestor-root variants. `rm -r docs/f/archive` is covered by D2(ii) "any path inside an unverified guarded directory". Decidable.
- **D3 segment scoping:** all four dataflow channels (operands/redirections, assignment RHS, piped producer, `cd` context) are testable; M55/M56 pin the cross-segment allow cases; RR-2 records the accepted remainder. The `D=docs/f; rm "$D"/*.md` compound splits at `;` but D3(a)(2)'s "anywhere in the same compound command" makes the assignment visible — decidable.
- **Opaque payloads:** `bash -c 'rm docs/f/*.md'` (single-quoted payload recursively parsed, M22) vs `eval "$CMD"` (D1 allow, M26/RR-3) are consistent under the new step-1 exception.
- **Degraded mode:** raw-stdin matching with named field-bleed consequence, no-git-verification rationale, and DEGRADED-over-PARSE_ERROR precedence are all specified; M41–M43 are writable with restricted-PATH and malformed-stdin fixtures.
- **G10 staleness fixture:** "pushed to a local bare origin fixture, local remote-tracking ref stale" is hermetically constructible (push from a second clone, or rewind the remote-tracking ref); no network needed. Writable.
- **M33 bulk row:** expansion set (M01, M02, M04–M24, M44–M54) plus the one-test-per-referenced-row rule in REQ-GUARD-05's AC makes the G6 sweep mechanical.

One residual polish item survived the scan (F3-01 below). I deliberately did not file findings for exhaustive-shell-grammar gaps (`${D}` brace expansion, single-quoted globs like `rm 'docs/f/*.md'`, `>&word` edge grammar): the matrix is an oracle for the defended behavior classes, each such spelling falls into an already-decided class (indeterminate-expansion, literal-non-matching operand, fd-duplication), and RR-1/RR-2 own the remainder by design.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F3-01 | Low | Local | The scope-check cases (P1/P2/P3 pass; telescope / prose-`scope` / lowercase warn) appear as one prose sentence beneath the Canonical Matrix rather than as numbered rows, so REQ-GUARD-05's mechanical AC — "every row of the Canonical Block/Allow Matrix has exactly one asserting test" — does not bind them; only REQ-GUARD-04's ACs do. They are fully decidable and writable as-is, but the single durable oracle the REQ promises ("the matrix … is the durable oracle") is complete for one hook and prose for the other. Enumerate them as rows (e.g. S01–S06: file content × expected silent/warn) so FSPEC/PROPERTIES inherit one uniform row-per-test contract for both scripts. | Canonical Matrix (closing line), REQ-GUARD-05 |

## Questions

| ID | Question |
|----|---------|
| — | None. Every behavior I attempted to write a test for in this pass has a decided outcome, a reason code, and a matrix row. |

## Positive Observations

- The quote-semantics rewrite is the strongest section of the document: literal-vs-expandable as the single axis, "data by position, not data by quoting" as the exclusion principle, and the `"$D"` / `'$D'` / `\$D` triple as a worked boundary example. M44–M46 close the quotes-only bypass that would previously have passed all 43 rows green.
- v1.2's fixes compose rather than patch: TE F2-02 and SE F-01 were resolved by the same two primitives (first-segment feature derivation + resulting-path rule), which is why the `mv`-into-subdir, nested-subdir guarding, and ancestor-move rows all fall out of one rule instead of three special cases.
- The matrix now has 59 rows binding every normative branch in REQ-GUARD-01/02/03/06/07 — including both values of every declared toggle and the failure path of the fetch. The G-matrix, reason-code catalog, and matrix cross-reference each other consistently (I diffed every M-row reason code against the G-matrix and REQ-GUARD-07 table: no mismatches).
- The Reviewer Findings Disposition (v1.1 → v1.2) table is again honest — every row points at real text that does what the row claims; nothing was resolved by table fiat.
- RR-1–RR-4 plus RR-W now form a genuinely complete residual-risk register: every allow-side matrix row (M25, M26, M55, M56) cites the RR entry that accepts it, so no bypass is silently assumed away.

## Recommendation

**Approved with minor changes**

The single Low (F3-01) is a formatting/binding improvement to the oracle's uniformity, not a testability defect — every test in both hooks' suites can be written today from this document without a clarifying question. All five iteration-2 findings and the open question are verifiably resolved in the v1.2 text. F3-01 can be absorbed into the FSPEC's matrix carry-forward rather than forcing a REQ v1.3.
