# PROPERTIES — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → PLAN → **PROPERTIES**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11), `FSPEC-pdlc-engine-distribution.md` (v0.5), `TSPEC-pdlc-engine-distribution.md` (v0.12), `DECISIONS-pdlc-engine-distribution.md` (v0.3), `PLAN-pdlc-engine-distribution.md` (v0.6) |
| Downstream | IMPL tests — the test files named in PLAN §2's `Test File` column and §3's ownership manifest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft in review (Phase PT) | Claude | 0.3 | 2026-08-14 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |
| 0.2 | Oracle and fixture material given top-level homes, so the document's structure matches its content. §6 retitled to name the **oracles** it audits (its rows were already oracle-by-oracle). New **§8 Fixtures and generators** collects the fixture corpus the §2/§3 properties already depend on — the eight branch fixtures, the two marked plugin roots, the mutated `pr-tests.yml` copies, the sixth-commit-site falsifier source, the non-empty baseline artifacts, the class-9 run, the guard-defeating direct run, the whole-artifact fixtures and the fixture machine — plus T03's three bounded generators and the three generator-hygiene rules (explicit printed seed, pinned counter-examples, non-zero per-member assertion count). Open questions renumbered §8 → §9. No property added, removed or restated |
| 0.3 | **Round-1 cross-review findings addressed (PM F-01, F-02 High; PM F-03, F-04, F-05; SE F-01, F-02; SE F-03, F-04 Low).** A targeted edit: no settled decision re-opened, no task graph or ownership manifest change, and §4's set-equality against FSPEC §8 preserved. **PM F-01 / F-02 (the blocking pair): AC-1.1's plugin-compat half now has carriers.** New **PROP-LAUNCH-9** carries AT-1.1 — the refusal names the declared range, states `not found`, dispatches nothing (count `=== 0`) and leaves the consumer tree byte-identical against a non-empty pre-state — and **PROP-LAUNCH-2 is restated on AT-1.2's actual subject**, the *installed plugin version* outside `pdlcPluginCompat` (`checkCompat(range, pluginVersion)`, `lib/handshake.mjs`), not the consumer's engine pin (T-5), which was unimplementable as written and duplicated PROP-VER-5. PROP-LAUNCH-1 keeps its `store.empty` content and is re-traced to AC-5.5 / TSPEC §6.2 as the engine-store half, listed in §4's no-`AT-`-row paragraph; PROP-LAUNCH-4 gains AT-1.3's two refusal states per PLAN T15(f). §4's AT-1.1 row and §5's REQ-EDIST-01 row follow. **PM F-03:** PROP-LAUNCH-5 pins AC-1.4's triple **per member** (engine version, declared range, plugin version or the literal `not found`), so three placeholders no longer satisfy the three-way equality. **PM F-04:** PROP-VER-14 gains the non-regression conjunct naming the only HEAD assertions on `REMEDY`'s content (`handshake.test.js:116-117`, `:125`) and states that the `--dev PDLC_PLUGIN_ROOT=…` form keeps both substrings, so no unowned file reddens. **PM F-05 / SE F-03:** PROP-REGR-1 gives `ci-arrangement.test.js` the dual floor its own rule requires (≥ 6 executed from ≥ 2 sites, measured `1..2` / `# tests 6` at HEAD) and states the site-counting method inline, since a naive `grep -c 'test('` on `skills-composition.test.js` returns 20; §1's floor list follows. **SE F-01:** PROP-CAT-2 inherits PROP-CAT-4's conditional marking — eleven or twelve ids under the open TSPEC §10.3 / §9.3 erratum — and §5's REQ-EDIST-05 row is footnoted. **SE F-02:** §7's Unit row is defined by scope of assertion (single module or function over injected seams) instead of by reachability, which did not discriminate. **SE F-04:** PROP-PACK-7's positional anchor gains the "at HEAD" qualifier PROP-PROV-15 carries. **PM Q-02** is answered in §4: AC-1.5's primary evidence is PROP-PUB-9/PROP-PUB-10, T52's `[manual]` record being confirmation on the real channel. Counts follow: 89 properties, column sum 95, Unit 74 |

## 1. Scope, derivation and reading rules

This document states the properties the implementation must satisfy. It is derived from REQ's six
requirements (`REQ-EDIST-01`…`REQ-EDIST-06`) and their acceptance criteria, FSPEC's business rules
and its `AT-` acceptance tests, TSPEC's oracle designs, and PLAN's task table. It adds no scope:
**every property below is carried by a task that already exists in PLAN §2, and names a test file
that already appears in PLAN §3's ownership manifest.** Where a property has no carrier, §5 says so
in those words rather than implying one.

**Reading rules.**

1. **Identifiers.** `PROP-{DOMAIN}-{N}`, with `{DOMAIN}` one of `LAUNCH`, `INSTALL`, `PACK`, `PUB`,
   `PROV`, `VER`, `CAT`, `GATE`, `REGR`. Numbers are stable; a withdrawn property keeps its number
   and is marked withdrawn rather than being reused.
2. **Citations.** Per `DEC-DOC-01` (`docs/_decisions/DECISIONS-review-severity-bars.md`), citations
   name **stable content** — an exported symbol, a heading, a spec id — not a line number. A
   `file:line` anchor appears only where the *position* is itself the claim under test (PLAN §2's
   `run.test.js` restatements and `build-runtime.mjs`'s two generated closures are the only such
   cases, and each is marked).
3. **Expected-set ownership.** Where a property asserts a set equality, the expected side has exactly
   one named owner and the test *transcribes* it. Per REQ v0.11's `AC-1.3` split: the packed set's
   **member names** are owned by TSPEC §5.4's `PK-*` table, and its **classes and per-class counts**
   by FSPEC §5.2. No property derives an expectation from the artifact under audit — a self-derived
   expectation is what `BR-8.1` forbids and what makes an equality vacuous.
4. **Fixture strings are verbatim.** Where a property names a literal — a message id such as
   `env.plugin-root-ignored`, a remedy string, a job name, an `Engine` column header — the fixture
   uses the normative spelling from the owning document, never a paraphrase.
5. **Test level** is one of Unit, Integration, or Machine. **Machine** means a leg that only runs on
   the fixture machine workflow (`.github/workflows/fixture-machine.yml`, T50) or a `[manual]`
   recorded observation (T51, T52, T56); it is called out because a Machine-level property is not
   observed by `cd pdlc/engine && npm test`.

**Two invariants of the existing suite constrain every property here, and both are verified at
HEAD.**

- **The message catalogue is set-equal in both directions.** `checkMessageCatalogue` in
  `pdlc/engine/__tests__/_assert-suite-wide.mjs` compares the ids `messageIds()` registers against
  the ids the run emitted and pushes a failure for *either* `emitted message id "…" not registered
  in messageIds()` or `registered message id "…" never emitted` (read at HEAD). So no property may
  ask for a registration without also asking for an emission in the same task — see `PROP-CAT-1`.
- **The injection key lists are a hand-maintained mirror.** `TSPEC_3_1_DEV_SEAMS` and
  `TSPEC_3_1_QUEUE_SEAMS` in `pdlc/engine/__tests__/seam-contract.test.js` are frozen literal key
  lists compared by `deepEqual` against `devInjection` and `queueInjection` (`pdlc/engine/lib/run.mjs`).
  Adding `_provenance` reddens them, which is why `PROP-PROV-9` states the mirror as a property
  rather than leaving it to be discovered.

**Preservation floors.** Five engine test files are *extended*, not created. Their HEAD test counts,
measured by the runner and recorded in PLAN §5.1 / §7 item 2, are floors that must survive the
deletion they guard: `engine-config.test.js` ≥ 9, `run.test.js` ≥ 21, `skills-composition.test.js`
≥ 32 from ≥ 14 `test(` call sites, `ci-arrangement.test.js` ≥ 6 from ≥ 2 `test(` call sites,
`seam-contract.test.js` ≥ 12 — with "call site" defined as PROP-REGR-1 defines it, a top-level
`test(` call, excluding `.test(` regex predicates and comment mentions. Each
floor is stated as a property (`PROP-REGR-1`) with a **positive-presence** conjunct — the named HEAD
assertions are present in the file *and* execute — because a count alone is satisfiable by padding.

## 2. Property catalogue

### 2.1 PROP-LAUNCH — launcher resolution and refusal (REQ-EDIST-01)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-LAUNCH-1 | With no engine version installed, an invocation **must refuse** with a message that (a) names the store root it searched, (b) names the reason id `store.empty`, and (c) exits non-zero with the pipeline's own refusal code — never a bare `!= 0` against an unstated baseline. This is the **engine-store** refusal, not the plugin-handshake one: it says nothing about `pdlcPluginCompat`, and AT-1.1's criterion is carried by PROP-LAUNCH-9. | Error Handling | Unit | AC-5.5, TSPEC §6.2 | T15, T14 → `version-doctor.test.js`, `launcher.test.js`; T46 → `bin/cli.mjs` |
| PROP-LAUNCH-2 | **An installed plugin whose version falls outside the engine's declared `pdlcPluginCompat` range must refuse, naming both the range and the version found.** The subject is the version `readPluginVersion` reports for the *installed* plugin, which is what `checkCompat(engineCompatRange, pluginVersion)` takes (`pdlc/engine/lib/handshake.mjs`, `checkCompat`) — **not** the consumer's engine-version pin (T-5), which lives on a different axis and is carried by PROP-VER-5. The text is **positively distinguishable** from PROP-LAUNCH-9's "not found" text: each refusal is pinned by a positive substring assertion (the declared range on both; additionally the version found on this one) **and** the two strings are asserted `notEqual`. "Both non-empty" is not the oracle. The decision half ships green at HEAD (`pdlc/engine/__tests__/handshake.test.js:120-126`); T15(d) carries it through the launcher path. | Error Handling | Unit | AC-1.1, AT-1.2, T-3 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-3 | An unparseable plugin manifest **must refuse** naming both the plugin root and the parse failure, and the assertion **must pin that the text is not the "none installed" message** — an absence-free discriminator between two refusal states that would otherwise be interchangeable. | Error Handling | Unit | BR-1.3, AT-1.4 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-4 | `--version` and `doctor` **must resolve but never refuse**: in the three resolution states — pinned repo, empty store, unreadable config — the process exits `0` and reports a triple. Pinned reports the resolved triple with `mode: "pin"`; empty store reports the launcher's own triple with `mode: "unresolved"` and carries the refusal text as a **notice**; corrupt config under `doctor` prints ladder branch 0's text. Exit `0` is asserted as the exact value in each. **AT-1.3's own subject is the two plugin-handshake refusal states**, and per PLAN T15(f) the diagnostic is asserted to complete and report the triple in *both*: no plugin installed (PROP-LAUNCH-9's state) and an out-of-range plugin (PROP-LAUNCH-2's state). Five states in all; in the two refusal states the refusal text is carried as a **notice** and the exit is still exactly `0`. | Contract | Unit | DEC-EDIST-07, AC-1.1, AT-1.3, TSPEC §6.5 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-5 | The version triple a run *reports* **must equal** the triple it *banners* and the triple its run report carries — asserted as a three-way equality within one run, not as three independent shape checks. **Each member is additionally pinned by content**, so three empty placeholders cannot satisfy the equality: the engine version equals the packed manifest's `version` (T-1a), the declared compatible-plugin range equals the manifest's `pdlcPluginCompat` string (T-3), and the plugin version equals the version `readPluginVersion` reports for the fixture plugin root — or the exact literal `not found` when none is installed, the same value `checkCompat` reports at HEAD (`pdlc/engine/__tests__/handshake.test.js:113`). AC-1.4's three members are named individually, never asserted as "a triple of non-empty strings". | Contract | Integration | AC-1.4, AT-1.6, T-1a, T-1b, T-3 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-6 | The launcher hop **must pass the child through verbatim**: a numeric child `status` is re-raised unchanged, stdout and stderr arrive unmixed, and a signalled child exits **exactly `128 + signum`** — the exact arithmetic, never "non-zero". Descriptor-level assertions (path, argv, env marker) run against the S-3 double; the pass-through and signal legs run against a **real spawn**, because `spawnSync` reports a signalled child as `status: null` and a double cannot falsify the arithmetic. | Contract | Unit + Machine | AC-2.1, AT-1.1, AT-2.1, DEC-EDIST-06 | T14 → `launcher.test.js`; T46; T50 (real-spawn legs) |
| PROP-LAUNCH-7 | `bin/pdlc.mjs` **must remain dependency-free**, asserted structurally over its source: **zero** static `import` declarations, **exactly three** non-comment top-level statements, and **zero** `await` tokens in the comment-stripped source. This is a positive triple of exact counts, not "does not import much". | Contract | Unit | AC-2.4, DEC-EDIST-09, AT-2.5, TSPEC §9.3 | T13 → `bin-guard-structure.test.js`; T45 |
| PROP-LAUNCH-8 | `bin/cli.mjs` **must export `main(argv, deps)` and a five-key `deps`**, and **importing it must run nothing**: the inert-import leg asserts a capture count of `=== 0` before any other assertion, and the exported `deps` key set is asserted by set-equality plus five `===` value pins. | Contract | Unit | DEC-EDIST-09, AT-2.5 | T45, T47 → `provenance-path.test.js` |
| PROP-LAUNCH-9 | **With the engine installed and no plugin installed, any pipeline command must refuse before dispatch, and the refusal must name the declared range and state that none is installed.** Four positive conjuncts, one per clause of AT-1.1: (a) the message contains the engine's declared `pdlcPluginCompat` range verbatim; (b) it contains the exact literal `not found` — the value `checkCompat` reports for a missing plugin, distinguishable by `notEqual` from PROP-LAUNCH-2's out-of-range text; (c) the process exits with the pipeline's own refusal code and the dispatch count is asserted `=== 0`, so "refused" cannot be satisfied by a crash after dispatch; (d) **no file in the consumer project changed**, asserted as a byte-identical tree-and-index comparison against a **non-empty** recorded pre-state, never as a bare absence. The decision half is already green at HEAD — `pdlc/engine/__tests__/handshake.test.js:110-118` pins the range, `not found`, `Remedy:` and `PDLC_PLUGIN_ROOT` on `checkCompat`'s reason — so the new work is the launcher path reaching it, which T15/T46 carry. | Error Handling | Unit | AC-1.1, AT-1.1, T-3, TSPEC §11 | T15 → `version-doctor.test.js`; T46 → `bin/cli.mjs` |

**The two refusal axes are not the same axis.** TSPEC §11 names AC-1.1's carrier as two halves —
`handshake.checkCompat` (shipped, V-09) **plus** the launcher path. PROP-LAUNCH-9 and PROP-LAUNCH-2
carry the **plugin-compat** half (declared range, "not found", out-of-range version found);
PROP-LAUNCH-1, -3 and -4 carry the **engine-store / launcher** half (`store.empty`, unparseable
manifest, the diagnostic exemption). A property set that asserted only the second half while claiming
AC-1.1 would report REQ-EDIST-01 as covered with nothing asserting G-1's central promise.

**Why the counts are stated exactly.** PROP-LAUNCH-1, -2, -6 and -9 are the properties most exposed to
the absence-only failure mode: a refusal that merely "fails" is satisfied by any crash, including the
stack trace `AC-2.4` forbids. Each therefore carries the three positive conjuncts the oracle rule
requires — exact exit status, named reason id, and the operator-visible text pinned by substring.

### 2.2 PROP-INSTALL — install, upgrade and coexistence (REQ-EDIST-02)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-INSTALL-1 | `postinstall` **must place the installed tree at `$PDLC_HOME/versions/<version>/` additively**: after installing version N+1 over a store holding N, the store's entry set equals `{N, N+1}` — a set-equality with both members named, not "N+1 is present". | Data Integrity | Unit | AC-2.1, AC-2.5, DEC-EDIST-03, AT-2.1 | T53, T34 → `postinstall.test.js`, `scripts/postinstall.mjs` |
| PROP-INSTALL-2 | `postinstall` **must read and write no consumer path**: over an injected fs, the recorded write set is asserted to be a subset of paths under the store root **and** the recorded read set contains no path under the consumer project — with a positive control proving the recorder observes writes at all (the store writes it did make), so the assertion cannot pass on a recorder that saw nothing. | Security / Data Integrity | Unit | AC-2.3, AT-2.4 | T53, T34 → `postinstall.test.js` |
| PROP-INSTALL-3 | An install then an upgrade on a clean machine **must produce two distinct `{resolvedVersion, resolvedStoreEntry}` records**, with inequality asserted on **either field independently** — equality on one field alone is a failure, not merely equality on both. A leg producing *no* record fails **distinguishably** from a leg producing an equal one. | Functional | Unit + Machine | AC-2.3, AT-2.4 | T59 → `fixture-machine.test.js` (hermetic, injected spawn); T50 (machine legs) |
| PROP-INSTALL-4 | After the upgrade of PROP-INSTALL-3, the consumer repo's **tree and index are byte-identical** to their pre-upgrade state and **nothing exists under `.claude/`** that did not exist before. The byte-identity conjunct is paired with a positive-presence control: the pre-state fixture is asserted non-empty and its recorded content is asserted present in the post-state, so the comparison cannot be vacuous on an empty tree. | Data Integrity | Machine | AC-2.3, AT-2.4 | T50 → `.github/workflows/fixture-machine.yml`, `scripts/fixture-machine.mjs` |
| PROP-INSTALL-5 | **Two consumer repos, one machine-level upgrade, zero in-repo commands**: both repos having run at N, a single upgrade command run on the machine (and none inside either repo) results in both repos executing N+1, observed **both in each run's output and in its artifacts**. The "zero in-repo commands" half is asserted **positively** — the per-repo command log is recorded and required to hold exactly the pipeline invocation — never as an absence check. | Integration | Machine | AC-2.2, AT-2.3, G-2, US-02 | T50 (second leg) → `scripts/fixture-machine.mjs` |
| PROP-INSTALL-6 | Below the Node floor, **install and invocation each fail naming both the floor and the version found**, with **no stack trace** in the captured stderr and **no partially installed tree** (the store entry set is unchanged, asserted by equality against the pre-state set, not by absence of the new entry alone). | Error Handling | Unit + Machine | AC-2.4, T-2, AT-2.5 | T13, T25, T34, T45 → `bin-guard-structure.test.js`, `postinstall.test.js`; T50 (`node:18-alpine` leg) |
| PROP-INSTALL-7 | The engine and the plugin **must coexist**: after installing the engine, the plugin tree's hash is unchanged and the engine's store entry is present — both stated as positives in the same observation, and the pairing is re-read rather than assumed from the install command's exit code. | Integration | Machine | AC-2.5, AT-2.6 | T50 → `scripts/fixture-machine.mjs` |
| PROP-INSTALL-8 | Each install / upgrade / pairing command spelled `@{scope}/pdlc-engine` **must occur exactly once** across tracked markdown outside `docs/` and outside every test-fixture corpus, and the plugin's three `claude plugin install` occurrences **must be asserted present outside that set as a positive**, not inferred from their absence within it. The enumeration is `git ls-files` over the stated pathspec — tracked-ness, never a tree walk, so an untracked `.claude/worktrees/` copy can never redden it. | Data Integrity | Unit | BR-2.3, AT-2.2 | T18 → `docs-uniqueness.test.js`; T31 → `pdlc/README.md`, `pdlc/engine/README.md` |

**The two-repo property is the one with a single carrier.** `AT-2.3` is observed only by T50's second
leg (PLAN §2.1). PROP-INSTALL-5 is therefore the property most exposed to a silent skip, which is
exactly what `PROP-GATE-1`…`PROP-GATE-3` exist to prevent: an unregistered or unaccounted skip of
this leg must redden the required check, never leave it green.

### 2.3 PROP-PACK — package composition and the anti-fork oracle (AC-1.3, O-10)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-PACK-1 | The packed set produced by a **real `npm pack` into a temp dir** **must equal TSPEC §5.4's `PK-*` table in both directions** — every `PK-*` member present, and no packed member outside the table. The failure message names TSPEC §5.4 as the expected set's source. | Contract | Unit | AC-1.3, AT-3.8a, PF-4 | T16 → `packaging.test.js`; T25, T49 |
| PROP-PACK-2 | The packed **member count** is asserted against the **transcribed `PK-*` list**, never against the tarball's own length: 23 before N-2's licence record, 24 after, per FSPEC §5.2's classes and per-class counts. Asserting the count against the tarball is a tautology once PROP-PACK-1 passes and is the self-derived expectation `BR-8.1` forbids; asserted against the transcription it goes red the moment the transcription drifts from FSPEC §5.2. | Contract | Unit | AC-1.3, BR-8.1, AT-3.8a | T16 → `packaging.test.js` |
| PROP-PACK-3 | The engine **must ship no skills snapshot**: no packed member lies under a skills path. This is the *absence* half of G-1 and is **never asserted alone** — it is stated only in conjunction with PROP-PACK-1's whole-set equality, which is what gives the absence a falsifier, and with `PROP-LAUNCH`/`PROP-VER`'s positive counterpart `PROP-PACK-9` (the composed prompt reads the *installed* plugin's bytes). | Negative / Contract | Unit | G-1, AC-1.2, AC-1.3 | T16 → `packaging.test.js`; T57 |
| PROP-PACK-4 | **AF-1 — tracked-ness, not walking.** `git ls-files` under `pdlc/engine/` **must list no file named `orchestrate-dev.js` or `orchestrate-queue.js`**. Tracked-ness is read from the index, so a build artefact cannot satisfy the oracle and a committed fork cannot hide behind `.gitignore`. This replaces the HEAD directory walk in `run.test.js` and is strictly stronger in the case that matters — a *committed* fork. | Negative / Data Integrity | Unit | O-10, BR-8.2, DEC-EDIST-01 | T33 → `packaging.test.js`, `run.test.js` |
| PROP-PACK-5 | **AF-2 — the vendored bytes are checked, not assumed.** Run `prepack` into a temp dir **first** (the precondition is load-bearing: `vendor/` is git-ignored, so in an ordinary checkout no `VENDOR-MANIFEST.json` exists and "every entry in the manifest…" is vacuously true over an empty set). Then: the manifest's `modules` array **equals** `{orchestrate-dev.js, orchestrate-queue.js}` by set-equality (never `length > 0`); each entry's recorded SHA-256 equals the hash of the vendored bytes; and each equals the canonical `pdlc/workflows/` source at the same commit. **A falsifier runs in the same test**: mutating one byte of a vendored copy must turn AF-2 red. | Data Integrity | Unit | O-10, BR-8.2, TSPEC §5.3 | T16, T33 → `packaging.test.js` |
| PROP-PACK-6 | **AF-3 — exact-path equality under two roots.** In a checkout, `workflowModulePath("dev"/"queue")` equals the checkout path exactly; in an installed package it equals the vendor root's path exactly — "contains the root" is not the oracle. Both directions are asserted positively (vendor root present ⇒ vendor path; absent ⇒ checkout path), neither by absence. | Contract | Unit | O-10, AT-3.8b, DEC-EDIST-01 | T11, T41 → `workflow-roots.test.js`, `run.test.js` |
| PROP-PACK-7 | **The anti-fork oracle must not become a zero-assertion pass.** `PROP-FORK-1`'s loop over `Object.entries(WORKFLOW_MODULE_URLS)` asserts **a non-zero member count before** its per-member equality, so a resolver that becomes a function or a lazily computed shape fails loudly instead of iterating nothing. This is the R-5 hazard stated as a property: the loop body is where every assertion lives, so an empty loop is a green oracle that checks nothing. *(This property is anchored positionally — `pdlc/engine/__tests__/run.test.js:67-79`, **read at HEAD** — because the position of the assertions relative to the loop is the claim. T41 edits those very lines, so the numbers locate the loop today, not after the task lands; the same qualifier PROP-PROV-15 carries.)* | Contract | Unit | R-5, AT-3.8b | T41 → `run.test.js` |
| PROP-PACK-8 | The two-root resolution order **must be fixed and announced**: vendor root first, checkout root second; when neither resolves the engine **refuses at startup naming both paths tried** and dispatches nothing; when both exist the run **announces which root it loaded**. The refusal names paths (positive), and the announcement is asserted present in the banner (positive), so neither half is an absence check. | Contract | Unit | DEC-EDIST-01, TSPEC §5.2, E-04, E-22 | T11, T41 → `workflow-roots.test.js`, `lib/run.mjs` |
| PROP-PACK-9 | **The composed prompt must carry the installed plugin's `SKILL.md` bytes.** A fixture plugin root whose dispatched role's `SKILL.md` carries a distinguishing marker, dispatched through `composePrompt`, yields a composed prompt **containing that marker**; a **second** fixture root with a *different* marker yields a prompt carrying the second marker **and not the first**. The negative pair is what makes the property unsatisfiable by engine-resident bytes. | Functional | Unit | AC-1.2, AT-1.5, G-1 | T57 → `skills-composition.test.js` |
| PROP-PACK-10 | `.npmignore` carrying the single line `!vendor/workflows/` and `.gitignore` carrying `vendor/` **must both exist as authored files**, and `.npmignore` **must never appear as a packed member** (npm always excludes it) — so PROP-PACK-1's `PK-*` set is unchanged by its existence. The inclusion is explicit rather than inferred from npm's `files`-versus-ignore-file precedence, which has varied across npm majors. | Contract | Unit | DEC-EDIST-01, DEC-EDIST-05, TSPEC §5.1 | T33 → `packaging.test.js`, `.npmignore`, `.gitignore` |
| PROP-PACK-11 | The manifest **must carry**, at publish time: no `private` field (O-8 blocker 1, `"private": true` at HEAD), `engines.node: ">=20"`, the `files` allow-list `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`, `scripts.prepack`, `scripts.postinstall`, the scoped `name` from the operator's record, and a `license` field holding the recorded SPDX id **in place of `"UNLICENSED"`** (HEAD value). Each is asserted as an exact value; the `files` array is asserted by set-equality against the four-member list, not by containment. | Contract | Unit | O-8, T-1a, C-3, AT-3.8a | T25, T05 → `packaging.test.js`, `package.json`, `LICENSE` |
| PROP-PACK-12 | The licence record and its artefacts **must land atomically**: recording N-2 flips `PK-3` (`LICENSE`) into TSPEC §5.4's expected packed set, so `pdlc/engine/LICENSE` must exist with that licence's text and `package.json`'s `license` must carry the matching SPDX id **in the same task**. A record without the file leaves PROP-PACK-1 red; the property states the coupling so the red is understood as designed, not as a defect. | Data Integrity | Unit | N-2, O-8 blocker 3, PF-4 | T05 → `LICENSE`, `package.json`, `DECISIONS-plugin-distribution.md` |

### 2.4 PROP-PUB — tag-driven gated publish (REQ-EDIST-03)

All legs below run against the **S-5 publish-channel stub**, whose only consumer is `publish.yml`.
The stub records publishes and stores bytes, so every property here has a positive observation to
assert on rather than the absence of a package.

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-PUB-1 | With **every** member of FSPEC §5.1's five-row required-check set green, a tag push **must record exactly one publish of the declared version** on the stub, **with no human step in the run** — asserted as a publish count of `=== 1` plus the recorded version, not as "a publish happened". | Functional | Integration | AC-3.1, AT-3.1, BR-3.9 | T58 → `publish-channel.test.js`; T49 → `publish.yml`; T52 (real channel, `[manual]`) |
| PROP-PUB-2 | With **one** §5.1 member red, **nothing is published and the run's conclusion is `failure`** — asserted **on the conclusion**, not on package absence. This is PROP-PUB-1's conjugate on the same stub configuration, which is why both belong to one carrier: a stub that never publishes at all would satisfy the absence form of this property while failing PROP-PUB-1. | Error Handling | Integration | AC-3.2, AT-3.2 | T58, T49 → `publish-channel.test.js` |
| PROP-PUB-3 | Re-running the workflow for a version N already held by the stub **must take exactly one of two branches, both exercised**: an explicit no-op, or a loud failure naming the collision. On **each** branch, N's stored-byte hash is **unchanged** (hash equality against the pre-run hash, with the pre-run bytes asserted non-empty so the equality is not vacuous) and the output **names N**. | Idempotency | Integration | AC-3.3, AT-3.3 | T58, T49 → `publish-channel.test.js` |
| PROP-PUB-4 | A known **sentinel credential value** must occur **zero times** in both the built artifact and the captured stub-publish log — and this absence is paired with **two positives** from AC-3.5: with the secret present the stub authenticates and the release is cut; with it absent or empty the run fails with a **named** failure and nothing is published. The absence check alone would pass on a run that produced no artifact and no log. | Security | Integration | AC-3.5, AT-3.5 | T58, T49 → `publish-channel.test.js` |
| PROP-PUB-5 | A tag disagreeing with the engine version (T-1a) **must fail naming both values** — the tag's version and the manifest's — and a declared `pdlcPluginCompat` range excluding the current plugin version (T-1b) **must fail naming the range and the plugin version**. Both are positive-substring assertions on the failure text, and both are implemented in `scripts/publish-preflight.mjs`. | Error Handling | Integration | AC-3.6, AC-3.7, AT-3.6, AT-3.7, PF-1…PF-5 | T58, T49 → `publish-channel.test.js`, `scripts/publish-preflight.mjs` |
| PROP-PUB-6 | **`pr-tests.yml`'s five rendered job names are a closed set.** FSPEC §5.1's two set-equalities hold over the file's job-level `name:` keys **with per-job matrix expansion**; a non-matrix name expression yields `unexpandable`, and a job-level `uses:` yields `unexpandable` — each asserted as that exact verdict, because DEC-EDIST-10's whole reason for duplicating gate bodies is that a reusable workflow renders as `{caller} / {called}` and silently renames consumer-polled checks. Mutations run against **fixture copies**, never the live file. | Contract | Unit | C-5, BR-7.5, AC-3.4, AT-3.4, DEC-EDIST-10 | T17 → `ci-arrangement.test.js`; T49 |
| PROP-PUB-7 | `publish.yml` and `pr-tests.yml` **must agree on the gate-command set** by set-equality — the mechanism that pays for DEC-EDIST-10's duplication. A duplicated gate whose commands have drifted is exactly the failure the duplication risks, and containment would not catch a *removed* command. | Contract | Unit | DEC-EDIST-10, AT-3.4 | T17 → `ci-arrangement.test.js` |
| PROP-PUB-8 | `NODE_AUTH_TOKEN` **must be consumed only by the publish step** — asserted positively by enumerating the steps that reference it and requiring that set to equal `{publish}`, not by scanning other steps for its absence. | Security | Unit | AC-3.5, TSPEC §8 | T49 → `publish.yml`; T58 → `publish-channel.test.js` |
| PROP-PUB-9 | The **pairing record** (`pdlcPairing`) **must be written by the publish job itself** — O-6's single-writer rule — and must be readable after publication via `npm view … pdlcPairing`. PROP-PACK-1's whole-set equality covers the manifest's shape; this property covers the record's provenance, which set-equality cannot see. | Data Integrity | Integration + Machine | AC-1.5, AT-3.8a, O-6 | T49 → `publish.yml`; T52 (`[manual]`), T31 (documentation) |
| PROP-PUB-10 | PF-4 and PF-5 **must be re-asserted against the packed tarball inside the publish job**, after `prepack` and after the pairing record is written — not only against a locally packed artifact in the PR gate. The property exists because the tarball the job publishes is not the tarball the gate inspected. | Contract | Integration | PF-4, PF-5, AT-3.8a, AT-3.8b | T49 → `publish.yml`, `packaging.test.js` |

### 2.5 PROP-PROV — provenance in artifacts (REQ-EDIST-04)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-PROV-1 | `Provenance` **must be a frozen, plain-data value** constructed at a single site in `lib/provenance.mjs`, with **no fs, env or clock access** — asserted by constructing it under stubbed globals and recording zero calls, plus the positive control that the recorder observes the calls a deliberately impure variant makes. `line` and `block` are pure renderers of that value. | Functional | Unit | AC-4.1, AC-4.3, DEC-EDIST-02, TSPEC §7 | T08, T27 → `provenance.test.js`, `lib/provenance.mjs` |
| PROP-PROV-2 | **The seam is default-inert (P-1).** With no `_provenance` argument supplied, the artifacts a run creates are **byte-identical** to the pre-feature baseline. Byte-identity is paired with a positive-presence conjunct — the baseline fixture is asserted to contain the artifact content being compared — so the oracle cannot pass on a run that produced nothing. `NO_PROVENANCE` is the default value of the parameter in both workflow modules. | Data Integrity | Unit | DEC-EDIST-02, AC-4.1, AT-4.1 | T20, T29, T30 → `provenanceSeam.test.js`, `orchestrate-dev.js`, `orchestrate-queue.js` |
| PROP-PROV-3 | **Kind 1 — the run report states both versions.** The report field carries the engine version (T-1a) and the plugin version (T-1b) as **two distinct values**, joined only by the declared `pdlcPluginCompat` range; neither is derived from the other. | Observability | Unit | AC-4.1, AT-4.1, T-1a, T-1b, T-3 | T20, T29 → `provenanceSeam.test.js` |
| PROP-PROV-4 | **Kind 2 — the POSTMORTEM block is appended, ordered, and skipped when empty.** `_appendFile` writes `block` **after** `_checkFile` confirms the POSTMORTEM exists, and when `block` is empty **no append call is made at all** — asserted as an `_appendFile` call count of `=== 0`, a behavioural call-count rather than a shape assertion, because the resulting file looks identical either way. | Data Integrity | Unit | AC-4.2, AT-4.2 | T20, T29 → `provenanceSeam.test.js` |
| PROP-PROV-5 | **Kind 3 — the queue row's `Engine` cell.** The mark is applied **inside `rewriteStatus`**, so all five routes R-1…R-5 inherit it, and the `Engine` cell is written on **both** `updateQueueStatus` row-write paths — the `evidence == null` quick path and `writeEvidenceCarryingRow` (both verified present at HEAD in `orchestrate-queue.js`). `ensureEngineColumn` mirrors `ensureEvidenceColumn`; its round trip asserts the **header literal verbatim**, and the two-migration case (a table lacking **both** `Evidence` and `Engine`) is exercised. | Data Integrity | Unit | AC-5.3, AT-5.3, AT-5.3b | T21, T36, T39 → `provenanceQueueRow.test.js`, `orchestrate-queue.js` |
| PROP-PROV-6 | `ensureEngineColumn` **must be idempotent and cell-preserving over generated tables**: over generated `QUEUE.md` inputs — ragged rows, trailing pipes, CRLF, `Evidence` absent and present — `parseQueue ∘ ensureEngineColumn` preserves every pre-existing row's cells, and applying it twice equals applying it once **byte-for-byte**. Generators are **bounded** and take an explicit **seed that is printed on failure**, so a red is reproducible rather than folkloric. | Idempotency | Unit | AT-5.3b, TSPEC §9.3 | T36 → `provenanceQueueRow.test.js`; generators from T03 |
| PROP-PROV-7 | **Kind 4 — the composed line reaches `git commit`, asserted on the recorded `_git` argv, never on source text.** Each of C-a…C-e is driven through a **named reachable entrypoint** with a recording `_git`, and the recorded `commit -m` message is asserted to contain the rendered line: `commitPaths` called directly; `appendApprovalAnchors` reached through the exported `reviewLoop`; `commitQueueRow` reached through the exported `rewriteStatus`; `commitAdvisoryRecord` reached through the queue module's own advisory path; and the `apply` arrow inside `buildA5SeamOps`, built and applied. A grep for `provenance.line` passes while the line never reaches a commit — which is why the argv is the oracle. | Integration | Unit | AC-5.3, AT-5.3 | T22, T30, T35 → `provenanceCommits.test.js`, both workflow modules |
| PROP-PROV-8 | **C-e must stage nothing of its own and keep its `advisory(A5):` prefix** — a negative and a positive stated together, so marking the A5 seam cannot silently widen what it commits. | Negative / Security | Unit | AC-5.3, advisory-tier invariants | T22, T35 → `provenanceCommits.test.js` |
| PROP-PROV-9 | **The commit-site set is closed.** The set of **enclosing named functions** containing a `git commit` invocation across both workflow modules **equals** `{commitPaths, appendApprovalAnchors, commitQueueRow, commitAdvisoryRecord, buildA5SeamOps}` — stated unconditionally, and true at HEAD (each of the five is present in `orchestrate-dev.js` / `orchestrate-queue.js`, read at HEAD). **It ships its own falsifier**: the same scanner runs over a **fixture source** carrying a sixth `git commit` inside a named function and must report the sixth site and fail the equality; a scanner returning the same set for both inputs fails the task. | Data Integrity | Unit | AC-5.3, AT-5.3 | T19 → `commit-sites.test.js` (`[standing guard]`) |
| PROP-PROV-10 | **`artifactPaths` equals the classes the run produced.** §7.4's set-equality over document classes 1–11, **restricted to the classes the run actually produced**, with anchor-appended `CROSS-REVIEW-*` files enumerated and `QUEUE.md` and `docs/_decisions/` outside scope. **Ships a falsifier**: a fixture run producing class 9 (`CODE_REVIEW-*`) with the push removed must redden the equality, and the failure must name the **missing class**, not report a bare count mismatch. | Data Integrity | Unit | AC-4.5, AT-4.5 | T23, T38 → `artifactPaths.test.js`, `orchestrate-dev.js` |
| PROP-PROV-11 | **No pre-existing file is rewritten outside the enumeration.** The negative half of AC-4.5 is asserted only alongside PROP-PROV-10's positive set-equality, never as a standalone absence check. | Negative / Data Integrity | Unit | AC-4.5, AT-4.5 | T23, T38 → `artifactPaths.test.js` |
| PROP-PROV-12 | **Dev-mode produced-kind set-equality, with positives on both fixtures.** A halted queue-driven fixture produces four kinds; a green queue-driven fixture marks R-3's `in-progress` and R-5's `awaiting-merge`; a green **direct** fixture, run with `mergeMode: "on"` and the guard-ladder preconditions satisfied (`prUrl`, O1 `state: "OPEN"` / `mergeable: "MERGEABLE"`, O5's changed-file list, O2's CI evidence, O3's `unresolved: 0`, O4's permitted merge method), asserts a **non-empty** produced-kind set. Absent kinds are not vacuously "marked". | Contract | Unit | AC-5.3, AT-5.3, AT-5.3b, AT-4.2 | T24, T42 → `devModeKinds.test.js`, `orchestrate-dev.js` |
| PROP-PROV-13 | **The precedence chain must be defeated, and the reached rung named first.** Because this feature's own diff touches `pdlc/workflows/`, which the shipped self-modification guard refuses, PROP-PROV-12's direct-run fixture configures `merge.guardPaths` to a set its changed-file list does not intersect, and **asserts the reached rung by name from `decideMerge`'s record before asserting the kinds** — so an earlier branch preempting the one under test is a failure, not a silent pass. | Contract | Unit | AT-5.3b, DoD merge-ladder invariants | T24 → `devModeKinds.test.js` |
| PROP-PROV-14 | **Cross-review and `CODE_REVIEW-*` contents stay unmarked while the harness commit message is marked.** Marking a review document's *body* would add a second `VERDICT:`-bearing write path into files the loop parses; the property pins the split explicitly rather than leaving it to implementer taste. | Negative / Data Integrity | Unit | AC-5.3, artifact conventions | T24 → `devModeKinds.test.js` |
| PROP-PROV-15 | **The generated bundles must carry the widened arity.** Both generated closures in `build-runtime.mjs` pass `provenance` as `rewriteStatus`'s 8th argument, and the built `dist/` artifacts carry it — asserted on the built output, not only on the generator source. *(Positionally anchored — `pdlc/workflows/build-runtime.mjs:274` and `:307`, the two `__queue.rewriteStatus(...)` emission sites read at HEAD — because which closures emit the call is the claim.)* | Integration | Unit | AC-5.3, AT-5.3, AT-6.1 | T55, T44 → `runtimeProvenanceWiring.test.js`, `build-runtime.mjs`, `dist/` |
| PROP-PROV-16 | **Wiring is asserted at three levels, and each fails for a different reason.** Module-side (the seam accepts and threads the value), production-path (`devInjection` gains an 8th key and `queueInjection` a 6th, both `_provenance`; `runDev`/`runQueue`/`runQueueLoop` take a `provenance` argument), and process-entry (`bin/cli.mjs`'s three command-body call sites, including the `--loop` site, pass it). A `builder-not-wired` defect is green at module level and red at the other two — which is the whole reason all three exist. | Integration | Unit | TSPEC §12.1, AC-5.3, AT-4.2 | T47, T48 → `provenance-path.test.js`, `lib/run.mjs`, `bin/cli.mjs` |
| PROP-PROV-17 | **The seam mirror is updated in the same task that widens the injections.** `TSPEC_3_1_DEV_SEAMS` and `TSPEC_3_1_QUEUE_SEAMS` in `seam-contract.test.js` are hand-maintained literal lists compared by `deepEqual` against the real injection objects (verified at HEAD); adding `_provenance` reddens them immediately. The exclusion list and `UNOVERRIDDEN_IO_SEAMS` are left unchanged, and `PROP-PARITY-15` is unaffected. | Contract | Unit | TSPEC §12.4, PROP-PARITY-12 | T48 → `seam-contract.test.js`, `lib/run.mjs` |
| PROP-PROV-18 | **Capture counts are asserted before identity comparisons.** On the process-entry leg, `=== 1` where the site is reached and `=== 0` where it is not, `process.exitCode` and stderr captured and restored; on the injection leg, a real `runQueueLoop({maxPasses: 2, …})` over a recording module asserts `captured.length === 2` and `stopReason === "bound-reached"` **before** comparing `captured[i]._provenance === p`. An identity comparison over an empty capture array is a zero-assertion pass. | Contract | Unit | TSPEC §12.1, AT-4.2 | T47 → `provenance-path.test.js` |
| PROP-PROV-19 | **Anti-echo (AC-4.4): the reported pair changes and reverts.** Three runs on the fixture machine — run 1 at plugin version P records a pair; a **different** version P′ is made current and run 2 records a **differing** pair; the change is reverted to P and run 3 records a pair **equal to run 1's**. All three pairs are transcribed into the evidence document. **The second observation is the one a hardcoded constant fails**; the third is the one a per-run nonce fails. The evidence document states its own limit: this is a **one-time observation with no regression guard**. | Functional | Machine (`[manual]`) | AC-4.4, AT-4.4 | T56 → `EVIDENCE-AT-4.4.md` |

### 2.6 PROP-VER — version resolution, pinning and dev mode (REQ-EDIST-05)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-VER-1 | **The ladder is pure and total.** `lib/resolve-version.mjs` resolves over branches 0–7 with no fs, env or clock access beyond its injected seams, and **every** input reaches exactly one branch — asserted by driving each of the eight branches with a named fixture and pinning the branch id, so "total" is a covered enumeration and not a claim. Precedence is `dev ≻ pin ≻ latest`. | Functional | Unit | AC-5.1, AC-5.2, AC-5.4, DEC-EDIST-03, TSPEC §6.2 | T07, T37 → `resolve-version.test.js`, `lib/resolve-version.mjs` |
| PROP-VER-2 | **Every branch announces; no branch announces empty.** For each of branches 0–7 the resolution announcement is **non-empty and branch-specific** — asserted as an exact expected announcement per branch, with the eight announcements pairwise distinct. A shared placeholder string satisfies "non-empty" and is exactly what the distinctness conjunct rejects. | Observability | Unit | AC-5.2, AT-5.1, AT-5.2, TSPEC §6.3 | T07, T37, T54, T40 → `resolve-version.test.js`, `startup-announce.test.js` |
| PROP-VER-3 | **A declared pin executes the pinned version, announces it, and states that it could not check for updates.** All three conjuncts in one observation: the resolved version equals the pin, the announcement names the pin with `mode: "pin"`, and `update.unavailable` is emitted with its reason. | Functional | Unit | AC-5.1, AT-5.1 | T07, T10, T12, T37, T43 |
| PROP-VER-4 | **No pin ⇒ latest installed, with "no pin" stated.** The resolved version equals the store's maximum entry **and** the announcement carries the no-pin discriminant — the second conjunct is what distinguishes this from a pin that happens to name the latest version. | Functional | Unit | AC-5.2, AT-5.2 | T07, T37, T54, T40 |
| PROP-VER-5 | **A pin naming an uninstalled version refuses, naming both** the requested version and the versions actually installed, with the exact message id (`version.pin-missing`) and a non-zero exit. Three positive conjuncts — status, reason id, and the operator-visible enumeration — never `status != 0` alone. | Error Handling | Unit | AC-5.5, AT-5.5 | T06, T07, T10, T26, T28, T37 |
| PROP-VER-6 | **A malformed pin is distinguishable from a missing one**: `version.pin-malformed` and `version.pin-missing` are asserted as distinct ids with distinct texts, so a single "bad pin" path cannot satisfy both criteria. | Error Handling | Unit | AC-5.5, TSPEC §6.2 | T07, T37 → `resolve-version.test.js` |
| PROP-VER-7 | **A checkout present with no declaration resolves to the released version**, not to the checkout — dev mode is opt-in. The released version is asserted by exact value and the dev-mode discriminant is asserted absent **in conjunction with** the positive released-version assertion. | Functional | Unit | AC-5.4, AT-5.4 | T07, T37 |
| PROP-VER-8 | **An incomplete dev declaration refuses with `version.dev-incomplete`**, naming what was declared and what was missing — never falling back silently to the released version, which would make a broken dev setup indistinguishable from PROP-VER-7's ordinary case. | Error Handling | Unit | AC-5.4, TSPEC §6.2 | T07, T37 |
| PROP-VER-9 | **An unreadable consumer config refuses even when no pin was declared** (branch 0), emitting `config.unreadable`. `readEngineConfig`'s `engine` read is a **three-way** discriminant — `absent` / `no-pin` / `unreadable` — and each of the three is asserted by exact value, because "unparseable, therefore assume no pin" is indistinguishable by construction from the case AC-5.5 exists to prevent. | Error Handling | Unit | DEC-EDIST-08, AC-5.5, AT-5.1, AT-5.5 | T10, T28 → `engine-config.test.js`, `lib/run.mjs` |
| PROP-VER-10 | **`readEngineConfig`'s HEAD behaviour survives.** Its nine HEAD assertions — including the consumer-defaults notice ("never an engine crash"), the invalid-value-dropped path and the operator-owned rows — are present and pass **verbatim**; the file grows to ≥ 9 + the new cases. This is a preservation floor with a positive-presence conjunct, not a count. | Contract | Unit | PLAN §5.1, DoD item 2 | T10 → `engine-config.test.js` |
| PROP-VER-11 | **`lib/store.mjs` lists and locates versions over an injected fs**, and an unparseable store entry is **skipped and reported** — the report is a positive observation (the entry name appears in the emitted notice), not a silent filter. | Data Integrity | Unit | AC-5.5, DEC-EDIST-03, AT-5.5 | T06, T26 → `store.test.js`, `lib/store.mjs` |
| PROP-VER-12 | **The update probe is inert by default and never blocks.** The default probe is **never called** (call count `=== 0`), it returns `{unavailable, reason}`, `update.unavailable` is stated on **every** run, and the probe path's exit code is asserted as the **exact expected value** — `0` on the success path and the pipeline's own non-zero on a refusal path — never "unaffected" relative to an unstated baseline. | Contract | Unit | AC-5.1, AT-5.1, TSPEC §6.5 | T12, T43 → `update-probe.test.js`, `lib/store.mjs` |
| PROP-VER-13 | **`PDLC_PLUGIN_ROOT` is ignored with a notice, in all four rows.** Path-level oracle over `resolvePluginRoot`'s four cases: the honour direction (root `===` the env value, `source` unchanged, `notices` **empty**), the ignore direction (a **discovered** root **plus** `notices` carrying **both** the id `env.plugin-root-ignored` **and** its rendered text), and the unset/empty rows. The ignore row's two positive conjuncts matter because catalogue set-equality covers only *registration*: the branch trigger and the rendered text are not covered by it. | Functional | Unit | AC-5.6, DEC-EDIST-04, AT-5.6 | T09, T32 → `plugin-root-notice.test.js`, `lib/skills.mjs` |
| PROP-VER-14 | **The remedy text is updated where it is shipped.** `REMEDY` in `lib/handshake.mjs` reads `--dev PDLC_PLUGIN_ROOT=…`, asserted verbatim — the product's own shipped remedy must not keep advising the form the engine now ignores. **The rewritten string must also keep the HEAD assertions on it green**, and they are named here rather than left to be discovered by a red run: the only HEAD assertions on `REMEDY`'s *content* are `pdlc/engine/__tests__/handshake.test.js:116-117` (`/Remedy:/` and `/PDLC_PLUGIN_ROOT/` on `checkCompat`'s reason) and `:125` (`/Remedy:/`) — the other five HEAD files that mention the variable (`report-engine`, `startup-ladder`, `cli`, `exit-loop`, `skills`) either *set* it as an environment value or pin a different string, and none reads `REMEDY`. The `--dev PDLC_PLUGIN_ROOT=…` form contains both pinned substrings, so **no edit to `handshake.test.js` is required and none is owned**; the property is that the disposition holds by construction, asserted as a positive conjunct in T32's leg (the new text matches `/Remedy:/` and `/PDLC_PLUGIN_ROOT/`), not as an assumption. If a future wording drops either substring, T32's ownership manifest (PLAN §3) must gain `handshake.test.js` in the same task — a rewrite that reddens a file no task owns is the DoD item 2 hole this conjunct closes. | Observability | Unit | DEC-EDIST-04, AC-5.6, DoD item 2 | T32 → `lib/handshake.mjs`, `plugin-root-notice.test.js` |
| PROP-VER-15 | **Startup surfaces the resolver's notices without re-deriving or re-rendering them** — asserted by identity/equality against the resolver's own returned notices, not by substring similarity — and carries the resolution announcement into the banner for **every** branch, including 1, 3 and 6. | Observability | Unit | AC-5.2, AC-5.6, AT-5.2, AT-5.6 | T54, T40 → `startup-announce.test.js`, `lib/startup.mjs` |
| PROP-VER-16 | **Generated inputs do not break the ladder.** Over bounded generators — version strings (well-formed, prerelease, empty, non-semver, path-traversing), config shapes across TSPEC §6.4's space, and queue tables — resolution lands on one of branches 0–7 and **never returns an empty announcement**. Each generator takes an explicit **seed printed on failure**, and any counter-example is pinned as a regression case. | Functional | Unit | TSPEC §9.3, S-7, AT-5.1 | T03 (generators), T07 → `resolve-version.test.js` |

### 2.7 PROP-CAT — message catalogue and announcement invariants

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-CAT-1 | **Registration and emission are set-equal, in both directions, at every batch boundary.** The ids `messageIds()` registers equal the ids the run emits: an emitted-but-unregistered id fails, and a **registered-but-never-emitted** id fails. Consequence, stated as a property because it constrains the shape of the work: **a task may not register an id in one batch and emit it in a later one.** Every catalogue-touching task registers *and* emits within itself. | Contract | Unit (suite-wide) | TSPEC §10.3, PLAN §5.2 | T28, T32, T37, T41, T43, T45 → `lib/catalogue.mjs`; oracle in `_assert-suite-wide.mjs` |
| PROP-CAT-2 | **Eleven or twelve ids, enumerated — conditional on the same open erratum as PROP-CAT-4.** The ids this feature adds are exactly `store.empty`, `version.pin-missing`, `version.pin-malformed`, `version.dev-incomplete`, `version.announce-pin`, `version.announce-latest`, `version.announce-dev`, `env.plugin-root-ignored`, `node.below-floor`, `modules.not-found`, `config.unreadable`, `update.unavailable` — spelled verbatim, and each with a named emitter task. The enumeration is the change-control point: an id added without an emitter reddens PROP-CAT-1, and an id emitted without registration reddens it too. **`node.below-floor` is the conditional member, and this property inherits PROP-CAT-4's marking rather than asserting past it**: under the open TSPEC §10.3 / §9.3 erratum (§9 Q-1, PLAN §7), if the guard emits a literal string and the catalogue does **not** register the id, the registered set is the **eleven** ids above minus `node.below-floor` and the "each with a named emitter task" clause holds over eleven; if the resolved TSPEC text names an emission path, the set is the **twelve** as listed. The expected set is transcribed from the *resolved* TSPEC §10.1 table, never from this row, and implementation must not begin against the unresolved form. | Contract | Unit | TSPEC §10.1, §10.3; PLAN §7 open erratum | T28, T32, T37, T41, T43, T45 |
| PROP-CAT-3 | **`modules.not-found` is emitted where the refusal happens.** When neither workflow-module root resolves, the engine refuses at startup, emits `modules.not-found`, names both paths tried, and **dispatches nothing** — the last conjunct asserted as a dispatch call count of `=== 0`, because a refusal that still dispatched would look identical in the transcript. | Error Handling | Unit | AT-3.8b, TSPEC §11 | T41 → `workflow-roots.test.js`, `lib/catalogue.mjs` |
| PROP-CAT-4 | **`node.below-floor` is registered only where something can emit it.** At HEAD `lib/catalogue.mjs` carries no `below-floor` id and no `node.*` id at all (grepped). If TSPEC §10.3's instruction to register it stands, the guard specified by §9.3 — zero static imports, exactly three top-level statements — provably cannot emit it, and PROP-CAT-1's registered-but-unemitted arm fails. **This property is therefore conditional on the open erratum against TSPEC §10.3 / §9.3** and states both resolutions: if the guard emits a literal string and the catalogue does **not** register the id, this property reduces to PROP-INSTALL-6's text assertions; if the id is registered, the resolved TSPEC text names the emission path and this property asserts it. Implementation must not begin against the unresolved form. | Contract | Unit | TSPEC §10.3, §9.3; PLAN §7 open erratum | T45 → `bin/pdlc.mjs`, `lib/catalogue.mjs` |

### 2.8 PROP-GATE — capability gating and skip accounting

These properties exist because five acceptance criteria are observed, wholly or in part, only by
capability-gated legs. They follow the shipped `skipSink` precedent **as it behaves — fail-closed**:
`validateSkipRecords` admits a record only when its `name` is pre-registered in `SKIP_INVENTORY`, its
`capability` is drawn from the closed `KNOWN_CAPABILITY_KEYS` set (`bash`, `git`, `hash`,
`uid-nonroot` at HEAD), and its `unverifiedInvariants` list is non-empty; the teardown **throws** on
any violation. All three facts read at HEAD in `pdlc/workflows/__tests__/helpers/`.

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-GATE-1 | **Every gated leg probes one named capability, and unprobeable is a failure, not a skip.** The capabilities are `docker` (container leg), `real-spawn` (pass-through and signalled-child legs) and `npm-pack` (temp-prefix install/upgrade and two-repo legs). The discriminator is the **probe process's exit status**: a probe that executes and exits non-zero ⇒ capability **absent** ⇒ registered skip; a probe that cannot execute at all — spawn error, `ENOENT`, timeout, or any outcome with no exit status to read — ⇒ **unprobeable** ⇒ workflow failure. The predicate is **opt-out**, so an all-skipped run cannot be the default. | Contract | Unit + Machine | DoD item 14, TSPEC §12.1 | T50 → `scripts/fixture-machine.mjs`; T59 → `fixture-machine.test.js` |
| PROP-GATE-2 | **The inventory names what a skip leaves unverified.** `scripts/fixture-machine.mjs` holds one frozen `{name, capability, unverifiedInvariants}` entry per gated leg, whose `unverifiedInvariants` names the `AT-` ids that leg alone observes — the container leg's entry names AT-2.5, the two-repo leg's names AT-2.3. | Observability | Unit | DoD item 14(a) | T50, T59 |
| PROP-GATE-3 | **The comparator is pure and fails closed.** Over `(records, inventory)`: an unregistered skip name, an unknown capability key, a duplicate name and an empty `unverifiedInvariants` list each yield a violation; the all-registered case yields none. The workflow runs it at end of run and **fails on any violation**. Both the comparator and the recorder take their seams as arguments — inventory and spawn function — so every branch is reachable hermetically, which is what makes the 85 % branch floor on this module attainable from T59's legs alone. | Error Handling | Unit | DoD items 4 and 14(b), TE round-3 Q-01 | T59 → `fixture-machine.test.js`; T50 → `scripts/fixture-machine.mjs` |
| PROP-GATE-4 | **The green check means "ran", not "passed or never ran".** On the GitHub-hosted `ubuntu-latest` runner all three probes exit 0 and the recorded skip set is **empty** — asserted as a positive observation with the run's URL cited, not inferred. On any runner where the set is non-empty it is a **subset** of the inventory, and every `AT-` id its entries leave unverified is covered by a named, dated evidence document. A leg that *ran* and failed reddens the check and halts Phase PUB. | Contract | Machine | DoD items 14(c), 14(d), 15 | T50 → `.github/workflows/fixture-machine.yml` |
| PROP-GATE-5 | **The fixture-machine workflow is a required check, and its job names stay outside the frozen set.** `gh pr view --json statusCheckRollup` sees six workflows where it saw five; the sixth being red means the DoD is not met. Its job names are deliberately outside FSPEC §5.1's frozen set, which governs `pr-tests.yml` alone — so PROP-PUB-6 and this property cannot both be satisfied by editing the same file. | Contract | Machine | DoD item 14, C-5, BR-7.5 | T50 → `.github/workflows/fixture-machine.yml` |

### 2.9 PROP-REGR — non-regression of the plugin and bundle channels (REQ-EDIST-06)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-REGR-1 | **Five extended test files keep their HEAD assertions, and each floor survives the deletion it guards.** Observed with the runner's own count, `node --test __tests__/<file>`, against the HEAD numbers: `engine-config.test.js` ≥ 9 with all nine HEAD assertions present; `run.test.js` ≥ 21, i.e. **all 21** present, with the three module-path / anti-fork tests **restated rather than removed** and the other eighteen untouched; `skills-composition.test.js` ≥ 32 from ≥ 14 `test(` call sites, i.e. its twelve plain tests **plus both generated sweeps over `DISPATCHABLE_SET`'s ten members**; `ci-arrangement.test.js` ≥ 6 from ≥ 2 `test(` call sites; `seam-contract.test.js` ≥ 12. **The site count is stated wherever executed count and site count differ**, because an executed-only floor licenses replacing loops with a smaller number of plain tests: `skills-composition.test.js`'s 32 come from 14 sites (a "twelve tests" floor would license deleting exactly the two strongest properties) and `ci-arrangement.test.js`'s 6 come from **2** sites — measured at HEAD, `node --test __tests__/ci-arrangement.test.js` reports `1..2` and `# tests 6` — so a ≥ 6-executed-only floor there would license the same deletion the rule was written to forbid. **Counting method, stated because it is not a plain `grep -c`:** a site is a **top-level `test(` call**, excluding `.test(` regex-predicate calls and mentions inside comments; a naive `grep -c 'test('` on `skills-composition.test.js` returns 20 at HEAD and matches neither floor. The executed counts are the runner's own, and they are the primary floor; the site counts are checked only against that definition. | Contract | Unit | DoD item 2, PLAN §5.1 | T10, T17, T33, T41, T48, T57 |
| PROP-REGR-2 | **`pr-tests.yml` is byte-unchanged.** No task adds a job to it; its five rendered job names still satisfy FSPEC §5.1's set-equality. Byte-identity is paired with PROP-PUB-6's positive set-equality, so the pair cannot both be satisfied by an empty or unparsed file. | Negative / Contract | Unit | C-5, BR-7.5, DoD item 14 | T17 → `ci-arrangement.test.js` |
| PROP-REGR-3 | **Build then bare-path sync then `--check`, all three exit 0.** `node pdlc/workflows/build-runtime.mjs`, then the **bare-path** `pdlc/hooks/scripts/sync-workflows.sh` (no `bash`/`sh` prefix — a `126` exit means the execute bit was lost and is a **failure, not a retry**), then `--check`. The order is not interchangeable. Both `--check`s are evaluated **after** T44's wave commit, on a tree with no untracked strays, never in the working tree. | Integration | Unit + Integration | AC-6.1, AT-6.1, DoD items 3 and 13 | T44 → `build-runtime.mjs`, `dist/`, `runtimeProvenanceWiring.test.js` |
| PROP-REGR-4 | **The bundle channel stays unmarked while the engine channel is marked.** An engine-channel run's artifacts carry the provenance block; a bundle-channel run's output carries **no** engine provenance block, while the run still completes and emits its named artifacts. **The limit is stated in the evidence document itself**: the conjunction discriminates only on a machine whose installed channels are known independently, so this is a recorded, dated observation and **not a discriminating test**. AC-6.2 is therefore **partially** delivered in this phase; the remainder is carried by N-1. | Integration | Machine (`[manual]`) | AC-6.2, AT-6.2, PLAN §1.2 | T51 → `EVIDENCE-AT-6.2.md` |
| PROP-REGR-5 | **The workflows suite gains six files and edits no existing test outside the ownership manifest.** `cd pdlc/workflows && npm test` is green with `provenanceSeam`, `provenanceCommits`, `provenanceQueueRow`, `artifactPaths`, `devModeKinds` and `runtimeProvenanceWiring` collected by jest; any edit to an existing workflows test that PLAN §3 does not name is a violation of the property, not a matter of taste. | Contract | Unit | DoD item 2, PLAN §3 | T20–T24, T55 |
| PROP-REGR-6 | **Per-module branch coverage ≥ 85 %, measured per module and never as a package average.** For `lib/store.mjs`, `lib/resolve-version.mjs`, `lib/provenance.mjs`, `bin/cli.mjs`, `scripts/prepack.mjs`, `scripts/postinstall.mjs`, `scripts/publish-preflight.mjs` and `scripts/fixture-machine.mjs`. A new module at 40 % hidden behind a large well-covered package passes an average and fails this property. `scripts/fixture-machine.mjs`'s floor is met by T59's **hermetic** legs alone, so a reading below 85 % locally diagnoses a missing hermetic test, never a skipped capability-gated leg. | Performance / Contract | Unit | DoD item 4 | T59 and the module-owning tasks |

## 3. Negative properties

Every negative below is stated **with the positive conjunct that makes it falsifiable**. A bare
"X does not happen" is satisfiable by a run that did nothing, which is the failure mode TSPEC §12.3
names and which four of this feature's oracles are structurally exposed to.

| Id | Must NOT happen | Positive conjunct that makes it falsifiable | Traces |
|---|---|---|---|
| PROP-NEG-1 | The engine must **not** ship a skills snapshot. | Stated only inside PROP-PACK-1's whole-set equality against TSPEC §5.4's `PK-*` table, and paired with PROP-PACK-9's positive: the composed prompt carries the **installed** plugin's marker, and a second root with a different marker changes it. | G-1, AC-1.2, AC-1.3 |
| PROP-NEG-2 | No **git-tracked** copy of `orchestrate-dev.js` / `orchestrate-queue.js` may exist under `pdlc/engine/`. | AF-2's positive: after `prepack` into a temp dir, `VENDOR-MANIFEST.json`'s `modules` set **equals** the two module names and each SHA-256 matches the canonical source — plus the one-byte-mutation falsifier. Without AF-2, AF-1 is an absence over a git-ignored directory. | O-10, BR-8.2 |
| PROP-NEG-3 | `postinstall` must **not** read or write any consumer path. | The recorded write set equals the store paths it did write (positive control that the recorder observes anything at all), and the repo's tree and index are byte-identical against a **non-empty** pre-state. | AC-2.3, AT-2.4 |
| PROP-NEG-4 | A below-floor install must leave **no partially installed tree** and print **no stack trace**. | The store entry set equals the pre-state set (equality, not "the new entry is absent"), and the refusal text positively names both the floor and the version found. | AC-2.4, AT-2.5 |
| PROP-NEG-5 | The sentinel credential must appear **nowhere** in the built artifact or the publish log. | AC-3.5's two positives: with the secret present the stub authenticates and the release is cut; with it absent or empty the run fails with a **named** failure and nothing is published. | AC-3.5, AT-3.5 |
| PROP-NEG-6 | A red gate member must publish **nothing**. | The run's **conclusion is `failure`** — asserted on the conclusion, never on package absence — and PROP-PUB-1 proves the same stub configuration *can* publish. | AC-3.2, AT-3.2 |
| PROP-NEG-7 | With no `_provenance` supplied, **no artifact byte changes**. | The baseline fixture is asserted to contain the artifact content being compared, so byte-identity cannot pass over an empty run. | DEC-EDIST-02, AC-4.1 |
| PROP-NEG-8 | When `block` is empty, the POSTMORTEM must **not** be appended to. | An `_appendFile` call count of `=== 0`, a behavioural call-count — the file looks identical either way, so a shape assertion cannot see this. | AC-4.2, AT-4.2 |
| PROP-NEG-9 | No pre-existing file may be rewritten outside §7.4's enumeration. | PROP-PROV-10's produced-class set-equality plus its falsifier: a fixture run producing class 9 with the push removed must redden, naming the **missing class**. | AC-4.5, AT-4.5 |
| PROP-NEG-10 | Cross-review and `CODE_REVIEW-*` **contents** must not be marked. | The harness commit **message** is asserted marked in the same observation, so "nothing is marked anywhere" fails. | AC-5.3 |
| PROP-NEG-11 | `buildA5SeamOps`'s `apply` must stage nothing of its own. | Its `advisory(A5):` prefix is asserted present on the recorded `_git` argv in the same test. | AC-5.3 |
| PROP-NEG-12 | A bare `PDLC_PLUGIN_ROOT` must **not** be honoured. | The ignore row asserts a **discovered** root plus `notices` carrying both the id `env.plugin-root-ignored` and its rendered text; the honour row asserts `notices` empty. Two directions, both positive. | AC-5.6, DEC-EDIST-04 |
| PROP-NEG-13 | `--version` and `doctor` must **never refuse**. | Exit `0` asserted as an exact value in all five states — the three resolution states plus AT-1.3's two plugin-handshake refusal states — each also asserting the reported triple and `mode` — so "exits 0 because it did nothing" fails. | DEC-EDIST-07, AT-1.3 |
| PROP-NEG-14 | The anti-fork loop must **not** become a zero-assertion pass. | A non-zero member count is asserted **before** the per-member equality. | R-5, AT-3.8b |
| PROP-NEG-15 | A capability-gated leg must **not** be skipped silently. | The comparator fails on any unregistered skip, and on `ubuntu-latest` the recorded skip set is asserted **empty** with the run URL cited. | DoD item 14 |
| PROP-NEG-16 | `pr-tests.yml` must **not** gain a job. | Its five rendered names satisfy FSPEC §5.1's set-equality in the same run, so an emptied or unparsed file fails. | C-5, BR-7.5 |
| PROP-NEG-17 | No message id may be registered without an emitter, and none emitted without registration. | `checkMessageCatalogue`'s two-directional failure list, verified at HEAD. | TSPEC §10.3 |

## 4. Coverage matrix — acceptance test → property → task → test file

Set-equality against FSPEC §8's enumeration as PLAN §2.1 transposes it: **all 35 `AT-` ids appear
exactly once** below, and every row names at least one property and at least one task that PLAN §2
already carries. The `Carried by` column is copied from PLAN §2.1, which is itself the transpose of
§2's trailing citation lists — this document adds no carrier PLAN does not name.

| AT | Properties | Carried by (PLAN §2.1) | Test file(s) |
|---|---|---|---|
| AT-1.1 | PROP-LAUNCH-9, PROP-LAUNCH-6 | T15, T14, T46 | `version-doctor.test.js`, `launcher.test.js` |
| AT-1.2 | PROP-LAUNCH-2 | T15, T46 | `version-doctor.test.js` |
| AT-1.3 | PROP-LAUNCH-4 | T15, T46 | `version-doctor.test.js` |
| AT-1.4 | PROP-LAUNCH-3 | T15, T46 | `version-doctor.test.js` |
| AT-1.5 | PROP-PACK-9 | T57 | `skills-composition.test.js` |
| AT-1.6 | PROP-LAUNCH-5 | T15, T46 | `version-doctor.test.js` |
| AT-2.1 | PROP-LAUNCH-6, PROP-INSTALL-1, PROP-PACK-8 | T11, T14, T41, T46, T53, T34, T50 | `workflow-roots.test.js`, `launcher.test.js`, `postinstall.test.js`, `scripts/fixture-machine.mjs` |
| AT-2.2 | PROP-INSTALL-8 | T18, T31 | `docs-uniqueness.test.js` |
| AT-2.3 | PROP-INSTALL-5 | T50 (second leg) | `scripts/fixture-machine.mjs` |
| AT-2.4 | PROP-INSTALL-2, PROP-INSTALL-3, PROP-INSTALL-4 | T53, T34, T59, T50 | `postinstall.test.js`, `fixture-machine.test.js` |
| AT-2.5 | PROP-LAUNCH-7, PROP-LAUNCH-8, PROP-INSTALL-6 | T13, T25, T34, T45, T50 | `bin-guard-structure.test.js`, `postinstall.test.js`, `provenance-path.test.js` |
| AT-2.6 | PROP-INSTALL-7 | T50 | `scripts/fixture-machine.mjs` |
| AT-3.1 | PROP-PUB-1 | T58, T49, T52 | `publish-channel.test.js`, `EVIDENCE-BR-3.9.md` |
| AT-3.2 | PROP-PUB-2 | T58, T49 | `publish-channel.test.js` |
| AT-3.3 | PROP-PUB-3 | T58, T49 | `publish-channel.test.js` |
| AT-3.4 | PROP-PUB-6, PROP-PUB-7, PROP-REGR-2 | T17, T49 | `ci-arrangement.test.js` |
| AT-3.5 | PROP-PUB-4, PROP-PUB-8 | T58, T49 | `publish-channel.test.js` |
| AT-3.6 | PROP-PUB-5 | T58, T49 | `publish-channel.test.js`, `scripts/publish-preflight.mjs` |
| AT-3.7 | PROP-PUB-5 | T58, T49 | `publish-channel.test.js`, `scripts/publish-preflight.mjs` |
| AT-3.8a | PROP-PACK-1, PROP-PACK-2, PROP-PACK-3, PROP-PACK-5, PROP-PACK-11, PROP-PUB-9, PROP-PUB-10 | T16, T25, T49 | `packaging.test.js` |
| AT-3.8b | PROP-PACK-4, PROP-PACK-6, PROP-PACK-7, PROP-PACK-10, PROP-CAT-3 | T16, T33, T11, T41, T49 | `packaging.test.js`, `run.test.js`, `workflow-roots.test.js` |
| AT-4.1 | PROP-PROV-1, PROP-PROV-2, PROP-PROV-3 | T08, T20, T27, T29 | `provenance.test.js`, `provenanceSeam.test.js` |
| AT-4.2 | PROP-PROV-4, PROP-PROV-12, PROP-PROV-16, PROP-PROV-18 | T20, T24, T29, T47, T48 | `provenanceSeam.test.js`, `devModeKinds.test.js`, `provenance-path.test.js` |
| AT-4.3 | PROP-PROV-1, PROP-PACK-6 | T08, T27, T41 | `provenance.test.js`, `run.test.js` |
| AT-4.4 | PROP-PROV-19 | T56 | `EVIDENCE-AT-4.4.md` |
| AT-4.5 | PROP-PROV-10, PROP-PROV-11 | T23, T38 | `artifactPaths.test.js` |
| AT-5.1 | PROP-VER-2, PROP-VER-3, PROP-VER-9, PROP-VER-12, PROP-VER-16 | T07, T10, T12, T37, T43 | `resolve-version.test.js`, `engine-config.test.js`, `update-probe.test.js` |
| AT-5.2 | PROP-VER-2, PROP-VER-4, PROP-VER-15 | T07, T37, T54, T40 | `resolve-version.test.js`, `startup-announce.test.js` |
| AT-5.3 | PROP-PROV-5, PROP-PROV-7, PROP-PROV-8, PROP-PROV-9, PROP-PROV-12, PROP-PROV-14, PROP-PROV-15, PROP-PROV-16, PROP-PROV-17 | T19, T20, T21, T22, T24, T30, T35, T36, T39, T42, T44, T47, T48, T55 | `commit-sites.test.js`, `provenanceCommits.test.js`, `provenanceQueueRow.test.js`, `devModeKinds.test.js`, `runtimeProvenanceWiring.test.js`, `provenance-path.test.js` |
| AT-5.3b | PROP-PROV-5, PROP-PROV-6, PROP-PROV-12, PROP-PROV-13 | T21, T24, T36 | `provenanceQueueRow.test.js`, `devModeKinds.test.js` |
| AT-5.4 | PROP-VER-1, PROP-VER-7, PROP-VER-8 | T07, T37 | `resolve-version.test.js` |
| AT-5.5 | PROP-VER-5, PROP-VER-6, PROP-VER-9, PROP-VER-10, PROP-VER-11 | T06, T07, T10, T26, T28, T37 | `store.test.js`, `resolve-version.test.js`, `engine-config.test.js` |
| AT-5.6 | PROP-VER-13, PROP-VER-14, PROP-VER-15 | T09, T32, T54, T40 | `plugin-root-notice.test.js`, `startup-announce.test.js` |
| AT-6.1 | PROP-REGR-3, PROP-PROV-15 | T44 | `runtimeProvenanceWiring.test.js` |
| AT-6.2 | PROP-REGR-4 | T51 | `EVIDENCE-AT-6.2.md` |

**Properties with no `AT-` row of their own**, and why each is still traceable: **PROP-LAUNCH-1**
(the `store.empty` engine-store refusal) traces to AC-5.5 and TSPEC §6.2 — it is the launcher half
that AT-1.1's criterion is *not* about, and it is observed inside AT-5.5's and AT-1.3's legs on the
same fixtures; PROP-PACK-12
(licence atomicity) traces to N-2 / O-8 blocker 3 and PLAN DoD item 16; PROP-CAT-1, PROP-CAT-2 and
PROP-CAT-4 trace to TSPEC §10.3 and constrain the *shape* of the work rather than a criterion;
PROP-GATE-1…PROP-GATE-5 trace to PLAN DoD items 14 and 15; PROP-REGR-1, PROP-REGR-5 and PROP-REGR-6
trace to DoD items 2 and 4; PROP-PROV-17 traces to TSPEC §12.4's parity constants. None of these is
an acceptance criterion, and none is asserted in place of one.

**Two REQ criteria are cited as `AC-`, not `AT-`**, because FSPEC folds their verification into
another named test: **AC-1.5** (the per-release pairing record) is verified inside AT-3.8a and
documented by T31/T52 — PROP-PUB-9 carries it — and **AC-3.5**'s two positives are legs of AT-3.5,
carried by PROP-PUB-4.

**AC-1.5 is not manual-only** (PM round-1 Q-02, answered here so it outlives the round). Its primary
evidence is mechanical: PROP-PUB-9 asserts the pairing record is written **by the publish job
itself** and is readable from the published manifest, carried by T49's `publish.yml` leg and
re-asserted against the packed tarball by PROP-PUB-10. T52's `[manual]` record is a **confirmation of
an already-asserted property on the real channel**, not the criterion's only carrier — the same
relationship BR-3.9 has to PROP-PUB-1's stub legs. A P0 criterion is not left resting on a dated
document.

## 5. Requirement coverage and declared gaps

| Requirement | Properties | Coverage |
|---|---|---|
| REQ-EDIST-01 — one versioned engine artifact, resolved and launched | PROP-LAUNCH-1…9, PROP-PACK-9 | Complete. All six `AT-1.*` ids carried, **and AC-1.1's two halves are carried separately**: the plugin-compat refusal by PROP-LAUNCH-9 (AT-1.1) and PROP-LAUNCH-2 (AT-1.2), the engine-store/launcher half by PROP-LAUNCH-1, -3 and -4. AC-1.4's triple is carried per member by PROP-LAUNCH-5. |
| REQ-EDIST-02 — one-command install / upgrade, zero per-project action | PROP-INSTALL-1…8 | Complete **at criterion level**, but AT-2.3 and AT-2.6 are observed **only** by machine legs (PROP-GATE-4 is what keeps that honest), and AT-2.1, AT-2.4 and AT-2.5 keep hermetic carriers while losing their machine-level conjunct if those legs skip. |
| REQ-EDIST-03 — tag-driven gated publish | PROP-PUB-1…10, PROP-PACK-11, PROP-PACK-12 | Complete against the S-5 stub. The **real-channel** leg (BR-3.9) is a one-time `[manual]` record (T52) and is not re-run. |
| REQ-EDIST-04 — version provenance in artifacts | PROP-PROV-1…19 | Complete for AC-4.1, AC-4.2, AC-4.3 and AC-4.5. **AC-4.4 is a declared gap — see below.** |
| REQ-EDIST-05 — pinning, dev mode, resolution announcements | PROP-VER-1…16, PROP-CAT-1…3 | Complete. All seven `AT-5.*` ids carried at unit level. **PROP-CAT-2 is conditional**: its expected id set is eleven or twelve members depending on the open TSPEC §10.3 / §9.3 erratum (§9 Q-1, PLAN §7), which blocks T45. No `AT-5.*` id depends on that branch. |
| REQ-EDIST-06 — non-regression of the plugin and bundle channels | PROP-REGR-1…6 | AC-6.1 complete and mechanical. **AC-6.2 is a declared gap — see below.** |

**Declared gap 1 — AC-4.4 is verified once, with no regression guard.** PROP-PROV-19 is a
`[manual]`, dated, three-run observation on the fixture machine (T56). A dated document does not
re-run: the hardcoded-constant defect a run-3 revert would catch today is caught **once and never
again**, so any later change to the provenance stream (T20, T27, T29, T35, T36, T38, T39, T42, T44)
that introduced a hardcoded pair would redden **no test in this plan**. The reason it is not
automated on the fixture machine is narrow and expires: AT-4.4 needs a **revert** — a third
sequential run restoring a *prior* plugin root — and no leg in the plan installs an older plugin
version over a newer one. **The moment such a leg exists, this gap should close by moving
PROP-PROV-19 onto T50.** A later reader finding a revert leg on the machine should read this as
scheduling, not as a standing exclusion.

**Declared gap 2 — AC-6.2 is a limited observation, not a discriminating test.** PROP-REGR-4's
conjunction — the bundle run completed and emitted its named artifacts, and its output carries no
engine provenance block — discriminates only on a machine whose installed channels are known
independently. The bundle-side carrier (N-1) is unbuilt by design, so there is no run-bound
load-root observation on that side. Read in product terms: **REQ-EDIST-06 is fully delivered for
AC-6.1 and partially delivered for AC-6.2**, remainder carried by N-1.

**Declared gap 3 — the real publish channel is observed once.** PROP-PUB-1's stub legs re-run on
every PR; BR-3.9's real-channel publish (T52) is a dated record. This is inherent to a criterion
whose observation mutates a public registry, and it is recorded here so a DoD reader does not infer
continuous coverage from a green `publish-channel.test.js`.

**Not gaps, but out of scope by declaration** (PLAN §1.2, TSPEC §14.3): N-1 (AC-6.2's bundle-side
carrier), N-3 (BL-03), N-4 (range widening) and N-5 (M-ENG-10 change control) remain unbuilt. N-6
(npm scope) and N-2 (licence) are **inside** this feature's done-ness — N-6 as a decision (T02), N-2
as a decision **and** the two artefacts that decision makes expected (T05, PROP-PACK-12).

**Requirements with no property at all: none.** Every REQ-EDIST requirement has at least one
property, and every property in §2 traces to a REQ criterion, a FSPEC business rule, a TSPEC section
or a PLAN DoD item.

**The task-side accounting, stated in the other direction too.** Every task cited in §2 and §4 is a
task PLAN §2 already carries — this document invents no carrier. Going the other way, **two of
PLAN's 59 tasks are named by no property, and both are infrastructure by construction**: **T01**, the
P1-00 pre-flight gate, asserts only the *existence* of the BL-PREREQ symbols this feature extends
(never their shape), so it guards the plan's own starting assumption rather than a system behaviour;
and **T04**, the shared module-side doubles (`pdlc/workflows/__tests__/helpers/provenanceDoubles.js`),
is fixture material that properties run *against* rather than a behaviour they assert — §8 attributes
it. The remaining 57 tasks each appear in at least one property's carrier column. A future task
appearing in PLAN §2 with no property and no place in this paragraph is a coverage gap, not an
omission of style.

## 6. Falsifiability audit — the oracles and their defences

Each row of the falsifiability checklist, with the properties it applies to and the specific defence
the oracle carries. A property whose oracle appears here is one whose failure mode was named first
and answered by construction, not by review discipline.

| Failure mode | Where it bites here | Defence |
|---|---|---|
| **Absence-only oracle** | The four oracles TSPEC §12.3 names as not satisfiable by absence: packed-set equality, dev-mode produced-kind equality, the green-direct-run merge ladder, and the commit-site set. | PROP-PACK-1/-2 assert both directions against a transcribed expected set; PROP-PROV-12 asserts a **non-empty** produced-kind set on the green fixture; PROP-PROV-13 names the reached rung **before** asserting kinds; PROP-PROV-9 ships a fixture with a **sixth** commit site that must redden the equality. |
| **Preservation / byte-identity vacuity** | PROP-PROV-2 (inert seam), PROP-INSTALL-4 (tree and index byte-identical), PROP-PUB-3 (stored bytes unchanged), PROP-REGR-2 (`pr-tests.yml` unchanged). | Each carries a positive-presence conjunct: the pre-state fixture is asserted **non-empty and containing the content compared**, and PROP-REGR-2 is paired with PROP-PUB-6's positive set-equality over the same file. |
| **Regex / alternation branches without controls** | PROP-PUB-6's `unexpandable` verdicts (non-matrix name expression; job-level `uses:`), PROP-PROV-6's queue-table shapes (ragged rows, trailing pipes, CRLF). | Each branch has its own **fixture that exercises it** and its own expected verdict; mutations run against fixture copies. Multi-word sentinels are whitespace-normalised before substring matching, since a sentinel straddling a hard newline silently matches zero. |
| **Identical-envelope behaviour** | PROP-PROV-4 (append skipped when `block` is empty), PROP-VER-12 (default probe never called), PROP-LAUNCH-8 (importing `cli.mjs` runs nothing), PROP-INSTALL-5 (zero in-repo commands). | All four are **behavioural call-counts**, not shape assertions: `_appendFile` `=== 0`, probe `=== 0`, capture `=== 0`, and a per-repo command log required to hold **exactly** the pipeline invocation. |
| **Exact-value oracle over a real graph** | PROP-PROV-16's three-level wiring and PROP-PROV-18's capture counts. | Counts are asserted from **recorded dispatches** (`captured.length === 2`, `stopReason === "bound-reached"`) before any identity comparison — never hand-counted from the source. |
| **Derived / absence-shaped conjunct at an injectable unit** | PROP-PROV-15 (the built `dist/` carries the widened arity), PROP-PUB-10 (PF-4/PF-5 against the **packed tarball**), PROP-PACK-5 (`prepack` into a temp dir first). | Each is placed at the **whole-artifact seam** — built bundle, packed tarball, temp-dir vendor tree — rather than at the generator or the manifest, because that is the only place the derived value exists. |
| **New blocking cause behind a precedence chain** | PROP-PROV-13: the shipped self-modification guard refuses any diff touching `pdlc/workflows/`, which this feature's diff does. | The fixture **defeats the guard explicitly** by configuring `merge.guardPaths` to a set its changed-file list does not intersect, and asserts the reached rung by name first, so an earlier branch preempting the one under test fails rather than passing silently. |
| **Generator hygiene** | PROP-VER-16 and PROP-PROV-6. | Generators are **bounded**, take an **explicit seed printed on failure**, and every counter-example is pinned as a named regression case rather than left to reappear stochastically. |
| **Zero-assertion loop** | PROP-PACK-7. | A **non-zero member count asserted before** the per-member equality, so a resolver that becomes a function or a lazily computed shape fails loudly. |
| **Green-because-never-ran** | PROP-GATE-1…5. | Fail-closed capability predicate (unprobeable ⇒ failure, not skip), an inventory naming what each skip leaves unverified, a pure comparator that fails on any unregistered skip, and a **positive** assertion that the recorded skip set is empty on `ubuntu-latest`. |
| **Self-derived expectation** | PROP-PACK-2. | The count is asserted against the **transcribed** `PK-*` list, never the tarball's own length — which would be a tautology once PROP-PACK-1 passes, and is what BR-8.1 forbids. |

## 7. Test-level distribution

**89 properties in §2**, distributed as follows. Six carry two levels (PROP-LAUNCH-6,
PROP-INSTALL-3, PROP-INSTALL-6, PROP-PUB-9, PROP-GATE-1, PROP-REGR-3), so the column sums to 95
rather than 89.

| Level | Count | Which |
|---|---|---|
| Unit | 74 | **Properties whose assertion scope is a single module or function over injected seams** — no spawned process, no temp prefix, no built artifact, no full pipeline run. Reachability is not the discriminator: the nine Integration properties run from the same two commands (`cd pdlc/engine && npm test`, `cd pdlc/workflows && npm test`), and reading rule 5 keeps owning the Machine boundary. All of PROP-PACK (12), PROP-VER (16), PROP-CAT (4), 18 of the 19 PROP-PROV, 8 of 9 PROP-LAUNCH, 5 of 8 PROP-INSTALL, 3 of 10 PROP-PUB, 3 of 5 PROP-GATE, 5 of 6 PROP-REGR. |
| Integration | 9 | Full execution paths asserting a terminal state: PROP-LAUNCH-5, PROP-PUB-1…PROP-PUB-5, PROP-PUB-9, PROP-PUB-10, PROP-REGR-3. |
| Machine | 12 | Legs that run only on `.github/workflows/fixture-machine.yml` — PROP-LAUNCH-6's real-spawn half, PROP-INSTALL-3…7, PROP-GATE-1's probe legs, PROP-GATE-4, PROP-GATE-5 — plus the three `[manual]` records: PROP-PROV-19 (AT-4.4), PROP-REGR-4 (AT-6.2) and PROP-PUB-9's real-channel half (BR-3.9). |

**E2E budget.** Three end-to-end journeys, within the 3–5 ceiling: (1) clean-machine install →
upgrade → two consumer repos execute N+1 (PROP-INSTALL-3, -4, -5); (2) tag push → gate → preflight →
stub publish → pairing record readable (PROP-PUB-1, -9); (3) build → bare-path sync → `--check`
(PROP-REGR-3). Everything else is unit or integration by construction.

**Routing branches each have a workflow-level property.** The two execution-routing gates this
feature introduces are the **two-root module resolution** (PROP-PACK-8, exercised end-to-end by
PROP-PACK-6's installed-package leg) and the **`--version`/`doctor` exemption** (PROP-LAUNCH-4,
exercised through the real launcher by PROP-LAUNCH-5's three-way triple equality). Neither is left to
guard-only unit tests.

## 8. Fixtures and generators

The properties in §2 and §3 are only as strong as the material they run against. This section names
that material once, so a task in PLAN §2 inherits the fixture rather than inventing a weaker one.
Reading rule 4 governs every literal in it: a fixture that carries a message id, a remedy string, a
job name or a column header spells it exactly as the owning document does, never a paraphrase.

**Fixture corpus.**

| Fixture | Shape | Properties it carries |
|---|---|---|
| Eight named resolution fixtures | One input per ladder branch 0–7, each pinning the branch id it must reach | PROP-VER-1, PROP-VER-2, PROP-VER-6, PROP-VER-8 |
| Two fixture plugin roots | Each root's role `SKILL.md` carries a distinguishing marker; the second root's marker must appear and the first's must not | PROP-PACK-9 |
| Fixture copies of `pr-tests.yml` | Mutated copies only — the live file is never edited by a test | PROP-PUB-6, PROP-GATE-5 |
| Fixture source with a sixth commit site | A `git commit` inside a sixth named function, which the scanner must report and the set-equality must redden on | PROP-PROV-9 (its own falsifier) |
| Baseline artifact fixture | Pre-feature artifact content asserted **non-empty** before any byte-identity comparison, so preservation cannot pass over an empty run | PROP-PROV-2, PROP-NEG-7, PROP-INSTALL-4, PROP-PUB-3, PROP-REGR-2 |
| Class-9 run fixture | A run producing `CODE_REVIEW-*` with the push removed; the equality must fail naming the **missing class**, not a bare count | PROP-PROV-10, PROP-NEG-9 |
| Direct-run fixture | `mergeMode: "on"` plus `merge.guardPaths` configured not to intersect the changed-file list, so the guard cannot preempt the rung under test | PROP-PROV-12, PROP-PROV-13 |
| Stubbed-global recorder (T03 engine-side, T04 module-side) | Records fs/env/clock calls under construction, with a deliberately impure variant as the positive control. The module-side half — populated frozen `Provenance`, recording `_git`/`_appendFile`/`_readFile` seams, and the three `QUEUE.md` table shapes (no-columns, `Evidence`-only, both-columns) — is T04's `provenanceDoubles.js`; the engine-side doubles S-1…S-7 are T03's | PROP-PROV-1, PROP-PROV-4, PROP-PROV-5, PROP-PROV-7 |
| Consumer-repo pre-state | Tree and index recorded before upgrade, asserted non-empty, compared after | PROP-INSTALL-4, PROP-INSTALL-5 |
| Docs corpus | The tracked `docs/` set read via `git ls-files` over a stated pathspec — never a tree walk, so an untracked `.claude/worktrees/` copy cannot redden it | PROP-INSTALL-8, PROP-PACK-4 |
| Whole-artifact fixtures | The built `dist/` bundle, the packed tarball, and the `prepack` temp-dir vendor tree — the only places the derived form exists | PROP-PROV-15, PROP-PUB-10, PROP-PACK-5 |
| Fixture machine | `.github/workflows/fixture-machine.yml` plus `scripts/fixture-machine.mjs`, with hermetic injected-spawn legs in `fixture-machine.test.js` carrying the module's 85 % branch floor on their own | PROP-GATE-1…5, PROP-INSTALL-3…7, PROP-REGR-6 |

**Generators (T03).** Three bounded generators feed PROP-VER-16: version strings (well-formed,
prerelease, empty, non-semver, path-traversing), config shapes across TSPEC §6.4's space, and queue
tables. Every generated input must land on exactly one of branches 0–7 and must never yield an empty
announcement.

**Generator hygiene** — the three rules that keep a generator from going vacuously green:

1. **Explicit seed, printed on failure.** No implicit clock- or entropy-seeded run; a red run
   reproduces from the printed seed.
2. **Counter-examples are pinned.** Any failing input found by a generator is added as a named
   regression case, so the generator's job is discovery and the pinned case's job is prevention.
3. **Non-zero assertion count per member.** Every generated or enumerated member must assert at
   least once — the same guard PROP-PACK-7 states for `Object.entries(WORKFLOW_MODULE_URLS)`, which
   is what makes an empty iteration a failure rather than a pass.

## 9. Open questions

| # | Question | Owner | Blocking |
|---|---|---|---|
| Q-1 | **`node.below-floor`: registered or not?** TSPEC §10.3 instructs T45 to register it, while §9.3's guard — zero static imports, exactly three top-level statements — provably cannot emit it, so `checkMessageCatalogue`'s registered-but-unemitted arm fails. At HEAD `lib/catalogue.mjs` carries no `below-floor` id and no `node.*` id at all (grepped). PROP-CAT-4 states both resolutions and is conditional on this. | TSPEC (se-author) | **Yes** — T45 must not start against an expected value known to be wrong. Already recorded as an open erratum in PLAN §7. |
| Q-2 | **Where do the fixture-machine legs run?** TSPEC §12.1 specifies them to run on PRs, but `pr-tests.yml`'s five rendered job names are closed by C-5 / BR-7.5 and `publish.yml` is tag-triggered, so no stated file runs them. PLAN §2 T50 puts them in a new additive workflow; PROP-GATE-5 assumes that resolution. | TSPEC (se-author) | **Yes** — already recorded as an open erratum in PLAN §7. |
| Q-3 | Should PROP-PROV-19 (AC-4.4 anti-echo) move onto T50 once a **revert** leg exists on the fixture machine? This document's position: yes, and §5's declared gap 1 says so explicitly so the answer outlives this round. | Operator | No — scheduling, not correctness. |
| Q-4 | `KNOWN_CAPABILITY_KEYS` at HEAD is `["bash", "git", "hash", "uid-nonroot"]` (read in `skipSink.js`), while PROP-GATE-1 names `docker`, `real-spawn` and `npm-pack`. T50 ships its **own** inventory in `scripts/fixture-machine.mjs` rather than extending the workflows-suite key set, which keeps the two suites' capability vocabularies separate. Confirm that separation is intended rather than a missed reuse. | se-author / te-review | No — either arrangement satisfies PROP-GATE-1…3; only the location of the closed key set changes. |
