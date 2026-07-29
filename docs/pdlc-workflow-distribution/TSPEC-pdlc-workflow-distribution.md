---
feature: pdlc-workflow-distribution
---

# TSPEC — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (approved, product scope) → `FSPEC-pdlc-workflow-distribution.md` v5.1 (dual-approved 2026-07-28) → **TSPEC** |
| Downstream | `PROPERTIES-pdlc-workflow-distribution.md`, `PLAN-pdlc-workflow-distribution.md`, implementation |
| FSPEC §10 rows disposed here | O-1, O-3, O-7, O-10, O-11, O-12, O-16, O-17, **O-19** (the nine whose "Lands in" names TSPEC; O-19 is "TSPEC / implementation phase" — duties (a), (b), (d) are designed here, (c) is handed off) |
| Rows carried forward | O-9, O-18, O-20 → PROPERTIES; O-19(c) → implementation phase; O-13 → `consolidate-learnings` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md` (3H/3M/3L), `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (3H/6M/4L) — both disposed in §0.4 |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 2.0 | 2026-07-28 |

> **Altitude.** The REQ states observable behavior; the FSPEC states how it is produced (components,
> data formats, algorithms, operator strings). This TSPEC states **how it is built and how it is
> proved**: the test surface architecture, the harness that runs bash from jest, the seam grammars
> (`PDLC_TRACE_FILE`, `PDLC_FAULT`), every fixture's construction recipe, the module surface of the
> bash library, and the mapping from the FSPEC's **39** acceptance tests (AT-1…AT-36, counting the
> five split ids AT-8a/8b, AT-14b, AT-18a/18b and no un-split AT-8 or AT-18) onto named test cases
> in named files.
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
| The message-matcher table and the **remediation-content** assertions (AC-2.5, AC-2.5a, AC-2.8) | §7.2, §7.4 |
| The parameterisable backup-grammar surface and the retention binding handed to PROPERTIES | §11 |
| The queue-side shape validator, the mangled-relay fixture table, and the O-19(d) wrapper | §12 |
| Every fixture's construction recipe | §13 |
| The file and test-case each of the 39 acceptance tests lands in | §14 |

### 0.2 Disposition of the nine TSPEC-bound obligations

Every row the FSPEC §10 table routes here, with the section that discharges it. A reviewer verifying
this document checks these nine row by row. (v1.0 said "eight" and omitted **O-19**, whose "Lands in"
reads "TSPEC / implementation phase" — TE F-11.)

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
| **O-19** | (a) no second agent-mediated read; (b) unit-test D1–D8 against mangled-relay fixtures; (c) record the seam's LLM mediation in `orchestrate-queue.js`; (d) wrap the drift-state read | **§12.1, §12.3, §12.4**; (c) → §16 | (a) is asserted by §12.4's single-call test. (b) is discharged in design by §12.1's clause table, which after v2.0 carries **all six** of O-19(b)'s mandated relay shapes — fenced, re-wrapped, truncated, key-dropped, array-replaced-by-scalar, state-value-reworded — one mutation per row. (d) is §12.3's `readDriftStateSafely` plus the three-way injection table. (c) is a code comment with no assertable observable and is handed to the implementation phase (§16), recorded as R-7. |

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
   | `plugin-artifact-unreadable` (P2, §7.1) | plugin artifact `chmod 0200` | the row reason is reached by a **read** denial on the plugin side, not by the manifest read |
   | `consumer-artifact-unreadable` (P4, §7.1) | consumer artifact `chmod 0200` | the row reason is reached by a **read** denial on the consumer side |

   AT-16, AT-27, AT-34 and the two `*-artifact-unreadable` rows each have a **fault-injected twin**
   (§6.1) that runs on every runner including root; the permission fixture is the corroborating
   form, and only it skips. AT-14b and AT-32(a) have no fault-injected twin — AT-14b's whole subject
   is the permission asymmetry between the in-place write and the sibling-temp write (FSPEC §4.4
   rung table row 1), and AT-32(a)'s is directory-read permission — so those two are the genuine
   uid-0 coverage holes, and the skip message is the only record of them.

   **The two `*-artifact-unreadable` rows are new in v2.0 (TE F-03).** At v1.0 they were
   permission-**only**: §5.2's fourteen tokens contained no per-artifact read guard, and §7.1's P1
   cell wrongly credited `PDLC_FAULT=manifest-read` with producing the *row* reason
   `plugin-artifact-unreadable` when that token faults E4's read of the distribution manifest and
   produces the *baseline* reason `plugin-root-unreadable` (§5.2 token 3). Two of the four row
   reasons in §1.4's row-reason floor were therefore unreachable on a root runner, and because that
   floor is a **failing set-equality assertion** the suite would have gone **red on root for a
   reason unrelated to the code** — the precise failure mode §1.3's skip-loudly policy exists to
   prevent. v2.0 closes it in the direction that preserves the floor as a hard assertion: §5.2 gains
   tokens 15 (`plugin-artifact-read`) and 16 (`consumer-artifact-read`), one per guard, so both row
   reasons are F-reachable everywhere and only the corroborating permission fixtures skip.

### 1.4 Coverage floors (O-11)

Floors are stated as **assertion-count minimums per behavior class**, not as line/branch percentages:
the subject is bash run as a black box, so jest's coverage instrumentation sees none of it and a
percentage would be a fabricated number. The floors are checkable by reading §14's table.

| Class | Floor | Where counted |
|---|---|---|
| Baseline reasons (FSPEC §2.8) | **all 8** reached by at least one test, each asserting the reported `baselineReason` **and** the entrypoint exit | §14 rows AT-2, AT-3, AT-14, AT-14b, AT-33 + `driftBaseline.test.js` table-driven cases |
| Row states (FSPEC §3.3) | **all 6** asserted as an outcome; `unknown` additionally per **each of its 4 reasons** — every one of the four reachable **without root** (`hash-tool-absent` via `makeToolDir`, `plugin-artifact-missing` by an ordinary tree, `plugin-artifact-unreadable` / `consumer-artifact-unreadable` via §5.2 tokens 15/16), so this floor stays a hard assertion on a uid-0 runner | `driftClassify.test.js` |
| `writeFailures.operation` (REQ §4, 9 values) | the **5 recordable** asserted present in `writeFailures`; the **4 stderr-only** asserted **absent** from the record and present on stderr | `driftWriteFailure.test.js` |
| Exit codes 0–4 | each asserted at least once per entrypoint that can produce it (`--check`: 0,1,2,3,4; sync: 0,2,3,4 — **never 1**, FSPEC §5.8; hook: 0 only) | §14 |
| Ladder rungs (i)/(ii)/(iii) | one landing test each, with the rung **discriminated** (§6.1) | `driftLadder.test.js` |
| Queue mapping rows (FSPEC §6.2, 10 rows) | **all 10**, each with a record that defeats every higher row | `queueDriftGate.test.js` |
| Message catalogue sets S1/S2/S3 (FSPEC §8.2) | pairwise `distinct()` over all three sets | `driftMessages.test.js` (AT-30) |
| Trace phases | all **three** classify labels (`as-found`, `post-copy`, `post-run`) observed on **one sync run over a fixture with a retiring row**, and every non-`classify` record carrying `run` (§4.2) | `driftOrdering.test.js` (§4.3) |
| **Hook silence (AC-2.2)** | **≥ 2** green-tree hook runs asserting `stderr === ""` **and** `stdout === ""` **and** exit 0 — see §1.4a | `driftHook.test.js` |
| **Row reason → remediation (AC-2.5)** | **all 4** row reasons asserted against their **remediation class**, not merely against each other's inequality — the two `*-unreadable` reasons must match the permissions class and must match **neither** the sync class nor the plugin-update class | `driftMessages.test.js`, `driftClassify.test.js` (§7.4) |
| **Retired-present remediation (AC-2.8)** | **all 6** of R's states asserted against §7.4's branch table, including the two negative conjuncts (`unknown` ⇒ no sync command; `local-edit`/`unverified` ⇒ backup **dir + two labelled patterns**, no concrete filename) | `driftSync.test.js`, `driftHook.test.js` (§7.4) |
| **Baseline reason → remediation (AC-2.5a)** | **all 8** baseline reasons asserted against §7.4's remediation class; `manifest-*` and `drift-state-invalidated` additionally asserted **not** to name a sync command (FSPEC §8.1) | `driftBaseline.test.js` (§7.4) |
| **`syncCommand` expansion (AC-0.4, AC-4.2)** | **≥ 1** fully-resolved record asserting `syncCommand` equals the `<pluginRoot>`-expanded invocation **string-equal**, plus the `null` cases | `bootstrap.test.js` (AT-24), `driftLadder.test.js` |

The last five rows are new in v2.0 (PM F-01, PM F-02, PM F-06). v1.0's eight floors covered the
mechanical surfaces — reasons, states, operations, exit codes, rungs, mapping rows — and floored
**message content nowhere**: `distinct()` (AT-30) proves four remediations *differ*, which four
differently-worded but uniformly wrong remediations satisfy. The class where a defect sends the
operator down the wrong repair path was the one class with no floor.

A floor is a **failing assertion**, not a checklist: `driftBaseline.test.js` ends with a
"every baseline reason was exercised" test that reads a module-level `Set` populated by each case and
asserts set-equality against the literal eight-member list. Same construction for row states, row
reasons, operations, and mapping rows. This is the repo's shipped meta-oracle pattern
(`__tests__/helpers/guardRowIds.js` + `guardMatrix.test.js` do the same for guard rows) and is
**cited and reused** rather than reinvented.

### 1.4a The hook-silence oracle (AC-2.2) — PM F-01

AC-2.2 is P0 and is the load-bearing half of US-01: *"Silence means everything was verified — never
'could not check' … there is no silent non-green state."* v1.0 contained **no assertion anywhere**
that the hook emits nothing: §14's rows all assert that a message **is** present, and §15.1 swept
AC-2.2 into a range of *warning* tests. The consequence is the one that makes operators disable a
hook: an implementation that warns on **every** session was green.

```js
// __tests__/helpers/driftHarness.js
export function expectHookSilent(run) { … }
```

| # | Conjunct | Catches |
|---|---|---|
| 1 | `run.stderr === ""` — **strict empty-string equality**, never `not.toContain("pdlc:")` | a hook that prints an unprefixed line, a `set -x` leftover, or a stray tool's diagnostic |
| 2 | `run.stdout === ""` | an implementation that "goes quiet" by moving its warnings to stdout, which a SessionStart hook's operator still sees |
| 3 | `run.status === 0` | — |
| 4 | `run.notices` and `run.warnings` (§7.2) are both `[]` | the redundant form of 1, stated so a future matcher addition cannot make 1 pass by parsing less |
| 5 | the run **did** work: `readDriftState(root)` is non-null, `baselineStatus: "resolved"`, `rows` non-empty and every `state === "in-sync"`, `retiredPresent: []`, `writeFailures: []` | **the vacuous pass** — a hook that silently does nothing at all also has empty stderr. Conjunct 5 is what makes silence mean *verified* rather than *skipped*, which is AC-2.2's actual claim |

Two named landing sites, which is why the floor is `≥ 2`:

| Site | Fixture | Why this one |
|---|---|---|
| `driftHook.test.js` — `it("AC-2.2 — a fully green tree produces a silent hook")` | `syncedConsumer` (§13.1) — the exact all-`in-sync`, no-retired-path, no-write-failure tree AC-2.2 describes | the positive statement of the AC, on the fixture that already exists and is used by AT-9, AT-11, AT-18a/b and AT-32 without any of them asserting emptiness |
| `driftFault.test.js` — AT-18a, strengthened | `syncedConsumer` + `unrecognised` | AT-18a's Given is literally "everything else green". v1.0 asserted `countOf(stderr, "N-7") === 1`; v2.0 asserts **N-7 and nothing else** — the stderr, with the single N-7 line removed and whitespace trimmed, is `""` (PM Q-01: yes, and it costs no fixture) |

**The negative direction is asserted too**, because a silence oracle that only ever runs on a green
tree cannot fail: `driftHook.test.js` runs `expectHookSilent` inside `expect(() => …).toThrow()`
over `staleRow` — a tree AC-2.2 forbids silence on. Without it, a helper degraded to `return true`
would keep the whole class green.

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
| **`pdlc/RELEASE-CHECKLIST.md`** | docs, **new** | new — the checklist three commitments route to; see §2.1a | AC-6.2a, AC-6.6 residual, NFR-2 |
| plus whatever `coveredViolations(liveRepoRoot)` returns (7 files today) | docs | mod | AC-6.4 |

Test files and helpers are in §14's placement table; fixtures in §13.

### 2.1a `pdlc/RELEASE-CHECKLIST.md` — the checklist-owned commitments get an artifact (PM F-05)

Three commitments name "the maintainer's release checklist" as the surface that discharges them,
and at v1.0 **no such document existed anywhere in the repo** — §2.1's inventory created it nowhere
and §16's hand-off assigned it to nobody, so three P1/residual obligations landed in prose:

| Commitment | Priority | What the checklist owes it |
|---|---|---|
| **AC-6.2a** | P1, "checklist-owned" (FSPEC §7.3) | After publishing a release and installing it, assert `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` contains both bundles **and** `distribution-manifest.json`. The row names the runnable form: `node -e` over `packagingViolations(installedPluginParentRoot)` from `pdlc/workflows/lib/document-oracles.mjs` — which is exactly why §2.1 puts that module inside `pdlc/` and ships it (it is runnable against an installed plugin, not only against a checkout) |
| **AC-6.6's accepted residual** | P1 fallback (REQ §6) | A `dist/`-changing commit that already landed under an unbumped `version` is undetectable by §10.3's working-tree oracle. The checklist row: before publishing, confirm `plugin.json` `version` differs from the previously published release whenever `git log` shows any `dist/` change since it |
| **NFR-2** | structural, observed once | The p95 ≤ 500 ms latency budget is "observed once, on the maintainer's release checklist (the AC-6.2a pattern)". The row records the observation — entrypoint, artifact count, wall clock — and nothing in the suite asserts it (§15.1 keeps NFR-2 marked "structural, no timing assertion exists") |

**It is a real artifact with a named home, not an intention.** It is created in the landing commit,
it lives beside `pdlc/README.md`, and §16 carries it as an implementation-phase obligation with
those three rows enumerated so a reviewer can check them off. The durable rule this discharges — *a
checklist-owned AC needs a checklist artifact in the deliverable inventory* — is wider than this
feature and is flagged for harvest.

**One constraint the document itself carries:** it lives under `pdlc/`, which none of §7.5's four
exemptions covers, so — exactly as FSPEC §5.4 requires of the optional `SKILL.md` — its wording must
avoid all five `coveredViolations` patterns, or AT-22's live-root `== ∅` goes red on the landing
commit. A false positive there is fixed by rephrasing the checklist, never by narrowing a pattern
(R-10's rule, unchanged).

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
| `pdlc_backup_format <id> <stamp> <nn>` | — | 0 / 1 (`nn > 99`, or `id` fails M6) | stdout = `{id}.{stamp}-{NN}.bak` |
| `pdlc_backup_parse <name>` | — | 0 / 1 (tail does not match) | stdout = `id TAB stamp TAB nn` |
| `pdlc_prune_backups <dir> <knownIds…>` | — | **always 0** | — (side effect: removes all but the newest 5 per **known** id; identity on every other entry) |
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

**The backup-grammar rows are new in v2.0 (TE F-07).** v1.0's §11.1 opened "Three functions in C1,
**named in §2.2's table**" and §2.2's table named neither `pdlc_backup_format` nor
`pdlc_backup_parse` — the two functions that are the entire subject of O-18's round-trip and
injectivity properties — while giving `pdlc_prune_backups` **two incompatible signatures**: `<id>`
here and `<dir> <knownIds…>` in §11.1. **`<dir> <knownIds…>` is the one that ships**, because O-18
clause (c)'s identity-on-unknown-ids contract is written against it and §11.2's batched driver calls
it by that name; the exit stays "always 0" (pruning is best-effort and never fails a sync — a prune
failure surfaces as `operation: backup` at the *next* write, FSPEC §1.4's exhaustion case, not as a
prune error). `pdlc_backup` keeps `<srcPath> <id>` and calls `pdlc_backup_format` internally;
`pdlc_backup_parse` is called by nothing in the production path except `pdlc_prune_backups`, which
is deliberate (§11.1).

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
| `pluginRoot` | value of `CLAUDE_PLUGIN_ROOT` | **unset** — which reaches FSPEC §2.4's maintainer-marker branch *only when the consumer tree itself contains `pdlc/workflows/build-runtime.mjs`* (that is the `freshClone` fixture, §9). On an ordinary `makeConsumerTree` tree the marker is absent, so unset reaches the `${CLAUDE_PLUGIN_ROOT}` branch and yields baseline reason **`plugin-root-unset`**; every fixture that wants a resolved plugin root passes one explicitly (§13.1). v1.0's one-line default ("the maintainer-marker branch") was true only of the bootstrap fixture — TE F-08 |
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

**`manifestRaw` — the unparseable-bytes escape hatch (new in v2.0, TE F-08).** `manifestOverride`
mutates a *parsed object* that is then re-serialised, so it can only produce M1–M10 clause failures,
never bytes the JSON helper cannot parse. Both routes establish FSPEC §2.5's `manifestMalformed`
(the helper's outcome `12` **or** any M1–M10 failure), so the baseline reason was reachable at v1.0
— but only through one of its two production paths, and the helper's own `12` return was untested.
`makePluginTree({ manifestRaw: "{ not json" })` writes the given bytes verbatim in place of the
computed manifest, closing the second path:

| Spec | Manifest bytes | Establishes | Fixture name (§13.1) |
|---|---|---|---|
| `manifestOverride: o => { o.rows[0].pluginSha1 = "zz…"; return o; }` | valid JSON, M9 violated | `manifest-malformed` via the **validator** | `manifestClauseBroken` |
| `manifestRaw: "{ not json"` | unparseable | `manifest-malformed` via the **helper's `12`** | `manifestUnparseable` |

`manifestRaw` and `manifestOverride` are mutually exclusive and `makePluginTree` throws if both are
given — a raw override silently discarding an object override is the kind of fixture bug that
produces the right reason for the wrong path.

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
                                             "as-found"|"post-copy"|"post-run" on `classify`
                                             records ONLY; "run" on every other op — §4.2
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

| `op` | `phase` | Emitted at | `rowId` | `arg` |
|---|---|---|---|---|
| `run` | `run` | once, first record of the invocation | `-` | the entrypoint (`hook`\|`check`\|`sync`\|`sync --force`) |
| `repo-root` | `run` | §2.2, after E1 | `-` | the resolved root, or empty when unresolved |
| `plugin-root` | `run` | §2.4, after E3 | `-` | the resolved plugin root, or empty |
| `manifest-read` | `run` | §2.5 E4/E5 | `-` | the manifest path |
| `config-read` | `run` | §2.7 E7 | `-` | the config path |
| `sync-manifest-read` | `run` | §1.2's read | `-` | the sync-manifest path |
| `classify` | **`as-found` \| `post-copy` \| `post-run`** — the `phase` argument of `pdlc_classify_row` | once per row **per pass** | the row id | the resulting state |
| `mkdir` | `run` | §4.2 step 3, once per directory created | `-` | the directory |
| `write` | `run` | every drift-state / sync-manifest write **attempt** | `-` | the target path |
| `copy` | `run` | §5.5, per row, at the `mv` | the row id | the consumer path |
| `backup` | `run` | §4.7 step 1, per backup | the backup id | the backup path |
| `delete` | `run` | §5.7's retirement delete | the row id | the retired path |

**Every non-`classify` record carries `phase = "run"` (pinned in v2.0 — TE F-02).** v1.0 fixed a
four-value `phase` field on *every* record and then assigned a value to `classify` only, which left
`assertPhaseOrder` unimplementable in both directions: against an implementation stamping
`mkdir`/`copy` with `as-found` the predicate is violated on a **conforming** run, and against one
stamping them `run` the assertion is vacuous over the mutating ops — with nothing in the document to
say which. The assignment above is the one that keeps §2.2's structural rule true (`pdlc_classify_row`
remains *the only place a pass label is set*, because the other twelve ops carry the literal `run`
and have no pass to belong to) and makes both §4.3's helpers and §1.4's phase floor decidable. The
grammar rule is itself asserted: `parseTrace()` **throws** if a non-`classify` record carries a
phase other than `run`, or if a `classify` record carries `run`, so a mislabelled emitter is a
harness error naming the offending record rather than a silently reshaped oracle.

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
| (a) | **multiset equality**: `sorted(C.map(r => r.rowId))` **deep-equals** `sorted(expectedRowIds)` — i.e. every expected id appears in `C` **exactly once** and no other id appears at all — and `expectedRowIds` is non-empty | the vacuous pass (empty or truncated trace, or only the first row classified) **and double-classification** |
| (b) | `max(index of C) < min(index of M)` | the ordering itself: every as-found classification precedes every mutation |
| (c) | `M.length === 0 || C.length > 0`, and `min(index of C) < min(index of M)` | a run that creates *before* classifying anything at all — (b) alone is vacuously true when `C` is empty, which is exactly the regression this exists to catch |
| (d) | `T` contains a `manifest-read` record, and it precedes every member of `C` | a classifier that ran off something other than the manifest (AC-0.1's globbing prohibition) |

Conjunct (a) is O-1's mandated **positive-presence** conjunct and it is stated as a **multiset**
(bag) equality — corrected in v2.0, TE F-01. Neither weaker form is adequate, and each misses what
the other catches:

| Form | Misses |
|---|---|
| count (`C.length === expectedRowIds.length`) | one row classified twice and another zero times — the shape a `for` loop with a mis-scoped variable produces in bash |
| set (`new Set(C.map(…))` equals `new Set(expected)`) | **an as-found `classify` record emitted twice for every row** — a uniform double-classification, which the set form passes and the count form would have caught |

Multiset equality is the unique form strictly stronger than both, and the double-classification
hazard is not hypothetical: it is the failure FSPEC §10 O-1 names ("double-count on a conforming
run") and the one `assertPostCopyNarrow`'s note describes as making NFR-2's bound "quietly become
`2 × 3 × |rows|`". `seq`'s self-check does not help — monotonicity is satisfied by a
double-classifier.

**Phase scoping.** The oracle filters to `phase === "as-found"` because a sync run's post-copy and
post-run passes legitimately follow the mutations. The complementary assertions live in the same
helper and are asserted by the sync fixtures:

- `assertPhaseOrder(trace)`, restated over §4.2's phase assignment: (1) every record whose `op` is
  not `classify` carries `phase === "run"`, and no `classify` record does — the grammar self-check
  `parseTrace` already enforces, re-asserted here so a helper used without `parseTrace` cannot skip
  it; (2) taking the `classify` records in line order and **run-length-collapsing** their labels
  yields a **prefix of `[as-found, post-copy, post-run]`** — so `[as-found]`,
  `[as-found, post-copy]` and `[as-found, post-copy, post-run]` pass, while a repeated or
  out-of-order label (`[as-found, post-copy, as-found]`) fails. Interleaving is caught by the
  collapse: two non-adjacent runs of the same label produce a repeated element.
- `assertPostCopyNarrow(trace, retiringIds)`: the `post-copy` classify records' row ids are a
  **multiset**-equal to `retiringIds` — same correction as conjunct (a) and for the same reason
  (TE F-01); a set equality passes an implementation that classifies each retiring row twice.
  FSPEC §3's table calls that pass **narrow**; without this assertion an implementation that
  re-classified everything at step 5 is indistinguishable, and §13.1's NFR-2 bound quietly becomes
  `2 × 3 × |rows|` on every run.
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
fails on the row-id multiset, which is why (a) is stated as a multiset equality and not merely as
`C.length > 0`.

**Trace-path allocation is per tree, not per suite (TE Q-02).** `<tmp>` is the per-consumer-tree
`mkdtemp` directory `makeConsumerTree` returns (§3.3), so `<tmp>/trace/<n>.tsv` is unique across
jest's parallel workers by construction — `<n>` need only be unique within one tree, and it is a
counter on the tree object. Deriving the trace directory from a suite-level or `tmpdir()`-level path
would make `parseTrace`'s single-`run` assertion a flake rather than a detector, which is the
failure this note exists to forbid.

---

## 5. `PDLC_FAULT` — the closed token enumeration (O-10)

### 5.1 Token grammar and composition

```
PDLC_FAULT ::= spec ("," spec)*
spec       ::= token [":" selector]
token      ::= one of §5.2's sixteen literals
selector   ::= scopeKey                               (selector-bearing tokens only — table below)
scopeKey   ::= <manifest row id> | <backup id>        both are M6-charset strings (§11.3 row 1)
```

- **Comma-separated, order-insensitive, duplicates ignored.** FSPEC §4.6 (TE F-42) requires a
  fixture to fault a *subset* of guards in one run; a single-token variable cannot express AT-15
  (fault `drift-state-replace` + `drift-state-invalidate`, leave `drift-state-unlink` clean).
- **The selector scopes a token to one row or one backup.** AT-35 needs one row's copy corrupted
  while the loop continues over the others (AC-1.4); an unscoped `artifact-copy-corrupt` would
  corrupt every row and the "the loop continues" conjunct would be unobservable. An absent selector
  means *every* occurrence of that guard.
- **The query point takes the scope key it is being asked about**, so both selector alternatives are
  queryable:
  ```
  pdlc_fault_active <token> [<scopeKey>]     # exit 0 = active
  ```
  It returns 0 when the token is present unscoped, **or** present with a selector byte-equal to
  `scopeKey`. A guard whose token is selector-bearing always passes its scope key; a guard whose
  token is not passes none.
- **Whitespace is not trimmed and an empty spec is unrecognised.** `PDLC_FAULT=""` is inert (the
  variable is treated as unset); `PDLC_FAULT=" mkdir"` is an unrecognised token and takes §5.4's
  path. Trimming would make the seam quietly tolerant of exactly the kind of environment mangling
  §5.4 exists to report.

#### 5.1.1 Which tokens bear a selector, and what its scope key is (TE F-05)

v1.0 defined `selector ::= <manifest row id> | <backup id>`, gave the query point **one** argument
matched against `rowId`, and never enumerated which tokens accept a selector. The backup-id
alternative was therefore unqueryable — and it is not decorative: AT-12's retirement backup has
`id = the retired path's basename` (§13.1 `retiredPresent`), not a manifest row id, so a
`backup:`/`backup-corrupt:` selector for the retirement case could not be evaluated at all.

| Token | Selector? | Scope key the guard passes to `pdlc_fault_active` |
|---|---|---|
| `artifact-copy`, `artifact-copy-corrupt` | **yes** | the **manifest row id** being copied |
| `backup`, `backup-corrupt` | **yes** | the **backup id** — the row id for an artifact backup (§4.7), the **retired path's basename** for a retirement backup (§5.7). This is the alternative v1.0 could not express |
| `retire-delete` | **yes** | the **manifest row id** R whose `retires` names the path |
| `plugin-artifact-read`, `consumer-artifact-read` (new, §5.2 tokens 15/16) | **yes** | the **manifest row id** whose artifact is being read |
| `git-worktree-list`, `walk-stat`, `manifest-read`, `sync-manifest-read`, `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink`, `sync-manifest-update` | **no** | — each guard fires at most once per run and has no per-row identity |

**A selector on a non-selector-bearing token is an unrecognised spec.** `PDLC_FAULT=mkdir:foo`
prints **N-7 with the token text `mkdir:foo`** and injects nothing — it does **not** silently
degrade to `mkdir`. §5.4 is careful about unrecognised *tokens* and v1.0 was silent about malformed
*specs*, which is the same class of environment mangling §5.4 exists to report; a spec that
silently drops its selector is how a fixture meant to scope a fault to one row corrupts every row
and the test still passes. The same rule covers the empty selector (`mkdir:`) and a spec with more
than one `:`.

**Grammar unambiguity — the id charset (TE F-05(d), TE Q-03).** **FSPEC §1.1 clause M6 is the
authority**, not this document and not §4.1's assertion: M6 fixes the union namespace
`{row ids} ∪ {basename(p) : p ∈ any retires}` to `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`. That charset
contains neither `,` nor `:` nor tab, so **both** seams' delimiters are unambiguous by construction
— this grammar's `,`/`:` and §4.1's tab — and both scope-key alternatives (row id, backup id) are in
the one namespace M6 governs, which is what makes a single `scopeKey` production correct.
`M6_ID_REGEX` (§11.3 row 1) is that regex, written **once**, exported from `document-oracles.mjs`
and shared by C1's validator, the PROPERTIES generator and this seam; `driftFault.test.js` asserts
the exclusions as a property of `M6_ID_REGEX` itself (`,`, `:`, tab and newline are all rejected),
not as a consequence of the ids the fixtures happen to use, since a fixture set that never contains
a `:` proves nothing.

### 5.2 The enumeration — closed, 16 tokens

The set is **closed here** (FSPEC §4.6, TE Q-01). Every token corresponds to one guard in C1/C2/C3;
no other guard is faultable and no other token exists. PROPERTIES asserts the emitted set is a
subset of this list (§16). **Tokens 15 and 16 are new in v2.0** (TE F-03) — see the closure argument
below the table.

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
| **15** | `plugin-artifact-read` | FSPEC §3.2 **P1/P2** — C1's read of one row's plugin artifact, at the read, **after** the existence `stat` | the read reports failure (the probe returns `indeterminate`) | the row reason **`plugin-artifact-unreadable`** on every runner, incl. uid 0 |
| **16** | `consumer-artifact-read` | FSPEC §3.2 **P3/P4** — C1's read of one row's consumer artifact, at the read | the read reports failure (the probe returns `indeterminate`) | the row reason **`consumer-artifact-unreadable`** on every runner |

**Why 15 and 16 exist, and why adding them does not dissolve the closure (TE F-03).** They are not
"a token per untestable branch" — the rule §5.2 states below for the enumeration guard. They are two
**guards that were already in the closed enumeration's scope and were missed**: §3.2's P1–P4 are
per-row read guards, exactly the granularity tokens 3, 4 and 9–13 already use, and the set is
"closed at guard granularity" only if every guard is in it. Without them, `plugin-artifact-unreadable`
and `consumer-artifact-unreadable` are constructible **only** by `chmod 0200`, i.e. only off root,
and §1.4's row-reason floor — a hard set-equality meta-oracle over `unknown`'s four reasons — turns
the suite **red on a root runner for a reason unrelated to the code**. §7.1's P1 cell also claimed
`PDLC_FAULT=manifest-read` as the F escape for `plugin-artifact-unreadable`; it is not — token 3
faults E4's read of the **distribution manifest** and yields the *baseline* reason
`plugin-root-unreadable` at a different site (corrected in §7.1 below). The line the closure still
holds is the one drawn immediately below: the `.claude/workflows/` **enumeration** guard and the
JSON/hash **tool probes** still get no token — the first because AT-32(a)'s subject *is*
directory-read permission and a token would assert something else, the second because `makeToolDir`
is a strictly stronger fixture. A token is added when it faults a guard the classifier already
defines a failure outcome for and no stronger fixture exists; that is the test P1–P4 pass and those
three do not.

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
Adding a token per untestable branch would make the closure meaningless — which is a different case
from tokens 15/16, whose guards were **inside** the closure's stated granularity and simply absent
from the list.

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
4. **A malformed *spec* is unrecognised on the same footing as an unknown *token*** (§5.1.1). N-7's
   `{token}` substitution carries the **whole spec text** — `mkdir:foo`, `mkdir:`, `backup:a:b` —
   so the operator (and the test's `MESSAGES["N-7"]` capture) sees what was actually rejected.
   `driftFault.test.js` asserts each of those three forms emits N-7 once and injects nothing, with
   the byte-equivalence conjunct of rule 2. Silently dropping a selector is the failure this
   forbids: a fixture meant to scope `artifact-copy-corrupt` to one row would corrupt every row and
   AT-35's "the loop continues" conjunct would pass for the wrong reason.

---

## 6. Write-failure test design (O-10)

### 6.1 Injectability matrix

One row per `operation` value in FSPEC §4.5's closed nine-member set. **F** = reachable through the
§5.2 fault seam on any runner; **P** = reachable by a permission/filesystem fixture, non-root only.
Every recordable operation is F, which is the property that keeps the write-failure suite runnable
on a root CI container.

| `operation` | Recordable? | F | P | Fault token | Permission fixture | Landing test |
|---|---|---|---|---|---|---|
| `mkdir` | no (stderr-only) | ✅ | ✅ | `mkdir` | `.claude/` `r-x` | §6.5's fresh-consumer rung (iii) |
| `drift-state-replace` | no | ✅ | ✅ | `drift-state-replace` | `.claude/workflows/` `r-x` | AT-14b, AT-15, AT-16, AT-17 |
| `drift-state-invalidate` | no | ✅ | ✅ | `drift-state-invalidate` | drift-state file `r--` | AT-15, AT-16 |
| `drift-state-unlink` | no | ✅ | ⚠️ | `drift-state-unlink` | immutable attr — **not portable** | AT-16 |
| `artifact-copy` | **yes** | ✅ | ✅ | `artifact-copy`, `artifact-copy-corrupt` | **`.claude/workflows/` `r-x`** (the *parent*, never the target file's mode — see note 4) | AT-35, §6.3 |
| `backup` | **yes** | ✅ | ✅ | `backup` | `.pdlc-backups/` `r-x` | §6.3 |
| `backup-verify` | **yes** | ✅ | ❌ | `backup-corrupt` | — none: a permission bit cannot make a *landed* backup differ | **AT-27** |
| `retire-delete` | **yes** | ✅ | ✅ | `retire-delete` | `.claude/workflows/` `r-x` | §6.3 |
| `sync-manifest-update` | **yes** | ✅ | ✅ | `sync-manifest-update` | **`.claude/workflows/` `r-x`** (the *parent* — note 4) | §6.4 |
| *(row-read guards — not `operation` values; listed for completeness)* `plugin-artifact-read` / `consumer-artifact-read` | n/a — they produce a row **reason**, not a write failure | ✅ | ✅ | tokens 15/16 (§5.2) | artifact `chmod 0200` | §7.1 P1–P4; §1.4's row-reason floor |

Four readings of this table that matter:

1. **`backup-verify` has no permission form at all.** Its failure is "the backup was written and did
   not land" — a filesystem lie, not an access decision. `chmod` cannot produce it, a full disk
   cannot reliably produce it, and AC-2.9(4)'s negative is exactly the case a permission-only test
   suite cannot reach. That single cell is why the fault seam is not optional, and it is why
   `backup-corrupt` truncates bytes rather than faking the comparison (§5.2).
2. **`drift-state-unlink`'s permission form is `⚠️` — `chattr +i` / `chflags uchg`** — which needs
   root on Linux, is filesystem-dependent, and is unavailable in most containers. It is **not used**;
   AT-16 is built on the fault seam alone and the immutable fixture is not in the inventory. FSPEC
   AT-16's Given ("drift-state file immutable") is realised as *the ladder behaves as if the file
   were immutable*, which is what the AT actually asserts about all three rungs.
3. **Every ✅-F row has an F-only test that runs on every runner**, and the P column is used only for
   the corroborating fixtures §7.3 names. No AT depends solely on P except AT-14b and AT-32(a),
   which is precisely §1.3's uid-0 inventory.
4. **The `artifact-copy` and `sync-manifest-update` permission cells name the *parent directory*,
   not the target file (corrected in v2.0 — TE F-06).** v1.0 named "consumer file `r--`" and
   "sync-manifest file `r--`". Both writes are temp-file-plus-`mv` whole-file replaces (§5.5 step
   (a), "**before** the `mv`"; §4.2 step 6, "a **whole-file replace**"), and `rename(2)` consults
   the **directory's** permissions and never the target file's mode — so a fixture built from
   either v1.0 cell produces a *successful* write and `expectFailOpen()` over it fails for the
   wrong reason, or gets "fixed" by weakening the assertion. The correct permission form for both
   is an unwritable **parent** (`.claude/workflows/` `r-x`), which is the same construction AT-14b
   already uses; note 3 means these cells were unused at v1.0, which is exactly why a wrong cell
   would have been believed rather than exercised. The **F** column is unaffected and remains the
   primary form for both.

### 6.2 Per-runner fixture requirements and the uid-0 caveat

Fixture families and what each demands of the runner:

| Family | Needs | Non-root only? | Policy |
|---|---|---|---|
| fault-injected write failures | nothing beyond `bash` | no | run everywhere; the primary form |
| tool-absence (`makeToolDir`) | the tool to be *resolvable* so a sibling fixture can include it | no | `describeOrSkip("hash")` / `("git")` at file level |
| permission fixtures | `process.getuid() !== 0` | **yes** | `itOrSkip("uid-nonroot", […invariants], …)` per §1.3 |
| `git`-anchored fixtures (§9, §10) | `git ≥ 2.7.0` | no | `describeOrSkip("git")` |
| `ENOTDIR` fixtures (§4.4) | nothing | no | run everywhere — deliberately chosen over a permission bit |

**The uid-0 rule, restated as a test-design rule rather than a caveat.** A permission fixture is
only ever the **corroborating** form of an assertion whose **primary** form is fault-injected. The
two forms assert the same Then over the same tree; only the cause differs. Concretely:

| AT | Primary (F, every runner) | Corroborating (P, non-root) |
|---|---|---|
| AT-16 | `PDLC_FAULT=drift-state-replace,drift-state-invalidate,drift-state-unlink` | *(none — see §6.1 note 2)* |
| AT-27 | `PDLC_FAULT=backup-corrupt` | *(none — see §6.1 note 1)* |
| AT-34 | `PDLC_FAULT=sync-manifest-read` | sync manifest mode `000` |
| `plugin-artifact-unreadable` (§7.1 P2) | `PDLC_FAULT=plugin-artifact-read:<rowId>` (token 15) | plugin artifact `chmod 0200` |
| `consumer-artifact-unreadable` (§7.1 P4) | `PDLC_FAULT=consumer-artifact-read:<rowId>` (token 16) | consumer artifact `chmod 0200` |
| AT-14b | *(none — the fixture **is** the permission asymmetry)* | `.claude/workflows/` `r-x`, drift-state file `rw-` |
| AT-32(a) | *(none — no enumeration fault token, §5.2)* | `.claude/workflows/` `-wx` |

§1.3's named inventory lists AT-14b, AT-16, AT-27, AT-32(a), AT-34 and the two `*-artifact-unreadable`
row reasons because those are the cases whose **fixture** is permission-constructed. This table
refines that: AT-16, AT-27, AT-34 and both row reasons lose nothing on a root runner because their
primary form runs there; **AT-14b and AT-32(a) are the two genuine holes**, and the skip messages for
those two are the only record that the invariant went unverified. That is the distinction §1.3's
closing paragraph makes, and §7.3's skip strings say it in the words an operator reads.

**This claim is only true after v2.0's tokens 15/16 (TE F-03).** At v1.0 the "every other permission
fixture has an F twin" premise was false for §7.1's P2 and P4, and R-2 repeated it. The premise is
restored by making it true rather than by narrowing the claim, because the alternative — a
capability-aware row-reason floor — would have turned §1.4's strongest meta-oracle into a
conditional one on exactly the runner (root, i.e. a container) where a maintainer is least likely to
read a skip line.

**The one thing a fault twin does not corroborate**, stated so no reviewer has to find it: AT-14b's
subject is that an in-place `O_WRONLY|O_TRUNC` needs write permission on the **file** and not on the
**directory** (FSPEC §4.4 rung table row 1). A fault token that makes `drift-state-replace` fail
reproduces the ladder's *behavior* but not that *asymmetry* — under the token, rung (i) succeeds
because nothing stopped it, not because the kernel's permission model says it may. Both are worth
having and they prove different things: the F form (§5.3's first row) pins the ladder, the P form
pins the reason the ladder works. Only the P form skips.

### 6.3 Fail-open assertions per writer surface

"Fail-open" here is FSPEC §4.5's contract — **the run continues, records the failure, and exits 4** —
never "the run degrades quietly". `expectFailOpen()` is the shared assertion:

```js
export function expectFailOpen(run, { path, operation, entrypoint, remainingRows }) { … }
```

It asserts, for a per-row (recordable) failure:

| # | Conjunct |
|---|---|
| 1 | `run.status` is **4** on `check`/`sync`, **0** on `hook` (AC-2.4 is absolute) |
| 2 | `readDriftState(root).writeFailures` contains exactly one entry `{ path, operation }` for the faulted row — **and nothing for the unfaulted rows** |
| 3 | W-7 appears on stderr once per `writeFailures` entry, naming path and operation |
| 4 | **the loop continued**: every row named in `remainingRows` has its post-run state in the record and, where it was copyable, is `in-sync` on disk (AC-1.4) |
| 5 | the trace (§4.2) contains a `copy`/`backup`/`delete` record for the rows *after* the faulted one — the ordering-level form of conjunct 4, which catches an implementation that records the remaining rows' states without having processed them |

and, for a drift-state (stderr-only) failure:

| # | Conjunct |
|---|---|
| 1 | the four stderr-only operations are **absent** from `writeFailures` in whatever record exists (FSPEC §4.4's filter) — asserted as absence from the *record*, presence on *stderr* |
| 2 | the operation is named on stderr in §4.5's both-failed ordering when a per-row failure co-occurs: **drift-state line first** (AT-17) |
| 3 | the ladder's landing rung is discriminated per §5.3 |

Conjunct 2 of the first table is the one that must be stated as **exactly one entry**: a
`writeFailures` array that accumulates an entry per retry, or per rung, still "contains" the
expected entry and would pass a `toContainEqual`. §1.4's coverage floor over the nine operations is
computed from these assertions, so a duplicated entry would also inflate the floor's evidence.

**Per-surface differences the helper takes as parameters, not as separate code paths:**

| Surface | Difference |
|---|---|
| hook | exit 0 always; the record is still written; W-7 still printed |
| `--check` | exit 4; **no artifact writes at all**, so only `mkdir`/drift-state operations are reachable — a `--check` fixture asserting `artifact-copy` is a fixture bug and `expectFailOpen` throws on it |
| sync / `--force` | all nine reachable; the post-run pass (§4.3's `assertRecordedPassIs`) is asserted alongside |

### 6.4 The removal-only sync-manifest-rewrite fixture

FSPEC §10 O-10's fixture note (SE Q-02, v5.0): because §4.2 step 6 is a **whole-file replace** of the
`entries` map and never a per-key merge, a run whose *written* set is empty and whose *removed* set is
non-empty is the case that separates the two implementations. It gets a dedicated fixture,
`removalOnlySyncManifest`:

```
manifest rows:  A (stale), B (in-sync)
sync manifest:  entries { A: {consumerHash: sha1(pre-sync A bytes)},
                          B: {consumerHash: sha1(B bytes)} }
run:            plain sync,  PDLC_FAULT=artifact-copy-corrupt:A
```

A is the only copy candidate (B is `in-sync` and is not copied), and A's copy lands corrupted, so the
run's **verified-copy set is empty** while A's pre-existing entry must be removed (§5.5). Then:

| # | Assertion | Red against |
|---|---|---|
| 1 | `readSyncManifest(root).entries` has **no** `A` | "decline to write the new entry" — the SE F-22 ≡ TE F-33 implementation |
| 2 | `entries.B` is **byte-identical** to its pre-run value, `syncedAtUtc` included | a whole-file replace that regenerates untouched entries, which would break AC-3.7's byte-identity elsewhere |
| 3 | A's post-run state is **`unverified`** (not `local-edit`, not `stale`) | both AT-35 red directions |
| 4 | exit **4**, `writeFailures` = `[{path: A's consumerPath, operation: "artifact-copy"}]` | — |
| 5 | with `PDLC_FAULT=artifact-copy-corrupt:A,sync-manifest-update` instead: the run still exits 4, `writeFailures` gains `{path: syncManifestPath, operation: "sync-manifest-update"}`, and A's entry **survives** — the stated residual of §5.5's SE Q-01 paragraph | an implementation that treats a failed removal as a success |

Assertion 2 is the one this fixture exists for and it cannot be reached from AT-35, whose written set
is non-empty. Assertion 5 pins a residual FSPEC states in prose and no AT covers; it is the reason
this fixture carries five rows rather than being folded into AT-35.

### 6.5 The `json-tool-absent` ladder tests — AT-14 and AT-14b

The two ATs FSPEC §4.4 rung (i) mandates (O-4's "both conjuncts"), built on deliberately different
mechanisms.

**AT-14 — trigger T1, no interpreter, no pre-existing record.**

```
tree:   consumerRoot with .claude/ present, git: true      (repo root resolves)
        plugin ships a valid, non-empty manifest
        no .claude/workflows/, no drift state               (first adoption)
path:   makeToolDir omits python3/python/python2           (§3.2.1)
run:    hook
```

Assertions, in the order they falsify:

1. `readDriftState(root)` **parses** — the whole point, and it is asserted by the fact that
   `readDriftState` throws on unparseable input (§3.4 rule 2) rather than by a `try/catch` in the
   test.
2. `baselineStatus: "unresolved"`, `baselineReason: "json-tool-absent"`, `pluginVersion: null`,
   `syncCommand: null`, `checkEnabled: true`, `rows: []`, `retiredPresent: []`.
3. **`mapDriftState(validateDriftRecord(raw))`** — the real §2.4 function, imported from
   `orchestrate-queue.js`, not a re-implementation — yields `{ outcome: "blocked", row: 4 }`.
   This is O-4's second conjunct and §2.4's row-number affordance is what makes "at row 4" assertable
   rather than "blocked, somehow".
4. hook exit **0**.
5. The record was written through the ordinary path: the trace carries `mkdir` for
   `.claude/workflows/` and a `write` record, in that order, both **after** the as-found classify
   records (§4.3) — the T1 emitter is not a bypass of AC-2.9(1).

Assertion 3 is why the JSON tool is removed with `makeToolDir` rather than faulted: the oracle
(`JSON.parse`, then the queue's own validator) must be strictly outside the subject's dependency set,
and on this tree it provably is — there is no interpreter for it to accidentally share.

**AT-14b — trigger T2, `r-x` parent, writable file, `checkEnabled: false`.**

```
tree:   .claude/workflows/ exists and contains a pre-existing drift state
        .claude/pdlc.config.json  { distribution: { checkEnabled: false } }
        chmod 0500 .claude/workflows/          ← after the drift state is written
        chmod 0600 .claude/workflows/.pdlc-drift-state.json
path:   full (a JSON tool IS present — the config must be readable)
run:    check         (the quietest entrypoint — see below)
guard:  itOrSkip("uid-nonroot", [ …§1.3's two invariants… ], …)
```

Assertions: the record **parses**; `baselineReason: "drift-state-invalidated"`;
`pluginVersion: null`; `syncCommand: null`; **`checkEnabled: false`**; `inodeOf(driftStatePath)`
equals `run.driftStateInodeBefore` (rung (i) landed, §5.3); and
`mapDriftState(…)` yields `{ outcome: "proceed", row: 2 }`.

Three construction notes:

- **Mode bits are applied last**, after every file the fixture needs is in place, and the cleanup
  helper `chmod`s the directory back before `rmSync` — otherwise jest's teardown leaves temp trees
  behind on every run and the next `mkdtempSync` is slower for the rest of the suite.
- **`check` is chosen over `sync`** for the primary assertion. FSPEC AT-14b's scoping note (TE Q-02)
  says a sync run's `r-x` directory additionally blocks copies, backups and the sync-manifest write,
  adding expected `artifact-copy`/`backup` entries to `writeFailures`; those do not defeat the
  assertions (row 2 outranks row 3) but they make the test read as though it were about them. The
  sync form runs as a **second `it()`** in the same describe, asserting the same six conjuncts plus
  the extra `writeFailures` members, so the note is pinned rather than merely believed.
- **`checkEnabled: false` is the falsifiable conjunct.** Against an emitter that hard-codes `true` —
  the natural way to write a `printf` template — every other assertion still passes. It is listed
  last in the test body so its failure message is the one a reader sees first.

---

## 7. Probe vocabulary and permission-fixture policy (O-11)

§1.3 states the `describeOrSkip`/`itOrSkip` contract and §1.4 the coverage floors. This section
gives the probe → fixture mapping those two depend on, pins the printed strings, and (§7.4, new in
v2.0) states the **remediation-content** assertions the message floors are computed from.

### 7.1 Probe vocabulary — FSPEC §3.2's six probes as fixture recipes

Each probe's three-valued outcome needs a constructible tree. The `indeterminate` column is the one
that matters: it is what produces `unknown`, and every one of those recipes is a permission or
fault fixture, never an ordinary tree.

| Probe | `yes` | `no` (definite) | `indeterminate` | Yields |
|---|---|---|---|---|
| P1 plugin artifact exists | file present | file absent, ancestors traversable | `chmod 0600` on `workflows/dist/` (**P**) — the directory is unsearchable, so existence is undecidable; **F**: `PDLC_FAULT=plugin-artifact-read:<rowId>` (token 15) | `plugin-artifact-missing` / `plugin-artifact-unreadable` |
| P2 plugin artifact readable | mode `r--` | — | `chmod 0200` on the artifact (**P**), or `PDLC_FAULT=plugin-artifact-read:<rowId>` (**F**, token 15) | `plugin-artifact-unreadable` |
| P3 consumer artifact exists | file present | absent, `.claude/workflows/` traversable | `.claude/workflows/` mode `0600` (**P**); **F**: `PDLC_FAULT=consumer-artifact-read:<rowId>` (token 16) | `missing` / `consumer-artifact-unreadable` |
| P4 consumer artifact readable | mode `r--` | — | `chmod 0200` on the consumer file (**P**), or `PDLC_FAULT=consumer-artifact-read:<rowId>` (**F**, token 16) | `consumer-artifact-unreadable` |
| P5 sha1 | hash tool present | — | `makeToolDir` omits `shasum`/`sha1sum`/`openssl` (**F-equivalent, no root needed**) | `hash-tool-absent` |
| P6 sync-manifest entry | entry present | no entry | unreadable/malformed ⇒ **treated as `no`**, §1.2 | `unverified` |

**Two corrections in v2.0 (TE F-03).** (1) v1.0's P1 row named `PDLC_FAULT=manifest-read` as the F
escape. That is wrong: token 3 faults **E4's read of the distribution manifest** (§5.2) and yields
the *baseline* reason `plugin-root-unreadable` — a different failure at a different site from the
*row* reason `plugin-artifact-unreadable`. (2) v1.0 marked P2 and P4 **(P)**-only, and §5.2's
fourteen tokens contained no per-artifact read guard, so two of the four `unknown` row reasons were
unconstructible on a root runner while §1.4's row-reason floor asserts set-equality over all four.
Tokens 15/16 close both.

**P5's recipe needs no permission bit and no root**, which is why the row-reason floor's
highest-precedence member (`hash-tool-absent`, §3.3 rung 1) is the one reason that never skips.
After the correction, **none** of the four row reasons skips: P1's definite-`no` and P5 are ordinary
fixtures, and P1–P4's `indeterminate` recipes all have an F form. The **permission** recipes remain
in the inventory as the *corroborating* forms (§6.2's rule), each carrying
`itOrSkip("uid-nonroot", …)` and naming, as its unverified invariant, the specific row reason it was
to have produced — §1.3's inventory lists the two.

**`hash-tool-absent` is all-or-nothing** (FSPEC §3.3's second consequence), so the fixture builder
refuses to construct a per-row variant: `makeConsumerTree` throws if a spec asks for
`hash-tool-absent` on some rows and not others. O-9 is told not to generate one; this makes it
impossible rather than merely discouraged.

### 7.2 Message matchers

`RunResult.notices` / `.warnings` are produced by one exported table, so no test greps stderr with
an ad-hoc regex:

```js
export const MESSAGES = {
  // Every warning that carries a remediation captures it WHOLE, to end of line (§7.4).
  "W-1": /^pdlc: workflow drift check could not run — (?<reason>[a-z-]+)\. (?<remediation>.*)$/m,
  "W-2": /^pdlc: (?<id>\S+) could not be verified — (?<reason>[a-z-]+)\. (?<remediation>.*)$/m,
  "W-3": /^pdlc: (?<id>\S+) differs from the plugin's copy .*\(--force required\): (?<cmd>.*)$/m,
  "W-4": /^pdlc: (?<id>\S+) was edited locally after its last sync\. .*backing it up to (?<backupDir>\S+): (?<cmd>.*)$/m,
  "W-5": /^pdlc: (?<id>\S+) is (?<state>stale|missing)\. Run: (?<cmd>.*)$/m,
  "W-6": /^pdlc: retired-present — (?<path>\S+) is superseded by (?<id>\S+) \((?<state>[a-z-]+)\)\. (?<remediation>.*)$/m,
  "W-7": /^pdlc: could not write (?<path>.+) \((?<operation>[a-z-]+)\)$/m,
  "N-3": /^pdlc: drift state is not writable at (?<path>.+);/m,
  "N-4": /^pdlc: sync manifest at (?<path>.+) is (?<kind>unreadable|malformed);/m,
  "N-5": /^pdlc: (?<path>.+) could not be read for distribution\.checkEnabled;/m,
  "N-6": /^pdlc: could not list (?<dir>.+);/m,
  "N-7": /^pdlc: unrecognised PDLC_FAULT token "(?<token>[^"]*)";/m,
  "N-8": /^pdlc: no write target — the consumer repo root did not resolve,/m,
};
export function countOf(stderr, id) -> number             // §5.4 conjunct 1 uses this
export function remediationOf(stderr, id) -> string       // the `remediation` or `cmd` capture, trimmed
export function allOf(stderr, id) -> RegExpMatchArray[]   // every occurrence, for per-row warnings
```

Three rules. The matchers are **anchored** (`^pdlc: `) so a message quoted inside another message
cannot satisfy them; every matcher is **capture-bearing**, so an assertion reads the reason / path /
token out of the line rather than asserting a substring that also matches a differently-worded line;
and — new in v2.0, PM F-02 — **every remediation-bearing message captures its remediation text to
end of line**, in a named group (`remediation`, or `cmd` where the shape is a bare command).

**Why the third rule was missing and why it is load-bearing.** v1.0's patterns all terminated at the
first `;`/`.` and captured only `reason`/`id`/`path`/`kind`/`token` — **no matcher reached a command
string**, and the word "remediation" did not occur in the document. Since §7.2 also makes `MESSAGES`
the only sanctioned route to stderr ("no test greps stderr with an ad-hoc regex"), AC-2.1's third
conjunct ("the row `id`, the state, **and the exact remediation command**") and every
`<pluginRoot>`-expansion clause (AC-0.4, AC-2.5a, AC-2.8, AC-4.2) were unassertable **by
construction**. The whole operator-facing payoff — AC-4.2's "the operator's next turn is one command,
not an investigation" — could regress to an unexpanded `${CLAUDE_PLUGIN_ROOT}/…` literal or a wrong
flag with the suite green. §7.4 states what the captured text must satisfy.

AT-30's distinctness predicate (§14) runs over the *rendered* messages, not over these
patterns — the patterns are how a test finds a line, `distinct()` is what the line must satisfy.

### 7.3 The printed skip strings

`describeOrSkip`/`itOrSkip` print one line per skip (§1.3 clause 3). The reason strings are pinned
here because O-11 requires the *named* invariants and a generic line is the failure mode:

| Guard | Printed reason |
|---|---|
| `uid-nonroot` | `runner uid is 0, so permission bits are bypassed and the operation succeeds; the fixture's failure cannot be constructed` |
| `hash` | `no sha1 utility (shasum/sha1sum/openssl) on PATH; every managed row would classify unknown/hash-tool-absent` |
| `git` | `git is not on PATH (or is older than 2.7.0), so \`git worktree list --porcelain\` is unavailable` |
| `bash` | `bash is not available on this runner` |

Each is followed by `Unverified: ` and the caller's invariant list, joined by `; `. §1.3's inventory
supplies those lists for the five named ATs; every other `itOrSkip` call site supplies its own, and
the helper **throws** when the list is empty — the rule is enforced by the runner, not by review.

---

### 7.4 Remediation-content assertions (AC-2.1, AC-2.5, AC-2.5a, AC-2.8, AC-0.4, AC-4.2)

New in v2.0 (PM F-02, PM F-06). `distinct()` (AT-30) proves the remediation strings *differ*; it is
satisfied by four differently-worded but uniformly **wrong** remediations. These assertions say what
each one must *be*. They are stated as **classes** plus a small number of literal conjuncts, so
incidental rephrasing (FSPEC §8's stated latitude) does not break them but a wrong repair path does.

```js
// __tests__/helpers/driftMessages.js
export const CLASSES = {
  sync:        { mustName: [SYNC_CMD], mustNotName: [] },
  forceSync:   { mustName: [SYNC_CMD, "--force"], mustNotName: [] },
  pluginUpdate:{ mustName: ["update the plugin"], mustNotName: [SYNC_CMD, "--force"] },
  permissions: { mustName: [],  mustNotName: [SYNC_CMD, "--force", "update the plugin"] },
  environment: { mustName: [],  mustNotName: [SYNC_CMD, "--force", "update the plugin"] },
};
export function expectRemediationClass(text, className, extraConjuncts) { … }
```

`SYNC_CMD` is the run's **expected expanded** sync invocation, computed by the test from the fixture's
`pluginRoot` — never a substring like `"sync"`, which "resyncing" would satisfy. Every class also
asserts the universal §8.1 conventions: the line starts `pdlc: `, and it **never** contains a manual
`rm`/`delete` recommendation (AC-2.8's absolute rule).

**AC-2.5 — the four row reasons → their remediation class** (floor: all four):

| Row reason | Class | The regression it catches |
|---|---|---|
| `hash-tool-absent` | `environment` — install a hash utility | a sync recommendation; sync cannot install `shasum` |
| `plugin-artifact-missing` | `pluginUpdate` | a sync recommendation; the *plugin* is missing the file, copying it is impossible |
| `plugin-artifact-unreadable` | `permissions` | **either** a sync **or** a plugin update — AC-2.5 names this case explicitly ("the `*-unreadable` reasons get a permissions fix — not a sync, not a plugin update") |
| `consumer-artifact-unreadable` | `permissions` | same |

Reached via `MESSAGES["W-2"]`'s `reason` + `remediation` captures on a run whose rows carry each
reason (the §7.1 recipes, F forms). The `mustNotName` half is the operative one: it is what makes
this a *pairing* assertion rather than a second distinctness test.

**AC-2.8 — R's state → the retired-present remediation** (floor: all six, FSPEC §5.3's table):

| R's state | Class | Extra conjuncts |
|---|---|---|
| `in-sync` | `sync` | the primary, rollout-universal case; `cmd` is `SYNC_CMD` with **no** `--force` |
| `stale` | `sync` | same |
| `missing` | `sync` | same |
| `local-edit` | `forceSync` | names the backup **directory**; names **both** filename **patterns** (R's bundle and the retired basename) **each labelled**; contains **no concrete filename** — asserted as "no substring matching `-\d{2}\.bak$`", since the concrete name depends on a timestamp that does not exist yet |
| `unverified` | `forceSync` | same |
| `unknown` | `pluginUpdate` **or** `environment` | **`mustNotName: [SYNC_CMD]`** — AC-2.8 says "sync is not named", and this is the branch where a wrong remediation destroys nothing but wastes the operator's whole next turn |

Reached via `MESSAGES["W-6"]`'s `state` + `remediation` captures over the `retiredPresent` fixture,
one run per state of R (`setRowState` supplies all six, §3.3). This is the floor v1.0 lacked
entirely: §14 exercised exactly two of the six (AT-11 `in-sync`, AT-13 `unknown`).

**AC-2.5a — the eight baseline reasons → their remediation class** (floor: all eight), from FSPEC
§5.2's table, reached via `MESSAGES["W-1"]` — except `drift-state-invalidated`, whose only rendering
site is §6.3's Manifest-level line (FSPEC §8.2's S3 note), asserted there:

| Baseline reason | Class |
|---|---|
| `manifest-absent`, `manifest-malformed`, `manifest-empty` | `pluginUpdate` — and `mustNotName: [SYNC_CMD]`, FSPEC §8.1 |
| `plugin-root-unset` | `environment` |
| `plugin-root-unreadable` | `environment` (deliberately generic — asserted as *not* naming a specific fix) |
| `repo-root-unresolved` | `environment` — names `.claude/` and "git work tree" |
| `json-tool-absent` | `environment` — names a Python interpreter |
| `drift-state-invalidated` | `permissions` — and `mustNotName: [SYNC_CMD]`, FSPEC §8.1 and AC-4.2 |

**The `syncCommand` expansion assertion (AC-0.4, AC-4.2; floor: ≥ 1 positive).** v1.0 asserted
`syncCommand` only negatively or shape-wise — `null` in AT-14/AT-14b, `42 ⇒ D8` and
`delete syncCommand ⇒ ok` in §12.1 — and never that a resolved baseline carries the expanded
invocation. AT-24 (§9.2) is the one place in the suite where a **fully-resolved** record exists, so
the positive assertion lands there:

```js
expect(record.syncCommand).toBe(join(root, "pdlc/hooks/scripts/sync-workflows.sh"));
```

**String equality, not `toContain`** — the failure being guarded is a literal
`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh` reaching the operator, and `toContain` on
the tail passes against exactly that. Two companions in the same test: the string contains no `$`
and no `{`, and `W-5`'s `cmd` capture from the same run is **byte-equal to `syncCommand`** — the
queue prints the record's field (FSPEC §6.3) and the hook prints its own expansion, so a divergence
between the two is a real operator-visible defect and nothing else in the suite would see it.

## 8. Repo-root resolution — the non-git fixture and its oracle (O-3)

### 8.1 What O-3 actually demands

Three separable claims, each with its own test, because a single "non-git tree resolves correctly"
test proves none of them:

1. AC-0.5 **step 2 is reachable only on a non-git fixture** — so the walk has to be tested on a tree
   with no `.git` anywhere between `$PWD` and `$HOME`.
2. **Step 1's failure goes to step 3, never to the walk** (FSPEC §2.2 point 1) — the falsifying test
   needs a tree where the walk *would* succeed, so that a softened implementation is observably
   different.
3. The `repo-root-unresolved` oracle must assert **observables that exist in that state**. There is
   no drift state, so there is no `baselineReason` field to read; the observables are stderr, the
   exit code, and the filesystem.

### 8.2 The fixtures and the two fault tokens

| Fixture | Construction | Reaches |
|---|---|---|
| `nonGitWithClaude` | no `.git` from `root` to `home`; `root/.claude/` present; cwd `root/sub/dir` | step 2 **succeeds** — the walk's positive case |
| `nonGitNoClaude` | no `.git`, no `.claude/` anywhere | step 2 **fails** ⇒ `repo-root-unresolved` |
| `gitTreeBrokenProbe` | `git init` at `root`, **and** `root/.claude/` present, run with `PDLC_FAULT=git-worktree-list` | step 1 applies and fails ⇒ **must** be `repo-root-unresolved` |
| `nonGitClaudeAtHome` | no `.git`; the only `.claude/` is at `home` itself | the `$HOME` rejection (§2.2 clause 2) |
| `gitAbsent` | `nonGitWithClaude`'s tree, `makeToolDir` omitting `git` | step 1 does not apply; the `else` branch runs |

`gitTreeBrokenProbe` is the whole point of O-3's "one fault token per guard". With only one token
covering both guards, faulting it on a git tree would be indistinguishable from faulting the walk,
and the never-fall-through rule would have no falsifying fixture at all. The assertion:

```js
// driftRepoRoot.test.js
it("a git tree whose worktree probe fails does NOT fall through to the walk", …)
//   fixture: gitTreeBrokenProbe — root/.claude/ EXISTS, so the walk would succeed
//   expect:  repo-root-unresolved, nothing written
//   red against: an implementation that catches the git failure and walks
```

`walk-stat` is faulted on `nonGitWithClaude` for the mirror case: the walk's failure must also be
`repo-root-unresolved` and must not somehow re-enter step 1.

### 8.3 The `repo-root-unresolved` oracle

```js
export function expectRepoRootUnresolved(run, { root, snapshotBefore, reportedReason }) { … }
```

| # | Conjunct | Why it, and not a drift-state field |
|---|---|---|
| 1 | stderr carries **W-1** with `reason` captured equal to `reportedReason` | the reason is only ever *printed* in this state — nothing is written, so `readDriftState` is `null` and asserting `baselineReason` is impossible |
| 2 | `run.status` is **3** on `check`/`sync`, **0** on `hook`; **never 4** (FSPEC §5.8) | exit 4 would mean something was attempted |
| 3 | `assertTreeUnchanged(root, snapshotBefore)` | the positive form of "nothing created" |
| 4 | `readDriftState(root) === null` **and** `readSyncManifest(root) === null` **and** no `.pdlc-backups/` | the specific negatives §2.8's table names |
| 5 | **N-8** is present iff `reportedReason !== "repo-root-unresolved"` | FSPEC §8.3's narrow emission condition, asserted in both directions |

`assertTreeUnchanged` compares a **recursive snapshot** — relative path, type, mode, and sha1 of each
regular file, **excluding any path with a `.git/` segment** — taken immediately before `runScript`
and again after. The `.git/` exclusion is normative, not tidiness (TE F-12): §8.2's
`gitTreeBrokenProbe` and §10.3's `fxNoGitDir`/`fxUnbornHead` fixtures are `git init`-ed trees whose
`.git/` contents (index mtime and size, `logs/`, `gc.log`, `FETCH_HEAD`) change as an incidental
effect of any git invocation in or around the run — including the subject's own
`git worktree list --porcelain` — so an unscoped helper would make the strongest "nothing was
created" assertion in the suite intermittently red for a reason that has nothing to do with the
claim. Nothing this feature writes ever lands under `.git/`, so the exclusion costs no coverage. A "no `.claude/` was created"
assertion is the weaker form, and it passes against a run that wrote a backup directory, touched the
plugin tree, or created something under `$PWD` outside `.claude/` — which is exactly the
"invent a path relative to `$PWD`" implementation FSPEC §2.2 clause 2 forbids. The snapshot form is
the only one that falsifies it.

### 8.4 The co-holding case — AT-33 and the `$HOME` guard

AT-33 is `nonGitNoClaude` **plus** a plugin manifest with `rows: []` and a JSON tool present, so
`manifestEmpty` holds and outranks `repoRootUnresolved` for reporting. It runs
`expectRepoRootUnresolved(run, { reportedReason: "manifest-empty" })`, which by conjunct 5 requires
N-8 — and it runs both `check` (exit 3) and `hook` (exit 0) over the same tree.

`nonGitClaudeAtHome` is asserted the same way with `reportedReason: "repo-root-unresolved"`, and
carries one extra conjunct: the snapshot is taken over **`home`**, not over `root`, because the
failure this guards is a write into `$HOME/.claude/`. It is the one fixture in the suite whose
`home` deliberately contains a `.claude/`, and the harness's "home is a sibling, never an ancestor"
rule (§3.3) is what keeps every *other* fixture from accidentally exercising it.

---

## 9. Bootstrap fixture construction (O-12)

AC-6.5 / AT-24: a fresh clone, **no plugin installed**, `${CLAUDE_PLUGIN_ROOT}` unset, two commands.

### 9.1 `makeFreshClone()`

```js
export function makeFreshClone() -> { root, home, cleanup }   // __tests__/helpers/freshClone.js
```

Five steps, each with a reason it cannot be simplified away:

| # | Step | Why |
|---|---|---|
| 1 | `cp -R` the **working tree** (not `git clone`, not `git archive`) into a fresh `mkdtemp`, excluding `.git/`, `node_modules/`, and `.claude/workflows/` | the subject of the test is the tree **as it stands in this commit-to-be**; a `git clone` of `HEAD` would test the previous commit, which is exactly the regression AC-6.3/AC-6.6 exist to catch. `cp -R` preserves the on-disk execute bit, which step 4 then asserts rather than sets |
| 2 | replay index modes: for each path from `git ls-files -s` in the live repo with mode `100755`, `chmod +x` the copy | belt-and-braces against a runner whose `cp` implementation drops mode bits (some `busybox` builds) and against a `core.fileMode=false` checkout, where the on-disk bit may not match the committed one. The **live index** is the authority — it is what ships |
| 3 | `git init -b main`, `git -c user.email=… -c user.name=… add -A && commit -q` | O-16's requirement in its other setting: the tree must have a `HEAD`, or §10.3's unborn-`HEAD` branch fires and AC-6.5's own build/check steps run under a skip. Config is passed with `-c`, never written to the runner's global config |
| 4 | `home := mkdtemp` **sibling** of `root`; nothing is written into it | §2.2 clause 2's guard, and the reason the two commands can be trusted not to have touched `$HOME/.claude/` |
| 5 | every returned path passes through `realpathSync` | §3.3's normalisation rule; the clone lives under `tmpdir()`, which is a symlink on macOS, and AC-6.5's assertion set compares the resolved `<repoRoot>` against the fixture root |

**Excluding `.claude/workflows/` from the copy is load-bearing, not tidiness.** Post-landing that
directory is gitignored and a real fresh clone does not have it; copying the maintainer's own synced
bundles into the fixture would make every row `in-sync` before `sync-workflows.sh` ran, and AT-24's
"all rows `in-sync`" assertion would be vacuously true against a sync script that does nothing.

**`pdlc/workflows/dist/` is *not* excluded** — it is tracked and committed post-landing, so a fresh
clone has it, and step 1 of AT-24 (`node build-runtime.mjs`) is then a no-op-if-fresh rebuild, which
is the real bootstrap sequence. AT-24 asserts the builder reported `in-sync` for each artifact
rather than `wrote`, which is the same freshness claim AC-6.3 makes, observed from the bootstrap
side.

The clone is built **once per describe block** (`beforeAll`) and reused: it is the most expensive
fixture in the suite (a full working-tree copy) and nothing AT-24 asserts mutates it in a way a
sibling test would notice, because the two commands are the test.

### 9.2 The AT-24 assertion set

```
run:  execFileSync("node", ["pdlc/workflows/build-runtime.mjs"], { cwd: root, env: sandboxEnv(...) })
      runScript("sync", { consumerRoot: root, pluginRoot: undefined, home })
then: runScript("check", …)
```

`pluginRoot` is deliberately **undefined**, so `CLAUDE_PLUGIN_ROOT` is absent from the child
environment (§3.2) and §2.4's maintainer-marker branch is the one under test — the marker file
`pdlc/workflows/build-runtime.mjs` is present in the clone, so `<pluginRoot>` resolves to
`<root>/pdlc` without the env var being consulted. The trace's `plugin-root` record (§4.2) is
asserted to carry `<root>/pdlc`; that is the positive observable that the marker branch, and not
some fallback, produced it.

| # | Assertion |
|---|---|
| 1 | both bundles and `distribution-manifest.json` exist under `<root>/pdlc/workflows/dist/` |
| 2 | after sync: every row `in-sync` in the written drift state, `writeFailures: []` |
| 3 | `runScript("check")` exits **0** |
| 4 | `mapDriftState(validateDriftRecord(raw))` yields `{ outcome: "proceed", row: 9 }` — *proceed silently*, the row number distinguishing it from row 2's opt-out and row 8's noisy proceed |
| 5 | the as-found trace of the **sync** run classified every row `missing` (§3.2's ancestor rule) and the `mkdir` records follow every as-found `classify` record — AC-3.8 and AC-2.9(1) on the same run |
| 6 | `assertTreeUnchanged(home, …)` — nothing was written under `$HOME` |
| **7** | **`record.syncCommand` is string-equal to `<root>/pdlc/hooks/scripts/sync-workflows.sh`** — §7.4's positive expansion assertion, plus: the string contains no `$` and no `{`, and `MESSAGES["W-5"].cmd` from a run over the same tree with one row made `stale` is byte-equal to it (AC-0.4, AC-4.2, PM F-02) |

Assertion 7 is why AT-24 is the landing site rather than some new fixture: this is the **only**
fully-resolved record in the suite (`<pluginRoot>` resolves through §2.4's maintainer-marker branch,
so the expected value is derivable from the fixture root alone and no environment variable is
involved). Every other `syncCommand` assertion in the document is negative or shape-wise —
`null` in AT-14/AT-14b, `42 ⇒ D8` and `delete syncCommand ⇒ ok` in §12.1 — and a suite of only those
is green against an emitter that never expands anything.

### 9.3 Both mode-bit assertions (O-12)

Two **independent** objects, both required by FSPEC §7.5 item 4, asserted for **all five** scripts
(`check-workflow-drift.sh`, `sync-workflows.sh`, `check-scope-field.sh`,
`guard-harvest-before-delete.sh`, `nudge-consolidation.sh` — C1's `lib/pdlc-drift.sh` is
deliberately **excluded**, it is sourced and carries no execute bit, OQ-4):

| Object | Assertion | Root | Catches |
|---|---|---|---|
| index mode | `indexMode(liveRepoRoot, rel) === "100755"` | **live repo** | a script committed `100644`, which ships broken to every consumer even though the maintainer's own checkout works |
| on-disk mode | `fs.accessSync(join(freshClone, rel), fs.constants.X_OK)` does not throw | **fresh clone** | a copy/packaging step that drops the bit, and — because step 2 of §9.1 replays from the index — a divergence between the two objects |

They fail for different reasons and neither implies the other: a `core.fileMode=false` checkout can
have a `100755` index entry over a non-executable file, and a locally `chmod +x`-ed file can sit
under a `100644` index entry. Asserting only one of them is the defect REQ §0 fact 11 recorded.

The bare-path invocation is exercised **here and only here** (§3.1): AT-24 runs
`execFileSync(join(root, "pdlc/hooks/scripts/sync-workflows.sh"))` with no interpreter, which is
AC-6.5's documented command and the thing an `EACCES`/exit-126 regression actually breaks. A separate
`it()` asserts `status !== 126` explicitly, because a 126 otherwise surfaces as "sync produced no
drift state", four assertions later, with a misleading message.

---

## 10. Root-parameterised jest oracles

All three live in `pdlc/workflows/lib/document-oracles.mjs` (§2.1) and are pure functions of a root
directory: no `process.cwd()`, no `import.meta.url`-relative path, no ambient state. That is what
makes the two-root structure possible, and `documentOracles.test.js` asserts it directly — each
oracle is called with two different roots in the same test file and neither call perturbs the other.

Return shapes:

```js
coveredViolations(root)          -> { path, patterns: string[] }[]         // sorted by path, LC_ALL=C
packagingViolations(root)        -> { clause, path, detail }[]             // sorted by (clause, path)
advertisedVersionViolation(root) -> "red" | "green" | { skipped: string }
```

`coveredViolations` returns **one entry per file**, with `patterns` naming which of the five literal
patterns matched. AC-6.4's cardinality assertion is therefore over files, which is what "7 files
today" means; a per-match shape would make the count depend on how many times a document repeats a
phrase, and the fixture's count would drift on an unrelated edit.

### 10.1 `coveredViolations(root)` and the pinned fixture tree (O-17)

**The fixture is checked in, not generated at runtime.** `pdlc/workflows/__tests__/fixtures/covered-violations/`
is a literal tree of small markdown/JS files committed to the repo. Three reasons, in order of
weight:

1. **A generated fixture is written by the same author as the oracle**, so a narrowed pattern and a
   correspondingly narrowed generator stay green together — which is the exact regression AC-6.4's
   anti-widening guard exists to catch. A checked-in tree changes only by a diff a reviewer sees.
2. It costs nothing at runtime and needs no cleanup.
3. It reproduces the **pre-landing layout** faithfully, including the two `docs/<X>/` shapes whose
   discrimination is load-bearing (exemption (ii)).

**Why it can be checked in at all: exemption (iv), `any __tests__/`.** The fixture contains the five
patterns verbatim; without an exemption it would itself be counted by
`coveredViolations(liveRepoRoot)` and AT-22's `== ∅` would be red from the moment the fixture
landed. Exemption (iv) is what makes a checked-in fixture legal, and this is the reason it exists —
recorded here because a future reader trimming the exemption list to "the ones we use" would remove
the one holding this fixture up. When the oracle runs over the **fixture root**, the relative paths
contain no `__tests__/` segment, so (iv) does not fire there.

**The gitignore hazard, closed at the landing step.** FSPEC §7.5 item 1 gitignores
`.claude/workflows/` wholesale, and the fixture contains a nested `.claude/workflows/` directory
(it must, to exercise exemption (i)). An unanchored pattern matches at **every** depth, so the
fixture's files would be silently uncommittable and the tree would arrive empty on a fresh clone —
turning AT-23's `== 7` into `== 0` with no diff to explain it. The landing step therefore writes
**anchored** patterns (`/.claude/workflows/`, `/pdlc/workflows/dist/`), and
`documentOracles.test.js` carries a guard asserting every file the fixture inventory names is
present on disk **and** tracked (`git ls-files --error-unmatch`), so the failure is reported as
"the fixture is not committed" rather than as an oracle bug.

**The guard is two assertions, split by capability (TE Q-04).** The **on-disk presence** half needs
no git and runs on every runner; the **tracked-ness** half is wrapped in `itOrSkip("git", […])`
naming "an uncommittable fixture would arrive empty on a fresh clone and AT-23 would report
`== 0`" as its unverified invariant. Splitting them matters because they fail for different
reasons: on a `git`-less runner the presence check alone still catches the empty-tree case in the
only way that runner can, and AT-23's own `== 7` remains the backstop.

**Fixture contents — one file per discrimination, 7 expected violations:**

| # | Fixture path (relative to the fixture root) | Pattern it carries | Expected |
|---|---|---|---|
| 1 | `docs/_queue/QUEUE.md` | `.claude/workflows/orchestrate-queue.js` | **violation** — `docs/_queue/` has no `REQ-_queue.md`, so exemption (ii) must **not** fire |
| 2 | `docs/design/MASTER-PLAN.md` | `managed manually` | **violation** — same discrimination, second shape |
| 3 | `docs/PLAN-top-level.md` | `.claude/workflows/*.js` | **violation** — a `docs/` file in no subdirectory at all |
| 4 | `pdlc/skills/orchestrate-dev/SKILL.md` | `.claude/workflows/orchestrate-dev.js` | **violation** |
| 5 | `pdlc/skills/orchestrate-queue/SKILL.md` | `copying the bundle into a consumer repo` (case-tolerant stem) | **violation** |
| 6 | `pdlc/workflows/orchestrate-dev.js` | `.claude/workflows/orchestrate-dev.js` in a comment | **violation** |
| 7 | `pdlc/workflows/orchestrate-queue.js` | `managed manually` in a comment | **violation** |
| — | `docs/some-feature/REQ-some-feature.md` + `docs/some-feature/FSPEC-some-feature.md` | both patterns | **exempt (ii)** — the directory contains `REQ-<X>.md` |
| — | `.claude/workflows/orchestrate-dev.bundle.js` | pattern | **exempt (i)** |
| — | `pdlc/workflows/dist/orchestrate-queue.bundle.js` | pattern | **exempt (i)** |
| — | `pdlc/workflows/dist/distribution-manifest.json` | pattern inside a JSON string | **exempt (i) and (iii)** — both, deliberately, so removing either exemption alone is still caught by another row |
| — | `pdlc/workflows/__tests__/someTest.js` | pattern | **exempt (iv)** |

The seven expected paths mirror the seven the live root returns **today** (pre-landing), including
both orchestrator SKILLs — so a reader can check the fixture against the thing it models. After the
landing commit the live root returns `∅` (AT-22) while the fixture still returns 7 (AT-23); that
divergence is the design, not a drift.

**AT-22 and AT-23 are two `it()` blocks over two roots, with no shared state** (O-17):

```js
it("AC-6.4 landing criterion — the live root is clean", () => {
  expect(coveredViolations(LIVE_ROOT)).toEqual([]);
});

it("AC-6.4 anti-widening guard — the pinned fixture returns exactly 7", () => {
  const v = coveredViolations(FIXTURE_ROOT);
  expect(v.map(e => e.path)).toEqual(EXPECTED_SEVEN);       // literal array, sorted
  expect(v).toHaveLength(7);
  expect(EXEMPTIONS).toEqual([                              // the list itself, asserted literally
    "generated trees: .claude/workflows/ and pdlc/workflows/dist/",   // (i) — ONE member, two trees
    "feature-docs: docs/<X>/ containing REQ-<X>.md",                  // (ii)
    "any distribution-manifest.json",                                 // (iii)
    "any __tests__/",                                                 // (iv)
  ]);
});
```

The exemption list is exported from `document-oracles.mjs` as a frozen array and asserted
**literally**, per AC-6.4: widening an exemption is then a red test even when the fixture's file set
is untouched, which is the case a count-only assertion misses.

**`EXEMPTIONS` has exactly four members, matching FSPEC §7.5's enumeration (corrected in v2.0 —
TE F-10).** §7.5 reads "a **four-member** exemption enumerated literally: (i) generated trees
`.claude/workflows/` **and** `pdlc/workflows/dist/`; (ii) …; (iii) …; (iv) …" — (i) is **one**
member covering two trees. v1.0's literal split it into two strings, giving five, and since AT-23
asserts this array *literally* (which is the point — widening must be red even when the file set is
untouched) a conforming implementation would have failed AT-23 on a representation accident. The
representation is pinned here deliberately: **one string per FSPEC clause, in clause order**, and
the two generated trees are named inside member (i)'s single string. A future exemption is a new
array member **and** a new FSPEC §7.5 clause, in the same commit — never a silent split of an
existing one, which would change the array without changing the exempted set.

### 10.2 `packagingViolations(root)`

Same two-root structure, but **both** fixture roots are built in the runner's temp area (O-17's
proviso), because the clause-(b) fixture must carry a manifest whose `pluginSha1` disagrees with the
bytes on disk — content that has no business being committed, and that §7.3's rule keeps out of the
live `dist/`.

| Test | Root | Assertion |
|---|---|---|
| AT-19 | `LIVE_ROOT` | `packagingViolations(LIVE_ROOT)` **`toEqual([])`** — stated over the returned set, so an oracle returning `[]` for every root is caught by AT-29 rather than passing both |
| AT-29 | `fxRoot3` = `makePackagingFixture({ break: "sha1" })` | contains an entry with `clause: "6.2(b)"` and that row's `path`; **and** `packagingViolations(LIVE_ROOT)` is still `[]` in the same test file, proving the two calls are independent |
| — | `makePackagingFixture({ break: "retired" })` | `clause: "6.2(c)"` — M8's union rule, the clause most likely to rot silently |
| — | `makePackagingFixture({ break: "pluginPath" })` | `clause: "6.2(a)"` |
| — | `makePackagingFixture({ break: "manifestLocation" })` | `clause: "6.2(d)"` |

`makePackagingFixture` builds a minimal `root/pdlc/workflows/dist/` with two bundle files and a
manifest computed from their bytes (the green baseline), then applies exactly one `break`. The green
baseline is itself asserted (`packagingViolations(fxGreen)` is `[]`) — without it, a fixture whose
*construction* was broken would produce the expected clause for the wrong reason.

A guard in `documentOracles.test.js` asserts that no test wrote into
`LIVE_ROOT/pdlc/workflows/dist/`: a snapshot (§8.3's `assertTreeUnchanged`) of that directory is
taken in `beforeAll` and compared in `afterAll`. AT-19's second conjunct is thereby enforced rather
than promised.

### 10.3 `advertisedVersionViolation(root)` and the skip-loudly branches (O-16)

**Probe order — pinned, and it is the reverse of the branch listing in FSPEC §7.4.** The four inert
cases are probed cheapest-precondition-first, because each later probe presupposes the earlier ones:

```
(b) git absent from PATH        →  { skipped: S_GIT_ABSENT }
(c) root has no .git            →  { skipped: S_NO_GIT_DIR }
(d) HEAD does not resolve       →  { skipped: S_UNBORN_HEAD }     (git rev-parse --verify HEAD)
(a) `git -C root status --porcelain -- pdlc/workflows/dist/` is empty
                                →  { skipped: S_NOTHING_STAGED }
otherwise: compare plugin.json `version` at working tree vs at HEAD
     equal    → "red"
     differs  → "green"
```

Order matters and is asserted: running (a) first would shell out to `git status` on a tree with no
`.git`, whose output is empty, and the oracle would report the *nothing-to-advertise* skip on a
source tarball — the wrong reason, and one that reads as benign. Probing (d) before (a) is what
makes the "fixture root must have a commit" requirement (O-16) observable: without a commit, (d)
fires and the red case is unreachable, which is the accident O-16 names.

**The four printed strings, pinned verbatim** (`document-oracles.mjs` exports them so the test
imports rather than duplicates them):

| Const | String |
|---|---|
| `S_GIT_ABSENT` | `AC-6.6 not verified: git is not on PATH, so the working tree cannot be compared with HEAD. Unverified: a dist/ change under an unbumped plugin.json version would not be detected.` |
| `S_NO_GIT_DIR` | `AC-6.6 not verified: {root} is not a git work tree (no .git), so there is no HEAD to compare against. Unverified: same.` |
| `S_UNBORN_HEAD` | `AC-6.6 not verified: HEAD does not resolve (unborn branch — no commit yet), so plugin.json has no committed value to compare. Unverified: same.` |
| `S_NOTHING_STAGED` | `AC-6.6 inert: git status --porcelain reports no change under pdlc/workflows/dist/, so there is nothing to advertise. This is the ordinary case; no invariant is left unverified.` |

The first three name an unverified invariant; the fourth explicitly says none is left unverified,
because it is not a capability skip — it is the oracle's own green-by-vacuity case, and conflating
the two is what makes a skip line stop being read. Each of (b)/(c)/(d) is asserted by a dedicated
fixture: `makeToolDir` without `git` (AT-21), a `cp -R` of the fixture with `.git/` removed, and a
`git init` with no commit.

**The untracked-addition red fixture (O-16's positive case).** `fxRootUntrackedOnly`:

```
git init -b main; commit a plugin.json with version "0.11.0" and nothing else
then, WITHOUT adding:  write pdlc/workflows/dist/orchestrate-dev.bundle.js   (never git-added)
                       leave plugin.json version at "0.11.0"  (== HEAD's value)
expect: advertisedVersionViolation(fxRootUntrackedOnly) === "red"
```

This is the case `git diff HEAD` misses entirely (FSPEC §7.4), and it is the **landing commit's own
shape** — on that commit every file under `dist/` is untracked. Its counterpart, AT-28's `fxRoot2`,
is the identical tree with `version` bumped to `0.12.0` in the working tree, expected `"green"`. The
two fixtures differ in exactly one file's one field, which is what makes the pair a real
discrimination rather than two independent constructions.

`documentOracles.test.js` additionally asserts `advertisedVersionViolation(LIVE_ROOT)` is **not**
`"red"` — it is `"green"` on the landing commit (item 2 of §7.5 bumps the version) and
`{ skipped: S_NOTHING_STAGED }` on an ordinary later commit. Asserting "not red" rather than a
specific value keeps the suite green on both, while still failing the one state AC-6.6 forbids.

---

## 11. Backup filename grammar — TSPEC's contribution (O-18 hand-off)

O-18 is PROPERTIES'. TSPEC owes it **a surface those properties can be written against** — the
grammar is implemented in bash, and a property-based strategy cannot spawn a process per generated
case. This section states that surface and the retention binding; it states no property.

### 11.1 The parameterisable surface

Three functions in C1, named in §2.2's table, with the fixed-offset parse FSPEC §1.4 derives:

| Function | Contract |
|---|---|
| `pdlc_backup_format <id> <stamp> <nn>` | stdout = `{id}.{stamp}-{NN}.bak`; exit 1 if `nn > 99` or `id` fails M6 |
| `pdlc_backup_parse <name>` | stdout = `id TAB stamp TAB nn`; exit 1 if the **trailing 24 bytes** do not match `"." stamp(16) "-" NN(2) ".bak"` |
| `pdlc_prune_backups <dir> <knownIds…>` | keeps the 5 greatest per known id, removes the rest of those ids, identity elsewhere; **always exits 0** |

All three are in §2.2's surface table (corrected in v2.0 — TE F-07), and `pdlc_prune_backups`'
signature is `<dir> <knownIds…>` in both places.

`pdlc_backup_parse` is `id := ${name:0:${#name}-24}` plus a pattern match on the tail — one parse,
by construction, which is what makes O-18's injectivity property provable rather than merely
plausible. The parser is a **separate function from the formatter**, called by nothing in the
production path except `pdlc_prune_backups`; that is deliberate, because a round-trip property over
a formatter with no independent parser tests nothing.

### 11.2 The batched driver

```
__tests__/helpers/bin/backup-grammar.sh          # sources C1, no execute bit needed (run via bash)
  stdin :  one case per line —  format TAB id TAB stamp TAB nn
                             |  parse  TAB name
  stdout:  one result per line — ok TAB <fields…>  |  err TAB <reason>
```

**One spawn per property run, not per case.** A generated set of 500 ids costs one `spawnSync`; the
JS side writes the cases to `input` and zips the output lines back. Without this the O-18 properties
are ~500 process spawns each and the only automated surface this feature has (§1.1) gets slow enough
that a maintainer stops running it — the failure mode §1.1 consequence 2 names.

`runGrammar(cases)` is exported from `driftHarness.js` and asserts line-count equality between input
and output before zipping, so a driver that dies halfway produces a harness failure rather than a
silently truncated property run reporting green over 12 of 500 cases.

### 11.3 What TSPEC pins, so PROPERTIES does not have to invent it

| # | Pinned here | Because |
|---|---|---|
| 1 | the **id generator's charset is M6's**, exported as `M6_ID_REGEX` from `document-oracles.mjs` and shared by C1's validator and the generator | PROPERTIES' round-trip must range over the *same* charset the manifest validator accepts, including ids containing `.`, `-` and stamp-shaped substrings (`dev.20260101T000000Z`); a generator with its own charset proves a property about a set nothing else uses |
| 2 | the sort oracle is **`LC_ALL=C` on the child**, and C1's own `export LC_ALL=C` is asserted **separately** | §3.2 sets `LC_ALL=C` in the sandbox, which would mask the removal of C1's export. The separate assertion runs one sort fixture with `LC_ALL=en_US.UTF-8` injected via `opts.env` and asserts the ordering is **unchanged** — red against an implementation relying on the caller's locale |
| 3 | `listBackups(root)` (§3.4) returns entries **already parsed** by the same 24-byte rule | so a prune property compares parsed `(stamp, nn)` tuples rather than re-deriving them in the test, where a second parser would drift from the first |
| 4 | the retention binding: **newest 5 per id**, selection by descending filename sort, **never mtime** | §5.6. The falsifying fixture is stated in §13: five backups written in one second (`-01`…`-05`) plus a sixth, with **mtimes shuffled** by `utimesSync` after creation, asserting the pruned member is `-01` — red against any mtime-based selector, which is the one place an implementer reaches for `ls -t` |

Row 4 is the retention/prune **binding** O-18's clauses (a)–(d) are written against: TSPEC fixes
what "newest" means operationally (the §1.4 filename order), PROPERTIES quantifies over generated
directories.

---

## 12. Queue-side design — shape validator and the O-19(d) wrapper

All of §12 is in-process jest over `orchestrate-queue.js`'s exported pure functions (§2.4). No
filesystem, no bash, no bundle — these are the fastest tests in the feature and they carry the
mapping floor (§1.4), so they are the ones a maintainer runs most.

### 12.1 `validateDriftRecord` — one fixture per clause

`driftRecordShape.test.js` is table-driven over D1–D8. Each row starts from `VALID_RECORD` — a
frozen, shape-valid literal — and applies **exactly one** mutation. **One row, one mutation, one
`it()`** — restated as a rule in v2.0 because v1.0 broke it in three places (TE F-04):

| # | Clause | Mutation (exactly one) | Expected | O-19(b) shape |
|---|---|---|---|---|
| 1 | D1 | the read returned `null` | `"D1"` | — |
| 2 | D2 | ` "```json\n{…}\n```" ` | `"D2"` | **fenced** |
| 3 | D2 | `'{"schemaVersion":1,'` | `"D2"` | **truncated** |
| 4 | D2 | `JSON.stringify({ result: VALID_RECORD })` — the object is wrapped in an envelope, so the top level is an object but not *this* record | `"D2"` (top level is not the record) | **re-wrapped** |
| 5 | D3 | `schemaVersion: "1"` | `"D3"` | type-swapped |
| 6 | D4 | `baselineReason: "manifest-gone"` | `"D4"` | reworded |
| 7 | D4 | `delete baselineStatus` | `"D4"` | **key-dropped** — D4's *other* conjunct |
| 8 | D5 | `checkEnabled: "false"` | `"D5"` | type-swapped |
| 9 | D6 | `delete rows` | `"D6"` | key-dropped |
| 10 | D6 | `retiredPresent: "[]"` | `"D6"` | **array-replaced-by-scalar** |
| 11 | D6 | `writeFailures: {}` | `"D6"` | array-replaced-by-object |
| 12 | D7 | `rows[0].state: "in sync"` | `"D7"` | **state-value-reworded** |
| 13 | D7 | `retiredPresent[0].supersedingState: "fresh"` | `"D7"` | state-value-reworded, second site |
| 14 | D8 | `generatedBy: "queue"` | `"D8"` | reworded |
| 15 | D8 | `syncCommand: 42` | `"D8"` | type-swapped |
| 16 | — | `delete syncCommand` | **`ok: true`** | AT-36's clause, the one absence D8 tolerates |

**Row 4 needs an implementation note the validator must honour.** D2 as FSPEC §6.2 states it is
"parses as JSON and the top level is an **object**", which a `{ "result": {…} }` envelope satisfies.
It is D3 that then fails, because `schemaVersion` is absent at the top level. Either clause id is
defensible; **the row asserts `"D2"`** on the rule that a validator recognising a *known envelope
key* whose value is a shape-valid record must reject rather than unwrap — unwrapping is how a relay
mangling becomes invisible. The implementation therefore checks, as part of D2, that the parsed
object is not a single-key envelope around a shape-valid record. This is the one row in the table
that constrains the validator beyond FSPEC §6.2's literal text, and it is stated rather than
smuggled in: **it is a TSPEC-level test-design decision, not an FSPEC amendment**, and the FSPEC's
D2/D3 wording is unchanged.

**Three corrections in v2.0 (TE F-04).**

1. **All six of O-19(b)'s mandated relay shapes are now present.** v1.0 had fenced, truncated,
   key-dropped and reworded, and §16 nonetheless claimed "(b) is discharged in design by §12.1's
   table". **Re-wrapped** (row 4) and **array-replaced-by-scalar** (row 10) were missing —
   the latter being the single most plausible LLM-relay corruption of a JSON array.
2. **D6 and D4 are covered on all their conjuncts.** D6 requires **three** arrays present
   (`rows`, `retiredPresent`, `writeFailures`) and v1.0 mutated only `rows`, so a validator checking
   `rows` alone passed. D4 requires `baselineStatus` **and** `baselineReason` and v1.0 tested only
   the reason. Rows 7, 10 and 11 close both.
3. **The one-mutation rule is restored.** v1.0's D7 row applied two mutations (`rows[0].state` **and**
   `retiredPresent[0].supersedingState`) and its D8 row applied two (`generatedBy` **and**
   `syncCommand`). With two simultaneous mutations a validator implementing only half the clause
   still returns the right clause id and the sub-clause gap is invisible. Rows 12/13 and 14/15 are
   the split forms.

O-19(b) is therefore discharged by this table, and §16 records that rather than duplicating it. Each
row asserts the **clause id**, not merely `ok: false`: a validator that returns `D1` for everything
satisfies `ok: false` for all fifteen negative rows and would pass a coarser table while telling the
operator nothing.

`VALID_RECORD` is `Object.freeze`d and every row deep-clones it. A shared mutable literal across a
table-driven suite produces order-dependent passes, which is the failure this suite would be least
likely to notice — it has no filesystem to make the leak visible.

### 12.2 `mapDriftState` — ten rows, each defeating every higher row

The floor (§1.4) is **all 10 rows**, and each fixture must falsify the rows above it, or a mapping
with two rows transposed still passes:

| Row | Fixture (built from `VALID_RECORD`) | Defeats above by |
|---|---|---|
| 1 | `validateDriftRecord` returned `{ok:false}` | — |
| 2 | `checkEnabled: false`, **plus** non-empty `writeFailures` and `rows[0].state: "stale"` | carrying rows 3 and 6's conditions, so a mapping that puts row 2 lower reports `blocked` and fails |
| 3 | `writeFailures: [{path, operation:"artifact-copy"}]`, `checkEnabled: true`, `baselineReason: "drift-state-invalidated"` | `checkEnabled: true` defeats 2; AT-31(a) |
| 4 | `baselineStatus:"unresolved"`, `baselineReason:"manifest-empty"`, `writeFailures: []` | empty `writeFailures` defeats 3 |
| 5 | `resolved`, one row `unknown` **and** one row `stale` | the `stale` row would satisfy 6, so ordering 5 above 6 is asserted |
| 6 | `resolved`, one row `stale`, `retiredPresent` non-empty | the retired path would satisfy 7 |
| 7 | `resolved`, all rows `in-sync`, `retiredPresent` non-empty | AT-31(b) |
| 8 | `resolved`, one row `unverified`, one `local-edit`, `retiredPresent: []` | — |
| 9 | `resolved`, non-empty rows, all `in-sync`, both arrays empty | — |
| 10 | `resolved`, **`rows: []`**, everything else empty | shape-valid, matches no row 1–9 — FSPEC §6.2's terminal row |

Every case asserts `{ outcome, row }`. Row 10's fixture is the one FSPEC §6.2 argues about at
length (a green that verified nothing) and is unreachable through row 9 only because row 9 requires
non-empty `rows` — asserting the **row number** is what proves it landed at 10 rather than
accidentally at 9.

`report` is asserted structurally for rows 3, 4 and 7 (the ones AT-31 and AT-4 name): the Manifest /
Row / Run split is three arrays, and the assertion is that the reason appears in the **right** one —
a flat message list would let a Row-level reason print under Manifest and no test would see it.

### 12.3 The O-19(d) wrapper

FSPEC §6.1, read against source: `runtime-adapter.js`'s `rtReadFile` (lines 85–96) has **no
`try`/`catch`**, so a throwing agent turn **propagates**. The wrapper is this feature's own code:

```js
export async function readDriftStateSafely(readFileFn, path) {
  try { return await readFileFn(path); } catch { return null; }
}
```

`queueDriftGate.test.js` injects a `_readFile` triple and asserts all three land on **row 1
`blocked`** with the §6.3 report — never an abort, never a `proceed`:

| Injected `_readFile` | Models | Expected |
|---|---|---|
| `async () => { throw new Error("agent transport failed"); }` | the throwing agent turn — **the case that aborts today** | `{ outcome: "blocked", row: 1 }` |
| `async () => null` | file absent, or a non-string relay | `{ outcome: "blocked", row: 1 }` |
| `async () => 42` | a non-string that reached the module | `{ outcome: "blocked", row: 1 }` |

Three notes the implementation must carry, not the test:

1. **The wrapper is required, not decorative.** Without it the first row does not merely fail — the
   test throws out of `main` and jest reports an error rather than a verdict. The test is written to
   assert a **returned report**, so it is red in exactly that way until the wrapper exists.
2. **The pre-existing `await readFileFn(queuePath)` at `orchestrate-queue.js:523` is left
   unwrapped** (FSPEC §6.1). A test asserting the asymmetry is *not* added — that would pin another
   feature's behavior — but §17 records the asymmetry as a stated residual.
3. **`readDriftStateSafely` is `await`ed at the call site** and both bundles are rebuilt in the same
   commit (CLAUDE.md's runtime rule). `runtimeBundle.test.js`'s freshness assertion, repointed at
   `dist/` (§2.3), is what enforces the rebuild; the gate wiring itself is asserted by
   `pipelineWiring`-style structural tests over the module, not over the bundle.

### 12.4 Gate placement

One test asserts the gate runs **before** the queue's own `QUEUE.md` read: a `_readFile` double that
records call order is injected, the drift state is a blocked record, and the assertion is that
`readFileFn` was called **once**, with the drift-state path. FSPEC §6.1's one-read rule and §2.4's
"a blocked drift state costs no queue work" are the same claim, and this is its only observable.

---

## 13. Fixture inventory with construction recipes

Consolidated from §3–§12. Every fixture is either a **builder call** (constructed per test under
`tmpdir()`) or a **checked-in tree** (exactly one: `covered-violations`). "Guard" names the §7.3
capability the fixture needs; blank means it runs on every runner.

### 13.1 Consumer / plugin trees

| Fixture | Recipe | Guard | Used by |
|---|---|---|---|
| `freshConsumer` | `makeConsumerTree({ git: true, claudeDir: false })` + valid 2-row plugin tree | hash | AT-1, AT-24-adjacent |
| `syncedConsumer` | `freshConsumer` + every row `in-sync` + a matching sync manifest | hash | AT-9, AT-11, AT-18a/b, AT-32 |
| `staleRow` | `setRowState(…, "stale")` — consumer bytes X, entry `consumerHash = sha1(X)` | hash | AT-10, AT-26, AT-35, §6.4 |
| `localEditRow` | `setRowState(…, "local-edit")` — bytes Y, entry over X, X ≠ Y ≠ plugin | hash | AT-8a, AT-8b, AT-27 |
| `unverifiedRow` | consumer bytes ≠ plugin, **no** entry | hash | AT-7, AT-10 |
| `identicalRowNoManifest` | consumer bytes == plugin, `syncManifest: "absent"` | hash | AT-6 (O-8's equal-bytes rule) |
| `notManagedFile` | `files: { ".claude/workflows/scratch.js": "…" }`, no row, in no `retires` | hash | AT-25 |
| `retiredPresent` | `syncedConsumer` + `files: { ".claude/workflows/orchestrate-dev.js": "legacy" }` matching a row's `retires` | hash | AT-11, AT-12, AT-13 |
| `preManifestConsumer` | plugin tree with **no** `distribution-manifest.json`; `git: true`, `claudeDir: true` | — | AT-3, AT-4 |
| `emptyManifest` | plugin manifest with `rows: []`, `retired: []` | — | AT-33 |
| `optOutConsumer` | `staleRow` + `config: { distribution: { checkEnabled: false } }` | hash | AT-5, AT-14b |
| `nonBooleanConfig` | `config: { distribution: { checkEnabled: "false" } }` | — | AT-32(b) |
| `unlistableWorkflows` | `workflowsDir: { mode: 0o300 }` (`-wx`) — **P**, uid-0 skip | uid-nonroot | AT-32(a) |
| `unwritableParent` | `.claude/workflows/` `0500`, drift-state file `0600`, applied **last** — **P** | uid-nonroot | **AT-14b** |
| `preExistingDriftState` | `driftState:` a full valid record, written before the mode change | — | AT-14b, AT-15, AT-16 |
| `syncManifestUnreadable` / `…Malformed` / `…Absent` | `syncManifest: "unreadable" \| "malformed" \| "absent"` — the unreadable form has an **F** twin (`PDLC_FAULT=sync-manifest-read`) | (F twin: none) | **AT-34**, three runs |

### 13.2 Environment-shaped fixtures

| Fixture | Recipe | Used by |
|---|---|---|
| `jsonToolAbsent` | `makeToolDir` without `python3`/`python`/`python2`; no pre-existing drift state | **AT-14** |
| `hashToolAbsent` | `makeToolDir` without `shasum`/`sha1sum`/`openssl` | §1.4's row-reason floor, `hash-tool-absent` |
| `gitAbsent` | `makeToolDir` without `git` | AT-21, §8.2, §10.3 branch (b) |
| `nonGitWithClaude` / `nonGitNoClaude` / `gitTreeBrokenProbe` / `nonGitClaudeAtHome` | §8.2's table | AT-2, AT-33, §8 |
| `blockedTrace` | `PDLC_TRACE_FILE = <tmp>/blocker/trace.tsv` where `blocker` is a **regular file** (`ENOTDIR`, not a mode bit) | §4.4, both halves |

### 13.3 Fault compositions

| Name | `PDLC_FAULT` | Used by |
|---|---|---|
| `ladderRungI` | `drift-state-replace` | AT-14b's F twin, §5.3 |
| `ladderRungII` | `drift-state-replace,drift-state-invalidate` | **AT-15** |
| `ladderRungIII` | `drift-state-replace,drift-state-invalidate,drift-state-unlink` | **AT-16** |
| `freshRungIII` | `mkdir` | §6.5's no-pre-existing-record case |
| `truncatedCopy` | `artifact-copy-corrupt:<rowId>` | **AT-35**, §6.4 |
| `backupNotLanded` | `backup-corrupt:<rowId>` | **AT-27** |
| `copyAndDriftState` | `artifact-copy:<rowId>,drift-state-replace,drift-state-invalidate,drift-state-unlink` | **AT-17** (both failures in one run) |
| `removalOnly` | `artifact-copy-corrupt:A` (and, for the residual case, `+ sync-manifest-update`) | **§6.4** |
| `unrecognised` | `not-a-real-token` | **AT-18a/AT-18b** |

### 13.4 Root fixtures for the jest oracles

| Name | Recipe | Location | Used by |
|---|---|---|---|
| `covered-violations` | **checked in**, §10.1's 12-file table | `__tests__/fixtures/covered-violations/` | **AT-23** |
| `fxGreen` | `makePackagingFixture({})` — manifest computed from written bytes | tmp | §10.2's baseline |
| `fxRoot3` | `makePackagingFixture({ break: "sha1" })` | tmp | **AT-29** |
| `fxRoot3b/c/d` | `break: "retired" \| "pluginPath" \| "manifestLocation"` | tmp | §10.2 |
| `fxRootUntrackedOnly` | `git init` + one commit; untracked `dist/` file; `version` == HEAD's | tmp | **AT-20** |
| `fxRoot2` | identical, `version` bumped in the working tree | tmp | **AT-28** |
| `fxNoGitDir` | `fxRoot2` with `.git/` removed | tmp | §10.3 branch (c) |
| `fxUnbornHead` | `git init`, **no commit** | tmp | §10.3 branch (d) |
| `freshClone` | §9.1's five steps | tmp, `beforeAll` | **AT-24**, §9.3 |
| `LIVE_ROOT` | `resolve(__dirname, "../../..")`, `realpathSync`-normalised | the repo | AT-19, AT-22, §9.3's index-mode assertions |

### 13.5 Backup fixtures

| Name | Recipe | Used by |
|---|---|---|
| `sameSecondBackups` | six backups for one id, `-01`…`-06`, all one `stamp` | §11.3 row 4 |
| `shuffledMtimes` | `sameSecondBackups` + `utimesSync` randomising every mtime **after** creation | §11.3 row 4 — red against any mtime-based selector |
| `decoyBackupDir` | the above plus `README.txt`, `notabackup.bak`, and a well-formed backup for an **unknown** id | O-18 clause (c)'s identity requirement |
| `nnExhausted` | 99 backups for one id in one `stamp` | FSPEC §1.4's exhaustion ⇒ `operation: backup`, exit 4 |

### 13.6 Cleanup

Every builder returns `cleanup()`, registered in `afterEach`. Two rules: permission fixtures
`chmod` **back** before `rmSync` (§6.5), and `cleanup` is idempotent and never throws — a fixture
whose construction failed halfway must not mask the construction error with a teardown error.

---

## 14. AT → test case → file placement

FSPEC §12's acceptance tests, each mapped to a file, a named `it()`, and the §13 fixtures it
composes. **Every row is a real jest test case**; nothing here is discharged by review.

The standing precondition (FSPEC §12): every AT whose expected outcome names a row state other than
`unknown` requires a hash utility, and the file-level guard is `describeOrSkip("hash", …)` — a
runner without one **skips loudly** (§7.3), it does not silently produce `unknown` rows.

| AT | File | `it()` | Fixtures | Key assertions beyond the AT's Then |
|---|---|---|---|---|
| AT-1 | `driftClassify.test.js` | fresh consumer, `--check`, every row `missing` | `freshConsumer` | §4.3's oracle over the same run — classify precedes the `mkdir` that created the directory the record lands in |
| AT-2 | `driftRepoRoot.test.js` | non-git tree, no `.claude/`, reason `repo-root-unresolved` | `nonGitNoClaude` + valid non-empty manifest + JSON tool | `expectRepoRootUnresolved(reportedReason: "repo-root-unresolved")`; N-8 **absent** (§8.3 conjunct 5) |
| AT-3 | `driftBaseline.test.js` | pre-manifest consumer, hook warns `manifest-absent` | `preManifestConsumer` | repo root **resolves**, so the empty record is attributable to `manifest-absent` alone |
| AT-4 | `queueDriftGate.test.js` | queue blocks on AT-3's record at Manifest level | AT-3's record, read as a literal | the reason appears in `report.manifest`, not `report.row` |
| AT-5 | `driftHook.test.js` + `queueDriftGate.test.js` | opt-out: hook still warns, `--check` still 1, queue proceeds | `optOutConsumer` | three surfaces, one fixture; the queue half asserts `row: 2` |
| AT-6 | `driftClassify.test.js` | equal bytes are `in-sync` with **no** sync manifest | `identicalRowNoManifest` | O-8/R-4; red against a provenance-first ladder |
| AT-7 | `driftClassify.test.js` + `queueDriftGate.test.js` | `unverified` ⇒ `--check` 2, queue proceeds | `unverifiedRow` | the asymmetry asserted as **both** halves in one test file each |
| AT-8a | `driftSync.test.js` | plain sync does not overwrite `local-edit` | `localEditRow` | consumer bytes **byte-identical** before/after; W-4 matched by §7.2's matcher |
| AT-8b | `driftSync.test.js` | `--force` overwrites after a verified backup | `localEditRow` | `listBackups` newest for the id restores byte-identical pre-sync content — AC-3.5's non-false-greenable oracle |
| AT-9 | `driftSync.test.js` | sync twice, second is a no-op | `syncedConsumer` | sync manifest **byte-identical** including `syncedAtUtc`; no new backup; exit 0 |
| AT-10 | `driftSync.test.js` | mixed run exits 2 on post-run precedence | `staleRow` + `unverifiedRow` | `assertRecordedPassIs(trace, record, "post-run")` — O-14's worked case is a *post-run* claim |
| AT-11 | `driftHook.test.js` + `queueDriftGate.test.js` | retired present warns and blocks though all rows `in-sync` | `retiredPresent` | W-6 emitted **independently** of row states; queue `row: 7` |
| AT-12 | `driftSync.test.js` | retirement backs up (id = retired basename), verifies, deletes | `retiredPresent` | `assertPostCopyNarrow(trace, [rowId])` — the post-copy pass touched only the retiring row |
| AT-13 | `driftSync.test.js` | retirement skipped when R is `unknown` | `retiredPresent` + an `unknown` recipe (§7.1) | the retired path still exists; `retire-skipped` names R's state |
| AT-14 | `driftLadder.test.js` | T1 emitter writes a parseable record with no interpreter | `jsonToolAbsent` | §6.5's five assertions, incl. `mapDriftState` ⇒ `row: 4` |
| AT-14b | `driftLadder.test.js` | rung (i) preserves `checkEnabled: false` — **`itOrSkip("uid-nonroot", …)`** | `unwritableParent` + `preExistingDriftState` + `optOutConsumer`'s config | inode **unchanged**; `mapDriftState` ⇒ `row: 2`; a second `it()` for the sync-run form (§6.5) |
| AT-15 | `driftLadder.test.js` | rung (ii) lands: `unlink` + fresh write | `preExistingDriftState` + `ladderRungII` | inode **changed** (`inodeOf`, bigint); stderr names `drift-state-replace` and `drift-state-invalidate` and **not** `drift-state-unlink` |
| AT-16 | `driftLadder.test.js` | rung (iii) residual: N-3, `--check` 4, hook 0 | `preExistingDriftState` + `ladderRungIII` | the pre-existing record is **byte-unchanged**; run on every runner (fault form, §6.1 note 2) |
| AT-17 | `driftWriteFailure.test.js` | both-failed message, drift-state line **first** | `staleRow` + `copyAndDriftState` | line order asserted by index in `stderr`, not by presence |
| AT-18a | `driftFault.test.js` | unrecognised token, hook exits 0 | `syncedConsumer` + `unrecognised` | `countOf(stderr, "N-7") === 1`; byte-equivalence against the same fixture with the seam unset (§5.4) |
| AT-18b | `driftFault.test.js` | the identical fixture under `--check` exits **4** | same | the record is byte-identical to AT-18a's modulo `generatedAtUtc` |
| AT-19 | `documentOracles.test.js` | `packagingViolations(LIVE_ROOT)` is `[]` | `LIVE_ROOT` | the live-`dist/` write guard (§10.2) runs in the same file's `beforeAll`/`afterAll` |
| AT-20 | `documentOracles.test.js` | untracked-only `dist/` under an unbumped version is `"red"` | `fxRootUntrackedOnly` | the `??` case `git diff HEAD` misses |
| AT-21 | `documentOracles.test.js` | `git` absent ⇒ skips loudly with `S_GIT_ABSENT` | `gitAbsent` | the **returned** `{ skipped }` value is asserted, so the branch is a value, not a console side-effect |
| AT-22 | `documentOracles.test.js` | `coveredViolations(LIVE_ROOT)` is `[]` | `LIVE_ROOT` | separate `it()` from AT-23, no shared state (O-17) |
| AT-23 | `documentOracles.test.js` | fixture root returns exactly the 7 | `covered-violations` | the 7 paths **and** the frozen exemption list, asserted literally (§10.1) |
| AT-24 | `bootstrap.test.js` | fresh clone, two commands, green | `freshClone` | §9.2's six assertions; `mapDriftState` ⇒ `row: 9` |
| AT-25 | `driftClassify.test.js` | `not-managed` is reported and never touched | `notManagedFile` | bytes unchanged, absent from `rows`, listed `LC_ALL=C`-sorted |
| AT-26 | `driftSync.test.js` | **plain** sync backs up a `stale` row first | `staleRow` | restore of the newest backup is byte-identical to pre-sync; the `backup` trace record **precedes** the `copy` record for that row |
| AT-27 | `driftWriteFailure.test.js` | backup written but not landed ⇒ original untouched | `localEditRow` + `backupNotLanded`, `--force` | `expectFailOpen({ operation: "backup-verify" })`; consumer bytes byte-identical |
| AT-28 | `documentOracles.test.js` | bumped version over a dirty `dist/` is `"green"` | `fxRoot2` | differs from AT-20's fixture in exactly one field |
| AT-29 | `documentOracles.test.js` | a lying `pluginSha1` is `clause: "6.2(b)"` | `fxRoot3` | asserts `packagingViolations(LIVE_ROOT)` is still `[]` in the same test |
| AT-30 | `driftMessages.test.js` | `distinct()` pairwise over S1, S2, S3 | rendered catalogue | rendering goes through the **real** `pdlc_msg_*` functions via a batched driver (§11.2's pattern), not through JS copies of the strings |
| AT-31 | `queueDriftGate.test.js` | rows 3 and 7, both shape-valid, both `checkEnabled: true` | literal records | row 3 also names `drift-state-invalidated`; the `syncCommand: null` fallback describes the shipped script |
| AT-32 | `driftClassify.test.js` (a) / `driftHook.test.js` (b) | (a) unlistable dir ⇒ N-6, **no state changes** — `itOrSkip("uid-nonroot")`; (b) string `"false"` ⇒ N-5 once, `checkEnabled: true` | `unlistableWorkflows`; `nonBooleanConfig` | (a) compares the full `rows` array against the same fixture with a listable directory — the "identical" claim, not a spot check |
| AT-33 | `driftRepoRoot.test.js` | co-holding: reports `manifest-empty`, writes nothing | `nonGitNoClaude` + `emptyManifest` + JSON tool | `expectRepoRootUnresolved(reportedReason: "manifest-empty")` ⇒ N-8 **required**; run under `--check` (3) and hook (0) |
| AT-34 | `driftClassify.test.js` | unreadable / malformed / absent sync manifest | three fixtures, three runs | `unverified` + N-4 for the first two, **identical states and no N-4** for the third; consumer bytes differ from the plugin's in all three |
| AT-35 | `driftWriteFailure.test.js` | truncated copy ⇒ entry removed, row `unverified`, exit 4 | `staleRow` + `truncatedCopy` | both red directions: exit is 4 (not 1) **and** post-run state is `unverified` (not `local-edit`) |
| AT-36 | `queueDriftGate.test.js` | absent `syncCommand` still reaches the opt-out | literal record | `{ outcome: "proceed", row: 2 }`, not row 1 |

**Files and helpers, complete:**

| Path | Kind |
|---|---|
| `__tests__/driftBaseline.test.js`, `driftClassify.test.js`, `driftLadder.test.js`, `driftWriteFailure.test.js`, `driftSync.test.js`, `driftRepoRoot.test.js`, `driftOrdering.test.js`, `driftFault.test.js`, `driftMessages.test.js`, `driftHook.test.js`, `driftBackups.test.js` | bash-subject suites, all through `runScript` |
| `__tests__/queueDriftGate.test.js`, `driftRecordShape.test.js` | in-process, pure functions (§12) |
| `__tests__/documentOracles.test.js`, `bootstrap.test.js` | jest oracles (§10) and the bootstrap (§9) |
| `__tests__/helpers/driftHarness.js`, `driftCapabilities.js`, `driftOrdering.js`, `driftFixtures.js`, `freshClone.js`, `bin/backup-grammar.sh` | helpers — excluded from jest by the existing `testPathIgnorePatterns` (`package.json:16-20`) |
| `__tests__/fixtures/covered-violations/**` | the one checked-in fixture tree (§10.1) |
| `pdlc/workflows/lib/document-oracles.mjs` | production oracles (§2.1) |

## 15. Traceability

### 15.1 AC → AT → test case

Read with §14 for the fixture column. An AC with no AT row is one whose only enforcement is
structural (NFR-2, §13.1 of the FSPEC) or a release-checklist row (AC-6.2a), and is marked as such.

| REQ AC | AT | Test file |
|---|---|---|
| AC-0.1 (manifest is the sole authority; no globbing) | AT-25, and §4.3 conjunct (d) | `driftClassify`, `driftOrdering` |
| AC-0.2 (`retired` = union of `retires`) | §10.2's `break: "retired"` | `documentOracles` |
| AC-0.3 / AC-0.3a / AC-0.4 (`<pluginRoot>` resolution, maintainer marker, verbatim env) | AT-24 + §9.2's `plugin-root` trace assertion | `bootstrap` |
| AC-0.5 (repo root) | AT-2, AT-33, §8.2's five fixtures | `driftRepoRoot` |
| AC-0.6 (`not-managed`, enumeration failure) | AT-25, AT-32(a) | `driftClassify` |
| AC-0.7 (retired paths quarantined) | AT-11, AT-12, AT-13 | `driftHook`, `driftSync` |
| AC-1.0 (baseline first; empty is not green) | AT-33, §1.4's baseline-reason floor | `driftBaseline` |
| AC-1.1 / AC-1.2 (six states, four row reasons) | AT-6, AT-7, AT-8a, AT-34, §7.1's recipes | `driftClassify` |
| AC-1.3 (no mtime) | §2.5's `touch` test, §11.3 row 4 | `driftClassify`, `driftBackups` |
| AC-1.4 (rows independent) | AT-35, §6.3 conjuncts 4–5 | `driftWriteFailure` |
| AC-1.5 / NFR-3 (blast radius) | AT-25, M10 fixtures | `driftClassify`, `driftBaseline` |
| AC-1.6 / O-8 (degraded provenance) | AT-6, AT-34 | `driftClassify` |
| AC-1.7 (no entry ⇒ `unverified`) | AT-7, AT-35 | `driftClassify`, `driftWriteFailure` |
| AC-1.8 (total, single-valued, deterministic) | **PROPERTIES, O-9** — §16 | — |
| AC-2.1–2.5a, AC-2.8 (warnings, exhaustive) | AT-3, AT-5, AT-11, AT-30 | `driftHook`, `driftMessages` |
| AC-2.3 / AC-2.5 / AC-2.5a (textual distinctness) | **AT-30** | `driftMessages` |
| AC-2.4 (hook exits 0 always) | AT-3, AT-14, AT-16, AT-18a | every bash suite's hook variant |
| AC-2.6 (record schema) | AT-14, AT-14b, §12.1's `VALID_RECORD` | `driftLadder`, `driftRecordShape` |
| AC-2.6's measurement time | **PROPERTIES, O-20** — §16; §4.3's `assertRecordedPassIs` is the affordance | — |
| AC-2.7 (one writer routine; mid-session unblock) | AT-9, AT-10 | `driftSync` |
| AC-2.9(1) (classify before create) | **§4.3's four conjuncts**, asserted on AT-1, AT-14, AT-24 | `driftOrdering` + each |
| AC-2.9(2) (per-row write failure) | AT-27, AT-35, §6.3 | `driftWriteFailure` |
| AC-2.9(3) (the ladder) | AT-14b, AT-15, AT-16 | `driftLadder` |
| AC-2.9(4) (verified backup before destroy) | **AT-27**, AT-8b, AT-26 | `driftWriteFailure`, `driftSync` |
| AC-2.9(5) (unrecognised token) | AT-18a, AT-18b | `driftFault` |
| AC-3.1 / AC-3.2 (copy semantics, no fall-through) | AT-8a, AT-10, AT-26 | `driftSync` |
| AC-3.3 (exit codes) | §1.4's exit floor, spread over AT-1/7/10/16/33 | all |
| AC-3.4 / AC-3.5 (backups, restore oracle) | AT-8b, AT-26, §11 | `driftSync`, `driftBackups` |
| AC-3.6 / AC-3.7 / AC-3.8 (idempotence, round-trip, fresh consumer) | AT-9, AT-1, AT-24 | `driftSync`, `bootstrap` |
| AC-3.9 (retirement gate on post-copy `in-sync`) | AT-12, AT-13, `assertPostCopyNarrow` | `driftSync` |
| AC-4.1 (the mapping) | AT-4, AT-31, AT-36, §12.2's ten rows | `queueDriftGate` |
| AC-4.2 (blocked report, one command) | AT-31, §12.2's structural `report` assertion | `queueDriftGate` |
| AC-4.3 (`checkEnabled` scope) | AT-5, AT-14b, AT-32(b), AT-36 | `driftHook`, `driftLadder`, `queueDriftGate` |
| AC-5.1–5.4 (build, version semantics) | AT-19, AT-24, §2.3 | `documentOracles`, `bootstrap` |
| AC-6.1 (sole output directory) | AT-19, AT-24 | `documentOracles`, `bootstrap` |
| AC-6.2 / AC-6.3 | AT-19, AT-29; `runtimeBundle.test.js` repointed at `dist/` | `documentOracles`, existing suite |
| AC-6.2a | **release checklist** — no AT, by FSPEC §7.3 | — |
| AC-6.4 | AT-22, AT-23 | `documentOracles` |
| AC-6.5 | AT-24, §9.3's two mode-bit objects | `bootstrap` |
| AC-6.6 | AT-20, AT-21, AT-28, §10.3's four branches | `documentOracles` |
| NFR-1 (no judgement in an LLM turn) | §12.4's one-read assertion; §12.3's wrapper | `queueDriftGate` |
| NFR-2 | **structural, FSPEC §13.1** — no timing assertion exists anywhere in this suite | — |
| NFR-5 (bash, reuse the interpreter loop) | AT-14, §2.2 | `driftLadder` |
| NFR-6 (exactly two env seams) | §5.2's closed set + PROPERTIES' subset assertion (§16) | `driftFault` |

### 15.2 TSPEC section → FSPEC section

| TSPEC | FSPEC |
|---|---|
| §1 test surface, §3 harness | §12's standing precondition, §10 O-11 |
| §2 implementation architecture | §0.2, §1.1–1.4, §7.1, §6.1–6.2 |
| §4 trace | §4.2, §4.6, §10 O-1, O-7 |
| §5 fault seam | §4.6, §10 O-10 |
| §6 write failures | §4.4, §4.4a, §4.5, §4.7, §5.5, §10 O-10 |
| §7 probes and skips | §3.2, §10 O-11 |
| §8 repo root | §2.2, §2.8, §5.9, §8.3 N-8, §10 O-3 |
| §9 bootstrap | §7.5 item 4, §7.6, §10 O-12 |
| §10 jest oracles | §7.3, §7.4, §7.5, §10 O-16, O-17 |
| §11 backup grammar | §1.4, §5.6, §10 O-18 |
| §12 queue | §6.1, §6.2, §10 O-19 |
| §13, §14 | §12 |

---

## 16. Hand-off table — obligations leaving this document

Every obligation this TSPEC does **not** discharge, with its owner and what this document leaves it.
A reviewer checking completeness should find every FSPEC §10 row either in §0.2 (disposed here) or
below.

| # | Owner | Obligation | What this TSPEC hands over |
|---|---|---|---|
| **O-9** | PROPERTIES | Classifier totality / single-valuedness / determinism over states, row reasons and **both** declared precedences. Regenerate the axes; do **not** import v13's tables | The fixture vocabulary: §3.3's six-state recipe table (with `setRowState`'s self-check), §7.1's probe→recipe mapping, §13's inventory, and two **unconstructible** combinations the generator must exclude — `hash-tool-absent` on a row subset (§7.1) and a `stale` row whose bytes equal the plugin's (§3.3). §1.4's floors are the minimum the generated set must cover; they are asserted by meta-oracles, so a generator that under-covers turns them red rather than passing quietly |
| **O-18** | PROPERTIES | Backup-grammar round-trip, `LC_ALL=C` descending == reverse-chronological, and `prune`'s four clauses | §11.1's three C1 functions, §11.2's **batched** driver (one spawn per property run, not per case), `M6_ID_REGEX` shared with the manifest validator, `listBackups`'s pre-parsed entries, and §11.3 row 4's retention binding with the mtime-shuffled falsifier |
| **O-20** | PROPERTIES | AC-2.6's measurement-time reading: (a) a successful sync records **post-run** states and exits 0; (b) hook/`--check` coincide; (c) the run's decisions come from the **as-found** pass | §4.3's `assertRecordedPassIs(trace, record, phase)` and `assertPhaseOrder` — (a) and (b) are assertions over the record, (c) is only observable through the `as-found` trace label, which is why the grammar carries three phase labels rather than two |
| **O-19 (a)–(c)** | implementation phase (**Cross-Feature**) | (a) add no second agent-mediated read; (b) unit-test D1–D8 against mangled-relay fixtures; (c) record the seam's LLM mediation in `orchestrate-queue.js` | (b) is **discharged in design** by §12.1's table — fenced, truncated, key-dropped, type-swapped and re-worded rows are all present; the implementer writes that table, not a new one. (a) is asserted by §12.4's single-call test. (c) is a code comment with no test and is listed in §17 as such |
| **O-19 (d)** | this feature's implementation | Wrap the drift-state read so a throwing `_readFile` maps to row 1 `blocked` | §12.3: `readDriftStateSafely`, the three-way injection table, and the note that `rtReadFile` **propagates** today (`runtime-adapter.js:85–96` has no `try`/`catch`), so the wrapper is required for the test to return a report at all |
| **O-13** | `consolidate-learnings` | REQ-scope stopping rule → `docs/_constraints/DOMAIN-CONSTRAINTS.md`, which must be **created** | Not this document's; carried so it is not lost |
| **new** | PROPERTIES | **The emitted `PDLC_FAULT` token set is a subset of §5.2's fourteen.** FSPEC §10 O-10 requires it and it cannot be asserted example-wise | §5.2 is the closed list, exported from C1 as `PDLC_FAULT_TOKENS` so the property reads the implementation's own list rather than a copy; the property is `emitted ⊆ listed` over every fixture the suite runs |
| **new** | landing step (implementation) | The gitignore entries of FSPEC §7.5 item 1 must be **anchored** (`/.claude/workflows/`, `/pdlc/workflows/dist/`) | §10.1: an unanchored pattern silently swallows the checked-in `covered-violations` fixture's nested directories, turning AT-23 from `== 7` into `== 0` with no diff to explain it. `documentOracles.test.js` carries the tracked-ness guard that reports it correctly if it happens |
| **new** | implementation phase | Observe once whether a Claude-created worktree copies untracked `.claude/workflows/` content (FSPEC §11.1's stated obligation) | Unchanged; no test — it is a documentation-scope adjustment, recorded in §17 |

---

## 17. Risks and stated residuals

Each is stated with what it costs and what, if anything, would change the assessment. None is
mitigated by an assertion that it cannot happen.

| # | Residual | Assessment |
|---|---|---|
| R-1 | **Black-box bash.** A branch with no difference in exit code, stderr, trace, or on-disk artifact is untestable (§1.2's stated cost). | Accepted. The mitigation is that a new observable is a new trace `op` (§4.2), never a new production output — so closing a coverage hole never changes what an operator sees. The cost is that the trace vocabulary will grow, and each addition must extend §4.2's closed table. |
| R-2 | **Two genuine uid-0 holes: AT-14b and AT-32(a).** On a root runner, rung (i)'s permission asymmetry and the directory-read branch are unverified. | Accepted and **named** (§1.3, §6.2). Every other permission fixture has an F twin that runs everywhere. Changing this would need a fault token for the enumeration guard, which §5.2 argues against: a token per untestable branch makes the closure meaningless. |
| R-3 | **No CI (REQ §0 fact 10).** Every assertion in this document runs only when a maintainer runs `npm test`. | Accepted; it is the premise §1.1 is built on. The design consequence is already paid: no test needs root, a full disk, a special mount or a network, and the slowest fixture (§9's working-tree copy) is built once per describe. A slow suite is the failure mode, so §11.2's batching is not an optimisation but a requirement. |
| R-4 | **The fresh-clone fixture copies the working tree.** A test can therefore pass against uncommitted state that never lands. | Deliberate (§9.1 step 1) — testing `HEAD` would test the previous commit, which is what AC-6.3/AC-6.6 exist to catch. The complementary risk (a file that exists locally and is not tracked) is covered by §9.3's **index-mode** assertion over the live root and by §10.1's tracked-ness guard. |
| R-5 | **`covered-violations` is checked in and contains the five patterns verbatim**, protected only by exemption (iv). | Stated. Removing or narrowing exemption (iv) turns AT-22 red immediately — which is the correct, loud failure — but a reader might then "fix" it by moving the fixture. §10.1 records why it lives where it does. |
| R-6 | **The queue's `QUEUE.md` read stays unwrapped** while the drift-state read is wrapped (§12.3 note 2). | Deliberate: wrapping it is a behavior change to another feature's path (FSPEC §6.1). The asymmetry is a real inconsistency and is the follow-up O-19 already names. |
| R-7 | **O-19(c) — the seam-mediation comment — has no test.** | Accepted. A comment is not assertable without a lint nobody will maintain; it is a review item on the implementation diff. |
| R-8 | **`assertTreeUnchanged` hashes every regular file under a root.** On a fixture that accidentally includes `node_modules` this is slow enough to look like a hang. | Mitigated by construction: it is only ever called on `mkdtemp` fixture trees and on `LIVE_ROOT/pdlc/workflows/dist/`, never on `LIVE_ROOT` itself. Stated because the obvious next use — "snapshot the whole repo" — is the one that would be unusable. |
| R-9 | **Fault tokens 10 and 12 truncate to half length.** A source file of length ≤ 1 truncates to the empty string, which some implementations may treat as "no bytes written" rather than "wrong bytes written". | Bounded: every fixture's artifact bytes are ≥ 64 bytes by construction in `makePluginTree`. Recorded so a future minimal fixture does not silently weaken AT-35. |
| R-10 | **`sync-workflows.sh`'s optional `SKILL.md`** (FSPEC §5.4) is inside `coveredViolations`' scan if it ships in the landing commit. | Not a design risk, a wording constraint: AT-22 goes red if that document names `.claude/workflows/*.js` or describes copying the bundle. The rule stands unchanged — a false positive is fixed by rephrasing the document, never by narrowing a pattern. |
| R-11 | **The record's `generatedAtUtc` is normalised away in every byte-equivalence assertion** (§4.4, §5.4, AT-18b). | Stated. It means no test asserts anything about that field's format. It is human-report-only (FSPEC §6.2's "the queue never compares timestamps"), so nothing depends on it — but a malformed timestamp would go unnoticed until an operator read one. |
