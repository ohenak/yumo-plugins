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

---

## 3. The bash harness

One module, `__tests__/helpers/driftHarness.js`, exports everything in this section. It is a
generalisation of `hookCompatibility.test.js`'s `runHookScript` (lines 46–58) with four additions
this feature needs: a **closed** environment, the two seams, tree builders, and artifact read-back.

### 3.1 `runScript()` — the single driver

```js
/**
 * @param {"hook"|"check"|"sync"|"sync-force"} entrypoint
 * @param {RunOpts} opts
 * @returns {RunResult}
 */
export function runScript(entrypoint, opts) { … }
```

| `RunOpts` field | Meaning | Default |
|---|---|---|
| `consumerRoot` | the tree the script runs against; also the default `cwd` | **required** |
| `pluginRoot` | value of `CLAUDE_PLUGIN_ROOT` | unset (the maintainer-marker branch, §2.4) |
| `home` | value of `HOME` | a **sibling** temp dir of `consumerRoot`, never its ancestor |
| `cwd` | process cwd | `consumerRoot` |
| `path` | array of tool names the sandbox `PATH` may resolve | `["bash","git","python3","shasum","sha1sum","mv","rm","date","printf"]` |
| `fault` | array of `PDLC_FAULT` tokens (§5) | `[]` ⇒ the variable is **unset**, not empty |
| `trace` | `true` \| `false` | `true` |
| `env` | extra variables, merged last | `{}` |
| `argv` | extra script arguments (`--check --force` usage-error cases) | derived from `entrypoint` |

`entrypoint` maps to an invocation, not to a flag string, so no test hard-codes an argv:

| `entrypoint` | Invocation | `generatedBy` |
|---|---|---|
| `hook` | `bash <plugin>/hooks/scripts/check-workflow-drift.sh` with the SessionStart JSON on stdin | `hook` |
| `check` | `bash <plugin>/hooks/scripts/sync-workflows.sh --check` | `check` |
| `sync` | `bash …/sync-workflows.sh` | `sync` |
| `sync-force` | `bash …/sync-workflows.sh --force` | `sync` |

`RunResult`:

```js
{ status, stdout, stderr,          // spawnSync, encoding "utf8"
  trace,                           // TraceRecord[] — §4.1, [] when trace:false
  tracePath,                       // for the negative assertions of §4.4
  notices,  warnings }             // stderr split into N-*/W-* lines by the §7.2 matchers
```

`status` is `result.status ?? -1` — the same normalisation the shipped helper uses, so a killed
process can never read as exit 0.

**Scripts are invoked as `bash <path>`, deliberately, everywhere except §9.** Invoking through the
interpreter makes every behavioral test independent of the execute bit, so a mode regression fails
**only** AC-6.5's own mode assertions (§9.3) and does not turn 200 unrelated tests red with
`EACCES`. §9 is the one place the bare-path form is exercised, because that is what AC-6.5 asserts.

### 3.2 The environment sandbox

The child's environment is **constructed, never inherited**. `hookCompatibility.test.js` spreads
`...process.env`; this feature must not, and the reason is not hygiene:

- The subject resolves `<repoRoot>` from `$PWD` **and rejects `$HOME`** (§2.2 clause 2). A leaked
  developer `HOME` makes clause 2's rejection either untested or accidentally triggered.
- `CLAUDE_PLUGIN_ROOT` is very often set in the environment a maintainer runs `npm test` in — this
  is a Claude Code plugin repo — and it is precisely the variable AT-24, AT-33 and every
  `plugin-root-unset` fixture need **unset**.
- `PDLC_FAULT` / `PDLC_TRACE_FILE` leaking between tests would be a silent cross-contamination of
  exactly the seam the assertions read.

```js
function sandboxEnv(opts) {
  return {
    PATH: makeToolDir(opts.path),     // §3.2.1
    HOME: opts.home,
    PWD: opts.cwd,
    TMPDIR: opts.tmp,
    LC_ALL: "C", LANG: "C", TZ: "UTC",
    ...(opts.pluginRoot ? { CLAUDE_PLUGIN_ROOT: opts.pluginRoot } : {}),
    ...(opts.trace ? { PDLC_TRACE_FILE: opts.tracePath } : {}),
    ...(opts.fault.length ? { PDLC_FAULT: opts.fault.join(",") } : {}),
    ...opts.env,
  };
}
```

Nothing else is present. `LC_ALL=C` is set on the child so the harness never depends on C1's own
`export LC_ALL=C` (§2.5) being present — a test that relied on the subject to set it could not
detect its removal; §11.3's sort property asserts the subject-side export separately.

#### 3.2.1 `makeToolDir(names)` — how a tool is made absent

`PATH` is a **single directory** containing one symlink per requested tool, resolved once per jest
worker via `execFileSync("command", ["-v", name])` and memoised. Removing a tool from a fixture is
therefore removing it from the `path` array — not editing a colon-list, and not depending on what
the runner happens to have installed elsewhere.

| Fixture | `path` omits | Reaches |
|---|---|---|
| `json-tool-absent` (AT-14) | `python3`, `python`, `python2` | §2.1 E2 ⇒ `jsonToolAbsent` |
| `hash-tool-absent` | `shasum`, `sha1sum`, `openssl` | §3.3 rung 1 ⇒ every row `unknown` |
| `git-absent` (AT-21, §8.2) | `git` | §2.2's `else` branch; §10.3 branch (b) |

The tool list is asserted, not assumed: `makeToolDir` **throws** if a requested tool cannot be
resolved, so a runner missing `shasum` fails loudly at fixture construction instead of silently
producing a `hash-tool-absent` tree under a test that expected `in-sync` (§12's standing
precondition). That throw is caught by §7's `describeOrSkip("hash")` at the file level, which is
where the skip belongs.

### 3.3 Consumer-tree builders

```js
export function makeConsumerTree(spec) -> { root, home, tmp, cleanup }
export function makePluginTree(spec)   -> { pluginRoot, manifest, bytesOf }
export function setRowState(trees, id, state, opts)   // the six-state table below
```

Every tree is created with `mkdtempSync(join(realpathSync(tmpdir()), "pdlc-"))`. **`realpathSync` is
applied at construction, not at comparison** — on macOS `tmpdir()` is `/var/folders/…`, a symlink
into `/private/var`, and §2.2 compares paths after `realpath`-style normalisation. Normalising once
at the root means no assertion in the suite has to remember to normalise, and the `$HOME`-rejection
fixture (§8.4) is exact rather than approximately exact.

`home` is a **sibling** of `root`, never an ancestor: if `HOME` contained `root`, §2.2's walk would
stop before reaching the fixture's `.claude/` and every `repo-root` fixture would be measuring the
`$HOME` guard instead of what it meant to measure.

`makeConsumerTree(spec)` clauses, each independently settable:

| Clause | Effect |
|---|---|
| `git: true` | `git init -b main`, `user.name`/`user.email` set locally, one empty commit |
| `git: false` | no `.git` anywhere from `root` up to `home` |
| `claudeDir: true \| false` | create `.claude/` (AC-3.8's two fixtures) |
| `workflowsDir: true \| false \| { mode }` | `.claude/workflows/`, optionally `r-x` (AT-14b) or `-wx` (AT-32a) |
| `files: { <relPath>: string \| Buffer }` | arbitrary consumer content — `not-managed` files, retired paths |
| `syncManifest: object \| "absent" \| "unreadable" \| "malformed"` | §1.2's three degradations |
| `config: object \| "absent" \| "unreadable" \| "malformed"` | `.claude/pdlc.config.json` (E7) |
| `driftState: string \| object \| "absent"` | the pre-existing record the T2 ladder needs |

`makePluginTree(spec)` writes `workflows/dist/` plus `distribution-manifest.json`, computing every
`pluginSha1` from the bytes it just wrote, so M8/M9 hold by construction. A malformed-manifest
fixture is expressed as `manifestOverride: (obj) => obj`, applied **after** that computation — which
is what makes each of M1–M10 a one-line fixture (`obj.rows[0].pluginSha1 = "zz…"` for M9,
`obj.retired = []` for M8, …) with no risk of accidentally satisfying a clause the test meant to
break.

**The six row states, each with its construction recipe.** This table is the single definition;
§13's inventory references it rather than restating it.

| State | Recipe (`setRowState`) |
|---|---|
| `in-sync` | consumer bytes := plugin bytes. Sync-manifest entry **irrelevant** — R-4/O-8; AT-6 asserts exactly this with the manifest absent |
| `missing` | consumer path absent; its first existing ancestor traversable (`.claude/workflows/` present and `r-x` at least) — the definite-negative rule, §3.2 |
| `stale` | consumer bytes := X ≠ plugin bytes; sync-manifest entry with `consumerHash = sha1(X)` |
| `local-edit` | consumer bytes := Y; sync-manifest entry with `consumerHash = sha1(X)`, X ≠ Y ≠ plugin |
| `unverified` | consumer bytes ≠ plugin bytes; **no** entry for the id (or a degraded manifest) |
| `unknown` | one of the four reasons — see §7.1's probe table for the per-reason recipe |

Two of these are traps a hand-built fixture falls into, so `setRowState` asserts against them:
constructing `stale` with consumer bytes that happen to equal the plugin's yields `in-sync` (rung 3
precedes rung 5), and constructing `local-edit` without an entry yields `unverified` (rung 4
precedes rung 6). `setRowState` re-derives the expected classification from the tree it just built
and throws if it does not match the requested state — the fixture builder is its own first oracle.

### 3.4 Reading back the artifacts

```js
export function readDriftState(root)   -> object | null        // JSON.parse; null iff absent
export function readSyncManifest(root) -> object | null
export function listBackups(root)      -> { id, stamp, nn, name, bytes }[]   // §11.1's parser
export function inodeOf(path)          -> bigint | null        // statSync(bigint).ino — AT-15
export function indexMode(root, rel)   -> "100644" | "100755"  // git ls-files -s — §9.3
```

Three rules these carry:

1. **`JSON.parse`, never a subprocess.** The oracle must stay outside the subject's dependency set
   (§1.2's load-bearing row): AT-14's tree has no Python interpreter, and a read-back that shelled
   out to one could not assert "the `printf` emitter's record parses".
2. **`readDriftState` distinguishes absent from unparseable**, returning `null` only for absent and
   **throwing** on a parse failure. A helper that returned `null` for both would let the ladder's
   rung-(iii) assertion (`no record`) pass against an implementation that wrote a corrupt one.
3. **`inodeOf` returns `bigint`** (`statSync(p, { bigint: true }).ino`). AT-15's whole discriminator
   is inode identity across the ladder, and `Number` silently loses precision on the large inode
   numbers APFS and XFS issue.

---

## 4. `PDLC_TRACE_FILE` — grammar and the classify-before-create oracle (O-1, O-7)

### 4.1 Grammar

One record per line, **tab-delimited**, five fields, appended in call order.

```
record ::= seq TAB phase TAB op TAB rowId TAB arg LF
seq    ::= [1-9][0-9]*                       strictly increasing within one invocation, from 1
phase  ::= "as-found" | "post-copy" | "post-run" | "run"
op     ::= see §4.2
rowId  ::= <manifest row id> | "-"           "-" for every non-row record
arg    ::= percent-encoded value, possibly empty
```

**Why tab (`0x09`) and not `|` or space.** The two fields that can carry arbitrary bytes are `rowId`
(M6-constrained, so safe) and `arg` (a filesystem path, not safe). A delimiter must be a byte the
encoder can guarantee out of `arg`. Tab is (a) excluded by the encoding rule below, (b) already
excluded from M6's id charset, and (c) trivially split in both bash (`IFS=$'\t'`) and JavaScript
(`line.split("\t")`). `|` and space are legal path bytes and would need an escape the emitter does
not otherwise need; comma is the `PDLC_FAULT` separator and reusing it invites confusion between
the two seams.

**Quoting — one rule, the same shape as FSPEC §4.4's path predicate, and deliberately so.**
`arg` is percent-encoded over exactly: `%` (`0x25`), tab (`0x09`), newline (`0x0A`), carriage
return (`0x0D`), and every byte outside `0x20`–`0x7E`. Encoded form is `%XX`, uppercase hex.

- The **encoder is `printf` + a `LC_ALL=C` byte loop** in C1, with no dependency on the JSON tool —
  the trace has to work on the `json-tool-absent` fixture, which is where AT-14's ordering
  assertions live.
- The **decoder is `decodeURIComponent`-shaped but byte-exact**: `Buffer.from(field.replace(/%([0-9A-F]{2})/g, …))`, so a
  non-UTF-8 path round-trips to a `Buffer` rather than throwing. §4.3's oracle compares `rowId`s and
  `op`s, never decoded paths, so this only matters for diagnostics — but a decoder that throws on a
  legitimately non-UTF-8 fixture path would fail the test for the wrong reason.
- The rule is byte-decidable under `LC_ALL=C` and needs no UTF-8 validation — the same property
  FSPEC §4.4 argues for the emitter, reused rather than re-derived.

**`seq` is emitted but the oracle orders by line index.** Ordering by line index is immune to a
`pdlc_trace` call that ran inside a subshell (where a counter increment is lost); `seq` is then a
**self-check**: the oracle asserts `seq` is `1,2,3,…` with no gap or repeat, and a violation reports
"a traced call ran in a subshell" rather than silently degrading the ordering assertion. Both
properties are cheap and they fail for different reasons, which is the point.

### 4.2 What is traced, and what is not — and the single-invocation scoping

**Non-row probes are traced** (O-7's question, answered `yes`). The `op` vocabulary is closed:

| `op` | Emitted at | `rowId` | `arg` |
|---|---|---|---|
| `run` | once, first record of the invocation | `-` | the entrypoint (`hook`\|`check`\|`sync`\|`sync --force`) |
| `repo-root` | §2.2, after E1 | `-` | the resolved root, or empty when unresolved |
| `plugin-root` | §2.4, after E3 | `-` | the resolved plugin root, or empty |
| `manifest-read` | §2.5 E4/E5 | `-` | the manifest path |
| `config-read` | §2.7 E7 | `-` | the config path |
| `sync-manifest-read` | §1.2's read | `-` | the sync-manifest path |
| `classify` | once per row **per pass** | the row id | the resulting state |
| `mkdir` | §4.2 step 3, once per directory created | `-` | the directory |
| `write` | every drift-state / sync-manifest write **attempt** | `-` | the target path |
| `copy` | §5.5, per row, at the `mv` | the row id | the consumer path |
| `backup` | §4.7 step 1, per backup | the backup id | the backup path |
| `delete` | §5.7's retirement delete | the row id | the retired path |

Tracing the non-row probes is what lets the oracle be **positive** rather than an
absence-of-evidence argument: an implementation that skipped the manifest read entirely would
produce a trace with no `manifest-read` record, and §4.3(d) catches it. It costs nothing, because
the oracle discriminates by `op`, never by "this record has `rowId == "-"` so ignore it" — that
latter form is the one that silently absorbs a new untraced probe.

**Single-invocation scoping — by construction, not by parsing.** `runScript()` allocates a
**fresh trace path per invocation** (`<tmp>/trace/<n>.tsv`). A trace file therefore contains exactly
one invocation, and `parseTrace()` **asserts** it: exactly one `run` record, and it is the first
line. An oracle that had to segment a shared append log would have to trust a delimiter emitted by
the very code whose ordering it is checking; a fresh path removes the question. Multi-invocation
fixtures (AT-9's sync-then-sync, AT-33's `--check`-then-hook) get one trace each and assert over
them independently.

### 4.3 The AC-2.9(1) oracle

```js
// __tests__/helpers/driftOrdering.js
export function assertClassifyBeforeCreate(trace, expectedRowIds) { … }
```

Let `T` be the parsed records in line order, `C = T.filter(r => r.phase === "as-found" && r.op === "classify")`,
and `M = T.filter(r => ["mkdir","write","copy","backup","delete"].includes(r.op))` — the **mutating**
ops. The helper asserts all four conjuncts:

| # | Conjunct | Catches |
|---|---|---|
| (a) | `new Set(C.map(r => r.rowId))` **equals** `new Set(expectedRowIds)`, and `expectedRowIds` is non-empty | the vacuous pass — an empty or truncated trace, and an implementation that classifies only the first row |
| (b) | `max(index of C) < min(index of M)` | the ordering itself: every as-found classification precedes every mutation |
| (c) | `M.length === 0 || C.length > 0`, and `min(index of C) < min(index of M)` | a run that creates *before* classifying anything at all — (b) alone is vacuously true when `C` is empty, which is exactly the regression this exists to catch |
| (d) | `T` contains a `manifest-read` record, and it precedes every member of `C` | a classifier that ran off something other than the manifest (AC-0.1's globbing prohibition) |

Conjunct (a) is O-1's mandated **positive-presence** conjunct and it is stated over the **row-id
set**, not over a count: a count assertion passes against an implementation that classifies one row
twice and another zero times, which is precisely the shape a `for` loop with a mis-scoped variable
produces in bash.

**Phase scoping.** The oracle filters to `phase === "as-found"` because a sync run's post-copy and
post-run passes legitimately follow the mutations. The complementary assertions live in the same
helper and are asserted by the sync fixtures:

- `assertPhaseOrder(trace)`: the phase label sequence, with `run` records dropped, is a prefix of
  `[as-found]`, `[as-found, post-copy, post-run]` — never interleaved, never out of order.
- `assertPostCopyNarrow(trace, retiringIds)`: the `post-copy` classify records' row-id set equals
  `retiringIds` exactly. FSPEC §3's table calls that pass **narrow**; without this assertion an
  implementation that re-classified everything at step 5 is indistinguishable, and §13.1's NFR-2
  bound quietly becomes `2 × 3 × |rows|` on every run.
- `assertRecordedPassIs(trace, driftState, "post-run" | "as-found")`: the states in the record equal
  the states the named phase's classify records carried. This is the executable form of FSPEC
  §4.2's "which pass the record carries" table and it is what O-20's PROPERTIES rows will build on
  (§16).

### 4.4 The unwritable-trace red test

FSPEC §4.6 splits the responsibility: **the script ignores a trace-write failure; the test that
relies on the trace treats it as red.** Both halves are asserted, in `driftOrdering.test.js`:

```
it("an unwritable trace does not change any production observable", …)
it("…and the harness fails the test rather than passing vacuously", …)
```

**Construction — `ENOTDIR`, not a permission bit.** The trace path is
`<tmp>/blocker/trace.tsv` where `blocker` is a **regular file**. Every `open(…, O_APPEND|O_CREAT)`
under it fails `ENOTDIR`, and unlike a `chmod 000` this is **not bypassed by uid 0** — so this test
runs on every runner and needs no §7 skip. (A permission-bit construction would have made the one
test that guards the whole trace-based oracle set the test most likely to be skipped.)

Test 1 runs the identical fixture twice, with a writable trace path and with the blocked one, and
asserts `status`, `stdout` and `stderr` are **byte-identical** (modulo the `generatedAtUtc` field
inside the drift state, normalised by `readDriftState` before comparison), and that the drift state
and sync manifest are byte-identical modulo the same field. That is the "script ignores it" half,
stated as an equivalence rather than as "exit is still 0" — the latter passes against an
implementation that silently skips half the run when the trace is unavailable.

Test 2 asserts that `parseTrace(tracePath)` on the blocked path **throws**
`TraceUnavailableError`, and that `assertClassifyBeforeCreate` propagates it. This is the half that
must not be softened: the failure mode being closed is a future maintainer "fixing" a flaky ordering
test by making the helper return `[]` when the trace is missing, at which point conjunct (a) is the
only thing standing between the suite and a permanently vacuous AC-2.9(1) assertion — and (a) then
fails on the row-id set, which is why (a) is stated over a set and not merely as `C.length > 0`.

---

## 5. `PDLC_FAULT` — the closed token enumeration (O-10)

### 5.1 Token grammar and composition

```
PDLC_FAULT ::= spec ("," spec)*
spec       ::= token [":" selector]
selector   ::= <manifest row id> | <backup id>        (row-scoped tokens only)
```

- **Comma-separated, order-insensitive, duplicates ignored.** FSPEC §4.6 (TE F-42) requires a
  fixture to fault a *subset* of guards in one run; a single-token variable cannot express AT-15
  (fault `drift-state-replace` + `drift-state-invalidate`, leave `drift-state-unlink` clean).
- **The selector scopes a token to one row.** AT-35 needs one row's copy corrupted while the loop
  continues over the others (AC-1.4); an unscoped `artifact-copy-corrupt` would corrupt every row
  and the "the loop continues" conjunct would be unobservable. An absent selector means *every*
  occurrence of that guard.
- `pdlc_fault_active <token> [<rowId>]` is the single query point (§2.2's surface). It returns 0
  when the token is present unscoped, or present with a selector equal to `rowId`.
- **Whitespace is not trimmed and an empty spec is unrecognised.** `PDLC_FAULT=""` is inert (the
  variable is treated as unset); `PDLC_FAULT=" mkdir"` is an unrecognised token and takes §5.4's
  path. Trimming would make the seam quietly tolerant of exactly the kind of environment mangling
  §5.4 exists to report.

### 5.2 The enumeration — closed, 14 tokens

The set is **closed here** (FSPEC §4.6, TE Q-01). Every token corresponds to one guard in C1/C2/C3;
no other guard is faultable and no other token exists. PROPERTIES asserts the emitted set is a
subset of this list (§16).

| # | Token | Guard | Injected behavior | Serves |
|---|---|---|---|---|
| 1 | `git-worktree-list` | §2.2 step 1's `git worktree list --porcelain` | the probe reports failure | O-3's git guard; §8.2 |
| 2 | `walk-stat` | §2.2 step 2's upward walk | the walk finds nothing | O-3's walk guard; §8.2 |
| 3 | `manifest-read` | §2.5 E4's read of the distribution manifest | the JSON helper returns `10` (unreadable) | `plugin-root-unreadable` on a uid-0 runner |
| 4 | `sync-manifest-read` | §1.2's read | the JSON helper returns `10` | AT-34's fault twin |
| 5 | `mkdir` | §4.2 step 3 | the `mkdir -p` reports failure | the fresh-consumer rung-(iii) case (§4.4a's third bullet) |
| 6 | `drift-state-replace` | §4.3's sibling-temp + `mv` | the `mv` reports failure | ladder entry — AT-14b, AT-15, AT-16, AT-17 |
| 7 | `drift-state-invalidate` | §4.4 rung (i)'s in-place `O_WRONLY\|O_TRUNC` | the write reports failure | AT-15, AT-16 |
| 8 | `drift-state-unlink` | §4.4 rung (ii)'s `unlink` + fresh write | the unlink reports failure | AT-16 |
| 9 | `artifact-copy` | §5.5 step (a), **before** the `mv` | the copy reports failure without touching the consumer file | §6.3's fail-open row; §6.1's "failed before landing" case |
| 10 | `artifact-copy-corrupt` | §5.5 step (a), **at** the temp write | the temp is written **truncated to half the source length**, then `mv`'d normally | **AT-35** |
| 11 | `backup` | §4.7 step 1 | the backup copy reports failure | AT-27's sibling; §6.3 |
| 12 | `backup-corrupt` | §4.7 step 1 | the backup is written truncated, so step 2's genuine re-read mismatches | **AT-27** |
| 13 | `retire-delete` | §5.7's delete | the delete reports failure | §6.3's retirement row |
| 14 | `sync-manifest-update` | §4.2 step 6's rewrite | the rewrite reports failure | §6.4's removal-only fixture; §5.5's stated residual |

**Tokens 10 and 12 corrupt bytes; they do not fake a comparison.** This is the single most
load-bearing decision in the enumeration. AT-35's red direction (i) is "an implementation that
copies without re-reading" — if the fault made the *verification* return false, that implementation
would still fail the test and the test would prove nothing about the re-read. By truncating the
bytes actually written and leaving the comparison untouched, an implementation that skips §5.5's
re-read genuinely lands a truncated file, genuinely writes a sync-manifest entry over it, and
genuinely exits 1 — which is the red direction FSPEC §5.8's exit-1 derivation predicts. Same
argument for token 12 against §4.7 step 2 and AT-27.

**Why there is no token for the `.claude/workflows/` enumeration (N-6 / AT-32a) and none for the
JSON- or hash-tool probes.** The tool probes are reached by `makeToolDir` (§3.2.1), which is a
stronger fixture than a fault — it removes the interpreter rather than lying about it, so AT-14's
"the record parses" conjunct is asserted against a tree where no parser exists. The directory
enumeration has no fault token by decision, and §7.3 records the consequence: AT-32(a) is a genuine
uid-0 coverage hole, named in the skip inventory (§1.3) rather than closed by widening this set.
Adding a token per untestable branch would make the closure meaningless.

### 5.3 Rung granularity for the invalidation ladder

Tokens 6/7/8 are three entries, not one, exactly as FSPEC §4.6 requires. The composition each
ladder test needs:

| Test | `PDLC_FAULT` | Rung that must land | Discriminating observable |
|---|---|---|---|
| AT-14b (fault-injected twin) | `drift-state-replace` | **(i)** | record present, `checkEnabled: false` preserved, **inode unchanged** |
| AT-15 | `drift-state-replace,drift-state-invalidate` | **(ii)** | record present, **inode changed** (§3.4's `inodeOf`) |
| AT-16 (fault-injected twin) | `drift-state-replace,drift-state-invalidate,drift-state-unlink` | **(iii)** | pre-existing record **byte-unchanged**, N-3 on stderr, `--check` exit 4 / hook exit 0 |
| fresh-consumer rung (iii) | `mkdir` | **(iii)** | **no** drift state anywhere, exit 4 / 0 |

Rungs (i) and (ii) write byte-identical records (FSPEC AT-15, corrected in v5.1), so **inode
identity is the only discriminator** and every ladder test captures `inodeOf(driftStatePath)` before
the run. The pre-run inode is captured *after* the pre-existing record is written and *before* the
script starts; a test that forgets the pre-capture cannot assert rung (i) at all, so `runScript` does
it automatically whenever `spec.driftState` is set and exposes it as `RunResult.driftStateInodeBefore`.

**Nothing in the ladder tests asserts a stderr `operation` token to discriminate a rung.** FSPEC
§4.5 makes `drift-state-replace`/`-invalidate`/`-unlink` **failure** records, so the token naming a
rung appears exactly when that rung *failed* — the inverse of what a naive assertion reads it as
(SE F-29 ≡ TE F-43). The tests do assert the failure tokens **positively**, in the direction the
spec fixes: AT-15 asserts `drift-state-replace` and `drift-state-invalidate` appear on stderr and
`drift-state-unlink` does **not**.

### 5.4 Unrecognised tokens

Per FSPEC §4.6, verbatim, and asserted by AT-18a/AT-18b (§14):

```
PDLC_FAULT=not-a-real-token   ⇒   N-7 printed exactly once
                                  nothing injected — the run is not perturbed
                                  the record is still written, green if the tree is green
                                  hook exit 0 · --check exit 4 · sync exit 4
```

Three test-design consequences:

1. **"Exactly once"** is asserted by counting occurrences of the N-7 line in `stderr`, not by
   `toContain`. A per-guard implementation of the token lookup emits N-7 once per guard consulted,
   which `toContain` accepts and which would flood a real operator's session output.
2. **"Not perturbed"** is asserted as a **byte equivalence** against the same fixture with
   `PDLC_FAULT` unset — stdout, the drift state and the sync manifest, all modulo `generatedAtUtc` —
   not as "exit is still 0". AT-18a/AT-18b are stated as one shared fixture run twice for exactly
   this reason, and AT-18b's Then already requires the record to be byte-identical to AT-18a's.
3. **A partially-recognised list is a list with an unrecognised member.** `PDLC_FAULT=mkdir,bogus`
   prints N-7 for `bogus`, injects `mkdir`, and takes the unrecognised exit. This is stated because
   the alternative reading — "an unrecognised member voids the whole list" — is equally defensible
   from FSPEC §4.6's singular wording and would make every multi-token fixture in §5.3 silently
   inert if a token were later renamed. `driftFault.test.js` pins it.

---

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
