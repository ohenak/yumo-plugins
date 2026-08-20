# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.8)
**Date:** 2026-08-19
**Iteration:** 9 (delta confirmation of the v0.8 erratum)

## Overview

Scope is the delta `fa229bde..a6b42bae` (ten inserted, two deleted lines: version row `0.7`→`0.8`,
upstream REQ pointer `v0.8`→`v0.9`, and the v0.8 erratum note at `:32-38`) **plus** re-measurement
of the FSPEC against upstream REQ at HEAD, as DEC-ERR-03 requires of a confirmation round.

**The routed item is resolved, and resolved correctly.** The raised item — the
`present && config.enabled && !sectionMalformed` gate and the open shipping default (ERR-4) — is
genuinely TSPEC-scoped, and the FSPEC's own text is already the authority TSPEC must be re-grounded
on, not a text needing change:

- FSPEC Step 0(2) (`:162-168`) reads an absent section, absent config file or misspelt section name
  as REQ §4.1's declared defaults with `enabled` at `true` and continues the flow; only an explicit
  `enabled: false` stops it (Step 0(3), `:169-170`). D-1 (`:243`) and BR-14's state table
  (`:603-613`) say the same thing three times consistently.
- REQ v0.9 AC-5.1a backs it verbatim: *"an absent configuration section is not this state … absent
  must read as §4.1's declared defaults, which leave `enabled` at `true` … there is no second gate
  beyond this key"* (`REQ:378-384`). REQ sha256 `ff605dd3…e84dd` matches the dispatch hash, so the
  upstream I checked is the one I was told to check.
- The §I.2/§I.4/§OQ.2 numbering the item cites does not exist in this FSPEC (one incidental `§I`
  string, no such sections), and does exist in TSPEC — where the gate is literally written
  (`TSPEC:435`) and where the sibling-defaults contrast is drawn the wrong way
  (`TSPEC:432`: *"an absent section is `present:false`, so the feature is still off until an
  operator writes the section"*). Routing this to TSPEC is the right call.

**But the confirmation does not stop at the routed item, and one High is open.** Re-reading the
FSPEC against REQ v0.9 at HEAD, the observability record loci in BR-9, BR-10 and their acceptance
tests are no longer a faithful compression of REQ AC-3.2 and AC-3.3. REQ's own erratum v0.8 moved
corpus-level outcomes and ordering-key values to a **per-authoring-dispatch** locus and demoted a
run-level record to *"additive, is not the oracle"*; the FSPEC still specifies them as recorded
**once per run**. This is inherited, not introduced by this edit — the REQ sha in my v8 approval
(`UPSTREAM-STATE: … e84dd`) is the same one in force now, so I missed it in earlier rounds rather
than the ground moving underneath. It is still a High, and it is load-bearing: TSPEC has already
stalled on exactly this contradiction (`TSPEC:343-354`, *"Until REQ answers, the run-level record
remains the stated locus"*). REQ has answered; the FSPEC has not yet carried the answer down.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `inherited` `nonlocal` — **BR-9, BR-10 and AT-20/21/22 still specify a run-level locus that REQ v0.9 has moved to per-dispatch.** BR-9 reads *"States in which no document is known are recorded once per run"* (`:510`); BR-10 specifies *"a run-level rule-input record"* whose two members — ordering key values per corpus document **and** thresholds in force — form one closed set with **one** completeness test (`:540-547`); BR-8 restates it (`:494`); Step 21 emits the rule-input record *"once per run"* (`:233-234`). REQ v0.9 says the opposite in two places. AC-3.2: corpus-level outcomes are *"recorded **per authoring dispatch**, alongside AC-3.1's rows for that dispatch (a run-level mirror, if carried, is additive, **is not the oracle**, and has a deliberately unconstrained value that nothing asserts on)"* (`REQ:325-330`). AC-3.3: *"the **ordering key value per document** is recorded **per authoring dispatch**… the **§4.1 thresholds in force** are recorded **once per run**… Each locus's fields are a closed set: **two** completeness tests assert set equality, one per locus"* (`REQ:333-344`) — with the stated reason that the corpus may move mid-run, so one run-level record cannot describe two dispatches. The divergence propagates into the acceptance tests, which is where it becomes a wrong oracle rather than a wording slip: AT-21 asserts empty rows *"for every authoring dispatch"* of the run (`:846-847`) where REQ scopes that to the dispatch carrying the outcome; AT-22 reads *"the report's run-level rule-input record"* and asserts *"set equality over the record's two members"* (`:848-853`) where REQ requires two per-locus tests. Note AT-18 already asserts the per-dispatch reading for BR-8's rows (`:837-838`), so the document is internally split. This is not an altitude complaint: REQ states these as observable report contents, and the FSPEC contradicts them. **Fix:** BR-9's corpus-level catalogue records per authoring dispatch alongside BR-8's rows for that dispatch (any run-level mirror stated as additive and non-oracular); BR-10 splits into two closed loci — ordering key values per authoring dispatch, thresholds once per run — each with its own completeness test; Step 21 and BR-8's closing line follow; AT-21 scopes to the dispatch that carried the outcome; AT-22 splits into the two set-equality assertions. TSPEC's ERR-4-adjacent open question at `TSPEC:343-354` closes on the same edit. | §BR-9 (`:510`), §BR-10 (`:540-547`), §Behavioral Flow step 21 (`:233`), AT-21/AT-22 (`:846-853`) |
| F-02 | Low | Local | `inherited` `nonlocal` — the header's Cross-Reviews row still reads `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2,3,4,5,6}.md` (`:13`), three rounds behind: v7, v8 and this v9 exist for both reviewers. Cosmetic, but this row is what an operator greps to reconstruct the review history of an erratum-heavy document. **Fix:** extend the brace list through the current round in the same edit that lands F-01. | §Header (`:13`) |
| F-03 | Low | Local | `inherited` `nonlocal` — v8's F-01 is unlanded: the AC-6.2 traceability row still carries acceptance-test ids in the **rule** column (`\| AC-6.2 \| §Acceptance-test preamble, AT-31, AT-32 \| AT-31, AT-32 \|`, `:134`), and still spells the heading `§Acceptance-test preamble` where AC-6.1 spells it `§Acceptance Tests preamble` (`:133`) and the real heading is `## Acceptance Tests` (`:730`). It was explicitly filed as fold-into-next-edit, and the v0.8 erratum was that edit; it did not fold. Restating it so it is not lost a second time. **Fix:** column 2 reads `§Acceptance Tests preamble` alone. | §Traceability (`:134`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's fix makes the per-dispatch ordering-key record the AC-3.3 oracle. TSPEC currently ships `corpusOutcome` and `ruleInputs` as run-level LAST-WRITE-WINS singletons with per-dispatch values also kept (`TSPEC:322-360`). Is the intent that the run-level singletons survive as REQ's explicitly-additive mirror — in which case FSPEC should say so, and say nothing asserts on them — or that they go away entirely? Either answer is consistent with REQ; leaving it unstated is what produced the current split. |

## Positive Observations

- **The erratum declined to make a behavioural change it was not asked for, and said why.** The
  routed item pointed at a real defect, but the defect is in TSPEC, and the FSPEC's response was to
  re-read upstream, confirm its own text is already right against REQ v0.9 AC-5.1a, and record the
  routing rather than edit the flow to look responsive. Editing Step 0 here would have created a
  second contradiction on top of the first. Recording the item as TSPEC-scoped with the reasoning
  in the document is the cheaper and more auditable outcome.
- **The erratum notes are accumulating in order rather than being overwritten.** `:21-38` now
  carries three notes (v0.6, v0.7 follow-up, v0.8), each naming its upstream version and what it
  re-grounded. A reader arriving at this document cold can reconstruct which REQ each claim was
  measured against and when — which is exactly what let me establish that F-01 is inherited rather
  than introduced, and that no round's edit made it worse.
- **The upstream pointer was actually updated, not just asserted.** The header row moved from REQ
  v0.8 to v0.9 (`:11`) in the same commit as the re-read. Documents that claim to be re-grounded
  while still pointing at the prior upstream version are a recurring way stale compressions
  survive review; this one does not do that.
- **Nothing previously approved moved.** The delta is confined to the header rows and the new
  erratum block. BR-4's evidence table, the notice catalogues, the edge-case inventory and all
  thirty-five acceptance tests are byte-identical to the approved v0.7.

## Recommendation

**Needs revision**

The routed ERR-4 item is fully discharged: the gate correction belongs to TSPEC, the FSPEC's Step 0,
D-1 and BR-14 already say what REQ v0.9 AC-5.1a says, and the erratum note records the routing
honestly. If the item list were the whole scope, this would be an approval.

It is not the whole scope. Measured against REQ at HEAD, F-01 is open: BR-9, BR-10, Step 21 and
AT-20/21/22 specify corpus-level outcomes and ordering-key values as a single run-level record with
one closed set, while REQ v0.9 AC-3.2/AC-3.3 put both at a per-authoring-dispatch locus, name the
run-level mirror explicitly non-oracular, and require two completeness tests. That is a High under
the delta re-review bar whether it is inherited or new, and it is not academic — TSPEC has already
parked an open question on precisely this contradiction and is waiting on FSPEC to resolve it.

To close: land the per-dispatch loci in BR-9 and BR-10, split BR-10's closure into two per-locus
completeness tests, follow through in Step 21, AT-21 and AT-22, and answer Q-01 in the text so
TSPEC knows whether the run-level singletons survive as an additive mirror. F-02 and F-03 are
one-line header and traceability fixes that should ride along in the same edit.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}

