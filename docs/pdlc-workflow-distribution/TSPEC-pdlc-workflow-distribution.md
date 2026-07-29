---
feature: pdlc-workflow-distribution
---

# TSPEC — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (approved, product scope) → `FSPEC-pdlc-workflow-distribution.md` v5.1 (dual-approved 2026-07-28) → **TSPEC** |
| Downstream | `PROPERTIES-pdlc-workflow-distribution.md`, `PLAN-pdlc-workflow-distribution.md`, implementation |
| FSPEC §10 rows disposed here | O-1, O-3, O-7, O-10, O-11, O-12, O-16, O-17 (the eight whose "Lands in" names TSPEC) |
| Rows carried forward | O-9, O-18, O-20 → PROPERTIES; O-19 → implementation phase (duty (d) unit-tested here); O-13 → `consolidate-learnings` |
| Cross-Reviews | *(none yet — Phase T)* |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-28 |

> **Altitude.** The REQ states observable behavior; the FSPEC states how it is produced (components,
> data formats, algorithms, operator strings). This TSPEC states **how it is built and how it is
> proved**: the test surface architecture, the harness that runs bash from jest, the seam grammars
> (`PDLC_TRACE_FILE`, `PDLC_FAULT`), every fixture's construction recipe, the module surface of the
> bash library, and the mapping from the FSPEC's AT-1…AT-36 onto named test cases in named files.
> It does not restate FSPEC behavior; where a behavior is needed to justify a test design it is
> cited by FSPEC section, not reproduced.

---

## 0. Scope and obligation index

### 0.1 What this document decides

| Decision | Section |
|---|---|
| Whether bash behavior is tested from jest via `child_process` or via a bats-style harness | §1.2 |
| The single harness entrypoint every bash test uses, and its environment sandbox | §3 |
| `PDLC_TRACE_FILE`'s record grammar, delimiter, quoting, and traced-probe set | §4 |
| `PDLC_FAULT`'s **closed** token set, at ladder-guard granularity | §5 |
| Which write failures are injectable, and how each is injected on each runner | §6 |
| Permission-fixture policy on uid-0 runners, and the coverage floors | §7, §1.4 |
| Every fixture's construction recipe | §13 |
| The file and test-case each of AT-1…AT-36 lands in | §14 |

### 0.2 Disposition of the eight TSPEC-bound obligations

Every row the FSPEC §10 table routes here, with the section that discharges it. A reviewer verifying
this document checks these eight row by row.

| # | Obligation (abridged) | Disposed in | One-line disposition |
|---|---|---|---|
| **O-1** | Classify-before-create observable: scoped to one classification invocation; row-id + phase fields; positive-presence conjunct; unwritable trace is a red *test* while the script ignores trace failures | **§4.1, §4.3, §4.4** | The trace is a tab-delimited, one-record-per-line append log with `seq`, `phase`, `op`, `rowId`, `arg` columns. The oracle filters to `phase == as-found` and asserts (a) at least one `classify` record exists for **every** manifest row id (positive presence), (b) `max(seq of as-found classify) < min(seq of any create/write op)`, (c) no `mkdir`/`write` record precedes the first `classify` record at all. The unwritable-trace case is a **test-side** assertion: the harness pre-creates the trace path unwritable, asserts the script's exit and stderr are byte-identical to the writable run, and then fails the *test* because the trace is empty. |
| **O-3** | AC-0.5 step 2 reachable only on a non-git fixture; oracle must assert observables that exist in `repo-root-unresolved`; one fault token per guard (git vs walk) | **§8** | Three fixtures (`nonGitWithClaude`, `nonGitNoClaude`, `gitTreeBrokenProbe`), a `PATH`-shadowing `git`-absent mode, and two tokens `git-worktree-list`, `walk-stat`. The `repo-root-unresolved` oracle asserts **stderr W-1 text + `--check` exit 3 + a filesystem-emptiness assertion over the fixture root**, never a drift-state field. |
| **O-7** | Trace delimiter, quoting, and whether non-row probes are traced | **§4.1, §4.2** | Tab (`0x09`) delimiter; values are percent-encoded over `%`, tab, newline, and any byte outside `0x20`–`0x7E`; non-row probes **are** traced (`op ∈ {manifest-read, sync-manifest-read, config-read, plugin-root, repo-root}`) with `rowId` = `-`, and the O-1 oracle filters them out by `op`, not by absence. |
| **O-10** | Injectable failures; per-runner fixture requirements incl. uid-0; fail-open assertions per writer surface; the **closed** `PDLC_FAULT` enumeration at per-rung granularity; the removal-only sync-manifest fixture; AT-14/AT-14b | **§5, §6** | 14-token closed set (§5.2) including the three ladder guards as separate tokens; injectability matrix (§6.1) marking each of the nine `operation` values fault-injectable / permission-constructible / both; fail-open assertion helper `expectFailOpen()` applied per surface (§6.3); `removalOnlySyncManifest` fixture (§6.4); AT-14 built on a `PATH`-shadowed no-interpreter environment, AT-14b on an `r-x` parent with a writable file plus a uid-0 skip (§6.5). |
| **O-11** | Probe vocabulary; uid-0 skip with printed reason and **named** unverified invariants (AT-14b in the inventory); coverage floors | **§7, §1.3, §1.4** | `describeOrSkip(capability, invariants, fn)` prints `SKIPPED <test> — <reason>. Unverified: <invariant list>` and **fails the suite if `invariants` is empty**. Named uid-0 inventory: AT-14b, AT-16, AT-27, AT-32(a), AT-34. Coverage floors: §1.4. |
| **O-12** | Bootstrap fixture construction (working-tree copy with mode bits, `git init` anchor, pinned `HOME`, `realpath` normalisation) and **both** mode-bit assertions | **§9** | `makeFreshClone()` copies the working tree with `cp -R` + explicit `chmod` replay from `git ls-files -s`, runs `git init -b main` + one commit, pins `HOME` to a sibling temp dir, and normalises every compared path through `fs.realpathSync`. Two independent assertions: `git ls-files -s` mode `100755` (index) and `fs.accessSync(X_OK)` (on-disk), asserted for all five scripts. |
| **O-16** | AC-6.6 skip-loudly branch probe order and printed reason strings for (a)–(d); the untracked-addition red fixture | **§10.3** | Probe order `(b) git absent → (c) no .git → (d) unborn HEAD → (a) empty --porcelain`, with four pinned strings; `fxRootUntrackedOnly` builds a `dist/` containing only never-added files with `version` equal to `HEAD`'s, asserted `"red"`. |
| **O-17** | AC-6.4's pinned fixture tree under `pdlc/workflows/__tests__/fixtures/`, its construction, the expected 7 paths, and live-root vs fixture-root as **separate test cases over separate roots** | **§10.1** | `fixtures/covered-violations/` is a checked-in tree of literal files (not generated at runtime), with a `.gitignore`-safe naming scheme; `coveredViolations` is exported from a new `pdlc/workflows/lib/document-oracles.mjs`; AT-22 (live, `== ∅`) and AT-23 (fixture, `== 7` + exact paths + exemption list) are two `it()` blocks with no shared state. |

### 0.3 Explicitly out of scope for this TSPEC

- The classifier's generation axes and property strategies (O-9) — PROPERTIES.
- The backup grammar's round-trip / sort / prune properties (O-18) — PROPERTIES; §11 states only the
  parameterisable surface those properties are written against, and the retention/prune binding.
- AC-2.6's measurement-time reading (O-20) — PROPERTIES; §16 carries it forward verbatim.
- Byte-faithful hardening of `runtime-adapter.js`'s `rtReadFile` (O-19 (a)–(c), Cross-Feature).
  Duty **(d)** — wrapping *this feature's* drift-state read — is this feature's own code and is
  designed and tested here (§12).

---

## 1. Test surface architecture

### 1.1 The one automated surface

REQ §0 fact 10 is measured and binding: `.github/` does not exist, so **`cd pdlc/workflows && npm test`
is the only automated verification surface**, and every automated assertion in this feature is a jest
test under `pdlc/workflows/__tests__/`. There is no second runner, no shell test target, and no
`package.json` script added beyond the existing `test`/`test:watch`
(`pdlc/workflows/package.json:6-9`).

Three consequences the test design must absorb rather than route around:

1. **The subject under test is mostly bash.** C1/C2/C3 (FSPEC §0.2) are bash; jest is a JavaScript
   runner. §1.2 decides the bridge.
2. **There is no CI gate.** FSPEC §7.7: enforcement is maintainer discipline plus `npm test`. So a
   test that is slow, flaky, or environment-dependent will simply be run less often, and the feature
   loses its only detector. That is the argument behind the runner-capability policy (§1.3) and the
   fault seam (§5): every failure mode is reached deterministically, in-process, from a temp dir —
   never by requiring a full disk, a special mount, or root.
3. **Jest's default `testEnvironment: "node"` with `transform: {}`** (same file, lines 15–17) means
   test files are native ESM run under `--experimental-vm-modules`. New test files follow the
   existing convention: `import` from `node:child_process`/`node:fs`, `fileURLToPath(import.meta.url)`
   for paths — the pattern already used by `__tests__/hookCompatibility.test.js:11-19` and
   `__tests__/runtimeBundle.test.js:15-22`.

### 1.2 Harness decision — `child_process` from jest, **not** bats

**Decision: bash behavior is exercised by spawning the real scripts as child processes from jest,
through one shared driver (§3.1). No bats, no `shunit2`, no shell-side test framework.**

This is not a new pattern in this repo — it is the shipped precedent. `__tests__/hookCompatibility.test.js`
already tests two bash hook scripts exactly this way: it probes for bash
(`bashAvailable()`, lines 24–31), resolves the script paths relative to `__dirname`
(lines 34–37), and runs them via `spawnSync("bash", [scriptPath], { input, env, cwd })`
(`runHookScript`, lines 46–58), asserting on `status`/`stdout`/`stderr`. **This TSPEC cites and
reuses that pattern** rather than inventing a second one; §3.1's driver is a generalisation of
`runHookScript` with the additions this feature needs (an environment sandbox, trace/fault seams, and
artifact read-back).

Why bats was considered and rejected:

| Criterion | bats | `child_process` from jest |
|---|---|---|
| Runs under the only automated surface (`npm test`) | **No** — needs a second runner and a second invocation the maintainer must remember; with no CI (REQ §0 fact 10) a second target is a target that stops being run | Yes — one command, one report |
| New dependency | **Yes** — bats-core (plus `bats-assert`/`bats-support` in practice), on a plugin whose only devDependency today is jest | **None** |
| Fixture construction in JS (temp trees, JSON manifests, mode bits, `git init`) | Awkward — shell heredocs and `jq`-free JSON authoring | Native — `fs`/`JSON.stringify`/`execFileSync` |
| Reading assertions over the JSON artifacts (drift state, sync manifest) | Needs a JSON tool *in the test*, i.e. the same dependency the subject degrades on — a test that cannot run in the `json-tool-absent` fixture | `JSON.parse`, always available, **independent of the subject's own JSON-tool probe** |
| Shares fixture builders with the pure-JS oracles (§10, which must be jest anyway) | No — two fixture vocabularies | Yes — one `fixtures/` module set |
| Skip-with-reason policy (O-11) | Possible but ad hoc | `describeOrSkip` (§1.3) with a machine-checkable "invariants named" rule |

The last row of the table is the load-bearing one. AT-14's whole point is a machine with **no JSON
tool**; a bats harness that parses the emitted record with the same Python interpreter it just
removed from `PATH` cannot assert AT-14's "the record parses" conjunct. Running the subject as a
child process while the *assertions* live in JavaScript keeps the oracle strictly outside the
subject's dependency set — which is the property that makes the degradation tests meaningful.

**Stated cost.** Process-spawn tests are slower than in-process ones and they exercise the script as
a black box, so a bash-level branch with no observable difference in exit code, stderr, trace, or
on-disk artifact is untestable. §4 exists precisely to convert one such branch — call ordering — into
an observable. Where a further internal branch needs an observable, the answer is a new trace `op`
(§4.2), never a new production output.

### 1.3 Runner capability policy and the skip-loudly vocabulary (O-11)

Four runner capabilities gate fixtures: `bash`, `git ≥ 2.7.0`, a hash utility (`shasum`|`sha1sum`),
and **non-root uid**. A test whose fixture is unconstructible on this runner **skips loudly** — it
never silently passes and it never silently disappears.

```js
// __tests__/helpers/driftCapabilities.js
export function describeOrSkip(name, capability, unverifiedInvariants, body) { … }
export function itOrSkip(name, capability, unverifiedInvariants, body) { … }
```

Contract, normative:

1. `capability` is one of the four above (or a conjunction). It is probed **once per file** and
   memoised; probes are `execFileSync` with `stdio: "pipe"` inside `try/catch`, and `process.getuid`
   for uid (absent on Windows ⇒ treated as non-root).
2. `unverifiedInvariants` is a **non-empty array of strings**. `describeOrSkip`/`itOrSkip` **throw**
   when it is empty or absent. A generic "permission fixture skipped" line is exactly what FSPEC §10
   O-11 forbids, and making it a throw rather than a lint keeps the rule enforced by the only surface
   that runs.
3. On skip, the helper prints one line to stderr **and** registers a `test.skip` so the skip appears
   in jest's report:
   ```
   pdlc-test: SKIPPED AT-14b — runner uid is 0, so permission bits are bypassed and the atomic
              replace succeeds; the invalidation ladder is never entered.
              Unverified: rung (i) preserves checkEnabled:false (FSPEC §4.4, §2.7);
                          FSPEC §6.2 row 2's opt-out stays reachable on an unwritable-parent consumer.
   ```
4. The **named uid-0 skip inventory** (this is O-11's "named inventory", extended from the FSPEC's
   AT-14b to every test whose fixture is permission-constructed):

   | AT | Fixture depends on | Invariants the skip message must name |
   |---|---|---|
   | AT-14b | `r-x` parent directory, writable file | rung (i) preserves `checkEnabled: false`; FSPEC §6.2 row 2 opt-out reachability |
   | AT-16 | immutable/unwritable file **and** unwritable parent | rung (iii) residual: N-3 emitted at every computation; `--check` exit 4 / hook exit 0 |
   | AT-27 | backup path made unwritable after the write (see §6.1 — fault-injected variant preferred) | AC-2.9(4)'s negative: original bytes untouched on backup-verify failure |
   | AT-32(a) | `.claude/workflows/` non-listable (`-wx`) | AC-0.6: N-6 emitted and **no row state changes** |
   | AT-34 | sync manifest unreadable (mode `000`) | O-8's degraded-provenance wording; N-4 emitted for unreadable, not for absent |

   AT-16, AT-27 and AT-34 each have a **fault-injected twin** (§6.1) that runs on every runner
   including root; the permission fixture is the corroborating form, and only it skips. AT-14b and
   AT-32(a) have no fault-injected twin — AT-14b's whole subject is the permission asymmetry between
   the in-place write and the sibling-temp write (FSPEC §4.4 rung table row 1), and AT-32(a)'s is
   directory-read permission — so those two are the genuine uid-0 coverage holes, and the skip
   message is the only record of them.

### 1.4 Coverage floors (O-11)

Floors are stated as **assertion-count minimums per behavior class**, not as line/branch percentages:
the subject is bash run as a black box, so jest's coverage instrumentation sees none of it and a
percentage would be a fabricated number. The floors are checkable by reading §14's table.

| Class | Floor | Where counted |
|---|---|---|
| Baseline reasons (FSPEC §2.8) | **all 8** reached by at least one test, each asserting the reported `baselineReason` **and** the entrypoint exit | §14 rows AT-2, AT-3, AT-14, AT-14b, AT-33 + `driftBaseline.test.js` table-driven cases |
| Row states (FSPEC §3.3) | **all 6** asserted as an outcome; `unknown` additionally per **each of its 4 reasons** | `driftClassify.test.js` |
| `writeFailures.operation` (REQ §4, 9 values) | the **5 recordable** asserted present in `writeFailures`; the **4 stderr-only** asserted **absent** from the record and present on stderr | `driftWriteFailure.test.js` |
| Exit codes 0–4 | each asserted at least once per entrypoint that can produce it (`--check`: 0,1,2,3,4; sync: 0,2,3,4 — **never 1**, FSPEC §5.8; hook: 0 only) | §14 |
| Ladder rungs (i)/(ii)/(iii) | one landing test each, with the rung **discriminated** (§6.1) | `driftLadder.test.js` |
| Queue mapping rows (FSPEC §6.2, 10 rows) | **all 10**, each with a record that defeats every higher row | `queueDriftGate.test.js` |
| Message catalogue sets S1/S2/S3 (FSPEC §8.2) | pairwise `distinct()` over all three sets | `driftMessages.test.js` (AT-30) |
| Trace phases | all **three** labels (`as-found`, `post-copy`, `post-run`) observed on one sync run | `driftOrdering.test.js` (§4.3) |

A floor is a **failing assertion**, not a checklist: `driftBaseline.test.js` ends with a
"every baseline reason was exercised" test that reads a module-level `Set` populated by each case and
asserts set-equality against the literal eight-member list. Same construction for row states, row
reasons, operations, and mapping rows. This is the repo's shipped meta-oracle pattern
(`__tests__/helpers/guardRowIds.js` + `guardMatrix.test.js` do the same for guard rows) and is
**cited and reused** rather than reinvented.

---

## 2. Implementation architecture

### 2.1 File inventory

New and modified files, with the owning FSPEC component.

| Path | Kind | New/Mod | FSPEC component |
|---|---|---|---|
| `pdlc/hooks/scripts/lib/pdlc-drift.sh` | bash, **sourced** (no execute bit — FSPEC OQ-4) | new | C1 |
| `pdlc/hooks/scripts/check-workflow-drift.sh` | bash, executable `100755` | new | C2 |
| `pdlc/hooks/scripts/sync-workflows.sh` | bash, executable `100755` | new | C3 |
| `pdlc/hooks/hooks.json` | JSON | mod — second `SessionStart` entry | C7 |
| `pdlc/hooks/scripts/{check-scope-field,guard-harvest-before-delete,nudge-consolidation}.sh` | bash | mod — **mode only**, `100644` → `100755` | REQ §6 class fix |
| `pdlc/workflows/build-runtime.mjs` | ESM (node) | mod — `OUT_DIR` → `dist/`, manifest emission | C5 |
| `pdlc/workflows/lib/document-oracles.mjs` | ESM (node), **no side effects** | new | oracle host (§10) |
| `pdlc/workflows/orchestrate-queue.js` | ESM | mod — drift gate + O-19(d) wrapper | C6 |
| `pdlc/workflows/dist/*.bundle.js`, `dist/distribution-manifest.json` | generated, tracked | new | build output |
| `.claude/workflows/**` | untracked after landing | mod — `git rm` + gitignore | FSPEC §7.5 item 1 |
| `.worktreeinclude` (repo root) | text | new | FSPEC §7.5 item 7 / §11.1 |
| `pdlc/.claude-plugin/plugin.json` | JSON | mod — `version` bump (AC-6.6) | FSPEC §7.5 item 2 |
| `CLAUDE.md`, `pdlc/README.md` | docs | mod — bootstrap + worktree limitation | AC-6.5, §7.5 items 6, 8 |
| plus whatever `coveredViolations(liveRepoRoot)` returns (7 files today) | docs | mod | AC-6.4 |

Test files and helpers are in §14's placement table; fixtures in §13.

**Why `lib/document-oracles.mjs` is production code and not a test helper.** `coveredViolations`,
`packagingViolations` and `advertisedVersionViolation` are pure functions of a root directory
(FSPEC §7.3, §7.4, §7.5) that the tests call over **two different roots**. Putting them in
`__tests__/` would make the fixture-root call site import from a directory jest's
`testPathIgnorePatterns` excludes only by convention, and would hide them from the release checklist,
which is a named consumer (AC-6.2a). They live in `pdlc/workflows/lib/`, are imported by
`__tests__/documentOracles.test.js`, and are inside `pdlc/` so they ship — harmless, and it makes the
release checklist runnable against an installed plugin.

### 2.2 C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`) — the sourced library surface

C1 is sourced, never executed, and holds no state beyond its documented output variables
(FSPEC §0.2). Because bash has no return values, the surface is expressed as
**function → exit status + named output variables**. Every function name is prefixed `pdlc_` so a
consumer's shell cannot collide.

| Function | Inputs | Exit status | Output variables |
|---|---|---|---|
| `pdlc_resolve_repo_root` | `$PWD`, `$HOME` | 0 resolved / 1 unresolved | `PDLC_REPO_ROOT` |
| `pdlc_probe_json_tool` | `PATH` | 0 found / 1 absent | `PDLC_PY_BIN` |
| `pdlc_json_read <file> <query>` | — | `0` parsed / `10` unreadable / `11` absent / `12` malformed (FSPEC §2.3) | stdout = value |
| `pdlc_probe_hash_tool` | `PATH` | 0 / 1 | `PDLC_HASH_BIN`, `PDLC_HASH_ARGS` |
| `pdlc_sha1 <file>` | — | 0 / 1 | stdout = 40 hex chars |
| `pdlc_resolve_plugin_root` | `PDLC_REPO_ROOT`, `CLAUDE_PLUGIN_ROOT` | 0 / 1 | `PDLC_PLUGIN_ROOT`, `PDLC_PLUGIN_ROOT_REASON` |
| `pdlc_load_manifest` | `PDLC_PLUGIN_ROOT` | 0 / 1 | `PDLC_ROWS[]` (parallel arrays `_ID`, `_PLUGIN_PATH`, `_CONSUMER_PATH`, `_ARTIFACT_VERSION`, `_SHA1`, `_RETIRES`), `PDLC_MANIFEST_REASON` |
| `pdlc_validate_manifest` | loaded rows | 0 / 1 | `PDLC_MALFORMED_CLAUSE` (M1…M10) |
| `pdlc_resolve_check_enabled` | `PDLC_REPO_ROOT` | always 0 (fail-closed) | `PDLC_CHECK_ENABLED` |
| `pdlc_resolve_baseline` | all of the above | 0 resolved / 1 unresolved | `PDLC_BASELINE_STATUS`, `PDLC_BASELINE_REASON`, `PDLC_EVIDENCE_*` (per-probe `holds`/`does-not-hold`/`indeterminate`) |
| `pdlc_classify_row <rowIndex> <phase>` | resolved baseline | always 0 | `PDLC_ROW_STATE`, `PDLC_ROW_REASON`, `PDLC_ROW_PLUGIN_HASH`, `PDLC_ROW_CONSUMER_HASH`, `…_ARTIFACT_VERSION` |
| `pdlc_classify_all <phase>` | — | always 0 | `PDLC_STATE[]` etc., indexed like `PDLC_ROWS` |
| `pdlc_write_drift_state <generatedBy>` | built record | 0 / 4 | appends to `PDLC_WRITE_FAILURES[]` |
| `pdlc_emit_printf_record …` | closed-domain fields only | 0 / 1 | — |
| `pdlc_backup <srcPath> <id>` | — | 0 / 1 | `PDLC_BACKUP_PATH` |
| `pdlc_prune_backups <id>` | — | 0 | — |
| `pdlc_trace <phase> <op> <rowId> <arg>` | `PDLC_TRACE_FILE` | **always 0** | — |
| `pdlc_fault_active <token>` | `PDLC_FAULT` | 0 active / 1 inactive | — |
| `pdlc_msg_*` | — | 0 | stdout/stderr lines per FSPEC §8 |

Two structural rules, both testable from the harness:

- **`pdlc_classify_row` takes `phase` as a parameter.** It is the only place the trace's phase label
  is set, so the three passes cannot be mislabelled by a caller that forgot; §4.3's oracle depends on
  this being a single site.
- **`pdlc_trace` always returns 0**, including when the append fails. FSPEC §4.6: the script ignores
  trace failures. Implemented as `{ printf … >>"$PDLC_TRACE_FILE"; } 2>/dev/null || true`. §4.4 is
  the red test that this is *not* softened into "the trace must be writable".

### 2.3 C5 (`build-runtime.mjs`) — retarget and manifest emission

Three edits, all local:

1. `OUT_DIR` changes from `resolve(REPO_ROOT, ".claude", "workflows")`
   (`pdlc/workflows/build-runtime.mjs:27`) to `resolve(HERE, "dist")`. The existing
   `mkdirSync(OUT_DIR, { recursive: true })` (line ~158) and the `--check`/write loop are unchanged in
   shape — only the directory moves, which is what keeps AC-6.1's "sole output directory" true by
   construction.
2. After the bundle loop, emit `dist/distribution-manifest.json`. `pluginSha1` is computed with
   `createHash("sha1").update(contents)` **over the same in-memory `contents` string the loop just
   wrote**, so the manifest cannot disagree with what landed (FSPEC §7.1). `artifactVersion` and
   `pluginVersion` are read from `pdlc/.claude-plugin/plugin.json`.
3. The manifest is itself subject to `--check`: if the computed manifest text differs from what is on
   disk, `--check` reports it stale exactly as a bundle. Without this, AC-6.3's freshness gate has a
   hole precisely at the file that records freshness.

The existing log lines (`in-sync` / `wrote` / `STALE`) are retargeted to `pdlc/workflows/dist/…`. No
new dependency: `node:crypto` is a builtin, so REQ §0 fact 8's node-builtins-only footprint holds.

**Manifest key order is fixed and the serialisation is `JSON.stringify(obj, null, 2) + "\n"`.**
Determinism matters here for a reason beyond taste: AC-6.3's freshness assertion is a byte comparison,
so an unordered `rows` array or a variable indent would make the builder non-idempotent and the
freshness test flaky. `rows` is ordered by `id`, ascending, `LC_ALL=C`; `retired` is the sorted unique
union of every row's `retires`.

### 2.4 C6 (`orchestrate-queue.js`) — the drift gate

Two additions to the module, both pure and both unit-testable without a filesystem:

```js
export function validateDriftRecord(value) -> { ok: true, record } | { ok: false, clause: "D1".."D8" }
export function mapDriftState(record) -> { outcome: "proceed"|"blocked", row: 1..10,
                                           reasons: […], report: { manifest: […], row: […], run: […] } }
```

and one wiring change inside `main` (`pdlc/workflows/orchestrate-queue.js:504`), placed **before** the
existing `Queue: Load` read at line 523, so a blocked drift state costs no queue work:

```js
const driftRaw = await readDriftStateSafely(readFileFn);   // O-19(d) wrapper — §12
const gate = mapDriftState(validateDriftRecord(driftRaw));
if (gate.outcome === "blocked") return buildQueueReport({ outcome: "blocked", … });
```

`readDriftStateSafely` is the O-19(d) wrapper: `try { return await readFileFn(P); } catch { return null; }`.
The pre-existing unwrapped `await readFileFn(queuePath)` at line 523 is **left alone** (FSPEC §6.1 —
changing it is a behavior change to another feature's path).

Per CLAUDE.md's runtime rule, **the injected read is `await`ed** and both bundles are rebuilt in the
same commit; `__tests__/runtimeBundle.test.js`'s freshness assertion (currently
`build-runtime.mjs --check`, lines 78–86) is repointed at `dist/` and keeps enforcing that.

`mapDriftState` returns the **row number** as well as the outcome. That is a deliberate test affordance:
FSPEC §6.2's mapping is a precedence table, and asserting only `blocked` cannot tell row 3 from row 6,
so every fixture that "defeats every higher row" would pass against an implementation with the rows in
the wrong order. §1.4's floor is stated over rows, not outcomes, and only works because the row is
returned.

### 2.5 Determinism rules binding every component

Carried from FSPEC §3.6 and made concrete, because each is a bash idiom that is easy to reintroduce:

| Rule | Implementation | Where a test would catch a regression |
|---|---|---|
| `LC_ALL=C` everywhere | `export LC_ALL=C` at the top of C1, before any sort/compare | AT-30's substring predicate; backup-prune ordering |
| No mtime, anywhere | no `stat -c %Y`, no `find -newer`, no `ls -t` in C1/C3 | `driftClassify.test.js` "state is identical after `touch`-ing both sides" |
| Row order follows the manifest | iterate `PDLC_ROWS` by index, never a glob | `driftState.test.js` asserts `rows[].id` order equals manifest order for a manifest whose ids are in non-alphabetical order |
| `not-managed` sorted | `printf '%s\n' "${…[@]}" \| LC_ALL=C sort` | AT-25 |
| No env-order dependence | no `for v in $(env)`; no `${!PDLC_@}` iteration in a decision path | reviewed, plus `driftOrdering.test.js` runs one fixture twice with shuffled env additions and asserts byte-identical drift state modulo `generatedAtUtc` |

## 2. Implementation architecture

### 2.1 File inventory

### 2.2 C1 (`pdlc-drift.sh`) — the sourced library surface

### 2.3 C5 (`build-runtime.mjs`) — retarget and manifest emission

### 2.4 C6 (`orchestrate-queue.js`) — the drift gate

### 2.5 Determinism rules binding every component

## 3. The bash harness

### 3.1 `runScript()` — the single driver

### 3.2 The environment sandbox

### 3.3 Consumer-tree builders

### 3.4 Reading back the artifacts

## 4. `PDLC_TRACE_FILE` — grammar and the classify-before-create oracle (O-1, O-7)

### 4.1 Grammar

### 4.2 What is traced, and what is not

### 4.3 The AC-2.9(1) oracle

### 4.4 The unwritable-trace red test

## 5. `PDLC_FAULT` — the closed token enumeration (O-10)

### 5.1 Token grammar and composition

### 5.2 The enumeration

### 5.3 Rung granularity for the invalidation ladder

### 5.4 Unrecognised tokens

## 6. Write-failure test design (O-10)

### 6.1 Injectability matrix

### 6.2 Per-runner fixture requirements and the uid-0 caveat

### 6.3 Fail-open assertions per writer surface

### 6.4 The removal-only sync-manifest-rewrite fixture

### 6.5 The json-tool-absent ladder tests — AT-14 and AT-14b

## 7. Probe vocabulary and permission-fixture policy (O-11)

## 8. Repo-root resolution — the non-git fixture and its oracle (O-3)

## 9. Bootstrap fixture construction (O-12)

## 10. Root-parameterised jest oracles

### 10.1 `coveredViolations(root)` and the pinned fixture tree (O-17)

### 10.2 `packagingViolations(root)`

### 10.3 `advertisedVersionViolation(root)` and the skip-loudly branches (O-16)

## 11. Backup filename grammar — TSPEC's contribution (O-18 hand-off)

## 12. Queue-side design — shape validator and the O-19(d) wrapper

## 13. Fixture inventory with construction recipes

## 14. AT → test case → file placement

## 15. Traceability

## 16. Hand-off table — obligations leaving this document

## 17. Risks and stated residuals
