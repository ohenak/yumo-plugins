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
(LD-1 … LD-5) are named here explicitly, each with the fixture the FSPEC declined to carry, in the
homes TSPEC §11.5 assigns: **LD-1, LD-4 and LD-5** range over `parseLogRecords` and its readers, so
they land in `consolidationParse.test.js` (§5.4); **LD-2 and LD-3** range over `mergeProposals` and
land in `consolidationIdentity.test.js` (§5.3). Every other property below pins an FSPEC acceptance
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

Subjects: `cadenceDatum`, `triggerFor`, `mintPassId`, `failureModeId`, `targetFor`, `mergeProposals`,
`parseLogRecords` (TSPEC §7.2, §7.4). Owner: PLAN **T26** (batch 5), red owners **T15** (identity),
**T16** (parse), **T19** (properties), **T20** (pass-level trigger cases). Files:
`consolidationIdentity.test.js` (L1), `consolidationParse.test.js` (L1),
`consolidationPass.test.js` (L2), `consolidationProperties.test.js` (L5).

### 5.1 Trigger and the cadence datum

**PROP-TRG-01** — *The tick evaluation order is observable, and the volume test precedes the cadence
test.* One constructed corpus family parameterised on `(n, k, volumeThreshold)`. At `(5, 2, 5)` the
un-consolidated set has `n − k = 3` members, `3 < 5` so the volume test does **not** fire, the
cadence test fires on the empty-datum branch, and the row records trigger `cadence` with reason code
`no-cadence-datum`. At `(6, 0, 5)` the **volume** test fires and the row records trigger `volume`.
One family exercises both sides of the threshold, so the property does not depend on which side the
repository happens to be on (PROP-FIX-02). *L2 · `consolidationPass.test.js` · T20 → T26/T31 ·
AC-1.1, AC-1.2 · AT-C1, AT-C1b, AT-C2.*

**PROP-TRG-02** — *An empty datum counts as elapsed, and the bootstrap tick is distinguishable.* When
no log row carries one of the datum's four statuses, the cadence test **fires**, the pass runs, and
the row carries trigger `cadence` **plus** reason code `no-cadence-datum`. The reason code is the
positive conjunct: without it a bootstrap tick is indistinguishable from an ordinary cadence tick,
and "empty means not elapsed" would make cadence unreachable until someone ran a manual pass. *L2 ·
`consolidationPass.test.js` · T20 → T26/T31 · AC-1.1 · AT-C1.*

**PROP-TRG-03** — *The datum is the newest row carrying a datum status, not the newest row.* Fixture:
a `promoted` row dated D1, then a **later** `refused` row dated D2 (D2 > D1), the `refused` row being
last in the file. The datum is **D1**. `refused` is not one of the four datum statuses, so the
ordering is exactly what falsifies an implementation taking the last row unconditionally. *L1 ·
`consolidationParse.test.js` · T16 → T26 · AC-1.1, AC-1.3 · AT-C5.*

**PROP-TRG-04** — *The manual entry point is never gated by cadence.* With `cadenceHours` not elapsed
by any measure, a direct `/pdlc:consolidate-learnings` invocation runs the pass with trigger
`manual`. *L2 · `consolidationPass.test.js` · T20 → T26/T31 · AC-1.1 · AT-C4.*

**PROP-TRG-05** — *The trigger decides whether a pass runs, never what clears the promotion bar.* One
fixed corpus and one fixed configuration, run twice — once where the volume test fires, once where
only the cadence test fires. The two promotion sets are **set-equal by `(failure-mode-id, action)`**
and the AC-2.3 evidence is identical in both reports. NFR-3 is comparative, so a trigger-sensitive
promotion set is precisely the failure this property exists to catch. *L2 ·
`consolidationPass.test.js` · T20 → T26/T31 · NFR-3, NFR-3a · AT-C8.*

**PROP-TRG-06** — *`passId` is derived from the log, never from a counter or a clock.* Three
conjuncts, one fixture each: a log already carrying `{today}-1` mints `{today}-2` (AT-C6); a log
whose newest rows carry a **previous** date and no `{today}` row mints `{today}-1` — the counter
restarts per date rather than continuing the previous date's `n` — and an **unparseable** row among
them contributes no `m` (AT-C7). *L1 · `consolidationParse.test.js` · T16 → T26 · REQ-CONS-03
preamble, vocabularies §4 · AT-C6, AT-C7.*

### 5.2 The id derivation

**PROP-ID-01** — *The id is a function of `phase` and `artifact` and of nothing else.* Two passes
deriving a promotion with the same `phase` and `artifact` from **different consumed sets** and with
**different `symptom` wording** produce **identical** ids. `symptom` is explicitly non-keying and the
consumed set is time-dependent, so an id that varied with either would make NFR-4's suppression key
unstable across passes. *L1 · `consolidationIdentity.test.js` · T15 → T26 · AC-5.1, NFR-4 · AT-F1.*

**PROP-ID-02** — *One promotion is one authored file, and a generated path never mints an id.* Three
fixtures. A remedy spanning **two authored files** yields **two** proposals with two ids, two
commits and two effectiveness rows — sharing one PR is permitted (AT-F2). An edit to
`pdlc/workflows/orchestrate-dev.js` **plus** the rebuilt `pdlc/workflows/dist/` bundles yields **one**
proposal whose `artifact` is the **source** file (AT-F3). An edit to a
`pdlc/workflows/__tests__/fixtures/` file **whose path contains `dist/`** yields an id, because the
predicate is keyed on the **producer** (`build-runtime.mjs`'s four tracked outputs) and never on a
path glob (AT-F4). AT-F4 is the arm that falsifies a `path.includes("dist/")` implementation, which
is green on AT-F3 alone. *L1 · `consolidationIdentity.test.js` · T15 → T26 · AC-5.1 · AT-F2, AT-F3,
AT-F4.*

**PROP-ID-03** — *`targetFor` is a pure function of the two keying fields, and the write is an append
on a second pass.* An AC-2.2 promotion at `phase = P`, `artifact = pdlc/skills/se-author/SKILL.md`
yields `docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md` in **both** a tree with no such
file and a tree already carrying one; in the first the file is **created**, in the second it is
**appended to, never replaced**; the write is in the invoking tree and inside the §5.4 commit, and the
route is never the PR route. *L1 + L2 · `consolidationIdentity.test.js`, `consolidationRoute.test.js`
· T15/T21 → T26/T28 · AC-2.2 · AT-R6.*

### 5.3 The intra-pass merge — including LD-2 and LD-3

**PROP-MRG-01** — *Sibling subjects write two files; colliding subjects merge into one promotion, and
the merge is not reported as a suppression.* Two of AT-R6b's five fixtures, five separate passes over
five separate logs. **(1) Siblings**, both AC-2.2, subjects `pdlc/skills/se-author/SKILL.md` and
`pdlc/skills/te-review/SKILL.md`: two promotions write **two distinct** files, one per subject.
**(2) Colliding subjects**, both AC-2.2, `pdlc/skills/a-b.md` and `pdlc/skills/a/b.md`, two paths
that slug to one id: the two are **one** promotion, and the observable set is **one** failure-mode
record, **one** `symptom`, **one** `target`, **one** file written, **and no** `duplicate-suppressed`
reason code and **no** `suppressed-by:` entry. The negative half is the half fixture 2 exists for: an
implementation reporting the merge as a suppression is, in the log alone, indistinguishable from one
that dropped a promotion. Fixture 2 additionally asserts **which** path survives — the
lexicographically first canonical path, here `pdlc/skills/a-b.md` (`-` = 0x2D precedes `/` = 0x2F) —
and the **compensation**: the report body names the elided subject path `pdlc/skills/a/b.md` beside
the surviving `artifact`. *L2 · `consolidationRoute.test.js` (writes), `consolidationIdentity.test.js`
(fold) · T21/T15 → T26/T28 · AC-5.1, §8.2 · AT-R6b fixtures 1–2.*

**PROP-MRG-02** — *Kind precedence is pinned over every ordered pair the three-member order admits.*
AT-R6b's fixtures 3, 4 and 5, each one pass at `phase = P` merging one promotion out of two kinds
over **one shared subject**. **(3) kinds 1 + 3** (`pdlc/workflows/orchestrate-dev.js` as a process
learning **and** as an AC-2.1 domain invariant): the single `target` is
`docs/_constraints/DOMAIN-CONSTRAINTS.md`, `route` is `constraints`, **no** guard-set path is written
and **no** PR is opened — the process learning's own `target` would have taken the PR route, and
precedence removes it. **(4) kinds 2 + 3**: the single `target` is
`docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route` is `decisions`, again no guard-set write and
no PR — the rank-2 half of "a mixed-kind merge never takes the PR route", on which an implementation
whose rule is "constraints wins, otherwise keep whichever arrived first" is green everywhere else and
red only here. **(5) kinds 1 + 2**: the single `target` is `DOMAIN-CONSTRAINTS.md`, `route` is
`constraints`, and **no** `DECISIONS-*` file is created or appended — which pins the (1, 2) ordering
rather than leaving it inferred. On all three, the one `symptom` names **both** failure modes and the
report body names the elided kind. Sampled at one pair the enumeration is not covered; the three
together range over (1,3), (2,3) and (1,2), so a deleted or transposed rank fails at least one.
Fixtures 1 and 2 cannot see any of this — their kinds coincide by construction, so their "one
`target`" conjunct is satisfied vacuously. *L2 · `consolidationRoute.test.js` · T21 → T28 · AC-5.1,
§8.2 · AT-R6b fixtures 3–5.*

**PROP-MRG-03 (LD-2)** — *`target` follows the surviving `artifact`, and the elided set names more
than one member.* FSPEC §14.5 defers this fixture here. Two **process learnings** (kind 3 on both
sides, so §8.2's kind precedence is not in play and only the subject tie-break decides) with
colliding subjects: the surviving `artifact` is the lexicographically first canonical path **and the
surviving `target` is that same proposal's `target`** — never one proposal's `artifact` paired with
the other's `target`, which would make the merged record's write touch a file the record is not
about. Second fixture, the **>2-candidate case**: three failure modes under one key, `elidedKinds` and
`elidedArtifacts` are **set-equal** to the two non-surviving members' values, and the report body's
item 4 names **both** elided paths — not one member of a set of two, which is the defect a
one-elided-path implementation would leave. *L1 + L2 · `consolidationIdentity.test.js` (fold),
`consolidationReport.test.js` (item 4) · T15/T24 → T26 · AC-5.1 · FSPEC §14.5 LD-2, §8.2 third note,
BR-33b.*

**PROP-MRG-04 (LD-3)** — *Two actions over one subject in one phase are two keys, and no merge fires.*
FSPEC §14.5 defers this fixture here. One pass carrying a `promote` and a `revise` proposal over the
**same** subject in the **same** phase: the pair `(failure-mode-id, action)` differs, so
`mergeProposals` folds nothing, **both** writes happen, and a guard-set subject yields **one** PR
carrying **two** commits with two distinct `PDLC-PROMOTION-ID` trailers whose
`PDLC-CONSOLIDATION-PROMOTIONS` set is **set-equal** to the two pairs. An implementation folding two
actions into one key makes one write, which is §8.2's consequence 2 read the wrong way. *L1 + L2 ·
`consolidationIdentity.test.js`, `consolidationRoute.test.js` · T15/T21 → T26 · AC-5.1, NFR-4 · FSPEC
§14.5 LD-3, §8.2.*

### 5.4 The record reader — including LD-1, LD-4 and LD-5

Every property in this subsection satisfies **O-6**'s four conjuncts on one path. The rule is one
sentence: `parseLogRecords` is **total over any subset** of §8.1's eight field names, returning
`{records, notices}` — a **partial record plus a notice**, never a filled default — so the reader's
type cannot drift into the writer's.

**PROP-REC-01** — *Every record carries all eight field names on every kind and on the degraded
route.* Fixture: one failure-mode record on **each** of §5.2's three kinds (process learning, AC-2.2
decision, AC-2.1 domain invariant) **plus** one `degraded` record from the §6.3 fallback. Each
record's **field-name set** is **set-equal** to `{failure-mode-id, phase, symptom, artifact, target,
passId, action, route}` — no field missing on any kind, no ninth field invented. Both directions are
load-bearing: a dropped `target` or `route` on one path is otherwise invisible until §6.4's
consuming-repo carrier misreads it two passes later. *L1 · `consolidationParse.test.js` · T16 → T26 ·
AC-5.1 · AT-F20.*

**PROP-REC-02** — *The open-promotion list is computed by set-equality over all four arms, and its
cardinality is asserted as a literal.* Fixture spanning all four arms of §8.4 step 1's predicate in
one run: id `A` with a `retire` record at `route: constraints` (a landed retirement), id `B` with a
`retire` record at `route: degraded` (proposal only), id `C` with `promote` records only, id `D` with
a `revise` record only. The computed list is **set-equal to `{B, C, D}`** in both directions —
containment is satisfied by an implementation returning every id ever recorded. `A`'s absence pins the
`route != degraded` conjunct; `B`'s presence pins that a degraded retirement does **not** close an id.
The list's **length** is asserted in the report body as the literal **`3`** — the cardinality of
`{B, C, D}` on this fixture — not merely "present", since a report emitting a constant, or the count
of every recorded id (`4` here), would otherwise pass. *L1 · `consolidationParse.test.js` · T16 → T26
· AC-5.3, AC-5.4 · AT-F19.*

**PROP-REC-03 (LD-5, the `action` and `route` arms)** — *A short record does not halt the pass, is
reported, blocks exactly what it should, and is never repaired.* Fixture: two short records written by
an earlier pass — id `E` with **`action: retire`** and **no `route` field**, id `F` with
**`action: promote`, `route: degraded`** and **no `target` field** — plus one well-formed record `W`
with `action: retire`, `route: constraints`. All three carry `passId` and `failure-mode-id`. A later
pass derives a `retire` proposal for `E` (the same pair, so §6.4's carrier is actually consulted) and
re-derives `F`'s promotion. **Five conjuncts, all required, on one path:** (1) the pass reaches a
terminal status and does **not** halt; (2) a parse notice is reported **naming the short record and
the missing field**, in the report body; (3) `E`'s `retire` proposal is **re-proposed, not
suppressed** — §6.4 reads `absent` on a record it cannot index — and `E` is **present** in the
open-promotion list, asserted as set-equality against the literal **`{E, F}`** (`W` excluded, its
landed retirement closing it); and for `F`, §8.6 routes **no** remediation and **no** `target` is
guessed on the stored record; (4) the **log is unchanged** — no default written back, no in-place
repair; (5) the well-formed record `W` is unaffected. The conjunct-to-defect mapping is deliberately
asymmetric and worth stating: a halt on `undefined` is red on (1); `route ?? "constraints"` is red on
(3) — it closes `E` and reads the pair `enacted`, suppressing the re-proposal, the unsafe direction;
`route ?? "degraded"` is **not** unsafe on the reader and is caught by **(2) alone**, the
implementation defaulting silently without reporting a notice; a silent rewrite is red on (4). *L1 ·
`consolidationParse.test.js` · T16 → T26 · AC-5.1, NFR-4 · AT-F21, FSPEC §14.5 LD-5, BR-25, BR-33a,
BR-33c.*

**PROP-REC-04 (LD-5, the `phase`, `failure-mode-id` and `symptom` arms)** — *The three remaining short
arms, one fixture each, each asserting the one reader §8.1's table names.* AT-F21's fixture stays at
two arms deliberately; these three are the register's own home. **`phase` short:** §8.3 **emits the
row** with verdict `insufficient-evidence` — never dropped, never guessed `prevented`.
**`failure-mode-id` short:** §8.3 emits **no** row (a row cannot be keyed on an absent id), §8.4 step
1's list takes **no** member from that record, and §8.4 steps 2–3 ask **no** question about it — with
the parse notice reported, so the record does not vanish from the report as well as from the table.
**`symptom` short:** §8.4's harvest question is **still asked**, on the fields that are present. On
all three, O-6's conjunct (4) holds — the log is unchanged. *L1 · `consolidationParse.test.js` · T16 →
T26 · AC-5.2 · FSPEC §14.5 LD-5, §8.1's reader table.*

**PROP-REC-05 (LD-1)** — *An unavailable `artifact` renders as `(unavailable)` and never as a guess,
and three readers each state what they do with it.* FSPEC §14.5 defers these three fixtures here.
(i) **§8.3** emits the effectiveness row on the unavailable path rather than dropping it, and the
`artifact` cell renders the pinned literal `(unavailable)` — never blank, never a path. (ii) **§8.5**
**refuses to propose `retirement`** when the file-existence test cannot run, because the subject is
unknown; the remediation choice falls to the other arm and the report says which. (iii) **§8.4 steps
2–3** still put the promotion to the harvest agent on the fields it **does** carry, with the
`artifact` half stated **unavailable** rather than guessed. The three failure directions this pins:
dropping the §8.3 row silently moves the verdict, proposing `retirement` on an `artifact` that could
not be tested acts on an undetermined subject, and dropping the promotion from §8.4's question list
makes `recurred` unreachable for that id — which drifts it to `unmeasurable` under §8.7 for a reason
that is not about the promotion at all. *L1 · `consolidationParse.test.js` (reader), with the §8.3 and
§8.5 halves driven in `consolidationEffectiveness.test.js` · T16/T17 → T26/T27 · AC-5.2, AC-5.3 ·
FSPEC §14.5 LD-1, BR-33a, E-12b.*

**PROP-REC-06 (LD-4)** — *A record short of `passId` leaves NFR-4's key un-derivable, and the pass
says so.* FSPEC §14.5 defers this fixture here. A record missing `passId` — a field **outside** the
`(failure-mode-id, action)` suppression key but inside §6.4's carrier — must not be re-appended with
a synthesised id, must not render `pass:undefined` in any `suppressed-by:` entry, and must not
contribute a `suppressed-by:` entry at all: an entry naming an enacting pass that cannot be named is
unevidenced suppression. The positive conjunct: the parse notice names the record, and the pair reads
`absent`, so the promotion is **re-proposed** rather than suppressed on evidence the log cannot
supply. *L1 · `consolidationParse.test.js` · T16 → T26 · NFR-4, AC-5.1 · FSPEC §14.5 LD-4, §6.4,
BR-33a.*

## 6. Properties — effectiveness, remediation, and the advisory corpus

Subjects: `phasesExercised`, `effectivenessTable`, `openPromotionList`, `remediationChoice`,
`parseEscalations`, `seamCandidates` (TSPEC §7.5, §7.7). Owner: PLAN **T27** (batch 6), red owners
**T17** (effectiveness), **T18** (advisory), **T19** (properties). Files:
`consolidationEffectiveness.test.js` (L1), `consolidationAdvisory.test.js` (L1),
`consolidationProperties.test.js` (L5).

### 6.1 The effectiveness table

**PROP-EFF-01** — *The table is set-equal to the distinct ids recorded in prior passes — one row per
id, never one per record.* Given prior passes recording N distinct `failure-mode-id`s with **two
records sharing one id**, the table has exactly **one** row per distinct id: N rows, none missing and
none for a promotion never made. Records sharing an id are one promotion carrying one standing
verdict, so a dropped row is a failure rather than a smaller table. *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.2 · AT-F5.*

**PROP-EFF-02** — *The three verdict arms are total, decided by rule, and none is reachable by guess.*
Three fixtures, one per arm, each distinguished by exactly one changed input:

| Given | Verdict | The arm it stops |
|---|---|---|
| a consumed LEARNINGS naming the promotion's `failure-mode-id` | `recurred` | — |
| **no** consumed LEARNINGS naming the id, but at least one whose `Phases exercised` (or the §2 mapping) covers the promotion's `phase` | `prevented` | — |
| no consumed LEARNINGS decided to have exercised the phase | `insufficient-evidence` | never guessed `prevented` — the undecidable input falls here, which is what makes the split total |

The rule is deterministic and takes no model judgment: two runs over the same inputs cannot disagree,
which is the precondition NFR-4's idempotence rests on. *L1 · `consolidationEffectiveness.test.js` ·
T17 → T27 · AC-5.2 · AT-F6, AT-F7, AT-F8.*

**PROP-EFF-03** — *A `failure-mode-id` line in a consumed LEARNINGS attributes `recurred` to exactly
one promotion.* Constructed corpus fixture: a LEARNINGS whose §5 Open Item carries **one**
`failure-mode-id` line **byte-equal** to one of three recorded promotions' ids, the other two
recorded promotions being unnamed by any corpus file. The verdict is `recurred` for **exactly** the
named promotion; the other two are decided on §8.3's remaining arms without reference to the id. This
is the **receive** side only — the producing side (a harvest agent placing the id) is an LLM
invocation with no reproducible output and is carried as FSPEC O-C6, not as a property (§13.2). *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.2 · AT-F15.*

**PROP-EFF-04** — *An id matching no record contributes a notice and no verdict.* A LEARNINGS
carrying a `failure-mode-id` that matches no record in the log yields a reported parse notice, **no**
verdict, and **no** promotion invented for it. The notice is the positive conjunct — without it the
property is an absence check over a value that was never there. *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.2 · AT-F16.*

**PROP-EFF-05** — *`phasesExercised` is total over the corpus, and its undecidable half routes to
`insufficient-evidence`.* The decidable and undecidable halves are **set-equal** to the corpus: the
three basename-class rows of `pdlc-consolidation-vocabularies.md` §2 at `Version` 1.4 (with its
per-file, never fixed-partition split and its POSTMORTEM precedence) catalogue every file, so the
mapping is total. Any file the mapping cannot decide counts as **not** exercised and routes its
promotion to `insufficient-evidence` — never guessed `prevented`. *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.2 · vocabularies §2.*

### 6.2 Streaks and remediation

**PROP-EFF-06** — *The `ineffective` streak counts **counted** passes, and the `unmeasurable` streak
counts **evaluated** passes — two different populations, asserted apart.* A pass returning
`insufficient-evidence` for a promotion is skipped entirely by the `ineffective` streak; a pass with
an **empty consumed set** produces no verdict at all and advances neither streak. A
duplicate-suppressed `no-op` pass, whose consumed set is **non-empty**, **is** an evaluated pass and
**does** advance the `unmeasurable` streak: a promotion at `insufficient-evidence` for
`unmeasurablePasses` (default 3) consecutive evaluated passes, one of which was such a `no-op`, is
reported `unmeasurable`. The two populations are keyed on **consumed-set emptiness, never on the
`no-op` label**, which is exactly the distinction this property exists to hold. *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.3, AC-5.5, AC-1.4 · AT-F9, AT-F13.*

**PROP-EFF-07** — *A merged revision resets the streak to zero, and re-flagging costs two fresh
counted passes.* Given a merged `revise` PR for an id, the promotion's `ineffective` streak is
**zero**; two fresh `recurred` verdicts on counted passes are required to re-flag it. *L1 ·
`consolidationEffectiveness.test.js` · T17 → T27 · AC-5.3 · AT-F12.*

**PROP-EFF-08** — *`remediationChoice` is deterministic and its predicate is a file-existence test,
not a free-text match.* Run twice over one fixture at HEAD, the choice is **identical**. The
determinism is paired with the positive conjunct that the predicate consulted is the existence of the
subject `artifact`, so a constant-returning implementation is caught by PROP-EFF-09's arms rather
than passing here (O-3). *L1 · `consolidationEffectiveness.test.js` · T17 → T27 · AC-5.3 · AT-F17.*

**PROP-EFF-09** — *`retirement` is the terminal remediation, and the report names which alternative
was proposed.* Three fixtures. **(a)** An `ineffective` promotion whose subject `artifact` has been
**deleted** since the promotion landed: `retirement` is proposed — nothing is left to revise — and the
report field names `retirement` (AT-F18). **(b)** An `ineffective` promotion whose `retire` proposal
is already on an **open or merged** PR: **nothing** is proposed, `duplicate-suppressed` is recorded
against that PR, and the field still names `retirement` — the ladder has **ended**, so a later
`ineffective` tick proposes nothing rather than pointing back into a spent pair (AT-F11). **(c)** An
`ineffective` promotion whose chosen alternative is already on a PR in state open or merged: the
**other** alternative is proposed, which is what makes AC-5.3's promise guaranteed rather than merely
achievable (AT-F10). The report field is **absent**, not empty-valued, on an ordinary `promote` where
nothing was chosen (AT-F14) — asserted as key absence, since an empty string is a different
observable. *L1 · `consolidationEffectiveness.test.js` · T17 → T27 · AC-5.3, AC-5.4 · AT-F10, AT-F11,
AT-F14, AT-F18.*

### 6.3 The advisory corpus

**Standing caution, carried down from TSPEC §11.5 and stated here so no fixture author has to
rediscover it:** **no AT-A fixture may be written against REQ AC-6.3's "across the consumed window"
wording.** FSPEC §9.5 / BR-37a is the settled contract — `seamCandidates` ranges over **every** entry
in `ESCALATIONS.md` — and a REQ-derived fixture would red a conforming implementation. PROP-ADV-05
pins the settled form directly.

**PROP-ADV-01** — *The three corpus states are distinguished, and absence is not read as zero.*
`docs/_queue/ESCALATIONS.md` is **absent** at HEAD (§1's grounding table: `docs/_queue/` holds
`QUEUE.md` only), which is the shipping first state. **Absent** ⇒ reason code `no-advisory-corpus`,
**no** seam proposal of any kind, and the pass proceeds normally (AT-A1). **Present with zero
entries** ⇒ reason code `advisory-corpus-empty`, no over-escalation candidate and no widening
proposal (AT-A2). **Present with ≥ 1 entry** ⇒ both AC-6.2 and AC-6.3 are live. The two reason codes
are distinct because absence of the file is never absence of escalations: the tier could not
escalate, which is not the same as the seams having worked. *L1 · `consolidationAdvisory.test.js` ·
T18 → T27 · AC-6.1 · AT-A1, AT-A2.*

**PROP-ADV-02** — *A stock repository cannot propose widening.* On a repo where the tier never ran,
the pass does **not** propose widening any of the five `ADVISORY_SEAMS`
(`pdlc/workflows/orchestrate-dev.js:1669`). Paired with PROP-ADV-05's positive, so this is not an
absence-only oracle: the same function proposes a widening on a non-empty corpus in the same file.
*L1 · `consolidationAdvisory.test.js` · T18 → T27 · AC-6.3 · AT-A3.*

**PROP-ADV-03** — *Over-escalation is counted per `Seam` per `Feature`, from table rows only.*
`parseEscalations` counts the entry fields `renderEscalationEntry` emits and **never** the heading. A
seam whose escalation count spans at least two distinct features and exceeds the other seams' counts
(AC-2.3's pattern bar applied to this corpus) surfaces as an over-escalation candidate; one that does
not, does not. Advisory prose folded into LEARNINGS is a **corroborating, non-numeric** input only —
the pass may cite it as evidence and **never** derives a count from it. *L1 ·
`consolidationAdvisory.test.js` · T18 → T27 · AC-6.1, AC-6.2 · AT-A4, AT-A5.*

**PROP-ADV-04** — *A malformed entry is skipped with a notice, attributes no count, and does not abort
the read.* An entry whose `Feature` row is missing is skipped, a parse notice is reported, **no** count
is attributed to a guessed key, and the read continues. The notice and the continued read are the
positive conjuncts. *L1 · `consolidationAdvisory.test.js` · T18 → T27 · AC-6.1 · AT-A7.*

**PROP-ADV-05** — *`seamCandidates` ranges over every entry, so its verdict is invariant under the
consumed set.* One non-empty corpus in which seam B has escalations, run **twice**: once where the
entries' `Feature` values are **disjoint** from the pass's consumed set, once where they **match**.
The widening verdict for B is **identical** in both runs. This is the property that pins §9.2's
population: an implementation filtering escalation entries by the consumed set disagrees across the
two runs. Positive conjuncts on the same path: the widening is **proposed, never enacted**; because
it targets shipped defaults under `pdlc/workflows/` it routes to the **PR** route; and a consumer's
`.claude/pdlc.config.json` value — untracked and not a PR-able surface — is reported as **operator
action** in the AC-7.1 report and never as a PR. *L1 · `consolidationAdvisory.test.js` · T18 → T27 ·
AC-6.3, BR-37a · AT-A6.*

**PROP-ADV-06** — *The attributed total equals the entries carrying both rows, and nothing is
attributed to an absent key.* Generator-driven (§11, PROP-GEN-04): over a random entry sequence with
a random subset missing `Feature` or `Seam`, the total attributed count equals the number of entries
carrying **both** rows, and no count is attributed to a key absent from the input. The second half is
the positive conjunct that stops a function attributing everything to one bucket from satisfying the
first. *L5 · `consolidationProperties.test.js` · T19 → T27 · AC-6.1 · TSPEC §11.4 row 4.*

## 7. Properties — the marker, routing, and the credential

Subjects: the `docs/_decisions/.consolidation-lock` marker lifecycle (§4.1–§4.4), the route decision
(§5.2, §5.4, §6.4), the PR carrier (§6.1, §6.2, §6.5), and the credential ladder (§7.3). Owners: PLAN
**T28** (pass and route, L2), **T30** (credential, L2), green **T31**. Files:
`consolidationPass.test.js`, `consolidationRoute.test.js`, `consolidationCredential.test.js`. Every
property here runs `main()` end to end with the seams doubled (§2), never the internals.

### 7.1 The marker

**PROP-MRK-01** — *A held, fresh marker refuses the second pass, and the refusal is durable.* Marker
present and younger than `staleLockMinutes`: terminal `refused`, reason `consolidation-in-progress`,
the held `passId` and timestamp named in the row; **no** consumed pair, **no** commit — and one log
row **is** still written. The written row is the positive conjunct: a refusal that left no trace is
indistinguishable from a pass that never ran. *L2 · `consolidationPass.test.js` · T28 → T31 · AC-1.4
· AT-M1.*

**PROP-MRK-02** — *The three unheld marker states each reclaim, and the released state reclaims
nothing.* Four fixtures against one predicate. **(a)** A marker older than `staleLockMinutes`:
reclaimed, `reclaimed-stale-lock` recording the abandoned `passId`, pass proceeds (AT-M2). **(b)** A
marker present but **empty** — the state the existence seam reports as `file_empty`, never
`file_missing` (`__tests__/helpers/seams.js:296-299`), reachable only because §4.1 releases by
writing a `RELEASED:` sentinel rather than truncating: reclaimed, abandoned id reported `unknown`.
**(c)** A marker whose line is neither `IN-PROGRESS:` nor `RELEASED:`: same (AT-M3). **(d)** The
paired negative, **two** `RELEASED:` fixtures — one written seconds ago, one **older** than
`staleLockMinutes`: on **both** the marker is taken, and the row carries **no**
`reclaimed-stale-lock` and **no** `consolidation-in-progress`. A released marker is free at any age;
the aged fixture is what stops an implementation routing every non-`IN-PROGRESS:` file through the
stale-lock arm, and without (d) an implementation recording `reclaimed-stale-lock` on *every* take
passes (a)–(c) (AT-M11). *L2 · `consolidationPass.test.js` · T28 → T31 · AC-1.4 · AT-M2, AT-M3,
AT-M11.*

**PROP-MRK-03** — *Every way of leaving the pass early releases the marker, and leaves behind only
what had already been appended.* Three terminal fixtures, asserted on both directions. **(i)** Failed
at step 8 because neither model rung resolves (S-11): marker released, terminal row with reason
`advisory-model-unresolved`, the step-7 consumed pair **present**, and **no** §8.3 effectiveness
table (AT-M4). **(ii)** Failed at step 8 on a `{kind: "dispatch-error"}` return (§2.6 row 4): marker
released, terminal `failed` with **no** reason code, the error message verbatim in the report body,
consumed pair present, and **no** table and **no** failure-mode record (AT-M6). **(iii)** `refused` at
step 6 (S-09): **exactly one** appended record — the terminal row — **no** table and **no** consumed
pair (AT-M6b). The three share one mechanism (§10.2 order 3: step 11 never ran) and are asserted
separately because their Givens differ and an implementation can special-case one. Each negative is
paired with §9's PROP-PASS positives on the same path, so none is absence-only. *L2 ·
`consolidationPass.test.js` · T28 → T31 · AC-1.4, AC-5.1 · AT-M4, AT-M6, AT-M6b.*

**PROP-MRK-04** — *The lock is never committed, asserted positively.* With the git seam under a spy,
the **observed pathspec set** of every commit a terminal pass makes is **set-equal** to the §5.4
write set — which does not contain the lock path. The maintainer-side check that `.gitignore` carries
a pattern matching `docs/_decisions/.consolidation-lock` (§10, PROP-SRC) accompanies it and **cannot
stand alone**: a pass making no commit at all satisfies an absence-only reading. *L2 ·
`consolidationPass.test.js` · T28 → T31 · AC-1.4 · AT-M5.*

### 7.2 Routing and the invoking tree

**PROP-RTE-01** — *The guard-set predicate is set-equal to `MERGE_GUARD_DEFAULTS`, not a subset.* A
promotion targeting `pdlc/hooks/scripts/nudge-consolidation.sh` takes the **PR** route; the four
frozen members (`pdlc/workflows/orchestrate-dev.js:48-53`) are each exercised and no fifth prefix
routes to PR. Set-equality, because a dropped member is invisible to a subset check (O-2). *L2 ·
`consolidationRoute.test.js` · T28 → T31 · AC-3.1 · AT-R1.*

**PROP-RTE-02** — *A consuming-repo target is appended in the invoking tree and lands inside the
§5.4 commit.* A promotion targeting `docs/_constraints/DOMAIN-CONSTRAINTS.md` is appended in the
invoking tree and the append is inside the commit — not merely on disk. *L2 ·
`consolidationRoute.test.js` · T28 → T31 · AC-3.1 · AT-R2.*

**PROP-RTE-03** — *The decision path is a pure function of `(phase, artifact)`, stable across passes,
and appends rather than replaces.* An AC-2.2 promotion with `phase = P` and `artifact =
pdlc/skills/se-author/SKILL.md` derives `docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md`
in **both** a tree with no such file and a tree already carrying one: created in the first,
**appended to** — never replaced — in the second, inside the §5.4 commit, and never on the PR route.
*L2 · `consolidationRoute.test.js` · T28 → T31 · AC-2.2 · AT-R6.*

**PROP-RTE-04** — *The merge rules are asserted over five separate passes, and the kind precedence is
enumerated, not sampled.* Five fixtures, five passes, five logs (fixtures 3–5 share one subject and
phase and so derive one id; building them as one pass would collide all three merges onto a single
record). **(1) Siblings**, two AC-2.2 subjects: **two distinct** files, one per subject — the row that
falsifies the withdrawn basename derivation. **(2) Colliding subjects** (`pdlc/skills/a-b.md`,
`pdlc/skills/a/b.md`): **one** promotion under §8.2's intra-pass rule — one record, one `symptom`,
one `target`, one file — **and no** `duplicate-suppressed` and **no** `suppressed-by:` entry, since
nothing was withheld; the surviving `artifact` is the **lexicographically first** canonical path,
`pdlc/skills/a-b.md` (`-` = 0x2D precedes `/` = 0x2F); and the report body **names the elided**
subject path, which is what stops the loss being silent. **(3) kinds 1 + 3**, **(4) kinds 2 + 3**,
**(5) kinds 1 + 2**: one `target` each — `DOMAIN-CONSTRAINTS.md` / `DECISIONS-{id}.md` /
`DOMAIN-CONSTRAINTS.md` — routes `constraints` / `decisions` / `constraints`, **no** guard-set path
written and **no** PR opened on any of them, the one `symptom` naming **both** failure modes, and the
report naming the elided kind. The three pairs exhaust the order the three-member ranking admits, so
a deleted or transposed rank fails at least one; sampled at one pair the enumeration is uncovered.
Fixtures 1 and 2 are vacuous on precedence by construction — their kinds coincide — which is why they
cannot substitute for 3–5. *L2 · `consolidationRoute.test.js` · T28 → T31 · AC-2.2, §8.2 · AT-R6b.
The `target`-follows-subject half of the tie-break, and the >2-candidate elided set, are
PROPERTIES-owned under DEC-LAYER-01 and land in §5.3 (**LD-2**).*

**PROP-RTE-05** — *The commit is pathspec-scoped, and the empty stage is a return rather than a
warning.* Three fixtures. On a `feat-*` branch with a **partially staged index**, HEAD and branch are
identical before and after, the commit contains **exactly** the §5.4 pathspec, and the pre-staged
files are not swept in — the property that makes `git add -- {paths}` observable rather than assumed
(AT-R3). When git refuses the commit after the lock retries, the terminal status is **unchanged**,
`writes-uncommitted` is recorded, and the writes remain correct on disk (AT-R4). When the tree already
matches and nothing stages, there is **no** failure and **no** `writes-uncommitted` (AT-R5). *L2 ·
`consolidationRoute.test.js` · T28 → T31 · AC-3.1, NFR-2 · AT-R3, AT-R4, AT-R5.*

**PROP-RTE-06** — *A proposal file exists when, and only when, §5.3 names a cause.* Three fixtures,
`docs/_decisions/` listed before and after each pass. **(a)** A `promoted` pass where everything
landed and **(b)** a `no-op` pass where everything was duplicate-suppressed: the set of
`CONSOLIDATION-PROPOSAL-*.md` files is **unchanged**, and in particular none exists for that pass's
`passId`. **(c)** The positive control, a pass whose only promotion degraded on an absent credential:
**exactly one** exists, named for that `passId`. The two negatives are the half this property exists
for — asserted in the *when* direction alone, an implementation writing a proposal file on every pass
is green — and (a) and (b) sit side by side because they reach "no cause" by different routes while
§5.3 decides on causes rather than on terminal status, which differs between them. *L2 ·
`consolidationRoute.test.js` · T28 → T31 · AC-3.4 · AT-R7.*

## 8. Properties — rendering and the report

## 9. Properties — the pass end to end

## 10. Properties — build, source text, and traceability

## 11. Generator-driven properties

## 12. Coverage matrix

## 13. Gaps, negative space, and errata
