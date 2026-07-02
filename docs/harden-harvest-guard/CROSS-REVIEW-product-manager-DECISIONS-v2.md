# Cross-Review: product-manager — DECISIONS (v2)

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/DECISIONS-harden-harvest-guard.md (v1.2)
**Date:** 2026-07-02
**Iteration:** 2

**Scope:** Iteration-2 re-review. Verifies the two iteration-1 PM Lows (F-01 CF-namespace collision, F-02 CF-2 pointer) are fixed, audits the v1.2 delta — the CFD-7 dispatch-map rewrite (TE F-01) and the CFD-8 addition (TE F-03) — for new product-lens issues, and reconciles the Review Disposition table against both iteration-1 DECISIONS reviews. Upstream re-read where the delta touches it: REQ v1.7 (REQ-GUARD-02 redirection semantics, REQ-GUARD-05, REQ-GUARD-06 case 2, rows M15, M21, M56, M62, M67, M77, M90), FSPEC v1.4 (FSPEC-GUARD-02 rule 1 + carry-forward CF-1 row, FSPEC-GUARD-03 error-scenario boundary row, FSPEC-GUARD-06 reason-code map), TSPEC v1.1 (§ 3.1 step 0, § 3.7 message catalog, § 6.3 binding architecture + meta-tests, § 6.6 supplementary accounting), and both iteration-1 DECISIONS cross-reviews.

## Prior-Finding Verification (iteration-1 PM Lows)

| Prior finding | Status | Evidence |
|---|---|---|
| F-01 (Low) — DEC-06 cited a bare "CF-1" that resolved to this document's own carry-forward table (self-test gate) instead of the FSPEC's `>&` lexical rule; M15 wrongly folded into that rule | **Fixed as specified.** Document-local carry-forwards renamed **CFD-1..CFD-8** with an explicit rename note recording the process rule (CF ids restart per document; cross-document CF references must be document-qualified — TE F-05's Process signal, now in-document). DEC-06's consequences now cite "the **FSPEC CF-1** `>&` lexical disambiguation rule (FSPEC-GUARD-02 rule 1; the label TSPEC § 3.5.1 also uses — not this document's CFD-1) — M56, M62, M67" and cite the `>>`/`N>>` append exclusion separately as the REQ-GUARD-02 rule it is (M15). Verified against FSPEC v1.4: carry-forward CF-1 is the `>&` all-digits-or-`-` rule, defined as FSPEC-GUARD-02 rule 1; TSPEC § 3.5.1 uses the same "CF-1" label; M56/M62/M67 are the fd-duplication/lexical-rule pins and M15 the append-allow pin in REQ v1.7. Namespace sweep: no stray unqualified CF-n remains — the only bare "CF-1–CF-7" occurrence is the v1.1 revision-history row, which is accurate as history | — |
| F-02 (Low) — CFD-2 (then CF-2) pointed the future M77 REQ correction at FSPEC-GUARD-06 instead of FSPEC-GUARD-03 | **Fixed as specified, with the corrective rationale carried.** CFD-2 now directs the next REQ touch to "the **FSPEC-GUARD-03** failure-vs-absence boundary (error-scenario row — the section that defines the boundary; FSPEC-GUARD-06 only maps the query-failure path to `NOT_COMMITTED`)". Verified: the "Operational boundary (failure vs absence)" definition sits in FSPEC-GUARD-03's error-scenario row; FSPEC-GUARD-06's table only maps the query-failure outcome to a reason code. The document is now internally consistent with DEC-04's Context. Also re-verified: REQ v1.7 row M77's parenthetical still carries the known-wrong corrupt-ref construction, so the "correct at the next REQ touch, do not open a revision solely for this" instruction remains live and accurate | — |

## Delta Audit — CFD-7 rewrite and CFD-8 addition (v1.2)

| Check | Result |
|---|---|
| **CFD-7 dispatch-map rule vs TE F-01 (Medium)** | **Matches the sanctioned remedy exactly, nothing beyond it.** Marked rows keep their `MATRIX` entry (`bespoke: true`), `it.each` filters them out, dedicated `it()` blocks are generated mechanically from an `id → orchestration function` dispatch map, and the self-audit gains a set-equality meta-check (fourth conjunct of meta-test 1, or a meta-test 4) between the map's key set and the `bespoke: true` id set. Both un-audited directions TE F-01 named are closed: zero-execution (a generated block exists iff the map entry does) and double-execution (an unmarked row with a map entry fails set-equality). The claim that meta-test 1's id-set + length equality and REQ-GUARD-05's exactly-one obligation survive intact is verified against TSPEC § 6.3 (marked rows remain in `MATRIX`, so the base-allocation audit is untouched; each row executes via exactly one path). Product lens: this is test-architecture disposition within TSPEC-owned latitude — no reason code, matrix expectation, or REQ-owned observable is altered, and the binding-for-se-implement statement is explicit. One wording ambiguity in the supersession clause — see F2-01 |
| **CFD-8 pinning test vs TE F-03 (Low)** | **Matches the sanctioned remedy verbatim and is product-consistent.** The case (`runGuard(fixture, {stdinRaw: "--self-test", env: {GUARD_SELF_TEST: "1"}})` → `expectBlock(res, "PARSE_ERROR", ["unparseable"])`) pins existing REQ-GUARD-06 case-2 behavior (unparseable hook stdin → `PARSE_ERROR`, fail closed) — no new product behavior rides in. Placement in the § 6.6 supplementary set (outside matrix accounting) is consistent with TSPEC § 6.3's "self-audit governs only `MATRIX` ids" and DEC-01's no-matrix-row disposition. The both-mechanisms claim holds: under env-clear the Python gate's env conjunct fails; under argc-gate the argv-length conjunct fails; either way the input routes to intake → `PARSE_ERROR` — one oracle pins whichever mechanism se-implement picks. DEC-01's consequences now cross-reference CFD-8 as the pin, closing the "hardening with no pinning test" gap |
| **CFD-3 tightening (TE F-02)** | `then commit` verified discriminating against the § 3.7 `NOT_COMMITTED` template: the instruction clause "Run /pdlc:harvest-learnings, **then commit** (and push)" contains it; the state description "is not committed" does not — dropping the REQ-GUARD-07-required commit instruction now fails the conjunct. The unfalsifiability rationale recorded in CFD-3 is accurate |
| **Review Disposition table completeness** | All seven iteration-1 items (TE F-01–F-05, PM F-01/F-02 with the correct cross-reviewer pairings, PM Q-01) present, each disposition matching what its source finding asked for; PM Q-01's answer (register-rationale suffices; a real "fix to permanent blocking" attempt is the promotion trigger for G2/G3) is an acceptable, product-recognizable division |
| **Unrecorded product-behavior change sweep (v1.2 delta)** | None found. Every observable named in the delta (PARSE_ERROR routing, `then commit` template text, M15/M56/M62/M67/M90 classifications, M77 fixture status) is quoted from REQ v1.7 / FSPEC v1.4 / TSPEC v1.1, never introduced here |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F2-01 | Low | Local | **CFD-7's supersession clause carries an unqualified version reference that reads as pointing at the TSPEC.** The binding sentence ends: "TSPEC § 6.3's bespoke convention is implemented per this rule, **superseding the v1.1 bare-marker wording**." The TSPEC is itself at v1.1, and it is the sentence's subject — but TSPEC v1.1 § 6.3 contains no bare-marker wording (it says only "dedicated `it()` blocks for rows needing bespoke orchestration"); the bare `bespoke: true` marker convention lived in **this document's** v1.1 CF-7. A se-implement agent resolving "v1.1" against the TSPEC hunts for wording that does not exist there. This is the same reference-hygiene class as iteration-1 F-01/TE F-05, and the document's own new rename note states the rule: cross-document references must be document-qualified. Harmless in action (the binding rule is fully self-contained in the CFD-7 row, and the disposition table names the replaced convention) — one-phrase fix: "superseding this document's v1.1 CF-7 bare-marker wording" | CFD-7; TSPEC § 6.3; rename note (Carry-Forward Notes preamble) |

## Questions

| ID | Question |
|----|---------|
| — | None — the iteration-1 PM Q-01 answer is accepted as recorded in the Review Disposition table. |

## Positive Observations

- **CFD-7 is a disciplined Medium-fix**: it adopts TE F-01's dispatch-map remedy exactly — including both failure directions and the meta-check placement options the finding offered — and explicitly states what survives (meta-test 1, the exactly-one invariant) so the reviewer can falsify the claim rather than trust it. The "binding disposition for se-implement, superseding the prior convention" framing prevents the v1.1 wording from being implemented by mistake.
- **CFD-8 closes the loop the CFD-1 hardening opened**: a binding security disposition now has a pinning test specified in implementable terms, covering both sanctioned mechanisms with a single oracle, and DEC-01's consequences cross-reference it — the decision record and the test contract can no longer drift apart silently.
- The namespace rename went beyond the minimum: the rename note records the *process rule* (document-qualified cross-document CF references) in-document, so the collision class is guarded against future edits of this file, not just patched in DEC-06.
- The Review Disposition table pairs the overlapping PM/TE findings correctly (PM F-01 = TE F-05; PM F-02 = TE F-04) and preserves each source finding's own severity framing — no disposition claims more than its source sanctioned.

## Recommendation

**Approved with minor changes**

Both iteration-1 Lows are verified fixed exactly as specified, the CFD-7 rewrite and CFD-8 addition match their sanctioning TE findings with no product-behavior drift, and the single new finding (F2-01) is a one-phrase version-qualifier disambiguation in CFD-7's supersession clause that does not alter any decision, disposition, reason code, or matrix expectation, and does not block se-implement from consuming the CFD table.

> Any High or Medium finding → Needs revision (mandatory). None present.
