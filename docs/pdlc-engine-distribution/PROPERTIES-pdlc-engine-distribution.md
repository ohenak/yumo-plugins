# PROPERTIES — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → PLAN → **PROPERTIES**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11), `FSPEC-pdlc-engine-distribution.md` (v0.5), `TSPEC-pdlc-engine-distribution.md` (v0.12), `DECISIONS-pdlc-engine-distribution.md` (v0.3), `PLAN-pdlc-engine-distribution.md` (v0.6) |
| Downstream | IMPL tests — the test files named in PLAN §2's `Test File` column and §3's ownership manifest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft in review (Phase PT) | Claude | 0.1 | 2026-08-14 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |

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
≥ 32 from ≥ 14 `test(` call sites, `ci-arrangement.test.js` ≥ 6, `seam-contract.test.js` ≥ 12. Each
floor is stated as a property (`PROP-REGR-1`) with a **positive-presence** conjunct — the named HEAD
assertions are present in the file *and* execute — because a count alone is satisfiable by padding.

## 2. Property catalogue

### 2.1 PROP-LAUNCH — launcher resolution and refusal (REQ-EDIST-01)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-LAUNCH-1 | With no engine version installed, an invocation **must refuse** with a message that (a) names the store root it searched, (b) names the reason id `store.empty`, and (c) exits non-zero with the pipeline's own refusal code — never a bare `!= 0` against an unstated baseline. | Error Handling | Unit | AC-1.1, AT-1.1, TSPEC §6.2 | T15, T14 → `version-doctor.test.js`, `launcher.test.js`; T46 → `bin/cli.mjs` |
| PROP-LAUNCH-2 | A pin naming a version outside the declared compatibility range **must refuse** with text that is **positively distinguishable** from PROP-LAUNCH-1's: each refusal is pinned by a positive substring assertion (the range on both; additionally the version found on this one) **and** the two strings are asserted `notEqual`. "Both non-empty" is not the oracle. | Error Handling | Unit | AC-1.1, AT-1.2 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-3 | An unparseable plugin manifest **must refuse** naming both the plugin root and the parse failure, and the assertion **must pin that the text is not the "none installed" message** — an absence-free discriminator between two refusal states that would otherwise be interchangeable. | Error Handling | Unit | BR-1.3, AT-1.4 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-4 | `--version` and `doctor` **must resolve but never refuse**: in all three states — pinned repo, empty store, unreadable config — the process exits `0` and reports a triple. Pinned reports the resolved triple with `mode: "pin"`; empty store reports the launcher's own triple with `mode: "unresolved"` and carries the refusal text as a **notice**; corrupt config under `doctor` prints ladder branch 0's text. Exit `0` is asserted as the exact value in each. | Contract | Unit | DEC-EDIST-07, AT-1.3, TSPEC §6.5 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-5 | The version triple a run *reports* **must equal** the triple it *banners* and the triple its run report carries — asserted as a three-way equality within one run, not as three independent shape checks. | Contract | Integration | AC-1.4, AT-1.6 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-6 | The launcher hop **must pass the child through verbatim**: a numeric child `status` is re-raised unchanged, stdout and stderr arrive unmixed, and a signalled child exits **exactly `128 + signum`** — the exact arithmetic, never "non-zero". Descriptor-level assertions (path, argv, env marker) run against the S-3 double; the pass-through and signal legs run against a **real spawn**, because `spawnSync` reports a signalled child as `status: null` and a double cannot falsify the arithmetic. | Contract | Unit + Machine | AC-2.1, AT-1.1, AT-2.1, DEC-EDIST-06 | T14 → `launcher.test.js`; T46; T50 (real-spawn legs) |
| PROP-LAUNCH-7 | `bin/pdlc.mjs` **must remain dependency-free**, asserted structurally over its source: **zero** static `import` declarations, **exactly three** non-comment top-level statements, and **zero** `await` tokens in the comment-stripped source. This is a positive triple of exact counts, not "does not import much". | Contract | Unit | AC-2.4, DEC-EDIST-09, AT-2.5, TSPEC §9.3 | T13 → `bin-guard-structure.test.js`; T45 |
| PROP-LAUNCH-8 | `bin/cli.mjs` **must export `main(argv, deps)` and a five-key `deps`**, and **importing it must run nothing**: the inert-import leg asserts a capture count of `=== 0` before any other assertion, and the exported `deps` key set is asserted by set-equality plus five `===` value pins. | Contract | Unit | DEC-EDIST-09, AT-2.5 | T45, T47 → `provenance-path.test.js` |

**Why the counts are stated exactly.** PROP-LAUNCH-1, -2 and -6 are the properties most exposed to
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
| PROP-PACK-7 | **The anti-fork oracle must not become a zero-assertion pass.** `PROP-FORK-1`'s loop over `Object.entries(WORKFLOW_MODULE_URLS)` asserts **a non-zero member count before** its per-member equality, so a resolver that becomes a function or a lazily computed shape fails loudly instead of iterating nothing. This is the R-5 hazard stated as a property: the loop body is where every assertion lives, so an empty loop is a green oracle that checks nothing. *(This property is anchored positionally — `pdlc/engine/__tests__/run.test.js:67-79` — because the position of the assertions relative to the loop is the claim.)* | Contract | Unit | R-5, AT-3.8b | T41 → `run.test.js` |
| PROP-PACK-8 | The two-root resolution order **must be fixed and announced**: vendor root first, checkout root second; when neither resolves the engine **refuses at startup naming both paths tried** and dispatches nothing; when both exist the run **announces which root it loaded**. The refusal names paths (positive), and the announcement is asserted present in the banner (positive), so neither half is an absence check. | Contract | Unit | DEC-EDIST-01, TSPEC §5.2, E-04, E-22 | T11, T41 → `workflow-roots.test.js`, `lib/run.mjs` |
| PROP-PACK-9 | **The composed prompt must carry the installed plugin's `SKILL.md` bytes.** A fixture plugin root whose dispatched role's `SKILL.md` carries a distinguishing marker, dispatched through `composePrompt`, yields a composed prompt **containing that marker**; a **second** fixture root with a *different* marker yields a prompt carrying the second marker **and not the first**. The negative pair is what makes the property unsatisfiable by engine-resident bytes. | Functional | Unit | AC-1.2, AT-1.5, G-1 | T57 → `skills-composition.test.js` |
| PROP-PACK-10 | `.npmignore` carrying the single line `!vendor/workflows/` and `.gitignore` carrying `vendor/` **must both exist as authored files**, and `.npmignore` **must never appear as a packed member** (npm always excludes it) — so PROP-PACK-1's `PK-*` set is unchanged by its existence. The inclusion is explicit rather than inferred from npm's `files`-versus-ignore-file precedence, which has varied across npm majors. | Contract | Unit | DEC-EDIST-01, DEC-EDIST-05, TSPEC §5.1 | T33 → `packaging.test.js`, `.npmignore`, `.gitignore` |
| PROP-PACK-11 | The manifest **must carry**, at publish time: no `private` field (O-8 blocker 1, `"private": true` at HEAD), `engines.node: ">=20"`, the `files` allow-list `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`, `scripts.prepack`, `scripts.postinstall`, the scoped `name` from the operator's record, and a `license` field holding the recorded SPDX id **in place of `"UNLICENSED"`** (HEAD value). Each is asserted as an exact value; the `files` array is asserted by set-equality against the four-member list, not by containment. | Contract | Unit | O-8, T-1a, C-3, AT-3.8a | T25, T05 → `packaging.test.js`, `package.json`, `LICENSE` |
| PROP-PACK-12 | The licence record and its artefacts **must land atomically**: recording N-2 flips `PK-3` (`LICENSE`) into TSPEC §5.4's expected packed set, so `pdlc/engine/LICENSE` must exist with that licence's text and `package.json`'s `license` must carry the matching SPDX id **in the same task**. A record without the file leaves PROP-PACK-1 red; the property states the coupling so the red is understood as designed, not as a defect. | Data Integrity | Unit | N-2, O-8 blocker 3, PF-4 | T05 → `LICENSE`, `package.json`, `DECISIONS-plugin-distribution.md` |

### 2.4 PROP-PUB — tag-driven gated publish (REQ-EDIST-03)

### 2.5 PROP-PROV — provenance in artifacts (REQ-EDIST-04)

### 2.6 PROP-VER — version resolution, pinning and dev mode (REQ-EDIST-05)

### 2.7 PROP-CAT — message catalogue and announcement invariants

### 2.8 PROP-GATE — capability gating and skip accounting

### 2.9 PROP-REGR — non-regression of the plugin and bundle channels (REQ-EDIST-06)

## 3. Negative properties

## 4. Coverage matrix — acceptance test → property → task → test file

## 5. Requirement coverage and declared gaps

## 6. Falsifiability audit

## 7. Test-level distribution

## 8. Open questions
