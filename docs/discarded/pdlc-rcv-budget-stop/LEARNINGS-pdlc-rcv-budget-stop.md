# LEARNINGS — pdlc-rcv-budget-stop

| Field | Detail |
|---|---|
| Feature | pdlc-rcv-budget-stop |
| REQ | docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md |
| Date Completed | 2026-08-02 — **feature abandoned at TSPEC stage by operator decision**, not shipped |
| Total Iterations | REQ: 5 (pre-split, non-convergent, POSTMORTEM) + 4 (post-split, approved), FSPEC: 4 (approved), TSPEC: 1 full round + v1.1 revision + round 2 interrupted, PLAN: 0, PROPERTIES: 0, IMPL: 0 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL (pipeline stopped after DECISIONS/TSPEC v1.1) |
| Harvested from | CROSS-REVIEW-software-engineer-REQ-v{1..4}.md, CROSS-REVIEW-test-engineer-REQ-v{1..4}.md, CROSS-REVIEW-software-engineer-FSPEC-v{2..4}.md, CROSS-REVIEW-test-engineer-FSPEC-v{1..4}.md, CROSS-REVIEW-software-engineer-TSPEC-v1.md, CROSS-REVIEW-test-engineer-TSPEC-v1.md, CROSS-REVIEW-software-engineer-TSPEC-v2.md (incomplete, no verdict — round interrupted), POSTMORTEM-R-pdlc-rcv-budget-stop.md (resolved), all now deleted |
| DoD rounds | 0 (Phase DOD never reached) |

**Context for the reader.** This feature — reduce the review budget 5→3, make it absolute per
document via a `## Reset Region` in the post-mortem, add an operator clearance gate — was abandoned
mid-pipeline on 2026-08-02. The surviving design artifacts (REQ v3.1 approved, FSPEC v1.3 approved,
TSPEC v1.1, DECISIONS) move to the abandoned folder with this file. The *intent* (bounded review
rounds, deterministic stop) is expected to be absorbed by the planned `orchestrate-dev` closed-loop
rewrite (`pdlc-engineering-loop` / `pdlc-merge-phase` / `pdlc-advisory-tier`). This LEARNINGS is
the distillation of ~19 review artifacts; the highest-signal content is §4.

## 1. Non-Convergences

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| R (pre-split) | SE + TE | Two generator classes produced every blocking finding from round 2 on: (A) what a failed answering-line write leaves on disk and who repairs it; (B) which shipped string is emitted with which value under which guard. Each fix created the next round's findings inside its own new text ("the answer to a finding is new text, and new text is unreviewed text"). Blocking counts 3→5→6 — a fixed point the not-yet-built stopping rule would have caught at round 3. | POSTMORTEM + operator-directed remediation, not a sixth round: shipped halt-catch behaviour **measured** into baseline §2.8 as `M-8a..M-8j`; render/repair material moved to catalogue §4; REQ **split by altitude** (window/budget stayed as v2.0; ordered algorithm, refusal semantics and repairs became `REQ-RCV-07`). Post-split loop then converged 5→2→1→0 (SE) and 4→2→2→0 (TE) in 4 rounds. | 5 (limit) |
| TSPEC | SE + TE | Round 1: both Needs revision, 3 Blocking each — all real design defects (origin never threaded to the halt render; unanalysed `startIndex` consumers incl. `tier1ApprovalRecord`; gate placement contradiction; shipped oracles the change reds claimed untouched; per-conjunct unfalsifiable confirmations; no `reviewRows` carrier). v1.1 addressed all 19 findings and re-baselined ~58 stale line citations. | Round 2 interrupted by operator; feature abandoned before a verdict. The one substantive round-2 finding (see §5) is carried forward here. | 1 + interrupted round 2 |

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **Claims about shipped code converge only when measured, never when asserted.** REQ sections citing measured `M-*` facts drew zero findings after round 1; the sections asserting control-flow facts generated five rounds of findings. The remediation (enumerate every emit + guard in one code-reading pass, record as `M-8*` rows) closed class B permanently. | docs/_constraints/DOMAIN-CONSTRAINTS.md — "shipped-code claims in specs must cite a measured-fact id from a baseline file, produced by a dedicated code-reading pass" |
| **A multi-conjunct write confirmation is only falsifiable if the fault catalogue can fail each conjunct alone** (TE TSPEC F-02, tagged Cross-Feature). `write-noop` alone can never make "line present ∧ H+1 ∧ no marker left" fail on one conjunct; a `lying-write`/content-mangling mode is required. | docs/_decisions/DECISIONS-test-oracle-mechanics.md |
| **An adopted seam contract must carry every parameter its successor's wiring needs.** SE TSPEC round-2 (partial): `_validateRegion` is declared arity-2 `(region, basenames)`, but `resolveClearance`'s signature carries no `basenames` and no `_listFiles` — so row 18 could not wire the conjunct without widening a contract declared closed. | Any resurrection of this design, and `REQ-RCV-07` (docs/pdlc-rcv-reset-region/) |
| **Citation baselines must name the commit whose tree the reviewer actually verifies.** TSPEC v1.0 declared baseline `9486c81` (docs-only, predating 691 changed lines); 9 of 11 spot-checks failed there but resolved at HEAD. The v1.1 fix — every line citation names its enclosing symbol + the verified commit, drift is a mechanical re-baseline not a finding — worked. | docs/_constraints/DOMAIN-CONSTRAINTS.md or se-author SKILL |
| **Shared-catalogue taxonomy needs one noun per level** (SE REQ v4 F-02): *entry class*, *variant* and *source* became three words for two levels of a two-level taxonomy across catalogue §3/§4; cells are decided at different levels of it. | docs/_constraints/pdlc-rcv-catalogue.md (survives this feature) |
| **A size ceiling near saturation changes review dynamics** (SE REQ v4 F-03, POSTMORTEM root cause 2): from 548 bytes of headroom down, every fix must be funded by same-round compression, compression is itself reviewable new text, and a Low-severity budget warning never blocks so nothing forces the structural decision. Partially promoted already (check-req-size 90% warning naming relocation). | pm-author/se-author SKILLs: "relocate before adding" as a hard rule when a doc is >90% of ceiling |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| `pdlc/workflows/lib/reset-region.mjs` module for the pure region logic | TSPEC D-1 | `build-runtime.mjs` inlines exactly three named sources and `import` does not exist in the workflow runtime — a `lib/` module is invisible to the shipped pipeline. Pure/impure separation bought instead by in-module pure clusters. | Yes — binds any feature adding runtime-executed pipeline logic, until the build gains general module inlining |
| Two ordered writes (`_appendFile`) for halt-line append + marker strip | REQ v3.1 / TSPEC D-3 | A separately losable strip leaves a readable `RESOLVED: yes` beside an incremented `H` — the gate reads an unconsumed clearance and re-grants a window on every later halt while the fault lasts. One read-modify-write makes the bad state unreachable *by construction*. Closing a fail-open by removing the state beat dispositioning it. | Yes — pattern for any paired append+strip of durable state |
| Keep two hand-maintained budget constants with a cross-check test | TSPEC D-4 | The cross-check is a third forgettable site; its failure mode is a green suite asserting the old width while the pipeline runs the new one — the defect moved into the oracle. Export the constant instead. | Yes — general single-source rule for any shared constant |
| Origin parameter defaulting to 1 for origin-less `deriveRoundWindow` callers | TE TSPEC F-01 → v1.1 D-6 | Defaulting to 1 silently breaks four shipped consumers and Phase CR's relative window; `origin = derivedStart` preserves every origin-less caller byte-for-byte while the clearance gate supplies a real origin where one exists. | Yes — "new parameter defaults must reproduce the pre-change value for every existing caller" |
| A sixth Phase R review round on v1.6 | POSTMORTEM R-1/R-2 | The round would review only the three surfaces that generated every blocking finding since round 2 and land where rounds 3–5 landed. An operator-directed convergence pass (findings closed? citations re-derived? no obligation traded for bytes?) is mechanical and cannot generate a class-A/B finding. | Yes — the escalation shape for any fixed-point review loop |

## 4. Process Learnings

1. **Delta review is self-sustaining on prose mechanisms.** Every round retired 100% of the prior
   round's findings and manufactured a comparable number inside the replacement clauses. The loop
   only converged when the contested content changed *kind* (asserted prose → measured facts, or
   REQ-altitude prose → catalogue/TSPEC material) — never by wording it better.
2. **The stopping rule must not be queued behind the loop it governs.** Rounds 2→4 hit the exact
   non-decreasing-blocking-count condition the (unbuilt, dependent) fixed-point-stop feature detects.
   Nothing enforced it; the loop ran to the hard ceiling. Any pipeline rewrite should build the
   stop condition into the loop from day one, not as a downstream feature.
3. **Cost was wildly disproportionate to the code delta.** ~19 review artifacts, a 61 KB REQ at
   99.8% of its ceiling, an 1,872-line TSPEC — for a change whose implementation footprint is one
   constant, ~4 new pure functions and threading through one module. This disproportion, not any
   design defect, is what killed the feature, and it is the primary motivation for the
   `orchestrate-dev` closed-loop rewrite (pdlc-engineering-loop / pdlc-merge-phase /
   pdlc-advisory-tier).
4. **Reviewers under-tag scope.** Across 19 review files: zero findings tagged `Process`, and only
   a handful tagged `Cross-Feature`, despite the POSTMORTEM being essentially all process signal.
   Several `Local`-tagged findings referencing shared files (catalogue, split record) were re-routed
   to §2 at harvest. The tagging rule exists in the SKILLs but is not being exercised.
5. **Reviewer round alignment drifted**: SE's FSPEC reviews run v2–v4 with no v1 (numbering aligned
   to the TE's rounds after a late join or a lost round). Harmless here, but round derivation is
   content-addressed from basenames, so a missing `-v1` shifts window arithmetic in the automated
   loop.
6. **What worked in this session's hand-orchestration** (input for the rewrite): parallel
   per-lens reviewer dispatch; Opus for spec authoring/review, Sonnet reserved for implementation;
   revision agents given the verified-at-HEAD obligation ("verify every claim against source before
   writing"); incremental authoring pacing; verdicts as parsed trailers. The round-1 TSPEC review
   caught 6 genuine design blockers — the review layer itself earns its cost; it is the *document
   churn between rounds* that does not.
7. **Pre-commitments worked.** Both reviewers used explicit escalation pre-commitments ("if round
   N+1 does not close X, I halt/approve") and honoured them; SE declined to re-litigate held-open
   Lows. This is the behavioural half of a stopping rule and it demonstrably shaped verdicts.

## 5. Open Items for Consolidation

- **Promote the measurement-first rule** (§2 row 1) to DOMAIN-CONSTRAINTS — highest-value single
  learning of the feature.
- **Promote the per-conjunct fault-injection rule** (§2 row 2) to DECISIONS-test-oracle-mechanics.
- **Queue impact of abandonment:** rows depending on `pdlc-rcv-budget-stop` (fixed-point-stop,
  panel-topology, finding-quality, reset-region — orders 11/12/17/18 at last reading) have a dead
  dependency. The queue needs an operator decision: retarget those rows at the rewrite features or
  abandon the rcv family wholesale.
- **Design salvage:** REQ v3.1 + FSPEC v1.3 + TSPEC v1.1 + DECISIONS are approved-or-near-approved
  statements of a bounded-budget/reset-region/clearance-gate design, and the shared files they
  amended (baseline §2.8 `M-8*` facts, catalogue §2–§4, split §5.1–§5.8) **remain live in
  `docs/_constraints/`**. The rewrite should either consume the intent (bounded rounds,
  deterministic stop, operator clearance) natively or explicitly retire the catalogue ids
  (S-4, S-11–S-17) it will not use.
- **Unresolved round-2 finding** worth carrying anywhere the design resurfaces: `resolveClearance`
  lacks the `basenames` carrier the declared `_validateRegion` arity-2 contract needs (§2 row 3).
- **SE counts trailer**: the POSTMORTEM noted only TE emits the machine-readable counts trailer;
  SKILLs were updated (`67e6c45`) — verify the next feature's SE reviews actually carry it.

## 6. Approval Record

No `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchors exist in any of this feature's review files (the
anchor mechanism postdates these rounds), so there are no anchors to copy. Verdicts at harvest:

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 4 | software-engineer | Approved with minor changes | — | 18faa48 (per review header) |
| REQ | 4 | test-engineer | Approved with minor changes | — | 18faa48 (per review header) |
| FSPEC | 4 | software-engineer | Approved with minor changes | — | — |
| FSPEC | 4 | test-engineer | Approved with minor changes | — | — |
| TSPEC | 1 | software-engineer | Needs revision | — | 2a7e8d4 reviewed tree (v1.0 at 8801109) |
| TSPEC | 1 | test-engineer | Needs revision | — | 2a7e8d4 reviewed tree (v1.0 at 8801109) |
| TSPEC | 2 | software-engineer | (interrupted — no verdict) | — | — |
