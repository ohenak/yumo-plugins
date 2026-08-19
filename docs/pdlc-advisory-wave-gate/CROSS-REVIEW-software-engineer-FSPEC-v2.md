# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.1, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** Delta re-review of v1.1 against `CROSS-REVIEW-software-engineer-FSPEC-v1.md`. Diff base `f6b30cef` (the commit v1 reviewed) → HEAD. Changed sections only; unchanged sections not re-litigated. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Prior Findings — Disposition

All thirteen v1 findings were addressed; twelve are resolved, one (F-05) was addressed by a change that introduces a new defect, carried below as F-01.

| v1 id | Sev | Disposition | Evidence in v1.1 |
|---|---|---|---|
| F-01 | High | **Resolved** | E-04 and AT-01-5 now count inapplicability *statements* "whoever authored the carrier", and AT-01-5 states explicitly that it does not filter A6-authored notices because A6 authors none (FSPEC:248, :318). The inverted oracle is gone. |
| F-02 | High | **Resolved** | BR-8 now states the invariant over writer **identity** — "the two writers above stay the only ones, and a green gate stays their precondition" — and explicitly declines set-equality over committed paths, leaving the scope widening to O-8/BR-12 (FSPEC:188-192, AT-04-3 at :389-390). AT-04-5's companion case is now the red-today one. |
| F-03 | Medium | **Resolved** | §3.3 splits step 4 (well-formedness/citation, one attempt consumed) from step 4b (classification, no attempt consumed), and the closing paragraph names both costs (FSPEC:122-123, :131). No remaining "either" answer. |
| F-04 | Medium | **Resolved** | Step 3b — attempt admission — now owns the counter read, step 3 defers to it, and step 7's red branch returns to 3b rather than 3 (FSPEC:88, :90, :126). AT-02-9 pins the count with a two-case counted oracle. |
| F-05 | Medium | **Addressed, new defect** | BR-11 now defines the invocation window, but as a wave-spanning episode, contradicting REQ AC-2.4 and the shipped mechanism. See F-01 below. |
| F-06 | Medium | **Resolved** | E-04 and AT-01-5 scope the population to "runs that reach Phase I"; runs halting earlier or skipping Phase I on a recorded wave ledger sit outside the criterion (FSPEC:248, :318). |
| F-07 | Medium | **Resolved** | E-04 records the carriers as mutually exclusive and names the no-manifest carrier as the one that discharges the requirement in the both-absent case (FSPEC:248). |
| F-08 | Medium | **Addressed, partly** | New row E-33 covers absent/malformed/zero `waveBudgetPerRun` (FSPEC:289). The zero half collides with the shipped parser — F-02 below. |
| F-09 | Medium | **Resolved** | BR-10 and E-22 now state that the repair stays applied on a post-gate halt, and that the advisory record and halt report both name its paths, so reversibility is never claimed where it does not hold (FSPEC:205, :283). AT-05-4 names the un-skip guard as the fixture's check class. |
| F-10 | Medium | **Resolved** | BR-4 now states that E-5/E-6 are not two further act kinds but a widening of the envelope's semantics from act kinds alone to act-plus-scope, with `E-1`…`E-4` still naming what may be done (FSPEC:165). R-1's residual width is routed to §7.3 A-3. |
| F-11 | Medium | **Resolved** | AT-03-2 now asserts *which* clause matches first, making the precedence claim falsifiable rather than asserting only refusal (FSPEC:387). |
| F-12 | Low | **Resolved** | AT-07-1 enumerates the agent-proposable boundaries (E-5 scope, E-6's halves, BR-5, BR-6, BR-8) and names BR-13/BR-14/BR-16 as excluded by construction (FSPEC:435). |
| F-13 | Low | **Resolved** | AT-07-3 drops the wall-clock clause and rests NFR-5 on reachability, saying so in the test text (FSPEC:441). |

## Findings

Scope of this pass: only sections the v1.1 diff touched. Every claim below re-measured on HEAD.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **BR-11's new invocation window contradicts REQ AC-2.4 outright and cannot be built from the inherited mechanism.** v1.1 defines an invocation as "one A6 episode on one wave, opening when that wave's gate first returns non-zero and step 3b admits an attempt, closing at step 9's terminal disposition, and so spanning up to `advisory.attemptBudget` dispatch/repair/re-gate cycles" (FSPEC:209-211). REQ AC-2.4 says the opposite in as many words: "more than `advisory.seamBudgetMinutes` on a single invocation (per invocation, dispatch to verdict, **not** cumulative across the wave — NFR-4 says the same thing)" (`REQ-pdlc-advisory-wave-gate.md:299`), and NFR-4 repeats "measured dispatch to verdict" (`REQ:453`). The shipped tier agrees with the REQ, not with the FSPEC: `totalBudgetMs` is raced against the dispatch and the deadline is "constructed FRESH on every attempt" (`pdlc/workflows/orchestrate-dev.js:3371-3384`, race at `:3417`), and every `budgetExceeded` call site passes `elapsedMs: 0` precisely because "wall-clock exhaustion is enforced solely by the per-attempt race" (`:3430`, `:3461`, `:3557`, helper at `:2288-2289`). So the episode window is not an inherited contract being restated — it is a new budget mechanism, which C-1 and §1's "inherited contracts … used unchanged" say this feature does not add. AT-02-7 rests entirely on the redefinition ("the window measured is the invocation BR-11 defines — one A6 episode on one wave", FSPEC:352) and would be red against a REQ-faithful and precedent-faithful implementation, green only against the new one. Fix: define the invocation as the shipped per-dispatch window REQ AC-2.4 names, and state the gate-command exclusion as inherited (and, under that window, trivially satisfied because the gate re-run sits outside the raced dispatch). If the episode window is genuinely wanted, it must be decided in the REQ first and priced as a new mechanism — erratum raised, not folded in here. | BR-11 (§4), §5.4 E-25, §6.2 AT-02-7 |
| F-02 | Medium | Local | **E-33 honours an explicit `waveBudgetPerRun: 0`, but the shipped per-key validator it says it follows rejects zero — and fails in the dangerous direction.** E-33 states that absent or malformed falls back to `1` "per key independently, like the other advisory keys", and that "an explicit `0` is honoured as written — a legitimate operator setting" (FSPEC:289). At HEAD every integer advisory key goes through `positiveInt`, which admits a value only if `Number.isInteger(v) && v >= 1` and otherwise pushes the key to `invalidKeys` and returns the default (`pdlc/workflows/orchestrate-dev.js:1991-1997`, used for `attemptBudget` at `:2020`). An implementer who reuses the shipped validator — which is what "like the other advisory keys" invites — converts `0` into `1`, i.e. dispatches a repair on the first red wave in a run where the operator asked for none. That is the worst available failure direction for a tier whose whole safety argument is that it acts only where told. Fix: say in E-33 that this key's validator is a non-negative-integer variant, distinct from the shipped `positiveInt`, and let AT-07-2b assert the `0`-round-trip (`0` in ⇒ `0` back, key absent from the invalid-key report) rather than only the default. | §5.4 E-33, §6.7 AT-07-2b, REQ C-2 |
| F-03 | Low | Local | **E-33 is filed out of id order and lands inside the restoration group.** §5.4's rows run E-20…E-27, then E-33, then E-28 (FSPEC:281-290). The table is otherwise strictly ordered, and E-28 (restoration failure) reads as if it belonged to the budget block it now trails. Cost is only readability, but the same table is what the TSPEC author enumerates from. Fix: move E-33 after E-28, or renumber. | §5.4 |

**Erratum raised upstream.** REQ NFR-4's rationale clause — "without the carve-out a slow suite ends the invocation inside attempt 1 and `advisory.attemptBudget` never binds" (`REQ:453-456`) — is false against the shipped mechanism: under the dispatch-to-verdict window the REQ itself pins, the gate command never runs inside the measured window, so the carve-out cannot be what makes `attemptBudget` bind. That false rationale is what the FSPEC author reasonably tried to repair by widening the window, so correcting it upstream is what unblocks F-01 cleanly. Emitted as an `ERRATUM: REQ` line.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under the corrected (per-dispatch) window, does the wave still need a second bound on total episode time — a slow suite re-run `attemptBudget` times is bounded only by `attemptBudget × suite runtime`, which no clause caps? Not gating: the shipped tier has the same property, and O-1/O-8 do not depend on it. If the answer is "yes", it is a REQ decision, not an FSPEC one. |
| Q-02 | E-33's explicit `0` and `advisory.enabled: false` now name two ways to make A6 inert, with different report shapes (E-01 says the advisory key is absent entirely; E-32 says the sixth row reads zero). Is the difference deliberate — "tier off" versus "seam off" — and worth one sentence, so the operator reading a zero row knows which setting produced it? |

## Positive Observations

- **The two Highs were closed at their roots, not patched at the assertion.** F-01's fix restored the oracle to counting statements *and* scoped its population in the same pass, so E-04 and AT-01-5 now say one thing; F-02's fix rewrote BR-8's invariant to writer identity and then said out loud which degree of freedom BR-12 hands the TSPEC author (FSPEC:188-192). That is the harder and more durable of the two available repairs.
- **Step 3b is the right shape.** Making the attempt counter a named step that both the first arrival and step 8b's return read (FSPEC:90) turns the previously unbounded-looking loop into something an implementer can build without inventing a policy, and AT-02-9's two-case counted oracle ("counted, never bounded: a 'no more than' oracle passes an implementation that dispatches none") is exactly the discipline the round asked for.
- **The compression cost the document nothing load-bearing.** 184 lines removed against 97 added, and the rationale that went was duplication between §4 and §5/§6 — every rule I traced still states its proposition once, with its REQ clause attached. Holding a size budget while adding seven ATs is not the usual outcome of a revision round.
- **E-22 and BR-10 now name a concrete check class** (the un-skip guard that halts a wave whose owned test file still carries a skipped block), which is what makes AT-05-4 constructible from the FSPEC alone rather than requiring the TSPEC first.

## Recommendation

**Needs revision**

One High, and it is the only thing standing between this document and approval. F-01: BR-11's episode-scoped invocation window contradicts REQ AC-2.4's explicit "per invocation, dispatch to verdict, **not** cumulative across the wave" (`REQ:299`) and the shipped per-attempt race it inherits (`orchestrate-dev.js:3371-3384`, `:3417`, `elapsedMs: 0` at `:3430`/`:3461`/`:3557`). This is a change I asked for in F-05 and the author answered honestly; the answer just went one step further than the REQ licenses, and the step it took is a new budget mechanism in a feature whose safety case rests on adding none. Restate the window as the shipped per-dispatch one, mark the gate-command carve-out inherited, and let the erratum fix the REQ rationale that made the wider reading look necessary.

F-02 is worth fixing in the same pass and is cheap: one sentence in E-33 saying this key's validator is a non-negative-integer variant, and one round-trip assertion in AT-07-2b. Left as written, the most natural implementation silently turns an operator's `0` into `1`.

Everything else from round 1 is closed. The lifecycle, the envelope semantics, the writer-identity invariant, the restoration oracle and the acceptance-test discipline all hold, and no finding in this round contests the design.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
