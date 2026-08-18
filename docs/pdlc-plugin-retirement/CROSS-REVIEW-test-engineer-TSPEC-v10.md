# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.10)
**Date:** 2026-08-17
**Iteration:** 10
**Scope:** delta re-review under decision freeze. Only `3b7003e6`..HEAD (`f6643915`) was scanned for
new issues: §2.9's class-6 and class-11 rows, §5.2's AT-3.1 host clause, §5.5's two new table rows
plus the admitted-modules cost passage, the out-of-domain package rule, the child `--json`
collection assertion, the relocated cost paragraph, the teardown-protection restatement, the
scan-scope note and §6.1 erratum 10's amended limb. Unchanged sections already approved were not
re-litigated.

## v9 findings disposition

| v9 ID | Disposition | Evidence |
|---|---|---|
| F-01 (High) — `consolidationHookParity.test.js` outside the swept-surface table while §5.5 asserts closure over exactly that table | **Resolved, both halves in one breath as asked** | §5.5's table now carries the module as the sweep's one addition-shaped edit; §2.9's class-6 row carries the AT-3.3 clause 2 assertion *and* the conversion of the four capability ternaries; the domain bullet lists nine post-sweep members and both children's lists grow. The four cited sites hold at HEAD exactly: `(canRunDifferential ? test : test.skip)` at `consolidationHookParity.test.js:203`, `:227`, `:343`; `(hasBash ? test : test.skip)` at `:382`; `const hasBash = bashAvailable()` (`:51`), `const canRunDifferential = hasBash && !!PY_BIN` (`:73`), `PY_BIN = probePyBin()` (`:65`). The `python` fifth key is correctly derived: `KNOWN_CAPABILITY_KEYS` is `["bash","git","hash","uid-nonroot"]` at `helpers/skipSink.js:55`, and `itOrSkip` exists at `helpers/driftCapabilities.js:324`. Q-01's third-serialised-edit question is answered in the document, not only in reply. |
| F-02 (Medium) — AT-3.1's static-half host unnamed | **Resolved by naming, and the host was tabulated** | §5.2's AT-3.1 now names `orchestrateDevSkill.test.js` and `skillFiles.test.js`, and §5.5 adds a `skillFiles.test.js` row. Both citations hold: `RLH-SKILL-08` at `skillFiles.test.js:196` asserts `orchestrate-dev/SKILL.md`'s POSTMORTEM/`RESOLVED:` text, `RLH-SKILL-09` at `:209` asserts `orchestrate-queue/SKILL.md`'s committed `halted` row — both invalidated by §2.4's rewrite, so the class-11 membership is real and not decorative. |
| F-03 (Low) — teardown placement rationale did not hold for the red child | **Resolved, and the right reason substituted** | §5.5 now says the explicit file list plus `--globalTeardown` is what keeps `skipJoinTeardown.js` uncollected, with `fixtures/` demoted to the outer-run reason, and names the red child's dropped exclusion as the reason the old rationale failed. |
| F-04 (Low) — cost paragraph interleaved into the enumerated pair, `--runInBand` unpinned | **Resolved** | The cost paragraph now sits below both naming/configuration bullets and states that `--runInBand` is a member of the argument vector part 1 asserts by set-equality — the cost choice is pinned by an oracle rather than left to the implementer. Its counts were updated to eight green / nine red in step with the widening. |

## Delta verification against the tree

Everything the delta newly claims was checked against HEAD rather than read from prose:

- **Nine members, eight-module green child, arithmetic consistent.** §5.5's table now has nine
  post-sweep contributors (`consumerCleanup`, `hookCompatibility`, `consolidationBuild`,
  `pipelineWiring`, `consolidationPreflight`, `documentOracles`, `orchestrateDevSkill`,
  `consolidationHookParity`, `skillFiles`); the green child's transcribed list is those nine minus
  the host — eight — and the red child is that list ∪ the falsifier, nine. The domain bullet, part 1
  and the cost paragraph all now say the same numbers.
- **No hidden pending markers in the two admitted modules.** This was the live hazard of admitting
  them and it is clean: `skillFiles.test.js` contains no `.skip`/`.todo`/`xit` marker at all, and
  `consolidationHookParity.test.js`'s three `describe(` blocks are un-skipped at HEAD (`:182`,
  `:341`, `:381`) despite the file's header comment still describing the T04 red-authoring
  discipline. So after the four ternary conversions the module contributes no unregistered pending
  entry, and the green child's join can legitimately come out empty.
- **The out-of-domain package rule is exhaustive as stated.** `pdlc/engine/__tests__/smoke.test.js`
  and `fs-observation.test.js` both exist and are the class-2 row's modules (§2.9 line 295), so the
  three named engine-package exclusions match the sweep's actual engine-side edits.
- **The `--json` collection assertion closes the real gap.** Argument-vector set-equality alone could
  not distinguish an empty join from a child that collected nothing; asserting `testResults` file
  paths by set-equality against the same literal list, plus the per-invocation exit status and the
  red child's leaf-title match, makes the pass reading positive rather than vacuous. The list is a
  literal transcription of §5.5's table, not derived from code under test, so it stays a
  transcription oracle and not an implementation echo.
- **The `documentOracles.test.js` temp-directory note is grounded.** `coveredViolations` does walk
  the tree from `root` (`pdlc/workflows/lib/document-oracles.mjs`, `coveredViolations`), so pinning
  the host's `mkdtempSync` roots outside the repo keeps a red child readable.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The four new `SKIP_INVENTORY` rows are specified by `name` and `capability` only, but the helper rejects a row without invariants.** `helpers/driftCapabilities.js` documents that each record is `{name, capability, unverifiedInvariants}` and that `describeOrSkip`/`itOrSkip` throw when the third field is absent (`driftCapabilities.js:13`, `:89`–`:98`; every existing row passes a non-empty frozen array such as `INVARIANTS_AT_14B`). §5.5's cost passage names the four rows' `capability` values (`bash` for `:382`, the `bash`+`python` conjunction for the other three) but says nothing about what each row leaves unverified, so the implementer will discover the obligation from a thrown error rather than from the spec. Not blocking and not a defect the delta introduced — the same shape was already implicit for class 3's TT-1b row — but one clause naming the four invariant strings would make the rows writable from the document alone. | §5.5 (admitted-modules cost passage), §2.9 class 6 |

## Questions

None. v9's Q-01 and Q-02 are both answered inside the document (third serialised edit to
`driftCapabilities.js`, serialised never batched; `skipJoinTeardown.js` deliberately outside the
source-level scan's subject and outside both children's file lists, with a stated re-entry condition
if it ever gains a body).

## Positive Observations

- **The widening and its cost landed together, which is what made F-01 a single fix rather than a
  row.** The parity module was admitted *and* its four hand-rolled ternaries dispositioned in the
  same class-6 commit, with the exemption alternative named and rejected for the right reason — a
  standing carve-out written into an executable oracle's left set is worse than the conversion it
  avoids. The knock-on costs (fifth capability key, `KNOWN_CAPABILITY_KEYS` widening, the
  `WHAT IS NOT ENFORCED, AND WHY` restatement riding the same edit) are stated rather than left to
  be discovered in a red CI run.
- **The `--json` addition converts the join from argument-checked to observation-checked.** This is
  the difference between pinning what was handed to `spawn` and proving the child actually collected
  what it was handed; stating the two as one obligation ("either alone leaves the join
  provable-by-vacuity") is exactly the standard this review asks of everyone else.
- **The out-of-domain exclusion is now a rule with an enumeration, not an enumeration pretending to
  be a rule** — package membership decides, and the three engine modules are listed only as a
  closure check. That is the same altitude fix v9 credited for the swept surface, applied to the
  complement.
- **Every code citation in the delta holds at HEAD**: four ternary sites and their two gating
  constants, `probePyBin`/`PY_BIN`, `KNOWN_CAPABILITY_KEYS`'s exact four-key value, `itOrSkip`,
  `RLH-SKILL-08`/`-09` line numbers and subjects, both engine-package modules, and
  `coveredViolations`.

## Recommendation

**Approved with minor changes**

The v9 High is resolved in the form asked for, and the three lower findings are resolved with the
substituted reasoning correct in each case. The delta introduced no defect and contradicts nothing in
the repository at HEAD; the one Low above is a completeness nicety for the implementer, not a gate.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:90464289a6f32ed39f13ffe30aca693f7d033e96c0bc1a08311a53b964b876e4
APPROVAL-HASH-NORMALIZED: sha256:42a25af6643c0533c9b567faece87bc60ece6effd00ae81667d22a4101c9dc90
REVIEWED-COMMIT: f66439152eed60d0c4b40cc914287add511e4b24
UPSTREAM-STATE: REQ sha256:1038b8166cc84cb48d069c3e364a2a8e9aa07daf612e2fc8d611c3100e584294
UPSTREAM-STATE: FSPEC sha256:dccb45d6fb253d197b7a197288a3381b330903fc4ac49efbf0c99b410c79ade0
