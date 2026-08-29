---
feature: pdlc-decision-ledger
---

# FSPEC pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` **v1.8** |
| Downstream | TSPEC, DECISIONS, PLAN, PROPERTIES |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2** — cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.2 | 2026-08-28 |

**v1.2 erratum — the `maxBytes` default recital, and nothing else.** REQ moved to **v1.8**, which
retypes C-5's `maxEntries`/`maxBytes` as **non-negative** integers and replaces the `maxBytes`
default `8000` with the measured **`12500`**, derived from Baseline **v1.2**'s `M-7b`/`M-7c`. The
retyping needs no edit here: this spec never states either key's type, and E-7's `maxEntries` `0`
is now right-typed upstream rather than in conflict with it. What does cascade is §3.1's recital of
the defaults and §7's A-1, which carried the retired "`learningsInjection` analogy, not measured"
claim; both are corrected to REQ HEAD, and the Baseline pin moves to v1.2 so the cited ids resolve.
Nothing else moves.

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

**What this spec deliberately does not describe**, because O-1 owns all three as TSPEC material:
the **recognition rule** (what markup makes a heading a record, the id grammar, the key resolving an
id opened twice in a file, cross-file precedence); the rendered line's **concrete format** (the REQ
fixes its field content, not its byte shape); and **which lines are omitted** at a bound
(REQ-DECLEDGER-07 fixes the outcome, not the selection). This spec states the in-scope set's extent
only by citing `M-1d` / `M-2e` at Baseline v1.2's `Verified at` commit.

An FSPEC is warranted despite that routing because what remains is genuinely branching: a three-way
gate, a fail-open path with **two legs** that degrade differently, an empty source that must take
the ordinary path rather than a failure one, and two bounds whose interaction has a stated outcome.
§5 is the substance of this document.

**Precedent — two axes, two different shipped channels.** For **per-key independent config
fallback** and **fail-open-to-silence**, the model is `learningsInjection`, and only there: its
injected block is computed once per episode and reused across that episode's dispatches, and it is
added to **authoring** dispatches only — so it is the model for neither this spec's injection site
nor BR-9's per-dispatch freshness, which it would contradict. For the **injection site** — a
config-gated clause appended to a **review** dispatch prompt, contributing zero bytes when the flag
is off — the shipped model is `cascade.pinCheck`'s freeze clause and `review.derivativeStop`'s
finding-grammar clause. All three blocks are disclosed in `.claude/pdlc.config.example.json` (Q-3).
Every "as X does" below names a shipped behavior, not a code path.

## 2. Linked Requirements

Every behavior in this document traces to exactly one REQ acceptance criterion. The right-hand
column names where in this spec the criterion's behavior is specified; nothing in §3–§6 exists
without a row here.

| Requirement | What it fixes | Specified in |
|---|---|---|
| **REQ-DECLEDGER-01** | Index rendered when enabled, one line per in-scope decision, sourced fresh at dispatch-construction time | BR-1, BR-2, BR-3, BR-9; flow §3.2 steps 2–5; E-9, E-10, E-11; AT-01, AT-02, AT-03, AT-18 |
| **REQ-DECLEDGER-02** | Disabled path byte-identical to the pre-feature baseline | BR-4; flow §3.2 step 1; E-1; AT-04, AT-05 |
| **REQ-DECLEDGER-03** | Rule text requires High severity **and** new evidence to re-open | BR-5, BR-6; flow §3.2 step 6; AT-06, AT-07 |
| **REQ-DECLEDGER-04** | Index construction fails open, two legs, never silently stale | BR-7, BR-8; flow §3.3; E-2, E-3, E-4; AT-08, AT-09, AT-10 |
| **REQ-DECLEDGER-05** | Three config keys fail open independently | BR-10; flow §3.1; E-5; AT-11 |
| **REQ-DECLEDGER-06** | Decision id is the reviewer's reopening dedupe key; driver identity unchanged | BR-6, BR-11; AT-12 |
| **REQ-DECLEDGER-07** | Rendered index stays within both declared bounds | BR-12, BR-13; E-6, E-7, E-8, N-1; AT-13, AT-14, AT-15 |
| **REQ-DECLEDGER-08** | Driver-side scoring identical whether the flag is on or off | BR-11, BR-14, N-2; AT-16, AT-17 |

**User stories** (REQ §8, unchanged): US-01 — -01/-03/-06; US-02 — -04/-07; US-03 — -02/-05/-08.
**Non-goals carried through:** no driver-side reading of a decision id (NG-4), no change to
`MAX_REVIEW_ROUNDS` / `MAX_LIFETIME_ROUNDS` / `MAX_ERRATUM_FOLLOWUP_ROUNDS` (NG-5), no new record
file type or field (G-1). **G-4 has no row** by REQ design: a non-binding rationale note measured
retrospectively from committed `CROSS-REVIEW-*` artifacts, on which nothing here depends.

## 3. Behavioral Flow

All of it runs at **dispatch-construction time**, once per review dispatch. Nothing here runs at
round start, at phase entry, or on a schedule, and nothing is carried forward from an earlier
dispatch in the round window (REQ-DECLEDGER-01, mirroring the shipped `REQ-LOOPECON-01b`
recompute-at-dispatch contract).

### 3.1 Reading configuration

Config is **resolved** for the dispatch from the operator's `.claude/pdlc.config.json`, read once
per run and threaded, as `learningsInjection` does; only the record corpus is re-read per dispatch
(BR-9). The `decisionLedger` block holds exactly the three keys REQ C-3 enumerates.

**Two failure words, defined once and used with these meanings throughout.** A key is
**wrong-typed** when the file parses and that key's value is not of the key's type. The file or the
`decisionLedger` block is **malformed** when it does not parse. Wrong-typedness is per key;
malformation is not — it is a property of the block, and resolves all three keys at once. So the
per-key condition space is exactly {valid, wrong-typed, absent}, with malformation the one
block-level condition. Each key is resolved independently:

| Condition | Resolution |
|---|---|
| A key present, right type, valid | Use the operator's value |
| A key present and wrong-typed | That key alone falls back to its C-5 default |
| A key absent | That key falls back to its C-5 default |
| The whole `decisionLedger` block absent or malformed | All three keys take their C-5 defaults, which means `enabled` is `false` |

Resolution of one key never affects another key, another config block, or the run (BR-10). Defaults
are `enabled` `false`, `maxEntries` `70`, `maxBytes` `8000` (REQ C-5).

### 3.2 Constructing a review dispatch — the enabled path

1. **Gate.** If resolved `enabled` is not `true`, stop. The dispatch is constructed exactly as it
   is today: no index block, no rule text, no marker, no whitespace (BR-4). Steps 2–6 do not run.
2. **Determine the in-scope set.** The set is the project's closed decisions plus those of the
   feature whose document is under review, with the **individual decision** as the unit, not the
   file (REQ §2 G-1). It is derivable, not a per-document relevance judgement: nothing about the
   document under review beyond its feature narrows the set. The set is **total**: a feature that
records no decision of its own, and a document with no feature directory at all, both resolve to the
project-level set alone — never to a failure, and never to an empty-set error (Q-2).
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

Entered from step 3 when a source is missing, unreadable, or fails to parse. Which leg is taken is
decided by **what survives**, never by what kind of thing failed, and on that reading the two legs
partition the failure space with no case left over:

| Leg | Condition | Behavior |
|---|---|---|
| **Total** | **Nothing survives** — the surviving subset of the in-scope set is empty, whether because every source was unavailable or because every in-scope decision failed to render | Fall back to the disabled behavior of REQ-DECLEDGER-02 — no index block, no rule text. The dispatch is as if the flag were off |
| **Partial** | A **proper, non-empty subset** of the in-scope set fails to render, for any reason — one decision, several decisions, or a whole source unavailable while other sources survive | Omit the failed lines; every surviving line renders; the index and rule text are present |

Whether one decision failed or a whole source did changes nothing but the size of the surviving
subset, so no third outcome exists to be invented, and Total is simply the degenerate case where
that subset is empty.

Neither leg is a halt, and neither introduces an operator-facing failure class. Both degrade as
`learningsInjection`'s fail-open path does. The direction is deliberate and safe in one direction
only: a decision **absent** from the index is one a reviewer may freely challenge, whereas a
decision rendered **wrongly** would suppress a legitimate challenge — which is why a line that
cannot be rendered faithfully is dropped rather than rendered partially (BR-7).

**A third case is not a leg of this path at all.** A source file that exists, reads, and parses but
holds no decision record yields an **ordinary empty result**: it contributes no line and is not
counted as a failure (`M-4e`; BR-8, E-4). Two standing-corpus files are in exactly this position
(`M-4a`, `M-4b`), so this is the common case and not a curiosity.

Because the legs above are stated over the surviving subset, an empty source and a failed source
contribute the same zero lines, so this classification has **no dispatch-visible consequence** in
either direction. BR-8 is a construction rule, not a byte-level one — it forbids treating emptiness
as an error or as a cause of the total leg — and the observable distinguishing the two is
driver-internal, owed by TSPEC (O-7). AT-10 asserts the visible part and cites O-7 for the rest.

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
appears in a review dispatch prompt exactly when three conjuncts hold: resolved
`decisionLedger.enabled` is `true`, at least one in-scope decision survives §3.3, **and** at least
one rendered line survives the bounds of §3.2 step 5. In every other case no index block exists —
which is why E-6 and E-7 are instances of this rule rather than exceptions to it. *(-01, -02,
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
parses but holds no decision record contributes no line and is not counted as a failure, even when
it is the only source read (`M-4e`). Because §3.3's legs are stated over the surviving subset, this
rule constrains **construction, not dispatch bytes**: it forbids reporting emptiness as an error and
forbids an empty-only corpus being recorded as a cause of the total leg. Its discriminating
observable is driver-internal and owed by TSPEC (O-7). *(-04)*

### Configuration

**BR-10 — per-key independent fallback.** One wrong-typed, malformed or absent key falls back to its
own C-5 default; the block's other keys and every other config block are unaffected. The key set is
exactly C-3's three, so this is set equality over that enumeration crossed with §3.1's per-key
condition space {valid, wrong-typed, absent} — not containment — with malformation of the whole
block the one further, block-level case. Follows the shipped `learningsInjection` /
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

## 5. Edge Cases and Error Scenarios

Rendering is **total**: every case below has one stated outcome, and none is left to an engineer's
discretion. Cases marked *(no HEAD instance)* have no witness in the standing corpus and are owed a
constructed fixture — O-5/O-6, a coverage obligation on PROPERTIES, not a defect here.

### Configuration edges

| # | Case | Outcome |
|---|---|---|
| **E-1** | `enabled` absent, `false`, wrong-typed, or the whole block missing | Disabled behavior, BR-4. All four spellings of "not enabled" collapse to one outcome; none is an error and none is reported to the operator |
| **E-5** | One key malformed, the other two valid — for each of the three keys, and for each of {wrong type, malformed, absent} | Only that key takes its default; the other two keep operator values; other blocks unaffected (BR-10). With `enabled` the malformed key, the fallback is `false`, so the run is a disabled run |

### Corpus edges

| # | Case | Outcome |
|---|---|---|
| **E-4** | A source file exists, reads and parses, and holds **zero** decision records | Ordinary empty result. Contributes no line and is not counted as a failure (BR-8). Two standing-corpus files are in this position — `M-4a` (decisions carried as bullets with no id at all) and `M-4b` (headings whose ids carry no namespace segment). The dispatch bytes are the same as if the file had failed to read, so the classification is asserted at a driver-internal observable (O-7), not in the prompt |
| **E-9** | A file mixes decision records with headings that contain a `DEC-` id but record nothing — question headings and back-references | The non-records contribute no line; the file's real records render normally. `M-4d` is the sole HEAD instance, carrying 4 records alongside 8 such headings. Which headings qualify is the recognition rule's (O-1); that a mixed file still renders its real records is this spec's |
| **E-10** | One id is opened twice in one file, the first opening stating the question and the second stating the outcome | Exactly one line renders, and its statement says what was **decided** (BR-2, BR-3). `M-3c` is the sole HEAD witness |
| **E-11** *(no HEAD instance)* | The same id is recorded in both a project-level and a feature-level file | One line renders. `M-5a` records zero such ids at HEAD, so no expected value can be transcribed; `M-5c` names the intent — the project-level record wins, a decision promoted to project level rendering in its promoted form — and the rule itself is TSPEC's (O-1). Owed a synthetic two-file fixture (O-5), over which AT-18 asserts the cardinality conjunct — exactly one line, never two, never zero — this spec does own |

### Failure edges

| # | Case | Outcome |
|---|---|---|
| **E-2** *(no HEAD instance)* | Nothing survives — every source is missing, unreadable or unparseable, or every in-scope decision fails to render | Total leg: no index, no rule text — the disabled behavior of BR-4. Not a halt, not a new operator-facing failure class |
| **E-3** *(no HEAD instance)* | A proper, non-empty subset fails to render — one decision, several decisions, or **one whole source unavailable while other sources survive** | Partial leg: those lines are omitted, every surviving line renders, index and rule text are present (BR-7). The three sub-cases have one outcome; nothing turns on which occurred |

### Size edges

| # | Case | Outcome |
|---|---|---|
| **E-6** | The in-scope set is **empty** — zero decisions, whether because none exist or because all were omitted | **No index block at all.** Not an empty block, not a header with no rows, and rule text does not stand alone without an index. The dispatch is byte-identical to BR-4's disabled dispatch, which is the positive form AT-14 asserts |
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

Who / Given / When / Then. Each test names its criterion and rules. Tests over the standing corpus
assert against a **frozen fixture copy** at Baseline v1.1's `Verified at` commit, never the live
repository — which grows, on this branch included (REQ-DECLEDGER-01, O-6).

### Index rendering

**AT-01 — the index renders the Baseline's enumeration for the reviewed feature, compared as whole
lines.** *Who:* the driver. *Given:* the flag resolves `true` and the frozen fixture corpus is in
place. Two dispatches are constructed, differing only in the feature whose document is under review
(§3.2 step 2): **(a)** `pdlc-advisory-wave-gate`, **(b)** `pdlc-engineering-loop`. *When:* each
review dispatch prompt is constructed. *Then:* the rendered line set equals the expected set —
**equality of rendered lines, not containment and not equality over ids alone**.

The expected set is `M-1d`'s 41 project-level ids **union the single `M-2e` row for that dispatch's
feature** — 4 for (a), 7 for (b) — so 45 and 48 lines, both inside `maxEntries` `70`. No other
feature's `M-2e` row is in scope for either dispatch; a build rendering all 100 feature-level ids
fails.

Those two features are chosen for what each pins: (a)'s corpus holds `M-4d`'s mixed file, whose **8**
non-record headings must contribute **no** line while its 4 real records render (E-9); (b)'s holds
`M-3c`'s twice-opened block, where each of `DEC-LOOP-01`…`06` renders exactly one line whose
statement is the **second**, deciding opening (E-10, BR-2). Ids alone are blind to both, which is why
the comparison ranges over id, statement and citation together.

Expected statements and citations are transcribed from the frozen fixture's own heading text and
record location — data — never captured from the renderer's output, which would derive the
expectation from the code under test and could not fail for a wrong statement. `M-3c`'s verbatim
second-opening heading is the pinned discriminating case. *(-01; BR-1, BR-2, BR-3; E-9, E-10)*

**AT-02 — every rendered citation resolves at its own source.** *Who:* the driver. *Given:* as
AT-01. *When:* the index is rendered. *Then:* for each line, the cited record file exists and
carries the cited heading, and the statement field says what was decided rather than what was asked.
A line citing a record that does not exist, or a heading not in that file, fails. *(-01; BR-3)*

**AT-03 — the index is derived fresh, not carried forward.** *Who:* the driver. *Given:* the flag
resolves `true`; a record **in the frozen fixture copy** changes between two dispatch constructions
in the same round window — the live repository is never mutated. *When:* the second dispatch is
constructed. *Then:* the second index reflects the changed record. A snapshot
taken at the first dispatch and rendered again fails. *(-01; BR-9)*

**AT-18 — an id recorded in two files renders exactly one line.** *Who:* the driver. *Given:* the
flag resolves `true`; O-5's synthetic corpus recording one id in both a project-level and a
feature-level file, both in scope. *When:* the index is rendered. *Then:* **exactly one** line
carries that id — never two, never zero — and every other line is unchanged from the same corpus
without the duplicate. Which of the two records supplies the statement is TSPEC's (O-1, `M-5c`) and
is deliberately not asserted here; the cardinality is this spec's (BR-2, E-11). *(-01; BR-2, E-11)*

### Disabled path

**AT-04 — the disabled dispatch is byte-identical to the committed baseline.** *Who:* the driver.
*Given:* `enabled` is `false`. *When:* any dispatch prompt is constructed. *Then:* the dispatch
stream is byte-identical to the committed fixture baseline — not a same-branch before/after
comparison. *(-02; BR-4)*

**AT-05 — all four not-enabled spellings collapse to one outcome.** *Who:* the driver. *Given:*
`enabled` in turn absent, `false`, and wrong-typed (§3.1), and the whole `decisionLedger` block
absent or malformed.
*When:* a dispatch is constructed under each. *Then:* all four produce the AT-04 byte-identical
stream, and none reports an error to the operator. *(-02; BR-4, E-1)*

### Rule text

**AT-06 — the rule text carries both conjuncts and both exemplars.** *Who:* the driver. *Given:* the
flag resolves `true` and an index rendered. *When:* the dispatch is constructed. *Then:* rule text is
present adjacent to the index, requires High severity **and** evidence outside the decision's own
record, and carries both boundary exemplars of BR-6. Rule text carrying one conjunct, or no
exemplars, fails. *(-03; BR-5, BR-6)*

**AT-07 — the exemplars are stated so a reader can decide, and that is a property of the text.**
*Who:* the driver — what is asserted is a property of the rule text it emits, not of anyone's
classification, so no human is in the oracle. *Given:* the flag resolves `true`. *When:* the
dispatch is constructed. *Then:* the rule text names **both** exemplars of BR-6, each labelled with
the side it falls on (*in* — a shipped behavior that changed after the decision was recorded, cited
at the changed source; *out* — a source the decision already cites, re-cited with no behavioral
change), and directs the reviewer to decide against the **cited record** rather than the index line,
which need not carry the decision's own citations. Text carrying one exemplar, or both unlabelled,
fails. *(-03; BR-6)*

**AT-12 — the reopening key and the driver's identity key are separate and both intact.** *Who:* the
driver and the reviewer. *Given:* the flag resolves `true`. *When:* a dispatch is constructed and a
round is accounted. *Then:* the rule text directs the reviewer to key repeats on the decision id,
**and** `DEC-LOOPECON-06`'s exact-match triple (severity, section anchor, normalised text) remains
the sole key the driver dedupes on. A change to the driver's key fails. *(-06; BR-6, BR-11)*

### Fail-open

**AT-08 — nothing surviving takes the total leg.** *Who:* the driver. *Given:* the flag resolves
`true`; a constructed corpus where nothing survives — first every source missing, unreadable or
unparseable, then a readable corpus in which every in-scope decision fails to render.
*When:* the dispatch is constructed. *Then:* no index and no rule text; the dispatch matches AT-04's
byte-identical stream; no halt and no operator-facing failure. *(-04; BR-7, E-2)*

**AT-09 — a surviving proper subset takes the partial leg, whatever failed.** *Who:* the driver.
*Given:* the flag resolves `true`; two constructed corpora — one where a single decision of several
fails to render, one where a **whole source** is unavailable while other sources survive. *When:*
the dispatch is constructed. *Then:* in both, the failed lines are absent, every surviving expected
line is present, and the rule text is present — one outcome for both sub-cases, not two. A partial
or malformed line for a failing decision fails. *(-04; BR-7, E-3)*

**AT-10 — an empty file contributes nothing and costs nothing.** *Who:* the driver. *Given:* the
flag resolves `true`; a corpus holding one source that exists, reads and parses but holds zero
decision records, alongside surviving sources. *When:* the dispatch is constructed. *Then:* the
rendered line set equals AT-01's expected set for the surviving sources exactly — the empty file
adds no line, removes none, and produces no operator-facing report. Where the empty file is the
**only** source, the dispatch is E-6's, which is byte-identical to E-2's total leg: the two are
**not** discriminable in the prompt, so the classification conjunct — that this is an ordinary empty
result and not a counted failure (BR-8) — is asserted at the driver-internal observable TSPEC owes
under O-7, and this test asserts the dispatch bytes only. *(-04; BR-8, E-4, O-7)*

### Configuration

**AT-11 — per-key fallback over the full enumeration.** *Who:* the config loader. *Given:* each of
C-3's three keys in turn, crossed with §3.1's per-key condition space {valid, wrong-typed, absent},
with the other two valid, plus the one block-level malformation case.
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
*Then:* in both cases the dispatch stream is **byte-identical to AT-04's committed baseline** — the
positive assertion, which pins in one comparison that there is no index block (not an empty block,
not a header without rows), **no rule text standing alone above a missing index** (E-6), and no
added or removed whitespace. A build emitting the rule text without an index fails. `maxEntries` of
`0` is additionally not an error, not a fallback to the default, and not a halt. *(-07; E-6, E-7,
BR-1, BR-4)*

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
run's carries the rendered index.

Invariance alone passes a driver broken identically in both runs, so at least one of the five is
additionally **anchored to a value transcribed from the fixture** — the open-finding ledger, which
the recorded reviewer outputs already determine — and the test fails if that anchor moves, not only
if the runs diverge. The five are asserted individually; the list is **not** claimed exhaustive of
driver-side accounting, so a sixth mechanism is covered by extending it, not by a set equality. The
recorded fixture is a constructed-fixture obligation of the O-6 class. *(-08; BR-14)*

**AT-17 — a filed reopening is scored as any other High finding.** *Who:* the driver. *Given:* the
flag resolves `true`; a reviewer files a High finding re-opening an indexed decision. *When:* the
round is accounted. *Then:* it is scored, deduped and routed as any other High finding — it mints
its erratum item and satisfies the confirmation-presence check. Any special-casing on account of the
index fails. *(-08; BR-11, BR-14, N-2)*

## 7. Open Questions

Nothing here blocks TSPEC authoring. O-1…O-6 are the REQ's, carried unchanged; O-7, O-8 and Q-1…Q-3
are this spec's own, each naming its owner.

### Carried forward from REQ §7 — routed, not open to this spec

| Id | Owner | Substance |
|---|---|---|
| **O-1** | se-author (TSPEC) | The **recognition rule** in full — carrier markup, id grammar, the key resolving an id recorded more than once in a file, cross-file precedence — and which lines are omitted when a bound is exceeded. A TSPEC choice rendering a set differing from `M-1d` / `M-2e` under the directory-glob reading, at the Baseline's commit, fails REQ-DECLEDGER-01 (AT-01); within that constraint the rule is TSPEC's to design |
| **O-2** | se-author (TSPEC) | Whether wiring the index and rule text into reviewer-facing prompt text needs a `SKILL.md` edit, routing through the consolidation contract's `CONSOLIDATION-PROPOSAL` review, or can go through dispatch construction as learnings injection does. Either path stays config-gated (REQ C-1/C-2, BR-4) |
| **O-3** | se-author (TSPEC) | How a decision id is minted and kept unique across `docs/_decisions/*` and per-feature records, which are independent namespaces today |
| **O-4** | se-author (TSPEC) | The identity of C-2's committed baseline, and the pinning that stops a re-capture silently satisfying AT-04 |
| **O-5** | te-author (PROPERTIES) | Cross-file precedence has no HEAD instance (`M-5a`), so E-11 is owed a **synthetic** two-file fixture recording one id in both a project-level and a feature-level file |
| **O-6** | te-author (PROPERTIES) | E-2, E-3 and E-4 likewise have no HEAD instance and are owed constructed fixtures, as are the frozen corpus copy AT-01 asserts against and AT-16's recorded round of reviewer outputs |

### Raised by this spec — obligations

| Id | Owner | Substance |
|---|---|---|
| **O-7** | se-author (TSPEC) | BR-8's empty-versus-failed classification has **no dispatch-visible consequence** (§3.3), so TSPEC must expose a driver-internal observable — a count or record of failed sources, distinct from sources that read empty — for AT-10's classification conjunct to be assertable at all. Without it BR-8 is unfalsifiable |
| **O-8** | te-author (PROPERTIES) | BR-12/BR-13's bounds invariant is universally quantified — for **any** in-scope set and **any** resolved bounds, at most `maxEntries` lines, at most `maxBytes` bytes, no partial line — and AT-13 exercises exactly two examples. It is owed as a **property**, parameterised over set size × line sizes × both bounds, not as further examples |

### Raised by this spec

**Q-1 — the rendered line's concrete format is TSPEC's.** *(Owner: se-author.)* The REQ fixes the
line's field **content** (BR-3); field order, separators and byte shape are not stated here, because
the renderer laying out a line is the one O-1 already owns for omission order. Flagged rather than
silently omitted: AT-01 compares whole rendered lines, so TSPEC must fix the format before
PROPERTIES can transcribe an expected value — the values themselves come from the fixture, not from
the renderer (AT-01).

**Q-2 — a document whose feature contributes nothing, or that has no feature directory at all.**
*(Owner: se-author, TSPEC — mechanism only; the outcome is decided in §3.2 step 2.)* Both resolve to
the project-level set alone, never to a failure: this is the same answer for both, and it is what
makes the in-scope set total. Neither has a HEAD instance today. Recorded so TSPEC states the
resolution rather than letting it fall out of an implementation.

**Q-3 — settled, not open: the block is disclosed, and its disclosure test is in scope.** *(Owner:
se-author, TSPEC — to record, not to decide.)* Every gated block shipped to date is disclosed in
`.claude/pdlc.config.example.json` with a matching engine-side disclosure test, three for three
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`), and REQ NG-6 forbids engine
**runtime** changes while explicitly preserving that precedent. There is no reading under which a
gated block ships undisclosed, so the antecedent the REQ left unstated is decided here: the
`decisionLedger` block is disclosed and the disclosure test is in PLAN's task count.

### Assumptions

Carried from REQ §7 unchanged, operator-vetoable before TSPEC authoring: **A-1** `maxEntries` (70)
is measured against the Baseline (`M-6b`/`M-6c`), `maxBytes` (8000) is a `learningsInjection`
analogy and is not measured; **A-2** rollout matches `pdlc-loop-economics` — config-gated, default
off; **A-3** reviewer-side enforcement is the intended reading of the proposal's R3-2, vetoable
before TSPEC since a mechanical gate would change the feature.

This spec adds no new assumption of its own.
