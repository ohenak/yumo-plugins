---
feature: pdlc-decision-ledger
---

# PLAN — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`REQ-pdlc-decision-ledger.md` v1.9 `sha256:ce6b133f…3c7b7c`, `FSPEC-pdlc-decision-ledger.md` v1.3 `sha256:2bd5c3ef…5aed39`, `TSPEC-pdlc-decision-ledger.md` **v0.9** `sha256:eef45ef3…0623c8`, `DECISIONS-pdlc-decision-ledger.md` `sha256:13aba061…4fb89a`) |
| Downstream | PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 0.6 | 2026-08-29 |

Revision history: **v0.6** is a re-grounding pass on upstream movement, not a response to a new
defect in v0.5's bytes: `TSPEC` advanced **v0.8 → v0.9** (approved, `sha256:eef45ef3…0623c8`) after
the v0.5 pass, and v0.9 §7.3 rewrote the census contract T-11 compresses. Three consequences are
landed here. (1) The header `TSPEC` pin is re-derived mechanically (`shasum -a 256`) to v0.9; the
other three pins were re-measured in the same pass and are unchanged. (2) T-11's **scanned-source**
operand moves from "source minus three brace-matched declarations plus the wiring run" — the
hand-picked-three form v0.9 §7.3 diagnoses as red by construction, because `gatherDecisionCorpus`
and §5.2's catalogues then occur in the remainder on conforming code — to the source minus the body
of **every** member of the frozen `DECISION_LEDGER_OWNED_DECLS`, sliced the precedent's way, plus
the sentinel-bounded wiring run. (3) T-11's **companion** assertion moves from set equality against
the module's decision-ledger exports (also red by construction under §7.3) to the partition
`DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`,
the two sub-sets disjoint. Ownership of the two new frozen lists is stated explicitly (they are
test-file constants of T-11's own `decisionLedgerCensus.test.js`, exactly as the precedent's
`ANCHOR_TOKENS` is), and the §Definition of Done census bullet is corrected to the same contract.
The six token members, the `decisionLedger`-is-not-a-token rationale and every batch, dependency
and ownership assignment are unchanged by v0.9. **v0.5** (operator pass) lands the erratum items the v0.4 delta confirmation
found unlanded, per POSTMORTEM-PR: the terminal `102` positive control is now explicitly owned by
T-19 (T-00a's acceptance is one-sided and batch-1-evaluable, with a forward pointer; T-12a's
disclaimer and the §Definition of Done bullet both name T-19); the `DECISIONS` upstream pin is
re-derived mechanically from `shasum -a 256` (`…4fb89a`); the census-exemption citation is
re-pointed from TSPEC §5.5 to §7.3 in T-11 and §Definition of Done; T-11's second census operand
is restored to a full sentence. **v0.4** is a re-grounding pass, not a response to new findings: every item raised
by `CROSS-REVIEW-test-engineer-PLAN-v2.md` (F-01…F-05, Q-01, Q-02) and
`CROSS-REVIEW-product-manager-PLAN-v2.md` (F-01) was already applied at v0.3 and re-verified on disk
before this edit — the corrected T-03 enumeration was **executed** and yields exactly the 25 / 26 the
row claims. What moved is **upstream**: TSPEC advanced **v0.7 → v0.8** after v0.2's base, and its
erratum decided two things this PLAN contradicted. (1) `decisionLedger` is **dropped** from
`DECISION_LEDGER_CENSUS_TOKENS` as an unsatisfiable token — the shipped `learningsInjectionField`
analogue threads its report field through `buildFinalReport`, far outside `main()`, so the name
occurs in T-11's scanned remainder by construction and the census would red for no defect; T-11's
operand list is now the **six** exported names, and the field's obligation is behavioural, discharged
by T-10a's live arm. (2) TSPEC §7.5 promotes two invariants from example to property, `P-REC`
(recognition / last-wins) and `P-LINE` (one physical line per decision); T-05 and T-06 already
carried both as `fast-check` strategies, so they are cited by id and given O-8's mutation discipline
rather than restated. TSPEC v0.8's other three items (§7's coverage-gate narrowing, §7.2's live
composition-root category) were already absorbed at v0.2/v0.3 — they cite this PLAN's T-18 and T-10a,
not the reverse. **v0.3** addresses `CROSS-REVIEW-test-engineer-PLAN-v2.md` F-01…F-05 and
`CROSS-REVIEW-product-manager-PLAN-v2.md` F-01 (the same defect, filed by both): T-03's transcribed
historical enumeration now carries all **four** of `DECISION_CORPUS_ARGV`'s pathspecs and its
integrity guard is stated as set equality against a hand-transcribed 25-path literal; the
delta-coverage gate's *timing* corrected (it is a CI/DoD gate, not a wave gate) with a per-wave
manual run given to T-18; T-00a's positive-control claim corrected to what it proves, with the
namespace count moved to a terminal conjunct in T-12a; blast-radius path count and one GFM-unsafe
pipe fixed. **v0.2** addresses `CROSS-REVIEW-test-engineer-PLAN-v1.md` F-01…F-08 and
`CROSS-REVIEW-product-manager-PLAN-v1.md` F-01…F-05. Three tasks added (`T-00a` census exclusion,
`T-10a` `main()`-driven wiring arm, `T-12a` documentation disclosure oracle); the coverage-gate
claim corrected; the file-ownership manifest re-shaped to one bare task id per row so the
mechanical PLAN lint parses it.

## Overview

**What is being built.** A config-gated *decision ledger*: one line per already-closed decision,
plus adjacent rule text, appended to the review loop's reviewer-dispatch prompt. Off by default;
with the flag off the dispatch stream is byte-identical to the committed merge-base baseline
(REQ-DECLEDGER-02, FSPEC AT-04).

**Where it lands.** All new production symbols go into the single file
`pdlc/workflows/orchestrate-dev.js` (TSPEC D-6 / `DEC-DECLEDGER-08`; the engine's
`pdlc/engine/scripts/prepack.mjs` vendors a frozen `MODULE_NAMES` list at line 20, and REQ NG-6
forbids editing `pdlc/engine/` runtime, so no new `pdlc/workflows/lib/` module is available even
though `lib/` exists and already holds `document-oracles.mjs`, `escalation-view.mjs`,
`loop-session.mjs`). **That one-file constraint is the dominant shape of this PLAN:** every green
task writes the same physical file, so under batch-safety rule 2 the six green tasks are
serialised one-per-batch by real `Deps` edges.

**Blast radius outside `orchestrate-dev.js` (PM F-04).** Two *production-adjacent config/test*
files: the tracked `.claude/pdlc.config.example.json` disclosure (FSPEC Q-3, explicitly preserved by
REQ NG-6) and a new `pdlc/engine/__tests__/decision-ledger-config-example.test.js`. Beyond those:
three documentation files (`pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` — T-19), two
generated/manifest files (`pdlc/workflows/dist/pdlc-cli.mjs`, `pdlc/.claude-plugin/plugin.json` —
T-20), the **existing** `pdlc/workflows/__tests__/documentOracles.test.js` (T-00a's census
exclusion, T-12a's disclosure oracle, un-skipped by T-19), and **fifteen** new test/fixture paths under
`pdlc/workflows/__tests__/` (TE F-04: twelve `decisionLedger*.test.js` modules,
`helpers/decisionLedgerDoubles.js`, and the two fixture trees `fixtures/decision-ledger-baseline/**`
and `fixtures/decision-corpus/**`; the engine module above is the sixteenth new path overall). The
file-ownership manifest below is the complete list; this paragraph is its prose summary and must
agree with it.

**Shipped code this extends, verified at HEAD.**

| Symbol / artefact | Location at HEAD | Role here |
|---|---|---|
| `parseLearningsConfig`, `readLearningsConfigSafely` | `pdlc/workflows/orchestrate-dev.js` (inside the sentinel-bounded `// === LEARNINGS INJECTION REGION START/END ===` block) | `parseDecisionLedgerConfig` clones its shape; the config text is already read **once** and shared with `parsePinCheckConfig` / `parseDerivativeStopConfig` — this feature adds a fourth consumer, not a fourth read |
| `LEARNINGS_CORPUS_ARGV`, `gatherLearningsCorpus`, `selectLearnings`, `renderLearningsBlock`, `buildLearningsInjector` | same module | the corpus/select/render/inject shell `DECISION_CORPUS_ARGV` and friends clone |
| `reviewLoop` (exported), `reviewerPrompt` (module-private, called twice from inside `reviewLoop`) | same module | gain `_injectDecisionLedger` and a trailing `ledgerBlock` parameter, both defaulting to the shipped state (TSPEC §4.5) |
| `runCaptureScript` | `scripts/capture-learnings-baseline.mjs` | the byte-identity capture harness, reused unchanged |
| `loopEconomicsBaselineGuard.test.js` (`EXPECTED_MERGE_BASE_SHA` literal, `git merge-base --is-ancestor` weaker second signal) | `pdlc/workflows/__tests__/` | the guard shape T-02 clones verbatim |
| `loopEconomicsAnchorGuard.test.js` (`ANCHOR_TOKENS`, `bodyOf`) | `pdlc/workflows/__tests__/` | the declaration-anchored source-census precedent T-11 clones |
| `advisoryDisabled.test.js`'s `sourceExcludingParser` / PROP-DIS-06 | `pdlc/workflows/__tests__/` | the brace-matching slicer, and the reason the enablement read must be **destructured**, not dotted (`DEC-DECLEDGER-09`) |
| `loop-config-example.test.js` | `pdlc/engine/__tests__/` | the containment-plus-set-equality disclosure shape; the example file carries exactly eight top-level blocks today (`dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`, `review`, `loop`, `merge`) |

**Every file this PLAN names is either verified to exist at HEAD (the table above, plus
`pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md`, `.claude/pdlc.config.example.json`,
`pdlc/.claude-plugin/plugin.json` at version `0.23.6`, `pdlc/workflows/dist/pdlc-cli.mjs`) or is
declared `[new]` in its task row.** No task names a file that exists under a different path.

**Two RED-terminal batches.** Batches 1–2 create fixtures and failing tests only; the **six
production-file greens** (T-13…T-18, the tasks writing `orchestrate-dev.js`) land in batches 3–8,
and the two remaining greens — T-19 (documentation and config disclosure) and T-20 (landing) — sit
in batches 9 and 10 (PM F-05). Per the wave-gate contract already followed by
`pdlc/engine/__tests__/loop-config-example.test.js`, every `[red]` block is committed **skipped**,
titled with the id of the `[green]` task that un-skips it, and each block is run un-skipped once
first and observed to fail for the stated reason before being skipped. Gate wording for batches
1–2: *new tests are committed skipped with their observed-red reason recorded in the file header,
and the pre-existing suite is green.*

## Batches

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

`[new]` in the Test File / Source File column means the task creates the file; every other path is
verified present at HEAD.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-00 | Pre-flight baseline-symbol gate: assert the eight HEAD symbols this feature builds on are importable from `pdlc/workflows/orchestrate-dev.js` — `parseLearningsConfig`, `readLearningsConfigSafely`, `parsePinCheckConfig`, `parseDerivativeStopConfig`, `LEARNINGS_CORPUS_ARGV`, `gatherLearningsCorpus`, `renderLearningsBlock`, `reviewLoop` — plus `runCaptureScript` from `scripts/capture-learnings-baseline.mjs`. **Existence only**; asserts nothing about the shapes this feature creates. Passes at HEAD. | `pdlc/workflows/__tests__/decisionLedgerPreflight.test.js` `[new]` | — | 1 | — | ⬚ |
| T-00a | **Census exclusion — a batch-1 obligation, not a batch-9 one (TE F-01).** `documentOracles.test.js`'s `*.test.js` census filter pins the count to the literal `102`, excluding only the `learnings`, `waveResume`, `loop` and `escalationView` prefixes; the live directory measures 154 files and exactly 102 after those exclusions, so the literal is **saturated**. Batch 1 alone adds three `decisionLedger*`-prefixed modules (T-00, T-02, T-03) and batch 2 adds nine more, reddening a required check before any production code exists — and the batch-1/2 gate demands the pre-existing suite be green. Add `!name.startsWith("decisionLedger")` to the filter with a comment naming **this PLAN's file-ownership manifest** as the owner of that namespace's census, exactly the treatment `learnings*`, `waveResume*`, `loop*` and `escalationView*` already carry. Acceptance is one-sided and evaluable at batch 1: the exclusion lands and the pre-existing suite is green at `102`. The **terminal** re-check — the filtered count still `102` once all twelve of this PLAN's new modules exist — is **owned by T-19** (batch 9, the first point at which it is evaluable) and credited to T-19 by the `102` positive-control bullet in §Definition of Done. **What that positive control does and does not prove (TE F-03):** it pins the *complement* of the excluded namespace, so it falsifies a mistyped prefix or an exclusion that swallows a neighbouring namespace (either moves the count off `102` and reds) — it does **not** and cannot detect a dropped `decisionLedger*` module, since deleting one leaves the complement at `102`. The namespace's own **set census** (set equality against the twelve names, not a count) is a separate terminal obligation and lives in T-12a, un-skipped by T-19 at batch 9, where all twelve modules exist and it can never red mid-feature. **Not** a re-pin of the literal (`documentOracles.test.js`'s own comment block explains why: a manifest landing one file per wave would red the gate mid-feature at every wave). | `pdlc/workflows/__tests__/documentOracles.test.js` (existing) | `pdlc/workflows/__tests__/documentOracles.test.js` (existing) | 1 | — | ⬚ |
| T-01 | `[Fake first]` Shared sync test doubles: `makeDecisionLedgerSeams(overrides)` returning `{ _git, _readFile, _log }` — `_git` scripted to return `{ ok, stdout }`, to return `{ ok: false }`, or to throw; `_readFile` a scripted `path → string` map with designated paths returning `null` and designated paths throwing (TSPEC §7.1, P-8's lesson that the runtime read throws where the double returns `null`); `_log` a collector array — plus `assertNoLiveGitWrites(calls)` for the mandatory `afterEach` leak check (commit `f325016`). Re-exports the fixture loaders T-02/T-03 create. | `pdlc/workflows/__tests__/helpers/decisionLedgerDoubles.js` `[new]` | — | 1 | — | ⬚ |
| T-02 | Capture the **pre-feature byte-identity baseline** from the merge-base worktree via the shipped `runCaptureScript`, case `REVIEW-LOOP-REVIEWER-PROMPTS` driving exported `reviewLoop` and recording the reviewer-prompt stream for a first-pass round and a delta re-review round (TSPEC §7.4, deliberately narrow — a whole-`main()` recording would red on this feature's own intended additions). Author the guard: per-file digest literals **hand-transcribed**, `mergeBaseSha` asserted `=== EXPECTED_MERGE_BASE_SHA` (a hand-transcribed literal, never read from the manifest it checks), `git merge-base --is-ancestor {recorded sha} HEAD` kept only as the documented weaker second signal, case ids by **set equality**. `scenarios.mjs` sits inside the fixture directory (jest's `testPathIgnorePatterns` already excludes `/__tests__/fixtures/`). Three-step mutation proof (flip a recorded byte; delete a case dir; add a spurious case dir), each observed red transcribed into the file header. No red predecessor by construction. | `pdlc/workflows/__tests__/decisionLedgerBaselineGuard.test.js` `[new]` + `pdlc/workflows/__tests__/fixtures/decision-ledger-baseline/{scenarios.mjs,MANIFEST.json,REVIEW-LOOP-REVIEWER-PROMPTS/**}` `[new]` | — | 1 | — | ⬚ |
| T-03 | Create the **frozen decision-corpus fixture**: a path-preserving copy of the **25** in-scope `DECISIONS-*.md` files at Baseline v1.2's `Verified at` commit `8c673a09f` (count verified — and **note the command that does not run**, PM F-01: `git ls-tree` rejects `:(glob)` pathspec magic outright (`fatal: … pathspec magic not supported by this command: 'glob'`), so `DECISION_CORPUS_ARGV`'s own pathspecs cannot be handed to it. The reproducible historical enumeration is `git ls-tree -r --name-only 8c673a09f \| grep -E '^(docs/_decisions/DECISIONS-[^/]*\.md\|docs/[^/]+/DECISIONS-[^/]*\.md\|docs/completed/[^/]+/DECISIONS-[^/]*\.md\|docs/discarded/[^/]+/DECISIONS-[^/]*\.md)$'` — **four** alternatives, one per `DECISION_CORPUS_ARGV` pathspec (TSPEC §3.1); a three-alternative form dropping `docs/discarded/` yields 24 and is wrong (TE F-01 / PM F-01). Measured: this command yields **25** at `8c673a09f`, and the same filter over `git ls-files` yields **26** live. Both deltas are named, so neither number is a bare assertion: 24→25 is `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md` (present at `8c673a09f`, carrying the four `DEC-BUD-*` ids `M-2b` attributes to `pdlc-rcv-budget-stop`), and 25→26 is `DECISIONS-pdlc-decision-ledger.md`, which landed after the Baseline commit — exactly why the copy is frozen. `DECISION_CORPUS_ARGV`'s `:(glob)` form is for `git ls-files` at runtime; T-03 records this reconciliation in its file header as prose *and* discharges it mechanically through the integrity guard below). Addressed only through the `_git` / `_readFile` doubles — no test touches the working tree. Integrity guard, both conjuncts falsifiable and neither derived from the fixture: per-file digest literals hand-transcribed into the test, never recomputed from a manifest; and **set equality between the fixture's path list and a 25-element literal path array transcribed by hand into the test file** — set equality, not a count, and not a list generated at fixture-build time (TE Q-01), so a fixture built from a 24-path enumeration fails at batch 1 on the missing path itself rather than surfacing as an unexplained T-09 red. | `pdlc/workflows/__tests__/decisionLedgerFixtureGuard.test.js` `[new]` + `pdlc/workflows/__tests__/fixtures/decision-corpus/**` `[new]` | — | 1 | — | ⬚ |
| T-12 | `[red]` Engine-side config disclosure (FSPEC Q-3, TSPEC §5.3): `.claude/pdlc.config.example.json` parses; its top-level section set **contains** `decisionLedger` (containment — the file is shared with the eight blocks listed in §Overview); `decisionLedger`'s own key→value map by **set equality** against a hand-transcribed literal of C-5's three keys and defaults (`enabled: false`, `maxEntries: 70`, `maxBytes: 12500`), so a fourth key or a different spelling fails. Transcribed, not imported from `DECISION_LEDGER_DEFAULTS` — `loop-config-example.test.js`'s stated reason. Committed `test.skip`, blocks titled `T-19: …`. Runs under `node:test` on the `Engine tests (ubuntu-latest)` check. | `pdlc/engine/__tests__/decision-ledger-config-example.test.js` `[new]` | — | 1 | — | ⬚ |
| T-12a | `[red]` **Documentation disclosure oracle — the red predecessor T-19's prose half never had (TE F-04, PM F-03).** Three of T-19's four deliverables (`pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md`) currently have no falsifying assertion anywhere in this PLAN: an implementer writing one sentence and one writing the full mechanics both pass. Add a `decisionLedger` disclosure family to `documentOracles.test.js` on the shape the shipped advisory-disclosure family already establishes (`documentOracles.test.js` ~:579–625 derives its count words from `ADVISORY_SEAMS` / `ADVISORY_DEFAULTS` rather than restating them). Assertions, all **derived from the production constants, never transcribed**, and all **set equality** so a deleted item fails: `pdlc/OPERATIONS.md`'s ledger omission-reason list set-equals `DECISION_LEDGER_OMIT_REASONS`; its notice-id list set-equals the keys of `DECISION_LEDGER_NOTICES`; its config-key list set-equals the keys of `DECISION_LEDGER_DEFAULTS`. Plus a **referent** conjunct in `pdlc/README.md` and `CLAUDE.md`: each names `decisionLedger` and defers to `pdlc/OPERATIONS.md` as the catalogue, and **carries no key-by-key restatement** — deliberately preserving the ~:625 confinement discipline that keeps mechanics prose in OPERATIONS.md only (TE F-06). **Plus the terminal namespace census (TE F-03):** one conjunct asserting the set of `pdlc/workflows/__tests__/decisionLedger*.test.js` module names is **set-equal** to the twelve names hand-transcribed from this PLAN's file-ownership manifest. It is a set, not a count — the terminal `102` *count* assertion is **T-19's obligation**, not this task's; it lives here rather than in T-00a because it is only satisfiable once batch 2's modules exist, and un-skipping at batch 9 keeps it from reddening the wave gate mid-feature — the same reasoning `documentOracles.test.js`'s own comment block gives for not re-pinning the `102` literal. Committed skipped, blocks titled `T-19: …`. | `pdlc/workflows/__tests__/documentOracles.test.js` (existing) | — | 2 | T-00, T-00a | ⬚ |
| T-04 | `[red]` `parseDecisionLedgerConfig` pure matrix: each of C-3's three keys × {valid, wrong-typed, absent} with the other two valid, plus the block-level malformation case, asserted as **set equality** over C-3's enumeration (AT-11); `text === null`, non-JSON text, absent block ⇒ defaults and **no** notice (F-1…F-3); non-object block ⇒ `sectionMalformed` + `NTC-DECLEDGER-MALFORMED` (F-4); one wrong-typed key ⇒ that key only defaults, `invalidKeys` names it, `NTC-DECLEDGER-KEYTYPE` (F-5); `nonNegativeInt` accepts `0` on **both** thresholds (E-7, `DEC-DECLEDGER-15`); block independence (a malformed `decisionLedger` leaves `learningsInjection` / `cascade` / `review` at their values); a `fast-check` totality property over arbitrary JSON. Committed skipped, blocks titled `T-13: …`. | `pdlc/workflows/__tests__/decisionLedgerConfig.test.js` `[new]` | — | 2 | T-00, T-01 | ⬚ |
| T-05 | `[red]` `recogniseDecisionRecords` over TSPEC §3.2's five conjuncts, each with its cited Baseline instance: `##`–`####` heading levels; the **optional ordinal prefix** (`## 2. DEC-EDIST-01: …` — without it two directories contribute 0 instead of 10 and 8, and the feature-level total is 82 not `M-2e`'s 100); the namespace-plus-numeric id grammar (excludes `M-4b`'s twelve `DEC-01`…`DEC-10` and `M-4a`'s `DEC-AWG-Q1`); id-opens-the-heading (excludes `M-4d`'s four mid-heading back-references); separator `:` or `—` followed by a **non-empty** statement. Plus §3.3 last-record-wins over a two-opening block, and `null`/empty/no-record text ⇒ `[]` as an ordinary empty result (BR-8, F-9). **Two `fast-check` properties — TSPEC §7.5's `P-REC`, promoted from example to property at TSPEC v0.8 (originally TE F-07; a parser is the archetypal property target and §3.2/§3.3 already state its invariants in quantified form):** (i) over a generated heading line assembled from independently-varied conjunct components (level, ordinal prefix present/absent, id grammar well-/ill-formed, id-opens/mid-heading, separator `:`/`—`/absent, statement empty/non-empty), the recogniser accepts **iff all five conjuncts hold** — this falsifies a conjunct silently dropped or reordered, which no fixed example set can; (ii) over arbitrary file text built from a generated multiset of openings, `recogniseDecisionRecords` returns **at most one record per id** and that record is the **last** opening in the file — §3.3's last-record-wins as a law, not one two-opening example. Also total: never throws on arbitrary input. **`P-REC` carries O-8's discipline (TSPEC §7.5):** the expectation comes from an **independent model**, never the production recogniser, and **four** named falsifying mutations are each applied, observed red, reverted, and the observed failure transcribed into this file's header — admit an out-of-depth heading; admit an empty-statement heading; normalise or trim the statement instead of slicing it verbatim; resolve duplicates first-wins instead of last-wins. Committed skipped, blocks titled `T-14: …`. | `pdlc/workflows/__tests__/decisionLedgerRecognise.test.js` `[new]` | — | 2 | T-00, T-01 | ⬚ |
| T-06 | `[red]` `renderDecisionLedgerBlock` and the frozen text constants: exact-`""` for empty `selected` — no header, no preamble, no rule text, no trailer, no whitespace (BR-1, E-6); the `{id} — {statement}  [{sourcePath} § {id}]` line form (`DEC-DECLEDGER-10`); one physical line per decision; project-level lines before feature-level. Rule text: both BR-5 conjuncts stated as a conjunction (AT-06); both BR-6 exemplars, **each labelled with the side it falls on** (AT-07); decide against the **cited record**, not the index line; key a repeat on the decision id (AT-12's text half). **Framing pin (`DEC-DECLEDGER-12`, D-9):** header + preamble + rule text + trailer + separating blank lines render to **≤ 1,200 bytes**, asserted against that literal — an acceptance condition on the drafting task, not a measurement of drafted text. **One `fast-check` property — TSPEC §7.5's `P-LINE`, promoted from example to property at TSPEC v0.8 (originally TE F-07):** for any non-empty `selected` set — statements generated to include embedded `\n`, `\r\n`, pipe and backtick characters — the rendered block contains exactly `selected.length` index lines, each matching the `{id} — {statement}  [{sourcePath} § {id}]` grammar, and the block's total line count equals framing lines + `selected.length`. **One physical line per decision stated as a law is load-bearing arithmetic, not tidiness:** a statement carrying a newline would silently render two lines, desynchronising T-07's `≤ maxEntries` line count and every hand-transcribed byte literal in T-09. No named example generates one. The renderer's contract for such a statement (escape or reject) is fixed here and cited by T-16. **`P-LINE` carries O-8's discipline (TSPEC §7.5):** independent model, never the production renderer, and **three** named falsifying mutations each applied, observed red, reverted, and transcribed into this file's header — render a statement containing `\n` unescaped; join two records onto one line; emit the set in an order other than §3.6's. Committed skipped, blocks titled `T-15: …`. | `pdlc/workflows/__tests__/decisionLedgerRender.test.js` `[new]` | — | 2 | T-00, T-01 | ⬚ |
| T-07 | `[red]` Bounds. (a) O-8's property (`fast-check`), quantified over set size × line sizes × both bounds, with the bounds range spanning `0`, exactly-fitting and generous: the block is exactly `""` or satisfies ≤ `maxEntries` lines, ≤ `maxBytes` bytes, every line byte-identical to the unbounded line, and the rendered set is a **prefix under §3.6's omission order**. The model carries its **own** formatter transcribed from §4.3, never the production renderer (`DEC-DECLEDGER-11`). Four named mutations, each applied, observed red and reverted, transcribed into the file header: `>` for `≥` on the line count; framing not charged; truncate-instead-of-drop; drop from the front. (b) Example anchors AT-13 (a set exceeding `maxEntries`, separately one exceeding `maxBytes`) and AT-15 (one oversized line dropped whole, no fragment, remaining lines render). Committed skipped, blocks titled `T-16: …`. | `pdlc/workflows/__tests__/decisionLedgerBounds.test.js` `[new]` | — | 2 | T-00, T-01 | ⬚ |
| T-08 | `[red]` IO shell and fail-open, all through T-01's doubles: `_git` returning `!ok` **and** `_git` throwing both reach `{unlistable: true}` ⇒ `RSN-UNLISTABLE` ⇒ total leg (F-6, AT-08); zero paths ⇒ `RSN-EMPTY` (F-7); one path whose `_readFile` returns `null` and one that throws each degrade **that entry only** to `readOk: false` while every other source renders (F-8, AT-09's whole-source arm); a source that reads and parses to zero records lands in `emptySources`, **not** `failedSources` (F-9, F-10, AT-10 + O-7's classification conjunct); nothing surviving ⇒ block `""`, same bytes as F-6/F-7; no directory for the feature, and a directory yielding zero records, both resolve to the project-level set alone (F-14, Q-2). **AT-03 freshness:** the scripted `_readFile` returns one text on the first call for a path and a mutated text on the second — the fixture copy is never written (`DEC-DECLEDGER-14`, D-11) — and the second dispatch reflects the change; a snapshot fails. `_log` receives one line per dispatch in production, not only under doubles. Committed skipped, blocks titled `T-17: …`. | `pdlc/workflows/__tests__/decisionLedgerInjector.test.js` `[new]` | — | 2 | T-00, T-01, T-03 | ⬚ |
| T-09 | `[red]` Corpus oracle over T-03's frozen fixture. (a) **AT-01**: two dispatches differing only in the feature under review — `pdlc-advisory-wave-gate` (45 lines) and `pdlc-engineering-loop` (48) — compared as **whole rendered lines**, expected statements and citations hand-transcribed from the fixture's own heading text, never captured from the renderer; `M-4d`'s 8 non-record headings contribute no line, each of `DEC-LOOP-01`…`06` renders once carrying the **second, deciding** opening (`M-3c`); a build rendering all 100 feature-level ids fails. Bounds supplied **explicitly non-binding**, with the reason in the file header (TSPEC §7.6). (b) **AT-02**: parse `sourcePath` and `id` **out of the rendered line's citation field**, re-open the fixture path through the `_readFile` double, find the heading whose captured id equals the parsed id, assert its captured statement equals the rendered statement — **no field of `DecisionRecord` is read anywhere in the chain**. (c) **AT-18**: a synthetic two-file corpus recording one id in both a project-level and a feature-level file — exactly one line carries that id, **and** its statement, `sourcePath` and `origin` are the **project-level** record's (each transcribed from the fixture), with the feature-level statement absent from the whole block (§3.4's positive conjunct; cardinality alone passes under the rejected rule). (d) **`DEC-DECLEDGER-13` shipped-default assertions**, both at `maxEntries: 70`, `maxBytes: 12500`: over the **whole** 141-record fixture — rendered project-level ids set-equal to the transcribed 41, their lines joined by `\n` equal to the transcribed **6,305** bytes, `6,305 ≤ maxBytes − 1200`, and the non-empty `omitted[]` naming **no** project-level id; and over the **`M-6b` slice** (41 project-level + `pdlc-headless-engine`'s 22 = 63) — `omitted[]` **empty**, rendered id set equal to the transcribed 63, index lines equal to the transcribed **10,859** bytes, and `10,859 ≤ maxBytes − 1200` (i.e. `≤ 11,300`, the 441-byte margin). All four literals hand-transcribed from the fixture; the 12,059-byte block total is deliberately **not** asserted as an equality (`DEC-DECLEDGER-16`). Committed skipped, blocks titled `T-17: …`. | `pdlc/workflows/__tests__/decisionLedgerCorpus.test.js` `[new]` | — | 2 | T-01, T-03 | ⬚ |
| T-10 | `[red]` Loop integration and driver invariance, against T-02's committed recording. **AT-05**: four not-enabled spellings supplied as four distinct `learningsConfigText` values — absent block, `enabled` absent, `enabled` wrong-typed, malformed section — each run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, each yielding `null` and hence the identical `""` block and the baseline-identical stream (the arm must **consume** the config text it varies). **AT-14**: zero-decision in-scope set, `maxEntries` `0`, `maxBytes` `0` — all three byte-identical to the baseline, pinning that there is no header without rows and **no rule text standing alone** above a missing index. Enabled path: the block is appended **last**, after `oraclePart` and `findingGrammarPart`, on both the iteration-1 and iteration-≥2 return paths of `reviewerPrompt`, and both reviewers of a round receive the identical block (§2.6). **AT-16**: one recorded fixture of reviewer outputs replayed with the flag `true` and `false` — convergence, the identity-triple dedupe and resulting open-finding ledger, the `review.derivativeStop` flat/non-flat classification, the `DEC-ERRROUTE-01` erratum mint and the fail-closed confirmation-presence read all identical, with the open-finding ledger additionally **anchored to a value transcribed from the fixture**; the dispatch leg differs in exactly one asserted way. **AT-17**: a High finding re-opening an indexed decision is scored, deduped and routed as any other High. **AT-12**'s driver half: `DEC-LOOPECON-06`'s exact-match triple remains the sole dedupe key. Committed skipped, blocks titled `T-18: …`. | `pdlc/workflows/__tests__/decisionLedgerLoop.test.js` `[new]` | — | 2 | T-01, T-02 | ⬚ |
| T-10a | `[red]` **`main()`-driven wiring arm — the one live execution of the composition root (TE F-03, DC-07).** T-18's assembly (config → injector → `wrapperSeams._injectDecisionLedger` → awaited seam → `reviewerPrompt`) is otherwise proved by T-11's source census alone, and a census proves a string is present, never that a line runs: a transposed argument, a seam installed under the wrong key, an un-`await`ed injector, or a wiring block placed after the last `reviewerPrompt` call would leave every other task green. Drive the default export `main()` (`import mainDev, * as dev from "../orchestrate-dev.js"`, the shape `advisoryDisabled.test.js`, `advisoryWaveGateMain.test.js`, `anchorCascade.test.js`, `branchGuard.test.js` and ~20 further modules already use; `advisoryWaveGateMain.test.js` exists for precisely this reason). Three arms: (1) **flag on** with scripted `_readFile`/`_git` — a call-count spy asserts `gatherDecisionCorpus`'s `_git` seam is invoked **≥ 1** on the served reviewer flow, the conjunct a fake of the outer interface cannot satisfy; (2) **flag on, positive presence** — the reviewer prompt actually handed to a reviewer dispatch **ends with** the rendered ledger block, not merely "differs from baseline"; (3) **flag off, three positive conjuncts** — the reviewer prompt is byte-identical to **T-02's committed merge-base recording**, not to a string computed by subtracting the block from the flag-on prompt (TE Q-02: the subtraction form would define the flag-off prompt by the code under test, an implementation echo; the committed recording is the independent referent REQ-DECLEDGER-02 / AT-04 actually name), `report`'s key set is **set-equal** to the flag-off key set (so `"decisionLedger" not in report` is paired with a positive that a spuriously-added key fails), and `notices` is **set-equal** to the baseline notices array, not merely free of `NTC-DECLEDGER-*` (TE F-05). This is the home file for T-18's `report.decisionLedger` assertion, which had none. Does **not** disturb TSPEC §7.4: the narrow `reviewLoop` recording and this live execution are different obligations, and §7.4 forbids only the former being whole-`main()`. `assertNoLiveGitWrites` in `afterEach`. Committed skipped, blocks titled `T-18: …`. | `pdlc/workflows/__tests__/decisionLedgerMain.test.js` `[new]` | — | 2 | T-01, T-02, T-03 | ⬚ |
| T-11 | `[red]` Source census for BR-11 / REQ NG-4 (TSPEC §7.3), cloning `loopEconomicsAnchorGuard.test.js`'s `ANCHOR_TOKENS` / `bodyOf` declaration-anchored slicing. Operands: the frozen `DECISION_LEDGER_CENSUS_TOKENS` — **six** members, the *distinctive, unambiguous exported names* this feature introduces (`selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`) — held to **set equality** against the module's exported decision-ledger symbol names so a later symbol cannot escape by omission. **`decisionLedger` is deliberately not a member (TSPEC v0.8 §7.3, which grounds it in §5.4):** the report field is threaded through `buildFinalReport` exactly as the shipped `learningsInjectionField` analogue is, at sites far outside `main()`'s sentinel-bounded region, so the bare name occurs in the scanned remainder **by construction** — including it would red this census for a conforming implementation. Carving `buildFinalReport` out of the scan is the rejected alternative (it would blind a far larger surface than the token buys); and since `decisionLedger` is not an exported symbol, dropping it is also what keeps the companion set-equality exact rather than approximate. The field's obligation is **behavioural, not census**: T-10a asserts `report.decisionLedger` on a real `main()`-driven run, and the flag-off arm pairs its absence with a set-equality on the report's key set. The census's second operand: `orchestrate-dev.js`'s source **minus** four owned regions — three sliced by brace-matching from their declarations (`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, and the `selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock` group) and the `main()` wiring run bounded by the literal `// === DECISION LEDGER WIRING START ===` / `... END ===` sentinels. **Each slice asserted non-empty before counting**, so the census cannot go vacuous. Assertion: zero occurrences of any member in the scanned remainder. Also pins that this feature's sentinels are **not** the learnings region's, so PROP-DIS-06's slicer does not see them (TSPEC §2.3). Committed skipped, blocks titled `T-18: …`. | `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` `[new]` | — | 2 | T-00, T-01 | ⬚ |
| T-13 | `[green]` Config layer: `DECISION_LEDGER_DEFAULTS` (`enabled: false`, `maxEntries: 70`, `maxBytes: 12500`), `parseDecisionLedgerConfig` as a one-level descent cloning `parseLearningsConfig` (`degraded(sectionMalformed)` closure, `text == null` / `JSON.parse` / missing-block short-circuits, `boolField` + `nonNegativeInt`), and the frozen `DECISION_LEDGER_NOTICES` (`NTC-DECLEDGER-MALFORMED`, `NTC-DECLEDGER-KEYTYPE`) with its set-equality test. Threaded off the **single existing** `readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)` read in `main()` — no second read, no second path constant. Un-skips T-04. | `pdlc/workflows/__tests__/decisionLedgerConfig.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | T-02, T-04 | ⬚ |
| T-14 | `[green]` Recognition: the frozen `DECISION_CORPUS_ARGV` (four `:(glob)` pathspecs) and `DECISION_HEADING_RE`, plus `recogniseDecisionRecords(text, sourcePath)` returning `DecisionRecord[]` with §3.3's last-record-wins in-file resolution. Pure, total, never throws, never reads. Un-skips T-05. | `pdlc/workflows/__tests__/decisionLedgerRecognise.test.js` | `pdlc/workflows/orchestrate-dev.js` | 4 | T-05, T-13 | ⬚ |
| T-15 | `[green]` Rendering: `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` (**drafted to fit T-06's ≤1,200-byte framing budget — an acceptance condition of this task, not a hope**; exceeding it re-opens §3.6's arithmetic rather than raising the literal) and `renderDecisionLedgerBlock({ selected })` with its exact-`""` contract. Un-skips T-06. | `pdlc/workflows/__tests__/decisionLedgerRender.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | T-06, T-14 | ⬚ |
| T-16 | `[green]` Selection and bounds: `selectDecisions({entries, feature, thresholds})` — origin partition per §3.1, §3.4 project-level-wins precedence keyed on **origin never on path order**, then §3.6's drop loop (feature-level before project-level; within an origin, reverse enumeration order; whole lines only, never truncated, never aborted). `renderedBytes` is obtained by **calling `renderDecisionLedgerBlock`** on the candidate set at each step (`DEC-DECLEDGER-11`) — `selectDecisions` never concatenates a line itself. Framing **is** charged to `maxBytes` (`DEC-DECLEDGER-07`). Returns `omitted[]` with the frozen `DECISION_LEDGER_OMIT_REASONS`, plus the **separate** `failedSources` / `emptySources` fields O-7 requires. Un-skips T-07. | `pdlc/workflows/__tests__/decisionLedgerBounds.test.js` | `pdlc/workflows/orchestrate-dev.js` | 6 | T-07, T-15 | ⬚ |
| T-17 | `[green]` IO shell and injector: `gatherDecisionCorpus({feature, _git, _readFile})` — one `_git` call on `DECISION_CORPUS_ARGV`, then one `_readFile` per path **inside its own `try/catch`**, never throwing, an outer catch yielding `{unlistable: true}`; the frozen `DECISION_LEDGER_CORPUS_OUTCOMES`; and `buildDecisionLedgerInjector` returning **`null` iff the flag is not `true`**, otherwise an async closure that re-gathers, selects, renders and pushes one `DecisionLedgerDispatchRecord` onto the sink on **every** call (no memoisation, no snapshot). Un-skips T-08 and T-09. | `pdlc/workflows/__tests__/decisionLedgerInjector.test.js`, `pdlc/workflows/__tests__/decisionLedgerCorpus.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | T-08, T-09, T-16 | ⬚ |
| T-18 | `[green]` Wiring: in `main()`, between the literal `// === DECISION LEDGER WIRING START ===` / `... END ===` sentinels, read the flag by **destructuring** (`const { enabled: decisionLedgerEnabled } = decisionLedgerConfig` — a dotted `.enabled` read reddens PROP-DIS-06, `DEC-DECLEDGER-09`), build the injector, set `wrapperSeams._injectDecisionLedger`, and set `report.decisionLedger` **only when the injector is non-null** (conditional spread, the shipped `learningsInjectionField` discipline). Add `_injectDecisionLedger = null` to `reviewLoop` and the trailing `ledgerBlock = ""` parameter to `reviewerPrompt`; per round, `const ledgerBlock = typeof _injectDecisionLedger === "function" ? await _injectDecisionLedger({ feature }) : ""` **awaited** immediately before the two `reviewerPrompt` calls, appended last as `ledgerBlock ? "\n" + ledgerBlock : ""` on both return paths. Add `DECISION_LEDGER_CENSUS_TOKENS`. **Delta-coverage ownership (TE F-02):** these wiring lines are the ones structurally at risk under `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` — despite its name it is not wave-resume-specific, its `SUBJECT` is hard-coded to `pdlc/workflows/orchestrate-dev.js`, its `resolveBase()` prefers the live `merge-base HEAD origin/main` (this feature's own merge base), and it fails on **any** uncovered line inside the post-image hunk ranges T-13…T-18 introduce. T-10a's `main()`-driven arm is what executes these lines; T-17's per-path `try/catch` arms are the second risk site. This task's acceptance includes `node pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` reporting **0 uncovered lines** in this feature's introduced ranges. **Per-wave manual run (TE F-02):** the wave gate's `implementation.testCommand` is plain `npm test` and does **not** include this script, so it would otherwise first fire at PR CI, batch-8-era. T-18 therefore owns an explicit instruction to the implementer of **each** of batches 3–8: commit that batch's `orchestrate-dev.js` edit, then run the script by hand before the wave closes. **Commit, then run:** the script only *warns* when `orchestrate-dev.js` has uncommitted changes, because its ranges are HEAD line numbers while c8 measured the working tree — an implementer running it mid-edit gets an offset result, not a failure. Un-skips T-10, T-10a and T-11. | `pdlc/workflows/__tests__/decisionLedgerLoop.test.js`, `pdlc/workflows/__tests__/decisionLedgerMain.test.js`, `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | T-10, T-10a, T-11, T-17 | ⬚ |
| T-19 | `[green]` Disclosure and documentation: add `"decisionLedger": {"enabled": false, "maxEntries": 70, "maxBytes": 12500}` to `.claude/pdlc.config.example.json`; document the block and the ledger's mechanics in `pdlc/OPERATIONS.md`'s review-loop-mechanics section (recognition rule, the two bounds and the omission order, the two fail-open legs, the notices ids); add a one-line pointer in `pdlc/README.md` and `CLAUDE.md`'s deep-dive paragraph so the config catalogue is not stale (the `pdlc-loop-economics` F-6 lesson). **No SKILL.md edits** (REQ NG-6, `DEC-DECLEDGER-05` — the wiring is dispatch construction). **The prose is written to satisfy T-12a's derived oracle**, not to a word count: OPERATIONS.md carries the omission reasons, notice ids and config keys in enumerable form; README.md and CLAUDE.md carry a **pointer**, not a restatement of the mechanics — a README that enumerates them trips the same confinement discipline `documentOracles.test.js` ~:625 already applies to the advisory family (TE F-06). **Re-pinning budget, named at authoring time rather than discovered at batch 9 (TE F-06):** these three documents are already load-bearing inputs to shipped oracles — `documentOracles.test.js` D-1 over `CLAUDE.md`'s "Workflow scripts and the runtime build" section, D-3 over `pdlc/README.md`, the ~:625 confinement assertion; and on the engine side `pdlc/engine/__tests__/ci-arrangement.test.js` (derives `CLAUDE.md`'s required-check table from FSPEC §5.1) and `docs-uniqueness.test.js` (install-command literals and line-pinned plugin-install sites, the recurring wave-halt trap in this project's learnings). Acceptance includes re-running all three suites after the edits and re-pinning any line-anchored site the insertion moved. **Terminal `102` positive control (T-00a's deferred conjunct, owned here):** with all twelve `decisionLedger*` modules on disk, `documentOracles.test.js`'s `*.test.js` census still counts `102` — the exclusion's complement pin, first evaluable at this batch, credited to this task by the §Definition of Done bullet. Un-skips T-12 and T-12a. | `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, `pdlc/workflows/__tests__/documentOracles.test.js` | `.claude/pdlc.config.example.json`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` | 9 | T-12, T-12a, T-18 | ⬚ |
| T-20 | Landing: run `node pdlc/workflows/build-runtime.mjs`, confirm `--check` is clean, stage `pdlc/workflows/dist/` in the same commit; bump `pdlc/.claude-plugin/plugin.json` `version` from `0.23.6` **to `0.23.7`** — a patch bump, and the target is **constrained, not free** (PM F-02): `pdlc/engine/package.json` declares `"pdlcPluginCompat": "^0.23.0"`, and `documentOracles.test.js`'s post-sweep AT-1.6 / DEC-09 handshake check asserts the shipped plugin version is bumped past the post-sweep baseline **and** satisfies that range. A `0.24.0` bump therefore reds batch 10 — the last task, after all six serialised production batches have landed. The constraint travels with the task so it is not rediscovered there. Re-run `npm run test:coverage` in `pdlc/workflows` (all four clauses, including the delta-coverage gate) and `npm test` in `pdlc/engine`. | — | `pdlc/workflows/dist/pdlc-cli.mjs` (generated — never hand-edited), `pdlc/.claude-plugin/plugin.json` | 10 | T-19 | ⬚ |

### Batch column re-derivation

Mechanically, `batch == max(batch of deps) + 1`, sources = batch 1:

T-00, T-00a, T-01, T-02, T-03, T-12 have no deps ⇒ **1**. T-04, T-05, T-06, T-07, T-11 on T-00(1),
T-01(1) ⇒ **2**; T-08 on T-00(1), T-01(1), T-03(1) ⇒ **2**; T-09 on T-01(1), T-03(1) ⇒ **2**; T-10
on T-01(1), T-02(1) ⇒ **2**; T-10a on T-01(1), T-02(1), T-03(1) ⇒ **2**; T-12a on T-00(1),
T-00a(1) ⇒ **2**. T-13 on T-02(1), T-04(2) ⇒ **3**. T-14 on T-05(2), T-13(3) ⇒ **4**.
T-15 on T-06(2), T-14(4) ⇒ **5**. T-16 on T-07(2), T-15(5) ⇒ **6**. T-17 on T-08(2), T-09(2),
T-16(6) ⇒ **7**. T-18 on T-10(2), T-10a(2), T-11(2), T-17(7) ⇒ **8**. T-19 on T-12(1), T-12a(2),
T-18(8) ⇒ **9**. T-20 on T-19(9) ⇒ **10**.

The three v0.2 tasks change no other row's batch: T-00a is a source, and T-10a and T-12a sit in
batch 2 under greens (T-18, T-19) that already sat above batch 2.

The dependency graph is acyclic: every edge points from a lower-numbered batch to a higher one, and
batch numbers strictly increase along every edge by construction of the rule above.

### Per-phase file-ownership manifest

**Row shape is a machine contract, not a style choice.** The engine's `parsePlanOwnership` reads
the owner cell **whole** — it does not split a list or strip a trailing parenthetical — so a cell
reading `T-02 (batch 1)` or `T-13, T-14, …` parses as a task id that no task table contains, and
the task it meant to name reads as unowned. Every row therefore carries **exactly one bare task
id**; a file with several owners gets several rows; the batch travels in its own column, which the
parser ignores by design.

| File | Owning task | Batch |
|---|---|---|
| `pdlc/workflows/__tests__/decisionLedgerPreflight.test.js` | T-00 | 1 |
| `pdlc/workflows/__tests__/documentOracles.test.js` | T-00a | 1 (census exclusion) |
| `pdlc/workflows/__tests__/helpers/decisionLedgerDoubles.js` | T-01 | 1 |
| `pdlc/workflows/__tests__/decisionLedgerBaselineGuard.test.js` | T-02 | 1 |
| `pdlc/workflows/__tests__/fixtures/decision-ledger-baseline/**` | T-02 | 1 |
| `pdlc/workflows/__tests__/decisionLedgerFixtureGuard.test.js` | T-03 | 1 |
| `pdlc/workflows/__tests__/fixtures/decision-corpus/**` | T-03 | 1 |
| `pdlc/engine/__tests__/decision-ledger-config-example.test.js` | T-12 | 1 |
| `pdlc/workflows/__tests__/decisionLedgerConfig.test.js` | T-04 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerRecognise.test.js` | T-05 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerRender.test.js` | T-06 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerBounds.test.js` | T-07 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerInjector.test.js` | T-08 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerCorpus.test.js` | T-09 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerLoop.test.js` | T-10 | 2 |
| `pdlc/workflows/__tests__/decisionLedgerMain.test.js` | T-10a | 2 |
| `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` | T-11 | 2 |
| `pdlc/workflows/__tests__/documentOracles.test.js` | T-12a | 2 (disclosure oracle, skipped) |
| `pdlc/workflows/orchestrate-dev.js` | T-13 | 3 |
| `pdlc/workflows/__tests__/decisionLedgerConfig.test.js` | T-13 | 3 (un-skip) |
| `pdlc/workflows/orchestrate-dev.js` | T-14 | 4 |
| `pdlc/workflows/__tests__/decisionLedgerRecognise.test.js` | T-14 | 4 (un-skip) |
| `pdlc/workflows/orchestrate-dev.js` | T-15 | 5 |
| `pdlc/workflows/__tests__/decisionLedgerRender.test.js` | T-15 | 5 (un-skip) |
| `pdlc/workflows/orchestrate-dev.js` | T-16 | 6 |
| `pdlc/workflows/__tests__/decisionLedgerBounds.test.js` | T-16 | 6 (un-skip) |
| `pdlc/workflows/orchestrate-dev.js` | T-17 | 7 |
| `pdlc/workflows/__tests__/decisionLedgerInjector.test.js` `pdlc/workflows/__tests__/decisionLedgerCorpus.test.js` | T-17 | 7 (un-skip) |
| `pdlc/workflows/orchestrate-dev.js` | T-18 | 8 |
| `pdlc/workflows/__tests__/decisionLedgerLoop.test.js` `pdlc/workflows/__tests__/decisionLedgerMain.test.js` `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` | T-18 | 8 (un-skip) |
| `.claude/pdlc.config.example.json` | T-19 | 9 |
| `pdlc/OPERATIONS.md` `pdlc/README.md` `CLAUDE.md` | T-19 | 9 |
| `pdlc/engine/__tests__/decision-ledger-config-example.test.js` `pdlc/workflows/__tests__/documentOracles.test.js` | T-19 | 9 (un-skip; also the terminal `102` positive control) |
| `pdlc/workflows/dist/pdlc-cli.mjs` | T-20 | 10 (generated — never hand-edited) |
| `pdlc/.claude-plugin/plugin.json` | T-20 | 10 |

**Disjointness premise, batch by batch.** Batch 1 writes six pairwise-disjoint file sets — T-00,
T-01, T-02, T-03, T-12 on their own new paths, plus T-00a on the **existing**
`documentOracles.test.js`, which no other batch-1 task touches. Batch 2 writes nine distinct new
test files (T-04…T-11 plus T-10a's `decisionLedgerMain.test.js`) and T-12a's blocks in
`documentOracles.test.js` — and T-12a is the only batch-2 writer of that file. Batches 3–8 each
write exactly one production file — the same one — plus the test file(s) of a batch-1 or batch-2
task they un-skip, and no two tasks share a batch, so no batch contains two writers of any file.
Batch 9 writes four documentation/config files plus two un-skipped test files; batch 10 writes the
generated bundle and the plugin manifest.

The multi-owner files are: the ten test files whose `[red]` author and `[green]` un-skipper sit in
different batches; `orchestrate-dev.js`, whose six owners sit in six distinct batches connected by
the real edge chain T-13 → T-14 → T-15 → T-16 → T-17 → T-18; and
`documentOracles.test.js`, whose three owners sit in batches **1** (T-00a, census exclusion),
**2** (T-12a, the skipped disclosure oracle) and **9** (T-19, the un-skip), serialised by the real
edges T-00a → T-12a → T-19. Three owners eight batches apart is fine — waves are what separate
writers, and these are separated.

## Dependencies

### Ordering constraints that are not code dependencies

- **T-02 must complete before any production change (TSPEC §7.4, §9.3 T-1).** The byte-identity
  baseline is only valid if captured at a point where `pdlc/workflows/orchestrate-dev.js` is
  byte-identical between the merge base and branch HEAD. This is enforced as a **real `Deps` edge**,
  not a prose note: T-13 carries `T-02`, and every later green inherits it transitively through the
  serial chain T-13 → T-14 → T-15 → T-16 → T-17 → T-18. T-10 also carries `T-02` because it compares
  against the recording. This is the same requirement, for the same reason, that
  `PLAN-pdlc-loop-economics.md` §2 records for its own `T-02`.
- **T-03 must complete before any corpus assertion.** T-08 and T-09 carry `T-03` explicitly. The
  fixture is a **frozen copy at `8c673a09f`**, never the live tree: the live enumeration already
  returns 26 in-scope files against the fixture's 25, because this feature's own
  `DECISIONS-pdlc-decision-ledger.md` landed after the Baseline commit. A live read would redden on
  the next feature that records a decision — the `coveredViolations` whole-tree-walk failure class
  recorded in `CLAUDE.md`.
- **T-06 before T-15 is a budget edge, not only a red/green edge.** T-06 pins the framing at
  ≤ 1,200 bytes; T-15 drafts `DECISION_LEDGER_RULE_TEXT` **to fit** it. If the drafted text does not
  fit, the correct response is to shorten the text or re-open §3.6's arithmetic deliberately —
  **never** to raise the literal, because §3.6's ~4,995-byte project-level headroom and `M-6b`'s
  441-byte margin shrink one-for-one with any raise (`DEC-DECLEDGER-12`).
- **T-16 depends on T-15 for a structural reason, not just ordering.** `DEC-DECLEDGER-11` makes
  `renderDecisionLedgerBlock` the single producer of ledger bytes, and `selectDecisions` obtains
  `renderedBytes` by calling it. The renderer must therefore exist before the selector.

### Red-before-green edges

Every `[green]` task lists its `[red]` task in `Deps` and names the same test file:

| Red | Green | Shared test file |
|---|---|---|
| T-04 | T-13 | `decisionLedgerConfig.test.js` |
| T-05 | T-14 | `decisionLedgerRecognise.test.js` |
| T-06 | T-15 | `decisionLedgerRender.test.js` |
| T-07 | T-16 | `decisionLedgerBounds.test.js` |
| T-08, T-09 | T-17 | `decisionLedgerInjector.test.js`, `decisionLedgerCorpus.test.js` |
| T-10, T-10a, T-11 | T-18 | `decisionLedgerLoop.test.js`, `decisionLedgerMain.test.js`, `decisionLedgerCensus.test.js` |
| T-12, T-12a | T-19 | `decision-ledger-config-example.test.js`, `documentOracles.test.js` |

**Both of T-19's test files now have a red predecessor (TE F-04).** In v0.1 `documentOracles.test.js`
appeared in T-19's Test File column and in the ownership manifest but in no red row and in neither
coverage table, so three of T-19's four deliverables stood on a manual DoD checkbox alone — an
absence-only guarantee. T-12a supplies the red half.

T-00, T-00a, T-01, T-02 and T-03 have no red predecessor by construction: T-00 pins the existence of
HEAD symbols and passes at HEAD; T-00a is a **green-at-both-ends** census edit whose positive control
(count still `102`) passes before and after and would fail on a dropped exclusion; T-01 creates
doubles; T-02 and T-03 create fixtures and their integrity guards, which pass against the artefacts
they capture.

### RED-terminal batch gate wording

Batches 1 and 2 end **red by design** — the production symbols do not exist yet. A blanket "full
suite green after every batch" is unsatisfiable there, so the gate for those two batches is:

> The new tests are committed **skipped**, each block titled with the id of the `[green]` task that
> un-skips it, each block having been run un-skipped once and observed to fail for the reason
> transcribed into the test file's header; **and** the pre-existing suite is green.

Batches 3–10 carry the ordinary gate: the full suite green after the batch.

### Integration points

| Integration point | Where | Touched by |
|---|---|---|
| The single `.claude/pdlc.config.json` read in `main()` (`readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)`) | `pdlc/workflows/orchestrate-dev.js` | T-13 — adds a **fourth consumer** of the already-read text, never a fourth read |
| `wrapperSeams` | same module | T-18 — adds `_injectDecisionLedger` alongside the shipped `_injectLearnings` |
| `reviewLoop`'s parameter list | same module | T-18 — one optional seam, defaulting `null` |
| `reviewerPrompt`'s parameter list (module-private; its only two call sites are inside `reviewLoop`) | same module | T-18 — one trailing parameter, defaulting `""` |
| The run-level `notices` channel | same module | T-13 — two ids, on the established `NTC-{BLOCK}-{KIND}` convention; **no notice on the missing-block common case**, so a disabled run's report stays byte-identical |
| The report object | same module | T-18 — `report.decisionLedger` present **only** when the injector is non-null |
| `.claude/pdlc.config.example.json` (eight top-level blocks at HEAD) | repo root | T-19 — a ninth block; the engine disclosure test asserts **containment**, never set equality, over the top level |
| `pdlc/workflows/dist/pdlc-cli.mjs` | generated | T-20 — rebuilt and staged **in the same commit** as the workflow-source change, per `CLAUDE.md`; the wave gate's `postWaveCommand` does the same after every wave that touches `pdlc/workflows/*.js` |

### What this PLAN deliberately does not touch

`MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, `MAX_ERRATUM_FOLLOWUP_ROUNDS` (NG-5); any reviewer or
author `SKILL.md` (NG-6, `DEC-DECLEDGER-05`); any file under `pdlc/engine/` other than the new
`__tests__/decision-ledger-config-example.test.js` (NG-6); the delta-confirmation and
finding-restatement prompt builders (`DEC-DECLEDGER-04`); and `DEC-LOOPECON-06`'s identity triple
(BR-11 — pinned unchanged by T-10 and by T-11's census).

## Verification

### Suite layout, verified at HEAD

Two suites carry this feature's tests, and both are already required checks:

| Suite | Command | Gate check |
|---|---|---|
| `pdlc/workflows/__tests__/` (jest) | `cd pdlc/workflows && npm test`; coverage via `npm run test:coverage` | `Unit tests (ubuntu-latest, node 20)` |
| `pdlc/engine/__tests__/` (`node:test`, **64 `*.test.js` modules** at HEAD) | `cd pdlc/engine && npm ci && npm test` | `Engine tests (ubuntu-latest)` |

The directory holds 73 *entries* — 64 test modules, 7 `_`-prefixed helper modules (`_run-suite.mjs`,
`_bootstrap.mjs`, `_assert-suite-wide.mjs`, `_corpus.mjs`, `_doubles.mjs`, `_replay-double.mjs`,
`_tspec-packed-set.mjs`) and 2 directories (`fixtures/`, `live/`). v0.1 said "73 files", which in a
sentence about a test suite reads as a module count and is off by nine (TE F-08). No assertion in
this PLAN transcribes the figure.

Verified layout facts this PLAN relies on: `pdlc/workflows/package.json`'s jest
`testPathIgnorePatterns` is `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`, so
T-01's helper and T-02/T-03's fixtures — including `scenarios.mjs` — are never collected as tests;
and `pdlc/workflows/__tests__/fixtures/` already holds sibling fixture directories
(`learnings-baseline/`, `loop-economics-baseline/`), so T-02 and T-03 add two more of a shipped kind.

### The coverage gate — corrected (TE F-02)

v0.1 said flatly *"the coverage gate is not evidence for this feature, and this PLAN does not lean on
it."* The premise was right and the conclusion was wrong, because it was drawn from reading two of
the gate's clauses. `pdlc/workflows/package.json`'s `test:coverage` has **four**:

```
c8 npm test -- --runInBand
  && c8 report --reporter=json
  && node scripts/check-wave-resume-delta-coverage.mjs
  && c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0
```

**Clause 4 is genuinely not evidence here**, for the stated reason: the c8 `include` list names
`**/pdlc/workflows/orchestrate-dev.js` as a single file, every symbol this feature adds lands in that
~817 KB file, and the new branches average into a ratio dominated by shipped code — TSPEC §6.1's
fourteen failure rows could be entirely uncovered and the per-file number would not move. That is
why the row-to-task mapping below exists.

**Clause 3 is the strictest evidence in the repository, and it already applies to this feature with
no wiring required.** `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` is not
wave-resume-specific despite its name; its own header calls itself the compensating control for
exactly the largeness clause 4 cannot see through. Mechanically: `SUBJECT` is hard-coded to
`pdlc/workflows/orchestrate-dev.js` — this feature's only production file; `resolveBase()` prefers
the **live** `merge-base HEAD origin/main`, which on `feat-pdlc-decision-ledger` is this feature's own
merge base; `introducedRanges()` takes the post-image hunk ranges of `git diff -U0 <base> HEAD --
SUBJECT`, i.e. **the lines T-13…T-18 add**; and it exits 1 if **any** uncovered line falls inside
them.

**Where it actually runs — corrected (TE F-02).** v0.2 said it "runs at every wave gate from batch 3
onward". It does not. The wave gate runs `implementation.testCommand`, and in
`.claude/pdlc.config.json` (identically in `.claude/pdlc.config.example.json`) that is
`(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` —
plain `npm test`, which contains no clause 3. The gate therefore fires in exactly two places: the
required CI check `Unit tests (ubuntu-latest, node 20)`, which runs `test:coverage`
(`.github/workflows/pr-tests.yml`), and the Definition of Done's own `npm run test:coverage` bullet.
Widening `testCommand` to close the gap is **out of scope** — it would apply clause 3 to unrelated
work in the same wave (the T17 gate-widening hazard).

The consequence of the corrected timing is the *opposite* of what v0.2 drew: an uncovered branch
introduced by T-13 at batch 3 does **not** surface at batch 3, it surfaces at PR time as a
batch-8-era remediation across six greens. The close is a per-wave manual run, now an explicit
instruction in T-18's row: after **each** of batches 3–8, commit the `orchestrate-dev.js` edit and
run `node pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` by hand, so the feedback
arrives one wave after the line that caused it. **T-18 owns the outcome** (its row names the script, and the DoD
carries an explicit bullet). T-18's `main()` wiring is the structurally-at-risk site — nothing
executed it in v0.1, so its lines were uncovered by construction and this gate would have reddened
them at batch 8; T-10a's live arm is what closes both that and TE F-03. T-17's per-path `try/catch`
arms are the second risk site. Caveat carried into T-18's row: the script *warns* rather than fails
when `orchestrate-dev.js` has uncommitted changes, since its ranges are HEAD line numbers while c8
measured the working tree — **commit, then run**.

### Failure-row coverage — every row of TSPEC §6.1 has a named owner

| Row | Scenario | Owning task |
|---|---|---|
| F-1 | config file absent / unreadable | T-04 → T-13 |
| F-2 | config file not valid JSON | T-04 → T-13 |
| F-3 | `decisionLedger` block absent (no notice) | T-04 → T-13 |
| F-4 | block present but not a plain object (`NTC-DECLEDGER-MALFORMED`) | T-04 → T-13 |
| F-5 | one key wrong-typed (`NTC-DECLEDGER-KEYTYPE`, other keys keep operator values) | T-04 → T-13 |
| F-6 | `git ls-files` `!ok` **or** `_git` throws ⇒ `RSN-UNLISTABLE` | T-08 → T-17 |
| F-7 | enumeration returns zero paths ⇒ `RSN-EMPTY` | T-08 → T-17 |
| F-8 | one source unreadable (`null` **and** throwing arms) ⇒ `failedSources` | T-08 → T-17 |
| F-9 | source reads, zero records ⇒ `emptySources`, not a failure | T-08 → T-17 |
| F-10 | nothing survives, for any mixture of F-8/F-9 ⇒ total leg | T-08 → T-17 |
| F-11 | either bound exceeded ⇒ drop loop in omission order | T-07 → T-16 |
| F-12 | a single line alone exceeds `maxBytes` ⇒ dropped whole | T-07 → T-16 |
| F-13 | either threshold resolves to `0` | T-04 (validator), T-10 (byte-identity outcome) |
| F-14 | feature has no directory, or its directory yields zero records | T-08 → T-17 |

### Acceptance-test coverage — every FSPEC AT has a named owner

| AT | Owning task | Level |
|---|---|---|
| AT-01, AT-02, AT-18 | T-09 → T-17 | corpus oracle over the frozen fixture |
| AT-03 | T-08 → T-17 | injector, scripted `_readFile` mutation (`DEC-DECLEDGER-14`) |
| AT-04 | T-02 | committed merge-base baseline guard |
| AT-05, AT-14, AT-16, AT-17 | T-10 → T-18 | loop integration against T-02's recording |
| AT-04, AT-05 (live half) | T-10a → T-18 | `main()`-driven composition root: `_git` call-count spy, positive block-presence, flag-off report/notices set equality (TE F-03, F-05) |
| FSPEC Q-3 / disclosure prose | T-12 → T-19 (engine config example), T-12a → T-19 (`OPERATIONS.md` / `README.md` / `CLAUDE.md` derived oracle) | config + documentation disclosure |
| AT-06, AT-07 | T-06 → T-15 | pure unit on the rule-text constants |
| AT-08, AT-09, AT-10 | T-08 → T-17 | fail-open legs + O-7's `failedSources`/`emptySources` split |
| AT-11 | T-04 → T-13 | pure unit, set equality over C-3 |
| AT-12 | T-10 (driver half) → T-18, T-06 (text half) → T-15, T-11 (census) | integration + source census |
| AT-13, AT-15 | T-07 → T-16 | property, plus retained example anchors |

### Anti-echo commitments

Three places where an expectation could be derived from the code under test, and the task that is
required not to:

1. **T-09** transcribes expected statements, citations, the 41 project-level ids, `6,305`, the 63
   `M-6b` ids and `10,859` **by hand from the fixture** — never captured from the renderer, never
   read from a manifest (`DEC-DECLEDGER-16`). If T-09 reddens, the correct response is **never** to
   trim the expected set to whatever the renderer emitted.
2. **T-07**'s property model carries its **own** formatter transcribed from TSPEC §4.3; reusing the
   production renderer would make the no-truncation conjunct true by construction.
3. **T-02** asserts `mergeBaseSha` against a hand-transcribed `EXPECTED_MERGE_BASE_SHA`, never
   against the manifest it is checking, and never against a `git merge-base origin/main HEAD`
   computed at test time (which would depend on a current local `origin/main` and could red on an
   unrelated push to `main`).

### Definition of Done

- [ ] All 24 tasks ✅; every `[red]` block un-skipped by its named `[green]` task, none left skipped.
- [ ] `cd pdlc/workflows && npm run test:coverage` exits 0; `cd pdlc/engine && npm ci && npm test`
      exits 0; `bash -n` clean over tracked `*.sh`; the fixture-machine leg green — the four
      required checks named in `CLAUDE.md`.
- [ ] `node pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` reports **0 uncovered lines**
      inside this feature's introduced ranges in `pdlc/workflows/orchestrate-dev.js` — run on a clean
      tree (**commit, then run**: the script warns rather than fails on uncommitted changes, because
      its ranges are HEAD line numbers while c8 measured the working tree). Owned by T-18.
- [ ] `main()` is driven live with the flag on and the flag off (T-10a): the `_git` seam is invoked
      ≥ 1 on the served reviewer flow, the served reviewer prompt **ends with** the rendered block,
      and `report.decisionLedger` is asserted on a real composition-root run — not by source census
      alone (DC-07).
- [ ] `documentOracles.test.js`'s `*.test.js` census excludes the `decisionLedger` namespace (landed
      by T-00a at batch 1) and still counts `102` with all twelve modules on disk (the terminal
      positive control, owned by T-19), and its decision-ledger disclosure family
      (T-12a) is green with every expectation **derived** from `DECISION_LEDGER_OMIT_REASONS`,
      `DECISION_LEDGER_NOTICES` and `DECISION_LEDGER_DEFAULTS` rather than restated.
- [ ] Flag off ⇒ reviewer-prompt stream byte-identical to T-02's committed merge-base recording
      (AT-04), and all four not-enabled spellings collapse to it (AT-05).
- [ ] Flag off ⇒ the report object carries **no** `decisionLedger` field and **no** notice — each
      absence **paired with its positive** on the same `main()`-driven path (TE F-05): the report's
      key set is **set-equal** to the flag-off key set, and `notices` is **set-equal** to the
      baseline notices array. Set equality is what makes a spuriously-added key or notice fail;
      "contains no `NTC-DECLEDGER-*`" alone does not.
- [ ] Every row of TSPEC §6.1 and every FSPEC AT has a passing test, per the two tables above.
- [ ] Every named mutation applied, observed red, reverted, and the observed failure transcribed into
      the respective test file's header: T-07's four, T-02's three, and — under TSPEC §7.5's O-8
      discipline, each checked against an **independent model** rather than the production function —
      `P-REC`'s four (T-05) and `P-LINE`'s three (T-06).
- [ ] `DECISION_LEDGER_RULE_TEXT` + preamble + header + trailer render to ≤ 1,200 bytes, asserted
      against that literal (`DEC-DECLEDGER-12`).
- [ ] The census (T-11) is green with every slice asserted non-empty, and
      `DECISION_LEDGER_CENSUS_TOKENS` — its **six** members — set-equal to the module's exported
      decision-ledger symbols. `decisionLedger` is **not** among them (TSPEC v0.8 §7.3: the report
      field is threaded through `buildFinalReport` outside `main()`, so the token is unsatisfiable);
      its obligation is discharged behaviourally by T-10a's live arm, not by the census.
- [ ] The enablement flag is read by **destructuring**; PROP-DIS-06 in `advisoryDisabled.test.js` is
      still green.
- [ ] `.claude/pdlc.config.example.json` carries the `decisionLedger` block; `pdlc/OPERATIONS.md`,
      `pdlc/README.md` and `CLAUDE.md` name it — **mechanically asserted by T-12a**, not by this
      checkbox alone; `README.md` and `CLAUDE.md` carry a pointer rather than a restatement, keeping
      the ~:625 confinement discipline; no `SKILL.md` and no `pdlc/engine/` runtime file changed.
- [ ] After T-19's document edits, `documentOracles.test.js`, `pdlc/engine/__tests__/docs-uniqueness.test.js`
      and `pdlc/engine/__tests__/ci-arrangement.test.js` are re-run and any line-anchored site the
      insertion moved is re-pinned (TE F-06).
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0 and `pdlc/workflows/dist/` is staged in
      the same commit as the workflow-source change; `pdlc/.claude-plugin/plugin.json` version bumped
      from `0.23.6` **to `0.23.7`**, satisfying `pdlc/engine/package.json`'s
      `"pdlcPluginCompat": "^0.23.0"` and the AT-1.6 / DEC-09 handshake check.
- [ ] `recogniseDecisionRecords` and `renderDecisionLedgerBlock` each carry at least one
      `fast-check` property (TE F-07), including the **one-physical-line-per-decision** law that
      T-07's line count and T-09's `6,305` / `10,859` byte literals silently assume.
- [ ] No test reads the live `docs/` tree; no test writes to the working tree or to a fixture file.
