# PROPERTIES — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → PLAN → **PROPERTIES**` — `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.16), `FSPEC-pdlc-plugin-retirement.md` (v0.10), `TSPEC-pdlc-plugin-retirement.md` (v0.11), `DECISIONS-pdlc-plugin-retirement.md` (v0.5), `PLAN-pdlc-plugin-retirement.md` (v0.1) |
| Downstream | IMPL and tests — the files named in PLAN §2's `Test File` column and §3's file-ownership manifest |
| Cross-Reviews | `docs/pdlc-plugin-retirement/CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` (Phase PT — not yet raised) |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` (Phase H — not yet written) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft (Phase T) | te-author | 0.2 | 2026-08-18 |

**Changelog**

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-08-18 | Initial draft. 75 properties across twelve domains, derived from REQ v0.16, FSPEC v0.10, TSPEC v0.11 and PLAN v0.1. Every property carries a PLAN task and a PLAN-owned file; §4's `AT-` row set set-equals FSPEC §6's twenty-six acceptance tests and PLAN §2.1's traceability table. |
| 0.2 | 2026-08-18 | Round-1 fixes addressing PM/SE CROSS-REVIEW-*-PROPERTIES-v1 (2 High, 1 Medium each). PROP-COMMIT-2/-3/-5 corrected from `T31 → preflight-baseline.test.js` to `T01/T13 → preflight-baseline.test.js` (T31 owns only `REPLAY-*.md`; T01/T13 own `preflight-baseline.test.js` per PLAN §3). PROP-COMMIT-4 corrected from `T11/T12/T13 → hookCompatibility.test.js` to `T11/T12 → hookCompatibility.test.js` (T13 does not own that file). PROP-COMMIT-6 corrected from `T13 → hookCompatibility.test.js` to `T13 → preflight-baseline.test.js` (its only owned file). PROP-CLEAN-6's carrier corrected to attribute `helpers/driftCapabilities.js` to T16, not T07/T30, found during the full mechanical carrier-cell audit requested by PM F-03. §4's AT-1.8 task list updated from `T01, T31` to `T01, T13` to match. §7's test-level table corrected from 31/34/10 to the actual 50 Unit / 16 Integration / 8 Manual (+1 Manual+Unit for PROP-BUILD-5) — the old figures did not match any three-way split of the 75 properties. §1 rule 5 amended to name PROP-BUILD-5 as the sole documented `Manual + Unit` exception, resolving SE F-03. Document-wide self-claims re-verified unchanged: still 75 property ids, still 26 `AT-` rows in §4, still 26 ACs in §5. |

---

## 1. How to read this document

This is a **deletion** feature. Almost every property is an assertion about what a tree
*no longer contains* — the shape the oracle falsifiability checklist warns hardest about.
Three document-wide rules exist to keep such properties from passing vacuously, and each
is restated at the property that leans on it.

**Rules of the document.**

1. **Identifiers.** `PROP-{DOMAIN}-{N}`, `{DOMAIN}` one of `SWEEP`, `SUITE`, `CI`, `HOOK`,
   `GATE`, `BUILD`, `DEL`, `VER`, `CLEAN`, `DOC`, `RUN`, `COMMIT`. Numbers are stable; a
   withdrawn property keeps its number, marked withdrawn, and the number is not reused.
2. **Citations name stable content** (`DEC-DOC-01`, `docs/_decisions/DECISIONS-review-severity-bars.md`):
   a spec id, an exported symbol, a heading, an assertion **title**, or a short verbatim
   quote. A `file:line` anchor appears only where the *position itself* is the claim under
   test, and every such use is marked `(position claim, measured at `b3f24fc6`)`.
3. **Expected-set ownership.** Where a property asserts a set equality, the expected side is
   **transcribed from the one document that owns the literal** and never re-derived from the
   artifact under audit. Ownership as fixed upstream: `dist/` entry set → FSPEC L-1 pinned
   by TSPEC §4.1; retired-term set → FSPEC L-2; hook entries → FSPEC L-4; suite size → FSPEC
   L-5 (contested, see PROP-COMMIT-4); re-homed titles → FSPEC L-6; required checks → FSPEC
   L-7; gate commands → FSPEC L-9; skill names → FSPEC L-10; consumer installed names →
   FSPEC L-11 transcribed into the cleanup script by TSPEC §4.3.
4. **Fixture strings verbatim.** A property that names a literal — `STALE pdlc/workflows/dist/pdlc-cli.mjs`,
   `distribution.checkEnabled`, `.pdlc-drift-state.json`, an assertion title such as
   `returns no-queue when the queue file is missing` — is implemented with that spelling,
   not a paraphrase.
5. **Test level** is one of Unit, Integration, Manual. **Manual** means the evidence is a
   committed transcript or report under `docs/pdlc-plugin-retirement/` produced by PLAN's
   three `[manual]` rows (T31, T32, T33); no executable oracle exists and none is implied.
   One documented exception: **PROP-BUILD-5** pairs a Unit-tested build-parity conjunct
   (`--check` exits `0`) with a Manual field-comparison conjunct (T33's pre/post CLI-answer
   diff); its Level cell reads `Manual + Unit` and its carrier lists both T17/T19 and T33
   accordingly. This is the sole multi-level row in the catalogue; no other property may
   silently repeat it — a second occurrence needs its own documented exception here, not a
   quiet copy of this one.
6. **Carrier cells name PLAN tasks and PLAN-owned files only.** A `red → green` pair is
   written `T14/T15`; a `[gate]` row is written `T01 [gate]`. Every file named in a carrier
   cell appears in PLAN §3's ownership manifest under that task.

**Three anti-vacuity rules, applied throughout.**

- **Absence needs a positive control.** No property is satisfied by "the search found
  nothing". AC-1.2's grep carries PROP-SWEEP-2's positive control; the skip-join oracle
  carries PROP-SUITE-5's red child; the cleanup's non-deletion carries PROP-CLEAN-3's
  byte-identity over a **non-empty** recorded pre-state.
- **Set-equality, not containment,** wherever the upstream literal is a set. Containment
  passes while a third member silently disappears — the exact drift FSPEC L-4, L-7 and
  L-10 were pinned to prevent.
- **Exact exit statuses, never "non-zero".** `3` for a cleanup refusal, `4` for usage and
  runtime failure, `2` for the harvest guard's block, `0` for a nudge, `1` for a stale
  `--check`, `126` as the value a bare-path invocation must **not** produce. "Non-zero" is
  satisfied by `127` (missing interpreter) on a step that never ran (FSPEC BR-CLN-4).

**What this document does not decide.** The disagreement between FSPEC L-5's post-sweep
suite literal (**97**) and TSPEC §4.4's derivation (**99**) is an open upstream erratum
(TSPEC §6.1 item 6, DEC-07). PROP-SUITE-1 asserts *the owning document's literal* and
PROP-COMMIT-4 makes the disagreement itself a red gate. No property here picks a number.

---

## 2. Property catalogue

### 2.1 PROP-SWEEP — the retired surface is gone (AC-1.1, AC-1.2, AC-1.5)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-SWEEP-1 | **After the sweep, `git ls-files` must list none of M-1…M-6 or M-10** — `pdlc/hooks/scripts/sync-workflows.sh`, `pdlc/hooks/scripts/lib/pdlc-drift.sh`, `pdlc/hooks/scripts/check-workflow-drift.sh`, the three `*.bundle.js` files and `distribution-manifest.json`. Read from the **index** (`git ls-files`), never from a directory walk: an ignored-but-present working-copy leftover must not green the property, and a still-tracked file must not hide behind `.gitignore`. | Data Integrity | Unit | AC-1.1, FSPEC L-1, AT-1.1 | T14/T15 → `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-SWEEP-2 | **L-3's command must run and must report exactly the allow-listed survivors.** Three conjuncts, and the first is what makes the other two mean anything: (a) the **unfiltered** output is **non-empty** and **contains** `docs/_decisions/DECISIONS-plugin-distribution.md` and `docs/_constraints/pdlc-retirement-baseline.md` — an empty unfiltered output **fails**, because a word-split or a non-zero grep produces one; (b) the output minus A-1's frozen glob list is **empty**; (c) the command's alternation set-equals **L-2's seven terms** verbatim, so neither narrowing a term to green a red search (E-12) nor adding a surviving identifier (E-13) can pass. | Contract / Data Integrity | Unit | AC-1.2, FSPEC L-2, L-3, BR-SWEEP-5, AT-1.2 | T29 [gate] → `pdlc/workflows/__tests__/documentOracles.test.js`, `docs/_constraints/pdlc-retirement-baseline.md` |
| PROP-SWEEP-3 | **A-1's allow-list must be frozen against the sweep's own output.** A glob added to A-1 after the C-6 transcription filters AT-1.2's output **only if** it carries a per-file disposition recorded in the baseline. The property is checkable as a pair: A-1's glob set and the baseline's per-file disposition set are compared, and a glob with no disposition fails. This is the mirror of PROP-SWEEP-2(c) on the exclusion side — a red search can be greened neither by narrowing terms nor by widening the filter. | Contract | Unit | FSPEC L-3, BR-SWEEP-5, E-25 | T29 [gate] → `docs/_constraints/pdlc-retirement-baseline.md`, `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-SWEEP-4 | **Neither `.worktreeinclude` nor `.gitignore` may carry a row whose only purpose is the consumer runtime copy, and the removed `.gitignore` row's ~20-line rationale comment block must be gone with it.** Two positive conjuncts guard the shape: the `.gitignore` file still exists and still carries its other rows (so "file deleted" cannot pass the check), and `.worktreeinclude`, left with no rows, is **absent from the index** rather than present-and-empty (E-9). | Data Integrity | Unit | AC-1.5, FSPEC class 8, E-8, E-9, AT-1.5 | T21/T22 → `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-SWEEP-5 | **The document-oracle module must lose exactly the checks whose subject is deleted and keep the rest passing.** Positive form: after the sweep `coveredViolations` runs green over a clean tracked-files-only checkout, the packaging and advertised-version checks over the deleted bundles are absent, the drift scan carries no exemption naming a tree that no longer exists, and D-1/D-2 no longer require CLAUDE.md to *contain* two retired script names. The suite is judged on a `git worktree add` of the commit under test, never on the developer's dirty tree — an untracked tool cache reds `coveredViolations` for a reason no diff explains (E-6). | Functional | Unit | AC-1.6, FSPEC class 9, E-6, E-7, AT-1.6 | T23/T24 → `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/workflows/lib/document-oracles.mjs`, `pdlc/workflows/__tests__/fixtures/covered-violations/` |
| PROP-SWEEP-6 | **`pdlc/workflows/runtime-adapter.js` and `MERGE_GUARD_DEFAULTS` must survive the sweep byte-identical.** Both are deliberate non-deletions (DEC-03, DEC-06); the frozen four-member array `["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]` is asserted by **set-equality on the exported symbol**, not by absence of a diff, so a "tidy-up" that drops the now-inert `.claude/workflows/` prefix reds. | Negative / Contract | Unit | REQ NG-5, DEC-03, DEC-06, TSPEC §2.7, §2.8 | T31 [manual] (replay evidence); pre-existing assertion in `pdlc/workflows/__tests__/consolidationRoute.test.js` |

*Why PROP-SWEEP-2 is written with three conjuncts.* AC-1.2's shape — "the search returns
nothing" — is the canonical unfalsifiable oracle: a mistyped pattern, a `$(git ls-files)`
word-split, or a grep that exits 1 all produce an empty result. Clause (a) proves the
search executed **and** reached the two files the sweep deliberately leaves carrying
retired names; clause (c) proves it searched for the right things. Containment, not
set-equality, is used in clause (a) because A-1's coverage grows by one file per
cross-review (BR-SWEEP-5) — measured as false today if written as equality.

### 2.2 PROP-SUITE — the workflow test corpus after surgery (AC-1.3, R-8, C-8)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-SUITE-1 | **`pdlc/workflows/__tests__/*.test.js` must count exactly the owning document's post-sweep literal.** The expected side is transcribed from FSPEC L-5 (the owning document), not derived in the test and not read off the directory. The count is a top-level `*.test.js` count under `__tests__/` — the two new fixtures `fixtures/skipJoinFalsifier.js` and `fixtures/skipJoinTeardown.js` are deliberately not `*.test.js` and join no count (TSPEC §5.5). | Data Integrity | Unit | AC-1.3, FSPEC L-5, ASM-2, AT-1.3 | T14/T15 → `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-SUITE-2 | **L-6 row 1's four queue-disposition assertion titles must exist in `orchestrateQueue.test.js`, verbatim.** `returns no-queue when the queue file is missing`, `runs the pipeline for a ready entry and sets awaiting-merge`, `skips a blocked entry per triage and reports idle when none are ready`, `sets halted status when the pipeline halts` — module presence alone is not the oracle, because a module that survived without receiving anything passes it. One rename or deletion reds. | Contract | Unit | AC-1.3, R-8, FSPEC L-6 row 1, TSPEC §4.4 | T14/T15 → `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-SUITE-3 | **`hookCompatibility.test.js` must survive carrying `PROP-COMPAT-04`, `PROP-COMPAT-05` and `PROP-COMPAT-06`, and must no longer carry the `C7` block.** Both halves in one property because either alone is satisfiable by the wrong tree: retention alone passes on a module that still asserts the deleted hook's registration; removal alone passes on a deleted module. The `C7` block's subject — `hooks.json` registering `check-workflow-drift.sh` on a second `SessionStart` — is gone with the hook (class 4), and its manifest-shape half is owned by PROP-HOOK-1's set-equality rather than re-homed twice. | Contract | Unit | AC-1.3, R-8, FSPEC L-6 row 2, DEC-07, TSPEC §2.6 | T14/T15 → `pdlc/workflows/__tests__/documentOracles.test.js`; T16 → `pdlc/workflows/__tests__/hookCompatibility.test.js` |
| PROP-SUITE-4 | **Across the swept surface, the run's pending set and the run's skip-sink records must join in both directions.** Left set: `assertionResults` entries with `status: "pending"` from a nested jest run's `--json` output, keyed by `title`. Right set: that run's sink records, keyed by `name`, after `validateSkipRecords` passes against `SKIP_INVENTORY`. Left ⊄ right catches the bare `it.skip` a sweep defect would introduce; right ⊄ left catches a record written where no test skipped. The exemption is keyed on **sink membership at run time**, never on `SKIP_INVENTORY` membership — keying it to the inventory would fail correct skips (FSPEC BR-SWEEP-6). | Contract | Integration | AC-1.3, C-8, FSPEC BR-SWEEP-6, AT-1.3, TSPEC §5.5 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-SUITE-5 | **The join must be proven falsifiable by a red child, not merely stated.** A second nested run over the green child's file list **∪ `__tests__/fixtures/skipJoinFalsifier.js`** — a module carrying one bare `it.skip` — must report a left ⊄ right violation whose message names the fixture's leaf title, and must exit non-zero. Without this construction the oracle silently matches two empty sets and passes forever. The red child is invoked with `--testPathIgnorePatterns=/node_modules/` (dropping the config's `helpers/` and `fixtures/` exclusions for that invocation only), because the config-level patterns filter explicitly-passed paths too. | Contract | Integration | AC-1.3, C-8, TSPEC §5.5 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js`, `pdlc/workflows/__tests__/fixtures/skipJoinFalsifier.js` |
| PROP-SUITE-6 | **The children's file lists must be asserted as set-equalities over the argument vector actually handed to `spawn`, and the children must be shown to have collected them.** Two conjuncts, because the first alone cannot distinguish an empty green join from a child that collected nothing: (a) the argument vector's file list **set-equals** the literal list transcribed from TSPEC §5.5's table into the test source — eight modules for the green child (the swept-surface table minus the host), that list ∪ the falsifier for the red child; (b) the set of `testFilePath` values in the child's own `--json` report **set-equals** the same list, and the green child exits `0`. Never containment, and never a value re-derived from the code under test. | Contract | Integration | AC-1.3, TSPEC §5.5 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-SUITE-7 | **A recursion sentinel must fail loudly rather than skip.** The spawn helper sets `PDLC_SKIP_JOIN_NESTED=1` in the child's env and **throws** if the variable is already set in the value about to be passed down. Read from the child's env copy only, never from the parent's own `process.env`, so a developer re-running a failed child by hand gets a named error while the parent's outer run never reds on a stray exported variable. Throwing, not skipping: a skip would itself need a registered inventory row, putting the guard inside the problem it guards. | Error Handling | Integration | C-8, TSPEC §5.5 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-SUITE-8 | **The join's host must carry a paired, falsifiable scan of its own skips.** `consumerCleanup.test.js` is carved out of the nested file set (or the suite spawns itself without bound), so it scans its own source for pending-marker tokens (`it`/`test`/`describe` + `.skip`, `it` + `.todo`, `.skip` + `.each`) outside comments, with the token set **assembled at runtime from fragments** so the scanning code does not match itself. The absence assertion is paired with two positives: the read content is non-empty and contains a known marker of the real host file (TT-1b's `itOrSkip(` call site), and the same scanner pointed at `fixtures/skipJoinFalsifier.js` **reports a hit**. | Contract | Unit | C-8, TSPEC §5.5 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-SUITE-9 | **No file under `pdlc/workflows/__tests__/helpers/` may be left orphaned by the sweep.** Every surviving `*.js` directly under `helpers/` is either (a) reachable by **transitive** import from at least one surviving `*.test.js` module, or (b) named in `pdlc/workflows/package.json`'s `globalSetup` / `globalTeardown`. Both channels are load-bearing: a one-hop rule is false at HEAD for `helpers/skipSink.js`, and a single-channel rule is false for `helpers/skipSinkSetup.js` and `helpers/skipSinkTeardown.js`, which no module imports. The graph is re-derived from the surviving tree; channel (a) matches **module specifiers** (`"./helpers/<name>.js"` in import position, or `new URL("./helpers/<name>.js", …)`), never bare-name greps, so `driftHelpers.test.js`'s stale comment mentioning `skipSinkTeardown.js` cannot satisfy it. Scoped to `*.js` directly under `helpers/`, not `helpers/bin/`. | Data Integrity | Unit | AC-1.3, TSPEC §5.5, §6.1 item 8 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-SUITE-10 | **Every skip the sweep introduces must be a registered one, and `SKIP_INVENTORY` must stay comparator-clean.** Eleven rows land: TT-1b's `uid-nonroot` row (class 3) and ten `"bash"` rows converting `hookCompatibility.test.js`'s `(hasBash ? it : it.skip)` sites (class 6). Each row's `name` equals its call site's leaf title verbatim, its `capability` is a member of `KNOWN_CAPABILITY_KEYS`, and its `unverifiedInvariants` list is **non-empty** and repeated verbatim at the call site (C1/C3). `consolidationHookParity.test.js`'s four `(canRunDifferential ? test : test.skip)` / `(hasBash ? test : test.skip)` ternaries convert in the same commit as the AT-3.3 addition, which requires a **fifth** capability key, `python`. | Contract | Unit | C-8, FSPEC BR-SWEEP-6, TSPEC §5.5 | T08 → `pdlc/workflows/__tests__/helpers/driftCapabilities.js`, `helpers/skipSink.js`; T16 → same two files plus `hookCompatibility.test.js`, `consolidationHookParity.test.js` |
| PROP-SUITE-11 | **`helpers/skipSink.js`'s derivation-rule paragraph must not contradict the code beside it.** Its `WHAT IS NOT ENFORCED, AND WHY` header states the inventory is spec-derived from "TSPEC §1.3's table and PROPERTIES §11.1's two leaves". Eleven new rows derive from **this** feature's TSPEC §5.5 and §3.2 instead; the paragraph is rewritten in the class-3 commit to state the widened derivation, and the property asserts the header's named sources **set-equal** the sources the inventory rows actually cite. A surviving comment that licenses the next maintainer to reject correct rows is a defect, not cosmetics. | Observability | Unit | C-8, TSPEC §5.5 | T08 → `pdlc/workflows/__tests__/helpers/skipSink.js` |

*The swept surface, and why this document's set is wider than FSPEC's approved limb.*
FSPEC BR-SWEEP-6 scopes the prohibition to "M-8's deleted modules and the surviving modules
that host R-8's re-homed assertions". Exactly one module hosts a re-home
(`consumerCleanup.test.js`, TT-3's mode-bit widening), so the approved limb covers neither
`hookCompatibility.test.js` (an M-8 member *reduced in place*) nor the six modules the
sweep edits in classes 7, 9 and 11. PROP-SUITE-4…-6 range over the wider set TSPEC §5.5
tabulates — a **strict superset** of the approved one, so no approved obligation is lost —
and the domain-wording correction stays routed upstream as TSPEC §6.1 erratum 10.
`orchestrateQueue.test.js` and `guardMatrix.test.js` are deliberately **out** of the set
(§9 gap G-2).

### 2.3 PROP-CI — the required-check set and the workflow files (AC-1.4, AC-1.4b, AC-1.4c)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-CI-1 | **The checks rendered by PR-triggered workflow files must set-equal L-7's post-sweep four rows.** `Unit tests (ubuntu-latest, node 20)`, `Engine tests (ubuntu-latest)`, `Shell scripts parse` and `Fixture machine (install/upgrade, launcher, container, two-repo)`, across `pr-tests.yml` and `fixture-machine.yml`. Stated as set-equality and not as an absence check on the two removed names, because absence passes just as well when a third check has silently disappeared. Membership is decided by each file's `on:` trigger, not by its name: `publish.yml` is tag-triggered and outside the set. | Contract | Unit | AC-1.4, FSPEC L-7, BR-DOC-1, AT-1.4 | T02/T03 → `pdlc/engine/__tests__/ci-arrangement.test.js`, `.github/workflows/pr-tests.yml` |
| PROP-CI-2 | **Rows, count word and named files must move together in both human-facing carriers.** In CLAUDE.md's `### Continuous integration` section **and** `pdlc/OPERATIONS.md`'s `## Continuous integration` section, the described rows set-equal L-7's post-sweep set, the prose count word equals `four` (it reads `six checks` at `OPERATIONS.md` today), and the workflow files named set-equal the files those checks are defined in. Three conjuncts per carrier, both carriers in one property, because a maintainer who edits the table and forgets the word ships a document that contradicts itself. | Contract | Unit | AC-1.4, FSPEC BR-DOC-1, M-11l, AT-1.4 | T02/T03 → `pdlc/engine/__tests__/ci-arrangement.test.js`, `CLAUDE.md`, `pdlc/OPERATIONS.md` |
| PROP-CI-3 | **Count words inside the workflow files themselves must equal the required-check set's size.** Two live claims at the base commit — `fixture-machine.yml`'s `six PR-gate jobs` comment and `publish.yml`'s `six rendered check names` comment — become `four` in **class 1**, the same commit that shrinks the set. Neither edit may change a `name:` key, an `on:` trigger or a step: `fixture-machine.yml`'s rendered check survives unchanged (ASM-1) and `publish.yml` stays tag-triggered. The no-change half is asserted positively — the two files' job-name sets and trigger blocks are compared against their pre-sweep values — not left as an unstated intention. | Contract | Unit | AC-1.4, FSPEC BR-DOC-1a, ASM-1 | T02/T03 → `pdlc/engine/__tests__/ci-arrangement.test.js`, `.github/workflows/pr-tests.yml` |
| PROP-CI-4 | **No step of `publish.yml`'s tag-triggered `gate` job may invoke a deleted artifact.** No build-and-check of the retired bundles, no rebuild-diff over them, no two-command bootstrap, no sync invocation, and no executable-bit assertion naming a deleted script; the release path still gates on L-7's surviving checks (positive conjunct — an emptied gate job passes the absences). Asserted **before the sweep closes**, because a failure here surfaces only at the next release tag. | Contract | Unit | AC-1.4b, FSPEC L-8, M-11b, AT-1.4b | T02/T03 → `pdlc/engine/__tests__/ci-arrangement.test.js`, `.github/workflows/publish.yml` |
| PROP-CI-5 | **The engine suite must be green at every commit of the sweep, including the CI-arrangement oracle over the shrunken set and the drift-gate cases the sweep removes.** Positive baseline: the same suite is green at the pre-sweep base commit, with its summary counts captured under BL-08 — a suite that executed zero tests and exited `0` is not a green start (E-23). The engine-side subjects the sweep touches are exactly the NG-5 carve-outs: `smoke.test.js`'s drift-gate and `checkEnabled` cases, `fs-observation.test.js`, and the `fixtures/consumer-ac12/` tree deleted with its only consumer. | Functional | Unit | AC-1.4c, REQ NG-5, BL-08, E-23, AT-1.4c | T04/T05 → `pdlc/engine/__tests__/smoke.test.js`, `pdlc/engine/__tests__/fs-observation.test.js`, `pdlc/engine/__tests__/fixtures/consumer-ac12/` |
| PROP-CI-6 | **The arrangement oracle's own explanatory prose must name the post-sweep carrier and count.** After the sweep it routes a maintainer to CLAUDE.md's `### Continuous integration` section — the one carrier an oracle covers — and not to a `docs/completed/**` FSPEC section as the live source. Correcting a pointer *into* history is not editing history (BR-DOC-5 forbids the latter only). | Observability | Unit | FSPEC BR-DOC-1b, BR-DOC-5 | T02/T03 → `pdlc/engine/__tests__/ci-arrangement.test.js` |

*Why the arrangement oracle and its workflow files land in one commit.* `ci-arrangement.test.js`
derives FSPEC §5.1's required-check set from a hand-maintained table and asserts two
set-equalities plus a count word against the rendered job names. Removing a job without
editing the carrier reds it; editing the carrier without removing the job reds it too.
C-7 therefore outranks C-5 here and class 1 lands whole (BR-SWEEP-3) — the single largest
correctness hazard in the sweep, and the reason PROP-CI-1…-4 all sit on one red/green pair.

### 2.4 PROP-HOOK — hooks, their manifest, and their observables (AC-1.7, AC-3.3, C-2)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-HOOK-1 | **`pdlc/hooks/hooks.json`'s registered entry set, keyed by (event, matcher, script name), must set-equal L-4's four surviving rows**: `PreToolUse`/`Bash`/`guard-harvest-before-delete.sh`, `PostToolUse`/`Write\|Edit`/`check-scope-field.sh`, `PostToolUse`/`Write\|Edit`/`check-req-size.sh`, `SessionStart`/—/`nudge-consolidation.sh`. An absence check on `check-workflow-drift.sh` alone is **not** sufficient and is explicitly forbidden: deleting the whole `SessionStart` event satisfies it while losing the consolidation nudge (E-14). | Contract | Unit | AC-1.7, C-2, FSPEC L-4, BR-HOOK-1, AT-1.7 | T09/T10 → `pdlc/workflows/__tests__/hookCompatibility.test.js`, `pdlc/hooks/hooks.json` |
| PROP-HOOK-2 | **Each of the four surviving hooks must emit its named observable on its own channel, with its own exit status.** `guard-harvest-before-delete.sh` is a **PreToolUse blocker**: on a blocked delete it writes a refusal message naming the missing LEARNINGS file to **stderr** and exits **`2`**, and exits `0` otherwise. `check-scope-field.sh`, `check-req-size.sh` and `nudge-consolidation.sh` each emit a `hookSpecificOutput.additionalContext` string inside a **JSON object on stdout** and exit **`0`**, naming respectively the missing `Scope:` field, the exceeded REQ size budget, and the stale LEARNINGS count. A blanket "warning on stderr, non-zero exit" harness would be a false oracle: it fails three correct hooks and passes the guard for the wrong reason. `check-scope-field.sh`'s clause is strengthened from stdout *containment* to a parsed `JSON.parse(stdout).hookSpecificOutput.additionalContext`, matching `PROP-COMPAT-06`'s existing shape; the exit assertion already present is not duplicated. | Contract | Unit | AC-3.3 clause 2, C-2, AT-3.3 | T16 → `pdlc/workflows/__tests__/hookCompatibility.test.js`, `pdlc/workflows/__tests__/consolidationHookParity.test.js` |
| PROP-HOOK-3 | **`cleanup-consumer-workflows.sh` must never appear in `pdlc/hooks/hooks.json`.** Nothing invokes the cleanup automatically — not a hook, not a session-start action, not the engine's startup path. Asserted as a conjunct of PROP-HOOK-1's set-equality (the script is not a member) plus a directed check on the manifest's command strings, so a future entry added under a new event name still reds. | Negative / Security | Unit | REQ NG-6, C-9, FSPEC BR-CLN-1 | T09/T10 → `pdlc/workflows/__tests__/hookCompatibility.test.js`; T30 → `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` |
| PROP-HOOK-4 | **Every shipped hook script must carry index mode `100755`, be executable on disk in a fresh clone, and survive bare-path invocation without exit `126`.** The enumeration is the post-sweep shipped set — `cleanup-consumer-workflows.sh`, `check-req-size.sh`, `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` — and a companion assertion requires that enumeration to **set-equal** the executable scripts actually tracked under `pdlc/hooks/scripts/`, re-derived inline from `git ls-files -s`, so a script added later without its mode bit fails rather than passing unlisted. One-directional by design (tracked-executable ⇒ enumerated); the converse belongs to PROP-HOOK-1, and `cleanup-consumer-workflows.sh` is deliberately unregistered. This re-homes `bootstrap.test.js`'s §9.3 mode-bit block **before** class 6 deletes its host, and **widens** it: `check-req-size.sh` was never a `FIVE_SCRIPTS` member though it is tracked `100755` and registered today. Index mode is re-derived inline via `git ls-files -s` (the `indexMode` helper dies with M-8); the fresh-clone half imports `makeFreshClone` from `helpers/freshClone.js`, which is not an M-8 member. | Contract | Integration | AC-3.3, R-8, TSPEC §4.4, §5.2 TT-3 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |

*Why the mode-bit block is re-homed rather than dropped.* `bootstrap.test.js` is the sole
module in the repo asserting the `100755` constraint, and CLAUDE.md's fresh-clone rule —
invoke by bare path, no `bash`/`sh` prefix; `126` means the mode bit was lost — is a live
project constraint. Deleting the host in class 6 would silently drop coverage for **three
still-shipped** scripts, not the two retired ones. PLAN's graph enforces the order: T07 in
batch 6, T15 in batch 14.

### 2.5 PROP-GATE — the queue drift gate is removed, not bypassed (C-3)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-GATE-1 | **`orchestrate-queue.js` must carry no drift gate and no `distribution.checkEnabled` parse** — no dead flag, no permanently-true branch, no config key a consumer can set with no effect. Asserted over the module's exported surface and source, paired with the positive conjunct of PROP-GATE-2 so that "no gate" cannot be satisfied by a module that no longer runs at all. | Negative / Contract | Unit | C-3, FSPEC BR-GATE-1, class 3 | T06/T08 → `pdlc/workflows/__tests__/orchestrateQueue.test.js`, `pdlc/workflows/orchestrate-queue.js` |
| PROP-GATE-2 | **A consumer config still carrying `distribution.checkEnabled` must be ignored silently.** Positive form, three conjuncts in one run: the pass completes, its terminal disposition equals the disposition of the same pass with the key absent, and neither the output nor the report names the key. Never "does not error" alone — a pass that halts for an unrelated reason satisfies that. | Error Handling | Unit | C-3, FSPEC BR-GATE-2, E-15 | T06/T08 → `pdlc/workflows/__tests__/orchestrateQueue.test.js` |
| PROP-GATE-3 | **`queueDriftGate.test.js` must be deleted in the class-3 commit that removes its subject, and the four queue-disposition titles it shared with `orchestrateQueue.test.js` must remain.** The deletion and the survivor check are one property because either alone admits the wrong tree: deleting the module while its surviving half is unowned loses coverage silently (R-8); keeping it after the gate is gone leaves a module asserting a branch that no longer exists (C-7). | Data Integrity | Unit | C-3, C-8, R-8, FSPEC L-6 row 1 | T06/T08 → `pdlc/workflows/__tests__/orchestrateQueue.test.js`, `pdlc/workflows/__tests__/queueDriftGate.test.js` |

### 2.6 PROP-BUILD — the reduced build step and the surviving probe CLI (AC-1.1, G-5, AC-5.3)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-BUILD-1 | **Run against a clean temporary `dist/`, `build-runtime.mjs` must emit a file set that set-equals `{pdlc-cli.mjs}`.** Set-equality, not containment: a surviving bundle fails, and so does a silently-emitted `distribution-manifest.json`. Stdout carries exactly one `wrote` / `in-sync` row. Asserting only "pdlc-cli.mjs is present" would pass the pre-sweep builder unchanged. | Contract | Unit | AC-1.1, FSPEC L-1, TSPEC §3.1, §4.1, DEC-02, AT-1.1 | T17/T19 → `pdlc/workflows/__tests__/consolidationBuild.test.js`, `pdlc/workflows/build-runtime.mjs` |
| PROP-BUILD-2 | **`--check` must stay a usable staleness gate over the one surviving artifact**: exit `0` when in sync, and on a mutated artifact print `STALE pdlc/workflows/dist/pdlc-cli.mjs` on **stderr** and exit **`1`** — the literal and the status both pinned, since "non-zero" is satisfied by a builder that crashes on its own reduction. | Error Handling | Unit | AC-5.3, TSPEC §3.1, DEC-02 | T17/T19 → `pdlc/workflows/__tests__/consolidationBuild.test.js` |
| PROP-BUILD-3 | **The builder must stay dependency-free.** It runs under plain `node` before `npm install`, in a fresh clone with no installed plugin and no network — the property CLAUDE.md's two-command bootstrap rested on, and the one that keeps the surviving artifact regenerable. Asserted by invoking it with an empty `node_modules` fixture root, not by reading its import list. | Contract | Unit | G-5, R-5, TSPEC §3.1 | T17/T19 → `pdlc/workflows/__tests__/consolidationBuild.test.js` |
| PROP-BUILD-4 | **Assertions that read `build-runtime.mjs`'s source text must be corrected in the same commit that deletes the symbols they name.** `pipelineWiring.test.js`'s `devMeta()` reader (`RLH-CR-F1` / `RLH-CR-F7`, hand-maintained `meta.inputs` copies) and `consolidationPreflight.test.js`'s `T00 BL-PREREQ: build-runtime.mjs source-text presence` block are gate-read dependents, so BR-SWEEP-4 binds them to class 7 — never to a later commit. | Data Integrity | Unit | AC-1.8, FSPEC BR-SWEEP-4, TSPEC §2.8 | T19 → `pdlc/workflows/__tests__/pipelineWiring.test.js`, `pdlc/workflows/__tests__/consolidationPreflight.test.js` |
| PROP-BUILD-5 | **The probe CLI must remain generated, tracked at `pdlc/workflows/dist/pdlc-cli.mjs`, and answer as before.** It is not converted to a hand-maintained checked-in file (E-10): the property pairs "the tracked artifact matches the build step's output" (`--check` exits `0`) with an invocation of the CLI at its surviving path in a checkout of the consuming project, whose answers are compared field-wise against the pre-sweep capture. No path change, so no operator muscle memory breaks (DEC-01). | Contract | Manual + Unit | G-5, AC-5.3, R-5, DEC-01, AT-5.3 | T17/T19 → `pdlc/workflows/__tests__/consolidationBuild.test.js`; T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |
| PROP-BUILD-6 | **The post-wave build gate's two config-example keys must survive with their values intact.** `.claude/pdlc.config.example.json`'s `implementation.postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and `implementation.postWavePathspecs` (`["pdlc/workflows/dist/"]`) stay load-bearing after the reduction, because a wave that edits a `CLI_SOURCES` input without regenerating leaves the tracked artifact stale and reds PROP-BUILD-2. Class 10 edits **prose only**; the tracked config assertion is tightened from containment to **set-equality over `postWavePathspecs`**, while `consolidationPreflight.test.js`'s presence-gated read of the operator's untracked config stays containment. | Contract | Unit | REQ C-5, DEC-08, TSPEC §2.2, §6.1 erratum 5 | T25/T26 → `pdlc/workflows/__tests__/consolidationPreflight.test.js` |

### 2.7 PROP-DEL — the plugin as delegator (G-2, AC-3.1, AC-3.3, AC-3.4)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-DEL-1 | **Each delegator SKILL.md must be conjunctively correct, not merely free of pipeline logic.** Four conjuncts, because clause (d) alone is satisfied by an empty file: (a) the invocation line is present **verbatim** — `pdlc dev <req-path>` in `orchestrate-dev/SKILL.md`, `pdlc queue` in `orchestrate-queue/SKILL.md`; (b) the three-step resolution ladder of TSPEC §3.3 is present; (c) the relay rule and the refusal rule are present; (d) no queue-selection, readiness-evaluation, phase-dispatch, verdict-parsing or queue-row-writeback text remains. | Contract | Unit | AC-3.1, FSPEC BR-DEL-1, TSPEC §3.3, AT-3.1 | T18/T20 → `pdlc/workflows/__tests__/skillFiles.test.js`, `pdlc/workflows/__tests__/orchestrateDevSkill.test.js`, `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md` |
| PROP-DEL-2 | **`RLH-SKILL-10` must hold as two conjuncts over `consolidate-learnings/SKILL.md`.** Post-sweep, at HEAD: (i) **every path the file names exists** in the tree, and (ii) the file **references no retired host** — not `consolidate-learnings.bundle.js`, not `.claude/workflows/`, not a module nothing loads. Black-box and source-text only: no skill is executed, so AT-3.3's "loads and runs when invoked" exclusion stands unchanged. Conjunct (i) is what stops the rewrite from pointing at a plausible-sounding path that does not exist; conjunct (ii) is what stops it from keeping the old one. | Contract | Unit | AC-3.1, REQ O-8, DEC-10, FSPEC §3.3 step 4, TSPEC §5.2 | T18/T20 → `pdlc/workflows/__tests__/skillFiles.test.js`, `pdlc/skills/consolidate-learnings/SKILL.md` |
| PROP-DEL-3 | **`pdlc/skills/*/SKILL.md` must set-equal L-10's fifteen names.** The sweep edits three of these files and deletes none; skill file locations do not move, so every known `ptah.config.json` `skill_path` still resolves and the engine's catalogue is untouched. Set-equality: a skill quietly added or dropped is as much a defect as one deleted. | Contract | Unit | AC-3.3 clause 1, AC-3.4, C-4, FSPEC L-10, AT-3.3, AT-3.4 | T18/T20 → `pdlc/workflows/__tests__/skillFiles.test.js` |
| PROP-DEL-4 | **The pre-existing delegator assertions must survive the rewrite.** `RLH-SKILL-08` (`orchestrate-dev/SKILL.md` documents the POSTMORTEM lifecycle and the human-written `RESOLVED:` marker) and `RLH-SKILL-09` (`orchestrate-queue/SKILL.md` documents that a `halted` row is committed) are re-pointed at the delegator prose rather than deleted — the thin rewrite must not quietly retire behaviour the review-loop-hardening feature pinned. | Contract | Unit | REQ NG-3, DEC-05, TSPEC §2.4 | T18/T20 → `pdlc/workflows/__tests__/skillFiles.test.js` |
| PROP-DEL-5 | **No surviving skill or workflow-module banner may name a `.claude/workflows/` bundle.** `orchestrateDevSkill.test.js`'s banner assertion is retargeted in class 11, and the three workflow modules' header banners are rewritten in the same commit — the retarget is an *edit*, not a deletion, so the module keeps asserting that a banner exists and says where the code now runs. | Negative / Contract | Unit | AC-1.2, REQ G-3, TSPEC §2.9 class 11 | T18/T20 → `pdlc/workflows/__tests__/orchestrateDevSkill.test.js`, `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/consolidate-learnings.js` |
| PROP-DEL-6 | **One `/pdlc:orchestrate-queue` invocation must produce exactly one engine CLI call and process at most one ready feature.** The session transcript's tool-invocation **sequence** for the skill has **length 1** — counted as a sequence, not a set, so a second identical invocation reds instead of collapsing into one member — the engine's run report carries a non-empty dispatch record, and the relayed report's fields are intact. The `/loop run /pdlc:orchestrate-queue` habit is preserved because the loop stays in the session, outside the skill. | Integration | Manual | AC-3.1, G-2, FSPEC BR-DEL-2, BR-DEL-4, AT-3.1 | T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |
| PROP-DEL-7 | **On an engine refusal the skill must surface the banner and the refusal together, unedited, and report the invocation as refused.** It does not retry, does not fall back to any in-plugin path (there is none), and does not shorten the refusal into a message that drops a version — the banner is where the version triple lives, so relaying the refusal line alone hides the diagnosis. | Error Handling | Manual | AC-3.6, FSPEC BR-DEL-3, E-20 | T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |

### 2.8 PROP-VER — the version handshake survives the sweep (C-10, BL-07, AC-3.2/3.5/3.6)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-VER-1 | **The post-sweep plugin version must satisfy the engine's declared range, asserted positively.** `pdlc/.claude-plugin/plugin.json` reads `0.23.2` (a patch bump from `0.23.1`) and `satisfiesRange(version, pdlcPluginCompat).ok === true` against `pdlc/engine/package.json`'s `pdlcPluginCompat`. Not "the version is a string" and not "no refusal was observed": the decision function itself is called, with the two real values. Under the leftmost-non-zero caret semantics of `pdlc/engine/lib/handshake.mjs`'s `satisfiesRange`, `^0.23.0` admits `0.23.x` and **not** `0.24.0`. | Contract | Unit | C-10, BL-07, FSPEC BR-VER-1, DEC-09, TSPEC §4.6 | T23/T24 → `pdlc/engine/__tests__/handshake.test.js`, `pdlc/.claude-plugin/plugin.json` |
| PROP-VER-2 | **A `0.24.0` plugin version against the published `^0.23.0` engine must refuse, and the sweep must never ship one.** The falsifying construction is built without publishing anything: the plugin root is copied to a temp fixture, the copy's `version` is set to `0.24.0`, and the engine is run against that root. The refusal is asserted with three positive conjuncts — engine version, plugin version, and expected range all present in the terminal output (banner plus refusal together) and in the run report — plus a dispatch count of `0`, so "refused" cannot be satisfied by a crash after dispatch. Nothing in the tree is mutated. | Error Handling | Integration | AC-3.6, C-10, FSPEC BR-VER-3, E-19, AT-3.6 | T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |
| PROP-VER-3 | **With the plugin absent, the engine must refuse before dispatching any skill-driven phase and name the missing plugin as the cause.** A pre-satisfied regression guard, re-asserted **after** the sweep with the post-sweep plugin version — the point is that the removal did not change it. | Error Handling | Manual | AC-3.2, AT-3.2 | T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |
| PROP-VER-4 | **With an in-range plugin installed, the matched path must still run**: the handshake passes, the run proceeds, and the banner reports the same triple. Asserted post-sweep with the bumped version, so both the refusal branch (PROP-VER-2, PROP-VER-3) and the accepting branch are shown to survive; asserting only the refusals would leave a permanently-refusing engine green. | Contract | Manual | AC-3.5, BL-07, AT-3.5 | T33 [manual] → `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` |

### 2.9 PROP-CLEAN — the operator-invoked consumer cleanup (G-4, C-9, NG-6)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-CLEAN-1 | **Given a target holding every one of L-11's nine installed names and a non-empty `.pdlc-backups/`, one run must remove all nine, remove the directory left empty by that removal, leave the repo's tracked files unchanged, exit `0`, and report each removed path.** `git status --porcelain` is empty afterwards (positive control on the tracked half). Second construction, same expected outcome: the copy present with **no** `.pdlc-drift-state.json` — a consumer that never enabled the drift hook — where the missing record is neither an unexpected entry nor an error. | Functional | Integration | AC-4.1, FSPEC §3.5, BR-CLN-5, L-11, AT-4.1 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js`, `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` |
| PROP-CLEAN-2 | **A second run over an already-cleaned repo must change nothing, say so, and exit `0`.** Idempotence is structural — after a successful run the directory is gone and the next run takes the "nothing to clean" row — but it is asserted as behaviour, with the stdout line naming the inspected path, not inferred from the structure. | Idempotency | Integration | AC-4.2, FSPEC BR-CLN-2, E-17, AT-4.2 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-3 | **One unexpected entry must refuse the whole invocation, with four conjuncts.** Given the AT-4.1 target **plus** one entry whose name is in no L-11 row: (a) **every** L-11 entry is still present and **byte-identical**, compared by content against a recorded, **non-empty** pre-state — not by "the directory is not empty", which a directory holding only the unexpected entry satisfies vacuously; (b) the unexpected entry is itself byte-identical; (c) its path is named on **stderr**; (d) the exit status is **exactly `3`**. "Non-zero" is explicitly rejected: `127` from a missing interpreter would green a step that never ran. Two constructions, same four clauses: an operator-created file, and a `.pdlc-tmp.<pid>.<rand>` residue the retired channel itself left behind when a write was killed mid-rename (E-16b). | Error Handling | Integration | AC-4.3, C-9, FSPEC BR-CLN-3, BR-CLN-3a, BR-CLN-4, E-16, E-16b, AT-4.3 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-4 | **A `distribution-manifest.json` inside the consumer's `.claude/workflows/` must refuse.** It is a repo-side build artifact the retired channel never installed, so it is **not** an L-11 member however familiar the name looks — the property exists because L-1 and L-11 are different sets and the confusion is the plausible implementer error. Same four conjuncts as PROP-CLEAN-3. | Error Handling | Integration | AC-4.3, FSPEC L-11, E-16 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-5 | **A usage error must exit exactly `4` and remove nothing.** An unrecognised argument (`--nope`) over a fully-populated target: exit `4`, and every entry still present byte-identical against a non-empty pre-state. `4` stays reserved for the tooling-usage class and is never reused for refusal, mirroring the retired `sync-workflows.sh`'s five-status convention so the operator's existing expectation transfers. | Error Handling | Integration | FSPEC BR-CLN-4, TSPEC §3.2 row 4a, §6.1 erratum 7 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-6 | **An unreadable target must exit exactly `4` and print a diagnostic naming the failing path on stderr.** Constructed with `chmod 000`, which cannot be constructed as root, so the row is root-conditional — and the skip is **registered**, not bare: it goes through `itOrSkip` with a `SKIP_INVENTORY` capability entry keyed `uid-nonroot`, reaching the run's skip sink as a record and therefore satisfying PROP-SUITE-4 as written. Only two conjuncts are asserted; the partial-`rm` arm of contract row 4b is deliberately oracle-free (§9 gap G-1). | Error Handling | Integration | FSPEC BR-CLN-4, TSPEC §3.2 row 4b, §5.2 TT-1b | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js`; T16 → `pdlc/workflows/__tests__/helpers/driftCapabilities.js` |
| PROP-CLEAN-7 | **`--dry-run` must preview without removing, on both outcomes.** Over the full set: the per-entry lines a live run would print appear, exit `0`, and **every entry is still present byte-identical afterwards** — a positive conjunct, not merely "no error". Over a tree holding one unexpected entry: the refusing path is printed on stderr, exit is **exactly `3`**, and nothing is removed. | Contract | Integration | TSPEC §3.2 row 5, §5.2 TT-2 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-8 | **All-or-nothing must hold over arbitrary subsets of the expected-name set, not only over the three hand-built fixtures.** Property-based: draw a subset of §4.3's nine expected names; with no unexpected name added, every drawn entry is removed and the exit status is `0`; with at least one unexpected name added, **nothing at all** is removed and the exit status is `3`. This is the one parameterisable component in the feature, and the property is what proves the classifier is a predicate over names rather than a hard-coded match on the fixtures. | Functional | Integration | AC-4.1, AC-4.3, C-9, FSPEC BR-CLN-3a, TSPEC §5.2 TT-4 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-9 | **A file the consumer tracks in git, found inside the target directory, must be treated as unexpected and must refuse.** Tracked files are never touched (BR-CLN-5); the property is separate from PROP-CLEAN-3 because the entry's *name* may legitimately be an L-11 member while its tracked-ness makes deletion the wrong act — the refusal path, not the removal path, owns this case (E-18). | Security / Data Integrity | Integration | AC-4.1, C-9, FSPEC BR-CLN-5, E-18 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| PROP-CLEAN-10 | **Leftovers must be inert for a consumer who never runs the cleanup.** A feature run in a repo still holding the runtime copy reaches its **configured final phase** (the positive half — without it, an unrelated failure satisfies the absences), the written report's **field set** equals the field set of the same feature's run in a leftover-free repo compared under PROP-RUN-1's rule, and neither a line of the run's output nor a report field names a leftover path. Two runs are required to falsify it, and both are part of the evidence. | Integration | Manual | AC-4.4, R-6, FSPEC BR-CLN-6, AT-4.4 | T32 [manual] → `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-pdlc-plugin-retirement.md` |
| PROP-CLEAN-11 | **The cleanup must classify by name only, and its name set must live with the tool.** The nine expected names are a literal inside `cleanup-consumer-workflows.sh`; no manifest is read (class 7 deletes it, and it was never installed consumer-side) and no content is compared. The stated consequence is asserted rather than left implicit: a file with an **expected name and hand-modified content is removed** like any other expected entry, because the cleanup judges presence, not provenance — a scope decision of REQ C-9 (v0.16), not an impossibility. `.pdlc-backups/` is expected **as a whole directory** and removed with its contents; the timestamped `.bak` files inside are never classified individually. | Contract | Integration | C-9, AC-4.3, FSPEC BR-CLN-3a, E-16a, TSPEC §4.3 | T07/T30 → `pdlc/workflows/__tests__/consumerCleanup.test.js`, `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` |

*Why the cleanup script and its test may carry retired vocabulary.* Both files transcribe
L-11's nine names literally, and three of those names match L-2 terms (`\.bundle\.js`,
`pdlc-drift-state`). L-3's command searches `git ls-files`, so without an A-1 allow-list
extension the sweep's own removal tool would red AT-1.2 the moment it lands. PLAN's T29
extends A-1 **before** class 13 lands (TSPEC §6.3 T-4); PROP-SWEEP-3 is what keeps that
extension honest — it must carry per-file dispositions, not merely widen the filter.

### 2.10 PROP-DOC — the human-facing record after the sweep (G-3, AC-2.x)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-DOC-1 | **No tracked document may instruct a reader to run a removed command or read a removed file.** The oracle is the L-3 command with the A-1 allow-list applied: zero matches across `git ls-files` outside the allow-list, paired with the PROP-SWEEP-3 positive control that proves the search still finds a planted string. Documents are in scope exactly as code is — an instruction to run `sync-workflows.sh` is as broken as a call to it. | Functional | Unit | AC-2.1, C-7, FSPEC BR-DOC-2, L-3 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `CLAUDE.md`, `pdlc/OPERATIONS.md` |
| PROP-DOC-2 | **The two-command fresh-clone bootstrap must be replaced by the surviving procedure, and the replacement must be asserted positively.** `CLAUDE.md`'s bootstrap section names the build step and no sync step; the assertion checks that the new text is *present*, not merely that `sync-workflows.sh` is absent — an accidentally emptied section passes an absence-only check. | Functional | Unit | AC-2.1, AC-2.2, FSPEC BR-DOC-3 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `CLAUDE.md` |
| PROP-DOC-3 | **The hooks table must list exactly the four surviving hooks and the plugin-channel description must be gone.** Set-equality against the four names — a containment check would pass with the retired `check-workflow-drift` row still present. This is the document-side twin of PROP-HOOK-1, and the two are asserted separately on purpose: `hooks.json` and `CLAUDE.md` drift independently. | Functional | Unit | AC-2.1, AC-2.2, FSPEC BR-DOC-2, L-4 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `CLAUDE.md` |
| PROP-DOC-4 | **`pdlc/OPERATIONS.md`'s required-check rows and its stated count must agree with the four-row CI set, and both must agree with CLAUDE.md.** Three surfaces, one fact: the workflow files' `on:` triggers (PROP-CI-1), the OPERATIONS rows, the CLAUDE.md rows. Any pair agreeing while the third dissents is a red gate, so no single edit can quietly satisfy the oracle. | Functional | Unit | AC-2.2, C-7, FSPEC BR-DOC-4, L-8 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/OPERATIONS.md` |
| PROP-DOC-5 | **`pdlc/RELEASE-CHECKLIST.md` must not commit the releaser to a step the sweep removed, and must retain every commitment the sweep did not touch.** The retention half is the load-bearing one: a checklist trimmed to nothing satisfies "no removed step" perfectly. Asserted as a set-equality over the surviving commitment lines. | Functional | Unit | AC-2.2, FSPEC BR-DOC-4 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/RELEASE-CHECKLIST.md` |
| PROP-DOC-6 | **The distribution decision record must gain a superseding entry rather than have its history rewritten.** The prior entries that chose the plugin channel remain byte-identical against a recorded non-empty pre-state; the new entry names what supersedes them and why. A decision log whose losing options are edited away cannot explain the sweep to a future reader, which is the whole reason G-3 exists. | Data Integrity | Unit | AC-2.3, FSPEC BR-DOC-5, DEC-04 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `docs/_decisions/DECISIONS-plugin-distribution.md` |
| PROP-DOC-7 | **Every README that described the retired channel must describe the surviving one, and no README may be left describing neither.** Per-file, over the READMEs named in PLAN §3 — a repo-wide grep for the retired term greens on a README that was simply gutted. | Functional | Unit | AC-2.1, FSPEC BR-DOC-2 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js` |
| PROP-DOC-8 | **`docs/_queue/QUEUE.md`'s row for this feature must reach a terminal state consistent with the branch's artifacts, and no other row may change.** The second clause is what the property is for: a sweep that renumbers or reorders unrelated queue rows silently invalidates other features' dependency edges. | Data Integrity | Unit | AC-2.3, C-6 | T27/T28 → `pdlc/workflows/__tests__/documentOracles.test.js`, `docs/_queue/QUEUE.md` |

### 2.11 PROP-RUN — a real feature run after the sweep (AC-5.x, R-6)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-RUN-1 | **A post-sweep engine run of a real feature must reach its configured final phase and produce a report whose field set equals the pre-sweep field set.** Compared as a set of key-paths with TSPEC §4.5's excluded key-paths (timestamps, durations, commit shas, absolute paths) removed from both sides — the exclusion list is a named constant in the test, not an inline literal, so widening it is a reviewable edit. Field-**set** equality, not "the report parses": a report that lost its phase results still parses. | Integration | Manual | AC-5.1, R-6, TSPEC §4.5, AT-5.1 | T32 [manual] → `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-pdlc-plugin-retirement.md` |
| PROP-RUN-2 | **No line of the run's output and no report field may name the retired channel.** Absence over the L-2 term set, admissible only because PROP-RUN-1 already establishes on the same run that the output is non-empty and the run completed — the positive control the absence needs is the sibling property, and both are evidenced from one transcript. | Integration | Manual | AC-5.2, FSPEC BR-CLN-6, AT-5.2 | T32 [manual] → `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-pdlc-plugin-retirement.md` |
| PROP-RUN-3 | **The run must resolve its workflow modules from the engine's vendored copy, and the resolved paths must be recorded.** The recorded paths lie under the installed engine package; **none** lies under any `.claude/workflows/`. Recording the paths is part of the property: "it worked" is compatible with having silently loaded a leftover consumer copy, which is precisely the failure AC-5.1 exists to exclude. | Integration | Manual | AC-5.1, R-6, C-8 | T32 [manual] → `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-pdlc-plugin-retirement.md` |

### 2.12 PROP-COMMIT — per-commit invariants across the sweep (C-5, AC-1.8)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-COMMIT-1 | **A pre-flight baseline must record, on the tip before class 1 lands, that L-9's three gate commands are green — and the record must be replayable.** The baseline stores each command with its status, so a later red can be attributed rather than argued about. Without it, a command that was already red at branch point looks like sweep damage, and the sweep gets blamed or, worse, the gate gets widened to hide it. | Data Integrity | Unit | AC-1.8, C-5, FSPEC L-9, TSPEC §6.3 T-1 | T01 → `pdlc/engine/__tests__/preflight-baseline.test.js` |
| PROP-COMMIT-2 | **Every commit in the sweep must leave the three gate commands green.** Judged per commit, not only at branch tip: a batch that reds T14 and greens again at T20 has shipped commits no bisect can cross, and PLAN's batch-safety rules exist precisely to keep each batch self-consistent. | Contract | Unit | AC-1.8, C-5, FSPEC L-9, BR-SWEEP-3 | T01/T13 → `pdlc/engine/__tests__/preflight-baseline.test.js` |
| PROP-COMMIT-3 | **Classes 7 and 11 must land in the same commit.** Class 7 removes the manifest that class 11's CLI reads; either alone is a red tip. The property is asserted as a same-commit membership check over the two tasks' owned paths (T19, T20 — PLAN batch 16), not as "both are on the branch". | Contract | Unit | DEC-10, TSPEC §6.3 T-5, PLAN §4 | T01/T13 → `pdlc/engine/__tests__/preflight-baseline.test.js` |
| PROP-COMMIT-4 | **The suite-count literal is judged on `(file, section)`, and a disagreement between the owning document and any other is red.** FSPEC L-5 says the post-sweep count is **97**; TSPEC §4.4 says **99** because `hookCompatibility.test.js` is reduced in place rather than deleted. Erratum-6 (DEC-07) records that the two are stated about different things; this property forbids a downstream document from restating either number in its own voice. PROP-SUITE-1 asserts the owning document's literal; this one asserts that no other document contradicts it. Reconciling by editing both to match would defeat both properties. | Data Integrity | Unit | FSPEC L-5, TSPEC §4.4, §6.1 erratum 6, DEC-07 | T11/T12 → `pdlc/workflows/__tests__/hookCompatibility.test.js` |
| PROP-COMMIT-5 | **Every tracked `*.sh` must parse.** `bash -n` over `git ls-files '*.sh'` — a set-valued source, so a script added by class 13 is covered without editing the test. Cheap, and it catches the class of damage a wholesale-deletion sweep most plausibly causes: a heredoc or `if` fence left unbalanced by a removed block. | Contract | Unit | C-5, FSPEC L-9, BR-SWEEP-6 | T01/T13 → `pdlc/engine/__tests__/preflight-baseline.test.js` |
| PROP-COMMIT-6 | **The T13 erratum gate must fail loudly if the reduction leaves the count at neither 97 nor 99.** A third number means the reduction removed something the errata did not account for; the gate names both accounted-for values and the observed one, so the operator can tell an unplanned deletion from a re-homing. | Error Handling | Unit | TSPEC §6.1 erratum 6, §6.3 T-3, DEC-07 | T13 → `pdlc/engine/__tests__/preflight-baseline.test.js` |

## 3. Negative properties — what must *not* happen

These are stated separately because each names a specific plausible implementation that
would satisfy some property above while defeating its purpose. They are review criteria,
not extra tests.

| Id | Must not happen | Defeated property, if allowed |
|---|---|---|
| NEG-1 | The A-1 allow-list is widened to a pattern (a directory, a glob) rather than extended with named files carrying per-file dispositions. | PROP-SWEEP-3 — a pattern silently absorbs future reintroductions of the retired surface. |
| NEG-2 | A suite-count or check-count assertion is changed to a range, a `>=`, or a `toBeGreaterThan`. | PROP-SUITE-1, PROP-CI-2, PROP-DOC-4 — the point of these is exact agreement between a literal and a derived count. |
| NEG-3 | The 97-vs-99 disagreement is "fixed" by editing FSPEC L-5 and TSPEC §4.4 to the same number. | PROP-COMMIT-4 — the two numbers describe different things; unifying them destroys the record erratum-6 exists to preserve. |
| NEG-4 | The skip-join oracle's red-child falsifier is skipped, quarantined, or gated behind an env var that CI does not set. | PROP-SUITE-4, PROP-SUITE-5 — an unexercised falsifier is indistinguishable from a broken one. |
| NEG-5 | A capability skip is written as a bare `it.skip` or an early `return` instead of `itOrSkip` with a `SKIP_INVENTORY` entry. | PROP-SUITE-9, PROP-CLEAN-6 — unregistered skips do not reach the skip sink, so the join reports a complete run that silently omitted rows. |
| NEG-6 | The cleanup's refusal is asserted as "non-zero exit" rather than exactly `3`, or its usage error as "non-zero" rather than exactly `4`. | PROP-CLEAN-3, PROP-CLEAN-5 — `127` from a missing interpreter greens a step that never ran. |
| NEG-7 | The cleanup gains a content check, a manifest read, or a hash comparison to decide what to remove. | PROP-CLEAN-11 — C-9 scopes the tool to name-only classification; content-awareness reintroduces the manifest dependency class 7 removes. |
| NEG-8 | Classes 7 and 11 are split across commits "to keep the diff reviewable". | PROP-COMMIT-3 — either commit alone is a red tip that no bisect can cross. |
| NEG-9 | A document is emptied of retired text without gaining the replacement text. | PROP-DOC-2, PROP-DOC-5, PROP-DOC-7 — absence-only oracles green on a gutted document. |
| NEG-10 | The post-sweep run (T32) is evidenced by a single transcript asserting only absences. | PROP-RUN-1, PROP-RUN-2 — the absence needs the completion and field-set evidence from the same run, and the leftover comparison needs a second run. |
| NEG-11 | A byte-identity survival assertion is made against a pre-state that was not recorded, or that was empty. | PROP-SWEEP-6, PROP-CLEAN-3, PROP-CLEAN-7, PROP-DOC-6 — "unchanged" over an empty baseline is vacuously true. |
| NEG-12 | The plugin version is bumped past the engine's declared range to "unblock" a refusal seen during the sweep. | PROP-VER-1, PROP-VER-2 — the refusal is the feature; bumping out of range turns a working gate into a silent mismatch. |

## 4. Acceptance-test coverage

Every `AT-` below is one of FSPEC §6's twenty-six acceptance tests, and the set of `AT-`
ids appearing in this document set-equals that set. Each row also names the PLAN §2.1
task that carries it, so a reader can go from acceptance test to property to commit.

| AT | Properties | PLAN task(s) |
|---|---|---|
| AT-1.1 | PROP-SWEEP-1, PROP-SWEEP-2 | T02–T06, T14 |
| AT-1.2 | PROP-SWEEP-3, PROP-DOC-1 | T29, T27 |
| AT-1.3 | PROP-SUITE-1…3, PROP-SUITE-6…8 | T11–T14, T21, T22 |
| AT-1.4 | PROP-CI-1, PROP-CI-3 | T25 |
| AT-1.4b | PROP-CI-2, PROP-CI-4 | T25, T27 |
| AT-1.4c | PROP-CI-5, PROP-CI-6 | T25, T26 |
| AT-1.5 | PROP-SWEEP-4, PROP-SWEEP-5 | T02–T06 |
| AT-1.6 | PROP-BUILD-1…4 | T19, T20 |
| AT-1.7 | PROP-HOOK-1…4 | T15–T18 |
| AT-1.8 | PROP-COMMIT-1, PROP-COMMIT-2, PROP-COMMIT-5 | T01, T13 |
| AT-2.1 | PROP-DOC-1, PROP-DOC-2, PROP-DOC-3, PROP-DOC-7 | T27, T28 |
| AT-2.2 | PROP-DOC-2…5 | T27, T28 |
| AT-2.3 | PROP-DOC-6, PROP-DOC-8 | T28 |
| AT-3.1 | PROP-DEL-1, PROP-DEL-2 | T08–T10 |
| AT-3.2 | PROP-VER-3 | T33 [manual] |
| AT-3.3 | PROP-DEL-3, PROP-DEL-4, PROP-HOOK-2 | T08–T10, T16 |
| AT-3.4 | PROP-DEL-5, PROP-DEL-6 | T09, T10 |
| AT-3.5 | PROP-VER-4 | T33 [manual] |
| AT-3.6 | PROP-DEL-7, PROP-VER-2 | T33 [manual] |
| AT-4.1 | PROP-CLEAN-1, PROP-CLEAN-8, PROP-CLEAN-9 | T07, T30 |
| AT-4.2 | PROP-CLEAN-2 | T07, T30 |
| AT-4.3 | PROP-CLEAN-3, PROP-CLEAN-4, PROP-CLEAN-11 | T07, T30 |
| AT-4.4 | PROP-CLEAN-10 | T32 [manual] |
| AT-5.1 | PROP-RUN-1, PROP-RUN-3 | T32 [manual] |
| AT-5.2 | PROP-RUN-2 | T32 [manual] |
| AT-5.3 | PROP-BUILD-5, PROP-BUILD-6, PROP-GATE-1…3 | T19, T20, T24 |

## 5. Requirement coverage

Twenty-six acceptance criteria in REQ v0.16 §6, one-to-one with the ATs above. Every
`AC-` is claimed by at least one property; no AC is claimed only by a `[manual]` row
without that row naming the artefact its evidence lands in.

| REQ area | ACs | Properties |
|---|---|---|
| G-1 sweep (§6.1) | AC-1.1, AC-1.2, AC-1.5 | PROP-SWEEP-1…6 |
| G-1 suite (§6.1) | AC-1.3 | PROP-SUITE-1…11 |
| G-1 CI (§6.1) | AC-1.4, AC-1.4b, AC-1.4c | PROP-CI-1…6 |
| G-5 build (§6.1) | AC-1.6 | PROP-BUILD-1…6 |
| C-2 hooks (§6.1) | AC-1.7 | PROP-HOOK-1…4 |
| C-5 commits (§6.1) | AC-1.8 | PROP-COMMIT-1…6 |
| G-3 documents (§6.2) | AC-2.1, AC-2.2, AC-2.3 | PROP-DOC-1…8 |
| G-2 delegator (§6.3) | AC-3.1, AC-3.3, AC-3.4 | PROP-DEL-1…7 |
| C-10 handshake (§6.3) | AC-3.2, AC-3.5, AC-3.6 | PROP-VER-1…4 |
| G-4 cleanup (§6.4) | AC-4.1, AC-4.2, AC-4.3, AC-4.4 | PROP-CLEAN-1…11 |
| R-6 post-sweep run (§6.5) | AC-5.1, AC-5.2 | PROP-RUN-1…3 |
| C-3 drift gate (§6.5) | AC-5.3 | PROP-GATE-1…3 |

Non-goals are honoured by omission and by NEG rows: NG-6 (no automatic consumer cleanup)
is why every PROP-CLEAN row is operator-invoked and none is wired to a hook or to
`SessionStart`; NG-2 (no engine feature work) is why PROP-VER asserts the existing
handshake rather than extending it.

## 6. Oracle audit

Applying §1's three anti-vacuity rules to every property that could plausibly violate
them. A property absent from this table asserts only positive presence or exact equality
and needs no audit.

| Property | Absence asserted | Positive control | Exactness |
|---|---|---|---|
| PROP-SWEEP-1, -2 | Removed paths | Whole-directory set-equality on the surviving tree; index read, not filesystem walk | Set-equality, not containment |
| PROP-SWEEP-3 | Zero L-3 matches | Planted string is found by the same command in the same run | Per-file allow-list dispositions |
| PROP-SWEEP-6 | — | Recorded non-empty pre-state | Byte-identity |
| PROP-SUITE-2 | `C7` rows gone | Retained rows asserted present by title | Title set-equality |
| PROP-SUITE-4, -5 | No unjoined skips | Red-child sentinel run proves the join can fail | Exact record counts |
| PROP-CI-3 | No `publish.yml` row | Four-row set-equality derived from `on:` triggers | Set-equality |
| PROP-HOOK-1 | `check-workflow-drift` gone | Four surviving rows asserted present | Set-equality |
| PROP-HOOK-3 | Never `126` | Mode bits asserted `100755` from the index | Exact mode, exact status |
| PROP-GATE-1…3 | Gate absent | Surviving queue-driver behaviour asserted green | Exact config key set |
| PROP-BUILD-1 | Bundles gone | `dist/` set-equals `{pdlc-cli.mjs}` | Set-equality |
| PROP-DEL-3 | No `.claude/workflows/` in banner | Banner's version triple asserted present | Exact path absence in a non-empty banner |
| PROP-VER-2, -3 | Refusal, dispatch count `0` | PROP-VER-4 exercises the accepting branch | Three named conjuncts |
| PROP-CLEAN-3, -4, -5, -7 | Nothing removed | Recorded non-empty pre-state, byte-identical | Exit exactly `3` / exactly `4` |
| PROP-CLEAN-6 | — | Registered skip reaches the sink | Exit exactly `4` |
| PROP-CLEAN-10 | No leftover named | Run reaches configured final phase | Field-set equality |
| PROP-DOC-1 | Zero matches | PROP-SWEEP-3's planted-string control | Allow-list applied |
| PROP-DOC-2, -5, -7 | Retired text gone | Replacement text asserted present | Per-file, not repo-wide |
| PROP-DOC-6 | — | Prior entries byte-identical vs non-empty pre-state | Byte-identity |
| PROP-RUN-2 | No retired term | PROP-RUN-1 on the same transcript | Field-set equality |
| PROP-RUN-3 | No `.claude/workflows/` path | Resolved paths recorded, non-empty | Path-set membership |

## 7. Test levels

| Level | Count | Where |
|---|---|---|
| Unit | 50 | `pdlc/workflows/__tests__/`, `pdlc/engine/__tests__/` — index reads, document oracles, count literals, `bash -n` |
| Integration | 16 | `consumerCleanup.test.js`, skip-join host/child pairs, handshake fixtures |
| Manual | 8 | T32, T33 — evidenced in `POSTSWEEP-RUN-*.md` and `OPERATOR-OBSERVATIONS-*.md` |
| Manual + Unit | 1 | PROP-BUILD-5 only — the §1 rule 5 documented exception; its automated conjunct is Unit (`consolidationBuild.test.js`), its operator conjunct is Manual (`OPERATOR-OBSERVATIONS-*.md`) |

50 + 16 + 8 + 1 = 75, matching §2's property count. The eight pure-manual rows are
PROP-DEL-6, PROP-DEL-7 (2), PROP-VER-3, PROP-VER-4 (2), PROP-CLEAN-10 (1), and
PROP-RUN-1, PROP-RUN-2, PROP-RUN-3 (3). Each names the artefact its evidence lands
in; a manual property with no named artefact is not evidence, and DoD treats a
missing artefact as a missing test.

## 8. Fixtures

| Fixture | Purpose | Owner task |
|---|---|---|
| `pdlc/workflows/__tests__/fixtures/skipJoinFalsifier.js` | Red child whose failure the host must observe; guarded by `PDLC_SKIP_JOIN_NESTED=1` so the host's self-scan does not recurse | T21 |
| `pdlc/workflows/__tests__/fixtures/skipJoinTeardown.js` | Child that registers skips and exits cleanly; the join's expected-non-empty side | T21 |
| `pdlc/workflows/__tests__/helpers/driftCapabilities.js` | `itOrSkip`, `SKIP_INVENTORY`, `KNOWN_CAPABILITY_KEYS` — the registration API NEG-5 forbids bypassing | T22 |
| Temp target directory (per-test, `mkdtemp`) | Consumer `.claude/workflows/` populated from L-11's nine names, plus the unexpected-entry variants | T07, T30 |
| Temp plugin-root copy (per-test) | Version-mismatch construction for PROP-VER-2 without publishing anything | T23, T24 |

Fixture strings are verbatim where an oracle compares them — the nine L-11 names, the
`.pdlc-tmp.<pid>.<rand>` residue shape, the `STALE pdlc/workflows/dist/pdlc-cli.mjs`
line. Where a property is parameterised (PROP-CLEAN-8), the generator draws from the
same nine-name constant, so widening the set cannot leave the property behind.

## 9. Known gaps

| Id | Gap | Disposition |
|---|---|---|
| G-1 | Contract row 4b's partial-`rm` arm (a removal that fails midway) has no oracle: constructing a mid-loop `rm` failure needs a filesystem fault injector the repo does not have. | Accepted. PROP-CLEAN-6 covers the unreadable-target entry to 4b; the partial arm is documented in `pdlc/OPERATIONS.md` as operator-diagnosed. |
| G-2 | The re-homed assertion titles in `orchestrateQueue.test.js` and `guardMatrix.test.js` are asserted as a set, so a title could be re-homed to the wrong file and still pass if both files are in the compared set. | Accepted. PROP-SUITE-6 pins each title to its owning file; the residual risk is a same-file reorder, which is behaviour-neutral. |
| G-3 | PROP-RUN-1's excluded key-paths are a judgement call; a genuinely lost field whose key-path happens to match an exclusion would pass. | Mitigated. The exclusion list is a named constant, so widening it shows up in review as an edit to that constant rather than as an inline change. |
| G-4 | No property asserts that the retired channel cannot be *reintroduced* by a future feature — only that it is gone now. | Accepted. PROP-SWEEP-3's zero-match oracle runs on every commit and would red on reintroduction outside the allow-list, which is the practical guard. |

---

**REVISION-COMPLETE**
