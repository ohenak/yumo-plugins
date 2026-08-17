# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.5, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 2
**Scope:** Delta re-review. Round-1 High findings re-checked against the tree; new findings held to the High bar per the iteration-≥2 rigour rule.

## Verification Basis (existing-code claims, re-measured at HEAD `a9b3e78a`)

Every `M-*` row the REQ now delegates to `docs/_constraints/pdlc-retirement-baseline.md` was re-derived from the tree in one pass.

| Claim | HEAD | Verdict |
|---|---|---|
| M-1 32,939 B / 725 lines | exact | ✅ |
| M-2 75,617 B / 1,955 lines | exact | ✅ |
| M-3 19,240 B / 381 lines | exact | ✅ |
| M-4 401,716 B; M-5 401,020 B; M-6 1,464 B / 46 lines; M-9 679,956 B; M-10 417,952 B | exact | ✅ |
| M-7 `build-runtime.mjs` 831 lines / 33,664 B | exact | ✅ |
| `dist/` tracked entry set = {M-4, M-5, M-6, M-9, M-10} | `git ls-files pdlc/workflows/dist/` returns exactly those five | ✅ (AC-1.1 set-equality is now derivable) |
| M-8 "119 `*.test.js` in `pdlc/workflows/__tests__/`" | 119 | ✅ |
| M-8 "22 files / 15,109 lines" | enumerated set is **21** files (`bootstrap`, `drift*`×16, `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility`); `wc -l` over those 21 = 15,109 | ⚠️ off-by-one, see ERRATUM |
| M-11a `pr-tests.yml` jobs | present | ✅ |
| M-11b `publish.yml` tag gate (`build-runtime.mjs --check`, rebuild-diff, two-command `sync-workflows.sh --check`, exec bit) | present | ✅ |
| M-11c `ci-arrangement.test.js` `GATE_JOB_IDS`, CLAUDE.md CI-table set-equality, `publish.yml`-gate set-equality | `:47`, `:589-630`, `:746-782` — present, **but the CLAUDE.md half no longer matches the tree**, see F-21 | ⚠️ |
| M-11d `smoke.test.js` drift-gate cases + `checkEnabled: false` | `:329`, `:358`, `:491-496`, `:530-533`, `:565-568` | ✅ |
| M-11e fixture trees (5 files + 1 file) | exact | ✅ |
| M-11f `documentOracles.test.js` D-2 requires CLAUDE.md contain both script names | `:747-749`; CLAUDE.md still names both (`:74`, `:90`) | ✅ |
| M-11g `document-oracles.mjs` packaging checks + generated-tree exemptions | `:51-53`, `:103`, `:177-178` | ✅ |
| M-11h `.claude/pdlc.config.example.json` `postWaveCommand` / `postWavePathspecs` | present | ✅ |
| M-11i `distribution.checkEnabled` in `orchestrate-queue.js`; `SessionStart` drift reporter in `hooks.json:38-45` | present | ✅ |
| M-11j `.worktreeinclude` single row; `.gitignore:33` row + `:13-32` comment | present | ✅ |
| M-11k RELEASE-CHECKLIST ≥4 sections, READMEs, CLAUDE.md | present, **inventory now incomplete** — `pdlc/OPERATIONS.md` created at HEAD, see F-19 | ⚠️ |
| BL-07 versions: plugin `0.23.1`, engine `0.2.1`, `pdlcPluginCompat: "^0.23.0"` | `plugin.json:4`, `engine/package.json:18` | ✅ |
| O-7 / BL-05 queue rows: `pdlc-release-ci` Order 8 `blocked`; Order 6 `pdlc-engineering-loop` `pending`; `pdlc-install-mechanism` removed 2026-08-13 | `QUEUE.md:45-46`, `:57-60`, `:78-79` | ✅ |
| BL-01/BL-02 removal notes with cited commits | `QUEUE.md:34-37`, `:64-66`; `docs/completed/pdlc-headless-engine/`, `docs/completed/pdlc-engine-distribution/` present | ✅ |

## Round-1 Disposition

| Round-1 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.4b added for `publish.yml`'s tag gate; M-11b/M-11c carry it; C-5 and R-2 name it; C-5 now states C-7 wins over per-class granularity for cross-channel classes |
| F-02 | High | **Resolved** | BL-07 added (published engine range must admit post-sweep plugin version, gating the **first** deletion commit); NG-5 carves out the compat declaration; R-3 states the outage form |
| F-03 | High | **Resolved** | M-10 (`consolidate-learnings.bundle.js`) added; AC-1.1 lists M-10 and set-equals `dist/` to `{M-9}`; G-1 says three bundles |
| F-04 | High | **Resolved** | AC-5.3 now names a concrete post-sweep invocation ("at its surviving repo path, directly, in a checkout of the consuming project"); O-3 settled in principle, leaving only *which* directory to TSPEC — correct altitude |
| F-05 | High | **Resolved** | NG-5 explicitly carves engine-side tests/fixtures (M-11c/d/e) and the compat declaration **into** scope; C-3 names the engine-side coverage share; AC-1.4c added |
| F-06 | High | **Resolved** | O-7 and BL-05 re-derived by feature name; both match `QUEUE.md` at HEAD (verified above) |
| F-07 | High | **Resolved** | M-11f added; AC-1.6 requires the surviving CLAUDE.md-must-name-scripts assertion to go with the prose; R-2 and O-5 require them to move in one commit |
| F-08 | Medium | **Resolved** | All measurements re-taken and correct at HEAD (one off-by-one remains — ERRATUM below, not a REQ defect) |
| F-09 | Medium | **Resolved** | AC-1.3 adds the positive conjunct (named retained modules, including R-8 re-homed assertions, must exist and pass) |
| F-10 | Medium | **Resolved** | AC-3.2/AC-3.5/AC-3.6 labelled "pre-satisfied at HEAD — regression guard, verified 2026-08-17" |
| F-11 | Medium | **Resolved** | AC-3.6 now pins "terminal output of the invocation — banner plus refusal, taken together, not the refusal line alone", which matches `handshake.mjs:176-177` + `:208` |
| F-12 | Medium | **Resolved** | BL-01/BL-02 resolution form is now `docs/completed/{feature}/` plus the `QUEUE.md` removal note with cited commit, explicitly *not* a `done` status |
| F-13 | Medium | **Resolved** | M-11h added; AC-1.2's search set includes wave-gate keys; C-5 gives them their own class |
| F-14 | Medium | **Resolved** | AC-1.2 carries an explicit path-glob allow-list and a required-empty result |
| F-15 | Medium | **Resolved** | BL-08 added (pre-sweep report committed at a fixed path before the first deletion commit); AC-5.2 cites it |
| F-16 | Medium | **Resolved** | `docs/_constraints/pdlc-retirement-baseline.md` created; §1.2 cites `M-*` ids only |
| F-17 | Low | **Resolved** | AC-4.3 pins stderr + non-zero exit |
| F-18 | Low | **Resolved** | AC-1.5 requires each deleted row's explanatory comment block to go with it |

All seven round-1 High findings are resolved. Questions Q-01…Q-07 are answered by BL-07, AC-5.3/O-3, NG-5, C-5's C-7-wins clause, O-3's manifest carve-out, AC-4.4, and BL-01/BL-02's revised resolution form respectively.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-19 | High | Local | **The documentation sweep inventory does not cover `pdlc/OPERATIONS.md`, which now holds the retired machinery's entire operational story.** Commit `a9b3e78a` (this round) moved CLAUDE.md's deep-dive sections verbatim into a new tracked file. `pdlc/OPERATIONS.md` carries `## Workflow scripts`, `## When sync skips a row: \`unverified\` and \`--force\`` (`:76-88`), `## Worktrees` (`:89-94`, the self-created-worktree caveat), `## Distribution scripts` (`:132-139`, a table naming M-1, M-2 and M-3 with their roles), and `## Engine channel` (`:140-156`). Those are precisely the four concepts G-3 requires **removed, not deprecated**. AC-2.1's reader test enumerates only "CLAUDE.md, READMEs and `pdlc/RELEASE-CHECKLIST.md`", so a post-sweep tree that leaves `OPERATIONS.md` untouched satisfies AC-2.1 literally while a new reader still finds full instructions for force-sync, drift checking and the worktree workaround — G-3's stated failure mode, unblocked. O-5's inventory and baseline row M-11k have the same gap (M-11k scopes the prose to "CLAUDE.md's bootstrap/sync/drift/worktree", which was measured at `5a7904ca`, one commit before the split). Add `pdlc/OPERATIONS.md` to §1.2's dependent set (M-11k), to AC-2.1's read set, and to O-5's inventory. | §1.2, AC-2.1, O-5, G-3, R-7 |
| F-20 | High | Local | **The surviving-hook criterion is absence plus a partial positive, not a set-equality, and the one hook a user story names by role is pinned by no AC.** `pdlc/hooks/hooks.json:29-36` registers a **second** `SessionStart` entry, `nudge-consolidation.sh`, alongside the drift reporter at `:38-45`. AC-1.7 requires only that the manifest "registers no drift-reporting `SessionStart` entry" and "still registers the harvest guard and both authoring-warning hooks"; AC-3.3's positive list is the same three. A sweep that deletes the whole `SessionStart` array — the obvious mechanical edit, since the retired hook is one of its two members — satisfies both criteria while breaking US-04's promise that "SessionStart nudges keep working" and NG-1's "all hooks stay installed". This is the same absence-only shape AC-1.1 and AC-3.3 already fixed elsewhere: state the hook-entry set as a **set-equality** against a pre-sweep listing (pre-sweep set minus the drift reporter), so a lost survivor fails rather than passes. | AC-1.7, AC-3.3, US-04, NG-1, C-2 |
| F-21 | High | Local | **The branch's engine suite is already red at HEAD, so C-7's "green at every commit" and AC-1.4c have no green baseline to preserve, and M-11c's CLAUDE.md citation no longer describes the tree.** `node --test pdlc/engine/__tests__/ci-arrangement.test.js` at `a9b3e78a` reports `not ok 7 — ci arrangement — CLAUDE.md's CI section describes the whole §5.1 gate`, error `'CLAUDE.md must carry a \`### Continuous integration\` section'` (29 pass, 1 fail). The oracle reads `repoRoot/CLAUDE.md` (`ci-arrangement.test.js:595`, `:601`, `:614-630`); `a9b3e78a` moved that section to `pdlc/OPERATIONS.md:57` and left CLAUDE.md with only a one-line prose pointer (`CLAUDE.md:66`). `main` still carries `### Continuous integration` at `CLAUDE.md:104`, so the break is this round's, not inherited. Two consequences for the REQ: (a) C-7 and AC-1.4c are stated as "stays green"/"is green", which is unsatisfiable from a red starting tree — either the REQ's first ordered step repairs the oracle or BL-07/BL-08 gain a sibling row "engine suite green at the pre-sweep commit"; (b) M-11c and R-2 describe the arrangement oracle as watching "CLAUDE.md's CI table and prose count word", which is now split across two files — the sweep must move the oracle's target, not just the prose. | C-7, AC-1.4c, §1.2 (M-11c), R-2, AC-1.8 |

### Delta tags

```
FINDING: High | delta | nonlocal | §1.2 / AC-2.1 / O-5 | doc sweep inventory omits pdlc/OPERATIONS.md, created this round, which carries unverified/--force, the worktree caveat and the three-script distribution table
FINDING: High | inherited | nonlocal | AC-1.7 / AC-3.3 | surviving-hook criterion is absence-only; the nudge-consolidation SessionStart entry promised by US-04 is pinned by no AC
FINDING: High | delta | nonlocal | C-7 / AC-1.4c / §1.2 M-11c | engine suite red at HEAD (ci-arrangement test 7) after this round's CLAUDE.md split; no green pre-sweep baseline, and M-11c's citation is stale
```

## Errata (upstream, not REQ defects)

```
ERRATUM: CONSTRAINTS: docs/_constraints/pdlc-retirement-baseline.md M-8 states "22 files / 15,109 lines", but its own enumeration (bootstrap + drift*×16 + queueDriftGate + runtimeBundle + worktreeInclude + hookCompatibility) is 21 files, and 15,109 is the measured line total for exactly those 21. Correct the count to 21 before AC-1.3's literal transcription is derived from it.
ERRATUM: CONSTRAINTS: docs/_constraints/pdlc-retirement-baseline.md M-11k scopes the documentation surface to "CLAUDE.md's bootstrap/sync/drift/worktree sections". Measured at 5a7904ca; at HEAD (a9b3e78a) those sections live in pdlc/OPERATIONS.md. Re-measure per C-6 and add the file (see F-19).
```

## Questions

| ID | Question |
|----|---------|
| Q-08 | Does the sweep repair `ci-arrangement.test.js`'s CLAUDE.md target (F-21) as its own pre-step, or does it inherit a red `Engine tests` check into Phase I? C-5's bisectability argument assumes the pre-sweep commit is green; if it is not, the first deletion commit cannot be distinguished from the inherited failure. |
| Q-09 | Is `pdlc/OPERATIONS.md` in the sweep's scope as an *instructional* document (G-3, deletion of retired sections) or does any of it survive as engine-channel operations prose? The `## Engine channel` section documents surviving behaviour; `## Workflow scripts`, `## Distribution scripts`, `## Worktrees` and the `unverified`/`--force` section do not. |

## Positive Observations

- The relocation asked for in F-16 paid off immediately: every M-row except the M-8 count re-derives exactly from the tree with the recorded commands, and the `dist/` set-equality that AC-1.1 depends on is now mechanically checkable rather than asserted in prose.
- NG-5's carve-out is the right resolution of F-05. Naming the engine's compat declaration and M-11c/d/e as "explicitly in scope, because leaving them unedited reds a required check on the commit that deletes their subject" states the ownership rule as a consequence of C-7 rather than as a boundary exception, which is why it does not need re-litigating.
- BL-07 answers Q-01 without over-committing: it gates on the *published* range admitting the post-sweep version, leaving the operator free to choose between a narrow bump and an engine republish. That is a gate an operator can check, not a decision the REQ had to make.
- C-5's explicit "C-7 wins" tie-break is unusual and correct. Most specs leave the per-step-reversibility/green-at-every-commit conflict implicit and discover it mid-sweep.
- AC-3.2/3.5/3.6's "pre-satisfied at HEAD — regression guard, verified 2026-08-17" labels do exactly what F-10 asked: the round's green cannot be misread as delivered work, which is the project's own recorded vacuous-green failure mode.

## Recommendation

**Needs revision**

The revision is substantive: all seven round-1 High findings are resolved on the tree, not just in prose, and the measured baseline re-derives cleanly. Nothing in this round questions the retirement decision, the sequencing, or the evidence gate.

The three remaining High findings are narrow. F-19 and F-21 both trace to a single commit that landed inside this revision series (`a9b3e78a`, the CLAUDE.md → `pdlc/OPERATIONS.md` split): it created a tracked instructional file the sweep inventory does not name, and it left the engine suite red, which removes the green baseline C-7 and AC-1.4c are written against. Both are documentation-inventory corrections plus one ordered pre-step, not strategy changes. F-20 is the last absence-only oracle in §6.1 — the hook-manifest criterion — and closes the same way its siblings already did, with a set-equality against a pre-sweep listing.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 0, "low": 0}
