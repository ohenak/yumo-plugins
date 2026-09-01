# LEARNINGS — pdlc-decision-ledger

| Field | Detail |
|---|---|
| Feature | pdlc-decision-ledger |
| REQ | docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md |
| Date Completed | 2026-09-01 |
| Total Iterations | REQ: 11, FSPEC: 6, TSPEC: 15, PLAN: 14, PROPERTIES: 7, DECISIONS: 7, CR: 2, IMPL: 12 waves |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..11}.md`; `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1..6}.md`; `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..15}.md`; `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1..7}.md`; `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..14}.md`; `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{1..7}.md`; `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md`; `CROSS-REVIEW-software-engineer-IMPLEMENTATION-wave3-v1.md`; `CODE_REVIEW-pdlc-decision-ledger-v{1..4}.md` — **125 cross-reviews + 4 DoD code reviews, all deleted by this harvest**. Also read and **retained** (not deletable by this skill): `POSTMORTEM-{R,D,PR}-pdlc-decision-ledger.md`, `ADVISORY-pdlc-decision-ledger.md` |
| Phases exercised | R, F, T, D, PR, P, I, CR, DOD, H |
| DoD rounds | 4 (`CODE_REVIEW-…-v1` … `-v4`; v4 the first `DOD_STATUS: passed`) |

## 1. Non-Convergences

Review loops where reviewers struggled to converge, and how it resolved.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| R (REQ) | test-engineer (F-04→F-12→F-16→F-20→F-23), software-engineer (F-01 ×3) | §2 G-1 pinned a **corpus-matching predicate** — a syntactic recognition rule over a live, growing `docs/_decisions/` corpus — at requirements altitude. Every in-place rewrite was correct for the corpus the previous round cited and minted a new true counterexample in the clause just rewritten. Reviewers converged on *severity* (1 High / 1 Medium / 1 Low each, rounds 2, 4, 5) without converging on the clause. | Budget-exhausted halt at round 5 (`POSTMORTEM-R`, `RESOLVED: yes`). Recovery: stop in-place revision, apply the REQ 5g split — measure the membership rule **out** into `docs/_constraints/pdlc-decision-corpus-baseline.md` as pinned `M-*` facts and let REQ state the *outcome*; reconcile AC-01's set-equality onto the relocated measurements. Rounds 6–11 then converged. | 11 (halt at 5) |
| D (TSPEC/DECISIONS) | test-engineer F-01 (High, r1 → r6 → r7); product-manager F-02 (Medium, same defect) | One arithmetic chain — the byte-budget argument stated across §3.6, §4.3 (D-9) and §7.3 (D-10) — stayed blocking in six of seven rounds, and **three of those rounds were re-opened by the previous round's own remedy**. Round 7's High was round 6's suggested wording landed verbatim: `12,059 = 10,859 + 1,200` adds a *budget ceiling* to a *measurement* — arithmetically true, dimensionally false, red on any conforming implementation. | Budget-exhausted halt at round 7, single follow-up round spent (`POSTMORTEM-D`, `RESOLVED: yes`). TSPEC v0.7 restated conjuncts (5)/(6) in pinned-measurement units (`10,859 ≤ 11,300`, margin 441) and swept `12,059` from all four coupled sites; DECISIONS v1.3 added **DEC-DECLEDGER-16**, the byte-literal provenance rule. Rounds 8–15 converged. | TSPEC 15 (halt at 7), DECISIONS 7 |
| PR (PLAN) | product-manager PM-1 (High), test-engineer TE-1 (High) + TE-2 (High, inherited) | **The same erratum-protocol failure twice, five rounds apart**: an author emitted `REVISION-COMPLETE` while leaving a routed item's named locus byte-unchanged (round 4, then again round 9). Round 9 landed 2 of 3 routed items; the survivor was the one requiring *invention* (designing a new cross-arm oracle) rather than verbatim substitution. TE-2 exposed a second shape: the channel routes **loci**, not **claims**, so a claim sited twice (T-10a *and* §Definition of Done) gets routed once. | Budget-exhausted halt at round 9 (`POSTMORTEM-PR` edition 2, `RESOLVED: yes`, resolved by operator 2026-09-01). PLAN v0.9 landed all six routed findings; rounds 10–11 approved with zero findings; the corrected symmetric-difference assertion shipped live in `decisionLedgerMain.test.js` (wave 4). Recommendations 4–6 (routed-locus diff gate, retired-text routing, oracle-falsifiability checklist) remain **open engine-side work**. | 14 (halt at 9) |
| DOD | dod-verify | 4 rounds. v1 found **three unwired integrations at once** on a feature whose suite was fully green: `_log` never threaded into `buildDecisionLedgerInjector`, the production seam passing only `{ feature }` where TSPEC §5.1 declares four fields, and `sink.ruleInputs` declared-but-never-assigned — all three cloned from the `learningsInjection` analogue that *does* wire them (`orchestrate-dev.js:15645–15663`). | v2 closed F-1…F-3 (mutation-verified) but the F-1 fix introduced two new uncovered `??` fallback arms; v3 closed those and the TSPEC seam erratum but exposed F-7/F-8 (stale sibling loci in the same disclosure family); v4 (narrow, operator-sanctioned) closed both. `DOD_STATUS: passed`. | 4 |

## 2. Cross-Feature Patterns

Findings (Scope = Cross-Feature) pointing to constraints that apply beyond this feature.

Only **one** finding in 129 reviews carried a literal `Scope: Cross-Feature` tag; the rest below were re-routed under the harvest's under-tagging check (see §4.6) because they name a sibling feature or a repo-wide mechanism.

| Finding | Suggested Promotion Target |
|---|---|
| **Byte-literal provenance.** A byte literal in a spec belongs to exactly one provenance class — *upstream decision*, *measured Baseline v{N} (`M-xx`)*, or *budget ceiling over text not yet written* — and a budget ceiling may enter only where substituting the true (smaller) drafted value **overstates usage / understates margin**; never as a term in an asserted equality. This single rule refutes both the round-6 and round-7 Highs mechanically, at authoring time. Reviewers additionally showed the shipped wording is *positional* ("only on the larger side") where the sound form is *directional*, and needs an explicit scope predicate (*pinned expected values, not prose*). | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — promote **DEC-DECLEDGER-16** in its **directional** form with the pinned-values scope predicate (PM TSPEC v15 Q-02, TE TSPEC v15 F-02) |
| **Erratum channel routes loci, not claims.** A claim stated at two sites gets routed once; the round fixes the routed locus and leaves the twin asserting retired text. Observed as PLAN TE-2, then again in DoD as F-6 → F-7 → F-8 (each round's sweep of the "disclosure family" missed a sibling site). Locus-shaped routing under-scopes systematically, and does so *more* the larger the document. | `docs/_decisions/DECISIONS-erratum-routing.md` — add an optional **retired-text** field to a routed item, greppable whole-document and fail-closed (POSTMORTEM-PR rec. 5) |
| **A routed item that lands nowhere is indistinguishable from one that lands.** Nothing in the delta-confirmation dispatch compares the routed item's named locus against the round's diff. Two observed occurrences five rounds apart **in one feature**; already recorded as a standing candidate in the `erratum-routed-item-unlanded-halt` memory note and *still not built*. | Engine change (`pdlc/workflows`) — routed-locus diff gate, fail closed if any routed locus is byte-unchanged (POSTMORTEM-PR rec. 4). Escalate out of "standing candidate" state |
| **A paired absence conjunct can be an identity.** The repo's oracle checklist requires pairing an absence-shaped assertion with a positive conjunct, but does not require the added conjunct to be *falsifiable on the arm it runs on*. `report`'s key set `set-equal` the flag-off key set is `X == X` on a flag-off run: the rule is obeyed and the oracle has zero power. The distinguishing conjunct must be a **cross-arm** comparison against a paired opposite run. | `pdlc/OPERATIONS.md` + the reviewing SKILLs — oracle-falsifiability checklist entry, with T-10a conjunct 3 as the worked example (POSTMORTEM-PR rec. 6) |
| **Cloning a wired analogue silently drops its wiring.** The decision-ledger composition root was modelled on `learningsInjection`; the model threads `_log` and populates `ruleInputs`, the clone did neither, and 5,258 green tests could not tell. Three separate DoD findings, one shape. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — when a new seam is modelled on an existing one, its **observability and disclosure fields are part of the contract copied**, not decoration; DoD criterion "unwired integration" should be checked *against the analogue* |
| **`learningsInjection` was mis-cited on the timing axis.** FSPEC BR-9 promised "once per review dispatch"; the shipped precedent computes the block **once per episode**, outside the dispatch loop, reused across the round's two dispatches. The engineer implementing the promised text would have violated BR-9. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — when citing a shipped mechanism as precedent, cite it on the axis being borrowed (timing / site / gating), verified at file and line |
| **Standing shipped contracts cannot be silently re-keyed.** REQ-DECLEDGER-06's finding-identity triple collides with `DEC-LOOPECON-06`'s shipped identity (`orchestrate-dev.js:6746-6780`, consumed by the open-finding ledger at `:9625-9668`). Two identities for "the same finding" now ship, and the REQ acknowledged neither. | `docs/_decisions/DECISIONS-review-severity-bars.md` (or a new decision) — one identity key per consumer, named |
| **Baseline-style pinned constraint files need a citation-anchor sweep on every version bump.** `docs/_constraints/pdlc-decision-corpus-baseline.md` moved v1.0 → v1.2 mid-feature; its `Cited by` row went stale and dependent REQ/FSPEC/TSPEC pins disagreed about which version the arithmetic came from. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a version bump to a pinned measurement file obliges re-derivation of every citing claim, not just the `Version` line |

## 3. Rejected Proposals (with rationale)

Things considered and explicitly not done, where the reason matters for future work.

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Assert `10,859 ≤ 12,059` (measurement + ceiling) as the shipped-default conjunct | POSTMORTEM-D rec. 1; DEC-DECLEDGER-16 | Sound-looking but re-imports an unwritten constant into an equality; the assertion has no falsifying power and reds a conforming implementation drafted under budget. Use `measured ≤ default − ceiling` instead. | **Yes** — the general rule is DEC-DECLEDGER-16 |
| Rely on omission order being inert ("`maxBytes` binds first in every case") | DEC-DECLEDGER-03, after two reviewers falsified it | It was false under the `8000` default and became *accidentally* true under `12500` for a different reason. A justification that survives only by arithmetic coincidence is not a justification; specify the order and keep it falsifiable even while inert. | **Yes** |
| Edit reviewer `SKILL.md` files to carry the decision-ledger rule text | DECISIONS (§ rejected alternatives) | Decisive and mechanical: `SKILL.md` text cannot be varied per dispatch, so it cannot carry a per-round rendered index. Ships as prompt-side injection instead. | **Yes** — the same argument bounds any per-dispatch content proposal |
| Mint a new decision-record file type, or enforce global id uniqueness across namespaces | REQ G-1; DECISIONS | The feature must read the corpus that exists, not reshape it; global uniqueness fixes nothing the per-file dedupe key does not. | Yes |
| Truncate or abbreviate an index line to fit the byte bound | DECISIONS (BR-12 line) | Whole-line omission keeps every rendered line a faithful, citable record; a truncated line is a new, unverifiable claim. | **Yes** — generalises to any bounded-rendering feature |
| Feature-level record wins over the promoted project-level copy | DECISIONS (`M-5c`) | A promoted decision renders in its promoted form; the promoted copy is the one the pipeline maintains. | Yes |
| Path-ordering / locale-dependent tie-break; cardinality-only oracle | DECISIONS | Depends on an ordering nobody pinned; a cardinality-only oracle passes in the rejected direction. | Yes |
| A new `pdlc/workflows/lib/` module for the feature | DECISIONS | `MODULE_NAMES` and the swept-surface machinery are not available to a new lib module without spec change; land in `orchestrate-dev.js` with a sentinel-bounded block. | Feature-local |
| `config.enabled` truthiness instead of explicit shape parsing | DECISIONS (PROP-DIS-06) | Truthiness cannot distinguish absent-block fail-open from a wrong-typed value, which is exactly what REQ-DECLEDGER-05's notices must tell apart. | **Yes** |
| Exclude framing bytes from the bound (as `renderLearningsBlock` does) | DECISIONS | BR-12 bounds the bytes actually spent in the prompt; excluding framing understates the spend. | Yes |
| Fake-register the T-19 planned-work skips through `itOrSkip` with a real capability key; or vacuously green the block with an existence guard | Wave-3 implementation cross-review F-01 | Fake registration misstates the skip's reason and collides with the C2 capability inventory; the existence guard reproduces a documented vacuous-green failure mode. The block was **relocated** off the swept surface instead. | **Yes** |

## 4. Process Learnings

**1. Do not transcribe a reviewer's suggested numbers into a specification — re-derive them first.**
The TSPEC erratum channel's round-7 High was round 6's suggested remedy landed verbatim: the
round-6 finding proposed its fix in concrete byte literals (`12,059`), the author transcribed them
without re-deriving, and the number turned out to be a budget **ceiling** added to a
**measurement** — arithmetically true, dimensionally false, and red on any conforming
implementation drafted under budget (see `POSTMORTEM-D-pdlc-decision-ledger.md`, Best-Guess Root
Cause, and DEC-DECLEDGER-16). A suggested remedy is evidence about the defect, not a verified fact
about the design. When a finding supplies a concrete literal: re-derive it before it becomes
normative, state the derivation next to it, and have the next confirmation round check the
derivation — the same discipline the TSPEC already applies to claims about existing code ("every
claim cites file and line"), applied to numbers a reviewer supplied.

**2. A learning stored as prose is not a control.**
The single highest-signal item of the whole feature. `POSTMORTEM-PR` edition 1 named the routed-locus
diff gate as the fix for a round-4 halt; it was written down, and additionally recorded in the
`erratum-routed-item-unlanded-halt` memory note as a "standing pipeline-improvement candidate".
Five rounds later the **identical** failure recurred, cost two confirmer dispatches, and forced a
second halt and a second post-mortem edition on the same phase. The pipeline has a document-oracle
harness, a fail-closed wave gate and a finding-grammar hook; the one erratum-protocol defect observed
twice in one feature had no gate at all. **A post-mortem recommendation that names a mechanical check
should either be built or explicitly declined with a reason — "recorded as a candidate" is the state
in which defects recur.**

**3. Erratum-round budget is sized for independent items, not for coupled chains — and not for items
that need invention.**
Two independent instances. In Phase D the follow-up budget of 1 round could not absorb a single
re-derivation that had to move three coupled sites plus two decision records; rounds 5, 6 and 7 were
one re-derivation performed in three instalments, and each instalment minted the next round's finding.
In Phase PR, round 9 landed the two routed items that were **verbatim substitutions** (fifteen → fourteen,
production → test-file) and dropped the one that required *designing a new oracle*. Two features, one
shape: when a round's remaining capacity is spent, the item that dies is the one needing thought.
The `nonlocal` class label predicted this both times and **nothing consumes the label**.

**4. An upstream erratum re-opens the *arithmetic*, not just the paragraph.**
REQ's own erratum moved `C-5` from `8000` to `12500` after TSPEC v0.4 had two approvals. One upstream
constant invalidated a derivation stated across §3.6, §4.3 and §7.3 plus decision records D-5 and D-9/D-10.
Cascade confirmation correctly reported "stale upstream" but budgeted as if one paragraph had moved.

**5. Coverage and green suites do not detect unwired integrations — the analogue does.**
DoD v1 opened on a fully green branch (166/166 suites, 5,258 passing, `build-runtime --check` in sync,
per-file branch coverage above bar) and still found three unwired integrations plus a delta-coverage
gate failure. All three were visible only by reading the `learningsInjection` composition root the
feature was cloned from. Worse, the **remediation itself** introduced two new uncovered branches
(never-taken `??` fallbacks) that the delta-coverage gate then caught — remediation diffs need the same
gate as the original work.

**6. Per-finding `Scope:` tagging was effectively not practised on this feature.**
Across 129 harvested reviews there were **19** document-level `**Scope:** Local` headers, a handful of
inline `(Scope: …)` annotations and exactly **one** `Cross-Feature` tag — on a finding
(`CROSS-REVIEW-product-manager-TSPEC-v5.md` F-04) that the reviewer explicitly reasoned about as
cross-feature. Everything in §2 above had to be re-routed by inference. Reviewers are using `Scope:`
as the *document* field the `check-scope-field` hook asks for, and treating the *per-finding* scope tag
the harvest depends on as satisfied by it. The two are different fields with the same name.
**Recommendation:** either rename the per-finding tag, or have the review SKILLs emit it inside the
`FINDING:` grammar the engine already parses fail-closed.

**7. `test.skip` is invisible to the skip sink, and the swept surface is where that becomes a halt.**
Wave 3's gate went red on `consumerCleanup.test.js`'s orphan-freedom oracle: PLAN T-12a placed five bare
`test.skip("T-19: …")` conjuncts inside `documentOracles.test.js`, which is a `SWEPT_SURFACE_MODULES`
member. Only `describeOrSkip`/`itOrSkip` register into the sink, and `T-19` is not a capability key, so
the skips were structurally un-registrable — the oracle was right. Fixed by **relocating** the block to a
non-swept module already inside T-19's manifest (`decisionLedgerConfig.test.js`, landed in `a4f36a6fb`).
The gap is upstream: PLAN T-12a said "mirrors the advisory-tier disclosure family above" without ever
enumerating TSPEC §5.5's constraint that a committed `test.skip` in a swept module must be sink-registered.
**Blast-radius enumeration is part of a task's placement instruction, not an implementer's problem.**

**8. A task-defined `git add` pathspec set is a repeatable halt.**
Two wave gates failed on the same defect: T-11's ownership cell (wave 4) and T-18's (wave 10) each name
three files, and the gate's pathspec derivation could not consume a multi-name cell. Both were recovered
by hand-committing the verified tree and letting the ledger advance (`074e405d9`, `e1e921119` — both
commit messages record the diagnosis, and T-18's records that the defect was **predicted** from T-11's).
Predicting a halt and then hitting it is the same signal as §4.2: the prediction was written, not gated.

**9. The advisory tier fired four times and produced no diagnosis.**
`ADVISORY-pdlc-decision-ledger.md` and `docs/_queue/ESCALATIONS.md` record four escalations (A6 at waves
1, 3 and 9; one A4), all with `Disposition: escalated / budget-exhausted`, `Root cause: unclassified`,
empty **Diagnosis** and `(none)` **Evidence**. Three of the four coincide with real wave halts that were
diagnosed by hand. An advisory record that carries a timestamp, a seam id and nothing else costs an
operator read and returns no signal; the tier should either capture the wave's failing output or
suppress the record.

**10. Full-suite runs are load-flaky, and the flake is in the nested-jest children.**
Phase CR product-lens F-02 measured 1 red in 4 full-suite runs (`decisionLedgerLoop.test.js:404`),
re-running green; the wave-3 diagnosis independently recorded jest's "a worker process has failed to exit
gracefully" after 118.8 s and attributed it to handle leaks in `runSkipJoinChild`'s child spawns
(`consumerCleanup.test.js:392-416`). Noise, not gating — but it is the second feature in a row where a
document oracle or skip-join oracle was red locally for environmental reasons.

**11. Documents that outgrow a single reliable pass drop the part that needs the most thought.**
`POSTMORTEM-PR`'s through-line, and it held: PLAN 67 KB → 83 KB, TSPEC 129 KB → 150 KB, PROPERTIES
96 KB → 110 KB over the phase that was supposed to be tightening them. Every erratum round about
single-siting produced new redundant statements (three PLAN sites that say "stated once elsewhere"
*while restating the arithmetic in the same sentence*; a header that opens its changelog twice).
The discipline gets applied to the payload and not to the prose asserting the payload.

## 5. Open Items for Consolidation

The handed open-promotion list is empty — `docs/_decisions/.consolidation-log.md` records no open
promotion with a `failure-mode-id`, and this feature's FSPEC has no §8.3/§8.4 list. Each item below was
checked against that empty list and matched nothing, so **no item carries a `failure-mode-id:` line**.

1. **Promote DEC-DECLEDGER-16 (byte-literal provenance) to `docs/_constraints/DOMAIN-CONSTRAINTS.md`,
   restated directionally** — "a budget ceiling may enter an assertion only where substituting the true,
   smaller drafted value overstates usage and understates margin; never as a term in an asserted equality" —
   with an explicit scope predicate limiting it to **pinned expected values, not prose**. The shipped
   positional wording over-rejects the sound `measured + ceiling ≤ bound` form. Named by DECISIONS itself,
   by POSTMORTEM-D rec. 6, and left `DEFERRED` in TSPEC v14/v15 and DECISIONS v6/v7 cross-reviews.
2. **Build the routed-locus diff gate** (POSTMORTEM-PR rec. 4). Engine change. Two observed occurrences,
   five rounds apart, in one feature; already a "standing candidate" in the
   `erratum-routed-item-unlanded-halt` memory note. The routed list already carries loci, so the input exists.
3. **Give a routed item an optional retired-text field** (POSTMORTEM-PR rec. 5) so the gate can grep the
   whole document and fail closed when a retired claim survives at an un-routed twin. Item 2 alone would not
   have caught PLAN TE-2 or DoD F-7/F-8.
4. **Add the cross-arm clause to the oracle-falsifiability checklist** in `pdlc/OPERATIONS.md` and the
   reviewing SKILLs (POSTMORTEM-PR rec. 6): a positive conjunct paired with an absence-shaped assertion must
   be falsifiable **on the arm it runs on**, which in practice means comparing against a paired opposite run.
   Ship T-10a conjunct 3 as the worked example.
5. **Resolve the per-finding vs document-level `Scope:` collision** (§4.6). Two different fields share a name;
   the harvest's routing depends on the one nobody emits.
6. **Fix the wave gate's handling of a multi-name task ownership cell** (§4.8) — two halts, one defect,
   both recovered by hand.
7. **Decide what the advisory tier records when it has nothing to say** (§4.9) — four `unclassified` /
   empty-evidence escalations on this feature.
8. **Name one identity key per consumer for "the same finding"** — REQ-DECLEDGER-06's triple versus
   `DEC-LOOPECON-06`'s shipped identity. Candidate: `docs/_decisions/DECISIONS-review-severity-bars.md`.
9. **Carried forward as a testing-lens gap, not a defect:** PROP-BND-04's `if (block === "") return true;`
   escape hatch is demonstrably vacuous — mutation M8 (a renderer returning `""`) leaves the property green,
   while `PROPERTIES:270–272` and `TSPEC:1616–1617` state in words that it must fail. The suite as a whole kills
   M8 five times over, so no false green ships; the gap is between the property's *stated* reach and its actual
   reach. One conjunct fixes it. (`CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md` F-01/F-05.)
10. **Adopt a delta-coverage floor scoped to the feature's own introduced lines.** Phase CR Q-02 stood
    unanswered across two rounds: this feature's ~530 new lines are measured only inside `orchestrate-dev.js`'s
    ~15k-line whole under `--per-file --branches 85`. The DoD rounds ended up using
    `check-wave-resume-delta-coverage.mjs` for exactly this, three times — it should be the standing gate, not
    a DoD-round instrument.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied out of the `CROSS-REVIEW-*` files
before they are deleted. Anchors are **copied verbatim**, never recomputed; `unavailable` means the file
carried no such line (all such rounds predate the anchor convention landing on this feature).

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 3 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 5 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 6 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 7 | software-engineer | Approved with minor changes | sha256:c18b7e88715159adbad81fe59bf9ac62f9873be2b6388661c812e2788eadfecc | 6fd60432062721424d2bd65ee9d9586454f67e18 |
| REQ | 7 | test-engineer | Approved with minor changes | sha256:c18b7e88715159adbad81fe59bf9ac62f9873be2b6388661c812e2788eadfecc | 6fd60432062721424d2bd65ee9d9586454f67e18 |
| REQ | 8 | software-engineer | Approved with minor changes | sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba | 273d0ce00383398519133d470b262d17978eae09 |
| REQ | 8 | test-engineer | Approved with minor changes | sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba | 273d0ce00383398519133d470b262d17978eae09 |
| REQ | 9 | software-engineer | Approved with minor changes | sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a | 0fdbe586238a8fbbefd915f99797a9ecd32cd31d |
| REQ | 9 | test-engineer | Approved with minor changes | sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a | 0fdbe586238a8fbbefd915f99797a9ecd32cd31d |
| REQ | 10 | software-engineer | Approved with minor changes | sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c | cd38979467ddeb500a332820c6b3035fed531716 |
| REQ | 10 | test-engineer | Approved with minor changes | sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c | cd38979467ddeb500a332820c6b3035fed531716 |
| REQ | 11 | software-engineer | Approved with minor changes | sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d | 5af3ebe829f40a7996714eb173ee6941dd53ae7f |
| REQ | 11 | test-engineer | Approved with minor changes | sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d | 5af3ebe829f40a7996714eb173ee6941dd53ae7f |
| FSPEC | 2 | software-engineer | Approved with minor changes | sha256:a808825f4eb7c844c00556c4af599a7ad057a968b6ba225de390b49b220b129b | a8175794731ddc9ccfae2dd8d0ae503a3e174d7f |
| FSPEC | 2 | test-engineer | Approved with minor changes | sha256:a808825f4eb7c844c00556c4af599a7ad057a968b6ba225de390b49b220b129b | a8175794731ddc9ccfae2dd8d0ae503a3e174d7f |
| FSPEC | 4 | software-engineer | Approved with minor changes | sha256:b32a6623036ddc6a86ccc3396431b1364aeaf36b70745b0d11025765b0711bb1 | f450e8de4d305ac392dcbf728b2af8831179246e |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:b32a6623036ddc6a86ccc3396431b1364aeaf36b70745b0d11025765b0711bb1 | f450e8de4d305ac392dcbf728b2af8831179246e |
| FSPEC | 5 | software-engineer | Approved with minor changes | sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39 | 4f03479e15a6afa7b479565c81683a24c4a0679e |
| FSPEC | 5 | test-engineer | Approved | sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39 | 4f03479e15a6afa7b479565c81683a24c4a0679e |
| FSPEC | 6 | software-engineer | Approved | sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256 | 75e8bca19766ec8cfeaa2191be69ca2445f34a23 |
| FSPEC | 6 | test-engineer | Approved | sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256 | 75e8bca19766ec8cfeaa2191be69ca2445f34a23 |
| TSPEC | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 4 | product-manager | Approved with minor changes | sha256:751e55c9a31fb7f1313f658317b05a2e5f5ce64767305fc8aacf68164b4710a2 | 8361a481add04ff94b63c30ded0fe5a7b2b461a4 |
| TSPEC | 4 | test-engineer | Approved with minor changes | sha256:751e55c9a31fb7f1313f658317b05a2e5f5ce64767305fc8aacf68164b4710a2 | 8361a481add04ff94b63c30ded0fe5a7b2b461a4 |
| TSPEC | 6 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 7 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 8 | product-manager | Approved with minor changes | sha256:1f1d7752522623b6fff9231fe6ac01cabb1b249039f01d2721b77a7f09bafc77 | 277db8b27135938a00d663aa251c5176f43af727 |
| TSPEC | 8 | test-engineer | Approved with minor changes | sha256:1f1d7752522623b6fff9231fe6ac01cabb1b249039f01d2721b77a7f09bafc77 | 277db8b27135938a00d663aa251c5176f43af727 |
| TSPEC | 9 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 10 | product-manager | Approved with minor changes | sha256:eef45ef32f0dd394e81abcf3aa5215fa54ba8dbbdc69f9d595c08feece0623c8 | 5189b73fb419b3be218aab7b1f833e0b9664f267 |
| TSPEC | 10 | test-engineer | Approved with minor changes | sha256:eef45ef32f0dd394e81abcf3aa5215fa54ba8dbbdc69f9d595c08feece0623c8 | 5189b73fb419b3be218aab7b1f833e0b9664f267 |
| TSPEC | 11 | product-manager | Approved with minor changes | sha256:b1b603a86f1b5a801229bdc9911e9ab26e3dbb9f8f340d2393979084218d31a0 | 452d72c07dac4f20c6ab063ada96297e74d55591 |
| TSPEC | 11 | test-engineer | Approved with minor changes | sha256:b1b603a86f1b5a801229bdc9911e9ab26e3dbb9f8f340d2393979084218d31a0 | 452d72c07dac4f20c6ab063ada96297e74d55591 |
| TSPEC | 12 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 13 | product-manager | Approved with minor changes | sha256:fc57bc56e0b53ba00402555bcf4a71575ddf820796586607137fdd8ad4c27504 | 3a17387d61fdf8fd454094277f982d9d4d277f20 |
| TSPEC | 13 | test-engineer | Approved with minor changes | sha256:fc57bc56e0b53ba00402555bcf4a71575ddf820796586607137fdd8ad4c27504 | 3a17387d61fdf8fd454094277f982d9d4d277f20 |
| TSPEC | 14 | product-manager | Approved with minor changes | sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b | 1c0881daeb296436090656d3a816439271eae78e |
| TSPEC | 14 | test-engineer | Approved with minor changes | sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b | 1c0881daeb296436090656d3a816439271eae78e |
| TSPEC | 15 | product-manager | Approved with minor changes | sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d | 648a05255df3be3806bc279420a84a82f60f9dbe |
| TSPEC | 15 | test-engineer | Approved with minor changes | sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d | 648a05255df3be3806bc279420a84a82f60f9dbe |
| PLAN | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 3 | product-manager | Approved with minor changes | sha256:56f03fa6455ba30db08e99f9e3d167accdacd8dc0a1ea99d56c1fb527959b5d2 | 665eb44a827b16c42f8eff822915608631be3b3a |
| PLAN | 3 | test-engineer | Approved with minor changes | sha256:56f03fa6455ba30db08e99f9e3d167accdacd8dc0a1ea99d56c1fb527959b5d2 | 665eb44a827b16c42f8eff822915608631be3b3a |
| PLAN | 6 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 7 | product-manager | Approved with minor changes | sha256:a8e91304b5a0d3d4f1eaf1428ec4fc0470f0509aa12267919f70e55a2897a100 | 5ffa27135f30cd26a70b58fd736eb6dea866d097 |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:a8e91304b5a0d3d4f1eaf1428ec4fc0470f0509aa12267919f70e55a2897a100 | 5ffa27135f30cd26a70b58fd736eb6dea866d097 |
| PLAN | 10 | product-manager | Approved | sha256:d1af8e47c223f9755b22b364285659b78e9d3e9d2b0fdaa680bc18c27a4765a7 | 64666b25a7e04a2710c437bbaa4a4110ee85d3f1 |
| PLAN | 10 | test-engineer | Approved | sha256:d1af8e47c223f9755b22b364285659b78e9d3e9d2b0fdaa680bc18c27a4765a7 | 64666b25a7e04a2710c437bbaa4a4110ee85d3f1 |
| PLAN | 11 | product-manager | Approved | sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63 | 789812155c2a28fb553cac52227f074f24970bd4 |
| PLAN | 11 | test-engineer | Approved | sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63 | 789812155c2a28fb553cac52227f074f24970bd4 |
| PLAN | 12 | test-engineer | Approved with minor changes | unavailable | unavailable |
| PLAN | 13 | product-manager | Approved | sha256:4d40cfb228cd181571ad9d6247a23f0cc8974542f9c249a0e0f0fd26015fd8e3 | 0869ce263baaba1134e8aaaab63cd1d527bddab4 |
| PLAN | 13 | test-engineer | Approved with minor changes | sha256:4d40cfb228cd181571ad9d6247a23f0cc8974542f9c249a0e0f0fd26015fd8e3 | 0869ce263baaba1134e8aaaab63cd1d527bddab4 |
| PLAN | 14 | product-manager | Approved | sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841 | e366596b8f905bc7bc5da9a6e28cf276ae5ca629 |
| PLAN | 14 | test-engineer | Approved with minor changes | sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841 | e366596b8f905bc7bc5da9a6e28cf276ae5ca629 |
| PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:37911bfab6edaf2c2f2063920e308e982201db3a977b1c3fe2318dcc28ff2d0d | ae0a4a5f0b888443634b9b022ec900dcc31b80b7 |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:37911bfab6edaf2c2f2063920e308e982201db3a977b1c3fe2318dcc28ff2d0d | ae0a4a5f0b888443634b9b022ec900dcc31b80b7 |
| PROPERTIES | 4 | product-manager | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | 9b96b15c9f2551556c243414c924bf4c1ca0cf7a |
| PROPERTIES | 4 | software-engineer | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | 9b96b15c9f2551556c243414c924bf4c1ca0cf7a |
| PROPERTIES | 5 | product-manager | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | b8d37309477ce8d5727c4a1f71680af334ee97ed |
| PROPERTIES | 5 | software-engineer | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | b8d37309477ce8d5727c4a1f71680af334ee97ed |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | 287f7f1c96482c78f9811329d27a9594e06e4fb1 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef | 287f7f1c96482c78f9811329d27a9594e06e4fb1 |
| PROPERTIES | 7 | product-manager | Approved with minor changes | sha256:7ea6961f0fcbcbdb5be73de5881a7f8bfd3aad86eebe5afdf15384c6ee28e1b5 | 8e116a3cd27a5fd046e5c1c4605a36f52119f27d |
| PROPERTIES | 7 | software-engineer | Approved with minor changes | sha256:7ea6961f0fcbcbdb5be73de5881a7f8bfd3aad86eebe5afdf15384c6ee28e1b5 | 8e116a3cd27a5fd046e5c1c4605a36f52119f27d |
| DECISIONS | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 3 | product-manager | Approved with minor changes | sha256:fa39cee9fcab31d7551b39923b3bddd5f33ec028ee89b9ec5c3c42bb7004cd96 | 3c4b499c4382bbe679a72a019d504364542bbd28 |
| DECISIONS | 3 | test-engineer | Approved with minor changes | sha256:fa39cee9fcab31d7551b39923b3bddd5f33ec028ee89b9ec5c3c42bb7004cd96 | 3c4b499c4382bbe679a72a019d504364542bbd28 |
| DECISIONS | 4 | product-manager | Approved with minor changes | sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a | 25a19ff885a58e7ce7d1b55daacfb1d619704db5 |
| DECISIONS | 4 | test-engineer | Approved with minor changes | sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a | 25a19ff885a58e7ce7d1b55daacfb1d619704db5 |
| DECISIONS | 5 | product-manager | Approved with minor changes | sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a | 6b328e16a29bfc9a1d8fa16c01f1e2974d81fc49 |
| DECISIONS | 5 | test-engineer | Approved with minor changes | sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a | 6b328e16a29bfc9a1d8fa16c01f1e2974d81fc49 |
| DECISIONS | 6 | product-manager | Approved with minor changes | sha256:5258096270693873ffc1a24cd4bfa542f540c143c4c16cd0aa5e512375584ca0 | 420edb564f4e0453c216f15d91fd8dd36f83307c |
| DECISIONS | 6 | test-engineer | Approved with minor changes | sha256:5258096270693873ffc1a24cd4bfa542f540c143c4c16cd0aa5e512375584ca0 | 420edb564f4e0453c216f15d91fd8dd36f83307c |
| DECISIONS | 7 | product-manager | Approved with minor changes | sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240 | 8a4f18d06a66c32942554dc282c49332d2a6f480 |
| DECISIONS | 7 | test-engineer | Approved with minor changes | sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240 | 8a4f18d06a66c32942554dc282c49332d2a6f480 |

Two further approving rounds are **excluded** from the table above because their document type
(`REVIEW` — the Phase CR codebase cross-review) is outside the six-value Document Type enum:
`CROSS-REVIEW-product-manager-REVIEW-v2.md` (`Approved with minor changes`) and
`CROSS-REVIEW-test-engineer-REVIEW-v2.md` (`Approved with minor changes`). Neither file carried an
`APPROVAL-HASH:` or `REVIEWED-COMMIT:` line, so both would have contributed `unavailable` / `unavailable`.
`CROSS-REVIEW-software-engineer-IMPLEMENTATION-wave3-v1.md` was non-approving and contributes no row.
