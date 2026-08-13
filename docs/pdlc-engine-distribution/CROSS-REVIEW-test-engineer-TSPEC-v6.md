# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-13
**Iteration:** 6

**Scope:** testing lens only — oracle falsifiability, expected-set completeness,
production-path vs unit-path proof, implementation echoes, TDD order. Delta
re-review: v0.5's four findings verified against the revision, and only the
changed regions scanned for new defects. Sections untouched this round are not
re-opened.

## Delta: what changed and what I re-verified at HEAD

Diffed `b6e73147..HEAD` on the TSPEC (six commits, v0.5 → v0.6) and re-read the
changed regions. Every `file:line` the new prose adds was re-checked at HEAD
rather than trusted:

- The three `bin/cli.mjs` hand-off sites are exactly as §7.2 now names them:
  `runDev({reqPath, forcePhases, cwd, adapter, startup})`
  (`pdlc/engine/bin/pdlc.mjs:385`), `runQueueLoop({queuePath, cwd, adapter,
  startup, maxPasses})` (`:434`, loop mode) and `runQueue({queuePath, cwd,
  adapter, startup})` (`:457`, single-pass). The forwarding claim holds:
  `runQueueLoop({maxPasses = null, ...args})` (`run.mjs:478`) calls
  `runQueue(args)` (`:491`) with the object it received and nothing rebuilds it
  — so Q-15's answer (one frozen `Provenance` per run, shared by every pass) is
  a correct reading of the shipped code, not an aspiration.
- `PROP-PARITY-15` is at `:268-282` and does assert exactly what §12.4 says:
  every key of `devInjection`'s output is in `TSPEC_3_1_DEV_SEAMS` and not in
  `UNOVERRIDDEN_IO_SEAMS` (`:223-238`) — so it turns green on the `:47-63`
  constant edit alone. The leak case (`:79-90`) is an exclusion list
  (`devKeys.has("_runPipeline") === false`, plus three queue exclusions) and
  correctly stays unchanged.
- `PROP-PARITY-10` does import the real module directly
  (`seam-contract.test.js:299`, `await import("../../workflows/orchestrate-dev.js")`),
  so the "sanctioned precedent" claim is real.
- F-35's citation is fixed and correct: `package.json:13` is
  `"test": "node __tests__/_run-suite.mjs"`, and the `--test` spawn is at
  `_run-suite.mjs:50`.

## Round-5 findings — disposition

| ID | Severity | Disposition |
|----|----------|-------------|
| F-32 | High | **Substantially resolved, one layer left.** §7.2 gains the *hand-off (process entry)* row naming all three call sites with correct line numbers, §11's S-6 extends upstream to them, §12.4 pulls `bin/cli.mjs` into the one wiring task, K-3 is repriced to include every command body, and §12.3's oracle 2 says the leg starts at process entry. The chain is now named end to end. What is not settled is **how** the new top leg is executed — F-36 below, which is narrower than F-32 but still blocking |
| F-33 | Medium | **Resolved.** Clause 3 is now scoped to the **non-comment** source, the comment-stripping filter is stated (`//`-to-end-of-line and `/* … */` spans dropped, no parser), its dependence on clause 2 is made explicit, and the reason the qualifier is load-bearing — the mandated header comment contains the forbidden token — is written down. The strings-not-stripped exemption is justified against the file's actual content |
| F-34 | Low | **Resolved.** The closing sentence now claims only *guard still runs first* and *carries no `await` anywhere in its executable source*, and says plainly that the parse-level claim was dropped from the oracle and lives only in the documented-constraint bullet |
| F-35 | Low | **Resolved.** `package.json:13` → `_run-suite.mjs:50`, both verified |
| Q-15 | — | **Answered and grounded** (§7.2's "One `Provenance` per run, not one per pass"), with the "must not re-derive inside the loop" instruction the PLAN author needed |
| Q-16 | — | **Answered in the strong direction**: identity plus `Object.isFrozen`, not structural equality (§12.1) |

Nothing previously approved is re-litigated below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-36 | High | Local | **The new process-entry leg has no executable mechanism: against the `bin/cli.mjs` this same TSPEC specifies, "importing the command bodies directly" cannot be done, and none of the three substitutions it would need are named or priced.** §12.1 and §12.3 now say the leg "drives `cli.mjs`'s three command bodies — importing them directly, as §5.4 already contemplates — and asserts each of `runDev` (`:385`), `runQueueLoop` (`:434`) and `runQueue` (`:457`) receives a `provenance` argument". Measured at HEAD, three separate obstacles stand in the way, and §9.3's own "moves **unchanged** … no behaviour moves" clause forbids removing any of them: (1) **the bodies are not exported** — `async function cmdDev(argv)` (`pdlc/engine/bin/pdlc.mjs:352`) and `async function cmdQueue(argv)` (`:396`) carry no `export`, and the file's only `export`-free surface moves verbatim; (2) **importing the module runs the CLI** — the file ends in a bare `main().catch(…)` (`:505`), so an engine-side `import("../bin/cli.mjs")` executes `main()` against the *test runner's* `process.argv`, falls to the `default:` branch, prints `USAGE` and sets `process.exitCode = 1` inside the `node --test` process; (3) **even with exports, `runDev`/`runQueue`/`runQueueLoop` are static ESM bindings** (`bin/pdlc.mjs:30`), so a test that imports a command body cannot substitute them to observe the argument object — and `node:test`'s `mock.module` is experimental and absent from the pinned runner (`>=20`; local Node is v20.20.1), so the one mechanism that would work is unavailable. HEAD's own precedent points the other way: every existing CLI test drives the bin as a **subprocess** (`cli.test.js:22`, `spawnSync(process.execPath, [BIN, …])`), and *no* test imports the bin module — precisely because of (2). The consequence is exactly the failure F-32 was raised to prevent, one level in: the leg is unimplementable as written, so the implementer will either invent an unpriced seam inside a file the TSPEC says moves unchanged, or quietly downgrade the leg to something weaker (a source grep of `cli.mjs` for the word `provenance`) that is green on a mis-wired `:434` — and `pdlc queue --loop` still ships emitting `NO_PROVENANCE` with the suite green. Name the mechanism, and price it where K-3 and §12.4 already price the rest of the wiring. Three candidates, any of which is fine if chosen explicitly: **(a)** `cli.mjs` exports its command bodies and self-invokes under an entry guard (`if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()`), which makes §5.4's "unit coverage of the body may import `bin/cli.mjs` directly" true — but is a *behaviour* change to the moved file and must be stated in §9.3 and priced in K-3; **(b)** `cli.mjs` takes the three runners through a default-valued seam object the way `run.mjs` already takes `importWorkflow` (`run.mjs:387`, `:427`) — strongest oracle, largest edit; **(c)** keep the subprocess pattern `cli.test.js` already uses and assert on an **observable artifact** of a real `pdlc dev` / `pdlc queue` / `pdlc queue --loop` run in a throwaway repo (the kind-1…4 marks §7.2 defines), which needs no change to `cli.mjs` at all but must name the artifact and the fixture. Whichever is chosen, keep the `:434` loop leg and Q-16's identity assertion — they are the two things this leg exists for | §12.1 (production-path level), §12.3 (oracle 2), §5.4, §9.3 (the "moves unchanged" bullet), §12.4, §14.1 (K-3) |
| F-37 | Medium | Local | **`bin/cli.mjs` now has two owners and no stated order: the E-4b split *creates* it, the provenance task *edits* it, and §12.4 assigns it to the second without a dependency edge to the first.** §12.4's fourth constraint ends "**`bin/cli.mjs` joins that task**" — the injection + `PROP-PARITY-12`-constants task — and says the file-ownership manifest lists the task's files. But `bin/cli.mjs` is a **new file created by a different work item**: §9.3/PK-4b moves the whole HEAD body into it as part of the guard split. Two PLAN tasks therefore claim the same path, which is exactly what the file-ownership manifest exists to make impossible; the reviewer of the PLAN will have to either reject the manifest or invent the ordering. The same ordering governs the F-36 leg: whatever mechanism it uses, it cannot import or spawn `cli.mjs` before the split lands. State the constraint here in the voice §12.4 uses for its other four: *the provenance-wiring task depends on the E-4b split task; `bin/cli.mjs` is owned by the split task that creates it and edited by the wiring task in a later batch, and the production-path leg lands with the wiring task* | §12.4 (fourth sequencing constraint), §9.3, §5.4 (PK-4b) |
| F-38 | Low | Local | **Four of the document's most load-bearing citations point at line numbers this feature's own design will invalidate.** §7.2's hand-off row, §11's S-6, §12.1's production-path level and §14.1's K-3 all address the three call sites as `bin/pdlc.mjs:385`, `:434`, `:457`. That is correct at HEAD and I verified each. But by the time the PLAN task in question is written, §9.3 has moved every one of those statements into `bin/cli.mjs` at different line numbers, so an implementer resolving the citation finds the guard's three top-level statements instead — the same "resolves to the wrong lines" drift this document polices elsewhere (and which F-35 corrected last round). One parenthetical at the first occurrence covers all four: *(line numbers are HEAD's, in `bin/pdlc.mjs`; after E-4b these three sites live in `bin/cli.mjs`)* | §7.2, §11 (S-6), §12.1, §14.1 |

## Questions

| ID | Question |
|----|---------|
| Q-17 | If F-36 lands as option (a) or (b), does the **guard-entry structural oracle** need a companion clause on `cli.mjs`? §9.3's clause set is scoped to `bin/pdlc.mjs` and nothing pins that `cli.mjs` keeps its entry-guard/self-invocation shape — a later edit that restores a bare `main()` call would break every import-based test at once, loudly, so this may need nothing; but if the answer is "the tests themselves are the pin", one sentence saying so keeps a future reader from adding a fourth clause |
| Q-18 | §12.1's production-path leg asserts the frozen value by **identity** (Q-16's answer). For the loop leg, identity across passes is the assertion — but is one pass enough to falsify a per-pass rebuild? A `runQueueLoop` fixture bounded to `maxPasses: 1` would pass an identity check trivially. Worth stating the leg drives **≥2 passes** (`maxPasses: 2`, `run.mjs:478`'s bound) so "same frozen object every pass" has something to compare |

## Positive Observations

- **F-32's fix was taken at the layer it was raised at, not one layer up.** The
  hand-off row names three call sites, not "the CLI", says which one is the live
  failure mode and why (`runQueueLoop` forwards `...args`, so it carries
  provenance only if the caller put it there), and I verified all three line
  numbers and the forwarding at HEAD. K-3's repricing ("every command body as
  well") and §12.4's task extension follow it through instead of leaving the
  claim in one section.
- **Q-15 got a mechanism, not a preference.** "One `Provenance` per run, shared
  by every pass, never re-derived" is derived from `run.mjs:491` passing the
  received `args` straight through, and it is stated as an instruction to the
  PLAN author ("must **not** re-derive the value inside the loop"), which is the
  form that survives into a task.
- **Q-16 was answered in the stronger direction.** Identity plus
  `Object.isFrozen` rather than deep-equality closes the exact hole I was
  worried about: a carrier that spreads and rebuilds passes a structural check
  and fails this one.
- **F-33 was fixed without acquiring a parser.** Scoping clause 3 to non-comment
  source, stating the strip filter, and *naming its dependence on clause 2* —
  so a file that outgrows the assumption fails review rather than outrunning its
  own oracle — is the honest version of this. The strings-not-stripped exemption
  is justified against the file's real content rather than waved through.
- **The `PROP-PARITY-12` edit scope is now exactly right, and I could check it
  mechanically.** The claim that `:47-63` is the only required edit, `:79-90` is
  an exclusion list that must *not* change, and `:268-282` turns green on the
  first edit alone, is true of the shipped test file line for line.

## Recommendation

**Needs revision** — one High finding.

All four round-5 findings are genuinely resolved and both questions answered, one
of them (Q-16) in the stronger direction than asked. The carrier chain is now
named from process entry to the workflow modules, with correct citations at every
hop; I re-derived all of them at HEAD and found no drift.

The one blocker is narrower than F-32 was: the leg that closes the chain is
**described but not executable**. `cli.mjs` as this TSPEC specifies it — bodies
unexported (`bin/pdlc.mjs:352`, `:396`), self-invoking on import (`:505`),
runners bound by static import (`:30`), everything "moved unchanged" — cannot be
driven the way §12.1 says it will be, on a runner without `mock.module`. An
oracle whose mechanism does not exist is not a weaker oracle; it is one the
implementer redesigns alone, at the moment they are least able to notice that
the version they can get green (a source grep) passes on the mis-wired `:434`
that started this thread.

Concretely, to reach approval: pick one of F-36's three mechanisms — export +
entry guard, a runner seam in `cli.mjs`, or a subprocess-plus-observable-artifact
oracle — write it into §12.1 and §12.3, and reconcile it with §9.3's "moves
unchanged" bullet and K-3's price. Worth taking in the same pass: F-37's
ownership/ordering constraint for `bin/cli.mjs` (two tasks currently claim the
file), F-38's one-line note that the `:385`/`:434`/`:457` addresses are HEAD's,
and Q-18's ≥2-pass fixture so the loop leg's identity assertion is falsifiable.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
