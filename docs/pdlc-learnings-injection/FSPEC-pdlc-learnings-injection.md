---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# FSPEC — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | **REQ** — `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.4); `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | TSPEC, PROPERTIES |
| Cross-Reviews | *(none yet — v1 draft)* |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-19 |

> **Scope in one line.** The behaviour of the injection step that `orchestrate-dev` performs when it
> composes an authoring dispatch: which corpus documents are eligible, how they are ordered and
> bounded, what the author is told about them, what the run report records, and what happens in
> every corpus state that is not the happy one.

## Overview

`orchestrate-dev` composes every dispatch it makes from a fixed set of parts: the skill prompt, the
phase's grounding manifest, the upstream documents, and the pacing contract. This feature adds one
more part — a **prior-learnings block** — to the dispatches the pipeline already classifies as
authoring, and to no others.

The block is assembled by a **selection step** that runs once per authoring dispatch, immediately
before the dispatch is composed. The step is a pure function of repository state and configuration:
it enumerates the LEARNINGS corpus, discards what it must not use, orders what remains by a stated
key, takes documents until a declared bound binds, and hands the composer a block plus a record of
what it did. It never asks a model anything, never writes to disk, and never returns an error to its
caller — every state it can encounter, including its own failure to enumerate, resolves to a block
(possibly empty) and a reason record.

**What is new, in one paragraph.** Today an author writing `{f}`'s REQ, TSPEC or PROPERTIES sees
`{f}`'s own upstream documents and nothing from the features that shipped before it. After this
feature, that author also sees up to `learningsInjection.maxDocuments` prior LEARNINGS documents,
labelled advisory, in a deterministic order, with the selection and the non-selection both written
into the run report. Nothing else about the run changes: the same dispatches are made, the same
documents are demanded of the same roles, the same completeness criteria score them, and the same
verdicts move the pipeline forward.

**What this specification owns.** The observable behaviour of the selection step and of the block it
produces: eligibility, ordering, bounding, section choice, labelling, reporting, and the outcome of
every corpus state. It binds REQ O-2 (the ordering key, §BR-4) and REQ O-4 (which part of a document
is injected, §BR-6) from measurements taken at HEAD.

**What this specification does not own.** Where the selection step lives in the codebase, what its
signature is, how the block is threaded to the composer, what the report's serialised form is, and
how the corpus predicate is pinned to `consolidate-learnings.js` (REQ O-7). Those are TSPEC's.

### Vocabulary

| Term | Meaning in this document |
|---|---|
| **corpus** | The set of LEARNINGS documents defined by REQ C-3 — under `docs/{feature}/` or `docs/completed/{feature}/`, tracked or untracked but not ignored, excluding `docs/discarded/`. |
| **candidate** | A corpus document after the corpus has been enumerated, before eligibility is decided. |
| **eligible** | A candidate that survives every exclusion rule in BR-2 and is readable and parseable (BR-3). |
| **selected** | An eligible document whose material appears in the composed block. |
| **the block** | The delimited prior-learnings region added to an authoring dispatch's prompt. |
| **the record** | The per-dispatch and run-level data the selection step produces for the run report (§BR-8). |
| **`{f}` / `{p}`** | The feature being authored / a prior feature, as in the REQ. |

## Linked Requirements

Every behavioural rule in this document traces to a REQ acceptance criterion, and every REQ
acceptance criterion is covered by at least one rule and one acceptance test.

| FSPEC id | Behaviour | REQ coverage |
|---|---|---|
| FSPEC-LRN-01 | Which dispatches carry a block | AC-1.1, AC-1.2 |
| FSPEC-LRN-02 | Corpus eligibility and exclusions | AC-1.3, AC-2.6 |
| FSPEC-LRN-03 | Ordering key and total tiebreak | AC-2.2, AC-2.5 |
| FSPEC-LRN-04 | Count bound | AC-2.1, AC-2.2 |
| FSPEC-LRN-05 | Per-document and total byte bounds | AC-2.3, AC-2.4 |
| FSPEC-LRN-06 | Which part of a document is injected | AC-2.3 (binds O-4) |
| FSPEC-LRN-07 | Block labelling and dispatch composition order | AC-1.4 |
| FSPEC-LRN-08 | Per-dispatch record | AC-3.1 |
| FSPEC-LRN-09 | Non-selection reasons, per-document and corpus-level | AC-3.2 |
| FSPEC-LRN-10 | Hand-reproducibility record | AC-3.3 |
| FSPEC-LRN-11 | No erratum channel for injected material | AC-3.4 |
| FSPEC-LRN-12 | Fail-open under every corpus state | AC-4.1, AC-4.2 |
| FSPEC-LRN-13 | Gate-input isolation | AC-4.3 |
| FSPEC-LRN-14 | Admits-nothing configuration | AC-4.4 |
| FSPEC-LRN-15 | Disabled and malformed configuration | AC-5.1a, AC-5.1b |
| FSPEC-LRN-16 | Filesystem footprint | AC-5.2 |
| FSPEC-LRN-17 | Pipeline semantics preserved | AC-5.3 |

### Reverse trace — REQ criterion to acceptance test

| REQ AC | FSPEC rule | Acceptance test |
|---|---|---|
| AC-1.1 | BR-1 | AT-01 |
| AC-1.2 | BR-1, BR-11 | AT-02, AT-03 |
| AC-1.3 | BR-2 (E-SELF) | AT-04 |
| AC-1.4 | BR-7 | AT-05, AT-06 |
| AC-2.1 | BR-5 | AT-07 |
| AC-2.2 | BR-4, BR-5 | AT-08, AT-09, AT-10 |
| AC-2.3 | BR-6 | AT-11, AT-12 |
| AC-2.4 | BR-6 | AT-13 |
| AC-2.5 | BR-4, BR-6 | AT-14 |
| AC-2.6 | BR-2 (E-DISCARDED), BR-2 note | AT-15, AT-16 |
| AC-3.1 | BR-8 | AT-17, AT-18 |
| AC-3.2 | BR-9 | AT-19, AT-20, AT-21 |
| AC-3.3 | BR-10 | AT-22 |
| AC-3.4 | BR-13 | AT-23 |
| AC-4.1 | BR-9 (RSN-EMPTY), BR-12 | AT-24 |
| AC-4.2 | BR-3, BR-12 | AT-25, AT-26, AT-27, AT-28 |
| AC-4.3 | BR-11 | AT-03, AT-29 |
| AC-4.4 | BR-5, BR-14 | AT-30 |
| AC-5.1a | BR-14 | AT-31 |
| AC-5.1b | BR-14 | AT-32 |
| AC-5.2 | BR-15 | AT-33, AT-34 |
| AC-5.3 | BR-16 | AT-35 |
| AC-6.1 | §Acceptance Tests preamble | all ATs |
| AC-6.2 | §Acceptance Tests preamble, AT-31, AT-32 | AT-31, AT-32 |

### Binding constraints inherited

`DC-01` (contracts crossing a component boundary are closed and total) governs the reason-id
catalogues in BR-9: each is a closed set with a completeness test. `DC-05` (every named behavioural
branch has an acceptance test) governs the Acceptance Tests section: the branch inventory in
§Edge Cases and Error Scenarios is the checklist that section is scored against. `DC-18` (a claim
carried by N documents needs an N-document guard) applies to the threshold values of REQ §4.1, which
this document deliberately references by name rather than transcribing by value.

## Behavioral Flow

The flow runs **once per authoring dispatch**, at the point the dispatch's prompt is being composed
and before it is sent. It has seven steps. Every step has a defined outcome for every input,
including its own failure; no step raises to its caller (BR-12).

### Step 0 — Decide whether to run at all

1. Read the `learningsInjection` configuration section for the consumer repository.
2. **Absent section, or `enabled` false** → the flow stops here, the dispatch is composed exactly as
   it is composed today, and **no injection record of any kind is produced** (BR-14, AC-5.1a).
3. **Section present but malformed** — unparseable, or present under a name that is not
   `learningsInjection` in a way the pipeline can detect, such as an operator typo → behave as (2)
   for the dispatch, **and** record the corpus-level malformed-configuration notice so the typo is
   distinguishable from a deliberate disable (BR-14, AC-5.1b).
4. **Enabled** → continue, with thresholds resolved: each of REQ §4.1's three bounds takes its
   configured value if present and its default if not.
5. If the dispatch is **not** one C-1 names as authoring, the flow stops here with no record
   (BR-1) — this test is made for every dispatch, so that "no block" is a decision rather than an
   omission.

### Step 1 — Enumerate the corpus

6. List the corpus as REQ C-3 defines it.
7. **The listing fails** → no document is known. Record the corpus-level outcome `RSN-UNLISTABLE`,
   compose the dispatch with an empty block, and continue the run (BR-12, AC-4.2). The flow never
   converts "I could not find out" into "there is nothing".
8. **The listing succeeds and is empty** → record the corpus-level outcome `RSN-EMPTY`, compose with
   an empty block, continue (AC-4.1).
9. **The listing succeeds and is non-empty** → the listed paths are the candidates; continue.

### Step 2 — Apply eligibility exclusions

10. For each candidate, apply BR-2's exclusion rules in the order stated there. An excluded candidate
    is removed from consideration and gets its per-document reason id in the record; it counts toward
    no threshold (AC-2.6).
11. If no candidate survives, the outcome is an enabled run with an empty selection: an empty block,
    an empty set of per-dispatch rows, and every candidate carrying its exclusion reason (BR-9).

### Step 3 — Read and validate each surviving candidate

12. Read each surviving candidate. **Unreadable** → excluded with `RSN-UNREADABLE`. **Read but not a
    LEARNINGS document** → excluded with `RSN-UNPARSEABLE`. **Read, a LEARNINGS document, but
    truncated mid-document** → excluded with `RSN-TRUNCATED` (BR-3). A single bad document never
    stops the others being used (AC-4.2).
13. What survives step 3 is the **eligible set**.

### Step 4 — Order the eligible set

14. Sort the eligible set by BR-4's ordering key, most recent first, with BR-4's total tiebreak
    applied wherever the key is absent, unparseable or equal. The result is a **total order over the
    eligible set that is a function of repository state alone** — no wall-clock time, no file mtime,
    no model judgement (AC-2.2, C-5).

### Step 5 — Apply the bounds

15. Take the first `learningsInjection.maxDocuments` documents in the order; the rest are dropped
    with `RSN-COUNT` (BR-5).
16. For each taken document, extract its injectable material per BR-6 and bound it at
    `learningsInjection.maxBytesPerDocument`; a document whose material was cut is flagged
    **bounded** in its row (BR-6, AC-2.3).
17. Accumulate the bounded material in order until adding the next document's material would exceed
    `learningsInjection.maxTotalBytes`. That document and every one after it are dropped **whole**,
    with `RSN-BYTES` (BR-6, AC-2.4). A document is never cut mid-document to make the total fit; the
    per-document bound is the only cut this flow makes.
18. What remains is the **selected set**, in order.

### Step 6 — Compose and record

19. Assemble the block: the advisory preamble required by BR-7, then each selected document's
    material in the selected order, each delimited and identified by its source path.
20. Add the block to the dispatch's prompt **without displacing anything** — the grounding manifest,
    the upstream documents and the pacing contract appear unchanged and in their existing relative
    order (BR-7, C-8).
21. Emit the per-dispatch record (BR-8), the non-selection record (BR-9) and, once per run, the
    rule-input record (BR-10).
22. Dispatch. From this point the pipeline behaves exactly as it does without this feature: the same
    completeness scoring, verdict parsing, round arithmetic, approval anchors and erratum routing,
    consuming nothing this flow produced (BR-11, AC-4.3).

### Decision points, named

| # | Decision | Branches | Rule |
|---|---|---|---|
| D-1 | Is injection configured on? | absent / disabled / malformed / enabled | BR-14 |
| D-2 | Is this dispatch an authoring dispatch? | yes / no | BR-1 |
| D-3 | Did the corpus listing succeed? | ok / failed | BR-12 |
| D-4 | Is the listing empty? | empty / non-empty | BR-12 |
| D-5 | Is the candidate excluded by rule? | self / discarded / ineligible path | BR-2 |
| D-6 | Did the candidate read and parse? | ok / unreadable / unparseable / truncated | BR-3 |
| D-7 | Is the ordering key present and parseable? | yes / no → tiebreak | BR-4 |
| D-8 | Does the count bound bind? | yes / no | BR-5 |
| D-9 | Does the per-document byte bound bind? | yes → bounded flag / no | BR-6 |
| D-10 | Does the total byte bound bind? | yes → whole-document drop / no | BR-6 |
| D-11 | Is the selected set empty? | yes → empty block, empty rows / no | BR-8 |

Every branch in this table has at least one acceptance test (DC-05); the mapping is in §Acceptance
Tests.

## Business Rules

### BR-1 — Exactly the authoring dispatches carry a block *(AC-1.1, AC-1.2)*

A dispatch carries a block **if and only if** the pipeline classifies it as authoring at the moment
it is composed. The classification is the pipeline's existing one, not a new list maintained by this
feature: this rule consumes the classification, it does not restate the membership.

- **Included:** creator, optimizer-round and erratum dispatches for REQ, FSPEC, TSPEC, PLAN,
  DECISIONS and PROPERTIES — whichever of them a given run actually makes.
- **Excluded:** every review dispatch, implementation, DoD verification and remediation, harvest,
  ship, and every advisory seam.
- The oracle is **set equality against the run that happened**, never a fixed count. A run with no
  DECISIONS phase, a run whose Phase R has no creator because the REQ arrived authored, and a run
  with five optimizer rounds each satisfy this rule as stated (AC-1.2).
- Excluded dispatches are not merely "block-free": their prompts are **byte-identical** to the same
  dispatch composed with injection disabled (BR-11).

### BR-2 — Eligibility exclusions, applied in order *(AC-1.3, AC-2.6)*

Applied to each candidate in this order; the first matching rule decides, and its id is the reason
recorded:

| Order | Rule | Excluded when | Reason id |
|---|---|---|---|
| 1 | **E-DISCARDED** | The document lies under `docs/discarded/` | *(not a corpus member; not recorded)* |
| 2 | **E-SELF** | The document is `{f}`'s own LEARNINGS, at any path | `RSN-SELF` |

Notes that make the rule total:

- **Self-exclusion is by feature, not by path.** `{f}`'s own LEARNINGS is excluded whether it sits at
  `docs/{f}/` or `docs/completed/{f}/`, and whether or not it was written by an earlier completed
  attempt at the same feature. This holds in every phase of `{f}`'s run (AC-1.3).
- **`docs/completed/{p}/` is eligible on exactly the same terms as `docs/{p}/`.** Archival is not a
  demotion: a completed feature's lessons are the ones most likely to be settled (AC-2.6).
- **Discarded documents are invisible, not merely unselected.** They are excluded before any
  threshold is evaluated, so they cannot displace an eligible document from the count bound and do
  not appear in the non-selection record — they were never candidates (AC-2.6).

### BR-3 — Read-and-validate outcomes are total *(AC-4.2)*

Each surviving candidate resolves to exactly one of four outcomes, and no other:

| Outcome | Condition | Effect |
|---|---|---|
| **ok** | Read, parses as a LEARNINGS document, complete | Joins the eligible set |
| **unreadable** | The read fails for any reason | Excluded, `RSN-UNREADABLE` |
| **unparseable** | Read, but does not present as a LEARNINGS document | Excluded, `RSN-UNPARSEABLE` |
| **truncated** | Read, presents as a LEARNINGS document, but ends mid-document | Excluded, `RSN-TRUNCATED` |

`RSN-TRUNCATED` names a defect **in the source document**. It is never used for material this feature
itself cut under BR-6 — that condition is the row's *bounded* flag, and the two must remain
distinguishable in the report (AC-3.2).

"Presents as a LEARNINGS document" is a shape judgement over the document's own conventional
structure, not a completeness score: this feature reads the format and never re-scores it (NG-3).
The precise predicate is TSPEC's, bounded by two requirements this rule fixes: it consults only the
document's bytes, and it is decidable without a model call.

### BR-4 — Ordering key: harvest completion date, with a total tiebreak *(AC-2.2, AC-2.5; binds REQ O-2)*

**Primary key.** The date carried by the LEARNINGS document's own harvest metadata table in its
`Date Completed` row, read as a calendar date, ordered **most recent first**.

**Measured basis for this choice** *(REQ O-2's obligation, discharged here)*. Measured at HEAD on
2026-08-19 across both repositories the REQ names, over the corpus REQ C-3 defines:

| Repository | Corpus documents | Carrying a `Date Completed` row | Whose value begins with an ISO `YYYY-MM-DD` date |
|---|---|---|---|
| `yumo-plugins` (this repo) | 9 | 9 | 9 |
| `regime-ledger` | 80 | 78 | 78 |
| **Total** | **89** | **87** | **87** |

Two `regime-ledger` documents carry no such row at all
(`docs/completed/43-wheel-rationale-contract/`, `docs/completed/34-postgres-audit-repository/`), and
some values carry free text after the date — for example
`2026-06-09 (Phase H harvest; partial close-out)`. So the key is well-populated but **not
guaranteed**, and the tiebreak below is load-bearing rather than theoretical: it is exercised by real
documents on day one.

**Total tiebreak.** Rank falls back to **byte order over the document's repository-relative path**,
ascending, whenever the primary key is absent, unparseable, or equal between two documents. Since
paths in the corpus are unique, the composite ordering is a **total order over the eligible set**.

**Negative invariants** — the ordering never consults:

- wall-clock time at composition,
- any filesystem timestamp, including mtime and ctime,
- git history, commit dates or authorship,
- a model's judgement of relevance (NG-2),
- anything outside the eligible documents' bytes and paths.

Two consequences follow directly and are separately testable: permuting every corpus file's mtime and
re-running yields an identical selection, and renaming a document's containing directory without
changing its content **may** change its rank — because the path is part of the tiebreak — while
changing nothing else about the document's eligibility. Where REQ AC-2.2 offered directory-rename
rank-invariance as a testable property, this rule supersedes it: a total order that ignores the path
cannot exist over documents whose primary key is missing or equal, and 2 of 89 measured documents
have no primary key. The rename-invariant property is therefore replaced by the stronger and
achievable one — **the ordering is a pure function of (key value, path) and of nothing else** —
which AT-09 and AT-10 assert. *(This is a deliberate correction of an upstream expectation; see the
ERRATUM line in this dispatch's report.)*

### BR-5 — The count bound *(AC-2.1)*

At most `learningsInjection.maxDocuments` documents contribute to any block. Where the eligible set
is larger than that threshold, the count of contributing documents **equals** it exactly, so an
eligible set of 5 and one of 50 produce the same document count. Documents cut here are recorded with
`RSN-COUNT`.

Where the eligible set is smaller, all of it is taken and no `RSN-COUNT` row is produced.

### BR-6 — What is injected from a document, and how the byte bounds bind *(AC-2.3, AC-2.4; binds REQ O-4)*

**Which part is injected.** A LEARNINGS document carries six conventional sections. This feature
injects a **named subset, in a fixed priority order**:

| Priority | Section | Injected |
|---|---|---|
| 1 | Cross-Feature Patterns | yes |
| 2 | Non-Convergences | yes |
| 3 | Rejected Proposals (with rationale) | yes |
| 4 | Process Learnings | yes |
| 5 | Open Items for Consolidation | yes |
| — | Approval Record | **never** |

Together with a one-line identification of the source feature and its `Date Completed` value, which
is always injected first so a bounded document is still attributable.

**Why this subset.** Cross-Feature Patterns ranks first because it is the section whose author was
already generalising beyond their own feature — the material most likely to apply to a different
one. The Approval Record is excluded outright: it is per-run bookkeeping about verdicts and anchors,
of no use to an author, and keeping approval vocabulary out of an authoring prompt reinforces BR-11's
boundary.

**How the per-document bound binds.** Sections are taken in priority order until adding the next
would exceed `learningsInjection.maxBytesPerDocument`; remaining sections are omitted. Where the
**first** section alone exceeds the bound, it is taken up to the bound and cut. Either way the
document's row carries the **bounded** flag (AC-2.3), and the block states that the document was
abridged.

**How the total bound binds.** Documents are accumulated in BR-4's order until the next document's
bounded material would carry the running total past `learningsInjection.maxTotalBytes`. That document
and every lower-ordered one are dropped **whole**, with `RSN-BYTES` (AC-2.4). No document is ever cut
mid-document to make the total fit: the per-document bound of this rule is the only cut this feature
makes.

**Determinism.** Both bounds are byte counts over material derived from document bytes alone, so two
runs over identical repository state produce byte-identical blocks, including order (AC-2.5).

### BR-7 — The block's labelling and its place in the prompt *(AC-1.4)*

The block opens with a preamble that states three things, in whatever wording TSPEC settles:

1. the material is **context from prior features**, not from `{f}`;
2. it is **neither a requirement of `{f}` nor an upstream document to be traced** — no traceability
   obligation attaches to it, and no document the author produces must cite it;
3. the author **may disregard it entirely** without leaving a gap in what they were asked to produce.

Each contributing document's material is delimited and identified by its **source document path**, so
an author reading a claim can find where it came from, and a bounded document is marked as abridged.

**Placement is additive, never displacing.** The dispatch's grounding manifest, upstream documents and
pacing contract appear unchanged and in their existing relative order (C-8). The block is added to
the prompt; nothing existing is shortened, reordered or removed to make room for it. Where the
declared bounds cannot be honoured alongside the existing content, the resolution is **less injected
material**, never less existing content.

### BR-8 — The per-dispatch record *(AC-3.1)*

For each authoring dispatch, the run report carries a set of rows — one per **selected** document —
whose fields are exactly:

| Field | Content |
|---|---|
| source path | The document's repository-relative path |
| order position | Its position in the selected order, 1-based |
| bytes injected | Bytes of material contributed by this document |
| bounded | Whether this document's material was cut by the per-document bound (BR-6) |

plus one per-dispatch scalar: **total bytes injected**.

The field enumeration is **closed**: a completeness test asserts set equality over it (DC-01). A
dispatch that injected nothing carries an **empty set of rows**, not a missing field — the difference
between "nothing was selected" and "nothing was recorded" must be visible in the report.

BR-10's rule-input record is separate, run-level, and closed on its own terms; the two are not merged.

### BR-9 — Non-selection reasons: two closed catalogues *(AC-3.2, AC-4.1)*

**Per-document catalogue.** Every corpus document that was known but did not contribute carries
exactly one reason id from this closed set:

| Id | Meaning |
|---|---|
| `RSN-COUNT` | Dropped by the count bound (BR-5) |
| `RSN-BYTES` | Dropped whole by the total byte bound (BR-6) |
| `RSN-SELF` | `{f}`'s own LEARNINGS (BR-2) |
| `RSN-UNREADABLE` | The read failed (BR-3) |
| `RSN-UNPARSEABLE` | Read, but not a LEARNINGS document (BR-3) |
| `RSN-TRUNCATED` | Read, a LEARNINGS document, but truncated mid-document (BR-3) |

**Corpus-level catalogue.** States in which **no document is known** are recorded once per run, from
their own closed set:

| Id | Meaning |
|---|---|
| `RSN-UNLISTABLE` | The corpus listing failed outright (BR-12) |
| `RSN-EMPTY` | The listing succeeded and found nothing |

Rules binding the two catalogues:

- Each catalogue is **closed**: a completeness test per catalogue asserts set equality over its
  members (DC-01, C-9). A new reason may not be emitted without being added to a catalogue and its
  test.
- The catalogues are **disjoint in kind**: a corpus-level id is never used as a per-document reason
  and vice versa.
- Where a corpus-level outcome is recorded, BR-8's per-dispatch rows are **present and empty** for
  every authoring dispatch of the run.
- Where documents are known, every one of them appears either as a BR-8 row or as a per-document
  reason row. No corpus document is silently absent from the report.
- Excluded-by-`docs/discarded/` documents are the sole exception, and by construction: they are not
  corpus members at all (BR-2), so there is nothing to report.

### BR-10 — Hand-reproducibility *(AC-3.3)*

The run report carries a **run-level rule-input record** whose members are exactly:

| Member | Content |
|---|---|
| ordering key values | Per corpus document, the `Date Completed` value the ordering read, or an explicit marker that it was absent or unparseable |
| thresholds in force | The three REQ §4.1 values actually used for the run, whether configured or defaulted |

This enumeration is **closed**, with its own completeness test asserting set equality over the two
members (DC-01), independently of BR-8's and BR-9's closures.

The behavioural claim this record exists to make good: **an operator holding only the run report can
reproduce the selection by hand against the same repository state and get the same answer.** If a
future rule change adds an input to the selection that is not in this record, the record is wrong,
and AT-22 is the test that says so.

### BR-11 — Gate-input isolation *(AC-4.3, AC-1.2)*

No value this feature produces reaches any convergence machinery. Specifically, none of the
following consumes the block, the record, the reason ids or the thresholds:

- verdict parsing,
- structural completeness scoring,
- round-window arithmetic,
- approval anchors,
- erratum routing,
- POSTMORTEM production and the queue lifecycle.

And: every **non-authoring** dispatch prompt is byte-identical to the same dispatch composed with
injection disabled.

The falsifiable form of this rule is a comparison **under scripted fixtures**, not across live runs:
comparing verdicts or round counts between two live runs measures model nondeterminism, and comparing
them where the fixture scripts the verdicts is vacuous. What AT-03 and AT-29 compare is composed
prompt bytes and gate inputs, which are deterministic under fixtures.

### BR-12 — Fail-open is unconditional and total *(AC-4.1, AC-4.2)*

Every corpus state resolves to a defined outcome. The complete mapping:

| Corpus state | Outcome |
|---|---|
| Directory absent / no corpus documents | Empty block; corpus-level `RSN-EMPTY` |
| Listing fails outright | Empty block; corpus-level `RSN-UNLISTABLE` |
| One document unreadable | That one skipped with `RSN-UNREADABLE`; the rest used normally |
| One document unparseable | That one skipped with `RSN-UNPARSEABLE`; the rest used normally |
| One document truncated | That one skipped with `RSN-TRUNCATED`; the rest used normally |
| A document exceeds the per-document bound | Bounded per BR-6 and flagged; still contributes |
| Selection step fails in any other way | Empty block; corpus-level `RSN-UNLISTABLE` — the worst case is always "inject nothing, record why" |

In **no** corpus state does this feature produce an exception that escapes to the pipeline, a halt, a
POSTMORTEM, or a changed convergence outcome. "I could not find out" never collapses into "there is
nothing": those two states carry different corpus-level ids, and that distinction is the point of
having two.

### BR-13 — Injected material has no erratum channel *(AC-3.4)*

A defect an author notices in an injected LEARNINGS document is **not** an erratum against any
upstream document of `{f}`: a sibling feature's LEARNINGS is not `{f}`'s upstream. No erratum round is
opened on account of it, and this feature adds no author-emitted channel of its own. The trace an
operator follows is BR-8's rows, which name the source document. Nothing new is required of any
author (G-5, NG-3); the operator-side record of such observations is REQ O-3's, not a deliverable
here.

### BR-14 — Configuration states *(AC-4.4, AC-5.1a, AC-5.1b)*

Four states, four distinct behaviours:

| State | Dispatch composition | Record |
|---|---|---|
| Section **absent** | Byte-identical to the recorded pre-feature baseline | **No injection key at all** — absent, not present-and-empty |
| `enabled: false` | Byte-identical to the recorded pre-feature baseline | No injection key at all |
| Section present but **malformed** (e.g. `learningsInjectoin`) | Byte-identical to the recorded pre-feature baseline | A catalogued notice naming the malformed configuration |
| **Enabled**, thresholds admitting nothing (zero documents or zero bytes) | An enabled composition whose selection is empty | BR-8's rows, **present and empty** |

The last two rows carry the load:

- A **typo must not be byte-identical to a deliberate disable**. Both compose the same prompt, but the
  malformed case emits a catalogued notice, so an operator who meant to enable the feature learns
  that they did not (DC-01, C-9).
- **Admits-nothing thresholds are valid configuration, not invalid.** Zero documents or zero bytes is
  an enabled run with an empty selection — BR-8's empty rows — never a refusal to run and never
  AC-5.1a's absent key. The pipeline does not validate the operator's arithmetic.

### BR-15 — Filesystem footprint *(AC-5.2)*

On an **enabled** run, the corpus paths touched over the whole run are **exactly** the reads of the
documents BR-8 and BR-9 name — a positive membership claim, not an absence-only one. And nothing is
written: no file under `docs/_constraints/` or `docs/_decisions/`, no LEARNINGS document, no skill
prompt, and no new index, cache or state file anywhere (NG-1, NG-4).

On a **disabled** run, the same observation window shows **no corpus path touched at all** — the
zero-reads claim is carried positively rather than inferred from the absence of an assertion.

### BR-16 — Pipeline semantics preserved *(AC-5.3)*

On a run with injection active, the completeness criteria, required headings, verdict grammar, round
windows and approval anchors that score the documents produced are exactly those in force without it.
This feature changes **what an author is told**, never **what the pipeline requires an author to
produce**. It adds no required section, no new heading, no new verdict token and no new approval
condition.

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions
