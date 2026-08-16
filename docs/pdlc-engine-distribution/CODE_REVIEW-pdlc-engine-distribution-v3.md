# CODE REVIEW — pdlc-engine-distribution (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 3 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`) |
| Requirements traced | 28/30 |

**Scope: delta re-verification.** This round does **not** re-scan what v1 and v2 already
verified. It re-verifies v2's four findings against the three remediation commits
`ab702318`, `fb9e1220`, `14607046` (6 files, +130/−12), then scans **only that diff** for
new stubs, mock data, unwired integrations and integration-boundary gaps. §2 is carried
forward from v2 unchanged.

Suites executed this round: `pdlc/engine` — **825 tests, 0 fail, 2 skipped** (the two
`PDLC_LIVE=1` opt-ins), up from 819 by the six new subtests in `ci-arrangement.test.js`.
`pdlc/workflows` — **4524 pass, 1 fail, 70 skipped**. The single workflows failure is
`documentOracles.test.js:246`, the same local-environment false positive v1 and v2 named,
re-confirmed mechanically this round: `coveredViolations(repoRoot)` returns 27 entries and
**zero of them are tracked** (`git ls-files --error-unmatch` fails for all 27); every path
lies under `.claude/worktrees/`, `.serena/cache/` or `.tokensave/`. Not a defect.

---

## §1 Code Quality Findings

*(Empty — criteria 1–4 are clean on the remediation diff.)*

The diff adds no `TODO`/`FIXME`/`HACK`/`NotImplementedError`/"not implemented" marker, no
`mock*`/`fake*`/`dummy*`/`placeholder` identifier, no hardcoded sample data and no
placeholder URL — verified by pattern scan over the non-doc half of the diff, which returned
empty. The only production-code change in the round is `pdlc/workflows/package.json`'s
`test:coverage` script; the rest is `CLAUDE.md`, `PROPERTIES`, and three test files. No
unwired integration: the added `c8 report` stage is invoked by the script CI already runs
(`pr-tests.yml:81`, `publish.yml:61`), and it is not a dead second copy of stage 1 — it
re-reports stage 1's own V8 coverage data.

v2's §1-1 (the coverage gate was global-aggregate, so the declared floor was not the
enforced floor) is closed and the enforced floor now binds per module: re-measured this
round, `build-runtime.mjs` 86.52%, `orchestrate-dev.js` 88.19%, `orchestrate-queue.js`
91.21% branch — all ≥85%, so criterion 4 passes on the numbers **and** on the gate.

---

## §1a Disposition of v2's findings

| v2 finding | Severity | Commit | Verified remediated? | Evidence |
|---|---|---|---|---|
| §1-1 — `c8` thresholds are global-aggregate; `--per-file` exits 1, so the declared floor is not the enforced floor | medium | `fb9e1220` | **Yes** | `test:coverage` is now two stages: `c8 npm test && c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0`. Stage 2 executed directly against stage 1's coverage data this round: **exit 0**, three modules reported, lowest branch 86.52%. Stage 1's aggregate declaration is untouched (`c8.check-coverage` still `true`, 90% lines/functions/statements), so nothing was weakened to fit the code — the non-branch numbers are passed `0` in stage 2 precisely to avoid lowering the declared 90 to `orchestrate-queue.js`'s 77.46% functions, and the `//c8-per-file` key records that reasoning. Guarded by three new tests in `coverageInstrumentation.test.js`. **Mutation-tested:** deleting the ` && c8 report …` clause turns all three **RED** (`--per-file` absent; no branch floor found; `stages.length` 1 < 2). |
| §3-1 — `PROPERTIES` PROP-PUB-1 still cites §5.1's retired **five-row** set | medium | `ab702318` | **Yes** | PROP-PUB-1's premise is now **count-free** — "the whole set as §5.1's table stands, whatever its row count" — which is the stronger of the two fixes v2 offered: a further widening cannot re-open this defect, so the absence of a CI guard over this prose no longer matters. The remediator also swept a second citation v2 did not name: PROP-GATE-5 said the fixture-machine job names are "deliberately outside FSPEC §5.1's frozen set", which row 6 made false; it now names row 6 explicitly while preserving the discrimination against PROP-PUB-6 (whose set-equalities range over `pr-tests.yml`'s rows alone). Doc version bumped 0.6 → 0.7 with a changelog row. Verified no property was added, removed or re-scoped and no oracle/carrier/trace cell moved — the diff is two table cells plus the changelog. One low residual, §3-4 below. |
| §3-2 — `CLAUDE.md`'s CI section describes four checks over one file; the gate is six across two | medium | `14607046` | **Yes** | The section now names both PR-gate files, states the membership rule by `on:` trigger, carries **six** rows, and adds the `Engine tests` row that was missing since `f5ce04dc`. It is no longer transcribed prose: the new `ci-arrangement.test.js` test derives the expected rows from `EXPECTED_RENDERED_BY_JOB` and the file list from `PR_GATE_FILES`, asserting set-equality of the table's first column, the count word, and the presence of every PR-gate filename. **Mutation-tested:** deleting the `Fixture machine …` row turns "its check table set-equals §5.1's rendered column" **RED** with the intended message. The `Unit tests` row was also correctly swept for `fb9e1220`'s two-stage change ("declared floor enforced in aggregate and branch ≥85% enforced per module"). |
| §3-3 — stale "five §5.1" prose at `publish-channel.test.js:52` and `ci-arrangement.test.js:250` | low | `14607046` | **Yes, at both named locations** | Both strings are reworded and neither now carries a row count; `ci-arrangement.test.js:283` additionally names row 6 and points at the cross-file test. The **family sweep behind the finding was incomplete**, however — the identical sentence survives in production code. That is not an unremediated instance of §3-3 (it was not a named location) but a new finding of the same class: §3-1 below. |

All four v2 findings are remediated. Two of the three code-affecting fixes are guarded by
oracles I mutation-tested RED; the third (PROP-PUB-1) is unguarded by construction but
self-immunising, since the fix removed the count the guard would have had to check. None
of the remediation rests on an assertion-free or stub-backed test.

---

## §2 Requirements Traceability

Carried forward from v2 unchanged. The remediation diff touches no implementation path and
no requirement-bearing test, so no row moved. 27 rows not re-scanned this round; the three
v2 highlighted are restated for continuity.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 14 | REQ AC-3.4 | Check-name set-equality; red if a member is renamed, added or removed | `.github/workflows/pr-tests.yml`, `fixture-machine.yml`; FSPEC §5.1 rows 1–6 | `ci-arrangement.test.js` (file-scope derivation, per-file job sets, union alphabet, rename falsifiers, and now the `CLAUDE.md` citation) | **No** | — | — |
| 21 | REQ AC-4.4 | Anti-echo: the oracle fails on changes **and** on reverts | `lib/handshake.mjs`'s `readPluginVersion` | `version-doctor.test.js:359` covers the *change* half only; the **revert** half rests on `EVIDENCE-AT-4.4.md`, a one-time observation with no regression guard | **YES** | medium | Local |
| 30 | REQ AC-6.2 | Workflow-root resolution, both halves | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; the bundle-side run-bound half rests on `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 21 and 30 remain **spec-acknowledged** deferrals (PLAN §2 records AT-4.4 as a one-time
observation; TSPEC §7.3 records the same for AC-6.2's second half). No remediation was
dispatched for them and none was expected. Traced: 28/30.

---

## §3 Integration-Boundary Findings (criterion 6, scanned over the remediation diff only)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Sibling omission | low | `pdlc/engine/scripts/publish-preflight.mjs:113` | v2 §3-3's sweep reworded the "five §5.1 gate jobs" sentence in two **test** files but left the identical sentence in **production code**: `// The five §5.1 gate jobs' combined result (re-run at the tag, §8.2).` sits directly above the `gateConclusion !== "success"` branch that consumes the gate verdict. This is the same family (`grep -rn "five §5.1"`), and it is the member with the widest blast radius: it is shipped in the npm package, so a reader of the engine channel alone is told the gate has five members when it has six. The comment sits on the served path — the preflight's first refusal — not in dead prose. | Reword to match the two already-swept siblings: "the §5.1 gate jobs' combined result", with no row count. Then re-run the family grep across `pdlc/engine/**` and `.github/workflows/**`, not only the two files v2 named. | Local |
| 2 | Adjacent-surface falsification | low | `.github/workflows/pr-tests.yml:76-80` | `fb9e1220` made `test:coverage` a two-stage script, but the comment above the step that runs it still describes the retired one-stage shape: "`test:coverage` is `c8 npm test`: the same suite, plus the check-coverage floor **declared in pdlc/workflows/package.json**". Both halves are now false — it is `c8 npm test && c8 report --per-file …`, and the per-module branch floor that makes DoD criterion 4 enforceable is declared in the **script**, not in the `c8` block. The comment is the CI-side explanation of why the step is a gate rather than a report, so a maintainer reading it will not learn that the per-file stage exists and may delete it as redundant. `CLAUDE.md`'s parallel description **was** swept in the very next commit (`14607046`), which is what makes this a partial sweep rather than an untouched surface. | Restate both stages in the comment, matching `CLAUDE.md:110`'s wording ("the declared floor enforced in aggregate and branch ≥85% enforced per module"). | Local |
| 3 | Adjacent-surface falsification | low | `pdlc/engine/__tests__/ci-arrangement.test.js:296-300` | The same falsified sentence, in the comment justifying the assertion that `unit-tests` must run `npm run test:coverage`: "`test:coverage` is `c8 npm test` with a check-coverage floor declared in pdlc/workflows/package.json". The assertion itself is correct and still binds — only the prose is stale. Same family as §3-2; listed separately because it is a second file and the family grep (`test:coverage`) must reach both. | Same reword. | Local |
| 4 | Adjacent-surface falsification | low | `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md:231` (PROP-GATE-5) | `ab702318` fixed PROP-GATE-5's body but not its **bold lead-in**, which still reads "…and its job names stay outside the frozen set." The body immediately below now says the opposite in §5.1's vocabulary ("its rendered name is FSPEC §5.1's row 6"), reconciling the two only by silently redefining "the frozen set" as PROP-PUB-6's `pr-tests.yml`-scoped set. A reader who takes the lead-in at face value reads the property as self-contradictory. | Scope the lead-in explicitly: "…and its job names stay outside **PROP-PUB-6's `pr-tests.yml`-scoped** set." | Local |

**Deferral binding: clean, unchanged.** The remediation introduces no new deferral. The
`//c8-per-file` key in `package.json` reads like one but is not: it explains a decision
already taken (non-branch floors deliberately not enforced per file, because doing so would
mean lowering the declared 90 to fit `orchestrate-queue.js`'s 77.46% functions) and names no
future work. v1's three bound deferrals (N-1 → `pdlc-plugin-retirement` queue row 5; D-DIST-06
→ `pdlc-release-ci` row 8; D-DIST-07 → `pdlc-engineering-loop` row 6) are untouched and still
bound.

**Sibling sweep performed this round:** `grep -rn "five §5.1|§5.1's five|five gate jobs|
five-row|Four checks"` over all tracked `*.md`/`*.js`/`*.mjs`/`*.yml`/`*.json`, and
`grep -rn "test:coverage"` over the same set. The first found §3-1; the second found §3-2
and §3-3. Every other hit is unrelated (the advisory tier's "five rows", the five-member
seam sets in `commit-sites.test.js` and `provenance-path.test.js`, `outcome.test.js`'s "four
typed classes" — none cite FSPEC §5.1's gate table).

---

## Notes for the remediator

- **All four findings are one-line prose edits in four files.** None changes an assertion, a
  workflow behaviour or a shipped byte other than a comment. They can be landed in a single
  commit.
- **§3-1 is the one worth doing first.** It is in production code and ships in the npm
  package; the other three are repo-internal comments and one spec lead-in.
- **The two families are `"five §5.1"` and `"test:coverage"`.** Run both greps after editing
  rather than fixing the four named lines — that is exactly the step whose omission produced
  §3-1 from v2 §3-3, and §3-2/§3-3 from `fb9e1220`.
- **Do not "fix" the `documentOracles.test.js:246` failure in code.** Re-confirmed
  mechanically this round: 27 violations, zero tracked. Remove the untracked `.serena/`,
  `.tokensave/` and `.claude/worktrees/` trees, or read the result in CI, and it is green.
- **Not a finding, but flag it for Phase H:** `ab702318` moved `PROPERTIES`' bytes after its
  cross-reviews were approved, so the `APPROVAL-HASH` anchors in
  `CROSS-REVIEW-{product-manager,software-engineer,test-engineer}-PROPERTIES-v*.md` now pin
  bytes that are no longer at HEAD. The anchors are not falsified — each still truthfully
  records what its reviewer approved — and harvest copies them verbatim without recomputing.
  It is noted only so the Approval Record in `LEARNINGS` is read as a historical pin, not a
  claim about HEAD.
- **Nothing in this round contradicts v1's or v2's assessment of rows 21 and 30.** They are
  spec-acknowledged; no fix is expected from you.
