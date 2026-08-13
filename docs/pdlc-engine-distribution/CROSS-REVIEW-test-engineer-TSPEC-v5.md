# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-13
**Iteration:** 5

**Scope:** testing lens only — oracle falsifiability, expected-set completeness,
production-path vs unit-path proof, implementation echoes, TDD order. Delta re-review:
v0.4's four findings verified against the revision, and only the changed sections scanned
for new defects. Sections not touched this round are not re-opened.

## Delta: what changed and what I re-verified at HEAD

Diffed `95e98c6d..HEAD` on the TSPEC (seven commits, v0.4 → v0.5) and re-read every changed
region. Every `file:line` the new prose adds was re-checked against HEAD rather than trusted:

- `devInjection` at `pdlc/engine/lib/run.mjs:80` (seven keys, `:82-90`) and `queueInjection`
  at `:114` (five keys, `:116-122`) — both as described.
- The composition root: `const injection = devInjection(adapter)` at `:392`; `runQueue`'s
  `const devSeams = devInjection(adapter)` / `const runPipeline = …` at `:450-451` and
  `queueInjection(adapter, runPipeline)` at `:453`. The delegated-inheritance claim is
  exactly what `:451`'s spread does.
- `importWorkflow = defaultImportWorkflow` is a real declared parameter at `run.mjs:387`
  (`runDev`) and `:427` (`runQueue`) — the substitution seam the new level relies on is
  shipped, not proposed.
- `PROP-PARITY-12`'s expected constants at `__tests__/seam-contract.test.js:47-55` (dev) and
  `:57-63` (queue), the two `deepEqual` cases at `:65-73`, and the leak assertion at `:79-82`.
  I also checked the third consumer of `TSPEC_3_1_DEV_SEAMS` (`:277`, inside PROP-PARITY-15):
  it tests **containment against the same constant**, so it follows the constant edit and needs
  no separate row — the §12.4 constraint is complete as written on that point.
- `MERGE_DEFAULTS.mergeMode: "off"` (`orchestrate-dev.js:61`), `decideMerge`'s guard 1
  (`:1064-1070`), the evidence-carrying write `{feature, status: "done", evidence}` (`:1753`),
  and the halt write at `:12913` — F-31's two-status correction is right on both halves.
- `commitQueueRow` (`orchestrate-queue.js:1598`), `commitAdvisoryRecord` (`:1637`),
  `writeEvidenceCarryingRow` (`:491`), `ensureEvidenceColumn` (`:559`), `rewriteStatus`
  (`:1522`).
- `pdlc/engine/package.json:15-17` (single dependency) and the `node --test` spawn
  (`__tests__/_run-suite.mjs:50`).

## Round-4 findings: disposition

| ID | Severity | Status |
|----|----------|--------|
| F-28 | High | **Resolved for the hop it named.** §7.2 gains the production-carrier table naming `devInjection` (8th key) and `queueInjection` (6th key), §3.1 gains the seam-injection row, S-6 (§11) replaces "the engine's `run.mjs`" with both named injections, §12.1 gains a **production-path (composition root)** level that drives `runDev`/`runQueue` through the shipped `importWorkflow` seam with a recording module, §12.3's oracle 2 gains the leg, §12.4 makes the injection change and `PROP-PARITY-12`'s constants one task, and K-3 is repriced for the engine side. The Q-12 answer (queue takes its own seam, not `_runPipeline`'s wrapper) is grounded: `_runPipeline` never enters the queue's own `main()`, which is where C-d and `rewriteStatus` live. The chain is now named end-to-end **except its first hop** — see F-32 |
| F-29 | Medium | **Resolved.** The green-direct-run leg now carries the fixture precondition (`mergeMode: "on"`), and — better than asked — an **emptiness guard**: the produced-kind set must be non-empty and contain kind 3. That second half is what makes the leg immune to the guard ladder changing under it later, not just to today's default |
| F-30 | Medium | **Resolved, and resolved by narrowing rather than by inventing a mechanism.** Clause 3 is now a parser-free token scan for zero `await`, strictly stronger than "no top-level `await`", and the dropped subset claim is demoted to a documented file constraint with the reason stated. The acorn cost analysis is correct — a `devDependency` row would land inside the same manifest §5.4's packed-set equality is auditing. One implementation collision remains (F-33) and one stale sentence (F-34) |
| F-31 | Low | **Resolved.** R-2's Status cell now reads `halted` **or** `done` (evidence-carrying) with both write sites attributed correctly (`:12913` vs `:1753`), so the table and §12.3's leg agree on what R-2 produces |

Nothing from earlier rounds was re-litigated, and no previously-approved section regressed in
this diff. PK- renaming (PM v4 F-02) is mechanical and consistent: I checked every surviving
`E-nn` citation in §5.4, §8.5 and §11 and they are FSPEC error ids, as the note claims.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-32 | High | Local | **The carrier chain is named from `main()` outward but not from the process entry inward: nothing asserts `bin/cli.mjs` actually passes the `Provenance` it builds, and one of its three call sites is not named anywhere in the document.** §7.2's production-carrier table opens with "Build — `bin/cli.mjs` builds the frozen `Provenance` **after** resolution" and then jumps straight to `devInjection`/`queueInjection`; §12.1's production-path level starts at `runDev`/`runQueue` with a hand-supplied `Provenance`. So the hop **`cli.mjs` → `run*()` argument** is specified in one clause of one table row and asserted by no oracle in §12. Measured at HEAD, that hop is **three call sites, not two**: `cmdDev` calls `runDev({reqPath, forcePhases, cwd, adapter, startup})` (`pdlc/engine/bin/pdlc.mjs:385`), and `cmdQueue` calls **`runQueueLoop({queuePath, cwd, adapter, startup, maxPasses})`** (`:434`) *or* `runQueue({queuePath, cwd, adapter, startup})` (`:457`) depending on loop mode. `runQueueLoop` (`run.mjs:478`) forwards `{maxPasses = null, ...args}` into `runQueue` (`:491`), so it inherits provenance **iff `cli.mjs` puts it in that object** — and `runQueueLoop` appears nowhere in the TSPEC. The failure mode is the one the revision was written to close, one hop further in: an implementer who builds `Provenance` in `cli.mjs`, wires both injections and edits `PROP-PARITY-12` — but omits the argument at `:434` — leaves **every** oracle in §12 green (module-side injects into `main()` directly; the production-path leg supplies the value itself) while a real `pdlc queue --loop` run emits `NO_PROVENANCE` into all four kinds and AC-5.3 fails in production. This is the terminal hop — `cli.mjs` *is* the process entry, so naming it closes the chain rather than moving it — and the fix is small: name all three call sites (`:385`, `:434`, `:457`) in the carrier table's Build row, state that `runQueue` and `runQueueLoop` gain the argument alongside `runDev`, and extend §12.1's production-path leg with one leg that drives **`cli.mjs`'s command body** (§5.4 already contemplates importing it directly for unit coverage) with `runDev`/`runQueue`/`runQueueLoop` recorded, asserting the argument object carries the resolved version — red if any one call site drops it | §7.2 (production-carrier table, Build row), §12.1 (production-path level), §12.3 oracle 2, §11 S-6 |
| F-33 | Medium | Local | **Clause 3's oracle and §9.3's own remedy contradict each other: the mandated header comment is the likeliest thing to contain the token the oracle forbids.** Clause 3 asserts the guard's "source contains **zero occurrences of the `await` keyword token**", and the replacement bullet immediately below requires "a header comment in `bin/pdlc.mjs` states the subset and the reason". The reason *is* top-level `await` — §3.1's own row phrases it "no top-level `await`, which would not parse below Node 14.8", and any honest comment says the same. A raw text scan over the file then goes **red against a correct implementation**, and the test author's silent fix (drop the word from the comment, or strip comments ad hoc) decides which half of the section survives. Clause 2 already solved this problem for itself by saying "**non-comment** top-level statements"; clause 3 needs the same qualifier — "zero occurrences in the file's non-comment, non-string source" — plus a one-line statement of how comments are excluded without a parser (the file is three statements; a line filter for `//` and `/* */` is sufficient and should be named, since "keyword token" implies a lexer the section has just finished refusing to add) | §9.3 (clause 3 and the replacement bullets), §12.1 (Arrangement row) |
| F-34 | Low | Local | **§9.3's closing sentence still claims the coverage clause 3 just dropped.** After the narrowing ("the broader *no construct outside the declared syntax subset* claim is **dropped from the oracle**"), the section still ends: "the structural oracle proves the *guard still runs first* and *still parses low enough to run at all*". The second conjunct is now exactly the unfalsifiable claim the revision removed. A PLAN or PROPERTIES author reading the summary rather than the bullets will write a property for a parse check that no test performs. Rewrite the conjunct to what the three clauses do check (no static imports, three declared statements, no `await` anywhere), and let the subset claim live only in the documented-constraint bullet where the revision deliberately put it | §9.3 (paragraph after the replacement bullets) |
| F-35 | Low | Local | **A citation points at the wrong line for a claim that is otherwise true.** §9.3 says the engine "runs on `node --test` (`:12-14`)" against `pdlc/engine/package.json`, but `:12-14` is the `scripts` block, whose `test` script is `node __tests__/_run-suite.mjs`; the `node --test` spawn is at `__tests__/_run-suite.mjs:50`. The substance (no parser available, one dependency at `:15-17`) holds and the argument is unaffected — but §5.4 and §12 ask implementers to transcribe these citations into oracles, and a row that resolves to the wrong lines is the kind of drift the document elsewhere polices well | §9.3 |

## Questions

| ID | Question |
|----|---------|
| Q-15 | Does `runQueueLoop` need a `Provenance` that is **constant across passes**, or one re-derived per pass? It forwards `...args` (`run.mjs:478`, `:491`), so a single frozen value flows to every pass by construction — which reads correct against BR-1.5's "resolved once per run", but the document has not said so, and a PLAN author could reasonably re-build it inside the loop. One sentence in the carrier table settles it and makes the loop leg of F-32's oracle writable |
| Q-16 | The production-path level asserts the recording module's `main()` **receives** `_provenance`. Should it also assert the received object is **the frozen one** (`Object.isFrozen`, and identity with what `cli.mjs` built) rather than a structurally-equal copy? §7.1 makes frozenness part of the type; a spread that rebuilds the object would pass a shape assertion and lose the guarantee |

## Positive Observations

- **F-28's fix went at the seam contract, not around it.** The strongest thing in this
  revision is §12.4's constraint that the injection change and `PROP-PARITY-12`'s transcribed
  constants are one task, with the reason stated in both directions (wiring first is red;
  constants first is red the other way). That turns a shipped no-more-no-less equality from an
  obstacle into the schedule's enforcement mechanism, and it is the sort of constraint that
  only comes from reading the test file rather than the source.
- **The production-path level was placed where the runners already are.** Answering Q-13 by
  putting the leg wholly on the engine side and reusing the shipped `importWorkflow` seam
  (`run.mjs:387`, `:427`) avoids a cross-runner import entirely — a real seam, verified at
  HEAD, rather than a new one invented for the test.
- **F-29 was over-satisfied in the right direction.** I asked for a fixture precondition; the
  revision added the precondition *and* an emptiness guard on the produced-kind set. The
  guard is what survives a future change to `MERGE_DEFAULTS`, and it converts "this fixture
  happens to produce kind 3 today" into an assertion.
- **F-30 was answered by narrowing the claim rather than by manufacturing a mechanism.**
  Dropping the subset check to a documented constraint, and saying plainly which half is
  mechanically checked, is the honest move; the zero-`await` form is genuinely stronger than
  the top-level-only form it replaces. F-33 and F-34 are residue of the edit, not of the
  reasoning.
- **§12.1's module-side split now names why kinds 3 and 4 span both modules** (C-c at
  `orchestrate-queue.js:1598`, C-d at `:1637`), and the two-migration round trip added for
  Q-14 targets exactly the interaction — `writeEvidenceCarryingRow` re-locating a row in a
  table `ensureEvidenceColumn` has already migrated — where a column-index off-by-one lives.
  Neither one-column-at-a-time case reaches it, and the document says so.

## Recommendation

**Needs revision** — one High finding.

All four round-4 findings are genuinely resolved, and F-28's fix is the strongest structural
change this document has taken: the seam contract now schedules its own wiring. The two Lows
and the Medium are cheap edits.

What blocks approval is one hop, and it is the last one available: the chain is now named from
`main()` outward to `devInjection`/`queueInjection`, but not inward from the process entry.
`bin/cli.mjs` has **three** `run*` call sites at HEAD — `runDev` (`pdlc/engine/bin/pdlc.mjs:385`),
`runQueueLoop` (`:434`) and `runQueue` (`:457`) — and `runQueueLoop` is named nowhere in the
TSPEC. Every §12 oracle supplies the `Provenance` itself, so omitting the argument at any one
of those three sites leaves the whole suite green while a real run emits `NO_PROVENANCE`. That
is the same false green §7.4 and then §7.2 were each corrected for, one level further in — and
because `cli.mjs` is the process entry, closing it ends the recursion rather than moving it.

Concretely, to reach approval: name the three call sites in §7.2's carrier table Build row,
state that `runQueue`/`runQueueLoop` take the argument alongside `runDev` (with Q-15's
per-run-vs-per-pass answer), and extend §12.1's production-path level with a leg that drives
`cli.mjs`'s command body — which §5.4 already contemplates importing directly — recording what
each `run*` receives. Worth taking in the same pass: F-33's non-comment qualifier on clause 3,
so the guard's own header comment cannot turn its oracle red, and F-34's stale closing
sentence.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}

