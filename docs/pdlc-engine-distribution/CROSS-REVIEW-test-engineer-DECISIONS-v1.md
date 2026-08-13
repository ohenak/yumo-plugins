# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Testing lens only — testability of each entry's claims, whether the oracles the
entries nominate can falsify the failures they are nominated against, whether re-evaluation
triggers are observable, and whether each claimed code cost matches HEAD.

## Grounding

Every code cost and "alternative is cheaper" claim in the document was re-derived against
HEAD rather than read. What I checked and what I found:

| Claim in the document | Verified at | Verdict |
|---|---|---|
| §2: engine reaches modules by checkout-relative URL | `pdlc/engine/lib/run.mjs:52-55` | Accurate, verbatim |
| §2: relocation is a three-consumer edit, not a `git mv` | `pdlc/workflows/build-runtime.mjs:19,48-49`; `pdlc/hooks/scripts/sync-workflows.sh`; `pdlc/engine/__tests__/run.test.js:45-46` pins both canonical paths literally | Accurate — the test asserts `path.join(repoRoot,"pdlc","workflows","orchestrate-{dev,queue}.js")` |
| §2: `pdlc/engine/.gitignore` carries only `node_modules/` | file is one line, `node_modules/` | Accurate |
| §3: version pair exists engine-side but the writing module cannot see it | `report.mjs:54` (`buildEngineBlock`), `:110` (`stampReport`), wired `bin/pdlc.mjs:323-325` | Accurate |
| §3: `NO_PROBE`/`NO_RUN_COMMAND` default-inert idiom | `orchestrate-dev.js:7342`, `:7354` are the constants; `:6211-6212`, `:10655` are consumption sites | Accurate, including the direction of each citation |
| §3: injections gain an 8th / 6th key; seam lists are seven and five at HEAD | `run.mjs:80-91` (7 keys), `:114-123` (5 keys); `__tests__/seam-contract.test.js:47-63` (7 and 5) | Accurate |
| §3: `artifactPaths`' only push site is `:11507`, reachable only from `converge()` | `grep -n artifactPaths orchestrate-dev.js` → one `.push` at `:11507`; the rest are initialisers (`:11590,11605,11628,11650`) and report reads (`:12941,12979,13052,13088`) | Accurate |
| §5: `PDLC_PLUGIN_ROOT` is an equal-ranking explicit override at HEAD | `skills.mjs:212-217` (`override || env[PLUGIN_ROOT_ENV]`) | Accurate |
| §5: `REMEDY` recommends the bare variable | `handshake.mjs:131-134` | Accurate |
| §6: no `files` key and no `.npmignore` at HEAD | `pdlc/engine/package.json` (no `files`); `ls -a pdlc/engine/` shows no `.npmignore` | Accurate |
| §7: SDK range pinned `^0.3.226`; shipped e2e already spawns | `package.json` dependencies; `__tests__/cli.test.js:13,22` (`spawnSync(process.execPath,[BIN,…])`) | Accurate |
| §8: `cmdDoctor` checks and dispatches nothing; `runStartupChecks` returns `versions` | `bin/pdlc.mjs:208`, invoked `:489-491`; `startup.mjs:319`, `:453` | Accurate |
| §9: `readEngineConfig` degrades totally on unparseable JSON and non-object `dispatch` | `run.mjs:160` (`ENGINE_CONFIG_PATH`), `:185-192`, `:196-203` | Accurate |
| §10: six static imports; bare `main().catch(…)`; `bin` field; `"type":"module"` | `bin/pdlc.mjs:22-30`, `:479`, `:505`; `package.json:6-8` | Accurate |
| §11: five gate jobs; step-level `uses:` only, nine of them | `.github/workflows/pr-tests.yml` — jobs `unit-tests`, `engine-tests`, `artifact-freshness`, `fresh-clone-bootstrap`, `script-syntax`; `grep -c "uses:"` → 9, all step-level, zero job-level | Accurate |

One claim did **not** survive grounding — §5's "the shipped registered-message set-equality
covers it without a bespoke test" (F-01). One entry's oracle-cost claim is inconsistent with
the TSPEC oracle it names (F-03), and one cross-reference points at the wrong deferral row
(F-08).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-EDIST-04 rests "no bespoke test needed" on an oracle that cannot observe the behaviour the decision turns on, and the cited file does not contain the oracle described.** §5 says the notice "is a catalogue entry (TSPEC §10.3), so `lib/catalogue.mjs`'s shipped registered-message set-equality covers it without a bespoke test". I read the shipped file: `pdlc/engine/__tests__/catalogue.test.js:70-74` asserts `messageIds()` deep-equals `Object.keys(MESSAGES)` — a module compared against itself, true for **any** catalogue content, and its own header (`:4-6`) explicitly disclaims the emitted-ids equality as "a separate, cross-process concern… out of scope here". The oracle that does bite is a different one in a different file, `__tests__/_assert-suite-wide.mjs:195-205` via `assert-suite-wide.test.js:163`, and even that is **path-blind**: it proves `env.plugin-root-ignored` is emitted *somewhere in the suite*, not that it is emitted on the `PDLC_PLUGIN_ROOT`-set-without-`--dev` path. That path is the entry's own stated *entire* difference from the status quo ("the notice, which is the whole difference between this branch and the status quo", §5 Constraints). So the one behaviour distinguishing the chosen branch from the rejected "honour it silently" branch has no oracle named in this document, and TSPEC §1878's traceability row for AC-5.6 names §6.5 — prose — rather than a test. This is the document's own §13 principle ("an oracle that cannot detect the failure it is nominated against is not a mitigation") failing against itself. **Fix:** replace the "covers it for free" clause with the two assertions the branch actually needs — (a) a unit assertion on `resolvePluginRoot({devDeclared: false, env: {PDLC_PLUGIN_ROOT: X}})` that the resolved root is the *discovered* one (positive) **and** that the returned notice list contains the `env.plugin-root-ignored` id (positive, not "no override was applied"), and (b) the §6.5 row-`true`/set case asserting the variable **is** honoured, so the branch is falsifiable in both directions. Raised as an erratum against TSPEC §6.5, whose sentence this entry transcribes | §5 (DEC-EDIST-04); TSPEC §6.5, §10.3 |
| F-02 | High | Local | **DEC-EDIST-06 names signal handling as a behaviour that "needs asserting", then decides nothing about it and nominates no oracle for it — and the default composition of `spawnSync` + "re-raise the child's exit code" turns a signalled run into exit 0.** §7 rejects the word "replacement" precisely because "the difference is observable in signal handling, exit-code propagation and stdio buffering, and calling it replacement would hide exactly the behaviours that need asserting". The following paragraph then pays for exit code and stdio only. The gap is not cosmetic: when a child is terminated by a signal, `spawnSync` returns `{status: null, signal: "SIGINT"}`, so the literal decision text — "re-raising the child's exit code as the launcher's own" — is **undefined** for that case, and the obvious implementation (`process.exit(result.status)`) exits **0** on a Ctrl-C'd pipeline. Under `stdio: "inherit"` the terminal delivers SIGINT to the whole foreground group, so this is the *common* interruption path, not an exotic one, and it collides with AC-1.4's exit-code contract (1 crash / 2 halt) which the entry itself cites as a constraint. A CI or `/loop` caller reading exit 0 concludes the run succeeded. **Fix:** decide the signalled-child case in this entry — the conventional answer is `128 + signum`, or a named non-zero reserved code — and name the oracle alongside the existing pass-through test: spawn through the launcher at a fake target that kills itself with a signal, assert the launcher's own exit status is non-zero **and** equals the decided value (positive assertion on the exact value, not `!== 0`). Raised as an erratum against TSPEC §6.2, which carries the same three-behaviour sentence and the same two-behaviour oracle | §7 (DEC-EDIST-06); TSPEC §6.2 |
| F-03 | Medium | Local | **DEC-EDIST-01's reversibility claim is wrong about AF-2, and the error understates reversal cost in the direction the entry calls "easy".** §2 Reversibility says "Deleting the vendor step and the second root restores HEAD behaviour; the oracle restatement is the only part with an edit cost, and AF-1/AF-2 remain correct assertions about a repo that vendors nothing." AF-2 as the TSPEC actually specifies it (§5.3, `TSPEC:256`) is *not* satisfied by a repo that vendors nothing: it **runs `prepack` into a temp dir first**, then asserts the manifest's `modules` array enumerates **exactly** the two modules by set-equality, with a one-byte mutation falsifier. Delete the vendor step and that test does not "remain correct" — it goes red (or errors on a missing manifest). TSPEC §12.3 item 4 confirms the precondition is load-bearing precisely because the equality is "true over the empty set in any ordinary checkout". So reversal costs *deleting* AF-2, not keeping it, and the entry's own residual-risk paragraph (§2, R-A) leans on AF-2 covering "the case that matters" — a claim that only holds while the prepack precondition is stated. **Fix:** state AF-2's `prepack` precondition in the Decision paragraph (one clause), and correct Reversibility to "AF-1 remains correct; AF-2 is deleted with the vendor step, since its precondition is the vendoring" | §2 (DEC-EDIST-01) |
| F-05 | Medium | Cross-Feature | **DEC-EDIST-01 and DEC-EDIST-05 interact in a way neither entry names: `vendor/` is git-ignored *and* the package ships no `.npmignore`, and npm falls back to `.gitignore` when filtering the contents of a directory listed in `files`.** §2 makes `vendor/` git-ignored (new rule; `pdlc/engine/.gitignore` is one line, `node_modules/`, at HEAD) and §6 puts `vendor/workflows/` in the `files` allow-list while §6's Context records that no `.npmignore` exists. The precedence of `files` over an ignore-file fallback *for files inside a listed directory* is the well-known ambiguous corner of npm packing and has varied across npm majors. If the fallback wins, `prepack` runs, the manifest is written, and the tarball ships **without** the vendored modules — an installed engine that cannot load a workflow module at all, i.e. exactly R-5 restored. The failure is caught (PF-4's real `npm pack` equality goes red, and AF-3's vendor-root path equality would too), which is the design working — but the entry attributes PF-4's real-pack requirement solely to "the rows exist only after `prepack`", so a future reader who finds a cheaper way to satisfy that reason (e.g. staging vendor rows without `prepack`) removes the only cover for this one without knowing it existed. **Fix:** name the interaction in §6's Constraints and in §2's Reversibility as a second, independent reason PF-4 packs for real; and state which mechanism guarantees inclusion (an explicit negation entry, or a `.npmignore` shipped for the purpose) rather than leaving it to npm's default resolution | §2, §6 (DEC-EDIST-01 × DEC-EDIST-05) |
| F-06 | Medium | Local | **The composition of DEC-EDIST-07 and DEC-EDIST-08 is the recovery path that matters most, and neither entry's asserted-state list contains it.** DEC-EDIST-08 makes an unreadable `.claude/pdlc.config.json` refuse at ladder branch 0 **even with no pin declared** — the one operator-visible regression this feature ships. DEC-EDIST-07 says `--version` and `doctor` "resolve but never refuse", downgrading a refusing branch to a notice. Composed, the state an operator lands in is: corrupt config → every command refuses → the *only* way to learn why is `pdlc doctor`, which must emit branch 0's parse-error text as a notice and exit 0. That state appears in neither entry's asserted set: §8's Reversibility enumerates exactly two asserted states, (a) pinned-and-present and (b) empty store, and §9's carve-out table enumerates three config states, none of them under `doctor`. The generic clause in §8 ("a refusing branch is downgraded to a notice") does specify the behaviour, so this is a test-enumeration gap rather than an underspecification — but branch 0 is a *new* refusal introduced in a different entry, and unenumerated compositions are how a product becomes unrecoverable in exactly the state its diagnostic exists for. **Fix:** add a third row to §8's asserted states — corrupt consumer config → `doctor` prints branch 0's parse-error text as a notice, names the file, prints the store root and installed versions, exit 0 — and cross-reference it from §9's table | §8, §9 (DEC-EDIST-07 × DEC-EDIST-08) |
| F-07 | Low | Local | **The header's `Version` cell and the changelog disagree.** The metadata table says `Version 0.1`; the changelog carries a `0.2` row ("§1 retitled…; §13 decision register added"), and §13 is present in the body — so the file on disk is 0.2 and the cell says 0.1. The version cell is read data, not decoration: the erratum protocol re-grounds a document by diffing the `Version` cell an upstream was last approved against, and an approval anchored on this round records "approved against v0.1" for bytes that are v0.2. **Fix:** set the cell to `0.2` (and to `0.3` when this round's revisions land, with a changelog row) | Header table; Changelog |
| F-08 | Medium | Local | **DEC-EDIST-02 routes the reader to the wrong deferral row.** §3's AC-6.2 bullet says the bundle half "stays open because C-4 forbids teaching `.claude/workflows/`'s runtime to self-report; recorded as **N-3** in §12." §12's row for that item is **N-1**; N-3 is BL-03's transcription into `DECISIONS-plugin-distribution.md`, an unrelated operator item. TSPEC §14 numbers them the same way (`N-1` load-root/bundle at `TSPEC:1948`, `N-3` BL-03 at `:1950`), and §1 of this document cites N-3 correctly for BL-03 — so §3 is the single divergent citation. It matters mechanically, not stylistically: §12's preamble says the PLAN "schedules them as gates", so a PLAN author following §3's pointer gates AC-6.2's bundle half on an operator transcription task with a different owner and a different unblocking condition. **Fix:** `N-3` → `N-1` in §3 | §3 (DEC-EDIST-02); §12 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5's re-evaluation trigger for DEC-EDIST-04 is "evidence that operators are hitting the notice repeatedly and not acting on it". What observation produces that evidence? The engine emits no telemetry, and NG-3 forbids it fetching anything, so as written the trigger cannot fire — which makes the ignore-branch effectively permanent rather than provisional. Is the honest form "an operator reports it", and if so should the entry say so, the way DEC-EDIST-09's parser trigger is deliberately mechanical and says which oracle goes red? |
| Q-02 | §2's trigger "the vendored set growing past two files" is checkable — AF-2's set-equality is over exactly two members, so a third file makes it red. Is that intended to be the trigger's *mechanism* (i.e. the operator learns by a red AF-2), and if so should it be stated the way §10's parser trigger is, so a reader knows the trigger fires in CI rather than in someone's memory? |
| Q-03 | §8 says `--version` reports "the **resolved** engine's triple, read from the resolved store entry's own `package.json`", while the run report's engine block is built from `pkg.version` inside the running child (`bin/pdlc.mjs:323-325`). Under a pin these are two different reads of two different files that AC-1.4 requires to be equal. Does the asserted state (a) compare the two *observed outputs* (launcher stdout vs the report's engine block), or does it compare each against the pinned literal? Only the first falsifies a drift between the two read paths. |
| Q-04 | §6's allow-list is `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`. DEC-EDIST-03 puts the resolving launcher on `PATH` and DEC-EDIST-09 splits `bin/` into a guard plus `bin/cli.mjs`; is the launcher itself a third `bin/` member, and is it in TSPEC §5.4's literal expected set? PF-4's equality is only as complete as that table, and a launcher missing from it ships a package whose `PATH` entry resolves to nothing while PF-4 stays green. |

## Positive Observations

- **The alternatives are priced against the tree, not against intuition.** Every "verified
  cost" I re-derived held: the three consumers of `pdlc/workflows/` (§2), the seven-and-five
  seam constants (§3), the single `artifactPaths` push site (§3), the six static imports and
  the bare `main().catch(…)` (§10), the five gate jobs and the nine step-level `uses:` with
  zero at job level (§11). A decision record whose costs survive independent re-derivation is
  rare; this one does, and that is what made the three defects above findable rather than
  arguable.
- **§11 is the strongest entry in the document from a testing lens.** It rejects the DRY move
  on the ground that the offered oracle *cannot see the failure* — §8.5's expander reads
  job-level `name:` keys, GitHub renames to `{caller} / {called}`, and no name expression
  exists for BR-7.3's guard to fire on — and then makes the rejected path mechanically
  unavailable rather than merely discouraged (job-level `uses:` fails the arrangement gate).
  Rejecting an alternative *and* closing the door behind it in CI is exactly the shape a
  decision record should leave for the implementer.
- **§10's reversal trigger is mechanical by construction.** "If `bin/pdlc.mjs` ever needs a
  top-level statement beyond the three the structural oracle admits, the parser stops being
  optional" — with the note that the clause goes red at exactly that moment. This is the
  antidote to the judgement-call trigger Q-01 asks about, and it is worth copying into the
  entries whose triggers currently depend on someone noticing.
- **§6 refuses a globbed expected set for the right reason** — a glob makes the expectation
  read the tree under test, so the equality is vacuously true — and §12 applies the same
  reasoning to `PK-3`/`LICENSE` and the npm scope, sourcing both from the decision record
  rather than the artifact. That is the no-implementation-echo rule stated at the level of a
  packaging oracle, and it generalises.
- **§9's carve-out table is the right way to record an operator-visible behaviour change.**
  Three rows, the newly-refusing one marked "asserted explicitly", and the degrading row kept
  distinct — a reader cannot assume the wrong half degrades, and a test author has the
  enumeration in front of them. F-06 asks only that the same treatment extend to the
  composition with §8.
- **§7 declines to let a double falsify pass-through.** "S-3's descriptor recorder stays for
  the *resolution* assertions and is not asked to falsify pass-through — a double cannot" is
  the production-path discipline applied unprompted, and it is grounded in a shipped precedent
  (`cli.test.js:13,22` already spawns for real). F-02 extends that same standard to the third
  behaviour the entry itself names.

## Recommendation

**Needs revision** — two High findings.

Both High findings are the same defect in two places, and it is the defect this document is
best at naming elsewhere: an oracle nominated against a failure it cannot detect. F-01 rests
DEC-EDIST-04's "no bespoke test" claim on a self-referential set-equality (`messageIds()` vs
`Object.keys(MESSAGES)`) whose own file header disclaims the coverage being attributed to it,
leaving the notice — the entry's stated *entire* difference from the rejected branch —
unasserted on the path that produces it. F-02 lets DEC-EDIST-06 name signal handling as a
behaviour needing assertion and then decide nothing about it, so the literal decision text is
undefined for a signalled child and the default implementation exits 0 on an interrupted run.

Neither needs a redesign. F-01 is two named assertions replacing one sentence; F-02 is one
decided exit value plus one spawning test. The four Medium findings are corrections of fact
(F-03, F-08), one unnamed cross-entry interaction (F-05) and one missing asserted state
(F-06); F-07 is a metadata cell. Nothing in the ten decisions is wrong as a decision — the
revisions are about making three of them checkable and two of them cite correctly.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 4, "low": 1}

