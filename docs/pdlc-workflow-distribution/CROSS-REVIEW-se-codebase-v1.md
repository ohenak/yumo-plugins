# Cross-Review: software-engineer — Final Codebase Review (Phase CR)

**Reviewer:** software-engineer
**Document reviewed:** the landed implementation at `05739f3` (`feat-pdlc-workflow-distribution`)
**Date:** 2026-07-29
**Iteration:** 1
**Scope:** Local (per-finding Scope tags in the table below)

Suite state as handed over: 31 suites, 930 passed, 70 skipped, 0 failed. Independently
re-verified: `node pdlc/workflows/build-runtime.mjs --check` → exit 0;
`coveredViolations(LIVE_ROOT)` → `[]`; `packagingViolations(LIVE_ROOT)` → `[]`;
`advertisedVersionViolation(LIVE_ROOT)` → `{skipped: S_NOTHING_STAGED}`.

Every finding below was reproduced at source. Where a claim is behavioural, the command and its
output are quoted.

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **`check-workflow-drift.sh` exits 1 — not 0 — when C1 fails to source, violating AC-2.4 ("the hook exits 0 always", P0-absolute).** Reproduced. | `pdlc/hooks/scripts/check-workflow-drift.sh:32`, `:47`, `:116` |
| F-02 | Medium | Local | **`sync-workflows.sh` exits 1 on the same C1-source failure; plain sync must *never* exit 1** (FSPEC §5.8, PLAN T-37: "exiting 0/2/3/4 **never 1**"). Exit 1 is the *least alarming* non-zero class ("sync-fixable drift"), so a broken install reports "run sync" for a condition sync cannot fix. | `pdlc/hooks/scripts/sync-workflows.sh:30`, `:563` |
| F-03 | Medium | Local | **`__tests__/helpers/bin/lib-probe.sh:54-55` unconditionally `export LC_ALL=C; export LANG=C` before sourcing C1, so TSPEC §11.3 row 2's locale-injection test (`driftBackups.test.js:113`) is vacuous** — the injected `en_US.UTF-8` never reaches the subject. TSPEC §3.2 names this test as the one that detects removal of C1's own `export LC_ALL=C`; it cannot. The "PROP-BKP-07 holds by construction" adjudication is right about the property and wrong about the test's purpose. | `__tests__/helpers/bin/lib-probe.sh:54-55`; `__tests__/driftBackups.test.js:113-140`; TSPEC §3.2 (line 596-598), §11.3 row 2 |
| F-04 | Medium | Local | **`splitStderrLines` is an expired placeholder keyed to T-08b, which landed in batch 4.** `RunResult.notices`/`.warnings` are therefore **always `[]`** (no emitted message text contains an `N-<n>`/`W-<n>` token), so they are not TSPEC §3.1's specified values, and `expectHookSilent`'s conjunct 4 — written explicitly "so a future matcher addition cannot make conjunct 1 pass by parsing less" — is unfalsifiable. Same defect class as `readTraceIfPresent`, which vacated `driftWriteFailure.test.js:366` for eighteen batches. | `__tests__/helpers/driftHarness.js:209-218`, `:404-410`, `:652` |
| F-05 | Medium | Local | **`packagingViolations` returns `[]` on three distinct inputs, only one of which is benign:** manifest absent (documented, benign), manifest **unparseable** (`:209-211`, silent), and manifest **parseable but of neither known shape** (`:217`/`:254` — no `else`, so `{}` or `{"rows": "[]"}` falls straight through to clause (d)). AC-6.2a is not discharged by the oracle for either of the latter two. `RELEASE-CHECKLIST.md:29-31` mitigates *only* the absent case with presence checks; a corrupt manifest prints `present` three times, `packagingViolations -> []`, and exits 0. Escalating the PLAN L-07 / TSPEC §2.1a adjudication. | `pdlc/workflows/lib/document-oracles.mjs:204`, `:209-211`, `:217`, `:254`, `:300`; `pdlc/RELEASE-CHECKLIST.md:29-31` |
| F-06 | Medium | Local | **`retiredPresent[].supersedingState` — FSPEC and PROPERTIES specify different values, and the shipped test was narrowed to hide it.** Production records the **post-copy** state (`sync-workflows.sh:402`), matching FSPEC §4.6 ("`supersedingState` is post-copy exactly as AC-2.6 requires") and AC-2.6. PROPERTIES PROP-MTM-04 **conjunct 1** requires the **recorded** pass — "`post-run` for sync" — universally quantified over "every generated tree with a retired path present". Under conjunct 3's own AT-35 composition the two differ (`local-edit` vs `unverified`), so conjunct 1 is *false against the shipped implementation*. `driftSync.test.js:805-838` restricts conjunct 1 to the five agreement cases, and conjunct 3 asserts against the trace rather than the field, so the contradiction is never surfaced by a test. One of FSPEC §4.6 or PROPERTIES §7 must move. | `pdlc/hooks/scripts/sync-workflows.sh:402`, `:526`; FSPEC lines 1350-1351, 2095; PROPERTIES lines 1042-1047; `__tests__/driftSync.test.js:805`, `:833` |
| F-07 | Medium | Local | **`.worktreeinclude` is load-bearing and wholly untested.** CLAUDE.md and `pdlc/README.md` both promise "a worktree Claude Code creates for you is a supported consumer" solely because this one-line file exists. Nothing in `__tests__/` asserts its presence or contents (`grep -rn worktreeinclude pdlc/workflows/__tests__` → no matches). Deleting it goes green and silently reintroduces exactly the "green report, absent artifact" failure OQ-3 identified. | `.worktreeinclude:1`; `CLAUDE.md` (Worktrees section); `pdlc/README.md` (Worktrees section) |
| F-08 | Medium | Local | **The distribution feature left its own repo out of sync, and the documented remedy does not fix it.** `pdlc/hooks/scripts/sync-workflows.sh --check` → **exit 2** here: `.claude/workflows/` holds pre-L-06 bundles with no sync provenance, so both rows classify `unverified`. `sync-workflows.sh:326-331` skips `unverified` without `--force`, so CLAUDE.md's "run these two commands, then `--check` exits 0 once every row is in sync" is unachievable on any pre-existing clone — only on a genuinely fresh one. The upgrade path (`--force`, after diffing) is documented nowhere. | `pdlc/hooks/scripts/sync-workflows.sh:326-331`; `CLAUDE.md` (Fresh-clone bootstrap); `pdlc/README.md` (Fresh-clone bootstrap) |
| F-09 | Medium | Process | **PLAN L-06's stated resume recovery, `git checkout -- .`, would have destroyed L-04's and L-08's landed work.** By L-06 the tree carried tracked, modified `pdlc/hooks/hooks.json` (L-04), `CLAUDE.md` and `pdlc/README.md` (L-08); `git checkout -- .` reverts all three. The PLAN asserts the opposite ("L-02/L-03/L-04/L-07/L-08's state is unaffected") — true only of the *untracked* rows. Durable rule: a halt-state recovery command in a multi-row uncommitted PLAN must be path-scoped, never `-- .`. | `PLAN-pdlc-workflow-distribution.md:373` (L-06 row) |
| F-10 | Low | Local | **`backup-grammar.sh:32` uses `while IFS=$'\t' read -r kind a b c`, which collapses consecutive tabs and drops trailing empty fields** — tab is an IFS-whitespace character even when it is the only member of IFS. Its sibling driver documents this exact hazard and works around it (`lib-probe.sh:91-103`, `split_tab_fields`). Latent: no current generated case has an empty field. Adopt `split_tab_fields`. | `__tests__/helpers/bin/backup-grammar.sh:32`; cf. `__tests__/helpers/bin/lib-probe.sh:91-103` |
| F-11 | Low | Local | **PLAN §6.2 says "seven live `coveredViolations` files"; nine sites were changed at L-06** — the two extras (`build-runtime.mjs`, `lib/document-oracles.mjs`) were introduced by this feature's own tooling. §6.2's re-measurement clause covers the drift procedurally, but the header count was never corrected. | `PLAN-pdlc-workflow-distribution.md:604`; landing commit body, L-06 |
| F-12 | Low | Local | **PLAN L-03's halt state says "five mode changes"; the landing commit contains three** (`check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh`). `check-workflow-drift.sh` and `sync-workflows.sh` were already `100755`. Final state is correct — all five `100755`, `lib/pdlc-drift.sh` `100644` — only the halt-state text is wrong. | `PLAN-pdlc-workflow-distribution.md:369` (L-03); `git show 05739f3 --raw -- pdlc/hooks/scripts/` |
| F-13 | Low | Local | **The covered-violations fixture is 13 files, not 12, and the wrong count is repeated *in code*.** `documentOracles.test.js:285` comments "TSPEC §10.1's 12-file table (7 expected violations + 5 exempt entries)" while the array it annotates has 7 + **6** entries. `find … -type f \| wc -l` → 13; `git ls-files … \| wc -l` → 13. AT-23's `== 7` is correct (13 − 6 exempt). | `__tests__/documentOracles.test.js:285`; `PLAN-pdlc-workflow-distribution.md:376` (L-09) |
| F-14 | Low | Local | **`pdlc/skills/orchestrate-dev/SKILL.md` is at exactly 99 lines against `expect(lineCount).toBeLessThan(100)` — a budget of zero, with no marker in the file.** Any editor adding one line turns `orchestrateDevSkill.test.js:28` red for a reason that reads as unrelated to their change. Either raise the threshold (the sibling `orchestrate-queue/SKILL.md` is 195 lines, so 100 is not a house rule) or put an HTML comment at the top of the file naming the constraint and its test. | `pdlc/skills/orchestrate-dev/SKILL.md:99`; `__tests__/orchestrateDevSkill.test.js:28-31` |
| F-15 | Low | Local | **TSPEC §10.1 / PLAN L-01's `.gitignore` anchoring rationale is factually false.** They claim an unanchored `.claude/workflows/` "matches at every depth and would swallow the fixture, turning AT-23's `== 7` into `== 0`". Measured on git 2.50.1 (below): a pattern with a separator in the middle is already anchored per gitignore(5); only a slash-free pattern (`workflows/`) matches at every depth. The claim is doubly wrong — AT-23 reads the fixture from disk via `listAllFiles`, not from git, so `.gitignore` cannot affect its count at all, and the fixture's 13 files are tracked (ignore rules do not apply to tracked paths). **Verified: no test encodes the claim**, so nothing is vacuous; the implemented `/.claude/workflows/` is correct and should stay. Correct the two prose sites. | `.gitignore:9-12`; TSPEC §10.1; PLAN L-01 |
| F-16 | Low | Local | **`bootstrap.test.js` assertion 7 destructively mutates the `beforeAll`-shared clone and never restores it.** It appends bytes to the plugin-side artifact (`:216-223`) with no `finally`. Currently benign — the two tests that follow are mode-bit and `!= 126` checks — but any later test asserting sync-ness in this describe would fail depending on jest's ordering. Restore the artifact, or clone for this assertion. | `__tests__/bootstrap.test.js:196-234` |
| F-17 | Low | Local | **`_pdlc_c3_relpath` prefix-strips with a glob-interpreted pattern.** Both `[[ "$p" == "${PDLC_REPO_ROOT}/"* ]]` and `${p#${PDLC_REPO_ROOT}/}` treat `PDLC_REPO_ROOT` as a *pattern*, so a repo root containing `*`, `?` or `[` mis-matches or mis-strips, and the drift record's `writeFailures[].path` silently stops being repo-relative. | `pdlc/hooks/scripts/sync-workflows.sh:181-182` |
| F-18 | Low | Local | **PLAN L-09 records `advertisedVersionViolation` as `"green"`; post-commit it is `{skipped: S_NOTHING_STAGED}`** — `dist/` is committed, so `git status --porcelain` is empty and the oracle short-circuits. Correct behaviour, wrong record; the DoD line should name the post-commit value it will actually see. | `PLAN-pdlc-workflow-distribution.md:376`; `lib/document-oracles.mjs:393-396` |
| F-19 | Low | Local | **`advertisedVersionViolation` can throw, outside its documented return type.** Its contract is `"red" \| "green" \| { skipped }`, but `JSON.parse` at `:400` and `:401` is unguarded — a malformed working-tree or HEAD `plugin.json` propagates a `SyntaxError` to the caller. Every other precondition in this function is a *skip-loudly* branch (O-16); this one is a crash. Wrap in try/catch and return a skip. | `pdlc/workflows/lib/document-oracles.mjs:398-403` |

---

## Evidence for the behavioural findings

### F-01 / F-02 — C1-source failure (reproduced)

```
$ T=$(mktemp -d); cp pdlc/hooks/scripts/check-workflow-drift.sh "$T/"
$ cd "$T" && git init -q . && printf '{}' | bash ./check-workflow-drift.sh; echo "EXIT=$?"
./check-workflow-drift.sh: line 53: pdlc_load_manifest: command not found
./check-workflow-drift.sh: line 58: pdlc_probe_hash_tool: command not found
./check-workflow-drift.sh: line 66: pdlc_classify_all: command not found
./check-workflow-drift.sh: line 96: pdlc_fault_active: command not found
./check-workflow-drift.sh: line 116: PDLC_ROWS_ID: unbound variable
./check-workflow-drift.sh: line 118: _pdlc_n_rows: unbound variable
EXIT=1
```

Two independent causes, both provable in isolation:

1. `${#PDLC_ROWS_ID[@]:-0}` (`:116`) is **not** a defaulting expansion. `${#…}` does not compose
   with `:-`; under `set -u` an unset array is a fatal error:
   ```
   $ bash -c 'set -u; n=${#FOO[@]:-0}; echo n=$n'
   bash: FOO: unbound variable   (rc=1)
   ```
2. `trap 'exit 0' ERR` (`:32`) **does not fire** on a `set -u` unbound-variable fatal — it fires
   only on ordinary command failure:
   ```
   $ bash -c 'set -u; trap "echo TRAPPED; exit 0" ERR; echo $UNSET; echo after'
   bash: UNSET: unbound variable   (rc=127, no TRAPPED)
   $ bash -c 'set -u; trap "echo TRAPPED; exit 0" ERR; false; echo after'
   TRAPPED                          (rc=0)
   ```

This is precisely the scenario `source … 2>/dev/null || true` at `:47` exists to survive: a partial
plugin install, an unreadable `lib/`, a lost file. The hook then dies mid-flight, writes no drift
state, prints raw bash diagnostics instead of the message catalogue (AC-2.2's "silence means
verified" inverted), and returns non-zero to `SessionStart`.

**Remedy:** `trap 'exit 0' ERR EXIT` (covers both classes at once), *and* seed the arrays the hook
reads before use — e.g. `declare -a PDLC_ROWS_ID=() PDLC_STATE=() … PDLC_WRITE_FAILURES=()`
immediately after the tolerant `source`. Add a fixture that renames/hides `lib/pdlc-drift.sh` and
asserts `status === 0` for the hook and a member of `{0,2,3,4}` for sync — **no such test exists
today** (`grep -rn "AC-2.4" __tests__` covers internal write failure and fault seams only).

The same cascade on the sync entrypoint:

```
$ bash ./sync-workflows.sh --check ; echo EXIT=$?   →  EXIT=1
$ bash ./sync-workflows.sh          ; echo EXIT=$?   →  EXIT=1   # FSPEC §5.8: sync never exits 1
```

### F-03 — the injected locale never lands

```
$ printf 'dump\tLC_ALL\n' | env LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 bash ./lib-probe.sh
ok	0	C
```

`driftBackups.test.js:126-140` passes `env: {…, LC_ALL: "en_US.UTF-8"}` through `runProbe`, which
forwards it verbatim (`driftProbe.js:95`); `lib-probe.sh:54-55` overwrites it before `source` at
`:61`. The two arms of the test therefore run under identical environments.

**Remedy:** replace the unconditional exports with `: "${LC_ALL:=C}"` / `: "${LANG:=C}"` (preserve
the caller's injection, default only when unset). The subject-side export in
`pdlc-drift.sh:28` then becomes genuinely load-bearing for the `en_US.UTF-8` arm.

### F-05 — the third silent-`[]` path

`packagingViolations` has no `else` after `:217` / `:254`. A manifest of
`{"schemaVersion":1,"rows":"[]"}` — a plausible LLM-relay or hand-edit corruption, and exactly the
D6 array-replaced-by-scalar shape TSPEC §12.1 treats as the most likely mangling — parses fine,
matches neither branch, and returns `[]`.

**Remedy:** return a `6.2(a)` violation with a `detail` naming the parse/shape failure in all three
cases *except* "manifest absent", and add the corresponding row to `RELEASE-CHECKLIST.md` §1.

### F-08 — this repo, post-landing

```
$ pdlc/hooks/scripts/sync-workflows.sh --check ; echo EXIT=$?
pdlc: retired-present — .claude/workflows/orchestrate-dev.js is superseded by orchestrate-dev (unverified). …
pdlc: orchestrate-dev differs from the plugin's copy and has no sync provenance — direction unknown. Diff it, then sync (--force required): …
EXIT=2
```

The detector is right; the documentation is incomplete. **Remedy:** add a third, conditional step to
both bootstrap sections — "on a clone that predates this feature, the leftover untracked bundles
classify `unverified`; diff them against `pdlc/workflows/dist/`, then run `sync-workflows.sh
--force`". The message already says this; the docs should not contradict it with an unqualified
"exits 0 once every row is in sync".

### F-15 — gitignore anchoring, measured

```
$ git --version                                     → 2.50.1
# tree: ./.claude/workflows/g.js and ./a/b/.claude/workflows/f.js
.gitignore = ".claude/workflows/"   → a/b/.claude/workflows/f.js NOT ignored
.gitignore = "workflows/"           → a/b/.claude/workflows/f.js     ignored
.gitignore = "/.claude/workflows/"  → a/b/.claude/workflows/f.js NOT ignored
```

The unanchored and anchored forms behave identically. Keep the implementation; delete the
justification.

---

## Independent review of the items called out for fresh assessment

### The fragment assembly (`build-runtime.mjs:190`, `document-oracles.mjs:62`) — **defensible; no finding**

Byte-identity re-verified by inspection and by running the oracle: `.claude/` + `workflows/` →
`.claude/workflows/`; `"managed " + "manually"` → `managed manually`; `"opying the bundle " + "into
a consumer repo"` → `opying the bundle into a consumer repo`. `coveredViolations(LIVE_ROOT)` is `[]`
and `coveredViolations(FIXTURE_ROOT)` is still exactly the 7 paths.

More importantly, the constraint the assembly could plausibly have weakened — R-10, "never narrow a
pattern" — turns out to be **fully guarded by AT-23**, which I verified rather than assumed. Every
one of the five patterns is *uniquely* load-bearing for at least one fixture file:

| pattern | fixture files matched |
|---|---|
| `.claude/workflows/*.js` | `docs/PLAN-top-level.md` |
| `.claude/workflows/orchestrate-queue.js` | `docs/_queue/QUEUE.md` |
| `.claude/workflows/orchestrate-dev.js` | `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/workflows/orchestrate-dev.js` |
| `managed manually` | `docs/design/MASTER-PLAN.md`, `pdlc/workflows/orchestrate-queue.js` |
| `opying the bundle into a consumer repo` | `pdlc/skills/orchestrate-queue/SKILL.md` |

No file is matched by two patterns, so dropping or narrowing any pattern moves AT-23's count off 7.
Symmetrically, folding either assembly back into a contiguous literal turns AT-22 red on
`LIVE_ROOT`. Both directions of the invariant are therefore mechanically enforced, which is the
right bar for a mechanism whose only purpose is to defeat a self-referential scanner. An FSPEC §7.5
exemption would have been *cleaner to read* but strictly weaker: it would exempt the whole file
forever, including future prose in it. I would not change this.

### The two AT-24 test-side fixes — **both correct**

- `driftHarness.readTraceIfPresent` now routes through `parseTrace`, matching TSPEC §3.1's
  `TraceRecord[]`. This is the fix that un-vacates `driftWriteFailure.test.js:366`.
- AT-24 assertion 7 now mutates the **plugin-side** artifact (rung 5, `stale`) and captures via the
  **hook** rather than `--check`. Both moves are right: FSPEC §3.3 rung 6 makes a consumer-side edit
  `local-edit`/W-4, and `sync-workflows.sh:534-535` documents that `--check` emits no W-5 at all.
  The fixture, not production, was wrong. See F-16 for the one residual (no restore).

### `lib/pdlc-drift.sh` and `sync-workflows.sh` as a whole

Reviewed error paths, exit codes, quoting and the fault seams. All three shell files pass `bash -n`.
Beyond F-01/F-02/F-17 I found nothing to raise. Specifically checked and **clean**:

- **Temp-file discipline.** `_pdlc_atomic_write:1444-1454` and `pdlc_copy_artifact:1668-1685` both
  `rm -f` their sibling temp on every failure branch; the one path that leaves a temp
  (`python3` partially wrote, then `mv` succeeded) lands on the post-copy hash comparison, which
  catches it. Temps are `.pdlc-`-prefixed, so `sync-workflows.sh:276-278`'s not-managed listing
  drops them.
- **`$$` in a subshell** is the parent PID in bash, so concurrent runs from different processes do
  not collide on `.pdlc-tmp.$$.${RANDOM}`.
- **JSON interpolation in `check-workflow-drift.sh:246-248`** is safe: `checkEnabled` is closed to
  the two literals by `pdlc_resolve_check_enabled:857-870` (every other outcome falls back to
  `"true"` plus a notice), and `baselineReason` is closed to the eight-member enumeration by
  `pdlc_resolve_baseline`. Neither can inject.
- **The empty-`PDLC_PY_BIN` manifest-rewrite hazard does not fire.** Step 6 could in principle write
  an empty `.pdlc-sync-manifest.json` if `PDLC_PY_BIN` were unset, but `json-tool-absent` forces
  `baselineStatus: unresolved` (`pdlc_resolve_baseline:898-901`), which gates steps 4-9 off
  entirely (`sync-workflows.sh:313`).
- **The insertion sort at `:292-300`** uses `[[ > ]]` under a process-wide `export LC_ALL=C`
  (`:24`), so it is byte-wise as specified.
- **W-7 deferred-emission ordering** (`:566-597`) correctly prints the stderr-only triad
  unconditionally per rung and then filters those same operations out of the recordable loop, so
  no line is doubled.

### `CLAUDE.md` / `pdlc/README.md` bootstrap and worktree sections

Runnable as written **on a genuinely fresh clone** — AT-24 executes exactly that sequence and
asserts `--check` exit 0. Two defects: F-08 (the sequence does not converge on a pre-existing clone,
including this one) and F-07 (the worktree claim rests on an untested file). The "exits 126 means
the execute bit was lost" claim is correct, and the index modes are right: all five shipped scripts
`100755`, `lib/pdlc-drift.sh` `100644`.

### Systematic sweep for expired placeholders (the class in F-04)

Swept the whole tree for comments keyed to a task/batch ID:
`grep -rniE "placeholder|TODO|FIXME|until T-|before T-|once T-|when T-|red-until|not yet" pdlc/workflows pdlc/hooks`
(46 hits, node_modules/dist excluded), then classified each by whether the *code* still behaves as
the placeholder describes.

**Exactly one live expired placeholder: `splitStderrLines` (F-04).** Every other hit is one of:

- **Historical batch-authoring prose** — file headers recording "RED-terminal at batch N because
  collaborator X is unwritten" (`driftHelpers.test.js:8`, `driftLadder.test.js:7`,
  `driftRepoRoot.test.js:19`, `driftClassify.test.js:13`, `driftSync.test.js:34`,
  `driftWriteFailure.test.js:7`, `bootstrap.test.js:10-23`, `runtimeBundle.test.js:92`,
  `lib-probe.sh:34`, `backup-grammar.sh:16`, `driftProbe.js:12`, …). The collaborators all landed;
  the code is correct; only the narration is stale. Noise, not defect — but it is a lot of noise,
  and it is what let F-04 hide in plain sight. Worth a harvest-phase sweep.
- **Genuinely current** — `driftHarness.js:404-410`'s own note *is* the F-04 residual, correctly
  described.
- **Out of scope** — `guardMatrix.test.js:24-32`'s `it.skip` block is pending the
  *harden-harvest-guard* feature's guard rewrite, not this one; it accounts for the bulk of the 70
  skipped tests and its `isLive` predicate is documented and intentional.
- **Not placeholders at all** — `orchestrate-dev.js:1121-1122` ("Stubs, TODOs, placeholders") is
  dod-verify prompt text; `guardFixtures.js:140` writes a fixture file whose *contents* are the word
  "placeholder"; `pdlc-drift.sh:1924`'s "`<timestamp>-NN.bak` placeholder" is the intended literal
  in a W-4 message.

`documentOracles.test.js:243`'s `[red-until-L-06]` title and `:420`'s describe name are now
misleading (L-06 landed, they are green) — cosmetic, folded into no finding.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-06: which document moves — FSPEC §4.6 ("supersedingState is post-copy exactly as AC-2.6 requires") or PROPERTIES PROP-MTM-04 conjunct 1 ("`post-run` for sync")? AC-2.6 in the approved REQ says "sync: post-copy", so the cheapest resolution is to re-word conjunct 1 to "post-copy for sync" and keep production as-is — but that requires PM sign-off that a record whose `retiredPresent[].supersedingState` disagrees with its own `rows[].state` is acceptable output. |
| Q-02 | F-01: is the C1-absent case in scope for this feature, or is "the plugin is installed intact" a standing precondition? The tolerant `source … \|\| true` at `check-workflow-drift.sh:47` asserts it *is* in scope; if so it needs a test, and AC-2.4 needs the `EXIT` trap. |
| Q-03 | F-08: should the landing commit have left this repo's own `.claude/workflows/` in sync (i.e. should L-09 have included a `--force` sync), or is "the maintainer runs `--force` once" the intended migration? Either is defensible; neither is written down. |
| Q-04 | F-14: is `< 100` on `orchestrate-dev/SKILL.md` a real product constraint (context budget) or a proxy for "no step-by-step dispatch blocks" — which the sibling assertion at `orchestrateDevSkill.test.js:34` already pins directly? |

---

## Positive Observations

- **The fault-injection seam is genuinely well designed.** Bare-literal tokens at every
  `pdlc_fault_active` call site (`sync-workflows.sh:570-572` explains why), a closed token
  vocabulary, unrecognised tokens forced to exit 4 while leaving the computed state byte-identical
  (`:604-613`) — that last property, asserted by AT-18a/AT-18b, is exactly the discipline that makes
  a fault seam trustworthy rather than a second implementation.
- **The three-pass classify architecture is right and the narrow post-copy pass is right.**
  Decisions read only from the as-found pass; the recorded pass is `generatedBy`-determined; step 5
  is a genuine re-invocation of `classify_row`, not a derivation from copy success. FSPEC §4.6's
  paragraph on why deriving would reintroduce the failure this feature exists to catch is the best
  argument in the spec set.
- **`document-oracles.mjs` is root-parameterised with no ambient state**, and the two-root
  independence property is actually asserted (`documentOracles.test.js:257-265`) rather than
  claimed. That is what makes the oracle safe to run against an installed package from
  `RELEASE-CHECKLIST.md`.
- **Post-copy verification is a real re-read.** `pdlc_copy_artifact:1692-1699` re-hashes `dest` from
  disk rather than reusing an in-memory hash, and the failed-verification path removes the
  sync-manifest entry so the row measures `unverified` on every subsequent run — a corrupted copy
  cannot masquerade as a local edit. This is the single most important correctness decision in C1.
- **`lib-probe.sh:151-159`'s refusal to use command substitution** (so C1's global side effects
  survive for later `dump` cases) is a subtle bug avoided, and it is documented at the site.
- **Both directions of the covered-violations invariant are mechanically enforced** (see the
  fragment-assembly section above) — narrowing breaks AT-23, un-assembling breaks AT-22.
- **The `.pdlc-`-prefix convention** cleanly separates managed state, temps and backups from the
  not-managed listing, with no allowlist to keep in sync.

---

## Recommendation

**Needs revision**

Blocking, in order:

1. **F-01** — `trap 'exit 0' ERR EXIT` plus array seeding in `check-workflow-drift.sh`, and a
   C1-absent fixture. AC-2.4 is P0-absolute and is currently violated by a reproducible case.
2. **F-02** — the same hardening on `sync-workflows.sh`, so a broken install cannot exit 1.
3. **F-03**, **F-04** — restore the two tests to falsifiability. Neither is a "weaken/skip/delete";
   both are "make the assertion able to fail for the reason it was written".
4. **F-05** — distinguish absent from unparseable/malformed in `packagingViolations`, and extend
   `RELEASE-CHECKLIST.md` §1 to cover the latter.
5. **F-06** — pick a side (Q-01) and make FSPEC, PROPERTIES and `driftSync.test.js` agree.
6. **F-07**, **F-08**, **F-09** — a test for `.worktreeinclude`; the `--force` upgrade step in both
   bootstrap sections; the PLAN recovery-command correction.

The Low findings (F-10…F-19) are all one- or two-line corrections and can land in the same pass.

---

```
VERDICT: Needs revision
{"high": 1, "medium": 8, "low": 10}
```

---

## Orchestrator adjudication log (Phase CR, v1)

Scope: `pdlc/` (scripts, workflows, tests), root `.gitignore` / `CLAUDE.md`, `docs/pdlc-workflow-distribution/` specs.

Every fact below was re-verified at source by the orchestrator before adjudication; the reviewer's
line references were treated as leads, not as findings of fact.

### F-06 — ESCALATED to High, and the adjudication reverses the reviewer's suggested resolution

The reviewer proposed (Q-01) the "cheapest resolution": re-word PROPERTIES PROP-MTM-04 conjunct 1 to
`post-copy` and keep production as-is. **Rejected.** Re-reading the specs at source shows the
disagreement is three-way, not two-way, and that *production* is the wrong party.

Verified facts:

1. **REQ AC-2.6 is internally contradictory.** Adjacent sentences name three different moments for
   one field: "`supersedingState` is measured at **write time** (… sync: **post-copy**)" and
   "Recorded states are those observed **before this run created anything** (AC-2.9(1))". Write time
   is step 8, post-copy is step 5, "before this run created anything" is step 2.
2. **FSPEC §3's normative pass table already adjudicated it, coherently** — for sync the record
   carries the **post-run** pass (FSPEC ~:1114); the post-copy pass feeds "the retirement decision
   only — **never** the record" (~:1122); the post-run pass feeds "`rows[]`, `retiredPresent[]`, and
   the exit code" (~:1123); AC-2.9(1) governs the **as-found** pass (~:1125). FSPEC §4.6 agrees:
   "the record's `retiredPresent` comes from step 7's re-probe". FSPEC's **OQ-6** flagged AC-2.6's
   "post-copy" as a known open question and was never closed.
3. **A sentence inside FSPEC §4.6 contradicts FSPEC's own table**, asserting `supersedingState` is
   post-copy "exactly as AC-2.6 requires". That sentence is the error inside FSPEC.
4. **PROPERTIES conjunct 1 (`post-run` for sync) is correct** and does not move.
5. **Production splits the difference and is wrong.** `sync-workflows.sh:436` pushes the step-5
   `_pdlc_c3_pc_state` into `_PDLC_C3_RETIRED_STATE`; step 7 (`pdlc_classify_all "post-run"`, `:531`)
   refreshes `rows[]` but never revisits it. Step 6's manifest rewrite (`:440-448`) sits between
   them, and its own comment states that removing a failed-verification row's entry "is what makes a
   corrupted row measure `unverified` rather than `local-edit` on this run's own post-run pass" — so
   the two passes provably diverge. A shipped record can therefore carry
   `supersedingState: "local-edit"` for a retired path while the **same row's** `rows[].state` in the
   **same JSON** reads `unverified`.

**Ruling: the record carries the post-run pass, for `retiredPresent[].supersedingState` as well as
for `rows[]`.** Rationale: FSPEC §3's table is the normative statement and is self-consistent;
AC-2.6's own "at write time" clause points at the last pass before the write; and the alternative
ships a drift-state record that contradicts itself internally — a record that is `orchestrate-queue`'s
*only* input (AC-4.1) for the AC-2.7 unblock decision. An internally inconsistent artifact that
consumers act on is not a cheaper fix, it is a deferred bug.

The `--check` path is already correct and does not change: `--check` copies nothing, so its as-found
state *is* its post-run state by construction (`sync-workflows.sh:541-543` documents exactly this).

**Consequential work:** REQ AC-2.6 amendment; FSPEC §4.6 correction + OQ-6 closure; PROPERTIES
conjunct 2 re-examined for vacuity once conjunct 1 is unambiguous; production fix in
`sync-workflows.sh`; and `driftSync.test.js:805-838` **widened** — its narrowing to five agreement
cases is a test scoped around the bug, and leaving it in place would re-hide the defect.

### F-11 — confirmed, with a different cause than reported

PLAN §6.2's list is 7 rows; L-06's real work list was **9**. The two extras are
`pdlc/workflows/build-runtime.mjs` and `pdlc/workflows/lib/document-oracles.mjs` — **self-matches**:
the 2026-07-28 measurement predates T-09, so the scanner did not yet exist to scan itself. Resolved
by **fragment assembly**, not by exemption; `EXEMPTIONS` stays the frozen four-member literal
(TE F-10). PLAN §6.2 now carries rows 8–9 and the reasoning. This is §6.2's own re-measurement clause
firing as designed, not drift.

### F-12 — confirmed, count corrected

L-03 `chmod`s five scripts but only **three** change mode. Measured against `c28ae99`:
`check-workflow-drift.sh` and `sync-workflows.sh` are already `100755` at the base commit;
`check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` go `100644 →
100755`. Applying `chmod` to all five remains correct — it is the idempotent form. Only the halt-state
description was wrong.

### F-13 — confirmed, count corrected in three places

The fixture is **13 files** (`git ls-files` over the fixture root), not 12: `...EXPECTED_SEVEN` plus
six exempt literals. TSPEC §10.1's *table* has 12 rows because one exempt row bundles two files
(`REQ-some-feature.md` + `FSPEC-some-feature.md`) — hence the off-by-one. Corrected at PLAN L-09,
TSPEC §10.1's fixture row, and `documentOracles.test.js`'s inline comment, each now stating the
**7 + 6** split explicitly so the count cannot be re-derived wrongly from the row count.

### F-15 — confirmed, and the stated rationale was factually wrong

The `.gitignore` comment, TSPEC §10.1 and PLAN L-01 all claimed "an unanchored pattern matches at
every depth". That is not gitignore(5)'s rule. A pattern containing a separator anywhere but the
trailing position is **already** relative to its own `.gitignore`'s directory, so `.claude/workflows/`
and `/.claude/workflows/` match **identically** — the leading slash is redundant. The real hazard
class is a **slash-free** pattern (`workflows/`) or an explicit `**/` prefix.

Measured on git 2.50.1 against a throwaway repo reproducing the fixture's nesting:

| pattern | top-level | nested fixture |
|---|---|---|
| `.claude/workflows/` | ignored | **not ignored** |
| `/.claude/workflows/` | ignored | **not ignored** |
| `workflows/` | ignored | **ignored** |
| `**/.claude/workflows/` | ignored | **ignored** |

The probe is **non-vacuous**: rows 3–4 demonstrate the oracle *can* report a match at depth, so rows
1–2's non-match is a real negative rather than a broken oracle. The shipped pattern is kept
(explicit anchoring is clearer at the cost of one redundant character); all three rationales are
rewritten.

### F-14 — confirmed, marker placed in the test rather than the file

`orchestrate-dev/SKILL.md` measures **99** against `toBeLessThan(100)` — one line of headroom
(verified by evaluating the test's own expression). The marker is placed at the assertion in
`orchestrateDevSkill.test.js`, **not** in SKILL.md, because a marker line in SKILL.md would consume
the last remaining slot and turn the test red. The threshold is not raised: PROP-SKILL-06 is a
property, not a lint knob.

### F-09 — confirmed

PLAN L-06's halt-state recovery said `git checkout -- .`. By that point in the landing sequence
L-02/L-03/L-04/L-07/L-08's uncommitted changes share the working tree, so `-- .` would destroy them
along with L-06's. Rewritten path-scoped, with the reason stated so it is not "simplified" back.

### F-08 — confirmed

Neither `CLAUDE.md` nor `pdlc/README.md` documented the route forward from a skipped row. Both now
carry an `unverified` / `--force` section: what the two skip classes mean, why `unverified` is where
every pre-existing tree lands at first adoption, that overwrites are backed up first (verified at
`sync-workflows.sh:373-378` — `pdlc_backup` precedes `pdlc_copy_artifact` on the path `--force`
reaches), and an explicit caution against reflexive `--force`.

### F-18 — deferred, pending measurement

PLAN L-09's post-commit `advertisedVersionViolation` value cannot be measured while
`lib/document-oracles.mjs` is being edited under F-10. To be measured and corrected once remediation
lands, before re-review.

### F-03 — accepted in part; the reviewer's proposed follow-up **rejected as unbuildable**

Scope: `pdlc/workflows/__tests__/helpers/bin/lib-probe.sh`,
`pdlc/workflows/__tests__/driftBackups.test.js`, TSPEC §3.2 / §5.4 rule table / §11.3 row 2.

**Accepted:** the probe-harness half. `lib-probe.sh`'s top-level `export LC_ALL=C; export LANG=C`
clobbered the caller's injected locale, because the batched driver runs the whole probe list in one
process sharing one environment. The export is now scoped inside `percent_encode()`, which is only
ever reached via command substitution, so it cannot leak to the driver. Verified at source.

**Rejected:** the proposal to give `sameSecondBackups` non-digit varying characters so §11.3 row 2
becomes a real detector for C1's `export LC_ALL=C`. This is not out of scope — it is not
constructible. `pdlc_prune_backups` sorts only `matched[]`, and two filters gate that array:
`pdlc_backup_parse`'s tail rule `^\.([0-9]{8}T[0-9]{6}Z)-([0-9]{2})\.bak$`
(`lib/pdlc-drift.sh:404`), and `[[ "$parsedId" == "$id" ]]` (`:439`), which pins the id constant
across the compared set. Every string that reaches `[[ "$item" > … ]]` (`:453`) is therefore
`{constant id}.{8 digits}T{6 digits}Z-{2 digits}.bak`, varying only in digits. The sort is
locale-invariant **by grammar**, not by the export. Names with non-digit varying characters fail
`pdlc_backup_parse` and never enter `matched[]`, so the proposed fixture would assert a property of
a state the grammar cannot produce — trading a green-for-the-wrong-reason test for a green-about-
nothing one.

**Measured, not assumed** (bash 3.2.57(1), arm64-apple-darwin25; probe run this phase): C and
en_US.UTF-8 give byte-identical results for *both* locale-exposed constructs in C1 — the
`PDLC_M6_ID_REGEX` bracket ranges under `=~` (`abc`/`ABC`/`a-b_c.d` match, `é`/`ábc`/`Ǆx` do not,
under both locales) and bash's own `[[ "A" > "a" ]]` case ordering (`A<a` under both). So on this
platform **no detector for the export exists anywhere**, not merely none in the prune path.

**Ruling.** The export stays — its justification is cross-libc portability (glibc's en_US.UTF-8
collates `a < A < b`, Darwin's does not, so `[[ "$item" > … ]]` would order differently on Linux
CI). That justification is *reasoning, unmeasured here*, and all three documents now label it as
such rather than implying a measurement that was never taken. §11.3 row 2's test is retained and
renamed to what it actually holds — pruning is stable under an injected caller locale, red if the
implementation ever moves onto a locale-sensitive instrument that is reachable (`sort`, `awk`, a
`tr` range, or a bracket range applied to the id rather than a digit run) — with the scope
correction written into the test file itself, so the next reader cannot re-derive the false claim
from a green run. TSPEC §5.4's rule table and §3.2's rationale paragraph corrected to match.

This is the non-vacuity discipline applied to itself: the honest outcome was not a stronger test
but an accurate account of a test that cannot be strengthened, and the retraction of a TSPEC claim
that had been asserted rather than measured.

### F-18 — closed (was deferred pending measurement)

Scope: `docs/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md` L-09.

Deferred earlier this phase because `lib/document-oracles.mjs` was being edited under F-05/F-19 and
any reading taken mid-edit would have been meaningless. That work has landed, so the value is now
measurable. Measured at `HEAD = 05739f3` (the landing commit):

```
advertisedVersionViolation(LIVE_ROOT)
  → { skipped: "AC-6.6 inert: git status --porcelain reports no change under
      pdlc/workflows/dist/, nothing to advertise. This is the ordinary case;
      no invariant is left unverified." }
coveredViolations(LIVE_ROOT).length → 0
packagingViolations(LIVE_ROOT)      → []
```

So the post-commit value is `S_NOTHING_STAGED` — §10.3's branch (a) — **not** the string `"green"`.
L-09's `!== "red"` therefore holds, but it holds because the oracle *declines to judge*, not because
it passes: with `dist/` committed and clean there is no staged change beneath it to advertise. That
asymmetry with L-05's pre-commit `=== "green"` gate is real and was previously left implicit; L-09
now states the measured value and warns against tightening the row to `=== "green"`, which would
turn a correct landing red.

Taken with 26 files dirty from this phase's remediation, all outside `pdlc/workflows/dist/`, so the
`dist/`-scoped probe reads the clean-`dist/` condition and the measurement is the intended one.
