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
| Siblings | `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02) — **the successor that depends on this one**; `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 2 and 3; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.3 | 2026-08-01 |

**v1.3** addresses round-2 cross-review (`CROSS-REVIEW-software-engineer-REQ-v2.md`,
`CROSS-REVIEW-test-engineer-REQ-v2.md`): the unconfirmable-append render (AC-1.5(4), §6), O-10's
oracle for the refusal's operator strings and `postmortemStatus`, §6's scope statement for its
non-baseline rows, and the Low corrections in §4, §7, AC-1.2, AC-1.5(1), step 5 and O-10.
**v1.2** addressed round 1.

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and
what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so a document can be reviewed six times across two
  invocations with no operator action at all.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count reached its minimum at round 2, held it at round 3, and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB —
  40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the escape hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset
  leaving no record is re-granted every invocation — the per-invocation budget restored silently and fail-open.

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

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving alone and
unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from
one constant. It is the only member of the family whose saving is not contingent on a regime.
**Operator-visible surfaces:** the budget in the run report and the post-mortem's Iterations table;
the `## Reset Region`; and the two no-round rows — row C, the zero-round budget halt (AC-1.5(1)),
and row B, the step-4 refusal (AC-1.5(4)) — each saying why an invocation did nothing.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | `docs/completed/pdlc-review-loop-hardening/` exists there with that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-1.4 and AC-1.5's refusal path are stated over exactly that shape |

**Both hold on the default branch** at `9486c81`, each checkable by the observable in its Resolution-form column. No fallback is offered if that upstream mechanism is later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family** — nothing it needs is owed by a sibling, which is why
`depends-on` is empty. One clause reads a string a successor emits:

| # | Owed by | What this REQ reads | Behaviour until it ships |
|---|---|---|---|
| **X-05** | `pdlc-rcv-fixed-point-stop` REQ-RCV-02 AC-2.8 — the S-11 halt reason `no-revision: …` | AC-1.5(5)'s first table row, which resumes rather than resets the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. The clause is stated over both from the start, so nothing is re-specified when the successor lands. |

**Consequence for sequencing.** This REQ is deliverable alone: every branch's behaviour is fully
determined without a successor — though one branch, the
mid-window refusal, is only **reachable in production** once the successor ships, and its test
fixture is synthetic until then (AC-1.5(4) step 4, O-10). `pdlc-rcv-fixed-point-stop` depends on this
REQ because both its tests are stated over `W`; `pdlc-rcv-panel-topology` depends on both.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *current window* / round `W`, *reset region*,
*zero-delta*, *panel shape*, *crashed* round, *blocking count*, *unavailable*, *malformed*, *phase
refusal*, *approval refusal* — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and is
**not** restated here. The same file's §2 holds the closed catalogue `S-1 … S-17` and its §3 the
run-report row schema.

This REQ **owns** six catalogue ids and **reads** two:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-12** `## Reset Region` | owned | AC-1.4 clause 1 creates and preserves it; AC-1.5(4) reads it |
| **S-13** `WINDOW-START: {N}` | owned | AC-1.5(4)'s answering line on a convergence-halt clearance |
| **S-14** `WINDOW-RESUMED: {W}` | owned | AC-1.5(5)'s answering line on an S-11 clearance |
| **S-15** `HALT-REASON: {value}` | owned | Written by every halt in AC-1.4's scope; read by AC-1.5(5) |
| **S-16** `reset-region-corrupt: …` | owned | AC-1.5(4) step 4's report notice |
| **S-4** `budget-exhausted: …` | owned | AC-1.5(1)'s halt reason, rendered from the window's origin |
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
| **First round of the current window** `W` | AC-1.1, AC-1.5(4); `pdlc-rcv-fixed-point-stop` AC-2.1 and AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region** — the **greatest** value present, and only if every line validates **and** `H − A ∈ {0, 1}` (AC-1.5(4)). Lines are appended, so document order is event order | Treated as **1** — no reset in effect, AC-1.1's cap applies from round 1. Fail-closed: an absent, unparseable, non-increasing or out-of-range value never widens the window. **Survives a second halt**, since AC-1.4 preserves the region |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt answered; nothing written, nothing granted. `H − A ∉ {0, 1}` ⇒ counts corrupt ⇒ `W` = 1, S-16 reported, and **the entry refuses the phase and returns without taking a halt**, so the marker survives and neither count moves. `H` is exactly the number of **post-mortem-writing halts of this phase for this document** (AC-1.4's scope): every such halt writes one `HALT-REASON:` line, including the creating halt |
| **That the post-mortem is readable at all** | AC-1.4, AC-1.5(4) | The file itself | An **unreadable-but-present** post-mortem is read by `checkPostmortem` as `status: "none"` (M-7a) ⇒ no halt in force **and** an empty region ⇒ `H = A = 0`, `W = 1` — the narrowest window, no clearance honoured, nothing written. The halt-gate half is the shipped reader's, unchanged (N-4) |
| **Whether the operator has cleared the current halt** | AC-1.4's re-entry gate (shipped), AC-1.5(4) | The **single** `RESOLVED:` line, read by `parseResolvedMarker` and mapped by `checkPostmortem` (M-7a) | absent, `no`, unparseable **or duplicated** ⇒ the phase is refused — the shipped fail-closed gate, unchanged. AC-1.4 keeps it exact by having each halt **strip** any prior `RESOLVED:` line |
| **Which halt a POSTMORTEM records** | AC-1.5(4), AC-1.5(5) | The **last** `HALT-REASON: {string}` line in the region (S-15) — one per halt, appended, so document order is halt order | Read as a convergence halt (S-3/S-4) — fail-closed, so an unreadable reason never converts a consuming reset into a free one |


## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who / Given / When / Then form and is stated
over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

A review loop that has not converged in three rounds has, on the two features measured, not converged at all (§1: the blocking count 11, 6, 6, 7, 9, and 66 KB added by rounds that ran
after the fixed-point test fired). Three rounds buys the decay that was real (11 → 6) and the round that held it, and declines to buy the rise that followed.

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — the phases of
`PHASE_DISPATCH`: R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES (M-1d). *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: `docType: null` loops are out.** Phase CR calls the same `reviewLoop` with `docType: null`
(`orchestrate-dev.js:4720`–`:4721`) and Phase DOD runs its own loop; N-7 excludes both and **this REQ
does not change that**. For such a loop, AC-1.1's per-document window, AC-1.4's reset region and
AC-1.5's `W`, clearance accounting and refusal **do not apply**. What does reach them is AC-1.2's
constant, which they share: their **per-invocation** budget becomes 3 instead of 5 — unchanged in
kind, still bounded. This is stated rather than left to FSPEC because the other reading is unsafe:
with `docType: null` no basename matches, so `deriveRoundWindow` always returns `startIndex = 1`, and
a second CR clearance would recompute `N = 1`, fail step 2's strictly-increasing check, and refuse
Phase CR **permanently and unrepairably**. Test: no `## Reset Region` is created by a CR or DOD halt.

This is a **second behavioural change**. At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation budget* (M-1d): a phase re-entered at highest round 3 is admitted rounds 4…6, so the document is
reviewed six times and §2's cost claim would bound nothing. AC-1.5 states the replacement rule and its escape hatch.

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
`W ≠ startIndex`, so they must be removed or made unreachable.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — the value of `MAX_REVIEW_ROUNDS`, 3 at the declared default
(§6) — so a halt saying "5" while the budget is 3 is a defect. `iterations` is the **budget**, not the rounds run, which is what the shipped site returns (M-1c). Because AC-1.5(1) makes a
**zero-round** halt the commonest new case, the Iterations section additionally states the **rounds this entry ran** — `0` there — so the two are never conflated in the one place an
operator reads them. Both are asserted **over the constant**, never the literal `3`.

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed**, unversioned path, so a document that
halts twice has its post-mortem written twice, and the reset region (catalogue §1, S-12) lives there.

**The scope of "every halt".** The rule below is quantified over **every halt that writes
`POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope) — at HEAD
exactly one code path, the review loop's non-convergence halt (M-7e). It is **not** quantified over
the pipeline's other halt classes — creator-agent failure, the branch guard, a listing failure, Phase
PUB/CI, Phase DOD — none of which writes a post-mortem at HEAD, and none of which this REQ asks to
start (that would violate N-4); nor over the phases N-7 excludes. So §4.1's *"`H` is exactly the
number of halts this document has taken"* means **post-mortem-writing halts of this phase for this
document** — the only halts that leave a marker for a clearance to clear, which is what makes the
pairing exact. Within that scope the rule admits **no exception**:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt that finds **no existing post-mortem** — the first halt of a phase, which is the halt that creates
   the file — **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt that finds an existing post-mortem **preserves** the region — every `WINDOW-START:`
   (S-13), `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` to the end of that region**, nothing above or
   between the preserved lines. Both cases are one rule under O-5's read-modify-write: the captured region of a file that does not exist is the **empty region**, so re-applying it plus this
   halt's line yields a one-line region. So `H` is **exactly the number of halts in AC-1.4's scope**, on every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* is the most recent halt's.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever in the file it sits. The new post-mortem is therefore **unresolved on arrival**, and the
   operator must clear *this* halt before the phase runs again. The strip is scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to
   the gate either way, so the scoping changes no decision and stops the halt path editing prose inside a human's code fence.
   **The strip reaches inside the `## Reset Region` span too, and the two rules do not collide:** a `RESOLVED:` line is *never* a region line — the region is read as `HALT-REASON:`,
   `WINDOW-START:` and `WINDOW-RESUMED:` lines only (catalogue §1) — so the two rules quantify over disjoint sets. A `RESOLVED: yes` written inside the region is stripped like any other.

**Why the creating halt is stated.** Scoped only to a halt finding an existing post-mortem, the first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ AC-1.5(4)'s gate `A < H`
false ⇒ the operator's **first** clearance silently swallowed, the phase halting again, self-healing on the second.

**Why clause 2.** `RESOLVED:` is a **single-valued, human-owned, fail-closed marker**, never a counter (M-7a). A preserved `RESOLVED: yes` makes the next halt's post-mortem read as already
resolved, so the halt has no durable effect; a *second* one reads as `duplicated` ⇒ permanently `unresolved` ⇒ the phase can never be re-entered — the only two reachable states of the
alternative, and opposite failures. **The prohibition is untouched:** removing a marker already spent is not writing one (N-4).

**The region is maintained by the loop, not by an agent's diligence.** At the Citation baseline the halt path dispatches an agent with a bare `Write {path}` prompt and no preservation
obligation (M-7e). The loop reads the existing file before the dispatch and **re-applies** the region after it: preserved lines, this halt's appended `HALT-REASON:`, any prior `RESOLVED:`
stripped. O-5 carries that read-modify-write; O-9's prompt clause is belt-and-braces, not the mechanism.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch — the
state `deriveRoundWindow` reads (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the window's **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch
   whose highest existing round is 2 is admitted **round 3 only**, and a branch whose highest existing round is 3 or more is admitted **no rounds** and halts immediately on the budget path
   (AC-1.4), emitting S-4 rendered as `rounds {W}..{windowEnd(W)} of {MAX_REVIEW_ROUNDS}` — the three slots are **computed from the constant**, never written as the literal `1..3 of 3`
   (§6). **This clause is not reached on an entry whose reset region failed validation**: step 4 refuses the phase and returns before the budget is evaluated, so no halt is taken and no S-4
   reason is emitted on that entry.

   **The zero-round budget halt has a report row, and it is row C** — the **third** dispatch-less row,
   stated cell by cell here as the catalogue requires of the REQ owning the condition, because the
   per-round table would otherwise be empty for the commonest new halt.
   `round` = **one past the highest round of this document type on the branch** (from the
   listing); `panel-shape`, `blocking`, `growth-bytes`,
   `classification` **empty**, nothing having been dispatched or measured; `notice` = this halt's
   **S-4** reason, `; `-joined with any co-occurring reason in catalogue §3 precedence order. Rows B
   and C are mutually exclusive: row B's entry takes no halt, row C's takes one;

   **`forcePhases` does not grant a window; the clearance is the only route past the cap.**
   `forcePhases` overrides a **recorded approval** and nothing else (`CLAUDE.md`, *Entry (single
   feature)*), so a forced Phase R on a document already at round 3 is admitted **no rounds**: it halts
   on the budget path, writes the post-mortem and row C, and writes the queue row `halted` — it does
   not re-review, and a second force changes nothing, because at `A = H` a marker grants nothing. This
   is a deliberate change to a documented operator entry point, stated so it has an oracle. The
   supported sequence after an exhausted document is *clear the post-mortem, then re-enter*;
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
   (M-1d), never over the whole directory listing. A feature directory holds cross-reviews for several
   document types at once, and the two readings differ on a constructible fixture (a Phase F region
   carrying `WINDOW-START: 4` with two FSPEC rounds and five REQ rounds: doc-type-scoped ⇒ invalid ⇒
   permanent refusal; whole-listing ⇒ granted). One reading has to be named because it decides a
   refusal, and it is the doc-type-scoped one, because a window is a property of a document.

   **The answering line is written, and confirmed, before the window opens.** That append is the write
   making `A = H`, and the *sole* mechanism keeping the clearance one-shot; a lost append re-grants a
   fresh window on every invocation — the fail-open this criterion exists to close. It therefore
   carries the **same confirmation obligation AC-1.4 puts on the post-mortem
   write**: the loop re-reads the file and confirms the line is present, in the region, at the end,
   **before any round of that entry is dispatched**. When the confirmation fails, **fail closed**: no
   window is opened (`W` keeps its prior value), no round is dispatched, and the entry **refuses the
   phase** on step 4's path. It mints **no new catalogue id and no new S-16 reason** (that enum is
   closed at three): an unconfirmable write is an IO fault of the loop, not a state of the region.
   **Its render is stated here, because step 4's own renders all take an S-16 reason this entry has
   not got** (the region passed steps 1–3): it emits row B's **unconfirmable-append variant** (§5,
   catalogue §3) — `notice` **empty**, no S-16, no S-4 — its ❌ text is §6's *Unconfirmed-append text*,
   and its recovery text is the **shipped generic** *"set the `{feature}` row in
   `docs/_queue/QUEUE.md` back to pending, then re-run the queue"* (`orchestrate-dev.js:4926`),
   deliberately reused **here and nowhere else in this REQ**: the fault is transient, there is nothing
   to hand-repair, and step 4's path has already written the queue row `halted`, so resetting that row
   is the whole of the repair. That is the opposite disposition to the corrupt-region row, which
   forbids the same string because re-running reproduces its refusal — an asymmetry O-10 pins.
   Two step-4 invariants are **scoped to the validation-failure path** and do **not** hold here: the
   file is not byte-unchanged (a partial append may have landed — that is what unconfirmable means),
   and the ratchet's *same reason next entry* has no reason to be stable. **Three** outcomes, all
   safe: if the line landed whole, `A = H` and the next entry grants nothing; if nothing landed, the
   next entry re-observes the same clearance and grants the one window paid for, never two; and if the
   write **tore** — a truncated line, or a value without its newline — the next entry reads it as a
   value fault at step 2 ⇒ S-16 `invalid-window-start`/`invalid-window-resumed` ⇒ the *corrupt-region*
   refusal, with its own ❌ and recovery texts and the sanctioned in-place **correction** (or
   whole-section deletion) applying to it like any other invalid value. Never two windows on any of
   the three; only the torn-write outcome needs an operator, and it says so on the next entry.

   **Consequence an operator will meet:** an invocation that confirms the line and then dies before
   dispatching round `W` has **spent the clearance** (`A = H`) while the window at `N` is intact and
   unspent; the next entry needs no new window and runs those rounds. That is why the line is written
   first — writing it last loses the record of a window already *used*, and re-grants it.

   **Answering lines are appended, like `HALT-REASON:` lines** — step 2's validation reads what comes *before* each line, so it is order-sensitive. Under a
   prepending implementation a `WINDOW-RESUMED: 4` can land ahead of the `WINDOW-START: 4` it answers, which fails step 2 ⇒ `W = 1` for the rest of the document's life, since AC-1.4 clause
   1 preserves the region verbatim on every later halt — closed but **absorbing**, and no clearance repairs it.

   **A region that fails validation does not spend the clearance**, which is why validation is a conjunct of the gate, not merely a constraint on `W`. Without it, two
   `HALT-REASON:` lines and one **invalid** `WINDOW-START:` give `A < H`, so the loop writes an answering line and consumes the clearance while `W` is still 1 — permanently, since nothing
   removes a line.

   **A refusal is not a halt: the entry returns without running the rest of AC-1.5.** Left running, clause 1 would halt on the budget path, and
   AC-1.4 governs **every** halt, so that halt would append its own `HALT-REASON:` (`H += 1`) and strip the operator's `RESOLVED:` — spending the clearance it declined to spend.
   Therefore, when step 4 refuses:

   - the entry **takes no halt**: it does not evaluate clause 1's budget, writes no `HALT-REASON:` line, writes no post-mortem, and AC-1.4 does not fire, so `H` is unchanged;
   - the operator's `RESOLVED:` marker is **left in place**, unstripped, so `checkPostmortem` still reads `resolved` on the next entry;
   - the post-mortem file is **byte-unchanged**; *scoped to that file*, the entry's only effect is the S-16 notice on row B. It is no claim about the rest of the invocation;
   - the operator-facing text is **this refusal's own**, not step G's. Reusing step G's row would tell the operator the opposite of the truth: step G refuses because the marker is
     *unresolved*, whereas step 4 fires on a post-mortem the operator **did** resolve. The ❌ phase row therefore reads `Refused — reset region corrupt at {path} ({reason})`, `{reason}`
     being the S-16 reason, and the halt reason carried to the run report and the queue **names the sanctioned repair for that reason** (AC-1.5(4)'s repair table) instead of the shipped
     generic *"set the row back to pending, then re-run the queue"*, which on this path reproduces the refusal on every iteration. `postmortemStatus` reads `resolved` — the operator did clear it — or is unset; **never** `unresolved`.
     These two strings are operator-facing renders of S-16, declared in §6; they are **not** new catalogue ids, and no other new string is minted;
   - the phase is **refused, not halted** — a *phase refusal* in the catalogue §1 sense, the same shape as step G's refusal of an unresolved post-mortem. *Returns* means **the phase does not run and
     the invocation terminates on step G's path**: a ❌ phase row is recorded, the pipeline stops, and the feature's `docs/_queue/QUEUE.md` row is rewritten to `halted` and committed — the
     queue write is reached *because* the refusal is step-G-shaped (M-7a, M-7b), where a literal early `return` would not reach it (the entry-validation halts nearby build their report
     directly and never call `recordHaltFn`). That is intended: the region needs an operator, so an unattended queue must stop rather than refuse once per iteration.

   **The sanctioned repair is the operator's, and it is the only hand-edit this document asks for to machine-written state.** When the run report emits S-16 the region is
   **human-repairable**, per reason:

   | Reason | What the notice names | The sanctioned repair |
   |---|---|---|
   | `invalid-window-start` | the offending `WINDOW-START:` line | **correct that line** — never delete an answering line |
   | `invalid-window-resumed` | the offending `WINDOW-RESUMED:` line | **correct that line** — never delete an answering line |
   | `counts-mismatch` | the pair `H`/`A` — **no line** | delete the **whole `## Reset Region` section**, heading included |

   **Correcting is the only sanctioned value repair, and deleting an answering line is forbidden at every `H − A`.** Deleting an answering line decrements `A`, so it raises `H − A` by one,
   and both reachable values of that arithmetic are unsafe:

   | Region before | Marker on disk | Repair | Region after | What the next entry does |
   |---|---|---|---|---|
   | `H = 2`, `A = 1`, `WINDOW-START: 99` (`H − A = 1`) | either | delete the line | `H = 2`, `A = 0` ⇒ `H − A = 2` | refuses under a **different** reason, `counts-mismatch`, whose only repair is the destructive whole-section deletion |
   | `H = 1`, `A = 1`, `WINDOW-START: 99` (`H − A = 0`) | yes — the refusal left it in place | delete the line | `H = 1`, `A = 0` ⇒ `A < H` | **grants a fresh three-round window** off a clearance that was already answered, and writes `WINDOW-START:` |
   | either row above | either | **correct** the value | counts unchanged | `A < H` unchanged ⇒ no window is banked; the phase proceeds under the accounting the loop wrote |

   The second row is the hand-edit §6's `WINDOW-START:` prohibition exists to prevent: lowering `A` while leaving `H` restores `A < H` with the marker untouched, and `A` exists precisely
   to make a clearance one-shot. **Correcting is safe at every `H − A`** — both counts stay true, and any repair leaving `H − A ∉ {0, 1}` is rejected by the counts check.

   **Why `counts-mismatch` is repaired by deletion, not by editing a line.** The fault is lines *missing* or *surplus*, so no line is offending, and both repairing edits are forbidden
   elsewhere: **adding** an answering line contradicts §6, **deleting** a `HALT-REASON:` contradicts AC-1.4 clause 1. Deleting the **section** contradicts neither: S-12 reads an absent
   heading as the empty region, `H = A = 0`, `W = 1` — the never-reset state. The next halt re-creates a one-line region and the clearance after it works, at a cost of one further halt and
   the halt history.

   Receive side, an **ordered algorithm** rather than independent rows, because DC-01 requires it total **and single-valued**. Given the region, the loop:

   1. collects every `HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` line in it, in document order, giving the counts `H` and `A`;
   2. **validates every one of the answering lines' values.** A `WINDOW-START:` value is valid iff it is a decimal integer ≥ 1, strictly greater than every `WINDOW-START:` value before it,
      and no greater than one past the highest round on the branch. A `WINDOW-RESUMED:` value is valid iff it is a decimal integer ≥ 1 equal to the greatest `WINDOW-START:` value before it,
      or to 1 if there is none;
   3. **validates the two counts against each other:** `H − A` must be **0 or 1**. `A > H` means more clearances have been answered than halts have been taken — which only a hand-edit
      produces, since the loop writes at most one answering line per halt; `A < H − 1` means a halt is recorded whose clearance no line answers, reachable only if a line was removed. Both are
      corruption of the counts, not of a value;
   4. **if any line's value fails step 2, or the counts fail step 3 ⇒ `W` = 1, fail-closed**, no reset is honoured, **no answering line is written and the clearance is not consumed**, and the
      run report emits `reset-region-corrupt: {reason}` (S-16) naming the file and, per reason, the offending **line** or the pair `H`/`A`. **Exactly one S-16 notice is emitted, whatever the
      fault count**: `{reason}` belongs to the **first failing line in document order**, and `counts-mismatch` only when every line passes step 2, so two notices never co-occur in the row's
      `; `-joined `notice` cell. A corrupt region is never partially believed. **The entry then refuses the phase and returns**, per *a refusal is not a halt* above.
      **Where `W`'s resolution runs: after the phase gate's skip decision, before any round opens.**
      `phaseGate` can exit `{ skip: true }` on an approved-and-fresh document (`orchestrate-dev.js:4213`–`:4225`); on that exit **neither step 4 nor the grant runs** — `W` is not resolved,
      no answering line is written, no refusal is raised. A skipped phase reviews nothing, so a refusal there would halt the pipeline indefinitely over a phase no repair gains a round for,
      and a grant there would spend the one-shot clearance on an entry that opens no round: both pure cost. The resolution therefore runs **inside the phase body that is going to review**,
      which is also what keeps a refusal on step G's path (O-6). Within that body the refusal is **unconditional** — it fires whether or not rounds remain in an already-granted window and
      whether or not a marker is pending. Three entry classes, the third being the skip; the justification is **fail-closed, not costless**:
      - On a **skipped** entry the algorithm does not run; the region is untouched and both counts unmoved.
      - On an **exhausted** branch — highest round ≥ 3 under `W` = 1 — the outcome is the same either way: the fallback admits `{1, 2, 3}`, all three are filled, and the entry would have halted
        on the budget path regardless. There the refusal is *indistinguishable* from the fallback.
      - On a **mid-window** branch with rounds remaining under `W` = 1 — reachable at highest round **2**, since `pdlc-rcv-fixed-point-stop` AC-2.1 can fire on the (1, 2) pair and its AC-2.8 can halt at round 2, either of
        which creates the region with `H = 1`, `A = 0` before a hand-edit corrupts it — the fallback would admit **round 3** and the phase would run. Step 4 refuses instead: no round-3
        cross-review file is written, the invocation terminates on step G's path and the queue row is written `halted`. That is a real cost, accepted deliberately (R-11). This is the refusal's **positive control**
        — the only branch on which honouring step 4 and falling back are distinguishable — and O-10 carries it; row B's `round` cell is stated over exactly this branch. **Its fixture is
        synthetic while this REQ ships alone, and that is stated rather than glossed:** both halts that can create a region at highest round 2 (`pdlc-rcv-fixed-point-stop` AC-2.1, AC-2.8)
        belong to a successor (X-05), so until it ships the only region-creating halt is the budget halt, which by construction fires on a full window. The mid-window state is therefore
        **hand-built** — a legitimate, fully-specified test fixture, not a reachable operating state — and O-10 must construct it as such. This does not weaken §3.1's claim that AC-1 is
        *fully determined* without a successor: every branch's behaviour is stated; one of them is only **reachable in production** once the successor lands;
   5. otherwise `W` = the greatest `WINDOW-START:` value present, or **1** if there is none — read
      **after** any answering line this entry confirmed, so on a granting entry step 5 and clause 4
      agree that `W` = `N`. The grant is part of the algorithm, not a separate rule beside it.

   **`H − A ≤ 1` is the invariant clause 4's "exactly one answering line" relies on**, and step 3 gives it a stated domain: it holds on every path the document generates, and a refused
   entry leaves both counts unchanged. Validating rather than assuming matters because the region sits in a file the
   operator is *instructed* to edit — on two `HALT-REASON:` lines and no answering line every value-level check passes vacuously, and the loop would grant `H − A − 1` windows
   beyond the one paid for, on every invocation, fail-**open**.

   **Step 2's range check is re-evaluated on every read, against the current listing**, not fixed at write time. `harvest-learnings` deletes `CROSS-REVIEW-*` and `POSTMORTEM-*` together, so
   the ordinary path never sees a region outliving its rounds; a sequence that removes the cross-reviews while the post-mortem survives lands in the fail-closed case — S-16, sanctioned
   repair, no clearance spent. Both halves are load-bearing: without the anchor, nothing records which rounds preceded the marker; without consumption, `RESOLVED: yes` re-grants a window on
   every subsequent invocation;

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

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3 or S-4 (`pdlc-rcv-fixed-point-stop` AC-2.2), so a joined value never begins
   `no-revision:`. **The table has three rows, not four: "absent" is unreachable** — it is read only on an entry observing an unconsumed clearance, whose gate requires `A < H`, hence
   `H ≥ 1`, hence a last line exists. The *absent* case is the region's, one level up, and is S-12's.

   **Every clearance is answered by exactly one line, including this one.** With nothing written on the S-11 path the clearance stays unanswered forever, so the **next** halt of any
   kind banks a free window on a marker written for an unrelated authoring failure — *k* authoring failures, *k* free windows. `WINDOW-RESUMED: {W}`
   keeps the intent — origin unmoved, spent rounds spent, no window charged — while restoring `A = H`, and gives the S-11 path a **positive artifact** to assert on. Same confirmation
   obligation and fail-closed disposition as `WINDOW-START:`.

   **Row B — the report row of a step-4 refusal, in two variants.** The entry opens no round and
   dispatches nobody, but still produces one row (catalogue §3), because the operator must be told why
   the invocation did nothing. `round` = **one past the highest round of this document type on the
   branch**, from the listing (`deriveRoundWindow`), **never** from `W` (1 on the validation-failure
   variant, unchanged on the unconfirmable-append one — neither is this cell); `panel-shape`,
   `blocking`, `growth-bytes`, `classification` **empty**; `notice` = **S-16 alone** on the
   **validation-failure** variant and **empty** on the **unconfirmable-append** one, with **no S-4
   reason** on either, no halt having been taken. The variants are told apart by §6's two ❌ texts.

The durable observable for all five clauses is what the loop already reads: the cross-review basenames on the branch, plus the POSTMORTEM's single `RESOLVED:` marker and its preserved
`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines. Nothing here needs a clock, a process identity, or a memory of a previous invocation.

**Observability.** `MAX_REVIEW_ROUNDS === 3`; the highest `-v{N}` for a document with no resolved POSTMORTEM never exceeds 3; on the entry past the window the **reviewer-dispatch seam is
called 0 times** (a count, not an absence — O-10) and no new cross-review file appears; the post-mortem carries the budget and the S-4 reason string.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows
and reads two more; it changes none of the others, and a threshold used here and absent there is a
defect. **Four rows below sit deliberately outside baseline §3's scope and are not that defect:**
`budget-exhausted:` is a render fixed by catalogue §2, and the three refusal-render rows are
non-catalogue operator strings this REQ alone owns. Both have a registered authority — the catalogue,
or this table.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | owned | The one constant AC-1.2 changes. AC-1.1 makes it absolute per document, not per invocation. |
| `## Reset Region` | that exact heading | owned | S-12. Created by the first halt of a phase, preserved by every later one (AC-1.4 clause 1). |
| `HALT-REASON: {value}` | one line per halt, appended at the end of the region; `{value}` the `; `-joined render in the catalogue §3 precedence order | owned | S-15. `H` is exactly the number of halts taken. |
| `WINDOW-START: {N}` | `{N}` a decimal integer ≥ 1 | owned | S-13. Written by the loop, **never authored by a human**. Scoped to *authoring*, so it exempts AC-1.5(4)'s two sanctioned repairs — whole-section deletion (zeroes both counts) and in-place **correction** (leaves both untouched). **Deleting a single answering line is forbidden at every `H − A`**, because it lowers `A` alone. |
| `WINDOW-RESUMED: {W}` | `{W}` a decimal integer ≥ 1 equal to the origin then in effect | owned | S-14. Answers a clearance without moving the origin. |
| `reset-region-corrupt: …` | the render fixed in catalogue §2's S-16 row, character for character, and **not repeated elsewhere** | owned | S-16. One notice per entry whatever the fault count. |
| `budget-exhausted: …` | the render fixed in catalogue §2's S-4 row | owned | Rendered from `W` and the constant: a clause that hard-codes `rounds 1..3 of 3` is a defect. |
| Refusal phase-row text | `Refused — reset region corrupt at {path} ({reason})` | owned | The ❌ row of a step-4 refusal. **Not a catalogue id** — an operator-facing render of S-16, distinct from step G's `Refused — unresolved POSTMORTEM at …`, which on this path would state the opposite of the truth. `postmortemStatus` is not `unresolved` here. |
| Refusal recovery text | names the sanctioned repair for `{reason}` (AC-1.5(4)'s repair table) | owned | Replaces the shipped generic *"set the row back to pending, then re-run the queue"* on this path only, which otherwise reproduces the refusal every iteration. Also **not** a catalogue id. |
| Unconfirmed-append text | `Refused — answering line unconfirmed at {path}` | owned | The ❌ row when the answering-line write cannot be confirmed (AC-1.5(4)): row B with an **empty** `notice`, recovery text *re-run*. **Not a catalogue id**: the region is not corrupt, so no S-16 reason binds. |
| `no-revision: …` / `fixed-point: …` | as the catalogue fixes them | **read only** | S-11 and S-3, emitted by `pdlc-rcv-fixed-point-stop` (X-05). AC-1.5(5) reads the **leading** reason of the last `HALT-REASON:` line; this REQ emits neither and may not change their grammar. |

## 7. Non-goals and out of scope

The shared list is baseline §4, which defines **N-1 … N-10 only**; all of `N-1, N-2, N-3, N-4, N-7,
N-9, N-10` apply unchanged and are not restated, and `N-5`, `N-6` and `N-8` are **inapplicable to
this REQ, not overlooked**. **Ids above `N-10` are not shared.** Earlier drafts
of this document tabled `N-14` and `N-11` as though baseline §4 defined them; it does not, and the
family has minted colliding `N-1x` ids in that namespace (`N-13` means different things in
`pdlc-rcv-fixed-point-stop` §7 and `pdlc-rcv-finding-quality` §7). This document's own non-goals are
therefore numbered in a **per-REQ namespace, `NB-*`**, which cannot be mistaken for the shared one;
the shared row it restates keeps its shared id. Four are worth pointing at, because a reviewer of
*this* document is most likely to file against them:

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus the one lifecycle change AC-1.4 clause 2 states, which is the fail-closed direction. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Restated here because AC-1.1 now says so explicitly: `docType: null` loops keep a per-invocation budget, take the new value of the shared constant, and get no reset region. |
| **NB-1** | Specifying the fixed-point test, the zero-delta test, or how a round's blocking count is read. | They are `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that this document never says *when* the loop compares two rounds is **correct and known** — file it there. |
| **NB-2** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. A finding that this document does not define `DOC-BYTES:` is **correct and known** — file it as Low. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: it is an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify the **reset-region read-modify-write** AC-1.4 requires: before the halt dispatch the loop captures the existing `## Reset Region` — **the captured region of a file that does not exist is the empty region**, so the first halt creates a one-line region by the same path; after the write it re-applies it — preserved lines in order, this halt's `HALT-REASON:` last, any prior `RESOLVED:` stripped — and confirms the result, reporting a lost or unwritable region rather than proceeding on a silently widened window. The region is loop-owned state, so it is **not** discharged by a prompt clause. A crash **between** the dispatch and the re-apply leaves the region missing or truncated: both land in the fail-closed direction (`W` = 1, or S-16 and a sanctioned repair), `H` then understating the halts by at most the lost lines, and the recovery is the ordinary one — the next halt re-creates the region. | TSPEC |
| **O-12** | Specify the **answering-line append and its confirmation** on the *granting* path (AC-1.5(4)) — the read-modify-write is O-5's for the halt path, and this is its counterpart for the entry that grants or resumes a window: append one `WINDOW-START:`/`WINDOW-RESUMED:` line at the end of the region, re-read to confirm it, and dispatch no round until it is confirmed; on an unconfirmable write take the stated fail-closed exit (no window, no round, phase refused, reported like a lost region). Also specify how `W` reaches `deriveRoundWindow` as a **resolved value** so that function and `windowEnd` keep their synchronous, seam-free contract (AC-1.2). | TSPEC |
| **O-6** | Specify where AC-1.5(4)'s ordered algorithm runs *within the phase body* — the REQ fixes it **after** `phaseGate`'s `{ skip: true }` exit and before any round opens (AC-1.5(4)) — so that a refusal reaches step G's path (M-7a, M-7b) rather than returning early: the entry-validation halts nearby build their final report directly and never call `recordHaltFn`, and a literal early `return` would therefore leave the queue row unwritten. | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent `## Reset Region` (S-12) is machine state to be left alone — at the Citation baseline it is a bare `Write ${postmortemPath}.` plus a section list (M-7e). **It is not the mechanism**; O-5 is. | FSPEC → implementation |
| **O-10** | Properties and tests for this requirement, including the negative cases named explicitly: **the first halt of a phase** leaving a file with `## Reset Region` and exactly one `HALT-REASON:` line, and the operator's **first** clearance then granting a window; a second halt preserving the region and **stripping** the spent marker so `checkPostmortem` returns `unresolved`; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; a region with two `HALT-REASON:` lines and one `WINDOW-START:` granting **exactly one** further window and a region with `A = H` granting none; an S-11 clearance writing `WINDOW-RESUMED: {W}`, leaving `W` unchanged, with a **subsequent** convergence halt then **not** auto-cleared; halt lines and answering lines both **appended**, asserted positionally, with a prepending implementation failing; `WINDOW-START: 4` then `WINDOW-START: 9` at highest round 6 ⇒ `W = 1`; the S-4 reason rendered from the window's own origin, its slots computed from `W`, `windowEnd` and the constant (the `rounds 4..6 of 3` shape is **illustrative**, never a literal expectation); **the counts-mismatch refusal and its recovery leg as a mutation pair** — a region with two `HALT-REASON:` lines and no answering line refusing on that entry **and on a later entry that has not performed the sanctioned repair**, with `RESOLVED: yes` **not** consumed and `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report, then, after the sanctioned whole-section deletion, the next halt re-creating a one-line region and the operator's **second** clearance opening the window; the same pairing for a **value** repair, with the refusing entry's file byte-unchanged; **the ratchet test** — the refusing entry appends no `HALT-REASON:`, strips no marker, and emits S-16 with the **same** reason next entry; **row B** asserted character for character with **no** S-4 reason; **the refusal's own operator strings** (§6) — the ❌ text `Refused — reset region corrupt at {path} ({reason})` and a recovery text naming *that reason's* sanctioned repair, both asserted character for character, with step G's shipped strings (`Refused — unresolved POSTMORTEM at …` and `set the row back to pending, then re-run the queue`) as **negative controls**, plus `postmortemStatus` asserted `resolved`-or-unset and **never** `unresolved`; the unconfirmable-append entry emitting §6's *Unconfirmed-append text* with an **empty** `notice`; and **the mid-window refusal**, the positive control: on a branch whose highest round is 2 with a corrupt region and a fresh clearance, **no round-3 cross-review file is written**, the report carries row B with `round` = 3 and S-16 alone, and the invocation terminates with the queue row `halted` — an implementation that skips step 4 and falls back to `W` = 1 runs round 3 and fails this leg — its fixture is **hand-built**, since no shipped halt creates a mid-window region until the successor lands (X-05). **Every "no round ran" leg is asserted with a positive conjunct, not by absence alone:** a **call-count oracle on the reviewer-dispatch seam** — exactly **0** dispatches on the refusing entry, on the exhausted-budget entry and on the skipped entry, and **≥ 1** on the control entry that does open a round — asserted *alongside* the file-absence check, since a test double that writes no file satisfies absence either way. Also: **row C** asserted cell by cell with its S-4 reason and **0** dispatches; a **forced** phase on an exhausted document halting rather than re-reviewing; a **Phase CR halt creating no `## Reset Region`**; the answering-line write **confirmed before** any dispatch, with an unconfirmable write opening no window and dispatching nobody; and both `iterations` and the post-mortem's Iterations section asserted **over the constant**, with rounds-run `0` on the zero-round halt. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — five per-invocation rounds, no enforced stop. The predecessor's Phase R died exactly here. | Mitigated by splitting the parent, depending on no unmeasured runtime fact (baseline §5), and keeping this document short. **Accepted and unenforceable** — the enforcement is this REQ and its successor, neither shipped. The operator watches the trajectory and halts by hand. |
| **R-12** | **A repeating S-11 halt is unbounded.** Each S-11 clearance writes `WINDOW-RESUMED: {W}`, leaves `W` unchanged and (per the successor's AC-2.8) costs the window no round, so an authoring side that keeps producing zero-delta rounds yields an unbounded halt/clearance sequence with `H` and `A` growing together and the budget never exhausting. | **Accepted, and bounded by the operator rather than by the loop.** Every iteration costs one hand-written `RESOLVED: yes`, so the sequence is never unattended and never silent; capping it would require a second counter whose only effect is to deny an operator who is *choosing*, each time, to continue. Revisit if the S-11 path is observed to repeat in practice. |
| **R-13** | **Migration: branches that already carry more than three rounds.** At the commit that lands `MAX_REVIEW_ROUNDS = 3`, every in-flight phase whose document has 3+ rounds is admitted no rounds and halts on the next entry, rendering S-4 as `rounds 1..3 of 3` while five rounds sit on disk. | **Correct and expected, not a defect** — the render states the *window*, not the file count. The escape is the ordinary one: clear the post-mortem with `RESOLVED: yes` and the next entry opens a fresh window at `N` = one past the highest round. No migration script, no back-fill of reset regions. |
| **R-10** | **The reset region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie in either direction, and one direction restores the per-invocation budget AC-1.1 abolishes — silently and fail-open. | **Mechanised, not accepted.** Step 2 validates every answering line, step 3 the counts against each other; either failure refuses the phase with S-16 rather than guessing. The residual is the operator's: §6 records that `WINDOW-START:` is never *authored* by a human, and AC-1.5(4) names the only two sanctioned repairs. |
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
/ 83 KB**, beyond the 60 KB ceiling and therefore beyond what the loop converges on. v1.1 cuts at
the seam the two already had: this REQ defines the **window**, and
`docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` the two **tests** evaluated inside
it. The ordering argument (`W` must exist before AC-2.1/AC-2.8/AC-2.6) is preserved as a
`depends-on` edge. No requirement, AC or `S-*` id changed.

**Round-by-round history is deliberately not restated here.** The predecessor's nine review rounds
were harvested into
`docs/discarded/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md`:
`harvest-learnings` deletes `CROSS-REVIEW-*` once LEARNINGS is written, so a citation to
those round files would be structurally wrong. This REQ traces to the *measured facts*, not the
review history.
