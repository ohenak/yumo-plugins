# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-20
**Iteration:** 4
**Base of the delta:** `24c17263` (the commit at which v3 was written) → HEAD

## Overview

**Scope of this round.** Delta re-review of the eight commits between `24c17263` and HEAD
(+30 / −8 lines on the PLAN, all of it inside four task rows, two gate/ledger rows, the naming
section, three new open-question answers and one new DoD clause). I read my v3 file, diffed the
document against the commit I reviewed, verified each of my four prior findings against the revised
text **and against the repository**, and scanned only the changed material for new issues. Sections
I approved in v3 and that the diff did not touch — the batch DAG, the 23 task rows' `Deps`/`Batch`
cells, the file-ownership manifest, the expected-red ledger's arithmetic, the measured coverage
baseline, DoD 1–12 — were not re-litigated.

**Disposition of the four v3 findings. All four are resolved.** Each landed as a changed clause in
the artifact the implementer transcribes from, not as a note about the clause.

| v3 | Sev | What v0.4 does | Resolved |
|---|---|---|---|
| F-01 | Med | LI-10's row now names the delegated positive assertion by value and by fixture row: "**including the healthy value**: `dispatches[i].corpusOutcome === null` asserted on dispatches 1, 2 and 4, which is the positive half LI-23's non-`null` scoping delegates here", with the falsification argument attached (`undefined`/`""`/omitted key would otherwise be green everywhere). LI-23 points back at it by name | ✅ |
| F-02 | Med→ | A new paragraph in §Test-name namespacing states the rule universally — "Only the six AT-bearing suites carry `LI-AT-` titles; every other test this feature adds is named `LI-T-*`, and `LI-T-SUITEMAP` enforces that" — declares it "a gate input, not a style preference", and names the two rows that do not enumerate their tests (LI-01, LI-06). This is the one-sentence fix that covers all six at once | ✅ |
| F-03 | Low | §Verification's green-terminal gate row and §T.5's green column both adopt the batch ladder's directory-wide phrasing: "statically parsing the `learnings*.test.js` directory, whose six AT-bearing suites all exist at the end of batch 5 and whose other six matching files register `LI-T-` titles only, so the closure is already equal to six at authoring" | ✅ |
| F-04 | Low | P-A-3's universe is now "the **twelve** `learnings*.test.js` suites", with the two non-suite manifest rows named and the reason they cannot carry a status stated, and "fourteen is the count of manifest test rows, not of ledger-eligible suites" | ✅ |

**One change this round was not mine, and it is the one I spent the most measurement on.** PM F-09
re-keyed LI-01's P-2a set equality from *(enclosing function, argument position)* to *(enclosing
named function, prompt-source symbol)*, because the old key was **not injective** over the four
authoring call sites. I re-measured that at HEAD and PM F-09 is correct: `erratumAuthorPrompt`'s
dispatch (`pdlc/workflows/orchestrate-dev.js:12861`) and the land-proof retry (`:12955`) are both
`wrappedDispatch({…})` object-literal calls inside `erratumRound` (`:12790`), and the PLAN's
supporting claim is exact — `const missingAgainst = async () => {…}` opens at `:12919` and closes
at `:12928`, before the retry, which is nested only in the `if (stillMissing.length > 0)` block at
`:12931`. The old key really would have yielded three members for four sites and reddened batch 1
on a correct tree.

**Verdict of this round: Approved with minor changes.** No High findings, and none open from any
prior round. One Medium and two Lows, all three on the re-key itself — the new key is injective at
HEAD, but it is a *keyed* set equality, and neither its cardinality conjunct nor its derivation
rule at two of the four sites is stated.

## Batches

**Three task rows changed: LI-01, LI-10, LI-23.** No row was added or removed (still 23), and no
`Test File`, `Source File`, `Batch` or `Deps` cell moved — I diffed the row tails to confirm that
rather than assuming it (`LI-10 … | 5 | LI-02, LI-06 | ⬚ |`, `LI-23 … | 5 | LI-02, LI-06 | ⬚ |`,
`LI-01 … | 1 | — | ⬚ |`, all unchanged).

| Row | Claim checked | Result |
|---|---|---|
| LI-10 | The healthy `corpusOutcome === null` clause on `DIVERGENT-CORPUS` dispatches 1, 2 and 4 | ✅ — and the fixture supports it exactly as the row says: the row's own description of `DIVERGENT-CORPUS` is "five authoring dispatches; the scripted `_git` reply gains a path after dispatch 2 and fails at dispatch 5", so dispatches 1, 2 and 4 are healthy and observable. No new fixture, no new task, no batch change — which is what I asked for |
| LI-23 | The back-pointer to LI-10's clause | ✅ — "asserted by `learningsRecord.test.js`'s BR-9 per-dispatch rows over `DIVERGENT-CORPUS`'s **dispatches 1, 2 and 4** (LI-10 / LI-19), and LI-10's row carries that clause by name". The delegation is now legible from both ends, and the forbidden repair (`LEARNINGS_CORPUS_OUTCOMES ∪ {null}`) is still forbidden in the same sentence |
| LI-01 | The re-keyed P-2a set equality, `(enclosing named function, prompt-source symbol)`, with the four sites enumerated | ✅ for injectivity at HEAD; ⚠️ for cardinality and for derivability at two of the four sites — F-01 and F-02 below |

**The four enumerated key pairs are true of HEAD. I measured each.**

| PLAN's pair | Site | Enclosing named function | Prompt slot at the site |
|---|---|---|---|
| `(erratumRound, erratumAuthorPrompt)` | `orchestrate-dev.js:12861` | `erratumRound` (`:12790`) | `basePrompt: erratumAuthorPrompt({…})` — the symbol is at the slot |
| `(erratumRound, the land-proof-retry inline template)` | `:12955` | `erratumRound` (`:12790`) | `basePrompt:` a bare template literal (`ERRATUM ROUND … LAND-PROOF RETRY.`) — no symbol |
| `(converge, creatorPrompt)` | `:13657` | `converge` (`:13628`) | a conditional expression over the local `basePrompt` (`creatorPromptExtra ? …template… : basePrompt`) — `creatorPrompt` is bound one line earlier, `const basePrompt = creatorPrompt(phaseId, …)` at `:13656` |
| `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)` | `:7663` | `reviewLoop` (`:7266`) | `runWrapped(optimizer, optPrompt, doc, "authoring", …)` — `optimizerPrompt` is bound at `const optPrompt = optimizerPrompt(…)`, `:7660` |

The key is injective over these four, so batch 1 is green on authoring as the row promises. The two
rows in this table with a binding hop are why F-02 exists: at `converge` and `reviewLoop` the named
"prompt-source symbol" is *not* readable from the dispatch expression — a static parse of the call
site sees the identifiers `basePrompt` and `optPrompt`. Those are still distinct from each other and
from the other two slots, so any parse an implementer writes stays injective; but the key the row
names and the key the row's own mechanism can read are two different things, and the row does not
say which one the test transcribes.

**The exclusion side of the keying is unchanged and still exact.** The five non-call-site
`"authoring"` occurrences — `:6511` (a doc comment), `:6515` and `:8886` (reads:
`dispatchKind !== "authoring"`, `dispatchKind === "authoring"`), `:6517`/`:6535` (`mode:` literals)
and `:8982` (a message string) — are all correctly outside the keyed set under either keying, and
the row's "a literal grep for `dispatchKind: "authoring"` returns 3, not 4" is still true.

**TDD order, `[Fake first]` and same-batch same-new-file are all unchanged.** No test file changed
owner, no new file entered the manifest, and every implementation row still has a preceding red-test
row naming the same suite. LI-10's added clause lands in a suite LI-10 already owns and LI-19
already greens; LI-23's added clause is a cross-reference and asserts nothing new.

## Dependencies

**The batch column did not move, and I confirmed that rather than assuming it.** No task row was
added, removed, or had its `Deps` cell edited this round, and no edge-rationale row changed. My v2
re-derivation over all 23 rows — 23 unique ids, every dependency resolving to a declared row, the
graph acyclic, `batch == max(dep batch) + 1` for every row — therefore still stands, as does v3's
re-check of the two places the previous round could have disturbed it.

**None of this round's three row edits creates a new ordering obligation.** I checked each against
the dependency it would need:

- **LI-10's healthy-`null` clause** asserts over `DIVERGENT-CORPUS`, a fixture LI-02 already owns
  and LI-10 already declares (`Deps: LI-02, LI-06`). It adds an assertion to an existing test over
  an existing fixture in an existing suite — no new file, no new symbol, no new edge. It is red at
  batch 5 for the same reason the rest of the suite is red (no symbol under test) and greens at
  batch 11 with LI-19, unchanged.
- **LI-23's back-pointer** is a cross-reference in prose. It asserts nothing and creates nothing;
  `LI-23 → LI-06` remains the slack fixture-matrix edge v0.3 split out.
- **LI-01's re-key** changes *how* one batch-1 assertion computes its observed set, not what the
  suite reads. `learningsPremises.test.js` still parses `orchestrate-dev.js` at HEAD and still has
  no dependency (`Deps: —`, batch 1). The re-key touches no other row's inputs.

**The new naming rule is a constraint on later batches, and it introduces no edge either.** The
`LI-T-*` rule makes the *absence* of `LI-AT-` titles in six suites a `LI-T-SUITEMAP` gate input at
batch 6. Every one of those six files already exists by the end of batch 5 (`Premises` b1,
`CaptureScript` and `PredicatePin` b2, `BaselineGuard` b4, `ArmInventory` b5) or is the suite map
itself (b6), so the rule is satisfiable at the batch it is enforced in without any new `Deps` edge
— the same argument v3 accepted for the directory closure, and it is unchanged by stating the rule
in prose rather than leaving it implicit.

**DoD 13 and P-A-6…P-A-8 are outside the DAG by construction, and correctly so.** DoD 13 is a
completion-note obligation on LI-01, not a task; P-A-6/P-A-7 constrain *when a PROPERTIES commit may
land*, and P-A-6 says so explicitly ("No task row in this PLAN owns either"). Neither adds a node,
and neither can move a batch. P-A-6's scheduling claim is consistent with the ledger: a PROPERTIES
suite is honestly red until LI-21 greens the last arm at batch 13, which is exactly the batch at
which P-A-3's "commit once green" becomes satisfiable and the batch at which the expected-red
ledger reaches empty. The two statements agree.

## Verification

**The batch-6 gate row and the §T.5 green column now say what the batch ladder says (F-03 closed).**
Both changed in the same round and to the same wording. The gate row reads
"`learningsSuiteMap.test.js` statically parsing the `learnings*.test.js` directory, whose six
AT-bearing suites all exist at the end of batch 5 and whose other six matching files register
`LI-T-` titles only, so the closure is already equal to six at authoring", and §T.5's green column
reads "static parse of the twelve matching `learnings*.test.js` files, six of them AT-bearing, no
symbol under test". Three statements of the same fact — ladder, gate row, §T.5 — now agree, and the
one a dispatcher reads is no longer the narrow one. The green-terminal row's other conjunct ("every
pre-existing test's status is unchanged from the measured baseline") survived the edit intact.

**The naming rule closes the gap the closure opened (F-02 closed), and it closes it at the right
altitude.** Stating it once as a universal rule in §Test-name namespacing is better than enumerating
two more rows' test names, because it also covers a *seventh* suite nobody has thought of yet. The
paragraph does the two things that make it enforceable: it names the mechanism that enforces it
(`LI-T-SUITEMAP`'s equality at six) and it names the latency (batches 1 and 4 are green-terminal, so
a slip surfaces at batch 6 "in a message pointing at the suite map rather than at the file that
caused it"). That last clause is the operational note an implementer debugging the red will need.

One residue: the older sentence two paragraphs up still enumerates the TSPEC-local names as
"`LI-T-PIN-1`, `LI-T-RETRY-1…3`, `LI-T-IGNORE`, `LI-T-WORKTREE`, `LI-T-SUITEMAP`" and does not
include `LI-T-ARMS-1…3`, which LI-23's row names and DoD 3 relies on. The new paragraph's universal
quantifier makes the list illustrative rather than a catalogue, so nothing is unenforced — but the
list now sits three lines above a rule whose whole point is that the `LI-T-`/`LI-AT-` partition is
checked by set equality, and a reader may take it for the enumeration. Filed as F-03, Low.

**LI-10's new clause is the positive half I asked for, and it is falsifiable as written.**
"`dispatches[i].corpusOutcome === null` asserted on dispatches 1, 2 and 4" is an exact value on named
rows of a named fixture — not "healthy dispatches record no outcome", which `undefined` would
satisfy. The row states the mutant it kills ("an implementation recording `undefined`, `""` or
omitting the key entirely on healthy dispatches is green everywhere"), which is the right form: the
clause exists because a specific wrong implementation would otherwise pass. Paired with LI-23's
non-`null`-scoped set equality, the `corpusOutcome` domain now has both halves — the catalogue
equality over observed non-`null` values, and the exact healthy value on the majority path.

**P-A-3's universe is now the twelve suites (F-04 closed), and the ledger's arithmetic is unchanged
by the correction.** The count moved from fourteen manifest rows to twelve ledger-eligible suites;
the batch-13 row still shrinks to empty over the same set it always did, because the two rows
removed from the count — `__tests__/helpers/learningsFixtures.js` and
`__tests__/fixtures/learnings-baseline/` — never appeared in a ledger row. This was a wording fix
with no gate consequence, and it did not acquire one.

**DoD 13 is a record obligation, not a test, and the PLAN says so.** "Neither record is a test — the
four absence measurements at HEAD stop being checkable after batch 4 by construction (that is
exactly why they left the standing suite, PM F-07)". I want to be explicit that I accept this under
my lens: the four absence claims are falsified on schedule by this PLAN's own tasks, so no standing
oracle *can* hold them, and a DoD clause requiring the note is the strongest available mechanism.
The positive standing oracle over the same ground still exists where it can — `LI-T-IGNORE`
conjunct (1) after LI-04 — so DoD 13 is covering only the genuinely unassertable residue.

**Nothing in the coverage material, the porcelain instrument, or the halt conditions changed.** My
v2/v3 measurements stand: 98 suites, 3828 passed, `orchestrate-dev.js` at 88.14 % branch,
`--per-file --branches 85` exiting 0, and `consumerCleanup.test.js:149-153` running
`git status --porcelain` with no `-uno`. H-1 is untouched and still names "a fifth `dispatchKind:
"authoring"` site" as its halt trigger — which is precisely the claim F-01 is about, since after the
re-key it is the *keyed set* that decides whether a fifth site is seen.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | LI-01's re-keyed P-2a assertion is a set equality **over keys**, and the key is not unique-by-construction: a fifth authoring dispatch that shares a pair with an existing site (a second inline-template retry inside `erratumRound` is the plausible one) collapses into an existing member and the set still equals four. H-1's trigger — "a fifth `dispatchKind: "authoring"` site exists" — is then not detected at batch 1. Add a cardinality conjunct: the number of authoring dispatch sites is **4**, alongside the keyed set equality | LI-01 (P-2a); H-1 |
| F-02 | Low | Local | The named key's second component, "prompt-source symbol", is not readable at the dispatch expression for two of the four sites: `converge`'s slot is a conditional over the local `basePrompt`, bound from `creatorPrompt(…)` one line earlier (`orchestrate-dev.js:13656`, dispatch at `:13657`), and `reviewLoop` passes `optPrompt`, bound from `optimizerPrompt(…)` at `:7660` (dispatch at `:7663`). The row does not say whether the test resolves the binding or keys on the slot expression as written | LI-01 (P-2a) |
| F-03 | Low | Local | §Test-name namespacing's enumeration of TSPEC-local names (`LI-T-PIN-1`, `LI-T-RETRY-1…3`, `LI-T-IGNORE`, `LI-T-WORKTREE`, `LI-T-SUITEMAP`) omits `LI-T-ARMS-1…3`, which LI-23's row names and DoD 3 relies on. The new universal rule three lines below makes the list illustrative, but it reads as a catalogue next to a set-equality gate | §Test-name namespacing |

### F-01 (Medium) — the re-key made the equality injective, not count-preserving

The re-key is right and the old key was wrong: `erratumAuthorPrompt`'s dispatch (`:12861`) and the
land-proof retry (`:12955`) really do share `(erratumRound, argument position)`, and the row's
supporting anatomy is exact (`missingAgainst` opens `:12919`, closes `:12928`; the retry sits in the
`if (stillMissing.length > 0)` block at `:12931`). I verified the four new pairs are distinct at
HEAD. Nothing about the fix is wrong.

What the round changed without saying so is the *shape* of the oracle. A set equality over raw sites
is count-preserving by construction — you cannot add a site without adding a member. A set equality
over **keys** is not: two sites sharing a key contribute one member. The row's own history is the
evidence that key collisions happen here — PM F-09 exists because two of the four sites already
collide under the obvious key. So the failure mode is not hypothetical:

> A future change adds a second bounded retry inside `erratumRound`, dispatching with another inline
> template. Under `(enclosing named function, prompt-source symbol)` it keys as
> `(erratumRound, inline template)` — the pair the land-proof retry already occupies. The observed
> key set is still the four expected pairs. `learningsPremises.test.js` stays green. H-1's trigger
> fires nowhere, and the fifth authoring site reaches LI-11's composition-site equality at batch 12
> — eleven batches after the point this row exists to catch it at.

The row anticipates the general risk ("Any injective structural key serves; what may not survive is
a key two of the four sites share") but states it as a constraint on *choosing* the key today, not
as an assertion the suite makes tomorrow. Injectivity measured once at batch 1 is a premise; H-1
needs it to be an oracle, and the same row's whole argument for asserting P-2a at batch 1 rather
than batch 12 is that a premise a human measured once is exactly what a standing test replaces.

**What to change:** one clause in LI-01's row — *"and the site **count** is asserted equal to 4
alongside the key set, so a fifth site that happens to share a key with an existing one reds here
too; the key set equality names *which* site moved, the count is what guarantees the gate sees a
fifth site at all"*. No new task, no new fixture, no batch change: the parse that enumerates the
sites already produces the list the count is taken over. (Equivalently: assert the enumerated site
list as a 4-element sequence, which is count-preserving and keyed in one assertion.)

### F-02 (Low) — the named key needs a binding hop at half its sites

The four pairs the row enumerates are written as if the prompt symbol were visible at the dispatch.
At two sites it is not:

| Site | What a parse of the dispatch expression sees | Where the named symbol lives |
|---|---|---|
| `:12861` | `basePrompt: erratumAuthorPrompt({…})` | at the slot ✅ |
| `:12955` | `basePrompt:` a bare template literal | no symbol — the row calls it "the land-proof-retry inline template" |
| `:13657` | `basePrompt: creatorPromptExtra ? …: basePrompt` | `const basePrompt = creatorPrompt(phaseId, …)` at `:13656` |
| `:7663` | `runWrapped(optimizer, optPrompt, doc, "authoring", …)` | `const optPrompt = optimizerPrompt(…)` at `:7660` |

Nothing here breaks: the four slot expressions as written (`erratumAuthorPrompt(…)` call, template
literal, conditional over `basePrompt`, identifier `optPrompt`) are themselves four distinct values,
so an implementer who keys on the slot expression head gets an injective key without resolving any
binding. But that is a second, different key from the one the row names, and the row does not say
which is intended — so the implementer either writes a local-binding resolver (a real parser, at
batch 1, for a premise suite that is supposed to be cheap) or silently substitutes a key the PLAN
did not sanction.

**Fix:** one parenthetical — *"read the prompt source from the dispatch's prompt slot as written
(call callee, template literal, or bound identifier); at `converge` and `reviewLoop` that identifier
is `basePrompt` / `optPrompt`, whose binding names `creatorPrompt` / `optimizerPrompt` one line
above — either reading is injective, and the suite need not resolve the binding"*.

### F-03 (Low) — one enumeration did not pick up `LI-T-ARMS-1…3`

§Test-name namespacing's list of TSPEC-local names predates LI-23 and was not extended when the arm
inventory's three tests were named. The new universal paragraph makes the rule sound regardless, and
`LI-T-SUITEMAP` enforces the partition mechanically, so nothing is unenforced — this is a
readability finding, and I file it only because the surrounding material is now a gate input and an
incomplete-looking enumeration next to a set-equality rule invites a reader to treat the list as the
contract. **Fix:** add `LI-T-ARMS-1…3` to the list, or replace the list with "…and every other test
this feature adds, per the rule below".

## Questions

My v3 Q-01 is answered by P-A-7, and answered as a bar rather than a preference: a red PROPERTIES
suite's ledger rows are amended **in this document, before the batch they apply to**, under the
generalised rule "a live table is amended by an edit to this PLAN, committed before the run it
governs" — which now covers the manifest (P-A-5) and the ledger (P-A-7) with one sentence instead of
two. That is the answer I hoped for and it is enforceable by the mechanism it names.

| ID | Question |
|----|---------|
| Q-01 | P-A-6 says the PROPERTIES **suite** lands "at the first point the suite is green, which in practice is after LI-21 (batch 13)". Batch 14 is a refactor batch. If the PROPERTIES suite lands between batch 13 and batch 14, it is inside batch 14's unqualified full-suite green gate — which is the right place for it — but it is also new material inside the tree `coveredViolations` walks. Is landing it *after* batch 14 the safer default, or is being covered by batch 14's gate the point? One clause either way; not gating |

## Positive Observations

- **F-01 was resolved at the value, not at the concept.** The row could have said "the record suite
  also covers healthy dispatches". It says `dispatches[i].corpusOutcome === null` on dispatches 1, 2
  and 4, names the fixture that produces them, and states the mutant the clause kills. That is a
  clause a test gets written from, and it closes the pairing LI-23's non-`null` scoping depends on
  from both ends — LI-23 now points at LI-10 by name, so neither row can be read alone and
  misunderstood.
- **F-02 came back as a rule rather than as two row edits.** I offered "name the tests in LI-01 and
  LI-06, or state the convention once". v0.4 chose the second and extended it: the rule is
  universally quantified over "every other test this feature adds", it is labelled "a gate input,
  not a style preference", and it names the detection latency (green-terminal batches 1 and 4, red
  surfacing at batch 6 pointing at the wrong file). A seventh suite nobody has thought of is covered
  by that sentence; two row edits would not have covered it.
- **The PM F-09 re-key is a good catch and the PLAN's anatomy of it is exact.** I re-measured every
  claim in it — both `erratumRound` dispatches, the `missingAgainst` arrow closing at `:12928`
  before the retry at `:12955`, `converge` at `:13628`, `reviewLoop` at `:7266` — and each is true
  of HEAD. The row also does the thing I most value: it states *why the obvious key fails*, so the
  next person to touch this assertion cannot reintroduce the collision by accident.
- **P-A-7 generalises rather than duplicates.** Two live tables, two ways they could be amended, one
  rule: "a live table is amended by an edit to this PLAN, committed before the run it governs." That
  is one sentence covering the manifest and the ledger, and it is the same principle P-A-5 stated
  ("a contract the dispatcher cannot read enforces nothing") applied to a second table rather than
  restated for it.
- **DoD 13 preserves the only records this feature cannot assert.** The four absence claims are
  falsified on schedule by this PLAN's own tasks — that is why they left the standing suite — so a
  DoD clause is genuinely the strongest available mechanism, and the PLAN says so rather than
  pretending a test could hold them. The positive standing oracle over the same ground still exists
  where one can (`LI-T-IGNORE` conjunct (1)).
- **Nothing regressed.** No task row added or removed, no `Deps`, `Batch`, `Test File` or manifest
  cell changed, the batch DAG untouched, the expected-red ledger unchanged and still empty at batch
  13, the coverage material and porcelain instrument untouched, and the three gate/ladder/§T.5
  statements of the batch-6 justification now agree instead of two-of-three. I checked each rather
  than assuming it.

## Recommendation

**Approved with minor changes**

All four v3 findings are resolved, and no High finding is open from any round. I re-derived nothing
that did not change and re-measured everything that did: LI-10's healthy-`null` clause against the
`DIVERGENT-CORPUS` shape its own row declares, the four re-keyed P-2a sites and their enclosing
functions at `orchestrate-dev.js:12861` / `:12955` / `:13657` / `:7663` inside `erratumRound`
(`:12790`), `converge` (`:13628`) and `reviewLoop` (`:7266`), the `missingAgainst` arrow's extent
(`:12919`–`:12928`) that the row's nesting argument rests on, the five non-call-site `"authoring"`
occurrences the keying correctly excludes, the absence of any `learnings*` file under
`pdlc/workflows/__tests__/` at HEAD, and the row tails of every changed task to confirm no
`Batch`/`Deps`/`Test File` cell moved.

One Medium and two Lows, none gating, and all three sit on the one substantive new mechanism this
round introduced:

1. **F-01** — add a cardinality conjunct to LI-01's P-2a assertion. The re-key made the key
   injective at HEAD; it did not make the equality count-preserving, so a fifth authoring site that
   shares a key with an existing one (a second inline-template retry inside `erratumRound`) leaves
   the set at four and H-1's trigger undetected until batch 12. One clause; no new task, fixture or
   batch.
2. **F-02** — say which reading of "prompt-source symbol" the suite transcribes. At `converge` and
   `reviewLoop` the named symbol is one local-binding hop from the dispatch expression; both
   readings are injective, so this is a one-parenthetical clarification, not a mechanism change.
3. **F-03** — add `LI-T-ARMS-1…3` to §Test-name namespacing's enumeration, or make the list
   explicitly illustrative.

One upstream defect remains open and is routed as an erratum rather than charged to this verdict:
TSPEC §D.1's domain-membership wording — "one test per domain asserts that every value it ever
carries is a member of that field's catalogue" (`TSPEC:592`) — is still false for the
`corpusOutcome` domain as §D.2 defines it (`TSPEC:612`, healthy value `null`). I routed it in v2 and
again in v3; the TSPEC's last commit touching the file is still `ccc739d1`. The PLAN has now worked
around it correctly at its own altitude in **both** directions — LI-23 scopes the equality to
non-`null`, LI-10 asserts the healthy `null` explicitly — while the TSPEC sentence they derive from
still says the unqualified thing. It belongs to the TSPEC, not to this verdict.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508
APPROVAL-HASH-NORMALIZED: sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508
REVIEWED-COMMIT: f08bfbf8addce91a7d5342e016b2e7ba63b694cf
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:a4f775bd64c167994ba62897ffe6c78efd82d017369bdf632c0f49b858dfa9a5
UPSTREAM-STATE: TSPEC sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
UPSTREAM-STATE: DECISIONS sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
