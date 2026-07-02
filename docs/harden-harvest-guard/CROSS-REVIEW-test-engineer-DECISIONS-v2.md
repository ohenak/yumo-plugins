# Cross-Review: test-engineer — DECISIONS (v2)

**Reviewer:** test-engineer
**Document reviewed:** docs/harden-harvest-guard/DECISIONS-harden-harvest-guard.md (v1.2)
**Date:** 2026-07-02
**Iteration:** 2
**Scope of this pass:** verification of the five iteration-1 findings (TE F-01–F-05) against the v1.1 → v1.2 diff (`01651f9..28bc4de`), plus a new-defect scan restricted to the v1.2 deltas (CFD-7 rewrite, CFD-3 tightening, CFD-8 addition, CFD-2 repoint, CF-n → CFD-n rename + DEC-06 consequences rewrite, DEC-01 consequences cross-reference, CFD preamble, Review Disposition table, lineage/revision-history rows).

## Iteration-1 finding verification

| Prior finding | Severity | Status in v1.2 | Evidence |
|---|---|---|---|
| F-01 — CFD-7 bespoke convention left zero- and double-execution un-audited | Medium | **Resolved.** CFD-7 now mandates dedicated `it()` blocks **generated mechanically from an `id → orchestration function` dispatch map** (no hand-written free-standing blocks; generated block exists iff the map entry does), and the § 6.3 self-audit gains a set-equality meta-check: dispatch-map key set = `bespoke: true` id set in `MATRIX` (fourth conjunct of meta-test 1, or a meta-test 4). Both directions close mechanically: a marked row with no map entry fails set-equality (zero-execution cannot be "forgotten" — the block is generated, not hand-written), and an unmarked row with a map entry also fails it (double-execution). Meta-test 1's id-set + length equality is untouched (`MATRIX` retains marked entries), so the REQ-GUARD-05 exactly-one invariant and the TSPEC § 6.3 allocation invariant both survive. The rule is declared the binding disposition for se-implement, superseding the v1.1 bare-marker wording — the correct channel, matching the established CFD mechanism | CFD-7; disposition table TE F-01 row |
| F-02 — CFD-3 `NOT_COMMITTED` conjunct `commit` unfalsifiable | Low | **Resolved.** The conjunct is now the substring **`then commit`**, with the vacuity rationale recorded inline. Verified discriminating against the real TSPEC § 3.7 template (line "Run /pdlc:harvest-learnings, **then commit (and push)** LEARNINGS-{feature}.md …"): the state description "is not committed" cannot satisfy `then commit`, so dropping the instruction now fails every `NOT_COMMITTED` row | CFD-3; TSPEC § 3.7 |
| F-03 — CFD-1 gate hardening had no pinning test | Low | **Resolved.** CFD-8 added: `runGuard(fixture, {stdinRaw: "--self-test", env: {GUARD_SELF_TEST: "1"}})` → `expectBlock(res, "PARSE_ERROR", ["unparseable"])`, placed in the § 6.6 supplementary set (outside matrix accounting, consistent with DEC-01's no-matrix-row disposition). Oracle re-verified sound: TSPEC § 3.3 guarantees the `PARSE_ERROR` template always carries the `unparseable` substring, and the case is discriminating under **both** sanctioned CFD-1 mechanisms (env-clear: conjunction fails on the cleared sentinel; argc-gate: hook-path argv length 2 ≠ 3) — dropping either mechanism re-routes the input to self-test exit 0 and fails `expectBlock`. DEC-01 consequences now cross-reference CFD-8 | CFD-8; DEC-01 consequences; TSPEC § 3.1 step 0 / § 3.3 / § 6.6 |
| F-04 — CFD-2 pointed the M77 correction at FSPEC-GUARD-06 | Low | **Resolved.** CFD-2 now targets the **FSPEC-GUARD-03** failure-vs-absence boundary (error-scenario row), with an accurate parenthetical on FSPEC-GUARD-06's actual role (block-message emission; maps the query-failure path to `NOT_COMMITTED` only). Verified against FSPEC v1.4: the "Operational boundary (failure vs absence)" definition lives in FSPEC-GUARD-03's error-scenario row. The document now agrees with DEC-04's Context — internal inconsistency gone | CFD-2; FSPEC-GUARD-03 error scenarios |
| F-05 — "CF-1" overloaded across document namespaces | Low | **Resolved.** Document-local carry-forwards renamed **CFD-1–CFD-8** consistently (all in-document references checked: DEC-01 Decision + Consequences, DEC-04 consequences, preamble, table — no stray unqualified CF-n remains except the revision-history 1.1 row, which is a correct historical record of v1.1). DEC-06's consequences now cite the **FSPEC CF-1 `>&` lexical disambiguation rule** with document qualification and an explicit "not this document's CFD-1" disambiguator, and the M15 fold-in is removed — M15 re-verified against REQ v1.7 as an append row (`echo note >> docs/f/CROSS-REVIEW-x.md` → ALLOW), correctly re-attributed to the separate REQ-GUARD-02 append exclusion. The Process signal is absorbed: the CFD preamble records the "CF ids restart per document; cross-document CF references must always be document-qualified" rule | CFD preamble; DEC-06 consequences; REQ M15 |

## New-defect scan (v1.2 deltas only)

| Delta | Result |
|---|---|
| CFD-7 dispatch-map rule | No defect. The one residual — a hand-written free-standing `it()` bypassing the dispatch map entirely — is explicitly prohibited by the rule's "no hand-written free-standing blocks" clause and remains grep-auditable via § 6.3's row-id-title convention; it is the irreducible limit of any jest suite (rogue tests can always be added anywhere), not a hole in this convention. The "fourth conjunct of meta-test 1, or a meta-test 4" choice is implementation freedom between observationally equivalent placements. An empty bespoke set is handled correctly (set-equality of two empty sets holds) |
| CFD-3 `then commit` | Verified discriminating (above). The other two conjuncts (`ailing closed`, `interpreter`) are unchanged from v1.1 and were verified in iteration 1 |
| CFD-8 pinning test | Oracle and mechanism-coverage verified (above). Placement outside matrix accounting keeps the § 6.3 self-audit's `MATRIX`-only jurisdiction intact |
| CFD-2 repoint + parenthetical | Verified accurate against the FSPEC v1.4 section map |
| DEC-06 consequences rewrite | Verified: M56/M62/M67 stay under the FSPEC CF-1 lexical rule; M15 correctly moved to the append exclusion; no matrix expectation altered |
| DEC-01 consequences addition | Accurate cross-reference to CFD-8; the "either mechanism" phrasing matches CFD-1's pick-one clause |
| Review Disposition table | Faithful to both source reviews (PM: 2 Low, Approved with minor changes; TE: 1 Medium 4 Low, Needs revision) — severities, content, and fixes all match. The PM Q-01 response records an observable promotion trigger (an actual re-litigation attempt), consistent with the DECISIONS-lens re-evaluation-trigger standard |
| Lineage + revision history | Cross-Reviews field extended with both DECISIONS reviews; the 1.2 history row accurately enumerates every delta |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. All five iteration-1 findings are resolved as specified, and the v1.2 deltas introduce no new defect | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- **CFD-7's resolution is stronger than the requested fix**: beyond the dispatch map + set-equality, the "generated block exists iff the map entry does" construction eliminates the forgotten-block failure mode structurally rather than just detecting it, and the explicit supersession sentence gives se-implement an unambiguous single source for the § 6.3 bespoke convention.
- **The CFD rename was executed completely, not cosmetically**: every in-document reference was updated, the colliding DEC-06 citation gained a triple disambiguation (document qualifier, section cite, explicit "not this document's CFD-1"), and the M15 mis-attribution bundled into the old citation was fixed in the same stroke — with the process rule recorded durably in the preamble where harvest will find it.
- **The Review Disposition table is audit-grade**: each row names the source finding, its severity, and the exact mechanism of the fix, making this iteration's verification mechanical.

## Recommendation

**Approved**

All iteration-1 findings (1 Medium, 4 Low) are verified resolved against the upstream REQ v1.7 / FSPEC v1.4 / TSPEC v1.1 sources, and the delta-scoped scan surfaced no new defects. The CFD table is a sound, self-auditing binding disposition set for se-implement.

> Any High or Medium finding → Needs revision (mandatory).
