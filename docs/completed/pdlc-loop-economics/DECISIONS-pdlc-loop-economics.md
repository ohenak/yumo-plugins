---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-loop-economics
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/completed/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md |

# DECISIONS — pdlc-loop-economics

What was decided against, and why, for choices a later agent could otherwise confidently
reconsider. What was decided *for* is in the TSPEC; this document is the rejected half.
Project-level decisions honoured and not re-litigated here: `DEC-ANCHOR-01`, `DEC-TERM-01`,
`DEC-TERM-02`, `DEC-ERRROUTE-04`, `DEC-ROUNDS-02`, `DEC-DOC-01`, `DEC-ERR-03`.

---

## DEC-LOOPECON-01: M1 ships always-on; M2 and M3 ship config-gated, default off

**Context.** All three milestones close measured burn, but M1 removes a transcription step whose
only output was a stale value nobody could act on, while M2 and M3 change what the loop
*dispatches* and what it *accepts as converged*.

**Decision.** M1a–M1d ship always-on with no key and no opt-out. M2 (`cascade.pinCheck.enabled`)
and M3 (`review.derivativeStop.enabled`, `review.derivativeStop.rounds`) ship behind keys
defaulting to `false` / `2`.

**Rationale.** The tier is decided by what a wrong answer costs. M1's failure mode is "the
harness quoted the value it already computed" — no state exists in which the old behaviour was
preferable, so a gate would only be a way to keep the defect. M2 and M3 can be wrong in the
approving direction (a pin-check under-triggering on a false-negative hash match; a
derivative-stop tuned to suppress an open concern), and REQ R-1/R-2 name both.

**Alternatives considered:** *gate M1 too, for symmetry* — rejected, it ships a key whose only
`false` value is the defect. *Ship M2/M3 on with a kill switch* — rejected, REQ C-2's
byte-identical disabled baseline is only meaningful if disabled is the default the corpus runs
under. *One key for both* — rejected, REQ C-3 fixes three spellings, and coupling them would let
a malformed cascade block silently retune convergence (REQ-LOOPECON-08).

**Reversibility.** Easy — flipping a default is a one-line change plus a baseline recapture.
**Re-evaluation trigger:** M2/M3 enabled across ≥3 features with no over-suppression finding in
any harvest ⇒ propose flipping their defaults on.

---

## DEC-LOOPECON-02: an upstream hash quoted as "current" is the bytes on disk at dispatch-construction time

**Context.** `deriveUpstreamState` derives from live disk; `snapshotErratumDocs` mints a
snapshot at the top of an erratum batch. The erratum flow derived the state once before the
author dispatch and reused that array for the confirmers, where `erratumSupersetClause` renders
it under the header "at their current version as of this dispatch". Between those two dispatches
the author's own edit lands.

**Decision.** Any value a dispatch renders to an agent as *current* is recomputed from the bytes
on disk (or, for `REVIEWED-COMMIT`, `git rev-parse HEAD`) at the moment that dispatch is
constructed. The mint-time snapshot survives, but only as the operand of drift *detection*
(`movedSinceMinted`); it is never the value shown as current.

**Rationale.** Self-consistency with the dispatch's own grounding opener, which tells the agent
to re-read the upstream document *on the branch, now*. If the prompt then quotes a hash of
something else, the agent's only honest reading is "this document is stale" — precisely the R-5
shape: one stale dispatch-hash defect re-filed as a Low finding across 54 reviews with zero
document edits ever owed.

**Alternatives considered:** *committed-HEAD-at-dispatch* — rejected, the opener sends the agent
to the file on disk and an erratum author's edit is routinely uncommitted at confirmation time,
so hashing HEAD reintroduces the mismatch one layer down. *Keep the snapshot, add a "may be
stale" caveat* — rejected, `upstreamHeadClause`'s `movedSinceMinted` branch already does this for
the author side and the corpus shows agents file the caveat as a finding. *Re-derive on every
render, inside the confirmation window too* — rejected, it breaks the shipped
confirmation-window freeze; post-construction drift is handled by the existing
compare-and-re-dispatch-once mechanism.

**Reversibility.** Easy — one assignment.

---

## DEC-LOOPECON-03: a pin-check FAIL falls back to a full re-confirmation, and absent means FAIL

**Context.** FSPEC §4.5 defines `PIN-CHECK: {DOCTYPE}: PASS | FAIL`. Replies can be missing,
partial, or ungrammatical.

**Decision.** A `FAIL`, an absent line, a malformed line, or disagreement between dispatched
roles all resolve to `FAIL`, and a `FAIL` routes the document into exactly the ordinary
re-confirmation round it would have received with pin-check disabled — same round index, same
prompt bytes.

**Rationale.** Fail-open must never be *less* work than the baseline. It means *full review*,
not *approve anyway*: the cheap path may only ever be an optimisation on top of the expensive
path, never a replacement for it. This mirrors the shipped rule that a missing or malformed
`VERDICT:` reads as `Needs revision`.

**Alternatives considered:** *absent line = PASS ("no objection")* — rejected, silence would then
approve, the one direction FSPEC §7.1 forbids. *Halt on a malformed reply* — rejected, a halt is
more expensive than the baseline, so enabling M2 would be strictly riskier than leaving it off.

---

## DEC-LOOPECON-04: a pin-check PASS consumes no round budget

**Context.** `MAX_REVIEW_ROUNDS = 5` per invocation and `MAX_LIFETIME_ROUNDS = 15` per document
are the loop's damping terms; a pin-check PASS re-appends an approval anchor.

**Decision.** A PASSing pin-check writes no cross-review file, does not advance the derived
round index, and counts against neither budget.

**Rationale.** `DEC-TERM-02` already decided this in general: a round whose only delta is
staleness bookkeeping, with no substantive edit owed, is not a review round. A pin-check PASS is
the pure case — the document's own bytes never moved and nothing about it was reviewed. Charging
it a round would spend the budget that bounds *substantive* disagreement on the cheapest
possible non-event, and would make M2 consume the headroom it was built to free.

**Alternatives considered:** *a separate pin-check budget* — rejected, a third budget is a third
thing to reason about at a halt, and the lifetime cap already bounds how many cascade walks a
document can be dragged through. *Charge a full round for auditability* — rejected, the
`notices` line and the re-stamped anchor already record it; round indices are append-only
history of *reviews*.

---

## DEC-LOOPECON-05: derivative-stop never overrides an open High, and new Low findings do not block it

**Context.** `DEC-TERM-01` requires convergence to key on a derivative signal — no new ≥Medium
finding for N consecutive rounds — rather than on verdict-at-cap.

**Decision.** A round is flat iff (1) no finding classified **new** in it has severity ≥ Medium,
and (2) no finding in it, carried or new, is an open High. New **Low** findings deliberately do
**not** break flatness; carried findings of any severity do not break flatness. Convergence is
`review.derivativeStop.rounds` consecutive flat rounds. The outcome is recorded as
`converged-by-derivative-stop`, distinct from an approval verdict, and writes no POSTMORTEM.
This predicate is only *reachable* because enabling the key also suspends the high-only
convergence shortcut — see **DEC-LOOPECON-10**, which is a precondition of this decision, not an
elaboration of it.

**Rationale.** A stream of new Lows *is* the noise the derivative signal exists to see through —
`macro-nightly-job` closed round after round at `{high: 0, medium: 1–2}` and
`pdlc-engineering-loop` recorded 114 approving verdicts while still running to ceiling — so if a
new finding of any severity reset the count, M3 would ship inert: verdict-at-cap under a new
name, the thing DEC-TERM-01 rejected. A High is by definition blocking, so the override is
evaluated independently of the ≥Medium-new clause and a carried High keeps every subsequent round
non-flat for as long as it is still filed. And `converged-by-derivative-stop` is neither approval
nor failure: substituting an approval verdict would launder a stopping rule into a judgement
nobody made, while a POSTMORTEM would call a successful early stop a failure and refuse the phase
until an operator cleared it.

**Alternatives considered:** *require every finding to be carried* — rejected as too strict per
the Low carve-out; the predicate becomes practically unreachable. *Let derivative-stop close a
High carried unchanged for N rounds* — rejected, "the reviewer keeps saying the same blocking
thing" is the strongest signal *against* convergence. *Report it as an ordinary approval* —
rejected, the report row is the only place an operator can see that a document was closed by a
stopping rule.

**Reversibility.** Easy while default-off.

---

## DEC-LOOPECON-06: finding identity is exact-match on the triple, and an unevaluable round is not flat

**Context.** REQ R-3 names the over-suppression risk: normalisation too coarse swallows a new
finding sharing a section anchor with an old one. Separately, a round whose `FINDING:` lines do
not parse yields an empty finding set, which a naive predicate reads as agreement.

**Decision.** Two records are the same finding only when severity, section anchor and normalised
text **all** match exactly; normalisation touches the free-text body only. A round is
**unevaluable** (hence not flat) if any reviewer's verdict is unreadable, any `FINDING:` line is
malformed, or a reviewer's verdict counts sum above zero while the round's parsed finding set is
empty.

**Rationale.** Both halves make the failure direction cost-asymmetric on purpose. Under-merging
costs one extra round; over-merging silently suppresses a real concern. Exact match makes
over-merging structurally impossible for anything but a genuine repeat, and the unevaluable rule
closes the vacuous flat round — absent evidence must never read as evidence of absence, FSPEC
§7.1's fail-open direction applied to M3's input.

**Alternatives considered:** *fuzzy matching on finding text* — rejected, a threshold nobody can
tune without the corpus, every mis-tune failing toward suppression. *Identity on section anchor
alone* — rejected, exactly R-3's failure. *Treat a zero-finding round as flat* — rejected,
indistinguishable from a parse failure, and a genuinely finding-free round converges by
unanimous approving verdict anyway.

---

## DEC-LOOPECON-07: M1a ships as an absence pin, not as a new mechanism

**Context.** REQ-LOOPECON-01a reads as an obligation to make the engine write anchors. The
engine already does: `appendApprovalAnchors` is the sole writer, through `_appendFile`, and a
structural census of all 30 prompt-builder functions in `orchestrate-dev.js` finds **zero**
occurrences of `APPROVAL-HASH`, `REVIEWED-COMMIT` or `UPSTREAM-STATE`.

**Decision.** M1a adds no production code. It adds a source-census oracle that pins the absence:
set equality on the builder-name census, zero anchor tokens in any builder body, and exactly one
site emitting the anchor template — inside `appendApprovalAnchors`, into `_appendFile`.

**Rationale.** The requirement is that the property *stay* true, and only an assertion does
that. Set equality rather than containment is what makes it hold under growth: a builder added
later is either added to the pinned set (and then checked) or reds the census.

**Alternatives considered:** *delete the three vestigial "do so verbatim" sentences in the review
SKILL.md files* — rejected, REQ NG-2 excludes it; the path reaching them is unreachable from this
module and a SKILL.md edit trips the digest manifest for no behavioural gain (legitimate
follow-up outside this feature). *Assert on rendered prompt strings at runtime instead of on
source* — rejected, runtime assertions only cover the dispatches a test happens to exercise.

---

## DEC-LOOPECON-08: all new code lands in `orchestrate-dev.js`; no new `lib/` module

**Context.** `orchestrate-dev.js` is ~17k lines and the natural instinct is to put the new pure
functions in a new `pdlc/workflows/lib/loop-economics.mjs`.

**Decision.** Everything lands in `orchestrate-dev.js`.

**Rationale.** The engine's `prepack.mjs` vendors a frozen `MODULE_NAMES` list —
`orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`.
A new lib module would be absent from the published engine, and the engine channel is the only
way the pipeline runs. Adding it to that list means editing `pdlc/engine/`, which REQ NG-3
forbids. The failure would also be silent in this repo, where a dev checkout falls back to
`pdlc/workflows/` and resolves the import fine.

**Cost accepted.** Every implementation task writes the same physical file, so they serialise
into distinct waves (batch-safety rule 2) — a real throughput cost, taken knowingly.

**Re-evaluation triggers.** If a later feature may touch `pdlc/engine/`, extract the pure
functions into `lib/loop-economics.mjs`, adding it to `MODULE_NAMES`, `prepack`'s manifest and
`c8.include` together.

---

## DEC-LOOPECON-09: derivative-stop reuses the shipped `FINDING:` grammar, gated on its own key

**Context.** M3 needs per-finding severity and section data. Ordinary reviewer prompts do not ask
for `FINDING:` lines today; only the erratum/cascade confirmation prompts carry
`findingGrammarClause()`. `parseConfirmationFindings` is already channel-agnostic — a response
string and a cross-review file's bytes parse identically.

**Decision.** Reuse `parseConfirmationFindings` unchanged. `reviewerPrompt` gains an optional
`findingGrammar` flag appending the existing `findingGrammarClause()`, set true iff
`review.derivativeStop.enabled` is true.

**Rationale.** One finding grammar across the engine; a second parser would be a second thing to
keep in sync with the `check-finding-grammar` hook and the erratum gate. Gating the clause on
the same key preserves REQ-LOOPECON-07's byte-identity: with the key off, `reviewerPrompt`'s
output is unchanged to the byte.

**Alternatives considered:** *add the clause unconditionally* — rejected, it changes every
reviewer prompt in the corpus and breaks the disabled-state byte-identity claim outright. *Infer
findings from `VERDICT:` counts alone* — rejected, counts carry no section anchor and no text, so
carried/new is uncomputable and REQ-LOOPECON-03 would be unimplementable. *Parse the cross-review
file rather than the response* — rejected as the primary channel (an extra read per reviewer per
round); the same parser would work and the response is already in hand.

## DEC-LOOPECON-10: enabling derivative-stop suspends the high-only convergence shortcut

**Context.** `reviewLoop`'s gate is `isPassResult(verdict1) && isPassResult(verdict2)`, and
`isPassResult` returns true whenever `parsed.high === 0` — the high-only relaxation (operator
decision, 2026-08-08, `DECISIONS-review-severity-bars.md`). Every flat round under
DEC-LOOPECON-05 has `high === 0` on every reviewer, so under that bar a flat round converges
immediately, a second consecutive flat round is unreachable, and `converged-by-derivative-stop`
is dead code. T-09's red-test work proved it.

**Decision.** When `review.derivativeStop.enabled` is true, the high-only shortcut is suspended
for that document's review loop: a round converges iff **(a)** every reviewer's verdict is
readable and its verdict string approves under the existing verdict grammar (the pre-relaxation
reading), or **(b)** `derivativeStopReached` fires. Limb (a) is evaluated first and wins ties.
With the key off — the default — the high-only bar applies exactly as today, byte-identically.
Implemented as a gated wrapper at `reviewLoop`'s gate only; `isPassResult`'s other six call sites
(erratum re-confirm, phase-gate approval search, tier predicates) keep the lenient reading.

**Rationale.** M3 is the principled successor to the 2026-08-08 experiment: that experiment
bought convergence speed by lowering the *severity* bar, which suppresses Mediums that were
genuinely open; the derivative signal buys the same speed by reading *whether review is still
producing new substance*, which is what DEC-TERM-01 asks for. The two cannot coexist on one
document — the cruder one fires first and masks the finer one — so opting into M3 necessarily
means opting out of the shortcut. Scoping the suspension to the enabled path keeps the
experiment undisturbed on every repo that has not turned M3 on, and keeps REQ-LOOPECON-07 intact.

**Alternatives considered:** *ship §8.3 as first written* — rejected, `converged-by-derivative-stop`
is then unreachable by construction, so the feature's headline outcome could never be exercised
and would fail DoD reachability (dead branch, no honest coverage). *Retire the high-only bar
globally* — rejected, that re-litigates an operator decision this feature has no mandate over and
would change the erratum channel and phase gate too. *Make flatness require `Approved` verdicts*
— rejected, it collapses (b) into (a) and the derivative signal stops being independent.

**Operator-visible consequence.** Turning the key on tightens the convergence bar as well as
adding the derivative stop. A round with zero Highs and open Mediums converges today; with M3
enabled it does not — it is recorded as flat and the loop continues, stopping either on a literal
approving verdict or after `review.derivativeStop.rounds` consecutive flat rounds. Some documents
will therefore consume more rounds than they do today, bounded by the unchanged
`MAX_REVIEW_ROUNDS` / `MAX_LIFETIME_ROUNDS` caps. This is intended: the operator is trading a
lenient severity bar for a substance-based one.

**Reversibility.** Easy — the key is default-off and the wrapper collapses to `isPassResult`.
