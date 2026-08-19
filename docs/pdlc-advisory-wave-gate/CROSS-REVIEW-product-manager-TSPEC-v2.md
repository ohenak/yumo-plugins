# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.1)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v1.md` (iteration 1)
**Date:** 2026-08-20
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta review per protocol: prior cross-review re-read, `git diff a2c2ed8d..HEAD` taken over the
TSPEC (465 insertions, 78 deletions across §2.5, §2.6, §3.2–§3.6, §4.4, §4.5, §5.1–§5.6, §6), and
only changed sections scanned for new issues. Every behavioural claim in the changed sections was
checked against shipped source rather than the document's prose. Verified this round:
`ADVISORY_REFUSAL_REASONS` is a frozen eight-member catalogue (`pdlc/workflows/orchestrate-dev.js:2297`);
the `__preDispatch` escape terminates with no `_agent` call and passes `reason` straight through
(`orchestrate-dev.js:3401-3410`); `buildA3SeamOps` uses `conditionHolds: async () => true`
(`orchestrate-dev.js:2585`); `pathsCollide`'s directory rule is written on the trailing slash
(`orchestrate-dev.js:4726-4731`); the un-skip halt is a one-argument
`haltError(formatUnskipViolations(...))` (`orchestrate-dev.js:14386`); `commitPaths` destructures a
required `message` (`orchestrate-dev.js:11755-11763`); §5.4's two-stage coverage description matches
`pdlc/workflows/package.json`'s `test:coverage` script and `c8` block exactly; and
`advisoryRecord.test.js`, `advisoryEscalationLog.test.js`, `advisoryHarvest.test.js` and
`consolidationProperties.test.js` all exist. Every one of these held as written.

## Prior findings — disposition

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 `.gitignore`d paths narrow AC-5.1 | High | **Resolved** | §2.5 no longer decides the boundary; it is raised as an erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1, §6 OQ-7 carries it as the one upstream-blocking question, and §5.2's round-trip case plus §5.5's ignored-path-only repair test are flagged upstream-pending rather than pinning a TSPEC preference |
| F-02 capture-failure path writes nothing | High | **Resolved in substance** | §2.5 gives capture failure a named terminal disposition with a seven-row field table, §3.2 step 4 and §3.5 are restated to it, §4.5's halt-fields row is widened to it, and §5.2 pins six *positive* assertions on one fixture. See new F-01 and F-02 below for two residues of the mechanism chosen |
| F-03 §5 gave three P0 obligations no home | High | **Resolved** | §5.5 allocates one test per prohibition `(f)`…`(i)` with a paired positive on each row, states AC-4.5's rule as the subsection's governing rule, and names AC-4.1's conjunct-(iii) mutation fixture. §5.6 is new and is **set-equal** to FSPEC's AT set — I diffed the 45 AT ids in the FSPEC against the 45 in §5.6 and the sets are identical |
| F-04 first-match precedence not script-decidable | Medium | **Resolved** | §3.3 qualifies BR-16's blanket claim rather than defending it, names precedence as the one prompt-only rule, and states the residual against AC-6.4's countability explicitly |
| F-05 disabled tier unanswered for §2.6 notices | Medium | **Resolved** | §2.6 states the hoist is unconditional by design and §5.2's disabled-tier bullet is extended to pin the notice surface as identical |
| F-06 E-6 commit interpretation not routed | Medium | **Resolved** | §3.6 routes it to DECISIONS with a re-evaluation trigger; §6 OQ-8 carries it as one of the two entries warranting the DECISIONS document |
| F-07 two deviations claimed as recorded | Low | **Resolved** | §6 OQ-5 (staged index) and OQ-6 (cross-run promotion asymmetry) exist and the two cross-references repoint to them |
| F-08 no test home for AC-6.x record/log | Low | **Resolved** | §5.1 gains `advisoryRecord.test.js` and `advisoryEscalationLog.test.js` rows carrying AT-06-1…AT-06-6, with a stated reason for putting them beside the shipped seams' assertions |
| Q-03 `waveBudgetPerRun: 0` | — | **Answered** | §4.4 and §6's closing paragraph name it a documented operator affordance and state how it differs observably from `advisory.enabled: false` (AT-01-4 vs AT-01-6) |

## Findings

All three are **delta** findings — introduced by this round's edit, in the sections that fixed the
prior Highs. Nothing inherited is re-litigated.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §2.5's capture-failure disposition reports refusal reason `snapshot-unavailable`, a ninth member of a set REQ AC-3.4 and FSPEC BR-15 close at eight and forbid A6 from extending | REQ AC-3.4; FSPEC BR-15; AT-03-7 |
| F-02 | Medium | Local | The `__preDispatch` escape §2.5 routes capture failure through is a `gatherEvidence` return value inside `runAdvisorySeam`, but §3.2 step 4 and §3.3's signature place the capture *before* the driver is entered, so the named mechanism is out of reach from where the failure happens | REQ AC-6.1, AC-6.2 |
| F-03 | Low | Local | §4.5 extends the halt-fields row to the `snapshot-unavailable` escalation without saying what the four fields hold on a path where no diagnosis was ever obtained | REQ AC-6.3 |

### F-01 — `snapshot-unavailable` is a ninth refusal reason (High, delta, local)

REQ AC-3.4 is unusually explicit, and it anticipated exactly this situation
(`docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md:367`):

> "Given any refusal, Then it is reported with a reason drawn from the tier's existing closed,
> ordered refusal-reason set (`REQ-pdlc-advisory-tier` AC-3.6), which A6 **does not extend**: the
> set stays at eight members, and an A6 refusal that cannot be expressed in it is a defect in this
> REQ rather than a licence to add a ninth."

FSPEC BR-15 restates it and supplies the disposition for precisely this shape of outcome
(`FSPEC-pdlc-advisory-wave-gate.md:234`): "A diagnosis-only outcome … is not a refusal but an
escalation with no proposal to refuse, and it needs no reason."

§2.5's new field table reports the opposite
(`TSPEC-pdlc-advisory-wave-gate.md:244`):

> | Terminal disposition | `escalated`, reason `snapshot-unavailable` |

§2.5:252 defends the choice against the wrong closed set — "`snapshot-unavailable` is A6-local
vocabulary in the *reason* position, not a new member of `ADVISORY_ROOT_CAUSES`". That is true and
beside the point: the reason position draws from `ADVISORY_REFUSAL_REASONS`, the frozen eight-member
catalogue at `pdlc/workflows/orchestrate-dev.js:2297-2306`, and it is that set AC-3.4 and BR-15
close. `ADVISORY_ROOT_CAUSES` was never at risk here. The string `AC-3.4` does not appear anywhere
in the TSPEC, which is consistent with the constraint having been checked against the wrong clause.

This is operator-visible rather than internal. The reason travels into the advisory record entry and
into the escalation log's decision sentence — the two artifacts AC-6.1 and AC-6.2 exist to make
readable — so an operator hitting this path reads a reason no ratified document enumerates. It also
contradicts the TSPEC's own claims in two other places: §1.3/§2.2 assert "BR-15's eight-member reason
set … discharged by *not writing code*" (`TSPEC:128`), and §5.6's AT-03-7 row still promises an
ordered-sequence equality asserting "exactly eight members in the shipped order; A6 added none". As
drafted, §5.2's capture-failure fixture (`TSPEC:549`, which pins the reason as
`snapshot-unavailable`) and §5.6's AT-03-7 row cannot both pass.

Nothing about F-02's resolution depends on the ninth reason. BR-15 already names the right shape,
and the shipped escape supports it: `__preDispatch` passes `reason: pre.reason ?? null` through
untouched (`orchestrate-dev.js:3406`), so a `null` reason is a first-class value, and it is what
BR-2's own arm already uses for the analogous "nothing was proposed, so nothing is refused" outcome.

**To resolve:** report the capture-failure escalation with **no** refusal reason (`null`), matching
AC-3.4's diagnosis-only clause and BR-2's shipped arm, and carry `snapshot-unavailable` as
*diagnostic prose* in the record entry and escalation sentence where free text is allowed — not in
the reason field. Update `TSPEC:244`, `TSPEC:252` and §5.2's fixture at `TSPEC:549` together, and
cite AC-3.4 at the point of the claim. If the author believes the eight genuinely cannot express
this outcome, AC-3.4 states the remedy — an erratum on the REQ — and not a local ninth reason; but I
do not think that case needs making, because BR-15's diagnosis-only clause already covers it.

### F-02 — the escape named for capture failure sits inside a driver the capture precedes (Medium, delta, local)

§2.5 and §3.2 step 4 both route capture failure through "the shipped `__preDispatch` escape — the
same one step 3 uses" (`TSPEC:371`). That escape is a return value of `seamOps.gatherEvidence()`,
read inside `runAdvisorySeam` (`orchestrate-dev.js:3401-3410`) — the driver has to have been entered
for it to exist. Step 3's wave-budget escalation can use it, because a budget check is pure and can
be made from inside `gatherEvidence`.

The capture cannot, as the document currently orders it. §3.2 lists step 4 (`captureTreeSnapshot`)
*before* step 5 (`runAdvisorySeam(…)`), and §3.3's signature takes `snapshot` as a constructed
argument to `buildA6SeamOps({… snapshot …})` — so by the time `gatherEvidence` could return an
escape, the capture has already succeeded or failed outside the driver. §3.5 inherits the confusion
in a single sentence: "The **caller** does not simply decline to dispatch … it escalates through the
`__preDispatch` escape", which attributes a driver-internal mechanism to the call site.

I am not prescribing the fix — moving the capture inside `gatherEvidence` and making `snapshot` a
lazily-filled ref is one shape, and there may be better. The product concern is narrower: F-02 was a
P0 gap against AC-6.1 and AC-6.2, and its resolution is currently asserted through a mechanism the
same document places out of reach. §5.2's six positive assertions on one fixture mean Phase I will
discover this rather than ship past it, which is why this is Medium and not High — but discovering
it in Phase I is more expensive than reconciling three paragraphs now.

**To resolve:** state where the capture actually runs relative to `runAdvisorySeam`, and reconcile
§3.2 step 4, §3.3's `snapshot` argument and §3.5's "the caller escalates" sentence to that one
answer. If the capture stays outside the driver, name what writes the record and escalation entry
there instead, since the escape will not be available.

### F-03 — the halt fields on the capture-failure path are unstated (Low, delta, local)

§4.5's halt-fields row now reads "Every A6-touched halt: a non-resolved wave (AC-6.3), a
`snapshot-unavailable` escalation (§2.5), **and** a post-gate un-skip halt" (`TSPEC:708`), carrying
`{rootCause, diagnosis, repairApplied, repairPaths}`. On the capture-failure path no agent was
dispatched, so there is no diagnosis, no repair and no paths, and `rootCause` is `unclassified` by
§2.5's own table. The un-skip row directly below it is admirably precise about its values —
`undefined` when A6 did not fire, `{…, repairApplied: true, repairPaths}` when it resolved — so the
silence on the capture-failure values reads as an omission rather than a deliberate deferral.

AC-6.3 asks the halt to carry the diagnosis; a halt whose `diagnosis` field is empty satisfies the
letter but tells the operator nothing, and the operator on this path is the least equipped one —
red wave, seam engaged, nothing diagnosed. Worth one row.

**To resolve:** add the value column for the `snapshot-unavailable` case, as the un-skip row already
has, and say what an operator reads in the `diagnosis` slot when no diagnosis exists.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6 OQ-7 is marked "**yes, upstream**" blocking, and the erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1 has not landed — the FSPEC is still v1.3 and the REQ v1.8. I have re-emitted the erratum lines in this review so the orchestrator routes them. If the round closes without them landing, is the TSPEC's transcription-on-return promise (§2.5) enough for PLAN authoring, or should Phase T hold? §6 says PLAN is unblocked and I agree, but the two allocated test cases (§5.2's round-trip, §5.5's ignored-path-only repair) cannot be written until the answer arrives. |
| Q-02 | §3.4 documents `pathsCollide`'s trailing-slash precondition and gives it a test, but explicitly declines to fix it because widening the predicate would change wave packing. That leaves a live operator trap outside this feature: a manifest row spelled `pdlc/workflows/dist` is silently narrower than its author meant, everywhere in Phase I. Should this be a `Cross-Feature` item promoted to `docs/_constraints/DOMAIN-CONSTRAINTS.md` — "directory rows in a PLAN file-ownership manifest are written with a trailing slash" — or better, a Phase P lint, so the next feature's PLAN author is not relying on having read this TSPEC? |
| Q-03 | §3.3's `apply` refuses a repair that writes only `.gitignore`d paths as `post-action-verification-failed`. That reason is a *refusal* in the AC-3.4 sense, and it is the one place where OQ-7's unresolved boundary produces an operator-visible verdict today. If upstream widens BR-9's oracle, does this row's disposition change, or does the refusal stand on its own merits? §3.3 says the row is unchanged either way; I read that as correct but would like it stated as a ruling rather than an aside. |

## Positive Observations

- **§5.6 is the strongest thing in the revision, and it is stronger than F-03 asked for.** I asked
  for the three P0 obligations to be given a home. §5.6 instead maps *every* FSPEC acceptance test
  to a test file and a one-line oracle, and I checked it mechanically: the 45 AT identifiers in the
  FSPEC and the 45 in §5.6 are the same set, no containment, no drift. That converts the PLAN's
  red-test column from an authoring judgement into a transcription, which is exactly the property
  §5.6 claims for it.
- **§5.5 states shapes rather than filenames, and obeys its own rule.** Every prohibition row
  carries a negative *and* a paired positive on the same run, and the rule is named `AC-4.5` in the
  suite so it is greppable rather than tacit. The `(g)` row's positive — "the gate command actually
  re-run is the pre-proposal one, asserted from the `invocations` array" — is the kind of assertion
  that catches the failure mode that matters, not the one that is easy to write.
- **AC-4.1's conjunct (iii) came back as a real mutation fixture, not a checkbox.** "Fails only if
  the implementation lets an advisory verdict substitute for a gate result, which is BR-7's whole
  content", plus the requirement that it be named in the PLAN as its own task so it cannot be
  quietly folded into (i) or (ii). That is the drop-proofing the finding was about.
- **F-04 was answered by qualifying a claim rather than defending it.** §3.3 now says the blanket
  BR-16 claim "held for the vocabulary and the citation rule and did not hold for precedence; it is
  corrected rather than defended", then states the residual against AC-6.4 in three bullets
  separating what is at risk from what is not. A misclass costs a wrong label, never a wider blast
  radius — that is the sentence a product reader needed and did not have.
- **TE F-04's real-repo snapshot suite is a product win as well as a testing one.** §5.2 rejects the
  injected `_git` double for the round-trip cases because "a fake transport can only replay the
  fixture it was told to". BR-9's restoration promise is the one A6 makes to an operator whose tree
  is at stake; proving it against a real repository is what makes the promise mean anything.
- **§4.5's un-skip halt contract names what today's code cannot do before proposing the change.**
  "The shipped un-skip halt cannot say it: it is `throw haltError(formatUnskipViolations(…))`, a
  one-argument call with no `fields` object" — verified at `orchestrate-dev.js:14386` — and the
  `undefined`-when-A6-did-not-fire row keeps the disabled tier's byte-identity claim honest.
- **§5.4 replaced a reassuring coverage sentence with an unflattering accurate one.** "Coverage is
  not an oracle here — it is a backstop, and A6 could pass both floors whether or not its own
  branches are exercised", followed by an explicit branch inventory to carry the weight the floor
  does not. I checked the two-stage description against `pdlc/workflows/package.json` and it is
  exact. Documents rarely get less flattering under revision; this one did.
- **§6 grew four rows and answered a question rather than deferring it.** OQ-5 through OQ-8 close
  F-06 and F-07, and Q-03 came back as a ruling — `waveBudgetPerRun: 0` is a documented operator
  affordance, observably distinct from `advisory.enabled: false` via AT-01-4 vs AT-01-6 — which is
  better than the DECISIONS round I offered.

## Recommendation

**Needs revision** — one High finding (F-01).

All three of my prior High findings are resolved, and two of them (F-02's disposition table, F-03's
§5.5/§5.6) are resolved more thoroughly than I asked. The single blocker is a defect introduced by
the F-02 fix itself, and it is a small edit:

1. **F-01** — drop `snapshot-unavailable` from the reason position. Report the capture-failure
   escalation with no refusal reason per REQ AC-3.4's diagnosis-only clause and FSPEC BR-15, keep
   the string as diagnostic prose in the record entry and escalation sentence, and update
   `TSPEC:244`, `TSPEC:252` and §5.2's fixture at `TSPEC:549` together so §5.6's AT-03-7 row and
   §2.2's "discharged by not writing code" claim stay true.

F-02 and F-03 should be answered in the same revision — F-02 is three paragraphs reconciled to one
ordering answer, F-03 is one table row — but neither gates the phase.

The document under review is materially better than v1.0. The revision did not paper over the three
Highs; it moved a boundary out of this document and into upstream where it belonged, gave a silent
failure path a named disposition with six positive assertions, and turned a test section that named
seven files into one that maps every acceptance test in the FSPEC to a home. Every claim about
shipped code I checked this round held exactly as written, including the ones the author used to
argue against their own first draft. F-01 is the cost of doing the F-02 work carefully in a hurry:
the right closed set was defended, but it was the wrong closed set.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
