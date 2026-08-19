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
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v2.md`, `CROSS-REVIEW-test-engineer-REQ-v2.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft — round 2 findings addressed | Claude | 0.3 | 2026-08-18 |

> **Scope in one line.** At authoring-dispatch time, `orchestrate-dev` supplies each authoring
> role with the LEARNINGS the pipeline has already harvested from *earlier* features, as a
> bounded, deterministic, fail-open addition to the prompt — so a lesson paid for once is
> available the next time an author faces the same decision, without waiting for a
> consolidation pass to distil it.

## 1. Problem / Context

The pipeline harvests a LEARNINGS document at the end of every feature (Phase H), and that document
is where the run's durable signal survives after its cross-reviews are deleted. The pipeline reads a
feature's LEARNINGS only for that feature's own purposes — harvest completeness scoring and a Tier-2
approval record (§1.2 claim 1). **No author is ever composed with a different feature's LEARNINGS.**
An author dispatched to write the next feature's REQ, TSPEC or PROPERTIES gets the phase's grounding
manifest and the upstream documents, and nothing from the features that came before it.

So the loop does not close within its own cadence. A lesson the pipeline paid a full feature to
learn is unavailable to the very next feature unless (a) a consolidation pass has run since, *and*
(b) that pass judged the lesson general enough to promote, *and* (c) the promoted form landed in a
file the phase's grounding already names. Any of the three failing — and the first fails by default,
because consolidation is periodic and the queue is not — leaves the next author re-deriving a
decision already recorded on disk one directory over.

The operator handoff of 2026-08-10 (the `regime-ledger` `wheel-paper-portfolio` run) is the occasion
for this REQ, not the whole of its evidence: that run's pain points were checked against the modules
at HEAD and found already fixed, except this one gap. This REQ is scoped to it alone.

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

1. **No authoring dispatch is composed with another feature's LEARNINGS.** `orchestrate-dev` does
   read LEARNINGS today: it dispatches harvest, scores the resulting document for structural
   completeness, and reads `docs/{f}/LEARNINGS-{f}.md` as the Tier-2 approval-record source when a
   round produced no cross-review file. Every one of those reads is the *authored feature's own*
   LEARNINGS. No dispatch composed for an authoring role carries material from a **different**
   feature's LEARNINGS — the narrower claim this REQ rests on. C-2's self-exclusion leaves the
   existing Tier-2 reader undisturbed.
2. **The corpus is on disk, conventional, and already enumerated by shipped code.** Per-feature
   LEARNINGS live at `docs/{feature}/LEARNINGS-{feature}.md`; completed features are archived under
   `docs/completed/{feature}/`. `pdlc-consolidation-agent` already ships an enumeration over exactly
   those two locations — tracked and untracked but not ignored, `docs/discarded/` excluded by
   pathspec, with a fail-open outcome when the listing itself fails
   (DECISIONS-pdlc-consolidation-agent § DEC-CONS-05). This feature reuses that shipped **pass-side**
   enumeration (`LS_FILES_ARGV`, `pdlc/workflows/consolidate-learnings.js`) inside the same JS
   bundle rather than authoring a second one (C-3, G-6). DEC-CONS-05 ships *one predicate, two
   enumerations*, so nothing here claims its readers agree as sets (C-3).
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

- **G-1 — Prior lessons reach the next author, in-run.** *(US-01, US-02)* Every authoring dispatch
  for a PM-, SE- or TE-owned document is composed with material drawn from LEARNINGS documents of
  features other than the one being authored, taken from the repository state the run itself sees.
  No human turn, no separate pass and no configuration change is required on a repository that
  already has LEARNINGS files.
- **G-2 — Bounded by construction, not by hope.** *(US-03)* What a dispatch carries is capped by
  declared limits (§4.1) that do not grow with the corpus. A repository with two prior features and
  one with fifty produce dispatches whose injected material is within the same stated bound.
- **G-3 — Deterministic and observable.** *(US-03)* Two runs over the same repository state select
  the same material in the same order, and which documents were selected — and which were available
  but not selected — is visible in the run report, so an operator reading a surprising authoring
  result can see what the author was given rather than infer it.
- **G-4 — Fail-open, always.** *(US-04)* An absent, empty, malformed, truncated or unreadable
  corpus, or a corpus listing that fails outright, degrades the dispatch to exactly today's
  behaviour and records that it did so. No state of the corpus can halt a phase, fail a run, or
  change any convergence outcome.
- **G-5 — Pipeline semantics untouched.** *(US-03)* Round windows, completeness scoring, verdict
  parsing, approval anchors, erratum routing, POSTMORTEM and queue lifecycle are unchanged. This
  feature changes what an author is told, never what the pipeline requires of what they produce.
- **G-6 — Composes with consolidation rather than duplicating it.** *(US-01)* The feature reads the
  LEARNINGS corpus — by the same definition consolidation already uses (C-3) — and, where they
  exist, the project-level artifacts consolidation produced. It writes neither, proposes no
  promotion, and behaves identically whether or not a consolidation pass has ever run.
## 3. Non-Goals

- **NG-1 — No distillation, promotion or project-level authorship.** This feature never writes or
  proposes an edit to `docs/_constraints/`, `docs/_decisions/`, any skill prompt, or any LEARNINGS
  file. Distilling recurring lessons into durable project law is `pdlc-consolidation-agent`'s job
  and stays there (§1.3): its promotion bar, PR mechanism and effectiveness loop are not duplicated.
- **NG-2 — No judgement about relevance.** Selection is a stated rule over documents that exist, not
  an agent deciding which lessons matter. A "pick the most relevant learnings" dispatch is rejected:
  it adds a model call, a nondeterminism source and a failure mode to the front of every phase.
- **NG-3 — No change to the LEARNINGS grammar.** Section structure, the completeness criterion, the
  approval record and the harvest metadata table are unchanged; this feature reads the format.
- **NG-4 — No new corpus, index, cache or state file.** Nothing is written to disk to make selection
  work; any fact selection needs is derived from the files at dispatch time.
- **NG-5 — Not applied to review, implementation, DoD or harvest dispatches.** Scope is C-1's rule.
  Widening it later is a separate decision with its own evidence, not an implicit extension.
- **NG-6 — No cross-repository reading.** Only LEARNINGS inside the consumer repository the run
  executes in are read; borrowing across repositories remains `pdlc-consolidation-agent`'s deferral
  D-CONS-02, untouched here.
- **NG-7 — No configuration surface beyond §4.1's thresholds.** No per-feature allow-list, no
  per-phase override, no exclusion syntax. A repository either has LEARNINGS or does not.
## 4. Constraints

- **C-1 — The affected dispatches are those the pipeline already classifies as authoring.** Injection
  applies to every dispatch the pipeline tags `dispatchKind: "authoring"` at HEAD (its creator,
  optimizer and erratum sites in `orchestrate-dev.js`) whose target document is REQ, FSPEC,
  TSPEC, PLAN, DECISIONS or PROPERTIES: the phase's creator dispatch where it has one,
  the optimizer (revision) dispatch of each review round, and an erratum dispatch against one of
  those documents. This is deliberately a rule over the taxonomy that already exists rather than a
  hand-counted set of six, because at HEAD Phase R has **no creator** (a REQ arrives already
  authored, so its only authoring dispatches are `pm-author` optimizer rounds), the DECISIONS phase
  is conditional and may not run at all, and optimizer dispatches recur once per review round. Every
  dispatch outside that rule — reviews, implementation, DoD verification and remediation, harvest,
  ship, advisory seams — is unchanged and observably unchanged (NG-5).

- **C-2 — Self-exclusion.** The feature currently being authored never contributes its own
  LEARNINGS document to its own dispatch, in any phase, including a re-run of a feature whose
  LEARNINGS already exists from an earlier completed attempt.
- **C-3 — The corpus definition, reused from consolidation's pass side, read-only.** The corpus is the LEARNINGS
  documents under `docs/{feature}/` and `docs/completed/{feature}/`, tracked or untracked,
  **excluding** files git ignores and excluding `docs/discarded/` — the definition
  `pdlc-consolidation-agent` already ships (§1.2 claim 2; DECISIONS-pdlc-consolidation-agent
  § DEC-CONS-05). Reuse is of the pass-side enumeration in that JS bundle, not of a definition held
  equal across its readers: DEC-CONS-05 pins the pass's and the `SessionStart` hook's enumerations
  literally, having rejected both a shared implementation and an enumeration set-equality
  assertion (red on correct code). No file in the corpus is written, moved, deleted or reformatted
  by this feature.

- **C-4 — Injected material is labelled advisory, and its status is stated to the author.** The
  material arrives delimited and identified by its source document, and the author is told that
  it is prior-feature context, not a requirement of the feature being authored and not an
  upstream document being traced. An author must be able to disregard it without leaving a gap
  in what they were asked to produce.
- **C-5 — Determinism: no clock, and no model deciding what is selected.** Selection is a total
  function of repository state at dispatch time: no wall clock, no model judgement about which
  lessons matter (NG-2), same state ⇒ the same documents in the same order, and every input the rule
  used recorded in the run report (G-3) so the selection is reproducible from the report alone. It
  is **not** claimed that no model call occurs: on the Claude Code runtime channel the pipeline's
  file listing and reading seams are themselves model-mediated, while on the engine's plain-Node
  channel they are not. AC-2.5's byte-identity across two runs is asserted where the transport is
  deterministic; where a listing or read reports failure rather than content, C-7 governs — inject
  nothing from that source and record why, never read an unreadable listing as an empty corpus.

- **C-6 — Injected material is not in the errata channel.** A defect an author notices in an
  injected LEARNINGS document is not an `ERRATUM` against an upstream document, because a
  sibling feature's LEARNINGS is not this feature's upstream. The run report's record of what was
  injected (AC-3.1) is the trace a human follows; this feature adds no author-emitted channel and
  leaves the erratum mechanism's bounded per-document rounds untouched.
- **C-7 — Fail-open is unconditional and total.** Every corpus state — directory absent, no files,
  the listing itself failing, a file unreadable, a file truncated mid-document, a file that does not
  parse as a LEARNINGS document, a file exceeding every bound — resolves to a defined outcome whose
  worst case is "inject nothing, record why". "I could not find out" never collapses into "there is
  nothing". No corpus state produces an exception, a halt, a POSTMORTEM, or a changed convergence
  outcome (G-4).

- **C-8 — The budget is shared, not additive.** The material injected competes with the prompt
  content the dispatch already carries; the grounding manifest, upstream documents and pacing
  contract are never displaced, shortened or reordered to make room. When the bound in §4.1
  cannot be honoured alongside them, less is injected — never something existing removed.
- **C-9 — Operator-visible strings are catalogued; every input state is total** *(DC-01)*. Every
  report line and notice this feature emits is a registered catalogue entry with an id a test can
  assert on — including AC-3.2's per-document reason and corpus-level outcome ids, and AC-5.1b's
  malformed-configuration notice.
  On the receive side, every corpus input state and every configuration state — absent, malformed,
  truncated — resolves to a defined outcome (C-7, Group 4). How the catalogue is registered is
  TSPEC's; the closure of the set and the id-per-reason discipline are requirements.

### 4.1 Declared thresholds

Every threshold an acceptance criterion below relies on, with its default and its owner. No AC
may depend on a tunable that is not listed here. All live under `.claude/pdlc.config.json` in
the consumer repository unless stated otherwise.

| Name | Default | Owner | Used by |
|---|---|---|---|
| `learningsInjection.enabled` | `true` | consumer config | AC-1.1, AC-5.1a, AC-5.1b |
| `learningsInjection.maxDocuments` | 5 documents per dispatch | consumer config | AC-2.1, AC-2.2 |
| `learningsInjection.maxBytesPerDocument` | 6,000 bytes | consumer config | AC-2.3 |
| `learningsInjection.maxTotalBytes` | 20,000 bytes per dispatch | consumer config | AC-2.3, AC-2.4 |

**Derivation, stated honestly.** These are a declared starting point, not a measured floor. The
document count is set by corpus size (a repository has a handful of completed features); the byte
figures are set so a full complement stays inside the room an authoring dispatch has left after its
grounding manifest and upstream documents. Because injection is re-composed per authoring dispatch
(C-1), run-level cost scales with rounds, not phases. O-1 obliges measuring realised prompt sizes on
a live run and re-deriving all three before they are treated as settled.

### 4.2 Upstream dependencies

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | A LEARNINGS corpus of at least one prior feature in the consumer repository | Files already on disk (`docs/{feature}/` and `docs/completed/{feature}/`) | **Met** in this repository and in `regime-ledger`. Does **not** gate FSPEC: AC-4.1's empty-corpus behaviour is a first-class specified state |
| BL-02 | The harvest metadata a LEARNINGS document carries, as the ordering input (§5 Group 2) | Existing convention, `harvest-learnings` output | Must exist at HEAD before FSPEC authoring; O-2 records the measured shape and the total fallback for documents lacking it |
| BL-03 | `pdlc-consolidation-agent` delivered | PR merged | **Not required.** This feature composes with it (§1.3, G-6) but does not consume anything it produces; the queue row therefore declares no dependency on it |

## 5. Acceptance Criteria

Each criterion is stated so a test engineer can derive a failing test from it without asking a
question. `{f}` denotes the feature being authored; `{p}` denotes a prior feature.

**Group 1 — the material reaches the authoring roles** *(US-01, US-02; G-1; C-1, C-2, C-4)*

- **AC-1.1** *Who:* the operator. *Given* a repository holding LEARNINGS documents for at least one
  prior feature `{p}`, and a run authoring `{f}` with `learningsInjection.enabled` at its default,
  *when* any dispatch matching C-1's rule is composed — creator, optimizer round, or erratum — *then*
  that dispatch contains material drawn from at least one `{p}` LEARNINGS document, delimited and
  identified by source document path. Derived over the dispatches a run actually makes: Phase R has
  no creator at HEAD, so a fixed count of six is not the oracle.
- **AC-1.2** *Given* the same run, *when* every dispatch the pipeline made is inspected, *then* the
  set carrying injected material equals exactly the set C-1's rule names — no more, no fewer — and
  every dispatch outside it (reviews, implementation, DoD verification and remediation, harvest,
  ship, advisory seams) is byte-identical to the same run with injection disabled — asserted under
  AC-6.1's fixtures, not by comparing live runs (AC-4.3). The oracle is a set equality over the pipeline's own dispatch classification evaluated against the run that
  happened, so a run with no DECISIONS phase, or with five optimizer rounds, satisfies it as stated
  rather than vacuously.
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
- **AC-2.2** *Given* a corpus whose `N` exceeds `learningsInjection.maxDocuments`, *when* a dispatch
  is composed, *then* the selected documents are the highest-ordered under a total ordering that is
  a function of repository state alone, with a **total tiebreak**: where the ordering key is absent,
  unparseable or equal — the common case, since the harvest metadata date row is free text and no
  completeness criterion checks its parseability — rank falls back to byte order over the document
  path, as the shipped corpus enumeration already does (DEC-CONS-05). The ordering never consults
  wall-clock time, file mtime, or a model's judgement (C-5, NG-2). The ordering key itself is O-2's
  to bind before FSPEC authoring; two properties are testable today without it: permuting file
  mtimes and re-running yields an identical selection, and renaming a document's containing
  directory without changing its content does not change its rank.
- **AC-2.3** *Given* a corpus containing a document larger than
  `learningsInjection.maxBytesPerDocument`, *when* it is selected, *then* the material taken from it
  does not exceed that threshold, the total across selected documents does not exceed
  `learningsInjection.maxTotalBytes`, and that document's report row carries the per-document
  bounded flag AC-3.1 enumerates.
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

- **AC-3.1** *Given* a completed or halted run in which injection was active, *when* the run report
  is read, *then* it carries, per authoring dispatch: the source document paths selected, in the
  order used; the bytes injected per document; per document, whether its material was bounded
  (AC-2.3); and the total bytes injected. A dispatch that injected nothing carries an empty set of
  rows, not a missing field. The enumeration is closed over these per-dispatch row fields alone (a
  completeness test asserts set equality); AC-3.3's rule inputs are a separate run-level record
  with its own closure.
- **AC-3.2** *Given* the same report, *when* it is read, *then* it also names the corpus documents
  **not** selected, each with a **per-document** reason drawn from a closed set of catalogued ids
  (C-9): `RSN-COUNT` (below the count threshold's cut), `RSN-BYTES` (dropped by the total byte
  bound), `RSN-SELF` (the authored feature's own, C-2), `RSN-UNREADABLE`, `RSN-UNPARSEABLE` (read,
  not a LEARNINGS document), `RSN-TRUNCATED` (cut mid-document). States in which no document is
  known are **corpus-level outcomes**, recorded once per run, drawn from their own closed set:
  `RSN-UNLISTABLE` (the listing failed) and `RSN-EMPTY` (none found). Two set-equality tests, one
  per catalogue; with such an outcome recorded, AC-3.1's rows are present and empty.
- **AC-3.3** *Given* an operator holding only the run report, *when* they reproduce the
  selection by hand against the same repository state, *then* every input the rule used — the
  ordering key value per document and the §4.1 thresholds in force — is in the report's run-level
  record, and the reproduction matches (C-5).
- **AC-3.4** *Given* an author who notices a defect in an injected LEARNINGS document, *when* the run
  finishes, *then* **no** erratum round is opened against any upstream document of `{f}` on account
  of it, and the report's AC-3.1 rows name the source document — the trace an operator follows. This
  feature opens no new author-emitted channel and requires nothing new of any author (G-5, NG-3);
  defects observed in injected material are O-3's operator-side record.

**Group 4 — fail-open under every corpus state** *(US-04; G-4; C-7)*

- **AC-4.1** *Given* a repository with no prior LEARNINGS document at all — the first feature
  ever run there — *when* the pipeline runs, *then* every authoring dispatch is composed exactly
  as it is today, the run completes with unchanged behaviour, and the report records that the
  corpus-level `RSN-EMPTY` outcome (AC-3.2) rather than omitting the field.
- **AC-4.2** *Given* a corpus file that cannot be read, that reads but does not parse as a LEARNINGS
  document, or that is truncated mid-document, *and* separately given a corpus listing that fails
  outright, *when* selection runs, *then* the affected document is skipped with its per-document
  reason id recorded and the rest of the corpus used normally, a failed listing injects nothing and
  records `RSN-UNLISTABLE` at corpus level (AC-3.2), and
  no exception, halt or POSTMORTEM results.
- **AC-4.3** *Given* any corpus state whatsoever, *when* the convergence machinery is inspected,
  *then* no injection-derived value reaches any gate input: verdict parsing, structural completeness
  scoring, round-window arithmetic, approval anchors and erratum routing consume nothing selection
  produced, and non-authoring dispatch prompts stay byte-identical to the disabled run (AC-1.2).
  This is the falsifiable form of "the corpus changes what an author reads, never whether the
  pipeline converges" (G-4, G-5): comparing verdicts or round counts across live runs measures model
  nondeterminism, and comparing them under AC-6.1's scripted fixtures is vacuous.
- **AC-4.4** *Given* thresholds in §4.1 configured to values that admit nothing (zero documents
  or zero bytes), *when* the pipeline runs, *then* it behaves as an enabled run whose selection is
  empty — AC-3.1's empty rows, not AC-5.1a's absent key — rather than treating the configuration
  as invalid and refusing.

**Group 5 — inertness when disabled, and semantics preserved** *(G-5; NG-3, NG-4, NG-7)*

- **AC-5.1a** *Given* `learningsInjection.enabled` set to `false`, or the configuration section
  absent, *when* the pipeline runs, *then* every composed dispatch is byte-identical to AC-6.2's
  recorded baseline — the same comparand on both branches — and the run report
  carries no injection summary at all — the key is absent, not present-and-empty.
- **AC-5.1b** *Given* a configuration section present but malformed or unparseable (an operator typo
  such as `learningsInjectoin`), *when* the pipeline runs, *then* behaviour is AC-5.1a's **and** the
  report carries a catalogued notice naming the malformed configuration, so a typo is
  distinguishable from a deliberate disable rather than byte-identical to it (DC-01, C-9).
- **AC-5.2** *Given* a run with injection active, *when* the filesystem is observed for the whole
  run, *then* the corpus paths touched are exactly the reads of the documents AC-3.1 and AC-3.2 name
  — a positive membership claim, not an absence-only one — and no file under `docs/_constraints/` or
  `docs/_decisions/`, no LEARNINGS document and no skill prompt is written, and no new index, cache
  or state file is created anywhere (NG-1, NG-4).
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
  byte-identity of AC-5.1a against a recorded baseline, and asserts AC-5.1b's catalogued notice
  fires for a malformed section, so a regression that leaks injected text into a disabled run — or
  that silences an operator typo — is a test failure rather than a discovery.

## 6. Risks

- **R-1 — Prompt budget crowding.** Injection competes with material an authoring dispatch already
  needs, and the failure shows up not as an error but as a worse document. Mitigation: C-8 makes
  existing content non-displaceable, §4.1 caps the addition, and O-1 obliges measuring realised
  prompt sizes — per dispatch and per run across rounds — before the caps are treated as settled.
- **R-2 — Stale or wrong lessons carried forward.** A LEARNINGS document records what was true for
  its feature; injected into a later one it may be obsolete. Mitigation: C-4's labelling makes its
  status advisory rather than authoritative, and C-6 keeps a sibling document's defect out of the
  erratum mechanism. Deciding which lessons have become project law is consolidation's, by design.
- **R-3 — Recency is a proxy for relevance, and a poor one.** AC-2.2's ordering can let a feature in
  an unrelated area crowd out the one that mattered — a deliberate trade against NG-2's rejection of
  a judgement call at the front of every authoring phase. Mitigation: O-3 obliges recording, from
  real runs, whether authors used the injected material, so a later relevance rule comes from
  evidence rather than intuition.
- **R-4 — Authors treating injected text as requirements.** The worst outcome is a prior feature's
  decisions imported into this feature's document, surviving review because it reads as grounded.
  Mitigation: C-4 and AC-1.4 state the material's status in the dispatch itself; O-3's usage record
  is the detector.
- **R-5 — Overlap pressure with consolidation.** An injection rule that starts summarising, ranking
  or promoting is consolidation rebuilt badly. Mitigation: NG-1 and NG-2 are absolutes, not
  defaults, and AC-5.2 asserts the write-side boundary observationally.
- **R-6 — Corpus growth changing behaviour silently.** As features accumulate, the selected set
  turns over though nothing about the feature changed. Mitigation: AC-3.1 and AC-3.2 put both the
  selected and unselected sets in every run's report, so turnover is visible rather than inferred.
## 7. Obligations / Open Questions

- **O-1** Measure realised authoring-dispatch prompt sizes with injection active on a live run —
  per dispatch and per run across review rounds (C-1) — and re-derive
  `learningsInjection.maxDocuments`, `maxBytesPerDocument` and `maxTotalBytes` (§4.1) from that
  measurement before treating them as settled.
- **O-2** Record the harvest metadata a LEARNINGS document actually carries at HEAD (BL-02),
  measured from the documents in this repository and in `regime-ledger`, and state the ordering key
  over that measured shape — before FSPEC authoring. AC-2.2 already fixes the tiebreak and the
  negative invariants; O-2 owes only the key itself.
- **O-3** Record, from real runs, whether authors used the injected material and whether any document
  shows the R-4 failure mode (prior-feature decisions imported as requirements). This is also where
  an author's observation of a defect in an injected document lands (AC-3.4). Evidence base for any
  later relevance rule; an operator-and-report obligation, not a code deliverable of this REQ.
- **O-4** Decide which part of each LEARNINGS document is injected when the per-document bound binds
  (AC-2.3) — the whole document up to the bound, or a named subset of its sections. FSPEC's
  decision; this REQ requires only that the outcome be bounded, deterministic and reported.
- **O-5** Confirm with the operator that §4.1's consumer-config location is right, given that a
  consumer repository already carries `.claude/pdlc.config.json` for `implementation.testCommand`
  and the advisory tier. No AC depends on the answer; the keys move together if it changes.
- **O-6** *(open question, deliberately unresolved)* Whether the review roles should receive the same
  material. NG-5 excludes them for now, on the argument that a reviewer grounded in a prior feature's
  lessons may file findings this feature's REQ never asked for. Revisit with O-3's evidence; a
  widening is a successor REQ with its own queue row.
- **O-7** Bind this feature's corpus definition to `pdlc-consolidation-agent`'s **pass-side**
  enumeration in the same JS bundle (C-3, §1.2 claim 2) — TSPEC's to specify, including how it is
  pinned. No agreement test against the `SessionStart` hook is owed: DEC-CONS-05 rejected that
  oracle.

### 7.1 Stopping rule for this REQ's review loop *(DC-09, pasted in deliberately)*

- A round whose blocking findings are **all** implementability or oracle-falsifiability defects —
  none contesting user need, scope, priority or phasing — means this REQ has met its bar: approve it
  and carry the findings downstream as named entry obligations for FSPEC/TSPEC.
- A finding of the form "this AC has no oracle" is closable by **deferring** the oracle to TSPEC,
  not only by writing one into this REQ.
- **Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
  convergence**; a round in which this document grows while the count does not fall is stronger
  evidence of the same. Churn is the exception — all prior findings closed, the new blockers
  introduced by the latest revision — and must be said explicitly, with a pre-commitment to escalate
  if the next round does not close them.
- Blocking findings landing on the **same AC clause in two consecutive rounds** stop being revised
  in place: that clause is split into its own REQ with a `depends-on` edge.
