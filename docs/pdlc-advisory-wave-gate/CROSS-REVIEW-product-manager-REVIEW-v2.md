# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the `pdlc-advisory-wave-gate` implementation (branch `feat-pdlc-advisory-wave-gate` vs `main`), delta since `7416d8e7`
**Date:** 2026-08-20
**Iteration:** 2

## Scope and Method

Delta re-review. v1 recorded six High, two Medium and two Low findings and recommended **Needs
revision**; this round reads only what changed since the commit v1 was written on (`7416d8e7`) and
asks two questions: is each v1 finding closed, and did closing it break anything a product criterion
depends on.

The delta is 12 files, +2337/-70 (`git diff --stat 7416d8e7..HEAD`): `orchestrate-dev.js` (+277),
its regenerated `dist/pdlc-cli.mjs` (+277, verified in sync — `node build-runtime.mjs --check`
prints `in-sync pdlc/workflows/dist/pdlc-cli.mjs`), one new test module
(`__tests__/advisoryWaveGateMain.test.js`, +385), and additions to five existing suites. **No
document under `docs/pdlc-advisory-wave-gate/` changed in this delta** other than cross-review
files, so nothing in the approved REQ/FSPEC/TSPEC/PLAN/PROPERTIES moved under the implementation.

Verification performed for this round:

- Ran the six owning suites (`advisoryWaveGate`, `advisoryWaveGateMain`, `advisoryEscalationLog`,
  `advisoryRecord`, `waveExecution`, `advisoryEnvelope`): **363 passed, 1 todo, 0 failed**.
- Ran the whole workflows suite: 4041 passed, 1 todo, 2 failed — both failures in
  `documentOracles.test.js`, both environmental/corpus-shaped rather than caused by this delta
  (F-03 below).
- For each v1 finding, traced the AC to the **production assembler** and then to the test that
  drives that assembler, not the builder's own unit test.
- Ran one ad-hoc probe against the shipped `runWaveGateSeam` to establish the behaviour F-01 below
  describes, rather than inferring it from the code (probe file deleted, not committed).

## Prior-Finding Disposition (v1)

| v1 ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | `parseA6Promotion` (`orchestrate-dev.js:2406`) + the three conjuncts in `buildA6SeamOps.classifyReply` (`:3186-3204`); `advisoryWaveGate.test.js:2042` |
| F-02 | High | **Resolved** | `| Root cause |` row in `renderEscalationEntry` (`:3770`), fed by `annotate` through the driver (`:4070`); `advisoryEscalationLog.test.js:683` |
| F-03 | High | **Resolved** | `Wave` / `Root cause` / `Repair paths` / `Promotes` / `Promotes task` rows (`:3631-3644`) from `annotate` (`:3238-3252`); `advisoryRecord.test.js:592+`, `advisoryWaveGate.test.js:2043-2076` |
| F-04 | High | **Resolved** | `a6ProhibitedPaths` (`:2000`) read by `buildA6SeamOps` (`:3088`); eleven arms + paired positives, `advisoryWaveGate.test.js:2201-2273`, `:2306-2345` |
| F-05 | High | **Resolved** | `advisoryWaveGateMain.test.js:201-288` — four arms, counted, discriminator included |
| F-06 | High | **Resolved** | `waveExecution.test.js:1254`, `:1273` — `mainDev`-driven, byte-identical negative |
| F-07 | Medium | **Resolved** | `captureTreeSnapshot`'s `failure` carrier (`:12571`), verb in the decision sentence (`:3445`); `advisoryWaveGate.test.js:1708`, `:1717` |
| F-08 | Medium (Process) | **Open, unchanged** | `advisoryWaveGate.test.js:501` still `test.todo`; carried forward as F-02 below |
| F-09 | Low | **Resolved** | `:3673` and `:16106` now read six rows / one row per `ADVISORY_SEAMS` member |
| F-10 | Low | **Resolved** | `waveExecution.test.js:2514` — the fixture's vocabulary is drawn from `ADVISORY_ROOT_CAUSES` |

### What I checked beyond "a test now exists"

**F-01.** The three conjuncts are now decided in the workflow script, which is what NFR-1 demanded
— `laterTaskById` walks strictly later waves, conjunct (2) reads `laterTask.description`, conjunct
(3) reads the captured gate output (`:3188-3195`). More important for AC-3.1 than the conjuncts
themselves: on a holding promotion, `declaredScope` narrows from the union over *every* later wave
to the **named task's** owned set (`:3202`), which is the singular reading AC-3.1 wrote and the
thing v1 said had not shipped. The companion case is proved the way the AC is phrased — symbol half
holds, change lands in `d.js` (a *different* later task's file), refused `out-of-envelope`
(`advisoryWaveGate.test.js:2140-2157`). The three refusal arms assert `args.invocations` is `[]`,
so the refusal is positively located at GATE rather than merely "not resolved".

**F-02 / F-03.** Both are closed through one mechanism rather than an `if (seam === "A6")`: the new
optional `annotate` SeamOps member (`:3238`), spread onto both the record disposition (`:4051`) and
the terminal object the escalation writer reads (`:4070`). Three product properties I checked and
found honoured: the class reaches `ESCALATIONS.md` as a **field**, which is what AC-6.4's
countability claim rests on; the capture-failure path — which builds its own disposition and never
enters the driver — supplies `wave` and `rootCause` itself (`:3427-3429`), so that escalation is
attributable too; and A1–A5 are untouched, asserted by set-equality over the field list rather than
by absence (`advisoryRecord.test.js:687-691`, `advisoryEscalationLog.test.js:685-690`).

The oracles are of the shape this round demanded. `advisoryEscalationLog.test.js:684` compares the
written entry's field labels to a **literal** field-order list transcribed from the spec
(`AWG_A6_FIELD_ORDER`, `:616-628`) — set-equality over the full enumeration, so a dropped or added
row fails; `advisoryRecord.test.js` does the same for the record's twelve labels. Neither derives
its expectation from the renderer. The class is varied across `test.each` over the three real
classes (`advisoryEscalationLog.test.js:701-707`), so the log carries the class *the reply named*
rather than a fixed literal, and the totality arm pins `unclassified` rather than an absent row.

**F-04.** `A6_PROHIBITIONS` is no longer a constant that only equals itself: `a6ProhibitedPaths`
walks it (`:2000-2004`) and `buildA6SeamOps` subtracts the result from `declaredScope` at both the
seeding site (`:3114`) and the directory-row widening site (`:3128`) — a production reader on the
path that decides refusals, which is what DC-07 asks for. The eleven arms are all present and each
drives `runWaveGateSeam`: six path arms whose fixture manifest **deliberately assigns the failing
wave both prohibited paths** (`advisoryWaveGate.test.js:2171`), so the refusal is attributable to
the subtraction and not to ownership; three (h) arms asserting no `git commit`/`push`/`tag` argv on
a run that **did** resolve, with `commit-tree` positively asserted present so the absence is not an
absence-only oracle (`:2262-2266`); two (i) arms that write during the dispatch and then assert the
files are gone (`:2307-2331`). Each group carries its paired positive on the same fixture.

**F-05.** The new `advisoryWaveGateMain.test.js` runs `mainDev` with **no `_runWaveGateSeam`
injection**, so the notice surface it counts is the shipped one. All four arms PLAN A6-18 allocates
are there and each counts (`toHaveLength(1)`), and the discriminator I asked for — a run where A6
applies emits **zero** inapplicability statements (`:263-274`) — is asserted as `toEqual([])`, which
is the falsifier for a carrier that emits the notice unconditionally. The disabled/enabled arm
compares the two surfaces by equality, not containment (`:246`).

**F-06.** `waveExecution.test.js:1254` drives `main`, finds T2's actual `se-implement` dispatch in
the recorded calls, and asserts the promotion clause verbatim; the paired negative
(`:1273-1293`) runs the same fixture with an E-5 repair and asserts the two prompts are equal after
removing exactly that clause — byte-identical, as AC-4.6's "revises rather than rediscovers" claim
needs. It also asserts T1's prompt does **not** carry the clause, so the clause is attributable to
the promotion and not to the wave.

**F-07.** The verb now rides a caller-owned carrier through `captureTreeSnapshot` (`:12571-12575`),
and every early return names its own verb (`rev-parse`, `add`, `write-tree`, `commit-tree`,
`update-ref`, `reset`). The test asserts the observed verb by containment on the decision sentence
and parameterises over verbs (`advisoryWaveGate.test.js:1717`), so it cannot pass on a hard-coded
word.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
