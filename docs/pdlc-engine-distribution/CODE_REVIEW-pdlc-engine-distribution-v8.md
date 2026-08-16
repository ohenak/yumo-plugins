# CODE REVIEW — pdlc-engine-distribution (v8)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 8 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`, carried from v4 — no production module changed) |
| Requirements traced | 26/30 |

**On the version number.** The dispatch named `v3`. `CODE_REVIEW-…-v1.md` through `-v7.md` are all
**tracked on this branch** (`v7` is `da5e66c1`, the current HEAD commit). Review history is
append-only, so writing `v3` would have destroyed five committed rounds. The next free integer is
`v8`. This is the fifth consecutive stale-version dispatch — v4, v5, v6 and v7 each recorded and
resolved it the same way. Scope is the delta re-verification, measured against **v7**, the actual
predecessor. The dispatch also named `v2` as the predecessor to re-verify; v2's findings were
already dispositioned in v3–v4 and are not re-opened here.

**The remediation window is empty.** `git diff da5e66c1..HEAD` is empty, and `da5e66c1` is
`dod: code review v7 pdlc-engine-distribution` — the v7 review file itself. **No remediation
commit was made in response to v7.** The working tree carries no uncommitted source change either:
`git status --porcelain` shows only three untracked local-state paths (`.serena/`,
`.claude/settings.json`, `.claude/pdlc-wave-state.json`), the same environmental noise recorded in
every prior round.

This round therefore has nothing to verify as remediated, and per the delta contract — *"any
unremediated violation in the diff means `DOD_STATUS: failed`"* — the verdict is failed on the
stronger ground that **both v7 findings survive at HEAD, byte-identical**. I re-confirmed each
against the tree rather than inferring it from the empty diff.

**Suite executed this round.** `pdlc/engine` `npm test`: **835 tests, 833 pass, 0 fail, 2 skipped**
(the two `PDLC_LIVE=1` opt-ins) — identical to v7's figure, as an empty remediation window
predicts. No new or newly-red test.

---

## §1 Prior-Finding Re-Verification

| # | v7 finding | Fix at HEAD | Verified how | Status |
|---|---|---|---|---|
| 1 | §3-1 `fixture-machine.yml:2-6` self-falsifying five-member claim; guard covers `publish.yml` only | **None** | `fixture-machine.yml:3-6` still reads "not `pr-tests.yml`, whose **five** rendered check names are BR-7.5's contract (subject to the erratum raised against TSPEC §12.1)". The file still declares `on: pull_request` (`:10-13`, path-filtered on `pdlc/engine/**`), so it *is* row 6 and the claim is still self-falsifying. BR-7.5 at HEAD (FSPEC:537-542) still says "**The exclusion reason is the trigger, not the filename** — a workflow file other than `pr-tests.yml` that declares `on: pull_request` *is* a PR gate and *is* in the set (row 6)." The settled-erratum caveat is still there. The guard still reads one file: `ci-arrangement.test.js:669` is `readText(publishWorkflowPath)`. | **Not remediated** |
| 2 | §3-2 count-word guard is vacuous under comment re-wrap | **None** | `ci-arrangement.test.js:670-673` still joins comment lines **with `#` prefixes intact**; the claim regex at `:682-683` is unchanged and single-line. Reproduced non-destructively by running the guard's own extraction and regex over `publish.yml` at HEAD in a scratch process: **1 match** (`six rendered check names`) as written, **0 matches** after re-wrapping the count word to end-of-line. The oracle still protects a byte layout, not the rule. | **Not remediated** |

**No guard-quality assessment was possible this round**, because no guard was added or changed.
The five v6-era guards verified as load-bearing in v7 are untouched and still green; I did not
re-mutate them, per delta scope.

**Criteria 1–3 on the remediation diff.** Vacuously clean — the diff is empty. There is no new
stub, no mock or seed data, no unwired integration, because there is no new production line. This
is not evidence of quality and should not be read as such.

**Criterion 4.** Nothing to measure. No production module changed since v4, so v4's floor stands
unchanged (86.52% lowest, `build-runtime.mjs`). Note this is inherited, not re-measured.

---

## §2 Requirements Traceability (carried forward from v7; nothing this round touched a criterion)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-2.1 | Documented one-command install ⇒ CLI on `PATH`, AC-1.4 triple, handshake reached | `pdlc/README.md:153-162`; `pdlc/engine/package.json@0.2.0`; bound by `QUEUE.md` row 23 + `RELEASE-CHECKLIST.md` §7 | `fixture-machine.mjs:459-507` (locally packed HEAD tarball); `version-skew.test.js`; `deferral-binding.test.js` | **YES** (bound) | medium | Local |
| 2 | REQ AC-2.2 | Documented upgrade ⇒ consumer repos execute N+1 | `pdlc/README.md:154`; same binders | `fixture-machine.mjs:510` `upgradeInstall` (local tarball) | **YES** (bound) | medium | Local |
| 3 | REQ AC-4.4 | Anti-echo: revert half | `lib/handshake.mjs` | `version-doctor.test.js:359` (change half); `EVIDENCE-AT-4.4.md` (one-time) | **YES** | medium | Local |
| 4 | REQ AC-6.2 | Bundle-side run-bound load root | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 5–30 unchanged from v4–v7 and not re-scanned, per delta-round scope. `req_gaps` stays **4**.

Rows 1–2 remain bound and undelivered; they close when `QUEUE.md` row 23 discharges and cannot
close pre-merge (C-7, PF-1). Rows 3–4 remain spec-acknowledged (PLAN §2 AT-4.4; TSPEC §7.3),
unchanged since v1. None of the four is a remediation target for this round.

---

## §3 Integration-Boundary Findings (criterion 6, delta only)

The delta is empty, so **no new** boundary finding could be introduced this round. The two below
are v7's, carried forward unremediated and re-confirmed against HEAD. They are counted in
`boundary_gaps` because they are open criterion-6 defects on the branch, not because they are new.

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Sibling omission (carried from v7 §3-1) | medium | `.github/workflows/fixture-machine.yml:3-6`; guard at `pdlc/engine/__tests__/ci-arrangement.test.js:669` | The header attributes to `pr-tests.yml` a "five rendered check names are BR-7.5's contract" claim that BR-7.5 contradicts at HEAD: membership is trigger-derived and the set has six rows. The file making the five-member claim **is row 6** — it declares `on: pull_request` at `:10`. Self-falsifying, same defect class and same family (PR-gate workflow headers) that v6 §3-1 fixed one file over. The header also still defers to "the erratum raised against TSPEC §12.1", closed by TSPEC v0.13/v0.14. | Correct `:3-6` to attribute the five-member count to `pr-tests.yml` alone and BR-7.5's contract to the trigger-derived six-member set; drop the settled-erratum caveat. Widen the count-word guard from `publishWorkflowPath` to every `PR_GATE_FILES` key plus `publish.yml`. | Local |
| 2 | Adjacent-surface falsification — guard vacuity (carried from v7 §3-2) | medium | `pdlc/engine/__tests__/ci-arrangement.test.js:670-683` | `commentText` joins comment lines with their `#` prefixes intact, and the claim regex is single-line, so a count word at end-of-line never reaches its noun across the `\n# ` boundary and the assertion finds nothing to check. Re-verified this round: 1 match at HEAD's byte layout, **0 matches** once the same true-at-HEAD comment is re-wrapped. A comment re-flow — which no reviewer reads as behavioural — disarms the oracle without a red. This is part of why finding 1 stayed invisible: the sibling is wrapped in exactly that way. | Strip the leading `#` and collapse whitespace before matching (e.g. `commentText.replace(/^\s*#\s?/gm, "").replace(/\s+/g, " ")`). Acceptance check: the re-wrap mutation must go red. | Local |

**Adjacent-surface sweep, delta.** Not re-run — an empty diff falsifies no adjacent surface. v7's
repo-wide sweep of workflow paths named in tracked `.md` files stands; its one non-existent path
(`pdlc/.github/workflows/publish.yml`) still occurs only as quoted defect text inside
`CODE_REVIEW-…-v6.md`, which is a correct historical record and must not be "fixed".

**Deferral binding.** All five stay bound and untouched: N-1 → `pdlc-plugin-retirement` (row 5),
D-DIST-06 → `pdlc-release-ci` (row 8), D-DIST-07 → `pdlc-engineering-loop` (row 6),
`halt-hardening-followups` → row 22, `engine-v0.2.0` → row 23 + `RELEASE-CHECKLIST.md` §7. No new
deferral introduced, and none could be.

---

## Notes for the remediator

1. **Nothing was remediated between v7 and this round.** If a remediation dispatch was believed to
   have run, it did not reach the branch — check for a lost worktree, an unpushed commit, or a
   dispatch that halted before writing. The two findings below are v7's, verbatim, still open.
2. **Both findings are one fix each and belong in one commit.** Finding 2 is *why* finding 1 was
   invisible; fixing the regex alone leaves a red, fixing the comment alone leaves the next
   re-wrap unguarded.
3. **Do not widen `PROP-PUB-6` or `deferral-binding.test.js`'s README-conditional** while doing
   this (v7 note 2 stands): PROP-PUB-6's `pr-tests.yml` scoping is what lets PROP-GATE-5
   discriminate row 6, and the caveat-conditional is correct deferral lifecycle.
4. **Do not touch `pdlc/engine/package.json`'s version now.** The `0.3.0` bump belongs after the
   `engine-v0.2.0` publish evidence lands, which `RELEASE-CHECKLIST.md` §7 already schedules;
   bumping early makes the §3-3 guard demand `0.4.0`.
5. **§2 rows 3–4 remain spec-acknowledged**, unchanged from v1–v7. Not careless work.
6. **The `documentOracles.test.js` red is environmental**, not a defect: remove the untracked
   `.serena/`, `.claude/settings.json` and `.claude/pdlc-wave-state.json`, or read it in CI.
