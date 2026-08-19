# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.11)
**Date:** 2026-08-18
**Iteration:** 14 (delta confirmation)

## Scope

Delta-confirmation round under the round-13 decision freeze. Commit `07ba02e0` (FSPEC v0.10 →
v0.11) is a DoD-driven, single-literal erratum: L-5's post-sweep `*.test.js` count moves from 97 to
99, closing FSPEC:158's own "not yet corrected here" self-flag against
CODE_REVIEW-pdlc-plugin-retirement-v1.md finding 4. Round 13 approved v0.10 zero-finding from both
reviewer roles (`CROSS-REVIEW-software-engineer-FSPEC-v13.md`,
`CROSS-REVIEW-test-engineer-FSPEC-v13.md`). This round's question: **does a DoD-sourced erratum,
landed without a preceding SE/TE-routed finding, hold up from a testing/oracle lens — is the
correction falsifiable, traceable, and free of new testability regressions?**

Method: `git diff` on the FSPEC between `6c56b3cf` (v0.10, approved) and `07ba02e0` (v0.11).
Traced the corrected literal to its testing-side grounding — TSPEC §4.4 and
`pdlc/engine/__tests__/preflight-baseline.test.js` — and checked whether that grounding is an
actual falsifiable oracle or only documentation. Scanned the rest of the FSPEC for literal-drift
residue the erratum left behind.

## Answer to the framing question

**Acceptable, with one process observation.** Testing-lens: this is a value-correcting literal fix
to an already-black-box-testable outcome (L-5's suite-size count), not a change to what is being
tested or how. The corrected value (99) is independently derivable from TSPEC §4.4's stated
arithmetic (119 − 21 + 1 = 99, `TSPEC-pdlc-plugin-retirement.md:529`) and is consistent with the
disposition TSPEC §2.6 already committed to (`hookCompatibility.test.js` retained, not deleted).
Nothing about the falsifiability of L-5's own acceptance criterion (REQ AC-1.3 — "never reconciled
by a test that counts loosely") changed: pre- and post-erratum, L-5 still states a single decidable
integer to be re-measured from the tree at correction time. No new test double, fixture, or
assertion shape was introduced or implied by this edit — it stays inside REQ/FSPEC altitude
(observable count, not test-construction detail), so it needed no TSPEC/PROPERTIES-level review.

One caveat, filed as a finding below rather than blocking this round: the literal's *only*
grounding at the engine-code level is a comment, not an executable assertion — meaning the 97-vs-99
disagreement this erratum resolves was never actually catchable by CI, only by manual DoD review
(as in fact happened). That is a process observation about how this class of drift gets caught, not
a defect in the erratum itself.

## Value verification

- Suite-size arithmetic re-derived independently: 119 pre-sweep − 21 deletions (20 of M-8's 21,
  since `hookCompatibility.test.js` is retained per TSPEC §2.6, plus
  `runtimeProvenanceWiring.test.js`) + 1 (`consumerCleanup.test.js`, TSPEC §5.2) = 99. Matches
  FSPEC L-5 post-erratum (`FSPEC:400`–`:406`).
- `pdlc/engine/__tests__/preflight-baseline.test.js:238`–`:249` (T13's header comment) states the
  same 97-vs-99 disagreement and the same TSPEC §4.4 grounding FSPEC row 7 cites — confirmed the
  citation is accurate to file and content.
- T13's actual assertions (`:261`–`:280`) check the C7-block deletion and drift-hook
  non-invocation in `hookCompatibility.test.js`; they do not assert a numeric literal anywhere in
  the file. No test in `preflight-baseline.test.js`, or elsewhere in `pdlc/engine/__tests__/`,
  parses FSPEC's L-5 count or fails if it drifts.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | FSPEC §7.1 ASM-2 (`FSPEC:844`) still reads L-5's derivation as "119 − 22 = 97," the arithmetic this erratum superseded at L-5 itself. From a traceability lens, ASM-2's own veto-path text ("TSPEC creates a new module → L-5 corrected at re-measurement time") describes exactly the condition that already fired (TSPEC §4.4 diverged, L-5 was corrected) — yet the row's supporting numbers weren't updated to match the outcome it is narrating. Nothing mechanically re-derives ASM-2's arithmetic from L-5 (no test parses either), so this doesn't fail any oracle at HEAD and stays Medium, not High — but a reader relying on ASM-2 rather than L-5 as the derivation record will land on the wrong number. | §7.1, ASM-2 |
| F-02 | Low | Process | The 97→99 disagreement this erratum resolves was, by this round's own verification, never enforced by an executable assertion — only documented in a comment (`preflight-baseline.test.js:238`–`:249`). The disagreement was caught by manual DoD review (CODE_REVIEW-pdlc-plugin-retirement-v1.md finding 4), not by CI. This is not a defect in the current erratum, but it is a repeatable gap: a future literal edit to either FSPEC L-5 or TSPEC §4.4 could silently re-diverge without any test going red. Worth considering (non-blocking, future round or harvest item) whether the two literals should be cross-checked by an assertion rather than a comment, given this project's stated preference for falsifiable oracles over documentation-only invariants. | T13 gate design |

## Questions

None.

## Positive Observations

- The erratum stays exactly at REQ/FSPEC altitude: it corrects an observable-outcome integer, not
  a test-construction detail, and required no TSPEC/PROPERTIES-level rework to land.
- The corrected value is independently re-derivable from TSPEC §4.4's stated arithmetic rather than
  merely trusted from the FSPEC's own prose — closing this round's existing-code/existing-spec
  claim-verification obligation cleanly.
- §7.3 row 7 follows the same ledger convention as the six previously-approved rows (raised-against
  / resolution columns, explicit citation to the CODE_REVIEW finding that surfaced it), keeping the
  erratum trail auditable rather than ad hoc.

## Recommendation

**Approved with minor changes.**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:0b43f9827dafd779e1e1c3f60b6368f39916bcdbc6d0bde4117f2ce92f7dccde
APPROVAL-HASH-NORMALIZED: sha256:a1254861f351aa34d30a4ba1f0bdf9cf88c38011c9e721bec25f02d60852be7e
REVIEWED-COMMIT: 07ba02e0b5d697ed3a2c1823033289cf20bb425e
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
