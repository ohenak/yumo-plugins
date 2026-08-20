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
| pdlc | Draft | Claude | 0.3 | 2026-08-20 |

## Overview

### What is being built

TSPEC §A.1's new region of `pdlc/workflows/orchestrate-dev.js` — twelve symbols (constants,
config parser, pure selection core, IO shell, renderer, injector factory), one attachment in
`dispatchAndVerify`, one conditionally-spread report key in `buildFinalReport` — plus **fourteen new
test files**: the seven jest suites TSPEC §T.5 assigns, `learningsSuiteMap` (the partition's
closure), `learningsCaptureScript` and `learningsBaselineGuard` (the baseline's two halves),
`learningsPredicatePin` (the cross-module agreement), `learningsPremises` (the pre-flight's owned
artifact, TE F-05), `learningsArmInventory` (the §T.7 fail-open inventory made mechanical, TE
F-07), and one fixture helper — together with one committed pre-feature prompt baseline and the
script that captures it.

**This PLAN cites; it does not restate.** Every task row names the TSPEC section that owns the
thing being built. Where a row and the TSPEC disagree, the TSPEC wins and the row is the defect.
Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6 and is referenced by id (`AC-`, `BR-`,
`AT-`, `§`), never copied. What a row states that no upstream document does is *process*: when the
work happens, who owns which file, which test comes first, and what stops.

The work decomposes into **23 tasks across 14 batches**. The shape is dominated by one fact:
almost every production change lands in a single physical file, `pdlc/workflows/orchestrate-dev.js`
(666 KB, 15,311 lines at HEAD), which by batch-safety rule 2 makes the **source lane fully
serial** — one source-writing task per batch, batches 7–14 — while the test, fixture and script
lanes fan out beside it in batches 2–6. TSPEC records this as obligation **T-O-1**, and the
§File-ownership manifest is the mechanical audit it asks for.

### The change surface, verified at HEAD

Every path this PLAN names was checked on `feat-pdlc-learnings-injection`:

| Path | State at HEAD | Owned by |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | exists — `MERGE_CONFIG_PATH`, `parseAdvisoryConfig`, `reviewLoop`, `dispatchAndVerify`, `main` default export, `buildFinalReport` all resolve by symbol name | modified |
| `pdlc/workflows/consolidate-learnings.js` | exists — `LS_FILES_ARGV` module-private, `enumerateCorpus` exported (`export async function`) | **read-only**, never modified |
| `pdlc/workflows/__tests__/helpers/seams.js` | exists — exports `fakeFs`, `fakeGit` | read-only |
| `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | exists — re-exports `mergeDoubles.js`'s `fakeGit` | read-only |
| `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | **new** | LI-02 |
| the seven suites of TSPEC §T.5, plus `learningsSuiteMap.test.js`, `learningsCaptureScript.test.js`, `learningsBaselineGuard.test.js`, `learningsPremises.test.js` and `learningsArmInventory.test.js` | **all new** — no file of any of these names exists under `pdlc/workflows/__tests__/`; a case-insensitive `learnings` listing of that directory is empty at HEAD | LI-01, LI-03, LI-06, LI-07…LI-14, LI-23 |
| `pdlc/workflows/__tests__/fixtures/learnings-baseline/` | **new** (the `fixtures/` directory exists; this subtree does not) | LI-06 |
| `scripts/capture-learnings-baseline.mjs` | **new, and so is its directory** — the repository root has no `scripts/` at HEAD. TSPEC §T.3 pins the path; this PLAN schedules its creation rather than relocating it | LI-05 |
| `.gitignore` | exists (599 B); `git check-ignore -v .baseline-worktree` exits non-zero, which is TSPEC §T.3's measured finding and LI-03's red | LI-04 |
| `pdlc/workflows/package.json` | exists; `c8.include` is exactly `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` | **no task** — the capture script's coverage disposition is an explicit exemption, §Verification DoD 11 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | exists (671 KB), generated | **no task** — see below |

**Existence claims and absence claims are checked differently (PM F-07).** The rows above that
assert something **exists** — `orchestrate-dev.js`'s symbols, `consolidate-learnings.js`'s exports,
`helpers/seams.js`'s doubles — are standing premises: they hold for the life of the wave and LI-01's
`learningsPremises.test.js` asserts them on every batch. The rows that assert something is
**absent** — no `learnings*` file under `__tests__/`, no repository-root `scripts/`, no
`.baseline-worktree` ignore rule, no `fixtures/learnings-baseline/` subtree — are **one-time
measurements at HEAD**, and this PLAN's own tasks are scheduled to falsify every one of them
(LI-01/LI-02/LI-03/LI-13 at batches 1–2, LI-04 and LI-05 at batch 3, LI-06 at batch 4). They are
therefore checked **once**, by LI-01's pre-flight, and recorded in its completion note — never
asserted by a standing suite, which would red at batch 3 and halt every batch after it.

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

**Batches 2, 3 and 5 are RED-terminal.** Their gate is *not* "full suite green": it is **the new
tests fail for the specified reason — the symbol under test does not exist yet, or the `.gitignore`
rule is absent — and every pre-existing test is unchanged**. Batch 3 is *mixed*: LI-04 and LI-05
green their own two oracles in the same batch that LI-07…LI-09 land red, so its gate is stated
per-suite. **Batches 1, 4 and 6 are green-terminal**, each over a suite that is green the moment it
is authored and has no red episode to stage: `learningsPremises` over HEAD's premises,
`learningsBaselineGuard` over the capture it was written from, `learningsSuiteMap` over six suite
files that all exist at the end of batch 5 (TE F-02, F-04, F-05). Batches 7–13 are **mixed** and
carry a per-batch expected-red ledger, stated in test names wherever a suite is split across two
green tasks; only batch 14 carries an unqualified full-suite-green gate. §Verification states every
gate wording, the ledger, and the pre-existing-red exclusion.

**Ordering obligation T-O-2 binds at batch 4.** The pre-feature baseline capture (LI-06) must
complete **before the first production edit lands** (LI-15, batch 7), or the merge-base no longer
records a pre-feature commit. That is enforced structurally, not by memory: every source-lane task
transitively depends on LI-06 through LI-15's `Deps`.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| LI-01 | **Pre-flight gate, with an owned artifact.** Author `__tests__/learningsPremises.test.js` — one **structural** (never positional) assertion per premise: `MODULE_NAMES`' exact membership in `pdlc/engine/scripts/prepack.mjs` (P-1); P-2a as **three object-literal `dispatchKind: "authoring"` sites plus one positional `"authoring"` argument at the review-loop optimizer call** — measured at HEAD, and the phrasing matters because a literal grep for `dispatchKind: "authoring"` returns 3, not 4 (TE F-12); `dispatchAndVerify`'s parameter names include `dispatchKind`, `docType`, `_readFile`, `_git`, `_log` (P-3); `consolidate-learnings.js` exports `enumerateCorpus` and keeps `LS_FILES_ARGV` module-private (P-4); the `_git`/`_readFile` seam contracts (P-7/P-8); `buildFinalReport` takes a `notices = []` parameter and spreads `advisory` conditionally (P-10). The suite asserts **existence and shape only** — never the new shape a later task creates, and **never an absence claim** (PM F-07): every absence in the §Overview change-surface table is falsified on schedule by this PLAN's own tasks, so asserting one here would red at batch 3 and halt every batch after it. P-2a is asserted as a **set equality over the four call sites** — the three object-literal `dispatchKind: "authoring"` sites and the one positional `"authoring"` argument, keyed by enclosing function and argument position, never as "three object literals exist" — so a **fifth** authoring site reds this suite at batch 1 rather than waiting for LI-11's composition-site set equality at batch 12 (PM Q-04); that is exactly H-1's example and H-5's product question, surfaced as early as it can be. The suite is **green at batch 1 by construction** and stays green for the life of the wave — it reds the moment a rebase moves a premise mid-wave, which is what H-1 needs and a one-time human read cannot give. Promote any absent premise to blocking work before batch 2 runs. **Two things in this row are not tests but written records in LI-01's completion note**: the one-time pre-flight measurement of the change-surface table's four absence claims (no `learnings*` file under `__tests__/`, no root `scripts/`, `git check-ignore -v .baseline-worktree` exiting non-zero, no `fixtures/learnings-baseline/`), and the engine-failure triage citing the CI run that decides H-2 | `__tests__/learningsPremises.test.js` | — | 1 | — | ⬚ |
| LI-02 | `[Fake first]` **The fixture helper** (TSPEC §T.2): `buildLearningsCorpus(specs)` synthesising documents with declared `Date Completed` rows, declared BR-6 sections, declared byte sizes **and declared repository paths** — path shape is part of the spec surface, because AC-2.6's eligibility rule is a path rule (PM F-05). Three named AC-2.6 corpora ship with it: `DISCARDED-NESTED` (only `docs/discarded/{p}/LEARNINGS-*.md`), `DISCARDED-DIRECT` (`docs/discarded/LEARNINGS-x.md`) and `COMPLETED-MIXED` (`docs/{p}/` mixed with `docs/completed/{p}/`), for AT-15 and AT-16. Also the two named threshold fixtures `COUNT-BINDING` and `BYTES-BINDING` (§T.4); the `DIVERGENT-CORPUS` and `RETRY-ITERATION` corpus scripts (§T.6); and the AT-29 contamination corpus carrying **line-initial** `VERDICT:`, `ERRATUM:` and `REVISION-COMPLETE:` lines — a deliberate strengthening of the shipped corpus, which carries those tokens only inline (§T.6). **No jest globals in this helper** (no `expect`, no `jest.fn`): LI-05's capture script imports it from a plain node process and a jest-only dependency would break the script (TE Q-04). Sole owner of this file; no suite defines an ad-hoc corpus builder, and no suite defines an ad-hoc **seam** double (`helpers/seams.js` stays the only source) | `__tests__/helpers/learningsFixtures.js` | — | 2 | LI-01 | ⬚ |
| LI-03 | `[Fake first]` **RED capture-script suite**, TSPEC §T.3's two obligation oracles, **both run against a dedicated temporary git repository created by the test and used as the script's `cwd`, with a real `git`** — never the developer's checkout, which DoD 8 forbids mutating (TE F-03, Q-03). `LI-T-IGNORE` is **three** conjuncts against that repo seeded with the branch's `.gitignore`: (1) `.baseline-worktree` at the root **is** ignored — red at HEAD, where `git check-ignore` exits non-zero; (2) a nested `pdlc/workflows/__tests__/fixtures/x/.baseline-worktree` is **not** ignored; (3) `pdlc/workflows/__tests__/fixtures/learnings-baseline/` is **not** ignored. (2) and (3) are what give LI-04's root anchoring an oracle — a bare `.baseline-worktree`, `*` or `.baseline*` rule passes (1) alone while un-tracking fixture material this feature is about to commit (TE F-06). `LI-T-WORKTREE`: a forced throw injected **between** materialise and remove — through the script's **fixture/import seam, not `_git`**, so `git` stays real — leaves the `.baseline-worktree` path **absent** *and* the temp repo's own `git worktree list` showing **no entry** for it. The second conjunct is what distinguishes `git worktree remove` from `rm -rf`, is read from a real `.git/worktrees/` administrative state, and may not be dropped or degraded to an argv assertion | `__tests__/learningsCaptureScript.test.js` | — | 2 | LI-01 | ⬚ |
| LI-13 | `[Fake first]` **RED cross-module predicate pin** (TSPEC §I.1, §T.5). `LI-T-PIN-1` is a **three-way** agreement assertion in one test: the argv `enumerateCorpus` actually hands `_git`, the new `LEARNINGS_CORPUS_ARGV`, and `consolidationPredicate.test.js`'s own literal, asserted mutually equal. Uses `fakeGit` from `helpers/consolidationDoubles.js` — **not** `helpers/seams.js`'s, which is a different shape (`git._git` + `git.calls` versus a seam function + `git.invocations`); this is the one suite in the feature that does so, because its subject is the sibling module | `__tests__/learningsPredicatePin.test.js` | — | 2 | LI-01 | ⬚ |
| LI-04 | **GREEN the ignore rule.** Add `/.baseline-worktree/` to `.gitignore`, root-anchored the way `/.claude/pdlc.config.json` already is, so a nested fixture directory of that name is untouched (TSPEC §T.3 obligation 1). Greens `LI-T-IGNORE`. Load-bearing beyond tidiness: `coveredViolations` walks the entire tree under `root` skipping only `.git/` and `node_modules/` (`pdlc/workflows/lib/document-oracles.mjs`), so an abandoned worktree would be scanned as a second copy of every `docs/**` artifact | `__tests__/learningsCaptureScript.test.js` | `.gitignore` | 3 | LI-03 | ⬚ |
| LI-05 | **GREEN the capture script** (TSPEC §T.3 steps 1–3): `git worktree add` at the resolved merge-base, import `main` from the worktree's `orchestrate-dev.js`, drive it through the branch-side L3 fixture matrix, write `{caseId}/{dispatchIndex}.txt` plus `MANIFEST.json` (merge-base sha + SHA-256 per file), and remove the worktree in a **`finally`** with `git worktree remove --force`, never `rm -rf`. Greens `LI-T-WORKTREE`. Creates the repository's `scripts/` directory | `__tests__/learningsCaptureScript.test.js` | `scripts/capture-learnings-baseline.mjs` | 3 | LI-02, LI-03 | ⬚ |
| LI-07 | **RED selection suite** (L1, TSPEC §T.5): `LI-AT-04`, `LI-AT-07` (both regimes — `BYTES-BINDING` and its mirror), `LI-AT-08`, `LI-AT-09`, `LI-AT-10`, `LI-AT-13`, `LI-AT-15`, `LI-AT-16`, `LI-AT-28`. Nine ATs, eligibility/ordering/count rules only — the material-extraction claims are LI-08's and are **not** duplicated here (TSPEC §T.5). **`LI-AT-15` is written whole, and is therefore not greened whole by LI-16** (PM F-03, TE F-03): FSPEC AT-15 has **four** clauses, not three — given the nested `docs/discarded/{feature}/LEARNINGS-*.md` fixture, (1) nothing is selected, (2) the report carries corpus-level `RSN-EMPTY`, (3) no discarded document appears in any record; **and given** the one-file `docs/discarded/LEARNINGS-x.md` fixture, (4) it is a corpus member, is selected, and carries **no** exclusion reason (E-35). Clauses (1) and (4) are the pure core's and are greened by LI-16; (2) and (3) are the shell's and the injector's. Clause (4) is the **positive** half of the pair and may not be dropped: without it clause (1) is an absence-only oracle over path handling, which an implementation that selects nothing at all would satisfy. LI-02's `DISCARDED-NESTED` and `DISCARDED-DIRECT` corpora are the two fixtures this test needs, in that order. The test stays one test in this one suite, so §T.5's partition and `LI-T-SUITEMAP`'s disjointness are untouched; its clauses (2) and (3) drive the L2 shell and the injector through `helpers/seams.js`, so `LI-AT-15` **stays red until LI-19** (batch 11) and appears in the expected-red ledger for batches 8–10. "Eligibility/ordering/count only" scopes which *rules* this suite asserts, never a licence to drop AT-15's report clauses Includes the `COUNT-BINDING` case where exactly 3 documents contribute and exactly 5 carry `RSN-COUNT` | `__tests__/learningsSelect.test.js` | — | 3 | LI-02 | ⬚ |
| LI-08 | **RED block/material suite** (L1): `LI-AT-05` (the rendered form transcribed literally from TSPEC §OQ.1, not keyword-matched), `LI-AT-11` (section-set equality over what BR-6 selected), `LI-AT-12` (the character-safe cut of §D.5 — an **ASCII** fixture so the expected count is the bound exactly, plus a separate multi-byte case pinning `≤`). Expected byte counts are hand-computed from the fixture over **material only**, ignoring every delimiter (§D.5) | `__tests__/learningsBlock.test.js` | — | 3 | LI-02 | ⬚ |
| LI-09 | **RED corpus-shell suite** (L2): `LI-AT-25` (`!reply.ok` ⇒ `RSN-UNLISTABLE`), `LI-AT-26` (**two** cases — `_readFile` returns `null` *and* `_readFile` throws, both real per P-8), `LI-AT-27` (`RSN-UNPARSEABLE`), plus the fault-injection case entering the outer `try/catch` ⇒ `RSN-UNLISTABLE` (BR-12's last row, TSPEC §T.7). Seams from `helpers/seams.js` only | `__tests__/learningsCorpus.test.js` | — | 3 | LI-02 | ⬚ |
| LI-06 | **Capture and commit the pre-feature baseline, author its guard, and prove the guard fails** (TSPEC §T.3, T-O-2). Run `scripts/capture-learnings-baseline.mjs` **before any production edit exists on the branch**; commit `{caseId}/{dispatchIndex}.txt` and `MANIFEST.json`. Then author the guard suite: one **hand-transcribed** digest literal per `{caseId}`, copied by a human from this capture (DC-14), asserted against both the recomputed file digests and `MANIFEST.json`'s entries, with **set equality over the `{caseId}` keys**, never containment. The guard is authored after the artifact it guards, so it is the one oracle in the feature with no red predecessor — and therefore carries an explicit **three-step mutation proof**, performed before the commit and recorded verbatim in the task's completion note (TE F-04): (i) flip one byte in one committed baseline `.txt` ⇒ that `{caseId}`'s digest assertion reds, restore; (ii) delete one whole `{caseId}` directory ⇒ the **set-equality** assertion reds — the conjunct containment would have let pass, restore; (iii) add a spurious `{caseId}` directory absent from the transcribed literals ⇒ set equality reds, remove. Each step targets a different clause, so all three are required; a step that does not red is a halt, not a pass. The merge-base-sha ancestor check is kept as a weaker second signal only | `__tests__/learningsBaselineGuard.test.js`, `__tests__/fixtures/learnings-baseline/` | — | 4 | LI-04, LI-05 | ⬚ |
| LI-10 | **RED record suite**: `LI-AT-17` (BR-8 row-field set equality over `rows[i]`), `LI-AT-18`, `LI-AT-19`, `LI-AT-21` at L1/L2; **`LI-AT-20` and `LI-AT-22` at L3**, over the `DIVERGENT-CORPUS` fixture (five authoring dispatches; the scripted `_git` reply gains a path after dispatch 2 and fails at dispatch 5). Asserts the **per-dispatch oracle locus only** — `dispatches[i].corpusOutcome`, `dispatches[i].orderKeys`, `corpusDiverged` true on exactly dispatches 3 and 5 — and asserts **nothing about `runMirror`**, whose value upstream leaves deliberately unconstrained (REQ AC-3.2; a test pinning it reds a conforming implementation). **BR-10's two completeness tests are split across two green tasks** (PM F-02): locus 1 — set equality over the dispatch record's rule-input field set and over `Object.keys(dispatches[i].orderKeys[j])` — is greened by LI-19 at batch 11; locus 2 — set equality over `Object.keys(learningsInjection.ruleInputs.thresholds)`, the run-level record that does not exist until the report key does — is greened by **LI-21** at batch 13, and `LI-AT-22`'s run-level half is listed in the expected-red ledger for batches 11–12. Writing both here and attributing both to LI-19 would halt the batch-11 gate on a test that is correct and merely early | `__tests__/learningsRecord.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| LI-11 | **RED dispatch-universe suite** (L3, the largest): `LI-AT-01`, `LI-AT-02`, `LI-AT-03`, `LI-AT-06`, `LI-AT-14` (two whole-process runs, not two loop iterations), `LI-AT-23`, `LI-AT-24`, `LI-AT-29`, `LI-AT-31`, `LI-AT-33`, `LI-AT-34`, `LI-AT-35`. Also owns four TSPEC-local cases that carry no FSPEC AT id: the **composition-site set equality** (`_recordDocType` probe, expected value `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`, **and** the accepted set equal to `LEARNINGS_TARGET_DOCTYPES`, both hand-transcribed, both **equality** never containment); `LI-T-RETRY-1…3` (one `dispatches[]` row, one `LEARNINGS_CORPUS_ARGV` `_git` call, iteration 2's prompt differing from iteration 1's only inside `opener`); AC-5.2's **write half** — a `git status --porcelain` set-equality delta around the run in a **dedicated temp git repository that is the run's `cwd`**, with **no exemption list**; and the **static seam-discipline scan** over the region between LI-15's sentinel comments (no `fs.`, `writeFileSync`, `mkdirSync`, `appendFileSync`, `require("fs")`). AT-33/AT-34 share one instrument in this one file, and AT-33's expected read set is **hand-transcribed** from the fixture's scripted `ls-files` stdout minus the self paths — never derived from `gatherLearningsCorpus` | `__tests__/learningsDispatchSet.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| LI-12 | **RED configuration suite** (**L3**, not L1 — TSPEC §T.5): `LI-AT-30` (`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ an **enabled** run whose BR-8 rows are present and empty) and `LI-AT-32` (three cases: section/file absent ⇒ enabled on §4.1 defaults with **no** notice; malformed section ⇒ key **present**, run enabled, `NTC-MALFORMED`; wrong-typed declared key ⇒ key present, that key defaulted, `NTC-KEYTYPE`) with a **two**-member notice set equality matching `LEARNINGS_NOTICES` exactly. Drives `main()` over the full seam set with a scripted `_agent`, on `advisoryDisabled.test.js`'s pattern (`import mainDev, * as dev from "../orchestrate-dev.js"`). `parseLearningsConfig`'s pure-unit assertions live here as supporting tests carrying **no AT id**, so the §T.5 counts are unchanged | `__tests__/learningsConfig.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| LI-23 | `[Fake first]` **RED fail-open arm inventory** (TE F-07). `learningsArmInventory.test.js` drives all twelve arms of the TSPEC §T.7 inventory in one file and accumulates what it actually observed — every **non-`null`** `corpusOutcome` value, every `rejected[].reason` value and every `notices` id — asserting each **set-equal** to the frozen catalogue LI-15 defines (`LEARNINGS_CORPUS_OUTCOMES`, `LEARNINGS_REJECT_REASONS`, `LEARNINGS_NOTICES`, TSPEC §D.1), never containment, so an arm that silently stops being entered and an invented code both red. **The `corpusOutcome` equality is scoped to non-`null` observations, and that scoping is load-bearing** (TE F-01): the healthy value of the field is `null` (TSPEC §D.2, `corpusOutcome: null, // | "RSN-UNLISTABLE" | "RSN-EMPTY"`), and three of the twelve arms — `RSN-COUNT`, `RSN-BYTES`, `RSN-SELF` — fire on runs whose corpus **is** listable and non-empty, so driving them necessarily observes `null`. Do **not** repair this by expecting `LEARNINGS_CORPUS_OUTCOMES ∪ {null}`: `null` is not a catalogue member and the expected value would stop being a literal transcription of the frozen catalogue, which is the whole point of the assertion. Scoping it out is not a coverage loss — the healthy `null` is asserted by `learningsRecord.test.js`'s BR-9 per-dispatch rows (LI-10 / LI-19). This is the **mechanical** form of the coverage obligation TSPEC §T.7 assigns to the inventory, which `--per-file --branches 85` cannot see inside a 15,311-line file; DoD 3 is discharged by this suite rather than by a human reading. The accumulation is **in-file** over its own fixtures — a ledger shared across suites is unreadable across jest workers — and its three tests are named `LI-T-ARMS-1…3`, carrying **no FSPEC AT id**, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s disjointness are unchanged. Red at batch 5 for the specified reason: no symbol under test exists. Greened by LI-21, the last task after which every arm is reachable | `__tests__/learningsArmInventory.test.js` | — | 5 | LI-02, LI-06 | ⬚ |
| LI-14 | **GREEN-terminal suite-map closure** (TSPEC §T.5). `LI-T-SUITEMAP`: the six AT-bearing suites' declared AT lists, hand-transcribed, asserted pairwise **disjoint** and **set-equal** to the 35-member literal `AT-01 … AT-35`, and asserted to match the `LI-AT-` test names actually registered in each suite file — read by **static parse of the suite file text**, never by importing the suite, so the assertion is well-defined before any production symbol exists (TE Q-02). **The closure is taken over the directory, not over a hardcoded six** (TE F-05): the suite enumerates `__tests__/learnings*.test.js` from disk, computes the set of files that register at least one `LI-AT-` **jest test title**, asserts that set **equal** to the six AT-bearing suites, and only then partitions. Over a hardcoded list, an `LI-AT-` name registered in one of the eight other new suites is invisible — the six lists still partition 35 and the duplicate ships. Keying on registered test titles rather than on textual mentions is what keeps this suite (which names `LI-AT-` ids in its own transcribed literal, but registers only `LI-T-SUITEMAP`) out of its own expected set. No new `Deps` edge is needed for the wider read: a file that does not yet exist can only fail to *contribute* a member, and the six that must be present are exactly the six this task already depends on. All six suite files exist at the end of batch 5, and so does every other `learnings*.test.js` file except this one, so this suite is **green on authoring**: it has no red episode and no symbol under test, which is why batch 6 is green-terminal and no green task claims to green it (TE F-02). Its value is regression pressure over the life of the region — adding an AT to one suite without removing it from another reds here | `__tests__/learningsSuiteMap.test.js` | — | 6 | LI-07, LI-08, LI-09, LI-10, LI-11, LI-12 | ⬚ |
| LI-15 | **GREEN the constants and the config reader** — the first production edit, and the whole of the region's frame. Sentinel comments opening and closing the region (LI-11's static scan is asserted over exactly this span); `LEARNINGS_CONFIG_PATH = MERGE_CONFIG_PATH`; `LEARNINGS_DEFAULTS` with `enabled: true`; the three frozen catalogues of TSPEC §D.1 and `LEARNINGS_TARGET_DOCTYPES`; `LEARNINGS_CORPUS_ARGV`; `parseLearningsConfig` and `readLearningsConfigSafely`, modelled on `parseAdvisoryConfig`/`readAdvisoryConfigSafely` and **placed immediately after them** so the two config readers sit adjacent. Thresholds validate as **non-negative** integers, `0` being a valid admits-nothing value (AC-4.4). Greens `LI-T-PIN-1` — and **only** `LI-T-PIN-1`: `LI-T-SUITEMAP` was green from the moment LI-14 authored it and no production symbol changes its outcome (TE F-02). `learningsConfig.test.js`'s AT rows stay red until LI-21 | `__tests__/learningsPredicatePin.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | LI-06, LI-13, LI-14 | ⬚ |
| LI-16 | **GREEN the pure selection core** (TSPEC §I.3, §D.3–§D.6): `looksLikeLearningsDocument` (deliberately weak — a truncated document stays eligible), `parseHarvestDate` (`\b`-anchored ISO prefix, string comparison, **no `Date` object**), `extractInjectableMaterial` (BR-6 priority order, character-safe cut, `bounded` decided at the cut), `orderCorpus` (§D.4's comparator with `Buffer.compare` as the tiebreak, not `<`/`>`), and `selectLearnings`, whose `rejected[]` is **total over `entries`** and tests `excluded` **before** `readOk` so a self document is never mis-reported as `RSN-UNREADABLE`. Greens `learningsSelect.test.js` | `__tests__/learningsSelect.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | LI-15, LI-07 | ⬚ |
| LI-17 | **GREEN the renderer.** `renderLearningsBlock({selected})` emitting TSPEC §OQ.1's exact form — header, four-sentence advisory preamble, per-document `<<< path — feature {p}, completed {d} >>>` opener with the `ABRIDGED` annotation when bounded, closer, trailer — prefixed with `\n\n` when non-empty and **exactly `""`** when `selected` is empty. Framing is never charged to any byte bound (§D.5). Greens `learningsBlock.test.js` | `__tests__/learningsBlock.test.js` | `pdlc/workflows/orchestrate-dev.js` | 9 | LI-16, LI-08 | ⬚ |
| LI-18 | **GREEN the IO shell.** `gatherLearningsCorpus({feature, _git, _readFile})` — one `_git(LEARNINGS_CORPUS_ARGV)` enumeration, one `_readFile` per non-self path inside a **mandatory `try/catch`** (P-8: `rtReadFile` throws where `defaultReadFile` returns `null`), self entries carried with `text: null, excluded: "RSN-SELF"` and **never opened** (§D.6), the whole shell wrapped in one outer `try/catch` returning the unlistable outcome. Never throws past `dispatchAndVerify`. Greens `learningsCorpus.test.js` | `__tests__/learningsCorpus.test.js` | `pdlc/workflows/orchestrate-dev.js` | 10 | LI-17, LI-09 | ⬚ |
| LI-19 | **GREEN the injector and the record.** `buildLearningsInjector({config, sink, _git, _readFile, _log})` returning `null` iff `config.enabled === false` — no `present` conjunct and no `!sectionMalformed` conjunct (REQ AC-5.1a/b) — and otherwise an async closure that gathers, selects, renders, and pushes one `dispatches[]` record per call in TSPEC §D.2's shape, including `corpusOutcome`, `orderKeys` and `corpusDiverged` (**`false`, never `null`, on the first dispatch of a run**). The run-level `runMirror` is written last-write-wins and asserted by nothing. Greens `learningsRecord.test.js`'s **per-dispatch** rows — `LI-AT-17`…`LI-AT-21` and `LI-AT-22`'s locus-1 completeness test — and `LI-AT-15`'s corpus-level `RSN-EMPTY` and no-discarded-document-in-any-record clauses in `learningsSelect.test.js`. `LI-AT-22`'s locus-2 half stays red until LI-21 | `__tests__/learningsRecord.test.js`, `__tests__/learningsSelect.test.js` | `pdlc/workflows/orchestrate-dev.js` | 11 | LI-18, LI-10, LI-07 | ⬚ |
| LI-20 | **GREEN the attachment and the probe seam.** In `dispatchAndVerify`: `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`, evaluated **once per episode, before the `for(;;)` loop**, with the resulting block held in a `const` and concatenated **after** the per-iteration-mutated `opener`; `_recordDocType(docType)` called at that same point, on **both** arms of `injectHere`, once per episode and never inside the loop. Plumb both defaulted seams through **all five hand-written hops** — `main`'s destructured params, the `wrapperSeams` object literal (an enumerated literal, not a spread; this hop alone carries Phase H's `"LEARNINGS"`), `reviewLoop`'s destructured params, `reviewLoop`'s `wrapped` closure (Phase CR's `null` reaches the composition site through this path **and no other**), and `dispatchAndVerify`'s destructured params. Both default to a no-op/`null`, so an uninjected run is byte-unchanged (AC-4.3). Greens `learningsDispatchSet.test.js` except its report-shape rows | `__tests__/learningsDispatchSet.test.js` | `pdlc/workflows/orchestrate-dev.js` | 12 | LI-19, LI-11 | ⬚ |
| LI-21 | **GREEN the run wiring and the report key.** In `main()`: read the config **once per run** via `readLearningsConfigSafely`, push `NTC-MALFORMED`/`NTC-KEYTYPE` onto `buildFinalReport`'s **existing run-level `notices` channel** (`orchestrate-dev.js`'s `buildFinalReport` already takes `notices = []`) — never onto `learningsInjection` — build the injector, hang it on `wrapperSeams`. Build `learningsInjection.ruleInputs.thresholds` **once per run** from the parsed config — the three REQ §4.1 values actually in force (`maxDocuments`, `maxBytesPerDocument`, `maxTotalBytes`), which is BR-10's **second** locus (TSPEC §D.2) and the record AC-3.3 gives an operator to reproduce a selection by hand; its completeness test is set equality over `Object.keys(learningsInjection.ruleInputs.thresholds)` (PM F-01). `runMirror` is carried alongside it, additive, asserted by nothing. In `buildFinalReport`: one added `learningsInjection = undefined` parameter, spread **conditionally** on the `...(advisory ? { advisory } : {})` precedent, so an explicitly disabled run's report has **no such key** while an enabled run with an empty selection has the key with empty rows. Greens `learningsConfig.test.js`, `learningsArmInventory.test.js`, `LI-AT-22`'s locus-2 half in `learningsRecord.test.js`, and the remaining `learningsDispatchSet.test.js` rows — the **report-shape rows are `LI-AT-23`, `LI-AT-24` and `LI-AT-31`**, named here rather than left to inference because the expected-red ledger is written in terms of them (TE Q-01): each reads the report key's presence, absence or corpus-level record, none of which exists before this task | `__tests__/learningsConfig.test.js`, `__tests__/learningsDispatchSet.test.js`, `__tests__/learningsRecord.test.js`, `__tests__/learningsArmInventory.test.js` | `pdlc/workflows/orchestrate-dev.js` | 13 | LI-20, LI-12, LI-23 | ⬚ |
| LI-22 | **🔵 REFACTOR and close.** Full-suite green under the arrangement's `testCommand`; the fail-open branch inventory of TSPEC §T.7 confirmed entered — **by `learningsArmInventory.test.js` (LI-23), not by reading**; the row-by-row walk survives only as the human cross-check that LI-23's three set equalities and §Traceability's twelve-arm table still name the same arms (the `--per-file --branches 85` gate cannot see a ~300-line region inside a 15k-line file, so this inventory **is** the coverage obligation, and TE F-07 is why it is now a suite); optionally a region-scoped `c8` invocation, which TSPEC leaves to PLAN as a cheap option and this row takes only if it costs nothing; region tidy-up with no behaviour change. No new assertions, no new files | all `learnings*.test.js` | `pdlc/workflows/orchestrate-dev.js` | 14 | LI-21 | ⬚ |

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

One row per **(file, owning task)** pair — never one row listing several owners in a cell. The
dispatcher parses this table's `Owner` cells as task ids and reconciles them against §Batches; a
cell reading `LI-15, LI-16, …` parses as one unknown id, and a cell reading `none` parses as a
stale row for a task that does not exist. Both are contract violations, so files with no owning
task are stated in prose below the table instead.

| File | Owner | Batch |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | LI-15 | 7 |
| `pdlc/workflows/orchestrate-dev.js` | LI-16 | 8 |
| `pdlc/workflows/orchestrate-dev.js` | LI-17 | 9 |
| `pdlc/workflows/orchestrate-dev.js` | LI-18 | 10 |
| `pdlc/workflows/orchestrate-dev.js` | LI-19 | 11 |
| `pdlc/workflows/orchestrate-dev.js` | LI-20 | 12 |
| `pdlc/workflows/orchestrate-dev.js` | LI-21 | 13 |
| `pdlc/workflows/orchestrate-dev.js` | LI-22 | 14 |
| `.gitignore` | LI-04 | 3 |
| `scripts/capture-learnings-baseline.mjs` (new directory) | LI-05 | 3 |

**The `orchestrate-dev.js` rows are why batches 7–14 each carry exactly one task.** Eight source
edits, eight batches, one writer each. Nothing about the split is stylistic: two same-batch tasks
appending to a 15,311-line file would silently drop each other's region and leave the suite green
on the survivor.

**Two files this feature touches the behaviour of are owned by no task, deliberately.**

- `pdlc/workflows/dist/pdlc-cli.mjs` — regenerated and staged by the wave gate's `postWaveCommand`
  (`node pdlc/workflows/build-runtime.mjs`) and `postWavePathspecs`
  (`.claude/pdlc.config.example.json`), once per wave, in every wave from 7 to 14. Giving it a task
  row would put a second writer on the one file every source task already touches. A hand edit to
  `dist/` is a halt condition (§Verification).
- `pdlc/workflows/package.json` — **not** modified: `scripts/capture-learnings-baseline.mjs` is
  deliberately left outside `c8.include`, which is exactly `orchestrate-dev.js`,
  `orchestrate-queue.js`, `build-runtime.mjs` and is resolved relative to `pdlc/workflows/` (a
  root-level script cannot be included from there without changing the `c8` block's root). The
  exemption, its justification and the two named oracles that stand in for a coverage floor are
  recorded in §Verification DoD 11 rather than left silent (TE F-08).

### Tests, helpers and fixtures

| File | Owner | Batch |
|---|---|---|
| `pdlc/workflows/__tests__/learningsPremises.test.js` | LI-01 | 1 |
| `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | LI-02 | 2 |
| `pdlc/workflows/__tests__/learningsCaptureScript.test.js` | LI-03 | 2 |
| `pdlc/workflows/__tests__/learningsPredicatePin.test.js` | LI-13 | 2 |
| `pdlc/workflows/__tests__/learningsSelect.test.js` | LI-07 | 3 |
| `pdlc/workflows/__tests__/learningsBlock.test.js` | LI-08 | 3 |
| `pdlc/workflows/__tests__/learningsCorpus.test.js` | LI-09 | 3 |
| `pdlc/workflows/__tests__/learningsBaselineGuard.test.js` | LI-06 | 4 |
| `pdlc/workflows/__tests__/fixtures/learnings-baseline/` (incl. `MANIFEST.json`) | LI-06 | 4 |
| `pdlc/workflows/__tests__/learningsRecord.test.js` | LI-10 | 5 |
| `pdlc/workflows/__tests__/learningsDispatchSet.test.js` | LI-11 | 5 |
| `pdlc/workflows/__tests__/learningsConfig.test.js` | LI-12 | 5 |
| `pdlc/workflows/__tests__/learningsArmInventory.test.js` | LI-23 | 5 |
| `pdlc/workflows/__tests__/learningsSuiteMap.test.js` | LI-14 | 6 |

**The arithmetic, restated so it reconciles with the tables above it (TE F-11).** Twenty-four rows
over **seventeen distinct files** — ten production rows over three files (`orchestrate-dev.js`
eight times, `.gitignore` and the capture script once each) and fourteen test rows over fourteen
files. **Every one of the 23 tasks in §Batches owns at least one row**, which is the invariant the
dispatcher's manifest check enforces and which LI-01 did not satisfy before TE F-05. The only
multi-owner file is `orchestrate-dev.js`, and its eight owners occupy eight different batches; the
only task owning two files is LI-06, whose guard suite and guarded fixture subtree are committed
together by construction. No two rows share a batch and a file.

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
| 1 | LI-01 | premise pre-flight | green **over an owned suite** — `learningsPremises.test.js` asserts every premise structurally, so batch 1 has a result a skipped task could not produce (TE F-05) |
| 2 | LI-02, LI-03, LI-13 | fixture helper + the two suites that need no other suite | **red** |
| 3 | LI-04, LI-05, LI-07, LI-08, LI-09 | ignore rule, capture script, the three L1/L2 red suites | mixed: LI-04/LI-05 green their own oracles, LI-07…LI-09 **red** |
| 4 | LI-06 | **the T-O-2 gate moment** — capture, commit, guard | green (guard passes over the fresh capture) |
| 5 | LI-10, LI-11, LI-12, LI-23 | the three L3 red suites, which need the baseline, plus the fail-open arm inventory | **red** |
| 6 | LI-14 | closure over the six AT-bearing suites | **green** — `LI-T-SUITEMAP` statically parses the `learnings*.test.js` directory, whose six AT-bearing suites all exist at the end of batch 5 (TE F-05), and has no symbol under test, so it is green on authoring (TE F-02) |
| 7–13 | LI-15 … LI-21 | the serial source lane, one edit per batch | **mixed**, against §Verification's per-batch expected-red ledger: every suite whose green task has landed is green, every other new suite is still red for its specified reason, and no pre-existing test's status moves |
| 14 | LI-22 | refactor, inventory cross-check, close | green — the only unqualified full-suite-green gate in the feature |

### Why each edge exists

| Edge | Kind | Why it is not optional |
|---|---|---|
| everything → LI-01 | pre-flight | a premise that has moved since TSPEC v0.6 must become blocking work before any task builds on it |
| LI-04, LI-05 → LI-03 | red-before-green | both obligations of TSPEC §T.3 are things a rebase drops silently; each has a named oracle that must be red first |
| LI-05 → LI-02 | data | the capture drives the **L3 fixture matrix**, which lives in the helper |
| LI-06 → LI-04, LI-05 | ordering + tooling | the capture cannot run before the script exists, and must not run before `.baseline-worktree` is ignored, or an interrupted run dirties the tree the `coveredViolations` walk scans |
| LI-10, LI-11, LI-12 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31) compare against committed baseline prompts |
| LI-23 → LI-06 | data | **not** byte-identity — LI-23 carries no FSPEC AT and asserts nothing about bytes (TE F-06); its reason is the **L3 fixture matrix** the twelve arms are driven through, which the capture and the L3 suites share. The edge is slack: LI-23 sits in batch 5 either way |
| LI-14 → LI-07 … LI-12 | closure | the suite map asserts over suite files that must exist to be read |
| LI-15 → LI-06 | **T-O-2** | the first production edit may not precede the baseline capture; this single edge is what makes the obligation structural rather than remembered |
| LI-16 → LI-15, LI-17 → LI-16, … LI-22 → LI-21 | single-writer serialisation | consecutive edits to `orchestrate-dev.js`; also a genuine build order — the selection core consumes LI-15's catalogues, the renderer consumes the selector's output, the shell feeds the selector, the injector composes all three, the attachment consumes the injector, the report consumes the sink |
| LI-16 → LI-07, LI-17 → LI-08, LI-18 → LI-09, LI-19 → LI-10, LI-20 → LI-11, LI-21 → LI-12 | red-before-green | each green task names the red suite it satisfies |
| LI-19 → LI-07 | red-before-green, second suite | LI-19 also greens `LI-AT-15`'s corpus-level clauses, which live in LI-07's suite; the edge is what keeps that green from being attributed to a task that runs before the red exists (PM F-03) |
| LI-21 → LI-23 | red-before-green, second suite | LI-21 is the task after which all twelve fail-open arms are reachable, so it is the task that greens the arm inventory (TE F-07) |
| LI-15 → LI-14 | ordering, **not** red-before-green | LI-15 greens nothing in `learningsSuiteMap.test.js` — that suite was green from authoring. The edge stands because the suite map is the closure check over the AT partition and must be authored before the source lane starts moving names around (TE F-02) |

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
| AT-04, AT-07, AT-08, AT-09, AT-10, AT-13, AT-16, AT-28 | `learningsSelect.test.js` | LI-07 | LI-16 |
| AT-15 (same suite, **split green** — four clauses) | `learningsSelect.test.js` | LI-07 | LI-16 for the **eligibility clauses** — both the nested exclusion (clause 1) and E-35's direct-path inclusion (clause 4, TE F-03); **LI-19** for the corpus-level `RSN-EMPTY` and no-record clauses (2 and 3) |
| AT-05, AT-11, AT-12 | `learningsBlock.test.js` | LI-08 | LI-17 |
| AT-25, AT-26, AT-27 | `learningsCorpus.test.js` | LI-09 | LI-18 |
| AT-17, AT-18, AT-19, AT-21 (L1/L2); AT-20 (L3) | `learningsRecord.test.js` | LI-10 | LI-19 |
| AT-22 (L3, **split green** — BR-10's two loci) | `learningsRecord.test.js` | LI-10 | LI-19 for locus 1 (`dispatches[i].orderKeys`); **LI-21** for locus 2 (`ruleInputs.thresholds`) |
| AT-01, AT-02, AT-03, AT-06, AT-14, AT-23, AT-24, AT-29, AT-31, AT-33, AT-34, AT-35 | `learningsDispatchSet.test.js` | LI-11 | LI-20, then LI-21 for the **report-shape rows, which are exactly AT-23, AT-24 and AT-31** |
| AT-30, AT-32 | `learningsConfig.test.js` | LI-12 | LI-21 |

**Count: (8 + 1) + 3 + 3 + (5 + 1) + 12 + 2 = 35**, the split-green rows contributing their AT once each — a split green is two green tasks for one test, never two tests. LI-14's `LI-T-SUITEMAP` asserts exactly this partition
mechanically, so the arithmetic above is checked by a test rather than by a reader.

### TSPEC-local cases (no FSPEC AT id, not in the 35)

| Case | Suite | Red | Green |
|---|---|---|---|
| `LI-T-PIN-1` — three-way predicate agreement (§I.1) | `learningsPredicatePin.test.js` | LI-13 | LI-15 |
| composition-site set equality, both operands (§A.2 consequence b) | `learningsDispatchSet.test.js` | LI-11 | LI-20 |
| `LI-T-RETRY-1…3` — one selection per dispatch (§A.2 property 2, §T.6) | `learningsDispatchSet.test.js` | LI-11 | LI-20 |
| porcelain write-delta + static seam scan (§T.6, AC-5.2 write half) | `learningsDispatchSet.test.js` | LI-11 | LI-15 (sentinels), LI-20/LI-21 (behaviour) |
| `LI-T-IGNORE`, `LI-T-WORKTREE` (§T.3 obligations 1 and 2) | `learningsCaptureScript.test.js` | LI-03 | LI-04, LI-05 |
| baseline digest guard, set equality over `{caseId}` (§T.3) | `learningsBaselineGuard.test.js` | — (authored green over the fresh capture; falsified instead by LI-06's recorded three-step mutation proof, TE F-04) | LI-06 |
| `LI-T-ARMS-1…3` — observed reason codes set-equal to the three frozen catalogues (§D.1, §T.7) | `learningsArmInventory.test.js` | LI-23 | LI-21 |
| `LI-T-SUITEMAP` — §T.5 closure | `learningsSuiteMap.test.js` | — (**green on authoring**: six suite files, static parse, no symbol under test — TE F-02) | LI-14 itself |

### TSPEC fail-open branch inventory → entering task

TSPEC §T.7 is explicit that the `--per-file --branches 85` gate cannot see this region inside a
15,311-line file, so the inventory is the coverage obligation. Every arm has an entering task:

| Fail-open arm | Entered by | Entering tasks |
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

Twelve arms, twelve entering tasks. **The table is the map; `learningsArmInventory.test.js` (LI-23) is the oracle** (TE F-07): it drives all twelve arms and asserts the observed **non-`null`** `corpusOutcome` values, `rejected[].reason` values and notice ids **set-equal** to `LEARNINGS_CORPUS_OUTCOMES`, `LEARNINGS_REJECT_REASONS` and `LEARNINGS_NOTICES`, so an arm that silently stops being entered reds a test rather than surviving a reading. The non-`null` scoping on the corpus-outcome domain is TE F-01's: `null` is the healthy value of that field (TSPEC §D.2) and the three threshold/self arms cannot be driven without observing it, while `null` is not a member of the frozen catalogue — it is asserted instead by the record suite's per-dispatch rows. LI-22's row-by-row walk remains as the human cross-check that this table and that suite still name the same twelve arms — a diluted file-level percentage would have shown neither.

### TSPEC obligations and open questions → where they land

| Obligation | Landing |
|---|---|
| F-O-1 … F-O-7 (discharged in TSPEC) | implemented by LI-15 (F-O-3 registration, F-O-4), LI-16 (F-O-1), LI-17 (F-O-2), LI-19 (F-O-3 serialisation), LI-06 (F-O-5), LI-20 (F-O-6), LI-02 (F-O-7) |
| T-O-1 — serialise writers on `orchestrate-dev.js`, with an explicit manifest | §File-ownership manifest; batches 7–14 |
| §T.7's coverage obligation — the fail-open inventory, the `--per-file` floor being blind to the region | LI-23 authors the inventory suite, LI-21 greens it, LI-22 cross-checks it against the table above; DoD 3 |
| T-O-2 — capture the baseline before the first production edit | LI-06 at batch 4, bound by LI-15's `Deps` edge |
| T-O-3 — live-run read-cost measurement | **not a task** — operator, against REQ O-1 |
| T-O-4, T-O-5, T-O-6 | **not tasks** — PROPERTIES, Phase P |
| OQ.3 / C-8's second half | no task: TSPEC records that static caps discharge it only in the weak sense, and that moving the caps is a REQ §4.1 change |

## Verification

### The measured baseline

Measured at HEAD on `feat-pdlc-learnings-injection` (a docs-only branch — no production code has
moved yet), 2026-08-20:

```
cd pdlc/workflows && npm test
Test Suites: 1 failed, 98 passed, 99 total
Tests:       2 failed, 70 skipped, 3851 passed, 3923 total
Time:        28.36 s
```

The two failures are both in `pdlc/workflows/__tests__/documentOracles.test.js`:
`AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing` and
`PROP-SWEEP-2(b)`. They are **pre-existing and expected on a feature branch**: `coveredViolations`
walks the entire tree under `root`, so this feature's own in-flight `docs/**` artifacts are scanned
as live documents. The consuming arrangement excludes that suite from the wave gate —
`.claude/pdlc.config.example.json`'s `testCommand` carries `'documentOracles'` in
`--testPathIgnorePatterns` — and under that exact invocation the suite is green:

```
Test Suites: 98 passed, 98 total
Tests:       70 skipped, 3828 passed, 3898 total
```

**Three pre-existing failures also exist in `pdlc/engine`, and the gate runs that suite first.**
`cd pdlc/engine && npm test` reports `pass 841 / fail 3`, the three being
`the dry run names the workflow module it would load and the seams it overrides`,
`` `pdlc hello` reports the canonical workflow module paths `` (both `pdlc/engine/__tests__/cli.test.js`,
asserting that resolved module paths lie under this repository's `pdlc/workflows/`) and
AT-2.2 (the plugin's three `claude plugin install` sites asserted as a positive). They are
machine-state artefacts of the local engine store, not this feature's — but the arrangement's
`testCommand` begins `(cd pdlc/engine && npm test) &&`, so **the wave gate halts on them before it
ever reaches this feature's suites**. Triaging them is a **pre-flight item on LI-01**: either they
are reproduced in CI (in which case they are blocking work owned by someone, and this feature waits
behind them) or they are local-store artefacts (in which case LI-01 records the CI-green evidence
and the implementation proceeds). Guessing which is worse than halting.

**The coverage command was measured too, and it does not pass verbatim at HEAD (TE F-09).**
`npm run test:coverage` in `pdlc/workflows` is two stages joined by `&&`; stage 1 is the whole jest
run, so it inherits the two pre-existing `documentOracles` failures and **exits 1 before stage 2
ever runs** — DoD 11 cannot be stated against the bare script. Under the arrangement's own
exclusion, both stages pass and stage 2 yields the per-file numbers DoD 11 now names:

```
cd pdlc/workflows
npx c8 npm test -- --runInBand --testPathIgnorePatterns \
  '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'
Test Suites: 98 passed, 98 total
Tests:       70 skipped, 3828 passed, 3898 total          → stage 1 exit 0

npx c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0
File                  | % Stmts | % Branch | % Funcs | % Lines
All files             |   96.84 |    88.21 |    92.2 |   96.84
 build-runtime.mjs    |   98.12 |    88.23 |     100 |   98.12
 orchestrate-dev.js   |   97.27 |    88.14 |   95.02 |   97.27
 orchestrate-queue.js |   93.18 |    88.75 |   71.42 |   93.18   → stage 2 exit 0
```

**`orchestrate-dev.js` sits 3.14 points above the 85 % per-file branch floor**, and this feature
adds a ~300-line region with twelve fail-open arms to that same file. That headroom is the number
DoD 11 compares against, and H-8 is what happens if the region consumes it.

**A dirty working tree adds a third failure, and it is not a flake.**
`__tests__/consumerCleanup.test.js`'s `AT-4.1` runs `execFileSync("git", ["status", "--porcelain"])`
at the **repository root** and asserts the output is exactly `""`. The call carries **no `-uno`**
(TE F-04), so the default `-unormal` applies and untracked files appear as `??` entries: a new test
file that has been **written but not committed** reds it exactly as an uncommitted edit to a tracked
file does — and "fourteen new files, one of them written a moment ago" is the state an implementer
is in for most of this feature. Any uncommitted edit anywhere in the repository — including an edit
to this PLAN — reds it too. Every measurement in this section was taken on a committed tree, and a wave that
measures on a dirty one will misread its own gate.

### The three gate wordings, and the expected-red ledger

| Batches | Gate |
|---|---|
| 2, 3 (LI-07…LI-09), 5 — **RED-terminal** | The batch's new tests **fail for the specified reason** — the symbol under test is not defined yet, or `.gitignore` lacks the rule — **and** every pre-existing test's status is unchanged from the baseline above. A new test failing for a *different* reason (a typo, a missing import, a helper that throws) is a batch failure, not a red. Batch 3 is mixed and is read per-suite: LI-04's and LI-05's two oracles are **green** in the same batch that LI-07…LI-09 land red |
| 1, 4, 6 — **green-terminal** | The batch's new suite is **green on authoring**: `learningsPremises.test.js` over HEAD's premises (batch 1), `learningsBaselineGuard.test.js` over the capture it was written from (batch 4), `learningsSuiteMap.test.js` over six suite files that already exist (batch 6). None has a red episode, and none may be *given* one by inventing a symbol for it to miss — **and** every pre-existing test's status is unchanged from the measured baseline, the same conjunct the other three rows carry (TE F-02). Without it these batches would have no oracle for a regression they can cause, and batch 4 is the one that commits a whole new fixture subtree into a tree `coveredViolations` walks in full |
| 7–13 — **mixed, against the ledger below** | Every suite whose green task has landed is green; every suite still listed in that batch's ledger row is red **for its specified reason**; no other test's status moves from the measured baseline. A suite dropping out of the ledger early is as much a failure as one lingering — the ledger shrinks by exactly the rows the batch's task greens |
| 14 | **Full suite green**, unqualified, under the arrangement's `testCommand`, with the documented pre-existing exclusions and no others |

**The per-batch expected-red ledger** (PM F-04, TE F-01). Read as: *after* this batch's task lands,
these and only these of the feature's own tests are still red. It shrinks monotonically to empty.

| After batch | Landed by | Still expected red |
|---|---|---|
| 7 | LI-15 | `learningsSelect`, `learningsBlock`, `learningsCorpus`, `learningsRecord`, `learningsDispatchSet`, `learningsConfig`, `learningsArmInventory` (whole suites) |
| 8 | LI-16 | `learningsSelect` → **`LI-AT-15` only** (its corpus-level `RSN-EMPTY` and no-record clauses); `learningsBlock`, `learningsCorpus`, `learningsRecord`, `learningsDispatchSet`, `learningsConfig`, `learningsArmInventory` |
| 9 | LI-17 | `LI-AT-15`; `learningsCorpus`, `learningsRecord`, `learningsDispatchSet`, `learningsConfig`, `learningsArmInventory` |
| 10 | LI-18 | `LI-AT-15`; `learningsRecord`, `learningsDispatchSet`, `learningsConfig`, `learningsArmInventory` |
| 11 | LI-19 | `learningsRecord` → **`LI-AT-22`'s locus-2 assertion only** (`ruleInputs.thresholds`); `learningsDispatchSet`, `learningsConfig`, `learningsArmInventory`. `LI-AT-15` greens here |
| 12 | LI-20 | `LI-AT-22` locus 2; `learningsDispatchSet` → **`LI-AT-23`, `LI-AT-24`, `LI-AT-31` only** (the report-shape rows); `learningsConfig`, `learningsArmInventory` |
| 13 | LI-21 | **nothing** — the ledger is empty, and batch 14's unqualified gate is therefore a restatement rather than a new demand |

Three properties of this ledger are load-bearing. It is stated in **test names**, not suite names,
wherever a suite is split across two green tasks, because "`learningsRecord` is partly red" is not
a gate a dispatcher can evaluate. It **shrinks by exactly** the rows the batch's own task claims to
green, so a batch that greens something it did not claim is a signal to re-read the task, not a
bonus. And it reaches **empty at batch 13**, one batch before the unqualified gate, so batch 14's
refactor has a green suite to refactor against.

**No exemption list grows during this feature.** The two exclusions in §The measured baseline are
the arrangement's, are measured here, and are the whole set. Adding a third to make a batch pass is
a halt condition — and with the ledger in place there is no batch for which that is even tempting.

### Definition of Done

1. All 35 FSPEC acceptance tests implemented, each in exactly one suite, each named `LI-AT-{N}`, and `LI-T-SUITEMAP` green over the hand-transcribed partition **and over the directory-wide closure** — the set of `__tests__/learnings*.test.js` files registering an `LI-AT-` title equals the six AT-bearing suites (TE F-05).
2. All TSPEC-local cases green: `LI-T-PIN-1`, the composition-site set equality on **both** operands, `LI-T-RETRY-1…3`, `LI-T-IGNORE`, `LI-T-WORKTREE`, the baseline digest guard, the porcelain write-delta and the static seam scan.
3. Every fail-open arm of TSPEC §T.7 entered by its named test — twelve for twelve, **asserted by `learningsArmInventory.test.js` (LI-23) as set equality against the three frozen catalogues**, with LI-22's row-by-row walk as the human cross-check that the suite and §Traceability's table name the same arms.
4. Byte-identity holds where promised — and this is a **deliberate strengthening** of REQ, not a restatement of it (PM Q-02): REQ demands baseline byte-identity only for AC-5.1a's disabled run, while AC-4.1/AC-4.2/AC-4.4 demand "composed exactly as today" and an enabled-with-empty-selection run. The claim below extends the baseline comparison to all four states because the same committed artifact answers all four at no extra cost. It is a claim about **composed prompts**, never about the report: an AC-4.4 admits-nothing run carries the `learningsInjection` key with empty rows and is still prompt-identical. The claim is: a disabled run, an empty corpus, an unlistable corpus and an admits-nothing configuration each compose prompts **character-for-character** equal to the committed pre-feature baseline (AC-4.1, AC-5.1a, AT-24); every non-authoring dispatch likewise (AC-4.3).
5. Report shape: `learningsInjection` **absent** on an explicitly disabled run, **present with empty rows** on an enabled run that selected nothing; `NTC-*` notices on the run-level `notices` channel, never inside `learningsInjection`.
6. `pdlc/workflows/dist/pdlc-cli.mjs` regenerated and staged in every wave that touched `orchestrate-dev.js`; `node pdlc/workflows/build-runtime.mjs --check` exits zero at the end of batch 14.
7. No new file under `pdlc/workflows/` other than tests, helpers and fixtures — `prepack.mjs`'s `MODULE_NAMES` is unchanged, so a new production module would ship green and arrive absent.
8. The working tree after any pipeline run is unchanged: no index, cache or state file anywhere (NG-1, NG-4, AC-5.2), proven by the porcelain instrument in its own temp repository with no exemptions.
9. `.baseline-worktree` ignored **and** removed in a `finally`; `git worktree list` clean.
10. The three PROPERTIES obligations (T-O-4…T-O-6) are authored and green — outside this PLAN's task rows, inside the feature's Definition of Done.
11. Coverage, stated against the measured prior value (TE F-09): run as `npx c8 npm test -- --runInBand` under the arrangement's four `--testPathIgnorePatterns`, **both stages exit 0**, and `orchestrate-dev.js`'s per-file branch coverage is **≥ 85 %** — measured 88.14 % at HEAD, so the region may consume at most 3.14 points of headroom. The bare `npm run test:coverage` is not the gate: it inherits the two `documentOracles` failures in stage 1 and never reaches stage 2. The per-file floor is **not** claimed as this region's oracle (§Traceability, DoD 3).
12. Coverage exemption, stated rather than silent (TE F-08): `scripts/capture-learnings-baseline.mjs` is **outside** `pdlc/workflows/package.json`'s `c8.include` — that block resolves relative to `pdlc/workflows/`, so a repository-root script cannot be added to it without re-rooting the `c8` configuration, and no task owns `package.json`. It is a human-invoked one-shot tool, run once in LI-06 and never in the pipeline. The oracles standing in for a coverage floor are named: `LI-T-IGNORE`'s three conjuncts, `LI-T-WORKTREE`'s two, and the baseline guard itself, which fails if the script's merge-base resolution, manifest writing or per-file digesting is wrong — the script's output is the thing the guard is computed over.

### Halt conditions

| # | Condition | Why guessing is worse than halting |
|---|---|---|
| H-1 | An LI-01 premise no longer holds — e.g. `MODULE_NAMES` has grown, or a fifth `dispatchKind: "authoring"` site exists | Every design decision downstream of it was made on the old measurement; proceeding builds on a premise nobody re-checked |
| H-2 | The engine's three pre-existing failures reproduce in CI | The wave gate cannot pass, and forcing it means editing the gate, not the code |
| H-3 | The capture in LI-06 cannot run because a production edit already landed | The baseline would record feature code as "pre-feature", quietly voiding every byte-identity claim in the feature |
| H-4 | A byte-identity test reds after LI-20 or LI-21 | This is the feature having changed a prompt it promised not to change. **Re-capturing the baseline is never the repair** — TSPEC §T.3 makes the distinction mechanical: a legitimate re-capture adds or replaces whole `{caseId}` directories while every retained digest is unchanged |
| H-5 | The composition-site set equality reds because a `docType` reached `dispatchAndVerify` that `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` does not contain | A seventh authoring phase exists; whether it should inherit injection is a **product** decision (REQ C-1, NG-5). Relaxing set equality to containment is the one repair that must not be made |
| H-6 | Two tasks in one batch are found to write one file | Last-writer-wins is invisible to the green gate; the manifest is the audit and a violation halts the batch |
| H-8 | `orchestrate-dev.js`'s per-file branch coverage drops below 85 % after the region lands | The measured headroom is 3.14 points (88.14 % at HEAD). Falling through the floor means fail-open arms shipped unentered, which is precisely what DoD 3's inventory exists to prevent — lowering the floor to fit the code is the repair that must not be made |
| H-7 | A test needs a seam double that `helpers/seams.js` does not provide | TSPEC §T.2 scopes the exception to `learningsPredicatePin.test.js` alone; a second ad-hoc seam object is a design question, not a test-authoring convenience |

## Open questions and upstream errata

### Errata raised from this document's authoring

Two defects in **FSPEC v0.10** are still live at HEAD and both bear directly on task rows here. They
were first raised by TSPEC v0.6 (as ERR-3 and ERR-7) and are re-raised because FSPEC v0.10 — whose
changelog records erratum rounds for BR-14, E-13 and the AC-6.2 traceability row — does not carry a
correction for either, and a test author writing LI-11 from FSPEC rather than TSPEC would write a
failing test against a correct implementation. This PLAN does not edit FSPEC and does not resolve
either silently in a task row; both are routed.

| Item | Effect on this PLAN if unresolved |
|---|---|
| **FSPEC BR-1** still states the rule "consumes the classification, it does not restate the membership", while TSPEC §A.2 adds the load-bearing `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct that Phase CR's `docType: null` optimizer round requires | LI-11's AT-02 has two contradictory expected sets. The task row is written to **TSPEC's** reading, and says so; a reviewer scoring it against BR-1 would reject a correct test |
| **FSPEC BR-15**'s expected set includes "the corpus-root enumeration" on an instrument defined as "file-open calls under `docs/`", but the enumeration is a `git ls-files` call and contributes no member | LI-11's AT-33 set equality cannot hold as FSPEC states it. The row is written to TSPEC §T.6's reading — hand-transcribed read paths, enumeration excluded |

TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5) are unchanged by this document and are not
re-raised here: ERR-5's provenance was corrected in FSPEC's v0.7 erratum round (E-13 now reads
"measured: 2 of 89 at HEAD, both in regime-ledger; none in yumo-plugins", which is consistent with
this repository's nine bare-ISO `Date Completed` values), and ERR-1 and ERR-2 remain with FSPEC's
author. **ERR-2 does affect a task row**, and LI-11 already carries its consequence: the erratum
land-proof retry is a second block-carrying authoring dispatch inside one erratum round, so AT-02's
fixture list includes the fourth run shape TSPEC §T.6 adds beyond FSPEC's three.

### Questions this PLAN deliberately does not answer

| # | Question | Disposition |
|---|---|---|
| P-Q-1 | Should `scripts/` live at the repository root, or under `pdlc/workflows/`? | TSPEC §T.3 pins the root path; the directory does not exist at HEAD and LI-05 creates it. A relocation is a TSPEC amendment, not a PLAN choice |
| P-Q-2 | Should LI-20 and LI-21 be one task? | They are two because the attachment and the report are separately reviewable and the source lane is serial either way. Merging them costs a batch and buys nothing |
| P-Q-3 | Does the region need its own `c8` invocation? | TSPEC leaves it to PLAN as a cheap option; LI-22 takes it only if it costs nothing, because the §T.7 inventory is the obligation and does not depend on tooling that does not exist |
| P-Q-4 | What happens if the corpus grows past `RT_READ_CACHE_MAX_BYTES` during the feature's life? | Not a task: TSPEC §A.4 records that residency is not guaranteed, and T-O-3's live measurement is what would move REQ §4.1's thresholds |

### Questions this PLAN does answer, because a task depends on the answer

| # | Question | Answer |
|---|---|---|
| P-A-1 | If the baseline is legitimately re-captured mid-feature (H-4's "adds or replaces whole `{caseId}` directories while every retained digest is unchanged"), who re-transcribes the hand-copied digest literals, and when? (PM Q-01) | **The task that causes the re-capture owns it, in the same commit as the fixture.** The guard's literals and `fixtures/learnings-baseline/**` are one artifact in two files: a commit that moves one without the other leaves a guard that is green against nothing or red against everything. The re-capture is therefore an amendment to LI-06's row — a second owner row in the manifest for both files, in the batch that needs it — never an ad-hoc edit by whichever task noticed. The set-equality-over-`{caseId}` assertion is updated in that same commit, and the three-step mutation proof is **re-run**, because a re-transcription is exactly the operation whose slips the proof exists to catch. DoD 4's byte-identity promise survives only if the retained digests are unchanged; a re-capture that moves a retained digest is H-4, not an amendment |
| P-A-2 | LI-01 says "promote any absent premise to blocking work"; H-1 says halt. Which, and who decides? (PM Q-03) | **Both, in order, and the bar is whether the premise is this feature's to move.** LI-01 halts the wave first — that is what a red `learningsPremises.test.js` does — and the operator then classifies. A premise that moved because the repository moved underneath us (a rebase renamed a seam, `MODULE_NAMES` grew) is blocking work this feature absorbs: fix the premise, re-green LI-01, continue. A premise that moved because a **product** question was answered differently — H-5's seventh authoring phase is the named case, and REQ C-1/NG-5 make it a product decision — is a halt to the operator and a REQ/FSPEC question, and no task row may absorb it. The distinction is not "how expensive is the fix": it is "does fixing it decide something REQ has not decided" |
| P-A-3 | Are the three PROPERTIES obligations (T-O-4…T-O-6) inside the expected-red ledger? (PM Q-05) | **No — the ledger's universe is exactly the fourteen `learnings*` files the §File-ownership manifest owns**, and PROPERTIES is not among them (DoD 10 places it outside this PLAN's task rows). That is only sound if PROPERTIES does not land red on the branch mid-wave, because batches 7–13 gate on "no other test's status moves". So the process obligation is stated here rather than left implicit: a PROPERTIES suite authored during Phase P may be **committed to this branch only once it is green**, or after batch 14. If the operator chooses to land it red before batch 14, its rows enter the ledger by name for the batches in which they are red, exactly like a split suite — the ledger stays a set equality either way, and what must not happen is a red suite outside it |
| P-A-4 | Does LI-23 need its own AC-2.6-shaped path fixtures, or does LI-02's declared surface already cover every arm? (TE Q-01) | **LI-02 already covers it, and no thirteenth fixture shape is scheduled.** The `RSN-SELF` arm needs a corpus entry whose path is the dispatching feature's own LEARNINGS document, and declared repository paths became part of `buildLearningsCorpus`'s spec surface in v0.2 (PM F-05) precisely because AC-2.6's rule is a path rule; the threshold arms use `COUNT-BINDING`/`BYTES-BINDING`, the read arms are driven through `helpers/seams.js`, and the notice arms through `parseLearningsConfig` inputs. If implementation finds an arm that no declared fixture reaches, the shape belongs in **LI-02**, not in `learningsArmInventory.test.js` — the no-ad-hoc-corpus-builder rule in LI-02's row is what makes that the only legal place — and LI-23's existing `Deps` on LI-02 already carries the edge |
| P-A-5 | Is a mid-feature re-capture's second manifest row added to the PLAN, or only to the completion note? (TE Q-02) | **To the PLAN, at the time.** The §File-ownership manifest is the dispatcher's single-writer contract, and a contract the dispatcher cannot read enforces nothing; a re-capture that exists only in a completion note is a second writer on `fixtures/learnings-baseline/**` and on the guard suite that no mechanical check can see. The amendment is therefore an edit to this document — one added row per file, naming the causing task and its batch — committed **before** the re-capture runs, with the completion note carrying the re-run three-step mutation proof (P-A-1). The manifest is a live document for exactly this reason |


### Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-08-20 | First draft from REQ v0.9 / FSPEC v0.10 / TSPEC v0.6 / DECISIONS. 22 tasks, 14 batches, serial source lane, T-O-2 bound structurally at batch 4 |
| 0.2 | 2026-08-20 | Round 1 cross-review (PM F-01…F-06, TE F-01…F-12, PM Q-01…Q-03, TE Q-01…Q-05). LI-01 gains an owned premise suite; LI-03 names its temp-repo instrument and its three ignore conjuncts; LI-06 gains the three-step mutation proof; LI-02 declares path shape and forbids jest globals; LI-14 becomes green-terminal and LI-15 stops claiming to green it; **new LI-23** makes the §T.7 fail-open inventory a suite; LI-21 owns `ruleInputs.thresholds`; AT-15 and AT-22 get split greens; batches 7–13 get a per-batch expected-red ledger; the coverage baseline is measured and DoD 11/12 restated against it; H-8 added; the file-ownership manifest is rewritten one row per (file, owner) so the dispatcher's contract check parses it, and its arithmetic restated |
| 0.3 | 2026-08-20 | Round 2 cross-review (PM F-07, F-08; TE F-01…F-06; PM Q-04, Q-05; TE Q-01, Q-02). LI-01's premise suite drops the change-surface **absence** claims — this PLAN's own tasks falsify all four on schedule — and keeps them as a one-time pre-flight recorded in the completion note; P-2a becomes a set equality over the four authoring call sites, so a fifth site reds at batch 1 (PM Q-04). AT-15 is stated as **four** clauses with E-35's positive direct-path clause greened by LI-16. LI-23's `corpusOutcome` equality is scoped to **non-`null`** observations. The green-terminal gate gains the pre-existing-status conjunct its siblings carry. The porcelain instrument is restated as `-unormal`, untracked files included. `LI-T-SUITEMAP`'s closure is taken over the directory rather than a hardcoded six. LI-23's `→ LI-06` edge gets its own reason. DoD 4's sentence join repaired; P-A-3…P-A-5 added |
