# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.8)
**Date:** 2026-08-19
**Iteration:** 9 (delta confirmation)

## Overview

This is a **delta confirmation**, not a full re-review. FSPEC was approved at v0.7. A targeted
erratum landed as v0.8 (`a6b42bae`, +10/-2 lines, header + one new erratum note only). I read the
erratum diff, then re-read the upstream REQ at HEAD
(`sha256:ff605dd3…e84dd`, v0.9 — matches the dispatch sha exactly) to answer the confirmation
question and, per DEC-ERR-03, to check that this FSPEC is still a faithful compression of what its
upstream *currently* says.

**Answer to the confirmation question:** the delta resolves the routed item correctly and breaks
nothing previously approved. **But the scope of this confirmation is FSPEC-vs-upstream at HEAD, not
the item list**, and the re-read surfaced two places where FSPEC still compresses REQ acceptance
criteria that upstream has since re-scoped. Both are **inherited** (present in pre-round bytes; the
erratum did not touch them) and **nonlocal** (outside the sections the edit changed). Both are High,
so the round is **Needs revision** on the DEC-ERR-03 channel rather than on the routed item.

## Routed-Item Disposition

| Routed item | Disposition | Evidence |
|---|---|---|
| §I.2/§I.4/§OQ.2 gate on `present && config.enabled && !sectionMalformed`; ERR-4 shipping default left open; re-ground on REQ v0.9 / FSPEC v0.7; close OQ.2 | **Resolved — correctly recorded as out of scope for this document** | The cited section ids (`§I.2`, `§I.4`, `§OQ.2`) are TSPEC numbering; this FSPEC carries no such sections (`grep` for them returns nothing). The erratum note says exactly that and re-affirms the settled behaviour rather than silently deferring. |

I verified the re-affirmation is true of the bytes, not just of the note:

- **Step 0(2)** — "Absent section, absent config file, or a misspelt section name → the configuration
  reads as REQ §4.1's declared defaults, which leave `enabled` at `true`, and the flow continues at
  (4)". No second gate. Matches REQ AC-5.1a's "absent must read as §4.1's declared defaults, which
  leave `enabled` at `true` … there is no second gate beyond this key (G-1)".
- **BR-14's five-state table** — absent / misspelt / absent-file, `enabled: false`, malformed,
  wrong-typed key, admits-nothing thresholds. Four of the five compose the **enabled** composition;
  only explicit `enabled: false` disables. Matches AC-5.1a/b/c and AC-4.4 member for member.
- **Malformed fails open with `NTC-MALFORMED`** (BR-14, BR-9 notice catalogue), matching AC-5.1b's
  decided fail-open. The `ERR-4` "shipping default open" question is therefore already closed in this
  document and was closed before this erratum.
- The precedent citations BR-14 leans on are real: `parseAdvisoryConfig`, `parseMergeConfig` and
  `sectionMalformed` all exist in `pdlc/workflows/orchestrate-dev.js` (verified by grep, not trusted
  from the doc). REQ v0.9 newly names `parseImplementationConfig` for the same behaviour; that symbol
  also exists, and FSPEC's citation of the sibling readers is compatible rather than contradictory —
  it is a wider precedent set, not a different claim.

So the gate correction really is TSPEC's to land, and this FSPEC needed no behavioural change for it.

## Upstream Re-Verification at HEAD

REQ moved v0.8 → v0.9 in `a2353445` (+14/-8). Three substantive changes. I checked each against what
FSPEC says today:

| REQ v0.9 change | FSPEC still faithful? | Notes |
|---|---|---|
| §1.2 claim 2 restated: `consolidate-learnings.js`'s `enumerateCorpus` is total but the pass around it marks itself `failed`; **this feature deliberately diverges and fails open** (`RSN-UNLISTABLE`) | **Yes** | FSPEC never claimed the sibling's listing was fail-open. BR-12 and Step 1(7) state only this feature's own behaviour, and F-O-4 restates O-7's pin as a literal-restatement obligation without inheriting the sibling's failure semantics. Nothing to correct. |
| AC-5.1b now names `orchestrate-dev.js`'s `parseImplementationConfig` as the precedent | **Yes** | BR-14 cites `parseAdvisoryConfig`/`parseMergeConfig` for the *same* behaviour (defaults + explicit notice, per-key fallback + invalid-key list). All three symbols verified present in the cited file. Compatible; see F-03 for the one hygiene nit. |
| AC-3.1's closure **scoped to each selected document's row**, with AC-3.2's and AC-3.3's records explicitly sitting **outside** that set, each closed at **its own locus** | **No — see F-01, F-02** | AC-3.2's corpus-level outcomes and AC-3.3's ordering-key values are both **per authoring dispatch** upstream. FSPEC BR-9 records corpus-level outcomes "once per run" and BR-10 records the rule inputs as a single "run-level" record with one completeness test. |

The AC-3.1 row is where the compression has drifted. Note this drift predates the v0.8 erratum: the
per-dispatch locus for AC-3.3 arrived at REQ v0.7 (`c1180acb`) and for AC-3.2 at REQ v0.8
(`386e4f0c`), while FSPEC's own v0.6 erratum claimed to re-ground on REQ v0.8. So both findings are
**inherited**, not introduced by this edit — but they are live against upstream at HEAD, and
DEC-ERR-03 requires me to file them here even though they are not in the routed-item list.

BR-8 itself is fine, and AT-18 already tests the mid-run corpus-change case for BR-8's rows — which
is exactly why the neighbouring records being run-level is inconsistent rather than merely
under-specified.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | BR-9 records corpus-level outcomes at the **wrong locus**: "recorded once per run". REQ AC-3.2 (v0.8, unchanged in v0.9) records them **per authoring dispatch**, and says a run-level mirror "if carried, is additive, **is not the oracle**, and has a deliberately unconstrained value that nothing asserts on". AT-20 inherits the ambiguity — it asserts set equality over `RSN-UNLISTABLE`/`RSN-EMPTY` without naming the locus, so an implementation can satisfy AT-20 with a single run-level field and still fail AC-3.2. Same drift in BR-9's per-document catalogue, which never states its locus at all ("Every corpus document that was known but did not contribute carries exactly one reason id") while AC-3.2 pins it **per authoring dispatch**. | BR-9; Step 1(7)(8); AT-19, AT-20, AT-21; E-02 |
| F-02 | High | Local | BR-10 defines "a **run-level** rule-input record" whose two members are ordering key values *and* thresholds, closed by **one** completeness test. REQ AC-3.3 splits the loci deliberately and gives the reason: "the corpus may move mid-run … so two authoring dispatches in one run may legitimately observe different corpora, and **one run-level record could not describe both**". Upstream records the **ordering key value per document per authoring dispatch**, thresholds **once per run**, and requires **two** completeness tests, one per locus. AT-22 encodes the merged version ("the report's run-level rule-input record is read … a completeness test asserts set equality over the record's two members"), so as written AT-22 is **green against a report that cannot reproduce a second dispatch's selection** — the exact false-green AC-3.3 exists to prevent. BR-8's closing line ("BR-10's rule-input record is separate, run-level") carries the same error. | BR-10; BR-8 (closing line); AT-22; E-26 |
| F-03 | Low | Process | Header hygiene: the Cross-Reviews field still reads `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2,3,4,5,6}.md` while rounds v7, v8 and now v9 exist on branch. Minor, but the field is the trail a later harvest follows to find which rounds bound this document. | Header table |

Both High findings are **inherited** and **nonlocal** — they sit outside the sections the v0.8
erratum touched, and the erratum did not introduce them. They are still gating: the rigour bar is any
open High, old or new, anywhere in the document.

### What would resolve F-01 and F-02

Both are locus corrections, not new behaviour, and neither requires re-opening a settled decision:

1. **BR-9** — state that corpus-level outcomes and per-document reason rows are recorded **per
   authoring dispatch**; if a run-level mirror is carried, say explicitly that it is additive and not
   the oracle (upstream's words), so no test may assert on it.
2. **BR-10** — split the record into two loci: ordering key values **per authoring dispatch**
   (alongside BR-8's rows for that dispatch), thresholds **once per run**; declare **two**
   completeness tests, one per locus. Fix BR-8's closing cross-reference to match.
3. **AT-20 / AT-22** — name the locus in the Given/Then, and add the falsifying case AC-3.3 implies:
   a run where the corpus changes between two authoring dispatches, where the per-dispatch
   ordering-key record for dispatch 2 differs from dispatch 1 and each reproduces its **own**
   selection by hand. AT-18 already sets this fixture up for BR-8's rows, so the fixture exists and
   the extra assertions are cheap. Without that case, a merged run-level record passes.

## Questions

| ID | Question |
|----|---------|
| Q-01 | When a corpus-level outcome (`RSN-UNLISTABLE`/`RSN-EMPTY`) differs between two authoring dispatches of one run — listing fails for the first, succeeds and finds documents for the second — is that a state you intend to be representable? AC-3.2's per-dispatch locus says yes; BR-9's "once per run" says no. The answer decides whether F-01 is a wording fix or a behavioural one. |
| Q-02 | Does AC-3.2's "deliberately unconstrained value that nothing asserts on" (new in REQ v0.9) need a corresponding negative statement in FSPEC, so a downstream author does not write an oracle against the run-level mirror? I read it as worth one sentence in BR-9. |

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->
