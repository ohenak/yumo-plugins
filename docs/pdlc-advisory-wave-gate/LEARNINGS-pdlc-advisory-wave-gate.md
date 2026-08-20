# LEARNINGS — pdlc-advisory-wave-gate

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| REQ | docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md |
| Date Completed | 2026-08-20 |
| Total Iterations | REQ: 8, FSPEC: 7, TSPEC: 12, DECISIONS: 11, PLAN: 12, PROPERTIES: 6, REVIEW: 2, IMPL: 3 (DoD rounds) |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 116 cross-reviews + 3 DoD code reviews (all deleted in the harvest commit): `CROSS-REVIEW-software-engineer-REQ-v{1..8}`, `CROSS-REVIEW-test-engineer-REQ-v{1..8}`, `CROSS-REVIEW-software-engineer-FSPEC-v{1..7}`, `CROSS-REVIEW-test-engineer-FSPEC-v{1..7}`, `CROSS-REVIEW-product-manager-TSPEC-v{1..12}`, `CROSS-REVIEW-test-engineer-TSPEC-v{1..12}`, `CROSS-REVIEW-product-manager-DECISIONS-v{1..11}`, `CROSS-REVIEW-test-engineer-DECISIONS-v{1..11}`, `CROSS-REVIEW-product-manager-PLAN-v{1..12}`, `CROSS-REVIEW-test-engineer-PLAN-v{1..12}`, `CROSS-REVIEW-product-manager-PROPERTIES-v{1..6}`, `CROSS-REVIEW-software-engineer-PROPERTIES-v{1..6}`, `CROSS-REVIEW-product-manager-REVIEW-v{1..2}`, `CROSS-REVIEW-test-engineer-REVIEW-v{1..2}`, `CODE_REVIEW-pdlc-advisory-wave-gate-v{1..3}`. Also read, and **retained** (post-mortems are not harvested away): `POSTMORTEM-T-pdlc-advisory-wave-gate.md`, `POSTMORTEM-D-pdlc-advisory-wave-gate.md`. |
| Phases exercised | R, F, T, D, P, V, I, REVIEW, DOD, H |
| DoD rounds | 3 (`CODE_REVIEW-…-v1` Findings → `v2` Findings → `v3` Pass) |

## 1. Non-Convergences

Three review loops failed to converge inside their window. Two produced post-mortems; both resolved. The headline: **every one of the three stalled on a document asserting a measurement of a moving working tree, not on a design question.**

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| D (DECISIONS) | product-manager + test-engineer (agreeing) | `REVIEW-CAP` halt (`MAX_REVIEW_ROUNDS = 5`, rounds 4–8). The four decisions `DEC-A6-01…04` were approved on substance by round 5 and stayed byte-identical. Every round 4–8 turned on one sub-section — the `DEC-A6-04` "sizing" bullet block enumerating how many tree sites carry the pre-A6 five-member seam literal and four-member envelope literal. Each round re-measured one of its three columns and left another stale, closing exactly one High and opening exactly one new High **in the same paragraph**. | The block was relocated out of DECISIONS to `SIZING-pdlc-advisory-wave-gate.md`, leaving DECISIONS with a pointer and the re-derivation *recipe* rather than the totals. Round 9 confirmed; rounds 10–11 were upstream-cascade confirmations. `RESOLVED: yes`. | 11 (halt at 8) |
| T (TSPEC → routed PLAN erratum) | product-manager + test-engineer (agreeing) | `ERRATUM-PROTOCOL` halt. TSPEC itself converged at v1.10 / round 11. TSPEC §6 routed a "revert vs. keep-and-re-derive" fork into the already-approved PLAN, opening erratum round 4 (PLAN v1.3 → v1.4). The delta-confirmation round (round 6) returned **Needs revision from both lenses** — but on *collateral*, not on the routed items, which both reviewers judged discharged. The erratum re-grounded on the TSPEC section that routed the item (§1.3/§6) and **not** on the sections that had moved underneath the rest of the document (§4.4, §5.1, and the DEC-DOC-01 citation re-anchoring). | One bounded PLAN revision (v1.5) closing the round-6 list, then a single delta-confirmation round. TSPEC not reopened, erratum not re-litigated. `RESOLVED: yes`; PLAN went on to approve at rounds 10–12. | PLAN 12 (halt at 6); TSPEC 12 |
| T (TSPEC, earlier halt) | product-manager + test-engineer | Prior `REVIEW-CAP` halt at `MAX_REVIEW_ROUNDS 5` on the wave gate's resolution predicate (the `ledgerAnchor` mechanism, refined across rounds 2→5). Full text preserved at `447cd7dc:docs/pdlc-advisory-wave-gate/POSTMORTEM-T-…`. | Round-5 findings addressed in TSPEC v1.5; confirmation round ran; TSPEC converged and approved at v1.10 in round 11. Superseded in the postmortem file by the erratum halt above. | 12 total |

**Shared shape, stated once.** In all three, no reviewer contradicted another reviewer — the two lenses independently raised the *same* defects, differing only on severity and on inherited-vs-delta attribution. The disagreement was always **author versus HEAD**. A loop where both lenses agree and the document still will not converge is not a review-quality problem; it is a signal that the document is carrying a claim it cannot keep true.

## 2. Cross-Feature Patterns

Findings tagged `Cross-Feature` (20 occurrences across the set), plus `Local`-tagged findings re-routed here under the under-tagging check because they name a sibling feature or a repo-wide mechanism.

| Finding | Suggested Promotion Target |
|---|---|
| **A tracked machine-local runtime artifact can be silently re-added after a retirement sweep deleted it.** DoD v1 finding 1: six `.claude/` runtime/state files were tracked at HEAD — the exact consumer-runtime copies `pdlc-plugin-retirement` T22 deleted — re-added by this feature's `e3b9d5a3`. The `/.claude/workflows/` ignore rule had been *dropped* at retirement T22 (`c9be212e`), so nothing stopped the re-add. Remediated by `git rm --cached` + anchored ignore rules + a set-equality oracle. Tagged `Local`; it is repo-wide. | `docs/_constraints/` — a standing rule that a retirement sweep must leave an ignore rule behind, not just a deletion. |
| **`PROP-SWEEP-2(b)`'s sweep gate reds on a feature's own docs, because the oracle walks the entire tree including ignored paths.** DoD v1 finding 5: the retirement sweep returned 23 tracked paths, every one attributable to this feature (18 of its own review docs). Root-caused at source in `c5ce8d56`: AT-22 now filters `coveredViolations(LIVE_ROOT)` through `git check-ignore --no-index`, with a non-vacuity control. This is the same trap the project CLAUDE.md already warns about. | `docs/_constraints/` — any oracle walking `root` must filter through `git check-ignore`; and any doc-set that quotes retired vocabulary needs an A-1 disposition row, not a bare glob. |
| **The shipped default gate command carried a coverage exemption that hid a red suite.** DoD v1 finding 4: `implementation.testCommand` excluded `documentOracles`, so the shipped gate was green while plain `npm test` was red on this feature's own artifacts. A6's own wave gate could never have caught it. Exclusion dropped; `ci-arrangement.test.js` now pins the ignore set by `deepEqual`, mutation-verified. Tagged `Process`; it is a cross-feature configuration hazard. | `docs/_decisions/` — exemptions in a shipped gate command must be narrow, owned, and recorded in `pdlc/OPERATIONS.md`. |
| **A stale disclosure *family*, not a nearest occurrence.** DoD v1 finding 6: four claims in `pdlc/OPERATIONS.md`'s Advisory tier section were falsified by one diff (seam count, seam enumeration, config-key list, per-seam row count). Remediated by deriving the expected runbook text from `ADVISORY_SEAMS` / `ADVISORY_DEFAULTS` / `ENVELOPE_DEFAULTS`, so a seventh seam reds the runbook. | `docs/_constraints/` — human-facing disclosure prose about an enumerable constant should be oracle-derived from that constant, not hand-copied. |
| **Deferrals must bind to a queue row, not to prose.** DoD v1 finding 8: `PROP-REST-03` shipped as the suite's only `test.todo`, its named successor being "an erratum on an upstream doc" — prose, not a `docs/_queue/QUEUE.md` row. Contrast the six `D-AWG-*` deferrals, correctly bound to rows 6 and 20. Fixed by binding OQ-7 to row 6. | `docs/_constraints/` — a deferral is unbound unless it names a QUEUE row id. |
| **Two features can each assume the other bumps a coupled integer literal.** TE PLAN F-03 (`Cross-Feature`): `documentOracles` T15 (99 vs 100) is coupled to another feature's sweep, and neither side owned it. TE Q-01 explicitly warned both sides would assume the other. | `docs/_decisions/` — a shared literal needs a named owning feature at the moment the coupling is created. |
| **A wave-boundary oracle asserting a clean tree cannot pass where a session hook rewrites a tracked file.** `consumerCleanup.test.js` AT-4.1 asserted clean `git status --porcelain` inside the wave gate's scope while a hook rewrote tracked `.pdlc-drift-state.json` — reddening *every* wave boundary, not just wave 1. | `docs/_constraints/` — decide tracked-ness before a plan depends on a clean-tree assertion. |
| **A defaults change hidden inside a compression step.** PM PLAN F-01/F-02 (`Cross-Feature`): the PLAN's A6-06 row, compressing a withdrawn TSPEC claim, would have shipped `advisory.enabled: true` in `.claude/pdlc.config.example.json` — flipping the advisory tier **on by default for every repo copying the example config**, a user-visible behaviour change no requirement asked for. | `docs/_constraints/` — a task row that writes bytes into a shipped example config is a defaults change and needs an explicit requirement citation. |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Revert `e3b9d5a3`'s early-landed A6 test-side seam-cardinality transcription, rather than keep it and re-derive | Phase T erratum round, both lenses concurring | Keep-and-re-derive was chosen on three *measured* reasons: the pre-flight gate was green, the cardinality drift was incapable of masking baseline rot, and the re-derived `Batch` column came out unchanged. Both reviewers independently checked one of the three. The decision was accepted on merit — the erratum round failed on collateral, not on this fork. | Yes — the reusable part is the *shape*: a revert-vs-keep fork should be answered with a re-derivation whose output is shown to be identical, not asserted. |
| Keep the DEC-A6-04 sizing block in DECISIONS and repair its reconciliation clause for a sixth time | product-manager (Q-01), endorsed in POSTMORTEM-D §6 | A reconciliation clause between two counts is a claim about *both*; a stale relation reads as reconciled, which is worse than a stale number that reads as stale. Five consecutive rounds each closed one High and opened one new High in the same paragraph. The seam was removed rather than re-welded — the block moved to `SIZING-…md`, DECISIONS kept the recipe. | Yes, as a rule: **a seam that fails in three or more consecutive rounds should be removed, not re-welded.** |
| Retain `file:line` pins in the PLAN after upstream re-anchored the same sites | product-manager F-03/F-04, test-engineer F-02 | TSPEC v1.10 had already re-anchored the six pins to symbol names, block titles and quoted assertions per `DEC-DOC-01`, precisely so a drifting tree cannot invalidate a citation. The PLAN was the last document still carrying drifted numerals — and carried them in a DoD checklist an implementer ticks. Line pins were replaced with the upstream anchors verbatim. | Yes — when upstream re-anchors citations per DEC-DOC-01, **every** downstream document compressing those sites inherits the sweep. |
| Substitute the existing table-driven `test.each` convention for property-based tests on the five pure A6 helpers | Rejected by the DoD verifier (v1 finding 3); the alternative offered was an explicit project-level decision | Hand-written tables explore no generative input space — `citesGateOutput`'s whitespace-collapse-then-substring contract at the 24-char floor had no falsifier. `fast-check` was added instead (`advisoryHelperProperties.test.js`, 516 lines, real TOTALITY / ROUND-TRIP / IDEMPOTENCE / LAST-WINS / CLOSEDNESS properties). | Yes — this establishes `fast-check` as available in the repo, and sets the precedent that pure parsers/validators get generative properties. |
| Scope the PLAN's HEAD-drift note as "every failure at HEAD is closed by A6-05's green step" | test-engineer F-01 (High) | `npm test` at HEAD showed 28 failures across 9 suites, at least two outside A6-05's reach. Unscoped, the sentence silently annexed every unowned red in the tree and converted the batch-1 inherited-red rule from a checkable precondition into an alarm firing at every wave boundary. Restated as scoped to the advisory suites — true, and TE said so. | Yes — **a claim of the form "every failure at HEAD is closed by task X" must carry its scope in the sentence.** |

## 4. Process Learnings

44 findings carried `Scope: Process`. Four phases exceeded three iterations (REQ 8, FSPEC 7, TSPEC 12, DECISIONS 11, PLAN 12, PROPERTIES 6). The durable signal:

**1. The dispatcher supplied the wrong completeness-gate heading set for seven consecutive rounds — the single highest-confidence process defect in this feature.** Cross-review invocations were checked against the PLAN's own top-level headings (`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) instead of the role-defined cross-review headings (`## Findings` / `## Questions` / `## Positive Observations` / `## Recommendation` / `## Verdict`). PM PLAN F-07 flagged it at round 6 as "third consecutive round" and it recurs verbatim through round 12 ("seventh consecutive round"). POSTMORTEM-T §3 records that it "has now survived three harvests" — meaning prior harvests logged it and it was never promoted. This is a wiring defect in the dispatcher, not an authoring defect, and reviewers correctly refused to absorb it.

**2. A tier-1 approval anchor survived a rebase that reverted the approved bytes.** Recorded as `Process`: "the approval record no longer describes the bytes at HEAD", and separately "a tier-1 approval anchor survived a rebase that reverted the approved bytes". An approval hash is only meaningful if something invalidates it when the document moves. Related and independently observed: **TSPEC's bytes changed under an unchanged `v1.10` version label, and DECISIONS cited that label five times as a grounding anchor** — flagged at v10 and carried unresolved to v11. A version label used as a grounding anchor must be immutable once cited.

**3. Documents that measure a moving working tree cannot converge.** This is the root cause of both halts. DECISIONS carried a repository measurement (the sizing block) — decisions are stable after approval, measurements of a moving HEAD are not. Five rounds of correct-but-superseded integers is the measured cost. Route repository sizing to the artifact that *consumes* it (PLAN), and keep the **recipe** in the durable record, not the **total**.

**4. When a round re-measures one population, it must re-measure every population its edit puts in the same sentence.** PM DECISIONS F-05, at its fourth consecutive recurrence, was explicitly nominated as a promotion candidate. The mechanically checkable form: *before committing an edit to any enumeration — if this sentence names two counts, re-run both.* This replaces vaguer "re-derive" guidance that an author could not check at write time.

**5. A run beats a reading, and the escalation should happen in round 1.** `T-08-8` survived four rounds of careful reading by both lenses and fell to the first `npm test`. Where a claim is a count of test sites, the *authoring* dispatch should run the suite before the first review, not in response to the fourth finding. Four separate `Process` findings record the same shape ("third/fourth consecutive round in which this paragraph shipped a repository claim that grep or a test run falsifies").

**6. Partial re-grounding is more dangerous than none.** The PLAN erratum's v1.4 changelog *announced* re-grounding on TSPEC v1.10 while performing only half of it, which suppressed the reviewer's prior that the rest of the document was stale. An erratum dispatch must diff the upstream changelog across the **whole interval** and enumerate withdrawals and re-anchorings before touching the raised list.

**7. Landing test-side transcriptions ahead of the phase that plans them poisons every downstream count.** `e3b9d5a3` — titled "docs(cross-review): se REQ v7 — High findings" — carried A6 test-side implementation edits plus ~168k lines of `.pdlc-backups`/bundle output. The convenience was local; the cost landed on every artifact that had to describe HEAD until Phase I closed it, and on the retirement sweep gate. **A commit's title must describe its contents**; a docs-titled commit carrying implementation is invisible to every reviewer scanning history.

**8. "Same section, N consecutive rounds, one High each" is a cheaper stall detector than the rounds it saves.** Rounds 4–8 of Phase D each closed one High and opened exactly one new one in the same paragraph — a *converging finding volume with a pinned single High* is the review cap's real trigger signal. POSTMORTEM-D notes this was the second phase in this feature to exhibit it.

**9. Reviewers under-tagged, and the routing gap is itself a finding.** Several repo-wide defects arrived tagged `Local` (DoD findings 1 and 4 most clearly) and were re-routed to §2 here under the under-tagging check. Only 20 findings carried `Cross-Feature` against 44 `Process`, which understates the true cross-feature surface of a change touching a shipped example config, a retirement sweep baseline, and a runbook.

**10. Remediation can regress inside its own remediation window.** DoD v1 finding 7 was fixed by `455644ec` and falsified by the **very next commit** `c5ce8d56`, which was itself the remediation for finding 1. Two fixes in one batch contradicted each other and it took a second DoD round to catch. Where a batch of remediations touches a shared fact, the fact must be re-measured after the **last** commit in the batch, not after each one.

**11. What worked, and should be kept.** DoD v3 raised the evidence bar past prose-matches-tip to **mutation verification** — deleting `.gitignore:41` was shown to red the suite, proving the newly written sentence was falsifiable rather than decorative. The v2+ delta contract (unchanged code verified in v1 is not re-scanned) kept round 3 to a single documentation file. Both are cheap and should be standard.

## 5. Open Items for Consolidation

The handed open-promotion list was empty (no open promotions recorded in `docs/_decisions/.consolidation-log.md`), so **no `failure-mode-id:` line is copied onto any item below**. Each was checked against that empty list and matched nothing.

1. **Cross-review completeness gate checks the wrong heading set.** Seven consecutive rounds in this feature; POSTMORTEM-T records it has survived three prior harvests without promotion. Dispatcher wiring, not authoring. This is the strongest promotion candidate in the set — it is a defect that has now demonstrably outlived the harvest mechanism intended to surface it. Target: skill/engine fix plus a `docs/_decisions/` entry recording why it recurred across harvests.

2. **Approval anchors must be invalidated when the approved bytes move.** Two independent observations: a tier-1 anchor survived a rebase that reverted the approved bytes, and TSPEC's bytes changed under an unchanged `v1.10` label that DECISIONS cited five times as a grounding anchor. Target: `docs/_constraints/` — a version label, once cited as a grounding anchor, is immutable; a rebase touching an approved document invalidates its anchor.

3. **Two-count rule (`if this sentence names two counts, re-run both`).** Nominated as a promotion candidate in POSTMORTEM-D at its fourth consecutive recurrence. Mechanically checkable at write time. Target: authoring-skill checklist (`se-author`, `pm-author`).

4. **Stall detector: same section, N consecutive rounds, one High each.** Second phase in this feature to exhibit it; both times it ended in a review-cap halt. Target: engine — surface it to the orchestrator before the cap expires.

5. **DECISIONS must not carry a measurement of the working tree.** Decisions are stable after approval; measurements are not, and a review loop cannot converge on one. Keep the re-derivation recipe, route the totals to the consuming artifact. Target: `docs/_constraints/` plus the `se-author` DECISIONS guidance.

6. **A retirement sweep must leave an ignore rule behind, not just a deletion.** The `/.claude/workflows/` rule was dropped at retirement T22, so six machine-local artifacts were re-added by an unrelated commit and reached HEAD tracked. Target: `docs/_constraints/`.

7. **Tree-walking oracles must filter through `git check-ignore`.** `coveredViolations` walks everything under `root` except `.git/` and `node_modules/`; the project CLAUDE.md already warns about this and it still cost a High. The AT-22 fix (with its non-vacuity control) is the pattern to codify. Target: `docs/_constraints/` + `te-author` guidance.

8. **A deferral is unbound unless it names a QUEUE row id.** Prose naming "an erratum on an upstream doc" as successor is not a binding. Target: `docs/_constraints/`.

9. **Human-facing disclosure prose about an enumerable constant should be oracle-derived from that constant.** The `pdlc/OPERATIONS.md` fix derives expected text from `ADVISORY_SEAMS` / `ADVISORY_DEFAULTS` / `ENVELOPE_DEFAULTS` so a seventh seam reds the runbook. Target: `docs/_constraints/`.

10. **Commit titles must describe contents.** `e3b9d5a3` was titled as a cross-review docs commit and carried A6 implementation plus ~168k lines of generated output. Target: `docs/_constraints/` or a pre-commit guard.

11. **Reviewer scope under-tagging.** 20 `Cross-Feature` against 44 `Process`, with several plainly repo-wide findings arriving tagged `Local` and re-routed by this harvest. Target: sharpen the `Scope` rubric in the three review skills. *(Recorded here per the under-tagging check, so consolidation sees the routing gap.)*

12. **A batch of remediations touching a shared fact must be re-measured after the last commit in the batch.** DoD v1 finding 7's fix was falsified by the very next commit, which was finding 1's fix. Target: `dod-verify` / `se-implement` guidance.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round. Every `Approval Hash` and `Reviewed Commit` cell below was **copied verbatim** out of the `CROSS-REVIEW-*` file's `APPROVAL-HASH:` / `REVIEWED-COMMIT:` header line before that file was deleted. Nothing was recomputed at harvest time. Where a file carried no such header line, the cell reads `unavailable` — 22 of the 65 approving rounds predate the anchor convention or were emitted without it, which is itself part of the §4 process signal about anchor discipline.

Two approving rounds are **not** in the table: `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v2.md` (round 2, both `Approved with minor changes`, both anchors `unavailable`). `REVIEW` — the Phase REVIEW codebase-review lens — is outside the six-member document-type enumeration this section admits, so it is recorded here in prose rather than given a row with an out-of-vocabulary type.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:32ba7d949d59041db6d67de80c06c10d270c3e545c11473debe5694cfe851f6c | 6565080a9efbd4a524d6d5bf1296b0b6ed6712c5 |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:32ba7d949d59041db6d67de80c06c10d270c3e545c11473debe5694cfe851f6c | 6565080a9efbd4a524d6d5bf1296b0b6ed6712c5 |
| REQ | 6 | software-engineer | Approved with minor changes | sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645 | 2e2622980cf33ec2211e327ebf67846525096a76 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645 | 2e2622980cf33ec2211e327ebf67846525096a76 |
| REQ | 8 | software-engineer | Approved with minor changes | sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8 | e619b6d60118487b7c3d1cc6c3d2db79856b3ef7 |
| REQ | 8 | test-engineer | Approved with minor changes | sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8 | e619b6d60118487b7c3d1cc6c3d2db79856b3ef7 |
| FSPEC | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 3 | software-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 4 | software-engineer | Approved | sha256:cacf86e86918b989b0699268723e21c2ccd88841be6505c9e031a3dbfff188f3 | 7b8b314c4a02c7558678aeaca28479b04d92b538 |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:cacf86e86918b989b0699268723e21c2ccd88841be6505c9e031a3dbfff188f3 | 7b8b314c4a02c7558678aeaca28479b04d92b538 |
| FSPEC | 6 | software-engineer | Approved with minor changes | sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e | c3ae2087d33ba08cb767b70b0ae61c981e5b18ed |
| FSPEC | 6 | test-engineer | Approved with minor changes | sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e | c3ae2087d33ba08cb767b70b0ae61c981e5b18ed |
| FSPEC | 7 | software-engineer | Approved with minor changes | sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e | 98cc007d5a78ded66ea29278323bc5be515276fb |
| FSPEC | 7 | test-engineer | Approved with minor changes | sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e | 98cc007d5a78ded66ea29278323bc5be515276fb |
| TSPEC | 5 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 6 | product-manager | Approved with minor changes | sha256:93385165ef7c7ad8ce2c87d990c48007fa80090dcd8980cb980513692611b4f2 | 85463b70f1d19954b78fdfc9184c09fe69d1c56f |
| TSPEC | 6 | test-engineer | Approved with minor changes | sha256:93385165ef7c7ad8ce2c87d990c48007fa80090dcd8980cb980513692611b4f2 | 85463b70f1d19954b78fdfc9184c09fe69d1c56f |
| TSPEC | 7 | product-manager | Approved with minor changes | sha256:0610e311f5e0b206c7781e3d75e00fa70799ad013c6b219d7cac87afab0e9bba | f6a45cc52e9aa727c6d757a2ccd3c8635971e8e2 |
| TSPEC | 7 | test-engineer | Approved with minor changes | sha256:0610e311f5e0b206c7781e3d75e00fa70799ad013c6b219d7cac87afab0e9bba | f6a45cc52e9aa727c6d757a2ccd3c8635971e8e2 |
| TSPEC | 8 | product-manager | Approved with minor changes | sha256:c0ee14a4e69efd994c5d1d4d0c1d0b32c9f0e31e948a6f37127a209b1e20585a | 61a9605d89fd093e227a23d106bf9d0e0f1705cd |
| TSPEC | 8 | test-engineer | Approved with minor changes | sha256:c0ee14a4e69efd994c5d1d4d0c1d0b32c9f0e31e948a6f37127a209b1e20585a | 61a9605d89fd093e227a23d106bf9d0e0f1705cd |
| TSPEC | 9 | product-manager | Approved with minor changes | sha256:79777fa6310e87180c6901e9d1b87ddcb9f926147fefb9f07c52720d0c5ff8d6 | a349767b569c1a1d50052f3484cf6ecf1fe1f449 |
| TSPEC | 9 | test-engineer | Approved with minor changes | sha256:79777fa6310e87180c6901e9d1b87ddcb9f926147fefb9f07c52720d0c5ff8d6 | a349767b569c1a1d50052f3484cf6ecf1fe1f449 |
| TSPEC | 11 | product-manager | Approved with minor changes | sha256:4a092e85e8f3b58740dd02b09831a056a0dc7d28b1b13786f5ba8a664994ced3 | c61f42942ca4b5fb29a15d1c41edad902dade03a |
| TSPEC | 11 | test-engineer | Approved | sha256:4a092e85e8f3b58740dd02b09831a056a0dc7d28b1b13786f5ba8a664994ced3 | c61f42942ca4b5fb29a15d1c41edad902dade03a |
| TSPEC | 12 | product-manager | Approved with minor changes | sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004 | 1f2a4fbfcd8588f0b7a5bc25265c02b8d3aa8ea1 |
| TSPEC | 12 | test-engineer | Approved with minor changes | sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004 | 1f2a4fbfcd8588f0b7a5bc25265c02b8d3aa8ea1 |
| PLAN | 3 | product-manager | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | c8981e48bfe6e2fa400a33718dbcd9cc1e86bd0a |
| PLAN | 3 | test-engineer | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | c8981e48bfe6e2fa400a33718dbcd9cc1e86bd0a |
| PLAN | 4 | product-manager | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | 350980b213efb61c87a4fdecd95db751ece31e52 |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | 350980b213efb61c87a4fdecd95db751ece31e52 |
| PLAN | 5 | product-manager | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | 4ecf9c72890e4568ae33338a414b694616ad7de8 |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f | 4ecf9c72890e4568ae33338a414b694616ad7de8 |
| PLAN | 8 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 9 | test-engineer | Approved with minor changes | unavailable | unavailable |
| PLAN | 10 | product-manager | Approved with minor changes | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | b902f40b964b52e437d76ba1c43d319530fe5fe2 |
| PLAN | 10 | test-engineer | Approved | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | b902f40b964b52e437d76ba1c43d319530fe5fe2 |
| PLAN | 11 | product-manager | Approved with minor changes | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | df90d1f850c943009ef11f118a751b8d9cc6310c |
| PLAN | 11 | test-engineer | Approved with minor changes | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | df90d1f850c943009ef11f118a751b8d9cc6310c |
| PLAN | 12 | product-manager | Approved with minor changes | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | 570fbe11cd8261478dd62735d3f99c0da2f450e2 |
| PLAN | 12 | test-engineer | Approved with minor changes | sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48 | 570fbe11cd8261478dd62735d3f99c0da2f450e2 |
| PROPERTIES | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d | 7f8dcda6aa0898030c78ea68dadf87cec17c054f |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d | 7f8dcda6aa0898030c78ea68dadf87cec17c054f |
| PROPERTIES | 3 | product-manager | Approved with minor changes | sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d | 87d4c23367e29e4ecc28f5df4fc9317f74a69b06 |
| PROPERTIES | 3 | software-engineer | Approved with minor changes | sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d | 87d4c23367e29e4ecc28f5df4fc9317f74a69b06 |
| PROPERTIES | 5 | product-manager | Approved with minor changes | sha256:8a9fe1d7050e405cb095c52211bb0d189c17059da4493c220fb99d78d5f04258 | 0c0475a7fa7c9beef6fadb0a5a0b3e4e588611a2 |
| PROPERTIES | 5 | software-engineer | Approved with minor changes | sha256:8a9fe1d7050e405cb095c52211bb0d189c17059da4493c220fb99d78d5f04258 | 0c0475a7fa7c9beef6fadb0a5a0b3e4e588611a2 |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:8a9fe1d7050e405cb095c52211bb0d189c17059da4493c220fb99d78d5f04258 | 99f136a5218bdf97a220677265aa7ee07ef6a4b9 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:8a9fe1d7050e405cb095c52211bb0d189c17059da4493c220fb99d78d5f04258 | 99f136a5218bdf97a220677265aa7ee07ef6a4b9 |
| DECISIONS | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3 | d40e14e2c45b6b74657c790295584fee9a9b7089 |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3 | d40e14e2c45b6b74657c790295584fee9a9b7089 |
| DECISIONS | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 4 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 5 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 6 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 8 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 9 | product-manager | Approved with minor changes | sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d | 9a1934db2f55f77300dc64709b90fd803c5540f9 |
| DECISIONS | 9 | test-engineer | Approved with minor changes | sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d | 9a1934db2f55f77300dc64709b90fd803c5540f9 |
| DECISIONS | 10 | product-manager | Approved with minor changes | sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d | 153babdbee9b71c76fef393cded225a5720bc2b8 |
| DECISIONS | 10 | test-engineer | Approved | sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d | 153babdbee9b71c76fef393cded225a5720bc2b8 |
| DECISIONS | 11 | product-manager | Approved with minor changes | sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc | 8a44b84b485e0b722430d42fcd4e85cd22766892 |
| DECISIONS | 11 | test-engineer | Approved | sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc | 8a44b84b485e0b722430d42fcd4e85cd22766892 |
