# Cross-Review: software-engineer — TSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/TSPEC-pdlc-rcv-budget-stop.md` v1.0
**Scope:** TSPEC-pdlc-rcv-budget-stop.md v1.0
**Date:** 2026-08-02
**Iteration:** 1
**Verification baseline:** working tree at `feat-pdlc-rcv-budget-stop` HEAD (`38c87f1`); every
line citation below was resolved against `pdlc/workflows/orchestrate-dev.js` at that tree, and
cross-checked against the TSPEC's declared citation baseline `9486c81`.
**Stopping rule applied:** TSPEC §11.4. Oracle-design, fixture-construction and
property-coverage gaps are routed to PROPERTIES/PLAN and are **not** filed as blocking.

## Summary

This is a strong TSPEC. It is at the right altitude, it names its owning symbol for every rule, it
cites the source it is going to edit, and the two hardest design calls — D-1 (no `lib/` module,
forced by `build-runtime.mjs`'s three named inlined sources) and D-2 (a third seam answer,
`unevaluable`, because neither `_readFile` nor `_checkFile` can express it) — are correct and were
verified against the code. §8.1's export mechanism is feasible exactly as claimed.

The findings are concentrated in **one place**: the TSPEC changes the meaning of two shipped
quantities — `windowEnd`'s parameter (start → origin) and `WindowState.startIndex`
(`max(present)+1` → `max(D, W)`) — and §10.3's *Files touched* does not enumerate every shipped
consumer of those two quantities. Three consumers are unaccounted for, and each produces a
concrete wrong answer on a named input:

| Unaccounted consumer | Consequence |
|---|---|
| `checkConverged`'s window render (`:1790`–`:1794`) | on the zero-round halt it renders `rounds {max(D,W)}..{W+B−1}` — a **backwards** range — beside a `HALT-REASON:` that renders `rounds {W}..{W+B−1}`, so B-HALT-7's *identical bytes in both places* fails |
| `tier1ApprovalRecord`'s `candidate = startIndex - 1` (`:2948`) | the approval search is silently redirected to a round that cannot exist whenever `W > D` |
| `reviewLoop`'s / `checkConverged`'s `windowEnd(startIndex)` defaults (`:1850`, `:1792`) | compute the **relative** window AC-1.1 abolishes; unreached in production, reached by the suite |

Separately, §3.3 and §6.1 disagree about **where the clearance gate runs** relative to shipped
`phaseGate`'s steps 3–4 and step G, and the shipped call order makes §6.3's footnote-`*` premise
false. That is a module-map defect, so it blocks under §11.4.

None of the blocking findings contests the *design*: the region read model, the write model, the
one-update rule, the `_statFile` discrimination and the refusal shape are all sound. What they
contest is the completeness of the change's blast radius over two re-pointed contracts. Every fix
below is local and additive.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Blocking | Local | `origin` is never threaded into `reviewLoop` or `checkConverged`, but §6.6(2) requires the S-4 render there; the shipped phase-row render then disagrees with `HALT-REASON:` | §4.5, §6.6(2), §7.2 |
| F-02 | Blocking | Local | `WindowState.startIndex`'s meaning change silently redirects `tier1ApprovalRecord`'s `candidate = startIndex - 1`; the consumer is unenumerated | §4.2, §10.3 |
| F-03 | Blocking | Local | §3.3 and §6.1 place the clearance gate on opposite sides of `phaseGate`'s steps 3–4 and step G; the shipped call order falsifies §6.3's footnote-`*` premise | §3.3, §6.1, §6.3 |
| F-04 | Major | Local | §6.4 step 3's confirmation dereferences `locateIterationsHeading(back).text` on the exact input F-9 exists to catch | §6.4 step 3, §7.1 F-9 |
| F-05 | Major | Local | Re-pointing `windowEnd`'s parameter is claimed to be a one-line, repo-wide change; two shipped call sites pass a *start* and are unenumerated | §2.4, §6.1 note 3 |
| F-06 | Major | Local | §6.1 step 1 names `refreshReviewState`; the shipped `phaseWindow` calls `resolveReviewState`, and going direct drops the `_probeReviewState` seam | §6.1 step 1, §5.6 |
| F-07 | Major | Local | `_probePostmortem` appears in `resolveClearance`'s signature but is absent from §5.6's gathered seam table | §5.6, §6.3 |
| F-08 | Major | Local | §8.2's closed enumeration omits two `MAX_REVIEW_ROUNDS` occurrences at HEAD, and its five classes have no home for them; §8.3's scanner reds the clean repo | §8.2, §8.3 |
| F-09 | Minor | Local | Declared citation baseline `9486c81` does not resolve; the citations resolve against HEAD, and five in the 4300–5300 range are stale even there | §1.2, §2.7, §7.2 |
| F-10 | Minor | Local | `runDodPhase` does not exist in the repo; the symbol at the cited line is `dodVerifyLoop` | §8.2 |
| F-11 | Minor | Local | §6.2 step 4 composes `scanLines` over a `topLevelSections` **body**, which is a raw line array, not text; the composition is unstated | §6.2 |

---

### F-01 — Blocking — `origin` is not threaded to the two symbols that render the window

**Where.** §6.6(2) says *"the halt branch composes `budget-exhausted: rounds ${origin}..${endIndex}`"*
inside `reviewLoop`. §4.5 lists the two fields `LoopResult` gains — `roundsRun` and `refusal` —
and §5's seam table adds `_writeFile`, `_statFile`, `_validateRegion`. **`origin` is on neither
list, and `reviewLoop`'s parameter list is never said to grow.** `reviewLoop`
(`orchestrate-dev.js:1841`–`:1865`) destructures `iteration`, `startIndex`, `endIndex` and the
seams; there is no origin in scope, and none is added.

**Why it is more than a threading omission.** `checkConverged` (`:1756`) already renders the window
for the operator-visible phase row, from `startIndex`:

```js
const first = startIndex === undefined ? 1 : startIndex;          // :1791
const last  = endIndex === undefined ? windowEnd(first) : endIndex; // :1792
const window = `rounds ${first}..${last}`;                          // :1793
```

Post-change `startIndex = max(D, W)` and `endIndex = W + BUDGET − 1`. On the zero-round budget
halt — B-WIN-2, the case this feature exists to produce — the entry condition is precisely
`max(D, W) > W + BUDGET − 1`, so `first > last` **by construction**, and the phase row reads
`Non-convergence across rounds 7..5`. The `HALT-REASON:` value written on the same halt reads
`budget-exhausted: rounds 3..5`. §6.6(2) and B-HALT-7 require the operator to read *the identical
bytes in both places*; here the two renders are different, and one of them is a backwards range.
All seven production `checkConverged` call sites (`:4657`, `:4695`, `:4738`, `:4791`, `:4832`,
`:4870`, `:4993`) pass `{x}Window.startIndex, {x}Window.endIndex`, so this is reached on every
document-typed halt, not just a default path.

**Recommended fix.** Add `origin` explicitly to both contracts and state it in §4.5 and §5.6:

1. `reviewLoop({… startIndex, endIndex, origin = startIndex, …})` — the default reproduces
   today's value for Phase CR and for existing suites;
2. carry `origin` on `LoopResult` beside `roundsRun`, and add an eighth positional (or, better,
   convert to an options object) `origin` argument to `checkConverged`, replacing `:1791`'s
   `first` with the origin;
3. state in §6.6 that **one** render function produces both the phase-row window and the
   `HALT-REASON:` value, so B-HALT-7 is true by construction rather than by two sites agreeing.
   `haltReasonValue` (§3.1) is the natural home.

Note that deriving the origin inside `reviewLoop` as `endIndex − MAX_REVIEW_ROUNDS + 1` is **not**
an acceptable substitute: it re-expresses the width inside `reviewLoop`, which is exactly the
recomputation `RLH-LOOP-03b` (`reviewLoop.test.js:964`) exists to red — that test asserts the
single arithmetic occurrence lies *outside the source spans of `reviewLoop` and `checkConverged`*.

---

### F-02 — Blocking — the `startIndex` meaning change redirects the approval search

**Where.** §4.2 declares, correctly and deliberately, `startIndex` **[MEANING CHANGED]** to
`max(derivedStart, origin)`. §10.3's *Files touched* names `phaseWindow`, `reviewLoop`,
`checkConverged` and `buildFinalReport` as the consumers that change. It does not name
`tier1ApprovalRecord`, and no section audits it.

**The unaccounted consumer.** `phaseGate` step 3 (`:4419`–`:4424`) passes `window.startIndex`
straight into the approval search, whose first line is:

```js
function tier1ApprovalRecord({ reviewers, startIndex, reviewFiles }) {
  const candidate = startIndex - 1;                    // :2948
```

`candidate` is meant to be *the highest existing round of this document type* — i.e. `D − 1`. It
depends on the branch listing and on nothing the clearance gate does. Under the new meaning, on
any entry where the operator has granted a reset that moves `W` above `D` (`D = 4`, `W = 6` ⇒
`startIndex = 6`), `candidate` becomes `5` — a round that has no cross-review file, by the very
definition of `D`. `reviewFiles.get("{role}:5")` is `null` for every role, `tier1Empty` is set, and
the search falls through to tier 2 (`:2980`+) for a candidate round that never existed. The
recorded tier-1 approval at round 3 is never consulted.

The direction happens to be fail-open-into-running rather than fail-open-into-skipping, so this is
not a correctness catastrophe — but it is a **silent, unstated** behaviour change to the approval
mechanism, on a path the feature makes reachable for the first time, and it is precisely the class
of blast-radius omission DC-08's enumeration check exists for.

**Recommended fix.** State in §4.2 (and add a row to §10.3) that the approval search consumes
`derivedStart`, not `startIndex`: change `phaseGate` step 3's argument to
`startIndex: window.derivedStart`. That is a one-word edit and it makes `derivedStart`'s reason
for existing — §4.2's *"two distinguishable quantities rather than one overwritten one"* —
carry its second consumer as well as its first. Then sweep the remaining readers of
`window.startIndex` in `main` and record the sweep's result in §10.3.

---

### F-03 — Blocking — §3.3 and §6.1 disagree about where the clearance gate runs

**The contradiction.** §3.3's entry-point table says `phaseGate` owns *"steps 1–4 (shipped), step G
(shipped), **then** the region read, the clearance gate and the window arithmetic"*. §6.1 puts the
region read and the clearance gate at **steps 3 and 4 of `phaseWindow`** — and shipped `phaseGate`
calls `phaseWindow(docType)` as its **step 2** (`:4415`), *before* the approval search (steps 3–4,
`:4419`–`:4487`) and *before* step G (`:4493`). The two sections describe opposite orderings, and
only §6.1's is implementable without restructuring `phaseGate`, because step 3 consumes
`window.startIndex`.

**What §6.1's ordering falsifies.** §6.3's footnote `*` reads: *"Step 2 never causes B-CLR-5's
refusal — that is step G's, **which already ran and threw**"*, and step 2's justification is
*"`phaseGate` reaches this code only on `"none"` or `"resolved"`"*. Both statements are false under
§6.1: step G has not run when `phaseWindow` executes. The defensive re-check in `resolveClearance`
step 2 keeps the *outcome* fail-closed, which is good design — but the stated premise is wrong, and
a future reader who trusts it will delete the re-check as redundant. §6.3 explicitly says the
conjunct is written *"so a future reordering of `phaseGate` cannot silently open the gate"*; here
the reordering has already happened and the TSPEC does not know it.

**The second consequence.** With the gate at step 2, the answering line is appended **before** step
4's staleness check, so an entry with a FRESH recorded approval writes `WINDOW-START: N`, moves
`W`, and then returns `{skip: true}` (`:4477`) having dispatched nothing. FSPEC §6.3 accepts the
adjacent case (*"an entry that records it and then dies before dispatching … the next entry runs
them — a bounded loss of nothing"*), so this may well be acceptable — but it is a **new** reachable
state that the TSPEC neither names nor routes, and §6.3's step-6 note (*"NOTHING IS DISPATCHED
BEFORE THIS RETURNS"*) reads as though the only thing downstream is a dispatch.

**Recommended fix.** Pick one ordering and make both sections say it. Concretely:

1. Correct §3.3's table to the shipped order: `phaseWindow` (region read, clearance, window
   arithmetic) is **step 2**, and steps 3–4 and step G follow it;
2. rewrite §6.3's footnote `*` to say what is actually true — step G has *not* run, the marker
   conjunct is therefore **load-bearing rather than defensive**, and `resolvePostmortem` is
   consequently evaluated twice per entry (once here, once at step G); state whether that second
   probe is acceptable or whether the result should be threaded;
3. add a row to §7.1's matrix for *clearance granted on an entry that then skips on a FRESH
   approval*, with its disposition (accept, citing FSPEC §6.3's recoverable direction, is a fine
   answer — but it must be written down).

Alternatively, split the gate out of `phaseWindow` into `phaseGate` between step G and the return,
and have `phaseWindow` return `{derivedStart, present, skipped, reviewFiles}` only, with the
admission arithmetic evaluated in `phaseGate`. That matches §3.3 as written and resolves F-02 for
free, at the cost of one more moving part in `phaseGate`.

---

### F-04 — Major — §6.4 step 3's confirmation faults on the input it exists to catch

**Where.** §6.4 step 3:

```
back ← await _readFile(path)
CONFIRM: locateIterationsHeading(back).text === renderIterationsHeading(...)
```

§6.5 defines `locateIterationsHeading(text) → {index, text}|null`. Under the `write-noop` fault
mode §9.2 introduces — *"`_writeFile` returns `"ok"` and changes nothing"*, the double that exists
*"[because] without a write that lies, an equality read-back always passes"* — `back` is the
pre-write text. If the pre-write text has no `Iterations` heading (the *no located heading* branch
of `applyIterationsSection`, which is the creating-halt case and the B-HALT-3 case),
`locateIterationsHeading(back)` returns `null` and `.text` throws a `TypeError`. The same happens
when the read-back itself fails and `back` is `null`.

**Why it matters beyond notation.** The thrown `TypeError` is not a `haltError`, so §7.2's four
load-bearing properties all fail on it: no `recordPhase(…, "❌", …)` row is written before it
escapes, no row B is pushed onto `reviewRows`, and the `{which}` discriminator never reaches the
operator. F-9's stated disposition — *"phase refusal, `which = "iterations section"`"* — is exactly
what does not happen. This is the disposition failing on its own named input.

**Recommended fix.** State the confirmation as a total predicate:

```
loc ← locateIterationsHeading(back)          // null when back is null or heading-absent
CONFIRM: loc !== null && loc.text === renderIterationsHeading(...)
on failure → REFUSE, which = "iterations section"
```

Add the same null guard to step 4's conjunct (a) — `parseResetRegion` is already total over `null`
per §6.2, so (a) is safe, but say so — and add a row to §7.1 for *read-back returns `null`*
distinct from *read-back disagrees*, since both must reach the same refusal.

---

### F-05 — Major — `windowEnd`'s re-pointing has two unenumerated call sites

**The claim under review.** §2.4: *"the width arithmetic is written **once**, in `windowEnd`"* —
true of the string `MAX_REVIEW_ROUNDS - 1`, verified: it occurs exactly once, at `:2493`. §6.1
note 3 then extends the claim: *"re-pointing it from 'start + width' to 'origin + width' changes
the window's meaning **repo-wide in one line**"*. That second claim is false. `windowEnd` has
**three** call sites, and the TSPEC accounts for one:

| Site | Call | Argument's meaning | Accounted for? |
|---|---|---|---|
| `:2475` | `const endIndex = windowEnd(startIndex);` inside `deriveRoundWindow` | becomes `origin` | **yes** — §6.1 note 3 |
| `:1850` | `endIndex = windowEnd(startIndex)` — `reviewLoop`'s parameter default | a **start** | no |
| `:1792` | `endIndex === undefined ? windowEnd(first) : endIndex` — `checkConverged` | a **start** | no |

After the re-point both unaccounted sites compute `start + BUDGET − 1` — the *relative* window
AC-1.1 abolishes — under a function whose parameter now means *origin*. All seven production
callers pass `endIndex` explicitly (verified at `:4652`, `:4690`, `:4733`, `:4786`, `:4827`,
`:4865`, `:4987`), so production is not reached; the **test suite** is, since
`reviewLoop.test.js` constructs `reviewLoop` from `iteration` alone. The failure mode is therefore
a green suite asserting the pre-change semantics — which is the same silent-green failure §8.1
rejects the duplicate-constant design for.

**Recommended fix.** Rename the parameter at the declaration (`function windowEnd(origin)`) so the
mismatch is visible at every call site, then decide each of the two explicitly in §6.1 note 3:
either default them to the origin (`origin = startIndex` on `reviewLoop`, threaded per F-01) or
state in a one-line comment at each site that the argument is a start and the site is dead in
production. Add both lines to §10.3's `orchestrate-dev.js` row.

---

### F-06 — Major — §6.1 step 1 names the wrong callee and drops a seam

§6.1 step 1 reads `state ← await refreshReviewState({feature, docType, _listFiles, _readFile})`.
The shipped `phaseWindow` (`:4367`–`:4377`) calls **`resolveReviewState`**:

```js
const state = await resolveReviewState({
  feature: featureName, docType,
  _listFiles: listFilesFn, _readFile: readFileFn,
  _probeReviewState: probeReviewStateFn,      // :4373
});
```

`resolveReviewState` (`:2830`–`:2849`) consults the `_probeReviewState` seam and only falls back to
`refreshReviewState` (`:2848`) when the probe does not answer. Implementing §6.1 as written
replaces the probe-aware call with the direct one and silently removes a shipped seam from the
phase-entry path.

**Recommended fix.** Change §6.1 step 1 to name `resolveReviewState` and list `_probeReviewState`
in its seam set; add `_probeReviewState` to §5.6's gathered table under *Reused unchanged*.

---

### F-07 — Major — `_probePostmortem` is used but not in the seam table

§6.3's signature is
`resolveClearance({phase, feature, region, D, _readFile, _writeFile, _probePostmortem, _validateRegion})`
and its step 2 calls `resolvePostmortem`, which takes `_probePostmortem` (`:4493`–`:4497` shows the
shipped call shape). §5.6 — *"The seam table, gathered"* — lists seven seams and `_probePostmortem`
is not among them, nor is it mentioned in §5.1's *Reused unchanged*.

§5.6 is the table a PLAN will read to decide what `wrapperSeams` must carry and what every test
double must supply, so an omission here propagates. It also matters for §5.4's stated rationale for
`NO_VALIDATOR`: `_probePostmortem` defaults to `NO_PROBE` (`:2778`) and is the precedent §5.4
cites, so leaving it off the table weakens the very analogy the section rests on.

**Recommended fix.** Add a `_probePostmortem` row to §5.6 (default `NO_PROBE`, not new, consumer
`resolveClearance` via `resolvePostmortem`), and confirm in §6.1 that `phaseWindow` has it in
scope — it does today, as `probePostmortemFn` in `main`'s closure.

---

### F-08 — Major — §8.2's closed enumeration is incomplete at its own baseline

§8.2 promises *"**Every** textual occurrence of the width, classified into AC-1.2's five classes"*,
and §8.3 rule 1 scans *"every occurrence of the identifier `MAX_REVIEW_ROUNDS` in any tracked
file"*. At HEAD the identifier occurs **seven** times in `orchestrate-dev.js`:

| Line | Kind | In §8.2's enumeration? |
|---|---|---|
| `:52` | the declaration | yes |
| `:1799`, `:1965`, `:2011`, `:2493` | code reads | yes |
| `:2406` | JSDoc prose — *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET"* | **no** |
| `:2485` | JSDoc prose — *"terms of `MAX_REVIEW_ROUNDS`"* | **no** |

Two consequences. First, `budgetWidthViolations(root)` as specified reports two
`unenumerated-site` violations against the **clean repo** on the day it lands, so
`__tests__/budgetSites.test.js` is red before any mutation. Second — and this is the design point
rather than the bookkeeping one — §8.2's five classes have **no home** for a source-comment
occurrence: it is not *the declaration*, not *read from it* (it is not evaluated), not a
*generated copy*, not *prose* (that class is scoped to prose files), and not a *pinned non-budget
literal* (it carries no literal). The taxonomy AC-1.2 routes here does not close over the tree the
scanner walks.

This finding is about the **enumeration and its taxonomy**, not about fixture construction, so it
is not routed downstream by §11.4 — §8's own §8.2/§8.3 own it.

**Recommended fix.** Either add a sixth class (*documentation occurrence in source* — an identifier
mention inside a comment or JSDoc block, dispositioned *no action, the identifier is already the
single source*) and enumerate `:2406` and `:2485` under it; or scope §8.3 rule 1 to occurrences
outside comments and say so, in which case `:2406`/`:2485` need no enumeration. The first is
cheaper to keep true: comment stripping is a second parser, and §6's *cite-and-reuse* discipline
argues against adding one. Note also that both comments assert the *relative, per-invocation*
window this feature abolishes, so they need rewording in the same commit regardless.

---

### F-09 — Minor — the declared citation baseline does not resolve

§1.2 and §2.7 declare the baseline `9486c81` and rest the *"a drifted line number is a mechanical
re-baseline"* rule on it. Spot-checking eleven citations at `git show
9486c81:pdlc/workflows/orchestrate-dev.js`, only `:25` and `:52` resolve; `:361`, `:525`, `:569`,
`:1393`, `:1960`, `:2428`, `:2492`, `:2656`, `:2738` all land on unrelated lines. The same eleven
resolve correctly against **HEAD**, so the document is cited against the working tree, not against
`9486c81` (that commit is a docs-only commit and predates 691 lines of change to the module).

Within HEAD, five citations in the 4300–5300 range are still stale — offered as a re-baseline
list, not as findings:

| TSPEC says | Actual at HEAD |
|---|---|
| `main`'s single `try` at `:4373` | `:4373` is `_probeReviewState: probeReviewStateFn,` |
| `main`'s single catch at `:4861` (M-8a) | `:4861` is inside Phase PR's `reviewLoop` call |
| branch-3 existence probe at `:4890`–`:4901` | `:5132`–`:5156` |
| M-8d's unguarded `emit` at `:4927` | not at `:4927` |
| the two-argument `haltError` at `:1799`–`:1803` | `:1819`–`:1823` (the **claim** is correct — it is the only two-argument site in the module, verified across 30 `haltError(` call sites) |
| the `detail`-pinning comment at `:5300`–`:5302` | `:4384` carries that comment |
| `wrapperSeams` at `:4516`–`:4526` | `:4520`–`:4529` (`_writeFile` **is** absent — §5.3's claim verified) |
| Phase CR's `docType: null` at `:4985` | `:4980` |
| `runDodPhase` at `:3833` | see F-10 |

**Recommended fix.** Restate the baseline as the tree the citations were taken against (or re-take
them at `9486c81`), and refresh the eight rows above. §2.7's rule then does the work it was written
to do.

---

### F-10 — Minor — `runDodPhase` does not exist

§8.2's B-BUD-3 paragraph asserts *"`runDodPhase` already takes `maxIterations` as a parameter
defaulting to `DOD_MAX_ITERATIONS` (`:3833`)"*. `grep -rn runDodPhase pdlc/` returns nothing. The
symbol at that line is **`dodVerifyLoop`** (`:3831`), and the substance of the claim is correct —
`maxIterations = DOD_MAX_ITERATIONS` is its second destructured parameter at `:3833`, and it is
injectable. Only the name is wrong.

**Recommended fix.** Replace `runDodPhase` with `dodVerifyLoop` in §8.2 and in AT-BUD-03b's row of
§10.2 if it appears there.

---

### F-11 — Minor — the `scanLines`-over-a-section-body composition is unstated

§6.2 step 3 takes `spanLines ← region.body` and step 4 iterates *"considered only when `scanLines`
admits it (outside fenced blocks)"*. Those two do not compose directly: `topLevelSections`
(`:1393`) returns `body` as a **raw `string[]`**, fences included — deliberately, per its own
comment at `:1385`–`:1391` (*"Bodies, by contrast, are the **raw** lines between one heading and
the next, fences included"*) — whereas `scanLines(text, visit)` (`:721`) takes a whole text string
and tracks fence state from its first line.

The composition is in fact **safe**, and worth stating for that reason: `topLevelSections` locates
headings *through* `scanLines`, so a heading inside an open fence is not a section at all, which
means fence state is always closed at the first line of any section body. Re-running
`scanLines(region.body.join("\n"), …)` therefore starts from the same state production does. But
an implementer reading §6.2 alone cannot know that, and the obvious alternative — running
`scanLines` over the whole file and filtering by index range — is a different and more fragile
shape.

**Recommended fix.** Add one sentence to §6.2: the region's lines are scanned by
`scanLines(spanLines.join("\n"), …)`, and this is sound because `topLevelSections` cannot return a
section whose body begins inside an open fence. That is one more instance of §6's cite-and-reuse
paragraph and belongs beside it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6.1 step 5 returns an explicit field list (`ok, origin, derivedStart, startIndex, endIndex, present, skipped, reviewFiles`). `resolveReviewState` also returns `message` on the `{ok:false}` arm, and `phaseGate` reads `window.reviewFiles`. Is the explicit list intended to be **exhaustive** — i.e. does `phaseWindow` now narrow its return, and if so has every reader in `main` been checked against the narrowed shape? |
| Q-02 | §4.4 says `reviewRows` is carried on **every** report, `[]` on success. `buildFinalReport`'s signature (`:5281`+) destructures with defaults; will `reviewRows = []` be a defaulted parameter (so existing callers and existing report-shape oracles stay green), or a required one? |
| Q-03 | §7.2 says F-9 and F-10 are raised inside `reviewLoop` and surfaced through `checkConverged`'s new branch, *"placed **above** its `halted === true` branch"*. `checkConverged` returns early on `loopResult.converged !== false` (`:1765`). A refusal aborts the entry before convergence is decided — what does `reviewLoop` set `converged` to on the refusal path so the new branch is reached at all? |
| Q-04 | §6.4 step 2 says the creating path dispatches the post-mortem agent *then* runs the shipped `_checkFile` confirmation, and §7.1 F-13 says a failed authoring dispatch leaves `postmortemWritten:false` and then clause 3 refuses. Does the entry still record the shipped `postmortemWritten:false` warning **and** the refusal, or does the refusal replace it? The two produce different `postmortemStatus` values in the final report. |
| Q-05 | §8.3 rule 2 scans for module-scope `const` names matching `/ROUND\|WINDOW.?WIDTH\|BUDGET\|ITERATIONS?/i`. At HEAD that matches `MAX_AUTHORING_ATTEMPTS`? no — but it does match `DOD_MAX_ITERATIONS` (`:25`) and `MAX_REVIEW_ROUNDS` (`:52`), and in the test tree `MAX_AUTHORING_DISPATCHES` does not match while `EXPECTED_WINDOW_WIDTH` does. Has the rule been run over the tree to confirm its hit set equals the enumeration's, or is §8.2's PLAN-time reconciliation task expected to discover that? |

## Positive Observations

- **The export mechanism in §8.1 is feasible exactly as claimed, and I verified it.**
  `stripModuleSyntax` (`build-runtime.mjs:51`) rewrites `^export (const|let|var|function|async
  function|class) ` to the bare declaration, so `export const MAX_REVIEW_ROUNDS = 3;` reaches the
  bundle as `const MAX_REVIEW_ROUNDS = 3;` — byte-identical in effect. The decision **not** to
  extend `wrapModule`'s export list (`:83`–`:94`) is right: the runtime has no consumer for the
  value. §8.1 is the cleanest part of the document.
- **D-1's rejection of `pdlc/workflows/lib/reset-region.mjs` is correct and correctly argued.**
  `build-runtime.mjs` reads exactly three sources by name (`:81`–`:83`) and `stripModuleSyntax`
  deletes every `^import …;` line. A `lib/` module genuinely would be invisible to the pipeline.
  Anticipating that a reader coming from `document-oracles.mjs` will propose it, and answering in
  advance with the re-evaluation trigger, is exactly what §11.2 is for.
- **D-2's `_statFile` rationale checks out against the code.** `checkFileNonEmpty` (`:361`) does
  collapse every caught exception into `{ok:false, reason:"file_missing"}` (`:377`–`:379`), which
  is the same value it returns for a genuinely absent file. Neither shipped seam can express
  *unevaluable*, so the third seam is forced rather than chosen. `defaultStatFile`'s
  one-errno-answers-absent rule is the right shape.
- **Every claim I could check about the shipped test suite is accurate.**
  `roundDerivation.test.js:57`'s *"the constant is deliberately **not exported**"* comment,
  `:61`'s `EXPECTED_WINDOW_WIDTH = 5`, `:389`'s exact-key-set assertion,
  `pacingWrapper.test.js:77`'s duplicate declaration, and `reviewLoop.test.js:139`/`:477`'s
  *"5 iterations"* titles are all where the TSPEC says they are and say what it says they say.
  That is unusual and it made this review much faster.
- **§9.2's fault-injecting file map is the right test-double design**, and the sentence explaining
  it — *"without a write that lies, an equality read-back always passes"* — is the single best
  line in §9. Likewise the separate authoring/reviewer dispatch counters: *0 authoring dispatches*
  and *0 reviewer dispatches* really are different assertions on the same entry.
- **§4.3's disjointness argument is sound.** A `RESOLVED:` line is never a region line, so clauses
  1 and 2 quantify over disjoint line sets and genuinely compose without an ordering question.
  That is what earns the one-transform design rather than merely asserting it.
- **§9.4 row 9 gets the freshness gate right**: mutate the built artifact and observe the check
  red, *not* run it on an already-fresh tree. That is the DC-03 discipline applied to the one
  oracle most likely to be trusted without ever having been seen fail.
- **§11.3 is honest about what is left open**, and each open interface has a named successor with a
  queue row rather than a stub. The refusal to build `M-8d`'s suppression seam here — because a
  seam one notch too wide silences the recovery line on every halt class — is the right call and
  is argued, not asserted.

## Recommendation

**Needs revision**

Three findings are blocking and all three sit in §11.4's protected categories — the module map
(F-03), a seam/contract the change re-points (F-01), and the shipped behaviour of a named consumer
on a named input (F-02). None of them is an oracle-design, fixture or property-coverage defect, so
none is closable by deferral to PROPERTIES or PLAN.

What must change before this document is approved:

1. **Thread `origin`** into `reviewLoop` and `checkConverged`, and make one function render both
   the phase-row window and the `HALT-REASON:` value (F-01). Add `origin` to §4.5's `LoopResult`
   and to §5.6.
2. **Route the approval search to `derivedStart`** and add `tier1ApprovalRecord` to §10.3's
   consumers of the re-pointed `startIndex` (F-02).
3. **Reconcile §3.3 with §6.1** on where the clearance gate runs, correct §6.3's footnote-`*`
   premise to the shipped call order, and give the *granted-then-skipped* state a row in §7.1
   (F-03).

The five Major findings (F-04 through F-08) should be fixed in the same revision — F-04 in
particular, since it is a failure disposition faulting on its own named input — but each is a
local edit. The three Minor findings are re-baseline and wording work.

I want to be clear that this is a good document that is close. The findings are not a
disagreement with the design; they are the blast radius of two deliberate, well-chosen meaning
changes not yet being fully enumerated. Enumerate those two contracts' consumers and this
approves.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 5, "low": 3}
