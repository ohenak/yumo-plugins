# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** Delta re-review. Round 2's two findings (F-14 High, F-15 Medium) re-checked against the
revision, and only the sections the diff touched scanned for new defects. Sections unchanged since
v1.1 — the batch DAG, §4's ownership manifest, §2, §3's untouched rows, §7 — are not re-derived.
Testing lens only.

## Delta method

`git diff fe5caed7 HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` — 134 insertions,
60 deletions across §0 (changelog), §3 (T11, T17, T42), §5 (batch-5 gate, operator step, new
batch-number note), §6 (parser rule), §8 (suite gates, `testCommand`, coverage floor, M-ENG-09 item),
§9 (AC-1.5 row, C-9 note, sub-table title), §10 (risk row, O-ENG-T1/T4/T5) and §11 (V5, CI citation
convention, CI table, operator command, closing paragraph). Seven commits, one per section
(`1e339e86`…`06f5702a`). Every factual claim the revision newly makes was re-measured against HEAD,
not read back from the document.

## Round-2 findings: resolution

| ID | v2 severity | Status | Evidence, re-measured at HEAD |
|---|---|---|---|
| F-14 | High | **Resolved** | The two-platform reading is gone from every place that carried it, and gone in the direction that keeps the obligation rather than the direction that drops it. `pr-tests.yml:40` is `os: [ubuntu-latest]` and `410f3a07` ("ci: drop macos-latest from the unit-test matrix", Sun 2 Aug 2026) is real — I confirmed both. T17 (`:158`) now says "the matrix that exists at HEAD — `os: [ubuntu-latest]`, node 20" and states that this feature does not reverse `410f3a07`. T42 (`:183`), §5's operator step (`:317-323`), §8's DoD item (`:568-575`), §9's C-9 note, §10's risk row and O-ENG-T1/T4/T5, and §11's CI table plus its closing paragraph (`:798-803`) all restate the obligation as **one row per `process.platform` on which the hermetic suite actually runs** — CI's `linux` plus the wave host's, `darwin` when waves run on the maintainer's Mac. That is the right axis: it is what T29 keys on (`:170`, "no row for the running platform ⇒ hermetic suite **fails**"), and a matrix entry was never the thing the gate reads. The three consequences I named are each answered: the DoD item is now satisfiable (`:573`, "one row suffices when wave host and CI platform coincide"; `:575`, "no `macos-latest` row is required"); no task re-adds `macos-latest`, so no undeclared reversal of `410f3a07` lands inside this branch; and the pairing is now correct rather than accidentally correct — §5 names the *`linux`* row as the operator step when the wave host is a Mac, which is the row CI actually observes. `grep -n 'macos' PLAN` returns nine hits, all of them either changelog, the citation of `410f3a07`, or an explicit statement that macOS is **not** required |
| F-15 | Medium | **Resolved, with one residue** | V5 is now `cd pdlc/engine && npm test -- --experimental-test-coverage` (`:736`), through `scripts.test`, and §8's coverage item (`:541-547`) says why a bare `node --test __tests__/` would measure a red, non-hermetic run — no run id, no `--import=./__tests__/_bootstrap.mjs`, no observation records, DEC-ENG-10's suite-wide step skipped. The contradiction with §8's "one spelling in `scripts.test`" item is gone. T11's row (`:151`) carries the forwarding obligation explicitly *and* an oracle for it ("a test asserts a forwarded flag reaches the child's argv"), which is the right instinct — the plan does not leave the mechanism the DoD depends on to chance. The residue is that the oracle is presence-shaped where the behaviour is position-shaped; new F-16, Medium, not gating. My Q-03 is answered by the same row |
| Q-01, Q-02 | — | **Answered in the document** | §5 (`:317-323`) and O-ENG-T4 (`:709`) answer Q-01 (macOS is not re-added; the two-row obligation collapses onto runtime platforms) and Q-02 (`darwin` for a Mac wave host, `linux` for CI, and the coincident case named). Neither answer is prose-only: each has the DoD item or the T29 predicate behind it |
| Q-05 | — | **Answered** | §9's sub-table is retitled "Acceptance tests FSPEC §14.1's AC rows do not claim as members", with AT-ENG-57's parenthetical membership called out in the sentence below it. The predicate is now true of all eight rows |

## Checks re-run at HEAD

| Check | Method | Result |
|---|---|---|
| CI matrix, the fact F-14 turned on | `sed -n '36,41p' .github/workflows/pr-tests.yml` | `os: [ubuntu-latest]` at `:40`, `node: ['20']` at `:41`. The stale comment at `:37-39` still describes both platforms — a comment, not a matrix, and now the plan reads the matrix |
| `410f3a07` provenance | `git log -1 --format='%h %ad %s' 410f3a07` | `Sun Aug 2 23:55:23 2026`, "ci: drop macos-latest from the unit-test matrix" — nine days before this plan, as the plan says |
| §11's re-cited CI lines, new `run:`-line convention | opened each in `pr-tests.yml` | all seven exact: `build-runtime.mjs --check` `:93`, rebuild-no-diff `:99`, fresh-clone build `:127`, `sync-workflows.sh` `:133`, `--check` `:148`, `bash -n` `:172`, executable-bit `:188`. Job lines `:27`, `:77`, `:103`, `:161` unchanged and correct. The stated convention ("the `run:` line that carries the command, not the `- name:` line") holds down the whole column — I checked each against its own `- name:` predecessor |
| `testCommand` set-equality, all four patterns | `.claude/pdlc.config.json:3` | HEAD's value is `cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`. §8's and §11's post-change literals are that string, token for token, with the engine suite prepended. `'documentOracles'` present in both |
| The coverage command actually produces a coverage table | ran both spellings on node v20.20.1 against a scratch suite | `node --test --experimental-test-coverage __tests__/` prints the coverage report. `node --test __tests__/ --experimental-test-coverage` exits non-zero with `Could not find '…/--experimental-test-coverage'` — the flag is positional-sensitive. This is what F-16 is about |
| `scripts.test` at HEAD | `pdlc/engine/package.json:13` | `node --test __tests__/` — exactly as §11's V1 row and §8's coverage item state; no coverage flag, as claimed |
| AC-1.5's cited observables | `pdlc/engine/lib/run.mjs:58`, `__tests__/run.test.js` | `workflowModulePath` is at `:58` with the AC-1.5 evidence comment at `:57`; the `:48` and `:64` assertions the T10/AC-1.5 cells name are present. §9's new "no red task" cell is therefore accurate, not a convenience |
| Test files named as **new** in §3 | `ls pdlc/engine/__tests__/` | nine files exist (`adapter`, `cli`, `handshake`, `report`, `run`, `skills`, `smoke`, `startup`, `transport`). Every §3 row whose test file is outside that set carries a red-task or **new** marker — `ci-arrangement`, `fixtures-redaction`, `suite-spine`, `hermeticity`, `outcome`, `catalogue`, `auth`, `transport-cli`, `m-eng-09`, `assert-suite-wide` are all absent at HEAD and all declared |
| §5's new batch-number note | `computeWaves` at `orchestrate-dev.js:8411-8441` | correct in substance: with an ownership manifest the runtime iterates `topologicalReadySets` and splits each ready-set into ownership-disjoint groups via `pathsCollide`, so waves ≥ batches and an operator should match a stopped wave to a task id. See Q-02 for the one word that overstates it |
| §6's parser rule | `parsePlanTasks` at `orchestrate-dev.js:3730`, header logic `:3766-3771` | the two-cell rule as now stated is the parser's actual rule: an exact id cell **and** an exact deps cell, both required, exact-cell not substring. Stating the rule rather than enumerating tables is the more durable form |
| §6's enumeration of confusable tables | grepped this PLAN's own table headers | §3 `:139` (`# … Deps`), §7 `:448`, §10 `:699`, §11 `:730`, §4 `:202`, plus the two new changelog tables (`Change | Findings`) and §9's `AC …` / `AT …` tables. Only §3 has a deps cell. One quoted header is misquoted — F-17, Low |
| Upstream drift | `grep -n 'macos' TSPEC` | TSPEC still carries the false two-platform claim at `:1786`, `:1793` and `:1952-1955`. The PLAN's divergence is deliberate and stated; the TSPEC text is not fixed. Erratum re-emitted |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
