# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Delta re-review. Round 1's five High findings re-checked against the revision, and only
the changed sections scanned for new defects. Unchanged sections already approved in v1 (batch DAG,
§4 ownership manifest, §2 symbol table) are not re-derived. Testing lens only.

## Delta method

`git diff 6e2b3957..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` — 173 insertions,
55 deletions across §0 (changelog), §3 (T04, T06, T07, T10, T11, T12, T19, T21, T22, T25, T30, T31,
T32, T41, T42, T47, T48), §5, §6, §7, §8, §9, §10 and §11. Every factual claim added by the revision
was re-measured at HEAD rather than read out of the document.

## Round-1 findings — resolution

| ID | v1 severity | Status | Evidence re-measured at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | T07 now takes DEC-ENG-05's containment form with no exemption list, states *why* (DECISIONS v1.3 is the later document; the reviewer-role map keys at `orchestrate-dev.js:6229-6231` are genuine members and its values are role slugs that fail the shape predicate), and the §8 DoD item was rewritten to match — "TSPEC §3.3's exactly-equal allow-list is the superseded draft and is **not** implemented". I re-read `DECISIONS:355-375` and `:846`: the plan's paraphrase is faithful, including the shape-predicate-asserted-against-the-known-set clause. The two mutually exclusive oracles are now one, with the tie-break recorded and the loser raised as an erratum |
| F-02 | High | **Resolved in mechanism, but its premise is false** — see F-14. The *shape* of the answer is right (a named operator step in §5, its command in §11, batch-5–11 gate wording that says which platform's suite is expected red, a DoD item that is not met while either row is missing). What it names as "T17's other matrix platform" does not exist at HEAD |
| F-03 | High | **Resolved** | All eight ATs now have owning rows *and* a §9 sub-table: AT-ENG-02→T47, 05→T47, 17/18→T22 red→T36 green, 32→T22, 40→T21, 57→T31, 66→T32. The task rows carry the same ids (T47's row gained AT-ENG-02/05, T22's gained 17/18/32, T21's gained 40, T31's gained 57, T32's gained 66), so the table and the sub-table cannot drift apart silently. The eight cell texts are literal transcriptions of `FSPEC:280`, `:283`, `:540`, `:541`, `:722`, `:878`, `:1169`, `:1295` — I diffed each; none paraphrases the AT into something weaker |
| F-04 | High | **Resolved** | I re-derived set-equality per row against `FSPEC:1335-1360` for all 26 rows. The six failing rows now match: AC-1.3 `…AT-ENG-57`, AC-1.4 `{04, 38}`, AC-2.1 `{09, 11, 13, 15, 24}`, AC-3.1 `{20, 21, 23}`, AC-3.2 `{08, 12}`, AC-3.5 `{10, 12}`. The four rows that are supersets of FSPEC's (AC-1.1 +51, AC-1.2 +50, AC-5.1 +44, AC-6.3 +22) are each marked `this plan's addition`, so the widening is visible and the narrowing is gone. No row is now a subset |
| F-05 | High | **Resolved** | T22 carries the `apiKeySource` clauses as red: (i) disallowed source aborts before billing naming the raw value, (ii) source changes at dispatch 3 of 5 with both values in the report, (iii) the falsifier on the same path — the flag-widened set admits the same fixture and the dispatch proceeds. That is a positive, a second positive and a same-path falsifier, not an absence oracle. T36's policy widening now has a red predecessor, and §9 records the red→green pairing |
| F-06 | Medium | **Resolved** | T48's row says `smoke.test.js` is **extended**, not new, states the measurement (tracked at HEAD, 387 lines — I re-counted: 387), promises every existing assertion survives, and raises TSPEC §8.3's non-classification as an erratum |
| F-07 | Medium | **Resolved** | T25's two absence clauses are each paired with a positive on the same path: `_sessionAgent` unwired ↔ two successive dispatches producing two independent sessions; twelve un-overridden IO seams ↔ the Node defaults shown to be *exercised* via the existing `smoke.test.js` path. The DoD item now says an assertion set that cannot tell "seam omitted" from "seam never reached" does not meet it |
| F-08 | Medium | **Resolved** | T07's oracle is content-keyed throughout and says so; no absolute line number survives as an oracle in either T07 or the DoD item. Moot in the way F-08 predicted, and closed explicitly rather than by accident |
| F-09 | Medium | **Resolved** | Five property strategies named with their laws: `classifyOutcome` totality over generated arbitrary throwables (T04), `resolveAuthPosture` exactly-one-row-matches (T06), `computeRateLimitWaitMs` monotone/capped/jittered (T21), `resolveTunables` precedence totality (T30), `parseVersion`/`satisfiesRange` totality-antisymmetry-transitivity plus a patch-bump round trip (T41). T06's is the strongest of the five: exactly-one-row-matches makes first-match order a *provable* non-issue rather than an ordering convention |
| F-10 | Medium | **Partly resolved** — the floor, the four modules and a DoD item are now stated; the invoking command it names cannot run. See F-15 |
| F-11 | Low | **Resolved** | `_run-suite.mjs` (T11), `_bootstrap.mjs` (T12) and `_assert-suite-wide.mjs` (T19) now carry the **new** label, matching `TSPEC:1908-1910` |
| F-12 | Low | **Resolved** | T10 has a 🟢 glyph, and §5's batch-2 gate names it as explicitly exempt — "A red T10 is the defect there". §9's AC-1.5 row separates clause (a) (closed by T10) from clause (b) (green at HEAD, `run.test.js:48`) |
| F-13 | Low | **Resolved** | The DoD enumerates all 69 — `AT-ENG-01…AT-ENG-68` plus `AT-ENG-11a` — and says the enumeration is set-equal to FSPEC's, "not a numeric range that silently drops `11a`" |

Five of five High findings addressed in substance. One of them (F-02) is answered with a mechanism
that rests on a claim about HEAD that does not hold, which is F-14 below — a new finding, not a
re-litigation of the old one.

## Findings

Two, both introduced by the revision. Nothing in the unchanged sections regressed.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Cross-Feature | **The two-platform matrix the F-02 remediation is built on does not exist at HEAD.** `.github/workflows/pr-tests.yml:40` reads `os: [ubuntu-latest]` — a single entry. `macos-latest` was removed deliberately (commit `410f3a07`, *"ci: drop macos-latest from the unit-test matrix"*, Sun 2 Aug 2026), i.e. before this plan was authored; `grep -c macos .github/workflows/pr-tests.yml` is 0 at HEAD. The surrounding comment at `:37-39` still describes both platforms, which is presumably how the claim survived — but the comment is not the matrix. Four places in v1.1 now depend on the two-platform reading: §11's CI table row spells the job "`unit-tests` (`ubuntu-latest`/`macos-latest`, node 20)"; §5's new operator step says `M-ENG-09` "needs one row per platform in T17's matrix (`ubuntu-latest`, `macos-latest`)" and makes the second row a critical-path hand step; §8's DoD demands a row for "**each** platform in T17's matrix — `ubuntu-latest` and `macos-latest`, both present, not one" and is "not met while either is missing"; T17's row says "add the `engine-tests` job (ubuntu/macos, node 20)". Three consequences, and they are testing consequences, not bookkeeping. (a) As written the DoD item can never be met: no macOS job exists to be red, so nothing forces the second row, and a feature is blocked on an artifact whose consumer is imaginary. (b) If T17 instead *re-adds* `macos-latest` to satisfy the plan, that is an undeclared reversal of `410f3a07` inside a feature branch, and it makes every PR in this repo gated on a credentialed live measurement a maintainer must run by hand on a Mac — a delivery constraint on *other* features, from a file that is repo-wide state. (c) The pairing is the wrong one regardless: T42 records the row for the host the batch-5 **wave** runs on (this repo's waves run on the maintainer's macOS ⇒ a `darwin` row), while T29's gate keys on `process.platform` and CI runs `linux`. So the row that CI needs is precisely the one no task produces, and the plan's generic operator wording ("a host of that platform") is right while its enumeration is wrong. The fix is small and mechanical: state the requirement as *one row per platform the `engine-tests` job actually runs on, which at HEAD is `ubuntu-latest` alone*, plus the wave host's own row, and either drop the macOS clause or make re-adding `macos-latest` an explicit, justified part of T17 with the operator cost named. (TSPEC carries the same false claim at `:1786` and `:1793`; raised as an erratum.) | §3 T17, T42; §5 operator step; §8 "Suite and gates", "Guard parity"; §11 CI table |
| F-15 | Medium | Local | **V5, the only named observation of the coverage floor, contradicts the plan's own DoD and cannot produce a green run.** §11's new row spells V5 as `cd pdlc/engine && node --test --experimental-test-coverage __tests__/`, and §8's coverage item names the same command. But §8's first "Suite and gates" item (`:453`) already says the suite runs "through the **one** spelling in `scripts.test` — the runner, **not a bare `node --test`**", and V5 is exactly a bare `node --test`. Under T11 the runner is what mints `PDLC_TEST_RUN_ID`, empties the run dir, and passes `--import=./__tests__/_bootstrap.mjs`; T12's bootstrap is what installs the construction guard and the socket trap and writes the observation records, and it is specified to fail loudly rather than mint an id when the variable is unset. Invoked as V5 spells it, `_bootstrap.mjs` is never imported at all, so T01's spine assertions have no records to find, T02's hermeticity guard was never installed, and DEC-ENG-10's suite-wide step never runs — the coverage number would be read off a red, non-hermetic run, which is the one run whose coverage means nothing. Spell V5 through the runner instead (`npm test -- --experimental-test-coverage`, with T11's runner forwarding node flags, or the equivalent explicit `--import`), and say in T11's row that the runner forwards them — otherwise the DoD item is unmeetable by the command it names. `pdlc/engine/package.json:13` is `node --test __tests__/` today, so the "no coverage flag at HEAD" half of the row is accurate. | §11 V5; §8 coverage item and `:453`; §3 T11, T12 |

**Checks re-run on changed sections that came back clean**, so the revision is not credited with more than it earned and not suspected of less:

| Check | Method | Result |
|---|---|---|
| §9 AC→AT set-equality | per-row set comparison against `FSPEC:1335-1360`, all 26 rows | passes; four deliberate supersets marked, no subsets |
| Eight newly-owned ATs | cell text vs `FSPEC:280/283/540/541/722/878/1169/1295` | literal transcriptions, no weakening |
| EC families named in T21/T22/T31/T32/T47 | `grep -o 'EC-…-[0-9]*'` over FSPEC | every id cited exists: EC-CLI-2…7, EC-DISP-4/5, EC-FAIL-2…6, EC-Q-2/5/6/7, EC-REP-1/2/3 |
| §6's new parse-safety claim about §7 | `parsePlanTasks` at `orchestrate-dev.js:3730`, header logic `:3766-3771` | correct and for the stated reason — the parser requires **both** an exact id cell and an exact deps cell, and skips the block when either is missing, so §7's `# \| Integration point at HEAD \| What attaches` cannot be read as a task table. v1.1's own two new tables (`Change \| Findings`, `AT \| What it asserts \| Owning task`) are equally safe |
| Batch column, after the round-2 edits | re-derived `max(dep batch)+1` on every row the diff touched (T10, T11, T12, T19, T21, T22, T25, T30, T31, T32, T41, T42, T47, T48) | unchanged and still correct; no edit moved a batch or an edge |
| §11's corrected CI citations | opened each line in `pr-tests.yml` | `unit-tests :27`, `npm ci :68`, `npm test :75`, `working-directory :67/:71`, `artifact-freshness :77`, `fresh-clone-bootstrap :103`, `script-syntax :161` are exact; `:92`, `:98`, `:126`, `:129`, `:147`, `:171`, `:184` land on each step's `name:` line with its `run:` one line below, which is a consistent convention rather than an error |
| T17's literal `testCommand` | `.claude/pdlc.config.json`, `pdlc/workflows/package.json` | the quoted post-change value preserves V2's three ignore patterns verbatim; the set-equality-not-containment argument (repo-wide state, other features' wave gates) is correct and is the right severity to give it |
| `smoke.test.js` classification | `git ls-files` + `wc -l` | tracked, 387 lines — T48's "extended, not new" is measured, not asserted |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-14: is re-adding `macos-latest` to the `unit-tests` matrix in scope for this feature at all? `410f3a07` dropped it on purpose, and this plan is not the place to reverse that silently — but if it is *not* re-added, the whole two-row obligation collapses to one row plus the wave host's, which is a simpler plan, not a weaker one. |
| Q-02 | On F-14(c): which host does this repo's Phase-I wave actually run on? If it is `darwin` and CI is `linux`, then T42's own row never satisfies T29's gate in CI, and the "operator step" is not the *second* row but the *first* one CI will ever see. Worth stating in §5 either way, since the batch-5 gate wording depends on the answer. |
| Q-03 | On F-15: does T11's runner forward unrecognised node flags to the spawned `node --test`? The plan says the runner spawns `node --test --import=…`; if flags are not forwarded, `npm test -- --experimental-test-coverage` is not the fix either and T11's row needs the forwarding clause added explicitly. |
| Q-04 | T04's totality property generates "arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes)" — is the generator itself pinned anywhere, or left to the implementer? A hand-rolled generator that only ever produces `Error` instances would pass while proving nothing, and this is the one property whose value lies entirely in the corpus's weirdness. |
| Q-05 | The new §9 sub-table is titled "Acceptance tests FSPEC §14.1 maps to no AC row", but AT-ENG-57 *is* in FSPEC's AC-1.3 row (the cell notes this parenthetically). Harmless, but a reader checking the title as a predicate will find one counterexample in eight — worth a one-word retitle ("…maps to no AC row, or that this plan additionally pins"). |

## Positive Observations

- **Every one of the five High findings was answered at the level it was raised, not at the level that was cheapest.** F-05 could have been closed by adding "and assert the auth policy" to T36; instead the clauses went into T22 as red, with the same-path falsifier. F-03 could have been closed by widening an existing cell; instead AT-ENG-17/18 are called out as the billing-safety pair that must be red tasks, with the reason stated ("a feature that ships with no failing test for 'a disallowed key source stops a run' has no evidence the abort path works at all"). That is the sentence I would have written.
- **F-01's resolution picks a winner *and* explains why the loser was wrong**, rather than quietly deleting one oracle. Recording that TSPEC §3.3 is the earlier draft, that DEC-ENG-05 rejected it as unwritable against HEAD, and that the reviewer-role map keys need no exemption because they are genuine members, means the next reader cannot re-derive the strict form and think it an improvement. The erratum rather than a silent divergence is the right routing.
- **The §9 additions are marked as additions.** `(+ AT-ENG-51, this plan's addition)` costs four words and converts an unexplained superset into a checkable delta. The accompanying sentence — "Narrowing is the failure this column exists to prevent" — states the asymmetry correctly: a superset is a decision, a subset is a hole.
- **T06's property strategy is the best of the five.** "Over the generated product of the row predicates' inputs, **exactly one** of the six rows matches any environment" makes first-match order provably irrelevant rather than conventionally load-bearing. That is a stronger oracle than the row-by-row examples it accompanies, and it is the kind of property that catches a future sixth row overlapping an existing one.
- **T25's pairing reuses the existing `smoke.test.js` path instead of building a second harness.** The cheapest correct answer to "prove the un-overridden seams are exercised" was already in the tree; the revision found it and said so. Fewer moving parts, and the proof traverses the production composition rather than a builder.
- **T48's fixture pinning closes a hole I had not flagged.** v(a)'s malformed trailer (`VERDICT — Approve`, no colon) and v(b)'s `Task`-headed table make M-ENG-07 rows 6 and 7 witnessable by construction — "without these two the corpus is one comma away from making both rows unwitnessable" is exactly the vacuous-green failure mode, caught by the author rather than by a reviewer.
- **§6's parse-safety argument now covers §7, and for the right reason.** I checked `parsePlanTasks` (`orchestrate-dev.js:3766-3771`): the both-cells-required rule is real, and the plan's inference — that adding a `Deps`-spelled column to §7 would break parsing, which is why §7 names edges in prose — is a correct reading of a parser most documents never read at all.
- **§11's V5 row is honest about its own awkwardness** even though the command is wrong (F-15): it explains why coverage is not folded into V1 (T17's job body is deliberately `npm ci` then `npm test` and nothing else, and a coverage flag on the suite command would change what CI runs). The reasoning is sound; only the spelling is off.
- **The `testCommand` DoD item argues blast radius, not wording.** "A value that runs only the engine suite blinds *other* features' Phase I wave gates — an effect outside this feature and outside this REQ" is the correct frame for a repo-wide config file, and set-equality rather than containment is the correct check to derive from it.

## Recommendation

**Needs revision**

One High finding, and it is narrow. F-14 is not a disagreement about testing strategy — the strategy
is right — but about a fact: `pr-tests.yml:40` is `os: [ubuntu-latest]`, macOS having been dropped on
purpose nine days before this plan was written. The remediation I asked for in F-02 was built on the
two-platform reading, so it inherits the error, and it lands in a DoD item that as written can never
be satisfied and in a critical-path operator step aimed at a job that does not exist.

1. **F-14** — restate the `M-ENG-09` obligation against the matrix that exists: one row per platform
   the `engine-tests` job actually runs on (`ubuntu-latest` at HEAD), plus the wave host's own row if
   it differs, and say which of the two the operator step produces. If re-adding `macos-latest` is
   intended, make it an explicit part of T17 with `410f3a07` named and the recurring hand-measurement
   cost stated — that is a decision, and it belongs in the open.
2. **F-15** *(Medium, not gating)* — spell V5 through the suite runner so the coverage floor is read
   off a hermetic, green run, and reconcile it with §8's "not a bare `node --test`" item.

Everything else in the round-1 set is closed, and closed at the level it was raised. Errata for
upstream documents are emitted in the dispatch response rather than folded in here.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
