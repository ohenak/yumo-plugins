# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.6)
**Date:** 2026-08-21
**Iteration:** 5
**Round type:** delta confirmation (erratum round, Phase F)
**Scope:** Local — the erratum delta `1b24056a..HEAD`, plus re-verification of the upstream this REQ leans on at HEAD (DEC-ERR-03). Testing lens only.

## Context

I approved this REQ at v1.5 (round v4, one Low finding, no High). A Phase F erratum round has since
landed eight routed items across four commits (`aea4d92e`, `e029fc59`, `2c2efb74`, `d1dfbd20`, plus
two wording trims `c447eeb5`, `7660f1ed`), bumping the document to v1.6. The delta is 26 insertions
and 13 deletions across five sites: the v1.6 amendment note, §1's replay-cost paragraph,
REQ-WVR-02's IG-label note, REQ-WVR-08's no-commit clause, and §10's BL-04 readiness sentence.

This round answers one question: does the delta resolve the routed items without breaking what I
previously approved? Per DEC-ERR-03 I also re-read the upstream this REQ now leans on — the shipped
mechanism at `origin/main`, `docs/_constraints/pdlc-wave-gate-baseline.md`, the consolidation-agent
PLAN that OF-1 measures, and the downstream FSPEC the delta newly cites — and checked that the
document is still a faithful compression of it. Two of the eight routed items are duplicates raised
by two reviewers (the V-wave scoping, raised by both te-review and pm-author; the BL-04 mis-record,
likewise), so the delta has six distinct obligations to discharge.

## Goals

What this round set out to establish, in order:

1. **Each routed item landed in the bytes** — not paraphrased, not deferred to FSPEC, not answered
   with a promise.
2. **Each landed claim is true against HEAD**, re-derived by command rather than read and believed.
   The erratum items are themselves measurement claims (a wave count, a task count, a commit
   distance, the presence of a file, the guard on a dispatch site), so confirming them is a
   mechanical exercise and I treated it as one.
3. **Nothing I approved at v1.5 broke.** The delta touches §1, REQ-WVR-02, REQ-WVR-08 and §10 —
   sections that other sections cite. A correction that fixes one site and leaves a sibling site
   asserting the old thing is a worse state than before, because the document now contradicts
   itself where it previously merely erred.
4. **The document is still a faithful compression of its upstream** (DEC-ERR-03). The delta newly
   cites FSPEC §2, EC-20 and FSPEC §3.2, so those had to be read at their current version, not
   assumed from the erratum brief's summary of them.

## Scope (Non-Goals)

Out of scope for this round, deliberately:

- **Re-reviewing the whole REQ.** Sections untouched by this delta and approved at v1.5 are not
  re-litigated. The one exception DEC-ERR-03 mandates is upstream drift: a claim I approved that
  upstream no longer supports is in scope wherever it sits, and I checked the load-bearing ones
  (§1's untracked-record observation, OF-1's re-derivation recipe, §5's baseline-file citation).
- **The FSPEC.** It is reviewed on its own docType track (v1, v2 exist). I read FSPEC §2, §3.2,
  BR-03, BR-11 and EC-20 here only as the upstream/downstream counterpart the REQ's new sentences
  point at, and only to ask whether the REQ's characterisation of them is accurate.
- **Product framing, architecture choice, and whether the feature should be built.** Testing lens
  only, per role scope.
- **Test design.** At REQ altitude a testability finding asks for outcomes precise enough for a
  black-box acceptance test, never for seams, fixtures, oracle placement or test levels. Those
  belong to TSPEC and PROPERTIES review and are not missing here.

## Constraints

The verification constraints that shaped this round, and how each was satisfied:

- **The authoring tree is not HEAD.** This branch is 1,637 commits behind the default branch
  (`git rev-list --count origin/main ^HEAD` → `1637`, re-run this round), and the resume mechanism
  does not exist in it: `git show HEAD:pdlc/workflows/orchestrate-dev.js | grep -c WAVE_STATE_PATH`
  → `0`, against `10` in the same file at `origin/main`. Every code claim in this REQ therefore had
  to be checked against `origin/main`, which is exactly what the REQ's own header note instructs.
  I extracted `git show origin/main:pdlc/workflows/orchestrate-dev.js` to a scratch path and read
  the mechanism there.
- **Measurement claims are re-derived, not trusted.** OF-1 ships a re-derivation recipe; a recipe
  that is not run is decoration. I ran it (below). This is the same discipline the REQ asks of its
  own readers, and the reason the recipe belongs in the document.
- **DEC-DOC-01.** A raw `file:line` anchor in a spec document is a Low `Process` finding unless the
  position itself is the measured claim. `grep -n "\.js:[0-9]\|\.md:[0-9]"` over the whole REQ
  returns nothing — the delta introduced no new anchors, and the v3 fix has not regressed. The
  erratum brief cites `orchestrate-dev.js:15656` and `:15672`; the REQ correctly did **not** copy
  those anchors into itself, naming symbols and FSPEC ids instead.
- **REQ size budget.** 553 lines / 40,967 bytes, inside the 700-line / 60 KB budget the
  `check-req-size` hook enforces. The delta grew the file by roughly 1 KB.

## Acceptance — routed items, one by one

Six distinct obligations (eight routed items, two duplicated across reviewers). All six landed.

| # | Routed item | Status | Evidence |
|---|-------------|--------|----------|
| 1 | §10 records BL-04 as "discharged at FSPEC authoring" while it is objectively unmet (se-review, pm-author) | **Resolved** | §10 now reads "BL-04 is **open and unmet** — not discharged at FSPEC authoring", and states the reason: the tree is 1,637 commits behind and carries neither the mechanism nor the baseline file. All three sub-claims re-derived below. |
| 2 | §1's "15-wave plan" contradicts OF-1's 16 (se-review, pm-author) | **Resolved** | §1 now says "a 16-wave plan". OF-1 says "**16** waves (17 counting Phase PT's appended V-wave)". The figures agree, and the corrected one is the one the recipe produces. |
| 3 | §1's "each re-invocation paid seven no-op dispatches" contradicts OF-1's non-uniform cost (se-review) | **Resolved** | §1 now attributes the seven dispatches to the wave-4 halt specifically, states that the wave-2 halt "replayed wave 1 only, a single task", and generalises correctly: "Each halt costs the task count of every wave below it". |
| 4 | REQ-WVR-08's "Phase I produces no new commit" is falsified by Phase PT's V-wave (te-review ×2, pm-author) | **Resolved** | The clause is now scoped to the **implementation wave loop**, and the V-wave's replay is stated positively rather than left as an unstated exception. |
| 5 | REQ-WVR-02's IG ordering reads as precedence (pm-author) | **Resolved** | REQ-WVR-02 now says the IG labels "name **causes, not precedence**", disclaims any ordering claim for the table, and delegates evaluation order to FSPEC §3.2. |
| 6 | The v1.6 amendment note must record the round | **Resolved** | Header carries an "Erratum, 2026-08-21 (v1.6) — Phase F erratum" note enumerating all four edits; version bumped 1.5 → 1.6. |

### Item 1 — BL-04, re-derived

Three sub-claims, three commands, all three confirm the *unmet* reading:

- `git rev-list --count origin/main ^HEAD` → `1637`. Matches the stated figure exactly.
- `git show HEAD:pdlc/workflows/orchestrate-dev.js | grep -c WAVE_STATE_PATH` → `0`; the same grep
  at `origin/main` → `10`. The resume mechanism is genuinely absent from the authoring tree.
- `ls docs/_constraints/` in this tree lists `DOMAIN-CONSTRAINTS.md`,
  `pdlc-advisory-corpus-baseline.md`, `pdlc-consolidation-vocabularies.md`, `pdlc-rcv-baseline.md`,
  `pdlc-rcv-catalogue.md`, `pdlc-rcv-split.md` — no `pdlc-wave-gate-baseline.md`. At `origin/main`
  the file exists and carries the `M-WG-4`, `M-WG-6` and `M-WG-12` ids OF-1..3 cite (one hit each).

So §5's preamble ("BL-02's file already exists on main … citable now") and §10's new sentence
("the authoring tree … carries neither") are both true and are not in tension: they speak about
different trees, and each says which. The correction is honest in the direction that costs the
author something — it converts a discharged prerequisite into an open one — which is the right
direction for a prerequisite whose whole function is to gate implementation.

### Items 2 and 3 — OF-1's numbers, re-derived from the recipe

OF-1's recipe is runnable in this tree, and I ran it rather than reading it. Loading
`parsePlanTasks`, `parsePlanOwnership` and `computeWaves` from `origin/main`'s
`orchestrate-dev.js` (all three are `export function`s) and applying them to
`docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`:

```
tasks 34   waves 16
W1 [ 'T00' ]
W2 [ 'T01', 'T02', 'T03', 'T04', 'T05' ]
W3 [ 'T06' ]
```

Every figure in the corrected text follows mechanically: **16** waves (not 15); waves 1–3 hold
`1 + 5 + 1 = ` **7** tasks, so a wave-4 re-entry pays seven no-op dispatches; wave 1 holds the
single task `T00`, so a wave-2 re-entry replays one. The claim "the cost is the task count of every
wave below the halted one" is the general form of exactly this arithmetic. This is the strongest
kind of correction available to a REQ: the document ships the recipe, the recipe runs, and the
recipe's output is what the prose now says. A reviewer who doubts the number does not have to
argue about it.

I note the recipe is also the reason this erratum was catchable at all. The v1.5 text disagreed
with itself by one wave and by a factor in the replay cost; the disagreement was findable because
one of the two figures carried a way to check it.

### Item 4 — REQ-WVR-08's V-wave scoping, checked against the shipped code

The new clause makes three assertions about Phase PT's V-wave: it dispatches, it gates, and it
commits, on every invocation, independent of the resume decision. All three hold at `origin/main`:

- **Unguarded by the resume decision.** `allWavesRecorded` appears at `:15262` (declaration),
  `:15327` (set), `:15372` (`break`) and `:15615` (the Phase I skip report row). The V-wave's
  `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` at `:15656` sits *after* that block and
  under no such guard — it is reached whenever the run reaches Phase PT.
- **It gates.** `const vGate = await runCommandFn(implConfig.testCommand)` under `if (scriptGate)`,
  with a self-report fallback (`evaluateSingleAgentGate(vResult, "PT")`) when no script gate is
  available. Either way a gate runs.
- **It commits.** The block's own comment states the prompt "carries the branch pin and instructs a
  commit only once the full suite is green", and the halt message says "The V-wave's work is
  already committed on feat-{feature}, so this is recoverable" — the code's own error text is the
  proof that a commit precedes the gate here.

The REQ's wording is accurate on all three and, importantly, does not overclaim: it says the
V-wave "is outside the resume record's scope", which matches the mechanism (no wave-loop write
records it) rather than merely asserting an exception. The internal arithmetic is also consistent
— REQ-WVR-08 calls it "OF-1's 17th wave" and OF-1 says "17 counting Phase PT's appended V-wave".

From the testing lens this is the item that mattered most, and it is the one I raised. The v1.5
clause was an **unfalsifiable-by-construction** acceptance criterion: a test written from "Phase I
produces no new commit" would have failed on every real run, because the V-wave commits on every
real run. The corrected clause is testable as written — the oracle is a wave-loop-scoped commit
count of zero, with the V-wave's commit counted separately and expected to be exactly one. FSPEC
§2 and AT-12 already carry that four-conjunct shape, so the downstream is ready to receive it.

### Item 5 — REQ-WVR-02's IG labels

The new sentence disclaims precedence and points at FSPEC §3.2 for the normative order. FSPEC §3.2
confirms it in the strongest available terms: its table evaluates ancestry (Q5, IG-5) *before*
over-count (Q6, IG-4), BR-03 fixes the order as observable, and the FSPEC carries an explicit
paragraph — "**The order above is deliberately not REQ-WVR-02's IG numbering** … a downstream
reader must not 'correct' it to the REQ's numbering." The REQ and FSPEC now say the same thing from
their two sides, which is what closes this class of defect: previously each document was correct
alone and the pair was ambiguous.

This also protects a PROPERTIES obligation the REQ already carries. REQ-WVR-02 owes a
**set-equality** check over IG-1..6; had the labels kept an implicit precedence reading, a test
author could reasonably have written an ordering assertion against the REQ's numbering and pinned
the wrong order. The disclaimer removes that trap before it reaches a test file.

## Risks

### Upstream drift check (DEC-ERR-03) — clean

The delta leans on upstream in three new places and inherits three load-bearing citations. I
re-read all six at their current version:

| What the REQ leans on | State at HEAD | Verdict |
|---|---|---|
| FSPEC §2 Vocabulary + EC-20 (V-wave outside the wave loop) | Present. §2 says the wave loop "does **not** include Phase PT's appended V-wave, which … dispatches, gates and commits on every invocation independently of any resume decision (EC-20)". EC-20 states the same and names the erratum this round is discharging. BR-11 carries the scoped rule. | Faithful |
| FSPEC §3.2 (ancestry before over-count) | Present, with BR-03 fixing the order and an explicit "not REQ-WVR-02's IG numbering" paragraph. | Faithful |
| `docs/_constraints/pdlc-wave-gate-baseline.md` M-WG-4 / -6 / -12 | All three ids present at `origin/main`. | Faithful |
| OF-1's recipe (`parsePlanTasks` + `parsePlanOwnership` + `computeWaves`) | All three exported at `origin/main`; recipe reproduces 34 tasks / 16 waves / W1 `[T00]`. | Faithful |
| §1's "this working copy carries an untracked record for `pdlc-advisory-wave-gate` with seven waves recorded green and a `head` stamp" | True today: `.claude/pdlc-wave-state.json` exists, `"feature": "pdlc-advisory-wave-gate"`, `"lastGreenWave": 7`, `"head": "8b13bd41…"`. | Faithful |
| §1's three "shipped preconditions" (commit-guarded write, `planHash`, ancestry) | The write guard, `planHash` and the ancestry check are all present in the `origin/main` mechanism; the write's comment "Only now — verified — does anything get committed" is verbatim and grep-unique, as v4 established. | Faithful |

No citation has gone stale, and no claim the delta added rests on text upstream no longer carries.
That last row matters more than it looks: §1's record observation is a claim about *untracked
working-copy state*, the class of claim most likely to rot between rounds. It has not.

### Residual risks, none gating

1. **A prerequisite with two deadlines.** The erratum corrected §10's BL-04 sentence to "owed
   before implementation", but the header amendment note (v1.3) still says a default-branch base is
   "owed before **FSPEC authoring**", and §5's BL-04 row still opens "Checked at FSPEC authoring".
   FSPEC authoring has already happened, and BL-04 is unmet — so on the header note's reading the
   deadline has been missed, while on §10's reading it is still comfortably ahead. Both sentences
   are defensible in isolation; together they leave no single answer to "is BL-04 late?", which is
   precisely the question the erratum was raised to settle. Filed as F-01 (Medium). §5's cell is
   the milder of the two: it is phrased as a criterion ("must both be readable in the authoring
   tree"), not as a verdict, so it does not itself assert discharge — the header note is the site
   that reads as a missed deadline.
2. **Downstream cited as authority by an upstream document.** REQ-WVR-08 and REQ-WVR-02 now
   support their claims with "(FSPEC §2, EC-20)" and "(§3.2 there …)". The substance is verified
   correct, and delegating *precedence* to the FSPEC is exactly right — that ordering is FSPEC's to
   own. But a REQ whose header declares `Upstream: REQ` / `Downstream: FSPEC` and then cites its own
   downstream inverts the dependency for a reader auditing the chain, and creates a maintenance
   coupling: an FSPEC renumber silently invalidates a REQ citation. Filed as F-02 (Low).
3. **Nothing previously approved broke.** The four edit sites do not disturb the traceability matrix
   (§7 still maps US-01→REQ-WVR-08 and US-02→REQ-WVR-02 unchanged), the resume-outcome catalogue
   is still closed at three, REQ-WVR-03's discharge argument still reaches the same conclusion by a
   now-correct route, and the DEC-DOC-01 and size-budget regression checks both still pass.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Which deadline governs BL-04 — "before FSPEC authoring" (header note, §5) or "before implementation" (§10, as amended)? One sentence in the header note, aligned to §10, closes it; I have no stake in which of the two wins, only that the document names one. |
| Q-02 | Now that BL-04 is recorded open and unmet, does the rebase land before Phase T, or does TSPEC authoring proceed against the same 1,637-commits-behind tree? Not a REQ defect and not gating this round — but the PROPERTIES author will need the mechanism readable in the tree to write tests against it, so the answer has a testing consequence, and OB-2's promotion of OF-1..3 into the wave-gate baseline needs that file present too. |

## Positive Observations

- **The corrections run in the costly direction.** Item 1 turns a discharged prerequisite back into
  an open one, and item 4 admits an exception that makes a clean-sounding guarantee messier. Neither
  edit made the document look better; both made it truer. That is the behaviour that makes an
  erratum mechanism worth having.
- **Every corrected number is re-derivable, and I re-derived every one.** 1,637 commits; zero
  `WAVE_STATE_PATH` hits here against ten on main; 34 tasks; 16 waves; `W1 = [T00]`; seven tasks in
  waves 1–3. Six commands, six matches, no discrepancies. A REQ that ships its own falsification
  recipe is a REQ a reviewer can be brief about.
- **Item 4's fix is the difference between an untestable AC and a testable one.** "Phase I produces
  no new commit" could not have been asserted truthfully by any test on any real run. "The
  implementation wave loop lands no new commit, and Phase PT's V-wave dispatches, gates and commits
  exactly once" can be — and FSPEC AT-12 already carries that shape with its four conjuncts and a
  positive call-count, rather than an absence-only "no commit" oracle that could not distinguish a
  skipped V-wave from one that ran with nothing to commit. The FSPEC saw that trap and named it.
- **Item 5 removes a trap before it reached a test file.** Disclaiming precedence in the IG labels
  protects REQ-WVR-02's set-equality obligation from being written as an ordering assertion against
  the wrong order. The REQ and FSPEC now state the same fact from both sides, each pointing at the
  other's ownership.
- **The V-wave scoping did not degrade into vagueness.** The easy fix was to delete the no-commit
  clause. Instead the clause was narrowed and the excluded case was stated positively, with its
  wave number reconciled against OF-1. Narrowing a claim and naming what fell outside it is harder
  than deleting it and strictly more useful downstream.
- **Citation hygiene held under pressure.** The erratum brief handed the author two raw `file:line`
  anchors. Neither appears in the REQ; the document names symbols and FSPEC ids instead, and the
  whole-file `grep` for `.js:N` / `.md:N` is still empty at v1.6.

## Recommendation

**Approved with minor changes.**

All six routed obligations landed, every measurement claim in the delta reproduces against HEAD,
the upstream this document leans on still says what the document says it says, and nothing I
approved at v1.5 regressed. The two findings below are non-gating: F-01 is a leftover deadline
inconsistency at two sibling sites the erratum did not visit, F-02 a citation-direction nit. Both
are one-sentence edits and neither blocks Phase F from converging.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | BL-04 now carries two incompatible deadlines: the v1.3 header amendment note says a default-branch base is "owed before FSPEC authoring" and §5's BL-04 row opens "Checked at FSPEC authoring", while the amended §10 says it "is owed before implementation". FSPEC authoring is done and BL-04 is unmet, so the header note reads as a missed deadline and §10 as a pending one. Align the header note (and, optionally, §5's cell) to §10's "before implementation", or state plainly that the FSPEC-authoring deadline passed unmet. | Header amendment note (v1.3) and §5 BL-04 row, vs §10 |
| F-02 | Low | delta | local | REQ-WVR-08 and REQ-WVR-02 now cite the FSPEC ("FSPEC §2, EC-20"; "§3.2 there evaluates ancestry before over-count") as support, but the header declares Upstream: REQ / Downstream: FSPEC — an upstream document leaning on its own downstream for authority, and coupling the REQ to FSPEC section numbers that a renumber would silently invalidate. Delegating *ownership* of evaluation order to FSPEC is correct; prefer citing the shipped mechanism by symbol for the factual claims, with the FSPEC ids as see-also. | REQ-WVR-08, REQ-WVR-02 |

FINDING: Medium | delta | nonlocal | Header amendment note (v1.3) and §5 BL-04 row, vs §10 | BL-04 now has two incompatible deadlines — "owed before FSPEC authoring" (header note, §5) vs "owed before implementation" (§10, as amended); FSPEC authoring is complete and BL-04 is unmet, so one site reads as a missed deadline and the other as a pending one. Align the header note to §10, or say the FSPEC-authoring deadline passed unmet.
FINDING: Low | delta | local | REQ-WVR-08, REQ-WVR-02 | The REQ (declared Upstream) now cites its own Downstream FSPEC (§2, EC-20, §3.2) as support for its claims, inverting the dependency direction and coupling the REQ to FSPEC section numbers; cite the shipped mechanism by symbol for the factual claims and keep the FSPEC ids as see-also.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518
APPROVAL-HASH-NORMALIZED: sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518
REVIEWED-COMMIT: 7660f1ed7a554cdf51dbb05e5c60c15c61f713fc
