# DECISIONS — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | _none yet_ |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-08-17 | Initial: DEC-01…DEC-09 extracted from TSPEC v0.10, re-verified at `2017c6f9`. |

## Context

The feature is a deletion sweep: retire the pdlc **plugin** distribution channel (bundled workflow runtime, consumer sync, drift hook) now that `pdlc/engine` (`@kaneho/pdlc-engine`) is the shipped execution host. TSPEC v0.10 fixed the architecture; this document records the load-bearing choices made inside that architecture, the alternatives priced against actual repository state, and the conditions under which each should be revisited.

Verification base for every code claim below: commit `2017c6f9` on `feat-pdlc-plugin-retirement`. Where TSPEC cited a base of `2cd0d6b1`, the claim was re-verified at `2017c6f9` and is restated here only if it still holds.

Standing constraints that shape most decisions:

- **REQ NG-5 — engine runtime behaviour is out of scope.** The sweep may edit `pdlc/engine/**` only inside two named carve-outs. Anything that would change what a published engine *does* is successor work, not sweep work.
- **REQ C-6 / FSPEC §3.0 — pinned literals are re-measured, never loosened.** Counts and set-equalities in the specs are exact; a decision that makes one unmeasurable is rejected on that ground alone.
- **BR-SWEEP-3 — class boundaries are commit boundaries.** A decision that forces two classes into one commit costs blast radius, and is priced as such.
- **DC-01 / `MERGE_GUARD_DEFAULTS` — the pipeline refuses to merge its own self-modifications.** The frozen array at `pdlc/workflows/orchestrate-dev.js` (`export const MERGE_GUARD_DEFAULTS = Object.freeze([`) still holds `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — four members, none of them `pdlc/engine/`.

Project-level context read before authoring: `docs/_decisions/DECISIONS-plugin-distribution.md` (the promoted decision this feature retires one half of), `docs/_decisions/DECISIONS-review-severity-bars.md` (DEC-DOC-01 citation form, DEC-ERR-01 erratum handling), `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-08 cite-and-reuse). No decision below contradicts a promoted decision; DEC-01 and DEC-08 narrow `DECISIONS-plugin-distribution.md` rather than reverse it, and say so in place.

## Options Considered

Each entry names the choice, the alternatives priced against `2017c6f9`, and the reason each was rejected. The chosen option and its consequences are restated in **Decision** and **Consequences**.

### DEC-01 — Home of the surviving probe CLI

**Context.** After the sweep, `pdlc/workflows/dist/` holds exactly one tracked entry. Today it holds five: `pdlc-cli.mjs`, `distribution-manifest.json`, and three `*.bundle.js` files (`git ls-files pdlc/workflows/dist/`). AC-1.1 accepts either a surviving `dist/` whose tracked set equals `{pdlc-cli.mjs}` **or** a relocation.

- **A — leave the CLI at `pdlc/workflows/dist/pdlc-cli.mjs`** (chosen).
- **B — relocate to `pdlc/workflows/bin/pdlc-cli.mjs`.** Rejected. It buys nothing a criterion measures: `pdlc/workflows/dist/` is deliberately *not* an AC-1.2 search term, so no retired-term grep improves. It costs a moved build target (`OUT_DIR = resolve(HERE, "dist")`, `build-runtime.mjs:32`), a `.gitignore` review, and — the deciding cost — it trades AC-1.1's *measured set-equality* branch for a fresh TSPEC-named literal that no existing test asserts. Under C-6 that is a strictly weaker oracle.
- **C — retire `dist/` entirely and hand-maintain the CLI.** Rejected: it contradicts AC-5.3 ("still produced by a build step rather than maintained by hand") and would strand `.claude/pdlc.config.example.json`'s post-wave regeneration step (see DEC-08).

### DEC-02 — Reduce `build-runtime.mjs` rather than delete it

**Context.** `build-runtime.mjs` is 831 lines and emits four artifacts: three bundles (`bundles`, `:694`) plus the hand-written-source CLI (`cliArtifact`, `:532`, built from `CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"]`, `:530`) and a manifest (`manifestRows`, `:773`).

- **A — reduce it to a single-row emitter** (chosen): `bundles` keeps one row (`{ id: "pdlc-cli", file: "pdlc-cli.mjs", contents: cliArtifact }`), the bundling machinery (`*_META`, `*_ENTRY`, import-rewriting, `RETIRES_BY_ID`, manifest write) goes, and `--check` keeps its exact shape — one `in-sync`/`wrote` line in the success path, `STALE …` + exit 1 otherwise.
- **B — delete the builder and check in `pdlc-cli.mjs` by hand.** Rejected: AC-5.3 goes red by construction, and the file's two inputs (`orchestrate-dev.js`, `cli.mjs`) both remain live, so the artifact would silently drift on the first later wave that touches either.
- **C — keep the builder untouched, deleting only the three bundle rows' *outputs*.** Rejected: dead emitters left in a file that a class-7 commit is already rewriting invite the next implementer to re-grow them, and the manifest would keep advertising retired ids.

### DEC-03 — `MERGE_GUARD_DEFAULTS` is not edited by the sweep

**Context.** The frozen guard array (`pdlc/workflows/orchestrate-dev.js:48`) still lists `.claude/workflows/` — a directory the sweep retires — and does **not** list `pdlc/engine/`, where the surviving execution host lives (verified at `2017c6f9`).

- **A — leave the array exactly as shipped** (chosen).
- **B — drop the stale `.claude/workflows/` member.** Rejected on cost and scope: `orchestrate-dev.js` is vendored verbatim into the published engine (`MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs:20`), so editing the default set changes what a published engine refuses to merge — REQ NG-5 territory. The stale member is inert, not harmful: it is not an L-2 retired term, so AT-1.2 stays green, and a prefix that matches no post-sweep diff denies nothing.
- **C — add `pdlc/engine/` while we are here.** Rejected for the same NG-5 reason, and it is the more consequential of the two edits: it would start refusing merges that succeed today. Routed to successor work (SUCC-1) rather than smuggled into a deletion sweep.

### DEC-04 — Consumer cleanup is an operator-invoked, all-or-nothing script

**Context.** REQ G-4/C-9 want consumers' `.claude/workflows/` removable; REQ NG-6 forbids doing it from a hook.

- **A — `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, operator-invoked, name-only classification against a frozen expected-name set, deleting all-or-nothing: exit `0` (nothing to do / removed), `3` (unexpected entry — nothing deleted), `4` (usage or runtime failure)** (chosen). NG-6 is discharged *structurally* — the script has no entry in `pdlc/hooks/hooks.json` — rather than by a runtime self-check.
- **B — register it as a `SessionStart` hook.** Rejected: directly violates NG-6, and it would delete consumer files on session open with no operator intent.
- **C — content-hash classification (delete only byte-identical copies).** Rejected as more code for a weaker guarantee: the sweep must also remove entries the consumer *modified* only by refusing to touch them, and a hash check makes AT-4.3's "an expected entry left on disk is still byte-identical" untestable by reading the implementation. Name-only classification (BR-CLN-3a, C-9) keeps that property inspectable.
- **D — best-effort partial deletion.** Rejected: partial removal leaves a consumer in a state neither AC-4.x nor the operator can describe. All-or-nothing means the classification pass completes over the whole directory before any unlink.

### DEC-05 — Delegator skills are rewritten thin, not deleted

**Context.** `pdlc/skills/orchestrate-dev/SKILL.md` (97 lines) and `pdlc/skills/orchestrate-queue/SKILL.md` (250 lines) carry pipeline logic that now lives in the engine (`pdlc/engine/lib/run.mjs`).

- **A — rewrite both as thin delegators** (chosen): unchanged frontmatter `name`/`description`, a statement that the pass runs in the engine, the invocation contract, a relay rule and a refusal rule.
- **B — delete both skill directories.** Rejected: Ptah resolves agents by filesystem `skill_path` into `pdlc/skills/<name>/SKILL.md`, and the engine's own catalogue treats these ids as real (`OPERATOR_ONLY_SKILLS`, `pdlc/engine/lib/startup.mjs:52`). Deletion breaks both consumers and violates REQ C-4.
- **C — leave the skill bodies as-is and let them go stale.** Rejected: the bodies would keep instructing a runtime that no longer exists (the queue's drift-gate section is the clearest case), which is exactly the "ships a skill that cannot run" failure REQ NG-1/NG-3 exist to prevent.

### DEC-06 — `runtime-adapter.js` is left untouched by the sweep

**Context.** `pdlc/workflows/runtime-adapter.js` (1,209 lines, 56,713 bytes) loses its only *code* consumer when the bundle rows go: the sole import site is `build-runtime.mjs:97` (`readFileSync(resolve(HERE, "runtime-adapter.js"), "utf8")`), fed to `QUEUE_SOURCES`/`DEV_SOURCES`/`CONS_SOURCES` (`:690`–`:692`). The engine did not port it — `pdlc/engine/lib/adapter.mjs:8` says so in as many words — and `prepack.mjs`'s `MODULE_NAMES` does not vendor it.

- **A — leave the module and its tests (`__tests__/adapterProbe.test.js`, 306 lines; `__tests__/helpers/adapterHarness.js`, 203 lines) in place, and route the orphan upstream as erratum 2** (chosen).
- **B — delete it in the sweep.** Rejected on two grounds, both verified rather than assumed. (i) *Unspecified deletion.* No FSPEC row owns it; deleting a 56 KB module that no upstream disposition names is the exact set-equality failure mode C-6 exists to prevent, and it would make the class-7 commit's inventory diverge from BR-SWEEP-5's. (ii) *Live citations survive it.* Four surviving modules cite the file by name in load-bearing explanatory comments — `orchestrate-dev.js:6743`, `orchestrate-queue.js:1259` and `:2259`, `consolidate-learnings.js:316`, plus `pdlc/engine/lib/adapter.mjs:15`/`:335`/`:521` — so deletion dangles documentation inside the engine carve-out the sweep is not allowed to rewrite.
- **C — move it under `pdlc/engine/`.** Rejected: that is a port, not a sweep, and lands inside REQ NG-5.

### DEC-07 — `hookCompatibility.test.js` is reduced, not deleted

**Context.** FSPEC M-8's deletion set is stated to be 21 `*.test.js` modules; `pdlc/workflows/__tests__/hookCompatibility.test.js` (371 lines) is listed among them, but only its `C7` block depends on the retired drift hook.

- **A — reduce the module in place, keeping the `PROP-COMPAT-*` assertions outside `C7`** (chosen), and raise the membership/count mismatch as erratum 6 rather than resolving it here.
- **B — delete the whole module as M-8 literally says.** Rejected: it discards passing property assertions about hook compatibility that have nothing to do with the drift hook, to satisfy a count that C-6 requires us to re-measure anyway.
- **C — delete it now, re-add the surviving assertions in a later commit.** Rejected: a delete-then-restore pair inside one sweep is churn that no criterion rewards, and it leaves the suite transiently thinner than any pinned literal describes.

### DEC-08 — The post-wave build gate keeps its two config-example values

**Context.** `.claude/pdlc.config.example.json` carries `"postWaveCommand": "node pdlc/workflows/build-runtime.mjs"` and `"postWavePathspecs": ["pdlc/workflows/dist/"]` (verified verbatim at `2017c6f9`).

- **A — leave both values unchanged; edit only the surrounding prose that names retired bundles** (chosen).
- **B — retire both values as part of the distribution sweep.** Rejected because the mechanism they drive survives DEC-01 and DEC-02: `dist/pdlc-cli.mjs` stays tracked, and its two inputs (`CLI_SOURCES`, `build-runtime.mjs:530`) are files later waves routinely edit. Dropping the post-wave regeneration would degrade AC-5.3's "produced by a build step" into hand-maintenance the first time a wave touches `orchestrate-dev.js` or `cli.mjs`.
- **C — narrow `postWavePathspecs` to the single file.** Rejected as churn with no oracle behind it; the directory pathspec is already exactly the surviving artifact's parent after DEC-01.

### DEC-09 — Post-sweep plugin version is a patch bump to `0.23.2`

**Context.** `pdlc/.claude-plugin/plugin.json` declares `"version": "0.23.1"`; the engine declares `"pdlcPluginCompat": "^0.23.0"` (`pdlc/engine/package.json:18`) and refuses to dispatch against an out-of-range plugin (`pdlc/engine/lib/handshake.mjs`, "installed pdlc plugin version … is incompatible").

- **A — bump to `0.23.2`** (chosen): stays inside the engine's declared window, so no engine change is needed to keep an installed pair working.
- **B — bump the minor/major (`0.24.0` / `1.0.0`) to signal the retirement.** Rejected: `^0.23.0` does not admit `0.24.0`, so the bump alone would break the handshake and force an engine edit — REQ NG-5 again — turning a documentation-grade signal into a runtime-compatibility change.
- **C — leave the version untouched.** Rejected: BR-VER-1 requires the sweep's user-visible surface change to be versioned, and an unchanged version makes installed-copy diagnosis ambiguous.

## Decision

## Consequences
