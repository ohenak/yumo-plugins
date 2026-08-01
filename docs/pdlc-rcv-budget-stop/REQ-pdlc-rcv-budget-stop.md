---
feature: pdlc-rcv-budget-stop
ready: true
depends-on: []
---

# REQ — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. **Read it first.** Facts are cited by id (`M-1d`) and are not restated here. |
| Predecessor | `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-01 and REQ-RCV-02 unchanged in substance. |
| Siblings | `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 2 and 3; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

## 1. Problem

This REQ carries the two defects of the shared baseline's §1.2 that are about **when the loop stops**:

- **P-2 — the stopping rule is advisory, so it does nothing.** The fixed-point rule has been written into three consecutive REQ preambles and honoured by none, because nothing in
  `orchestrate-dev` reads a rule written in the document under review. On the measured run its test was satisfied at round 3 (6 → 6); rounds 4 and 5 ran anyway, consumed two full
  author-plus-two-reviewer cycles, added 66 KB — 40% of the finished document — and ended with *more* blocking findings than the round on which the rule fired. Both counts the rule needs
  are already machine-readable (M-2a). The enforcement is available and simply unbuilt.
- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so "three rounds" bounds an invocation and not a document:
  a document can be reviewed six times across two invocations with no operator action at all.
- **A round can be dispatched against a document no authoring episode revised.** Measured on the predecessor and on the superseded parent itself: round 3 of the parent's own Phase R
  reviewed a byte-identical file — both reviewers verified the blob hash was unchanged, both carried every finding forward verbatim, and one round of a five-round budget bought a review
  that could not differ from its predecessor.

Sibling `pdlc-rcv-panel-topology` carries P-1's *review-surface* half (panel shape, revision size); `pdlc-rcv-finding-quality` carries P-3 and P-4. This REQ carries the stop.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-03** | *As the operator*, I want the run report to tell me what stopped the loop and what remains unsettled, so that I can act on a halt without reading ten cross-review files and reconstructing a trajectory table by hand. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving on its own and unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run,
from the round cap alone, which is one constant. The fixed-point stop adds at least one saved optimizer episode whenever it fires, and a saved round of reviewers when it fires at the
window's second round; the zero-delta stop converts an authoring failure into a named halt instead of a consumed round. **Operator-visible surfaces:** the budget in the run report and
the post-mortem's Iterations table; a halt with a named reason on a round the operator can see was non-decreasing; the per-round report table (AC-2.9), which makes the determination
re-derivable after the fact.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch and contains that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-02** | `parseVerdict` returns machine-readable `{verdict, high, medium, low, malformed?}` | Symbol present in `pdlc/workflows/orchestrate-dev.js` (M-2a) | Must exist at HEAD — AC-2 is stated over its output |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-1.4 and AC-1.5's refusal path are stated over exactly that shape |
| **BL-07** | `sha256Hex` and `canonicaliseForDigest` are present and canonicalise **inside** the digest function | Symbols present (M-7c) | Must exist at HEAD — AC-2.8's identity test reuses them verbatim |

**All four hold on the default branch** at `9486c81`, each checkable there by the observable in its Resolution-form column. Nothing here offers a fallback if that upstream mechanism is
later reverted.

### 3.1 Three cross-REQ prerequisites, and what happens before they ship

Three of this REQ's operands are **written** by acceptance criteria in the sibling `pdlc-rcv-panel-topology`, which ships **after** this REQ. All three are stated as prerequisites
rather than assumed, and all three degrade — never fail unsafely — while outstanding.

| # | Owed by | What this REQ reads | Behaviour until it ships |
|---|---|---|---|
| **X-01** | `pdlc-rcv-panel-topology` REQ-RCV-03 AC-3.4 — the count trailer required **inside** the cross-review file's `## Verdict` section | AC-2.1's two operands, via `extractFileVerdict` → `parseVerdict` (M-2e) | A file with no in-file trailer reads *unavailable* (AC-2.7), which breaks AC-2.1's chain in both directions. The rule **fires less often; it never fires wrongly.** Degradation, not defect. |
| **X-02** | `pdlc-rcv-panel-topology` REQ-RCV-04 AC-4.1 — `appendRoundAnchors`, the unconditional per-round writer of `DOC-BYTES:` (S-2) and `DOC-SHA256:` (S-10) | AC-2.8's zero-delta test | With either anchor absent the test is **not evaluated** and the round proceeds — the fail-open branch AC-2.8's own receive side already states, chosen precisely so a missing anchor can never manufacture a halt. |
| **X-03** | `pdlc-rcv-panel-topology` REQ-RCV-03 AC-3.1/AC-3.5 — the verifier role slug and `REVIEW-MODE:` | AC-2.4's panel-shape comparability test | Until verifier rounds exist every round's slug set is `{software-engineer, test-engineer}`, `unequal-panel-shape` is unreachable, and AC-2.4 reduces to its `crashed-round` branch. AC-2.4 is stated over both from the start, so nothing is re-specified when the sibling lands. |

**Consequence for sequencing.** This REQ is deliverable and useful alone — AC-1 is complete in itself, AC-2.1 fires on any round pair whose reviewers do emit an in-file trailer, and
AC-2.8 is inert rather than wrong — so `depends-on` is empty. `pdlc-rcv-panel-topology` depends on **this** REQ because its panel rule, its growth boundary and its anchor writer are all
stated over the window origin `W` and the reset region AC-1.5 defines here.

## 4. Definitions and the closed catalogue of boundary-crossing strings

### 4.1 Vocabulary

Used with exactly these meanings throughout. **Ids `S-*` and `M-*` are shared across the three child REQs and are never renumbered**, so an existing cross-reference resolves.

| Term | Definition |
|---|---|
| **blocking count** of a round | The sum of `high` + `medium`, over every reviewer whose cross-review file exists at that round, **read from the file** by `extractFileVerdict` → `parseVerdict` (M-2e), not from the agent response. A round for which any dispatched role's count cannot be read from its file has **no blocking count** — see *unavailable*. |
| **panel shape** of a round | The *set of reviewer role slugs whose cross-review files exist on the branch at that round*. Exactly **two** sets are canonical: `{software-engineer, test-engineer}` (dual) and `{verifier}` (single verifier). Panel shape is read from the **role slugs alone** — every round writes them, including a round on which every reviewer filed *Needs revision*, because the slug is part of the filename the path derivation composes (M-3b). It is **not** the set of roles dispatched, and it does **not** turn on the `REVIEW-MODE:` marker. Two rounds have equal panel shape iff their slug sets are equal **and** neither is *crashed*. |
| **crashed** round | A round whose on-disk role-slug set is **not** one of the two canonical sets — a strict subset of one (one file under `software-engineer` or `test-engineer` and no second panel file), the empty set, or any other set (e.g. `{verifier, test-engineer}`). Its panel shape is **undetermined**; it is never comparable and never a baseline, and it never yields an approval (M-3d). The predicate is decided by the directory listing and nothing else, so it is total, computable on every round, and independent of any round's verdict. |
| **current window** | The rounds admitted by AC-1 since the last **granted** window: `{W … W+2}`, where `W` is the window origin AC-1.5(4) resolves (1 when no reset has been granted). Round `W` is the **first round of the window** and is treated exactly as round 1 is: full panel, not compared (AC-2.1), not tested for zero-delta (AC-2.8), growth not measured. A round whose predecessor is in an earlier window has no comparable predecessor, exactly as round 1 has none. |
| **reset region** | The section headed exactly `## Reset Region` (S-12) in `POSTMORTEM-{phase}-{feature}.md`, from that heading to the next top-level heading or end of file, **outside any fenced block** — the scoping rule `scanLines` already applies (M-7d). It is the only place `HALT-REASON:` (S-15), `WINDOW-START:` (S-13) and `WINDOW-RESUMED:` (S-14) are read from, so a line quoted in prose or in a Recommendation counts for nothing. Every line in it is **appended at the end** by the event that writes it, so document order is event order. It is machine-written and machine-maintained — except for the sanctioned operator repair AC-1.5(4) describes **per reason**, taken only when the run report emits S-16. The operator's `RESOLVED:` marker is never **counted**, wherever in the file it sits. |
| **zero-delta** round | A round `N > W` whose reviewed document is byte-and-hash identical to the document reviewed at round N−1 — `bytes(t0 of round N) = DOC-BYTES(N−1)` **and** `sha256(t0 of round N) = DOC-SHA256(N−1)`. It is not a small revision; it is *no revision*, and it is a halt (AC-2.8), not a consumed round. |
| **unavailable** | A quantity no reader can obtain from the branch — distinct from **malformed**, which is a quantity that was read and could not be parsed, **or that the structure carrying it says should be there and is not**. *Unavailable* is the case where the **carrier** is absent: no file, or no `## Verdict` heading. Both break AC-2's comparison chain, and the run report distinguishes them (AC-2.3, AC-2.7). |
| **phase refusal** | A decision **not to enter** the phase, taken before any round of it opens. No halt is recorded, so the halt accounting is untouched (`H` and `A` both unchanged) and no post-mortem byte is written; the phase does not run and the invocation terminates on the same path step G takes for an unresolved post-mortem (M-7a), which records the ❌ phase row and reaches the halt catch that rewrites the feature's `docs/_queue/QUEUE.md` row to `halted` (M-7b). It is **not** the *approval refusal* of the sibling REQ's AC-3.5, which is the opposite shape: there the round has already run, the loop records the refusal, the round remains owed an authoring pass, and **the window proceeds**. The two are always named in full, because a reader who applies one where the other is meant gets the wrong machine. |

### 4.2 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion stated over in-process state is undefined on a resumed phase — the normal case. Every
quantity this REQ's criteria read is listed with its durable home. **A criterion stated over an in-process-only row is a defect in this document; there is no such row.**

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| Round index N | AC-1, AC-2 | The `CROSS-REVIEW-{role}-{doc}-v{N}.md` basenames on the branch, via `deriveRoundWindow` (M-1d) | n/a — the listing is always readable |
| Highest round reached for a document | AC-1.5 | Same basenames | Treated as 0; the window opens at round 1 |
| **First round of the current window** `W` | AC-1.1, AC-1.5(4), AC-2.1, AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region**. The origin is the **greatest** value present, and only if every line in the region validates **and** the counts satisfy `H − A ∈ {0, 1}` (AC-1.5(4)'s ordered algorithm). Every such line is appended at the end, so document order is event order | Treated as **1** — no reset is in effect and AC-1.1's absolute cap applies from round 1. Fail-closed: an absent, unparseable, non-increasing or out-of-range value never widens the window. **Survives a second halt** because AC-1.4 requires the halt path to preserve the region |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt so far has been answered; the loop writes nothing and grants nothing. `H − A ∉ {0, 1}` ⇒ the counts are corrupt ⇒ `W` = 1, nothing written, nothing granted, S-16 reported, and **the entry refuses the phase and returns without taking a halt**, so the marker survives and neither count moves. `H` is exactly the number of halts taken, because **every** halt writes one `HALT-REASON:` line, including the halt that creates the file |
| **Whether the operator has cleared the current halt** | AC-1.4's re-entry gate (shipped), AC-1.5(4) | The **single** `RESOLVED:` line, read by `parseResolvedMarker` and mapped by `checkPostmortem` (M-7a) | absent, `no`, unparseable **or duplicated** ⇒ the phase is refused — the shipped fail-closed gate, unchanged. AC-1.4 keeps it exact by having each halt **strip** any prior `RESOLVED:` line |
| `blocking(N)` | AC-2.1 | The **count trailer inside the round's cross-review files** (X-01) | *unavailable* — AC-2.7 |
| Panel shape of round N | AC-2.4 | The **role slugs of the files at round N**, and nothing else | *crashed* — not comparable |
| `bytes(document as reviewed at round N)` | AC-2.8 | The `DOC-BYTES: {n}` anchor (S-2), written by the sibling REQ's per-round writer (X-02). Only the **earlier** endpoint is ever read from an anchor; the later endpoint is read live at round-open | the test is not evaluated — fail-open |
| `sha256(document as reviewed at round N)` | AC-2.8 | The `DOC-SHA256: {64 hex}` anchor (S-10) beside it, same writer, same round, same read | AC-2.8's test is **not evaluated** and the round proceeds — fail-open, because a missing anchor must not manufacture a halt |
| **Which halt a POSTMORTEM records** | AC-1.5(4), AC-1.5(5), AC-2.8 | The **last** `HALT-REASON: {string}` line in the reset region (S-15) — one line per halt, on **every** halt including the one that creates the file, appended to the end, so document order is halt order | Read as a convergence halt (S-3/S-4) — fail-closed, so an unreadable reason never converts a consuming reset into a free one |

Where a quantity had no durable home at HEAD — the blocking counts and the byte anchor — the family gives it one, on a surface that already exists for exactly this purpose: the
cross-review file's `KEY: value` anchor block (M-4a, M-4b).

### 4.3 Closed catalogue of boundary-crossing strings

DC-01 requires every string that crosses a component boundary to be a **closed catalogue on the emitting side and a total function on the receiving side, before FSPEC authoring**. This
REQ owns the ten ids below. **FSPEC may not add an eleventh without amending this table.** Ids are shared with the sibling REQs and stable: `S-1`, `S-2`, `S-8`, `S-9`, `S-10` and `S-17`
belong to `pdlc-rcv-panel-topology`, `S-7` to `pdlc-rcv-finding-quality`; this REQ **reads** S-2 and S-10 and emits neither.

| id | Exact string | Emitter | Receiver | Receiver is total because |
|---|---|---|---|---|
| **S-11** | Halt reason `no-revision: round {N} document identical to round {N-1}` | AC-2.8's halt path | the post-mortem prompt and the run report (AC-2.2) | a single format string with two round-index slots; nothing else is emitted on this path |
| **S-3** | Halt reason `fixed-point: round {N} blocking {b(N)} >= round {N-1} blocking {b(N-1)}` | AC-2.1's halt path | the same two readers | a single format string with two integer and two round-index slots; nothing else is emitted on this path |
| **S-4** | Halt reason `budget-exhausted: rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` — **rendered**, three integer slots, no constant *name* in the user-facing string: e.g. `rounds 1..3 of 3`, or `rounds 4..6 of 3` after an AC-1.5(4) reset moved the window origin | the existing budget halt (AC-1.4) | same two readers | same. A clause that hard-codes one window's render is a defect |
| **S-5** | Report notice `not-comparable: {reason}` where `{reason}` ∈ `{malformed-count, unavailable-count, unequal-panel-shape, crashed-round}` — a closed four-member enum | AC-2.3, AC-2.4, AC-2.7 | the run report row of AC-2.9 | the enum is closed here; a reason outside it is a defect, not a fallback |
| **S-16** | Report notice `reset-region-corrupt: {reason} (H={h}, A={a}) {path}` where `{reason}` ∈ `{invalid-window-start, invalid-window-resumed, counts-mismatch}` — a closed three-member enum — `{h}` and `{a}` the two counts as decimal integers, `{path}` the post-mortem's repo-root-relative path. On the two value reasons the offending **line** — the whole line as it appears in the region, not the value alone — follows the path in square brackets: `reset-region-corrupt: invalid-window-start (H=2, A=1) docs/f/POSTMORTEM-R-f.md [WINDOW-START: 99]`; on `counts-mismatch` there is no such suffix, because the evidence is the pair. **Exactly one S-16 notice is emitted per entry**, whatever the region's fault count: the reported `{reason}` is the **first** failing line in document order, and `counts-mismatch` only when every line passes step 2 | AC-1.5(4) step 4 | the run report row of AC-2.9, in the `notice` column | the enum is closed here; a reason outside it is a defect, not a fallback. The render is fixed **here and only here**, character for character, because AC-2.9's bar is that a test author derives the exact cell from this document alone. The notice is the operator's only signal that the region needs the sanctioned repair, so a corrupt region is diagnosable rather than a silent permanent halt |
| **S-12** | Section heading `## Reset Region`, exactly | every halt path (AC-1.4) — the first halt of a phase **creates** it, every later halt preserves it | AC-1.5(4)'s window-origin and counts resolution; a human reading the post-mortem | The heading is read outside fenced blocks. An absent heading, or a present one containing no `HALT-REASON:` line, is read as an empty region: `H = A = 0`, `W = 1`, no reset in effect and no clearance outstanding. Every other input is a set of S-13/S-14/S-15 lines, which AC-1.5(4)'s ordered algorithm is total over |
| **S-15** | `HALT-REASON: {value}` — one line per halt, appended at the **end** of the reset region. `{value}` is the **`; `-joined render, in AC-2.9's precedence order, of every halt reason that halt raised** — `no-revision: …` alone, or `fixed-point: …`, or `budget-exhausted: …`, or `fixed-point: …; budget-exhausted: …` | every halt path (AC-1.4 clause 1, AC-1.5(5)) | AC-1.5(5)'s clearance decision; the `H` count; a human | AC-1.5(5) states all three reachable cases of the **last** such line: begins `no-revision:`; begins `fixed-point:` or `budget-exhausted:`; unparseable or anything else — the last treated as a convergence halt, fail-closed. *Absent* is not a case at that gate (it requires `H ≥ 1`); the empty region is S-12's case |
| **S-13** | `WINDOW-START: {N}` — one line, `{N}` a decimal integer ≥ 1, **appended to the end** of the reset region | the loop, on the entry that grants a convergence-halt clearance (AC-1.5(4)) | AC-1.5(4)'s window-origin resolution; the `A` count | AC-1.5(4)'s ordered algorithm is total over every region: any line that fails validation, or counts with `H − A ∉ {0, 1}`, ⇒ `W = 1`, fail-closed, no clearance consumed; otherwise `W` is the greatest value. The append is normative, because step 2's validation reads *"every value before it"* |
| **S-14** | `WINDOW-RESUMED: {W}` — one line, `{W}` a decimal integer ≥ 1 equal to the origin then in effect, **appended to the end** of the reset region | the loop, on the entry that clears an S-11 halt (AC-1.5(5)) | the `A` count; AC-1.5(4)'s validation | same algorithm and same append rule: a value that is not a decimal integer ≥ 1, or that does not equal the resolved `W`, ⇒ `W` = 1, fail-closed. It never moves the origin — it only answers a clearance, which is exactly what distinguishes resuming from resetting |
| **S-6** | Report notice `growth-unmeasurable: {reason}`, `{reason}` ∈ `{no-anchor, unreadable-anchor, non-document-target}` | the sibling REQ's growth measurement | the run report row of AC-2.9 | **Owned by `pdlc-rcv-panel-topology`**; listed here only because AC-2.9 fixes its slot and precedence in the shared report row. Its emitter, enum and semantics are that REQ's |

**The run-report row schema** these notices land in is fixed by AC-2.9 and is part of this catalogue: one row per round, columns `round | panel-shape
| blocking | growth-bytes | classification | notice`, `notice` a **possibly-empty list** in the precedence order AC-2.9 fixes. The `growth-bytes` and
`classification` columns are populated by the sibling REQ; the schema is fixed here because AC-2's determination must be re-derivable from one table.

## 5. Acceptance criteria

Two requirements. Every acceptance criterion is in Who / Given / When / Then form and is stated over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

A review loop that has not converged in three rounds has, on the two features measured, not converged at all: the predecessor's blocking count reached its minimum at round 2 and rose
thereafter, and 66 KB — 40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired. Three rounds buys the decay that was real (11 → 6) and
declines to buy the plateau that was not.

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase for a document. *When:* the review window is opened. *Then:* the
window ends at round **3 counted from round 1 of that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

This is a **second behavioural change**. At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation budget* (M-1d): a phase re-entered on a branch whose highest round is 3 is admitted rounds 4…6,
so a fourth round *does* dispatch reviewers and the document is reviewed six times. Under that rule three-rounds-per-invocation bounds nothing about a document, and §2's cost claim
would be stated over a number that does not bound the thing it costs. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one arithmetic site.** *Who:* a maintainer. *Given:* the module at `pdlc/workflows/orchestrate-dev.js`. *When:* they change the budget. *Then:* they change
exactly one module-scope constant (M-1a) and no arithmetic anywhere else, because the sole site that expresses the window *width* in terms of that constant is `windowEnd` (M-1b). The
three value-reading sites at M-1c must continue to report the *effective* budget, so a halt message that says "5" while the budget is 3 is a defect.

**AC-1.3 — The reduction is not silently partial.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:* the post-mortem's Iterations
section and the phase record both state **three**, and the returned `iterations` field is consistent with them.

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed** path — it is not versioned as
`CROSS-REVIEW-…-v{N}` is — so a document that halts twice has its post-mortem written twice, and the reset region (§4.1, S-12) lives there. Therefore, on **every** halt, without
exception:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt that finds **no existing post-mortem** — the first halt of a phase, which is the halt that creates
   the file — **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt that finds an existing post-mortem **preserves** the region — every `WINDOW-START:`
   (S-13), `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` line to the end of that region**. Nothing is
   written above the preserved lines and nothing between them. Both cases are one rule under O-5's read-modify-write: the captured region of a file that does not exist is the **empty
   region**, and re-applying it plus this halt's line yields a one-line region. So `H` — the count of `HALT-REASON:` lines — is **exactly the number of halts this document has taken**, on
   every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* means *"the most recent halt's"*.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever in the file it sits. The new post-mortem is therefore **unresolved on arrival**, and the
   operator must clear *this* halt before the phase runs again. The strip is scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to
   the gate either way, so scoping the strip changes no decision, keeps the document to **one** scoping rule, and stops the halt path editing prose inside a human's code fence.

**Why the creating halt is stated.** Scoped only to a halt that finds an existing post-mortem, the first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ AC-1.5(4)'s gate `A <
H` false ⇒ the operator's **first** clearance silently swallowed and the phase halting again, self-healing on the second clearance — the worst shape an operator-facing failure can take.

**Why clause 2.** `RESOLVED:` is a **single-valued, human-owned, fail-closed marker**, never a counter (M-7a). A preserved `RESOLVED: yes` makes the **next** halt's post-mortem read as
already resolved, so the halt has no durable effect; a *second* one reads as `duplicated` ⇒ permanently `unresolved` ⇒ the phase can never be re-entered. Those are the only two
reachable states of the alternative and they are opposite failures. **The prohibition is untouched:** removing a marker already spent is not writing one (N-4). **And "every halt" admits
no exception** — an exception would return `H` to being an approximation; a refused entry simply never reaches a halt.

**The region is maintained by the loop, not by an agent's diligence.** At the Citation baseline the halt path dispatches an agent with a bare `Write {path}` prompt and no preservation
obligation (M-7e). The loop therefore reads the existing file before the dispatch and **re-applies** the region deterministically after it: preserved lines, this halt's appended
`HALT-REASON:`, any prior `RESOLVED:` stripped. O-5 carries that read-modify-write and its confirmation; O-9 keeps a prompt clause as belt-and-braces, not as the mechanism.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch — the
state `deriveRoundWindow` reads (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the window's **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch
   whose highest existing round is 2 is admitted **round 3 only**, and a branch whose highest existing round is 3 or more is admitted **no rounds** and halts immediately on the budget path
   (AC-1.4), emitting S-4 rendered as `rounds {W}..{W+2} of 3`. **This clause is not reached on an entry whose reset region failed validation**: step 4 refuses the phase and returns before
   the budget is evaluated, so no halt is taken and no S-4 reason is emitted on that entry;
2. the window's **start** is unchanged — one past the highest existing round (M-1d), so review history stays append-only and no existing file is ever overwritten;
3. the **one** reset is an operator's: a `POSTMORTEM-{phase}-{feature}.md` carrying a human-written `RESOLVED: yes` outside any fenced block clears the halt, and the rounds recorded
   *before* that marker do not count against the budget of the window opened after it. This is the existing operator escape hatch, stated here because it is what makes an absolute cap
   operable rather than a dead end: an operator who has addressed the finding gets a fresh window; an unattended re-invocation does not. **No agent and no script ever writes `RESOLVED:
   yes`**;
4. **the reset is anchored and consumed, in the POSTMORTEM, by the loop.** The **reset region** is read as two counts: `H`, the number of `HALT-REASON:` lines, and `A`, the number of
   `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is **unconsumed** exactly when all three hold: `checkPostmortem` reads a `RESOLVED: yes`, `A < H`, **and the region
   validates** (steps 1–3 below). On any entry that observes all three — there is no observable "first entry"; the counts are the whole state — the loop **appends** exactly one answering
   line to the **end** of the region — `WINDOW-START: {N}` on a convergence halt, `WINDOW-RESUMED: {W}` on an S-11 halt (clause 5) — which makes `A = H` again. For `WINDOW-START:`, `N` is
   one past the highest round then on the branch and becomes the origin `W`: the budget of 3 is counted from `W`, and rounds below `W` are outside the window. When `A = H` every halt so
   far has been answered and the loop writes nothing and grants nothing.

   **Answering lines are appended, for the same reason `HALT-REASON:` lines are** — step 2's validation is stated over what comes *before* each line, so it is order-sensitive. Under a
   prepending implementation a `WINDOW-RESUMED: 4` can land ahead of the `WINDOW-START: 4` it answers, which fails step 2 ⇒ `W = 1` for the rest of the document's life, since AC-1.4 clause
   1 preserves the region verbatim on every later halt. That failure is closed but **absorbing**, and no clearance repairs it.

   **A region that fails validation does not spend the clearance**, which is why validation is a conjunct of the gate and not merely a constraint on `W`. Without it, a region with two
   `HALT-REASON:` lines and one **invalid** `WINDOW-START:` has `A < H`, so the loop writes an answering line and consumes the clearance while `W` is still 1 — permanently, since nothing
   removes a line.

   **A refusal is not a halt: the entry returns without running the rest of AC-1.5.** *Inert* is only true if the entry stops: left running, clause 1 would halt on the budget path, and
   AC-1.4 governs **every** halt, so that halt would append its own `HALT-REASON:` (`H += 1`) and strip the operator's `RESOLVED:` line — spending the clearance it declined to spend.
   Therefore, when step 4 refuses:

   - the entry **takes no halt**: it does not evaluate clause 1's budget, writes no `HALT-REASON:` line, writes no post-mortem, and AC-1.4 does not fire, so `H` remains exactly the number of
     halts this document has taken;
   - the operator's `RESOLVED:` marker is **left in place**, unstripped, so `checkPostmortem` still reads `resolved` on the next entry;
   - the post-mortem file is **byte-unchanged**. *Scoped to that file*, the only effect of the entry is the S-16 notice on AC-2.9's row B. It is **not** a claim that the invocation is
     otherwise unaffected;
   - the phase is **refused, not halted** — a *phase refusal* in §4.1's sense, the same shape as step G's refusal of an unresolved post-mortem. *Returns* means **the phase does not run and
     the invocation terminates on step G's path**: a ❌ phase row is recorded, the pipeline stops, and on the shipped halt path the feature's `docs/_queue/QUEUE.md` row is rewritten to
     `halted` and committed — the queue write is reached *because* the refusal is step-G-shaped (M-7a, M-7b). A literal early `return` would **not** reach it: the entry-validation halts
     nearby build their final report directly and never call `recordHaltFn`. That is the intended outcome — the region needs an operator, so an unattended queue must stop rather than re-pick
     the feature and refuse again once per iteration.

   **The sanctioned repair is the operator's, and it is the only hand-edit this document asks for to machine-written state.** "Machine-written and machine-maintained" describes who writes
   the region in normal operation, not who may repair it. When the run report emits S-16 the region is **human-repairable**, per reason:

   | Reason | What the notice names | The sanctioned repair |
   |---|---|---|
   | `invalid-window-start` | the offending `WINDOW-START:` line | **correct that line** — the only sanctioned repair. Never delete an answering line |
   | `invalid-window-resumed` | the offending `WINDOW-RESUMED:` line | **correct that line** — the only sanctioned repair. Never delete an answering line |
   | `counts-mismatch` | the pair `H`/`A` — **no line** | delete the **whole `## Reset Region` section**, heading included |

   **Correcting is the only sanctioned value repair, and deleting an answering line is forbidden at every `H − A`.** Deleting an answering line decrements `A`, so it raises `H − A` by one,
   and both reachable values of that arithmetic are unsafe:

   | Region before | Marker on disk | Repair | Region after | What the next entry does |
   |---|---|---|---|---|
   | `H = 2`, `A = 1`, `WINDOW-START: 99` (`H − A = 1`) | either | delete the line | `H = 2`, `A = 0` ⇒ `H − A = 2` | refuses under a **different** reason, `counts-mismatch`, whose only repair is the destructive whole-section deletion |
   | `H = 1`, `A = 1`, `WINDOW-START: 99` (`H − A = 0`) | yes — the refusal left it in place | delete the line | `H = 1`, `A = 0` ⇒ `A < H` | **grants a fresh three-round window** off a clearance that was already answered, and writes `WINDOW-START:` |
   | either row above | either | **correct** the value | counts unchanged | `A < H` unchanged ⇒ no window is banked; the phase proceeds under the accounting the loop wrote |

   The second row is the one hand-edit §6's `WINDOW-START:` prohibition exists to prevent. `A` exists precisely to make a clearance one-shot: at `A = H` every halt has been answered, so a
   marker still on disk grants nothing; lowering `A` while leaving `H` restores `A < H` with the marker untouched. **Correcting is safe at every `H − A`** — it leaves both counts true, and
   any repair leaving `H − A ∉ {0, 1}` is rejected by the counts check, so a mis-repair fails closed.

   **Why `counts-mismatch` is repaired by deletion and not by editing a line.** A counts mismatch is by construction about lines *missing* or *surplus*, so there is no offending line to
   name, and both repairing edits are forbidden elsewhere: **adding** an answering line contradicts §6's *"written by the loop, never authored by a human"*, **deleting** a `HALT-REASON:`
   line contradicts AC-1.4 clause
   1. Deleting the **section** contradicts neither: S-12 reads an absent heading as the empty region, `H = A = 0`, `W = 1`. The document returns to its never-reset state, the next halt
      re-creates a one-line region, and the clearance after that one works. The cost is one further halt and the loss of the halt history — the honest price of a region whose counts are no
      longer trustworthy.

   **The accounting is over lines the loop owns, not over the human's marker.** Counting halts against answers keeps the pairing exact without touching the marker, which the shipped reader
   requires to be single-valued (M-7a); both kinds of line may legally repeat, and `RESOLVED:` may not.

   Receive side, stated as an **ordered algorithm** rather than as a table of independent rows, because DC-01 requires it to be total **and single-valued**. Given the region, the loop:

   1. collects every `HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` line in it, in document order, giving the counts `H` and `A`;
   2. **validates every one of the answering lines' values.** A `WINDOW-START:` value is valid iff it is a decimal integer ≥ 1, strictly greater than every `WINDOW-START:` value before it,
      and no greater than one past the highest round on the branch. A `WINDOW-RESUMED:` value is valid iff it is a decimal integer ≥ 1 equal to the greatest `WINDOW-START:` value before it,
      or to 1 if there is none;
   3. **validates the two counts against each other:** `H − A` must be **0 or 1**. `A > H` means more clearances have been answered than halts have been taken — which only a hand-edit
      produces, since the loop writes at most one answering line per halt; `A < H − 1` means a halt is recorded whose clearance no line answers, reachable only if a line was removed. Both are
      corruption of the counts, not of a value;
   4. **if any line's value fails step 2, or the counts fail step 3 ⇒ `W` = 1, fail-closed**, no reset is honoured, **no answering line is written and the clearance is not consumed**, and the
      run report emits `reset-region-corrupt: {reason}` (S-16) naming the file and, per reason, the offending **line** or the pair `H`/`A`. **Exactly one S-16 notice is emitted, whatever the
      fault count**: the reported `{reason}` belongs to the **first failing line in document order**, and `counts-mismatch` only when every line passes step 2, so two S-16 notices never
      co-occur in AC-2.9's `; `-joined cell. A corrupt region is never partially believed. **The entry then refuses the phase and returns**, per the *refusal is not a halt* paragraph above.
      The refusal is **unconditional**: step 4 sits inside `W`'s resolution, which runs on **every** entry, so it fires whether or not the branch has rounds left in an already-granted window
      and whether or not a `RESOLVED:` marker is pending. The justification is **fail-closed, not costless**:
      - On an **exhausted** branch — highest round ≥ 3 under `W` = 1 — the outcome is the same either way: the fallback admits `{1, 2, 3}`, all three are filled, and the entry would have halted
        on the budget path regardless. There the refusal is *indistinguishable* from the fallback.
      - On a **mid-window** branch with rounds remaining under `W` = 1 — reachable at highest round **2**, since AC-2.1 can fire on the (1, 2) pair and AC-2.8 can halt at round 2, either of
        which creates the region with `H = 1`, `A = 0` before a hand-edit corrupts it — the fallback would admit **round 3** and the phase would run. Step 4 refuses instead: no round-3
        cross-review file is written, the invocation terminates on step G's path and the queue row is written `halted`. That is a real cost, accepted deliberately: a region whose accounting
        cannot be trusted is not a state a review round should be opened over, because the cross-review it produced could not be placed in any window. This is the refusal's **positive control**
        — the only branch on which honouring step 4 and falling back are distinguishable — and O-10 carries it; AC-2.9 row B's `round` cell is stated over exactly this branch;
   5. otherwise `W` = the greatest `WINDOW-START:` value present, or **1** if there is none.

   **`H − A ≤ 1` is the invariant clause 4's "exactly one answering line" relies on**, and step 3 gives it a stated domain. It holds on every path the document generates, and a refused
   entry leaves both counts unchanged — which is why the reason S-16 reports is stable across entries. Validating rather than assuming matters because the region sits in a file the
   operator is *instructed* to edit: on a region with two `HALT-REASON:` lines and no answering line every value-level check passes vacuously, and the loop would grant a fresh window on
   **every** subsequent invocation with no operator action — exactly `H − A − 1` windows beyond the one paid for. That is the per-invocation budget AC-1.1 exists to abolish, restored
   silently and fail-**open**.

   **Step 2's range check is re-evaluated on every read, against the current listing**, not fixed at write time — *"one past the highest round on the branch"* is a predicate over mutable
   branch state by design. `harvest-learnings` deletes `CROSS-REVIEW-*` and `POSTMORTEM-*` together, so the ordinary path never sees a region outliving its rounds; a sequence that removes
   the cross-reviews while the post-mortem survives lands in the fail-closed case — S-16, sanctioned repair, no clearance spent.

   Both halves are load-bearing: without the anchor, nothing records *which* rounds preceded the marker, so "counted from round 1" is unstated for any document that has been reset; without
   consumption, `RESOLVED: yes` re-grants a fresh window on **every** subsequent invocation;

5. **every halt records which halt it was, and a no-revision halt resumes the window rather than replacing it.** Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of
   the region (S-15, AC-1.4 clause 1), `{value}` being the `; `-joined render, in AC-2.9's precedence order, of every halt reason that halt raised — so a round on which S-3 and S-4 both
   hold writes **one** line reading `fixed-point: …; budget-exhausted: …`, and the operator sees the same string here and in the run report's `notice` cell. Because each halt appends and
   nothing is written after the region, the **last** such line is the most recent halt's. On the entry that observes an unconsumed clearance (clause 4), the loop reads that last line and
   its **leading** reason:

   | Last `HALT-REASON:` begins | Effect of the `RESOLVED: yes` | Line the loop writes |
   |---|---|---|
   | `no-revision:` (S-11) | the halt is cleared and the **interrupted window is resumed** — `W` is unchanged and the rounds the window had already spent stay spent | `WINDOW-RESUMED: {W}` (S-14) |
   | `fixed-point:` (S-3) or `budget-exhausted:` (S-4) | the reset is granted and consumed as clause 4 states: a fresh three-round window opens at `N` | `WINDOW-START: {N}` (S-13) |
   | unparseable, or any other value | treated as S-3/S-4 — **fail-closed**, because the safe error is to consume a reset the operator can re-grant, never to hand out a free window | `WINDOW-START: {N}` |

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3 or S-4 (AC-2.2), so a joined value never begins `no-revision:`. **The table has three
   rows and not four, because "absent" is unreachable here** — this table is read only on the entry that observes an unconsumed clearance, and that gate requires `A < H`, hence `H ≥ 1`,
   hence a last line exists. The *absent* case is real one level up, at the region, and is S-12's.

   **Every clearance is answered by exactly one line, including this one.** With nothing written on the S-11 path the clearance would stay unanswered forever, so the **next** halt of any
   kind — a fixed-point halt three rounds later, with no operator action — would meet an unconsumed clearance and be granted a fresh window on the strength of a marker written for an
   unrelated authoring failure; a pipeline that failed to author *k* times would bank *k* free windows. `WINDOW-RESUMED: {W}` keeps the intent — origin unmoved, spent rounds spent,
   operator not charged a window — while restoring `A = H`, and it gives the S-11 path a **positive artifact** to assert on, which absence of a `WINDOW-START:` does not (a loop ignoring
   the clause produces the same absence). A zero-delta round is an **authoring** failure (AC-2.8); charging the operator's single escape hatch for it would misprice an unrelated failure.

The durable observable for all five clauses is what the loop already reads: the cross-review basenames on the branch, plus the POSTMORTEM's single `RESOLVED:` marker and its preserved
`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines. Nothing here needs a clock, a process identity, or a memory of a previous invocation.

**Observability.** `MAX_REVIEW_ROUNDS === 3`; the highest `-v{N}` on the branch never exceeds 3 for a document with no resolved POSTMORTEM; a fourth round never dispatches a reviewer;
the post-mortem contains the literal `3` and the S-4 reason string.

---

### REQ-RCV-02 — The fixed-point stop is enforced by the loop, not by prose

**Priority:** P0 · **Source:** US-01, US-03 · **Depends on:** BL-01, BL-02, BL-07, X-01, X-02

**AC-2.1 — The rule, and where each operand comes from.** *Who:* the review loop. *Given:* a failed round **N ≥ 2 of the current window** (§4.1) — round N's reviewers did not all
approve, and `N − 1 ≥ W` — whose blocking count and whose predecessor round N−1's blocking count are both **available** (AC-2.7) and **reliable** (AC-2.3), and whose panel shape equals
round N−1's (AC-2.4). *When:* round N's verdicts have been parsed and **before** round N's optimizer episode is dispatched. *Then:* if `blocking(N) ≥ blocking(N−1)` **and** `blocking(N)
> 0`, the loop halts on the existing post-mortem path (AC-1.4) instead of iterating, and does not dispatch that optimizer episode. The halt reason is S-3.

**Both operands are read from the cross-review files on the branch**, by `extractFileVerdict` → `parseVerdict` (M-2e), never from the in-process agent response: the response-side result
(M-2a) lives only in the invocation that took it, and the branch-side state the loop rebuilds **discards the counts** (M-2f), so an in-process operand is undefined for round N−1 on any
resumed phase — the normal case. Reading both from the same durable surface makes the rule invocation-agnostic by construction: the same branch yields the same decision whoever
evaluates it, and the determination is re-derivable after the fact from the files alone, which is what makes AC-2.9's report auditable. This is why X-01 is a prerequisite rather than an
assumption.

**AC-2.2 — The halt is distinguishable from budget exhaustion.** *Who:* the operator. *Given:* a fixed-point halt. *When:* they read the post-mortem and the run report. *Then:* the halt
reason names the fixed point and carries the two counts and the two round numbers that triggered it, and is textually distinct from the budget-exhaustion reason. An operator must be
able to tell, without reading the cross-review files, whether the loop ran out of rounds or stopped making progress.

**When more than one halt condition holds, the operator sees all of them, in AC-2.9's order.** On the last admitted round the fixed-point test and the budget can both be satisfied; the
`notice` cell then carries S-3 and S-4 in that order, and the post-mortem's `HALT-REASON:` line (AC-1.5(5)) carries the same `; `-joined string, so the operator sees the same two
reasons in the same order in both places. AC-2.9's precedence table gives S-3 and S-4 **two rows** for exactly this reason. AC-2.1 **is** evaluated on the last admitted round — it
happens before that round's optimizer episode *would* be dispatched, and "would be" is not "is": a round that dispatches no optimizer still has verdicts to compare. **S-11 never
co-occurs with either**, although it sorts ahead of both: an S-11 halt is decided at round-open, before the round is dispatched, so its row is the undispatched round's and carries S-11
alone (AC-2.8), while S-3 and S-4 are decided after a round's verdicts exist.

**AC-2.3 — Unreliable counts break the chain; they never fire the rule.** *Who:* the review loop. *Given:* any reviewer in round N or N−1 whose verdict parse is `malformed` (M-2b) after
the existing recovery pass (M-2d) has been attempted and has also failed. *When:* AC-2.1 would be evaluated. *Then:* the comparison is **not made**, the loop continues to the next
round, and the run report records that the round was not comparable and why (S-5, `malformed-count`). A count nobody could read is not evidence of a plateau. Because the rule compares
only *consecutive* rounds, an unreliable round is neither a trigger nor a baseline: it breaks the chain in both directions.

**AC-2.4 — Rounds of different panel shape are not comparable, and a crashed round has no shape.** *Who:* the review loop. *Given:* rounds N and N−1. *When:* AC-2.1 would be evaluated.
*Then:* the comparison is **not made**, and the run report carries S-5 with the matching reason, if either holds:

- **unequal panel shape** (`unequal-panel-shape`) — the two rounds' on-disk role-slug sets differ, which under the sibling REQ's panel rule is the normal relationship between round `W`
  (dual) and round `W+1` (single verifier). A sum over two reviewers and a sum over one are not the same measurement, and normalising them would be a guess this family declines to make
  (N-2).
- **either round is crashed** (`crashed-round`) — its on-disk role-slug set is not one of the two canonical sets (§4.1). The discriminator is the **slug**, not the `REVIEW-MODE:` marker:
  a lone file under slug `verifier` is a verifier round on its face, a lone file under `software-engineer` or `test-engineer` is a dual round one of whose reviewers crashed, and the two
  are distinguishable without reading a byte of file content. Stating comparability over the slug set keeps it independent of the marker, which matters because the slug set is produced by
  the path derivation (M-3b) on every round — including one on which every reviewer crashed after writing nothing, where the set is empty and the round is crashed, correctly. The marker
  remains load-bearing for the *approval* path, where fail-closed on a lone unmarked file is the right posture (M-3d) and is unchanged.

A crashed round is neither a trigger nor a baseline; it breaks the chain in both directions.

**AC-2.5 — A zero-to-zero comparison must never fire.** *Who:* the review loop. *Given:* `blocking(N) = 0` and `blocking(N−1) = 0` on a round that nevertheless failed. *When:* AC-2.1 is
evaluated. *Then:* the rule does **not** fire — this is the purpose of the `blocking(N) > 0` conjunct. `0/0/0` is a *genuine* parse in this codebase (M-2c), so a naive `≥` would read a
round with no blocking findings at all as a plateau and halt a document that is one Low finding away from approval. Zero blocking findings is the best possible round, not the worst.

**AC-2.6 — The rule bounds work, and it is honest about how much.** *Who:* the operator. *Given:* AC-1's three rounds. *When:* the rule fires. *Then:* how often it can fire depends on
which of the baseline §1.4 regimes the run is in. These are **all** the panel-shape sequences reachable under the sibling REQ's panel rule and growth classification, each stated over
**the growth into the round in the row** and read over the three rounds of a window (`W`, `W+1`, `W+2`; `W = 1` when no reset has been granted):

| Reachable sequence (rounds `W`, `W+1`, `W+2`) | When | Comparable consecutive same-shape pairs | Rule can fire at |
|---|---|---|---|
| dual, dual, dual | the growth into `W+1` and into `W+2` both exceed 12,000 — **the measured regime** (5 of 5 predecessor rounds) | (`W`, `W+1`) and (`W+1`, `W+2`) | round `W+1` **or** round `W+2` |
| dual, verifier, verifier | both growths ≤ 12,000 — the target regime | (`W+1`, `W+2`) only | round `W+2` |
| dual, verifier, dual | growth into `W+1` small, into `W+2` large | none | never |
| dual, dual, verifier | growth into `W+1` large, into `W+2` small | (`W`, `W+1`) | round `W+1` |
| any sequence containing a crashed or unavailable round | a reviewer crashed or wrote no trailer | fewer than the above | correspondingly fewer |

Every cell is stated over the window's offsets, not over absolute round indices: on a branch reset to `WINDOW-START: 4` the absolute-index reading is off by `W − 1` on every row. With
`W = 1` the rows read as rounds 1, 2, 3. The honest statement is: the rule fires **at most once per phase** in every reachable sequence, saves at least one optimizer episode when it
fires, and saves a round of reviewers as well when it fires at the window's second round. Before the sibling REQ ships, only the first row is reachable (X-03), and it is the row the
measured run lands in. A test author can derive the expected fire-sites from this table plus the sibling's classification of each round's measured growth; nothing about it depends on
which process opened which round.

**AC-2.7 — An unavailable count is not a malformed one, and it also breaks the chain.** *Who:* the review loop. *Given:* a round for which some dispatched role's blocking count cannot
be obtained from the branch at all. *When:* AC-2.1 would be evaluated. *Then:* that round's blocking count is **unavailable**; the comparison is not made in either direction; the run
report carries S-5 with reason `unavailable-count`, naming the round and the role; the loop continues to the next round.

**The two states are separated by what is observable, not by intent.** These are the cases and there are no others. The table is **read in order** — the first row whose observation
holds decides, which is the order the reader in AC-2.7(b) evaluates them in — so rows 5–7 are reached only for a section carrying **exactly one** `VERDICT: ` line. Throughout, a
"`VERDICT: ` line" is one whose trimmed text begins with the seven characters `VERDICT: ` — **including the trailing space** — which is what `extractFileVerdict` counts
(`pdlc/workflows/orchestrate-dev.js:902`, `line.trim().startsWith("VERDICT: ")`) and what `parseVerdict` matches (`:417`); `VERDICT:Approved` is not one, to either function.

| # | Observation on the role's file at that round | State |
|---|---|---|
| 1 | The file is absent | *unavailable* |
| 2 | The file carries no `## Verdict` heading | *unavailable* |
| 3 | A `## Verdict` section exists and carries **no `VERDICT: ` line at all** | *malformed* (AC-2.3) — this is what HEAD returns: `extractFileVerdict` finds the heading, counts `trailers === 0` (`:900-903`), skips the `> 1` return at `:904`, falls through at `:906`, and `parseVerdict` returns its `malformed: true` fallback (`:424-428`, object at `:394-400`) — a **different** object from the truncated-output return at `:451` (M-2c) |
| 4 | The `## Verdict` section carries **two or more `VERDICT: ` lines** | *malformed* — the quantity was read and could not be resolved; `extractFileVerdict` already returns `{ok: false, reason: "duplicated"}` (`:904`) |
| 5 | Exactly one `VERDICT: ` line, and there is **no non-empty line after** it | *unavailable* — `parseVerdict`'s truncated-output path, which returns genuine `0/0/0` (M-2c) |
| 6 | Exactly one `VERDICT: ` line, and after it the section contains **nothing but anchor lines** — no candidate survives the skip rule | *unavailable* — the trailer was never written; an anchor is not a malformed trailer |
| 7 | Exactly one `VERDICT: ` line, and the candidate — the first non-empty **non-anchor** line after it — does not parse as `{"high": N, "medium": N, "low": N}` after `recoverVerdict` (M-2d) has been tried | *malformed* (AC-2.3) |

*Unavailable* and *malformed* are different states and are reported differently on purpose. Malformed means a trailer was found and could not be parsed even after recovery; unavailable
means no trailer was there to parse. The distinction matters because the truncated-output path returns **genuine `0/0/0` with no `malformed` flag** (M-2c): without AC-2.7 a file with no
trailer would read as a perfect round and, worse, as a *comparable* one. The anchors-only row (6) is what keeps *unavailable* reachable once the sibling REQ's anchors are appended into
this same section — without it, a file that never carried a trailer would parse an anchor line as *malformed*, inverting the operator-facing distinction.

**(b) The trailer reader is one algorithm.** Given a file: (1) locate the trailing `## Verdict` section and count its `VERDICT: ` lines — no section ⇒ *unavailable*; none in a section
that exists ⇒ *malformed*; two or more ⇒ *malformed*; (2) from the single `VERDICT: ` line, **scan forward and stop at the first non-empty line that is not an anchor line — that line is
*the* candidate, and there is at most one**, the anchor set being §4.3's catalogue plus the M-4a approval anchors **by reference**; (3) no candidate ⇒ *unavailable*; (4) the candidate
does not parse after `recoverVerdict` ⇒ *malformed*; (5) the candidate parses ⇒ that is `blocking`'s source. **The scan stops; it does not collect** — a second parsing trailer later in
the section is not observed and is therefore not a case. Stopping matches `parseVerdict`'s own *"first non-empty line after `VERDICT:`"* and is the cheaper reader; the duplicate-trailer
concern is answered one level up, in step 1.

**AC-2.8 — A round whose document did not change is a halt, not a consumed round.** *Who:* the review loop. *Given:* a round **N ≥ 2 of the current window** about to be opened — i.e. `N
− 1 ≥ W`. *When:* the loop takes its single round-open read of the document (`t0` — there is exactly one read per round-open, shared with the sibling REQ's growth measurement),
**before** it dispatches round N's reviewers. *Then:* if that read's byte length equals `DOC-BYTES(N−1)` **and** its `sha256Hex` digest equals `DOC-SHA256(N−1)`, the loop **halts on the
existing post-mortem path** (AC-1.4) with the S-11 reason `no-revision: round {N} document identical to round {N-1}`, and round N is **not** dispatched and **not** counted against
AC-1's budget.

Receive side, total over every input — the anchor condition is stated **here**, not as a precondition of *Given*, because the third row is exactly the case in which it does not hold:

| Observation | Behaviour |
|---|---|
| Both anchors present at round N−1, both endpoints equal | **halt**, S-11 |
| Both anchors present, either endpoint differs | no halt; the round proceeds and the sibling REQ classifies the growth from the same read |
| Either anchor absent, unparseable, or duplicated with unequal values at round N−1 | the test is **not evaluated**; the round proceeds. Fail-**open**, deliberately: a missing anchor is evidence about the writer, not about the author, and must never manufacture a halt. **This is the whole of the pre-X-02 behaviour** |
| N = 1, or `N ≤ W` — round N is the first round of a window | not evaluated — there is no predecessor **in this window**. An operator who resets without revising is exercising the escape hatch deliberately; halting the fresh window on its first round would spend a reset on zero rounds. The document is not thereby exposed to a lone verifier: round `W` is a **full-panel** round |

**Which bytes, precisely.** `sha256Hex` canonicalises before it digests, inside the function and never in a caller (M-7c), so `DOC-SHA256:` is a digest of the **canonical** form and
**not** of the raw bytes `DOC-BYTES:` counts. The conjunction recovers the difference: a revision that changes only line endings or trailing newlines leaves the digest equal but the
byte count different, so the test does not fire and the round proceeds — the safe direction, and the reason the two endpoints are ANDed rather than either taken alone. Byte length alone
is not the test because two different revisions of the same length are possible and a halt on that evidence would be wrong.

**What the run report shows for the undispatched round.** Round N produces no cross-review files, so `panel-shape` and `blocking` have no source. `growth-bytes` and `classification`
**do** have one — the halt condition makes the growth exactly 0 and the classification `incremental` — and they are nevertheless left empty **by choice**: reporting them invites the
reader to think a round was measured, and no round ran. The row is fixed here: `round` = N; `panel-shape`, `blocking`, `growth-bytes`, `classification` all **empty**; `notice` = **S-11
alone**. The mechanically-derived alternative (`crashed` / `unavailable` / `unmeasurable` plus three notices) is wrong on its face: it presents the operator's primary evidence that the
*author* did nothing as evidence that the *reviewers* crashed.

**Why this is a halt and not a notice.** A zero-delta round is the strongest observable form of non-convergence there is: the optimizer episode between the two rounds produced nothing,
so round N's reviewers cannot resolve a finding, change a verdict, or produce a review that differs from round N−1's. Spending a round of a three-round budget on it converts an
*authoring* failure into a *non-convergence* post-mortem, which names the wrong cause and burns the budget that would have paid for the real revision. AC-2.1 does not catch it — the
counts are trivially equal, which reads as a *plateau of disagreement* rather than as *no input*. Clearing an S-11 halt **resumes** the window rather than resetting it (AC-1.5(5)).

**AC-2.9 — The per-round report row schema, fixed here.** *Who:* the operator. *Given:* any completed review-loop phase, converged or halted. *When:* they read the run report. *Then:*
it carries **one row per round**, with exactly these columns:

| Column | Value |
|---|---|
| `round` | the round index N |
| `panel-shape` | the on-disk role-slug set at that round (§4.1), or `crashed` |
| `blocking` | `blocking(N)`, or `unavailable`, or `malformed` |
| `growth-bytes` | the signed integer growth into that round, or empty for **the first round of a window** and for an unmeasurable boundary. **Populated by the sibling REQ**; empty on every row until it ships |
| `classification` | `new-mechanism`, `incremental`, or `unmeasurable`; empty for the first round of a window. **Populated by the sibling REQ** |
| `notice` | a **possibly-empty, ordered list**, rendered as a `; `-separated string in the precedence order below |

| # | Notice | Why it sorts here |
|---|---|---|
| 1 | S-11 `no-revision:` | a halt decided before the round was dispatched; it explains why the round exists at all. It appears alone |
| 2 | S-3 `fixed-point:` | a halt on the evidence of the round's own counts |
| 3 | S-4 `budget-exhausted:` | the other halt. **S-3 and S-4 can appear together**, on the last admitted round, in this order (AC-2.2) |
| 4 | S-5 `not-comparable: crashed-round` | the round's shape is the most general reason a comparison did not happen |
| 5 | S-5 `not-comparable: unequal-panel-shape` | shape known, but different from the predecessor's |
| 6 | S-5 `not-comparable: unavailable-count` / `malformed-count` | shape comparable, operand missing |
| 7 | S-6 `growth-unmeasurable: {reason}` | independent of comparability; **last of the seven round-scoped notices**. Owned by the sibling REQ |
| 8 | S-16 `reset-region-corrupt: {reason}` | a property of the **phase's** post-mortem, not of the round, decided before any round of the entry opens, so it is emitted on the **first** row the entry produces — row B below |

The `notice` column is a list because notices co-occur: a crashed round raises `crashed-round`, `unavailable-count` and (once the sibling ships) `no-anchor` at once. The column carries
**every** notice the round raised, deduplicated, in this order; an empty list renders as an empty cell. The order is fixed here and not downstream because a test author must be able to
derive the exact cell, character for character, from this document alone.

**Two rows have no dispatch behind them, and both are stated cell by cell**, because the mechanical derivation from absent files gives the wrong answer for both. **Row A** is AC-2.8's
halt row, above. **Row B — the no-round-admitted row:** an entry whose reset region failed AC-1.5(4) refuses the phase and returns without taking a halt, so it opens no round and
dispatches nobody, but it still produces one row, because the operator must be told why the invocation did nothing. `round` = **one past the highest round on the branch** — derived from
the directory listing alone (`deriveRoundWindow`), **not** from `W`, which is 1 on this path by construction and says nothing about where the branch got to; on the canonical
exhausted-branch fixture no round would have opened at all, so the cell is not "the round that would have opened". `panel-shape`, `blocking`, `growth-bytes`, `classification` **empty**;
`notice` = **S-16 alone**, carrying **no S-4 reason**, because no halt was taken on this entry and the budget clause was never evaluated.

Every column is derivable from the branch alone — the cross-review basenames, the files' count trailers, their anchors — which is what makes AC-2.1's determination re-derivable after
the fact by a reader who was not there. This is the artifact the predecessor's post-mortem had to be reconstructed by hand (US-03). The schema is part of §4.3's closed catalogue; O-8
specifies **where** the table is emitted and in what rendering, not what its columns are.

**Observability.** Two integers read from two files on the branch, two on-disk role-slug sets, two anchor pairs, three comparisons, two halt reason strings, one report table. No
unmeasured runtime behaviour and no in-process state.

---

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows and reads two more; it changes none of the others, and a threshold used here and
absent there is a defect.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | owned | The one constant AC-1.2 changes. AC-1.1 makes it absolute per document, not per invocation. |
| `## Reset Region` | that exact heading | owned | S-12. Created by the first halt of a phase, preserved by every later one (AC-1.4 clause 1). |
| `HALT-REASON: {value}` | one line per halt, appended at the end of the region; `{value}` the `; `-joined render in AC-2.9's precedence order | owned | S-15. `H` is exactly the number of halts taken. |
| `WINDOW-START: {N}` | `{N}` a decimal integer ≥ 1 | owned | S-13. Written by the loop, **never authored by a human**. The prohibition is scoped to *authoring* and exempts both sanctioned repairs of AC-1.5(4): the whole-section deletion for `counts-mismatch`, which zeroes both counts and can only cost windows; and the in-place **correction** of a line the loop wrote, which leaves `H` and `A` untouched. **Deleting a single answering line is forbidden at every `H − A`**, because it lowers `A` alone. |
| `WINDOW-RESUMED: {W}` | `{W}` a decimal integer ≥ 1 equal to the origin then in effect | owned | S-14. Answers a clearance without moving the origin. |
| `reset-region-corrupt: …` | the render fixed in §4.3's S-16 row, character for character, and **not repeated elsewhere** | owned | S-16. One notice per entry whatever the fault count. |
| `DOC-BYTES: {n}` / `DOC-SHA256: {64 hex}` | as the baseline fixes them | **read only** | Written by the sibling REQ's `appendRoundAnchors` (X-02). AC-2.8 reads them; this REQ emits neither and may not change their grammar. |

## 7. Non-goals and out of scope

The shared list is baseline §4; **N-1, N-2, N-3, N-4, N-7, N-9 and N-10 apply unchanged** and are not restated. Two are worth pointing at from here, because a reviewer of *this*
document is most likely to file against them:

| # | Not in scope | Why |
|---|---|---|
| **N-2** | Normalising blocking counts across panels of different size. | AC-2.4 declines it: a sum over two reviewers and a sum over one are not the same measurement, and any normalisation is a guess. R-2 records the cost and its successor. |
| **N-4** | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus the one lifecycle change AC-1.4 clause 2 states, which is the fail-closed direction. |
| **N-11** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. This REQ states only what it **reads** from them (§3.1) and the report slots they populate (AC-2.9). A finding that AC-2.4's `unequal-panel-shape` branch or AC-2.9's `growth-bytes` column is unreachable today is **correct and known** — file it as Low. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered here: it is an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify where in the loop AC-2.1's comparison is evaluated so that it precedes the optimizer dispatch, and how its halt reason reaches both the post-mortem prompt and the run report distinctly from budget exhaustion (AC-2.2). Specify the **reset-region read-modify-write** AC-1.4 requires: before the halt dispatch the loop reads the existing post-mortem and captures its `## Reset Region` — **the captured region of a file that does not exist is the empty region**, so the first halt creates a one-line region by the same path; after the write it re-applies that region — preserved lines in document order, this halt's `HALT-REASON:` appended last, any prior `RESOLVED:` line stripped — and confirms the result, reporting a lost or unwritable region rather than proceeding on a silently widened window. The region is loop-owned state, so it is **not** discharged by a prompt clause. | TSPEC |
| **O-8** | Specify **where** AC-2.9's per-round table is emitted, for both converged and halted phases, and in what rendering. **Its columns are not open** — AC-2.9 fixes the six-column schema and §4.3 records it as part of the closed catalogue. | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent that `## Reset Region` (S-12) is machine state and must be left alone. At the Citation baseline that prompt is a bare `Write ${postmortemPath}.` plus a section list (M-7e), so nothing tells the agent anything in that file is precious. **It is not the mechanism** — AC-1.4 requires the loop to re-apply the region deterministically (O-5). | FSPEC → implementation |
| **O-12** | Specify where AC-2.8's byte-and-hash identity test is evaluated — after round N−1's anchors are readable and **before** round N's reviewers are dispatched — and how the S-11 halt reaches the post-mortem writer on the same path as S-3 and S-4. Specify the **single round-open read** AC-2.8 shares with the sibling REQ's growth measurement, so the two never see different bytes, and the **order of the two round-open derivations** over that shared read. Note it must not consume a round of AC-1's budget, and that an S-11 halt cleared by the operator resumes the window (AC-1.5(5)). | FSPEC → TSPEC |
| **O-10** | Properties and tests for both requirements, including the negative cases named explicitly: the `0 ≥ 0` non-firing (AC-2.5); the malformed-count chain break in **both** directions (AC-2.3); the *unavailable*-count chain break (AC-2.7); the unequal-panel-shape and crashed-round non-comparisons (AC-2.4); a `## Verdict` section with the heading and **no** `VERDICT: ` line reading as *malformed* against `parseVerdict`'s fallback and **not** the genuine `0/0/0` return, and `VERDICT:Approved` counting as **zero** `VERDICT: ` lines (AC-2.7 rows 3–4); `VERDICT:` → anchor → valid trailer reading as a **count**, and `VERDICT:` → prose → valid trailer reading as *malformed* under the stopping scan (AC-2.7(b)); the **zero-delta halt** and each of AC-2.8's three non-halting inputs, including fail-open on an absent `DOC-SHA256:`, and a line-endings-only revision **not** firing it (equal digest, unequal byte count); the **AC-2.8 halt row** — four empty cells, `notice` = S-11 alone; the **two-halt row**, `notice` = S-3 then S-4 on the last admitted round; the **crashed-round row**, whose `notice` carries co-occurring notices in AC-2.9's precedence order; **the first halt of a phase** leaving a file with `## Reset Region` and exactly one `HALT-REASON:` line, and the operator's **first** clearance then granting a window; a second halt preserving the region and **stripping** the spent marker so `checkPostmortem` returns `unresolved`; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; a region with two `HALT-REASON:` lines and one `WINDOW-START:` granting **exactly one** further window and a region with `A = H` granting none; an S-11 clearance writing `WINDOW-RESUMED: {W}`, leaving `W` unchanged, with a **subsequent** S-3 halt then **not** auto-cleared; a halt **appending** its `HALT-REASON:`, and the loop **appending** its answering line, both asserted positionally, with a prepending implementation failing; `WINDOW-START: 4` then `WINDOW-START: 9` at highest round 6 ⇒ `W = 1`; a co-occurring S-3/S-4 halt writing **one** `HALT-REASON:` line character-identical to the report's `notice` cell; **the counts-mismatch refusal and its recovery leg as a mutation pair** — a region with two `HALT-REASON:` lines and no answering line refusing on that entry **and on a later entry that has not performed the sanctioned repair**, with `RESOLVED: yes` **not** consumed and `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report, then, after the sanctioned whole-section deletion, the next halt re-creating a one-line region and the operator's **second** clearance opening the window; the same pairing for a **value** repair — a corrected `WINDOW-START:` line, then a later entry that grants the window, with the refusing entry's file byte-unchanged; **the ratchet test** — the refusing entry appends no `HALT-REASON:`, strips no marker, and emits S-16 with the **same** reason on the next entry; **the no-round-admitted row** (AC-2.9 row B) asserted character for character with **no** S-4 reason; and **the mid-window refusal**, the positive control: on a branch whose highest round is 2 with a corrupt region and a fresh clearance, **no round-3 cross-review file is written**, the report carries row B with `round` = 3 and S-16 alone, and the invocation terminates with the queue row `halted` — an implementation that skips step 4 and falls back to `W` = 1 runs round 3 and fails this leg. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Assumption | If false |
|---|---|---|
| **A-1** | Reviewers reliably emit the `{"high": N, "medium": N, "low": N}` count trailer. Measured on the predecessor: **7 of 10** files carried it; the three that did not were rounds 1–3 of one reviewer, and `recoverVerdict` (M-2d) exists to recover exactly that case. | AC-2 fires less often than expected. It never fires *wrongly* — AC-2.3 makes an unreadable count break the chain rather than trigger it. A degradation, not a defect. |

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — no enforced stop, no measured growth. The predecessor's Phase R died exactly here, and the superseded parent died of the same cause across nine rounds. | Mitigated by splitting the parent into three reviewable documents, by depending on no unmeasured runtime fact (baseline §5), and by keeping this document short. **Accepted and unenforceable** — the enforcement is AC-2, which has not shipped. The operator is asked to watch the trajectory and halt at the fixed point by hand. |
| **R-2** | **How much AC-2 saves depends on the regime, and in one regime it is close to inert.** In the target regime the only comparable consecutive same-shape pair is (`W+1`, `W+2`); in the measured regime all three rounds are dual and a fire at `W+1` saves a full round of reviewers as well. | **Accepted and enumerated in AC-2.6** rather than stated as a single figure. In every reachable sequence the rule fires at most once per phase; what varies is where. Successor: `docs/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md` — revisit cross-panel comparability (N-2) once real runs exist to calibrate against. |
| **R-9** | **A count-only fixed point cannot distinguish a plateau from complete finding turnover.** Demonstrated on the superseded parent's own review: at round 7 `blocking(7) ≥ blocking(6) > 0` with both operands available and equal panel shape, so **AC-2.1 would have halted that phase at round 7** — while the severities were collapsing (`1H+2M`/`1H+2M` → `0H+0M`/`0H+1M` at round 8), i.e. a false positive immediately before approval. At round 9 the mirror: `blocking(9) = 6` against `blocking(8) = 1` is a *rise*, so the rule correctly does not fire, but for a reason it cannot see, on a revision that closed all eight round-8 findings. Both directions confirm the same coarseness; neither produces a wrong approval. | **Accepted, Low, recorded rather than fixed here.** The cost is a false-positive halt — one operator interaction on a round that made large, correct progress — never a wrong approval, and R-2 already accepts the coarseness of count-only comparison (N-2). A finding-identity test would need a findings-table grammar N-3 declines to introduce. Successor: the same calibration REQ, carrying *"does the fixed-point test need finding identity, not just count?"*. |
| **R-7** | **The in-file trailer (X-01) lands after this REQ.** A review written by an un-amended SKILL carries no in-file trailer, so AC-2 reads its round as *unavailable*. | Accepted and degradation-only by construction: an *unavailable* round breaks the chain in both directions and never fires the rule, so a lagging SKILL costs a comparison, never a wrong halt. |
| **R-8** | **A round can be dispatched against a document no authoring episode revised.** Observed on this family's own parent. | **Mechanised, not accepted** — AC-2.8 makes it a halt with its own reason (S-11) rather than a consumed round. Two residues are not this REQ's deliverable: an authoring episode that produces no write still *reports success*, and the authoring watchdog has no zero-write check. Both belong to the authoring path and are bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`, since detecting them needs the same unmeasured fact (baseline §5). |

**Deferrals and their binding.** Every deferral above is bound to a named successor surface that exists on this branch, not to prose intent: cross-panel comparability (R-2, N-2) and
finding identity (R-9) to `docs/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`; R-8's authoring-side residue to
`docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`. Each stub is `ready: false`, so none is queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e | P-1 (cost half), P-2 | US-01, US-02 | O-5, O-9, O-10, O-11 |
| REQ-RCV-02 | M-2a … M-2g; M-4a, M-4b (the anchor block AC-2.8 reads); M-7c | P-2 | US-01, US-03 | O-5, O-8, O-10, O-11, O-12 |

Both requirements are P0 and a single delivery. The one ordering constraint inside this REQ: **AC-1.5's window origin `W` must exist before AC-2.1, AC-2.8 or AC-2.6 can be stated over a
window**, which is why they are one document. Cross-REQ ordering is §3.1's — the sibling `pdlc-rcv-panel-topology` must not ship before this REQ, because its panel rule, growth boundary
and anchor writer are all stated over `W`.

**Round-by-round history is deliberately not restated here.** The nine review rounds that produced this material live in `docs/pdlc-review-convergence/CROSS-REVIEW-*-REQ-v{1..9}.md`
alongside the superseded parent; those files remain the record of which finding produced which clause. This REQ traces to the *measured facts*, not to the review history.
