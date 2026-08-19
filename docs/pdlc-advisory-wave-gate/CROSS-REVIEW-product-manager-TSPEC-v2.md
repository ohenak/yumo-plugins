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

## Positive Observations

## Recommendation

## Verdict
