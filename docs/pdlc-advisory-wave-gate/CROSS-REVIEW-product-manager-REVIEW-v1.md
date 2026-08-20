# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** feature diff for `pdlc-advisory-wave-gate` (branch `feat-pdlc-advisory-wave-gate` vs `main`), against `docs/pdlc-advisory-wave-gate/`
**Date:** 2026-08-20
**Iteration:** 1

## Scope and Method

Product lens only: requirements traceability, scope compliance, acceptance-criterion fidelity, and
whether each operator-visible artifact an AC promises is assembled by a **production** caller that a
test actually drives. Technical design, test strategy and code quality are the SE/TE lenses.

What I read: `REQ-pdlc-advisory-wave-gate.md` §6 (AC-1.1 … NFR-6), `FSPEC` §5 (E-rows) and its AT
catalogue, `TSPEC` §3.2/§3.4/§3.6/§4.2/§4.5/§5.5, `PROPERTIES` (79 property ids), `PLAN` A6-18/A6-21,
and the branch diff `main...feat-pdlc-advisory-wave-gate` (273 files). Every claim below is anchored
in shipped source, not in a document.

Verification performed:

- Ran the feature's two owning suites: `npm test -- __tests__/advisoryWaveGate.test.js
  __tests__/waveExecution.test.js` → 191 passed, **1 todo**, 0 failed.
- Traced each operator-visible artifact to its production assembler: the run report
  (`buildFinalReport`, `orchestrate-dev.js:15979`), the advisory record (`renderAdvisoryEntry`,
  `:3417`), the escalation log (`renderEscalationEntry`, `:3536`), the wave commits
  (`commitPaths` calls in the wave loop, `:15206`–`:15250`), the later-task dispatch prompt
  (`waveImplementPrompt`, `:10203`), and the inapplicability notice (`:14776`).
- Swept all 79 `PROP-*` ids for a citation anywhere under `pdlc/workflows/__tests__/` and
  `pdlc/engine/`; then hand-verified the behavioural presence/absence of each miss rather than
  trusting the citation count. Findings below name only misses I confirmed behaviourally.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | E-6's three script-checked conjuncts are absent from the shipped `apply` — the envelope collapses to "any path a later wave owns" | AC-3.1 (E-6), NFR-1, AC-3.5 |
| F-02 | High | Local | A6 escalation-log entries carry no root-cause class, so `plan-ordering-defect` is not countable from the durable log | AC-6.2, AC-6.4 |
| F-03 | High | Local | The advisory record entry names neither the wave, nor the root-cause class, nor an E-6 repair's paths and owning task | AC-6.1, AC-4.6 |
| F-04 | High | Local | AC-3.3's four prohibitions (f)–(i) are refused by no test, and `A6_PROHIBITIONS` has zero production readers | AC-3.3, AC-3.5, AC-4.3, AC-4.5 |
| F-05 | High | Local | AC-1.5's inapplicability cardinality has no test at all — including the zero-count discriminator that makes the other arms falsifiable | AC-1.5 |
| F-06 | High | Local | AC-4.6's "the later task's dispatch is told" clause is assembled in production but driven by no test | AC-4.6 |
| F-07 | Medium | Local | The capture-failure escalation oracle is weakened to `toBeDefined()` where the property demands containment of the failing git verb | AC-6.2, AC-3.4 |
| F-08 | Medium | Process | AC-5.1's restoration oracle ships with its `.gitignore`d-path arm as `test.todo`, blocked on an upstream question | AC-5.1 |
| F-09 | Low | Local | Stale "five rows" prose survives the six-seam catalogue change | AC-1.1 |
| F-10 | Low | Local | A production-path fixture uses an invented root-cause class outside AC-2.2's closed set | AC-2.2 |

### F-01 (High) — E-6's decidable rule is enforced only in the agent prompt

AC-3.1 gives E-6 a two-conjunct decidable rule: *"the gate output names a symbol or artifact that a
later task's PLAN row **already undertakes to produce**, **and** every path the proposal would change
is a member of that later task's owned-path set."* NFR-1 then binds it: *"Every boundary in
REQ-AWG-03 and REQ-AWG-04 is enforced in the workflow script, never only in an agent prompt."*

Shipped, the first conjunct exists only as prompt text. `buildA6SeamOps.prompt`
(`pdlc/workflows/orchestrate-dev.js:3053-3054`) asks the agent to state `PROMOTES: {symbol}` and
`PROMOTES-TASK: {taskId}` — and nothing ever reads either trailer: `grep -rn PROMOTES
pdlc/workflows/orchestrate-dev.js` returns exactly that one prompt line. `apply`
(`:3079-3086`) is the whole check:

```js
ledgerAnchor.value = invocations.length;
const produced = await producedPathsImpl();
return { ok: produced.length > 0 };
```

`declaredScope` is seeded as the **union** `E-5 ∪ E-6` over *every* later wave
(`:3021-3025`, via `laterOwnedPaths`), so `classifyEnvelope`'s membership test permits a change to
any later task's owned paths regardless of which task the promotion belongs to, whether that task's
PLAN row undertakes to produce the symbol, and whether the gate output named it at all. E-6's
second conjunct ("that **later task's** owned-path set", singular) is therefore also only
approximated by the union.

This is a product-fidelity gap, not a design nit: E-6 is the one envelope member that licenses A6 to
write into paths the failing wave does **not** own, and the rule REQ wrote to bound it is the part
that did not ship. TSPEC §3.4 already specifies the fix precisely — *"E-6's symbol half is
script-checked, in three conjuncts … Any conjunct failing refuses `out-of-envelope`"* — and
PROPERTIES carries it as PROP-ENV-08 with a named companion case. Neither is implemented; the only
test citing PROP-ENV-08 (`__tests__/advisoryEnvelope.test.js:380`) is a guard-path test that
cites the id in passing and asserts nothing about the conjuncts.

**To resolve:** implement TSPEC §3.4's three conjuncts inside `apply` (parse `PROMOTES-TASK` to a
strictly-later task, require the symbol in that task's `description`, require the symbol in the
captured gate output, refuse `out-of-envelope` on any miss), narrow the E-6 half of `declaredScope`
to that named task's owned set, and add PROP-ENV-08's positive plus its out-of-set companion.

### F-02 (High) — the escalation log carries no root-cause class

AC-6.2: *"an entry is appended to the escalation log **carrying the root-cause class** alongside the
fields the tier already requires."* AC-6.4 rests on it: *"a `plan-ordering-defect` classification …
is countable per feature from the durable escalation log without reading run logs."*

`renderEscalationEntry` (`orchestrate-dev.js:3536-3569`) renders Feature, Seam, Refusal reason,
Diagnosis, Proposed action, Evidence, Pipeline state — no class field. The tier's one channel for a
class is `escalationDecision`'s `classificationSummary` (`:3624-3632`, `"; classified …"`), fed by
the optional `_summarise` seam op (`:3967-3971`). `runWaveGateSeam` passes **no** `_summarise` into
`runAdvisorySeam` (`:3341-3355`), so `summary` is undefined and the clause is never emitted. The
class A6 does parse (`capturedRootCause`, `:3332`) is carried only onto `haltFields` (`:3376`),
which lives in the run report and dies with the run — precisely the artifact AC-6.4 says is *not*
durable.

Net effect: `docs/_queue/ESCALATIONS.md` — the corpus AC-6.4 names as the durable one — is
class-free for A6, so the recurring-wave-ordering signal the criterion exists to create cannot be
counted. PROP-REC-03 states the obligation and PLAN A6-18 names `advisoryEscalationLog.test.js` as
an edited file for exactly this; that file is untouched on the branch
(`git diff --stat main...HEAD` lists no `advisoryEscalationLog.test.js`).

**To resolve:** thread the captured class into the escalation entry (either a `_summarise` for A6
returning the class, or a declared field), and land PROP-REC-03/PROP-REC-04/PROP-REC-07 in
`advisoryEscalationLog.test.js` as PLAN A6-18 allocates.

### F-03 (High) — the advisory record omits the wave, the class, and the promotion

AC-6.1: *"an entry is appended to the feature's existing advisory record **naming the wave, the
root-cause class**, the envelope determination, the action taken or refused, and the gate-output
citation."* AC-4.6 adds: *"The repair's paths and the later PLAN task that owns them **are named in
the advisory record** (AC-6.1)."*

`renderAdvisoryEntry` (`:3417-3446`) emits exactly Seam, Confidence, Envelope, Disposition, Model,
plus Diagnosis and Evidence prose. There is no wave number, no root-cause class, no repair-path or
owning-task field, and `runWaveGateSeam` passes none: the disposition it hands `appendAdvisoryEntry`
is the tier's seven-field shape. The code comment at `:3325-3329` states the class is captured "so a
terminal disposition — resolved or escalated — can name it **on the record** and in the halt fields";
only the second half happened.

An operator reading `ADVISORY-{feature}.md` after a multi-wave run therefore cannot tell which wave
an entry belongs to, which is the first question AC-6.1 orders the record to answer, and PROP-GATE-08's
"the advisory record must name the repair's paths and the later PLAN task owning them" is unmet.

**To resolve:** add the wave, class, and (on an E-6 resolution) repair-paths/owning-task to the
entry, and assert the field set by set-equality against the transcribed literal as PLAN A6-18's
record red step requires — containment would pass a dropped field.

### F-04 (High) — AC-3.3's prohibitions are asserted by no test, and the catalogue has no reader

AC-3.5 is explicit: *"Each excluded operation enumerated in AC-3.2 and AC-3.3 is asserted by **its
own test**."* AC-4.5 adds the paired-positive rule. PLAN A6-18 sizes it: *"Prohibitions `(f)`…`(i)`:
eleven tests, id set compared by set-equality against `A6_PROHIBITIONS`, every one carrying its
paired positive per AC-4.5."*

Shipped: `A6_PROHIBITIONS` (`orchestrate-dev.js:1964`) is asserted set-equal to `["f","g","h","i"]`
and frozen (`__tests__/advisoryEnvelope.test.js:344-347`) and that is all. `grep -rn A6_PROHIBITIONS`
over the repository returns the declaration, the generated `dist/pdlc-cli.mjs` copy, and that one
test — **no production code path reads it**, and `advisoryWaveGate.test.js` never mentions it
(`grep -n A6_PROHIBITIONS __tests__/advisoryWaveGate.test.js` → no output). None of the eleven
refusal cases exists: no test drives A6 to a PLAN edit, a task-table edit, an ownership-manifest
edit, a `testCommand`/post-wave-command/post-wave-pathspec change, a commit, a push, a tag, a
wholly-outside path, or a partly-outside path.

Two distinct product problems ride on this. (a) The exported catalogue is dead config in the sense
DC-07 names — a declared contract with no production caller, whose only assertion is that it equals
itself. (b) AC-3.3's four prohibitions are the boundary that keeps A6 out of the PLAN and out of git
history; asserting the *letters* proves nothing about the *refusals*. The tier-wide exclusions do
hold in production and are tested — `runAdvisorySeam` builds its context with
`guardPaths: effectiveGuardPaths(undefined)` (`:4034`), so AC-3.2's clause (e) binds A6 — but that
covers AC-3.2, not AC-3.3.

**To resolve:** land the eleven refusal tests with their paired positives against `runWaveGateSeam`,
and either wire `A6_PROHIBITIONS` into the refusal path that consumes it or drop the constant so no
reader mistakes it for an enforced contract.

### F-05 (High) — AC-1.5's cardinality oracle is untested, discriminator included

AC-1.5 makes the observable explicit: *"The observable is **cardinality on a named surface**, not
mention … exactly one inapplicability notice, not per wave, naming every absent prerequisite …
none in a run where A6 applies."* AT-01-5 and PROP-SEAM-07 restate it, and PLAN A6-18 allocates four
arms: BL-03 alone, BL-04 alone, both absent, and **the zero-count discriminator**.

The production carrier is correctly built: the config read is hoisted above the `!waveMode` branch
(`orchestrate-dev.js:14756-14761`) and the causes are joined into one `emit`
(`:14767-14778`), which is the right shape. But no test counts anything. `grep -rn "inapplicab"
pdlc/workflows/__tests__/` returns nothing; `grep -rn "worktree exception path"` returns two
incidental mentions in `implPhase.test.js:301` and `waveExecution.test.js:430`, neither of which
counts statements or asserts the both-absent single-statement shape. PROP-SEAM-07 is uncited
anywhere under `__tests__/`.

The missing arm that matters most is the zero-count discriminator PLAN names: *"without it a carrier
that emits the notice unconditionally satisfies (i)–(iii) and nothing catches it."* As shipped,
AC-1.5 is a claim with no falsifier — the one thing the criterion's own text says it must not be
("silently indistinguishable from a quiet seam").

**To resolve:** land the four arms as PLAN A6-18 allocates, counting statements over the whole
notice surface with no authorship filter, including the run-where-A6-applies zero case.

### F-06 (High) — the later task is told about a promotion by production code no test drives

AC-4.6: *"The repair's paths and the later PLAN task that owns them are named in the advisory record
(AC-6.1), and **that later task's dispatch is told which of its owned paths already carry the
promotion**, so it revises what exists rather than rediscovering it."*

The production assembler exists and is correctly placed: `waveImplementPrompt(task, featureName,
promotions)` builds the clause (`orchestrate-dev.js:10203-10219`), and the wave loop populates
`promotions` at commit time (`:15239`) so no task is told about a repair not yet on the branch.
That much is good design. What is missing is any test that drives it: `grep -rn "already committed a
fix into paths"` and `grep -rn "waveImplementPrompt"` over `pdlc/workflows/__tests__/` both return
nothing, and PROP-GATE-09 — which requires the positive clause **and** a byte-identical negative when
the map has no row — is uncited.

`waveExecution.test.js:1128` (AT-04-5) does drive the production path for the *commit* half, and
does it well: it asserts the dedicated `chore(test-feat): wave 1 advisory promotion (T2)` commit, the
pathspec `["add","--","src/two.js"]`, and that T1's own `add` was not widened — on a fixture whose
later-task path sits outside every configured post-wave pathspec, so it is genuinely red against
pre-A6 behaviour. But that same test asserts neither of AC-4.6's other two clauses (the record
naming, F-03; the dispatch clause here), so half the criterion ships unproven.

**To resolve:** extend AT-04-5 (or add PROP-GATE-09's own test) to assert the dispatched prompt for
the later task contains the promotion clause naming its paths, plus the byte-identical negative.

### F-07 (Medium) — a content-free oracle where the property demands containment

PROP-REST-08 requires, on the capture-failure run, *"an escalation entry is written whose text
**contains the failing git verb** observed on the `_git` double."* The shipped test asserts only
existence (`__tests__/advisoryWaveGate.test.js:1533-1534`):

```js
const escalationEntry = files.files["docs/_queue/ESCALATIONS.md"];
expect(escalationEntry).toBeDefined();
```

An entry whose decision sentence lost the diagnostic — the operator-relevant content — passes. The
record half of the same test is properly transcribed (`| Disposition | escalated |`, `| Model | n/a |`),
which is what makes this one stand out as a weakened oracle rather than a design choice.

**To resolve:** assert containment of the observed failing verb, as the property specifies.

### F-08 (Medium, Process) — AC-5.1's ignored-path arm ships as `test.todo`

The suite reports `1 todo`: `__tests__/advisoryWaveGate.test.js:500`, the `.gitignore`d-path restore
round trip, marked pending on TSPEC §6 OQ-7. The shipped restore runs `git clean -fd`
(`orchestrate-dev.js:12408`), not `-fdx`, so a `.gitignore`d file A6 wrote survives a restore — while
AC-5.1 says the tree must be *"observably identical to its state immediately before A6 acted"* with
no carve-out, and FSPEC BR-9 / AT-05-1 say "tracked and untracked alike, generated outputs included."

The pending marker is honestly placed and the reasoning in the surrounding comment is sound; the
defect is upstream, not here, and I am routing it as an erratum on REQ and FSPEC rather than scoring
it against this implementation. I record it Medium/Process because shipping a P0 reversibility
criterion with an unresolved boundary is a state the pipeline should surface, not absorb.

### F-09 (Low) — stale cardinality prose after the catalogue went to six

`orchestrate-dev.js:3466` still reads *"so five rows always appear"* and `:14393` *"an
enabled-but-quiet run still carries five zero rows"*, after `ADVISORY_SEAMS` became six members
(`:1952`). The behaviour is correct and tested by literal transcription
(`advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:496`); only the prose drifted.

### F-10 (Low) — a fixture uses a root-cause class outside AC-2.2's closed set

`waveExecution.test.js:1135` builds its A6 reply with `rootCause: "cross-file-drift"`, which is not a
member of AC-2.2's closed, ordered set (`plan-ordering-defect`, `wave-internal-defect`,
`environmental`, `unclassified`, transcribed at `orchestrate-dev.js:1956-1961`). Nothing validates
`haltFields` at that call site so the test passes, but a fixture is documentation: a reader takes the
vocabulary it uses as authorised. Use `plan-ordering-defect`, which is also the class an E-6
promotion actually carries.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: was the E-6 conjunct check consciously deferred (in which case it belongs in DECISIONS with a re-evaluation trigger, and REQ AC-3.1's rule needs restating to the union semantics actually shipped), or simply missed in A6-14? The answer changes whether this is a code fix or a REQ erratum. |
| Q-02 | F-02/F-03: AC-6.1 and AC-6.2 add fields to two artifacts the advisory *tier* owns. Is the intended shape a widened `renderAdvisoryEntry`/`renderEscalationEntry` (a tier-level change touching A1–A5's fixtures) or an A6-only `_summarise`-style channel? TSPEC §3.2's comment at `orchestrate-dev.js:3327` implies the latter but does not say. |
| Q-03 | F-08: is the pipeline willing to ship a P0 reversibility criterion (AC-5.1) with one arm pending an upstream question, or should Phase CR hold until OQ-7's erratum lands? I have routed the erratum; the hold decision is the orchestrator's. |

## Positive Observations

- **The trigger is structural, not conditional, and it is proven at the production call site.**
  A6 is reachable from exactly one place — the wave-mode, script-gate, ordinary-wave, red-first-pass
  test-gate branch (`orchestrate-dev.js:15125-15150`) — so AC-1.2 and AC-1.3 are enforced by control
  flow rather than by an `if` that could drift. `waveExecution.test.js:935` and `:957` drive `main`
  itself to prove a post-wave failure and the V-wave never reach A6.
- **AC-4.4's re-gate oracle is implemented as sequence equality, exactly as written.**
  `gateSequenceFor` reads the sequence from `implConfig` (`:3122-3124`), `sameSequence` compares
  length *and* order (`:3115-3119`), and step 6 refuses a `resolved` outcome whose ledger did not
  grow by one full sequence since the last `apply` (`:3360-3366`). The six-token two-attempt case is
  asserted literally (`advisoryWaveGate.test.js:1542`). This is the criterion most easily satisfied
  by a set-equality shortcut, and the shortcut was refused.
- **AC-4.1's conjunct (iii) is proven by mutation, not by prose.** The unreachable
  "no gate invocation follows the repair" case is driven by replacing one member of a *real*
  `buildA6SeamOps` result (`advisoryWaveGate.test.js:1654`), which is the only honest way to
  falsify a prohibition that an ordinary run cannot reach.
- **AC-1.4's inertness covers the snapshot, not just the dispatch.** The tier gate is duplicated
  inside `runWaveGateSeam` (`:3222-3226`) ahead of `captureTreeSnapshot`, and it consumes an
  already-resolved boolean rather than re-reading `.enabled` — which keeps the disabled-run
  created-file set genuinely identical, and keeps the existing exact-count oracle intact.
- **AC-5.2's "escalation adds information, never control flow" is visible in one line.**
  `throw haltError(testGateMessage, a6.disposition ? { advisory: a6.haltFields } : undefined)`
  (`:15163`) keeps the halt message byte-identical and attaches the diagnostic conditionally, so a
  disabled-tier halt carries no `haltAdvisory` key at all — asserted positively *and* negatively
  (`waveExecution.test.js:1043`, `:1069`).
- **AC-6.3 reaches the operator.** `haltAdvisory` rides the report object (`:16011`) and the CLI
  serialises the whole report to stdout (`dist/pdlc-cli.mjs:16168`), which the skill relays verbatim
  — so the diagnosis and class are on the halt path, not only in a file the operator must find.
- **AC-1.1 is transcribed literally, in both directions.** `ADVISORY_SEAMS` is asserted equal to the
  six-member literal (`advisoryEnvelope.test.js:317`) and the report's row list is asserted equal to
  the same literal (`advisoryRecord.test.js:496`) — a set-equality that a deleted seam fails, with no
  expected value derived from the code under test.
- **AT-04-5's fixture was chosen to be red against today's behaviour.** The promoted path sits
  outside every configured post-wave pathspec (`waveExecution.test.js:133-135` configures none), which
  is the condition FSPEC demands and the easy fixture to get wrong.

## Recommendation

_TBD_

## Verdict

_TBD_
