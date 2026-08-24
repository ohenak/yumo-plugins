# LEARNINGS — pdlc-wave-resume

| Field | Detail |
|---|---|
| Feature | pdlc-wave-resume |
| REQ | docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md |
| Date Completed | 2026-08-24 |
| Total Iterations | REQ: 6, FSPEC: 5, TSPEC: 7, DECISIONS: 5, PLAN: 7, PROPERTIES: 6, REVIEW: 3, DOD: 3 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | CROSS-REVIEW-{product-manager,software-engineer,test-engineer}-{REQ,FSPEC,TSPEC,DECISIONS,PLAN,PROPERTIES,REVIEW}-v{N}.md (76 files), CODE_REVIEW-pdlc-wave-resume-v{1,2,3}.md, POSTMORTEM-PR-pdlc-wave-resume.md (retained) — all CROSS-REVIEW-* and CODE_REVIEW-* now deleted |
| Phases exercised | R, F, T, D, P (PLAN), PROP, I, DOD, PR (erratum), REVIEW, H |
| DoD rounds | 3 |

## 1. Non-Convergences

The one halt this feature took is the highest-signal artifact it produced, and it was **not** a
reviewer disagreement. `POSTMORTEM-PR-pdlc-wave-resume.md` (RESOLVED) records a **routing failure**:
upstream-cascade confirmation rounds record findings but do not, by themselves, mint erratum items.
When Phase PR opened its erratum round for the PLAN, the item list was minted from routed
`ERRATUM: PLAN` lines only, so three findings filed by the PLAN's own approvers in the v3/v4 cascade
rounds had no channel into the edit. They were re-raised, uncontested, in three successive rounds and
never argued against — *a finding that is disagreed with generates argument; a finding that is
unrouted generates silence.*

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| PR (PLAN erratum) | pm-review + te-review (agreeing on substance) | Mutation-5 High, plus two coverage-floor Lows, filed as `F-` rows in upstream-cascade rounds v3/v4, never entered any erratum item list; PLAN kept asserting "four mutations" against a TSPEC §5.5 that had grown to five | R4 `erratumPostmortemHalt` fired; post-mortem written, six remediations (R-1…R-6) enumerated and landed; PLAN v1.2 → approved at v6, `Approved` at v7 | 7 rounds (2 of them upstream-cascade confirmations that moved zero PLAN bytes) |
| PR (PLAN erratum) | pm-review vs te-review | The **only** true disagreement was metadata: the identical defect tagged `delta`/`nonlocal` by pm and `inherited`/`local` by te. Both readings defensible — pm reads provenance against the *round*, te against the *document*. The gate takes the union, so pm's tagging selected the halt branch | Halt honoured; tag semantics left unresolved and routed to §5 | 1 round |
| PROPERTIES | pm-review, se-review | Five rounds needed; se-review filed `Needs revision` at v2, v3 and v5 — the only doc type where a reviewer reverted to `Needs revision` *after* an approving round (v4 approved, v5 back to revision) | Converged at v6 (both roles, `Approved with minor changes`, `sha256:8a3a16e…`) | 6 |
| TSPEC | te-review | TSPEC moved **twice** under an already-approved PLAN (v1.2→v1.3 reassigned the RT-7 coverage floor; v1.3→v1.4 added two mutations and an AT-05 conjunct). The second move created a *new obligation* downstream had never been asked to discharge | Absorbed only after the PR halt forced re-grounding | 7 |

Two reviews terminated **without a verdict at all** — `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`
(3.8 KB, truncated mid-table) and `CROSS-REVIEW-test-engineer-PLAN-v1.md` (`## Verdict` → `*(pending)*`).
Neither blocked the pipeline, because the next round superseded them, but both are silent failures: an
aborted review is indistinguishable from a review that found nothing.

## 2. Cross-Feature Patterns

Reviewers on this feature almost never used per-finding `Scope:` tags — 133 `FINDING:` lines carry
only 5 `Local` tags. What they used instead was the erratum grammar's `local`/`nonlocal` locality
field (67 of 133 findings are `nonlocal`). Per the under-tagging rule, those `nonlocal` findings that
name a repo-wide mechanism are routed here as Cross-Feature signal even though nobody tagged them so.

| Finding | Suggested Promotion Target |
|---|---|
| **Upstream-cascade confirmation rounds have no channel into the erratum item mint.** A cross-review filed during a cascade round records a finding that no later phase is obliged to read. This will recur on any feature whose upstream takes a cascade round after downstream approval — it is structural, not a property of this feature. | skill update (`se-author` / `orchestrate-dev` erratum mint) + `docs/_decisions/DECISIONS-{erratum-routing}.md` |
| **Errata raised in the durable document body have no expiry.** Filed against O-5/O-8 in v3, still open in v4 and v5, and demonstrated in both directions: a TSPEC §6.3 item narrated an erratum as "open" after the upstream round had already adjudicated it, *and* a PLAN §3.4 row cited "the erratum this dispatch raises" after TSPEC RT-7 at HEAD had already assigned it. The disposable cross-review is where a raise belongs; nothing expires a raise written into the spec. | skill update (all `*-author` skills) + `docs/_constraints/` |
| **A count restated at seven sites turns a one-row edit into a `nonlocal` High.** "Four mutations" was asserted in PLAN §1.1, §1.2 revision history, §4.3 heading and table, T-07, RK-1, RK-5 and §4.5's DoD checkbox. The same duplication bit §4.6's "Retired ids" row (seven vs nine in adjacent cells). This is what made pm's and te's locality tags diverge and thus what selected the halt branch. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — derive counts from one site, never restate |
| **Version pins in provenance lines go stale within one erratum round.** At least eight distinct findings across FSPEC, TSPEC and PLAN are "§1 says it derives from REQ v1.5; REQ at HEAD is v1.6/v1.7". Pinning a *version number* in prose is a guaranteed staleness generator when the upstream takes erratum rounds. | skill update — pin `APPROVAL-HASH`/`REVIEWED-COMMIT`, not a human version label |
| **Raw `file:line` anchors used where position is not the claim.** Flagged twice (`documentOracles.test.js:712`, `TSPEC:838`) and already named as DEC-DOC-01 elsewhere; DoD B-1 fixed a third (`:9976`) by repointing to the file. The remediation route is established: point at the file or the named symbol. | `docs/_decisions/` — reinforce DEC-DOC-01 |
| **DoD's adjacent-surface criterion (6a) keeps catching docs, not code.** All four v1 DoD findings and both v2 findings were *documentation* surfaces falsified by later commits (`DECISIONS-advisory-wave-gate-questions.md`, `OPERATIONS.md:40`, `PROPERTIES` G-4, `TSPEC` §5.4/§5.5) — zero code-quality findings in §1 across all three rounds. The implementation was clean; the prose around it was not. | skill update (`dod-verify`) — the 6a sweep is the load-bearing criterion here |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Confirm an upstream-cascade round on **item-landing alone** — the routed erratum items all landed, so re-approve with no findings | pm-review / te-review (DECISIONS v3, v4) | DEC-ERR-03 is explicit that landing is *necessary, not sufficient*. The bar is whether the document is still a faithful compression of upstream **at its current version**. Two DECISIONS sentences became false *because* the items landed; confirming on landing would ratify a document that misdescribes its own upstream, in the one round designed to catch exactly that | **Yes** — this is the standing reading of DEC-ERR-03 and should be quoted, not re-derived |
| Scope a cascade round to **the delta** rather than to the document measured against upstream at HEAD | te-review (DECISIONS v4) | Dropping open findings because *this particular edit* did not touch those bytes would quietly retire findings never addressed, and would make the v4 record read as if the document had improved when it had not moved at all (PLAN v3/v4 were byte-identical, `sha256:5f5b50db…`, and still correctly accrued findings) | **Yes** — a byte-identical document can still fail a cascade round |
| Add a config key for REQ OQ-1 | se-author (TSPEC §3.5), upheld by pm-review | OQ-1 was rejected at REQ level; adding the key in an engineering artifact would be a product decision taken in the wrong document. TSPEC §3.5 declines explicitly rather than silently | **Yes** — the pattern (decline *explicitly, in writing*) is what made this auditable |
| Leave `waveBudgetPerRun`'s deferral bound to "revisit once wave resume lands" | dod-verify B-2 (v1), remediated by v2 | A deferral whose trigger is *this feature shipping* becomes unbound the moment it ships. Closed via the second permitted route: the record now states the deferral **is closed at `1`**, that no successor REQ or queue row is opened, and what raising the budget would require | **Yes** — "deferred until X lands" must be re-adjudicated in the round where X lands |
| Silently propagate a corrected count downstream / state the correction only in the fixing document | pm-review (TSPEC rounds) | A count fixed in one site while six sites still assert the old value is not a fix; the correction must be stated where the count is *derived*, not where it was noticed | **Yes** — see §2's seven-sites finding |

## 4. Process Learnings

**1. The erratum mint is the leak, and it is not a people problem.** Every phase here needed 5–7
rounds, but the *only* halt came from a finding that no channel obliged anyone to read. The
post-mortem's own conclusion is worth carrying verbatim: this is *"a routing failure, and it will
recur on any feature whose upstream takes a cascade round after approval."* Explicitly **not** causes:
reviewer disagreement, reviewer fatigue, an under-specified TSPEC, or an se-author error of judgement.
Any process fix aimed at reviewer diligence is aimed at the wrong target.

**2. Provenance/locality tags select gate branches, and their semantics are genuinely ambiguous.**
pm and te tagged the *identical* defect `delta`/`nonlocal` vs `inherited`/`local`, because pm reads
provenance against the **round** (was the item routed into this round?) and te reads it against the
**document** (did these bytes move?). Both are defensible; the gate takes the union, so the stricter
tagging always wins and always halts. Until the tag is defined against one referent, the halt decision
is effectively decided by whichever reviewer reads it more strictly.

**3. Per-finding `Scope:` tagging was essentially not practised.** 133 `FINDING:` lines across 76
cross-reviews produced 5 `Local` tags and no `Cross-Feature` or `Process` tags at all. The `Scope:`
field that *was* filled in was the review-header scope statement ("product lens only…"), which is a
different thing. Reviewers instead leaned on the erratum grammar's `local`/`nonlocal` field, which the
gate actually reads. **The routing this harvest performed was therefore inference, not transcription**
— §2 was populated by re-reading `nonlocal` findings for repo-wide mechanisms. Either the harvest
contract should key off `local`/`nonlocal` (the field reviewers demonstrably fill), or the review
skills need the `Scope:` tag to be gate-visible so it stops being optional.

**4. Partial re-grounding is more dangerous than none.** TSPEC v1.4 carried two decisions; the PLAN's
erratum round absorbed one (`numRuns: 500`) and recorded it in the changelog, and missed the other
(five mutations). The changelog then *reads as though re-grounding happened*. A re-grounding step
that does not enumerate the upstream's decisions exhaustively produces a false all-clear.

**5. Reviews can terminate without a verdict and nothing notices.** Two of 76 cross-reviews
(`pm-PROPERTIES-v1`, `te-PLAN-v1`) have no `VERDICT:` line — one truncated mid-table, one left
`*(pending)*`. Both were superseded by the next round, so the pipeline never saw them. A missing
verdict should be as loud as a `Needs revision`.

**6. Approval anchors were absent from every round-1 and every `Needs revision` review** — 30 of 76
files carry `APPROVAL-HASH: unavailable`. That is correct behaviour (nothing is approved yet), but it
means the §6 Approval Record's coverage is a direct function of how many rounds a doc took, not of how
well it was reviewed.

**7. DoD converged in 3 rounds and found zero code-quality defects.** All findings across
`CODE_REVIEW-v1..v3` were §3/§4 integration-boundary (criterion 6a/6b) findings against *documentation*
surfaces. Each remediation diff introduced new 6a findings of its own (v1 → B-5/B-6 in v2), which is
why 3 rounds were needed rather than 2. Remediating a stale-prose finding is itself a stale-prose risk.

**8. High iteration counts were not waste.** TSPEC and PLAN at 7 rounds each include 2 upstream-cascade
confirmation rounds where the document's bytes did not move at all. Counting those as "iterations"
overstates churn; what they measure is upstream volatility, not downstream quality.

## 5. Open Items for Consolidation

The handed open-promotion list was empty (no open promotions recorded in
`docs/_decisions/.consolidation-log.md`), so no item below carries a `failure-mode-id:` line.

1. **Give upstream-cascade findings a channel into the erratum item mint.** The post-mortem's primary
   root cause. Candidate target: a decision record plus an `se-author` / `orchestrate-dev` skill change
   requiring the erratum mint to draw from *both* routed `ERRATUM:` lines and any unlanded `F-` rows in
   cross-reviews of cascade rounds since the last approval. Highest-value item in this document.

2. **Define `delta`/`inherited` and `local`/`nonlocal` against a single referent.** Because the gate
   takes the union of findings, an ambiguous tag is a coin-flip on whether the pipeline halts. Pick
   round-relative or document-relative, write it down, and cite it in both review skills.

3. **Make the erratum raise disposable, not durable.** Promote to a constraint: an erratum raise lives
   in the cross-review; the durable document may cite the raise only via a form that expires (an
   approval hash / commit, never "the erratum this dispatch raises"). Evidenced in both failure
   directions on this feature.

4. **Ban restated counts; derive them.** A number asserted at seven sites is what converted a one-row
   edit into a `nonlocal` High and split the two reviewers' locality tags. Candidate for
   `docs/_constraints/DOMAIN-CONSTRAINTS.md`.

5. **Pin upstream by hash, not by version label.** Eight-plus findings on this feature are "§1 says it
   derives from REQ v1.5; HEAD is v1.7". `APPROVAL-HASH` / `REVIEWED-COMMIT` already exist and do not
   rot; the human version label in prose does.

6. **Reconcile the harvest's Scope contract with what reviewers actually tag.** Either make `Scope:`
   gate-visible in the review skills or re-key the harvest routing to the `local`/`nonlocal` field.
   Today the harvest infers, and inference is not auditable.

7. **Treat a missing verdict as a failure, not a silence.** A cross-review with no `VERDICT:` line
   should be re-dispatched rather than superseded quietly (2 occurrences here).

8. **Re-adjudicate "deferred until X lands" deferrals in the round where X lands.** DoD B-2 caught one
   (`waveBudgetPerRun`, in a project-level decision record); a mechanical sweep would catch them all.

9. **Consider whether upstream-cascade confirmation rounds should count toward the iteration limit.**
   PLAN reached 7 rounds partly on rounds where its bytes never moved. If they count, features with
   volatile upstreams halt for reasons unrelated to their own quality.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, with `APPROVAL-HASH:` and
`REVIEWED-COMMIT:` values **copied verbatim** out of the `CROSS-REVIEW-*` files before deletion —
never recomputed. `unavailable` means the file carried no such anchor line (all round-1 reviews and
all `Needs revision` rounds; 30 of the 76 files).

`REVIEW` rows are the Phase REVIEW final-codebase cross-reviews. That document type is outside the
six-type pipeline enumeration, so those rows are ordered last rather than interleaved.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 2 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:a5d3e984d676357ca5e30ccb1e50cdc18cff90ffc5517ed1ae41b4d81949453d | 1b24056ad56ba9cec773763de5e26e8951fbe7ea |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:a5d3e984d676357ca5e30ccb1e50cdc18cff90ffc5517ed1ae41b4d81949453d | 1b24056ad56ba9cec773763de5e26e8951fbe7ea |
| REQ | 5 | software-engineer | Approved with minor changes | sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518 | 7660f1ed7a554cdf51dbb05e5c60c15c61f713fc |
| REQ | 5 | test-engineer | Approved with minor changes | sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518 | 7660f1ed7a554cdf51dbb05e5c60c15c61f713fc |
| REQ | 6 | software-engineer | Approved with minor changes | sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f | 5753de27ab4c681e3f7ebd145f072be95b450656 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f | 5753de27ab4c681e3f7ebd145f072be95b450656 |
| FSPEC | 2 | software-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | 1dc235e0b50888ab00b873b651ea280ff2116a3c |
| FSPEC | 2 | test-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | 1dc235e0b50888ab00b873b651ea280ff2116a3c |
| FSPEC | 3 | software-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | c37b80df2aaf22d808c8c34ea24b70167e9e52a1 |
| FSPEC | 3 | test-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | c37b80df2aaf22d808c8c34ea24b70167e9e52a1 |
| FSPEC | 4 | software-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | bc1b9e284feab112c177fca37b60a4b99409d13b |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d | bc1b9e284feab112c177fca37b60a4b99409d13b |
| FSPEC | 5 | software-engineer | Approved with minor changes | sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e | 05901a9c41b7d5439894407d8f8f5d96e4322be1 |
| FSPEC | 5 | test-engineer | Approved with minor changes | sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e | 05901a9c41b7d5439894407d8f8f5d96e4322be1 |
| TSPEC | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 2 | product-manager | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 0c70e9004391c33833bda3d088125a2f8b4df80a |
| TSPEC | 2 | test-engineer | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 0c70e9004391c33833bda3d088125a2f8b4df80a |
| TSPEC | 3 | product-manager | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 4cbd5814c6f4dd3b8260100f3d1790715460e826 |
| TSPEC | 3 | test-engineer | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 4cbd5814c6f4dd3b8260100f3d1790715460e826 |
| TSPEC | 4 | product-manager | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 618589c22e6d5e20ed061158df001a65032ed2d6 |
| TSPEC | 4 | test-engineer | Approved with minor changes | sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94 | 618589c22e6d5e20ed061158df001a65032ed2d6 |
| TSPEC | 5 | product-manager | Approved with minor changes | sha256:458e9ec676a9d47ea8ddc76ae573e55e510ba4f2572ca00da2dc8256210f85c1 | b4a628b8bb691cbc805f6701435138461dd16869 |
| TSPEC | 5 | test-engineer | Approved with minor changes | sha256:458e9ec676a9d47ea8ddc76ae573e55e510ba4f2572ca00da2dc8256210f85c1 | b4a628b8bb691cbc805f6701435138461dd16869 |
| TSPEC | 6 | product-manager | Approved with minor changes | sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a | 5d5bbd752487f6a4f0de2fa8250943ec7d0df3ca |
| TSPEC | 6 | test-engineer | Approved with minor changes | sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a | 5d5bbd752487f6a4f0de2fa8250943ec7d0df3ca |
| TSPEC | 7 | product-manager | Approved with minor changes | sha256:4b5f7f5b2097a344e1e8fafffaa1d7e12f0fd5f583e302f5bf798d22c13c48f5 | 31df4edae2f11429449ed860850a8a784dea6486 |
| TSPEC | 7 | test-engineer | Approved with minor changes | sha256:4b5f7f5b2097a344e1e8fafffaa1d7e12f0fd5f583e302f5bf798d22c13c48f5 | 31df4edae2f11429449ed860850a8a784dea6486 |
| PLAN | 2 | product-manager | Approved with minor changes | sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85 | b8ddcc56fb34713b5b8bd147f88798d2d712c03f |
| PLAN | 2 | test-engineer | Approved with minor changes | sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85 | b8ddcc56fb34713b5b8bd147f88798d2d712c03f |
| PLAN | 3 | product-manager | Approved with minor changes | sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85 | 485d62fa7068fa042224c83879af351db4b02b03 |
| PLAN | 3 | test-engineer | Approved with minor changes | sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85 | 485d62fa7068fa042224c83879af351db4b02b03 |
| PLAN | 6 | product-manager | Approved with minor changes | sha256:ea7bdc57ec1c349ddf9275b4cd5ed2ac822e4f8b38b806836afdd298795bdb99 | 5d5f15b457f707e2ce16468a295f3f8cf9109b5c |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:ea7bdc57ec1c349ddf9275b4cd5ed2ac822e4f8b38b806836afdd298795bdb99 | 5d5f15b457f707e2ce16468a295f3f8cf9109b5c |
| PLAN | 7 | product-manager | Approved | sha256:136abcfb16ce8a2150271ceee957146ac442157f43e11386f5c9904ae21e7e81 | 86a61ab6a259e5f4731758604500f81f0189f5b1 |
| PLAN | 7 | test-engineer | Approved | sha256:136abcfb16ce8a2150271ceee957146ac442157f43e11386f5c9904ae21e7e81 | 86a61ab6a259e5f4731758604500f81f0189f5b1 |
| PROPERTIES | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 4 | product-manager | Approved with minor changes | sha256:e240399e5295af296e2fe5c3c23f322d2c728a5b3145d65117247ecd19092268 | 91ce118c72aac52a91d102fd42fa01d9fa3f2034 |
| PROPERTIES | 4 | software-engineer | Approved with minor changes | sha256:e240399e5295af296e2fe5c3c23f322d2c728a5b3145d65117247ecd19092268 | 91ce118c72aac52a91d102fd42fa01d9fa3f2034 |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:8a3a16eb014fc88a623b96a0005beef68eb32e597efc3b6aac8fa1ed22d367fd | 6eef4a83ae4f23e32ec5ed41843082fbd6976be2 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:8a3a16eb014fc88a623b96a0005beef68eb32e597efc3b6aac8fa1ed22d367fd | 6eef4a83ae4f23e32ec5ed41843082fbd6976be2 |
| DECISIONS | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 020b74a0d811b207dd28c232de6681af23cd142c |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 020b74a0d811b207dd28c232de6681af23cd142c |
| DECISIONS | 3 | product-manager | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 701b8e7b872fdd5965bd29ee3f060e28f8b69123 |
| DECISIONS | 3 | test-engineer | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 701b8e7b872fdd5965bd29ee3f060e28f8b69123 |
| DECISIONS | 4 | product-manager | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 18c629a879bb48cdf052e97aebf7440a10afbe94 |
| DECISIONS | 4 | test-engineer | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | 2eb5e2379271a5f7c8e567f43dbb1a88b9b11fe4 |
| DECISIONS | 5 | product-manager | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | f29f2be717e69d2b6e92402e424918d19d78c0f3 |
| DECISIONS | 5 | test-engineer | Approved with minor changes | sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46 | f29f2be717e69d2b6e92402e424918d19d78c0f3 |
| REVIEW | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| REVIEW | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| REVIEW | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
