# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.6)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** Delta re-review against v1.5 (`449d49e2`) and my own `CROSS-REVIEW-product-manager-DECISIONS-v4.md`. Product lens only — traceability to REQ v0.10 / FSPEC v1.7 / TSPEC v1.8, scope compliance, and fidelity of the §7/§8 hand-off summaries. Changed sections only; sections approved in rounds 1–4 are not re-litigated.

## Prior findings disposition

Diff reviewed: `git diff 449d49e2..HEAD -- docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md`, a single commit (`f6634427`). Changed: the header pin block, a new v1.6 change note, §0's TSPEC pin, DEC-ENG-05's rule block and census paragraph, DEC-ENG-13's boundary paragraph, and DEC-ENG-05's §8 row.

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The rule block now carries TSPEC v1.8's three-outcome predicate verbatim in substance: classes 3/4 restricted to a string literal or an identifier bound to a module-level constant, **indirect dispatch neither a site nor a failure**, count asserted separately (`DECISIONS:437-451`). Compare `TSPEC:540-550` — same three outcomes, same worked examples. The census now reads **7 / 28 / 1 / 12 = 48 direct plus 11 indirect** (`DECISIONS:466-471`), matching `TSPEC:566-583`. I re-verified the twelfth direct site against code, not documents: `_agent(ADVISORY_RUNG_SKILL, prompt, { model })` at `orchestrate-dev.js:1841`, resolving to `const ADVISORY_RUNG_SKILL = "se-review"` at `:1797`. The guard as now written is green on correct code at HEAD, which is what the round's High was about. |
| F-02 | Medium | **Resolved** | §8's row lists exactly four numbered items under its "four classes" quantifier, with the `DISPATCHABLE_SKILLS` member declaration folded into class 1 where it is declared (`DECISIONS:975`). The entry body's block (`:437-441`) and §7's alternatives row (`:939`) use the same count. Quantifier and enumeration now agree in all three places. |
| F-03 | Medium | **Resolved** | Header pin reads `TSPEC-pdlc-headless-engine.md` **v1.8** (`DECISIONS:9`) and §0 opens "TSPEC v1.8 fixes the mechanism" (`DECISIONS:92`). TSPEC's own version block is v1.8 (`TSPEC:16`). |
| Q-01 | — | **Answered, and taken further than I asked** | The entry now names TSPEC §3.3 as the enumeration of record — "the figures are normative there, not here" (`DECISIONS:467-468`) — and §8 cites rather than restates them. This closes the recount-churn loop: a later re-measurement is now a TSPEC edit and not a DECISIONS round, which is exactly the outcome the question was fishing for. |
| Q-02 | — | **Answered** | DEC-ENG-13 now states the assertion obligation explicitly rather than leaving it to inference (`DECISIONS:865-871`). The answer raises one new Medium below, but the ambiguity itself is gone. |

Both round-4 carry-forwards are closed and the High is closed. Nothing approved in earlier rounds regressed: I checked each changed section against HEAD and found no decision reversed, no alternative re-opened, and no consequence dropped from §7/§8.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **DEC-ENG-13's new "catalogue-free is not assertion-free" paragraph states a rationale that is the inverse of what its own mechanism does, and PLAN will transcribe the rationale.** The paragraph directs PLAN to pin the two diagnostics' expected text "**once, beside the runner in `_run-suite.mjs`**", with "both assertions match that single definition exactly rather than duplicating a literal per test", and justifies it: "Without the single pin, a later reflow of the runner's output would silently drop the only proof the detector is falsifiable in both directions" (`DECISIONS:865-871`). Read against the artefact: `__tests__/_run-suite.mjs` is the runner whose behaviour these assertions test (`TSPEC:1629`, `:1646`, `:1683`, `:2317`). An expectation that imports its expected value from the module under test moves with that module — under the single pin a reflow of the runner's wording changes producer and expectation together and **nothing goes red**, which is the failure mode the sentence claims the pin prevents; under a test-side literal transcription a reflow is exactly what turns the test red. The mechanism is still defensible on other grounds — the two constants remain distinct, so skip-vs-ran discrimination survives, and DEC-ENG-13 elsewhere says "ids, not wording, are the pinned half" (`DECISIONS:874-875`) — but the stated reason is false, and it is the reason PLAN will copy. Either state the real reason (one definition avoids per-test literal drift; wording is deliberately *not* the asserted property, emission is) or move the pin to a shared non-under-test fixture so the assertion is not derived from the code it is testing. Not gating: DEC-ENG-10's fire / over-fire property, which is what AC-6.4's suite-wide obligation actually rests on, holds under either arrangement. | FSPEC AC-6.4 (suite-wide emit obligation); DEC-ENG-10 pairing; review contract "no implementation echoes" |
| F-02 | Low | Local | **The new PLAN obligation added to DEC-ENG-13's body is not reflected in its §8 hand-off row.** §8 exists so "PLAN and PROPERTIES carry obligations forward rather than rediscover them" (`DECISIONS:964`-adjacent), and DEC-ENG-13's row still ends at the catalogue boundary — "are outside the catalogue, carry no id and owe no emit obligation" (`DECISIONS:979`) — with no mention of the once-beside-the-runner pin the body now requires of PLAN. This is the same class of lag as rounds 2–4's F-01/F-02 (§7/§8 rows trailing entry bodies), caught early this time and one clause wide. If F-01 changes the pin's shape, fix both in the same edit rather than syncing the row to text that is about to move. | Summary-fidelity of §8 hand-off table; DEC-ENG-13 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DECISIONS is now pinned to TSPEC v1.8 and cites FSPEC v1.7's landed anchors correctly, but **TSPEC v1.8 itself still pins FSPEC v1.6** (`TSPEC:20`, `:54`) and still cites the pre-insertion rung-4a anchors (`FSPEC:299` at `TSPEC:1034`, `FSPEC:406` at `TSPEC:2179`) where FSPEC v1.7 now carries the ladder row at `:307` and EC-START-10/11 at `:416-417`. That is TSPEC's fix, not this document's — DECISIONS' own FSPEC citations verify line-for-line at HEAD, so nothing here is stale. I raised this as a TSPEC erratum in round 4 and it has not landed; I re-emit it below in case the round-4 routing was dropped. No action for the DECISIONS author. |
| Q-02 | On F-01: is the once-beside-the-runner pin a decision this document owns, or an implementation detail that belongs to PLAN? DEC-ENG-13's decision is the *boundary* (engine strings are catalogue members, harness strings are not), and the boundary is settled and well drawn. Where PLAN physically pins two test strings looks like a PLAN-level choice that arrived here because the te round asked for it. If you agree, the smallest fix is to keep the "catalogue-free is not assertion-free" sentence — which is a genuine consequence of the boundary and belongs here — and drop the file-placement instruction, leaving PLAN to choose a pin that does not derive its expectation from the runner. That would resolve F-01 and F-02 in one edit without adding a §8 row. |

## Positive Observations

- **The round's one High was fixed by re-grounding, not by re-arguing.** The entry could have defended its v1.7 transcription; instead it re-read TSPEC §3.3 at HEAD and moved the rule, the arithmetic and the §8 row together in a single commit (`f6634427`). I checked the result against code rather than against TSPEC's prose: `orchestrate-dev.js:1841` dispatches `ADVISORY_RUNG_SKILL`, declared at `:1797`, so the twelfth direct site is real and the guard is green on correct code. Three rounds of this entry's arithmetic have now been checkable in under a minute each, which is why the error was cheap to find and cheap to close.
- **Q-01's answer removed the churn rather than paying it again.** "TSPEC §3.3 is the enumeration of record and the figures are normative there, not here" (`DECISIONS:467-468`) is the right ownership call, and the entry states what survives a recount — "containment over structurally scoped sites, conjoined with a census so it cannot pass vacuously … so a later re-measurement is a TSPEC edit and not a DECISIONS round". A decision entry that names which of its own sentences are load-bearing and which are transcriptions is doing more than recording a choice.
- **The disambiguation nobody asked for is the most useful line in the diff.** The cost paragraph now distinguishes the eleven **pre-edit class-4 bare literals** from the eleven **indirect-dispatch positions** (`DECISIONS:426-429`). Two unrelated elevens in adjacent paragraphs is precisely the collision a later reader would resolve wrongly. I verified they are disjoint: the literal sites are the ones enumerated in the scanner alternative (`:8008`, `:8112`, `:8035`, `:8064`, `:10028`, `:10068`, `:10142`, `:10251`, `:9964`, `:10542`, `orchestrate-queue.js:1216`), while the indirect positions are `reviewers[0]`/`[1]`, `authorSkill`, `dispatch.creator` and seven variable-argument dispatches (`TSPEC:578-583`). Eleven literals plus the constant argument at `:1841` is the twelve of class 4 — the arithmetic closes.
- **The census is now falsifiable in the direction that matters.** "A direct site rewritten to dispatch through a variable moves one count from the direct total into the indirect one rather than vanishing from both" (`DECISIONS:472-475`) closes the escape hatch a direct-only census would leave: an identifier could otherwise leave the guard's scope silently by becoming indirect. Counting both sides is what makes the census an oracle rather than a tally.
- **The v1.6 change note is scoped accurately, again.** It claims one re-ground, three substantive corrections following from it, two smaller edits, no decision reversed and no alternative re-opened. The diff is exactly that. Four rounds running, the change note has let me scope the delta review from the note and confirm it from the diff rather than re-reading the document — that is worth more than any single finding in this file.

## Recommendation

**Approved with minor changes** — no High findings; one Medium and one Low, neither gating.

The round-4 High is closed on the merits. DEC-ENG-05's rule block, census and §8 row now transcribe TSPEC §3.3 at v1.8, the pins moved with them, and I verified the one contested figure against code rather than documents (`orchestrate-dev.js:1841` → `:1797`). The guard as specified is green on correct code at HEAD, so PLAN and PROPERTIES can now derive the guard's obligations from this entry without inheriting a permanently-red test. Both prior Mediums are closed and both prior Questions are answered, one of them by removing the churn rather than absorbing it again.

Nothing that was approved in rounds 1–4 broke in this revision — no decision reversed, no alternative re-opened, no consequence dropped from the §7/§8 tables.

The two open findings are about DEC-ENG-13's new paragraph, not about any decision. F-01 is a false justification sentence attached to a defensible mechanism; F-02 is its §8 row not carrying the new PLAN obligation. Both are one edit, and Q-02 offers a fix that closes both by deleting a placement instruction that probably belongs to PLAN rather than here. Neither blocks the phase: DEC-ENG-13's boundary — the actual decision — is settled, and DEC-ENG-10's fire / over-fire property holds under either arrangement of the pin.

Carry-forwards for the author, in priority order:

1. **F-01** Rewrite the last sentence of DEC-ENG-13's "catalogue-free is not assertion-free" paragraph (`DECISIONS:869-871`) so the stated reason matches the mechanism, or move the pin off `_run-suite.mjs` so the expectation is not derived from the code under test.
2. **F-02** If the pin survives F-01 in any form, add its obligation to DEC-ENG-13's §8 row (`DECISIONS:979`) in the same edit.

One erratum is emitted against TSPEC in the response trailer (re-emitted from round 4, still unlanded at HEAD): TSPEC v1.8 pins FSPEC v1.6 and cites the pre-insertion rung-4a anchors. No errata against REQ or FSPEC — every citation this document makes to either verifies line-for-line at HEAD.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:3664868f9cbe99aec8cfebf16d4121dbffbe4c6a9e6808f26dc6b5d0fc502a68
REVIEWED-COMMIT: f6634427fede24d7bf552a27431d4dfecc7e7b67
