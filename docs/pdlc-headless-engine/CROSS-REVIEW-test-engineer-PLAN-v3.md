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

No High findings. Both round-2 findings are closed, and nothing in the changed sections introduces a
new blocking defect.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-16 | Medium | Local | **T11's forwarding oracle is presence-shaped where the behaviour is position-shaped, and the coverage flag only works in one position.** §8's coverage item and §11's V5 now both depend on T11's runner forwarding `--experimental-test-coverage` to the spawned `node --test`. On node v20.20.1 I ran both spellings: `node --test --experimental-test-coverage __tests__/` prints the coverage report, while `node --test __tests__/ --experimental-test-coverage` exits non-zero with `Could not find '/…/--experimental-test-coverage'` — node treats a flag after the path list as another path. So "forwards its own unrecognised arguments through to the spawned `node --test`" (T11, `:151`) is satisfiable by an implementation that appends them, and an appending implementation makes V5 unrunnable. T11's stated oracle — "a test asserts a forwarded flag reaches the child's argv" — is *containment over argv*, which an appending implementation passes. Two changes make the plan carry its own weight here: (a) T11's row should say **where** — forwarded node flags go in the node-option position, before `--test`, ahead of the path list; (b) the asserted oracle should pin position, not presence: the spawned argv is exactly `['--test', '--experimental-test-coverage', '--import=./__tests__/_bootstrap.mjs', '__tests__/']` or equivalently the forwarded flag's index is less than the index of `__tests__/`. Set-equality over the child argv would be stronger still and is cheap here, since the runner controls the whole vector. Not gating: the failure mode is loud (node exits non-zero naming the flag as a missing path), so no coverage number is read off a broken run — but a DoD item whose command errors is a DoD item that gets loosened at 2 a.m., and the fix is one clause plus a stronger assertion in a task that is already being written | §3 T11; §8 coverage item; §11 V5 |
| F-17 | Low | Local | **§6 misquotes one of the four table headers it names, in the same document that contains it.** §6 (`:124-127`) lists §10's open questions as `# \| Question \| Disposition here`; the actual header at `:699` is `# \| Question \| Disposition`. §7's (`:448`) and §11's (`:730`) quoted headers are exact, and §4's (`:202`) is exact. The parse-safety argument does not depend on the quotation — §6 now states the two-cell rule as the rule, which is why this is Low rather than Medium — but a header quoted inexactly is the kind of thing a future editor "corrects" in the wrong direction, and the whole point of the exact-cell grammar is that spelling is load-bearing. Either quote `Disposition` or drop the parenthetical header quotations and cite section numbers | §6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-16: does the runner forward *all* unrecognised arguments, or only a named allow-list? Blanket forwarding into the node-option position means a typo'd flag becomes a node startup error rather than a test failure, which is fine, but a stray `--test-name-pattern` would silently narrow the suite and the run would still be green with fewer tests. If forwarding is blanket, the suite-spine test is the natural place to assert that the observation set is non-empty *and* that the run covered every test file — which T01/T19 arguably already give you. Worth one sentence either way. |
| Q-02 | §5's new batch note says the runtime "**will** run more waves than eleven". `computeWaves` (`orchestrate-dev.js:8422-8441`) splits each ready-set only when `pathsCollide` fires, so the count is ≥ eleven, and strictly greater only if some ready-set has an internal ownership collision. Given §4's manifest that is very likely true, but "will" states a certainty the mechanism does not guarantee — "may run more waves, never fewer" is both weaker and true, and it is the shape an operator needs anyway. |
| Q-03 | On the coverage floor's arithmetic rather than its command: `--experimental-test-coverage` reports over files the run loads, and the four named modules (`lib/outcome.mjs`, `lib/catalogue.mjs`, `lib/auth.mjs`, `lib/transport-cli.mjs`) are each loaded by their own test file. Is the floor read per-module from that table, or over the whole `lib/` aggregate? A whole-suite aggregate can sit above 85 % while `lib/transport-cli.mjs` — the fallback transport, the least-exercised module in the set — sits below it. §8 says "over the four new modules", which reads per-module to me; making that explicit ("each of the four, not their aggregate") would close the cheapest way to satisfy the item without meeting it. |
| Q-04 | Carried from round 2, still open (not gating, and not re-litigated in the findings table): T04's totality property generates "arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes)". Is that corpus pinned anywhere — a shared `throwables` fixture, say — or left to each implementer? A hand-rolled generator that only produces `Error` instances passes the property while proving nothing, and the property's whole value is in the corpus's weirdness. |

## Positive Observations

- **F-14 was fixed on the correct axis, which was the harder of the two available fixes.** The cheap
  repair was to delete "macos-latest" from four places and leave the obligation vaguely
  per-platform. Instead the revision noticed that T29 keys on `process.platform` — a runtime fact —
  and rebuilt the obligation on that axis: one row per platform that *runs the suite*, CI's `linux`
  plus the wave host's, with the coincident case ("one row discharges the obligation and there is no
  operator step") named. That is a stronger statement than the two-platform version it replaces,
  because it is now true of a contributor's machine too, which is where O-ENG-T5 actually bites.
- **The `410f3a07` citation is load-bearing rather than decorative.** T17 does not merely match HEAD's
  matrix; it says re-adding macOS "would reverse a standing decision on a repo-wide file, in the same
  PR, for a reason no AC states" (`:798-801`). That is the right frame for a repo-wide file, and it is
  the same blast-radius argument the `testCommand` item makes — the plan now applies one principle
  consistently to both repo-wide files it touches.
- **`'documentOracles'` is argued in both directions.** §11 (`:284-291`) does not just restore the
  fourth pattern; it explains that dropping it would re-admit CWD- and untracked-file-sensitive
  oracles to *other* features' wave gates, "the same repo-wide blast radius … arriving through a
  dropped token instead of a dropped suite". Set-equality over the pattern list, with a reason a
  future editor can check rather than a rule they must trust.
- **The V5 fix carries its own mechanism instead of assuming it.** The weak version of the F-15 repair
  was to respell V5 and hope `npm test --` forwards. Instead T11 gained the forwarding obligation
  *and* an assertion for it, and §8 states the failure mode being avoided (no run id, no bootstrap, no
  records, no suite-wide step). F-16 is a refinement of that assertion's shape, not a disagreement
  with the approach — the plan already put the test in the right place.
- **§6 replaced an enumeration with a rule.** "The rule, stated once so it does not depend on an
  enumeration staying total" is exactly the right instinct for a parse-safety argument, and the
  operative sentence is framed as a constraint on future edits ("adding a `Deps`- … spelled column to
  any of them would … break the Phase-P self-parse") rather than a property of today's text. That is
  the version that survives the next section someone adds.
- **§9's AC-1.5 cell now states the absence and its reason in the same cell.** "— (no red task:
  clause (a)'s observable already exists at `run.mjs:58`…)" is checkable in one hop — I checked it,
  `:58` is where `workflowModulePath` lives — and it stops the row reading as a hole in the red
  column.
- **§5's batch-number note pre-empts a real operator confusion.** Telling a reader to match a stopped
  wave to a *task id* rather than a batch number in §5 is the kind of thing normally learned during
  the incident. Modulo Q-02's one word, the mechanism is described correctly.
- **The single-platform restatement did not weaken a single gate.** I looked for this specifically:
  §8's M-ENG-09 item still fails closed on a missing row, still refuses to be met "by a row for a
  platform no job and no wave runs on", and still keeps the `denyFired: no` branch. The revision
  narrowed a false claim without narrowing an oracle, which is the failure mode I was most worried
  about when I filed F-14.

## Recommendation

**Approved with minor changes**

No High findings. F-14 is closed on the right axis and closed everywhere it appeared — nine remaining
`macos` mentions in the document are all either changelog, the `410f3a07` citation, or an explicit
statement that no macOS row is required. F-15 is closed, with one refinement left (F-16). This plan is
buildable as written: every task has a test file, the red/green split is stated per batch, the two
repo-wide files it touches are argued as set-equality, and the one step no automation can perform is
named with its command and its precondition.

Two non-gating items for the next revision or for the implementer's hand, in order of value:

1. **F-16** (Medium) — say in T11's row that forwarded node flags go in the node-option position,
   before `--test`, and make the argv assertion pin position (or set-equality over the child argv)
   rather than presence. `node --test __tests__/ --experimental-test-coverage` fails on node 20; the
   flag only works ahead of the path list, and V5 plus §8's coverage floor both depend on that.
2. **F-17** (Low) — §6 quotes §10's header as `Disposition here`; it is `Disposition` at `:699`.

Q-02's "will run more waves than eleven" → "may run more, never fewer" and Q-03's per-module vs
aggregate coverage reading are both one-clause edits and would each remove a way to satisfy a
sentence without meeting it. Q-04 remains open from round 2 and is a fair thing to settle in T04
rather than in the PLAN.

One erratum against TSPEC is emitted in the dispatch response and deliberately not folded in here:
TSPEC still carries the two-platform matrix claim this PLAN corrected.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:0a44d0521b94342423c38c57281accef204c4b605dbcd70ba71a25ade3123b3e
REVIEWED-COMMIT: 06f5702a12730f8acead077450919a43bdd43b48
