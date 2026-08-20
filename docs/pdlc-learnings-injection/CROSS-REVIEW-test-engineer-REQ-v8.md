# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 8
**Round type:** delta confirmation of erratum `386e4f0c` (v0.8) on a previously approved REQ
**Scope:** the erratum diff and the upstream text the REQ leans on. Sections the edit did not
touch were not re-reviewed except where an upstream re-check reached them (DEC-ERR-03).

## Problem / Context

Erratum v0.8 was dispatched to land seven routed items: two locus items on AC-3.2 (corpus-level
outcomes and not-selected rows moved to AC-3.3's per-dispatch locus), the AC-5.1b
malformed-section decision, AC-1.2's outside-set closure over authoring-tagged dispatches with no
C-1 document type, and the §1.2 enumeration-depth correction. The question for this round is
whether the delta resolves those items without breaking what was previously approved, and whether
the REQ is still a faithful compression of upstream as upstream reads now.

Six of the seven routed items landed and verify clean against HEAD. One did not land: §1.2
claim 2 still attributes a fail-open-on-unlistable outcome to the shipped sibling enumeration and
to DEC-CONS-05, and re-reading upstream shows that claim is not merely mis-cited but contradicted
by the shipped code. That is a High, so this round is **Needs revision**.

## Goals

- Confirm the routed items landed as stated, at the altitude the REQ writes at.
- Re-derive every upstream claim the edited passages rest on from HEAD source, not from the
  prior round's cross-review.
- Report any finding the re-check surfaces, listed or not (DEC-ERR-03).

## Non-Goals

- Re-litigating sections the erratum did not touch and that no upstream re-check reached.
- TSPEC-altitude test mechanics (fixture construction, seam design, oracle placement). REQ-level
  findings below ask only for black-box observables.
- Product framing, architecture choice, or the merits of fail-open as a policy — the policy is
  decided; only the accuracy of its stated precedent is in scope.

## Constraints

- Delta-confirmation altitude: findings must be tagged `{delta|inherited}` and `{local|nonlocal}`
  so the workflow can route them.
- REQ altitude: an underspecification finding must fail the "write a black-box acceptance test
  right now" check, not the "write a unit test" check.

## Routed-item disposition

| # | Routed item | Landed? | Evidence |
|---|-------------|---------|----------|
| 1 | High/delta/local — AC-3.2 corpus-level outcomes vs AC-3.3's per-dispatch locus | **Yes** | AC-3.2 now records `RSN-UNLISTABLE`/`RSN-EMPTY` "**per authoring dispatch**, alongside AC-3.1's rows for that dispatch", and names the run-level mirror explicitly additive and "not the oracle". Locus now matches AC-3.3. |
| 2 | Medium/delta/local — AC-3.2 not-selected rows carry no locus | **Yes** | "names, **per authoring dispatch**, the corpus documents **not** selected for that dispatch". A divergent-corpus run now has one list per dispatch, not one contested list per run. |
| 3 | Medium/delta/local — AC-5.1b malformed-section precedent was defaults+notice, not inertness | **Yes** (with a residual, F-03) | AC-5.1b now decides fail-open: "the run stays **enabled** on §4.1's declared defaults **and** the report carries a catalogued notice". Consistent with G-4 ("Fail-open, always … absent, empty, malformed, truncated") and with AC-5.1a's explicit-`false`-only disablement. |
| 4 | Low/inherited/nonlocal — §1.2 claim 2 enumeration depth off by one | **Yes** | Now "one directory level under `docs/` and one under `docs/completed/`". Matches `LS_FILES_ARGV` at `pdlc/workflows/consolidate-learnings.js:1338-1345`: `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md`, where `:(glob)`'s `*` does not cross a `/`. |
| 5 | Medium/delta/local — AC-3.2/AC-3.3 divergent-corpus interaction | **Yes** | Both ACs now sit on the same per-dispatch locus; AC-3.3's "corpus may move mid-run … no run-level record can be true of both" is no longer contradicted by a run-scoped AC-3.2. |
| 6 | AC-1.2 / C-1 outside-set closure | **Yes**, and verified at HEAD | AC-1.2's outside-set now closes over "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD". Confirmed: Phase CR calls `reviewLoop` with `docType: null` (`orchestrate-dev.js:14553-14558`) and the optimizer episode is dispatched with kind `"authoring"` (`:7659-7665`), so the clause names a dispatch that really exists and is really outside C-1. Also confirmed the clause is exhaustive at HEAD: `se-implement` goes through `agentFn` with no `dispatchKind`, and harvest is tagged `"harvest"` (`:14731`). |
| 7 | §1.2 claim 2 fail-open outcome attributed to DEC-CONS-05 | **No** | See F-01. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | §1.2 claim 2 still says the shipped enumeration ships "a fail-open outcome when the listing itself fails (DECISIONS-pdlc-consolidation-agent § DEC-CONS-05)". Both halves are wrong against upstream as it reads now. (a) **The shipped pass fails closed.** `enumerateCorpus` returns a total `{unlistable: true, detail}` rather than throwing (`consolidate-learnings.js:1347-1353`), but the pass's response to it is `state.status = "failed"` and an immediate `finishPass` return (`:588-593`, comment: "§10.3 row 1a — `failed`, NO reason code … Never `no-op`"). The sibling aborts the run on an unlistable corpus; it does not fail open. (b) **DEC-CONS-05 does not decide this.** Its decision text is "Ship one predicate, two enumerations, with different kinds of evidence for each half" — the predicate held equal by differential test, the enumerations held as literal argv/glob pins (`DECISIONS-pdlc-consolidation-agent.md:422-447`). It says nothing about the unlistable outcome. This matters beyond citation hygiene because §1.2 exists so "a later reviewer can check the premise rather than trust it", and because the surrounding sentence claims this feature reuses the shipped pass-side definition "by restating and pinning it": a TSPEC author pinning that restatement would pin a behaviour the sibling does not have. It also hides a real and deliberate divergence — this feature *does* fail open (G-4, C-7, AC-3.2's `RSN-UNLISTABLE`) exactly where the sibling fails the run. **Fix:** state what HEAD does and cite it — the enumeration returns a total unlistable outcome rather than throwing (`consolidate-learnings.js:1347-1353`), the sibling pass then fails the run (`:588-593`) — and say plainly that this feature diverges by failing open per G-4/AC-3.2, sourcing that to G-4/C-7 rather than to DEC-CONS-05. | §1.2 claim 2 |
| F-02 | Medium | Local | The delta moved AC-3.2's not-selected rows and corpus-level outcome into the per-dispatch record but did not extend AC-3.1's closure clause to match, so two set-equality oracles now contend over one record. AC-3.1 says the enumeration "is closed over the per-dispatch row fields alone (a completeness test asserts set equality)" and then explicitly carves out one co-located neighbour — "AC-3.3's rule inputs are recorded separately, at the loci under the closures AC-3.3 names". AC-3.2's newly co-located fields got no such carve-out, and AC-3.2 places them "alongside AC-3.1's rows for that dispatch". A test author cannot mechanically decide whether `notSelected` and the corpus-level outcome are members of AC-3.1's closed field set: if they are, AC-3.1's enumerated list is incomplete and its completeness test fails; if they are not, AC-3.1 needs the same one-clause carve-out it already gives AC-3.3. The "write the black-box test right now" check fails on AC-3.1's completeness assertion alone. **Fix:** extend AC-3.1's carve-out sentence to name AC-3.2's per-dispatch not-selected rows and corpus-level outcome alongside AC-3.3's rule inputs, or state that AC-3.1's closure is over each selected-document row's fields rather than over the dispatch record's fields. | AC-3.1 / AC-3.2 |
| F-03 | Low | Local | AC-5.1b's new precedent sentence — "the same response the sibling reader ships, which keeps running on its declared defaults and reports" — is not true of the reader that was cited when this item was routed. `parseAdvisoryConfig` (`orchestrate-dev.js:1964-1983`) does return `ADVISORY_DEFAULTS` with `sectionMalformed: true` on a non-object section, but the sole consumer never reads that flag: `orchestrate-dev.js:13679-13685` emits a notice only for `invalidKeys`, and only when the tier is already on, so a malformed advisory section is silently absorbed with no report line. Its declared default is also `enabled: false` (`:1944-1949`), so that reader is not a precedent for staying enabled either. The claim *is* true of `parseImplementationConfig`, whose malformed section produces defaults plus an explicit operator notice (`:14130-14134`). The decision itself stands on G-1/G-4/C-7 and does not depend on the precedent, which is why this is Low rather than gating. **Fix:** name the reader — the implementation-config reader at `orchestrate-dev.js:14130-14134` — instead of the unattributed "the sibling reader". | AC-5.1b |

## Risks

- **Unlanded premise defect compounds.** F-01 has now survived two erratum rounds while the
  sentence around it was edited twice. The next round should land the sentence, not the citation
  alone — the correction is a behavioural restatement, not a reference swap.
- **Silent divergence from a reused definition.** Because §1.2 currently presents the shipped
  behaviour and this feature's behaviour as the same, a downstream TSPEC could pin the sibling's
  unlistable handling as if it were fail-open and produce a test that passes against the wrong
  oracle. The divergence is legitimate; it just has to be written down.

## Obligations

- F-02 is a one-clause fix to AC-3.1 and can ride the same erratum as F-01.
- F-03 is optional at REQ altitude but cheap; leaving it means the next reader who follows the
  precedent to `:1981-1983` finds a reader that does not report.
- No open questions for the author beyond the three fixes stated inline.

## Positive Observations

- The AC-3.2/AC-3.3 locus unification is exactly right and is the substantive win of this round.
  The parenthetical "a run-level mirror, if carried, is additive and is not the oracle" is the
  sentence that makes the pair testable: it names which record a falsifying test must read, so a
  correct-looking run-level summary can no longer green a divergent-corpus run.
- AC-3.2's closing clause — "with a corpus-level outcome for a dispatch, that dispatch's AC-3.1
  rows are present and empty" — keeps the present-and-empty oracle positive rather than
  absence-shaped, per dispatch. Good falsifiability discipline under a locus change.
- AC-1.2's outside-set clause is the rare REQ-level HEAD claim that survives mechanical
  verification unchanged: the CR optimizer really is authoring-tagged with a `null` docType, and
  it really is the only such dispatch at HEAD. Naming a concrete instance rather than asserting
  emptiness makes the byte-identity oracle non-vacuous.
- AC-5.1b's decision is the right one and is stated as a decision with its reasons (G-1, G-4,
  C-7) rather than as an inference, so a later reader can tell it was chosen, not defaulted into.
- The §1.2 depth correction now matches `LS_FILES_ARGV` glob-for-glob, including the
  tracked-and-untracked-but-not-ignored framing of `--cached --others --exclude-standard`. The
  `prepack.mjs:20` vendoring citation also checks out: `MODULE_NAMES` is exactly
  `["orchestrate-dev.js", "orchestrate-queue.js"]`, so C-3/G-6's unreachability premise holds.

## Recommendation

**Needs revision** — one High finding (F-01), one Medium (F-02), one Low (F-03).

Six of the seven routed items landed cleanly and verify against HEAD; the delta broke nothing
that was previously approved. The single blocker is the routed item that did not land, and the
re-check shows it is stronger than filed: §1.2 claim 2 does not merely cite the wrong authority,
it states a behaviour the shipped code does not have. Land F-01 and F-02 in one erratum and this
document is approvable.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
