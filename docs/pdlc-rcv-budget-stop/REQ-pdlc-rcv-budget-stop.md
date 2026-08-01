---
feature: pdlc-rcv-budget-stop
ready: true
depends-on: []
---

# REQ — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id (`M-1d`), never restated. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3), used by reference. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-01 unchanged in substance. Its REQ-RCV-02 moved to `docs/pdlc-rcv-fixed-point-stop/` at v1.1 of this document; see §10. |
| Siblings | `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (**REQ-RCV-07**) — **the implementation-altitude half split out of this document's v1.6 on 2026-08-01** (§10); `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02) — the successor that depends on this one; `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 2 and 3; `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` (v1.0) root causes 1 and 3; operator direction of 2026-07-29 and 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; `REQ-RCV-07`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. **This document cites shipped behaviour only by measured-fact id (`M-*`)** — it contains no line citation and no claim about control flow of its own (§10). Facts are cited by id, never restated. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 2.0 | 2026-08-01 |

**v2.0** is the operator-directed split resolving
`docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. AC-1.5(4)'s validation algorithm,
its refusal semantics and repair taxonomy, the answering line's byte confirmation, §6's three
refusal-render rows and the matching O-10 legs move to **`REQ-RCV-07`**; what stays is the window
itself. **No requirement id, AC id, `S-*` id or threshold changed meaning** — see §10.
**v1.6** addressed round 5, **v1.5** round 4, **v1.4** round 3, **v1.3** round 2, **v1.2** round 1.

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and
what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so a document can be reviewed six times across two
  invocations with no operator action at all.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count reached its minimum at round 2, held it at round 3, and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB —
  40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the escape hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset
  leaving no record is re-granted every invocation — the per-invocation budget restored fail-open.

Successor `pdlc-rcv-reset-region` (`REQ-RCV-07`) carries **how the reset region is validated, what a
partially-written answering line leaves behind, and what an operator does about either** — the
implementation-altitude half of AC-1.5(4). Successor `pdlc-rcv-fixed-point-stop` carries the two
**tests** evaluated inside this window (P-2); `pdlc-rcv-panel-topology` carries P-1's
*review-surface* half; `pdlc-rcv-finding-quality` P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-04** | *As the operator*, I want my one escape hatch to be spent exactly once and to leave a record, so that clearing a halt grants one fresh window and not a window per invocation. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving alone and
unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from one
constant, and is the only member of the family whose saving is not contingent on a regime.
**Operator-visible surfaces:** the budget in the run report and the post-mortem's Iterations table;
the `## Reset Region`; and row C (AC-1.5(1)), the no-round budget halt, saying why an invocation did
nothing. Row B — the other no-round row — is `REQ-RCV-07` AC-7.6's.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | `docs/completed/pdlc-review-loop-hardening/` exists there with that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-1.4 and AC-1.5's refusal path are stated over exactly that shape |

**Both hold on the default branch** at `9486c81`, each checkable by its Resolution-form observable. No fallback is offered if that upstream mechanism is later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family** — nothing it needs is owed by a sibling, which is why
`depends-on` is empty. Two clauses reach across:

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` REQ-RCV-02 AC-2.8 — the S-11 halt reason `no-revision: …` | AC-1.5(5)'s first table row, which resumes rather than resets the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. The clause is stated over both from the start, so nothing is re-specified when the successor lands. |
| **X-06** | **owed to** `pdlc-rcv-reset-region` REQ-RCV-07 AC-7.1 — the ordered validation algorithm behind AC-1.5(4)'s *region validates* predicate, and AC-7.2/AC-7.5's refusal | AC-1.5(4)'s third gate conjunct, and everything that follows a failure of it | This is a **forward** edge, not a `depends-on`: the predicate's *meaning* and its fail-closed outcome are fixed below, so nothing here is under-determined. What is not implementable until `REQ-RCV-07` ships is the predicate's **decision procedure** — so an implementation of this REQ alone must stub it **fail-closed** (invalid ⇒ refuse). A stub returning *valid* is the fail-open AC-1.5(4) exists to close. |

**Consequence for sequencing.** This REQ is deliverable alone as a **requirement**, and its window,
budget, halt path and clearance accounting are fully determined without any successor.
`pdlc-rcv-reset-region` is queued immediately behind it; `pdlc-rcv-fixed-point-stop` depends on this
REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` depends on the two of
them.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *current window* / round `W`, *reset region*,
*phase refusal* and the rest — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and **not**
restated here; that file's §2 holds the closed catalogue `S-1 … S-17` and its §3 the row schema.

This REQ **owns** six catalogue ids and **reads** two:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-12** `## Reset Region` | owned | AC-1.4 clause 1 creates and preserves it; AC-1.5(4) reads it |
| **S-13** `WINDOW-START: {N}` | owned | AC-1.5(4)'s answering line on a convergence-halt clearance |
| **S-14** `WINDOW-RESUMED: {W}` | owned | AC-1.5(5)'s answering line on an S-11 clearance |
| **S-15** `HALT-REASON: {value}` | owned | Written by every halt in AC-1.4's scope; read by AC-1.5(5) |
| **S-16** `reset-region-corrupt: …` | owned | AC-1.5(4)'s report notice when the region does not validate. Its render is catalogue §2's; its **sole emitter and its `{reason}` selection are `REQ-RCV-07` AC-7.1 step 4's** |
| **S-4** `budget-exhausted: …` | owned | AC-1.5(1)'s halt reason, rendered from the window's origin |
| **S-11** `no-revision: …` | read only | AC-1.5(5)'s first row. Emitted by `pdlc-rcv-fixed-point-stop` AC-2.8 (X-05); this REQ never emits it |
| **S-3** `fixed-point: …` | read only | AC-1.5(5)'s second row, and the `; `-joined `HALT-REASON:` value of a co-occurring halt |

**FSPEC may not add an eighteenth catalogue id**, here or anywhere in the family.

**One delegation, stated once.** Catalogue §2's S-12, S-13, S-14 and S-16 rows describe their receive
side as *"AC-1.5(4)'s ordered algorithm"*. That algorithm is **`REQ-RCV-07` AC-7.1**, which this
REQ's AC-1.5(4) names as its predicate's decision procedure (X-06). **Ownership of the ids is
unchanged and the catalogue is untouched**: read *AC-1.5(4)'s ordered algorithm* as *AC-7.1*
wherever the catalogue says it.

### 4.1 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion
stated over in-process state is undefined on a resumed phase — the normal case. Every quantity this
REQ's criteria read is listed below with its durable home. **A criterion stated over an
in-process-only row would be a defect; there is no such row.**

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| Round index N | AC-1 | The `CROSS-REVIEW-{role}-{doc}-v{N}.md` basenames on the branch, via `deriveRoundWindow` (M-1d) | n/a — the listing is always readable |
| Highest round reached for a document | AC-1.5 | Same basenames | Treated as 0; the window opens at round 1 |
| **First round of the current window** `W` | AC-1.1, AC-1.5(4); `pdlc-rcv-fixed-point-stop` AC-2.1 and AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region** — the **greatest** value present, and only if the region **validates** (AC-1.5(4)). Lines are appended, so document order is event order | Treated as **1** — no reset in effect, AC-1.1's cap applies from round 1. Fail-closed: no absent or invalid value ever widens the window. **Survives a second halt**, since AC-1.4 preserves the region |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt answered; nothing written, nothing granted. A region that does not validate ⇒ the refusal AC-1.5(4) fixes, which moves neither count |
| **That the post-mortem is readable at all** | AC-1.4, AC-1.5(4) | The file itself | An **unreadable-but-present** post-mortem is read by `checkPostmortem` as `status: "none"` (M-7a) ⇒ no halt in force **and** an empty region ⇒ `H = A = 0`, `W = 1` — the narrowest window, no clearance honoured, nothing written. |
| **Whether the operator has cleared the current halt** | AC-1.4's re-entry gate (shipped), AC-1.5(4) | The **single** `RESOLVED:` line, read by `parseResolvedMarker` and mapped by `checkPostmortem` (M-7a) | absent, `no`, unparseable **or duplicated** ⇒ the phase is refused — the shipped fail-closed gate, unchanged. AC-1.4 keeps it exact by having each halt **strip** any prior `RESOLVED:` line |
| **Which halt a POSTMORTEM records** | AC-1.5(4), AC-1.5(5) | The **last** `HALT-REASON: {string}` line in the region (S-15) — one per halt, appended, so document order is halt order | Read as a convergence halt (S-3/S-4) — fail-closed, so an unreadable reason never converts a consuming reset into a free one |


## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who/Given/When/Then form over an in-band
observable named in baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — the phases of
`PHASE_DISPATCH`: R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES (M-1d). *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: `docType: null` loops are out.** Phase CR calls the same `reviewLoop` with `docType: null`
and Phase DOD runs its own loop; N-7 excludes both and **this REQ does not change that**. For such a
loop, AC-1.1's per-document window, AC-1.4's reset region and AC-1.5's `W`, clearance accounting and
refusal **do not apply**. What does reach them is AC-1.2's
shared constant: their **per-invocation** budget becomes 3 instead of 5 — unchanged in kind, still
bounded. Stated here because the other reading is unsafe: with `docType: null` no basename matches,
so `deriveRoundWindow` always returns `startIndex = 1`, and a second CR clearance would recompute
`N = 1`, fail step 2's strictly-increasing check, and refuse Phase CR **permanently** (O-10).

This is a **second behavioural change** — §1's per-invocation defect, without which §2's cost claim would bound nothing. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one arithmetic site.** *Who:* a maintainer. *Given:* the module at `pdlc/workflows/orchestrate-dev.js`. *When:* they change the budget. *Then:* they change
exactly one module-scope constant (M-1a) and no arithmetic anywhere else, because the sole site that expresses the window *width* in terms of that constant is `windowEnd` (M-1b). The
three value-reading sites at M-1c must continue to report the *effective* budget, so a halt message that says "5" while the budget is 3 is a defect.

**What changes at `windowEnd` and what does not.** `windowEnd` remains the only width site; what
changes is its *argument*, which becomes `W` rather than `startIndex`. `W` is resolved **before**
`deriveRoundWindow` is called and is passed to it as an ordinary **resolved value** (a decimal
integer), so `deriveRoundWindow` keeps its documented contract — *synchronous, total, takes no
seam*, purely content-addressed over the basenames plus that value. **No IO seam is added to
`deriveRoundWindow` or to `windowEnd`**; the async `_readFile` that reads the post-mortem lives in
the caller. Any FSPEC or TSPEC that gives either function a seam violates this clause. **`W` is
`windowEnd`'s sole production argument:** the dormant `windowEnd(startIndex)` parameter defaults
(`reviewLoop`'s `endIndex`, `checkConverged`'s fallback) compute a *wider* window whenever
`W ≠ startIndex`. The **observable**, not the implementation choice: on every production entry the
admitted window is exactly `[W, windowEnd(W)]`, asserted at the seam that opens the round (O-10) —
which a surviving reachable default fails whenever `W ≠ 1`.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — the value of `MAX_REVIEW_ROUNDS`, 3 at the declared default
(§6). `iterations` is the **budget**, not the rounds run (M-1c). Because AC-1.5(1) makes a **zero-round** halt the commonest new
case, the Iterations section additionally states the **rounds this entry ran** — `0` there — so the two are never conflated where the operator reads them. Both are asserted **over the
constant**, never the literal `3`.

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed**, unversioned path, so a document that
halts twice has its post-mortem written twice, and the reset region (catalogue §1, S-12) lives there.

**The scope of "every halt".** The rule below is quantified over **every halt that writes
`POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope) — at HEAD
exactly one code path, the review loop's non-convergence halt (M-7e). **Not** over the pipeline's
other halt classes — creator-agent failure, the branch guard, a listing failure, Phase PUB/CI, Phase
DOD — none of which writes a post-mortem at HEAD, and none of which this REQ asks to start (N-4); nor
over the phases N-7 excludes. So §4.1's and §6's `H` counts **post-mortem-writing halts of this
phase for this document** — the only halts that leave a marker for a clearance to clear, which is
what makes the pairing exact. Within that scope the rule admits **no exception**:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt that finds **no existing post-mortem** — the first halt of a phase, which is the halt that creates
   the file — **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt that finds an existing post-mortem **preserves** the region — every `WINDOW-START:`
   (S-13), `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` to the end of that region**, nothing above or
   between the preserved lines. Both cases are one rule under O-5's read-modify-write: the captured region of a file that does not exist is the **empty region**, so re-applying it plus this
   halt's line yields a one-line region. So `H` is **exactly the number of halts in AC-1.4's scope**, on every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* is the most recent halt's.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever in the file it sits. The new post-mortem is therefore **unresolved on arrival**, and the
   operator must clear *this* halt before the phase runs again. The strip is scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to
   the gate either way, so the scoping changes no decision and stops the halt path editing prose inside a human's code fence.
   **The strip reaches inside the `## Reset Region` span too, and the two rules do not collide:** a `RESOLVED:` line is *never* a region line — the region is read as `HALT-REASON:`,
   `WINDOW-START:` and `WINDOW-RESUMED:` lines only (catalogue §1) — so they quantify over disjoint sets, and a `RESOLVED: yes` inside the region is stripped like any other.

**Why the creating halt is stated.** Scoped only to a halt finding an existing post-mortem, the first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ AC-1.5(4)'s gate `A < H` false ⇒ the operator's **first** clearance silently swallowed.

**Why clause 2.** `RESOLVED:` is a **single-valued, human-owned, fail-closed marker**, never a counter (M-7a). Preserved, it makes the next halt's post-mortem read as already resolved, so
that halt has no durable effect; a *second* marker reads as `duplicated` ⇒ permanently `unresolved` — opposite failures, and the alternative's only two reachable states. **The prohibition is untouched:** removing a marker already spent is not writing one (N-4).

**The region is maintained by the loop, not by an agent's diligence** — the halt path dispatches a bare `Write {path}` prompt with no preservation obligation (M-7e), so the loop reads the
file before the dispatch and **re-applies** the region after it. O-5 carries that read-modify-write; O-9's prompt clause is belt-and-braces, not the mechanism.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch — the
state `deriveRoundWindow` reads (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the window's **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch
   whose highest existing round is 2 is admitted **round 3 only**, and a branch whose highest existing round is 3 or more is admitted **no rounds** and halts immediately on the budget path
   (AC-1.4), emitting S-4 rendered as `rounds {W}..{windowEnd(W)} of {MAX_REVIEW_ROUNDS}` — the three slots are **computed from the constant**, never written as the literal `1..3 of 3`
   (§6). **Not reached on an entry step 4 refuses** (clause 4): it returns before the budget is evaluated, so no halt and no S-4.

   **The zero-round budget halt has a report row, and it is row C** — the **third** dispatch-less row,
   stated cell by cell here as the catalogue requires of the REQ owning the condition, because the
   per-round table would otherwise be empty for the commonest new halt. `round` = **one past the
   highest round of this document type on the branch** (from the listing); `panel-shape`, `blocking`,
   `growth-bytes`, `classification` **empty**, nothing dispatched or measured; `notice` = this halt's
   **S-4** reason, `; `-joined with any co-occurring reason in catalogue §3 precedence order;

   **`forcePhases` does not grant a window; the clearance is the only route past the cap.**
   `forcePhases` overrides a **recorded approval** and nothing else (`CLAUDE.md`, *Entry (single
   feature)*), so a forced Phase R on a document already at round 3 is admitted **no rounds**: it halts
   on the budget path, writes the post-mortem and row C, and writes the queue row `halted` — and a
   second force changes nothing, because at `A = H` a marker grants nothing. A deliberate change to a
   documented operator entry point, stated so it has an oracle;
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

   **"The highest round on the branch" always means: of the document type under review.** Every such
   phrase in this REQ — clause 2's start, this clause's `N`, step 2's range check, row B's and row C's
   `round` cell — is taken over the basenames `deriveRoundWindow` already filters by `docType`
   (M-1d), never over the whole listing. A feature directory holds cross-reviews for several document
   types at once, and the two readings differ on a constructible fixture (a Phase F region carrying
   `WINDOW-START: 4` with two FSPEC rounds and five REQ rounds: doc-type-scoped ⇒ invalid ⇒ permanent
   refusal; whole-listing ⇒ granted). It is the doc-type-scoped reading, because a window is a
   property of a document.

   **The answering line is written, and confirmed, before the window opens.** That append is the write
   making `A = H`, and the *sole* mechanism keeping the clearance one-shot; a lost append re-grants a
   fresh window on every invocation — the fail-open this criterion exists to close. It therefore
   carries the **same confirmation obligation AC-1.4 puts on the post-mortem write**, discharged
   **before any round of that entry is dispatched**, and its failure is fail-closed: no window is
   opened (`W` keeps its prior value), no round is dispatched, and the entry **refuses the phase**.
   *How* the write is confirmed, and what a partially-landed line leaves behind, is **`REQ-RCV-07`
   AC-7.5**; its operator-facing render is **catalogue §4**'s. An unconfirmable write mints **no new
   catalogue id and no new S-16 reason** — that enum is closed at three — because it is an IO fault of
   the loop, not a state of the region.

   **Consequence, and it is why the confirmation precedes the dispatch:** an entry that confirms the
   line then dies before dispatching has **spent the clearance** (`A = H`) while the window at `N` is
   intact; the next entry runs those rounds. Writing the line last would instead lose the record of a
   window already *used*, and re-grant it.

   **Answering lines are appended, like `HALT-REASON:` lines**, and the append is **normative, not an
   implementation choice**: validation reads what comes *before* each line. Under a prepending
   implementation a `WINDOW-RESUMED: 4` can land ahead of the `WINDOW-START: 4` it answers, failing
   validation ⇒ `W = 1` permanently — AC-1.4 clause 1 preserves the region verbatim on every later
   halt, so no clearance repairs it.

   **The third conjunct, as a named predicate.** *The region validates* is a predicate on the region
   and the branch listing, **total and single-valued** (DC-01), whose decision procedure is
   `REQ-RCV-07` AC-7.1's ordered algorithm and is **not restated here** (X-06). What this REQ fixes is
   its **meaning and its failure disposition**:

   - it is **true** exactly when every answering-line value is well-formed and consistent with the
     lines before it and with the highest round on the branch, **and** the counts satisfy the
     invariant `H − A ∈ {0, 1}`. The empty region satisfies it vacuously — an empty region is valid,
     not corrupt;
   - when it is **false**, fail-closed and in all four respects at once: **`W` = 1**; **the clearance
     is not consumed** — no answering line is written, and neither count moves; the run report emits
     exactly one `reset-region-corrupt: {reason}` notice (S-16, rendered per catalogue §2); and the
     entry **refuses the phase** rather than halting, terminating the invocation on step G's path
     (M-7a, M-7b) with the feature's queue row written `halted`. The refusal's semantics, its
     operator-facing strings and the sanctioned repair per reason are `REQ-RCV-07` AC-7.2, AC-7.4 and
     §6; the report row it produces is that REQ's AC-7.6 (row B).

   **Validation is a conjunct of the gate, not merely a constraint on `W`** — that is this REQ's
   claim, and the reason is arithmetic. Were it only a constraint on `W`, two `HALT-REASON:` lines and
   one *invalid* `WINDOW-START:` would give `A < H`, so the loop would write an answering line and
   consume the clearance while `W` is still 1 — permanently, since the region is preserved by every
   later halt. Equally, `H − A ≤ 1` is the invariant this clause's *exactly one answering line* relies
   on: without a stated domain, two `HALT-REASON:` lines and no answering line pass every value-level
   check vacuously, and the loop grants `H − A − 1` windows beyond the one paid for, every invocation,
   fail-**open**.

   **A refusal is not a halt: the entry returns without running the rest of AC-1.5.** Left running,
   clause 1 would halt on the budget path, and AC-1.4 governs **every** halt, so that halt would append
   its own `HALT-REASON:` (`H += 1`) and strip the operator's `RESOLVED:` — spending the clearance it
   declined to spend, and converting a repairable region into an unrepairable one. The refusal
   therefore takes no halt, leaves the marker in place, and is stated in full at `REQ-RCV-07` AC-7.2.

5. **every halt records which halt it was, and a no-revision halt resumes the window rather than replacing it.** Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of
   the region (S-15, AC-1.4 clause 1), `{value}` being the `; `-joined render, in the catalogue §3 precedence order, of every halt reason that halt raised — so a round on which S-3 and S-4 both
   hold writes **one** line reading `fixed-point: …; budget-exhausted: …`. Because each halt appends and
   nothing is written after the region, the **last** such line is the most recent halt's. On the entry that observes an unconsumed clearance (clause 4), the loop reads that last line and
   its **leading** reason:

   | Last `HALT-REASON:` begins | Effect of the `RESOLVED: yes` | Line the loop writes |
   |---|---|---|
   | `no-revision:` (S-11) | the halt is cleared and the **interrupted window is resumed** — `W` is unchanged and the rounds the window had already spent stay spent | `WINDOW-RESUMED: {W}` (S-14) |
   | `fixed-point:` (S-3) or `budget-exhausted:` (S-4) | the reset is granted and consumed as clause 4 states: a fresh three-round window opens at `N` | `WINDOW-START: {N}` (S-13) |
   | unparseable, or any other value | treated as S-3/S-4 — **fail-closed**, because the safe error is to consume a reset the operator can re-grant, never to hand out a free window | `WINDOW-START: {N}` |

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3 or S-4 (`pdlc-rcv-fixed-point-stop` AC-2.2), so a joined value never begins
   `no-revision:`. **The table has three rows, not four: "absent" is unreachable** — it is read only on an entry observing an unconsumed clearance, whose gate requires `A < H`, hence
   `H ≥ 1`, hence a last line exists. The *absent* case is the region's, one level up, and is S-12's.

   **Every clearance is answered by exactly one line, including this one.** With nothing written on the S-11 path the clearance stays unanswered forever, so the **next** halt of any
   kind banks a free window on a marker written for an unrelated authoring failure — *k* authoring failures, *k* free windows. `WINDOW-RESUMED: {W}`
   keeps the intent — origin unmoved, spent rounds spent, no window charged — while restoring `A = H`, and gives the S-11 path a **positive artifact** to assert on. Same confirmation
   obligation and fail-closed disposition as `WINDOW-START:`.

   **Row B — the report row of a refusing entry, in two variants** — is `REQ-RCV-07` AC-7.6's, stated
   cell by cell there as catalogue §3 requires of the REQ owning the condition. It is **row C's
   complement**: B's entry takes no halt, C's takes one, so B never carries S-4 and C never carries
   S-16.

All five clauses' durable observables are §4.1's, all already read by the loop. Nothing here needs a clock, a process identity, or a memory of a previous invocation.

**Observability.** `MAX_REVIEW_ROUNDS === 3`; the highest `-v{N}` for a document with no resolved POSTMORTEM never exceeds 3; on the entry past the window the **reviewer-dispatch seam is
called 0 times** and no new cross-review file appears; the post-mortem carries the budget and the S-4 reason string.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows
and reads two more; it changes none of the others, and a threshold used here and absent there is a
defect. **One row below sits outside baseline §3's scope deliberately, not by defect:**
`budget-exhausted:` is a render fixed by catalogue §2. **The three refusal-render rows v1.6 carried
here are `REQ-RCV-07` §6's and catalogue §4's** — this REQ now mints no operator string of its own.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | owned | The one constant AC-1.2 changes. AC-1.1 makes it absolute per document, not per invocation. |
| `## Reset Region` | that exact heading | owned | S-12. Created by the first halt of a phase, preserved by every later one (AC-1.4 clause 1). |
| `HALT-REASON: {value}` | one line per halt, appended at the end of the region; `{value}` the `; `-joined render in the catalogue §3 precedence order | owned | S-15. `H` is exactly the number of halts taken. |
| `WINDOW-START: {N}` | `{N}` a decimal integer ≥ 1 | owned | S-13. Written by the loop, **never authored by a human**. The prohibition is scoped to *authoring*, which is what exempts `REQ-RCV-07` AC-7.4's sanctioned repairs and AC-7.5's act 1. **Deleting a single answering line is forbidden at every `H − A`**, because it lowers `A` alone (AC-7.4). |
| `WINDOW-RESUMED: {W}` | `{W}` a decimal integer ≥ 1 equal to the origin then in effect | owned | S-14. Answers a clearance without moving the origin. |
| `reset-region-corrupt: …` | the render fixed in catalogue §2's S-16 row, character for character, and **not repeated elsewhere** | owned | S-16. One notice per entry whatever the fault count. AC-1.5(4) fixes *when* it is emitted; its sole emitter and its `{reason}` selection are `REQ-RCV-07` AC-7.1 step 4's. |
| `budget-exhausted: …` | the render fixed in catalogue §2's S-4 row | owned | Rendered from `W` and the constant: a clause that hard-codes `rounds 1..3 of 3` is a defect. |
| `no-revision: …` / `fixed-point: …` | as the catalogue fixes them | **read only** | S-11 and S-3, emitted by `pdlc-rcv-fixed-point-stop` (X-05). AC-1.5(5) reads the **leading** reason of the last `HALT-REASON:` line; this REQ emits neither and may not change their grammar. |

## 7. Non-goals and out of scope

The shared list is baseline §4, which defines **N-1 … N-10 only**; all of `N-1, N-2, N-3, N-4, N-7,
N-9, N-10` apply unchanged and are not restated, and `N-5`, `N-6` and `N-8` are **inapplicable to
this REQ, not overlooked**. **Ids above `N-10` are not shared** — the family has minted colliding
`N-1x` ids (`N-13` differs between `pdlc-rcv-fixed-point-stop` §7 and `pdlc-rcv-finding-quality` §7)
— so this document's own non-goals use a **per-REQ namespace, `NB-*`**; restated shared rows keep
their shared ids. Four are worth pointing at:

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus the one lifecycle change AC-1.4 clause 2 states, which is the fail-closed direction. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Restated here because AC-1.1 now says so explicitly: `docType: null` loops keep a per-invocation budget, take the new value of the shared constant, and get no reset region. |
| **NB-1** | Specifying the fixed-point test, the zero-delta test, or how a round's blocking count is read. | They are `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that this document never says *when* the loop compares two rounds is **correct and known** — file it there. |
| **NB-2** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. A finding that this document does not define `DOC-BYTES:` is **correct and known** — file it as Low. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify the **reset-region read-modify-write** AC-1.4 requires: before the halt dispatch the loop captures the existing `## Reset Region` — **the captured region of a file that does not exist is the empty region**, so the first halt creates a one-line region by the same path; after the write it re-applies it — preserved lines in order, this halt's `HALT-REASON:` last, any prior `RESOLVED:` stripped — and confirms the result, reporting a lost or unwritable region rather than proceeding on a silently widened window. The region is loop-owned state, **not** discharged by a prompt clause. A crash **between** the dispatch and the re-apply leaves the region missing or truncated: both land fail-closed (`W` = 1, or S-16 and a sanctioned repair), `H` understating the halts by at most the lost lines, and the next halt re-creates the region. | TSPEC |
| **O-12** | Specify the **answering-line append and its confirmation** on the *granting* path (AC-1.5(4)) — the read-modify-write is O-5's for the halt path, and this is its counterpart for the entry that grants or resumes a window: append one `WINDOW-START:`/`WINDOW-RESUMED:` line at the end of the region, re-read and confirm it **by byte comparison against what was written**, re-running steps 1–3, and dispatch no round until it is confirmed; on an unconfirmable write take the stated fail-closed exit (no window, no round, phase refused, reported like a lost region). Also specify how `W` reaches `deriveRoundWindow` as a **resolved value** so that function and `windowEnd` keep their synchronous, seam-free contract (AC-1.2). | TSPEC |
| **O-6** | Specify where AC-1.5(4)'s ordered algorithm runs *within the phase body* — the REQ fixes it **after** `phaseGate`'s `{ skip: true }` exit and before any round opens (AC-1.5(4)) — so that a refusal reaches step G's path (M-7a, M-7b) rather than returning early: the entry-validation halts nearby build their final report directly and never call `recordHaltFn`, and a literal early `return` would therefore leave the queue row unwritten. Also specify the **suppression seam** for the halt catch's recovery emit (`orchestrate-dev.js:4928`), which is guarded by nothing and fires on every halt class: on the two row-B variants the refusal's own recovery text stands in its place, and **every other halt class keeps that line unchanged**. | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent `## Reset Region` (S-12) is machine state to be left alone — the baseline prompt is a bare `Write ${postmortemPath}.` plus a section list (M-7e). **Not the mechanism**; O-5 is. | FSPEC → implementation |
| **O-10** | Properties and tests for this requirement, including the negative cases named explicitly: **the first halt of a phase** leaving a file with `## Reset Region` and exactly one `HALT-REASON:` line, and the operator's **first** clearance then granting a window; a second halt preserving the region and **stripping** the spent marker so `checkPostmortem` returns `unresolved`; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; a region with two `HALT-REASON:` lines and one `WINDOW-START:` granting **exactly one** further window and a region with `A = H` granting none; an S-11 clearance writing `WINDOW-RESUMED: {W}`, leaving `W` unchanged, with a **subsequent** convergence halt then **not** auto-cleared; halt lines and answering lines both **appended**, asserted positionally, with a prepending implementation failing; `WINDOW-START: 4` then `WINDOW-START: 9` at highest round 6 ⇒ `W = 1`; the S-4 reason rendered from the window's own origin, its slots computed from `W`, `windowEnd` and the constant (the `rounds 4..6 of 3` shape is **illustrative**, never a literal expectation); **the counts-mismatch refusal and its recovery leg as a mutation pair** — a region with two `HALT-REASON:` lines and no answering line refusing on that entry **and on a later entry that has not performed the sanctioned repair**, with `RESOLVED: yes` **not** consumed and `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report, then, after the sanctioned whole-section deletion, the next halt re-creating a one-line region and the operator's **second** clearance opening the window; the same pairing for a **value** repair, with the refusing entry's file byte-unchanged; **the ratchet test** — the refusing entry appends no `HALT-REASON:`, strips no marker, and emits S-16 with the **same** reason next entry; **row B's validation-failure variant** asserted character for character — S-16 alone, **no** S-4 reason; **the refusal's own operator strings** (§6) — the ❌ text `Refused — reset region corrupt at {path} ({reason})` and a recovery text naming *that reason's* sanctioned repair, both asserted character for character, with step G's `Refused — unresolved POSTMORTEM at …` and the **suppressed** queue-reset string (`:4928`'s, which is not step G's) both asserted **absent** on **each** refusing entry and **present** on a control halt of another class, plus `postmortemStatus` asserted **equal to `written`** on **each** refusing entry, with step G's `unresolved` as its negative control and the shipped `No POSTMORTEM was written.` line asserted **absent** from the report; **the unconfirmable-append entry** emitting §6's *Unconfirmed-append text*, row B's **empty** `notice` and a recovery text naming **both** acts in order, plus its **torn-write legs**, parameterised over the truncation offset: every offset — inside the key, inside the value, newline lost — fails the byte confirmation and refuses on **this** entry, the well-formed `WINDOW-START: 1` case included, and no offset opens a round; **their sequel, asserted positively** — from the `WINDOW-START: 1` residue, the next entry after act 1 was performed finds `A < H`, the clearance unspent and the next grant at the correct origin, while the next entry after act 1 was skipped finds `A = H`, `W` = 1 and the clearance gone: the pair, because that entry is where the clearance is actually lost; and **the mid-window refusal**, the positive control: on a branch whose highest round is 2 with a corrupt region and a fresh clearance, **no round-3 cross-review file is written**, the report carries row B with `round` = 3 and S-16 alone, and the invocation terminates with the queue row `halted` — an implementation that skips step 4 and falls back to `W` = 1 runs round 3 and fails this leg; **the admitted window is exactly `[W, windowEnd(W)]` on every production entry** (AC-1.2), asserted at the seam that opens the round, so a widened default fails. **Every "no round ran" leg is asserted with a positive conjunct, not by absence alone:** a **call-count oracle on the reviewer-dispatch seam** — exactly **0** dispatches on **each** refusing entry (both row-B variants), on the exhausted-budget entry and on the skipped entry, and **≥ 1** on the control entry that does open a round — asserted *alongside* the file-absence check, since a test double that writes no file satisfies absence either way. Also: **row C** asserted cell by cell with its S-4 reason and **0** dispatches; a **forced** phase on an exhausted document halting rather than re-reviewing; a **Phase CR halt creating no `## Reset Region`**; the answering-line write **confirmed before** any dispatch; and both `iterations` and the post-mortem's Iterations section asserted **over the constant**, with rounds-run `0` on the zero-round halt. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — five per-invocation rounds, no enforced stop. The predecessor's Phase R died exactly here. | Mitigated by splitting the parent, depending on no unmeasured runtime fact (baseline §5), and keeping this document short. **Accepted and unenforceable** — the enforcement is this REQ and its successor, neither shipped; the operator watches the trajectory and halts by hand. |
| **R-12** | **A repeating S-11 halt is unbounded.** Each S-11 clearance writes `WINDOW-RESUMED: {W}`, leaves `W` unchanged and (per the successor's AC-2.8) costs the window no round, so an authoring side that keeps producing zero-delta rounds yields an unbounded halt/clearance sequence with `H` and `A` growing together and the budget never exhausting. | **Accepted, and bounded by the operator rather than by the loop.** Every iteration costs one hand-written `RESOLVED: yes`, so the sequence is never unattended; capping it would need a second counter that could only deny an operator *choosing*, each time, to continue. Revisit if the S-11 path repeats in practice. |
| **R-13** | **Migration: branches that already carry more than three rounds.** At the commit that lands `MAX_REVIEW_ROUNDS = 3`, every in-flight phase whose document has 3+ rounds is admitted no rounds and halts on the next entry, rendering S-4 as `rounds 1..3 of 3` while five rounds sit on disk. | **Correct and expected, not a defect** — the render states the *window*, not the file count. The escape is the ordinary clearance (AC-1.5(3)). No migration script, no back-fill of reset regions. |
| **R-10** | **The reset region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie in either direction, and one direction restores the per-invocation budget AC-1.1 abolishes — silently and fail-open. | **Mechanised, not accepted.** Step 2 validates every answering line and step 3 the counts; either failure refuses the phase with S-16. The residual is the operator's (§6's *never authored by a human*; AC-1.5(4)'s sanctioned repairs, act 1 of the unconfirmable-append recovery included). |
| **R-11** | **A refusal costs a mid-window round.** On a branch with rounds left under `W` = 1, a corrupt region refuses the phase where the fallback would have run the next round. | **Accepted deliberately, and stated as the positive control (AC-1.5(4) step 4, O-10)** — whose fixture is synthetic until the successor ships. A region whose accounting cannot be trusted is not a state to open a round over: the cross-review could not be placed in any window. |

**Deferrals and their binding.** This REQ defers nothing of its own. The predecessor's deferrals
belong to the successors carrying the criteria that raise them: cross-panel comparability and finding
identity to `docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`,
the authoring-side zero-write residue to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`;
both recorded in `pdlc-rcv-fixed-point-stop` §9. Each stub is `ready: false`, so neither is
queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e | P-1 (cost half) | US-01, US-02, US-04 | O-5, O-6, O-9, O-10, O-11, O-12 |

**Why one requirement and not two.** v1.0 carried REQ-RCV-01 and REQ-RCV-02 together at **581 lines
/ 83 KB**, past the 60 KB ceiling; v1.1 cut at the seam they already had — this REQ the **window**,
`docs/pdlc-rcv-fixed-point-stop/` the two **tests** inside it, with the ordering argument (`W` before
AC-2.1/AC-2.8/AC-2.6) kept as a `depends-on` edge. No requirement, AC or `S-*` id changed.

**Round-by-round history is deliberately not restated here:** `harvest-learnings` deletes
`CROSS-REVIEW-*` once LEARNINGS is written, so citing round files would be structurally wrong. This
REQ traces *measured facts*, not review history.
