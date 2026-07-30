# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.1)
**Sources of truth:** `REQ-…` **v1.6**, `FSPEC-…` **v1.6** (both amended this round; both re-read)
**Baseline diffed:** `80c9586..HEAD` on `feat-pdlc-review-loop-hardening`
**Date:** 2026-07-30
**Iteration:** 2 (delta)
**Scope:** Delta only. My five v1 findings verified individually against the tree, then the changed
sections of the TSPEC, plus the full REQ v1.5→v1.6 and FSPEC v1.5→v1.6 diffs and the `QUEUE.md`
amendment. Unchanged sections were not re-reviewed. Product lens: fidelity to REQ acceptance
criteria and FSPEC obligations, scope discipline in both directions, observable operator behaviour,
and altitude. Technical design and test mechanics remain out of scope; where I cite an AT it is for
the operator-facing contract it pins, not for its construction.

---

## Verification of my five v1 findings

| Prior | Status | Evidence |
|---|---|---|
| **F-01** (High) | **Partially fixed — the stated defect is gone, a symmetric one was introduced** | §2.5 now evaluates the skip first; step 4a is reached only on `STALE`/`UNEVALUABLE`; the forced path refuses unconditionally at step 1; step 4's `FRESH` branch calls `checkPostmortem` report-only. §4.7 specifies the notice string verbatim. §5.8 states "`checkPostmortem` is a **query**, not a gate." §6.2 row 13 is scoped to steps 1/4a and row 13a added. **FSPEC §12.4 example A re-verified reachable by me, not taken on the changelog's word**: approving pair present ⇒ `candidate = startIndex − 1 ≥ 1` ⇒ tier 1 approving ⇒ §5.5 `FRESH` ⇒ step 4 skip + notice ⇒ run continues to Phase F. Reachable and reached. **But worked example B is now unreachable — see new F-01.** |
| **F-02** (High) | **Fixed** | The unconditional conjunct is deleted, not reconciled. §5.6.2's `isTerminal(mode, …)` returns `structural` alone when `mode !== "revision"`; §5.6.1 rule 3 puts every wrapped `pm-review`/`se-review`/`te-review`/`dod-verify`/`harvest-learnings` episode in that branch by construction; §4.3 confirms `parseRevisionComplete` is called only on a revision episode; §6.2 row 9 is scoped and row 9a records the greenfield non-event. The H-3 reconstruction is closed. (A separate carrier loss came in with this fix — new F-02.) |
| **F-03** (Medium) | **Fixed** | §5.6.1 `selectMode` exists and is stated to be the only producer of `mode` (§4.5 repeats it: "produced by exactly one function"). Its four rules match AC-3.5 scope (d) / FSPEC §15.2: revision test first, decided from review artifacts on the branch, independent of structural state, failing toward revision. The retracted derivation is named and excluded. §5.6.3 now opens "**This table selects the prompt kind. It does not select the mode**" and states all four (kind, mode) combinations occur. |
| **F-04** (Medium) | **Fixed in substance** | `QUEUE.md` gains a well-formed five-column row — `\| 8 \| blocked \| pdlc-authoring-contract \| docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md \| pdlc-review-loop-hardening \|` — matching the row-6/row-7 convention. Its prose genuinely binds all three: Q-09 (named acute), T-Q-03, Q-05. **No existing row was altered** — the diff is a single `+` line inside the table, and **row 0 still reads `halted`**. TSPEC §10.2/§10.3 owner cells now name the row. The `Order` value chosen is a problem in its own right — new F-03. |
| **F-05 / T-Q-01** (Medium) | **Fixed; propagation verified complete** | I checked for a *remaining* five-member enumeration across all three documents rather than trusting the changelog. `rg 'R, F, T, P\|R,F,T,P\|five phases\|all five\|five-member\|five-phase'` over REQ, FSPEC and TSPEC returns only (a) changelog prose *describing* the old set, and (b) unrelated uses of "five" (the five `5` literal sites in §7.1, AC-4.2d's five bullets, LEARNINGS' five numbered sections). Every live site is six: REQ AC-4.7; FSPEC §10.7, §11.1 catalogue ("all six"), §11.3 parse row `{R,F,T,P,D,PR}` and the rejection halt text; TSPEC §5.5 scope, §5.7's `valid = ["R","F","T","P","D","PR"]`, the derived message, §6.2 row 12. `all` expands to six at every site that states its expansion. The REQ/FSPEC amendments are scope-disciplined in both directions — the REQ diff touches only the changelog and AC-4.7, the FSPEC diff only the changelog, §10.7, §11.1 and §11.3; nothing else widened, no clause withdrawn. This was the round's highest-risk edit and it landed clean. |

**Mechanical, not findings (lesson R-6):** REQ v1.6 and TSPEC §0.1/§10.3 cite the `all`-expansion
site as FSPEC "§11.2"; it is §11.1 (§11.2 is "The three edits this input requires"). Fix in passing.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The F-01 reordering moved the defect rather than removing it: AC-2.3's refusal is now unreachable on the paths where the phase runs *without* an approval record — including FSPEC §12.4 / AC-2.3b's own worked example B.** §2.5 reaches the POSTMORTEM gate at exactly one unforced site, step 4a, and step 4a is entered only from step 4's `STALE` / `UNEVALUABLE` branches. But §5.4 short-circuits **before** §5.5 on two documented paths: `candidate ← startIndex − 1; **if candidate < 1: run the phase**`, and every `→ NOT APPROVING` exit. Neither produces a `recordedHash`, neither is shown flowing into step 4, and §6.2 row 13 now scopes the refusal exclusively to "§2.5 step 4a" or "§2.5 step 1". Worked example B is precisely the `candidate < 1` case: `pdlc-workflow-distribution` post-harvest holds `POSTMORTEM-R-…` and **zero `CROSS-REVIEW-*` files**, so `present` is empty ⇒ `startIndex = 1` ⇒ `candidate = 0` ⇒ "run the phase" — bypassing step 4 and step 4a entirely. The REQ requires the opposite in terms: "Phase R **would run**, and AC-2.3 therefore **refuses and halts**, reproducing the POSTMORTEM's Recommendation. That is the correct outcome, not a defect." AC-2.3b closes with "When approval is absent or stale (AC-4.4), the phase would run and AC-2.3 refuses." Under v1.1 the *absent* half of that sentence has no code path. The operator impact is worse than v1.0's: a feature that halted with an unresolved POSTMORTEM and has no readable approval — the commonest re-entry state, and the state this whole clause exists for — now re-enters the failing phase silently instead of surfacing the Recommendation. Under lesson R-5 the fix is to delete the coupling, not add a case: make the POSTMORTEM gate the single thing every non-skipped, non-forced entry passes through, i.e. route §5.4's two short-circuits into step 4a rather than to step 5. | AC-2.3, AC-2.3b worked example B, AC-4.4, FSPEC §12.4 |
| F-02 | Medium | Local | **The F-02 fix deleted the trailer reason's only carrier.** v1.0's loop bound `trailer ← parseRevisionComplete(response)` in the loop's own scope, so the four `TRAILER_FAILURES` values were available to the report. v1.1 replaces it with `isTerminal(mode, response, class, docType, after)` declared in §3.7 as "**→ boolean**", and §4.3 states `parseRevisionComplete` is now called *only* from inside `isTerminal`. The reason is computed and discarded. Three things downstream lose their producer: FSPEC AT-61 — "*Then* all four are non-terminal **and** the report echoes `declared_incomplete`, `absent`, `duplicated` and `unparseable` respectively" — has nothing to echo; FSPEC §2.2's note that the four reasons are "echoed verbatim in the run report, giving them a consumer (TE F-07, E-67, E-68)" is no longer satisfied; and §3.8's own declared return union `{ ok: false, reason: "trailer", detail: string }` is now unproduced — §5.6.2's loop has no `reason: "trailer"` exit at all. This is the same defect shape the author correctly fixed for TE F-06 (`deriveRoundWindow` discarding its rejects) reintroduced one section away. Operator impact: a revision episode that stalls on a malformed trailer reports only "no_progress"/"dispatch_budget", so the operator cannot tell a `declared_incomplete` author from a SKILL emitting a duplicated or unparseable line. Smallest fix consistent with the mode split: have `isTerminal` return the record it already computes rather than a boolean, or bind the trailer result in the loop on the revision branch only. | FSPEC AT-61, §2.2 (E-67, E-68), TSPEC §3.8, §4.3 |
| F-03 | Medium | Cross-Feature | **The successor row is bound to an `Order` value that is already a live alias for a different feature, in the one document that warns against exactly this.** `QUEUE.md`'s own standing banner (lines 12–18) reads: "**Row 0 was row 8 until 2026-07-29.** … The other rows were deliberately **not** renumbered … **Documents written before 2026-07-29 call this row 'row 8' — that is the same row.**", citing DC-07 and DC-12 as the reason. Adding a *new* `Order 8` makes that banner self-falsifying and makes ~10 live cross-document references ambiguous: `docs/pdlc-workflow-distribution/POSTMORTEM-R-….md:309` ("Raised as queue row 8, `pdlc-review-loop-hardening`"), `REQ-pdlc-workflow-distribution.md:1012` ("routed to queue row 8 (`pdlc-review-loop-hardening`)"), `LEARNINGS-pdlc-workflow-distribution.md` (four rows), and `docs/_decisions/CONSOLIDATION-PROPOSAL-2026-07-29.md` P-2/P-3/P-4 ("Overlaps queue row 8 H-1/H-2/H-3/H-4"). All resolve to row **0**; the new row 8 is a different feature. The TSPEC's §10.2/§10.3 cells are safe because they name the feature, but §0's settlement table binds Q-05 and Q-09 to a bare "`QUEUE.md` row 8", and `QUEUE.md`'s own new prose opens "Row 8 (**added 2026-07-30**)". This defeats the purpose of the binding: DC-08 asks for a *resolvable* successor surface, and a reader following "row 8" from the harvested LEARNINGS lands on the wrong feature. The fix is one character — give the new row an unused `Order` (9), or amend the banner to disambiguate — and it is far cheaper now than after harvest. | DC-08, DC-07, DC-12, `QUEUE.md` banner |
| F-04 | Low | Local | §2.5's normative prose contradicts its own table on the count of call sites: "`checkPostmortem({ phase, feature })` (§5.8) appears at exactly **two** places above, with **two** different powers" — immediately followed by a **three**-row table (forced/step 1, would-otherwise-run/step 4a, skipped/step 4) and an ASCII flow showing three call sites. §5.8 correctly says three ("unconditional refusal on the forced path, refusal on the would-otherwise-run path, and reporting only on the skip path"). The report-only call is the one the section itself says "an implementation drops silently", so miscounting it in the summary sentence is the worst place for this slip. Per R-5, delete the count from the sentence rather than reconciling it. | AC-2.3b |
| F-05 | Low | Local | On the skip path §4.7 puts the POSTMORTEM path **only** in the free-text detail string (`…; unresolved POSTMORTEM at {postmortemPath}`) while explicitly nulling the structured field: "`haltPhase` and `postmortemPath` stay `null`, because the run did not halt." AC-2.5's principle is that the phase and the POSTMORTEM path are "structured fields, not only inside a free-text reason string". AC-2.5 is written about the *halt* report, so this is not a literal violation — but the design sets `postmortemStatus: "unresolved"` (structured) and then withholds the one datum that makes it actionable, forcing any consumer of the skip report to parse prose. Populating `postmortemPath` on the skip path while leaving `haltPhase` null preserves the "skipped vs refused" distinction the section is protecting and costs nothing. | AC-2.3b, AC-2.5 |
| F-06 | Low | Local | Three FSPEC §20 dispositions were changed only downstream. TSPEC §10.2 now records **Q-06** as "**Declined, closed — not carried**" and **Q-05**/**Q-09** as bound to `QUEUE.md` row 8, but FSPEC §20 still shows Q-05 owned by "Whoever revises `harvest-learnings/SKILL.md`", Q-06 by "Operator convention / later feature" and Q-09 by "Whoever revises author SKILLs" — the prose owners F-04 objected to. The FSPEC was reopened to v1.6 this round anyway, so recording the three dispositions there was ~free. A reader of the FSPEC alone still sees three live, unbound questions, which is the state DC-08 describes as "read downstream as an unhandled deferral". Note also the altitude: Q-06 is a REQ/product question and my v1 recommendation was that the **REQ** close it; the TSPEC closed it unilaterally. The reasoning is right and I do not contest the outcome — only that the closure is recorded in the wrong document. | DC-08, FSPEC §20 |

---

## Regression check — the specific concern raised for this round

Asked to look for collisions between the new three-way POSTMORTEM handling and the skip/force paths.
I found one, and it is F-01. The three enumerated paths are individually correct; the defect is the
**fourth path nobody enumerated** — unforced, no readable approval record, so §5.4 exits before
§5.5 and never reaches step 4a. v1.0's pre-step-1 gate was wrong about *precedence* but total over
*paths*; v1.1's is right about precedence and no longer total. The two errors are exact mirrors:
v1.0 made worked example A unreachable, v1.1 makes worked example B unreachable. The REQ states
both examples as reachable and correct, so neither shape satisfies AC-2.3b.

The F-02 mode split produced no path collision — `selectMode` rule 3 and `isTerminal`'s
`mode !== "revision"` branch agree, and greenfield/`"authoring"` is used consistently as the one
non-revision value. Its cost was the carrier loss in F-02, not a control-flow collision.

---

## Judgement on the +44.8% growth

**Roughly 55–60% of the addition is load-bearing; the balance is changelog and defensive rationale.
It is not over-specification at the wrong altitude, and it is not scope creep — but it is where two
of my three substantive findings came from.**

- **Load-bearing, and I would not cut it** (~345 of ~606 added lines): §5.6.1 `selectMode` (the
  coordinate genuinely had no producer), §5.6.2 `isTerminal`, §2.5's reordering, §4.7's notice
  string, §5.2's `skipped` carrier, §5.3's pre-count table, §7.2's edits 2a/2b, §8.3's measured
  baseline, §8.5's exemption predicate. Each closes a named gap and each replaces prose with a rule.
- **Bookkeeping, correctly placed, harvested away later** (~95 lines): §0's finding→resolution table
  and §0.1. Not spec, but the right place for it, and the delta protocol depends on it existing.
- **Where the growth actually is, and my one reservation:** the ratio of *rationale to rule* has
  inverted in the amended sections. Several fixes ship a 3–8 line normative rule followed by 15–25
  lines arguing why that shape and not the alternative — §2.5's "Why this is stated so emphatically",
  §5.6.2's "Why the conjunct was deleted rather than reconciled", §5.2's "Step 1 keeps the rejects",
  §8.5's "Why the parameter-list derivation is wrong here", §7.2's T-Q-05 measurement essay. None of
  it is wrong. But each paragraph is another place a later edit must stay consistent with, and both
  F-04 (a summary sentence that miscounts its own table) and F-02 (a declared return union left
  unproduced one section from where it was described) are consistency casualties of exactly that
  texture. The FSPEC phase's round-3 over-reach → round-4 regression is the same mechanism, one
  altitude up.
- **On altitude specifically, the news is good:** the single product decision available this round —
  T-Q-01 — was pushed to REQ v1.6 rather than absorbed, and the REQ/FSPEC amendments touched only
  AC-4.7 and its three downstream sites. No product decision was taken in the TSPEC this round
  except Q-06's closure, which is F-06 and is a placement issue, not a substantive over-reach.

So: the growth is justified in kind, disproportionate in volume, and the disproportion is prose
about decisions rather than decisions. A round-3 revision should be able to be *net-neutral* in
size — F-01 removes clauses, F-02 changes a return type, F-03 changes one character, F-04 and F-05
delete or move a few words.

---

## Positive Observations

- **F-05's propagation is exemplary, and it was the round's highest-risk edit.** Two approved
  documents reopened, six sites changed across three files, and I could not find a single surviving
  five-member enumeration or an `all` that still expands to five. The FSPEC's added paragraph — "the
  message **is** the catalogue as far as an operator is concerned … the two are one list and change
  together" — is the right reason stated at the right altitude, and §5.7's derivation of the message
  from the `valid` array means this class of slip cannot recur mechanically.
- **Both High fixes were made by deletion, as asked.** The changelog claims this and the diff bears
  it out: the unconditional conjunct is *gone* rather than exempted, and the global gate is *demoted*
  rather than given an exemption list. That is R-5 applied correctly, and it is why F-02's residue is
  a carrier loss rather than a second rule to keep in sync.
- **Two reviewer suggestions were measured and overturned rather than accepted.** TE F-04's proposed
  exemption predicate was measured too wide against five real capability seams, and §8.3's "must stay
  green" premise was measured false (1038/1/70). Under `DC-02` that is the behaviour the constraint
  exists to produce, and a document that pushes back with numbers is more trustworthy than one that
  complies.
- **T-Q-05 and Q-06 were closed rather than carried,** with the measurement and the reason stated at
  the point of decision. Two fewer open questions entering PLAN is worth more than the paragraphs it
  cost.
- **§10.2's Q-09 row now states the residual risk honestly** — "the risk is bounded to 'detected at
  test time' *as long as that copying discipline holds, which is itself the thing row 8 removes the
  need for*". Naming the mitigation's own decay mode is exactly what makes a deferral safe to accept.

---

## Recommendation

**Needs revision**

Required before approval:

1. **F-01 (High)** — Make the POSTMORTEM gate total over the unforced paths. Route §5.4's
   `candidate < 1` and `NOT APPROVING` exits into §2.5 step 4a instead of straight to step 5, so
   AC-2.3b's "when approval is absent or stale, the phase would run and AC-2.3 refuses" has a code
   path and worked example B halts as the REQ says it must. Confirm example **A** stays reachable
   under the revised flow — both examples must hold simultaneously.
2. **F-02 (Medium)** — Restore a carrier for the trailer reason: return the record from `isTerminal`
   rather than a bare boolean, or bind `parseRevisionComplete`'s result in §5.6.2's loop on the
   revision branch. §3.8's declared `{ reason: "trailer", detail }` must have a producer, and AT-61's
   four reasons must reach the report.
3. **F-03 (Medium)** — Give the `pdlc-authoring-contract` row an unused `Order` (9 is free), or
   amend `QUEUE.md`'s 2026-07-29 banner to disambiguate the two meanings of "row 8". Update the three
   TSPEC references that name the row by number only.
4. **F-04 (Low)** — Delete "at exactly two places … with two different powers" from §2.5; the table
   below it already says three.
5. **F-05 (Low)** — Populate `postmortemPath` on the skip path; keep `haltPhase` null.
6. **F-06 (Low)** — Record Q-05, Q-06 and Q-09's dispositions in FSPEC §20 as well, since the FSPEC
   was amended this round regardless.

Non-blocking: fix the FSPEC "§11.2" → "§11.1" citation in REQ v1.6 and TSPEC §0.1/§10.3.

VERDICT: Needs revision
