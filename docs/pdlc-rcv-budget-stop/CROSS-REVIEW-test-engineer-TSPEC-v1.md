# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/TSPEC-pdlc-rcv-budget-stop.md`
**Scope:** TSPEC-pdlc-rcv-budget-stop.md v1.0
**Date:** 2026-08-02
**Iteration:** 1
**Citation baseline:** verified against HEAD of `feat-pdlc-rcv-budget-stop`

## Summary

This is a strong TSPEC and it is at the right altitude. The read/write model clusters (§3.1) are
pure by construction, which is exactly the compensation §3.1 promises for not having a `lib/`
module; §5.2's `_statFile` is a correctly-motivated seam rather than a reuse of two seams that
conflate absent with unreadable; §9.2's `write-noop` fault mode is the single insight that makes
the two content confirmations falsifiable at all; and §9.4 is a real mutation ledger, not a
coverage promise. I have honoured §11.4's stopping rule: I filed **nothing** for a missing fixture,
a missing generation axis, a missing property or a missing coverage floor — §1.4, §9.6 and §11.1
receive those, and this document is correct to omit them.

The three Blocking findings are all in the stopping rule's own carve-out — an oracle the design
cannot leave green, a double that cannot falsify a confirmation, and a missing carrier that makes a
named FSPEC acceptance test unwritable. Concretely:

1. **§8.1 and §6.1 assert that four shipped oracles stay green that the design necessarily reds**,
   and §6.1 bullet 3's backward-compatibility claim about `deriveRoundWindow` is false at HEAD. I
   checked each cited line. This is the finding that will cost the most if it reaches implementation
   unstated, because the implementer's honest reading of §8.1 is *"do not touch these"* and the only
   way to obey it is not to ship the feature.
2. **§9.2's fault catalogue offers only whole-write faults**, so the *second* conjunct of each of
   the two content confirmations (§6.3 step 6's *"A increased by exactly 1"*, §6.4 step 4's
   conjunct (b)) can never be the sole failing conjunct — those branches are unfalsifiable, and
   §9.4 row 7's mutation reds through conjunct (a) alone.
3. **Row C has no carrier out of `reviewLoop`.** §6.6(2) and §7.2 both write `reviewRows.push(…)`
   from module-scope functions that cannot see `main`'s report arrays, and §4.5 grows `LoopResult`
   by two fields, neither of which is a row carrier. AT-RPT-04, AT-RPT-06 and AT-RPT-07 are not
   writable against the design as stated.

None of the three contests the module map, the seam contracts, the algorithms' behaviour on a named
input, or the failure dispositions — all four of those I checked and found sound. Each is a
localised correction to §§4.5/8.1/9.2 plus one clause elsewhere.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Blocking | Local | Four shipped oracles are asserted unchanged that the design necessarily reds; §6.1's compat claim is false | §8.1, §6.1(3), §9.5 |
| F-02 | Blocking | Cross-Feature | The double catalogue cannot falsify the second conjunct of either content confirmation | §9.2, §6.3(6), §6.4(4) |
| F-03 | Blocking | Local | No carrier transports `reviewRows` out of `reviewLoop` / `checkConverged`; AT-RPT-04/06/07 unwritable | §4.5, §6.6(2), §7.2 |
| F-04 | Major | Local | `_statFile` is never threaded to `main` / `wrapperSeams` / `reviewLoop`, so L4 cannot inject it | §5.2, §5.3, §5.6, §9.1 |
| F-05 | Major | Local | §8.3's scan rules structurally cannot see the site class §8.2 enumerates by hand; `stale-prose` predicate is stated at two granularities | §8.2, §8.3 |
| F-06 | Major | Local | `defaultStatFile`'s errno discrimination — the sole basis of F-5, ND-1 and D-2 — is at no level in §9.1 | §5.2, §9.1, §9.3 |
| F-07 | Major | Local | The mutation ledger has no row for either safe-direction rule (`unevaluable ⇒ existing`; `W` defaults to 1) | §9.4 |
| F-08 | Minor | Local | `resolveOrigin` is named as an L1 test subject but has no contract anywhere in §6 | §3.1, §9.1 |
| F-09 | Minor | Local | §9.4 row 1's mutation reds two distinct observables; only one is named, leaving the other's positive direction unproven | §9.4, §6.3.2, §8.3 |
| F-10 | Minor | Local | Prose-class line citations are already stale at authoring time | §8.2 |

### F-01 — Blocking — §8.1, §6.1 bullet 3, §9.5

§8.1's disposition table and §6.1's bullet 3 make a backward-compatibility claim that does not hold
at HEAD, and four shipped assertions are consequently mis-dispositioned as *unchanged* / *untouched*
when the design requires them to invert. I checked each cited line.

**The false claim.** §6.1 bullet 3: *"`deriveRoundWindow`'s internal `endIndex = windowEnd(startIndex)`
becomes `windowEnd(origin)` with `origin` defaulting to `1`, which reproduces today's value on every
caller that passes no origin."* It reproduces today's value on exactly the callers whose
`derivedStart === 1`. For every other listing `windowEnd(1) = 3 ≠ windowEnd(derivedStart)`.

**The four assertions.**

| Site | What it asserts at HEAD | §8.1 / §8.2 disposition | What the design does to it |
|---|---|---|---|
| `roundDerivation.test.js:300` (RLH-AT-02) | `w.endIndex === 2 + WIDTH - 1` for a listing whose highest round is 1 | *"untouched"* | `startIndex 2`, `endIndex windowEnd(1) = 3` — **red** |
| `roundDerivation.test.js:558` | the window-width **property** over generated listings: `endIndex === startIndex + WIDTH - 1` | *"untouched"* | false for every `derivedStart > 1` — **red** |
| `pacingWrapper.test.js:1455`–`:1501` (RLH-AT-54) | branch with highest FSPEC round 3 ⇒ gate admits **rounds 4..8**, report matches `rounds 4..8` | *"the import is used at `:1458` and `:1501` unchanged"* | `D = 4`, `W = 1`, `E = 3` ⇒ **zero-round halt**; the assertion pins the pre-feature relative window — **red**, and its whole premise is inverted |
| `reviewLoop.test.js:139` (PROP-LOOP-03) and `:477` (PROP-LOOP-12) | behavioural counts: `iterations: 5`, five reviewer pairs, five optimizer calls | §8.2 classifies these as *"acceptance-test **titles**"* under **pinned non-budget literal**, which *"stays a literal and says so at its site"* | they are not titles; the bodies count dispatches. Leaving them literal at width 3 is **red** |

**Why this is Blocking rather than a note.** §9.5 is the section that owns *"suite-level obligations
of the change itself"*, and it names exactly one shipped assertion (`RLH-LOOP-03`) that must stay
green. An implementer reading §8.1 + §9.5 literally concludes that the only test-side work is a
width re-expression. The L2 level (§9.1) is defined as *"extends `roundDerivation.test.js`"* — but
the invariant that suite pins is the one the feature replaces, and the TSPEC states no replacement
invariant. The L2 suite therefore cannot be written from this document.

**Recommended fix.**

1. Correct §6.1 bullet 3 to the true statement: `windowEnd(origin)` with `origin` defaulting to `1`
   reproduces today's value **only when `derivedStart === 1`**; state explicitly what
   `deriveRoundWindow`'s `endIndex` now means for a caller that passes no origin, and whether an
   origin-less call is still a supported contract or becomes internal-only.
2. Replace §8.1's *"untouched"* / *"unchanged"* dispositions for `roundDerivation.test.js:300`,
   `:558` and `pacingWrapper.test.js:1455`–`:1501` with a new **§9.5 sub-table: "shipped assertions
   whose semantics invert"**, one row each, naming the replacement invariant. The obvious
   replacements: `endIndex === origin + BUDGET - 1` and `startIndex === max(derivedStart, origin)`
   for L2, and for RLH-AT-54 the inverted expectation (`highest existing round 3` ⇒ zero-round halt
   rendering `rounds 1..3 of 3`), which is AT-WIN-04/AT-WIN-02's territory and should cite them.
3. Re-classify `reviewLoop.test.js:139` and `:477` out of **pinned non-budget literal**. They are
   *read from it* sites once re-expressed over the imported constant — which is what §8.1's
   mechanism already supports — or they are semantics-inverting rows for the §9.5 sub-table. Either
   is fine; *"stays a literal and says so at its site"* is not.
4. §11.4's fixed-point clause is about **this document's** review loop, so this finding is not
   closable by deferral: it is a claim about existing code that I checked and found false, not a
   missing fixture.

### F-02 — Blocking — §9.2, §6.3 step 6, §6.4 step 4

Both content confirmations are **two-conjunct**, and §9.2's fault catalogue can only make both
conjuncts fail at once. So the second conjunct of each is a branch no test in the stated design can
red.

| Confirmation | Conjunct 1 | Conjunct 2 | Fault that fails **only** conjunct 2 |
|---|---|---|---|
| §6.3 step 6 (answering line) | `line` present in the region span | `A` increased by **exactly 1** | a write that lands the line **twice** (`A += 2`) |
| §6.4 step 4 (clauses 1-and-2) | `parseResetRegion(back2).lines` includes `upd.haltLine` **and** `H` increased by 1 | **(b)** no unfenced `RESOLVED:` line remains anywhere in `back2` | a write that appends the halt line but preserves the marker |

§9.2 offers three modes: `unreadable`, `unevaluable`, `write-noop`. `write-noop` changes nothing, so
it fails conjunct 1 first in both rows; the `else` arm is never reached with conjunct 1 satisfied.
This matters beyond tidiness: §7.1 F-10's disposition and split §5.8's whole argument for D-3 (*"a
separately losable strip leaves a readable marker beside an incremented `H`, which the gate reads as
an unconsumed clearance"*) is **precisely** the state conjunct (b) exists to detect, and the design
as written contains no double that can produce it. §9.4 row 3's mutation (*"delete clause 2's strip
from `applyHaltUpdate`"*) reds the L1 golden, which proves the pure transform — it does not prove
the L3 confirmation branch, because with the strip deleted conjunct (b) correctly fails and there is
no evidence the check would have caught a *write-side* loss.

**Recommended fix.** Add one fault mode to §9.2's fault-injecting file map — a per-path
**transform hook** applied to the bytes handed to `_writeFile` before they land
(`{mode: "lying-write", transform: (bytes) => …}`), with the two named realisations above called
out as the ones that isolate conjunct 2. State in §9.2 the rule this generalises: *every conjunct of
a multi-conjunct confirmation needs a fault that fails it alone.* Then add a §9.4 ledger row for each
isolated conjunct — mutation: *drop conjunct (b) from §6.4 step 4* and *weaken §6.3 step 6's `A`
delta from `=== 1` to `>= 1`*.

### F-03 — Blocking — §4.5, §6.6(2), §7.2

`reviewRows` has no path from where the rows are produced to where the report is built.

- §6.6(2): *"When `roundsRun === 0` it pushes **row C** onto `reviewRows`"* — this runs inside
  `reviewLoop`, which is `export async function reviewLoop({…})` at `orchestrate-dev.js:1841`,
  module scope. `notices` is `const notices = []` at `:4386`, a local of `main`. `reviewLoop` cannot
  see it, and §4.5 grows `LoopResult` by `roundsRun` and `refusal` only — neither carries rows.
- §7.2's refusal shape shows `reviewRows.push({…})` beside `recordPhase(…)`. For F-8 that is inside
  `phaseGate` (a closure of `main`, `:4406`) and is fine. For F-9/F-10 §7.2 routes the refusal
  through `checkConverged`, which is module-scope at `:1756` with seven positional parameters
  (`loopResult, phaseId, phaseLabel, recordPhase, feature, startIndex, endIndex`) — `recordPhase` is
  injected precisely because it cannot reach `main`'s scope, and no analogous row sink is specified.
- §6.6(3) then says `buildFinalReport` (`:5281`) *"gains `reviewRows = []` beside `notices = []`"* —
  a parameter `main` must pass, from an array `main` must own.

Consequence for the testing lens: §10.2 names `reviewRows` on the final report as the seam that makes
**AT-RPT-04** (row C's cells), **AT-RPT-06** (three pairwise-distinct ❌ texts, empty `notice`) and
**AT-RPT-07** (asserting row B's **absence**) writable. AT-RPT-07 in particular is an absence
assertion over a channel whose producer→report path is undefined, which is unfalsifiable in the way
§9.2's own rule warns about: it passes when the carrier is missing entirely.

**Recommended fix.** Make the carrier explicit in §4.5 and §7.2:

- add `reviewRows: ReviewRow[]` (default `[]`) to `LoopResult`, produced by `reviewLoop` and
  concatenated by `main` into the report-level array — the same shape `postmortemWritten` /
  `trailerReason` already use to cross that boundary;
- give `checkConverged` an eighth parameter (a `pushReviewRow` sink, or the array itself), stated
  beside its existing `recordPhase` injection, and say so in §7.2's *"Where the refusal is raised
  from"* paragraph;
- state in §4.4 that `main` owns the array and `buildFinalReport` receives it, so AT-RPT-07's
  absence assertion is made against a channel that demonstrably exists on every run (the same
  argument §6.6(3) already makes for carrying `reviewRows` on success).

### F-04 — Major — §5.2, §5.3, §5.6, §9.1 (L4)

§5.3 does the threading work for `_writeFile` explicitly and correctly: *"It is added to
`wrapperSeams` and to `reviewLoop`'s parameter list."* Nothing does that work for `_statFile`.
Verified at HEAD: `wrapperSeams` (`:4520`) is `{_agent, _readFile, _hashFile, _listFiles,
_appendFile, _probeDoc, _probeReviewState, _log, _git}`; `reviewLoop`'s destructured parameter list
(`:1841`–`:1866`) has no `_statFile` and no `_writeFile`; `main`'s parameter list (`:4300`ff) takes
`_checkFile`, `_readFile`, `_writeFile`, `_listFiles`, `_appendFile` … and no `_statFile`. §10.3
mentions only the **runtime adapter**'s `rtStatFile`, which is the production wiring, not the test
seam.

This is a testability-design gap, not a fixture gap: §9.1's L4 level is *"one whole entry … the
existing `main()` harness"*, and **AT-REG-06** and **AT-HALT-02** are explicitly whole-entry rows
(AT-REG-06's FSPEC row says *"phase entered **and run to its end** — the row asserts the whole entry,
not the read alone"*). Both turn on `_statFile` answering `{exists:true}` while `_readFile` answers
`null`. With no path from the harness to `maintainRegionOnHalt`, those rows can only be written at
L3, which is a weaker proof than the FSPEC row demands.

**Recommended fix.** Extend §5.3's paragraph (or add the symmetric one to §5.2) stating that
`_statFile` is added to `main`'s parameter list, to `wrapperSeams`, and to `reviewLoop`'s
destructured parameters with `defaultStatFile` as the default — and add the `main`-side thread to
§10.3's `orchestrate-dev.js` row so the PLAN derives a task for it.

### F-05 — Major — §8.2, §8.3

§8.2's fifth class, **pinned non-budget literal**, enumerates *"the acceptance-test titles at
`reviewLoop.test.js:139` and `:477` … and any fixture literal a re-expression would make circular"* —
that is, **bare numeric literals inside test bodies**. §8.3's scan rules are three: (1) occurrences
of the identifier `MAX_REVIEW_ROUNDS`; (2) numeric initialisers of module-scope `const`s whose name
matches `/ROUND|WINDOW.?WIDTH|BUDGET|ITERATIONS?/i`; (3) the rendered width in declared prose files.
A bare `5` inside a `describe(…)` or an `expect(…).toBe(5)` matches none of the three.

So the class §8.2 enumerates by hand is exactly the class §8.3's machine is blind to — and
`unenumerated-site`, which §8.3 calls *"the case a human-read checklist structurally cannot detect"*,
cannot be raised for it. AC-1.2's *"repo-wide, production and test alike"* is therefore not
achievable by the stated rules, and the enumeration for that class degrades back to the hand
maintenance §8.1 rightly rejects.

Second, smaller defect in the same section: `stale-prose` is defined at **file** granularity
(*"a non-frozen `prose` site whose file no longer states the effective width"*) while the match key
is defined at **site** granularity (*"the match is on `path` + `text`"*). Under the file reading the
predicate is close to unfalsifiable for a large file — `CLAUDE.md` contains the digit `3` in
`DOD_MAX_ITERATIONS = 3`, `MAX_AUTHORING_ATTEMPTS = 3` and elsewhere, so it would satisfy *"states
the effective width"* while still carrying `MAX_REVIEW_ROUNDS = 5`.

**Recommended fix.**

1. Add a fourth scan rule, scoped to `pdlc/workflows/__tests__/**`: every **numeric literal equal to
   the effective or the prior width** appearing in a test file, reported as `unenumerated-site`
   unless present in `budget-width-sites.json` with a `pinned` classification. This is noisy by
   construction, which is the point — the JSON absorbs the noise once and the machine then sees the
   class. If that noise is judged unacceptable, say so explicitly in §8.2 and record that the class
   is **hand-maintained by design**, with the residual risk named; either way the document should
   not imply the machine covers it.
2. Re-state `stale-prose` at one granularity: *"the site's recorded `text` is absent from the file at
   `path`"*. That is falsifiable, matches §8.3's own `path` + `text` key, and reds exactly when a
   prose site was missed.
3. §9.3's O-13 row already requires the fixture root to show `unenumerated-site` **red** before the
   oracle is trusted (DC-03) — extend that requirement to one fixture per **violation kind**, so
   `second-declaration` and `stale-prose` are each shown red too. Today only one of the three is.

### F-06 — Major — §5.2, §9.1, §9.3

`defaultStatFile` is where the whole `unevaluable` design lands: §5.2's *"`ENOENT` is the **only**
errno that answers absent; every other outcome is `unevaluable`"* is the sole mechanism behind F-5,
ND-1 and D-2's justification. §9.1's L1 row lists seven pure functions and does not include it; §9.2's
in-memory map *"answers from key presence"*, i.e. it replaces `defaultStatFile` rather than
exercising it; §9.3 has no row for it. So the one branch that decides whether a live region gets
erased is tested at no level.

It is trivially testable — the signature already takes the seam (`defaultStatFile(path, {fsMod = fs})`),
which reads like it was written for exactly this.

**Recommended fix.** Add `defaultStatFile` to §9.1's **L1** row with `fsMod` named as its double, and
add a §9.3 row: one leg per outcome class — `ENOENT` ⇒ `{exists:false}`, a throwing `statSync` with
`code: "EACCES"` (and one with no `code` at all) ⇒ `{unevaluable:true}`, success ⇒ `{exists:true}`,
empty/blank path ⇒ `{exists:false}`. Then §9.4 gains the ledger row F-07 asks for.

### F-07 — Major — §9.4

§9.4 is the TSPEC-owned list of assertions that are *"the **only** signal of its defect"*. Two of the
feature's load-bearing safety rules are absent from it, and both are of exactly the kind that stays
green under an innocent inversion:

- **F-5 / §6.4 step 1: `unevaluable ⇒ existing`.** The named mutation is `creating ← stat.exists !== true`,
  i.e. treating `unevaluable` as absent. Every fixture whose file simply exists still passes; only a
  fault-mode fixture reds it. This is D-2's entire justification and §7.3 ND-1's boundary.
- **RS-3 / §6.2 step 5: `W` defaults to `1` over the empty set.** The named mutation is replacing the
  fallback with a bare `Math.max(...values)`, which yields `-Infinity` on the empty set. Under
  §7.1 F-6 this must never reach `windowEnd` or `Math.max` — the invariant is stated (RS-2, RS-3) but
  no ledger row pins it, and a `-Infinity` origin produces a window that silently admits nothing,
  which is the failure mode hardest to notice in a report.

**Recommended fix.** Add both rows to §9.4's table with the mutations above. Optionally a third for
§6.2 step 4's *"counting is by prefix, resolution is by grammar"* split (mutation: count only
well-formed values ⇒ a malformed `WINDOW-START:` stops answering a halt), which is the invariant
split §5.4 fixes for both ends of the split and is currently pinned only by an L1 example.

### F-08 — Minor — §3.1, §9.1

`resolveOrigin` appears twice in the document — in §3.1's region-read-model cluster and in §9.1's
L1 subject list — and nowhere else. §6.2 specifies `parseResetRegion` and `readRegionState`, and
step 5 of `parseResetRegion` already does what the name suggests. An L1 test subject with no stated
signature, no input classes and no return contract cannot have a test written for it.

**Recommended fix.** Either delete `resolveOrigin` from §3.1 and §9.1 (if step 5 absorbed it), or
give it a one-line contract in §6.2 alongside the others: `resolveOrigin(lines) → number`, total,
`1` over the empty set, greatest well-formed `WINDOW-START:` value otherwise.

### F-09 — Minor — §9.4 row 1, §6.3.2, §8.3

§6.3.2 names **two** observables for *"deliberately not consulted"* — the runtime validator counter
(§9.2) and the static `validatorConsultationSites(root) === 0` (§8.3) — and §9.3 lists both. §9.4
row 1 collapses them to *"the validator 0-call count"*. The mutation (*wire `validationConjunct` to
call `_validateRegion`*) does red both, so nothing is unfalsifiable; but a scanner whose regex never
matches would also report `0` forever, and the ledger row as written does not record that the
mutation exercised the scanner's **positive** direction.

**Recommended fix.** Split §9.4 row 1 in two, or state in the row that the mutation must be observed
red on **both** observables and that `validatorConsultationSites` is additionally exercised against a
fixture root carrying a synthetic `_validateRegion(` call site, asserted `=== 1`. That makes the
scanner's positive direction a recorded fact rather than an inference from a single mutation, and it
is the same DC-03 discipline §9.3 already applies to `budgetWidthViolations`.

### F-10 — Minor — §8.2

The prose-class citations are already stale as authored. `MAX_REVIEW_ROUNDS` occurs in `CLAUDE.md` at
**`:78` only**, not `:78`–`:84` (`:79`–`:84` are the *Documents are gated…* and *Authoring is
incremental…* bullets and the `### Continuous integration` heading). `README.md:38` carries the width
as the prose phrase *"max 5 iterations"*, not the identifier — worth stating, because §8.3 rule 3
matches a rendered width and the reader needs to know which form is expected at that site.

**Recommended fix.** Correct the citation to `CLAUDE.md:78` and note `README.md:38`'s form. Since
§8.2 promises a PLAN task that re-runs the scan and reconciles drift before the width changes, this
is cheap to fix and cheap to leave — but the same PLAN task is the natural place to regenerate the
JSON rather than transcribe it, which would remove this class of error entirely.

## Questions

| ID | Question |
|----|---------|
| Q-01 | After this feature, is an origin-less `deriveRoundWindow(basenames, docType)` call still a supported contract, or does every production caller pass an origin? The answer decides whether the L2 suite keeps a two-argument leg at all, and it is the missing premise behind F-01. |
| Q-02 | §6.1 says steps 3 and 4 are skipped when `docType` is `null`, but not what `endIndex` Phase CR gets. If it is `windowEnd(1)` then a Phase CR re-entry with existing `…-REVIEW-v{N}` files zero-round-halts, which contradicts B-BUD-2 / AT-BUD-02's *"exactly `BUDGET` rounds run in the invocation"*. Is the untyped path meant to keep the shipped **relative** window (`windowEnd(derivedStart)`)? |
| Q-03 | §4.4 says rows B and C are *"mutually exclusive by construction"*. On a **creating** zero-round halt that then fails clause 3 (F-9), the loop both reaches the halt branch and refuses — does that entry emit row C, row B, or neither? AT-REG-06's expectation reads as *row B only*, and stating the rule in §4.4 would make AT-RPT-07's absence assertion unambiguous. |

## Positive Observations

- **§9.2's `write-noop` fault mode is the observation the whole test strategy turns on.** *"Without a
  write that lies, an equality read-back always passes"* is precisely right, and it is the reason
  F-8/F-9/F-10 are testable at all. F-02 asks only that the same reasoning be pushed one conjunct
  deeper; it does not contest the insight.
- **The separate authoring-dispatch and reviewer-dispatch counters (§9.2) are the correct
  discrimination.** *"0 authoring dispatches"* (B-HALT-2) and *"0 reviewer dispatches"* (B-WIN-2) are
  genuinely different assertions on the same entry, and a single counter would have made AT-HALT-02
  and AT-WIN-02 indistinguishable.
- **The positive-conjunct rule for every "no round ran" assertion (§9.2, closing paragraph)** is
  exactly the absence-only-oracle discipline this lens enforces, applied before anyone asked.
- **§9.3's O-5 row forbids deriving the golden in-test** (*"the expected file is authored, never
  derived by re-applying the transform, which would re-implement production in the oracle"*). That is
  the single most common way a byte-equality oracle is quietly neutered, and it is closed here.
- **§9.4 row 9 states the freshness gate must be falsified by mutating the built artifact, "not by
  running it on an already-fresh tree."** A green artifact check is the classic
  can-only-pass assertion; naming the mutation is the right fix.
- **§9.3's O-13 row applies DC-03 to the new oracle itself** — `budgetWidthViolations` must be shown
  red on a fixture root before it is trusted. F-05 asks only that the other two violation kinds get
  the same treatment.
- **§5.2's argument for a new seam is airtight from the testing lens.** Both shipped alternatives
  conflate absent with unreadable, and the document proves it at the line (`:377`–`:379`) rather than
  asserting it. The resulting three-valued return makes F-4 and F-5 distinguishable fixtures.
- **§4.4's rejection of a `detail`-string channel** is correct for a reason that is specifically a
  test-design reason: existing oracles pin `detail` verbatim, so a string channel would couple three
  features' assertions to one another's formatting.
- **§2.4 correctly identifies `RLH-LOOP-03` as a design asset**, and §9.5 keeps it green rather than
  editing the oracle to fit the change — the right instinct, and the one §8.1 should have applied to
  the four sites in F-01.
- **§11.4's stopping rule is well-drawn and I applied it.** No finding here is *"this component has
  no property / no fixture / no generation axis"*; §1.4, §9.6 and §11.1 correctly route those, and
  the TSPEC is right that omitting them is evidence of layer discipline, not of a gap.

## Recommendation

**Needs revision**

Three Blocking findings, all inside §11.4's own carve-out for testability-design defects:

- **F-01** — an oracle the design cannot leave green (four shipped assertions dispositioned as
  unchanged; §6.1 bullet 3's compatibility claim is false at HEAD). Fix: correct the claim, and add
  a §9.5 sub-table of shipped assertions whose semantics invert, each with its replacement invariant.
- **F-02** — a double that cannot falsify a confirmation (only whole-write faults, so the second
  conjunct of each two-conjunct confirmation is unfalsifiable). Fix: add a transform-hook fault mode
  and the two ledger rows that isolate the conjuncts.
- **F-03** — a missing carrier that makes AT-RPT-04/06/07 unwritable. Fix: put `reviewRows` on
  `LoopResult`, give `checkConverged` a row sink, and state that `main` owns the array.

Four Major findings (F-04 `_statFile` not threaded to L4; F-05 the scan's blind class and the
two-granularity `stale-prose` predicate; F-06 `defaultStatFile` tested at no level; F-07 two missing
mutation-ledger rows) each need a stated fix in the same round. The three Minor findings are
one-line corrections.

Nothing in this review contests the module map, the seam contracts, the algorithms' behaviour on a
named input, or the failure dispositions — those I checked against HEAD and found sound, and they
should not be reopened. The revision is scoped to §4.5, §5.2/§5.3, §6.1 bullet 3, §8.1, §8.2, §8.3,
§9.1, §9.2, §9.3, §9.4 and §9.5.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 4, "low": 3}
