# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta re-review. Testing lens only. Round-2 findings F-01…F-04 and Q-01…Q-02
checked for resolution; only changed sections scanned for new defects. Sections already
approved in rounds 1–2 are not re-reviewed.

## Method

`git diff` from the commit v2 reviewed (`9ba5ed61`) to HEAD: +62/−26 lines across the
changelog, a new §1.2 paragraph on AC-4.4's delivery, six §2 rows, §2.1's reconciliation
note and four of its `Carried by` cells, one new §4 kind-1 row, §4 kind-5's T47 → T48
note, §5.1's extension floors and §5.4's anchors, §6 Rule 3, and §7 items 2, 4, 14 and
the not-in-scope paragraph. Every claim below was re-measured against HEAD, not read.

- **Runner counts** (the round-2 High): `node --test __tests__/<file>` at HEAD reports
  `# tests 32` for `skills-composition.test.js`, `# tests 21` for `run.test.js`,
  `# tests 9` for `engine-config.test.js`. `test(` call sites in
  `skills-composition.test.js` counted at `:64, :82, :133, :147, :166, :195, :207,
  :242, :255, :298, :316, :330, :378, :395` — **14 sites, of which `:82` and `:166` are
  `for` loops over `DISPATCHABLE_SET`**, giving 12 + 10 + 10 = 32. The plan's numbers
  are exactly these.
- **Batch arithmetic** (`Batch = max(batch of deps) + 1`) re-derived over all 59 rows:
  **no errors**, no missing or duplicate ids, no cycle. Histogram 1:4, 2:25, 3:7, 4:6,
  5:5, 6:2, 7:2, 8:1, 9:2, 10:2, 11:3 — unchanged from round 2.
- **§4 kind-1 completeness** (the round-2 F-04): 28 pairs after expanding the multi-green
  cells (T16 → T25, T33; T21 → T36, T39; T22 → T30, T35). Every one of the 27 `[green]`
  rows is covered **except T19 and T57**, the two declared `[standing guard]` carve-outs;
  every listed pair is a real `Deps` edge; every `[red]` row is named in some green's
  `Deps`. The rule now holds as written.
- **§2.1 ↔ §2 set-equality** (the round-2 F-02): transposed §2's trailing citation lists
  and compared to §2.1's `Carried by` cells. 35 ids each way, **one difference**, which
  the document itself declares and explains (F-02 below).
- **T18's tightened pathspec**: ran it. 23 files, **zero** under `fixtures/` or
  `__tests__/`, and the three `claude plugin install` sites still present.
- **§5.1's file inventory**: the eighteen "new" basenames are absent from
  `pdlc/engine/__tests__/` at HEAD; all five "extended" files exist.
- **Anchors re-opened**: `run.test.js:41-49` (checkout-path equality), `:51-65` (C-4
  walk), `:67-79` (PROP-FORK-1, assertions inside the `Object.entries` loop) — all three
  correct. `seam-contract.test.js:47, :57, :67, :72, :223` and `run.mjs:53, :80, :114`
  all land on what the plan says they do.
- **Round-2 Q-01**: `.claude/pdlc.config.json` at HEAD carries both
  `"postWaveCommand": "node pdlc/workflows/build-runtime.mjs"` and
  `"postWavePathspecs": ["pdlc/workflows/dist/"]`, as T44 now states.

## Round-2 findings — resolution

| ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | T57, §5.1 and DoD item 2 all now state **14 `test(` call sites / `# tests 32`**, sourced from the runner and labelled as measured. §5.1 goes further than asked and states *why* the loose floor was wrong: "a rewrite keeping twelve tests and deleting the two ten-member sweeps satisfies the loose floor while doing exactly what it exists to prevent". DoD item 2 spells the floors as **`≥ 9`, `≥ 21`, `≥ 32` and `≥ 14` sites**, so the criterion now survives the deletion it guards. `run.test.js`'s other eighteen are named as a group and required to survive. Verified against the runner. |
| F-02 | Medium | **Resolved (one declared exception)** | §2.1 gains the reconciliation rule, names §2 as source of truth, and lists the seven rows fixed at whichever end was wrong. Re-transposed mechanically: 35 ids, exactly one asymmetry (T31 under AT-3.8a), which the same paragraph declares as a pointer-not-a-claim. See F-02 below — Low, phrasing only. |
| F-03 | Medium | **Resolved** | T18's pathspec gains `':(exclude)*/fixtures/*' ':(exclude)*/__tests__/*'`. Ran it: 23 files, none under a fixture corpus, all three `claude plugin install` sites retained. The row records the measured before/after (52 → 23) and states the reason as sample-data-is-not-documentation rather than leaving it to the diff. |
| F-04 | Medium | **Resolved** | `T47 → T48` added to the §4 kind-1 table; §4 kind 5 now says the edge is **both** kinds and points at the kind-1 row; §6 Rule 3 says the table was re-derived row by row. Re-derived independently: the table covers every green but the two carve-outs. |
| Q-01 | — | Answered | T44's row now reads "already satisfied at HEAD — this task verifies it, it does not add it", which is what the config file shows. |
| Q-02 | — | Answered | DoD item 4 states that `scripts/fixture-machine.mjs`'s floor is met by **T59's hermetic legs alone**, and that a below-floor reading therefore diagnoses a missing hermetic test, never a skipped capability-gated leg. That is the unambiguous reading the question asked for. |

All four round-2 findings are addressed. The High below is against **new text added this
round** (DoD item 14's skip semantics), not a restatement of anything above.


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DoD item 14's new skip semantics make the required fixture-machine check green when none of T50's gated legs ran, and nothing else observes them — AT-2.1, AT-2.3, AT-2.4, AT-2.5 and AT-2.6 become unobserved-but-passing.** Item 14 now says: "on a runner that cannot provide the capability the workflow records the skip, prints it, and **concludes success** — the required check is green with recorded skips". T50's row already says the container, real-spawn and `npm pack` legs "run **only in the new workflow**, never under local `cd pdlc/engine && npm test`". Compose the two and the whole of AT-2 has no observer in any of the three states the DoD can be evaluated in: the local suite never runs those legs by construction, the CI check passes whether or not it ran them, and item 15's evidence set is `EVIDENCE-AT-6.2.md`, `EVIDENCE-AT-4.4.md`, `EVIDENCE-BR-3.9.md` — **none of which covers AT-2.1/2.3/2.4/2.5/2.6** (T51 carries AT-6.2, T56 AT-4.4, T52 BR-3.9; checked all three rows and §2.1). Item 14's own escape clause, "the legs that skipped in CI are the ones the `[manual]` records cover", names a coverage relation that does not hold in this plan. This is the same defect the plan spent round 1 F-16 closing — the check was made *required* precisely so it could not be polled and ignored — reopened from the other side: a green required check that means "passed **or** never ran" is an absence-shaped gate on the two criteria (AT-2.3/AC-2.2, AT-2.4) that were added in round 1 *because they had no carrier*. **Two independent holes make it reachable, not theoretical:** (a) the capability predicate is never stated — "a runner that cannot provide the capability" does not say which capability, tested how, so an implementer picks, and an opt-in predicate makes all-skipped the default; (b) **the precedent the plan cites does not behave the way the plan describes it.** T50 says it follows "the workflows suite's `skipSink` precedent", but that precedent is a fail-closed comparator, not a printer: `pdlc/workflows/__tests__/helpers/skipSinkTeardown.js:15-33` reads the sink and **throws** on any violation, and `skipSink.js:120` (`validateSkipRecords`) admits a skip only if it is pre-registered in `driftCapabilities.js:93`'s `SKIP_INVENTORY` with a named `capability` drawn from a closed key set (`skipSink.js:55`) **and** a non-empty `unverifiedInvariants` list. The plan keeps the word "recorded" and drops both clauses that make recording safe. **Fix (cheapest form: adopt the real precedent).** Give the fixture-machine workflow a `SKIP_INVENTORY`-shaped table with one entry per gated leg, naming its capability and the `AT-` ids it leaves unverified; fail the workflow on any skip not in that table; then make DoD item 14 checkable as a positive — the recorded skip set is a subset of the inventory — and extend item 15 so that every `AT-` id appearing in a recorded skip's `unverifiedInvariants` is covered by a named, dated evidence document. Stating the capability predicate itself (what is probed, and what the probe returns on a GitHub-hosted `ubuntu-latest` runner, which does provide docker, `npm pack` and real spawn) closes (a) in the same edit. | §7 item 14, §7 item 15, §2 T50 |
| F-02 | Low | Local | **§2.1's reconciliation rule is stated as an unqualified "iff" and then carved out one sentence later, so the mechanical check it invites returns one hit that is expected.** The rule reads "an `AT-` id appears in a row's `Carried by` cell **iff** that task's trailing list names it"; the next sentence declares the T31 / AT-3.8a pointer as the one deliberate asymmetry. Transposing §2's trailing lists and diffing against §2.1 returns exactly that one row — 35 ids each way, `AT-3.8a`: §2.1 has `T16, T25, T49`, the transpose has `T16, T25, T31, T49` — so the document is accurate and the count is right. But a later reviewer or a future checker script runs the rule as stated, gets a hit, and has to read on to learn it is sanctioned. Fold the carve-out into the rule rather than appending it: "…iff that task's trailing list names it **as its own claim**; where a row's trailing parenthesis names another task's id as a pointer (the single case is T31's `AT-3.8a`, which T16 owns), it is not a claim and does not appear here." Nothing about the coverage changes; the rule just becomes true as written, which is what makes it worth having. | §2.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DoD item 4 requires `scripts/fixture-machine.mjs` to clear 85% branch coverage from T59's hermetic legs alone. T59 unit-tests the recorder "over injected spawn results". Is the injection seam stated anywhere a T59 implementer will find it — does `fixture-machine.mjs` take its spawn function as a parameter, per §2's doubles convention, or is the seam left to the implementer to invent? If the module reaches for `spawnSync` directly, the hermetic legs cannot cover the branches that read its result, and the floor in item 4 becomes unmeetable for a reason no row predicts. |
| Q-02 | §1.2's new paragraph is candid that AT-4.4's anti-echo property is "verified once … and nothing re-checks it afterwards", and names the nine provenance tasks a later hardcoded pair would slip past. That is the right disclosure and I am not asking to re-scope it. But is the follow-on recorded anywhere durable — a `docs/_decisions/` entry or a queue row — or does it live only in this paragraph, which stops being read the moment the feature ships? |

## Positive Observations

- **Every round-2 finding was fixed by changing the thing, not the prose about it.** All
  four were re-checked by re-running the same mechanical procedure that found them, and
  all four pass: the runner's counts are transcribed exactly, the pathspec really yields
  23 files with no fixture markdown, the kind-1 table really covers all 27 greens but the
  two carve-outs, and the §2.1 transpose really is set-equal but for the one declared
  pointer.
- **The F-01 fix generalised past what the finding asked for.** I asked for the correct
  number; §5.1 supplied the number *and* the reason a floor must survive the deletion it
  guards, then applied the same lens to `run.test.js` — which I had not flagged — turning
  "three tests are restated" into "`≥ 21`, i.e. all 21 HEAD tests present, of which three
  are restated and the other eighteen untouched". That is the stronger statement, and the
  eighteen are named by group so a reader can tell what the floor protects.
- **The floors are stated as `≥`, which is what makes them falsifiable.** `≥ 9`, `≥ 21`,
  `≥ 32`, `≥ 14` sites: a rewrite that deletes passing assertions and leaves the suite
  green now reddens the DoD, which is precisely the defect class a coverage gate cannot
  see. Measured all four at HEAD; the plan's numbers are the runner's.
- **§2.1 became a mechanism rather than a table.** Naming §2 as source of truth, stating
  the direction reconciliation runs, and listing which of the seven disagreements was
  fixed at which end means the next reviewer re-derives in one script instead of reading
  59 rows. The note that no `AT-` lost its last carrier in either direction is correct —
  each of the four ids dropped from a `Carried by` cell retains carriers that claim it.
- **The graph survived the round untouched.** Batch arithmetic exact over all 59 rows,
  no cycle, no duplicate id, same histogram as round 2, no same-batch same-file
  collision, every kind-1 pair a real `Deps` edge. The edits were surgical.
- **§1.2's AC-4.4 paragraph is the disclosure a DoD reader needs and rarely gets.** It
  says the criterion is verified once and never again, names the nine tasks a hardcoded
  pair would slip past, gives the reason the automation was not folded into T50 (a P0
  criterion behind a gate that can legitimately skip reads as "not observed", not
  "failed"), and declines to schedule the follow-on rather than pretending it is out of
  scope. Notably, that paragraph names the exact hazard F-01 says item 14 then walks
  into for AT-2 — the reasoning is already in the document, applied to one criterion and
  not the other.
- **DoD item 4 answered Q-02 by making the diagnosis unambiguous.** "A below-floor
  reading is a missing hermetic test, never a skipped capability-gated leg" is the
  sentence that stops a future implementer from explaining away a real gap.

## Recommendation

**Needs revision**

Round 2's four findings are all resolved, and three of them were re-verified by re-running
the exact check that produced them. The graph is unchanged and still exact over 59 rows.
Nothing that was approved in earlier rounds was broken by this revision.

One new High blocks approval, and it is in text this round added:

1. **F-01** — DoD item 14's skip semantics let the required fixture-machine check
   conclude **success with every gated leg unrun**, while T50 forbids those legs from
   running in the local suite and item 15's evidence set covers none of them. AT-2.1,
   AT-2.3, AT-2.4, AT-2.5 and AT-2.6 are then satisfiable without ever being observed —
   including the two criteria round 1 added *because they had no carrier*. The plan cites
   the `skipSink` precedent for this behaviour, but that precedent fails closed
   (`skipSinkTeardown.js:15-33` throws; `skipSink.js:120` admits only skips pre-registered
   in `driftCapabilities.js:93`'s `SKIP_INVENTORY` with a named capability and a non-empty
   `unverifiedInvariants` list). Adopting the precedent as it actually behaves — inventory
   of gated legs, fail on unregistered skip, item 15 covering each skipped leg's `AT-` ids
   — closes this, and stating the capability predicate closes it fully. Note the plan
   already reasons this way in §1.2 about AC-4.4; F-01 asks only that the same reasoning
   reach AT-2.

One non-gating item is a one-line edit: fold §2.1's single declared exception into the
"iff" rule so the rule is true as written (F-02).

**One erratum against FSPEC remains open and is re-reported to the orchestrator**, not
folded into this verdict: FSPEC's F-7 prose (`FSPEC:289`) cites "§8's AT-7.2", but §8
enumerates no AT-7.2 — the criterion it means is AT-6.2 (`FSPEC:743`, `:761`, `:763`, all
about the load-root discriminator and O-9). Re-grepped at HEAD: `AT-7.2` occurs once in
the whole document, at `:289`. PLAN §2.1 and T51 carry AT-6.2 correctly, so the PLAN is
right and the dangling id is upstream.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
