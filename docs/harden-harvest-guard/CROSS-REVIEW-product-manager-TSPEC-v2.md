# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/TSPEC-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 2

Upstream baseline: REQ v1.7 + FSPEC v1.4 (both read in full, including the v1.7 disposition table and the FSPEC `mv`-flow steps 2b/3/4). Scope of this pass: (1) verify the seven iteration-1 findings (CROSS-REVIEW-product-manager-TSPEC.md) resolved against the actual revised sections; (2) scan the v1.1 deltas (§ 3.3 two-layer exception discipline, § 6.3 binding-table rebuild, § 3.1/§ 6.6 `--self-test` mode + DEC-01, § 6.1/§ 6.2 fixture changes, § 5 basename filter) for new traceability/scope defects. DECISIONS-harden-harvest-guard.md (DEC-01) reviewed under the DECISIONS lens.

## Iteration-1 Finding Verification

| v1 ID | Status | Evidence |
|----|--------|----------|
| F-01 (High — step-2b hoist changed REQ-owned observable) | **Resolved** | Option (a) taken upstream: REQ v1.7 `mv` table gains the "Indeterminate source; static destination naming an existing guarded file → BLOCK with the G-state code, not `INDETERMINATE`" carve-out row and states the destruction test as source-guardedness- **and determinacy-**irrelevant, preceding D3; REQ-GUARD-07's `INDETERMINATE` row carries the carve-out annotation; matrix row M87 + AC added; FSPEC v1.4 `mv` flow gains step 2b with the step-3 gloss reworded ("every operand pair reaching this step is genuinely unknowable"). TSPEC § 3.5.5 step 2b now cites REQ v1.7/FSPEC v1.4 — no TSPEC-owned behavior remains |
| F-02 (Medium — T-01–T-03 as a TSPEC-owned row namespace) | **Resolved** | Promoted as REQ-owned **M87–M89** (commands/verdicts/reasons carried over unchanged; T→M mapping in § 4); M33's G6 re-run set extended to M84–M90 in the REQ; § 4 rewritten as a promotion record; § 19 header line states "There is no TSPEC-owned row namespace in this revision" |
| F-03 (Medium — `PARSE_ERROR` fired outside its catalog condition) | **Resolved** | REQ v1.7 disposition keeps the catalog closed and delegates remediation TSPEC-side; § 3.3 delivers it: git-query exceptions route to the existing FSPEC-owned classes (G-DP1 detection failure → `NO_REPO`, per FSPEC-GUARD-03 G-DP1 "failure of repo detection itself … takes this same exit"; `verify_feature` exceptions → the FSPEC-GUARD-06 query-failure `NOT_COMMITTED` row), and the top-level handler covers only stdin-interpretation faults — the REQ-GUARD-06 case-2 class — emitting the exact § 3.7 template whose required "unparseable" substring is structurally always present |
| F-04 (Medium — `N>` widened the closed enumeration) | **Resolved** | REQ v1.7 extends the (still closed) REQ-GUARD-02 enumeration to `N>` for any fd digit-string with the truncation-family rationale; **M90** pins the `N ∉ {1, 2}` membership; `N>>`/`N>&M` stay outside. § 3.5.1 cites M90; M90 is bound in § 6.3 and in the P-QUOTE list |
| F-05 (Medium — live command-substitution bypass unregistered) | **Resolved** | **RR-6** registered in the REQ Residual Risk Register with the D1-opacity/NFR-01 rationale; § 3.5.2 cites it |
| F-06 (Medium — binding table: M74/M84 unbound, M17/M37/M46 double-bound) | **Resolved** | § 6.3 rebuilt. Independently re-verified the partition: the nine base groups sum to 89 ids and cover {M01–M32, M34–M90} with every row in exactly one group (M74/M84/M90 bound in the D2-statics group; M17 only in cwd-union; M37 only in non-repo; M46 only in D3/D4). Self-audit meta-test 1 adds the length-vs-set check so duplication now fails loudly, closing the gap the id-set equality alone left |
| F-07 (Low — `pushd`/`popd` drift and degraded `\/` defeat in TSPEC prose only) | **Resolved** | RR-5 extended to same-call stack-builtin drift and **RR-7** added, both in REQ v1.7; §§ 3.5.3 / 3.2 cite them |
| Q-01 (one-touch REQ v1.7 planned?) | **Answered** | REQ v1.7 + FSPEC v1.4 landed 2026-07-02 in the same commit; F-01(b) reword not needed |

Additional spot-checks on the v1.1 deltas: § 6.3's M33 re-run enumeration matches REQ v1.7's row list token-for-token; the § 6.3 oracle-contract table covers every reason code with the REQ-GUARD-07 required substrings (NOT_COMMITTED rows assert both `LEARNINGS-f.md` and `/pdlc:harvest-learnings`; M35 asserts `git push -u origin`; M58/M59 assert `git push` + `git fetch`); § 3.5.5 steps 0–5 match FSPEC v1.4's `mv` flow including the trailing-slash retention note on step 4.

## Findings (new, v1.1 deltas)

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F2-01 | Low | Local | **The `--self-test` conjunction-gate safety claim is inaccurate, leaving a keyhole through the P0 `PARSE_ERROR` fail-closed path.** § 3.1 step 0 (echoed in § 6.6 and DEC-01) claims the two sentinels are "both settable only by this wrapper branch." Each sentence then argues one sentinel varied *alone*: stdin `--self-test` without the env var routes to intake, and an exported `GUARD_SELF_TEST` without the argv sentinel cannot divert. The joint case is unhandled: on the hook path the Python's `argv[1]` **is** the raw stdin (§ 3.1 step 4, C5), so hook stdin that is literally `--self-test` **plus** an externally exported `GUARD_SELF_TEST=1` satisfies the Python conjunction — and a REQ-GUARD-06 case-2 input (unparseable stdin, P0, must BLOCK `PARSE_ERROR` per the M41 class) instead runs the parser self-test and exits 0 on success, allowing the vetted command. Exposure is near-zero (requires a user-exported test-only env var **and** a harness fault emitting that exact string — two independent anomalies), but the guard's own spec should not carry a false safety claim about its fail-closed gate when the fix is one line: have the wrapper explicitly clear/unset `GUARD_SELF_TEST` from the Python's environment on the non-self-test path (or additionally gate on the wrapper-only argv), and correct the claim in § 3.1/§ 6.6 and DEC-01. | REQ-GUARD-06 case 2; M41/M78 class |
| F2-02 | Low | Local | **REQ matrix row M77's fixture parenthetical is now known-wrong and was not corrected in the v1.7 touch.** C18/TE F-06 established empirically that the REQ row's stated construction — "fixture: corrupt `.git/refs/remotes/origin/{branch}`" — classifies as *clean absence* (`show-ref` exit 1, silent) and routes G5, never exercising the query-failure branch the row exists to pin. § 6.2's loose-object fixture is the right deviation and is well documented (builder self-check included), but the Canonical Matrix is the REQ-owned durable oracle: a future implementer or re-verifier reading only the REQ row builds a non-discriminating test that green-passes via G5's identical `NOT_COMMITTED`. The REQ v1.7 touch amended six other matrix items and could have carried this one-parenthetical correction. Ride the next REQ touch: replace M77's parenthetical with the loose-object construction (or drop the construction hint and reference the FSPEC-GUARD-06 failure-vs-absence boundary). No behavior change — expected decision and reason code are identical. | REQ-GUARD-05 (matrix as durable oracle); matrix row M77 |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The § 6.3 rebuild is genuinely audit-grade: the allocation invariant is stated on the table itself, the partition verifies independently (89/89, no duplicates), and the length-vs-set meta-test makes the exactly-one obligation mechanically enforced rather than review-enforced.
- The § 3.3 two-layer exception discipline is a model resolution of F-03: instead of widening the catalog, it routes every failure class to an existing REQ/FSPEC-owned condition and makes the `PARSE_ERROR` substring oracle structurally unviolable (the template is the single emission point).
- § 4's T→M mapping table preserves reviewer traceability across the promotion — readers of the v1.0 reviews can follow every row.
- DEC-01 is a proper product-recognizable decision record: the constraint is deployment integrity of a fail-closed control through the plugin cache (C16), not engineering preference; rejected alternatives are honestly weighed; re-evaluation triggers are concrete.
- The M77 fixture's builder self-check (§ 6.2) turns a git-version-drift assumption into a loud failure — exactly the durability posture REQ-GUARD-05 wants.

## Recommendation

**Approved with minor changes**

Both findings are Low, non-blocking for implementation, and have one-line remediations: F2-01 — clear `GUARD_SELF_TEST` on the hook path and correct the conjunction claim (§ 3.1/§ 6.6/DEC-01); F2-02 — correct the M77 fixture parenthetical at the next REQ touch. Neither alters any decision, reason code, or matrix expectation.

> Any High or Medium finding → Needs revision (mandatory). None present.
