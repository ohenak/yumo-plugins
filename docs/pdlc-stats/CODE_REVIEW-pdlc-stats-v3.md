# CODE REVIEW — pdlc-stats (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-stats |
| Branch | feat-pdlc-stats |
| Review version | 3 |
| Date | 2026-08-31 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 96.27% (`pdlc/workflows/lib/stats.mjs`, carried forward — the module is untouched by this remediation) |
| Requirements traced | 22/22 (carried forward from v2; no row moved) |

Scope: delta re-verification of the remediation for `CODE_REVIEW-pdlc-stats-v2.md`. Unchanged code verified in v1/v2 was not re-scanned.

**The remediation is not committed.** `git log` shows nothing after `926cdb42b` ("dod: code review v2 for pdlc-stats"), which is branch tip. The entire remediation lives in the working tree: 9 modified tracked files (+65/−80, comment-only) plus one **untracked** new file, `pdlc/engine/__tests__/stats-narrative-drift.test.js` (176 lines). The delta below was therefore taken as `git diff 926cdb42b` plus that untracked file.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Remediation not on the branch (crit. 5 — delivery) | medium | working tree; `pdlc/engine/__tests__/stats-narrative-drift.test.js` (untracked) | Every v2 fix, and the new oracle that mechanises it, exists only as uncommitted working-tree state. The new file is untracked, so it is on no commit, no push and no CI run: the `Engine tests (ubuntu-latest)` leg runs `npm ci && npm test` against the **checked-out branch**, where this file does not exist — the 29 oracles verified below would not run there. A `git clean`, a worktree switch or a fresh clone silently discards the whole round. Both prior rounds landed their remediation as commits (`c11c1e863`, `e10acc4a2`); this one did not. | `git add` the 9 modified files and the untracked `stats-narrative-drift.test.js`, commit and push. No code or assertion change is needed — the content is correct as verified below. | Process |

No stubs, TODO/FIXME/HACK/XXX markers, `NotImplementedError`, coverage-exemption pragmas, mock/fake data, unwired integrations or placeholder URLs were introduced by the remediation delta. The only non-comment change in the whole delta is the new test file, which is test code by definition and contains no production seam.

## §2 Requirements Traceability

Carried forward unchanged from v2 (22/22, no gaps). The remediation touched **zero** production lines — `pdlc/workflows/lib/stats.mjs` and `pdlc/engine/bin/cli.mjs` are both absent from the delta — so every implementation-path and test-path reference in v2's table still resolves as written. No row's `Gap?` value moves.

## §3 Verification of v2 Findings

**v2 §1 #1 — stale `stats-cli.test.js` task narrative (low) — REMEDIATED.** The header at `:1-18` no longer narrates a pre-implementation state. Every claim in the replacement was checked against the code rather than taken on trust: `bin/cli.mjs` does carry all four of TSPEC §3.4's additive edits (`statsParsers:1272`, `statsIo:1291`, `cmdStats:1320`, `case "stats":1361`, plus the `FLAGS_BY_COMMAND.stats` and `USAGE` entries), so the new "Delivered surface" paragraph is true. The v2 note's two retention requirements are both honoured — the TSPEC §3.4/§5/§6.2 references survive, and the in-process/`--cwd` rationale paragraph is intact. The rewrite also correctly re-tensed the `lastStderrLine` block comment at `:95-104`, which carried the same "does not exist yet / today's `default` branch" framing that v2 did not separately cite; that paragraph's load-bearing point (why the last non-empty stderr line is isolated) is preserved, now stated as a standing property rather than a temporary one.

**v2 §1 #2 — stale `stats-cli-structure.test.js` narratives (low) — REMEDIATED.** Both cited sites are fixed. The file header at `:1-18` now describes the delivered seam and keeps the TSPEC §6.4 reference and the classifier-purity exception note, as required. The block comment at `:432-441` no longer instructs a reader to un-skip anything — the doubly-stale `test.skip` instruction was deleted rather than acted on, which is the correct disposition. Verified against the actual skip state: `stats-cli-structure.test.js` contains zero real skips, and the engine suite's 2 skips remain the unrelated `PDLC_LIVE=1` opt-in tests.

**Sweep confirmed complete, not just spot-fixed.** The one-line sweep v2's Notes asked for — `grep -nE "RED at T-|not yet|have not landed|Until then|lands? in T-|does not exist yet"` over every `.mjs`/`.js` file changed on the branch — now returns nothing. The remediator correctly went beyond the two cited files to the other seven members of the same family (`stats-vendoring.test.js`, `statsAntiDrift`, `statsArgv`, `statsDiscovery`, `statsMetrics`, `statsOutcome`, `statsRender`), each of which carried the same "does not exist yet / wrapped in `.skip` until T-nn" framing. I checked the three adjacent files the sweep's file-scope does not reach — `pdlc/workflows/__tests__/helpers/statsDoubles.js`, `pdlc/engine/bin/cli.mjs` and `pdlc/workflows/lib/stats.mjs` — and all three are clean.

**The new oracle is load-bearing, not assertion-free — mutation-verified.** `stats-narrative-drift.test.js` converts the hand-found defect class into 29 mechanical oracles over a 13-file scanned set (4 engine `stats-*` files, 8 workflows `stats[A-Z]*` files, and `lib/stats.mjs`; it excludes itself, correctly, since it must contain the banned phrases as patterns). I did not take its greenness as evidence — I mutated against both invariants:

- **Invariant 1 (no pending-work narrative).** Prepending `// RED at T-09: the case does not exist yet.` to `stats-cli.test.js` turned the run RED (`28 pass / 1 fail`) with the intended `pending-work narrative found in delivered code` message. Restored; `git diff --stat` confirms the file is byte-identical to the remediation state.
- **Invariant 2 (skip narratives require a real skip).** Prepending `// Each oracle is committed \`test.skip\` until its task lands.` to `stats-cli-structure.test.js` turned that file's oracle RED with the intended "narrates committed `.skip` blocks but contains no skipped test" message. Restored and diff-verified.

The second invariant is genuinely non-trivial rather than a string match: it strips comments and string/template literals before looking for a real `test.skip(`, which is exactly what defeated v2's manual check (the file's only two `test.skip` occurrences were *inside* comments). The third describe block guards the scan against silently emptying itself, asserting the two cited files and `lib/stats.mjs` are in the set and that the set has ≥12 members — the anti-vacuity conjunct these scan-style oracles usually lack.

**Suites re-run at the working-tree state.** Engine: **957 tests, 955 pass, 0 fail, 2 skipped** — up exactly 29 from v2's 928/926, matching the new file's 29 oracles with no regression elsewhere. Workflows: **163/163 suites, 5121 passed, 70 skipped, 0 failed** — byte-identical to v2's counts, confirming the seven workflows-side comment rewrites broke nothing. No document oracle went red despite the untracked file present in the tree (the failure mode CLAUDE.md warns about), so `coveredViolations` is unaffected by it.

**Criterion 4 (carried forward, not re-measured).** Sound to carry: the delta contains zero changed executable lines in any production module — `lib/stats.mjs` is not in the diff at all — so its branch coverage is necessarily still v1/v2's 96.27%. The new file is test code and adds no production branches.

## §4 Criterion-6 Integration Boundary (diff-scoped)

**(a) Adjacent-surface falsification.** Clean. The delta is comment rewrites plus one new test file, so the surfaces it could falsify are enumerations and claims *about the test set*:

- **Runtime artifact.** `node pdlc/workflows/build-runtime.mjs --check` reports `in-sync`, exit 0. No workflow source changed, so correctly no `dist/` churn.
- **Enumeration sweep.** The new engine test file is picked up by globbing, not enumeration: `pdlc/engine/__tests__/_run-suite.mjs` spawns `node --test` over the directory, and the 29-test increase confirms collection. `package.json` → `files` (`bin/`, `lib/`, `vendor/workflows/`, `scripts/postinstall.mjs`) excludes `__tests__/`, so the new file needs no packaging entry and `stats-vendoring.test.js`'s four membership oracles are untouched (all green). No repo doc or workflow file carries a hardcoded engine test count that this +29 would falsify (grepped; none exist).
- **Sibling-surface family.** The family here is "stats-owned source and test files carrying task narratives". The remediation covered all nine live members and the new oracle now enumerates 13 files mechanically. Two adjacent files sit outside the oracle's scan pattern — `pdlc/workflows/__tests__/helpers/statsDoubles.js` (the scan is non-recursive, so `helpers/` is not visited) and `pdlc/engine/bin/cli.mjs` (not `stats-*`-prefixed). Both are clean today, so this is a coverage nit in the guard rather than a live falsification, and I am not recording it as a finding; it is noted below for whoever extends the oracle.
- **Residual `T-17` labels.** `stats-cli-structure.test.js` still carries 8 `T-17` mentions in its describe/test titles ("CLI structural anti-drift oracles owned by T-17", "T-17: statsParsers()…"). These are true provenance labels — the oracles *are* owned by T-17, which landed — not claims about pending state, so they are not falsifications and v2 did not ask for them.

**Multi-writer sweep.** Not applicable to this delta: it writes no operator-visible artifact. `pdlc stats`'s stdout is unchanged, and `bin/cli.mjs` remains its only writer.

**(b) Deferral binding.** No new deferral is introduced by the delta — the only `later`-shaped string in the new file is the regex literal `/\bland in later tasks\b/i`, which is a pattern being searched for, not a deferral. v2's confirmation stands re-checked: QUEUE.md rows 28/29/30 all depend on `pdlc-stats` and all three successor REQ files exist. **0 unbound deferrals.**

## Notes for the remediator

One action, no code change:

1. **§1 #1** — stage and commit all ten paths, including the untracked `pdlc/engine/__tests__/stats-narrative-drift.test.js`, then push. `git status --porcelain` should come back empty afterwards, and `git log --oneline -1` should not be `926cdb42b`. Everything else in this round is verified correct and should be committed exactly as it stands.

The content of this remediation is the strongest of the three rounds — it fixed both cited findings, swept the seven uncited siblings of the same family unprompted, and left behind a mutation-verified oracle so the family cannot regrow. It just has not landed on the branch yet.
