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

Two substantive additions beyond the re-verification table. I checked both against the parents,
because both are places where a PROPERTIES document decides something on its own authority.

### The document picks PLAN over TSPEC on run depth, and says so twice

`PROPERTIES:613–618` states that PROP-LAW-01…04 pin `numRuns: 500` following PLAN T-08 rather than
TSPEC §5.7's "default", and gives the reason: 500 is the depth the cited precedent
(`advisoryHelperProperties.test.js`) actually runs, and a law suite running 5× shallower than the
block it is modelled on is the weaker reading.

From the product lens this is the right posture and it is correctly executed. A PROPERTIES document
that finds its two parents in conflict has three options — silently pick one, halt, or pick one and
record the divergence where the reader of the tests will hit it. This takes the third, and the
divergence is recorded in **both** places a reader would look: here, and at the run-depth paragraph
in `## Fixtures` (`PROPERTIES:404–407`), which names the precedent and quotes its
`const runs = { numRuns: 500 }` declaration. The four `fc.assert` sites at `PROPERTIES:289–292` all
carry `{ numRuns: 500 }` consistently, so the choice is applied uniformly rather than half-applied.
The document's own note that reversing this is "one run-depth decision applied to four `fc.assert`
calls in a single new file, not a redesign" is accurate — I checked, and all four sites are in
`waveResumeProperties.test.js` (PLAN T-08).

This is why the conflict belongs upstream as an erratum against TSPEC and **not** as a finding
against this document: the document behaved correctly given a defective parent. I emit the
`ERRATUM: TSPEC` line rather than folding it into my verdict.

### AT-14's two-property split is faithful, and I verified it conjunct by conjunct

`PROPERTIES:620–625` claims the PROP-REPO-01 / PROP-REPO-03 split is the document's own presentation
choice and that "both readings assert the same behaviour". That is a completeness claim about an
acceptance criterion, so I checked it against TSPEC's single row rather than accepting it:

| TSPEC `:757` AT-14 conjunct | Where it lands in PROPERTIES | Verdict |
|---|---|---|
| (i) a line **equal** to `/.claude/pdlc-wave-state.json` in `.gitignore` | PROP-REPO-01 (`:188`), oracle `:284` (i) `toContain` element-equality over lines | preserved verbatim |
| (ii) that matched line is root-anchored, leading `/` asserted on it | PROP-REPO-01, oracle `:284` (ii) | preserved verbatim |
| (iii) `git check-ignore -v` resolves to **that** line, not a broader pattern | PROP-REPO-01, oracle `:284` (iii) | preserved verbatim |
| plus: no `implementation.postWavePathspecs` value and no PLAN-owned path names it | PROP-REPO-02 (`:189`), filed under **AT-17** | preserved, re-filed — and this matches PLAN T-03 (`:117`), which likewise files that conjunct under AT-17 |
| run-side: no commit a run produces contains the record | PROP-REPO-03 (`:190`) | preserved, split to the integration level |

Nothing is dropped, narrowed, or reinterpreted. The one re-filing (the manifest conjunct moving to
AT-17) is not this document inventing a mapping — PLAN T-03 already files it that way, so PROPERTIES
is consistent with its immediate parent. AT-14's traceability row (`:446`) names both ids and both
tasks, so a reader tracing AT-14 from TSPEC finds two ids and is told why. The claim holds.

### Oracle-quality checks over the delta's scope

The three standards, applied to the properties the delta discusses:

- **No absence-only oracles.** PROP-REPO-03 is the one at risk — it is a negative ("no `add` argv
  names the record"). `PROPERTIES:286` pairs it explicitly: the negative
  `expect(...).not.toContain(".claude/pdlc-wave-state.json")` is asserted alongside the positive
  conjunct that the expected wave pathspecs **are** in that same list, so an empty `gitCalls` list
  cannot false-green it. The document states that rationale in its own right-hand column. Correct.
  PROP-REPO-05 (`:288`) likewise asserts on the record in both arms rather than only on the halt.
- **No implementation echoes.** PROP-REPO-04's version oracle (`:287`) asserts strictly-greater than
  the literal `1.2 · 2026-08-20` transcribed from the PLAN as found — a literal from the spec, not a
  value read back out of the file under test. Correct, and the "strictly greater rather than a
  pinned 1.3" reasoning is the right call for a file that may move before promotion.
- **Completeness by set-equality.** The enumerated contracts the delta touches are the PLAN task set
  (checked above — seven for seven, both directions) and the AT-14 conjunct set (checked above — five
  for five). PROP-LAW-03 (`:200`) additionally holds the three closed catalogues to membership over
  `RESUME_OUTCOMES`, `RESUME_PROVENANCE` and `Object.keys(WAVE_IGNORE_REASONS)`, which is what makes
  BR-01's closure mechanical rather than prose. Unchanged by this delta, but it is the thing that
  would fail if a case were deleted.

### Did the revision break anything?

No. The diff deletes ten lines, all of them the superseded routed-findings prose, and adds
twenty-seven. No property id, oracle row, fixture, generator, or traceability-matrix row is touched.
The property set at HEAD is identical to the set I saw at `1b9de7c0`. The AT / BR / EC / REQ matrices
are byte-unchanged, so the coverage posture my v1 Grounding recorded as strong (AT-01…AT-18, BR-01…
BR-17, EC-01…EC-21 with EC-17/18/19 explicitly parked, all ten REQ-WVR ids) still stands.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Process | Round 1 of this document's review produced **no findings and no verdict**: `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` is committed with `## Findings`, `## Questions`, `## Positive Observations` and `## Recommendation` all empty and no `VERDICT:` line anywhere in the file, while its own Grounding promises "findings below about three specific seams". The author of PROPERTIES therefore received nothing actionable from round 1 and had to self-generate this revision's agenda. The fix is not in this document — it is that a review file whose Findings table is empty **and** whose verdict is unparseable should be recognised as a truncated write and re-dispatched, not counted as a completed round. Routed to process learnings. | — (pipeline artifact, not a REQ clause) |
| F-02 | Low | Local | The lineage header bumps `Version` 1.0 → 1.1 (`PROPERTIES:7`) but the document carries **no revision-history block**, so nothing in it records what changed between the two versions. Both sibling documents do carry one — `TSPEC:13` and `PLAN:13` each open with `**Revision history.**` followed by a per-version row. Suggested fix: add the same block, with a `1.1` row naming the two changes this delta actually made (errata re-verified at HEAD, three closed by their owners and one routed; retired PLAN ids T-05/T-06/T-09 called out). Without it a later reader diffing 1.0 against 1.1 has to reconstruct the intent from the diff. | REQ-WVR traceability posture; matches TSPEC/PLAN convention |

Scope note: F-01 is tagged `Process` and not `Local` deliberately — it references a failure mode of
the review mechanism that recurs across phases and is reusable regardless of where the fix lands,
which is the `Cross-Feature`/`Process` tag-selection test. Neither finding is High; neither blocks.

## Questions

| ID | Question |
|----|---------|
| Q-01 | If the routed `ERRATUM: TSPEC` resolves the *other* way — TSPEC's author defends "default run count" and asks PLAN to drop the pin — the document says the change is four `fc.assert` sites in one new file. Is that reversal expected to come back through PROPERTIES as a v1.2, or is it small enough to be absorbed at implementation time by T-08? I read the current text as the former; confirming it would save a round. |
| Q-02 | PROP-REPO-01 is knowingly RED until the OB-F1 rebase lands (`PROPERTIES:570–573`), and TSPEC `:757` warns that in wave mode a red gate halts the wave and every wave after it. That sequencing precondition is stated in three documents now. Is there anything in this document that a reader could mistake for permission to author the T-03 test *before* the rebase, or is "the correct pre-rebase state is the test not yet authored" (TSPEC `:757`) unambiguous enough as it stands? I believe it is, but it is the one place where a misread costs a halted feature rather than a failed test. |

## Positive Observations

- **The re-verification discipline is the right instinct, and it is the thing I would most want kept.**
  Rather than re-asserting four errata from a previous drafting pass, the revision re-opened each one
  against the parent documents at HEAD and found three had been closed by their owners. That is
  exactly DEC-ERR-01's requirement, and the four-row table makes the adjudication auditable instead
  of asking the reader to trust it. I re-ran all four myself and the table was right in every row.
- **The one genuinely open item was not softened to make the table look clean.** It would have been
  easy to close all four and move on. Routing one erratum while closing three is the honest outcome,
  and it is the outcome that protects the implementer from a 5×-shallow law suite.
- **Divergence from a parent is recorded where the reader will actually hit it.** The `numRuns: 500`
  choice appears in the routed-findings section *and* at the `## Fixtures` run-depth paragraph, with
  the precedent named and quoted at both. A reader of the tests is never left guessing which parent
  was believed — which is precisely what the document claims it is doing.
- **Retired PLAN ids are now explicit.** `PROPERTIES:525–526` states that T-05/T-06/T-09 were merged
  at PLAN v1.1 and are not reused. My round-1 grounding noted a reader could wonder about the gap;
  the revision closed it unprompted.
- **AT-14's split is presented as a presentation choice and defended as one.** The document is careful
  to say the split is its own, not a routed defect, and that both readings assert the same behaviour.
  I verified conjunct by conjunct that this is true. Distinguishing "I chose to render this as two
  ids" from "my parent got this wrong" is a distinction plenty of documents blur.
- **Negative oracles carry their positive halves.** PROP-REPO-03 and PROP-REPO-05 both pair the
  absence claim with a presence assertion on the same observable, and both say why in the oracle
  table. The Overview's promise that "no property is discharged by an absence alone"
  (`PROPERTIES:21–22`) is kept, not just stated.

## Recommendation

## Verdict
