# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
**Date:** 2026-08-22
**Iteration:** 2
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding

**The round-1 review carried no findings to verify.** The delta protocol assumes a prior findings
table to re-check. `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` has none: the file is 49 lines,
its `## Findings`, `## Questions`, `## Positive Observations` and `## Recommendation` headings are
all present and all **empty**, and `grep -n VERDICT` over it returns nothing. Its Grounding section
closes with "findings below about three specific seams" — sentences that were never written. The
write was truncated after the Grounding commit (`1b9de7c0`) and no later commit filled it in.

Consequence for this round, stated plainly so the record is honest: there were **zero prior blocking
findings**, so "verify each prior finding is resolved" is vacuous. I therefore scoped this round to
the second half of the protocol — *did the revision break anything* — over the actual diff, and
re-verified the delta's own factual claims. That is a narrower scope of attention, not a lower
standard. It is also recorded as F-01 below, because a review file committed with an empty findings
table and no `VERDICT:` line is durable process signal, not a one-off.

**The delta.** `git diff 1b9de7c0 HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` is
27 insertions, 10 deletions across two hunks: the lineage header (`Version` 1.0 → 1.1,
`Cross-Reviews` "(none yet)" → the v1 filename), and a rewrite of the routed-findings prose in
`## Gaps, Risks and Routed Findings` into a four-row re-verification table plus two closing
paragraphs. No property, oracle, fixture, or matrix row changed. Nothing was deleted from the
property set.

### Every claim in the delta, re-checked against the documents at HEAD

The delta's whole substance is a claim that three of four previously-routed errata are now closed by
their owners and one remains open. I re-ran that adjudication myself rather than taking the table's
word for it. All four verdicts hold:

| Delta's claim | Check I ran | Result |
|---|---|---|
| TSPEC §5.7 still says "default run count"; no `numRuns`/`500` anywhere in TSPEC | `grep -n "numRuns\|500\|default run count" TSPEC` | One hit, `TSPEC:830`, `at fast-check's default run count`. No `numRuns`, no `500`. **Still open — holds.** |
| PLAN T-08 pins 500 and cites round-1 F-06 | `grep -n "numRuns\|500" PLAN` | `PLAN:120` pins `fc.assert(fc.property(…), { numRuns: 500 })`; `PLAN:18` records "T-08 pins `numRuns: 500` on its precedent (F-06)". **Holds** — the two parents do disagree. |
| TSPEC §5.4's AT-14 row now reads `repo-state`, matching FSPEC | `grep -n AT-14` on both | `TSPEC:757` files AT-14 at `repo-state`; `FSPEC:387` reads "AT-14 — the record never becomes tracked content (REQ-WVR-10)". **Closed — holds.** |
| PLAN §4.1 maps AT-14 → T-03 → `waveResumeRepoState.test.js`, and T-03 carries the three conjuncts verbatim | `grep -n AT-14` on PLAN | `PLAN:318` is exactly that row; `PLAN:117` (T-03) carries line-equality, root-anchoring and the `check-ignore -v` conjunct. **Closed — holds.** |
| TSPEC §2.4 vs §5.4 on `startWave` is not reproducible | read §2.4's notice table and §5.4 AT-06 | §2.4's rejected-value row says the pointer is discarded and no resume decision follows; `TSPEC:565` states `startWave: 1` is "indistinguishable [from] unset (FSPEC AT-06)"; `TSPEC:749` AT-06 compares two configs differing in exactly that key. The two sections agree. **Not reproducible — holds.** |

I am satisfied the document did not re-raise a settled question, which is the DEC-ERR-01 failure mode
this rewrite exists to avoid. It also did not quietly drop the one item that is genuinely still open —
it routes it, and I route it too (see the `ERRATUM:` line in my response).

### PLAN task coverage — set equality, re-checked

`grep -oE "^\| T-[0-9]+" PLAN | sort -u` yields exactly `T-01, T-02, T-03, T-04, T-07, T-08, T-10`
— seven ids. The PROPERTIES "PLAN task → properties" table (`PROPERTIES:517–523`) carries exactly
seven rows, one per id, no extra and no missing. **Set equality holds in both directions.** The
revision additionally closed the one thing my v1 Grounding flagged as reader-confusing without
filing it: `PROPERTIES:525–526` now states that `T-05`, `T-06` and `T-09` are retired at PLAN v1.1
and not reused, so a reader tracing the gap is no longer left guessing.

### Every named test file, re-checked against the tree and `origin/main`

| File | Document's status | What I found |
|---|---|---|
| `waveExecution.test.js` | exists, extended in place | present in this tree **and** at `origin/main`. Holds. |
| `advisoryHelperProperties.test.js` | exists at `origin/main`, precedent only | present at `origin/main`, **absent** in this tree (pre-rebase). Holds exactly as stated. |
| `waveResume.test.js`, `waveResumeRepoState.test.js`, `waveResumeQueueParity.test.js`, `waveResumeProperties.test.js`, `waveResumePreflight.test.js` | **new** | no match in this tree or at `origin/main`. All five are declared new and each is owned by exactly one PLAN row (T-02, T-03, T-04, T-08, T-01). Holds. |

Every named file either exists or is explicitly planned as new, with an owning task. No file is
named that no task creates, and no task creates a file the document does not name.

## Delta Reviewed

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
