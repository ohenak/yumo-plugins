---
feature: pdlc-headless-engine
---

# PROPERTIES — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** (`REQ-pdlc-headless-engine.md` v0.10; `FSPEC-pdlc-headless-engine.md` v1.6; `TSPEC-pdlc-headless-engine.md` v1.5; `DECISIONS-pdlc-headless-engine.md` v1.3; `PLAN-pdlc-headless-engine.md` v1.2) |
| Downstream | IMPL and tests (`pdlc/engine/__tests__/`, `pdlc/workflows/__tests__/`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 1. Purpose and scope

This document states the testable properties of the headless engine: what it must do, what it
must not do, and under which observation each claim is falsifiable. It is derived from REQ v0.10's
26 acceptance criteria, FSPEC v1.6's behavioural rules (`BR-*`), edge cases (`EC-*`) and 69
acceptance tests (`AT-ENG-01…AT-ENG-68` plus `AT-ENG-11a`), TSPEC v1.5's design sections, and PLAN
v1.2's 54 tasks (`T00…T53`).

**This is not a greenfield feature.** A partial engine is committed at
`pdlc/engine/` on this branch — seven modules under `lib/`, `bin/pdlc.mjs`, and nine test files
(verified at HEAD: `lib/{adapter,handshake,report,run,skills,startup,transport}.mjs`;
`__tests__/{adapter,cli,handshake,report,run,skills,smoke,startup,transport}.test.js`). Each
property below therefore carries a **state at HEAD** cell with one of three values, because a
property that re-asserts an existing green and one that starts red demand different work:

| State | Meaning |
|---|---|
| `red` | no code at HEAD satisfies this; the test starts failing and a PLAN task makes it pass |
| `green` | the observable exists at HEAD; the property pins it against regression |
| `partial` | some clauses hold at HEAD, others do not; the cell names which |

`docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 remains the authority on per-criterion
red/green state; where a cell here and M-ENG-06 disagree, M-ENG-06 wins and the disagreement is a
defect in this document.

**Out of scope for this document.** Pipeline semantics (phase graph, convergence, round windows,
verdict parsing, erratum routing, POSTMORTEM lifecycle, queue lifecycle) are unchanged by this
feature (REQ NG-1) and their properties live with the workflow modules' own suite, not here. This
document asserts only that the engine *hosts* them without altering them — that is
`PROP-PARITY-*`'s job, and it is a structural claim, never a behavioural re-specification.

## 2. How to read a property row: columns, levels and oracles

**Identifier grammar.** `PROP-{DOMAIN}-{NUMBER}`. Domains are stable and each maps to one section:
`PARITY`, `FORK`, `READ`, `START`, `HAND`, `SKILL`, `AUTH`, `ENV`, `DISP`, `MODEL`, `PERM`, `FAIL`,
`RETRY`, `QUEUE`, `EXIT`, `CLI`, `REP`, `TUNE`, `GUARD`, `VER`, `MSG`, `SUITE`. Numbers are never reused;
a withdrawn property keeps its id with a `withdrawn` state rather than being deleted.

**Columns.** Every property table carries: the id; the property statement (`must` / `must not`,
with its `when`/`given`); `Traces` (the REQ acceptance criterion, FSPEC rule and TSPEC section it
derives from, plus the FSPEC acceptance test id where one exists); `Category` and `Level` from the
tables below; `State at HEAD`; and `Task` (the PLAN task that owns the red test, then the green).

| Category | This document's usage |
|---|---|
| Functional | Core engine logic — resolution, composition, classification |
| Contract | Protocol/interface conformance: seam shapes, transport option boundary, report schema |
| Error Handling | Failure modes, refusals, degradation, totality of parsers |
| Data Integrity | Transformations and mappings: descriptors, report blocks, exit codes |
| Integration | Cross-module wiring: engine ↔ workflow modules, engine ↔ transport, engine ↔ plugin |
| Security | Auth policy, billing safety, credential absence in fixtures, permission posture |
| Idempotency | Repeated dispatch/run producing the stated result |
| Observability | Banner, run report, retry/pause rows, suite observation records |

| Level | When it is chosen |
|---|---|
| Unit | The observable is reachable from a pure function or a single module with injected seams |
| Integration | The observable requires two or more engine modules, or the engine against a doubled transport, or the engine against the real workflow modules |
| E2E | The observable requires a whole pipeline run (hermetic, doubled transport) or a live credentialed run |

**E2E budget.** Five E2E properties exist and no more: `PROP-PARITY-1`, `PROP-PARITY-2`,
`PROP-READ-1`, `PROP-READ-2` and `PROP-VER-11` (the opt-in live smoke, which never runs in CI).
Everything else falsifies at unit or integration level. The five-configuration corpus (PLAN T48) is
an integration instrument driven over recorded descriptors, not a fifth pipeline run per property.

The budget is **checkable, not declarative**: it is asserted as a set-equality between the five ids
named above and the set of rows in §§3–12 whose `Level` cell reads `E2E`, so a sixth E2E row cannot
be added without editing this clause. Two live-credentialed properties sit **outside** the budget and
are typed `Integration` deliberately, because neither observes a pipeline run: `PROP-VER-10` asserts
a property of **the default suite's own records** (zero live dispatches when the flag is unset), and
`PROP-GUARD-23` asserts the **provenance of a baseline row** rather than the run that produced it.
`PROP-VER-6` is `Unit` and always was — it is the per-process trap-scope property, not the live
smoke; the earlier draft of this clause named it by mistake (PM F-05, TE F-03).

**Three oracle rules this document applies to itself**, each because a plausible-looking oracle here
would be vacuous:

1. **No absence-only oracle.** Every clause of the form "X is not present" is paired, in the same
   property or its immediate neighbour, with a positive on the same path. `PROP-READ-1`'s empty
   `.claude/workflows/` read-set is asserted only alongside the two positive read clauses, and
   `PROP-READ-3` is the deliberate-read falsifier that proves the instrument can fail.
2. **No blocked/refused state asserted by status alone.** Every refusal property asserts three
   conjuncts: the exact exit code, the named catalogue id, and the retention evidence (zero
   dispatches attempted, or the artifact set the run left behind).
3. **No set-equality asserted in one direction.** Where the spec says "both directions", the
   property names both and the reverse direction names the instrument that makes it satisfiable —
   a provocation fixture per outcome member, a corpus configuration per model-map row, an emission
   seam per catalogue id.

## 3. Pipeline parity, anti-fork and the read-set (PROP-PARITY, PROP-FORK, PROP-READ)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-PARITY-1 | A hermetic `pdlc dev` run over the fixture repo **must** produce, under `docs/{f}/`, a filename set equal to the phase-declared core (`FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `LEARNINGS`) for the phases that fixture's config enables — set-equality, observed over **creation events**, not over the tree surviving at exit | AC-1.1 cl.1(i), BR-PARITY-3, TSPEC §7.3, AT-ENG-45 | Integration | E2E | red | T34 → T49 |
| PROP-PARITY-2 | Each run-dependent member **must** appear iff its rule fires against the fixture: `DECISIONS-{f}.md` iff the fixture supplies the Phase-T decision; the `CROSS-REVIEW-{role}-{doc}[-v{N}].md` set equal to exactly one file per `(role, doc, round)` the fixture's round windows name; `CODE_REVIEW-{f}-v{N}.md` one per DoD round driven; `POSTMORTEM-{phase}-{f}.md` iff the fixture halts that phase; `ADVISORY-{f}.md` iff the advisory tier is enabled | AC-1.1 cl.1(ii), BR-PARITY-6, AT-ENG-46 | Data Integrity | E2E | red | T34 → T49 |
| PROP-PARITY-3 | No filename outside PROP-PARITY-1's and PROP-PARITY-2's rules **must** appear under `docs/{f}/`: the set is closed under both rules together | AC-1.1 cl.1, BR-PARITY-6, AT-ENG-45 | Data Integrity | Integration | red | T34 → T49 |
| PROP-PARITY-4 | Every `CROSS-REVIEW-*` file created by the run **must** carry a parseable `VERDICT:` line **and** a counts object | AC-1.1 cl.2, AT-ENG-45 | Contract | Integration | red | T34 → T49 |
| PROP-PARITY-5 | Approval anchors (`APPROVAL-HASH:`, `REVIEWED-COMMIT:`) **must** be present on each cross-review that reached a terminal approval, **and must be written by the module's own append path** (`orchestrate-dev.js:6190` via `_appendFile`), never by the test double | AC-1.1 cl.3, BR-PARITY-5, TSPEC §7.3, AT-ENG-45 | Data Integrity | Integration | red | T34 → T49 |
| PROP-PARITY-6 | The feature's `docs/_queue/QUEUE.md` row **must** hold one of `in-progress`, `awaiting-merge`, `halted` after the run, with its pathspec-scoped commit present in `git log` | AC-1.1 cl.4 | Integration | Integration | red | T34 → T49 |
| PROP-PARITY-7 | The run report **must** carry every field the modules already produce **plus** the engine block of FSPEC §12.2 — asserted as containment of the module fields and presence of the engine key, on the same run PROP-PARITY-1 observes | AC-1.1 cl.5, AT-ENG-45 | Observability | Integration | red | T32 → T40 |
| PROP-PARITY-8 | The write-replaying double **must** key each replay on `(skill, phase, round index)` with the round derived from the directory listing the way `deriveRoundWindow` (`orchestrate-dev.js:6366`, **not** `:2151` as TSPEC §7.3 states — erratum below) derives it — **never on skill alone** | TSPEC §7.3, DEC-ENG-10 neighbourhood, AT-ENG-45 | Contract | Unit | red | T34 → T49 |
| PROP-PARITY-9 | Two successive reviewer dispatches for one document **must** produce two files (`-v1`, `-v2`), never one rewritten file — the append-only round window survives the double | TSPEC §7.3, AC-1.1 cl.1(ii) | Functional | Integration | red | T34 → T49 |
| PROP-PARITY-10 | A dispatch path reaching the modules' throwing `agent()` stub (`orchestrate-dev.js:8458`) **must** propagate as an engine failure naming the missing seam and exit `1` — never be caught and turned into a skipped phase | EC-PAR-5, BR-PARITY-2, TSPEC §3.1, AT-ENG-51 | Error Handling | Integration | red | T25 → T39 |
| PROP-PARITY-11 | A phase disabled by the consumer's config **must** have its artifacts absent from PROP-PARITY-1's expected set — the oracle is over *enabled* phases, and a disabled phase is not a missing artifact | EC-PAR-4, AT-ENG-51 | Functional | Integration | red | T25 → T39 |
| PROP-PARITY-12 | The engine **must** supply exactly TSPEC §3.1's per-module seam set: `_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_runCommand`, `_git` for dev; `_agent`, `_phase`, `_log`, `_git`, `_runPipeline` for queue — with `_runCommand` non-null for dev (a null seam silently degrades Phase I's wave gate) and `_runPipeline` supplied for queue (its `:1422` call forwards no seams) | AC-1.1, BR-PARITY-2, TSPEC §3.1, AT-ENG-51 | Contract | Unit | partial — `devInjection` `run.mjs:80`, `queueInjection` `:114` exist; completion to the table is T39's | T25 → T39 |
| PROP-PARITY-13 | The `_git` seam the engine supplies **must** be a function identity distinct from the modules' own `defaultGit` (`orchestrate-dev.js:8609`), because `branchGuardTransport` (`:3487`) returns a transport only when `_git !== defaultGit`; `createGit()` (`adapter.mjs:116`) **must not** be memoised into that default | TSPEC §3.1, AC-1.1, AT-ENG-16 | Security | Unit | green at `adapter.mjs:116`; the inequality assertion is red | T20 → T35 |
| PROP-PARITY-14 | `_sessionAgent` **must** remain unwired, **and** the absence **must** be paired with its positive on the same path: two successive dispatches produce two independent sessions (two fresh contexts, not one resumed) | TSPEC §3.1, R-4, O-6, AT-ENG-51 | Contract | Unit | red (positive half absent) | T25 → T39 |
| PROP-PARITY-15 | The twelve un-overridden IO/advisory/probe seams **must** keep the modules' Node defaults, **and** those defaults **must** be shown to be exercised by a real run — `smoke.test.js` already drives the consumer-relative `_readFile`/`_writeFile`/`_listFiles`/`_checkFile`/`_hashFile`/`_git` path, so the positive reuses it rather than asserting absence alone | TSPEC §2.5, §3.1, M-ENG-03, AT-ENG-51 | Contract | Integration | partial — `smoke.test.js` tracked at HEAD (387 lines); the pairing assertion is red | T25 → T39 |
| PROP-FORK-1 | The module specifier the engine resolves for each workflow module **must** equal the repo-relative path under `pdlc/workflows/` — strictly stronger than "a `file:` URL", which is all `run.test.js:64` asserts at HEAD | AC-1.5(a), BR-PARITY-1, AT-ENG-49 | Contract | Unit | partial — `run.mjs:58` already resolves the path; the assertion at `run.test.js:64` is the weaker form | — (T10, green on landing) |
| PROP-FORK-2 | No second file named `orchestrate-dev.js` or `orchestrate-queue.js` **must** exist anywhere under the engine tree (`node_modules` excluded) | AC-1.5(b), EC-PAR-6, AT-ENG-49 | Contract | Unit | green — `run.test.js:48-62` | T10 |
| PROP-FORK-3 | Only `lib/run.mjs` **must** name a path under `pdlc/workflows/`; any other engine file naming one fails the suite | R-ARCH-1, TSPEC §2.4 | Contract | Unit | red | T39 |
| PROP-READ-1 | On one observed `pdlc dev` run, all three clauses **must** hold on the **same recording**: (a) ≥1 read of `{pluginRoot}/skills/{skill}/SKILL.md`; (b) ≥1 read of the consumer's `docs/{f}/REQ-{f}.md`; (c) **zero** paths opened under `{consumerRoot}/.claude/workflows/`. Clause (c) is unconditional for the dev module — its single occurrence of that string is `MERGE_GUARD_DEFAULTS`' prefix list (`orchestrate-dev.js:48-53`, `:52`), compared against a PR's changed files and never opened | AC-1.2, BR-READ-1, TSPEC §7.7, AT-ENG-47 | Integration | E2E | red | T33 → T43, T46 |
| PROP-READ-2 | On one observed `pdlc queue` run **with** `distribution.checkEnabled: false` configured, clause (c) **must** hold, because `parseDistributionCheckEnabledOptOut` (`orchestrate-queue.js:2068`, called `:1071-1072`) short-circuits before the drift-state read at `:64` in the else-branch (`:1074`); **without** the opt-out the same run **must** be blocked by the module's own gate and the drift-state read **must** then be observable | AC-1.2, BR-READ-1, EC-PAR-3, AT-ENG-48 | Integration | E2E | red | T33 → T43, T46 |
| PROP-READ-3 | A case that deliberately reads a file under `.claude/workflows/` inside the observation window **must** fail clause (c), and a case asserting the recording is non-empty **must** pass — the two falsifying controls that make PROP-READ-1's absence clause meaningful | TSPEC §7.7, AT-ENG-47 | Error Handling | Unit | red | T33 → T43 |
| PROP-READ-4 | The AC-1.2 consumer fixture **must** carry a **populated** `.claude/workflows/` tree, never an absent or empty one — an empty directory satisfies clause (c) for the wrong reason | TSPEC §7.7, EC-PAR-1, AT-ENG-51 | Integration | Integration | red | T46 |
| PROP-READ-5 | The `fs` recorder **must** be live for the whole run — installed by `__tests__/_bootstrap.mjs` before `runLadder` and still live after the report is stamped, covering the modules' dynamic `import()` — and **must** observe both readers through one wrapper, since the modules read through their own Node defaults (`defaultReadFile`, `orchestrate-dev.js:8492`) which are also `node:fs` | TSPEC §7.7, DEC-ENG-10 | Observability | Unit | red | T43 |
| PROP-READ-6 | Across a full fixture run the engine **must** create **no** engine-owned file under the consumer repo, **and** the same run **must** be shown to have written the consumer's own artifacts (the `docs/{f}/` set of PROP-PARITY-1) — so "wrote nothing" is distinguishable from "ran nothing" | BR-READ-3, NG-7, AT-ENG-50 | Security | Integration | red | T33 → T43 |
| PROP-READ-7 | Reads of the consumer's own `docs/**` and `.claude/pdlc.config.json`, and reads inside the engine install and the located plugin's `skills/` tree, **must not** be treated as violations by the clause-(c) matcher — the matcher is scoped to `{consumerRoot}/.claude/workflows/` and nothing else | BR-READ-2, AC-1.2 | Functional | Unit | red | T33 |
| PROP-READ-8 | A consumer repo with no `.claude/pdlc.config.json` at all **must** run under the modules' own defaults, and the engine **must** add no config file of its own to that repo | EC-PAR-2, BR-READ-3 | Error Handling | Integration | red | T25 → T39 |

## 4. Startup ladder, plugin handshake and skill-set equality (PROP-START, PROP-HAND, PROP-SKILL)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-START-1 | The ladder **must** run rungs 0, 1, 2, 3, 4, 4a, 5 in that order, and **must** be total: every rung appears in the result with a status, and a rung whose evidence is unavailable because an earlier rung failed reports `skipped` **with its reason** — never `passed` | BR-START-2, FSPEC §4.1, TSPEC §4.3, AT-ENG-06 | Contract | Unit | red — `runStartupChecks` (`startup.mjs:60`) has no structured `RungRecord[]` and no rungs 0/4a/5 | T26, T27 → T44 |
| PROP-START-2 | Two simultaneously broken rungs **must** produce **one** message listing both, not the first failure alone — an operator fixing a cron host must not need one round-trip per defect | BR-START-2, EC-START-8, AT-ENG-12 | Error Handling | Unit | red | T26 → T44 |
| PROP-START-3 | Every failing rung **must** refuse with exit `1` **and** zero dispatches attempted, asserted as three conjuncts: the exit code, the named catalogue id, and a dispatch counter observed at `0` | BR-START-1, AT-ENG-07 | Security | Unit | red | T26 → T44 |
| PROP-START-4 | No model call and no billable probe **must** be made while the ladder runs; rung 4a's interpreter probe (running a candidate) is a local check on the host's own bytes and **must not** count as a dispatch | BR-START-1, BR-GUARD-6, AT-ENG-07 | Security | Unit | red | T27 → T44 |
| PROP-START-5 | `pdlc doctor` **must** report rungs equal to the rungs a run enforces on the same fixture — one shared ladder, not a second implementation — and **must** run rung 0's working-directory half while reporting the REQ-path half as *not applicable*, never as passing | BR-START-0, BR-START-3, AT-ENG-09 | Contract | Integration | red | T26 → T44, T47 |
| PROP-START-6 | `pdlc doctor`'s report **must** carry exactly the three AC-2.1 facts — the `engineVersion`/`pluginVersion` pair, the effective base URL, and the auth catalogue id — with zero dispatches attempted and zero tokens billed | BR-START-3, AC-2.1, AT-ENG-09 | Observability | Integration | red | T26 → T44, T47 |
| PROP-START-7 | Under `--dry-run`, rungs 1–4 **must** still run and rung 5's finding **must** be reported but **must not** be fatal — the single deliberate divergence between the dry-run and run paths | EC-START-4, FSPEC §4.2, AT-ENG-12 | Functional | Unit | red | T26 → T44 |
| PROP-START-8 | The plugin handshake **must** complete before the workflow modules are imported, not merely before the first dispatch — a partially-started pipeline can commit queue rows and POSTMORTEMs to a consumer repo | C-10, FSPEC §4.2, AC-3.2 | Security | Integration | red | T26 → T44 |
| PROP-HAND-1 | A missing plugin install **must** produce a rung-1 refusal naming what was searched **and both** overrides (`--plugin-root`, `PDLC_PLUGIN_ROOT`), exit `1`, nothing dispatched | EC-START-1, AC-3.2, AT-ENG-12 | Error Handling | Unit | partial — `startup.mjs:139` names the override inline; the refusal is not a catalogue entry and rung structure is absent | T26 → T44 |
| PROP-HAND-2 | A plugin version outside the engine's declared range **must** produce a rung-3 refusal naming **three** things: the declared range, the version found (or `"not found"`), and the remedy — a refusal naming only the failure does not satisfy this | EC-START-2, FSPEC §4.3, AC-3.2, AT-ENG-08 | Error Handling | Unit | partial — `checkCompat` (`handshake.mjs:137`) and `REMEDY` (`:124`) exist; catalogue registration is red | T05 → T14, T41 |
| PROP-HAND-3 | An unparseable plugin manifest **must** produce a rung-2 refusal naming the manifest path and why it failed, and **must not** be treated as "version unknown, proceed" | EC-START-3, AT-ENG-12 | Error Handling | Unit | red | T26 → T44 |
| PROP-HAND-4 | The declared compatible range **must** live as data in one place a test can read — `pdlcPluginCompat` in the engine package manifest (`pdlc/engine/package.json`, `"^0.22.0"` at HEAD) — never as a literal in code | C-10, TSPEC §4.3 | Data Integrity | Unit | green | T41 |
| PROP-HAND-5 | The banner **and** every run report **must** carry `engineVersion` and `pluginVersion` **together as a pair**, on success and on refusal alike | C-10, FSPEC §4.3, R-6, AT-ENG-11 | Observability | Unit | partial — `buildBanner` (`handshake.mjs:183`) renders the pair; the refusal path and report pairing are red | T32 → T40, T41 |
| PROP-HAND-6 | `parseVersion` (`handshake.mjs:20`) and `satisfiesRange` (`:86`) **must** be a total comparator obeying an ordering law: total over generated version triples, antisymmetric, transitive; and a version inside a range **must** stay inside it under patch bumps | TSPEC §4.3, PLAN T41 property strategy | Functional | Unit | green (functions exist); the property strategy is red | T41 |
| PROP-SKILL-1 | The set of skill identifiers the modules can dispatch **must** equal the set of prompt files the installed plugin holds **for those identifiers** — set-equality in **both** directions, checked before any dispatch. Direction A (dispatchable ⊆ readable) refuses naming each missing identifier; Direction B (readable ⊆ dispatchable, **scoped to the dispatchable subset**) refuses naming the unreachable identifier | AC-3.5, FSPEC §4.4, AT-ENG-10 | Contract | Unit | red — HEAD is one-direction containment over frozen `EXPECTED_SKILLS` (`startup.mjs:20`) | T07, T26 → T16, T39, T44 |
| PROP-SKILL-2 | A prompt file for an **operator-invoked** skill (dispatched by no module) **must** pass rung 4 — reported, never refused; membership of the modules-derived identifier set, never a judgement about the file, decides | EC-START-7, FSPEC §4.4, AT-ENG-10 | Functional | Unit | red | T26 → T44 |
| PROP-SKILL-3 | The dispatchable set **must** be derived from the workflow modules' own exported data (`DISPATCHABLE_SKILLS`), never from a hand-typed array beside the dispatch sites and never from a source-text scanner: a scanner honouring "string literal in first argument position" derives only 5 of the 10 identifiers at HEAD | BR-START-4, DEC-ENG-05, TSPEC §3.3, AT-ENG-10 | Contract | Unit | red — `DISPATCHABLE_SKILLS` does not exist in either module at HEAD (verified: no occurrence) | T07 → T16, T39 |
| PROP-SKILL-4 | Neither direction of PROP-SKILL-1 **must** be expressed as a count (`17`, `10`, `12`): a count passes on a plugin whose files were renamed underneath it. HEAD's observed shape — 10 identifiers over 12 prompt files, 5 further operator-invoked skills — is an observation, never the assertion | BR-START-4, AC-3.5 | Contract | Unit | red | T07, T26 → T44 |
| PROP-SKILL-5 | Every skill-identifier-shaped string literal in either workflow module **must** be a member of the exported `DISPATCHABLE_SKILLS` union (DEC-ENG-05's **containment** form, **no exemption list**), and the shape predicate itself **must** be asserted against the known set rather than left to an unread regex. No absolute line number **must** appear as an oracle | DEC-ENG-05, PLAN T07/§8, AT-ENG-10 | Contract | Unit | red | T07 → T16 |
| PROP-SKILL-6 | The reference set **must** be the **union** of both modules' dispatchable sets, so `pdlc dev`, `pdlc queue` and `pdlc doctor` gate identically and a queue-only skill missing from the plugin is discovered before the queue run needing it | BR-START-4, TSPEC §3.3 | Contract | Unit | red | T39 |
| PROP-SKILL-7 | For **every** member of the dispatchable set — one `--dry-run` invocation per member, never a sample — the composed prompt **must** contain that prompt file's full text, resolved from `{pluginRoot}/skills/{skill}/SKILL.md` (or the named supplement) | AC-3.1, BR-SKILL-6, FSPEC §6.4, AT-ENG-20 | Functional | Unit | partial — `composeDispatchPrompt` (`skills.mjs:312`) composes; the per-member sweep is red | T24 → T38 |
| PROP-SKILL-8 | A dispatch **must** inline the identifier's **whole** prompt-file set — `SKILL.md` plus every supplement in that skill's directory — and the `se-implement` supplements **must** appear exactly when the module's dispatch asks for them | DEC-ENG-06, BR-SKILL-3, AT-ENG-23 | Functional | Unit | red | T24 → T38 |
| PROP-SKILL-9 | The composed prompt for the same dispatch **must** be byte-identical across both transports, asserted by comparing the two composed strings for one fixed descriptor — **and** the fixture must supply non-trivial prompt text, so the equality is not satisfied by two empty strings | BR-SKILL-2, AC-6.3, AT-ENG-22 | Contract | Unit | red | T23 → T37 |
| PROP-SKILL-10 | `--dry-run` **must** print composed prompts and execute **no** dispatch; an attempted dispatch on that path **must** be reported as a failure of the run, never silently executed | BR-SKILL-5, EC-SKILL-6, AT-ENG-24 | Security | Unit | red | T24 → T47 |
| PROP-SKILL-11 | A prompt file deleted or emptied between startup and a later dispatch **must** fail that dispatch as a transport-independent engine error naming the identifier and path — an empty role **must never** be dispatched | EC-SKILL-1, EC-SKILL-2, EC-START-6, AT-ENG-25 | Error Handling | Unit | red | T24 → T38 |
| PROP-SKILL-12 | A module dispatching an identifier startup did not know about **must** raise an engine error naming the identifier, never a best-effort dispatch with no prompt | EC-SKILL-3, AT-ENG-25 | Error Handling | Unit | red | T24 → T38 |
| PROP-SKILL-13 | A plugin upgraded mid-run **must not** change the run: it continues against the version the handshake approved, and a version change is discovered by the **next** run's handshake | EC-SKILL-4, BR-SKILL-4, AT-ENG-25 | Idempotency | Integration | red | T24 → T38 |
| PROP-SKILL-14 | `--plugin-root` naming a directory with no skills tree **must** pass rung 1 on the override and refuse at rung 4 naming every unreadable identifier — the failure is attributed to the rung that observed it | EC-START-5, AT-ENG-12 | Error Handling | Unit | red | T26 → T44 |

## 5. Auth posture, per-dispatch auth policy and environment (PROP-AUTH, PROP-ENV)

The startup posture (C-1a) and the per-dispatch assertion (C-1b) read **different evidence** and are
two properties families, not one. A run passing PROP-AUTH-1 and stopping at PROP-AUTH-8 is a correct
outcome, not a gap (BR-AUTH-6).

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-AUTH-1 | `resolveAuthPosture` **must** evaluate REQ AC-2.1's six rows as an **ordered first-match list**, returning on the first predicate that holds, with row 6's predicate literally `true` so the function is total over every environment | AC-2.1, BR-AUTH-1, TSPEC §3.2, AT-ENG-13 | Functional | Unit | red — `lib/auth.mjs` does not exist; `buildBanner` (`handshake.mjs:183`) derives the row from the CLI flag alone | T06 → T15 |
| PROP-AUTH-2 | Each of the six rows **must** be reachable by a fixture consisting of environment variables plus a scratch `HOME` with or without the `oauthAccount` record — **no operator credential in any test, including row 5** | BR-AUTH-0, TSPEC §3.2, AT-ENG-13 | Security | Unit | red | T06 → T15 |
| PROP-AUTH-3 | `ANTHROPIC_API_KEY` set to the empty string **must** count as absent (`typeof v === "string" && v.trim() !== ""`, in one helper used by every row) — an empty key cannot bill | EC-AUTH-1, TSPEC §3.2, AT-ENG-19 | Functional | Unit | red | T06 → T15 |
| PROP-AUTH-4 | Unreadable login evidence **must** be distinguished from absent evidence **in the message only, never in the row**: both leave `loggedIn: false`, so rows 2 and 4 cannot match and the list falls through to 5 or 6 by the key's presence alone | EC-AUTH-2, BR-AUTH-0, TSPEC §3.2, AT-ENG-19 | Error Handling | Unit | red | T06 → T15 |
| PROP-AUTH-5 | With both `CLAUDE_CODE_OAUTH_TOKEN` and `ANTHROPIC_API_KEY` present and no flag, the posture **must** be row 1 (`auth.oauth-token`) — the overlap case that proves first-match rather than disjoint predicates | EC-AUTH-3, AT-ENG-13 | Functional | Unit | red | T06 → T15 |
| PROP-AUTH-6 | Row 5 (`auth.api-key-refused`) **must** refuse with three conjuncts: exit `1`, a message naming the opt-in flag `auth.allowApiKeyBilling` **and** the inspected evidence path **and** `CLAUDE_CODE_OAUTH_TOKEN`, and **zero dispatches attempted** — reached from environment and settings alone, with no probe dispatch and zero tokens billed | AC-2.2, C-1a, EC-AUTH-8, AT-ENG-14 | Security | Unit | red | T06 → T15, T44, T47 |
| PROP-AUTH-7 | With the opt-in flag passed on the same state, the run **must** proceed and the banner **must** carry `auth.api-key-optin`; with the flag passed on a machine with no API key at all, the permitted set widens and **nothing else changes** | AC-2.2, EC-AUTH-6, AT-ENG-19 | Functional | Unit | partial — `bin/pdlc.mjs:88-93` widens the policy set; the banner id is red | T06 → T15, T47 |
| PROP-AUTH-8 | Every dispatch **must** assert, before the model is billed, that the transport-reported source is in the allowed policy set — literally `{"none"}` without the flag, `{"none","user","project","org","temporary"}` with it — and a value outside it **must** abort **that** dispatch naming the **raw** reported value | C-1b, BR-AUTH-4, AC-2.1, AT-ENG-17 | Security | Unit | partial — `transport.mjs:63`, `:201-206` throw `AuthPolicyError` before tools run; the per-dispatch recording and catalogue message are red | T22 → T36 |
| PROP-AUTH-9 | The assertion **must** run **per dispatch**, not once per run: a fixture whose source changes at dispatch 3 of 5 **must** stop there, with **both** observed values present in the run report | BR-AUTH-5, EC-AUTH-5, AT-ENG-18 | Security | Integration | red — `lastApiKeySource` (`adapter.mjs:245`) is a scalar overwritten per dispatch and surfaced once (`report.mjs:51`) | T22 → T36, T35 |
| PROP-AUTH-10 | The falsifier for PROP-AUTH-8 **must** exist on the same path: with the flag-widened set, the **same** fixture proceeds — proving the abort is the policy's doing and not the fixture's | BR-AUTH-4, PLAN T22 | Security | Unit | red | T22 → T36 |
| PROP-AUTH-11 | A transport reporting **no** auth source at all **must** be treated as outside the allowed set and abort naming `"absent"`; an unrecognised source **must never** be coerced onto a banner catalogue id | EC-AUTH-4, BR-AUTH-4, AC-6.4(b), AT-ENG-19 | Error Handling | Unit | red | T22 → T36 |
| PROP-AUTH-12 | AC-2.4's paired positive **must** hold on one run: banner carries `auth.session-key-ignored` (row 4), **every** dispatch reports a no-API-key source **and completes**, and the run report records that source **once per dispatch** | AC-2.4, FSPEC §5.4, AT-ENG-16 | Security | Integration | red | T06, T20 → T15, T35, T40 |
| PROP-AUTH-13 | The banner **must** carry **no** transport-reported auth source — none exists before a dispatch — and **must** carry the effective base URL | BR-AUTH-2, BR-AUTH-3, AC-2.1, AT-ENG-15 | Observability | Unit | red | T06 → T41 |
| PROP-ENV-1 | The environment a dispatch receives **must** be the parent environment **extended**, never constructed from scratch — the dispatch options' environment on the primary transport, the inherited child environment on the fallback | C-2, BR-ENV-1, AC-2.3, AT-ENG-26 | Contract | Unit | partial — `transport.mjs:159` spreads the parent env; the fallback transport does not exist | T22 → T36, T37 |
| PROP-ENV-2 | `ANTHROPIC_BASE_URL` and `ANTHROPIC_CUSTOM_HEADERS` **must** reach every dispatch unmodified, alongside the rest of the parent environment; the engine **must never** set, unset or rewrite either — including when they are absent, where nothing is invented | C-2, BR-ENV-2, EC-DISP-1, AT-ENG-26, AT-ENG-27 | Contract | Unit | red (assertion), partial (mechanism) | T22 → T36, T37 |
| PROP-ENV-3 | The proxy-variable assertion **must** range over **every** dispatch of a multi-dispatch fixture run, not the first — a run that drifted its environment after dispatch 1 must fail | BR-ENV-3, AC-2.3, AT-ENG-26 | Contract | Integration | red | T22 → T36, T37 |
| PROP-ENV-4 | An `ANTHROPIC_CUSTOM_HEADERS` value the engine cannot interpret **must** be carried through unmodified — for these two variables the engine is a courier, never a validator | EC-DISP-2, BR-ENV-2 | Functional | Unit | red | T22 → T36 |
| PROP-ENV-5 | Every dispatch's working directory **must** be the consumer repo root, on both transports; the engine's own install location **must never** become a dispatch's working directory | C-3, BR-CWD-1, AC-2.5, AT-ENG-28 | Contract | Unit | partial — `withCwd` (`run.mjs:155`) and the `cwd` option exist; the per-dispatch, both-transport assertion is red | T20, T22 → T35, T36, T37 |
| PROP-ENV-6 | One shared child-environment helper **must** serve both transports, so the extension rule has exactly one definition; a sentinel variable placed in the parent **must** be observed at both transports' boundaries | BR-ENV-1, TSPEC §3.4, PLAN T22 | Contract | Unit | red | T22 → T36, T37 |

## 6. Dispatch boundary, model forwarding and permission posture (PROP-DISP, PROP-MODEL, PROP-PERM)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-DISP-1 | The option object reaching a transport **must** be contained in the four-key set `{model, cwd, timeoutMs, maxTurns}`, and `cwd` and `timeoutMs` **must** be present on **every** dispatch — containment for the closed key set, presence for the two load-bearing ones | TSPEC §3.4, DEC-ENG-12, AT-ENG-28 | Contract | Unit | red — `transport.mjs:176-178` assigns `model`/`cwd`/`maxTurns`; `timeoutMs` is not stamped per dispatch | T22 → T36 |
| PROP-DISP-2 | The resolved `dispatch.timeoutMinutes` **must** be stamped by the adapter as `timeoutMs` on **every** dispatch, and the fixture **must** pin a non-default value: at `dispatch.timeoutMinutes: 7` the transport boundary **must** observe the literal `420000` on every dispatch of that run **and** the report's `tunables` block **must** carry the literal `7` | TSPEC §3.4, §4.6, DEC-ENG-12, PM F-02/TE F-27 | Data Integrity | Integration | red — HEAD's conditional assignment (`adapter.mjs:280`) never fires; the transport constructor default at `transport.mjs:64`/`:139`/`:152` decides | T30 → T35, T47 |
| PROP-DISP-3 | Asserting boundary-equals-report at the **default** timeout **must not** be accepted as evidence: `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` (`transport.mjs:64`) equals the tunable's own default, so a run whose config was never consulted reports `30`, is served `1800000`, and passes — self-consistent and false | TSPEC §4.6 | Error Handling | Unit | red (this is an oracle-design property; its check is that the fixture value is not the default) | T30 |
| PROP-DISP-4 | A dispatch descriptor **must** carry the `_phase` run state, prefix-normalised, so every retry, pause and denial row is attributable to a phase; the phase label **must not** be logged and discarded as it is at HEAD (`adapter.mjs:357-359`) | DEC-ENG-07, TSPEC §4.1, AT-ENG-28 | Observability | Unit | red | T20 → T35 |
| PROP-DISP-5 | A settlement line **must** be appended once per **attempt**, carrying the terminal `outcome` and `errorText`; composition-time records for the inert (dry-run) transport carry `null` terminals rather than being omitted | TSPEC §4.1, §4.4, AT-ENG-29 | Observability | Unit | red | T20 → T35 |
| PROP-DISP-6 | `createGit` (`adapter.mjs:116`) **must** return a function whose identity differs from the modules' `defaultGit` (`orchestrate-dev.js:8609`) — asserted as an inequality, since `branchGuardTransport` (`:3487`) silently degrades to an inert branch guard on equality | TSPEC §3.1, AT-ENG-16 | Security | Unit | partial — the function exists; the inequality assertion is red | T20 → T35 |
| PROP-MODEL-1 | The model a module pins **must** reach the transport untranslated, whatever the value; the engine **must** hold no model table, no alias map and no fallback list, and **must not** substitute a default of its own for a value it does not recognise | C-7, BR-MODEL-1, AC-3.3, AT-ENG-30 | Functional | Unit | partial — `transport.mjs:176` forwards `model` when defined; the unrecognised-value assertion is red | T22 → T36 |
| PROP-MODEL-2 | The comparison against M-ENG-07's pinned model map **must** be a **set-equality in both directions** over the five-configuration corpus: every recorded descriptor's model value appears in the map, **and** every one of the map's seven rows is exercised by at least one descriptor | AC-3.3, BR-MODEL-2, AT-ENG-29 | Data Integrity | Integration | red | T50 → T48, T52 |
| PROP-MODEL-3 | The corpus **must** be defined over **recorded dispatch descriptors**, never executed model calls, so no row depends on billed traffic; the `--dry-run` surface **must not** be the corpus's source, since one invocation composes one skill and exercises at most one row | BR-MODEL-3, AC-6.1, AC-3.3 | Contract | Integration | red | T50 → T48 |
| PROP-MODEL-4 | Rows 1 and 2 of the map **must** be witnessed by universal quantification over run i's Phase-I wave set, **and** run i **must** record **zero** `haiku` descriptors — the two `haiku` rows are distinct sites a healthy run reaches neither of | AC-3.3, M-ENG-07, PLAN T50 | Data Integrity | Integration | red | T50 → T48 |
| PROP-MODEL-5 | The two `haiku` rows **must** be witnessed by fixture content, not by hope: run v(a)'s reviewer fixture emits a **malformed** trailer (`VERDICT — Approve`, no colon) reaching `recoverVerdict` (`orchestrate-dev.js:7454`→`:7463`), and run v(b)'s PLAN fixture carries a task table whose header cell reads `Task` rather than `#`/`ID`, which the in-script parser rejects | AC-3.3, PLAN T48, M-ENG-07 rows 6–7 | Data Integrity | Integration | red | T48 → T50 |
| PROP-MODEL-6 | The advisory map rows **must** be witnessed with the advisory tier **enabled**, and the fallback row additionally with `fable` resolution forced to fail — row 4 witnessed as the `(F, B)` pair on `promptHash`, with `transport-contract-violation` and the injected `errorText` | AC-3.3, M-ENG-07, PLAN T50 | Data Integrity | Integration | red | T50 → T48 |
| PROP-MODEL-7 | A map row unreachable in the corpus **must** fail the set-equality; the repair **must** be the corpus or the map (both M-ENG-07's), **never** a loosened oracle | EC-DISP-6, BR-MODEL-2 | Contract | Integration | red | T50 |
| PROP-MODEL-8 | M-ENG-07's map **must** be a **transcription** in the harness, never an import of the modules' own constants (`MODEL_DEFAULT` `orchestrate-dev.js:1603`, `MODEL_IMPLEMENTATION` `:1646`, `MODEL_ADVISORY` `:1652`, `MODEL_ADVISORY_FALLBACK` `:1653`) — importing them makes the drift AC-3.3 exists to catch invisible | TSPEC §7.4, PLAN §2 | Contract | Unit | red | T50 |
| PROP-MODEL-9 | A module pinning **no** model for a dispatch **must** yield a descriptor recording `"unpinned"` rather than a fabricated value, and the transport's own default applies | EC-DISP-4, AT-ENG-32 | Data Integrity | Unit | red | T22 → T36 |
| PROP-MODEL-10 | A model the transport rejects **must** surface as a dispatch outcome; the engine **must not** retry with a different model and **must not** substitute one | EC-DISP-3, BR-MODEL-1, AT-ENG-30 | Error Handling | Unit | red | T22 → T36 |
| PROP-PERM-1 | The permission posture every dispatch carries **must** equal one named, reviewable engine setting applied uniformly on either transport; a fixture adding a per-call-site override **must** fail the test | C-6, BR-PERM-1, AC-3.4, AT-ENG-31 | Security | Unit | partial — `DEFAULT_PERMISSION_MODE = "bypassPermissions"` (`transport.mjs:89`), paired at `:170-175`; the no-override assertion and the report field are red | T22 → T36, T42 |
| PROP-PERM-2 | Every assertion that a dispatch is constrained — the delete guard above all — **must** be made on a dispatch composed with the **production** permission posture in force; an assertion made under a stricter test-only posture proves the configuration is well-formed and nothing about a production dispatch | BR-PERM-2, FSPEC §9.1, AC-5.1 | Security | Integration | red | T28 → T36, T37 |
| PROP-PERM-3 | The run report **must** record the permission posture actually in force, read from what the transport was given, never from configuration intent | BR-PERM-1, FSPEC §12.2 | Observability | Unit | red | T32 → T36, T40 |
| PROP-DISP-7 | `--cwd` naming a path that is not a git repository **must** produce a rung-0 refusal before anything is resolved, and `doctor` **must** report the same | EC-DISP-5, AT-ENG-32 | Error Handling | Unit | red | T22, T26 → T44, T47 |

## 7. Outcome taxonomy, retry machine and engine-fatal stops (PROP-FAIL, PROP-RETRY)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-FAIL-1 | Every dispatch outcome **must** land in exactly one member of the closed six-member catalogue `{ok, retryable, timeout, auth-failure, transport-contract-violation, agent-reported-failure}`, asserted as a **set-equality** against the classifier's inspectable member set | AC-4.1, BR-FAIL-1, TSPEC §5.1, AT-ENG-33 | Contract | Unit | red — `lib/outcome.mjs` does not exist; `classifyThrown` (`transport.mjs:98`) funnels into four error classes only | T04 → T13 |
| PROP-FAIL-2 | The **forward** direction (`observed ⊆ OUTCOMES`) **must** be asserted over classifications accumulated across the **whole suite** through one observation seam, not over the six provoking fixtures — a forward direction scoped to the corpus could never observe a seventh member | BR-FAIL-1, DEC-ENG-10, TSPEC §7.4, AT-ENG-33 | Contract | Integration | red | T03, T04 → T13, T19 |
| PROP-FAIL-3 | The **reverse** direction (`OUTCOMES ⊆ observed`) **must** be witnessed by a named provocation fixture per member: a completing fixture, a rate-limit fixture, a no-output-within-timeout fixture, an out-of-policy auth-source fixture, an unparseable-output fixture, and an agent-reports-failure fixture. A member no fixture reaches is a **missing fixture**, never a loosened oracle | BR-FAIL-1, AT-ENG-33 | Contract | Unit | red | T04 → T13 |
| PROP-FAIL-4 | The forward direction **must not** be allowed to pass vacuously over an empty observation set: the suite-wide assertion step **must** fail on an empty run directory | DEC-ENG-10, TSPEC §7.4, PLAN §1.1, AT-ENG-61 | Error Handling | Unit | red | T03 → T19 |
| PROP-FAIL-5 | `classifyOutcome` **must** be total: over a generated corpus of arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes) every result **must** be a member of `OUTCOMES` — never a throw, never `undefined` | AC-4.1, PLAN T04 property strategy, AT-ENG-34 | Error Handling | Unit | red | T04 → T13 |
| PROP-FAIL-6 | Unrecognised transport output **must** classify as `transport-contract-violation` — never as `ok` and never as `retryable`, since a retry loop over output nobody can parse burns wall clock with no path to progress | AC-4.1, BR-FAIL-1, EC-FAIL-1, AT-ENG-34 | Error Handling | Unit | partial — `transport.mjs:123`'s unrecognised arm yields `TransportError`; the mapping to the taxonomy member is red | T04 → T13 |
| PROP-FAIL-7 | Partially-parseable output (well-formed prefix, truncated tail) **must** classify as `transport-contract-violation` — partial output is not a partial success | EC-FAIL-1, AT-ENG-34 | Error Handling | Unit | red | T04 → T13 |
| PROP-FAIL-8 | `agent-reported-failure` **must** be passed through to the module unchanged and **must** be terminal for that dispatch: never retried, consuming no attempt beyond the one that produced it, and never appearing in a retry sequence | BR-FAIL-2, AC-4.1 | Contract | Unit | red | T04 → T13, T45 |
| PROP-FAIL-9 | An engine-fatal stop (`auth-failure`, `transport-contract-violation`) **must** leave the run report and nothing else: **no** POSTMORTEM written, **no** `halted` row committed, the feature's queue row exactly as the modules last left it — **and** the report **must** still be emitted, carrying the dispatches already made and the classification that stopped the run | BR-FAIL-3, BR-RETRY-5, EC-Q-4, AT-ENG-67 | Error Handling | Integration | red | T31, T32 → T40, T47 |
| PROP-FAIL-10 | The transport being unavailable altogether (SDK import fails, `claude` binary absent) **must** be an engine failure at exit `1` — a host problem, never a pipeline outcome | EC-FAIL-5, AT-ENG-40 | Error Handling | Unit | red | T21 → T45 |
| PROP-RETRY-1 | A `retryable` outcome **must** be retried up to `dispatch.retryAttempts` (default 3 after the first attempt) with `dispatch.retryBackoff`; a `timeout` **must** be retried **at most once**, drawing from the **same** budget, and a timeout **must never** reset that budget | AC-4.2, BR-RETRY-1, AT-ENG-35 | Functional | Unit | partial — `maxRateLimitPauses` (`adapter.mjs:57`) counts rate-limit pauses only; the shared-budget machine is red | T21 → T45 |
| PROP-RETRY-2 | All **eight** sequences of AC-4.2's table **must** be transcribed one fixture each, each asserting its total attempt count **and** its terminal classification — the table's rows are the oracle, and the explanation beneath it extends nothing | AC-4.2, FSPEC §8.2, AT-ENG-35 | Functional | Unit | red | T21 → T45 |
| PROP-RETRY-3 | The one-timeout cap **must** be **per run of a dispatch, not per attempt position**: once a dispatch has been retried after one `timeout`, a second `timeout` anywhere in its remaining attempts is terminal **even with budget left** — witnessed by the `retryable, timeout, timeout` row terminating at 3 attempts | BR-RETRY-2, AC-4.2 row 8, AT-ENG-35 | Functional | Unit | red | T21 → T45 |
| PROP-RETRY-4 | The terminal reason **must** be recorded and **must** distinguish `timeout-cap` from `budget-exhausted` — a run that stopped at the cap and one that stopped at the budget are different runs and the report must say which | AC-4.2, TSPEC §5.2, PLAN T21 | Observability | Unit | red | T21 → T45 |
| PROP-RETRY-5 | Retries **must** be per dispatch, not per phase: a dispatch succeeding on attempt 3 **must** leave the next dispatch of the same phase with a **full** budget, and nothing accumulates across dispatches | BR-RETRY-4, AT-ENG-36 | Idempotency | Unit | red | T21 → T45 |
| PROP-RETRY-6 | Each pause delay **must** be derived by BR-RETRY-3's fixed ladder: a finite positive transport-supplied retry-after wins; else a transport-supplied reset time as the remaining interval, never negative; else exponential from the 30 s base doubling per pause — every delay capped at 15 min, with jitter of at most 1 s **added, never subtracted** | BR-RETRY-3, AT-ENG-37 | Functional | Unit | partial — `computeRateLimitWaitMs` (`adapter.mjs:75`) with base `:58`, cap `:59`, jitter `:60`; the ladder's hint/reset arms and their assertions are red | T21 → T45 |
| PROP-RETRY-7 | `computeRateLimitWaitMs` **must** satisfy three laws over generated attempt indices: monotone non-decreasing in the attempt, never above the 15-minute cap, and always within the jitter band of the un-jittered value | PLAN T21 property strategy, BR-RETRY-3 | Functional | Unit | red (function green, strategy red) | T21 → T45 |
| PROP-RETRY-8 | Every pause **must** appear in the run report with its **observed** delay, so a three-pause run at 30/60/120 s is distinguishable from one at 30/30/30 s — the delay of pause *n* **must** fall in `[d, d+1000]` ms for that row's base `d` | BR-RETRY-3, FSPEC §12.2, AT-ENG-37 | Observability | Unit | red | T21 → T45 |
| PROP-RETRY-9 | A rate-limit signal arriving **after** a usable result **must** yield `ok`, with the signal recorded as a pause note rather than a failure | EC-FAIL-2, AT-ENG-40 | Functional | Unit | red | T21 → T45 |
| PROP-RETRY-10 | `dispatch.retryAttempts` configured to `0` **must** make the first `retryable` terminal, and the report **must** still carry the retry-row set as an **empty array**, never a missing field | EC-FAIL-3, BR-REP-2, AT-ENG-40 | Data Integrity | Unit | red | T21 → T45 |
| PROP-RETRY-11 | A `timeout` on the very last attempt of the budget **must** be terminal, with the cap and the budget agreeing rather than one masking the other | EC-FAIL-4, AT-ENG-40 | Functional | Unit | red | T21 → T45 |
| PROP-RETRY-12 | A retry succeeding after a pause longer than the phase's own expectations **must** yield `ok` with the pause in the report and **no** module-visible behaviour change | EC-FAIL-6, AT-ENG-40 | Idempotency | Unit | red | T21 → T45 |
| PROP-RETRY-13 | An `auth-failure` mid-run **must never** be retried: zero retries attempted, the run stops, and the message names the auth source that failed | AC-4.4, FSPEC §8.4, AT-ENG-39 | Security | Unit | red | T21, T31 → T45, T47 |
| PROP-RETRY-14 | On exhaustion the failure **must** be handed to the module, which halts the phase with its normal semantics — **positively**, the POSTMORTEM file, `halted` queue row and its pathspec-scoped commit exist (proving the engine stayed alive to record the halt); **negatively**, the set of child processes the engine started is empty at exit and the engine did not crash | AC-4.3, BR-RETRY-5, AT-ENG-38 | Integration | Integration | red | T21 → T45 |
| PROP-RETRY-15 | On the primary transport the child-process set of PROP-RETRY-14 **must** be empty **by construction** (no child is spawned); on the fallback it **must** be asserted over the children actually spawned — the negative half is scoped per transport, not asserted once | AC-4.3, FSPEC §8.3, AT-ENG-38 | Contract | Integration | red | T21, T23 → T45, T37 |
| PROP-RETRY-16 | The engine being killed mid-run **must** owe nothing special: all state is artifact-derived in the consumer repo, so re-invoking resumes exactly as it does today | EC-FAIL-7, G-6 | Idempotency | Integration | green by construction (the engine writes no run state); asserted as a no-new-state property | T33 → T43 |

## 8. Queue surface, loop stop reasons and exit codes (PROP-QUEUE, PROP-EXIT)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-QUEUE-1 | On a multi-row fixture carrying dependencies, blocked rows and a halted row, `pdlc queue` **must** select exactly the row the module's own Phase-0 triage selects — asserted against the module's selection observed on the same fixture, never against a row name the test hard-codes | AC-1.3, BR-QUEUE-1, AT-ENG-52 | Contract | Integration | red — the engine's queue path exists (`run.mjs:273`) but no test pins selection to the module's own triage | T31 → T47, T39 |
| PROP-QUEUE-2 | The engine **must** contribute no ordering preference, readiness opinion or dependency reasoning: a fixture whose *engine-plausible* order differs from the module's (e.g. a lower `Order` row that is dependency-blocked) **must** run in the module's order | BR-QUEUE-1, G-2 | Contract | Integration | red | T31 → T47 |
| PROP-QUEUE-3 | `forcePhases` **must not** be forwarded on the queue path: with the flag supplied, the descriptor the queue module receives **must** carry no `forcePhases` key — asserted on the composed input, not on downstream behaviour | BR-QUEUE-2, NG-1 | Security | Unit | red | T31 → T47 |
| PROP-QUEUE-4 | The loop **must** terminate on a decidable condition — the module reporting no ready feature — and **must not** terminate merely because a count elapsed: an unbounded loop over a fixture whose ready rows drain at iteration *n* **must** run exactly *n* iterations and exit `0` | AC-1.3, BR-LOOP-1, AT-ENG-53 | Functional | Integration | partial — `runQueueLoop` (`run.mjs:273`) stops on any non-`"ran"` outcome; the drain path is green, the halt path is not (PROP-QUEUE-6) | T31 → T47 |
| PROP-QUEUE-5 | A bounded loop stopping at its bound **must** report a termination reason **distinct** from "no ready work remains" — the two reasons **must** be different values of one field, never the same value with different prose, since an operator who cannot tell them apart believes a queue is drained when it is not | BR-LOOP-2, AT-ENG-54 | Observability | Integration | partial — `outcome: "max-passes"` vs `"idle"` exist at `run.mjs:282`/`:280`, but the CLI prints them as prose and the bound is `Infinity` when the flag is absent (`pdlc.mjs:305`) while `runQueueLoop`'s own default is `100` (`run.mjs:273`) — a bound no operator asked for | T31 → T47 |
| PROP-QUEUE-6 | Each row of BR-LOOP-4's four-row table **must** be witnessed by its own fixture: completed ⇒ continue, **halted ⇒ continue**, module-gate blocked ⇒ stop, engine refusal ⇒ stop. The two continue rows are asserted by a **subsequent iteration having run**, not by absence of a stop | BR-LOOP-4, AT-ENG-55 | Functional | Integration | red — `run.mjs:280` stops on `halted`, contradicting BR-LOOP-4's second row | T31 → T47 |
| PROP-QUEUE-7 | The four loop stop reasons **must** be asserted as a set-equality against the stop-reason function's inspectable member set, both directions, so a fifth reason cannot be added without a fixture | BR-LOOP-3, TSPEC §5.3, PLAN T31 | Contract | Unit | red | T31 → T47 |
| PROP-QUEUE-8 | Every iteration's outcome **must** be recorded per iteration and survive into the report — a loop of *n* iterations **must** yield *n* recorded outcomes, so no iteration is swallowed by a later one | BR-LOOP-3, AT-ENG-56 | Observability | Integration | red — only the last pass's report is emitted (`pdlc.mjs:317`) | T31, T32 → T47 |
| PROP-QUEUE-9 | Selection **must** re-read the queue each iteration: rows made ready by an edit *between* iterations **must** be picked up on the next one, asserted by mutating the fixture mid-loop | EC-Q-6, AT-ENG-57 | Data Integrity | Integration | red | T31 → T47 |
| PROP-QUEUE-10 | A queue with rows but none ready **must** exit `0` immediately, reporting "no ready work" — not an error, and not an empty-queue invention | EC-Q-2, AT-ENG-57 | Functional | Integration | red | T31 → T47 |
| PROP-QUEUE-11 | A queue file absent or unparseable **must** surface the module's own handling; the engine **must not** synthesise an empty queue — asserted positively, by the module's own message reaching the operator | EC-Q-1, BR-QUEUE-1 | Error Handling | Integration | red | T31 → T47 |
| PROP-QUEUE-12 | An `in-progress` row left by a killed earlier run **must** be governed by the module's lifecycle alone: the engine **must** re-invoke nothing on its own initiative, asserted as an unchanged row plus a dispatch count the engine did not inflate | EC-Q-4, G-6 | Idempotency | Integration | red | T31 → T47 |
| PROP-QUEUE-13 | `--max-iterations` with `0`, a negative, or a non-numeric value **must** be a usage error at exit `1` — **never** silently treated as unbounded | EC-Q-5, AT-ENG-57 | Error Handling | Unit | green at HEAD (`pdlc.mjs:306-308`); pinned so it cannot regress | T31 → T47 |
| PROP-QUEUE-14 | `--dry-run --loop` **must** print one iteration's composition and stop, since no feature's state advances and an iterating dry run would never terminate | EC-Q-7, AT-ENG-57 | Functional | Unit | green by ordering at HEAD (`pdlc.mjs:290-293`, the dry-run branch precedes the loop branch); pinned | T31 → T47 |
| PROP-QUEUE-15 | With no explicit bound, the loop's in-memory descriptor **must** carry `maxIterations` as `null` (meaning unbounded), not a defaulted number — a silent default is a bound the operator never asked for | BR-LOOP-2, TSPEC §5.3, PLAN T31 | Data Integrity | Unit | red — `runQueueLoop`'s parameter default is `100` (`run.mjs:273`) | T31 → T47 |
| PROP-EXIT-1 | Exit-code selection **must** be one total mapping function over the module `outcome`, and **must** be exercised through that function for every outcome the modules can produce — not re-derived at each call site | AC-1.4, §3.3, PLAN T31 | Contract | Unit | partial — `emitReport` (`pdlc.mjs:236-238`) maps centrally, but callers set `process.exitCode = 1` directly at `:128`, `:149`, `:166`, `:247`, `:256`, `:285`, `:350`, `:357` | T31 → T47 |
| PROP-EXIT-2 | A pipeline **halt or block must** exit `2`, **never** `1`: asserted on a halting fixture and a startup-refusal fixture **on the same repo**, so the difference is attributable to the outcome rather than to the environment | AC-1.4, BR-EXIT-1, AT-ENG-04 | Functional | Integration | partial — `pdlc.mjs:237` maps both `halted` and `blocked` to `2`; the same-repo paired fixture is red | T31 → T47 |
| PROP-EXIT-3 | On a halt the engine **must** stay alive long enough for the modules' records to be written: POSTMORTEM file present, `halted` queue row present, its pathspec-scoped commit present — **and then** exit `2`. The positive half is required; an exit code alone is not evidence the records were written | BR-EXIT-1, BR-RETRY-5, AT-ENG-04 | Data Integrity | Integration | red | T31 → T47 |
| PROP-EXIT-4 | Every engine refusal **must** exit `1` uniformly — startup-gate rungs 0…5, the C-1a billing refusal, the C-1b per-dispatch auth abort, usage errors, and `transport-contract-violation` — asserted over the enumerated refusal set, not over one representative | AC-1.4, BR-EXIT-2, AT-ENG-04 | Security | Integration | partial — each site returns `1`; the enumerated-set assertion is red | T31 → T47 |
| PROP-EXIT-5 | The three codes **must** be mutually exclusive over one run: no fixture may satisfy two of §3.3's meanings, and the code space the engine can produce **must** equal `{0, 1, 2}` — a stray `3` or a `127` from a shelled-out child escaping as the engine's own code is a defect | AC-1.4, §3.3, BR-EXIT-1/2 | Contract | Integration | red | T31 → T47 |
| PROP-EXIT-6 | `queue --loop` **must** exit with the **worst** iteration's code under the total order `1 > 2 > 0`: a loop whose iteration 1 halts and whose iteration 2 refuses **must** exit `1`, and the ordering **must** be asserted over all ordered pairs, not over one example | BR-EXIT-3, AT-ENG-56 | Functional | Integration | red — the loop reports only the last pass (`pdlc.mjs:317`); coincidental agreement with BR-LOOP-4's stop-on-refusal is not the ordering | T31 → T47 |
| PROP-EXIT-7 | A loop in which **every** ready feature halts in turn **must** run them all, record each halt, and exit `2` — the strongest witness that halted-continues and worst-wins compose | EC-Q-3, BR-EXIT-3, BR-LOOP-4, AT-ENG-56 | Functional | Integration | red | T31 → T47 |
| PROP-EXIT-8 | An all-completed loop **must** exit `0`, so the worst-wins order is falsifiable in the benign direction too | BR-EXIT-3, AT-ENG-53 | Functional | Integration | red | T31 → T47 |
| PROP-EXIT-9 | A non-dispatching surface that passes — `doctor`, any `--dry-run` — **must** exit `0`; a `--dry-run` on a repo whose plugin handshake fails **must** exit `1`, the gate winning over the dry run | §3.3, EC-CLI-6, BR-START-3 | Security | Unit | red for the paired assertion | T31 → T47 |
| PROP-EXIT-10 | The usage-error/refusal split **must** hold at the report boundary: a usage error (EC-CLI-2, EC-CLI-5) exits `1` and emits **no** report line; a rung-0 refusal (EC-CLI-3) exits `1` and **does** emit one — same code, different report obligation | BR-REP-0a, AT-ENG-05 | Observability | Unit | partial — `pdlc.mjs:244-248` returns before `emitReport`; the paired positive is red | T31, T32 → T47 |

## 9. Run report and tunables (PROP-REP, PROP-TUNE)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-REP-1 | The report **must** be exactly **one JSON line** and the **last** line of stdout, on a completed run **and** on a startup refusal alike — asserted by parsing the final line of captured stdout, never by searching stdout for a JSON-looking block | BR-REP-0, EC-REP-1, AT-ENG-68 | Contract | Integration | partial — the completed-run half is green (`pdlc.mjs:208-215`, emitted `:235`); the refusal half is red, refusals return before stamping (`:251-258`, `:280-286`) | T32 → T40, T47 |
| PROP-REP-2 | Progress output **must not** break the last-line guarantee: a run emitting progress lines, warnings and a multi-line startup banner **must** still yield a parseable final line | BR-REP-0, AT-ENG-68 | Contract | Integration | red | T32 → T40 |
| PROP-REP-3 | No file **may** be written for the report — in the consumer repo or anywhere else — asserted through the AC-1.2 filesystem recorder over a full run, since stdout is the report's whole delivery surface | BR-REP-0, BR-READ-3, NG-7, AT-ENG-50 | Data Integrity | Integration | red | T33, T32 → T43, T40 |
| PROP-REP-4 | A run that **died** and a run that **refused must** be distinguishable: the refusal emits the report line, the death does not — asserted as a pair on one fixture repo | BR-REP-0, EC-REP-1, AT-ENG-68 | Observability | Integration | red | T32 → T47 |
| PROP-REP-5 | A usage error (unknown command, missing positional, value flag with no value) **must** emit **no** report line while a ladder refusal **must** emit one — asserted as a pair, since both exit `1` and only the report line tells them apart | BR-REP-0a, EC-CLI-1/2/5 vs EC-CLI-3, AT-ENG-05 | Observability | Unit | partial — the no-report half is green (`pdlc.mjs:243-247`); its pair is red | T32 → T47 |
| PROP-REP-6 | Every field the modules produce **must** survive verbatim: `stampReport`'s output **must** be deep-equal to the module report on every module-owned key, and **`engine` must be the only key the engine adds** — asserted as a key-set difference of exactly one | AC-4.5, BR-REP-1, AT-ENG-58 | Data Integrity | Unit | green at HEAD (`report.mjs:70-72`, non-mutating spread); pinned so a second added key cannot slip in | T32 → T40 |
| PROP-REP-7 | Every row of FSPEC §12.2's nine-row table **must** be present on a completed fixture run — the six AC-4.5 rows and the three FSPEC-added rows alike — asserted as a **set-equality** against the block's key set, so an added field without a property fails | AC-4.5, §12.2, AT-ENG-58 | Contract | Unit | partial — `buildEngineBlock` (`report.mjs:36-57`) carries version pair, `transport`, `apiKeySource`, `baseUrl`, `pauses`, timestamps; **per-phase dispatch counts, retry rows, effective tunables and permission posture are absent** | T32 → T40 |
| PROP-REP-8 | The transport-reported auth source **must** be recorded **per dispatch**, not once per run: a fixture whose dispatches report differing sources **must** yield one row each, never a single collapsed value | §5.3, EC-REP-2, AT-ENG-58 | Security | Unit | red — a single scalar `apiKeySource` at `report.mjs:51`, sourced once from `adapter.getApiKeySource()` (`pdlc.mjs:227`) | T32 → T40 |
| PROP-REP-9 | A per-dispatch auth source differing from the startup catalogue id's implication **must** leave **both** in the report; neither **may** overwrite the other | EC-REP-2, AT-ENG-66 | Security | Unit | red | T32 → T40 |
| PROP-REP-10 | The `transport` field **must** name the transport the run's dispatches were actually made through — asserted on a fallback-transport fixture yielding a value different from the primary's, so a hard-coded constant fails | §3.2, §12.2, BR-VER-2 | Data Integrity | Unit | red — `transport: "agent-sdk"` is a literal (`report.mjs:50`), correct today only because the fallback is unwired | T32, T23 → T40, T37 |
| PROP-REP-11 | An **empty set is not a missing field**: a zero-retry run **must** carry `retries` as an empty array and every count as present-and-zero — asserted with `Object.hasOwn`-style key presence, never with a truthiness check that conflates `0`, `[]`, `undefined` and `null` | BR-REP-2, AT-ENG-59 | Data Integrity | Unit | partial — `pauses` defaults to `[]` (`report.mjs:53`); the retry rows and counts do not exist | T32 → T40 |
| PROP-REP-12 | Dispatch counts **must** be internally consistent: per-phase counts **must** sum to the recorded dispatch rows on an arbitrary run, and exact values **must** be asserted **only** on a fixture whose dispatch sequence the fixture fixes — an exact-count assertion over an arbitrary run would be a fixture-fixed expectation | BR-REP-3, AT-ENG-60 | Data Integrity | Unit | red | T32 → T40 |
| PROP-REP-13 | A rate-limit event carrying no delay value **must** record the observed delay as **unknown** — a distinguishable value, never `0` and never a fabricated estimate | EC-REP-3, BR-MSG-2, AT-ENG-66 | Data Integrity | Unit | red | T32, T21 → T40 |
| PROP-REP-14 | A startup refusal's report **must** carry the version pair, the startup auth catalogue id and an **empty** dispatch set, with no module fields to extend — the shape of BR-REP-0, not a degenerate object | EC-REP-1, BR-REP-2, AT-ENG-66 | Error Handling | Unit | partial — `stampReport(null, …)` yields `{engine}` (`report.mjs:71`), but no refusal path calls it | T32 → T47 |
| PROP-REP-15 | The report **must** be JSON-serialisable with no cycles, no `undefined` values and no non-finite numbers, over every fixture run in the suite — a report that cannot be parsed by a cron wrapper is not a report | BR-REP-0, PLAN T32 property strategy | Data Integrity | Unit | red | T32 → T40 |
| PROP-REP-16 | The startup auth catalogue **id** (not its prose) **must** appear in the report, and **must** equal the id the §5.1 first-match ladder selected on the same environment | §5.1, §12.2, AT-ENG-58 | Security | Unit | red — the block carries `apiKeySource`, not the catalogue id | T32 → T40 |
| PROP-REP-17 | The effective base URL **must** be what the §5.1 banner reported, asserted as **equality between the banner line and the report field** on one run — two independent reads of the environment that could drift are one property, not two | BR-ENV-2, §12.2 | Data Integrity | Unit | partial — `report.mjs`'s value is read straight from `process.env.ANTHROPIC_BASE_URL` (`pdlc.mjs:228`); the banner-equality assertion is red | T32 → T40 |
| PROP-TUNE-1 | `dispatch.retryAttempts`, `dispatch.retryBackoff` and `dispatch.timeoutMinutes` **must** come from engine configuration, and the **effective** value of each **must** appear in the run report — asserted on a config that differs from the defaults in all three, so defaults reported as effective values fail | BR-CLI-3, §12.2, AT-ENG-58 | Configurability | Unit | red — no tunables row in `buildEngineBlock` | T32 → T40 |
| PROP-TUNE-2 | The reported effective values **must** be the ones actually in force: a run configured with a distinctive `retryBackoff` **must** show pause delays consistent with it, tying the reported number to observed behaviour rather than to the config file the test just wrote | BR-CLI-3, BR-RETRY-3, AT-ENG-37 | Data Integrity | Integration | red | T32, T21 → T40, T45 |
| PROP-TUNE-3 | `--allow-api-key-billing` **must** be flag-only per invocation: a config file or environment variable setting it **must** change nothing, and the flag **must not** persist into a second invocation sharing the same config | BR-CLI-2, AT-ENG-03 | Security | Unit | red | T31, T32 → T47 |
| PROP-TUNE-4 | Absent configuration, the **documented defaults must** be reported as effective — `DEFAULT_TIMEOUT_MS` (`transport.mjs:64`), the retry budget (`adapter.mjs:57`) and the 30 s backoff base (`adapter.mjs:58`) — so "unset" is never reported as an empty or missing tunable | BR-CLI-3, BR-REP-2 | Configurability | Unit | red | T32 → T40 |
| PROP-TUNE-5 | The permission posture in force **must** be reported as the single named setting's value, and **must** equal the value the dispatch descriptor actually carried (`DEFAULT_PERMISSION_MODE`, `transport.mjs:89`) — not a second constant read from the same source | BR-PERM-1/2, §12.2, AT-ENG-58 | Security | Unit | red | T32, T18 → T40 |
| PROP-TUNE-6 | A malformed tunable (non-numeric, negative, absurdly large) **must** be a startup-time refusal at exit `1` naming the key — never silently clamped and never reported as if honoured | BR-CLI-3, BR-MSG-2, EC-Q-5 (by analogy) | Error Handling | Unit | red | T32 → T40 |

## 10. Guard parity and the M-ENG-09 measurement (PROP-GUARD)

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-GUARD-1 | With **no pdlc hooks registered on the host** — a scratch tree carrying neither `.claude/settings.json` hook entries nor a plugin registration — an engine-dispatched deletion of a `CROSS-REVIEW-*`, `CODE_REVIEW-*` or `ADVISORY-*` file **must** be refused when no `LEARNINGS-*.md` exists in that directory. A refusal observed on a host whose plugin hooks are live proves the host, not the engine | AC-5.1, C-5, BR-GUARD-1/3, TSPEC §6.3, AT-ENG-41 | Security | Integration | red — M-ENG-06 records no hook or settings wiring in the engine on either transport; this is the feature's largest safety gap (BR-GUARD-4) | T28 → T36, T37 |
| PROP-GUARD-2 | All **three** protected classes **must** be covered, one case each — a class omitted from the fixture set is unguarded in production and indistinguishable from a class the guard misses | AC-5.1, BR-GUARD-1, AT-ENG-41 | Security | Integration | red | T28 → T36 |
| PROP-GUARD-3 | The guard **must not** be a blanket ban: with `LEARNINGS-{f}.md` present, the **same** call on the **same** fixture **must** allow, so harvest can do its job. The deny and the allow are one property asserted as a pair — a guard that always refuses passes any deny-only test and makes Phase H impossible | AC-5.2, BR-GUARD-2, TSPEC §6.3 clause (a), AT-ENG-42 | Security | Integration | red | T28 → T36, T37 |
| PROP-GUARD-4 | The protected file **must** survive on disk, and survival **must** be falsifiable: the **same fixture running the same deletion step** under an allow verdict **must remove** the file. Without the paired removal, survival is unfalsifiable — the file survives because nobody tried to delete it | AC-5.1, TSPEC §6.3 clause (b), DEC-ORACLE-01, AT-ENG-41 | Data Integrity | Integration | red | T28 → T36 |
| PROP-GUARD-5 | The refusal **must** be **visible to the agent**: the deny's reason **must** carry the script's stderr with its byte-exact prefix and bracketed directory, since `orchestrate-dev.js` reads those bytes. An agent that cannot see the refusal continues believing the deletion happened | AC-5.1, TSPEC §6.1 step 4, §6.3 clause (c), AT-ENG-41 | Contract | Integration | red | T28 → T36 |
| PROP-GUARD-6 | Clause (c) **must** be shown to read the engine's own wiring: a deliberately mis-built configuration — matcher `"Write"` instead of `"Bash"`, or the hook path pointed at a nonexistent script — **must** produce **no** deny, and the test **must** assert that it fails. An assertion that passes against a mis-built config is reading a constant | TSPEC §6.3 clause (c), DEC-ORACLE-01, AT-ENG-41 | Contract | Unit | red | T28 → T36 |
| PROP-GUARD-7 | The dispatch the guard is asserted against **must** be composed exactly as a production dispatch is, `bypassPermissions` included (`transport.mjs:89`) — a guard proven only under a weaker posture proves nothing about the posture that ships | BR-GUARD-5, BR-PERM-2, TSPEC §6.2, AT-ENG-41 | Security | Integration | red | T28, T18 → T36 |
| PROP-GUARD-8 | Both directions **must** be asserted **per transport** — the primary through its `PreToolUse` carrier, the fallback over its recorded `--settings` fixture. One transport's green **must not** stand in for the other's | AC-5.1, AC-5.2, BR-GUARD-1, TSPEC §6.2, AT-ENG-41/42 | Contract | Integration | red | T28, T23 → T36, T37 |
| PROP-GUARD-9 | The **shipped script must** be the guard's only definition: the engine **must** invoke `{pluginRoot}/hooks/scripts/guard-harvest-before-delete.sh` and consume its exit code — asserted by pointing the configuration at the resolved plugin path, so a JavaScript reimplementation (a second definition that could drift) fails the property | NG-1, TSPEC §6.1, §6.2 | Contract | Unit | red | T28 → T36 |
| PROP-GUARD-10 | The guard configuration's **lifetime must** be per dispatch, never process-global: two dispatches **must** carry two independently-built configurations, and the fallback's temp settings file **must** be removed after its dispatch | TSPEC §6.2, BR-GUARD-1 | Data Integrity | Unit | red | T28, T23 → T36, T37 |
| PROP-GUARD-11 | The guard's own decision procedure **must** be unchanged: unparseable hook stdin exits `0` (`guard-harvest-before-delete.sh:29-30`), the scope requires both a protected class name and a removal form (`:35-38`), and a non-matching deletion (source file, scratch file) is unaffected | NG-1, EC-GUARD-5, AT-ENG-44 | Contract | Unit | green at HEAD in the script; pinned against engine-side drift | T28 → T36 |
| PROP-GUARD-12 | A host **with** the plugin's hooks registered **must** still refuse — the invariant holds under both host states, and the engine's guard **must not** double-fire into a second refusal the agent cannot interpret | EC-GUARD-1, AT-ENG-44 | Integration | Integration | red | T28 → T36 |
| PROP-GUARD-13 | `LEARNINGS-{f}.md` present but **untracked** **must** be governed by the shipped script's own definition of "exists on the branch"; the engine **must** change no part of it — asserted by equality with the script's verdict on the same tree, never by restating the definition | EC-GUARD-3, NG-1 | Contract | Unit | red | T28 → T36 |
| PROP-GUARD-14 | If the guard configuration **cannot** be carried on the transport a run would use, the engine **must** refuse to dispatch rather than dispatch unguarded — fail-closed, at startup alongside rung 5, before the repo is touched | EC-GUARD-4, C-5, TSPEC §6.4, AT-ENG-43 | Security | Unit | red | T28, T14 → T36 |
| PROP-GUARD-15 | That refusal message **must** satisfy all **three** obligations, asserted as three separate expectations: it names the missing capability, names the fallback transport as the known alternative, and states that selecting it is not yet available | EC-GUARD-4, TSPEC §6.4, AT-ENG-43 | Observability | Unit | red | T28 → T36 |
| PROP-GUARD-16 | Rung 4a **must** be a distinct question from EC-GUARD-4 and **must** fail distinctly: rung 4a asks whether the **host** can run the script, EC-GUARD-4 whether the **transport** can carry the configuration — two fixtures, two catalogue ids, neither message reachable from the other's cause | C-11, BR-GUARD-6, TSPEC §6.4, §7.8, AT-ENG-11a | Error Handling | Unit | red | T14 → T36 |
| PROP-GUARD-17 | Rung 4a **must** observe the interpreter by **running** a candidate, not by finding it on `PATH` — the Windows store stub is on `PATH` and does not run — over the shipped candidate set `python3`, `python`, `py` **in that order**, and **once at startup**, never per dispatch | C-11, BR-GUARD-6, EC-START-11, AT-ENG-11a | Security | Unit | red | T14 → T36 |
| PROP-GUARD-18 | On a host where **no** candidate runs, the ladder **must** refuse at rung 4a, dispatch nothing, and name each candidate tried, its outcome and the remedy — never "guard unavailable" alone; on a host where an **earlier candidate is present-but-not-runnable and a later one runs**, the ladder **must pass** rung 4a | C-11, BR-GUARD-6, EC-START-10/11, AT-ENG-11a | Error Handling | Unit | red | T14 → T36 |
| PROP-GUARD-19 | The engine **must not** alter the shipped script's own fail-open posture (`guard-harvest-before-delete.sh:14-21`); the plugin path keeps it. Rung 4a is a refusal to run **unattended**, not a change to the guard | NG-1, C-11, BR-GUARD-6 | Contract | Unit | green at HEAD (the script is untouched); pinned | T14 → T36 |
| PROP-GUARD-20 | The hermetic suite **must fail** when `docs/_constraints/pdlc-engine-baseline.md` carries **no M-ENG-09 row for the running `process.platform`**, with a catalogue-registered message naming the missing measurement and the opt-in command that produces it. An absent measurement is precisely the state in which §6's tests are green and prove nothing, so it must not be the state a clean run reports | AC-6.1, C-9, BR-GUARD-5, TSPEC §6.5, PLAN T29 | Data Integrity | Unit | red — `M-ENG-01…M-ENG-08` exist in the baseline file; **M-ENG-09 is absent** | T29 → T42 |
| PROP-GUARD-21 | The gate **must** assert **presence *and* consistency**, over all three cases: `denyFired: yes` with the §6.2 hook carrier shipped ⇒ green; `denyFired: no` with the hook carrier still shipped ⇒ **red**; `denyFired: no` after the guard has moved to `canUseTool` ⇒ green again. A gate green on **any** row makes every well-formedness test in §10 vacuous, proving only that a file has a line in it | AC-6.1, TSPEC §6.5, DEC-ENG-04, PLAN T29 | Data Integrity | Unit | red | T29 → T42 |
| PROP-GUARD-22 | The M-ENG-09 row **must** carry all five columns — `date`, `platform`, `transport`, `sdkVersion`, `denyFired` — and the gate **must** key on `process.platform`, **not** on the CI matrix, so a row for a different platform never satisfies the running host's obligation | C-9, TSPEC §6.5, O-ENG-T4, PLAN T29 | Data Integrity | Unit | red | T29 → T42 |
| PROP-GUARD-23 | The row **must** be produced by the **opt-in, credentialed live** measurement and by nothing else — no hermetic test may write it, since a row synthesised by the suite that consumes it is a measurement of nothing | AC-6.2, BR-VER-3, TSPEC §6.5, PLAN T42 | Data Integrity | Integration | red | T42 |

## 11. Test-suite mechanics: hermeticity, fixtures, catalogue, set-equality harness (PROP-VER, PROP-MSG, PROP-SUITE)

These properties are about the instruments the other ten sections depend on. They are load-bearing
in exactly the way §2's oracle rules describe: an instrument that cannot fail makes every property
that reads it vacuous, so each one below carries its own falsifying counterpart.

| ID | Property | Traces | Category | Level | HEAD | Task |
|---|---|---|---|---|---|---|
| PROP-VER-1 | Every test **must** build its transport through the injected seam `createTransport({ queryFn })` (`transport.mjs:135`); a test that omits `queryFn` reaches the real client via `defaultQueryFn` (`:17`) and **must** be failed by the construction guard | AC-6.1, BR-VER-1, TSPEC §7.1 | Security | Unit | red — the seam exists; the guard does not | T02 → T35 |
| PROP-VER-2 | The construction guard **must** be installed by `__tests__/_bootstrap.mjs` preloaded with `--import`, so a **new test file inherits it without opting in** — asserted by a fixture test file that opts into nothing and is still guarded. A bootstrap merely `import`ed by some files is installed only in those files' processes | AC-6.1, BR-VER-1, TSPEC §7.0, §7.1 | Security | Unit | red | T02 → T35 |
| PROP-VER-3 | The socket trap **must** patch `net.Socket.prototype.connect` and the `tls` path and fail the suite on **any** outbound connection attempt — covering both the SDK client and a `claude` child spawn | AC-6.1, BR-VER-1, AT-ENG-63 | Security | Unit | red | T02 → T35 |
| PROP-VER-4 | **The trap must itself be tested**: one test deliberately attempts a connection and **must** trip it. A trap that never fires is indistinguishable from one that was never installed — the same vacuity the catalogue and the classifier guard against | AC-6.1, BR-VER-1, DEC-ORACLE-01, AT-ENG-63 | Contract | Unit | red | T02 → T35 |
| PROP-VER-5 | **No other test may attempt a connection**: across the whole suite the trap's fire count **must** be exactly one, the deliberate one — asserted suite-wide, since a per-file count cannot see a sibling process | AC-6.1, AT-ENG-63, TSPEC §7.0 | Security | Integration | red | T03 → T35 |
| PROP-VER-6 | Layers 2 and 3 are **per process** by design, and that scope **must** hold: each is a trap in the process that could violate hermeticity, so a guard installed only in the runner parent **must** fail this property | TSPEC §7.1, AC-6.1 | Contract | Unit | red | T02 → T35 |
| PROP-VER-7 | One fixture set **must** exist per transport, recorded from that transport's real output — SDK message streams (`system/init` with `apiKeySource`, `rate_limit_event`, terminal `result`) and `claude -p` stream-json lines — and a **documented, repeatable refresh step must** exist as `__tests__/fixtures/README.md` naming the command and the redaction rules | AC-6.3, BR-VER-2, AT-ENG-64 | Configurability | Unit | red — the SPIKE recording is the only such artifact today | T05 → T35 |
| PROP-VER-8 | **No fixture may contain a credential**, and the scan **must** be paired with a positive control **in the same test**: the same scanner run over a scratch file holding one deliberately key-shaped string **must** flag it. An absence-only scan passes identically whether its pattern is right, wrong or empty | AC-6.3, BR-VER-2, TSPEC §7.2, DEC-ORACLE-01 | Security | Unit | red | T05 → T35 |
| PROP-VER-9 | The scanner's pattern **must** be the named one — `sk-ant-` followed by ≥20 `[A-Za-z0-9_-]`, plus any assignment of `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` to a non-empty value — and the README's documented rules and the scanner's pattern **must** be asserted **equal**, with the positive control carrying one instance of each rule | AC-6.3, TSPEC §7.2 | Data Integrity | Unit | red | T05 → T35 |
| PROP-VER-10 | The live smoke path **must** be opt-in behind an explicit flag and **must never** run in the default suite — asserted by the default suite recording zero live dispatches, not by reading the flag's default | AC-6.2, BR-VER-3, AT-ENG-65 | Security | Integration | red | T51 |
| PROP-VER-11 | The live path **must** assert §10.2's structural set **plus** the one thing only a live run shows: at least one cross-review round reaching a **parseable terminal verdict produced by a real model call** | AC-6.2, BR-VER-3, AT-ENG-65 | Functional | E2E | red | T51 |
| PROP-MSG-1 | Every operator-visible string — banner line, refusal, warning, failure — **must** be a registered catalogue entry, asserted **by id**, and an emitted string with **no** registered id **must** fail the suite | AC-6.4(a), BR-MSG-1, EC-REP-4, AT-ENG-61 | Contract | Integration | red | T03, T06 → T35 |
| PROP-MSG-2 | A registered id **no path can emit must** fail the suite — the direction that stops the catalogue accumulating dead entries. The fix **must** be a test that provokes the id or the entry's deletion; an exemption list is not a repair | AC-6.4(a), BR-MSG-1, EC-REP-5, AT-ENG-61 | Contract | Integration | red | T03, T06 → T35 |
| PROP-MSG-3 | The equality **must** be over ids accumulated across the **whole suite** through **one** emission seam — `message(id, …)` — never per test file, since a per-file assertion goes vacuous the moment a test is skipped | AC-6.4(a), TSPEC §7.4, DEC-ENG-10, AT-ENG-61 | Contract | Integration | red | T03 → T35 |
| PROP-MSG-4 | Every parse of transport output **must** be a total function with a defined outcome for malformed input; **no** ad-hoc pattern-matching over stderr. Two outcomes are pinned: an unrecognised auth source ⇒ dispatch aborted, **never** mapped to a banner id; unparseable transport output ⇒ `transport-contract-violation` | AC-6.4(b), BR-MSG-2, AT-ENG-62 | Error Handling | Unit | partial — `transport.mjs:123` maps unrecognised output to `TransportError`; totality over every parsed value is red | T04, T06 → T35 |
| PROP-MSG-5 | Catalogue ids **must** be stable, human-readable and namespaced by concern (`auth.*` for §5.1's posture ids, equivalently elsewhere) — asserted as a grammar over the registered set, since an operator quoting an id in a bug report must be quoting something greppable | BR-MSG-3, AC-2.1 | Observability | Unit | red | T06 → T35 |
| PROP-MSG-6 | Message **text must not** be asserted in place of the id: a property that pins prose breaks on every wording change and pins nothing about behaviour. The exceptions are the three enumerated obligations of EC-GUARD-4's refusal and the byte-exact guard stderr prefix, which are contracts other code reads | BR-MSG-1, §2's oracle rules, TSPEC §6.1 | Contract | Unit | red | T06 → T35 |
| PROP-SUITE-1 | The suite **must** be invoked through `node __tests__/_run-suite.mjs`, which **must** do exactly four things in order: mint one `PDLC_TEST_RUN_ID` and derive `PDLC_TEST_RUN_DIR`; create that directory **empty**, removing prior contents; spawn `node --test --import=./__tests__/_bootstrap.mjs __tests__/` with the id in the environment; and, **on success only**, spawn `_assert-suite-wide.mjs` and exit on its status | TSPEC §7.0, DEC-ENG-10, PLAN T03 | Contract | Unit | red | T03 → T35 |
| PROP-SUITE-2 | The run id **must** be minted **by the runner, before any child exists** — never by the bootstrap on first use. Each test file's process is a sibling: a variable a child assigns is visible to that child alone, so first-use minting yields a different id per process and a run directory holding at most its own records | TSPEC §7.0, DEC-ENG-10 | Data Integrity | Unit | red | T03 → T35 |
| PROP-SUITE-3 | The bootstrap **must only read** `PDLC_TEST_RUN_ID` and **must fail loudly** when it is unset, rather than minting a private one — the failure mode that would otherwise be repaired by scanning all run directories, walking straight back into vacuity | TSPEC §7.0 | Error Handling | Unit | red | T03 → T35 |
| PROP-SUITE-4 | Inheritance **must** be proven, not assumed: two deliberately separate test files each write one observation record, and the final step **must** require both records in **one** run directory with the run's directory count exactly one. Two directories, or one directory holding one record, fails | TSPEC §7.0, DEC-ORACLE-01, AT-ENG-61 | Contract | Integration | red | T03 → T35 |
| PROP-SUITE-5 | Stale records **must** be impossible to count as this run's observation: the runner creates the run directory empty each time, asserted by seeding a record from a prior run and requiring it to be gone | TSPEC §7.0, DEC-ENG-10 | Data Integrity | Unit | red | T03 → T35 |
| PROP-SUITE-6 | **The final step's own emptiness is a failure**: run against an empty scratch run directory, `_assert-suite-wide.mjs` **must** exit non-zero naming that, rather than asserting over an empty union — the one guard that stops the whole mechanism degrading back into vacuous green | DEC-ENG-10, TSPEC §7.0, AT-ENG-61 | Error Handling | Unit | red | T03 → T35 |
| PROP-SUITE-7 | Observations **must** be appended as JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, **append-only** and never revisited — so any observation with a terminal half **must** be appended after that half exists, which is why every dispatch line is a settlement line hanging off `_agent` (`adapter.mjs:271`), never off `composePrompt` (`:259`) | TSPEC §7.0, §4.1, PLAN T03 | Data Integrity | Unit | red | T03 → T35 |
| PROP-SUITE-8 | All **five** suite-wide assertions of TSPEC §7.4 **must** be present in `_assert-suite-wide.mjs`, riding **three** accumulators — catalogue, outcome taxonomy, model map (with the pre-phase property reading the model-map accumulator's `phase` field, and the dispatchable-skill property computed once from imported data) | TSPEC §7.4, AC-6.4(a), AC-3.3, AC-3.5 | Contract | Integration | red | T03 → T35 |
| PROP-SUITE-9 | The `_`-prefixed helpers **must** live in `__tests__/` **without** being collected as test files, reachable only by path (`--import` and step 4's explicit argument) — asserted by the collected-file count, so a helper silently executed twice is caught | TSPEC §7.0 | Contract | Unit | red | T03 → T35 |
| PROP-SUITE-10 | The parity double's negative half **must** be asserted **first**: a write-less double **must fail** the parity test. Without it a later refactor could silence the oracle and leave the suite green | AC-1.1, BR-PARITY-3, TSPEC §7.3, AT-ENG-45 | Contract | Integration | red | T34 → T39 |
| PROP-SUITE-11 | A fixture **must** be bound to a dispatch by `(skill, phase, round index)`, **never by skill alone**: keying on skill makes a round-2 reviewer dispatch replay round 1's writes, overwriting `-v1.md` instead of creating `-v2.md` — breaking the append-only property `deriveRoundWindow` (`orchestrate-dev.js:6366`; TSPEC §7.3's `:2151` is stale, PROP-PARITY-8) reads, *inside the oracle meant to prove parity* | BR-PARITY-3, TSPEC §7.3, AT-ENG-51 | Data Integrity | Integration | red | T34 → T39 |
| PROP-SUITE-12 | The double **must** derive the round index the way the module does — from the directory listing — and two successive reviewer dispatches for one document **must** produce **two files**, not one rewritten one | BR-PARITY-3, TSPEC §7.3, AT-ENG-51 | Data Integrity | Integration | red | T34 → T39 |
| PROP-SUITE-13 | The double **must not** write the approval anchors: `APPROVAL-HASH:` / `REVIEWED-COMMIT:` are the module's own append (`orchestrate-dev.js:6190`). A double that wrote them would make the anchor clause assert the fixture's bytes instead of the module's append logic | BR-PARITY-5, TSPEC §7.3, AT-ENG-45 | Contract | Integration | red | T34 → T39 |
| PROP-SUITE-14 | The oracle **must** observe **creation events**, not the surviving tree: Phase H deletes harvested review files once the LEARNINGS commit is confirmed, so a harvested file's later absence **must not** be a failure | BR-PARITY-4, TSPEC §7.3, AT-ENG-45 | Contract | Integration | red | T34 → T39 |
| PROP-SUITE-15 | The suite **must** be runnable from a fresh clone with no credential, no network and no installed plugin — the standing condition under which every property above is asserted; a property reachable only on the maintainer's machine is not a property this document owns | AC-6.1, C-9, TSPEC §7.6 | Integration | Integration | red | T03, T17 → T35 |

## 12. Negative properties — what must not happen

Every row below is a **must-not**, and every row names the **positive assertion it is paired with in
the same test file**. That pairing is the section's whole discipline: an absence asserted alone is
satisfied by a mechanism that never ran (§2's second oracle rule), so no row here is a standalone
`assert.equal(x.length, 0)`.

| ID | Must not happen | Paired positive (same file) | Traces | Level | Task |
|---|---|---|---|---|---|
| NEG-1 | The engine **must not** copy, vendor, wrap or re-implement any part of `orchestrate-dev.js` / `orchestrate-queue.js`; no second copy of a workflow module may exist under the engine tree | the resolved module locations are the repo-relative `pdlc/workflows/` paths, asserted positively (`run.mjs:58`) | AC-1.5, EC-PAR-6, PROP-FORK-1…3 | Unit | T10 |
| NEG-2 | A `pdlc dev` run **must not** open any path under `.claude/workflows/` | the same recorded read-set positively contains the `pdlc/workflows/` module paths and the consumer's `docs/{f}/` artifacts | AC-1.2, BR-READ-1, PROP-READ-* | Integration | T33 → T43 |
| NEG-3 | The engine **must not** create an engine-owned file anywhere under a consumer repo — no run state, no report file, no lock, no temp artifact left behind | the same recorded write-set positively contains the artifacts the modules do write | BR-READ-3, NG-7, AT-ENG-50, PROP-REP-3 | Integration | T33 → T43 |
| NEG-4 | A dispatch **must not** be made with an `apiKeySource` outside the policy set, and the flag **must not** be readable from config or environment | a dispatch under `{"none"}` proceeds and is recorded; the flag supplied on the command line widens the set | C-1a/C-1b, BR-CLI-2, PROP-AUTH-*, PROP-TUNE-3 | Unit | T20 → T44 |
| NEG-5 | The option object reaching a transport **must not** carry a key outside `{model, cwd, timeoutMs, maxTurns}` — no smuggled system prompt, no injected tool list, no engine-authored instruction | the four keys are positively present with the values the module supplied | AC-3.1, PROP-DISP-1 | Unit | T18 → T38 |
| NEG-6 | The engine **must not** translate, alias, default or substitute a model value, and **must not** retry a rejected model with a different one | the pinned value reaches the transport byte-identical, over the five-configuration corpus | AC-3.3, PROP-MODEL-1/10 | Unit | T18 → T38 |
| NEG-7 | `forcePhases` **must not** be forwarded on the queue path | the dev path positively forwards it | BR-QUEUE-2, NG-1, PROP-QUEUE-3 | Unit | T31 → T47 |
| NEG-8 | An engine-fatal stop **must not** write a POSTMORTEM, **must not** commit a `halted` row, and **must not** mutate the feature's queue row | the report line is positively emitted, carrying the dispatches made and the stopping classification | BR-FAIL-3, PROP-FAIL-9 | Integration | T31, T32 → T47 |
| NEG-9 | An `auth-failure` **must not** be retried and **must not** be backed off | a `retryable` on the same fixture **is** retried, so the machine is running | AC-4.4, BR-RETRY-1, PROP-RETRY-13 | Unit | T21 → T45 |
| NEG-10 | Unparseable transport output **must not** classify as `ok` and **must not** classify as `retryable` | it positively classifies as `transport-contract-violation`, and a parseable fixture positively classifies as `ok` | BR-FAIL-1, PROP-FAIL-6 | Unit | T04 → T13 |
| NEG-11 | The engine **must not** leave a child process behind after a dispatch is abandoned at the retry budget | the POSTMORTEM, `halted` row and its commit positively exist, proving the engine stayed alive to record the halt | AC-4.3, PROP-RETRY-14/15 | Integration | T21 → T45 |
| NEG-12 | An unattended run **must not** dispatch on a host where no guard interpreter runs, and **must not** dispatch on a transport that cannot carry the guard configuration | a host with a runnable interpreter and a guard-capable transport positively dispatches | C-5, C-11, EC-GUARD-4, PROP-GUARD-14/18 | Unit | T14, T28 → T36 |
| NEG-13 | The guard **must not** be a blanket ban: with `LEARNINGS-{f}.md` present, deletion **must not** be refused | with it absent the same call positively denies, and the file positively survives a real deletion attempt | AC-5.2, BR-GUARD-2, PROP-GUARD-3/4 | Integration | T28 → T36 |
| NEG-14 | The engine **must not** alter the shipped guard script, its fail-open posture, its file classes or its "exists on the branch" definition | the engine's configuration positively invokes that script at the resolved plugin path and consumes its exit code | NG-1, PROP-GUARD-9/11/19 | Unit | T28 → T36 |
| NEG-15 | The suite **must not** open a socket, construct the real SDK client or spawn a `claude` child | the deliberate connection attempt positively trips the trap, and the seam-built transport positively serves every other test | AC-6.1, BR-VER-1, PROP-VER-3/4/5 | Unit | T02 → T35 |
| NEG-16 | No fixture **must** contain a credential | the same scanner positively flags a scratch file holding one key-shaped string | AC-6.3, PROP-VER-8 | Unit | T05 → T35 |
| NEG-17 | The report **must not** be written to a file, **must not** be more than one line, and **must not** be preceded by a later line on stdout | the final captured line positively parses as the report on a completed run **and** on a refusal | BR-REP-0, PROP-REP-1/3 | Integration | T32 → T40 |
| NEG-18 | A missing field **must not** stand in for an empty one: `retries` **must not** be absent on a zero-retry run, counts **must not** be absent when zero | present-and-empty / present-and-zero are positively asserted by key presence | BR-REP-2, PROP-REP-11 | Unit | T32 → T40 |
| NEG-19 | `stampReport` **must not** mutate the module's report and **must not** add a second key beside `engine` | the module-owned keys are positively deep-equal and the key-set difference is positively exactly one | AC-4.5, BR-REP-1, PROP-REP-6 | Unit | T32 → T40 |
| NEG-20 | A set-equality **must not** be asserted in one direction only, and a forward direction **must not** be scoped to the provocation corpus that produced it | the reverse direction positively names a witness per member, and the forward direction is positively suite-wide | DEC-ENG-10, §2's rules, PROP-FAIL-2/3, PROP-MSG-1/2 | Integration | T03 → T35 |
| NEG-21 | A refusal **must not** be asserted by status alone: no property here is satisfied by "it did not proceed" | each refusal property positively pins its catalogue id, its exit code and its retained evidence | §2's rules, DEC-ORACLE-01, PROP-START-*, PROP-EXIT-4 | Unit | T14 → T36 |
| NEG-22 | A halt **must not** exit `1`, and an engine refusal **must not** exit `2` | both are positively asserted on the same repo, so the difference is the outcome's | AC-1.4, BR-EXIT-1/2, PROP-EXIT-2/4 | Integration | T31 → T47 |
| NEG-23 | The M-ENG-09 gate **must not** be green on an absent row and **must not** be green on a negative measurement the shipped mechanism has not responded to | a consistent row positively passes, in all three of TSPEC §6.5's cases | AC-6.1, PROP-GUARD-20/21 | Unit | T29 → T42 |
| NEG-24 | The parity double **must not** be write-less, **must not** key fixtures by skill alone, and **must not** write approval anchors | each has its positive counterpart asserted in `parity.test.js` before the clause it enables | AC-1.1, BR-PARITY-3/5, PROP-SUITE-10…13 | Integration | T34 → T39 |
| NEG-25 | The live smoke path **must not** run in the default suite, and no default-suite test **must** read a credential | the flag-gated run positively performs one real dispatch reaching a parseable terminal verdict | AC-6.2, BR-VER-3, PROP-VER-10/11 | Integration | T51 |

## 13. Property-based testing strategies

Five components in this feature are parameterisable functions whose contracts are **universally
quantified** — "for every thrown value", "for any environment", "for every attempt index". Example
tests under-serve those contracts: they pin the cases the author thought of, and the failures that
matter are the ones nobody thought of. Each strategy below names the generator, the laws, and the
**counter-property** that proves the generator is reaching the interesting region — a generated
corpus that only ever produces well-formed input is an expensive way to write one example.

| Strategy | Component (HEAD anchor) | Generator | Laws asserted | Counter-property | Properties | Task |
|---|---|---|---|---|---|---|
| S-1 | `classifyOutcome` (`lib/outcome.mjs`, to be created; today's four classes at `transport.mjs:23`/`:33`/`:46`/`:55`) | arbitrary thrown values: strings, numbers, `null`, `undefined`, plain objects, `Error`s with and without `cause`, nested causes, objects with a throwing `message` getter, frozen objects | **totality** — every result is a member of `OUTCOMES`; never a throw, never `undefined`; and **determinism** — the same input classifies identically twice | a deliberately unmapped shape is generated and **must** classify as `transport-contract-violation` rather than falling off the end; the corpus is asserted to contain ≥1 value of each generated shape, so a generator that degenerated to strings fails | PROP-FAIL-5, PROP-FAIL-6, PROP-FAIL-7 | T04 → T13 |
| S-2 | `resolveAuthPosture` (`lib/auth.mjs`, to be created; the six rows of the startup catalogue) | the generated **product** of the six rows' input predicates over a scratch `HOME` and environment — each of `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, a credentials file, a subscription token, `ANTHROPIC_BASE_URL` present / absent / present-but-empty / present-but-unreadable | **exactly one** of the six rows matches any environment, so first-match order can never be masking an overlap; and the resolution is **total** — no environment falls through to no row | an environment deliberately satisfying two rows' surface conditions is generated and **must** still yield exactly one match, with the earlier row winning by the catalogue's stated order — not by list position accident | PROP-AUTH-*, PROP-ENV-* | T06 → T44 |
| S-3 | `computeRateLimitWaitMs` (`adapter.mjs:75`; base `:58`, cap `:59`, jitter `:60`) | generated attempt indices, including 0, 1, the budget boundary and absurdly large values; and generated transport hints (finite positive retry-after, reset timestamps in the past and the future, `null`, `NaN`, negative) | **monotone non-decreasing** in the attempt; **never above** the 15-minute cap; **always within the jitter band** of the un-jittered value, with jitter **added, never subtracted**; and BR-RETRY-3's ladder order honoured — hint beats reset beats exponential | a reset timestamp in the past **must not** yield a negative delay, and a `NaN` hint **must not** propagate into the delay; both are generated deliberately, since they are the values a real transport actually emits | PROP-RETRY-6, PROP-RETRY-7, PROP-RETRY-8 | T21 → T45 |
| S-4 | `resolveTunables` (`lib/…`, to be created; TSPEC §4.6's five rows) | generated `(flag, config, default)` triples over the five tunables, each source independently present / absent / present-and-malformed | the resolution is a **total function** whose result equals the **highest-precedence present** source; the two operator-owned rows (`--allow-api-key-billing`, `--max-iterations`) **never** read config; and every resolved value appears in the report as the effective one | the fixture pins `dispatch.timeoutMinutes: 7` ⇒ literal `420000` at the boundary and `7` in the report, precisely because `DEFAULT_TIMEOUT_MS` equals the tunable's own default (`transport.mjs:64`) and an assertion taken at the default is self-consistent and false | PROP-TUNE-1…6, PROP-DISP-3 | T30 → T44 |
| S-5 | `parseVersion` / `satisfiesRange` (`lib/handshake.mjs:20`, `:86`) | generated version triples, including pre-release and build-metadata suffixes, leading zeros, missing components and non-numeric segments | the comparator's **ordering laws** — totality, antisymmetry, transitivity — plus the round-trip that a version inside a range **stays** inside it under patch bumps | a malformed version **must** be rejected rather than silently ordered, so the handshake refuses instead of comparing garbage | PROP-HAND-*, PROP-VER-* | T41 |

**Two rules govern all five**, and both come from this document's own oracle discipline:

1. **A generated corpus never replaces a named fixture for a set-equality's reverse direction.**
   Generation shows a law holds over a region; it cannot witness that a specific member is
   reachable. So S-1 satisfies PROP-FAIL-5's totality but contributes nothing to PROP-FAIL-3, whose
   six provocation fixtures remain named and individually written.
2. **A failing case is minimised and then transcribed as a permanent example test.** A property run
   that goes green again after a seed change has recorded nothing; the transcription is what makes
   the regression durable, and it is the fixture a future reader will actually read.

Components deliberately **not** given a property strategy, with the reason each is example-tested
instead: the exit-code mapping (three values — enumeration is exhaustive and generation would be
theatre), `stampReport` (one structural law, asserted directly as a key-set difference), the loop's
stop-reason function (four members, enumerated), and the guard configuration builder (its input is
one plugin root, not a space).

## 14. Coverage matrix — acceptance criteria to properties

One row per acceptance criterion of REQ v0.10, all 26. The **set of criteria is the REQ's**, not a
range: a criterion with no property is a gap, and §16 carries it rather than this table dropping it.
Reading in the other direction — properties to criteria — every property row above carries its own
`Traces` cell, so this table is a completeness check, not the only path between the documents.

| AC | Criterion | Properties | Covered |
|---|---|---|---|
| AC-1.1 | parity with a Claude Code run | PROP-PARITY-1…7, PROP-PARITY-11, PROP-SUITE-10…14 | yes |
| AC-1.2 | the run observed at the filesystem level | PROP-READ-1…8, PROP-REP-3 | yes |
| AC-1.3 | queue surface, both stop reasons | PROP-QUEUE-1…15 | yes |
| AC-1.4 | a halt exits `2`, not `1` | PROP-EXIT-1…10, PROP-RETRY-14 | yes |
| AC-1.5 | the engine is not a fork | PROP-FORK-1…3, PROP-PARITY-12…15 | yes |
| AC-2.1 | startup banner, six ordered auth rows | PROP-AUTH-1…7, PROP-AUTH-13, PROP-START-5/6, PROP-HAND-5, PROP-REP-16/17 | yes |
| AC-2.2 | a key present without opt-in ⇒ refusal | PROP-AUTH-6, PROP-AUTH-7, PROP-EXIT-4, PROP-TUNE-3 | yes |
| AC-2.3 | proxy environment reaches every dispatch | PROP-ENV-1…4 | yes |
| AC-2.4 | logged-in session, key ignored | PROP-AUTH-5, PROP-AUTH-12 | yes |
| AC-2.5 | dispatch cwd is the repo, per dispatch | PROP-ENV-5, PROP-ENV-6, PROP-DISP-1, PROP-DISP-7 | yes |
| AC-3.1 | a dispatch composes for every skill in the set | PROP-SKILL-7…14, PROP-DISP-1…6 | yes |
| AC-3.2 | no plugin installed ⇒ a legible refusal | PROP-HAND-1…4, PROP-START-3 | yes |
| AC-3.3 | the pinned model map, both directions | PROP-MODEL-1…10 | yes |
| AC-3.4 | the permission posture is explicit | PROP-PERM-1…3, PROP-GUARD-7, PROP-TUNE-5 | yes |
| AC-3.5 | dispatchable ≡ readable, both directions | PROP-SKILL-1…6 | yes |
| AC-4.1 | the six-member outcome taxonomy | PROP-FAIL-1…8 | yes |
| AC-4.2 | retry budget and the timeout cap | PROP-RETRY-1…4, PROP-RETRY-6…12 | yes |
| AC-4.3 | exhausted retries surface legibly | PROP-RETRY-14, PROP-RETRY-15, PROP-FAIL-10 | yes |
| AC-4.4 | a mid-run `auth-failure` is fatal, never retried | PROP-RETRY-13, PROP-FAIL-9, PROP-RETRY-5 | yes |
| AC-4.5 | the report carries module fields plus the engine block | PROP-REP-1…17, PROP-TUNE-1…6, PROP-PARITY-7 | yes |
| AC-5.1 | the guard refuses with `LEARNINGS` absent, per transport | PROP-GUARD-1, PROP-GUARD-2, PROP-GUARD-4…10, PROP-GUARD-12…19 | yes |
| AC-5.2 | harvest's deletions succeed once it exists | PROP-GUARD-3, PROP-GUARD-11 | yes |
| AC-6.1 | a hermetic suite, observed rather than asserted | PROP-VER-1…6, PROP-SUITE-1…9, PROP-SUITE-15, PROP-GUARD-20…22 | yes |
| AC-6.2 | the opt-in live smoke path | PROP-VER-10, PROP-VER-11, PROP-GUARD-23 | yes — **evidence is operator-recorded**, not suite-observed (PLAN §8); no hermetic command observes it |
| AC-6.3 | per-transport recorded fixtures | PROP-VER-7, PROP-VER-8, PROP-VER-9, PROP-SKILL-9, PROP-REP-10 | yes |
| AC-6.4 | the closed message catalogue, both directions | PROP-MSG-1…6, PROP-FAIL-1, PROP-AUTH-11 | yes |

**Constraints, separately.** Constraints are not acceptance criteria and a criterion-only matrix
would leave them unchecked, so the six this document can observe are listed here with the properties
that carry them: **C-1a/C-1b** (two-part auth policy) — PROP-AUTH-6…12; **C-5** (guard parity) —
PROP-GUARD-1…15; **C-8** (closed message catalogue) — PROP-MSG-1…6; **C-9** (per-platform
measurement) — PROP-GUARD-20…22, PROP-SUITE-15; **C-11** (fail-closed interpreter precondition) —
PROP-GUARD-16…19; **NG-1** (the pdlc semantics are unchanged) — PROP-PARITY-*, PROP-FORK-*,
PROP-GUARD-9/11/13/19, PROP-QUEUE-1/2/3.

## 15. Coverage matrix — properties to PLAN tasks and test files

Every property row above carries its own `Task` cell — the red task that writes it and, where they
differ, the green task that makes it pass. This table rolls those up **per test file**, which is the
view an implementer opens: it answers "what am I writing in this file, and what must be true before
I can". A property whose test file has no PLAN task is a gap, and §16 carries it.

| Test file | Properties | Red task | Green task | Prerequisite |
|---|---|---|---|---|
| `__tests__/outcome.test.js` | PROP-FAIL-1…8 | T04 | T13 | T00 |
| `__tests__/catalogue.test.js` | PROP-MSG-1…6 | T05 | T35 | T00 |
| `__tests__/auth.test.js` | PROP-AUTH-1…7, PROP-AUTH-13 | T06 | T44 | T00 |
| `pdlc/workflows/__tests__/dispatchableSkills.test.js` | PROP-SKILL-1…6 | T07 | T16 | T00 |
| `__tests__/handshake.test.js` | PROP-HAND-1…6 | T41 (green on landing) | — | T26 |
| `__tests__/startup.test.js` | PROP-START-1…8, PROP-GUARD-16…19 | T14 | T36 | T00 |
| `__tests__/dispatch.test.js` | PROP-DISP-1…7, PROP-SKILL-7…14 | T24 | T38 | T18 |
| `__tests__/adapter-retry.test.js` | PROP-RETRY-1…16, PROP-FAIL-9/10 | T21 | T45 | T13 |
| `__tests__/exit-loop.test.js` | PROP-QUEUE-1…15, PROP-EXIT-1…10 | T31 | T47 | T14 |
| `__tests__/report-engine.test.js` | PROP-REP-1…17 | T32 | T40 | T14 |
| `__tests__/tunables.test.js` | PROP-TUNE-1…6 | T30 | T44 | T14 |
| `__tests__/env-cwd.test.js` | PROP-ENV-1…6 | T22 | T36, T37 | T18 |
| `__tests__/model-map.test.js` | PROP-MODEL-1…10 | T50 | T48, T52 | T18 |
| `__tests__/permission.test.js` | PROP-PERM-1…3 | T22 | T36 | T18 |
| `__tests__/guard-parity.test.js` | PROP-GUARD-1…15 | T28 | T36, T37 | T14, T18 |
| `__tests__/guard-measurement-gate.test.js` | PROP-GUARD-20…22 | T29 | T42 | T28 |
| `__tests__/live/guard-measurement.test.js` | PROP-GUARD-23, PROP-VER-10, PROP-VER-11 | — (flag-gated) | T51 | T42 |
| `__tests__/fs-observation.test.js` | PROP-READ-1…8 | T33 | T43 | T12 |
| `__tests__/parity.test.js` | PROP-PARITY-1…11, PROP-SUITE-10…14 | T34 | T39 | T18 |
| `__tests__/seam-contract.test.js` | PROP-PARITY-12…15 | T25 | T35 | T16 |
| `__tests__/run.test.js` | PROP-FORK-1…3 | — (green on landing, §5's batch-2 gate exemption) | T10 | T00 |
| `__tests__/hermeticity.test.js` | PROP-VER-1…6 | T02 | T35 | T00 |
| `__tests__/fixtures.test.js` | PROP-VER-7, PROP-VER-8, PROP-VER-9 | T05 | T35 | T00 |
| `__tests__/suite-mechanics.test.js` | PROP-SUITE-1…9, PROP-SUITE-15 | T03 | T35 | T11 |
| `__tests__/_assert-suite-wide.mjs` (a step, not a test file) | the suite-wide halves of PROP-FAIL-2, PROP-MSG-3, PROP-MODEL-2, PROP-SKILL-3, PROP-DISP-4 | T03 | T35 | T11 |

**Three ordering facts an implementer needs from this table.** The suite-wide step (T03/T11) is a
prerequisite of every set-equality's forward direction, so it lands before the properties that read
it. The guard-measurement gate (T29) and its first row (T42) land in the **same batch** — introducing
the gate without the local row leaves the pipeline red for a reason unrelated to the change that
turned it red. And `run.test.js` is **green on landing**, exempt from the batch-2 red-terminal gate:
a passing test there is the intended outcome, not a defect.

## 16. Gaps, risks and open items

### 16.1 Errata raised against upstream documents

Emitted as errata rather than edited here, per the pipeline's routing rule — a defect in an upstream
document is fixed by that document's author, not by the reader who found it.

```
ERRATUM: TSPEC: §7.3 cites `orchestrate-dev.js:2151` for `deriveRoundWindow`; at HEAD that line is
the `out-of-envelope` return inside the envelope check, and `export function deriveRoundWindow` is
`orchestrate-dev.js:6366`. The claim the citation supports (the double must derive the round index
from the directory listing the way the module does) is correct and unaffected — only the anchor is
stale. Same anchor appears in the CLAUDE.md review-loop section, which is repo documentation rather
than a pipeline artifact and is noted here for the operator rather than routed.
```

### 16.2 Gaps this document cannot close

| # | Gap | Why it is open | Who closes it |
|---|---|---|---|
| G-PROP-1 | **No property here proves that a real runtime consults the guard.** PROP-GUARD-1…15 prove the engine *builds and honours* the guard configuration; that the SDK feeds a `PreToolUse` deny back to the agent under `bypassPermissions` is the SDK's contract, and only §10's live measurement observes it. Until M-ENG-09 carries a row, §10's hermetic properties are the *shape* of the answer, not the answer | the boundary is stated in TSPEC §6.3 and is a property of the transport, not of this feature's code | the credentialed live run (T42), scheduled **before any unattended use** (BR-GUARD-4) |
| G-PROP-2 | **The fallback transport's properties are asserted over recorded fixtures alone.** Every "per transport" property's fallback half reads a fixture, because the suite may not spawn a `claude` child (PROP-VER-3). A fallback contract change is therefore caught only when the fixture is refreshed | the same trade AC-6.3 makes deliberately: hermeticity over live coverage | the documented refresh step (PROP-VER-7), run on each CLI upgrade |
| G-PROP-3 | **`_sessionAgent` stays unwired, so no property covers session resumption.** PROP-PARITY-14 asserts the absence *and* its positive (two dispatches ⇒ two independent sessions), which is the honest statement of today's behaviour — but the delta-scoped review economics the workflow describes are untested on the engine because they are unreachable | the seam is deferred, not defective | a later feature; the property is written the day the seam is wired |
| G-PROP-4 | **Per-platform coverage is not delivered by CI.** The `engine-tests` job runs one platform (`pr-tests.yml:40`, `ubuntu-latest`); every other platform's M-ENG-09 row is a maintainer hand-measurement. PROP-GUARD-22's `process.platform` keying makes that honest rather than hidden, but an off-matrix contributor meets a red suite for a measurement they cannot take | O-ENG-T5, still open in TSPEC §9.2 | the operator, by deciding what an off-matrix host should do with that red |
| G-PROP-5 | **AC-6.2's evidence is operator-recorded, not suite-observed.** PROP-VER-10/11 are real properties, but no command in the PLAN's §11 observes them; the trace is a dated line beside M-ENG-06/M-ENG-09 naming the commit the live smoke ran against | the live path is credentialed by construction | T51, with T53 owning the recorded line |
| G-PROP-6 | **Timing-dependent properties are asserted over the seam, not the clock.** PROP-RETRY-8's `[d, d+1000]` band and PROP-RETRY-1's budget are asserted over recorded pause rows with an injected clock; a real-time flake would make them worthless. No property here asserts wall-clock behaviour of the shipped binary | deliberate: a clock-dependent oracle is a flaky oracle | nobody — this is the intended posture, recorded so a later author does not "improve" it |

### 16.3 Risks in the properties themselves

- **The suite-wide accumulator is a single point of vacuity.** Five set-equalities read one
  mechanism (PROP-SUITE-1…9). If it silently degrades — a missing run id, a stale directory, a
  sibling process writing elsewhere — the forward directions pass over a thin set rather than
  failing. PROP-SUITE-4 and PROP-SUITE-6 exist precisely to make that failure loud, and they are the
  two properties in this document whose own regression would be hardest to notice. They are worth
  re-reading before any change to the runner.
- **Fixture-fixed expectations are the standing hazard of §3.** PROP-PARITY-1's expected filename
  set is derived from the fixture's own rules (PROP-PARITY-2), but a future author under time
  pressure will be tempted to paste a filename list. PROP-PARITY-3's closure clause is the guard.
- **`isComplete`-style containment is not used here.** Every set-equality in this document is over
  identifiers or filenames, never over prose headings, so none of them can pass by containing a
  word. That is deliberate and worth preserving.

### 16.4 What a reviewer should check first

1. Every **must-not** in §12 has a named positive in the same file — the single rule that keeps this
   document from being a list of things that pass on an engine that does nothing.
2. Every set-equality names **both** directions and says where each is observed (per test, or
   suite-wide through the seam).
3. Every property whose HEAD column says *green* or *partial* cites a `file:line` a reviewer can
   open, and every *red* one names the PLAN task that turns it green.
