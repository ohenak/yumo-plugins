---
feature: pdlc-rcv-budget-stop
ready: true
depends-on: []
---

# REQ — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. **Read it first.** Facts are cited by id (`M-1d`) and are not restated here. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3). Terms and ids are used by reference and never restated. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-01 unchanged in substance. Its REQ-RCV-02 moved to `docs/pdlc-rcv-fixed-point-stop/` at v1.1 of this document; see §10. |
| Siblings | `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02) — **the successor that depends on this one**; `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 2 and 3; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.1 | 2026-08-01 |

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and
what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so "three rounds" bounds an invocation and not a document:
  a document can be reviewed six times across two invocations with no operator action at all.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count reached its minimum at round 2, held it at round 3, and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB —
  40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the escape hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset
  that leaves no record is re-granted on every subsequent invocation — the per-invocation budget restored silently and fail-open.

Successor `pdlc-rcv-fixed-point-stop` carries the two **tests** evaluated inside this window (P-2:
the enforced fixed-point stop, and the zero-delta stop). Sibling `pdlc-rcv-panel-topology` carries
P-1's *review-surface* half (panel shape, revision size); `pdlc-rcv-finding-quality` carries P-3
and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-04** | *As the operator*, I want my one escape hatch to be spent exactly once and to leave a record, so that clearing a halt grants one fresh window and not a window per invocation. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving on its own and
unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from
the round cap alone, which is one constant. It is the only member of the family whose saving is
not contingent on a regime. **Operator-visible surfaces:** the budget in the run report and the
post-mortem's Iterations table; the `## Reset Region` a halt writes and an operator reads; the
no-round-admitted report row (AC-1.5(4)) that says why an invocation did nothing.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch and contains that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-1.4 and AC-1.5's refusal path are stated over exactly that shape |

**Both hold on the default branch** at `9486c81`, each checkable there by the observable in its Resolution-form column. Nothing here offers a fallback if that upstream mechanism is
later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family** — nothing it needs is owed by a sibling, which is why
`depends-on` is empty and every other `pdlc-rcv-*` REQ depends on it, directly or transitively.
One clause reads a string a successor emits:

| # | Owed by | What this REQ reads | Behaviour until it ships |
|---|---|---|---|
| **X-05** | `pdlc-rcv-fixed-point-stop` REQ-RCV-02 AC-2.8 — the S-11 halt reason `no-revision: …` | AC-1.5(5)'s first table row, which resumes rather than resets the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. The clause is stated over both from the start, so nothing is re-specified when the successor lands. |

**Consequence for sequencing.** This REQ is deliverable and useful alone: AC-1 is complete in
itself and its behaviour is fully determined without any successor. `pdlc-rcv-fixed-point-stop`
depends on this REQ because both its tests are stated over the window origin `W`;
`pdlc-rcv-panel-topology` depends on both, because its panel rule and growth boundary are stated
over `W` and its anchor writer is consumed by AC-2.8.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *current window* / round `W`, *reset
region*, *zero-delta*, *panel shape*, *crashed* round, *blocking count*, *unavailable*,
*malformed*, *phase refusal*, *approval refusal* — is defined in
`docs/_constraints/pdlc-rcv-catalogue.md` §1 and is **not** restated here, so the family cannot
drift into two meanings. The same file's §2 holds the closed catalogue `S-1 … S-17` and its §3 the
run-report row schema.

This REQ **owns** five catalogue ids and **reads** three:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-12** `## Reset Region` | owned | AC-1.4 clause 1 creates and preserves it; AC-1.5(4) reads it |
| **S-13** `WINDOW-START: {N}` | owned | AC-1.5(4)'s answering line on a convergence-halt clearance |
| **S-14** `WINDOW-RESUMED: {W}` | owned | AC-1.5(5)'s answering line on an S-11 clearance |
| **S-15** `HALT-REASON: {value}` | owned | Written by every halt (AC-1.4 clause 1); read by AC-1.5(5) |
| **S-16** `reset-region-corrupt: …` | owned | AC-1.5(4) step 4's report notice |
| **S-4** `budget-exhausted: …` | owned | AC-1.5(1)'s halt reason, rendered with the window's own origin |
| **S-11** `no-revision: …` | read only | AC-1.5(5)'s first row. Emitted by `pdlc-rcv-fixed-point-stop` AC-2.8 (X-05); this REQ never emits it |
| **S-3** `fixed-point: …` | read only | AC-1.5(5)'s second row, and the `; `-joined `HALT-REASON:` value of a co-occurring halt |

**FSPEC may not add an eighteenth id to the catalogue**, here or anywhere in the family.

### 4.1 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion
stated over in-process state is undefined on a resumed phase — the normal case. Every quantity
this REQ's criteria read is listed with its durable home. **A criterion stated over an
in-process-only row is a defect in this document; there is no such row.**

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| Round index N | AC-1 | The `CROSS-REVIEW-{role}-{doc}-v{N}.md` basenames on the branch, via `deriveRoundWindow` (M-1d) | n/a — the listing is always readable |
| Highest round reached for a document | AC-1.5 | Same basenames | Treated as 0; the window opens at round 1 |
| **First round of the current window** `W` | AC-1.1, AC-1.5(4); `pdlc-rcv-fixed-point-stop` AC-2.1 and AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region**. The origin is the **greatest** value present, and only if every line in the region validates **and** the counts satisfy `H − A ∈ {0, 1}` (AC-1.5(4)'s ordered algorithm). Every such line is appended at the end, so document order is event order | Treated as **1** — no reset is in effect and AC-1.1's absolute cap applies from round 1. Fail-closed: an absent, unparseable, non-increasing or out-of-range value never widens the window. **Survives a second halt** because AC-1.4 requires the halt path to preserve the region |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt so far has been answered; the loop writes nothing and grants nothing. `H − A ∉ {0, 1}` ⇒ the counts are corrupt ⇒ `W` = 1, nothing written, nothing granted, S-16 reported, and **the entry refuses the phase and returns without taking a halt**, so the marker survives and neither count moves. `H` is exactly the number of halts taken, because **every** halt writes one `HALT-REASON:` line, including the halt that creates the file |
| **Whether the operator has cleared the current halt** | AC-1.4's re-entry gate (shipped), AC-1.5(4) | The **single** `RESOLVED:` line, read by `parseResolvedMarker` and mapped by `checkPostmortem` (M-7a) | absent, `no`, unparseable **or duplicated** ⇒ the phase is refused — the shipped fail-closed gate, unchanged. AC-1.4 keeps it exact by having each halt **strip** any prior `RESOLVED:` line |
| **Which halt a POSTMORTEM records** | AC-1.5(4), AC-1.5(5) | The **last** `HALT-REASON: {string}` line in the reset region (S-15) — one line per halt, on **every** halt including the one that creates the file, appended to the end, so document order is halt order | Read as a convergence halt (S-3/S-4) — fail-closed, so an unreadable reason never converts a consuming reset into a free one |


## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who / Given / When / Then form and is stated
over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

A review loop that has not converged in three rounds has, on the two features measured, not converged at all: the predecessor's blocking count reached its minimum at round 2, held it at
round 3, and rose thereafter (11, 6, 6, 7, 9), and 66 KB — 40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired. Three rounds buys the decay
that was real (11 → 6) and the round that held it, and declines to buy the rise that followed.

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — the phases of
`PHASE_DISPATCH`: R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES (M-1d). *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: `docType: null` loops are out.** Phase CR calls the same `reviewLoop` with `docType: null`
(`orchestrate-dev.js:4720`–`:4721`), and Phase DOD runs its own evaluator loop; N-7 excludes both
from this family's mechanisms and **this REQ does not change that**. Concretely, for a `docType:
null` loop: AC-1.1's absolute per-document window, AC-1.4's reset region and AC-1.5's origin `W`,
clearance accounting and refusal **do not apply**. What *does* reach them is AC-1.2's single
constant, which they share: their existing **per-invocation** budget becomes 3 instead of 5 —
unchanged in kind, still bounded, still halting the way it halts today. That is stated here rather
than left to FSPEC because the alternative reading is not merely out of scope but unsafe: with
`docType: null` no basename ever matches, so `deriveRoundWindow` returns `startIndex = 1` on every
entry, and a second CR clearance would compute the same `N = 1`, fail AC-1.5(4) step 2's
strictly-increasing check, and refuse Phase CR **permanently and unrepairably** for that feature.
A test for this clause asserts that no `## Reset Region` is created by a Phase CR or Phase DOD halt.

This is a **second behavioural change**. At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation budget* (M-1d): a phase re-entered on a branch whose highest round is 3 is admitted rounds 4…6,
so a fourth round *does* dispatch reviewers and the document is reviewed six times. Under that rule three-rounds-per-invocation bounds nothing about a document, and §2's cost claim
would be stated over a number that does not bound the thing it costs. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one arithmetic site.** *Who:* a maintainer. *Given:* the module at `pdlc/workflows/orchestrate-dev.js`. *When:* they change the budget. *Then:* they change
exactly one module-scope constant (M-1a) and no arithmetic anywhere else, because the sole site that expresses the window *width* in terms of that constant is `windowEnd` (M-1b). The
three value-reading sites at M-1c must continue to report the *effective* budget, so a halt message that says "5" while the budget is 3 is a defect.

**What changes at `windowEnd` and what does not.** `windowEnd` remains the only width site; what
changes is its *argument*, which becomes `W` rather than `startIndex`. `W` is resolved **before**
`deriveRoundWindow` is called and is passed to it as an ordinary **resolved value** (a decimal
integer), so `deriveRoundWindow` keeps its documented contract — *synchronous, total, takes no
seam*, purely content-addressed over the basenames plus that value. **No IO seam is added to
`deriveRoundWindow` or to `windowEnd`**; the async `_readFile` that reads the post-mortem lives in
the caller. Any FSPEC or TSPEC that gives either function a seam violates this clause.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — the value of `MAX_REVIEW_ROUNDS`, which is 3 at the
declared default (§6) — so a halt that says "5" while the budget is 3 is a defect. `iterations` is the **budget**, not the rounds run: that is what the shipped site returns (M-1c) and this
REQ does not change it. Because AC-1.5(1) makes a **zero-round** halt the commonest new case, the post-mortem's Iterations section additionally states the **rounds this entry ran** — `0` on
the entry admitted no rounds — so budget and rounds-run are never conflated in the one place an operator reads them. A test asserts both quantities over the constant, not over the literal
`3`, so a maintainer who changes the constant does not go red for the wrong reason.

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed** path — it is not versioned as
`CROSS-REVIEW-…-v{N}` is — so a document that halts twice has its post-mortem written twice, and the reset region (catalogue §1, S-12) lives there.

**The scope of "every halt".** The rule below is quantified over **every halt that writes
`POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope) — at HEAD
exactly one code path, the review loop's non-convergence halt (M-7e), and the phases it runs for.
It is **not** quantified over the pipeline's other halt classes — a creator-agent failure, the branch
guard, a listing failure, Phase PUB/CI, Phase DOD — none of which writes a post-mortem at HEAD and
none of which this REQ asks to start writing one (that would be an N-4 violation). Nor over Phase CR
and Phase DOD, which N-7 excludes. Read with that scope, §4.1's *"`H` is exactly the number of halts
this document has taken"* means **the number of post-mortem-writing halts of this phase for this
document** — the only halts that can leave a marker for a clearance to clear, which is what makes the
pairing argument exact. A halt that writes no post-mortem leaves no marker, grants no clearance and
moves neither count. Within that scope the rule admits **no exception**:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt that finds **no existing post-mortem** — the first halt of a phase, which is the halt that creates
   the file — **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt that finds an existing post-mortem **preserves** the region — every `WINDOW-START:`
   (S-13), `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` line to the end of that region**. Nothing is
   written above the preserved lines and nothing between them. Both cases are one rule under O-5's read-modify-write: the captured region of a file that does not exist is the **empty
   region**, and re-applying it plus this halt's line yields a one-line region. So `H` — the count of `HALT-REASON:` lines — is **exactly the number of halts this document has taken**, on
   every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* means *"the most recent halt's"*.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever in the file it sits. The new post-mortem is therefore **unresolved on arrival**, and the
   operator must clear *this* halt before the phase runs again. The strip is scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to
   the gate either way, so scoping the strip changes no decision, keeps the document to **one** scoping rule, and stops the halt path editing prose inside a human's code fence.
   **The strip reaches inside the `## Reset Region` span too, and the two rules do not collide:** a `RESOLVED:` line is *never* a region line — the region is read as `HALT-REASON:`,
   `WINDOW-START:` and `WINDOW-RESUMED:` lines only (catalogue §1: the operator's marker is never counted, wherever in the file it sits) — so "preserve every line in the region" and
   "strip every unfenced `RESOLVED:`" quantify over disjoint sets. A `RESOLVED: yes` an operator wrote inside the region is stripped like any other and preserves nothing.

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
   - the post-mortem file is **byte-unchanged**. *Scoped to that file*, the only effect of the entry is the S-16 notice on row B below. It is **not** a claim that the invocation is
     otherwise unaffected;
   - the phase is **refused, not halted** — a *phase refusal* in the catalogue §1 sense, the same shape as step G's refusal of an unresolved post-mortem. *Returns* means **the phase does not run and
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
      co-occur in the report row's `; `-joined `notice` cell. A corrupt region is never partially believed. **The entry then refuses the phase and returns**, per the *refusal is not a halt* paragraph above.
      The refusal is **unconditional**: step 4 sits inside `W`'s resolution, which runs on **every** entry, so it fires whether or not the branch has rounds left in an already-granted window
      and whether or not a `RESOLVED:` marker is pending. The justification is **fail-closed, not costless**:
      - On an **exhausted** branch — highest round ≥ 3 under `W` = 1 — the outcome is the same either way: the fallback admits `{1, 2, 3}`, all three are filled, and the entry would have halted
        on the budget path regardless. There the refusal is *indistinguishable* from the fallback.
      - On a **mid-window** branch with rounds remaining under `W` = 1 — reachable at highest round **2**, since `pdlc-rcv-fixed-point-stop` AC-2.1 can fire on the (1, 2) pair and its AC-2.8 can halt at round 2, either of
        which creates the region with `H = 1`, `A = 0` before a hand-edit corrupts it — the fallback would admit **round 3** and the phase would run. Step 4 refuses instead: no round-3
        cross-review file is written, the invocation terminates on step G's path and the queue row is written `halted`. That is a real cost, accepted deliberately: a region whose accounting
        cannot be trusted is not a state a review round should be opened over, because the cross-review it produced could not be placed in any window. This is the refusal's **positive control**
        — the only branch on which honouring step 4 and falling back are distinguishable — and O-10 carries it; row B's `round` cell is stated over exactly this branch;
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
   the region (S-15, AC-1.4 clause 1), `{value}` being the `; `-joined render, in the catalogue §3 precedence order, of every halt reason that halt raised — so a round on which S-3 and S-4 both
   hold writes **one** line reading `fixed-point: …; budget-exhausted: …`, and the operator sees the same string here and in the run report's `notice` cell. Because each halt appends and
   nothing is written after the region, the **last** such line is the most recent halt's. On the entry that observes an unconsumed clearance (clause 4), the loop reads that last line and
   its **leading** reason:

   | Last `HALT-REASON:` begins | Effect of the `RESOLVED: yes` | Line the loop writes |
   |---|---|---|
   | `no-revision:` (S-11) | the halt is cleared and the **interrupted window is resumed** — `W` is unchanged and the rounds the window had already spent stay spent | `WINDOW-RESUMED: {W}` (S-14) |
   | `fixed-point:` (S-3) or `budget-exhausted:` (S-4) | the reset is granted and consumed as clause 4 states: a fresh three-round window opens at `N` | `WINDOW-START: {N}` (S-13) |
   | unparseable, or any other value | treated as S-3/S-4 — **fail-closed**, because the safe error is to consume a reset the operator can re-grant, never to hand out a free window | `WINDOW-START: {N}` |

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3 or S-4 (`pdlc-rcv-fixed-point-stop` AC-2.2), so a joined value never begins `no-revision:`. **The table has three
   rows and not four, because "absent" is unreachable here** — this table is read only on the entry that observes an unconsumed clearance, and that gate requires `A < H`, hence `H ≥ 1`,
   hence a last line exists. The *absent* case is real one level up, at the region, and is S-12's.

   **Every clearance is answered by exactly one line, including this one.** With nothing written on the S-11 path the clearance would stay unanswered forever, so the **next** halt of any
   kind — a fixed-point halt three rounds later, with no operator action — would meet an unconsumed clearance and be granted a fresh window on the strength of a marker written for an
   unrelated authoring failure; a pipeline that failed to author *k* times would bank *k* free windows. `WINDOW-RESUMED: {W}` keeps the intent — origin unmoved, spent rounds spent,
   operator not charged a window — while restoring `A = H`, and it gives the S-11 path a **positive artifact** to assert on, which absence of a `WINDOW-START:` does not (a loop ignoring
   the clause produces the same absence). A zero-delta round is an **authoring** failure (`pdlc-rcv-fixed-point-stop` AC-2.8); charging the operator's single escape hatch for it would misprice an unrelated failure.

   **Row B — what the run report shows when no round is admitted.** An entry that refuses the phase at
   step 4 opens no round and dispatches nobody, but it still produces one row in the per-round report
   table (catalogue §3), because the operator must be told why the invocation did nothing. `round` =
   **one past the highest round on the branch** — derived from the directory listing alone
   (`deriveRoundWindow`), **not** from `W`, which is 1 on this path by construction and says nothing
   about where the branch got to; on the canonical exhausted-branch fixture no round would have opened
   at all, so the cell is not "the round that would have opened". `panel-shape`, `blocking`,
   `growth-bytes`, `classification` **empty**; `notice` = **S-16 alone**, carrying **no S-4 reason**,
   because no halt was taken on this entry and the budget clause was never evaluated. It is stated
   cell by cell because the mechanical derivation from absent files gives the wrong answer.

The durable observable for all five clauses is what the loop already reads: the cross-review basenames on the branch, plus the POSTMORTEM's single `RESOLVED:` marker and its preserved
`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines. Nothing here needs a clock, a process identity, or a memory of a previous invocation.

**Observability.** `MAX_REVIEW_ROUNDS === 3`; the highest `-v{N}` on the branch never exceeds 3 for a document with no resolved POSTMORTEM; a fourth round never dispatches a reviewer;
the post-mortem contains the literal `3` and the S-4 reason string.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows
and reads two more; it changes none of the others, and a threshold used here and absent there is a
defect.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | owned | The one constant AC-1.2 changes. AC-1.1 makes it absolute per document, not per invocation. |
| `## Reset Region` | that exact heading | owned | S-12. Created by the first halt of a phase, preserved by every later one (AC-1.4 clause 1). |
| `HALT-REASON: {value}` | one line per halt, appended at the end of the region; `{value}` the `; `-joined render in the catalogue §3 precedence order | owned | S-15. `H` is exactly the number of halts taken. |
| `WINDOW-START: {N}` | `{N}` a decimal integer ≥ 1 | owned | S-13. Written by the loop, **never authored by a human**. The prohibition is scoped to *authoring* and exempts both sanctioned repairs of AC-1.5(4): the whole-section deletion for `counts-mismatch`, which zeroes both counts and can only cost windows; and the in-place **correction** of a line the loop wrote, which leaves `H` and `A` untouched. **Deleting a single answering line is forbidden at every `H − A`**, because it lowers `A` alone. |
| `WINDOW-RESUMED: {W}` | `{W}` a decimal integer ≥ 1 equal to the origin then in effect | owned | S-14. Answers a clearance without moving the origin. |
| `reset-region-corrupt: …` | the render fixed in catalogue §2's S-16 row, character for character, and **not repeated elsewhere** | owned | S-16. One notice per entry whatever the fault count. |
| `budget-exhausted: …` | the render fixed in catalogue §2's S-4 row | owned | Rendered with this window's own origin: a clause that hard-codes `rounds 1..3 of 3` is a defect. |
| `no-revision: …` / `fixed-point: …` | as the catalogue fixes them | **read only** | S-11 and S-3, emitted by `pdlc-rcv-fixed-point-stop` (X-05). AC-1.5(5) reads the **leading** reason of the last `HALT-REASON:` line; this REQ emits neither and may not change their grammar. |

## 7. Non-goals and out of scope

The shared list is baseline §4; **N-1, N-2, N-3, N-4, N-7, N-9 and N-10 apply unchanged** and are
not restated. Two are worth pointing at from here, because a reviewer of *this* document is most
likely to file against them:

| # | Not in scope | Why |
|---|---|---|
| **N-4** | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus the one lifecycle change AC-1.4 clause 2 states, which is the fail-closed direction. |
| **N-14** | Specifying the fixed-point test, the zero-delta test, or how a round's blocking count is read. | They are `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that this document never says *when* the loop compares two rounds is **correct and known** — file it there. |
| **N-11** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. A finding that this document does not define `DOC-BYTES:` is **correct and known** — file it as Low. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: it is an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify the **reset-region read-modify-write** AC-1.4 requires: before the halt dispatch the loop reads the existing post-mortem and captures its `## Reset Region` — **the captured region of a file that does not exist is the empty region**, so the first halt creates a one-line region by the same path; after the write it re-applies that region — preserved lines in document order, this halt's `HALT-REASON:` appended last, any prior `RESOLVED:` line stripped — and confirms the result, reporting a lost or unwritable region rather than proceeding on a silently widened window. The region is loop-owned state, so it is **not** discharged by a prompt clause. | TSPEC |
| **O-6** | Specify where AC-1.5(4)'s ordered algorithm runs relative to the phase entry, so that a refusal reaches step G's path (M-7a, M-7b) rather than returning early: the entry-validation halts nearby build their final report directly and never call `recordHaltFn`, and a literal early `return` would therefore leave the queue row unwritten. | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent that `## Reset Region` (S-12) is machine state and must be left alone. At the Citation baseline that prompt is a bare `Write ${postmortemPath}.` plus a section list (M-7e), so nothing tells the agent anything in that file is precious. **It is not the mechanism** — AC-1.4 requires the loop to re-apply the region deterministically (O-5). | FSPEC → implementation |
| **O-10** | Properties and tests for this requirement, including the negative cases named explicitly: **the first halt of a phase** leaving a file with `## Reset Region` and exactly one `HALT-REASON:` line, and the operator's **first** clearance then granting a window; a second halt preserving the region and **stripping** the spent marker so `checkPostmortem` returns `unresolved`; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; a region with two `HALT-REASON:` lines and one `WINDOW-START:` granting **exactly one** further window and a region with `A = H` granting none; an S-11 clearance writing `WINDOW-RESUMED: {W}`, leaving `W` unchanged, with a **subsequent** convergence halt then **not** auto-cleared; a halt **appending** its `HALT-REASON:`, and the loop **appending** its answering line, both asserted positionally, with a prepending implementation failing; `WINDOW-START: 4` then `WINDOW-START: 9` at highest round 6 ⇒ `W = 1`; the S-4 reason rendered from the window's own origin (`rounds 4..6 of 3` after a reset); **the counts-mismatch refusal and its recovery leg as a mutation pair** — a region with two `HALT-REASON:` lines and no answering line refusing on that entry **and on a later entry that has not performed the sanctioned repair**, with `RESOLVED: yes` **not** consumed and `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report, then, after the sanctioned whole-section deletion, the next halt re-creating a one-line region and the operator's **second** clearance opening the window; the same pairing for a **value** repair — a corrected `WINDOW-START:` line, then a later entry that grants the window, with the refusing entry's file byte-unchanged; **the ratchet test** — the refusing entry appends no `HALT-REASON:`, strips no marker, and emits S-16 with the **same** reason on the next entry; **the no-round-admitted row** asserted character for character with **no** S-4 reason; and **the mid-window refusal**, the positive control: on a branch whose highest round is 2 with a corrupt region and a fresh clearance, **no round-3 cross-review file is written**, the report carries row B with `round` = 3 and S-16 alone, and the invocation terminates with the queue row `halted` — an implementation that skips step 4 and falls back to `W` = 1 runs round 3 and fails this leg. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — a five-round per-invocation budget, no enforced stop, no measured growth. The predecessor's Phase R died exactly here, and the superseded parent died of the same cause across nine rounds. | Mitigated by splitting the parent into reviewable documents, by depending on no unmeasured runtime fact (baseline §5), and by keeping this document short. **Accepted and unenforceable** — the enforcement is this REQ and its successor, neither of which has shipped. The operator is asked to watch the trajectory and halt by hand. |
| **R-10** | **The reset region is machine state in a file an operator is instructed to edit.** AC-1.5(4)'s validation exists because a hand-edit can make the counts lie in either direction, and one of those directions restores the per-invocation budget AC-1.1 abolishes — silently and fail-open. | **Mechanised, not accepted.** Step 2 validates every answering line, step 3 validates the counts against each other, and either failure refuses the phase with S-16 rather than guessing. The residual is the operator's: §6 records that `WINDOW-START:` is never *authored* by a human, and AC-1.5(4) names the only two sanctioned repairs. |
| **R-11** | **A refusal costs a mid-window round.** On a branch with rounds left under `W` = 1, a corrupt region refuses the phase where the fallback would have run the next round. | **Accepted deliberately, and stated as the positive control (AC-1.5(4) step 4, O-10).** A region whose accounting cannot be trusted is not a state a review round should be opened over, because the cross-review it produced could not be placed in any window. |

**Deferrals and their binding.** This REQ defers nothing of its own. The deferrals its predecessor
carried belong to the successors that carry the criteria raising them:
cross-panel comparability and finding identity to
`docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`, and the
authoring-side zero-write residue to
`docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`; both are recorded in
`pdlc-rcv-fixed-point-stop` §9. Each stub is `ready: false`, so neither is queue-eligible until an
operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e | P-1 (cost half) | US-01, US-02, US-04 | O-5, O-6, O-9, O-10, O-11 |

**Why this document carries one requirement and not two.** v1.0 carried REQ-RCV-01 and REQ-RCV-02
together and measured **581 lines / 83 KB** — beyond the 60 KB REQ size ceiling, and therefore
beyond what the review loop converges on. v1.1 cuts at the seam the two requirements already had:
this REQ defines the **window** (the budget, its origin `W`, the reset region and the halt path),
and `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` states the two **tests**
evaluated inside it. The ordering argument v1.0 gave for keeping them together — *`W` must exist
before AC-2.1, AC-2.8 or AC-2.6 can be stated over a window* — is preserved exactly, as a
`depends-on` edge rather than as a shared document: the successor ships second. No requirement id,
AC id or `S-*` id changed in the cut, so every existing cross-reference resolves.

**Round-by-round history is deliberately not restated here.** The nine review rounds that produced
this material live in `docs/discarded/pdlc-review-convergence/CROSS-REVIEW-*-REQ-v{1..9}.md` alongside the
superseded parent; those files remain the record of which finding produced which clause. This REQ
traces to the *measured facts*, not to the review history.
