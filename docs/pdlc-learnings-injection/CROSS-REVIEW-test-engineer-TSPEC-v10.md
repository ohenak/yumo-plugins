# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (TSPEC bytes unmoved; FSPEC moved v0.10 → v0.12)

## Overview

**Question answered:** is TSPEC — bytes unmoved since its v8 approval (`sha256:eff5a19b…`) — still
approved against FSPEC as it now stands at `sha256:fb18dbda…` (v0.12)?

**Answer: yes, with minor changes.** The cascade window is two erratum rounds, not one: my v9
confirmation was recorded against FSPEC v0.10 (`sha256:a4f775bd…`), and HEAD carries v0.11 and
v0.12 on top of it. Both rounds move in TSPEC's direction — v0.11 gives BR-1 the second conjunct
this TSPEC has been carrying (and routing as ERR-7) since v0.5, and v0.12 carries that complement
through BR-11, D-2, A-2, AT-02, AT-03 and AT-29, and restates BR-15's expected set as a set of
paths rather than a count of open attempts. No oracle in this TSPEC is falsified by either round.

What the round does leave is **staleness in the other direction**: TSPEC quotes upstream text that
upstream has now repaired, and its AT-02 transcription is now a strictly weaker fixture list than
the AT-02 it compresses. Those are this confirmation's findings (DEC-ERR-03), and none is High.

**State at HEAD, re-measured this round:**

| Artifact | sha256 | Versus v9 |
|---|---|---|
| TSPEC (under review) | `eff5a19b…` | identical — unmoved since the v8 `APPROVAL-HASH` |
| REQ (upstream) | `ff605dd3…` | unmoved; matches the dispatch's stated hash |
| FSPEC (upstream) | `fb18dbda…` | moved from `a4f775bd…`; matches the dispatch's stated hash |

Working tree on `feat-pdlc-learnings-injection`. The measured diff over the whole window
(`git diff 15d8f46e..HEAD -- FSPEC-…md`) is 80 changed lines, of which the behaviour-bearing edits
are: BR-1's two-conjunct restatement, BR-11's complement, D-2's three branches, AT-02's fourth
fixture, AT-03/AT-29's requantification, BR-15's set-vs-count clarification, A-2's rewording, the
Overview's one-conjunct restatement removed, and two header rows. No new BR, no new AT id, no new
E-row, no locus reassignment, no traceability row retired.

## Architecture

The architecture claim most exposed by this window is §A.2's attachment condition:

```
const injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType);
```

Until v0.10, that conjunction was TSPEC going **beyond** its upstream: BR-1 said a dispatch carries
a block "if and only if the pipeline classifies it as authoring", and added that the rule "consumes
the classification, it does not restate the membership". TSPEC's §A.2 said so plainly ("FSPEC BR-1
as written forbids this conjunct") and routed the divergence as ERR-7 rather than resolving it in
code. That was the right call, and the erratum vindicated it.

At HEAD, BR-1 reads: "**both** hold: the pipeline classifies it as authoring, **and** its target
document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)", and names the
second conjunct "load-bearing, not defensive — an authoring-classified dispatch whose target is
none of those six document types (the code-review phase's optimizer round at HEAD) is outside the
rule". That is §A.2's P-2b/P-2c premise, adopted verbatim in substance. Re-checked, row by row:

| TSPEC architecture claim | Upstream at v0.12 | Status |
|---|---|---|
| P-2a — four `dispatchKind: "authoring"` code sites | BR-1 no longer enumerates call sites; "read off the classification, not maintained here" | unaffected; premise is measured at HEAD, not quoted |
| P-2b/P-2c — classification is **wider** than C-1; Phase CR's `docType: null` optimizer | BR-1's second conjunct and its parenthetical name exactly this dispatch | now upstream-backed rather than TSPEC-only |
| P-3 — single `dispatchAndVerify` funnel | Overview's "runs once per authoring dispatch, immediately before the dispatch is composed" | verbatim, untouched |
| P-7/P-8/P-10 — read/list/git seams | BR-8's per-document unlistable/unreadable rows | untouched by this window |
| P-11/P-12 — `parseAdvisoryConfig` sibling precedent | untouched | unaffected |

Two consequences for this section:

1. **ERR-7's premise is gone.** §A.2's paragraph "FSPEC BR-1 as written forbids this conjunct
   ('consumes the classification, it does not restate the membership'), and AT-02's expected set
   inherits the ambiguity, so the divergence is **routed as ERR-7**" now quotes a sentence upstream
   no longer contains, and routes a question upstream has answered. The engineering content is
   unchanged and correct; the routing note is stale. F-02 below (Low).
2. **`LEARNINGS_TARGET_DOCTYPES` keeps its hand-transcribed status.** BR-1 still declines to
   maintain a list of its own ("Both conjuncts read the pipeline's own existing values"), so DC-14's
   hand-transcription of C-1's six names into `learningsDispatchSet.test.js` remains the right
   oracle — importing the production constant would still be the vacuous form. Nothing to change.

The implementation anchors §A.2 cites (`orchestrate-dev.js:14551-14556`, `:7306`, `:7342-7358`,
`:8978`) have not moved in this window — `472e505c` is still the last commit to touch that file —
so the v8 by-symbol re-verification of P-2a/P-3/P-11/P-12 stands. F-05 (positional anchors, DEC-DOC-01)
carries forward unrepaired and unchanged in severity.

## Interfaces

Interface contracts are where a cascade does its quiet damage: TSPEC's paraphrases of upstream
sentences are what break when upstream re-words. Re-read against FSPEC v0.12:

- **§I.2 / §I.4 — the `config.enabled` gate.** Untouched upstream in this window. BR-14 and Step
  0(2) still carry REQ §4.1's fail-open reading with no second gate key (REQ AC-5.1a), and TSPEC's
  compression is still one-for-one. ERR-4 remains correctly marked CLOSED.
- **§I.3 — `present` is report shape, not a gate.** Upstream unmoved; the v8 finding (no
  behavioural oracle, only a shape assertion, with no named consumer) survives untouched as an
  *inherited* Medium. This cascade neither fixed nor worsened it. F-03 below.
- **Seam signatures (`_readFile` / `_listFiles` / `_git`, and the `_recordDocType` probe).** FSPEC
  constrains outcomes, not seam design; nothing in this window contradicts TSPEC's choices. The
  `_recordDocType` probe seam in particular becomes *more* clearly justified at v0.12: BR-1 now
  positively asserts that an authoring-classified non-C-1 dispatch is outside the rule, and the
  probe is still the only instrument that can see a `docType` the feature declined (report rows
  cannot — the rejected dispatch produces no row).
- **Notice and reason catalogues (`NTC-*`, `RSN-*`).** Untouched upstream; TSPEC's transcription is
  still one-for-one. `RSN-SELF`'s "decided from the path before any read" survives verbatim in
  BR-15, which is the sentence §D.6 leans on.
- **The block delimiter and suffix contract (BR-7, C-8).** Untouched.

**One interface-level label lag.** §A.2 argues the `docType` conjunct is load-bearing because,
without it, "AC-4.3's byte-identity **for non-authoring dispatches** fails on every full pipeline
run". Upstream deliberately retired that quantifier this round: BR-11 and AT-29 now read "every
dispatch prompt **outside BR-1's rule** — whether it fails the authoring conjunct or the C-1
target-document conjunct". TSPEC's sentence is still *true* (the non-authoring dispatches are a
subset), but it names the narrower set upstream just widened, and it is the sentence a PLAN author
transcribes into the byte-identity fixture's quantifier. One-word repair, Low severity: F-04.

**Version labels.** The v9 finding stands unrepaired and has drifted further: TSPEC's front-matter
Upstream row still cites FSPEC "(v0.9)", and five body passages (§D.2's loci table preamble, the
E-21…E-34 row-ownership note, the AT-20/AT-22 test-file row, and two Open-Questions entries) still
say "FSPEC v0.9". HEAD is v0.12. As in v9, every cited *proposition* is still present upstream —
BR-9/BR-10's loci, the E-21…E-34 rows and the AT-20/AT-22 halves are byte-identical — so no claim
is falsified and nothing is gating. Because TSPEC's bytes did not move this round, this is now
`inherited`, not `delta`: F-06.

## Data Model

The window touched no BR-8/BR-9/BR-10 field list, no locus assignment and no catalogue row, so
§D.1–§D.4's transcriptions are unaffected. Re-verified the four that would have moved if anything
had:

| TSPEC data-model claim | Upstream at v0.12 | Status |
|---|---|---|
| §D.1 — per-document catalogue rows recorded per authoring dispatch, `runMirror.corpusOutcome` additive and unasserted | BR-9's "Recorded **per authoring dispatch**, alongside BR-8's rows" unchanged | faithful |
| §D.2 — `ruleInputs.thresholds` at run level, `orderKeys` per dispatch | BR-10's two-loci wording unchanged | faithful |
| §D.3/§D.4 — notice catalogue, `Date Completed` prefix match | unchanged | faithful |
| §D.5 — UTF-8 byte accounting, cut never splits a codepoint | unchanged | faithful |

**§D.6 is the one section the window actually reaches, and it comes out stronger.** §D.6 says
`RSN-SELF` is decided from the path before any read, "which is what BR-15's expected-set exclusion
of `RSN-SELF` documents requires". BR-15 still carries that exclusion in the same words at v0.12
("except those carrying `RSN-SELF`, decided from the path before any read"), so the compression
holds. What changed around it is the **shape** of the expected set:

- **Was (v0.10):** "the corpus-root enumeration, plus **exactly** one open attempt for every corpus
  document the report names" — a count-shaped definition whose first term (the enumeration) is a
  `git ls-files` call that opens nothing under `docs/`.
- **Is (v0.12):** "the corpus documents the report names … Both sides are compared as **sets of
  paths**, not as counts, so a document opened more than once neither adds a member nor changes the
  verdict (REQ AC-5.2)", with the enumeration explicitly contributing **no** member.

That is exactly the repair TSPEC's ERR-3 asked for, and it lands the way TSPEC argued it should
(§I.1, §A.3: the enumeration is an argv, not an open). Two data-model consequences:

1. **ERR-3 is now stale in its own quotation.** It still quotes the v0.10 definition verbatim and
   concludes "As written, AT-33's set equality cannot hold." Upstream no longer says it, and the
   conclusion no longer applies. F-01 below (Low): close ERR-3 as resolved, citing v0.12, rather
   than leaving a PLAN author to reconcile a contradiction that only exists in the older bytes.
2. **The de-duplication clause is a load-bearing negative for §T.6, and TSPEC already covers it.**
   BR-15 now states positively that a document opened more than once does not change AT-33's
   verdict. That makes AT-33 structurally blind to per-iteration re-selection — which is precisely
   what §A.2's property 2 and the `RETRY-ITERATION` fixture were written to cover, and TSPEC says
   so already ("AT-33 (the same read paths, merely re-read)"). The upstream edit converts TSPEC's
   inference into an upstream statement. No change owed; recorded as a positive observation.

Two data-model observations carry forward from v8/v9 unchanged and `inherited`: §D.1's fourth
domain (membership on `runMirror.corpusOutcome` while §A.5 forbids asserting on the mirror) and the
absent closure test over `Object.keys(ruleInputs)`' own key set. Neither is touched by this window.

## Test Strategy

The AT closure still balances: FSPEC v0.12 added no AT id and retired none, so TSPEC's
2 + 9 + 3 + 3 + 6 + 12 = 35 partition still maps onto the upstream set, and the D-2 → AT-02/AT-03
traceability row survives (widened in prose — "all three branches, the authoring-classified non-C-1
target included" — but the same pair of ids). The `RETRY-ITERATION` case is still correctly
declared outside the 35.

**Where the round bites: AT-02's fixture list is now under-transcribed.** Upstream AT-02 at v0.12
enumerates **four** run shapes:

> …a run with no DECISIONS phase, a run whose Phase R has no creator, a run with five optimizer
> rounds, **and a run containing an authoring-classified dispatch whose target is none of the six
> C-1 document types — so reverting BR-1's second conjunct reds this test.**

§T.6's AT-02 paragraph still says "Three run shapes are fixtured" and lists the first three, then
adds TSPEC's own fourth (the erratum land-proof retry, ERR-2). The new upstream shape — the one
carrying the mutation obligation — is not in that list. This is a Medium, not a High, for one
reason: the suite as a whole is **not** blind to the mutation. §A.2's `learningsDispatchSet.test.js`
samples `_recordDocType` on **both arms of `injectHere`** over a full scripted run that includes
Phase CR's `docType: null` optimizer, and asserts set equality against the hand-transcribed
literal; reverting the second conjunct reds it, and §A.1's "its prompt is byte-identical to the
disabled run's" claim for the Phase CR round is exercised by the AT-03/AT-29 baseline comparison.
So the falsifying test exists — it is simply owned by a different test file than the AT upstream
now attaches it to. Left as-is, a PLAN author transcribing §T.6 writes AT-02 with three shapes and
no mutation-sensitivity fixture, and the AT-02 row in the PLAN's traceability table will not honour
its own AT text. Repair: add the fourth shape to §T.6's AT-02 paragraph and state which file owns
the mutation check (F-01, Medium, `delta`, local).

Re-checked and holding, round over round:

- **Per-dispatch oracles survive.** §T.2's split — per-dispatch `orderKeys` set equality on
  `dispatches[i]`, run-level set equality over `Object.keys(ruleInputs.thresholds)` — still matches
  BR-10 word for word. Untouched by v0.11/v0.12.
- **`DIVERGENT-CORPUS` still asserts on the per-dispatch locus only**, and BR-9/BR-10's mirror
  wording is unmoved, so the "assert nothing about `runMirror`" instruction is still correct
  against upstream.
- **Positive-conjunct discipline holds.** AT-32's positive-presence conjunct, AT-30's "rows present
  and empty, **not** the absent key of a disabled run", and the `DIVERGENT-CORPUS` exact-status +
  named-reason assertions are all intact upstream and mirrored in TSPEC. No absence-only oracle was
  introduced by this round; BR-15's own framing ("a positive membership claim, not an absence-only
  one") is unchanged.
- **Byte-identity quantifier.** AT-03/AT-29 now range over "every dispatch prompt outside BR-1's
  rule". §T.3's baseline machinery is quantifier-agnostic — it records every dispatch prompt of
  every fixture case at pre-feature HEAD — so the widened quantifier costs no new baseline capture;
  the widening is in what the comparison loop iterates over, not in what was captured. Good news,
  and worth stating explicitly so PLAN does not re-open §T.3 for it.
- **Property-based coverage.** Unchanged: ordering/selection and `extractInjectableMaterial`
  remain the parameterisable components, T-O-6 still routes the generator obligation to PROPERTIES,
  and nothing upstream withdrew the input space those strategies range over.
- **Mutation sensitivity.** Upstream has now written a mutation obligation into an AT text itself
  ("reverting BR-1's second conjunct reds this test"). That is the standard this review has been
  asking for, and the only gap is TSPEC's transcription of it (F-01).

## Open Questions

This section of TSPEC is where the cascade concentrates, because two of its seven ERR items were
open **against** the FSPEC text this round rewrote.

| TSPEC item | State before this window | State against FSPEC v0.12 |
|---|---|---|
| ERR-1 | open | untouched by the window; still open |
| ERR-2 (land-proof retry has no branch-inventory row) | open, DC-05 wants a row and an AT | untouched; still open — v0.12 did not add the row, and §T.6 still carries the fixture unilaterally |
| **ERR-3 (BR-15 expected set)** | open: the quoted definition made AT-33's set equality unsatisfiable | **resolved upstream.** The quoted sentence no longer exists; the enumeration explicitly contributes no member. Close it. |
| ERR-4 | CLOSED by REQ v0.9 | unchanged |
| ERR-5 (E-13's "measured" provenance) | open | untouched by the window; still open |
| ERR-6 | CLOSED by REQ v0.9 | unchanged |
| **ERR-7 (BR-1 forbids the `docType` conjunct)** | open: "BR-1 needs to state the two-conjunct rule … or state the exclusion explicitly" | **resolved upstream.** BR-1 states exactly that, names the conjunct load-bearing, and names the code-review optimizer as the excluded case. AT-02's "two contradictory readings" are now one reading — TSPEC's. Close it. |

Leaving ERR-3 and ERR-7 open as written is the substantive residue of this round. Both now quote
upstream sentences that no longer exist, and both instruct a downstream reader to treat a settled
question as live: ERR-7 in particular tells a test author that "a test written to FSPEC reds a
correct implementation", which at v0.12 is false and could reasonably cause them to hedge AT-02's
expected set rather than assert it. Neither is High — the engineering answer both items argue for
is the one upstream adopted, so nothing in the design or the oracles changes — but both are
`delta`, caused by this window, and both are cheap: close the item, cite FSPEC v0.12, and drop
§A.2's "routed as ERR-7" clause.

Carried, unchanged, still not gating:

- **Q-01** — does `DIVERGENT-CORPUS`'s dispatch 5 produce BR-8 rows "present and empty" **and**
  `corpusDiverged: true`? Carried from v7/v8/v9, still unanswered in TSPEC, still a PLAN-time
  fixture question rather than a document defect.
- §T.2's BR-10 locus-1 row still folds two distinct set equalities into one cell (carried v7).
- §D.1's "four field domains" and §T.2's "three catalogues" still sit one line apart with no
  half-sentence reconciling the counts (carried v7).
- Positional `orchestrate-dev.js` anchors still want symbol citations at PLAN-transcription time
  (carried v8/v9; the file has not moved, so the anchors are exactly as stale as recorded, no more).

**Positive observations for this round:**

- The erratum resolved a genuine upstream/downstream conflict rather than papering it. ERR-7 had
  been open since TSPEC v0.5 and was the one place where a test written faithfully to FSPEC would
  have red-ed a correct implementation. Upstream fixing BR-1 — rather than TSPEC quietly amending
  it in code — is the outcome the routing was for, and it validates the decision to route.
- BR-15's set-vs-count restatement is a testability improvement in its own right: it removes a
  count-shaped expectation whose first term was not observable on the instrument, and it says out
  loud that AT-33 cannot see re-reads, which is what makes the `RETRY-ITERATION` fixture's
  counting-shaped call-log assertions necessary rather than belt-and-braces.
- AT-02 gaining an explicit mutation obligation in its own text ("so reverting BR-1's second
  conjunct reds this test") is the strongest form an AT can take. The only work left is for TSPEC
  to transcribe it.
- The edit remains bounded and honest: 33 insertions, 19 deletions, a self-describing changelog
  entry that accurately claims "No behavioural change", and no touched locus, catalogue or
  traceability row. Verified against the diff, not the changelog's word.

## Delta-Confirmation Findings

## Verdict
