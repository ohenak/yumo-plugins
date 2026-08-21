# POSTMORTEM — Phase PR — pdlc-learnings-injection

**Halt class:** ERRATUM-PROTOCOL
**Halt reason (verbatim):** Phase PR halted: the delta confirmation of the PLAN erratum round did not pass — non-approving: [pm-review, te-review].
**Date:** 2026-08-21
**Branch:** `feat-pdlc-learnings-injection`

## Phase

Phase PR (pre-PR erratum channel), PLAN erratum delta-confirmation round. The erratum under
confirmation is the v1.2 edit of `PLAN-pdlc-learnings-injection.md`, which was opened with four
routed items:

| Routed item | Substance | Landed? |
|---|---|---|
| (1) | P-A-7 case C cited `92b7ea0c`, `d462ddd8`, `2cbacada` — all pre-rebase and unreachable from HEAD; PROPERTIES had re-pinned to `e7fa8d87`, `be2456c8`, `a4998e13` | yes |
| (2) | Case C read as a forward-looking rule although all four `learningsBlock.test.js` heading-form amendments and both Group D `learningsSelect.test.js` amendments are green at HEAD (26/26, 0 skips) — the table should record an outcome | yes |
| (3) | §File-ownership manifest listed fourteen test files against eighteen `learnings*` files tracked at `09c7c62f`; the four `2fc6fcd3` remediation files are owned by no LI task and appear in no row | partly |
| (4) | §File-ownership manifest omits the second-owner rows P-A-5 requires for `2fc6fcd3`'s re-capture of `fixtures/learnings-baseline/**` and `learningsBaselineGuard.test.js` | partly |

The halt is **not** about items (1) and (2) — both confirmers accept them as landed, and neither
filed against them. The halt is about items (3) and (4): the new §Post-batch remediation subsection
describes `2fc6fcd3` as having "touched six test-side surfaces" and enumerates exactly six rows,
where `git show --name-status 2fc6fcd3` lists **45 changed files**. The enumeration is short, and
the shortfall is not confined to fixture noise: it includes a second production write to
`orchestrate-dev.js`, a second write to `scripts/capture-learnings-baseline.mjs`, a rewrite of
`pdlc/workflows/package.json`'s `c8` block, and six ladder-owned suites taking a second write with
no P-A-5 second-owner row.

The distinguishing feature of this halt: the erratum edit did what it was asked, and the act of
doing it exposed that the commit it was describing had never been read in full by any layer. The
routed item named four new files; the commit added five. The routed item named two second writers;
the commit made nine. Both confirmers independently walked the commit rather than the routed list,
and both came back with the same arithmetic.

## Iterations

- PLAN cross-review iterations v1–v11 (ordinary review loop, both reviewer lenses), plus Phase CR
  round 1 (v1.0) and the round-11 delta confirmation (v1.1).
- Prior erratum rounds on this same document: **v0.6** (P-A-7 amendment-commit paragraph), **v0.8**
  (case B re-scoped to batches 9–12, case C created), **v0.9** (two targeted corrections),
  **v1.2 — the halting round**.
- Follow-up budget for this erratum: unspent at halt time.

Prior context on the same branch, same halt class: `POSTMORTEM-T` (FSPEC v7, one non-approving
channel, zero parseable `FINDING:` lines) and `POSTMORTEM-D` (FSPEC v0.8, inherited-only findings
mis-scored as delta). Both of those were **channel** failures — the confirmation was about how a
finding was expressed or scored. This one is not: both confirmations are well-formed, correctly
tagged `delta` vs `inherited`, correctly scoped `local` vs `nonlocal`, and both parse cleanly. The
protocol worked exactly as designed and caught a substantive defect. That is a different failure
class than its two predecessors on this branch, and it should not be filed with them.

## Reviewers

| Channel | Verdict | Findings | High | Medium | Low | Delta / inherited |
|---|---|---|---|---|---|---|
| pm-review | non-approving | 6 | 2 | 1 | 3 | 2 delta, 4 inherited |
| te-review | non-approving | 4 | 2 | 0 | 2 | 1 delta, 3 inherited |
| se-review | not dispatched this round | — | — | — | — | — |

Both channels are non-approving, and both non-approvals rest on a **High / delta / local** finding
about the same subsection — §File-ownership manifest → Post-batch remediation. Under DEC-ERR-03 a
delta-local High is the strongest signal the channel can send: it says the edit this round made is
itself wrong, not that something around it was already wrong. Two independent channels raising it
on the same subsection is not a coin-flip; it is a converged reading.

The inherited findings differ in count but not in character. pm-review's inherited High and
te-review's inherited High are the **same finding** on `pdlc/workflows/package.json` — arrived at
from different directions (pm from the manifest's prose exemption, te from DoD 11's stage-2 table)
and stated with different consequences (pm: "the exemption and DoD 11's silence rest on a premise
HEAD contradicts"; te: "a DoD verifier would check an exemption that no longer exists"). Neither
channel saw the other's text.

## Pattern of Disagreement

**There is no disagreement between the confirmers.** That is the finding, and it is what makes this
halt cheap to resolve and expensive to have earned.

Aligning the two channels finding-by-finding:

| # | pm-review | te-review | Relation |
|---|---|---|---|
| 1 | High/delta/local — `2fc6fcd3` "touched six test-side surfaces" but lists twenty files including nine second writes to ladder-owned files; P-A-5 requires one row per file, only two were added | High/delta/local — the commit touched 13 files under `__tests__/` (4 added, 9 modified) plus `pdlc/engine/__tests__/learnings-config-example.test.js`; six ladder-owned suites took a second write with no P-A-5 row | **Same defect, same subsection.** pm counts from the whole commit; te counts from the test tree. Both conclude the enumeration is short |
| 2 | High/inherited/local — the paragraph declares `package.json` "**not** modified" and the capture script "deliberately left outside `c8.include`"; `2fc6fcd3` modified it | High/inherited/nonlocal — same claim, traced additionally into §Overview's change-surface table and §Verification DoD 11's stage-2 table | **Same defect, different blast radius.** te's locus is strictly larger and is the correct one |
| 3 | Medium/delta/local — changelog item (3) frames the fix as fourteen rows against eighteen files; the four new rows account for seventeen. The eighteenth, `learnings-config-example.test.js`, is owned by no LI task and named in no row | (folded into te's finding 1 as "the fifth unowned new file — the one that makes the *eighteen tracked at `09c7c62f`* arithmetic reconcile") | **Same missing file.** pm files it separately at Medium; te files it inside its High |
| 4 | Low/inherited/nonlocal — changelog row 0.9 credits P-A-7's lead-in fix to "(PM v10 erratum)" when the raiser was TE v11 F-01 | — | pm-only, cosmetic |
| 5 | Low/inherited/nonlocal — rows 0.5/0.6 non-monotone | — | pm-only, cosmetic |
| 6 | Low/inherited/nonlocal — P-A-7 case A's outcome cell quotes "before batch 7" while its *When* cell has read "before batch 9" since v1.1 | — | pm-only; a v1.1 edit that moved a header without moving its derivation |
| 7 | — | Low/inherited/nonlocal — header pins REQ v0.9 / FSPEC v0.13 / DECISIONS v0.3 while this dispatch carries REQ v0.10 / FSPEC v0.14 / DECISIONS v0.5; substance unchanged, so a pin refresh not a cascade | te-only |
| 8 | — | Low/inherited/nonlocal — §Overview still counts "fourteen new test files" while eighteen are tracked; the v1.2 edit scoped §The arithmetic but left §Overview unqualified | te-only; the **same undercount** the delta High names, one section earlier |

Two structural observations about the shape of the disagreement, both of which matter more than any
individual finding:

1. **Every High is a counting claim checkable by one shell command.** `git show --name-status
   2fc6fcd3` settles findings 1 and 3. `git show 2fc6fcd3 -- pdlc/workflows/package.json` settles
   finding 2. `git ls-tree -r --name-only 09c7c62f | grep learnings` settles finding 8. No
   judgement, no lens, no severity argument — this round produced zero contested findings, and both
   confirmers said so implicitly by giving verifiable commands instead of arguments.
2. **te-review's finding 1 closes with the disposition, unprompted:** *"the subsection's
   single-writer argument already covers every one of them, so only the enumeration is short."* The
   reasoning the subsection gives — one serial commit, landing after batch 13, no batch in flight,
   no concurrent agent — is correct and generalises over all nine second writes. Nothing about the
   safety argument needs rework. This is a **completeness** halt, not a **correctness** halt, and
   the confirmer named that distinction before anyone asked.

The one place the channels genuinely diverge is arithmetic bookkeeping, and it is instructive:
pm says "twenty files", te says "13 under `__tests__/` plus one under `pdlc/engine/__tests__/`", and
the commit actually lists 45 paths. Both undercounts come from the same source — the 18
`fixtures/learnings-baseline/PIPELINE-NON-AUTHORING-PROMPTS/*.txt` files that the manifest
legitimately collapses into one directory row. Neither confirmer is wrong about what matters; both
are counting the surfaces that need rows, not the paths in the diff. That the two arrived at
different totals while agreeing on every named file is the signature of independent verification.

## Best-Guess Root Cause

## Recommendation

## Traceability

## Resolution
