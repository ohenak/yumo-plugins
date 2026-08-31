# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Summary

Delta re-review of TSPEC v1.1 against the commit reviewed in v1 (`b182bb1d5`), scoped to the
sections the revision touched: §3.3/§3.4 (renderer signatures, `statsParsers` export, `cmdStats`
wrapper), §4.2.1 (new — JSON key sets), §4.3 (DoD harvested reading, halt matcher), §4.4
(provisional predicate), §6.1–§6.6 (measured baselines, process-level exit-code hygiene, key-set
conjuncts, repaired anti-drift oracles, snapshot isolation, PROP-3, named mutations), §7.1, §8.2–§8.4.

**All four v1 High findings are resolved, and each repair is verified against HEAD rather than
against the document's prose.** Three new Medium findings remain, all about whether a *newly added*
oracle conjunct can actually be written in the runner it will live in; none is gating.

## Prior-Finding Disposition

| v1 finding | Severity | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-01 doc-type probe used the reviewer **skill id** `se-review` | High | **Resolved** | §6.4 now spells the probe `CROSS-REVIEW-software-engineer-{T}-v1.md` and states why. Verified: `REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP))` is `software-engineer`/`product-manager`/`test-engineer` and is checked before the doc-type check (`pdlc/workflows/orchestrate-dev.js`, `MAP` and `parseReviewFilename`, §"closed role catalogue"). The probe is now green-on-correct. |
| F-02 vendoring oracle asserted equality with `MODULE_NAMES` | High | **Resolved in substance** (see F-02 below for the residue) | §6.4 restates the invariant as `MODULE_NAMES.length + 1`, with the manifest named as the `+ 1`. Verified: `pdlc/engine/scripts/prepack.mjs` `MODULE_NAMES` has **4** entries; `pdlc/engine/__tests__/_tspec-packed-set.mjs` `WORKFLOW_MEMBERS` has **5**, the extra being `vendor/workflows/VENDOR-MANIFEST.json`; `tspecPackedCount` returns `4 + 15 + 5 + 1`. The `+ 1` is the right invariant. |
| F-03 catalogue oracle was fixed-probe containment | High | **Resolved** | §6.4 now specifies **set-equality** between `REVIEW_DOC_TYPE_ROWS` and the accepted-type set computed by probing a candidate superset (`REVIEW`, `IMPLEMENTATION`, `LEARNINGS`, `POSTMORTEM`, `CODE_REVIEW`, `QUEUE`, `DOD`, `HANDOFF`), and names the residue and the alternative it declined. Every candidate is expressible under `CROSS_REVIEW_RE`'s `[A-Z][A-Z_]*` doc-type group, so `CODE_REVIEW` really can be probed. |
| F-04 whole-tree snapshot vs the suite's own in-tree writes | High | **Resolved** | §6.5 adds the declared-scratch-prefix exclusion (one exported constant in `__tests__/helpers/`, which exists) plus a guard conjunct that the constant is non-empty and nothing pre-existed under it. Verified: the only in-tree scratch is `mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"))` at `pdlc/workflows/__tests__/learningsCaptureScript.test.js:215` with `SCRATCH_ROOT = path.resolve(__dirname, "..")` (`:212`); `.baseline-worktree` is created inside a `mkdtempSync(tmpdir(), …)` throwaway repo (`:70`), not the checkout, so `.tmp-*` really is today's complete set. `test` has no `--runInBand`, `test:coverage` does (`pdlc/workflows/package.json:7-9`) — the parallel-worker premise holds. |
| F-05 `statsParsers` module-private | Medium | **Resolved** | §3.4's edit table adds `export async function statsParsers()` as the single production construction site. |
| F-06 `try`/`catch` described, not written | Medium | **Resolved** | §3.4 now writes the wrapper into the sketch and names it as the function the injected-throw test drives. |
| F-07 `schemaVersion` absent from the data model | Medium | **Resolved** | New §4.2.1 states it as a `renderJson` obligation with `SCHEMA_VERSION = 1`, and §6.3 asserts the literal `1`, not the module constant. Transcription checked verbatim against FSPEC BR-21 (five keys), BR-23 (three), BR-30 (three, `error` exactly `{reason, message}`) — the TSPEC's table matches the FSPEC's words. |
| F-08 grammatical vs literal `CROSS-REVIEW-*` in the harvested test | Medium | **Resolved** | §4.3 decides the grammatical reading, grounds it in REQ C-4, names the disagreeing shape (the four `CROSS-REVIEW-{role}-REVIEW-v{1,2}.md` files in `docs/completed/pdlc-advisory-wave-gate/` — verified present), pins a fixture, and routes the ambiguity as an erratum (§8.3). |
| F-09 PROP-3 could not falsify | Medium | **Resolved** | PROP-3 is restated over a **generated permutation** of the listing with a second conjunct pinning key/row order to `REVIEW_DOC_TYPE_ROWS`. That is falsifiable where the two-identical-calls form was not. |
| F-10 exclusion set asserted in prose only | Medium | **Resolved** | §6.4 adds the exclusion-set oracle with an *independent* witness (an artifact named `-{dirname}.md`, or no files). Re-derived over the live tree: all eight names are present at `docs/`, and every one of the 13 remaining directories satisfies the witness — the oracle is green at HEAD and would go red on a bare-named `docs/_evidence/`. |
| F-11 halt matcher's open phase capture | Medium | **Resolved**, with a new upstream-fidelity residue (F-03 below) | §4.3 changes the capture to `[^-]+` and adds the negative test (`POSTMORTEM-D-pdlc-stats.md` under feature `stats` yields no halt). Verified safe at HEAD: `FORCE_PHASE_TOKENS = ["R","F","T","P","D","PR"]`, every construction site spells `POSTMORTEM-${phase}-${feature}.md` (`orchestrate-dev.js:8618`, `:9402`, `:10600`, `:15293`, `:18243`), and all 21 post-mortems on disk carry hyphen-free phases (`D`, `F`, `I`, `P`, `PR`, `R`, `T`). |
| F-12 `malformed` "deduped" | Low | **Resolved** | §4.1's comment now says "in listing order (no dedup step …)". |
| F-13 `cwd` spelling drift | Low | **Resolved** | §3.4 fixes `argv`, the single `cwd` resolution at the edge, and the `await`. |
| F-14 inventories, not baselines | Low | **Resolved** | §6.1 adds the asserted-value table. Re-measured at HEAD: AT-09 `TSPEC` = **6** (`…-TSPEC-v1…v6.md` present under `docs/completed/pdlc-advisory-wave-gate/`), AT-10 = **13** (`CROSS-REVIEW-software-engineer-TSPEC-v13.md` is the sole survivor), AT-11 = **2** (`CODE_REVIEW-pdlc-loop-economics-v{1,2}.md`), AT-14b = `D, F, I, T` exactly, AT-13's marker reads `RESOLVED: yes` at line 3. Every literal in the table is correct. |
| Q-03 shared `process.exitCode` | — | **Answered** | §6.2 names `captureRun` in `pdlc/engine/__tests__/loop-cli.test.js:386` and its extension. Verified: the helper saves `process.exitCode` before the call, reads it after, restores it, and swaps `console.log`/`console.error` — so the stated extension (also swapping `process.stdout.write`/`process.stderr.write`) is exactly the delta needed. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §6.4's parser-identity oracle gains a second conjunct this round — "the object `cmdStats` passes to `runStats` **is that same bundle**" — and as specified it cannot be written. §3.4's sketch has `cmdStats` call the `runStats` binding it imports from `stats.mjs`; nothing observes that call. The CLI-level tests live in `pdlc/engine/__tests__` under `node __tests__/_run-suite.mjs` (`pdlc/engine/package.json` `scripts.test`) on `node >= 20` (`engines`), where there is no module-mocking facility: no file in `pdlc/engine/__tests__` uses `jest.mock`/`unstable_mockModule`, and `node:test`'s `mock.module` is not available on Node 20. The first conjunct (identity against the exported `statsParsers`) is writable and discharges REQ C-5; the second needs a seam. Either give `cmdStats` an injectable second argument (`cmdStats(argv, { runStats = realRunStats } = {})`, asserted by passing a recording `runStats` and comparing `parsers === await statsParsers()`), or drop the conjunct and say the single construction site is what carries the guarantee — but do not leave an unwritable conjunct in an oracle table an implementer will TDD from. | §6.4 row 1 (Parser identity) |
| F-02 | Medium | Local | §6.4's repaired vendoring oracle asserts "`tspecPackedCount`'s vendored class size **equals `MODULE_NAMES.length + 1`**", but that inner term is not a readable value: `tspecPackedCount({licence})` returns the single sum `4 + 15 + 5 + 1 + (licence ? 1 : 0)` (`pdlc/engine/__tests__/_tspec-packed-set.mjs`), and the `5` is a literal inside the expression. Exposing it means widening a completed sibling's frozen module surface — precisely the move §6.4 declines two paragraphs later for `REVIEW_DOC_TYPES`. The readable equivalent already exists and is already a named co-change site: `WORKFLOW_MEMBERS.length === MODULE_NAMES.length + 1` (verified 5 === 4 + 1, the extra being `vendor/workflows/VENDOR-MANIFEST.json`). Restate the oracle over `WORKFLOW_MEMBERS.length`, and if `tspecPackedCount`'s hand-written `5` is also to be pinned, say explicitly that `_tspec-packed-set.mjs` must hoist it into an exported constant as part of this feature's five-site edit — §2.1's table currently lists that file's edit as "`WORKFLOW_MEMBERS`, `tspecPackedCount`" only. | §6.4 row 4 (Vendoring co-change); §2.1 |
| F-03 | Medium | Local | §4.3's new `[^-]+` phase capture is the right engineering answer to v1's F-11, and its safety at HEAD is verified — but it *does* narrow FSPEC BR-12, which says the phase is "the segment between" and that this command "holds no catalogue of valid phase ids and **rejects none**". Under `[^-]+` a basename `POSTMORTEM-A-B-{feature}.md` is rejected outright rather than reported with phase `A-B`; §4.3 argues this is a shape constraint and not a catalogue, which is defensible, but it is still an observable the FSPEC decides the other way. The two sibling divergences this revision found (BR-11, BR-16) are both routed as errata in §8.3; this one is not. Either route it as a third erratum line in §8.3 for the same reason, or state in §4.3 why a shape constraint needs no FSPEC ratification while a membership one does. | §4.3 (halts); §8.3 |
| F-04 | Low | Local | §6.4's doc-type oracle is called "set-equality" but is set-equality **over a candidate set** — the eight all-caps tokens named in §6.4. A seventh accepted type outside that list (`SPIKE`, `RFC`) is still invisible, which is the same class of blind spot v1's F-03 raised, narrowed rather than closed. §6.4 says so honestly and prices the alternative (exporting `REVIEW_DOC_TYPES`), so this is recorded, not contested: it earns a Low only because §8.2 RK-3 now describes the mitigation as "set-equality" without the candidate-set qualifier, which overstates it. Qualify RK-3's cell to match §6.4's own honest wording. | §6.4 (Doc-type catalogue agreement); §8.2 RK-3 |
| F-05 | Low | Local | §6.5's guard conjunct — "no path under [the excluded prefix] existed *before* the run that `stats` could have been asked to read" — is stated as an assertion but has no named mechanism, and it is the conjunct doing the work of stopping the exclusion becoming a hole. Say how it is evaluated: the natural form is that the pre-run snapshot pass records the excluded-prefix hits it skipped and the test asserts that set is empty *at the moment stats is invoked*, which is falsifiable; "existed before the run" alone reads as prose. One sentence in §6.5's second measure closes it. | §6.5 (guard conjunct) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6.4's exclusion-set oracle asserts over `docs/`'s **immediate children**. Its subset half is green at HEAD for all 13 feature directories (re-derived: each carries at least one `*-{dirname}.md`), but `docs/orchestrate-dev-workflow/` is the only one whose witness comes from seven files rather than one. If a future feature directory is created empty *and* then given only a `CROSS-REVIEW-…` file before its `REQ-…`, it satisfies neither witness half and the oracle goes red for a reason unrelated to a ninth non-feature directory. Is a transient red during authoring acceptable, or should the witness also accept "carries only files matching a documented pdlc artifact grammar"? |
| Q-02 | §6.6's mutation table pins two `- 1` drops against AT-09/AT-10/AT-11's real-path literals. Those three literals are re-measured correct today. Does the intended mutation run execute the *real-path* tests, or only the fixture-backed unit suite? If the latter, the two arithmetic mutants are not actually killed by anything in the mutation run, and the table's claim would need a fixture with the same numeric shape. |

## Positive Observations

- **Every repair was checked in code, and every one holds.** The role-slug fix, the `+ 1` vendoring invariant, the candidate-set set-equality, the `.tmp-*` scratch exclusion, the `[^-]+` safety argument, `captureRun`'s existence and shape, and all six of §6.1's newly recorded literals were re-derived from HEAD rather than trusted from prose. Four Highs closed in one round with no regression in the sections they touched.
- **§6.1's asserted-value table is the strongest addition.** It converts RK-4 from a risk with a slogan into a risk with a baseline: each literal now carries its measured value, so a future red names whether the archive moved or the implementation broke. AT-18's deliberate statement as invariants ("exactly once", "never `completed`") rather than a feature count is the right call — a literal that every archival falsifies buys nothing.
- **§4.2.1 states the projection, not the serialisation, and that is the finding v1 was reaching for.** Naming `feature`/`dir` as the two keys that could plausibly leak, and asserting their **absence** alongside the positive exact-key-set conjunct, is a paired oracle rather than an absence-only one. The `schemaVersion === 1` conjunct pinned to the literal rather than to `SCHEMA_VERSION` is exactly the no-implementation-echo rule applied without being told.
- **PROP-3's restatement is a textbook falsifiability repair.** Two identical calls over one input agree by construction; a generated permutation plus an order-equality conjunct against `REVIEW_DOC_TYPE_ROWS` can fail, and can fail for a stably-wrong order too.
- **The upstream ambiguities are routed rather than absorbed.** §4.3 takes the REQ-faithful reading on both BR-11 and BR-16, names the archive shape on which the readings disagree, pins a fixture at the boundary, and sends the wording upstream. That is the correct handling of a spec conflict at TSPEC altitude.

## Recommendation

**Approved with minor changes**

All four v1 High findings are resolved and verified against HEAD; no High finding is open. The three
Mediums are implementability repairs to oracle conjuncts added this round — F-01 and F-02 each name
the concrete restatement that fixes them, F-03 asks for one erratum line or one sentence — and the
two Lows are wording. None blocks the PLAN phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}


APPROVAL-HASH: sha256:db285ea2f1eb0267f2a49392979eade2e78ead59a1f243ec7e0438aeb3c4b5be
APPROVAL-HASH-NORMALIZED: sha256:9cacb8e90736834554649f30fcafcae8a79c7d62150d31215686374cefcf2d16
REVIEWED-COMMIT: 66c4049ac93d74f8226284dea745a16cdb70a30b
UPSTREAM-STATE: REQ sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126
UPSTREAM-STATE: FSPEC sha256:c142bfa852edaecb088d72a93de0ab58c39be5d53a2735e7bd27c621ca5558c4
