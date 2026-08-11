# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.6)
**Date:** 2026-08-10
**Iteration:** 7

**Scope:** Delta re-review. Re-read my own v6 cross-review first, then diffed
`01841250..HEAD` (four commits: `8b2d155b`, `aca59b1d`, `2e5684a2`, `1c5f5332`, plus the
`7545fea1` changelog) and judged two things only — whether v6's F-01/F-02/F-03 are
resolved, and whether the revision broke anything it touched. Unchanged sections are not
re-litigated, except where the delta's own claims now bear on them (§10.4 `PROP-TRC-01`,
which the register edit mechanically moves).

## 1. Prior-finding disposition

| v6 finding | Disposition at HEAD | Evidence |
|---|---|---|
| F-01 (Medium) — `PROP-PASS-11` still said AC-1.4 has *two* causes, title claimed closure over *both* | **Resolved.** Title now reads *"on both of the causes **that differ in what the pass consumes**"*; body states *"AC-1.4 has **three** causes (`REQ:224-233`)"* and names `PROP-COR-09` as the third's carrier. The AC-1.3 release conjunct was narrowed in the same edit — *"the two causes it names above — not the status's whole cause set, whose third member is PROP-COR-09's"* | `PROPERTIES:1415-1431`; matches `REQ:224-233` |
| F-02 (Medium) — no property stated where the third cause's *restate*/*release* observables live | **Resolved, and answered rather than deferred.** Both sides now say it: `PROP-COR-09` at `:443-448` (*"leaves `finishPass` through the same exit as that property's cause (i) — consumed set empty, so no AC-5.2 verdict is produced and neither streak advances"*), and `PROP-PASS-11` at `:1419-1423` from the other end. Q-01's two admissible answers — ride on cause (i)'s conjuncts, or accept it unasserted — the revision picked the first and gave the mechanism | `:443-448`, `:1419-1423` |
| F-03 (Low, Process) — `POSTMORTEM-T` marker read `RESOLVED: yes` while the body reported Episode 2 open | **Resolved.** `:14` keeps the single `yes`; the prose now records *when* and *on what* it was flipped (*"after Episode 2's Recommendation was addressed: PROPERTIES v1.5 landed the all-unreadable arm … and iteration 6's review of that revision found no High"*), and the episode table's row 2 reads `resolved 2026-08-10` with the same evidence. The "do not flip while a Recommendation is unaddressed" rule is stated as standing, not as this file's excuse | `POSTMORTEM-T-…:14`, `:16-22`, `:25` |

All three closed, none by weakening a claim.

## 2. Independent re-measurement of the delta's new claims

The delta makes eight checkable assertions about other files. I grepped and read each at
HEAD rather than taking the changelog's word:

| Claim in the delta | Verdict |
|---|---|
| `AT-K3b` exists at `FSPEC:2210`, minted by FSPEC v11.7 | **Exact.** The row is there, operator/Given/When/Then intact |
| The register row's Given is *"a corpus whose enumerated basenames are all unreadable on disk …, with nothing else to promote"* | **Verbatim** (`FSPEC:2210`) |
| Its Then is the four observables `PROP-COR-09` already pins | **Exact, and the one leftover is correctly delegated.** The Then carries terminal `no-op`, consumed pair **empty**, *no* proposal file for that `passId`, *no* reason code, plus AC-7.1's discriminator. `PROP-COR-09` claims all but the proposal-file conjunct and says so explicitly — *"is PROP-RTE-06(b)'s, on the same terminal status, and is not restated here"* (`:441-442`). `PROP-RTE-06(b)` is indeed a `no-op`-pass fixture asserting no `CONSOLIDATION-PROPOSAL-*.md` for that `passId` (`:1050-1058`). No conjunct falls between the two properties |
| FSPEC §15's AC-1.4 → AT map binds AT-K3b | **Exact.** `FSPEC:2388` lists *"AT-K3, AT-K3b (the third cause: the all-unreadable terminating `no-op`), AT-L2, AT-F13, AT-R7"* |
| FSPEC v11.7's changelog announces the mint | **Exact** (`FSPEC:21`) |
| `grep AT-K3b` returns **zero** hits in TSPEC and PLAN at HEAD | **Confirmed.** Repo-wide grep hits only PROPERTIES and FSPEC |
| TSPEC §12.2 still asserts *"which no register AT reaches either"* for the whole-corpus observable | **Exact, and now false** — `TSPEC:2850` carries that clause and reasons from the pre-v11.7 map (`FSPEC-…:2370`). Erratum 8(a) is correctly stated |
| TSPEC §12.3 assigns AT-K1…AT-K7 to `consolidationCredential.test.js` and nothing to AT-K3b | **Exact** (`TSPEC:2929`; the `consolidationPass.test.js` row at `:2923` carries the case as **(no FSPEC AT)**) |
| PLAN T20 obligation (i) still requires *"`renderConsumedPair`'s output contains **both** basenames"* and describes one fixture | **Exact** (`PLAN:365`). This is the pre-erratum reading REQ §4b overturned, so erratum 9 is a real defect and not a style note |

Bookkeeping also held: the distinct `PROP-*` id set at HEAD is **symmetric-difference-empty**
against the `01841250` blob. No property added, removed, renumbered or re-homed — exactly
what the changelog claims.

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **`PROP-TRC-01`'s version-pin conjunct transcribes literals that are stale at HEAD, and this revision is the one that made the staleness load-bearing.** The property pins *"FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`"* (`:1605-1620`). At HEAD FSPEC's cell reads **11.7** (`FSPEC:12`) and TSPEC's reads **2.7** (`TSPEC:12`), so a fixture written from that sentence reds against a conforming repo on both legs. I accept the pin's *design* — it is a deliberate canary meant to fail as "the register moved" rather than "the code is wrong", and §12.4's new note (*"one id post-dates that measurement"*) shows the author reasoning about exactly this drift. But the note and the property now disagree in writing: §12.4 says the v11.5 measurement is knowingly historical, while §10.4 still tells the implementer to assert `11.5`. Cheapest fix is one sentence in `PROP-TRC-01` saying the pinned values are the *recorded measurement's* versions and are re-pinned whenever §12.4 re-measures — or a re-pin to 11.7 / 2.7 with the count re-measured. Not gating: no obligation goes untested either way, and the erratum-round canary still fires | §10.4 `PROP-TRC-01` (`:1605-1620`); §12.4 (`:1838-1843`); `FSPEC:12`, `TSPEC:12` |
| F-02 | Medium | Local | **The AT-K3b claim puts `PROP-TRC-01`'s set-equality red until erratum 8 lands, and unlike errata 6 and 7 this consequence is not written down.** `PROP-TRC-01` asserts the FSPEC register and TSPEC §12.3 are set-equal **in both directions** (`:1605`). §12.4 now assigns `AT-K3b → PROP-COR-09` while TSPEC §12.3 assigns AT-K3b to no file at all (`TSPEC:2923`, `:2929`) — so at HEAD the register carries an id §12.3 does not, and the equality fails in the register→file direction. The document has a settled idiom for exactly this: `PROP-PASS-11`'s placement note calls itself *"this document's judgment pending that erratum"* (`:1442`) and §13.3 item 7 routes the gap. The AT-K3b claim deserves the same one-line hedge, particularly because §12.3's closing rule is *"no property can be left in a permanently-red block"* (`:1836`) and §11's file table has `PROP-TRC-01` **green on write at T05** (`:1773`) — an implementer reaching T05 before erratum 8 lands cannot satisfy both. Suggested: in the §12.4 AT-K cell, add that `PROP-TRC-01`'s equality is short this one id until TSPEC §12.3 carries the assignment, so a red T05 is diagnosed as the routed erratum rather than as a parser bug | §12.4 AT-K row (`:1853`); §10.4 (`:1605`); §12.3 (`:1836`); `:1773`; cf. `:1442`, `TSPEC:2923`, `:2929` |

## 4. Oracle-quality checks on the added text

Ran the three standing checks over the delta only:

- **No implementation echoes.** The new text transcribes `FSPEC:2210`'s Given and Then and
  `TSPEC:2929`'s file assignment as literals; nothing derives an expected value from code
  under test. `PROP-TRC-01`'s pre-existing *"the count is read, never hard-coded"* rule is
  untouched by this delta.
- **No absence-only oracles.** The one place the delta could have introduced one is
  `PROP-PASS-11`'s narrowed release conjunct — *"the two causes it names above, not the
  status's whole cause set"*. That is a scoping sentence over an assertion that stays
  positive (marker released, table present, status verbatim `no-op`), and the third cause's
  positive observables are asserted in `PROP-COR-09`, not dropped. The "needs no third
  fixture" argument at `:443-448` likewise ends in a positive statement of which fixture
  *does* pin the obligation.
- **Completeness is set-equality.** The §12.4 AT-K row extends an enumeration and states
  the per-id single-file rule still holds while the *family* now spans two files — the
  honest reading, and the one that keeps `PROP-TRC-01`'s two-way equality meaningful rather
  than quietly relaxing it to containment. That the equality is currently short one id is
  F-02, not a weakening of the oracle.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the intended contract "assert the versions recorded in §12.4" (re-pinned each re-measurement) or "assert the current HEAD versions" (re-pinned each erratum round)? Both are defensible and neither needs a new property — I only want the chosen one written where the implementer reads it. |

## 6. Positive Observations

- **The register claim was made in the direction that costs the author work.** Claiming
  `AT-K3b` rather than staying on the `(no FSPEC AT)` roll forces two errata against TSPEC
  and PLAN and exposes the layer to a set-equality it does not yet satisfy. The easy move
  was to leave the id carrier-less and say nothing; the revision took the accurate one and
  routed the consequences.
- **The file placement was argued from subject, not from convenience.** AT-K3b sits with
  `consolidationPass.test.js` because its subject is a whole pass's corpus handling, with
  `TSPEC:2929`'s conflicting family assignment named rather than elided, and §12.3's
  one-file rule shown to be undisturbed. That is the same reasoning shape erratum 6 used —
  consistent, not ad hoc.
- **Both errata are verifiable and neither is padded.** I re-measured `TSPEC:2850` and
  `PLAN:365` independently; both defects are real, both are quoted accurately, and both
  carry the correction rather than only the complaint. Erratum 9 correctly separates the
  wording defect (which reds a conforming implementation) from the missing second fixture
  (which owes no new task, since T31 already carries the case).
- **F-02 from v6 was answered, not absorbed.** The revision could have written "covered by
  PROP-PASS-11" and moved on. Instead it named the exit path (`finishPass` via cause (i)'s
  consumed-set-empty route) that makes the coverage true, which is the difference between a
  claim a reader can check and one they must trust.
- **The count discipline survived a register change.** Adding an id to §12.4 is the classic
  place to silently retype "99" as "100". The revision instead named AT-K3b as the single
  known delta against the recorded measurement and left the count read-not-transcribed —
  which is why F-01 and F-02 are one-sentence edits rather than a re-measurement round.

## 7. Recommendation

**Approved with minor changes**

All three v6 findings are resolved, and resolved at the layer that owned them. Every new
claim the delta makes about FSPEC, TSPEC and PLAN is exact against HEAD — I re-measured
nine of them. No property moved, none was added or removed, and the id set is unchanged.
The two errata routed are genuine upstream defects with correct corrections, and the
proposal-file conjunct AT-K3b carries is properly delegated to `PROP-RTE-06(b)` rather than
dropped or duplicated.

The two Medium findings are both one-sentence edits in the same neighbourhood
(`PROP-TRC-01` and §12.4's AT-K cell) and neither leaves an obligation untested: F-01 is a
stale transcription in a canary conjunct, F-02 is an unwritten consequence of a correctly
routed erratum. Nothing this revision touched broke, and no High is open.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
