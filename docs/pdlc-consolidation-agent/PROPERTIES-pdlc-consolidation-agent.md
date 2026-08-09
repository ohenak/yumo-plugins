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

Six rules. Every property in §§4–11 satisfies all six that apply to it, and a row that could be
misread as violating one names its compliance in the row.

### O-1 — No absence-only oracle; every negative carries a positive conjunct on the same path

An assertion of the form "no merge call was made", "no proposal file exists", "the credential does
not appear" is satisfied vacuously by a pass that did nothing. Every such property here pairs the
absence with a positive observed on the **same** run:

- AT-Q7's "no merge verb" is a **containment** assertion (`observed ⊆ permitted`) paired with an
  **obligation** assertion (`obliged ⊆ observed`) — §7, PROP-RTE-04.
- AT-M5's "the lock path is in no pathspec" is stated as **set-equality of the observed pathspec set
  to the §5.4 write set**, not as an absence — §7, PROP-RTE-10.
- AT-R7's "no proposal file" negatives (a `promoted` pass, an all-suppressed `no-op` pass) sit in one
  case beside a **positive control** whose one degraded promotion writes exactly one file — §7,
  PROP-RTE-06.
- AT-C3's four `skipped-cadence` absences sit beside the **returned report body carrying the terminal
  status**, which is what distinguishes a tick that evaluated and chose the branch from one that
  crashed at step 3 — §9, PROP-PASS-03.
- AT-K5's non-disclosure is asserted over the **accumulated output of every write double in the
  case**, on a pass that demonstrably produced output, beside the positive that the row carries
  exactly one `credential:` value from the closed set — §7, PROP-CRD-06.

### O-2 — Set-equality, never containment, wherever a dropped member would be invisible

Containment is the assertion that still passes with a member missing. Every enumeration this feature
owns is compared by **equality in both directions**, with the domain named rather than left to "the
table": the eight record field names (AT-F20), the open-promotion list `{B, C, D}` and `{E, F}`
(AT-F19, AT-F21), the effectiveness table's one-row-per-distinct-id rule (AT-F5), the
`PDLC-CONSOLIDATION-PROMOTIONS` trailer against the proposals a PR enacts (AT-Q2), `rtConsInjections()`
against §5.1's seam names minus `_now` (§10, PROP-BLD-03), `routeOf`'s predicate against the imported
`MERGE_GUARD_DEFAULTS` (AT-R1), the vocabularies §1 enumerated-class values (AT-L5), the FSPEC
register against TSPEC §12.3's table (§10, PROP-BLD-07), and `CLAUDE.md`'s artifact list against the
manifest's `rows[]` (§10, PROP-BLD-08). Where equality would be red on correct code — the seam
verb sets, which the read verbs legitimately widen — the bound is **two-sided containment**
(obliged-below, permitted-above) and the row says so (AT-Q7c, §7 PROP-RTE-05).

### O-3 — Determinism is never asserted by invariance alone

Order-invariance, idempotence and "two runs agree" are all satisfied by a function returning a
constant, `[]` or `null`. Each such property here pairs the invariance with a **positive conjunct on
the same path**: `mergeProposals`'s fold is invariant under permutation **and**, for at least one
ordering, its `kind` / `artifact` / `target` / `elidedKinds` / `elidedArtifacts` equal values
transcribed literally from TSPEC §7.4's fold table (§11, PROP-GEN-05); `effectivenessTable` is
order-invariant **and** its row count equals the number of distinct ids **and** each row's verdict
equals the arm §7.5 assigns (§11, PROP-GEN-06); AT-F17's "run twice, choice identical" is paired with
the predicate being the file-existence test rather than a free-text match (§6, PROP-EFF-08).

### O-4 — A routing branch gets a workflow-level property, not only a guard unit test

`routeOf` is a pure predicate over a path, and a unit test over it proves only that the predicate is
right — not that the pass consults it. Every routing branch this feature introduces therefore carries
at least one **L2 property through `main()`** asserting the terminal observable: the PR route
(PROP-RTE-01 pairs the L1 predicate with AT-Q1's clone observation), the consuming-repo route
(PROP-RTE-07, AT-R2/AT-R6), the degraded route (PROP-RTE-06, AT-R7's positive control), and the
suppression route (PROP-RTE-11, AT-Q10's three required conjuncts). The same rule puts the
unreadable-corpus-entry obligation at L2 in `consolidationPass.test.js` rather than at L1 over
`classifyCorpus` (§4, PROP-COR-09).

### O-5 — Precedence-defeating fixtures, and paired negatives

An oracle for a new branch is worthless if an earlier branch preempts it. Three pairings carry this
weight and none may be written alone:

| Positive | Its paired negative | What the pairing defeats |
|---|---|---|
| AT-M3 — empty marker and neither-verb marker both **reclaim** and record `reclaimed-stale-lock` with id `unknown` | AT-M11 — a `RELEASED:` marker at **two ages** is taken with **no** `reclaimed-stale-lock` and **no** `consolidation-in-progress` | an implementation recording `reclaimed-stale-lock` on every take passes AT-M1 … AT-M6b alone |
| AT-M7 — the fallback rung is reported and `ADVISORY_MODEL_FALLBACK:` appears verbatim | AT-M8 — the primary rung resolves and **no** such line appears | a pass that always reports the fallback |
| AT-M9 — the effectiveness table **is** appended when step 11 completed | AT-M6 / AT-M6b — **no** table when step 8 or step 6 terminated the pass | a pass emitting a table unconditionally passes both halves taken singly |

The unreadable-corpus fixture obeys the same rule from the other direction: it carries **both** an
unreadable and a **readable control** member, so the three observables (counted, in the consumed
pair, named in the report body) cannot pass on a fixture where nothing was readable (§4,
PROP-COR-09).

### O-6 — A short or missing field is exercised through a reader that must not repair it

FSPEC §14.5's LD-1, LD-4 and LD-5 are all about `parseLogRecords` being **total over any subset**
while its readers stay honest. Every property in that family asserts **four** things on one path:
(1) the pass reaches a terminal status and does **not** halt; (2) a parse notice names the short
record and the missing field, in the report body; (3) the positive downstream state each short field
actually blocks — an id left **open** in §8.4 step 1's list, a remediation **not** routed, a pair read
`absent` rather than `enacted`; and (4) the **log is unchanged** — no guessed default written back,
no in-place repair. Conjunct (4) is not decorative: `route ?? "constraints"` is caught by (3),
`route ?? "degraded"` is caught by **(2) alone**, and a silent rewrite is caught only by (4).

## 4. Properties — corpus, predicate, configuration

Subjects: `enumerateCorpus`, `parseCorpusListing`, `classifyCorpus`, `renderConsumedPair`,
`parseConsolidationConfig` (TSPEC §7.1, §7.8). Owner: PLAN **T25** (batch 4), red owner **T14**
(predicate, batch 3), **T04** (hook parity, batch 2), **T19** (properties, batch 3). Files:
`consolidationPredicate.test.js` (L1), `consolidationHookParity.test.js` (L4 + L3),
`consolidationProperties.test.js` (L5).

### 4.1 Enumeration

**PROP-COR-01** — *The corpus is one `_git` read, and its argv is pinned element by element.* The
call is exactly
`_git(["ls-files", "--cached", "--others", "--exclude-standard", "--", ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])`,
asserted as a literal array comparison — **both** `:(glob)` prefixes included — not as a substring
match and not as "an `ls-files` call was made". This is TSPEC §7.1's pin (a) and it is AT-P1's first
conjunct. Its positive half is the membership assertion: a LEARNINGS under `docs/completed/{feature}/`
**is** in the corpus. *L1 · `consolidationPredicate.test.js` · T14 → T25 · AC-1.1 step 1 · AT-P1.*

**PROP-COR-02** — *No property drives a directory walk.* The exclusion of `docs/discarded/` is
decided **by the pathspec**, never by a post-filter over enumerated lines, and no fixture asserts
"a discarded line is filtered out" — that assertion is green against an implementation that walks
directories and would hide the production failure `rtListFiles` guarantees
(`runtime-adapter.js:915`, `:929-931`). Negative space, stated so a later reader does not add the
missing case as an improvement. *L1 · `consolidationPredicate.test.js` · T14 → T25 · TSPEC §7.1.*

**PROP-COR-08** — *The pinned argv means under a real `git` what the document claims it means.* An
L4 case builds its **own** temp repository (`git init`; one LEARNINGS under each of `docs/{f}/`,
`docs/completed/{f}/`, `docs/discarded/{f}/`; `git add -A`), reaches it through `_git`'s own
`["-C", dir, …]` form — never the repository under test, so the assertion cannot drift as this
repo's `docs/` tree grows — and runs **exactly** PROP-COR-01's argv: **zero** results under
`docs/discarded/`, **at least one** under `docs/completed/`. It pins the `:(glob)` half only.
`--exclude-standard` is inert under `--cached` in a fixture built by `git add -A`, and the
ignored-LEARNINGS question REQ-CONS-01's erratum decided (a `.gitignore`d LEARNINGS **is** corpus,
so the flag is dropped) leaves no flag behaviour to pin. Outside the fixture table and outside
PROP-FIX-03's counter. *L4 · `consolidationHookParity.test.js` · T04 → T25 · TSPEC §11.1 · (no FSPEC
AT).*

### 4.2 The two-region predicate

**PROP-COR-03** — *The predicate is total, and every enumerated file lands in exactly one set.* For
any log text and any enumerated basename set, `classifyCorpus` returns without throwing and the
consolidated and un-consolidated sets **partition** the input — neither overlapping nor dropping a
member. The partition half is the positive conjunct that stops totality being satisfied by a
function returning two empty sets. *L1 + L5 · `consolidationPredicate.test.js`,
`consolidationProperties.test.js` · T14/T19 → T25 · AC-1.1 · TSPEC §11.4 row 1.*

**PROP-COR-04** — *The four region shapes, one fixture each, each distinct from its neighbours.*
Four rows, none of which subsumes another:

| Fixture | Expected | AT | Why it is not another row's Given |
|---|---|---|---|
| a basename occurring **outside** any block and **after** the first marker (e.g. in an `artifact` field) | **un-consolidated**; the stray occurrence marks nothing | AT-P2 | a stray *basename*, against AT-P9's stray *closer* |
| a log with **no** `<!-- pdlc:consumed` marker at all | the whole file is legacy region; a basename anywhere in it is consolidated | AT-P3 | no marker at all, against AT-P11's basename in **both** regions |
| an opening marker with **no** closer | the unterminated block extends to EOF; its basenames are consumed | AT-P5 | — |
| a closing `<!-- /pdlc:consumed -->` with **no** opener, beside a real block elsewhere | the dangling closer opens no block and moves no boundary; adjacent basenames are un-consolidated and the real block is unaffected | AT-P9 | the "real block unaffected" conjunct is what stops a parser that resets state on any closer |

*L1 · `consolidationPredicate.test.js` · T14 → T25 · AC-1.1 · AT-P2, AT-P3, AT-P5, AT-P9.*

**PROP-COR-05** — *A double membership is not a double count.* A basename appearing **both** in the
legacy region and inside a `<!-- pdlc:consumed -->` block is consolidated exactly once and appears
once in every set the pass derives — the two clauses are a disjunction over a set. *L1 ·
`consolidationPredicate.test.js` · T14 → T25 · AC-1.1 · AT-P11.*

**PROP-COR-06** — *Absent and unreadable are two input states, each with its own fixture.* An
**absent** log yields every enumerated basename un-consolidated with no error (AT-P4); a log
**present but unreadable** (permission or IO error) is treated as **empty text** — same outcome, no
error raised, and the pass proceeds (AT-P8). Written as two rows because E-01 and E-02 are different
states and one fixture cannot exercise both. *L1 · `consolidationPredicate.test.js` · T14 → T25 ·
AC-1.1 · AT-P4, AT-P8.*

**PROP-COR-09** — *An unreadable corpus **entry** is omitted from the consumed pair, counted as
un-consolidated, and named.* One fixture carries **both** an unreadable member and a **readable
control**. Three conjuncts: (1) the un-consolidated count counts **both** members; (2)
`renderConsumedPair`'s output contains **both** basenames; (3) the report body names the
**unreadable** basename and **not** the readable one. The control is what stops (1) and (3) passing
on a fixture where nothing was readable. This is REQ §4b's erratum decision — no `unread:` field, no
new reason code, no vocabulary row — asserted rather than assumed. Placed at L2 per O-4, because its
subject is the pass's corpus handling end to end. *L2 · `consolidationPass.test.js` · T20 → T31 ·
AC-1.1, REQ §4b · (no FSPEC AT), TSPEC §12.2.*

**PROP-COR-10** — *A basename collision is resolved to one member **and reported**.* Two LEARNINGS
sharing a basename under `docs/{f}/` and `docs/completed/{g}/` yield **one** member for the pair, and
the report names the collision explicitly. The report conjunct is the one this property exists for:
the set-size assertion alone cannot distinguish "reported" from "silently resolved". *L2 ·
`consolidationPass.test.js` · T20 → T25/T31 · AC-1.1 · AT-P10.*

**PROP-COR-11** — *The consumed pair is emitted complete, in one append, even when empty.* On an
empty un-consolidated set the pair is **still** appended, empty, **before** any other record the pass
writes. Positive conjunct on the same path: the appended text is one whole record in one
`_appendFile` call, never a read-modify-write — the write-granularity obligation
(`pdlc-consolidation-vocabularies.md` §3 at `Version` 1.4) is what makes NFR-5 implementable at all.
*L2 · `consolidationPass.test.js` · T20 → T25/T31 · NFR-5, AC-2.4 · AT-P6.*

### 4.3 The differential against the shipped hook

**PROP-COR-07** — *One corpus, one predicate: the JS and the hook decide the same un-consolidated
set on every case.* The shared fixture table spans both §3.2 regions, an unterminated block, a
dangling closer, a stray basename, the legacy/block boundary, one case above `THRESHOLD = 5`
(`nudge-consolidation.sh:25`) and a zero-corpus case. Each case is materialised as a fixture root and
reached by the hook through `CLAUDE_PROJECT_DIR`; the hook's set is read as the block's **`pending`
binding** (`:41`, before the threshold comparison at `:43`), never from stdout, which is
threshold-gated. **Three conjuncts per row**, all required: JS ⊆ hook, hook ⊆ JS, **and** each side
equals the **literally transcribed** expected set — without the third, two implementations both
returning `∅` agree perfectly. The zero-corpus row additionally asserts `PDLC_PENDING:` is emitted
with an **empty value**, which is only reachable because PLAN T09 replaces the hook's early
`sys.exit(0)` (`:29-30`) with a `pending = []` fall-through. Scope is the predicate and only the
predicate: the `THRESHOLD` gate governs whether the hook *speaks*, not what it counts. *L4 ·
`consolidationHookParity.test.js` · T04 → T25 (dep on T09) · AC-1.1, NFR-5 · AT-P7.*

**PROP-COR-12** — *Widening the hook's corpus changes what it says, and changes nothing else.* Two
fixture corpora, each run against **HEAD's hook** (a `git show HEAD:pdlc/hooks/scripts/nudge-consolidation.sh`
copy written into the temp tree) and against the edited hook. **(a) Positive identity:** ≥ 5 pending
under `docs/*/` alone and none under `docs/completed/*/`; the emitted `additionalContext` **text** is
byte-identical between the two hooks **and** equals the message transcribed literally from the
shipped template (`:43-48`) at that `n`. **(b) Divergence:** pending members under
`docs/completed/*/` that only the widened `CORPUS_GLOBS` reaches, crossing the threshold; the two
outputs must **differ** and the edited hook's output equals the transcribed message at the **new**
`n` — never "whatever HEAD printed". The two arms sit in one block: an implementation that widened
nothing fails (b), one that broke the message fails (a). This replaces a byte-identity claim that
was absence-only and passed vacuously on this repo, where HEAD's pending count is 1 of 2 and the
widened count 3 of 5 — both below `THRESHOLD = 5`, so both sides printed the empty string and
identity held for the wrong reason. `PY_BIN`-gated and counted exactly like the AT-P7 rows. *L4 ·
`consolidationHookParity.test.js` · T04 → T09 · AC-1.1 · (no FSPEC AT), TSPEC §7.1 pin (b).*

**PROP-COR-13** — *The hook's `CORPUS_GLOBS` declaration carries exactly two glob literals and no
third.* An L3 source-text read locating the declaration **by name, never by line index**, with the
conjunct that `glob.glob(` occurs **once** and inside the comprehension over `CORPUS_GLOBS` — so a
third glob smuggled in as a second call is caught. *L3 · `consolidationHookParity.test.js` · T04 →
T09 · AC-1.1 · (no FSPEC AT), TSPEC §7.1 pin (b).*

### 4.4 Configuration

**PROP-CFG-01** — *Per-key independent fallback: one malformed key never retunes another.* Given a
`consolidation` section with a random subset of keys corrupted by type, every **uncorrupted** key
keeps its configured value, every **corrupted** key takes its documented default, and `invalidKeys`
is **set-equal** to the corrupted subset. The set-equality is the positive conjunct: an
implementation reporting every key as invalid, or none, satisfies the first two clauses on a
single-key fixture. *L1 + L5 · `consolidationPredicate.test.js`, `consolidationProperties.test.js` ·
T14/T19 → T25 · REQ §4a · AT-N2, TSPEC §11.4 row 3.*

**PROP-CFG-02** — *The defaults are the transcribed literals, and each is exercised.* `cadenceHours`
`168`, `volumeThreshold` `5` (which must equal `nudge-consolidation.sh:25`'s `THRESHOLD`, asserted by
transcription in both directions), `staleLockMinutes` `60`, `pluginRepository` `null`,
`credentialEnv` `"PDLC_PLUGIN_REPO_TOKEN"`, `unmeasurablePasses` `3`. *L1 ·
`consolidationPredicate.test.js` · T14 → T25 · REQ §4a.*

**PROP-CFG-03** — *Three absent-or-malformed shapes, three distinguishable reports.* An **absent**
`.claude/pdlc.config.json` leaves every key at default and the pass does not terminate (AT-N1); a
`consolidation` key present but **not an object** defaults every key and the report distinguishes
this from an absent section (AT-N3); a resolvable-looking `pluginRepository` that **does not resolve**
records reason `repository-unresolved` **and the configured value verbatim** — never a silent
fallback to the current repository (AT-N4). *L2 · `consolidationReport.test.js`,
`consolidationPass.test.js` · T24/T20 → T25/T31 · REQ §4a, AC-3.5 · AT-N1, AT-N3, AT-N4.*

## 5. Properties — trigger, identity, merge, and the record reader

## 6. Properties — effectiveness, remediation, and the advisory corpus

## 7. Properties — the marker, routing, and the credential

## 8. Properties — rendering and the report

## 9. Properties — the pass end to end

## 10. Properties — build, source text, and traceability

## 11. Generator-driven properties

## 12. Coverage matrix

## 13. Gaps, negative space, and errata
