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

## File-ownership manifest

## Dependencies

## Traceability

## Verification

## Open questions and upstream errata
