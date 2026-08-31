# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v3.md`. Diffed `f81dfe362..HEAD` on the
document (nine commits, +104/−48). I checked the disposition of v3's four findings, then scanned only
the changed sections — the v1.3 changelog header, DEC-STATS-01's option table, the site table, *What
the sweep found*, the corrected B/C cost paragraph, the durable-lesson paragraph, the re-evaluation
trigger, DEC-STATS-02's trigger, K-1/K-3/K-8/K-9 and *Standing costs accepted* — for new issues.
Unchanged sections already approved in v1–v3 are not re-litigated.

Every claim below was re-measured against HEAD by running the commands the document cites, not read
off the document.

## v3 findings disposition

| v3 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved, and past what I asked for** | I asked for a seventh row (`coverageInstrumentation.test.js`) and for the six-vs-seven gap to be declared. The revision instead replaced hand-reading with a grep-derived set and found two further sites I had not seen — `run.test.js` and `learningsPremises.test.js`. Both verified: `run.test.js:117` and `:269` are `assert.deepEqual` over the sorted four-name manifest, `:249-256` copies the same four names into the scratch tree, and `learningsPremises.test.js:78-91` is `expect(names).toEqual([…])` over `MODULE_NAMES` parsed out of `prepack.mjs`'s source, with the count in its title (*"MODULE_NAMES is exactly the four canonical workflow modules"*). The trigger/table disagreement is gone: the trigger's *fifteen lists across nine files* reconciles exactly — 5 holders + 1 (`coverageInstrumentation`) + 5 (`loop-distribution`) + 3 (`run.test.js`) + 1 (`learningsPremises`) = 15 over 9 |
| F-02 | Medium | **Resolved** | K-8 now reads *"**Seven** assertion edits in all … (3 + 2 + 1 + 1)"* and states why `D1_BASELINE` and `D5_BASELINE` are two edits despite identical content |
| F-03 | Low | **Resolved** | DEC-STATS-02's trigger is restated in *fields* (*"A second JSON-only **field** appears. Two such fields — not two hoist sites —"*) and explicitly records that the trigger has not fired at one field / three sites |
| F-04 | Low | **Resolved, widened** | K-8 now carries the stale-provenance clause: the constants' header comment, `assertAdditiveOnly`'s *"exactly the two new members"* message and the `"vendored class size must be 5"` literal all move with the values, with the reason they are a clause and not a row |

All four v3 findings are landed. The two new findings below are both introduced by this round's edit.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **The corrected B cost is measurably wrong, and the sweep that produced it cannot see why.** The document names `publish-preflight.mjs` among the sites *"B does **not** pay"* and prices B at **three** sites. But `publish-preflight.mjs:205-219` holds its own `LIB_MODULES_AT_HEAD` (12) + `LIB_MODULES_FROM_THIS_FEATURE` (3) — a second, production-side copy of the same engine `lib/` class B moves 15 → 16, feeding `expectedPackedSet()`'s both-directions PF-4 equality at publish time. B pays it. The sweep could not have caught this: it greps `pdlc/engine/__tests__/` and `pdlc/workflows/__tests__/` only, and this pinning copy is production code. The rule K-9 promotes to `DOMAIN-CONSTRAINTS.md` inherits that scope | *What the sweep found*; *Corrected cost claim*; option table row B; K-9 |
| F-02 | Medium | Local | **The cited sweep command does not reproduce its own stated count.** `grep -rln "escalation-view" pdlc/engine/__tests__/ pdlc/workflows/__tests__/` returns **14** files at HEAD, not fifteen; 14 − 5 transcribers − `loop-cli.test.js` leaves **eight** importers, not ten. `loop-cli.test.js`'s reference count is also six (four `loop-session`, two `escalation-view`, lines 122/637/652/681/827/852), not five. The sentence *"the number is now reproducible rather than accumulated"* is the one sentence in the paragraph a reader will check first | *What the sweep found* |
| F-03 | Low | Local | **One transcription of the same membership fact sits outside every swept directory and outside every oracle.** `pdlc/README.md:231` spells the class out in prose — *"The four workflow modules it dispatches (`orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`)"* — and nothing greps it (`grep -rn "four workflow modules"` outside `docs/` returns that line alone). It is not a tenth *tested* site, so the nine-site table is right as a table of falsifiers; it is a tenth place the number goes stale silently | *Option A's nine sites*; *Standing costs accepted* |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should the promoted constraint's query be stated over tracked sources rather than over `__tests__/`? F-01's miss is not a test — it is a production script that mirrors the enumeration deliberately (`publish-preflight.mjs:200-203`: *"a deliberate second, production-side copy of the same TSPEC §5.4 table"*). A query scoped to test directories will keep missing exactly this shape, which is the shape that runs at publish time. |
| Q-02 | K-9 says its two files *"sit in **different** required checks … so a partial edit reds a check on either side of the package boundary"* — true and worth keeping. Is the converse recorded anywhere for K-3's site 7? `coverageInstrumentation.test.js` and `pdlc/workflows/package.json` are one pair inside a *single* check, so a partial edit there reds one check twice rather than two checks once. That asymmetry decides whether K-3 and K-9 can share a task. |

## Detail

### F-01 (High, Cross-Feature) — B pays a site the document says it does not, and the sweep is scoped so it could not tell

The round's headline move is to stop hand-reading and derive the co-change set with a query. The
paragraph *Corrected cost claim: options B and C do not pay the two new sites* then does something
the sweep does not support: it re-prices option B at **three** edit sites and lists, as sites B is
free of, *"`run.test.js`, `learningsPremises.test.js`, `prepack.mjs`, `publish-preflight.mjs`,
`fixture-machine.mjs`"*.

Measured at HEAD, `publish-preflight.mjs` belongs on B's bill, not on that list:

```
pdlc/engine/scripts/publish-preflight.mjs:205  const LIB_MODULES_AT_HEAD = [ …12 names… ];
pdlc/engine/scripts/publish-preflight.mjs:219  const LIB_MODULES_FROM_THIS_FEATURE = ["resolve-version", "store", "provenance"];
pdlc/engine/scripts/publish-preflight.mjs:239-240
    ...LIB_MODULES_AT_HEAD.map((m) => `lib/${m}.mjs`),
    ...LIB_MODULES_FROM_THIS_FEATURE.map((m) => `lib/${m}.mjs`),
```

That is the engine `lib/` class — the same `12 + 3 = 15` the document attributes to
`_tspec-packed-set.mjs:29-45` — held a **second** time, and the file's own comment at `:200-203` says
the duplication is deliberate: *"mirroring — not importing — `packaging.test.js`'s oracle: … a
deliberate second, production-side copy of the same TSPEC §5.4 table, run for real at publish time
rather than only in CI's test suite."* It feeds `expectedPackedSet()`, which PF-4 compares to the
packed file list *"member-for-member, in both directions"* (`:245-247`). Option B puts
`stats.mjs` in `pdlc/engine/lib/`, which the package's `files` entry packs, so a B that edits only
`_tspec-packed-set.mjs` ships a tarball with a member `expectedPackedSet()` does not name and PF-4
reds at publish time. B's real cost is **four** files, not three: `_tspec-packed-set.mjs`,
`publish-preflight.mjs`, `loop-distribution.test.js`, and its `tspecPackedCount` term (same file as
the first).

Two reasons this is High rather than a documentary Medium.

**First, it is the claim the round advertises as its own correction.** The v1.3 changelog says the
revision *"corrects a cost claim made in review rather than inheriting it"*. A correction that lands
a new wrong number is worse than the inherited one, because the next reader has been told
explicitly that this line was re-measured.

**Second, and the reason for the `Cross-Feature` tag: the miss is structural, and K-9 promotes the
instrument that has it.** The sweep is
`grep -rln "escalation-view" pdlc/engine/__tests__/ pdlc/workflows/__tests__/` — two test
directories. `publish-preflight.mjs` is production code, so no run of that command can surface it.
K-9's task promotes the rule to `docs/_constraints/DOMAIN-CONSTRAINTS.md` as *"an enumeration's
co-change set includes every assertion that pins its membership or size, wherever it lives; derive
that set with a query"*. The prose says *wherever it lives*; the executed query says *under two
`__tests__/` directories*. Whichever a future feature copies decides whether it repeats this miss —
and a constraint is copied by execution, not by intent. A constraint promoted with a query that
demonstrably missed a live publish-time gate in the very document that promotes it is a durable
defect, not a local one.

For the record, this does **not** move option A's nine sites. I re-ran the membership question for
A's class independently of the sweep — `grep -rln "loop-session" --exclude-dir=.git
--exclude-dir=node_modules --exclude-dir=docs --exclude-dir=dist .` — and every hit is either one of
the nine table rows, a module importing the workflow member, `pdlc/engine/bin/cli.mjs`'s two dynamic
`import()` paths, or `pdlc/README.md:231` (F-03). No tenth *asserting* site exists for A. The nine-row
table, K-1's partition over it, and K-3/K-8/K-9's ownership all stand as written.

**What change resolves it.** Two edits, both small. (1) Move `publish-preflight.mjs` out of B's
"does not pay" list into B's cost: *"B pays four sites — `_tspec-packed-set.mjs` (class term and
`tspecPackedCount`), `publish-preflight.mjs`'s second copy of the same class, and
`loop-distribution.test.js`'s `15` literal — and still buys no coverage gate"*. The verdict is
untouched; the disqualifier for B was never the site count. (2) State the sweep with the scope the
rule claims — over tracked sources, not `__tests__/` — and record `publish-preflight.mjs` as the
worked example of why: *the copy that runs at publish time is production code, and a test-directory
query cannot see it*. That single example is what makes the promoted constraint teach the right
instrument.
