---
feature: pdlc-decision-ledger
---

# FSPEC pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` **v1.7** |
| Downstream | TSPEC, DECISIONS, PLAN, PROPERTIES |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1** — cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-28 |

## 1. Overview

**FSPEC-DECLEDGER-01.** This spec describes the behavior of the **decision ledger**: a rendered
index of already-closed decisions, injected into review dispatch prompts, accompanied by rule text
telling the reviewer not to re-open an indexed decision without a High-severity finding citing new
evidence.

The mechanism has exactly two moving parts, and the split between them governs the whole spec:

| Part | Where the behavior lands | Observable |
|---|---|---|
| **The index** | Driver-side. The driver gathers the in-scope closed decisions, renders them, and places the rendered block in the review dispatch prompt. | The dispatch prompt's bytes |
| **The rule** | Reviewer-side. The rule reaches the reviewer as prompt text and changes nothing the driver computes. | The dispatch prompt's bytes; the reviewer's own cross-review artifact is the *intended effect*, never an asserted outcome |

Both parts are gated by one config key (`decisionLedger.enabled`, REQ C-3), default off. **With the
flag off, no behavior in this document happens at all** and the dispatch stream is byte-identical to
the pre-feature baseline — that is REQ-DECLEDGER-02, and it is the reason every flow below opens with
the same gate check.

**What this spec deliberately does not describe.** Three things behavioral complexity might seem to
demand, which are routed rather than decided here:

1. **The recognition rule** — what markup makes a heading a decision record, the id grammar, the key
   that resolves an id opened more than once in a file, and precedence across files. REQ §7 O-1 owns
   this as TSPEC material. This spec describes what the driver does *with* the in-scope set, and
   states the set's extent only by citing the Baseline's `M-1d` / `M-2e` enumerations at v1.1's
   `Verified at` commit.
2. **The rendered line's concrete format** — field order, separators, and the byte-level shape of a
   line. The REQ fixes the line's *field content* (id, one-line statement, source citation naming
   record file and heading); the rendering is TSPEC's, consistent with O-1's ownership of the
   omission order that shares the same renderer.
3. **Which lines are omitted** when the set exceeds a bound. REQ-DECLEDGER-07 fixes the *outcome*
   (never over bound, never truncated mid-line, never aborted); the selection is O-1's.

An FSPEC is warranted here despite that routing, because the parts this spec does own are genuinely
branching and an engineer should not decide them alone: a three-way gate (enabled / disabled /
malformed), a fail-open path with **two distinct legs** that degrade differently (every source
unavailable versus one decision of several failing), a boundary case where an empty file must take
the *ordinary* leg rather than the failure leg, and two size bounds whose interaction at the
single-oversized-line case has a stated outcome. §5 is the substance of this document.

**Precedent.** The shipped `learningsInjection` channel is the behavioral model throughout: derived
at dispatch-construction time, per-key independent fallback, degrading to silence rather than to a
halt, and disclosed in `.claude/pdlc.config.example.json`. Where this spec says "as
`learningsInjection` does," it names a shipped behavior, not a code path.

## 2. Linked Requirements

Every behavior in this document traces to exactly one REQ acceptance criterion. The right-hand
column names where in this spec the criterion's behavior is specified; nothing in §3–§6 exists
without a row here.

| Requirement | What it fixes | Specified in |
|---|---|---|
| **REQ-DECLEDGER-01** | Index rendered when enabled, one line per in-scope decision, sourced fresh at dispatch-construction time | BR-1, BR-2, BR-3, BR-9; flow §3.2 steps 2–5; AT-01, AT-02, AT-03 |
| **REQ-DECLEDGER-02** | Disabled path byte-identical to the pre-feature baseline | BR-4; flow §3.2 step 1; E-1; AT-04, AT-05 |
| **REQ-DECLEDGER-03** | Rule text requires High severity **and** new evidence to re-open | BR-5, BR-6; flow §3.2 step 6; AT-06, AT-07 |
| **REQ-DECLEDGER-04** | Index construction fails open, two legs, never silently stale | BR-7, BR-8; flow §3.3; E-2, E-3, E-4; AT-08, AT-09, AT-10 |
| **REQ-DECLEDGER-05** | Three config keys fail open independently | BR-10; flow §3.1; E-5; AT-11 |
| **REQ-DECLEDGER-06** | Decision id is the reviewer's reopening dedupe key; driver identity unchanged | BR-6, BR-11; AT-12 |
| **REQ-DECLEDGER-07** | Rendered index stays within both declared bounds | BR-12, BR-13; E-6, E-7, E-8; AT-13, AT-14, AT-15 |
| **REQ-DECLEDGER-08** | Driver-side scoring identical whether the flag is on or off | BR-11, BR-14; AT-16, AT-17 |

**User stories** (REQ §8, unchanged here): US-01 reviewer re-litigation — REQ-DECLEDGER-01/-03/-06;
US-02 operator currency and bounded size — REQ-DECLEDGER-04/-07; US-03 operator safe-to-enable —
REQ-DECLEDGER-02/-05/-08.

**Non-goals carried through.** This spec adds no behavior outside the REQ's non-goals. In
particular it specifies **no** driver-side reading of a decision id (NG-4), **no** change to
`MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS` or `MAX_ERRATUM_FOLLOWUP_ROUNDS` (NG-5), and **no**
new record file type or new field on any existing record shape (REQ §2 G-1).

**G-4 has no row**, by REQ design: it is a non-binding rationale note measured retrospectively from
committed `CROSS-REVIEW-*` artifacts, and no gate, test, flow or acceptance test in this document
depends on it.

## 3. Behavioral Flow

All of it runs at **dispatch-construction time**, once per review dispatch. Nothing here runs at
round start, at phase entry, or on a schedule, and nothing is carried forward from an earlier
dispatch in the round window (REQ-DECLEDGER-01, mirroring the shipped `REQ-LOOPECON-01b`
recompute-at-dispatch contract).

### 3.1 Reading configuration

Config is read for the dispatch from the operator's `.claude/pdlc.config.json`. The
`decisionLedger` block holds exactly the three keys REQ C-3 enumerates. Each key is resolved
independently:

| Condition on a key | Resolution |
|---|---|
| Present, right type, valid | Use the operator's value |
| Present, wrong type, or malformed | That key alone falls back to its C-5 default |
| Absent | That key falls back to its C-5 default |
| The whole `decisionLedger` block absent or malformed | All three keys take their C-5 defaults, which means `enabled` is `false` |

Resolution of one key never affects another key, another config block, or the run (BR-10). Defaults
are `enabled` `false`, `maxEntries` `70`, `maxBytes` `8000` (REQ C-5).

### 3.2 Constructing a review dispatch — the enabled path

1. **Gate.** If resolved `enabled` is not `true`, stop. The dispatch is constructed exactly as it
   is today: no index block, no rule text, no marker, no whitespace (BR-4). Steps 2–6 do not run.
2. **Determine the in-scope set.** The set is the project's closed decisions plus those of the
   feature whose document is under review, with the **individual decision** as the unit, not the
   file (REQ §2 G-1). It is derivable, not a per-document relevance judgement: nothing about the
   document under review beyond its feature narrows the set.
3. **Gather the records.** Read the decision-record sources as they exist now. A source that is
   missing, unreadable, or unparseable routes to §3.3 rather than to a failure.
4. **Render.** Each in-scope decision renders **exactly once**, on one line carrying its id, a
   one-line statement of what it decided, and a source citation naming the record file and the
   record's heading. Where a record carries an origin or evidence datum it may follow; where it does
   not, the line renders without it, which is not a defect (BR-3).
5. **Apply bounds.** If the rendered set exceeds `maxEntries` rows or `maxBytes` bytes, whole lines
   are omitted until both bounds hold (BR-12, BR-13). The dispatch is never oversized and never
   aborted over index size.
6. **Attach the rule text.** Rule text is placed adjacent to the index, carrying REQ-DECLEDGER-03's
   two-conjunct bar and its two boundary exemplars, and REQ-DECLEDGER-06's id-as-reopening-key
   direction (BR-5, BR-6).

The dispatch is then issued. **The driver's work ends at step 6**: it has written prompt bytes and
computed nothing it will later consult.

### 3.3 The fail-open path — two legs that degrade differently

Entered from step 3 when a source is missing, unreadable, or fails to parse. Which leg is taken
depends on how much survives, and the legs are not interchangeable:

| Leg | Condition | Behavior |
|---|---|---|
| **Total** | **Every** source is unavailable | Fall back to the disabled behavior of REQ-DECLEDGER-02 — no index block, no rule text. The dispatch is as if the flag were off |
| **Partial** | **One decision of several** fails to render | Omit that line; every other line renders; the index and rule text are present |

Neither leg is a halt, and neither introduces an operator-facing failure class. Both degrade as
`learningsInjection`'s fail-open path does. The direction is deliberate and safe in one direction
only: a decision **absent** from the index is one a reviewer may freely challenge, whereas a
decision rendered **wrongly** would suppress a legitimate challenge — which is why a line that
cannot be rendered faithfully is dropped rather than rendered partially (BR-7).

**A third case is not a leg of this path at all.** A source file that exists, reads, and parses but
holds no decision record yields an **ordinary empty result** and takes neither leg — Baseline `M-4e`
records that nothing in the corpus distinguishes an empty file from a failure to read, so the two
are separated by construction. Two files in the standing corpus are in exactly this position
(`M-4a`, `M-4b`), so this is the common case and not a curiosity (BR-8, E-4).

### 3.4 What the reviewer does with it

Outside the driver, and stated here only so the boundary is unambiguous. The reviewer reads the
index and the rule, and decides whether a finding they were going to file re-opens an indexed
decision. If it does, they file it only when it is High severity **and** cites evidence outside that
decision's own record; otherwise they do not file it, or they record a repeat against the decision
id (REQ-DECLEDGER-06).

**A reviewer who files anyway is not intercepted.** The finding reaches the driver and is scored,
deduped, routed and counted exactly as any other finding of its severity (BR-11, BR-14). Nothing in
§3.2 or §3.3 gives the driver a decision id to consult, so no suppression is mechanically possible —
this is what makes NG-4 falsifiable rather than aspirational.

## 4. Business Rules

Each rule states one behavior and names the criterion it serves. A rule is stated **once**; later
rules cite it rather than restating it.

### Index content and currency

**BR-1 — the index renders when, and only when, the flag resolves true.** A rendered index block
appears in a review dispatch prompt exactly when resolved `decisionLedger.enabled` is `true` and at
least one in-scope decision survives §3.3. In every other case no index block exists. *(-01, -02,
-04)*

**BR-2 — every in-scope decision renders exactly once.** Not at least once, not once per file it is
mentioned in. Where the recognition rule TSPEC owns resolves an id opened more than once to a single
record, that resolution happens before rendering, so the index carries one line for it. Baseline
`M-3a`/`M-3c` records the sole HEAD instance — a block where each id opens twice and only the second
opening states what was decided. *(-01)*

**BR-3 — two required fields plus a citation; nothing else is required.** A line carries the
decision id and a one-line statement of what was decided, plus a source citation naming the record
file and the record's heading. A record carrying an origin or evidence datum may render it; a record
not carrying one renders a line without it, and that line is **complete**, not degraded. A line whose
statement says what was *asked* rather than what was *decided* does not satisfy this rule. *(-01)*

**BR-4 — the disabled path emits nothing, not even a placeholder.** When the flag does not resolve
true, the dispatch prompt is byte-identical to the pre-feature baseline: no index, no rule text, no
empty block, no marker, no added or removed whitespace. "Byte-identical" is compared against a
committed fixture baseline, never a same-branch before/after assertion (REQ C-2). *(-02)*

**BR-9 — the index is derived fresh at dispatch-construction time.** Records are read as they exist
when the dispatch is constructed. No snapshot taken earlier in the round window is rendered, and no
index is reused across dispatches. A stale index is the failure this rule exists to exclude
(REQ §2 G-3, R-1). *(-01)*

### Rule text

**BR-5 — the bar is two conjuncts, and both are required.** The rule text instructs the reviewer not
to file a finding re-opening an indexed decision unless it is **High severity** *and* it cites
evidence that is not part of that decision's own record. Either conjunct alone is insufficient. *(-03)*

**BR-6 — evidence novelty is a reviewer judgement, made decidable by exemplars, never by a parser.**
No component compares citations, and nothing mechanically evaluates novelty. The rule text carries
both boundary exemplars so the reviewer can decide: **in** — a shipped behavior that changed after
the decision was recorded, cited at the changed source; **out** — a source the decision already
cites, re-cited at a different line or later commit with no behavioral change. The rule text also
directs the reviewer to treat the decision id as the reopening key across rounds, recording a repeat
as a repeat naming that id rather than as a fresh finding. *(-03, -06)*

### Failure and degradation

**BR-7 — failure degrades toward absence, never toward a wrong line.** Where a decision cannot be
rendered faithfully, its line is omitted rather than rendered partially. Absence lets a reviewer
challenge the decision freely; a wrong line would suppress a legitimate challenge. *(-04)*

**BR-8 — an empty source is an ordinary result, not a failure.** A source that exists, reads and
parses but holds no decision record contributes nothing and takes neither fail-open leg. It does not
trigger the total leg even when it is the only source read (`M-4e`). *(-04)*

### Configuration

**BR-10 — per-key independent fallback.** One wrong-typed, malformed or absent key falls back to its
own C-5 default; the block's other keys and every other config block are unaffected. The key set is
exactly C-3's three, so this is set equality over that enumeration crossed with {wrong type,
malformed, absent} — not containment. Follows the shipped `learningsInjection` /
`cascade.pinCheck` / `review.derivativeStop` precedent (REQ C-1). *(-05)*

### Driver invariance

**BR-11 — the driver never reads a decision id.** No driver-side computation — convergence,
dedupe, flat/non-flat classification, erratum minting, confirmation-presence checking — takes a
decision id as input. The reviewer-side reopening key of BR-6 and the driver's finding-identity
triple are different keys with different consumers and never compete. *(-06, -08)*

**BR-14 — a filed finding is scored identically regardless of the flag.** For one fixed set of
reviewer outputs replayed under both flag settings, every driver-side outcome is identical: the
convergence decision, the identity-triple dedupe and the resulting open-finding ledger, the
`review.derivativeStop` flat/non-flat classification, the erratum items minted under `DEC-ERRROUTE-01`,
and the fail-closed read of a non-approving confirmation carrying no parseable `FINDING:` line. A
High finding re-opening an indexed decision that a reviewer files anyway still mints its erratum item
and still satisfies the confirmation-presence check. *(-08)*

### Size bounds

**BR-12 — both bounds hold on the rendered index text alone.** `maxEntries` bounds the number of
rendered lines; `maxBytes` bounds the bytes of the index block as it appears in the prompt — not its
contribution to total dispatch size, and not the underlying records. Both hold simultaneously. *(-07)*

**BR-13 — over-budget omits whole lines and nothing else.** No line is truncated mid-line, no line
is abbreviated to fit, the dispatch is not oversized, and construction is not aborted. Which lines
are omitted is TSPEC's (O-1); that the bounds hold afterwards is this rule. *(-07)*

## 5. Edge Cases & Error Scenarios

Rendering is **total**: every case below has one stated outcome, and no case is left to an
engineer's discretion. Cases marked *(no HEAD instance)* have no witness in the standing corpus and
are owed a constructed fixture — REQ O-5/O-6 record that as a coverage obligation on PROPERTIES, not
as a defect here.

### Configuration edges

| # | Case | Outcome |
|---|---|---|
| **E-1** | `enabled` absent, `false`, wrong-typed, or the whole block missing | Disabled behavior, BR-4. All four spellings of "not enabled" collapse to one outcome; none is an error and none is reported to the operator |
| **E-5** | One key malformed, the other two valid — for each of the three keys, and for each of {wrong type, malformed, absent} | Only that key takes its default; the other two keep operator values; other blocks unaffected (BR-10). With `enabled` the malformed key, the fallback is `false`, so the run is a disabled run |

### Corpus edges

| # | Case | Outcome |
|---|---|---|
| **E-4** | A source file exists, reads and parses, and holds **zero** decision records | Ordinary empty result. Contributes nothing; neither fail-open leg is taken (BR-8). Two standing-corpus files are in this position — `M-4a` (decisions carried as bullets with no id at all) and `M-4b` (headings whose ids carry no namespace segment) |
| **E-9** | A file mixes decision records with headings that contain a `DEC-` id but record nothing — question headings and back-references | The non-records contribute no line; the file's real records render normally. `M-4d` is the sole HEAD instance, carrying 4 records alongside 8 such headings. Which headings qualify is the recognition rule's (O-1); that a mixed file still renders its real records is this spec's |
| **E-10** | One id is opened twice in one file, the first opening stating the question and the second stating the outcome | Exactly one line renders, and its statement says what was **decided** (BR-2, BR-3). `M-3c` is the sole HEAD witness |
| **E-11** *(no HEAD instance)* | The same id is recorded in both a project-level and a feature-level file | One line renders. `M-5a` records zero such ids at HEAD, so no expected value can be transcribed; `M-5c` names the intent — the project-level record wins, a decision promoted to project level rendering in its promoted form — and the rule itself is TSPEC's (O-1). Owed a synthetic two-file fixture (O-5) |

### Failure edges

| # | Case | Outcome |
|---|---|---|
| **E-2** *(no HEAD instance)* | **Every** decision-record source is missing, unreadable, or unparseable | Total leg: no index, no rule text — the disabled behavior of BR-4. Not a halt, not a new operator-facing failure class |
| **E-3** *(no HEAD instance)* | One decision of several fails to render; the rest are fine | Partial leg: that line is omitted, every other line renders, index and rule text are present (BR-7) |

### Size edges

| # | Case | Outcome |
|---|---|---|
| **E-6** | The in-scope set is **empty** — zero decisions, whether because none exist or because all were omitted | **No index block at all.** Not an empty block, not a header with no rows. Rule text does not stand alone without an index |
| **E-7** | `maxEntries` resolves to `0` | Treated as zero in-scope decisions — E-6's outcome. **Not an error**, not a fallback to the default, not a halt |
| **E-8** | A **single line by itself** exceeds `maxBytes` | That line is omitted whole. It is never truncated mid-line, and its omission does not abort the rest: the remaining lines render if they fit (BR-13). Where it was the only line, E-6 follows |

### Two non-cases, stated so they are not invented

**N-1 — there is no "index too large to send" failure.** Over-budget is always resolved by omission
(BR-13), so no dispatch is ever aborted, oversized, or retried on account of index size. E-8 is the
extreme, and it too resolves by omission.

**N-2 — there is no suppressed-finding state.** A reviewer who declines to file is not observable to
the driver: the finding is **absent**, not marked, not counted, not carried. No driver-side
"discounted finding" state exists for any gate to disagree about (REQ NG-4, BR-11).

## 6. Acceptance Tests

Who / Given / When / Then. Each test names the criterion and the rules it exercises. Tests asserting
against the standing corpus assert against a **frozen fixture copy** of it at Baseline v1.1's
`Verified at` commit, never the live repository — which grows, on this branch included, and would
otherwise drift the test on unrelated decisions (REQ-DECLEDGER-01, O-6).

### Index rendering

**AT-01 — the index renders the Baseline's enumeration, compared as whole lines.**
*Who:* the driver. *Given:* the flag resolves `true`, the frozen fixture corpus is in place, and the
set is within bounds. *When:* a review dispatch prompt is constructed. *Then:* the rendered line set
equals the expected set — **equality of rendered lines, not containment and not equality over ids
alone**. The expected value is the Baseline's enumeration transcribed by id: `M-1d` project-level,
`M-2e` per feature directory, under the directory-glob reading O-1 selects. Ids alone are blind to
`M-3c`'s twice-opened block, which is why the comparison ranges over id, statement and citation
together. *(-01; BR-1, BR-2, BR-3)*

**AT-02 — every rendered citation resolves at its own source.** *Who:* the driver. *Given:* as
AT-01. *When:* the index is rendered. *Then:* for each line, the cited record file exists and
carries the cited heading, and the statement field says what was decided rather than what was asked.
A line citing a record that does not exist, or a heading not in that file, fails. *(-01; BR-3)*

**AT-03 — the index is derived fresh, not carried forward.** *Who:* the driver. *Given:* the flag
resolves `true`; a decision record changes between two dispatches in the same round window. *When:*
the second dispatch is constructed. *Then:* the second index reflects the changed record. A snapshot
taken at the first dispatch and rendered again fails. *(-01; BR-9)*

### Disabled path

**AT-04 — the disabled dispatch is byte-identical to the committed baseline.** *Who:* the driver.
*Given:* `enabled` is `false`. *When:* any dispatch prompt is constructed. *Then:* the dispatch
stream is byte-identical to the committed fixture baseline — not a same-branch before/after
comparison. *(-02; BR-4)*

**AT-05 — all four not-enabled spellings collapse to one outcome.** *Who:* the driver. *Given:*
`enabled` in turn absent, `false`, wrong-typed, and the whole `decisionLedger` block missing.
*When:* a dispatch is constructed under each. *Then:* all four produce the AT-04 byte-identical
stream, and none reports an error to the operator. *(-02; BR-4, E-1)*

### Rule text

**AT-06 — the rule text carries both conjuncts and both exemplars.** *Who:* the driver. *Given:* the
flag resolves `true` and an index rendered. *When:* the dispatch is constructed. *Then:* rule text is
present adjacent to the index, requires High severity **and** evidence outside the decision's own
record, and carries both boundary exemplars of BR-6. Rule text carrying one conjunct, or no
exemplars, fails. *(-03; BR-5, BR-6)*

**AT-07 — the boundary exemplars are decidable, read against the cited record.** *Who:* a reader
applying the rule text to two constructed candidate findings — one matching the *in* exemplar, one
the *out* exemplar. *Given:* the rule text of AT-06 and the decisions' own records. *When:* each
candidate is classified. *Then:* they classify oppositely, and the classification reads the **cited
record**, not the index line alone — the line need not carry the decision's own citations. *(-03;
BR-6)*

**AT-12 — the reopening key and the driver's identity key are separate and both intact.** *Who:* the
driver and the reviewer. *Given:* the flag resolves `true`. *When:* a dispatch is constructed and a
round is accounted. *Then:* the rule text directs the reviewer to key repeats on the decision id,
**and** `DEC-LOOPECON-06`'s exact-match triple (severity, section anchor, normalised text) remains
the sole key the driver dedupes on. A change to the driver's key fails. *(-06; BR-6, BR-11)*

### Fail-open

**AT-08 — every source unavailable takes the total leg.** *Who:* the driver. *Given:* the flag
resolves `true`; a constructed corpus where every source is missing, unreadable or unparseable.
*When:* the dispatch is constructed. *Then:* no index and no rule text; the dispatch matches AT-04's
byte-identical stream; no halt and no operator-facing failure. *(-04; BR-7, E-2)*

**AT-09 — one failing decision omits one line.** *Who:* the driver. *Given:* the flag resolves
`true`; a constructed corpus where one decision of several fails to render. *When:* the dispatch is
constructed. *Then:* that line is absent, every other expected line is present, and the rule text is
present. A partial or malformed line for the failing decision fails. *(-04; BR-7, E-3)*

**AT-10 — an empty file takes the ordinary path, not the failure path.** *Who:* the driver.
*Given:* the flag resolves `true`; a source that exists, reads and parses but holds zero decision
records — including the case where it is the only source. *When:* the dispatch is constructed.
*Then:* it contributes nothing and neither fail-open leg is taken. Where it is the only source, E-6
follows (no index block) rather than E-2's total leg. *(-04; BR-8, E-4)*

### Configuration

**AT-11 — per-key fallback over the full enumeration.** *Who:* the config loader. *Given:* each of
C-3's three keys in turn, crossed with {wrong type, malformed, absent}, with the other two valid.
*When:* config is parsed for a dispatch. *Then:* only the affected key takes its C-5 default; the
other two keep operator values; every other config block is unaffected. Asserted as **set equality
over C-3's enumeration**, not containment, so a fourth key or a different spelling fails. *(-05;
BR-10, E-5)*

### Size bounds

**AT-13 — both bounds hold on the index text alone.** *Who:* the driver. *Given:* the flag resolves
`true`; an in-scope set exceeding `maxEntries` rows, and separately one exceeding `maxBytes` bytes.
*When:* the index is rendered. *Then:* the rendered index has at most `maxEntries` lines and at most
`maxBytes` bytes, measured over the index block alone; the dispatch is neither oversized nor
aborted. *(-07; BR-12, BR-13)*

**AT-14 — the empty and zero cases.** *Who:* the driver. *Given:* the flag resolves `true`; first a
zero-decision in-scope set, then `maxEntries` resolved to `0`. *When:* the index is rendered.
*Then:* in both cases **no index block at all** — not an empty block, not a header without rows —
and `maxEntries` of `0` is not an error, not a fallback to the default, and not a halt. *(-07; E-6,
E-7)*

**AT-15 — a single oversized line is omitted whole.** *Who:* the driver. *Given:* the flag resolves
`true`; one line alone exceeds `maxBytes`, among other lines that fit. *When:* the index is
rendered. *Then:* that line is absent in full, no truncated fragment of it appears, and the
remaining lines render. *(-07; BR-13, E-8)*

### Driver invariance

**AT-16 — replay under both flag settings agrees on every driver-side outcome.** *Who:* the driver.
*Given:* one recorded fixture of reviewer outputs for a round — verdict lines, counts, any
`FINDING:` lines — replayed twice, once with the flag `true` and once `false`. *When:* the driver
accounts for that round. *Then:* the convergence decision, the identity-triple dedupe and resulting
open-finding ledger, the `review.derivativeStop` flat/non-flat classification, the erratum items
minted under `DEC-ERRROUTE-01`, and the fail-closed read of a non-approving confirmation carrying no
parseable `FINDING:` line are all identical. The dispatch-construction leg differs in **exactly one
asserted way**: the `false` run's dispatch is byte-identical to AT-04's baseline and the `true`
run's carries the rendered index. *(-08; BR-14)*

**AT-17 — a filed reopening is scored as any other High finding.** *Who:* the driver. *Given:* the
flag resolves `true`; a reviewer files a High finding re-opening an indexed decision. *When:* the
round is accounted. *Then:* it is scored, deduped and routed as any other High finding — it mints
its erratum item and satisfies the confirmation-presence check. Any special-casing on account of the
index fails. *(-08; BR-11, BR-14, N-2)*

## 7. Open Questions
