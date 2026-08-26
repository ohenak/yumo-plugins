# LEARNINGS — pdlc-engineering-loop

| Field | Detail |
|---|---|
| Feature | pdlc-engineering-loop |
| REQ | docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md |
| Date Completed | 2026-08-26 |
| Total Iterations | REQ: 14, FSPEC: 15, TSPEC: 15, PLAN: 15, PROPERTIES: 12, DECISIONS: 12, CODEBASE-REVIEW: 3, IMPL: 10 waves (P0–P9) |
| Upstream | REQ -> FSPEC -> TSPEC -> DECISIONS -> PLAN -> PROPERTIES -> IMPL |
| Harvested from | 172 `CROSS-REVIEW-*.md` (REQ x28, FSPEC x30, TSPEC x30, PLAN x30, PROPERTIES x24, DECISIONS x24, REVIEW x6, across `product-manager`/`software-engineer`/`test-engineer`), 5 `CODE_REVIEW-pdlc-engineering-loop-v{1..5}.md`, `POSTMORTEM-P-pdlc-engineering-loop.md`, `POSTMORTEM-PR-pdlc-engineering-loop.md` — all `CROSS-REVIEW-*` and `CODE_REVIEW-*` now deleted; both POSTMORTEMs retained (`RESOLVED: yes`) |
| Phases exercised | R, F, T, D, P, PR, IMPL (P0–P9), DOD, REVIEW, H |
| DoD rounds | 5 (`v1`–`v4` FAILED, `v5` Pass) |

**Headline.** This feature is an outlier on iteration cost — 172 cross-review rounds against a
6-document spec set, four phases pinned at the round cap of 15, and two erratum-channel halts. The
single highest-signal learning is structural, not local: **bounded channels were repeatedly asked to
absorb unbounded work**, and the two POSTMORTEMs are the same failure in two costumes.

## 1. Non-Convergences

Review loops where reviewers struggled to converge, and how it resolved. Both entries are
**erratum-channel** halts with a POSTMORTEM; both are `RESOLVED: yes`.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| P (PLAN phase, TSPEC erratum channel) | `te-review` sole non-approver; `pm-review` approving | High finding flat at 1 across both budgeted rounds, and the **same proposition each time**: Architecture §7's enumeration of co-changing "workflow module name" sites was incomplete — four at v0.6, five at v0.7, and a sixth (`packaging.test.js`, whose `WORKFLOW_MODULE_NAMES` *derives* from `WORKFLOW_MEMBERS` via `path.basename` and so flattens the `lib/` segment) still unnamed at halt. A defect class shrinking by one instance per round cannot converge against a two-round budget. | Not a Phase P restart and not another follow-up (budget spent by definition). R-1/R-2/R-3 landed as direct fixes, POSTMORTEM marker flipped, Phase P re-run to give the corrections a normal confirmation round. | 2 erratum rounds (cross-review rounds 9–10 of 15) |
| PR (PROPERTIES phase, TSPEC erratum channel) | `pm-review` **and** `te-review`, both non-approving, both untagged | **Unanimity without content.** Neither confirmer wrote a `-v13` artifact and neither emitted a parseable `VERDICT:` or line-leading `FINDING:`. The engine's fail-closed reader synthesised two **byte-identical** `High \| delta \| nonlocal \| (untagged confirmation)` findings — the one combination that cannot be closed by R1–R3 and must halt. The routed item was in fact landed and verifiable at HEAD (four *Levels and homes* rows, four AT anchors, zero remaining zero-occurrence names). | Diagnosed as a **dispatch failure, not a rejection**: re-run re-dispatches the delta confirmation rather than feeding synthesised findings back to the author. No TSPEC edit owed. | 6 iterations within erratum round 11; halt at confirmation |

**Why these are one pattern, not two.** In both cases the channel behaved exactly as specified and
the *material was mis-sized for it*. Phase P fed a brand-new architectural section (Architecture §7,
absorbing four upstream decisions that arrived together in REQ v1.8 / FSPEC v0.8) through a
one-round-plus-one-follow-up channel that grants two review passes where an ordinary phase review
grants five. Phase PR fed a six-commit edit sequence — including a truncate/restore pair — through
a single confirmation. The bounded channel is not the defect; **routing unbounded work into it is**.

**Contributing conditions worth separating from the root causes.**

- *Author-versus-HEAD-code enumeration with no mechanical falsifier* (P, root cause A). The
  co-change set was discoverable at HEAD in one command
  (`grep -rn "WORKFLOW_MODULE_NAMES\|WORKFLOW_MEMBERS" pdlc/` returns five files); the TSPEC grew
  the list reactively instead. The deeper defect is that the **design itself has no falsifier for
  completeness** — nothing at test time asserts "every constant naming a workflow module agrees with
  `WORKFLOW_MEMBERS`" — so correctness rested on a human sweep, which is precisely what failed twice.
- *A routed-upstream item closed by re-reading upstream more favourably* (P, root cause B). PM's
  round-9 Medium was tagged `inherited | nonlocal` with an explicit upstream fix. The v0.7 edit
  answered it **locally**, quoting REQ NFR-1 truncated at its deciding qualifier. Both reviewers
  falsified the reading by quoting the clause in full. **This was the most expensive move in the
  channel**: it converted one Medium into two Mediums and burned the follow-up round the High
  finding needed.
- *An inherited Medium carried across two rounds untouched* (P, root cause C). The coverage floor's
  "the two new entries are covered by an existing oracle" claim was false for **presence** at v0.6
  and still false at v0.7. Carrying an inherited finding through a **bounded** channel spends budget
  without reducing risk.
- *A whole-file rewrite inside the confirmed delta* (PR, C-1). `251510d10`, nominally a changelog-row
  bump, deleted **1638 lines** of document body; `6f279c191` restored them 31 seconds later. Net
  content at HEAD is correct, so this cannot have changed a *reasoned* verdict — but a confirmer
  sampling per-commit history rather than the HEAD tree would see a whole-document deletion inside
  its delta. The pacing contract's *"prefer a targeted edit to a whole-file write"* rule exists
  exactly to prevent this, and was not followed.

**Explicitly not the cause**, in both POSTMORTEMs: reviewer severity inflation (no finding was
withdrawn; all were HEAD-verified), reviewer-versus-reviewer disagreement (PM and TE agreed on every
substantive point and differed only in verdict threshold), upstream churn, and scope creep.

## 2. Cross-Feature Patterns

**Tagging caveat, stated up front.** Only **5** `Scope:` tags exist across all 179 harvested
artifacts (4 `Local`, 1 `Process`, **0** `Cross-Feature`). Scope was therefore *inferred*, not read,
for essentially every finding. Per the harvest under-tagging rule, findings tagged or written as
`Local` that reference a sibling feature or a repo-wide mechanism are routed here anyway; the tag
under-use itself is recorded in §4.

| Finding | Suggested Promotion Target |
|---|---|
| **A completed sibling feature's approved enumerations are a live coupling, not a closed record.** This feature could not ship without widening file enumerations that `pdlc-engine-distribution` had already approved and frozen (`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-*`, FSPEC §5.2 per-class counts, `_tspec-packed-set.mjs`, AT-3.8b). REQ §5 needed a bespoke carve-out to permit it, NFR-1 and FSPEC BR-21 both had to restate that carve-out verbatim, and the resulting three-way clause agreement was itself the subject of repeated Medium findings through TSPEC rounds 9–11. Referenced in **110 of 177** harvested review artifacts. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a constraint that completed features' frozen enumerations are amendable only via an explicit, single-sited carve-out, and that the carve-out is stated **once** with all other clauses citing it by reference rather than restating its text |
| **Verbatim restatement of one clause across three documents is a defect generator.** REQ §5's carve-out, REQ NFR-1 and FSPEC BR-21 each carried the same sentence. The Phase P halt turned on NFR-1 being quoted **truncated at its deciding qualifier**; because BR-21 carried the sentence too, every narrowing had to be routed to *two* upstream documents, not one. Multi-sited verbatim text guarantees that a fix applied to one site leaves the others stale. | `docs/_decisions/` — single-source-of-truth rule for normative clauses: state once, cite by anchor elsewhere; plus a document oracle asserting restated clauses are byte-identical across their sites |
| **A "co-change set" enumerated in prose, with no oracle asserting its completeness, is unsound by construction.** The vendored-workflow channel's members were listed by human inspection and grew four -> five -> six across rounds. The set was mechanically derivable at HEAD in one `grep`. Nothing at test time asserted "every constant naming a workflow module agrees with `WORKFLOW_MEMBERS`". This is a repo-wide mechanism (packaging/vendoring), not a feature-local one. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — any spec that enumerates a co-change set must name the mechanical query that derives it **and** ship an oracle asserting derived-set equality |
| **The engine's erratum dispatch cites an upstream FSPEC hash no commit on the branch produces.** `sha256:6bf027f4...` against HEAD's `sha256:e9188c2f...`; present in **54** cross-review files and independently re-raised as a Low by both PM and TE in Phase P rounds 9 and 10, and again in Phase PR. Every reviewer measured against HEAD per the *upstream at HEAD* rule so **no conclusion changed** — but the rounds' upstream binding is not reproducible from their own record, and the unresolvable anchor is a plausible contributor to confirmers spending budget on reconciliation rather than the delta. Workflow-owned; no document edit was ever owed. This is not this feature's defect and will recur on the next feature. | Engine fix in `pdlc/workflows/` (snapshot the dispatch hash from committed HEAD), plus `docs/_decisions/` recording that a non-resolving upstream anchor is a **blocking engine defect**, not a Low to be re-filed each round |
| **`Local`-tagged DoD findings that land on shared surfaces.** `CODE_REVIEW` v4's B-01 (`pdlc/.claude-plugin/plugin.json` version rule stated in `pdlc/OPERATIONS.md:145`) and B-02 (`pdlc/OPERATIONS.md` + `pdlc/templates/loop.md` both deferring to `pdlc/README.md`'s install list) were scoped `Local` but both edit repo-wide operator documentation whose correctness other features depend on. Their remediation is instructive: the oracles were strengthened from **existence** to **referent** ("every deferring doc names a doc that actually carries the install") and from a **frozen literal pin** to a **monotonic bar**. | Skill update to `dod-verify` — treat edits to `OPERATIONS.md`, `README.md`, `CLAUDE.md` and `templates/` as `Cross-Feature` by default; and `docs/_decisions/` — prefer monotonic/referent oracles over frozen-literal pins on shared surfaces |

## 3. Rejected Proposals (with rationale)

Things considered and explicitly not done, where the reason matters for future work. All four
survived repeated re-confirmation across erratum rounds — reviewers re-checked each rejection
against HEAD and each time the rejection held on the *same sentence*, which is itself the signal:
these are stable, citable decisions, not provisional ones.

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| **DEC-LOOP-06 alternative D** — let engine-readiness be advisory so a `loop.preflight` value could permit an iteration on an unready engine | `se-author` (chosen: B); rejection re-confirmed by `pm-review` and `te-review` across erratum rounds 9–11 | REQ **BR-11b** — *"No value of `loop.preflight` lets an unready engine run an iteration"* — forbids the single outcome D would buy. BR-11b, AC-3.3 and AC-3.4 are untouched at HEAD, and REQ §5's carve-out is expressly **not** a licence to change what any gate asserts. D therefore stays rejected on the same sentence in every round. | **Yes, with a named re-evaluation trigger.** Trigger (c) is *"C-10's fail-closed commitment is revisited at project level"*. Until that happens, any future proposal to soften engine-readiness is pre-rejected by BR-11b and should not be re-litigated. |
| **DEC-LOOP-04 alternative D** — adopt `readEngineConfig`'s existing `{state: ...}` triple instead of a new four-state partition | `se-author`; re-confirmed by `te-review` | Two independent legs, either sufficient: (1) REQ **BR-02**/AC-2.5 specify a **four**-state partition against the shipped **triple**; (2) a HEAD measurement of the cost — renaming the `no-pin` literal across **20 occurrences in 8 tracked files**. The rejection was **priced against a requirement, not against taste**, which is why it survived re-check. | **Yes.** Reusable as a worked example of pricing a rejected alternative with a measured blast radius. Note the measurement itself later needed correction (`fixture-machine.mjs`'s hit is a scenario *label*, not production code, and the file is not in `package.json` `files`) — price the option, but attribute each hit. |
| **The `"off"` policy shortcut** — make the loop policy-aware unconditionally rather than only on the `--loop-state` path | `se-author`; endorsed by reviewers as a positive observation | Refusing the shortcut preserved the **C-10 fail-closed** guarantee: the *"no `--loop-state`, byte-for-byte unchanged"* row is stated first, so the default path is provably untouched. The easy version would have made every invocation policy-sensitive. | **Yes — this is the reusable shape.** When adding a policy/mode, scope it to an explicit opt-in path and state the byte-unchanged default row *first*, so the no-op case is the one the oracle pins. |
| **Restarting Phase P, and running a further erratum follow-up** (both considered at the Phase P halt) | `POSTMORTEM-P` author | A restart discards converged work from rounds 1–8 for one High finding whose fix is known and named. A further follow-up is impossible by construction — `MAX_ERRATUM_FOLLOWUP_ROUNDS` is 1 and the budget is **spent by definition** at the halt. The chosen third path: land R-1/R-2/R-3 as direct fixes, flip the POSTMORTEM's `RESOLVED:` marker, and re-run the phase so the corrections get a **normal** confirmation round. | **Yes — this is the general erratum-halt recipe.** A bounded-channel halt is a signal to *re-open the normal channel*, not to restart the phase or to demand budget the channel does not have. |
| **Feeding the synthesised fail-closed findings back to the author** (Phase PR halt) | `POSTMORTEM-PR` author | The two non-approvals were **byte-identical engine-generated strings**, not reviewer judgement; no `-v13` artifact existed and the routed item was verifiably landed at HEAD. Treating a dispatch failure as a rejection would have sent the author to fix a defect that does not exist. | **Yes, and it generalises.** Byte-identical findings from two different lenses are the signature of a **single generator** (the fail-closed reader), never of independent convergence. Genuine PM/TE agreement in this feature was *never* byte-identical. Use identity as the diagnostic. |

## 4. Process Learnings

Signals about how the workflow itself should evolve. Ordered by strength.

**P-1 — Scope tagging has effectively collapsed (highest-signal process finding).** Across **179**
harvested artifacts there are **5** `Scope:` tags: 4 `Local`, 1 `Process`, **0** `Cross-Feature`.
This is not under-tagging at the margin, it is ~97% absence. Every routing decision in §2 above was
made by *inference from finding text*, which is exactly the manual re-reading the tag exists to
eliminate — and it means the harvest's routing is unverifiable. The reviewers were otherwise highly
disciplined (severity, `delta`/`inherited`, `local`/`nonlocal` provenance tags are near-universally
present and correct), so the failure is specific to the `Scope:` field. **The provenance tag
displaced the scope tag**: `local`/`nonlocal` answers "does this document owe an edit", which is the
question the erratum gate asks, so reviewers optimised for the gated field and dropped the ungated
one. A field that no gate reads decays. Either gate `Scope:` or fold scope into the provenance tag.

**P-2 — Four of six documents pinned at the round cap; the cap is doing the converging.** REQ 14,
FSPEC 15, TSPEC 15, PLAN 15, PROPERTIES 12, DECISIONS 12. Fifteen is the cap. When four phases land
*on* the cap rather than below it, the loop is not converging — it is being **stopped**, and the
approving verdicts at rounds 14–15 record exhaustion as much as agreement. Corroborating evidence:
114 approving verdicts against 50 `Needs revision`, i.e. the loop was mostly approving throughout,
yet still ran to the cap, because *each approval carried new Low/Medium findings that seeded the
next round*. **"Approved with minor changes" is not a terminating state when the minor changes
themselves generate the next round's findings.** Consider a convergence criterion on the *derivative*
(no new findings above Low for N rounds) rather than on the verdict alone.

**P-3 — Process artifacts outweigh the specs they review by 5.6x.** 3.45 MB of
`CROSS-REVIEW`/`CODE_REVIEW` against 617 KB of REQ+FSPEC+TSPEC+PLAN+PROPERTIES+DECISIONS. Individual
cross-reviews ran 20–37 KB — routinely larger than the section of the document under review. This is
the concrete cost case for the harvest-then-delete discipline, and also an argument for a **review
size budget**: a 37 KB review of a delta is re-deriving context, not reviewing.

**P-4 — Verdict grammar deviated in 3 files, and two of them are truncated artifacts.**
`CROSS-REVIEW-product-manager-PROPERTIES-v4.md` and `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md`
(both ~8.5 KB, both round 4 of the same phase) have `## Recommendation` and `## Verdict` headings
with **empty bodies** — the writes were cut off mid-document, and `CROSS-REVIEW-test-engineer-DECISIONS-v4.md`
carries its verdict in prose only. The engine's fail-closed reader scores all three as non-approving.
This is the *same* failure class as the Phase PR halt (§1): **an incomplete dispatch is
indistinguishable from a rejection at the artifact layer**. Two occurrences in this feature is a
pattern, not a one-off. A review artifact that lacks a line-leading `VERDICT:` should be reported as
`INCOMPLETE` and re-dispatched, never scored.

**P-5 — The `-v{N}` numbering contract is orchestrator/skill-ambiguous.** `CODE_REVIEW-...-v5.md`
opens with a numbering note: the orchestrator dispatched the round as **"v1"** while `v1`–`v4` were
already committed, and the skill's next-integer rule was applied to reach `v5`. The skill recovered
correctly, but the orchestrator's round counter and the on-disk artifact chain disagree, so any
consumer trusting the dispatch number reads the wrong document. The next-integer-from-disk rule
should be the *only* rule, and the dispatch should not carry a number at all.

**P-6 — DoD needed 5 rounds (v1–v4 FAILED, v5 Pass), and the remediation pattern is the lesson.**
The v4->v5 remediations show what a load-bearing fix looks like: every oracle was **verified by
mutation** in a throwaway worktree (revert the guarded behaviour, confirm the named test goes RED) —
an assertion-free or vacuously-green oracle was not accepted. Two oracles were also *strengthened in
kind*: existence -> **referent** ("every deferring doc names a doc that actually carries the
install"), and frozen-literal pin -> **monotonic bar**. Mutation-verification should be the default
DoD standard, not a v5 nicety; four FAILED rounds is what it costs to discover that late.

**P-7 — Answering a `nonlocal` finding locally is the single most expensive move available.** Named
as Phase P root cause B and worth stating as a general rule: when a reviewer tags a finding
`nonlocal` with an upstream fix, resolving it inside the current document by re-reading upstream more
favourably converts one Medium into two and burns the round the blocking finding needed. The
reviewers' counter is cheap and unanswerable — quote the upstream clause **in full** at HEAD. Truncating
a quotation at its deciding qualifier is the specific mechanism; it happened with REQ NFR-1.

**P-8 — A recurrent, non-actionable engine defect was re-filed as a Low in 54 separate reviews.**
The stale dispatch FSPEC hash (§2) owed no document edit in any round, yet cost reviewer attention
in every one. Findings the author cannot act on should route to a **workflow-defect channel** once,
not to the document's finding list repeatedly.

**P-9 — Prefer targeted edits to whole-file writes (re-learned the hard way).** A nominal
changelog-row bump (`251510d10`) deleted 1638 lines of document body; the restore landed 31 seconds
later. Net content was correct, but the truncate/restore pair sat *inside* the delta a confirmer was
asked to confirm. The pacing contract already states this rule; it needs enforcement (a hook rejecting
a write that deletes >N% of a spec document), not restatement.

## 5. Open Items for Consolidation

Candidates for promotion that this harvest is **not** authorised to promote. The open-promotion list
handed to this harvest (FSPEC §8.4 step 1) was **empty** — no open promotions are recorded in
`docs/_decisions/.consolidation-log.md`. Each item below was checked against that (empty) list and
matched nothing, so **no `failure-mode-id:` line is written on any item**. That absence is the
correct result, not an omission.

**O-1 — Frozen enumerations in completed features are a live coupling.** Promote to
`docs/_constraints/DOMAIN-CONSTRAINTS.md`: a completed feature's approved enumerations may be widened
only through an explicit carve-out that is **stated once and cited by anchor**, never restated
verbatim across documents. (From §2 rows 1–2; this feature paid for the restatement pattern twice —
Phase P root cause B and the BR-21 double-routing.)

**O-2 — Enumerated co-change sets require a derivation query and a set-equality oracle.** Promote to
`docs/_constraints/DOMAIN-CONSTRAINTS.md`. A spec that lists "the places that must change together"
must name the mechanical query deriving the set and ship an oracle asserting the derived set equals
the enumerated one. This feature's four->five->six enumeration drift is the worked example, and it
caused one of the two POSTMORTEMs.

**O-3 — Gate the `Scope:` field, or retire it.** Promote to `docs/_decisions/` and to the four
review skills (`pm-review`, `se-review`, `te-review`, `dod-verify`). §4 P-1 shows ~97% absence
because the field is ungated while the adjacent provenance tags are gated. Two viable dispositions:
make `Scope:` a fail-closed parse requirement alongside `FINDING:`, or fold scope into the provenance
tag and delete the field. **Leaving it ungated but required is the one option this feature falsified.**

**O-4 — An incomplete review artifact must be reported, never scored.** Promote to `docs/_decisions/`
and the engine's review reader. §1 (Phase PR) and §4 P-4 are the same defect at two scales: a missing
or truncated artifact is currently indistinguishable from a maximal-severity rejection. Proposed rule:
absent line-leading `VERDICT:`, or an absent artifact file, yields `INCOMPLETE` -> re-dispatch, and
**byte-identical findings from two distinct lenses** are treated as a generator signature and never
as convergence.

**O-5 — Convergence criterion on the derivative, not the verdict.** Promote to `docs/_decisions/`.
§4 P-2: four of six documents finished *at* the round cap while 114 of 169 parsed verdicts were
already approving. Proposal: terminate a review loop when no finding above Low is raised for N
consecutive rounds, rather than on verdict alone or on cap exhaustion.

**O-6 — Fix the stale dispatch upstream-hash defect and stop re-filing it.** Engine fix in
`pdlc/workflows/` (snapshot the upstream hash from committed HEAD) plus a `docs/_decisions/` entry
classifying a non-resolving upstream anchor as a **blocking engine defect**. §2 row 4 / §4 P-8: 54
re-filings, zero document edits owed, and it will recur on the next feature untouched.

**O-7 — Mutation-verification as the DoD default.** Promote to a `dod-verify` skill update. §4 P-6:
the standard that finally passed at v5 — revert the guarded behaviour in a throwaway worktree and
confirm the named oracle goes RED — should be the entry standard, not the exit one. Include the two
oracle-strengthening shapes this feature produced: existence -> referent, and frozen-literal pin ->
monotonic bar.

**O-8 — Treat shared operator surfaces as `Cross-Feature` by default.** Promote to a `dod-verify`
skill update. §2 row 5: edits to `OPERATIONS.md`, `README.md`, `CLAUDE.md` and `templates/` were
scoped `Local` although other features depend on their correctness.

**O-9 — Single numbering authority for `-v{N}`.** Promote to `docs/_decisions/` and the orchestrator.
§4 P-5: next-integer-from-disk should be the only rule, and dispatches should not carry a round
number that can disagree with the artifact chain.

**O-10 — Enforce the whole-file-write prohibition mechanically.** Promote to a hook (candidate:
alongside `check-req-size.sh`) rejecting a write that deletes more than a threshold share of a spec
document. §4 P-9: the pacing contract already states the rule in prose and it was still violated,
inside a delta under confirmation.

**Deliberately not promoted.** The DEC-LOOP-04/05/06 rejections (§3) are feature-local decisions with
named re-evaluation triggers; they belong in this feature's DECISIONS document, which retains them,
and should not be lifted to project level. Re-evaluation trigger (c) on DEC-LOOP-06 — *"C-10's
fail-closed commitment is revisited at project level"* — is the one hook that would make DEC-LOOP-06
a project-level concern, and it has not fired.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied out of the `CROSS-REVIEW-*`
files before they were deleted. **117 approving rounds** of 172 total (169 carried a parseable
line-leading `VERDICT:`; 50 were `Needs revision`; 3 were unparseable, see §4 P-4).

**Anchors are copied verbatim, never recomputed.** Where a cell reads `unavailable` (17 rows) the
source file carried no line-leading `APPROVAL-HASH:` / `REVIEWED-COMMIT:` trailer; no value was
invented. Note that many files also mention a `REVIEWED-COMMIT:` **in prose**, citing a *prior*
round's anchor — those were deliberately not read; only the file's own line-leading trailer counts.

Two further approving rounds are **not** tabulated because their document type (`REVIEW`, the final
codebase review) is outside the schema's enum: `CROSS-REVIEW-product-manager-REVIEW-v3.md` and
`CROSS-REVIEW-test-engineer-REVIEW-v3.md`, both *Approved with minor changes*, both with no anchor
trailer. Rounds 1–2 of that loop were `Needs revision`.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:75bb0f5eed3db6e41597d9c46d0ce570ac13a7c9616d2b9c8d4e4fd3f19722c8 | af915ee38ed6b3b415f1991dc21f3459c270374f |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:75bb0f5eed3db6e41597d9c46d0ce570ac13a7c9616d2b9c8d4e4fd3f19722c8 | af915ee38ed6b3b415f1991dc21f3459c270374f |
| REQ | 5 | software-engineer | Approved with minor changes | sha256:bd89e300a2f8f4ead6835c8994aaad14c0367e84b74d7519cab98960b1c5f15b | f44b188d299a4f25c52987ffc47b970a6cd35e15 |
| REQ | 5 | test-engineer | Approved with minor changes | sha256:bd89e300a2f8f4ead6835c8994aaad14c0367e84b74d7519cab98960b1c5f15b | f44b188d299a4f25c52987ffc47b970a6cd35e15 |
| REQ | 6 | software-engineer | Approved with minor changes | sha256:c30f734b1d99ed1f7ed700fe1f97c940dbd822bf8f0d980c594c9e938488a176 | 5dc159aa9029d852805568ab8dedbe468139b970 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:c30f734b1d99ed1f7ed700fe1f97c940dbd822bf8f0d980c594c9e938488a176 | 5dc159aa9029d852805568ab8dedbe468139b970 |
| REQ | 7 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 8 | software-engineer | Approved with minor changes | sha256:cc9c5fe95e8b7dc1e61340f31560525c4086a7ba3610d5fdbdf9bef82264b8d1 | a94b222133663b808ff74b4eff840dd20260d6a9 |
| REQ | 8 | test-engineer | Approved with minor changes | sha256:cc9c5fe95e8b7dc1e61340f31560525c4086a7ba3610d5fdbdf9bef82264b8d1 | a94b222133663b808ff74b4eff840dd20260d6a9 |
| REQ | 9 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 10 | software-engineer | Approved with minor changes | sha256:cc9c5fe95e8b7dc1e61340f31560525c4086a7ba3610d5fdbdf9bef82264b8d1 | 6ff95f3f45a250224aa4c6b43febd1d5656e5ddd |
| REQ | 10 | test-engineer | Approved with minor changes | sha256:cc9c5fe95e8b7dc1e61340f31560525c4086a7ba3610d5fdbdf9bef82264b8d1 | 6ff95f3f45a250224aa4c6b43febd1d5656e5ddd |
| REQ | 11 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 12 | software-engineer | Approved | sha256:5824ecea250886d482960b3c880da7868af7e7c3be5cece7d170c10ca74bc4d2 | fe35644cccbacfdc842ec6497039e3deef79e71c |
| REQ | 12 | test-engineer | Approved with minor changes | sha256:5824ecea250886d482960b3c880da7868af7e7c3be5cece7d170c10ca74bc4d2 | fe35644cccbacfdc842ec6497039e3deef79e71c |
| REQ | 13 | software-engineer | Approved | sha256:57d55641ee2e38265bbd471fb72a3e4b9c3fc1af019d4029244696d0a40fc708 | 4923651070fb8df4a127c7a88517f9706f2868e9 |
| REQ | 13 | test-engineer | Approved with minor changes | sha256:57d55641ee2e38265bbd471fb72a3e4b9c3fc1af019d4029244696d0a40fc708 | 4923651070fb8df4a127c7a88517f9706f2868e9 |
| REQ | 14 | software-engineer | Approved | sha256:57d55641ee2e38265bbd471fb72a3e4b9c3fc1af019d4029244696d0a40fc708 | b4629159ae2cab174f38892ffe429c7ae6f193a1 |
| REQ | 14 | test-engineer | Approved with minor changes | sha256:57d55641ee2e38265bbd471fb72a3e4b9c3fc1af019d4029244696d0a40fc708 | b4629159ae2cab174f38892ffe429c7ae6f193a1 |
| FSPEC | 3 | software-engineer | Approved with minor changes | sha256:ff79b002c459b710462a022c780d0a769eeea39448c91c8ab42e225e5cc2b5e5 | 8c5a1fc8babc5704cbda16ea4932fd78e4c0a64f |
| FSPEC | 3 | test-engineer | Approved with minor changes | sha256:ff79b002c459b710462a022c780d0a769eeea39448c91c8ab42e225e5cc2b5e5 | 8c5a1fc8babc5704cbda16ea4932fd78e4c0a64f |
| FSPEC | 4 | software-engineer | Approved with minor changes | sha256:ff79b002c459b710462a022c780d0a769eeea39448c91c8ab42e225e5cc2b5e5 | f1eb56e2f50f6c6ed7a303394d5308a5647c0cd9 |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:ff79b002c459b710462a022c780d0a769eeea39448c91c8ab42e225e5cc2b5e5 | f1eb56e2f50f6c6ed7a303394d5308a5647c0cd9 |
| FSPEC | 6 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 7 | software-engineer | Approved with minor changes | sha256:616c7ab41df2f964995e42fb193c52730e6005c4959706f7edff47d9edfc01a0 | 9d7cffc36b0f45d286d12050662a8caae4c02bab |
| FSPEC | 7 | test-engineer | Approved with minor changes | sha256:616c7ab41df2f964995e42fb193c52730e6005c4959706f7edff47d9edfc01a0 | 9d7cffc36b0f45d286d12050662a8caae4c02bab |
| FSPEC | 8 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 9 | software-engineer | Approved with minor changes | sha256:af31e56ef2aa9b7f43368e64efc1a81042b93a2ca67164e4498f9c8b30de7f4f | 46c8d640f0f501f4dae2582dba3bbaffe30ffc57 |
| FSPEC | 9 | test-engineer | Approved with minor changes | sha256:af31e56ef2aa9b7f43368e64efc1a81042b93a2ca67164e4498f9c8b30de7f4f | 46c8d640f0f501f4dae2582dba3bbaffe30ffc57 |
| FSPEC | 10 | software-engineer | Approved with minor changes | sha256:af31e56ef2aa9b7f43368e64efc1a81042b93a2ca67164e4498f9c8b30de7f4f | cb8dd672ff002b9186b58dd1ed51b6b3b8db9bd8 |
| FSPEC | 10 | test-engineer | Approved with minor changes | sha256:af31e56ef2aa9b7f43368e64efc1a81042b93a2ca67164e4498f9c8b30de7f4f | cb8dd672ff002b9186b58dd1ed51b6b3b8db9bd8 |
| FSPEC | 11 | software-engineer | Approved with minor changes | sha256:ff32fa3f6aa62804b57aacfbc3d97131bf6e485b6e295d69be05ca481c3485d5 | 1b3d6ff4c9673c22ba1bac2bad0f5b5ecad3de9f |
| FSPEC | 11 | test-engineer | Approved with minor changes | sha256:ff32fa3f6aa62804b57aacfbc3d97131bf6e485b6e295d69be05ca481c3485d5 | 1b3d6ff4c9673c22ba1bac2bad0f5b5ecad3de9f |
| FSPEC | 13 | software-engineer | Approved with minor changes | sha256:6bf027f41ea115a6854f26cce7dd7716f3babd4ec5dd27072b0cbc163f9606a0 | 9847882e2121aa8de219e181380fd6ccb1c029ed |
| FSPEC | 13 | test-engineer | Approved with minor changes | sha256:6bf027f41ea115a6854f26cce7dd7716f3babd4ec5dd27072b0cbc163f9606a0 | 9847882e2121aa8de219e181380fd6ccb1c029ed |
| FSPEC | 14 | software-engineer | Approved with minor changes | sha256:6bf027f41ea115a6854f26cce7dd7716f3babd4ec5dd27072b0cbc163f9606a0 | 5a33c33dcf24f41b5d8ab0cec4a3daf4575de18f |
| FSPEC | 14 | test-engineer | Approved with minor changes | sha256:6bf027f41ea115a6854f26cce7dd7716f3babd4ec5dd27072b0cbc163f9606a0 | 5a33c33dcf24f41b5d8ab0cec4a3daf4575de18f |
| FSPEC | 15 | software-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 2 | product-manager | Approved with minor changes | sha256:7dd26adfd91754613d8a5d8d9cf1fce677a294a367e61c3d8d7139bf6f69d227 | 5b8ff11b1e44e3a345ea4f8340481fb1f5962ee2 |
| TSPEC | 2 | test-engineer | Approved with minor changes | sha256:7dd26adfd91754613d8a5d8d9cf1fce677a294a367e61c3d8d7139bf6f69d227 | 5b8ff11b1e44e3a345ea4f8340481fb1f5962ee2 |
| TSPEC | 5 | product-manager | Approved with minor changes | sha256:16fab6e6166fd0fa08ee1f9b6214bb5f8d6e769a95979a7fa98e35c815d28845 | 1677f957550cba01af81157eec6d975fd6715cd5 |
| TSPEC | 5 | test-engineer | Approved with minor changes | sha256:16fab6e6166fd0fa08ee1f9b6214bb5f8d6e769a95979a7fa98e35c815d28845 | 1677f957550cba01af81157eec6d975fd6715cd5 |
| TSPEC | 6 | product-manager | Approved with minor changes | sha256:16fab6e6166fd0fa08ee1f9b6214bb5f8d6e769a95979a7fa98e35c815d28845 | d9e162736b02ec7016fd946b946d1f3f03685cc5 |
| TSPEC | 6 | test-engineer | Approved with minor changes | sha256:16fab6e6166fd0fa08ee1f9b6214bb5f8d6e769a95979a7fa98e35c815d28845 | d9e162736b02ec7016fd946b946d1f3f03685cc5 |
| TSPEC | 7 | product-manager | Approved with minor changes | sha256:c0f786b22cff3de44bd89540d06eb4880277facfa93dc6e1df5a5d7b3915c1de | 205a9c2d62e96f97ba5706b10d87ed14feaba125 |
| TSPEC | 7 | test-engineer | Approved with minor changes | sha256:c0f786b22cff3de44bd89540d06eb4880277facfa93dc6e1df5a5d7b3915c1de | 205a9c2d62e96f97ba5706b10d87ed14feaba125 |
| TSPEC | 9 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 10 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 11 | product-manager | Approved with minor changes | sha256:6f8a3d891e6647617476ceac8daeec8315b24c27fff73b5d83f84f6e8771de9a | 3fb86e8ea0659b55825b5166d32d8ddf57380c4d |
| TSPEC | 11 | test-engineer | Approved with minor changes | sha256:6f8a3d891e6647617476ceac8daeec8315b24c27fff73b5d83f84f6e8771de9a | 3fb86e8ea0659b55825b5166d32d8ddf57380c4d |
| TSPEC | 12 | product-manager | Approved with minor changes | sha256:524a8e63b33e09028c482a89ff5cc86d0de41903ce7b6e8c199e445f597c88c6 | fe39d26526a3fd7d54ac6c4ee9f4ab5a726176d7 |
| TSPEC | 12 | test-engineer | Approved with minor changes | sha256:524a8e63b33e09028c482a89ff5cc86d0de41903ce7b6e8c199e445f597c88c6 | fe39d26526a3fd7d54ac6c4ee9f4ab5a726176d7 |
| TSPEC | 13 | product-manager | Approved with minor changes | sha256:fb1908d85f2f0e61f3fe467624d0493359934e1207af3c21b8c061d017c105c2 | 0dd06833a634990580884061277c13495580d3b6 |
| TSPEC | 13 | test-engineer | Approved with minor changes | sha256:fb1908d85f2f0e61f3fe467624d0493359934e1207af3c21b8c061d017c105c2 | 0dd06833a634990580884061277c13495580d3b6 |
| TSPEC | 14 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 15 | product-manager | Approved with minor changes | sha256:f419e85e725005f8da248f908b631c8ebcd5cd8741ea2b1075c39492c83f3a49 | 3c7b17d7800bf11566fd9836be3c2926d7288d8d |
| TSPEC | 15 | test-engineer | Approved with minor changes | sha256:f419e85e725005f8da248f908b631c8ebcd5cd8741ea2b1075c39492c83f3a49 | 3c7b17d7800bf11566fd9836be3c2926d7288d8d |
| PLAN | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 3 | product-manager | Approved with minor changes | sha256:8dd05e53cbb6a3a99d8d9e85b883b839df112dc01dcce7d0d19d479786dc3c2b | 0b9b0e2f004698c03e3ce0c176dbd2f24ad09372 |
| PLAN | 3 | test-engineer | Approved with minor changes | sha256:8dd05e53cbb6a3a99d8d9e85b883b839df112dc01dcce7d0d19d479786dc3c2b | 0b9b0e2f004698c03e3ce0c176dbd2f24ad09372 |
| PLAN | 4 | product-manager | Approved with minor changes | sha256:8dd05e53cbb6a3a99d8d9e85b883b839df112dc01dcce7d0d19d479786dc3c2b | 8f3ca6ce83cd4884db7551062ba94a51dfe2a759 |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:8dd05e53cbb6a3a99d8d9e85b883b839df112dc01dcce7d0d19d479786dc3c2b | 8f3ca6ce83cd4884db7551062ba94a51dfe2a759 |
| PLAN | 6 | product-manager | Approved with minor changes | sha256:0ae83f93ca4b1d338f566d4eb5776299972e9491ec7e0fdc925c92a982dfe75a | 071b931f0f8fbf442c57b5a31dcd8021379660e5 |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:0ae83f93ca4b1d338f566d4eb5776299972e9491ec7e0fdc925c92a982dfe75a | 071b931f0f8fbf442c57b5a31dcd8021379660e5 |
| PLAN | 7 | product-manager | Approved with minor changes | sha256:bc0fe69f321c14c3f541d2b012b8229fb4d4c0383201a9bd5aa83cc00232cd33 | b45e27ba6abe93b95874de29ef110f9f4237aa44 |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:bc0fe69f321c14c3f541d2b012b8229fb4d4c0383201a9bd5aa83cc00232cd33 | b45e27ba6abe93b95874de29ef110f9f4237aa44 |
| PLAN | 8 | product-manager | Approved with minor changes | sha256:1a48dd9faf0276a88d4437ad870b40770b529cc89a8341a7f73de1389c9fb135 | 8cccbee700d534e5c804f0c61a5daa6a01c39a52 |
| PLAN | 8 | test-engineer | Approved with minor changes | sha256:1a48dd9faf0276a88d4437ad870b40770b529cc89a8341a7f73de1389c9fb135 | 8cccbee700d534e5c804f0c61a5daa6a01c39a52 |
| PLAN | 9 | product-manager | Approved with minor changes | sha256:e4f11e652716495c6c8e33fad34d608f9c205e976fb2281a8ee764598245d8f3 | b655dafa1b33f97151b7e04b5fc8860023445645 |
| PLAN | 9 | test-engineer | Approved with minor changes | sha256:e4f11e652716495c6c8e33fad34d608f9c205e976fb2281a8ee764598245d8f3 | b655dafa1b33f97151b7e04b5fc8860023445645 |
| PLAN | 11 | product-manager | Approved with minor changes | sha256:ee498e59c570f9956b9fce99c855fa5e121f9d67c42dc83acf872b7d2ed3ca46 | af26cf3798e77ef99c4154e8c80eaad0ea850f58 |
| PLAN | 11 | test-engineer | Approved with minor changes | sha256:ee498e59c570f9956b9fce99c855fa5e121f9d67c42dc83acf872b7d2ed3ca46 | af26cf3798e77ef99c4154e8c80eaad0ea850f58 |
| PLAN | 12 | product-manager | Approved with minor changes | sha256:6369b88386150a8cbc7cc3d3a0576317fa1fec9eaed9bd8131013d0d0dc8acaf | f93ea141d90af7de93958cd8a64d866a22123886 |
| PLAN | 12 | test-engineer | Approved with minor changes | sha256:6369b88386150a8cbc7cc3d3a0576317fa1fec9eaed9bd8131013d0d0dc8acaf | f93ea141d90af7de93958cd8a64d866a22123886 |
| PLAN | 13 | test-engineer | Approved with minor changes | unavailable | unavailable |
| PLAN | 14 | product-manager | Approved | sha256:96f70ba771e2892c25106ab64019afe9e1bef4e4e6dca2e54b4e9f532654c53e | 50844ba5809a4c8640dcc172403841ddfd00dc76 |
| PLAN | 14 | test-engineer | Approved with minor changes | sha256:96f70ba771e2892c25106ab64019afe9e1bef4e4e6dca2e54b4e9f532654c53e | 50844ba5809a4c8640dcc172403841ddfd00dc76 |
| PLAN | 15 | product-manager | Approved with minor changes | sha256:96f70ba771e2892c25106ab64019afe9e1bef4e4e6dca2e54b4e9f532654c53e | 276c9a739000da1a46020ec3e735d78f214e398a |
| PLAN | 15 | test-engineer | Approved with minor changes | sha256:96f70ba771e2892c25106ab64019afe9e1bef4e4e6dca2e54b4e9f532654c53e | 276c9a739000da1a46020ec3e735d78f214e398a |
| PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:ddf8cbe61b12682076dc16fa870d236865c0e819d4367c97101d70c0f7fa091f | 3dc3eaad96efad9a4fd4a2bfbcb7535632d9803b |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:ddf8cbe61b12682076dc16fa870d236865c0e819d4367c97101d70c0f7fa091f | 3dc3eaad96efad9a4fd4a2bfbcb7535632d9803b |
| PROPERTIES | 3 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 5 | product-manager | Approved with minor changes | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 079872df58c80e76b637dcdd3d62705b2f29f66c |
| PROPERTIES | 5 | software-engineer | Approved with minor changes | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 079872df58c80e76b637dcdd3d62705b2f29f66c |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 2603d80f27865cc6e38572592248d0afe072ec41 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 2603d80f27865cc6e38572592248d0afe072ec41 |
| PROPERTIES | 7 | product-manager | Approved | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 533714b6a779cc9924ef0e0bed23c955a4f209c0 |
| PROPERTIES | 7 | software-engineer | Approved with minor changes | sha256:b90c97b7bc1ac48fab0b07027b1ee8c4619c61bff292ee3e4f2f4f4dc46d8da1 | 533714b6a779cc9924ef0e0bed23c955a4f209c0 |
| PROPERTIES | 8 | product-manager | Approved with minor changes | sha256:080795b53e9d997660c25911a605f675063aec14c784ad88cfffae49f497e1f8 | 9fd7ccc1dc213a6ee755cf91ba7224cbc914be90 |
| PROPERTIES | 8 | software-engineer | Approved with minor changes | sha256:080795b53e9d997660c25911a605f675063aec14c784ad88cfffae49f497e1f8 | 9fd7ccc1dc213a6ee755cf91ba7224cbc914be90 |
| PROPERTIES | 9 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 10 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 11 | product-manager | Approved with minor changes | sha256:acd2fb00734466b05c60ad5aa3c75838e75801855a8402d3fdf5c8d7c3e56bc2 | 8d0eb53f9254b2f587f6c2ff0d23c0708636d81f |
| PROPERTIES | 11 | software-engineer | Approved with minor changes | sha256:acd2fb00734466b05c60ad5aa3c75838e75801855a8402d3fdf5c8d7c3e56bc2 | 8d0eb53f9254b2f587f6c2ff0d23c0708636d81f |
| PROPERTIES | 12 | product-manager | Approved with minor changes | sha256:acd2fb00734466b05c60ad5aa3c75838e75801855a8402d3fdf5c8d7c3e56bc2 | 59d26956623684aa8873659f2d52c8d5279bc7f2 |
| PROPERTIES | 12 | software-engineer | Approved with minor changes | sha256:acd2fb00734466b05c60ad5aa3c75838e75801855a8402d3fdf5c8d7c3e56bc2 | 59d26956623684aa8873659f2d52c8d5279bc7f2 |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:e29e4bb9478661c01ab09a97a36a94221e8cfa35f0a3e156c47fbf699c2315bd | b96c44ecfa5de7e07788a0faabe250d7a8637e9d |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:e29e4bb9478661c01ab09a97a36a94221e8cfa35f0a3e156c47fbf699c2315bd | b96c44ecfa5de7e07788a0faabe250d7a8637e9d |
| DECISIONS | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 4 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 5 | product-manager | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 9b7c6d24e7c3e012959513e78a5710f40589d033 |
| DECISIONS | 5 | test-engineer | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 9b7c6d24e7c3e012959513e78a5710f40589d033 |
| DECISIONS | 6 | product-manager | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 39d14a6381000ff83e1a35ca82a43aa44c0a1f60 |
| DECISIONS | 6 | test-engineer | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 39d14a6381000ff83e1a35ca82a43aa44c0a1f60 |
| DECISIONS | 7 | product-manager | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 3b26090e1a49d0a84404adb6d3c9889e05ad9af7 |
| DECISIONS | 7 | test-engineer | Approved with minor changes | sha256:9ae2ad96b961f88a3a69aa00883b644633b8852464d52e51ddd9da7028fc9c16 | 3b26090e1a49d0a84404adb6d3c9889e05ad9af7 |
| DECISIONS | 8 | product-manager | Approved with minor changes | sha256:b9f41418f1985799600a5566ff548cae4876440301ee21c0d21e8ddc3d5e1080 | 0f8eaa9beaa36ce62d160283e90c68dab8b0cd71 |
| DECISIONS | 8 | test-engineer | Approved with minor changes | sha256:b9f41418f1985799600a5566ff548cae4876440301ee21c0d21e8ddc3d5e1080 | 0f8eaa9beaa36ce62d160283e90c68dab8b0cd71 |
| DECISIONS | 9 | product-manager | Approved with minor changes | sha256:b9f41418f1985799600a5566ff548cae4876440301ee21c0d21e8ddc3d5e1080 | bb62184b13fd66f59adafcdae067825fcd97a8af |
| DECISIONS | 9 | test-engineer | Approved with minor changes | sha256:b9f41418f1985799600a5566ff548cae4876440301ee21c0d21e8ddc3d5e1080 | bb62184b13fd66f59adafcdae067825fcd97a8af |
| DECISIONS | 10 | product-manager | Approved with minor changes | sha256:0e43e8a03d0cea614605a0bc452c6434b2e44158027004a6413ba801025f36c2 | 7b33af2605b1fcbc0335bfb6809086556d880baa |
| DECISIONS | 10 | test-engineer | Approved with minor changes | sha256:0e43e8a03d0cea614605a0bc452c6434b2e44158027004a6413ba801025f36c2 | 7b33af2605b1fcbc0335bfb6809086556d880baa |
| DECISIONS | 11 | product-manager | Approved with minor changes | sha256:b392704329fa9f3ba7f7bd746e64a813599428d307d15b51fdc0a5035cbf01ea | b935ba6b95b16cdd2f7fdaf65fcc6510d724a9b6 |
| DECISIONS | 11 | test-engineer | Approved with minor changes | sha256:b392704329fa9f3ba7f7bd746e64a813599428d307d15b51fdc0a5035cbf01ea | b935ba6b95b16cdd2f7fdaf65fcc6510d724a9b6 |
| DECISIONS | 12 | product-manager | Approved with minor changes | sha256:0c6d45b28edd56aa9ef301396ee36f88523ca65bedc68934734acdf43befad9e | 700be2971f8365b621296656d3bbf17a45fb2516 |
| DECISIONS | 12 | test-engineer | Approved with minor changes | sha256:0c6d45b28edd56aa9ef301396ee36f88523ca65bedc68934734acdf43befad9e | 700be2971f8365b621296656d3bbf17a45fb2516 |
