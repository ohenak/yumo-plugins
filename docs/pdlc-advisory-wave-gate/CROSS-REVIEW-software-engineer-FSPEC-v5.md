# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.3, unchanged bytes)
**Date:** 2026-08-19
**Iteration:** 5
**Scope:** Upstream-cascade confirmation only. FSPEC bytes unchanged since the v4 approval
(`REVIEWED-COMMIT: 7b8b314c`). Upstream REQ moved: approved against `6565080a`
(`sha256:32ba7d94…`, REQ v1.6), now at `2e262298` (`sha256:a10396e8…`, REQ v1.8), two erratum
rounds. One question answered: does the FSPEC still hold as a faithful compression of the REQ as
it now stands? Reviewed on `feat-pdlc-advisory-wave-gate`.

## Overview

What the upstream edit changed, read at HEAD rather than from the item list:

| REQ clause | v1.6 (approved against) | v1.8 (HEAD) |
|---|---|---|
| AC-1.5 | population unscoped — "exactly one notice per run" | population is runs that **reach Phase I and evaluate wave mode**, the no-manifest legacy run explicitly inside it; earlier halts and ledger skips outside |
| AC-2.4 | seam budget per **invocation**, "per invocation, dispatch to verdict" | seam budget per **attempt**, deadline restarting each attempt |
| NFR-4 | budget on an *invocation*, with a gate-command **carve-out** and an `attemptBudget`-starvation rationale | budget on an **attempt**; carve-out deleted — exclusion is structural, "no subtraction is performed and no carve-out is needed"; worst case named as `attemptBudget` × the value |
| AC-4.1 | one unbounded negative — "no path by which an advisory verdict substitutes for a gate result" | **applies a repair** and **resolves** held apart; observable is three positive conjuncts, **each on a run of its own, so three fixtures**, (iii) a mutation fixture that drops the re-gate |
| §5 config table | `seamBudgetMinutes` = "working time per wave invocation" | per **attempt**; and `attemptBudget` per **A6 invocation**, "one invocation being A6 engaged on one red wave" |
| R-3 | bound reaches "within an invocation", drift "across invocations" | within a single **run**; drift across **runs** |
| BL-06 | two enumerations | additionally the **mutual exclusivity** of BL-03's notice with BL-04's |

Two of these — NFR-4's false carve-out rationale and §5's wave-scoped `seamBudgetMinutes` gloss —
are the errata this reviewer re-emitted in v2, v3 and v4. They are resolved at HEAD, and resolved
at the root rather than papered over. The cost is that the FSPEC's compression of them was written
to be *correct against a wrong upstream*: BR-11 carried the right window while attributing it to a
REQ clause that said something else, and inherited a carve-out that no longer exists. Now that REQ
has moved to the FSPEC's position, the FSPEC's text describing the disagreement is itself stale.

The behavioural substance of the FSPEC survives the edit — no flow, rule or edge case is
contradicted at the level of what the system does. What does not survive is (a) the AC-4.1 oracle,
which upstream rewrote into a shape the FSPEC does not carry, and (b) the run / A6 invocation /
attempt vocabulary, which the erratum round deliberately separated (F-25) and which the FSPEC
still fuses under one word, with an explicit citation to the upstream clause that now says the
opposite.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-4.1's observable was rewritten upstream and the FSPEC still carries the pre-erratum shape.** REQ HEAD replaced the unbounded negative with three positive conjuncts, *each on a run of its own, so three fixtures*: (i) applies + green re-gate ⇒ wave resolved, proceeds, and that green invocation is in the run's gate-invocation sequence; (ii) applies + red re-gate ⇒ wave halts, tree restored, halt is the wave's own gate halt; (iii) applies and **no gate invocation follows** ⇒ wave halts — "conjunct (iii) carries the prohibition … its fixture mutates the shipped control flow to drop the re-gate and asserts the halt survives" (`REQ:382-395`). The FSPEC's only AC-4.1 oracle, AT-04-1, pins three assertions on **one** run, and that run is conjunct (ii)'s red re-gate only: disposition `escalated`, halt reason equals AT-05-3's literal, resolved-count `0` (`FSPEC:389`). Conjunct (i) has no carrier that asserts resolution (AT-04-2 asserts the invocation *sequence* for AC-4.4, never the terminal disposition), and conjunct (iii) — the one upstream says carries the prohibition — has no carrier at all: no fixture in §6.4 mutates control flow to drop the re-gate. Worse, AT-04-1's own rationale argues *against* it — "No existential negative — 'no path exists' is not assertable" — which was a correct reading of REQ v1.6 and is a contradiction of REQ v1.8, which makes exactly that claim assertable by mutation. **Fix:** split AT-04-1 into the three fixtures REQ now names, keep the (ii) assertions where they are, add the green-resolution run and the drop-the-re-gate mutation run, and delete the not-assertable rationale sentence. | §6.4 AT-04-1, BR-7; REQ AC-4.1 |
| F-02 | High | Local | **BR-11 defines "invocation" as one A6 dispatch and attributes that definition to REQ AC-2.4, which at HEAD defines the opposite.** FSPEC: "more than `advisory.seamBudgetMinutes` of working time on a single invocation, an **invocation** being one A6 dispatch measured dispatch→verdict, **as REQ AC-2.4 defines it**" (`FSPEC:211-215`). REQ AC-2.4 now reads "more than `advisory.seamBudgetMinutes` on a single **attempt** (per attempt, dispatch to verdict, the deadline restarting each attempt)" (`REQ:321-324`), and §5 fixes the other term against it: `attemptBudget` is "remediation attempts per A6 invocation, **one invocation being A6 engaged on one red wave**" (`REQ:223`). The erratum round separated *run*, *A6 invocation* and *attempt* on purpose (F-25, `REQ:24`); the FSPEC re-fuses two of them and cites the separating clause as its authority. The measured behaviour the FSPEC describes is still right — per-cycle window, re-armed each cycle — so this is a vocabulary and attribution defect, not a behavioural one; but it is load-bearing rather than cosmetic. The word appears 15 times in the FSPEC, including AT-04-3's "an A6 invocation of any outcome" (`FSPEC:399`) and E-25's "exceeded on one invocation" (`FSPEC:290`), all of which now read, under upstream's vocabulary, as scoped to the whole engagement on a wave. A TSPEC author who inherits the FSPEC's definition carries the fused term downstream and undoes the erratum. **Fix:** restate BR-11's second budget as per **attempt**, reserve "invocation" for A6-engaged-on-one-wave throughout, re-point the AC-2.4 citation, and carry REQ's worst case (`attemptBudget` × `seamBudgetMinutes` over one invocation) which the FSPEC currently states only as "re-armed for each cycle". | §4 BR-11, E-25, AT-02-7, AT-04-3; REQ AC-2.4, §5 |
| F-03 | Medium | Local | **BR-11 inherits a carve-out NFR-4 no longer has, and the changelog still reports the upstream defect as open.** BR-11: "NFR-4's gate-command carve-out is therefore inherited and structural, not a subtraction A6 performs" (`FSPEC:216`). NFR-4 at HEAD deleted the carve-out outright — "Gate-command run time falls outside the window **structurally** … so no subtraction is performed and **no carve-out is needed**" (`REQ:490-492`) — i.e. upstream adopted the FSPEC's structural reading and removed the noun. The FSPEC now inherits an artifact that does not exist. Two changelog lines compound it: v1.2 records "NFR-4's carve-out inherited" and "REQ NFR-4's rationale raised as erratum", and v1.3 records "REQ errata re-emitted" (`FSPEC:16,18`) — both errata are resolved at HEAD, so a reader of the FSPEC alone is told an upstream disagreement is outstanding when it is settled. **Fix:** restate BR-11's third sentence as the structural exclusion in its own right with no reference to a carve-out, and add a v1.4 changelog line recording that both re-emitted REQ errata landed in REQ v1.7/v1.8. | §4 BR-11, changelog `FSPEC:16,18`; REQ NFR-4 |
| F-04 | Medium | Local | **AT-01-5's population is now wider than both REQ HEAD and the FSPEC's own E-04.** AT-01-5 closes "Population: runs that reach Phase I" (`FSPEC:328`). REQ AC-1.5 now scopes it to "a run **that reaches Phase I and evaluates wave mode** — executing waves or taking the no-manifest legacy path alike", and states that "a run halting before Phase I, **or skipping it on a recorded wave ledger**, never evaluates wave mode and is outside the population, not a zero-count violation of it" (`REQ:274-281`). E-04 already carries the correct exclusion (`FSPEC:252`), so the AT contradicts its own edge case as well as upstream: as written, a ledger-skip run that reaches Phase I is in AT-01-5's population and must carry exactly one notice, which is the failure mode REQ explicitly rules out. This is a one-line repair, but it is the sentence the fixture author will read. **Fix:** restate the population as REQ's phrase and name the no-manifest legacy run as an in-population case, since that is the arm where BL-03's carrier alone discharges the requirement. | §6.1 AT-01-5, E-04; REQ AC-1.5 |
| F-05 | Medium | Local | **BL-06 gained a third enumeration and A-1 still names two.** REQ HEAD's BL-06 requires the two enumerations "**and the mutual exclusivity of that notice with BL-04's**" (`REQ:581`), measured before FSPEC authoring. A-1 still reads "the two enumerations BL-06 requires" and lists only the set-equality surfaces and the BL-03 re-measurement (`FSPEC:496`). Meanwhile E-04 asserts the exclusivity as established fact — "mutually exclusive, the no-manifest carrier on the legacy-path branch and the script-gate carrier on that branch's other arm" (`FSPEC:252`) — and AC-1.5's cardinality claim rests on it. So the FSPEC consumes as given precisely the property upstream now requires be measured, and its assumptions section does not book the obligation. **Fix:** widen A-1 to three items, matching BL-06's current wording. | §7.3 A-1, E-04; REQ BL-06 |
| F-06 | Low | Local | **A-4 restates R-3 in the vocabulary the erratum retired.** A-4: "`advisory.waveBudgetPerRun` bounds drift *within* an invocation only. Drift across invocations is bounded by the operator arriving between them" (`FSPEC:503-505`). R-3 at HEAD says "bounds it at one resolved wave per **run** … a per-run knob bounds drift within a single **run** only, and drift across **runs**" (`REQ:513-516`) — the same F-25 term separation as F-02, and here the substitution changes the claim's reach, since a run may contain several A6 invocations. The FSPEC's own §3.2 step and BR-11 already say "in one run" (`FSPEC:91`, `:219`), so A-4 is the only holdout. **Fix:** substitute *run* for *invocation* in both sentences. | §7.3 A-4; REQ R-3 |

## Confirmation Findings (tagged)

Machine-readable form of the findings above. All six are `delta` — none was present against the
REQ this FSPEC was approved over — and all six are `local`, each sitting on a REQ clause the
erratum rounds edited.

FINDING: High | delta | local | §6.4 AT-04-1 | AC-4.1's observable is now three positive conjuncts on three separate runs, including a mutation fixture that drops the re-gate and asserts the halt survives; AT-04-1 still asserts three conjuncts on one red-re-gate run and argues the prohibition is not assertable.
FINDING: High | delta | local | §4 BR-11 | BR-11 defines "invocation" as one A6 dispatch "as REQ AC-2.4 defines it"; AC-2.4 now puts the window on the attempt and §5 defines an A6 invocation as A6 engaged on one red wave, so the FSPEC re-fuses terms the erratum separated and cites the separating clause as authority.
FINDING: Medium | delta | local | §4 BR-11 | BR-11 inherits "NFR-4's gate-command carve-out"; NFR-4 deleted the carve-out and states no subtraction is performed, and the v1.2/v1.3 changelog still reports both re-emitted REQ errata as open when they landed in REQ v1.7/v1.8.
FINDING: Medium | delta | local | §6.1 AT-01-5 | AT-01-5's "Population: runs that reach Phase I" is wider than AC-1.5's "reaches Phase I and evaluates wave mode" and than the FSPEC's own E-04, admitting ledger-skip runs REQ places outside the population.
FINDING: Medium | delta | local | §7.3 A-1 | BL-06 now requires a third enumeration, the mutual exclusivity of BL-03's notice with BL-04's; A-1 still books two, while E-04 consumes that exclusivity as established fact.
FINDING: Low | delta | local | §7.3 A-4 | A-4 states R-3's bound as "within an invocation"; R-3 now says within a single run, drift across runs — the retired vocabulary changes the claim's reach.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3/v4, still open and still non-gating, and REQ HEAD has now answered half of it: NFR-4 names the worst case for one A6 invocation as `attemptBudget` × `seamBudgetMinutes`, and says explicitly that "no cap over the invocation as a whole is required here" (`REQ:487-489`). That is the operator decision the question was asking for. Should BR-11 carry the same sentence, so the FSPEC reader learns the total is deliberately unbounded from the FSPEC rather than only from the REQ? |
| Q-02 | Conjunct (iii)'s fixture mutates shipped control flow to drop the re-gate (`REQ:392-395`). Is the intended mutation seam the wave-gate call site in `pdlc/workflows/orchestrate-dev.js`, exercised through the injected command transport the rest of §6 already uses, or a separate harness? The FSPEC is the right place to say which, since it is the document that names how the ATs get their doubles, and F-01's repair needs an answer to be writable. |

## Positive Observations

- **Most of the compression survived an upstream edit that touched six clauses.** Flows §3.2, the
  refusal catalogue, restoration triggers BR-9/BR-10, the writer-identity invariant BR-8 and the
  ordered-sequence oracle AT-04-2 are all untouched in substance by REQ v1.7/v1.8. The document
  was written close enough to the requirement's altitude that a two-round erratum wave landed as
  wording and oracle-shape work, not as a rewrite.
- **The two re-emitted errata were resolved at the root, and the FSPEC's reading was vindicated.**
  BR-11 argued from v1.1 that the gate-command exclusion is structural rather than a subtraction,
  and that the window sits on one dispatch. REQ v1.8 now says exactly that. Declining to absorb a
  false upstream rationale into a derived document, and re-emitting it for three rounds instead,
  was the right call — the fix landed where it belonged.
- **E-04 already carries the population exclusion AC-1.5 has now adopted.** The FSPEC said that a
  run halting before Phase I, or skipping it on a recorded wave ledger, is outside the criterion
  (`FSPEC:252`) before REQ said so. F-04 is a stale sentence in one AT, not a gap in the
  document's understanding.
- **`waveBudgetPerRun` was already run-scoped everywhere it counts.** Step 3b and BR-11 both say
  "in one run" (`FSPEC:91`, `:219`), so R-3's re-wording leaves only the A-4 prose behind.

## Recommendation

**Needs revision**

Two High findings, so the FSPEC does not hold as-is against REQ at HEAD.

The behavioural core is intact: nothing the FSPEC says the system *does* is contradicted by REQ
v1.8. Both Highs are about the FSPEC no longer being a faithful compression of upstream text it
leans on. F-01 is the substantive one — AC-4.1's observable was rewritten from an unbounded
negative into three conjuncts on three runs, and the conjunct upstream says carries the
prohibition (applies a repair, no gate invocation follows, wave halts) has no oracle anywhere in
§6.4, while AT-04-1's rationale argues that such an assertion cannot be written. That is not a
citation drift; it is a coverage hole that reaches PROPERTIES and the implementation. F-02 is the
vocabulary one — BR-11 defines "invocation" as one dispatch and attributes the definition to the
very clause the erratum round rewrote to hold *run*, *A6 invocation* and *attempt* apart, so the
FSPEC would propagate the fused term into TSPEC and undo F-25.

Concretely, to reach Approved: split AT-04-1 into REQ's three fixtures and add the drop-the-re-gate
mutation run (F-01); restate BR-11's seam budget as per-attempt, reserve "invocation" for A6
engaged on one wave, re-point the AC-2.4 citation and carry the `attemptBudget` × window worst
case (F-02); drop the inherited carve-out noun and record the resolved errata in a v1.4 changelog
line (F-03); narrow AT-01-5's population to AC-1.5's phrase (F-04); widen A-1 to BL-06's three
enumerations (F-05); and substitute *run* for *invocation* in A-4 (F-06). No settled decision is
re-opened by any of these.

## Verdict

_pending_
