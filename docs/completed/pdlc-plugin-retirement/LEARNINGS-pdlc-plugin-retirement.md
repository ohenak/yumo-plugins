# LEARNINGS — pdlc-plugin-retirement

| Field | Detail |
|---|---|
| Feature | pdlc-plugin-retirement |
| REQ | docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md |
| Date Completed | 2026-08-18 |
| Total Iterations | REQ: 15, FSPEC: 15, TSPEC: 14, PLAN: 2, PROPERTIES: 3, DECISIONS: 8, IMPL (Phase CR): 2 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 112 `CROSS-REVIEW-*.md` (REQ: SE v1–v15, TE v1–v10 + v15; FSPEC: SE v1, v3–v5, v7–v15, TE v1–v15; TSPEC: PM v1–v14, TE v1–v14; DECISIONS: PM v1–v8, TE v1–v8; PLAN: PM v1–v2, TE v1–v2; PROPERTIES: PM v1–v3, SE v1–v3; REVIEW (Phase CR): PM v1–v2, TE v1–v2) + 3 `CODE_REVIEW-pdlc-plugin-retirement-v{1,2,3}.md` + `POSTMORTEM-R`, `POSTMORTEM-T`, `POSTMORTEM-D` (postmortems read, retained). Supporting evidence retained: `REPLAY-`, `POSTSWEEP-RUN-`, `OPERATOR-OBSERVATIONS-`. |
| Phases exercised | R, F, T, D, P, PR, IMPL, CR, DOD, H |
| DoD rounds | 3 (`CODE_REVIEW-v1` failed → `v2` failed → `v3` passed) |

## 1. Non-Convergences

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| R (REQ) | software-engineer + test-engineer | AC-1.2's retired-name term set was stated as an upper bound, not set-equality; two survivor terms (`build-runtime.mjs`, `pdlc/workflows/dist/`) were wrongly inside the required-empty set, and the pinned recipe disagreed with `baseline:148`'s enumeration by −4/+17 paths. Round-5 halt at REQ v0.8. | `POSTMORTEM-R` `RESOLVED: yes`. Survivor terms dropped, term set pinned as set-equality with re-measurement at C-6, delta rounds resumed. Converged at REQ v0.16, round 15. | 5 rounds to halt; 15 total |
| T (TSPEC) | product-manager + test-engineer | Oracles specified in English over a *moving* tree: §5.5's no-orphan universal ranged over test helpers the sweep was itself deleting; the AT-1.3 / §2.6 / §5.5 cluster consumed rounds 3, 4 and 5, each fix opening its successor in the same neighbourhood. Round-5 halt at TSPEC v0.6. | `POSTMORTEM-T` `RESOLVED: yes`. Round-5 findings were already fixed in v0.6 (`3b295554`, `0dbc7554`, `a36bd3bb`, `200068da`); the halt consumed a *confirmation* round, not a disputed one. Narrowing routed upstream via §6.1 erratum 9 into FSPEC §7.3. Converged at TSPEC v0.11, round 14. | 5 rounds to halt; 14 total |
| D (FSPEC erratum delta) | software-engineer + test-engineer | Errata 3 and 5 landed **downstream only**: FSPEC was corrected while REQ C-5 / AC-1.2 rationale / §A-1 and `docs/_constraints/pdlc-retirement-baseline.md` (M-11h, M-11n) still asserted the opposite. Halt on the *first* confirmation round at FSPEC v0.8 — no oscillation. | `POSTMORTEM-D` `RESOLVED: yes`. Upstream errata raised first: `76591d1e` (REQ v0.13, erratum 5) and `134fec23` (REQ v0.14, erratum 3); the capability question under erratum 3 was routed to REQ O-8 and deferred to successor `pdlc-consolidation-rehost` (`0a5e6a15`, `a5cb6322`, QUEUE row 24, `ready: false`). FSPEC v0.9 (`c14048ed`) closed SE F-01–F-06 / TE F-01–F-07 in one pass. | 1 round to halt |
| DOD | dod-verify | AC-1.2's required-empty sweep was **not empty** at HEAD (~30 tracked hits) and PROP-SWEEP-2 / PROP-SWEEP-3 had no implementation at all despite PLAN T29 claiming to carry them. | Two remediation rounds. `f530a359` applied M-11o's fragment-assembly discipline across ~28 files and shipped the 4-test PROP-SWEEP oracle (mutation-verified); `86d65b0d` + `b6517503` closed the two documentation-only follow-ups. `CODE_REVIEW-v3` `DOD_STATUS: passed`, 27/27 criteria traced, 0 gaps. | 3 DoD rounds |
| R/F/T (engine run, rounds 11–14) | n/a — infrastructure | Engine run stalled: Opus-model reviewer dispatches died against API 529 overload. Reviews had to be re-dispatched under a Sonnet fallback and the queue row flipped to `pending` for lossless resume. | Model availability treated as a per-seat, per-round dispatch property; rounds resumed without artifact loss. Recorded here as a first-class non-convergence cause, not a flake. | 4 rounds affected |

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **Downstream-only erratum landings.** An erratum that corrects FSPEC while REQ and `docs/_constraints/` still assert the reverse converts one-document agreement into three-document disagreement. Nothing in the erratum protocol asks "which other documents assert the sentence I am reversing?" Both Phase-D Highs were this shape. | skill update (`se-author` / `pm-author` erratum protocol: mandatory reverse-grep over REQ, FSPEC, TSPEC and `docs/_constraints/` before an erratum is declared folded in) |
| **Retired mechanisms outlive the mechanism in operator-facing prose.** Phase CR found four High documentation findings (`pdlc/OPERATIONS.md`, `pdlc/README.md`, `pdlc/RELEASE-CHECKLIST.md`, `CLAUDE.md`) after a sweep that had explicit AC-2.x oracles — because the oracles asserted only over the *enumerated* files. REQ R-7 predicted exactly this class and it still landed. Doc-fidelity oracles must range over a glob, not a list. | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **Pre-flight import-graph analysis is missing from PLAN authoring.** Four PLAN tasks were pre-existing-IMPORT reds: link-time failures from held-class `describe.skip`s and exists-at-HEAD assumptions. A reverse-dependency / import-graph pre-flight before wave planning would have caught all four before the wave ran. | skill update (`se-author` PLAN authoring: import-graph pre-flight step) |
| **`.gitignore` trailing-slash patterns do not match symlinks.** `node_modules/` ignores the directory but not a *symlinked* `node_modules`, so worktrees with symlinked deps red every `git status --porcelain`-clean assertion (DoD v1/v2 AT-4.1, AT-22). Any host-tree-sensitive oracle must be measured in a tracked-files-only detached checkout. | docs/_constraints/DOMAIN-CONSTRAINTS.md (extends the existing `coveredViolations` untracked-file hazard note in CLAUDE.md) |
| **Verdict-trailer grammar drift breaks the machine.** A reviewer emitted `VERDICT: Approved minor changes` (missing "with"); `parseVerdict` rejected it and the orchestrator had to normalize the round by hand. The grammar is echoed in prose but not validated at emission. | skill update (echo the exact verdict grammar in the reviewer dispatch prompt **and** validate/normalize mechanically at parse) |
| **Non-approving confirmations with no parseable `FINDING:` line.** TE's Phase-D confirmation carried seven findings in a table and zero `FINDING:` lines; the dispatcher could only fail closed with a synthetic High. Confirmation-round output has no mechanical contract, unlike the revision trailer. | skill update (confirmation lint: reject an unparseable confirmation at emission time, not at dispatch time) |
| **A green PLAN row is not evidence its named deliverable shipped.** T29 was marked ✅ and traced PROP-SWEEP-2/3; the oracle was never written. The absence was found by DoD, not by the wave gate, because the gate checks task status and not the property-traceability side. | skill update (`tech-lead` wave gate: a task whose deliverable is a named property must be gated on that property having an executing assertion) |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Drop TT-1b's root-conditional arm and leave row 4b's runtime-failure exit status uncovered (TE Q-01 fallback, Phase T) | Coordinator / FSPEC owner | The upstream narrowing (§6.1 erratum 9 → FSPEC §7.3, "no skipped pending test absent the skip sink's inventory") was accepted instead, preserving coverage. Dropping the arm would have bought a round at the cost of a permanently uncovered exit status. | Yes — prefer routing a narrowing upstream over deleting the assertion that made it necessary |
| Treat the RETROACTIVE-SUBSTITUTE baseline (`6049c0bf`) as discharging REQ BL-08 | dod-verify / POSTSWEEP-RUN §1 | BL-08 required a pre-sweep engine-path run report **and** a green gate-command transcript committed *before the first deletion commit* (`2c706a54`). Neither was ever committed; the ordering obligation "cannot be un-violated". The substitute anchor salvages only the substantive AC-5.1/AC-5.2 field-set comparison, and is explicitly **not** a discharge. | Yes — a retroactive artifact can salvage a comparison but never an ordering gate |
| Remove the four-member `EXEMPTIONS` literal from `document-oracles.mjs` as retired machinery (DoD v1 finding 5) | dod-verify v2 | Kept: completed-feature `pdlc-workflow-distribution` FSPEC §7.5 pins `EXEMPTIONS` as a frozen four-member literal, and its remaining decisive role is un-shadowing the DOD-04 fixture witness. Deleting it would have silently falsified a sibling feature's spec. | Yes — check sibling-feature specs before deleting a "dead" constant |
| Fix the two residual wording slips flagged in `CODE_REVIEW-v3` §4.1: FSPEC L-5's "deletes **22**" (correct: 21) and `documentOracles.test.js:312`'s "19 M-8 modules" comment (correct scope: T15's batch) | dod-verify v3 | Deliberately **not** fixed. Both are wording-only; the operative post-sweep number (99) is correct at every location that is mechanically pinned (`documentOracles.test.js:314`, TSPEC §4.4, FSPEC ASM-2), and L-5's own text already caveats the literal. Changing them post-DoD would re-open a passed verification for zero oracle change. | Yes — record residual wording as a known-accepted delta rather than re-opening a green DoD |
| Rewrite (rather than delete) `consolidate-learnings`' workflow host under erratum 3 | pm-author / REQ v0.15 | The rewrite-vs-delete choice is a **product** decision (does REQ NG-5 accept the loss of an unattended, machinery-backed consolidation pass?), not an engineering one, so FSPEC could not decide it. Routed to REQ O-8 and deferred to successor `pdlc-consolidation-rehost` (QUEUE row 24, `ready: false`, awaiting operator review). | Yes — capability-loss questions belong upstream in REQ, never in an FSPEC erratum |

## 4. Process Learnings

**Engine/model availability is a pipeline failure mode, not a flake.** Rounds 11–14 stalled because Opus-model SE and TE dispatches died against API 529 overload. Recovery required a Sonnet fallback per seat and a queue-row flip to `pending` for lossless resume. Model availability should be treated as a declared, per-seat dispatch property with an automatic fallback tier, so a round degrades rather than halts.

**Self-referential oracles need execution, not prose.** (POSTMORTEM-T root cause.) TSPEC §5.5 specified an oracle whose universal ranged over test helpers the sweep was deleting — four survive only through `package.json` wiring the import graph cannot see. No single authoring pass gets this right. Three of five Phase-T rounds were spent discovering, by inspection, what one grep against a *simulated post-sweep tree* would have shown. The author must run the derivation before writing the assertion down.

**Fixes that open their own successor.** Phase T rounds 3, 4 and 5 all landed inside the same §2.6 / §5.5 / AT-1.3 cluster: round 3 withdrew a bad orphan citation, round 4's replacement was red-by-construction against live config-wired infrastructure, round 5 found the two-channel oracle needed a companion skip clause. One obligation, three rounds. When two consecutive rounds land in the same neighbourhood, the obligation itself — not the wording — is the defect.

**Arithmetic and set-membership slips are cheap to fix and expensive in round slots.** PM F-03 (v2), PM F-01/F-02 (v3), TE F-09 (v1), TE F-02 (v2) were all enumeration mismatches — "five scripts" quoting three, `check-req-size.sh` missing from a set-equal enumeration. Each consumed a full round. Enumerations in specs want a mechanical set-equality check at authoring time.

**Verdict grammar must be validated at emission.** A subagent emitted `VERDICT: Approved minor changes` (missing "with"); `parseVerdict` rejected it and the orchestrator normalized the round manually. Same class as the Phase-D confirmation that carried a findings table and no `FINDING:` lines. Every machine-read reviewer output line needs the same mechanical treatment the revision trailer already gets.

**Reviewer under-tagging.** Nearly every Phase-CR and DoD finding was tagged `Local` even where it named a repo-wide mechanism (`CLAUDE.md`, `pdlc/OPERATIONS.md`, `pdlc/RELEASE-CHECKLIST.md`, `.gitignore` semantics, `EXEMPTIONS` shared with a sibling feature). Those have been re-routed to §2 here. The tagging gap is itself the process signal: `Scope:` is being set from *where the edit lands*, not from *what the finding generalizes to*.

**Delta rounds leave asymmetric review inventories.** SE-FSPEC has 13 files for 15 rounds (v2, v6 absent) and TE-REQ has 11 for 15 (v11–v14 absent) because delta rounds were dispatched single-lens. This is correct behaviour, but it means round count cannot be derived from file count — the Approval Record's round numbers come from the filenames, and gaps are expected.

**BL-08's ordering gate was structurally unenforceable.** REQ placed a Phase-0 / pre-implementation obligation (commit a pre-sweep run report and gate transcript before the first deletion commit) with no mechanical guard. The first deletion (`2c706a54`) landed before anyone noticed. A pre-sweep obligation needs a wave-gate hook or a hook script, otherwise it degrades to an in-flight manual row that is discovered only in post-mortem.

**PENDING-OPERATOR criteria need a successor row at the moment they are deferred.** Nine acceptance criteria (AC-3.1 live half, AC-3.2, AC-3.4, AC-3.5, AC-3.6, AC-4.4, AC-5.3, and the two P0s AC-5.1/AC-5.2) were `PENDING-OPERATOR` with no queue successor until DoD v1 flagged the unbound deferral; `f530a359` then added QUEUE row 25 (`pdlc-retirement-operator-verification`, status `blocked`). Deferral and binding should be one action.

**Two orchestrators raced on this feature.** POSTMORTEM-R records a hand-orchestrated session interleaving with the live `@kaneho/pdlc-engine` run at 09:48. Round derivation is content-addressed, so the two composed without conflict — this time. The near-miss is worth a lock, not luck.

**Tooling self-defect in the replay harness.** REPLAY §1: the harness judged `pdlc/workflows` legs with `grep -qE "Test Suites:.*0 failed"`, but Jest omits the `failed` token entirely when zero suites fail, so every green run was classified FAIL. Verdict rule inverted and the saved raw summaries re-judged rather than re-run. A verdict predicate that can never be satisfied by a correct run is the same defect class as an oracle that can never fail.

## 5. Open Items for Consolidation

1. **Erratum reverse-grep check.** Before an erratum is recorded as folded in, grep the reversed claim across REQ, FSPEC, TSPEC and `docs/_constraints/`. If any document still states the old part, the erratum is not done. Named in POSTMORTEM-D recommendation 4.
2. **Confirmation-round `FINDING:` lint.** A non-approving confirmation with no parseable `FINDING:` line should be rejected at emission, not fail-closed at dispatch. Named in POSTMORTEM-D recommendation 4.
3. **Model-availability fallback tier.** Declare a per-seat model fallback so a 529 on the primary model degrades the round instead of halting the engine run.
4. **PLAN import-graph pre-flight.** Add a reverse-dependency / import-graph pre-flight to PLAN authoring so link-time reds from held-class `describe.skip`s and exists-at-HEAD assumptions are found before the wave runs.
5. **Property-deliverable wave gate.** A ✅ PLAN row whose deliverable is a named property must be gated on that property having an executing assertion (T29 / PROP-SWEEP-2/3).
6. **Doc-fidelity oracles over globs, not lists.** AC-2.x-style oracles should range over the operator-facing documentation glob; enumerated file lists reproduce REQ R-7's predicted blind spot.
7. **`.gitignore` trailing-slash vs symlink hazard.** Document that host-tree-clean oracles must be measured in a tracked-files-only detached checkout, and why (`node_modules/` does not ignore a symlinked `node_modules`).
8. **Verdict-grammar normalization at parse.** Echo the exact verdict grammar in the reviewer dispatch prompt and normalize known near-misses mechanically.
9. **Pre-sweep / Phase-0 obligation guard.** REQ-level obligations that must hold *before* the first implementation commit need a mechanical gate (hook or wave pre-flight), not an in-flight manual row (BL-08).
10. **Deferral-and-binding as one action.** Emitting a `PENDING-OPERATOR` criterion should require naming its successor queue row in the same edit.
11. **Orchestrator mutual exclusion.** A lock or lease so a hand-orchestrated session and an engine run cannot both drive one feature branch.
12. **Reviewer `Scope:` tagging guidance.** Tag from what the finding generalizes to, not from where the edit lands.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round for the final approved round of each document, copied out of the `CROSS-REVIEW-*` files verbatim before deletion.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 15 | software-engineer | Approved with minor changes | sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c | 1feb20cf74fb6339f7ff4b780a0206ee46e43586 |
| REQ | 15 | test-engineer | Approved | sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c | 1feb20cf74fb6339f7ff4b780a0206ee46e43586 |
| FSPEC | 15 | software-engineer | Approved with minor changes | sha256:dac89dbc272c387a69ae09d5e036722bbf677de493ee6fcdda8fa933fa574142 | 86d65b0d7940230ff024176ca41ccbf95adaa80c |
| FSPEC | 15 | test-engineer | Approved with minor changes | sha256:dac89dbc272c387a69ae09d5e036722bbf677de493ee6fcdda8fa933fa574142 | 86d65b0d7940230ff024176ca41ccbf95adaa80c |
| TSPEC | 14 | product-manager | Approved | sha256:e901faf7718839ec76ff4421397ccdb82b8bbb2e51a980b67bd884dc759f3748 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| TSPEC | 14 | test-engineer | Approved | sha256:e901faf7718839ec76ff4421397ccdb82b8bbb2e51a980b67bd884dc759f3748 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| PLAN | 2 | product-manager | Approved with minor changes | sha256:9d01951a6a41c092eaeb091a2ad78e945b9b9bbfbe9d2078832c6950e14ff969 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| PLAN | 2 | test-engineer | Approved | sha256:9d01951a6a41c092eaeb091a2ad78e945b9b9bbfbe9d2078832c6950e14ff969 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| PROPERTIES | 3 | product-manager | Approved | sha256:1ac369f6cbdb43d74e2a07ec25178f330568c1b854efc0b8bbd1f04385f38725 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| PROPERTIES | 3 | software-engineer | Approved | sha256:1ac369f6cbdb43d74e2a07ec25178f330568c1b854efc0b8bbd1f04385f38725 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| DECISIONS | 8 | product-manager | Approved with minor changes | sha256:a1a6fbf0fd5694a19cabde04c6b32bb5323f96cba4e801b53b606ea708636839 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
| DECISIONS | 8 | test-engineer | Approved | sha256:a1a6fbf0fd5694a19cabde04c6b32bb5323f96cba4e801b53b606ea708636839 | ed0a9aa6ef6acee021895b9e94c478d81325ecb5 |
