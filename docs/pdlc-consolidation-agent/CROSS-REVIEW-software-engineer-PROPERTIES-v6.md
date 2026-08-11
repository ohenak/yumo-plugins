# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.5)
**Date:** 2026-08-10
**Iteration:** 6
**Scope:** Delta re-review. Diffed `9a95324f..HEAD` (commit `01841250`, the only change to the
document since v1.4), re-read my own v5 cross-review first, and judged (a) whether F-01 is resolved
and (b) whether the revision broke anything it touched or anything downstream of it. Unchanged
sections are not re-litigated except where the delta's own claims now bear on them. Every upstream
citation the new text leans on was re-measured at HEAD.

## 1. F-01 disposition

**Resolved, and resolved at the right layer.** v5's High asked for one thing — the second fixture
TSPEC §12.2 specifies for the case `PROP-COR-09` already owns — plus two bookkeeping edits. All three
landed, and nothing else moved.

| v5 ask | Disposition at HEAD | Evidence |
|---|---|---|
| Add the all-unreadable fixture: status exactly `no-op`, pair empty, `\|un-consolidated\|` = 2, both basenames named | **Done, verbatim against the authority** | `PROPERTIES:418-425` carries all four observables and the "not `failed` … not `refused`" exclusion, transcribing `TSPEC:2850` rather than paraphrasing it |
| Carry §12.2's mutual-control sentence | **Done** | `:423-425` — the all-unreadable fixture keeps *"pair empty"* from passing on a pass that enumerated nothing, the mixed fixture keeps the status assertion from passing on an implementation that terminates every unreadable-touching pass `failed`. Both directions stated, matching `TSPEC:2850` |
| Widen the title past "entry" | **Done** | `:406-407` — *"An unreadable corpus entry — up to and including the **whole corpus** — is omitted …"* |
| §12.1's AC-1.4 row gains `PROP-COR-09` | **Done** | `:1668` names it *"the **third** cause — the all-unreadable corpus, and the only property asserting it"* |
| Trailer gains `AC-1.4` | **Done** | `:428-429` — `AC-1.1, AC-1.4, REQ §4b · (no FSPEC AT), TSPEC §12.2` |
| Answer Q-01 (deferred or missed?) | **Answered honestly** | changelog `:16-22` says **missed**, and gives the mechanism: the routed item list was cut against REQ v2.1 while the wave grew REQ v2.5's second arm afterwards. `POSTMORTEM-T` Episode 2's own commit-order table corroborates the timing independently (TSPEC v2.6 at 15:56–15:59, PROPERTIES erratum at 16:12) |

Three things I checked specifically, because a "just add the fixture" round is an easy place to
over-reach or to leave the surrounding text behind:

- **No collateral movement.** Distinct `PROP-*` ids at HEAD = **118**; symmetric difference against
  the v1.4 blob (`9a95324f`) is **empty**. No property added, removed, renumbered or re-homed, and
  the new fixture claims no register id — consistent with `TSPEC:2923`, which says both fixtures live
  in the one case and claim **no** register id, so `consolidationPass.test.js`'s assignment set and
  the set equality over it are undisturbed.
- **No new task, no re-homing.** The trailer still reads `L2 · consolidationPass.test.js · T20 →
  T31`. `PLAN:365` (T20, the RED block for `consolidationPass.test.js`) and `PLAN:388` (T31, the
  driver that greens it) both exist and both name that file (`PLAN:424`, `PLAN:435`), so the second
  fixture lands inside an already-planned case rather than implying an unplanned one.
- **Oracle quality of the added text.** The new fixture is not an absence-only oracle: *"pair empty"*
  travels with three positive assertions on the same path (status exactly `no-op`,
  `\|un-consolidated\|` = **2**, both basenames named as unread), and §12.2's mutual-control sentence
  is what stops each from passing vacuously. Expected values are literal transcriptions from spec
  (`no-op`, `2`), not derived from anything under test.

## 2. Independent re-measurement

Every factual claim the revision rests on is a claim about some other file, so each was measured at
HEAD rather than taken from the document's prose.

| Claim | Verdict at HEAD |
|---|---|
| TSPEC §12.2 specifies a **second** fixture for this case, with those four observables | **Exact.** `TSPEC:2850`: *"**A second fixture in the same case carries the all-unreadable corpus** (§10.3 row 1b): … asserts positively that the terminal status is exactly `no-op` — not `failed` (row 1a's outcome, the adjacent branch an implementer is most likely to reach for) and not `refused` — that the rendered consumed pair's basename list is **empty**, and that `\|un-consolidated\|` is **2** with both basenames named in the report body as unread"* |
| §10.3 row 1b routes the all-unreadable pass to `no-op` as AC-1.4's **third** cause | **Exact.** `TSPEC:2230` — row 1b, *"`no-op` — AC-1.4's **third** cause (REQ §4b, `REQ-…:625-631`)"*, with **no** reason code minted and the pair rendered empty |
| REQ §4b decides the all-unreadable pass terminates `no-op` and mints no reason code | **Exact.** `REQ:624-631` — *"That pass's terminal status is `no-op`"* … *"and no reason code is added either"*, distinguished by the AC-7.1 pairing (consumed list empty **while** the un-consolidated set is non-empty), which the new PROPERTIES text carries at `:426-427` |
| AC-1.4 has **three** causes at HEAD | **Exact, and this is the point of F-01 below.** `REQ:224-233` enumerates all three in the AC body itself and closes *"the **three** causes differ exactly there (the first and third consume nothing, the second consumes)"* |
| FSPEC absorbed the same arm | **Exact.** `FSPEC:21` (v11.7 changelog) and `FSPEC:2388` — the all-unreadable pass terminating `no-op` with an empty consumed set is named in the AC-1.4 → AT map's own terms |
| No register AT covers the arm, so `(no FSPEC AT)` is the right trailer | **Exact.** `TSPEC:2850` walks it: AT-K3, AT-L2, AT-F13, AT-R7 cover AC-1.4's second and first causes only (`FSPEC-…:2370`) |
| Property count unchanged at 118 | **Exact**, verified as a set and not just a count: id sets at HEAD and at `9a95324f` have empty symmetric difference |
| `PROP-COR-09` is the **sole** carrier of the third cause | **Exact.** `grep -o "all-unreadable"` returns five hits — the changelog (`:19`), PROP-COR-09's body (`:419`, `:422`, `:424`) and §12.1's row (`:1668`) — i.e. one property and its register row, no second claimant |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The consequent edit stopped one property short: `PROP-PASS-11` still says AC-1.4 has *two* causes, and its title still claims closure over *both* of them.** The revision added the third cause in three places (PROP-COR-09's title, its body, §12.1's row) but left the property that speaks about AC-1.4's cause *set* untouched. At HEAD `PROP-PASS-11` reads *"A `no-op` pass still reports, still restates, and still releases — on **both** of its causes"* and *"Two Givens, because AC-1.4 **has two causes** that differ exactly where AC-5.3 and AC-5.5 count"* (`:1386-1391`). Both statements are false at HEAD against `REQ:224-233`, which enumerates three causes in the AC body and closes *"the **three** causes differ exactly there (the first and third consume nothing, the second consumes)"* — and they now contradict this document's own `:1668` and `:426-427`, which call the all-unreadable pass AC-1.4's **third** cause. This is a closure claim over an enumeration, not loose prose: a reader reconciling §12.1 with `PROP-PASS-11` finds the register naming a third cause and the property asserting there are two. The fix is small and mostly already decided upstream — REQ's own sentence supplies it: the third cause consumes nothing, so it is streak-equivalent to the first, and `PROP-PASS-11`'s two Givens remain exactly the right two for *this* property. Suggested wording: title *"on both of the causes that differ in what they consume"*, body *"AC-1.4 has three causes; two of them differ exactly where AC-5.3 and AC-5.5 count, and the third (§4b's all-unreadable pass, PROP-COR-09) consumes nothing and so is streak-equivalent to (i)"* | §11 `PROP-PASS-11` (`:1386-1403`); cf. `:1668`, `:426-427`, `REQ:224-233` |
| F-02 | Medium | Local | **The third cause is asserted for four observables and no others; `PROP-PASS-11`'s three "still" obligations are not asserted on that path.** AC-1.4's obligations are positive and hold on *every* cause: records `no-op`, exits without a PR or proposal file, **still emits the AC-5.2 effectiveness table** restating standing verdicts, and **still releases the AC-1.3 marker** (`REQ:224-231`). `PROP-COR-09`'s new fixture asserts status, empty pair, `\|un-consolidated\|` = 2 and the named basenames — correctly, since that is exactly what `TSPEC:2850` specifies — while `PROP-PASS-11` scopes its restate/release conjuncts to causes (i) and (ii) by construction. So on the all-unreadable path no property asserts the table is emitted or the marker released. I am **not** asking for a new fixture: the boundary is upstream's (TSPEC scoped the second fixture deliberately), and the fix for F-01 can discharge this in one sentence by stating why — the third cause reaches `finishPass` through the same exit as the first, so `PROP-PASS-11`'s conjuncts range over it. What is not acceptable is leaving it unstated, because §12.1 now reads as if AC-1.4 coverage were complete and the reader has no way to see which observables the third cause actually carries | §4 `PROP-COR-09` (`:415-429`); §11 `PROP-PASS-11` (`:1386-1403`); §12.1 (`:1668`); cf. `TSPEC:2850`, `REQ:224-231` |
| F-03 | Low | Process | **`POSTMORTEM-T`'s halt record now contradicts itself: the marker reads `RESOLVED: yes` while the body still reports Episode 2 as open.** Commit `01841250` flipped `:14` to `RESOLVED: yes` and changed nothing else in that file, so `:19-20` still reads *"that single marker governs and stays **open** on Episode 2's erratum-confirmation halt"* and the episode table's row 2 still carries state **open** (`:25`). Mechanically the flip is the intended outcome — the finding it names is addressed, `parseResolvedMarker` reads `yes`, and the phase is unblocked — so this is legibility, not a gate defect. But the halt lifecycle's whole value is that a later reader can tell from the record whether a halt was cleared and on what evidence; a record that says both is worse than either. Episode 2's row wants `resolved 2026-08-10` and the prose sentence wants the same past tense the Episode 1 sentence beside it already uses | `POSTMORTEM-T-pdlc-consolidation-agent.md:14`, `:19-20`, `:25` |

**Why no High.** I weighed F-01 there and decided against it. v5's High was a *coverage* finding — an
obligation with no property behind it and, per TSPEC's own analysis, no register AT either. That is
now closed: the arm is asserted, by the right property, at the right layer, with the controls that
make it non-vacuous. F-01 and F-02 are statements *about* coverage that have fallen out of step with
the coverage itself. They are real defects and both should be fixed in the next revision, but neither
leaves an obligation untested, and the convergence question for this round — did the routed erratum
land, and did the revision break anything — answers yes and no.

**Why no erratum.** Nothing upstream is wrong. REQ §4b and AC-1.4, TSPEC §7.1 / §10.3 row 1b / §12.2,
and FSPEC v11.7 all state the three-cause arm correctly and consistently at HEAD; I re-measured each.
The stale two-cause text is this layer's alone, so it is a finding, not a routed item.

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | F-02's boundary is upstream's to move, not mine, so I want it named rather than assumed: is the intent that the all-unreadable path's *restate* and *release* obligations ride on `PROP-PASS-11`'s conjuncts reaching every `finishPass` exit, or that they are simply unasserted on that path and accepted as such? Either answer is defensible and neither needs a new property; I only ask that the revision write down which one it is, in the sentence that fixes F-01. |

## 5. Positive Observations

- **The fix took the authority's shape, not a summary of it.** The added text carries `TSPEC:2850`'s
  four observables, its "not `failed` … not `refused`" exclusion, its reason for naming `failed`
  specifically (row 1a's outcome, the adjacent branch), and its mutual-control sentence — in the
  cell's own words. Layers that transcribe rather than paraphrase are the ones that survive the next
  erratum without re-deriving a contradiction.
- **The controls run in both directions, which is the hard half.** It would have been enough, on a
  literal reading of v5's finding, to add a fixture asserting `no-op`. What landed says why each
  fixture cannot pass vacuously *and* why the other one is its control — so neither the empty-pair
  assertion nor the status assertion is a lone negative.
- **Q-01 was answered against the reviewer's interest.** "Missed, not deferred" is the costlier of
  the two available answers, and the changelog gives the mechanism (list cut against REQ v2.1, wave
  grew a second arm afterwards) rather than an apology. `POSTMORTEM-T` Episode 2's commit-order table
  corroborates it independently, which is how a root cause should read.
- **The re-ground-first discipline is visible in the edit.** The changelog says the revision
  re-grounded on the upstream cells at HEAD *ahead of* the routed item list, and the text bears that
  out — it cites §10.3 row 1b, a cell that did not exist when the item list was cut.
- **Bookkeeping stayed honest under a widening edit.** A round that widens a property's scope is
  exactly where id sets quietly drift; this one did not move a single id, and §12.1's row states the
  new coverage as *sole* carriership rather than adding a name to a list and leaving the reader to
  infer what it carries.

## 6. Recommendation

**Approved with minor changes**

The High from v5 is closed, and closed at the layer that owned it: `PROP-COR-09` now carries both of
TSPEC §12.2's fixtures, the title covers the whole-corpus arm, §12.1's AC-1.4 row names the third
cause and its sole carrier, and the trailer cites `AC-1.4`. No property moved, none was added or
removed, the set stands at 118, and the new fixture lands inside `PLAN` T20 → T31's existing case.
Nothing the revision touched broke.

Two Medium findings should be picked up in the next revision and can be discharged by editing one
property. `PROP-PASS-11` must stop saying AC-1.4 has two causes and stop claiming closure over
"both" (F-01), and the same sentence should say what happens to the third cause's *restate* and
*release* obligations (F-02, Q-01). F-03 is a one-line consistency repair in `POSTMORTEM-T`, outside
this document, recorded here because the halt record is the artifact a later reader will trust.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
