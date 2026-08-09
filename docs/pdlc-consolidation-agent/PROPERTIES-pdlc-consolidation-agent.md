---
feature: pdlc-consolidation-agent
---

# PROPERTIES — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/consolidation*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-09 |

## 1. Overview — scope, sources, and how to read this document

This document is the proof system for the consolidation pass: the observable invariants an
implementer must be able to falsify, stated precisely enough that each of PLAN §4's 34 tasks knows
which properties its test file carries and what a failing one would mean.

**Sources.** REQ §3 (AC-1.1 … AC-7.2) and §4 (NFR-1 … NFR-5); FSPEC's eight units
(`FSPEC-CONS-01` … `FSPEC-CONS-09`), its business rules (`BR-*`), its edge cases (`E-*`), its 99-id
acceptance register (§13) and its §14.5 layer-deferral register (LD-1 … LD-5); TSPEC §§5–11 (the
seam protocol, the algorithms, the levels, the oracle mechanisms, the property strategies); PLAN §4
(the task table), §5 (the file-ownership manifest) and §2 (the red-before-green and
single-writer-per-batch rules); and the two project-level authority files
`docs/_constraints/pdlc-consolidation-vocabularies.md` (`Version` **1.4**, `:7`) and
`docs/_constraints/pdlc-advisory-corpus-baseline.md`.

**What this layer owns, and what it does not.** `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md:10`) puts **fixture construction and set-equality
domains** here. So this document decides fixtures, expected literals, oracle shapes and coverage
floors; it does **not** re-decide a rule the FSPEC or TSPEC settled. FSPEC §14.5's five deferrals
(LD-1 … LD-5) are named here explicitly, each with the fixture the FSPEC declined to carry: LD-1 and
LD-5 in §6, LD-2 and LD-3 in §5, LD-4 in §5. Every other property below pins an FSPEC acceptance
test's oracle rather than inventing an obligation.

**Grounding.** Every claim about *existing* behaviour cites the working tree, re-measured while
authoring at `feat-pdlc-consolidation-agent` HEAD (clean tree; `git status --porcelain` reports only
untracked `.claude/` and `.serena/`):

| Cited symbol | Location, re-measured | Used by |
|---|---|---|
| `MERGE_GUARD_DEFAULTS` (frozen, four members) | `pdlc/workflows/orchestrate-dev.js:48-53` | §7 routing (PROP-RTE-01) |
| `resolveAdvisoryRung`, `ADVISORY_RUNG_SKILL` (`"se-review"`) | `orchestrate-dev.js:1833`, `:1797` | §9 rung (PROP-RUN-*) |
| `ADVISORY_MODEL_FALLBACK:` emit line | `orchestrate-dev.js:1859` | PROP-RUN-02 |
| `gitWithLockRetry` (module-private `async function` at HEAD) | `orchestrate-dev.js:8653` — **not** `:8617` | §7 commit (PROP-RTE-08) |
| `commitPaths` (plain `git commit -m`, no pathspec) | `orchestrate-dev.js:8705`; its unscoped commit at `:8726` | §7 negative (PROP-RTE-09) |
| `commitQueueRow`'s two-call pathspec form | `orchestrate-queue.js:1576-1595`; `NOTHING_TO_COMMIT_RE` `:1554` | PROP-RTE-08 |
| `rtListFiles` transports `ls -p -A \| grep -v '/$'` and rejects separator lines | `runtime-adapter.js:915`, `:929-931` | §4 negative space (PROP-COR-02) |
| `rtWriteFile`'s `relative to the repository root` clause, one occurrence | `runtime-adapter.js:802-811`, clause at `:805` | §10 (PROP-BLD-04) |
| `fakeFs` reports `file_missing` / `file_empty` as distinct reasons | `__tests__/helpers/seams.js:296-299` | §7 marker (PROP-MRK-03) |
| `AT19_SEAM_NAMES`, `AWAIT_SCAN_SOURCES` (`["orchestrate-dev.js", "orchestrate-queue.js"]`) | `__tests__/runtimeBundle.test.js:215`, `:1040` | §10 (PROP-BLD-06) |
| `seeded`, `resolveSeed` | `__tests__/helpers/driftGenerators.js:76`, `:134` | §11 generators |
| jest's `testPathIgnorePatterns` (helpers and fixtures excluded) | `pdlc/workflows/package.json:18-22` | §2.1 |
| The hook's `THRESHOLD = 5`, glob at `:28`, early exit `:29-30`, predicate `:41`, message `:43-48` | `pdlc/hooks/scripts/nudge-consolidation.sh` | §4 differential (PROP-COR-07) |
| `docs/_queue/ESCALATIONS.md` **absent** at HEAD (`docs/_queue/` holds `QUEUE.md` only) | — | §6 (PROP-ADV-01) |
| The live corpus is **5** LEARNINGS files under the two §3.1 globs | `docs/{orchestrate-dev-workflow,pdlc-advisory-tier}/`, `docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/` | §2.3 |

**One grounding result is a defect, routed rather than absorbed.** The `:8617` / `:8669` / `:8690`
locators FSPEC §5.4, TSPEC §4.2 and PLAN §3 carry for `gitWithLockRetry` and `commitPaths` are stale
by exactly 36 lines at HEAD; the same offset applies to PLAN §2's `:10136-10143` gate citation
(actually `:10172`) and its `:10151` wave-commit citation (actually `:10187`). No rule changes — the
symbols exist, unexported and unscoped exactly as described — so this document uses the corrected
locators above and emits `ERRATUM:` lines (§13.3). No property below is written against a line
index; §10's source-text properties locate **by name**, which is why the drift costs nothing
executable.

**How to read a property row.** Every row states an invariant that can fail, names its **level**
(L1 pure / L2 orchestration / L3 build-and-source-text / L4 differential / L5 generator, TSPEC
§11.1), names the **test file** that carries it and the **PLAN task** that owns that file for its
wave, and cites the REQ criterion and FSPEC acceptance id it discharges. A property with no
falsifier is not a property; §3 states the six oracle rules every row below satisfies, and each row
that could be read as absence-only names its positive conjunct in the row itself.

**Counts, measured not assumed.** This document states **96** properties across the six levels;
§12's four matrices re-derive the mapping from REQ, FSPEC, PLAN and the test-file index, and every
count in §12 is the length of the list beside it rather than a transcribed total.

## 2. Fixtures, generators, and doubles

### 2.1 One doubles module, no local equivalents

Every suite draws from `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` (PLAN T01), which
jest excludes from collection through the shipped `testPathIgnorePatterns`
(`pdlc/workflows/package.json:18-22`, `/__tests__/helpers/` at `:20`). The module **re-exports**,
never re-declares, the shipped doubles TSPEC §11.2 enumerates — `fakeFs`, `fakeListFiles`, `fakeGit`
(`__tests__/helpers/seams.js`), `fakeGhRun`, `matchKey`, `fakeNow`, `FIXED_NOW_MS`, `fakeSleep`
(`mergeDoubles.js`), `makeAgentDouble` (`advisoryDoubles.js`), `seeded` / `resolveSeed`
(`driftGenerators.js:76`, `:134`) — and adds only what does not exist: `fakeEnvPresent(presentNames)`,
`fakeMakeTempDir(path | null)`, `asAsync(fn)`, the three fixture builders of §2.2, and the literal
transcription of vocabularies §1 at `Version` 1.4.

**PROP-DBL-01** — *A double is never more capable than the seam it doubles.* No property in this
document drives `_listFiles`. The seam stays in the protocol for completeness, but `fakeListFiles`
returns whatever a fixture hands it while the shipped `rtListFiles` transports `ls -p -A` piped
through `grep -v '/$'` (`runtime-adapter.js:915`) and rejects any line carrying a separator
(`:929-931`) — so a directory walk that greens under the double finds **zero** feature
subdirectories in production. The falsifier is structural and belongs to the suite: the doubles
module's header states the rule, and a reviewer reading a `_listFiles`-driven consolidation case has
found a defect. *Level: L1 (structural, review-gated) · File: `consolidationDoubles.js` · Task: T01 ·
Source: TSPEC §11.2, PLAN §4.2 T25.*

**PROP-DBL-02** — *`asAsync` defers recording as well as resolution, on a macrotask.* The wrapper is
`(...args) => new Promise((resolve) => setTimeout(() => resolve(fn(...args)), 0))`. A microtask
deferral (`Promise.resolve().then(…)`) is drained by any `await` on any path, so the T-13
await-discipline case (§9, PROP-PASS-08) would pass against an implementation missing an `await` —
the test would only be able to succeed. Recording must defer with resolution: a wrapper that records
synchronously and resolves late leaves the log double's accumulated text already correct at
assertion time. **Falsifier, owed by PLAN T31 and observed once:** delete one `await` inside
`finishPass`, watch PROP-PASS-08 go red, restore. *Level: L2 · File: `consolidationLifecycle.test.js`
· Task: T01 (module) / T31 (mutation check) · Source: TSPEC §11.2, PLAN §4.2 T31.*

**PROP-DBL-03** — *Doubles are constructed per case, inside the case body, and every deferred loop is
drained in a `finally`.* The drain is `try { …assertions… } finally { await new Promise((r) =>
setTimeout(r, 0)); }`. Placing the drain after the assertions is the one position it cannot occupy:
on the broken implementation the first assertion throws and the drain never runs, leaving a pending
timer that leaks into the next case and can green it. *Level: L2 · File:
`consolidationLifecycle.test.js` · Task: T23 · Source: PLAN §4.1 T23.*

### 2.2 The three fixture builders

No suite concatenates a log, a corpus or an escalation file by hand. Three builders own those
shapes, so a grammar change is one edit rather than sixteen.

| Builder | Produces | Discipline it enforces |
|---|---|---|
| `buildLog({rows, legacy, blocks})` | a `docs/_decisions/.consolidation-log.md` text | the **first** `<!-- pdlc:consumed` marker is the legacy boundary; a builder call with no block yields an all-legacy file (AT-P3) |
| `buildCorpus({underDocs, underCompleted, underDiscarded})` | a fixture root of `docs/…/LEARNINGS-*.md` paths | **no fixture may depend on git visibility** — an ignored file or a staged-but-deleted one is not expressible, because `classifyCorpus` is driven directly and such a fixture would read as coverage of the enumeration half it cannot reach |
| `buildEscalations({entries})` | a `docs/_queue/ESCALATIONS.md` text in `renderEscalationEntry`'s shape | table rows only; the **heading** is written but is never a countable entry (AT-A1 … AT-A7) |

**PROP-FIX-01** — *Expected values are transcribed from the normative source, never read off the
produced artifact.* Every literal a property compares against — a reason code, a vocabularies §1
row, a `symptom` line, a report count — is transcribed from the fixture the pass was **handed** or
from the authority file, never from the record the pass emitted. Reading an expectation off the
output greens the case when the pass and the renderer drop the same field together, which is the
exact failure AT-Q13's "never read off the produced record" clause names. *Level: all · Source:
FSPEC §13.5 AT-Q13, PLAN §4.1 T21.*

**PROP-FIX-02** — *The corpus fixture is constructed, never the live repository.* At HEAD the live
corpus is 5 files (§1's grounding table) and grows with every delivered feature — this one included
— so a Given pinned to HEAD inverts on its own PR. AT-C1's `(n, k, volumeThreshold)` family is
instantiated at `(5, 2, 5)` and `(6, 0, 5)` so that both sides of the threshold are exercised by one
builder regardless of where the repository happens to sit. *Level: L2 · File:
`consolidationPass.test.js` · Task: T20 · Source: FSPEC §13.1 AT-C1, AT-C1b.*

### 2.3 The generator and the seeding discipline

All L5 properties draw from `driftGenerators.js`'s seeded xorshift32 (`seeded`, `:76`;
`resolveSeed`, `:134`). **No property-testing dependency is added** — the shipped decision recorded
in that file's header. Each L5 property reports its resolved seed in the failure message, so a
counterexample is replayable; a bare "property failed" with no seed is not a finding anyone can act
on.

**PROP-GEN-00** — *Every generator draws inputs a pass can actually construct.* The
`mergeProposals` strategy (§11) draws one `(phase, artifact)` pair and **computes**
`failureModeId(phase, artifact)` from it rather than assigning a shared id independently: an
assigned `(id, phase, artifact)` triple is an input no pass produces, and a counterexample over it
is not a defect. *Level: L5 · File: `consolidationProperties.test.js` · Task: T19 · Source: TSPEC
§11.4.*

### 2.4 The `PY_BIN` gate on the differential level

The L4 differential suite (§4, `consolidationHookParity.test.js`) runs the shipped
`nudge-consolidation.sh` in a subprocess. Its own probe (`:13-20`) degrades to a silent `exit 0`
when no interpreter is found, and a differential test inheriting that degradation would report
**passed** on a platform where it never ran.

**PROP-FIX-03** — *A skipped differential row is distinguishable from a passing one, and the
degradation is all-or-nothing.* The probe runs **once at module scope**; finding none of `python3`,
`python`, `py` it declares every differential row through jest's `test.skip` and emits a
`console.warn` naming all three candidates. There is no degraded path on which a subset still runs.
Each row increments an `executed` counter **as its last statement, after its own assertions passed**,
and a **top-level `test()` declared last in the file — never an `afterAll`** — asserts
`executed === TABLE.length || executed === 0`. The placement is load-bearing: jest does not run a
block's `afterAll` when every test in it is skipped, so an `afterAll` form would leave the all-skip
world's `executed === 0` unobserved rather than asserted. The L4 pathspec-semantics case (§4,
PROP-COR-08) sits **outside** the fixture table and outside the counter — its subject is `git`, not
the hook. *Level: L4 · File: `consolidationHookParity.test.js` · Task: T04 · Source: TSPEC §11.1,
PLAN §4.1 T04.*

## 3. Oracles — the falsifiability rules every property below obeys

## 4. Properties — corpus, predicate, configuration

## 5. Properties — trigger, identity, merge, and the record reader

## 6. Properties — effectiveness, remediation, and the advisory corpus

## 7. Properties — the marker, routing, and the credential

## 8. Properties — rendering and the report

## 9. Properties — the pass end to end

## 10. Properties — build, source text, and traceability

## 11. Generator-driven properties

## 12. Coverage matrix

## 13. Gaps, negative space, and errata
