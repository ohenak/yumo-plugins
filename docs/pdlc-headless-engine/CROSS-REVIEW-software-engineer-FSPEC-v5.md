# Cross-Review: software-engineer — FSPEC (delta confirmation, erratum round)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** Delta confirmation only — erratum item BR-MODEL-3 (`FSPEC:654-656`, raised by te-review).
Reviewed commit `d98c7e88` against the v4 approval base `e74cb61b`. No re-review of unchanged
sections.

## Delta Under Review

`git diff e74cb61b..d98c7e88` touches two hunks, both in FSPEC:

1. Version row `1.3 → 1.4` plus a v1.4 change note recording the erratum round.
2. §7.3 BR-MODEL-3: the clause "the whole corpus is reachable from dry runs and hermetic
   fixture-driven runs" becomes "reachable from hermetic fixture-driven runs", with a new sentence
   stating the dry-run surface reaches at most one row and is never the corpus's source.

**The erratum's factual claim is correct at HEAD.** I verified it rather than taking it on report:

| Claim | Evidence at HEAD |
|---|---|
| The dry-run surface dispatches nothing | `inertTransport()` returns a transport whose `dispatch()` throws — `pdlc/engine/bin/pdlc.mjs:97-104`; installed at `:174` |
| One invocation composes one skill's prompt | `--dry-run-skill`, defaulting `pm-author`, selects the single skill whose prompt is printed — `pdlc/engine/bin/pdlc.mjs:172`, `:189-191` |
| Therefore ≤ 1 map row is reachable per dry run | Follows from the two above; already stated by this document's own BR-SKILL-6 (`FSPEC:581-587`) |

The corrected clause is also the reading REQ AC-3.3 already carried: the corpus is defined over
**recorded dispatch descriptors**, needing "no billed traffic and no live run (AC-6.1)" —
AC-3.3 never claimed dry-run reachability. So the delta moves FSPEC toward REQ, not away from it.
AT-ENG-29 (`:700`) and EC-DISP-6 (`:691`) were already scoped to recorded descriptors and are
correctly left untouched. No decision from v1.0–v1.3 is reopened.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-24 | High | Local | The erratum corrected BR-MODEL-3 but left the **same false claim standing at its origin**, §6.3's preamble: "It is the mechanism by which every claim in §6.2 is checkable without billing a token, **and by which the model map of §7.3 is exercised over descriptors rather than executed calls**" — "it" being the dry-run surface. The document now contradicts itself: §6.3 says the dry-run surface is what exercises the §7.3 model map; §7.3 BR-MODEL-3 says the dry-run surface "is never the corpus's source". Fix: strike the trailing clause of §6.3 so the sentence ends at "without billing a token", or replace it with "the hermetic fixture-driven suite exercises the §7.3 model map over descriptors rather than executed calls". One sentence, no new content, no decision reopened. | §6.3, `FSPEC:573-576` (vs §7.3 BR-MODEL-3, `FSPEC:661-665`) |

This is the same defect te-review raised, at the second of its two sites. I searched for further
occurrences: a text search for `dry.run` co-occurring with model/corpus/descriptor/map wording
returns only the change note and the corrected BR-MODEL-3, because §6.3's sentence refers to the
surface as "it" and so does not match on the literal token. §6.3 and §7.3 are the only two sites;
with F-24 fixed, the claim is gone from the document.

I record explicitly that F-24 is **not a regression introduced by the delta**. §6.3 carried this
claim before the erratum and was approved with it in v1–v4 — the erratum did not break it, it
exposed it. But the erratum round's obligation is to remove the false statement from the document,
and after the delta the document is internally inconsistent, which is a worse state to hand to
Phase T than either the pre-erratum or the fully-corrected one. An implementer reading §6.3 in
isolation would still scope AT-ENG-29 over dry-run invocations — precisely the defect the erratum
exists to prevent — so this gates.

The two non-gating findings from v4 (F-22, F-23) are outside this delta's scope and remain open and
non-gating; they need no action in this round.

## Questions

None. The erratum item is unambiguous and the fix for F-24 is mechanical.

## Positive Observations

- The edit is properly scoped: it corrects the clause and adds the positive statement of what the
  dry-run surface *does* reach ("at most one row"), rather than merely deleting the false half. A
  reader now learns the bound, not just the absence of a guarantee.
- The correction cites `§6.3, BR-SKILL-5/6` inline, which is what made F-24 findable — the edit
  points at the section that still needs the same fix.
- The change note is honest about the round's shape ("one item, no new content") and names what was
  checked and left alone (AT-ENG-29, EC-DISP-6). That is the right level of detail for an erratum
  note and made this confirmation cheap.

## Recommendation

**Needs revision**

The delta resolves the cited item at BR-MODEL-3 correctly and verifiably, and breaks nothing that
was previously approved. It does not yet resolve the item *for the document*: the identical claim
survives at §6.3 (F-24), leaving FSPEC self-contradicting on the one point this round exists to
settle. Strike or requalify the trailing clause of §6.3's opening sentence and this is approved —
it is a one-sentence edit in the section the erratum already cites.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
