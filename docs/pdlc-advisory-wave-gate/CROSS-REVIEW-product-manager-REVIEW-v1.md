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

## Questions

_TBD_

## Positive Observations

_TBD_

## Recommendation

_TBD_

## Verdict

_TBD_
