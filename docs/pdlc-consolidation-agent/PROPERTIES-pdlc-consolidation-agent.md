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
| pdlc | draft | Claude | 1.5 | 2026-08-10 |

**v1.5** — closes SE F-01 from the v5 delta confirmation (POSTMORTEM-T episode 2). `PROP-COR-09`
gains TSPEC §12.2's **second** fixture — the all-unreadable corpus (§10.3 row 1b): status exactly
`no-op`, rendered pair empty, `|un-consolidated|` = 2, both basenames named as unread — with the
cell's mutual-control sentence; the title now covers the whole-corpus arm; §12.1's AC-1.4 row gains
`PROP-COR-09` as the sole carrier of AC-1.4's third cause; the trailer gains `AC-1.4`. Answering
`se-review`'s Q-01: the arm was **missed**, not consciously deferred — the erratum's routed item list
was minted against REQ v2.1 and the wave grew REQ v2.5's second arm (absorbed into TSPEC
§7.1/§10.3/§10.4/§12.2 and FSPEC v11.7) after the list was cut; this revision re-grounds on those
upstream cells at HEAD, ahead of the routed items, per the SKILL's re-ground-first procedure. No
property added, removed or renumbered; the set stays 118.

**v1.4** — erratum round. Absorbs REQ §4b / TSPEC §7.1's omission decision, which an earlier
revision of PROP-COR-09 contradicted in its own conjunct (2). The property's title already said
*omitted from the consumed pair*; conjunct (2) said `renderConsumedPair`'s output contains **both**
basenames, which is the pre-erratum inclusion arm. Conjunct (2) now asserts the rendered basename
list is **set-equal to `{readable}`** — readable present, unreadable absent, no third name — per
TSPEC §12.2's cell, and the trailing sentence gives (2) its own positive control (an implementation
rendering an empty pair). §O-5's parenthetical, which still read *(counted, in consumed pair, named)*,
now reads *(counted, **omitted from** the consumed pair, named)* on the same terms. No property
added, removed or renumbered; the set stays 118.

**v1.3** — addresses the round-3 cross-reviews. Three fixes, no property moved and no id reassigned.
The single-file rule v1.2 asserted is **not yet true of two ids**: AT-P6 and AT-P10 are registered to
`consolidationPredicate.test.js` by TSPEC §12.3 and PLAN T14, while PROP-COR-11 and PROP-COR-10
assert them at L2 where their whole-pass conjuncts are reachable — §13.3 **erratum 6** routes the
re-registration upstream and §12.4's AT-C and AT-P cells now name the pending erratum instead of
claiming the invariant unqualified (SE F-01). §13.3 **erratum 7** routes the fact that no PLAN block
declares AC-1.4's no-op pass, and PROP-PASS-11's trailer carries a placement note saying its file is
derived from its subject rather than licensed by PLAN text; §12.2's preamble names both derived rows
(SE F-03, PM F-08). §4.3 and erratum 3's false parenthetical are corrected: the fixtures directory
exists and is tracked at HEAD, so only the file and the manifest row are new (SE F-02). §12.3's
preamble states the task-axis union rule, so a §12.3 green absent from the matching §12.2 row reads
as a named spanning property rather than as re-derivation residue (PM F-09). The id set is unchanged
at 118.

**v1.2** — addresses the round-2 cross-reviews. The AT-C register moves to the file TSPEC §12.3 and
PLAN T20 actually give it: PROP-PASS-01…05 and PROP-PASS-11 re-home from
`consolidationLifecycle.test.js`/T23 — which PLAN T23 states carries **no register id** — onto
`consolidationPass.test.js`/T20, and the L1 arms PROP-TRG-03/PROP-TRG-06 now cite the TSPEC §7.2
obligation instead of AT-C5/C6/C7, so each register id is claimed in exactly one file (SE F-01). T25
is dropped from the pass-file green lists, since PLAN §5's manifest does not give it that file (PM
F-06). §12.2 states the spanning convention on both axes and the per-block green rule; §12.2/§12.3/
§12.4 are re-derived from the corrected trailers (SE F-03). Erratum 3 gains its ownership-manifest
half — the pre-widening fixture path is owed to PLAN T04's §5 row, not only its task text, or Phase I
would drop it uncommitted (SE F-02). §12.1's AC-1.1 row narrows to PROP-COR-01…11 (PM F-07). No
property was added, removed or renumbered: the id set is byte-identical to v1.1's 118, and the
claimed 114 is unchanged.

**v1.1** — addresses the round-1 cross-reviews: dangling `PROP-*` ids re-keyed to live ones (§1, §3),
the §5.1 trigger duplicates retired into their L2 homes with a retirement table, per-property REQ and
FSPEC trailers re-grounded, file/task trailers re-keyed to PLAN's RED owners across §§7 and 9, §12
rebuilt from those trailers and from REQ v2.1, and five properties added (PROP-PR-09…11, PROP-RPT-09,
PROP-PASS-11). Errata 3–5 route the upstream defects found while grounding.

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
| `resolveAdvisoryRung`, `ADVISORY_RUNG_SKILL` (`"se-review"`) | `orchestrate-dev.js:1833`, `:1797` | §9 rung (PROP-PASS-06, PROP-PASS-07) |
| `ADVISORY_MODEL_FALLBACK:` emit line | `orchestrate-dev.js:1859` | PROP-PASS-06 |
| `gitWithLockRetry` (module-private `async function` at HEAD) | `orchestrate-dev.js:8653` — **not** `:8617` | §7 commit (PROP-RTE-05) |
| `commitPaths` (plain `git commit -m`, no pathspec) | `orchestrate-dev.js:8705`; its unscoped commit at `:8726` | §7 negative (PROP-RTE-05, PROP-MRK-04) |
| `commitQueueRow`'s two-call pathspec form | `orchestrate-queue.js:1576-1595`; `NOTHING_TO_COMMIT_RE` `:1554` | PROP-RTE-05 |
| `rtListFiles` transports `ls -p -A \| grep -v '/$'` and rejects separator lines | `runtime-adapter.js:915`, `:929-931` | §4 negative space (PROP-COR-02) |
| `rtWriteFile`'s `relative to the repository root` clause, one occurrence | `runtime-adapter.js:802-811`, clause at `:805` | §10 (PROP-SRC-02) |
| `fakeFs` reports `file_missing` / `file_empty` as distinct reasons | `__tests__/helpers/seams.js:296-299` | §7 marker (PROP-MRK-03) |
| `AT19_SEAM_NAMES`, `AWAIT_SCAN_SOURCES` (`["orchestrate-dev.js", "orchestrate-queue.js"]`) | `__tests__/runtimeBundle.test.js:215`, `:1040` | §10 (PROP-BLD-03) |
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

**Counts, measured not assumed.** This document states **114** properties across the five levels —
re-measured 2026-08-09 after the §5.1 retirements and the §7.3/§8.1/§9.1 additions, by enumerating
the `PROP-{DOMAIN}-{NUMBER}` ids §§2, 4–11 mint;
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
builder regardless of where the repository happens to sit. The **builder** lives in
`helpers/consolidationDoubles.js` (T01), which is why the discipline is stated here and not inside
§9.1; the **instantiation** it constrains is PROP-PASS-01's, in `consolidationPass.test.js`, the file
TSPEC §12.3 gives the AT-C register. *Level: L2 · `helpers/consolidationDoubles.js` (T01) and
`consolidationPass.test.js` (T20 → T31) — paired file-to-task, per §12.2's spanning convention ·
Source: FSPEC §13.1 AT-C1, AT-C1b, discharged as register ids by PROP-PASS-01.*

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
  **obligation** assertion (`obliged ⊆ observed`) — §7, PROP-PR-05.
- AT-M5's "the lock path is in no pathspec" is stated as **set-equality of the observed pathspec set
  to the §5.4 write set**, not as an absence — §7, PROP-MRK-04.
- AT-R7's "no proposal file" negatives (a `promoted` pass, an all-suppressed `no-op` pass) sit in one
  case beside a **positive control** whose one degraded promotion writes exactly one file — §7,
  PROP-RTE-06.
- AT-C3's four `skipped-cadence` absences sit beside the **returned report body carrying the terminal
  status**, which is what distinguishes a tick that evaluated and chose the branch from one that
  crashed at step 3 — §9, PROP-PASS-02.
- AT-K5's non-disclosure is asserted over the **accumulated output of every write double in the
  case**, on a pass that demonstrably produced output, beside the positive that the row carries
  exactly one `credential:` value from the closed set — §7, PROP-CRED-03.

### O-2 — Set-equality, never containment, wherever a dropped member would be invisible

Containment is the assertion that still passes with a member missing. Every enumeration this feature
owns is compared by **equality in both directions**, with the domain named rather than left to "the
table": the eight record field names (AT-F20), the open-promotion list `{B, C, D}` and `{E, F}`
(AT-F19, AT-F21), the effectiveness table's one-row-per-distinct-id rule (AT-F5), the
`PDLC-CONSOLIDATION-PROMOTIONS` trailer against the proposals a PR enacts (AT-Q2), `rtConsInjections()`
against §5.1's seam names minus `_now` (§10, PROP-BLD-03), `routeOf`'s predicate against the imported
`MERGE_GUARD_DEFAULTS` (AT-R1), the vocabularies §1 enumerated-class values (AT-L5), the FSPEC
register against TSPEC §12.3's table (§10, PROP-TRC-01), and `CLAUDE.md`'s artifact list against the
manifest's `rows[]` (§10, PROP-BLD-02). Where equality would be red on correct code — the seam
verb sets, which the read verbs legitimately widen — the bound is **two-sided containment**
(obliged-below, permitted-above) and the row says so (AT-Q7c, §7 PROP-PR-05).

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
(PROP-RTE-02 and PROP-RTE-03, AT-R2/AT-R6), the degraded route (PROP-RTE-06, AT-R7's positive
control), and the suppression route (PROP-PR-04, AT-Q10's three required conjuncts). The same rule puts the
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
unreadable and a **readable control** member, so the three observables (counted, **omitted from**
the consumed pair — which is rendered set-equal to `{readable}`, the readable name present and the
unreadable one absent — and named in the report body) cannot pass on a fixture where nothing was
readable, nor on one that renders an empty pair (§4, PROP-COR-09).

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

**PROP-COR-09** — *An unreadable corpus entry — up to and including the **whole corpus** — is omitted
from the consumed pair, counted as un-consolidated, and named.* One fixture carries **both** an
unreadable member and a **readable control**. Three conjuncts: (1) the un-consolidated count counts **both** members; (2) the basename
list `renderConsumedPair` renders is **set-equal to `{readable}`** — the readable basename present,
the unreadable one **absent**, and **no third name** (set equality, not containment plus one
absence: NFR-5 requires a block naming *exactly* the consumed set, and a containment oracle is
satisfied by an implementation that also names a basename the enumeration never returned); (3) the report body names the
**unreadable** basename and **not** the readable one. The control is what stops (1) and (3) passing
on a fixture where nothing was readable, and in (2) it is the positive half that stops the conjunct
passing on an implementation that renders an empty pair. This is REQ §4b's erratum decision — the
unreadable entry is **omitted** from the consumed pair (it stays un-consolidated and the next pass
retries it, §10.4), with no `unread:` field, no
new reason code, no vocabulary row — asserted rather than assumed. A second fixture in the same case
carries the **all-unreadable corpus** (TSPEC §10.3 row 1b): terminal status is exactly `no-op` —
**not** `failed`, the adjacent branch an implementer is most likely to reach for, and not `refused` —
the rendered pair's basename list is **empty**, `|un-consolidated|` is **2**, and both basenames are
named as unread in the report body. That second fixture **is `AT-K3b`'s oracle** (`FSPEC:2210`, minted
in FSPEC v11.7): its Given — *"a corpus whose enumerated basenames are all unreadable on disk…, with
nothing else to promote"* — and its Then — terminal `no-op`, the consumed pair appended **empty**, and
**no** reason code minted for the condition — are the four observables above, so the register id is
claimed here rather than left carrier-less. Its `no CONSOLIDATION-PROPOSAL-*.md for that passId`
conjunct is PROP-RTE-06(b)'s, on the same terminal status, and is not restated here. The two fixtures are each other's controls: the all-unreadable
fixture keeps *"pair empty"* from passing on a pass that enumerated nothing at all, and the mixed
fixture keeps the all-unreadable fixture's status assertion from passing on an implementation that
terminates every unreadable-touching pass `failed`. This is AC-1.4's **third** cause (REQ §4b: the
consumed list empty **while** the un-consolidated set is non-empty — a pairing, not a reason code).
What the third cause does **not** need is a third fixture in PROP-PASS-11: it leaves `finishPass`
through the same exit as that property's cause (i) — consumed set empty, so no AC-5.2 verdict is
produced and neither streak advances — so AC-1.4's restate-and-release obligations on this path are
the ones cause (i)'s fixture already pins, and this property asserts only what **distinguishes** the
third cause from it (status, empty pair, `|un-consolidated|`, the named unread basenames). Stated
rather than left to inference, since §12.1 names this property AC-1.4's third-cause carrier.
Placed at L2 per O-4, because its
subject is the pass's corpus handling end to end — **and `AT-K3b` stays in this file with it**, not in
`consolidationCredential.test.js` where AT-K1…AT-K7 sit today (`TSPEC:2929`): §12.3's one-file rule
forces the choice, and the id's subject is a whole pass's corpus handling, not the credential. The
re-registration is routed as §13.3 erratum 8. *L2 · `consolidationPass.test.js` · T20 → T31 ·
AC-1.1, AC-1.4, REQ §4b · AT-K3b, TSPEC §12.2.*

**PROP-COR-10** — *A basename collision is resolved to one member **and reported**.* Two LEARNINGS
sharing a basename under `docs/{f}/` and `docs/completed/{g}/` yield **one** member for the pair, and
the report names the collision explicitly. The report conjunct is the one this property exists for:
the set-size assertion alone cannot distinguish "reported" from "silently resolved". *L2 ·
`consolidationPass.test.js` · T20 → T31 · AC-1.1 · AT-P10.*

**PROP-COR-11** — *The consumed pair is emitted complete, in one append, even when empty.* On an
empty un-consolidated set the pair is **still** appended, empty, **before** any other record the pass
writes. Positive conjunct on the same path: the appended text is one whole record in one
`_appendFile` call, never a read-modify-write — the write-granularity obligation
(`pdlc-consolidation-vocabularies.md` §3 at `Version` 1.4) is what makes NFR-5 implementable at all.
*L2 · `consolidationPass.test.js` · T20 → T31 · NFR-5, AC-2.4 · AT-P6.*

### 4.3 The differential against the shipped hook

**PROP-COR-07** — *One corpus, one predicate: the JS and the hook decide the same un-consolidated
set on every case.* The shared fixture table spans both §3.2 regions, an unterminated block, a
dangling closer, a stray basename, the legacy/block boundary, one case above `THRESHOLD = 5`
(`nudge-consolidation.sh:25`) and a zero-corpus case. Each case is materialised as a fixture root and
reached by the hook through `CLAUDE_PROJECT_DIR`.

**The hook's set is read from the env-gated `PDLC_PENDING:` stderr line, and the row fails when that
line is absent.** The case runs the hook with **`PDLC_CONSOLIDATION_DEBUG=1`** in its environment;
the hook's set is the comma-separated value of the `PDLC_PENDING:` line it writes to **stderr**
(TSPEC §7.1, `:875-877`; PLAN T09 item (4)), never stdout, which carries only the
threshold-gated `additionalContext` message. Naming the variable is load-bearing in the **passing**
direction: with it unset the hook writes no `PDLC_PENDING:` line at all, and a harness that parses a
missing line into `∅` gets JS `∅ ⊆ hook ∅` on every discriminating row — green for the reason the
property exists to catch. So **"a `PDLC_PENDING:` line was observed on stderr" is a per-row
precondition that fails the row rather than emptying it**, and it is counted through PROP-FIX-03's
`executed` counter, whose all-or-nothing assertion then covers this degradation too (PROP-FIX-03
otherwise guards only the `PY_BIN` probe). The declaration read is located **by name** — the
`pending` comprehension and the `n >= THRESHOLD` comparison — never by line index, since T09's items
(3) and (4) move both.

**Three conjuncts per row**, all required: JS ⊆ hook, hook ⊆ JS, **and** each side
equals the **literally transcribed** expected set — without the third, two implementations both
returning `∅` agree perfectly. The zero-corpus row additionally asserts `PDLC_PENDING:` is emitted
with an **empty value** — a positive observation of `∅`, distinct from the unobserved line above —
which is only reachable because PLAN T09 replaces the hook's early
`sys.exit(0)` with a `pending = []` fall-through. Scope is the predicate and only the
predicate: the `THRESHOLD` gate governs whether the hook *speaks* on stdout, not what it counts. *L4 ·
`consolidationHookParity.test.js` · T04 → T25 (dep on T09) · AC-1.1, NFR-5 · AT-P7.*

**PROP-COR-12** — *Widening the hook's corpus changes what it says, and changes nothing else.* Two
fixture corpora, each run against the **pre-widening baseline hook** and against the edited hook.

**The baseline is a checked-in fixture, never a git query.** It is a verbatim copy of the shipped
pre-T09 script at `pdlc/workflows/__tests__/fixtures/nudge-consolidation.pre-widening.sh`, written
by T04 and copied into the temp tree per case. **This fixture path is owed to PLAN §5's ownership
manifest, which does not yet carry it:** T04's manifest row (`PLAN:307`) names only
`pdlc/workflows/__tests__/consolidationHookParity.test.js`, and no row anywhere in §5 names anything
under `pdlc/workflows/__tests__/fixtures/`. The directory itself **exists and is tracked at HEAD**
(`git ls-files pdlc/workflows/__tests__/fixtures/` returns 20+ files, including `completeness/`,
`covered-violations/` and `digest-vectors.js`), and it is not ignored — so the new thing is the
**file**, and the missing thing is the **manifest row**, not the directory. Phase I commits
each task's work **pathspec-scoped to the files that task owns**, so on the manifest as written T04
would author this baseline and the wave commit would drop it, leaving PROP-COR-12 and PROP-COR-13 red
on correct code for a reason no test names. §13.3 erratum 3 carries the correction to PLAN: the
fixture path belongs in T04's ownership-manifest row as well as in T04's task text.
A `git show HEAD:pdlc/hooks/scripts/nudge-consolidation.sh`
baseline — which PLAN T04 currently specifies, and which §13.3 erratum 3 routes upstream — is
**self-invalidating**: T09 commits the widening to that exact path, so from the first commit after
T09 onward `git show HEAD:` returns the *edited* hook, arm (a)'s byte-identity becomes a tautology
and arm (b)'s required divergence is **red on correct code**. That is the same failure mode §2.2 and
PROP-FIX-02 name for the corpus fixture ("a Given pinned to HEAD inverts on its own PR"), and it
applies to a baseline exactly as it applies to a corpus. Because a fixture can rot in the opposite
direction — someone "fixes" a failing suite by refreshing the fixture from the edited hook, restoring
the tautology — the block carries a **fixture-validity conjunct**: the baseline fixture's glob
declaration reaches `docs/*/` **only**, located by name, so a fixture updated to the widened form
fails loudly rather than passing vacuously. **(a) Positive identity:** ≥ 5 pending
under `docs/*/` alone and none under `docs/completed/*/`; the emitted `additionalContext` **text** is
byte-identical between the two hooks **and** equals the message transcribed literally from the
shipped template — located by name, not by line index — at that `n`. **(b) Divergence:** pending members under
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
`168`, `volumeThreshold` `5` (which must equal the `THRESHOLD` declaration in
`nudge-consolidation.sh` — located **by name, never by line index**, as PROP-COR-13 requires, since
T09 renumbers that file — asserted by transcription in both directions), `staleLockMinutes` `60`, `pluginRepository` `null`,
`credentialEnv` `"PDLC_PLUGIN_REPO_TOKEN"`, `unmeasurablePasses` `3`. *L1 ·
`consolidationPredicate.test.js` · T14 → T25 · REQ §4a.*

**PROP-CFG-03** — *Three absent-or-malformed shapes, three distinguishable reports.* An **absent**
`.claude/pdlc.config.json` leaves every key at default and the pass does not terminate (AT-N1); a
`consolidation` key present but **not an object** defaults every key and the report distinguishes
this from an absent section (AT-N3); a resolvable-looking `pluginRepository` that **does not resolve**
records reason `repository-unresolved` **and the configured value verbatim** — never a silent
fallback to the current repository (AT-N4). *L2 · `consolidationReport.test.js` (T24 → T29/T31) and
`consolidationPass.test.js` (T20 → T31) — paired file-to-task, per §12.2's spanning convention ·
REQ §4a, AC-3.5 · AT-N1, AT-N3, AT-N4.*

## 5. Properties — trigger, identity, merge, and the record reader

Subjects: `cadenceDatum`, `triggerFor`, `mintPassId`, `failureModeId`, `targetFor`, `mergeProposals`,
`parseLogRecords` (TSPEC §7.2, §7.4). Owner: PLAN **T26** (batch 5), red owners **T15** (identity),
**T16** (parse), **T19** (properties cases), **T21** (routing and merge). Files:
`consolidationIdentity.test.js` (L1), `consolidationParse.test.js` (L1),
`consolidationRoute.test.js` (L2), `consolidationProperties.test.js` (L5). The whole-pass trigger
arms this section formerly restated now live once in §9.1 (`consolidationPass.test.js`, T20).

### 5.1 Trigger and the cadence datum

**One home per invariant.** The whole-pass (L2) trigger invariants live **once**, in §9.1, owned by
`consolidationPass.test.js` (T20) — the file TSPEC §12.3 and PLAN T20 give the AT-C register, not
`consolidationLifecycle.test.js`, which PLAN T23 states carries **no register id**. This section
keeps only the **L1** properties over the parse
and datum functions, which are layered coverage rather than duplicated work (O-4). Four ids minted in
v1.0 — **PROP-TRG-01, PROP-TRG-02, PROP-TRG-04 and PROP-TRG-05** — specified the same invariants at
the same level as PROP-PASS-01, PROP-PASS-02 and PROP-PASS-05, in a file owned by a different task;
under PLAN §5's file-ownership manifest that is two waves writing one test, and a later change to the
trigger rule would have had two homes to update. They are **retired into §9.1** and their ids are
**not reused**:

| Retired id | Invariant now stated once at | Why it was a collision, not a layer |
|---|---|---|
| PROP-TRG-01 | PROP-PASS-01 (L2, T20) | same `(n, k, volumeThreshold)` family at the same `(5,2,5)` and `(6,0,5)` |
| PROP-TRG-02 | PROP-PASS-01's empty-datum arm (L2, T20) | same `no-cadence-datum` bootstrap conjunct |
| PROP-TRG-04 | PROP-PASS-02's manual arm (L2, T20) | same AT-C4 obligation |
| PROP-TRG-05 | PROP-PASS-05 (L2, T20) | verbatim the same property, differing only in file and owner |

The retired ids stay visible in the table above and need **no exclusion rule** when PROP-TRC-01 runs:
that property's parser ranges over the **`AT-…` token grammar** in the FSPEC register and TSPEC
§12.3's table, not over `PROP-…` ids in this document, so a retired id appearing here contributes
nothing to either side of its set equality. The count claimed in §1 is the separate figure, and it
excludes these four by construction.

PROP-TRG-03 and PROP-TRG-06 stay here: both are **L1** over `parseLogRecords` / `mintPassId` against
the L2 whole-pass arms in PROP-PASS-03 and PROP-PASS-04, which is the L1-vs-L2 layering O-4 sanctions.

**PROP-TRG-03** — *The datum is the newest row carrying a datum status, not the newest row.* Fixture:
a `promoted` row dated D1, then a **later** `refused` row dated D2 (D2 > D1), the `refused` row being
last in the file. The datum is **D1**. `refused` is not one of the four datum statuses, so the
ordering is exactly what falsifies an implementation taking the last row unconditionally. Its L2
whole-pass arm is PROP-PASS-03, which is where the **AT-C5** register id is discharged; this L1 arm
cites the obligation rather than the id, because the id belongs to `consolidationPass.test.js`
(TSPEC §12.3) and one register id is claimed in exactly one file. *L1 ·
`consolidationParse.test.js` · T16 → T26 · AC-1.1 · TSPEC §7.2 (datum by status, not by position),
`TSPEC:928`.*

**PROP-TRG-06** — *`passId` is derived from the log, never from a counter or a clock.* Three
conjuncts, one fixture each: a log already carrying `{today}-1` mints `{today}-2`; a log
whose newest rows carry a **previous** date and no `{today}` row mints `{today}-1` — the counter
restarts per date rather than continuing the previous date's `n` — and an **unparseable** row among
them contributes no `m`. Its L2 whole-pass arm is PROP-PASS-04, which discharges the **AT-C6** and
**AT-C7** register ids; this L1 arm cites the obligation rather than the ids, for the same
single-file rule. *L1 · `consolidationParse.test.js` · T16 → T26 · REQ-CONS-03
preamble, vocabularies §4 · TSPEC §7.2 (`passId` derived from the log, per-date counter).*

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
indistinguishable from a pass that never ran. *L2 · `consolidationPass.test.js` · T20 → T31 · AC-1.3
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
passes (a)–(c) (AT-M11). *L2 · `consolidationPass.test.js` · T20 → T31 · AC-1.3 · AT-M2, AT-M3,
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
`consolidationPass.test.js` · T20 → T31 · AC-1.3, AC-5.1 · AT-M4, AT-M6, AT-M6b.*

**PROP-MRK-04** — *The lock is never committed, asserted positively.* With the git seam under a spy,
the **observed pathspec set** of every commit a terminal pass makes is **set-equal** to the §5.4
write set — which does not contain the lock path. The maintainer-side check that `.gitignore` carries
a pattern matching `docs/_decisions/.consolidation-lock` (§10, PROP-SRC) accompanies it and **cannot
stand alone**: a pass making no commit at all satisfies an absence-only reading. *L2 ·
`consolidationPass.test.js` · T20 → T31 · AC-1.3, AC-3.8b · AT-M5.*

### 7.2 Routing and the invoking tree

**PROP-RTE-01** — *The guard-set predicate is set-equal to `MERGE_GUARD_DEFAULTS`, not a subset.* A
promotion targeting `pdlc/hooks/scripts/nudge-consolidation.sh` takes the **PR** route; the four
frozen members (`pdlc/workflows/orchestrate-dev.js:48-53`) are each exercised and no fifth prefix
routes to PR. Set-equality, because a dropped member is invisible to a subset check (O-2). *L2 ·
`consolidationRoute.test.js` · T21 → T28/T31 · AC-3.1 · AT-R1.*

**PROP-RTE-02** — *A consuming-repo target is appended in the invoking tree and lands inside the
§5.4 commit.* A promotion targeting `docs/_constraints/DOMAIN-CONSTRAINTS.md` is appended in the
invoking tree and the append is inside the commit — not merely on disk. *L2 ·
`consolidationRoute.test.js` · T21 → T28/T31 · AC-3.1 · AT-R2.*

**PROP-RTE-03** — *The decision path is a pure function of `(phase, artifact)`, stable across passes,
and appends rather than replaces.* An AC-2.2 promotion with `phase = P` and `artifact =
pdlc/skills/se-author/SKILL.md` derives `docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md`
in **both** a tree with no such file and a tree already carrying one: created in the first,
**appended to** — never replaced — in the second, inside the §5.4 commit, and never on the PR route.
*L2 · `consolidationIdentity.test.js`, `consolidationRoute.test.js` · T15/T21 → T26/T31 · AC-2.2 · AT-R6.*

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
cannot substitute for 3–5. *L2 · `consolidationIdentity.test.js`, `consolidationRoute.test.js` · T15/T21 → T26/T31 · AC-2.2, §8.2 · AT-R6b.
The `target`-follows-subject half of the tie-break, and the >2-candidate elided set, are
PROPERTIES-owned under DEC-LAYER-01 and land in §5.3 (**LD-2**).*

**PROP-RTE-05** — *The commit is pathspec-scoped, and the empty stage is a return rather than a
warning.* Three fixtures. On a `feat-*` branch with a **partially staged index**, HEAD and branch are
identical before and after, the commit contains **exactly** the §5.4 pathspec, and the pre-staged
files are not swept in — the property that makes `git add -- {paths}` observable rather than assumed
(AT-R3). When git refuses the commit after the lock retries, the terminal status is **unchanged**,
`writes-uncommitted` is recorded, and the writes remain correct on disk (AT-R4). When the tree already
matches and nothing stages, there is **no** failure and **no** `writes-uncommitted` (AT-R5). *L2 ·
`consolidationRoute.test.js` · T21 → T28/T31 · AC-3.8b, §5.4 · AT-R3, AT-R4, AT-R5.*

**PROP-RTE-06** — *A proposal file exists when, and only when, §5.3 names a cause.* Three fixtures,
`docs/_decisions/` listed before and after each pass. **(a)** A `promoted` pass where everything
landed and **(b)** a `no-op` pass where everything was duplicate-suppressed: the set of
`CONSOLIDATION-PROPOSAL-*.md` files is **unchanged**, and in particular none exists for that pass's
`passId`. **(c)** The positive control, a pass whose only promotion degraded on an absent credential:
**exactly one** exists, named for that `passId`. The two negatives are the half this property exists
for — asserted in the *when* direction alone, an implementation writing a proposal file on every pass
is green — and (a) and (b) sit side by side because they reach "no cause" by different routes while
§5.3 decides on causes rather than on terminal status, which differs between them. *L2 ·
`consolidationRoute.test.js` · T21 → T28/T31 · AC-3.5, AC-1.4 · AT-R7.*

### 7.3 The PR carrier

**PROP-PR-01** — *The PR is cut in a clone, and the invoking tree sees no branch operation.* With
`pluginRepository` resolving to the current repository, a guard-set promotion's edit is committed in
a **separate clone under a temporary directory**, cut from the fetched default branch; the invoking
tree's HEAD, branch and index are unchanged. This is the **same-repo** configuration AC-3.8 names —
"consuming repo" and "plugin repo" are one repository in the shipping configuration — so the clone,
not a branch operation, is what keeps the invoking tree untouched. *L2 · `consolidationRoute.test.js`
· T21 → T30 · AC-3.1, AC-3.8 · AT-Q1.*

**PROP-PR-02** — *The promotions trailer is set-equal to the commits' pairs.* Three promotions in one
pass sharing one PR: **three** commits, each carrying a distinct `PDLC-PROMOTION-ID: {id}:{action}`,
and `PDLC-CONSOLIDATION-PROMOTIONS` **set-equal** to those three pairs — a dropped pair is invisible
to a containment check, which is the whole reason the trailer exists (NFR-4). *L2 ·
`consolidationRoute.test.js` · T21 → T31 · AC-3.3, NFR-4 · AT-Q2.*

**PROP-PR-03** — *Suppression is keyed on a landed carrier, never on a record's existence.* Four
fixtures over one `(failure-mode-id, action)` pair. **Open PR** ⇒ nothing opened, `duplicate-suppressed`
naming the pair with the PR in `suppressed-by:`, `pr:` empty, that PR **not amended** (AT-Q3).
**Closed-unmerged PR** ⇒ re-opened as a new PR: a rejected proposal is re-proposable (AT-Q4). A
**merged `promote`** PR for an id now `ineffective` ⇒ the `revise`/`retire` proposal is **not**
suppressed by it — the action half of the key is load-bearing (AT-Q5). A prior record with `route:
degraded` ⇒ the pair reads **`absent`**, not `enacted`, and is re-proposed (AT-Q12). The last is the
consuming-repo mirror of the closed-unmerged arm and is what stops a record's mere existence from
suppressing. *L2 · `consolidationRoute.test.js` · T21 → T31 · NFR-4 · AT-Q3, AT-Q4, AT-Q5,
AT-Q12.*

**PROP-PR-04** — *The consuming-repo carrier suppresses idempotently, and says so in §10.3's
spelling.* Given a prior record for the pair with `route: constraints` — the `enacted` arm —
`DOMAIN-CONSTRAINTS.md`'s bytes are **unchanged**, `duplicate-suppressed` is recorded, `suppressed-by:`
carries **exactly one** entry whose literal text is `{failure-mode-id}:{action} → pass:{enacting
passId}` (not a URL, not a bare id), and `pr:` is **empty** — all three conjuncts required, since a
suppression recording nothing is indistinguishable from a proposal never derived (AT-Q10). Paired with
the `absent` arm re-run over an unchanged corpus: the first pass appends **exactly once** and writes
its record with `route: constraints`; the second suppresses; and `DOMAIN-CONSTRAINTS.md` is
**byte-identical** after the second pass to after the first. The byte-identity is the only oracle that
fails an implementation which never consults the log and re-appends on every run (AT-Q11). *L2 ·
`consolidationRoute.test.js` · T21 → T31 · NFR-4, §6.4 · AT-Q10, AT-Q11.*

**PROP-PR-05** — *The PR seam's verbs are bounded on both sides, per domain, and the bound is
containment.* The three enumerated seam domains of §6.5 — the PR seam, the git seam in the invoking
tree, the git seam in the §6.1 clone — each behind its **own** spy recording the **resolved verb** of
every call routed through it, including calls made through a generic entry point (a `_gh([…])` argv,
a shell string, a URL built at runtime), classified by **operation performed** and not by function
name (`checkout -b` and `switch -c` both resolve to `create-branch`). Two Givens. On a **PR-opening**
pass: containment on every domain (observed ⊆ that domain's permitted set — which alone falsifies
every merge verb), obligation on each (`{read-pr, create-pr}`; `{add, commit}`; `{clone,
create-branch, add, commit, push}`), and the PR in state `open` — not `merged`, not
`auto-merge-enabled` — after the pass returns; `fetch` and the non-mutating reads are permitted and
asserted in neither direction (AT-Q7). On a **`promoted` pass with no guard-set proposal**: the PR and
clone domains observe `∅` with **no** obligation asserted on them, and the invoking tree is bounded
below by `{add, commit}` and above by §6.5's frozen set **∪ every widening TSPEC §9.3 has recorded
under DEC-LAYER-01** (⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`, all non-mutating). The Given
is pinned to `promoted` on purpose: a pass promoting nothing observes `∅` everywhere and satisfies
containment vacuously (AT-Q7c). Neither pooling the domains nor asserting set-equality universally is
admissible — both are red on conforming passes — and an absence-only "no merge call exists" is
satisfied by a pass making no calls, by a renamed route, and cannot see a merge issued through a
generic seam. Comparison is over **sets**, never multisets: PROP-PR-02's three commits are three
occurrences of one verb. The HEAD source-text scan for merge and enable-auto-merge calls (§10) is
**supplementary** and never the sole evidence for AC-3.7 (AT-Q7b). *L2 · `consolidationRoute.test.js` ·
T21 → T30 · AC-3.7, §6.5 · AT-Q7, AT-Q7b, AT-Q7c.*

**PROP-PR-06** — *Each PR failure class names its own reason code and degrades rather than halting.*
The remote head branch `consolidation/{passId}` already existing ⇒ reason `branch-exists`, the
fallback proposal file carrying the **full diff**, and the existing branch and any PR for it named
(AT-Q6). The PR API failing with a network, rate-limit or 5xx error ⇒ reason `api-failure` with the
API's status text recorded **verbatim**, the fallback carrying the full diff, and the pass **not**
halting (AT-Q8). Two Givens, two codes, asserted apart because E-23 and E-24 are different failure
classes and a collapsed code loses the distinction the report is read for. *L2 ·
`consolidationRoute.test.js` · T21 → T31 · AC-3.5 · AT-Q6, AT-Q8.*

**PROP-PR-07** — *The PR trailer outlives the branch, and the cost of the loss is reported rather than
hidden.* A pass opens a PR and records its promotion on an invoking branch which is then **deleted
without merging**: the PR and its `PDLC-CONSOLIDATION-PROMOTIONS` trailer survive and still suppress a
duplicate proposal on a later pass; that later pass **re-mints** the promotion's effectiveness record
from scratch — exactly the §5.5 cost — and **reports** it rather than pretending the record was never
lost. The reporting conjunct is the positive one; suppression alone would be green on an
implementation that silently forgot. *L2 · `consolidationRoute.test.js` · T21 → T31 · NFR-4, §5.5 ·
AT-Q9.*

**PROP-PR-08** — *The PR body carries AC-3.2's three obligations, and the single-occurrence fixture
stops an unconditional recurrence list.* Two fixtures, each a pass opening a PR for one promotion:
**(a)** a failure mode recurred across **two** named features, derived from those two source
LEARNINGS; **(b)** a **single** occurrence cleared under AC-2.3's standing-invariant argument. On
**both**, the body carries: each source LEARNINGS named by its **feature name**, **set-equal** to the
features derived from (so (a) names both and a body naming one is red); the `symptom` line verbatim;
and the AC-2.3 pattern evidence in the form that fixture cleared the bar with. This is the only
property reading the PR **body** — PROP-PR-02's oracle is the trailer set, and a body carrying nothing
but the three trailers is green there and red here. *L2 · `consolidationRoute.test.js` · T21 → T31 ·
AC-3.2 · AT-Q13.*

**PROP-PR-09** — *The PR URL reaches both carriers AC-3.4 names, asserted where both exist.* The
Given is the one pass on which AC-3.4's two conjuncts are **both** reachable: a `promoted-degraded`
pass with **≥ 2** promotions, one landing on a PR and one degrading to the §5.3 fallback
(PROP-CRED-04's shape). Then the opened PR's URL appears **verbatim and identically** in two places:
the `pr:` field of the pass's single terminal log row (PROP-RPT-01's field, appended once — never an
in-place edit of an earlier record) **and** in the body of
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, so a reader holding only the proposal file can
tell which promotions landed and which are still open. String **equality between the two carriers** is
the conjunct, not "each contains a URL" — two independently rendered URLs that disagree are exactly
the defect a reader of the proposal file would be misled by. On the happy path AC-3.4's second
conjunct is **vacuous** — a fully-`promoted` pass writes no proposal file at all (PROP-RTE-06(a)) —
which is a REQ/FSPEC tension this layer notices rather than resolves; §13.3 erratum 4 routes it, and
§13.1 records that no property asserts a proposal file into existence merely because a PR opened.
*L2 · `consolidationRoute.test.js` · T21 → T31 · AC-3.4 · (no FSPEC AT), REQ AC-3.4 second conjunct.*

**PROP-PR-10** — *The branch is unique per pass and survives the pass, asserted positively.* Two
conjuncts over the git seam in the §6.1 clone (PROP-PR-05's third domain) plus the branch state after
the pass returns. **(a) Never reused:** two passes over the same corpus mint two distinct `passId`s
and therefore two **distinct** branch names, each matching `consolidation/{passId}` exactly; the
second pass never pushes to the first's branch. **(b) Not deleted by the pass:** after a pass that
opened a PR, and after a **half-failed** pass whose PR call failed with `api-failure` *after* the
branch was pushed, the branch `consolidation/{passId}` **is still present** on the remote when the
pass returns. (b) is the positive half of AC-3.6's "not deleted by the pass — the residue of a
half-failed pass stays inspectable"; PROP-PR-05's containment bound excludes a `delete-branch` verb
from the permitted set, but containment alone is satisfied by a pass that never created a branch, so
the surviving-ref observation is required and cannot be replaced by the verb bound. *L2 ·
`consolidationRoute.test.js` · T21 → T31 · AC-3.6 · (no FSPEC AT), FSPEC BR-24.*

**PROP-PR-11** — *The PR body carries the pass trailer that makes it machine-recognisable.* On any
pass that opens a PR, the body carries the `PDLC-CONSOLIDATION-PASS` trailer whose value is **this
pass's `passId` verbatim** (`docs/_constraints/pdlc-consolidation-vocabularies.md` §4 at `Version`
1.4, `:170`), and the set of `PDLC-CONSOLIDATION-*` trailers on the body is **set-equal** to the
three FSPEC §13 names — `PDLC-CONSOLIDATION-PASS`, `PDLC-CONSOLIDATION-SOURCES`,
`PDLC-CONSOLIDATION-PROMOTIONS` — so a fourth invented trailer and a dropped one are both visible.
This is AC-3.7's conjunct **(c)**: (a) is PROP-CRED-01's scoped credential and (b) is PROP-PR-05's
verb bound, and without (c) the feature's third stated auto-merge control has no observable at all —
a repo-side control cannot recognise a PR by a trailer nothing asserts. *L2 ·
`consolidationRoute.test.js` · T21 → T31 · AC-3.7(c) · FSPEC BR-24, AT-Q2 (trailer-set arm).*

### 7.4 The credential

**PROP-CRED-01** — *The three credential values are distinguished, and none is inferred from another
field.* No `credentialEnv` variable with working local `gh` auth ⇒ `credential: local-gh` and the PR
route attempted — AC-4.4's supported same-repo path, on which AC-4.1's scoped credential is **not**
required (AT-K1). Neither variable nor `gh` auth ⇒ `credential: absent`, reason
`credential-unavailable`, the §6.3 fallback fires, the promotion appears under the `degraded` route,
and the pass does **not** halt (AT-K2). A credential **present but rejected** by the repository ⇒
`credential: present (redacted)` **and** reason `credential-unavailable` — the two fields are **not
collapsed**, which is the conjunct that separates "we had none" from "the one we had was refused".
*L2 · `consolidationCredential.test.js` · T22 → T30 · AC-4.1, AC-4.2, AC-4.4 · AT-K1, AT-K2, AT-K4.*

**PROP-CRED-02** — *`absent` is one value with three readings, decided by the row and by the report,
never by `status:`.* Six rows spanning every shape §10.3 admits: (i) `refused` at step 6, (ii) a
`no-op`/`promoted` pass whose proposals were all consuming-repo ones so no PR route was attempted,
(iii) `failed` at step 8 that never reached a PR-route attempt, (iv) `failed` at step 12/13 that
**did** attempt the route and resolved nothing, (v) `failed` at step 12/13 that never attempted it,
(vi) a genuine finding on a `promoted-degraded` row. **All six** carry `credential: absent`. Rows
(i)–(ii) carry **no** `credential-unavailable` and read "not attempted"; (vi) carries it and reads
"attempted and found nothing"; (iii)–(v) are `failed` and carry **no** `credential-unavailable`,
asserted as an absence in its own right because vocabularies §1 at `Version` 1.4
(`docs/_constraints/pdlc-consolidation-vocabularies.md:7`) bars the code from a `failed` row and
recording it would breach REQ §4b. Rows (iv) and (v) are **indistinguishable in the row** and are
distinguished **in the report body**: (iv)'s §10.4 item 4 names a degraded promotion with the
`credential-unavailable` failure class and (v)'s does not. Both directions asserted; the (iv)/(v) pair
is the one this property exists for — an implementation keying the reading on `status:`, or emitting
the reason code on a `failed` row to make it decidable, fails on it. *L2 ·
`consolidationCredential.test.js` · T22 → T30 · AC-4.2, §10.3 · AT-K6.*

**PROP-CRED-03** — *The credential value appears in nothing the pass writes, and the field is drawn
from a closed set.* Every artifact the pass produces and the report body are searched: the credential
value appears in **none** of them, and the row carries **exactly one** `credential:` value from the
three-member closed set. The set-membership conjunct is the positive half — a pass writing no
`credential:` field at all satisfies the search alone. *L2 · `consolidationCredential.test.js` · T22 →
T31 · AC-4.2, NFR-2 · AT-K5.*

**PROP-CRED-04** — *Partial success has its own terminal status, asserted behaviourally.* A pass with
**≥ 2** promotions of which exactly one hits a §6.3 failure class terminates verbatim
**`promoted-degraded`** — neither `promoted` nor `no-op` — with the landed promotions carrying their
observables (`pr:` populated, their ids in the log) and the failed one under the `degraded` route
naming its failure class (AT-K7). Its paired negative: a pass that promoted nothing else and degraded
its **only** promotion terminates `no-op`, never a bare `promoted` (AT-K3). The pair is what pins the
status to the *shape* of the outcome rather than to the presence of a degradation; §8's rendering
property sees the string, this one sees the behaviour. *L2 · `consolidationCredential.test.js` · T22 →
T30 · AC-4.3, §12.1 · AT-K3, AT-K7.*

## 8. Properties — rendering and the report

Subjects: the seven render functions and the configuration reader (§10.3, §10.4, §11). File:
`consolidationReport.test.js` (L1 + L2), red owner **T24** (batch 3) in two blocks — `T29 — renderers`
and `T31 — ER-6 discriminator` — green owners **T29** and **T31**.

### 8.1 The log row

**PROP-RPT-01** — *`pr:` and `suppressed-by:` are two fields, never one.* A pass that opened a PR
**and** suppressed another proposal: `pr:` carries this pass's PR and `suppressed-by:` carries the
suppressed pair — **both present, neither merged into the other** (AT-L1). Its paired negative: a pass
that opened nothing and suppressed everything has `pr:` **empty**, its evidence in `suppressed-by:`,
and terminal `no-op` (AT-L2). Without the pair, a renderer folding one field into the other is green
on whichever fixture is written alone. *L1 · `consolidationReport.test.js` · T24 → T29 · AC-7.2, NFR-4 ·
AT-L1, AT-L2.*

**PROP-RPT-02** — *The log is append-only, one row per pass, and no earlier record is edited in
place.* Any pass other than `skipped-cadence`: **exactly one** log row appended, **one** report body
returned, and every prior record **byte-identical** before and after. The byte-identity over the
prefix is the conjunct that makes "append-only" falsifiable — counting rows alone is green on a
whole-file rewrite that happens to preserve the count. *L2 · `consolidationReport.test.js` · T24 →
T31 · AC-7.2, AC-1.3 · AT-L3.*

**PROP-RPT-03** — *An empty promotions section is present and empty; omission is a failure.* A report
with no promotions carries the promotions section **explicitly empty** — the reader must be able to
tell "nothing was promoted" from "this report does not say". Asserted as section presence plus empty
contents, never as a substring absence. *L1 · `consolidationReport.test.js` · T24 → T29 · AC-7.1 ·
AT-L4.*

**PROP-RPT-09** — *The report names what it consumed and what it deferred, both populated on a path
where both are non-empty.* AC-7.1 enumerates six report obligations; four are discharged elsewhere
(terminal status and reason by PROP-RPT-04/05, the rung by PROP-PASS-06, promotions by route by
PROP-RPT-01/03, the effectiveness table by PROP-EFF-01…05). The two with no other home are asserted
here, on **one** pass whose consumed set is non-empty and which deferred at least one item to human
judgment: **(a)** `consumed:` names the LEARNINGS **by basename**, **set-equal** to the set the pass
froze at step 1 — the same set NFR-5's `<!-- pdlc:consumed {passId} -->` block names, and asserted
equal to that block's contents, so the report and the log cannot disagree about what was consumed;
**(b)** `deferred:` is **present and non-empty**, naming the propose-only items awaiting operator
approval (an AC-5.4 consuming-repo retirement is the fixture's, since it is written to the proposal
file and **never** applied by the pass). Both fields are in PROP-RPT-04's **free-form** class, which
that property excludes from its vocabulary equality **by name** — so without this property they are
asserted by nothing at all, and a pass rendering neither field is green everywhere else. The paired
negative: on a pass with an **empty** consumed set and nothing deferred, both fields are **present and
explicitly empty**, never omitted (PROP-RPT-03's rule applied to these two fields — "nothing was
consumed" must be distinguishable from "this report does not say"). *L1 ·
`consolidationReport.test.js` · T24 → T29 · AC-7.1, NFR-5 · (no FSPEC AT), AT-L4 shape.*

### 8.2 The vocabulary oracle

**PROP-RPT-04** — *Enumerated-class values are set-equal to the authority file, in both directions,
over a fixture set spanning §12.1.* The domain is §10.3's **first class only**: `status:`, `trigger:`,
`reason:`, `credential:`, the `promotions:` route names, and the per-promotion verdict / state /
action / phase values. The **free-form class is excluded by name** — `pass:`, `date:`, `consumed:`,
`branch:`, `deferred:`, `pr:`, `suppressed-by:`, `rung:` — because those carry URLs, dates, branch
names and model ids, and comparing them against §1 would red a conforming implementation. Four legs,
each load-bearing:

1. Values observed across the fixture set ≡ the doubles' transcription of §1, **both directions**.
2. The free-form class excluded **by name**, so narrowing the domain later cannot silently drop a
   direction.
3. §6.4's frozen catalogues ⊆ and ⊇ that transcription.
4. The leg that reads the **authority file itself**: a three-way set equality against
   `docs/_constraints/pdlc-consolidation-vocabularies.md` §1's table, plus a pin that its `Version`
   cell still reads **`1.4`** (`:7`). Without leg 4 the first three compare two transcriptions with
   each other and are green while the shipped vocabulary drifts underneath them.

Both directions of leg 1 are load-bearing and neither may be dropped when the domain is narrowed:
**no enumerated value without a §1 row** catches an invented status; **no §1 row unused across the
fixture set** catches a deleted branch — which is why the fixture set must span every §12.1 scenario
rather than one happy path. The parser takes an injected `root` (DC-04), never `process.cwd()`. *L1 +
L3 · `consolidationReport.test.js` · T24 → T29 · AC-7.1, NFR-5 · AT-L5.*

**PROP-RPT-05** — *An illegal `(status, reason)` pair is dropped and the drop is announced; a legal
one is not.* Two fixtures over one code: the pair legal at `Version` 1.4 **appears** in the row; the
pair illegal at 1.4 is **dropped** and the report body carries a notice **naming** it. The control is
`no-cadence-datum`, which must **never** be dropped — §1 permits it with `refused`, and REQ-CONS-01
decides it **before** the marker check, so a filter keyed on the wrong precedence loses it. The notice
is the positive conjunct: a silent drop and a code that was never derived are indistinguishable in
the row. *L1 · `consolidationReport.test.js` · T24 → T29 · AC-7.1 · AT-L5 (dropped-code arm).*

### 8.3 Configuration

**PROP-RPT-06** — *Every configuration key defaults, and the three absent-section shapes are
distinguished.* No `.claude/pdlc.config.json` ⇒ every key takes its documented default and the pass
runs (AT-N1). A configured key ⇒ that key **keeps its value** and the others still default, so
defaulting is per key and not whole-object (AT-N2). A `consolidation` value present but **not an
object** ⇒ every key defaults **and the report distinguishes this from an absent section** — the
distinguishing conjunct is the property, since defaulting alone is identical in the two cases and a
malformed section is an operator error the report must surface (AT-N3). *L2 ·
`consolidationReport.test.js` · T24 → T31 · REQ §4a, §11 · AT-N1, AT-N2, AT-N3.*

**PROP-RPT-07** — *An unresolvable `pluginRepository` is reported, never silently replaced.*
`pluginRepository` set to a name that does not resolve ⇒ reason `repository-unresolved` and the
**configured value recorded verbatim** — **not** a silent fallback to the current repository. Verbatim
recording is what lets an operator see the typo; a reason code alone leaves the wrong value invisible.
*L2 · `consolidationReport.test.js` · T24 → T31 · REQ §4a, AC-3.5 · AT-N4.*

### 8.4 The ER-6 discriminator

**PROP-RPT-08** — *The ER-6 loss is asserted rather than hidden, and the report body stands in for the
missing union member.* `routeOf`'s `"proposal-file"` outcome is an in-module control value that is
never rendered; until **ER-6** lands (the `Route` union in the vocabularies file has no proposal-file
member) the record carries `route: "degraded"`. That fails safe — `enactedByLog` does not enact on a
`degraded` record, so the item is re-proposed, which is the right behaviour for something awaiting
operator approval — but it makes a **routed propose-only** item and a **degraded PR attempt** read
alike in the record. Two fixtures, one control: a `revise` on a `DOMAIN-CONSTRAINTS.md` target (routed
propose-only) against a `branch-exists` degradation. Assert **both**:

- the **sameness** that is the loss — `route: "degraded"` in **both** records, asserted explicitly
  rather than left unmentioned; and
- the **difference** that stands in for it — the degraded body names a vocabularies §1 reason code and
  the routed body names **none**, asserted in **both** directions.

When ER-6 lands, this control **simplifies a passing test** rather than exposing a silent
divergence — which is the test of whether the interim was specified honestly. *L2 ·
`consolidationReport.test.js` · T24 → T31 · TSPEC §7.6, §12.4 · no FSPEC AT (registered as an
unnumbered §12.2 row).*

## 9. Properties — the pass end to end

Subject: `main()` driven end to end with every seam doubled (§2), never the internals. Owner: PLAN
**T31** (batch 7), across `consolidationPass.test.js`, `consolidationRoute.test.js`,
`consolidationLifecycle.test.js`, `consolidationCredential.test.js` and — for §9.2's two ladder
properties, whose red owner is **T06** and whose call-site arm is un-skipped by **T11** — 
`consolidationRung.test.js`. These are the L2 properties
no unit-level oracle can reach: the trigger's effect on the whole pass, the model ladder's report
obligations, what a late failure leaves behind, and the two disciplines (release, `await`) that only
a whole-pass run exercises.

### 9.1 The trigger, end to end

**PROP-PASS-01** — *The threshold is exercised from both sides by one constructed fixture family.* A
corpus fixture parameterised on `(n, k, volumeThreshold)` — `n` LEARNINGS under the §3.1 globs, `k`
of their basenames named in the log's legacy region, no row carrying a datum status. At **`(5, 2,
5)`**: the un-consolidated set has `n − k` = 3 members, the volume test does **not** fire, the cadence
test fires on the empty-datum branch, and the row records trigger `cadence` with reason
`no-cadence-datum` (AT-C1). At **`(6, 0, 5)`**: the **volume** test fires and the row records trigger
`volume` (AT-C1b). One family, both sides, so the property does not depend on which side the
repository happens to be on. The fixture is **constructed, never the live repository** (PROP-FIX-02):
the corpus grows with every delivered feature — this one included — so a Given pinned to HEAD inverts
on its own PR. *L2 · `consolidationPass.test.js` · T20 → T31 · AC-1.1, AC-1.2 · AT-C1, AT-C1b.*

**PROP-PASS-02** — *Each of the three triggers is reachable, and the skipped tick is observable.*
Volume threshold met with `cadenceHours` **not** elapsed ⇒ the pass runs with trigger `volume`
(AT-C2). Direct `/pdlc:consolidate-learnings` invocation with cadence not elapsed by any measure ⇒
trigger `manual`: the manual entry is **never** gated by cadence (AT-C4). Under threshold and cadence
not elapsed ⇒ the invocation **returns a report body carrying terminal status `skipped-cadence`**
(§10.1 row 3) — and no log row appended, no LEARNINGS body read, no `passId` minted, no git call made
(AT-C3). The returned body is the **positive conjunct** and is required: the four absences alone are
satisfied by a pass that crashed at step 3 or never ran. *L2 · `consolidationPass.test.js` ·
T20 → T31 · AC-1.1, AC-1.2, AC-7.2 · AT-C2, AT-C3, AT-C4.*

**PROP-PASS-03** — *The cadence datum is the latest row of a datum **status**, not the latest row.* A
log whose rows in file order are a `promoted` row dated D1 then a **later** `refused` row dated D2 (D2
> D1, the `refused` row last in the file): the datum is **D1**. `refused` is not one of §2.3's four
datum statuses, and the ordering is what falsifies an implementation taking the last row
unconditionally — a fixture whose last row is already a datum row cannot see the defect. *L2 ·
`consolidationPass.test.js` · T20 → T31 · AC-1.1 · AT-C5.*

**PROP-PASS-04** — *`passId` counts within a date and restarts across dates.* A log already carrying
`{today}-1` ⇒ the next id is `{today}-2` (AT-C6). A log whose newest rows all carry a **previous**
date (e.g. `{today-1}-3`), no row for `{today}`, and one of those rows **unparseable** ⇒ the next id
is `{today}-1`: the counter restarts per date rather than continuing the previous date's `n`, and the
unparseable row contributes **no** `m`. The unparseable row is the conjunct separating "restarts per
date" from "takes the max of whatever parsed" (AT-C7). *L2 · `consolidationPass.test.js` · T20 →
T31 · §8.1 · AT-C6, AT-C7.*

**PROP-PASS-05** — *The trigger decides whether a pass runs, never what clears the bar.* One fixed
corpus and one fixed configuration, run **twice** — once where the volume test fires (trigger
`volume`), once where only the cadence test fires (trigger `cadence`). The two promotion sets are
**set-equal** by `(failure-mode-id, action)` and the AC-2.3 evidence is **identical** in both reports.
NFR-3 is comparative: a trigger-sensitive promotion set is exactly the failure this property exists
to catch, and set-equality rather than containment is what makes a promotion dropped on one arm
visible. The trigger recorded on each arm is the closed-set value NFR-3a requires (`cadence` on one,
`volume` on the other), which is what makes "the bar held on both" checkable rather than asserted —
this is the sole home of the invariant, PROP-TRG-05 having been retired into it (§5.1). *L2 ·
`consolidationPass.test.js` · T20 → T31 · NFR-3, NFR-3a · AT-C8.*

**PROP-PASS-11** — *A `no-op` pass still reports, still restates, and still releases — on both of the
causes that differ in what the pass consumes.* AC-1.4's obligations are **positive** and none of them
is discharged by the absences other properties assert (no PR: PROP-RPT-01; no proposal file:
PROP-RTE-06(b); terminal status: PROP-CRED-04). AC-1.4 has **three** causes (`REQ:224-233`); two
Givens here, because those two are the ones that differ exactly where AC-5.3 and AC-5.5
count: **(i)** the un-consolidated set is **empty**, and **(ii)** every promotion the pass would have
made was **duplicate-suppressed** (NFR-4), so the consumed set is non-empty. The **third** cause —
REQ §4b's all-unreadable corpus, whose pass consumes nothing and is therefore streak-equivalent to
(i) — is carried by **PROP-COR-09**, which asserts the observables that distinguish it; its
restate-and-release obligations are cause (i)'s, pinned here, because it reaches `finishPass` through
that same exit. On **both** Givens below: terminal
status is verbatim **`no-op`** in the pass's single appended log row; the **AC-5.2 effectiveness
table is present** in the report, restating each prior promotion's **standing** verdict and state —
including an `unmeasurable` already reached, which is the conjunct that fails an implementation
emitting the table only when it has a fresh verdict to put in it; and the AC-1.3 marker is
**released** (PROP-PASS-09's set-equality ranges over `no-op`, and this property pins the two causes
it names above — not the status's whole cause set, whose third member is PROP-COR-09's). The two Givens are asserted apart, not pooled, because **which streaks a pass
advances is decided by consumed-set emptiness, never by the `no-op` label**: on (i) no AC-5.2 verdict
is produced and neither the `ineffective` nor the `unmeasurable` streak advances, while on (ii) the
pass **is** an evaluated pass and the `unmeasurable` streak **does** advance (AC-5.5). Pooling them
into one `no-op` fixture is precisely the defect REQ warns against, and an implementation keying
either streak on the label rather than on the consumed set passes a single-fixture version of this
property. *L2 · `consolidationPass.test.js` · T20 → T31 · AC-1.4, AC-5.3, AC-5.5 · (no FSPEC
AT), REQ AC-1.4 third and fourth sentences.* **Placement note:** the file is derived from the
property's subject — a whole pass — not from a PLAN block that declares it. PLAN T20's `T31` block
names (i) as its only remaining unregistered obligation and PLAN T23 declares two cases that are not
this one, so no PLAN block currently declares AC-1.4's no-op case; §13.3 erratum 7 routes that gap
upstream. The trailer's `T20 → T31` is this document's judgment pending that erratum.

### 9.2 The model ladder

**PROP-PASS-06** — *A fallback is never silent, and the primary is never over-reported.* A primary
rung failing its model-resolution check with a fallback that resolves (§2.6 row 2) ⇒ **three**
conjuncts, all required: the pass **proceeds** to a non-`failed` terminal status; the report body
carries the `ADVISORY_MODEL_FALLBACK:` line **verbatim**
(`pdlc/workflows/orchestrate-dev.js:1859`); and `rung:` names the **fallback** rung. A silent
downgrade passes any two taken alone, which is why this is the only property that can fail a pass
recording the primary rung while running on the fallback (AT-M7). Paired negative: a primary that
resolves (§2.6 row 1) ⇒ `rung:` names the **primary** and the body carries **no**
`ADVISORY_MODEL_FALLBACK:` line — without it, a pass that always reports the fallback satisfies the
positive (AT-M8). *L2 · `consolidationRung.test.js` · T06 → T31 · AC-1.5, AC-1.6, §2.6 · AT-M7,
AT-M8.*

**PROP-PASS-07** — *Widening the resolver's signature changes nothing at the shipped call site.*
`resolveAdvisoryRung` after §15.3's widening, called **without** a `skill` argument — the shipped call
site unchanged — dispatches `ADVISORY_RUNG_SKILL` (`"se-review"`,
`pdlc/workflows/orchestrate-dev.js:1797`) on **both** ladder rungs **and** on the memoised path, and
every observable of the existing call site is unchanged. This is the regression property for the one
edit this feature makes to already-shipped behaviour; the pass's own call, which passes a `skill`, is
covered by PROP-MRK-03 and PROP-PASS-06. *L2 · `consolidationRung.test.js` · T06 → T11/T31 · AC-1.5,
TSPEC §15.3 · AT-M10.*

### 9.3 A late failure

**PROP-PASS-08** — *A failure after step 11 leaves the completed work durable and reports the split.*
A pass whose step-8 dispatch **succeeds** and whose **step-13 proposal-authoring** dispatch returns
`{kind: "dispatch-error"}` (§2.6 row 4 after step 8), with **one proposal already routed and one
not**: terminal `failed` with **no** reason code (S-11c); the §8.3 effectiveness table **is** appended
(step 11 completed); **exactly one** failure-mode record is appended — for the routed proposal, none
for the unrouted one; the §5.4 commit runs and the already-made append is **durable in it**; the
marker is released; and the report body carries the error message **verbatim** **and** the
routed/unrouted split. Distinct from PROP-MRK-03(ii), whose Given fails the **first** dispatch and so
has no table and no records to leave behind — the two are the positive and negative halves of §10.2
order 3 and neither may be dropped. *L2 · `consolidationPass.test.js` · T20 → T31 · AC-7.1, AC-7.2, §12.1
S-11c · AT-M9.*

### 9.4 Two whole-pass disciplines

**PROP-PASS-09** — *The marker is released on **every** terminal status, asserted by set-equality over
the status vocabulary.* Run the pass once per terminal status the fixture set reaches; the set of
statuses on which the marker was observed released is **set-equal** to the set of terminal statuses
reached, minus `refused` — where the marker belongs to the *other* pass and releasing it would be the
defect (PROP-MRK-01) — and minus `skipped-cadence`, where no marker was taken (PROP-PASS-02).
Set-equality rather than a per-status assertion list, because a status added to the vocabulary and
forgotten by the release path is invisible to a list; PROP-RPT-04's fourth leg pins the vocabulary
this equality ranges over, so the two cannot drift apart silently. *L2 · `consolidationLifecycle.test.js` ·
T23 → T31 · AC-1.3, §12.1.*

**PROP-PASS-10** — *The `await` discipline is asserted by mutation, not by inspection.* The doubles'
`asAsync` resolves recordings on a **macrotask** (PROP-DBL-02), so a missing `await` on an
IO-returning seam is observable as a recording that has not landed when the pass returns. The owed
check, discharged once at implementation time and recorded in the test's comment: **delete one
`await` inside `finishPass`, observe this property go RED, restore it**. Without the mutation the
property is a claim about the doubles rather than about the pass — and a source-text scan for `await`
(the `AWAIT_SCAN_SOURCES` idiom at `pdlc/workflows/__tests__/runtimeBundle.test.js:1040`) is
supplementary only, since it cannot see an `await` that is present but on the wrong expression. *L2 ·
`consolidationLifecycle.test.js` · T23 → T31 · NFR-5, AC-7.2, TSPEC §7.3.*

## 10. Properties — build, source text, and traceability

Subjects: the pre-flight gate, the shipped source text this feature edits, the third bundle, and the
two-direction traceability equality. Files: `consolidationPreflight.test.js` (T00),
`consolidationBuild.test.js` (red T03, greens T10, T12, T07, T08, T32, T33),
`runtimeBundle.test.js` (T13, **exists at HEAD**), `consolidationTraceability.test.js` (T05, green on
write). All L3 — they read tracked source text and build outputs, never behaviour.

### 10.1 The pre-flight gate

**PROP-PRE-01** — *Every §3 prerequisite is asserted to exist at HEAD, by the strongest means each
admits, and existence only.* Exported symbols by **import**; `gitWithLockRetry`, the seven
`runtime-adapter.js` functions, the five `build-runtime.mjs` declarations and the two scan sets by
**source-text presence**; the vocabularies `Version` cell by **read**. Never the shape a later task
creates — a pre-flight that asserted post-condition shape would be red on every wave before the one
that satisfies it, which is the opposite of a gate. `gitWithLockRetry`'s missing `export` is recorded
as **scheduled-blocking** (owned by T11), not as promoted work: the gate reports the gap it cannot
close rather than failing on it. *L3 · `consolidationPreflight.test.js` · T00 · PLAN §3 BL-PREREQ.*

**PROP-PRE-02** — *The config branch carries a positive assertion in both arms.* The gate branches on
`.claude/pdlc.config.json` presence, and **each** arm asserts something true of that arm — the file's
parse in the present arm, the documented defaulting in the absent arm. A branch with an assertion in
one arm only is a conditional skip wearing a test's clothes, and the untested arm is the one every
fresh clone takes. *L3 · `consolidationPreflight.test.js` · T00 · PLAN §3.*

### 10.2 Source text this feature edits

**PROP-SRC-01** — *The ignore rule is present verbatim, adjacent, and in the anchored form.* The
tracked `.gitignore` carries the comment line `# pdlc consolidation in-progress marker — working tree
only (AC-1.3)` and, **adjacent** to it, the single pattern `docs/_decisions/.consolidation-lock` —
both **verbatim**, in the shape `runtimeBundle.test.js` already uses for source-text reads. The
pattern **contains a separator** and is written without a leading slash and without `**/`: per
gitignore(5) such a pattern is already anchored to its own `.gitignore`'s directory, while a
slash-free or `**/`-prefixed form would match at every depth. Adjacency is asserted because a comment
that has drifted away from its rule explains nothing. Paired with PROP-MRK-04's behavioural
assertion, which is the half that cannot be satisfied by a pass making no commit. *L3 ·
`consolidationBuild.test.js` · T03 → T10 · AC-1.3 · TSPEC §3.3.*

**PROP-SRC-02** — *The adapter's one widened clause is present, and its old wording occurs exactly
once.* The widened absolute-path clause appears **verbatim** inside `rtWriteFile`
(`pdlc/workflows/runtime-adapter.js:802-811`), **and** the string `relative to the repository root`
occurs in `runtime-adapter.js` **exactly once** — the occurrence at `:805`. Exactly-once is the
conjunct that makes the edit auditable: a containment check is green after a second copy of the old
wording is pasted in elsewhere. **No assertion is made over `rtReadFile`**, which carries no such
clause and gains none — it reaches disk through `rtReadProbe` (`:369`) under a *cwd* instruction
(`:374`) that resolves an absolute path verbatim, so an assertion there could only pin text that does
not exist. *L3 · `consolidationBuild.test.js` · T03 → T12 · TSPEC §11.3(e), §5.6(a).*

**PROP-SRC-03** — *The injection protocol is set-equal to §5.1's seam names, never merely contained.*
The key set of `rtConsInjections()` is **set-equal** to §5.1's seam names **minus `_now`**. Equality
and not containment: containment is the assertion that still passes with `_checkFile` missing — the
exact failure `adapterProbe.test.js:253-258` shapes but does not reach — and a missing seam is
invisible to a subset check (O-2). *L3 · `consolidationBuild.test.js` · T03 → T12 · TSPEC §12.2.*

**PROP-SRC-04** — *The two SKILL.md prompts carry their four obligations verbatim, in two blocks, one
per owner.* In `consolidate-learnings/SKILL.md`: the block/legacy predicate sentence and the `{topic}
= failure-mode-id` route. In `harvest-learnings/SKILL.md`: the `Phases exercised` row and the
verbatim-copy `failure-mode-id` line. Each asserted **verbatim**, in the shape the other source-text
blocks use. Written as **two** blocks with two conjuncts each rather than one block carrying all
four, because a single block holds two green owners hostage to each other and neither can un-skip it
alone. These prompts are the **producing** side of PROP-EFF-03's receive-side property: source text is
the only observable an LLM-authored artifact offers, which is why the coverage here is textual by
construction and the residue is carried as O-C6 (§13.2). *L3 · `consolidationBuild.test.js` · T03 →
T07, T08 · AC-5.2, AC-6.1 · TSPEC §12.2.*

### 10.3 The build

**PROP-BLD-01** — *The third bundle is buildable, stamped, import-free, and shaped like the other
two.* After the build: `build-runtime.mjs --check` is **clean**, `consolidate-learnings.bundle.js`
carries its **manifest row stamped**, the emitted bundle contains **no `import(`**, and `meta` is the
**first statement and a pure literal**. The bundle cannot `import`, which is why the four
`const X = __dev.X;` prelude lines that re-bind `resolveAdvisoryRung`, `MERGE_GUARD_DEFAULTS`,
`mergeCommandFor` and `gitWithLockRetry` are the only available mechanism — the shape `queueModule`'s
prelude already uses (`build-runtime.mjs:113-123`). All five `dist/` files are re-stamped in the same
wave, because the widened resolver's bytes live in every tracked artifact and a partial rebuild fails
CI's sync job. *L3 · `consolidationBuild.test.js` · T03 → T32 · TSPEC T-02 · PLAN §5's
`postWavePathspecs`.*

**PROP-BLD-02** — *`CLAUDE.md`'s tracked-outputs list is set-equal to the manifest, in both
directions.* The set of artifacts `CLAUDE.md`'s runtime-build section names is **set-equal** to the
set of tracked files under `pdlc/workflows/dist/`, and the manifest's row count agrees with it. This
case is **red at today's HEAD by design**: `CLAUDE.md` names three outputs and closes "**Those
three** are the tracked, shipped outputs", a sentence already false because
`pdlc/workflows/dist/pdlc-cli.mjs` is tracked (`git ls-files pdlc/workflows/dist/`) and carries a
manifest row. After T33 the equality reads **five** tracked files and **four** manifest rows — §1's
vocabulary — and greens. Set-equality in both directions is what makes the pre-existing error visible
at all: a containment check in either direction alone is green on the false sentence. *L3 ·
`consolidationBuild.test.js` · T03 → T33 · TSPEC §12.2, §9.1 erratum 3.*

**PROP-BLD-03** — *Both static-scan axes widen together, in one commit.* `AWAIT_SCAN_SOURCES`
(`pdlc/workflows/__tests__/runtimeBundle.test.js:1040`) gains `"consolidate-learnings.js"` **and**
`AT19_SEAM_NAMES` (`:215`) gains `_envPresent` and `_makeTempDir`, in the **same** commit. Widening
only the source set leaves the scan green on exactly the seams this feature invents, and
`RLH-SCAN-01` (`:626`) would report green over them — a scan that has been taught to look at a file
but not at its seams is worse than no scan, because it reports coverage it does not have. `_now` is
deliberately **not** added: it is sync by contract and awaiting a number is noise. The widened scan
passes immediately (T02's skeleton makes no seam call) and is the standing guard for every module
task from batch 4 on, which is why it lands before the first behaviour. *L3 · `runtimeBundle.test.js`
(**exists at HEAD**) · T13 · TSPEC §13.3(ii), §11.3(c).*

### 10.4 Traceability

**PROP-TRC-01** — *The FSPEC register and TSPEC §12.3 are set-equal in both directions, and the count
is read rather than transcribed.* Parse the FSPEC's AT register and TSPEC §12.3's table and assert
**set equality both ways**: every register id has **exactly one** file, and no file claims an id the
register does not carry. Ids are extracted by matching the `AT-…` token grammar over the **whole
cell** and **de-duplicated**, so `(no FSPEC AT)` prose contributes nothing unless it names an id, and
the report row's deliberate citation of AT-L5 is idempotent. The parser takes an **injected `root`**
(DC-04) and consults no ambient state. **The count is read, never hard-coded** — a transcribed count
is a second source of truth that goes stale on the next erratum round. Two conjuncts sit beside the
equality to make a failure legible rather than merely red:

1. a **version pin** — FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`, in the shape
   PROP-RPT-04's fourth leg pins the vocabularies cell at `1.4` — so a later erratum round fails as
   *"the register moved"* rather than as *"the code is wrong"*; and
2. a **non-vacuity floor** — the parsed register is non-empty and its size is reported in the failure
   message, so **two empty parses cannot agree perfectly** (O-2's degenerate case).

Measurement of record, 2026-08-06: enumerating `AT-…` tokens over FSPEC §13's register range
(`:2089-2239`), de-duplicated, gives **99** ids at FSPEC v11.5. The task's stated precondition — §9.1
erratum 4, which assigns `AT-M11`, `AT-Q13` and `AT-R7` — has **landed** at TSPEC v2.0, so this
property is **green on write** and carries no `describe.skip`. *L3 ·
`consolidationTraceability.test.js` · T05 · NFR-5 · PLAN §4 T05.*

## 11. Generator-driven properties

Six strategies, one per parameterisable component, all drawn from `driftGenerators.js`'s
`seeded`/`resolveSeed` (`pdlc/workflows/__tests__/helpers/driftGenerators.js:76`, `:134`) — **no
property-testing dependency is added**, matching the shipped decision recorded in that file's header.
Red owner **T19**, file `consolidationProperties.test.js` (L5); greens **T25**, **T26**, **T27**.
Every generator is bounded (PROP-GEN-00): a failing seed is reported in the failure message so the
case is reproducible without re-running the suite.

**PROP-GEN-01** — *The two-region predicate is total, and its two sets partition the corpus.* Over
random interleavings of openers, closers, stray basenames and prose, against a random enumerated
corpus: every basename **inside any block** is consolidated; the predicate **never throws**; and every
enumerated file lands in **exactly one** of the two sets. The partition is the positive conjunct — a
predicate returning `∅` for both sets satisfies totality alone. *L5 · T19 → T25 · §7.1 · TSPEC §11.4
row 1.*

**PROP-GEN-02** — *The minted `passId` dominates, ignores garbage, and does not depend on row order.*
Over a random multiset of rows with a random subset made unparseable: the minted id is **strictly
greater** than every parseable `{today}` id; unparseable rows change **nothing**; and the result is
**invariant under row permutation**. Strict dominance is the positive conjunct that stops a constant
from satisfying the invariance (O-3). Its worked examples are PROP-PASS-04. *L5 · T19 → T26 · §7.2 ·
TSPEC §11.4 row 2.*

**PROP-GEN-03** — *Config corruption is per key, and `invalidKeys` is set-equal to the corrupted
subset.* Over a random subset of keys corrupted **by type**: every uncorrupted key **keeps its
configured value**; every corrupted key takes its **documented default**; and `invalidKeys` is
**set-equal** to the corrupted subset. Set-equality in both directions is what catches both a
silently swallowed corruption and a key reported invalid that was not. Its worked examples are
PROP-RPT-06. *L5 · T19 → T25 · §7.8 · TSPEC §11.4 row 3.*

**PROP-GEN-04** — *Escalation counting attributes exactly the well-formed entries and invents no
key.* Over a random entry sequence with a random subset missing `Feature` or `Seam`: the **total
attributed count equals** the number of entries carrying **both** rows, and **no count is attributed
to a key absent from the input**. The second half is the positive conjunct that stops a function
attributing everything to one bucket. Stated once here and cross-referenced from §6 as PROP-ADV-06.
*L5 · T19 → T27 · §7.7 · TSPEC §11.4 row 4.*

**PROP-GEN-05** — *The merge fold is permutation-invariant, and one ordering matches §7.4's table
literally.* Over a group of **≥ 2** proposals sharing `(failureModeId, action)` in a random
permutation — the shared id **derived, never assigned**: the generator draws one random `(phase,
artifact)` pair and **computes** `failureModeId(phase, artifact)` from it (PROP-GEN-00), because
assigning the id independently would admit `(id, phase, artifact)` triples no pass produces and a
counterexample there is not a defect. The fold is **invariant under permutation**, **and** for at
least one ordering the folded proposal's `kind`, `artifact`, `target`, `elidedKinds` and
`elidedArtifacts` equal values **transcribed literally from §7.4's fold table** — not read back off
the fold's own output, which would be an implementation echo. Order-invariance alone is **not** an
oracle: a function returning a constant, `[]` or `null` satisfies it (O-3). The subject is
`mergeProposals`, **not** `failureModeId`: §7.4's invariance argument is about the **fold**, and
`failureModeId(phase, artifact)` takes no proposals at all, so order cannot be a variable of it (an
earlier TSPEC draft named the wrong function). Its worked examples are PROP-RTE-04. *L5 · T19 → T26 ·
§7.4 · TSPEC §11.4.*

**PROP-GEN-06** — *The effectiveness table is order-invariant, one row per distinct id, each verdict
on its assigned arm.* Over two passes' records appended in a **random order**, dates unchanged: the
table is **invariant** under that order, **and** the row count equals the number of **distinct ids**,
**and** each row's `verdict` equals the arm §7.5 assigns it. The two positive conjuncts are what make
this more than an invariance claim — an empty table is order-invariant. Its worked examples are
PROP-EFF-01 and PROP-EFF-02. *L5 · T19 → T27 · §7.5 · TSPEC §11.4.*

## 12. Coverage matrix

Four sub-matrices, four axes. Each is read in **both** directions: no property without an obligation,
and no obligation without a property. Where a cell would be empty, §13 carries the reason — a named
gap, never a blank.

### 12.1 REQ acceptance criteria and NFRs → properties

Obligation labels are re-read from REQ **v2.1 §3/§4** rather than transcribed from an earlier draft;
property lists are derived from the per-property trailers in §§4–11, not maintained by hand.

| Obligation (REQ v2.1) | Properties |
|---|---|
| AC-1.1 cadence trigger — `cadenceHours` elapsed since the datum | PROP-PASS-01, PROP-PASS-02, PROP-PASS-03, PROP-TRG-03, PROP-COR-01…11 (the predicate the trigger counts). PROP-COR-12 and PROP-COR-13 are **not** trigger coverage: they are the L4 differential's pre-widening fixture and its validity pin, and their trailers cite `(no FSPEC AT), TSPEC §7.1 pin (b)` rather than an AC-1.1 obligation |
| AC-1.2 volume trigger — un-consolidated count at threshold | PROP-PASS-01, PROP-PASS-02 |
| AC-1.3 one pass at a time — the in-progress marker | PROP-MRK-01…04, PROP-PASS-09, PROP-RPT-02, PROP-SRC-01 |
| AC-1.4 a no-op pass still reports | PROP-PASS-11, PROP-RTE-06, PROP-EFF-06; PROP-COR-09 (the **third** cause — the all-unreadable corpus, and the only property asserting it) |
| AC-1.5 runs on the advisory rung and records it | PROP-PASS-06, PROP-PASS-07 |
| AC-1.6 falls back and says so | PROP-PASS-06 |
| AC-2.1 domain invariants append to `DOMAIN-CONSTRAINTS.md` | PROP-RTE-02, PROP-RTE-04 (kind 1 arms), PROP-PR-04 |
| AC-2.2 decisions write to `DECISIONS-{topic}.md` | PROP-RTE-03, PROP-RTE-04, PROP-ID-03, PROP-MRG-01, PROP-MRG-02 |
| AC-2.3 pattern-vs-coincidence bar | PROP-PR-08 (the bar's evidence in the PR body), PROP-PASS-05 (the bar unchanged under cadence) |
| AC-2.4 the log records date, consumed basenames, promotions | PROP-COR-11, PROP-RPT-01, PROP-RPT-02, PROP-PR-09 |
| AC-3.1 guard-set routing | PROP-RTE-01, PROP-RTE-02, PROP-PR-01 |
| AC-3.2 PR body obligations | PROP-PR-08 |
| AC-3.3 promotions share a PR, one commit each | PROP-PR-02 |
| AC-3.4 the PR URL is recorded in both carriers | PROP-PR-09 |
| AC-3.5 the PR cannot be opened — proposal fallback and reason codes | PROP-PR-06, PROP-RTE-06, PROP-RPT-07, PROP-CFG-03 |
| AC-3.6 pull request only, from `consolidation/{passId}` | PROP-PR-10 |
| AC-3.7 this feature's own controls never merge | PROP-PR-05 (runtime verb bound), PROP-PR-11 (conjunct (c)), §10's supplementary source scan |
| AC-3.8 / AC-3.8b same-repo clone, pathspec-scoped commit | PROP-PR-01, PROP-RTE-05, PROP-MRK-04 |
| AC-4.1 scoped credential | PROP-CRED-01 |
| AC-4.2 read at runtime from the named variable, redacted in the row | PROP-CRED-01, PROP-CRED-02, PROP-CRED-03 |
| AC-4.3 absent or invalid ⇒ degrades to AC-3.5's fallback | PROP-CRED-04 |
| AC-4.4 the operator's own `gh` is supported | PROP-CRED-01 |
| AC-5.1 every promotion records a structured failure mode | PROP-ID-01, PROP-ID-02, PROP-MRG-01…04, PROP-MRK-03, PROP-REC-01, PROP-REC-03, PROP-REC-06 |
| AC-5.2 effectiveness verdicts for every recorded promotion | PROP-EFF-01…05, PROP-REC-04, PROP-REC-05, PROP-SRC-04, PROP-GEN-06 |
| AC-5.3 the remediation ladder | PROP-EFF-06…09, PROP-REC-02, PROP-REC-05, PROP-PASS-11 |
| AC-5.4 retiring an `ineffective` promotion takes the same route | PROP-EFF-09, PROP-REC-02 |
| AC-5.5 the `insufficient-evidence` streak | PROP-EFF-06, PROP-PASS-11 |
| AC-6.1 advisory corpus states | PROP-ADV-01, PROP-ADV-03, PROP-ADV-04, PROP-ADV-06, PROP-SRC-04 |
| AC-6.2 over-escalation | PROP-ADV-03 |
| AC-6.3 seam-widening proposals | PROP-ADV-02, PROP-ADV-05 |
| AC-7.1 what the report contains | PROP-RPT-03, PROP-RPT-04, PROP-RPT-05, PROP-RPT-09, PROP-PASS-08 |
| AC-7.2 exactly one report on every path but `skipped-cadence` | PROP-RPT-01, PROP-RPT-02, PROP-PASS-02, PROP-PASS-08, PROP-PASS-10 |
| NFR-1 no promotion applied directly to a guard-set path | PROP-RTE-01, PROP-PR-01, PROP-PR-05 |
| NFR-2 the credential never appears in an artifact | PROP-CRED-03 |
| NFR-3 / NFR-3a the bar is trigger-independent, and the two triggers are distinguishable | PROP-PASS-05 |
| NFR-4 idempotence per `(failure-mode-id, action)` | PROP-ID-01, PROP-MRG-04, PROP-PR-02…04, PROP-PR-07, PROP-REC-03, PROP-REC-06, PROP-RPT-01 |
| NFR-5 never modifies a consumed LEARNINGS; records what it consumed | PROP-COR-07, PROP-COR-11, PROP-PASS-10, PROP-RPT-04, PROP-RPT-09, PROP-TRC-01 |

Both directions hold. No row is empty. Every property in §§4–11 appears above, in §12.4's
"no register id" list with its TSPEC or FSPEC citation, or — for the L5 generators and the shared
doubles and fixtures (PROP-GEN-00…06, PROP-DBL-01…03, PROP-FIX-01…03) — as infrastructure whose
obligation is discharged through the properties that consume it, named in §12.2's rows.

### 12.2 Test files → level, owners, properties

Red owner and green owners are read from PLAN §4's task table, and each property row is the set of
properties whose §§4–11 trailer names that file. Green owners are listed **per file**, so a file's
row carries the union of the blocks PLAN's RED task declares in it — `consolidationPass.test.js`
carries T28 and T31 because PLAN T20 writes exactly two blocks there (`T28 — marker predicates` and
`T31 — pass lifecycle`, `PLAN:264`) — while a *property* trailer names only the block that un-skips
that property. A per-property green is therefore a subset of its file's green list, never a
disagreement with it.

**Two rows are derived from subject rather than from PLAN text, and both are routed upstream.**
PROP-PASS-01…05's `consolidationPass.test.js` row *is* read from PLAN — T20's `T31` block enumerates
AT-C1 … AT-C8 there (`PLAN:264`) — but PROP-PASS-11 is not: no PLAN block declares AC-1.4's no-op
case, so its file is derived from the property being a whole-pass property (§13.3 erratum 7).
Likewise PROP-COR-10 and PROP-COR-11 sit here because their AT-P10/AT-P6 conjuncts are whole-pass
writes, while TSPEC §12.3 and PLAN T14 register those ids on `consolidationPredicate.test.js`
(§13.3 erratum 6). Every other row in this table is read from PLAN §4 directly.

**Spanning convention.** A property spanning two files appears in **both** rows here, and in **both**
task rows of §12.3. Its trailer pairs each file with that file's own task — `{file} (RED → greens)`,
as PROP-CFG-03 and PROP-FIX-02 do — because the two axes do not factor: the file axis and the task
axis are the same relation read two ways, and a reader deriving what a task owes must be able to
recover the file it owes it in. Where §12.3 shows one task row spanning a property that lives in
another task's file, that is the spanning convention at work, not a contradiction.

| File | Level | Red | Green | Properties |
|---|---|---|---|---|
| `consolidationPreflight.test.js` | L3 | — (T00, green on write) | — | PROP-PRE-01, PROP-PRE-02 |
| `helpers/consolidationDoubles.js` | — | — (T01) | T31 (the mutation check) | PROP-DBL-01…03, PROP-FIX-01, PROP-FIX-02 |
| `consolidationBuild.test.js` | L3 | T03 | T07, T08, T10, T12, T32, T33 | PROP-SRC-01…04, PROP-BLD-01, PROP-BLD-02 |
| `consolidationHookParity.test.js` | L4 + L3 | T04 | T09, T25 | PROP-COR-07, PROP-COR-08, PROP-COR-12, PROP-COR-13, PROP-FIX-03 |
| `consolidationTraceability.test.js` | L3 | — (T05, green on write) | — | PROP-TRC-01 |
| `consolidationRung.test.js` | L2 | T06 | T11, T31 | PROP-PASS-06, PROP-PASS-07 |
| `runtimeBundle.test.js` (**exists at HEAD**) | L3 | — | T13 | PROP-BLD-03 |
| `consolidationPredicate.test.js` | L1 | T14 | T25 | PROP-COR-01…06, PROP-CFG-01, PROP-CFG-02 |
| `consolidationIdentity.test.js` | L1 + L2 (folds) | T15 | T26, T31 | PROP-ID-01…03, PROP-MRG-01, PROP-MRG-03, PROP-MRG-04, PROP-RTE-03, PROP-RTE-04 |
| `consolidationParse.test.js` | L1 | T16 | T26 | PROP-REC-01…06, PROP-TRG-03, PROP-TRG-06 |
| `consolidationEffectiveness.test.js` | L1 | T17 | T27 | PROP-EFF-01…09, PROP-REC-05 (§8.3/§8.5 halves) |
| `consolidationAdvisory.test.js` | L1 | T18 | T27 | PROP-ADV-01…05 |
| `consolidationProperties.test.js` | L5 | T19 | T25, T26, T27 | PROP-GEN-00…06, PROP-ADV-06, PROP-COR-03, PROP-CFG-01 (L5 halves) |
| `consolidationPass.test.js` | L2 | T20 | T28, T31 | PROP-MRK-01…04, PROP-PASS-01…05, PROP-PASS-08, PROP-PASS-11, PROP-COR-09, PROP-COR-10, PROP-COR-11, PROP-CFG-03, PROP-FIX-02 (spanning) |
| `consolidationRoute.test.js` | L2 | T21 | T28, T30, T31 | PROP-RTE-01…06, PROP-PR-01…11, PROP-ID-03, PROP-MRG-01, PROP-MRG-02, PROP-MRG-04 |
| `consolidationCredential.test.js` | L2 | T22 | T30, T31 | PROP-CRED-01…04 |
| `consolidationLifecycle.test.js` | L2 | T23 | T31 | PROP-PASS-09, PROP-PASS-10, PROP-DBL-03 |
| `consolidationReport.test.js` | L1 + L2 | T24 | T29, T31 | PROP-RPT-01…09, PROP-MRG-03 (item 4), PROP-CFG-03 |
| `helpers/seams.js`, `helpers/driftGenerators.js` (**exist at HEAD**) | — | — | — | reused by PROP-DBL-*, PROP-GEN-* (DC-08: reuse, never re-declare) |

Every file named above is either **explicitly planned new** by PLAN §4 or **exists at HEAD** and is
marked so; no property names a file that is neither. The AT-Q properties sit in
`consolidationRoute.test.js` because PLAN T21 owns AT-Q1 … AT-Q13 in its `T30 — clone and seams` and
`T31 — routes end to end` blocks; a trailer placing them in `consolidationPass.test.js` would put
them in a file no RED task creates them in.

### 12.3 PLAN §4 tasks → properties

Rows read `{RED owner} → {green un-skippers}`, matching the trailers exactly.

**Green lists here are a union over the row's properties, so they may exceed the §12.2 row for the
same task's file.** A task's green list is the union of the greens carried by every property filed
under it, including spanning properties whose other home is in another task's file; a file's green
list in §12.2 is the union of the blocks PLAN's RED task declares *in that file*. The two therefore
differ exactly where a spanning property brings a foreign green in. `T24 → T26/T29/T31` (below)
exceeds `consolidationReport.test.js`'s `T29, T31` (§12.2) by T26, which PROP-MRG-03 brings from
`consolidationIdentity.test.js`; `T15 → T26/T28/T31` exceeds that file's `T26, T31` by T28, which
PROP-ID-03 brings from `consolidationRoute.test.js`. Neither is a residue of re-derivation: a §12.3
green absent from the matching §12.2 row must be traceable to a named spanning property, and both are.

| Task | Properties it owes |
|---|---|
| T00 pre-flight | PROP-PRE-01, PROP-PRE-02 |
| T01 doubles | PROP-DBL-01…03, PROP-FIX-01, PROP-FIX-02 (PROP-FIX-03 **consumes** T01's harness but is declared in T04's file, so it is filed under T04 on both axes) |
| T03 → T07/T08/T10/T12/T32/T33 | PROP-SRC-01…04, PROP-BLD-01, PROP-BLD-02 |
| T04 → T09/T25 | PROP-COR-07, PROP-COR-08, PROP-COR-12, PROP-COR-13, PROP-FIX-03 |
| T05 traceability | PROP-TRC-01 |
| T06 → T11/T31 | PROP-PASS-06, PROP-PASS-07 |
| T13 scan widening | PROP-BLD-03 |
| T14 → T25 | PROP-COR-01…06, PROP-CFG-01, PROP-CFG-02 |
| T15 → T26/T28/T31 | PROP-ID-01…03, PROP-MRG-01, PROP-MRG-03, PROP-MRG-04, PROP-RTE-03, PROP-RTE-04 |
| T16 → T26 | PROP-REC-01…06, PROP-TRG-03, PROP-TRG-06 |
| T17 → T27 | PROP-EFF-01…09, PROP-REC-05 |
| T18 → T27 | PROP-ADV-01…05 |
| T19 → T25/T26/T27 | PROP-GEN-00…06, PROP-ADV-06, PROP-COR-03, PROP-CFG-01 |
| T20 → T28/T31 | PROP-MRK-01…04, PROP-PASS-01…05, PROP-PASS-08, PROP-PASS-11, PROP-COR-09…11, PROP-CFG-03, PROP-FIX-02 (spanning) |
| T21 → T28/T30/T31 | PROP-RTE-01…06, PROP-PR-01…11, PROP-ID-03, PROP-MRG-01, PROP-MRG-02, PROP-MRG-04 |
| T22 → T30/T31 | PROP-CRED-01…04 |
| T23 → T31 | PROP-PASS-09, PROP-PASS-10, PROP-DBL-03 |
| T24 → T26/T29/T31 | PROP-RPT-01…09, PROP-MRG-03, PROP-CFG-03 |

Tasks carrying **no** property row are production-only or docs-only and are named here so the absence
is deliberate rather than missed: **T02** (module skeleton), **T33**'s `RELEASE-CHECKLIST.md` half (a
distribution commitment owned by no AC — §13.1), and the batch-2 helper rows. The green un-skippers
**T25 … T33** own no property of their own: each turns a RED block above green, which is why every
one of them appears on the right of an arrow rather than in a row of its own. Every **🔴 RED** task in
PLAN §4 appears above with at least one property, and every property above names a green owner: no
property can be left in a permanently-red block.

### 12.4 FSPEC §13 acceptance register → properties

Read against the register at FSPEC **v11.5** (99 ids, measured 2026-08-06; PROP-TRC-01 pins the
version and re-reads the count rather than transcribing it). **One id post-dates that measurement:**
`AT-K3b`, minted by FSPEC v11.7 (`FSPEC:21`, row at `:2210`) and claimed in the AT-K row below. It is
named rather than folded into the count, so that a reader comparing this table against a
freshly-measured register sees the one known delta instead of an unexplained off-by-one.

| Family | Register ids | Properties |
|---|---|---|
| AT-C (trigger, cadence datum, determinism) | AT-C1, AT-C1b, AT-C2…AT-C8 | PROP-PASS-01…05 (all in `consolidationPass.test.js`, the file TSPEC §12.3 gives the AT-C register; PROP-TRG-03 and PROP-TRG-06 are the L1 arms of AT-C5/C6/C7 and cite the TSPEC §7.2 obligation rather than the ids, so each AT-C id is claimed in exactly one file) |
| AT-P (predicate, corpus, hook parity) | AT-P1…AT-P11 | PROP-COR-01, PROP-COR-04…07, PROP-COR-10, PROP-COR-11. **Two ids are claimed here in a file the approved upstream does not give them:** PROP-COR-10 (AT-P10) and PROP-COR-11 (AT-P6) sit in `consolidationPass.test.js`, while TSPEC §12.3 (`TSPEC:2499`) and PLAN T14 (`PLAN:258`) place both in `consolidationPredicate.test.js`. Their *Then*s are whole-pass writes that a pure `classifyCorpus` cannot produce, so the properties stay at L2 and **§13.3 erratum 6 routes the re-registration upstream**. The single-file rule therefore holds for every family except these two ids, pending that erratum |
| AT-M (marker, model ladder, late failure) | AT-M1…AT-M11 | PROP-MRK-01…04, PROP-PASS-06…08 |
| AT-R (routing, merge, commit, proposal file) | AT-R1…AT-R7, AT-R6b | PROP-RTE-01…06, PROP-ID-03, PROP-MRG-01, PROP-MRG-02 |
| AT-Q (the PR carrier and suppression) | AT-Q1…AT-Q13, AT-Q7b, AT-Q7c | PROP-PR-01…08, PROP-PR-11 (AT-Q2's trailer-set arm) |
| AT-K (the credential) | AT-K1…AT-K7, **AT-K3b** | PROP-CRED-01…04; **AT-K3b → PROP-COR-09**. AT-K3b (FSPEC v11.7, `FSPEC:2210`) is not a credential id: its subject is the all-unreadable corpus terminating `no-op`, so its property lives at L2 in `consolidationPass.test.js` while AT-K1…AT-K7 sit in `consolidationCredential.test.js` (`TSPEC:2929`). The single-file rule holds per id — no file claims AT-K3b twice — but the AT-K **family** now spans two files, and **§13.3 erratum 8 routes the registration** of AT-K3b into TSPEC §12.3/§12.4 and PLAN T20, which do not carry the id at HEAD |
| AT-F (identity) | AT-F1…AT-F4 | PROP-ID-01, PROP-ID-02 |
| " (effectiveness, remediation) | AT-F5…AT-F18 | PROP-EFF-01…09 |
| " (the record reader) | AT-F19, AT-F20, AT-F21 | PROP-REC-02, PROP-REC-01, PROP-REC-03 |
| AT-A (advisory corpus) | AT-A1…AT-A7 | PROP-ADV-01…05 |
| AT-L (rendering and vocabularies) | AT-L1…AT-L5 | PROP-RPT-01…05, PROP-RPT-09 (AT-L4's shape) |
| AT-N (configuration) | AT-N1…AT-N4 | PROP-CFG-01, PROP-CFG-03, PROP-RPT-06, PROP-RPT-07 |

`PROP-CFG-01…03` discharge **AT-N**, not AT-P: they are configuration-reader properties, and the
AT-P register covers the corpus predicate. The AT-N row therefore names them beside PROP-RPT-06 and
PROP-RPT-07 rather than leaving the four register ids to two properties.

Properties whose trailer ends `(no FSPEC AT)` carry a TSPEC, FSPEC-body or REQ citation in the same
position instead, and are named here so the traceability parser's empty cells are accounted for
rather than merely allowed: **PROP-COR-02, PROP-COR-08, PROP-COR-12, PROP-COR-13**
(TSPEC §7.1, §11.1, §12.2) — PROP-COR-09 left this list in v1.6, when it claimed `AT-K3b` —
**PROP-CFG-02** (REQ §4a), **PROP-MRG-03, PROP-MRG-04, PROP-REC-04,
PROP-REC-05, PROP-REC-06** (FSPEC §14.5's LD register), **PROP-EFF-05** (vocabularies §2),
**PROP-ADV-06**, **PROP-COR-03** and **PROP-GEN-00…06** (TSPEC §11.4), **PROP-PR-09** (REQ AC-3.4's
second conjunct), **PROP-PR-10** (FSPEC BR-24), **PROP-RPT-08** (TSPEC §7.6/§12.4, an unnumbered
§12.2 row), **PROP-RPT-09** (AT-L4's shape, asserted set-equally), **PROP-PASS-09** (release across
terminal statuses, §12.1), **PROP-PASS-10** (the `await` discipline, §7.3), **PROP-PASS-11** (REQ
AC-1.4's third and fourth sentences), **PROP-PRE-01, PROP-PRE-02** (PLAN §3), **PROP-SRC-01…04,
PROP-BLD-01…03** (TSPEC §3.3, §11.3(e), §12.2, T-02), **PROP-TRC-01** (PLAN §4 T05) and
**PROP-DBL-01…03, PROP-FIX-01…03** (TSPEC §11.1/§11.2). Five properties discharge FSPEC §14.5's
layer-deferral register — **LD-1** (PROP-REC-05), **LD-2** (PROP-MRG-03), **LD-3** (PROP-MRG-04),
**LD-4** (PROP-REC-06) and **LD-5** (PROP-REC-03, PROP-REC-04) — set-equal to the five names FSPEC
records, neither more nor fewer.

## 13. Gaps, negative space, and errata

### 13.1 Named gaps — obligations no property discharges

A named gap is not a licence to ship uncovered; it is a statement of what an operator must not read
this document as promising.

| Gap | Why no property | What stands in its place |
|---|---|---|
| **O-C6 — the producing side of `failure-mode-id`** | A harvest agent placing the id in a LEARNINGS §5 Open Item is an LLM invocation with no reproducible output; a property over it would assert the model, not the code | PROP-SRC-04 pins the prompt's four verbatim obligations, and PROP-EFF-03/04 assert the **receive** side exhaustively — including the unmatched-id notice |
| **The drift-gate interruption on the first queue invocation after this feature lands** | Owned by no AC: it is a consequence of the shipped `distribution.checkEnabled` gate, not a behaviour of this feature | TSPEC §13.3(iii)'s release-note obligation, discharged by T33's `pdlc/RELEASE-CHECKLIST.md` edit — a docs commitment, deliberately not a test |
| **A real advisory corpus** | `docs/_queue/ESCALATIONS.md` is absent at HEAD and BL-01a is *not expected to be met* (REQ-CONS-06 preamble) | PROP-ADV-01 makes the absent and empty states first-class and asserts distinct reason codes for each; PROP-ADV-02/05 run on constructed corpora, never on the repository |
| **Cross-repository operation (the two-repo configuration)** | BL-03's fine-grained token is operator-provisioned and not available to CI | PROP-CRED-01 covers the credential ladder's three values through the seam; the shipping configuration is same-repo (AC-3.8/AC-4.4) and is the one exercised end to end |
| **`Route`'s missing proposal-file member (ER-6)** | The vocabulary is upstream and the interim is deliberate | PROP-RPT-08 asserts both the loss and the report-body discriminator that stands in for it, in both directions |
| **AC-3.4's second carrier on a fully-`promoted` pass** | The obligation is vacuous by construction: a pass where every promotion landed writes no `CONSOLIDATION-PROPOSAL-{passId}.md` at all (§5.3, PROP-RTE-06(a)), so there is no file for the URL to reach. Asserting one into existence would contradict PROP-RTE-06 | PROP-PR-09 asserts the two-carrier string equality on the `promoted-degraded` Given, where both carriers exist; §13.3 erratum 4 routes the REQ/FSPEC tension upstream rather than resolving it here. **If the erratum lands as "in each carrier that exists", PROP-PR-09 is unchanged** — its Given already quantifies over carriers that exist, so the reconciled wording is the property as written, and no second arm is owed: the "no proposal file on a fully-`promoted` pass" half is already asserted by PROP-RTE-06(a), and duplicating it here would re-home that invariant. Only a reconciliation that made the proposal file **mandatory** on the happy path would reopen this property, and that reading contradicts FSPEC §5.3 |

### 13.2 Negative space — what these properties deliberately do not assert

- **No property asserts an implementation echo.** Expected values are transcribed from the normative
  source or from the fixture input, never read back off the produced artifact (PROP-FIX-01). Where a
  test runs at L2 and the record under assertion is produced by the pass itself, the expected strings
  come from the **fixture corpus** — this is the rule PROP-PR-08 turns on.
- **No property is absence-only.** Every negative names the positive conjunct on the same path (O-1),
  and the paired-fixture discipline is stated per property rather than assumed: PROP-MRK-02(d),
  PROP-RPT-01, PROP-RTE-06(a)(b), PROP-EFF-09(c), PROP-ADV-02, PROP-PASS-06(AT-M8).
- **No property asserts invariance alone.** Every order- or determinism-invariance carries a positive
  conjunct (O-3): PROP-GEN-02's strict dominance, PROP-GEN-05's literal fold row, PROP-GEN-06's row
  count and per-arm verdicts, PROP-EFF-08's file-existence predicate.
- **No property compares two transcriptions with each other.** PROP-RPT-04's fourth leg and
  PROP-TRC-01's version pin both read the **authority file**, which is what stops a matched pair of
  stale copies from agreeing perfectly.
- **No property is timed, network-dependent, or ordered against another property.** Every seam is
  doubled (§2); `PY_BIN`-dependent rows are gated by PROP-FIX-03, whose `executed === 0` assertion
  sits in its **own top-level `test()` last** rather than in an `afterAll`, so a skipped-everything
  run is red rather than silently green.
- **No property reads the live repository as a fixture.** PROP-FIX-02 forbids it, and PROP-PASS-01
  states the reason concretely: the corpus grows with every delivered feature, this one included, so
  a Given pinned to HEAD inverts on its own PR.

### 13.3 Errata — defects found in upstream documents

Found while grounding this document, **not** fixed here (this layer does not edit its inputs) and
**not** folded into any property above. Each is emitted as an `ERRATUM:` line in the hand-off.

1. **Stale `orchestrate-dev.js` locators, uniform +36-line drift**, in FSPEC §5.4/§6.5, TSPEC
   §4.2/§9.4 and PLAN §3/§4.1-T11/§4.2/§7. Measured against `HEAD:pdlc/workflows/orchestrate-dev.js`
   with a clean working tree (`git status --porcelain` empty for that path, 2026-08-09):
   `gitWithLockRetry` is at **`:8653`**, cited as `:8617`; `commitPaths` at **`:8705`**, cited as
   `:8669`; its unscoped `git commit -m` at **`:8726`**, cited as `:8690`. The same offset lands on
   PLAN §2's Phase I citations: the wave gate is at **`:10172`**, cited as `:10136-10143`, and the
   pathspec-scoped stage at **`:10187`**, cited as `:10151`. Every cited *symbol* is correct and
   every claim about it holds — this is a locator defect, not a substance defect, which is why it is
   an erratum rather than a finding. Two corrections of record travelling with it: `commitPaths` **is
   exported** at HEAD (`:8705`), and FSPEC's branch-guard citation `:3580` is **exact**.
2. **REQ AC-6.3's "across the consumed window" wording contradicts the settled contract.** FSPEC §9.5
   / BR-37a specifies `seamCandidates` as ranging over **every** entry in `ESCALATIONS.md`, and TSPEC
   §11.5 carries a standing caution that no AT-A fixture may be written against the REQ's wording
   because it would red a conforming implementation. The caution is the right containment; the REQ
   sentence is still the defect, and it is the one document an operator reads first. PROP-ADV-05 pins
   the settled form and asserts the invariance under the consumed set explicitly, so this document is
   safe either way — but the REQ should say what the system does.
3. **PLAN T04's no-regression baseline is self-invalidating.** The differential asserts the widened
   predicate against `HEAD:pdlc/hooks/scripts/nudge-consolidation.sh` — but T09 edits that very file,
   so from the moment T09 lands the "baseline" is the widened script and the differential compares a
   thing to itself, green on every implementation including a broken one. The baseline must be a
   checked-in pre-widening copy — `pdlc/workflows/__tests__/fixtures/nudge-consolidation.pre-widening.sh`
   — pinned by a fixture-validity assertion. PROP-COR-12 is written against the fixture form and
   PROP-COR-13 pins the fixture's own validity, so this document is safe; PLAN T04's task text is
   still the defect. **The correction has a second half, in PLAN §5's ownership manifest.** T04's
   manifest row (`PLAN:307`) names only `pdlc/workflows/__tests__/consolidationHookParity.test.js`,
   and no row in §5 names any path under `pdlc/workflows/__tests__/fixtures/` — a directory that
   **does exist and is tracked** at HEAD, so only the fixture file and the manifest row are new.
   Since Phase I commits
   each task's work pathspec-scoped to that task's owned files, adding the baseline to T04's task
   text alone would leave it authored but uncommitted — the two properties would be red on correct
   code. Both halves of PLAN T04 need the fixture path: the task text **and** the manifest row.
4. **REQ AC-3.4's second carrier has no reachable Given on the happy path.** AC-3.4 requires the PR
   URL in both `.consolidation-log.md` and `CONSOLIDATION-PROPOSAL-{passId}.md`, while FSPEC §5.3 —
   which PROP-RTE-06 pins — writes the proposal file **only** when a §5.3 cause exists. A pass where
   every promotion landed on the PR therefore satisfies AC-3.4's second conjunct vacuously. The two
   are reconcilable (read AC-3.4 as "in each carrier that exists"), but the reconciliation belongs in
   REQ, not in a test that quietly picks one reading. PROP-PR-09 asserts the conjunct on the
   `promoted-degraded` Given where both carriers exist, and §13.1 records the vacuous half as a gap.
5. **PLAN T21's `T31 — routes end to end` block omits AT-R6 and AT-R6b.** It enumerates AT-R1 … AT-R5
   and AT-R7, leaving the decision-path and merge obligations to T15's unit-level `T26` block alone —
   but AC-2.2's "appends rather than replaces" and §8.2's precedence ranking are only observable
   through a whole pass's writes, which is what PROP-RTE-03 and PROP-RTE-04 assert. Their trailers
   name `T15/T21 → T26/T31` on that reading; PLAN should carry the same split so the RED task that
   creates the workflow-level arms is named.
6. **AT-P6 and AT-P10 are registered to a file whose subject cannot reach them.** TSPEC §12.3 gives
   both ids to `consolidationPredicate.test.js` (`TSPEC:2499`, the L1 row carrying AT-P1…AT-P6,
   AT-P8…AT-P11) and PLAN T14 enumerates them in the same place (`PLAN:258`, block
   `T25 — corpus and predicate`). Neither *Then* is observable there. AT-P6's is *"the consumed pair
   is still appended, empty, before any other record"* (`FSPEC:2119`) and AT-P10's is *"the §10.4
   report names the collision explicitly"* (`FSPEC:2123`) — both are whole-pass writes, while
   `classifyCorpus` is declared pure and returns `basenameCollisions` without appending anything or
   rendering a report (`TSPEC:674`, `:750-770`). PROP-COR-10 and PROP-COR-11 therefore assert them at
   L2 in `consolidationPass.test.js`, where the conjuncts are reachable, and this document keeps them
   there. The correction is upstream and has two halves, exactly as erratum 5's does: TSPEC §12.3
   should move AT-P6 and AT-P10 to the `consolidationPass.test.js` row, and PLAN T14's `T25` block
   should drop them from its enumeration so PLAN's RED task list matches. Until both land, the
   single-file invariant §12.4 states holds for every family **except** these two ids, which is why
   §12.4's AT-P cell names this erratum rather than asserting the invariant unqualified, and its AT-C
   cell now scopes its own claim to the AT-C ids it can speak for. Absorbing it
   here instead — citing the obligation the way PROP-TRG-03/06 cite TSPEC §7.2 — would leave AT-P6 and
   AT-P10 with **no** property discharging them at T14 (PROP-COR-01/04/05/06 cover AT-P1…P5, P8, P9,
   P11 only) and would owe two new L1 arms for cases their unit subject cannot observe.
7. **No PLAN block declares AC-1.4's no-op pass.** PROP-PASS-11 carries `(no FSPEC AT)` and cites
   AC-1.4, AC-5.3 and AC-5.5, and it is a whole-pass property, so `consolidationPass.test.js` is the
   right **file** — but PLAN T20's `T31 — pass lifecycle` block closes its unregistered list
   explicitly, stating that after AT-M11's assignment "(i) below is the only remaining unregistered
   obligation in this row" (`PLAN:264`), where (i) is the unreadable-corpus-entry case that
   PROP-COR-09 owns. PLAN T23 declares "two cases, no register id" (`PLAN:267`) and neither is the
   no-op pass. So the gap is not created by this document's homing — **no PLAN block declares
   AC-1.4's no-op case at all**, before or after the v1.2 re-home; the earlier homing merely hid it
   behind a file that was wrong for other reasons. PLAN T20's block text should name a third
   unregistered obligation — the no-op pass: an otherwise-eligible pass with nothing to consolidate
   reaches terminal status `no-op`, writes the consumed pair, and raises no PR and no proposal file —
   and its "only remaining" sentence should be restated to cover both. This document keeps
   PROP-PASS-11 where it is; the placement is a **judgment pending this erratum**, not a claim that
   PLAN already licenses it, and §12.2/§12.3's derivation sentences are qualified accordingly.
