# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 9
**Round type:** delta confirmation — **no delta present**
**Scope:** the diff since the v8 round (empty) and the three findings v8 left open.

## Problem / Context

This round was dispatched as iteration 9 on a REQ that round 8 returned **Needs revision** with one
High finding. The delta-re-review protocol asks what changed since the last reviewed commit and
whether the change resolves the routed items without breaking what was approved.

The answer to the first question is: **nothing changed.** The REQ's most recent commit is still
`386e4f0c` ("erratum v0.8 — per-dispatch corpus locus, malformed-section fail-open"), the same
commit v8 reviewed and rejected. `git diff d6de2242 HEAD -- <REQ>` is empty, the working tree is
clean of REQ modifications (the only dirty path is `.claude/workflows/.pdlc-drift-state.json`), and
the document header still reads version 0.8 with the same changelog row. No erratum was authored
between rounds.

That makes this a no-delta round. There is no changed section to scan for new issues, and the three
v8 findings cannot have been resolved by an edit that does not exist. I re-derived each of them
from HEAD source anyway rather than inheriting the prior round's conclusions, because a finding
about shipped behaviour can go stale even when the document does not move. All three still hold,
and F-01's code-level half is now confirmed twice against the same lines.

## Goals

- Establish whether a delta exists at all, before judging whether it resolves anything.
- Re-verify each open v8 finding against HEAD source rather than against the v8 write-up.
- Carry the findings forward with correct `{delta|inherited}` / `{local|nonlocal}` tags so the
  workflow routes an unlanded-erratum round rather than mistaking this for a fresh revision loop.

## Non-Goals

- Re-litigating sections the v8 round approved. With no delta, the approved surface is unchanged
  and untouched; nothing there is reopened here.
- Restating the v8 findings' full reasoning. Each is reproduced below in the form a fix needs, with
  the HEAD citations re-checked, but the argument for why each matters stands in v8 and is not
  re-argued.
- TSPEC-altitude mechanics. The findings below ask only for black-box observables and for REQ
  premises that match shipped code.
- Diagnosing why the erratum did not land. That is an orchestration question, not a testing one;
  it is noted under Risks because it affects convergence, not because this review can settle it.

## Constraints

- Delta-confirmation altitude: findings carry `{delta|inherited}` and `{local|nonlocal}` tags. With
  no delta, every finding here is necessarily `inherited`, and `local`/`nonlocal` is judged against
  an empty changed-set, so all are `nonlocal` by the strict reading.
- REQ altitude: an underspecification finding must fail the "write a **black-box** acceptance test
  right now" check. F-02 is filed because a completeness assertion named in the REQ itself cannot be
  written from the REQ's own text, not because unit-level detail is missing.
- Rigour bar: any open High, old or new, means Needs revision.

## Delta disposition

| Check | Result |
|---|---|
| Last REQ commit | `386e4f0c` (2026-08-19 17:03:24 -0700) — the commit v8 reviewed |
| `git diff d6de2242 HEAD -- REQ-pdlc-learnings-injection.md` | empty |
| Working-tree modification to the REQ | none (`git status --short` shows only `.claude/workflows/.pdlc-drift-state.json`) |
| Document version / changelog row | still 0.8, still the v0.8 erratum row |
| Sections changed since v8 | none |

No delta. Nothing to confirm, nothing new to scan.

## Routed-item disposition

The v8 round routed three items. None landed, because no edit was made.

| # | Routed item (v8 id) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | F-01 High — §1.2 claim 2 attributes a fail-open-on-unlistable outcome to the shipped sibling enumeration and to DEC-CONS-05 | **No** | Sentence is byte-identical at REQ:70-72: "reaching one directory level under `docs/` and one under `docs/completed/` — with a fail-open outcome when the listing itself fails (DECISIONS-pdlc-consolidation-agent § DEC-CONS-05)". Re-checked against source: `enumerateCorpus` returns a total `{unlistable: true, detail}` (`pdlc/workflows/consolidate-learnings.js:1349-1355`), and the pass's response is `state.status = "failed"` with an immediate `finishPass` return (`:588-593`), carrying the comment "§10.3 row 1a — `failed`, NO reason code … Never `no-op`". The sibling **aborts the run**; it does not fail open. |
| 2 | F-02 Medium — AC-3.1's closure carve-out was not extended when AC-3.2's fields moved to the same locus | **No** | AC-3.1's clause at REQ:311-314 still reads "closed over these per-dispatch row fields alone (a completeness test asserts set equality); **AC-3.3's** rule inputs are recorded separately" — AC-3.3 only. AC-3.2 at REQ:322-323 still places its corpus-level outcomes "**per authoring dispatch**, alongside AC-3.1's rows for that dispatch", with no matching carve-out. |
| 3 | F-03 Low — AC-5.1b's "the sibling reader" is not the reader that behaves as described | **No** | AC-5.1b at REQ:385 still reads "the same response the sibling reader ships, which keeps running on its declared defaults and reports", unattributed. |

## Findings

All three are carried forward unchanged in substance. Tags are `inherited` (present in the
pre-round bytes; no edit touched them) and `nonlocal` (the changed-set is empty, so nothing sits
inside it).

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **(inherited, nonlocal — was v8 F-01)** §1.2 claim 2 states a behaviour the shipped code does not have and sources it to a decision that does not decide it. (a) *The shipped pass fails closed.* `enumerateCorpus` is total — it returns `{unlistable: true, detail}` rather than throwing (`pdlc/workflows/consolidate-learnings.js:1349-1355`) — but the pass's handling of that return is `state.status = "failed"` and an immediate `finishPass` return (`:588-593`). Totality of the helper is not fail-openness of the pass. (b) *DEC-CONS-05 does not decide the unlistable outcome.* Its decision text is "Ship one predicate, two enumerations, with different kinds of evidence for each half" (`docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:422-447`); the REQ itself restates that scope correctly two sentences later at REQ:76-77, which makes the earlier attribution internally inconsistent as well as wrong against upstream. This is gating rather than citation hygiene for two reasons the REQ supplies itself: §1.2 exists so "a later reviewer can check the premise rather than trust it", and the same sentence claims this feature reuses the shipped pass-side definition "by restating and pinning it" — so a TSPEC author pinning the restatement would pin an outcome the sibling does not have, and the test would be green against the wrong oracle. It also conceals a real and deliberate divergence: this feature *does* fail open on an unlistable corpus (G-4, C-7, AC-3.2's `RSN-UNLISTABLE`) precisely where the sibling fails the run. **Fix:** state what HEAD does and cite it — the enumeration returns a total unlistable outcome rather than throwing (`consolidate-learnings.js:1349-1355`), the sibling pass then fails the run (`:588-593`) — and say plainly that this feature diverges by failing open, sourcing that to G-4/C-7 rather than to DEC-CONS-05. | §1.2 claim 2 (REQ:70-72) |
| F-02 | Medium | Local | **(inherited, nonlocal — was v8 F-02)** Two set-equality oracles contend over one record. AC-3.1 closes its enumeration "over these per-dispatch row fields alone (a completeness test asserts set equality)" and carves out exactly one co-located neighbour, AC-3.3's rule inputs (REQ:311-314). Erratum v0.8 moved AC-3.2's not-selected rows and corpus-level outcomes onto the same per-dispatch record — "alongside AC-3.1's rows for that dispatch" (REQ:322-323) — without extending the carve-out. A test author cannot mechanically decide whether those fields are members of AC-3.1's closed set: if they are, AC-3.1's enumerated list is incomplete and its own completeness test fails; if they are not, AC-3.1 needs the one-clause carve-out it already grants AC-3.3. The "write the black-box test right now" check fails on an assertion the REQ explicitly calls for, which is why this is filed at REQ altitude rather than deferred to TSPEC. **Fix:** extend AC-3.1's carve-out to name AC-3.2's per-dispatch not-selected rows and corpus-level outcome alongside AC-3.3's rule inputs, or restate AC-3.1's closure as being over each selected-document **row's** fields rather than over the dispatch **record's** fields. | AC-3.1 / AC-3.2 |
| F-03 | Low | Local | **(inherited, nonlocal — was v8 F-03)** AC-5.1b's precedent sentence — "the same response the sibling reader ships, which keeps running on its declared defaults and reports" (REQ:385) — is not true of the advisory reader. `parseAdvisoryConfig` does return `ADVISORY_DEFAULTS` with `sectionMalformed: true` on a non-object section (`pdlc/workflows/orchestrate-dev.js:1964-1983`), but its sole consumer never reads that flag: the notice at `:13679-13685` fires only for `invalidKeys`, and only when the tier is already on, so a malformed advisory section is absorbed silently with no report line. Its declared default is `enabled: false` (`:1944-1949`), so it is not a precedent for staying enabled either. The claim **is** true of `parseImplementationConfig`, whose malformed section yields defaults plus an explicit operator notice (`:14130-14134`). The decision itself rests on G-1/G-4/C-7 and does not depend on the precedent, so this stays Low. **Fix:** name the implementation-config reader at `orchestrate-dev.js:14130-14134` instead of the unattributed "the sibling reader". | AC-5.1b |

## Risks

- **A no-delta round consumes an iteration without moving the document.** Round 9 costs the same
  budget as round 8 and produces the same verdict on the same bytes. If the erratum dispatch is
  failing silently, further rounds will keep returning this result; the loop cannot converge on an
  unedited file.
- **F-01 has now survived three rounds.** It was routed at v7, edited around but not landed at v8,
  and not edited at all at v9. Each round the surrounding sentence acquired more correct detail —
  the enumeration depth, the glob semantics, the vendoring premise — which makes the one remaining
  false clause read as though it had been checked too.
- **Silent divergence from a reused definition.** While §1.2 presents the sibling's behaviour and
  this feature's as the same, a downstream TSPEC can pin the sibling's unlistable handling as the
  contract and produce a test that passes against the wrong oracle. The divergence is legitimate
  and desirable; it just has to be written down before TSPEC leans on the sentence.

## Obligations

- F-01 and F-02 are both single-passage edits and should ride one erratum. F-01 is a behavioural
  restatement plus a citation swap, not a citation swap alone — the previous round's attempt
  treated it as the latter, which is why it did not land.
- F-03 is optional at REQ altitude but is one identifier's worth of work and can ride the same
  erratum.
- No open questions for the author beyond the three fixes stated inline. Each names the exact
  replacement text or the exact choice between two acceptable phrasings.

## Positive Observations

- The six routed items that **did** land at v8 remain landed and still verify against HEAD. The
  AC-3.2/AC-3.3 locus unification in particular is the substantive win of the erratum series: the
  parenthetical "a run-level mirror, if carried, is additive and is not the oracle" names which
  record a falsifying test must read, so a correct-looking run-level summary can no longer green a
  divergent-corpus run.
- AC-3.2's closing clause — "with a corpus-level outcome for a dispatch, that dispatch's AC-3.1
  rows are present and empty" — keeps the oracle positive rather than absence-shaped, per dispatch.
  That is the right shape, and F-02 does not threaten it; F-02 is about which enumeration owns the
  fields, not about whether the assertion is falsifiable.
- The three-catalogue structure in AC-3.2 (per-document reasons, corpus-level outcomes,
  configuration notices) with "three set-equality tests, one per catalogue" is exactly the
  completeness discipline this review asks for: enumerated contracts held by set equality over the
  full enumeration, so a deleted member fails.
- §1.2's *other* claims continue to survive mechanical verification: the enumeration depth matches
  `LS_FILES_ARGV`'s two `:(glob)` pathspecs glob-for-glob
  (`consolidate-learnings.js:1344-1347`), and the vendoring premise behind C-3/G-6 holds —
  `prepack.mjs`'s `MODULE_NAMES` is exactly `["orchestrate-dev.js", "orchestrate-queue.js"]`, so
  `consolidate-learnings.js` really is unreachable from an authoring dispatch at runtime. F-01 is
  one clause in an otherwise well-grounded premise section.

## Recommendation

**Needs revision** — one High finding (F-01), one Medium (F-02), one Low (F-03), all inherited.

Nothing changed since round 8. The document is byte-identical to the version that round returned
Needs revision, so the verdict is necessarily unchanged: an open High blocks approval regardless of
whether it is new. I re-derived all three findings from HEAD source rather than inheriting them,
and F-01's central claim is if anything firmer than filed — `enumerateCorpus`'s totality and the
pass's `state.status = "failed"` response are two different facts, and the REQ has collapsed them
into a fail-open claim that neither supports.

Land F-01 and F-02 in one erratum — F-01 as a behavioural restatement with the two code citations,
not as a reference swap — and this document is approvable.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
