# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 10
**Scope:** Local

## Method

Delta re-review, frozen round. My last review of this document was **v8** against
`aa8cbb2f` (no v9 in this role's window). `git diff aa8cbb2f..HEAD` on the PLAN returns
**76 insertions, 24 deletions** in six hunks: the v1.8 header block, three re-pinned
locator lines inside v1.6's header entry, the upstream-versions table, §1's TSPEC pin,
T05, T20, T21, §8.3's DoD row, §9.1's errata rows 4 and 5 plus a new erratum-8 paragraph,
and §10's risk row. **No `Deps`, `Batch` or `Status` cell moved; §5's ownership manifest
is untouched.**

Gate re-derived, not copied, by importing `pdlc/workflows/orchestrate-dev.js` and running
it over HEAD's revised text: `parsePlanTasks` → **34** tasks, `errors: []`;
`parsePlanOwnership` → **34** rows; `validatePlanContract` → `{"ok":true}`;
`computeTopologicalBatches` → **15** ready-sets; `computeWaves` → **15** waves; re-deriving
`batch == max(declared dep batch) + 1` per row against the declared `Batch` cell → **0**
mismatches. Identical to v1.4–v1.7's, as a prose-only diff must leave them.

Upstream re-grounded at HEAD rather than read from the header's summary: REQ **2.5**,
FSPEC **11.7**, TSPEC **2.8** (header cells confirmed); `AT-K3b` at `FSPEC:2210`;
enumerating `AT-…` tokens over `FSPEC:2116-2267` de-duplicated returns **100**;
`TSPEC:2908` states 100; `TSPEC:2938` assigns `AT-K3b` to `consolidationPass.test.js`.

## Prior findings

| v8 finding | Status at HEAD |
|---|---|
| F-01 (Medium) — §6.1's rejected-alternative names an edge set that returns 16 waves and a rule-2 collision, not the 15/15/0 the paragraph claims; `T07 deps T03` missing from the delta clause | **Open, untouched by the delta.** Re-checked: the §6.1 cell is byte-identical in the diff. Carried below as F-03, same severity. |
| F-02 (Medium) — the T33 row (and §9.1 erratum row 3) describe `CLAUDE.md` as a three-bullet enumeration closing "**Those three** are the tracked, shipped outputs" | **Open, untouched.** Re-measured: `CLAUDE.md:58-62` is a **five**-bullet list and `:64` closes count-free ("These are the tracked, shipped outputs"); `git ls-files pdlc/workflows/dist/` returns **five** paths. Carried below as F-04. |
| F-03 (Medium) — v1.6's header says "four cells reverted" and names T28, but the base commit carried three non-`⬚` cells | **Open, untouched.** Carried below as F-05. |
| F-04 (Low) — §2's status key advertises four glyphs a rule two lines later forbids | **Open, untouched.** Carried below as F-06. |
| Q-01 (where the "row reads as HEAD-state + oracle" convention should live) | Not answered in this revision; not a defect, and I do not re-raise it in a frozen round. |

None of the four was High, none blocked, and none was attempted. Nothing about them
regressed. The two findings the delta itself produced are F-01 and F-02 below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The five re-pinned `orchestrate-dev.js` locators were invalidated by code landing in the same commit, so none of them resolves at HEAD.** v1.8's new clause (iii) states "Re-measured at HEAD and corrected in both §2 and v1.6's entry: `parsePlanTasks` `:3963`, the 'LOOSE … cosmetic' comment `:3966`, `PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS` `:4047-4048`, `WAVE_STATE_PATH` `:9104`, `parseWaveLedger` `:9157`". Those five were exactly right at `aa8cbb2f` — the commit I last reviewed, and I verified them there — but `87d9c6ad`, **the same commit that landed PLAN v1.8**, also changed `orchestrate-dev.js`. At HEAD the symbols are at `:3996`, `:3999`, `:4080-4081`, `:9585`, `:9638` (uniform +33 in the parser region, +481 in the wave region). Not High, on two grounds I checked rather than assumed: the **rule** the citations ground is still true at HEAD — `parsePlanTasks` (`:3996`) reads only the id, `Deps` and batch cells, the description/batch columns are marked "LOOSE … cosmetic" (`:3999`), and resume is owned by `WAVE_STATE_PATH` (`:9585`) / `parseWaveLedger` (`:9638`) — and no task, gate, oracle or dispatcher reads a line number. What is false is the evidence a reader is invited to check, in a paragraph whose own last sentence is "a rule whose evidence does not resolve is a rule a reader cannot check". Fix is five numbers in two places (§2 and v1.6's entry). The durable observation is the one T04 already made for tests and this document has not yet made for itself: **a locator that co-lands with the code it names is stale on arrival — locate by symbol name, not by line index.** | v1.6 header clause (iii); §2's grounding paragraph |
| F-02 | Medium | Local | **§9.1's erratum row 5 was edited in this delta and kept two TSPEC locators that no longer resolve.** The cell still reads "`TSPEC:2395` read 'The FSPEC's AT register carries **96** ids…' (at TSPEC v1.8; since v2.0 `TSPEC:2485` reads 99 at v11.3)". At HEAD `TSPEC:2395` is a sentence about `--exclude-standard` and `TSPEC:2485` is a sentence about absence-shaped assertions; the live count sits at `TSPEC:2908`. The header block declares "§9.1's erratum rows" to be **live pins** rather than history, which is what makes this a defect and not a preserved measurement — the sibling numbers in the same row *were* re-pinned (99 → 100, FSPEC v11.5 → v11.7) while these two were not. Same family as F-01: the row learned half its lesson. Fix: drop the two line locators (the statements are historical and need no anchor) or move the sentence under the header's "history, not live claims" clause explicitly. | §9.1, errata row 5 |
| F-03 | Medium | Local | *(carried from v8 F-01, unaddressed, unchanged)* §6.1's rejected-alternative paragraph names a dependency delta (`T07 deps T12`, `T10 deps T08`) that leaves **T07 rootless**, which returns **16** waves and lands T03 and T08 in the same level over `consolidationBuild.test.js` — a same-batch same-file collision, i.e. the paragraph's own numbers (15/15/0) do not follow from the edge set it states. One missing clause: `T07 deps T03`. Not High — the *shipped* graph is unaffected and re-measured clean this round (34/34/`{ok:true}`/15/15/0). | §6.1, rejected-alternative table |
| F-04 | Medium | Local | *(carried from v8 F-02, unaddressed, unchanged)* The T33 row and §9.1's erratum row 3 both state present-tense that `CLAUDE.md` enumerates three artifacts (`:58-60`) and closes "**Those three** are the tracked, shipped outputs" (`:62`). At HEAD the enumeration is five bullets and the closing sentence at `:64` is already count-free; `git ls-files pdlc/workflows/dist/` returns five paths and the manifest carries four `rows[].id`. The T33 **oracle** is set-equality read at run time and is unaffected — this is a stale prose recital beside a correct oracle, which is why it is not High. | §4.2 T33 row; §9.1 errata row 3 |
| F-05 | Medium | Local | *(carried from v7 F-01 / v8 F-03, unaddressed, unchanged)* v1.6's header entry says "four cells reverted" and names T28; the base commit carried three non-`⬚` cells (T28 already read `⬚`). Two-word fix in a now-frozen historical paragraph. | Version header, v1.6 block |
| F-06 | Low | Local | *(carried from v7 F-02 / v8 F-04, unaddressed, unchanged)* §2's status key (`:214`) still advertises `🔴 / 🟢 / 🔵 / ✅` as legal while the rule two lines down (`:216`) forbids the column carrying anything but `⬚`. | §2, `:214` vs `:216` |

DEFERRED: adopt "locate by symbol name, never by line index" for this document's own
citations the way T04 already requires it of the tests, so a co-landing implementation
commit cannot stale the PLAN's evidence again (F-01/F-02's shared root cause).

## Questions

| ID | Question |
|----|---------|
| Q-01 | None this round. My open questions from v8 are either answered in the document or out of scope for a frozen round; I am not opening new decisions here. |

## Positive Observations

- **T20's absorption is the correct oracle shape, and I checked it against upstream rather
  than against the header's summary of upstream.** The pre-erratum reading ("the pair
  contains **both** basenames") really was overturned: REQ §4b at HEAD says the unreadable
  entry "is omitted from the `<!-- pdlc:consumed {passId} -->` pair, so it stays
  un-consolidated and the next pass retries it" (`REQ:615-616`). The row's replacement is
  **set equality with `{readable}`** — present, absent, *and no third name* — which is
  exactly the assertion a containment-plus-absence pair cannot make, and TSPEC §12.2 gives
  the same reason independently (NFR-5 requires naming *exactly* the consumed set).
- **The two fixtures are genuinely each other's control, stated in both directions.** The
  mixed corpus stops "pair empty" from greening on a pass that enumerated nothing; the
  all-unreadable corpus stops the mixed fixture's status assertion from greening on an
  implementation that terminates every unreadable-touching pass `failed`. That is the
  pairing discipline this document has applied to AT-M3/AT-M11 and to the hook-parity rows,
  now applied to a case that arrived mid-freeze.
- **AT-K3b's conjuncts are transcribed, not paraphrased.** `FSPEC:2210` obliges terminal
  `no-op`, an **empty** consumed pair, no `CONSOLIDATION-PROPOSAL-*.md` for that `passId`,
  and **no** reason code minted — with the discriminator "consumed list empty *while* the
  un-consolidated set is non-empty" separating AC-1.4's third cause from its first. T20
  carries all four plus the discriminator, and pins the status against §6.4's frozen
  catalogue rather than a retyped literal. Nothing added, nothing softened.
- **The absorption cost no graph.** No new task, no new file, no batch or ownership change —
  and the gate agrees: 34 / 34 / `{"ok":true}` / 15 / 15 / 0, every number re-derived here
  through the shipped parser, none copied. An erratum that lands entirely inside an
  already-planned block is the cheapest possible shape for a round-7 upstream move.
- **T05's re-pin is a pin, not a hard-coded cardinality, and it says so.** The row now reads
  FSPEC `11.7` / TSPEC `2.8` with **100** as the expected value while stating "the count
  itself is still read from the register at run time" — I re-enumerated `AT-…` over
  `FSPEC:2116-2267` de-duplicated and got 100, and `TSPEC:2908` re-derives the same. Left as
  written at `11.5` / `2.0` / 99, T05's version conjunct would have red-ed in batch 2 on a
  conforming tree, reading "the code is wrong" when the truth was "the register moved" —
  the precise failure the pin exists to make legible. Catching that on the row that exists
  to catch it is the pin working.

## Recommendation

**Approved with minor changes**

No High findings. Both convergence questions answer cleanly.

**Were my blocking findings resolved?** I had none — v8 carried no High. My four open
non-gating items were not attempted and are carried forward unchanged at their original
severities (F-03…F-06). In a frozen round that is not a defect; none of them reaches a
test, a gate, a dispatcher or a task an implementer will read.

**Did the revision break anything?** Not in the graph and not in any oracle. 34 tasks,
34 ownership rows, `{"ok":true}`, 15 ready-sets, 15 waves, 0 batch-column mismatches —
every number re-derived here through the shipped parser, none copied, identical to v1.4's.
The batch DAG, the ownership manifest, the un-skip chain and the TDD ordering are exactly
as round 4 left them.

What the delta did do is strengthen one row and stale two locator sets. **T20's obligation
(i) is stronger than it was**: containment-plus-an-absence became set equality with
`{readable}`, and an unregistered obligation gained a register id with a positive terminal
status, an empty-pair assertion, a `|un-consolidated|` count and two negative existence
conjuncts — all transcribed from `FSPEC:2210` and verified against it, not paraphrased.
T05's pin is now true where it was four versions stale and would have red-ed a conforming
tree in batch 2. Against that, the five `orchestrate-dev.js` locators re-measured in
clause (iii) were invalidated by code landing in the same commit (F-01), and §9.1's
erratum row 5 kept two TSPEC locators while re-pinning its siblings (F-02). Both are
evidence that no longer resolves under claims that are themselves still true — worth a
small edit, gating nothing, and both pointing at the same durable fix the DEFERRED line
records.

Recorded, not gating. The document is implementable as it stands.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 5, "low": 1}
