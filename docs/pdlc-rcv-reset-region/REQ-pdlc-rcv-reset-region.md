---
feature: pdlc-rcv-reset-region
ready: true
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-rcv-reset-region

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id (`M-8d`), never restated. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2), the run-report row schema (§3) and **row B's unconfirmable-append render (§4)**, used by reference. |
| Predecessor | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` v2.0 (`REQ-RCV-01`) — this REQ is the **implementation-altitude half** split out of that document's v1.6 AC-1.5(4), §6 and O-10 on 2026-08-01. See §10 and `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. |
| Siblings | `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02); `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` (v1.0) root causes 1 and 3, recommendations R-3 and R-4; operator direction of 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-reset-region.md` |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`41f9369`** on `feat-pdlc-rcv-budget-stop`, at which every line cited below was re-derived. Baseline §2.8's `M-8*` rows were read at `cf207bd` and hold unchanged at `41f9369`. Citations name the enclosing symbol and a distinctive literal; re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

**v1.0** is the split half. Nothing here is new material: every criterion below was `REQ-RCV-01`
v1.6's AC-1.5(4), §6 or O-10 text, re-stated against the measured facts `M-8a … M-8j` that
`docs/_constraints/pdlc-rcv-baseline.md` §2.8 added on the same day. **No `S-*` id is minted, and no
requirement, AC or threshold of `REQ-RCV-01` changed meaning** — only which document states it.

## 1. Problem

`REQ-RCV-01` establishes the **window**: three rounds per document, counted from an origin `W` that
only an operator's `RESOLVED: yes` can move, anchored in machine-written state — the **reset region**
(S-12) — inside `POSTMORTEM-{phase}-{feature}.md`. It states *what the region means*: the counts `H`
and `A`, the one-shot clearance gate, the answering line that spends it, and the fail-closed outcome
when the region does not validate. It deliberately does **not** state *how the region is validated*,
what a partial write of the answering line leaves behind, or what an operator does about either.

That remainder is this REQ, and it is a different kind of question. Three problems, none of them
requirements-altitude:

- **P-A — the validation predicate is where machine state meets an operator's text editor.**
  `REQ-RCV-01` AC-1.5(4) names a predicate — *the region validates* — and fixes its failure
  disposition. What makes that predicate **total and single-valued** (DC-01) is an ordered algorithm
  over an appended, order-sensitive line sequence, plus an invariant on two counts with a stated
  domain. Independent rows do not compose into a single-valued answer: the order matters, and it has
  to be written down once.
- **P-B — a half-landed answering line is the fail-open the whole mechanism exists to close.** The
  append that makes `A = H` is the *sole* mechanism keeping the clearance one-shot, so a lost append
  re-grants a fresh window every invocation. A **value tear** — `WINDOW-START: 12` landing as
  `WINDOW-START: 1` — is worse than a lost line: it is well-formed, so it validates, balances the
  counts and moves the origin **down**, spending the clearance on a window the operator never bought.
  What the failing entry does, and what the *next* entry finds, is a design.
- **P-C — the refusal's operator-facing surface is decided by shipped control flow this family does
  not own.** A phase refusal must not be mistaken for a halt, must reach the same exit step G
  reaches, and must not be narrated by the shipped generic recovery line — emitted **unguarded** on
  every halt class that reaches the halt catch (M-8d). Every claim of that shape is falsifiable by
  reading one line further, which is precisely how `REQ-RCV-01`'s Phase R failed to converge. It is
  settled here against baseline §2.8's measured facts and catalogue §4's render, never re-derived.

**Why a separate REQ and not a longer `REQ-RCV-01`.**
`docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` records five review rounds in which
**AC-1.5(4) was the only clause to generate a blocking finding after round 2** (root cause 3), and
root cause 1 names why: a requirements document was specifying the behaviour of shipped code it does
not own. The two generator classes — A (the answering-line write and its residue) and B (which
shipped string appears, with which value, under which guard) — are exactly P-B and P-C. Splitting at
that altitude seam is the postmortem's own analysis applied, and it is `pdlc:pm-author` rule 5g.

## 2. Users and value

| ID | User story |
|---|---|
| **US-04** | *As the operator*, I want my one escape hatch to be spent exactly once and to leave a record, so that clearing a halt grants one fresh window and not a window per invocation. *(Shared with `REQ-RCV-01`, which states the gate; this REQ makes the gate decidable.)* |
| **US-07** | *As the operator*, when the loop refuses to enter a phase because the reset region does not add up, I want to be told **which line or which pair of counts** is wrong and **exactly what to do about it**, so that a corrupt region is a five-minute hand repair rather than a permanently halted feature. |
| **US-08** | *As the operator*, when the loop cannot confirm the line it just wrote, I want it to stop before it dispatches anything and to tell me to remove the residue **first**, so that a torn write costs me one re-run rather than a silently narrowed window and an unexplained budget halt later. |

**Value.** This REQ delivers no saving of its own — `REQ-RCV-01` carries the whole baseline §1.4
pessimistic-regime saving. What it delivers is that saving's **soundness**: without P-A the clearance
gate has no decidable third conjunct, and without P-B the one-shot property is fail-open on any
partial write. **Operator-visible surfaces:** row B of the run report in both variants, the S-16
notice, the two ❌ phase-row texts, and the recovery text naming the sanctioned repair.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-14** | **Feature `pdlc-rcv-budget-stop` (`REQ-RCV-01`) merged.** Its AC-1.4 defines the reset region and the halt that maintains it; its AC-1.5(4) defines the counts `H`/`A`, the three-conjunct clearance gate, the answering line and the *region validates* predicate this REQ discharges; its AC-1.5(5) defines which answering line is written. | The feature's artifacts on the default branch, and `MAX_REVIEW_ROUNDS === 3` in `pdlc/workflows/orchestrate-dev.js` | **Hard dependency.** Every criterion below is stated over that REQ's region, counts and gate. Shipping this REQ first would leave the algorithm stated over a region nothing creates. |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-7.2's routing is stated over exactly that shape |
| **BL-15** | The halt catch's operator-facing surface is as `docs/_constraints/pdlc-rcv-baseline.md` §2.8 measures it | `M-8a … M-8j` re-readable at HEAD by their enclosing symbol and distinctive literal | Must hold at FSPEC authoring. AC-7.2's suppression and AC-7.6's `postmortemStatus` are stated **over those facts by id**; if a fact no longer holds, the fact is re-measured in the baseline and this REQ's citation follows it — it is not re-derived here |

**BL-06 and BL-15 hold at `41f9369`.** BL-14 does not yet hold and is the `depends-on` edge.

### 3.1 What this REQ owes and is owed

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-07** | **owed to** `pdlc-rcv-budget-stop` | AC-1.5(4)'s *region validates* predicate, its S-16 notice, and the phase refusal that follows a failure. `REQ-RCV-01` states the conjunct and the fail-closed outcome and cites AC-7.1 for the algorithm | **Paired edge — revise with `REQ-RCV-01` X-06 and R-14 within the same revision, in the same words** (`docs/_constraints/pdlc-rcv-split.md` §5). Until this REQ ships, `REQ-RCV-01`'s step-4 conjunct has no decision procedure, so **that REQ ships with the conjunct unwired**: its gate is the two decidable conjuncts (a readable `RESOLVED: yes`, `A < H`), the **injection point** exists — the interim composition accepts the seam as a parameter, so this REQ adds a call rather than rebuilding a call graph — but **no call site is emitted there**: the interim composition calls it **0 times** (`REQ-RCV-01` O-10), and no interim entry is refused. **The predicate's *grammar* layer is not deferred**: `REQ-RCV-01` §6's S-13/S-14 grammar (`{N}`, `{W}` a decimal integer ≥ 1) is in force at that ship, so a malformed value contributes no origin and `W` falls back to 1 there; **AC-7.1 step 2 therefore re-checks that grammar rather than first-checking it**, and what this REQ first adds is the **analysis** layer — ordering, the highest round on the branch, and `H − A ∈ {0, 1}` — with its refusal. **This REQ wires the conjunct**, in the commit that lands AC-7.1. An interim *procedure* was considered and rejected on all three horns — refusing, granting, and the **narrower** one that must still disagree with AC-7.1 on ordering and highest round — stated once for both ends at `pdlc-rcv-split.md` §5.1 and not restated here. The queue orders this row at **`Order 18`** (net pickup 10 → 12 → 18), not immediately behind row 10, and `REQ-RCV-01`'s `depends-on` is empty because nothing it needs *as a requirement* is owed here |
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` | The S-11 halt reason `no-revision: …` (AC-2.8). AC-7.1 step 2 validates `WINDOW-RESUMED:` lines, which only an S-11 clearance writes | Until that REQ ships no halt path emits S-11, so no `WINDOW-RESUMED:` line is ever written and step 2's second sentence is **unreachable in production**. It is stated from the start, so nothing is re-specified when the successor lands; its fixtures are hand-built (R-11) |

**Consequence for sequencing.** This REQ is deliverable immediately after `REQ-RCV-01` and needs no
other sibling. `pdlc-rcv-fixed-point-stop` and `pdlc-rcv-panel-topology` **cite** material stated
here but consume none of it (§10), so neither gains a `depends-on` edge.

## 4. Definitions and the catalogue ids this REQ reads

Every term used with a family meaning — *reset region*, *current window* / origin `W`, *phase
refusal*, *approval refusal* — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and **not**
restated here. §2 holds the closed catalogue `S-1 … S-17`, §3 the run-report row schema, and §4 row
B's unconfirmable-append render.

**This REQ owns no catalogue id.** The catalogue is closed at seventeen and this REQ mints none; it
**reads** five ids that `pdlc-rcv-budget-stop` owns and states the receive side the catalogue's
`Receiver is total because` column already attributes to *"AC-1.5(4)'s ordered algorithm"* — which is
AC-7.1 below. Where catalogue §2 says *AC-1.5(4)'s ordered algorithm*, read **AC-7.1**; that
delegation is stated in `REQ-RCV-01` §4 and is the only sense in which any catalogue row moved.

| id | Owned by | What this REQ does with it |
|---|---|---|
| **S-12** `## Reset Region` | budget-stop AC-1.4 | AC-7.1 reads it. The absent/empty case (`H = A = 0`, `W = 1`) is S-12's, not this REQ's |
| **S-13** `WINDOW-START: {N}` | budget-stop AC-1.5(4) | Step 2 validates its value, AC-7.5 confirms its bytes, AC-7.4 fixes the one sanctioned deletion |
| **S-14** `WINDOW-RESUMED: {W}` | budget-stop AC-1.5(5) | Step 2 validates its value, AC-7.5 confirms its bytes, on the same terms |
| **S-15** `HALT-REASON: {value}` | budget-stop AC-1.4(1) | Step 1 counts it. This REQ never writes one, and AC-7.2 turns on its **not** being written |
| **S-16** `reset-region-corrupt: …` | budget-stop | AC-7.1 step 4 is the sole emitter. The render — bracketed offending line included — is fixed **character for character in catalogue §2 and nowhere else**; its `{reason}` enum stays closed at three |

**Four operator-facing renders are not catalogue ids and are cited, not restated.** Row B's
unconfirmable-append variant's ❌ text, its recovery text, its `postmortemStatus` and its residue
disposition are fixed in **catalogue §4**, which holds them beside the row they discriminate and
beside the `M-8*` facts they rest on. §6 below registers each by name and authority; AC-7.5 and
AC-7.6 state the **conditions** under which the variant is emitted, which catalogue §4 explicitly
leaves to this family. The validation-failure variant's ❌ text and recovery text are §6's own.

**FSPEC may not add an eighteenth catalogue id**, here or anywhere in the family.

### 4.1 Durability: what survives an invocation boundary

The loop re-derives its state from the branch on every invocation (M-1d, M-2f), so **every** quantity
below has a durable home on disk. There is no criterion here stated over in-process state, and one
would be a defect.

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| The region's line sequence, **in document order** | AC-7.1 steps 1–2 | The `## Reset Region` span of `POSTMORTEM-{phase}-{feature}.md`, outside fenced blocks (S-12, M-7d). Every line is appended, so document order is event order | The empty region: `H = A = 0`, `W = 1`, no reset in effect, nothing granted (S-12) |
| The counts `H` and `A` | AC-7.1 steps 1, 3 | Derived from that same span on every read — **never** cached, never carried across an entry | n/a — a readable region always yields two integers, possibly both 0 |
| The highest round of **the document type under review** | AC-7.1 step 2's range check; AC-7.6's `round` cell | The `CROSS-REVIEW-{role}-{docType}-v{N}.md` basenames `deriveRoundWindow` already filters by `docType` (M-1d) | Treated as 0; the range check admits only `WINDOW-START: 1` |
| The bytes of the answering line **as written** | AC-7.5's confirmation | Held across one write-then-read pair **inside a single entry**, compared against a re-read of the file. The only in-entry value here, and not state: nothing reads it on a later entry, and a crash between write and read lands on AC-7.5's *anything else* branch | n/a — an entry that does not reach the write has nothing to confirm |
| Whether the operator has cleared the halt | AC-7.2's *marker left in place* | The single unfenced `RESOLVED:` line (M-7a) | Absent, `no`, unparseable or duplicated ⇒ the shipped step-G refusal fires first and these criteria are never reached |

**"The highest round on the branch" always means: of the document type under review.** Every such
phrase below — step 2's range check, row B's `round` cell — is taken over the doc-type-filtered
basenames (M-1d), never over the whole listing. A feature directory holds cross-reviews for several
document types at once, and the two readings differ on a constructible fixture: a Phase F region
carrying `WINDOW-START: 4` with two FSPEC rounds and five REQ rounds is **invalid** under the
doc-type-scoped reading (permanent refusal until repaired) and **valid** under the whole-listing one.
It is the doc-type-scoped reading, because a window is a property of a document.

## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who/Given/When/Then form over an in-band
observable named in baseline §2.

---

### REQ-RCV-07 — The reset region validates, refuses and is repaired

**Priority:** P0 · **Source:** US-04, US-07, US-08 · **Depends on:** BL-14, BL-06, BL-15

**AC-7.1 — The region is read by one ordered algorithm, total and single-valued.** *Who:* the review
loop. *Given:* the `## Reset Region` span of `POSTMORTEM-{phase}-{feature}.md` for the document type
under review (S-12), and the doc-type-filtered cross-review basenames on the branch. *When:* the
origin `W` and the clearance gate's third conjunct — *the region validates* (`REQ-RCV-01`
AC-1.5(4)) — are resolved. *Then:* the loop runs **these five steps in this order**, and the
predicate is exactly *"steps 1–3 all pass"*:

1. **Collect.** Take every `HALT-REASON:` (S-15), `WINDOW-START:` (S-13) and `WINDOW-RESUMED:` (S-14)
   line in the region, **in document order**, giving the counts `H` = the `HALT-REASON:` lines and
   `A` = the `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. No other line in the span is collected;
   a `RESOLVED:` line is never a region line and is never counted (catalogue §1).
2. **Validate every answering line's value.** A `WINDOW-START:` value is valid iff it is a decimal
   integer ≥ 1, **strictly greater than every `WINDOW-START:` value before it**, and **no greater than
   one past the highest round on the branch**. A `WINDOW-RESUMED:` value is valid iff it is a decimal
   integer ≥ 1 **equal to the greatest `WINDOW-START:` value before it**, or to 1 if there is none.
3. **Validate the two counts against each other:** `H − A` must be **0 or 1**. `A > H` means more
   clearances have been answered than halts have been taken, which only a hand-edit produces, since
   the loop writes at most one answering line per halt; `A < H − 1` means a halt is recorded whose
   clearance no line answers, reachable only if a line was removed. Both are corruption of the
   **counts**, not of a value.
4. **If any line fails step 2, or the counts fail step 3 ⇒ `W` = 1, fail-closed.** No reset is
   honoured, **no answering line is written and the clearance is not consumed**, and the run report
   emits `reset-region-corrupt: {reason}` (S-16) naming the file and, per reason, the offending
   **line** or the pair `H`/`A`. **Exactly one S-16 notice is emitted, whatever the fault count:**
   `{reason}` belongs to the **first failing line in document order**, and `counts-mismatch` only when
   every line passes step 2, so two notices never co-occur in the row's `; `-joined `notice` cell. The
   entry then **refuses the phase and returns** (AC-7.2), reporting row B's validation-failure variant
   (AC-7.6).
5. **Otherwise `W` = the greatest `WINDOW-START:` value present, or 1 if there is none** — read
   **after** any answering line this entry confirmed (AC-7.5), so on a granting entry step 5 and
   `REQ-RCV-01` AC-1.5(4)'s `N` agree. **The grant is part of this algorithm, not a rule beside it.**

**Why ordered rather than independent rows.** DC-01 requires the receive side to be **total and
single-valued**. Steps 2 and 3 partition the failure space — a value fault and a count fault are
disjoint by step 4's own rule — and step 5 is defined only on the passing branch, so exactly one of
{`W` = 1 + refusal, `W` = greatest} is produced on every input, including the empty region
(`H = A = 0`, both steps vacuous, `W` = 1, **no** refusal: an empty region is valid, not corrupt).

**`H − A ≤ 1` is the invariant `REQ-RCV-01` AC-1.5(4)'s *exactly one answering line* relies on, and
step 3 gives it a stated domain**; symmetrically, a region that fails step 2 or 3 must not spend the
clearance — validation is a **conjunct of the gate**, not merely a constraint on `W`. The arithmetic
behind both halves is stated once for both ends at `pdlc-rcv-split.md` **§5.2** and not restated here.

**Step 2 is order-sensitive, and the append rule is therefore normative.** It reads what comes
*before* each line. Under a prepending implementation a `WINDOW-RESUMED: 4` can land ahead of the
`WINDOW-START: 4` it answers, failing step 2 ⇒ `W` = 1 permanently: `REQ-RCV-01` AC-1.4 clause 1
preserves the region verbatim on every later halt, so no clearance repairs it.

**Step 2's range check is re-evaluated on every read, against the current listing,** not fixed at
write time. `harvest-learnings` deletes `CROSS-REVIEW-*` and `POSTMORTEM-*` together, so the ordinary
path never sees a region outliving its rounds; a sequence that removes the cross-reviews while the
post-mortem survives lands in the fail-closed case — S-16, sanctioned repair, no clearance spent.

**AC-7.2 — A refusal is not a halt, and it terminates on step G's path.** *Who:* the review loop.
*Given:* an entry on which step 4 fires. *When:* the phase would otherwise have been entered.
*Then:* the entry **refuses the phase** — a *phase refusal* in the catalogue §1 sense, the same shape
as the shipped refusal of an unresolved post-mortem — and specifically:

- the entry **takes no halt**: it does not evaluate `REQ-RCV-01` AC-1.5(1)'s budget, writes **no
  `HALT-REASON:` line**, writes no post-mortem, and AC-1.4 does not fire, so `H` is unchanged;
- the operator's `RESOLVED:` marker is **left in place**, unstripped, so `checkPostmortem` still reads
  `resolved` on the next entry (M-7a);
- on the **validation-failure** variant the post-mortem file is **byte-unchanged**; *scoped to that
  file*, the entry's only effect is the S-16 notice on row B. **This invariant does not hold on the
  unconfirmable-append variant** (AC-7.5), where a partial append may have landed;
- **the phase does not run and the invocation terminates on step G's path**: a ❌ phase row is
  recorded, the pipeline stops, and the feature's `docs/_queue/QUEUE.md` row is rewritten to `halted`
  and committed — reached *because* the refusal is step-G-shaped (M-7a, M-7b; O-6), where a literal
  early `return` would not be, since the entry-validation halts nearby build their final report
  directly and never call the queue-row writer (M-8a, M-7b). That is intended: the region needs an
  operator, and an unattended queue must stop.

**Why the whole of `REQ-RCV-01` AC-1.5 must not run on.** Left running, AC-1.5(1) would halt on the
budget path, and AC-1.4 governs **every** halt, so that halt would append its own `HALT-REASON:`
(`H += 1`) **and strip the operator's `RESOLVED:`** — spending the clearance the refusal declined to
spend, and converting a repairable region into an unrepairable one.

**The shipped generic recovery line is suppressed on both row-B variants** — a **stated change to
shipped behaviour, not a substitution the code affords** (O-6). Catalogue §4's *Recovery text* cell
records why, on M-8d (a bare unguarded `emit` firing on every halt class that reaches the catch),
M-8b (halt reason and `emit` are disjoint channels, so writing a repair into `haltReason` removes
nothing and the operator reads both, the generic last), M-8e (the near-miss is a different string on
the other channel) and M-8a (the four entry-validation halts reach none of it). This REQ asserts
nothing beyond those facts. Unsuppressed, the generic reproduces the refusal every iteration on the
validation-failure variant and omits act 1 on the unconfirmable-append one; suppressed, the shipped
*exactly one recovery act per halt* is kept, generalised to *whose text depends on the halt class*,
and **every other halt class keeps the line unchanged** (NR-3).

**`postmortemStatus` reads `written` on both row-B variants, by a named mechanism** — catalogue §4's
cell, on M-8g, M-8f, M-8i and M-8c. In one sentence: the refusal sets no gate disposition and
attaches none to its thrown halt, so the four-way chain falls through to the existence probe, which
finds the post-mortem this refusal is *about*. **`none` is rejected, not merely unreachable** (it
alone triggers `No POSTMORTEM was written.`, beside a ❌ row naming the post-mortem the operator
hand-resolved); never `unresolved`, which is step G's; never a value outside the shipped enum.

**AC-7.3 — The resolution runs inside the phase body that is going to review, and is unconditional
there.** *Who:* the review loop. *Given:* an entry into a document-typed review-loop phase
(`REQ-RCV-01` AC-1.1's scope). *When:* the phase body runs. *Then:* AC-7.1 runs **after the phase
gate's skip decision and before any round opens**, and within that body it is **unconditional** — it
fires whether or not rounds remain under the fallback and whether or not a marker is pending.

`phaseGate` can exit `{ skip: true }` on an approved-and-fresh document
(`orchestrate-dev.js:4215`–`:4226` at `41f9369`, the `checkPostmortem` block ending
`return { skip: true };`). **On that exit neither AC-7.1 nor the grant runs** — `W` is not resolved,
no answering line is written, no refusal is raised. A skipped phase reviews nothing, so a refusal
there would halt the pipeline over a phase no repair gains a round for, and a grant there would spend
the one-shot clearance on an entry that opens no round: both are pure cost. Placing the resolution
inside the reviewing body is also what keeps a refusal on step G's path (AC-7.2, O-6).

Three entry classes, and the justification is **fail-closed, not costless**:

| Entry class | What AC-7.1 does | Cost versus the `W` = 1 fallback |
|---|---|---|
| **Skipped** (`phaseGate` exits `{ skip: true }`) | does not run | none; the region is untouched and both counts unmoved |
| **Exhausted** — highest round ≥ 3 under `W` = 1 | runs; refuses on a corrupt region | **none, and the two are indistinguishable**: the fallback admits `{1, 2, 3}`, all three are filled, and the entry would have halted on the budget path regardless |
| **Mid-window** — rounds remaining under `W` = 1, reachable at highest round **2** | runs; refuses | **real, and accepted (R-11)**: the fallback would admit round 3 and the phase would run. Instead no round-3 cross-review file is written, the invocation terminates on step G's path and the queue row is written `halted` |

The mid-window class is reachable because `pdlc-rcv-fixed-point-stop` AC-2.1 can fire on the (1, 2)
pair and its AC-2.8 can halt at round 2, either of which creates the region with `H = 1`, `A = 0`
before a hand-edit corrupts it. It is the refusal's **positive control** — the only branch on which
honouring step 4 and falling back are distinguishable — and O-10 carries it; AC-7.6's `round` cell is
stated over exactly this branch, whose fixture is hand-built while X-05 is unshipped (§3.1, R-11).

**AC-7.4 — Every S-16 reason has exactly one sanctioned repair, and it is the operator's.** *Who:*
the operator. *Given:* a run report carrying S-16. *When:* they repair the region by hand. *Then:*
the region is **human-repairable**, per reason, by exactly this act and no other — the only hand-edit
this family asks for to machine-written state:

| Reason | What the notice names | The sanctioned repair |
|---|---|---|
| `invalid-window-start` | the offending `WINDOW-START:` line, in brackets after the path (S-16) | **correct that line** — never delete an answering line |
| `invalid-window-resumed` | the offending `WINDOW-RESUMED:` line, likewise | **correct that line** — never delete an answering line |
| `counts-mismatch` | the pair `H`/`A` — **no line** | delete the **whole `## Reset Region` section**, heading included |

**Correcting is the only sanctioned value repair; deleting an answering line is forbidden at every
`H − A`**, since it decrements `A` and raises `H − A` by one — and both reachable values of that
arithmetic are unsafe:

| Region before | Marker on disk | Repair | Region after | What the next entry does |
|---|---|---|---|---|
| `H = 2`, `A = 1`, `WINDOW-START: 99` (`H − A = 1`) | either | delete the line | `H = 2`, `A = 0` ⇒ `H − A = 2` | refuses under a **different** reason, `counts-mismatch`, whose only repair is the destructive whole-section deletion |
| `H = 1`, `A = 1`, `WINDOW-START: 99` (`H − A = 0`) | yes — the refusal left it in place (AC-7.2) | delete the line | `H = 1`, `A = 0` ⇒ `A < H` | **grants a fresh three-round window** off a clearance that was already answered, and writes `WINDOW-START:` |

The second row is the hand-edit S-13's *never authored by a human* prohibition exists to prevent; any
repair leaving `H − A ∉ {0, 1}` is rejected by step 3.

**Why `counts-mismatch` is repaired by deletion.** No line is offending, and both line-level repairs
are forbidden elsewhere: **adding** an answering line contradicts S-13, **deleting** a `HALT-REASON:`
contradicts `REQ-RCV-01` AC-1.4 clause 1. Deleting the **section** contradicts neither — S-12 reads
an absent heading as the empty region (`H = A = 0`, `W = 1`, the never-reset state), the next halt
re-creates a one-line region, and the clearance after it works, at the cost of one further halt and
the halt history.

**The one exception, and it is the only one.** Act 1 of AC-7.5's unconfirmable-append recovery
deletes the region's trailing answering line. It is sanctioned **only there**, and it is not the
operator repairing an *answer*: an unconfirmed line answered nothing — no round ran — so removing it
restores `A < H` and the clearance the write never earned. S-13's prohibition is scoped to
**authoring** a line, which is why it exempts both this act and the two corrections above (catalogue
§4, *Residue disposition*).

**AC-7.5 — The answering line is confirmed by byte comparison before the window opens, and a failed
confirmation refuses on the entry that wrote it.** *Who:* the review loop. *Given:* an entry that has
observed an unconsumed clearance (`REQ-RCV-01` AC-1.5(4)'s three conjuncts) and has appended its one
answering line — `WINDOW-START: {N}` or `WINDOW-RESUMED: {W}` (AC-1.5(5)). *When:* the append
returns. *Then:* the loop **re-reads the file, re-runs AC-7.1 steps 1–3 on the region, and requires
it to end with the answering line exactly as written**, byte for byte — **before any round of that
entry is dispatched**. On failure it **fails closed**: no window is opened (`W` keeps its prior
value), no round is dispatched, and the entry **refuses the phase** on AC-7.2's terms, reporting row
B's **unconfirmable-append** variant (AC-7.6).

**Why a byte comparison and not a presence check.** The append is the write making `A = H` and the
*sole* mechanism keeping the clearance one-shot; a lost append re-grants a fresh window on every
invocation — the fail-open the criterion exists to close. A presence check leaves **three** outcomes,
one of which is silent. Comparing bytes collapses them to **two**:

| Outcome | Under a presence check | Under the byte comparison |
|---|---|---|
| The line landed whole | confirms ⇒ `A = H`, next entry grants nothing | same |
| Nothing landed, or a truncated key, or a lost newline | detected ⇒ refusal | same |
| A **value tear** — `WINDOW-START: 12` landing as `WINDOW-START: 1` | **silent**: well-formed, so it validates, balances the counts, and moves the origin **down** — spending the clearance on a window the operator never bought | **announced**: the bytes differ, so the confirmation fails and this entry refuses |

**Never two windows.** Every offset — inside the key, inside the value, newline lost, the well-formed
`WINDOW-START: 1` case included — fails the confirmation and refuses on **this** entry, and no offset
opens a round.

**Announcing the tear is only half of it; act 1 is what stops the residue being spent.** Left in
place, a well-formed residue validates on the **next** entry, makes `A = H`, and reaches exactly the
budget halt the announcement exists to prevent. The recovery text therefore names **two acts in
order** — *act 1*: delete the region's trailing answering line if one is present; *act 2*: reset the
`{feature}` row and re-run the queue — fixed **character for character in catalogue §4**, with the
residue disposition it rests on, and **not restated here**. A tear leaving an *invalid* line instead
reaches AC-7.1's corrupt-region refusal on the next entry if act 1 is skipped.

**Two of AC-7.2's invariants are scoped to the validation-failure path and do not hold here**, which
is why the two variants are separate rows and not one: the post-mortem file is **not** byte-unchanged
(a partial append may have landed), and the ratchet's *same reason next entry* has no reason to be
stable. Catalogue §4's *Residue disposition* cell is the authority for both.

**This entry mints no S-16 reason** — that enum stays closed at three (S-16). The region passed steps
1–3, so an S-16 reason would name a state the region is not in: an unconfirmable write is an **IO
fault of the loop**, not a state of the region, which is why the variant carries **no reason token**
and an **empty** `notice` cell (catalogue §3), and is told apart by its ❌ text alone.

**Consequence, and it is the right way round.** An entry that confirms the line then dies before
dispatching has **spent the clearance** (`A = H`) while the window at `N` is intact; the next entry
runs those rounds. Writing the line last would instead lose the record of a window already *used*,
and re-grant it.

**AC-7.6 — Row B is one row in two variants, and the operator is always told why the invocation did
nothing.** *Who:* the operator. *Given:* an entry that refuses under AC-7.1 step 4 or AC-7.5.
*When:* the run report is emitted. *Then:* the entry opens no round and dispatches nobody, but still
produces **exactly one** row of catalogue §3's schema — row B — with these cells:

| Cell | Validation-failure variant | Unconfirmable-append variant |
|---|---|---|
| `round` | **one past the highest round of this document type on the branch**, from the listing (`deriveRoundWindow`, M-1d) — **never** from `W` | same rule; `W` is unchanged on this path and is likewise not this cell |
| `panel-shape`, `blocking`, `growth-bytes`, `classification` | **empty** — nothing dispatched, nothing measured | **empty**, same reason |
| `notice` | **S-16 alone**, with **no S-4 reason**, no halt having been taken | **empty**, with no S-16 and no S-4 (catalogue §3) |
| ❌ phase-row text | `Refused — reset region corrupt at {path} ({reason})`, §6 | `Refused — answering line unconfirmed at {path}`, **catalogue §4** |
| Recovery text | names *that reason's* sanctioned repair (AC-7.4), §6 | the **two acts in order**, **catalogue §4** |
| `postmortemStatus` | **`written`** (AC-7.2) | **`written`**, same mechanism |

**The variants are told apart by the ❌ phase-row text, never by the `notice` cell alone** — catalogue
§3 says so, and it matters: an empty `notice` is also what a perfectly ordinary quiet row carries.
**Rows B and C are mutually exclusive**: B's entry takes no halt, C's takes one (catalogue §3), so B
never carries S-4 and C never carries S-16 from this path. The `round` cell is stated over AC-7.3's
mid-window branch, the only one on which it differs observably from the fallback's: highest round
2 ⇒ `round` = 3.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. **This REQ owns no row of it and
changes none** — it reads three, listed first below. **Two rows sit outside baseline §3's scope
deliberately, not by defect:** the validation-failure variant's two operator strings are
non-catalogue renders that no other document states, so this table is their registered authority.
Four further renders this REQ depends on are **registered elsewhere and cited, not restated**; a
second statement of a render is a second place to be wrong.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `reset-region-corrupt: …` | catalogue §2's S-16 row, character for character, bracketed offending line included | **read only** | Owned by budget-stop. AC-7.1 step 4 is its sole emitter; one notice per entry whatever the fault count; `{reason}` closed at three |
| `WINDOW-START: {N}` / `WINDOW-RESUMED: {W}` | catalogue §2's S-13 and S-14 rows | **read only** | Owned by budget-stop. Step 2 validates the values, AC-7.5 confirms the bytes; neither grammar may change here |
| `## Reset Region` | that exact heading (S-12) | **read only** | Owned by budget-stop AC-1.4. AC-7.4's `counts-mismatch` repair deletes the section, heading included |
| **Refusal phase-row text** | `Refused — reset region corrupt at {path} ({reason})` | **owned** | The ❌ row of AC-7.1 step 4's refusal. **Not a catalogue id** — an operator-facing render of S-16, `{path}` the same repo-root-relative post-mortem path S-16 renders, `{reason}` the S-16 reason. Deliberately distinct from step G's `Refused — unresolved POSTMORTEM at …` (`orchestrate-dev.js:4246` at `41f9369`), which states the opposite of the truth here: step G refuses because the marker is *unresolved*, this refusal fires on a post-mortem the operator **did** resolve |
| **Refusal recovery text** | names the sanctioned repair for `{reason}` (AC-7.4's table) | **owned** | The shipped generic queue-reset line is **suppressed**, not substituted, on this variant — an unguarded emit firing on every halt class (M-8d), so suppressing it is a stated change to shipped behaviour (AC-7.2, O-6) |
| **Unconfirmed-append ❌ text** and **its two-act recovery text** | as **catalogue §4** fixes them, character for character | **read only** | Registered in catalogue §4 beside the row they discriminate and beside the `M-8*` facts they rest on. AC-7.5 and AC-7.6 state the *conditions*; the bytes are not restated here |
| **`postmortemStatus`** on both row-B variants | **`written`** | **read only** | Fixed by catalogue §4 for the unconfirmable-append variant and by AC-7.2 for both, over the shipped enum `none \| unresolved \| written \| write_failed` (M-8f). Never `none`, never `unresolved` |

**Two renders in this table, and no third.** §6's two owned rows plus catalogue §4's two are the
**closed list of operator strings the row-B path emits**. A finding that some other string ought to
appear on a refusal is a finding against this list, not an omission from it.

## 7. Non-goals and out of scope

The shared list is baseline §4, which defines **N-1 … N-10 only**; all of `N-1, N-2, N-3, N-4, N-7,
N-9, N-10` apply unchanged and are not restated, and `N-5`, `N-6` and `N-8` are **inapplicable to
this REQ, not overlooked**. **Ids above `N-10` are not shared** — the family has minted colliding
`N-1x` ids — so this document's own non-goals use a **per-REQ namespace, `NR-*`**; restated shared
rows keep their shared ids.

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-7.2's whole point is that a refusal is **not** a halt: no post-mortem is written, no `HALT-REASON:` is appended, and the rule that **only a human ever writes `RESOLVED: yes`** is untouched. Act 1's deletion of an unconfirmed line removes a line the loop wrote and no operator answered; it writes no marker. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Those loops have no reset region to validate (`REQ-RCV-01` AC-1.1's scope note), so AC-7.1 never runs for them. |
| **NR-1** | Defining the window, the budget, the counts `H`/`A`, the clearance gate, or which answering line a given halt reason calls for. | They are `pdlc-rcv-budget-stop`'s AC-1.1–AC-1.5. This REQ discharges the *predicate* AC-1.5(4) names and states what a failed write leaves behind. A finding that this document never says *why* the window is three is **correct and known** — file it there. |
| **NR-2** | Emitting S-11, or specifying when a document is zero-delta. | They are `pdlc-rcv-fixed-point-stop`'s (X-05). AC-7.1 step 2 validates `WINDOW-RESUMED:` values without ever deciding when one is written. |
| **NR-3** | Changing the shipped halt catch's behaviour for **any** halt class other than the two row-B variants. | O-6's suppression seam is scoped to those two. Every other class keeps the generic recovery line unchanged, and the four entry-validation halts never reach it at all (M-8a). Widening the seam is a different feature. |
| **NR-4** | Re-measuring the halt catch. | Baseline §2.8 is the measurement (`M-8a … M-8j`). This REQ **cites** those facts and asserts nothing about shipped control flow beyond them. A claim here that contradicts an `M-8*` row is a defect in this REQ; a claim in an `M-8*` row that no longer holds at HEAD is fixed **in the baseline**, and this REQ follows it without re-deriving. This is root cause 1 of the predecessor's post-mortem, applied. |
| **NR-5** | Recovering automatically from a corrupt region or an unconfirmed write. | Both refuse and wait for an operator (AC-7.2, AC-7.5). A loop that repaired its own accounting could not distinguish its own torn write from a hand-edit, which is the fail-open R-10 exists to close. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision. **`REQ-RCV-01`
carries obligations under the same ids** — `O-*` is a per-REQ namespace in this family — and where
both name an id, each states the half its own criteria raise (§10).

| # | Obligation | Owner |
|---|---|---|
| **O-6** | Specify **where AC-7.1 runs within the phase body** — after `phaseGate`'s `{ skip: true }` exit and before any round opens (AC-7.3) — so that a refusal reaches step G's path (M-7a, M-7b) rather than returning early: the entry-validation halts nearby build their final report directly and never call the queue-row writer (M-8a), so a literal early `return` would leave the queue row unwritten. Also specify the **suppression seam** for the halt catch's recovery emit, which is guarded by nothing and fires on every halt class that reaches it (M-8d): on the two row-B variants the refusal's own recovery text stands in its place, and **every other halt class keeps that line unchanged** (NR-3). The seam must be built so that the two channels stay disjoint (M-8b) — suppressing the emit is not achieved by writing into `haltReason`. | TSPEC |
| **O-12** | Specify the **answering-line append and its confirmation** on the granting path: append one `WINDOW-START:`/`WINDOW-RESUMED:` line at the end of the region, re-read and confirm it **by byte comparison against what was written**, re-running AC-7.1 steps 1–3, and **dispatch no round until it is confirmed**; on an unconfirmable write take AC-7.5's fail-closed exit (no window, no round, phase refused, row B's unconfirmable-append variant). Specify how the comparison is performed so that a value tear is caught — a length or presence test is explicitly insufficient. The read-modify-write on the **halt** path is `REQ-RCV-01` O-5's and is not restated here. | TSPEC |
| **O-13** | Specify the **fixture builder** for reset regions: a helper that constructs a `POSTMORTEM-{phase}-{feature}.md` with a stated line sequence, a stated `RESOLVED:` state and a stated set of cross-review basenames on disk, so O-10's legs are written over a region rather than over a hand-pasted string. Every leg below is a region plus a listing plus an expected row; without one builder they will be built ten ways and three of them will be subtly wrong about document order. | TSPEC → PROPERTIES |
| **O-10** | Properties and tests for this requirement, by criterion. **AC-7.1:** two `HALT-REASON:` lines and one `WINDOW-START:` grant **exactly one** further window, `A = H` grants none; `WINDOW-START: 4` then `WINDOW-START: 9` at highest round 6 ⇒ `W` = 1; a `WINDOW-RESUMED:` unequal to the greatest prior `WINDOW-START:` ⇒ `W` = 1; both line kinds **appended**, asserted positionally, a prepending implementation failing; the empty region **valid** (`W` = 1, no refusal), distinguishing it from a corrupt one; **exactly one** S-16 on a two-fault region, `{reason}` the **first failing line in document order**, `counts-mismatch` **only** when every line passes step 2; the doc-type-scoped range check on §4.1's fixture (Phase F region `WINDOW-START: 4`, two FSPEC and five REQ rounds ⇒ invalid), the whole-listing reading failing. **AC-7.2:** the counts-mismatch refusal and its recovery **as a mutation pair** — two `HALT-REASON:` lines and no answering line refusing on that entry **and on a later entry that has not repaired**, `RESOLVED: yes` **not** consumed, `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report, then, after the whole-section deletion, the next halt re-creating a one-line region and the operator's **second** clearance opening the window; the same pairing for a **value** repair, the refusing entry's file **byte-unchanged**; **the ratchet** — no `HALT-REASON:` appended, no marker stripped, **same** reason next entry. **The strings (§6, catalogue §4), character for character:** the ❌ text `Refused — reset region corrupt at {path} ({reason})` and a recovery text naming *that reason's* repair; step G's `Refused — unresolved POSTMORTEM at …` and the **suppressed** generic queue-reset line both **absent** on **each** refusing entry and **present** on a control halt of another class (R-14's regression leg); `postmortemStatus` **equal to `written`** on **each** refusing entry, step G's `unresolved` its negative control, and `No POSTMORTEM was written.` **absent**. **AC-7.5:** the write **confirmed before** any dispatch; **torn-write legs parameterised over the truncation offset** — inside the key, inside the value, newline lost, **the well-formed `WINDOW-START: 1` case included** — every offset failing the byte confirmation, refusing on **this** entry and opening no round; **their sequel, asserted positively** — from that residue, the next entry **after act 1** finds `A < H`, the clearance unspent and the next grant at the correct origin, while the next entry **after act 1 was skipped** finds `A = H`, `W` = 1 and the clearance gone: **the pair**, because that entry is where the clearance is actually lost; catalogue §4's ❌ text, an **empty** `notice`, and a recovery naming **both** acts **in order**. **AC-7.6:** row B cell by cell in **both** variants — S-16 alone and **no** S-4; empty `notice` and no S-16 — told apart by the ❌ text and **not** by `notice`. **AC-7.3:** the **mid-window refusal**, the positive control — highest round 2, corrupt region, fresh clearance ⇒ **no round-3 cross-review file**, row B with `round` = 3 and S-16 alone, invocation terminating with the queue row `halted`; an implementation that falls back to `W` = 1 runs round 3 and fails this leg; a **skipped** entry leaving the region untouched, counts unmoved, **no** refusal. **Every "no round ran" leg carries a positive conjunct, not absence alone:** a **call-count oracle on the reviewer-dispatch seam** — exactly **0** dispatches on **each** refusing entry (both variants) and on the skipped entry, **≥ 1** on a control entry that does open a round — asserted *alongside* the file-absence check, since a test double that writes no file satisfies absence either way. **The non-validating legs are this REQ's in full** (X-07, paired with `REQ-RCV-01` O-10): *a region that does not validate consuming no clearance* — neither count moves, no answering line is written — and **0** dispatches on a non-validating entry are run **here**, on the production path this REQ wires; row 10 keeps only a contract leg asserting its interim composition calls the seam **0 times**, asserted on **its leg 1's** fixture — the only interim fixture that defeats the two earlier conjuncts and so the only one a wired implementation answers differently. Row 10 also keeps one **interim-only** leg this REQ replaces: a malformed `WINDOW-START:` value yields `W` = 1 there with no refusal (its §6 grammar, decidable without AC-7.1), while **AC-7.1 step 4 refuses that fixture with `invalid-window-start`** — an expected inversion, so the leg is rewritten here, not deleted. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Risk | Disposition |
|---|---|---|
| **R-10** | **The reset region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie in either direction, and one direction restores the per-invocation budget `REQ-RCV-01` AC-1.1 abolishes — silently and fail-open. | **Mechanised, not accepted.** AC-7.1 step 2 validates every answering line and step 3 the counts; either failure refuses the phase with S-16 (AC-7.2). The residual is the operator's — S-13's *never authored by a human*, plus AC-7.4's three sanctioned repairs and AC-7.5's act 1. |
| **R-11** | **A refusal costs a mid-window round.** On a branch with rounds left under `W` = 1, a corrupt region refuses the phase where the fallback would have run the next round. | **Accepted deliberately, and stated as the positive control (AC-7.3, O-10)** — whose fixture is synthetic until X-05 ships. A region whose accounting cannot be trusted is not a state to open a round over: the resulting cross-review could not be placed in any window. |
| **R-14** | **The suppression seam is a change to shipped behaviour in a file this family shares with every other feature.** The emit it suppresses fires on every halt class that reaches the catch (M-8d), so a seam built one notch too wide silences the recovery line for convergence, DoD, PUB and branch-guard halts too — a regression with no test of its own unless one is written. | **Mechanised by O-10's control leg**: the suppressed line is asserted **absent** on each refusing entry and **present** on a control halt of another class, so a widened seam reds the suite. NR-3 fixes the scope; O-6 owns the seam. |
| **R-15** | **The `M-8*` facts are measurements of a moving file** — baseline §2.8 records a ~356-line drift in `orchestrate-dev.js` across two commits days apart, and every §5 criterion touching shipped behaviour rests on one of those rows. | **Accepted, structurally contained.** NR-4 puts re-measurement in the baseline; BL-15 makes the facts a prerequisite checkable at FSPEC authoring; every row names its enclosing symbol and a distinctive literal, so a drifted line is a mechanical re-baseline, not a finding. This is what the predecessor's post-mortem (root cause 1, R-4) prescribes. |
| **R-16** | **`REQ-RCV-01` is deliverable as a requirement but has no decision procedure for its step-4 conjunct until this REQ ships** (X-07), and this row is a whole intervening feature away — `Order 18`, net pickup 10 → 12 → 18. | **Mitigated by leaving the conjunct unwired on row 10, not by sequencing and not by a stub** (paired with `REQ-RCV-01` R-14; `pdlc-rcv-split.md` §5). Sequencing is too weak at that distance, and all three interim procedures — the *invalid* stub (which would refuse every document-typed phase after its first halt, this row's own Phase R included), the *valid* stub (the fail-open this REQ exists to close) and the narrower procedure (which must still disagree with AC-7.1 in the unclearable direction until AC-7.4) — are rejected once for both ends at `pdlc-rcv-split.md` §5.1, and not restated here. So row 10 ships the two decidable conjuncts behind an unconsulted seam — plus `REQ-RCV-01` §6's S-13/S-14 **grammar**, which is in force there and which AC-7.1 step 2 re-checks — and this REQ wires the third conjunct's **analysis** layer with AC-7.1. Residual until then: `REQ-RCV-01` R-10's hand-edited-region fail-open, no wider than HEAD's. |

**Deferrals.** This REQ defers nothing of its own.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-07 | M-1d; M-7a, M-7b, M-7d, M-7e; **M-8a, M-8b, M-8c, M-8d, M-8e, M-8f, M-8g, M-8i** | P-1 (cost half), via `REQ-RCV-01` | US-04, US-07, US-08 | O-6, O-10, O-11, O-12, O-13 |

**Which `M-8*` rows are *not* cited, and why that is deliberate.** `M-8h` (the `No POSTMORTEM was
written.` line is *not* emitted on the class where the write actually failed) and `M-8j` (the catch's
queue-row notice, silent by design on a clean write) are read and hold, but no criterion here turns
on either: this REQ never produces a `write_failed` disposition, and it makes no claim about the
`notices` channel. They are named here so a reviewer can see the enumeration was complete rather than
partial.

**Where each clause came from.** Every criterion above is `REQ-RCV-01` v1.6 text, relocated on
2026-08-01 per `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` root causes 1 and 3
and recommendations R-3 and R-4:

| `REQ-RCV-01` v1.6 | Here |
|---|---|
| AC-1.5(4) — ordered algorithm steps 1–5; the `H − A` invariant and its domain; step 2's order-sensitivity and range-check re-evaluation | **AC-7.1** |
| AC-1.5(4) — *a refusal is not a halt*; the four bullets; step-G routing; the suppression paragraph; the `postmortemStatus` mechanism | **AC-7.2** |
| AC-1.5(4) — *where `W`'s resolution runs*; the three entry classes | **AC-7.3** |
| AC-1.5(4) — the sanctioned-repair table, the delete-an-answering-line table, *why `counts-mismatch` is repaired by deletion* | **AC-7.4** |
| AC-1.5(4) — *the answering line is written, and confirmed*; the two outcomes; the torn-write and value-tear paragraphs | **AC-7.5** (bytes of the render → catalogue §4) |
| AC-1.5(5) — *Row B, in two variants* | **AC-7.6** |
| §6 — *Refusal phase-row text*, *Refusal recovery text* | **§6**, owned |
| §6 — *Unconfirmed-append text* and its recovery | **catalogue §4**, cited by §6 |
| §6 — `reset-region-corrupt: …` | **§6**, read only (owner unchanged: `pdlc-rcv-budget-stop`) |
| O-6, O-12 | **O-6, O-12**, less O-12's `deriveRoundWindow` resolved-value clause, which stays with `REQ-RCV-01` AC-1.2 |
| O-10 — the algorithm, refusal, string, confirmation, row-B and placement legs | **O-10** |

**No requirement id, AC id, `S-*` id or threshold changed meaning in the split**, and the catalogue
stays closed at seventeen. `REQ-RCV-01` retains AC-1.1–AC-1.5 under their existing numbers; this
document's criteria are renumbered `AC-7.x` because they are stated under a new requirement id.

**Round-by-round history is deliberately not restated here:** `harvest-learnings` deletes
`CROSS-REVIEW-*` once LEARNINGS is written, so citing round files would be structurally wrong. This
REQ traces *measured facts*, not review history.

