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
| 8 | Read the consumed LEARNINGS bodies (§3) and issue the pass's **first advisory dispatch** — the clustering call — through `resolveAdvisoryRung` (§2.6). Rung resolution is *observed here, by that real dispatch*, and nowhere earlier | `failed` (`advisory-model-unresolved`) when neither rung resolves; `failed` with **no** reason code when that dispatch fails for any other reason (§2.6 row 4) |
| 9 | Apply the AC-2.3 bar to the clusters the step-8 dispatch returned | — |
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

**Step 8 is one step, not two, and that is forced by the seam.** §2.6 explains why: the shipped
resolver has no probe mode, so "resolve the rung" and "make the first advisory dispatch" are the same
observation. Reading the bodies is therefore inside step 8, because that dispatch's prompt is what
carries them.

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

**Measured first-tick behaviour on this repo at authoring time** — a worked illustration of the two
tests, **not** the Given of any acceptance test. The corpus is a live, growing set: this feature's own
Phase H adds `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md`, which the
`docs/*/LEARNINGS-*.md` glob admits, so the numbers below change on the very PR that ships the pass
and the volume test inverts a few features later. AT-C1 is therefore stated over a **constructed
corpus fixture** parameterised on `(n corpus files, k named in the legacy region, volumeThreshold)`,
never over the repository. With that said, at the commit this section was written: step 2 enumerates
5 LEARNINGS —
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
resolver whose doc comment (`:1800`) calls it "the **one** ladder the tier ships". It restates
neither `MODEL_ADVISORY` (`:1652`) nor `MODEL_ADVISORY_FALLBACK` (`:1653`); those are module-private
and stay so.

**Two properties of the shipped resolver govern how it can be reused, and both are stated here
rather than assumed.**

1. **There is no probe mode.** The doc comment states it in so many words (`:1811-1813`):
   non-resolution is detected "by classifying the rejection of the **real** dispatch
   (`isModelResolutionError`), never by a separate probe — the caller's own `prompt` is what goes
   out". So *resolving the rung* and *making the pass's first advisory dispatch* are one act, and a
   step that resolved the rung without dispatching anything would have to be a throwaway dispatch
   this FSPEC declines to spend. Step 8 is therefore stated as **the first advisory dispatch**: the
   clustering call, carrying the consumed LEARNINGS bodies as its prompt.
2. **The dispatched skill is a constant, so reuse needs one signature widening.** `ADVISORY_RUNG_SKILL`
   is `"se-review"` (`:1797`) and is the only skill the resolver dispatches (`:1841`,
   `_agent(ADVISORY_RUNG_SKILL, prompt, { model })`); the exported signature is
   `({ _agent, _log, _state, prompt })` (`:1833`) and takes no skill. Reusing it verbatim would send
   every consolidation prompt to `se-review`. This feature therefore adds an **optional `skill`
   parameter defaulting to `ADVISORY_RUNG_SKILL`**, so every existing call site is unchanged and the
   ladder stays single. That is an edit to `pdlc/workflows/orchestrate-dev.js` — a guard-set path —
   and it is listed as such in §15.3 and constrained at §14.1 T-05. The alternative the corpus
   baseline §3 sanctions (restating the two literals behind a drift observable) is **not** taken: it
   would create the second copy of the ladder that comment forbids.

`rungState` is this pass's own `{ resolved: null }`, the shape `orchestrate-queue` initialises at
`pdlc/workflows/orchestrate-queue.js:1120`. The queue threads that state into `runAdvisorySeam`
(`:1245-1256`), not into the resolver, and the resolver's only shipped call site is
`orchestrate-dev.js:3132` inside `runAdvisorySeam` — so **this pass's direct call is a new call
site**, not an instance of a shipped pattern, and this FSPEC says so rather than citing a precedent
that does not exist.

| # | Dispatch outcome | Behaviour | Recorded |
|---|---|---|---|
| 1 | Primary rung resolves (`{kind: "response"}`) | pass proceeds with the returned clusters | the rung it ran on, in the report (`rung:`) and in the log row |
| 2 | Primary fails a model-resolution check, fallback resolves | pass proceeds; the resolver emits `ADVISORY_MODEL_FALLBACK:` (`:1859`) and the pass surfaces **that line verbatim** in its report body (§10.4 item 2) | the **fallback** rung, named — never a silent downgrade, and never the primary rung |
| 3 | Neither rung resolves | the resolver throws its halt error (`:1868`). The pass **makes no promotion**, appends its terminal row, releases the marker (§4.3), and exits | status `failed`, reason code `advisory-model-unresolved` |
| 4 | The dispatch fails for a reason that is **not** model resolution — the resolver's fourth return, `{kind: "dispatch-error", err}` (`:1857`, `:1867`) | the pass **makes no promotion**, appends its terminal row, releases the marker, and exits — identically to row 3 in every observable except the reason field | status `failed`, **no reason code**, with the error's message surfaced verbatim in the report body |

There is no third rung, no default-model fall-through, and no fifth outcome: rows 1–4 are set-equal
to the resolver's return and throw set.

**Row 4 carries no reason code deliberately, and the gap is routed upstream.** `reason:` is "zero or
more reason codes" (§10.3), and `skipped-cadence` already ships carrying none — so an empty reason
field is a legal row, not an invented value, and nothing here breaches REQ §4b. But an operator
reading `failed` with an empty reason cannot tell row 4 from a truncated row without opening the
report body, so this FSPEC records an **erratum against the REQ** asking for a dedicated reason code
(`advisory-dispatch-failed`, permitted with `failed`) in vocabularies §1 (§14.4). Until that row
exists, row 4's discriminator is the report body, and AT-M6 asserts it there.

Every other agent dispatch the pass makes — the §8.5 remediation authoring at step 12 and the §5/§6
proposal authoring at step 13 — goes out through the **same** resolver with the same `rungState`, so
rows 2–4 are their arms too. A memoised `rungState` means rows 2 and 3 cannot re-occur after step 8
(`:1844-1849`: with `_state.resolved` set, the cached rung is used and no ladder is entered), but
row 4 can, and it terminates those steps exactly as it terminates step 8.

**Step 8's position is forced, and its consequence is stated rather than hidden.** The first advisory
dispatch cannot be moved before step 7: AC-1.3's table records `failed` as a status that **takes**
the marker, and vocabularies §3(a) obliges every marker-holding pass to append its consumed pair
*before any other record it writes* — and a `failed` pass does write a record, its AC-7.2 terminal
row. So a pass that dies at step 8 has already marked its corpus consolidated while producing **no
promotion, no effectiveness verdict and no proposal** from it, and step 15 commits that block. Under
the §3.2 predicate those files are then permanently consolidated: no pass re-enumerates them, and no
vocabularies §1 field exists in which a `failed` pass could record "re-consume these". This FSPEC
specifies the ordering as required and raises the loss as an upstream item (§14, O-C1); it does not
invent a recovery channel, which would add an unlisted record type and breach REQ §4b's
set-equality obligation. The loss is stated over *value extracted*, not over *bodies read*: fusing
resolution into the first dispatch means a row-3 or row-4 pass has read the bodies into a prompt
that produced nothing, which is the same loss by a different route.

## 3. FSPEC-CONS-02 — The consumed predicate and the LEARNINGS corpus

**Links:** REQ-CONS-01 (predicate, corpus, tick step 1), AC-1.1, AC-1.2, AC-2.4, NFR-5, REQ §5
(the three shipped-file edits).

### 3.1 The corpus — what is enumerated

Enumeration is **basenames only**. No step in §2.2 before step 8 opens a LEARNINGS file, and a
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
tick order forbids before step 8. The basename test is adopted for both reasons (REQ-CONS-01).

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
| Log file present, unreadable (permissions, IO error) | treated as **empty text**, mirroring the shipped hook's `except: logtext = ""` (`nudge-consolidation.sh:38-39`) | fail-open toward re-consumption, never toward silently skipping a corpus. NFR-4 then suppresses a duplicate **PR-route** proposal, whose carrier is the PR trailer and is unaffected; the **consuming-repo** route's carrier is the log's own failure-mode records (§6.4), which this state makes unreadable — so a duplicate append on that route is possible here and is reported as such, not claimed away |
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
| Both read "absent", both write | the later writer's line stands | the earlier writer's marker is overwritten; it releases at step 16 having done its work | both consumed pairs append; the second names an already-consolidated set. §6.4's NFR-4 suppression prevents a duplicate **PR-route** proposal (its carrier, the PR trailer, is written by whichever pass opened first). On the **consuming-repo** route the two passes may both read the log before either appended its failure-mode record, so a duplicate append is reachable in this race and is not claimed away — see below |

The second row is the residual race the file-marker design does not close, and it is stated rather
than claimed away: without an atomic create-exclusive primitive the take is read-then-write. Its
blast radius is bounded by two properties that hold independently — every log write is a whole-record
append, so no record is lost whatever the order; and NFR-4's PR-route carrier is the PR trailer, not
the log, so the second pass opens no duplicate PR even though its consumed set overlaps.

**What that bound does *not* cover, stated rather than implied.** The consuming-repo route's NFR-4
carrier *is* the log (§6.4), and in this interleaving both passes may read it before either appended
its failure-mode record — so a duplicate append to `DOMAIN-CONSTRAINTS.md` or
`DECISIONS-{topic}.md` is reachable in this race alone. It is an operator-visible duplicate line in
an append-only file, not a lost or corrupted record, and it is bounded by the same marker that makes
the race rare; closing it needs the atomic create-exclusive take TSPEC may choose if the runtime
offers one (§14, O-C3). This FSPEC reports the exposure rather than asserting a suppression that
cannot fire.

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

**`{topic}` is derived, not chosen** (AC-2.2 states the destination; the derivation is this layer's).
It is the **promotion's own `failure-mode-id` `phase` segment plus the basename of its `artifact`**,
under §8.1's slug normalisation — i.e. `{topic} = failure-mode-id with the artifact's directory
segments dropped`. Worked: `phase = P`, `artifact = pdlc/skills/se-author/SKILL.md` ⇒
`docs/_decisions/DECISIONS-p-skill-md.md`. Three properties follow, and each is why the derivation is
stated rather than left to the model:

| Property | Consequence |
|---|---|
| A pure function of the two keying fields (§8.1), never of `symptom` or of the consumed set | two passes recognising one decision write the **same** path, so §6.4's consuming-repo carrier can suppress the second — a model-chosen topic would not be stable enough to key on |
| An existing file at that path is **appended to**, never replaced or re-created | the file is an append-only decision record like `DOMAIN-CONSTRAINTS.md`; §10.2's write granularity applies to it |
| The path is always inside `docs/_decisions/` and never inside a guard-set prefix | so an AC-2.2 promotion is always the §5.1 consuming-repo route, never the PR route |

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
same-day passes — an expected case under the volume trigger — from overwriting each other.

**The file's existence is decided by the three rows above and by nothing else** — never by the
terminal status. A pass with nothing in any of the three rows writes **no** proposal file; a pass
with something in any of them writes one, whatever its terminal status. Both directions are
observable, so the rule is stated once here and not restated per status:

| Pass | Proposal file | Why |
|---|---|---|
| `no-op` because the consumed set was empty (AC-1.4's first cause) | **none** | nothing to propose |
| `no-op` because every promotion was duplicate-suppressed (AC-1.4's second cause) | **none** | a suppressed proposal fires no fallback (§6.4) and is not a §5.3 row |
| `no-op` because its **only** promotion degraded on an absent credential (§7.3, §12.1 S-08) | **written** — row 1 of the table above | §6.3 requires the full diff inline; without the file that promotion would be lost, which is the very outcome AC-4.3 exists to prevent |
| `promoted-degraded` with a degraded promotion | **written** | same row |

AC-1.4's "exits successfully without opening a PR or writing a proposal file" describes its **two
named causes**, both of which are the first two rows. The third row is AC-4.3's degraded pass, which
reaches `no-op` by a cause AC-1.4 does not enumerate. This FSPEC reads the two criteria as
complementary rather than contradictory and records an **erratum against the REQ** asking AC-1.4 to
say so explicitly (§14.4); the behaviour specified here is unambiguous either way, and AT-K3 asserts
it in both halves.

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
| Pathspec on **both** calls | required | `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`; add `:1577`, commit `:1580-1586`) and `commitAdvisoryRecord` (`:1615`), which mirrors its two-call shape |
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
  `NOTHING_TO_COMMIT_RE` treatment in `commitAdvisoryRecord` (`orchestrate-queue.js:1631-1635`),
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

The suppression key is the **pair** `(failure-mode-id, action)`. The pair is one key with **two
carriers**, one per route, because a promotion that never becomes a PR never appears in a PR trailer:

| Route | Carrier of the key set | Observed states |
|---|---|---|
| §6 PR route (guard-set targets) | the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs in the target repository | `open` / `merged` / `closed`-unmerged / reopened — the table below |
| §5.2 consuming-repo route (`DOMAIN-CONSTRAINTS.md`, `DECISIONS-{topic}.md`) and the §5.3 proposal-file route | the **§8.1 failure-mode records already in `docs/_decisions/.consolidation-log.md`**, each of which carries its `failure-mode-id` and its `action` (§10.2 order 2) | `enacted` (a prior pass's record carries this pair) / `absent` (no record does) — a two-member set, read from the same log text the §3.2 predicate reads |

**The consuming-repo carrier's rule.** A proposal whose pair is `enacted` — some prior pass's
failure-mode record in the log carries the same `(failure-mode-id, action)` — is **suppressed**: the
pass appends nothing to `DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md` for it and records
`duplicate-suppressed` naming the pair and the `passId` of the record that enacted it, in place of a
PR URL. So re-running a pass over the same corpus does **not** append the same constraint twice.

**Why that carrier is sound where a PR trailer would not be.** The AC-2.1/AC-2.2 append and the
failure-mode record that keys it are written into the **same §5.4 commit** (§10.2 orders 2–4 and
§5.4's single pathspec), so they land together or not at all. A record present without its append, or
an append without its record, is therefore not a state this route can reach through the pass's own
writes — which is exactly the atomicity §5.5 row 1 already relies on. The PR route needs a different
carrier for the opposite reason: its edit lives in the §6.1 clone and survives its record (§5.5 row
2), so only the PR itself can attest it.

**Its limit, stated.** If the invoking branch is abandoned, the record and the append die together
and a later pass re-derives and re-appends the promotion — correctly, because the constraint is not
in the consuming repo either. And a record written by a pass whose §5.4 commit was refused
(`writes-uncommitted`) is on disk but uncommitted; the next pass in that same working tree reads it
and suppresses, a pass in a different checkout does not. Both are the same working-tree reliance
§3.3 already states for the consumed pair, not a new one.

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

**Links:** REQ-CONS-05 (AC-5.1 … AC-5.5), NFR-4, AC-1.4, AC-3.3, AC-7.1.

### 8.1 The failure-mode record and the id derivation

Every promotion records a four-field structured record, not prose:

| Field | Value | Keys the id? |
|---|---|---|
| `failure-mode-id` | the derived slug below | — |
| `phase` | a member of the closed 13-member catalogue `R / F / T / D / P / PR / I / PT / CR / DOD / H / PUB / MERGE` (vocabularies §1, sourced from `PHASE_DISPATCH`, `orchestrate-dev.js:3337-3437`, and the `recordPhase` literals for I `:10020`, PT `:10250`, H `:10407`, PUB `:10462`, MERGE `:10568`) | **yes** |
| `symptom` | one line, human-readable, explicitly **non-keying** | **no** |
| `artifact` | **exactly one canonical repository path** — the single file the edit touches; never a glob, never a directory; root-relative, no `./`, no symlink alias | **yes** |

**The derivation** (delegated to this layer by AC-5.1), a pure function of two file-text inputs:

> `failure-mode-id = "{phase-lowercased}-{artifact-slug}"`, where `artifact-slug` is the normalised
> path with `/` and `.` each replaced by `-`, lowercased, with any run of non-`[a-z0-9-]` characters
> collapsed to a single `-` and leading/trailing `-` stripped.

Worked: `phase = DOD`, `artifact = pdlc/skills/dod-verify/SKILL.md` ⇒
`dod-pdlc-skills-dod-verify-skill-md`. It is total (every path yields a slug), injective enough for
its purpose (two distinct `(phase, artifact)` pairs cannot collide, because the substitution is
reversible up to case), and consults nothing else — not the pass, not its consumed set, and **not**
`symptom`.

**Why exactly those inputs.** Determinism of the derivation is not stability of its inputs. `phase`
and `artifact` are *file* text — the property §8.3's determinism rests on. `symptom` is a line the
pass's own model writes under no vocabulary, so two passes recognising one failure mode from
different corpora would word it differently and slug differently — exactly the case NFR-4 must
survive (§5.5's abandonment: a later pass with a *larger* consumed set). The glob form is forbidden
for the same reason in the other direction: passes free to name `pdlc/workflows/orchestrate-dev.js`,
`pdlc/workflows/*.js` or `pdlc/workflows/` for one mode would slug three ways and NFR-4 would miss.

### 8.2 One promotion is one authored file

"The single file the edit touches" is a requirement, not an assumption.

| Shape | Proposals | Consequence |
|---|---|---|
| A remedy spanning two authored files | **two** — two ids, two §6.2 commits, two §8.3 rows, two §8.4 streaks | they may share one PR (§6.2 already permits that); they share nothing else and are measured separately |
| An authored file plus its regenerated build outputs | **one** — `artifact` is the authored source file | the generated paths ride the authored file's commit |

**Generated is a predicate keyed on the producer, never on a path glob.** A path a tracked build step
of this repo writes is generated. At HEAD that is exactly the four tracked outputs of
`pdlc/workflows/build-runtime.mjs`, all under `pdlc/workflows/dist/`, which `CLAUDE.md` requires to be
rebuilt "in the same commit" as their source. An authored file whose path merely *contains* `dist/` —
the `pdlc/workflows/__tests__/fixtures/` copies — is **authored** and does mint an id. So an edit to
`pdlc/workflows/orchestrate-dev.js` plus its rebuilt bundles is one promotion whose `artifact` is
that source file, and the derivation stays total on every edit shape.

**Uniqueness, scoped.** Within one pass the pair `(failure-mode-id, action)` is unique: two proposals
deriving one id under one action name the same `phase` and `artifact`, are one failure mode, and are
recorded once. The pass never mints a suffixed variant — that would break derivation purity and with
it NFR-4. Two distinct failure modes in one phase touching one file therefore merge into one
promotion carrying one `symptom`; that is the accepted cost of a path-level key (D-CONS-08).

**Across passes the id deliberately repeats** — NFR-4 sanctions re-proposing a promotion whose PR the
operator closed unmerged. Log **records** are keyed `(failure-mode-id, passId, action)`; a
**promotion**, the unit whose effectiveness is measured, is keyed on the id alone. Every
effectiveness contract counts promotions: §8.3 emits one row per id, §8.4 counts one streak per id
over all its records, §8.5 retires an id.

**`action`** is one of `promote` / `revise` / `retire`, recorded beside the id and **never folded
into its derivation**.

### 8.3 The effectiveness table (AC-5.2)

Every pass that emits a report emits this table over **every** promotion recorded in prior passes.
Each row's verdict is decided by a rule with **no model judgment**, so two runs over the same inputs
cannot disagree:

| Verdict | Condition |
|---|---|
| `recurred` | at least one LEARNINGS in this pass's consumed set names this `failure-mode-id` |
| `prevented` | no consumed LEARNINGS names the id, **and** at least one consumed LEARNINGS is decided by the phase observable to have exercised the promotion's recorded `phase` |
| `insufficient-evidence` | otherwise — no consumed LEARNINGS is decided to have exercised that phase |

The three arms are evaluated in that order and are exhaustive, so the split is total and an
undecidable input falls into `insufficient-evidence` rather than into a guess.

**The phase observable** — how a consumed LEARNINGS' phase population is decided (delegated here by
AC-5.2) — is stated in `docs/_constraints/pdlc-consolidation-vocabularies.md` §2 at `Version` 1.4 and
is **binding, not restated**. Two consequences this rule depends on:

1. Its decidable and undecidable halves are set-equal to the 13-member catalogue **for every file**,
   which is what makes the rule total.
2. Any phase the mapping cannot decide counts as **not** exercised, routing that promotion to
   `insufficient-evidence` and never to a guessed `prevented`.

This feature adds the **`Phases exercised`** row to the harvest metadata table
(`pdlc/skills/harvest-learnings/SKILL.md:70-78`), so post-convention LEARNINGS carry the value
directly and the §2 mapping is needed only for pre-convention files.

**Set-equality obligation on the table.** Exactly one row per **distinct `failure-mode-id`** recorded
in prior passes — records sharing an id are one promotion carrying one standing verdict, not two rows
— with **no missing rows and no rows for promotions never made**. A dropped row is a failure, not a
smaller table.

### 8.4 Making the id observable in the corpus, and its limit

This feature adds a `failure-mode-id` line to the LEARNINGS §5 Open Items convention, which is what
makes `recurred` observable at all.

| Corpus file | Evidence for `recurred`? | Evidence for the `phase` population? |
|---|---|---|
| Post-convention (carries `failure-mode-id` lines) | yes | yes |
| Pre-convention (carries none) | **no** — it names no id | yes, via the §2 mapping from `Harvested from` |

A pre-convention LEARNINGS therefore cannot produce a false `recurred`, and can produce a
`prevented` — which is correct: it exercised the phase and did not report the mode.

### 8.5 `ineffective`, and which remediation is proposed

**The flag.** A promotion whose verdict was `recurred` on **two consecutive counted passes** is
flagged `ineffective`.

| Pass kind | Counted toward the `ineffective` streak? |
|---|---|
| returned `prevented` or `recurred` for this promotion | **yes** |
| returned `insufficient-evidence` | no — skipped entirely, neither advancing nor resetting |
| had an **empty consumed set** (AC-1.4's first cause — produces no verdict at all) | no |
| `skipped-cadence` | no — it emits no table |

The population is keyed on **consumed-set emptiness, never on the `no-op` label**: a
duplicate-suppressed `no-op` has a non-empty consumed set and *is* counted. Quiet weeks therefore
cannot silently reset a streak. The streak is counted **in passes, not elapsed time**.

**The choice (delegated here by AC-5.3).** The pass proposes exactly one of `revision` / `retirement`,
by this rule, evaluated top-down; the first matching row decides:

| # | Condition | Proposed |
|---|---|---|
| 1 | a `retire` proposal for this id is already on a PR in state open or merged | **nothing** — the ladder has ended; record `duplicate-suppressed` against that PR and report the field as `retirement` |
| 2 | a `revise` proposal for this id is already on a PR in state open or merged | `retirement` |
| 3 | the promotion's `artifact` still exists and the recurrence names the same `symptom` the promotion targeted — the edit addressed the right mode and under-reached | `revision` |
| 4 | otherwise — the recurrence indicates the edit targeted the wrong mechanism, or the `artifact` no longer exists | `retirement` |

Rows 1–2 are the **spent-alternative** clause: NFR-4 suppresses on the pair, so each action fires at
most once per id, and without this clause AC-5.3's promise would be merely achievable rather than
guaranteed. `retire` is **terminal** — a retired promotion is gone, so no successor is owed — and
terminality is stated over the **proposal** (row 1), since the pending case is the reachable one.

The §10 report names the chosen alternative in a field over `revision` / `retirement`, **absent** for
an ordinary `promote`, which chose nothing. The field names the alternative **actually proposed**,
never the one displaced.

A **merged revision resets that promotion's `ineffective` streak to zero**, so a revision that lands
is re-judged on two fresh `recurred` counted passes rather than re-flagged on the next one.

### 8.6 Routing a remediation (AC-5.4)

Retiring or revising follows the **same propose-only path as making** the promotion — the route is
decided by the promotion's own `artifact`, exactly as §5.1 decides any target:

| The promotion landed in… | Its remediation |
|---|---|
| a guard-set path | a PR (§6), under the `revise` or `retire` action |
| `DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md` | written into `CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval — **never** applied by the pass |

Removal is as reviewable as addition on both routes. A revision routes exactly as that promotion's
retirement would; the two alternatives differ in the edit they carry, never in their route. The unit
remediated is a `failure-mode-id`, not one of its records, and neither proposal is ever suppressed by
the `promote` it remediates (§6.4).

### 8.7 `unmeasurable` (AC-5.5)

A promotion that returned `insufficient-evidence` on `consolidation.unmeasurablePasses` consecutive
**evaluated** passes (default 3) is reported `unmeasurable`.

| Pass kind | Evaluated? | Effect on the `unmeasurable` streak |
|---|---|---|
| non-empty consumed set, produced any verdict for this promotion | yes | `insufficient-evidence` advances it; `prevented` or `recurred` **resets it to zero** |
| empty consumed set (AC-1.4's first cause) | no | neither advances nor resets |
| `skipped-cadence` | no | neither |
| duplicate-suppressed `no-op` (consumed set non-empty) | **yes** | advances or resets normally |

The population is deliberately **not** §8.5's `counted` set, which excludes `insufficient-evidence`
by construction and would make this state unreachable. Once reached, `unmeasurable` stands until a
verdict resets it, and a `no-op` pass restates it meanwhile (AC-1.4) — as it restates every prior
promotion's standing verdict and state.

## 9. FSPEC-CONS-08 — Advisory-corpus input

**Links:** REQ-CONS-06 (AC-6.1 … AC-6.3), AC-2.3, AC-3.1, BL-01a.

### 9.1 What is read, and what is never counted

The pass's machine-readable advisory input is `docs/_queue/ESCALATIONS.md` — the one durable
per-seam record, per `docs/_constraints/pdlc-advisory-corpus-baseline.md` §1 at `Version` 1.0,
binding here and not restated.

| Input | Role |
|---|---|
| `docs/_queue/ESCALATIONS.md` | the **only** numeric input — counts per `Seam` per `Feature` |
| advisory text folded into a LEARNINGS by the H2 distil step | **corroborating and non-numeric** — the pass may cite it as evidence, never derives a count from it |
| per-feature `ADVISORY-{feature}.md` | not read — baseline §1 states it is deleted after Phase PUB's distil step |

The asymmetry is deliberate: the distilled text is prose an LLM wrote, so a count taken from it would
be a count of phrasings. `renderEscalationEntry` (`pdlc/workflows/orchestrate-dev.js:2763`) emits
fixed fields, which is what makes counting well-defined.

**Absent-first, by construction.** Baseline §2 finds `ESCALATIONS.md` absent at HEAD — verified:
`docs/_queue/` contains only `QUEUE.md` — because the advisory tier ships disabled. This section is
therefore specified so that it ships and is testable with the tier off; corpus availability is
tracked as BL-01a, not asserted as delivered, and it does **not** gate this FSPEC.

### 9.2 Counting (delegated here by AC-6.1)

`ESCALATIONS.md` is an append-only sequence of entries, each rendered by `renderEscalationEntry`
(`:2763`). The count is over **entries**, and an entry's two keying fields are read from its metadata
table rather than from its heading:

| Field | Emitted at | Read as |
|---|---|---|
| `Feature` | `orchestrate-dev.js:2782` (`\| Feature \| ${feature} \|`) | the feature key |
| `Seam` | `:2783` (`\| Seam \| ${seam} \|`) | the seam key, a member of `ADVISORY_SEAMS` (`:1669`) |

The entry's `## {iso} — {feature} — {seam}` heading (`:2776`) carries the same two values and is
**not** the parse target: a feature name containing an em dash would make the heading ambiguous while
the table row stays exact. Reading the table is the receive-side total parse (DC-01).

The count is `escalations[seam][feature]`, and the two derived quantities §9.3 uses are: a seam's
**total** across all features, and its **distinct feature count**.

### 9.3 The three corpus states (AC-6.1)

Shipping state first. Every state is decidable and none is an error:

| Corpus state | Meaning | Pass behaviour |
|---|---|---|
| File **absent** | the tier has never run here — the shipping default, `advisory.enabled: false` | record reason code `no-advisory-corpus`; make **no** seam proposal of any kind — neither §9.4 nor §9.5 may fire; the rest of the pass proceeds normally |
| File present, **zero entries** | the tier ran and escalated nothing | record `advisory-corpus-empty`; §9.4 cannot fire (no counts) and §9.5's non-emptiness gate fails |
| File present, **≥1 entry** | a real corpus | §9.4 and §9.5 apply as written |

Two receive-side clauses complete the totality (DC-01): a file present but unreadable is treated as
**absent** (`no-advisory-corpus`), never as empty — the two codes make different claims and are never
conflated; and an entry whose `Feature` or `Seam` row is missing or unparseable is **skipped and
reported as a parse notice**, never counted under a guessed key, and never aborts the read.

**Absence of the file is never read as absence of escalations.** A tier that could not escalate is
not a tier whose seams worked — which is why row 1 suppresses both proposal kinds rather than letting
§9.5's "no escalations from this seam" condition read as true for all five seams at once.

### 9.4 Over-escalating seam (AC-6.2)

| Conjunct | Condition |
|---|---|
| Pattern bar | the seam's escalations span **at least two distinct features** — the AC-2.3 bar applied to this corpus |
| Dominance | the seam's total **exceeds** every other seam's total |

Both required. When they hold, the pass surfaces that seam as a candidate for **envelope revision or
upstream-phase repair**, bound to the relevant deferral. It is surfaced, not enacted — like every
other guard-set change it reaches the operator through §6 or §5.3.

A tie on the dominance test fires nothing: `exceeds` is strict, so two seams at the same total are
not a signal, and the pass reports the tie in its §10 report rather than picking one.

### 9.5 Under-exercised seam (AC-6.3)

| Conjunct | Condition |
|---|---|
| Corpus non-empty | at least one **other** seam escalated across the consumed window (row 3 of §9.3) |
| Silence | this seam has escalations from **no** feature across that same window |

Both required, and the first is what stops a first pass on a stock repo from proposing a widening for
all five `ADVISORY_SEAMS` (`orchestrate-dev.js:1669`) on the strength of a corpus no run could have
written. The proposal is an **envelope widening**, never enacted.

**Where it routes** turns on which surface holds the value:

| Target | Route |
|---|---|
| the **shipped defaults** in `pdlc/workflows/` | a PR, under §5.1's guard-set predicate — `pdlc/workflows/` is a `MERGE_GUARD_DEFAULTS` member |
| a consumer's `.claude/pdlc.config.json` | **not** a PR-able surface — the file is untracked (`/.claude/workflows/` is gitignored and the config is per-consumer), so the widening is reported as an **operator action** in the §10 report |

The second row is not a degradation and carries no §6.3 failure class: there is no PR to fail to
open. It appears in the report under the operator-action heading, not under `degraded`.

### 9.6 The honest limit

`ESCALATIONS.md` records **escalations, not resolutions** (baseline §4). Nothing in §9.4 or §9.5
therefore measures whether a seam's advisory attempt *worked* — only how often it gave up. A
resolution-rate input needs `advisorySummaryRows` (`orchestrate-dev.js:2708`) persisted into a
defined LEARNINGS section, which is an `orchestrate-dev` change and is deferred as D-CONS-06. This
FSPEC states the limit rather than papering over it: a seam that never escalates because it never
runs and a seam that never escalates because it always succeeds are **indistinguishable** in this
corpus, and §9.5's proposal is a candidate for human judgment for exactly that reason.

## 10. FSPEC-CONS-09 — Reporting and the log record grammar

**Links:** REQ-CONS-07 (AC-7.1, AC-7.2), AC-2.4, AC-3.4, AC-5.1, AC-1.3, NFR-2, NFR-3a, NFR-4.

### 10.1 One report, one channel

| Terminal status | Log row written? | Report body returned? |
|---|---|---|
| `promoted` / `promoted-degraded` / `no-op` / `failed` | yes — exactly one | yes |
| `refused` | yes — exactly one (§4.4) | yes |
| `skipped-cadence` | **no row at all** | yes — the status alone |

"Exactly one report" counts **reports**, not fields: the pass's terminal report is written as its row
in `docs/_decisions/.consolidation-log.md` **and** returned as the invocation's report body (what a
`/loop` tick prints). Those are one report on one channel rendered twice, not two reports.

The `skipped-cadence` exemption is load-bearing twice: the skipped tick is the common case under
`/loop`, so a row per tick would grow the log without bound — and it is that same log the §3.2
predicate and the §2.3 cadence datum are read from.

### 10.2 Write order within a pass

Every write is an append of one whole record at end of file (vocabularies §3, binding). The pass
appends in exactly this order:

| Order | Record | Step | Condition |
|---|---|---|---|
| 1 | the `<!-- pdlc:consumed {passId} -->` pair (§3.3) | 7 | every marker-holding pass, empty pair included |
| 2 | one failure-mode record per promotion (§8.1) | 13 | when the pass promoted anything |
| 3 | the effectiveness table (§8.3) | 14 | every pass emitting a report other than `skipped-cadence` |
| 4 | the terminal row (§10.3) | 14 | as §10.1 |

Order 1 before everything else is vocabularies §3(a)'s obligation and freezes the legacy-region
boundary unconditionally. Orders 2–4 are appends in a fixed sequence so a truncated pass is readable:
a log ending mid-sequence names what the pass had decided, and the absent terminal row is itself the
evidence the pass did not complete.

**No record is ever edited in place.** The AC-3.4 PR URL is not a back-edit of an earlier record: it
is the `pr:` field of this pass's own single terminal row, appended once. That is what keeps the log
lock-free (§4.1).

### 10.3 The terminal row's fields

One row, one pass. Each field is a member of a vocabularies §1 category; **no field carries a value
with no §1 row**.

| Field | Value | Source |
|---|---|---|
| `pass:` | `{passId}` (§2.5) | vocabularies §4 |
| `date:` | the pass's start timestamp — the value §2.3's cadence datum reads | AC-1.1 |
| `status:` | one of the six terminal statuses | AC-7.1 |
| `trigger:` | `cadence` / `volume` / `manual` — present on **every** row | NFR-3a |
| `reason:` | zero or more reason codes, each legal with this status per vocabularies §1's composition rule | AC-7.1 |
| `rung:` | the model rung the pass actually ran on (§2.6) | AC-1.5, AC-1.6 |
| `credential:` | exactly one of `present (redacted)` / `absent` / `local-gh` | AC-4.2, NFR-2 |
| `consumed:` | the consumed basenames — the §3.3 pair's set, restated for the reader | AC-2.4 |
| `promotions:` | promoted items by route: constraints / decisions / PR / `degraded` | AC-7.1 |
| `pr:` | the URL of a PR **this pass opened**, or empty | AC-3.4, AC-7.2 |
| `suppressed-by:` | zero or more `{id}:{action} → {PR URL}` entries | NFR-4 |
| `branch:` | the branch the §5.4 commit landed on | AC-3.8b |
| `deferred:` | what the pass left for human judgment | AC-7.1 |

**`pr:` is a biconditional scoped to this pass's own PR** — carried when and only when this pass
opened one. An all-suppressed `no-op` (AC-1.4's second cause) therefore leaves `pr:` **empty** and
carries its evidence in `suppressed-by:` instead. The two fields are never merged, and a row may
carry both — a pass that opened one PR and suppressed another proposal.

A row may carry **more than one reason code**. Legality is decided by vocabularies §1's composition
rule — a code is legal with every terminal status still reachable after the point at which it was
recorded — not by the status under which the code was first introduced.

`consumed:` restates the §3.3 pair's set for a human reader and is **not** a second consumption
record: it lies outside any `<!-- pdlc:consumed -->` block, so under §3.2 it is in neither region and
can never mark a file consolidated. That is precisely why the block form exists.

### 10.4 The report body

The returned body carries everything AC-7.1 requires, in a form a `/loop` tick prints:

1. terminal status and reason codes,
2. the rung it ran on, and the `ADVISORY_MODEL_FALLBACK:` line verbatim when one was emitted (§2.6),
3. LEARNINGS consumed, **by basename**,
4. promotions by route — constraints, decisions, PR, `degraded` — each `degraded` one naming its
   §6.3 failure class and reason code,
5. the §8.3 effectiveness table: one row per distinct `failure-mode-id`, its verdict, and its state
   (`ineffective` / `unmeasurable`) where one holds, with the §8.5 `revision` / `retirement` field
   present only where a remediation was proposed,
6. `duplicate-suppressed` entries, one per suppressed proposal, naming the pair and the PR,
7. the §9 advisory notes: the corpus state, any §9.4 / §9.5 candidate, and any operator action,
8. what it deferred for human judgment,
9. the branch the §5.4 commit landed on, or `writes-uncommitted`.

Receive-side totality (DC-01): a section with nothing to say is rendered as an explicit empty
statement, never omitted. A reader must be able to distinguish "no promotions" from "the promotions
section was dropped", which is the same set-equality discipline §8.3 places on the table.

### 10.5 What is never in the report or the log

| Never | Why |
|---|---|
| the credential value, in any form | NFR-2, §7.4 |
| a LEARNINGS **body** quotation used as a count | §9.1 — counts come from `ESCALATIONS.md` only |
| a value with no vocabularies §1 row | REQ §4b set-equality; §15 records where each row is used |
| an in-place edit of any earlier record | vocabularies §3 write granularity |
| a basename outside a `<!-- pdlc:consumed -->` block presented as consumption | §3.2 |

## 11. Configuration parse behaviour

**Links:** REQ §4a, DC-01. Config owner: **the repo operator** — the same owner as `implementation`,
`advisory`, `distribution`, `merge`.

### 11.1 The shape, and the precedent it follows

All keys live under `.claude/pdlc.config.json` → `consolidation`, in the shape
`parseAdvisoryConfig` establishes (`pdlc/workflows/orchestrate-dev.js:1682`): **per-key independent
fallback with a stated default**, so one malformed key never retunes the rest.

The precedent's structure is followed exactly, verified at HEAD:

| Observed state | `parseAdvisoryConfig` behaviour | `consolidation` behaviour |
|---|---|---|
| file absent (`text == null`) | every key at its default, `sectionMalformed: false` (`:1689`) | identical |
| file present, not valid JSON | every key at its default, not flagged malformed (`:1693-1696`) | identical |
| valid JSON with no such section | every key at its default (`:1698`) | identical |
| section present but not an object | every key at its default, `sectionMalformed: true` (`:1700-1701`) | identical — the distinction is reported |
| one key of the wrong type | that key falls back and is named in `invalidKeys`; every other key keeps its configured value (`:1705-1713`) | identical |

Step 1 of §2.2 therefore **never terminates the pass**: there is no configuration state that halts,
and every fallback is reported rather than silently applied.

### 11.2 The keys

| Key | Type | Default | Malformed or absent | Used by |
|---|---|---|---|---|
| `consolidation.cadenceHours` | positive number | `168` (weekly) | falls back, noted in the report | §2.3 |
| `consolidation.volumeThreshold` | positive integer | `5` — matching `nudge-consolidation.sh:25` | falls back, noted | §2.3 |
| `consolidation.staleLockMinutes` | positive number | `60` | falls back, noted | §4.2 |
| `consolidation.pluginRepository` | string or `null` | `null` → **the current repository** (the same-repo case, §6.1) | a non-null value that does not resolve is **not** a parse fallback: it is reason code `repository-unresolved` and the §6.3 fallback | §5.1, §6, §7.1 |
| `consolidation.credentialEnv` | string | `"PDLC_PLUGIN_REPO_TOKEN"` | falls back, noted | §7.2 |
| `consolidation.unmeasurablePasses` | positive integer | `3` | falls back, noted | §8.7 |

The `pluginRepository` row is the one key whose failure is **not** a parse fallback, and the
distinction is deliberate: a mistyped repository name is well-formed JSON, so silently falling back to
"the current repository" would push a promotion into the wrong repo. It degrades through §6.3 with
the configured value recorded verbatim, so the operator sees what was tried.

`cadenceHours` resolves the master plan's OQ-E3 for this feature — **weekly and threshold-driven,
whichever arrives first** (§2.3). BL-04 is closed at the REQ layer; nothing here re-opens it.

### 11.3 Reporting a degraded configuration

A pass whose configuration degraded still runs. It reports, in the §10.4 body:

- each key that fell back, by name, with the default it fell back to;
- `sectionMalformed` when the `consolidation` value was present but not an object — distinguishable
  from an absent section, exactly as the precedent distinguishes them.

Neither is a reason code: vocabularies §1 has no row for a config fallback, and inventing one would
breach REQ §4b's set-equality obligation. They are report content, not enumerated status.

## 12. Observable outcomes per scenario

This is the terminal-outcome table §13's acceptance tests range over (DC-05). Every row is reachable,
every terminal status of vocabularies §1 appears, and each row names what is observable **on disk and
in the report body** — never an internal state.

### 12.1 Terminal outcomes

| # | Scenario | Status | Reason code(s) | Marker | Log row | Consumed pair | Commit |
|---|---|---|---|---|---|---|---|
| S-01 | Tick, neither test fires | `skipped-cadence` | none | not taken | **none** | none | none |
| S-02 | Tick, volume test fires, promotions land | `promoted` | — | taken, released | one | one, non-empty | yes |
| S-03 | Tick, cadence test fires on an empty datum set | `promoted` / `no-op` per outcome | `no-cadence-datum` | taken, released | one | one | yes |
| S-04 | Direct invocation, cadence not elapsed | `promoted` / `no-op` per outcome | — (trigger `manual`) | taken, released | one | one | yes |
| S-05 | Consumed set empty | `no-op` | — | taken, released | one | one, **empty** | yes |
| S-06 | Every promotion duplicate-suppressed | `no-op` | `duplicate-suppressed` | taken, released | one, `pr:` **empty**, `suppressed-by:` populated | one, non-empty | yes |
| S-07 | Some promotions landed, one PR failed to open | `promoted-degraded` | one §6.3 class code | taken, released | one | one | yes |
| S-08 | Credential absent, nothing else promoted | `no-op` | `credential-unavailable` | taken, released | one, `credential: absent` | one | yes |
| S-09 | Marker held and fresh | `refused` | `consolidation-in-progress` | **not taken** | one, `credential: absent` | **none** | **none** |
| S-10 | Marker held and stale | as the run's own outcome | `reclaimed-stale-lock` (+ others) | reclaimed, released | one | one | yes |
| S-11 | Neither model rung resolves | `failed` | `advisory-model-unresolved` | taken, released | one | one (already appended at step 7) | yes |
| S-12 | Terminal outcome reached, git refuses the commit | unchanged from the run's own outcome | + `writes-uncommitted` | taken, released | one | one | **no** — writes left in the working tree |
| S-13 | `ESCALATIONS.md` absent | as the run's own outcome | + `no-advisory-corpus` | taken, released | one | one | yes |
| S-14 | `ESCALATIONS.md` present, zero entries | as the run's own outcome | + `advisory-corpus-empty` | taken, released | one | one | yes |

Every terminal status appears: `promoted` (S-02), `promoted-degraded` (S-07), `no-op` (S-05, S-06,
S-08), `skipped-cadence` (S-01), `refused` (S-09), `failed` (S-11).

S-10, S-12, S-13 and S-14 name reason codes that **compose** with another row's status rather than
determining one — the composition rule of vocabularies §1. That is why their status cells say "as the
run's own outcome" instead of naming a status: pinning one would assert a pairing the rule does not
require.

### 12.2 Per-promotion outcomes

Independent of the pass's terminal status, each proposal reaches exactly one of:

| # | Proposal outcome | Observable |
|---|---|---|
| P-01 | applied to the consuming repo | the append in `DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md`, inside the §5.4 commit |
| P-02 | opened as a PR | the PR URL in `pr:` and in `CONSOLIDATION-PROPOSAL-{passId}.md`; one commit per edit carrying `PDLC-PROMOTION-ID` |
| P-03 | degraded to the proposal file | the full diff inline in `CONSOLIDATION-PROPOSAL-{passId}.md`, plus its failure class in both the file and the row |
| P-04 | suppressed as a duplicate | a `suppressed-by:` entry naming the `(id, action)` pair and the open-or-merged PR; **no** PR opened, **no** fallback fired |
| P-05 | written as an operator action | the §9.5 consumer-config widening, in the report only — no PR, no `degraded` classification |

### 12.3 Per-promotion verdicts and states

| # | Emitted for | Value | Where |
|---|---|---|---|
| V-01 | every prior promotion, every reporting pass | `prevented` / `recurred` / `insufficient-evidence` | one §8.3 row per distinct `failure-mode-id` |
| V-02 | a promotion `recurred` on two consecutive counted passes | state `ineffective`, plus a `revision` / `retirement` field | the same row |
| V-03 | a promotion `insufficient-evidence` on `unmeasurablePasses` consecutive evaluated passes | state `unmeasurable` | the same row |
| V-04 | an ordinary `promote` with no remediation | the `revision` / `retirement` field is **absent** | the same row |

A `no-op` pass emits V-01 through V-04 unchanged, restating each standing verdict and state
(AC-1.4) — the effectiveness table is not conditional on having promoted anything.

### 12.4 What is invariant across every row above

| Invariant | Holds because |
|---|---|
| The invoking tree's HEAD and branch are unchanged | AC-3.8 forbids every branch operation (§6.1) |
| No guard-set path is written in the invoking tree | §5.1, NFR-1 |
| No PR is merged, and no merge API is called | §6.5 |
| No credential value appears in any artifact | §7.4 |
| `docs/_decisions/.consolidation-lock` is never committed | §4.1, §5.4 |
| Every log write is an append of one whole record | vocabularies §3 |
| No consumed LEARNINGS file is modified | NFR-5 |

## 13. Acceptance tests

Per DC-05 every named behavioural branch above carries an acceptance test here. Each is stated in
**Who / Given / When / Then** form and asserts an observable of §12 — a status, a reason code, a file
state, or a field. Oracle mechanics, fixture construction and coverage floors are TSPEC's and
PROPERTIES' (DC-09).

### 13.1 Cadence, volume and the tick order (§2)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-C1 | operator | a **constructed corpus fixture** parameterised on `(n, k, volumeThreshold)` — `n` LEARNINGS files under the §3.1 globs, `k` of their basenames named in the log's legacy region, no log row carrying a datum status — instantiated at `(5, 2, 5)` | a `/loop` tick runs | the un-consolidated set has `n - k` = 3 members; `n - k < volumeThreshold`, so the volume test does **not** fire; the cadence test fires on the empty-datum branch; the row records trigger `cadence` and reason code `no-cadence-datum`. The fixture is constructed, never the live repository: the corpus grows with every delivered feature (this one included), so a Given pinned to HEAD inverts on its own PR |
| AT-C1b | operator | the same fixture at `(6, 0, 5)` — `n - k` ≥ `volumeThreshold` | a `/loop` tick runs | the **volume** test fires and the row records trigger `volume`; the same fixture family therefore exercises both sides of the threshold and the test does not depend on which side the repository happens to be on |
| AT-C2 | operator | 5 or more un-consolidated LEARNINGS and `cadenceHours` **not** elapsed | a tick runs | the pass runs with trigger `volume` |
| AT-C3 | operator | fewer than `volumeThreshold` un-consolidated and `cadenceHours` not elapsed | a tick runs | terminal `skipped-cadence`; **no** log row is appended; no LEARNINGS body was read; no `passId` minted; no git call made |
| AT-C4 | operator | `cadenceHours` not elapsed by any measure | `/pdlc:consolidate-learnings` is invoked directly | the pass runs with trigger `manual` — the manual entry is never gated by cadence |
| AT-C5 | operator | a log whose rows in file order are: a `promoted` row dated D1, then a **later** `refused` row dated D2 (D2 > D1) — the `refused` row is the last row in the file | a tick evaluates the cadence test | the datum is **D1**, the earlier `promoted` row's date; the `refused` row is skipped even though it is the most recent row. (`refused` is not one of §2.3's four datum statuses, so the ordering is what falsifies an implementation that takes the last row unconditionally) |
| AT-C6 | operator | a log already carrying a row with `passId` `{today}-1` | a second pass mints its id | the new `passId` is `{today}-2` |
| AT-C7 | operator | a log whose newest rows all carry a **previous** date — e.g. `{today-1}-3` — and no row for `{today}`, one of those rows being unparseable | a pass mints its id | the new `passId` is `{today}-1`: the counter restarts per date rather than continuing the previous date's `n`, and the unparseable row contributes no `m` |
| AT-C8 | operator | one fixed corpus and one fixed configuration, run twice — once where the volume test fires (trigger `volume`) and once where only the cadence test fires (trigger `cadence`) | both passes derive their promotions | the two promotion sets are **set-equal** by `(failure-mode-id, action)`, and the AC-2.3 bar's evidence is identical in both reports. NFR-3 is comparative: the trigger decides whether a pass runs, never what clears the bar, so a trigger-sensitive promotion set is the failure this test exists to catch |

### 13.2 The consumed predicate and the corpus (§3)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-P1 | operator | a LEARNINGS under `docs/completed/{feature}/` | the corpus is enumerated | it is in the corpus; a LEARNINGS under `docs/discarded/{feature}/` is **not** |
| AT-P2 | operator | a basename appearing in the log **outside** any `<!-- pdlc:consumed -->` block and after the first such marker — e.g. in an `artifact` field | the predicate runs | that file is **un-consolidated**; the stray occurrence marks nothing |
| AT-P3 | operator | a log with no `<!-- pdlc:consumed` marker at all | the predicate runs | the whole file is legacy region; a basename appearing anywhere in it is consolidated |
| AT-P4 | operator | an absent log file | the predicate runs | every enumerated basename is un-consolidated; no error |
| AT-P5 | operator | an opening `<!-- pdlc:consumed {id} -->` with no closing marker | the predicate runs | the unterminated block extends to end of file and its basenames count as consumed |
| AT-P6 | operator | an empty un-consolidated set | a pass runs | the consumed pair is still appended, **empty**, before any other record |
| AT-P7 | operator | `pdlc/hooks/scripts/nudge-consolidation.sh` after this feature | the hook runs | its predicate is the §3.2 two-region test and its glob includes `docs/completed/*/` — the same corpus and predicate the pass uses |

### 13.3 The marker (§4)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-M1 | operator | a marker present, younger than `staleLockMinutes` | a second pass starts | terminal `refused`, reason `consolidation-in-progress`, naming the held `passId` and timestamp; **no** consumed pair; **no** commit; one log row is still written |
| AT-M2 | operator | a marker older than `staleLockMinutes` | a pass starts | the marker is reclaimed, `reclaimed-stale-lock` records the abandoned `passId`, and the pass proceeds |
| AT-M3 | operator | a truncated or unparseable marker file | a pass starts | it is reclaimed (not refused), with the abandoned id reported `unknown` |
| AT-M4 | operator | a pass that terminates `failed` at step 8 | the pass ends | the marker is released, the terminal row is written, and the consumed pair (appended at step 7) is present |
| AT-M5 | maintainer | the repository at HEAD | `.gitignore` is read | it carries a pattern matching `docs/_decisions/.consolidation-lock`, and that path appears in no pathspec of any pass |

### 13.4 Routing, writes and the commit (§5)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-R1 | operator | a promotion targeting `pdlc/hooks/scripts/nudge-consolidation.sh` | routing runs | it takes the **PR** route — the predicate is set-equal to `MERGE_GUARD_DEFAULTS`, not a subset |
| AT-R2 | operator | a promotion targeting `docs/_constraints/DOMAIN-CONSTRAINTS.md` | routing runs | it is appended in the invoking tree and is inside the §5.4 commit |
| AT-R3 | operator | an invoking tree on a `feat-*` branch with a partially staged index | a pass runs to a terminal outcome | HEAD and branch are identical before and after; the commit contains **exactly** the §5.4 pathspec; the pre-staged files are not swept in |
| AT-R4 | operator | git refuses the commit after the lock retries | the pass ends | the terminal status is unchanged, `writes-uncommitted` is recorded, and the writes remain correct on disk |
| AT-R5 | operator | a pass whose working tree already matches (nothing to stage) | the commit runs | no failure and no `writes-uncommitted` — the empty stage is a return, not a warning |

### 13.5 The PR route and idempotence (§6)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-Q1 | operator | `pluginRepository` resolving to the current repository | a guard-set promotion is made | the edit is committed in a separate clone under a temporary directory cut from the fetched default branch; the invoking tree sees no branch operation |
| AT-Q2 | operator | three promotions in one pass sharing one PR | the PR is opened | there are three commits, each with a distinct `PDLC-PROMOTION-ID: {id}:{action}`, and `PDLC-CONSOLIDATION-PROMOTIONS` is **set-equal** to those three pairs |
| AT-Q3 | operator | a proposal whose `(id, action)` pair is on an **open** PR | the pass runs | nothing is opened; `duplicate-suppressed` names the pair and the PR in `suppressed-by:`; `pr:` stays empty; that PR is not amended |
| AT-Q4 | operator | the same pair on a **closed-unmerged** PR | the pass runs | the proposal is re-opened as a new PR — a rejected proposal is re-proposable |
| AT-Q5 | operator | a merged `promote` PR for an id, and that promotion now `ineffective` | the pass proposes a remediation | the `revise` or `retire` proposal is **not** suppressed by the merged `promote` |
| AT-Q6 | operator | the remote head branch `consolidation/{passId}` already exists | the PR is attempted | reason code `branch-exists`, the fallback proposal file carries the full diff, and the existing branch and any PR for it are named |
| AT-Q7 | maintainer | any code path of the pass | the source is inspected | no merge or enable-auto-merge API call exists, on any path, for any PR including its own |

### 13.6 Credential (§7)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-K1 | operator | no `credentialEnv` variable and working local `gh` auth | a pass runs | the row records `credential: local-gh` and the PR route is attempted |
| AT-K2 | operator | neither a credential variable nor `gh` auth | a pass runs | `credential: absent`, reason `credential-unavailable`, the §6.3 fallback fires, the promotion appears under the `degraded` route, and the pass does **not** halt |
| AT-K3 | operator | a pass that promoted nothing else and degraded its only promotion | the pass ends | terminal `no-op` — never a bare `promoted` |
| AT-K4 | operator | a credential present but rejected by the repository | a pass runs | `credential: present (redacted)` **and** reason `credential-unavailable` — the two fields are not collapsed |
| AT-K5 | maintainer | any pass on any path | every artifact and the report body are searched | the credential value appears in none of them, and the row carries exactly one `credential:` value from the closed set |

### 13.7 Falsifiability (§8)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-F1 | operator | two passes deriving a promotion for the same `phase` and `artifact` from **different** consumed sets and different `symptom` wording | the ids are compared | they are identical — `symptom` and the consumed set are not inputs |
| AT-F2 | operator | a remedy spanning two authored files | proposals are derived | there are **two** proposals, two ids, two commits, two effectiveness rows — sharing one PR is permitted |
| AT-F3 | operator | an edit to `pdlc/workflows/orchestrate-dev.js` plus its rebuilt `pdlc/workflows/dist/` bundles | proposals are derived | **one** proposal, `artifact` being the source file; no generated path mints an id |
| AT-F4 | operator | an edit to a `pdlc/workflows/__tests__/fixtures/` file whose path contains `dist/` | proposals are derived | it is authored and **does** mint an id |
| AT-F5 | operator | prior passes recording N distinct `failure-mode-id`s, two of them sharing an id | a pass reports | the table has exactly one row per distinct id, none missing and none for a promotion never made |
| AT-F6 | operator | a consumed LEARNINGS naming an id | the verdict is computed | `recurred` |
| AT-F7 | operator | no consumed LEARNINGS naming the id, and one whose `Phases exercised` (or the §2 mapping) includes the promotion's `phase` | the verdict is computed | `prevented` |
| AT-F8 | operator | no consumed LEARNINGS decided to have exercised that phase | the verdict is computed | `insufficient-evidence` — never a guessed `prevented` |
| AT-F9 | operator | a promotion `recurred` on two consecutive counted passes, with an `insufficient-evidence` pass and an empty-consumed-set pass interleaved | the pass runs | the streak is unbroken — neither interleaved pass counts — and the promotion is flagged `ineffective` |
| AT-F10 | operator | an `ineffective` promotion whose `revise` is already on an open PR | the remediation is chosen | `retirement` is proposed and the report field names `retirement` |
| AT-F11 | operator | an `ineffective` promotion whose `retire` is already on an open or merged PR | the pass runs | **nothing** is proposed; `duplicate-suppressed` is recorded against that PR; the field names `retirement` |
| AT-F12 | operator | a merged revision for an id | the next passes run | that promotion's `ineffective` streak is zero — two fresh `recurred` counted passes are required to re-flag it |
| AT-F13 | operator | a promotion at `insufficient-evidence` for `unmeasurablePasses` consecutive evaluated passes, with a duplicate-suppressed `no-op` among them | the pass reports | that `no-op` **counted** as evaluated; the promotion is `unmeasurable` |
| AT-F14 | operator | an ordinary `promote` with no remediation | the pass reports | the `revision`/`retirement` field is **absent**, not empty-valued |

### 13.8 Advisory corpus (§9)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-A1 | operator | `docs/_queue/ESCALATIONS.md` absent — the state at HEAD | a pass runs | reason `no-advisory-corpus`; **no** seam proposal of any kind; the rest of the pass proceeds normally |
| AT-A2 | operator | the file present with zero entries | a pass runs | reason `advisory-corpus-empty`; no over-escalation candidate and no widening proposal |
| AT-A3 | operator | a stock repo with the tier never run | a pass runs | it does **not** propose widening all five `ADVISORY_SEAMS` |
| AT-A4 | operator | a corpus where seam A escalated across two distinct features and strictly more often than every other seam | a pass runs | A is surfaced as an over-escalation candidate |
| AT-A5 | operator | two seams tied on the highest total | a pass runs | no over-escalation candidate; the tie is reported |
| AT-A6 | operator | a non-empty corpus in which seam B has escalations from no feature and another seam has some | a pass runs | a widening for B is proposed, never enacted; a `pdlc/workflows/` default routes as a PR, a consumer-config value is reported as an operator action |
| AT-A7 | operator | an entry whose `Feature` row is missing | the corpus is counted | that entry is skipped with a parse notice; no count is attributed to a guessed key; the read does not abort |

### 13.9 Reporting and configuration (§10, §11)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-L1 | operator | a pass that opened a PR and suppressed another proposal | the row is read | `pr:` carries this pass's PR and `suppressed-by:` carries the suppressed pair — both present, neither merged into the other |
| AT-L2 | operator | a pass that opened nothing and suppressed everything | the row is read | `pr:` is **empty**; the evidence is in `suppressed-by:`; terminal `no-op` |
| AT-L3 | operator | any pass other than `skipped-cadence` | the pass ends | exactly one log row is appended and one report body returned; no earlier record was edited in place |
| AT-L4 | operator | a report with no promotions | the body is read | the promotions section is present and explicitly empty — omission is a failure |
| AT-L5 | maintainer | every enumerated value the report and row emit | they are compared to vocabularies §1 at `Version` 1.4 | the two sets are **equal** in both directions — no value without a row, no row unused |
| AT-N1 | operator | `.claude/pdlc.config.json` absent | a pass runs | every `consolidation` key is at its default; the pass does not terminate |
| AT-N2 | operator | a `consolidation` section with one key of the wrong type | a pass runs | that key falls back and is named in the report; every other configured key keeps its value |
| AT-N3 | operator | `consolidation` present but not an object | a pass runs | every key defaults, and the report distinguishes this from an absent section |
| AT-N4 | operator | `pluginRepository` set to a name that does not resolve | a pass runs | reason `repository-unresolved` with the configured value recorded verbatim — **not** a silent fallback to the current repository |

## 14. Obligations and open questions

### 14.1 Obligations this FSPEC hands to TSPEC

None of these is a behavioural question — each is a mechanism choice this layer deliberately does not
make (DC-09, DC-10: the layer that owns the decision states it, rather than leaving it to be
invented downstream).

| # | Obligation | Constrained by |
|---|---|---|
| T-01 | Function names, seam signatures and module placement for the pass | §2.2's step sequence is the behavioural contract; the decomposition is TSPEC's |
| T-02 | The bundle's row in `pdlc/workflows/dist/distribution-manifest.json`, and its entry in `build-runtime.mjs` | REQ §5: the pass ships as a workflow script beside the skill, in the `orchestrate-queue` shape |
| T-03 | How the §6.1 temporary clone is created, located and removed | AC-3.8: no branch operation in the invoking tree; the clone is cut from the fetched default branch |
| T-04 | The injected seams for file IO, git and the PR API | every one must be `await`ed (CLAUDE.md, runtime-adapter contract) |
| T-05 | The `resolveAdvisoryRung` call site and its `rungState` threading | §2.6: reuse, never restate, the two constants |
| T-06 | The parse implementation for `ESCALATIONS.md` entries | §9.2: read the metadata table rows, never the heading |
| T-07 | The `.gitignore` pattern's exact text | §4.1: root-relative, contains a separator, never slash-free or `**/`-prefixed |
| T-08 | Whether the corpus enumeration is shared code with `nudge-consolidation.sh` or two implementations held equal by test | §3.1 requires one corpus and one predicate; it does not require one implementation |

### 14.2 Open questions — decided here, recorded for review

| # | Question | Decision | Where |
|---|---|---|---|
| O-C1 | A pass that dies at step 8 (`advisory-model-unresolved`) has already frozen its corpus as consumed without reading a body. Those files are then permanently consolidated. | **Accepted, not repaired.** The ordering is forced by vocabularies §3(a), and no §1 field exists in which a `failed` pass could record "re-consume these". Inventing a recovery channel would add an unlisted record type and breach REQ §4b. | §2.6 |
| O-C2 | Two files sharing a basename under different directories collapse to one set member. | **Reported, not repaired.** Repair needs a key the shipped predicate does not have. Newly reachable now that `docs/completed/*/` is in the corpus. | §3.4 |
| O-C3 | The marker take is read-then-write, so two passes can both observe "absent". | **Stated, bounded.** Blast radius is closed by two independent properties: every log write is a whole-record append, and NFR-4 keys on the PR trailer rather than the log. An atomic create-exclusive take is TSPEC's if the runtime offers one. | §4.5 |
| O-C4 | A promotion whose invoking branch is abandoned loses its effectiveness record and re-enters the table as if first made. | **Accepted loss**, stated in the REQ and restated here rather than closed. | §5.5 |
| O-C5 | `ESCALATIONS.md` cannot distinguish a seam that never escalates because it never runs from one that never escalates because it always succeeds. | **Honest limit**, which is why §9.5's output is a candidate for human judgment. Resolution rates are D-CONS-06. | §9.6 |

None of the five is a blocking gap: each names what is observed, what is accepted, and — where one
exists — the deferral that carries it.

### 14.3 Questions this FSPEC raises for the operator, not for a downstream layer

| # | Question | Why it is the operator's |
|---|---|---|
| O-P1 | Whether to configure repository-side branch protection on the plugin repo | BL-05; §6.5's three controls hold without it, but the repo-side belt is not a code deliverable |
| O-P2 | Whether to enable the advisory tier so BL-01a's corpus can exist | §9.3 ships and is testable with the tier off; enabling it is a config decision with its own cost |
| O-P3 | Which branch a pass is invoked on, given §5.5's abandonment consequence | the pass never changes the branch (AC-3.8), so the choice is entirely the operator's |

### 14.4 Nothing here is a defect of an upstream document

Every question above was raised and settled by the REQ, or is a mechanism choice the REQ explicitly
delegated. This FSPEC records **no** erratum against `REQ-pdlc-consolidation-agent` v2.0, against
`docs/_constraints/pdlc-consolidation-vocabularies.md` at `Version` 1.4, or against
`docs/_constraints/pdlc-advisory-corpus-baseline.md` at `Version` 1.0.

## 15. Traceability

### 15.1 REQ criterion → FSPEC section → acceptance test

Every acceptance criterion of the REQ appears exactly once as a row. No criterion is unmapped, and no
row names a criterion the REQ does not carry.

| REQ | FSPEC | AT |
|---|---|---|
| AC-1.1 | §2.2, §2.3, §3.2 | AT-C1, AT-C3, AT-C4, AT-C5 |
| AC-1.2 | §2.3, §3.1 | AT-C2 |
| AC-1.3 | §4.1, §4.2, §4.3, §4.4 | AT-M1, AT-M2, AT-M3, AT-M5 |
| AC-1.4 | §5.3, §8.5, §8.7, §12.1 | AT-K3, AT-L2, AT-F13 |
| AC-1.5 | §2.6, §10.3 | AT-L5 (the `rung:` field) |
| AC-1.6 | §2.6, §12.1 S-11 | AT-M4 |
| AC-2.1 | §5.2, §5.4 | AT-R2 |
| AC-2.2 | §5.2, §5.4 | AT-R2 |
| AC-2.3 | §5.2, §9.4 | AT-A4 |
| AC-2.4 | §5.2, §10.3 | AT-L3 |
| AC-3.1 | §5.1, §6 | AT-R1 |
| AC-3.2 | §6.2 | AT-Q2 |
| AC-3.3 | §6.2, §8.2 | AT-Q2, AT-F2 |
| AC-3.4 | §10.2, §10.3 | AT-L1 |
| AC-3.5 | §6.3, §5.3 | AT-Q6, AT-K2 |
| AC-3.6 | §6.2 | AT-Q1 |
| AC-3.7 | §6.5 | AT-Q7 |
| AC-3.8 | §6.1, §12.4 | AT-Q1, AT-R3 |
| AC-3.8b | §5.4, §5.5 | AT-R3, AT-R4, AT-R5 |
| AC-4.1 | §7.1 | AT-K5 |
| AC-4.2 | §7.2, §7.4, §10.3 | AT-K1, AT-K4, AT-K5 |
| AC-4.3 | §7.3, §6.3 | AT-K2, AT-K3 |
| AC-4.4 | §7.2 | AT-K1 |
| AC-5.1 | §8.1, §8.2 | AT-F1, AT-F2, AT-F3, AT-F4 |
| AC-5.2 | §8.3, §8.4 | AT-F5, AT-F6, AT-F7, AT-F8 |
| AC-5.3 | §8.5 | AT-F9, AT-F10, AT-F11, AT-F12, AT-F14 |
| AC-5.4 | §8.6, §5.3 | AT-F10, AT-Q5 |
| AC-5.5 | §8.7 | AT-F13 |
| AC-6.1 | §9.1, §9.2, §9.3 | AT-A1, AT-A2, AT-A7 |
| AC-6.2 | §9.4 | AT-A4, AT-A5 |
| AC-6.3 | §9.5 | AT-A3, AT-A6 |
| AC-7.1 | §10.3, §10.4 | AT-L4, AT-L5 |
| AC-7.2 | §10.1, §10.3, §4.4 | AT-C3, AT-L1, AT-L2, AT-L3 |
| NFR-1 | §5.1, §6.5, §12.4 | AT-Q7 |
| NFR-2 | §7.4, §10.5 | AT-K5 |
| NFR-3 | §5.2 | AT-C2 (the bar is unchanged under a volume trigger) |
| NFR-3a | §10.3 | AT-C1, AT-C2, AT-C4 |
| NFR-4 | §6.4, §8.2 | AT-Q3, AT-Q4, AT-Q5, AT-F1 |
| NFR-5 | §3.3, §12.4 | AT-P6, AT-P2 |
| §4a config | §11 | AT-N1, AT-N2, AT-N3, AT-N4 |
| §4b vocabularies | §15.2 | AT-L5 |

### 15.2 Vocabularies §1 rows → where this FSPEC uses each

REQ §4b's set-equality obligation binds this layer first: every §1 row is used here, and no value is
used here without a §1 row. AT-L5 asserts the equality in both directions at `Version` 1.4.

| §1 row | Used at |
|---|---|
| `promoted` | §12.1 S-02 |
| `promoted-degraded` | §7.3, §12.1 S-07 |
| `no-op` | §7.3, §12.1 S-05/S-06/S-08 |
| `skipped-cadence` | §2.3, §2.4, §10.1, §12.1 S-01 |
| `refused` | §4.3, §4.4, §12.1 S-09 |
| `failed` | §2.6, §12.1 S-11 |
| `consolidation-in-progress` | §4.2, §12.1 S-09 |
| `reclaimed-stale-lock` | §4.2, §12.1 S-10 |
| `advisory-model-unresolved` | §2.6, §12.1 S-11 |
| `no-cadence-datum` | §2.3, §12.1 S-03 |
| `writes-uncommitted` | §5.4, §12.1 S-12 |
| `credential-unavailable` | §6.3, §7.2, §7.3 |
| `repository-unresolved` | §6.3, §11.2 |
| `api-failure` | §6.3 |
| `branch-exists` | §6.3 |
| `duplicate-suppressed` | §6.4, §8.5 row 1, §12.1 S-06 |
| `no-advisory-corpus` | §9.3, §12.1 S-13 |
| `advisory-corpus-empty` | §9.3, §12.1 S-14 |
| `cadence` / `volume` / `manual` | §2.1, §2.3, §10.3 |
| constraints / decisions / PR / `degraded` | §5.1, §7.3, §10.4 |
| `prevented` / `recurred` / `insufficient-evidence` | §8.3, §12.3 V-01 |
| `ineffective` / `unmeasurable` | §8.5, §8.7, §12.3 V-02/V-03 |
| `promote` / `revise` / `retire` | §8.1, §8.2, §6.4 |
| `revision` / `retirement` | §8.5, §12.3 V-02/V-04 |
| `pr:` | §10.3, §6.4 |
| `suppressed-by:` | §10.3, §6.4 |
| `credential:` (`present (redacted)` / `absent` / `local-gh`) | §7.2, §10.3 |
| the 13-member phase catalogue | §8.1, §8.3 |

### 15.3 Files this feature edits or creates

| Path | Change | Section |
|---|---|---|
| `pdlc/hooks/scripts/nudge-consolidation.sh` | predicate at `:41` scoped to the two regions; corpus glob at `:28` widened to include `docs/completed/*/` | §3.1, §3.2 |
| `pdlc/skills/consolidate-learnings/SKILL.md` | `:35`'s `Date Completed` boundary replaced by the §3.2 predicate | §3.2 |
| `pdlc/skills/harvest-learnings/SKILL.md` | a `Phases exercised` row added to the metadata table (`:70-78`); a `failure-mode-id` line added to the §5 Open Items convention | §8.3, §8.4 |
| `.gitignore` | one entry for `docs/_decisions/.consolidation-lock` | §4.1 |
| `pdlc/workflows/build-runtime.mjs` and `pdlc/workflows/dist/distribution-manifest.json` | the new bundle's build entry and manifest row | §14.1 T-02 |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | authored and owned by this feature (§1–§4 entire), kept at `Version` 1.4 | REQ §4b |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | authored and owned by this feature (§1–§4 entire), kept at `Version` 1.0 | REQ §4b |

Every path above is verified present at HEAD except the new bundle artifacts, which this feature
creates.

## 16. Linked Requirements

The functional units of this document are the nine `FSPEC-CONS-0N` specs of §2–§10. This section is
the linkage roll-up: which REQ requirement each one discharges, and which user story that requirement
serves. §15.1 is the finer-grained view (criterion → section → acceptance test); this one is the
coarse view a reviewer needs to check that no requirement is unclaimed and no spec is orphaned.

| FSPEC unit | Section | Linked requirement(s) | Linked NFRs | User stories |
|---|---|---|---|---|
| FSPEC-CONS-01 — Tick evaluation and pass lifecycle | §2 | REQ-CONS-01 (AC-1.1, AC-1.2, AC-1.5, AC-1.6) | NFR-3, NFR-3a | US-03 |
| FSPEC-CONS-02 — Consumed predicate and LEARNINGS corpus | §3 | REQ-CONS-01 (AC-1.1, AC-1.2), REQ-CONS-02 (AC-2.4) | NFR-5 | US-03 |
| FSPEC-CONS-03 — The in-progress marker | §4 | REQ-CONS-01 (AC-1.3), REQ-CONS-07 (AC-7.2, via §4.4) | — | US-03 |
| FSPEC-CONS-04 — Promotion routing and consuming-repo writes | §5 | REQ-CONS-02 (AC-2.1, AC-2.2, AC-2.3, AC-2.4), REQ-CONS-03 (AC-3.1, AC-3.5, AC-3.8b) | NFR-1, NFR-3 | US-01, US-02 |
| FSPEC-CONS-05 — The pull-request route | §6 | REQ-CONS-03 (AC-3.1 – AC-3.8) | NFR-1, NFR-4 | US-01, US-02 |
| FSPEC-CONS-06 — Credential handling | §7 | REQ-CONS-04 (AC-4.1 – AC-4.4) | NFR-2 | US-02 |
| FSPEC-CONS-07 — Falsifiability | §8 | REQ-CONS-05 (AC-5.1 – AC-5.5), REQ-CONS-01 (AC-1.4) | NFR-4 | US-04, US-05 |
| FSPEC-CONS-08 — Advisory-corpus input | §9 | REQ-CONS-06 (AC-6.1, AC-6.2, AC-6.3) | — | US-04, US-05 |
| FSPEC-CONS-09 — Reporting and the log record grammar | §10 | REQ-CONS-07 (AC-7.1, AC-7.2), REQ-CONS-01 (AC-1.5) | NFR-3a | US-03, US-04 |
| Configuration parse behaviour | §11 | REQ §4a (the config contract) | — | US-03 |

**Both directions hold.** Every REQ requirement `REQ-CONS-01` … `REQ-CONS-07` appears at least once
above, and every non-functional requirement `NFR-1` … `NFR-5` appears at least once; conversely no
row names a requirement the REQ does not carry (REQ §3 defines exactly `REQ-CONS-01` – `REQ-CONS-07`;
REQ §4 defines exactly `NFR-1` – `NFR-5`, `NFR-3a` included). The criterion-level statement of the
same property — every acceptance criterion mapped exactly once — is §15.1, and the vocabulary-level
statement is §15.2.

**Two upstream constraint files are inputs, not requirements**, and so carry no row here: they are
cited by pinned `Version` in §1 and used throughout (`docs/_constraints/pdlc-consolidation-vocabularies.md`
at 1.4, `docs/_constraints/pdlc-advisory-corpus-baseline.md` at 1.0). Project-level domain
constraints DC-01, DC-05 and DC-09 (`docs/_constraints/DOMAIN-CONSTRAINTS.md`) bind this document's
form rather than its behaviour: DC-09 keeps oracle mechanics out (§1 Altitude), DC-05 obliges an
acceptance test per named branch (§13), DC-01 obliges an absent/malformed/truncated arm per parsed
input (§3.4, §9.3, §10.4, §11).

## 17. Behavioral Flow

One invocation is one pass through the fixed 16-step sequence of §2.2. This section states that
sequence as a flow with its decision points made explicit — every branch that can end the pass early,
what each branch has already written when it ends, and where the detailed specification of the step
lives. Nothing here adds behaviour; §2.2 is the normative ordering and this is its decision view.

### 17.1 The main flow and its decision points

| Step | Decision asked | Branch taken when the answer is "no" / the exceptional arm | Detail |
|---|---|---|---|
| 1 | — (resolve configuration) | none — every key falls back independently, a degraded key is reported, never fatal | §11 |
| 2 | — (enumerate corpus basenames, compute the un-consolidated set) | none | §3.1, §3.2 |
| 3 | Does `\|un-consolidated\| >= volumeThreshold`? | fall through to step 4 | §2.3 |
| 4 | Has `cadenceHours` elapsed since the datum (empty datum set counts as elapsed)? | **terminate `skipped-cadence`** — no log row, no marker, no git call | §2.3, §2.4 |
| 5 | — (mint `passId` from the log) | none — an unparseable row contributes no `m` and is skipped | §2.5 |
| 6 | Is the marker free, or held-and-stale? | **terminate `refused`** (`consolidation-in-progress`) when held and fresh — writes its row, no consumed pair, no commit | §4.2, §4.4 |
| 7 | — (append the consumed pair, complete and in one append, even when empty) | none — unconditional for every marker-holding pass | §3.3 |
| 8 | Does either model rung resolve? | **terminate `failed`** (`advisory-model-unresolved`) — consumed pair already written at step 7, marker released, row appended | §2.6 |
| 9 | — (read consumed bodies, cluster, apply the AC-2.3 bar) | none — a cluster below the bar simply produces no proposal | §5.2 |
| 10 | Is `ESCALATIONS.md` present, and does it carry entries? | absent ⇒ `no-advisory-corpus`; present-but-empty ⇒ `advisory-corpus-empty`; both compose with the run's own status rather than terminating | §9.3 |
| 11 | — (compute the effectiveness table over prior passes) | none — emitted even by a `no-op` pass | §8.3 |
| 12 | Is a proposal a duplicate of an open-or-merged proposal for the same `(id, action)`? | duplicate ⇒ suppressed, `suppressed-by:` populated, no PR opened and no fallback fired | §6.4 |
| 13 | Does the proposal's target path fall in the guard set? | in-guard-set ⇒ the PR route (§6); otherwise the direct consuming-repo write (§5.4) | §5.1 |
| 13a | Can the PR be opened? | cannot ⇒ degrade to the proposal file with its failure class recorded in both the file and the row | §6.3, §5.3 |
| 14 | — (write consuming-repo artifacts, append the terminal row) | terminal status resolved here: `promoted` / `promoted-degraded` / `no-op` / `failed` | §10.2, §10.3 |
| 15 | Does git accept the AC-3.8b pathspec commit? | refusal ⇒ reason code `writes-uncommitted` added; the status itself is **unchanged**, writes stay in the working tree | §5.4, §12.1 S-12 |
| 16 | — (release the marker) | none — every marker-holding terminal arm releases, `failed` included | §4.3 |

### 17.2 The three shapes a pass can have

Read down the table above and exactly three shapes exist, distinguished by how far the pass got:

1. **Evaluated but not run** — steps 1–4 only. Terminates `skipped-cadence`. Writes nothing at all:
   no `passId`, no marker, no log row, no git call (§2.4). This is the common shape under `/loop`.
2. **Marker refused** — steps 1–6. Terminates `refused`, writes one log row (so the refusal is
   evidence, AC-7.2) and nothing else — no consumed pair, no commit (§4.4, §12.1 S-09).
3. **Marker held** — steps 1–16, terminating at step 14 with one of `promoted`,
   `promoted-degraded`, `no-op`, `failed`. Always: exactly one consumed pair (step 7), exactly one
   terminal log row, one release, and one commit attempt whose refusal degrades the record but not
   the status.

The shape determines what a later pass can observe, which is why it — not the status alone — is what
§12.1's table is organised around.

### 17.3 Where the flow does *not* branch

Four points where a branch might be expected and deliberately does not exist, each an invariant §12.4
restates:

- **No branch on the invoking tree's git state.** The pass never checks out, creates, or switches a
  branch in the invoking tree (AC-3.8, §6.1); there is therefore no "dirty tree" arm.
- **No branch that merges.** No step calls a merge API, under any status or configuration (§6.5).
- **No branch that re-reads a consumed file.** Step 7's pair is written once and is final for the
  corpus it names; there is no re-consumption arm (§3.3, and the loss this forces is raised as O-C1
  in §14, not routed around here).
- **No branch that skips the effectiveness table.** A `no-op` pass emits every standing verdict and
  state unchanged (AC-1.4, §12.3) — reporting is not conditional on having promoted anything.

## 18. Business Rules

The decidable rules the flow of §17 evaluates, gathered in one place and stated so each is
independently testable. Every rule names the section that specifies it and the acceptance test that
falsifies it; none of them is new here.

### 18.1 Running, and how often

| # | Rule | Section | AT |
|---|---|---|---|
| BR-01 | A tick runs when the un-consolidated set has **at least** `consolidation.volumeThreshold` members (default `5`), trigger `volume`. | §2.3 | AT-C2 |
| BR-02 | Otherwise a tick runs when **at least** `consolidation.cadenceHours` (default `168`) have elapsed since the datum, trigger `cadence`. | §2.3 | AT-C1 |
| BR-03 | The datum is the `date` of the most recent log row whose status is one of `promoted`, `promoted-degraded`, `no-op`, `failed`. A `refused` row is skipped, and a `skipped-cadence` tick wrote no row — so ticking can never advance the datum. | §2.3 | AT-C5 |
| BR-04 | An empty datum set counts as **elapsed**: the pass runs, trigger `cadence`, and its row carries `no-cadence-datum`. | §2.3 | AT-C1 |
| BR-05 | A direct invocation skips BR-01 and BR-02 entirely and runs unconditionally, trigger `manual`. | §2.1 | AT-C4 |
| BR-06 | A `skipped-cadence` tick reads only configuration, corpus basenames and the log. It writes nothing and makes no git call. | §2.4 | AT-C3 |

### 18.2 What counts as evidence

| # | Rule | Section | AT |
|---|---|---|---|
| BR-07 | The corpus is exactly `docs/*/LEARNINGS-*.md` ∪ `docs/completed/*/LEARNINGS-*.md`. `docs/discarded/` is excluded. | §3.1 | AT-C2, AT-P1 |
| BR-08 | Enumeration is by basename; no LEARNINGS body is opened before step 9. | §3.1, §2.2 | AT-C3 |
| BR-09 | A LEARNINGS file is *consumed* iff its basename appears in the log's consumed region or in the legacy region — one predicate, shared verbatim by the pass, `nudge-consolidation.sh` and `consolidate-learnings/SKILL.md`. | §3.2 | AT-P2, AT-P3, AT-P7 |
| BR-10 | The pass never modifies a LEARNINGS file it consumed (NFR-5). | §3.3, §12.4 | AT-P2, AT-P6 (§15.1's NFR-5 row) |
| BR-11 | Consumption is recorded as one complete `<!-- pdlc:consumed {passId} -->` pair, appended in a single write, **even when the consumed set is empty**. | §3.3 | AT-P6 |
| BR-12 | Only a marker-holding pass writes a consumed pair; a `refused` pass writes none. | §4.4 | AT-M1 |

### 18.3 Exclusivity

| # | Rule | Section | AT |
|---|---|---|---|
| BR-13 | At most one pass holds `docs/_decisions/.consolidation-lock` at a time; a second pass observing it fresh terminates `refused` with `consolidation-in-progress`. | §4.2 | AT-M1 |
| BR-14 | A marker older than `consolidation.staleLockMinutes` (default `60`) is reclaimed, and the reclaiming pass records `reclaimed-stale-lock` alongside its own status. | §4.2 | AT-M2, AT-M3 |
| BR-15 | Every marker-holding terminal arm releases the marker — `failed` included. | §4.3 | AT-M4 |
| BR-16 | The marker file is never committed (it is git-ignored, and it is outside the AC-3.8b pathspec). | §4.1, §5.4 | AT-M5 |

### 18.4 Promotion and routing

| # | Rule | Section | AT |
|---|---|---|---|
| BR-17 | The pattern-vs-coincidence bar is unchanged: recurrence across ≥2 unrelated features, **or** a single occurrence stating an obviously generalising standing invariant. The trigger decides whether a pass runs, never what clears the bar (NFR-3). | §5.2 | AT-A4, AT-C2 |
| BR-18 | A proposal has exactly one canonical repository-root-relative target path — never a glob, never a directory — and that path alone decides the route. | §5.1 | AT-R1 |
| BR-19 | A target path under any member of `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53` — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`) takes the PR route. No code path in the pass writes such a path in any tree (NFR-1). | §5.1, §6 | AT-R1, AT-Q1 |
| BR-20 | `DOMAIN-CONSTRAINTS.md` and `DECISIONS-{topic}.md` targets are applied directly to the consuming repo; any other non-guard path is written to the proposal file and **never applied**. | §5.1, §5.2, §5.3 | AT-R2, AT-Q6 |
| BR-21 | All consuming-repo writes of one pass land in **one** commit, pathspec-scoped per AC-3.8b, never `-a`. | §5.4 | AT-R2, AT-R3, AT-R5 |
| BR-22 | The invoking tree's HEAD and branch are never changed, and no branch operation is performed in it (AC-3.8). | §6.1, §12.4 | AT-Q1, AT-R3 |

### 18.5 The pull-request route

| # | Rule | Section | AT |
|---|---|---|---|
| BR-23 | The PR is opened against `consolidation.pluginRepository`, defaulting to `null` ⇒ the current repository. A non-null value that does not resolve is `repository-unresolved` and degrades through §6.3 — it is **not** a parse fallback. | §11.2, §6.3 | AT-N4 |
| BR-24 | The branch is `consolidation/{passId}`; the body carries the `PDLC-CONSOLIDATION-PASS` trailer and each commit carries `PDLC-PROMOTION-ID`. | §6.2 | AT-Q2 |
| BR-25 | The suppression key is the **pair** `(failure-mode-id, action)`, read from the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs observed `open` or `merged`. A `closed`-unmerged PR is not in the key set. | §6.4 | AT-Q3, AT-Q4 |
| BR-26 | A suppressed proposal opens nothing, fires no fallback, and populates `suppressed-by:` — never `pr:`. | §6.4, §10.3 | AT-Q3, AT-L2 |
| BR-27 | An existing machine-opened PR is never extended, amended or superseded by a later pass. | §6.4 | AT-Q3 |
| BR-28 | No merge or enable-auto-merge API is called on any PR, including the pass's own, under any status or configuration. | §6.5 | AT-Q7 |

### 18.6 Credential

| # | Rule | Section | AT |
|---|---|---|---|
| BR-29 | The credential's scope is `contents:write` + `pull_requests:write` only — it grants no merge rights. | §7.1 | AT-K5 |
| BR-30 | Resolution records exactly one of three values: `present (redacted)`, `absent`, `local-gh`. | §7.2 | AT-K1, AT-K4, AT-K5 |
| BR-31 | An unavailable credential forces `credential-unavailable` and the §6.3 degradation — never a silent skip. | §7.3 | AT-K2, AT-K3 |
| BR-32 | No credential value appears in any log row, PR body, artifact, report or notification (NFR-2). | §7.4, §10.5 | AT-K5 |

### 18.7 Falsifiability and the advisory corpus

| # | Rule | Section | AT |
|---|---|---|---|
| BR-33 | Every promotion carries one `failure-mode-id`, derived deterministically, and one `action` ∈ {`promote`, `revise`, `retire`}; one promotion is one authored file. | §8.1, §8.2 | AT-F1, AT-F2, AT-F3 |
| BR-34 | Every prior promotion gets a verdict on every reporting pass: `prevented` / `recurred` / `insufficient-evidence` — a `no-op` pass restates them unchanged (AC-1.4). | §8.3, §12.3 | AT-F5, AT-F6, AT-F7, AT-F8 |
| BR-35 | `recurred` on two consecutive counted passes ⇒ state `ineffective`, and a `revision` or `retirement` proposal is emitted. | §8.5 | AT-F9, AT-F10 |
| BR-36 | `insufficient-evidence` on `consolidation.unmeasurablePasses` consecutive evaluated passes (default `3`) ⇒ state `unmeasurable`. | §8.7, §11.2 | AT-F13 |
| BR-37 | Advisory counts come only from `docs/_queue/ESCALATIONS.md`; no count is ever derived from LEARNINGS advisory prose. | §9.1, §9.2 | AT-A3, AT-A7 |
| BR-38 | An absent `ESCALATIONS.md` ⇒ `no-advisory-corpus`; present-but-empty ⇒ `advisory-corpus-empty`. Both compose with the run's own status. | §9.3 | AT-A1, AT-A2 |

### 18.8 Recording

| # | Rule | Section | AT |
|---|---|---|---|
| BR-39 | Every log write is an append of one whole record; no record is ever rewritten in place. | §10.2, §12.4 | AT-L3 |
| BR-40 | A pass that takes the marker appends exactly one terminal row; a `skipped-cadence` tick appends none. | §10.1, §10.3 | AT-C3, AT-L3 |
| BR-41 | Every terminal row carries a trigger (NFR-3a) and a `credential:` value (AC-4.2) — a `refused` row included. | §10.3 | AT-L5, AT-M1 |
| BR-42 | A git refusal at step 15 adds `writes-uncommitted` and never changes the pass's status. | §5.4, §12.1 S-12 | AT-R4 |
| BR-43 | Every status, reason code and field value written is a member of vocabularies §1 at `Version` 1.4, and every §1 row is used — set equality in both directions (REQ §4b). | §15.2 | AT-L5 |
| BR-44 | A configuration fallback is report content, never a reason code — no §1 row exists for one. | §11.3 | AT-N2, AT-N3 |

## 19. Edge Cases and Error Scenarios

Every parsed input of this feature has an absent, malformed and truncated arm (DC-01, receive side),
and every failure of an external call has a named class. This section gathers them so a reviewer can
check totality in one pass: nothing below aborts the pass without a recorded status, and no two
distinct input states are silently collapsed into one.

### 19.1 Parsed-input edge cases

| # | Input state | Behaviour | Section | AT |
|---|---|---|---|---|
| E-01 | `docs/_decisions/.consolidation-log.md` absent | both regions empty; every basename un-consolidated; datum set empty ⇒ the first pass runs on the `no-cadence-datum` branch | §3.4, §2.3 | AT-P4, AT-C1 |
| E-02 | Log present but unreadable (permissions, IO error) | treated as **empty text**, mirroring `nudge-consolidation.sh:38-39`'s `except: logtext = ""` — fail-open toward re-consumption, never toward silently skipping a corpus; NFR-4 is what then prevents a duplicate proposal | §3.4 | AT-P4 |
| E-03 | Log present with no `<!-- pdlc:consumed` marker | the whole file is legacy region — the HEAD state | §3.4 | AT-P3 |
| E-04 | Opening `<!-- pdlc:consumed {passId} -->` with no closing marker (a truncated append) | the unterminated block runs to end of file and counts as consumed — a partially flushed pair never *loses* consumption | §3.4 | AT-P5 |
| E-05 | Closing `<!-- /pdlc:consumed -->` with no opener | ignored; opens no block, moves no boundary | §3.4 | AT-P2 |
| E-06 | A basename in both regions | consolidated once — the clauses are a disjunction over a set of basenames | §3.4 | AT-P3 |
| E-07 | A basename appearing in the log outside any block (e.g. in an `artifact` field) after the first marker | **un-consolidated** — the stray occurrence marks nothing | §3.2 | AT-P2 |
| E-08 | Corpus glob matches nothing | un-consolidated set empty; volume cannot fire; a pass that runs is the AC-1.4 `no-op` with an empty consumed pair | §3.4 | AT-P6 |
| E-09 | Two LEARNINGS sharing a basename under different directories | one set member; the collision is **reported** in the AC-7.1 report, never silently resolved (repair needs a key the shipped predicate lacks — §14 O-C2) | §3.4 | AT-P1 |
| E-10 | A log row that is malformed or unparseable | contributes no `m` to the `passId` derivation and is skipped — the derivation never aborts | §2.5 | AT-C6 |
| E-11 | Marker file truncated or unparseable | **reclaimed, not refused**; the abandoned id is reported `unknown` | §4.2 | AT-M3 |
| E-12 | `ESCALATIONS.md` entry whose `Feature` row is missing | that entry is skipped with a parse notice; no count is attributed to a guessed key; the read does not abort | §9.2 | AT-A7 |
| E-13 | `.claude/pdlc.config.json` absent | every `consolidation` key defaults; the pass does not terminate | §11.1 | AT-N1 |
| E-14 | One `consolidation` key of the wrong type | that key alone falls back and is named in the report; every other configured key keeps its value | §11.2 | AT-N2 |
| E-15 | `consolidation` present but not an object | every key defaults, and the report distinguishes this (`sectionMalformed`) from an absent section | §11.3 | AT-N3 |

### 19.2 Error scenarios — external calls and contention

| # | Scenario | Terminal effect | Section | AT |
|---|---|---|---|---|
| E-16 | Marker held and fresh | `refused`, reason `consolidation-in-progress`; one log row, no consumed pair, no commit | §4.2, §4.4 | AT-M1 |
| E-17 | Marker held and stale | reclaimed; `reclaimed-stale-lock` composes with the run's own status | §4.2 | AT-M2 |
| E-18 | Two passes racing to mint the same `passId` | harmless: the loser is `refused` at step 6, and no contract keys on a refused row's id | §2.5, §4.5 | AT-C6, AT-M1 |
| E-19 | Neither model rung resolves | `failed`, reason `advisory-model-unresolved`; no promotion; consumed pair already written at step 7; marker released | §2.6 | AT-M4 |
| E-20 | Credential absent or invalid | `credential-unavailable`, `credential: absent`, §6.3 fallback fires, pass does **not** halt | §7.3, §6.3 | AT-K2 |
| E-21 | Credential present but rejected by the repository | `credential: present (redacted)` **and** `credential-unavailable` — the two fields are never collapsed | §7.2, §6.3 | AT-K4 |
| E-22 | `pluginRepository` names a repository that does not resolve | `repository-unresolved` with the configured value verbatim — never a silent fallback to the current repository | §6.3, §11.2 | AT-N4 |
| E-23 | Network or API failure, rate limiting included | `api-failure` with the API's status text; the proposal file carries the full diff | §6.3 | AT-Q6 |
| E-24 | Remote head branch `consolidation/{passId}` already exists | `branch-exists`; the fallback file names the existing branch and any PR found for it | §6.3 | AT-Q6 |
| E-25 | A proposal duplicates an open-or-merged `(id, action)` pair | **not** an error: suppressed before any PR is attempted, fires no fallback, records `duplicate-suppressed` | §6.4, §6.3 | AT-Q3 |
| E-26 | Every promotion suppressed | `no-op` with `pr:` empty and `suppressed-by:` populated | §12.1 S-06 | AT-L2 |
| E-27 | Git refuses the AC-3.8b commit after the lock retries | status unchanged; `writes-uncommitted` recorded; writes remain correct on disk | §5.4 | AT-R4 |
| E-28 | Nothing to stage at commit time | no failure and no `writes-uncommitted` — an empty stage is a return, not a warning | §5.4 | AT-R5 |
| E-29 | The invoking branch carrying the log record is later abandoned | the merged PR is what survives; §5.5 states the cost rather than compensating for it | §5.5 | AT-Q3 |
| E-30 | `ESCALATIONS.md` absent (the state at HEAD) / present-but-empty | `no-advisory-corpus` / `advisory-corpus-empty`; no seam proposal of any kind; the rest of the pass proceeds | §9.3 | AT-A1, AT-A2 |
| E-31 | Two advisory seams tied on the highest total | no over-escalation candidate; the tie is reported | §9.4 | AT-A5 |

### 19.3 The two losses this FSPEC records rather than repairs

Both are consequences of an ordering the REQ requires, and both are raised in §14 as items for the
upstream layer — neither is routed around here, because routing around them would add a record type
outside vocabularies §1 and breach REQ §4b's set-equality obligation.

| # | Loss | Why it cannot be repaired at this layer | §14 item |
|---|---|---|---|
| E-32 | A pass that dies at step 8 has already marked its corpus consolidated without reading a body — those files are permanently consolidated | AC-1.3 makes `failed` a marker-taking status and vocabularies §3(a) obliges the consumed pair before any other record; no §1 field can express "re-consume these" | O-C1 |
| E-33 | A basename collision across `docs/` and `docs/completed/` cannot be disambiguated | the shipped predicate keys on basename, deliberately, so hook and pass share one predicate (BR-09) | O-C2 |
