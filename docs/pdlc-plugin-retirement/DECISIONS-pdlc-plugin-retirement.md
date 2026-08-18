# DECISIONS — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-product-manager-DECISIONS-v1.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`, `CROSS-REVIEW-product-manager-DECISIONS-v2.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, `CROSS-REVIEW-product-manager-DECISIONS-v3.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v3.md` |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-08-17 | Initial: DEC-01…DEC-09 extracted from TSPEC v0.10, re-verified at `2017c6f9`. |
| 0.2 | 2026-08-17 | Iteration-1 cross-review response (PM F-01…F-07, TE F-01…F-08): new DEC-10 (`consolidate-learnings` host blocks classes 7/11 on erratum 3); rules 1–2 restated (runtime-behaviour carve-out, transcribe-don't-re-measure) and rule 4 added; owning-oracle column added to the Decision table; DEC-03/DEC-08/DEC-09 given named oracles; DEC-07 given a blocking clause; DEC-04 records `--dry-run` and the 4a/4b split; DEC-02 count corrected to five; DEC-06 citation arithmetic and test-line scope corrected. Re-verified at `2017c6f9`. |
| 0.3 | 2026-08-18 | Iteration-2 cross-review response (PM F-01…F-03, TE F-01…F-04): DEC-10's gate restated as its transitive closure — classes 7, 8, 9, 10, 11 of FSPEC §3.1's **thirteen** (six gated counting DEC-07's class 6); DEC-01/DEC-02/DEC-09 oracle cells marked gated and DEC-10's cell now names PLAN's batch-DAG check as owner; DEC-09's oracle restated on `satisfiesRange(...).ok` with a `0.24.0` negative arm; new cross-cutting rule 5 (additive-and-conservative may ship ahead of criterion, subtractive may not); DEC-06's nine-citation count scoped, surviving-suite references noted. Re-verified at `1053b7fd`. |
| 0.4 | 2026-08-18 | Iteration-3 cross-review response (PM F-01…F-03, TE F-01…F-04): DEC-10's closure extended to class 12 (FSPEC `:164`, "Last of the deletion classes") — erratum 3 holds classes **7–12**, seven of thirteen gated counting DEC-07's class 6; Consequences row, gated-merge partition (class 13 named ungated) and the PLAN/PROPERTIES obligation restated at 7–12; "Four" → "Five cross-cutting rules"; FSPEC ordering cells quoted verbatim; DEC-09's negative-arm sentence un-spliced; DEC-06 anchors corrected (`consolidationBuild.test.js:95`, builder comment `:668`); M-8 host claim cited by FSPEC L-5 rather than a bare line anchor (DEC-DOC-01). Re-verified at HEAD. |
| 0.5 | 2026-08-18 | Iteration-6 upstream-cascade re-review response (PM F-01/F-02, TE F-01/F-02/F-03/F-05; trigger 2a fired at REQ v0.14/v0.15 but was not yet acted on): DEC-10 rewritten in place — Option C (accept the capability loss, bind to successor `pdlc-consolidation-rehost`) is now chosen per REQ O-8, superseding Option A's discharged block; its Price paragraph, Decision-table row and Consequences-table row restate the class-7/class-11 relationship as a same-commit ordering edge (REQ C-7 / TSPEC T-5), not a block on an undecided question, and cite `RLH-SKILL-10` as the new owning oracle; the stale FSPEC class-10 quote is replaced with current wording. DEC-01/DEC-02's owning-oracle cells and the gated-merge/"Downstream obligations" prose are corrected to name the current transitive gate (class 6 / erratum 6, DEC-07) instead of "DEC-10's erratum-3 gate," and the DEC-01 cell plus the gated-merge paragraph drop "red" in favor of "unsatisfied, not yet assertable" (inherited v5 F-01/this round's F-05). TE Lows F-04 (DEC-08 ratification framing), F-06 (no-registration transcription) and F-07 (delta-confirmation process gap) are acknowledged but deferred — their cells are not otherwise touched this round. Re-verified at HEAD. |

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

**Context.** `build-runtime.mjs` is 831 lines and emits **five** artifacts — one per tracked entry under `dist/` (DEC-01): three bundles (`bundles`, `:694`), the hand-written-source CLI (`cliArtifact`, `:532`, built from `CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"]`, `:530`), and the manifest (`manifestRows`, `:773`). Five emitters, five tracked entries, one surviving: the arithmetic is stated once here and reused in **Consequences** so no reader has to reconcile two counts (REQ C-6).

- **A — reduce it to a single-row emitter** (chosen): `bundles` keeps one row (`{ id: "pdlc-cli", file: "pdlc-cli.mjs", contents: cliArtifact }`), the bundling machinery (`*_META`, `*_ENTRY`, import-rewriting, `RETIRES_BY_ID`, manifest write) goes, and `--check` keeps its exact shape — one `in-sync`/`wrote` line in the success path, `STALE …` + exit 1 otherwise.
- **B — delete the builder and check in `pdlc-cli.mjs` by hand.** Rejected: AC-5.3 goes red by construction, and the file's two inputs (`orchestrate-dev.js`, `cli.mjs`) both remain live, so the artifact would silently drift on the first later wave that touches either.
- **C — keep the builder untouched, deleting only the three bundle rows' *outputs*.** Rejected: dead emitters left in a file that a class-7 commit is already rewriting invite the next implementer to re-grow them, and the manifest would keep advertising retired ids.

### DEC-03 — `MERGE_GUARD_DEFAULTS` is not edited by the sweep

**Context.** The frozen guard array (`pdlc/workflows/orchestrate-dev.js:48`) still lists `.claude/workflows/` — a directory the sweep retires — and does **not** list `pdlc/engine/`, where the surviving execution host lives (verified at `2017c6f9`).

- **A — leave the array exactly as shipped** (chosen). The choice is enforced, not merely stated: `pdlc/workflows/__tests__/consolidationRoute.test.js`'s `routeOf reads the IMPORTED constant` test asserts `new Set(MERGE_GUARD_DEFAULTS)` **set-equals** the four literal members `{pdlc/workflows/, pdlc/skills/, pdlc/hooks/, .claude/workflows/}`, and that module is outside M-8's deletion set, so it survives the sweep — dropping or adding a member reds it. Two nearby assertions look like the oracle and are not: `mergeGuard.test.js`'s `assertDefaultsUntouched` compares the array against `MERGE_GUARD_DEFAULTS_SNAPSHOT`, a `JSON.parse(JSON.stringify(...))` copy of the array itself, and `effectiveGuardPaths(undefined)` is asserted `toEqual([...MERGE_GUARD_DEFAULTS])` — both echoes that move with the source; `mergeConfig.test.js` asserts only frozen / non-empty / trailing-slash. Recorded so the next reader does not re-derive the gap and add a redundant assertion (DC-08).
- **B — drop the stale `.claude/workflows/` member.** Rejected on cost and scope: `orchestrate-dev.js` is vendored verbatim into the published engine (`MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs:20`), so editing the default set changes what a published engine refuses to merge — REQ NG-5 territory. The stale member is inert, not harmful: it is not an L-2 retired term, so AT-1.2 stays green, and a prefix that matches no post-sweep diff denies nothing.
- **C — add `pdlc/engine/` while we are here.** Rejected for the same NG-5 reason, and it is the more consequential of the two edits: it would start refusing merges that succeed today. Routed to successor work (SUCC-1) rather than smuggled into a deletion sweep.

### DEC-04 — Consumer cleanup is an operator-invoked, all-or-nothing script

**Context.** REQ G-4/C-9 want consumers' `.claude/workflows/` removable; REQ NG-6 forbids doing it from a hook.

- **A — `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, operator-invoked, name-only classification against a frozen expected-name set, deleting all-or-nothing** (chosen). The recorded shape is TSPEC §3.2's contract in full, because the operator-facing surface is part of what is being decided, not an implementation detail:
  - exit `0` — nothing to do (target absent or empty), or every entry removed;
  - exit `3` — any entry outside the expected set: **nothing removed at all**, one stderr line per unexpected entry;
  - exit `4` — split in two, because only one half is assertable as "removes nothing": **4a** argument-parse error (unknown flag or second positional; parsing completes before any filesystem access, so nothing is touched) and **4b** runtime failure (unreadable target, or an `rm` that fails partway; whatever was already removed stays removed and the partial state is reported);
  - **`--dry-run` ships.** It prints the lines rows 1–3 would print and removes nothing, exiting `0` (rows 1–2) or `3` (row 3). This is the product justification G-4 asks for — an operator previews a destructive step before consenting to it, which is what "refuses to do anything the operator did not expect" means for a delete tool — and it is recorded here rather than left to TSPEC §3.2 alone. Product ownership of the flag and of the 4a/4b pair is still owed upstream (TSPEC §6.1 erratum 7 asks for an AC-4.5); this decision is that the sweep ships them and the criterion follows, not that the flag waits for the criterion.

  NG-6 is discharged *structurally* — the script is never registered as a hook — and the property that keeps that true after the sweep is **AC-1.7's post-sweep hook-entry set-equality** against the pre-sweep listing minus exactly the drift reporter, together with TSPEC §5.2's TT-3 mode-bit enumeration over the five surviving executable scripts. An added `hooks.json` entry for this script fails AC-1.7 by set-equality; inspection of today's tree proves nothing, since the script does not exist yet.
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

- **A — leave the module in place and route the orphan upstream as erratum 2** (chosen). Scope note, corrected here: `__tests__/adapterProbe.test.js` (306 lines) and `__tests__/helpers/adapterHarness.js` (203 lines) are **not** `runtime-adapter.js`'s coverage and are not part of this decision's price. Their subject is the probe transport of `pdlc-cli.mjs` — the module header states it in as many words ("the `pdlc-cli.mjs` probe transport (`rtCliQuery`) and the three seams built on it") — and `pdlc-cli.mjs` is exactly the artifact DEC-01 keeps. Those 509 lines stay because their subject survives, for reasons that have nothing to do with the orphan. What DEC-06 actually prices is the 1,209-line, 56,713-byte module itself, with no in-repo executor until erratum 2 lands a disposition.
- **B — delete it in the sweep.** Rejected on two grounds, both verified rather than assumed. (i) *Unspecified deletion.* No FSPEC row owns it; deleting a 56 KB module that no upstream disposition names is the exact set-equality failure mode C-6 exists to prevent, and it would make the class-7 commit's inventory diverge from BR-SWEEP-5's. (ii) *Live citations survive it.* **Four surviving modules — three under `pdlc/workflows/`, plus the engine's adapter — cite the file by name** in load-bearing explanatory comments: `orchestrate-dev.js:6743`; `orchestrate-queue.js:1259` and `:2259`; `consolidate-learnings.js:316` and `:1331` (the latter citing `runtime-adapter.js:915` / `:929-931` for `rtListFiles`'s reply validator); and `pdlc/engine/lib/adapter.mjs:8`, `:15`, `:335`, `:521`. Nine such cite sites across four modules, re-measured at `2017c6f9`. The nine count **load-bearing prose citations in modules that survive unchanged** — it is not the whole live-reference set. Two other reference kinds exist and are excluded deliberately: the builder's own reads (`build-runtime.mjs:17`, `:97`, and the three `*_SOURCES` arrays at `:690`–`:692`, and the load-bearing comment at `:668`), which DEC-02's reduction removes anyway, and surviving suites that assert on the module's *source text* as data — `consolidationBuild.test.js:88`, `:95`, `:136`, `:141` read it via `readWorkflowSource("runtime-adapter.js")` to assert on `rtWriteFile`'s prompt **and** `rtConsInjections`'s key set (two surviving `T12` describes, four assertion sites: `:88`/`:95` over the prompt, `:136`/`:141` over the injection keys). The second kind strengthens the rejection of option B rather than weakening it: deleting the file reds a surviving suite, not merely a comment. Deletion dangles documentation inside the engine carve-out the sweep is not allowed to rewrite.
- **C — move it under `pdlc/engine/`.** Rejected: that is a port, not a sweep, and lands inside REQ NG-5.

### DEC-07 — `hookCompatibility.test.js` is reduced, not deleted

**Context.** FSPEC M-8's deletion set is stated to be 21 `*.test.js` modules; `pdlc/workflows/__tests__/hookCompatibility.test.js` (371 lines) is listed among them, but only its `C7` block depends on the retired drift hook.

- **A — reduce the module in place, keeping the `PROP-COMPAT-*` assertions outside `C7`** (chosen), and raise the membership/count mismatch as erratum 6 rather than resolving it here. **Blocking clause — exactly one suite-size literal is assertable at any moment.** FSPEC L-5 pins the post-sweep `pdlc/workflows/__tests__/*.test.js` count at **97** (119 − 22, on the premise that `hookCompatibility` is deleted); TSPEC §6.1 erratum 6 corrects it to **99** (the module survives, and `runtimeProvenanceWiring`'s and the module's dispositions move with it). Therefore: **class 6 does not land until erratum 6 has landed upstream.** Until it does, the assertable literal is L-5's 97 and an in-place reduction reds AC-1.3 — correctly, because the tree and the spec disagree. After it lands, the assertable literal is 99. Decision rule 2 does not resolve this and must not be read as licence to re-measure the tree and assert whatever it contains; the whole point of the clause is that no moment exists where a green suite proves nothing. This blocking edge is the same one TSPEC §6.4 T-6 flags, restated here as a PLAN ordering constraint.
- **B — delete the whole module as M-8 literally says.** Rejected: it discards passing property assertions about hook compatibility that have nothing to do with the drift hook, to satisfy a count that C-6 requires us to re-measure anyway.
- **C — delete it now, re-add the surviving assertions in a later commit.** Rejected: a delete-then-restore pair inside one sweep is churn that no criterion rewards, and it leaves the suite transiently thinner than any pinned literal describes.

### DEC-08 — The post-wave build gate keeps its two config-example values

**Context.** `.claude/pdlc.config.example.json` carries `"postWaveCommand": "node pdlc/workflows/build-runtime.mjs"` and `"postWavePathspecs": ["pdlc/workflows/dist/"]` (verified verbatim at `2017c6f9`).

- **A — leave both values unchanged; edit only the surrounding prose that names retired bundles** (chosen). This is not a sweep-local reversal of FSPEC class 10: FSPEC line 162 lists the two **values** among class 10's retired surface, and **TSPEC §6.1 erratum 5 already routes that correction upstream** ("the wave-gate config values do not retire with `dist/` … if M-11h's per-file disposition assumed both values retire, it should be corrected to 'prose only'"). DEC-08 records the choice erratum 5 asks upstream to ratify; class 10 is scoped accordingly and the erratum is carried as a re-evaluation trigger below, so the item is not left without a named successor surface (DC-08). **Oracle shape.** The surviving assertion is `consolidationPreflight.test.js`'s `expect(postWavePathspecs).toContain("pdlc/workflows/dist/")` — containment over what is contractually a one-element array, so it stays green if a second, wrong pathspec is added. Class 10's edit should tighten it to **set-equality** over the array (`toEqual(["pdlc/workflows/dist/"])`), keeping `postWaveCommand`'s existing `toBe` equality as-is. C-6's rule is set-equality, not containment, and this is the one place in the config surface where the shipped assertion is weaker than the rule.
- **B — retire both values as part of the distribution sweep.** Rejected because the mechanism they drive survives DEC-01 and DEC-02: `dist/pdlc-cli.mjs` stays tracked, and its two inputs (`CLI_SOURCES`, `build-runtime.mjs:530`) are files later waves routinely edit. Dropping the post-wave regeneration would degrade AC-5.3's "produced by a build step" into hand-maintenance the first time a wave touches `orchestrate-dev.js` or `cli.mjs`.
- **C — narrow `postWavePathspecs` to the single file.** Rejected as churn with no oracle behind it; the directory pathspec is already exactly the surviving artifact's parent after DEC-01.

### DEC-09 — Post-sweep plugin version is a patch bump to `0.23.2`

**Context.** `pdlc/.claude-plugin/plugin.json` declares `"version": "0.23.1"`; the engine declares `"pdlcPluginCompat": "^0.23.0"` (`pdlc/engine/package.json:18`) and refuses to dispatch against an out-of-range plugin (`pdlc/engine/lib/handshake.mjs`, "installed pdlc plugin version … is incompatible").

- **A — bump to `0.23.2`** (chosen): stays inside the engine's declared window, so no engine change is needed to keep an installed pair working. **Positive oracle required.** The only mechanical version check in the tree, `advertisedVersionViolation()` (`pdlc/workflows/lib/document-oracles.mjs`), cannot witness this: it compares the working tree against HEAD and returns `{ skipped: S_NOTHING_STAGED }` when `git status --porcelain -- pdlc/workflows/dist/` is clean, so it verifies nothing on the commit that lands the bump; and FSPEC class 9 (M-11g) puts that very check inside the sweep's own edit set, making the sweep its own witness. Class 9 therefore adds a **surviving positive assertion**: `pdlc/.claude-plugin/plugin.json`'s `version` equals the literal `0.23.2` **and** `satisfiesRange(version, pdlcPluginCompat).ok === true` — the shipped function returns `{ ok, reason }`, never a bare boolean (`pdlc/engine/lib/handshake.mjs:93`; accept path yields `{ ok: true, reason: null }`, reject path `{ ok: false, reason }`), so the assertion names the `ok` field. A **negative arm ships with it**: `satisfiesRange("0.24.0", pdlcPluginCompat).ok === false` with a non-null `reason`, `0.24.0` being outside the caret window `^0.23.0` computes (`handshake.mjs`'s upper bound for a `0.minor.patch` base is `{0, minor+1, 0}`). Without the negative arm a truthy-shaped check passes on any object the function could return, including `{ ok: false }` — an assertion that cannot fail is not an oracle. Both arms call the shipped `satisfiesRange` (`pdlc/engine/lib/handshake.mjs:93`) against `pdlc/engine/package.json`'s declared range rather than transcribing the comparison, so the range semantics are exercised and not restated. The literal alone is a dead-config assertion; the `satisfiesRange` call is what exercises the range semantics BR-VER-1's user-visible signal depends on, so a bump that silently leaves the handshake window reds instead of shipping (DC-03).
- **B — bump the minor/major (`0.24.0` / `1.0.0`) to signal the retirement.** Rejected — and the reason is **cost, not scope**. The caret arithmetic is real: `^0.23.0` (`pdlc/engine/package.json:18`) does not admit `0.24.0`, so a minor bump leaves the installed engine's declared window and `handshake.mjs` refuses every run until the engine's declaration is widened. But widening that declaration is **explicitly carved into scope** by REQ NG-5 ("the engine's declared compatible-plugin range (BL-07)"), so calling option B an NG-5 violation would be wrong and would teach downstream readers that the compat range is untouchable — mis-shaping PLAN's handling of BL-07, which is exactly the prerequisite that gates the sweep on a published engine whose window admits the shipped plugin version. The honest price of B is operator cost and release latency: a widened `pdlcPluginCompat`, a **new engine release cut and published**, and BL-07 re-gated against that release before the first deletion commit merges — for a signal that is documentation-grade. Option A buys the same diagnosability for a one-line version change inside an already-published window. A still wins; it wins on price.
- **C — leave the version untouched.** Rejected: BR-VER-1 requires the sweep's user-visible surface change to be versioned, and an unchanged version makes installed-copy diagnosis ambiguous.

### DEC-10 — `consolidate-learnings`'s execution host: capability loss accepted, bound to successor `pdlc-consolidation-rehost`

**Context.** The sweep removes exactly one user-visible capability, and it is not one of the two
delegator skills DEC-05 prices. `pdlc/skills/consolidate-learnings/SKILL.md` names its host in as
many words — "The pass is performed in code by `pdlc/workflows/consolidate-learnings.js` (shipped as
`pdlc/workflows/dist/consolidate-learnings.bundle.js`)" — and class 7 deletes that bundle (M-10).
Nothing replaces it. The module survives but cannot run as plain Node: it needs the agent-backed
seams `rtConsInjections()` supplies. The engine does not host it either — its command surface is
`dev` / `queue` / `doctor`, and `consolidate-learnings` sits in `OPERATOR_ONLY_SKILLS`
(`pdlc/engine/lib/startup.mjs:52`) as a skill *no workflow module dispatches*. Meanwhile the
`nudge-consolidation` SessionStart hook survives by AC-1.7 and O-1, so post-sweep the pipeline
keeps telling humans to run a pass whose unattended form has no host. FSPEC class 11 (M-11n, as
corrected at REQ v0.14) now instructs a **two-part** edit: the bundle reference is
**deleted, not rewritten** (no host survives to name), and the delegation-contract prose naming the
module the bundle shipped is restated so that after the sweep no sentence of the file names a host
that no longer loads. Erratum 3's disposition — REQ O-8, bound to successor
`pdlc-consolidation-rehost` at v0.14/v0.15 — settles *what* the capability loss is; this decision
records the ordering choice that follows from it.

- **A — block: classes 7 and 11 do not land until erratum 3 has an upstream disposition**
  (the original decision, since discharged). TSPEC §6.1 erratum 3 raised the gap and §6.4 T-5
  marked it blocking; this was the recorded choice, with a price, while the disposition was still
  open. **Erratum 3 has since landed a disposition — REQ O-8, bound v0.14/v0.15 — so the block
  itself is discharged; per this document's own re-evaluation trigger 2a, that supersedes Option A
  as the chosen option.**
- **B — rewrite `SKILL.md` to instruct an interactive, hand-run pass.** Rejected, unchanged by the
  disposition: the skill's own body states that performing the pass by hand bypasses the machinery
  the skill exists to drive (the `.consolidation-log.md` boundary, deterministic `failure-mode-id`
  derivation, NFR-4 duplicate suppression). Substituting a human ritual for a deterministic pass is
  a **product** decision about what the capability is, priced against US-04 and NG-3 — REQ O-8 did
  not choose this shape; it chose the accepted-loss-bound-to-successor shape below.
- **C — accept the capability loss explicitly, ship, and bind the machinery-backed pass to a named
  successor** (chosen — this is what REQ O-8 decided). What Option C's original rejection priced as
  missing — "no REQ criterion authorises removing a capability" — is exactly what REQ O-8 supplies:
  the product side decided the loss is acceptable (recorded operator direction of 2026-08-08,
  NG-5's carve-out), so the REQ edit that makes C available has landed. Its shape: the unattended,
  machinery-backed pass is retired; the in-session, human-performed pass continues under
  `SKILL.md`'s rewritten delegation prose; the machinery-backed pass is bound to
  `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md` (`docs/_queue/QUEUE.md`
  Order 24), which carries `ready: false` so the operator's veto stays mechanically enforced
  through the queue's draft-pickup gate, both raised before the first deletion commit. The
  surviving `nudge-consolidation` hook keeps advertising the pass — that is priced below, not
  silent, because the in-session pass remains real (rule 4).

**What C actually costs, and what it does not.** Unlike Option A, C imposes no block on an external
decision: classes 7 and 11 are free to land once their own ordering obligation is satisfied, and
that obligation is narrower than the discharged block looked. REQ C-7, per TSPEC T-5, requires
class 7 (bundle deletion) and class 11 (both halves of the skill rewrite) to land in the
**same commit**, so `consolidate-learnings/SKILL.md` never sits on a branch naming a host that no
longer loads; held together this way it is an incomplete feature on an unmerged branch, never a
registered expected failure, not a C-7 red. That same-commit pairing is the one ordering edge this
decision owns. The wider hold on classes 8 through 12 that the old Price-of-A paragraph priced
against this decision does not come from DEC-10 at all: class 7's own ordering obligation now
reads "After class 6, so no surviving test asserts over a deleted bundle" (FSPEC §3.1 class 7), and
FSPEC's held-classes note (§3.1) says explicitly that classes 7–12 "stay blocked **transitively**
behind class 6's own hold until erratum 6 is disposed, because class 7 lands after class 6 and
classes 8–12 chain off class 7." That is DEC-07's gate (class 6, erratum 6), priced there, not
here. DEC-02's owning oracle and DEC-01's `dist/` set-equality (AC-1.1) both still ride class 7, so
they remain gated in effect — but by DEC-07's transitive hold, not by this decision, which is
resolved.

## Decision

The retirement lands as a **reduction, not an evacuation**: `pdlc/workflows/` keeps exactly the
artifacts that a live execution host still reads, everything whose only consumer was the retired
plugin runtime goes, and `pdlc/engine/**` is not edited at all (REQ NG-5). Each row below is the
option selected in **Options Considered**; the alternatives and their rejection reasons stay there
and are not restated.

| Decision | Chosen option | Net effect on the tree | Owning oracle |
|---|---|---|---|
| DEC-01 | A — leave the CLI at `pdlc/workflows/dist/pdlc-cli.mjs` | `git ls-files pdlc/workflows/dist/` goes from five entries to one; `OUT_DIR` in `build-runtime.mjs` needs no retarget | AC-1.1's `dist/` set-equality branch (AT-1.1) — **gated**: it cannot go green before class 7 lands; class 7 is itself held transitively by class 6's erratum-6 gate (DEC-07), not by DEC-10 (resolved — FSPEC §3.1 held-classes note). The state in between is **unsatisfied, not yet assertable**, not a C-7 red |
| DEC-02 | A — reduce `build-runtime.mjs` to a single-row builder | `bundles` keeps one row (`pdlc-cli`); bundling machinery, `RETIRES_BY_ID` and the manifest write go; `--check` keeps its shipped output shape | AC-5.3, plus `consolidationBuild.test.js`'s T32 `--check` assertion (surviving) — **gated**: the reduction rides class 7, itself held transitively by class 6's erratum-6 gate (DEC-07), not by DEC-10 |
| DEC-03 | A — leave `MERGE_GUARD_DEFAULTS` exactly as shipped | No edit to `pdlc/workflows/orchestrate-dev.js`'s frozen four-member array, so the vendored engine copy stays byte-identical | `consolidationRoute.test.js` — `routeOf reads the IMPORTED constant` set-equals the four literal members (surviving) |
| DEC-04 | A — operator-invoked, name-only, all-or-nothing cleanup script, `--dry-run` included | New `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, never registered in `pdlc/hooks/hooks.json` — kept unregistered by AC-1.7's hook-entry set-equality, not by inspection | AC-4.1…AC-4.4 with TSPEC §5.2's `consumerCleanup.test.js` (TT-1/TT-2); NG-6 by AC-1.7's set-equality; TSPEC §5.2's TT-1 (row 4a) and TT-2 (`--dry-run`) own those arms, and **TT-1b owns row 4b's exit status only** — its partial-`rm` arm is deliberately oracle-free (not deterministically constructible without faking the removal primitive), so that arm is contract text, not an assertion; **no criterion yet** owns `--dry-run` or the 4a/4b split (erratum 7), which rule 5 permits because both are additive and conservative |
| DEC-05 | A — rewrite the two delegator SKILL.md files thin | `orchestrate-dev/SKILL.md` and `orchestrate-queue/SKILL.md` survive with unchanged frontmatter; Ptah `skill_path` and the engine's `OPERATOR_ONLY_SKILLS` catalogue keep resolving | `skillFiles.test.js`'s `RLH-SKILL-08`/`RLH-SKILL-09` and `orchestrateDevSkill.test.js` (both surviving) |
| DEC-06 | A — leave `runtime-adapter.js` untouched | The orphan is routed upstream as erratum 2 rather than deleted inside the sweep; `adapterProbe.test.js` and `adapterHarness.js` survive on `pdlc-cli.mjs`'s account, not the adapter's | **None yet** — by construction: an unspecified module has no disposition to assert until erratum 2 lands one |
| DEC-07 | A — reduce `hookCompatibility.test.js` in place | The `C7` block goes, `PROP-COMPAT-*` assertions stay; FSPEC M-8's count is corrected by erratum 6 | AC-1.3's suite-size literal — **97 until erratum 6 lands, 99 after**; class 6 blocks on it |
| DEC-08 | A — leave both `.claude/pdlc.config.example.json` values as-is | Post-wave regeneration of `dist/` keeps working; only the surrounding prose naming retired bundles is edited | `consolidationPreflight.test.js`'s two config assertions, tightened by class 10 from containment to set-equality over `postWavePathspecs` |
| DEC-09 | A — patch-bump the plugin to `0.23.2` | `pdlc/.claude-plugin/plugin.json` moves `0.23.1` → `0.23.2`, inside the engine's `^0.23.0` window, so `handshake.mjs` needs no change | **None yet** — class 9 must add the `version == 0.23.2` + `satisfiesRange(...).ok === true` assertion **with its `0.24.0` negative arm** (DEC-09 A); `advertisedVersionViolation()` skips on this commit |
| DEC-10 | C — accept the capability loss, ship, bind the machinery-backed pass to successor `pdlc-consolidation-rehost` | The unattended, machinery-backed pass is retired; the in-session, human-performed pass continues under rewritten delegation prose; the bundle reference is deleted, not rewritten; the machinery-backed pass is bound to queue Order 24, `ready: false` | `RLH-SKILL-10` (`skillFiles.test.js`, TSPEC §5.2) owns the two-part `SKILL.md` edit (bundle deleted + delegation prose restated); PLAN's batch-DAG check owns the class-7/class-11 same-commit ordering edge — a `Deps` edge, not a runtime assertion |

Five cross-cutting rules follow from the set and bind implementation:

1. **What is forbidden is a change to engine *runtime behaviour* — not every write under
   `pdlc/engine/`.** NG-5 carves two exceptions explicitly **into** scope, and the sweep must take
   them or it leaves a required check red on the commit that deletes their subject, which REQ C-7
   forbids: (a) the engine's declared compatible-plugin range (BL-07), and (b) the engine-side
   tests and fixture trees whose subject is a retired artifact — `pdlc/engine/__tests__/smoke.test.js`'s
   drift-gate expectations, `fs-observation.test.js`, and the `__tests__/fixtures/consumer-ac12/`
   tree (M-11c, M-11d, M-11e, M-11m; FSPEC class 2). Editing those changes no engine behaviour.
   What no task may do is alter what a published engine *does*: DEC-03's guard-array edits and
   DEC-06 option C's port are rejected on that ground, and DEC-09 option B is rejected on cost, not
   on this rule (see DEC-09). Stated as "no writes under `pdlc/engine/`", this rule would forbid
   work the sweep is required to do.
2. **Implementation asserts the spec's literal; re-measurement is erratum evidence, never an
   oracle's input.** Every expected value in an AT is a literal transcribed from the owning
   upstream document — never a value the test derives from the tree it is testing, which greens by
   construction and would pass a sweep that deleted one file too many. When a transcribed literal
   disagrees with the tree, **implementation halts and raises an erratum** against the owning
   document; the re-measurement is the evidence attached to that erratum, and it reaches the
   assertion only after the upstream edit lands. DEC-07 is the worked example: the tree says 99,
   FSPEC L-5 says 97, so class 6 waits for erratum 6 rather than asserting whatever it counts.
   REQ C-6's "re-measured, never loosened" governs *how a spec's literal is corrected*, not how a
   test obtains its expected value — the two halves are not interchangeable, and PROPERTIES owns
   this rule in the transcription direction only.
3. **Retirement is observable, not silent.** DEC-04's script reports its classification and DEC-09's
   version bump makes an installed copy diagnosable; nothing in this set removes a consumer-visible
   artifact without a signal the consumer can read.
4. **A capability is never removed by a landing order.** Where the sweep would delete the only host
   of a live capability (DEC-10), the classes that do so block on an upstream disposition. Silence
   plus a merge is not a decision to drop a capability; only REQ can make that decision.

5. **Additive-and-conservative surfaces may ship ahead of their criterion; subtractive ones may not.**
   Rules 3 and 4 pull in opposite directions on the same page, and the distinguishing principle is
   stated here so PLAN does not have to guess which precedent applies to the next unowned surface.
   DEC-04 ships `--dry-run` and the 4a/4b exit split while REQ still owes AC-4.5 (TSPEC §6.1
   erratum 7); DEC-07 and DEC-10 hold classes 6 and 7–12 until FSPEC and REQ answer. The difference is
   direction of effect, not appetite for risk: an **additive** surface whose asserted behaviour is
   "removes nothing" cannot make any existing criterion false, so the criterion can follow the code and
   only ratifies a shape that is already safe. A **subtractive** change removes a capability or an
   artifact other criteria rest on; once it lands there is no criterion left to fall back on, and the
   only cheap moment to decide was before the merge. So: additive **and** conservative (the
   conservative half matters — an additive surface that deleted on default would be gated) may ship
   ahead of its criterion, with the gap routed as an erratum; subtractive may not.

## Consequences

**What gets easier.** After the sweep `pdlc/workflows/` has one tracked build output instead of
five, and `build-runtime.mjs` has one emitter instead of five. A wave that touches
`orchestrate-dev.js` or `cli.mjs` regenerates a single file, so post-wave diffs stop carrying three
megabyte-scale bundle rewrites that no reviewer reads. The two delegator skills shrink from 347
lines of duplicated pipeline logic to thin delegation, removing the standing drift risk that REQ
NG-1/NG-3 name: there is one description of how a pass runs, and it lives in the engine.

**What gets harder, and the price we accepted.**

| Consequence | Owner decision | Price |
|---|---|---|
| The repo keeps a 1,209-line / 56,713-byte module (`runtime-adapter.js`) with no in-repo executor | DEC-06 | Reviewers will read it as dead weight until erratum 2 lands a disposition. Accepted over an unspecified deletion that would break nine cite sites across four surviving modules and dangle citations inside `pdlc/engine/lib/adapter.mjs`. The 509 lines of `adapterProbe.test.js` + `adapterHarness.js` are **not** part of this price: their subject is `pdlc-cli.mjs`'s probe transport, which DEC-01 keeps |
| `MERGE_GUARD_DEFAULTS` keeps a member (`.claude/workflows/`) naming a retired directory | DEC-03 | A cosmetically stale constant, shipped verbatim into the published engine. Editing it is an engine change (REQ NG-5); the staleness is inert because the guard only ever *widens* refusal |
| Consumer `.claude/workflows/` copies are cleaned only when an operator runs the script | DEC-04 | Consumers who never run it keep stale files indefinitely. Accepted: NG-6 forbids the automatic path, and all-or-nothing classification keeps AT-4.3 inspectable |
| `hookCompatibility.test.js` survives with fewer blocks than FSPEC M-8's count implies | DEC-07 | The deletion-set count is wrong until erratum 6 lands. Accepted over deleting passing `PROP-COMPAT-*` assertions to satisfy a literal |
| `consolidate-learnings`'s unattended, machinery-backed pass is retired; only the in-session, human-performed pass remains until `pdlc-consolidation-rehost` lands | DEC-10 | Accepted per REQ O-8 (recorded operator direction of 2026-08-08, NG-5's carve-out); bound to a named successor (queue Order 24, `ready: false`, vetoable); class 7 and class 11 must land in the same commit (REQ C-7) so the branch never advertises a bundle reference with no host |
| Class 6, and transitively classes 7–12 (FSPEC §3.1 held-classes note: "class 7 lands after class 6 and classes 8–12 chain off class 7"), cannot land before erratum 6 | DEC-07 | One suite-size literal is assertable at a time; between now and the erratum, an in-place reduction reds AC-1.3 correctly. Accepted over a re-measured expected value that greens by construction. The transitive hold on classes 7–12 was priced under DEC-10 while erratum 3 was undecided; it is priced here now that erratum 3's disposition has landed (REQ O-8) — unchanged in size (six of thirteen classes), only in cause |

**What a gated merge looks like.** Classes 1–5 are ungated and land on engineering's schedule; class 13 is ungated too (FSPEC §3.1 class 13, "Independent; may land any time"), though its documentation lands with class 12's story; class 6 waits on erratum 6 (DEC-07), and classes 7–12 wait transitively on that same erratum-6 gate, chained through class 7 (FSPEC §3.1 held-classes note) — not on DEC-10, whose disposition (erratum 3) has landed (REQ O-8). The intended interim outcome is a **partial merge held on the branch**, not a partial main: each ungated class is independently green per REQ C-7, but AC-1.1's `dist/` set-equality stays **unsatisfied, not yet assertable**, while classes 7–12 are held, so the feature is not "done" and the branch does not merge on a green subset — that state is not a C-7 red. PLAN carries that as the class-7 predecessor edge (owned by DEC-07); PROPERTIES places the classes 7–12 ATs behind the same edge, and the assertion DEC-09 requires must be hosted in a module outside M-8's deletion set (`consolidationPreflight.test.js` or `consolidationRoute.test.js` both qualify — neither is named in FSPEC L-5's M-8 deletion list), or it ships nothing.

**Reversibility.**

- **Easy to reverse:** DEC-01 (relocating the CLI later is a path change plus an `OUT_DIR` edit),
  DEC-08 (config-example values are two JSON strings), DEC-09 (version bumps are monotonic and
  cheap while `^0.23.0` holds).
- **Hard to reverse:** DEC-02 and DEC-05. Re-growing the bundler or restoring fat delegator skills
  means recovering deleted code from history and re-establishing the tests that pinned it; the
  cost is why DEC-02 rejected leaving dead emitters in place as an invitation to re-grow them.
- **One-way door:** none. Nothing here deletes a consumer's data, and every removal is recoverable
  from the class-7 commit.

**Re-evaluation triggers.**

1. **Erratum 2 lands a `runtime-adapter.js` disposition** — DEC-06 is superseded by whatever the
   upstream document decides; the module's fate stops being a sweep-local judgement call.
2. **Erratum 6 corrects FSPEC M-8's membership and count** — DEC-07's in-place reduction should be
   re-read against the corrected set before Phase P begins, and its blocking clause dissolves: the
   assertable suite-size literal moves from 97 to 99 and class 6 unblocks.
2a. **Erratum 3 lands a disposition for `consolidate-learnings`'s execution host** — DEC-10's block
   on classes 7 and 11 lifts, and the option the disposition chooses (a successor `pdlc
   consolidate-learnings` command per SUCC-2, an interactive rewrite, or an explicit accepted
   loss) supersedes DEC-10 entirely.
2b. **Erratum 5 is ratified upstream (FSPEC M-11h corrected to "prose only")** — DEC-08 stops being
   a sweep-local reading of class 10 and becomes the upstream disposition; if instead upstream
   confirms both config values retire, DEC-08 must be re-opened together with AC-5.3's
   "produced by a build step" claim.
2c. **An AC-4.5 lands for the cleanup tool's `--dry-run` and 4a/4b exit split** (erratum 7) —
   DEC-04's operator surface gains an owning criterion, and TSPEC §3.2 rows 4a/4b/5 stop being
   engineering-owned product surface.
3. **The engine carve-out is lifted** (a future REQ permits editing `pdlc/engine/**`) — DEC-03,
   DEC-06 option C and DEC-09 option B all become live again, since each was rejected on carve-out
   cost rather than on merit.
4. **`pdlcPluginCompat` moves off `^0.23.0`** — DEC-09's patch-bump constraint dissolves, and a
   minor bump becomes the honest signal for a retirement of this size.
5. **A second consumer-cleanup need appears** (any other directory the plugin left behind) — revisit
   DEC-04's name-only, single-directory shape before generalising the script.

**Downstream obligations.** PLAN must order the class-7 commit so the DEC-02 builder reduction and
the DEC-01 `dist/` deletion land together (a builder that still emits three retired bundles against
a swept `dist/` fails `--check`), and PROPERTIES must own Decision rule 2 in its transcription
direction: every expected value is a literal from the owning upstream document, a disagreement
with the tree halts to an erratum, and no property derives its expected value from the tree under
test. PLAN must also carry DEC-07's block (class 6 gated on erratum 6, which transitively holds
classes 7–12 per FSPEC §3.1's held-classes note) as a real dependency edge, not a prose note, and
DEC-10's same-commit ordering edge (class 7 and class 11 land together, REQ C-7 / TSPEC T-5) as a
second, distinct edge — the two are not the same kind of gate: DEC-07's blocks on an upstream
disposition that is still open, while DEC-10's orders two classes whose disposition is already
decided (REQ O-8). PLAN must also add the class-9 positive version assertion DEC-09 names — the one
decision in this set with no oracle at HEAD.
