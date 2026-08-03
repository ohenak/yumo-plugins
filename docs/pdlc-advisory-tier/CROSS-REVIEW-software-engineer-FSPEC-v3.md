# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review of FSPEC v1.2 (`502c070`) against the v1.1 I reviewed (`a19e7ac`), the
repository at the FSPEC's own citation pin `26c3f1c`, and my v2 cross-review
`CROSS-REVIEW-software-engineer-FSPEC-v2.md`. Only the eight commits between those two revisions
were re-read (`git diff a19e7ac..502c070` — 31 insertions, 21 deletions across §0, §4.1, §6.6,
§9.4, §10.2, §10.3, §10.6, §12.1, §12.3, §14.1, §14.2, §15.2, §16.1, §18.1, §18.3). Sections the
revision did not touch are not re-litigated.

## Disposition of v2 findings

**All seven v2 findings are resolved** — the three Mediums that gated approval, and all four Lows.
Evidence, so no later round re-opens them:

| v2 id | Sev | Resolved by | Verified |
|---|---|---|---|
| M-01 | Medium | §4.1's flow gains step `3b. RE-CHECK` between GATE and ACT and a third terminal (`NO-ACTION: nothing applied, nothing refused; no §11 entry, and the pipeline continues from its own re-read`); §15.2's run diagram gains the matching lifecycle string and `no-action` line. | yes — the disposition an implementer reads off the diagram now matches V-7 for the case I named, and the step that produces it is placed, not merely asserted. See L-05/L-06 for two residues the new step opens |
| M-02 | Medium | §10.3 gains **S-5**: each pipeline's summary covers the seams it owns, a queue invocation that produces no `orchestrate-dev` run carries A1/A2 on the queue's own run report, a dev report's A1/A2 rows are therefore always zero, and both reports still list all five seams — which is what makes §12.2's enabled-vs-disabled discriminator decidable for a queue-only invocation. T-08-8 asserts the queue-report half. | yes — and the queue does return a report object to carry it (`orchestrate-queue.js@26c3f1c:1039-1052`), so S-5 names a real artifact. T-08-6's "four with zero counts" now has a stated reason |
| M-03 | Medium | §10.2 H-2b now defines persistence as **durable, not merely written**, on A2-6's terms: committed on the branch the queue invocation runs on, scoped to that one record file, not pushed — with the two consequences named (lost by a checkout; an untracked file under `docs/` is walked by the document oracles). T-08-8 asserts committed / scoped / not pushed / a second process reading that branch's head finds it. | yes — and the discipline it adopts is one the queue already ships (`commitQueueRow`, pathspec-scoped, never `-a`, never pushed: `orchestrate-queue.js@26c3f1c:84-87, 337-346`), so this is reuse, not a parallel mechanism |
| L-01 | Low | S-3 extended: the summary names the no-checks outcome (A5-6) **and** the completion-cap outcome when the phase halted on it without A5 firing (A5-9). | yes |
| L-02 | Low | T-08-4 rewritten to the production path — the distil step's own delete, refusal **names the artifact class**, record survives with entries intact, run report names the refusal — and T-08-4b added as the unit-scoped assertion over the guard itself. | yes, and the split is better than the single test I asked for: the shipped guard's message names only CROSS-REVIEW and CODE_REVIEW (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:56-62`), so a build that extends the matching without the text now fails T-08-4 |
| L-03 | Low | T-08-10 re-Given on three named seams and re-Then'd as five literal seam rows plus a literal total (A1 0/0/0/0, A2 0/0/0/0, A3 1/0/0/1, A4 1/1/0/0, A5 1/0/1/0, total 3/1/1/1), with the identity asserted on each of the six rows. | yes — arithmetic re-checked, all six rows satisfy `invocations == resolved + escalated + no-action`, and the per-seam scope error is gone |
| L-04 | Low | AT-2's enumeration gained T-03-7, T-07-11 and T-09-8. | partially — see L-08; the enumeration is closer but still not the whole set it claims to be |

Arithmetic re-checked after the revision: §18.1's per-series counts (7, 6, 10, 10, 6, 6, **12**,
**11**, 8, 5) sum to the stated **81**, and both changed rows match their owning section — §9.4 now
runs T-07-1 … T-07-12, §10.6 runs T-08-1 … T-08-10 plus T-08-4b. §14.1's two changed cells and
§16.1's `S-1 … S-5` register row follow.

## Findings

**No High and no Medium findings.** Five Lows, all inside text this revision changed, all
single-line edits. Ids continue v2's `L-` sequence so they never collide.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-05 | Low | Local | **The new terminal covers one of V-7's two causes of `no-action`.** V-7 defines `no-action` as an invocation that applied and refused nothing *"because the seam condition was gone before anything was applied, **or because the seam's own inputs held nothing to act on**"* — and it cites §6.5's "no drift found" for the second cause: an A2 candidate whose REQ has no citations, where the proposal is empty though the seam condition (a `needs-human` stop) never went away. §4.1's new `3b. RE-CHECK` asks only *"does the seam condition still hold?"*, and the third terminal reads *"step 3b finds the condition gone"*, so the empty-proposal case has no path in either diagram. The nearest row an implementer lands on is §4.4's *"The agent proposes 'nothing' with high confidence → not a resolution … the invocation escalates"* — which for §6.5's case would write an `ESCALATIONS.md` entry for a candidate with nothing to fix, contradicting §6.5's own stated disposition. The two rows are distinguishable on their antecedents (a live condition the agent declines to act on, versus no condition to act on), and V-7 is normative and explicit, so nothing here is unbuildable. **Resolution:** widen 3b's question, or give the terminal a second inbound arm naming the empty-proposal case, so the diagram and V-7 enumerate the same two causes. | §4.1, §4.3 V-7, §4.4, §6.5 |
| L-06 | Low | Local | **"consumes no attempt" is ambiguous about the attempt that already ran.** The new 3b branch reads `no-action (nothing applied, nothing refused; consumes no attempt)`. But 3b sits after DIAGNOSE and VALIDATE, so by the time it fires, attempt 1 has dispatched an agent and received a verdict. §4.4's row is narrower and consistent — *"The **re-read** consumes no attempt"* — but the diagram's phrasing reads as *the invocation* consuming none, which would report a no-action invocation with an attempt count of 0 while a malformed verdict at the same depth consumes one (V-4). Nothing asserts either reading: T-08-10 pins the disposition counters, not attempts. **Resolution:** say whose attempt is meant — e.g. *"the re-check consumes no attempt of its own"* — since the invocation's attempt count is what §10.1's record and V-5's budget both read. | §4.1 step 3b, §4.4, §4.3 V-4/V-5 |
| L-07 | Low | Local | **H-2's closing sentence says "deferral" for a path its own new sentence correctly calls a refusal.** The revision added, and I verified against the pin, that where Phase MERGE's CI evidence is not satisfied *"on the pending-CI path that is a plain **non-escalating refusal**, not a merge-escalation notice"* — exactly right: `ciRule` returns `{result: "refused", row: "10", reason: "CI is pending", escalate: false}` (`orchestrate-dev.js@26c3f1c:772-774`), guard 11 maps that to `mergeStatus: "refused"` with an empty `escalations` array (`:938-953`), and the only CI-shaped escalation is the *absent*-checks one (`:950`, `MERGE_ESCALATIONS.ci` at `:1323-1325`). But H-2's last sentence still says an operator *"should expect a **deferral** on runs where a seam fired"*. `deferred` and `refused` are distinct values of the same shipped enum (`:977`, `:993` vs `:944`; CLAUDE.md's `merged / deferred / refused / skipped`), so the report an operator actually reads will say `refused`, not `deferred`. H-2 is tested only up to the pushed commit and the PR, so nothing downstream breaks — but it is a claim about shipped behaviour that is one word wrong. **Resolution:** make the closing sentence say `refused`, or say "declines" and let the preceding sentence carry the enum value. | §10.2 H-2 |
| L-08 | Low | Local | **AT-2's enumeration is still not set-equal to the escalating cases.** The revision added T-03-7, T-07-11 and T-09-8, which closes the three I named — but T-02-2 (`escalated`, reason `low-confidence`), T-02-4 (budget exhausted on unparseable verdicts) and T-02-5 (`escalated`, reason `budget-exhausted`, preempted attempt) are escalating cases that are still absent, while T-07-11 — whose Then is also just "escalated with reason `budget-exhausted`" — is now present. Coverage is not lost (T-02-6's for-each over §5.3 asserts the V-8 triple for every reason), but §18.2 makes completeness-by-enumeration this document's own standard, and the list's membership criterion is unstated: if it is "tests that assert the V-8 triple" then T-02-6 alone suffices and several listed ids are surplus; if it is "every test whose Then contains an escalation" then three are missing. **Resolution:** state the criterion in AT-2's row and make the list satisfy it. | §18.3 AT-2 |
| L-09 | Low | Local | **T-07-12's third Then has no literal expected value.** The new NFR-4 discriminator is welcome and its first two Thens are concrete and falsifiable — *reached its full `attemptBudget` cycles*, *did not escalate `budget-exhausted` on the first cycle* — and they are exactly what fails under an implementation that counted rollup wait. The third, *"its terminal disposition is the one its last re-poll earned"*, is a restatement of the rule rather than an expectation: the Given does not fix the final re-poll's colour, so the clause cannot be evaluated without asking the system what it did. **Resolution:** fix the last re-poll in the Given (green or red) and transcribe the resulting disposition literally, the way T-07-11 does with `escalated` / `budget-exhausted`. | T-07-12, §14.2 NFR-4 |

## Questions

Q-07 is answered by H-2's rewrite and needs no reply. Q-08 (the citation pin `26c3f1c` is not an
ancestor of `feat-pdlc-advisory-tier`; the branch forks at `7cdfbb0`, where
`pdlc/workflows/orchestrate-dev.js` is 2,139 lines against 8,527 at the pin) is unchanged and still
worth an answer before implementation starts — nothing in the document needs to change either way.
One new one:

| ID | Question |
|---|---|
| Q-09 | H-2b and A2-6 both commit to *"the branch the queue invocation is running on"*, unpushed. In this repo the queue is normally driven from the default branch, so a queue invocation that re-grounds a REQ or records an A1 hold leaves a local, unpushed commit on `main` — after which `git pull --ff-only` fails until the operator resolves the divergence. That is a consequence of A2-6, which I accepted in v2 and am not re-opening; the question is whether the TSPEC should name where those commits are expected to land (a dedicated branch? the candidate's future `feat-` branch?), because H-2b now doubles the number of files that ride that commit and the record is meant to survive *"until that feature's own pipeline later reaches Phase PUB"* — potentially many pulls later. |

## Positive Observations

## Recommendation

## Verdict
