---
feature: pdlc-engineering-loop
---

# PLAN — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.2 | 2026-08-25 |

**Revision changelog**

| Version | Round | Changes |
|---|---|---|
| 0.1 | — | initial draft |
| 0.2 | cross-review round 1 (PM, TE) | Re-grounded on **REQ v1.6 / FSPEC v0.7 / TSPEC v0.5 / DECISIONS v0.4** at HEAD; Overview citation corrected (PM F-01, TE F-01). P1-02's `LOOP_STOP_KINDS` corrected to **ten** members naming `engine-dispatch-refused`, restated in P1-09 (PM F-03, TE F-01). P4-06/P4-07 rewritten to **DEC-LOOP-06 alternative B** — the `!startup.ok` branch unmodified on every path — the ERRATUM clause and the undetermined "whichever the erratum settles" expectation deleted and replaced with seven positive conjuncts (PM F-02, TE F-02). AT-37 given a Phase-4 owner that can reach `cmdQueue`, and `cmdQueue`'s `sessionSummary` import given an owning row (PM F-04). `ESCALATIONS_PATH` and `VENDOR_ROOT` dropped from P0-00's assertion set and both tables corrected to **module-private** (PM F-05, TE F-03). `dist/pdlc-cli.mjs` regeneration folded into the definition of done of **every** `orchestrate-dev.js`-writing row, P9-03 narrowed to the drift check (TE F-04). New `[red]` row **P9-02a** converts `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` to a five-entry set-equality and adds both `lib/` modules to the resolution oracle's driver (TE F-05). New row **P7-00** owns the `_tspec-packed-set.mjs` co-change contract's spec side, and P7-04 gains `tspecPackedCount`'s vendored class size (TE F-06). Skip-title convention recorded for the six RED-terminal batches (PM F-07). `detail`-naming conjuncts added to P1-07/P1-08 (PM F-08); AT-34a's third seed and left-boundary literal added to P3-01 (PM F-09, TE F-07); AT-44's `notEqual` conjunct named in P4-06 (PM F-10, TE F-08); P9-01's law list extended to the three obligations §Properties hand-off names (TE F-09); the AT-coverage sentence narrowed to behavioural production code (TE F-10); P0-01's third precedent named (TE F-11). Q-01…Q-05 answered in place. 59 → **61** tasks. |
| 0.3 | cross-review round 2 (PM, TE) | P9-02a's set-equality corrected from **five** to **six** members — `**/scripts/capture-learnings-baseline.mjs` is already the fourth entry of the shipped `c8.include` block and is pinned there by its own `CAPTURE_SCRIPT_INCLUDE` assertion — with the equality's direction stated (`pkg.c8.include` against the literal, never the literal against itself) and the `CAPTURE_SCRIPT_INCLUDE` case kept for the three conjuncts the equality does not subsume; the Definition-of-Done bullet corrected to match, and the baseline row for `coverageInstrumentation.test.js` now records the four-entry block (TE F-01, PM F-01). P9-02a restated as an **additive** strengthening — two new `test.skip("P9-02: …")` cases beside the shipped containment case, un-skipped and the superseded case deleted by P9-02 — and a fourth clause added to the skip-title convention covering in-place strengthening of a pre-existing green file (TE F-02, TE Q-01). P7-00's open-window warrant re-grounded on `version-skew.test.js`'s `EVIDENCE_PATHSPEC` glob instead of the grep, which matches seven sites across six files (TE F-03, PM F-02), and "versioned amendment" spelled out as a version bump plus changelog row in each amended document (TE Q-02). 61 tasks unchanged. |
| 0.4 | cross-review round 5 (PM, TE) + upstream cascade | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v0.9 / DECISIONS v0.6** at HEAD (PM F-03). **Upstream decided things, and they are absorbed ahead of the raised items.** FSPEC v0.8 added **AT-52** and §2's *In scope by REQ §5's carve-out* paragraph (rule BR-21, falsifier AT-52); TSPEC v0.6…v0.9 added **Architecture §7**, which names the packed channel and enumerates it as **six** sites D-1…D-6 with a hard co-landing ordering, names `pdlc/engine/__tests__/loop-distribution.test.js` as AT-52's engine-side home, adds the `npm-pack-install-upgrade` leg as its installed-engine home, and settles D-4's prover as a **test-time document oracle** rather than a review-time obligation. Consequences: **Phase 7 rebuilt** — v0.3's `loop-vendor-lib.test.js` renamed to TSPEC's `loop-distribution.test.js`; P7-01's single vendoring conjunct replaced by four (importability, additive-only over D-1/D-2/D-3/D-5/D-6, the D-4 document oracle, copy-step soundness); v0.3's P7-02/P7-03/P7-04 **collapsed into one green task P7-02** because TSPEC §7 *Ordering* requires D-1, D-2, D-3, D-5 and D-6 to land together (any proper subset reds a required check); D-1's per-name `mkdirSync(path.dirname(dest))` obligation, **D-5** (`fixture-machine.mjs:426`'s second independent literal) and **D-6** (`packaging.test.js:49-51`'s lossy `path.basename` derivation) absorbed as work rather than assumed; new **P7-03** owns AT-52's installed-engine half on the fixture-machine leg, with edges to P7-02 and P4-07. **AT-52 given owners and executing assertions** (PM F-01, TE F-01, TE F-02): all four Phase-7 rows carry `AT-52`, the enumeration reads `AT-01`…`AT-52`, the identifier count goes **53 → 54** in both the traceability paragraph and the DoD checkbox, and the AT-exemption list shrinks from **eleven rows to six** — the *"neither FSPEC nor TSPEC states any AT over packaging"* rationale is deleted as false at HEAD. **P7-00's warrant rewritten** (PM F-02, TE F-03): it now cites FSPEC §2's carve-out paragraph and REQ §5's carve-out affirmatively, quotes the narrowed out-of-scope wording (*"what any gate … **asserts**"*), names `pdlc-engine-distribution` rather than "order 4", and replaces the open-window argument with P7-01(c)'s oracle. **§Overview's ERRATUM is discharged on both halves** — FSPEC answered the packaging-AT half at v0.8, TSPEC the channel half at v0.6…v0.9 — and the Overview new/modified table gains `fixture-machine.mjs` and `packaging.test.js` rows with HEAD evidence. Manifest, dependency notes, integration points and P9-04's `Deps` reconciled. Task count **61 → 60**. |
| 0.5 | Phase T erratum round 5 (TE) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.6** at HEAD; only TSPEC moved (v0.9 → v1.0), and its round-11 decision is absorbed here: TSPEC's **TE F-01** correction of D-6's upstream constant from **D-2** to **D-3**. **Raised item (TE):** the Phase 7 preamble still read *"D-6 lands with D-1 and D-2 (D-2 alone flows two flattened names into `packRealTarball()`)"*; `packaging.test.js` derives `WORKFLOW_MODULE_NAMES` from `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` (**D-3**) and takes only `buildPairingRecord` from `publish-preflight.mjs` (**D-2**), so the co-landing clause now reads **D-1 and D-3** and names the derivation explicitly. The same wrong-constant claim inside **P7-02**'s D-6 bullet (*"growing D-2 alone yields bare `loop-session.mjs`"*) is corrected to **D-3** on the same premise. Consequently the third clause, previously *"D-3 lands with D-2"*, now reads **D-3 lands with D-1** — the set-equality `packaging.test.js` reds on compares the **packed** set (D-1) against D-3's transcription, not D-2's gate constant. Non-breaking: `P7-02` already lands all five constants in one task, so no task id, batch, dep edge, AT mapping, file-ownership row or count changes. No other text changed. |

| 0.6 | cross-review round 6 (PM, TE) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.6** at HEAD — upstream decided nothing new since v0.5, so this round is corrective only; all six findings are Local to Phase 7 and none changes a task id, batch, dep edge, AT mapping or the task count (**60**). **PM F-01 (Medium):** P7-01(b)'s red reason corrected from *"two of the five do not yet contain them"* to **none of the five** — verified at HEAD across `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s and `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` and `packaging.test.js`'s derived `WORKFLOW_MODULE_NAMES`, each enumerated in the row. **PM F-02 (Medium):** P7-01(b)'s additive-only conjunct given the **direction sentence P9-02a already carries** — the expected side is a literal `HEAD_MEMBERSHIP` transcription of each constant's HEAD membership plus the two new members, the artifact side is the constant read at test time, and *"never transcribed"* governs the artifact side only; without a named baseline the conjunct compared a value to itself and a uniform deletion would have passed green. **PM F-03 (Low):** §Integration points and the DoD's AT-52 channel bullet reconciled — the former is marked *writers only* and names P7-00/P7-01's roles, so the two task sets read as deliberate rather than contradictory. **TE F-04 (Medium):** P7-03's assertion body located explicitly in `legInstallUpgrade` inside `pdlc/engine/scripts/fixture-machine.mjs`, run by the required `Fixture machine` check against a real installed tarball; its `fixture-machine.test.js` append is scoped to a **pure helper pair** (`parseLoopIterationObservation` / `checkLoopIterationObservation`, on the shipped `parseLadderObservation` / `checkLadderObservation` precedent) and the amended `SKIP_INVENTORY` cases, never the leg itself. **TE F-05 (Medium):** P7-03 tagged **[green]** — it lands production bytes behind P7-01's and P7-02's reds — and its falsification recorded as two **named mutations** in its definition of done: (m1) reverting D-1's two `lib/` members must red the leg for its named reason, *no second iteration*, not on an `ENOENT` at pack; (m2) deleting the iteration-index comparison must red the new unit cases. **TE F-06 (Low):** every bare line anchor in the Overview artifact table, P7-00 and P7-02 replaced by the symbol it points at (`MODULE_NAMES`, `runPrepack`'s `mkdirSync`/`copyFileSync`, `WORKFLOW_MODULE_NAMES`, `packRealTarball`, `EVIDENCE_PATHSPEC`), per DEC-DOC-01; the historical changelog rows are left byte-stable as the record of what was written. **Questions answered in place:** PM Q-01 — P7-01(c) strengthened to assert the amended `PK-*` table's vendored-class **member names** set-equal `tspecPackedSet()`'s vendored class, not only the size; PM Q-02 — the batch-10 gate re-runs `packaging.test.js`'s own assertions directly, not only transitively through P7-01(d); TE Q-01 — **yes**, and it is work in P7-03: both `SKIP_INVENTORY`'s and the `runGatedLeg` call site's `unverifiedInvariants` gain `AT-52`, since an absent `npm-pack` capability now leaves AT-52 unverified too; TE Q-02 — the observation surface is named as the **second `pdlc queue --loop-state <T1>` invocation's stdout iteration line**, not the loop-state file and not the session summary. No ERRATUM raised: REQ v1.8, FSPEC v0.8, TSPEC v1.0 and DECISIONS v0.6 all say what this PLAN attributes to them, and the oracle baseline PM F-02 names is PLAN's to state by TSPEC's design. |
| 0.7 | Phase PR erratum round 7 (PM) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.7** at HEAD; only DECISIONS moved (v0.6 → v0.7), and its own changelog records that revision as a citation-and-accuracy sweep that reopened no decision, re-priced no alternative, created no obligation and weakened no retirement — so there is nothing for this PLAN to absorb beyond the pin itself. **PM v7 F-04 (Low):** the §Overview grounding line pinned *"DECISIONS v0.6"*, one revision behind HEAD; corrected to **v0.7**. Historical changelog rows (v0.2…v0.6) are left byte-stable as the record of what each revision was written against. PM v7 F-01/F-02/F-03 and TE v7 F-01/F-02/F-03 are carried v6 findings already reflected in the document as it stands (P7-01(b)'s *"none of the five"* red reason and its `HEAD_MEMBERSHIP` baseline sentence, §Integration points' *"deliberately"* marker, P7-03's `legInstallUpgrade` assertion-body location and `Test File` cell wording, its (m1)/(m2) mutation obligations, and the symbol-point citations) — no new write was owed for them. No task id, batch, dep edge, AT mapping, file-ownership row or task count (**60**) changes. No ERRATUM raised. |
| 0.8 | cross-review round 8 (PM, TE) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.7** at HEAD — no upstream moved since v0.7, so this round has nothing to absorb and is corrective only. Four findings, all Local, all non-load-bearing; **no task id, batch number, dependency edge, AT mapping, file-ownership row or task count (60) changes**. **PM F-05 / TE F-01 (Medium):** the §Overview `fixture-machine.mjs` row's per-name copier corrected `copyFileSync` → **`cpSync`** — that file imports and copies with `cpSync`, and the row now also states the consequence (`cpSync` creates missing destination parents). **TE F-03 (Low):** the `packaging.test.js` row's *"single `mkdirSync`"* locator replaced by **the `mkdirSync` of `buildWorkflowsDir`**, noting `packRealTarball` `mkdirSync`s twice (`buildEngineDir` as well). **PM F-06 (Low):** D-5's and D-6's parent-directory obligations inside P7-02 marked **belt-and-braces** — both sites copy with `cpSync`, so only **D-1's** is required (`prepack.mjs` uses `copyFileSync`); D-6's load-bearing half remains dropping the `path.basename` flattening. **TE F-04 (Low):** skip-title convention clause 3 gains a sentence — a `[green]` tag marks *lands production bytes* and implies no paired `[red]`; **P7-03** is the one row where clause 3 binds to nothing, and its falsifiers are the row's own (m1)/(m2) mutations. **PM F-07 / TE F-02 (Medium), with TE Q-01 / PM Q-02 answered in place:** the `Status` column is declared **authored state, not a live ledger** — v0.6's single flipped marker (P6-01 `🔴`) reverted to `⬚` so all 60 rows read uniformly, live state is read from the branch log and the wave ledger, marker moves are never a PLAN revision, and the DoD's *"no row left 🔴 or ⬚"* is restated as a terminal one-pass sweep owned by the implementing tech-lead. **PM F-04 (Medium)** was already closed at v0.7 (DECISIONS pinned v0.7) — no new write owed. TE's four `DEFERRED:` observations are freeze-scoped and left as recorded. No ERRATUM raised. |
| 0.9 | cross-review round 10 (PM, TE) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.7** at HEAD — the four upstream version cells are unmoved since v0.7, so this round has nothing to absorb and is corrective only. **PM F-01 / TE F-01 (High):** P5-04's `Status` cell reverted `✅` → `⬚`. The flip rode into v0.8 on `a9d5e8182`, a commit whose subject scoped it to the §Overview `cpSync`/`mkdirSync` corrections, and it falsified two claims authored in the same revision — §Batches' *"every row reads `⬚` in the document as authored"* and the v0.8 changelog's *"all 60 rows read uniformly"*. Both are true again at HEAD: every one of the **60** task rows' trailing cell reads `⬚`, so the DoD's terminal one-pass sweep once more starts from a uniform column, and no changelog text was owed or changed. **PM F-03 (Low):** §Batches' *"the only engine mention of them is a comment in `orchestrate-dev.js`"* parenthetical was imprecise — that file also carries a live prompt string naming the glyphs — so it is restated on the claim that is actually load-bearing: `parsePlanTasks` reads the task table's id, dependency and batch cells and never the status cell (its own cases drive a `⬚`-bearing table in `implPhase.test.js`), hence **no engine code reads them**. The convention note also now records the P5-04 revert beside the P6-01 one. **PM F-02 (Medium, inherited from v8/v9)** is left as recorded: the reviewer states that extending v0.8's *authored state, not a live ledger* convention to §Overview's artifact-table before-state prose is a decision rather than a correction, and files it as `DEFERRED:` — out of scope under DECISION FREEZE. **TE F-02 (Low)** — P3-01's *"(TSPEC v0.5, Redaction)"* clause pin — likewise left: the reviewer verified the cited substance survives verbatim at TSPEC HEAD (prefix-anchored normative rule, the `(?<![A-Za-z0-9_\-])` boundary literal, the six-entry catalogue, AT-34a's interior-`sk-` control), so no oracle is weakened and §Overview carries the version binding. Both reviewers' `DEFERRED:` observations are freeze-scoped and left as recorded. **No task id, batch number, dependency edge, AT mapping, file-ownership row or task count (60) changes.** No ERRATUM raised. |
| 1.0 | Phase CR remediation round 2 (PM) | Re-grounded on **REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.8** at HEAD; DECISIONS moved (v0.7 → v0.8) and its one new entry is the subject of this revision. **PM v2 F-03 (Medium):** implementation review verified **P7-03 unlanded at HEAD** — no `parseLoopIterationObservation`/`checkLoopIterationObservation` in `fixture-machine.mjs` or `fixture-machine.test.js`, and `SKIP_INVENTORY`'s `npm-pack-install-upgrade` entry still carrying `AT-2.4` alone — while this PLAN read as though the leg carried the assertion. Resolved as a **descope**, recorded in **DECISIONS DEC-LOOP-07** (which names the coverage that stands in for it, the deferred alternative, the accepted residual risk and three re-evaluation triggers). Three edits, all in this document: P7-03's row is marked `DESCOPED` in both its Task cell and its Status cell, its authored specification retained verbatim as intent; §Integration points' `AT-52` bullet now attributes the *installed-engine* conjunct to P7-01(a)'s packed-tree import and states why the P7-03 surface is not producible (an iteration is a pipeline invocation, BR-04); the DoD's 54-identifier checkbox says the same. **No task id, batch number, dependency edge, file-ownership row or AT mapping changes, and the task count stays 60** — a descoped row is still an authored row, and P9-04's `Deps` edge on P7-03 is satisfied by the descope rather than deleted, so the DAG is untouched. No ERRATUM: REQ, FSPEC and TSPEC state AT-52 and Architecture §7 correctly; what changed is which PLAN row discharges one conjunct. |
| 1.1 | cross-review round 11 (PM, TE) | **Grounding pin, stated honestly.** Round 11 reviewed `af26cf379`, grounded on REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / DECISIONS v0.7. At HEAD the four now read **REQ v1.9 / FSPEC v0.9 / TSPEC v1.2 / DECISIONS v0.8**, and §Overview's pin is moved to those. Of the three that moved after the reviewed commit: REQ v1.9's delta was already confirmed as owing this PLAN nothing (PM/TE PLAN v12, both *Approved with minor changes*); TSPEC v1.1 and v1.2 are self-declared corrective-only and owe no edit here. **FSPEC v0.9 is not absorbed in this round and is flagged for the cascade round that owns it:** its *In scope by REQ §5's carve-out* paragraph now decides that a **test-side transcription is part of the enumeration** (already reflected — P7-01(b)'s five artifact sites include `packaging.test.js`'s `WORKFLOW_MODULE_NAMES`), but its **AT-52 second conjunct** additionally requires that *nothing the gate asserts changed other than that enumeration's membership, so an edit to a comparison, a normalisation or a derived count reds* — P7-01(b) asserts membership additivity only, and owes that conjunct. This round is otherwise corrective: round 11's two Lows and its inherited Medium closed; **no task id, batch number, dependency edge, AT mapping, file-ownership row or task count (60) changes, and no `Status` cell moves**. **TE F-01 (Low):** §Batches' `Status`-convention note listed `parsePlanTasks`' read cells as *id, dependency and batch*; `isDescCell` means it also resolves and emits the **description** cell (`pdlc/workflows/orchestrate-dev.js`, `parsePlanTasks`), so the enumeration now names four cells. The load-bearing half — it never reads the **status** cell — is unchanged and still code-true. **PM F-02 (Low):** the same paragraph's closing glyph inventory was falsified against the tree. `orchestrate-dev.js` contains no `⬚` at all; its only glyph mentions are the non-parsing un-skip-guard comment and `formatUnskipViolations`' operator-facing halt message, both naming `🔴`/`🟢` only. The sentence now says that, and names the only tracked `⬚` sites: `pdlc/skills/se-author/SKILL.md`, the parser fixtures under `pdlc/workflows/__tests__/fixtures/`, and `implPhase.test.js`. **TE F-02 (Low):** P3-01's `(TSPEC v0.5, *Redaction*)` anchor was three versions stale though its substance survives verbatim; replaced by the stable heading citation **Error Handling → *Redaction*** per DEC-DOC-01, with the version binding left where §Overview already carries it. **PM F-01 (Medium, inherited from v8 F-05 / v9 F-01 / v10 F-02) — closed, not deferred again.** The before-state it names is no longer the tree's state: P7-00's spec-side amendment landed on this branch as `b8857eeac`, so `pdlc-engine-distribution` TSPEC 0.15 carries `PK-24`/`PK-25` and FSPEC 0.9 plus AT-3.8b read **five** members. Both sites that still said *"three members and nothing else"* — the §Overview artifact row and P7-00's task row — are re-grounded on HEAD. P7-00 stays an open row for its second deliverable, AT-52's document-oracle conjunct over those two tables, and its `Status` stays the authored `⬚` per the convention note. **PM Q-01 answered:** the deferral about pulling the `Status`-column question into a task or a QUEUE row is left as a queue-level question, not a PLAN task — this PLAN's convention note already makes the column non-load-bearing and no oracle in this feature reads it. No ERRATUM raised. |
| 1.2 | cross-review round 13 (PM, TE) | Upstream pins unmoved since v1.1 (**REQ v1.9 / FSPEC v0.9 / TSPEC v1.2 / DECISIONS v0.8** at HEAD), so this round absorbs nothing new and is corrective only; it closes a contradiction v1.1's own re-pinning introduced. **PM F-01 (High), TE F-01 (Medium) — the same defect.** Moving the pin to FSPEC v0.9 imported AT-52's third clause (*"nothing the gate asserts changed other than that enumeration's membership — so an edit to a comparison, a normalisation or a derived count reds"*, FSPEC **AT-52**), which the v1.1 changelog row flagged as owed while §Verification still said *"both of its conjuncts have an executing assertion"* and the Definition of Done still ticked all 54 identifiers *"`AT-52` included"* unqualified. Both sites now carry the qualifier the changelog already used: §Verification's `AT-52` bullet states that P7-01(b)'s membership additivity and P7-01(c)'s names-and-size comparison do not red on an edit to a comparison, a normalisation or a derived count that leaves the five enumerations' membership intact, and names the clause as owed by the cascade round that absorbs FSPEC v0.9 (natural home P7-01(c), per TE Q-01); the DoD item carries the same exception and says explicitly that ticking it is not evidence the clause is covered; §Integration points' published-engine row points at that caveat. **No new conjunct was added** — a P7-01(e) would discharge the clause outright but is a decision, and both reviewers filed it `DEFERRED:` under DECISION FREEZE. **PM F-02 / TE F-03 (Low):** §Batches' glyph inventory scoped to tracked **code** sites and the verifying command (`git grep -l "⬚" -- pdlc/`) named in place, with the repo-wide `docs/**/PLAN-*.md` and cross-review hits stated — verified at HEAD: 8 code files in the three named classes, 33 tracked files repo-wide. **TE F-02 (Medium, carried unchanged from round 12):** AT-52's *installed-engine* conjunct having no loop-iteration oracle is the ratified residual of **DEC-LOOP-07**, already recorded in §Verification, the DoD and P7-03's row with its deferred alternative and re-evaluation triggers; the reviewer records it as *not gating* and its resolution re-opens a decision, so no write was owed. **No task id, batch number, dependency edge, AT mapping, file-ownership row or task count (60) changes, and no `Status` cell moves.** No ERRATUM raised: FSPEC v0.9's AT-52 is correct as written — the debt was this PLAN's. |

## Overview

Build the session-level engineering loop TSPEC v1.2 specifies (grounded on REQ v1.9, FSPEC v0.9, TSPEC v1.2 and DECISIONS v0.8 — the versions at HEAD when this revision was written; see the v1.1 and v1.2 changelog rows for the one FSPEC v0.9 conjunct this document flags as owed rather than absorbs): two new pure modules
(`loop-session.mjs`, `escalation-view.mjs`) carrying every decision rule, three escalation sources
appending through the one shipped writer, a `--loop-state` path in `cmdQueue` that leaves the shipped `!startup.ok` refusal byte-for-byte intact (DEC-LOOP-06 alternative B), an
operator view rendered over `docs/_queue/ESCALATIONS.md`, and the documentation surfaces REQ-LOOP-05
and REQ-LOOP-06 require.

**What is new, what is modified.** Every path below was checked against HEAD before this PLAN was
written.

| Path | State at HEAD | This feature |
|---|---|---|
| `pdlc/workflows/lib/loop-session.mjs` | **absent** — `lib/` holds only `document-oracles.mjs` | new |
| `pdlc/workflows/lib/escalation-view.mjs` | **absent** | new |
| `pdlc/workflows/orchestrate-dev.js` | exports `renderEscalationEntry`, `appendEscalationEntry`, `MERGE_ESCALATIONS`, `MERGE_GUARD_DEFAULTS`, `effectiveGuardPaths`, `ADVISORY_SEAMS`, `MERGE_CONFIG_PATH`/`ADVISORY_CONFIG_PATH` | modified |
| `pdlc/workflows/orchestrate-queue.js` | exports `main`, `precheckDependencies`; builds the `dependsOn` union (`new Set([...entry.dependsOn, ...fm.dependsOn])`) | modified |
| `pdlc/workflows/consolidate-learnings.js` | `parseEscalations` keyed on `ESCALATION_FEATURE_ROW` + `ESCALATION_SEAM_ROW`; `corpusState` feeds `no-advisory-corpus` / `advisory-corpus-empty` | modified |
| `pdlc/engine/lib/startup.mjs` | exports `runStartupChecks`, `formatStartup`, `RUNG_ORDER`, … — **no** `STARTUP_REMEDIATION` | modified (new export) |
| `pdlc/engine/bin/cli.mjs` | `cmdQueue` opens `const startup = deps.startupFor(argv); if (!startup.ok) {…}`; supports `--queue-path`, `--loop`, `--max-iterations`, `--dry-run` | modified |
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` (`prepack.mjs`, `MODULE_NAMES`) — **flat copy, no `lib/`**: `runPrepack` calls `mkdirSync(vendorDir, {recursive: true})` **once** (`runPrepack`'s single `mkdirSync(vendorDir, …)`) then `copyFileSync(sourcePath, path.join(vendorDir, name))` per name (`runPrepack`'s `copyFileSync` loop), with no per-name parent-directory creation | modified (TSPEC §7 **D-1**, P7-02 — gains two path-bearing names *and* a per-name `mkdirSync(path.dirname(dest), {recursive: true})`, without which the first path-bearing name throws `ENOENT`; see §Phase 7) |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` = the two modules + `VENDOR-MANIFEST.json` (three members); PF-4 checks the packed set, PF-5 checks manifest-vs-vendored-vs-canonical hashes | modified (TSPEC §7 **D-2**, P7-02 — five members) |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | transcribes TSPEC §5.4's packed set; `packaging.test.js` and `publish-channel.test.js` import it. Its header is an explicit **co-change contract** — "Adding, removing or re-classing a member is a SPEC change first … **Never this file alone**" — and `tspecPackedCount({licence})` returns `4 + 15 + 3 + 1 + (licence ? 1 : 0)`, whose `3` is the vendored class size `packaging.test.js` consumes as `expectedMemberCount` | modified (TSPEC §7 **D-3**, P7-02; with its spec side, TSPEC §7 **D-4**, P7-00) |
| `pdlc/engine/scripts/fixture-machine.mjs` | a **second, independent** flat literal `WORKFLOW_MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` (`fixture-machine.mjs`, `WORKFLOW_MODULE_NAMES`), copied per name into the scratch `$TMP/pdlc/workflows` tree the machine packs from (its per-name `cpSync` into `buildWorkflowsDir` — `cpSync`, not `copyFileSync`: the file imports `cpSync` and copies with it, and `fs.cpSync` creates missing destination parents, so unlike D-1 this site needs no added `mkdirSync`; see D-5 in §Phase 7) — it does **not** derive from `prepack.mjs`'s `MODULE_NAMES` | modified (TSPEC §7 **D-5**, P7-02; landing D-1 without it reds every leg of the required `Fixture machine` check) |
| `pdlc/engine/__tests__/packaging.test.js` | derives `WORKFLOW_MODULE_NAMES` from `WORKFLOW_MEMBERS` by `.filter(…).map((member) => path.basename(member))` (`packaging.test.js`, the `WORKFLOW_MODULE_NAMES` derivation), which **flattens the `lib/` segment**; `packRealTarball()` then `mkdirSync`s only `$TMP/pdlc/workflows` and `cpSync`s `pdlc/workflows/<name>` per name (the `mkdirSync` of `buildWorkflowsDir` inside `packRealTarball`, and that function's per-name `cpSync`; `packRealTarball` `mkdirSync`s twice — `buildEngineDir` as well — so only the `buildWorkflowsDir` one is the locator meant here, and the `cpSync` again creates missing parents) | modified (TSPEC §7 **D-6**, P7-02; growing `WORKFLOW_MEMBERS` alone yields bare `loop-session.mjs`, resolves to a non-existent path and throws `ENOENT`) |
| `pdlc/skills/orchestrate-queue/SKILL.md` | states the invocation contract and `Delegates to: pdlc queue` | modified |
| `pdlc/templates/loop.md` | **absent** — `pdlc/templates/` holds only `QUEUE.md` | new |
| `.claude/pdlc.config.example.json` | top-level sections `dispatch`, `advisory`, `implementation`, `learningsInjection` — **no `merge`, no `loop`** | modified (BR-29) |
| `pdlc/workflows/package.json` | c8 `include` is a four-entry `**/`-anchored list; `lib/document-oracles.mjs` is **not** in it | modified |
| `pdlc/workflows/dist/pdlc-cli.mjs` | generated from `orchestrate-dev.js` + `pdlc/workflows/cli.mjs` (`CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"]`, `build-runtime.mjs`) | regenerated by **every** `orchestrate-dev.js`-writing row |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | `REQUIRED_INCLUDES` is a hard-coded **three**-entry list checked with `toContain` (containment, not set-equality) against a shipped `c8.include` block that holds **four** entries — the fourth, `**/scripts/capture-learnings-baseline.mjs`, is held by its own `CAPTURE_SCRIPT_INCLUDE` assertion in the same file; its c8 resolution oracle drives a fixture importing only `build-runtime.mjs` and `scripts/capture-learnings-baseline.mjs` | modified (P9-02a) |
| `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-*` table, FSPEC §5.2 per-class counts | **already amended on this branch**: the vendored class reads **five members and nothing else** — `PK-20`…`PK-22` plus `PK-24` (`vendor/workflows/lib/loop-session.mjs`) and `PK-25` (`vendor/workflows/lib/escalation-view.mjs`) — in TSPEC 0.15, FSPEC 0.9 and AT-3.8b, landed on this branch by `b8857eeac` | P7-00's **spec half is discharged at HEAD**; the row stays open only for its second deliverable, AT-52's document-oracle conjunct over these two tables (PM v8 F-05, v9 F-01, v10 F-02, v11 F-01) |

**Two symbols this plan reads are module-private, and the plan does not pretend otherwise.**
`ESCALATIONS_PATH` (`pdlc/workflows/orchestrate-dev.js`, declared beside `appendEscalationEntry` and
consumed only inside it) and `VENDOR_ROOT` (`pdlc/engine/lib/run.mjs`, consumed by the vendor-first
module resolution) are plain module-level `const`s with **no `export`**. Neither is in P0-00's
assertion set and neither is claimed as an export anywhere in this document: P3-07's append-site
oracle observes the `_appendFile` call's path argument, and P7-01's vendor oracle constructs its own
temp vendor root, so both are writable without either symbol.

**Distribution is load-bearing and is planned as work, not assumed.** `runQueue`
(`pdlc/engine/lib/run.mjs`) resolves the workflow modules from `VENDOR_ROOT =
<engine>/vendor/workflows` before the dev checkout. `prepack.mjs` copies exactly two files into that
directory and creates no `lib/` subdirectory, so an `orchestrate-queue.js` that imports
`./lib/loop-session.mjs` would throw `ERR_MODULE_NOT_FOUND` on every published engine while passing
in this checkout. Phase 7 owns closing that gap.

**Both halves of this PLAN's standing ERRATUM are now discharged upstream — nothing is owed.** v0.2
raised the channel gap against TSPEC (it named the two modules' home without naming the channel that
carries them) and the missing packaging AT against FSPEC. FSPEC **v0.8** answered the second with
**AT-52** (published-engine channel; additive-only over each distribution/release-gate enumeration
and each approved `pdlc-engine-distribution` table) and with §2's *In scope by REQ §5's carve-out*
paragraph, whose rule is **BR-21** and whose falsifier is AT-52. TSPEC **v0.6…v0.9** answered the
first with a new **Architecture §7**, which names the channel and enumerates it as **six** sites
**D-1…D-6** that must move together. Phase 7 below is re-grounded on that section rather than on the
four-site sketch v0.3 carried: it absorbs D-1's `runPrepack` parent-directory obligation, D-5
(`fixture-machine.mjs`'s second, independent literal) and D-6 (`packaging.test.js`'s lossy
`path.basename` derivation), adopts TSPEC's own name for AT-52's engine-side home
(`pdlc/engine/__tests__/loop-distribution.test.js`, replacing v0.3's invented
`loop-vendor-lib.test.js`), and follows TSPEC §7 *Ordering*, which requires D-1, D-2, D-3, D-5 and
D-6 to land **in one task** because any proper subset reds a required check.

**Test suites.** All workflow tests are jest under `pdlc/workflows/__tests__/` (run in CI as
`Unit tests (ubuntu-latest, node 20)`); all engine tests are `node:test` under
`pdlc/engine/__tests__/` (`Engine tests (ubuntu-latest)`). No new workflow file and no new required
check is introduced, so the four-check table in the project `CLAUDE.md` and FSPEC §5.1's
required-check set are unchanged.

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**What the `Status` column means (PM v8 F-07, TE v8 F-02, TE v8 Q-01, answered here).** The column is
**authored state, not a live ledger**: every row reads `⬚` in the document as authored, and the
authoring/review rounds do not sweep it as implementation commits land. A partially swept column is
worse than an unswept one, because a reader cannot tell which reading of `⬚` is in force — so v0.8
reverts the one row that had been flipped (P6-01, flipped to `🔴` in v0.6) back to `⬚` and fixes the
convention here rather than chasing a moving tree row by row; **v0.9 reverts P5-04's `✅`** — flipped
inside v0.8's own delta, on a commit whose subject described only an §Overview citation fix — so all
60 task rows again read `⬚` (PM v10 F-01, TE v10 F-01). The live state of a task is read from
the branch (`git log --grep "^feat(pdlc-engineering-loop): P"`) and from the wave ledger
(`.claude/pdlc-wave-state.json`), both of which are machine-maintained; the glyphs are not
machine-read: `parsePlanTasks` (`pdlc/workflows/orchestrate-dev.js`) reads the task table's id,
**description**, dependency and batch cells and never the status cell — its own cases drive a table
containing `⬚` and assert on ids and deps alone (`pdlc/workflows/__tests__/implPhase.test.js`) — so
**no engine code reads them**. The engine's only glyph mentions are a non-parsing comment on the
un-skip guard and `formatUnskipViolations`'s operator-facing halt message, and both name `🔴`/`🟢`
only; `⬚` itself appears nowhere in `orchestrate-dev.js` — the only tracked **code** sites that
carry it (`git grep -l "⬚" -- pdlc/`, the check that keeps this inventory honest) are
`pdlc/skills/se-author/SKILL.md`, the parser fixtures under `pdlc/workflows/__tests__/fixtures/`, and
`implPhase.test.js` itself; repo-wide, `git grep -l "⬚"` additionally hits `docs/**/PLAN-*.md` and
this feature's cross-reviews, this document included, which is why the claim is scoped to code (PM
v10 F-03, PM v11 F-02, TE v11 F-01, PM v13 F-02, TE v13 F-03).
**Marker moves are therefore never a PLAN revision**, and the changelog's *"no task id, batch, dep
edge, AT mapping or task-count change"* non-breaking claim is unaffected by them (TE v8 Q-01, PM v8
Q-02). The Definition of Done's terminal *"all 60 tasks ✅; no row left 🔴 or ⬚"* item is discharged
by **one sweep at the end**, owned by the implementing tech-lead at the final wave boundary, against
the branch log — not by incremental edits during the loop.

## Batches

Every row's `Batch` is `max(batch of its Deps) + 1`; a row with no `Deps` is batch 1. `Deps` cells
use the same bare ids as the `#` column. Task ids are written identically in both places.

### Phase 0 — pre-flight and shared prerequisites

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P0-00 | **Pre-flight gate.** Assert every BL-PREREQ symbol this feature extends is importable / present at HEAD: `renderEscalationEntry`, `appendEscalationEntry`, `MERGE_ESCALATIONS`, `MERGE_GUARD_DEFAULTS`, `effectiveGuardPaths`, `ADVISORY_SEAMS`, `MERGE_CONFIG_PATH` (`pdlc/workflows/orchestrate-dev.js`); `main`, `precheckDependencies` (`pdlc/workflows/orchestrate-queue.js`); `parseEscalations` (`pdlc/workflows/consolidate-learnings.js`); `runStartupChecks`, `formatStartup` (`pdlc/engine/lib/startup.mjs`); `defaultDeps.startupFor` (`pdlc/engine/bin/cli.mjs`). **Existence only** — never the new shape a later task creates. `ESCALATIONS_PATH` (`orchestrate-dev.js`) and `VENDOR_ROOT` (`run.mjs`) are deliberately **not** in this set: both are module-private `const`s at HEAD, so asserting importability would red the plan's first gate (see Overview). Any absent symbol is promoted to blocking work before P1-01 runs | `pdlc/workflows/__tests__/loopBaselinePreflight.test.js` *(new)* | — | — | 1 | — | ⬚ |
| P0-01 | **[Fake first]** Shared loop test doubles: `readFileFn` over a `Map<path, string\|null>`, an array-collecting `_appendFile` (plus a throwing variant for E-08), an argv-keyed `gitFn` `{ok, stdout, stderr}` responder, a fixed `_now`. Precedents: `advisoryEscalationLog.test.js` (append collector), `mergeQueueDriver.test.js` (git responder), `helpers/advisoryDoubles.js`'s `makeFileDouble` (a `files` map behind `_readFile`/`_writeFile`/`_appendFile`; `helpers/mergeDoubles.js`'s `fakeQueueFs` is the same shape). No new double *kinds* | — *(helper module; exercised by P1-01, P2-01, P3-01, P5-01)* | `pdlc/workflows/__tests__/helpers/loopDoubles.js` *(new)* | — | 1 | — | ⬚ |

### Phase 1 — `pdlc/workflows/lib/loop-session.mjs` (pure)

Single physical source file, written by five tasks; the chain below is the serialization rule 2
requires. Every green row names its red row in `Deps`.

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P1-01 | **[red]** Config-reader cases: the four `case` values (`absent-file`, `absent-section`, `malformed-section`, `explicit-default`), `LOOP_DEFAULTS` asserted against a **literal transcription** of BR-01's four values, per-key independent defaulting with `invalidKeys` naming each substituted key | `pdlc/workflows/__tests__/loopSessionConfig.test.js` *(new)* | — | AT-10, AT-38 | 2 | P0-00, P0-01 | ⬚ |
| P1-02 | **[green]** Create the module: `readLoopConfig`, `LOOP_DEFAULTS`, `LOOP_SOURCES`, `LOOP_STOP_KINDS` (**10**, the tenth being `engine-dispatch-refused` — TSPEC's export comment reads `frozen, 10 members`, and BR-28 names the trap: nine *fields*, ten *stop reasons*), `LOOP_NOTICE_CODES` (10), all frozen. A nine-member constant makes the `cmdQueue` preflight path throw at stop-construction time and reds AT-37. Reads `.claude/pdlc.config.json` bytes as a value — no `fs` | `pdlc/workflows/__tests__/loopSessionConfig.test.js` | `pdlc/workflows/lib/loop-session.mjs` *(new)* | AT-10, AT-38 | 3 | P1-01 | ⬚ |
| P1-03 | **[red]** Preflight cases: `conditions` always length 2 with explicit `held` booleans (the positive conjunct), `"off"` downgrades a failing condition to a `preflight-warning` notice carrying `startup.reason` + injected `remediation`, `versionMismatch` is a notice and never a refusal, `startup.notices` are re-emitted rather than dropped; and the **working-tree** condition under both `dirtyTreePolicy` values — `"tracked"` refuses on any non-empty `git status --porcelain --untracked-files=no`, `"any"` on `--untracked-files=normal`, ignored files appearing in neither by construction (AT-13) | `pdlc/workflows/__tests__/loopSessionPreflight.test.js` *(new)* | — | AT-11, AT-12, AT-13, AT-15a, AT-16, AT-17 | 4 | P1-02 | ⬚ |
| P1-04 | **[green]** `evaluatePreflight(PreflightInput) → PreflightResult`. Both conditions always evaluated; `policy` decides only `decision` | `pdlc/workflows/__tests__/loopSessionPreflight.test.js` | `pdlc/workflows/lib/loop-session.mjs` | AT-11, AT-12, AT-13, AT-15a, AT-16, AT-17 | 5 | P1-03 | ⬚ |
| P1-05 | **[red]** State-codec cases: round-trip over a well-formed `SessionState`; totality over `null`, empty, non-base64, non-JSON, non-object and wrong-`v`; the reserved literal `new` decodes fresh **without** a `session-restarted` notice while every other undecodable token decodes fresh **with** it; free-text members truncated at 200 chars on encode | `pdlc/workflows/__tests__/loopSessionState.test.js` *(new)* | — | AT-48 | 4 | P1-02 | ⬚ |
| P1-06 | **[green]** `decodeLoopState` / `encodeLoopState` — canonical JSON, base64url, total decode | `pdlc/workflows/__tests__/loopSessionState.test.js` | `pdlc/workflows/lib/loop-session.mjs` | AT-48 | 6 | P1-05, P1-04 | ⬚ |
| P1-07 | **[red]** `nextDirective` rules in TSPEC §Interfaces' stated evaluation order: throw ⇒ `invocation-threw` with the counter **unchanged**; `no-queue`; `blocked` ⇒ `queue-blocked`; `halted` ⇒ `pipeline-halted`; `ran` ⇒ continue at `waitMinutes: 0` with both counters reset; `idle` + unreadable queue ⇒ `queue-unreadable`; `idle` + non-empty `awaitingMerge` ⇒ `awaiting-merge`; then **`backoff-unenterable` tested before `idle-exhausted`**; otherwise continue with `schedule[min(pos, len-1)]`. The `[5, 15, 30, 60, 60]` sequence is a literal in the test, never computed from the schedule the code read. **`Directive.detail` is asserted, not only `stopReason`:** the `blocked` case's detail names the blocking feature **and** its reason (AC-1.4) and the `awaiting-merge` case's detail names the features waited on (AC-1.6), both drawn from the fixture's `QUEUE.md` rows — the assertion is that the fixture's feature name occurs in the rendered `detail`, so a `detail` that omits it reds | `pdlc/workflows/__tests__/loopSessionDirective.test.js` *(new)* | — | AT-03, AT-04, AT-05, AT-06, AT-07, AT-08, AT-09, AT-39, AT-40, AT-41, AT-49 | 4 | P1-02 | ⬚ |
| P1-08 | **[green]** `nextDirective(DirectiveInput) → Directive`. `schedulePos` advances exactly once per emitted `continue` and never on a `stop`; `detail` is one human sentence that names the blocking feature and reason on `queue-blocked` and the awaited features on `awaiting-merge` (AC-1.4, AC-1.6), while the `idle` report itself names none (NFR-2) | `pdlc/workflows/__tests__/loopSessionDirective.test.js` | `pdlc/workflows/lib/loop-session.mjs` | AT-03, AT-04, AT-05, AT-06, AT-07, AT-08, AT-09, AT-39, AT-40, AT-41, AT-49 | 7 | P1-07, P1-06 | ⬚ |
| P1-09 | **[red]** Notice channel and report field sets: `notice()` throws on a code outside `LOOP_NOTICE_CODES`; each of the ten codes has exactly one producer inside `collectNotices`; `iterationLine`'s `fields` key set and `sessionSummary`'s **nine** members are `deepEqual`'d against literal transcriptions of FSPEC §3.4 — `LOOP_NOTICE_CODES` / `LOOP_STOP_KINDS` appear on **neither** side (nine *fields*, ten *stop reasons*: different sets, BR-28). The module-level half of AT-37 is the `deepEqual` of `LOOP_STOP_KINDS` against a **ten**-member literal naming `engine-dispatch-refused`; the *session-exercised* half — the set of stop reasons the fixtures actually emit — is P4-06's, because `engine-dispatch-refused` is emitted only by the `cmdQueue` preflight path and never by `nextDirective`. `mergeStatus` is present and literally `"n/a"` when no pipeline ran | `pdlc/workflows/__tests__/loopSessionReport.test.js` *(new)* | — | AT-36, AT-37, AT-51 | 4 | P1-02 | ⬚ |
| P1-10 | **[green]** `notice`, `collectNotices`, `iterationLine`, `sessionSummary`; `halted` / `escalationsRaised` / `operatorView` reach the summary from `SessionState` | `pdlc/workflows/__tests__/loopSessionReport.test.js` | `pdlc/workflows/lib/loop-session.mjs` | AT-36, AT-37, AT-51 | 8 | P1-09, P1-08 | ⬚ |

### Phase 2 — `pdlc/workflows/lib/escalation-view.mjs` (pure)

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P2-01 | **[red]** Parse contract: `parseEscalationLog(null)` ⇒ `{entries: [], parseNotices: []}` and **no write**; the three unparseable shapes each produce their own `reason` (`missing-field: {name}`, `duplicate-field: {name}`, `unrecognised-shape`) with `blockIndex` (1-based) and `heading`; sibling blocks still render. `canonicalBlockText` / `entryId` pinned against the **one worked literal block and its 12-character digest** transcribed from TSPEC §Data Model 4a — the expectation is never computed by calling a hashing helper a second time | `pdlc/workflows/__tests__/escalationViewParse.test.js` *(new)* | — | AT-25, AT-27, AT-28 | 2 | P0-00, P0-01 | ⬚ |
| P2-02 | **[green]** Create the module: `parseEscalationLog`, `canonicalBlockText`, `entryId`, the `EscalationEntry` shape including `kind`, `conditionKey` and the four `decided*` fields. Duplicate detection **counts** matches per recognised field name rather than taking the shipped first-match | `pdlc/workflows/__tests__/escalationViewParse.test.js` | `pdlc/workflows/lib/escalation-view.mjs` *(new)* | AT-25, AT-27, AT-28 | 3 | P2-01 | ⬚ |
| P2-03 | **[red]** Blocked-feature counts over the **effective** dependency union (queue `Depends-On` ∪ REQ frontmatter `depends-on`), transitive closure excluding the entry's own feature; a frontmatter-only dependency is counted; a feature with no queue row counts 0; a cycle terminates with each feature counted at most once and the count bounded by the non-`done` row count | `pdlc/workflows/__tests__/escalationViewCounts.test.js` *(new)* | — | AT-23, AT-42 | 4 | P2-02 | ⬚ |
| P2-04 | **[green]** `blockedFeatureCounts({queueEntries, frontmatterDeps})` — BFS over a visited set | `pdlc/workflows/__tests__/escalationViewCounts.test.js` | `pdlc/workflows/lib/escalation-view.mjs` | AT-23, AT-42 | 5 | P2-03 | ⬚ |
| P2-05 | **[red]** View pipeline V1→V4 **in order**: collapse (V3) before decision overlay (V4), so `occurrences` is the on-disk member count; the recurrence key is `(source-or-seam, feature, conditionKey)` and **not** the rendered decision sentence — three appends whose sentences differ in an interpolated count still collapse to one item with `occurrences: 3`; ordering by blocked-feature count, ties by oldest timestamp then feature name ascending; a decision naming an earlier member id leaves the item **open** with `occurrences: 2` | `pdlc/workflows/__tests__/escalationViewBuild.test.js` *(new)* | — | AT-22, AT-24, AT-26, AT-43, AT-50 | 4 | P2-02 | ⬚ |
| P2-06 | **[green]** `buildOperatorView({log, counts})` → `{items, parseNotices}`; `entryIds` retains every member id, oldest first | `pdlc/workflows/__tests__/escalationViewBuild.test.js` | `pdlc/workflows/lib/escalation-view.mjs` | AT-22, AT-24, AT-26, AT-43, AT-50 | 6 | P2-05, P2-04 | ⬚ |

### Phase 3 — `pdlc/workflows/orchestrate-dev.js` (writer, renderer, redactor, merge sites)

One physical source file, four write points; serialized by the chain below. `loopMergeEscalation.test.js`
is written by two tasks (P3-01, P3-07) in different batches — the append cluster rule 2 requires.

**Every green row in this phase regenerates `pdlc/workflows/dist/pdlc-cli.mjs` in its own landing
commit.** `orchestrate-dev.js` is a member of `CLI_SOURCES` (`pdlc/workflows/build-runtime.mjs`), and
`consolidationBuild.test.js`'s `T32` case — a **pre-existing, currently green** test — asserts
`build-runtime.mjs --check` is clean. The bundle therefore goes stale after **each** of the four
writes, not only the last, so batches 3, 5, 7 and 9 would each end with a pre-existing test red if
regeneration were deferred to a single later row. Folding the rebuild into each writer's definition
of done removes the dependency on gate ordering entirely. (For the record, the ordering does happen
to be favourable: `gateSequenceFor` / `runWaveGateSequence` in `pdlc/workflows/orchestrate-dev.js`
run `postWaveCommand` **before** `testCommand` — but a plan that needs that fact is a plan that
breaks when the sequence changes.)

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P3-01 | **[red]** Redaction, both directions. Positive: a `ghp_`-seeded token in the diagnosis and in an evidence line is replaced by `[redacted:{n} chars]` and BR-12's other six fields still render; one seeded positive per **behavioural match family** — `gh[pousr]_`, `github_pat_`, `sk-`, `xox[baprs]-`, `AKIA` (five, since `gh[pousr]_` subsumes `ghs_`) — plus set-equality against the **six** constant catalogue entries. Negative control (AT-34a): **three** seeds — a 40-character hex git oid, a valid `--loop-state` token, and a token carrying `sk-` in the **interior** (the anchor control, the only seed that fails under a non-anchored regex; the first two carry no catalogue prefix at any position and pass either way) — seeded into the same fields of an **advisory** entry survive unredacted. The left boundary is transcribed literally into the test as `(?<![A-Za-z0-9_\-])`: the run must **begin** with a catalogue prefix, interior-prefix runs explicitly not matched (TSPEC **Error Handling → *Redaction***; §Overview carries the version binding — TE v11 F-02) and the rendered entry is byte-identical to HEAD's renderer output for the same inputs | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` *(new)* | — | AT-34, AT-34a | 2 | P0-00, P0-01 | ⬚ |
| P3-02 | **[green]** `redactEntryText` exported; applied to every free-prose field on **both** branches — decision sentence, `Refusal reason`, diagnosis, proposed action, each evidence line. The closed-vocabulary fields (`Feature`, `Seam`, `Source`, `Root cause`, heading timestamp, `Pipeline state`) are **not** redacted, so `parseEscalations`' calibration keys are untouched. **Regenerates `pdlc/workflows/dist/pdlc-cli.mjs` in this same commit** (`orchestrate-dev.js` ∈ `CLI_SOURCES`) | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | `pdlc/workflows/orchestrate-dev.js` | AT-34, AT-34a | 3 | P3-01 | ⬚ |
| P3-03 | **[red]** Non-advisory entry vocabulary: `ctx.source` renders `## {iso} — {feature} — {source}` with a `\| Source \|` row and **no** `\| Seam \|` row; `{source}` is one member of `LOOP_SOURCES` per block, never an alternation; the advisory branch's structure is byte-identical to HEAD for any input the redactor does not match; `LOOP_SOURCES` ∩ `ADVISORY_SEAMS` = ∅. The test **imports** `LOOP_SOURCES` from `lib/loop-session.mjs` and `deepEqual`s it against `orchestrate-dev.js`'s own frozen literal — one predicate, two enumerations, held equal by this differential assertion (the sibling precedent `DEC-CONS-05` names) | `pdlc/workflows/__tests__/loopEntryVocabulary.test.js` *(new)* | — | AT-21 | 4 | P3-02, P1-02 | ⬚ |
| P3-04 | **[green]** `renderEscalationEntry` gains the `source` branch; `appendEscalationEntry` forwards the widened `ctx` unchanged. **`orchestrate-dev.js` does not import from `./lib/`** — it declares its own frozen `LOOP_SOURCES` literal, pinned equal to the module's by P3-03's differential assertion. Reason: `moduleImportLines` (`pdlc/workflows/build-runtime.mjs`) copies every `/^import\s.+;\s*$/` line **verbatim** into `pdlc/workflows/dist/pdlc-cli.mjs`, which is emitted one directory deeper, so a relative `"./lib/loop-session.mjs"` specifier would resolve against `dist/`, where no `lib/` exists. Today the hoist is harmless because the module imports only `"fs"` and `"path"`. **Regenerates `dist/pdlc-cli.mjs` in this same commit** | `pdlc/workflows/__tests__/loopEntryVocabulary.test.js` | `pdlc/workflows/orchestrate-dev.js` | AT-21 | 5 | P3-03 | ⬚ |
| P3-05 | **[red]** Decision block: five rows (`Decision` ∈ {`resolved`,`rejected`}, `Decided by`, `Decides`, `Decided at`, `Rationale`), read back through `parseEscalationLog` into `decidedOutcome` / `decidedBy` / `decidesId` / `decidedAt` — **never** by regex over `blockText`; the block carries no `\| Seam \|` row | `pdlc/workflows/__tests__/loopDecisionEntry.test.js` *(new)* | — | AT-25 | 6 | P3-04 | ⬚ |
| P3-06 | **[green]** `renderDecisionEntry({decision, decidedBy, decidesId, decidedAt, rationale}, {now})` exported beside `renderEscalationEntry`, appended through the same `appendEscalationEntry`. **Regenerates `dist/pdlc-cli.mjs` in this same commit** | `pdlc/workflows/__tests__/loopDecisionEntry.test.js` | `pdlc/workflows/orchestrate-dev.js` | AT-25 | 7 | P3-05 | ⬚ |
| P3-07 | **[red]** Merge-refusal append sites: at each point `escalations.push(MERGE_ESCALATIONS.{guard,ci,queue,tree})` already fires, an entry is appended **and** the notice string is still pushed; the append is awaited outside the try/catch owning the merge action; an `_appendFile` rejection becomes an `escalation-append-failed` notice and `phaseMerge`'s outcome is byte-identical to the success case | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | — | AT-29 | 8 | P3-06 | ⬚ |
| P3-08 | **[green]** `phaseMerge` appends at its four escalation sites through `appendEscalationEntry` with `ctx.source = "merge-refusal"`. **Regenerates `dist/pdlc-cli.mjs` in this same commit** — the fourth and last `orchestrate-dev.js` write | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | `pdlc/workflows/orchestrate-dev.js` | AT-29 | 9 | P3-07 | ⬚ |

### Phase 4 — engine: `startup.mjs` and `cmdQueue`

**The `!startup.ok` branch is not modified.** DEC-LOOP-06 prices alternative **B** — leave the branch
untouched — as **Chosen** and alternative **D** — policy-aware on the `--loop-state` path — as
**Rejected**, because FSPEC BR-11b forbids any `loop.preflight` value letting an unready engine run
an iteration. TSPEC's policy table agrees: `pdlc queue --loop-state <token>` under
`loop.preflight: "off"` **also refuses**, the shipped branch unchanged, iteration count 0, exit code
`1`, `QUEUE.md` byte-identical, `runQueue` never reached — with the `"off"`/`"strict"` asymmetry
AC-3.4 draws carried entirely by the loop's own `preflight-warning` notice and its distinct stop
reason `engine-dispatch-refused` (§3.4's tenth member, distinct from `preflight-refused`). The one
edit landing on the `--loop-state` path is the `loop` block supplied to the **existing**
`emitReport(…, {adapter, startup, startedAt, finishedAt, loop})` seam. There is no open erratum here;
the round-1 PLAN described TSPEC v0.3's superseded state.

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P4-01 | **[red]** `STARTUP_REMEDIATION` is an exported frozen constant whose value is a **literal transcription** written into the test, and `cmdDoctor`'s printed bytes on a not-ok startup are unchanged against a captured baseline. **Also captures, in this batch — before any Phase-4 source edit lands — the golden `cmdQueue` `!startup.ok` refusal bytes for the three invocation shapes P4-06 asserts against** (rule 4's pre-refactor golden capture; the baseline is HEAD's, since P4-02 is the first row that writes engine source) | `pdlc/engine/__tests__/loop-startup-remediation.test.js` *(new)* | — | AT-44 | 2 | P0-00 | ⬚ |
| P4-02 | **[green]** Export `STARTUP_REMEDIATION` from `pdlc/engine/lib/startup.mjs` — the module that already owns `startup.reason` and already imports `PLUGIN_ROOT_ENV` from `lib/skills.mjs` | `pdlc/engine/__tests__/loop-startup-remediation.test.js` | `pdlc/engine/lib/startup.mjs` | AT-44 | 3 | P4-01 | ⬚ |
| P4-03 | **[green]** `cmdDoctor` consumes `STARTUP_REMEDIATION` in place of its inline template literal; printed bytes unchanged | `pdlc/engine/__tests__/loop-startup-remediation.test.js` | `pdlc/engine/bin/cli.mjs` | AT-44 | 4 | P4-02, P4-01 | ⬚ |
| P4-04 | **[red]** `--loop-state <token>` parsing; `--loop` + `--loop-state` together is a usage error with a non-zero exit, matching the shipped `--max-iterations` validation shape; the directive and the operator view are printed; the `--loop` / `runQueueLoop` path is untouched and `LOOP_STOP_REASONS` still holds its four members | `pdlc/engine/__tests__/loop-cli.test.js` *(new)* | — | AT-04 | 9 | P4-02, P1-10, P2-06 | ⬚ |
| P4-05 | **[green]** `cmdQueue` accepts `--loop-state`, threads it into `runQueue`, prints the directive and the view | `pdlc/engine/__tests__/loop-cli.test.js` | `pdlc/engine/bin/cli.mjs` | AT-04 | 10 | P4-04, P4-03 | ⬚ |
| P4-06 | **[red]** The `!startup.ok` refusal, driven **through the production `cmdQueue`** with the real branch in place and only `deps.startupFor` scripted — asserting `evaluatePreflight` in isolation is explicitly not the oracle. Three invocation shapes, all asserted **byte-for-byte against P4-01's HEAD golden**: plain `pdlc queue`, `pdlc queue --loop`, and `pdlc queue --loop-state <token>` under **both** `loop.preflight` values. Seven positive conjuncts on the `--loop-state` × `"off"` case, which is the one the round-1 PLAN left undetermined: iteration count **0**; **zero** waits taken; `docs/_queue/QUEUE.md` byte-identical; exit code **`1`**; `emitReport(null, …)` taken; `runQueue` never reached; stop reason **`engine-dispatch-refused`**. Under `"strict"` the same shape with stop reason `preflight-refused`. AT-44's falsifier: a `notEqual` conjunct over the two rendered `detail` strings, **both produced on the same run** so the comparison is over real output rather than two separately-constructed literals. AT-37's session half lives here — the set of stop reasons the session fixtures actually **exercise** is `deepEqual`'d against the ten-member literal, so a session ending on the zero-iteration engine-dispatch path must be among the fixtures or AT-37 reds; `LOOP_STOP_KINDS` is not an operand on either side | `pdlc/engine/__tests__/loop-cli.test.js` | — | AT-15a, AT-15b, AT-37, AT-44 | 11 | P4-05, P4-01 | ⬚ |
| P4-07 | **[green]** The `!startup.ok` branch itself is **unmodified** (DEC-LOOP-06 alternative **B**); the `--loop-state` path additionally supplies the `loop` block on the existing `emitReport` seam. This row owns `cmdQueue`'s **import of `sessionSummary` from `loop-session.mjs`** and its direct call with `iterations: 0` and `stopReason` set to `preflight-refused` or `engine-dispatch-refused`, so both refusal paths emit a real BR-28 summary rather than a fixture holding the literal string — the production path AT-37's tenth member requires | `pdlc/engine/__tests__/loop-cli.test.js` | `pdlc/engine/bin/cli.mjs` | AT-15a, AT-15b, AT-37, AT-44 | 12 | P4-06 | ⬚ |

### Phase 5 — `pdlc/workflows/orchestrate-queue.js` (driver wiring, halt escalation, session oracles)

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P5-01 | **[red]** Driver integration with every IO seam scripted: the report carries `loop` (a `Directive`) and `operatorView` in the conditional-spread idiom and the outcome set stays `{ran, halted, idle, blocked, no-queue}`; a preflight refusal returns **before** `readFileFn(queuePath)`, so `QUEUE.md` is byte-identical and zero iterations ran, and `preflight-refused` is distinguishable from `idle`; a `ready: false` row still lands in `report.skipped` with its reason and adds only the `candidate-skipped-not-ready` notice; AT-01's two-report sequence is exercised in-memory here, reading merged status from `report.pipelineReport.mergeStatus` (Q-04) | `pdlc/workflows/__tests__/loopQueueDriver.test.js` *(new)* | — | AT-01, AT-02, AT-13, AT-14, AT-31 | 9 | P1-10, P2-06, P0-01 | ⬚ |
| P5-02 | **[green]** `main` accepts `loopState` and `_now` (`_appendFile` is already a parameter); wires `readLoopConfig` → `evaluatePreflight` → `nextDirective` → `buildOperatorView` and projects `loop` + `operatorView` onto the report | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | `pdlc/workflows/orchestrate-queue.js` | AT-01, AT-02, AT-13, AT-14, AT-31 | 10 | P5-01 | ⬚ |
| P5-03 | **[red]** Halt escalation: the append happens **after** `rewriteStatus(…, "halted", …)` and before `finish({outcome: "halted", …})`, so the durable row survives an append failure; a rejecting `_appendFile` produces an `escalation-append-failed` notice and the row still reads `halted` | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | — | AT-29 | 11 | P5-02 | ⬚ |
| P5-04 | **[green]** Halt append site with `ctx.source = "pipeline-halt"` through `appendEscalationEntry` | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | `pdlc/workflows/orchestrate-queue.js` | AT-29 | 12 | P5-03 | ⬚ |
| P5-05 | **Three-source oracle.** One scripted session in which an advisory seam refuses, a merge is refused and a pipeline halts, driving all three append sites through **one** `_appendFile` collector. Oracle: set-equality between the `sourceLabel`s parsed back out of the collected log and the literal three-member set `{advisory-seam, merge-refusal, pipeline-halt}`. Non-vacuity: the collector is asserted non-empty and each append is attributed to its own call site | `pdlc/workflows/__tests__/loopThreeSources.test.js` *(new)* | — | AT-18 | 13 | P5-04, P3-08 | ⬚ |
| P5-06 | **Advisory catalogue oracle.** The set of advisory sources that append is re-enumerated from `ADVISORY_SEAMS` at test time rather than compared with a literal, with both non-vacuity conjuncts: both sides non-empty, cardinality at least the frozen enumeration's, and the named member `A6` present on both. **Why this row deliberately inverts the no-implementation-echoes rule the others follow:** REQ treats the advisory catalogue as live and growable, so a literal transcription would red on every future seam without any defect having been introduced — the three conjuncts above are the compensating control. Do not "fix" this into a literal; that re-breaks AT-19 on the next seam | `pdlc/workflows/__tests__/loopAdvisoryCatalogue.test.js` *(new)* | — | AT-19 | 13 | P5-04, P3-08 | ⬚ |
| P5-07 | **Git-history oracle (new level).** A temporary git repo is initialised in a fixture directory, a scripted session runs N iterations against it through the real `gitFn`, and every commit in the session's range touching `docs/_queue/QUEUE.md` carries `commitQueueRow`'s own message form (`chore(queue): {feature} → {status}`). A driver-side write is falsified by a commit in the range no invocation produced. **No count-equality is asserted** (BR-19) — but the universal is not left to pass vacuously: the range is asserted to hold **at least one** `QUEUE.md`-touching commit, so a session that produced none reds instead of passing over an empty set. The zero-iteration half is AT-14, owned by P5-01 | `pdlc/workflows/__tests__/loopQueueCommitProvenance.test.js` *(new)* | — | AT-30 | 13 | P5-04 | ⬚ |

### Phase 6 — `pdlc/workflows/consolidate-learnings.js` (calibration isolation)

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P6-01 | **[red]** Whole-output identity over a mixed log: `parseEscalations`' output — per-seam counts, `entryCount`, `corpusState`, `state.reasons`, and the derived `{over, tie, under}` candidate ranking — is identical with and without the non-advisory and decision blocks present. Non-vacuity: the fixture is built so a totals-only oracle would pass while the derived-candidate conjunct fails, and the test asserts the naive comparison would have differed | `pdlc/workflows/__tests__/loopCalibrationIsolation.test.js` *(new)* | — | AT-20 | 8 | P3-04, P3-06 | ⬚ |
| P6-02 | **[green]** `corpusState` derived from **counted entries**, not the raw block count, so a malformed-advisory block no longer lifts an otherwise-empty corpus to `present` (DEC-LOOP-03; no feature flag — the new derivation ships directly) | `pdlc/workflows/__tests__/loopCalibrationIsolation.test.js` | `pdlc/workflows/consolidate-learnings.js` | AT-20 | 9 | P6-01 | ⬚ |
| P6-03 | **Sibling oracle update.** `consolidationAdvisory.test.js` asserts `corpusState` over a malformed-advisory corpus; update it in the landing commit rather than leaving it red. Owner and blast radius are DEC-LOOP-03's (T-Q-02) | `pdlc/workflows/__tests__/consolidationAdvisory.test.js` | — | AT-20 | 10 | P6-02 | ⬚ |

### Phase 7 — distribution: the two new modules must reach the published engine

`runQueue` resolves workflow modules from `<engine>/vendor/workflows` (`VENDOR_ROOT`,
`pdlc/engine/lib/run.mjs`) before falling back to a dev checkout. At HEAD `prepack.mjs`'s
`MODULE_NAMES` is a flat two-entry list (`prepack.mjs`, `MODULE_NAMES`) that creates no `lib/` subdirectory, so
without this phase `orchestrate-queue.js`'s `import … from "./lib/loop-session.mjs"` resolves in a
checkout and throws `ERR_MODULE_NOT_FOUND` on an installed engine.

TSPEC **Architecture §7** enumerates the channel as **six** sites, **D-1…D-6**, and its *Ordering*
paragraph is a hard co-landing constraint, not a preference: **D-5 lands with D-1** (D-1 alone leaves
the fixture machine's scratch tree missing `lib/`, so `runPrepack` throws inside the pack and every
leg of the required `Fixture machine` check reds); **D-6 lands with D-1 and D-3** (D-3 alone flows two
`path.basename`-flattened names into `packRealTarball()`, which throws `ENOENT` and reds the required
`Engine tests (ubuntu-latest)` check — `packaging.test.js` derives `WORKFLOW_MODULE_NAMES` from
`_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, **D-3**, and never from `publish-preflight.mjs`'s
same-named constant, **D-2**); and **D-3 lands with D-1** (growing the packed set without the
transcription reds `packaging.test.js`'s set-equality against `_tspec-packed-set.mjs`'s
`WORKFLOW_MEMBERS`). Five of the six therefore land in **one green task**,
P7-02 — this is why v0.3's separate P7-02/P7-03/P7-04 rows are collapsed rather than reordered: any
batch boundary drawn between them is a batch that ends with a required check red for a reason the
split gate wording cannot excuse. D-4 (the spec side) is the exception: `_tspec-packed-set.mjs`'s own
header orders it **first**, so it keeps its own batch-1 row.

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P7-00 | **Spec side of the packed-set co-change contract (TSPEC §7 D-4).** `pdlc/engine/__tests__/_tspec-packed-set.mjs`'s header states outright: *"Adding, removing or re-classing a member is a SPEC change first. In one change: update TSPEC §5.4's `PK-*` table and FSPEC §5.2's per-class counts, then this file. **Never this file alone**"*. This row is that edit against `docs/completed/pdlc-engine-distribution/` — TSPEC §5.4's `PK-*` table, FSPEC §5.2's per-class counts and AT-3.8b's vendored-class wording, so the class reads **five** rather than the pre-amendment three. **That spec half is already present at HEAD**, landed on this branch by `b8857eeac` (TSPEC 0.15, FSPEC 0.9): `PK-24` and `PK-25` are in the `PK-*` table and both the per-class counts and AT-3.8b read five. The row therefore carries no remaining edit to those tables — only the obligation to keep them so, plus the document-oracle conjunct described below. Its `Status` cell stays `⬚` because that column is authored state, not a live ledger (§Batches' convention note); the terminal one-pass sweep discharges it (PM v11 F-01). It is a **versioned erratum-style amendment** of a shipped feature's spec tables (the members its own release gate enumerates), **not** a re-opening of that feature. It sits in batch 1 because the header's contract is spec-first — *"a SPEC change first … then this file"* — while `tspecPackedCount` moves in P7-02 at batch 10. **In scope by REQ §5's carve-out, affirmatively:** FSPEC §2's *In scope by REQ §5's carve-out* paragraph licenses widening the completed `pdlc-engine-distribution` feature's distribution and release-gate file enumerations, *including* keeping the approved `pdlc-engine-distribution` tables those gates must agree with, so that they cover this feature's shipped files; **BR-21** carries the rule and **AT-52** falsifies its additive-only bound. REQ §5's out-of-scope clause is narrower than v0.3 quoted it — it excludes *changing what any gate delivered by orders 1–4 **asserts***, and this edit changes no assertion, only the file set one ranges over. (v0.3 quoted the pre-erratum wording and called the target "the order-4 release gate"; the target is the completed **`pdlc-engine-distribution`** feature, which BR-21 v0.8 names as an authority *in addition to* orders 1–4 — PM v4/v5 F-02, TE v5 F-03.) **The open window is now closed by an oracle, not by argument.** v0.3 recorded that no oracle reads the two amended files: the only engine test that reaches into `docs/completed/pdlc-engine-distribution/` is `pdlc/engine/__tests__/version-skew.test.js`, whose `EVIDENCE_PATHSPEC` globs `docs/completed/pdlc-engine-distribution/EVIDENCE-*.md` (`version-skew.test.js`, `EVIDENCE_PATHSPEC`) — EVIDENCE documents, not TSPEC §5.4 or FSPEC §5.2 — and nothing under `pdlc/workflows/lib/document-oracles.mjs` parses either. TSPEC §7's *Who proves which conjunct* paragraph settles the disposition: the prose half is a **document-oracle conjunct in AT-52's home**, asserting the two amended tables and AT-3.8b's member-count sentence agree with `tspecPackedCount`'s vendored class size **derived at test time, never with a literal**. P7-01 owns that conjunct, so the window is open only across batches 1–9 and is closed by a test, not by review. **What *versioned* amendment means (TE Q-02):** the table edit lands with a version-header bump and a revision-changelog row in **each** of the two amended documents, naming `pdlc-engineering-loop` as the amending feature, so a later reader of the completed feature's changelog can see when and why the count moved | *(oracle in P7-01, D-4 document conjunct)* | `docs/completed/pdlc-engine-distribution/TSPEC-…md`, `…/FSPEC-…md` | AT-52 | 1 | — | ⬚ |
| P7-01 | **[red]** New engine test — TSPEC *Test Strategy* → *Levels and homes* names this file by name as AT-52's engine-side home, so this PLAN adopts that name rather than inventing one. Four conjuncts, each red at HEAD for its own stated reason: **(a) importability** — `runPrepack` is invoked into a temp vendor tree built by `packRealTarball()`'s recipe, the vendored `orchestrate-queue.js` is `import()`ed, and **both** `lib/` modules are reached through it (a manifest-only or enumeration-only assertion passes while `ERR_MODULE_NOT_FOUND` still fires, TSPEC §7); red because `runPrepack` throws `ENOENT` on the first path-bearing name. **(b) additive-only over D-1, D-2, D-3, D-5 and D-6** — **the direction is the one P9-02a already states: artifact on the left, spec literal on the right, never the constant against itself.** The *artifact* side is each JavaScript constant read **at test time, never transcribed** (`MODULE_NAMES`, `WORKFLOW_MEMBERS` in `publish-preflight.mjs`, `WORKFLOW_MEMBERS` in `_tspec-packed-set.mjs`, `WORKFLOW_MODULE_NAMES` in `fixture-machine.mjs`, `WORKFLOW_MODULE_NAMES` in `packaging.test.js`). The *expected* side is a **literal transcription of each constant's HEAD membership**, captured in this test file as a five-entry `HEAD_MEMBERSHIP` map, **plus** the two new members — so "pre-existing member still present and unaltered" and "the delta is exactly the two new members" both have a defined before-state that does not come from the value under test. Without that baseline the conjunct compares a value to itself and a deletion applied uniformly across all five sites passes green (this project's recorded *consolidation-agent vacuous green* failure). "Never transcribed" governs the **artifact** side only. Red because **none of the five yet contains them**: `MODULE_NAMES` is the flat two-entry `["orchestrate-dev.js", "orchestrate-queue.js"]` (`prepack.mjs`, `MODULE_NAMES`); `publish-preflight.mjs`'s `WORKFLOW_MEMBERS` is the two modules plus `VENDOR-MANIFEST.json`, none under `lib/`; `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` transcribes the same three; `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` is a second flat two-entry literal; and `packaging.test.js`'s `WORKFLOW_MODULE_NAMES` derives from D-3 (`WORKFLOW_MEMBERS.filter(…).map(path.basename)`), so it inherits the gap. Five of five, not two of five (PM v6 F-01, PM v6 F-02). **(c) D-4 document oracle** — `docs/completed/pdlc-engine-distribution/` TSPEC §5.4's `PK-*` table, FSPEC §5.2's per-class counts and AT-3.8b's member-count sentence agree with `tspecPackedCount({licence: false})`'s vendored class size derived at test time; red because P7-00 has moved the tables to five while `_tspec-packed-set.mjs` still says `3`. **Names as well as size (PM v6 Q-01, answered: strengthen).** Size-agreement alone would pass a re-classing edit that removes one member and adds another, so (c) also asserts the amended `PK-*` table's vendored-class **member names** set-equal `tspecPackedSet({licence: false})`'s vendored class, parsed from the table at test time. That is what "additive" means, and it costs nothing extra at test time. **(d) copy-step soundness** — `packRealTarball()` completes without `ENOENT` and produces a tree `prepack.mjs` accepts; red for D-6's flattening. Conjuncts (b), (c) and (d) are the assertions AT-52's additive-only half needs and v0.3 had nowhere; the *"no oracle reads the two files"* premise dies here. D-5's and D-6's inclusion in (b) is **TSPEC-added, not AT-52-derived** (TSPEC §7 *Scope note*), and the file says so, so no reader infers an upstream obligation FSPEC does not carry | `pdlc/engine/__tests__/loop-distribution.test.js` *(new)* | — | AT-52 | 9 | P1-10, P2-06, P7-00 | ⬚ |
| P7-02 | **[green]** Land **D-1, D-2, D-3, D-5 and D-6 in this one task** (TSPEC §7 *Ordering*; splitting them reds a required check at the split). **D-1** `prepack.mjs`: `MODULE_NAMES` gains the path-bearing `lib/loop-session.mjs` and `lib/escalation-view.mjs`, **and** `runPrepack` gains a per-name `mkdirSync(path.dirname(dest), {recursive: true})` before `copyFileSync` — HEAD calls `mkdirSync` once for `vendorDir` (`runPrepack`'s single `mkdirSync(vendorDir, …)`, `prepack.mjs`) and would throw `ENOENT` on the first path-bearing name; the manifest `source` then reads `pdlc/workflows/lib/{name}.mjs`. **D-2** `publish-preflight.mjs`: `WORKFLOW_MEMBERS` gains `vendor/workflows/lib/loop-session.mjs` and `…/escalation-view.mjs` — five members, so PF-5 hashes them and a drifted vendored copy fails the release gate. **D-3** `_tspec-packed-set.mjs`: the same two members, and the vendored class size goes **`3` → `5`** in the `4 + 15 + 3 + 1 + (licence ? 1 : 0)` body, deliberately kept a literal rather than `tspecPackedSet().length` so the transcription stays a transcription; the doc comment's *"3 vendored"* moves with it, and P7-00 is cited in the edit so the file is never changed alone. **D-5** `fixture-machine.mjs`: `WORKFLOW_MODULE_NAMES` is a second, independent literal that does **not** derive from D-1; it gains the same two path-bearing names, and its per-name copier into `buildWorkflowsDir` gains parent-directory creation **belt-and-braces only** (PM v8 F-06): that copier is `cpSync`, and `fs.cpSync` already creates missing destination parents, so this edit is a harmless no-op guard rather than a required fix — **only D-1's is required**, because `prepack.mjs` copies with `copyFileSync`, which does not. **D-6** `packaging.test.js`: drop the `path.basename` flattening from the `WORKFLOW_MODULE_NAMES` derivation (`WORKFLOW_MEMBERS.filter(…).map(path.basename)`) rather than compensate for it, and make `packRealTarball()` preserve each member's relative path after `vendor/workflows/`, creating parent directories in `packRealTarball` (again **belt-and-braces**, PM v8 F-06: `packRealTarball` copies with `cpSync` too — the load-bearing half of D-6 is dropping the flattening, not the `mkdirSync`) — growing D-3 alone yields bare `loop-session.mjs`, resolves to the non-existent `pdlc/workflows/loop-session.mjs` and throws. `publish-channel.test.js`'s transcription check **and `packaging.test.js`'s own pre-existing assertions** are both re-run as part of the batch-10 gate (PM v6 Q-02, answered): D-6's file is edited here as source under test, so its own suite must be confirmed still green directly, not only transitively through P7-01(d). This row writes a test file (`packaging.test.js`) as **source under test's harness**, not as its own oracle: P7-01 is the oracle that turns green | `pdlc/engine/__tests__/loop-distribution.test.js` | `pdlc/engine/scripts/prepack.mjs`, `pdlc/engine/scripts/publish-preflight.mjs`, `pdlc/engine/__tests__/_tspec-packed-set.mjs`, `pdlc/engine/scripts/fixture-machine.mjs`, `pdlc/engine/__tests__/packaging.test.js` | AT-52 | 10 | P7-01 | ⬚ |
| P7-03 | **DESCOPED in Phase CR — see DECISIONS DEC-LOOP-07; the specification below is retained as the authored intent, and nothing in it shipped.** **[green]** **AT-52's installed-engine half.** The existing `npm-pack-install-upgrade` leg is the only CI surface that installs a published-shaped engine (TSPEC *Levels and homes*), so it is where *"starts and iterates"* is asserted rather than simulated. **Where the assertion body lands (TE v6 F-04):** in the leg itself — `legInstallUpgrade` in `pdlc/engine/scripts/fixture-machine.mjs`, executed by the required `Fixture machine (install/upgrade, launcher, container, two-repo)` check against a real installed tarball. The `fixture-machine.test.js` append is **not** that assertion and must not simulate it: HEAD's file unit-tests pure exported helpers against injected doubles (`recordResolvedState`, `compareLegRecords`, `parseLadderObservation`, `checkLadderObservation`), and this row adds exactly that kind of pair — `parseLoopIterationObservation(result)` and `checkLoopIterationObservation(expected, observed)`, modelled on the shipped `parseLadderObservation`/`checkLadderObservation` precedent — with the leg calling them on real output and pushing their violations onto the `{name, violations}` record `legInstallUpgrade` already returns. **Observation surface (TE v6 Q-02, answered):** after installing from the packed tarball the leg runs the installed `pdlc queue --loop-state new`, takes the emitted continue-directive token from that invocation's **stdout**, feeds it back as `pdlc queue --loop-state <T1>`, and parses the second invocation's stdout **iteration line** (`iterationLine`'s rendered field set, `lib/loop-session.mjs`) for iteration index `2`. Stdout of the second invocation is the single named surface — not the loop-state file and not the session summary — so a mutation has exactly one place to red. **Skip-inventory carry-over (TE v6 Q-01, answered: yes, and it is work in this row).** The leg is capability-gated on `npm-pack`, and both `SKIP_INVENTORY`'s `npm-pack-install-upgrade` entry and its `runGatedLeg` call site declare `unverifiedInvariants: ["AT-2.4"]`. Once the leg carries AT-52's installed-engine half, an absent `npm-pack` capability leaves **AT-52** unverified too, so both lists gain `AT-52` in this row — `validateSkipRecords` compares record against inventory and reds if they disagree, and `fixture-machine.test.js`'s existing `SKIP_INVENTORY` coverage cases run over the amended set. **Falsification obligation (TE v6 F-05) — recorded as named mutations, since batch 13 is not RED-terminal and this row lands production bytes behind P7-01's and P7-02's reds.** Definition of done requires both mutations to be run and to red for their stated reason: **(m1)** revert D-1's two `lib/` members in `prepack.mjs`'s `MODULE_NAMES` while leaving D-5 landed — the leg must red on *no second iteration* (the installed engine cannot resolve `lib/loop-session.mjs`), **not** on an `ENOENT` at pack time, which is a different failure and would mean the assertion is measuring the pack rather than the installed engine; **(m2)** delete the iteration-index comparison inside `checkLoopIterationObservation` — `fixture-machine.test.js`'s new unit cases must red. Neither mutation is committed; both are recorded here so a later reader can re-run them. Deps on **P4-07** because there is no loop session to iterate until `cmdQueue`'s `--loop-state` path is complete, and on **P7-02** because the leg cannot pack a tree that lacks `lib/`. Writes `fixture-machine.mjs` a second time, three batches after P7-02, serialized by the `Deps` edge — no batch has two writers of it | `pdlc/engine/__tests__/fixture-machine.test.js` *(existing, appended — the pure `parseLoopIterationObservation`/`checkLoopIterationObservation` pair and the amended `SKIP_INVENTORY` cases only; never the leg itself)* | `pdlc/engine/scripts/fixture-machine.mjs` *(existing by P7-02 — `legInstallUpgrade`'s assertion body, the two new helpers, and both `unverifiedInvariants` lists)* | AT-52 | 13 | P7-02, P4-07 | ⬚ **DESCOPED — DEC-LOOP-07** |


### Phase 8 — configuration, template, documentation surfaces

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P8-01 | **[red]** Example-config oracle, following the shipped shape of `advisory-config-example.test.js` / `learnings-config-example.test.js`: **containment** for the top-level section set (the file is shared — `dispatch`, `advisory`, `implementation`, `learningsInjection` are already there) and **set-equality** for the `loop` section's own key→value map against a literal transcription of BR-01; the `merge` section's values transcribe `MERGE_DEFAULTS` (`mergeMode: "off"`) and `guardPaths` ships **empty**, asserted explicitly, because `effectiveGuardPaths` unions and never subtracts — a non-empty example value would widen every copying consumer's guarded set | `pdlc/engine/__tests__/loop-config-example.test.js` *(new)* | — | AT-46 | 4 | P1-02 | ⬚ |
| P8-02 | **[green]** `.claude/pdlc.config.example.json` gains the `loop` section (`backoffSchedule`, `idleStopAfter`, `preflight`, `dirtyTreePolicy`) and the `merge` section (`mergeMode: "off"`, `guardPaths: []`) — BR-29's "adding `loop` and the missing `merge` in the same change" | `pdlc/engine/__tests__/loop-config-example.test.js` | `.claude/pdlc.config.example.json` | AT-46 | 5 | P8-01 | ⬚ |
| P8-03 | `pdlc/templates/loop.md` — AC-1.1's prompt template. Convenience only: it carries **no** behaviour REQ-LOOP-01…07 requires, all of which is reachable from `/loop run /pdlc:orchestrate-queue` | *(oracle in P8-07)* | `pdlc/templates/loop.md` *(new)* | AT-45 | 2 | P0-00 | ⬚ |
| P8-04 | Session-side half of the directive protocol in `pdlc/skills/orchestrate-queue/SKILL.md`: invoke iteration 1 as `pdlc queue --loop-state new`, echo `nextState`, perform the wait, stop on a `stop` directive; and E-20(b)'s **launch-failure** detection rule (`command not found` / exit 127 / spawn `ENOENT`, no parseable report ⇒ `preflight-refused` under both policies) with the install remediation held as a literal, distinguished from `invocation-threw` | *(oracle in P8-07)* | `pdlc/skills/orchestrate-queue/SKILL.md` | AT-44 | 13 | P4-07 | ⬚ |
| P8-05 | `pdlc/OPERATIONS.md`: the directive protocol including `--loop-state` as an **internal** flag (explicitly not a member of BR-25's four-item steady-state surface); BR-25's operator surface; this repo's configured guard-path extras named as a tracked list (`pdlc/engine/`) alongside the note that the live value lives in the gitignored `.claude/pdlc.config.json`; BR-30's durability text — `/loop`'s session scope and expiry transcribed from the runtime's own `/loop` documentation **with the runtime version cited beside them**, the Desktop-scheduled-task and Routine promotion paths, and the plain statement that `orchestrate-dev` is a poor fit for a Routine (no working tree) | *(oracles in P8-07, P8-08)* | `pdlc/OPERATIONS.md` | AT-32, AT-33, AT-35, AT-47 | 13 | P4-07, P8-02, P8-03 | ⬚ |
| P8-06 | `pdlc/README.md`: AC-5.1's four steady-state operator turns and AC-5.2's separate one-time setup list (install the engine, create `docs/_queue/QUEUE.md`), plus the install instruction naming `pdlc/templates/loop.md` | *(oracle in P8-07)* | `pdlc/README.md` | AT-33, AT-45 | 14 | P8-05 | ⬚ |
| P8-07 | **Document oracle.** AT-33 (set-equality over the documented steady-state surface, `--loop-state` **absent** from it), AT-35 and AT-47 (durability text and its cited runtime version), AT-45 (`pdlc/templates/loop.md` exists **and** a shipped doc names that path), and AT-44's (b) half over `pdlc/skills/orchestrate-queue/SKILL.md`. Ranges over a glob of the shipped docs, not an enumerated file list | `pdlc/workflows/__tests__/loopDocumentSurfaces.test.js` *(new)* | — | AT-33, AT-35, AT-44, AT-45, AT-47 | 15 | P8-03, P8-04, P8-05, P8-06 | ⬚ |
| P8-08 | **Guard-path oracle.** Reads the documented extras from `pdlc/OPERATIONS.md`, applies the **shipped** `effectiveGuardPaths` at render time, and asserts set-equality against the documented guarded-path set — derived, never restated — plus the two membership conjuncts against `MERGE_GUARD_DEFAULTS` (`["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]`) | `pdlc/workflows/__tests__/loopGuardPaths.test.js` *(new)* | — | AT-32 | 14 | P8-05 | ⬚ |

### Phase 9 — properties, coverage, generated artifact, gate

| # | Task | Test File | Source File | ATs | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| P9-01 | Three `fast-check` laws, following `advisoryHelperProperties.test.js` and `consolidationProperties.test.js`: codec **round-trip + totality**; `readLoopConfig` **completeness** (all four keys present, each either the in-domain configured value or exactly the `LOOP_DEFAULTS` value, every substituted key named in `invalidKeys`); `blockedFeatureCounts` **bounded, self-excluding, permutation-invariant** over arbitrary graphs including cycles; **`redactEntryText`'s per-family property** — a concrete `prefix` instance drawn from each of the five character classes, the run generated as `[A-Za-z0-9_\-]{8,64}`, output containing `[redacted:{n} chars]` with `n === (prefix + run).length`, plus the non-firing half quantified over inputs carrying **no catalogue prefix at any position** and the anchor half over inputs whose prefix sits in the interior (the generative form of AT-34a's third seed); **`entryId` canonicalisation round trip** over generated blocks; and the **notice-collection set laws** (`collectNotices`' output is a subset of `LOOP_NOTICE_CODES`, order-independent, idempotent under duplicate producers). Six laws — the three §Properties hand-off names are owned here, not left to a later document to place. These supplement the example-based ATs; neither subsumes the other | `pdlc/workflows/__tests__/loopProperties.test.js` *(new)* | — | AT-38, AT-42, AT-48 | 9 | P1-10, P2-06 | ⬚ |
| P9-02a | **[red]** Coverage-instrumentation oracle, strengthened before the block is edited, and strengthened **additively** (clause 4 of the skip-title convention): the shipped three-entry `toContain` containment case is left in place and **two new skipped cases** are added, both titled `test.skip("P9-02: …", …)` so one green row un-skips both (TE Q-01 — this row opens two reds, not one). **Red 1, set-equality:** `deepEqual(pkg.c8.include, <six-member literal>)` — the direction is artifact on the left, spec literal on the right, never the test's own literal against itself — so a *deleted* entry reds as loudly as a missing one. The literal is exactly **six**: the three members `REQUIRED_INCLUDES` holds today, `**/scripts/capture-learnings-baseline.mjs` (already the fourth entry of the shipped block in `pdlc/workflows/package.json`'s `c8.include`, and pinned there by its own shipped assertion `expect(include).toContain(CAPTURE_SCRIPT_INCLUDE)` in the same file), and the two `lib/` modules P9-02 adds. `consolidate-learnings.js` is deliberately **not** added (it is outside the block at HEAD and P6-02's change does not bring it in scope — PM Q-02), so the set-equality has a determinate value. The `CAPTURE_SCRIPT_INCLUDE` case is **kept**, not folded away, once the set-equality lands: it carries three conjuncts the equality does not subsume — the entry is not parent-relative, `allow-external` is `true`, and the merge-base worktrees stay in `exclude`. **Red 2, resolution:** the file's c8 **resolution** oracle — the one that runs real c8 against a driver fixture to catch a mis-anchored glob — is duplicated into a skipped case whose driver also imports `lib/loop-session.mjs` and `lib/escalation-view.mjs`, so a bare-basename entry that `allow-external` silently drops is caught by a real run rather than by a string comparison. Both additions are skipped and nothing shipped is removed, so batch 9's "every pre-existing test stays green" holds literally (TE F-01, TE F-02) | `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | — | — | 9 | P1-10, P2-06 | ⬚ |
| P9-02 | Add `**/pdlc/workflows/lib/loop-session.mjs` and `**/pdlc/workflows/lib/escalation-view.mjs` to the c8 `include` block, `**/`-anchored and path-qualified like every other entry (bare basenames silently drop out under `allow-external` — the block's own `//c8` note records why). Un-skips both of P9-02a's `P9-02:`-titled cases in the same commit and deletes the now-superseded three-entry `toContain` case (the six-member set-equality subsumes it), leaving `CAPTURE_SCRIPT_INCLUDE`'s own case in place. Closes P9-02a's reds: without it the two new modules — which carry every decision rule in this feature — are coverage-invisible and pass the `--per-file --branches 85` floor vacuously | `pdlc/workflows/__tests__/coverageInstrumentation.test.js` *(modified by P9-02a)* | `pdlc/workflows/package.json` | — | 10 | P9-02a | ⬚ |
| P9-03 | **Bundle-drift check.** `node pdlc/workflows/build-runtime.mjs --check` prints no `STALE` line after the last `orchestrate-dev.js` write. Regeneration itself is **not** deferred to this row: each of P3-02, P3-04, P3-06 and P3-08 regenerates and stages `dist/pdlc-cli.mjs` in its own landing commit, because `consolidationBuild.test.js`'s `T32` case is a pre-existing green test that goes red on *each* stale write, not only the last. This row is the belt-and-braces verification that the four did it | `pdlc/workflows/__tests__/consolidationBuild.test.js` *(existing, unmodified)* | — *(no file written; `dist/pdlc-cli.mjs` is generated by P3-02…P3-08, never hand-edited)* | — | 10 | P3-08 | ⬚ |
| P9-04 | **Full-suite gate.** `cd pdlc/workflows && npm run test:coverage` and `cd pdlc/engine && npm ci && npm test` both green; `node pdlc/workflows/build-runtime.mjs --check` clean; `bash -n` over every tracked `*.sh`. Confirms the four CI checks are unchanged in membership | *(whole suite)* | — | — | 16 | P4-07, P5-05, P5-06, P5-07, P6-03, P7-03, P8-07, P8-08, P9-01, P9-02, P9-03 | ⬚ |

### Batch gates

The default gate is **full suite green after the batch**. Six batches are RED-terminal by design and
carry the split wording instead — *the batch's new tests fail for their specified reason, and every
pre-existing test is green*:

| Batch | RED-terminal because | Green closed in |
|---|---|---|
| 2 | P1-01, P2-01, P3-01, P4-01 | batch 3 |
| 4 | P1-03, P1-05, P1-07, P1-09, P2-03, P2-05, P3-03, P8-01 | batches 5–8 |
| 6 | P3-05 | batch 7 |
| 8 | P3-07, P6-01 | batch 9 |
| 9 | P4-04, P5-01, P7-01, P9-02a | batches 10–12 |
| 11 | P4-06, P5-03 | batch 12 |

Batches 1, 3, 5, 7, 10, 12, 13, 14, 15 and 16 take the full-suite-green gate.

**The skip-title convention — how a RED-terminal batch survives the wave gate.** The split wording
above states the *intent* of a RED-terminal batch, but the wave gate cannot read intent: it requires
`implementation.testCommand` to exit 0 after **every** wave, unconditionally, and this repo has
halted on that six recorded times (`pdlc-engine-distribution` waves 2, 3, 4, 5, 7 and 15). The
standing resolution is not re-batching — it is the convention every `[red]` row in this PLAN follows:

1. A `[red]` row commits its new cases as **`test.skip("{green-task-id}: {assertion}", …)`**, titled
   with the id of the green task that will un-skip them. The red is preserved and attributable, and
   the gate stays green.
2. **The imports are deferred to `await import(...)` inside the skipped block** — never at module
   scope. `test.skip` cannot protect a module-load failure: a top-level
   `import … from "./lib/loop-session.mjs"` written before P1-02 exists reds the whole file at link
   time regardless of the skip, which is the pre-existing-IMPORT-red failure mode
   `pdlc-plugin-retirement` shipped four of.
3. The matching `[green]` row **un-skips** its own titled cases in the same commit that lands the
   production change. A green row that leaves its cases skipped is a vacuous green and is a gate
   failure, not a satisfied one.
   **`[green]` does not imply a paired `[red]` (TE v8 F-04).** The tag marks *this row lands
   production bytes*; clause 3 binds only where some `[red]` row in this PLAN committed cases titled
   with this row's id. **P7-03 is the one row where it binds to nothing** — batch 13 is not
   RED-terminal and P7-03 authors its own new unit cases alongside the production bytes, so no row
   commits `P7-03: …` skip titles. Its falsification obligation is carried instead by the two named
   mutations (m1, m2) recorded in the row itself; a reviewer checking clause 3 against P7-03 should
   read those, not look for a missing red row.
4. **A `[red]` row that strengthens an assertion inside a pre-existing green file is additive, never
   a replacement.** Clauses 1–3 are written for new cases; strengthening in place has two failure
   modes and both are gate halts. Deleting the shipped case and skipping its replacement leaves the
   batch with no red *and* a real coverage hole for one batch; editing the shipped case in place
   leaves a pre-existing test red, which is exactly the unconditional-exit-0 halt above. So the
   `[red]` row **adds** the stronger case as a skipped case beside the shipped one, and the `[green]`
   row un-skips it and deletes the superseded case in the same commit. P9-02a/P9-02 is the only
   instance in this PLAN (TE F-02).

Batch 4 is the one to watch: eight simultaneous `[red]` rows across four phases. Under this
convention that is a normal wave; without it, it is one halt with eight causes.

## File-ownership manifest

Every physical file this feature creates or edits, with the task(s) that write it and the batch each
write lands in. Two tasks share a file **only** across different batches, serialized by a real `Deps`
edge — never by a prose note. Green tasks do not appear against a test file: they change the source
under test, not the test.

### One row per task — every task, every path it writes

| Owning task | Files created or appended | New? | Batch |
|---|---|---|---|
| P0-00 | `pdlc/workflows/__tests__/loopBaselinePreflight.test.js` | new | 1 |
| P0-01 | `pdlc/workflows/__tests__/helpers/loopDoubles.js` | new | 1 |
| P1-01 | `pdlc/workflows/__tests__/loopSessionConfig.test.js` | new | 2 |
| P1-02 | `pdlc/workflows/lib/loop-session.mjs` | new | 3 |
| P1-03 | `pdlc/workflows/__tests__/loopSessionPreflight.test.js` | new | 4 |
| P1-04 | `pdlc/workflows/lib/loop-session.mjs` | existing by P1-02 | 5 |
| P1-05 | `pdlc/workflows/__tests__/loopSessionState.test.js` | new | 4 |
| P1-06 | `pdlc/workflows/lib/loop-session.mjs` | existing by P1-02 | 6 |
| P1-07 | `pdlc/workflows/__tests__/loopSessionDirective.test.js` | new | 4 |
| P1-08 | `pdlc/workflows/lib/loop-session.mjs` | existing by P1-02 | 7 |
| P1-09 | `pdlc/workflows/__tests__/loopSessionReport.test.js` | new | 4 |
| P1-10 | `pdlc/workflows/lib/loop-session.mjs` | existing by P1-02 | 8 |
| P2-01 | `pdlc/workflows/__tests__/escalationViewParse.test.js` | new | 2 |
| P2-02 | `pdlc/workflows/lib/escalation-view.mjs` | new | 3 |
| P2-03 | `pdlc/workflows/__tests__/escalationViewCounts.test.js` | new | 4 |
| P2-04 | `pdlc/workflows/lib/escalation-view.mjs` | existing by P2-02 | 5 |
| P2-05 | `pdlc/workflows/__tests__/escalationViewBuild.test.js` | new | 4 |
| P2-06 | `pdlc/workflows/lib/escalation-view.mjs` | existing by P2-02 | 6 |
| P3-01 | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | new | 2 |
| P3-02 | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs` | existing at HEAD; the bundle is **generated** — regenerated by `node pdlc/workflows/build-runtime.mjs` in this row's own commit, never hand-edited | 3 |
| P3-03 | `pdlc/workflows/__tests__/loopEntryVocabulary.test.js` | new | 4 |
| P3-04 | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs` | existing at HEAD; the bundle is **generated** — regenerated by `node pdlc/workflows/build-runtime.mjs` in this row's own commit, never hand-edited | 5 |
| P3-05 | `pdlc/workflows/__tests__/loopDecisionEntry.test.js` | new | 6 |
| P3-06 | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs` | existing at HEAD; the bundle is **generated** — regenerated by `node pdlc/workflows/build-runtime.mjs` in this row's own commit, never hand-edited | 7 |
| P3-07 | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | existing by P3-01 | 8 |
| P3-08 | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs` | existing at HEAD; the bundle is **generated** — regenerated by `node pdlc/workflows/build-runtime.mjs` in this row's own commit, never hand-edited | 9 |
| P4-01 | `pdlc/engine/__tests__/loop-startup-remediation.test.js` | new | 2 |
| P4-02 | `pdlc/engine/lib/startup.mjs` | existing at HEAD | 3 |
| P4-03 | `pdlc/engine/bin/cli.mjs` | existing at HEAD | 4 |
| P4-04 | `pdlc/engine/__tests__/loop-cli.test.js` | new | 9 |
| P4-05 | `pdlc/engine/bin/cli.mjs` | existing at HEAD | 10 |
| P4-06 | `pdlc/engine/__tests__/loop-cli.test.js` | existing by P4-04 | 11 |
| P4-07 | `pdlc/engine/bin/cli.mjs` | existing at HEAD | 12 |
| P5-01 | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | new | 9 |
| P5-02 | `pdlc/workflows/orchestrate-queue.js` | existing at HEAD | 10 |
| P5-03 | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | existing by P5-01 | 11 |
| P5-04 | `pdlc/workflows/orchestrate-queue.js` | existing at HEAD | 12 |
| P5-05 | `pdlc/workflows/__tests__/loopThreeSources.test.js` | new | 13 |
| P5-06 | `pdlc/workflows/__tests__/loopAdvisoryCatalogue.test.js` | new | 13 |
| P5-07 | `pdlc/workflows/__tests__/loopQueueCommitProvenance.test.js` | new | 13 |
| P6-01 | `pdlc/workflows/__tests__/loopCalibrationIsolation.test.js` | new | 8 |
| P6-02 | `pdlc/workflows/consolidate-learnings.js` | existing at HEAD | 9 |
| P6-03 | `pdlc/workflows/__tests__/consolidationAdvisory.test.js` | existing at HEAD | 10 |
| P7-00 | `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md`, `docs/completed/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` | existing at HEAD | 1 |
| P7-01 | `pdlc/engine/__tests__/loop-distribution.test.js` | new | 9 |
| P7-02 | `pdlc/engine/scripts/prepack.mjs`, `pdlc/engine/scripts/publish-preflight.mjs`, `pdlc/engine/__tests__/_tspec-packed-set.mjs`, `pdlc/engine/scripts/fixture-machine.mjs`, `pdlc/engine/__tests__/packaging.test.js` | existing at HEAD | 10 |
| P7-03 | `pdlc/engine/__tests__/fixture-machine.test.js`, `pdlc/engine/scripts/fixture-machine.mjs` | existing at HEAD | 13 |
| P8-01 | `pdlc/engine/__tests__/loop-config-example.test.js` | new | 4 |
| P8-02 | `.claude/pdlc.config.example.json` | existing at HEAD | 5 |
| P8-03 | `pdlc/templates/loop.md` | new | 2 |
| P8-04 | `pdlc/skills/orchestrate-queue/SKILL.md` | existing at HEAD | 13 |
| P8-05 | `pdlc/OPERATIONS.md` | existing at HEAD | 13 |
| P8-06 | `pdlc/README.md` | existing at HEAD | 14 |
| P8-07 | `pdlc/workflows/__tests__/loopDocumentSurfaces.test.js` | new | 15 |
| P8-08 | `pdlc/workflows/__tests__/loopGuardPaths.test.js` | new | 14 |
| P9-01 | `pdlc/workflows/__tests__/loopProperties.test.js` | new | 9 |
| P9-02a | `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | existing at HEAD | 9 |
| P9-02 | `pdlc/workflows/package.json`, `pdlc/workflows/__tests__/coverageInstrumentation.test.js` (un-skip + delete the superseded case) | both existing at HEAD | 10 |
| P9-03 | — | no file written (drift check only) | 10 |
| P9-04 | — | no file written (verification-only task) | 16 |

Read across a *file* instead of across a task and the serialization chains are the ones
§Dependencies names: `pdlc/workflows/lib/loop-session.mjs` is written by P1-02 → P1-04 → P1-06 →
P1-08 → P1-10 in batches 3, 5, 6, 7, 8; `pdlc/workflows/lib/escalation-view.mjs` by P2-02 → P2-04 →
P2-06 in batches 3, 5, 6; `pdlc/workflows/orchestrate-dev.js` by P3-02 → P3-04 → P3-06 → P3-08 in
batches 3, 5, 7, 9; `pdlc/workflows/orchestrate-queue.js` by P5-02 → P5-04 in batches 10 and 12;
`pdlc/engine/bin/cli.mjs` by P4-03 → P4-05 → P4-07 in batches 4, 10, 12; `pdlc/workflows/dist/pdlc-cli.mjs`, regenerated alongside its source, by P3-02 → P3-04 → P3-06 → P3-08 in the same batches 3, 5, 7, 9; and the three multiply-
written test files (`loopMergeEscalation.test.js`, `loop-cli.test.js`, `loopQueueDriver.test.js`) by
P3-01 → P3-07, P4-04 → P4-06 and P5-01 → P5-03 respectively. No file appears twice in one batch.

`pdlc/workflows/__tests__/consolidationBuild.test.js` is **read, not written** — P9-03 relies on
that shipped oracle rather than adding a new one, so it appears as no row's owned file.
`pdlc/workflows/__tests__/coverageInstrumentation.test.js` **is** written, twice: P9-02a (batch 9)
adds the six-member set-equality and the widened c8 resolution driver as skipped cases beside the
shipped containment case, and P9-02 (batch 10) un-skips both and deletes the superseded containment
case in the same commit that edits `pdlc/workflows/package.json`. Two writers, two batches apart,
serialized by a real `Deps` edge — the single-writer-per-batch rule holds.

## Dependencies

### Task-dependency notes

**The `Batch` column is derived, not descriptive.** Every row is `max(batch of its `Deps`) + 1`,
sources at 1. The arithmetic and the acyclicity of the 61-row graph were re-checked mechanically over
this document's own table after every round-1 edit; the tightest chains are
`P0-00 → P1-01 → P1-02 → P1-03 → P1-04 → P1-06 → P1-08 → P1-10 → P5-01 → P5-02 → P5-03 → P5-04 →
P5-05` and `… → P4-04 → P4-05 → P4-06 → P4-07 → P8-05 → P8-06 → P8-07 → P9-04`, giving 16 batches.

**Why the two `lib/` modules serialize.** `loop-session.mjs` and `escalation-view.mjs` are each one
physical file written by several tasks. Rule 2 forbids two same-batch writers, and the green gate
cannot detect a last-writer-wins race — concurrent agents drop each other's exports and the suite
stays green on the surviving subset. The chains P1-02 → P1-04 → P1-06 → P1-08 → P1-10 and
P2-02 → P2-04 → P2-06 are those serializations, expressed as real `Deps` edges. The two chains are
independent of one another and run in parallel lanes.

**Why red tests depend on the module-creating task.** P1-03, P1-05, P1-07, P1-09, P2-03 and P2-05
depend on P1-02 / P2-02 rather than on P0-00 alone. A red test importing a module that does not yet
exist fails at **link time**, not for its specified reason — the pre-existing-IMPORT-red failure mode
recorded in `pdlc-plugin-retirement`'s LEARNINGS. Requiring the module to exist first means every
red row fails on its assertion, which is the only failure a RED-terminal gate can read.

**Shared prerequisites, created once in batch 1.** `pdlc/workflows/__tests__/helpers/loopDoubles.js`
(P0-01) is the single owner of the shared doubles, with explicit downstream edges from every task
that uses them (P1-01, P2-01, P3-01, P5-01). No task downstream of batch 1 adds a helper to it.

**Cross-phase edges that are easy to miss:**

| Edge | Why |
|---|---|
| P5-05, P5-06 → P3-08 **and** P5-04 | AT-18's three-source oracle cannot be red for its stated reason until all three append sites exist |
| P6-01 → P3-04, P3-06 | AT-20's mixed-log fixture needs both the non-advisory `Source` branch and the decision block to exist before the identity can be asserted |
| P6-03 → P6-02 | the sibling `consolidationAdvisory.test.js` assertion must be updated in the landing commit, not left red |
| P7-01 → P1-10, P2-06, P7-00 | the distribution oracle needs both `lib/` modules complete before it can assert they are copied and importable; and it needs P7-00's amended tables to exist before its D-4 document conjunct can compare them against `tspecPackedCount`'s test-time value |
| P7-02 → P7-01 | red-before-green for AT-52: P7-01's four conjuncts are the reds P7-02 closes. P7-02 also writes `packaging.test.js` (D-6), which P7-01 does **not** write — the two share no file, so the single-writer rule is satisfied by construction rather than by this edge |
| P7-03 → P7-02, P4-07 | the fixture-machine leg cannot pack a tree that lacks `lib/` (P7-02), and there is no loop session to iterate until `cmdQueue`'s `--loop-state` path is complete (P4-07). The edge also serializes the phase's **second** write of `fixture-machine.mjs`: P7-02 lands D-5's literal at batch 10, P7-03 appends the leg's assertion at batch 13, so no batch has two writers of that file |
| P8-05 → P8-02, P8-03 | `pdlc/OPERATIONS.md` documents the shipped config keys and the template path; both must exist before the prose claims they do |
| P9-03 → P3-08 | the drift check runs after the last `orchestrate-dev.js` write. Regeneration itself is **not** this edge's job: `orchestrate-dev.js` is a member of `CLI_SOURCES`, so the tracked `dist/pdlc-cli.mjs` goes stale on **each** of the four Phase-3 writes, and each of P3-02/P3-04/P3-06/P3-08 regenerates and stages it in its own commit |
| P3-03 → P1-02 | P3-03 imports `LOOP_SOURCES` from `lib/loop-session.mjs` for its differential assertion; without the edge the schedule works only by arithmetic accident, and a future re-batching of P1-02 would turn P3-03 into a link-time red |
| P7-02 → P7-00 (transitively, via P7-01) | `_tspec-packed-set.mjs`'s header forbids changing the file without its spec side in the same change; P7-00 lands that side first, at batch 1, so the release gate never agrees with an unapproved table. The edge is stated transitively rather than duplicated because the batch arithmetic is unaffected either way (`max(9) + 1 = 10`) |
| P9-02 → P9-02a | the c8 `include` edit closes the **two** reds the strengthened `coverageInstrumentation.test.js` opens (the six-member set-equality and the widened resolution driver), both carried as `test.skip("P9-02: …")` cases so batch 9's pre-existing tests stay green; reversing the order would let an implementer skip P9-02 with nothing going red |

### Prior-phase baseline (BL-PREREQ)

P0-00 is the first task in the PLAN and gates the whole graph. The symbols it asserts exist at HEAD:

| Symbol | Home | Verified present |
|---|---|---|
| `renderEscalationEntry`, `appendEscalationEntry` | `pdlc/workflows/orchestrate-dev.js` | yes |
| `MERGE_ESCALATIONS`, `MERGE_GUARD_DEFAULTS`, `effectiveGuardPaths`, `MERGE_DEFAULTS`, `parseMergeConfig` | same | yes |
| `ADVISORY_SEAMS` (`["A1"…"A6"]`), `parseAdvisoryConfig`, `ADVISORY_CONFIG_PATH` (=== `MERGE_CONFIG_PATH`, `".claude/pdlc.config.json"`) | same | yes |
| `main`, `precheckDependencies`, the `dependsOn` union `new Set([...entry.dependsOn, ...fm.dependsOn])` | `pdlc/workflows/orchestrate-queue.js` | yes |
| `parseEscalations`, `ESCALATION_FEATURE_ROW`, `ESCALATION_SEAM_ROW`, `corpusState` | `pdlc/workflows/consolidate-learnings.js` | yes |
| `runStartupChecks`, `formatStartup` | `pdlc/engine/lib/startup.mjs` | yes |
| `defaultDeps.startupFor`, `cmdQueue`, `cmdDoctor` | `pdlc/engine/bin/cli.mjs` | yes |
| `runQueue`, `runQueueLoop`, `LOOP_STOP_REASONS` (four members) | `pdlc/engine/lib/run.mjs` | yes |
| `runPrepack`, `MODULE_NAMES`; `WORKFLOW_MEMBERS`; `tspecPackedSet`, `tspecPackedCount` | `pdlc/engine/scripts/prepack.mjs`, `…/publish-preflight.mjs`, `pdlc/engine/__tests__/_tspec-packed-set.mjs` | yes |

**Two symbols are deliberately outside the gate.** `ESCALATIONS_PATH` (`orchestrate-dev.js`) and
`VENDOR_ROOT` (`pdlc/engine/lib/run.mjs`) are module-private `const`s with no `export` at HEAD — the
round-1 PLAN listed both as "verified present" exports, which would have red-flagged P0-00 in batch 1,
the plan's own first gate. Neither is needed: P3-07 observes the path argument the `_appendFile`
double receives, and P7-01 constructs its own temp vendor root. Every remaining row above was
re-verified against HEAD in this round rather than carried forward on the earlier assurance.

The gate asserts **existence only**. It never asserts the widened `ctx`, the new exports, or the
`lib/` vendoring — those are the shapes downstream tasks create, and asserting them here would make
the gate a duplicate of the work it guards.

### Upstream feature dependencies

REQ BL-01…BL-04 name four shipped orders plus `pdlc-advisory-wave-gate`. All are on `main` in this
repo: the advisory escalation writer, `ESCALATIONS.md`'s format, `MERGE_ESCALATIONS`, the queue
driver's dependency union and the engine channel are all present at HEAD, as tabulated above. No
task in this PLAN is blocked on another feature landing.

### Integration points

| Integration | Where | Landed by |
|---|---|---|
| `orchestrate-queue.js` ← the two `lib/` modules | new relative imports | P5-02 |
| `cmdQueue` ← `--loop-state`, the directive and the view | `pdlc/engine/bin/cli.mjs` | P4-05 |
| `cmdQueue` / `evaluatePreflight` ← `STARTUP_REMEDIATION` | `pdlc/engine/lib/startup.mjs` | P4-02, P4-03, P4-07 |
| `phaseMerge` → `appendEscalationEntry` | `pdlc/workflows/orchestrate-dev.js` | P3-08 |
| queue halt path → `appendEscalationEntry` | `pdlc/workflows/orchestrate-queue.js` | P5-04 |
| published engine ← `vendor/workflows/lib/` | `prepack.mjs`, `publish-preflight.mjs`, the packed-set transcription, `fixture-machine.mjs`, `packaging.test.js`'s copy recipe (TSPEC §7 D-1…D-6) | P7-02, P7-03 *(writers only; P7-00 owns the spec side and P7-01 the oracle — the DoD's AT-52 bullet counts the whole channel, P7-00…P7-03, deliberately — and now names the one AT-52 clause that is owed rather than covered, FSPEC v0.9's gate-invariance half; TE v13 F-01)* |
| operator surfaces | `pdlc/OPERATIONS.md`, `pdlc/README.md`, `pdlc/templates/loop.md`, `pdlc/skills/orchestrate-queue/SKILL.md` | P8-03…P8-06 |
| generated runtime artifact | `pdlc/workflows/dist/pdlc-cli.mjs` | P9-03 |

## Verification

### Commands this PLAN is verified with

Every command below is the one already shipped in this repo; no task introduces a new runner, a new
suite directory or a new CI job.

| Scope | Command | Shipped at | Run by |
|---|---|---|---|
| Workflow unit suite (jest, ESM) | `cd pdlc/workflows && npm test` | `pdlc/workflows/package.json` `scripts.test` | every batch gate |
| Workflow coverage, two-stage c8 | `cd pdlc/workflows && npm run test:coverage` | `pdlc/workflows/package.json` `scripts["test:coverage"]` | P9-02, P9-04, CI |
| Engine unit suite (`node:test` runner) | `cd pdlc/engine && npm ci && npm test` | `pdlc/engine/package.json` `scripts.test` → `node __tests__/_run-suite.mjs` | every batch touching Phase 4 or 7, and P9-04 |
| Generated-bundle drift | `node pdlc/workflows/build-runtime.mjs --check` | `pdlc/workflows/build-runtime.mjs` | P9-03, P9-04, and the wave gate's `postWaveCommand` |
| Shell parse | `bash -n` over every tracked `*.sh` | `.github/workflows/pr-tests.yml` | P9-04, CI |

The four required PR checks are unchanged in membership: `Unit tests (ubuntu-latest, node 20)`,
`Engine tests (ubuntu-latest)`, `Shell scripts parse` and `Fixture machine (install/upgrade,
launcher, container, two-repo)`. No task adds a workflow file under `.github/workflows/`, so
FSPEC §5.1's required-check set and the mirror table in the project `CLAUDE.md` stay true without
an edit — and `pdlc/engine/__tests__/ci-arrangement.test.js` derives that table from §5.1, so any
accidental widening reds on its own.

### Batch gate wording

Two gate wordings, assigned per batch by the RED-terminal table in **Batches** — never a blanket
"full suite green after every batch", which is unsatisfiable for a batch that legitimately ends red.

| Batch class | Gate |
|---|---|
| Green batches (1, 3, 5, 7, 10, 12, 13, 14, 15, 16) | `npm test` green in `pdlc/workflows`, and in `pdlc/engine` when the batch wrote engine files. Zero new failures, zero skips added. |
| RED-terminal batches (2, 4, 6, 8, 9, 11) | The batch's new tests fail **for the specified reason** — the assertion named in the row, not a link-time `ERR_MODULE_NOT_FOUND` — and every pre-existing test stays green. A red that is an import error is a gate failure, not a satisfied red (`pdlc-plugin-retirement` shipped four such pre-existing-IMPORT reds; that is why P1-03/P1-05/P1-07/P1-09 and P2-03/P2-05 depend on the module-creating task rather than on P0-00 alone). Operationally these batches satisfy the wave gate through the **skip-title convention** recorded in §Batches — `test.skip("{green-task-id}: …")` with `await import(...)` deferred inside the block — so the gate's unconditional exit-0 requirement is met without weakening the red. |

Local-run hazard, recorded so a red is diagnosed before it is "fixed": the document oracles in
`pdlc/workflows/lib/document-oracles.mjs` walk the entire tree under `root`, skipping only `.git/`
and `node_modules/`. An untracked local file — an editor backup, a tool cache — can red a document
oracle locally while CI is green. Filter through `git check-ignore` / check for untracked files
before touching code (project `CLAUDE.md`; `pdlc-advisory-wave-gate` LEARNINGS).

### Acceptance-test traceability

FSPEC's acceptance tests are `AT-01`…`AT-52`, with `AT-15` split into `AT-15a`/`AT-15b`; TSPEC adds
one sub-test, `AT-34a`, as the negative control for the prefix-anchored redactor. **Every one of
those 54 identifiers appears in the `ATs` cell of at least one task row above**, and every task row
that writes **behavioural** production code names at least one — the infrastructural production
writers listed below (packaging, coverage configuration, the generated bundle) are exempt from the AT
citation and named individually, never waved through. Three consequences the gate can check:

- No AT is orphaned: an AT with no owning row would ship as spec text with no executing assertion —
  the failure mode `pdlc-plugin-retirement` T29 shipped (a green row whose named deliverable was
  never written).
- **`AT-52` is owned; its *installed-engine* conjunct and the **membership** half of its *additive-only* conjunct have an executing assertion — the gate-invariance half FSPEC v0.9 added does not yet (PM v13 F-01, TE v13 F-01; see the paragraph closing this bullet).** v0.3 exempted
  P7-00…P7-04 on the premise that *"neither FSPEC nor TSPEC states any AT over packaging"*. That
  premise is false at HEAD and the exemption is withdrawn: FSPEC v0.8 states **AT-52** and §2 names
  it the carve-out's falsifier, and TSPEC v0.6…v0.9 states **Architecture §7**. All four Phase-7 rows
  now carry `AT-52`. Its *installed-engine* conjunct was to be asserted by P7-03 on the
  `npm-pack-install-upgrade` leg — a packed, installed engine running a loop session and reaching a
  second iteration. **P7-03 is descoped (v1.0, DECISIONS DEC-LOOP-07):** an iteration is a pipeline
  invocation (BR-04), and the fixture machine has no repo to run one against, so that surface is not
  producible inside a required check. The conjunct is discharged instead by P7-01(a)'s `import()` of
  the vendored `orchestrate-queue.js` **and both `lib/` modules** through a tree built by
  `packRealTarball()`'s own recipe — the resolution defect P7-03 targeted fires there as
  `ERR_MODULE_NOT_FOUND` — with the residual exposure named in DEC-LOOP-07 rather than left implied. Its *additive-only* conjunct is asserted by P7-01(b) over D-1, D-2, D-3, D-5
  and D-6 read as constants at test time, and by P7-01(c)'s **document oracle** over the amended
  `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 / FSPEC §5.2 / AT-3.8b prose, compared against
  `tspecPackedCount`'s vendored class size rather than a literal. D-5's and D-6's presence in (b) is
  TSPEC-added rather than AT-52-derived (TSPEC §7 *Scope note*).
  **Not yet covered, and named as owed.** FSPEC v0.9 widened AT-52's second conjunct with *"nothing
  the gate asserts changed other than that enumeration's membership — so an edit to a comparison, a
  normalisation or a derived count reds"* (FSPEC **AT-52**, BR-21, REQ §5 carve-out). P7-01(b)
  asserts membership additivity against its transcribed `HEAD_MEMBERSHIP` baseline and P7-01(c)
  compares the amended tables' member **names and size**; neither reds on an edit to a comparison, a
  normalisation or a derived count that leaves the five enumerations' membership intact, and no
  other row in this PLAN claims that clause. It is therefore owed by the cascade round that absorbs
  FSPEC v0.9 — the same disposition the v1.1 changelog row records — and giving it an owning row
  (the natural home being P7-01(c), which already reads the amended tables) is a new task, out of
  scope under this round's DECISION FREEZE.
- Six rows carry no AT cell, and each is infrastructural rather than behavioural: P0-00 (the
  BL-PREREQ pre-flight gate, which asserts baseline-symbol existence only), P0-01 (shared test
  doubles), P9-02a and P9-02 (the coverage oracle and the c8 `include` list), P9-03 (the bundle
  drift check) and P9-04 (the gate run itself). Each is still oracle-covered: the
  strengthened `coverageInstrumentation.test.js` for P9-02a/P9-02, and `consolidationBuild.test.js`
  for P9-03. An infrastructural row is exempt from the AT
  citation, never from having an executing assertion.
- `AT-34a` is a TSPEC-introduced sub-test, not an FSPEC AT; it is cited as such so a reader does not
  go looking for it in FSPEC §5.

### Properties hand-off

PROPERTIES is authored after this PLAN and owns the property-based obligations TSPEC's *Test
Strategy* names. All three — the redactor's per-family properties (with the non-firing and anchor
halves), the entry-id canonicalisation round trip, and the notice-collection set laws — are **in
P9-01's law list above**, alongside the codec round-trip/totality, `readLoopConfig` completeness and
`blockedFeatureCounts` bounds laws: six laws, not three. P9-01
(`pdlc/workflows/__tests__/loopProperties.test.js`) is the single home for them, so a property document landing later attaches to a file that already exists and to a
row that already has a batch. A property with no executing assertion in that file is a DoD gap, not
a documentation gap.

### Definition of Done

- [ ] All **60** tasks ✅; no row left 🔴 or ⬚ — this is a **terminal** condition discharged by one sweep of the `Status` column at the final wave boundary against the branch log, not by incremental marker edits during the loop (§Batches, *What the `Status` column means*) — and no `test.skip` left behind by a `[red]` row whose green counterpart is done (§Batches, skip-title convention).
- [ ] `cd pdlc/workflows && npm test` green; `cd pdlc/engine && npm ci && npm test` green.
- [ ] `cd pdlc/workflows && npm run test:coverage` green on **both** stages: stage 1's aggregate
      floors (`branches` 85, `lines`/`functions`/`statements` 90 — the two new modules are inside the
      aggregate, so they are held to 90 on three metrics, not only to the 85 branch floor stage 2
      enforces per file; that is understood and accepted, TE Q-05) and stage 2's
      `--per-file --branches 85`. Both new modules are inside the c8 `include` list after P9-02, and
      `coverageInstrumentation.test.js` holds `pkg.c8.include` to a **six-entry set-equality** —
      artifact against literal, not the literal against itself — after P9-02a/P9-02 (the three
      members `REQUIRED_INCLUDES` holds today, `**/scripts/capture-learnings-baseline.mjs`, and the
      two `lib/` modules) — containment would let a deleted entry pass, and a module outside the list is
      coverage-invisible and passes the floor vacuously.
- [ ] `node pdlc/workflows/build-runtime.mjs --check` prints no `STALE` line, and
      `pdlc/workflows/dist/pdlc-cli.mjs` was regenerated (never hand-edited) and staged in the same
      commit as **each** of the four `orchestrate-dev.js` writes (P3-02, P3-04, P3-06, P3-08), not
      only the last — `consolidationBuild.test.js`'s `T32` case is pre-existing and green, so a
      deferred rebuild reds a green batch. P9-03 verifies.
- [ ] All 54 acceptance identifiers (`AT-01`…`AT-52` with `AT-15a`/`AT-15b`, plus `AT-34a`) have an
      executing assertion, not merely an owning row — `AT-52` included **with one named exception**:
      its additive-only conjunct via P7-01(b)/(c) **on membership only**, its installed-engine
      conjunct via P7-01(a)'s packed-tree import, P7-03 having been descoped in Phase CR (DECISIONS
      DEC-LOOP-07). The **gate-invariance clause** FSPEC v0.9 added to AT-52's second conjunct (*an
      edit to a comparison, a normalisation or a derived count reds*) has no executing assertion in
      this PLAN and is owed by the cascade round that absorbs FSPEC v0.9 — see §Verification's
      `AT-52` bullet, which states the same (PM v13 F-01, TE v13 F-01). This item is ticked on the 54
      identifiers as scoped here; it is **not** evidence that clause is covered.
- [ ] The published-engine channel is closed across **all six** of TSPEC §7's sites: `prepack.mjs`
      copies the `lib/` subdirectory *and* creates each name's parent directory (D-1),
      `publish-preflight.mjs`'s `WORKFLOW_MEMBERS` holds five members (D-2), the packed-set
      transcription and `tspecPackedCount`'s vendored class size read `5` (D-3) and agree with
      `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 / FSPEC §5.2 tables as amended by P7-00
      (D-4) — the file's own header forbids changing it alone — `fixture-machine.mjs`'s independent
      `WORKFLOW_MODULE_NAMES` carries the same two path-bearing names (D-5), and `packaging.test.js`'s
      derivation no longer flattens `lib/` through `path.basename` (D-6). `loop-distribution.test.js`
      proves a packed engine `import()`s the vendored `orchestrate-queue.js` and reaches both `lib/`
      modules through it, and the `npm-pack-install-upgrade` leg proves an **installed** engine starts
      and iterates (P7-00…P7-03). Without this the feature passes in a dev checkout and
      throws `ERR_MODULE_NOT_FOUND` on a published engine; with any proper subset of D-1…D-6, either
      the required `Fixture machine` check or the required `Engine tests (ubuntu-latest)` check reds.
- [ ] Operator surfaces updated and oracle-covered: `pdlc/OPERATIONS.md`, `pdlc/README.md`,
      `pdlc/templates/loop.md`, `pdlc/skills/orchestrate-queue/SKILL.md` (P8-03…P8-06), each asserted
      by `loopDocumentSurfaces.test.js` (P8-07) over a glob rather than an enumerated file list.
- [ ] `.claude/pdlc.config.example.json` carries the `loop` block exactly as BR-29 specifies, with no
      unrequested defaults change to any other block (P8-02, oracle P8-01).
- [ ] `git status --porcelain` clean apart from the intended diff; no runtime/state file under
      `.claude/` newly tracked.
- [ ] The four CI checks pass on the PR; no fifth check introduced.
