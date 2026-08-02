---
feature: pdlc-rcv-budget-stop
---

# FSPEC — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-rcv-budget-stop.md` v3.1 → **FSPEC** |
| Downstream | `TSPEC-pdlc-rcv-budget-stop.md`, `PLAN-…`, `PROPERTIES-…` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` while active |
| LEARNINGS | `docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` |
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — measured facts `M-*`, declared thresholds (§3, §3.1), durable homes (§3.2), shared non-goals `N-*` |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — vocabulary (§1), closed catalogue `S-1 … S-17` (§2), row schema (§3), row-B render (§4) |
| Shared split record | `docs/_constraints/pdlc-rcv-split.md` — paired edges (§5) and the shared arguments (§5.1–§5.8) |
| Sibling | `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (**REQ-RCV-07**) — the region's machinery, forward edge X-06 |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-02 |

## 1. Scope, inputs and altitude

This FSPEC specifies the **behaviour** of REQ-RCV-01's one requirement: a review window that is three
rounds wide, counted per document from an origin the operator can move exactly once per halt, and a
halt path that records the accounting the origin is read from.

**Altitude.** This document states, for every named branch, *what is observable after it is taken*:
which rounds are dispatched, which lines exist in which file, which strings the operator reads, what
the run report carries. It states **no** algorithm, decision procedure, seam, signature, module or
constant placement, byte-level write mechanic, fixture or oracle design. Those are TSPEC/PLAN and
PROPERTIES material and are **not missing here** (`REQ-RCV-01` §8 routes each one by obligation id).

**Inputs, and how they are cited.** The REQ, the shared baseline, the shared catalogue and the shared
split record. Shipped behaviour is referenced only by measured-fact id (`M-*`), never by line
(`REQ-RCV-01` NB-4). Boundary-crossing strings are referenced by catalogue id (`S-*`) and are **not
restated**, with the two exceptions §8 names — the Iterations heading, whose exact text this feature
introduces, and the ❌ row texts, quoted from catalogue §4 so an acceptance test has a subject.

**Vocabulary is the catalogue's** (§1 there): *current window*, *reset region*, *phase refusal*,
*approval refusal*, *blocking count*, *crashed round*, *zero-delta round*, *unavailable*. Used here
with exactly those meanings and not redefined.

### 1.1 What this FSPEC does not specify

| # | Not specified here | Owner |
|---|---|---|
| **F-N-1** | How the *region validates* predicate decides, what a torn region or answering line leaves behind, the sanctioned repair per S-16 reason, the validation-failure refusal's strings | `REQ-RCV-07` AC-7.1–AC-7.6 (forward edge **X-06**) |
| **F-N-2** | The fixed-point test, the zero-delta test, how a round's blocking count is read, S-3 and S-11 emission | `pdlc-rcv-fixed-point-stop` |
| **F-N-3** | Panel shape, verifier rounds, growth measurement, the round-anchor writer, `DOC-BYTES:` / `DOC-SHA256:` / `REVIEW-MODE:` | `pdlc-rcv-panel-topology` |
| **F-N-4** | Where in the pipeline each rule runs, which values are threaded through which seam, how test code reaches the budget declaration, the site enumeration | TSPEC (`REQ-RCV-01` O-12, O-13) |
| **F-N-5** | Fixtures, generation axes, call-count oracles, the falsification ledger's contents | PROPERTIES (`REQ-RCV-01` O-10), PLAN (O-15) |

### 1.2 The interim, stated once

`REQ-RCV-01` X-06 makes the *region validates* conjunct **not in force at this ship**. Every branch
below is therefore written twice where it differs: **at this ship** (the two decidable conjuncts — a
readable `RESOLVED: yes`, and `A < H`) and **at target state** (all three). Where a branch is marked
*target state*, no behaviour changes at this ship and no acceptance test asserts it here; the legs
belong to `REQ-RCV-07` O-10. Where a branch is unmarked it is in force now.

**In force at this ship, and easily mistaken for deferred:** the `WINDOW-START:` / `WINDOW-RESUMED:`
**grammars** (S-13, S-14) — a value outside the grammar contributes no origin while still counting
toward `A` — and both halt-path **confirmation** obligations with their refusals (§7).

## 2. Criterion and obligation map

| REQ criterion | FSPEC flow | Named branches |
|---|---|---|
| AC-1.1 (budget is three, per document, not per invocation), AC-1.2 (one constant, one budget) | **FSPEC-BUD-01** (§3) | B-BUD-1 … B-BUD-5 |
| AC-1.1, AC-1.5(1), AC-1.5(2) (window end, start, origin wins) | **FSPEC-WIN-01** (§4) | B-WIN-1 … B-WIN-7 |
| AC-1.5(4) read model; S-12, S-13, S-14, S-15 | **FSPEC-REG-01** (§5) | B-REG-1 … B-REG-7 |
| AC-1.5(3), AC-1.5(4), AC-1.5(5) (the gate, the answering line) | **FSPEC-CLR-01** (§6) | B-CLR-1 … B-CLR-7 |
| AC-1.4 (every halt maintains the region; no re-author) | **FSPEC-HALT-01** (§7) | B-HALT-1 … B-HALT-9 |
| AC-1.3 (reported quantities named), row C, row B | **FSPEC-RPT-01** (§8) | B-RPT-1 … B-RPT-6 |
| AC-1.4's no-re-author path; **O-9** | **FSPEC-PROMPT-01** (§9) | B-PMT-1 … B-PMT-3 |

**Obligations this FSPEC discharges.** **O-9** in full (§9). **O-14**'s FSPEC half — the Iterations
render's placement and not-found disposition, the empty reviewer-verdict list, the no-re-author
path — in §7 and §8, as observable outcomes; the threading is TSPEC's. **O-5**, **O-11**, **O-12**,
**O-13**, **O-10** and **O-15** are named where they attach and are **not** discharged here.

**DC-05 is honoured by construction:** every `B-*` id above appears in §11 with at least one
acceptance test. §11's first row is the index.

## 3. FSPEC-BUD-01 — The budget constant and every place it is reported

**Linked criteria:** AC-1.1 (scope), AC-1.2. **Threshold:** `MAX_REVIEW_ROUNDS`, default **3**
(baseline §3; note at §3.1). Written **`BUDGET`** below when the value, not the name, is meant.

### 3.1 Which loops the window mechanisms reach

The discriminator is *"the phase names a document type"*, not membership of a dispatch table.

| Branch | Loop | Window | Reset region, `W`, clearance, refusal |
|---|---|---|---|
| **B-BUD-1** | A **document-typed** review phase — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES | `BUDGET` rounds from the origin `W` (§4), **absolute per document** | apply in full |
| **B-BUD-2** | **Phase CR** — names no document type (M-7f) | `BUDGET` rounds from wherever that invocation starts — **per-invocation**, unchanged in kind, narrowed from 5 to 3 | **do not apply.** A Phase CR halt creates **no** `## Reset Region` and reads none |
| **B-BUD-3** | **Phase DOD** — runs its own loop, bounded by its own constant | takes **no value** from `BUDGET` | do not apply |

**Behavioural rule.** A phase that names no document type has no cross-review basenames of that type
to count from, so it has nothing an absolute window could be anchored to; giving it one would
silently anchor it to another document's history. This is `N-7` restated because AC-1.1 narrows it.

### 3.2 One budget, reported everywhere as the effective value

**B-BUD-4 — every report of the budget is the effective budget.** Wherever the pipeline reports the
budget to an operator — the non-convergence phase record, the post-mortem's Iterations section
(§8.1), and the returned `iterations` field (M-1c) — the value shown is the effective budget. A halt
message saying `5` while the loop admits 3 rounds is a defect, on any of the three surfaces and on
either loop class above. Phase CR keeps its shipped Iterations render, now carrying **3**; the
two-integer render of §8.1 is scoped to document-typed halts.

**B-BUD-5 — the width changes in one place.** After this feature ships, **exactly one
hand-maintained declaration in executable code states the budget's value**, repo-wide, production
and test code alike, and everything needing the value reads that declaration. Three classes of site
sit outside that count and are individually accounted for rather than forbidden (split §5.7):

| Class | Disposition |
|---|---|
| **Generated copy** — every occurrence under `pdlc/workflows/dist/` and `.claude/workflows/` | rebuilt in the same commit (**O-11**); CI's *Generated artifacts are in sync* job makes the rebuild non-optional. Outside the count, inside the enumeration |
| **Prose stating the number** — `CLAUDE.md`'s *Review loop mechanics* paragraph is the known one | updated **in the same commit** |
| **Deliberately pinned non-budget literal** — an expectation whose value happens to equal today's width but whose meaning is a fixed round count | stays a literal and **says so at its site** |

**The decidable observable is the enumeration, not a grep.** The change ships with a closed list of
every textual occurrence of the width, each classified into one of five classes — *the declaration*,
*read from it*, *generated copy*, *prose*, *pinned non-budget literal* — and that list is compared
against a repo scan **by machine**. A site absent from the list, or a second hand-maintained
executable declaration, is the violation. **Which** mechanism carries the comparison, **how** the
declaration is reachable from test code, and **which** sites exist are `REQ-RCV-01` O-13's (TSPEC);
this flow fixes only the outcome.

## 4. FSPEC-WIN-01 — Window resolution and round admission

**Linked criteria:** AC-1.1, AC-1.5(1), AC-1.5(2). **Scope:** document-typed phases only (B-BUD-1).

### 4.1 The three quantities, and the rule that relates them

| Name | Meaning | Where it comes from |
|---|---|---|
| **`W`** — the window origin | the first round of the current window | the reset region (§5); **1** when no reset is in effect |
| **`D`** — the derived start | one past the **highest existing round of the document type under review** on the branch; **1** when that type has no cross-review file | the branch listing (M-1d) |
| **`E`** — the window end | `W + BUDGET − 1` | computed |

**The rule.** The entry's start is **`S = max(D, W)`**, and the window is the rounds `S … E`.
Three consequences, each a named branch:

**B-WIN-1 — an open window dispatches.** When `S ≤ E`, rounds `S … E` are admitted and the loop
proceeds exactly as it does today: reviewers dispatched, cross-review files written at those round
indices, approval or the next round.

**B-WIN-2 — an exhausted window halts with zero rounds.** When `S > E`, **no round is admitted, no
reviewer is dispatched, no new cross-review file appears**, and the entry halts at once on the
budget path (§7). The halt raises **S-4**, rendered from the window and the constant — `rounds {W}..{E}
of {BUDGET}` — never a hard-coded `rounds 1..3 of 3`. With `W = 1` this is `rounds 1..3 of 3`; on a
post-clearance branch with `W = 4` it is `rounds 4..6 of 3`, which is correct and is the point of
rendering it.

**B-WIN-3 — the origin wins over a lower derived start.** When `D < W` the entry starts at `W`, not
at `D`. Reachable by one documented operator act and by no loop path: deleting cross-review files
after a window was granted, while the post-mortem survives. Both standing properties hold — review
history stays **append-only** (a start above `D` collides with no file) and **no window is widened**
(the window is still `BUDGET` rounds from `W`). Rounds below `W` are outside every window.

### 4.2 The origin's effect on the window's end

**B-WIN-4 — no reset in effect.** `W = 1`, so the window is `{1, 2, 3}` and the loop halts on
entering round **4**. A branch whose highest existing round is 2 is admitted **round 3 only**; one at
3 or more is admitted **no rounds** (B-WIN-2). This is the ordinary reading of *three rounds per
document*.

**B-WIN-5 — a reset in effect.** `W = 4` gives the window `{4, 5, 6}` and the halt on entering round
**7**. The origin qualifier is normative: the window's end is counted from `W`, never from the
highest existing round, so an operator's one clearance buys exactly `BUDGET` further rounds and no
more.

**Per document, always.** *"The highest round on the branch"* means **of the document type under
review** — in `D`, in the granting line's value (§6), and in row C's `round` cell (§8.2) — never the
whole directory. A window is a property of a document, not of a feature.

### 4.3 The escape hatch is the only route past the cap

**B-WIN-6 — `forcePhases` does not grant a window.** Forcing overrides a recorded **approval** and
nothing else. A forced entry into a document-typed phase whose document is already at or past `E` is
admitted **no rounds**: it takes B-WIN-2's zero-round halt, maintains the region (§7), emits row C
(§8.2), and writes the feature's `docs/_queue/QUEUE.md` row `halted`. This is a deliberate change to
a documented entry point.

**B-WIN-7 — a second force changes nothing, and the shipped gate is what stops it.** The first
forced halt strips the spent `RESOLVED:` marker (§7, clause 2), leaving the post-mortem unresolved
with `H = 1, A = 0`. A second force therefore meets the **shipped step-G refusal** — `Refused —
unresolved POSTMORTEM at {path}`, invocation terminated, queue row `halted` (M-7a, M-7b) — not a
count test and not a new halt. The counts are what the operator's *next* `RESOLVED: yes` spends.

### 4.4 Ordering against the gate

The window is resolved **after** the clearance gate has run (§6), because the gate can move `W` on
that same entry. Two consequences stated as outcomes:

- an entry that grants a clearance runs its rounds under the **new** origin, in the same entry;
- **target state (X-06):** an entry whose region fails to validate refuses **before** the budget is
  evaluated, so it produces no halt and no S-4. At this ship that branch is unreachable and every
  entry reaches the window arithmetic.

## 5. FSPEC-REG-01 — The reset region as a read model

**Linked criteria:** AC-1.5(4), §4.1. **Catalogue ids:** S-12 (`## Reset Region`), S-13
(`WINDOW-START: {N}`), S-14 (`WINDOW-RESUMED: {W}`), S-15 (`HALT-REASON: {value}`), S-16
(`reset-region-corrupt: …`). Grammars are the catalogue's and are **not restated**.

### 5.1 Where the region lives, and what counts as being in it

The region is the section headed exactly `## Reset Region` in `POSTMORTEM-{phase}-{feature}.md`,
from that heading to the next top-level heading or end of file, **outside any fenced block**. It is
the **only** place S-13, S-14 and S-15 lines are read from.

**One region per phase, per feature.** The post-mortem path is keyed by phase, so Phase R and Phase
F each have their own file and therefore their own region and their own `W`. A halt in one never
answers a clearance in the other. The path is **fixed and unversioned**: a document that halts twice
has one post-mortem, which is what makes the region cumulative.

**B-REG-5 — a line outside the region span counts for nothing.** A `HALT-REASON:` or
`WINDOW-START:` line quoted in the post-mortem's prose, inside its `## Recommendation`, or inside a
fenced block, is not a region line: it moves neither count and contributes no origin. This is what
stops the accounting being writable by ordinary prose.

### 5.2 The two counts and the origin

| Quantity | Read as |
|---|---|
| **`H`** | the number of `HALT-REASON:` lines in the region |
| **`A`** | the number of `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines in the region |
| **`W`** | the **greatest** well-formed `WINDOW-START:` value in the region; **1** when there is none |

**B-REG-3 — both counts are taken by line prefix, whatever the value.** A malformed value still
answers a halt. This is what keeps the accounting balanced when a value is unreadable: the clearance
was spent, and the region records that it was spent, even though the origin it claimed is unusable.

**B-REG-4 — a malformed answering value contributes no origin.** A `WINDOW-START:` whose value is
not a decimal integer ≥ 1 — `abc`, `-2`, empty — counts toward `A` and contributes **no value** to
`W`. When no well-formed value remains, `W` falls back to **1**: the narrowest window, never an
unbounded or non-numeric one. The S-13/S-14 grammars are **in force at this ship** (§1.2); only the
consistency analysis is target state.

**Values never descend.** Every granting line carries the **resolved** start (§6.2), so well-formed
`WINDOW-START:` values are non-descending across the region on every path. *Greatest* and *last
well-formed* therefore name the same line, and the operator act B-WIN-3 accommodates does not make
the region inconsistent.

### 5.3 The empty and unreadable readings

**B-REG-1 — no region.** No post-mortem file, or a post-mortem with no `## Reset Region` heading
outside fences ⇒ `H = A = 0`, `W = 1`, no reset in effect and no clearance outstanding. This is the
state of every document that has never halted, and of a feature whose post-mortem Phase H has
deleted (§10, E-6).

**B-REG-2 — a present but empty region.** A `## Reset Region` heading containing no `HALT-REASON:`
line reads exactly as B-REG-1 does. **Empty is valid, not corrupt**: it satisfies the validation
predicate vacuously and raises no notice.

**B-REG-6 — a present but unreadable post-mortem.** Read as `status: "none"` (M-7a) ⇒ **no halt in
force** *and* an empty region ⇒ `H = A = 0`, `W = 1`. Nothing is honoured and nothing is written —
the narrowest window, fail-closed in both directions at once.

### 5.4 Validation — the named predicate, and what it does at this ship

*The region validates* is a predicate on the region and the branch listing, **total and
single-valued**. This FSPEC fixes only its **meaning** and **failure disposition**; its decision
procedure is `REQ-RCV-07` AC-7.1's (**F-N-1**, forward edge X-06).

- **True** exactly when every answering-line value is well-formed and consistent with the lines
  before it and with the highest round on the branch, **and** `H − A ∈ {0, 1}`. The empty region
  satisfies it vacuously.
- **False** ⇒ fail-closed in four respects at once, all four **target state**: `W = 1`; the
  clearance is **not** consumed, so neither count moves and no answering line is written; the run
  report emits **exactly one** `reset-region-corrupt: {reason}` notice (S-16); and the entry
  **refuses the phase** — a *phase refusal*, terminating the invocation as an unresolved post-mortem
  does, with the queue row written `halted`.

**B-REG-7 — the interim, and its one observable.** At this ship the conjunct is **not wired**: the
predicate is **consulted zero times**, no entry refuses for a region reason, no `reset-region-corrupt`
notice is ever emitted, and every branch behaves as it does at HEAD. The observable is a count of
**0 consultations**, not an absence of effect — the two are distinguishable, and only the count
falsifies *"wired with an ad-hoc interim procedure"* (split §5.1, §5.4). The cost, time-boxed to
`REQ-RCV-07`'s queue row: a hand-edited region and the loop's own newly written region lines land in
a region nothing validates. Both are bounded by the accounting the two live conjuncts enforce —
every line still answers or records exactly one halt.

## 6. FSPEC-CLR-01 — The clearance gate and the answering line

**Linked criteria:** AC-1.5(3), AC-1.5(4), AC-1.5(5). **Runs before** the window arithmetic of §4.

### 6.1 The gate

A clearance is **unconsumed** exactly when all three hold:

1. a `RESOLVED: yes` is readable — a single unfenced marker, the shipped fail-closed reading (M-7a);
2. **`A < H`**;
3. **the region validates** (§5.4) — **target state**, not in force at this ship.

**There is no observable "first entry".** The counts are the whole state, so any entry that observes
all three grants; an entry that observes `A = H` grants nothing, however many times it runs. This is
what makes the reset **one-shot** across invocations rather than per-invocation.

**Only an operator resets.** The `RESOLVED: yes` marker is human-written, always. No agent and no
script ever writes it, and this feature does not change that (`N-4`). What the loop does on that
marker is everything below.

| Branch | Observed | Outcome |
|---|---|---|
| **B-CLR-1** | gate open; last `HALT-REASON:` begins `fixed-point:` or `budget-exhausted:` | a fresh window is granted: exactly one `WINDOW-START: {N}` appended (§6.2), `N` becomes the new `W` |
| **B-CLR-2** | gate open; last `HALT-REASON:` begins `no-revision:` (S-11) | the interrupted window is **resumed**: exactly one `WINDOW-RESUMED: {W}` appended, `W` **unchanged**, rounds already spent stay spent |
| **B-CLR-3** | gate open; last `HALT-REASON:` unparseable or any other value | treated as B-CLR-1 — **fail-closed**: the safe error is to consume a reset the operator can re-grant, never to hand out a free window |
| **B-CLR-4** | `A = H` (marker readable or not) | nothing written, nothing granted; `W` stays as §5.2 resolves it and the entry proceeds to §4 |
| **B-CLR-5** | no readable `RESOLVED: yes` — absent, `no`, unparseable, or **duplicated** | the **shipped step-G refusal**, unchanged: the phase does not run, the invocation terminates, the queue row is written `halted`. No region byte is written and neither count moves |

Both B-CLR-1 and B-CLR-2 leave `A = H`. **Every clearance is answered by exactly one line** — the
S-11 path included. Left unanswered, a clearance written for an unrelated authoring failure would
bank a free window for the *next* halt of any kind, once per such failure.

**B-CLR-2 is unreachable at this ship.** No halt path emits S-11 until `pdlc-rcv-fixed-point-stop`
ships (X-05), so every halt is a convergence halt and the table reduces to B-CLR-1/B-CLR-3. It is
stated over both from the start so nothing is re-specified when the successor lands.

**Three rows, not four — *absent* is not a case here.** The table is read only on an entry whose
gate is open, which requires `A < H`, hence `H ≥ 1`. An absent `HALT-REASON:` is the empty region's
case (B-REG-1/B-REG-2), one level up.

### 6.2 What the granting line carries

`N` is **the start §4.1 resolves — `max(D, W)`, the later of one past the highest existing round of
that document type and the origin then in effect** — and it becomes the new `W`. It is the
**resolved** start, never the derived one: writing the derived value where files were deleted would
make the region's values descend, which breaks the *greatest*-value reading, refuses under
`REQ-RCV-07` AC-7.1's later analysis, and grants a window that opens nothing.

**Accepted consequence:** after such a deletion the granted window may span round numbers the
deleted files held. That is correct — those rounds no longer exist on the branch, so all `BUDGET`
slots are dispatchable and nothing is overwritten.

### 6.3 Recording the grant, and the two orderings that matter

**B-CLR-6 — the answering line durably exists before any round of that entry is dispatched.** The
line is the sole record keeping the clearance one-shot. An entry that records it and then dies
before dispatching has spent a clearance whose rounds are still available, so the next entry runs
them — a bounded loss of nothing. Recording it last loses the record of a window already **used**
and re-grants it every invocation. The ordering fails toward the recoverable direction.

**Appended, never inserted.** Answering lines and `HALT-REASON:` lines alike are appended to the
**end** of the region, so document order is event order and each line is read against the lines
before it. This is normative: lines landing out of order fail validation, and because every later
halt preserves the region verbatim (§7), that failure would be permanent.

**B-CLR-7 — an unconfirmed answering-line write refuses the phase.** The write carries a
**present-in-the-region** confirmation — that *this* line is in the region, not merely that the file
exists. On failure: **no window, no dispatch**, the entry takes a **phase refusal**, both counts
unmoved, and the operator reads row B's *unconfirmable-append* variant with `{which}` =
**`answering line`** and an **empty** `notice` cell (§8.3). An IO fault of the loop is not a state of
the region, so no `reset-region-corrupt` reason is minted and the S-16 enum stays closed at three.
**What a partially-landed line leaves behind, and the sanctioned recovery, are `REQ-RCV-07`
AC-7.5's** (F-N-1) — this flow owns the condition and the disposition, not the residue analysis.

## 7. FSPEC-HALT-01 — Halt-path region maintenance

**Linked criterion:** AC-1.4. **Obligation:** O-5 (TSPEC owns the mechanism; this flow owns the
outcome).

### 7.1 What a halt still is, and what "every halt" quantifies over

**B-HALT-9 — unchanged in kind.** A halt writes `POSTMORTEM-{phase}-{feature}.md`, confirms the
write rather than trusting the agent's reply, refuses to re-run the phase until a human writes
`RESOLVED: yes`, and rewrites the feature's queue row to `halted`. This feature changes **when** a
halt happens and **what it says** — never what a halt is (`N-4`).

**Scope.** The rules below are quantified over **every halt that writes
`POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase**, with no exception inside
that set. They do **not** reach the pipeline's other halt classes — creator-agent failure, branch
guard, listing failure, Phase PUB/CI, Phase DOD — none of which writes a post-mortem, nor the
untyped phases (B-BUD-2, B-BUD-3). So **`H` counts exactly the halts in scope**: the only halts that
leave a marker for a clearance to clear.

**B-HALT-8 — a Phase CR halt creates no region.** Phase CR reaches the same post-mortem-writing path
(M-7f) and writes `POSTMORTEM-CR-{feature}.md`, but creates **no** `## Reset Region`, appends no
`HALT-REASON:` line and reads none. Its Iterations line keeps the shipped render, carrying the new
budget value (B-BUD-4).

### 7.2 The three clauses

**Clause 1 — the region exists after the halt, and carries this halt's line.**

- a halt finding **no** existing post-mortem **creates** `## Reset Region` containing exactly one
  `HALT-REASON:` line, its own (**B-HALT-1**);
- a halt finding an existing post-mortem **preserves** the region — every S-13, S-14 and S-15 line
  already in it, in document order — and **appends** its own `HALT-REASON:` to the end, with nothing
  above or between them (**B-HALT-2**).

One rule, read over an empty starting region. So `H` is exactly the number of halts in scope on
every path, and *"the last `HALT-REASON:`"* (§6.1) is the most recent halt's.

**Clause 2 — every unfenced `RESOLVED:` line in the file is stripped**, wherever it sits. The
post-mortem is therefore **unresolved after the halt**, and the operator must clear *this* halt
before the phase runs again. **B-HALT-6:** a **fenced** `RESOLVED: yes` survives — it is invisible to
the gate either way, so scoping the strip to unfenced lines changes no decision and stops the halt
path editing prose inside a human's code fence. The strip and clause 1 quantify over **disjoint**
sets: a `RESOLVED:` line is never a region line, so the strip reaching inside the region span
collides with nothing.

**Clause 3 — the Iterations section states *this* halt's two quantities**, at §8.1's render, on
**every** halt in scope, creating halt and re-halt alike. On a creating halt it overwrites whatever
the authoring agent emitted there; on a re-halt it rewrites that one section and nothing around it.
Placement and the not-found case are §8.1's.

**B-HALT-7 — one line per halt, carrying every reason that halt raised.** `{value}` is the
`; `-joined render, in catalogue §3's precedence order, of every halt reason raised by that halt, so
a round on which both the fixed-point and the budget conditions hold writes **one** line reading
`fixed-point: …; budget-exhausted: …`. The operator reads the identical string in the post-mortem
and in the report's `notice` cell.

### 7.3 The order, the one-update rule, and confirmation

**The clauses run in one order: 3 → 1 → 2**, in **two** confirmed writes, not three, because
**clauses 1 and 2 are one update of one file**.

**The invariant that makes it one update:** after a halt in scope there is **no reachable state in
which this halt's `HALT-REASON:` line is present and an unfenced `RESOLVED:` line survives.** Clause
2 therefore owes no disposition of its own — its confirmation is clause 1's, and its failure is
clause 1's failure. A separately losable strip would leave a readable marker beside an incremented
`H`, which is exactly what §6.1's gate reads as an unconsumed clearance: a window no operator
cleared, re-granted on every later halt while the fault lasted, with no notice and nothing in the
report (split §5.8).

**Both writes are confirmed, and both confirmations are content reads, not return codes:**

| Write | Confirmed by |
|---|---|
| clause 3 (the Iterations section) | an **equality read-back** — the located heading's text equals §8.1's render for this halt |
| the clause 1-and-2 update | **this halt's `HALT-REASON:` line is present in the region**, *and* no unfenced `RESOLVED:` line remains in the file |

An existence-shaped check on the file is **not** sufficient for clause 1: on a re-halt the file
always exists, so such a check passes whether or not the line landed — and that is the path that
matters. A lost line under-counts `H`, so `A = H` would hold forever and no later `RESOLVED: yes`
would ever grant.

**Failure disposition — fail-closed, both writes.**

**B-HALT-4 — clause 3 unconfirmed.** The entry ends there: clause 1 and clause 2 do not run, so the
region is **byte-unchanged**, **no halt is recorded**, and **no `RESOLVED:` line is stripped**. The
entry takes a **phase refusal** and the operator reads row B's *unconfirmable-append* variant with
`{which}` = **`iterations section`**.

**B-HALT-5 — the clause 1-and-2 update unconfirmed.** No halt is recorded, nothing is stripped, and
this entry's Iterations render is present (clause 3 already landed). The entry takes a **phase
refusal**; `{which}` = **`halt line`**.

In both cases both counts are unmoved, `notice` is **empty**, `A ≤ H` is preserved, and **no
`RESOLVED:` marker is ever stripped against a halt that left no line**. A **torn** write —
partially landed — is `REQ-RCV-07` AC-7.5's (F-N-1).

**Accepted cost, stated.** A **creating** halt whose clause 1-and-2 update fails leaves an
unresolved post-mortem with `H = 0`, so the operator's first `RESOLVED: yes` grants nothing and the
re-halt needs a second. Fail-closed in the right direction: no window without a recorded halt.

### 7.4 A halt that finds an existing post-mortem does not re-author it

**B-HALT-2, stated as a closed list.** Such a halt performs clauses 1, 2 and 3 and **changes nothing
else**: **no authoring dispatch**, and every other section — `## Recommendation` included — is
**byte-unchanged**. The complete list of what a re-halt changes is therefore: the region span, every
unfenced `RESOLVED:` line, and the Iterations section.

Only a halt finding **no** post-mortem authors one (M-7e) — including on a zero-round entry, where
that dispatch runs unchanged at the shipped prompt (§9.2).

**Why.** The operator's `RESOLVED: yes` answers a *specific* `## Recommendation`; re-authoring would
replace it with one written from zero rounds of new evidence — the commonest new case — and would
spend roughly a review round on an entry that dispatched no reviewer. The Iterations section is
nonetheless refreshed because it is a loop-computed two-integer render, not an authoring dispatch,
and leaving it stale would show the operator the *previous* halt's rounds-run on exactly the entry
AC-1.3 promises reports this one's.

**The region is the loop's guarantee, not an agent's diligence** — §9's prompt clause is
belt-and-braces, never the mechanism.

## 8. FSPEC-RPT-01 — Operator-visible reporting

**Linked criteria:** AC-1.3, AC-1.5(1). **Obligation:** O-14's FSPEC half.

### 8.1 The Iterations section

**B-RPT-1 — the render, and the two quantities it names.** The post-mortem's Iterations section
reads exactly:

```
## Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})
```

two decimal integers ≥ 0, where the first is the **effective budget** and `{k}` is **the number of
rounds this halting entry dispatched**. It **replaces** the shipped literal, whose single number and
*"limit reached"* phrase are false on a zero-round halt. The render is **one line** — the heading's
own text, not a heading plus a body line — so an oracle over it has a single target and can be an
**equality**, not a substring match that any rendering satisfies.

**It is the loop's output, not an agent's.** The render is the operator's guarantee, so it may not
rest on an agent's compliance with a prompt, and the loop writes it on every halt in scope (§7.2,
clause 3) — which is what makes an equality assertion falsifiable against production.

**On every halt in scope, re-halt included.** This is the case the criterion exists for: a second
entry into an exhausted window is by construction a zero-round halt, so an operator reading the
*previous* halt's `rounds run {k}` would read exactly the conflation this forbids.

**B-RPT-2 — where the section is found.** The **first top-level heading whose text begins
`Iterations`**, case-sensitively, outside any fenced block. Whatever that heading carried is
replaced by the render.

**B-HALT-3 — when no such heading is found, the loop inserts one rather than failing.** The new
heading goes **immediately above `## Reset Region`**, wherever that section sits, or at the **end of
the file** when there is none. Total in both directions, and region parsing is unaffected either
way. Two paths reach it: a post-mortem written before this feature landed, and one an authoring
agent wrote without the section.

**B-RPT-3 — the other two budget surfaces.** The non-convergence phase record and the returned
`iterations` field both carry the **budget**, not the rounds run (B-BUD-4). All three surfaces are
asserted **over the constant**, never over the literal `3`.

### 8.2 Row C — the report row of a zero-round budget halt

**B-RPT-4 — cell by cell.** A halt admitted no rounds (B-WIN-2) still produces one run-report row,
in catalogue §3's schema:

| Column | Value |
|---|---|
| `round` | **the start §4.1 resolves** (`S`) |
| `panel-shape` | **empty** — nothing was dispatched |
| `blocking` | **empty** |
| `growth-bytes` | **empty** — nothing was measured |
| `classification` | **empty** |
| `notice` | **exactly this halt's S-4 render**, with no separator and nothing else |

The `notice` cell is a `; `-joined list in catalogue §3's precedence order in general, but is
**vacuous on row C by construction**: no round is dispatched, so no S-3, S-5 or S-6 can be raised;
and rows B and C are mutually exclusive, so no S-16 either. A test may assert the cell is **exactly**
the S-4 render.

**B-RPT-5 — the returned per-reviewer verdict list is empty on a zero-round halt.** Not a carry-over
of the previous round's reviewers and their verdicts, which would report verdicts for reviewers this
entry never ran, in the same report as row C's deliberately empty cells.

### 8.3 Row B — the report row of a refusing entry

**B-RPT-6.** An entry that **records no halt** emits row B. It has two variants and, at this ship,
**three sources**, all dispatch-less:

| Variant | Source | `notice` | ❌ phase-row text |
|---|---|---|---|
| *unconfirmable-append* | the answering line (B-CLR-7) | **empty** | `Refused — answering line unconfirmed at {path}` |
| *unconfirmable-append* | clause 1-and-2, the halt line (B-HALT-5) | **empty** | `Refused — halt line unconfirmed at {path}` |
| *unconfirmable-append* | clause 3, the Iterations section (B-HALT-4) | **empty** | `Refused — iterations section unconfirmed at {path}` |
| *validation-failure* — **target state** | a region that does not validate (§5.4) | **S-16 alone** | `REQ-RCV-07` §6's |

`{path}` is the post-mortem's repo-root-relative path. **The three unconfirmable-append sources are
distinguished by the ❌ text, never by the `notice` cell**, which is empty on all three: the
`{which}` token is what scopes the operator's recovery, and one of the three attempts no region line
at all. **The render, the recovery text and the residue analysis are catalogue §4's** and are cited,
not restated here; the *conditions* under which each fires are §6.3 and §7.3's.

**Rows B and C are mutually exclusive, discriminated by *records*, not by *takes*.** B's entry
records no halt — including the two sources that **do** take a halt and are refused before recording
it; C's entry records one. So **B never carries S-4 and C never carries S-16**.

**A refusal is not a halt.** The entry returns without running the rest of the flow, leaves the
`RESOLVED:` marker in place, writes no post-mortem byte on the validation-failure variant, and
terminates the invocation on the same path an unresolved post-mortem takes — ❌ phase row, queue row
`halted` (M-7a, M-7b). Left running instead, the entry would reach the budget halt of §4, which
would append its own `HALT-REASON:` and strip the operator's marker — spending the clearance it
declined to spend and converting a repairable region into an unrepairable one.

### 8.4 The operator-visible surfaces, gathered

So that a reader can check the value claim without reassembling it: the **budget and rounds-run** in
the post-mortem's Iterations section and in the run report; the **`## Reset Region`** and its lines;
**row C**, saying why an invocation did nothing; **row B**, saying why an invocation refused; and
the **S-4 reason**, identical in the post-mortem and in the report.

## 9. FSPEC-PROMPT-01 — The post-mortem authoring prompt

**Obligation:** O-9, in full. **Linked criterion:** AC-1.4's no-re-author path.

### 9.1 The belt-and-braces clause

**B-PMT-1 — the prompt tells the authoring agent that `## Reset Region` is machine state.** The
post-mortem authoring dispatch's prompt gains a clause stating that the section headed
`## Reset Region`, and every line inside it, is written and maintained by the loop: the agent does
not create it, edit it, reorder it, quote its lines into another section, or delete it.

**B-PMT-2 — and that it never writes a resolution marker.** The same clause restates the standing
rule that `RESOLVED:` is human-written only. Agents already do not write it; stating it at the one
prompt that authors this file removes the accident.

**This clause is not the mechanism.** Region maintenance is the loop's (§7, O-5), and every
guarantee this FSPEC makes about the region holds whether or not the agent honours the clause. A
finding that the clause is unenforced is **correct and by design** — enforcement would be a
different feature, and the loop already overwrites or preserves what matters.

**B-PMT-3 — whatever the agent writes as an Iterations section is replaced.** Clause 3 runs after
the authoring dispatch on a creating halt (§7.3), so the agent's version of that heading never
reaches the operator. The prompt's required-section list is otherwise unchanged.

### 9.2 What the prompt is *not* asked to do

**Not in scope: changing what the authoring agent writes into a post-mortem created by a
zero-round halt.** On such an entry no reviewer of *this* window ran, so the agent's evidence-bearing
sections are thin or drawn from the **previous** window. This is **correct, known and accepted**:
the two things the `RESOLVED: yes` decision needs are both **loop-written and pinned** — §8.1's
render, showing `rounds run 0` so the vacuity is visible rather than disguised, and the
`HALT-REASON:` line naming S-4. Changing the prompt's content beyond B-PMT-1/B-PMT-2 would change
*what a halt is* (`N-4`). The cost is one authoring dispatch on the **first** halt only; every later
entry dispatches none (§7.4).

## 10. Edge cases and error scenarios

| # | Scenario | Behaviour | Branch |
|---|---|---|---|
| **E-1** | **Migration.** At the landing commit a branch's document already carries 4 or 5 rounds | admitted **no rounds**; halts on the budget path; S-4 renders `rounds 1..3 of 3` while five files sit on disk — the render states the **window**, not the file count. The escape is the ordinary clearance. **No migration script** | B-WIN-2 |
| **E-2** | Cross-review files deleted after a window was granted, post-mortem surviving | derived start falls below the origin; the entry starts at `W`. Append-only preserved, window not widened | B-WIN-3 |
| **E-3** | A round on which two halt conditions hold at once | **one** `HALT-REASON:` line, `; `-joined in catalogue §3 precedence order; the same string in the report's `notice` cell | B-HALT-7 |
| **E-4** | A post-mortem with no heading beginning `Iterations` — pre-feature, or an agent that omitted it | the section is **inserted** immediately above `## Reset Region`, or at end of file; never a failure | B-HALT-3 |
| **E-5** | Two or more unfenced `RESOLVED:` lines | the shipped gate reads the marker as **unresolved** (duplicated); the phase is refused. Not this feature's change — and each halt's strip is what keeps the marker single-valued | B-CLR-5 |
| **E-6** | **Phase H deletes the post-mortem** once `LEARNINGS-{feature}.md` exists | the region's home goes with it. Benign within a feature — Phase H runs after every review phase, so no window outlives its post-mortem. A post-harvest `forcePhases` re-entry reads `W = 1, H = A = 0`: the default of a document that never halted. **A surviving home is a new artifact, hence a new REQ** | B-REG-1 |
| **E-7** | A repeating S-11 halt (target state, once `pdlc-rcv-fixed-point-stop` ships) | `H` and `A` grow together and the window is never charged, so the sequence is unbounded **in principle**. **Accepted, bounded by the operator**: every iteration costs one hand-written `RESOLVED: yes`, so it is never unattended. Capping it would need a second counter that could only deny an operator choosing to continue | B-CLR-2 |
| **E-8** | The post-mortem exists but cannot be read | no halt in force **and** an empty region: `W = 1`, `H = A = 0`, nothing honoured, nothing written | B-REG-6 |
| **E-9** | A `HALT-REASON:` or `WINDOW-START:` line quoted in `## Recommendation` or inside a fenced block | counts for nothing — not in the region span | B-REG-5 |
| **E-10** | `WINDOW-START: abc` / `-2` / empty in the region | counts toward `A`, contributes no origin; `W` falls back to the greatest well-formed value, else **1**. No non-numeric value ever reaches the window arithmetic | B-REG-4 |
| **E-11** | A halt whose queue-row commit is refused (hook, missing identity, index lock) | the shipped `halted (uncommitted)` outcome, unchanged — the row is correct on disk and the halt is never downgraded. Outside this feature's change | B-HALT-9 |
| **E-12** | One feature, several document-typed phases | one post-mortem, one region and one `W` **per phase**. A halt in Phase R never answers a clearance in Phase F | §5.1 |
| **E-13** | The region is hand-edited so the counts lie | **at this ship** nothing validates it, so a hand-edit can grant or deny a window — operator-caused, operator-visible, and **no wider than HEAD's**, where the fail-open is unconditional. Closed at target state by the third conjunct (§5.4) | B-REG-7 |
| **E-14** | A **creating** halt whose halt-line update is unconfirmed | phase refusal, no halt recorded, `H = 0` on an unresolved post-mortem: the operator's first `RESOLVED: yes` grants nothing and the re-halt needs a second. **Accepted** — fail-closed, no window without a recorded halt | B-HALT-5 |
| **E-15** | An entry that grants a clearance and then dies before dispatching a round | the clearance is spent while its rounds are still available, so the next entry runs them. **A bounded loss of nothing**, and the deliberate direction of §6.3's ordering | B-CLR-6 |

**Two error classes deliberately not dispositioned here.** A **torn** (partially landed) region or
answering line, and the sanctioned repair per S-16 reason, are `REQ-RCV-07` AC-7.5 and AC-7.4's
(F-N-1). A finding that this document does not say what a torn write leaves behind is **correct and
known by construction**.

## 11. Acceptance tests

## 12. Open questions

## 13. Traceability
