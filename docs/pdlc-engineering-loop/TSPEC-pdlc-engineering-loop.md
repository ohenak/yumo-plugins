---
feature: pdlc-engineering-loop
---

# TSPEC — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.2 | 2026-08-25 |

**Revision changelog**

| Version | Round | Changes |
|---|---|---|
| 0.1 | — | initial draft |
| 0.2 | cross-review round 1 (PM, TE) | `nextDirective`'s two backoff stop reasons stated once, unenterable first (TE F-01); `sessionSummary` completed to §3.4's nine members with `halted`/`escalationsRaised`/`operatorView` on `SessionState` (TE F-02, PM F-02); notice-assembly seam named (`notice`, `collectNotices`) and AT-51/AT-37 respecified as collected-set vs literal transcription (TE F-03); view pipeline reordered — collapse before overlay — and the recurrence key moved off the rendered sentence onto `conditionKey` (TE F-04, PM F-08); AT-18, AT-19, AT-30, AT-32 given named homes (TE F-05, PM F-07/F-09); redactor scope widened to every free-prose field, pattern changed to prefix-anchored, AT-34a negative control added (TE F-06/F-10); `entryId` canonicalisation pinned with a worked example and `renderDecisionEntry` exported (TE F-07); `cmdQueue`'s `!startup.ok` branch made policy-aware on the `--loop-state` path and E-20 split into (a)/(b) (TE F-08, PM F-03/F-04); `EscalationEntry` gains the decision-retrieval fields (TE F-09); `STARTUP_REMEDIATION` extracted (TE F-11); property strategies and the ≥85% branch floor added (TE F-12/F-13); Q-07 decided and the example config's `guardPaths` emptied (TE F-14, PM F-05); T-Q-04 restated (TE F-15); `PreflightInput` carries `startup.notices` (TE F-16); E-23 restated over the session's emitted stop reasons (TE F-17); decision block gains `Decided by` and a named reader (PM F-01/F-10); AC-4.7's three unparseable shapes given a parse contract and AT-27 split (PM F-06); DEC-LOOP-03 owner recorded (PM F-11); decision-block row templates de-piped (PM F-12) |
| 0.3 | Phase D erratum | Targeted erratum edit, re-grounded on REQ v1.6 / FSPEC v0.6. **Error Handling** → *Redaction* opener restated: BR-18 is recognises-scoped, not unconditional, matching FSPEC v0.6 BR-18 and NFR-5 (which now state the same form — v0.5's narrowing-and-upstream-erratum framing is gone from HEAD), and FSPEC Q-10 is discharged here by name (se-author). *Pattern* paragraph records that the six catalogue entries are five behaviourally distinct match families (`gh[pousr]_` subsumes `ghs_`), so a per-family seeded positive ranges over the five while set-equality ranges over the six constant entries (pm-review). **Decisions Warranted** count word corrected four → six and the list put in id order (se-author). No other change. |
| 0.4 | cross-review round 4 (PM, TE) | `cmdQueue`'s `!startup.ok` branch **reverted to unmodified** under every policy: REQ v1.6 AC-3.4 / FSPEC v0.6 BR-11b forbid any `loop.preflight` value letting an unready engine run an iteration, so `"off"` now adds a `preflight-warning` notice and a distinct stop reason alongside the shipped refusal at zero iterations — restated at **Architecture** §3's policy table, the E-20(a)/(b) table, the `cmdQueue` export row, E-19/E-20(a)/E-23, AT-44's engine half, the BR-10/BR-11b traceability rows and DEC-LOOP-06 (TE F-01); `LOOP_STOP_KINDS` grown to FSPEC §3.4's **ten** members with `engine-dispatch-refused` added, and the count words in the export comment, **Data Model** §5, `nextDirective`'s rule list, E-23, AT-37 and BR-28's row re-derived (TE F-02); `redactEntryText` given a per-family property row, AT-34 parameterised over the five behavioural families, and mutants (g)/(h) added (TE F-03); `readLoopConfig` restated as an **extension** of the sibling precedent per FSPEC Q-03, with DEC-LOOP-04's rejected alternative re-pointed at retrofitting the siblings (TE F-04); bare `AT-15` citations resolved to `AT-15a`/`AT-15b` and the AC-3.4 asymmetry tabulated (TE F-06); **Architecture**'s byte-identity opener restated as recognises-scoped, matching the corrected *Redaction* opener (PM F-01); the upstream-errata table reduced to the one item FSPEC HEAD still owes (AC-4.4 vs BR-12a), with the BR-14, AT-44 and AT-32 items withdrawn at every site that asserted them and T-Q-01's trailing clause updated (PM F-02); NFR-5 re-attributed to REQ §4 (PM F-03, TE F-05). |
| 0.5 | cross-review round 5 (PM, TE) + Phase R erratum | Erratum edit, re-grounded on REQ v1.6 / **FSPEC v0.7** at HEAD (v0.7 moved only Q-07's BR-24-vs-BR-29 citation and the v0.5 changelog entry; this TSPEC already cites BR-24 for the guard-path extra, so no absorption was owed, and FSPEC v0.7 itself records that BR-10/BR-11b already carry REQ AC-3.4's reading). Changes: the "`!startup.ok` branch is **not** modified" claim restated at all three sites as *shipped refusal behaviour preserved byte-for-byte, with the `--loop-state` path additionally supplying the `loop` block on the existing `emitReport` seam*, with policy-table row 1 named as its oracle (TE F-01, PM F-03); the summary's `stop reason` producer cell corrected and a new paragraph naming `cmdQueue`'s import of `sessionSummary` as the producer of the zero-iteration BR-28 summary on both refusal paths, echoed in the `cli.mjs` artifact row and the `cmdQueue` export row (TE F-02a); "prefix-anchored" made normative — the run must **begin** with a catalogue prefix, left boundary `(?<![A-Za-z0-9_\-])`, interior-prefix runs explicitly not matched — with AT-34a grown to three seeds including an interior-`sk-` token as the anchor control (TE F-03); the `redactEntryText` property row restated to draw a **concrete `prefix` instance** from each character class and to quantify its non-firing half over inputs carrying **no catalogue prefix at any position** rather than over "any valid `--loop-state` token", with the base64url/`AKIA` collision recorded as DEC-LOOP-05's accepted residual (PM F-01, PM F-02); AT-44 given a `notEqual` conjunct over the two rendered `detail` strings, so §5's distinguishability claim has a falsifier (TE F-04); the one surviving upstream-errata row re-filed against **REQ** (AC-4.4's rationale clause) rather than FSPEC, naming both sides and which to narrow (TE F-05); a **downstream erratum owed to DECISIONS** recorded for `DEC-LOOP-06` and `DEC-LOOP-04`, which are stale against v0.4 — this is Phase R's raised item, and it is a DECISIONS-side edit, since this TSPEC already states the correct form (PM F-04, Phase R). |
| 0.6 | Phase P erratum | Targeted erratum edit, re-grounded on **REQ v1.8 / FSPEC v0.8** at HEAD. Upstream moved: REQ §5 now carries an explicit **carve-out (in scope)** for widening the completed `pdlc-engine-distribution` feature's distribution and release-gate file enumerations, NFR-1 names that feature as a fifth inherited authority with that single exception, FSPEC §2/BR-21 restate the carve-out and its additive-only bound, and FSPEC **AT-52** falsifies it. This TSPEC absorbs all four: a new **Architecture §7** names the *packed channel* that carries `lib/loop-session.mjs` and `lib/escalation-view.mjs` onto an installed engine — `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, the `_tspec-packed-set.mjs` transcription and `tspecPackedCount`'s vendored class size, plus the spec-side co-change against `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 / FSPEC §5.2 — closing the `ERR_MODULE_NOT_FOUND` gap where the feature passes in a dev checkout and fails on a published engine (te-review, se-author ×2). §What this feature adds gains the four distribution artifacts; **Traceability** gains AT-52 and BR-21's row is corrected from *"no gate modified"* to the carve-out's widened-not-changed form; the AT range reads AT-01…AT-52 (pm-review). No other text changed. |
| 0.7 | cross-review round 9 (PM, TE) + Phase P erratum | Targeted erratum edit, re-grounded on **REQ v1.8 / FSPEC v0.8** at HEAD (the dispatch's cited FSPEC hash matches no commit on this branch; HEAD's FSPEC was used, per the *upstream at HEAD* rule — see upstream-snapshot note below). Upstream decided nothing new since v0.6, so this round is corrective only. Changes: **Architecture §7**'s channel grows a **fifth** member — `WORKFLOW_MODULE_NAMES` in `pdlc/engine/scripts/fixture-machine.mjs`, a second independent flat literal that lands with D-1 or every leg of the required `Fixture machine` check reds (TE F-01); D-1's copy-step sentence restated as an explicit **obligation on `runPrepack`** to create each path-bearing name's parent directory, since HEAD's `copyFileSync` has no `mkdirSync` and throws `ENOENT` (TE F-04); a new *Who proves which conjunct* paragraph decides D-4's prover — test-time document oracle derived from `tspecPackedCount`, not a review-time obligation (TE F-03); **Test Strategy** → *Levels and homes* gains AT-52's two rows (a new `loop-distribution.test.js` under `Engine tests`, and the existing `npm-pack-install-upgrade` fixture-machine leg) plus the reused `packRealTarball()` vendor-tree fixture (TE F-02). The **two widenings, one kind** reconciliation: *Coverage floor* and the **BR-21** traceability row now state that the c8 `include` widening and D-1…D-5 are the same permitted move under **NFR-1**'s kind-scoped exception, that REQ §5's feature-scoped wording names only the first site, and route the narrowing as **upstream erratum 2** (PM F-02). **DECISIONS v0.5** extends `DEC-LOOP-05` with residual **(b)**, the false positive — a `--loop-state` token whose run begins with a catalogue prefix is destroyed — and every TSPEC citation of the base64url/`AKIA` collision now names `DEC-LOOP-05 (b)` and states that NFR-5/BR-18/Q-10 are false-negative-scoped (PM F-03). **Data Model** §2's Q-07 clause reworded to acknowledge **BR-24 as the home-excluding authority** while keeping the consumer-widening reason for `guardPaths: []` (PM F-04). Stale upstream version pins dropped from every body citation — each now cites the clause at HEAD, and the round's upstream binding is carried by the erratum dispatch's snapshot plus this changelog row rather than by pins that go stale one upstream revision later (PM F-01). **Upstream-snapshot note (PM F-05):** the round cited FSPEC as `sha256:6bf027f4…`, which no commit on this branch produces; HEAD is `sha256:e9188c2f…` (v0.8). No conclusion changes — the fix is in the dispatch workflow, which must take the snapshot from the committed HEAD of each upstream file — and it is recorded here so the round's binding is reconstructible. No other text changed. |
| 0.8 | cross-review round 10 (PM, TE) → `POSTMORTEM-P` R-1…R-4 | Halt-remediation edit. Still grounded on **REQ v1.8 / FSPEC v0.8** at HEAD; upstream decided nothing new, so this round is corrective only. **R-1 (TE F-01, High):** **Architecture §7** grows a **sixth** member, **D-6** — `WORKFLOW_MODULE_NAMES` and `packRealTarball()` in `pdlc/engine/__tests__/packaging.test.js`. v0.7's claim that `packaging.test.js` "needs no row of its own" because its constant is derived from D-2 is **withdrawn as false**: the derivation is `WORKFLOW_MEMBERS.filter(…).map(m => path.basename(m))` (`packaging.test.js:49-51`), and `path.basename` **flattens the `lib/` segment**, so growing D-3 alone yields bare `loop-session.mjs`, resolves to the non-existent `pdlc/workflows/loop-session.mjs`, and `packRealTarball()` throws `ENOENT` — reddening the required `Engine tests (ubuntu-latest)` check. D-6 states the obligation (preserve each member's relative path, `mkdirSync` its parent) and lands with D-1/D-3 in the same task. *(Corrected at v1.0: the constant D-6 derives from is **D-3**'s `WORKFLOW_MEMBERS`, imported from `_tspec-packed-set.mjs`, not D-2's module-private literal — the causal claim is unchanged in substance; the co-landing pair is corrected to D-1/D-3 above.)* **Test Strategy**'s `Distribution` row and its `packRealTarball()` paragraph, which inherited the error via "reuses that recipe", are corrected to say the recipe reused is the **corrected** one. **R-2 (PM F-01 + TE F-02, Medium, one clause from two lenses):** the **"NFR-1 is kind-scoped"** argument is **dropped entirely** — it rested on a truncated quotation. NFR-1 at HEAD **defers to §5** ("with the single exception §5's carve-out grants") and is qualified to "`pdlc-engine-distribution`'s file enumerations"; FSPEC **BR-21 restates that sentence verbatim**, so the §5-vs-NFR-1 divergence v0.7 asserted **does not exist**. The c8 `include` widening is re-argued from **REQ §5's out-of-scope clause** instead: what is out of scope is *changing what a gate delivered by orders 1–4 asserts*, and widening the file set the ≥85% per-file branch floor ranges over changes no assertion. **Architecture §7**'s paragraph, *Coverage floor*, the **BR-21** traceability row and **upstream erratum 2** are rewritten to match, and erratum 2 is now routed to **FSPEC BR-21 as well as REQ §5**, and re-characterised as a clarity narrowing rather than a permission request. **R-3 (TE F-03, Medium, inherited from round 9):** the claim that the two new c8 `include` entries are "covered by an existing oracle" was **false as to presence** and is withdrawn. `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` (`:37-41`) is a literal transcription of the three pre-existing workflow entries and its resolution oracle iterates the block **as found**, so it passes over a block that never gained them. *Coverage floor* now specifies **extending `REQUIRED_INCLUDES` with `**/pdlc/workflows/lib/loop-session.mjs` and `**/pdlc/workflows/lib/escalation-view.mjs`**, in the same task as the `include` edit. **R-4 (Lows):** (a) a **Scope note** in §7 marks the D-5 and D-6 conjuncts **TSPEC-added, beyond AT-52** — AT-52 scopes its additive-only conjunct to distribution/release-gate enumerations and approved `pdlc-engine-distribution` tables, and both harness literals are neither; no FSPEC erratum is routed, the extension being downstream-only. (b) AT-32's quotation corrected in **Data Model** §2 and **T-Q-01** — "read from **the** repo's tracked default-branch content", per FSPEC HEAD. (c) the surviving version pin in "the framing FSPEC v0.6 Q-03 decides" dropped, completing v0.7's pin sweep. **R-5 is out of scope for this document** — it is an engine-side dispatch-snapshot defect with no document edit owed. No other text changed. |
| 0.9 | Phase D erratum round | Targeted erratum edit; still grounded on **REQ v1.8 / FSPEC v0.8** at HEAD (this dispatch again cites FSPEC `sha256:6bf027f4…`, which no commit on this branch produces — HEAD is `sha256:e9188c2f…`; HEAD's bytes were used, per the *upstream at HEAD* rule). Upstream decided nothing new, so this round is corrective only. Two items, both in **Traceability & Open Items**: **(1)** the *Downstream erratum owed to `DECISIONS-pdlc-engineering-loop.md`* note is **marked DISCHARGED** (PM). Its two claims — that `DEC-LOOP-06` records `cmdQueue`'s `!startup.ok` branch as policy-aware on the `--loop-state` path, and that `DEC-LOOP-04`'s rejected alternative is stale against v0.4's `readLoopConfig` re-framing — were corrected at **DECISIONS v0.4** and remain correct at **DECISIONS v0.6 (HEAD)**, where `DEC-LOOP-06` reads *"left untouched; the policy asymmetry lives in the loop"* and `DEC-LOOP-04` is stated as an extension of the `readEngineConfig` precedent. Nothing is owed to DECISIONS; the note is retained in discharged form so the closure is visible and the item is not re-raised. **(2)** a new *Erratum-dispatch upstream snapshot is stale* note records the recurring **workflow-side** defect (SE; TE DECISIONS v6 Q-01): the dispatch header has cited `sha256:ff32fa3f…` (DECISIONS v5/v6, PLAN v3/v4) and `sha256:6bf027f4…` (TSPEC v9/v10), neither of which any committed FSPEC revision hashes to, and the stale anchor is re-propagated round to round and will not self-correct. No conclusion depends on it — every round re-grounds on committed HEAD and the binding is carried by this changelog's upstream *version* names — and the fix belongs to the dispatch workflow, not to any artifact under `docs/pdlc-engineering-loop/`. No other text changed. |
| 1.0 | Phase PR erratum round 11 (PM, TE) | Targeted erratum edit; still grounded on **REQ v1.8 / FSPEC v0.8** at HEAD (this dispatch again cites FSPEC `sha256:6bf027f4…`, which no commit on this branch produces — HEAD is `sha256:e9188c2f…`; HEAD's bytes were used, per the *upstream at HEAD* rule, and the defect is the workflow-owned R-5/PM F-01 item already recorded at v0.9). Upstream decided nothing new, so this round is corrective only. **Raised item (PM, SE, TE, agreeing):** **Test Strategy** → *Levels and homes* had no row for four test files the PLAN names as deliverables and whose names match none of the table's `loopSession*` / `escalationView*` globs — four rows added: `loopBaselinePreflight.test.js` (PLAN `P0-00`'s existence-only BL-PREREQ pre-flight gate), `loopEntryVocabulary.test.js` (**AT-21**, the non-advisory `renderEscalationEntry` branch and the `LOOP_SOURCES` import), `loopDecisionEntry.test.js` (**AT-25**, `renderDecisionEntry`'s five-row block and the literal `entryId` digest) and `pdlc/engine/__tests__/loop-startup-remediation.test.js` (**AT-44**'s `STARTUP_REMEDIATION` half and the pre-refactor golden capture, with the `"strict"`/`"off"` policy cases staying in `loop-cli.test.js`). No test-level or CI-check set changes: all four sit in the two suites the four-check table already lists. **Round-11 cross-review findings:** **TE F-01 (Medium)** — D-6's derivation named the wrong upstream constant; `packaging.test.js` imports `WORKFLOW_MEMBERS` from `./_tspec-packed-set.mjs` (**D-3**) and takes only `buildPairingRecord` from `publish-preflight.mjs` (D-2), so `D-2` → `D-3` in the §7 D-6 row, the *Ordering* clause, the `packRealTarball()` recipe paragraph and the v0.8 changelog row; the causal claim and the co-landing requirement are unchanged. **TE F-02 (Low)** — the *Scope note* now states the consequence explicitly: D-5/D-6, being outside AT-52's scope, are also outside NFR-1/BR-21's carve-out, and BR-21's *"covers D-1…D-6"* is shorthand for the site table; nothing turns on it, since neither changes an assertion. **TE F-03 (Low)** — the `Distribution` row records that D-6's constant is derived from D-3 and adds no falsifying power, D-6's falsifier being `packRealTarball()` completing without `ENOENT` in `packaging.test.js`. **PM F-02 (Low)** — every bare line anchor into `packaging.test.js` now also names the symbol it points at (`WORKFLOW_MODULE_NAMES`, `packRealTarball`, its single workflows-tree `mkdirSync`, its per-name `cpSync` loop), so the citations survive PLAN `P7-02`'s rewrite. **PM F-01** is workflow-owned and already recorded at v0.9; no document edit is owed. No other text changed. |
| 1.1 | cross-review round 12 (PM, TE) | Corrective only; still grounded on **REQ v1.8 / FSPEC v0.8** at HEAD, which decided nothing new since v1.0. **PM F-01 (Low, delta)** — the *Erratum-dispatch upstream snapshot is stale* note in **Traceability & Open Items** is restated as a **standing condition** rather than a per-round enumeration: it now says the condition holds for every round from the DECISIONS v5 round onward, records that the footprint spans **every doc type on this branch** (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES) and not only TSPEC, gives the re-derivation recipe (`grep -l '6bf027f4' docs/pdlc-engineering-loop/*.md`) instead of a list that goes stale next round, and corrects the mis-citation — the first raising is **PM TSPEC v9 F-05**, with PM/TE TSPEC v10 as its recurrences (v1.0 wrongly attributed F-05 to the v10 round). **TE F-01 (Medium), TE F-02 (Low), TE F-03 (Low) and PM F-02 (Low)** are all tagged *inherited* and were **already applied at v1.0** — §7's D-6 row and *Ordering* clause read **D-3**, the *Scope note* carries the one-clause reconciliation with the BR-21 row, *Levels and homes*' `Distribution` row records that D-6's constant re-derives D-3 and names `packRealTarball()`'s `ENOENT` completion in `packaging.test.js` as D-6's real falsifier, and every `packaging.test.js` line anchor names the symbol it points at. They are re-raised against a pre-v1.0 state; **no further document edit is owed** and nothing was rewritten (per the *address only what is not already reflected* rule). No other text changed. |
| 1.2 | cross-review round 14 (PM, TE) | Corrective only; still grounded on **REQ v1.8 / FSPEC v0.8** at HEAD, byte-identical since v1.0, which decided nothing new. **PM F-01 (High) — the *Erratum-dispatch upstream snapshot is stale* note is withdrawn as false and replaced by *Dispatch-header `UPSTREAM-STATE` digests are correct*.** The pipeline digests a document with `sha256Hex` (`pdlc/workflows/orchestrate-dev.js`), which hashes `canonicaliseForDigest(text)` — CRLF/CR → LF plus exactly one trailing newline, applied inside the digest function — so it is **not** `shasum -a 256` / `git hash-object`. Running `approvalHashOf` over all 38 commits touching `FSPEC-pdlc-engineering-loop.md`: `1b3d6ff4c` (v0.7) → `sha256:ff32fa3f…` and `9847882e2` (v0.8, = HEAD content) → `sha256:6bf027f4…` — precisely the two values the withdrawn note said no commit produces, and `deriveApprovalUpstreamState` takes each row from the upstream file as it exists at dispatch time, so the header has been correct every round. Confirmed independently by the FSPEC's own approval anchors in `CROSS-REVIEW-software-engineer-FSPEC-v13.md` and `CROSS-REVIEW-test-engineer-FSPEC-v14.md`. Nothing is owed to the dispatch workflow — which is `orchestrate-dev.js`, the code this feature ships — and no document edit is owed; what survives is a reviewer invariant (digest with the pipeline's `sha256Hex`, never with `shasum`). The *not TSPEC-scoped* footprint sentence (**PM F-02**, **TE F-01** — REQ carries no `UPSTREAM-STATE: FSPEC` row at all, as `erratumDocTypesAbove` requires, and the FSPEC hits are `APPROVAL-HASH` lines) and the `grep -l '6bf027f4'` re-derivation recipe (**PM F-03**, **TE F-04** — over-collects the TSPEC itself, two POSTMORTEMs and the counter-evidence, and misses the `ff32fa3f` alternant) are deleted with the paragraph, as is the first-raising attribution sentence (**TE F-02** — correct for the `6bf027f4` half only, while the widened condition's earliest raising is TE DECISIONS v5 Q-01). **PM F-04 (Medium):** the v1.0 changelog's `P7-04` corrected to **`P7-02`** — PLAN Phase 7 at HEAD is `P7-00`…`P7-03` and `P7-02` is the task that writes `packaging.test.js`. **TE F-03 (Medium):** v1.1's disposition of TE v13 F-01/F-02/F-03 as *already applied at v1.0* was wrong — the three cited sites were unchanged — and they are applied here: the v0.8 row reads **D-1/D-3** with its v1.0 parenthetical no longer asserting the co-landing pair unchanged; both *single `mkdirSync`* citations (§7 D-6 row, the `packRealTarball()` recipe paragraph) read **single workflows-tree `mkdirSync` call**, since `packRealTarball()` calls `mkdirSync` for `buildEngineDir` and `buildWorkflowsDir` and again per member inside the copy loop (**PM F-05**); and *Levels and homes* names AT-44's `loop-cli.test.js` half as its **`"strict"`/`"off"` policy cases** rather than its *engine half*, which `loop-startup-remediation.test.js` also carries. No other text changed. |

## Overview

This TSPEC specifies the implementation of the session-level engineering loop the FSPEC describes:
a `/loop`-driven session that invokes the queue driver once per iteration, decides stop-vs-backoff,
refuses to start on an unsafe machine, renders one operator view over `docs/_queue/ESCALATIONS.md`,
and reports on itself.

### The load-bearing constraint: where the behaviour may live

REQ AC-1.1 / FSPEC BR-26 say the loop prompt template is an operator *convenience*: an operator who
types `/loop run /pdlc:orchestrate-queue` gets every outcome REQ-LOOP-01…07 requires. That forbids
putting any required behaviour in `pdlc/templates/loop.md`. Everything required must therefore be
reachable from the `orchestrate-queue` skill and the engine CLI it delegates to — the skill's own
"Invocation Contract" already states `/pdlc:orchestrate-queue` "Delegates to: `pdlc queue`" and
"processes **at most one** ready REQ per invocation, then returns"
(`pdlc/skills/orchestrate-queue/SKILL.md`, §Invocation Contract).

Two facts about HEAD fix the shape of the solution:

1. **A queue invocation is a process.** `pdlc queue` without `--loop` calls `runQueue`
   (`pdlc/engine/lib/run.mjs`), which imports `orchestrate-queue.js` and returns one report; the
   process then exits. No in-memory state survives to the next iteration.
2. **The waiting agent is the session, not the process.** `runQueueLoop`
   (`pdlc/engine/lib/run.mjs`) is the *in-engine* iterator: it stops on one of
   `LOOP_STOP_REASONS` = `["exhausted", "bound-reached", "blocked", "refused"]`
   (`pdlc/engine/lib/run.mjs`, `LOOP_STOP_REASONS`) and, per its own doc comment, folds
   `idle`/`no-queue` onto `"exhausted"` and continues past a halt. REQ AC-1.5 and FSPEC BR-06/BR-07
   deliberately diverge from both. That path is left exactly as it ships and is neither used nor
   retired by this feature.

So the loop is implemented as a **directive protocol**: each `pdlc queue` invocation computes, from
its own outcome plus a caller-supplied session-state token, a `loop` block naming either `stop`
(with a reason from FSPEC §3.4's closed ten-member enumeration) or `continue` (with a wait in
minutes and the next token). The session — the `/loop` driver, following the `orchestrate-queue`
skill — performs the wait and echoes the token back. All decision logic is pure and unit-testable;
only the waiting is agent-performed.

### What this feature adds, by artifact

| Artifact | Kind | Why |
|---|---|---|
| `pdlc/workflows/lib/loop-session.mjs` | new pure module | Config read, preflight decision, outcome dispatch, backoff schedule, session-state codec, report field sets |
| `pdlc/workflows/lib/escalation-view.mjs` | new pure module | Log parse, decision-record overlay, recurrence collapse, blocked-feature count, ordering |
| `pdlc/workflows/orchestrate-queue.js` | modified | Wires the two modules into `main`; appends halt escalations; carries `loop` + `operatorView` onto the report |
| `pdlc/workflows/orchestrate-dev.js` | modified | Appends merge-refusal escalations; `renderEscalationEntry` gains the non-advisory `Source` form |
| `pdlc/workflows/consolidate-learnings.js` | modified | `parseEscalations` filters non-advisory blocks out of `corpusState` as well as the counts |
| `pdlc/engine/bin/cli.mjs` | modified | `pdlc queue` gains `--loop-state <token>` (the `!startup.ok` branch's **shipped refusal behaviour is preserved byte-for-byte**; the `--loop-state` path additionally supplies the `loop` block on the existing `emitReport` seam); imports `sessionSummary` from `loop-session.mjs` to render the zero-iteration summary BR-28 owes on the two refusal paths; prints the loop directive and the operator view |
| `pdlc/engine/lib/startup.mjs` | modified | exports `STARTUP_REMEDIATION`, the one two-remedy sentence `cmdDoctor` and preflight now share |
| `pdlc/skills/orchestrate-queue/SKILL.md` | modified | The session-side half of the directive protocol |
| `pdlc/templates/loop.md` | new | AC-1.1's template (convenience only) |
| `.claude/pdlc.config.example.json` | modified | Adds the `loop` section and the `merge` section (BR-29) |
| `pdlc/OPERATIONS.md`, `pdlc/README.md` | modified | REQ-LOOP-05/06 documentation surfaces |
| `pdlc/engine/scripts/prepack.mjs` | modified | Distribution (§7). `MODULE_NAMES` is a flat two-entry list at HEAD and creates no `lib/` subdirectory; it gains the two `lib/` members so the vendored tree carries them |
| `pdlc/engine/scripts/publish-preflight.mjs` | modified | Distribution (§7). PF-5's `WORKFLOW_MEMBERS` gains the same two `vendor/workflows/lib/*.mjs` members |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | modified | Distribution (§7). The packed-set transcription gains the two members and `tspecPackedCount`'s vendored class size goes `3` → `5`; its header forbids changing it without its spec side in the same change |
| `docs/completed/pdlc-engine-distribution/` TSPEC §5.4, FSPEC §5.2 | amended (versioned) | Distribution (§7). The spec side of that co-change: the `PK-*` table and the per-class counts read **five** vendored members. In scope by REQ §5's carve-out; it widens an enumeration without changing what any gate asserts |

### Altitude

This document fixes module boundaries, exported symbols, data shapes and error behaviour. Task
ordering, batching and file ownership are the PLAN's. Property statements are the PROPERTIES
document's; the acceptance tests named here are the FSPEC's AT-01…AT-52, mapped in **Traceability**.

## Architecture

### 1. Module graph

```
pdlc/engine/bin/cli.mjs  (cmdQueue)
  └─ pdlc/engine/lib/run.mjs  (runQueue — unchanged)
       └─ pdlc/workflows/orchestrate-queue.js  (main)
            ├─ lib/loop-session.mjs      [pure]
            │    readLoopConfig · evaluatePreflight · decodeLoopState ·
            │    encodeLoopState · nextDirective · notice · collectNotices ·
            │    iterationLine · sessionSummary
            ├─ lib/escalation-view.mjs   [pure]
            │    parseEscalationLog · canonicalBlockText · entryId ·
            │    blockedFeatureCounts · buildOperatorView
            └─ orchestrate-dev.js  (appendEscalationEntry, renderEscalationEntry,
                                    effectiveGuardPaths, MERGE_GUARD_DEFAULTS)
```

Both new modules are **pure**: no `fs`, no `child_process`, no `Date.now()`. Every input is a
value passed in; every clock read comes from an injected `_now`. This mirrors the shipped idiom —
`renderEscalationEntry` (`pdlc/workflows/orchestrate-dev.js`) takes `{ now }` rather than reading a
clock, and `parseEscalations` (`pdlc/workflows/consolidate-learnings.js`) takes text rather than a
path. IO stays in `orchestrate-queue.js`'s existing injected seams (`readFileFn`, `_appendFile`,
`gitFn`), so a test never touches disk.

`lib/` is the established home for a pure workflow helper: `pdlc/workflows/lib/document-oracles.mjs`
is its only current inhabitant, and it is `.mjs` — the two new modules follow it.

### 2. The directive protocol (FSPEC §3.1, §3.2)

One `/loop` iteration is exactly one `pdlc queue` process. The session-scoped state FSPEC §3.1 names
— the once-per-session preflight marker, the consecutive-idle counter, the schedule position — is
carried **through the caller**, not through a durable file (Q-08; DEC-LOOP-01 below).

```
session start
  └─ pdlc queue --loop-state new     → preflight runs, directive emitted
  └─ pdlc queue --loop-state <T1>    → preflight skipped (T1 says it ran), directive emitted
  └─ …
```

`--loop-state` is present on **every** iteration, including the first, where the reserved literal
`new` means "start a session" (**Architecture** §3): it is the loop-mode marker that keeps
`cmdQueue`'s fail-closed refusal byte-identical for every non-loop invocation. It is an
**internal protocol detail supplied by the skill**, not an operator-facing surface: an operator
types `/loop run /pdlc:orchestrate-queue` and never types the flag. It is therefore documented in
`pdlc/OPERATIONS.md` under the protocol, and is **not** a member of BR-25's four-item steady-state
operator surface — which is what keeps AT-33's set-equality true.

A directive is one of:

| Kind | Emitted when | Session does |
|---|---|---|
| `stop` | any of FSPEC §3.4's ten stop reasons | ends the session, prints the summary |
| `continue` | `ran` (wait 0) or a backoff-entering `idle` (wait = schedule[n]) | waits `waitMinutes`, re-invokes with `nextState` |

`ran` yields `continue` with `waitMinutes: 0` (BR-04: continue immediately, no interval).

**Why a token and not a state file.** BR-19 forbids the driver a queue-row write; a state file is
not a row write, so it is not forbidden outright. It is rejected anyway: a durable file survives the
session that created it, so a stale file from an abandoned session would silently seed a fresh
session's idle counter — and E-24's required behaviour ("state lost mid-run ⇒ behave as a fresh
session") would have to be *simulated* rather than falling out. With a token, losing the transcript
loses the token, which is exactly a fresh session; E-24 is structural, not a special case. See
DECISIONS DEC-LOOP-01.

**Why not `--loop` with in-process sleeping.** `runQueueLoop` already exists and could be taught to
sleep. Rejected: REQ AC-1.5 requires the two paths to diverge observably on `halted` (AT-04), and a
60-minute in-process sleep holds a Node process and an authenticated adapter for an hour with no
operator-visible progress. See DEC-LOOP-02.

### 3. Preflight (FSPEC §3.1 S1–S3, BR-10, BR-11)

Preflight runs when the incoming token declares no prior preflight — i.e. on iteration 1, and again
after a state loss (E-24, AT-48). It has exactly two conditions:

**Engine readiness (BR-10).** The loop does **not** shell out to `pdlc doctor`. It consumes the same
value `cmdDoctor` consumes: `runStartupChecks` (`pdlc/engine/lib/startup.mjs`) returns
`{ok, rungs, banner, pluginRoot, reason, …}`, and `cmdQueue` (`pdlc/engine/bin/cli.mjs`) already
calls `deps.startupFor(argv)` and refuses on `!startup.ok` before anything else runs. Preflight
therefore reads `startup.ok`, `startup.reason` and `startup.rungs` in-process. This answers Q-06 /
REQ O-4 without a subprocess:

| Contract element | Value at HEAD | Citation |
|---|---|---|
| ok/not-ok | `startup.ok` boolean | `runStartupChecks`, `pdlc/engine/lib/startup.mjs` |
| reason | `startup.reason`, `null` when ok, else newline-joined `rung {id} ({name}): {detail}` | same |
| per-rung state | `rungs[].state` ∈ `pass`/`fail`/`skipped`, rendered `PASS`/`FAIL`/`SKIP` by `cmdDoctor` | `cmdDoctor`, `pdlc/engine/bin/cli.mjs` |
| remediation | the two-remedy line `cmdDoctor` prints on not-ok (`--plugin-root <path>`, or the env var *with* `--dev`) — at HEAD an inline template literal inside `cmdDoctor` interpolating the module-local `PLUGIN_ROOT_ENV`, neither exported nor shared (`cmdDoctor`, `pdlc/engine/bin/cli.mjs`; `PLUGIN_ROOT_ENV`, `pdlc/engine/lib/skills.mjs`). This feature **extracts it** — see "One remediation sentence" below | same |
| exit code | `pdlc doctor` sets `process.exitCode = 1` from the **startup** result only; the version preamble's own exit code is computed but not applied in `cmdDoctor` | `cmdVersion` vs `cmdDoctor`, cli.mjs |

The last row is what makes BR-10's "the version preamble is excluded" true at HEAD rather than
merely intended: `cmdDoctor` calls `versionDoctorFor(argv, "doctor")`, prints `version.lines`, and
never assigns `version.exitCode`. A version mismatch is therefore a **notice**, not a refusal
(AT-12).

**Working tree (BR-11).** Evaluated through the existing `gitFn` seam:

| Policy | Command | Refuses on |
|---|---|---|
| `"tracked"` (default) | `git status --porcelain --untracked-files=no` | any non-empty output |
| `"any"` | `git status --porcelain --untracked-files=normal` | any non-empty output |

Ignored files never appear in either (git omits them without `--ignored`), which is E-16 by
construction rather than by filtering. Both forms are run in the consuming repo's `cwd`, on
whichever branch the session is on — no branch-name predicate (BR-11).

**One remediation sentence, one home.** AT-44 must assert that the `"off"` warning names *the same*
remediation a refusal would name. At HEAD that sentence exists only as an inline literal inside
`cmdDoctor`, so a test could only re-type it (a duplicate that drifts silently) or import the
function under test (an implementation echo). This feature therefore extracts it to one exported
frozen constant, `STARTUP_REMEDIATION` in `pdlc/engine/lib/startup.mjs` — the module that already
owns `startup.reason` and already imports `PLUGIN_ROOT_ENV` (`pdlc/engine/lib/startup.mjs`, its
`skills.mjs` import). `cmdDoctor` consumes it in place of its literal (its printed bytes unchanged),
and `evaluatePreflight`'s caller passes it in as `PreflightInput.remediation`, so the pure module
still reads no engine internals. AT-44 asserts a literal transcription of the sentence, written into
the test, against `STARTUP_REMEDIATION`, and asserts that the refusal path and the `"off"` warning
path carry that same value.

**Where the policy is applied, given `cmdQueue`'s fail-closed refusal.** `cmdQueue` returns on
`!startup.ok` before `queuePath` is read, before `liveAdapter`, before any loop branch
(`pdlc/engine/bin/cli.mjs`, the `if (!startup.ok)` block that emits `formatStartup(..., {withChecks:
true})`, `startup.reason`, the fail-closed C-10 line and `emitReport(null, …)`). **That branch's
shipped refusal behaviour is preserved byte-for-byte; the `--loop-state` path additionally supplies
the `loop` block `emitReport` already accepts** (`emitReport(report, {adapter, startup, startedAt,
finishedAt, loop})`, `pdlc/engine/bin/cli.mjs` — the `loop` parameter is a shipped seam, exercised
today by the `--loop` path). The precise claim is therefore *semantics unchanged, one additional
argument on the loop path* — not *zero edited bytes in the block*, which the loop's own `stop`
directive, `preflight-warning` notice and BR-28 summary would falsify, since the shipped call site
supplies no `loop` argument. The oracle is policy-table row 1: a non-loop invocation's stderr bytes
and exit code are unchanged (AT-44's non-loop half). REQ AC-3.4 and FSPEC BR-11b decide
the question directly — "`"off"`
suppresses the loop's own refusal, never the check … No value of `loop.preflight` makes an unready
engine run an iteration" — so `"off"` changes what the *loop* emits alongside the refusal, never
whether the engine dispatches:

| Invocation | `!startup.ok` behaviour |
|---|---|
| `pdlc queue` (no `--loop-state`), `pdlc queue --loop` | **unchanged, byte-for-byte**: refuse, `emitReport(null, …)`, C-10 fail-closed. This feature does not weaken the shipped refusal for any invocation that is not a loop iteration |
| `pdlc queue --loop-state <token>` with effective `loop.preflight: "strict"` | refuse, with the shipped bytes above **plus** the loop's own `stop` directive, reason `preflight-refused`, and the BR-28 summary at iteration count 0 (AT-11, AT-14) |
| `pdlc queue --loop-state <token>` with effective `loop.preflight: "off"` | **also refuse — the shipped branch is unchanged.** The loop emits a `preflight-warning` notice carrying `startup.reason` and `STARTUP_REMEDIATION` (so the operator is told the same condition and the same remediation a refusal would name), and then the shipped `!startup.ok` branch returns exactly as today: the startup report lines, the C-10 fail-closed line, `emitReport(null, …)`, exit code `1`, `runQueue` never reached, iteration count 0, `docs/_queue/QUEUE.md` byte-identical. The loop's `stop` directive carries reason `engine-dispatch-refused` — §3.4's tenth member, **distinct from** `preflight-refused`, because the refusal is the engine's own dispatch refusal and not the loop's preflight (AT-15b, AT-44, E-19) |

`--loop-state` is therefore the **loop-mode marker**, present on every iteration including the
first: the session-side skill invokes iteration 1 as `pdlc queue --loop-state new`, where `new` is a
reserved literal meaning "start a session". `decodeLoopState("new")` yields the fresh state and,
uniquely among undecodable inputs, raises **no** `session-restarted` notice; every *other*
undecodable token yields the same fresh state *with* that notice, which is what keeps AT-48
falsifiable. Reading the loop config to learn the effective policy therefore happens before the
refusal branch, on the `--loop-state` path only, through the same `readFileFn` seam
(`.claude/pdlc.config.json`, `MERGE_CONFIG_PATH`/`ADVISORY_CONFIG_PATH`, `orchestrate-dev.js`).

Under `preflight: "off"` both conditions are still evaluated and each failing one becomes a warning
notice naming the same condition and remediation (BR-11b); under `"strict"` a failure is the loop's
own refusal, which runs zero iterations and does not touch `docs/_queue/QUEUE.md` (BR-11a). **The
two conditions then part company under `"off"`, and that asymmetry is AC-3.4's whole content:**

| Failing condition under `"off"` | What happens next | Oracle |
|---|---|---|
| Working tree (BR-11) | warning emitted, **session proceeds to iteration 1** — nothing downstream refuses a dirty tree | FSPEC AT-15a |
| Engine readiness (BR-10) | warning emitted, then the engine's own `!startup.ok` branch refuses the dispatch: iteration count 0, zero waits taken, `QUEUE.md` byte-identical, stop reason `engine-dispatch-refused` | FSPEC AT-15b, E-19 |

Citations elsewhere in this document name the half they mean (`AT-15a` or `AT-15b`); a bare `AT-15`
under-resolves precisely across the distinction AC-3.4 draws. The refusal is emitted **before**
`readFileFn(queuePath)` in `main`, so byte-identity (AT-14) is structural. AT-44 traverses the
production `cmdQueue` path with the real refusal branch in place and only `deps.startupFor`
scripted — never `evaluatePreflight` in isolation, which would prove nothing about cli.mjs's return.

**E-20 has two sub-cases, and only one of them is in-process.** "The engine binary is missing **or
fails to start**" names two conditions with different detectors:

| Sub-case | Detector | Outcome |
|---|---|---|
| (a) Engine present, startup not ok ("fails to start") | in-process: `deps.startupFor(argv)` returns `ok: false` | the policy table above. `"strict"` ⇒ `preflight-refused` naming `startup.reason` + `STARTUP_REMEDIATION`; `"off"` ⇒ `preflight-warning` naming the same two, **then the engine's own dispatch refusal**, stop reason `engine-dispatch-refused`, zero iterations (AT-15b) |
| (b) Engine binary absent (`pdlc` not on `PATH`; launch fails, no process exists) | **session-side only**: the invocation exits without producing a parseable report — a launch failure, not a run failure (`command not found` / exit 127 / spawn `ENOENT`) | the session stops with `preflight-refused` and prints the install remediation the skill holds as a literal. This is distinguishable from `invocation-threw` (E-04), which is a *running* engine returning a failure the session can read |

Sub-case (b) is stated as `preflight-refused` under **both** policies, because `"off"` cannot
resurrect a process that never started: there is no in-process code to evaluate the policy, emit the
notice, or read a report. Sub-case (a) ends at zero iterations too, but by a different route and
under a different stop reason (`engine-dispatch-refused`), which is why the two are kept apart here.
FSPEC AT-44 is consistent with both: its `"off"` half requires "the engine's own dispatch
refusal observed, and the iteration count still zero", which sub-case (a) satisfies in-process and
sub-case (b) satisfies session-side. The session-side detection rule and its
remediation literal live in `pdlc/skills/orchestrate-queue/SKILL.md` alongside the rest of the
session's half of the protocol, and are exercised by the document oracle in
`loopDocumentSurfaces.test.js` (AT-44's (b) half).

### 4. The three escalation sources (FSPEC §3.5, Q-01)

At HEAD only the advisory source appends. Verified:

| Source | State at HEAD | Citation |
|---|---|---|
| Advisory seam | appends | `appendEscalationEntry({disposition, ctx, _appendFile, _now})` writes `renderEscalationEntry(...)` to `ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md"`, orchestrate-dev.js |
| Refused merge | does **not** append | `MERGE_ESCALATIONS.{guard,ci,queue,tree}` produce strings pushed onto `escalations`, which `pipelineFn` folds into the report's `notices` (`for (const line of mergeOutcome.escalations) notices.push(line)`), orchestrate-dev.js |
| Pipeline halt | does **not** append | the halt is written to the queue row (`newStatus = "halted"`) and into the report, orchestrate-queue.js |

**Decision (Q-01, REQ O-2/O-3): reuse the shipped writer, extend its entry vocabulary.** Both new
sources append through the existing `appendEscalationEntry`; no sibling writer is created. This is
the cite-and-reuse obligation — the atomic-append discipline, the `docs/_queue/` directory creation,
and the "throw is caught by the caller and becomes a notice, the phase outcome is unchanged"
contract (E-08, AT-29) all already exist there and are not re-derived.

`renderEscalationEntry` gains one branch: `ctx` carries **either** `seam` (advisory) **or** `source`
(non-advisory). The advisory branch's **structure** is byte-identical to today — same heading
`## {iso} — {feature} — {seam}`, same `| Seam | … |` row, same field order — so no existing advisory
entry, oracle or calibration reading changes.

**The byte-identity claim, stated exactly.** The redactor (BR-18, below and in **Error Handling**)
runs on **both** branches, because BR-18 is *recognises-scoped* rather than branch-scoped: what it
requires is that no entry carry a credential **the redaction check recognises**, and that obligation
attaches to the material, not to which branch rendered it (FSPEC BR-18; REQ NFR-5, §4). An
advisory entry may carry a credential in its diagnosis exactly as a merge-refusal entry may, so
running the redactor on only one branch would leave the other unchecked. So the advisory branch is *not*
unconditionally byte-identical, and the claim is narrowed to what is actually true and testable:

1. **Unconditionally** — the heading form, the `| Seam | {seam} |` row and the field order of the
   advisory branch are identical to HEAD. These are the only bytes `parseEscalations`,
   `ESCALATION_SEAM_ROW` and `ESCALATION_FEATURE_ROW` (`pdlc/workflows/consolidate-learnings.js`)
   read, so **no calibration reading changes under any input** — which is the property AT-20 needs
   and the only one this document ever needed.
2. **Conditionally** — the whole advisory entry is byte-identical to HEAD for any input whose
   redactable fields contain no match of the redaction pattern. Since the pattern is
   prefix-anchored on published credential shapes (**Error Handling**, "Redaction"), that covers
   every advisory entry the repo has ever written.

Stating (1) and (2) rather than a blanket identity is what makes the negative-control AT (AT-34a,
**Test Strategy**) meaningful: a legitimate 40-hex git oid and a valid `--loop-state` token must
survive **unredacted** on the advisory branch, which is an assertion about bytes rather than a
disclaimer about intent. The non-advisory branch emits `## {iso} — {feature} — {source}` and a
`| Source | … |` row **and no `| Seam |` row**. `source` is drawn from the closed set
`["pipeline-halt", "merge-refusal"]`, disjoint from `ADVISORY_SEAMS`
(`["A1","A2","A3","A4","A5","A6"]`, orchestrate-dev.js) by construction (BR-12a).

**Where each append sits.**

- *Merge refusal*: inside `phaseMerge`'s existing escalation sites, appended at the point each
  `escalations.push(MERGE_ESCALATIONS.…)` already fires, so the notice string and the log entry
  cannot diverge. The append is awaited outside the try/catch that owns the merge action, matching
  the advisory site's own placement.
- *Pipeline halt*: in `orchestrate-queue.js`, **after** `rewriteStatus(..., "halted", ...)` and
  before `finish({outcome: "halted", …})`. After, so the durable row — the record the operator acts
  on — is never lost to an append failure; and an append failure at that point is a report notice
  (E-08) while the row already reads `halted`.

### 5. Calibration isolation (FSPEC E-09, AT-20)

`parseEscalations` (`pdlc/workflows/consolidate-learnings.js`) keys a block on its `| Feature |` and
`| Seam |` rows and skips a block missing either — so a non-advisory entry already contributes
nothing to `bySeamFeature`, `totals`, `distinctFeatures` or `entryCount`. One field is **not**
isolated: `corpusState = blocks.length === 0 ? "empty" : "present"` is computed from the *raw* split
on `^## `, counting skipped blocks. A log holding only non-advisory entries therefore reports
`present` where the same log without them reports `empty` — and `main` turns that into
`state.reasons` (`no-advisory-corpus` / `advisory-corpus-empty`), while `seamCandidates` short-circuits
on `corpusState !== "present"`.

The change is one line's worth of derivation: `corpusState` becomes `empty` when **no block
contributed a key**, `present` otherwise. That makes the whole calibration output — per-seam totals,
distinct feature counts, entry count, corpus state, and the derived `{over, tie, under}` — identical
to its value over the same log with every non-advisory entry removed, which is exactly AT-20's
assertion. It also changes one pre-existing behaviour: a *malformed advisory* block (missing
`Feature` or `Seam`) no longer lifts an otherwise-empty corpus to `present`. That is the correct
direction — such a block contributes to no count either — and is recorded as DEC-LOOP-03.

### 6. The operator view (FSPEC §3.3, BR-13…BR-17)

`buildOperatorView` is pure and recomputed on every render; it holds no state between iterations
(AC-4.3). Pipeline:

1. **V1 read** — `readFileFn("docs/_queue/ESCALATIONS.md")`. `null` ⇒ empty view, no error, no file
   created (E-06, AT-28). `orchestrate-queue.js`'s `readFileFn` already returns `null` for a missing
   file, the same convention `main` uses for `QUEUE.md`.
2. **V2 parse** — split on `^## `, parse each block. An unparseable block is skipped and produces a
   parse notice carrying its 1-based block index and heading text (BR-16, AT-27).
3. **V3 collapse** — group the parsed *escalation* entries (decision blocks are not members) by the
   recurrence key below into one item, and compute `occurrences` as the group's **on-disk member
   count** — every block in the group, whether or not a decision names it. `entryIds` retains
   **every** member id, oldest first, so the item's `firstSeen` and its decision overlay both read
   from the same list (BR-15; AT-26, AT-43, AT-50).
4. **V4 decision overlay** — for each item, take the latest decision record (by `Decided at`,
   ties by file order) naming **any** id in `entryIds`. If that decision's outcome is `resolved` or
   `rejected` **and** it names the item's *latest* member id, the item is closed and omitted from
   the view. If it names an earlier member only — i.e. the escalation recurred after the decision —
   the item stays **open** and keeps the `occurrences` computed at V3 (BR-14; AT-25, AT-43).
5. **V5 order** — descending `blockedFeatures`, then oldest timestamp, then feature name ascending
   (BR-13, AT-22/AT-24).

**Why collapse precedes the overlay.** AT-43 requires that after one entry is resolved and the same
escalation is appended again, the view shows one **open** item whose occurrence count is the on-disk
count (2), because "a decision neither resets nor suppresses that count" (BR-15). Overlaying first
would drop the resolved block before grouping and leave the survivor at `occurrences: 1` — the other
answer. Collapsing first makes `occurrences` a function of the file alone, and makes closure a
property of the item rather than a deletion of a block, which is also the shape BR-14 states
("status is a **property of the view**"). AT-25 (resolved, no recurrence) and AT-43 (resolved, then
recurrence) are the two sides of the same rule and are asserted against the same pipeline.

**The recurrence key.** `(source-or-seam, feature, conditionKey)` — **not** the rendered decision
sentence. AC-4.5's subject is "the same **condition** recurs for the same feature", and the decision
sentence is generated prose: `renderEscalationEntry` renders `ctx.decision` verbatim through
`advisoryEntrySingleLine` (`pdlc/workflows/orchestrate-dev.js`), and two appends for one condition
routinely differ in it — a phase label, a count, an interpolated feature or file name. Keying on it
would render two items at `occurrences: 1` each, which is precisely the "one item per recurrence"
outcome AC-4.5 forbids, and would under-report AT-50's count of 3.

`conditionKey` is the entry's **closed-vocabulary** condition identity, in this order of preference:

| Rank | Source of `conditionKey` | Citation |
|---|---|---|
| 1 | the `\| Root cause \| {class} \|` row when present — a closed class vocabulary the advisory tier already emits | `renderEscalationEntry`'s `rootCause` row, `pdlc/workflows/orchestrate-dev.js` |
| 2 | otherwise the `\| Refusal reason \| {reason} \|` row, **normalised**: lowercased, runs of digits replaced by `#`, whitespace collapsed | same file, the `Refusal reason` row |
| 3 | otherwise the empty string — entries with neither row for one `(source-or-seam, feature)` pair collapse together, which is the conservative direction for AC-4.5 |

Rank 2's normalisation is stated here as the normative rule and transcribed literally into the test;
it is what lets two appends of one condition that differ only in an interpolated count collapse.
`conditionKey` is exposed on `EscalationEntry` so the grouping is assertable directly rather than
inferred from a rendered item.

**Blocked-feature count.** For an entry naming feature *F*: the number of `QUEUE.md` rows whose
status is not `done` that reach *F* through the transitive closure of **effective** dependencies,
excluding *F*. "Effective" is the union the queue itself resolves —
`Array.from(new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])]))` in
`orchestrate-queue.js`, feeding `precheckDependencies`; the same union the template states
("Effective dependencies = this table's Depends-On ∪ the REQ's own `depends-on`",
`pdlc/templates/QUEUE.md`). The closure is a BFS over a visited set, so a cycle terminates and each
feature is counted at most once (E-12, AT-42); a feature with no row counts 0 (E-10).

Reading REQ frontmatter for the `depends-on` half costs one `readFileFn` per queued feature. It is
done once per render, memoised per invocation, and a REQ that cannot be read contributes an empty
set rather than aborting the render.

**Decision records (Q-02, REQ O-3).** A decision may not rewrite a block, so it is appended as its
own block, with **four** field rows — REQ AC-4.4 requires the outcome, **who decided**, when, and
which entry the decision decides:

| Row | Domain | AC-4.4 clause |
|---|---|---|
| `Decision` | `resolved` \| `rejected` (closed, two members) | the outcome |
| `Decided by` | free text — the operator or agent identity | **who decided** |
| `Decides` | one `entryId` | which entry it decides |
| `Decided at` | ISO 8601 | when |
| `Rationale` | one sentence (optional) | — |

FSPEC BR-14 at HEAD names the decider explicitly — "its outcome, **who decided it**, when it
was decided, and which entry it decides" — so the field set above agrees with both the REQ and the
FSPEC and nothing is routed upstream on this point (v0.3's erratum on the omission is withdrawn).
`Decided by` is a *field*, not free prose, so AT-25 can read it without inventing a regex, and FSPEC
AT-25 reds when the decider is absent.

**`entryId` — the canonical byte range, normatively.** `entryId = sha256(canonicalBlock).slice(0,12)`
(hex, lowercase), where `canonicalBlock` is defined by this recipe and by nothing else:

1. Split the file on `/^## /m` — the same split the shipped precedent uses (`parseEscalations`,
   `pdlc/workflows/consolidate-learnings.js`).
2. `.trim()` each resulting chunk. Chunk `i` is the block's body **without** the `## ` prefix, the
   shipped precedent's exact treatment.
3. `canonicalBlock = "## " + trimmedChunk` — the prefix is re-attached as exactly three ASCII bytes,
   with no trailing newline and no trailing blank line.
4. Hash the UTF-8 encoding of `canonicalBlock`.

Step 3 exists because "the entry's exact block text including its heading" (v0.1) is *not* what a
splitter yields, and a writer and reader differing by a trim or by three characters produce
different digests, whose only symptom is an overlay that silently never matches. The recipe is
exported as `canonicalBlockText(chunk)` and `entryId(chunk)` from `escalation-view.mjs`, so writer
and reader cannot diverge, and **Data Model** §4a carries a worked literal example — one literal
block and its literal 12-character digest — which AT-25 transcribes into the test as a literal and
asserts against. AT-25 never calls a second hashing helper to compute its own expectation.

**A decision block has a writer.** `renderDecisionEntry({decision, decidedBy, decidesId, decidedAt,
rationale}, {now})` is exported from `orchestrate-dev.js` beside `renderEscalationEntry`, with the
same injected-clock shape, and is appended through the same `appendEscalationEntry`. An operator
resolving an entry therefore never computes SHA-256 by hand: `pdlc queue --loop-state …` prints each
open item's `entryId` in the rendered view, and the renderer takes it as an argument.

**Who reads a decision record.** AC-4.4 gives durability a reason: the record is input to
`pdlc-consolidation-agent`'s confidence calibration. Two things are true at once and both are
stated rather than one being hidden:

- **This feature ships the reader.** `parseEscalationLog` (exported, `escalation-view.mjs`) parses
  decision blocks into `EscalationEntry` records with `kind: "decision"` and the
  `decidedOutcome`/`decidedBy`/`decidesId`/`decidedAt` fields populated. Any consumer — the view,
  a future calibration pass, an operator script — reads them from that one export, from the log
  alone, with no grammar change required. That is the named consuming path, and AT-25's
  retrievability conjunct is asserted through it.
- **The calibration does not read them *yet*, deliberately.** BR-12a requires the calibration to
  count advisory entries only, over its whole output (AT-20). A decision block carries no
  `| Seam |` row, so `parseEscalations` skips it and the calibration is unmoved — which is what
  AT-20 asserts. AC-4.4's "input to calibration" clause and BR-12a's "advisory entries only" clause
  cannot both be discharged in this feature; the conflict is upstream and is raised as an ERRATUM
  on the FSPEC. This document implements BR-12a (the rule with an AT) and makes the record
  machine-readable so that the other clause costs a consumer, not a migration.

### 7. Distribution: the packed channel that carries `lib/` (FSPEC BR-21, AT-52; REQ §5 carve-out, NFR-1)

`lib/loop-session.mjs` and `lib/escalation-view.mjs` are named above by their **home in the source
tree**. A home is not a channel: the pipeline runs from the published engine (`@kaneho/pdlc-engine`),
which does not read `pdlc/workflows/` — it reads a build-time **vendored copy**. Naming the home
without naming the channel is exactly the failure the prior-feature record calls out, and here it is
load-bearing rather than cosmetic: at HEAD `prepack.mjs`'s `MODULE_NAMES` is the flat two-entry list
`["orchestrate-dev.js", "orchestrate-queue.js"]`, copied into `vendor/workflows/` with **no `lib/`
subdirectory created**. `orchestrate-queue.js`'s `import … from "./lib/loop-session.mjs"` therefore
resolves in a dev checkout and throws `ERR_MODULE_NOT_FOUND` on every installed engine — a defect
invisible to the whole workflows suite, which runs from the checkout.

The channel is the `pdlc-engine-distribution` feature's vendoring pipeline, and it has **six**
members that must move together — four in the shipped pipeline and two in the harnesses that
exercise it (one CI fixture machine, one engine test):

| # | Site | At HEAD | This feature |
|---|---|---|---|
| D-1 | `MODULE_NAMES`, `pdlc/engine/scripts/prepack.mjs` | flat, two entries; `runPrepack` copies each into `vendor/workflows/` and records `{name, source, sha256}` in `VENDOR-MANIFEST.json` | gains `lib/loop-session.mjs` and `lib/escalation-view.mjs` as **path-bearing** names. `runPrepack` **must be changed to create each name's parent directory before copying it**: at HEAD it calls `mkdirSync` once for `vendorDir` and then `copyFileSync` per name, which throws `ENOENT` on the first path-bearing name. The obligation is therefore a per-name `mkdirSync(path.dirname(dest), {recursive: true})` (or equivalent), not an incidental effect of the existing copy step; the manifest's `source` then reads `pdlc/workflows/lib/{name}.mjs` |
| D-2 | `WORKFLOW_MEMBERS`, `pdlc/engine/scripts/publish-preflight.mjs` | three members (`vendor/workflows/orchestrate-dev.js`, `…/orchestrate-queue.js`, `…/VENDOR-MANIFEST.json`); PF-4 checks the packed set, PF-5 checks manifest-vs-vendored-vs-canonical hashes | gains `vendor/workflows/lib/loop-session.mjs` and `vendor/workflows/lib/escalation-view.mjs` — five members. PF-5 then hashes them too, so a vendored copy that has drifted from its canonical source fails the release gate |
| D-3 | `WORKFLOW_MEMBERS` and `tspecPackedCount`, `pdlc/engine/__tests__/_tspec-packed-set.mjs` | the same three members transcribed once; `tspecPackedCount({licence})` is `4 + 15 + 3 + 1 + (licence ? 1 : 0)`, whose `3` is the vendored class size `packaging.test.js` consumes as `expectedMemberCount` | the same two members, and the vendored class size goes `3` → `5`. Growing D-2 without this reds `packaging.test.js` |
| D-4 | `docs/completed/pdlc-engine-distribution/` — TSPEC §5.4's `PK-*` table, FSPEC §5.2's per-class counts, AT-3.8b's *"three members and nothing else"* | enumerate the vendored class as three | amended, versioned, to read **five**. `_tspec-packed-set.mjs`'s own header makes this mandatory and orders it first: *"Adding, removing or re-classing a member is a SPEC change first … **Never this file alone**"* |
| D-5 | `WORKFLOW_MODULE_NAMES`, `pdlc/engine/scripts/fixture-machine.mjs` | a **second, independent** flat two-entry literal (`["orchestrate-dev.js", "orchestrate-queue.js"]`), copied into the scratch `$TMP/pdlc/workflows` tree the fixture machine packs from — it does **not** derive from D-1 | gains the same two path-bearing names. Landing D-1 without D-5 leaves the scratch tree missing `lib/`, so `runPrepack` throws inside the pack and **every leg of the required `Fixture machine (install/upgrade, launcher, container, two-repo)` check reds** — which is also the only CI surface that installs a published-shaped engine, hence AT-52's home |
| D-6 | `WORKFLOW_MODULE_NAMES` and `packRealTarball()`, `pdlc/engine/__tests__/packaging.test.js` | **derived, and lossily so**: `WORKFLOW_MODULE_NAMES` is `WORKFLOW_MEMBERS.filter(m => m !== "vendor/workflows/VENDOR-MANIFEST.json").map(m => path.basename(m))` (the `WORKFLOW_MODULE_NAMES` definition, `packaging.test.js:49-51` at HEAD) — and the `WORKFLOW_MEMBERS` it derives from is **D-3**'s, imported from `./_tspec-packed-set.mjs`, **not** D-2's module-private literal in `publish-preflight.mjs` (`packaging.test.js` imports only `buildPairingRecord` from that file), so `path.basename` **flattens the `lib/` segment**. the `packRealTarball()` helper (`:104`) then `mkdirSync`s only `$TMP/pdlc/workflows` (its single workflows-tree `mkdirSync` call, `:111`) and `cpSync`s `REPO_ROOT/pdlc/workflows/<name>` → `buildWorkflowsDir/<name>` in its per-name `cpSync` loop (`:119-123`) | growing **D-3** alone is **not** sufficient here, and is actively harmful: the derived names become the bare `loop-session.mjs` and `escalation-view.mjs`, which resolve to the **non-existent** `pdlc/workflows/loop-session.mjs`, so `packRealTarball()` throws `ENOENT`; were it not to throw, it would hand `prepack.mjs` a flat tree. The copier must **preserve the member's relative path**: for each member, copy `pdlc/workflows/<relpath-after-`vendor/workflows/`>` to `buildWorkflowsDir/<same relpath>`, creating parent directories (`mkdirSync(path.dirname(dest), {recursive: true})`), i.e. drop the `path.basename` flattening rather than compensate for it |

**Why this is in scope.** REQ §5's out-of-scope clause is *changing what any gate delivered by
orders 1–4 asserts*; D-1…D-6 change no assertion — they widen a **file enumeration** (or, at D-6, a
copy recipe that reads one) so the same assertions range over this feature's shipped files. REQ §5's **Carve-out (in scope)** grants exactly
this, NFR-1 names `pdlc-engine-distribution` as a fifth inherited authority with this single
exception, and FSPEC BR-21 restates it.

**The second widening rests on §5's out-of-scope clause, not on a kind-scoped NFR-1.** This feature
widens one further inherited enumeration outside D-1…D-6: the c8 `include` block in
`pdlc/workflows/package.json`, owned by the ≥85% per-file branch floor the required check
`Unit tests (ubuntu-latest, node 20)` enforces (**Test Strategy** → *Coverage floor*). It is **not**
carried by the carve-out: NFR-1 at HEAD defers to §5 (*"with the single exception §5's carve-out
grants"*) and is qualified to *"`pdlc-engine-distribution`'s file enumerations"*, and FSPEC BR-21
restates that sentence verbatim. Neither text states a kind-scoped exception independent of §5, and
the c8 block belongs to no `pdlc-engine-distribution` enumeration, so the carve-out does not reach
it and no §5-vs-NFR-1 wording divergence exists to reconcile.

What permits it is that it needs no exception. REQ §5 puts *"changing what any gate delivered by
orders 1–4 asserts"* out of scope; the `Unit tests` gate asserts a ≥85% per-file branch floor, and
adding two `**/`-anchored entries widens the **file set that assertion ranges over** without
changing the assertion. Two more files must now clear 85%; no file's floor moves, and no
pre-existing entry is removed or altered. This is the same additive-only shape as D-1…D-6, reached
by a different route: D-1…D-6 need the carve-out because they are `pdlc-engine-distribution`
enumerations that §5 would otherwise freeze; the c8 block never entered §5's prohibition at all.
**Upstream erratum 2** (below) is therefore a clarity narrowing, not a permission request, and it is
routed to **both** REQ §5 and FSPEC BR-21, since BR-21 carries the same sentence. D-4 is the reason the carve-out extends to the approved
tables and not only to the code: the release gate's enumeration and the table it must agree with are
one contract, and moving only the code would leave the gate agreeing with a table nobody approved.

**The bound, and its falsifier.** The widening is **additive only**: over the diff to each of D-1…D-6,
every pre-existing member is still present and unaltered, and nothing else about what those gates
assert changes. FSPEC **AT-52** is the falsifier — an engine installed from the published package
starts and iterates a loop session (no shipped file this feature adds is missing), *and* the
additive-only conjunct holds over each enumeration and each amended table.

**Scope note: D-5 and D-6 are TSPEC-added, beyond AT-52.** AT-52 scopes its additive-only conjunct
to *"each distribution/release-gate enumeration and each approved `pdlc-engine-distribution` table it
must agree with"*. D-1…D-4 are exactly that. D-5 (`fixture-machine.mjs`) and D-6
(`packaging.test.js`) are neither — they are CI/test-harness literals that copy a scratch tree, not
gate enumerations and not approved tables. This TSPEC extends the conjunct to cover them anyway,
because both red a required check if left behind (`Fixture machine` for D-5, `Engine tests` for
D-6), and it records that extension here as **TSPEC-added rather than AT-52-derived** so no reader
infers an upstream obligation that FSPEC does not carry. No FSPEC erratum is routed for this: the
extension is downstream-only and constrains nothing upstream. One consequence, recorded so the two
statements are read together: because D-5 and D-6 are not AT-52-scoped, they are — like the c8
`include` widening — outside NFR-1/BR-21's carve-out and need no part of it, and the BR-21
traceability row's *"covers D-1…D-6"* is shorthand for the whole site table rather than a claim that
all six sit inside the carve-out. Nothing turns on the classification: neither changes an assertion,
so neither needs an exception. The importability half is
not optional: a manifest-only or enumeration-only assertion passes while `ERR_MODULE_NOT_FOUND`
still fires, so AT-52's engine-side oracle must actually `import()` the vendored
`orchestrate-queue.js` from a constructed vendor tree and reach both `lib/` modules through it.

**Who proves which conjunct.** The additive-only conjunct is proved *at test time* for D-1…D-3, D-5
and D-6 — each is a JavaScript constant an oracle can read, and D-6's copy step is proved by
`packRealTarball()` completing without `ENOENT` and producing a tree `prepack.mjs` accepts — and D-4
is proved at test time too, not left as a review-time obligation: `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`/`tspecPackedCount`
transcription is already the machine-readable projection of D-4's tables, and `packaging.test.js`
consumes it, so a D-4 table amended without D-3 (or the reverse) reds. What test time cannot prove
is that the amended prose *says* five; that half is a **document oracle** conjunct in AT-52's home,
asserting that `docs/completed/pdlc-engine-distribution/` TSPEC §5.4's `PK-*` table, FSPEC §5.2's
per-class counts and AT-3.8b's member-count sentence agree with `tspecPackedCount`'s vendored class
size derived at test time, rather than with a literal. Review-time-only is explicitly **not** the
disposition chosen, because a spec-vs-gate disagreement is exactly what went stale before.

**Ordering.** D-4 (spec) precedes D-3 (transcription) because the header requires it; D-1 precedes
D-2 and D-3 because the members must exist before a gate can require them; **D-5 lands with D-1, in
the same task**, since D-1 alone reds the `Fixture machine` check; **D-6 lands with D-1 and D-3, in
that same task**, for the same reason on the other required check — D-3 alone flows two flattened
names into `packRealTarball()`, so the `Engine tests (ubuntu-latest)` check reds on `ENOENT`. Task
ids, batches and the file-ownership manifest for all six are the PLAN's (`Phase 7`), not this
document's.

## Interfaces

Every signature below is new unless marked *(modified)*. All are ESM named exports.

### `pdlc/workflows/lib/loop-session.mjs`

```ts
type Policy = "strict" | "off";
type DirtyTreePolicy = "tracked" | "any";
type ConfigCase = "absent-section" | "explicit-default" | "malformed-section" | "absent-file";

interface LoopConfig {
  backoffSchedule: number[];      // minutes, non-negative, [] permitted
  idleStopAfter: number;          // non-negative integer, 0 permitted
  preflight: Policy;
  dirtyTreePolicy: DirtyTreePolicy;
}

interface LoopConfigResult {
  config: LoopConfig;             // always complete; every absent/invalid key defaulted
  case: ConfigCase;               // BR-02's four states, one per read
  invalidKeys: string[];          // BR-03: each substituted key, by name
}

/** Pure. `text` is the raw `.claude/pdlc.config.json` bytes, or null when the file is
 *  absent OR unreadable (the caller's seam collapses those two, BR-02 case (d)). */
export function readLoopConfig(text: string | null): LoopConfigResult;

export const LOOP_DEFAULTS: Readonly<LoopConfig>;   // frozen; BR-01's four declared values
export const LOOP_SOURCES: readonly ["pipeline-halt", "merge-refusal"];
export const LOOP_STOP_KINDS: readonly string[];    // frozen, 10 members (§Data Model)
export const LOOP_NOTICE_CODES: readonly string[];  // frozen, 10 members (§Data Model)
```

`readLoopConfig` **extends** the sibling precedent rather than diverging from it — the framing FSPEC
Q-03 decides. `parseAdvisoryConfig` (`pdlc/workflows/orchestrate-dev.js`) and `parseMergeConfig`
(same file) collapse an unreadable file, a JSON parse failure and an absent section onto one degraded
result, which is the right answer for a reader that owes its caller no distinction. AC-2.5 asks for a
fourth state, and FSPEC BR-02 names four cases; the extension is confined to the **`case` field**,
which the siblings do not carry at all. Every *config value* the sibling algorithm would produce is
produced unchanged, and neither sibling reader nor either of its two shipped consumers is touched, so
the precedent is inherited whole and only added to. What remains residual is *where* the extension is
obtained — a new four-case reader in `loop-session.mjs` (this document's choice) versus retrofitting
the fourth state into the shipped siblings. See
DECISIONS DEC-LOOP-04 (Q-03).

```ts
interface PreflightInput {
  startup: {
    ok: boolean; reason: string | null;
    rungs: Array<{rung: string; name: string; state: "pass"|"fail"|"skipped"; detail?: string}>;
    notices: Array<string | {text: string}>;   // `runStartupChecks`' own notices, carried not dropped
  };
  treeStatus: { ok: true; dirtyPaths: string[] } | { ok: false; detail: string };
  policy: Policy;
  remediation: string;            // STARTUP_REMEDIATION, injected — the pure module reads no engine internals
  versionMismatch: { mismatched: boolean; detail: string | null };   // from `versionDoctorFor`, never a refusal (AT-12)
}

interface PreflightResult {
  decision: "proceed" | "refuse";
  conditions: Array<{ id: "engine-readiness" | "working-tree"; held: boolean; detail: string | null; remediation: string | null }>;
  notices: Notice[];              // warnings under policy "off"; the version-mismatch notice
}

/** Pure. Both conditions are always evaluated; `policy` only decides `decision`. */
export function evaluatePreflight(input: PreflightInput): PreflightResult;
```

The `conditions` array is always length 2 and always reports `held` positively — that is the conjunct
AT-16 and AT-12 need: a build that skips the checks under `"off"` produces a missing or `held: null`
condition, not a passing absence.

`startup.notices` is carried rather than dropped: `runStartupChecks` returns a `notices` array and
`cmdDoctor` prints it (`pdlc/engine/bin/cli.mjs`, the `for (const notice of result.notices || [])`
loop). Each member is re-emitted on `PreflightResult.notices` under the `preflight-warning` code with
the rung as its subject, so an operator running under the loop sees what an operator running
`pdlc doctor` sees. A startup notice never changes `decision`.

```ts
interface SessionState {
  v: 1;
  preflightRan: boolean;
  consecutiveIdle: number;
  schedulePos: number;
  iteration: number;
  merged: Array<{ feature: string; prUrl: string | null }>;
  halted: Array<{ feature: string; reason: string }>;      // accumulated across iterations (§3.4)
  escalationsRaised: Array<{ feature: string; sourceLabel: string }>;  // appended during THIS session
}

/** Pure, total. Any malformed/absent token decodes to a fresh session — E-24, AT-48. */
export function decodeLoopState(token: string | null): SessionState;
export function encodeLoopState(state: SessionState): string;   // base64url of canonical JSON

interface Directive {
  kind: "stop" | "continue";
  stopReason: string | null;      // member of LOOP_STOP_KINDS when kind === "stop"
  waitMinutes: number | null;     // 0 for `ran`; schedule[pos] for a backoff-entering idle
  nextState: string | null;       // encoded token when kind === "continue"
  detail: string;                 // one human sentence; names the blocking/awaiting features
}

interface DirectiveInput {
  report: QueueReport | null;     // null when the invocation threw (E-04)
  threw: { message: string } | null;
  queue: { readable: boolean; awaitingMerge: string[] };
  config: LoopConfig;
  state: SessionState;
}

/** Pure. The whole of FSPEC BR-04a…BR-09 lives here and nowhere else. */
export function nextDirective(input: DirectiveInput): Directive;
```

`nextDirective` is the single decision point, so every outcome rule is testable without a queue, a
clock or a filesystem. Its rules, in evaluation order: throw ⇒ stop `invocation-threw`, counter
**unchanged** (BR-04a, AT-40); `no-queue` ⇒ stop `no-queue`; `blocked` ⇒ stop `queue-blocked`;
`halted` ⇒ stop `pipeline-halted`; `ran` ⇒ continue, `waitMinutes: 0`, counter and `schedulePos`
reset to 0 (BR-04, AT-08); `idle` with `queue.readable === false` ⇒ stop `queue-unreadable` (E-05,
AT-41); `idle` with a non-empty `awaitingMerge` ⇒ stop `awaiting-merge` (BR-07, AT-05); otherwise
`idle` would enter backoff, and the two backoff stop reasons are tested **in this order**:

1. **Unenterable first.** `backoffSchedule.length === 0 || idleStopAfter === 0` ⇒ stop
   `backoff-unenterable`, `waitMinutes: null` (E-03, AT-39). This is FSPEC §3.4's ninth reason —
   "backoff that cannot be entered because `backoffSchedule` is empty or `idleStopAfter` is `0`" —
   and it is tested first precisely because both of its triggers would otherwise be swallowed by the
   exhaustion predicate below (with `idleStopAfter: 0`, `consecutiveIdle + 1 >= 0` is
   unconditionally true, so backoff could never be reached at all).
2. **Exhaustion second.** `consecutiveIdle + 1 >= idleStopAfter` ⇒ stop `idle-exhausted` (BR-09,
   AT-39). The `or backoffSchedule is empty` clause that v0.1 attached to this rule is **deleted**:
   an empty schedule is `backoff-unenterable`, never `idle-exhausted`.
3. Otherwise continue with `waitMinutes = backoffSchedule[min(schedulePos, len-1)]` (BR-09's
   last-value-repeats, AT-07), `consecutiveIdle + 1`, `schedulePos + 1`.

Stating the rule once, here, is the whole of it: **Data Model** §5 and **Error Handling** E-03 cite
this list rather than restating it, so the two cannot drift apart again. Both reasons are members of
`LOOP_STOP_KINDS` and both are emitted by a reachable path, which is what AT-37's set-equality over
the **ten**-member enumeration requires. `nextDirective` produces nine of the ten; the tenth,
`engine-dispatch-refused`, is emitted on `cmdQueue`'s preflight path and never by `nextDirective`
(**Error Handling** E-19, E-23).

```ts
interface WaitRecord { requestedMinutes: number; actualMinutes: number | null }
interface Notice { code: string; subject: string; text: string }   // code ∈ LOOP_NOTICE_CODES

export function iterationLine(args: {
  iteration: number; outcome: string; feature: string | null;
  mergeStatus: string; prUrl: string | null; wait: WaitRecord | null; notices: Notice[];
}): { fields: Record<string, unknown>; text: string };

export function sessionSummary(args: {
  state: SessionState; stopReason: string; iterations: number;
  merged: Array<{feature: string; prUrl: string|null}>;
  halted: Array<{feature: string; reason: string}>;               // §3.4 "features halted"
  escalationsRaised: Array<{feature: string; sourceLabel: string}>; // §3.4 "escalations raised this session"
  operatorView: { items: ViewItem[] };                             // §3.4 "the current operator view"
  openEscalations: number; nextActionable: string | null; notices: Notice[];
}): { fields: Record<string, unknown>; text: string };
```

**The summary's nine members, and where each comes from.** FSPEC §3.4 fixes the set-equality AT-37
asserts; v0.1's signature reached only six of the nine, so three had no producer at all:

| §3.4 member | Argument | Producer |
|---|---|---|
| stop reason | `stopReason` | `nextDirective` for nine of the ten members, **plus the `cmdQueue` preflight path** for `preflight-refused` and `engine-dispatch-refused` (see below) |
| iteration count | `iterations` | `state.iteration` |
| features merged, each with PR URL | `merged` | `state.merged`, accumulated per iteration |
| **features halted** | `halted` | `state.halted`, accumulated per iteration from a `halted` outcome's feature and reason |
| **escalations raised this session** | `escalationsRaised` | `state.escalationsRaised`, accumulated from each append site's return |
| open escalation count | `openEscalations` | `buildOperatorView(...).items.length` |
| next actionable item | `nextActionable` | the first view item, or the first skipped candidate |
| **the current operator view** | `operatorView` | `buildOperatorView(...)`, rendered at summary time |
| notices | `notices` | the notice channel below |

**Who produces the summary on the zero-iteration refusal paths.** BR-28 owes a summary on *every*
stop-reason member, including the two the loop never reaches an iteration on. `cmdQueue`'s
`--loop-state` path therefore imports `sessionSummary` from `loop-session.mjs` and calls it directly
with `stopReason` set to `preflight-refused` or `engine-dispatch-refused`, `iterations: 0`, empty
`merged`/`halted`/`escalationsRaised`, and the notices collected on that path — the same
`sessionSummary(state, stopReason, view)` signature `nextDirective`'s callers use, with no second
renderer. That import is part of the `cli.mjs` artifact row and the `cmdQueue` export row. Naming it
is what gives AT-37's ten-member set-equality a stated production path for its tenth member, so the
test exercises a real call rather than a fixture holding the literal string.

`halted` and `escalationsRaised` ride `SessionState` because they must accumulate **across**
iterations and the token is the only cross-iteration channel (DEC-LOOP-01); the token's size bound
is stated in **Data Model** §3. AT-37 transcribes §3.4's nine members literally into the test and
`deepEqual`s that transcription against `Object.keys(fields)` — never against a constant the module
also exports.

Both return `fields` alongside the rendered `text` so AT-36 and AT-37 assert set-equality over an
object's key set rather than by scraping prose. `mergeStatus` is always present and is the literal
`"n/a"` on an outcome that ran no pipeline — the field is never dropped (AT-36).

#### The notice channel — where the ten codes are assembled

v0.1 declared a `Notice[]` that `iterationLine` and `sessionSummary` consumed and only three codes
had a producer. The assembly seam is named here, and it is a single one:

```ts
/** Pure. The ONLY constructor of a Notice. Rejects a code outside LOOP_NOTICE_CODES by throwing —
 *  E-23's invariant, enforced at the one place a notice can be born. */
export function notice(code: string, subject: string, text: string): Notice;

/** Pure. Folds every per-iteration notice source into one ordered, de-duplicated array. */
export function collectNotices(input: {
  configResult: LoopConfigResult;            // config-case, config-key-defaulted
  preflight: PreflightResult | null;         // preflight-warning, preflight-held, engine-version-mismatch
  parseNotices: ParsedLog["parseNotices"];   // escalation-parse
  appendFailures: Array<{path: string; message: string}>;   // escalation-append-failed
  report: QueueReport | null;                // candidate-skipped-not-ready (report.skipped)
  queue: { readable: boolean };              // queue-unreadable
  restarted: boolean;                        // session-restarted
}): Notice[];
```

Every one of the ten codes has exactly one producer inside `collectNotices`, and the mapping is a
rule of this document:

| Code | Raised from | Rule |
|---|---|---|
| `config-case` | `configResult.case` | BR-02, one per invocation |
| `config-key-defaulted` | `configResult.invalidKeys` | BR-03, one per substituted key |
| `preflight-warning` | `preflight.conditions[].held === false` under `"off"`; `startup.notices` | BR-11b |
| `preflight-held` | `preflight.conditions[].held === true` | BR-11b's positive conjunct (AT-16) |
| `engine-version-mismatch` | `preflight` input's `versionMismatch` | BR-10 (AT-12) |
| `escalation-parse` | `parseNotices` | BR-16, one per skipped block |
| `escalation-append-failed` | `appendFailures` | E-08 |
| `candidate-skipped-not-ready` | `report.skipped[]` with the not-ready reason | BR-20 (AT-31) |
| `queue-unreadable` | `queue.readable === false` | E-05 |
| `session-restarted` | `restarted` — a token that was supplied and failed to decode, excluding the reserved `new` | E-24 (AT-48) |

`collectNotices` is the seam AT-51 drives: a session fixture exercising every one of the ten
conditions produces the collected set, and the test compares that **collected** set against a
literal ten-member array written into the test file. `LOOP_NOTICE_CODES` appears on **neither** side
of that comparison — see **Test Strategy**, "Oracle discipline" item 2.

### `pdlc/workflows/lib/escalation-view.mjs`

```ts
interface EscalationEntry {
  id: string;                     // entryId(chunk) — see Architecture 6's canonical recipe
  kind: "advisory" | "non-advisory" | "decision";
  seam: string | null;            // advisory only
  source: string | null;          // non-advisory only; member of LOOP_SOURCES
  feature: string | null;
  decision: string;               // the one-sentence "Decide:" statement; "" on a decision block
  conditionKey: string;           // Architecture 6's recurrence key component; "" when neither row is present
  timestamp: string;              // ISO 8601, from the heading
  blockText: string;              // canonicalBlockText(chunk) — the exact bytes `id` is computed over

  // Decision blocks only; null on kind "advisory" | "non-advisory". AT-25 reads the decision's
  // outcome / decider / when / which-entry from THESE FIELDS, never from a regex over blockText.
  decidedOutcome: "resolved" | "rejected" | null;
  decidedBy: string | null;
  decidesId: string | null;
  decidedAt: string | null;
}

/** Pure. Architecture 6's canonical byte range and its digest; the single home of both,
 *  consumed by the reader and by `renderDecisionEntry`'s caller alike. */
export function canonicalBlockText(chunk: string): string;
export function entryId(chunk: string): string;

interface ParsedLog {
  entries: EscalationEntry[];
  parseNotices: Array<{ blockIndex: number; heading: string; reason: string }>;
}

export function parseEscalationLog(text: string | null): ParsedLog;

export function blockedFeatureCounts(args: {
  queueEntries: Array<{feature: string; status: string; dependsOn: string[]}>;
  frontmatterDeps: Map<string, string[]>;
}): Map<string, number>;

interface ViewItem {
  feature: string | null; sourceLabel: string; decision: string;
  conditionKey: string;           // the key the group collapsed on (Architecture 6)
  occurrences: number;            // on-disk member count, computed at V3 before any overlay
  blockedFeatures: number; firstSeen: string;
  entryIds: string[];             // EVERY member id, oldest first
}

export function buildOperatorView(args: {
  log: ParsedLog; counts: Map<string, number>;
}): { items: ViewItem[]; parseNotices: ParsedLog["parseNotices"] };
```

### Modified exports

| Symbol | File | Change |
|---|---|---|
| `renderEscalationEntry` *(modified)* | `pdlc/workflows/orchestrate-dev.js` | `ctx` accepts `source` as an alternative to `seam`; the `seam` branch's structure is byte-identical to today, and its bytes are byte-identical for any input the redactor does not match (**Architecture** §4) |
| `appendEscalationEntry` *(modified)* | same | unchanged signature; forwards the widened `ctx` |
| `parseEscalations` *(modified)* | `pdlc/workflows/consolidate-learnings.js` | `corpusState` derived from counted entries, not raw block count (§5) |
| `main` *(modified)* | `pdlc/workflows/orchestrate-queue.js` | accepts `loopState`, `_appendFile` (already present) and `_now`; returns a report carrying `loop` and `operatorView` |
| `cmdQueue` *(modified)* | `pdlc/engine/bin/cli.mjs` | `--loop-state <token>` flag; **the `!startup.ok` branch's shipped refusal behaviour is preserved byte-for-byte** — it returns fail-closed under every policy, and `"off"` only adds the `preflight-warning` notice and the `engine-dispatch-refused` stop directive alongside the shipped refusal. The one edit that lands inside the block is on the `--loop-state` path: the `loop` block is supplied to the `emitReport(…, {adapter, startup, startedAt, finishedAt, loop})` seam the file already carries, so a non-loop invocation's stderr bytes and exit code are unchanged (**Architecture** §3, REQ AC-3.4 / FSPEC BR-11b, AT-44 non-loop half); calls `sessionSummary` (imported from `loop-session.mjs`) with `iterations: 0` to produce the BR-28 summary on both refusal paths; prints the directive and the view; `--loop` path untouched |
| `cmdDoctor` *(modified)* | `pdlc/engine/bin/cli.mjs` | consumes `STARTUP_REMEDIATION` in place of its inline literal; printed bytes unchanged |
| `renderDecisionEntry` *(new export)* | `pdlc/workflows/orchestrate-dev.js` | renders a decision block (**Architecture** §6); `{now}`-injected like its sibling |
| `redactEntryText` *(new export)* | `pdlc/workflows/orchestrate-dev.js` | the BR-18 redactor; applied to the free-prose fields on both branches (**Error Handling**) |
| `STARTUP_REMEDIATION` *(new export)* | `pdlc/engine/lib/startup.mjs` | the one two-remedy sentence, shared by `cmdDoctor` and preflight |

`--loop` and `--loop-state` are mutually exclusive; supplying both is a usage error with a non-zero
exit, matching the existing `--max-iterations` validation shape in `cmdQueue`.

## Data Model

### 1. Configuration — the `loop` section

Home: `.claude/pdlc.config.json`, the path both `MERGE_CONFIG_PATH` and `ADVISORY_CONFIG_PATH`
already name (`pdlc/workflows/orchestrate-dev.js`; `ADVISORY_CONFIG_PATH = MERGE_CONFIG_PATH`).

| Key | Default | Domain | Out-of-domain ⇒ |
|---|---|---|---|
| `backoffSchedule` | `[5, 15, 30, 60]` | array of non-negative numbers, `[]` included | default, key named in `invalidKeys` |
| `idleStopAfter` | `4` | non-negative integer, `0` included | default, key named |
| `preflight` | `"strict"` | `"strict"` \| `"off"` | default, key named |
| `dirtyTreePolicy` | `"tracked"` | `"tracked"` \| `"any"` | default, key named |

These four keys and four values are `LOOP_DEFAULTS`, frozen, and are the single literal home — the
example config, the documentation and AT-10/AT-46's transcriptions are checked against it, never
against each other.

**The four `case` values** (BR-02, AT-10) and how each is decided:

| `case` | Decided by |
|---|---|
| `absent-file` | the caller's read seam returned `null` (file absent, or unreadable), or `JSON.parse` threw |
| `absent-section` | parsed object has no own property `loop` |
| `malformed-section` | `loop` present but not a plain object, or present as an object every one of whose keys is out-of-domain |
| `explicit-default` | `loop` present as an object with ≥1 in-domain key |

`explicit-default` is the honest name for "present and readable": AC-2.5 asks only that the three
states be *distinguishable*, and a present section holding valid non-default values is reported the
same way as one holding the defaults — the distinction AC-2.5 draws is absent vs malformed vs
present, not default-valued vs not.

### 2. `.claude/pdlc.config.example.json` (BR-29, AT-46)

At HEAD the file's top-level sections are exactly `dispatch`, `advisory`, `implementation`,
`learningsInjection` — verified by reading the tracked file — with no `loop` and no `merge`. This
feature adds both, in one change:

```json
"loop": { "backoffSchedule": [5, 15, 30, 60], "idleStopAfter": 4,
          "preflight": "strict", "dirtyTreePolicy": "tracked" },
"merge": { "mergeMode": "off", "guardPaths": [] }
```

The `merge` values are transcriptions of `MERGE_DEFAULTS` (`mergeMode: "off"`,
`pdlc/workflows/orchestrate-dev.js`). `guardPaths` ships **empty**, and that is a decision, not an
oversight: a consuming repo that copies this example must land on exactly HEAD's effective set.
`effectiveGuardPaths(configured)` unions `MERGE_GUARD_DEFAULTS`
(`["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]`,
`pdlc/workflows/orchestrate-dev.js`) with the configured list and never subtracts, so a non-empty
example value would widen every copying consumer's guarded set — a user-visible behaviour change no
requirement asks for, and one that would name `pdlc/engine/`, a path no consuming repo contains.

**Q-07, decided.** FSPEC Q-07 assigns to this document "where `pdlc/engine/` is configured as this
repo's guard-path extra (BR-24), and how AT-32 reads the effective set at render time without
restating it". The answer, in three parts:

1. **Where it is configured:** in **this repo's own `.claude/pdlc.config.json`**, which is
   gitignored (`.gitignore`, `/.claude/pdlc.config.json`) — an operator-local file, exactly as
   BR-24's "this repo configures" reads, and exactly where every other repo-local pdlc setting
   already lives.
2. **Where it is *tracked*:** in `pdlc/OPERATIONS.md`, which states the repo's configured extras as
   a named list (`pdlc/engine/`) alongside the instruction that they live in the untracked config.
   That documented list is the tracked referent AT-32 needs; the gitignored file is not one.
3. **How AT-32 reads the effective set:** it derives, never restates. The oracle reads the
   documented extras from `pdlc/OPERATIONS.md`, applies the **shipped** `effectiveGuardPaths` to
   them at render time, and asserts set-equality against the documented guarded-path set — so
   widening `MERGE_GUARD_DEFAULTS` in a later feature reds the documentation rather than passing
   silently (BR-23). Its two remaining conjuncts are asserted against shipped constants directly:
   `pdlc/engine/` **is** a member of the documented extras, and **is not** a member of
   `MERGE_GUARD_DEFAULTS` — which is BR-24's "configured extra, absent from the shipped defaults"
   split, satisfied with no example-config value and no defaults change.

The v0.1 argument that a tracked example value "makes the extra a shipped example, which BR-24
places out of scope" is **withdrawn**, but its conclusion is not, and the two claims in play are
about different things. **BR-24 is the authority that excludes the shipped example configuration as
the extra's *home***: it states the example config is illustrative and "not that home", and FSPEC
Q-07 at HEAD names it as such when it observes that no tracked channel carries the declaration. That
is a claim about *where the declaration lives*. The withdrawn v0.1 argument was a claim about *the
value the example ships*, and there BR-24 forbids something narrower — membership of the shipped
*defaults*, i.e. `MERGE_GUARD_DEFAULTS` — which an example config's own `guardPaths` array is not.
So: the extra's home is `pdlc/OPERATIONS.md` plus this repo's untracked config **because BR-24
excludes the example config as a home**, and the example ships `guardPaths: []` **for the
consumer-widening reason above** — a non-empty example value would widen every copying consumer's
effective guard set — not because BR-24 puts that value out of scope. No disagreement with upstream
is intended or implied on either point. FSPEC AT-32 at HEAD
already resolves the referent the same way — it reads "read from the repo's **tracked
default-branch content** rather than the working tree, so an untracked machine-local declaration
(the case BR-24 excludes) reds" — so v0.3's erratum on AT-32's phrasing is withdrawn; nothing on this point is
routed upstream.

### 3. Session-state token

Canonical JSON, base64url-encoded, carried on `--loop-state`:

```json
{"v":1,"preflightRan":true,"consecutiveIdle":2,"schedulePos":2,"iteration":5,
 "merged":[{"feature":"a","prUrl":"https://…/1"}]}
```

Total decode: a `null`, empty, non-base64, non-JSON, non-object or wrong-`v` token yields
`{v:1, preflightRan:false, consecutiveIdle:0, schedulePos:0, iteration:0, merged:[], halted:[],
escalationsRaised:[]}` — a fresh session. The reserved literal `new` decodes to the same value and
is the one undecodable input that raises **no** `session-restarted` notice (**Architecture** §3).
NFR-5 applies: the token carries feature names, PR URLs and halt reasons only, never credentials.

**Bound on token growth (Q-04).** Three of the token's fields accumulate across iterations, so the
token grows monotonically within a session. It is bounded, and the bound is stated rather than
hoped for: `merged`, `halted` and `escalationsRaised` each hold **at most one entry per iteration**
(one queue invocation processes at most one ready REQ — `pdlc/skills/orchestrate-queue/SKILL.md`,
§Invocation Contract), each entry is a feature name plus a URL, a reason or a source label, and each
of those free-text members is truncated to 200 characters at encode time. A 100-iteration session is
therefore a few tens of kilobytes at worst. Should a host truncate the token anyway, the failure is
already specified and benign: `decodeLoopState` is total, a truncated token fails to decode, and the
next iteration is a fresh session with a `session-restarted` notice (E-24, AT-48) — the same
observable path as any other state loss, with no new mode.

### 4. Escalation log — block grammar

Existing advisory block, unchanged (`renderEscalationEntry`, orchestrate-dev.js):

```
## {iso} — {feature} — {seam}

**Decide:** {one sentence}

| Field | Value |
|---|---|
| Feature | {feature} |
| Seam | {seam} |
| Refusal reason | {reason} |
[| Root cause | {class} |]

**Diagnosis.** …
**Proposed action.** …
**Evidence.**
- …
**Pipeline state.** {phase} — {phaseOutcome}
```

New non-advisory block — same seven BR-12 fields, `| Source |` where the advisory form has
`| Seam |`:

```
## {iso} — {feature} — {source}

**Decide:** {one sentence}

| Field | Value |
|---|---|
| Feature | {feature} |
| Source | {source} |
| Refusal reason | {reason} |

**Diagnosis.** …
**Proposed action.** …
**Evidence.**
- …
**Pipeline state.** {phase} — {phaseOutcome}
```

`{source}` is one member of `LOOP_SOURCES` — the literal `pipeline-halt` **or** the literal
`merge-refusal`, never both and never an alternation. A cell value is a value; the shapes above are
row **templates**, and an unescaped `|` inside a template cell would be copied into a renderer as a
column break. (v0.1 wrote `| Source | pipeline-halt | merge-refusal |`, a three-cell row an
implementer could reasonably have copied verbatim.)

New decision block (Q-02), with **Architecture** §6's five rows:

```
## {iso} — {feature} — decision

| Field | Value |
|---|---|
| Decision | {outcome} |
| Decided by | {who} |
| Decides | {entryId} |
| Decided at | {iso} |
| Rationale | {one sentence} |
```

`{outcome}` is the literal `resolved` or the literal `rejected` — a two-member closed domain, one
value per block. `{who}` is the deciding operator or agent identity (REQ AC-4.4's "who decided").

Neither new block carries a `| Seam |` row, so `ESCALATION_SEAM_ROW`
(`/^\|\s*Seam\s*\|\s*(.+?)\s*\|\s*$/m`, consolidate-learnings.js) does not match and the
block contributes to no calibration key. With §5's `corpusState` change, that is the whole of E-09.

### 4a. `entryId` — worked example

The canonical recipe (**Architecture** §6) is exercised on one literal block, and this pair is
transcribed into the test as two literals. AT-25 asserts `entryId(chunk)` against the digest written
here; it never computes its expectation by calling a hashing helper a second time.

```
canonicalBlock (exact bytes, no trailing newline):
## 2026-08-24T00:00:00.000Z — demo-feature — A3

**Decide:** whether to accept the A3 refusal.

| Field | Value |
|---|---|
| Feature | demo-feature |
| Seam | A3 |
| Refusal reason | n/a |

**Diagnosis.** none.

**Proposed action.** (none)

**Evidence.**
- (none)

**Pipeline state.** T — refused
```

The PLAN's first task on `escalation-view.mjs` computes the digest of exactly these bytes once, and
writes the resulting 12 hex characters into both this section and the test as a literal. A future
edit to the block above without a matching digest update reds AT-25 — which is the point: the pair
is the contract, and neither half may move alone.

### 4b. Parse contract — the three unparseable shapes (BR-16, AC-4.7)

AC-4.7 names three ways a block fails to parse, and BR-16 restates them: **a missing field, a
duplicated field, or a shape the reader does not recognise**. `parseEscalationLog` must decide all
three, because a shape it silently accepts is a corpus the operator never learns is damaged:

| Shape | Rule | Notice `reason` |
|---|---|---|
| Missing field | no `\| Feature \|` row, **or** neither a `\| Seam \|` nor a `\| Source \|` row (and it is not a decision block) | `missing-field: {name}` |
| **Duplicated field** | **two or more rows matching the same recognised field name** — `Feature`, `Seam`, `Source`, `Decision`, `Decides`, `Decided at`, `Decided by`. The shipped precedent takes the **first** match (`ESCALATION_SEAM_ROW` is a non-global `/m` regex read through `block.match(...)`, `pdlc/workflows/consolidate-learnings.js`), so a two-`Feature` block parses silently and renders as a normal entry. That is the fail-open this rule closes | `duplicate-field: {name}` |
| Unrecognised shape | a block whose heading does not match `## {iso} — {feature} — {label}`, or whose body carries no `\| Field \| Value \|` table | `unrecognised-shape` |

Detection of the duplicate case is a **count**, not a first-match: the parser counts matching rows
per recognised field name and skips the block when any count exceeds 1. AT-27 is split into three
cases, one per shape, each asserting its own `reason` — so "the three shapes each produce a notice"
is a statement with a falsifier rather than one case standing in for three. The calibration reader
(`parseEscalations`) keeps its first-match behaviour unchanged; the two readers' agreed definition
of "unparseable" is restated in **Open Questions** T-Q-04.

### 5. Closed enumerations

**Stop reasons (10, FSPEC §3.4):** `preflight-refused`, `queue-blocked`, `pipeline-halted`,
`no-queue`, `awaiting-merge`, `idle-exhausted`, `invocation-threw`, `queue-unreadable`,
`backoff-unenterable`, `engine-dispatch-refused`. Frozen as `LOOP_STOP_KINDS`; AT-37 asserts
set-equality against FSPEC §3.4's ten-member enumeration, transcribed literally into the test.

`engine-dispatch-refused` is §3.4's tenth member — "an engine dispatch refusal under
`loop.preflight: "off"` with a not-ok startup result, where the session ends at zero iterations
without a preflight refusal (BR-11b, E-19)". It is kept **distinct from `preflight-refused`**
because the two name different actors: `preflight-refused` is the *loop* declining to start under
`"strict"`, `engine-dispatch-refused` is the *engine's* own `!startup.ok` branch declining the
dispatch while the loop had already decided to proceed. Its directive carries `waitMinutes: 0` (no
backoff is entered; the session ends immediately) and a `detail` naming `startup.reason` and
`STARTUP_REMEDIATION` — textually distinguishable from `preflight-refused`'s detail, which names
the loop's own refusal. Because BR-28 owes a summary on **every** member, the member's existence is
what gives the zero-iteration engine-dispatch path a summary case at all; without it a session
ending on that path would end silently and red nothing.

**Notice codes (10, FSPEC §3.4):** `config-case`, `config-key-defaulted`, `preflight-warning`,
`preflight-held`, `engine-version-mismatch`, `escalation-parse`, `escalation-append-failed`,
`candidate-skipped-not-ready`, `queue-unreadable`, `session-restarted`. Frozen as
`LOOP_NOTICE_CODES`; AT-51 asserts set-equality against it.

Note `idle-exhausted` and `backoff-unenterable` are distinct members even though both arise from an
`idle`: the first means `idleStopAfter` was reached, the second that `backoffSchedule` is empty or
`idleStopAfter` is `0` so no backoff could ever be entered (E-03). Keeping them apart is what lets
AT-39 name the condition it exercises. **Which of the two is emitted for a given input is stated
once, in `nextDirective`'s ordered rule list (§Interfaces) — the unenterable condition is tested
first.** This section and E-03 cite that list; neither restates the predicate.

### 6. Report shape

`buildQueueReport` (`pdlc/workflows/orchestrate-queue.js`) currently projects
`{outcome, reason, remaining, picked?, active?, pipelineReport?, skipped?, advisory?}` and, per its
own typedef, `outcome ∈ {"ran","halted","idle","blocked","no-queue"}`. Two optional fields are added
in the same conditional-spread idiom: `loop` (a `Directive`) and `operatorView`. The outcome set is
**not** widened — BR-20's requirement that a not-ready candidate is a skip and not an outcome is
already true at HEAD, where a not-ready row lands in `skipped` and the outcome stays `idle`.

Q-04 / REQ O-1: the merged status AT-01 reads is `report.pipelineReport.mergeStatus`. The queue
driver computes `merged = succeeded && report.mergeStatus === "merged"` from exactly that field
(`orchestrate-queue.js`) and projects no top-level equivalent; the loop's per-iteration line reads
the same nested field and renders `"n/a"` when there is no pipeline report.

## Error Handling

Every FSPEC failure scenario, with the code path that produces it. "Never throws" means the function
is total on the stated input domain.

| FSPEC | Scenario | Handling | Where |
|---|---|---|---|
| E-01 | Config file absent | `readLoopConfig(null)` ⇒ `LOOP_DEFAULTS`, `case: "absent-file"`, notice `config-case` | `loop-session.mjs` |
| E-02 | `loop` not an object, or a key of the wrong type | affected keys defaulted **independently**, each named in `invalidKeys`, one `config-key-defaulted` notice per key; other configured keys keep their values (AT-38) | `readLoopConfig` |
| E-03 | `backoffSchedule: []` or `idleStopAfter: 0` | `nextDirective` ⇒ stop `backoff-unenterable` at the first backoff-entering `idle` — the **first** test in §Interfaces' ordered rule list, ahead of the `idle-exhausted` predicate, which is what makes this reason reachable at all; `waitMinutes` is `null`, never `0`, so no zero-interval re-invocation is emitted | `nextDirective` |
| E-04 | Queue invocation throws | `cmdQueue` catches, passes `{threw}` to `nextDirective` ⇒ stop `invocation-threw`; `consecutiveIdle` unchanged (AT-40) | `cli.mjs`, `nextDirective` |
| E-05 | `idle` and `QUEUE.md` unreadable | `queue.readable: false` ⇒ stop `queue-unreadable` plus notice; the safe direction, since an awaiting-merge row cannot be ruled out (AT-41) | `nextDirective` |
| E-06 | `ESCALATIONS.md` absent | `parseEscalationLog(null)` ⇒ `{entries: [], parseNotices: []}`; the render performs no write, so no file is created (AT-28) | `escalation-view.mjs` |
| E-07 | Malformed block | skipped, one `escalation-parse` notice carrying `blockIndex` and `heading`; sibling blocks render (AT-27) | `parseEscalationLog` |
| E-08 | Append fails | the `await _appendFile(...)` rejection is caught by the **caller** — the shipped placement, outside the try/catch owning the action — pushed onto `notices` as `escalation-append-failed`; the escalating phase's outcome is byte-identical to the success case (AT-29) | orchestrate-dev.js / orchestrate-queue.js |
| E-09 | Mixed advisory and non-advisory log | non-advisory and decision blocks carry no `| Seam |` row and so contribute to no calibration key; `corpusState` derived from counted entries (§Architecture 5) | consolidate-learnings.js |
| E-10 | Entry names a feature with no queue row | `blockedFeatureCounts` returns no key ⇒ count 0; the item still renders and still tie-breaks | `escalation-view.mjs` |
| E-11 | Dependency declared only in REQ frontmatter | the union feeds the closure, so the dependent is counted (AT-23) | `blockedFeatureCounts` |
| E-12 | Cycle in the effective graph | BFS over a visited set; each feature counted at most once, count bounded by the non-`done` row count (AT-42) | `blockedFeatureCounts` |
| E-13 | Equal counts and equal timestamps | feature name ascending; the comparator is total, so the order is stable across renders (AT-24) | `buildOperatorView` |
| E-14 | Same escalation recurs | one item, `occurrences: n`; on-disk block count untouched (AT-26) | `buildOperatorView` |
| E-15 | Resolved, then recurs | V3 collapses **before** V4 overlays, so `occurrences` is the on-disk member count (2) regardless of the decision; the decision names an earlier `entryId`, not the group's latest, so the item stays **open** (AT-43). The pipeline that produces this outcome is §Architecture 6's, and this row restates no predicate of it | `buildOperatorView` |
| E-16/E-17 | Dirty in ignored / untracked files only | `git status --porcelain --untracked-files=no` omits both; `--untracked-files=normal` surfaces untracked and still omits ignored (AT-13) | preflight seam |
| E-18 | Preflight refuses | the refusal returns before `readFileFn(queuePath)`, so `QUEUE.md` is never read or written; stop reason `preflight-refused`, distinct from any `idle` (AT-14) | `main` |
| E-19 | Failing **engine-readiness** condition under `"off"` | both conditions still evaluated; failing ones become `preflight-warning` notices carrying `startup.reason` and `STARTUP_REMEDIATION`. `cmdQueue`'s `!startup.ok` branch is **unmodified and still returns**, so the outcome is stated in positive conjuncts: iteration count **0**, **zero** waits taken, `docs/_queue/QUEUE.md` byte-identical, exit code `1`, `emitReport(null, …)` taken, `runQueue` never reached; the stop reason is `engine-dispatch-refused`, §3.4's tenth member, distinct from `preflight-refused` (AT-15b, AT-44). A failing **working-tree** condition under `"off"` is the other half of AC-3.4 and does proceed to iteration 1 (AT-15a) | `evaluatePreflight` + `cmdQueue` |
| E-20(a) | Engine present, startup not ok | under `"strict"`, the loop's own refusal: stop `preflight-refused` naming `startup.reason` + `STARTUP_REMEDIATION` (AT-11, AT-44). Under `"off"`, E-19's path: warning emitted, the engine's dispatch refusal observed, stop `engine-dispatch-refused`, zero iterations (AT-15b). Both end at iteration count 0 | `evaluatePreflight` + `cmdQueue` |
| E-20(b) | Engine **binary absent** — no process starts | detected session-side (launch failure: `command not found` / exit 127 / spawn `ENOENT`, no parseable report), never in-process; stop `preflight-refused` under **both** policies, with the install remediation the skill holds as a literal. Distinct from `invocation-threw` (E-04), which is a running engine returning a readable failure. `"off"` cannot resurrect a process that never started, and FSPEC AT-44's `"off"` half asks only that the engine's dispatch refusal be observed with the iteration count still zero — which this sub-case satisfies session-side | `orchestrate-queue/SKILL.md` (session side) |
| E-21 | `ready: false` row | unchanged HEAD behaviour: the candidate lands in the report's `skipped` array with its reason and the outcome stays `idle`; the loop adds only the `candidate-skipped-not-ready` notice (AT-31) | orchestrate-queue.js |
| E-22 | `Esc` mid-iteration | the interruptible unit is one `pdlc queue` process; the token from the previous iteration is the last committed state and is a valid resume point | protocol |
| E-24 | Session state lost | `decodeLoopState` is total: any unusable token is a fresh session, so preflight re-runs and both counters restart; notice `session-restarted` is emitted when the invocation carried a token that failed to decode (AT-48) | `decodeLoopState` |
| E-25 | Host does not honour the wait | the session reports `{requestedMinutes, actualMinutes}`; `nextDirective` advances `schedulePos` exactly once per emitted `continue`, independent of what was actually waited (AT-49) | `nextDirective`, `iterationLine` |
| E-26 | Backoff re-invocation re-escalates | intended; nothing suppresses or de-duplicates an append. The view collapses, the calibration counts every block (AT-50) | — |
| E-23 | An unenumerated stop condition | a defect, not a mode. The invariant is stated over the **session's emitted stop reasons**, not over one function's return: every `stopReason` the session emits — from `nextDirective`, and the two the `cmdQueue`/preflight path emits which `nextDirective` never returns, `preflight-refused` (E-18, E-20(a) under `"strict"`) and `engine-dispatch-refused` (E-19, E-20(a) under `"off"`) — is a member of the frozen `LOOP_STOP_KINDS`. A new condition must be added to the enumeration, which reds AT-37 until a summary covers it | `nextDirective`, `cmdQueue` preflight path |

**Redaction (BR-18, NFR-5, AT-34, AT-34a).** BR-18 is **recognises-scoped, not unconditional**:
entries carry no credential or secret *that the redaction check recognises*, and material the check
does not recognise is a documented residual rather than a denial. **REQ NFR-5 (§4)** states the same
recognises-scoped form — NFR-5 is a **REQ** requirement, which the FSPEC carries only in BR-18's
`Traces` column and in AT-34's header — so there is no narrowing between the two and nothing is
routed upstream on this point. What the check recognises is therefore load-bearing, and both the scope and the pattern
are stated exactly below. **This section discharges FSPEC Q-10**: the residual — secret-shaped
material carrying no recognised prefix — is recorded here (*Pattern*, closing sentence) and in
DECISIONS **DEC-LOOP-05 (a)** as an accepted risk. Q-10, NFR-5 and BR-18 are all scoped to *that*
residual, the false negative. The pattern's opposite-direction cost — a `--loop-state` token whose
run begins with a catalogue prefix is redacted — is a **false positive**, sanctioned by no upstream
clause and recorded as **DEC-LOOP-05 (b)**; it is cited as such wherever this document raises it, and
it is not offered as a discharge of Q-10.

*Scope: every free-prose field, on both branches.* `redactEntryText` (exported from
`orchestrate-dev.js`) is applied to the decision sentence, the **refusal reason**, the diagnosis,
the proposed action and each evidence line — every field whose value is arbitrary text a caller
supplies. `Refusal reason` is included because it renders `disposition.reason` verbatim
(`renderEscalationEntry`, `pdlc/workflows/orchestrate-dev.js`), which is exactly where a failed
authenticated call's message surfaces; v0.1's narrowing to "diagnosis and evidence" is withdrawn.
The fields **not** redacted are the closed-vocabulary ones — `Feature`, `Seam`, `Source`,
`Root cause`, the heading timestamp and `Pipeline state` — because each is drawn from a name set the
pipeline itself controls, not from caller text, and redacting them would break the calibration keys
`parseEscalations` reads. Both branches are in scope (§Architecture 4).

*Pattern: prefix-anchored, not entropy-shaped.* A match is a run of `[A-Za-z0-9_\-]` that **begins**
with one of the published credential prefixes — `gh[pousr]_`, `ghs_`, `github_pat_`, `sk-`,
`xox[baprs]-`, `AKIA` — and is replaced by `[redacted:{n} chars]`. "Prefix-anchored" is normative and
means exactly this: the prefix must sit at the **start of the run**, i.e. at a position preceded by
the beginning of the field or by a character outside `[A-Za-z0-9_\-]`. A run whose *interior*
contains a catalogue prefix is **not** a match. This is not a stylistic preference: a `--loop-state`
token is plain base64url over `[A-Za-z0-9_-]` (**Data Model** §3, T-Q-03), so an unanchored
implementation mangles any token whose body happens to contain `sk-`, `AKIA` or `ghs_` mid-string,
destroying the operator's only durable session record. The regex therefore compiles with an explicit
left boundary (`(?<![A-Za-z0-9_\-])`), and **AT-34a carries a token with an interior `sk-` as a
seeded negative control** — chosen deliberately rather than left to a 40-hex oid, which cannot
contain `-` or `_` at all and so cannot falsify the anchor. The catalogue holds **six constant entries but
five behaviourally distinct match families**: `gh[pousr]_` already matches every string `ghs_`
matches, so `ghs_` is retained only as explicit documentation of the GitHub server-token shape and
subtracts nothing from the matched language. Two obligations follow, and they range over different
sets — a **seeded positive per behavioural family** ranges over the five (`gh[pousr]_`,
`github_pat_`, `sk-`, `xox[baprs]-`, `AKIA`), since a seeded `ghs_` token is redacted by
`gh[pousr]_` whether or not `ghs_` is in the constant; **set-equality against the constant** ranges
over all six entries, and is what reds if `ghs_` is deleted. Deleting `ghs_` therefore reds
set-equality and no behavioural assertion, which is correct and not a gap. **The per-family
obligation is discharged by a property, not by AT-34's single seed** — `redactEntryText` has its own
row in **Test Strategy** → *Property-based strategies*: for any `prefix + run` where `prefix` is a
**concrete instance drawn from** one of the five behavioural families (`gh[pousr]_` and
`xox[baprs]-` are character classes, so the generator draws e.g. `ghu_` / `xoxb-`, never the class
source text) and `run` is drawn from `[A-Za-z0-9_\-]{8,64}`, the output contains neither the drawn
`prefix` instance nor `run` as a substring and does contain `[redacted:{n} chars]` with `n` the
matched length. The **non-firing half is quantified over inputs containing no recognised prefix at
any position** — 40-hex git oids, and `--loop-state` tokens generated from base64url *filtered to
exclude every catalogue prefix as a substring* — for which the output is byte-identical to the
input. Quantifying it over "any valid `--loop-state` token" would be false: base64url's alphabet
includes `A`, `K` and `I`, so a legitimate token can carry `AKIA` followed by eight or more
`[A-Za-z0-9_\-]` characters and is then correctly matched by the `AKIA` entry. That collision is a
**false positive** — a legitimate token destroyed, not a secret missed — and it is therefore *not*
the residual REQ NFR-5 and FSPEC BR-18/Q-10 record, both of which are scoped to material the check
does **not** recognise. It is the residual **DEC-LOOP-05 (b)** accepts (*Accepted residual risks —
two, in opposite directions*, added at DECISIONS v0.5 on this round), recorded there rather than
papered over; stating the property this way
keeps it falsifiable on a real defect instead of flaky on a legitimate token. Without it a
mis-escaped `xox[baprs]-` character class, or an `AKIA` alternative that never compiles, would pass
both set-equality (a copy of the constant) and AT-34 (which seeds only `ghp_`). AT-34 is
additionally **parameterised over the five families**, so each family also has a named
acceptance-test case and not only a generated one. v0.1's entropy heuristic ("≥20 chars containing
a digit and a letter") is **rejected**: it fires on ordinary non-secret identifiers, including a
40-hex git oid and this feature's own `--loop-state` token, which **Data Model** §3 keeps as plain
base64url precisely so it stays inspectable (T-Q-03). Mangling those is a real, silent data loss in
the operator's only place to look, traded against a heuristic that no real credential needs. See
DECISIONS DEC-LOOP-05 for the alternatives weighed, including **both** recorded residuals:
(a) a bare high-entropy secret with no recognised prefix is not redacted — the false negative NFR-5
scopes; and (b) a `--loop-state` token whose run *begins* with a catalogue prefix is redacted — the
false positive, which has no upstream home and is priced in DEC-LOOP-05 (b) against the rejected
alternative of a token-shape exemption inside the redactor.

*Both directions are tested.* AT-34 proves the positive on a seeded `ghp_`-prefixed token in the
diagnosis and in the evidence, and asserts BR-12's other six fields still render. **AT-34a** is its
negative control on the same path, over **three** seeds in the same fields of an **advisory** entry,
each of which must survive **unredacted** with the rendered entry byte-identical to what HEAD's
renderer produces for the same inputs:

1. a 40-character hex git oid;
2. a `--loop-state` token carrying **no** catalogue prefix at any position (the token literal is
   pinned in the test, chosen so the seed cannot drift into a true positive);
3. a `--loop-state` token whose **interior** carries `sk-` but whose run does not begin with any
   catalogue prefix — the anchor conjunct. An unanchored implementation redacts this seed and reds
   AT-34a, which is the whole point of stating "prefix-anchored" normatively in **Error Handling**.

Seed 2 is deliberately *not* "any valid token": base64url admits `AKIA…`, which a correct
implementation redacts (**DEC-LOOP-05 (b)**'s accepted false-positive residual), so a generator over
all valid tokens would make AT-34a flaky against a correct implementation. Without AT-34a nothing reds when a legitimate
identifier is mangled.

## Test Strategy

### Levels and homes

| Level | Home | What it covers |
|---|---|---|
| Baseline pre-flight | `pdlc/workflows/__tests__/loopBaselinePreflight.test.js` *(new)* | the PLAN's `P0-00` pre-flight gate: every `BL-PREREQ` symbol this feature extends is importable / `hasattr`-present at HEAD — `renderEscalationEntry`, `appendEscalationEntry`, `MERGE_ESCALATIONS`, `MERGE_GUARD_DEFAULTS`, `effectiveGuardPaths`, `ADVISORY_SEAMS`, `MERGE_CONFIG_PATH` (`pdlc/workflows/orchestrate-dev.js`); `main`, `precheckDependencies` (`orchestrate-queue.js`); `parseEscalations` (`consolidate-learnings.js`); `runStartupChecks`, `formatStartup` (`pdlc/engine/lib/startup.mjs`); `defaultDeps.startupFor` (`pdlc/engine/bin/cli.mjs`). **Existence only** — it never asserts the new shape a later task creates, and the module-private `ESCALATIONS_PATH` / `VENDOR_ROOT` are deliberately outside the set |
| Pure unit | `pdlc/workflows/__tests__/loopSession*.test.js` | `readLoopConfig`, `evaluatePreflight`, `decodeLoopState`/`encodeLoopState`, `nextDirective`, `iterationLine`, `sessionSummary` |
| Pure unit | `pdlc/workflows/__tests__/escalationView*.test.js` | `parseEscalationLog`, `blockedFeatureCounts`, `buildOperatorView` |
| Pure unit | `pdlc/workflows/__tests__/loopEntryVocabulary.test.js` *(new)* | **AT-21** — `renderEscalationEntry`'s non-advisory branch: heading `## {iso} — {feature} — {source}` with a `| Source |` row and **no** `| Seam |` row; `{source}` is one member of `LOOP_SOURCES` *imported* from `lib/loop-session.mjs` (never transcribed, never an alternation); the advisory branch stays byte-identical to HEAD on HEAD input; the redactor fires on both branches; and `LOOP_SOURCES ∩ ADVISORY_SEAMS = ∅`. It also carries the `dist/pdlc-cli.mjs` regeneration conjunct for `orchestrate-dev.js`'s `./lib/` import |
| Pure unit | `pdlc/workflows/__tests__/loopDecisionEntry.test.js` *(new)* | **AT-25** — `renderDecisionEntry`'s five-row decision block including `Decided by` as a *field*, the 12-character `entryId` digest transcribed into the test as a literal (never recomputed by a second hashing helper), and the append performed through the shared `appendEscalationEntry` beside `renderEscalationEntry` |
| Module integration | `pdlc/workflows/__tests__/loopQueueDriver.test.js` | `main` with every IO seam scripted: report carries `loop`/`operatorView`, halt append site, preflight refusal byte-identity |
| Module integration | `pdlc/workflows/__tests__/loopMergeEscalation.test.js` | `phaseMerge`'s escalation sites append and still push their notice string; AT-34 and **AT-34a** (redaction, positive and negative) over the rendered entry |
| Module integration | `pdlc/workflows/__tests__/loopThreeSources.test.js` | **AT-18** — one scripted session in which an advisory seam refuses, a merge is refused and a pipeline halts, driving all three append sites through **one** `_appendFile` collector; the oracle is set-equality between the set of `sourceLabel`s parsed back out of the collected log and the literal three-member set `{advisory-seam, merge-refusal, pipeline-halt}`, so a source that silently stops appending reds. Non-vacuity: the collector is asserted non-empty and each of the three appends is attributed to its own call site |
| Module integration | `pdlc/workflows/__tests__/loopAdvisoryCatalogue.test.js` | **AT-19** — the set of advisory sources that append, re-enumerated from `ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js`) at test time rather than compared with a literal, with AT-19's own two non-vacuity conjuncts: both sides non-empty, cardinality at least the frozen enumeration's, and at least one named member (`A6`) present on both |
| Git-history oracle | `pdlc/workflows/__tests__/loopQueueCommitProvenance.test.js` | **AT-30** — a new level, created by this feature: a temporary git repo is initialised in a fixture directory, a scripted session runs N iterations against it through the real `gitFn`, and every commit in the session's range touching `docs/_queue/QUEUE.md` is asserted to carry `commitQueueRow`'s own message form (`chore(queue): {feature} → {status}`, `pdlc/workflows/orchestrate-queue.js`). A driver-side write is falsified by a commit in the range that no invocation produced. No count-equality is asserted (BR-19). The zero-iteration half is AT-14's byte-identity in `loopQueueDriver.test.js` |
| Document oracle | `pdlc/workflows/__tests__/loopGuardPaths.test.js` | **AT-32** — reads the documented extras from `pdlc/OPERATIONS.md`, applies the shipped `effectiveGuardPaths` at render time, asserts set-equality against the documented guarded-path set, plus the two membership conjuncts against `MERGE_GUARD_DEFAULTS` (**Data Model** §2) |
| Calibration | `pdlc/workflows/__tests__/loopCalibrationIsolation.test.js` | AT-20's whole-output identity over a mixed log |
| Document oracle | `pdlc/workflows/__tests__/loopDocumentSurfaces.test.js` | AT-33, AT-35, AT-45, AT-47 over the shipped docs and `pdlc/templates/loop.md`; and E-20(b)'s session-side detection rule and install remediation in `pdlc/skills/orchestrate-queue/SKILL.md` (AT-44's (b) half) |
| Property-based | `pdlc/workflows/__tests__/loopProperties.test.js` | the three property strategies below, under `fast-check`, following the shipped precedents `advisoryHelperProperties.test.js` and `consolidationProperties.test.js` |
| Engine CLI | `pdlc/engine/__tests__/loop-cli.test.js` | `--loop-state` parsing, `--loop`+`--loop-state` rejection, directive/view printing, `--loop` path unchanged |
| Engine golden bytes | `pdlc/engine/__tests__/loop-startup-remediation.test.js` *(new, `node:test`, runs under `Engine tests (ubuntu-latest)`)* | **AT-44**'s `STARTUP_REMEDIATION` half: the exported frozen constant transcribed literally into the test, `cmdDoctor`'s printed bytes on a not-ok startup unchanged against a baseline captured at HEAD, and the pre-refactor golden capture of `cmdQueue`'s `!startup.ok` refusal bytes for the three invocation shapes — captured **before** any Phase-4 engine source edit lands, per the PLAN's batch-safety rule 4. The remainder of AT-44's engine half (the `"strict"`/`"off"` policy cases) stays in `loop-cli.test.js` above |
| Config example | `pdlc/engine/__tests__/loop-config-example.test.js` | AT-46, following the shipped shape of `advisory-config-example.test.js` and `learnings-config-example.test.js` |
| Distribution | `pdlc/engine/__tests__/loop-distribution.test.js` (new, `node:test`, runs under `Engine tests (ubuntu-latest)`) | **AT-52**, all but its installed-engine half: the additive-only conjunct over each of **Architecture §7**'s D-1, D-2, D-3, D-5 and D-6 constants (read at test time, never transcribed; for D-5 and D-6 this is the TSPEC-added extension noted in §7, not an AT-52 obligation) — noting that D-6's `WORKFLOW_MODULE_NAMES` is *derived* from D-3, so reading it re-derives D-3 and adds no falsifying power of its own; D-6's real falsifier is `packRealTarball()` completing without `ENOENT`, and that lives in `packaging.test.js`, the D-4 document-oracle conjunct against `tspecPackedCount`'s vendored class size, and the importability conjunct — `runPrepack` is invoked into a temp vendor tree and the vendored `orchestrate-queue.js` is `import()`ed from it, reaching both `lib/` modules through it |
| Fixture machine | existing `npm-pack-install-upgrade` leg, `pdlc/engine/scripts/fixture-machine.mjs` (runs under `Fixture machine (install/upgrade, launcher, container, two-repo)`) | **AT-52**'s installed-engine half: an engine installed from the packed tarball starts and iterates a loop session. This is the only CI surface that installs a published-shaped engine, and it is also D-5's site — the leg reds on its own if D-5 is not landed with D-1 |

AT-44's `"strict"`/`"off"` policy cases run in `pdlc/engine/__tests__/loop-cli.test.js` **through the production
`cmdQueue`**, with the real `!startup.ok` branch in place and only `deps.startupFor` scripted: the
`"strict"` case asserts the loop's own refusal and zero iterations, and the `"off"` case asserts —
per REQ AC-3.4 / FSPEC BR-11b, E-19 and AT-15b — that `runQueue` was **never reached**, that the exit
code is `1`, that `emitReport(null, …)` was the report call taken, that the iteration count is `0`
and no wait was taken, that `docs/_queue/QUEUE.md` is byte-identical, that the `preflight-warning`
notice still carries `STARTUP_REMEDIATION`, and that the stop reason is `engine-dispatch-refused`
rather than `preflight-refused`. Because the `"strict"` and `"off"` cases run in the **same file**,
AT-44 additionally carries a one-line `notEqual` over the two rendered `detail` strings — this is the
falsifier for **Data Model** §5's claim that the tenth member's `detail` is textually distinguishable
from `preflight-refused`'s, which is otherwise a stated contract with no oracle. Asserting
`evaluatePreflight` in isolation would prove nothing about
cli.mjs's return and is explicitly not the oracle. AT-15a — the working-tree half under `"off"`,
which *does* proceed to iteration 1 — is a separate case in the same file, and is what keeps the
AC-3.4 asymmetry falsifiable in both directions.

**AT-52's vendor-tree fixture is not new.** `pdlc/engine/__tests__/packaging.test.js`'s
`packRealTarball()` already constructs the scratch `$TMP/pdlc/engine` + `$TMP/pdlc/workflows` sibling
pair that lets the unmodified `prepack.mjs` resolve its own relative workflow path; `loop-distribution.test.js`
reuses that recipe rather than inventing a second one, and `fixture-machine.mjs`'s copier is the same
shape. **The recipe reused is the corrected one, not HEAD's.** At HEAD the copy step is
path-lossy — the `WORKFLOW_MODULE_NAMES` definition is `path.basename`-mapped off **D-3**'s
`WORKFLOW_MEMBERS`, imported from `./_tspec-packed-set.mjs` and not from `publish-preflight.mjs`
(`packaging.test.js:49-51`), and `packRealTarball`'s per-name `cpSync` loop copies to
`buildWorkflowsDir/<basename>` under its single workflows-tree `mkdirSync` (`:111`, `:119-123`) — which is precisely
**D-6**: with `lib/` members in the set it throws `ENOENT`. D-6 lands first, in the same task as
D-1/D-3, making the copier preserve each
member's relative path and create parent directories; `loop-distribution.test.js` and
`fixture-machine.mjs` inherit *that* shape. A copy of HEAD's flattening into either would red the
required `Engine tests (ubuntu-latest)` and `Fixture machine` checks respectively.
Nothing here adds a CI workflow file or a required check: both homes sit inside checks the
four-check table already lists.

Both `pdlc/workflows` (jest) and `pdlc/engine` (node:test) suites already run in CI as
`Unit tests (ubuntu-latest, node 20)` and `Engine tests (ubuntu-latest)`; no new workflow file and no
new required check is introduced, so the four-check table in the project `CLAUDE.md` and FSPEC §5.1's
required-check set are unchanged.

### Test doubles

No new double *kinds*. The existing injected seams are used:

| Seam | Double | Precedent |
|---|---|---|
| `readFileFn` | in-memory `Map<path, string\|null>` | `pdlc/workflows/__tests__/helpers/` and the queue-driver suites |
| `_appendFile` | array-collecting async fn; a throwing variant for E-08 | `advisoryEscalationLog.test.js` |
| `gitFn` | scripted `{ok, stdout, stderr}` responder keyed on argv | `mergeQueueDriver.test.js` |
| `_now` | fixed epoch | `renderEscalationEntry`'s existing `{now}` parameter |
| `startupFor` | `deps.startupFor` is already injectable in `cmdQueue` | `pdlc/engine/__tests__/cli.test.js` |

Because both new modules are pure, the overwhelming majority of the AT set needs no double at all —
`nextDirective` alone discharges AT-03…AT-09, AT-39, AT-40, AT-41 and AT-49 from plain values.

### Oracle discipline

Learned from the prior features in this repo's LEARNINGS set, and binding on this feature's tests:

1. **No absence-only assertion.** AT-12, AT-15a/AT-15b/AT-16, AT-19 and AT-33 each carry the positive
   conjunct the FSPEC already names. `evaluatePreflight` returning a length-2 `conditions` array with
   explicit `held` booleans exists precisely so "the check ran and passed" is assertable.
2. **A catalogue oracle compares a collected set against a literal transcription; the frozen
   constant appears on neither side.** `deepEqual(LOOP_NOTICE_CODES, LOOP_NOTICE_CODES)` is the
   constant compared with itself: it passes for any content and derives its expectation from the
   code under test. So:
   - **AT-51** — a session fixture exercises **every one of the ten notice-raising conditions**
     (the ten rows of §Interfaces' notice-channel table, one fixture case each). The set of codes
     `collectNotices` actually produced across that session is `deepEqual`'d against a ten-member
     array **written literally into the test file**. A catalogue code that no condition raises then
     reds, which is what FSPEC AT-51 asks for and what a constant-vs-itself comparison cannot do.
   - **AT-37** — the set of stop reasons **exercised** by the session fixtures is `deepEqual`'d
     against a **ten**-member array written literally into the test — §3.4's ten-member stop-reason
     enumeration, including `engine-dispatch-refused`, so a session ending on the zero-iteration
     engine-dispatch path must be among the fixtures or AT-37 reds; and the summary's `fields` key
     set is `deepEqual`'d against a literal transcription of §3.4's nine summary members (a
     different set — nine *fields*, ten *stop reasons*). `LOOP_STOP_KINDS` is not an operand of
     either comparison.
   - A **separate, deliberately narrow** consistency test asserts `LOOP_NOTICE_CODES` and
     `LOOP_STOP_KINDS` set-equal to the same literals, so the frozen constants are pinned once
     without being the behavioural oracle.
   `LOOP_DEFAULTS` (AT-10) and `iterationLine`'s `fields` key set (AT-36) are likewise asserted
   against literal transcriptions of BR-01 and §3.4, never against the module's own export.
3. **Literal transcription where the FSPEC says literal.** AT-07's `[5, 15, 30, 60, 60]` and AT-08's
   restart sequence are written into the test as literals, never computed from the schedule the code
   under test read.
4. **Non-vacuity controls.** AT-19 asserts both sides non-empty and at least one named member
   present. AT-20's fixture is built so a totals-only oracle passes and the derived-candidate
   conjunct fails, and the test asserts that the naive comparison would have differed.
5. **No hand-maintained counts of enumerable sets** in the tests or in this document: the stop-reason
   and notice-code counts stated in **Data Model** are checked in test against the length of the
   literal arrays item 2 defines, so a count in this document that drifts from the enumeration reds.
   The counts are never derived from the frozen constants — that is item 2's whole point.
6. **`AT-46` uses containment for the section set** (the example file is shared) and set-equality for
   the `loop` section's own key→value map, exactly as the FSPEC specifies.

### Property-based strategies

Property-based testing is the project standard and the repo already ships two suites of it
(`advisoryHelperProperties.test.js`, `consolidationProperties.test.js`, both under `fast-check`).
Three components here have an input space worth generating over, and each gets at least one named
law in `loopProperties.test.js`. These supplement the example-based ATs; neither subsumes the other.

| Component | Property | Discharges |
|---|---|---|
| `decodeLoopState` / `encodeLoopState` | **Round-trip:** for an arbitrary well-formed `SessionState`, `decodeLoopState(encodeLoopState(s))` deep-equals `s`. **Totality:** over arbitrary strings (including non-base64, non-JSON, non-object, wrong-`v`, and truncations of a valid token), `decodeLoopState` never throws and always returns the fresh-session value | E-24 / AT-48, stated as strongly as it can be |
| `readLoopConfig` | For arbitrary JSON, the returned `config` is **complete** (all four keys present), every key is either the configured in-domain value or exactly the `LOOP_DEFAULTS` value, and a key holding the default because it was substituted is named in `invalidKeys` — the invariant AT-38's two-key example only samples | BR-01…BR-03, E-02 |
| `redactEntryText` | **Per-family redaction:** for a **concrete `prefix` instance drawn from** one of the five behavioural families (`gh[pousr]_` and `xox[baprs]-` are character classes — the generator draws `ghu_`, `xoxb-`, …, never the class source text) and `run` drawn from `[A-Za-z0-9_\-]{8,64}`, `redactEntryText(prefix + run)` contains neither the drawn `prefix` nor `run` as a substring and does contain `[redacted:{n} chars]` with `n` = `(prefix + run).length`. **Non-firing half:** quantified over inputs containing **no catalogue prefix at any position** — 40-hex git oids, and `--loop-state` tokens drawn from base64url filtered to exclude every catalogue prefix as a substring — the output is the input unchanged. (Not "any valid token": base64url admits `AKIA…`, which is correctly redacted — **DEC-LOOP-05 (b)**'s accepted *false-positive* residual, distinct from the false negative NFR-5/Q-10 scope.) **Anchor half:** for a run whose *interior* but not start carries a catalogue prefix (e.g. a token containing `sk-` mid-string), the output is the input unchanged — this is the conjunct an unanchored regex fails. This is the only assertion that distinguishes a compiled-and-correct pattern from a copied constant | BR-18 / NFR-5, AT-34 (all five families), AT-34a |
| `blockedFeatureCounts` | Over arbitrary dependency graphs (cycles included), every count is `≤` the number of non-`done` rows, no feature counts itself, and the result is invariant under permutation of the input rows | E-12 / AT-42, as a law rather than one cycle fixture |

### Coverage floor

`loop-session.mjs` and `escalation-view.mjs` are new modules and must be inside the measured set,
which is not automatic: the c8 `include` block in `pdlc/workflows/package.json` is an explicit,
path-qualified list (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`,
`capture-learnings-baseline.mjs`) and `lib/document-oracles.mjs` — the only current `lib/`
inhabitant — is **not** in it. This feature adds `**/pdlc/workflows/lib/loop-session.mjs` and
`**/pdlc/workflows/lib/escalation-view.mjs` to that block, `**/`-anchored like every other entry
(the block's own `//c8` note records why bare basenames silently drop out under `allow-external`).

This `include` block is a **second inherited enumeration this feature widens**, alongside
**Architecture §7**'s D-1…D-6 — but it is permitted by a different clause, and needs no carve-out.
The carve-out (and NFR-1's single exception, and FSPEC BR-21's verbatim restatement of it) is
qualified to *"`pdlc-engine-distribution`'s file enumerations"*; the c8 block is not one, so the
carve-out does not reach it. What permits it is **REQ §5's out-of-scope clause** directly: what is
out of scope is *"changing what any gate delivered by orders 1–4 asserts"*, and widening the file
set the ≥85% per-file branch floor ranges over does not change that assertion — two more files must
clear 85%, no file's floor moves, no existing entry is removed or altered. There is no
§5-vs-NFR-1 divergence to reconcile; **upstream erratum 2** routes a clarity narrowing of the same
sentence to **both** REQ §5 and FSPEC BR-21, and **Architecture §7** (*The second widening rests on
§5's out-of-scope clause*) carries the argument.

The floor is the project's: **≥85% branch coverage per file**, enforced by `npm run test:coverage`'s
second stage (`c8 report --check-coverage --per-file --branches 85`, `pdlc/workflows/package.json`),
which runs in CI as `Unit tests (ubuntu-latest, node 20)`.

**The two new entries need a falsifier of their own; this feature adds it.**
`coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES`
(`pdlc/workflows/__tests__/coverageInstrumentation.test.js:37-41`) is a **literal transcription**,
deliberately not derived from a listing, and at HEAD it names exactly the three pre-existing
workflow entries (`**/pdlc/workflows/orchestrate-dev.js`, `**/pdlc/workflows/orchestrate-queue.js`,
`**/pdlc/workflows/build-runtime.mjs`); the capture-script entry is a separate constant
(`CAPTURE_SCRIPT_INCLUDE`). Its resolution oracle iterates the `include` block **as found**, so it
would pass over a block that never gained the two new entries — i.e. presence of
`**/pdlc/workflows/lib/loop-session.mjs` and `**/pdlc/workflows/lib/escalation-view.mjs` in the
measured set is, at HEAD, **unasserted**. (An earlier revision of this document claimed these two
entries were "covered by an existing oracle"; that claim was false as to *presence*, and is
withdrawn.) This feature therefore **extends `REQUIRED_INCLUDES` with the two new entries**, in the
same task that edits the `include` block — the two are one co-change, and the transcription's own
header comment states that obligation. With that extension the mutant "ship the `lib/` modules but
forget the `include` entries" is killed by a millisecond-scale offline assertion, and the ≥85%
per-file floor demonstrably ranges over both new modules.

### Mutation sensitivity

Three mutants the suite must kill, named because each corresponds to a defect this repo has shipped
before: (a) `schedulePos` advancing on a `stop` as well as a `continue` — killed by AT-49; (b)
`corpusState` left on the raw block count — killed by AT-20's corpus-state conjunct; (c)
`evaluatePreflight` short-circuiting the second condition when the first fails under `"off"` —
killed by AT-16's positive `held` conjunct. Three more, one per High closed this round: (d) V4
overlaying before V3 collapses — killed by AT-43's `occurrences: 2` conjunct; (e) the recurrence key
falling back to the rendered decision sentence — killed by AT-50's occurrence count of 3 over three
appends whose sentences differ in an interpolated count; (f) the redactor firing on a 40-hex oid —
killed by AT-34a; (g) **deleting one prefix family** from the catalogue — `github_pat_`, `sk-`,
`xox[baprs]-` or `AKIA` — killed by `redactEntryText`'s per-family property and by AT-34's
parameterised case for that family (deleting `ghs_` alone is the exception: it is behaviourally
subsumed by `gh[pousr]_`, and is killed by the set-equality pin instead, *Error Handling* →
*Pattern*); (h) `cmdQueue` returning early on `!startup.ok` only under `"strict"` — i.e.
re-introducing the policy-aware branch this document rejects — killed by AT-44's `"off"` case
asserting `runQueue` never reached and exit code `1`.


## Traceability

Every FSPEC business rule mapped to the component that implements it, and every acceptance test to
where it is exercised. No rule is unowned; no component exists without a rule.

| FSPEC rule | Component | AT |
|---|---|---|
| BR-01 | `LOOP_DEFAULTS`, `readLoopConfig` (`loop-session.mjs`) | AT-10, AT-46 |
| BR-02 | `readLoopConfig` → `case` | AT-10 |
| BR-03 | `readLoopConfig` → `invalidKeys` | AT-38 |
| BR-04a | `nextDirective`, throw branch | AT-40 |
| BR-04 | `nextDirective`, `ran` branch | AT-01, AT-02, AT-08 |
| BR-05 | `nextDirective`, `blocked` branch | AT-03 |
| BR-06 | `nextDirective`, `halted` branch | AT-04 |
| BR-07 | `nextDirective`, `idle` + `awaitingMerge`/`readable` | AT-05, AT-06, AT-41 |
| BR-08 | `nextDirective`, `no-queue` branch | AT-09 |
| BR-09a | no suppression path exists; append sites are unconditional | AT-50 |
| — (AC-4.1 headline) | all three append sites driven in one session through one collector (`loopThreeSources.test.js`) | **AT-18** |
| BR-09 | `nextDirective` schedule arithmetic | AT-07, AT-08, AT-39, AT-49 |
| BR-10 | `evaluatePreflight` + `startupFor` alongside `cmdQueue`'s **unmodified** `!startup.ok` branch; `STARTUP_REMEDIATION` (`pdlc/engine/lib/startup.mjs`) | AT-11, AT-12, AT-17, AT-19 (catalogue re-enumeration is BR-12a's, not this row's), AT-44 |
| BR-11 | preflight tree seam (`git status --porcelain`) | AT-13 |
| BR-11a | refusal placed before `readFileFn(queuePath)` in `main` | AT-14 |
| BR-11b | `evaluatePreflight`, `conditions[]` always length 2; **the working-tree half proceeds to iteration 1, the engine half does not** (`cmdQueue`'s unmodified `!startup.ok` branch, stop reason `engine-dispatch-refused`) | AT-15a, AT-15b, AT-16 |
| BR-12 | `renderEscalationEntry` (both branches) | AT-21 |
| BR-12a | `LOOP_SOURCES` disjoint from `ADVISORY_SEAMS`; `parseEscalations` `corpusState` fix | AT-20 |
| BR-13 | `blockedFeatureCounts`, `buildOperatorView` comparator | AT-22, AT-23, AT-24, AT-42 |
| BR-14 | decision block (five rows, incl. `Decided by`) + `renderDecisionEntry` + `buildOperatorView` **V4 overlay**; `EscalationEntry.decided*` fields are AT-25's retrieval contract | AT-25, AT-43 |
| BR-15 | `buildOperatorView` **V3 collapse**, keyed on `(source-or-seam, feature, conditionKey)`, `occurrences` computed before any overlay | AT-26, AT-43, AT-50 |
| BR-16 | `parseEscalationLog` → `parseNotices`, deciding all three AC-4.7 shapes incl. duplicate-field by row **count** (**Data Model** §4b) | AT-27 (three cases, one per shape) |
| BR-17 | `parseEscalationLog(null)`; `appendEscalationEntry`'s directory-creating `_appendFile` | AT-28 |
| BR-18 | `redactEntryText` over every free-prose field on both branches, prefix-anchored pattern (**Error Handling**) | AT-34, **AT-34a** (negative control) |
| BR-19 | no write seam is called by `loop-session.mjs`; `commitQueueRow`'s `chore(queue): {feature} → {status}` message form identifies invocation-produced commits, asserted over a real fixture git repo (`loopQueueCommitProvenance.test.js`) | AT-30, AT-14 |
| BR-20 | unchanged HEAD `skipped` path + `candidate-skipped-not-ready` notice | AT-31 |
| BR-21 | no gate's assertion is modified; the `--loop` path untouched. BR-21 restates NFR-1 verbatim, and both defer to §5's carve-out and are qualified to *"`pdlc-engine-distribution`'s file enumerations"* — so the carve-out covers **Architecture §7**'s D-1…D-6 and nothing else. The feature's second widening, the c8 `include` block in `pdlc/workflows/package.json` (**Test Strategy** → *Coverage floor*), is **outside** the carve-out and needs no part of it: REQ §5 puts *changing what a gate asserts* out of scope, and widening the file set the ≥85% per-file floor ranges over changes no assertion. Both widenings are additive; neither changes an assertion; no §5-vs-NFR-1/BR-21 divergence exists. **Upstream erratum 2** routes a clarity narrowing of that sentence to REQ §5 **and** BR-21, which carries it too | AT-04, **AT-52** |
| BR-22 | one `pdlc queue` process is the interruptible unit | — (design property, E-22) |
| BR-23 | `effectiveGuardPaths` read at render time | AT-32 |
| BR-24 | this repo's untracked `.claude/pdlc.config.json`; the tracked referent is `pdlc/OPERATIONS.md`'s documented extras, from which `loopGuardPaths.test.js` derives the effective set (**Data Model** §2, Q-07 decided). The shipped example config carries `guardPaths: []` | AT-32 |
| BR-25 | `pdlc/OPERATIONS.md` operator-surface section | AT-33 |
| BR-26a/BR-26 | `pdlc/templates/loop.md` + install instruction | AT-45 |
| BR-27 | `iterationLine` `fields` | AT-36 |
| BR-28 | `sessionSummary` `fields` — all **nine** §3.4 members, with `halted`/`escalationsRaised`/`operatorView` accumulated on `SessionState`; emitted on all **ten** stop kinds, including `engine-dispatch-refused` (nine *fields*, ten *stop reasons* — different sets) | AT-37 |
| §3.4 notice catalogue | `notice()` + `collectNotices` (§Interfaces) — one declared producer per code | AT-51 |
| BR-29 | `.claude/pdlc.config.example.json` | AT-46 |
| BR-30 | durability documentation in `pdlc/OPERATIONS.md` | AT-35, AT-47 |

**REQ obligations discharged.** O-1 → Q-04/Q-05 answers in **Data Model** §6 and **Test Strategy**
(AT-01 runs at the module-integration level in `loopQueueDriver.test.js`, scripting two consecutive
invocations against one in-memory queue; it runs in CI as part of the existing workflows suite).
O-2 → **Architecture** §4 and §5. O-3 → **Architecture** §4 (append placement) and §6 (decision
records). O-4 → **Architecture** §3 contract table. O-5 → the log path is
`ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md"`, already shipped in `orchestrate-dev.js`. O-6 →
DEC-LOOP-04.


## Open Questions

Nothing here blocks the PLAN; each item names its owner and a default the PLAN may proceed on.

| ID | Question | Owner | Default if unanswered |
|---|---|---|---|
| T-Q-01 | *Closed this round.* FSPEC Q-07 assigns the decision here, and **Data Model** §2 takes it: the extra is configured in this repo's untracked `.claude/pdlc.config.json`, documented in `pdlc/OPERATIONS.md`, and the shipped example ships `guardPaths: []`. FSPEC's AT-32 at HEAD already carries the tracked-declaration conjunct ("read from the repo's tracked default-branch content rather than the working tree"), so nothing on this item remains routed upstream | — (decided) | — |
| T-Q-02 | Should `parseEscalations`' `corpusState` change be gated behind a flag for one release, given it also changes malformed-advisory-block behaviour? The affected oracles belong to `pdlc-consolidation-agent` (QUEUE row 2, completed), so this feature owns the change and its blast radius: DEC-LOOP-03 records the owner, and the PLAN task that lands the derivation also re-runs `consolidationAdvisory.test.js` and any sibling asserting `corpusState` on a malformed-advisory corpus, updating them in the same commit | DECISIONS (DEC-LOOP-03) — owner named | No flag; the new derivation ships directly, with the sibling oracles updated in the landing commit |
| T-Q-03 | The token is visible in the session transcript. Acceptable, or should it be opaque? | operator | Plain base64url of readable JSON — inspectability beats obscurity, and NFR-5 already forbids secrets in it |
| T-Q-04 | Q-09: `parseEscalations` drops an unrecognised block silently and emits no notice, while BR-16 requires a notice from the *view* reader. Should the calibration reader also emit one? | TSPEC follow-up / `pdlc-consolidation-agent` | **The two readers differ on notices *and* on "unparseable", and the divergence is deliberate and bounded.** `parseEscalations` keys on `Feature` **and `Seam`** (`pdlc/workflows/consolidate-learnings.js`) and §5 keeps it that way, so a `Feature`+`Source` block is parseable for the **view** and skipped by the **calibration** — which is not an accident but the whole of BR-12a: a non-advisory entry must be invisible to the calibration. The agreed part is narrower: a block missing `Feature` is unparseable to both. Only the view emits notices, and only the view decides AC-4.7's duplicate-field shape (**Data Model** §4b); the calibration keeps its first-match behaviour unchanged |

**Upstream errata raised from this document** (none is edited here):

| # | Document | Item |
|---|---|---|
| 1 | **REQ** (the clause needing narrowing lives there; FSPEC's author is copied because BR-12a is the other side) | The conflicting text is REQ AC-4.4's **rationale clause** — "the decision record is input to `pdlc-consolidation-agent`'s confidence calibration" — against FSPEC BR-12a, "the calibration counts advisory entries only, over its whole output" (asserted by AT-20). A decision block carries no `\| Seam \|` row and is therefore invisible to the calibration **by construction**, so the two cannot both hold as written. **The side to narrow is REQ's**, because BR-12a is the load-bearing behaviour (a non-advisory entry must not enter the calibration) and is already oracle-covered by AT-20, whereas AC-4.4's clause is a motivating aside that the durability requirement does not depend on: AC-4.4's normative content — that a decision record is durable and retrievable — stands whichever consumer eventually reads it. Suggested narrowing: restate the clause as "input to a future calibration or audit pass that reads `parseEscalationLog`", removing the specific `pdlc-consolidation-agent` confidence-calibration attribution. Routed to the REQ's author (pm-author). |
| 2 | **REQ** §5 **and FSPEC BR-21** (BR-21 restates §5's/NFR-1's sentence verbatim, so a narrowing applied to only one leaves the other stale) | **Clarity, not permission.** REQ §5's **Carve-out (in scope)**, NFR-1 and BR-21 all say the same thing: the single exception widens *"`pdlc-engine-distribution`'s file enumerations"*, with NFR-1 and BR-21 explicitly deferring to §5 for it. This feature widens one enumeration that is **not** a `pdlc-engine-distribution` enumeration — two `**/`-anchored entries added to the c8 `include` block in `pdlc/workflows/package.json`, owned by the ≥85% per-file branch floor the required check `Unit tests (ubuntu-latest, node 20)` enforces (**Test Strategy** → *Coverage floor*). It is permitted **without** the carve-out: §5's out-of-scope clause bars *changing what any gate delivered by orders 1–4 asserts*, and widening the file set a coverage gate ranges over changes no assertion. So no wording is wrong today and nothing downstream is blocked. The narrowing is worth making anyway, because §5's exclusivity clause (*"the only permitted change to any gate this feature inherits"*) invites the misreading that any inherited-gate edit outside the carve-out is forbidden: restate it as "the only permitted change to what any inherited gate **asserts** — none; enumerations may be widened additively", or name the coverage-`include` enumeration alongside the distribution ones. Apply the same edit to FSPEC BR-21. Routed to the REQ's and FSPEC's author (pm-author). |

Three further items carried here in v0.3 — BR-14's missing **who decided**, E-20/AT-44's
`"off"` half, and AT-32's untracked-configuration subject — are **withdrawn**: FSPEC at
HEAD already closes all three (BR-14 names "who decided it"; AT-44's `"off"` half now requires
the engine's dispatch refusal at zero iterations; AT-32 carries the tracked-declaration conjunct).
They are recorded as withdrawn rather than deleted silently, so a reader of an earlier version
can see they were closed upstream and not dropped.

**Downstream erratum to `DECISIONS-pdlc-engineering-loop.md` — DISCHARGED (was: owed).**
Raised in v0.3 and carried as *owed* through v0.8: `DECISIONS-pdlc-engineering-loop.md`, then written
against TSPEC v0.2, recorded `DEC-LOOP-06` as making `cmdQueue`'s `!startup.ok` branch
**policy-aware on the `--loop-state` path** — the shape REQ AC-3.4 and FSPEC BR-11b forbid and the
shape TSPEC v0.4 reverted at every site — and `DEC-LOOP-04`'s rejected alternative was stale against
v0.4's `readLoopConfig` re-framing. **Both were corrected at DECISIONS v0.4 and remain correct at
DECISIONS v0.6 (HEAD).** At HEAD, `DEC-LOOP-06`'s heading and decision block read *"`cmdQueue`'s
fail-closed refusal is left untouched; the policy asymmetry lives in the loop"*, its obligations row
requires the refusal's bytes and exit code to be asserted unchanged on the non-loop **and** the loop
path, and `DEC-LOOP-04` is stated as an **extension** of the `readEngineConfig` provenance precedent
with its rejected alternative re-pointed at retrofitting the five workflow-side readers. Nothing is
owed to DECISIONS from this document, and nothing in this document changes: the divergence this note
was created to keep visible no longer exists. The note is retained rather than deleted so a reader of
an earlier version can see the item was closed upstream and not dropped, and so a later round does
not re-raise it as an open erratum.

**Dispatch-header `UPSTREAM-STATE` digests are correct — closed, nothing owed.** Recorded here
once so it stops being re-raised per round. From the DECISIONS v5 round onward the erratum/
cross-review dispatch header has carried an `UPSTREAM-STATE` FSPEC digest of `sha256:ff32fa3f…` or
`sha256:6bf027f4…`, and rounds 9–13 recorded that as a workflow defect on the ground that no
committed FSPEC revision hashes to either value. **That was a reviewer-side and author-side
measurement error, not a defect.** The pipeline does not digest a document with plain `sha256` of
its bytes: `sha256Hex` (`pdlc/workflows/orchestrate-dev.js`, the `sha256Hex` export) hashes
`canonicaliseForDigest(text)` — CRLF/CR → LF, then exactly one trailing newline — and the
canonicalisation is applied **inside** the digest function, never by a caller, which its own
comment states is the point. `approvalHashOf` is `` `sha256:${sha256Hex(text)}` `` and is described
there as *the one digest in this pipeline*; `deriveApprovalUpstreamState` builds each
`UPSTREAM-STATE` row from that same probe-then-hash pair over the upstream file as it exists at
dispatch time.

Measured with the pipeline's own function over all 38 commits touching
`FSPEC-pdlc-engineering-loop.md`: `1b3d6ff4c` (FSPEC v0.7) → `sha256:ff32fa3f…` and `9847882e2`
(FSPEC v0.8, HEAD content) → `sha256:6bf027f4…`. The two digests are exactly the canonical digests
of the two committed FSPEC revisions that were HEAD at the rounds concerned, so **the dispatch
header has been correct every round**. Independent confirmation: the FSPEC's own approvers anchored
on the same value — `CROSS-REVIEW-software-engineer-FSPEC-v13.md` and
`CROSS-REVIEW-test-engineer-FSPEC-v14.md` both record
`APPROVAL-HASH: sha256:6bf027f41ea115a6854f26cce7dd7716f3babd4ec5dd27072b0cbc163f9606a0`.

The standing item is therefore a **reviewer invariant, not an open defect**: compare a document
digest with the pipeline's `sha256Hex`/`approvalHashOf`, never with `shasum -a 256` or
`git hash-object`, which digest un-canonicalised bytes and will show a mismatch that is not there.
No workflow change is owed, no document edit is owed, and the item is closed. Nothing in this
TSPEC ever depended on the cited digest: every erratum round of this document has been re-grounded
on the upstream text at committed HEAD, per the *upstream at HEAD* rule, and the round's binding is
carried by the revision-changelog row that names the upstream *version* (REQ v1.8 / FSPEC v0.8).
Changelog rows 0.7, 0.9, 1.0 and 1.1 record the withdrawn claim as it stood at those rounds; they
are left as the historical record of what each round did, and this note supersedes them.

**Assumptions carried forward from the FSPEC** (A-01, A-02, A-03) are implemented as stated:
`consecutiveIdle` advances only on a backoff-entering `idle`; a throw is a stop, not an `idle`; the
blocked-feature count counts distinct features, not paths.

**New assumption, visible so it can be vetoed.** *A-T-01:* the `/loop` runtime lets the driving
prompt choose each interval (the `/loop` skill's own "Omit the interval to let the model self-pace").
Backoff scheduling depends on this. If a future runtime fixes the interval at launch, `waitMinutes`
degrades to a report field the operator reads rather than an interval the session honours, and AT-07
would have to be restated over the *requested* wait only — which E-25 already makes observable.

## Decisions Warranted

Six load-bearing alternatives were weighed and rejected; they belong in
`DECISIONS-pdlc-engineering-loop.md`. They are listed in id order:

- **DEC-LOOP-01** — session state in a caller-echoed token, not a durable state file. Rejected
  alternatives: a `.claude/pdlc-loop-state.json` file (a stale file from an abandoned session seeds a
  fresh one, and E-24 becomes a simulated special case rather than a structural fact); recomputation
  from `QUEUE.md` and git history (the idle counter is not durable anywhere).
- **DEC-LOOP-02** — the session waits, not the engine process. Rejected: teaching `runQueueLoop` to
  sleep (holds a Node process and an authenticated adapter for up to an hour, and REQ AC-1.5 requires
  the two paths to diverge observably on `halted`).
- **DEC-LOOP-03** — `corpusState` derived from counted entries rather than raw block count. Rejected:
  a non-advisory-only sidecar file (splits the operator's single place to look, contradicting US-02
  and AC-4.1's single-file requirement); a source-name prefix filter in `seamCandidates` alone
  (leaves `entryCount` and `corpusState` wrong, so AT-20's whole-output identity still fails).
- **DEC-LOOP-04** — `readLoopConfig` **extends** the `parseAdvisoryConfig`/`parseMergeConfig`
  precedent with AC-2.5's fourth state, and obtains the extension in a **new four-case reader in
  `loop-session.mjs`** rather than in the shipped siblings. The extension is confined to the `case`
  field, which the siblings do not carry at all; every config value the sibling algorithm produces is
  produced unchanged, so no sibling behaviour moves (FSPEC Q-03 decides this framing — the
  precedent is inherited, not diverged from; only *where* the extension lives was open). Rejected:
  retrofitting the fourth state into the two shipped sibling readers and their consumers (widens this
  feature's blast radius across `advisory` and `merge` config for no requirement of theirs, and makes
  a `case` field those consumers never read part of their contract); and collapsing to three cases so
  no extension is needed (AC-2.5 and BR-02 are then unsatisfiable).
- **DEC-LOOP-05** — the BR-18 redactor matches **published credential prefixes**, not high-entropy
  runs. Rejected: v0.1's entropy heuristic (≥20 chars of `[A-Za-z0-9_\-]` containing a digit and a
  letter), which fires on a 40-hex git oid and on this feature's own plain-base64url `--loop-state`
  token, silently mangling the operator's only durable record and defeating T-Q-03's inspectability;
  and omitting the field rather than redacting it (loses the operator's ability to see that
  *something* was there, which the `[redacted:{n} chars]` form preserves). Accepted residual risk:
  a bare high-entropy secret with no recognised prefix is not redacted — recorded rather than
  papered over, and the reason AT-34a exists to pin the trade in the other direction.
- **DEC-LOOP-06** — `cmdQueue`'s fail-closed `!startup.ok` refusal is **left untouched under every
  policy**, and `loop.preflight: "off"` manifests as the loop's own `preflight-warning` notice plus a
  distinct stop reason (`engine-dispatch-refused`) emitted alongside the shipped refusal, at zero
  iterations. Rejected: making the branch policy-aware on the `--loop-state` path so `"off"` runs
  iteration 1 (directly contradicts REQ AC-3.4 and FSPEC BR-11b — "No value of `loop.preflight` makes
  an unready engine run an iteration" — and would make AT-15b/AT-44's `"off"` half green on the
  forbidden behaviour and red on a correct implementation); making it policy-aware for **every**
  invocation (additionally weakens C-10 fail-closed for plain `pdlc queue` in any repo that sets
  `"off"`); reusing `preflight-refused` for the `"off"` engine case (E-19 requires the two to be
  distinguishable, and BR-28 would then owe no summary case for the engine-dispatch path); shelling
  out to `pdlc doctor` from the session (a subprocess per iteration, and Q-06 was answered
  in-process).
