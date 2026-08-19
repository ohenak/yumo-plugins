# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.11)
**Date:** 2026-08-18
**Iteration:** 14 (delta confirmation)

## Scope

Delta confirmation only, under the round-13 decision freeze. Commit `07ba02e0` (FSPEC v0.10 →
v0.11) is a DoD-driven erratum, not an SE/TE-routed round: it corrects L-5's post-sweep test-module
count from 97 to 99, resolving FSPEC:158's own self-flag ("not yet corrected here") against
CODE_REVIEW-pdlc-plugin-retirement-v1.md finding 4. This round asks one question: **is a
DoD-sourced, single-literal erratum acceptable to land on a document that was already approved
(round 13), without a preceding SE/TE-routed finding naming it?**

Method: `git show 07ba02e0` diffed against the prior approved state (v0.10, `6c56b3cf`, approved
zero-finding in round 13 — `CROSS-REVIEW-software-engineer-FSPEC-v13.md`,
`CROSS-REVIEW-test-engineer-FSPEC-v13.md`). Cross-checked the corrected literal against its cited
grounding (TSPEC §4.4, `pdlc/engine/__tests__/preflight-baseline.test.js`) and scanned the rest of
the document for any other place the pre-correction literal survives.

## Answer to the framing question

**Yes, acceptable.** The erratum is not a design decision requiring SE/TE routing — it is a
value-correcting literal fix where the correct value was already settled and shipped downstream
(TSPEC §4.4, ground-truthed against `pdlc/engine/__tests__/preflight-baseline.test.js`) before this
FSPEC edit landed. FSPEC's own §7.3 erratum-ledger convention (rows 1–6, all previously approved)
already covers this exact shape of fix — a literal or citation correction traced to a specific
defect, recorded with a resolution rationale — and row 7 (`FSPEC:870`) follows that convention
verbatim, including citing the CODE_REVIEW finding that raised it. No REQ edit was required because
REQ AC-1.3 cites this FSPEC by reference rather than embedding the literal (row 7's own stated
rationale, verified against `REQ-pdlc-plugin-retirement.md`'s AC-1.3 — no inline count there).
Requiring a full SE/TE round to bless a DoD-caught, single-literal, non-behavioral erratum would
be process overhead disproportionate to the fix; the existing decision-freeze rule already permits
targeted erratum edits without reopening the round (see round-13 precedent, `6c56b3cf`).

## Value verification

- `pdlc/workflows/__tests__/*.test.js` at 119 pre-sweep, 21 of M-8's 21 deleted (not 22 —
  `hookCompatibility.test.js` retained per TSPEC §2.6) plus `runtimeProvenanceWiring.test.js`: 21
  deletions. Plus `consumerCleanup.test.js` created (TSPEC §5.2): 119 − 21 + 1 = 99
  (`TSPEC-pdlc-plugin-retirement.md:529`). FSPEC L-5 (`FSPEC:400`–`:406`) now reads "**99**",
  matching.
- `pdlc/engine/__tests__/preflight-baseline.test.js:244` reads: "TSPEC §4.4 derives a corrected
  post-sweep literal of 99." Confirmed present at that line.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | FSPEC §7.1 ASM-2 (`FSPEC:844`) still derives L-5's post-sweep count as "119 − 22 = 97" — the pre-correction arithmetic this same commit superseded at L-5 itself (`FSPEC:400`–`:406`, now 99). The erratum touched L-5 and the §7.3 ledger but did not touch ASM-2, leaving the assumptions table internally contradicting the literal it exists to justify. No test or tool parses ASM-2's prose (it is not cited by any oracle in `pdlc/engine/__tests__/`), so this is not build-blocking — but it is a genuine self-contradiction within one document version and should be corrected in the next revision touching §7.1, not left standing indefinitely. | §7.1, ASM-2 |
| F-02 | Low | Local | FSPEC §7.3 row 7 (`FSPEC:870`) states the "shipped T13 gate ... already carried the corrected 99." Verified: `pdlc/engine/__tests__/preflight-baseline.test.js:244` does contain "99," but only inside an explanatory comment (lines 238–249) — no assertion in that test file checks a numeric suite-size literal anywhere (T13's actual assertions, `:261`–`:280`, check C7-block deletion and drift-hook non-invocation, not a count). "Already carried" is accurate to the text but could be read as claiming a live, mechanically-enforced check on 99, which does not exist. Wording nit, not a defect in the correction itself. | §7.3, row 7 |

## Questions

None.

## Observations

- The fix is minimal and behavior-preserving: it touches exactly the header version bump, L-5's
  literal, and the §7.3 ledger row documenting the change — the same shape as the already-approved
  round-11/12/13 erratum edits, extending rather than deviating from established convention.
- Value-correctness is independently confirmed against TSPEC §4.4's arithmetic (119 − 21 + 1 = 99)
  and against the actual bytes of `preflight-baseline.test.js`, not merely against the FSPEC's own
  restated claim — this closes the existing-code-claim-verification obligation for this round.
- Both findings are non-blocking (Medium, Low); neither contradicts anything an oracle checks
  mechanically at HEAD, so neither meets this round's bar for a High/blocking finding.

## Recommendation

**Approved with minor changes.**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:0b43f9827dafd779e1e1c3f60b6368f39916bcdbc6d0bde4117f2ce92f7dccde
APPROVAL-HASH-NORMALIZED: sha256:a1254861f351aa34d30a4ba1f0bdf9cf88c38011c9e721bec25f02d60852be7e
REVIEWED-COMMIT: 07ba02e0b5d697ed3a2c1823033289cf20bb425e
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
