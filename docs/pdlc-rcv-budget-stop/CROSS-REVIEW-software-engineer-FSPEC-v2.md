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

Neither is a finding. Both are things I worked while checking something else and dispositioned;
recorded so the next reader does not redo them.

| ID | Question |
|---|---|
| Q-01 | **AT-CLR-04's given state is unreachable by any specified path at this ship — deliberately, but say so.** It pins `A = H = 1`, `W = 1`, highest existing round 1. `A = 1` requires an answering line. A `WINDOW-START: 1` cannot be written: `N = max(D, W)` and a budget halt needs `S > E`, i.e. `D ≥ 4`, so every granting line at `W = 1` carries at least 4. A `WINDOW-RESUMED: 1` is B-CLR-2, which §6.1 says no path emits until `pdlc-rcv-fixed-point-stop` lands. So the fixture is a hand-built state the loop cannot produce. That is **fine and I am not filing it** — B-CLR-4 must hold over hand-edited regions too (E-13), and the te round's F-05 pinning is what forced the window open here. But an implementer who tries to reach the state through production will not, and one line saying the fixture is constructed rather than driven would save that. It also means AT-CLR-04 is evidence about the gate, not about production reachability, which is worth PROPERTIES knowing. |
| Q-02 | **The `H − A ∈ {0, 1}` invariant and the unconfirmed-write refusals are consistent — I checked, because F-01's erasure case is the one thing that breaks it.** Every path moves `H` and `A` by at most one and only in the answering direction: clause 1 appends one `HALT-REASON:` per halt in scope (§7.2), the gate appends exactly one answering line per consumed clearance (§6.1), and both refusals move neither count (§7.3, §6.3). So `A ≤ H` and `H − A ≤ 1` hold on every specified path, which is what makes catalogue §4's act-1 count tests total. The **only** way to reach `H − A > 1` without a torn write or a hand-edit is a region whose earlier lines were lost — i.e. F-01. That is a second reason F-01 is High rather than Medium: it is the one specified path that can produce the state the validation predicate is later supposed to treat as corrupt, and it produces it silently. |

## Positive Observations

- **The altitude discipline is real, not claimed.** §1's altitude paragraph promises no algorithm,
  seam, signature or fixture design, and the document keeps it for 949 lines while still being
  implementable. §1.1's five-row *not specified here* table and §13.2's obligation dispositions mean
  every gap a reviewer could file is already routed by owner and id. This is the first document in
  this family where I could not find a single place the FSPEC reaches down into TSPEC's layer.
- **B-BUD-3's structural observable is the best piece of engineering in the document.** Phase DOD's
  cap and the post-ship budget are both 3, so the obvious round-count oracle is satisfied identically
  by the correct and the broken implementation — and the document *says so* rather than shipping the
  useless test. The replacement is two legs (`BUDGET` varied ⇒ DOD unchanged; DOD's own declaration
  varied ⇒ DOD follows) plus an enumeration-class assertion, with the reason each leg alone is
  insufficient stated in the row. I verified the coincidence is real at `orchestrate-dev.js:25` and
  `:52`. Deriving the oracle from the collision instead of assuming it away is exactly right.
- **§5.4's rewrite of the interim observable from an absence to a presence is the same move, done
  harder.** "The predicate is consulted zero times" is unfalsifiable when no callable exists — the
  document says so in terms — so the leg becomes a same-branch equivalence that *fails* on any
  implementation that inspects the region's shape at all, inline or not. F-02 is a defect in the
  equivalence relation, not in the idea; the idea is right and I have not seen it done elsewhere in
  this family.
- **The confirmation contract is stated as content reads with the reason each existence check is
  insufficient.** §7.3's table plus *"on a re-halt the file always exists, so such a check passes
  whether or not the line landed — and that is the path that matters"* is the whole argument in two
  lines, and it is the argument F-01 turns back on the read direction. BR-11 restates it as an
  invariant so a flow cannot weaken it locally.
- **The one-update rule survived the trip from REQ to FSPEC intact, including its reason.** §7.3
  carries the unreachability claim (BR-12) *and* the fail-open it removes (a readable marker beside
  an incremented `H`, re-granted on every later halt) rather than just the rule. That is what makes
  the two confirmations reviewable instead of ceremonial.
- **E-1b picks this branch's own post-mortem as the migration fixture, and the shape checks out.**
  `## Iterations (5 — limit reached)` at line 48, unfenced `RESOLVED: yes` at 373, no
  `## Reset Region` — exactly as claimed. Choosing a fixture that already exists on disk, and
  stating the two-clearance cost as specified behaviour rather than discovering it in implementation,
  is the right way to close a migration question.
- **§12(a)'s per-branch proof that a granting entry can never immediately re-halt is complete.** It
  works the `WINDOW-START:` branches by construction (`N` becomes `W`, so `S = W ≤ E`) and the
  `WINDOW-RESUMED:` branch by B-CLR-2's own `D ≤ E` guard, and notes that the argument differs by
  branch rather than pretending one covers both. I checked all four branches; the claim holds.
- **DC-05 is discharged mechanically.** Every `B-*` id in the document has at least one row in §11,
  and §13.1 closes the criterion → flow → branch → test loop in one table. I spot-checked the
  branch ids in both directions and found no orphan on either side.

## Recommendation

**Needs revision** — one High, one Medium, three Low.

**Exactly what must change to clear my side.** Two things; the three Lows are recorded, not required.

1. **F-01.** State, in §7.2 clause 1 and §7.4, the predicate that decides *creating* vs. *existing*,
   and make the unreadable-but-present case fail **closed**. Either disposition works: (a) the
   discriminator is **file presence**, not `checkPostmortem` status, and an entry that can see a
   post-mortem it cannot read takes a **phase refusal** — no authoring dispatch, no halt recorded,
   nothing stripped, both counts unmoved, a fourth `{which}`-scoped source alongside §7.3's two; or
   (b) the discriminator stays the shipped status and the **read failure itself** refuses before the
   window arithmetic, on the same path §5.4's validation-failure variant will take at target state.
   (a) is cheaper — it reuses a refusal shape the catalogue already renders and needs no new string.
   Whichever is chosen, E-8 and AT-REG-06 must carry the entry's continuation rather than stopping
   at "nothing written", which is currently false.
2. **F-02.** Restate AT-REG-07's equivalence over what the gate consumes — same gate decision, same
   resolved origin, same highest existing round, same resolved `N` — instead of over *same counts*,
   so the mandatory `H − A ∉ {0, 1}` member has a constructible pair. Fixtures stay PROPERTIES';
   the relation is this document's.

**Why F-01 is High and not routed downstream under §13.4's stopping rule.** I applied that rule
before assigning severity. F-01 is not an implementability defect, an altitude defect, or an
oracle-design defect — the three classes §13.4 says to approve over. It is a **specified branch with
an unspecified continuation whose only available default is wrong**: the document names the state
(B-REG-6, E-8), asserts a property of it that its own flow contradicts, and leaves the write path to
resolve the discriminator by the one shipped predicate that resolves it the harmful way. Deferring
it to TSPEC would hand a TSPEC author a choice between two observable behaviours the FSPEC is
supposed to have already made — and BR-7 and BR-13 are stated as invariants precisely so no
downstream layer may weaken them. It is a one-clause fix at this altitude and an unrecoverable data
loss if it lands wrong.

**Why F-02 is Medium and not Low.** It would be Low if AT-REG-07 were one leg among several. It is
not: §5.4 states in terms that the absence conjuncts are "the weaker half and neither alone
discharges this rule", and conjunct 2 is structural. So the equivalence relation is the *only*
behavioural evidence separating "unwired" from "wired with an inline interim procedure", and it is
undefined on the member an inline procedure is cheapest to get wrong. That is an oracle that does
not falsify what it exists to falsify — a Medium by the Challenger bar, and closable in one sentence.

**Plateau or churn, stated rather than assumed.** Not applicable as a trajectory: there is no prior
software-engineer FSPEC review to compare against (see *Review basis*), so this round establishes the
baseline rather than continuing a series. For the record, the te round's seven closures are visible
in the text and three of them (F-01's B-BUD-3 observable, F-04's B-REG-7 rewrite, F-06's step-G
no-row conjunct) are among the strongest parts of the document — this is a well-worked v1.1, and my
two blockers are new ground, not re-litigation.

**Pre-commitment for the next round.** A v1.2 that does the two things above and nothing else clears
my side; I will not open new ground on sections I have approved here. If a v1.2 closes F-01 with a
refusal, I will check the `{which}` literal against catalogue §4 rather than accept the claim — a
fourth literal is a catalogue edit and must land in the same revision. If the next round's blocking
count is non-decreasing, or if F-01 is closed by restating E-8 rather than by fixing the write path,
I will recommend the operator halt rather than open a fourth round.

## Verdict

VERDICT: Needs revision
