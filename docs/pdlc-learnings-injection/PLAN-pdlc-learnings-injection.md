---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# PLAN — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **PLAN** — `TSPEC-pdlc-learnings-injection.md` (v0.6); `FSPEC-pdlc-learnings-injection.md` (v0.10); `REQ-pdlc-learnings-injection.md` (v0.9); `DECISIONS-pdlc-learnings-injection.md` |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-20 |

## Overview

### What is being built

TSPEC §A.1's new region of `pdlc/workflows/orchestrate-dev.js` — twelve symbols (constants,
config parser, pure selection core, IO shell, renderer, injector factory), one attachment in
`dispatchAndVerify`, one conditionally-spread report key in `buildFinalReport` — plus the seven
new jest suites TSPEC §T.5 assigns, one new fixture helper, one committed pre-feature prompt
baseline and the script that captures it.

**This PLAN cites; it does not restate.** Every task row names the TSPEC section that owns the
thing being built. Where a row and the TSPEC disagree, the TSPEC wins and the row is the defect.
Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6 and is referenced by id (`AC-`, `BR-`,
`AT-`, `§`), never copied. What a row states that no upstream document does is *process*: when the
work happens, who owns which file, which test comes first, and what stops.

The work decomposes into **22 tasks across 14 batches**. The shape is dominated by one fact:
almost every production change lands in a single physical file, `pdlc/workflows/orchestrate-dev.js`
(666 KB, 15,311 lines at HEAD), which by batch-safety rule 2 makes the **source lane fully
serial** — one source-writing task per batch, batches 7–14 — while the test, fixture and script
lanes fan out beside it in batches 2–6. TSPEC records this as obligation **T-O-1**, and the
§File-ownership manifest is the mechanical audit it asks for.

### The change surface, verified at HEAD

Every path this PLAN names was checked on `feat-pdlc-learnings-injection`:

| Path | State at HEAD | Owner |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | exists — `MERGE_CONFIG_PATH` (`:48`), `parseAdvisoryConfig` (`:1964`), `reviewLoop` (`:7266`), `dispatchAndVerify` (`:8862`), `main` default export (`:12022`), `buildFinalReport` (`:15240`) | modified |
| `pdlc/workflows/consolidate-learnings.js` | exists — `LS_FILES_ARGV` module-private (`:1338`), `enumerateCorpus` exported (`:1349`) | **read-only**, never modified |
| `pdlc/workflows/__tests__/helpers/seams.js` | exists — `fakeFs` (`:245`), `fakeGit` (`:413`) | read-only |
| `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | exists — re-exports `mergeDoubles.js`'s `fakeGit` (`:35`) | read-only |
| `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | **new** | LI-02 |
| the seven suites of TSPEC §T.5, plus `learningsSuiteMap.test.js` and `learningsCaptureScript.test.js` | **all new** — no file of any of these names exists under `pdlc/workflows/__tests__/` | LI-03, LI-07…LI-14 |
| `pdlc/workflows/__tests__/fixtures/learnings-baseline/` | **new** (the `fixtures/` directory exists; this subtree does not) | LI-06 |
| `scripts/capture-learnings-baseline.mjs` | **new, and so is its directory** — the repository root has no `scripts/` at HEAD. TSPEC §T.3 pins the path; this PLAN schedules its creation rather than relocating it | LI-05 |
| `.gitignore` | exists (599 B); `git check-ignore -v .baseline-worktree` exits non-zero, which is TSPEC §T.3's measured finding and LI-03's red | LI-04 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | exists (671 KB), generated | **no task** — see below |

**`dist/` has no owning task, and that is deliberate.** The consuming arrangement runs
`node pdlc/workflows/build-runtime.mjs` as the wave gate's `postWaveCommand` and stages
`pdlc/workflows/dist/` via `postWavePathspecs` (`.claude/pdlc.config.example.json`), so the
regenerated artifact is produced and staged **once per wave by the gate**, not by a task. Listing
it as a task-owned source file would create a same-batch multi-writer on the one file every source
task touches. No task edits `dist/` by hand; a hand edit is a halt condition (§Verification).

### Test-name namespacing — mandatory

Every jest test this feature adds is named **`LI-AT-{N}`**, never bare `AT-{N}`. The collision is
measured, not hypothetical: `pdlc/workflows/__tests__/documentOracles.test.js` at HEAD carries
`test("AT-22 [red-until-L-06]: …")` and `test("AT-23: coveredViolations(fixture root) …")` from a
prior feature, and this feature's AT-22 and AT-23 are different assertions entirely. TSPEC-local
cases follow the same rule: `LI-T-PIN-1`, `LI-T-RETRY-1…3`, `LI-T-IGNORE`, `LI-T-WORKTREE`,
`LI-T-SUITEMAP`. Throughout this document a bare `AT-{N}` refers to **FSPEC's** numbering; the jest
name is always the `LI-` form.

### Out of scope for this PLAN

The three PROPERTIES obligations TSPEC carries forward — T-O-4 (`orderCorpus` permutation and
strict-weak-ordering), T-O-5 (`selectLearnings` totality) and T-O-6 (`extractInjectableMaterial`
byte/char-safety) — are the test engineer's, authored in PROPERTIES and scheduled by the
orchestrator's Phase P, not by a task row here. T-O-3's live-run measurement is the operator's,
against REQ O-1.

## Batches

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**Column contract.** `Batch` re-derives mechanically as `max(batch of Deps) + 1`, sources being
batch 1; the dispatcher validates the column against the `Deps` edges and halts on mismatch.
`[Fake first]` marks a test-double or fixture-creation task, which precedes every production task
for the same component. Every green implementation task lists its red-test task in `Deps`. Paths
are repo-relative and subpackage-qualified; `__tests__/` and `helpers/` are always under
`pdlc/workflows/`.

**Batches 2–6 are RED-terminal.** Their gate is *not* "full suite green": it is **the new tests
fail for the specified reason — the symbol under test does not exist yet, or the `.gitignore` rule
is absent — and every pre-existing test is unchanged**. The full-suite-green gate applies from
batch 7 on. §Verification states the two gate wordings and the pre-existing-red exclusion.

**Ordering obligation T-O-2 binds at batch 4.** The pre-feature baseline capture (LI-06) must
complete **before the first production edit lands** (LI-15, batch 7), or the merge-base no longer
records a pre-feature commit. That is enforced structurally, not by memory: every source-lane task
transitively depends on LI-06 through LI-15's `Deps`.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| **LI-01** | **Pre-flight gate.** Assert at HEAD every premise this PLAN and TSPEC §Grounded premises depend on — P-1 (`MODULE_NAMES` is exactly the two modules, `pdlc/engine/scripts/prepack.mjs`), P-2a (the four `dispatchKind: "authoring"` sites), P-3 (`dispatchAndVerify` receives `dispatchKind`, `docType`, `_readFile`, `_git`, `_log`), P-4 (`LS_FILES_ARGV` and `enumerateCorpus` in `consolidate-learnings.js`), P-7/P-8 (the `_git` and `_readFile` seam contracts), P-10 (`buildFinalReport`'s conditional `advisory` spread and its `notices` channel), plus the change-surface table of §Overview. Promote any absent premise to blocking work before batch 2 runs. **Asserts existence only** — never the new shape a later task creates | — | — | 1 | — | ⬚ |
| **LI-02** | `[Fake first]` **The fixture helper** (TSPEC §T.2): `buildLearningsCorpus(specs)` synthesising documents with declared `Date Completed` rows, declared BR-6 sections and declared byte sizes; the two named threshold fixtures `COUNT-BINDING` and `BYTES-BINDING` (§T.4); the `DIVERGENT-CORPUS` and `RETRY-ITERATION` corpus scripts (§T.6); and the AT-29 contamination corpus carrying **line-initial** `VERDICT:`, `ERRATUM:` and `REVISION-COMPLETE:` lines — a deliberate strengthening of the shipped corpus, which carries those tokens only inline (§T.6). Sole owner of this file; no suite defines an ad-hoc corpus builder, and no suite defines an ad-hoc **seam** double (`helpers/seams.js` stays the only source) | `__tests__/helpers/learningsFixtures.js` | — | 2 | LI-01 | ⬚ |
| **LI-03** | `[Fake first]` **RED capture-script suite**, TSPEC §T.3's two obligation oracles. `LI-T-IGNORE`: `git check-ignore .baseline-worktree` **exits 0** at the repository root — red at HEAD, where it exits non-zero. `LI-T-WORKTREE`: a forced throw injected **between** materialise and remove leaves the `.baseline-worktree` path **absent** *and* `git worktree list` showing **no entry** for it — the second conjunct is what distinguishes `git worktree remove` from `rm -rf` and may not be dropped | `__tests__/learningsCaptureScript.test.js` | — | 2 | LI-01 | ⬚ |
| **LI-13** | `[Fake first]` **RED cross-module predicate pin** (TSPEC §I.1, §T.5). `LI-T-PIN-1` is a **three-way** agreement assertion in one test: the argv `enumerateCorpus` actually hands `_git`, the new `LEARNINGS_CORPUS_ARGV`, and `consolidationPredicate.test.js`'s own literal, asserted mutually equal. Uses `fakeGit` from `helpers/consolidationDoubles.js` — **not** `helpers/seams.js`'s, which is a different shape (`git._git` + `git.calls` versus a seam function + `git.invocations`); this is the one suite in the feature that does so, because its subject is the sibling module | `__tests__/learningsPredicatePin.test.js` | — | 2 | LI-01 | ⬚ |
| **LI-04** | **GREEN the ignore rule.** Add `/.baseline-worktree/` to `.gitignore`, root-anchored the way `/.claude/pdlc.config.json` already is, so a nested fixture directory of that name is untouched (TSPEC §T.3 obligation 1). Greens `LI-T-IGNORE`. Load-bearing beyond tidiness: `coveredViolations` walks the entire tree under `root` skipping only `.git/` and `node_modules/` (`pdlc/workflows/lib/document-oracles.mjs`), so an abandoned worktree would be scanned as a second copy of every `docs/**` artifact | `__tests__/learningsCaptureScript.test.js` | `.gitignore` | 3 | LI-03 | ⬚ |
| **LI-05** | **GREEN the capture script** (TSPEC §T.3 steps 1–3): `git worktree add` at the resolved merge-base, import `main` from the worktree's `orchestrate-dev.js`, drive it through the branch-side L3 fixture matrix, write `{caseId}/{dispatchIndex}.txt` plus `MANIFEST.json` (merge-base sha + SHA-256 per file), and remove the worktree in a **`finally`** with `git worktree remove --force`, never `rm -rf`. Greens `LI-T-WORKTREE`. Creates the repository's `scripts/` directory | `__tests__/learningsCaptureScript.test.js` | `scripts/capture-learnings-baseline.mjs` | 3 | LI-02, LI-03 | ⬚ |
| **LI-07** | **RED selection suite** (L1, TSPEC §T.5): `LI-AT-04`, `LI-AT-07` (both regimes — `BYTES-BINDING` and its mirror), `LI-AT-08`, `LI-AT-09`, `LI-AT-10`, `LI-AT-13`, `LI-AT-15`, `LI-AT-16`, `LI-AT-28`. Nine ATs, eligibility/ordering/count rules only — the material-extraction claims are LI-08's and are **not** duplicated here (TSPEC §T.5). Includes the `COUNT-BINDING` case where exactly 3 documents contribute and exactly 5 carry `RSN-COUNT` | `__tests__/learningsSelect.test.js` | — | 3 | LI-02 | ⬚ |
| **LI-08** | **RED block/material suite** (L1): `LI-AT-05` (the rendered form transcribed literally from TSPEC §OQ.1, not keyword-matched), `LI-AT-11` (section-set equality over what BR-6 selected), `LI-AT-12` (the character-safe cut of §D.5 — an **ASCII** fixture so the expected count is the bound exactly, plus a separate multi-byte case pinning `≤`). Expected byte counts are hand-computed from the fixture over **material only**, ignoring every delimiter (§D.5) | `__tests__/learningsBlock.test.js` | — | 3 | LI-02 | ⬚ |
| **LI-09** | **RED corpus-shell suite** (L2): `LI-AT-25` (`!reply.ok` ⇒ `RSN-UNLISTABLE`), `LI-AT-26` (**two** cases — `_readFile` returns `null` *and* `_readFile` throws, both real per P-8), `LI-AT-27` (`RSN-UNPARSEABLE`), plus the fault-injection case entering the outer `try/catch` ⇒ `RSN-UNLISTABLE` (BR-12's last row, TSPEC §T.7). Seams from `helpers/seams.js` only | `__tests__/learningsCorpus.test.js` | — | 3 | LI-02 | ⬚ |
| **LI-06** | **Capture and commit the pre-feature baseline, and author its guard** (TSPEC §T.3, T-O-2). Run `scripts/capture-learnings-baseline.mjs` **before any production edit exists on the branch**; commit `{caseId}/{dispatchIndex}.txt` and `MANIFEST.json`. Then author the guard suite: one **hand-transcribed** digest literal per `{caseId}`, copied by a human from this capture (DC-14), asserted against both the recomputed file digests and `MANIFEST.json`'s entries, with **set equality over the `{caseId}` keys**, never containment — containment lets a silently deleted baseline case pass, which is exactly the failure that would make a byte-identity failure disappear. The merge-base-sha ancestor check is kept as a weaker second signal only | `__tests__/learningsBaselineGuard.test.js`, `__tests__/fixtures/learnings-baseline/` | — | 4 | LI-04, LI-05 | ⬚ |
| **LI-10** | **RED record suite**: `LI-AT-17` (BR-8 row-field set equality over `rows[i]`), `LI-AT-18`, `LI-AT-19`, `LI-AT-21` at L1/L2; **`LI-AT-20` and `LI-AT-22` at L3**, over the `DIVERGENT-CORPUS` fixture (five authoring dispatches; the scripted `_git` reply gains a path after dispatch 2 and fails at dispatch 5). Asserts the **per-dispatch oracle locus only** — `dispatches[i].corpusOutcome`, `dispatches[i].orderKeys`, `corpusDiverged` true on exactly dispatches 3 and 5 — and asserts **nothing about `runMirror`**, whose value upstream leaves deliberately unconstrained (REQ AC-3.2; a test pinning it reds a conforming implementation). Both BR-10 completeness tests, one per locus | `__tests__/learningsRecord.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| **LI-11** | **RED dispatch-universe suite** (L3, the largest): `LI-AT-01`, `LI-AT-02`, `LI-AT-03`, `LI-AT-06`, `LI-AT-14` (two whole-process runs, not two loop iterations), `LI-AT-23`, `LI-AT-24`, `LI-AT-29`, `LI-AT-31`, `LI-AT-33`, `LI-AT-34`, `LI-AT-35`. Also owns four TSPEC-local cases that carry no FSPEC AT id: the **composition-site set equality** (`_recordDocType` probe, expected value `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`, **and** the accepted set equal to `LEARNINGS_TARGET_DOCTYPES`, both hand-transcribed, both **equality** never containment); `LI-T-RETRY-1…3` (one `dispatches[]` row, one `LEARNINGS_CORPUS_ARGV` `_git` call, iteration 2's prompt differing from iteration 1's only inside `opener`); AC-5.2's **write half** — a `git status --porcelain` set-equality delta around the run in a **dedicated temp git repository that is the run's `cwd`**, with **no exemption list**; and the **static seam-discipline scan** over the region between LI-15's sentinel comments (no `fs.`, `writeFileSync`, `mkdirSync`, `appendFileSync`, `require("fs")`). AT-33/AT-34 share one instrument in this one file, and AT-33's expected read set is **hand-transcribed** from the fixture's scripted `ls-files` stdout minus the self paths — never derived from `gatherLearningsCorpus` | `__tests__/learningsDispatchSet.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| **LI-12** | **RED configuration suite** (**L3**, not L1 — TSPEC §T.5): `LI-AT-30` (`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ an **enabled** run whose BR-8 rows are present and empty) and `LI-AT-32` (three cases: section/file absent ⇒ enabled on §4.1 defaults with **no** notice; malformed section ⇒ key **present**, run enabled, `NTC-MALFORMED`; wrong-typed declared key ⇒ key present, that key defaulted, `NTC-KEYTYPE`) with a **two**-member notice set equality matching `LEARNINGS_NOTICES` exactly. Drives `main()` over the full seam set with a scripted `_agent`, on `advisoryDisabled.test.js`'s pattern (`import mainDev, * as dev from "../orchestrate-dev.js"`). `parseLearningsConfig`'s pure-unit assertions live here as supporting tests carrying **no AT id**, so the §T.5 counts are unchanged | `__tests__/learningsConfig.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| **LI-14** | **RED suite-map closure** (TSPEC §T.5). `LI-T-SUITEMAP`: the six AT-bearing suites' declared AT lists, hand-transcribed, asserted pairwise **disjoint** and **set-equal** to the 35-member literal `AT-01 … AT-35`, and asserted to match the `LI-AT-` test names actually registered in each suite file. This is the test that keeps §T.5's closure claim honest as suites grow: adding an AT to one suite without removing it from another reds here | `__tests__/learningsSuiteMap.test.js` | — | 6 | LI-07, LI-08, LI-09, LI-10, LI-11, LI-12 | ⬚ |
| **LI-15** | **GREEN the constants and the config reader** — the first production edit, and the whole of the region's frame. Sentinel comments opening and closing the region (LI-11's static scan is asserted over exactly this span); `LEARNINGS_CONFIG_PATH = MERGE_CONFIG_PATH`; `LEARNINGS_DEFAULTS` with `enabled: true`; the three frozen catalogues of TSPEC §D.1 and `LEARNINGS_TARGET_DOCTYPES`; `LEARNINGS_CORPUS_ARGV`; `parseLearningsConfig` and `readLearningsConfigSafely`, modelled on `parseAdvisoryConfig`/`readAdvisoryConfigSafely` and **placed immediately after them** so the two config readers sit adjacent. Thresholds validate as **non-negative** integers, `0` being a valid admits-nothing value (AC-4.4). Greens `LI-T-PIN-1` and `LI-T-SUITEMAP`; `learningsConfig.test.js`'s AT rows stay red until LI-21 | `__tests__/learningsPredicatePin.test.js`, `__tests__/learningsSuiteMap.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | LI-06, LI-13, LI-14 | ⬚ |
| **LI-16** | **GREEN the pure selection core** (TSPEC §I.3, §D.3–§D.6): `looksLikeLearningsDocument` (deliberately weak — a truncated document stays eligible), `parseHarvestDate` (`\b`-anchored ISO prefix, string comparison, **no `Date` object**), `extractInjectableMaterial` (BR-6 priority order, character-safe cut, `bounded` decided at the cut), `orderCorpus` (§D.4's comparator with `Buffer.compare` as the tiebreak, not `<`/`>`), and `selectLearnings`, whose `rejected[]` is **total over `entries`** and tests `excluded` **before** `readOk` so a self document is never mis-reported as `RSN-UNREADABLE`. Greens `learningsSelect.test.js` | `__tests__/learningsSelect.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | LI-15, LI-07 | ⬚ |
| **LI-17** | **GREEN the renderer.** `renderLearningsBlock({selected})` emitting TSPEC §OQ.1's exact form — header, four-sentence advisory preamble, per-document `<<< path — feature {p}, completed {d} >>>` opener with the `ABRIDGED` annotation when bounded, closer, trailer — prefixed with `\n\n` when non-empty and **exactly `""`** when `selected` is empty. Framing is never charged to any byte bound (§D.5). Greens `learningsBlock.test.js` | `__tests__/learningsBlock.test.js` | `pdlc/workflows/orchestrate-dev.js` | 9 | LI-16, LI-08 | ⬚ |
| **LI-18** | **GREEN the IO shell.** `gatherLearningsCorpus({feature, _git, _readFile})` — one `_git(LEARNINGS_CORPUS_ARGV)` enumeration, one `_readFile` per non-self path inside a **mandatory `try/catch`** (P-8: `rtReadFile` throws where `defaultReadFile` returns `null`), self entries carried with `text: null, excluded: "RSN-SELF"` and **never opened** (§D.6), the whole shell wrapped in one outer `try/catch` returning the unlistable outcome. Never throws past `dispatchAndVerify`. Greens `learningsCorpus.test.js` | `__tests__/learningsCorpus.test.js` | `pdlc/workflows/orchestrate-dev.js` | 10 | LI-17, LI-09 | ⬚ |
| **LI-19** | **GREEN the injector and the record.** `buildLearningsInjector({config, sink, _git, _readFile, _log})` returning `null` iff `config.enabled === false` — no `present` conjunct and no `!sectionMalformed` conjunct (REQ AC-5.1a/b) — and otherwise an async closure that gathers, selects, renders, and pushes one `dispatches[]` record per call in TSPEC §D.2's shape, including `corpusOutcome`, `orderKeys` and `corpusDiverged` (**`false`, never `null`, on the first dispatch of a run**). The run-level `runMirror` is written last-write-wins and asserted by nothing. Greens `learningsRecord.test.js` | `__tests__/learningsRecord.test.js` | `pdlc/workflows/orchestrate-dev.js` | 11 | LI-18, LI-10 | ⬚ |
| **LI-20** | **GREEN the attachment and the probe seam.** In `dispatchAndVerify`: `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`, evaluated **once per episode, before the `for(;;)` loop**, with the resulting block held in a `const` and concatenated **after** the per-iteration-mutated `opener`; `_recordDocType(docType)` called at that same point, on **both** arms of `injectHere`, once per episode and never inside the loop. Plumb both defaulted seams through **all five hand-written hops** — `main`'s destructured params, the `wrapperSeams` object literal (an enumerated literal, not a spread; this hop alone carries Phase H's `"LEARNINGS"`), `reviewLoop`'s destructured params, `reviewLoop`'s `wrapped` closure (Phase CR's `null` reaches the composition site through this path **and no other**), and `dispatchAndVerify`'s destructured params. Both default to a no-op/`null`, so an uninjected run is byte-unchanged (AC-4.3). Greens `learningsDispatchSet.test.js` except its report-shape rows | `__tests__/learningsDispatchSet.test.js` | `pdlc/workflows/orchestrate-dev.js` | 12 | LI-19, LI-11 | ⬚ |
| **LI-21** | **GREEN the run wiring and the report key.** In `main()`: read the config **once per run** via `readLearningsConfigSafely`, push `NTC-MALFORMED`/`NTC-KEYTYPE` onto `buildFinalReport`'s **existing run-level `notices` channel** (`orchestrate-dev.js`'s `buildFinalReport` already takes `notices = []`) — never onto `learningsInjection` — build the injector, hang it on `wrapperSeams`. In `buildFinalReport`: one added `learningsInjection = undefined` parameter, spread **conditionally** on the `...(advisory ? { advisory } : {})` precedent, so an explicitly disabled run's report has **no such key** while an enabled run with an empty selection has the key with empty rows. Greens `learningsConfig.test.js` and the remaining `learningsDispatchSet.test.js` rows | `__tests__/learningsConfig.test.js`, `__tests__/learningsDispatchSet.test.js` | `pdlc/workflows/orchestrate-dev.js` | 13 | LI-20, LI-12 | ⬚ |
| **LI-22** | **🔵 REFACTOR and close.** Full-suite green under the arrangement's `testCommand`; the fail-open branch inventory of TSPEC §T.7 walked row by row and every arm confirmed entered by its named AT (the `--per-file --branches 85` gate cannot see a ~300-line region inside a 15k-line file, so this inventory **is** the coverage obligation); optionally a region-scoped `c8` invocation, which TSPEC leaves to PLAN as a cheap option and this row takes only if it costs nothing; region tidy-up with no behaviour change. No new assertions, no new files | all `learnings*.test.js` | `pdlc/workflows/orchestrate-dev.js` | 14 | LI-21 | ⬚ |

## File-ownership manifest

Every physical file this feature creates or modifies, with its **writing** owner(s). Where a file
has more than one owner they are listed in batch order and **no two share a batch** — this table is
the mechanical audit of the single-writer-per-batch premise (batch-safety rule 2), and it is the
only thing preventing a last-writer-wins race the green gate cannot detect.

**Read the `Test File` column of §Batches as "the suite this task must turn green", not as "the
suite this task writes."** Authorship is *this* table alone. A green task names the red suite it
satisfies; it does not edit it. Where a green task legitimately must touch a suite file (none does
in this feature), the manifest would carry a second owner row in a later batch.

### Production and generated

| File | Owner(s), in batch order | Batches |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | LI-15, LI-16, LI-17, LI-18, LI-19, LI-20, LI-21, LI-22 | 7, 8, 9, 10, 11, 12, 13, 14 |
| `.gitignore` | LI-04 | 3 |
| `scripts/capture-learnings-baseline.mjs` (new directory) | LI-05 | 3 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | **none** — regenerated and staged by the wave gate's `postWaveCommand` / `postWavePathspecs` (`.claude/pdlc.config.example.json`), once per wave | 7–14 |

**The `orchestrate-dev.js` row is why batches 7–14 each carry exactly one task.** Eight source
edits, eight batches, one writer each. Nothing about the split is stylistic: two same-batch tasks
appending to a 15,311-line file would silently drop each other's region and leave the suite green
on the survivor.

### Tests, helpers and fixtures

| File | Owner | Batch |
|---|---|---|
| `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | LI-02 | 2 |
| `pdlc/workflows/__tests__/learningsCaptureScript.test.js` | LI-03 | 2 |
| `pdlc/workflows/__tests__/learningsPredicatePin.test.js` | LI-13 | 2 |
| `pdlc/workflows/__tests__/learningsSelect.test.js` | LI-07 | 3 |
| `pdlc/workflows/__tests__/learningsBlock.test.js` | LI-08 | 3 |
| `pdlc/workflows/__tests__/learningsCorpus.test.js` | LI-09 | 3 |
| `pdlc/workflows/__tests__/learningsBaselineGuard.test.js` | LI-06 | 4 |
| `pdlc/workflows/__tests__/fixtures/learnings-baseline/**` (incl. `MANIFEST.json`) | LI-06 | 4 |
| `pdlc/workflows/__tests__/learningsRecord.test.js` | LI-10 | 5 |
| `pdlc/workflows/__tests__/learningsDispatchSet.test.js` | LI-11 | 5 |
| `pdlc/workflows/__tests__/learningsConfig.test.js` | LI-12 | 5 |
| `pdlc/workflows/__tests__/learningsSuiteMap.test.js` | LI-14 | 6 |

Fifteen files, fifteen distinct owners across the two tables; the only multi-owner file is
`orchestrate-dev.js`, and its eight owners occupy eight different batches.

### Read-only for this feature — no task owns them

`pdlc/workflows/consolidate-learnings.js` (the pin's subject: it is *driven*, never edited — a
change here would be a change to the shipped consolidation predicate, which this feature exists to
follow rather than to move), `pdlc/workflows/__tests__/helpers/seams.js`,
`helpers/consolidationDoubles.js`, `helpers/mergeDoubles.js`,
`pdlc/workflows/__tests__/consolidationPredicate.test.js` (LI-13 asserts *against* its literal;
editing it would collapse the three-way agreement into a two-way one),
`pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/build-runtime.mjs`, and every `pdlc/skills/**`
SKILL.md — this feature changes what an author is told, never what the pipeline requires (BR-16),
so no SKILL text moves.

## Dependencies

### The batch ladder

| Batch | Tasks | What the batch is for | Terminal state |
|---|---|---|---|
| 1 | LI-01 | premise pre-flight | green (assertions over HEAD) |
| 2 | LI-02, LI-03, LI-13 | fixture helper + the two suites that need no other suite | **red** |
| 3 | LI-04, LI-05, LI-07, LI-08, LI-09 | ignore rule, capture script, the three L1/L2 red suites | mixed: LI-04/LI-05 green their own oracles, LI-07…LI-09 **red** |
| 4 | LI-06 | **the T-O-2 gate moment** — capture, commit, guard | green (guard passes over the fresh capture) |
| 5 | LI-10, LI-11, LI-12 | the three L3 red suites, which need the baseline | **red** |
| 6 | LI-14 | closure over the six AT-bearing suites | **red** |
| 7–13 | LI-15 … LI-21 | the serial source lane, one edit per batch | green, cumulative |
| 14 | LI-22 | refactor, coverage inventory, close | green |

### Why each edge exists

| Edge | Kind | Why it is not optional |
|---|---|---|
| everything → LI-01 | pre-flight | a premise that has moved since TSPEC v0.6 must become blocking work before any task builds on it |
| LI-04, LI-05 → LI-03 | red-before-green | both obligations of TSPEC §T.3 are things a rebase drops silently; each has a named oracle that must be red first |
| LI-05 → LI-02 | data | the capture drives the **L3 fixture matrix**, which lives in the helper |
| LI-06 → LI-04, LI-05 | ordering + tooling | the capture cannot run before the script exists, and must not run before `.baseline-worktree` is ignored, or an interrupted run dirties the tree the `coveredViolations` walk scans |
| LI-10, LI-11, LI-12 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31) compare against committed baseline prompts |
| LI-14 → LI-07 … LI-12 | closure | the suite map asserts over suite files that must exist to be read |
| LI-15 → LI-06 | **T-O-2** | the first production edit may not precede the baseline capture; this single edge is what makes the obligation structural rather than remembered |
| LI-16 → LI-15, LI-17 → LI-16, … LI-22 → LI-21 | single-writer serialisation | consecutive edits to `orchestrate-dev.js`; also a genuine build order — the selection core consumes LI-15's catalogues, the renderer consumes the selector's output, the shell feeds the selector, the injector composes all three, the attachment consumes the injector, the report consumes the sink |
| LI-16 → LI-07, LI-17 → LI-08, LI-18 → LI-09, LI-19 → LI-10, LI-20 → LI-11, LI-21 → LI-12 | red-before-green | each green task names the red suite it satisfies |

**The serialisation edges and the logical edges coincide here, and that is luck rather than
design.** Where they had not coincided, the serialisation edge would still stand: batch-safety rule
2 is a dispatcher contract, and a prose note that "these two could really run in parallel" does not
exempt a row from it.

### Integration points

| Point | Existing symbol | Change |
|---|---|---|
| Config read | `readAdvisoryConfigSafely` / `MERGE_CONFIG_PATH` (`.claude/pdlc.config.json`) | a sibling reader beside it; the same file, a different section |
| Prompt composition | `dispatchAndVerify`'s `basePrompt` + `PACING_CONTRACT_CLAUSE` + `opener` | one appended suffix, never an insertion |
| Seam threading | `wrapperSeams`, `reviewLoop`, `wrapped` | two defaulted seams through five hand-written hops |
| Report | `buildFinalReport`'s conditional `advisory` spread and its `notices = []` channel | one conditionally-spread key; notices on the existing channel |
| Corpus predicate | `consolidate-learnings.js`'s `LS_FILES_ARGV` / `enumerateCorpus` | restated constant, pinned by a three-way agreement test; the sibling is not edited |
| Distribution | `pdlc/engine/scripts/prepack.mjs`'s `MODULE_NAMES` | **unchanged** — which is why nothing ships in a new module |

### Upstream and downstream documents

PROPERTIES is downstream of this PLAN and owes T-O-4, T-O-5 and T-O-6 (TSPEC §Named obligations);
no task row here schedules them, and Phase P's dispatch is the orchestrator's. Nothing in this
feature depends on another feature's branch: `depends-on` is empty in the front-matter and no queue
row binds it.

## Traceability

### Acceptance test → suite → red task → green task

All 35 FSPEC acceptance tests, each appearing **exactly once** — the assignment is TSPEC §T.5's and
is transcribed, not re-decided. Jest names carry the `LI-` prefix (§Overview).

| ATs | Suite | Red (writes) | Green (satisfies) |
|---|---|---|---|
| AT-04, AT-07, AT-08, AT-09, AT-10, AT-13, AT-15, AT-16, AT-28 | `learningsSelect.test.js` | LI-07 | LI-16 |
| AT-05, AT-11, AT-12 | `learningsBlock.test.js` | LI-08 | LI-17 |
| AT-25, AT-26, AT-27 | `learningsCorpus.test.js` | LI-09 | LI-18 |
| AT-17, AT-18, AT-19, AT-21 (L1/L2); AT-20, AT-22 (L3) | `learningsRecord.test.js` | LI-10 | LI-19 |
| AT-01, AT-02, AT-03, AT-06, AT-14, AT-23, AT-24, AT-29, AT-31, AT-33, AT-34, AT-35 | `learningsDispatchSet.test.js` | LI-11 | LI-20, then LI-21 for the report-shape rows |
| AT-30, AT-32 | `learningsConfig.test.js` | LI-12 | LI-21 |

**Count: 9 + 3 + 3 + 6 + 12 + 2 = 35.** LI-14's `LI-T-SUITEMAP` asserts exactly this partition
mechanically, so the arithmetic above is checked by a test rather than by a reader.

### TSPEC-local cases (no FSPEC AT id, not in the 35)

| Case | Suite | Red | Green |
|---|---|---|---|
| `LI-T-PIN-1` — three-way predicate agreement (§I.1) | `learningsPredicatePin.test.js` | LI-13 | LI-15 |
| composition-site set equality, both operands (§A.2 consequence b) | `learningsDispatchSet.test.js` | LI-11 | LI-20 |
| `LI-T-RETRY-1…3` — one selection per dispatch (§A.2 property 2, §T.6) | `learningsDispatchSet.test.js` | LI-11 | LI-20 |
| porcelain write-delta + static seam scan (§T.6, AC-5.2 write half) | `learningsDispatchSet.test.js` | LI-11 | LI-15 (sentinels), LI-20/LI-21 (behaviour) |
| `LI-T-IGNORE`, `LI-T-WORKTREE` (§T.3 obligations 1 and 2) | `learningsCaptureScript.test.js` | LI-03 | LI-04, LI-05 |
| baseline digest guard, set equality over `{caseId}` (§T.3) | `learningsBaselineGuard.test.js` | — (authored green over the fresh capture) | LI-06 |
| `LI-T-SUITEMAP` — §T.5 closure | `learningsSuiteMap.test.js` | LI-14 | LI-15 |

### TSPEC fail-open branch inventory → entering task

TSPEC §T.7 is explicit that the `--per-file --branches 85` gate cannot see this region inside a
15,311-line file, so the inventory is the coverage obligation. Every arm has an entering task:

| Fail-open arm | Entered by | Task |
|---|---|---|
| `!reply.ok` ⇒ `RSN-UNLISTABLE` | AT-25 | LI-09 / LI-18 |
| `_readFile` → `null` ⇒ `RSN-UNREADABLE` | AT-26 case 1 | LI-09 / LI-18 |
| `_readFile` throws ⇒ `RSN-UNREADABLE` | AT-26 case 2 | LI-09 / LI-18 |
| empty enumeration ⇒ `RSN-EMPTY` | AT-24 | LI-11 / LI-20 |
| not a LEARNINGS document ⇒ `RSN-UNPARSEABLE` | AT-27 | LI-09 / LI-18 |
| no BR-6 section ⇒ `RSN-NO-MATERIAL` | AT-28 | LI-07 / LI-16 |
| count bound ⇒ `RSN-COUNT` | AT-08, AT-13, `COUNT-BINDING` | LI-07 / LI-16 |
| byte bound ⇒ `RSN-BYTES` | AT-07, `BYTES-BINDING` | LI-07 / LI-16 |
| self path ⇒ `RSN-SELF` | AT-04 | LI-07 / LI-16 |
| outer `try/catch` ⇒ `RSN-UNLISTABLE` | fault-injection case | LI-09 / LI-18 |
| malformed section ⇒ `NTC-MALFORMED`, run enabled | AT-32 case 2 | LI-12 / LI-21 |
| wrong-typed key ⇒ `NTC-KEYTYPE`, defaults | AT-32 case 3 | LI-12 / LI-21 |

Twelve arms, twelve entering tasks. A task that leaves one unentered is visible here by
inspection, which a diluted file-level percentage never would have been.

### TSPEC obligations and open questions → where they land

| Obligation | Landing |
|---|---|
| F-O-1 … F-O-7 (discharged in TSPEC) | implemented by LI-15 (F-O-3 registration, F-O-4), LI-16 (F-O-1), LI-17 (F-O-2), LI-19 (F-O-3 serialisation), LI-06 (F-O-5), LI-20 (F-O-6), LI-02 (F-O-7) |
| T-O-1 — serialise writers on `orchestrate-dev.js`, with an explicit manifest | §File-ownership manifest; batches 7–14 |
| T-O-2 — capture the baseline before the first production edit | LI-06 at batch 4, bound by LI-15's `Deps` edge |
| T-O-3 — live-run read-cost measurement | **not a task** — operator, against REQ O-1 |
| T-O-4, T-O-5, T-O-6 | **not tasks** — PROPERTIES, Phase P |
| OQ.3 / C-8's second half | no task: TSPEC records that static caps discharge it only in the weak sense, and that moving the caps is a REQ §4.1 change |

## Verification

## Open questions and upstream errata
