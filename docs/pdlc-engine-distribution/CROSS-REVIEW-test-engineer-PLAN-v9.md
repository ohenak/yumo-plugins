# Cross-Review: test-engineer — PLAN (delta re-review, round 9)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.11)
**Date:** 2026-08-14
**Iteration:** 9
**Scope:** Delta re-review of v0.9 → v0.11 (`436c9aa7`, `29494b62`, `1c769612`), against my v8 at `06f76667`. Decision freeze in force: only a defect the delta introduced, or a load-bearing claim false at HEAD, blocks. Not a whole-document re-review.

## 1. What changed

Blast radius measured from the diff, not from the changelog: `git diff 06f76667..HEAD --
{plan}` is **38 insertions, 5 deletions in one file**, across three commits.

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.9 → 0.11 | header |
| `:27`, `:28` | new v0.10 and v0.11 rows | changelog |
| `:127-149` (§2 preamble) | **new: the skipped-block convention** — 23 lines | new mechanism |
| `:174` (T15) | **new leg (h)**, AT-1.1's contains-vs-equals operators (PM round-7 F-01) | Description cell |
| `:246` (§2.1) | AT-3.8b label "workflow modules … §5.2's class" → "workflow members … §5.2's Workflow-members class" (my v8 F-02) | index label |
| `:364` (§4 kind 1) | **new paragraph**: a red/green pair spans two waves, blocks committed skipped | new mechanism |
| `:396` (§4) | T59 → T50 red-interval passage reconciled with the convention | prose |
| `:464` (§6 rule 3) | **new paragraph**: the convention does not change rule 3's substance | new mechanism |
| `:506-508` (DoD) | **new heading "Wave mechanics." and item 17** | new gate |

Only one task-table cell changed (T15's Description) and it is the cell the changelog names.
`Deps`, `Batch`, `Files`, task ids, §3's ownership manifest and §2.1's `Carried by` cells are
byte-unchanged — I re-derived nothing, because nothing that batch arithmetic or set-equality
reads has moved. §2.1's AT-3.8b row is the one §2.1 edit and it touches the label column only.

The material delta is **not the two cross-review fixes** — those are one leg and one word — but
**v0.10's skipped-block convention**, which is an operator decision arising from a Phase I wave-2
gate halt, not a review finding. It adds a new gate (DoD item 17) and a new obligation on every
`[red]`/`[green]` pair. That is where I spent this round.

## 2. Status of my v8 findings

| v8 finding | Severity | State at HEAD | Evidence |
|---|---|---|---|
| F-01 — T59's discriminator legs cover the classifier's three outcomes by containment, not partition (the `exit 0 ⇒ present ⇒ no skip recorded` arm is unasserted) | Medium | **Open, unaddressed** | `:188` (T59) is byte-unchanged in this delta. Was recorded non-gating under the round-8 freeze and stays deferred. |
| F-02 — §2.1's AT-3.8b label still carried the retired "modules" wording | Low | **Resolved** | `:246` now reads "packed workflow **members** equal §5.2's Workflow-members class", matching `FSPEC:537`'s class title and `FSPEC:780`'s AT-3.8b. The `AT-3.8b` id and `Carried by` cell are byte-unchanged, so the set-equality I approved in round 6 does not move. |
| F-03 — T50's duplicated "On the GitHub-hosted `ubuntu-latest` runner" sentence | Low | **Open, unaddressed** | `:215` (T50, was `:190`) still carries both sentences. Not touched by this delta; stays deferred. |

The one fix in this delta that answers me is F-02, and v0.11's changelog goes further than the
fix: it also **corrects v0.8's claim that T16's cell was "the only place this PLAN names the
class"**, which was the inaccuracy that hid the second site from me for two rounds. Withdrawing an
"only place" claim is the correction that actually prevents the recurrence; the one-word label
edit alone would not have.

## 3. The load-bearing claims, checked against HEAD

The convention asserts things about a guard that must already exist, or the whole passage is
fiction. It does exist, and every semantic claim the PLAN makes about it is true.

**(a) `checkWaveUnskips` is real and shipped.** `pdlc/workflows/orchestrate-dev.js:9892`, exported,
plus the call site at `:12383` and its halt formatter at `:9964`. Not a planned artefact of this
feature — it is engine machinery the PLAN is describing, correctly, in the present tense.

**(b) "reads only a `.skip` token that opens its own statement, never one mid-expression" — true.**
`scanSkipTokens` (`:9825`) requires both that nothing but whitespace precedes the token on its line
(`:9835-9836`) and that the previous code character is one of `;{})` (`:9838-9840`). The docstring
at `:9819` names the exact form this excludes — `(canRun ? test : test.skip)(…)`, the
environment-gated spelling the suite already uses legitimately. The PLAN's "statement position" is
the implementation's own term, not an approximation of it.

**(c) "a block owned by a later wave's task is legitimate, and reddens only once that owner
completes with the block still skipped" — true.** `:9955` skips any token whose owners are not all
in `complete`, and `complete` is built from waves `wi <= waveIndex` (`:9914`). The halt message
says the same thing back to the implementer (`:9975`).

**(d) "a title names exactly one task id … an incidental mention of a second id silently widens
ownership and is forbidden" — true, and the failure direction is stated correctly.** `owners` is
*every* id the title names (`:9950`), and a violation needs `owners.every(complete)` (`:9955`), so
a stray mention of a later task's id keeps the block legitimate past its real owner's completion.
That is a false *negative*, i.e. silent, which is exactly the word the PLAN uses. `titleNamesTask`
(`:9874`) is word-bounded, so `T7` does not match `T70` — the convention's `"{id}: "` prefix is
safe against that class of collision without relying on the prefix position.

**(e) The convention is already in force on this branch, and matches the prose.** `342a8cf2` and
`2dd14300` landed wave-2's red tests skipped and taught `se-implement` the same rule:
`pdlc/skills/se-implement/SKILL.md:74` tells a `[green]` implementer to remove exactly the `.skip`
wrappers titled with its own id first, and `:232`'s checklist admits only statement-position skips
titled for an incomplete task. Shipped state: 33 `.skip` blocks across five engine test files, every
one titled with a task id (`engine-config.test.js:190` `"T28: …"`, `provenance.test.js:37` `"T27: …"`,
`store.test.js:162` `"T26: …"`, `resolve-version.test.js:108` `describe.skip("T37: …")`). PLAN, skill
and tree agree.

**(f) The carve-out's two exemplars are genuinely un-skipped and genuinely hermetic.**
`provenance.test.js:124` is the recorder positive control and it runs, while the PROP-PROV-1
negative it protects is skipped at `:114` — which is the right pairing, since a skipped positive
control would let the negative pass vacuously against a broken recorder. Its `impureVariant` is
defined inline (`:125-129`), so it needs nothing T27 builds. The second exemplar is right in
substance but its line anchor is wrong — F-02 below.

**(g) DoD item 17's gate placement claim is accurate, and stronger than the PLAN says.** The guard
runs after the wave's test gate and **before** any commit (`:12379-12393`, comment at `:12380`), so
a vacuous green halts the wave with its work uncommitted. It also runs **outside** the `scriptGate`
branch (`:12366-12377`), i.e. it fires even on a repo with no `implementation.testCommand`. See
F-03: that is what rescues the one imprecise word in the changelog.

**(h) T15's new leg (h) is grounded in a shipped precedent, verified.**
`pdlc/engine/__tests__/handshake.test.js:110` is the named test; `:113` is `assert.equal(out.pluginVersion,
"not found")` and `:115` is `assert.match(out.reason, /not found/)`. Equality on the triple member,
containment on the reason text — exactly the split T15 now records. The upstream quote is real too:
`FSPEC:679` reads "The surface pinned here is the **refusal reason text**, which *contains* that
literal". Leg (d)'s `notEqual` between the two refusal texts is untouched, so AT-1.2's discriminator
is not weakened by the addition.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The convention degrades the preservation floors' numeric half, and DoD item 2's "i.e." is now false.** The floors are stated as the runner's own count — "the observation is the runner's own count, `node --test __tests__/<file>`, compared against the HEAD numbers in §5.1: `engine-config.test.js` reports **≥ 9** tests …; `run.test.js` reports **≥ 21**, i.e. **all 21 HEAD tests present**". `node --test` counts skipped blocks in `# tests`. Measured at HEAD just now: `node --test __tests__/engine-config.test.js` → `# tests 16 / # pass 9 / # skipped 7`. The seven are the T28 blocks this convention added, so the file already reports 16 against a floor of 9, and it would keep reporting ≥ 9 with **every** HEAD test deleted. The same applies to `run.test.js` once T33/T41 commit their red blocks there, and `run.test.js` is the file whose floor the document explicitly equates with presence ("**≥ 21**, i.e. all 21 HEAD tests present"). What still catches a deletion is the *enumerated* conjunct in the same item — "all nine HEAD ones present", and for `run.test.js` the three restated tests plus the named eighteen — which is why this is Medium and not High: the operative oracle survives, the counter that was supposed to back it does not. Item 17 names the reverse direction of this gap (floors do not cover the blocks the convention adds) but not this one (the blocks the convention adds inflate the counter that guards the old ones). *Fix, one clause:* state the floors over `# pass`, not `# tests`, in DoD item 2 and §5.1 — `# pass` is in the same runner summary, needs no new machinery, and restores "survives the deletion it guards" for both directions. | `PLAN:485` (DoD item 2), `:439` (§5.1), `:508` (item 17) |
| F-02 | Medium | Local | **§2's carve-out cites a line inside a skipped block as an example of a block "left running".** `:143-145` names "`resolve-version.test.js:397`'s seed-replay determinism check" among the blocks that "stay un-skipped and running". Line 397 is `assert.equal(asserted, DRAWS)`, the generator-hygiene assertion **inside** `test.skip(\`T37: PROP-VER-16: resolveVersion is total …\`)` opened at `resolve-version.test.js:361` — a block that is skipped and does not run. The check the prose names is real and does run, at `resolve-version.test.js:400`, `test("PROP-VER-16 is reproducible: replaying the same seed draws the same generated sequence", …)`. The prose identifies it unambiguously, so no oracle changes and no implementer transcribes a line number into a test; but a reader checking the carve-out at the cited anchor lands on a `.skip` and reads the carve-out as self-contradictory — which is worse than an ordinary off-by-three, because here the anchor's *state* is the claim. The v0.10 changelog repeats the same anchor at `:27`. *Fix:* `:397` → `:400` in both places. | `PLAN:144`, `:27`; `pdlc/engine/__tests__/resolve-version.test.js:361`, `:397`, `:400` |
| F-03 | Low | Local | **"the engine gates every wave exit on `implementation.testCommand` unconditionally" overstates HEAD.** The gate is conditional: `orchestrate-dev.js:12149-12150` sets `scriptGate` only when `implConfig.testCommand` **and** a `_runCommand` transport are both present, and `:12375-12377` falls back to `evaluateBatchGate` — the agents' self-reported results — when either is absent, emitting a notice (`:12155-12159`). For *this* repo the premise holds: `.claude/pdlc.config.json` supplies `implementation.testCommand`, so Phase I here does run under a real gate. And the convention does not actually depend on the disputed word, because `checkWaveUnskips` runs **outside** that branch (`:12383`) — the un-skip guard fires even where the test gate has degraded. So the claim is true where it is applied and the error direction is conservative. *Fix, if wanted:* "gates every wave exit on `implementation.testCommand` (configured here, and degrading to self-report where it is not)". | `PLAN:130`, `:27`; `pdlc/workflows/orchestrate-dev.js:12149`, `:12375`, `:12383` |
| F-04 | Low | Process | **Item 17's "§5.1" resolves to two different sections in one document.** Everywhere else in this PLAN `§5.1` means **FSPEC** §5.1, the frozen `pr-tests.yml` job-name set (`:176`, `:451`, `:502`, `:514`). In item 17 "§5.1's test-count floors" means **this** document's §5 point 1, which is where the extended-file counts live (`:439`). §5 has no numbered subsections, so the reference is unresolvable by structure and a DoD reader chasing it lands on CI job names. Cheap to disambiguate ("§5 point 1"), and worth doing because the two sections are both change-control anchors. | `PLAN:508`, `:439`, `:451` |

Severity note under the freeze: **F-01 and F-02 are recorded, not gating.** F-01 is a real
degradation the delta introduced, but it degrades the *backup* half of an oracle whose operative
half — the enumerated HEAD-test list — is stated in the same sentence and is untouched; no criterion
loses its only observer. F-02 is a citation anchor, and the claim it anchors is true of the block it
names in prose. Neither is a High, and I have not opened one.

## 5. Questions

None. Nothing in the delta needs clarification before Phase I resumes.

## 6. Positive Observations

- **DoD item 17 names its own insufficiency instead of claiming the guard proves more than it
  does.** "This item claims only what the guard proves, which is **necessary but not sufficient** …
  a green task that **deleted** its predecessor's blocks instead of un-skipping them also reports
  zero violations." That is the absence-only-oracle trap — "zero violations" is a negative — caught
  and disclosed by the author, with the residual closed by a stated reading obligation on the
  `[green]` diff rather than by a counter that does not exist. It is the one item in this DoD that
  tells the verifier what a green does *not* mean, and it is the right one to do it in.
- **The convention relocates the red observation rather than deleting it.** "Each `[green]` task's
  **first** obligation is to remove `.skip` from exactly the blocks titled with its own id, observe
  them red, and implement until green — the red observation is relocated into the green task, never
  weakened." My round-4 objection was that a skipped interval is a forgotten interval; this answers
  the *unguarded*-skip half with a mechanical guard and concedes the `test.todo` half rather than
  overturning it. The passage at `:396` says so explicitly ("The round-4 objection is answered, not
  overturned"), which is more honest than quietly re-deciding it.
- **The `describe.skip` restriction is the non-obvious half, and it is stated.** "`describe.skip` is
  used only where every block inside it is satisfied by that same `[green]` task; otherwise the skip
  goes at the individual block level, because a `describe.skip` titled for one task but enclosing
  another task's assertions un-skips them too early and reddens that wave." A block-granularity rule
  is what keeps the guard's title-as-ownership record accurate; a coarser rule would have made the
  guard's `titleNamesTask` lookup lie about which assertions a title owns.
- **The carve-out exists at all, and it is the vacuity-aware one.** Leaving positive controls
  running while their negatives are skipped is exactly right: `provenance.test.js:114`'s
  zero-fs/env/clock property is the assertion under construction, and `:124`'s control is what
  proves the recorder is not a no-op. Skipping the control with it would have made the eventual
  green vacuous.
- **T15's leg (h) removes a false-red before an implementer hits it.** Recording that AT-1.1's
  refusal *reason* is a containment check while the triple *member* is an equality is the difference
  between an implementer trusting a red and "fixing" correct code to satisfy the wrong operator —
  and it cites a shipped test that already splits them (`handshake.test.js:113`/`:115`) rather than
  asserting the split from the spec alone.
- **The changelog discloses what a reviewer would otherwise have to diff for.** v0.11 states the
  edited cell by name, and v0.10 states that batch arithmetic, §2.1 and §3 are byte-unchanged — both
  true against the diff. v0.10 also corrects §4's earlier claim that the wave gate would *reject* a
  module written inside an earlier task, against what Phase I wave 2 actually did.

## 7. Deferred

DEFERRED: State the preservation floors over `# pass` rather than `# tests` in DoD item 2 and §5 point 1, so the convention's skipped blocks cannot inflate the counter that guards the HEAD tests (F-01).
DEFERRED: Correct `resolve-version.test.js:397` to `:400` in §2's carve-out and in the v0.10 changelog row (F-02).
DEFERRED: Qualify "unconditionally" in the v0.10 changelog's description of the wave test gate, which degrades to self-report where `implementation.testCommand` is absent (F-03).
DEFERRED: Disambiguate item 17's "§5.1" from FSPEC §5.1 used everywhere else in the document (F-04).
DEFERRED: T59 should pin the `exit 0 ⇒ present ⇒ no skip recorded` arm so the classifier's three outcomes are a partition, not two samples (carried from v7 F-01 / v8 F-01, still open).
DEFERRED: T50's duplicated "On the GitHub-hosted `ubuntu-latest` runner" sentence should collapse to one (carried from v8 F-03, still open).
DEFERRED: No counter covers the blocks the convention adds, so a `[green]` task that deletes rather than un-skips its predecessor's blocks is caught only by diff reading; a per-file expected-title set over the `[red]` commit would mechanise it.
DEFERRED: The guard's ownership fallback to `ownersByFile` means an untitled skipped block in a completed task's own file is a violation, while an untitled block in a file owned by nobody complete is silently ignored — worth a sentence in §2 so an implementer does not learn it from a halt.

## 8. Recommendation

**Approved with minor changes.**

Every load-bearing claim the delta makes about machinery outside this document is true at HEAD. The
guard exists (`orchestrate-dev.js:9892`), its statement-position rule, its title-as-ownership record
and its later-wave-is-legitimate rule are the implementation's own semantics rather than a
paraphrase of them, it runs after the gate and before the commits, and it runs even where the test
gate has degraded. The convention is already in force on the branch and the `se-implement` skill
carries the matching obligation, so PLAN, skill and tree agree. T15's new leg quotes an upstream
sentence that exists (`FSPEC:679`) and a precedent that behaves as described
(`handshake.test.js:113`/`:115`). §2.1's rename is closed, and the inaccurate "only place" claim
that hid the second site is withdrawn rather than left standing.

Structure is untouched: no id, batch, dependency edge or ownership row moved, §2.1's `Carried by`
cells are byte-identical, and the set-equality and batch arithmetic I approved in round 6 stand
without re-derivation.

Four findings, none High. F-01 is the one with real testing-lens weight — the convention's skipped
blocks are counted by `# tests`, so the numeric half of the preservation floors no longer
discriminates a deletion — but the enumerated-presence conjunct stated in the same DoD item does
still catch it, so no criterion is left unobserved and the fix is one word (`# pass`). F-02 is a
line anchor that happens to land inside a `.skip`, F-03 an overstated adverb whose claim holds for
this repo and whose safety net does not depend on it, F-04 a section reference. None warrants a
round of its own; all four, and four older observations, belong to the next document that touches
these passages.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
