# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review of FSPEC v1.1 (`a19e7ac`) against the v1.0 I reviewed (`0d07cea`), the
repository at the FSPEC's own citation pin `26c3f1c`, and my v1 cross-review
`CROSS-REVIEW-software-engineer-FSPEC-v1.md`. Only the changed sections were re-read; §1, §2, §7,
§13 and the unchanged parts of §11 and §17 are not re-litigated.

## Disposition of v1 findings

**All thirteen v1 findings are resolved.** Recording the evidence so no later round re-opens them:

| v1 id | Sev | Resolved by | Verified |
|---|---|---|---|
| F-01 | High | §10.2 H-1 (distil after PUB **and before Phase MERGE**) + H-2, which now states the observable in full: the delete and the LEARNINGS append are committed and pushed, the PR shows them, the head Phase MERGE evaluates is one commit beyond the checked head, and Phase MERGE defers or refuses under its own preconditions. T-08-3 updated to assert it. | yes — and the deferral claim holds against the shipped ladder: `orchestrate-dev.js:985-999` at `26c3f1c` returns `mergeStatus: "deferred"`, reason `PR not mergeable (…)`, for a `BLOCKED` state |
| F-02 | High | §9.2 A5-8 defines "revert" at A5 on **content**, not history: check and record complete before the push, nothing is force-pushed, a still-red re-poll leaves the fix commit on the branch and escalates. §4.1's new paragraph pins the step order, §16.2 BR-5 now asserts the invariant on the pre-push tree, T-07-6 updated. | yes |
| F-03 | High | §4.3 V-5 and §9.2 A5-3 both state that time waiting on the rollup does not count against `seamBudgetMinutes`, and say why — otherwise the shipped 10-minute default ends every A5 invocation inside attempt 1 and `attemptBudget` never binds (`CI_COMPLETION_TIMEOUT_MS = 30 min`, `orchestrate-dev.js:35`). V-5 also now pins preemption, and T-02-5 asserts the attempt count is 1. | yes — the choice is named, not left open |
| F-04 | High | §10.2 H-2b scopes H-2's absence observable to dev-side runs and states that a queue-side record deliberately persists until that feature's own run reaches PUB; §10.5 gains the queue row and §10.6 gains T-08-8. | yes (see M-02/M-03 below for two residues the new rule opens) |
| F-05 | High | §10.3 S-1 — the summary is carried on **every** report the run produces, including a halt's; §17.2's row rewritten; T-08-9 added. | yes; the halt path does build a report, so this is now consistent with the code |
| F-06 | High | §15.2's prologue rewritten to lazy resolution, §3.3 row 2 extended, T-01-7 added as the run that distinguishes lazy from eager, §17.2's fallback row no longer says "in §15.2's prologue". §3.2/§3.3/§12.2/§15.2 now agree. | yes |
| F-11 | Medium | §10.2 H-3 — the delete "goes through the channel the guard covers rather than around it", and the refusal "names the artifact class it refused". | yes at the rule level (T-08-4 was not tightened to match — L-02 below) |
| F-12 | Medium | §10.1 R-2 reworded to "a precondition of an action **surviving**", with the §4.1 paragraph explaining why step 7 is last and what changes at A5. | yes |
| F-13 | Medium | §6.3 A1-2 reframed as defence in depth over an unreachable state; §5.4's A1 row is now **none** with the reason; T-04-3 split into a reachable integration assertion and a unit-scoped T-04-3b, each labelled. | yes — and the split is the right shape |
| F-14 | Medium | §9.2 A5-9 (A5 does not fire on the completion-cap halt; the outcome is named in the summary), §9.3 split into the pre-seam and in-invocation cases, T-07-10 added. | yes (S-3 was not extended to match — L-01 below) |
| F-15 | Low | §5.2 X-d now carries the A1/A2 clause. | yes |
| F-16 | Low | §5.2 E-1 now states plainly that it does not attempt to decide flakiness and is bounded by budget alone. | yes |
| F-17 | Low | §9.2 A5-1 now states the comparison is authoritative on the reading it gets, and that a flaky-on-default check is deliberately escalated. | yes |

Arithmetic re-checked after the revision: §18.1's per-series counts (7, 6, 10, 10, 6, 6, 10, 10, 8,
5) sum to the stated **78**, and every range matches the owning section's table.

## Findings

New findings only, and all of them arise inside text this revision changed. Ids are prefixed `M-`/`L-`
so they never collide with v1's.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **§4.1's flow diagram still has exactly two terminal branches, but V-7 now has three.** The revision adds `no-action` as a third terminal disposition (§4.3 V-7) and threads it through §4.4, §6.5, §8.3, §9.3, §10.3 S-1, §15.3 F-4 and T-08-10. §4.1's diagram — the document's canonical picture of one invocation — was not touched: it still ends `├─ all of 1..7 succeed ────► RESOLVED` / `└─ any refusal, or budget exhausted ────► ESCALATED`. A `no-action` invocation is neither: it did not complete steps 4–7, and it carries no refusal reason from §5.3. An implementer working from the diagram has only one place to put it — ESCALATED — which writes an `ESCALATIONS.md` entry for a seam that refused nothing (§11.1 L-3) and breaks the `invocations == resolved + escalated + no-action` identity S-1 and T-08-10 exist to pin. **Resolution:** give the diagram its third terminal, and say at which step the seam-condition re-check that produces it happens (§4.4's first two rows imply it is between DIAGNOSE and ACT, but the diagram is where an implementer will look). §15.2's summary diagram has the same omission. | §4.1, §4.3 V-7, §15.2 |
| M-02 | Medium | Local | **The summary now has no determinate home for the queue-side seams.** S-1 requires the report to carry all five seam rows A1–A5. H-2b (new) establishes that a queue invocation which holds, escalates, or only re-grounds a candidate produces **no `orchestrate-dev` run at all** — so no dev-side final report exists to carry the A1/A2 row for that invocation, and the queue's own run report is a different artifact. The document never says which report carries the summary in that case. Three things depend on the answer: §12.2's "the summary's presence distinguishes enabled-but-unexercised from disabled" is undecidable for a queue-only invocation; T-08-8 asserts the record exists but is silent on the summary, so the gap is untested; and for a dev-side run the A1/A2 rows must then be *always* zero, which makes T-08-6's "four of them with zero counts" true for a reason the document does not state. **Resolution:** one rule in §10.3 saying which report carries the summary for a queue-side invocation and what a dev report's A1/A2 rows mean, plus a queue-side case in §10.6. | §10.3 S-1, §10.2 H-2b, §12.2, T-08-6, T-08-8 |
| M-03 | Medium | Local | **H-2b says the queue-side record "persists", but nothing says it is durable — and A2-6 shows the author knows the difference.** The revision added A2-6 precisely because an applied re-grounding must survive into a *fresh process*: it is committed, scoped to the one REQ file, not pushed, and the observable is that the branch head carries it. The record H-2b asks to survive far longer — until that feature's own pipeline later reaches Phase PUB, potentially across branches and days — gets no equivalent clause, and T-08-8 only asserts existence "when the invocation ends". As written an uncommitted `docs/{feature}/ADVISORY-{feature}.md` satisfies both. Two concrete consequences in this repo: any checkout or clean loses the operator's standing account of why the candidate was not picked; and an untracked file under `docs/` is walked by the document-drift oracle, which skips only `.git/` and `node_modules/` (`pdlc/workflows/lib/document-oracles.mjs:77` `WALK_SKIP_DIRS`, `:149` `coveredViolations`) — the "red locally, green in CI" hazard CLAUDE.md warns about. **Resolution:** state for the queue-side record what A2-6 states for the REQ — committed on which branch, scoped to which path, pushed or not — and assert it in T-08-8. | §10.2 H-2b, §6.4 A2-6, T-08-8 |
| L-01 | Low | Local | **A5-9 requires a summary line that §10.3's S-series does not enumerate.** A5-9 (new) says the completion-cap outcome is "named in the advisory summary the way A5-6 names no-checks", but S-3 still names only the A5-6 no-checks outcome. §10.3's S-rules are the summary's enumerated contract, and §18.2 makes completeness-by-enumeration this document's own standard. The observable is unambiguous in A5-9 and T-07-10, so nothing is unbuildable — the enumeration is simply one row short. **Resolution:** extend S-3, or add S-5 for the completion-cap outcome. | §10.3 S-3, §9.2 A5-9 |
| L-02 | Low | Local | **T-08-4 was not tightened to H-3's new observable.** H-3 now requires the refusal to "name the artifact class it refused"; T-08-4 still asserts only "refused with the guard's message". The shipped guard's message names only CROSS-REVIEW and CODE_REVIEW (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:56-62`, with the in-scope gate at `:35` and the token extraction at `:43`), so a build that extends the guard's *matching* to `ADVISORY-*` without touching its *text* passes T-08-4 and violates H-3. **Resolution:** make T-08-4 assert the refusal names the artifact class. | §10.2 H-3, T-08-4 |
| L-03 | Low | Local | **T-08-10's "3 / 1 / 1 / 1 … per seam and in total" cannot hold per seam.** Its Given is three invocations with three different dispositions, which (by F-3, one invocation per seam condition per run) means three different seams; each seam's row is then 1/1/0/0-shaped and only the total row is 3/1/1/1. The literal-value transcription is right and welcome — the scope qualifier is what is wrong. **Resolution:** apply the literal 3/1/1/1 to the total row and keep the identity assertion per seam and in total. | T-08-10 |
| L-04 | Low | Local | **§18.3's newly enumerated AT-2 list omits an escalating case it claims to cover.** AT-2 is "every escalation, whatever its cause", and the revision replaced "and each seam's escalating case" with an explicit list. T-03-7 (`post-action-verification-failed`) and T-09-8 (escalation with a failed log write) are escalating cases that are not in it. T-02-6's for-each over §5.3 covers the reasons regardless, so coverage is not actually lost — but an enumeration that claims to be the whole set should be the whole set. **Resolution:** add T-03-7 and T-09-8, or restore an explicit "and each seam's escalating case" tail. | §18.3 AT-2 |

## Questions

v1's Q-01 (probe cost) is answered by the move to lazy resolution and needs no reply. Q-02 … Q-06
are not re-asked here; none of them blocks approval and the revision did not change the text they
concern. Two new ones, both about the changed text:

| ID | Question |
|----|---------|
| Q-07 | H-2's post-PUB push means the branch head moves after the checks Phase PUB polled went green, so a repo with `mergeMode` on will re-run CI and, per the shipped ladder, defer. Is a `MERGE ESCALATION:` notice expected on those runs, or only the plain deferral note? §11.2 and T-09-5 go to some trouble to keep the merge notice catalogue unchanged and distinguishable from advisory notices, so it would be worth one sentence saying which of the two an operator should expect to see, and that it is not an anomaly. |
| Q-08 | **Branch-state observation, not a finding.** The FSPEC pins its citations to `26c3f1c`, which I re-verified — but that commit is *not* an ancestor of `feat-pdlc-advisory-tier`. The branch forks at `7cdfbb0`, where `pdlc/workflows/orchestrate-dev.js` is 2,139 lines; at the pin it is 8,527. Every §2 line citation therefore points into a file the implementation tree does not contain. Phase DOD's step-0 rebase would close the gap, but implementation happens first. Is the intent to rebase onto the default branch before implementation begins? Nothing in the document needs to change either way — the pin is correctly declared — but the answer decides whether the seams are findable when someone starts building. |

## Positive Observations

- **Every one of the six High findings was answered by choosing, not by hedging.** F-03 and F-06 in
  particular could have been closed with "the TSPEC will decide"; instead V-5/A5-3 name which bound
  excludes the rollup wait and *why*, and §15.2 was rewritten to lazy with T-01-7 added as the run
  that observably distinguishes the two. That is the expensive way to close a finding and the right
  one.
- **A5-8 is a better answer than the one I asked for.** I offered two options — define revert for a
  pushed commit, or move the push after RECORD. The revision took a third: define revert on the
  branch's *content*, assert BR-5 on the pre-push tree, and state plainly that the fix commit stays
  on the branch and is named in the escalation. It is honest about the residue instead of pretending
  the tree is restorable, and T-07-6 now asserts the residue rather than the fiction.
- **F-13's fix models something worth copying.** Splitting T-04-3 into a reachable integration
  assertion and a unit-scoped T-04-3b, each labelled with *why* it exists, is exactly how a
  defence-in-depth rule should be tested — and A1-2's rewrite ("may never be **honoured**", not "may
  never be returned") fixes the vacuity at its root rather than at the test.
- **The `no-action` disposition is a real improvement, not a bookkeeping change.** V-7 previously
  forced "the condition disappeared" into `resolved` or `escalated`, both of which would have lied.
  The new third value plus S-1's `invocations == resolved + escalated + no-action` identity, pinned
  by literal values in T-08-10, makes the summary arithmetic falsifiable. M-01 is the one place the
  change did not reach.
- **The new set-equality tests are the right ones.** T-03-8 pins the permitted-action and exclusion
  sets, and its clause about capability-absent actions still being members (refused per A5-2) closes
  the loophole where a capability-parameterised comparison would silently shrink the set. D-6's
  rewrite from "no file this feature introduces" to set-equality against a baseline run is the same
  move, and it catches the third artifact nobody has thought of yet.
- **NFR-5's split is intellectually honest.** Saying that "no new credentials" has *no* observable at
  a seam, and routing it to TSPEC as a design constraint, is better than inventing a test that would
  pass vacuously. Most specs would have pointed it at T-03-6 and moved on.
- **§10.2 H-2 now states the cost it imposes rather than hiding it** — an operator with merges enabled
  should expect a deferral on runs where a seam fired, and the document says so in the same breath as
  the trade it is making. That sentence is what turns F-01 from a gap into a decision.

## Recommendation

**Needs revision**

Zero High, three Medium, four Low. This is a large step: all six High and all four Medium findings
from v1 are closed, and closed by decision rather than deferral. The document is now, in my
judgement, one editing pass from approval — nothing below requires re-thinking a design, and no
finding asks for material that belongs to TSPEC.

To reach approval, v1.2 must close the three Mediums:

1. **M-01** — give §4.1's flow diagram (and §15.2's) the third terminal that V-7 now defines. Without
   it the only home for a `no-action` invocation is ESCALATED, which writes an escalation entry for a
   seam that refused nothing and breaks the identity S-1 and T-08-10 exist to pin. One line of ASCII
   plus a note on which step produces it.
2. **M-02** — say which report carries the advisory summary for a queue-side invocation that produces
   no `orchestrate-dev` run, and what a dev report's A1/A2 rows mean. H-2b makes that case explicit
   for the record; S-1 needs the same split, and §10.6 needs a case for it.
3. **M-03** — state for the queue-side record what A2-6 states for the re-grounded REQ: committed on
   which branch, scoped to which path, pushed or not. "Persists" is currently satisfied by an
   untracked file, which is neither durable nor inert in this repo.

The four Lows (L-01 … L-04) are single-row edits — an S-rule for A5-9's summary line, T-08-4's
refusal text, T-08-10's per-seam qualifier, and two ids missing from AT-2's new enumeration. They are
worth doing in the same pass but would not on their own gate approval.

Upstream defects are not folded into this verdict. The REQ has not been revised since my v1
(`git log` shows no commit touching `REQ-pdlc-advisory-tier.md` in this round), so the three errata I
raised then are re-emitted unchanged in my final message, with AC-1.7's narrowed to the divergence
the FSPEC's new V-5 wording now creates.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 3, "low": 4}
