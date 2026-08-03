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

## Questions

## Positive Observations

## Recommendation

## Verdict
