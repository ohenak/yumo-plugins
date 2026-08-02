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

## 7. FSPEC-HALT-01 — Halt-path region maintenance

## 8. FSPEC-RPT-01 — Operator-visible reporting

## 9. FSPEC-PROMPT-01 — The post-mortem authoring prompt

## 10. Edge cases and error scenarios

## 11. Acceptance tests

## 12. Open questions

## 13. Traceability
