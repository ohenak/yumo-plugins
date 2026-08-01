---
feature: pdlc-rcv-fixed-point-stop
ready: true
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-rcv-fixed-point-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. **Read it first.** Facts are cited by id (`M-2a`) and are not restated here. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3). Terms and ids are used by reference and never restated. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**), via `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` v1.0 — this REQ carries that document's REQ-RCV-02 unchanged in substance. |
| Siblings | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (REQ-RCV-01) — **the dependency**; `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root cause 2; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-fixed-point-stop.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

## 1. Problem

This REQ carries the **enforcement** half of the shared baseline's stopping defects — the two
tests that decide, from the branch, that another round buys nothing.

- **P-2 — the stopping rule is advisory, so it does nothing.** The fixed-point rule has been
  written into three consecutive REQ preambles and honoured by none, because nothing in
  `orchestrate-dev` reads a rule written in the document under review. On the measured run its test
  was satisfied at round 3 (6 → 6); rounds 4 and 5 ran anyway, consumed two full
  author-plus-two-reviewer cycles, added 66 KB — 40% of the finished document — and ended with
  *more* blocking findings than the round on which the rule fired. Both counts the rule needs are
  already machine-readable (M-2a). The enforcement is available and simply unbuilt.
- **A round can be dispatched against a document no authoring episode revised.** Measured on the
  predecessor and on the superseded parent itself: round 3 of the parent's own Phase R reviewed a
  byte-identical file — both reviewers verified the blob hash was unchanged, both carried every
  finding forward verbatim, and one round of a five-round budget bought a review that could not
  differ from its predecessor.

The dependency `pdlc-rcv-budget-stop` carries the **window** these tests are stated over — the
three-round budget, its origin `W`, and the halt path both tests halt on. Sibling
`pdlc-rcv-panel-topology` carries P-1's review-surface half (panel shape, revision size);
`pdlc-rcv-finding-quality` carries P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-03** | *As the operator*, I want the run report to tell me what stopped the loop and what remains unsettled, so that I can act on a halt without reading ten cross-review files and reconstructing a trajectory table by hand. |

**Value.** The fixed-point stop saves at least one optimizer episode whenever it fires, and a
saved round of reviewers when it fires at the window's second round; the zero-delta stop converts
an authoring failure into a named halt instead of a consumed round. Neither claims the
dependency's unconditional cost saving — that is the round cap's, and it lands with or without
this REQ. **Operator-visible surfaces:** a halt with a named reason on a round the operator can
see was non-decreasing; the per-round report table (AC-2.9), which makes the determination
re-derivable after the fact.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch and contains that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-02** | `parseVerdict` returns machine-readable `{verdict, high, medium, low, malformed?}` | Symbol present in `pdlc/workflows/orchestrate-dev.js` (M-2a) | Must exist at HEAD — every AC below is stated over its output |
| **BL-07** | `sha256Hex` and `canonicaliseForDigest` are present and canonicalise **inside** the digest function | Symbols present (M-7c) | Must exist at HEAD — AC-2.8's identity test reuses them verbatim |
| **BL-12** | **Feature `pdlc-rcv-budget-stop` merged.** Its AC-1.5 defines the window origin `W` and the reset region; its AC-1.4 defines the halt path both tests here halt on, and the `HALT-REASON:` line that records which halt it was. | The feature's artifacts on the default branch, and `MAX_REVIEW_ROUNDS === 3` in `pdlc/workflows/orchestrate-dev.js` | **Hard dependency.** Every AC below that says "round N of the current window" is stated over that REQ's `W`. Shipping this REQ first would leave both tests stated over a window nothing defines. |

**All of BL-01, BL-02 and BL-07 hold on the default branch** at `9486c81`, each checkable there by
the observable in its Resolution-form column. Nothing here offers a fallback if that upstream
mechanism is later reverted.

### 3.1 Two cross-REQ prerequisites, and what happens before they ship

Two of this REQ's operands are **written** by acceptance criteria in `pdlc-rcv-panel-topology`,
which ships **after** this REQ. Both are stated as prerequisites rather than assumed, and both
degrade — never fail unsafely — while outstanding.

| # | Owed by | What this REQ reads | Behaviour until it ships |
|---|---|---|---|
| **X-01** | `pdlc-rcv-panel-topology` REQ-RCV-03 AC-3.4 — the count trailer required **inside** the cross-review file's `## Verdict` section | AC-2.1's two operands, via `extractFileVerdict` → `parseVerdict` (M-2e) | A file with no in-file trailer reads *unavailable* (AC-2.7), which breaks AC-2.1's chain in both directions. The rule **fires less often; it never fires wrongly.** Degradation, not defect. |
| **X-02** | `pdlc-rcv-panel-topology` REQ-RCV-04 AC-4.1 — `appendRoundAnchors`, the unconditional per-round writer of `DOC-BYTES:` (S-2) and `DOC-SHA256:` (S-10) | AC-2.8's zero-delta test | With either anchor absent the test is **not evaluated** and the round proceeds — the fail-open branch AC-2.8's own receive side already states, chosen precisely so a missing anchor can never manufacture a halt. |
| **X-03** | `pdlc-rcv-panel-topology` REQ-RCV-03 AC-3.1/AC-3.5 — the verifier role slug and `REVIEW-MODE:` | AC-2.4's panel-shape comparability test | Until verifier rounds exist every round's slug set is `{software-engineer, test-engineer}`, `unequal-panel-shape` is unreachable, and AC-2.4 reduces to its `crashed-round` branch. AC-2.4 is stated over both from the start, so nothing is re-specified when the sibling lands. |

**Consequence for sequencing.** This REQ is deliverable and useful once its dependency has
shipped: AC-2.1 fires on any round pair whose reviewers do emit an in-file trailer, and AC-2.8 is
inert rather than wrong. `pdlc-rcv-panel-topology` depends on **this** REQ as well as on
`pdlc-rcv-budget-stop`, because its anchor writer is consumed by AC-2.8 and its report cells
extend the schema AC-2.9 populates.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *blocking count*, *panel shape*, *crashed*
round, *current window* / round `W`, *zero-delta*, *unavailable*, *malformed*, *phase refusal*,
*approval refusal* — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and is **not**
restated here, so the family cannot drift into two meanings.

This REQ **owns** three catalogue ids and **reads** four:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-3** `fixed-point: …` | owned | AC-2.1's halt reason |
| **S-5** `not-comparable: {reason}` | owned | AC-2.3, AC-2.4, AC-2.7 |
| **S-11** `no-revision: …` | owned | AC-2.8's halt reason |
| **S-2** `DOC-BYTES:` / **S-10** `DOC-SHA256:` | read only | AC-2.8's two endpoints. Written by `pdlc-rcv-panel-topology`'s `appendRoundAnchors` (X-02); this REQ emits neither and may not change their grammar |
| **S-4** `budget-exhausted: …` / **S-15** `HALT-REASON:` | read only | AC-2.2's co-occurrence rule and the line the dependency's halt path writes |

**Durability.** The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f),
so any criterion stated over in-process state is undefined on a resumed phase — the normal case.
**A criterion stated over an in-process-only row is a defect in this document; there is no such
row.** Every quantity below has a durable on-branch home: `blocking(N)` in the count trailer
inside round N's cross-review files (X-01) — *unavailable* if absent; panel shape in the role
slugs of those files, and nothing else — *crashed* if the set is non-canonical;
`bytes(document as reviewed at round N)` and its digest in the `DOC-BYTES:` / `DOC-SHA256:`
anchors of round N (X-02) — the test is not evaluated if either is absent. Only the **earlier**
endpoint is ever read from an anchor; the later endpoint is read live at round-open.

Where a quantity had no durable home at HEAD — the blocking counts and the byte anchor — the
family gives it one, on a surface that already exists for exactly this purpose: the cross-review
file's `KEY: value` anchor block (M-4a, M-4b).

## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who / Given / When / Then form and is stated
over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-02 — The fixed-point stop is enforced by the loop, not by prose

**Priority:** P0 · **Source:** US-01, US-03 · **Depends on:** BL-01, BL-02, BL-07, BL-12, X-01, X-02

**AC-2.1 — The rule, and where each operand comes from.** *Who:* the review loop. *Given:* a
failed round **N ≥ 2 of the current window** — round N's reviewers did not all approve, and
`N − 1 ≥ W` — whose blocking count and whose predecessor round N−1's blocking count are both
**available** (AC-2.7) and **reliable** (AC-2.3), and whose panel shape equals round N−1's
(AC-2.4). *When:* round N's verdicts have been parsed and **before** round N's optimizer episode
is dispatched. *Then:* if `blocking(N) ≥ blocking(N−1)` **and** `blocking(N) > 0`, the loop halts
on the existing post-mortem path (`pdlc-rcv-budget-stop` AC-1.4) instead of iterating, and does
not dispatch that optimizer episode. The halt reason is S-3.

**Both operands are read from the cross-review files on the branch**, by `extractFileVerdict` →
`parseVerdict` (M-2e), never from the in-process agent response: the response-side result (M-2a)
lives only in the invocation that took it, and the branch-side state the loop rebuilds **discards
the counts** (M-2f), so an in-process operand is undefined for round N−1 on any resumed phase —
the normal case. Reading both from the same durable surface makes the rule invocation-agnostic by
construction: the same branch yields the same decision whoever evaluates it, and the determination
is re-derivable after the fact from the files alone, which is what makes AC-2.9's report auditable.
This is why X-01 is a prerequisite rather than an assumption.

**AC-2.2 — The halt is distinguishable from budget exhaustion.** *Who:* the operator. *Given:* a
fixed-point halt. *When:* they read the post-mortem and the run report. *Then:* the halt reason
names the fixed point and carries the two counts and the two round numbers that triggered it, and
is textually distinct from the budget-exhaustion reason. An operator must be able to tell, without
reading the cross-review files, whether the loop ran out of rounds or stopped making progress.

**When more than one halt condition holds, the operator sees all of them, in the catalogue §3
order.** On the last admitted round the fixed-point test and the budget can both be satisfied; the
`notice` cell then carries S-3 and S-4 in that order, and the post-mortem's `HALT-REASON:` line
(`pdlc-rcv-budget-stop` AC-1.5(5)) carries the same `; `-joined string, so the operator sees the
same two reasons in the same order in both places. The catalogue's precedence table gives S-3 and
S-4 **two rows** for exactly this reason. AC-2.1 **is** evaluated on the last admitted round — it
happens before that round's optimizer episode *would* be dispatched, and "would be" is not "is": a
round that dispatches no optimizer still has verdicts to compare. **S-11 never co-occurs with
either**, although it sorts ahead of both: an S-11 halt is decided at round-open, before the round
is dispatched, so its row is the undispatched round's and carries S-11 alone (AC-2.8), while S-3
and S-4 are decided after a round's verdicts exist.

**AC-2.3 — Unreliable counts break the chain; they never fire the rule.** *Who:* the review loop.
*Given:* any reviewer in round N or N−1 whose verdict parse is `malformed` (M-2b) after the
existing recovery pass (M-2d) has been attempted and has also failed. *When:* AC-2.1 would be
evaluated. *Then:* the comparison is **not made**, the loop continues to the next round, and the
run report records that the round was not comparable and why (S-5, `malformed-count`). A count
nobody could read is not evidence of a plateau. Because the rule compares only *consecutive*
rounds, an unreliable round is neither a trigger nor a baseline: it breaks the chain in both
directions.

**AC-2.4 — Rounds of different panel shape are not comparable, and a crashed round has no shape.**
*Who:* the review loop. *Given:* rounds N and N−1. *When:* AC-2.1 would be evaluated. *Then:* the
comparison is **not made**, and the run report carries S-5 with the matching reason, if either
holds:

- **unequal panel shape** (`unequal-panel-shape`) — the two rounds' on-disk role-slug sets differ,
  which under `pdlc-rcv-panel-topology`'s panel rule is the normal relationship between round `W`
  (dual) and round `W+1` (single verifier). A sum over two reviewers and a sum over one are not the
  same measurement, and normalising them would be a guess this family declines to make (N-2).
- **either round is crashed** (`crashed-round`) — its on-disk role-slug set is not one of the two
  canonical sets (catalogue §1). The discriminator is the **slug**, not the `REVIEW-MODE:` marker: a
  lone file under slug `verifier` is a verifier round on its face, a lone file under
  `software-engineer` or `test-engineer` is a dual round one of whose reviewers crashed, and the two
  are distinguishable without reading a byte of file content. Stating comparability over the slug set
  keeps it independent of the marker, which matters because the slug set is produced by the path
  derivation (M-3b) on every round — including one on which every reviewer crashed after writing
  nothing, where the set is empty and the round is crashed, correctly. The marker remains
  load-bearing for the *approval* path, where fail-closed on a lone unmarked file is the right
  posture (M-3d) and is unchanged.

A crashed round is neither a trigger nor a baseline; it breaks the chain in both directions.

**AC-2.5 — A zero-to-zero comparison must never fire.** *Who:* the review loop. *Given:*
`blocking(N) = 0` and `blocking(N−1) = 0` on a round that nevertheless failed. *When:* AC-2.1 is
evaluated. *Then:* the rule does **not** fire — this is the purpose of the `blocking(N) > 0`
conjunct. `0/0/0` is a *genuine* parse in this codebase (M-2c), so a naive `≥` would read a round
with no blocking findings at all as a plateau and halt a document that is one Low finding away
from approval. Zero blocking findings is the best possible round, not the worst.

**AC-2.6 — The rule bounds work, and it is honest about how much.** *Who:* the operator. *Given:*
the dependency's three rounds. *When:* the rule fires. *Then:* how often it can fire depends on
which of the baseline §1.4 regimes the run is in. These are **all** the panel-shape sequences
reachable under `pdlc-rcv-panel-topology`'s panel rule and growth classification, each stated over
**the growth into the round in the row** and read over the three rounds of a window (`W`, `W+1`,
`W+2`; `W = 1` when no reset has been granted):

| Reachable sequence (rounds `W`, `W+1`, `W+2`) | When | Comparable consecutive same-shape pairs | Rule can fire at |
|---|---|---|---|
| dual, dual, dual | the growth into `W+1` and into `W+2` both exceed 12,000 — **the measured regime** (5 of 5 predecessor rounds) | (`W`, `W+1`) and (`W+1`, `W+2`) | round `W+1` **or** round `W+2` |
| dual, verifier, verifier | both growths ≤ 12,000 — the target regime | (`W+1`, `W+2`) only | round `W+2` |
| dual, verifier, dual | growth into `W+1` small, into `W+2` large | none | never |
| dual, dual, verifier | growth into `W+1` large, into `W+2` small | (`W`, `W+1`) | round `W+1` |
| any sequence containing a crashed or unavailable round | a reviewer crashed or wrote no trailer | fewer than the above | correspondingly fewer |

Every cell is stated over the window's offsets, not over absolute round indices: on a branch reset
to `WINDOW-START: 4` the absolute-index reading is off by `W − 1` on every row. With `W = 1` the
rows read as rounds 1, 2, 3. The honest statement is: the rule fires **at most once per phase** in
every reachable sequence, saves at least one optimizer episode when it fires, and saves a round of
reviewers as well when it fires at the window's second round. Before `pdlc-rcv-panel-topology`
ships, only the first row is reachable (X-03), and it is the row the measured run lands in. A test
author can derive the expected fire-sites from this table plus that REQ's classification of each
round's measured growth; nothing about it depends on which process opened which round.

**AC-2.7 — An unavailable count is not a malformed one, and it also breaks the chain.** *Who:* the
review loop. *Given:* a round for which some dispatched role's blocking count cannot be obtained
from the branch at all. *When:* AC-2.1 would be evaluated. *Then:* that round's blocking count is
**unavailable**; the comparison is not made in either direction; the run report carries S-5 with
reason `unavailable-count`, naming the round and the role; the loop continues to the next round.

**The two states are separated by what is observable, not by intent.** These are the cases and
there are no others. The table is **read in order** — the first row whose observation holds
decides, which is the order the reader in AC-2.7(b) evaluates them in — so rows 5–7 are reached
only for a section carrying **exactly one** `VERDICT: ` line. Throughout, a "`VERDICT: ` line" is
one whose trimmed text begins with the seven characters `VERDICT: ` — **including the trailing
space** — which is what `extractFileVerdict` counts (`pdlc/workflows/orchestrate-dev.js:902`,
`line.trim().startsWith("VERDICT: ")`) and what `parseVerdict` matches (`:417`);
`VERDICT:Approved` is not one, to either function.

| # | Observation on the role's file at that round | State |
|---|---|---|
| 1 | The file is absent | *unavailable* |
| 2 | The file carries no `## Verdict` heading | *unavailable* |
| 3 | A `## Verdict` section exists and carries **no `VERDICT: ` line at all** | *malformed* (AC-2.3) — this is what HEAD returns: `extractFileVerdict` finds the heading, counts `trailers === 0` (`:900-903`), skips the `> 1` return at `:904`, falls through at `:906`, and `parseVerdict` returns its `malformed: true` fallback (`:424-428`, object at `:394-400`) — a **different** object from the truncated-output return at `:451` (M-2c) |
| 4 | The `## Verdict` section carries **two or more `VERDICT: ` lines** | *malformed* — the quantity was read and could not be resolved; `extractFileVerdict` already returns `{ok: false, reason: "duplicated"}` (`:904`) |
| 5 | Exactly one `VERDICT: ` line, and there is **no non-empty line after** it | *unavailable* — `parseVerdict`'s truncated-output path, which returns genuine `0/0/0` (M-2c) |
| 6 | Exactly one `VERDICT: ` line, and after it the section contains **nothing but anchor lines** — no candidate survives the skip rule | *unavailable* — the trailer was never written; an anchor is not a malformed trailer |
| 7 | Exactly one `VERDICT: ` line, and the candidate — the first non-empty **non-anchor** line after it — does not parse as `{"high": N, "medium": N, "low": N}` after `recoverVerdict` (M-2d) has been tried | *malformed* (AC-2.3) |

*Unavailable* and *malformed* are different states and are reported differently on purpose.
Malformed means a trailer was found and could not be parsed even after recovery; unavailable means
no trailer was there to parse. The distinction matters because the truncated-output path returns
**genuine `0/0/0` with no `malformed` flag** (M-2c): without AC-2.7 a file with no trailer would
read as a perfect round and, worse, as a *comparable* one. The anchors-only row (6) is what keeps
*unavailable* reachable once `pdlc-rcv-panel-topology`'s anchors are appended into this same
section — without it, a file that never carried a trailer would parse an anchor line as
*malformed*, inverting the operator-facing distinction.

**(b) The trailer reader is one algorithm.** Given a file: (1) locate the trailing `## Verdict`
section and count its `VERDICT: ` lines — no section ⇒ *unavailable*; none in a section that
exists ⇒ *malformed*; two or more ⇒ *malformed*; (2) from the single `VERDICT: ` line, **scan
forward and stop at the first non-empty line that is not an anchor line — that line is *the*
candidate, and there is at most one**, the anchor set being the catalogue §2 ids plus the M-4a
approval anchors **by reference**; (3) no candidate ⇒ *unavailable*; (4) the candidate does not
parse after `recoverVerdict` ⇒ *malformed*; (5) the candidate parses ⇒ that is `blocking`'s source.
**The scan stops; it does not collect** — a second parsing trailer later in the section is not
observed and is therefore not a case. Stopping matches `parseVerdict`'s own *"first non-empty line
after `VERDICT:`"* and is the cheaper reader; the duplicate-trailer concern is answered one level
up, in step 1.

**AC-2.8 — A round whose document did not change is a halt, not a consumed round.** *Who:* the
review loop. *Given:* a round **N ≥ 2 of the current window** about to be opened — i.e.
`N − 1 ≥ W`. *When:* the loop takes its single round-open read of the document (`t0` — there is
exactly one read per round-open, shared with `pdlc-rcv-panel-topology`'s growth measurement),
**before** it dispatches round N's reviewers. *Then:* if that read's byte length equals
`DOC-BYTES(N−1)` **and** its `sha256Hex` digest equals `DOC-SHA256(N−1)`, the loop **halts on the
existing post-mortem path** (`pdlc-rcv-budget-stop` AC-1.4) with the S-11 reason `no-revision:
round {N} document identical to round {N-1}`, and round N is **not** dispatched and **not** counted
against the budget.

Receive side, total over every input — the anchor condition is stated **here**, not as a
precondition of *Given*, because the third row is exactly the case in which it does not hold:

| Observation | Behaviour |
|---|---|
| Both anchors present at round N−1, both endpoints equal | **halt**, S-11 |
| Both anchors present, either endpoint differs | no halt; the round proceeds and `pdlc-rcv-panel-topology` classifies the growth from the same read |
| Either anchor absent, unparseable, or duplicated with unequal values at round N−1 | the test is **not evaluated**; the round proceeds. Fail-**open**, deliberately: a missing anchor is evidence about the writer, not about the author, and must never manufacture a halt. **This is the whole of the pre-X-02 behaviour** |
| N = 1, or `N ≤ W` — round N is the first round of a window | not evaluated — there is no predecessor **in this window**. An operator who resets without revising is exercising the escape hatch deliberately; halting the fresh window on its first round would spend a reset on zero rounds. The document is not thereby exposed to a lone verifier: round `W` is a **full-panel** round |

**Which bytes, precisely.** `sha256Hex` canonicalises before it digests, inside the function and
never in a caller (M-7c), so `DOC-SHA256:` is a digest of the **canonical** form and **not** of the
raw bytes `DOC-BYTES:` counts. The conjunction recovers the difference: a revision that changes
only line endings or trailing newlines leaves the digest equal but the byte count different, so
the test does not fire and the round proceeds — the safe direction, and the reason the two
endpoints are ANDed rather than either taken alone. Byte length alone is not the test because two
different revisions of the same length are possible and a halt on that evidence would be wrong.

**Row A — what the run report shows for the undispatched round.** Round N produces no cross-review
files, so `panel-shape` and `blocking` have no source. `growth-bytes` and `classification` **do**
have one — the halt condition makes the growth exactly 0 and the classification `incremental` —
and they are nevertheless left empty **by choice**: reporting them invites the reader to think a
round was measured, and no round ran. The row is fixed here: `round` = N; `panel-shape`,
`blocking`, `growth-bytes`, `classification` all **empty**; `notice` = **S-11 alone**. The
mechanically-derived alternative (`crashed` / `unavailable` / `unmeasurable` plus three notices) is
wrong on its face: it presents the operator's primary evidence that the *author* did nothing as
evidence that the *reviewers* crashed.

**Why this is a halt and not a notice.** A zero-delta round is the strongest observable form of
non-convergence there is: the optimizer episode between the two rounds produced nothing, so round
N's reviewers cannot resolve a finding, change a verdict, or produce a review that differs from
round N−1's. Spending a round of a three-round budget on it converts an *authoring* failure into a
*non-convergence* post-mortem, which names the wrong cause and burns the budget that would have
paid for the real revision. AC-2.1 does not catch it — the counts are trivially equal, which reads
as a *plateau of disagreement* rather than as *no input*. Clearing an S-11 halt **resumes** the
window rather than resetting it (`pdlc-rcv-budget-stop` AC-1.5(5)).

**AC-2.9 — Every round the loop opens produces its report row.** *Who:* the operator. *Given:* any
completed review-loop phase, converged or halted. *When:* they read the run report. *Then:* it
carries **one row per round**, with exactly the six columns and the eight-notice precedence order
fixed in `docs/_constraints/pdlc-rcv-catalogue.md` §3 — no column added, none omitted, none
reordered. This REQ populates `panel-shape`, `blocking` and every S-3, S-5 and S-11 notice;
`growth-bytes`, `classification` and S-6 are `pdlc-rcv-panel-topology`'s and are empty until it
ships; `round` and the S-16 notice are `pdlc-rcv-budget-stop`'s.

The two rows with no dispatch behind them are stated cell by cell rather than derived: **row A** is
AC-2.8's halt row, above; **row B**, the no-round-admitted row of an entry whose reset region
failed validation, is `pdlc-rcv-reset-region` AC-7.6's. Every column is derivable from the branch
alone — the cross-review basenames, the files' count trailers, their anchors — which is what makes
AC-2.1's determination re-derivable after the fact by a reader who was not there. This is the
artifact the predecessor's post-mortem had to be reconstructed by hand (US-03).

**Observability.** Two integers read from two files on the branch, two on-disk role-slug sets, two
anchor pairs, three comparisons, two halt reason strings, one report table. No unmeasured runtime
behaviour and no in-process state.

---

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** three of its
rows and reads three more; it changes none of the others, and a threshold used here and absent
there is a defect.

| Name | Default | Owned / read | Note |
|---|---|---|---|
| `fixed-point: …` | the render fixed in catalogue §2's S-3 row | owned | AC-2.1's halt reason. Carries both counts and both round indices. |
| `not-comparable: …` | the closed four-member enum of catalogue §2's S-5 row | owned | AC-2.3, AC-2.4, AC-2.7. A reason outside the enum is a defect, not a fallback. |
| `no-revision: …` | the render fixed in catalogue §2's S-11 row | owned | AC-2.8's halt reason. Decided at round-open, so it never co-occurs with S-3 or S-4. |
| `MAX_REVIEW_ROUNDS` | **3** | **read only** | `pdlc-rcv-budget-stop` AC-1.2 owns it. AC-2.6 is stated over the three rounds it admits; this REQ never changes it. |
| `DOC-BYTES: {n}` / `DOC-SHA256: {64 hex}` | as the baseline fixes them | **read only** | Written by `pdlc-rcv-panel-topology`'s `appendRoundAnchors` (X-02). AC-2.8 reads them; this REQ emits neither and may not change their grammar. |
| `HALT-REASON: {value}` | one line per halt, appended at the end of the reset region | **read only** | `pdlc-rcv-budget-stop` AC-1.4 clause 1 owns the line; AC-2.2 fixes the order of the reasons inside `{value}` for a co-occurring halt. |

## 7. Non-goals and out of scope

The shared list is baseline §4; **N-1, N-2, N-3, N-4, N-7, N-9 and N-10 apply unchanged** and are
not restated. Three are worth pointing at from here, because a reviewer of *this* document is most
likely to file against them:

| # | Not in scope | Why |
|---|---|---|
| **N-2** | Normalising blocking counts across panels of different size. | AC-2.4 declines it: a sum over two reviewers and a sum over one are not the same measurement, and any normalisation is a guess. R-2 records the cost and its successor. |
| **N-4** | Changing what a halt is. | The POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). Both tests here halt on the dependency's existing path; neither changes it. |
| **N-13** | Re-specifying the round budget, the window origin `W`, the reset region or its lifecycle. | They are `pdlc-rcv-budget-stop`'s (BL-12). This REQ states only what it **reads** from them and the halt path it halts on. A finding that this document does not define `W` is **correct and known** — it is defined in the dependency. |
| **N-11** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. This REQ states only what it **reads** from them (§3.1) and the report slots they populate (AC-2.9). A finding that AC-2.4's `unequal-panel-shape` branch is unreachable today is **correct and known** — file it as Low. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: it is an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify where in the loop AC-2.1's comparison is evaluated so that it precedes the optimizer dispatch, and how its halt reason reaches both the post-mortem prompt and the run report distinctly from budget exhaustion (AC-2.2). The reset-region read-modify-write both halts here depend on is the dependency's O-5, not restated. | TSPEC |
| **O-8** | Specify **where** the per-round table is emitted, for both converged and halted phases, and in what rendering. **Its columns are not open** — catalogue §3 fixes the six-column schema and the notice precedence. | TSPEC |
| **O-12** | Specify where AC-2.8's byte-and-hash identity test is evaluated — after round N−1's anchors are readable and **before** round N's reviewers are dispatched — and how the S-11 halt reaches the post-mortem writer on the same path as S-3 and S-4. Specify the **single round-open read** AC-2.8 shares with `pdlc-rcv-panel-topology`'s growth measurement, so the two never see different bytes, and the **order of the two round-open derivations** over that shared read. Note it must not consume a round of the budget, and that an S-11 halt cleared by the operator resumes the window (`pdlc-rcv-budget-stop` AC-1.5(5)). | FSPEC → TSPEC |
| **O-10** | Properties and tests for this requirement, including the negative cases named explicitly: the `0 ≥ 0` non-firing (AC-2.5); the malformed-count chain break in **both** directions (AC-2.3); the *unavailable*-count chain break (AC-2.7); the unequal-panel-shape and crashed-round non-comparisons (AC-2.4); a `## Verdict` section with the heading and **no** `VERDICT: ` line reading as *malformed* against `parseVerdict`'s fallback and **not** the genuine `0/0/0` return, and `VERDICT:Approved` counting as **zero** `VERDICT: ` lines (AC-2.7 rows 3–4); `VERDICT:` → anchor → valid trailer reading as a **count**, and `VERDICT:` → prose → valid trailer reading as *malformed* under the stopping scan (AC-2.7(b)); the **zero-delta halt** and each of AC-2.8's three non-halting inputs, including fail-open on an absent `DOC-SHA256:`, and a line-endings-only revision **not** firing it (equal digest, unequal byte count); the **row A** assertion — four empty cells, `notice` = S-11 alone; the **two-halt row**, `notice` = S-3 then S-4 on the last admitted round, with the post-mortem's `HALT-REASON:` line character-identical to that cell; and the **crashed-round row**, whose `notice` carries co-occurring notices in catalogue §3's precedence order. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). | implementation |

## 9. Risks, assumptions and deferrals

| # | Assumption | If false |
|---|---|---|
| **A-1** | Reviewers reliably emit the `{"high": N, "medium": N, "low": N}` count trailer. Measured on the predecessor: **7 of 10** files carried it; the three that did not were rounds 1–3 of one reviewer, and `recoverVerdict` (M-2d) exists to recover exactly that case. | The rule fires less often than expected. It never fires *wrongly* — AC-2.3 makes an unreadable count break the chain rather than trigger it. A degradation, not a defect. |

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — no enforced stop, no measured growth. The predecessor's Phase R died exactly here, and the superseded parent died of the same cause across nine rounds. | Mitigated by splitting the parent into reviewable documents, by depending on no unmeasured runtime fact (baseline §5), and by keeping this document short. **Accepted and unenforceable** — the enforcement is this REQ, which has not shipped. The operator is asked to watch the trajectory and halt at the fixed point by hand. |
| **R-2** | **How much the rule saves depends on the regime, and in one regime it is close to inert.** In the target regime the only comparable consecutive same-shape pair is (`W+1`, `W+2`); in the measured regime all three rounds are dual and a fire at `W+1` saves a full round of reviewers as well. | **Accepted and enumerated in AC-2.6** rather than stated as a single figure. In every reachable sequence the rule fires at most once per phase; what varies is where. Successor: `docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md` — revisit cross-panel comparability (N-2) once real runs exist to calibrate against. |
| **R-9** | **A count-only fixed point cannot distinguish a plateau from complete finding turnover.** Demonstrated on the superseded parent's own review: at round 7 `blocking(7) ≥ blocking(6) > 0` with both operands available and equal panel shape, so **AC-2.1 would have halted that phase at round 7** — while the severities were collapsing (`1H+2M`/`1H+2M` → `0H+0M`/`0H+1M` at round 8), i.e. a false positive immediately before approval. At round 9 the mirror: `blocking(9) = 6` against `blocking(8) = 1` is a *rise*, so the rule correctly does not fire, but for a reason it cannot see, on a revision that closed all eight round-8 findings. Both directions confirm the same coarseness; neither produces a wrong approval. | **Accepted, Low, recorded rather than fixed here.** The cost is a false-positive halt — one operator interaction on a round that made large, correct progress — never a wrong approval, and R-2 already accepts the coarseness of count-only comparison (N-2). A finding-identity test would need a findings-table grammar N-3 declines to introduce. Successor: the same calibration REQ, carrying *"does the fixed-point test need finding identity, not just count?"*. |
| **R-7** | **The in-file trailer (X-01) lands after this REQ.** A review written by an un-amended SKILL carries no in-file trailer, so AC-2.1 reads its round as *unavailable*. | Accepted and degradation-only by construction: an *unavailable* round breaks the chain in both directions and never fires the rule, so a lagging SKILL costs a comparison, never a wrong halt. |
| **R-8** | **A round can be dispatched against a document no authoring episode revised.** Observed on this family's own parent. | **Mechanised, not accepted** — AC-2.8 makes it a halt with its own reason (S-11) rather than a consumed round. Two residues are not this REQ's deliverable: an authoring episode that produces no write still *reports success*, and the authoring watchdog has no zero-write check. Both belong to the authoring path and are bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`, since detecting them needs the same unmeasured fact (baseline §5). |

**Deferrals and their binding.** Every deferral above is bound to a named successor surface that
exists on this branch, not to prose intent: cross-panel comparability (R-2, N-2) and finding
identity (R-9) to `docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`;
R-8's authoring-side residue to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`.
Each stub is `ready: false`, so none is queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-02 | M-2a … M-2g; M-4a, M-4b (the anchor block AC-2.8 reads); M-7c | P-2 | US-01, US-03 | O-5, O-8, O-10, O-11, O-12 |

**Why this is its own document.** It was REQ-RCV-02 of `pdlc-rcv-budget-stop` v1.0, which measured
**581 lines / 83 KB** — beyond the 60 KB REQ size ceiling, and therefore beyond what the review
loop converges on. The cut is at the seam the two requirements already had: REQ-RCV-01 defines the
**window** (the budget, its origin `W`, the reset region and the halt path), and this REQ states
the two **tests** evaluated inside it. `W` must exist before either test can be stated, which is
why this REQ `depends-on` that one and not the reverse.

**Round-by-round history is deliberately not restated here.** The nine review rounds that produced
this material live in `docs/discarded/pdlc-review-convergence/CROSS-REVIEW-*-REQ-v{1..9}.md` alongside the
superseded parent; those files remain the record of which finding produced which clause. This REQ
traces to the *measured facts*, not to the review history.
