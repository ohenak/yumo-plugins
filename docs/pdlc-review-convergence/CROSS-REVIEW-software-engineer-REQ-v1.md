# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 1
**Scope:** REQ-pdlc-review-convergence v1.0, technical lens (feasibility, implementability, integration risk)

## Verification baseline

Per the cross-cutting existing-code-claim rule, **every** `file:line` claim in §4 (M-1a … M-6d) was
diffed against the working tree in a single pass before any finding was written. The tree read was
`main` at `add6947`, clean.

- **Verified and correct:** M-1a, M-1c, M-2a, M-2b, M-2c, M-2d, M-3a, M-3b, M-3c, M-3d, M-3e, M-3f,
  M-4a, M-4b, M-5a, M-5b, M-5c, M-6a, M-6b, M-6c, M-6d. Symbol, line and distinctive literal all
  resolve; the drift-proofing convention did its job on 21 of 22 rows.
- **Incorrect:** M-1b — see F-04.
- **Unreachable baseline:** the header row pins the citations to `d11dad5`; that commit is not an
  ancestor of the default branch — see F-08.

No finding below rests on a claim I could not check against the tree.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AC-1.1's stated observable is falsified at HEAD: `MAX_REVIEW_ROUNDS` is a **per-invocation budget**, not an absolute cap. §4.1 omits the fact. | AC-1.1, AC-1.3, §4.1 |
| F-02 | High | Local | AC-2's `blocking(N−1)` operand does not survive an invocation boundary, and the REQ does not say what happens when it is absent. AC-2.3 covers *malformed* counts, not *missing* ones. | AC-2.1, AC-2.3, §4.2 |
| F-03 | High | Local | AC-4.1's round growth has the same cross-invocation hole; AC-4.5 then silently converts every re-entered phase into a full-panel phase, deleting AC-3's saving without saying so. | AC-4.1, AC-4.5, AC-3.1 |
| F-04 | Medium | Local | M-1b names the wrong enclosing symbol for the `windowEnd` default and omits the second `windowEnd` caller — the caller that creates F-01. | §4.1 M-1b |
| F-05 | Medium | Cross-Feature | DC-01 violation: six new boundary-crossing strings, only two declared, AC-2.2 gives an example rather than a catalogue id, and O-4 defers receiver totality to FSPEC — which DC-01 forbids. | AC-2.2, AC-3.5(a), AC-4.5, AC-4.7, §6, O-4 |
| F-06 | Medium | Cross-Feature | DC-08 violation: three self-declared **unbound** deferrals with no named successor surface at HEAD. | §9.3 |
| F-07 | Medium | Local | BL-01's resolution form names a `QUEUE.md` row that no longer exists, and §3's "not yet satisfied on the default branch" prose contradicts the tree. | §3 BL-01 |
| F-08 | Medium | Local | The Citation baseline is internally contradictory and unreachable from the default branch: the header names branch `feat-pdlc-review-convergence`, §3 names `feat-pdlc-review-loop-hardening`'s tip, and `d11dad5` is not an ancestor of `main`. | Header row, §3 |
| F-09 | Medium | Local | AC-3 and AC-4 are jointly under-specified: AC-4.3's own calibration classifies **5 of 5** measured rounds as new-mechanism, which re-escalates every round to the full panel and makes AC-3's single-verifier path dead on the only measured evidence. AC-2.6's same-shape-pair analysis is false for that regime. | AC-3.1, AC-4.2, AC-4.3, AC-2.6, §2 |
| F-10 | Medium | Local | AC-3.4 requires the count trailer **inside** the cross-review file; the shipped grammar places it in the agent *response*. That is a file-grammar change, which N-3 says does not happen. | AC-3.4, N-3, AC-2.1 |
| F-11 | Low | Local | §6 declares two of its six rows with no default value, against its own stated obligation in the same section's preamble. | §6 |
| F-12 | Low | Local | AC-6.4 check 3's pass/fail behaviour on the exact defect it exists to catch (an off-by-two drift) is undetermined at REQ level, because the proximity window is deferred. | AC-6.4, §6 |

### F-01 (High) — `MAX_REVIEW_ROUNDS` is a per-invocation budget, so "the loop halts on entering a fourth" is false at HEAD

AC-1.1 states: *"the window spans **three** rounds, and the loop halts on entering a fourth"*, and its
**Observability** line states *"a fourth round never dispatches a reviewer"*. Both are falsified by the
shipped semantics of the constant the AC changes.

`deriveRoundWindow`'s doc comment says so in terms:

> `pdlc/workflows/orchestrate-dev.js:2129–2131`, function `deriveRoundWindow` —
> *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET rather than an absolute cap — on a branch
> whose highest existing round is 3, the re-entered phase starts at 4 and gets rounds 4…8, five
> rounds, not two."*

The mechanism is `startIndex = indices.length ? Math.max(...indices) + 1 : 1;` at `:2197` followed by
`const endIndex = windowEnd(startIndex);` at `:2198`. Under a budget of 3, a phase re-entered on a
branch whose highest existing round is 3 is admitted rounds 4…6 — a fourth round **does** dispatch
reviewers, and the phase has now consumed six rounds of review on one document. The same relativity is
stated on the halt path at `:1570–1572` (*"AC-5.1: the window is RELATIVE"*).

This is not an oracle gap and is not downstream-routable under DC-09: it is an externally observable
behaviour (how many rounds a document can be reviewed for) stated wrongly, and the REQ's central cost
claim in §2 — *"a non-convergent phase costs me three rounds instead of five"* (US-01) — is stated over
a number that does not bound the document. §4.1's three rows (M-1a, M-1b, M-1c) enumerate the constant's
readers and **omit `deriveRoundWindow` entirely**, so the REQ never encounters the fact.

**Required change.** State explicitly whether AC-1 bounds rounds *per invocation* (matching HEAD, in
which case §2's cost claim must be re-stated and the multi-invocation total named) or *per document*
(in which case that is a second behavioural change, needs its own AC, and interacts with the
append-only review history `deriveRoundWindow` protects). Add `deriveRoundWindow` to §4.1 either way.

### F-02 (High) — AC-2's left operand does not survive an invocation boundary

AC-2.1's rule compares `blocking(N)` against `blocking(N−1)`, both defined in the §5 vocabulary table as
*"as returned by `parseVerdict` (M-2a)"*. `parseVerdict` is a function of an **agent response**:

- `pdlc/workflows/orchestrate-dev.js:393`, `export function parseVerdict(result, skillName)`.

In-process this is fine. Across an invocation boundary it is not, and F-01 establishes that the loop is
designed to cross one: round N−1 can belong to a previous invocation. The only branch-side reader is
`refreshReviewState`:

- `pdlc/workflows/orchestrate-dev.js:2358`, `async function refreshReviewState({ feature, docType, _listFiles, _readFile })`.

Two properties of that function close the gap off:

1. It reads **only the candidate round** — `const candidate = window.startIndex - 1;` at `:2390`, then
   `if (parsed.round !== candidate) continue;` at `:2397`. Round N−2 and earlier are never read.
2. Even for the round it does read, it **discards the counts**. `extractFileVerdict` (`:888`) does
   return `{ok: true, verdict, high, medium, low, malformed?}` — the counts are recoverable from a file
   — but the record built at `:2401–2407` stores only `verdict`, `verdictReadable`, `anchorHash`,
   `anchorReason`, `path`.

So on a re-entered phase, AC-2.1's comparison has no left operand. AC-2.3 does not cover this: it is
scoped to a verdict parse that is `malformed` *after `recoverVerdict` has been attempted*, i.e. to a
count that was read and was unreadable — not to a count that was never in this process. The REQ
therefore leaves an externally observable behaviour (halt vs. continue, and what the run report says)
unspecified on a state the loop reaches by design.

Note this finding is **not** "AC-2 has no seam". The seam exists and M-2a names it correctly; what is
missing is a statement of *which* seam AC-2 reads from, and what the rule does when the answer is
"neither".

**Required change.** Say where AC-2 sources each operand — the in-process `parseVerdict` result, or the
file via `extractFileVerdict` — and add the missing case to AC-2.3's chain-breaking rule: a round whose
blocking count is **unavailable** (not merely malformed) is neither a trigger nor a baseline, and the
run report says which round and why. If the file is the source, F-10 becomes load-bearing.

### F-03 (High) — AC-4's growth measurement has the same hole, and its fail-safe silently deletes AC-3

AC-4.1 defines round growth as `bytes(document at start of round N+1) − bytes(document at start of
round N)`, taken *"using the same injected reader the loop already uses"* (M-5c, `_readFile`). Both
endpoints are in-process reads with no stated durable home. On a re-entered phase the round-N endpoint
was never taken in this process, and nothing on the branch records it — `refreshReviewState` records no
byte lengths, and the cross-review files record none.

AC-4.5 then fires: growth unmeasurable ⇒ **full panel**. Compose that with AC-3.1 and the result is
that *every round of every re-entered phase runs the full panel*, which is exactly the configuration
AC-3 exists to remove. The REQ's cost claim in §2 (≈60% of the byte and agent cost) is stated without
this case.

What makes this a REQ-level defect rather than a TSPEC detail is that AC-3.5(a) **already identifies
this exact class of problem and solves it**:

> *"The marker is **in the file**, not in memory, because the reader that needs it (M-3d) runs on a
> later invocation with nothing but the branch to read."*

AC-4 gets no equivalent sentence, and the two ACs are therefore inconsistent about whether cross-round
state is durable. §4.7 disclaims dependence on intra-dispatch write visibility, which is a different
question and does not cover this one.

**Required change.** Either (a) state that the round-N byte anchor is durable and name the surface it
lives on — the anchor is a plain integer and the cross-review file is an existing durable surface with
an established `KEY: value` anchor convention (M-4a/M-4b) — or (b) state explicitly that growth is
measurable only within an invocation, that a re-entered phase therefore runs the full panel by AC-4.5,
and correct §2's cost claim accordingly. Either is acceptable; silence is not.

### F-04 (Medium) — M-1b names the wrong enclosing symbol, and omits the caller that matters

M-1b claims the `windowEnd` default *"is applied at `:1574` inside `reviewLoop`"*. At the tree I read:

- `:1574` — `const last = endIndex === undefined ? windowEnd(first) : endIndex;` — is inside the
  **non-convergence / post-mortem recorder**, not `reviewLoop`. Its neighbours are the `postmortemPath`
  construction at `:1569` and the `recordPhase(...)` call at `:1576–1582`.
- `reviewLoop`'s signature opens at `:1623` (`export async function reviewLoop({`) and its default is
  `endIndex = windowEnd(startIndex),` at `:1632`.
- `windowEnd` has a **second** caller the row does not mention: `const endIndex = windowEnd(startIndex);`
  at `:2198`, inside `deriveRoundWindow`.

The first two points are a wrong-symbol attribution, not the line drift the preamble excuses as a
mechanical fix — the row asserts a fact about *which function* applies the default, and that fact is
false. The third point is the substantive half: the omitted caller is precisely the site that makes
`MAX_REVIEW_ROUNDS` a per-invocation budget (F-01), so M-1b's omission is what allowed AC-1.1 to be
written as it was. M-1b's headline claim — that `windowEnd` is the sole site expressing the *width* —
does survive, and AC-1.2 is unaffected.

**Required change.** Correct M-1b's symbol attribution to `reviewLoop:1632`, and add `deriveRoundWindow`
`:2198` as a second reader with the per-invocation-budget consequence stated.

### F-05 (Medium, Cross-Feature) — DC-01: the new boundary-crossing strings are not a closed catalogue with a total receiver

`docs/_constraints/DOMAIN-CONSTRAINTS.md` **DC-01** requires that any string or record crossing a
component boundary — *"workflow script ↔ skill, script ↔ operator, producer ↔ machine parser"* — be
specified as a **closed catalogue on the emitting side and a total function on the receiving side,
before FSPEC authoring**. This REQ introduces at least six such surfaces:

| Surface | Where | Declared in §6? | Receiver total? |
|---|---|---|---|
| `REVIEW-MODE: verification` | AC-3.5(a) | yes, exact literal | **no** — O-4 defers "what a duplicated or contradictory marker means" to FSPEC |
| Fixed-point halt reason | AC-2.2 | no | n/a — AC-2.2 gives *"e.g. 'fixed point: round 3 blocking 7 ≥ round 2 blocking 6'"*, an example, not a catalogue id |
| Non-comparable-round notices | AC-2.3, AC-2.4 | no | no |
| Unmeasurable-growth notice | AC-4.5 | no | no |
| Per-round report row | AC-4.7 | no | schema deferred to O-8 |
| Carried Measurement-Required items | AC-5.4 | heading only | format deferred to O-7 |

O-4's deferral is the sharpest instance: DC-01 names *"before FSPEC authoring"* as the deadline, and O-4
is an obligation *on* the FSPEC. Under DC-09 I would normally route a "no catalogue yet" finding
downstream — DC-01 is the standing constraint that says this particular class does not route.

**Required change.** Either close the catalogue at REQ level (ids and exact strings for the six rows
above, plus the receiver's behaviour on a duplicated/contradictory `REVIEW-MODE:` line, which is a
three-line addition given M-4b's existing 0 / 1-equal / 1-unequal / ≥2 semantics), or record an explicit,
justified DC-01 exception naming the rows it covers. Silent deferral is the thing DC-01 forbids.

### F-06 (Medium, Cross-Feature) — DC-08: three deferrals are unbound, by the document's own admission

DC-08: *"An accepted residual, a declared deferral, a non-goal, or a Low finding carried across rounds
must be bound to a **named successor surface** — a queue row, a hand-off row, or a follow-up REQ — not
to prose."* §9.3 states, correctly and plainly, that all three of its deferrals are **Unbound**, no
queue row exists. I checked `docs/_queue/QUEUE.md` at HEAD: it carries no row for
`pdlc-review-convergence-calibration`, none for `pdlc-approval-record-tier2`, and none for a §4.7
measurement spike.

Candour about a constraint violation is better than concealment, and §9.3 is the right shape — but
DC-08 binds the REQ layer, and its origin note records the precise counter-example: `pdlc-workflow-
distribution`'s deferral check *passed three DoD rounds running* **because** its deferrals were bound
to queue rows 6 and 7. An unbound deferral at REQ is read downstream as an unhandled deferral, which is
a DoD finding waiting to happen (see also R-4, whose successor POSTMORTEM R-3 *already* recommended
creating rows that were not created — a second-order instance of the same failure).

**Required change.** DC-08 accepts three binding surfaces and only one of them is the queue, which the
authoring agent is correctly forbidden to touch. Discharge by creating the two successor **REQ stub
files** (`docs/pdlc-review-convergence-calibration/REQ-…md`, `docs/pdlc-approval-record-tier2/REQ-…md`)
and citing them by path in §9.3, or by escalating the three rows to the operator as a named blocking
hand-off before this REQ leaves Phase R. Prose intent plus an "Unbound" label is not a binding.

### F-07 (Medium) — BL-01's observable does not exist at HEAD, and §3's prose contradicts the tree

BL-01's **Resolution form** is *"PR merged; `docs/_queue/QUEUE.md` row `pdlc-review-loop-hardening` at
`done`"*. At HEAD there is no such row: rows 0 and 1 were archived to
`docs/completed/QUEUE-HISTORY-rows-0-1.md`, and the feature's artifacts now live under
`docs/completed/pdlc-review-loop-hardening/` (`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`,
`LEARNINGS`, `POSTMORTEM-R`). A gate stated over a row that has been archived out of existence is
unevaluable — it can neither pass nor fail.

§3's prose compounds it: *"**BL-01 is the only one not yet satisfied on the default branch**: this
branch is stacked."* On the default branch I read, the upstream feature's artifacts are archived under
`docs/completed/` and BL-02 … BL-05's symbols all resolve there (`parseVerdict:393`,
`refreshReviewState:2358`, `selectMode:1436`, `appendApprovalAnchors:1934`,
`pdlc/workflows/lib/document-oracles.mjs`). BL-01 appears **satisfied**, while the REQ asserts it is the
one outstanding item. One of the two statements is stale, and BL-01's gating logic ("must hold at HEAD
before FSPEC authoring begins") means an FSPEC author cannot tell which.

**Required change.** Restate BL-01's resolution form over an observable that exists — presence of
`docs/completed/pdlc-review-loop-hardening/`, or the archived row in `QUEUE-HISTORY-rows-0-1.md` — and
correct the §3 paragraph to describe the tree as it stands.

### F-08 (Medium) — the Citation baseline is self-contradictory and unreachable from the default branch

Two statements about the same sha cannot both be true:

- Header row: *"read from the working tree at HEAD **`d11dad5`** … branch `feat-pdlc-review-convergence`"*.
- §3: *"All five hold at the Citation baseline commit `d11dad5`, which is the tip of
  `feat-pdlc-review-loop-hardening`'s stack."*

`git log -1 d11dad5` resolves to *"docs: bring CLAUDE.md and both READMEs up to date with the shipped
pipeline"* on `feat-pdlc-review-loop-hardening`, so §3 is right and the header row is wrong.
Independently, `git merge-base --is-ancestor d11dad5 HEAD` **fails** on the default branch: the pinned
baseline is not reachable from `main`, so a reviewer, an author, or AC-6's own checker running on the
default branch cannot reproduce it.

This matters more than a normal citation nit because §4's reproducibility is load-bearing for the whole
document — the preamble asks reviewers to *"verify these rows, not re-derive them from memory"*, and the
header row makes the AC-6 exemption ("report it as a mechanical fix, not a finding") conditional on the
baseline being checkable. It is also, precisely, P-4 recurring inside the document that specifies P-4's
fix.

**Required change.** Name one branch, and pin the baseline to a commit reachable from where the document
will be reviewed (or state the branch a verifier must check out).

### F-09 (Medium) — AC-3 and AC-4 are jointly under-specified; AC-4.3's own calibration deletes AC-3's saving

AC-4.3 states, as calibration: *"the predecessor's rounds grew 25.8, 22.3, 25.0, 28.1 and 38.2 KB —
**every one of the five** would have classified new-mechanism"*. Compose that with AC-3.1's exception
(*"unless AC-4 classified round N−1's revision as new-mechanism, in which case round N dispatches the
full panel again"*) and, on the only run this REQ measures, **every round N ≥ 2 is a full panel**. AC-3
— described in §10.4 as *"the largest behavioural change"* — would never once take its single-verifier
path.

Two consequences the document does not state:

1. **§2's cost claim is unsupported in that regime.** *"roughly 60% of the byte cost and 60% of the
   agent cost"* assumes rounds 2 and 3 are single-verifier. If AC-4 re-escalates them, the agent saving
   is AC-1's round reduction alone.
2. **AC-2.6's analysis is false in that regime.** It asserts *"the only consecutive same-shape pair
   inside the window is (round 2, round 3), both verifier rounds"*. With all three rounds dual, both
   (1,2) and (2,3) are same-shape and comparable — the rule fires *more*, not once. AC-2.6 half-concedes
   this (*"it bites harder immediately if … AC-4 re-escalates two consecutive rounds"*) but then states
   the single-fire figure as the default anyway.

I am not contesting *whether* the two mechanisms should ship together — §10.4's ordering constraint
(RCV-04 must not ship after RCV-03) is well argued and I agree with it. I am contesting that the REQ
never says which regime it expects, so US-02's *"bounded, **predictable** cost"* has no predicted value.

**Required change.** State the expected steady state and its evidence: either the 12,000-byte threshold
is expected to be exceeded rarely once AC-4.6's minimal-revision clause is in force — in which case say
what supports that, given 5/5 measured rounds exceeded it by 2–3× — or AC-3's saving is contingent on
revision size, and §2 and AC-2.6 should both be re-stated with that contingency visible.

### F-10 (Medium) — AC-3.4 changes the cross-review file grammar, which N-3 says it does not

AC-3.4 requires the verifier to write *"the **unchanged** cross-review grammar: a trailing `## Verdict`
section written last, carrying exactly **one** `VERDICT:` line, plus the machine-readable
`{"high": N, "medium": N, "low": N}` count trailer that AC-2 reads."*

The count trailer is not part of that grammar today. The review SKILLs place it in the **agent
response** — *"append the following two lines as the last content of your **response**"* — and the
repo's documented file contract is the `## Verdict` section and its single `VERDICT:` line, with the
count trailer nowhere required in the file. `extractFileVerdict` (`:888`) does feed the trailing section
to `parseVerdict`, so counts *can* be read from a file that carries them — but a file that does not
carry them is the normal case, and `parseVerdict`'s truncated-output path (M-2c, `:451`) then returns
**genuine `0/0/0` with no `malformed` flag**. That is the exact input AC-2.5 was written to defend
against, arriving not from a truncated review but from a correctly-written file.

So AC-3.4 either (a) requires the trailer in the file — a grammar change, contradicting N-3 (*"Changing
the cross-review file grammar … all **unchanged**"*) and requiring a corresponding SKILL amendment that
O-9 does not list — or (b) does not, in which case AC-2's file-side operand silently reads `0/0/0` and
F-02 becomes materially worse.

**Required change.** Decide which. If (a): say the file grammar gains a required count trailer inside
the `## Verdict` section, amend N-3, and add the SKILL change to O-9. If (b): say AC-2 reads counts only
in-process, and resolve F-02 on that basis.

### F-11 (Low) — §6 declares two rows with no default

§6's preamble: *"Every configured value any AC above depends on, with its default and its owner. A
threshold not in this table is a defect in this document."* Two rows carry *"unfixed — FSPEC decides"*
in the **Default** column. The closing paragraph justifies both, and I accept the justification for the
symbol-proximity window (no product consequence). The verifier role slug is weaker: §6's own Derivation
column notes it is *"the key for the file path, the approval marker and the panel-shape comparison"* —
i.e. it is a key three separate mechanisms are stated over, one of which (AC-2.4's panel-shape equality)
compares sets of these strings. Recorded Low rather than Medium because AC-3.7 does fix the property
that matters (one stable slug), and the string itself is genuinely a naming decision.

### F-12 (Low) — AC-6.4 check 3 is undetermined on the defect it exists to catch

AC-6.4's prose is explicit that check 3 exists for *"the defect that actually recurred — a line number
that drifted by two while still pointing inside a real file"*, and equally explicit that the check
*"should report a citation whose symbol is nowhere near it, not one that moved by a line"*. Whether a
two-line drift is reported therefore depends entirely on the proximity window, which §6 defers to the
FSPEC. As written, the REQ does not determine the outcome of its own motivating example. This is Low
because the *shape* is fixed and the window is a tuning parameter, and because O-6 owns it — but the AC
would be stronger if it stated the direction (a window materially wider than 2 lines, so the motivating
drift passes and a symbol in a different function fails).

## Mechanical fixes (AC-6 class — not findings)

Applied without discussion; these do **not** contribute to the counts above and do not block approval.
Line numbers verified against `main` at `add6947`.

| # | Location | Fix |
|---|---|---|
| MF-1 | §4.1 M-1b | `:1574` → `:1632`; enclosing symbol is the post-mortem recorder at `:1574`, `reviewLoop` at `:1632`. (The substantive half is F-04.) |
| MF-2 | §4.2 M-2b | The row cites *"the JSDoc immediately above `:393`"*. The `fallback` literal it quotes is inside the function body, well below `:393`; give it its own line. |
| MF-3 | §4.3 M-3c | `dualApproved` is at `:1466`, not *"near `:1462`"*. Within tolerance, but the row can name it exactly. |
| MF-4 | §4.4 M-4b | `approvalAnchorPreCount` is at `:1915`, not *"near `:1918`"*. |
| MF-5 | §4.5 M-5b | The cited range `:2725–2743` should name its enclosing symbol `advisoryPacingCheck` per the document's own convention; the row names neither. |
| MF-6 | Header row | Branch name — see F-08 (raised as a finding, not a mechanical fix, because it contradicts §3 rather than drifting). |

Everything else in §4 resolved exactly, symbol and literal.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is AC-1's three-round bound intended **per invocation** (matching `deriveRoundWindow` at HEAD) or **per document**? The two differ by an unbounded factor on a resumed phase, and §2's cost claim reads as the latter. |
| Q-02 | Which seam does AC-2 read `blocking(N)` and `blocking(N−1)` from — the in-process `parseVerdict` result, or the cross-review file via `extractFileVerdict`? F-02 and F-10 both hinge on the answer, and they pull in opposite directions. |
| Q-03 | Is the round-N byte anchor of AC-4.1 intended to be durable? If yes, is the cross-review file's existing `KEY: value` anchor block (M-4a) the intended home, given AC-3.5(a) already uses it for exactly this reason? |
| Q-04 | On the measured run, AC-4 would have re-escalated 5/5 rounds to the full panel. Is that the expected steady state, or is AC-4.6's minimal-revision clause expected to move most rounds under 12,000 bytes? |
| Q-05 | AC-3.6 permits tier-2 gaps *"provided the limitation is documented"*. Who writes that documentation — the harvest step, the run report, or both — and does an undocumented gap become a finding at DoD? |

## Positive Observations

- **§4 is the right instrument and it mostly worked.** Twenty-one of twenty-two measured-fact rows
  resolved exactly — symbol, line and distinctive literal. Reviewing this document took a single
  verification pass instead of a per-round drip, which is precisely what the convention was for.
- **§4.7 is the most valuable half-page in the document.** Naming the two facts the REQ *declines* to
  depend on, and inviting the reviewer to check §1.4's claim against them, is a genuinely new move and
  it held: neither unmeasured fact reaches an AC. My three High findings are about **durability of
  in-process state**, which is a different axis and one §4.7 does not cover — worth noting that the
  self-check was honest, not that it was wrong.
- **AC-3.5 is correctly decomposed.** Four separate constraints (a)–(d) against three independently
  located "two reviewers" assumptions (M-3a, M-3c, M-3d) is the right shape for the highest-risk part of
  the change, and R-6 flags it as such rather than burying it.
- **AC-2.5 is a real catch.** Recognising that `0/0/0` is a *genuine* parse in this codebase (M-2c
  verified at `:451`) and that a naive `≥` would halt the best possible round is the kind of negative
  case that usually surfaces at PROPERTIES, three phases too late.
- **AC-4.3 refuses to invent a number.** Inheriting `MAX_AUTHORING_WRITE_BYTES` rather than estimating a
  fresh threshold, and stating *why* the two must not drift apart, is exactly right — and the honest
  calibration against the measured run is what let me find F-09.
- **§9.3 does not paper over its unbound deferrals.** F-06 stands as a DC-08 finding, but the document
  states the violation in its own words rather than dressing prose intent as a binding.
- **AC-6.2's import-safety requirement is well grounded.** `build-runtime.mjs`'s import-unsafety is real
  and observable (`pdlc/workflows/__tests__/runtimeBundle.test.js:18`,
  `import { stripModuleSyntax } from "../build-runtime.mjs";`), and `document-oracles.mjs`'s header
  states the discipline verbatim at `:1–12`. AC-6 is the cleanest of the six requirements: I have no
  blocking finding against it.

## Recommendation

**Needs revision** — three High and seven Medium findings.

### Why this is not an "approve and route downstream" round under DC-09

DC-09 instructs approval when a round's blocking findings are *all* implementability or
oracle-falsifiability defects, none contesting user need, scope, priority, phasing, or externally
observable behaviour. I applied that test to each finding before filing it, and deliberately did **not**
file the several "this has no oracle / no fixture / no test yet" observations I had — §8's O-1 … O-11
discharge them and the preamble is right that they are not REQ revisions.

The three High findings survive that test because each names an **externally observable behaviour that
is stated wrongly or not at all**:

- **F-01** — how many rounds a document can be reviewed for. AC-1.1 states three; HEAD permits more,
  and the REQ's central cost claim rests on the wrong number.
- **F-02** — whether the loop halts or continues when AC-2's left operand is absent. Not the same as
  AC-2.3's malformed case, and not stated anywhere.
- **F-03** — which panel is dispatched on a re-entered phase. AC-4.5 answers "full panel" by accident,
  deleting AC-3's saving without the document saying so.

None of the three requires new mechanism to fix. F-01 and F-03 are each satisfiable by a sentence that
states the intended semantics; F-02 by one clause added to AC-2.3's existing chain-breaking rule. All
three are the *same underlying question* — **what cross-round state is durable across an invocation
boundary?** — which AC-3.5(a) already answers correctly for its own marker and which AC-1, AC-2 and AC-4
do not answer at all. A single §4 row measuring `deriveRoundWindow` and `refreshReviewState`'s stored
fields, plus three sentences, closes all three.

Of the Mediums, **F-05 and F-06 are standing-constraint violations** (DC-01, DC-08) and are tagged
`Cross-Feature`; they are not routable downstream because both constraints bind at REQ. **F-07 and
F-08** are staleness against the tree, cheap to fix. **F-09 and F-10** are internal contradictions
between ACs, which the preamble puts explicitly in scope.

### Explicit non-findings

Recorded so a later round does not re-raise them and so the trajectory is legible:

- I do **not** contest any of the six decisions. §1.4's diagnosis is well evidenced and the mapping from
  P-1…P-4 to AC-1…AC-6 is sound.
- I do **not** file R-5's known unenforceability of AC-5 and AC-4.6 as a finding; R-5 invites it as Low
  and I accept the disposition as stated.
- I do **not** file N-1 ("this will not make the loop converge"); §2 states the claim correctly.
- I have **no** blocking finding against REQ-RCV-06. AC-6.1 … AC-6.8 are implementable as written
  against `pdlc/workflows/lib/` today.
- I raised **no** `## Measurement Required` items. Consistent with §4.7: nothing I found turns on an
  unmeasured runtime fact — every finding above was settled by reading the tree.

### Trajectory note (preamble stopping rule)

Round 1 of 5 under the current behaviour. Blocking count 10 (3 High + 7 Medium). Recording it here so
the fixed-point test the preamble asks the operator to apply by hand has a first data point. Six of the
ten (F-04, F-06, F-07, F-08, F-11, F-12) are closable by correcting a statement or citing a surface,
with no new prose mechanism required.

## Verdict

**Needs revision.**

Three High findings (F-01, F-02, F-03) — all instances of one question, whether cross-round loop state
survives an invocation boundary — and seven Medium findings, two of which (F-05, F-06) are violations of
standing constraints DC-01 and DC-08 that bind at the REQ layer. REQ-RCV-06 is approvable as written;
REQ-RCV-01, REQ-RCV-02, REQ-RCV-03 and REQ-RCV-04 are not, until the durability question is answered.

VERDICT: Needs revision

