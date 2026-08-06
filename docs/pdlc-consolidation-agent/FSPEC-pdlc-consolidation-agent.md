# FSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 11.0 | 2026-08-06 |

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
| REQ AC-5.1 | The deterministic derivation of `failure-mode-id` from `phase` and the subject `artifact` (§8.1's `target` is a separate, non-keying field) | §8.1 |
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
| 12 | Derive proposals (promotions + §8.5 remediations); apply NFR-4 suppression (§6.4) | `failed` with **no** reason code when its advisory dispatch returns `{kind: "dispatch-error"}` (§2.6 row 4) |
| 13 | Route each proposal (§5, §6) | `failed` with **no** reason code, on the same condition |
| 14 | Write the consuming-repo artifacts and append the terminal log row (§10) | `promoted` / `promoted-degraded` / `no-op` / `failed` |
| 15 | Commit the AC-3.8b pathspec (§5.4) | — (a git refusal records `writes-uncommitted`, never changes the status) |
| 16 | Release the marker (§4.3) | — |

Step 7 precedes step 8 deliberately: the consumed pair freezes the legacy-region boundary
unconditionally (vocabularies §3(a)), so a pass that dies at step 8 has still frozen it. Step 11
precedes step 12 because a `recurred` verdict is an input to the §8.5 remediation proposals.

**"Terminates" names a jump, not an exit.** A step whose terminating branch fires stops the pass's
*decision-making* and goes directly to **step 14**, which appends the terminal row; steps 15 and 16
then run unchanged, so a terminated pass still commits the §5.4 pathspec and still releases the
marker. This is how step 8's `failed` already behaves (§2.6 rows 3–4: "appends its terminal row,
releases the marker") and it is the same for the two rows above; it is stated here once so that no
terminating branch has to restate it. The one terminal branch that is **not** a jump is step 4's
`skipped-cadence`, which took no marker, wrote no record and therefore has nothing to append,
commit or release (§2.4, §12.1 S-01).

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
more reason codes" (**§10.3**, which is where the field's cardinality is defined and is the whole
authority for this claim) — so an empty reason field is a legal row, not an invented value, and
nothing here breaches REQ §4b. (An earlier draft cited `skipped-cadence` as the precedent for an
empty `reason:`. That is withdrawn: a `skipped-cadence` tick appends **no row at all** (§10.1,
§12.1 S-01), so it is a precedent for nothing about a row's fields.) But an operator
reading `failed` with an empty reason cannot tell row 4 from a truncated row without opening the
report body, so this FSPEC records an **erratum against the REQ** asking for a dedicated reason code
(`advisory-dispatch-failed`, permitted with `failed`) in vocabularies §1 (§14.4). Until that row
exists, row 4's discriminator is the report body, and AT-M6 asserts it there.

Every other agent dispatch the pass makes — the §8.5 remediation authoring at step 12 and the §5/§6
proposal authoring at step 13 — goes out through the **same** resolver with the same `rungState`, so
rows 2–4 are their arms too. A memoised `rungState` means rows 2 and 3 cannot re-occur after step 8
(`:1844-1849`: with `_state.resolved` set, the cached rung is used and no ladder is entered), but
row 4 can.

**A row-4 dispatch-error at step 12 or step 13 is terminal, and its observables are named rather
than inherited.** §2.2 now carries the `Terminates` cell for both steps, §12.1 carries S-11c, and
AT-M9 constructs it. It terminates in the §2.2 sense — a jump to step 14 — so it is *not* identical
to step 8 in what it leaves behind, and the differences are exactly these:

| Observable | Step-8 row 4 (S-11b) | Step-12 / step-13 row 4 (S-11c) |
|---|---|---|
| Terminal status / reason | `failed`, no reason code | identical |
| §10.2 order-2 failure-mode records | none — no proposal was derived | one per proposal the pass **had already routed** before the failure, and **none** for a proposal it had not; a partially-routed pass is therefore readable from the log |
| §10.2 order-3 effectiveness table | **not** emitted — step 11, which computes it, had not run when the failure fired, so there is no table to append | emitted in full: step 11 completed |
| §5.4 commit (step 15) | runs, over the §5.4 pathspec | runs, identically — including any `DOMAIN-CONSTRAINTS.md` / `DECISIONS-{topic}.md` append a step-13 route had already made, so partial work is durable rather than orphaned on disk |
| `writes-uncommitted` | only if git refuses (§12.1 S-12) | identical — termination never implies it |
| Report body | the error message verbatim (§10.4 item 2) | the error message verbatim, **and** the routed / unrouted split of the pass's proposals |

Nothing here invents a record type or a reason code: the split above is rendered inside the §10.4
sections that already exist (item 4 promotions by route, item 8 deferred), so REQ §4b's set-equality
obligation is untouched. Rows 2 and 3, being unreachable after step 8, are given no such row.

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

Every proposal has exactly one **target path** — §8.1's `target` field: one canonical repository
path, never a glob, never a directory, normalised as AC-5.1 normalises a path. The promotion's *kind*
decides that target (§5.2's table); the target then decides the route, and nothing else does — not
the promotion's subject `artifact`, which keys the id and is a different field (§8.1):

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

**A guard-set subject does not imply the PR route.** An AC-2.2 promotion *about*
`pdlc/skills/se-author/SKILL.md` has that path as its subject `artifact` and
`docs/_decisions/DECISIONS-{failure-mode-id}.md` as its `target`, so it takes the consuming-repo
route — and NFR-1 is untouched, because the pass writes only the target. Only a **process-learning**
promotion has a guard-set path as its target, and that is the kind §5.2 routes to §6 or §5.3.

**This is a routing predicate, not an inherited control.** The pass does **not** call `guardVerdict`
(`pdlc/workflows/orchestrate-dev.js:732`) or `effectiveGuardPaths` (`:709`): both are reachable only
from Phase MERGE's ladder and the advisory-envelope check, and both decide about *that run's own* PR
(AC-3.7). The pass reads the same frozen constant and makes its own decision, so nothing here claims
enforcement that nothing performs.

NFR-1's consequence is absolute and has no exception branch: **no code path in the pass writes to a
guard-set path in any tree.** The guard-set edit exists only as a commit in the §6 clone, pushed to a
`consolidation/{passId}` branch and offered as a PR.

### 5.2 The unchanged promotion behaviour (REQ-CONS-02)

This table is what decides a promotion's §8.1 `target` from its kind; §5.1 then routes on that
target. The subject `artifact` is the same field in all three rows and is never the destination:

| Promotion kind | Destination (the `target`) | Shape |
|---|---|---|
| Domain invariant future REQs must respect | append to `docs/_constraints/DOMAIN-CONSTRAINTS.md` | as today (`pdlc/skills/consolidate-learnings/SKILL.md:40`) |
| Architectural decision now project-level | `docs/_decisions/DECISIONS-{topic}.md` | the path shape is today's (`pdlc/skills/consolidate-learnings/SKILL.md:41`); **`{topic}`'s derivation is new and this feature changes the convention** — see below |
| Process learning about a skill prompt, checklist or workflow phase | the subject `artifact` itself — the file the learning is about | **propose, never apply**: §6 (PR) or §5.3 (proposal file) |

**`{topic}` is derived, not chosen** (AC-2.2 states the destination; the derivation is this layer's).
It is the promotion's **`failure-mode-id`, verbatim and entire** (§8.1) — which is a function of
`phase` and the **subject** `artifact`, so the derivation reads no field it is defining:

> `{topic} = failure-mode-id`

Worked: `phase = P`, subject `artifact = pdlc/skills/se-author/SKILL.md` ⇒ `failure-mode-id =
p-pdlc-skills-se-author-skill-md` ⇒ `target =
docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md`. The subject is a guard-set path and
the target is not, which is why §5.1 sends this promotion to the consuming-repo route (AT-R6).

**An earlier draft dropped the artifact's directory segments** (`{topic} = p-skill-md`). That is
**withdrawn**, because dropping them is exactly what destroys discrimination. Under it, with
`phase = P`, every `SKILL.md` in the repository collapses to one topic: `pdlc/skills/se-author/SKILL.md`,
`pdlc/skills/dod-verify/SKILL.md` and `pdlc/skills/te-review/SKILL.md` — three of the fifteen skill
directories at HEAD — would share one decision file named for nothing but a phase letter and a file
extension. Using the whole slug keeps the derivation total and deterministic while narrowing
collisions to **exactly** the bounded case §8.1 already prices — two authored subject paths differing
only by separator-vs-dot. §8.1 states that cost in two arms, inherited here unchanged rather than
restated: within one pass the two are **merged** into one promotion and one file, silently (§8.2);
across passes NFR-4 **suppresses** the second and reports it (`duplicate-suppressed` naming the pair).
There is no collision class in `{topic}` that is not a collision class in `failure-mode-id`.

Four properties follow, and each is why the derivation is stated rather than left to the model:

| Property | Consequence |
|---|---|
| A pure function of the two keying fields (§8.1), never of `symptom` or of the consumed set | two passes recognising one decision write the **same** path, so the same decision accumulates in one file across passes instead of scattering — this is a *readability* property of the record, not an idempotence mechanism: §6.4 keys suppression on `(failure-mode-id, action)` and never on the destination path, so path stability buys the carrier nothing and is not claimed to |
| Discriminating on the full subject `artifact`, not on its basename | two decisions about two different files never share a file; the only collisions are §8.1's separator-vs-dot pairs, priced there |
| An existing file at that path is **appended to**, never replaced or re-created | the file is an append-only decision record like `DOMAIN-CONSTRAINTS.md`; §10.2's write granularity applies to it |
| The **`target`** is always inside `docs/_decisions/` and never inside a guard-set prefix — whatever the subject is | so an AC-2.2 promotion is always the §5.1 consuming-repo route, never the PR route, even when its subject is a guard-set file |

**This changes the `{topic}` convention, and the change is listed rather than implied.** The three
decision files at HEAD — `DECISIONS-plugin-distribution.md`, `DECISIONS-review-severity-bars.md`,
`DECISIONS-test-oracle-mechanics.md` — carry human-chosen topical names that no derivation can
reproduce, which is precisely why a pass must not try: a model-chosen topic is not a function of
anything the log records, so two passes would disagree. Consequences, stated exactly:

- A pass **never writes to a hand-named decision file**. It creates or appends
  `DECISIONS-{failure-mode-id}.md` only. The three files above are untouched by every pass, and no
  pass orphans, renames or duplicates them.
- Consolidating a hand-named file with a derived one is an **operator merge**, not a pass action, and
  is out of scope here exactly as every other retrospective migration is (REQ §5).
- The skill's own instruction at `pdlc/skills/consolidate-learnings/SKILL.md:41` states the
  destination without stating how `{topic}` is chosen. This feature edits that line to carry the
  derivation, so the manual entry point and the pass cannot diverge — listed in §15.3.

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
mid-pipeline on a `feat-*` branch. §6.1 states where the *guard-set* work happens instead. The pass
must nevertheless **name** that branch on its terminal row (AC-3.8b; §10.3's `branch:`, §10.4 item 9)
— including on the stages-nothing path below, where there is no commit output to read it out of —
and observing it is a **non-mutating read**, which §6.5 lists as permitted in this domain and which
no prohibition above touches.

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
| §5.2 consuming-repo route (`DOMAIN-CONSTRAINTS.md`, `DECISIONS-{topic}.md`) and the §5.3 proposal-file route | the **§8.1 failure-mode records already in `docs/_decisions/.consolidation-log.md`**, each of which carries its `failure-mode-id`, its `action`, its `route` and its `passId` as **fields of the §8.1 record** (§8.1 is normative for the record's shape; §10.2 order 2 is when it is written). **The four are indexed for two different jobs and the split is normative**: `failure-mode-id`, `action` and `route` are the three the `enacted` predicate below is a function of; `passId` is indexed **only** to spell the evidence of a suppression that predicate has already decided, and never participates in deciding it. §8.1's reader row for this carrier states the same four fields and the same split | `enacted` / `absent` — a two-member set defined below, read from the same log text the §3.2 predicate reads |

**The consuming-repo carrier's rule, and what `enacted` means.** A pair is `enacted` when some prior
pass's failure-mode record carries the same `(failure-mode-id, action)` **and that record's `route`
is not `degraded`** — i.e. the write actually landed in the consuming repo. A pair is `absent`
otherwise. An `enacted` proposal is **suppressed**: the pass appends nothing to
`DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md` for it and records `duplicate-suppressed` with a
`suppressed-by:` entry naming the pair and, in place of a PR URL, the enacting record's `passId` in
§10.3's second spelling — `{id}:{action} → pass:{passId}`. That is one grammar with two admissible
evidence forms, not a second field and not a free choice: §10.3 is normative for it. So re-running a
pass over the same corpus does **not** append the same constraint twice.

**A record short of `passId` does not un-suppress.** The predicate above is a function of
`(failure-mode-id, action)` and `route` — the key REQ NFR-4 names plus the `route`-conditioning this
section adds — so it is **decidable without `passId`**, and it decides the same way whether or not
that field is present: an enacting record with `route != degraded` makes the pair `enacted` and the
proposal **suppressed**, and nothing is appended to `DOMAIN-CONSTRAINTS.md` or
`DECISIONS-{topic}.md`. What degrades on the short record is the **evidence spelling only**: the
`suppressed-by:` entry still names the pair, and in place of the enacting `passId` it carries an
explicit unavailable statement rather than a guessed value — `pass:undefined` is never written, and
the entry is never dropped, which would read as "not suppressed". **The parse notice is still
emitted** (SE v9 Q-03): the short record is reported by name and by missing field exactly as every
other arm reports it — the exception this paragraph states is to the *skipping*, never to the notice,
which is the only thing that makes the degraded spelling attributable to a short record rather than to
a writer bug (E-12b states it in the same terms). That is the same shape §8.1's §8.3
row uses for a missing `artifact`: the contract runs, the unavailable half is *reported* as
unavailable, nothing is guessed. **"Unavailable" is the observable; its spelling inside the entry is
TSPEC's, per DEC-LAYER-01** — §15.2's lexicon owns no such value. The safety direction is the one
NFR-4 fixes: the alternative — skipping the contract and re-proposing — would re-append a constraint
that already landed in the consuming repo, which is exactly the duplicate the paragraph above
promises does not happen, produced by a field outside the suppression key.

**The `route`-conditioning is the point, not a detail.** §10.2 order 2 writes a failure-mode record
for **every** promotion the pass made, including one that §6.3 / §7.3 degraded to a proposal file
because it could not be applied (`credential-unavailable`, `branch-exists`, `api-failure`,
`repository-unresolved`). Keying `enacted` on the record's mere existence would therefore suppress,
forever, a promotion that exists nowhere but in a proposal file — the exact opposite of the PR
route's deliberate rule that a `closed`-unmerged PR is **not** in the key set and the proposal is
re-proposable (AT-Q4). With `route != degraded` in the definition, the two routes agree: a proposal
that reached nothing is re-proposable on the next pass, and a proposal that landed is not. AT-Q12
constructs the degraded case and asserts the re-proposal.

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
| (a) | the credential grants no merge rights | §7.1 — scope is `contents:write` + `pull_requests:write` only. This is a *permission* bound, and it is **not** what bounds the verb set: `contents:write` alone permits a merge commit, so control (b) below cannot be derived from this row and does not cite it |
| (b) | the pass never calls a merge or enable-auto-merge API on any PR — **including its own** | two assertions over the enumerated domains below, and the difference between them is deliberate. **Universally, on every pass:** the observed verb set of each domain is a **subset** of that domain's permitted set — which already falsifies a merge, since every merge verb is outside every permitted set. **On a pass that opens a PR (AT-Q7's Given):** each domain's **obliged** verbs are additionally *present*, so the oracle is not satisfiable by a pass that makes no calls at all. The PR it opened is in state `open` when the pass returns. Stated positively on purpose: "no such call exists" is an absence-only oracle, satisfied vacuously, blind to a renamed route, and blind to a merge issued through a generic seam. A source inspection (AT-Q7b) supplements it and never replaces it |
| (c) | the PR body carries `PDLC-CONSOLIDATION-PASS` | a repo-side control can recognise the PR as machine-opened |

This **restates** `pdlc-merge-phase`'s REQ-MERGE-03 rather than inheriting it, and the distinction is
load-bearing. `guardVerdict` (`pdlc/workflows/orchestrate-dev.js:732`) over `effectiveGuardPaths`
(`:709`) is reachable only from Phase MERGE's ladder and the advisory-envelope check, both deciding
about **that run's own** PR; and Phase MERGE ships `mergeMode: "off"`
(`MERGE_DEFAULTS`, `orchestrate-dev.js:60-61`). Nothing there evaluates an inbound PR, so claiming
inheritance would assert a control nothing enforces.

**The seam domains and their verb sets, enumerated here so the narrowing is this document's decision
and not the implementer's.** There are **three**: the PR seam, and the git seam split **by tree**.
Neither the pooling of the two seams nor the pooling of the two trees may be reinstated — a single
pooled git domain is what made an earlier draft of AT-Q7 red on a conforming pass, and a git domain
pooled across trees cannot state AC-3.8's prohibition, which is scoped to the *invoking* tree and
says nothing about the throwaway clone.

Every cell below is a set of **resolved verbs**, not of function names. The classification is part of
the contract, not the test's invention: a call is classified by the operation it performs, so
`git checkout -b X` and `git switch -c X` in the clone both resolve to `create-branch`, and a merge
issued through a generic entry point (a `_gh([…])` argv, a shell string, a URL built at runtime)
resolves to `merge` however it was spelled.

| Seam domain | **Obliged** — present on a pass whose Given obliges it (column 5) | **Permitted but not obliged** | Absent, on every pass | Obliged on which Given |
|---|---|---|---|---|
| **PR seam** — every call that reads or mutates a pull request in the target repository | `read-pr` (§6.4's state table cannot be evaluated without it), `create-pr` (AC-3.1) | — | `merge`, `enable-auto-merge`, `merge-pr`, `squash-merge`, `close-pr`, `update-pr` | a pass that opens a PR (AT-Q7) |
| **git seam, invoking tree** | `add`, `commit` (§5.4's single commit) | the two **non-mutating reads** — `read-branch` (`git rev-parse --abbrev-ref HEAD` and equivalent spellings) and `read-status` — see the paragraph below | every branch operation AC-3.8 forbids — `checkout`, `switch`, `stash`, `reset`, `rebase` — in **any** spelling, plus every merge verb above | a pass that **makes** the §5.4 commit, PR-opening or not (AT-Q7 **and** AT-Q7c). A promoting pass whose `git add` stages nothing — §5.4's fourth consequence, AT-R5 — makes no commit and is **outside** this Given: it observes `add` and no `commit`, and the obligation is not asserted on it |
| **git seam, §6.1 clone** | `clone` (§6.1), `create-branch` (§6.2), `add`, `commit` (one per edit, §6.2), `push` (§6.2) | `fetch` — §6.1 obliges a clone *cut from the fetched default branch*, and a `clone` already fetches, so a distinct `fetch` verb is conforming and its **absence** is equally conforming; plus the same **non-mutating reads** (`read-branch`, `read-status`), for the same reason | every merge verb above. AC-3.8's branch prohibition is **not** asserted here: it is scoped to the invoking tree, and inside a throwaway clone a branch-creating spelling resolves to `create-branch` | a pass that opens a PR (AT-Q7) |

**Why the read verbs are permitted rather than absent, and why they are not obliged.** Every
row-writing pass must report **the branch the §5.4 commit landed on** (AC-3.8b; §10.3's `branch:`
field, §10.4 item 9), including the §5.4 path where `git add` stages nothing and there is no commit
output to parse it out of. The shipped precedent for that observation is a `git rev-parse
--abbrev-ref HEAD` read through the git seam (`parseAbbrevRef`,
`pdlc/workflows/orchestrate-dev.js:3491-3496`; the read itself is `readHeadBranch` (`:3520`), which
issues `_git(["rev-parse", "--abbrev-ref", "HEAD"])` through the seam at **`:3524`**, and the branch
guard calls it at `:3580` — beside the same seam's `gitWithLockRetry` `:8617` and `commitPaths`
`:8669`). A spy over "the resolved verb of every
call routed through the seam" therefore sees a read verb on a conforming pass, and an oracle whose
permitted set were `{add, commit}` would be red on correct behaviour. It is **not** obliged, because
AC-3.8b obliges the *observation*, not a seam: TSPEC (T-04) may resolve the branch name from the
commit's own output, from a `rev-parse`, or from a runtime-supplied value, and all three conform —
exactly the shape `fetch` has in the clone row. Reads are non-mutating in both trees, so admitting
them costs the oracle nothing: no read verb is a branch operation AC-3.8 forbids, and no read verb
is a merge verb.

**On the two git rows the permitted read set is the closed two-member enumeration the table spells** —
`read-branch` and `read-status` — and not the open class "any non-mutating read". The scope matters:
this sentence is about the **git** domains. The PR seam has its own read verb, `read-pr`, in its
**obliged** column, because §6.4's state table cannot be evaluated without it — a `gh pr list`
resolves there and is not an example of the class excluded here. A test author transcribes the closed
set, so widening it silently would make the containment assertion unfalsifiable at its own boundary;
a pass that needs a third **git** read verb (`git log`, `git diff`, a `git show`) is a **change** to
this table, not a reading of it. Under DEC-LAYER-01 the seam verb permitted-sets are TSPEC's to
transcribe and, with a recorded reason, to widen — this table is the frozen statement TSPEC inherits,
so a widening is a **recorded TSPEC decision** against this set, never a silent reading of it.

The permitted set of a domain is its obliged column ∪ its permitted-but-not-obliged column. The
universal assertion is **observed ⊆ permitted**, which is what falsifies a merge on *any* pass,
including one that opens no PR; the obliged column is additionally asserted **present** only on a
pass whose Given obliges it — column 5 says which Given that is per domain, so the two git rows do
not share one. A pass with no guard-set proposal that nevertheless promotes — the common shape, since
§5.1 sends `DOMAIN-CONSTRAINTS.md` and `DECISIONS-*` writes to the consuming-repo route — observes
`∅` on the PR seam and on the clone seam, and in the invoking tree a set that **contains `add` and
`commit`** and is contained in `{add, commit, read-branch, read-status}`. Every one of those is a
subset of its permitted set, so the universal assertion is green on it and a set-equality would not
be. Note the asymmetry this makes explicit: on the invoking tree the assertion is containment
**bounded on both sides** — obligation below, permission above — and never an equality, because the
read verbs are optional; equality **with a domain's permitted set** is asserted on no domain, on any
Given. AT-Q7c's two `∅` conjuncts — the PR seam and the clone seam on a no-guard-set pass — *are*
equalities, with the empty set rather than with a permitted set, and they are deliberate: they are
what falsifies a pass that quietly clones or reads a PR when nothing routes there, and weakening them
to containment (which `∅ ⊆ permitted` satisfies vacuously) would leave that row nothing to catch.

Comparison is over the **set** of verbs, not a multiset: §6.2 obliges one commit per edit, so a
multiset comparison would be red on any pass with more than one promotion (AT-Q2's three) while
telling a reader nothing about merging.

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

The pass resolves a credential **at its first §6 PR-route attempt, and at most once per pass** — so a
pass that never attempts the PR route (it terminated first, or it derived no guard-set proposal)
never runs the resolution at all. It records exactly one `credential:` value in its log row over the
closed three-member set of vocabularies §1:

| Resolution | `credential:` value | Route |
|---|---|---|
| The environment variable named by `consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`) is set and non-empty | `present (redacted)` | §6 PR route |
| No such variable, but the invoking environment has working `gh` authentication | `local-gh` | §6 PR route — the **shipping** configuration for the same-repo case |
| Neither | `absent` | §6.3 fallback, reason code `credential-unavailable` |

`local-gh` is a supported configuration, not a degradation (AC-4.4): AC-4.1's scoped token is
required only when `consolidation.pluginRepository` names a *different* repository (BL-03).

`absent` means **no credential was in hand when the row was written**. That covers both a pass that
looked and found none, and a pass that never looked — a `refused` tick (§4.4), a `failed` pass
(§2.6 rows 3–4), or a pass with no guard-set proposal to route. §10.3 states how a reader tells the
two apart, on which rows the row itself decides it, and the one shape where it cannot. The
set needs no fourth "not reached" member, and this FSPEC introduces none: a value with no
vocabularies §1 row would breach REQ §4b's set-equality obligation.

An environment variable that is set but whose value the target repository rejects is
`present (redacted)` on the `credential:` field — the pass **had** a credential — while the route
still degrades with `credential-unavailable` (§6.3). The two fields answer different questions and
are never collapsed.

### 7.3 Degradation, and the status it forces (AC-4.3)

An absent or invalid credential **does not halt the pass** and **is not a silent skip**:

1. The affected promotion degrades to the §6.3 proposal-file fallback with reason code
   `credential-unavailable` — recorded on the terminal row **when the pass's terminal status admits
   that code**. At vocabularies §1 `Version` 1.4 that is `promoted-degraded` and `no-op`; a pass that
   subsequently terminates `failed` (§12.1 S-11c — a step-12/13 dispatch error *after* a PR-route
   attempt) may not carry it, so on that one row the degradation is legible in the report body only.
   The obligation is scoped this way rather than stated absolutely because an absolute form would be
   simultaneously unsatisfiable and a breach of REQ §4b's set-equality on that path. §10.3's third
   reading names the consequence for a reader; ER-4 (§14.4) routes the enumeration gap upstream.
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

Every promotion records an **eight-field** structured record, not prose. **This table is normative for
the record's shape** — every other section that reads a field off a failure-mode record (§5.1's
routing predicate, §6.4's consuming-repo carrier, §8.4 step 1, §10.2 order 2 — e.g., not the whole
set) reads it from here, and
§8.2's keying tuple `(failure-mode-id, passId, action)` is a *key over* these fields, never a second
field list. The eight readers are enumerated once, below, in the reader table — the parenthetical
here is illustrative, not the enumeration:

| Field | Value | Keys the id? |
|---|---|---|
| `failure-mode-id` | the derived slug below | — |
| `phase` | a member of the closed 13-member catalogue `R / F / T / D / P / PR / I / PT / CR / DOD / H / PUB / MERGE` (vocabularies §1, sourced from `PHASE_DISPATCH`, `orchestrate-dev.js:3337-3437`, and the `recordPhase` literals for I `:10020`, PT `:10250`, H `:10407`, PUB `:10462`, MERGE `:10568`) | **yes** |
| `symptom` | one line, human-readable, explicitly **non-keying** | **no** |
| `artifact` | the failure mode's **subject**: **exactly one canonical repository path** — the single *authored* file the failure mode was observed on and which the promotion is about; never a glob, never a directory, never a generated path (§8.2); root-relative, no `./`, no symlink alias | **yes** |
| `target` | the **one canonical repository path this promotion's write touches**, decided by the promotion's kind (§5.2's table) and normalised identically. It is the only field §5.1 routes on | **no** |
| `passId` | the `passId` (§2.5) of the pass that wrote this record — the record's own identity half (§8.2) | **no** |
| `action` | `promote` / `revise` / `retire` (§8.2), the second half of NFR-4's suppression key | **no** — never folded into the derivation |
| `route` | the route the promotion actually took, over the vocabularies §1 route set `constraints` / `decisions` / `PR` / `degraded` — the same four values `promotions:` carries (§10.3). `degraded` means it reached **nothing but** the §5.3 proposal file | **no** |

**`artifact` and `target` are two fields, not two readings of one, and the separation is what makes
the derivation well-founded.** They coincide on exactly one promotion kind and differ on the other
two:

| Promotion kind (§5.2) | `artifact` (subject, keys the id) | `target` (routed on) |
|---|---|---|
| Process learning about a skill prompt, checklist or workflow phase | the file the failure was observed on — e.g. `pdlc/skills/se-author/SKILL.md` | **the same path** — the promotion edits the file it is about |
| Architectural decision now project-level (AC-2.2) | the same subject file | `docs/_decisions/DECISIONS-{failure-mode-id}.md` (§5.2) |
| Domain invariant future REQs must respect (AC-2.1) | the same subject file | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |

Three consequences, each of which would be a defect under a single conflated field:

1. **The derivation terminates.** `{topic} = failure-mode-id` (§5.2) is a function of `phase` and
   `artifact`; the AC-2.2 `target` is a function of the id. Keying the id on `target` instead would
   define `{topic}` in terms of itself.
2. **An AC-2.2 promotion never routes to the PR route**, even when its subject is a guard-set path:
   §5.1 reads `target`, which is under `docs/_decisions/`. §5.2's fourth property row and AT-R6 /
   AT-R6b are assertions about `target`.
3. **AC-2.1 promotions stay distinct.** Every domain invariant in one phase shares one `target`
   (`DOMAIN-CONSTRAINTS.md`) but has its own `artifact`, so each mints its own id and NFR-4's
   `enacted` rule (§6.4) suppresses only a genuine re-proposal — not every invariant after the first.

**The table is normative for writers, and this paragraph settles the same question for readers.**
Every field above is written on every record, on every promotion kind and on the `degraded` route —
AT-F20 asserts that as a set-equality, so a record short of a field is a defect at the writer, not a
shape a reader must tolerate. A reader nevertheless meets records it did not write: §6.4's
consuming-repo carrier and §8.4 step 1 both index into records appended by *earlier* passes, and
§10.2's append-only grammar guarantees those are never rewritten, so a record written before a future
field is added stays as written. The rule is the receive-side discipline this document applies
everywhere else (§3.4, §9.3, AT-F16): **a record missing a field the reader indexes is reported as a
parse notice and skipped for that contract — never a halt, never a guessed default, and never an
in-place repair.** Skipping is the safe direction wherever the missing field is one the reader's
own predicate is a function of: §6.4 short of `route` fails to suppress and the promotion is
re-proposed (which NFR-4 already sanctions), and §8.4 step 1 leaves the id open (one extra harvest
question, the failure direction O-C7 accepts). **It is not the safe direction for a field a reader
indexes only to *spell* an outcome its predicate already decided** — there, skipping would discard a
decision the record does support. Exactly one such field exists in the table below (§6.4's `passId`),
and its arm is spelled in the row rather than left to this rule. Nor is skipping the safe direction
where dropping the reader's **output** would itself be read as a decision: §8.3 emits its row on a
record short of `artifact` or of `phase`, and §8.4 still asks its question on the fields present
**where the id is present** (short of `failure-mode-id` the two §8.4 cells are normative and no
question is asked — TE v10 Q-01), because a missing row and an unasked question both move a verdict
silently. **Where a cell states an
arm, the cell is normative and this rule is its default, not its override**; every cell that states
none takes this rule as written.

**"For that contract" is per field, per reader — the enumeration, so no reader is left to infer its
own arm.** A record is skipped only by the contracts that index the field it is missing. The table is
set-equal to the readers this document names — §5.1, §8.6, §6.4, §8.4 step 1, §8.4 steps 2–3's
harvest question, §10.2 order 2, §8.3 and §8.5, **eight**, one row each, and no reader of a
failure-mode record anywhere in this document outside that set — and a reader added later is a change
to this table, made here. **The set-equality is over the table's cells, not only its rows**: for every
field in §8.1's eight, the readers that index it are exactly those whose `Fields it indexes` cell
names it. A reader that indexes an unlisted field, and a field indexed by a reader whose row omits it,
are the same defect — which is why §6.4's row names `passId`, why §8.3's names `phase`, and why the
harvest question is a row of its own rather than folded into §8.4 step 1's, whose fields it does not
share. Every one of the eight fields is therefore named by at least one cell, `symptom` included:

| Reader | Fields it indexes | A record short of one of them |
|---|---|---|
| §5.1 routing | `target` | not routed; the promotion is re-proposed on a later pass |
| §8.6 remediation routing | `target` | **not §5.1's arm, and it is spelled because the state differs**: here a remediation has already been *chosen* (§8.5) and has nowhere to go. It is **not routed on a guessed path** — neither the PR route nor the proposal file is picked by default — the promotion keeps the state it had for that pass, and the notice is the report. The remediation is re-proposed on a later pass, exactly as §8.5's arm re-proposes nothing rather than guessing a `retirement` |
| §6.4 consuming-repo carrier | `failure-mode-id`, `action`, `route` — the `enacted` predicate — plus **`passId`**, for the evidence only | **Two arms, because this reader indexes its fields for two jobs (§6.4).** Short of `failure-mode-id`, `action` or `route`: the predicate cannot be evaluated, so the general rule above applies unchanged — parse notice, skip that contract, reads `absent`, the promotion is re-proposed. Short of **`passId` alone**: the predicate is still decidable — it is a function of the pair and `route`, not of `passId` — so the contract **is not skipped and the suppression holds**; what degrades is the *evidence spelling* only, the `suppressed-by:` entry naming the pair with an explicit unavailable statement in place of the enacting `passId` (§6.4; §10.3's `suppressed-by:` row is normative for the two spellings). This is the §8.3 shape, not the §5.1 shape: skipping here would re-append a constraint that already landed and defeat NFR-4 with a field outside its key, so the safe direction is the reverse of the `route` arm's. `pass:undefined` is the guessed default this section forbids in both arms |
| §8.4 step 1 open list | `failure-mode-id`, `action`, `route` | **Two arms, because one of the three fields is the list's own member type.** Short of `action` or `route`: the closure predicate cannot be evaluated, so the id stays **open** — one extra harvest question, the failure direction O-C7 accepts. Short of **`failure-mode-id`**: "open" is unstateable, because the list is a set of ids and the record carries none — the record **contributes no member to the list at all** and the parse notice is the whole report, never a minted or re-slugged id (BR-35b). That is not a member silently dropped in AT-F19's set-equality sense: the assertion there ranges over the ids the log carries, and an id-less record contributes none — the same reconciliation §8.3's row makes for the same field |
| §8.4 steps 2–3 harvest question | `symptom`, the subject `artifact` and `phase` — the three the question is composed of — plus `failure-mode-id`, for step 3's verbatim copy | **Not the same reader as step 1 and not the same fields, which is why it is its own row.** Short of `symptom`, `artifact` or `phase`: the promotion is **still put to the harvest agent**, on the fields the record does carry, with the missing half stated as unavailable rather than guessed; the notice names the record and the field. Dropping it from the question list is the failure direction — it would make `recurred` unreachable for that id and drift it to `insufficient-evidence` and then `unmeasurable` (§8.7), which is the precise harm §8.4's lookup exists to prevent. Short of **`failure-mode-id`**: there is nothing for step 3 to copy verbatim and step 1 has already left the record out of the open list, so no question is asked for it and the notice is the report — never a re-slugged or minted id (BR-35b) |
| §10.2 order 2 | the record as written | appended unchanged; nothing is repaired |
| §8.3 effectiveness table | `failure-mode-id`; `artifact`, for the row's canonical path; **`phase`**, which the `prevented` test is a function of (§8.3's verdict table) | **Three arms, one per field.** Short of **`artifact`**: the row is still emitted, keyed on the id; the notice is reported and the path cell carries **no path**, rendered as an explicit unavailable statement rather than as an empty cell or a guessed path (§10.4's receive-side totality, DC-01). "Unavailable" is the **observable**, not a literal this document pins — the spelling of that cell is TSPEC's, per DEC-LAYER-01, and §15.2's lexicon owns no such value. The row is never dropped, which would read as `insufficient-evidence` and silently move a verdict. Short of **`phase`**: the row is likewise still emitted and its **verdict falls to `insufficient-evidence`**, never to a guessed `prevented` — a record with no `phase` and a `phase` the §2 mapping cannot decide are the same epistemic state, and §8.3's totality rule already fixes that direction for the second, so this arm inherits it rather than adding a concept; the notice names the record and the missing field. Short of **`failure-mode-id`**: this is the one arm where "never dropped" cannot apply, because a row cannot be keyed on an id the record does not carry — the record contributes **no** row and the parse notice is the whole report. That is not a dropped row in §8.3's set-equality sense: the obligation there ranges over the **distinct ids the log carries**, and an id-less record contributes none |
| §8.5 remediation choice | `artifact` (BR-35a's file-existence test) | the test cannot run: the promotion keeps the state it had for that pass and **no** remediation is proposed — the notice is the report, never a guessed `retirement` |

In every arm the pass reaches its terminal status, the record's bytes are unchanged, and the notice
names the record. AT-F21 asserts that on one path, and E-12b is its edge-case row.

`target`, `passId`, `action` and `route` are bookkeeping, not identity: the *promotion* is keyed on
the id alone (§8.2), and none of the four participates in the derivation below. They are in the
record because four contracts read **these four bookkeeping fields** off it — §5.1 routes on
`target`, NFR-4's consuming-repo carrier reads `action` and `route` — and `passId`, to spell its
`suppressed-by:` evidence (§6.4, §10.3) — §8.4 step 1's open-promotion list reads `action` and
`route`, and §8.6 routes a remediation on `target`. **Four is the count of the readers of the
bookkeeping fields, not of the record**: all eight readers of the record are enumerated once, in the
reader table above, and the other four (§10.2 order 2, §8.3, §8.5, §8.4 steps 2–3) index no
bookkeeping field — §8.4 steps 2–3 index `symptom`, `artifact`, `phase` and the id, none of the four.

**The derivation** (delegated to this layer by AC-5.1), a pure function of two file-text inputs —
`phase` and the **subject** `artifact`, never `target`:

> `failure-mode-id = "{phase-lowercased}-{artifact-slug}"`, where `artifact-slug` is the normalised
> subject path with `/` and `.` each replaced by `-`, lowercased, with any run of non-`[a-z0-9-]`
> characters collapsed to a single `-` and leading/trailing `-` stripped.

Worked: `phase = DOD`, `artifact = pdlc/skills/dod-verify/SKILL.md` ⇒
`dod-pdlc-skills-dod-verify-skill-md`. It is **total** (every path yields a slug), **deterministic**
(a pure function of the two file-text fields), and consults nothing else — not the pass, not its
consumed set, and **not** `symptom`.

**It is not injective, and the collision is an accepted, bounded cost rather than a claim.** The
substitution maps both `/` and `.` to `-` and then collapses runs, so it is many-to-one:
`pdlc/skills/a-b.md`, `pdlc/skills/a/b.md` and `pdlc/skills/a.b.md` all slug to
`pdlc-skills-a-b-md`, and with one `phase` they are one id. What that costs, stated exactly:

| Consequence | Bound |
|---|---|
| **Within one pass**, two proposals over colliding subjects are **one** promotion: §8.2's uniqueness rule merges them into one record carrying one `symptom`, one `target` and one write | nothing is withheld, so there is nothing to suppress and nothing to report — the merge is **silent by construction**, and its observable is the *absence* of a second record rather than a reason code. AT-R6b's second fixture asserts exactly that. Where the merged proposals are of **different §5.2 kinds**, §8.2's precedence rule decides the single `target` and the report body names the elided kind (AT-R6b's third, fourth and fifth fixtures, O-C8); and because the merged proposals name **two** canonical subject paths by construction here, §8.2's subject tie-break decides the single `artifact` — and, where precedence returns the process-learning kind, the `target` with it. `duplicate-suppressed` is **not** emitted here: §6.4 defines it only over a *prior pass's* record or an open/merged PR |
| **Across passes**, NFR-4 suppresses a promotion whose subject collides with a *different* one already on a PR or in a §6.4 log record | the two files are in the same directory tree and differ only by separator-vs-dot in one path component; this suppression **is** reported (`duplicate-suppressed` names the pair **and** the PR or `passId`), so an operator reading the row sees which promotion was withheld. This is the cross-pass cost, and it is the only one the reason code covers |
| §8.3 emits one effectiveness row for two failure modes | the row's `artifact` field carries the **unslugged** canonical subject path of the promotion that made it, so the row is never ambiguous about which file it measured |
| §8.5 retires or revises one and appears to have retired both | same — the proposal carries the canonical path, not the slug |

The repair — a lossless encoding, e.g. percent-escaping the separators — is available and is
**deliberately not taken**: the id appears verbatim in a git trailer, a branch-adjacent record and a
LEARNINGS line a human writes (§8.4), and a lossless encoding is not a slug a person will reproduce
by hand. The collision is accepted at a rate bounded by "two authored files in one tree whose paths
differ only in separator-vs-dot" and is reported wherever it fires; it is **not** asserted away.

**Why exactly those inputs.** Determinism of the derivation is not stability of its inputs. `phase`
and `artifact` are *file* text — the property §8.3's determinism rests on. `symptom` is a line the
pass's own model writes under no vocabulary, so two passes recognising one failure mode from
different corpora would word it differently and slug differently — exactly the case NFR-4 must
survive (§5.5's abandonment: a later pass with a *larger* consumed set). The glob form is forbidden
for the same reason in the other direction: passes free to name `pdlc/workflows/orchestrate-dev.js`,
`pdlc/workflows/*.js` or `pdlc/workflows/` for one mode would slug three ways and NFR-4 would miss.

### 8.2 One promotion is one authored file

"Exactly one authored subject file" is a requirement, not an assumption. The rule is stated over
`artifact` (the subject) throughout this section; `target` is decided separately by §5.2 and is never
what splits or merges a promotion.

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

**The intra-pass merge is silent, and that is stated rather than left to inference.** Its observables
are exactly: one failure-mode record for the id, one `symptom`, one `target`, one write. No
`duplicate-suppressed` entry is recorded and no `suppressed-by:` entry is populated — those are §6.4's
vocabulary for a proposal *withheld* because a prior pass's record or an open PR already carries it,
and an intra-pass merge withholds nothing (there is no second promotion, and no PR or enacting
`passId` to name). AT-R6b's second fixture asserts the merge in this form; §8.1's collision table
prices the cross-pass case separately.

**When the merged proposals are of different §5.2 kinds, one `target` is decided by precedence — not
left to the writer.** The merge key reads `phase`, `artifact` and `action` and reads no kind, so the
two proposals it merges may be, say, a domain invariant and a process learning about one file in one
phase. **The precedence rule is scoped to one `action`, because the merge is**: the key includes
`action`, so a `promote` and a `revise` over one subject at one phase are two keys, no merge fires,
precedence never runs, and both writes happen — including a guard-set one. Consequence 2 below is
therefore an absolute about *merged* records, not about every pair of proposals over one subject.
**No fixture in §13 covers that two-action-one-subject pass** — the rows named here are the **three
classes** §13's rows fall into on this axis, not a sample of rows: every §13 row is either
single-action over a subject by construction (AT-R6b's five fixtures are the class's representative),
or partitions on PR-opening rather than on action multiplicity (AT-Q7, AT-Q7c likewise), or places a
`revise` or `retire` beside an earlier `promote` (AT-F9, AT-F10, AT-F18) **across passes**, while the
merge scoped here is intra-pass — so it is named **PROPERTIES-owned per
DEC-LAYER-01** (§14.5 LD-3), with its
observable stated here: two records under two keys, both writes made, and the guard-set one made as a
PR. A defective implementation folds the two actions into one key and makes one write, or suppresses
the guard-set write as if consequence 2 bound it.
`target` is a function of the kind (§8.1's three-row table), so without a rule the merged
record would have two candidate targets and the "one `target`" observable above would be
undetermined. The rule, in this order:

| Precedence | Kind (§5.2) | `target` |
|---|---|---|
| 1 (highest) | Domain invariant future REQs must respect (AC-2.1) | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| 2 | Architectural decision now project-level (AC-2.2) | `docs/_decisions/DECISIONS-{failure-mode-id}.md` |
| 3 (lowest) | Process learning about a skill prompt, checklist or workflow phase | the subject `artifact` itself |

The merged record carries the **highest-precedence** kind's `target` and its `route`; the order is by
reach — a constraint binds every future REQ, a decision binds the project, a prompt edit binds one
file — so the merge never narrows what the surviving write reaches. Three consequences, each stated
because each is checkable:

1. **The write that is elided is the lower-precedence one, and it is not silent.** The merged
   promotion's single `symptom` states both failure modes, and §10.4 item 4 names the elided kind
   beside the promotion it was merged into. What is lost is the *second write*, not the content — the
   corpus keeps both descriptions, which is what §8.2's "nothing is withheld" has always meant. It is
   **not** a `duplicate-suppressed`: §6.4 defines that code only over a prior pass's record or an
   open/merged PR, and neither exists here. **One line remains the obligation** (§8.1's `symptom`
   row): a merge of two — or, under one key, of three — failure modes states them in that one line,
   and the compensation an operator re-proposes from is **§10.4 item 4's report body**, which names
   each elided kind beside the promotion it was merged into and is not one line. Putting the load on
   the report rather than on `symptom` is deliberate: `symptom` is non-keying free text (§8.1) that
   no contract parses, so growing it would buy legibility nowhere and cost the record's shape.
2. **A mixed-kind merge never takes the PR route.** Both kinds that outrank a process learning have a
   `target` under `docs/_constraints/` or `docs/_decisions/`, which §5.1 routes to the consuming repo
   — so a process learning about a guard-set file, merged with either, loses its guard-set `target`
   and with it its PR. This is §8.1 consequence 2 holding one case further out, not an exception to
   it.
3. **Same-kind merges are unaffected**, and they are the common case: the precedence rule is a
   total order over a three-member set, so it is decidable on every merge, and on a same-kind merge
   it returns the kind both proposals already had.

**Precedence ranks kinds; a second rule ranks subjects, because for the lowest-precedence kind
`target` is a function of the subject.** Kinds 1 and 2 have a `target` that is a constant
(`docs/_constraints/DOMAIN-CONSTRAINTS.md`) or a function of the id
(`docs/_decisions/DECISIONS-{failure-mode-id}.md`), so ranking the kind decides the write. Kind 3's
`target` is *the subject `artifact` itself*, and the merge's premise is that the merged proposals name
**different** subject paths that slug to one id (§8.1's collision table). A same-kind merge of two
process learnings over colliding subjects therefore leaves both `artifact` and `target` with two
candidates — the same "one `target`" observable, one axis over. The tie-break:

> On any merge whose proposals name more than one canonical subject path, the merged record's
> `artifact` is the **lexicographically first** of them — byte order over the **canonical**
> root-relative paths of §8.1, i.e. each candidate's `artifact` value **as written**, before any
> slug substitution. ("Normalised" is §8.1's word for the slug-side transform, under which the
> candidates are identical by construction — that is why they merged — so it is not the comparison
> meant here.) `target` follows `artifact` wherever precedence returns kind 3; on kinds 1 and 2 the
> `target` is already decided above and the tie-break touches only `artifact`.

Three notes, each of which is why the rule is spelled rather than left open:

- **It is a pure function of the inputs.** "First proposed" is not: proposal order is decided by the
  pass's own model, so an implementation keyed on it is not reproducible across two passes over one
  corpus — the property §8.3's determinism rests on (§8.1, "Why exactly those inputs").
- **The `failure-mode-id` is unaffected** — it is why the merge happened: every candidate subject
  slugs to the same id, so the tie-break never moves the key, only the field an operator and §8.5
  read the canonical path off.
- **It is load-bearing two passes later.** §8.5 chooses the remediation with a file-existence test on
  the **subject** (BR-35a), so which of the colliding paths survives decides whether AT-F17's
  `revision` branch or AT-F18's `retirement` branch is taken. AT-R6b's colliding fixture asserts
  **which** `artifact` survives — `pdlc/skills/a-b.md`, since `-` (0x2D) precedes `/` (0x2F) — not
  merely that there is one. It cannot assert the `target`-follows clause: that fixture is kind 2 on
  both sides, where `target` is a function of the id and the id is invariant under the tie-break (the
  note above), so the clause's own motivating case — a colliding-subject merge of **two process
  learnings**, where precedence returns kind 3 — has no fixture here and is named **PROPERTIES-owned
  per DEC-LAYER-01** (§14.5 LD-2). The observable it owes is stated: `artifact` and `target` are the same path on
  the merged record, so an implementation applying the tie-break to `artifact` while keeping proposal
  order for `target` disagrees with itself, and BR-35a's file-existence test then runs on a subject
  the record's own `target` contradicts.

O-C8 (§14.2) records the accepted cost.

**Across passes the id deliberately repeats** — NFR-4 sanctions re-proposing a promotion whose PR the
operator closed unmerged. Log **records** are keyed `(failure-mode-id, passId, action)`; a
**promotion**, the unit whose effectiveness is measured, is keyed on the id alone. Every
effectiveness contract counts promotions: §8.3 emits one row per id, §8.4 counts one streak per id
over all its records, §8.5 retires an id.

**`action`** is one of `promote` / `revise` / `retire`, recorded beside the id and **never folded
into its derivation**.

### 8.3 The effectiveness table (AC-5.2)

Every pass that **reaches step 11** — the step that computes it — emits this table over **every**
promotion recorded in prior passes. That condition is §10.2 order 3's, verbatim and not a second one:
a pass that terminated earlier has no table and appends none (`refused` at step 6, and a step-8
`failed` — §12.1 S-09, S-11, S-11b), and it still emits its report and its terminal row without one.
Every pass that reaches step 11 emits the table in full, whatever its terminal status (S-11c
included). Each row's verdict is decided by a rule with **no model judgment**, so two runs over the
same inputs cannot disagree:

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
   `insufficient-evidence` and never to a guessed `prevented`. A promotion **record** short of the
   `phase` field is the same epistemic state and takes the same direction — the row is emitted and the
   verdict is `insufficient-evidence`, never a guessed `prevented`; §8.1's reader row for this section
   is normative for that arm, and for the id-less record that yields no row at all.

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

**The producing-side obligation — a lookup, never a re-derivation.** The slug is a function of a
*prior promotion's* recorded `phase` and canonical `artifact` (§8.1), neither of which a harvest
agent knows from the feature it is harvesting. An id an LLM composes from the failure it is
describing will not be byte-equal to any recorded slug, so a "derive it yourself" convention would
make `recurred` unreachable and drift every promotion to `insufficient-evidence` and then
`unmeasurable` (§8.7). The convention this feature adds to
`pdlc/skills/harvest-learnings/SKILL.md` (metadata table `:70-78`) is therefore a **lookup against
the open-promotion list**, and is stated in the skill in these terms:

| # | Harvest-side step | Detail |
|---|---|---|
| 1 | Read the open-promotion list | `docs/_decisions/.consolidation-log.md` — the same tracked file the pass writes (§5.4). Each promotion record carries the eight fields of §8.1. **Open** is computed **by the pass**, from the log and nothing else, and handed to the harvest prompt as a list — the arithmetic is not delegated to the agent, so it is testable at this layer (a landed `retire` closes an id; a `degraded` one does not): an id is open when **no** record for that id carries `action: retire` with a `route` other than `degraded`. Equivalently — a landed retirement closes an id; a `retire` that reached only a proposal file does not. **Step 1 is a reader of the record in its own right and has its own row in §8.1's reader table**, which is normative for a record short of `action` or `route` (the id stays open) and for one short of `failure-mode-id` (the record contributes **no** member to the list — a list of ids takes none from a record that carries none — and the parse notice is the report). |
| 2 | For each §5 Open Item being written, ask one question per open promotion | "Does this open item report the failure this promotion's `symptom` describes, on this promotion's **subject** `artifact` (§8.1 — the file the mode was observed on, never the `target` the promotion wrote), in this promotion's `phase`?" **Steps 2–3 are a reader of the record in their own right — not step 1's — and have their own row in §8.1's reader table**, which is normative for a record short of any of the three question fields (the question is still asked on the fields present, with the missing half stated as unavailable) and for one short of `failure-mode-id` (no question, since step 3 has nothing to copy). |
| 3 | On a yes, copy the id **verbatim** | append `failure-mode-id: {id}` to that open item, character-for-character from the log row. Never re-slug, never abbreviate, never mint a new id. |
| 4 | On no matches, write no line | the absence is meaningful: `recurred` does not fire and the phase observable still yields `prevented` or `insufficient-evidence` on its own evidence (table above). |

**"Open" is a harvest-side filter, and it is deliberately not §8.3's population.** The two sections
use the word compatibly because only one of them uses it at all: §8.3's effectiveness table emits one
row per **distinct recorded id**, retired ones included, and openness never filters it — a retired
promotion keeps a visible standing verdict, which is what makes the retirement auditable. Step 1's
filter exists solely to bound the question list the harvest agent is asked. The bound it gives is
weak but real, and its limit is stated rather than claimed away: an id whose `retire` proposal sits
on an unmerged PR is **not** observable as retired from the log at all (the PR's state lives in the
PR, §6.4), so it stays open and is still asked about. The failure direction is one extra question,
never a missed one.

Two properties follow. The second is asserted by a test; the first is a convention whose **violation**
is detected, which is a weaker and more honest claim:

- **The id is never invented — and the check is on the receive side.** The convention instructs the
  harvest agent to copy an existing line verbatim, so the intended set of ids appearing in the corpus
  is a **subset** of the set of recorded ids. That instruction is natural language in
  `pdlc/skills/harvest-learnings/SKILL.md` and nothing at this layer can assert compliance with it;
  what *is* asserted is that a violation is caught — an id in a LEARNINGS matching no record is
  reported as a parse notice (§9.3's receive-side discipline, applied here) and counted toward no
  verdict, which AT-F16 tests.
- **Step 2 is a model judgment, and it is on the producing side by design.** It decides only whether
  to *attach evidence*; it never decides a verdict. §8.3's "no model judgment" claim is unchanged and
  scoped exactly as written — the verdict rule is a set-membership test over the ids that are
  present, and it cannot disagree between two runs over the same corpus.

**The limit this leaves.** A harvest agent that should have attached an id and did not produces a
false `prevented` (or `insufficient-evidence`), never a false `recurred` — the failure direction is
toward "we cannot show it worked", which is the safe one for a falsifiability loop. The absent
line is invisible to the pass, so this is a **recall** limit and is not repairable at this layer;
it is recorded as O-C6 in §14.2. AT-F15 (§13.7) tests the **receive** side of the convention — a
corpus file whose open item carries an id matching exactly one of several records yields `recurred`
for exactly that promotion and for no other. It does **not** range over the producing side, and no
test in §13 does: the only way to obtain a genuinely harvest-authored file is to dispatch the
`harvest-learnings` agent, whose output is not reproducible and is therefore not an acceptance-test
input at any level. That gap is O-C6, not a coverage hole this document can close.

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
| 3 | the promotion's **subject** `artifact` (§8.1) exists at the pass's HEAD | `revision` — the failure mode's subject is still there, so the promotion under-reached rather than mis-aimed |
| 4 | otherwise — the subject `artifact` no longer exists at HEAD, so there is nothing left to revise | `retirement` |

**Row 3's predicate is a file-existence test and nothing else.** An earlier draft conditioned it on
"the recurrence names the same `symptom` the promotion targeted". That is withdrawn: §8.1 declares
`symptom` free text written by the pass's own model under no vocabulary and explicitly non-keying,
precisely because two passes word one mode differently — so a rule branching on it would be a
free-text match no two runs must agree on, contradicting §8.3's determinism, and the corpus cannot
supply the input in any case (a LEARNINGS carries a `failure-mode-id` line, §8.4, never a symptom).
The recurrence's *identity* is already established before rows 3–4 are reached — the flag exists
only because two counted passes returned `recurred`, which by §8.3 means a consumed LEARNINGS named
this exact id. What remains to decide is therefore only whether a target survives, and that is
decidable by one filesystem check on the canonical subject path (§8.1's `artifact`, root-relative,
exactly one file — never the `target`, whose existence says nothing about whether the failure mode's
subject survives). Both rows are deterministic functions of (the log, the pass's HEAD tree); no model
runs.

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
decided by the promotion's own `target` (§8.1), exactly as §5.1 decides any target, and never by its
subject `artifact`:

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

**The population is the whole file, and "the consumed window" is not a population here.** Every count
in §9.4 and §9.5 ranges over **every entry in `ESCALATIONS.md`**, with no filter on `Feature`, no
filter on date, and no relation to this pass's consumed set. Stated as a rule so the two tests cannot
diverge:

| Quantity | Ranges over |
|---|---|
| a seam's total (§9.4 dominance) | all entries in the file |
| a seam's distinct feature count (§9.4 pattern bar) | all entries in the file |
| "at least one other seam escalated" (§9.5 conjunct 1) | all entries in the file |
| "this seam has escalations from no feature" (§9.5 conjunct 2) | all entries in the file |

Three reasons this is the whole file rather than the consumed set. First, `ESCALATIONS.md` is
**non-feature-scoped and never distilled or deleted** (CLAUDE.md, advisory tier), so it is already the
cumulative record — intersecting it with a consumed set would discard the older evidence that makes a
pattern a pattern. Second, the consumed set is a set of *LEARNINGS files*, and an escalation entry's
`Feature` need not correspond to any LEARNINGS in it; the intersection would be silently lossy in a
way no operator could see. Third, §9.5's silence conjunct is only meaningful against everything
known: a seam silent across the whole record is a signal, a seam silent across five recent features
is a sampling artefact.

Wherever this document previously said "across the consumed window" in §9.5, read **across the whole
file**; the phrase is corrected there. AT-A6 (§13.8) pins the population by construction: its fixture
carries entries whose `Feature` values are *disjoint* from the pass's consumed set, and the §9.5
verdict must be identical to the verdict on the same entries with matching `Feature` values — a test
an implementation that filtered on the consumed set would fail.

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

Both quantities range over the whole of `ESCALATIONS.md` (§9.2), the same population §9.5 uses.

Both required. When they hold, the pass surfaces that seam as a candidate for **envelope revision or
upstream-phase repair**, bound to the relevant deferral. It is surfaced, not enacted — like every
other guard-set change it reaches the operator through §6 or §5.3.

A tie on the dominance test fires nothing: `exceeds` is strict, so two seams at the same total are
not a signal, and the pass reports the tie in its §10 report rather than picking one.

### 9.5 Under-exercised seam (AC-6.3)

| Conjunct | Condition |
|---|---|
| Corpus non-empty | at least one **other** seam escalated somewhere in `ESCALATIONS.md` (row 3 of §9.3) — the population is the whole file, per §9.2 |
| Silence | this seam has escalations from **no** feature anywhere in that same file |

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
| 2 | one failure-mode record per promotion (§8.1) | 13 | when the pass promoted anything — **one append per promotion, as it routes**, never one batch at the end of the step. The granularity is the contract, not an implementation detail: it is what makes a partially-routed pass readable from the log at all, and it is the whole content of AT-M9's discriminating conjunct (one record for the routed proposal, none for the unrouted one) |
| 3 | the effectiveness table (§8.3) | 14 | every pass that **reached step 11**, which computes it. A pass that terminated earlier has no table to append and appends none: `refused` (step 6) and a step-8 `failed` (§12.1 S-09, S-11, S-11b). A step-12/13 `failed` (S-11c) did reach step 11 and appends it in full. §8.3's opening sentence states the same condition and neither is the looser one; AT-M9 asserts the positive arm, AT-M6 and AT-M6b the two negative ones |
| 4 | the terminal row (§10.3) | 14 | as §10.1 |

Order 1 before everything else is vocabularies §3(a)'s obligation and freezes the legacy-region
boundary unconditionally. Orders 2–4 are appends in a fixed sequence so a truncated pass is readable:
a log ending mid-sequence names what the pass had decided, and the absent terminal row is itself the
evidence the pass did not complete.

**No record is ever edited in place.** The AC-3.4 PR URL is not a back-edit of an earlier record: it
is the `pr:` field of this pass's own single terminal row, appended once. That is what keeps the log
lock-free (§4.1).

### 10.3 The terminal row's fields

One row, one pass. The fields split into two classes, and the split is what makes the §1 set-equality
oracle (AT-L5) well-defined rather than false on a correct implementation:

| Class | Fields | Obligation |
|---|---|---|
| **Enumerated** — the value is drawn from a closed set | `status:`, `trigger:`, `reason:`, `credential:`, the route names inside `promotions:`, and the per-promotion verdict / state / action / phase values the report carries | every value is a member of a vocabularies §1 category, and **no value in this class has no §1 row** |
| **Free-form** — the value is data, not a vocabulary | `pass:`, `date:`, `consumed:`, `branch:`, `deferred:`, `pr:` (a URL or empty), `suppressed-by:` (a `{id}:{action} → {evidence}` composite, the evidence being a PR URL or `pass:{passId}` — see the field table below), `rung:` (a model identifier) | the **field name** has a §1 row where §1 defines one; the **value** is outside the compared set. A URL, a date, a branch name and a model id are not vocabulary members and were never intended to be. **One exception is named rather than absorbed:** `suppressed-by:` is the single field of this class for which §1 *does* spell a value grammar (`:63`), and this document's grammar is wider than it — that divergence is routed as §14.4 ER-5 and is **not** claimed as free-form. AT-L5's domain is unaffected either way, since it compares no value of this class |

`rung:` is in the free-form class by value and is the one field whose *name* has no §1 row at
`Version` 1.4 — a gap in a REQ-owned file (§15.3), routed as an erratum (§14.4) rather than patched
here.

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
| `suppressed-by:` | zero or more `{id}:{action} → {evidence}` entries, one per suppressed proposal. **`{evidence}` has exactly two admissible spellings, one per §6.4 carrier**, and which one an entry carries is decided by the suppressed proposal's own route, never by the writer: the **PR URL** verbatim when the pair was found on an `open` or `merged` PR (§6.4's PR carrier), and `pass:{passId}` — the literal prefix `pass:` followed by the enacting record's `passId` — when it was found in a §8.1 failure-mode record with `route != degraded` (§6.4's consuming-repo carrier). No third spelling exists, no entry carries both, and the two are told apart by the `pass:` prefix, which no URL bears. **The one degraded case is a rendering of the second spelling, not a third one**: where the enacting record is short of `passId` (§6.4), the suppression still holds and the entry is still written, with the enacting pass reported as **unavailable** in place of `{passId}` — never `pass:undefined`, never an omitted entry. "Unavailable" is the observable; how it is spelled inside the entry is TSPEC's, per DEC-LAYER-01, exactly as §8.1's §8.3 row leaves the unavailable-path cell. **This grammar is wider than vocabularies §1's, which spells the value `` `{id}:{action} → PR URL` `` (`:63`) and admits only the PR carrier — a divergence routed as §14.4 ER-5, not an exercise of the free-form exemption**: the field's *name* has a §1 row, which is what AT-L5 needs, but the value grammar §1 writes out is a REQ-owned row this layer cannot edit, and the consuming-repo carrier NFR-4 obliges has no PR to name | NFR-4 |
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

**`credential: absent` carries two readings, and the row itself says which.** The closed set has
three members (§7.2) and gains no fourth: adding a
`not-attempted` member would be a vocabularies §1 change, and §1 is a REQ-owned enumeration this
layer does not edit.

**An earlier draft keyed the reading on the row's `status:` — `refused` ⇒ not attempted, any other
status ⇒ attempted. That is withdrawn: it is not total.** A `failed` row that terminated at step 8
(§12.1 S-11, S-11b) made no promotion and never reached §7.2's resolution; and a `promoted` or
`no-op` pass whose proposals were all consuming-repo ones never attempts the PR route at all. Both
fell in the old table's "any other status" row, and neither can carry `credential-unavailable`, which
vocabularies §1 permits only with `promoted-degraded` and `no-op`. A step-12/13 `failed` row (S-11c)
is the third shape, and it is the one a status key would misread in the *other* direction: it can
have reached the resolution, and cannot record what it found.

The reading is therefore keyed on the observable that actually decides it — the co-occurrence of
`credential-unavailable` on the same row — over the rows whose status admits that code, with the one
shape that does not named as its own reading rather than folded into the second arm:

| Row observation | Reading of `credential: absent` |
|---|---|
| the row's `reason:` **carries** `credential-unavailable` | **attempted and found nothing** — the §6 route was attempted, §7.2 resolved neither a `credentialEnv` variable nor working local `gh` auth, and the promotion degraded. The finding AT-K2 constructs |
| the row's status is **not** `failed` and its `reason:` does **not** carry the code | **not attempted.** §7.2's resolution never ran, because the pass never reached a §6 PR-route attempt: it was `refused` at step 6 (S-09), or it derived no guard-set proposal. `absent` is the row's null, not a finding |
| the row's status **is** `failed` and its `reason:` does not carry the code | **undecidable from the row's fields alone**, and this document says so rather than guessing. A `failed` pass may have terminated before any PR-route attempt (step 8 — S-11, S-11b) *or* after one that resolved nothing (step 12/13 — S-11c), and vocabularies §1 at `Version` 1.4 permits `credential-unavailable` only with `promoted-degraded` and `no-op`, so the code cannot appear on this row to tell them apart. **The report body decides it**: §10.4 item 4 renders every promotion by route, so a degraded promotion naming `credential-unavailable` as its §6.3 failure class is present there exactly when the resolution ran and found nothing |

The first two rows are exact in both directions because the pairing is a **biconditional this
document obliges over them**: §6.3 and §7.3 require every attempted-and-empty resolution to record
`credential-unavailable` *where the status admits it*, and vocabularies §1's composition rule makes
that code unavailable on every row the second arm names. The third row is where the biconditional's
two halves cannot both hold — the code is obliged by §7.3 and barred by §1's status column — and it
is named as a **loss of row-level decidability**, not asserted away; §14.4 ER-4 asks §1 for the
composition that would close it, and until that row lands the report body is the discriminator. Note
what is **not** claimed: `status:` does not decide the reading on the first two rows; it only selects
which of the three rows applies. AT-K6 asserts the split over a fixture set spanning every shape,
including both `failed` sub-shapes, so an implementation that recorded a genuine credential finding on
a row that never resolved one, omitted the reason code on a real one, or recorded the code on a
`failed` row in breach of REQ §4b, fails.

### 10.4 The report body

The returned body carries everything AC-7.1 requires, in a form a `/loop` tick prints:

1. terminal status and reason codes,
2. the rung it ran on, and the `ADVISORY_MODEL_FALLBACK:` line verbatim when one was emitted (§2.6),
3. LEARNINGS consumed, **by basename**,
4. promotions by route — constraints, decisions, PR, `degraded` — each `degraded` one naming its
   §6.3 failure class and reason code, and each promotion produced by a **mixed-kind intra-pass
   merge** (§8.2) naming the elided lower-precedence kind beside it, so the write that did not happen
   is legible without diffing the log. **The same obligation on the subject axis:** any promotion
   whose merge invoked §8.2's **subject tie-break** names, beside the surviving `artifact`, every
   canonical subject path the tie-break elided. The two axes are one rule read twice — what the merge
   dropped is named in the report body, never left to the `symptom`, which §8.1 pins as one line of
   non-keying free text no contract parses. It is load-bearing on this axis in particular: the id is
   one, so the losing subject is not separately re-proposable, BR-35a's file-existence test runs on
   the surviving `artifact` only, and §8.3's effectiveness row carries the surviving path — the report
   is the operator's only handle on the elided one,
5. the §8.3 effectiveness table: one row per distinct `failure-mode-id`, its verdict, and its state
   (`ineffective` / `unmeasurable`) where one holds, with the §8.5 `revision` / `retirement` field
   present only where a remediation was proposed,
6. `duplicate-suppressed` entries, one per suppressed proposal, naming the pair and its carrier's
   evidence — the PR on the PR route, the enacting `passId` on the consuming-repo route (§10.3),
7. the §9 advisory notes: the corpus state, any §9.4 / §9.5 candidate, and any operator action,
8. what it deferred for human judgment,
9. the branch the §5.4 commit landed on, or `writes-uncommitted`,
10. the **number** of open promotions in the list §8.4 step 1 hands to the harvest prompt. O-C7
    accepts that this list grows monotonically and refuses a silent cap; reporting its length is what
    makes the growth observable **before** it becomes a prompt truncation, and it is the only number
    here that no other item carries. It is a count, not the list — the list itself belongs to the
    harvest prompt.

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

The **`Log row`** column counts **terminal rows only**, in every row of the table; what else a pass
appends (a consumed pair, failure-mode records, the effectiveness table) is the business of the
`Consumed pair` column, of §10.2's order table, and of each row's own Scenario cell.

| # | Scenario | Status | Reason code(s) | Marker | Log row | Consumed pair | Commit |
|---|---|---|---|---|---|---|---|
| S-01 | Tick, neither test fires | `skipped-cadence` | none | not taken | **none** | none | none |
| S-02 | Tick, volume test fires, promotions land | `promoted` | — | taken, released | one | one, non-empty | yes |
| S-03 | Tick, cadence test fires on an empty datum set | `promoted` / `no-op` per outcome — and on the **bootstrap conjunction** (empty datum set ∧ empty consumed set, the state every consuming repo starts in) it is **`no-op`**, S-05's status, since the pass promoted nothing; S-03 and S-05 compose, they do not compete | `no-cadence-datum` | taken, released | one | one | yes |
| S-04 | Direct invocation, cadence not elapsed | `promoted` / `no-op` per outcome | — (trigger `manual`) | taken, released | one | one | yes |
| S-05 | Consumed set empty | `no-op` | — | taken, released | one | one, **empty** | yes |
| S-06 | Every promotion duplicate-suppressed | `no-op` | `duplicate-suppressed` | taken, released | one, `pr:` **empty**, `suppressed-by:` populated | one, non-empty | yes |
| S-07 | Some promotions landed, one PR failed to open | `promoted-degraded` | one §6.3 class code | taken, released | one | one | yes |
| S-08 | Credential absent, nothing else promoted | `no-op` | `credential-unavailable` | taken, released | one, `credential: absent` | one | yes |
| S-09 | Marker held and fresh | `refused` | `consolidation-in-progress` | **not taken** | one, `credential: absent` — read as **not attempted** (§10.3), never carrying `credential-unavailable` | **none** | **none** |
| S-10 | Marker held and stale | as the run's own outcome | `reclaimed-stale-lock` (+ others) | reclaimed, released | one | one | yes |
| S-11 | Neither model rung resolves | `failed` | `advisory-model-unresolved` | taken, released | one | one (already appended at step 7) | yes |
| S-11b | The first advisory dispatch fails for a non-model reason (§2.6 row 4) | `failed` | **none** — the error message is in the report body, and §14.4 ER-2 routes the missing code | taken, released | one | one (already appended at step 7) | yes |
| S-11c | An advisory dispatch **after** step 8 — the §8.5 remediation authoring (step 12) or the §5/§6 proposal authoring (step 13) — fails for a non-model reason (§2.6 row 4). Because step 11 completed, this pass also appends the §8.3 effectiveness table and one failure-mode record per **already-routed** proposal (none for an unrouted one) — the appends §2.6's observables table distinguishes from S-11b | `failed` | **none** — as S-11b; the error message is in the report body | taken, released | one | one (already appended at step 7) | yes — over the §5.4 pathspec, so any append a step-13 route had already made is durable |
| S-12 | Terminal outcome reached, git refuses the commit | unchanged from the run's own outcome | + `writes-uncommitted` | taken, released | one | one | **no** — writes left in the working tree |
| S-13 | `ESCALATIONS.md` absent | as the run's own outcome | + `no-advisory-corpus` | taken, released | one | one | yes |
| S-14 | `ESCALATIONS.md` present, zero entries | as the run's own outcome | + `advisory-corpus-empty` | taken, released | one | one | yes |

Every terminal status appears: `promoted` (S-02), `promoted-degraded` (S-07), `no-op` (S-05, S-06,
S-08), `skipped-cadence` (S-01), `refused` (S-09), `failed` (S-11, S-11b, S-11c). Each is asserted
behaviourally by at least one acceptance test — `promoted-degraded` by AT-K7, which is S-07's row.

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
| P-04 | suppressed as a duplicate | a `suppressed-by:` entry naming the `(id, action)` pair and its carrier's evidence in §10.3's grammar — the **open-or-merged PR's URL** on the PR route, `pass:{passId}` of the enacting §8.1 record on the consuming-repo route; **no** PR opened, **no** fallback fired, and on the consuming-repo route **no** append made |
| P-05 | written as an operator action | the §9.5 consumer-config widening, in the report only — no PR, no `degraded` classification |

### 12.3 Per-promotion verdicts and states

| # | Emitted for | Value | Where |
|---|---|---|---|
| V-01 | every prior promotion, every reporting pass | `prevented` / `recurred` / `insufficient-evidence` | one §8.3 row per distinct `failure-mode-id` |
| V-02 | a promotion `recurred` on two consecutive counted passes | state `ineffective`, plus a `revision` / `retirement` field, chosen by §8.5's four rows — spent alternatives first, then one file-existence test, never a free-text match | the same row |
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
| AT-C3 | operator | fewer than `volumeThreshold` un-consolidated and `cadenceHours` not elapsed | a tick runs | the invocation **returns a report body carrying the terminal status `skipped-cadence`** (§10.1 row 3: a skipped tick returns the status alone, and that returned body is the positive conjunct — it is what distinguishes a tick that evaluated and chose this branch from one that crashed at step 3); **and** no log row is appended, no LEARNINGS body was read, no `passId` minted, no git call made. The positive conjunct is required: the four absences alone are satisfied by a pass that never ran |
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
| AT-P7 | operator | a **shared fixture table** of (corpus, log) cases spanning both §3.2 regions, an unterminated block, a dangling closer and a stray basename — the same table AT-P2…AT-P5 range over | both the pass's enumeration and `pdlc/hooks/scripts/nudge-consolidation.sh` are run over each case | the two un-consolidated sets are **set-equal** on every case. This is a differential test, not a source inspection: T-08 permits two implementations, and the hook's predicate is a Python heredoc inside bash (`:41`, glob at `:28`) that no JS test can import, so equality of behaviour is the only assertable form of "one corpus, one predicate" |
| AT-P8 | operator | a log file present but **unreadable** (permissions or IO error) | the predicate runs | it is treated as **empty text** — every enumerated basename is un-consolidated, no error is raised, and the pass proceeds. Distinct from AT-P4's absent-file Given: E-01 and E-02 are different input states and each carries its own fixture |
| AT-P9 | operator | a log carrying a closing `<!-- /pdlc:consumed -->` with **no opener** before it, and a real block elsewhere in the file | the predicate runs | the dangling closer opens no block and moves no boundary: basenames adjacent to it are un-consolidated, and the real block's basenames are unaffected. Distinct from AT-P2, whose Given is a stray basename |
| AT-P10 | operator | two LEARNINGS sharing a basename under `docs/{f}/` and `docs/completed/{g}/` | a pass runs | the un-consolidated set has **one** member for the pair, **and** the §10.4 report names the collision explicitly — the report assertion is the one this row exists for, since the set-size assertion alone cannot distinguish "reported" from "silently resolved" |
| AT-P11 | operator | a log in which a basename appears **in both** the legacy region and inside a `<!-- pdlc:consumed -->` block | the predicate runs | it is consolidated exactly once and appears once in every set the pass derives — the two clauses are a disjunction over a set, so a double membership is not a double count. Distinct from AT-P3, whose Given carries no marker at all |

### 13.3 The marker (§4)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-M1 | operator | a marker present, younger than `staleLockMinutes` | a second pass starts | terminal `refused`, reason `consolidation-in-progress`, naming the held `passId` and timestamp; **no** consumed pair; **no** commit; one log row is still written |
| AT-M2 | operator | a marker older than `staleLockMinutes` | a pass starts | the marker is reclaimed, `reclaimed-stale-lock` records the abandoned `passId`, and the pass proceeds |
| AT-M3 | operator | a truncated or unparseable marker file | a pass starts | it is reclaimed (not refused), with the abandoned id reported `unknown` |
| AT-M4 | operator | a pass that terminates `failed` at step 8 because **neither** model rung resolves (§12.1 S-11) | the pass ends | the marker is released, the terminal row is written with reason `advisory-model-unresolved`, the consumed pair (appended at step 7) is present, **and no §8.3 effectiveness table is appended**. The absent-table conjunct is the same one AT-M6 asserts, and it is asserted here as well because S-11 and S-11b reach it by the **same** path — §10.2 order 3's "step 11 never ran" — and not by two arms: step 8 is one step, and every way of leaving it early leaves it before step 11. Two rows assert it because the two Givens differ (unresolved rung vs. dispatch error) and an implementation could special-case one |
| AT-M5 | operator | a pass that takes the marker and runs to a terminal outcome, with the git seam under a spy | the pass ends | the **observed pathspec set** of every commit the pass makes is **set-equal** to the §5.4 write set — which does not contain the lock path. The positive set-equality is the assertion; a maintainer-side check that `.gitignore` carries a pattern matching `docs/_decisions/.consolidation-lock` accompanies it, but cannot stand alone: a pass that made no commit at all would satisfy an absence-only oracle |
| AT-M6 | operator | a first advisory dispatch that fails for a reason that is **not** model resolution — the resolver's `{kind: "dispatch-error", err}` return (§2.6 row 4) | the pass ends | terminal `failed` with **no** reason code; the error's message appears verbatim in the report body; the marker is released and the consumed pair from step 7 is present; **and the log carries the terminal row and nothing else the pass would have appended later — no §8.3 effectiveness table and no failure-mode record** (§10.2 order 3: step 11 never ran). That negative is asserted on the same path as AT-M9's positive and is the paired half of it: without it, an implementation that emitted a table on every pass regardless of where it terminated passes both rows. The report-body assertion is what separates this row from AT-M4's `advisory-model-unresolved`, and is required until the erratum's `advisory-dispatch-failed` row exists |
| AT-M6b | operator | a pass `refused` at step 6 — the marker held and fresh (§12.1 S-09) | the pass ends | the log carries **exactly one** appended record, its terminal row: **no** effectiveness table (step 11 never ran) and **no** consumed pair (§4.4). The `refused` arm of §10.2 order 3's negative, which no other row asserted; AT-M1 covers the same Given's status and reason code, this row covers what the pass did **not** append |
| AT-M7 | operator | a primary rung that fails a model-resolution check and a fallback that resolves (§2.6 row 2) | the pass runs | the pass **proceeds** to a non-`failed` terminal status; the report body contains the `ADVISORY_MODEL_FALLBACK:` line **verbatim**; and `rung:` names the **fallback** rung. All three conjuncts are required: a silent downgrade passes any two of them taken alone, and this is the only test in §13 that can fail on a pass that records the primary rung while running on the fallback |
| AT-M8 | operator | a primary rung that resolves (§2.6 row 1) | the pass runs | `rung:` names the **primary** rung and the report body carries **no** `ADVISORY_MODEL_FALLBACK:` line — the paired negative that stops AT-M7 from being satisfied by a pass that always reports the fallback |
| AT-M9 | operator | a pass whose step-8 dispatch succeeds and whose **step-13 proposal-authoring** dispatch returns `{kind: "dispatch-error"}` (§2.6 row 4 after step 8), with one proposal already routed and one not | the pass ends | terminal `failed` with **no** reason code (§12.1 S-11c); the §8.3 effectiveness table **is** appended (step 11 completed); exactly **one** failure-mode record is appended — for the routed proposal, none for the unrouted one; the §5.4 commit runs and the already-made append is durable in it; the marker is released; the report body carries the error message verbatim **and** the routed/unrouted split. Distinct from AT-M6, whose Given fails the **first** dispatch and therefore has no table and no records to leave behind |
| AT-M10 | maintainer | `resolveAdvisoryRung` after §15.3's signature widening, called **without** a `skill` argument — the shipped call site at `pdlc/workflows/orchestrate-dev.js:3132` unchanged | the resolver dispatches | the dispatched skill is `ADVISORY_RUNG_SKILL` (`"se-review"`, `:1797`) on both ladder rungs and on the memoised path, and every observable of the existing call site is unchanged. This is the regression test for the one edit this feature makes to already-shipped behaviour (§15.3, §14.1 T-05); the pass's own call, which passes a `skill`, is covered by AT-M4/AT-M6/AT-M7 |

### 13.4 Routing, writes and the commit (§5)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-R1 | operator | a promotion targeting `pdlc/hooks/scripts/nudge-consolidation.sh` | routing runs | it takes the **PR** route — the predicate is set-equal to `MERGE_GUARD_DEFAULTS`, not a subset |
| AT-R2 | operator | a promotion targeting `docs/_constraints/DOMAIN-CONSTRAINTS.md` | routing runs | it is appended in the invoking tree and is inside the §5.4 commit |
| AT-R3 | operator | an invoking tree on a `feat-*` branch with a partially staged index | a pass runs to a terminal outcome | HEAD and branch are identical before and after; the commit contains **exactly** the §5.4 pathspec; the pre-staged files are not swept in |
| AT-R4 | operator | git refuses the commit after the lock retries | the pass ends | the terminal status is unchanged, `writes-uncommitted` is recorded, and the writes remain correct on disk |
| AT-R5 | operator | a pass whose working tree already matches (nothing to stage) | the commit runs | no failure and no `writes-uncommitted` — the empty stage is a return, not a warning |
| AT-R6 | operator | an AC-2.2 promotion with `phase = P` and `artifact = pdlc/skills/se-author/SKILL.md`, run against (a) a tree with no such decision file and (b) a tree already carrying one | routing and the write run | the path is `docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md` in **both** runs — the §5.2 derivation is a pure function of the two keying fields, so the topic is stable across passes; in (a) the file is created, in (b) it is **appended to**, never replaced; the write is in the invoking tree and inside the §5.4 commit; the route is never the PR route. AC-2.2's target is a different path with a derived segment and does not share AT-R2's fixture |
| AT-R6b | operator | **five fixtures — five separate passes over five separate logs**, each one pass at `phase = P`, named by the §5.2 kinds they merge. Fixtures 3, 4 and 5 share one subject and one phase and so derive one id; they are not one pass, and building them as one would collide all three merges onto a single record and make the per-fixture assertions below unstateable. **(1) Siblings, both AC-2.2:** subjects `pdlc/skills/se-author/SKILL.md` and `pdlc/skills/te-review/SKILL.md`. **(2) Colliding subjects, both AC-2.2:** `pdlc/skills/a-b.md` and `pdlc/skills/a/b.md`, two paths that slug to one id under §8.1. **(3) Kinds 1 + 3 over one shared subject:** `pdlc/workflows/orchestrate-dev.js` — a guard-set path (`MERGE_GUARD_DEFAULTS`, `pdlc/workflows/orchestrate-dev.js:48-53`) — proposed both as a process learning (kind 3, `target` = that file itself) **and** as an AC-2.1 domain invariant about it (kind 1, `target` = `docs/_constraints/DOMAIN-CONSTRAINTS.md`). One subject path, not two: the merge trigger here is key identity, not slug collision, so no tie-break is in play. **(4) Kinds 2 + 3 over the same one shared subject:** the same process learning **and** an AC-2.2 architectural decision about it (kind 2, `target` = `docs/_decisions/DECISIONS-{failure-mode-id}.md`). **(5) Kinds 1 + 2 over the same one shared subject:** the AC-2.1 invariant **and** the AC-2.2 decision | routing and the writes run | in the sibling fixture the two promotions write **two distinct** files, one per subject — the withdrawn basename derivation would have written one, so this is the row that falsifies it. In the colliding fixture the two are **one** promotion under §8.2's intra-pass uniqueness rule, and the assertion is that merge's exact observable set: **one** failure-mode record for the id, **one** `symptom`, **one** `target`, **one** file written — **and no** `duplicate-suppressed` reason code and **no** `suppressed-by:` entry, because nothing was withheld and there is neither a PR nor an enacting `passId` to name (§8.2, §6.4). The negative half is the half this fixture exists for: an implementation that reported the merge as a suppression would be indistinguishable, in the log, from one that dropped a promotion. Fixture 2 additionally asserts **which** path survives, not merely that one does — §8.2's subject tie-break makes the surviving `artifact` the **lexicographically first** canonical path, here `pdlc/skills/a-b.md` (`-` = 0x2D precedes `/` = 0x2F). Both sides here are kind 2, so this fixture asserts the `artifact` half only; the `target`-follows half needs a two-process-learning colliding merge and is PROPERTIES-owned per DEC-LAYER-01 (§8.2's third note; §14.5 LD-2, which also carries the >2-candidate elided set). Without that literal an implementation picking either path passes, and BR-35a's file-existence test then runs on an undetermined subject two passes later (AT-F17 / AT-F18). Fixture 2 also asserts the **compensation**: the report body names the elided subject path `pdlc/skills/a/b.md` beside the surviving `artifact` (§10.4 item 4's subject-axis clause). That conjunct is what stops the loss being silent — a merge that drops a canonical path and reports nothing is, from the log alone, indistinguishable from a pass that never saw it. Fixtures **3, 4 and 5** each merge one promotion out of two kinds and assert §8.2's kind-precedence rule, one ordered pair each. **(3) kinds 1 + 3:** the single `target` is `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `route` is `constraints`, **no** guard-set path is written and **no** PR is opened (the process learning's own `target` would have taken the PR route, and precedence removes it). **(4) kinds 2 + 3:** the single `target` is `docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route` is `decisions`, and again **no** guard-set path is written and **no** PR is opened — this is the rank-2 half of §8.2 consequence 2's "a mixed-kind merge never takes the PR route", which nothing else asserts; an implementation whose rule is "constraints wins, otherwise keep whichever proposal arrived first" is green on every other row in §13 and red only here. **(5) kinds 1 + 2:** the single `target` is `DOMAIN-CONSTRAINTS.md` and `route` is `constraints` — **no** `DECISIONS-*` file is created or appended, which is what pins the (1, 2) ordering rather than leaving it inferred from the other two. On all three, the one `symptom` names **both** failure modes and the report body names the elided kind (§10.4 item 4). The three together range over **every** pair the three-member order admits — (1,3), (2,3), (1,2) — so a deleted or transposed rank fails at least one of them; sampled at one pair, the enumeration is not covered. Fixtures 1 and 2 cannot see any of that: their kinds coincide by construction, so their "one `target`" conjunct is satisfied vacuously and an implementation with no precedence rule at all passes them. Distinct from AT-R6, whose Given is one promotion across two trees; and distinct from AT-Q10, whose Given is the **cross-pass** suppression §8.1's collision table prices |

### 13.5 The PR route and idempotence (§6)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-Q1 | operator | `pluginRepository` resolving to the current repository | a guard-set promotion is made | the edit is committed in a separate clone under a temporary directory cut from the fetched default branch; the invoking tree sees no branch operation |
| AT-Q2 | operator | three promotions in one pass sharing one PR | the PR is opened | there are three commits, each with a distinct `PDLC-PROMOTION-ID: {id}:{action}`, and `PDLC-CONSOLIDATION-PROMOTIONS` is **set-equal** to those three pairs |
| AT-Q3 | operator | a proposal whose `(id, action)` pair is on an **open** PR | the pass runs | nothing is opened; `duplicate-suppressed` names the pair and the PR in `suppressed-by:`; `pr:` stays empty; that PR is not amended |
| AT-Q4 | operator | the same pair on a **closed-unmerged** PR | the pass runs | the proposal is re-opened as a new PR — a rejected proposal is re-proposable |
| AT-Q5 | operator | a merged `promote` PR for an id, and that promotion now `ineffective` | the pass proposes a remediation | the `revise` or `retire` proposal is **not** suppressed by the merged `promote` |
| AT-Q6 | operator | the remote head branch `consolidation/{passId}` already exists | the PR is attempted | reason code `branch-exists`, the fallback proposal file carries the full diff, and the existing branch and any PR for it are named |
| AT-Q7 | operator | a pass that opens a PR, with the **three enumerated seam domains of §6.5** — the PR seam, the git seam in the invoking tree, and the git seam in the §6.1 clone — each behind its own spy recording the **resolved verb** of every call routed through it, including calls made through a generic entry point (a `_gh([…])` argv, a shell string, a URL built at runtime), classified by the operation performed rather than by the function name it was called under (§6.5: `checkout -b` and `switch -c` in the clone both resolve to `create-branch`) | the pass returns | three assertions per domain, all required. **(1) Containment, on every domain:** observed ⊆ that domain's permitted set (§6.5's obliged ∪ permitted columns) — which alone falsifies every merge verb. **(2) Obligation, on this PR-opening Given:** the obliged column is present — `{read-pr, create-pr}` on the PR seam, `{add, commit}` in the invoking tree, `{clone, create-branch, add, commit, push}` in the clone; `fetch` and the non-mutating reads (`read-branch`, `read-status`) are permitted and their presence or absence is not asserted either way, on any domain. **(3)** the PR is in state `open` — not `merged`, not `auto-merge-enabled` — after the pass returns. Containment plus obligation is what makes the oracle both passable and strong: a pooled domain, or a set-equality asserted universally, is red on a conforming pass (a pass with no guard-set proposal observes `∅` on two of the three domains; §5.4, §6.1 and §6.2 all oblige git verbs), while an absence-only "no merge call exists" is satisfied vacuously by a pass that makes no calls at all, is satisfied by a renamed route, and cannot see a merge issued through a generic seam. Comparison is over **sets**, not multisets: AT-Q2's three commits are three occurrences of one verb |
| AT-Q7b | maintainer | the pass's source at HEAD | it is inspected | no merge or enable-auto-merge call appears on any path. This is a **supplementary** check that adds a static direction to AT-Q7's runtime oracle; it is never the sole evidence for AC-3.7, and §6.5 control (b) is asserted through AT-Q7, not through this row |
| AT-Q7c | operator | a pass that terminates **`promoted`** (§12.1 S-02) with **no** guard-set proposal — every promotion routes to the consuming repo and the §5.4 commit is made — under the same three spies | the pass returns | the containment assertion (1) holds on all three domains, with the PR seam and the clone seam observing `∅` and the invoking tree observing a set **bounded on both sides**: it **contains** `{add, commit}` (§6.5's obliged column for that domain, which this Given obliges) and is **contained in** `{add, commit, read-branch, read-status}` (its permitted set). That is containment, not equality, in both directions and on every domain — the read verbs are permitted and neither their presence nor their absence is asserted. **No** obligation is asserted on the two empty domains. The Given is pinned to a `promoted` pass on purpose: a pass that promotes nothing observes `∅` everywhere and would satisfy a containment-only reading vacuously, leaving the row with nothing to falsify. This is the row that pins the universal rule as containment: an implementation of AT-Q7's oracle that asserted set-equality universally is red here on correct behaviour, and one that asserted `= {add, commit}` in the invoking tree is red on a conforming pass that reads its branch name through the git seam (§6.5) |
| AT-Q8 | operator | the PR API failing with a network, rate-limit or 5xx error | the PR is attempted | reason code `api-failure` with the API's status text recorded verbatim; the fallback proposal file carries the full diff; the pass does not halt. Distinct from AT-Q6's `branch-exists` Given: E-23 and E-24 are different failure classes and each names a different reason code |
| AT-Q9 | operator | a pass that opened a PR and recorded its promotion on an invoking branch which is then **deleted without merging** | the PR is read, and a later pass runs | the PR and its `PDLC-CONSOLIDATION-PROMOTIONS` trailer survive the branch's loss and still suppress a duplicate proposal (NFR-4); the later pass re-mints the promotion's effectiveness record from scratch, exactly the §5.5 cost, and reports it rather than pretending the record was never lost |
| AT-Q10 | operator | a proposal for `docs/_constraints/DOMAIN-CONSTRAINTS.md` whose `(failure-mode-id, action)` pair is already carried by a prior pass's §8.1 failure-mode record with `route: constraints` — the `enacted` arm of §6.4's consuming-repo carrier | the pass runs | **nothing** is appended to `DOMAIN-CONSTRAINTS.md` for it (the file's bytes are unchanged); `duplicate-suppressed` is recorded and `suppressed-by:` carries **exactly one** entry whose literal text is `{failure-mode-id}:{action} → pass:{enacting passId}` — §10.3's consuming-repo spelling, not a URL and not a bare id; `pr:` is **empty**, since no PR is involved on this route. All three conjuncts are required — an implementation that suppressed the append but recorded nothing is indistinguishable from one that never derived the proposal |
| AT-Q11 | operator | the same proposal with **no** matching record in the log — the `absent` arm — in a pass that is then re-run over an unchanged corpus | both passes run | the first pass appends **exactly once** and writes its failure-mode record with `route: constraints`; the second pass suppresses, and `DOMAIN-CONSTRAINTS.md` is **byte-identical** after the second pass to what it was after the first. The byte-identity assertion is the one this row exists for: it is the only oracle that fails an implementation which never consults the log and re-appends on every run — the exact failure §6.4's second carrier was added to prevent |
| AT-Q12 | operator | a prior pass's failure-mode record for a pair with `route: degraded` — the promotion reached nothing but `CONSOLIDATION-PROPOSAL-{passId}.md` (§6.3, §7.3) — and a later pass deriving the same pair | the later pass runs | the pair reads **`absent`**, not `enacted`: the promotion is re-proposed and, where it can now be applied, appended. A record's existence alone must not suppress; only a landed `route` does. This row is the consuming-repo mirror of AT-Q4's closed-unmerged PR |

### 13.6 Credential (§7)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-K1 | operator | no `credentialEnv` variable and working local `gh` auth | a pass runs | the row records `credential: local-gh` and the PR route is attempted |
| AT-K2 | operator | neither a credential variable nor `gh` auth | a pass runs | `credential: absent`, reason `credential-unavailable`, the §6.3 fallback fires, the promotion appears under the `degraded` route, and the pass does **not** halt |
| AT-K3 | operator | a pass that promoted nothing else and degraded its only promotion | the pass ends | terminal `no-op` — never a bare `promoted` |
| AT-K4 | operator | a credential present but rejected by the repository | a pass runs | `credential: present (redacted)` **and** reason `credential-unavailable` — the two fields are not collapsed |
| AT-K5 | maintainer | any pass on any path | every artifact and the report body are searched | the credential value appears in none of them, and the row carries exactly one `credential:` value from the closed set |
| AT-K6 | operator | **six** rows, spanning every shape §10.3's three readings admit: (i) a pass `refused` at step 6 (§12.1 S-09), (ii) a `no-op`/`promoted` pass whose proposals were all consuming-repo ones so no PR route was attempted, (iii) a pass `failed` at step 8 (S-11 / S-11b) that never reached a PR-route attempt, (iv) a pass `failed` at step 12/13 (S-11c) that **did** attempt the PR route and resolved nothing, (v) a pass `failed` at step 12/13 that never attempted it, and (vi) AT-K2's genuine finding on a `promoted-degraded` row | the rows are read | **all six** carry `credential: absent`. Rows (i)–(ii) carry no `credential-unavailable` and are read "not attempted"; row (vi) carries it and is read "attempted and found nothing"; rows (iii)–(v) are `failed` and carry **no** `credential-unavailable` — asserted as an absence in its own right, since vocabularies §1 at `Version` 1.4 bars the code from a `failed` row and recording it would breach REQ §4b (AT-L5). Rows (iv) and (v) are indistinguishable **in the row** and are distinguished **in the report body**: (iv)'s §10.4 item 4 names a degraded promotion with the `credential-unavailable` failure class and (v)'s does not. Asserted in both directions, and the (iv)/(v) pair is the one this row exists for — an implementation that keyed the reading on `status:`, or that emitted the reason code on a `failed` row to make it decidable, fails on it |
| AT-K7 | operator | a pass with **≥ 2** promotions of which exactly one hits a §6.3 failure class | the pass ends | terminal status is verbatim **`promoted-degraded`** — neither `promoted` nor `no-op` — the landed promotions carry their observables (`pr:` populated, their ids in the log), and the failed one appears under the `degraded` route naming its failure class. This is the only test asserting the partial-success status behaviourally; AT-L5 sees the string, not the behaviour |

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
| AT-F15 | operator | a **constructed** corpus fixture: a LEARNINGS whose §5 Open Item carries one `failure-mode-id` line byte-equal to one of three recorded promotions' ids, the other two recorded promotions being unnamed by any corpus file | a pass consumes it | the verdict is `recurred` for **exactly** the named promotion, and is decided on the other two by §8.3's remaining arms without reference to the id. This is a **receive-side** test and is stated as one: the producing side (a harvest agent placing the id) is an LLM invocation with no reproducible output, is therefore untestable here, and is carried as O-C6 rather than claimed by this row |
| AT-F16 | operator | a LEARNINGS carrying a `failure-mode-id` that matches **no** record in the log | a pass consumes it | it is reported as a parse notice and contributes to **no** verdict; no promotion is invented for it and the pass does not abort |
| AT-F17 | operator | an `ineffective` promotion with no spent alternative, whose **subject** `artifact` **exists** at the pass's HEAD (§8.5 row 3) | the remediation is chosen | `revision` is proposed and the report field names `revision`. Run twice over one fixture, the choice is identical — the predicate is a file-existence test, so it carries no free-text match |
| AT-F18 | operator | an `ineffective` promotion with no spent alternative, whose **subject** `artifact` has been **deleted** since the promotion landed (§8.5 row 4) | the remediation is chosen | `retirement` is proposed — there is nothing left to revise — and the report field names `retirement` |
| AT-F19 | operator | a **constructed** `.consolidation-log.md` fixture spanning **all four arms** of §8.4 step 1's predicate in one run: id `A` with a `retire` record at `route: constraints` (a landed retirement), id `B` with a `retire` record at `route: degraded` (proposal only), id `C` with `promote` records only, and id `D` with a `revise` record only | the pass computes the open-promotion list it hands to the harvest prompt (§8.4 step 1) | the computed list is **set-equal** to `{B, C, D}` — both directions, and set-equality rather than containment is the whole point of the row: an implementation returning every id ever recorded satisfies containment, and that degenerate list is the *limit* O-C7 accepts, never the implementation. `A` absent is what pins the `route != degraded` conjunct an implementation drops by closing an id on any `retire`; `B` present is what pins that a `degraded` retirement does not close one — the arm whose loss shrinks the list silently and produces the missed recurrence and false `prevented` §8.4 and O-C7 both refuse. The list's **length** is asserted in the report body (§10.4 item 10) as the **literal `3`** — the cardinality of `{B, C, D}` on this fixture — not merely as present: a report emitting a constant, or the count of every recorded id (`4` here), satisfies presence and is exactly the drift item 10 exists to make legible before it truncates a prompt. This is a pass-side arithmetic test over a file fixture with no agent in it, which is what §8.4 step 1 means by "testable at this layer" |
| AT-F20 | operator | one pass writing failure-mode records on **each** of the three §5.2 kinds — a process learning, an AC-2.2 decision and an AC-2.1 domain invariant — plus one `degraded` record (§6.3 fallback) | the appended records are read | each record's **field-name set** is **set-equal** to §8.1's eight names (`failure-mode-id`, `phase`, `symptom`, `artifact`, `target`, `passId`, `action`, `route`) — no field missing on any kind and no ninth field invented. Both directions are load-bearing: a dropped `target` or `route` on one path is otherwise invisible until §6.4's consuming-repo carrier misreads it two passes later, and an extra field would be a record shape §8.1 is said to be normative for. This asserts the record's **shape**; its serialisation is TSPEC's (§14.1 T-01) |
| AT-F21 | operator | a **constructed** `.consolidation-log.md` fixture carrying two short records written by an earlier pass — one for id `E` whose record is **`action: retire`** missing `route` (the field §6.4 and §8.4 step 1 index, and `retire` is the action on which the missing value decides both readers) and one for id `F` whose record is **`action: promote`, `route: degraded`** and is missing `target` (the field §5.1 and §8.6 index) — plus one well-formed record for id `W`, **`action: retire`, `route: constraints`** (a landed retirement, so `W` is closed by BR-33c and the expected open set below is a literal, not a description). Every field each reader indexes is pinned on all three records: `F`'s `action` and `route` are stated because BR-25 and BR-33c decide `F`'s downstream state from them, and `route: degraded` is what makes §6.4 read the pair `absent` so the re-derivation is live rather than suppressed. **All three records carry a `passId`**, pinned present: §6.4 indexes that field only to spell the evidence of a suppression its predicate has already decided (§6.4, §8.1's reader row), so pinning it keeps conjunct (5) decidable and keeps this fixture on the two arms it does cover — the short-`passId` arm is deliberately **not** exercised here and is PROPERTIES-owned per DEC-LAYER-01 (BR-33a, E-12b). The same pinning and the same scoping hold for `phase`, `failure-mode-id` and `symptom` — all three are **pinned present on all three records**, and their arms are deliberately not exercised here (TE v9 Q-02): this fixture stays at two arms rather than growing a fourth short record, so the `phase` arm's one home is §8.1's reader table for the rule and §14.5 LD-5 for the fixture, never both here and there. The fixture runs in a later pass that derives a `retire` proposal for `E` (the same pair `(E, retire)`, so §6.4's carrier is actually consulted) and re-derives `F`'s promotion | the pass runs to a terminal status | **five conjuncts, all required, on one path.** (1) The pass reaches its terminal status and does **not** halt — the negative BR-33a states, asserted beside a positive so it is not an absence-only oracle. (2) A parse notice is reported **naming each short record** (id and the missing field), in the §10.4 report body. (3) The positive downstream state, asserted for **both** short records. For `E`: its `retire` proposal is **re-proposed**, not suppressed — §6.4 reads `absent` on a record it cannot index (BR-25) — and `E` is **present** in the open-promotion list §8.4 step 1 computes, asserted as a set-equality over this fixture's ids in AT-F19's form, not as containment: the expected set is the literal **`{E, F}`** — `E` open because §8.4 step 1 cannot index its missing `route` and leaves the id open, `F` open because it carries no `retire` record, `W` **excluded** because its `retire` at `route: constraints` is a landed retirement BR-33c closes on. For `F`: the missing field is `target`, so the assertion is scoped to what a missing `target` actually blocks — **§8.6 routes no remediation for `F`, and no `target` is guessed for it on the stored record** (§8.1's reader table, the §8.6 row). The pass's re-derived promotion for `F` is a *fresh* proposal whose `target` is a function of its kind (§5.2) and is not missing, so it routes and writes normally; nothing about the short record suppresses it, which is exactly what `route: degraded` on that record pins via BR-25. (4) The log's **bytes for both short records are unchanged** after the pass — no guessed default is written back, no in-place repair, which §10.2's append-only grammar forbids independently. (5) The well-formed record is unaffected: its contracts all run. **Which conjunct catches which prohibited behaviour**, stated exactly because the mapping is not symmetric: a halt on `undefined` is red on (1); a **non-`degraded`** default on a `retire` record — `route ?? "constraints"`, or any value outside `degraded` — is red on (3), because BR-33c then *closes* `E` (dropping it from the open list) and BR-25 then reads the pair `enacted` (suppressing the re-proposal), which is the unsafe direction §8.4 refuses; a silent rewrite is red on (4). The fourth reachable default, `route ?? "degraded"`, is **not** unsafe on either reader — it leaves `E` open and the pair `absent`, the same outcome the skip rule produces — so it is caught by (2) alone, as an implementation that defaults silently instead of reporting the notice. Like AT-F19 this is a file-fixture test with no agent in it |

### 13.8 Advisory corpus (§9)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-A1 | operator | `docs/_queue/ESCALATIONS.md` absent — the state at HEAD | a pass runs | reason `no-advisory-corpus`; **no** seam proposal of any kind; the rest of the pass proceeds normally |
| AT-A2 | operator | the file present with zero entries | a pass runs | reason `advisory-corpus-empty`; no over-escalation candidate and no widening proposal |
| AT-A3 | operator | a stock repo with the tier never run | a pass runs | it does **not** propose widening all five `ADVISORY_SEAMS` |
| AT-A4 | operator | a corpus where seam A escalated across two distinct features and strictly more often than every other seam | a pass runs | A is surfaced as an over-escalation candidate |
| AT-A5 | operator | two seams tied on the highest total | a pass runs | no over-escalation candidate; the tie is reported |
| AT-A6 | operator | a non-empty corpus in which seam B has escalations from no feature and another seam has some, run twice: once with the entries' `Feature` values **disjoint** from the pass's consumed set, once with them **matching** it | a pass runs | the widening verdict for B is **identical** in both runs — a widening is proposed, never enacted; a `pdlc/workflows/` default routes as a PR, a consumer-config value is reported as an operator action. The disjoint/matching pair pins §9.2's population: an implementation that filtered escalation entries by the consumed set would disagree between the two runs |
| AT-A7 | operator | an entry whose `Feature` row is missing | the corpus is counted | that entry is skipped with a parse notice; no count is attributed to a guessed key; the read does not abort |

### 13.9 Reporting and configuration (§10, §11)

| ID | Who | Given | When | Then |
|---|---|---|---|---|
| AT-L1 | operator | a pass that opened a PR and suppressed another proposal | the row is read | `pr:` carries this pass's PR and `suppressed-by:` carries the suppressed pair — both present, neither merged into the other |
| AT-L2 | operator | a pass that opened nothing and suppressed everything | the row is read | `pr:` is **empty**; the evidence is in `suppressed-by:`; terminal `no-op` |
| AT-L3 | operator | any pass other than `skipped-cadence` | the pass ends | exactly one log row is appended and one report body returned; no earlier record was edited in place |
| AT-L4 | operator | a report with no promotions | the body is read | the promotions section is present and explicitly empty — omission is a failure |
| AT-L5 | maintainer | the values of the **enumerated-class fields only** (§10.3's first class: `status:`, `trigger:`, `reason:`, `credential:`, the `promotions:` route names, and the per-promotion verdict / state / action / phase values), collected across a fixture set that exercises every §12.1 scenario | they are compared to vocabularies §1 at `Version` 1.4 | the two sets are **equal** in both directions. The **free-form class is excluded by name** (`pass:`, `date:`, `consumed:`, `branch:`, `deferred:`, `pr:`, `suppressed-by:`, `rung:`) — a URL, a date, a branch and a model id are data, and comparing them to §1 would make the test red on a correct implementation. Both directions are load-bearing and neither may be dropped when the domain is narrowed: **no enumerated value without a §1 row** (catches an invented status), **and no §1 row unused across the fixture set** (catches a deleted branch, which is why the fixture set must span §12.1 rather than one happy path) |
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
| T-02 | The bundle's row in `pdlc/workflows/dist/distribution-manifest.json`, its entry in `build-runtime.mjs`, and — explicitly — **how the consolidation bundle reaches `resolveAdvisoryRung`**. The runtime forbids `import`, and the shipped precedent reaches across modules only by inlining the whole module (`bundles`, `build-runtime.mjs:448-471` — the array opens at `:448` and its closing `];` is `:471`: the queue bundle is `[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY].join(…)`, the dev bundle likewise carries `devModule`, and `pdlc-cli.mjs` wraps it as `__dev` (`:291`) — verified at HEAD). TSPEC must state which it takes, because the choice decides whether the consolidation bundle inherits `orchestrate-dev`'s module-level constants and how far a drift in the widened resolver reaches: **three** tracked artifacts carry `resolveAdvisoryRung` today (§15.3), each with its own `distribution-manifest.json` row, and inlining makes the consolidation bundle a **fourth** | REQ §5: the pass ships as a workflow script beside the skill, in the `orchestrate-queue` shape |
| T-03 | How the §6.1 temporary clone is created, located and removed | AC-3.8: no branch operation in the invoking tree; the clone is cut from the fetched default branch |
| T-04 | The injected seams for file IO, git and the PR API, **and the capture of the resolver's `_log` stream**. `ADVISORY_MODEL_FALLBACK:` is emitted through `_log` (`orchestrate-dev.js:1858-1860`, the template literal at `:1859`) and never appears in the resolver's return value, so §10.4 item 2 and AT-M7 are unsatisfiable unless the pass passes a `_log` it can read back. The **same** obligation carries §2.6 row 4's error message (AT-M6, AT-M9): both are report-body assertions over text the pass does not otherwise hold, and one capture serves both. What TSPEC chooses is the mechanism (a collecting `_log`, a tee, a buffer), not whether the capture exists | every one must be `await`ed (CLAUDE.md, runtime-adapter contract); §10.4 items 2 and 4 are the assertions that depend on the capture |
| T-05 | The `resolveAdvisoryRung` call site, its `rungState` threading, **and the shape of the signature widening §2.6 item 2 requires**. The widening is constrained here and TSPEC chooses only its spelling: the new `skill` parameter is **optional and defaults to `ADVISORY_RUNG_SKILL`** (`orchestrate-dev.js:1797`), so **every existing call site is unchanged with no edit** (AT-M10 is the regression); it is threaded to the one `_agent` call (`:1841`) and to the memoised path (`:1844-1849`) alike, so a pass cannot resolve on one skill and dispatch on another; and **exactly one ladder remains** — no second constant, no second resolver, no per-caller model list. TSPEC must also state the deadline question §2.6 leaves open: the shipped call site races the resolver against a wall-clock deadline and dispositions a fifth shape, `{kind: "preempted"}` (`:3130-3134`), which is that call site's, not the resolver's; this pass has no seam budget and calls the resolver **bare**, so §2.6's four rows stay set-equal to the resolver's own return and throw set, and a hung dispatch is bounded only by the runtime's no-progress watchdog (recoverable through §4.2's stale-lock reclaim) | §2.6: reuse, never restate, the two constants; §15.3 lists the edit and its bundle rebuild |
| T-06 | The parse implementation for `ESCALATIONS.md` entries | §9.2: read the metadata table rows, never the heading |
| T-07 | The `.gitignore` pattern's exact text | §4.1: root-relative, contains a separator, never slash-free or `**/`-prefixed |
| T-08 | Whether the corpus enumeration is shared code with `nudge-consolidation.sh` or two implementations held equal by test | §3.1 requires one corpus and one predicate; it does not require one implementation. Whichever is chosen, AT-P7 is the differential form and stands |
| T-09 | **At least one property strategy per parameterisable component**, over and above §13's examples — the mechanism (generator shape, shrinking, library) is TSPEC's and PROPERTIES', the obligation is not | §13 covers all four components with hand-picked examples only, and an example set cannot range over an input space. The four components and the invariant each must be tested against are named below; TSPEC may not discharge T-09 by citing the existing ATs |
| T-10 | **The spellings of the "unavailable" observables**, collected here so a downstream author finds them in one place rather than only at the point each arises: §8.3's unavailable **path** cell and, from §8.1's **§8.4 steps 2–3** reader row, the **unavailable-half rendering** — the question is still put to the harvest agent on the fields the record does carry, with the missing half stated as unavailable rather than guessed; §10.3's `suppressed-by:` unavailable-`passId` rendering (a rendering of the second spelling, not a third form) and §6.4's statement of the same; and §6.5's seam permitted-set widening. **§8.1's `phase` and `failure-mode-id` arms are deliberately not here** (SE v10 F-01, TE v10 M-01): neither produces a rendering for TSPEC to spell. A `phase`-short record's §8.3 row carries the verdict `insufficient-evidence` — a **§15.2 lexicon value this document pins**, and §10.4 item 5 fixes what that row renders — so treating it as an unavailable literal would take the row out of §8.7's `insufficient-evidence` streak and make `unmeasurable` unreachable on that path; an id-short record emits **no** row at all, so there is nothing to render. Both arms are §14.5 LD-5's, once. In every case **this layer fixes the observable and defers only the literal** | DEC-LAYER-01: the spelling of a value this document does not pin is TSPEC's, and §15.2's lexicon owns no such value. §14.5's register is PROPERTIES-owned *fixtures*; these are TSPEC-owned *literals*, and the two sets are disjoint |

The four components T-09 ranges over, with the invariant each property asserts:

| Component | Section | Invariant a property must range over |
|---|---|---|
| The two-region consumed predicate | §3.2 | for **any** interleaving of openers, closers, strays and basenames, a basename inside any `<!-- pdlc:consumed -->` block is consolidated, and the predicate is total (never throws, never omits an enumerated file from exactly one of the two sets) |
| The `passId` derivation | §2.5 | for **any** multiset of log rows, the minted id is strictly greater than every parseable id bearing `{today}`, and unparseable rows change nothing |
| The `consolidation` config parse | §11.2 | for **any** subset of keys corrupted, every uncorrupted key keeps its configured value and every corrupted one takes its documented default — per-key independence, the property `parseAdvisoryConfig` establishes |
| The `ESCALATIONS.md` count | §9.2 | for **any** entry sequence, the total attributed count is ≤ the number of entries carrying both a `Feature` and a `Seam` row, and no count is attributed to a key not present in the input |

### 14.2 Open questions — decided here, recorded for review

| # | Question | Decision | Where |
|---|---|---|---|
| O-C1 | A pass that dies at step 8 (`advisory-model-unresolved`) has already frozen its corpus as consumed without reading a body. Those files are then permanently consolidated. | **Accepted, not repaired.** The ordering is forced by vocabularies §3(a), and no §1 field exists in which a `failed` pass could record "re-consume these". Inventing a recovery channel would add an unlisted record type and breach REQ §4b. | §2.6 |
| O-C2 | Two files sharing a basename under different directories collapse to one set member. | **Reported, not repaired.** Repair needs a key the shipped predicate does not have. Newly reachable now that `docs/completed/*/` is in the corpus. | §3.4 |
| O-C3 | The marker take is read-then-write, so two passes can both observe "absent". | **Stated, bounded.** Blast radius is closed by two independent properties: every log write is a whole-record append, and NFR-4 keys on the PR trailer rather than the log. An atomic create-exclusive take is TSPEC's if the runtime offers one. | §4.5 |
| O-C4 | A promotion whose invoking branch is abandoned loses its effectiveness record and re-enters the table as if first made. | **Accepted loss**, stated in the REQ and restated here rather than closed. | §5.5 |
| O-C5 | `ESCALATIONS.md` cannot distinguish a seam that never escalates because it never runs from one that never escalates because it always succeeds. | **Honest limit**, which is why §9.5's output is a candidate for human judgment. Resolution rates are D-CONS-06. | §9.6 |
| O-C6 | `recurred` depends on a harvest agent recognising a recurrence and copying an id (§8.4 step 2). A harvest that should have attached an id and did not is invisible to the pass. | **Accepted recall limit.** The miss direction is toward `prevented` / `insufficient-evidence` — "we cannot show it worked" — never toward a false `recurred`, so the loop degrades safe. Closing it needs a producing-side check the pass cannot perform, since only the harvest sees the feature's own failures. | §8.4 |
| O-C7 | §8.4 step 1's open-promotion filter closes an id only on a **landed** `retire`, and a `retire` of a guard-set promotion lands only when an operator merges its PR — so on this repo the filter closes little, and the harvest question list grows monotonically with every promotion ever made. | **Accepted, unbounded, and recorded rather than capped.** No recency window and no cap ship: both would drop a promotion from the list silently, turning §8.4's safe failure direction (one extra question) into the unsafe one (a missed recurrence, and with it a false `prevented`). The cost is a longer harvest prompt, which is bounded by the promotion rate, not by pass count. If it becomes a real burden the repair is a **reported** cap — one that names what it elided — and that is a successor's decision, not a silent default here. **What ships now is the observation that would justify it:** §10.4 item 10 reports the list's length on every pass, so the growth is visible before it becomes a prompt truncation rather than after. AT-F19 asserts the list's contents; item 10 asserts its size is legible. | §8.4, §10.4 |
| O-C8 | An intra-pass merge of two proposals of **different** §5.2 kinds keeps one `target` by §8.2's precedence rule, so the lower-precedence kind's write never happens — a process learning merged with a domain invariant edits no skill prompt that pass. | **Accepted and reported, not repaired.** The alternative — two records sharing one `(failure-mode-id, action)` in one pass — would break the uniqueness rule NFR-4's suppression key rests on, so the choice is between losing a write and losing the key. The loss is bounded by the same rate §8.1 prices the collision at (two failure modes, one phase, one file), the content survives in the merged `symptom` (one line, still) with the per-kind detail in §10.4 item 4's report body, which names the elided kind so an operator can re-propose it by hand. Precedence runs widest-reach-first so the surviving write is never the narrower one. A merge over **colliding subjects** loses one canonical path from the record the same way, decided by §8.2's lexicographic tie-break rather than by proposal order; the compensation is the same one, not a different one — **§10.4 item 4's report body names every elided subject path beside the surviving `artifact`**, exactly as it names an elided kind, and AT-R6b fixture 2 asserts it. It is not carried by the merged `symptom`, which §8.1 pins as one non-keying line. The collision rate that bounds the loss is §8.1's. | §8.2 |

None of the eight is a blocking gap: each names what is observed, what is accepted, and — where one
exists — the deferral that carries it.

### 14.3 Questions this FSPEC raises for the operator, not for a downstream layer

| # | Question | Why it is the operator's |
|---|---|---|
| O-P1 | Whether to configure repository-side branch protection on the plugin repo | BL-05; §6.5's three controls hold without it, but the repo-side belt is not a code deliverable |
| O-P2 | Whether to enable the advisory tier so BL-01a's corpus can exist | §9.3 ships and is testable with the tier off; enabling it is a config decision with its own cost |
| O-P3 | Which branch a pass is invoked on, given §5.5's abandonment consequence | the pass never changes the branch (AC-3.8), so the choice is entirely the operator's |

### 14.4 Errata against upstream documents

Every question in §14.2 and §14.3 was raised and settled by the REQ, or is a mechanism choice the REQ
explicitly delegated. Five items are **not** of that kind: they are gaps in documents this layer
does not own, and each is routed as an erratum rather than patched here or folded into this
document's own scope.

| # | Against | Item | Why it cannot be fixed here |
|---|---|---|---|
| ER-1 | REQ (vocabularies §1, pinned at `Version` 1.4 by REQ §4b) | no row for the `rung:` field, which §10.3 carries and AC-1.5 requires the row to record | §1 is an **enumeration the REQ owns** (`pdlc-consolidation-vocabularies.md`, change control: "`REQ-pdlc-consolidation-agent` owns every section of this file"). Adding a row is a REQ-side edit plus a `Version` bump; this FSPEC works around it by putting `rung:` in §10.3's free-form class, which keeps AT-L5 green on a correct implementation but leaves the field unenumerated |
| ER-2 | REQ (vocabularies §1) | no reason code for §2.6 row 4, the resolver's `dispatch-error` return — a `failed` row with an empty reason field is legal but indistinguishable from a truncated row without opening the report body | same ownership. §2.6 states the request precisely (`advisory-dispatch-failed`, permitted with `failed`); until the row exists AT-M6 asserts the discriminator in the report body. **The shipping assumption is stated so a test author is not left guessing:** every AT in §13 is written against `Version` 1.4 as pinned in §1, and implementation does **not** wait on the erratum. If the row lands during this feature, AT-M6 and AT-M9 gain the reason-code assertion **in addition to** the report-body one (the body assertion is never dropped — it is what makes the error legible), and §12.1 S-11b/S-11c's `none` cells become that code. That is a delta the erratum's own routing carries, not a second version of the AT |
| ER-3 | REQ | AC-1.4 states two exhaustive causes of `no-op` while AC-4.3 produces a third (a pass whose only promotion degraded). §5.3 and §7.3 are reconciled **within** this document, so the FSPEC is self-consistent; the REQ's own enumeration is not | the exhaustiveness claim is the REQ's, and correcting a REQ acceptance criterion is its author's edit, not this layer's |
| ER-4 | REQ (vocabularies §1) | `credential-unavailable` — and, by the identical argument, `repository-unresolved`, `api-failure` and `branch-exists` — carries a `May accompany status` column of `promoted-degraded`, `no-op` only. §1's own **composition rule** ("a code is legal with every terminal status still reachable after the point at which it was recorded") derives a wider set: these codes are recorded at the step-13 PR-route attempt, and §12.1 S-11c makes `failed` reachable *after* that point. The column is therefore narrower than the rule that is said to derive it, and the gap is a behaviour this FSPEC introduced (S-11c), not a pre-existing one | same ownership: `Version` 1.4 is REQ-pinned and this layer does not edit §1. Consequence, stated rather than worked around: a step-12/13 `failed` row cannot carry the code, so §10.3's third reading is undecidable from the row alone and defers to the report body. **The shipping assumption is ER-2's:** every AT is written against `Version` 1.4, implementation does not wait, and if the widened column lands, AT-K6 rows (iv)/(v) gain the reason-code assertion **in addition to** the report-body one and §10.3's third reading collapses into the first two. Recording the code anyway at `Version` 1.4 is **not** an option — it would breach REQ §4b's set-equality and turn AT-L5 red |
| ER-5 | REQ (vocabularies §1) | the `suppressed-by:` row spells its value `` `{id}:{action} → PR URL` entries, or empty `` (`docs/_constraints/pdlc-consolidation-vocabularies.md:63`, verified at HEAD), which admits **only** the PR carrier. NFR-4's second carrier — a prior pass's §8.1 failure-mode record with `route != degraded` (§6.4) — has no PR to name, so a consuming-repo suppression is unspellable in §1's grammar. §10.3 states the second spelling (`pass:{passId}`) because a route the REQ itself obliges to be idempotent must be recordable; §1 should be widened to `` `{id}:{action} → {evidence}` `` with the two carriers enumerated | same ownership: `Version` 1.4 is REQ-pinned and this layer does not edit §1. **Why this is routed rather than absorbed by §10.3's free-form class:** the class rule exempts a *value* only where §1 defines no grammar for it, and here §1 does define one — so the exemption would be asserted over a case §1 did not leave open, and two documents would state incompatible grammars for one field with the un-owned one read first. The **field name** `suppressed-by:` does have a §1 row, which is what keeps AT-L5 exact (§15.2), but the value grammar is now a stated divergence, not an omission. **The shipping assumption is ER-2's:** every AT is written against `Version` 1.4, implementation does not wait, and AT-Q10 asserts §10.3's `pass:{enacting passId}` spelling today. If the widened row lands, §10.3's field table and BR-26 restate §1 verbatim instead of extending it, and **no AT changes today** — but "no AT changes" is not the permanent answer, and the delta is spelled here as it is for ER-2 and ER-4: AT-L5 compares field **names**, so values are outside its domain at `Version` 1.4; once the value grammar is vocabulary-owned, a **value-level** check over `suppressed-by:`'s two spellings becomes available to AT-L5 (or to a sibling row), and AT-Q10's literal-text conjunct becomes an assertion against §1 rather than against §10.3 alone. Values staying outside AT-L5's domain is a consequence of the erratum being open, not a non-goal |

Nothing is recorded against `docs/_constraints/pdlc-advisory-corpus-baseline.md` at `Version` 1.0.
Its §3 "reuse the resolver" instruction is satisfiable as written once §2.6's reading is taken — the
pass reuses `resolveAdvisoryRung` at a **new call site** with its own `rungState`, which is reuse of
the exported function, not of a shipped call pattern — so the earlier reading that treated it as an
upstream defect is withdrawn.

### 14.5 Layer deferrals — the register of PROPERTIES-owned obligations

`DEC-LAYER-01` (`docs/_decisions/DECISIONS-spec-layer-boundary.md`) puts fixture construction and
set-equality domains below this layer: where this FSPEC states an observable but claims no §13
fixture for it, the obligation is **PROPERTIES-owned**, named at the point it arises. Named at the
point it arises, it is also discoverable only from that point — so every such deferral is collected
here, once, in the form the downstream author needs: what is owed, where its observable is stated,
and what a defective implementation does. This register is **set-equal** to the deferrals this
document names; a deferral added later is a row added here, and a section that names one without a
row is a defect of this table. **The scope is PROPERTIES-owned deferrals only, and deliberately so**
(TE v9 Q-01): the *spellings* this document defers to TSPEC under the same `DEC-LAYER-01` — §8.3's
unavailable-path cell and §8.1's §8.4 steps 2–3 unavailable-**half** rendering, §10.3's
`suppressed-by:` unavailable-`passId` rendering, §6.4's — and §6.5's seam permitted-set widening are
**§14.1's, collected there as T-10**, not this table's: they are deferrals of a *literal* to the
layer that pins literals, not of a fixture to the layer that writes fixtures. **The `phase` and
`failure-mode-id` arms are this table's alone** (LD-5), not both registers' (SE v10 F-01, TE v10
M-01): neither renders an unavailable literal — the first carries the pinned §15.2 verdict
`insufficient-evidence`, the second emits no row — so there is no spelling for T-10 to own. Between
the two registers, every deferral this document makes has exactly one home, and the two are disjoint
on their members as well as in their kinds.

| # | Obligation deferred to PROPERTIES | Observable stated at | A defective implementation |
|---|---|---|---|
| LD-1 | The `artifact` arms of §8.1's reader rule — **three readers, three distinct arms**, per BR-33a's "sharing a reader is not sharing an arm" (TE v10 L-01): §8.3 emits its row with an **unavailable** path rather than dropping it; §8.5 refuses to guess a `retirement` when the file-existence test cannot run; and **§8.4 steps 2–3 still put the promotion to the harvest agent** on the fields it does carry, with the `artifact` half stated as unavailable rather than guessed | §8.1's reader table (§8.3, §8.5 **and §8.4 steps 2–3** rows); BR-33a, E-12b | drops the §8.3 row (which reads as `insufficient-evidence` and silently moves a verdict), or proposes a `retirement` on an `artifact` it could not test, or drops the promotion from §8.4's question list (which makes `recurred` unreachable for that id and drifts it to `unmeasurable` via §8.7) |
| LD-2 | BR-33b's `target`-follows clause: a colliding-subject merge of two **process learnings**, where precedence returns kind 3 and the surviving `target` follows the surviving `artifact` | §8.2's third note; BR-33b's AT cell | keeps one proposal's `artifact` and the other's `target`, so the merged record's write touches a file the record is not about. **The >2-candidate case belongs to this row too** (SE v8 Q-02): §8.2 consequence 1 contemplates three failure modes under one key, so the elided set §10.4 item 4 must name can have more than one member, and AT-R6b fixture 2 pins only the two-candidate case — a report that names one elided path and stops is the defect |
| LD-3 | The two-action-one-subject pass: a `promote` and a `revise` over one subject at one phase are two keys, so no merge fires and **both** writes happen, the guard-set one as a PR | §8.2 (the paragraph naming it) | folds the two actions into one key and makes one write, or suppresses the guard-set write as if §8.2's consequence 2 bound it |
| LD-4 | §6.4's **`passId` arm**: a record short of `passId` still suppresses on the pair, and only the evidence spelling degrades to an explicit unavailable statement | §6.4 (the short-`passId` paragraph); §8.1's §6.4 reader row; BR-33a, E-12b | skips the contract and re-appends a constraint that already landed (an NFR-4 duplicate produced by a field outside the suppression key), or writes `pass:undefined`, or drops the `suppressed-by:` entry so the suppression is unevidenced |
| LD-5 | The four remaining short-record arms of §8.1's reader rule, each stated in the table and none carrying a §13 fixture: **`phase`** (§8.3 emits the row, verdict `insufficient-evidence`), **`failure-mode-id`** (§8.3 emits no row, since a row cannot be keyed on an absent id; §8.4 step 1's list takes no member from the record; and §8.4 steps 2–3 ask no question), **`action`** (§6.4's predicate is undecidable, so that contract skips and the promotion is re-proposed; §8.4 step 1 leaves the id open), **`symptom`** (§8.4's harvest question is still asked on the fields present) | §8.1's reader table (§8.3, **§8.4 step 1** and §8.4 steps 2–3 rows), §8.3's totality rule; BR-33a, E-12b | guesses `prevented` on a record with no `phase`, or drops the §8.3 row for it (both silently move a verdict); or mints or re-slugs an id for a record that carries none, or counts an id-less record as a member of §8.4 step 1's list, or drops its parse notice so the record vanishes without report; **or reads an `action`-short pair as `enacted`** (§6.4's predicate treated as decidable), so the promotion is suppressed rather than re-proposed; **or drops a `symptom`-short promotion from §8.4's question list** rather than asking on the fields present — the failure direction §8.1's §8.4 steps 2–3 row names |

Each row is a deferral of the **fixture**, never of the rule: the rule and its observable are stated
at this layer, which is what `DEC-LAYER-01` requires of an FSPEC before it may name a downstream
owner. None is a gap in this document's own coverage of what it owns.

## 15. Traceability

### 15.1 REQ criterion → FSPEC section → acceptance test

Every acceptance criterion of the REQ appears exactly once as a row. No criterion is unmapped, and no
row names a criterion the REQ does not carry.

| REQ | FSPEC | AT |
|---|---|---|
| AC-1.1 | §2.2, §2.3, §3.2 | AT-C1, AT-C1b, AT-C3, AT-C4, AT-C5 |
| AC-1.2 | §2.3, §3.1 | AT-C2, AT-C1b |
| AC-1.3 | §4.1, §4.2, §4.3, §4.4 | AT-M1, AT-M2, AT-M3, AT-M5, AT-K6 |
| AC-1.4 | §5.3, §8.5, §8.7, §12.1 | AT-K3, AT-L2, AT-F13 |
| AC-1.5 | §2.6, §10.3 | AT-M7, AT-M8 (the `rung:` field names the rung actually run on, asserted on both branches) |
| AC-1.6 | §2.6, §12.1 S-11, S-11b, S-11c | AT-M4 (neither resolves), AT-M6 (first-dispatch error, incl. the absent effectiveness table), AT-M6b (the `refused` arm of the same negative), AT-M9 (post-step-8 dispatch error), AT-M10 (the widened resolver's default is unchanged), AT-M7 (fallback resolves, no silent downgrade) |
| AC-2.1 | §5.2, §5.4 | AT-R2 |
| AC-2.2 | §5.2, §5.4 | AT-R6, AT-R6b |
| AC-2.3 | §5.2, §9.4 | AT-A4 |
| AC-2.4 | §5.2, §10.3 | AT-L3 |
| AC-3.1 | §5.1, §6 | AT-R1 |
| AC-3.2 | §6.2 | AT-Q2 |
| AC-3.3 | §6.2, §8.2 | AT-Q2, AT-F2 |
| AC-3.4 | §10.2, §10.3 | AT-L1 |
| AC-3.5 | §6.3, §5.3 | AT-Q6, AT-Q8, AT-K2, AT-K7 |
| AC-3.6 | §6.2 | AT-Q1 |
| AC-3.7 | §6.5 | AT-Q7 (runtime containment + obligation on a PR-opening pass), AT-Q7c (containment on a pass that opens none), AT-Q7b (supplementary source check) |
| AC-3.8 | §6.1, §12.4 | AT-Q1, AT-R3 |
| AC-3.8b | §5.4, §5.5 | AT-R3, AT-R4, AT-R5 |
| AC-4.1 | §7.1 | AT-K5 |
| AC-4.2 | §7.2, §7.4, §10.3 | AT-K1, AT-K4, AT-K5, AT-K6 (all six row shapes across §10.3's three readings of `credential: absent`) |
| AC-4.3 | §7.3, §6.3 | AT-K2, AT-K3, AT-K7 |
| AC-4.4 | §7.2 | AT-K1 |
| AC-5.1 | §8.1, §8.2 | AT-F1, AT-F2, AT-F3, AT-F4, AT-F20 (the record's eight-field shape, set-equal on every kind), AT-F21 (the reader side of that shape: a short record is a parse notice, never a halt, default or repair), AT-R6b (the subject/target split: a guard-set **subject** with a `docs/_decisions/` **target**, the intra-pass merge, the subject tie-break, and the mixed-kind precedence rule over all three kind pairs) |
| AC-5.2 | §8.3, §8.4 | AT-F5, AT-F6, AT-F7, AT-F8, AT-F15, AT-F16, AT-F19 (§8.4 step 1's open-promotion list, set-equal over all four arms) |
| AC-5.3 | §8.5 | AT-F9, AT-F10, AT-F11, AT-F12, AT-F14, AT-F17, AT-F18 |
| AC-5.4 | §8.6, §5.3 | AT-F10, AT-Q5 |
| AC-5.5 | §8.7 | AT-F13 |
| AC-6.1 | §9.1, §9.2, §9.3 | AT-A1, AT-A2, AT-A7 |
| AC-6.2 | §9.4 | AT-A4, AT-A5 |
| AC-6.3 | §9.5, §9.2 | AT-A3, AT-A6 |
| AC-7.1 | §10.3, §10.4 | AT-L4, AT-L5, AT-K7, AT-P10 |
| AC-7.2 | §10.1, §10.3, §4.4 | AT-C3, AT-L1, AT-L2, AT-L3 |
| NFR-1 | §5.1, §6.5, §12.4 | AT-Q7, AT-Q7b, AT-Q7c, AT-R6 (an AC-2.2 promotion whose subject is a guard-set path writes only its `docs/_decisions/` target) |
| NFR-2 | §7.4, §10.5 | AT-K5 |
| NFR-3 | §5.2, §2.3 | AT-C8 (comparative: one corpus yields a set-equal promotion set under `cadence` and under `volume`) |
| NFR-3a | §10.3 | AT-C1, AT-C2, AT-C4 |
| NFR-4 | §6.4, §8.1, §8.2 | AT-Q3, AT-Q4, AT-Q5, AT-Q9, AT-F1 (PR carrier); AT-Q10, AT-Q11, AT-Q12 (consuming-repo carrier — `enacted`, `absent`, and the degraded record that must not suppress) |
| NFR-5 | §3.3, §12.4 | AT-P6, AT-P2, AT-P8, AT-P9, AT-P11 |
| §4a config | §11 | AT-N1, AT-N2, AT-N3, AT-N4 |
| §4b vocabularies | §15.2, §10.3 | AT-L5 (enumerated-class fields only; §14.4 ER-1/ER-2/ER-4 route the three gaps) |

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
| `failed` | §2.6, §12.1 S-11, S-11b, S-11c |
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
| constraints / decisions / PR / `degraded` | §5.1, §7.3, §10.4, and the §8.1 record's `route` field (§6.4's `enacted` test, §8.4 step 1's open test) |
| `prevented` / `recurred` / `insufficient-evidence` | §8.3, §12.3 V-01 |
| `ineffective` / `unmeasurable` | §8.5, §8.7, §12.3 V-02/V-03 |
| `promote` / `revise` / `retire` | §8.1, §8.2, §6.4 |
| `revision` / `retirement` | §8.5, §12.3 V-02/V-04 |
| `pr:` | §10.3, §6.4 |
| `suppressed-by:` | §10.3, §6.4 — the **row** is used; its **value grammar** is wider here than §1's `:63`, routed as §14.4 ER-5 |
| `credential:` (`present (redacted)` / `absent` / `local-gh`) | §7.2, §10.3 |
| the 13-member phase catalogue | §8.1, §8.3 |

Two fields this FSPEC emits have **no** §1 row at `Version` 1.4 and are therefore outside the
compared set rather than silently added to it: `rung:` (§14.4 ER-1) and the absent reason code for
§2.6 row 4 (ER-2). Both are routed as errata against the REQ, which owns §1; neither is patched
here, and AT-L5's domain (§13.9) excludes free-form values so the oracle stays exact in the
meantime. A third divergence is of a different kind and is recorded here so the table is not read as
a clean bill: `suppressed-by:` **has** a §1 row and this document uses it, but writes a **wider value
grammar** than the row spells (ER-5). No AT changes on account of it — AT-Q10 asserts §10.3's
spelling and AT-L5 compares no value of the free-form class — which is precisely why it is recorded
rather than left to be discovered downstream.

### 15.3 Files this feature edits or creates

| Path | Change | Section |
|---|---|---|
| `pdlc/hooks/scripts/nudge-consolidation.sh` | predicate at `:41` scoped to the two regions; corpus glob at `:28` widened to include `docs/completed/*/` | §3.1, §3.2 |
| `pdlc/skills/consolidate-learnings/SKILL.md` | `:35`'s `Date Completed` boundary replaced by the §3.2 predicate; `:41`'s `DECISIONS-{topic}.md` route gains the §5.2 derivation (`{topic} = failure-mode-id`), so the manual entry point and the pass cannot diverge | §3.2, §5.2 |
| **`pdlc/workflows/orchestrate-dev.js`** — a **guard-set** path | `resolveAdvisoryRung` (`:1833`) gains an **optional `skill` parameter defaulting to `ADVISORY_RUNG_SKILL`** (`:1797`), threaded to the dispatch at `:1841` and to the memoised path at `:1844-1849`. Every existing call site is unchanged (AT-M10). This is the one edit this feature makes to already-shipped behaviour, and the only reason §2.6's reuse story compiles | §2.6 item 2, §14.1 T-05 |
| **`pdlc/workflows/dist/orchestrate-dev.bundle.js`**, **`pdlc/workflows/dist/orchestrate-queue.bundle.js`** and **`pdlc/workflows/dist/pdlc-cli.mjs`** | all **three** rebuilt, **in the same commit** as the row above. `CLAUDE.md` requires it, and each of the three inlines the dev module wholesale — the `bundles` array carries three entries (`build-runtime.mjs:448-471`; the third, `{ file: "pdlc-cli.mjs", id: "pdlc-cli", contents: cliArtifact }`, is `:464-470` — its opening brace is `:464` and the `file:` key `:465` — and `cliArtifact` is composed at `:291`) — so the widened resolver's bytes live in **three** tracked artifacts as well as in the source. Verified at HEAD: `resolveAdvisoryRung` is defined at `dist/orchestrate-dev.bundle.js:1994`, `dist/orchestrate-queue.bundle.js:1970` and `dist/pdlc-cli.mjs:1843`, and all three are `git ls-files`-tracked. **The count is load-bearing:** CI's `Generated artifacts are in sync` job rebuilds and diffs *every* artifact, so a commit that rebuilds two of the three fails it | §14.1 T-02 |
| `pdlc/skills/harvest-learnings/SKILL.md` | a `Phases exercised` row added to the metadata table (`:70-78`); a `failure-mode-id` line added to the §5 Open Items convention | §8.3, §8.4 |
| `.gitignore` | one entry for `docs/_decisions/.consolidation-lock` | §4.1 |
| `pdlc/workflows/build-runtime.mjs` and `pdlc/workflows/dist/distribution-manifest.json` | the consolidation bundle's build entry, plus the manifest's own row for it. The manifest carries **one row per artifact** with a `sha1` each (ids `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` at HEAD), so the rebuild above **re-stamps three existing rows** as well as adding the new one — the manifest is not touched once per feature but once per artifact the rebuild changes | §14.1 T-02 |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | authored and owned by this feature (§1–§4 entire), kept at `Version` 1.4 | REQ §4b |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | authored and owned by this feature (§1–§4 entire), kept at `Version` 1.0 | REQ §4b |

Every path above is verified present at HEAD except the consolidation bundle's own artifacts, which
this feature creates.

**The two guard-set rows are this feature's own implementation, not a runtime write, and NFR-1 is
untouched.** NFR-1 forbids *the pass*, at run time, from writing a guard-set path in any tree (§5.1);
it says nothing about the feature's delivery diff, which reaches `pdlc/workflows/` the ordinary way —
through this feature's own reviewed PR. The distinction is the same one §5.1 draws between a routing
predicate and an inherited control.

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
| 8 | Does either model rung resolve, and does the first advisory dispatch return a response? | **terminate `failed`** — `advisory-model-unresolved` when neither rung resolves (§2.6 row 3), **no** reason code when the dispatch fails for any other reason (row 4). Either way: consumed pair already written at step 7, no effectiveness table, marker released, row appended | §2.6 |
| 9 | — (read consumed bodies, cluster, apply the AC-2.3 bar) | none — a cluster below the bar simply produces no proposal | §5.2 |
| 10 | Is `ESCALATIONS.md` present, and does it carry entries? | absent ⇒ `no-advisory-corpus`; present-but-empty ⇒ `advisory-corpus-empty`; both compose with the run's own status rather than terminating | §9.3 |
| 11 | — (compute the effectiveness table over prior passes) | none — emitted even by a `no-op` pass | §8.3 |
| 12 | Is a proposal a duplicate — on the PR route, an open-or-merged PR for the same `(id, action)`; on the consuming-repo route, a log record for that pair whose `route` is not `degraded`? | duplicate ⇒ suppressed, `suppressed-by:` populated, no PR opened and no fallback fired. **Also terminating:** this step's remediation-authoring dispatch can return `{kind: "dispatch-error"}` ⇒ **terminate `failed`** with no reason code (§2.6, §12.1 S-11c) | §6.4, §8.5 |
| 13 | Does the proposal's target path fall in the guard set? | in-guard-set ⇒ the PR route (§6); otherwise the direct consuming-repo write (§5.4). **Also terminating:** this step's proposal-authoring dispatch can return `{kind: "dispatch-error"}` ⇒ **terminate `failed`** with no reason code, keeping the records of whatever it had already routed (§12.1 S-11c) | §5.1, §2.6 |
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
3. **Marker held** — steps 1–16, resolving a status at step 14 over `promoted`,
   `promoted-degraded`, `no-op`, `failed`. Always: exactly one consumed pair (step 7), exactly one
   terminal log row, one release, and one commit attempt whose refusal degrades the record but not
   the status. A terminating branch at step 8, 12 or 13 is **inside** this shape, not a fourth one:
   per §2.2 it jumps to step 14 and steps 14–16 run unchanged, so what distinguishes S-11 / S-11b
   from S-11c is only how much of orders 2–3 the log carries, never whether the pass committed or
   released.

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
| BR-18 | A proposal has exactly one canonical repository-root-relative **target** path (§8.1's `target`) — never a glob, never a directory — decided by the promotion's kind (§5.2), and that path alone decides the route. The promotion's **subject** `artifact` keys the id and never routes; the two coincide only for a process-learning promotion. | §5.1, §5.2, §8.1 | AT-R1, AT-R6 |
| BR-19 | A target path under any member of `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53` — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`) takes the PR route. No code path in the pass writes such a path in any tree (NFR-1). | §5.1, §6 | AT-R1, AT-Q1 |
| BR-20 | `DOMAIN-CONSTRAINTS.md` and `DECISIONS-{topic}.md` targets are applied directly to the consuming repo; any other non-guard path is written to the proposal file and **never applied**. | §5.1, §5.2, §5.3 | AT-R2, AT-Q6 |
| BR-21 | All consuming-repo writes of one pass land in **one** commit, pathspec-scoped per AC-3.8b, never `-a`. | §5.4 | AT-R2, AT-R3, AT-R5 |
| BR-22 | The invoking tree's HEAD and branch are never changed, and no branch operation is performed in it (AC-3.8). | §6.1, §12.4 | AT-Q1, AT-R3 |

### 18.5 The pull-request route

| # | Rule | Section | AT |
|---|---|---|---|
| BR-23 | The PR is opened against `consolidation.pluginRepository`, defaulting to `null` ⇒ the current repository. A non-null value that does not resolve is `repository-unresolved` and degrades through §6.3 — it is **not** a parse fallback. | §11.2, §6.3 | AT-N4 |
| BR-24 | The branch is `consolidation/{passId}`; the body carries the `PDLC-CONSOLIDATION-PASS` trailer and each commit carries `PDLC-PROMOTION-ID`. | §6.2 | AT-Q2 |
| BR-25 | The suppression key is the **pair** `(failure-mode-id, action)`. Its carrier depends on the route: on the PR route it is read from the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs observed `open` or `merged` (a `closed`-unmerged PR is not in the key set); on the consuming-repo route it is read from the §8.1 failure-mode records already in `docs/_decisions/.consolidation-log.md`, where a pair is `enacted` only when a record carries it with a `route` other than `degraded`, and `absent` otherwise. The two carriers agree on the substantive rule: **a proposal that reached nothing is re-proposable; one that landed is not.** One key, two carriers — a route with no carrier would not be idempotent at all. | §6.4 | AT-Q3, AT-Q4 (PR carrier); AT-Q10, AT-Q11, AT-Q12 (consuming-repo carrier) |
| BR-26 | A suppressed proposal opens nothing, fires no fallback, appends nothing, and populates `suppressed-by:` — never `pr:`. Its entry is `{id}:{action} → {evidence}` where the evidence is the open-or-merged PR's URL (PR carrier) or `pass:{passId}` of the enacting §8.1 record (consuming-repo carrier), the latter reported as **unavailable** where that record is short of `passId` — a rendering of the second form, not a third (§6.4, §14.5 LD-4); §10.3 is normative for the grammar and admits no third form; that grammar is wider than vocabularies §1's `:63` and the divergence is routed as §14.4 ER-5. | §6.4, §10.3, §12.2 P-04 | AT-Q3, AT-Q10, AT-L2 |
| BR-27 | An existing machine-opened PR is never extended, amended or superseded by a later pass. | §6.4 | AT-Q3 |
| BR-28 | Over **each** of §6.5's three enumerated seam domains — the PR seam, the git seam in the invoking tree, the git seam in the §6.1 clone — the pass's observed verb **set** is a **subset** of that domain's permitted set, on every pass and under every status or configuration; every merge and enable-auto-merge verb is outside every permitted set, so containment alone forbids a merge on any PR including its own. Each domain's *obliged* verbs are additionally present on the Given §6.5's fifth column names for that domain — the PR seam and the clone on a pass that opens a PR, the invoking tree on any pass that makes a §5.4 commit — and the PR a pass opened is `open` when it returns. Containment is the universal form because a conforming pass with no guard-set proposal observes `∅` on two domains, and because each git domain's permitted set includes non-mutating read verbs that a conforming pass may or may not use; the obliged conjunct is what stops the rule from being satisfied by a pass that calls nothing. Equality is asserted on no domain. Verbs are compared as resolved operations, not function names. | §6.5 | AT-Q7, AT-Q7b, AT-Q7c |

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
| BR-33 | Every promotion carries one `failure-mode-id`, derived deterministically from `phase` and its **subject** `artifact`, one **`target`** path decided by its kind (§5.2) and never folded into the id, and one `action` ∈ {`promote`, `revise`, `retire`}; one promotion is one authored subject file. | §8.1, §8.2, §5.2 | AT-F1, AT-F2, AT-F3, AT-F20, AT-R6b |
| BR-33a | Every failure-mode record carries **exactly** §8.1's eight fields — none missing, none added — on every promotion kind and on the `degraded` route. A reader that finds a record missing a field it indexes reports a parse notice and skips that record for that contract; it never halts the pass and never rewrites the record, and it is skipped only by the contracts that index the missing field (§8.1's reader table) — **and only where that field is one the reader's own predicate is a function of: a field indexed solely to spell an outcome the predicate already decided degrades the spelling, not the outcome** (§6.4's `passId`). | §8.1, §6.4, §8.4 | AT-F20 (the writer half), **AT-F21** (the reader half, `route` and `target` arms only). The AT cell enumerates by **set-equality over §8.1's reader table**, so every arm has exactly one home: the **three** `artifact` arms (§8.3's row emitted with an unavailable path, §8.5's refusal to guess a `retirement`, §8.4 steps 2–3's question asked with the `artifact` half stated unavailable) and the **`passId` arm** (§6.4 suppresses on the key and reports the enacting `passId` as unavailable, appending nothing a second time) have **no fixture at this layer** and are PROPERTIES-owned per DEC-LAYER-01 (§14.5 LD-1, LD-4), as E-12b states. **Sharing a reader is not sharing an arm**, so the four remaining fields are named rather than folded into another field's: **`phase`** (§8.3 emits the row and the verdict falls to `insufficient-evidence`), **`failure-mode-id`** (§8.3 emits **no** row — a row cannot be keyed on an absent id — §8.4 step 1's open list takes no member from the record, and §8.4 steps 2–3 ask no question for it), **`action`** (§6.4's predicate is undecidable, so that contract skips and the promotion is re-proposed; §8.4 step 1 leaves the id open) and **`symptom`** (§8.4's harvest question is still asked on the fields present). All four have their observable in §8.1's reader table and **no fixture at this layer**, PROPERTIES-owned per DEC-LAYER-01 (§14.5 LD-5) |
| BR-33b | An intra-pass merge of proposals of different §5.2 kinds keeps the **highest-precedence** kind's `target` and `route` (constraints > decisions > subject file), states both failure modes in the one `symptom`, and names the elided kind in the report body. Where the merged proposals name more than one canonical subject path, the surviving `artifact` — and, where precedence returns the process-learning kind, the `target` — is the **lexicographically first** of them; never proposal order, which is not a function of the inputs — and the report body names every elided subject path beside the survivor, on the same obligation that names an elided kind. | §8.2, §10.4 | AT-R6b (fixture 2 for the subject tie-break — the `artifact` half only, since that fixture is kind 2 on both sides; fixtures 3, 4 and 5 for the three kind pairs). The `target`-follows clause of the subject tie-break (a colliding-subject merge of two **process learnings**, where precedence returns kind 3) has **no fixture at this layer** and is PROPERTIES-owned per DEC-LAYER-01 (§14.5 LD-2, which also carries the >2-candidate elided set), with §8.2's third note stating its observable |
| BR-33c | The open-promotion list handed to the harvest prompt is computed **by the pass** from `.consolidation-log.md` alone: an id is open when no record for it carries `action: retire` with a `route` other than `degraded`. The computed list is exactly that set — not a superset. | §8.4 | AT-F19 |
| BR-34 | Every prior promotion gets a verdict on every reporting pass: `prevented` / `recurred` / `insufficient-evidence` — a `no-op` pass restates them unchanged (AC-1.4). | §8.3, §12.3 | AT-F5, AT-F6, AT-F7, AT-F8 |
| BR-35 | `recurred` on two consecutive counted passes ⇒ state `ineffective`, and a `revision` or `retirement` proposal is emitted. | §8.5 | AT-F9, AT-F10 |
| BR-35a | Which alternative is proposed is decided by spent-alternative rows first, then by **one file-existence test** on the promotion's **subject** `artifact` (never its `target`) — never by a match on `symptom`, which is non-keying free text the recurrence evidence does not carry. | §8.5, §8.1 | AT-F17, AT-F18 |
| BR-35b | A `failure-mode-id` reaches a LEARNINGS only by verbatim copy from an existing log record; the ids appearing in the corpus are a subset of the recorded ids, and an unmatched id is a parse notice, never a verdict. | §8.4 | AT-F15, AT-F16 |
| BR-36 | `insufficient-evidence` on `consolidation.unmeasurablePasses` consecutive evaluated passes (default `3`) ⇒ state `unmeasurable`. | §8.7, §11.2 | AT-F13 |
| BR-37 | Advisory counts come only from `docs/_queue/ESCALATIONS.md`; no count is ever derived from LEARNINGS advisory prose. | §9.1, §9.2 | AT-A3, AT-A7 |
| BR-37a | Every §9.4 and §9.5 quantity ranges over the **whole** of `ESCALATIONS.md` — no filter on `Feature`, none on date, and no relation to the pass's consumed set. | §9.2, §9.4, §9.5 | AT-A6 |
| BR-38 | An absent `ESCALATIONS.md` ⇒ `no-advisory-corpus`; present-but-empty ⇒ `advisory-corpus-empty`. Both compose with the run's own status. | §9.3 | AT-A1, AT-A2 |

### 18.8 Recording

| # | Rule | Section | AT |
|---|---|---|---|
| BR-39 | Every log write is an append of one whole record; no record is ever rewritten in place. | §10.2, §12.4 | AT-L3 |
| BR-40 | A pass that takes the marker appends exactly one terminal row; a `skipped-cadence` tick appends none. | §10.1, §10.3 | AT-C3, AT-L3 |
| BR-41 | Every terminal row carries a trigger (NFR-3a) and a `credential:` value (AC-4.2) — a `refused` row included. | §10.3 | AT-L5, AT-M1 |
| BR-41a | `credential: absent` is read by an observable, not by status. A row carrying `credential-unavailable` means attempted-and-found-nothing. A **non-`failed`** row not carrying it means **not attempted** — the pass never reached a §6 PR-route attempt (`refused`, or no guard-set proposal). A **`failed`** row not carrying it is **undecidable from the row alone** — vocabularies §1 at `Version` 1.4 bars the code from a `failed` status, so a step-12/13 pass that attempted and resolved nothing cannot record it — and the §10.4 report body is the discriminator. The reading is total over the three cases; the third is a named loss, routed as ER-4, not an assumption. | §10.3, §7.2, §7.3 | AT-K6 |
| BR-42 | A git refusal at step 15 adds `writes-uncommitted` and never changes the pass's status. | §5.4, §12.1 S-12 | AT-R4 |
| BR-43 | Every **enumerated-class** value written (§10.3: status, trigger, reason codes, `credential:`, route names, per-promotion verdict / state / action / phase) is a member of vocabularies §1 at `Version` 1.4, and every §1 row is used — set equality in both directions (REQ §4b). Free-form values — a URL, a date, a branch, a `passId`, a model id — are data and are outside the compared set. | §15.2, §10.3 | AT-L5 |
| BR-44 | A configuration fallback is report content, never a reason code — no §1 row exists for one. | §11.3 | AT-N2, AT-N3 |

## 19. Edge Cases and Error Scenarios

Every parsed input of this feature has an absent, malformed and truncated arm (DC-01, receive side),
and every failure of an external call has a named class. This section gathers them so a reviewer can
check totality in one pass: nothing below aborts the pass without a recorded status, and no two
distinct input states are silently collapsed into one.

**The AT column is a per-row obligation, not a family citation.** Every row below names a test whose
**Given constructs that row's own input state**. A row is not covered by a test that constructs a
neighbouring state and happens to exercise nearby code: an absent file and an unreadable one, a stray
basename and a dangling closer, an `api-failure` and a `branch-exists` each differ in the arm they
take, so a shared test proves one arm and leaves the other unwritten — exactly the collapse this
section forbids. Six rows carried such a citation in the first draft (E-02, E-05, E-06, E-09, E-23,
E-29) and each now names its own test.

### 19.1 Parsed-input edge cases

| # | Input state | Behaviour | Section | AT |
|---|---|---|---|---|
| E-01 | `docs/_decisions/.consolidation-log.md` absent | both regions empty; every basename un-consolidated; datum set empty ⇒ the first pass runs on the `no-cadence-datum` branch | §3.4, §2.3 | AT-P4, AT-C1 |
| E-02 | Log present but unreadable (permissions, IO error) | treated as **empty text**, mirroring `nudge-consolidation.sh:38-39`'s `except: logtext = ""` — fail-open toward re-consumption, never toward silently skipping a corpus. The re-consumption it permits is bounded by §6.4's carrier on the PR route and by the §5.2/§6.4 consuming-repo carrier on the other, not by the log this row could not read | §3.4, §6.4 | **AT-P8** |
| E-03 | Log present with no `<!-- pdlc:consumed` marker | the whole file is legacy region — the HEAD state | §3.4 | AT-P3 |
| E-04 | Opening `<!-- pdlc:consumed {passId} -->` with no closing marker (a truncated append) | the unterminated block runs to end of file and counts as consumed — a partially flushed pair never *loses* consumption | §3.4 | AT-P5 |
| E-05 | Closing `<!-- /pdlc:consumed -->` with no opener | ignored; opens no block, moves no boundary | §3.4 | **AT-P9** |
| E-06 | A basename in both regions | consolidated once — the clauses are a disjunction over a set of basenames | §3.4 | **AT-P11** |
| E-07 | A basename appearing in the log outside any block (e.g. in an `artifact` field) after the first marker | **un-consolidated** — the stray occurrence marks nothing | §3.2 | AT-P2 |
| E-08 | Corpus glob matches nothing | un-consolidated set empty; volume cannot fire; a pass that runs is the AC-1.4 `no-op` with an empty consumed pair | §3.4 | AT-P6 |
| E-09 | Two LEARNINGS sharing a basename under different directories | one set member; the collision is **reported** in the AC-7.1 report, never silently resolved (repair needs a key the shipped predicate lacks — §14 O-C2) | §3.4 | **AT-P10** |
| E-10 | A log row that is malformed or unparseable | contributes no `m` to the `passId` derivation and is skipped — the derivation never aborts | §2.5 | AT-C6 |
| E-11 | Marker file truncated or unparseable | **reclaimed, not refused**; the abandoned id is reported `unknown` | §4.2 | AT-M3 |
| E-12 | `ESCALATIONS.md` entry whose `Feature` row is missing | that entry is skipped with a parse notice; no count is attributed to a guessed key; the read does not abort | §9.2 | AT-A7 |
| E-12b | A **failure-mode record** in the log missing a field a reader indexes (a truncated or legacy record — `route` for §6.4 / §8.4 step 1, `target` for §5.1 / §8.6, `action` for §6.4 / §8.4 step 1, `artifact` for §8.3 / §8.5 and for §8.4's harvest question, `passId` for §6.4's evidence spelling, `phase` for §8.3, `failure-mode-id` for §8.3 / §8.4 step 1 / §8.4's harvest question, `symptom` for §8.4's harvest question — all eight of §8.1's fields, per that table's cell-level set-equality) | a parse notice naming the record and the missing field; the record is skipped **only** by the contracts that index that field (§8.1's reader table) — **except where the field is indexed solely to spell an outcome the reader's predicate already decided, where the contract runs and the spelling degrades**: short of `passId`, §6.4 still suppresses on the pair and reports the enacting `passId` as unavailable, never `pass:undefined` and never a second append (§6.4, NFR-4); the pass reaches its terminal status, never halts, writes no guessed default and never rewrites the record. Sibling of E-12 on the other corpus | §8.1, §6.4, §8.4 | **AT-F21** for the `route` and `target` arms. The **three** `artifact` arms (§8.3's row emitted with an unavailable path rather than dropped, §8.5's refusal to guess a `retirement`, and §8.4 steps 2–3's question still asked with the `artifact` half stated unavailable — three readers, three arms, per BR-33a) and the **`passId` arm** have **no fixture at this layer** and are named PROPERTIES-owned per DEC-LAYER-01 (§14.5 LD-1, LD-4) — the rule and its observables are stated in §8.1's reader table and, for `passId`, in §6.4; the fixture that pins them is not claimed here. The `phase`, `failure-mode-id`, `action` and `symptom` arms are likewise stated in that table and unfixtured here, PROPERTIES-owned per §14.5 LD-5 — notably, short of `phase` §8.3 still emits the row at `insufficient-evidence`, and short of `failure-mode-id` it emits none, because a row cannot be keyed on an absent id — and §8.4 step 1's list takes no member from that record |
| E-13 | `.claude/pdlc.config.json` absent | every `consolidation` key defaults; the pass does not terminate | §11.1 | AT-N1 |
| E-14 | One `consolidation` key of the wrong type | that key alone falls back and is named in the report; every other configured key keeps its value | §11.2 | AT-N2 |
| E-15 | `consolidation` present but not an object | every key defaults, and the report distinguishes this (`sectionMalformed`) from an absent section | §11.3 | AT-N3 |

### 19.2 Error scenarios — external calls and contention

| # | Scenario | Terminal effect | Section | AT |
|---|---|---|---|---|
| E-16 | Marker held and fresh | `refused`, reason `consolidation-in-progress`; one log row, no consumed pair, no commit, **no effectiveness table** (§10.2 order 3) | §4.2, §4.4, §10.2 | AT-M1 (status and reason), AT-M6b (what is **not** appended) |
| E-17 | Marker held and stale | reclaimed; `reclaimed-stale-lock` composes with the run's own status | §4.2 | AT-M2 |
| E-18 | Two passes racing to mint the same `passId` | harmless: the loser is `refused` at step 6, and no contract keys on a refused row's id | §2.5, §4.5 | AT-C6, AT-M1 |
| E-19 | Neither model rung resolves | `failed`, reason `advisory-model-unresolved`; no promotion; consumed pair already written at step 7; marker released | §2.6 | AT-M4 |
| E-19b | The first advisory dispatch fails for a reason that is **not** model resolution (§2.6 row 4) | `failed` with **no** reason code and the error message verbatim in the report body; otherwise identical to E-19 | §2.6 | AT-M6 |
| E-20 | Credential absent or invalid | `credential-unavailable`, `credential: absent`, §6.3 fallback fires, pass does **not** halt | §7.3, §6.3 | AT-K2 |
| E-20b | A pass that resolved no credential at all — `refused` at step 6, `failed` at step 8, or a pass with no guard-set proposal to route | `credential: absent` read as **not attempted** — the row carries no `credential-unavailable`, which is what separates it from E-20; the reading is keyed on that observable and not on the status (§10.3) | §10.3, §4.4, §7.2 | AT-K6 |
| E-20c | A pass that **did** attempt the PR route, resolved nothing, and then terminated `failed` at step 12/13 (§12.1 S-11c) | the promotion degrades and the report body names it with the `credential-unavailable` failure class, but the terminal row carries **no** reason code: vocabularies §1 at `Version` 1.4 bars it from a `failed` status. `credential: absent` on that row is undecidable from the row alone and is read from the report body — a named loss (§10.3 third reading, ER-4), never a row silently read as "not attempted" | §10.3, §7.3, §2.6 | AT-K6 |
| E-21 | Credential present but rejected by the repository | `credential: present (redacted)` **and** `credential-unavailable` — the two fields are never collapsed | §7.2, §6.3 | AT-K4 |
| E-22 | `pluginRepository` names a repository that does not resolve | `repository-unresolved` with the configured value verbatim — never a silent fallback to the current repository | §6.3, §11.2 | AT-N4 |
| E-23 | Network or API failure, rate limiting included | `api-failure` with the API's status text; the proposal file carries the full diff | §6.3 | **AT-Q8** |
| E-24 | Remote head branch `consolidation/{passId}` already exists | `branch-exists`; the fallback file names the existing branch and any PR found for it | §6.3 | AT-Q6 |
| E-25 | A proposal duplicates an open-or-merged `(id, action)` pair | **not** an error: suppressed before any PR is attempted, fires no fallback, records `duplicate-suppressed` | §6.4, §6.3 | AT-Q3 |
| E-26 | Every promotion suppressed | `no-op` with `pr:` empty and `suppressed-by:` populated | §12.1 S-06 | AT-L2 |
| E-27 | Git refuses the AC-3.8b commit after the lock retries | status unchanged; `writes-uncommitted` recorded; writes remain correct on disk | §5.4 | AT-R4 |
| E-28 | Nothing to stage at commit time | no failure and no `writes-uncommitted` — an empty stage is a return, not a warning | §5.4 | AT-R5 |
| E-29 | The invoking branch carrying the log record is later abandoned | the merged PR is what survives; §5.5 states the cost rather than compensating for it | §5.5 | **AT-Q9** |
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
