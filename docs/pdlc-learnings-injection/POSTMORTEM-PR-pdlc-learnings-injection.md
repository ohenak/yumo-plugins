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

**The erratum edit described the routed list instead of the commit.**

The routed item said: *"§File-ownership manifest omits the four `2fc6fcd3` remediation files and the
second-owner rows P-A-5 requires for that commit's re-capture of `fixtures/learnings-baseline/**`
and `learningsBaselineGuard.test.js`."* The v1.2 edit added exactly four new-file rows and exactly
two second-writer rows, wrote "touched six test-side surfaces", and stopped. The number six is not
an observation about `2fc6fcd3`; it is `4 + 2` from the routed item's own sentence, restated as if
it were a measurement. Every one of this round's Highs falls out of that single substitution:

- Six surfaces claimed, 45 paths in the commit — te finding 1, pm finding 1.
- Four new files rowed, five added — pm finding 3, te finding 1's fifth file.
- Two second writers rowed, nine present (`orchestrate-dev.js`, `capture-learnings-baseline.mjs`,
  `.gitignore`, and the six suites `learningsSelect`, `learningsCaptureScript`, `learningsConfig`,
  `learningsDispatchSet`, `learningsArmInventory`, `learningsCorpus`) — pm finding 1, te finding 1.
- `package.json` untouched per the manifest's prose, rewritten in the commit — pm finding 2, te
  finding 2. This one was never in the routed list at all, so describing the routed list could not
  possibly have surfaced it.

The `package.json` finding is the load-bearing one for the root cause, because it is the one no
amount of care with the routed items would have caught. `2fc6fcd3` set `allow-external: true`,
re-anchored all four `c8.include` entries as `**/` paths, added
`**/scripts/capture-learnings-baseline.mjs` to the include set, and added a three-glob `exclude`
block. The PLAN still says the file is "**not** modified" and that the capture script is
"deliberately left outside `c8.include`". At HEAD the script is *inside* the per-file branch floor
it is documented as exempt from; DoD 11's stage-2 table names three modules where the gate measures
four. A DoD verifier reading the PLAN would verify an exemption that no longer exists — and would
pass, because absence-shaped claims are the ones a verifier cannot falsify by looking at the thing
they describe.

**The second-order cause: P-A-5 was answered as a rule and then applied as a checklist.** P-A-5's
answer is unambiguous — *"one added row per file, naming the causing task and its batch, committed
before the re-capture runs."* Its scope is "every file the re-capture writes", which is a set to be
computed from the commit. The edit treated it as a list to be transcribed from the raise. The rule
survived; its input did not. The manifest is defined over the filesystem, and any process that
populates it from prose rather than from the tree will be short by exactly the files nobody thought
to mention.

**Why the ordinary review loop did not catch it earlier.** §Overview has said "fourteen new test
files" since v0.1, and the manifest has carried fourteen test rows since v0.3. Fourteen was true
when written. `2fc6fcd3` landed after batch 13, outside the ladder, in a phase whose review
attention was on P-A-7's case table — and no gate recomputes a manifest count against the tree.
te finding 8 is precisely this: the v1.2 edit scoped §The arithmetic to the two dispatcher-parsed
tables and left §Overview's fourteen unqualified, so the document now states two different counts
of the same set in two sections. The undercount was not introduced by this round; it was *made
visible* by this round, which is what an erratum round is for.

**What is not the cause.** The single-writer safety argument is sound — te-review says so
explicitly. Batch-safety rule 2 is preserved, not excepted: `2fc6fcd3` is one serial commit landing
after batch 13 with no batch in flight, so no batch ever holds two writers on any of the nine files.
The decision to give the remediation table a `Landing commit` column instead of an `Owner` column is
correct and was not challenged. The pin refresh (te finding 7) is genuinely cosmetic — the
substance is unchanged at the dispatched versions, and the confirmer said so rather than inflating
it to a cascade. Nothing in the case A/B/C table, the batches 7–13 ledger, or any `Deps` edge is
implicated. **The document's reasoning is right and its enumeration is short**, which is the
cheapest possible way for this to be wrong.

## Recommendation

**Verdict: re-open the erratum, land one more round on the PLAN, do not re-open PLAN review.**

All ten findings are mechanical corrections to one document. No upstream artifact moves; no task
moves batch; no `Deps` edge changes; no AT partition, fixture, or ledger row is touched. The
follow-up budget for this erratum is unspent. This is a v1.3 edit, not a cascade.

### Must-fix before re-confirmation (both Highs, both channels)

1. **Re-derive §Post-batch remediation from the commit, not from the raise.** Replace "touched six
   test-side surfaces" with the count taken from `git show --name-status 2fc6fcd3`, and add one row
   per file P-A-5 requires:
   - the fifth new file, `pdlc/engine/__tests__/learnings-config-example.test.js` — the one that
     makes the eighteen-tracked-at-`09c7c62f` arithmetic reconcile (pm 3, te 1);
   - second-writer rows for the six ladder-owned suites `learningsSelect` (LI-07),
     `learningsCaptureScript` (LI-03), `learningsConfig` (LI-12), `learningsDispatchSet` (LI-11),
     `learningsArmInventory` (LI-23), `learningsCorpus` (LI-09), each naming its ladder owner and
     batch;
   - second-writer rows for the production surfaces `pdlc/workflows/orchestrate-dev.js`
     (LI-15…LI-22, batches 7–14) and `scripts/capture-learnings-baseline.mjs` (LI-05, batch 3), and
     for `.gitignore` (LI-04, batch 3) and `pdlc/workflows/.gitignore`.

   Keep the existing single-writer paragraph verbatim — it already covers every added row, and
   rewriting a correct argument to look newer is how a completeness fix turns into a correctness
   regression.

2. **Correct the `package.json` premise in all three places te-review names.** §Overview's
   change-surface table, §File-ownership manifest → Production and generated, and §Verification
   DoD 11. State what HEAD actually has: `allow-external: true`, four `**/`-anchored includes with
   `**/scripts/capture-learnings-baseline.mjs` among them, and a three-glob `exclude` block. Delete
   the "deliberately left outside `c8.include`" exemption and the justification that stood in for a
   coverage floor — the script now *has* the floor. DoD 11's stage-2 table must name four modules.
   Give `pdlc/workflows/package.json` a row in the manifest with `2fc6fcd3` as its landing commit;
   it is no longer an unmodified file and the prose exemption cannot stand.

### Must-fix, lower cost

3. **§Overview → What is being built:** "fourteen new test files" → eighteen, qualified the same way
   §The arithmetic now is (te 8). Two counts of one set in one document is the defect that produced
   this halt; leaving one of them unfixed reproduces it.
4. **Changelog item (3):** restate the arithmetic honestly — four rows account for seventeen of
   eighteen, the eighteenth is `learnings-config-example.test.js` (pm 3).

### Low, take them (all cheap, all verifiable)

5. Row 0.9's raiser credit: "(PM v10 erratum)" → TE v11 F-01, matching the 1.1 row below it (pm 4).
6. Reorder changelog rows 0.5 / 0.6 to restore monotonicity; 0.7–1.2 are already correct (pm 5).
7. P-A-7 case A's outcome-cell derivation: "before batch 7" → "before batch 9", matching the *When*
   cell as it has read since v1.1 (pm 6).
8. Refresh the header pins to REQ v0.10 / FSPEC v0.14 / DECISIONS v0.5, and the FSPEC v0.13 prose
   quotes in LI-12 and the `RSN-NO-MATERIAL` arm row. Confirm-and-refresh, not re-ground: te-review
   has already verified the substance is unchanged at the dispatched versions (te 7).

### Systemic — route out of this feature

9. **A manifest-completeness oracle.** Every High this round is `git`-checkable, which means it is
   automatable. Propose an engine-side check that reconciles §File-ownership manifest against
   `git ls-tree` for the feature's path globs and fails when a tracked file matching them appears in
   no row. `pdlc/workflows/__tests__/learningsSuiteMap.test.js` already does the directory-closure
   version of this for suites; the manifest version is the same idea one layer up. Route to
   `docs/_decisions/` as a candidate standing constraint — this is the third document on this branch
   to carry a stale count of a set that `git` can enumerate.
10. **Absence claims in specs need a positive-presence conjunct, same as oracles.** "`package.json`
    is **not** modified" is a spec-layer absence assertion with no falsifier: no gate reads it, and a
    verifier checking it looks at the exemption rather than at the file. This is the
    absence-based-oracle rule (TE falsifiability checklist) applied to prose. Propose it as a
    review-severity bar: **a spec claiming a file is unmodified must name the commit range over which
    that holds**, so the claim dates itself and a reader can check it. Route to
    `docs/_decisions/DECISIONS-review-severity-bars.md`.
11. **Erratum rounds should re-read the commit under discussion in full.** The role's *Erratum
    Rounds — Re-ground Upstream First* discipline covers upstream *documents*; this round shows the
    same discipline is owed to a **commit** an erratum item is about. Propose extending the erratum
    lead-in to: *when an item names a commit, enumerate that commit's full file list before writing
    the rows it asks for.* Route to `harvest-learnings` for `LEARNINGS-pdlc-learnings-injection.md`.

### What this halt says about the protocol

It worked. Two channels, dispatched independently, converged on the same subsection, tagged delta
vs inherited correctly, scoped local vs nonlocal correctly, gave shell-checkable evidence for every
High, and one of them volunteered the disposition (*"only the enumeration is short"*) so the fix
round would not over-correct. Unlike `POSTMORTEM-T` and `POSTMORTEM-D` on this branch — both channel
failures, where the gate fired on how a finding was expressed — this halt caught a real defect that
would otherwise have shipped a PLAN whose manifest contradicts its tree and whose DoD verifies an
exemption that does not exist. **Log this as a protocol success with a document defect, not as a
protocol failure.** No change to `erratumGateDecision`, `parseConfirmationFindings`, or DEC-ERR-03
is indicated.

## Traceability

| Artifact | Reference |
|---|---|
| Erratum under confirmation | PLAN v1.1 → v1.2, `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` |
| Commit the halting rows describe | `2fc6fcd3` — 45 changed files (4 added + 9 modified under `pdlc/workflows/__tests__/`, 18 added fixture prompts, 1 added `pdlc/engine/__tests__/learnings-config-example.test.js`, plus production and config surfaces) |
| Tree the counts are taken at | `09c7c62f` — 18 tracked `learnings*` test-side files |
| Routed items landed clean | (1) case C commit re-pins `e7fa8d87` / `be2456c8` / `a4998e13`; (2) case C restated as outcome, 26 passed / 26 total, 0 skips |
| Routed items partly unlanded | (3) four of five new files rowed; (4) two of nine second writers rowed |
| Sections requiring edit | §Overview → What is being built; §Overview change-surface table; §File-ownership manifest → Production and generated; §File-ownership manifest → Post-batch remediation; §Verification DoD 11; §P-A-7 case table, case A; §Changelog rows 0.5/0.6, 0.9, 1.2 item (3) |
| Rules invoked by the confirmers | P-A-5 (one added row per file, committed before the run it governs); DoD 11 (stage-2 per-file branch floor); batch-safety rule 2 (single writer per batch — preserved) |
| Governing decision | DEC-ERR-03 (`docs/_decisions/DECISIONS-review-severity-bars.md`) |
| Citation convention | DEC-DOC-01 — every locus above is named by heading, rule id, or commit, not by line number |
| Prior halts, same class, same branch | `POSTMORTEM-T-pdlc-learnings-injection.md` (FSPEC v7, zero-`FINDING:` channel failure); `POSTMORTEM-D-pdlc-learnings-injection.md` (FSPEC v0.8, inherited-only mis-scored as delta) |
| Distinguishing feature vs the priors | both channels well-formed and correctly scored; the gate fired on a real document defect, not on a channel artefact |

**Provenance**
- Engine version: 0.2.2
- Channel: engine
- Branch head at authoring: `84acb04c`
- Confirming channels this round: pm-review, te-review (se-review not dispatched)

## Resolution

RESOLVED: no

Awaiting operator disposition. The recommendation is a single v1.3 erratum edit to the PLAN
(items 1–8 above) plus three systemic items (9–11) routed out of this feature. No upstream
re-grounding is required: te finding 7 confirms the dispatched REQ v0.10 / FSPEC v0.14 /
DECISIONS v0.5 carry the same substance as the pinned versions, so the header refresh is a pin
update and not a cascade.

Re-confirmation should re-dispatch both non-approving channels, and both should be asked to check
the **absorbed** set as well as the raised set — specifically, that §Post-batch remediation's row
count now reconciles against `git show --name-status 2fc6fcd3` and that §Overview, the manifest and
DoD 11 agree on `pdlc/workflows/package.json`'s state at HEAD.
