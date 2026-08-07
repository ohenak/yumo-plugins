# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** product fidelity of the PLAN against `REQ-pdlc-consolidation-agent` and
`FSPEC-pdlc-consolidation-agent` v11.3 — acceptance-criterion coverage, scope compliance,
and the accuracy of every claim the PLAN makes about the repository at HEAD.

## 1. What was verified, and how

This PLAN stakes its credibility on measurement: §1 opens **"Verified against HEAD before this
PLAN was written"**, §3 tabulates BL-PREREQs with line numbers, §6 claims the Phase-P gate
functions were run over the document, and §9.1 raises three upstream errata each "measured how".
A hostile reviewer's obligation is therefore not to read those claims but to re-run them. Every
citation below was independently re-measured on the working tree at
`feat-pdlc-consolidation-agent`.

**Re-measured and confirmed exact** (no finding):

| Claim | Re-measured |
|---|---|
| `resolveAdvisoryRung` `:1833` exported, `MERGE_GUARD_DEFAULTS` `:48`, `mergeCommandFor` `:319`, `ADVISORY_RUNG_SKILL` `:1797`, `commitPaths` `:8669` | `orchestrate-dev.js` — all exact |
| `gitWithLockRetry` `:8617` declared `async function` and **not** exported | exact; the PLAN's one known-absent BL-PREREQ is real, and T11 schedules it |
| `rtShellQuote:668`, `rtWriteFile:802`, `rtCheckFile:817`, `rtAppendFile:863`, `rtListFiles:905`, `rtGit:945`, `rtDevInjections:1086`, `rtReadProbe:369`, `rtReadFile:493`, `rtRunCommand:1034` | `runtime-adapter.js` — all exact |
| `"relative to the repository root"` occurs **exactly once**, at `runtime-adapter.js:805` | exact — T03's uniqueness conjunct is well founded |
| `stripModuleSyntax:45`, `wrapModule:55`, `QUEUE_META:127`, `QUEUE_ENTRY:185`, `bundles:448` | `build-runtime.mjs` — all exact |
| `AT19_SEAM_NAMES:215` (consumed `:427`), `AWAIT_SCAN_SOURCES:1040` (consumed `:1054`), `RLH-SCAN-01:626` | `__tests__/runtimeBundle.test.js` — all exact; neither set carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today |
| §9.1 erratum 2: `BUNDLES` at `runtimeBundle.test.js:26`, consumed at `:503`, `:509`, `:549`, `:1044`, `:1290`, `:1584` | **all six exact.** `:1584` reads `const ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]` — the erratum is real and correctly measured |
| §9.1 erratum 3: `CLAUDE.md:58-60` names three artifacts and `:62` closes "Those three are the tracked, shipped outputs" | exact |
| §9.1 erratum 1: `__tests__/skillFiles.test.js:13-17` hard-codes `se-review`/`te-review`/`pm-review` and asserts VERDICT-trailer text only | exact — the two `SKILL.md` edits genuinely have no oracle |
| Hook landing sites: `PY_BIN` probe `:13-20`, `THRESHOLD = 5` `:25`, `CLAUDE_PROJECT_DIR` `:26`, glob `:28`, early `sys.exit(0)` `:29-30`, predicate `:41`, `n >= THRESHOLD` `:43`, output `:47-48` | `nudge-consolidation.sh` — all exact, including the probe's silent `exit 0` |
| T07/T08 landing sites: `consolidate-learnings/SKILL.md:35` (Date Completed boundary), `:41` (`DECISIONS-{topic}.md` route); `harvest-learnings/SKILL.md:77` (`Harvested from`) inside the `:70-78` table | all exact |
| §2's wave-gate citation `orchestrate-dev.js:10136-10143`, the V-wave repeat at `:10225-10234`, the pathspec-scoped stage at `:10151` | exact |
| `.claude/pdlc.config.json` is untracked (`git ls-files .claude` empty) and carries the three `implementation.*` keys T00 asserts | exact — the branch-on-presence gate is justified, not defensive padding |
| Shipped doubles: `seams.js` `fakeFs:243`, `fakeListFiles:132`, `fakeGit:389`, `LIST_FAILURE_VALUES:58`; `mergeDoubles.js` `matchKey:45`, `fakeGhRun:75`, `passingGh:163`, `GH_SURFACE_NAMES:181`, `FIXED_NOW_MS:256`, `fakeNow:259`; `advisoryDoubles.js` `makeAgentDouble:53`; `driftGenerators.js` `seeded:76`, `resolveSeed:134` | all exact |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` `Version` cell reads `1.4 · 2026-08-06` at `:7` | exact |
| `.gitignore`'s trailing `/.claude/workflows/` entry and its anchoring comment block | present; T10's gitignore(5) reasoning is correct |
| `pdlc/workflows/consolidate-learnings.js` and `__tests__/helpers/consolidationDoubles.js` do not exist | correct — both are declared **(new)** by T02 and T01 |

That is an unusually high hit rate and it is worth saying plainly. The findings below are the
places where re-measurement **disagreed** with the document.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Local | **Three FSPEC register ids carry no task in §4, and two of them are the sole oracle for an acceptance criterion's negative half.** `grep -c` over the PLAN returns **0** for `AT-M11`, **0** for `AT-Q13`, **0** for `AT-R7`. All three are register rows in FSPEC v11.3 §13 (`AT-M11` at `:2085`, `AT-R7` at `:2106`, `AT-Q13` at `:2126`) and all three are traced to an AC by FSPEC §15 (`AC-1.3 → …, AT-M11, …` at `:2311`; `AC-1.4 → …, AT-R7` at `:2312`; `AC-3.2 → AT-Q2, AT-Q13` at `:2320`). The PLAN's other register ids are covered by the range notation in T14–T24 (`AT-F6 … AT-F18`, `AT-A1 … AT-A7`, `AT-C2 … AT-C8`, `AT-K1 … AT-K7`, `AT-L1 … AT-L5`, `AT-N1 … AT-N4`, `AT-R1 … AT-R5`, `AT-M1 … AT-M6`), so these three are not a notation artefact — they are absent. Product consequence, per AC: AC-1.3's mutual exclusion ships with its **released-marker-is-free** arm unfalsified (AT-M11 is FSPEC's explicitly named *paired negative* for AT-M3 — "without the pair, an implementation that recorded `reclaimed-stale-lock` on every take passes this row", `:2084`); AC-3.2's PR **body** obligations ship with only AT-Q2's trailer oracle, which FSPEC `:2126` states is green on a body carrying nothing but three trailers; AC-1.4's "and only when" negative half ships with no proposal-file negative control. §4's own preamble claims the `Batch` column *is* the decomposition and that the table answers coverage on its own — it does not, for these three. | AC-1.3, AC-1.4, AC-3.2 |
| F-02 | **High** | Local | **The PLAN transcribes FSPEC at v11.1 and asserts two "(no FSPEC AT)" facts that FSPEC v11.3 has since falsified.** T21 (`:191`) declares "the two **(no FSPEC AT)** cases §12.2 records — AC-3.2's three PR-body citations … and FSPEC §5.3's 'and only when' negative". FSPEC is at **v11.3** (`:14`) and its own erratum note says so in terms: "(4) AC-3.2's body obligation gains **AT-Q13**. (5) §5.3's 'only when' negative half gains **AT-R7**" (`:19-20`). So both cases now carry register ids, and both are cited by FSPEC §15's traceability table. Two consequences, and the second is the serious one. (a) The PLAN mis-describes upstream content — a reviewer or implementer reading T21 will believe no register id exists and will not look for one. (b) It makes the PLAN **self-contradictory against its own gate**: T05 (`:176`) specifies a test that parses the FSPEC register and TSPEC §12.3's table and asserts "**set equality in both directions** — every register id has exactly one file, no file claims an id the register does not carry". With three register ids unrepresented, T05 as specified cannot be green on a correct tree, so the PLAN ships a task whose stated oracle contradicts the PLAN's own task rows. (Root cause is upstream in TSPEC §12.3 — see §5 — but the PLAN derives from FSPEC directly and asserts these facts in its own voice.) | AC-1.4, AC-3.2 |
| F-03 | **Medium** | Local | **The register count is hard-coded at a stale value and is a Definition-of-Done checkbox.** T05 (`:176`) closes "the register measured **96** ids at FSPEC v11.1 and the count is asserted, not assumed", and §8.3 (`:411-412`) makes it mechanical DoD: "reports set equality in both directions over the FSPEC register's **96** ids". Measured now, enumerating `AT-…` tokens over FSPEC §13's register range (`:2041-2191`) and de-duplicating exactly as T05 specifies, the register carries **99** ids. FSPEC is at v11.3, not v11.1. A hard-coded count is the right instinct — it is what stops a silently shrinking register — but a stale one converts that guard into a task that is red on arrival, and a DoD checkbox that cannot be ticked. The count must be re-measured against the FSPEC version this PLAN is actually derived from, and the version named beside it. | AC-5.x (falsifiability) |
| F-04 | **Medium** | Local | **§1's second coverage claim is false as measured, in a document whose method is measurement.** §1 (`:48-50`) states: "Two coverage claims checked against the current suite layout, not assumed. (a) `pdlc/workflows/__tests__/` holds **74** `*.test.js` files at HEAD and **none** is named `consolidation*`." Re-measured: `git ls-files 'pdlc/workflows/__tests__/*.test.js' \| wc -l` returns **83** (83 on disk too; nothing untracked in that directory). The load-bearing half is true and I confirmed it — zero files match `consolidation*`, so all fifteen suites really are new with no merge hazard. But the number is presented as a measurement under a heading that says "not assumed", and it is wrong by nine. The whole PLAN asks the reader to trust roughly forty measured citations on the strength of that posture; one demonstrably unperformed measurement forces the reader to re-run all of them (I did — the rest held). Either re-measure it or drop the count and keep the claim that carries weight. | — (method) |
| F-05 | **Medium** | Cross-Feature | **`DC-07` is cited twice as the justification for a design decision, and this repo's DC-07 is a different constraint.** T25 (`:206`) closes "a test reaching for it re-introduces the DC-07 hazard this task removes", and §6.3 item 1 (`:328-331`) repeats "the DC-07 hazard the `git ls-files` enumeration exists to remove". `docs/_constraints/DOMAIN-CONSTRAINTS.md:184` defines **DC-07 as "Work that skips a pipeline phase inherits zero review coverage"** — unrelated to `_listFiles`, directory walks, or `fakeListFiles` being more capable than the seam it doubles. That file's own header caveat (`:11-16`) records exactly this collision: several `pdlc` skill prompts cite "DC-07 / DC-08 / DC-09" meaning a **different consuming repo's** constraint file, and says disambiguation is proposed but unlanded. The PLAN's `DC-04` citations (T05, T24, §8.1) are correct against `:122`, which shows the author is reading this file — so the DC-07 cite reads as an inherited mis-citation rather than a private convention. The product cost is that the rule justifying T25's central design choice (enumerate by `git ls-files`, never walk) is unverifiable at the id it names. Either cite the correct id, or state the hazard directly in the row and drop the id. | AC-1.1, AC-1.2 |
| F-06 | Low | Local | **§8.3's artifact-count checkbox contradicts the shipped vocabulary and §9.4.** §8.3 (`:404-406`) requires "`pdlc/workflows/dist/` carries **four** bundles plus `distribution-manifest.json`". After T32, `dist/` holds three `*.bundle.js` files, plus `pdlc-cli.mjs`, plus the manifest — and the shipped suite keeps those categories apart: `runtimeBundle.test.js:1584` reads `const ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`, i.e. the CLI is explicitly **not** a bundle. §9.4 (`:504`) likewise says "a partial rebuild of the **four** `dist/` artifacts", while T32 (`:213`) lists five (one new plus four re-stamped). The counts should be stated once, in the shipped vocabulary, so the checkbox is mechanically tickable. | — |
| F-07 | Low | Local | **Two BL-PREREQ citations are incomplete.** §3's table (`:135`) names six `mergeDoubles.js` symbols — `fakeGhRun`, `matchKey`, `fakeNow`, `FIXED_NOW_MS`, `fakeSleep`, `GH_SURFACE_NAMES` — and supplies **five** line numbers (`:75`, `:45`, `:259`, `:256`, `:181`); `fakeSleep` (`:258`) has none, so the row cannot be checked member-by-member the way every other row can. Separately, T01 (`:172`) cites `pdlc/workflows/package.json:18-21` for `testPathIgnorePatterns`; the key is at `:18` and its members run `:19-21`, closing at `:22`. Both are cosmetic against a document this precise, and both are the kind of drift the next reviewer will otherwise re-measure. | — |

## 3. Questions

## 4. Positive Observations

## 5. Errata raised against upstream documents

## Verdict
