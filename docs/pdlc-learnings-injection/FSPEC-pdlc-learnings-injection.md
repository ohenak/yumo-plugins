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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2,3}.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.4 | 2026-08-19 |

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
| **corpus** | The set of LEARNINGS documents REQ C-3 defines: what the consolidation-side enumeration matches under `docs/{feature}/` and `docs/completed/{feature}/`, tracked or untracked but not git-ignored. Documents under `docs/discarded/{feature}/` fall outside that enumeration by its shape, not by a separate exclusion rule (BR-2). |
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
| FSPEC-LRN-15 | Disabled and malformed configuration | AC-5.1a, AC-5.1b, AC-5.1c |
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
| AC-2.6 | BR-2 (corpus shape), BR-2 note | AT-15, AT-16 |
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
| AC-5.1c | BR-14 | AT-32 |
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
3. **Section present but malformed** — `learningsInjection` present and not an object →
   compose as in (2), **and** record `NTC-MALFORMED` (BR-14,
   AC-5.1b). A misspelt section name is a stray top-level key, reading as absent (2). A
   **wrong-typed declared key** is not malformed: it takes its default, the flow continues at
   (4), and `NTC-KEYTYPE` names the key.
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

### Step 2 — Apply the eligibility exclusion

10. Apply BR-2's exclusion to each candidate. An excluded candidate is removed from
    consideration and gets a per-document reason id in the record; it counts toward
    no threshold (AC-2.6).
11. If no candidate survives, the outcome is an enabled run with an empty selection: empty
    block, empty per-dispatch rows, every candidate carrying its exclusion reason (BR-9).

### Step 3 — Read and validate each surviving candidate

12. Read each surviving candidate. **Unreadable** → excluded with `RSN-UNREADABLE`. **Read
    but not a LEARNINGS document** — including a document whose bytes stop mid-document —
    → excluded with `RSN-UNPARSEABLE` (BR-3). A single bad document never stops the others
    being used (AC-4.2).
13. What survives step 3 is the **eligible set**.

### Step 4 — Order the eligible set

14. Sort the eligible set by BR-4's ordering key, most recent first, with BR-4's total tiebreak
    applied wherever the key is absent, unparseable or equal. The result is a **total order over the
    eligible set that is a function of repository state alone** — no wall-clock time, no file mtime,
    no model judgement (AC-2.2, C-5).

### Step 5 — Apply the bounds

15. Drop any eligible document carrying none of BR-6's priority sections, with
    `RSN-NO-MATERIAL` — it consumes no slot — then take the first
    `learningsInjection.maxDocuments` of the rest in BR-4's order; the remainder are
    dropped with `RSN-COUNT` (BR-5, BR-6).
16. For each taken document, extract its injectable material per BR-6, bounded by
    `learningsInjection.maxBytesPerDocument`; a document whose material was cut is flagged
    **bounded** in its row (BR-6, AC-2.3).
17. Accumulate contributed bytes in order until the next document would carry the running
    total past `learningsInjection.maxTotalBytes`; that document and every lower-ordered
    one is dropped whole with `RSN-BYTES` (BR-6, AC-2.4). No document is ever cut
    mid-document to make a total fit, and no count-cut document is promoted into a slot a
    byte drop frees (BR-5).
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
| D-1 | Is injection configured on? | absent / disabled / malformed / wrong-typed key / enabled | BR-14 |
| D-2 | Is this dispatch an authoring dispatch? | yes / no | BR-1 |
| D-3 | Did the corpus listing succeed? | ok / failed | BR-12 |
| D-4 | Is the listing empty? | empty / non-empty | BR-12 |
| D-5 | Is the candidate excluded by rule? | self / not excluded | BR-2 |
| D-6 | Did the candidate read and parse? | ok / unreadable / unparseable | BR-3 |
| D-7 | Is the ordering key present and parseable? | yes / no → tiebreak | BR-4 |
| D-8 | Does the count bound bind? | yes / no | BR-5 |
| D-9 | Does the per-document byte bound bind? | yes → bounded flag / no | BR-6 |
| D-10 | Does the total byte bound bind? | yes → whole-document drop / no | BR-6 |
| D-11 | Is the selected set empty? | yes → empty block, empty rows / no | BR-8 |
| D-12 | Does the document carry any priority section? | yes / no → `RSN-NO-MATERIAL` | BR-6 |

Every branch in this table has at least one acceptance test (DC-05); the mapping is in §Acceptance
Tests.

## Business Rules

### BR-1 — Exactly the authoring dispatches carry a block *(AC-1.1, AC-1.2)*

A dispatch carries a block **if and only if** the pipeline classifies it as authoring at the moment
it is composed. The classification is the pipeline's existing one, not a new list maintained by this
feature: this rule consumes the classification, it does not restate the membership.

- **Included:** creator, optimizer-round and erratum dispatches for REQ, FSPEC, TSPEC, PLAN,
  DECISIONS and PROPERTIES — whichever of them a given run actually makes.
- **Excluded:** every review dispatch, implementation, DoD verification and remediation,
  harvest, ship, and every advisory seam.
- The two lists illustrate what the pipeline's classification yields today; they are read
  off it, not maintained here. Dispatches that run an authoring skill directly without
  carrying the authoring classification — the POSTMORTEM dispatch, DoD document-finding —
  are excluded because the classification excludes them, which is A-2's default.
- The oracle is **set equality against the run that happened**, never a fixed count. A run with no
  DECISIONS phase, a run whose Phase R has no creator because the REQ arrived authored, and a run
  with five optimizer rounds each satisfy this rule as stated (AC-1.2).
- Excluded dispatches are not merely "block-free": their prompts are **byte-identical** to the same
  dispatch composed with injection disabled (BR-11).

### BR-2 — Corpus membership, and the one eligibility exclusion *(AC-1.3, AC-2.6)*

**Corpus membership is not a rule this feature applies.** It is the enumeration REQ C-3
pins: two location globs — `docs/{feature}/LEARNINGS-*.md` and
`docs/completed/{feature}/LEARNINGS-*.md` — over tracked and untracked-but-not-ignored
files, restated literally and pinned to the shipped consolidation-side predicate (F-O-4).
Documents under `docs/discarded/{feature}/` are never candidates (AC-2.6) because they sit
one directory deeper than either glob reaches: no rule fires on them, and nothing about them
enters the record. A separate `docs/discarded/` exclusion rule would change the answer for
paths the shipped predicate *does* match, so none is added here. One class remains: a document
*directly*
at `docs/discarded/LEARNINGS-x.md` does match the first glob — the case REQ C-3 and AC-2.6
legislate against. Its outcome: **corpus member on ordinary terms**
(E-35, AT-15). None exists at HEAD; `ERRATUM: REQ` rides.

One exclusion then applies to candidates, and its reason id is recorded:

| Rule | Excluded when | Reason id |
|---|---|---|
| **E-SELF** | The document is `{f}`'s own LEARNINGS, at any path | `RSN-SELF` |

- **Self-exclusion is by feature, not by path** — under `docs/{f}/` or `docs/completed/{f}/`,
  including one left by an earlier completed attempt, in every phase of `{f}`'s run (AC-1.3).
- **`docs/completed/{p}/` documents are eligible on the same terms as `docs/{p}/` ones**
  (AC-2.6); archival location changes nothing but the path used in BR-4's tiebreak.

### BR-3 — Read-and-validate outcomes are total *(AC-4.2)*

Each surviving candidate resolves to exactly one of three outcomes, and no other:

| Outcome | Condition | Effect |
|---|---|---|
| **ok** | Read, and presents a LEARNINGS document | Joins the eligible set |
| **unreadable** | The read itself fails, for any reason | Excluded, `RSN-UNREADABLE` |
| **unparseable** | Read, but does not present a LEARNINGS document | Excluded, `RSN-UNPARSEABLE` |

Truncation is **not a separate outcome**. Bytes stopping mid-document resolve under the same
shape judgement as any candidate: eligible where what is present still reads as a LEARNINGS
document (E-19), `RSN-UNPARSEABLE` where not (E-04). No predicate over a document's own bytes
separates truncation from one legitimately lacking later sections, so `RSN-TRUNCATED` would
name a branch no fixture could construct; the v0.2 edge retires with it, E-05 not reused.
REQ AC-3.2's catalogue lists `RSN-TRUNCATED` and omits `RSN-NO-MATERIAL`; BR-9 differs on both — `ERRATUM: REQ` rides. The
report still keeps apart what matters: an unparseable document contributes nothing, while a
document cut by BR-6's byte
bound contributes and carries the *bounded* flag (AC-3.2).

"Presents a LEARNINGS document" is a shape judgement over the document's own conventional
structure, not a completeness score: this feature never re-scores documents (NG-3). The
precise predicate is TSPEC's (F-O-1), bounded by two requirements this rule fixes: it
consults only the document's own bytes, and it is decidable without a model call.

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

**At most** `learningsInjection.maxDocuments` documents contribute to any block. The
contributing count equals `maxDocuments` only where the eligible set is at least that large
**and** the total byte bound (BR-6) has not bound first; otherwise it is lower. On real
corpora the total bound is the one that binds: measured at HEAD on 2026-08-19 over the
89-document corpus BR-4 tabulates, injectable material averages 13,278 bytes per document
(max 41,180, matching BR-6's five names in the `## N. Title`
form the corpus writes) and 87 of
the 89 exceed `maxBytesPerDocument` alone, so under REQ §4.1's
declared values — five documents at 6,000 bytes against a 20,000-byte total — at most three
can contribute. Whether the count bound is load-bearing under those values is REQ
O-1's question, which the live run discharging O-1 should report. REQ AC-2.1 still asserts the
count *equals* the threshold for
any corpus above it, which the measurement above falsifies under §4.1's values —
`ERRATUM: REQ` rides this round.

Documents cut here carry `RSN-COUNT`; where the eligible set is smaller than the threshold,
all of it is taken and no `RSN-COUNT` row is produced.

**No back-fill.** The count bound is applied first, over BR-4's order, and a document
dropped later by the total byte bound does not promote a count-cut document into the slot it
frees. The selected set is therefore always a prefix of the ordered eligible set (AT-13).

### BR-6 — What is injected from a document, and how the byte bounds bind *(AC-2.3, AC-2.4; REQ O-4)*

From each contributing LEARNINGS document, a **named subset of sections, in a fixed priority
order**:

| Priority | Section | Injected |
|---|---|---|
| 1 | Cross-Feature Patterns | yes |
| 2 | Non-Convergences | yes |
| 3 | Rejected Proposals (with rationale) | yes |
| 4 | Process Learnings | yes |
| 5 | Open Items for Consolidation | yes |
| — | Approval Record | **never** |

Together with a one-line identification of the source feature and its `Date Completed`
value, always injected first so that even a bounded document stays attributable.

These names identify sections by the conventional titles the harvest skill writes, where
they carry numeric prefixes — `## 2. Cross-Feature Patterns`, `## 6. Approval Record`
(`pdlc/skills/harvest-learnings/SKILL.md`, "LEARNINGS Document Format"). Which heading forms
count as which section is F-O-1's, not text to be matched literally from here.

**Why this subset.** Cross-Feature Patterns ranks first because it is the section where an
author is already generalising beyond their own feature — the material most likely to apply
to a different one. Approval Record is excluded outright: it is per-run bookkeeping about
verdicts and anchors, of no use to an author, and keeping approval vocabulary out of an
authoring prompt reinforces BR-11's boundary.

**A document carrying no priority section contributes nothing and consumes no slot.**
Measured at HEAD, at least one corpus document carries none of the five: `regime-ledger`'s
`docs/completed/34-postgres-audit-repository/LEARNINGS-postgres-audit-repository.md` has
`## Implementation Learnings`, `## Cross-Feature Findings` and `## Process Findings` only.
Such a document is eligible — it parses, and E-19 makes missing sections legitimate — but
yields nothing, so it is dropped before the bounds are applied, with `RSN-NO-MATERIAL`
(BR-9). Otherwise it would take a `maxDocuments` slot while injecting zero bytes,
indistinguishable in BR-8's rows from a real contribution.

**The byte-accounting basis.** All three byte quantities measure the same bytes. A
document's **contributed bytes** are every byte the block carries on its account: its
identification line, its delimiters and source-path label (BR-7), and the section headings
and bodies taken. `maxBytesPerDocument` bounds one document's contributed bytes,
`maxTotalBytes` bounds their sum across selected documents, and BR-8's *bytes injected*
records that same quantity per document with its per-dispatch total as the sum. The block's
preamble belongs to no document and counts toward none of the three, so an expected byte
count is computable from a fixture alone.

**How the per-document bound binds.** Sections are taken in priority order until the next
one would exceed `learningsInjection.maxBytesPerDocument`; the remaining sections are
omitted. If the **first** section alone exceeds the bound, it is taken up to the bound and
cut. Either way the document's row carries the **bounded** flag (AC-2.3) and the block
states that the document is abridged.

**How the total bound binds.** Documents are accumulated in BR-4's order until the next
document's contributed bytes would carry the running total past
`learningsInjection.maxTotalBytes`; that document and every lower-ordered one is dropped
**whole**, with `RSN-BYTES` (AC-2.4). No document is ever cut mid-document to make a total
fit — the per-document bound is the only cut this feature makes — and no back-fill follows
(BR-5).

**Determinism.** Both bounds and every byte count are derived from bytes alone, so two runs
over identical repository state produce byte-identical blocks, in the same order (AC-2.5).

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
| bytes injected | The document's contributed bytes, as BR-6 defines them |
| bounded | Whether this document's material was cut by the per-document bound (BR-6) |

plus one per-dispatch scalar: **total bytes injected**, the sum of the rows' contributed bytes.

The field enumeration is **closed**: a completeness test asserts set equality over it (DC-01). A
dispatch that injected nothing carries an **empty set of rows**, not a missing field — the difference
between "nothing was selected" and "nothing was recorded" must be visible in the report.

BR-10's rule-input record is separate, run-level, and closed on its own terms; the two are not merged.

### BR-9 — Non-selection reasons and notices: three closed catalogues *(AC-3.2, AC-4.1)*

**Per-document catalogue.** Every corpus document that was known but did not contribute carries
exactly one reason id from this closed set:

| Id | Meaning |
|---|---|
| `RSN-COUNT` | Dropped by the count bound (BR-5) |
| `RSN-BYTES` | Dropped whole by the total byte bound (BR-6) |
| `RSN-SELF` | `{f}`'s own LEARNINGS (BR-2) |
| `RSN-UNREADABLE` | The read failed (BR-3) |
| `RSN-UNPARSEABLE` | Read, but not a LEARNINGS document (BR-3) |
| `RSN-NO-MATERIAL` | Eligible, but carries none of BR-6's priority sections (BR-6) |

**Corpus-level catalogue.** States in which **no document is known** are recorded once per run, from
their own closed set:

| Id | Meaning |
|---|---|
| `RSN-UNLISTABLE` | The corpus listing failed outright (BR-12) |
| `RSN-EMPTY` | The listing succeeded and found nothing |

**Notice catalogue.** BR-14's notices carry ids from their own closed set:

| Id | Meaning |
|---|---|
| `NTC-MALFORMED` | Section present, not an object (BR-14) |
| `NTC-KEYTYPE` | A declared key was wrong-typed, took its default (BR-14) |

Rules binding the three catalogues:

- Each catalogue is **closed**: a completeness test per catalogue asserts set equality over its
  members (DC-01, C-9). A new reason may not be emitted without being added to a catalogue and its
  test.
- The catalogues are **disjoint in kind**: no id is used in another catalogue's position.
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
| One document carries no priority section | That one is skipped with `RSN-NO-MATERIAL`; the rest are used normally |
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

### BR-14 — Configuration states *(AC-4.4, AC-5.1a, AC-5.1b, AC-5.1c)*

Five states, five behaviours:

| State | Dispatch composition | Record |
|---|---|---|
| Section **absent**, or the config file absent | Byte-identical to the recorded pre-feature baseline | **No injection key at all** — absent, not present-and-empty |
| `enabled: false` | Byte-identical to the recorded pre-feature baseline | No injection key at all |
| Section present but **malformed** — `learningsInjection` present and not an object | Byte-identical to the recorded pre-feature baseline | `NTC-MALFORMED`, naming the malformed configuration |
| Section present, a declared key **wrong-typed** | The enabled composition, that key at its default | `NTC-KEYTYPE`, naming the key |
| **Enabled**, with thresholds admitting nothing (zero documents or zero bytes) | The enabled composition, with an empty selection | BR-8's rows, **present and empty** |

Three points carry load:

- **Malformed means present and wrong-shaped** — the reading the repository's sibling
  config readers already ship: `parseAdvisoryConfig` sets `sectionMalformed` only where the
  section key is present and not an object, and `parseMergeConfig` carries the same meaning
  (`pdlc/workflows/orchestrate-dev.js`). A **misspelt section name** is a stray top-level
  key, not a present section, so it reads as absent: baseline-identical run, no notice.
  Detecting it would need a closed registry of legal top-level keys in
  `.claude/pdlc.config.json`, which does not exist and would misfire on keys a later feature
  adds; an unknown-top-level-key rule is **decided against**. REQ AC-5.1b's
  example makes that typo the detectable case and no longer holds — `ERRATUM: REQ` rides.
- **A wrong-typed declared key is not malformed.** It falls back to its default, the run stays
  **enabled**, and `NTC-KEYTYPE` names the key — the per-key fallback plus invalid-key
  notice the siblings ship (`parseAdvisoryConfig`, `orchestrate-dev.js`).
  Turning the feature off over one mistyped threshold would diverge from that for no stated
  reason (DC-08).
- **An absent config file is the absent-section state**: no injection, no record. That
  differs deliberately from `parseAdvisoryConfig`, which defaults an absent file to
  enabled-with-defaults; this feature adds material to authoring prompts, so it turns on
  only where an operator asked for it.
- **Admits-nothing thresholds are a valid configuration, not an invalid one.** Zero
  documents or zero bytes is an enabled run with an empty selection — BR-8's rows present
  and empty — never a refusal to run and never AC-5.1a's absent key. The pipeline does not
  second-guess an operator's arithmetic.

### BR-15 — Filesystem footprint *(AC-5.2)*

On an **enabled** run, the corpus paths touched are **exactly** the reads the record
accounts for — a positive membership claim, not an absence-only one. Both sides are made
computable so AT-33 can assert set equality:

- **Observed set:** the file-open calls the run makes under `docs/`, over one observation
  window covering the whole run.
- **Expected set:** the corpus-root enumeration, plus one open attempt for every corpus
  document the report names — in BR-8's rows or BR-9's per-document reason rows — except
  those carrying `RSN-SELF`, decided from the path before any read. `RSN-UNREADABLE`
  documents belong to it: the failed attempt is the read.

Nothing under `docs/_constraints/` or `docs/_decisions/` is written, no LEARNINGS document
or skill prompt is written, and no index, cache or state file is created anywhere (NG-1,
NG-4). On a disabled run the same instrument, in the same window, observes no corpus path at
all — an absence claim that carries weight only because the enabled case on that same
instrument shows it firing (AT-33, AT-34).

### BR-16 — Pipeline semantics preserved *(AC-5.3)*

On a run with injection active, the completeness criteria, required headings, verdict grammar, round
windows and approval anchors that score the documents produced are exactly those in force without it.
This feature changes **what an author is told**, never **what the pipeline requires an author to
produce**. It adds no required section, no new heading, no new verdict token and no new approval
condition.

## Edge Cases and Error Scenarios

This is the **branch inventory** DC-05 scores the Acceptance Tests section against. Every row names a
behavioural branch, its outcome, and the test that asserts it.

### Corpus states

| # | Scenario | Outcome | AT |
|---|---|---|---|
| E-01 | No prior LEARNINGS anywhere — the first feature ever run in the repository | Every authoring dispatch composed exactly as today; run completes unchanged; corpus-level `RSN-EMPTY` | AT-24 |
| E-02 | Corpus listing fails outright | Empty block; corpus-level `RSN-UNLISTABLE`; run continues | AT-25 |
| E-03 | One document unreadable, others fine | That one `RSN-UNREADABLE`; the rest selected normally | AT-26 |
| E-04 | One document reads but is not a LEARNINGS document | `RSN-UNPARSEABLE`; the rest selected normally | AT-27 |
| E-06 | Corpus contains only `{f}`'s own LEARNINGS | Empty selection, `RSN-SELF` row, empty BR-8 rows — not `RSN-EMPTY`, since a document *was* known | AT-04 |
| E-07 | Corpus contains only documents under `docs/discarded/` | Corpus-level `RSN-EMPTY`; discarded documents appear in no record | AT-15 |
| E-35 | A document directly at `docs/discarded/LEARNINGS-x.md` | Corpus member; eligible and selectable — no exclusion fires | AT-15 |
| E-08 | Every corpus document is unreadable | Empty block; every document carries `RSN-UNREADABLE`; no corpus-level id, since documents were known | AT-26 |

### Selection and bounding edges

| # | Scenario | Outcome | AT |
|---|---|---|---|
| E-09 | Eligible count exactly equals `maxDocuments` | All taken; no `RSN-COUNT` row | AT-07 |
| E-10 | Eligible count exceeds `maxDocuments` | Exactly `maxDocuments` taken; remainder `RSN-COUNT` | AT-07, AT-08 |
| E-11 | Two documents share a `Date Completed` value | Tiebreak by path byte order; order is stable across runs | AT-09 |
| E-12 | A document has no `Date Completed` row (measured: 2 of 89 at HEAD) | Ranked by tiebreak alone; still eligible; never excluded for it | AT-10 |
| E-13 | A `Date Completed` value carries free text after the date (measured: occurs at HEAD) | The date is read; the trailing text does not make the key unparseable | AT-10 |
| E-14 | A `Date Completed` value is entirely unparseable as a date | Treated as absent; tiebreak applies; document remains eligible | AT-10 |
| E-15 | One document exceeds `maxBytesPerDocument` | Material cut at the bound per BR-6; row flagged **bounded**; document still contributes | AT-11 |
| E-16 | A document's **first** priority section alone exceeds `maxBytesPerDocument` | That section taken up to the bound and cut; row flagged bounded | AT-12 |
| E-17 | Combined material would exceed `maxTotalBytes` | Whole documents dropped from the low end with `RSN-BYTES`; never a mid-document cut for the total | AT-13 |
| E-18 | A single document's bounded material alone exceeds `maxTotalBytes` | It is dropped whole with `RSN-BYTES`; the selection is empty; BR-8 rows present and empty | AT-13 |
| E-19 | A LEARNINGS document is missing one or more of BR-6's priority sections | Present sections injected in priority order; absent ones skipped silently; document is **not** unparseable for it | AT-11 |
| E-20 | Corpus mixes `docs/{p}/` and `docs/completed/{p}/` documents | Both eligible on identical terms; archival affects nothing but the path used in the tiebreak | AT-16 |
| E-33 | A LEARNINGS document carries none of BR-6's priority sections (measured: occurs at HEAD) | `RSN-NO-MATERIAL`; consumes no `maxDocuments` slot; the rest are used normally | AT-28 |

### Configuration edges

| # | Scenario | Outcome | AT |
|---|---|---|---|
| E-21 | Configuration section absent | Baseline-identical composition; no injection key | AT-31 |
| E-22 | `enabled: false` | Baseline-identical composition; no injection key | AT-31 |
| E-23 | Section present and not an object | Baseline-identical composition, plus `NTC-MALFORMED`; a misspelt section name reads as absent | AT-32 |
| E-24 | `maxDocuments: 0` | Enabled run, empty selection, BR-8 rows present and empty | AT-30 |
| E-25 | `maxTotalBytes: 0` | Enabled run, empty selection, BR-8 rows present and empty | AT-30 |
| E-26 | One threshold configured, two defaulted | Configured value used for one, defaults for the others; all three appear in BR-10's record | AT-22 |
| E-34 | A declared key is wrong-typed | Enabled run, that key at its default, plus `NTC-KEYTYPE` naming it — not baseline-identical | AT-32 |

### Run-shape edges

| # | Scenario | Outcome | AT |
|---|---|---|---|
| E-27 | Run makes no DECISIONS phase | Set equality holds over the dispatches that happened; no fixed count is asserted | AT-02 |
| E-28 | Phase R has no creator — the REQ arrived already authored | Only the optimizer dispatches for REQ carry blocks; set equality still holds | AT-02 |
| E-29 | A phase runs five optimizer rounds | Each round's authoring dispatch carries a block, re-composed per dispatch | AT-01, AT-02 |
| E-30 | An erratum dispatch is made | It carries a block, on the same terms as any authoring dispatch | AT-01 |
| E-31 | `{f}` is a re-run and `docs/{f}/LEARNINGS-{f}.md` already exists | `RSN-SELF` in every phase; no material from it anywhere | AT-04 |
| E-32 | Corpus changes mid-run (a file appears between two dispatches) | Each dispatch selects over the state **it** observed; the report records what each dispatch actually used, so the difference is visible rather than hidden | AT-18 |

### Non-scenarios — stated so they are not re-litigated

- **An author disputing an injected document.** No erratum, no new channel, no requirement on the
  author (BR-13). The observation lands in REQ O-3's operator record.
- **Two authors in the same run receiving different material.** Permitted and expected: each dispatch
  selects independently, and E-32 makes the difference reportable. Nothing requires the run to pin one
  selection for its whole duration.
- **A reviewer receiving the block.** Out of scope by NG-5 and BR-1; widening is REQ O-6's successor
  REQ, not an implicit extension of this one.

## Acceptance Tests

**Execution conditions (AC-6.1, AC-6.2).** Every test below runs in CI against **fixture corpora with
no live model calls**. Determinism is asserted by comparing two compositions, never by inspection.
Byte-identity tests compare against a **recorded baseline**: a composition captured from pre-feature
HEAD, committed, and never regenerated by the branch under test — so a regression that leaks injected
text into a disabled run is a test failure rather than a production discovery.

### Group 1 — the material reaches the authoring roles

- **AT-01** — *Who:* the operator. *Given* a fixture corpus holding LEARNINGS for at least one prior
  feature `{p}` and injection enabled at defaults, *when* any dispatch BR-1 names is composed —
  creator, optimizer round or erratum — *then* it contains material from at least one `{p}` document,
  delimited and identified by source path.
- **AT-02** — *Given* a scripted run, *when* **every agent invocation the run makes** is
  inspected — the whole dispatch universe, not only those already classified authoring —
  *then* the subset carrying a block **equals** the subset BR-1's classification names,
  asserted as set equality over that universe, with fixtures covering a run with no
  DECISIONS phase, a run whose Phase R has no creator, and a run with five optimizer rounds.
- **AT-03** — *Given* the same fixtures and the same universe, *when* each non-authoring
  dispatch's prompt is compared with the recorded pre-feature baseline, *then* it is
  byte-identical.
- **AT-04** — *Given* a fixture where `docs/{f}/LEARNINGS-{f}.md` exists, *when* an
  authoring dispatch for `{f}` is composed in any phase, *then* it contains no material from
  that document, the report carries a per-document `RSN-SELF` row for it, and **no**
  corpus-level `RSN-EMPTY` is recorded — the document was known (E-06).
- **AT-05** — *Given* a dispatch carrying a block, *when* the preamble is inspected, *then*
  it is byte-equal to the preamble text transcribed literally from the wording TSPEC fixes
  (F-O-2) — not matched by keyword search — and that text states the three things BR-7
  requires.
- **AT-06** — *Given* the same dispatch, *when* its prompt is diffed against the baseline, *then* the
  grounding manifest, upstream documents and pacing contract are present, unchanged, and in their
  existing relative order; the block is purely additive.

### Group 2 — bounded, deterministic selection

- **AT-07** — *Given* fixture corpora of 1, `maxDocuments` and 50 eligible documents, sized
  so that the total bound does not bind, *when* dispatches are composed, *then* the
  contributing-document counts are 1, `maxDocuments` and `maxDocuments`, and only the third
  produces `RSN-COUNT` rows. *And given* a corpus whose documents are large enough that
  `maxTotalBytes` binds first under the same thresholds, *then* the contributing count is
  strictly below `maxDocuments` with `RSN-BYTES` rows — the count bound is asserted under
  both regimes rather than only where a fixture is small enough to make it bind (BR-5).
- **AT-08** — *Given* an eligible set larger than `maxDocuments`, *when* selection runs, *then* the
  selected documents are the highest-ordered under BR-4, and every unselected one carries
  `RSN-COUNT`.
- **AT-09** — *Given* two documents sharing a `Date Completed` value, *when* selection runs twice,
  *then* their relative order is byte order over path in both runs.
- **AT-10** — *Given* a fixture where one document has no `Date Completed` row, one value
  carries trailing free text, and one value is an unparseable date, *when* selection runs,
  *then* all three remain eligible, the trailing-text document's date is read correctly, and
  the other two rank by the path tiebreak. *And given* the corpus's git commit order and its
  ctime order are both the reverse of its `Date Completed` order, each file's mtime is
  permuted, and the wall-clock time differs between two compositions, *then* the selection
  and its order are identical in both.
- **AT-11** — *Given* a document exceeding `maxBytesPerDocument`, and separately one missing
  some of BR-6's priority sections, *when* each is selected, *then* the contributed
  bytes do not exceed the bound and equal an expected count **committed with the fixture as a
  literal integer**, recomputed by hand when the fixture changes, never derived in the test — the first document's row carries the bounded flag, and the second
  contributes its present sections in priority order, not marked unparseable. *And
  given* an unbounded document carrying all six conventional sections, *then* the set of
  section names appearing in its block material **equals** BR-6's five injected names in
  priority order, and the Approval Record's distinctive fixture text is absent **while** all
  five injected sections' texts are present.
- **AT-12** — *Given* a document whose first priority section alone exceeds
  `maxBytesPerDocument`, *when* it is selected, *then* the material taken is cut at the
  bound, its contributed bytes equal the bound as a fixture literal, recomputed by hand on change, never derived in the test, and its row is flagged bounded.
- **AT-13** — *Given* a fixture of eight eligible documents with `maxDocuments` 5, sized so
  that `maxTotalBytes` drops the lowest-ordered of the five taken, *when* composition runs,
  *then* whole documents are dropped from the low end with `RSN-BYTES`, no document is cut
  mid-document to make the total fit, the selected set is a prefix of the ordered eligible
  set, no count-cut document is back-filled into the freed slot, and set equality is
  asserted over the reason id recorded for each of the eight. *And given* a single document
  whose bounded material alone exceeds `maxTotalBytes`, *then* the selection is empty and
  BR-8's rows are present and empty. Its dropped set and byte counts are fixture literals,
  never derived.
- **AT-14** — *Given* two runs over an identical fixture repository state, *when* the composed
  dispatches for the same document type are compared, *then* the blocks are byte-identical, including
  order.
  The two compositions are made in **two separate process invocations**, so that a block
  cached in-process across dispatches (E-32) cannot pass as determinism.

- **AT-15** — *Given* a fixture whose only LEARNINGS documents lie under `docs/discarded/`, *when*
  selection runs, *then* nothing is selected, the report carries corpus-level `RSN-EMPTY`, and no
  discarded document appears in any record. *And given* a one-file fixture holding exactly
  `docs/discarded/LEARNINGS-x.md`, *then* it is a corpus member, is selected, and carries no
  exclusion reason (E-35).
- **AT-16** — *Given* a corpus mixing `docs/{p}/` and `docs/completed/{p}/` documents, *when*
  selection runs, *then* both are eligible on identical terms and location affects rank only through
  the path tiebreak.

### Group 3 — observability

- **AT-17** — *Given* a completed run with injection active, *when* the report is read, *then* each
  authoring dispatch carries, per selected document, the source path, order position, bytes injected
  and bounded flag, plus the per-dispatch total bytes — and a **completeness test asserts set equality
  over exactly those fields** (DC-01).
- **AT-18** — *Given* a dispatch that selected nothing, and separately a run where the corpus changed
  between two dispatches, *when* the report is read, *then* the first carries an empty set of rows
  rather than a missing field, and the second records per dispatch what that dispatch actually used.
- **AT-19** — *Given* a report, *when* it is read, *then* every known-but-unselected document carries
  exactly one per-document reason id, and a **completeness test asserts set equality** over
  `RSN-COUNT`, `RSN-BYTES`, `RSN-SELF`, `RSN-UNREADABLE`, `RSN-UNPARSEABLE`, `RSN-NO-MATERIAL`.
- **AT-20** — *Given* a report, *when* corpus-level outcomes are read, *then* a second **completeness
  test asserts set equality** over `RSN-UNLISTABLE` and `RSN-EMPTY`, and neither catalogue's ids
  appear in the other's position.
- **AT-21** — *Given* a run in which a corpus-level outcome was recorded, *when* the report is read,
  *then* BR-8's per-dispatch rows are present and empty for every authoring dispatch.
- **AT-22** — *Given* an operator holding only the report and the fixture corpus, *when* the
  report's run-level rule-input record is read — the ordering key value per corpus document,
  with an explicit marker where absent or unparseable, and the three thresholds in force —
  *then* it equals an expected selection **transcribed literally by hand and committed in
  the fixture** (paths, in order), and a completeness test asserts set equality over the
  record's two members. The test neither calls the production selector nor reimplements it.
- **AT-23** — *Given* a run with injection active, *when* the author-emitted channels the
  run requires are enumerated, *then* that set **equals** the recorded pre-feature baseline
  set: no erratum round is opened on account of an injected document, no new channel appears,
  and the only trace of an injected document is BR-8's rows naming source paths.
### Group 4 — fail-open under corpus state

- **AT-24** — *Given* a repository with no prior LEARNINGS at all, *when* the pipeline runs, *then*
  every authoring dispatch is byte-identical to the baseline composition, the run completes with
  unchanged behaviour, and the report records corpus-level `RSN-EMPTY`.
- **AT-25** — *Given* a corpus listing that fails outright, *when* selection runs, *then* the block is
  empty, the report records `RSN-UNLISTABLE`, the run continues, and no exception, halt or POSTMORTEM
  results.
- **AT-26** — *Given* one unreadable document among readable ones, and separately a corpus in which
  every document is unreadable, *when* selection runs, *then* the affected documents carry
  `RSN-UNREADABLE`, the readable ones are used normally in the first case, and neither case produces a
  corpus-level id — documents were known.
- **AT-27** — *Given* a corpus file that reads but does not parse as a LEARNINGS document, *when*
  selection runs, *then* it carries `RSN-UNPARSEABLE` and the rest of the corpus is used normally.
- **AT-28** — *Given* a LEARNINGS document carrying none of BR-6's priority sections, *when*
  selection runs, *then* it carries `RSN-NO-MATERIAL`, consumes no `maxDocuments` slot, the
  rest of the corpus is used normally, and it is not recorded as bounded under BR-6.
- **AT-29** — *Given* two scripted runs over the same fixture matrix differing **only** in
  the injected block — one enabled, one disabled — *when* both complete, *then* parsed
  verdicts, structural completeness scores, round-window counters, approval anchors and
  erratum routes are equal member for member, asserted as set equality over those five, and
  every non-authoring dispatch prompt is byte-identical to the recorded baseline.
- **AT-30** — *Given* thresholds configured to admit nothing — `maxDocuments: 0`, and separately
  `maxTotalBytes: 0` — *when* the pipeline runs, *then* it behaves as an enabled run with an empty
  selection: BR-8's rows present and empty, **not** the absent key of a disabled run, and no refusal
  to run.

### Group 5 — inertness when disabled, and semantics preserved

- **AT-31** — *Given* `enabled: false`, and separately the configuration section absent, *when* the
  pipeline runs, *then* every composed dispatch is byte-identical to the recorded pre-feature
  baseline and no injection key is carried — absent, not present-and-empty.
- **AT-32** — *Given* a configuration section present and not an object, *when* the pipeline
  runs, *then* the composition matches AT-31's byte-for-byte and the report carries
  `NTC-MALFORMED`. *And given* `maxDocuments: "five"` with the other two thresholds configured,
  *then* the run is enabled, BR-10's record shows `maxDocuments` at its §4.1 default literal 5
  while the other two show their configured values, the selection equals a fixture literal, and
  `NTC-KEYTYPE` names `maxDocuments`. *And* a **completeness test asserts set equality** over `NTC-MALFORMED` and
  `NTC-KEYTYPE`. *And given* a misspelt
  section name (`learningsInjectoin`), *then* the run is indistinguishable from AT-31's
  absent-section case — no notice, per BR-14's decision against an unknown-key rule.

- **AT-33** — *Given* an enabled run, *when* the file-open calls under `docs/` are observed
  over one window covering the whole run, *then* that observed set **equals** BR-15's
  expected set — the corpus-root enumeration plus one attempt per report-named document
  other than the `RSN-SELF` ones — the observed set is non-empty, nothing under
  `docs/_constraints/` or `docs/_decisions/` is written, no LEARNINGS document or skill
  prompt is written, and no index, cache or state file is created anywhere.
- **AT-34** — *Given* a disabled run observed on the **same instrument and in the same test
  as AT-33**, *when* the run completes, *then* no corpus path is touched at all, the composed
  dispatches are byte-identical to the recorded pre-feature baseline, and the run reaches
  completion — AT-33's non-empty observed set supplying the control that the instrument
  fires when there is something to see.
- **AT-35** — *Given* an enabled run, *when* the documents it produces are scored, *then* the
  completeness criteria, required headings, verdict grammar, round windows and approval anchors are
  exactly those in force without the feature.

### Branch coverage check

Every row of §Edge Cases and Error Scenarios (E-01 … E-35, less retired E-05) names an AT, and
every AT above appears in
§Linked Requirements' reverse trace. Every branch of the D-1 … D-12 decision table is exercised: D-1
by AT-30/31/32, D-2 by AT-02/03, D-3 by AT-25, D-4 by AT-24, D-5 by AT-04/16, D-6 by AT-26/27,
D-7 by AT-09/10, D-8 by AT-07/08, D-9 by AT-11/12, D-10 by AT-13, D-11 by AT-18/21/30, D-12 by
AT-28.

## Open Questions

### Discharged here

| REQ obligation | Disposition |
|---|---|
| **O-2** — state the ordering key over measured harvest metadata, before FSPEC authoring | **Discharged** in BR-4: the `Date Completed` row, most recent first, with a total path tiebreak. Measured across 89 corpus documents in both repositories the REQ names; 87 carry the key, 2 do not, and free-text suffixes occur. |
| **O-4** — decide which part of a LEARNINGS document is injected when the per-document bound binds | **Discharged** in BR-6: a named subset — Cross-Feature Patterns, Non-Convergences, Rejected Proposals, Process Learnings, Open Items — in that priority order, Approval Record never injected, with the bound cutting at section boundaries and, only where the first section alone overruns, within it. |

### Carried to TSPEC as named entry obligations

| # | Obligation | Owner |
|---|---|---|
| F-O-1 | The predicate for "presents as a LEARNINGS document" (BR-3), bounded by two requirements this FSPEC fixes: it consults only the document's bytes, and it is decidable without a model call. | TSPEC |
| F-O-2 | The wording of BR-7's advisory preamble and the block's delimiters — this FSPEC fixes what the preamble must convey, not what it says. | TSPEC |
| F-O-3 | The serialised form of BR-8, BR-9 and BR-10's records in the run report, and the catalogue registration of every id and notice they emit (C-9). | TSPEC |
| F-O-4 | The pin of BR-2's corpus definition to `consolidate-learnings.js`'s pass-side predicate by literal restatement plus a pinning test — REQ O-7 restated, unchanged. Import remains unavailable: the engine vendors only `orchestrate-dev.js` and `orchestrate-queue.js` (`pdlc/engine/scripts/prepack.mjs`, `MODULE_NAMES`). | TSPEC |
| F-O-5 | How the recorded pre-feature baseline of AC-6.2 is captured and committed, given it must never be regenerated by the branch under test. | TSPEC / PROPERTIES |
| F-O-6 | Where the selection step sits relative to dispatch composition, and how the block reaches the composer without displacing existing content (BR-7). | TSPEC |

### Still open, unresolved by design

| # | Question | Status |
|---|---|---|
| F-Q-1 | Whether review roles should receive the same material. | REQ O-6, unchanged. NG-5 excludes them; revisit with O-3's evidence; a widening is a successor REQ with its own queue row. |
| F-Q-2 | Whether the three §4.1 thresholds survive contact with a live run. | REQ O-1, unchanged. They are declared points, not measured floors; this FSPEC references them by name and never transcribes their values, so a re-derivation changes one table in the REQ and nothing here. |
| F-Q-3 | Whether the `Date Completed` key is a good proxy for relevance. | REQ R-3's acknowledged trade. BR-4 makes recency the rule because it is deterministic and cheap; O-3's usage evidence is the input to any later relevance rule. |
| F-Q-4 | Whether `docs/_constraints/` should hold the ordering-key measurement so a later feature need not re-measure. | Deferred. The measurement in BR-4 is this feature's own evidence; promoting it to a shared baseline is consolidation's call, not this REQ's (NG-1). |

### Assumptions

- **A-1** — Consumer repositories carry `.claude/pdlc.config.json` already, for `implementation.testCommand` and the advisory tier, so §4.1's keys have a home that needs no new mechanism. REQ O-5 asks the operator to confirm this placement; no rule in this document depends on the answer, and the keys move together if it changes.
- **A-2** — The pipeline's existing authoring classification is stable enough to be consumed rather than restated (BR-1). If a future phase introduces a dispatch kind that is authoring in spirit but not so classified, BR-1 excludes it by construction, and that is the correct default: widening is explicit, never implicit.
- **A-3** — Most LEARNINGS documents carry the conventional sections BR-6 names, but not
  all do. Where a document carries fewer, BR-6 degrades to those present (E-19); where it
  carries none of them — measured at HEAD, at least one does (E-33) — it is dropped with
  `RSN-NO-MATERIAL` and consumes no slot; where a future harvest adds a seventh section, it
  is not injected until this rule is amended.
