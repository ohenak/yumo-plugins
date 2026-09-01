# CODE REVIEW — pdlc-stats (v4)

| Field | Detail |
|---|---|
| Feature | pdlc-stats |
| Branch | feat-pdlc-stats |
| Review version | 4 |
| Date | 2026-09-01 |
| Verdict | Pass |
| Branch coverage (lowest module) | 96.27% (`pdlc/workflows/lib/stats.mjs`, carried forward — module untouched by the delta) |
| Requirements traced | 22/22 (carried forward from v2/v3; no row moved) |

Scope: delta re-verification of the single finding recorded in `CODE_REVIEW-pdlc-stats-v3.md` (§1 #1, remediation-not-committed), plus a stub/mock scan and integration-boundary re-scan of `git diff 1a3bd89ff..HEAD` — the range of commits made after v3 was written. Everything verified correct in v1/v2/v3 and untouched by this delta was **not** re-scanned.

---

## §1 Verification of v3 Findings

**v3 §1 #1 — remediation not on branch (medium) — REMEDIATED.**

v3 verified the remediation content as correct but recorded that it existed only as working-tree state: 9 modified tracked files plus one untracked file, with branch tip still at `926cdb42b`. Each element of that finding is now falsified by measurement, not by assertion:

| v3's required condition | Measurement at HEAD | Result |
|---|---|---|
| `git status --porcelain` empty over the ten named paths | empty over the whole tree (zero lines) | met |
| `git log --oneline -1` no longer `926cdb42b` | tip is `cb6543ae6`; `926cdb42b` is four commits back | met |
| Untracked `stats-narrative-drift.test.js` committed | tracked at `5a9b2ccd3`, 178 lines, `178/0` numstat | met |
| Push to origin | `origin/feat-pdlc-stats` at `cb6543ae6` | met |

**The committed content is the content v3 verified.** `5a9b2ccd3` ("dod: land CODE_REVIEW-pdlc-stats-v3's verified remediation — narrative-drift oracle + comment sweeps") touches exactly the ten paths v3 named, with `+243/−80` across 10 files. Subtracting the new 178-line oracle leaves `+65/−80` over the 9 modified files — byte-for-byte the delta v3 measured in the working tree. Those 9 files are **comment-only**: filtering the diff's added/removed lines down to non-comment, non-blank content returns zero lines. No executable line in any pre-existing test changed on the way from working tree to commit.

**The landed oracle is load-bearing, re-verified by mutation, not by greenness.** `node --test __tests__/stats-narrative-drift.test.js` at HEAD reports `29 tests / 29 pass / 0 fail` — the same 29 mechanical oracles v3 counted. To confirm the committed copy still bites rather than merely passing, v3's Invariant 1 was re-run against the committed tree: prepending `// RED T-09: this does not exist yet.` to `pdlc/engine/__tests__/stats-cli.test.js` turned the run RED at `28 pass / 1 fail` with the intended `pending-work narrative found in delivered code:` message. The file was restored and `git status --porcelain` re-confirmed empty, so this probe left no residue.

**Full-suite parity with v3's working-tree measurement.** Both suites were re-run at the committed HEAD and reproduce v3's counts exactly, which is the evidence that committing changed nothing:

| Suite | Command | Result |
|---|---|---|
| Engine | `npm test` in `pdlc/engine` | 38 suites, **957 tests, 955 pass, 0 fail, 2 skipped** |
| Workflows | `npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'` | **163/163 suites, 5121 passed, 70 skipped, 0 failed** |

Both are identical to v3's numbers. **0 failures across both suites.** The CI consequence v3 flagged — `Engine tests (ubuntu-latest)` running `npm ci && npm test` over the checked-out branch and therefore never collecting an untracked file — is now resolved: the file is on the branch and inside `_run-suite.mjs`'s directory scan, which is what the +29 test count demonstrates.

**Observation (not a finding, no action).** v3's prose describes the new oracle as "176 lines"; the committed file is 178. The functional identity v3 established is unaffected — same 29 oracles, same two mutation-verified invariants, same excluded-file set — so this reads as a counting slip in the v3 write-up rather than a content difference. Recorded only so a future reader comparing the two documents is not left wondering.

---

## §2 Delta Scan (1a3bd89ff..HEAD)

The delta is 12 files: the 10 remediation paths above, plus two documentation files from `cb6543ae6` (`docs/_queue/ESCALATIONS.md`, `docs/pdlc-stats/ADVISORY-pdlc-stats.md`) which v3 did not cover because they did not yet exist in the range.

**Stubs, mock data, unwired integrations — none.** Grepping every added line in the delta for `TODO|FIXME|HACK|XXX|NotImplemented|not implemented|stub|placeholder|istanbul ignore|c8 ignore` returns nothing (exit 1). The same sweep for `mock|example.com|localhost|dummy|lorem|hardcoded` returns nothing. This is consistent with the shape of the delta: comment rewrites, one test file, two append-only logs.

**Zero production lines changed.** `git diff --name-only 1a3bd89ff..HEAD` contains neither `pdlc/workflows/lib/stats.mjs` nor `pdlc/engine/bin/cli.mjs` (grep exit 1). This is what makes the two carried-forward measurements sound rather than assumed:

- **Coverage (criterion 4), carried at 96.27%.** The lowest-covered module is absent from the diff, and the delta adds no production branch anywhere, so v1/v2/v3's figure necessarily still holds. Test code adds no production branches to cover.
- **Requirements traceability (criterion 5), carried at 22/22.** No row can move when no implementation path changed. The implementation-path and test-path references recorded in v2's table still resolve as written; the test-path references in particular survive because the 9 comment sweeps renamed no file and moved no `describe`/`test` title.

**The two log files are append-only and carry no code.** `ESCALATIONS.md` gains one 18-line A3 entry, `ADVISORY-pdlc-stats.md` one 14-line A3 entry, both recording an advisory-tier refusal (`budget-exhausted`, no verdict produced, no proposal, `Evidence: (none)`). Nothing was changed by the advisory tier — the entries exist precisely to record that. The A6 entries the commit subject also mentions were already tracked at `1a3bd89ff` and are unchanged by this commit, so the subject line is describing both logs' contents rather than claiming two new appends; no drift results. These files are inside the tree walked by `coveredViolations`, and the workflows document oracles are green at HEAD, so the appends satisfy the document grammar.

---

## §3 Integration Boundary Re-scan (HEAD)

**Runtime artifact.** `node pdlc/workflows/build-runtime.mjs --check` reports `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, exit 0. No workflow source changed in the delta, so no `dist/` churn was owed and none occurred — the wave gate's rebuild-and-stage step has nothing outstanding.

**Enumeration surfaces.** The new engine test file is collected by directory scan (`pdlc/engine/__tests__/_run-suite.mjs`), which the 957-test total confirms; it needs no packaging entry because `package.json` `files` excludes `__tests__/`, and `stats-vendoring.test.js`'s four membership oracles are green and untouched. No document or workflow file hardcodes an engine test count that the +29 would falsify.

**Multi-writer.** Not applicable to this delta: it writes no new operator-visible artifact. `pdlc stats` stdout is unchanged and `bin/cli.mjs` remains its only writer. The two log appends are written by the advisory/escalation channel that already owns those files.

**Deferral binding.** No new deferral is introduced. v3's confirmation stands and was re-checked at HEAD: the only `later`-shaped string in the landed oracle is the regex literal `/\bland in later tasks\b/i`, which is a pattern being searched *for*, not a deferral being made. **0 unbound deferrals.**

**Branch discipline.** `git rev-parse --abbrev-ref HEAD` returned `feat-pdlc-stats` both before the scan and after it. No work was performed on `main`.

---

## §4 Local / Cross-Feature / Process

**Local.** Clean. The delta is confined to `pdlc-stats`-owned test files and this feature's own advisory log. No shared helper, no config, no `dist/` artifact moved.

**Cross-feature.** Clean. `pdlc/workflows/__tests__/helpers/statsDoubles.js` — the one shared surface adjacent to the swept family — is absent from the delta, as v3 established and as the file list re-confirms. QUEUE.md rows 28/29/30 still depend on `pdlc-stats` and their three successor REQ files still exist, so nothing downstream is left dangling by this landing.

**Process.** One note for the operator, carrying no code consequence: the A3 advisory entry records `Pipeline state. DOD — halted` with a `budget-exhausted` refusal and no proposal. That halt is a pipeline-state matter for whoever drives the queue — it is logged, not silent, which is the correct behaviour — and it is orthogonal to the code health this review measures. Nothing in the delivered code is blocked by it.

---

## Notes for the remediator

**None.** v3's single finding is closed by measurement, no new finding was found in the delta, and both suites are green at the committed, pushed HEAD. There is no remediation work outstanding for this round.

The v3 round's judgement holds up well in retrospect: the content it verified is exactly the content that landed, unmodified in transit, and the oracle it mutation-tested still fails correctly when the defect class it guards is reintroduced. The only thing v3 was waiting on was the commit, and the commit is here.
