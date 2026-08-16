# Cross-Review: product-manager — Final Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the implementation on `feat-pdlc-engine-distribution` (full diff against `main`), read against `REQ-pdlc-engine-distribution.md` §5 and `FSPEC-pdlc-engine-distribution.md` §8
**Date:** 2026-08-16
**Iteration:** 1
**Scope:** Local / Cross-Feature / Process tags per finding

## Method

Every claim below was checked against the running code, not against a document:

- Full diff enumerated (`git diff --name-only main...HEAD`, 170 files, 28 967 insertions).
- Both suites executed: `pdlc/engine` → `1..725`, all green; `pdlc/workflows` → 4 515 passed,
  1 failed (`documentOracles.test.js` AT-22, a known false red caused by the untracked
  `.claude/worktrees/` tree in this checkout — see Q-03, not a finding).
- `node pdlc/workflows/build-runtime.mjs --check` → 0; `pdlc/hooks/scripts/sync-workflows.sh
  --check` → 0, every manifest row `in-sync` (AC-6.1's literal transcription holds).
- No `test.skip` / `describe.skip` block survives in either suite (grepped for
  `^\s*(test|describe|it)\.skip\(` across `pdlc/engine/__tests__` and
  `pdlc/workflows/__tests__` — zero hits). The un-skip discipline was honoured.
- **Production-caller sweep** (the builder-not-wired obligation): every seam this feature adds
  was grepped for callers under `bin/`, `lib/` and `scripts/`, and the operator-visible
  surfaces were exercised by running the shipped CLI. Four criteria fail that sweep; they are
  F-01…F-04 and they are the substance of this review.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | `runVersionDoctor` (`pdlc/engine/bin/cli.mjs:561`) has **zero production callers**. `main()`'s switch (`bin/cli.mjs:666-690`) has no `--version` case, and the `doctor` case runs `cmdDoctor` (`:226-246`), which never calls it. Running the shipped CLI: `pdlc --version` prints `Unknown command: --version` and exits 1; `pdlc doctor` prints the startup banner and rungs and **no** `mode:` / `pin` / `store root:` / `installed:` / `install command:` lines — exactly the lines `runVersionDoctor` builds at `:622-631`. The whole DEC-EDIST-07 surface is exercised only by `__tests__/version-doctor.test.js`, which imports the builder and calls it directly (`:376`), never through `main()` | AC-1.4, AC-2.1 |
| F-02 | High | Local | The pin never **executes**, and an uninstalled pin never **refuses**. `execLauncher` (`bin/cli.mjs:545`) has zero production callers — its only exercisers are `__tests__/launcher.test.js:122-199`, all with an injected `spawnSyncFn`. `resolveVersion` (`lib/resolve-version.mjs:51`) has exactly one production caller, `runVersionDoctor`, which F-01 shows is itself uncalled. `cmdDev` (`:396`) and `cmdQueue` (`:441`) run the module in-process with no resolution hop at all, so a project pinned to X while Y is installed runs Y, and a pin naming an uninstalled version runs latest silently — the outcome AC-5.5 names as the defect | AC-5.1, AC-5.4, AC-5.5 |
| F-03 | High | Local | `PDLC_PLUGIN_ROOT` is ignored **silently**, which AC-5.6 forbids in both of its permitted branches. `resolvePluginRoot` builds the notice correctly (`lib/skills.mjs:237-242`) and `runStartupChecks` returns it (`lib/startup.mjs:369`, `:496`), but `bin/cli.mjs` never renders `startup.notices` — the only `notices` loop in the file (`:284`) prints `readEngineConfig`'s, a different array. Observed: `PDLC_PLUGIN_ROOT=/tmp/nope pdlc doctor` resolves the cache plugin and prints no notice whatsoever. Compounding it, the remedy both the notice and `handshake.mjs`'s `REMEDY` name — `--dev` — is not in the closed flag set (`bin/cli.mjs:113-126`): `pdlc dev … --dev` fails with `unknown flag "--dev"` | AC-5.6 |
| F-04 | High | Local | Provenance stamped into the consumer's committed artifacts **misreports the mode**. `provenanceFor` (`bin/cli.mjs:331-342`) hardcodes `mode: "dev"` and `pin: null` for every `pdlc dev` / `pdlc queue` run, so the POSTMORTEM block (`orchestrate-dev.js:7462`), the `QUEUE.md` `Engine` cell (`orchestrate-queue.js:1750`), every commit message (`:1865`, `orchestrate-dev.js:7869`) and the run report all read `Mode: dev (pin: n/a)` on a released, unpinned run. AC-5.3's guarantee survives only in one direction: a released run **is** mistakable for a dev one, and AC-5.1/AC-5.2's "the run announces the pin / says there is none" never appears. TSPEC §7.2's Build row requires these fields to come from the resolution, not from a literal | AC-5.1, AC-5.2, AC-5.3 |
| F-05 | Medium | Local | FSPEC:802 marks the whole AT-5 group **[fixture]**, but the fixture machine carries no AT-5 leg. `scripts/fixture-machine.mjs`'s `SKIP_INVENTORY` (`:141-158`) and its leg list (`:560-600`) name AT-1.1, AT-2.1, AT-2.3, AT-2.4, AT-2.5, AT-2.6 and nothing else. AT-5.1, AT-5.2, AT-5.4 and AT-5.5 are therefore observed only by unit tests over the pure ladder (`__tests__/resolve-version.test.js:108`) and by banner-composition tests over a **fake resolver** (`__tests__/startup-announce.test.js:122-152`) — which is precisely why F-01/F-02's unwired production path stayed green | AC-5.1, AC-5.2, AC-5.4, AC-5.5 |
| F-06 | Low | Local | Contradictory operator guidance in one shipped message: `bin/cli.mjs:243` tells a refused operator to "Override the plugin root with `--plugin-root <path>` or `PDLC_PLUGIN_ROOT=<path>`", while DEC-EDIST-04 (implemented at `lib/skills.mjs:231`) makes the env var inert unless dev-mode is declared. Following the printed advice does nothing and, per F-03, says nothing | AC-5.6 |
| F-07 | Low | Process | The PLAN's task ledger does not match the branch. `docs/…/PLAN-…md` is **uncommitted** in the working tree (T51 flipped ⬚→✅ but never committed), and T52 and T56 remain ⬚ although their evidence documents exist and their commits landed (`676fc190`, `72d48238`). A reader taking the committed PLAN as the completion record under-counts three finished tasks; a DoD verifier diffing the tree finds an unexplained dirty file | — |

### F-01 — the version surface the ACs describe does not exist as a command

AC-1.4 is stated as an operator action: *"when they ask the CLI for its version, then it
reports the engine version, the declared range, and the plugin version it finds."* The shipped
answer to that action is a usage error:

```
$ node pdlc/engine/bin/pdlc.mjs --version
Usage: …
Unknown command: --version        (exit 1)
```

`pdlc doctor` does report a triple (engine version, compat range, plugin version), so AC-1.4's
*content* is reachable — but not through the surface every downstream document names, and
without the `mode`/`pin` half that TSPEC §6.2 and DEC-EDIST-07 make the point of the exemption.
The fix is small and belongs in `main()`: route `--version` and `doctor` through
`runVersionDoctor`, which is already written, already tested, and already correct.

### F-02 — the pin resolves but never executes

DEC-EDIST-03 chose "a version store plus a resolving launcher"; DEC-EDIST-06 refined the hop to
a child process. Both halves exist as code and neither is on the path a pipeline command takes.
This is the classic never-wired shape the CR sweep exists to catch: `launcher.test.js` proves
`execLauncher` re-raises a numeric status verbatim and exits `128 + signum`, and no test drives
a `pdlc dev` invocation into it, because no production edge reaches it.

### F-04 — a mark that is always on cannot discriminate

AC-5.3 exists so that "a dev-mode run is never mistakable for a released one in the consumer's
history". With `mode` pinned to the literal `"dev"`, the mark is present on every kind — which
satisfies the set-equality oracle in `devModeKinds.test.js` while inverting the product
guarantee: released runs are now stamped `dev` in the consumer's committed history. The
oracle cannot see this because it asserts *presence of the mark on each kind*, never
*agreement between the mark and the resolved mode*. Whatever the resolution ladder ends up
returning once F-02 is wired, `provenanceFor` must read `decision.kind` and `decision.version`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-EDIST-05 is **P1, Phase 2**. Was the pin/dev-mode *execution* half (F-01, F-02) consciously scheduled out of this feature's Phase-1 landing? I could find no such deferral: the REQ carries no `[Phase 2, not in this landing]` note on AC-5.1/5.4/5.5, DECISIONS records the mechanism as decided rather than deferred, and the PLAN has T46 shipping "the resolution entry" as `[green]`. If the deferral is real, it belongs in the REQ and the DoD as a stated narrowing, the way T51/T56's one-time-observation limits are stated. If it is not, F-01/F-02 are the work. |
| Q-02 | AC-4.4's anti-echo half is carried by a dated manual observation (`EVIDENCE-AT-4.4.md`) whose own §1 states it has no regression guard. Given F-04 — a hardcoded field in the very same constructed value — is the operator comfortable that `mode`/`pin` have *neither* an automated agreement oracle nor a manual observation, while `engineVersion`/`pluginVersion` have the manual one? |
| Q-03 | `pdlc/workflows` is red locally on `documentOracles.test.js` AT-22 because this checkout carries an untracked `.claude/worktrees/agent-…/docs/completed/…` tree, which the oracle walks (it skips only `.git/` and `node_modules/`). CI is green and this is a known false red, so it is not a finding — but the same tree is what PLAN T18's row already had to defend `docs-uniqueness` against. Worth one shared exclusion rather than two per-oracle defences? |

## Positive Observations

- **The packed-set oracle is exactly the shape AC-1.3 asks for and the shape that is hard to
  fake.** `packaging.test.js:194-203` asserts set-equality in both directions over a **real
  `npm pack`**, transcribes the expected members from TSPEC §5.4 rather than deriving them from
  the tree (`:40-107`), and pins the count against the transcription, never the tarball's own
  length (`:291-296`). An added file fails and a removed module fails, as written.
- **`commit-sites.test.js` ships its own falsifier.** A standing guard that is green on day one
  proves nothing; this one re-runs the identical scanner over a fixture carrying a sixth commit
  site and asserts the equality *fails* (`:29-36`). That is the discipline the REQ's
  "absence-only oracles" prohibition is really asking for, applied without being asked.
- **`publish.yml` honours C-5 the expensive way, and says why.** It duplicates the five gate
  job bodies rather than calling a reusable workflow, because a `uses:` call would silently
  re-render the check names Phase PUB polls literally (`.github/workflows/publish.yml:23-31`),
  and the duplication is held in step by a command set-equality against `pr-tests.yml`
  (`ci-arrangement.test.js:442-450`) instead of by memory. `pr-tests.yml` is untouched.
- **The three `[manual]` observations are honest documents.** Each names its date, commit, node
  version and — the part that matters — its own limit: `EVIDENCE-AT-6.2.md` states that the
  (1)+(2) conjunction discriminates only on a machine whose channels are known out of band, and
  `EVIDENCE-AT-4.4.md` states that it is a one-time observation with no regression guard. That
  is the opposite of a green tick, and it is what makes them usable evidence.
- **AC-6.1 holds literally.** Both documented bootstrap commands run clean at HEAD and
  `sync-workflows.sh --check` reports every row `in-sync`; the bundle channel is undisturbed
  (C-4), and the `_provenance` seam defaults to `NO_PROVENANCE` so a runtime supplying nothing
  writes byte-identical artifacts (`lib/provenance.mjs:88-103`).
- **No skipped test survived the wave.** Every committed `test.skip` block was un-skipped by its
  owning task — the failure mode this repo's own LEARNINGS flag as recurring did not recur here.

## Recommendation

**Needs revision** (four High findings).

Phase 1's P0 spine is in good shape: the package, the packed-set oracle, the tag-driven gated
publish with a real recorded release, the provenance carrier into POSTMORTEMs, `QUEUE.md` and
commit messages, and the untouched plugin path all hold up under inspection. What does not hold
is REQ-EDIST-05's operator surface, and one field of the provenance value it feeds.

Exactly what to change, in the order I would do it:

1. **Wire `runVersionDoctor` into `main()`** — add a `--version` case and route `doctor`
   through it, replacing `cmdDoctor`'s hand-rolled banner print. Add one process-level test that
   drives `main(["node","cli","--version"])` and asserts the triple, so the builder can never
   again be green while unreachable (F-01).
2. **Wire the resolution hop into `cmdDev` / `cmdQueue`** — resolve, then `execLauncher` into
   the resolved version (or run in-process when it *is* the resolved one), and refuse on
   branches 3–5 instead of proceeding. One end-to-end leg per branch: pinned-and-installed
   executes X, pinned-and-missing refuses naming the pin and what is installed (F-02).
3. **Render `startup.notices`** in `formatStartup`, and add `--dev` to `FLAGS_BY_COMMAND` for
   `dev`, `queue` and `doctor`, threading it to `resolvePluginRoot`'s `devDeclared`. Add a leg
   asserting that a run with `PDLC_PLUGIN_ROOT` set and no `--dev` *emits the ignore notice*
   (positive), not merely that it resolved elsewhere (F-03).
4. **Derive `mode` and `pin` in `provenanceFor` from the resolution decision**, and extend
   `devModeKinds`' oracle from "the mark is present on each kind" to "the stamped mode equals
   the resolved mode", so a released run stamped `dev` reddens (F-04).
5. **Give AT-5.1/5.2/5.4/5.5 the fixture legs FSPEC already declares**, with
   `SKIP_INVENTORY` entries naming those AT ids (F-05). Then fix F-06's message and commit the
   PLAN ledger (F-07).

Steps 1–4 are the gate; 5–7 can ride the same revision.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 1, "low": 2}
