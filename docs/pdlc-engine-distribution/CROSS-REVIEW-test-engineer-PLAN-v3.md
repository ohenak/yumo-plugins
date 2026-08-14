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

## Positive Observations

## Recommendation

## Verdict
