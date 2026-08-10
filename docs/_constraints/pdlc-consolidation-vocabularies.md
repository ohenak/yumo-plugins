# pdlc-consolidation-vocabularies — enumerated vocabularies, the phase catalogue, and the phase observable

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only input to `pdlc-consolidation-agent` and its successors; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (§4b, §5, REQ-CONS-01, REQ-CONS-03 preamble, AC-1.3, AC-3.3, AC-3.7, AC-5.1, AC-5.2, AC-7.1, AC-7.2, NFR-4, NFR-5) |
| Version | 1.4 · 2026-08-06 |

**Why this file exists.** The consolidation REQ's enumerated vocabularies and the phase observable
are the largest self-contained block in that document, are read by every downstream layer, and are
reusable by any feature that reads a LEARNINGS corpus by phase. Held here they are stated once and
cited by section; held inline they consume the REQ's size budget (`pdlc/hooks/scripts/check-req-size.sh`)
against the reasons the REQ exists to carry.

**No cell in any table below may use a positional back-reference.** Every *May accompany status*
cell names its permitted set explicitly, so inserting a row can never silently re-point a neighbour.

**Change control, and who owns these rows.** `REQ-pdlc-consolidation-agent` **owns every section of
this file — §1–§4 entire** — and changes none belonging to anyone else; a successor feature's
vocabulary belongs in its own new section of this file or in its own file, never interleaved into
§1–§4. Of the owned sections, **§1, §2 and §4 are enumerations** — their tables are transcribed
row-for-row downstream and are under the set-equality oracle below — while **§3 is owned normative
prose**, binding but not enumerated, so it carries no row oracle. The defect rule over the enumerated
sections is **symmetric in both directions**: a value that REQ names with no row here, **and** a row
here naming a value that REQ never uses, are equally defects — so a *deleted* row is as much a breach
as a missing one, which is what makes the downstream set-equality oracle meaningful rather than a
one-sided containment check. Consumers cite this file **at its `Version`**; a row change that is not
accompanied by a version bump is itself a defect. **A row's *enumerated value* is what that rule is
about.** Re-measuring a `file:line` coordinate inside a row's gloss — the discipline DECISIONS §960
obliges and `consolidationSkillAnchors.test.js` mechanises — changes no value, invalidates no
downstream transcription, and is therefore **not** a version-bumping change; bumping for it would
falsify every consumer's `at Version N` pin for no semantic delta.

## 1. Enumerated vocabularies

Every enumerated value the consolidation REQ uses, in one place, with its category and the statuses
it may accompany. Downstream completeness is checkable by **set-equality against this table**, not by
containment across six sections; adding a value to the REQ without a row here is a defect.

| Value | Category | May accompany status | Defined at |
|---|---|---|---|
| `promoted` | terminal status | — | AC-7.1 |
| `promoted-degraded` | terminal status | — | AC-7.1, AC-4.3 |
| `no-op` | terminal status | — | AC-1.4 |
| `skipped-cadence` | terminal status | — | AC-1.1 (writes no log row, AC-7.2) |
| `refused` | terminal status | — | AC-1.3 |
| `failed` | terminal status | — | AC-1.6, AC-3.5 |
| `consolidation-in-progress` | reason code | `refused` | AC-1.3 |
| `reclaimed-stale-lock` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-1.3 |
| `advisory-model-unresolved` | reason code | `failed` | AC-1.6 |
| `no-cadence-datum` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed`, `refused` | AC-1.1 |
| `writes-uncommitted` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-3.8b |
| `credential-unavailable` | reason code | `promoted-degraded`, `no-op` | AC-3.5, AC-4.3 |
| `repository-unresolved` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `api-failure` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `branch-exists` | reason code | `promoted-degraded`, `no-op` | AC-3.5 |
| `duplicate-suppressed` | reason code | `promoted`, `promoted-degraded`, `no-op` | NFR-4 |
| `no-advisory-corpus` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-6.1 |
| `advisory-corpus-empty` | reason code | `promoted`, `promoted-degraded`, `no-op`, `failed` | AC-6.1 |
| `cadence` / `volume` / `manual` | trigger | any status that writes a row | NFR-3a, REQ-CONS-01 tick order |
| constraints / decisions / PR / `degraded` | promotion route | `promoted`, `promoted-degraded` | AC-7.1, AC-4.3 |
| `prevented` / `recurred` / `insufficient-evidence` | per-promotion verdict | any status emitting the AC-5.2 table | AC-5.2 |
| `ineffective` / `unmeasurable` | per-promotion state | any status emitting the AC-5.2 table | AC-5.3, AC-5.5 |
| `promote` / `revise` / `retire` | `action` — the NFR-4 key's second member; `revise`/`retire` are the AC-5.3 `revision`/`retirement` alternatives named as actions | `promoted`, `promoted-degraded`, `no-op` | AC-5.1, NFR-4 |
| `revision` / `retirement` | proposed action on an `ineffective` promotion, as reported (the AC-5.1 `revise` / `retire` actions under their AC-5.3 names) | any status emitting the AC-5.2 table | AC-5.3 |
| PR URL or empty | `pr:` field — a PR **this pass opened** | any status that writes a row | AC-7.2, AC-3.4 |
| `{id}:{action} → PR URL` entries, or empty | `suppressed-by:` field — one entry per proposal suppressed as a duplicate | `promoted`, `promoted-degraded`, `no-op` | NFR-4 |
| `present (redacted)` / `absent` / `local-gh` | `credential:` field | any status that writes a row | AC-4.2 |
| R / F / T / D / P / PR / I / PT / CR / DOD / H / PUB / MERGE | pipeline phase id (the closed 13-member catalogue AC-5.1 keys on) | any status emitting the AC-5.2 table | `PHASE_DISPATCH` (`orchestrate-dev.js:3337-3437` — declaration `:3337`, first key `R:` `:3338`, last key `DOD:` `:3431`, close `:3437`) for R/F/T/D/P/PR/CR/DOD; `recordPhase` literals for I (`:10020`), PT (`:10250`), H (`:10407`), PUB (`:10462`), MERGE (`:10568`) |

Two joins the table settles. A pass that promoted something and also hit an AC-3.5 fallback class is `promoted-degraded`, never a bare `promoted`. A
pass whose **every** promotion was `duplicate-suppressed` promoted nothing new and is therefore `no-op` (AC-1.4's second cause), while a pass that
suppressed one duplicate and landed another is `promoted` — or `promoted-degraded` if it also degraded a third, which is why `duplicate-suppressed`
permits all three.

A pass may carry more than one reason code, and each row's permitted set is derived **by composition, not by the status the code was first introduced
under**: a code is legal with every terminal status still reachable after the point at which it is recorded. Hence the two AC-6.1 corpus codes permit
`failed` (the corpus is read before AC-3.5's or AC-1.6's failure is decidable), and `no-cadence-datum` permits `refused` (decided at step 3, before the
marker check that yields `refused` — AC-1.3). `writes-uncommitted` does **not** permit `refused`: a refused pass commits nothing. `skipped-cadence`
carries no code at all — it writes no log row (AC-7.2).

## 2. The phase observable

A LEARNINGS at HEAD carries no phase field: its metadata table is `Feature` / `REQ` / `Date Completed` /
`Total Iterations` / `Upstream` / `Harvested from` / `DoD rounds` (`pdlc/skills/harvest-learnings/SKILL.md:70-78`),
and `## 6. Approval Record` (`:105`) is keyed by document type, not phase. The consolidation feature
therefore adds a **`Phases exercised`** row to that table, carrying the set of phase ids the feature's
run executed. For a LEARNINGS predating the convention the value is derived, by this stated and total
mapping, from `Harvested from` (`:77`) — the one field that already names phase-bearing artifacts:

| `Harvested from` basename class | Phases it evidences | Shipped naming |
|---|---|---|
| `CROSS-REVIEW-{role}-{docType}-v{N}.md` | the phase owning that docType (REQ→R, FSPEC→F, TSPEC→T, DECISIONS→D, PLAN→P, PROPERTIES→PR) | `orchestrate-dev.js:5799` |
| `CODE_REVIEW-{feature}-v{N}.md` | DOD | both dod-verify dispatch sites — `orchestrate-dev.js:7911` (round 1, `dodVerifyPrompt`) and `:7941` (rounds ≥2, `dodReVerifyPrompt` `:7924`); classified at `:6423` |
| `POSTMORTEM-{phase}-{feature}.md` | that `{phase}` verbatim | `orchestrate-dev.js:5429` |

The split is **per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here. For one
pre-convention LEARNINGS: **decidable** = the phases that file's own `Harvested from` decides — R, F, T, D, P, PR from row 1, DOD from row 2, plus
whatever `{phase}` row 3 names verbatim; **undecidable** = the §1 catalogue minus that set. Their union is set-equal to the catalogue for every
file — which makes the rule total — but neither half is fixed, because `{phase}` in a POSTMORTEM basename is **any** halting phase, not only a
converge phase: the shared review loop builds `POSTMORTEM-${phaseId}-${feature}.md` (`orchestrate-dev.js:5429`), Phase CR runs that loop with
`phase: "CR"` (`:10255-10257`), and the halt path builds the same name from whatever phase halted (`:10603`). So `POSTMORTEM-CR-*` is producible and
decides CR for the file naming it; a file naming none decides no phase. Any phase the mapping cannot decide for a pre-convention file counts as
**not** exercised — which routes that promotion to `insufficient-evidence`, never to a guessed `prevented`.

## 3. The consolidation log's record grammar

`docs/_decisions/.consolidation-log.md` is written by more than one record type, so its grammar is
stated here once for every feature that reads or appends to it.

**Consumption is recorded only inside a delimited block.** The shipped un-consolidated predicate is a
bare substring test over the whole file (`pdlc/hooks/scripts/nudge-consolidation.sh:41`, whose read of the log is at `:36-37`),
so any other record carrying a LEARNINGS basename — a PR title, a failure mode's `artifact` field, an
effectiveness row — would falsely mark that file consolidated. The block is:

```
<!-- pdlc:consumed {passId} -->
LEARNINGS-{feature}.md      (one basename per line)
<!-- /pdlc:consumed -->
```

The predicate matches a basename **only within** such a block, and **no other record type may appear
inside one**. `nudge-consolidation.sh:41` is scoped the same way by the consolidation feature, so the
hook and the pass keep one predicate rather than two — which is what makes "the block names exactly
the consumed set" enforceable by the predicate that consumes it.

**Write granularity: every write is an append of one whole record at end of file.** A whole-file
read-modify-write of the log is **forbidden**, not merely unnecessary: it is the one shape that loses
a concurrent append, and it is why the log needs no lock. The two writes that would have violated it
are decided away rather than serialised — an in-progress marker's take and release are in-place edits
of a whole small file, so the marker lives in its own file (`docs/_decisions/.consolidation-lock`),
never in the log; and a pass's `<!-- pdlc:consumed {passId} -->` pair is emitted **complete, in one
append**, its consumed set fixed before any promotion work. Two passes' records therefore interleave
in either order without loss.

**The log at HEAD, and the legacy region.** The file **exists** and predates the block convention
above: a markdown pass log whose `## Pass 1 — 2026-07-29` records its consumed set as a two-column
table of **full paths** (one row per consumed LEARNINGS, path plus date), then prose promotion
sections. It carries **no** `<!-- pdlc:consumed -->` block and **no** row status of any kind —
"Promoted" is only a section heading. A predicate matching blocks alone would therefore report both
files un-consolidated on a first pass, re-consuming a corpus a prior pass already promoted from.
Hence the **legacy region**: the text preceding the file's *first* `<!-- pdlc:consumed` marker (a log
with no block at all is legacy region entire), over which the shipped bare substring test
(`nudge-consolidation.sh:41`) applies unchanged — so nothing already consolidated is re-consumed and
no parse of Pass 1's prose is required.

**The legacy region is frozen by construction, in two clauses.** **(a)** Every pass that takes the
in-progress marker appends a `<!-- pdlc:consumed {passId} --> … <!-- /pdlc:consumed -->` pair
**before any other record it writes, even when its consumed set is empty** (the pair is then empty,
which still names exactly the consumed set), so the boundary is frozen unconditionally by the first
pass rather than only by one whose consumed set happens to be non-empty. **(b)** Exactly **one**
record is exempt — it may precede the first block, and it is not readable as legacy consumption
because **no field it carries is ever a basename**: a `refused` pass's row — status, trigger,
`credential:`, reason code, and the held marker's passId and ISO-8601 timestamp, and only those —
appended by a tick that loses the race between the winner's marker and its block. A passId is
`{YYYY-MM-DD}-{n}` and a timestamp is neither a `LEARNINGS-*.md` basename. The in-progress marker is
**not** a second exempt record: it lives in its own file, never in this log. Every other record
lands after the first block.

## 4. Pass identity, artifact naming, and the PR trailer grammar

Every consolidation pass has a `passId` of the form `{YYYY-MM-DD}-{n}`, where `n` is the 1-based
ordinal of that pass on that calendar date — so two same-day passes never collide. Derived names:

| Thing | Name |
|---|---|
| Proposal artifact | `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, the name the skill states at `pdlc/skills/consolidate-learnings/SKILL.md:70` (it superseded a `{date}`-only name, which no longer appears in that file) |
| Promotion branch | `consolidation/{passId}` |

The PR body carries exactly three trailers, and each promotion commit carries one:

| Trailer | Value | Role |
|---|---|---|
| `PDLC-CONSOLIDATION-PASS` | `{passId}` | names the pass that opened the PR |
| `PDLC-CONSOLIDATION-SOURCES` | sorted consumed LEARNINGS basenames | pass provenance; **not** a duplicate key |
| `PDLC-CONSOLIDATION-PROMOTIONS` | sorted `{failure-mode-id}:{action}` pairs, one per proposal the PR enacts | the duplicate-PR key |
| `PDLC-PROMOTION-ID` (per commit) | `{id}:{action}` | names exactly the proposal that one commit enacts |
