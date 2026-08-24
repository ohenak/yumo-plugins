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

## 5. Open Items for Consolidation

## 6. Approval Record
