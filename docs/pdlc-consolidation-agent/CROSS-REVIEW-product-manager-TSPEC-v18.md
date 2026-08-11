# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v2.8)
**Date:** 2026-08-10
**Iteration:** 18
**Scope:** Delta confirmation of the v2.8 erratum only (FSPEC v11.7 minted AT-K3b). The document
was approved at v17; no section outside the erratum's three sites was re-reviewed.

## Erratum items confirmed

| Item | Claim | Site | Status |
|------|-------|------|--------|
| E-01 | §12.2's "no register AT reaches either" is false since AT-K3b was minted | §12.2 (`:2863`) | **Resolved** |
| E-02 | §12.3 must assign AT-K3b to `consolidationPass.test.js` | §12.3 (`:2938`, `:2944`) | **Resolved** |
| E-03 | §12.4 register set-equality is short one id | §12.3 count para (`:2908`) | **Resolved** |

**E-01.** The clause is no longer a whole-corpus claim. §12.2 now scopes "no register AT reaches any
of them" to the **three** observables of the partial-unreadable class (counted toward
`|un-consolidated|`, omitted from the consumed pair per REQ §4b, basename named in the report body),
with AT-P8 correctly distinguished as the unreadable *log* file. The **fourth** observable — the
whole-corpus `no-op` with an empty consumed pair (§10.3 row 1b) — is then separated out and
explicitly attributed: "That one **is** now a register obligation: FSPEC v11.7 mints AT-K3b." The
false statement is gone, and it was fixed by scoping rather than by deletion, which preserves the
true half. AC-1.4's third cause is named as such and reconciled against the first and second causes
(AT-R7's all-suppressed, AT-P6/E-08's empty-corpus), so the criterion's three causes now each carry
a register id rather than two of three.

**E-02.** §12.3 assigns **AT-K3b** to `consolidationPass.test.js`, and §12.2's second fixture is
stated as AT-K3b's discharge with the register's discriminator (empty consumed-basename list *while*
the un-consolidated set is non-empty) asserted positively. The family split is handled explicitly
rather than left as an apparent inconsistency: `consolidationCredential.test.js` carries a sentence
saying AT-K3b is **deliberately** not there, because the split is by subject (corpus handling vs.
credential resolution) and the id→file obligation is one file per **id**, not per id prefix. That is
the right disposition — the alternative, moving AT-K3b to sit with AT-K1…AT-K7, would have put a
corpus-handling oracle in a credential file purely for cosmetic prefix tidiness.

**E-03.** Verified mechanically rather than by reading the prose. Enumerating `AT-…` tokens over
FSPEC §13 (§§13.1–13.9) and de-duplicating yields **100** ids; the same enumeration over §12.3's
assignment table yields **100** (the two apparent extras, `AT-…` and `AT-K`, are prose fragments —
the ellipsis token and the phrase "the AT-K family" — not ids). The diff is **empty in both
directions**. §12.3's count paragraph states 100, re-derived at FSPEC v11.7, and attributes the
delta from 96 to the correct mints. Set equality holds as claimed.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings. All three erratum items are absorbed; no new product-lens defect introduced by the edit. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- **The fix is scoped, not blanket.** The erratum asked for a false clause to be dropped. The author
  kept the clause where it remains true (the three partial-unreadable observables) and carved out
  only the fourth observable that AT-K3b now covers. A blanket deletion would have lost the AT-P8
  distinction, which is still load-bearing.
- **The AT-K family split is disclosed at both ends.** Both `consolidationPass.test.js` and
  `consolidationCredential.test.js` carry the explanation, so a reader arriving at either file finds
  the reason rather than an apparent bookkeeping error. This is the kind of thing that otherwise
  becomes a finding in a later round from a reviewer who sees only one side.
- **The count is explicitly demoted to a reader's summary.** §12.3 notes that
  `consolidationTraceability.test.js` re-derives both sides at run time, so a fourth drift goes red
  in the suite rather than requiring a fourth erratum round. That is the correct durable fix for a
  number that has now drifted three times, and it is why this item should not recur.
- **Citation discipline held under edit.** The new text anchors the FSPEC by §-number + heading + id
  (`FSPEC §13.6 register, AT-K3b`) rather than by line range, obeying §12.2/§11.3(e)'s own rule — the
  rule that three earlier rounds each spent a finding on.

## Recommendation

**Approved**

The v2.8 erratum is fully absorbed at all three sites. §12.2 no longer asserts anything false about
the register's reach, §12.3 assigns AT-K3b to the file whose subject owns it, and the register
set-equality is restored and verified empty-diff in both directions at 100 ids. No High, Medium, or
Low findings. Product-lens traceability is improved by the edit: AC-1.4's third cause now binds a
register oracle where it previously bound none, which closes the gap this document itself raised
upstream.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
