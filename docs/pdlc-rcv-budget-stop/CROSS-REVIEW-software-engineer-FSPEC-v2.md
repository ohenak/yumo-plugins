# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.1, 949 lines)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Review basis (this is not a delta re-review)

The orchestrator marked this iteration 2 and directed the delta protocol against
`CROSS-REVIEW-software-engineer-FSPEC-v1.md`. **That file does not exist** — not on the branch, not
in `git log --diff-filter=D` on any ref. The only FSPEC cross-review of round 1 is the test
engineer's. So there is no prior software-engineer position to diff against and no "commit I last
reviewed"; a delta pass would have silently reviewed nothing.

**I therefore reviewed the whole document at HEAD (`096b64d`), first pass, and numbered it v2** as
instructed. Findings below are stated against v1.1 in full, not against the v1.1 revision record's
seven te-driven edits — though I did read those edits and they are noted where they bear on a
finding. The approval bar is the same either way.

## Existing-code claim verification

Batched in one pass, per the cross-cutting rule. Every claim this FSPEC makes about *existing* code
was checked against the working tree, not against the `M-*` row that carries it. **All of them
hold.** Recording the checks so no later round re-does them.

| Claim | Where | Verified |
|---|---|---|
| Phase DOD's bound and the post-ship budget are **both 3**, from **two distinct declarations** — the premise of B-BUD-3's whole structural observable | §3.1 | ✅ `DOD_MAX_ITERATIONS = 3` (`orchestrate-dev.js:25`) and `MAX_REVIEW_ROUNDS = 5` (`:52`) are separate module-scope consts; `dodLoop` defaults `maxIterations = DOD_MAX_ITERATIONS` (`:3833`) and never reads the review constant. The coincidence B-BUD-3 is built to survive is real |
| The suite keeps its **own copy** of the width, so AC-1.2/O-13(b)'s blast radius is not hypothetical | §3.2 (B-BUD-5) | ✅ `__tests__/pacingWrapper.test.js:77` `const MAX_REVIEW_ROUNDS = 5;` and `__tests__/roundDerivation.test.js` `EXPECTED_WINDOW_WIDTH = 5`, both hand-maintained, both invisible to the module. The constant is unexported |
| `D` is *"of the document type under review, never the whole directory"* — stated as normative in §4.1/§4.2 | §4.1 | ✅ **already true at HEAD**, not a change: `deriveRoundWindow` drops well-formed basenames of a different doc type before building `present` (`:2448`, `if (result.docType !== docType) continue;`), and `startIndex` is `max(indices)+1` over that filtered map (`:2470-2473`) |
| An **unreadable-but-present** post-mortem reads `status: "none"` | §5.3 (B-REG-6), E-8 | ✅ `checkPostmortem` (`:2738`) returns `{status: "none"}` when `_readFile` yields `null` or blank, before any marker parse. **But see F-01** — the reading is right and its consequence is unspecified |
| A **duplicated** unfenced marker reads unresolved | §6.1 (B-CLR-5), E-5 | ✅ `parseResolvedMarker` returns `{ok:false, reason:"duplicated"}` on more than one; `checkPostmortem` maps everything but `ok && resolved` to `unresolved` |
| The shipped step-G text is `Refused — unresolved POSTMORTEM at {path}` | §4.3 (B-WIN-7), §8.3 | ✅ `:4501` literal, exact |
| The shipped Iterations literal is `Iterations ({N} — limit reached)` and is **the agent's**, emitted through the post-mortem prompt's section list | §8.1 | ✅ `:1965`, inside `postmortemPrompt`. Nothing in the loop writes or reads that heading today, which is what makes clause 3 a new loop-owned write rather than an edit |
| `iterations` returned is the **budget**, not the rounds run | §8.1 (B-RPT-3) | ✅ `:2011` `iterations: MAX_REVIEW_ROUNDS` |
| A halt currently returns the **previous round's** reviewer verdicts | §8.2 (B-RPT-5) | ✅ `:2003-2006` builds `lastResults` from `result1`/`result2`, which are `undefined` on a loop-top halt — so B-RPT-5 is a real change and its defect is real |
| The halt path dispatches the authoring agent **unconditionally**, with no existing-file check | §7.4 (B-HALT-2) | ✅ `:1974` dispatches `postmortemPrompt` before any probe; the only `_checkFile` is the post-write confirmation (`:1990`). The no-re-author rule is a genuine new branch |
| `E-1b`'s claim that this repo's own `POSTMORTEM-R-pdlc-rcv-budget-stop.md` **is exactly the pre-feature shape** | E-1b, AT-CLR-08 | ✅ `## Iterations (5 — limit reached)` at line 48, `RESOLVED: yes` unfenced at line 373, **no** `## Reset Region` anywhere. The migration case is this branch's own next entry, which is the right way to pick a fixture |
| Catalogue §4's `{which}` enum is exactly the three literals §8.3 quotes, and the S-16 enum is closed at three | §8.3, BR-16 | ✅ catalogue §4 *❌ phase-row text* row: `answering line`, `halt line`, `iterations section`; §2 S-16: `{invalid-window-start, invalid-window-resumed, counts-mismatch}` |
| `DC-01`, `DC-03`, `DC-05`, `DC-08`, `DC-10` exist and say what they are cited for | §5.4, §11, §13 | ✅ all five present in `DOMAIN-CONSTRAINTS.md` |

**Nothing in the *"the existing code already does X"* class is unverified.** The one claim I could
not confirm from the module — that a Phase CR halt reaches the same post-mortem-writing path
(B-HALT-8, M-7f) — is carried by the baseline with a line citation (`:4721-4733`), and Phase CR does
enter `reviewLoop` with `phase: "CR"` (`:4980`), whose loop-top halt writes
`POSTMORTEM-CR-{feature}.md` by the same template. Consistent.

## Findings

One High, one Medium, three Low. The High is a fail-open on the exact accounting this feature
exists to protect, reachable through a branch the document already names.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **An unreadable-but-present post-mortem routes the halt down the *creating* path, which re-authors over a live region and the operator's `## Recommendation` — the two things BR-7 and BR-13 exist to guarantee.** B-REG-6/E-8 fix the *read*: unreadable ⇒ `status: "none"` ⇒ `H = A = 0`, `W = 1`, "nothing honoured and nothing written". Verified correct at HEAD. But the entry does not stop there — the Behavioral Flow table runs step 1 (read) → step 3 (window) → step 5 (halt-path maintenance), and on a document with rounds on disk `S > E`, so this entry **always** reaches a halt that writes. §7.2 clause 1 then discriminates on *"a halt finding **no** existing post-mortem"* and §7.4 on *"only a halt finding **no** post-mortem authors one"* — **and the FSPEC never says which predicate decides that**. The one shipped predicate is `checkPostmortem`, which has just answered `"none"`. So a transiently unreadable post-mortem takes B-HALT-1: **an authoring dispatch fires**, the file is rewritten, the prior region's `HALT-REASON:`/`WINDOW-START:` lines are gone, and `H` resets to 1 with `A` to 0 — handing the operator's *next* `RESOLVED: yes` a window that answers a halt whose predecessors were erased, and destroying the `## Recommendation` that clearance is supposed to answer. This is not a torn write (`REQ-RCV-07` AC-7.5) and not a hand-edit (E-13): it is a **read** failure with a write consequence, and this FSPEC owns the write. It also contradicts the document's own text — E-8's "nothing written" is false for the entry as a whole. The FSPEC's own confirmation discipline is the precedent for why this is reachable: §7.3 exists because *"an existence-shaped check passes whether or not the line landed"*, and `_readFile` in the workflow runtime is an agent probe with exactly the same failure mode in the read direction. **What must change:** state the predicate that decides *creating vs. existing* in §7.2/§7.4, and make it fail **closed** — an entry that cannot read a post-mortem it can see must not author over it. The natural disposition is the one §7.3 already uses for its two write failures: **phase refusal**, no halt recorded, nothing stripped, counts unmoved — a fourth `{which}`-style source, or an explicit statement that the creating/existing discriminator is *file presence*, not `checkPostmortem` status, with the unreadable case refusing. Either closes it; the present text picks neither. AT-REG-06's `Then` stops at "nothing written" and so cannot catch this — it needs the entry's continuation. | §5.3 (B-REG-6), §7.2 clause 1 (B-HALT-1/B-HALT-2), §7.4, E-8, AT-REG-06; BR-7, BR-13 |
| F-02 | Medium | Local | **AT-REG-07's pairing rule is unsatisfiable for one of its three mandatory family members, and AT-REG-07 is the *only* leg that falsifies the interim.** §5.4/AT-REG-07 require each malformed region be paired with an *"equivalent well-formed region (**same counts**, same origin, same highest existing round)"* and assert both take the same branch. Two of the three named members construct fine — an inconsistent value and a descending value are both well-formed integers, and because `W` is the **greatest** value (§5.2, not the last), a descending region and its single-line pair genuinely do resolve the same `W`. The third does not: the mandated member is **`H − A ∉ {0, 1}`**, i.e. the counts *are* the malformation. A region with the same counts is by construction also invalid, so no well-formed pair exists and the row's `Then` has no subject for that member. This matters more than a fixture nit because §5.4 is explicit that conjunct 1 is the load-bearing half — *"the absence conjuncts … are the weaker half and neither alone discharges this rule"* — and conjunct 2 (an empty consultation-site enumeration) is structural, not behavioural. So the one behavioural leg that distinguishes *unwired* from *wired with an ad-hoc inline interim procedure* is undefined on the counts case, which is precisely the case an inline procedure is cheapest to write. **Cheapest fix at this altitude:** define the equivalence over what the gate actually consumes rather than over the counts — *same gate decision (`A < H`), same resolved origin, same highest existing round, same resolved `N`* — under which the `H = 3, A = 1` member pairs with `H = 2, A = 1` and the leg is constructible. Fixture construction stays PROPERTIES'; the **relation** is this document's, and it is stated here. | §5.4 (B-REG-7) conjunct 1; §11.3 AT-REG-07 |
| F-03 | Low | Local | **The Behavioral Flow's step order says the gate (2) runs before the window arithmetic (3), but the gate's own output value is defined by step 3.** §6.2 fixes the granting line's `N` as *"the start §4.1 resolves — `max(D, W)`"*, and B-CLR-2/B-CLR-2a branch on `D ≤ E` / `D > E`. So `D` — and `E`, hence `BUDGET` and the pre-gate `W` — must all be resolved **before** the gate can decide, which is the opposite of the table's reading. Nothing downstream is misdirected (§4.4 states the *real* invariant: the gate can move `W`, so the **admission** decision follows it), but a TSPEC author reading the flow table alone will seam it wrong and then discover the cycle. One clause in §4.4 — *`D` is derived before the gate; only the admission arithmetic follows it* — settles it. | Behavioral Flow steps 2–3; §4.4; §6.2 |
| F-04 | Low | Local | **B-CLR-2's guard writes `D` where §4.1 defines `S`.** The row reads *"the resolved start `D = max(D, W)` is `≤ E`"* — an assignment to `D` of a value §4.1 names `S`, in a document where `D` is a defined quantity with a different meaning ("one past the highest existing round"). §12(a) then argues the same guard purely in terms of `D ≤ E`, and B-CLR-2a in terms of `D > E`. On the resume branch `W ≤ D` so `S = D` and no decision changes — which is why this is Low — but the FSPEC is otherwise scrupulous about naming its three quantities exactly once each, and a reader who takes the assignment literally has `D` redefined mid-table. Use `S`, or state that on the resume branch `S = D`. | §6.1 table row B-CLR-2; §12(a) |
| F-05 | Low | Local | **E-14 states the accepted cost for the `halt line` failure but not for the `iterations section` failure, which on a *creating* halt has the same shape plus one extra surprise.** B-HALT-4 refuses when clause 3 cannot be confirmed. On a creating halt, clause 3 runs **after** the authoring dispatch (§7.3, B-PMT-3), so the refusal leaves a fully authored post-mortem on the branch with **no** `## Reset Region`, `H = 0`, and no `RESOLVED:` marker — which means the *next* entry meets the shipped step-G refusal and the operator must write `RESOLVED: yes` once to clear a halt the accounting says never happened, then again after the re-halt records it. Identical two-clearance cost to E-14, reached by the other write, and with an authored file to explain it. It is fail-closed and bounded, so this is a completeness note, not a defect: one clause in E-14, or a sibling row. | E-14; §7.3 (B-HALT-4); §7.4 |

## Questions

## Positive Observations

## Recommendation

## Verdict
