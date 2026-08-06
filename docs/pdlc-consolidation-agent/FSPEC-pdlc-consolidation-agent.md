# FSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

## 1. Scope and entry obligations

This FSPEC specifies the behaviour of **one consolidation pass** — the workflow script invoked as
`/pdlc:consolidate-learnings`, shipping beside the existing skill of that name in the
`orchestrate-queue` shape (REQ §5). It is written against `REQ-pdlc-consolidation-agent` v2.0 and
adds no requirement of its own; where the REQ names a value, this document names the branch that
produces it and the observation that decides it.

**Two upstream reference files are binding and are not restated here**, only cited by section at
their pinned `Version`:

| File | Version | What this FSPEC takes from it |
|---|---|---|
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | 1.4 | §1 enumerated vocabularies (statuses, reason codes, trigger, route, verdicts, states, `action`, `pr:` / `suppressed-by:` / `credential:` fields, the 13-member phase catalogue); §2 the phase observable; §3 the log's record grammar; §4 pass identity and the PR trailer grammar |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | 1.0 | §1 which advisory records survive; §2 `ESCALATIONS.md` absent at HEAD; §3 the two-rung ladder is reused via `resolveAdvisoryRung`, not restated; §4 the escalations-not-resolutions limit |

Every enumerated value used below is a member of vocabularies §1. **No value is introduced here that
has no §1 row**, and this document uses every §1 row — the set-equality obligation of REQ §4b binds
this layer first, and §15 records where each row is used.

**Decisions the REQ delegated to this layer**, each discharged at a named section:

| Delegated by | Question | Discharged at |
|---|---|---|
| REQ AC-5.3 | Which of `revision` / `retirement` a pass proposes for an `ineffective` promotion | §8.5 |
| REQ AC-5.1 | The deterministic derivation of `failure-mode-id` from `phase` and `artifact` | §8.1 |
| REQ vocabularies §4 | How the `{n}` of `passId` is derived on a given calendar date | §2.5 |
| REQ AC-1.1, AC-7.2 | The order in which a pass appends its records, and the log row's field grammar | §10.2, §10.3 |
| REQ AC-5.2 | How a promotion's `phase` population is decided per consumed LEARNINGS | §8.3 |
| REQ AC-6.1 | How `ESCALATIONS.md` entries are counted per `Seam` per `Feature` | §9.2 |
| DC-01 | Absent / malformed / truncated behaviour for every parsed input | §3.4, §9.3, §10.4, §11 |

**Out of scope here, as in the REQ §5:** merging any PR; changing the AC-2.3 promotion bar;
session-free execution; a new notification channel; multi-consumer consolidation; persisting
`advisorySummaryRows`; retiring the manual entry point; repository-side branch protection.

**Altitude.** Per DC-09 (`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`) the REQ carries no oracle
mechanics; per DC-05 (`:143`) every named behavioural branch below carries an acceptance test in
§13, and §12 is the terminal outcome table those tests range over. Function names, seam signatures,
module placement and the bundle's build-manifest row are TSPEC's (§14).

## 2. FSPEC-CONS-01 — Tick evaluation and pass lifecycle

**Links:** REQ-CONS-01, AC-1.1, AC-1.2, AC-1.5, AC-1.6, NFR-3, NFR-3a.

### 2.1 The two entry points

| Entry | Trigger recorded | Steps 2–4 of the tick order | Marker |
|---|---|---|---|
| `/loop run /pdlc:consolidate-learnings` (a tick) | `cadence` or `volume`, per §2.3 | evaluated | taken when the tick passes §2.3 |
| `/pdlc:consolidate-learnings` (direct) | `manual` | **skipped entirely** — the pass runs unconditionally | taken |

There is no third entry. `pdlc/hooks/hooks.json` registers `PreToolUse` (`:3`), `PostToolUse`
(`:14`) and `SessionStart` (`:29`) only, and `nudge-consolidation.sh` prints
`hookSpecificOutput.additionalContext` and exits 0 (`:47-48`) — no hook can start a pass, and this
feature does not change that. The nudge's advisory role is unchanged; only its predicate (§3.2) and
its corpus glob (§3.1) are edited.

### 2.2 Step ordering — the phase sequence of one invocation

The invocation is a fixed sequence. Each step names its terminating branch; a step not named as
terminating always proceeds to the next.

| # | Step | Terminates with |
|---|---|---|
| 1 | Resolve configuration (§11) | — (never terminates; every key falls back independently) |
| 2 | Enumerate the corpus and compute the un-consolidated set (§3) — **basenames only, no body read** | — |
| 3 | Volume test (§2.3) | — |
| 4 | Cadence test (§2.3) | `skipped-cadence` when neither 3 nor 4 fires |
| 5 | Mint `passId` (§2.5) | — |
| 6 | Take the in-progress marker (§4) | `refused` when the marker is held and fresh |
| 7 | Append the `<!-- pdlc:consumed {passId} -->` pair (§3.3, NFR-5) — **complete, in one append, even when empty** | — |
| 8 | Resolve the advisory model rung (§2.6) | `failed` (`advisory-model-unresolved`) when neither rung resolves |
| 9 | Read the consumed LEARNINGS bodies; cluster; apply the AC-2.3 bar | — |
| 10 | Read `ESCALATIONS.md` (§9) | — |
| 11 | Compute the AC-5.2 effectiveness table over prior passes (§8.3) | — |
| 12 | Derive proposals (promotions + §8.5 remediations); apply NFR-4 suppression (§6.4) | — |
| 13 | Route each proposal (§5, §6) | — |
| 14 | Write the consuming-repo artifacts and append the terminal log row (§10) | `promoted` / `promoted-degraded` / `no-op` / `failed` |
| 15 | Commit the AC-3.8b pathspec (§5.4) | — (a git refusal records `writes-uncommitted`, never changes the status) |
| 16 | Release the marker (§4.3) | — |

Step 7 precedes step 8 deliberately: the consumed pair freezes the legacy-region boundary
unconditionally (vocabularies §3(a)), so a pass that dies at step 8 has still frozen it. Step 11
precedes step 12 because a `recurred` verdict is an input to the §8.5 remediation proposals.

### 2.3 The volume and cadence tests (AC-1.1, AC-1.2)

Evaluated in this order, on the set computed at step 2:

1. **Volume.** `|un-consolidated| >= consolidation.volumeThreshold` ⇒ run, trigger `volume`.
2. **Cadence.** Otherwise, if `now - datum >= consolidation.cadenceHours` ⇒ run, trigger `cadence`.
3. Otherwise ⇒ terminate `skipped-cadence`, writing **no log row** and returning the status as the
   report body only (AC-7.2).

**The datum.** The `date` of the most recent log row whose `status` is one of `promoted`,
`promoted-degraded`, `no-op`, `failed`. A `refused` row is skipped; a `skipped-cadence` tick wrote
no row, so ticking cannot advance the datum.

**Empty datum set** — no log file, or no row carrying one of those four statuses (the state at HEAD,
where `docs/_decisions/.consolidation-log.md`'s Pass 1 predates the status convention). The interval
**counts as elapsed**: the pass runs, trigger `cadence`, and its row additionally carries reason code
`no-cadence-datum`. That row then becomes the datum for the next tick.

`no-cadence-datum` is decided at step 4, before the marker check at step 6, which is why
vocabularies §1 permits it with `refused` as well as with the four working statuses.

**Measured first-tick behaviour on this repo at HEAD** (the state an acceptance test asserts
against, AT-C1): step 2 enumerates 5 LEARNINGS —
`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md`,
`docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md`,
`docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md`,
`docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md`,
`docs/completed/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md`. The first and
last are named in the log's legacy region (Pass 1's consumed table names them by full path, and the
predicate is a basename containment test), so the un-consolidated set has **3** members — below the
default `volumeThreshold` of 5. The volume test does not fire; the cadence test does, on the
empty-datum branch. Terminal trigger `cadence`, reason code `no-cadence-datum`.

### 2.4 What a `skipped-cadence` tick may not do

It reads the configuration, the corpus basenames and the log. It **must not**: read any LEARNINGS
body, mint a `passId`, touch `docs/_decisions/.consolidation-lock`, append any record to the log, or
make any git call. This is the common case under `/loop`, and a row per tick would grow the log
without bound — the same log the predicate and the datum are read from.

### 2.5 `passId` derivation (vocabularies §4)

`passId` is `{YYYY-MM-DD}-{n}`, `YYYY-MM-DD` being the pass's own start date in the invoking
environment's local calendar. `n` is derived **from the log, not from a counter**:

> `n = 1 + max{ m : a log row exists whose passId is `{today}-{m}` }`, or `1` when no row carries
> today's date.

The scan ranges over **every** row, `refused` included — a refused tick wrote a row carrying its own
`passId`, and reusing it would produce two records with one id. Rows are matched by the literal
`{today}-` prefix on the row's `pass:` field, so a malformed or unparseable row contributes no `m`
and is skipped rather than aborting the derivation (DC-01 receive side). Two passes racing to mint
the same `n` is possible and harmless: the loser is `refused` at step 6 and its row is the only
artifact carrying the duplicated id, which no contract keys on (log **records** are keyed
`(failure-mode-id, passId, action)` — a refused row carries no failure mode).

### 2.6 The model rung (AC-1.5, AC-1.6)

The pass **reuses** `resolveAdvisoryRung` (`pdlc/workflows/orchestrate-dev.js:1833`) — the exported
resolver whose doc comment (`:1800`) calls it "the **one** ladder the tier ships" — threading its own
`rungState` (`{ resolved: null }`) exactly as `orchestrate-queue` does
(`pdlc/workflows/orchestrate-queue.js:1245-1256`). It restates neither `MODEL_ADVISORY` (`:1652`)
nor `MODEL_ADVISORY_FALLBACK` (`:1653`); those are module-private and stay so.

| Resolution outcome | Behaviour | Recorded |
|---|---|---|
| Primary rung resolves | pass proceeds | the rung it ran on, in the report and in the log row |
| Primary fails, fallback resolves | pass proceeds; the resolver emits `ADVISORY_MODEL_FALLBACK:` (`orchestrate-dev.js:1859`) and the pass surfaces that line in its report | the fallback rung, named — never a silent downgrade |
| Neither resolves | the resolver throws its halt error (`:1866`+). The pass **makes no promotion**, appends its terminal row, releases the marker (§4.3), and exits | status `failed`, reason code `advisory-model-unresolved` |

There is no third rung and no default-model fall-through.

**Step 8's position is forced, and its consequence is stated rather than hidden.** Rung resolution
cannot be moved before step 7: AC-1.3's table records `failed` as a status that **takes** the
marker, and vocabularies §3(a) obliges every marker-holding pass to append its consumed pair
*before any other record it writes* — and an `advisory-model-unresolved` pass does write a record,
its AC-7.2 terminal row. So a pass that dies at step 8 has already marked its corpus consolidated
without having read a single LEARNINGS body, and step 15 commits that block. Under the §3.2
predicate those files are then permanently consolidated: no pass re-enumerates them, and no
vocabularies §1 field exists in which a `failed` pass could record "re-consume these". This FSPEC
specifies the ordering as required and raises the loss as an upstream item (§14, O-C1); it does not
invent a recovery channel, which would add an unlisted record type and breach REQ §4b's
set-equality obligation.

## 3. FSPEC-CONS-02 — The consumed predicate and the LEARNINGS corpus

**Links:** REQ-CONS-01 (predicate, corpus, tick step 1), AC-1.1, AC-1.2, AC-2.4, NFR-5, REQ §5
(the three shipped-file edits).

### 3.1 The corpus — what is enumerated

Enumeration is **basenames only**. No step in §2.2 before step 9 opens a LEARNINGS file, and a
`skipped-cadence` tick never opens one at all (§2.4).

| Glob | In corpus | Why |
|---|---|---|
| `docs/*/LEARNINGS-*.md` | yes | the shipped glob (`pdlc/hooks/scripts/nudge-consolidation.sh:28`) |
| `docs/completed/*/LEARNINGS-*.md` | yes — **added by this feature** | this repo archives delivered features one level deeper; depth-1 alone hides 3 of the 5 files present at HEAD |
| `docs/discarded/*/LEARNINGS-*.md` | **no** | abandoned work is not evidence about a delivered pipeline (REQ-CONS-01 step 1) |
| anything else | no | the two globs above are the whole corpus definition |

The `docs/completed/*/` widening is the edit to `nudge-consolidation.sh:28` that REQ §5 puts in
scope. It is made **in the hook and in the pass together**, so the two never enumerate different
corpora — the same single-predicate discipline §3.2 applies to the membership test.

`docs/discarded/` exclusion is not incidental at HEAD: the directory exists and holds two LEARNINGS
files (`docs/discarded/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md`,
`docs/discarded/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md`), so a glob widened to
`docs/*/*/LEARNINGS-*.md` rather than to `docs/completed/*/` would silently admit both. The
widening is therefore specified as **exactly one added literal path segment**, not as a depth
increase.

**Measured corpus at HEAD** — 5 files, the population §2.3's first-tick assertion counts:

| # | Path | Region under §3.2 |
|---|---|---|
| 1 | `docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md` | legacy — named in Pass 1's consumed table |
| 2 | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` | un-consolidated |
| 3 | `docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` | un-consolidated |
| 4 | `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` | un-consolidated |
| 5 | `docs/completed/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` | legacy — named in Pass 1's consumed table |

Rows 1 and 5 are matched because Pass 1 records its consumed set as a two-column table of **full
paths** (`docs/_decisions/.consolidation-log.md`, `## Pass 1 — 2026-07-29`), and the legacy clause of
§3.2 is a basename **containment** test, which a full path satisfies. Row 5's archived location does
not affect this: the predicate ranges over the basename, and the basename did not change when the
feature directory moved under `docs/completed/`.

### 3.2 The membership test — one predicate, two regions

A basename is **consolidated** when either clause holds; **un-consolidated** otherwise. The two
clauses are evaluated against the text of `docs/_decisions/.consolidation-log.md`.

| Clause | Region | Test |
|---|---|---|
| (a) block | the text inside any `<!-- pdlc:consumed {passId} -->` … `<!-- /pdlc:consumed -->` pair | the basename appears on a line of that block |
| (b) legacy | the text **preceding the file's first `<!-- pdlc:consumed` marker** | the basename appears anywhere in that text (the shipped bare substring test, `nudge-consolidation.sh:41`) |

The block grammar, the exclusivity rule ("no other record type may appear inside one"), the
append-only write granularity, and the two clauses that freeze the legacy boundary are stated in
`docs/_constraints/pdlc-consolidation-vocabularies.md` §3 at `Version` 1.4 and are **binding here and
not restated**.

The predicate is **total**: a log with no `<!-- pdlc:consumed` marker at all is legacy region entire
(the state at HEAD), and an absent log yields both regions empty, so every enumerated basename is
un-consolidated. Neither state is an error.

**The boundary is computed on the first marker only.** Text *after* the last block but outside any
block — an effectiveness table, a failure-mode record whose `artifact` field is a LEARNINGS path, a
terminal row's `pr:` URL — is in **neither** region and can never mark a file consolidated. That is
the whole reason clause (b) is bounded rather than "everything outside a block": REQ-CONS-01 requires
exactly this, because this feature writes those record types into the same file.

**Two shipped files are edited to this predicate** (REQ §5, both in scope here):

| File:line at HEAD | Shipped behaviour | Behaviour after this feature |
|---|---|---|
| `pdlc/hooks/scripts/nudge-consolidation.sh:41` | `pending = [p for p in learnings if os.path.basename(p) not in logtext]` — bare substring over the whole file (read at `:36-37`) | the same test, scoped to the two regions above |
| `pdlc/skills/consolidate-learnings/SKILL.md:35` | "Every `docs/*/LEARNINGS-*.md` with a Date Completed after the last logged pass is in scope" — a **date** boundary | replaced by the §3.2 predicate, so the skill prose and the pass agree |

The `Date Completed` boundary is not merely a second definition; it disagrees with the first in a way
that matters — `Date Completed` is a body field an editor can change after a pass consumed the file,
which would silently re-open a consolidated LEARNINGS, and reading it requires opening bodies the
tick order forbids before step 9. The basename test is adopted for both reasons (REQ-CONS-01).

The hook's own threshold (`THRESHOLD = 5`, `:25`) stays the hook's: it governs only whether the
`SessionStart` advisory line prints. The pass evaluates `consolidation.volumeThreshold` itself
(AC-1.2, §11), and the hook never starts a pass (§2.1).

### 3.3 Recording consumption — the consumed pair

At step 7 the pass appends **one** pair, complete, in a single append:

```
<!-- pdlc:consumed {passId} -->
LEARNINGS-{feature}.md
…
<!-- /pdlc:consumed -->
```

| Property | Value | Source |
|---|---|---|
| Membership | **exactly** the un-consolidated set computed at step 2 — neither more nor fewer | NFR-5 |
| Ordering | one basename per line; no other record type inside the pair | vocabularies §3 |
| Emptiness | emitted **even when the set is empty**, as an empty pair | NFR-5, vocabularies §3(a) |
| Position | before any other record this pass writes | vocabularies §3(a) |
| Write shape | one append at end of file; a whole-file read-modify-write is forbidden | vocabularies §3 |
| Written by | every marker-holding pass — never a `refused` or `skipped-cadence` tick | AC-1.3, AC-7.2 |

The set is **frozen at step 2** and is not recomputed later in the pass, so a LEARNINGS file that
appears on disk mid-pass belongs to the next pass, not this one. That freeze is what makes the pair
emittable in one append before any promotion work.

The pair's durability is the AC-3.8b commit at step 15, which carries `.consolidation-log.md` in its
pathspec (§5.4). A pass whose commit fails records `writes-uncommitted` and leaves the pair in the
working tree; the pair is correct on disk either way, and the next pass reads the working tree.

### 3.4 Absent, malformed and truncated inputs (DC-01 receive side)

Every clause below is *total*: no input state aborts enumeration, and none is silently equated with
a different state.

| Input state | Behaviour | Consequence |
|---|---|---|
| Log file absent | both regions empty | every enumerated basename is un-consolidated; the datum set is empty (§2.3), so the first pass runs on the `no-cadence-datum` branch |
| Log file present, unreadable (permissions, IO error) | treated as **empty text**, mirroring the shipped hook's `except: logtext = ""` (`nudge-consolidation.sh:38-39`) | fail-open toward re-consumption, never toward silently skipping a corpus; NFR-4 suppression is what prevents a duplicate proposal |
| Log present, no `<!-- pdlc:consumed` marker | legacy region entire | the HEAD state; Pass 1's two files are consolidated by clause (b) |
| An opening `<!-- pdlc:consumed {passId} -->` with no closing marker (a truncated append) | the unterminated block extends to end of file and its basenames count under clause (a) | a partially-flushed pair never *loses* consumption, so a crashed pass cannot cause its corpus to be re-consumed |
| A closing `<!-- /pdlc:consumed -->` with no opener | ignored; it opens no block and moves no boundary | a stray marker cannot make later records readable as consumption |
| A basename appearing both in the legacy region and in a block | consolidated (the clauses are a disjunction) | no double-count: the un-consolidated set is a set of basenames |
| Corpus glob matches nothing | the un-consolidated set is empty | the volume test cannot fire; the cadence test decides, and a pass that runs is AC-1.4's first cause (`no-op`, empty consumed set) |
| Two files with the same basename under different directories | one basename, one set member | the predicate keys on basename, as the shipped hook does; the collision is reported in the AC-7.1 report as an operator-visible note, never silently resolved |

The last row is a real possibility once `docs/completed/*/` is in the corpus: an archived feature
directory and a live one could both hold `LEARNINGS-{feature}.md` during a move. It is reported, not
repaired — repairing it would need a key the shipped predicate does not have (§14, O-C2).

## 4. FSPEC-CONS-03 — The in-progress marker

## 5. FSPEC-CONS-04 — Promotion routing and the consuming-repo writes

## 6. FSPEC-CONS-05 — The pull-request route

## 7. FSPEC-CONS-06 — Credential handling

## 8. FSPEC-CONS-07 — Falsifiability

## 9. FSPEC-CONS-08 — Advisory-corpus input

## 10. FSPEC-CONS-09 — Reporting and the log record grammar

## 11. Configuration parse behaviour

## 12. Observable outcomes per scenario

## 13. Acceptance tests

## 14. Obligations and open questions

## 15. Traceability
