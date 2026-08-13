# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2

**Scope:** Testing lens only — testability, oracle falsifiability, expected-set completeness,
test-double design, TDD order. Delta re-review: v0.1's thirteen findings verified against the
revision, then the changed sections scanned for new defects. Unchanged sections not re-opened.

## Delta method

Diffed `cdce1b28..HEAD` on the TSPEC (seven authoring commits, v0.1 → v0.2) and re-read every
`file:line` the changed sections newly cite. Findings below cite what I read at HEAD, not the
TSPEC's prose.

## Round-1 disposition

| Prior | Severity | Status |
|---|---|---|
| F-01 | High | **Resolved.** §7.2 now carries a four-kind placement table with a named carrier and site per kind, and kind 3 marks both the row text and the commit message. See F-16 for a residual grounding error in the accompanying prose |
| F-02 | High | **Resolved.** §7.4 replaces the prose claim with a literal ten-class table and a set-equality; the corrected `converge()`-only reading is grounded (`:11498`, `:11507` verified — the push is conditional and is the only push site; LEARNINGS authored at `:12690-12704` outside it) |
| F-03 | High | **Resolved.** `scripts.postinstall` added to §5.1 and `scripts/postinstall.mjs` given an explicit `files` entry |
| F-04 | High | **Resolved as to method.** The allow-list drops `README.md`, the expected set is enumerated literally (E-1…E-20), and the disagreement with FSPEC §5.2 is raised as an erratum instead of papered over. Two defects remain *in the new enumeration* — F-14, F-15 |
| F-05 | High | **Resolved, and better than asked.** The extraction is rejected outright rather than mitigated, and §8.5's `uses:`-is-unexpandable rule makes the rejection mechanical. The added `publish.yml`/`pr-tests.yml` command set-equality is the right price for the duplication |
| F-06 | High | **Resolved.** Ladder branch 0 plus §6.4's three-way reader. Grounding verified: `readEngineConfig` at `run.mjs:178` does return `{config:{}, notices}` on unparseable JSON (`:184-192`) and on a non-object section (`:197-203`). See F-17 for a scope consequence the revision left unstated |
| F-07 | High | **Resolved.** AF-2 gains the `prepack`-into-temp precondition, a two-module set-equality and a one-byte mutation falsifier, and §12.3 grows a fourth entry for it |
| F-08…F-13 | Medium/Low | **All resolved.** S-2 restated to the shipped `readEngineConfig({cwd}) → {config, notices}` shape plus the discriminant; catalogue registration paired with emitters and with rendered-text assertions (both directions of the suite-wide equality verified real at `_assert-suite-wide.mjs:195-205` and `assert-suite-wide.test.js:183`); the launcher hop given a real spawn oracle and correctly de-named as process replacement; AT-6.2's limit moved to the recorded evidence; V-18's per-job axes corrected and verified (`pr-tests.yml:40-41` `os`+`node`, `:86-87` `os` only, three jobs with none) |

No prior finding is re-litigated below. Everything that follows is new, and every one of it
lands in a section this revision changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Local | **§9.3 creates `bin/cli.mjs`, §5.4's expected packed set does not contain it, and PF-4 is a both-directions equality — so the gate is red by construction.** §9.3 splits the launcher: the `bin` entry becomes a dependency-free guard whose only statements are the version comparison and `await import("./cli.mjs")`, and "everything currently in `bin/pdlc.mjs` moves behind that dynamic import". That is a **new second file under `bin/`** (verified at HEAD: `ls pdlc/engine/bin/` → `pdlc.mjs`, one file). The `files` entry `bin/` packs it. §5.4's enumeration lists E-4 `bin/pdlc.mjs` and nothing else under `bin/`, so the packed set has a member the expected set lacks — the identical failure shape F-04 raised against `README.md`, reintroduced one section later by a change made in the same revision. The tempting repair is again the wrong one (relax to a subset). Add the member to §5.4 and name the file, or state that the guard keeps the `pdlc.mjs` name and the *rest* moves to a new name — either way the two sections must enumerate the same `bin/` contents. §3.1's component table (`:87`) still describes `bin/pdlc.mjs` as doing the argument parse and the `exec` itself, and needs the same reconciliation | §5.4 (E-4), §9.3, §3.1 |
| F-15 | High | Local | **E-3 parameterises the expected set on the artifact under test — an implementation echo that makes one member's deletion pass.** §5.4 says the `LICENSE` member's presence in the expected set is "parameterised on one boolean the repo can read (does `pdlc/engine/LICENSE` exist)". The expected side of a both-directions equality is then *derived from the same tree the packed side is built from*: if the file is present it is expected, if absent it is not. After N-2's licence decision lands, a `LICENSE` deleted by a bad merge shrinks both sides together and PF-4 stays **green** while the package publishes unlicensed — precisely the silent failure AC-1.3's equality is nominated against. The document already ships the correct pattern one row up: PF-3 asserts `name` against **the recorded decision in `DECISIONS-plugin-distribution.md`**, "never against a literal authored in this TSPEC". Apply the same source of truth here — the boolean is "has N-2 recorded a licence", read from the decision record, not "does the file exist". Then a missing `LICENSE` after the decision is red, which is the point | §5.4 (E-3), §8.3 PF-3 |
| F-16 | Medium | Local | **§7.2's kind-4 prose claims a single helper; its own table names two, and the claim about HEAD is false.** The table's kind-4 row correctly names **`commitPaths` and `commitQueueRow`**. The prose beneath it says "Kind 4 goes through a single helper. Every script-owned commit already funnels through `commitPaths` — the Phase I wave commits (`:12390`, `:12401`, `:12801`) and **the queue row's own commit**". The wave commits do (verified). The queue row's commit does **not**: `commitQueueRow` issues its own `git add` and `git commit -m \`chore(queue): ${feature} → ${status}\`` through `gitFn` directly (`pdlc/workflows/orchestrate-queue.js:1598+`), in a different module, never touching `commitPaths`. The structural argument the prose rests on — "a new commit site inherits the mark by construction" — therefore holds only within `orchestrate-dev.js`; a new queue-side commit site would not inherit it. Restate as two marked helpers with the invariant "no script-owned `git commit` outside these two", which is assertable as a source-level grep row in the arrangement suite | §7.2 |
| F-17 | Medium | Local | **Ladder branch 0 refuses runs that succeed today, and the section's own carve-out says otherwise.** §6.4 keeps the `notices` channel and says "the `dispatch` tunables keep their current degrade-with-notice behaviour... Only the `engine` section gains the refusing read". But branch 0 fires on a **file-level** parse failure, which is not a statement about either section: a repo with a corrupt `.claude/pdlc.config.json` that has **never pinned an engine version** runs fine at HEAD with a notice (`run.mjs:184-192`) and refuses to run at all after this change. That behaviour change is traced to no AC, is not in §11's table beyond the bare row, and has no test case. Two things to add: state the consequence explicitly (a corrupt config is fatal regardless of whether a pin was ever declared, because an unparseable file cannot say whether one was), and add the ladder case "file unparseable **and** no pin declared → refuse" so the totality tests cover the state the carve-out sentence currently implies degrades | §6.4, §11 |
| F-18 | Medium | Local | **`node:18-alpine` cannot falsify the hazard §9.3 was rewritten to defend against.** The redesign's load-bearing claim is structural: static imports evaluate before the importing module's body, so the guard must import nothing statically and must parse on very old Node ("it parses on Node 12 so that it can refuse on Node 12"). The named runner is Node 18, which parses every modern construct in `lib/` happily. A regressed implementation — guard restored to the top of a statically-importing `bin/pdlc.mjs` — passes AT-2.5 on `node:18-alpine` with the correct message and exit code, while still emitting the stack trace AC-2.4 forbids on the runtimes where it matters. Pair the container leg with a cheap structural oracle that runs in the unit suite: parse the guard entry's source and assert it contains **zero** static `import` declarations and that its only non-comment top-level statements are the comparison and the dynamic import. That is falsifiable in-process, needs no old runtime, and goes red on exactly the regression | §9.3, §12.1 |
| F-19 | Medium | Local | **What `--version` reports in a *resolvable* repo is unstated, and the unconditional reading is the surprising one.** §6.2's exemption is written without a condition: "`--version` and `doctor` run the **launcher's own** `bin/pdlc.mjs` in place. They do not `exec` a resolved child." Read literally, in a pinned repo `pdlc --version` reports the **launcher's** engine version — not the pinned version that any other command would run — and §6.2 then specifies the reported triple only for the no-usable-entry state. AC-1.4's test has two states and the document answers one. State the resolvable case: either the exempt commands resolve-but-do-not-exec and report the resolved version with its `mode`, or they always report the launcher's own and the announcement of §6.3 is what carries the pin. Both are defensible; only one is testable at a time | §6.2, §11 |
| F-20 | Medium | Local | **How `Provenance` reaches the queue-side carriers is unnamed, and the boundary it crosses is a generated artifact.** Kind 3's carriers live in `orchestrate-queue.js` (`rewriteStatus:1572`, `commitQueueRow:1598`), reached in dev-mode runs through a closure composed in **`build-runtime.mjs:273-274`** whose argument list is fixed (`queuePath, feature, status, readFile, writeFile, git, evidence`) — verified. S-6 lists the `_provenance` seam's module as "workflow modules" (plural), which is the only hint that `orchestrate-queue.js` gets its own. A test author writing kind 3's oracle must therefore invent the injection point: a new `rewriteStatus` parameter, a new field on the `_recordQueueRow` call object, or a second `_provenance` seam on the queue module — with a rebuild of `dist/` implied either way. Name it. §14.1's K-3 ("bounded to one default-inert parameter, four placements, and one marked commit helper") prices this as smaller than it is | §7.2, §10.1 S-6, §14.1 K-3 |
| F-21 | Low | Local | **§12.1's module-side row is right but under-specified for kind 3.** "`pdlc/workflows/__tests__/` — `_provenance` inertness and the four placements" holds only because that directory covers both workflow modules. Given F-20's cross-module plumbing, saying so in one clause ("kinds 1–2 and 4 against `orchestrate-dev.js`, kind 3 against `orchestrate-queue.js`, same suite") removes the reading in which one module's test file is expected to prove all four | §12.1 |

## Questions

| ID | Question |
|----|---------|
| Q-06 | F-14's fix has a naming consequence worth deciding here rather than in the PLAN: does the packed `bin/` end up `{pdlc.mjs (guard), cli.mjs (body)}`, or does the guard take a new name and `pdlc.mjs` stay the body? The `bin` field in the manifest points at one of them, and PF-4's expected set and the `bin` entry must agree. |
| Q-07 | §8.4 step 4 re-asserts PF-4 and PF-5 against the packed tarball after `pdlcPairing` is written. Does that re-assertion use the same expected set as step 1, or does it gain the `pdlcPairing` key as an expected *manifest content* assertion? The step's own reasoning ("the manifest is a member of its own expected set is exactly the kind of claim that silently stops being true") suggests a content check is intended, but only the file list is specified. |
| Q-08 | §8.5's new `publish.yml`/`pr-tests.yml` command set-equality — is it over the literal `run:` strings, or normalised? Five jobs' bodies include `working-directory` and `uses: actions/*` steps; a raw string equality is falsifiable but brittle against a whitespace edit, and a normalised one needs its normalisation stated to stay falsifiable. |

## Positive Observations

- **F-05 was answered by removing the risk rather than pricing it.** The reusable-workflow
  extraction is rejected, and §8.5's `uses:`-is-unexpandable rule turns the rejection into a
  gate that goes red in CI instead of a paragraph someone must remember. Pairing the
  duplication with a command set-equality — "duplication with an equality check is safer than
  extraction with a blind one" — is the correct testing trade, stated in the correct terms.
- **§7.4's ten-class table is exactly the artifact AT-4.5 needed.** Replacing "every document
  the pipeline authors" with an enumeration, marking four classes as *not reaching*
  `artifactPaths` at HEAD, and scheduling the work as "fix the four plus the equality test"
  rather than "verify the existing set" is honest about size and gives the oracle a literal
  right-hand side. The set-equality-over-subset argument ("a newly authored document class
  forces this list to be revisited, because the test goes red until it is") is the reason to
  keep it that way.
- **§12.3 grew a fourth entry when AF-2 gained its precondition.** The revision did not just
  fix the oracle; it added the oracle to the register of oracles that must not be satisfiable
  by absence. That is the habit that keeps the register true over time.
- **Three grounding claims were re-measured rather than re-asserted** (V-14's `converge()`-only
  scope, V-17's queue-side writer, V-18's per-job axes), and §14.4 records that as a
  definition-of-done clause. I re-verified all three at HEAD and they hold.

## Recommendation

**Needs revision** — two High findings.

Both are arithmetic in the packed-set enumeration, and both are consequences of changes this
revision made rather than survivals from v0.1. F-14 is a member the design creates in §9.3 and
the expected set in §5.4 does not list, which makes PF-4/AT-3.8a red by construction — the same
shape as round 1's `README.md` defect, one section further along. F-15 is the `LICENSE` row
deriving its expectation from the tree under test, which lets a deletion pass a both-directions
equality; the document already ships the right pattern in PF-3 and needs only to apply it.

Concretely, to reach approval: enumerate the `bin/` contents once and identically in §5.4 and
§9.3 (and update §3.1's component row), and re-source E-3's boolean from N-2's recorded decision
instead of from `pdlc/engine/LICENSE`'s existence. The five Mediums are worth taking in the same
pass — F-16's false grounding claim and F-20's unnamed injection point in particular, since both
sit in §7.2, the section round 1 asked to be made precise.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 5, "low": 1}
