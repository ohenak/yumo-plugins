# PLAN — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` — grounded on REQ v1.16 (`sha256:f97f4f66…`), FSPEC v1.7 (`sha256:d602c440…`), TSPEC v1.15 (`sha256:1f6ea486…`), DECISIONS (`sha256:dc7a8d65…`) |
| Downstream | `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PLAN-v1.md`, `CROSS-REVIEW-test-engineer-PLAN-v1.md` (active; harvested into `LEARNINGS-pdlc-advisory-wave-gate.md` after Phase H) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against TSPEC v1.6 and DECISIONS (DEC-A6-01…DEC-A6-04). |
| 1.1 | 2026-08-19 | Cross-review round 1 (PM, TE). Two bare row-count transcription surfaces folded into batch 1's A6-03 (PM F-01/F-02, TE F-01/F-02); `pathsCollide` dropped from A6-00's pre-flight probe as unexported (TE F-03); A6-18's tier gate restated as receiving the resolved `advisoryTierOn`, preserving PROP-DIS-06's exact count of three (PM F-03); AT-01-5 allocation corrected to AC-1.5's disjunction plus a zero-count discriminator (PM F-04, F-05); OQ-7 pending marker pinned to `test.todo` (TE F-04); engine-suite verification made explicit and re-homed off `ci-arrangement.test.js` (TE F-05, F-06); A6-07 given a real edge to A6-00 (TE F-07); coverage "cannot fail" claim withdrawn (TE F-08); example config documents the whole `advisory` section (PM F-06). |
| 1.2 | 2026-08-19 | Cross-review round 2 (PM, TE). A6-03, §1.3, batch 1's gate wording and the DoD checklist now name **four** bare row-count sites, adding both of `advisoryHarvest.test.js`'s (PM F-01); A6-06's `pdlc/README.md` clause dropped as unowned, uncommittable and line-pinned by `docs-uniqueness.test.js` (PM F-02, TE F-01); A6-18's warning widened from the `config.enabled === false` literal to any `.enabled` token (TE F-02); A6-04's justification corrected to what `ci-arrangement.test.js` actually carries (TE F-03); Overview file count reconciled with the manifest's fixture path (PM F-03). |
| 1.4 | 2026-08-19 | **Erratum round 4 — re-grounded on TSPEC v1.10.** Upstream moved v1.6 → v1.10 while this document sat at v1.3; re-read at HEAD before addressing raised items. TSPEC §1.3/§6 routed one decision here: commit `e3b9d5a3` landed the test-side A6 transcription ahead of Phase I, leaving the advisory suites **red at HEAD**, and TSPEC left "revert vs. keep-and-re-derive" to PLAN. **Decision: keep and re-derive** — A6-00's pre-flight gate itself landed in `e3b9d5a3` and is green, seven of the eight cardinality surfaces already read six, and every HEAD failure is closed by A6-05's existing green step, so the wave map and `Batch` column are unchanged. Overview gains a HEAD-drift note with the measured failure set; A6-00 is restated as discharged by verification (do not re-create the file); A6-05's red steps become verification plus one genuine transcription (`advisoryRecord.test.js`'s PROP-SUM-01 five-seam equality) and a stale-test-name rename; batch-1 gate wording gains the inherited-red rule. Raised items: A6-04 now asserts `enabled` alongside `waveBudgetPerRun`, presence-not-value, answering PM v4 Q-01 (PM F-01); A6-05's borrowed "six collateral surfaces" cardinality dropped (PM F-02); "Both are folded" corrected to all four (TE F-03); DoD engine-leg sentence completed with why the wave gate never runs it (TE F-02). TE F-01 (TSPEC §5.1 map gap) owes no PLAN change — recorded, not actioned. |
| 1.3 | 2026-08-19 | **Operator restructure after the wave-1 halt.** The 14-batch red→green alternation was structurally incapable of passing the shipped wave gate: `implementation.testCommand` is a plain exit-code gate at every wave boundary (`orchestrate-dev.js`'s `if (scriptGate) {` arm, no expected-red channel), so every RED-terminal wave halted the pipeline — wave 1 did, with exactly the reds v1.2's batch-1 gate wording predicted. Each former RED task is now folded into its GREEN successor as named in-task steps (red observed in-session, then greened), leaving 11 tasks in 7 waves with every wave boundary green. Former ids A6-02/A6-03 → steps of A6-05; A6-07 → A6-08; A6-09 → A6-10; A6-11 → A6-12; A6-13 → A6-14; A6-15/A6-16/A6-17 → A6-18; A6-19/A6-20 → A6-21. References to former ids elsewhere in this document (AT table's Red-test column, red-before-green edges, §1.3 prose) denote those steps, not tasks. |
| 1.5 | 2026-08-19 | **Erratum round 5 — full-interval re-grounding.** v1.4 announced re-grounding on TSPEC v1.10 but re-read only §1.3's drift narrative and §6's routed fork. This revision diffs the **entire** changelog interval — TSPEC v1.7, v1.8, v1.9, v1.10 — and enumerates what was *decided* in it before touching any raised item, per DEC-ERR-01. Two upstream events v1.4 missed, both now carried: v1.9 **withdrew** (and v1.10 restated the withdrawal of) the claim that the example config teaches E-33's "keep the tier on, keep A6 off" pairing — retracted in all four places it appeared, §4.4's key table, §4.4's example paragraph, §4.4's README-disposition close and §5.1's example row — and v1.10 **re-anchored** §1.3's four row-count pins and its PROP-DIS-06 pin to stable content per DEC-DOC-01. v1.7's eight-surface enumeration and v1.8's *(module-private)* marking of `ADVISORY_SEAM_PHASES` were already carried by v1.1–v1.3 and needed no change; nothing else in the interval reached this document. Round-6 findings closed: A6-06 now commits the literal `{"advisory": {"enabled": false, "waveBudgetPerRun": 1}}` — the shipped defaults, tier off — and the "so an operator can tell … `enabled: true`" reasoning is deleted (PM F-02); A6-04 keeps its both-keys assertion but rests it on TSPEC v1.10's surviving justification, the withdrawn "only teaching site / only guard" rationale removed (PM F-01); **every** `file:line` pin in this document is re-anchored to a symbol, block title or quoted assertion per DEC-DOC-01, the swept set re-measured at HEAD rather than assumed — a `\.js:` grep over this file returned only this changelog row (**that recipe was incomplete — it cannot see a bare `:NNNN` pin written without its filename, and one such pin, A6-21's `:14364`, survived it and was stale; corrected in v1.7 with the recipe `grep -nE ':[0-9]{2,}' `, which catches both forms** — PM v7 F-04); no `file:line` pin survives anywhere else, including in the earlier changelog rows, which were re-anchored in place (PM F-03, TE F-02); the Overview's pre-drift enumeration is tense-marked so it cannot be read as HEAD state (PM F-04); the HEAD-drift note's third bullet is rescoped to the **advisory suites**, and the two reds outside them are given named owners and dispositions (TE F-01, TE Q-01/Q-02); batch 1's gate wording states the clean-tree expectation and names the hook-rewritten `.claude/workflows/.pdlc-drift-state.json` (TE F-03, TE Q-03); A6-04's `ci-arrangement.test.js` forward reference retired as already resolved in TSPEC v1.10 (PM F-05); merged-away ids `A6-03`/`A6-09` corrected to step references (PM F-06); A6-01's `SEAMS` retarget restated as landed, not pending (TE F-04); A6-00's `pathsCollide` wording reconciled with the landed file's own header comment (TE F-05). PM F-07 is a cross-review dispatcher wiring defect, not a PLAN defect — routed to LEARNINGS for promotion, not actioned here. |
| 1.7 | 2026-08-19 | **Cross-review round 7 (PM, TE).** `PROP-SWEEP-2(b)`'s residual re-measured at HEAD: **28 paths, not 14**, partitioned by owner — A6-00 closes the 14 `.bak` blobs, the other 14 (consumer-runtime artifacts and this feature's own documents, which A-1's frozen glob list does not cover) are inherited and routed to the coupled sweep's owner, so the DoD no longer promises a green this branch cannot reach (PM F-01). A6-00's untrack step now also adds `.claude/workflows/.pdlc-backups/` to `.gitignore`, since untracking alone would permanently red AT-4.1, the clean-tree precondition this document imposes; `.gitignore` enters A6-00's `Source File` cell and the file-ownership manifest (TE F-01). A6-04 restated as **discharged by verification** — `advisory-config-example.test.js` already exists at HEAD, landed by `e3b9d5a3` alongside `advisoryWaveGate.test.js`, so the Overview's "the second of which is new" was measured wrong (PM F-02). The whole-suite figure is now conditional on tree state — 27/8/3847 clean, 28/9/3846 dirty, the extra member always AT-4.1 — in the Overview and in batch 1's gate wording (PM F-03, TE F-02). A6-00's row split into a *verify* half and an *edit* half so a green pre-flight gate does not read as "nothing to write" (TE F-04), and its T15 bump now renames the test title and restates its block comment alongside the literal (TE F-03). A6-21's bare `:14364` pin re-anchored to the `if (scriptGate) {` arm's unconditional `throw haltError(…)`, and the v1.5 row's grep recipe corrected — it could not see bare `:NNNN` pins (PM F-04). |
| 1.8 | 2026-08-19 | **Cross-review round 8 (PM, TE).** A6-00's task row rejoined into one physical line — blank lines inside it terminated the markdown task table, so `parsePlanTasks` saw one task and every manifest row read as an unknown id (`validatePlanContract` now returns ok: 11 tasks, 7 waves). A6-00's ignore rule changed from `.claude/workflows/.pdlc-backups/` to the bare `.pdlc-backups/`: the anchored spelling would red `documentOracles.test.js`'s green T21 substring assertion, and any L-2 grep term in tracked `.gitignore` would mint a fresh sweep residual (TE F-02). Class 2 of the sweep residual re-grounded as **branch-introduced**, not pre-existing — `git ls-tree` at merge-base `1efb9a3b` is empty for all four and `e3b9d5a3` is their adding commit — and still unreachable, for the `.gitignore`-term reason (TE F-01). Both residual counts dated and given their growth rule (+1 per *committed* cross-review file, PM F-01). DoD's full-suite leg restated as a set-equality on the two expected-failing test titles plus a positive check on `PROP-SWEEP-2(b)`'s printed residual (TE F-03). Overview's landing surface reconciled with the manifest: twelve test files, fixture thirteenth, `.gitignore` named (PM F-02, F-04). A6-21's anchor disambiguated by halt literal and "unconditional" withdrawn (TE F-04, PM F-03). |
| 1.6 | 2026-08-19 | **Sizing appendix cited.** DECISIONS v1.8 relocated its three-column A6 sizing block — the one that carried the HEAD measurements of how many surfaces `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS` touch — out of the decision record and into `docs/pdlc-advisory-wave-gate/SIZING-pdlc-advisory-wave-gate.md`, a PLAN appendix, per POSTMORTEM-D §6 steps 1–2 and PM v8 Q-01. The rationale is that the block's truth conditions move with every commit while a decision record is meant to be stable after approval, and that its consumer is this document's batch sizing. This revision adds the citation: the Overview's HEAD-drift note now points at the appendix for the three-column size, and DECISIONS keeps only column (1)'s four. No task row, batch, wave, dependency edge or file-ownership cell changes — every count in the appendix was re-measured at HEAD in the move and none moved. |
| 1.9 | 2026-08-19 | **Cross-review round 9 (PM, TE).** DoD's positive check on `PROP-SWEEP-2(b)`'s printed residual split by class: set-equality on class 2's four named `.claude/workflows/` runtime artifacts, but a *membership* predicate (`docs/pdlc-advisory-wave-gate/**`, no `.pdlc-backups/*.bak`) on class 3, and the "a fifteenth class member is a regression" sentence deleted — set-equality over a set the pipeline is designed to grow mis-fires at the ship boundary (PM F-01, TE F-01). DoD's inherited-residual bullet stopped restating `28`/`14` and now points at the Overview's dated measurement, the single owner of those figures (PM F-02, TE F-02). Class-2 provenance note names `git ls-tree` at merge-base `1efb9a3b` as the *deciding* leg and marks `git log --diff-filter=A` as corroborating-with-a-caveat: both `.bundle.js` artifacts carry an earlier, superseded add at `3991b4d5` (2026-07-27, ancestor of the merge-base), deleted at `1fb6cbec` and re-added on this branch (PM F-03). PM F-04 (the cross-review dispatcher supplying PLAN headings) is not this document's fix — routed to harvest. No task row, batch, wave, dependency edge or file-ownership cell changed. |
| 1.10 | 2026-08-20 | **Erratum round 10 (Phase F) — re-grounded on upstream HEAD first.** REQ (`sha256:c62cfc35…`, v1.15) and TSPEC (`sha256:3fa21acf…`, v1.11) moved since this document was last grounded on TSPEC v1.10; FSPEC (`sha256:91ef2557…`, v1.6) and DECISIONS (`sha256:84deee10…`) re-read at the same HEAD. **Absorbed (DEC-ERR-03), ahead of the raised item: OQ-7 is closed upstream, in the TSPEC's favour.** REQ `AC-5.1` and FSPEC `BR-9`/`AT-05-1`/`AT-05-2` now state the restoration oracle's **domain** — the path-to-content-hash map ranges over tracked and non-ignored untracked files, generated outputs included, ignored paths excluded **on both sides**, so restoring one *fails* AT-05-1 — and its **observation point** — immediately after restoration completes, before AC-6.1's record append, AC-6.2's escalation-log append and AC-5.2's queue-row write (M-WG-7). This document had been routing that settled question as upstream-pending in four live places, which is DEC-ERR-01's anti-pattern; all four are retired and restated on the decided form: the Overview's *Not in scope here* block (now *Decided upstream, transcribed here*), A6-10's former-A6-09 red step (the `test.todo` pending marker replaced by a live both-sides assertion — the `.skip`-halt reasoning is kept, since it still governs the file), the *Upstream dependency that is still open* subsection (now *…that was open, and is now closed*, closing with **no upstream dependency of this plan is open**), the AT-05-1 row, and the DoD's OQ-7 leg (no longer a disjunction with a pending arm). TSPEC §2.5's mechanism already implemented this boundary, so **no task row, batch, wave, dependency edge or file-ownership cell changed** — re-verified by re-running `parsePlanTasks` → `computeWaves` over the edited table: 11 tasks, 7 waves, unchanged. **Raised item: absorbed, no edit owed.** The Phase F erratum reported a lineage-header `Downstream` row naming the downstream *feature* `pdlc-engineering-loop` instead of the artifacts it feeds. That defect is not in this document and never was: this PLAN's `Downstream` row reads `PROPERTIES`, `IMPL` (correct for a PLAN — a PLAN does not feed FSPEC or TSPEC), and `pdlc-engineering-loop` appears nowhere in this file. The row the item describes is the **REQ's**, and at HEAD it already reads `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)` — fixed upstream before this dispatch. Verified, not edited. |
| 1.11 | 2026-08-20 | **Cross-review round 11 (PM, TE) — re-grounded on upstream HEAD first (DEC-ERR-03).** All four upstream documents moved since v1.10's anchors: REQ v1.15→**v1.16** (`sha256:f97f4f66…`), FSPEC v1.6→**v1.7** (`sha256:d602c440…`), TSPEC v1.11→**v1.13** (`sha256:1f6ea486…`), DECISIONS `84deee10…`→`dc7a8d65…`, each re-computed locally rather than taken from the dispatch. **Absorbed, ahead of the raised items: BR-14 / AC-6.3's operator-facing overwrite warning has landed upstream.** The halt report that points an operator at a captured pre-A6 tree state must state, *in the same place*, that re-running the feature overwrites that capture; FSPEC v1.7 gives AT-06-4 its third conjunct and adds **AT-06-4b**, the no-capture negative arm, and TSPEC v1.12/v1.13 land the mechanism (a fifth halt field `snapshotRef`, rendered by the exported pure helper `renderSnapshotOverwriteNotice`) and the oracles (co-location within one `notices` element, both halves matched by spec-side literals so an imported warning constant cannot echo). A6-18 now carries all of it: the co-location arm on §5.2's two-red-wave fixture, AT-06-4b on the existing E-34 capture-failure fixture, §4.5's **five** halt fields (`snapshotRef: null` among them, transcribed set-equally) and the helper in its green step. The AT table is re-measured against FSPEC §6 and is **forty-eight** rows, set-equal in both directions (verified mechanically, not by count alone). **Raised items.** PM F-01 (High): `ADVISORY_ROOT_CAUSES` moves from set equality to **ordered-sequence** equality against the transcribed literal — the order *is* BR-2's first-matching-class rule under P0 AC-2.2, so a reordering changes whether a two-way failure is authorised under E-6 or E-5 — and A6-05's blanket "set-equality throughout" caption is split by surface. PM F-02: A6-08's `parseA6RootCause` step claims AT-02-1's second arm (E-08b), the arm that makes the ordering load-bearing; the AT-02-1 traceability row now names both halves and both owning steps. TE F-01 (Medium): A6-10's ignored-path case gains TSPEC §5.2 case 4's **positive-presence** conjunct — the hash map cannot falsify a restore-over-ignored-path implementation, since its domain excludes ignored paths on both sides, so the case asserts the `.gitignore`d file is still present after restore (the assertion pinning `clean -fd` over `-fdx`), paired with case 3's absent untracked file. TE F-02: the same row gains case 5's **ordering** conjunct. TE F-03: its first clause gains BR-9 v1.6's *non-ignored* qualifier, which the row's own later sentence already carried. TE F-04: "no upstream dependency of this plan is open" is re-stated on measured evidence — at the reviewed hash DECISIONS did still route the ignored-path boundary as OQ-7-pending, and it has since been re-grounded to record the closure and the unbuilt scoped arm. PM Q-02 taken as housekeeping: the lineage header pins the four upstream versions and hashes and names the two PLAN cross-reviews. **No task row, batch, wave, dependency edge or file-ownership cell changed** — re-verified by re-running `parsePlanTasks` → `computeWaves` over the edited table: 11 tasks, 7 waves. |

---

## Overview

**What gets built.** A sixth advisory seam, `A6`, fires at exactly one place — the Phase I wave
loop's script-owned test gate in `pdlc/workflows/orchestrate-dev.js` — the wave loop's `if (scriptGate)`
arm — the one whose halt literal reads `Error: Wave ${waveNum} test gate failed …`, not the V-wave's
`if (scriptGate)` arm with its `Error: V-wave ${vWaveNum} PROPERTIES test gate failed` literal —
where a failing gate today falls straight through `if (!gate || gate.ok !== true)` to
`throw haltError(…)` with no repair path in between (TE v8 F-04, PM v8 F-03). A6
snapshots the whole tree, attempts one bounded in-envelope repair, re-runs the wave's own gate
sequence, and either resolves the wave or restores the snapshot byte-identically and lets the wave
halt on its pre-A6 literal with a diagnosis attached.

**Where it lands.** One production file: `pdlc/workflows/orchestrate-dev.js` (TSPEC §1.2 — the
workflow runtime loads one bundled artifact, so every advisory-tier symbol lives in one module),
plus one repo-root file: `.gitignore`, which A6-00 edits so the untracked `.pdlc-backups/` directory
— a live write target of the workflow sync path — cannot re-dirty the tree at a later wave boundary
(PM v8 F-04). It is a tree-wide edit, not an advisory-tier one, which is why it is called out here
rather than left to the manifest alone.
**Thirteen** test-side files under `pdlc/workflows/__tests__`, **all thirteen of which exist at HEAD**
(re-counted from the manifest this round — PM v8 F-02, and re-counted again at v1.12 when
`advisoryWaveGateMain.test.js` entered A6-18's owned set, PM v2 F-01):
`advisoryWaveGate.test.js`, called "the one new file (verified absent today)" through v1.3, was
authored early and landed in `e3b9d5a3`; it carries A6-00's pre-flight gate and is the one advisory
suite **green** at HEAD. The twelfth is `documentOracles.test.js`, which joined A6-00's owned set in
v1.7 for the T15 count-literal bump — it is not an advisory suite, but this feature edits it, so it
belongs in the count the manifest has to reconcile with. The thirteenth is
`advisoryWaveGateMain.test.js`, the DC-07 production-path suite that reaches the real seam from
`mainDev` — TSPEC §5.1 gives it an `edited` row because its four-key `expect(result.haltAdvisory).toEqual({…})`
is a set-equality over the *same* halt-fields object A6-18 widens to five, so it reddens in A6-18's
batch unless A6-18 owns it. The manifest's **fourteenth** path under
that directory is the shared fixture `__tests__/helpers/advisoryDoubles.js`, not a `*.test.js` file. One second-channel pair
(`.claude/pdlc.config.example.json`, `pdlc/engine/__tests__/advisory-config-example.test.js`).
**Both members of that pair exist at HEAD**: `git show --name-status e3b9d5a3` lists *two* added
test files, `advisoryWaveGate.test.js` **and** `advisory-config-example.test.js`, so the drift
commit landed two of this plan's "new" test files, not one — earlier revisions of this paragraph
said "the second of which is new" and were measured wrong (PM v7 F-02). TSPEC §5.1's **Status
column caveat** said so before v1.5 was written: "`edited` and `new` describe the file's state, not
the work outstanding". A6-04 is therefore *discharged by verification* on the A6-00/A6-01 pattern,
not an authoring step; see its row. No new module,
no new transport, no new credential.

**Shape of the plan.** Eleven tasks in seven waves, every wave boundary green. Red→green TDD
happens **inside** each merged task, not across waves: the implementer writes the task's red
steps' tests, observes them fail in-session for their named reason, then does the green step and
leaves the whole suite green before committing. This shape is forced, not stylistic:
`implementation.testCommand` in `.claude/pdlc.config.json` runs the **whole** `pdlc/workflows`
suite as a plain exit-code gate at every wave boundary (the `if (scriptGate)` arm), and the gate
has **no expected-red channel** — a wave that ends with any red test halts the pipeline, which is
exactly what the v1.2 plan's RED-terminal wave 1 did. The `orchestrate-dev.js` single-writer rule
still holds: exactly one task per wave owns the production file.

**Two facts about this feature that shape the batching.**

1. **The feature is not purely additive** (TSPEC §1.3). Eight shipped surfaces are coupled to the
   seam set's cardinality. Through v1.3 this plan described them as transcribing **five** members
   today and going red "the moment `ADVISORY_SEAMS` gains `A6`". That is no longer the state of the
   repository: commit `e3b9d5a3` landed the test-side retargeting of these surfaces early, so they
   already assert **six**, while the production constant still exports five — **the advisory suites
   are red at HEAD, before Phase I writes a line.** The eight surfaces are still exactly these:
   `advisoryEnvelope.test.js`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`,
   `advisoryRecord.test.js`, `__tests__/helpers/advisoryDoubles.js` (its `SEAMS` literal),
   `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` (keys compared to `ADVISORY_SEAMS` in the
   `registered gate-exclusivity case names cover exactly ADVISORY_SEAMS, as a set` assertion), and two
   **bare row-count** surfaces a member-literal grep does not find because they name no seam:
   `advisoryDisabled.test.js`'s `T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)`
   block and `advisoryQueueSeams.test.js`'s `ADVISORY_SEAMS drives the row list (S-1)` assertion, the
   queue's share of the same `advisorySummaryRows` list that `ADVISORY_SEAMS` drives (exported from
   `orchestrate-dev.js`, imported and called in `orchestrate-queue.js`'s report builder). Wave 1
   accounts for all eight
   **before** its own green step touches the constant, so the red is the intended signal and never
   a mystery red discovered mid-wave. At HEAD that accounting is mostly *verification* rather than
   editing: seven of the eight already read six (see the HEAD-drift note below).

   **Pre-drift enumeration, kept for provenance — not a description of HEAD.** Through v1.3 those two
   sites read `expect(result.advisory.rows).toHaveLength(5)` and
   `expect(report.advisory.rows).toHaveLength(5)` respectively, and the enumerating grep found only
   them. Re-running it returns **four** bare row-count sites, not two: the
   `T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)` block in
   `advisoryDisabled.test.js`, the `ADVISORY_SEAMS drives the row list (S-1)` assertion in
   `advisoryQueueSeams.test.js`, and **both** sites in `advisoryHarvest.test.js` — the one immediately
   above that file's `seamNames` literal in the `T-08-6 — only seam A4's disposition fired; the report
   still lists all five seams` block, and the one in the `T-08-8 — a queue invocation that adjudicated
   A1/A2 and picked nothing` block. The last is the site a
   seam-literal instruction cannot reach — its neighbourhood is a member lookup
   (`rows.find((r) => r.seam === "A1")`), never a member list — which is why the rule, not the
   snapshot, is what A6-05's former-A6-03 red step and batch 1's gate wording carry. All four are
   owned by that step, in batch 1. **At HEAD all four already read `toHaveLength(6)` and no
   `toHaveLength(5)` survives anywhere in the advisory suites** (measured this round); the `(5)`
   quotations above describe the tree before `e3b9d5a3`, and the HEAD-drift note below governs.

   The enumeration bar this list has to clear is *transcription sites*, not *member literals*:
   a row-count assertion is as coupled to `ADVISORY_SEAMS`'s cardinality as a seam-name list is,
   and greps for `"A5"` or `SEAMS` miss it. Batch 1's set is derived by grepping the suite for
   `advisory.rows` and `toHaveLength` as well as for seam members.

   **HEAD drift, and the remedy this plan takes.** TSPEC §1.3 records that `e3b9d5a3` landed the
   test-side A6 transcription ahead of Phase I, and TSPEC §6 explicitly routes the remedy to this
   document: revert those edits and let Phase I redo them in plan order, or keep them and re-derive
   the A6 batches around what already landed. **This plan keeps them and re-derives.** Three
   measured reasons:

   - **The baseline is intact, and the gate written to prove it says so.** A6-00's pre-flight gate
     is itself part of what landed (`advisoryWaveGate.test.js`), and it is **green** at HEAD: every
     export it names still resolves. The drift is confined to the seam-cardinality surfaces this
     feature was always going to rewrite — it is not baseline rot, which is the condition A6-00
     exists to catch.
   - **What landed is what this plan already asked for, minus one line.** Measured at HEAD, seven of
     the eight surfaces already assert six members, and no `toHaveLength(5)` remains anywhere in the
     advisory suites. The single untranscribed residue is in `advisoryRecord.test.js`, under
     *"PROP-SUM-01 — advisorySummaryRows always emits five rows, zero counts included"*, whose
     *"an empty disposition list still produces all five seams with zero counts"* case still asserts
     `expect(rows.map((r) => r.seam)).toEqual(["A1" … "A5"])`; the sibling `test.each(["A1" … "A6"])`
     under *"T-08-10 / PROP-SUM-02 — the literal six-row summary table and the invocation identity"*
     *was* retargeted. Reverting would discard correct work in order to re-type it.
   - **No re-batching is required, because the red closes exactly where the plan already closes it.**
     Every failure **in the advisory suites** at HEAD is a *production*-side absence, and every one is
     supplied by A6-05's green
     step: `ADVISORY_SEAMS` + `A6`, `ENVELOPE_DEFAULTS` `E-5`/`E-6`, `ADVISORY_ROOT_CAUSES`,
     `A6_PROHIBITIONS`, and `ADVISORY_DEFAULTS.waveBudgetPerRun`. Verified by running the suites:
     19 failures across `advisoryEnvelope`, `advisoryConfig` and `advisoryRecord`, plus 5 more across
     `advisoryDriver`, `advisoryHarvest`, `advisoryDisabled` and `advisoryQueueSeams` —
     `advisoryDriver`'s PROP-GATE-06 included, which compares the test-side
     `GATE_EXCLUSIVITY_REGISTRY`'s six keys against the five-member production constant and goes
     green on the same edit. None of them needs a later wave's production arm, so the wave map and
     `Batch` column are unchanged from v1.3.

     **The scope of that claim is the advisory suites, and it is not the whole tree.** The whole-tree
     figure is **state-dependent, and must be read conditionally** — the unconditional
     "9 suites / 28 failed / 3846 passed" earlier revisions pinned holds only on a *dirty* tree
     (PM v7 F-03, TE v7 F-02). Measured this round with `cd pdlc/workflows && npm test` at HEAD on a
     tree satisfying this document's own clean-tree precondition:

     | Tree state | Suites failed | Tests failed | Passed | Failing set |
     |---|---|---|---|---|
     | Clean (`git status --porcelain` empty) | **8** | **27** | **3847** | 24 advisory + 3 in `documentOracles.test.js` |
     | Any dirty *tracked* path | 9 | 28 | 3846 | the above **+ AT-4.1** in `consumerCleanup.test.js` |

     The enumeration, not the total, is the invariant: 24 advisory failures plus three in
     `documentOracles.test.js` always, plus AT-4.1 **iff** a tracked file is dirty. An implementer
     who satisfies the clean-tree precondition will see 27/8/3847; one who has let the `SessionStart`
     hook rewrite `.claude/workflows/.pdlc-drift-state.json` will see 28/9/3846 and the extra member
     is AT-4.1, never anything else. Each red is named below with an owner and a disposition rather
     than left to be rediscovered at a wave boundary:

     - **`documentOracles.test.js`'s T15 count literal.** The
       `post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99`
       test asserts the directory holds 99 `*.test.js` files; `e3b9d5a3` took the count to **100** by
       landing `advisoryWaveGate.test.js`. **Owner: this feature, in A6-00**, which already owns that
       file and is the task whose existence explains the extra entry. A6-00's step list therefore gains
       the literal bump from 99 to 100 with the reason recorded in the comment above it. This is
       deliberately *not* left to the coupled sweep whose deletions minted the literal (TE Q-01): the
       sweep's own count was correct when written, and two documents each assuming the other bumps it
       is exactly how the red survives to Phase PUB. A6-00's `Test File` cell gains
       `pdlc/workflows/__tests__/documentOracles.test.js` so the manifest carries the edit.
     - **PROP-SWEEP-2(b)'s residual is 28 paths at the 2026-08-19 measurement, not 14, and only 14
       of them are this feature's to close.** Earlier revisions said the oracle "went from `0` to `14` residual paths when
       `e3b9d5a3` committed `.claude/workflows/.pdlc-backups/*.bak`" and dispositioned the whole red
       as closing "for free" once those blobs are untracked. Re-measured this round by running the
       test at HEAD, the residual is **28 paths** and partitions into three classes with three
       different owners (PM v7 F-01, TE v7 F-01):

       | Class | Count | Paths | Owner / disposition |
       |---|---|---|---|
       | Backup blobs `e3b9d5a3` committed | 14 | `.claude/workflows/.pdlc-backups/*.bak` | **This feature, A6-00** — untrack and ignore; closes 14 of 28 |
       | Consumer-runtime artifacts | 4 | `.claude/workflows/.pdlc-drift-state.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs` | **Branch-introduced, still not closable here** — see the provenance note below |
       | This feature's own artifacts | 10 at the 2026-08-19 measurement, +1 per committed cross-review file | `TSPEC-`, `PLAN-`, `DECISIONS-`, `PROPERTIES-pdlc-advisory-wave-gate.md` and the `CROSS-REVIEW-*` files that quote L-2's terms | **Coupled sweep's A-1 glob list** — out of scope here, see below |

       **Provenance of class 2, corrected (TE v8 F-01).** Earlier revisions routed the four
       consumer-runtime artifacts to the coupled sweep on the ground that they "predate this branch".
       They do not. **The deciding measurement is `git ls-tree` at the merge-base `1efb9a3b`**, which
       returns empty for each of the four: none of them exists in the tree this branch forked from,
       so none predates the branch. `git log --diff-filter=A` corroborates — it names `e3b9d5a3`, the
       same drift commit that landed the 14 `.bak` blobs — **but read it with a caveat** (PM v9 F-03):
       for the two `.bundle.js` artifacts it prints *two* adding commits, the older `3991b4d5`
       (2026-07-27) being an ancestor of the merge-base. Those two were added there, deleted in
       `1fb6cbec` (2026-07-29), and re-added on this branch, so the log's earlier line is a
       superseded add. A reader who runs that command and reads its last line would wrongly conclude
       "pre-existing"; the `ls-tree`-at-merge-base leg is the one that decides. Class 2 is therefore branch-introduced, exactly like
       class 1. It is still **not closable by A6-00**, but for a different and narrower reason than
       provenance: every ignore rule that would cover these paths writes an L-2 grep term into tracked
       `.gitignore` (`.pdlc-drift-state.json` contains `pdlc-drift`; both bundles contain `.bundle.js`),
       which mints a fresh residual path at the same site it closes four — and deleting them from disk
       is not durable either, since the `SessionStart` hook rewrites `.pdlc-drift-state.json` and
       `runtime-adapter.js` reads `.claude/workflows/pdlc-cli.mjs` by on-disk path. So the split is
       **14 closable here / 14 not**, with 4 of the 14 correctly described as branch-introduced-but-
       unreachable rather than inherited, and the remedy for those four (extend A-1's glob list, or
       amend T21 and ignore them) routed to the coupled sweep's owner with that reason attached.

       **Both counts are measurements with a date, not invariants.** The 28 above was re-derived on
       2026-08-19 at this round's HEAD on a clean tree. Class 3 grows by exactly one path per
       *committed* cross-review file — the sweep reads `git ls-files`, so an uncommitted review is
       invisible to it and a full round (PM + TE) adds two, not one. A reader who measures a different
       total should check the class-3 count first and the 14/14 split second; only the split is a claim
       about this plan.

       The third class is not incidental and **cannot be closed on this branch**. `unfilteredSweep()`
       greps every *git-tracked* file for L-2's seven terms, and `minusA1` subtracts a frozen glob
       list that covers `docs/pdlc-plugin-retirement/**`, `**/LEARNINGS-*.md` and `**/POSTMORTEM-*.md`
       but **not** `docs/{feature}/` specs and **not** `CROSS-REVIEW-*` — so this PLAN is in its own
       residual by virtue of naming `pdlc/hooks/scripts/sync-workflows.sh` in its own Definition of
       Done, and **every further cross-review round this pipeline writes adds another path**. No act
       available to Phase I makes that set empty; only extending A-1's glob list does, and A-1 is the
       coupled sweep's frozen artifact.

       **Dispositions.** (1) **A6-00 closes the 14 blobs**: `git rm --cached` them *and* add the
       bare rule `.pdlc-backups/` to `.gitignore` in the same step (that literal — an anchored
       `.claude/workflows/…` spelling would red `documentOracles.test.js`'s currently-green T21
       substring assertion; see A6-00's Edit 1), because the files stay on
       disk, the path is not ignored today (`git check-ignore` returns nothing), and the directory is
       a live write target of the workflow sync path — untracking alone converts 14 tracked blobs
       into 14 `??` lines and permanently reds `consumerCleanup.test.js`'s AT-4.1, the very
       clean-tree precondition this document imposes at every wave boundary (TE v7 F-01). With the
       ignore rule the tree stays clean and future `.bak` writes do not re-dirty it. Because
       `.gitignore` is now an *edited source file* and no other task owns it, A6-00's `Source File`
       cell and the file-ownership manifest name it. (2) **The remaining 14 paths — class 2's four
       branch-introduced-but-unreachable artifacts and class 3's 10 growing documents — are an
       out-of-scope red**, routed to the coupled sweep's owner exactly as `AT-22` already is: this
       branch does **not** promise PROP-SWEEP-2(b) green, and the Definition of Done records it as
       inherited rather than as a gating item this plan can satisfy. Promising a green the branch
       cannot reach is how the residue gets discovered at PUB instead of at A6-00.
     - **`documentOracles.test.js`'s `AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty
       post-landing`.** Not this feature's and not `e3b9d5a3`'s: the test name carries its own
       red-until marker for the coupled sweep's L-06, and `coveredViolations` walks the entire tree
       under `root` skipping only `.git/` and `node_modules/`, so any untracked local file — tool
       cache, editor backup, database — reddens it. **Disposition: out of scope, do not close, do not
       escalate.** It is listed here only so an implementer who sees 27 (or 28) rather than 24 failures can
       account for the difference without treating it as drift.
     - **`consumerCleanup.test.js`'s `AT-4.1: full-set cleanup removes all nine expected entries and
       the emptied directory, tracked files unchanged, exit 0`.** It asserts `git status --porcelain`
       over the repo root is empty, so it fails on **any** dirty tracked file. See batch 1's gate
       wording for the clean-tree precondition this imposes on every wave boundary, not just wave 1's.

     None of these reds is closed by the configured wave gate, which carries
     `--testPathIgnorePatterns … 'documentOracles'` — but the DoD's own
     `cd pdlc/workflows && npm run test:coverage` leg and `.github/workflows/pr-tests.yml`'s
     unit-tests job both run without those patterns, so an unowned red here fails the DoD and reddens
     the PR even though no wave halts on it.

   Two consequences the implementer carries. First, **wave 1 is the only wave whose red is inherited
   rather than authored**: A6-05's red steps open on an already-red suite, so "observe the red for
   its named reason" means confirming the named failures are present and are the listed ones, not
   producing them. Second, several retargeted tests still carry **stale names** describing the old
   cardinality (`… report still five seams`, `… reports five zero rows`); the assertions are correct
   at six and the names are cosmetic residue of `e3b9d5a3`. A6-05's red steps rename them in place —
   a red test whose name contradicts its assertion is the next reader's trap.
   **The three-column size this drift analysis feeds is in a PLAN appendix, not in DECISIONS.**
   `docs/pdlc-advisory-wave-gate/SIZING-pdlc-advisory-wave-gate.md` carries the enumeration behind
   A6-05's "verification, not editing" wording: column (1), the **four** gate-demanded edits (three
   production constants plus `advisoryRecord.test.js`'s `PROP-SUM-01` seam equality) that this plan
   budgets as real work; column (2), the **twelve** sites already at the post-A6 value — ten oracles
   red at HEAD that go green on A6-05's green step alone, and two green inputs — which is where the
   24 advisory failures above are partitioned site by site; and column (3), the **twenty-five**
   ungated prose surfaces an editor reads but no gate demands, with the grep recipe for re-deriving
   them. It also carries the excluded false positives and the `dist/pdlc-cli.mjs` disposition. The
   appendix was moved there from DECISIONS v1.7 because those totals are measurements of a moving
   tree whose consumer is this document's batch sizing (POSTMORTEM-D §6 steps 1–2, PM v8 Q-01);
   DECISIONS now keeps only column (1)'s four. Re-measure it, do not carry it forward, before
   sizing any A6-05 successor.

2. **Almost all production code lives in one file.** Batch-safety rule 2 (single writer per file per
   batch) therefore serialises the implementation tasks completely: `orchestrate-dev.js` is written
   by exactly one task per batch, and parallelism exists only among test-side tasks in the odd
   batches.

**Decided upstream, transcribed here.** OQ-7 (`.gitignore`d paths inside BR-9's restoration oracle)
is **closed**, in the TSPEC's favour — it is no longer pending and this document no longer routes it.
FSPEC `BR-9` / `AT-05-1` / `AT-05-2` at v1.6 and REQ `AC-5.1` at v1.15 state both halves of the
boundary A6-10 has to transcribe:

- **Domain** — the path-to-content-hash map ranges over tracked and **non-ignored** untracked files,
  generated outputs included. Ignored paths are excluded **on both sides**, so an implementation that
  restores one *fails* AT-05-1 rather than passing it. AC-5.1's words: ignored paths "are operator
  files A6 never wrote and never restores over."
- **Observation point** — the map is taken immediately after restoration completes and **before** the
  record carriers the run still owes: AC-6.1's record append, AC-6.2's escalation-log append, and
  AC-5.2's queue-row write (M-WG-7). Those writes are the halt's, not a restoration defect (FSPEC E-23).

TSPEC §2.5's mechanism already implements exactly that boundary, so no task, batch, wave, dependency
edge or file-ownership cell moves. What changes is that A6-10's ignored-path case is now a **real,
asserted case** with a known expected value, not a pending marker — see its row.

## Batches

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

`Batch` is derived mechanically and is the dispatcher's contract, not documentation:
`batch == max(batch of deps) + 1`, sources in batch 1, **and no more than five tasks per batch** —
`computeTopologicalBatches` (in `pdlc/workflows/orchestrate-dev.js`) splits a wider topological layer
into sub-batches of at most five, so a six-wide layer here would be re-labelled by the
dispatcher rather than run as written. Batch 1 is four tasks and stays under that cap; every
batch's members are pairwise file-disjoint, so `computeWaves` keeps each batch as exactly one wave
(verified by running `parsePlanTasks` → `computeWaves` over this table: 11 tasks, 7 waves).

Merged tasks (v1.3) carry their former RED tasks as **named in-task steps** — e.g. A6-05's row
begins with the former A6-02 and A6-03 red steps and ends with the green step. A step id such as
`A6-02` is not a task and never appears in a `Deps` cell; it names a stage inside its owning
task's session, and other sections of this document that cite it (the AT table's Red-test column,
the red-before-green table) mean that stage.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| A6-00 | **Pre-flight gate.** Assert the shipped advisory-tier baseline this feature extends is importable at HEAD: `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry`, `resolveAdvisoryRung`, `parseAdvisoryVerdict`, `renderAdvisoryEntry`, `computeWaves`, `parsePlanOwnership`, `commitPaths`, `gitWithLockRetry`, `checkWaveUnskips`, `effectiveGuardPaths`. Existence only, never shape. **`pathsCollide` is deliberately not on this list**: it is declared `function pathsCollide(a, b)` in `orchestrate-dev.js` with no `export` and is referenced only internally, so an import-based existence assertion would fail at HEAD and open batch 1 on a red this gate's own wording would misread as "PLAN invalid". Its behaviour is proved transitively through A6-08's former-A6-07 `ownedSetCovers` trailing-slash cases, and **A6-05 exports only `computeWaves` directly** — the wording the landed file's own header comment carries, which this row must match because the row instructs the implementer to compare the two (TE F-05; earlier drafts of this row said "A6-05 exports it if and only if A6-07 ends up importing it directly", which the file never adopted). **Already landed and green at HEAD.** This file was authored early in `e3b9d5a3`; it exists, its export-existence table matches the list above, and it is the one advisory suite passing at HEAD. The task is therefore *discharged by verification*: re-run it, confirm green, and confirm the export list still matches this row before wave 1's other tasks proceed. It keeps its wave-1 slot and its zero-dependency position precisely because its answer is the precondition for trusting the rest of the drift analysis — a red here would mean the baseline rotted underneath `e3b9d5a3`, which is a different and worse problem than the seam-cardinality drift the Overview's HEAD-drift note resolves. Do not re-create the file. **The row has a verify half and an edit half — the gate being green does not mean there is nothing to write here** (TE v7 F-04). *Verify:* re-run `advisoryWaveGate.test.js`, confirm green, confirm the export list still matches this row. *Edit — two authored changes the pre-flight suite cannot observe, so a green gate never signals them done:* **Edit 1 — untrack and ignore the backup blobs.** `RMC` the 14 tracked `.claude/workflows/.pdlc-backups/*.bak` blobs **and** add the **bare directory rule** `.pdlc-backups/` to `.gitignore` in the same step — that exact literal, not an anchored path. Both halves are required: the blobs stay on disk and the path is not ignored today (`git check-ignore` returns nothing for them), so untracking alone turns 14 tracked files into 14 `??` lines and permanently reds `consumerCleanup.test.js`'s AT-4.1 — the clean-tree precondition this document imposes at *every* wave boundary — and the directory is a live write target of the workflow sync path, so new `.bak` files would re-dirty the tree at later boundaries anyway (TE v7 F-01). **Two constraints fix the rule's form, both measured this round (TE v8 F-02):** (i) `documentOracles.test.js`'s T21 case *".gitignore carries no row whose only purpose is the consumer runtime copy, and its ~20-line rationale block is gone with it"* is **green at HEAD**, and its first assertion is an unscoped substring check — `expect(gitignore).not.toEqual(expect.stringContaining(".claude/workflows/"))` — so any rule that spells the path out reddens a currently-passing oracle despite the case's purpose-scoped title; (ii) `.gitignore` is itself git-tracked, so a rule containing any of L-2's seven grep terms (`pdlc-drift`, `\.bundle\.js`, `sync-workflows`, …) would make `.gitignore` a **new** `PROP-SWEEP-2(b)` residual path. `.pdlc-backups/` clears both: it carries neither the `.claude/workflows/` substring nor any L-2 term, and a trailing-slash pattern with no interior slash matches that directory at any depth. This closes **14 of `PROP-SWEEP-2(b)`'s 28 residual paths**; the other 14 are not closable here — see the Overview's HEAD-drift note, where constraint (ii) is also why the four consumer-runtime artifacts stay open even though they are branch-introduced, not inherited. `.gitignore` is an edited source file owned by this task and by no other, hence its `Source File` cell and manifest row. **Edit 2 — bump T15's count literal, its title, and its comment together.** In `documentOracles.test.js`, change the assertion from `99` to `100`; **rename the test title in the same edit** — it reads `post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99` and would otherwise ship a name asserting 99 over code asserting 100, exactly the stale-name trap this plan makes A6-05 fix in the advisory suites (TE v7 F-03); and restate the block comment above it, which says "the post-sweep `*.test.js` literal only holds once class 6 … lands" — after this edit the literal is a *pre*-sweep count of 100 that the coupled sweep must re-derive when its deletions land, and the cited authority (another feature's TSPEC §4.4) still says 99, so the comment must name the coupling rather than leave the next reader to infer it. Both edits are done here, at the zero-dependency slot, so no later wave's `test:coverage` leg or PR job inherits them. `documentOracles.test.js`'s `AT-22 [red-until-L-06]` failure is **not** closed here and is not drift: it belongs to the coupled sweep's L-06 and reddens on any untracked file in the tree. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/__tests__/documentOracles.test.js` | `.gitignore` | 1 | — | ⬚ |
| A6-01 | **[Fake first]** Test doubles and fixtures for A6: a recording `_git` double (argv-verb counting — per TSPEC §5.2 the counted quantity is `commit-tree`, never the raw call count, because `restoreTreeSnapshot` drives the same transport), a real-repository fixture builder (`mkdtempSync` + `execFileSync("git", …)`, the shape `createTempA3Repo` under *"T-05-5 — A3's working tree is byte-identical to its pre-invocation state (real git repo)"* in `pdlc/workflows/__tests__/advisoryDodSeams.test.js` already ships), an A6 agent double emitting `ROOT-CAUSE:` / `PROMOTES:` / `PROMOTES-TASK:` trailers, and the `SEAMS` literal at six members. **The `SEAMS` retarget already landed in `e3b9d5a3` and is green at HEAD**: the literal reads `["A1", "A2", "A3", "A4", "A5", "A6"]` (verified). Like A6-00, that part of this task is *discharged by verification* — confirm the six-member literal and the A6 double, do not re-type them; the doubles, fixture builder and agent-double trailers are the authored work that remains. | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | — | 1 | — | ⬚ |
| A6-04 | **RED at HEAD, and discharged by verification — do not re-author.** `pdlc/engine/__tests__/advisory-config-example.test.js` **already exists**, landed by `e3b9d5a3` (`git show --name-status e3b9d5a3` lists two added test files, not one), and its content is already the expectation this row describes, header comment and all. Like A6-00 and A6-01, this task is therefore *verify, not write*: re-run `cd pdlc/engine && npm ci && npm test`, confirm the file's assertions still match TSPEC §4.4's key table, confirm it is red for the one stated reason (`.claude/pdlc.config.example.json` carries no `advisory` section until A6-06), and **do not re-create the file** — re-authoring it loses the landed header rationale (PM v7 F-02; TSPEC §5.1's Status column caveat: "`edited` and `new` describe the file's state, not the work outstanding"). The expectation the landed file carries, restated here as the verification target: the example config's `advisory` section parses and carries **both** `enabled` and `waveBudgetPerRun`, the latter a non-negative integer (TSPEC §4.4, §5.1). Both keys are asserted, not just the budget, for the reason TSPEC v1.10 states: the example carries the **shipped-default pairing** `{"enabled": false, "waveBudgetPerRun": 1}`, `enabled` travels in the same shipped unit as the budget because the reader needs the tier's ship state beside it, and an expectation naming only `waveBudgetPerRun` would stay green if a later edit dropped `enabled`. It is **not** asserted because the example teaches E-33's `waveBudgetPerRun: 0`-with-`enabled: true` affordance — TSPEC v1.9 withdrew that claim and v1.10 restated the withdrawal in all four places it appeared; the `0` affordance is carried by behaviour and its tests (the new `nonNegativeInt` validator plus AT-07-2b) and has **no documentation carrier in this feature at all**. `enabled` is asserted **present, not pinned to a value** — TSPEC §4.4 scopes non-negativity to "the latter" and asks only that `enabled` be carried, so a future operator-facing example that flips the demo value must not redden the engine suite (PM v4 Q-01, answered here so the implementer need not guess). The expectation is deliberately **not** hung on `pdlc/engine/__tests__/ci-arrangement.test.js`, which declares itself in its own header comment the single oracle for FSPEC §5.1's CI arrangement — `pr-tests.yml` job-name expansion and the `publish.yml`/PR-gate command set-equality — and carries zero occurrences of `advisory` today (verified). It does already read the example config and assert `implementation.testCommand` on it (annotated in-file as unrelated to §5.1), so the reason to open a purpose-named file is not that the file never reads this config — it is that a config-schema red there would block delivery on an oracle whose stated scope names no such check. Hanging a config-schema assertion there would let an unrelated config-example edit redden the delivery-blocking `Engine tests (ubuntu-latest)` required check. TSPEC §5.1's file map now names `pdlc/engine/__tests__/advisory-config-example.test.js`; its erratum landed in v1.10 and its row records that earlier drafts named `ci-arrangement.test.js`, so this row and upstream agree with nothing pending. | `pdlc/engine/__tests__/advisory-config-example.test.js` | — | 1 | — | ⬚ |
| A6-05 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-02):** **RED** — the two constant-surface suites. `advisoryEnvelope.test.js`: `ADVISORY_SEAMS` six members, `ENVELOPE_DEFAULTS` `E-1`…`E-6`, `ADVISORY_ROOT_CAUSES` compared by **ordered-sequence** equality against the transcribed literal `["plan-ordering-defect", "wave-internal-defect", "environmental", "unclassified"]` — FSPEC `AT-02-1` at v1.6 requires order, not membership, because the order *is* `BR-2`'s first-matching-class rule under P0 `AC-2.2`: a reordering silently changes whether a two-way failure is authorised under `E-6` or under `E-5`, and set equality would pass it (PM v1 F-01), `A6_PROHIBITIONS` `["f","g","h","i"]`, `ADVISORY_REFUSAL_REASONS` ordered-sequence (eight members, unchanged — capture failure adds no ninth), `ADVISORY_EXCLUSIONS` ordered-sequence. `advisoryConfig.test.js`: the re-declared `ADVISORY_DEFAULTS` literal gains `waveBudgetPerRun: 1`, and the new validator's arms — `0` is a legal configured value (E-33), `-1` / `1.5` / `"x"` / `null` are invalid and fall back per key. Set-equality on the unordered surfaces; **ordered-sequence** equality on the three whose order is load-bearing spec content (`ADVISORY_ROOT_CAUSES` per `BR-2`, `ADVISORY_REFUSAL_REASONS` per `BR-15`, `ADVISORY_EXCLUSIONS` per `BR-5`); never `toContain` on any of them. Covers AT-01-1, AT-02-1, AT-03-1, AT-03-7, AT-03-8, AT-07-2b, AT-07-2 (these two files' share). **Red step (former A6-03):** **RED** — the collateral transcription surfaces among the eight §1.3 names, carried to six seams in one task so the intended red is one edit's consequence and never a mystery. At HEAD most of this step is **verification, not editing**: `e3b9d5a3` already retargeted these sites, so the implementer confirms each reads six and transcribes only the residue. Per surface: `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` gains its `A6` row (keys compared to `ADVISORY_SEAMS` in the `registered gate-exclusivity case names cover exactly ADVISORY_SEAMS, as a set` assertion); `advisoryRecord.test.js`'s per-seam `rows.map((r) => r.seam)` `test.each` gains a sixth row; `advisoryHarvest.test.js` and `consolidationProperties.test.js` retarget their seam literals; and the **four bare row-count assertions** retarget `5` to `6` — the `T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)` block in `advisoryDisabled.test.js` (whose per-row `invocations === 0` loop already covers the new A6 row unchanged), the `ADVISORY_SEAMS drives the row list (S-1)` assertion in `advisoryQueueSeams.test.js`, and **both** sites in `advisoryHarvest.test.js` — the one immediately above that file's `seamNames` literal, in the `T-08-6 — only seam A4's disposition fired; the report still lists all five seams` block, and the one in the `T-08-8 — a queue invocation that adjudicated A1/A2 and picked nothing` block, whose neighbourhood is a member *lookup* (`result.advisory.rows.find((r) => r.seam === "A1")`) rather than a member list, so an instruction to retarget seam literals never reaches it. All four sites flip `5` → `6` in this task; `advisoryHarvest.test.js` has no other owning task, so any site left unnamed here reddens batch 2 under a gate that forbids batch 2 touching this file. **At HEAD all four already read `toHaveLength(6)`** — verified, with no `toHaveLength(5)` remaining in the advisory suites — so this step confirms them rather than editing them. All four are folded into this existing batch-1 task rather than given a sixth batch-1 task of their own: batch 1 already sits on `computeTopologicalBatches`' five-task sub-batch cap, and a sixth task would shift every downstream `Batch` value by one. Transcription only — AC-6.x behaviour lands in A6-18's former-A6-16 red step, the driver's new arm in A6-12's former-A6-11 red step, and A6-21's former-A6-20 red step still owns `advisoryDisabled.test.js`'s disabled-path byte-identity work in batch 7. **The one genuine transcription left at HEAD:** `advisoryRecord.test.js`'s `expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5"])` equality still reads five, while its sibling `test.each(["A1", … "A6"])` a few lines below already carries `A6`. This single line is the whole editing content of this red step; leaving it unretargeted reddens wave 1's boundary after the green step lands, under a gate that forbids a later batch touching this file. Also in this step: **rename the retargeted tests whose names still describe the old cardinality** (`advisoryHarvest.test.js`'s "report still five seams", `advisoryDisabled.test.js`'s "reports five zero rows", and the queue-report siblings) — their assertions are already correct at six and only the names are `e3b9d5a3` residue. **Green step (A6-05 proper):** **GREEN** — constants and vocabularies (TSPEC §3.1), all in `orchestrate-dev.js`'s advisory constants block: `export const ADVISORY_SEAMS` + `A6`, `export const ENVELOPE_DEFAULTS` + `E-5`, `E-6`, new frozen `ADVISORY_ROOT_CAUSES` and `A6_PROHIBITIONS`, `export const ADVISORY_DEFAULTS` gaining `waveBudgetPerRun`, the module-private `const ADVISORY_SEAM_PHASES` gaining `A6 = {id: "I", outcome: "halted"}` (left unexported per TSPEC §3.1), and `parseAdvisoryConfig`'s one new key through a new `nonNegativeInt` sibling of the shipped `const positiveInt` — the shipped validator requires `v >= 1` and E-33 requires `0` to survive. The red steps' transcriptions coordinate with wave-1 siblings A6-01 (doubles' `SEAMS` literal) and A6-00 at the wave gate, not before it. | pdlc/workflows/__tests__/advisoryEnvelope.test.js, pdlc/workflows/__tests__/advisoryConfig.test.js, pdlc/workflows/__tests__/advisoryDriver.test.js, pdlc/workflows/__tests__/advisoryRecord.test.js, pdlc/workflows/__tests__/advisoryHarvest.test.js, pdlc/workflows/__tests__/consolidationProperties.test.js, pdlc/workflows/__tests__/advisoryDisabled.test.js, pdlc/workflows/__tests__/advisoryQueueSeams.test.js | pdlc/workflows/orchestrate-dev.js | 1 | — | ⬚ |
| A6-06 | **GREEN** — the example config gains its **whole** `advisory` section, not just `waveBudgetPerRun`. The committed literal is exactly `{"advisory": {"enabled": false, "waveBudgetPerRun": 1}}` — **the shipped defaults, tier off**, per TSPEC §4.4 and §5.1's file-map row. `enabled` travels beside the budget because the example must show the state an operator actually inherits, and `enabled: false` keeps it honest about the tier's ship state. It does **not** ship `enabled: true`, and it does **not** teach E-33's `waveBudgetPerRun: 0`-with-`enabled: true` affordance: TSPEC v1.9 withdrew that claim and v1.10 restated the withdrawal, and shipping `true` here would flip the advisory tier **on by default** for every repo that copies this example — a user-visible default-behaviour change no REQ requirement asks for, and one that contradicts the tier's own shipped default. The file carries no `advisory` section at all today (verified). Since JSON admits no comments, the section carries the shipped defaults and nothing more; the `0` affordance has no documentation carrier in this feature at all and **no `pdlc/README.md` edit is in scope.** The file carries zero occurrences of `advisory` at HEAD, so there is no section to join; no REQ/FSPEC/TSPEC row asks for one (TSPEC §5.1's file map carries no README row); this task's `files` list commits only `.claude/pdlc.config.example.json`, and the wave loop's commit arm iterates exactly `task.files` (`for (const task of wave) { const paths = … task.files … await commitPaths({paths, …}) }` in `orchestrate-dev.js`), so a README edit would strand uncommitted; and `pdlc/engine/__tests__/docs-uniqueness.test.js` line-pins two `claude plugin install` lines in `pdlc/README.md`, so an inserted line would redden the delivery-blocking `Engine tests (ubuntu-latest)` check. **Verification obligation:** because `implementation.testCommand` scopes the wave gate to `pdlc/workflows` only, neither A6-04's red nor this green is checkable by the in-pipeline batch gate — the implementer runs `cd pdlc/engine && npm ci && npm test` explicitly in this task and in A6-04, rather than discovering a wrong expectation twelve batches later in Phase PUB's `Engine tests (ubuntu-latest)` check. | — | `.claude/pdlc.config.example.json` | 2 | A6-04 | ⬚ |
| A6-08 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-07):** **RED** — pure helpers (TSPEC §3.4, §3.3): `waveOwnedPaths` / `laterOwnedPaths` as unions of `task.files` over the wave and over every later wave, read from what `computeWaves` already annotates; `ownedSetCovers` delegating to `pathsCollide`, including the operator-visible trailing-slash precondition (`a/b/` covers `a/b/c.js`, `a/b` does not); `parseA6RootCause` total over absent, wrong-cased and out-of-set trailers, **plus FSPEC `AT-02-1`'s second arm (`E-08b`)**: a gate output matching class 1 *and* class 2 — it names a symbol a later PLAN task promotes **and** a defect inside the wave's own owned paths — is classed `plan-ordering-defect` and carries **exactly one** class (never both, never `wave-internal-defect`), so the envelope determination that follows is `E-6`'s and not `E-5`'s; this arm is what makes `ADVISORY_ROOT_CAUSES`' order load-bearing rather than decorative, and without it A6-05's ordered-sequence oracle has no behavioural consequence anywhere in the suite (PM v1 F-02); `citesGateOutput` true only for a region actually present in `gateResult.output`. Covers AT-02-1 (the `E-08b` two-class arm; the vocabulary's ordered oracle is A6-05's share), AT-02-2 and AT-02-4 (their parser/`citesGateOutput` unit halves). **Green step (A6-08 proper):** **GREEN** — implement `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput`. Pure: no `process`, no clock, no ambient state. | pdlc/workflows/__tests__/advisoryWaveGate.test.js | pdlc/workflows/orchestrate-dev.js | 2 | A6-00, A6-05 | ⬚ |
| A6-10 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-09):** **RED** — snapshot/restore round trips on a **real temporary git repository**, never a fake `_git` (TSPEC §5.2: this is the one place an injected double would echo the assertion rather than test it): the content-hash map taken immediately before A6 acts equals the map after restore, over tracked files and **non-ignored** untracked files alike, generated outputs included — BR-9 v1.6's decided domain, which the row's later sentence and the AT-05-1 traceability row already state (TE v1 F-03); a companion pinning that a `git status`-level comparison is explicitly **not** the oracle, because re-running the post-wave command rewrites an already-dirty path without changing the hash map; `restoreTreeSnapshot` throwing on any `ok !== true`, tagged `__isRevertFailure` and rethrown by the driver's terminal catch; the wave-scoped ref name `refs/pdlc/a6-snapshot-{waveNum}`. The `.gitignore`d-path round trip is a **fully asserted live case** — OQ-7 closed upstream in the TSPEC's favour, so its expected value is known and no pending marker is used. It asserts the exclusion **positively and on both sides**: an ignored path mutated (or created) between the two snapshots leaves both hash maps equal and the round trip green, and an implementation that *restores* the ignored path fails this case rather than passing it (FSPEC `AT-05-1`, `BR-9`; REQ `AC-5.1`). **The oracle that falsifies that implementation is a positive-presence conjunct, not the hash map** (TE v1 F-01): the map's domain excludes ignored paths on *both* sides, so a restore that deleted one still leaves the two maps equal and the map alone cannot see it. The case therefore also asserts, on the same run, that a `.gitignore`d file the wave added is **still present** after restore — TSPEC §5.2 case 4, the assertion that pins `git clean -fd` over `-fdx`. Its companion is the untracked-but-non-ignored file the wave added, asserted **absent** after restore (TSPEC §5.2 case 3), so the two together discriminate the ignore boundary rather than a blanket delete or a blanket keep. The map is taken at BR-9's observation point — immediately after `restoreTreeSnapshot` returns, before any record, escalation or queue-row write — so those later writes cannot be read as a restoration defect. **The case asserts the *ordering*, not only the content** (TSPEC §5.2 case 5; TE v1 F-02): it observes the map at that point and **separately** asserts that AC-6.1's record append, AC-6.2's escalation-log append and AC-5.2's queue-row write (M-WG-7) all happen afterwards, so an implementation that interleaved them fails here rather than passing on a map that happens to match. No `test.todo`, and (as always here) never `test.skip`/`describe.skip`/`it.skip`: `scanSkipTokens` (in `orchestrate-dev.js`) matches exactly `/\b(describe|test|it)\.skip\s*\(/`, and `checkWaveUnskips` halts the wave through `formatUnskipViolations` once the file's manifest owners are all complete and the block names no live task id (the guard's "Attributable to nobody — not the guard's business" arm), so a `.skip` idiom here would halt wave 5 or any later wave. Covers AT-05-1, AT-05-2, AT-05-5. **Green step (A6-10 proper):** **GREEN** — `captureTreeSnapshot` (`rev-parse HEAD`, `add -A`, `write-tree`, `commit-tree`, `update-ref refs/pdlc/a6-snapshot-{waveNum}`; returns `null` on any `ok !== true`) and `restoreTreeSnapshot` (`read-tree --reset -u`, `clean -fd`, `reset --mixed`; throws on any `ok !== true`), both over the injected `_git` transport, with `add` and `reset` through `gitWithLockRetry` for the reason `commitPaths` already retries them. DEC-A6-01 (dangling snapshot commit, never `git stash`) and DEC-A6-03 (wave-scoped ref, no run discriminator). | pdlc/workflows/__tests__/advisoryWaveGate.test.js | pdlc/workflows/orchestrate-dev.js | 3 | A6-08 | ⬚ |
| A6-12 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-11):** **RED** — the driver's one new optional seam (TSPEC §3.7): `classifyReply`'s three arms — `{ok:true}` and the default `null` proceed to RE-CHECK, A1–A5 unchanged in shape and bytes; `{malformed:true}` reuses the **existing** malformed arm (`attempts += 1`, budget check, `continue`), which gives E-09's tie-break for free since `parseAdvisoryVerdict` runs first; `{terminate:{outcome,reason}}` terminates with `attempts` unchanged and `appliedSuccessfully:false`. Plus A6's rung parity (resolved rung equals the tier's, read from the shared `rungState` memo, no second resolution in a run) and dispatch-option parity member by member — tool grants, transport, environment. Covers AT-02-7, AT-07-4, AT-07-5. **Green step (A6-12 proper):** **GREEN** — `runAdvisorySeam` gains the optional `seamOps.classifyReply` hook, called once per attempt after `parseAdvisoryVerdict` returns a well-formed verdict and after `_summarise`, before RE-CHECK; default `null`. A hook, never an `if (seam === "A6")` branch — the per-seam gate-exclusivity registry asserts no seam has a private path through the driver. | pdlc/workflows/__tests__/advisoryDriver.test.js | pdlc/workflows/orchestrate-dev.js | 4 | A6-10 | ⬚ |
| A6-14 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-13):** **RED** — `buildA6SeamOps` member contracts (TSPEC §3.3): `gatherEvidence` passing the **full** `gateResult.output`, not `outputTail`'s 30 lines, and filling `declaredScope` in place; `classifyReply` over the four-class `ROOT-CAUSE:` trailer; `conditionHolds`; `apply` writing `ledgerAnchor.value = invocations.length` as its **first** statement, before it dispatches anything, and returning `{ok:true}` iff `producedPaths()` is non-empty (an empty set is `{ok:false}` ⇒ `post-action-verification-failed`, which is also the disposition for a repair writing only `.gitignore`d paths — OQ-11, stands independently of OQ-7); `producedPaths` as `git diff --name-only` **unioned with** `git ls-files --others --exclude-standard`, the untracked half not optional because an E-6 promotion creates files; `revert`; `verifyGate` re-running the wave's own gate sequence and re-entering `budget-exhausted`; `permittedActions` narrowing `E-6` away on the last wave; the `ledgerAnchor` carrier initialised `{value: -1}` (fail-closed). Covers AT-02-3, AT-02-5, AT-03-4 (seam-op half). **Green step (A6-14 proper):** **GREEN** — implement `buildA6SeamOps` and its private helpers. `declaredScope` and `ledgerAnchor` are mutated in place and never reassigned, and nothing is hung on the returned SeamOps object: the driver shallow-copies it (the two sites in `runAdvisorySeam`'s GATE phase that read `seamOps.declaredScope` into `gateCtx` and into `proposalCandidate`), which is exactly how the round-4 design lost its anchor. | pdlc/workflows/__tests__/advisoryWaveGate.test.js | pdlc/workflows/orchestrate-dev.js | 5 | A6-12 | ⬚ |
| A6-18 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-15):** **RED** — the call site `runWaveGateSeam` end to end (TSPEC §3.2, §5.2, §5.5). Tier gate — AC-1.5 is a **disjunction** ("wave mode not in effect (BL-03) **or** no script-owned gate configured (BL-04)"), so the allocation is four arms, not one: (i) BL-03 absent alone — a run reaching Phase I on the no-manifest legacy path, wave mode never entered, script-owned gate configured; (ii) BL-04 absent alone — valid ownership manifest and wave mode in effect, no `testCommand` configured; (iii) both absent, which per TSPEC §5.5 must still emit exactly **one** statement naming both causes and never two; and (iv) the **zero-count discriminator**, a run in which A6 *does* apply, asserting the inapplicability-statement count over the whole notice surface reads **zero**. Arm (iv) is what makes the other three falsifiable: without it a carrier that emits the notice unconditionally satisfies (i)–(iii) and nothing catches it. All four count *statements over the whole notice surface*, never A6-authored notices — A6 authors none. Wave budget: two escalated waves leave `waveBudget.resolved` at `0`, one resolved wave increments it to `1`, and a wave entered over budget still captures its snapshot and still writes its record and escalation entry with **no** `_agent` call. Capture failure: six positive assertions on one run — record entry whose Disposition cell reads bare `escalated` with **no** refusal reason, `Model` cell the literal `n/a`, escalation entry text **containing** the failing git verb observed on the `_git` double, `attempts === 0`, unchanged budget, `commit-tree === 1` across a two-attempt run — and, on that same fixture, §4.5's **five** halt fields transcribed **set-equally** at their literal values, `rootCause`, `diagnosis`, `repairApplied`, `repairPaths` **and `snapshotRef: null`** (the fifth joined at TSPEC v1.12; TSPEC §5.2), plus **AT-06-4b**, the negative arm BR-14 needs: the halt report carries the diagnosis and the root-cause class, points at **no** ref and carries **no** overwrite sentence anywhere in `notices` — no element matching either half of AT-06-4's spec-side predicates, asserted over the whole array so a notice pushed elsewhere cannot hide — plus a companion pinning `ADVISORY_REFUSAL_REASONS`'s eight members on the same run. Resolution: the step-6 growth-since-last-`apply` rule, the two-attempt positive companion asserting the six tokens a red-then-green run produces, and the **two mutation fixtures** for AC-4.1 conjunct (iii), each replacing exactly one member of a **real** `buildA6SeamOps` result (`{...seamOps, verifyGate: fake}`) and each carrying its positive half (`ledgerAnchor.value === 2` on the attempt-1 fixture; `=== 4` with `["post-wave","test","post-wave","test"]` on the attempt-2 fixture). Prohibitions `(f)`…`(i)`: eleven tests, id set compared by set-equality against `A6_PROHIBITIONS`, every one carrying its paired positive per AC-4.5. **BR-14's co-located overwrite warning (AT-06-4, FSPEC v1.7 / TSPEC §5.6):** on §5.2's **two-red-wave** run — the fixture that already observes `refs/pdlc/a6-snapshot-1` / `-2` on the `_git` double, so the wave-scoped ref is asserted against a wave number the fixture distinguishes — the halt report carries all three of AC-6.3's conjuncts on one run: the diagnosis, the root-cause class, and the overwrite statement rendered from a non-`null` `snapshotRef`. Conjunct (3)'s oracle is **co-location within one string**: pick the single `notices` element matching the ref pattern and assert the overwrite predicate **on that same element**, because two independent `toContain` assertions over separate strings cannot falsify a split. **Anti-echo rule:** both halves are matched by **spec-side literals written in the test** — `expect(notice).toMatch(/overwrit/i)` and `expect(notice).toContain("refs/pdlc/a6-snapshot-" + waveNum)` — never by a warning constant imported from the module under test, which cannot fail on wording and would neuter AT-06-4b. Presence of the statement, never a verbatim sentence pin and never the capture's name (O-1). §4.5's condition is universal over A6-touched halts with a non-`null` `snapshotRef`, so the post-gate un-skip halt on a wave A6 *resolved* carries the same predicates; it is covered under this AT rather than by a new witness id, per TSPEC §5.6. Plus the BR-1…BR-16 partition against an agent double, the halt literal, and §4.5's five halt fields. Covers AT-01-5, AT-02-2, AT-02-4, AT-02-6, AT-02-8, AT-02-9, AT-03-2, AT-03-3, AT-03-4, AT-03-5, AT-03-6, AT-04-1, AT-04-1a, AT-04-1b, AT-04-2, AT-04-4, AT-05-3, AT-06-4, AT-06-4b, AT-07-1. **Red step (former A6-16):** **RED** — AC-6.1's record obligations, beside the shipped record oracle rather than in a second drifting copy: the entry an A6 invocation writes names the wave, root-cause class, envelope determination and action, and its **field set is compared by set-equality** against the transcribed literal, never by containment (a dropped field passes a containment check); a failed record write refuses the action and carries the tier's record-write-failure reason. Covers AT-06-1, AT-06-2. **Red step (former A6-17):** **RED** — AC-6.2 / AC-6.4's escalation log: the entry carries the root-cause class and the tier's fields plus one sentence an operator can decide from; an escalated `plan-ordering-defect` reaches `docs/_queue/ESCALATIONS.md` durably; a failed escalation-log write leaves the disposition `escalated` and unchanged, surfaces the failure on the report's notice channel, and never upgrades to `resolved`. Covers AT-06-3, AT-06-5, AT-06-6. **Green step (A6-18 proper):** **GREEN** — implement `runWaveGateSeam` (TSPEC §3.2 steps 1–7): structural applicability, the tier gate (so AC-1.4's inertness covers the **snapshot**, which is A6's and not the driver's) — implemented by **receiving the already-resolved run-level `const advisoryTierOn = advisoryConfigResult.config.enabled`** as a parameter and performing **no new `.enabled` read**, so PROP-DIS-06's exact-count oracle — `advisoryDisabled.test.js`'s `PROP-DIS-06 — exactly three \`.enabled\` reads outside parseAdvisoryConfig` block (AC-1.4) — still finds exactly three `/\.enabled\b/` matches across `orchestrate-dev.js` and `orchestrate-queue.js` with `parseAdvisoryConfig`'s body excised: `runAdvisorySeam`'s disabled-tier early return, the run-level `advisoryTierOn` assignment, and `orchestrate-queue.js`'s `finish` closure (verified at HEAD; these are TSPEC v1.10's re-anchored sites, per DEC-DOC-01). A literal `config.enabled === false` — or any `.enabled` token at all, comments and strings included, since the oracle matches `/\.enabled\b/g` over raw source text with only `parseAdvisoryConfig`'s body excised — inside `runWaveGateSeam` would make that count four and go red in batch 6, whose gate declares the whole suite green; it would also contradict the shipped design intent stated in the comment above that assignment ("Read once, reused everywhere below … so the tier's own master switch is inspected from source text exactly once here"). What A6 needs duplicated is the tier *gate*, not the tier *read*. The wave-budget check using the shipped `__preDispatch` escape, `captureTreeSnapshot` at the call site — outside `runAdvisorySeam`, exactly once per wave, because `gatherEvidence` sits inside the driver's attempt loop — `buildA6SeamOps`, `runAdvisorySeam`, and the step-6 resolution check comparing the tokens appended since the last `apply` against the wave's own configured gate sequence. Includes §2.5's capture-failure writes (`appendAdvisoryEntry` with the six members `renderAdvisoryEntry` destructures, then `appendEscalationEntry`, then the `ADVISORY ESCALATION:` notice) and §4.5's **five** halt fields — `rootCause`, `diagnosis`, `repairApplied`, `repairPaths` and `snapshotRef`, the last non-`null` exactly when a capture succeeded — with the halt report's co-located overwrite notice rendered from it by the exported pure helper `renderSnapshotOverwriteNotice(snapshotRef)` (TSPEC §4.5; BR-14 / AC-6.3, landed upstream at REQ v1.16 / FSPEC v1.7). | pdlc/workflows/__tests__/advisoryWaveGate.test.js, pdlc/workflows/__tests__/advisoryRecord.test.js, pdlc/workflows/__tests__/advisoryEscalationLog.test.js | pdlc/workflows/orchestrate-dev.js | 6 | A6-14 | ⬚ |
| A6-21 | **TDD inside one task (restructure v1.3):** the red steps and the green step land in this single task, in order, so the script-owned wave gate — which has no expected-red channel — sees a green suite at the wave boundary. The implementer writes each red step's tests, observes them fail for their named reason in-session, then does the green step and leaves the whole suite green before committing. **Red step (former A6-19):** **RED** — the wave loop's own obligations: A6 call count `0` on dispatch failure, on post-wave failure and on the V-wave's separate gate, with reason strings and queue row equal to the pre-A6 literals; committing writer identities equal to the pre-A6 baseline on a green gate; **§3.6's promotion commit** — the repair present in the branch's committed state with no residual working-tree change, identified by `message` and pathspec, and the advisory record naming the paths while the later task's prompt carries the promotions clause — paired with the companion that is **red on today's behaviour** (M-WG-12: the wave commit loop commits only paths owned by tasks in that wave, so a later task's paths outside `postWavePathspecs` strand the repair uncommitted); the post-gate un-skip halt carrying §4.5's advisory fields while the repair stays in the tree, asserted as a pair so AT-05-4 is satisfiable and not vacuous; per-task `commitPaths` count `≥ 1` with A6 count `0` on an all-green run, no timing assertion. Covers AT-01-2, AT-01-3, AT-04-3, AT-04-5, AT-05-4, AT-07-3. **Red step (former A6-20):** **RED** — disabled-tier byte-identity extended to A6: with `advisory.enabled: false` and a red wave there is no dispatch, no rung resolution and **no snapshot**, created files are byte-identical to the pre-advisory baseline, and the report carries no `advisory` key (`undefined`, not `null`); paired with the enabled-but-quiet case where the key is **present** with six rows and A6's counter `0`. Covers AT-01-4, AT-01-6, AT-07-2 (this file's share). **Green step (A6-21 proper):** **GREEN** — Phase I wiring, the only edit to the shipped wave loop: extract `runWaveGateSequence` (post-wave then test, pushing one `"post-wave"` / `"test"` token into the per-wave `invocations` array immediately before each `runCommandFn` call, pass or fail), replace the unconditional `throw haltError(…)` inside `orchestrate-dev.js`'s `if (scriptGate) {` arm — the one whose literal reads ``Error: Wave ${waveNum} test gate failed`` — with §2.3's block; the post-wave arm (the `if (implConfig.postWaveCommand && …)` block, literal ``Error: Wave ${waveNum} post-wave command failed``) rethrows byte-identically and is otherwise unchanged, and the test arm calls `runWaveGateSeamFn` and rethrows the **first pass's** halt with `advisory: a6.haltFields` when unresolved — add §3.6's further `commitPaths` call in the per-task loop for an E-6 promotion, in the full argument form with its own `chore({feature}): wave {N} promotion ({taskId})` message (DEC-A6-02), extend `waveImplementPrompt` with the promotions clause, and push A6's row into `advisorySummaryRows`. Steps 1–3, 5 and 7 keep their messages byte for byte. | pdlc/workflows/__tests__/waveExecution.test.js, pdlc/workflows/__tests__/advisoryDisabled.test.js | pdlc/workflows/orchestrate-dev.js | 7 | A6-18 | ⬚ |

### Batch gates

| Batch | Gate wording |
|---|---|
| 1–7 (all) | Whole `pdlc/workflows` suite green under `implementation.testCommand`, `node pdlc/workflows/build-runtime.mjs` clean as the post-wave command, and `pdlc/workflows/dist/` committed through `implementation.postWavePathspecs`. The gate is a plain exit-code check with no expected-red channel (the wave loop's `if (scriptGate)` arm in `orchestrate-dev.js`), so **no wave may end red** — each merged task's red steps are observed red and then greened inside the task's own session, before the wave boundary. |
| 1 (specifics) | A6-05's red steps (former A6-02/A6-03) observe **in-session** the failures the v1.2 plan named — the five-member seam literal, the four-member envelope literal, the absent `waveBudgetPerRun` key, the absent `A6` registry row, and the four bare row-count assertions retargeted to `6` — the `T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)` block in `advisoryDisabled.test.js`, the `ADVISORY_SEAMS drives the row list (S-1)` assertion in `advisoryQueueSeams.test.js`, and both sites in `advisoryHarvest.test.js` (the one above its `seamNames` literal in `T-08-6`, and the one in `T-08-8`) — then the green step lands the constants and the suite is green at the gate. **At HEAD all four already read `toHaveLength(6)`**, so this is confirmation, not editing; see the inherited-red rule below. A6-00's pre-flight assertions and A6-01's fixtures are green from the start; red there at the gate means the baseline moved and this PLAN is invalid, not that the wave failed. **Inherited red (HEAD drift).** Unlike every other wave, wave 1 opens on an already-red suite: `e3b9d5a3` landed the test-side retargeting ahead of Phase I, so the failures listed above are present *before* A6-05's red steps run. "Observe the red in-session" therefore means **confirm the failing set is exactly the listed one** — not produce it — and any failure outside that set is drift to escalate, not progress. **The listed set is scoped to the advisory suites.** A whole-suite run at HEAD on a **clean** tree reports 27 failed across 8 suites, not 24 across 7: three extra failures live in `documentOracles.test.js` (T15's count literal, PROP-SWEEP-2(b)'s residual set, `AT-22 [red-until-L-06]`). A fourth, `consumerCleanup.test.js`'s AT-4.1, appears **only if a tracked file is dirty**, taking the figure to 28 across 9 — see the Overview's HEAD-drift note for the conditional table, and the clean-tree precondition below for why the clean number is the one to expect (PM v7 F-03, TE v7 F-02). Only T15's count literal is fully closed by A6-00 in the same batch. PROP-SWEEP-2(b) is **partly** closed there — A6-00's untrack-and-ignore step removes 14 of its 28 residual paths, and the remaining 14 (consumer-runtime artifacts plus this feature's own documents) are inherited and cannot be closed on this branch, so that oracle stays red at every wave boundary. `AT-22` and AT-4.1 are likewise **expected and unowned**, not drift — see the Overview's HEAD-drift note for each one's owner and disposition. **Clean-tree precondition.** `consumerCleanup.test.js`'s AT-4.1 asserts `git status --porcelain` over the repo root is empty, so **the wave gate is expected to run against a clean tree at every wave boundary, not only wave 1's**. This is load-bearing here because the pdlc `SessionStart` hook rewrites the *tracked* file `.claude/workflows/.pdlc-drift-state.json`, which reddens AT-4.1 on any session where the hook has run and nothing else has staged it. Before opening any wave, the implementer either commits or restores that file (and any other dirty tracked path); if the file is instead untracked or excluded upstream, AT-4.1 stops being a per-wave hazard and this paragraph can be retired. A red AT-4.1 whose `Received` output names only that path is **not** drift to escalate; a red naming a path this feature owns is. A6-00's untracking of the `.claude/workflows/.pdlc-backups/*.bak` blobs is written to respect this precondition rather than break it: the same step adds `.claude/workflows/.pdlc-backups/` to `.gitignore`, so the 14 files left on disk do not become 14 `??` lines and later `.bak` writes by the workflow sync path do not re-dirty the tree at a wave boundary (TE v7 F-01). The gate itself is unaffected: it is evaluated only at the wave *boundary*, by which point A6-05's green step has supplied the production constants and the suite is green. A6-04's engine-channel red is **not** observed by this gate (`implementation.testCommand` scopes to `pdlc/workflows`) and A6-04 is test-only — its red stands until A6-06 in wave 2; it is checked out-of-band by A6-06's own `cd pdlc/engine && npm ci && npm test` step, which the configured gate command cannot see. |
| 3–7 (specifics) | Each merged task's red steps fail in-session for the reason each one names — the symbol under test does not exist yet, or exists without the new arm — and **all** pre-existing tests, including everything greened by an earlier wave, are green at the wave boundary. A6-21's promotion-commit companion (former A6-19 step) is the one red observed against *shipped* behaviour rather than against a missing symbol; its in-session failure message must name M-WG-12. |

### File-ownership manifest (Phase I)

One phase, one manifest. Every task in the table above has exactly one row here and every row names
a task in the table (`validatePlanContract`). Directory rows would carry the trailing slash
`ownedSetCovers` / `pathsCollide` requires (TSPEC §3.4, §6 OQ-10); this feature happens to own no
directory row — `pdlc/workflows/dist/` is written by the post-wave command and committed through
`implementation.postWavePathspecs`, not by any task.

| Owning task | Files |
|---|---|
| A6-00 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/__tests__/documentOracles.test.js`, `.gitignore` |
| A6-01 | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` |
| A6-04 | `pdlc/engine/__tests__/advisory-config-example.test.js` |
| A6-05 | `pdlc/workflows/__tests__/advisoryEnvelope.test.js`, `pdlc/workflows/__tests__/advisoryConfig.test.js`, `pdlc/workflows/__tests__/advisoryDriver.test.js`, `pdlc/workflows/__tests__/advisoryRecord.test.js`, `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js`, `pdlc/workflows/__tests__/advisoryDisabled.test.js`, `pdlc/workflows/__tests__/advisoryQueueSeams.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-06 | `.claude/pdlc.config.example.json` |
| A6-08 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-10 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-12 | `pdlc/workflows/__tests__/advisoryDriver.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-14 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-18 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/workflows/__tests__/advisoryRecord.test.js`, `pdlc/workflows/__tests__/advisoryEscalationLog.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| A6-21 | `pdlc/workflows/__tests__/waveExecution.test.js`, `pdlc/workflows/__tests__/advisoryDisabled.test.js`, `pdlc/workflows/orchestrate-dev.js` |

## Dependencies

### Why the chain is this serial

Almost every production edit lands in `pdlc/workflows/orchestrate-dev.js` (TSPEC §1.2), and
batch-safety rule 2 allows one writer per file per batch. So `orchestrate-dev.js` is written by
exactly one task per batch, and the seven merged implementation tasks (A6-05, A6-08, A6-10,
A6-12, A6-14, A6-18, A6-21) are necessarily serial. Parallelism exists only among the pure
test-side/fixture tasks that share a wave with a merged task: A6-00, A6-01 and A6-04 beside A6-05
in batch 1, and A6-06 beside A6-08 in batch 2. This was verified mechanically, not asserted:
`parsePlanTasks` + `computeWaves` over this document reproduce the seven batches labelled above,
task for task, one wave per batch.

### Red-before-green steps

Since v1.3 the red→green ordering lives **inside** each merged task, not in `Deps`: the
implementer performs the red steps first, observes each failure in-session for its named reason,
then performs the green step. `Deps` now carries only real cross-task edges (prior wave's
production state, shared fixtures). What each task's red steps prove before its green step exists:

| Merged implementation task | Red step(s) inside it | What the red proves before the green exists |
|---|---|---|
| A6-05 | former A6-02, A6-03 | six-member seam and envelope literals, `waveBudgetPerRun`, `A6` registry row all fail against the shipped five-member surfaces |
| A6-06 | former A6-04 (a wave-1 sibling task, engine channel — see batch gates) | the example config carries no `advisory` section at all today |
| A6-08 | former A6-07 | `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput` are not exported |
| A6-10 | former A6-09 | `captureTreeSnapshot` / `restoreTreeSnapshot` are not exported; the real-repo round-trip oracle has nothing to run against |
| A6-12 | former A6-11 | `seamOps.classifyReply` is not read by `runAdvisorySeam`, so the terminate arm never fires |
| A6-14 | former A6-13 | `buildA6SeamOps` is not exported |
| A6-18 | former A6-15, A6-16, A6-17 | `runWaveGateSeam` does not exist, so no disposition, record entry or escalation entry is written |
| A6-21 | former A6-19, A6-20 | the wave-loop `if (scriptGate) {` arm — the one whose halt literal is `Error: Wave ${waveNum} test gate failed …`, not the V-wave's — still runs `if (!gate \|\| gate.ok !== true)` straight into `throw haltError(…)` with no repair path between them; M-WG-12 still strands an E-6 promotion uncommitted |

### Batch-safety rules, as applied here

1. **Batch column derived, not narrated.** `batch == max(batch of deps) + 1`, sources in batch 1,
   sub-batches capped at five (`computeTopologicalBatches` in `orchestrate-dev.js`, whose
   `// Split into sub-batches of at most 5` loop steps `ready` by 5).
2. **Single writer per file per batch.** Checked file by file: `orchestrate-dev.js` appears in
   batches 1 through 7, once each (A6-05, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21).
   `advisoryWaveGate.test.js` appears in batches 1 (A6-00), 2 (A6-08), 3 (A6-10), 5 (A6-14) and
   6 (A6-18), once each. `advisoryDriver.test.js` in batches 1 (A6-05) and 4 (A6-12).
   `advisoryRecord.test.js` in batches 1 (A6-05) and 6 (A6-18). `advisoryDisabled.test.js` in
   batches 1 (A6-05's row-count retarget step) and 7 (A6-21's byte-identity step).
   `advisoryQueueSeams.test.js` in batch 1 only. No file has two writers in one batch, in either
   the source or the test column.
3. **Shared prerequisites are singly owned.** `helpers/advisoryDoubles.js` — the one file
   every later suite reads — is owned by exactly one batch-1 task, A6-01, and by nothing else. The
   `[Fake first]` label is on that task; it shares wave 1 with A6-05, whose red steps' suites are
   reconciled with the retargeted doubles at the wave-1 gate, and it precedes every later
   production task.
4. **Subpackage-qualified paths.** Every `Test File`, `Source File` and manifest cell carries a
   repo-root-relative path. There are no bare basenames: two suites in this feature
   (`advisoryRecord.test.js` in `pdlc/workflows/__tests__` and `advisory-config-example.test.js` in
   `pdlc/engine/__tests__`) live in different trees, and a bare name would be ambiguous between the
   two channels.
5. **Task ids are spelled identically** in the `#` column and in every `Deps` cell — no emphasis in
   one and bare in the other.

### Integration points in the shipped code

Locations are given as symbols and quoted assertions, not `file:line` pins (DEC-DOC-01): the
line numbers this table carried through v1.4 had all moved at HEAD, and a stale pin reads as a
finding rather than as drift.

| Integration point | Location, verified | Touched by |
|---|---|---|
| Wave loop's script-owned test gate, today a bare failure→throw with no repair path | `pdlc/workflows/orchestrate-dev.js`, the `if (scriptGate) {` arm inside the per-wave loop, whose halt literal reads ``Error: Wave ${waveNum} test gate failed — `${implConfig.testCommand}` did not pass.`` | A6-21 |
| Post-wave command, must keep its message byte for byte | same loop, the `if (implConfig.postWaveCommand && typeof runCommandFn === "function")` block, halt literal ``Error: Wave ${waveNum} post-wave command failed`` and success emit ``Wave ${waveNum} post-wave: … passed`` | A6-21 (read only) |
| `scriptGate` resolution | `const scriptGate =` binding earlier in the same wave loop, with its `if (!scriptGate)` self-report fallback | A6-21 (read only) |
| Advisory constants block | the `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS` and `ADVISORY_SEAMS` declarations, adjacent in that order | A6-05 |
| `parseAdvisoryConfig` and its per-key validators | `export function parseAdvisoryConfig(text)` and the `positiveInt(key)` factory it applies (e.g. `attemptBudget: positiveInt("attemptBudget")`); the non-negative validator TSPEC §4.4 needs for `waveBudgetPerRun: 0` does not exist at HEAD and is A6-05's to add | A6-05 |
| `runAdvisorySeam`'s attempt loop — APPLY precedes VERIFY, which is what makes the `ledgerAnchor` rule decidable | `export async function runAdvisorySeam`, its `log("GATE")` → `log("ACT")` → `log("CHECK")` → `log("VERIFY")` phase markers, and the two sites that read `seamOps.declaredScope` into `gateCtx` and into `proposalCandidate` (both shallow copies — the round-4 design lost its anchor here) | A6-12, A6-14, A6-18 (read); A6-12 (write) |
| `resolveAdvisoryRung` and the per-run rung memo | `export function resolveAdvisoryRung({ … skill = ADVISORY_RUNG_SKILL })` | none — reused unchanged (NFR-6, O-3) |
| `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry` | shipped, unchanged | none — reused unchanged (BR-5, AC-6.1, AC-6.2) |
| `computeWaves` / `parsePlanOwnership` / `pathsCollide`, the source of the owned-path sets | `export function parsePlanOwnership(markdown)`; `pathsCollide` is declared `function pathsCollide(a, b)` with no `export` (see A6-00) | A6-08 (read) |
| `commitPaths` and `gitWithLockRetry` | shipped | A6-10, A6-21 |
| Gate-exclusivity registry, the reason A6 gets a hook and not a seam-name branch | `pdlc/workflows/__tests__/advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` const, and the *"PROP-GATE-06 — the gate-exclusivity registry's key set equals ADVISORY_SEAMS"* describe that set-compares it against `dev.ADVISORY_SEAMS` | A6-05 (former A6-03 step), A6-12 (former A6-11 step) |

### Upstream dependency that was open, and is now closed

OQ-7 — whether BR-9's restoration oracle ranges over `.gitignore`d paths — is **answered: it does
not.** The erratum landed upstream (REQ `AC-5.1` v1.15, FSPEC `BR-9` / `AT-05-1` / `AT-05-2` v1.6,
restated in TSPEC v1.11's changelog as closed "in this TSPEC's favour"). The map ranges over tracked
and non-ignored untracked files, ignored paths excluded on both sides, observed immediately after
restoration completes and before the run's record, escalation and queue-row writes.

No task gains or loses a dependency edge: A6-10's former-A6-09 red step now transcribes that boundary
as a live assertion rather than holding a pending case open, which is a change to the step's text and
not to the graph. Nothing else in this plan reads the answer, because A6-13's `apply` refusal for an
ignored-path-only repair stands on its own merits either way (OQ-11) — unchanged by the closure.

**No upstream dependency of this plan is open — checked across all four upstream documents at HEAD, not
three.** The v1.10 round asserted this while DECISIONS still sat at `sha256:84deee10…`, where DEC-A6-01's
option-D row and its *What follows from DEC-A6-01* section were still routing the ignored-path boundary as
"upstream's open question (TSPEC §6 OQ-7)" with a contingent scoped ignored-path capture arm — so the claim
overreached its evidence when it was made (TE v1 F-04). DECISIONS has since been re-grounded and now reads
at `sha256:dc7a8d65…`: the option-D row records OQ-7 as **closed, answered no** at TSPEC v1.11, and the
consequences section states that "the scoped ignored-path arm this record held in reserve is explicitly
**not built**", with only a *reversal* of BR-9's exclusion listed as the re-evaluation trigger that would
grow it. No task in this plan reads that arm, and none needs to.

## Verification

### Commands

| What | Command | Where it runs |
|---|---|---|
| Wave gate (every batch) | `cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'` | `implementation.testCommand` in `.claude/pdlc.config.json`, script-owned |
| Post-wave command (every batch) | `node pdlc/workflows/build-runtime.mjs` | `implementation.postWaveCommand`; its output under `pdlc/workflows/dist/` is committed via `implementation.postWavePathspecs` |
| Coverage backstop | `cd pdlc/workflows && npm run test:coverage` | two stages: `c8` aggregate floors, then `c8 report --per-file --branches 85` over `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` |
| Engine channel | `cd pdlc/engine && npm ci && npm test` | **not** covered by the wave gate — A6-04's expectation lives in `pdlc/engine/__tests__/`, which `implementation.testCommand` does not run. A6-04/A6-06 must be verified by this command and by CI's `Engine tests (ubuntu-latest)` check |
| Artifacts in sync | `node pdlc/workflows/build-runtime.mjs --check` | CI's `Generated artifacts in sync` check; green only if the wave commits carried `dist/` |

Coverage is a backstop here, not an oracle (TSPEC §5.4): A6 lands inside a ~15k-line module that
dominates both its aggregate and its per-file number, so a coverage floor is a poor detector of an
A6-specific gap. That is a dilution argument, not a guarantee, and it is deliberately **not** stated
as "the floor cannot fail" — `orchestrate-dev.js` is itself one of the three files carried at
`--per-file --branches 85` (`pdlc/workflows/package.json`'s `scripts.test:coverage`, verified), so a
large enough block of unhit A6 branches can move the per-file number under the floor. A6-21 therefore
records the pre-A6 and post-A6 per-file branch percentages for `orchestrate-dev.js` in its commit
message, so any regression is attributable rather than mysterious. The branch inventory itself is
discharged by the enumerated cases in the task table, not by the percentage.

### AT coverage — one row per FSPEC acceptance test

**Forty-eight** ATs in FSPEC §6 at v1.7, forty-eight rows here — the forty-eighth is `AT-06-4b`, the
negative arm FSPEC v1.7 added alongside BR-14's overwrite warning. This table is set-equal to FSPEC's AT set, not a
containment check: an AT with no row has no home, and a row naming no AT is a defect in this table.

Since v1.3 the `Red-test task` column names the **step** (former task id) whose in-session red
covers the AT; the `Green task` column names the merged task that owns the step and greens it. A
former id resolves to its owning task via the mapping in the v1.3 changelog row.

| AT | Red-test task | Green task | Test home |
|---|---|---|---|
| AT-01-1 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-01-2 | A6-19 | A6-21 | waveExecution.test.js |
| AT-01-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-01-4 | A6-20 | A6-21 | advisoryDisabled.test.js |
| AT-01-5 | A6-15 | A6-18 | advisoryWaveGate.test.js — four arms: BL-03-absent alone, BL-04-absent alone, both-absent (one statement, not two), and the zero-count run where A6 applies |
| AT-01-6 | A6-20 | A6-21 | advisoryDisabled.test.js |
| AT-02-1 | A6-02, A6-07 | A6-05, A6-08 | advisoryEnvelope.test.js — the vocabulary compared by **ordered-sequence** equality against its transcribed literal (`BR-2`'s first-matching-class rule, so a reordering fails where set equality would pass); plus advisoryWaveGate.test.js — `E-08b`'s two-class arm in A6-08's `parseA6RootCause` step, a failure matching class 1 and class 2 classed `plan-ordering-defect` and carrying exactly one class |
| AT-02-2 | A6-07, A6-15 | A6-08, A6-18 | advisoryWaveGate.test.js — parser unit half in A6-07, escalation/attempts half in A6-15 |
| AT-02-3 | A6-13 | A6-14 | advisoryWaveGate.test.js |
| AT-02-4 | A6-07, A6-15 | A6-08, A6-18 | advisoryWaveGate.test.js — `citesGateOutput` unit half in A6-07 |
| AT-02-5 | A6-13 | A6-14 | advisoryWaveGate.test.js |
| AT-02-6 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-02-7 | A6-11 | A6-12 | advisoryDriver.test.js |
| AT-02-8 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-02-9 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-1 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-03-2 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-3 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-4 | A6-13, A6-15 | A6-14, A6-18 | advisoryWaveGate.test.js — three conjuncts as seam-op unit, then end to end |
| AT-03-5 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-6 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-7 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-03-8 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-04-1 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-1a | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-1b | A6-15 | A6-18 | advisoryWaveGate.test.js — dropped-re-gate mutation fixtures |
| AT-04-2 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-04-4 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-5 | A6-19 | A6-21 | waveExecution.test.js — the one AT whose companion is red against shipped behaviour |
| AT-05-1 | A6-09, A6-15 | A6-10, A6-18 | advisoryWaveGate.test.js — real-repo hash-map oracle over tracked + non-ignored untracked paths, taken at BR-9's observation point; ignored-path case live (OQ-7 closed), restoring one fails |
| AT-05-2 | A6-09 | A6-10 | advisoryWaveGate.test.js |
| AT-05-3 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-05-4 | A6-19 | A6-21 | waveExecution.test.js |
| AT-05-5 | A6-09 | A6-10 | advisoryWaveGate.test.js |
| AT-06-1 | A6-16 | A6-18 | advisoryRecord.test.js |
| AT-06-2 | A6-16 | A6-18 | advisoryRecord.test.js |
| AT-06-3 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-06-4 | A6-15 | A6-18 | advisoryWaveGate.test.js — §5.2's two-red-wave fixture; all three AC-6.3 conjuncts on one run, conjunct (3) by **co-location within one `notices` element**, both halves matched by spec-side literals (anti-echo) |
| AT-06-4b | A6-15 | A6-18 | advisoryWaveGate.test.js — the E-34 capture-failure fixture (`snapshotRef: null`): diagnosis and class present, no ref pointer and no overwrite sentence anywhere in `notices` |
| AT-06-5 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-06-6 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-07-1 | A6-15 | A6-18 | advisoryWaveGate.test.js — BR-1…BR-16 partition |
| AT-07-2 | A6-02, A6-03, A6-20 | A6-05, A6-21 | advisoryEnvelope.test.js + advisoryConfig.test.js + advisoryDisabled.test.js |
| AT-07-2b | A6-02 | A6-05 | advisoryConfig.test.js |
| AT-07-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-07-4 | A6-11 | A6-12 | advisoryDriver.test.js |
| AT-07-5 | A6-11 | A6-12 | advisoryDriver.test.js |

### Definition of Done

- [ ] All eleven tasks at ✅, with **every** wave's gate green under
      `implementation.testCommand` and `build-runtime.mjs` clean — no wave ends red; each merged
      task's red steps were observed red in-session, per its commit trail or session record.
- [ ] Every one of the **forty-eight** ATs above has a passing test in the named home; the AT set in this
      table is set-equal to FSPEC §6's at v1.7 (`AT-06-4b` included), checked both directions.
- [ ] `ADVISORY_ROOT_CAUSES`, `ADVISORY_REFUSAL_REASONS` and `ADVISORY_EXCLUSIONS` are each asserted by
      **ordered-sequence** equality, never set equality or `toContain`, and `E-08b`'s two-class arm is
      present — without it the root-cause order has no behavioural consequence in the suite.
- [ ] AT-06-4's overwrite warning is asserted **co-located** with the ref pointer in one `notices` element,
      by spec-side literals rather than a constant imported from the module under test, and AT-06-4b asserts
      its absence on the capture-failure run.
- [ ] Every transcribed surface of TSPEC §1.3 carries the six-member value by **set-equality**, never
      a loosened `toContain`: `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS`,
      `advisoryRecord.test.js`'s per-seam `test.each`, `advisoryDriver.test.js`'s
      `GATE_EXCLUSIVITY_REGISTRY`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`,
      `helpers/advisoryDoubles.js`'s `SEAMS`, and the four bare row-count assertions
      now reading `6`, named as TSPEC v1.10 re-anchored them: `advisoryDisabled.test.js`'s
      *"T-10-5 / PROP-DIS-05 — enabled-but-quiet … (S-1)"* block, `advisoryQueueSeams.test.js`'s
      *"ADVISORY_SEAMS drives the row list (S-1)"* assertion, and **both** sites in
      `advisoryHarvest.test.js` — the one immediately after the `seamNames` literal, and the one in
      the neighbourhood of the member *lookup* (`rows.find((r) => r.seam === "A1")`).
- [ ] AC-1.5's inapplicability notice is checked on all four arms — BL-03 absent alone, BL-04
      absent alone, both absent (one statement, never two), and the **zero-count** run where A6
      applies — so the notice is not satisfiable by a carrier that emits it unconditionally.
- [ ] Every prohibition test `(f)`…`(i)` asserts its **paired positive** on the same run (AC-4.5); no
      prohibition rests on a negative assertion alone.
- [ ] Both AC-4.1 conjunct (iii) mutation fixtures replace exactly one member of a **real**
      `buildA6SeamOps` result and each asserts its positive anchor value (`ledgerAnchor.value === 2`
      and `=== 4`).
- [ ] The disabled tier is provably inert, including **no snapshot**: created files byte-identical to
      the pre-advisory baseline and no `advisory` key on the report (AT-01-4).
- [ ] Steps 1–3, 5 and 7 of the wave loop, and the V-wave's own gate, are unchanged — their halt
      literals and queue rows compared to the pre-A6 values byte for byte (AT-01-2, AT-01-3, AT-05-3).
- [ ] `cd pdlc/engine && npm ci && npm test` green, covering A6-04's example-config expectation
      in its own `advisory-config-example.test.js`, covering both `enabled` and `waveBudgetPerRun`, and
      with `ci-arrangement.test.js` untouched. This leg is run by hand and by CI, **not** by the wave
      gate: `implementation.testCommand` scopes the gate to `cd pdlc/workflows && npm test …`
      (`.claude/pdlc.config.json`), so the engine suite is never exercised at a wave boundary and an
      engine-side red would otherwise surface only in CI.
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0 and `pdlc/workflows/dist/` is committed.
- [ ] `cd pdlc/workflows && npm run test:coverage` passes both stages **for every test this feature
      owns**. This command runs the whole suite with no `--testPathIgnorePatterns`, so it inherits
      every red listed in the Overview's HEAD-drift note, not just the advisory ones. Two of those
      reds are closed by the items below; **two are inherited and stay red on this branch**. Recording
      the leg as a bare exit-0 would make this Definition of Done unsatisfiable by construction (PM v7
      F-01), but reading it as "no red outside the named inherited set" is a human-applied leniency
      over an absence-shaped condition, which cannot fail — a newly-reddened test sits inside the same
      suite leg the reader was just told to read leniently (TE v8 F-03). The leg is therefore stated as
      a **set-equality on failing test titles**, which can: at DoD the run's set of failing tests is
      exactly

      - `AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing`
      - `PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty — AC-1.2's required-empty gate`

      and **nothing else** — checked both directions, so a red this feature introduces (for example
      the T21 `.gitignore` case A6-00's Edit 1 must not break) fails the leg rather than hiding inside
      it. `PROP-SWEEP-2(b)` additionally carries a positive check on *its own* failure output: the
      residual it prints is checked in **two shapes, one per class**, because only one of the two
      classes is closed (PM v9 F-01, TE v9 F-01). Class 2 is a **closed enumeration**, checked by
      set-equality: exactly the four `.claude/workflows/` runtime artifacts named in the HEAD-drift
      note (`.pdlc-drift-state.json`, both `.bundle.js` artifacts, `pdlc-cli.mjs`), no more and no
      fewer. Class 3 is checked as a **membership predicate**, never an enumeration: every remaining
      residual path matches `docs/pdlc-advisory-wave-gate/**`. And in both directions, **no**
      `.pdlc-backups/*.bak` blob appears — that is A6-00's closed set. Stated this way the check
      still fails on a genuinely new residual (a tracked `.gitignore` carrying an L-2 term, a new
      `.claude/workflows/` artifact) and no longer fails on the cross-review files this pipeline is
      designed to keep producing: class 3 grows by one per committed cross-review file, so any
      criterion that set-equals a snapshot of it mis-fires by construction at the ship boundary.
- [ ] `documentOracles.test.js`'s T15 count test reads `100`, not `99`, **in its assertion, its
      title and its block comment together**. The title still says *"post-sweep
      pdlc/workflows/\_\_tests\_\_/\*.test.js count equals TSPEC §4.4's corrected literal of 99"* and the
      comment above it still says the literal "only holds once class 6 … lands"; shipping the bumped
      assertion under the old name is the stale-name trap this plan makes A6-05 fix elsewhere (TE v7
      F-03). **Owner: A6-00** — the file whose landing made the count 100 is `advisoryWaveGate.test.js`,
      authored by A6-00 in `e3b9d5a3`, so A6-00 also owns the literal (TE Q-01). Its manifest row names
      `documentOracles.test.js` for exactly this reason; changing the literal without changing A6-00's
      owned-file set would violate the single-writer rule. The cited authority is the coupled sweep's
      TSPEC §4.4, which still says 99: after this edit the literal is a *pre*-sweep count of 100 that
      the sweep must re-derive when its deletions land, and the comment must say so.
- [ ] The 14 tracked `.claude/workflows/.pdlc-backups/*.bak` blobs are untracked (`git rm --cached`) **and**
      the bare rule `.pdlc-backups/` — that literal, not an anchored path — is in `.gitignore`. Both
      halves, or the blobs become 14 untracked paths and permanently red `consumerCleanup.test.js`'s
      AT-4.1 — the clean-tree precondition this document imposes at every wave boundary (TE v7 F-01).
      The rule's *form* is checkable in the same breath: after the edit, `documentOracles.test.js`'s
      T21 case is still green (no `.claude/workflows/` substring in `.gitignore`), `.gitignore` is
      still absent from the unfiltered sweep's output (no L-2 term in it), and
      `git check-ignore .claude/workflows/.pdlc-backups/` names the new rule (TE v8 F-02).
- [ ] `documentOracles.test.js`'s *"PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list
      is empty"* is understood as **inherited and not closable here**, the same way `AT-22` is. The
      item above closes the 14 `.bak` blobs; the remaining residual — `.claude/workflows/.pdlc-drift-state.json`,
      the two `.bundle.js` artifacts, `pdlc-cli.mjs`, and this feature's own `TSPEC`/`PLAN`/`DECISIONS`/
      `PROPERTIES`/`CROSS-REVIEW-*` documents — is outside any act available to Phase I. **The
      figures live in one place:** the Overview's HEAD-drift note owns them (28 total / 14 closable
      here, measured 2026-08-19 on a clean tree, class 3 growing by one per *committed* cross-review
      file). Read the count there rather than from this bullet; a bare number restated here goes
      stale within a review round or two, which is the trap the Overview was revised to avoid
      (PM v9 F-02, TE v9 F-02). The four
      runtime artifacts are branch-introduced (`e3b9d5a3`, not pre-existing) but unreachable, because
      every ignore rule covering them writes an L-2 grep term into tracked `.gitignore` and mints a
      fresh residual path (TE v8 F-01/F-02); the documents are unreachable because A-1's frozen glob
      list covers neither `docs/{feature}/` specs nor `CROSS-REVIEW-*`, and every committed
      cross-review file adds one more. **Route to the coupled sweep's owner** (extend A-1's glob list); do
      not treat the residual red as an A6 regression, and do not read the full-suite legs above as
      requiring it green (PM v7 F-01).
- [ ] `documentOracles.test.js`'s `AT-22 [red-until-L-06]` is understood as **inherited, not owned**:
      it belongs to the coupled sweep's L-06 and reddens on any untracked file anywhere in the tree
      (`coveredViolations` walks the whole tree under `root`, skipping only `.git/` and
      `node_modules/`). Do not attempt to close it here; do run the full suite from a clean tree so
      it is not mistaken for an A6 regression.
- [ ] `pdlc/hooks/scripts/sync-workflows.sh --check` exits 0 (consumer runtime not left stale).
- [ ] A6-10's former-A6-09 red step transcribes OQ-7's **landed** boundary: the hash-map oracle ranges
      over tracked and non-ignored untracked paths and is taken immediately after restoration completes,
      before the record, escalation and queue-row writes; the ignored-path case is asserted live (no
      `test.todo`) and fails an implementation that restores an ignored path.
