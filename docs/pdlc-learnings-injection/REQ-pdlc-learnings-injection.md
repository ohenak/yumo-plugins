---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# REQ — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | **REQ** — operator handoff 2026-08-10 relaying the `regime-ledger` `wheel-paper-portfolio` run (this REQ is its record); `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft — awaiting operator review | Claude | 0.1 | 2026-08-10 |

> **Scope in one line.** At authoring-dispatch time, `orchestrate-dev` supplies each authoring
> role with the LEARNINGS the pipeline has already harvested from *earlier* features, as a
> bounded, deterministic, fail-open addition to the prompt — so a lesson paid for once is
> available the next time an author faces the same decision, without waiting for a
> consolidation pass to distil it.

## 1. Problem / Context

The pipeline harvests a LEARNINGS document at the end of every feature (Phase H), and that
document is where the run's durable signal survives after its cross-reviews are deleted. Today
that signal has exactly two consumers: a human reading the file, and the periodic consolidation
pass that distils some of it into project-level `docs/_constraints/` and `docs/_decisions/`
material. **The pipeline itself never reads it.** An author dispatched to write the next
feature's REQ, TSPEC or PROPERTIES is given the phase's grounding manifest and the upstream
documents — and nothing at all from the features that came before it.

The consequence is a loop that does not close within its own cadence. A lesson the pipeline paid
a full feature to learn is unavailable to the very next feature unless (a) a consolidation pass
has run since, *and* (b) that pass judged the lesson general enough to promote, *and* (c) the
promoted form landed in a file the phase's grounding already names. Any of those three failing —
and the first fails by default, because consolidation is periodic and the queue is not — leaves
the next author re-deriving, or re-making, a decision already recorded on disk one directory
over.

The operator handoff of 2026-08-10 (the `regime-ledger` `wheel-paper-portfolio` run) is the
occasion for this REQ but not the whole of its evidence. That run's specific pain points were
checked against the modules at HEAD and found already fixed; the one gap the check did **not**
close was this one — no mechanism injects sibling-feature LEARNINGS into an authoring dispatch.
This REQ is scoped to that gap alone.

### 1.1 Who has this problem

| ID | User story |
|---|---|
| US-01 | As the **operator**, I want the next feature's authors to start from what the last features taught, so that the same finding is not filed, argued and fixed a second time in a later review round. |
| US-02 | As the **operator running an unattended queue**, I want that carry-over to happen without me starting a consolidation pass or hand-pasting a document into a prompt, because nothing in an unattended run has a human turn to do it in. |
| US-03 | As the **pdlc maintainer**, I want the carry-over to be bounded and deterministic, so that adding it does not make prompts grow without limit as the corpus grows, and so that two runs over the same repository state ground their authors identically. |
| US-04 | As the **operator**, I want a missing, empty or unreadable LEARNINGS corpus to be a normal state rather than a pipeline failure, because the very first feature in a repository has no predecessors and must still run. |

### 1.2 What exists at HEAD

Recorded at authoring time against this repository, so a later reviewer can check the premise
rather than trust it:

1. **LEARNINGS is written, then read only by humans and consolidation.** `orchestrate-dev`
   composes and dispatches Phase H, scores the resulting document for structural completeness,
   and copies approval anchors into it. No phase dispatch composed for an authoring role
   references any LEARNINGS file belonging to a *different* feature.
2. **The corpus is already on disk and already conventional.** Per-feature LEARNINGS live at
   `docs/{feature}/LEARNINGS-{feature}.md`, and completed features are archived under
   `docs/completed/{feature}/`. Both locations are established conventions this feature reads;
   neither is introduced by it.
3. **The prompt budget is already contested.** Authoring dispatches already carry the phase's
   grounding manifest, the upstream documents and the pacing contract. Anything this feature
   adds competes for the same budget, which is why every acceptance criterion below is stated
   over a bound rather than over "the relevant learnings".

### 1.3 Relationship to `pdlc-consolidation-agent`

These two features consume the same corpus for different purposes at different times, and the
distinction is load-bearing enough to state before the goals:

| | `pdlc-consolidation-agent` | this feature |
|---|---|---|
| When it runs | Out of band, on a cadence, as its own pass | Inside a pipeline run, at authoring-dispatch time |
| What it produces | Durable project-level artifacts (`docs/_constraints/`, `docs/_decisions/`) and proposed skill-prompt changes, via a reviewable PR | Nothing durable — prompt text for one dispatch |
| Whose judgement decides | An agent distils; a human approves every promotion | No judgement; a stated selection rule over files that already exist |
| What it needs to have happened | Enough un-consolidated LEARNINGS to meet a cadence or volume trigger | Nothing beyond at least one prior LEARNINGS file existing |

The two compose and neither substitutes for the other. Consolidation answers *"which lessons
have become project law?"*; this feature answers *"what did the last features actually record,
while you write this one?"*. A repository where consolidation has never run still benefits from
this feature; a repository where it runs weekly still benefits, because the window between
passes is exactly where an unattended queue does its work.

## 2. Goals

- **G-1 — Prior lessons reach the next author, in-run.** *(US-01, US-02)* Every authoring
  dispatch for a PM-, SE- or TE-owned document is composed with material drawn from LEARNINGS
  documents of features other than the one being authored, taken from the repository state the
  run itself sees. No human turn, no separate pass and no configuration change is required for
  this to happen on a repository that already has LEARNINGS files.
- **G-2 — Bounded by construction, not by hope.** *(US-03)* What the dispatch carries is capped
  by declared limits (§4.1) that do not grow with the size of the corpus. A repository with two
  prior features and a repository with fifty produce dispatches whose injected material is
  within the same stated bound.
- **G-3 — Deterministic and observable.** *(US-03)* Two runs over the same repository state
  select the same material, in the same order. Which LEARNINGS documents were selected — and
  which were available but not selected — is visible in the run report, so an operator reading a
  surprising authoring result can see what the author was given rather than infer it.
- **G-4 — Fail-open, always.** *(US-04)* An absent, empty, malformed or unreadable corpus
  degrades the dispatch to exactly today's behaviour and records that it did so. No state of the
  corpus can halt a phase, fail a run, or change any convergence outcome.
- **G-5 — Pipeline semantics untouched.** *(US-03)* Round windows, completeness scoring, verdict
  parsing, approval anchors, erratum routing, POSTMORTEM lifecycle and queue lifecycle are
  unchanged. This feature changes what an author is told, never what the pipeline requires of
  what the author produces.
- **G-6 — Composes with consolidation rather than duplicating it.** *(US-01)* The feature reads
  the LEARNINGS corpus and, where they exist, the project-level artifacts consolidation has
  already produced. It writes neither, proposes no promotion, and its behaviour is identical
  whether or not a consolidation pass has ever run.

## 3. Non-Goals

- **NG-1 — No distillation, promotion or project-level authorship.** This feature never writes
  or proposes an edit to `docs/_constraints/`, `docs/_decisions/`, any skill prompt, or any
  LEARNINGS file. Distilling recurring lessons into durable project law is
  `pdlc-consolidation-agent`'s job and stays there (§1.3); nothing here duplicates its
  distillation, its promotion bar, its PR mechanism or its effectiveness loop.
- **NG-2 — No judgement about relevance.** Selection is a stated rule over documents that
  exist, not an agent deciding which lessons matter. A "pick the most relevant learnings"
  dispatch is explicitly rejected: it would add a model call, a nondeterminism source and a
  failure mode to the front of every authoring phase.
- **NG-3 — No change to the LEARNINGS grammar.** Section structure, the completeness criterion,
  the approval record and the harvest metadata table are unchanged. This feature is a reader of
  the existing format.
- **NG-4 — No new corpus, index, cache or state file.** Nothing is written to disk to make
  selection work. If selection needs a fact, it is derived from the files at the time of
  dispatch.
- **NG-5 — Not applied to review, implementation, DoD or harvest dispatches.** Scope is the
  authoring roles named in §4 C-1. Widening it later is a separate decision with its own
  evidence, not an implicit extension of this one.
- **NG-6 — No cross-repository reading.** Only LEARNINGS inside the consumer repository the run
  is executing in are read. Consolidating or borrowing across repositories remains
  `pdlc-consolidation-agent`'s deferral D-CONS-02, untouched here.
- **NG-7 — No configuration surface beyond the thresholds in §4.1.** No per-feature allow-list,
  no per-phase override, no exclusion syntax. A repository either has LEARNINGS or does not.

## 4. Constraints

- **C-1 — The affected dispatches are a closed, named set.** Injection applies to authoring
  dispatches for exactly these documents: REQ and FSPEC (PM role), TSPEC, PLAN and DECISIONS
  (SE role), and PROPERTIES (TE role). Every other dispatch the pipeline makes — reviews,
  implementation, DoD verification and remediation, harvest, ship, advisory seams — is unchanged
  and must be observably unchanged (NG-5).
- **C-2 — Self-exclusion.** The feature currently being authored never contributes its own
  LEARNINGS document to its own dispatch, in any phase, including a re-run of a feature whose
  LEARNINGS already exists from an earlier completed attempt.
- **C-3 — The corpus is read-only and its locations are the established ones.** Per-feature
  LEARNINGS under `docs/{feature}/` and archived features under `docs/completed/{feature}/` are
  the corpus. `docs/discarded/` is excluded, matching the treatment abandoned work already
  receives elsewhere in the pipeline. No file in the corpus is written, moved, deleted or
  reformatted by this feature.
- **C-4 — Injected material is labelled advisory, and its status is stated to the author.** The
  material arrives delimited and identified by its source document, and the author is told that
  it is prior-feature context, not a requirement of the feature being authored and not an
  upstream document being traced. An author must be able to disregard it without leaving a gap
  in what they were asked to produce.
- **C-5 — Determinism has no clock and no model in it.** Selection is a total function of the
  repository state at dispatch time. It consults no wall clock, makes no model call, and yields
  the same result and the same order for the same state. Every input it uses is recorded in the
  run report (G-3) so the selection can be reproduced from the report alone.
- **C-6 — Injected material is not in the errata channel.** A defect an author notices in an
  injected LEARNINGS document is not an `ERRATUM` against an upstream document, because a
  sibling feature's LEARNINGS is not this feature's upstream. It is reported in the run report
  and left for a human; the erratum mechanism's bounded per-document rounds are untouched.
- **C-7 — Fail-open is unconditional and total.** Every corpus state — directory absent, no
  files, a file unreadable, a file that does not parse as LEARNINGS, a file exceeding every
  bound — resolves to a defined outcome that is at worst "inject nothing, record why". No corpus
  state produces an exception, a halt, a POSTMORTEM, or a changed convergence outcome (G-4).
- **C-8 — The budget is shared, not additive.** The material injected competes with the prompt
  content the dispatch already carries; the grounding manifest, upstream documents and pacing
  contract are never displaced, shortened or reordered to make room. When the bound in §4.1
  cannot be honoured alongside them, less is injected — never something existing removed.
- **C-9 — Operator-visible strings and parsed values are disciplined** *(DC-01)*. Each report
  line and each notice this feature emits is a registered catalogue entry asserted by id, and
  every value read out of a corpus file is read by a total function with a defined outcome for
  malformed input.

### 4.1 Declared thresholds

Every threshold an acceptance criterion below relies on, with its default and its owner. No AC
may depend on a tunable that is not listed here. All live under `.claude/pdlc.config.json` in
the consumer repository unless stated otherwise.

| Name | Default | Owner | Used by |
|---|---|---|---|
| `learningsInjection.enabled` | `true` | consumer config | AC-1.1, AC-5.1 |
| `learningsInjection.maxDocuments` | 5 documents per dispatch | consumer config | AC-2.1, AC-2.2 |
| `learningsInjection.maxBytesPerDocument` | 6,000 bytes | consumer config | AC-2.3 |
| `learningsInjection.maxTotalBytes` | 20,000 bytes per dispatch | consumer config | AC-2.3, AC-2.4 |

**Derivation, stated honestly.** These are a declared starting point, not a measured floor. The
document count comes from the corpus size this repository actually has (a handful of completed
features, of which the most recent few are the ones an author would read); the byte figures are
set so that a full complement of documents stays well inside the room an authoring dispatch has
left after its grounding manifest and upstream documents, under the same per-write discipline
authors already work to. O-1 obliges measuring the realised prompt sizes on a live run and
re-deriving all three before they are treated as settled.

### 4.2 Upstream dependencies

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | A LEARNINGS corpus of at least two prior features in the consumer repository | Files already on disk (`docs/{feature}/` and `docs/completed/{feature}/`) | **Met** in this repository and in `regime-ledger`. Does **not** gate FSPEC: AC-5.1's empty-corpus behaviour is a first-class specified state |
| BL-02 | The harvest metadata a LEARNINGS document carries, as the ordering input (§5 Group 2) | Existing convention, `harvest-learnings` output | Must exist at HEAD before FSPEC authoring; O-2 records the measured shape and the total fallback for documents lacking it |
| BL-03 | `pdlc-consolidation-agent` delivered | PR merged | **Not required.** This feature composes with it (§1.3, G-6) but does not consume anything it produces; the queue row therefore declares no dependency on it |

## 5. Acceptance Criteria

Each criterion is stated so a test engineer can derive a failing test from it without asking a
question. `{f}` denotes the feature being authored; `{p}` denotes a prior feature.

**Group 1 — the material reaches the authoring roles** *(US-01, US-02; G-1; C-1, C-2, C-4)*

- **AC-1.1** *Who:* the operator. *Given* a repository holding LEARNINGS documents for two or
  more prior features `{p}` and a run authoring feature `{f}` with
  `learningsInjection.enabled` at its default, *when* any of the six authoring dispatches named
  in C-1 is composed, *then* the composed dispatch contains material drawn from at least one
  `{p}` LEARNINGS document, delimited and identified by its source document path.
- **AC-1.2** *Given* the same run, *when* every dispatch the pipeline makes is inspected, *then*
  exactly the six authoring dispatches of C-1 carry injected material and **no other dispatch
  does** — reviews, implementation, DoD verification and remediation, harvest, ship and the
  advisory seams are byte-identical to the same run with injection disabled.
- **AC-1.3** *Given* a repository where `docs/{f}/LEARNINGS-{f}.md` already exists (a re-run of a
  previously harvested feature), *when* any authoring dispatch for `{f}` is composed, *then* it
  contains no material from that document, in any phase (C-2).
- **AC-1.4** *Given* any dispatch carrying injected material, *when* it is inspected, *then* the
  material is introduced by text that states it is prior-feature context, that it is neither a
  requirement of `{f}` nor an upstream document to be traced, and that the author may disregard
  it (C-4); and *then* the dispatch's existing grounding manifest, upstream documents and pacing
  contract appear unchanged and in their existing order (C-8).

**Group 2 — bounded, deterministic selection** *(US-03; G-2, G-3; C-3, C-5)*

- **AC-2.1** *Given* a corpus of `N` prior LEARNINGS documents for any `N`, *when* a dispatch is
  composed, *then* the number of source documents contributing to it is at most
  `learningsInjection.maxDocuments`, and for `N` greater than that threshold the count equals it
  exactly — a corpus of 5 and a corpus of 50 produce the same document count.
- **AC-2.2** *Given* `N` greater than `learningsInjection.maxDocuments`, *when* the selection is
  compared against the corpus, *then* the documents selected are the highest-ordered ones under
  a **stated total ordering** whose sole inputs are facts carried by the documents and their
  paths — the recency the harvest metadata records, with a defined, documented fallback for any
  document not carrying it — and never wall-clock time, file mtime, or a model's judgement
  (C-5, NG-2).
- **AC-2.3** *Given* a corpus containing a document larger than
  `learningsInjection.maxBytesPerDocument`, *when* it is selected, *then* the material taken
  from it does not exceed that threshold, the total across all selected documents does not
  exceed `learningsInjection.maxTotalBytes`, and the report states for each such document that
  it was bounded.
- **AC-2.4** *Given* selected documents whose combined material would exceed
  `learningsInjection.maxTotalBytes`, *when* the dispatch is composed, *then* the excess is
  resolved by dropping whole documents from the low end of the ordering — never by silently
  cutting one mid-document beyond the per-document bound — and each dropped document appears in
  the report as available-but-not-selected (AC-3.2).
- **AC-2.5** *Given* two runs over an identical repository state, *when* the two composed
  dispatches for the same document type are compared, *then* the injected material is
  byte-identical, including order (G-3, C-5).
- **AC-2.6** *Given* a corpus containing a LEARNINGS document under `docs/discarded/`, *when*
  selection runs, *then* that document is not selected and does not count toward any threshold
  (C-3); *and given* one under `docs/completed/{p}/`, it is eligible on the same terms as one
  under `docs/{p}/`.

**Group 3 — observability** *(US-03; G-3; C-9)*

- **AC-3.1** *Given* a completed or halted run in which injection was active, *when* the run
  report is read, *then* it carries, per authoring dispatch: the source document paths selected,
  in the order used, and the total bytes injected. A dispatch that injected nothing carries an
  empty set of rows, not a missing field.
- **AC-3.2** *Given* the same report, *when* it is read, *then* it also names the corpus
  documents that were **available but not selected**, with the reason for each drawn from a
  closed set (below the count threshold's cut, dropped for the total byte bound, excluded as the
  authored feature's own, unreadable, unparseable) — so an operator can tell an absent lesson
  from an unread one.
- **AC-3.3** *Given* an operator holding only the run report, *when* they reproduce the
  selection by hand against the same repository state, *then* every input the rule used is
  present in the report and the reproduction matches (C-5).
- **AC-3.4** *Given* an author that notices a defect in an injected document, *when* it reports
  the defect, *then* the report surfaces it as a note against the named source document and
  **no** erratum round is opened against any upstream document of `{f}` (C-6).

**Group 4 — fail-open under every corpus state** *(US-04; G-4; C-7)*

- **AC-4.1** *Given* a repository with no prior LEARNINGS document at all — the first feature
  ever run there — *when* the pipeline runs, *then* every authoring dispatch is composed exactly
  as it is today, the run completes with unchanged behaviour, and the report records that the
  corpus was empty rather than omitting the field.
- **AC-4.2** *Given* a corpus file that cannot be read, or that reads but does not parse as a
  LEARNINGS document, *when* selection runs, *then* that file is skipped with its reason
  recorded (AC-3.2), the remaining corpus is used normally, and no exception, halt or POSTMORTEM
  results.
- **AC-4.3** *Given* any corpus state whatsoever, *when* the run is compared against the same run
  with `learningsInjection.enabled` set to `false`, *then* the set of artifacts produced, every
  verdict, every round count and the halt/complete outcome are unchanged — the corpus can change
  what an author reads, never whether the pipeline converges (G-4, G-5).
- **AC-4.4** *Given* thresholds in §4.1 configured to values that admit nothing (zero documents
  or zero bytes), *when* the pipeline runs, *then* it behaves exactly as the disabled case and
  records that it did, rather than treating the configuration as invalid and refusing.

**Group 5 — inertness when disabled, and semantics preserved** *(G-5; NG-3, NG-4, NG-7)*

- **AC-5.1** *Given* `learningsInjection.enabled` set to `false`, or the configuration section
  absent or malformed, *when* the pipeline runs, *then* no corpus file is opened, every composed
  dispatch is byte-identical to the pre-feature baseline, and the run report carries no
  injection summary at all — the key is absent, not present-and-empty.
- **AC-5.2** *Given* a run with injection active, *when* the filesystem is observed for its whole
  duration, *then* no file under `docs/_constraints/`, `docs/_decisions/`, any LEARNINGS
  document, or any skill prompt is written, and no new index, cache or state file is created
  anywhere (NG-1, NG-4).
- **AC-5.3** *Given* a run with injection active, *when* the documents it produces are scored,
  *then* the completeness criteria, required headings, verdict grammar, round windows and
  approval anchors are exactly those in force without it — this feature adds no new requirement
  on what an author must produce (G-5, NG-3).

**Group 6 — verification strategy** *(Team Principle 2)*

- **AC-6.1** *Given* the test suite, *when* it runs in CI, *then* selection, bounding, ordering
  and every fail-open state of Group 4 are exercised against fixture corpora with **no live
  model calls**, and the determinism of AC-2.5 is asserted by comparing two compositions rather
  than by inspection.
- **AC-6.2** *Given* the disabled configuration, *when* the suite runs, *then* it asserts the
  byte-identity of AC-5.1 against a recorded baseline, so a regression that leaks injected text
  into a disabled run is a test failure rather than a discovery.

## 6. Risks

- **R-1 — Prompt budget crowding.** Injection competes with material an authoring dispatch
  already needs, and the observable failure is not an error but a worse document. Mitigation:
  C-8 makes existing content non-displaceable, §4.1 caps the addition, and O-1 obliges measuring
  realised prompt sizes on a live run before the caps are treated as settled.
- **R-2 — Stale or wrong lessons carried forward.** A LEARNINGS document records what was true
  for its feature; injected into a later one it may be obsolete, or right for a context that has
  changed. Mitigation: C-4's labelling makes its status explicit rather than authoritative, and
  AC-3.4 gives the author a reporting channel that does not route a sibling document's defect
  into the erratum mechanism. The deeper answer — deciding which lessons have become project
  law — is consolidation's, by design (§1.3).
- **R-3 — Recency is a proxy for relevance, and a poor one.** The ordering of AC-2.2 selects the
  latest, not the most applicable; a feature in an unrelated area can crowd out the one that
  mattered. This is a deliberate trade against NG-2's rejection of a judgement call at the front
  of every authoring phase. Mitigation: O-3 obliges recording, from real runs, whether authors
  actually used the injected material, so a later relevance rule is proposed from evidence
  rather than from intuition.
- **R-4 — Authors treating injected text as requirements.** The worst outcome is an author
  importing a prior feature's decisions into this feature's document, producing scope creep that
  survives review because it reads as grounded. Mitigation: C-4 and AC-1.4 state the material's
  status in the dispatch itself; O-3's usage record is also the detector for this failure mode.
- **R-5 — Overlap pressure with consolidation.** Two mechanisms reading one corpus invite scope
  drift — an injection rule that starts summarising, ranking or promoting is consolidation
  rebuilt badly. Mitigation: NG-1 and NG-2 are stated as absolutes rather than defaults, and
  AC-5.2 asserts the write-side boundary observationally rather than by intent.
- **R-6 — Corpus growth changing behaviour silently.** As a repository accumulates features, the
  selected set turns over even though nothing about the feature changed. Mitigation: AC-3.1 and
  AC-3.2 put both the selected and the unselected sets in the run report, so the turnover is
  visible in the record of every run rather than inferred later.

## 7. Obligations / Open Questions

- **O-1** Measure the realised authoring-dispatch prompt sizes with injection active on a live
  run, and re-derive `learningsInjection.maxDocuments`, `maxBytesPerDocument` and
  `maxTotalBytes` (§4.1) from that measurement before treating them as settled. The current
  values are a declared starting point, not a measured floor.
- **O-2** Record the harvest metadata a LEARNINGS document actually carries at HEAD (BL-02),
  measured from the documents in this repository and in `regime-ledger`, and state the total
  fallback ordering for documents that do not carry it — before FSPEC authoring, so AC-2.2's
  ordering is specified over a measured shape rather than an assumed one.
- **O-3** Record, from real runs, whether authors used the injected material and whether any
  document shows the R-4 failure mode (prior-feature decisions imported as requirements). This
  is the evidence base for any later relevance rule and for retiring or widening the feature; it
  is an operator-and-report obligation, not a code deliverable of this REQ.
- **O-4** Decide which part of each LEARNINGS document is injected when the per-document bound
  binds (AC-2.3) — the whole document up to the bound, or a named subset of its sections. The
  decision is FSPEC's; this REQ requires only that the outcome be bounded, deterministic and
  reported.
- **O-5** Confirm with the operator that the consumer-config location of §4.1 is right, given
  that a consumer repository already carries `.claude/pdlc.config.json` for
  `implementation.testCommand` and the advisory tier. No AC depends on the answer; the keys move
  together if it changes.
- **O-6** *(open question, deliberately unresolved)* Whether the review roles should receive the
  same material. NG-5 excludes them for now on the argument that a reviewer grounded in a prior
  feature's lessons may file findings this feature's REQ never asked for. Revisit with O-3's
  usage evidence; a widening is a successor REQ with its own queue row, not an extension of this
  one.

