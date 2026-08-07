# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** Local (delta re-review — v12 findings + changed sections only)
**Baseline diffed:** `455929d..HEAD` (v12's `REVIEWED-COMMIT`; HEAD = `1cebcce`).

## Prior-Finding Disposition

`git diff 455929d..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is
**empty**. For the second consecutive round the document under review is byte-identical to the one I
approved — 637 lines / 61,109 bytes, `sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`,
the same digest v12 recorded as its `APPROVAL-HASH`. `git diff 455929d..HEAD -- . ':(exclude)docs/'`
is likewise empty: no source file, script, workflow bundle or config moved in the interval, so every
`file:line` anchor verified at v12 is verified at HEAD by construction rather than by sampling.

The 112 commits between `455929d` and HEAD are Phase F work — the second FSPEC review window (rounds
6–10), ten more cross-review files, a second `POSTMORTEM-F` and its resolution, four freeze-mandated
FSPEC deletions, two new project-level decisions and three queue-status commits. Not one touches the
REQ, `docs/_constraints/`, or any production file.

| v12 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`); the `Cited by` row still carries the `§5` entry added by the same commit (`:6`); `Version` is still `1.0 · 2026-08-06` (`:7`). Neither offered fix was taken. The asymmetry against the vocabularies file's **row**-scoped clause (`pdlc-consolidation-vocabularies.md:27-28`) stands. |
| F-03 | Low | **Open — unchanged** | §4b still reads "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" and, with no change of subject, "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (REQ `:560-563`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:17-19`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-28`). The ~60-byte subject-scoping clause was not written. |

Both were Low at v11 and v12 and are Low now. I re-verified them against the two governed files
rather than restating v12's text, because those files *could* have moved without the REQ moving —
`git diff 455929d..HEAD -- docs/_constraints/` is empty, and the line numbers above are current at
HEAD. Where a line number above differs by one or two from v12's citation of the same sentence, the
files have not moved — the bytes are identical and the diffs are empty; v12's span was simply drawn a
line or two wide. I re-derived every number here from the files at HEAD rather than copying v12's.

## Standing-Decision Check

Two project-level decisions are new since v12 and two are carried. All four are read against the
document before scoring, not after.

**`DEC-CONV-01`** (`docs/_decisions/DECISIONS-review-convergence.md`, new at `4fbb696`) makes an
approval **stand** into later rounds of the same phase, re-openable only by the reviewer who issued
it, and only when the intervening diff touches a section that approval's `Scope` named or the
reviewer scores a new Medium-or-higher against that diff. It is directly on point here, and it is
what this round *is*: I hold a standing `Approved with minor changes` from v11 and v12, the
intervening diff on this document is empty, and I have no new finding of any severity against it.
The decision's own words for that case — "A reviewer whose approval stands and who finds nothing
Medium-or-higher in the delta **re-issues its approval**" — describe this review exactly. I note that
the decision does not let me shortcut the checks: it governs the *verdict*, not the diligence, and
the sections below are the same sweeps I ran at v11 and v12.

**`DEC-SEV-02`** (`DECISIONS-review-severity-bars.md:38-58`, new at the same commit) scores a
falsified **bookkeeping-completeness** assertion as Low rather than Medium, where no observable,
rule, arm or downstream artefact is wrong and the repair is deleting or narrowing the assertion. I
checked whether it reaches either open finding and it reaches **F-03** — squarely. F-03 is a
universal a document asserts over its own governed files ("§1–§4 entire in both … §1, §2 and §4 are
enumerations") that is falsified by one of those files; no observable, no arm, no downstream artefact
is wrong; and the repair I proposed is precisely to narrow the assertion's subject. It was already
Low under DEC-SEV-01, so the new decision does not move it — but it now has two independent grounds
for that score, which matters because it removes the only reading under which a third unaddressed
round could be argued into a Medium. F-02 is not of this class (it is a governance-clause scope
finding, not a falsified universal) and stays Low under DEC-SEV-01.

**`DEC-LAYER-01`** (`DECISIONS-spec-layer-boundary.md`, carried) binds at the FSPEC layer; the check
I ran at v12 is unchanged because the document is unchanged. §5a still disclaims the governed
territory in the REQ's own words — "fixture construction and oracle mechanics belong to FSPEC, TSPEC
and PROPERTIES" (`:602-603`) — naming all three downstream layers rather than the next hop.

**`DEC-SEV-01`** (carried) scores a REQ-layer finding about the scope of a governance rule over a
shared normative file as Low when the governed file carries a version-pin obligation whose breach is
itself a defect. Both governed files still carry that obligation
(`pdlc-consolidation-vocabularies.md:27-28`, `pdlc-advisory-corpus-baseline.md:19-20`), so both
findings stay Low. A Low finding surviving a round unaddressed is not grounds to escalate it: the bar
keys on detectability, and neither became less detectable by not being fixed.

I found no violation of `docs/_constraints/DOMAIN-CONSTRAINTS.md`. DC-09 (REQ altitude, `:245`) is
satisfied for the reason just given; DC-13 (accurate Scope tags, `:356`) is why F-02 remains
`Cross-Feature` — the version-pin/defect clause is stated in two shared files `pdlc-engineering-loop`
will read, so the asymmetry between their wordings is a fact about the mechanism, not about this REQ.

## Findings

Two, carried verbatim from v12 and v11, both still Low, both in the governance layer rather than in
the requirements an FSPEC author reads. **No new finding.** There is no changed section to scan, and
under DEC-CONV-01 a standing approval is re-opened only by a Medium-or-higher against the intervening
diff — there is no intervening diff. I decline to manufacture a finding by re-reviewing sections I
have approved across twelve rounds; that manufacture rate is the failure DEC-LAYER-01 and DEC-SEV-02
were recorded to stop, and it would be perverse to reproduce it here on an empty diff.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 | Low | Cross-Feature | **The baseline file's change-control clause is worded strictly enough to be breached by the commit that introduced it, and the file did not bump.** `pdlc-advisory-corpus-baseline.md:19-20`: "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect." The commit that added that paragraph also added a `§5` entry to the `Cited by` row (`:6`) and left `Version \| 1.0 · 2026-08-06` unchanged (`:7`) — the file's first act under its own rule is a content change with no bump. Neither of the vocabularies file's escapes is available as worded: that file's clause is scoped to a **row** change (`pdlc-consolidation-vocabularies.md:27-28`), so amending surrounding governance prose is outside it by construction, and its clause predates the round that bumped it 1.3 → 1.4, so that bump was governed rather than genesis. Consequence at its real size: `Version 1.0` denotes two byte-states, so the pin no longer discriminates provenance — but no *fact* changed, the REQ's two baseline citations transcribe the string "1.0" and are unaffected as expected values (REQ `:202`, `:448`), and the drift is visible in git. Fix, either one: bump the baseline to `1.1` and repin those two citations (2 characters each), **or** narrow the clause to "a change to any **stated fact**", matching the vocabularies wording. I still prefer the second — the asymmetry is the defect, and §4b governs the two files as a pair. | `pdlc-advisory-corpus-baseline.md:15-20`, `:6-7`; cf. `pdlc-consolidation-vocabularies.md:27-28` |
| F-03 | Low | Local | **§4b's enumerated/prose split is written under an "in both" quantifier, so read literally it contradicts what the baseline file says about itself.** The paragraph quantifies over both governed files — "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" (`:560-561`) — and the next sentence, with no change of subject, says "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (`:562-563`). Applied to the baseline that is false in both directions: `pdlc-advisory-corpus-baseline.md:17-19` states "All four sections are **owned normative prose**: no table here is transcribed row-for-row downstream, so **no set-equality oracle ranges over this file**", while the baseline's §1 *is* a three-row table (`Record \| Where \| Fate`, `:24-28`) that a literal §4b would drag under a row oracle the file explicitly disclaims. Two things keep it non-blocking, and DEC-SEV-02 now adds a third. The oracle sentence pins a version — "§1, §2 and §4 entire **at Version 1.4**" (`:565-566`) — and 1.4 is the vocabularies file alone (baseline is at 1.0, `:7`), so the intended subject is recoverable without leaving the sentence; the baseline answers the question itself, in one sentence, in a file §4b declares binding; and the finding is exactly DEC-SEV-02's class — a falsified bookkeeping universal with no wrong observable, rule, arm or artefact, whose repair is narrowing the assertion. Fix is one clause: "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned normative prose; the baseline's four sections are all owned normative prose, under no row oracle (baseline `:17-19`)." ~60 bytes against 331 of headroom (Q-01). | §4b `:560-569`; `pdlc-advisory-corpus-baseline.md:17-19`, `:24-28` |

## Existing-Code Claim Verification (changed sections)

No section changed, so there is no new claim to verify. The live question for an unmoved document is
the inverse one — did the codebase move beneath it? It did not: `git diff 455929d..HEAD -- .
':(exclude)docs/'` is empty across all 112 commits, so no source file, script, workflow bundle or
config differs from the tree v12's table was verified against. That is a proof, not a sample.

I re-derived the five load-bearing anchors anyway, because the exclusion diff would not catch a claim
that was already wrong at v12, and a version-pin regression is cheap to check.

| # | Claim | Verdict | Evidence re-derived at HEAD |
|---|---|---|---|
| 1 | BL-01 / AC-1.5 / AC-1.6: the two-rung ladder's resolver exists at `orchestrate-dev.js:1833` | **Confirmed** | `:1833` is `export function resolveAdvisoryRung({ _agent, _log, _state, prompt }) {` |
| 2 | REQ-CONS-06 / D-CONS-06: `advisorySummaryRows` at `:2708`, `ESCALATIONS_PATH` at `:2750`, `renderEscalationEntry` at `:2763` | **Confirmed, all three** | `:2708` `export function advisorySummaryRows(dispositions, pubOutcome = {}) {`; `:2750` `const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";`; `:2763` `export function renderEscalationEntry(disposition, ctx, { now }) {` |
| 3 | BL-01a and baseline §2: `ESCALATIONS.md` does not exist at HEAD | **Confirmed** | `git ls-files docs/_queue/` returns `docs/_queue/QUEUE.md` alone — the absent-first framing is still a fact about HEAD |
| 4 | §5's `nudge-consolidation.sh:41` predicate anchor | **Confirmed** | `:41` is still `pending = [p for p in learnings if os.path.basename(p) not in logtext]` — the bare substring test the REQ's predicate change targets |
| 5 | Q-01's size ceiling, and the version-pin sweep | **Confirmed, and no pin regressed** | `check-req-size.sh:41-42` are `LINE_LIMIT=700` / `BYTE_LIMIT=61440`; the REQ is 637 lines / 61,109 bytes — 331 bytes of headroom. `grep -c "Version. 1\.3"` over the REQ returns **0**; all 13 `1.4` occurrences stand, so every vocabularies citation remains pinned at 1.4 |

No defect row, for the seventh consecutive round. Neither finding above is a row here: both are about
governance text, not about the codebase.

## Questions

Q-02 and Q-03 are carried unanswered; Q-04 is now answered by events and closed. Q-05 is the only
new one, and it is about the round rather than about the document.

| ID | Question |
|----|---------|
| Q-01 | Not blocking; it bounds F-03's fix. The REQ is **61,109 bytes** against the 61,440-byte hard ceiling (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **331 bytes** of headroom, unchanged because the document is unchanged. F-03's fix is ~60 bytes and F-02's preferred fix is byte-neutral in the REQ (it edits the baseline file), so neither forces a relocation. |
| Q-02 | Carried, still open. Is the version-pin/defect clause meant to bind the commit that *introduces* it? I read it as prospective — a rule cannot govern its own genesis — which is why F-02 is Low and why I prefer narrowing the wording to a retroactive bump. The clause sits in two shared files `pdlc-engineering-loop` will read and may copy, so whichever reading is intended is worth stating once, in the vocabularies' wording. |
| Q-03 | `Process`, carried — and materially stronger this round. At v12 two project-level decisions bound reviewer scoring (DEC-SEV-01, DEC-LAYER-01); there are now **four**, all recorded by phase-POSTMORTEM resolutions rather than by either reviewer, none cited by either reviewer's skill prompt. DEC-CONV-01 in particular changes the *verdict rule* itself, not merely a severity: a reviewer who does not read `docs/_decisions/` will discard a standing approval and reproduce exactly the anti-phase exhaustion it was recorded to stop. Should harvest promote them into `DOMAIN-CONSTRAINTS.md` next to DC-13, which reviewers already consult? Not a REQ question and not blocking, but the cost of a miss has gone up. |
| Q-04 | **Closed.** v12 asked whether Phase R's re-entry on an unmoved document meant the author had declined the two Low fixes or had never seen the round. The interval answers it: all 112 commits are Phase F work, the queue row went `halted` → `pending` → `in-progress` (`2c0f346`, `98beb97`, `9b68519`), and no optimizer pass was dispatched against the REQ. The document was not declined; it was never handed to an author this round. |
| Q-05 | New, `Process`, not blocking, and asked once so it need not be asked again. This is the third consecutive Phase R round on byte-identical input, and the third to reach the same verdict from the same two Lows. DEC-CONV-01 now says an approval stands into later rounds — so a round whose only input is "the document did not change" has, by that decision's own logic, no work in it: the standing approval was never re-openable, because re-opening requires an intervening diff. Is there a cheap precondition — an empty-diff check before dispatching the review — that would let the orchestrator re-issue a standing approval without spending a round? I raise it as a workflow question, not a REQ one; the two Low fixes remain available to any optimizer pass at ~60 bytes plus a two-word edit in the baseline. |

## Positive Observations

- **The REQ has now survived two full FSPEC review windows without an erratum.** Between the commit I
  approved at v11 and HEAD, an FSPEC was authored, reviewed ten times by two reviewers across two
  windows, hit the round limit twice, produced two POSTMORTEMs, was resolved twice, and had four
  registers deleted under a freeze. Twenty cross-reviews and two root-cause analyses all read this
  REQ. Not one routed an erratum back to it. `git diff 455929d..HEAD -- .../REQ-*.md` being empty
  across 112 commits is not inertia — it is the erratum channel declining to fire under the hardest
  load the process applies to an upstream document.

- **The second POSTMORTEM's root causes are both downstream of this REQ, and both were diagnosed as
  such.** RC-B is a synchronisation defect in the review loop (anti-phase approvals) and RC-A is
  manufacture relocated to the wrong layer. Neither names an underdetermined requirement. That is the
  strongest available evidence for the only test that matters at this altitude — handed this REQ, can
  an FSPEC author make every decision? — because it is the verdict of a root-cause analysis that was
  actively looking for something to blame.

- **§5a's three-layer routing kept paying off.** DEC-LAYER-01 exists because the FSPEC settled
  decisions belonging a layer below it. The rule §5a already carried routes "fixture construction and
  oracle mechanics" to "FSPEC, TSPEC and PROPERTIES" (`:602-603`) — all three, not the next hop. Had
  it said "downstream to the FSPEC" it would have been a contributing cause of the exact window
  exhaustion that produced both new decisions.

- **The two governed files did not drift across either window.** `git diff 455929d..HEAD --
  docs/_constraints/` is empty. A shared reference file cited by an actively-revised FSPEC is exactly
  the artefact a downstream author is tempted to adjust in passing; the ownership paragraphs this REQ
  wrote into both files (`pdlc-consolidation-vocabularies.md:18-28`,
  `pdlc-advisory-corpus-baseline.md:15-20`) are what made that temptation legible as a violation, and
  they held through 112 commits of pressure.

- **No code claim went stale, and it is provable rather than sampled.** The exclusion diff over
  everything outside `docs/` is empty, which converts a spot-check into a proof — and the five anchors
  I re-derived anyway all match, with no version pin regressed. Seventh consecutive round with no
  defect row.

## Recommendation

**Approved with minor changes.** 0 High, 0 Medium, 2 Low — the same two, at the same severity, on the
same unmoved document. Under `DEC-CONV-01` this is a **re-issue of a standing approval**, not a fresh
one: my v11 and v12 approvals stand, the intervening diff on this document is empty, and I have no
Medium-or-higher finding against that diff because there is no diff. The decision's re-issue clause is
satisfied on its own terms.

I want to be exact about what the verdict asserts, because "approved again with no diff" can conceal
either of two very different situations. It is not re-approval by inertia. The two governed files were
diffed and found unmoved; the five load-bearing code anchors were re-derived at HEAD; the version-pin
sweep was re-run; the exclusion diff over everything outside `docs/` was checked; and the two
project-level decisions recorded since v12 were read and applied before scoring. Any of those could
have turned an unchanged document red — a bumped constraint file, a moved `export`, a decision the REQ
now contradicts. None did.

Nor is it a lowered bar. Any open High or Medium means Needs revision; there is neither. Both
remaining findings are Low on grounds recorded before this round: F-02 under DEC-SEV-01, F-03 under
DEC-SEV-01 **and** now independently under DEC-SEV-02, whose class it fits exactly. Re-scoring
identical bytes upward purely because they went unaddressed for another round is precisely the
re-litigation DEC-SEV-01 and DEC-CONV-01 were recorded to stop.

The test I apply every round: handed this REQ today, is there a decision an FSPEC author cannot make?
**No** — and the answer is now doubly empirical. Two FSPEC review windows, ten cross-reviews, two
root-cause analyses. The second POSTMORTEM's primary cause is the review loop's synchronisation rule
(RC-B, `POSTMORTEM-F:247`) and its secondary is relocated claim manufacture (RC-A, `:266`). Neither is
an underdetermined requirement, and no erratum was routed to this document.

### The stopping rule, applied against itself

§5a routes "cannot be tested as written" and "needs an oracle" findings downstream. Neither finding
here is of that shape: F-02 concerns a clause's scope over its own genesis commit, F-03 which of two
files a sentence quantifies over. Both are single-clause edits to text this REQ owns and neither
re-scopes anything downstream. They belong here — as minor changes, not as a gate. Seven consecutive
clean code sweeps precede this one; an eighth Phase R round spent on two Low governance-wording fixes
would cost more review than the fixes are worth, which is what Low means.

### What should change (non-blocking, unchanged from v12)

1. **F-03** (~60 bytes against 331 of headroom) — give §4b's enumerated/prose split an explicit
   subject: "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned
   normative prose; the baseline's four sections are all owned normative prose, under no row oracle
   (baseline `:17-19`)." DEC-SEV-02's preferred repair — deleting the universal rather than narrowing
   it — is also available and is cheaper still.
2. **F-02** (byte-neutral in the REQ) — narrow the baseline's change-control clause from "a **content**
   change" to "a change to any **stated fact**", matching the vocabularies file's row-scoped wording.
   §4b governs the two files as a pair; their change-control rules should not be asymmetrically
   strict. Bumping the baseline to 1.1 and repinning `:202`/`:448` is the alternative, but it fixes
   the symptom rather than the wording that produced it.

Both are appropriate for a single optimizer pass. I said at v12 that I would not file either again if
the document reached me unchanged a third time; it has, and I am filing them once more only because
the disposition table must account for every prior finding. **I will not file them a fourth time.**
Neither warrants a further review round on its own account, and this phase has converged as far as I
am concerned.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17
REVIEWED-COMMIT: 1cebcce3a4dcf50ee23fdcf9f8787cc94d8fb5e5
