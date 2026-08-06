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

**Links:** REQ-CONS-01, AC-1.3, AC-7.2, NFR-5, REQ §5 (the `.gitignore` entry).

### 4.1 The marker's shape and location

| Property | Value |
|---|---|
| Path | `docs/_decisions/.consolidation-lock` — a file of its **own** |
| Content | a single line, `IN-PROGRESS: {passId} {ISO-8601}` |
| Written | at step 6, **after** the trigger decision of steps 3–4 and before any other pass work |
| Lifetime | working tree only; never committed by any pass (§5.4) |
| Removed | at step 16, by the pass that took it, or by an operator deleting the file |

It is deliberately **not** a record in `.consolidation-log.md`. Taking and releasing it are in-place
rewrites of a whole small file, and every write to the log must be an append of one whole record
(vocabularies §3, binding here). Keeping it in a separate file is what lets the log stay append-only
and therefore lock-free.

**The `.gitignore` entry is part of this feature.** `docs/_decisions/.consolidation-lock` is added to
the repository `.gitignore`, which at HEAD carries no pattern matching it — its patterns are
`.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, `node_modules/`
and `/.claude/workflows/` (verified against the file at HEAD). Without the entry an untracked file
in a tracked directory is committable by any actor that is not pathspec-scoped, and a committed lock
reaches every fresh clone and refuses every pass with `consolidation-in-progress` until
`staleLockMinutes` elapses, per clone. The pattern is written with the same anchoring discipline the
existing `/.claude/workflows/` entry documents: a path containing a separator, relative to the
repository root, never a slash-free or `**/`-prefixed pattern that would match at every depth.

### 4.2 Take — the three outcomes at step 6

Read the file; if it is absent, write the marker and proceed. Otherwise parse its single line and
compare its timestamp to now.

| Observed state | Age vs `consolidation.staleLockMinutes` | Outcome |
|---|---|---|
| File absent | — | marker written; pass proceeds |
| Marker present, parseable | younger | terminate `refused`, reason code `consolidation-in-progress`, naming the marker's `passId` and timestamp |
| Marker present, parseable | older (default 60 min) | **reclaim**: overwrite the marker with this pass's own line, record reason code `reclaimed-stale-lock` naming the abandoned `passId`, and proceed |
| Marker present, unparseable or empty (truncated write) | undecidable | treated as **stale and reclaimed**, recording `reclaimed-stale-lock` with the abandoned pass id reported as `unknown` (DC-01 receive side) |

The last row is decided toward reclamation rather than refusal on purpose: an unparseable marker
carries no timestamp, so it can never age out, and refusing on it would wedge the cadence
permanently — the exact failure the stale-lock rule exists to prevent. The reclamation is recorded,
so it is never silent.

A `refused` pass is **dropped, not queued**: nothing is retained, and the next `/loop` tick
re-evaluates steps 1–4 from scratch against whatever the corpus and the datum then are.

### 4.3 Release, and what each terminal status does

The take/release/commit obligations are set-equal to the six-member terminal-status set of
vocabularies §1, so no status is unmapped. This table restates AC-1.3's, adding the step at which
each outcome is reached:

| Terminal status | Reached at step | Marker taken? | Released by this pass? | Commits (§5.4)? |
|---|---|---|---|---|
| `promoted` | 14 | yes | yes, at 16 | yes |
| `promoted-degraded` | 14 | yes | yes, at 16 | yes |
| `no-op` | 14 | yes | yes, at 16 | yes — the log row and the consumed pair are still writes |
| `failed` | 8 or 14 | yes | yes, at 16 | yes — a completed `failed` pass always wrote its row |
| `refused` | 6 | **no** — the marker belongs to the pass that holds it | **no** — the loser never unlocks the winner | **no** — it writes its AC-7.2 row and commits nothing |
| `skipped-cadence` | 4 | **no** — the tick terminates before step 6 | **no** | **no** — it writes no log row at all |

Release is unconditional for every marker-holding pass, including `failed`: it runs at step 16 after
the terminal row is appended, so a pass that halts at step 8 still releases. A process killed before
step 16 leaves the marker behind, and the §4.2 stale rule is what recovers it — that is the only
recovery channel, and it needs no cleanup handler to be correct.

### 4.4 Why a `refused` pass still writes a row

A `refused` tick writes its AC-7.2 terminal row and commits nothing. The row is the only evidence a
tick was refused, and the cadence datum rule presupposes it ("a `refused` row is not a datum",
§2.3). It carries a trigger over `cadence` / `volume` / `manual` (NFR-3a — the refused tick fired one
of them to reach step 6) and `credential: absent` (AC-4.2: no credential was in hand when the row was
written).

It is **written, never committed**, because a pathspec stages a whole file: a refused commit would
capture the winner's log at an arbitrary mid-pass instant. The winner's own step-15 commit covers the
same path and sweeps the row up; if the winner dies first the row stays in the working tree, which is
all its evidentiary purpose needs.

It writes **no** consumed pair — only marker-holding passes emit one (§3.3) — so it never moves the
legacy-region boundary. This is what makes it the single exempt record of vocabularies §3(b): every
field it carries (status, trigger, `credential:`, reason code, the held marker's `passId` and
ISO-8601 timestamp) is structurally incapable of being a `LEARNINGS-*.md` basename, so it cannot be
misread as legacy consumption even when it precedes the file's first block.

### 4.5 Concurrency — what two simultaneous passes observe

Two ticks can reach step 6 together. The marker file is the only serialisation point, and the log
needs none:

| Interleaving | Winner | Loser | Log outcome |
|---|---|---|---|
| Loser reads the marker after the winner wrote it | proceeds | `refused`, `consolidation-in-progress` | two appends, any order, both intact |
| Both read "absent", both write | the later writer's line stands | the earlier writer's marker is overwritten; it releases at step 16 having done its work | both consumed pairs append; the second names an already-consolidated set, and §6.4's NFR-4 suppression prevents a duplicate proposal |

The second row is the residual race the file-marker design does not close, and it is stated rather
than claimed away: without an atomic create-exclusive primitive the take is read-then-write. Its
blast radius is bounded by two properties that hold independently — every log write is a whole-record
append, so no record is lost whatever the order; and NFR-4 keys suppression on
`(failure-mode-id, action)` carried by the PR, not on the log, so the second pass opens no duplicate
PR even though its consumed set overlaps. An atomic take primitive is TSPEC's to choose if the
runtime offers one (§14, O-C3).

## 5. FSPEC-CONS-04 — Promotion routing and the consuming-repo writes

**Links:** REQ-CONS-02 (AC-2.1 … AC-2.4), AC-3.1, AC-3.8, AC-3.8b, AC-5.4, NFR-1.

### 5.1 The routing decision — one predicate over the target path

Every proposal has exactly one target path (AC-5.1: one canonical repository path, never a glob,
never a directory). That path decides the route, and nothing else does:

| Target path | Route | Section |
|---|---|---|
| under any prefix of `MERGE_GUARD_DEFAULTS` | **PR route** — a pull request against `consolidation.pluginRepository` | §6 |
| `docs/_constraints/DOMAIN-CONSTRAINTS.md` | consuming-repo write (append) | §5.2 |
| `docs/_decisions/DECISIONS-{topic}.md` | consuming-repo write | §5.2 |
| any other consuming-repo path | **proposal file only** — `CONSOLIDATION-PROPOSAL-{passId}.md`, never applied | §5.3 |

The guard set is **exactly** `MERGE_GUARD_DEFAULTS`
(`pdlc/workflows/orchestrate-dev.js:48-53`) — a frozen four-member array, `pdlc/workflows/`,
`pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`. The predicate is set-equal to that constant, not
a restatement of part of it: a promotion editing `pdlc/hooks/scripts/nudge-consolidation.sh` (which
is where the hook's own threshold lives, `:25`) routes to §6 like any other.

The membership test is **prefix containment on a normalised repository-root-relative path**, matching
how the constant's members are written (each is a directory prefix ending in `/`). Normalisation is
AC-5.1's: root-relative, no `./`, no symlink alias — so the same file cannot route two ways depending
on how a proposal spelled it.

**This is a routing predicate, not an inherited control.** The pass does **not** call `guardVerdict`
(`pdlc/workflows/orchestrate-dev.js:732`) or `effectiveGuardPaths` (`:709`): both are reachable only
from Phase MERGE's ladder and the advisory-envelope check, and both decide about *that run's own* PR
(AC-3.7). The pass reads the same frozen constant and makes its own decision, so nothing here claims
enforcement that nothing performs.

NFR-1's consequence is absolute and has no exception branch: **no code path in the pass writes to a
guard-set path in any tree.** The guard-set edit exists only as a commit in the §6 clone, pushed to a
`consolidation/{passId}` branch and offered as a PR.

### 5.2 The unchanged promotion behaviour (REQ-CONS-02)

| Promotion kind | Destination | Shape |
|---|---|---|
| Domain invariant future REQs must respect | append to `docs/_constraints/DOMAIN-CONSTRAINTS.md` | as today (`pdlc/skills/consolidate-learnings/SKILL.md:40`) |
| Architectural decision now project-level | `docs/_decisions/DECISIONS-{topic}.md` | as today (`:41`) |
| Process learning about a skill prompt, checklist or workflow phase | **propose, never apply** | §6 (PR) or §5.3 (proposal file) |

The pattern-vs-coincidence bar is **unchanged and still governs every promotion**: recurs across ≥2
unrelated features, **or** a single occurrence stating a standing invariant that obviously
generalises (`SKILL.md:38`). Running on a cadence does not lower it (NFR-3) — the trigger decides
*whether a pass runs*, never *what clears the bar*, and the two are evaluated at different steps
(§2.2 step 3–4 vs step 9). NFR-3a's trigger field is what makes "the bar held on both" checkable
after the fact rather than asserted.

The pass records date, consumed basenames (exactly the §3.3 pair's set), promoted items and deferred
items in `docs/_decisions/.consolidation-log.md` (AC-2.4, `SKILL.md:43`) — under the §10 record
grammar, which is where this feature's additions to that log live.

### 5.3 The proposal file

`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` is written when, and only when, the pass has
something to propose that it does not enact:

| Cause | Contents | Section |
|---|---|---|
| A guard-set promotion whose PR could not be opened | the full proposed diff, inline, plus the failure class and reason code | §6.3 |
| A retirement or revision of a promotion that landed in the consuming repo | the removal or replacement, for operator approval — **never** applied by the pass | AC-5.4 |
| A widening a consumer must adopt in its own untracked `.claude/pdlc.config.json` | an operator action, never a PR | §9 |

The artifact name is keyed on `passId`, not on a date (vocabularies §4), which is what keeps two
same-day passes — an expected case under the volume trigger — from overwriting each other. A pass
with nothing in any of the three rows writes **no** proposal file: a `no-op` pass opens no PR and
writes no proposal file (AC-1.4).

The file supersedes nothing about the shipped four-column proposal table
(`pdlc/skills/consolidate-learnings/SKILL.md:54`): that shape remains the fallback's presentation,
now carrying the concrete diff rather than a prose description of it, because the PR route is the
primary channel and the file is what it degrades to.

### 5.4 The consuming-repo writes and their single commit (AC-3.8b)

Exactly these paths are the pass's consuming-repo write set:

| Path | Written by |
|---|---|
| `docs/_constraints/DOMAIN-CONSTRAINTS.md` | AC-2.1 promotions |
| `docs/_decisions/DECISIONS-{topic}.md` | AC-2.2 promotions |
| `docs/_decisions/.consolidation-log.md` | the consumed pair (§3.3) and the terminal row (§10) |
| `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` | §5.3, when written |

They land **in the invoking tree, on whatever branch it is already on**. AC-3.8 forbids the pass any
branch operation in that tree — no `checkout`, `switch`, `stash`, `reset`, `rebase`, or fetch into
its refs — so the invoking tree's HEAD is identical before and after the pass, including when it is
mid-pipeline on a `feat-*` branch. §6.1 states where the *guard-set* work happens instead.

**The commit shape is pathspec-scoped on both calls**, once, at the terminal outcome (step 15):

```
git add    -- {paths}
git commit -m {msg} -- {paths}
```

| Property | Value | Precedent at HEAD |
|---|---|---|
| Pathspec on **both** calls | required | `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`; add `:1577`, commit `:1579-1585`) and `commitAdvisoryRecord` (`:1615`), which mirrors its two-call shape |
| Never `-a`, never pushed | required | both precedents above |
| **Not** the `commitPaths` shape | required | `commitPaths` (`pdlc/workflows/orchestrate-dev.js:8669`) commits with a plain `git commit -m` and no pathspec (its doc comment at `:8660-8663` states that as deliberate) — which would sweep a staged index into the pass's commit, and AC-3.8's shipping tree may be mid-pipeline with one |
| `index.lock` retry | required | the same transient class `gitWithLockRetry` (`:8617`) handles for `commitPaths` (`:8670`) |

Consequences this FSPEC commits to:

- The §4 marker is **never** committed: `docs/_decisions/.consolidation-lock` appears in no pathspec
  of any pass, and the `.gitignore` entry (§4.1) closes the same gap against actors that are not
  pathspec-scoped.
- An unrelated pathspec-scoped pipeline commit in the same tree cannot pick these files up, and the
  pass's commit cannot pick that work up.
- A commit that still fails after the retries **leaves the writes uncommitted for the operator**,
  records `writes-uncommitted`, and **does not change the terminal status** (§12). The writes are
  correct on disk either way.
- A `git add` that stages nothing is not a failure: the working tree already matched, the commit is
  skipped, and the pass records `writes-uncommitted` only when git actually refused. This mirrors the
  `NOTHING_TO_COMMIT_RE` treatment in `commitAdvisoryRecord` (`orchestrate-queue.js:1628-1633`),
  where "nothing to commit" is a return, not a warning.
- These writes **never travel through the §6 PR**, which carries only guard-set edits.

### 5.5 Where those commits go, and what abandonment costs

The invoking branch **is** the accepted destination. When it is a mid-pipeline `feat-*`, the AC-2.1
and AC-2.2 promotions reach the default branch by riding that feature's own PR — raised and reviewed
for something else — so the §10 report names the branch the commit landed on.

| Route | If the invoking branch is abandoned | Why |
|---|---|---|
| Consuming-repo writes (§5.4) | promotions **and** the §3.3 consumed pair die together; a later pass re-enumerates the same corpus and redoes the work | they are one commit, so the loss is atomic — abandonment is closed by construction |
| §6 PR route | inverts: a merged PR survives while the consumed pair, the AC-5.1 record and the AC-3.4 URL die with the branch | the PR is pushed from the §6.1 clone and lives independently of the invoking branch |

The inversion is closed on the **PR identity, not the log**: NFR-4 keys on the
`(failure-mode-id, action)` pair carried by the merged PR's `PDLC-CONSOLIDATION-PROMOTIONS` trailer,
and the id is stable across passes (§8.1), so a later pass re-deriving the same `promote` from a
*larger* consumed set records `duplicate-suppressed` rather than opening a second PR — which a
sources-set key could not do (§6.4).

What is **not** recovered is the effectiveness record: that promotion re-enters the §8.3 table as if
first made, losing its streak. This is an accepted loss, stated here and not closed. Any other
destination for the consuming-repo writes — a `consolidation/{passId}` branch for them too — is
**not specified**, because it needs the branch operations AC-3.8 forbids.

## 6. FSPEC-CONS-05 — The pull-request route

**Links:** REQ-CONS-03 (AC-3.1 … AC-3.8), NFR-1, NFR-4, AC-5.4.

### 6.1 Where the work happens — the same-repo case is the shipping case

`consolidation.pluginRepository` defaults to `null`, meaning **the current repository** (§11), and
that is the shipping configuration today: `docs/_queue/QUEUE.md` states this queue is the pipeline's
own queue, so "consuming repo" and "plugin repo" are one repository.

| Configuration | Where the guard-set edit is made | Invoking tree |
|---|---|---|
| Same repository (AC-3.8, shipping) | a **separate clone under a temporary directory**, cut from the fetched default branch | untouched — **no branch operation of any kind** |
| A different repository (BL-03) | a clone of that repository | untouched, identically |

"No branch operation of any kind" is enumerated, not summarised: no `checkout`, no `switch`, no
`stash`, no `reset`, no `rebase`, and no fetch into the invoking tree's refs. The invoking tree's
HEAD is identical before and after the pass, which is what lets a pass run while the tree is
mid-pipeline on a `feat-*` branch. Everything else in §6 applies unchanged in both configurations.

### 6.2 Branch, commits, body

| Element | Value | Source |
|---|---|---|
| Head branch | `consolidation/{passId}` | vocabularies §4 |
| Branch reuse | never across passes — `passId` makes it unique | AC-3.6 |
| Branch deletion | **not** by the pass; deletion follows the operator's merge or close | AC-3.6 — the residue of a half-failed pass stays inspectable |
| Direct push to the default branch | **never**, on any path | AC-3.6, NFR-1 |
| One commit per edit | required, even when several promotions share one PR | AC-3.3 |
| Per-commit trailer | `PDLC-PROMOTION-ID: {id}:{action}` naming exactly the proposal that commit enacts | vocabularies §4 |
| PR body trailers | `PDLC-CONSOLIDATION-PASS`, `PDLC-CONSOLIDATION-SOURCES`, `PDLC-CONSOLIDATION-PROMOTIONS` — exactly three | vocabularies §4 |

One commit per edit is what makes any single edit independently revertible and makes
commit → proposal readable without counting. A revision or retirement (§8.5) may share the PR, in
its own commit, carrying the **retired promotion's own `failure-mode-id`** under the `revise` or
`retire` action — no second id is minted for it (§8.1).

`PDLC-CONSOLIDATION-PROMOTIONS` is **set-equal** to the proposals the PR enacts: every commit's
`PDLC-PROMOTION-ID` pair appears there exactly once, and the trailer names no pair the PR does not
enact. A remediation sharing the PR is enumerated there like any other, under its own action.

Beyond the trailers, the body carries what AC-3.2 requires and a reviewer needs to judge the edit
without opening the corpus: the source LEARNINGS by **feature name**, the failure mode the edit
targets (its `symptom` line, §8.1), and the pattern evidence that cleared the AC-2.3 bar — which
features it recurred across, or the standing-invariant argument for a single occurrence.

### 6.3 When the PR cannot be opened (AC-3.5)

The pass **still** writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` with the full proposed
diff inline, so the fallback is today's behaviour rather than a lost promotion. Every failure class
is named in both the log row and the proposal file:

| Class | Reason code | Recorded alongside |
|---|---|---|
| Credential absent or invalid | `credential-unavailable` | `credential: absent` (§7) |
| `consolidation.pluginRepository` unset, not found, or renamed | `repository-unresolved` | the configured value, verbatim |
| Network / API failure, including rate limiting | `api-failure` | the API's status text |
| Head branch `consolidation/{passId}` already exists remotely | `branch-exists` | the existing branch, and any PR found for it |

The classes are decided by observation, not by inference: an authentication rejection is
`credential-unavailable` even when it arrives as an HTTP status, and a repository that resolves but
rejects the push for permissions is `credential-unavailable`, not `repository-unresolved` — the
latter is reserved for a name that does not resolve to a repository at all.

`duplicate-suppressed` is **not** a member of this table. It is decided per proposal *before* any PR
is attempted (§6.4), fires no fallback, and is not a failure.

A degraded promotion is surfaced in the §10 report under a `degraded` route with its reason code, and
the pass's terminal status becomes `promoted-degraded` when it promoted anything at all, `no-op` when
it did not — never a bare `promoted` (§7.3).

### 6.4 Idempotence — the duplicate key (NFR-4)

The suppression key is the **pair** `(failure-mode-id, action)`, read from the
`PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs in the target repository.

| PR state observed at poll time | In the key set? | Why |
|---|---|---|
| `open` | yes | the operator has not decided yet; a second PR would fragment the decision |
| `merged` | yes | it is what survives when the invoking branch carrying the log record is abandoned (§5.5) |
| `closed`, unmerged | **no** | the operator rejected that proposal; a later pass re-proposing it is intended behaviour |
| reopened | yes — it is `open` | state is read at poll time with **no memory of prior states** |

When a proposal's pair is already on a PR in state open or merged, the pass **opens nothing for it**,
records `duplicate-suppressed` naming that pair and that PR's URL in the log row's `suppressed-by:`
field and in the §10 report — one entry per suppressed proposal — and **never** extends or supersedes
that PR: an interrupted pass's partial PR is the operator's to merge or close, not silently amended.
`suppressed-by:` is never merged into `pr:`, which stays empty for a pass that opened nothing (§10.3).

**Why the pair and not either half.** Keying on the sources trailer would miss exactly when
suppression matters: a consumed set is time-dependent (§3.1 enumerates whatever is un-consolidated
*now*), so two passes proposing the same promotion normally consume different sets. Keying on the id
alone would let a merged `promote` PR suppress the `revise` and `retire` proposals §8.5 requires,
making remediation of an `ineffective` promotion unreachable — the `Unfalsifiability` problem
unsolved. With `action` in the key, a merged `promote` bars a second `promote` for that
`(phase, artifact)` pair forever and bars **nothing else**.

Idempotence is well-defined because the §8.3 verdicts are deterministic: two passes over the same
inputs derive the same ids, so the same pairs, so the same suppressions.

**Its limit, stated.** `failure-mode-id` cannot key a LEARNINGS predating that convention (§8.4), so
suppression would not protect a re-consumed pre-convention corpus. That is why the §3.2 legacy region
prevents the re-consumption rather than relying on NFR-4 to absorb it.

### 6.5 Auto-merge is impossible, by this feature's own controls (AC-3.7)

Three observables, asserted by the pass rather than inherited:

| # | Control | Observable |
|---|---|---|
| (a) | the credential grants no merge rights | §7.1 — scope is `contents:write` + `pull_requests:write` only |
| (b) | the pass never calls a merge or enable-auto-merge API on any PR — **including its own** | no such call exists on any code path |
| (c) | the PR body carries `PDLC-CONSOLIDATION-PASS` | a repo-side control can recognise the PR as machine-opened |

This **restates** `pdlc-merge-phase`'s REQ-MERGE-03 rather than inheriting it, and the distinction is
load-bearing. `guardVerdict` (`pdlc/workflows/orchestrate-dev.js:732`) over `effectiveGuardPaths`
(`:709`) is reachable only from Phase MERGE's ladder and the advisory-envelope check, both deciding
about **that run's own** PR; and Phase MERGE ships `mergeMode: "off"`
(`MERGE_DEFAULTS`, `orchestrate-dev.js:60-61`). Nothing there evaluates an inbound PR, so claiming
inheritance would assert a control nothing enforces.

Repository-side enforcement — branch protection or required review on the plugin repo — is BL-05, an
operator duty, and is explicitly out of scope (REQ §5). The three controls above hold without it.

## 7. FSPEC-CONS-06 — Credential handling

**Links:** REQ-CONS-04 (AC-4.1 … AC-4.4), NFR-2, AC-3.5, AC-3.7.

### 7.1 Scope, and why it is a principle

A credential used by this pass grants, on the repository named by
`consolidation.pluginRepository` **only**:

| Permission | Granted | Purpose |
|---|---|---|
| `contents:write` | yes | push the `consolidation/{passId}` branch |
| `pull_requests:write` | yes | open the PR |
| any merge right | **no** | AC-4.1 |
| any permission on any other repository | **no** | AC-4.1 |

This holds in the same-repo configuration too: AC-3.8 licenses a *location*, never a broader
credential.

Separating propose-rights from merge-rights **at the credential level** is what makes "the agent
cannot merge its own proposal" structural rather than procedural. It holds even if §6.5's controls
(b) and (c) both failed and even if BL-05's repo-side protection was never configured — which is the
whole reason it is stated as a requirement rather than left to the other two.

### 7.2 Resolution order and the three recorded values

The pass resolves a credential once, before the §6 route is attempted, and records exactly one
`credential:` value in its log row over the closed three-member set of vocabularies §1:

| Resolution | `credential:` value | Route |
|---|---|---|
| The environment variable named by `consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`) is set and non-empty | `present (redacted)` | §6 PR route |
| No such variable, but the invoking environment has working `gh` authentication | `local-gh` | §6 PR route — the **shipping** configuration for the same-repo case |
| Neither | `absent` | §6.3 fallback, reason code `credential-unavailable` |

`local-gh` is a supported configuration, not a degradation (AC-4.4): AC-4.1's scoped token is
required only when `consolidation.pluginRepository` names a *different* repository (BL-03).

`absent` means **no credential was in hand when the row was written**. That covers both a pass that
looked and found none, and a pass that terminated before reading one — a `refused` tick (§4.4). The
set needs no fourth "not reached" member, and this FSPEC introduces none: a value with no
vocabularies §1 row would breach REQ §4b's set-equality obligation.

An environment variable that is set but whose value the target repository rejects is
`present (redacted)` on the `credential:` field — the pass **had** a credential — while the route
still degrades with `credential-unavailable` (§6.3). The two fields answer different questions and
are never collapsed.

### 7.3 Degradation, and the status it forces (AC-4.3)

An absent or invalid credential **does not halt the pass** and **is not a silent skip**:

1. The affected promotion degrades to the §6.3 proposal-file fallback with reason code
   `credential-unavailable`.
2. The log row records `credential: absent` (or `present (redacted)`, per §7.2).
3. The §10 report surfaces that promotion under a `degraded` route, with its reason code.
4. The terminal status is:

| The pass promoted… | Terminal status |
|---|---|
| anything at all (a constraint, a decision, or a PR that did open) | `promoted-degraded` |
| nothing | `no-op` |
| — | **never** a bare `promoted`, so a degraded run cannot read as an unqualified success |

The rest of the pass proceeds normally: the consumed pair is already appended (§3.3), the §8.3
effectiveness table is still computed and reported, and the §5.4 commit still runs.

### 7.4 Non-disclosure (NFR-2, AC-4.2)

The credential value is read at runtime from the environment and:

| Surface | Rule |
|---|---|
| the log row | never — only the `credential:` field's enumerated value |
| the PR body | never |
| `CONSOLIDATION-PROPOSAL-{passId}.md` | never |
| the §10 report body | never |
| any notification | never |
| any file the pass writes | never — it is not persisted into any artifact |

The rule is stated as a **conjunction with a positive obligation**, not as a bare absence: the
absence assertion is paired with the `credential:` field, so it is made on a path that demonstrably
ran. A pass that wrote a row is a pass that reached the credential decision; an oracle can therefore
assert both halves on the same artifact rather than asserting only that a secret did not appear (a
test an empty file would pass).

The value is never echoed back through a subprocess argument either: it reaches `git` and the PR API
through the environment, so it cannot surface in a command line the pass logs on failure — which is
the one path where the §6.3 `api-failure` class ("the API's status text") could otherwise carry it.
The status text recorded is the API's, never the request.

## 8. FSPEC-CONS-07 — Falsifiability

## 9. FSPEC-CONS-08 — Advisory-corpus input

## 10. FSPEC-CONS-09 — Reporting and the log record grammar

## 11. Configuration parse behaviour

## 12. Observable outcomes per scenario

## 13. Acceptance tests

## 14. Obligations and open questions

## 15. Traceability
