# pdlc-rcv-catalogue — shared vocabulary, closed string catalogue and report schema

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only input to the `pdlc-rcv-*` REQ family; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Companion | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. |
| Cited by | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (REQ-RCV-01), `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02), `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04), `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Version | 1.0 · 2026-08-01 |

**Why this file exists.** Four REQs in one family share one vocabulary, one closed catalogue of
boundary-crossing strings, and one run-report row schema. Restated per document they drift into
four meanings; the superseded parent
(`docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md`) is the record of what that costs.
Written once here, each REQ cites the id and states only what it **owns** — which criterion emits
the string and which reads it.

**Ids are never renumbered.** `S-*` ids, `M-*` fact ids and the vocabulary terms below are stable
across the family; an existing cross-reference resolves. A REQ may not add an `S-*` id without
amending §2 of this file, and FSPEC may not add one at all.

## 1. Vocabulary

Used with exactly these meanings throughout the family.

| Term | Definition |
|---|---|
| **blocking count** of a round | The sum of `high` + `medium`, over every reviewer whose cross-review file exists at that round, **read from the file** by `extractFileVerdict` → `parseVerdict` (M-2e), not from the agent response. A round for which any dispatched role's count cannot be read from its file has **no blocking count** — see *unavailable*. |
| **panel shape** of a round | The *set of reviewer role slugs whose cross-review files exist on the branch at that round*. Exactly **two** sets are canonical: `{software-engineer, test-engineer}` (dual) and `{verifier}` (single verifier). Panel shape is read from the **role slugs alone** — every round writes them, including a round on which every reviewer filed *Needs revision*, because the slug is part of the filename the path derivation composes (M-3b). It is **not** the set of roles dispatched, and it does **not** turn on the `REVIEW-MODE:` marker. Two rounds have equal panel shape iff their slug sets are equal **and** neither is *crashed*. |
| **crashed** round | A round whose on-disk role-slug set is **not** one of the two canonical sets — a strict subset of one (one file under `software-engineer` or `test-engineer` and no second panel file), the empty set, or any other set (e.g. `{verifier, test-engineer}`). Its panel shape is **undetermined**; it is never comparable and never a baseline, and it never yields an approval (M-3d). The predicate is decided by the directory listing and nothing else, so it is total, computable on every round, and independent of any round's verdict. |
| **current window** | The rounds admitted by `pdlc-rcv-budget-stop` AC-1 since the last **granted** window: `{W … W+2}`, where `W` is the window origin AC-1.5(4) resolves (1 when no reset has been granted). Round `W` is the **first round of the window** and is treated exactly as round 1 is: full panel, not compared, not tested for zero-delta, growth not measured. A round whose predecessor is in an earlier window has no comparable predecessor, exactly as round 1 has none. |
| **reset region** | The section headed exactly `## Reset Region` (S-12) in `POSTMORTEM-{phase}-{feature}.md`, from that heading to the next top-level heading or end of file, **outside any fenced block** — the scoping rule `scanLines` already applies (M-7d). It is the only place `HALT-REASON:` (S-15), `WINDOW-START:` (S-13) and `WINDOW-RESUMED:` (S-14) are read from, so a line quoted in prose or in a Recommendation counts for nothing. Every line in it is **appended at the end** by the event that writes it, so document order is event order. It is machine-written and machine-maintained — except for the sanctioned operator repair `pdlc-rcv-budget-stop` AC-1.5(4) describes **per reason**, taken only when the run report emits S-16. The operator's `RESOLVED:` marker is never **counted**, wherever in the file it sits. |
| **zero-delta** round | A round `N > W` whose reviewed document is byte-and-hash identical to the document reviewed at round N−1 — `bytes(t0 of round N) = DOC-BYTES(N−1)` **and** `sha256(t0 of round N) = DOC-SHA256(N−1)`. It is not a small revision; it is *no revision*, and it is a halt (`pdlc-rcv-fixed-point-stop` AC-2.8), not a consumed round. |
| **unavailable** | A quantity no reader can obtain from the branch — distinct from **malformed**, which is a quantity that was read and could not be parsed, **or that the structure carrying it says should be there and is not**. *Unavailable* is the case where the **carrier** is absent: no file, or no `## Verdict` heading. Both break the fixed-point comparison chain, and the run report distinguishes them (`pdlc-rcv-fixed-point-stop` AC-2.3, AC-2.7). |
| **phase refusal** | A decision **not to enter** the phase, taken before any round of it opens. No halt is recorded, so the halt accounting is untouched (`H` and `A` both unchanged) and no post-mortem byte is written; the phase does not run and the invocation terminates on the same path step G takes for an unresolved post-mortem (M-7a), which records the ❌ phase row and reaches the halt catch that rewrites the feature's `docs/_queue/QUEUE.md` row to `halted` (M-7b). It is **not** the *approval refusal* below, which is the opposite shape. The two are always named in full, because a reader who applies one where the other is meant gets the wrong machine. |
| **approval refusal** | The round has already run, the loop records the refusal, the round remains owed an authoring pass, and **the window proceeds**. Every refusal `pdlc-rcv-panel-topology` AC-3.2 and AC-3.5 state is of this kind, never a phase refusal. |
| **round growth** *into* round N | `bytes(t0 of round N) − DOC-BYTES(N−1)`, defined by `pdlc-rcv-panel-topology` AC-4.1. The **earlier** endpoint is durable and in the past; the **later** endpoint is read at round N's open, in the single round-open read shared with `pdlc-rcv-fixed-point-stop` AC-2.8. |

## 2. Closed catalogue of boundary-crossing strings

DC-01 requires every string that crosses a component boundary to be a **closed catalogue on the
emitting side and a total function on the receiving side, before FSPEC authoring**. The family
owns the seventeen ids below and **no others**. The `Owner` column names the REQ whose acceptance
criteria fix the string's grammar and its receive side; a REQ that only *reads* an id says so in
its own §4 and may not change the grammar.

| id | Owner | Exact string | Emitter | Receiver | Receiver is total because |
|---|---|---|---|---|---|
| **S-1** | panel-topology | `REVIEW-MODE: verification` — one line, that exact casing and spacing, in the anchor block | **`appendRoundAnchors`**, on every verifier round (AC-3.5(a)) | `tier1ApprovalRecord` (M-3d) — the **approval** path only. The panel-shape read does not consult it | AC-3.5(e) states all **six** rows of its table: absent on a lone file, one exact match, one line with any other value, two or more lines in one file, a marker on more than one file of the same round, and a marker on a dual round's file beside an unmarked second file |
| **S-2** | panel-topology | `DOC-BYTES: {n}` — one line, `{n}` a decimal integer ≥ 0, no separators | **`appendRoundAnchors`**, every round (AC-4.1) | AC-4.1's growth computation; `pdlc-rcv-fixed-point-stop` AC-2.8's zero-delta test | AC-4.1 states **four inputs producing three reasons**: no anchor (`no-anchor`); an unparseable value and two-or-more unequal lines (both `unreadable-anchor`); a non-document target (`non-document-target`) ⇒ *unmeasurable* ⇒ AC-4.5. Two or more **equal** lines is an idempotent re-write (M-4b's rule) and reads as one value; **negative growth is measurable and normal** |
| **S-3** | fixed-point-stop | Halt reason `fixed-point: round {N} blocking {b(N)} >= round {N-1} blocking {b(N-1)}` | AC-2.1's halt path | the post-mortem prompt and the run report (AC-2.2) | a single format string with two integer and two round-index slots; nothing else is emitted on this path |
| **S-4** | budget-stop | Halt reason `budget-exhausted: rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` — **rendered**, three integer slots, no constant *name* in the user-facing string: e.g. `rounds 1..3 of 3`, or `rounds 4..6 of 3` after an AC-1.5(4) reset moved the window origin | the existing budget halt (AC-1.4) | the same two readers | same. A clause that hard-codes one window's render is a defect |
| **S-5** | fixed-point-stop | Report notice `not-comparable: {reason}` where `{reason}` ∈ `{malformed-count, unavailable-count, unequal-panel-shape, crashed-round}` — a closed four-member enum | AC-2.3, AC-2.4, AC-2.7 | the run report row of §3 | the enum is closed here; a reason outside it is a defect, not a fallback |
| **S-6** | panel-topology | Report notice `growth-unmeasurable: {reason}`, `{reason}` ∈ `{no-anchor, unreadable-anchor, non-document-target}` | AC-4.1's growth measurement | the run report row of §3 | the enum is closed here and its three reasons are the three AC-4.1 derives from four inputs |
| **S-7** | finding-quality | Section heading `## Measurement Required`, exactly | the three review SKILLs, and the verifier (AC-5.2) | AC-5.4's extraction | AC-5.5 states every input: absent ⇒ contributes nothing, never an error; present but empty ⇒ contributes nothing; present with a body the loop cannot parse into items ⇒ the body is carried **verbatim** into the report under its round and role, never dropped and never an error; two or more such sections in one file ⇒ their bodies are concatenated in document order. There is no input on which extraction fails, because nothing downstream of it is gated |
| **S-8** | panel-topology | Section heading `## Disposition`, exactly | the verifier (AC-3.2) | AC-3.2(1)'s completeness check and the run report | AC-3.2 states all five cases: absent, unmatched prior id, unknown id, out-of-set disposition value, and the section on a dual round |
| **S-9** | panel-topology | Findings-table field `New-mechanism: {section or clause reference}` on every blocking finding a verifier raises | the verifier (AC-3.2(2)) | **the verifier itself**, when it composes its own count trailer; and a human or the citation checker reading the file. **Not** the loop: no component deducts anything from the trailer | AC-3.2(2) states the rule as **directive to the emitter**: a verifier does not count a finding it cannot bind to new mechanism, so the trailer it writes already excludes it. The receive side is therefore the ordinary trailer receive side (`pdlc-rcv-fixed-point-stop` AC-2.7(b)) and needs no new grammar. R-5 records that this half is unenforced |
| **S-10** | panel-topology | `DOC-SHA256: {64 lower-case hex}` — one line, same anchor block; the value is `sha256Hex`'s digest, i.e. over `canonicaliseForDigest`'s output, rendered **bare** (no `sha256:` prefix, unlike `APPROVAL-HASH:`) | **`appendRoundAnchors`**, every round (AC-4.1) | `pdlc-rcv-fixed-point-stop` AC-2.8 | that AC states all four: absent, unparseable, two or more unequal lines, and equal to the previous round's value. The first three ⇒ the test is **not evaluated** and the round proceeds (fail-open); the fourth ⇒ halt with S-11 |
| **S-11** | fixed-point-stop | Halt reason `no-revision: round {N} document identical to round {N-1}` | AC-2.8's halt path | the post-mortem prompt and the run report (AC-2.2) | a single format string with two round-index slots; nothing else is emitted on this path |
| **S-12** | budget-stop | Section heading `## Reset Region`, exactly | every halt path (AC-1.4) — the first halt of a phase **creates** it, every later halt preserves it | AC-1.5(4)'s window-origin and counts resolution; a human reading the post-mortem | The heading is read outside fenced blocks. An absent heading, or a present one containing no `HALT-REASON:` line, is read as an empty region: `H = A = 0`, `W = 1`, no reset in effect and no clearance outstanding. Every other input is a set of S-13/S-14/S-15 lines, which AC-1.5(4)'s ordered algorithm is total over |
| **S-13** | budget-stop | `WINDOW-START: {N}` — one line, `{N}` a decimal integer ≥ 1, **appended to the end** of the reset region | the loop, on the entry that grants a convergence-halt clearance (AC-1.5(4)) | AC-1.5(4)'s window-origin resolution; the `A` count | AC-1.5(4)'s ordered algorithm is total over every region: any line that fails validation, or counts with `H − A ∉ {0, 1}`, ⇒ `W = 1`, fail-closed, no clearance consumed; otherwise `W` is the greatest value. The append is normative, because step 2's validation reads *"every value before it"* |
| **S-14** | budget-stop | `WINDOW-RESUMED: {W}` — one line, `{W}` a decimal integer ≥ 1 equal to the origin then in effect, **appended to the end** of the reset region | the loop, on the entry that clears an S-11 halt (AC-1.5(5)) | the `A` count; AC-1.5(4)'s validation | same algorithm and same append rule: a value that is not a decimal integer ≥ 1, or that does not equal the resolved `W`, ⇒ `W` = 1, fail-closed. It never moves the origin — it only answers a clearance, which is exactly what distinguishes resuming from resetting |
| **S-15** | budget-stop | `HALT-REASON: {value}` — one line per halt, appended at the **end** of the reset region. `{value}` is the **`; `-joined render, in §3's precedence order, of every halt reason that halt raised** — `no-revision: …` alone, or `fixed-point: …`, or `budget-exhausted: …`, or `fixed-point: …; budget-exhausted: …` | every halt path (AC-1.4 clause 1, AC-1.5(5)) | AC-1.5(5)'s clearance decision; the `H` count; a human | AC-1.5(5) states all three reachable cases of the **last** such line: begins `no-revision:`; begins `fixed-point:` or `budget-exhausted:`; unparseable or anything else — the last treated as a convergence halt, fail-closed. *Absent* is not a case at that gate (it requires `H ≥ 1`); the empty region is S-12's case |
| **S-16** | budget-stop | Report notice `reset-region-corrupt: {reason} (H={h}, A={a}) {path}` where `{reason}` ∈ `{invalid-window-start, invalid-window-resumed, counts-mismatch}` — a closed three-member enum — `{h}` and `{a}` the two counts as decimal integers, `{path}` the post-mortem's repo-root-relative path. On the two value reasons the offending **line** — the whole line as it appears in the region, not the value alone — follows the path in square brackets: `reset-region-corrupt: invalid-window-start (H=2, A=1) docs/f/POSTMORTEM-R-f.md [WINDOW-START: 99]`; on `counts-mismatch` there is no such suffix, because the evidence is the pair. **Exactly one S-16 notice is emitted per entry**, whatever the region's fault count: the reported `{reason}` is the **first** failing line in document order, and `counts-mismatch` only when every line passes step 2 | AC-1.5(4) step 4 | the run report row of §3, in the `notice` column | the enum is closed here; a reason outside it is a defect, not a fallback. The render is fixed **here and only here**, character for character, because §3's bar is that a test author derives the exact cell from these documents alone. The notice is the operator's only signal that the region needs the sanctioned repair, so a corrupt region is diagnosable rather than a silent permanent halt |
| **S-17** | panel-topology | Dispatch input `REVIEW-SCOPE-ROUNDS: {W}..{N−1}` — one line in the verifier's dispatch prompt, two decimal integers ≥ 1 separated by the two-character literal `..`, `{W}` ≤ `{N−1}`, naming the **inclusive** round range whose findings AC-3.2(1) puts in scope. The separator is `..` because S-4 already renders a round range that way; an en dash, a hyphen or the set notation `{4 … 6}` is **not** this line | the loop, on every verifier dispatch (AC-3.2) | the verifier SKILL's disposition-check contract (O-9(c)) | AC-3.2's receive-side bullet states all four non-canonical inputs — absent, empty, unparseable, and endpoints with `{W}` > `{N−1}` — under one behaviour: the verifier does **not** guess and does **not** fall back to the whole branch history; it omits `## Disposition` entirely and says which input was missing, which lands in AC-3.2's first `## Disposition` row — the already-stated absent case — so **approval** is refused (an approval refusal, not a phase refusal) without halting |

**Two anchor writers, deliberately different functions** (`pdlc-rcv-panel-topology` §4):
`appendApprovalAnchors` (M-4a), unchanged, runs on the **approving terminal round only**, inside
the existing `gatePass` branch, and writes `APPROVAL-HASH:` / `REVIEWED-COMMIT:`.
**`appendRoundAnchors`**, new and named by AC-4.1, runs after **every** round's reviewers return,
whatever verdict they returned, and writes S-2, S-10 and — on a verifier round — S-1.

**A second catalogue, of a different kind.** `pdlc-rcv-finding-quality` AC-6.4 fixes a citation
grammar `C-1 … C-4` that classifies *tokens inside a reviewed document* rather than strings
crossing a component boundary. It is named here so a reader looking for the family's catalogues
finds both; its rows are that REQ's.

## 3. The per-round run-report row schema

Fixed here, once, because three REQs populate cells in it and the fixed-point determination must
be re-derivable from **one** table by a reader who was not there. The run report of any completed
review-loop phase — converged or halted — carries **one row per round**, with exactly these
columns:

| Column | Value | Populated by |
|---|---|---|
| `round` | the round index N | budget-stop |
| `panel-shape` | the on-disk role-slug set at that round (§1), or `crashed` | fixed-point-stop |
| `blocking` | `blocking(N)`, or `unavailable`, or `malformed` | fixed-point-stop |
| `growth-bytes` | the signed integer growth into that round, or empty for **the first round of a window** and for an unmeasurable boundary. Empty on every row until panel-topology ships | panel-topology |
| `classification` | `new-mechanism`, `incremental`, or `unmeasurable`; empty for the first round of a window | panel-topology |
| `notice` | a **possibly-empty, ordered list**, rendered as a `; `-separated string in the precedence order below | all three |

| # | Notice | Why it sorts here |
|---|---|---|
| 1 | S-11 `no-revision:` | a halt decided before the round was dispatched; it explains why the round exists at all. It appears alone |
| 2 | S-3 `fixed-point:` | a halt on the evidence of the round's own counts |
| 3 | S-4 `budget-exhausted:` | the other halt. **S-3 and S-4 can appear together**, on the last admitted round, in this order |
| 4 | S-5 `not-comparable: crashed-round` | the round's shape is the most general reason a comparison did not happen |
| 5 | S-5 `not-comparable: unequal-panel-shape` | shape known, but different from the predecessor's |
| 6 | S-5 `not-comparable: unavailable-count` / `malformed-count` | shape comparable, operand missing |
| 7 | S-6 `growth-unmeasurable: {reason}` | independent of comparability; **last of the seven round-scoped notices** |
| 8 | S-16 `reset-region-corrupt: {reason}` | a property of the **phase's** post-mortem, not of the round, decided before any round of the entry opens, so it is emitted on the **first** row the entry produces |

The `notice` column is a list because notices co-occur: a crashed round raises `crashed-round`,
`unavailable-count` and `no-anchor` at once. The column carries **every** notice the round raised,
deduplicated, in this order; an empty list renders as an empty cell. The order is fixed here and
not downstream because a test author must be able to derive the exact cell, character for
character, from these documents alone.

Every column is derivable from the branch alone — the cross-review basenames, the files' count
trailers, their anchors. **Where** the table is emitted, and in what rendering, is a TSPEC
obligation; its columns are not open.

**Three rows have no dispatch behind them** — row B covering **two** entry classes, both
dispatch-less — and each is stated cell by cell in the REQ that owns the condition, because the
mechanical derivation from absent files gives the wrong answer for all three: **row A**, the round
halted at open by a zero-delta test, in `pdlc-rcv-fixed-point-stop` AC-2.8; **row B**, the row of an
entry that opens no round on `pdlc-rcv-budget-stop` AC-1.5(4)'s step-4 path — either because its
reset region **failed validation** (the *validation-failure* variant) or because an answering line's
write could **not be confirmed** (the *unconfirmable-append* variant); **row C**, the row of an entry
admitted no rounds that halts immediately on the budget, in `pdlc-rcv-budget-stop` AC-1.5(1). Rows B
and C are mutually exclusive: B's entry takes no halt, C's takes one, so B carries **S-16 alone on
its validation-failure variant and an empty `notice` on its unconfirmable-append variant**, and C
carries S-4. The two B variants are distinguished by the ❌ phase-row text `pdlc-rcv-budget-stop` §6
fixes for each, never by the `notice` cell alone.
