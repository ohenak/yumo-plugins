# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.2)
**Date:** 2026-08-30
**Iteration:** 13 (delta re-review, DECISION FREEZE in force)
**Upstream at dispatch:** REQ v1.9, FSPEC v1.3, Baseline v1.2

## Overview

I approved this TSPEC at v0.7, v0.8, v0.9 and v1.0, and returned **Needs revision** at v12 on a
single `inherited` High that lived in `PLAN`, not here. This round re-reviews the v1.2 delta under
DECISION FREEZE.

What I did: re-read my v12 findings; ran `git diff 54b17bf84..HEAD` over the TSPEC (54b17bf84 is the
v1.1 commit v12 measured); read the three delta commits (`d7aee41ec` §4.3, `a3715ae0e` §7.3,
`3a17387d6` changelog); re-read §4.3 and §7.3 whole rather than only the changed cells; re-measured
`PLAN` at HEAD because my v12 High was a claim *about* that document; and verified in the repository
every production symbol the changed prose leans on.

**Scope of the edit.** 70 insertions, 10 deletions, three regions only — the revision-history
changelog, §4.3's framing paragraph, and §7.3's *stated once* paragraph. No AT row, no traceability
row, no corpus literal (6,305 / 10,859 / 12,059 / 441) and no upstream pin moved. Upstream is
byte-unmoved at REQ v1.9 / FSPEC v1.3 / Baseline v1.2, so nothing this TSPEC compresses has drifted
and no `ERRATUM:` is owed upstream. No product decision was re-opened and no acceptance criterion
narrowed, broadened or re-triggered.

**Bottom line up front.** All three of my v12 findings are resolved — F-01 by `PLAN` v0.8 landing at
HEAD, F-02 and F-03 by this delta, both answered better than I asked. Nothing the delta touched
broke anything that worked before. Two Mediums remain, both introduced by this delta and both fixable
in one sentence each: the changelog's disposition of F-01 is stale against `PLAN` at HEAD, and §4.3's
new enforcement rationale claims a guard fires in a case where, as §7.3 specifies it, it does not.
Neither is a blocking finding under the freeze rules — neither breaks prior behavior, and neither
makes a normative claim of this document false. **Approved with minor changes.**

## Architecture

**My v12 F-01 (High, `inherited`) is resolved at HEAD, by the document that owned it.** I re-measured
all six sites I listed at v12 against `PLAN-pdlc-decision-ledger.md` at HEAD, and every one is
corrected:

| v12 site | State at HEAD |
|---|---|
| `PLAN`:19 (revision history) | Replaced by **v0.8**, which names both items still-raised, states "this document is the stale side", and quotes §7.3's correction direction verbatim (`PLAN`:19) |
| v0.7's "rejected resolution" paragraph | Retained but explicitly demoted: "*superseded in part by v0.8: the count and home this entry records were corrected downstream-to-TSPEC-§7.3; retained as history*" (`PLAN`:25) — withdrawn as contract, kept as history, which is exactly the right disposition |
| T-11 | Now reads "**All three are declarations of this task's own test file**", "the **eight** plumbing declarations", "the **fourteen** top-level declarations" (`PLAN`:158) |
| T-18 | Now reads "This task writes **no census constant**… there is no production declaration to add here (v8 PM F-01 / TE F-01; this reverses the v0.7 instruction)" (`PLAN`:164) |
| File-ownership manifest | The census test file is "the sole home of **all three** frozen census lists… never of `orchestrate-dev.js`" (`PLAN`:213); no `orchestrate-dev.js` row claims a census constant (`grep -n "CENSUS_TOKENS"` returns no manifest row for that file) |
| §Definition of Done | six ∪ eight = fourteen, all three constants test-file constants, "none is production code or member of the owned list" (`PLAN`:496–505) |

Three commits did it — `0c3c71d7c` (T-18 instruction removed), `2a13b74a7` (ownership re-assigned to
T-11's test file), `cc386ebae` (DoD bullet). They landed 2026-08-29 09:58–09:59, four minutes after
my v12 file was committed (`ee93f2a08`, 09:55). So the finding was accurate when written and is
closed now; the cascade reached `PLAN` after all. **F-01 is resolved; it is not carried forward.**

**Why I credit the structural shape of the fix.** The erratum was routed here at round 11 and this
document answered it by installing a single-siting rule with a stated correction direction rather
than by re-stating arithmetic. `PLAN` v0.8's revision history quotes that direction sentence back
and uses it as the reason it is the stale side — which is the mechanism working end to end, not just
a coincidence of both documents converging on fourteen. That is the outcome the round-11 edit was
designed for, and it is worth recording that it produced the effect it claimed it would.

## Interfaces

**v12 F-02 (single-siting claim stronger than the mechanism) — resolved, and resolved the honest
way.** §7.3's pin paragraph no longer asserts an absence the file contradicts. It now separates three
kinds of site explicitly (TSPEC:1428–1441):

- **This paragraph is the authority** for the count.
- **The two operand rows are its enumeration** — "subordinate to this paragraph rather than a
  competing statement of it" — which is the correct reading, since the enumeration is what makes
  fourteen checkable at all.
- **The revision history records counts as history of an edit, not as claims about HEAD.**
- What stays forbidden is "a *third* kind of site": an independent restatement in another section or
  a downstream document.

It then adds the resolution rule that was missing: "When this paragraph and an operand row disagree,
this paragraph is right and the row is the defect." I asked for the claim to be softened to what it
holds; the author instead made the mechanism *decidable*, which is strictly better — a reader who
finds two numerals now knows which one to fix without a round trip. I re-grepped every count word in
the file and each occurrence now falls into exactly one of the three sanctioned categories:
`:1387`/`:1388` (operand rows, enumeration), `:31`/`:53` (changelog, history), `:1425` (the
authority). No fourth-kind site exists. **Resolved.**

**TE's round-12 F-01 also landed here and I checked it does not disturb my lens.** The pinned phrase
now reads "six functions ∪ eight constants = fourteen" with the collision against the *Forbidden
token set* row's numerically-identical-but-membership-different partition named inline (TSPEC:1425–
1430). This is a disambiguation of a citation token, not a change of count or membership; the
fourteen and the six/eight memberships are byte-identical to v1.1. No acceptance criterion is
affected.

**Downstream is now consistent with the pinned phrase.** `PLAN`:158 cites "six ∪ eight = fourteen,
cited from §7.3 and not restated elsewhere in this document"; `PLAN`:496–499 states the DoD bullet
"cites it and does not restate it"; `PROPERTIES` carries fourteen at PROP-INV-07 and PROP-INV-11.
All three downstream documents and this one now agree. There is nothing left for the erratum channel
on this axis — which is the substance of F-01 below.

## Data Model

**v12 F-03 (§4.3's "four constants" named only two) — resolved, and resolved normatively.** §4.3 now
reads "the **four framing pieces** together must render to ≤ 1,200 bytes" (:900) and then answers the
question I actually asked: "**Only two of the four are top-level constants**… the header and trailer
sentinel lines… appear in that block as literal text and ship that way — **inline string literals
inside `renderDecisionLedgerBlock`'s body**, not top-level bindings. That is a normative statement
about the shipped shape, not a description of one" (:901–908). That is the right answer for a
TSPEC: it *decides* the shape rather than describing an unwritten one, so the count this document
pins cannot move under an implementer's discretion. The paragraph also separates the two pins
cleanly — 1,200 bytes measures *rendered output*, fourteen counts *declarations* — which is the
distinction whose absence produced my finding.

**I re-derived the partition after the edit to confirm it did not move.** Six functions
(`selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`) ∪ eight top-level constants
(`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`,
`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_OMIT_REASONS`,
`DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES`) = fourteen, disjoint across the
forbidden/exempt split (TSPEC:1447 enumerates the exempt eight; the forbidden six are named in the
same row). With the sentinels ruled inline, no fifteenth name appears. **The count is unmoved by
this delta, exactly as the changelog claims.**

**Where the delta over-claims (F-02 of this round).** §4.3's new justifying sentence says hoisting a
sentinel to a top-level `const` "would introduce a feature-declared name absent from
`DECISION_LEDGER_OWNED_DECLS`, which §7.3's classify-or-redden guard fires on" (:908–910). Read
against §7.3 as specified, that guard does not fire in this case:

- The set-equality conjunct compares three **frozen literals declared in the census test file**
  (`DECISION_LEDGER_CENSUS_TOKENS ∪ DECISION_LEDGER_CENSUS_EXEMPT = DECISION_LEDGER_OWNED_DECLS`,
  TSPEC:1447). Adding an unclassified production `const` to `orchestrate-dev.js` leaves all three
  literals untouched and still equal — nothing reddens.
- The resolves-to-exactly-one conjunct ranges over *members of* `DECISION_LEDGER_OWNED_DECLS`. A name
  that is not a member is not checked.
- The one path that *can* red is indirect: an unclassified declaration's body is not sliced out, so it
  stays in the scanned remainder, and reddens **only if it contains one of the six forbidden tokens**.
  A sentinel string constant contains none. So the guard fires for a newly added *data-carrying*
  declaration and is silent for an inert one — and the sentinel is precisely the inert case the
  sentence invokes.

The normative rule ("ship inline") is unaffected and still stands on its own; what is wrong is the
stated reason a violation would be caught. This matters because the sentence is what a future editor
will rely on when deciding the pin is self-enforcing. The fix is one clause: say the pin is held by
this section's normative statement, and that hoisting is caught by review against §7.3's fourteen
rather than by a red test. I record this as Medium — it is a delta-introduced inaccuracy about a
test's behaviour, not a change to any count, contract or acceptance criterion.

The same overclaim is present in §7.3's own *Forbidden token set* row ("a symbol added later must be
classified into one list or the other or the test reddens", :1447). Those are pre-round bytes this
delta did not touch, so I note it as inherited rather than folding it into F-02.

## Test Strategy

Product lens only: whether the requirements this delta touches are still provable as the REQ asks.

- **No acceptance criterion moved.** I diffed the changed regions against the AT and traceability
  tables: no AT row, no BR/E/AC mapping and none of the four corpus literals is touched. REQ v1.9 and
  FSPEC v1.3 are byte-unmoved, so the compression this TSPEC performs is still faithful.
- **BR-11 / REQ-DECLEDGER-08 / NG-4 (P0) are now served end to end.** §7.3 remains the oracle, the
  traceability rows still point at it, and with `PLAN` v0.8 re-pinned the *instructions* implementation
  reads no longer contradict the specification. At v12 the proof path was broken at `PLAN`; at HEAD it
  is not. That was the substance of my blocking finding and it is gone.
- **The repository claims the changed prose leans on are true.** I verified each rather than trusting
  the prose: `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:61` declares
  `DECL_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/` — anchored to
  `function` only, which is why §7.3 requires the clone to widen it; `allTopLevelDecls` (:63),
  `bodyOf` (:123) and `ANCHOR_TOKENS` (:114) all exist as cited, and `ANCHOR_TOKENS` is indeed a
  top-level constant of the **test** file, which is the precedent the census-constant homing rests on.
  In `pdlc/workflows/orchestrate-dev.js` the five shipped `/Decision/i`-matching declarations §7.3
  names all exist — `MERGE_MAX_DECISION_STEPS` (:88), `renderDecisionEntry` (:4640),
  `escalationDecision` (:4738), `erratumGateDecision` (:6914), `parseDecisionsWarranted` (:7044) — so
  the "enumerated, never derived from a name pattern" argument is grounded in real symbols.
- **The framing pin is still a literal transcription, not an echo.** §4.3's ≤ 1,200 bytes is asserted
  "by a pure unit test against that literal" (:901) and §7.3 conjunct (5) explicitly refuses to fold
  framing into the 12,059 equality because the constants do not exist yet. The delta preserves both,
  and the "measures rendered output, not a constant count" clause makes the unit test robust to how
  the sentinels are spelled — which is the right property for an expectation that must not import its
  expected value from the code under test.
- **The completeness question my F-02 raises is a real set-equality gap, but an inherited one.** The
  census's set equality is over three frozen test-file lists, so it catches a *deleted or renamed*
  owned member (via resolves-to-exactly-one) but not an *added, inert* module declaration. For BR-11's
  purpose — proving a coupling does not exist — an added data-carrying declaration does red, which is
  the case the requirement is about. So the oracle serves the requirement; only §4.3's description of
  its reach is wrong. That is why F-02 is Medium and not High.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Is the erratum this document's v1.2 changelog raises against `PLAN` going to be dispatched? It should not be: `PLAN` v0.8 closed all six sites at HEAD (`0c3c71d7c`, `2a13b74a7`, `cc386ebae`, all ancestors of the changelog commit `3a17387d6`). If the channel has already routed it, the right action is to withdraw it rather than open a `PLAN` round that has nothing to change. This is F-01 below. |
| Q-02 | `PLAN` v0.8's header pins TSPEC at **v1.1** `sha256:21c913b4…9c8e49`, and TSPEC is now v1.2. Nothing normative moved between them for `PLAN`'s purposes — §7.3's count, membership and correction direction are byte-identical, and §4.3's sentinel ruling does not change the fourteen — so this is a pin refresh, not a re-derivation. Worth confirming the pin-check path treats it that way rather than opening a full round. Noted for the orchestrator, not a finding against this document. |

## Positive Observations

- **Both of my document-local findings were answered above the bar I set.** F-02 asked for the
  single-siting claim to be softened to what it holds; the author instead made it *decidable* by
  adding "when this paragraph and an operand row disagree, this paragraph is right and the row is the
  defect". F-03 asked for a sentence saying whether the sentinels are constants; the author answered
  **normatively**, so the count cannot move under implementer discretion. Both fixes close the failure
  mode, not just the finding.
- **Scope discipline under a frozen decision set was complete.** Three regions, 70/10 lines, no AT
  row, no traceability row, no corpus literal, no upstream pin. I verified each of those claims
  independently and every one held.
- **The changelog is explicit that F-01 was not addressed here and says why.** Declining to edit
  another document's contract from this one is the correct call and the round made it plainly rather
  than quietly. My finding is with the *tense* of that entry, not its disposition.
- **The round-11 mechanism demonstrably worked.** `PLAN` v0.8's revision history quotes §7.3's
  correction-direction sentence back and uses it as the reason `PLAN` is the stale side. That is the
  single-siting rule producing the effect it was written to produce, one round later, in a document
  this one does not own.
- **TE's citation-collision finding was absorbed without moving anything.** "six functions ∪ eight
  constants = fourteen" disambiguates the phrase against the numerically identical forbidden/exempt
  partition, at zero cost to the count or its membership.

## Recommendation

**Approved with minor changes**

My v12 blocking finding is resolved — by `PLAN` v0.8 at HEAD, verified site by site — and both of my
document-local findings are closed by this delta. Nothing the delta touched broke anything that
worked before, no acceptance criterion moved, and upstream is byte-unmoved and faithfully compressed.
The two findings I raise are delta-introduced Mediums, each a single sentence to fix, and neither
falsifies a normative claim of this document:

1. **F-01 — changelog disposition of PM F-01 is stale against `PLAN` at HEAD.** One sentence: change
   "`PLAN` v0.7 still carries the retired fifteen-member owned list" to record that `PLAN` v0.8 closed
   it, and withdraw the erratum rather than raising it.
2. **F-02 — §4.3's enforcement rationale over-claims the guard.** One clause: attribute the pin to
   this section's normative statement plus review against §7.3's fourteen, rather than to a test that
   would red.

Neither needs a further review round; they can land with the next edit this document takes.

DEFERRED: §7.3's *Forbidden token set* row carries the same "a symbol added later must be classified into one list or the other or the test reddens" over-claim as §4.3's new sentence — true for a data-carrying addition, silent for an inert one; a one-clause qualification would make the row's reach exact.
DEFERRED: The census's set equality is over three frozen test-file lists, so it detects a deleted or renamed owned member but not an added, inert module declaration; if that gap is ever to be closed mechanically, the instrument is a set-equality between `DECISION_LEDGER_OWNED_DECLS` and the module's feature-introduced top-level declarations at HEAD — a design decision, not a defect, and out of scope in a frozen round.
DEFERRED: `PLAN` v0.8's header still pins TSPEC v1.1 while HEAD is v1.2; nothing normative moved between them, so this is a pin refresh for the cascade to absorb, not a content divergence.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | The v1.2 changelog states "PM F-01 (High, `inherited`/`nonlocal`) is **not** addressed here and is not this document's to fix: `PLAN` v0.7 still carries the retired fifteen-member owned list and a production home for `DECISION_LEDGER_CENSUS_TOKENS`… it is raised on the erratum channel from this dispatch". That is false at HEAD: `PLAN` is at **v0.8** and all six sites are corrected — `:19` (v0.8 entry naming this document as authority), `:25` (v0.7 entry demoted to "superseded in part… retained as history"), `:158` (test-file home, eight exempt, fourteen owned), `:164` ("This task writes **no census constant**… this reverses the v0.7 instruction"), `:213` (manifest: census test file is the sole home of all three) and `:496–505` (DoD: six ∪ eight = fourteen). The three `PLAN` commits (`0c3c71d7c`, `2a13b74a7`, `cc386ebae`, 2026-08-29 09:58–09:59) are **ancestors** of this changelog commit (`3a17387d6`, 2026-08-30 22:45), so the state was observable when the entry was written. The entry's disposition (PLAN's phase owns it) was right; its tense is not. Consequence is process cost, not a wrong spec: it re-raises a closed High on the erratum channel and invites a `PLAN` round with nothing to change. Medium rather than High because no normative section, count, contract or acceptance criterion of this document is affected — the error is confined to the revision history. Fix: one sentence recording that `PLAN` v0.8 closed the item, and withdraw the erratum. | Revision history, v1.2 entry, :25 |
| F-02 | Medium | delta | local | §4.3's new paragraph states that hoisting a sentinel to a top-level `const` "would introduce a feature-declared name absent from `DECISION_LEDGER_OWNED_DECLS`, which §7.3's classify-or-redden guard fires on" (:908–910). As §7.3 specifies the census, it does not fire for this case: the set-equality conjunct compares three frozen literals declared in the census **test file** (:1447), which an unclassified production `const` leaves untouched and still equal; the resolves-to-exactly-one conjunct ranges only over members of the owned list; and the one indirect path — an unsliced body remaining in the scanned remainder — reddens only if that body contains one of the six forbidden tokens, which an inert sentinel string does not. The guard fires for a newly added *data-carrying* declaration and is silent for the inert one the sentence invokes. The normative rule ("ship inline") is correct and unaffected; the stated reason a violation would be caught is not, and it is exactly the sentence a future editor would rely on to conclude the pin is self-enforcing. Fix: one clause attributing the pin to this section's normative statement and to review against §7.3's fourteen, not to a red test. | §4.3 framing paragraph, :908–910 |
| F-03 | Low | inherited | nonlocal | §7.3's *Forbidden token set* row asserts "a symbol added later must be classified into one list or the other or the test reddens" (:1447). Same over-claim as F-02, and its source: an added declaration reddens only when its body carries a forbidden token, since the three compared lists are frozen test-file literals. Pre-round bytes, untouched by this delta; recorded so the two are fixed together rather than one at a time. | §7.3 *Forbidden token set*, :1447 |

FINDING: Medium | delta | local | Revision history, v1.2 entry, :25 | The changelog says PM F-01 is unaddressed because "PLAN v0.7 still carries the retired fifteen-member owned list and a production home for DECISION_LEDGER_CENSUS_TOKENS" and raises it on the erratum channel; PLAN is at v0.8 at HEAD with all six sites corrected (:19, :25, :158, :164, :213, :496-505), and the three PLAN commits are ancestors of this changelog commit — so the entry re-raises a closed High. Disposition right, tense wrong; confined to the revision history, no normative content affected.
FINDING: Medium | delta | local | §4.3 framing paragraph, :908-910 | The new sentence claims hoisting a sentinel to a top-level const fires §7.3's classify-or-redden guard; as §7.3 specifies the census, it does not — the set equality compares three frozen test-file literals an unclassified production const leaves equal, resolves-to-exactly-one ranges only over owned members, and the unsliced-remainder path reddens only on a forbidden token, which an inert sentinel string is not. The normative "ship inline" rule stands; its stated enforcement does not.
FINDING: Low | inherited | nonlocal | §7.3 *Forbidden token set*, :1447 | The row's "a symbol added later must be classified into one list or the other or the test reddens" carries the same over-claim as §4.3's new sentence and is its source; an added declaration reddens only if its body carries a forbidden token. Pre-round bytes, untouched by this delta.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
