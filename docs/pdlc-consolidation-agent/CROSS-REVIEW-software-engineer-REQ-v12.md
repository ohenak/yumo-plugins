# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Local (delta re-review — v11 findings + changed sections only)
**Baseline diffed:** `e54ee26..HEAD` (v11's `REVIEWED-COMMIT`). `git diff e54ee26..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is **empty**: the document under review is byte-identical to the one I approved at v11 (637 lines / 61,109 bytes, unchanged). `git diff e54ee26..HEAD -- . ':(exclude)docs/'` is likewise empty — no production code, script, workflow or config changed in the interval, so every `file:line` anchor verified at v11 is verified at HEAD by construction.

## Prior-Finding Disposition

This is the first round in this document's history in which the REQ did not move. The 66 commits
between `e54ee26` and HEAD are Phase F work — the FSPEC, its ten cross-review files, the Phase F
POSTMORTEM and its resolution, one new project-level decision, and two queue-status commits. Not one
of them touches the REQ. So the disposition below is not a judgment about a revision; it is a record
that no revision was attempted.

| v11 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline file's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`), the `Cited by` row still carries the `§5` entry added in the same commit as that clause (`:6`), and `Version` is still `1.0 · 2026-08-06` (`:7`). Neither of the two fixes I offered was taken: the clause is not narrowed to "a change to any **stated fact**", and the file is not bumped to 1.1. The asymmetry with the vocabularies file's row-scoped clause (`pdlc-consolidation-vocabularies.md:26-27`) therefore stands. |
| F-03 | Low | **Open — unchanged** | §4b still opens "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" and follows it, with no change of subject, with "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (REQ `:558-562`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:18-20`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-30`) a literal reading of §4b would drag under a row oracle. The ~60-byte subject-scoping clause I proposed was not written. |

Both were Low at v11 and are Low now: nothing changed that could have raised or lowered either. I
have re-verified both against the files rather than restating v11's text, because the two governed
files *could* have moved without the REQ moving — `git diff e54ee26..HEAD -- docs/_constraints/` is
empty, and the line numbers above are current at HEAD.

## Standing-Decision Check

One project-level decision is new since v11 and one is carried. Both are read against the document
before scoring, not after.

**`DEC-LAYER-01`** (`docs/_decisions/DECISIONS-spec-layer-boundary.md`, new at `87a6cb7`) fixes four
classes of decision — tie-break/ordering algorithms, per-field reader indices and parse-notice
contracts, seam-verb permitted sets, and fixture construction / oracle strength — as **TSPEC- or
PROPERTIES-owned**, and instructs a document that needs one to state the observable and name the
downstream artefact. It is addressed at the FSPEC layer, so it does not bind this document directly;
what matters here is whether the REQ *contradicts* it. It does not, and the check is not vacuous —
§5a already disclaims exactly this territory in the REQ's own words: "How any of that is tested,
generated or fixtured is **not** this REQ's job: property axes, fault-injection vocabularies,
coverage floors, **fixture construction and oracle mechanics** belong to FSPEC, TSPEC and
PROPERTIES" (`:602-603`, citing DC-09 at `DOMAIN-CONSTRAINTS.md:245`). Two details make that a real
match rather than a coincidence of vocabulary. It names **all three** downstream layers, not FSPEC
alone — so §5a's routing rule does not deposit a TSPEC-owned decision at the FSPEC layer, which is
the precise failure DEC-LAYER-01 was recorded to stop. And the REQ carries none of the four governed
classes itself: `grep -niE "tie-break|lexicograph|per-field reader|permitted set"` over the document
returns nothing, and its only two `fixture` hits are `:365` (a factual claim about
`pdlc/workflows/__tests__/fixtures/` copies at HEAD) and `:602-603` (the disclaimer above). No
finding.

**`DEC-SEV-01`** (`docs/_decisions/DECISIONS-review-severity-bars.md`, carried from v11) scores a
REQ-layer finding about the scope of a governance rule over a shared normative file as **Low** when
the governed file carries a version-pin obligation whose breach is itself a defect. Both findings
below remain of exactly that class, and both governed files still carry that obligation
(`pdlc-consolidation-vocabularies.md:26-27`, `pdlc-advisory-corpus-baseline.md:19-20`), so both stay
Low. I note for the record that a Low finding surviving a round *unaddressed* is not, under this
decision, grounds to escalate it: the bar keys on detectability, and neither finding became less
detectable by not being fixed.

I found no violation of `docs/_constraints/DOMAIN-CONSTRAINTS.md` either. DC-09 (REQ altitude,
`:245`) is satisfied for the reason just given; DC-13 (accurate Scope tags, `:356`) is why F-02
remains `Cross-Feature` — the version-pin/defect clause is stated in two shared files that
`pdlc-engineering-loop` will read, so the asymmetry between their wordings is a fact about the
mechanism, not about this REQ.

## Findings

Two, both carried verbatim from v11, both still Low, both still in the governance layer rather than
in the requirements an FSPEC author reads. No new finding: there is no changed section to scan, and
I decline to manufacture one by re-reviewing sections I approved across eleven rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 | Low | Cross-Feature | **The baseline file's change-control clause is worded strictly enough to be breached by the commit that introduced it, and the file did not bump.** `pdlc-advisory-corpus-baseline.md:19-20` says "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect." The commit that added that paragraph also added a `§5` entry to the `Cited by` row (`:6`) and left `Version \| 1.0 · 2026-08-06` unchanged (`:7`) — the file's first act under its own rule is a content change with no bump. Neither of the vocabularies file's two escapes is available as worded: that file's clause is scoped to a **row** change ("a `row` change that is not accompanied by a version bump", `pdlc-consolidation-vocabularies.md:26-27`), so amending surrounding governance prose is outside it by construction, and its clause predates the round that bumped it 1.3 → 1.4, so that bump was governed rather than genesis. Consequence, stated at its real size: `Version 1.0` denotes two byte-states of the file, so the pin no longer discriminates provenance — but no *fact* changed, the REQ's two baseline citations transcribe the string "1.0" and are unaffected as expected values (REQ `:202`, `:448`), and the drift is visible in git. Fix, either one: bump the baseline to `1.1` and repin those two citations (2 characters each), **or** narrow the clause to "a change to any **stated fact**", matching the vocabularies wording. I still prefer the second — the asymmetry is the defect, and §4b governs the two files as a pair, so a successor should not have to notice that one is stricter than the other. | `pdlc-advisory-corpus-baseline.md:15-20`, `:6-7`; cf. `pdlc-consolidation-vocabularies.md:26-27` |
| F-03 | Low | Local | **§4b's enumerated/prose split is written under an "in both" quantifier, so read literally it contradicts what the baseline file says about itself.** The paragraph quantifies over both governed files — "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" (`:558-559`) — and the next sentence, with no change of subject, says "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (`:560-562`). Applied to the baseline that is false in both directions: `pdlc-advisory-corpus-baseline.md:18-20` states "All four sections are **owned normative prose**: no table here is transcribed row-for-row downstream, so **no set-equality oracle ranges over this file**", while the baseline's §1 *is* a three-row table (`Record \| Where \| Fate`, `:24-30`) that a literal §4b would drag under a row oracle the file explicitly disclaims. Two things keep it non-blocking. The oracle sentence pins a version — "§1, §2 and §4 entire **at Version 1.4**" (`:564-565`) — and 1.4 is the vocabularies file alone (baseline is at 1.0, `:7`), so the intended subject is recoverable without leaving the sentence; and the baseline answers the question itself, in one sentence, in a file §4b declares binding. Fix is one clause: "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned normative prose; the baseline's four sections are all owned normative prose, under no row oracle (baseline `:18-20`)." ~60 bytes against 331 of headroom (Q-01). | §4b `:558-566`; `pdlc-advisory-corpus-baseline.md:18-20`, `:24-30` |

## Existing-Code Claim Verification (changed sections)

No section changed, so there is no new claim to verify. The interesting question this round is the
inverse one: an unchanged document can still go stale if the codebase moves under it. It did not —
`git diff e54ee26..HEAD -- . ':(exclude)docs/'` is empty, so no source file, script, workflow bundle
or config differs from the tree against which v11's six-row table was verified. That is a proof, not
an assumption, and it makes every anchor in that table current by construction.

I re-derived the five load-bearing anchors anyway, because "no diff outside `docs/`" would not catch
a claim that was already wrong at v11 and a version-pin regression is cheap to check.

| # | Claim | Verdict | Evidence re-derived at HEAD |
|---|---|---|---|
| 1 | BL-01 / AC-1.5 / AC-1.6: the two-rung ladder's resolver exists at `orchestrate-dev.js:1833` | **Confirmed** | `:1833` is `export function resolveAdvisoryRung({ _agent, _log, _state, prompt }) {` |
| 2 | REQ-CONS-06 / D-CONS-06: `advisorySummaryRows` at `:2708`, `ESCALATIONS_PATH` at `:2750`, `renderEscalationEntry` at `:2763` | **Confirmed, all three** | `:2708` `export function advisorySummaryRows(dispositions, pubOutcome = {}) {`; `:2750` `const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";`; `:2763` `export function renderEscalationEntry(disposition, ctx, { now }) {` |
| 3 | BL-01a and baseline §2: `ESCALATIONS.md` does not exist at HEAD | **Confirmed** | `git ls-files docs/_queue/` returns `docs/_queue/QUEUE.md` alone — the absent-first framing is still a fact about HEAD, not a stale one |
| 4 | §5's `nudge-consolidation.sh:41` predicate anchor | **Confirmed** | `:41` is still `pending = [p for p in learnings if os.path.basename(p) not in logtext]` — the bare substring test the REQ's predicate change targets |
| 5 | Q-01's size ceiling, and the version-pin sweep | **Confirmed, and no pin regressed** | `check-req-size.sh:41-42` are `LINE_LIMIT=700` / `BYTE_LIMIT=61440`; the REQ is 637 lines / 61,109 bytes, so 331 bytes of headroom. `grep -c "Version. 1\.3"` over the REQ returns **0** — all seven vocabularies citations remain at 1.4 |

No defect row, for the sixth consecutive round. Neither finding above is a row here: both are about
governance text, not about the codebase.

## Questions

v11's Q-02 (is the version-pin/defect clause meant to bind its own genesis commit?) and Q-03 (should
DEC-SEV-01 be promoted into `DOMAIN-CONSTRAINTS.md`) are both unanswered, because nothing was written
in reply. Both are carried below unchanged in substance. Q-01's byte figure is unchanged and is
restated only so that the two fixes are not expanded into paragraphs.

| ID | Question |
|----|---------|
| Q-01 | Not blocking; it bounds F-03's fix. The REQ is **61,109 bytes** against the 61,440-byte hard ceiling (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **331 bytes** of headroom, unchanged from v11 because the document is unchanged. F-03's fix as written is ~60 bytes and F-02's preferred fix is byte-neutral in the REQ (it edits the baseline file), so neither forces a relocation. |
| Q-02 | Carried from v11, still open. Is the version-pin/defect clause meant to bind the commit that *introduces* it? I read it as prospective — a rule cannot govern its own genesis — which is why F-02 is Low and why I prefer narrowing the wording to a retroactive bump. The clause now sits in two shared files that `pdlc-engineering-loop` will read and may copy, so whichever reading is intended is worth stating once, in the vocabularies' wording, rather than leaving each successor to decide. |
| Q-03 | `Process`, carried from v11. DEC-SEV-01 was recorded by a phase POSTMORTEM resolution rather than by either reviewer, and neither reviewer's skill prompt cites it; DEC-LAYER-01 has now arrived by the same route (`POSTMORTEM-F` Recommendation step 3). Two project-level decisions that bind reviewer scoring now depend on someone remembering to read `docs/_decisions/` — which the skill does instruct, but only as one line of Project-Level Context. Should harvest promote both into `DOMAIN-CONSTRAINTS.md`, next to DC-13's scope-tagging rule reviewers already consult? Not a REQ question and not blocking. |
| Q-04 | New, and it is the only question I have about *this* round rather than about the document: Phase R was re-entered at iteration 12 with the REQ byte-identical to the one approved at v11, and with `POSTMORTEM-R` already carrying `RESOLVED: yes` (`:14`). The two open findings are Low and were explicitly filed as optimizer-pass work, so nothing in my v11 review asked for another R round. If the re-entry was intended to collect the two Low fixes, they are still available and cost ~60 bytes plus a two-word edit in the baseline; if it was incidental, the document needs nothing from me. I raise it because a re-review that finds an unmoved document cannot distinguish "the author declined the fixes" from "the author never saw the round", and those warrant different next steps. |

## Positive Observations

- **The REQ survived a whole Phase F without needing an erratum.** Between the commit I reviewed and
  HEAD, an FSPEC was authored, reviewed five times by two reviewers, hit a round limit, produced a
  POSTMORTEM and was resolved. That is the process's hardest stress test of an upstream document:
  ten cross-reviews and a root-cause analysis, all reading this REQ, none of which required a
  versioned edit to it. `git diff e54ee26..HEAD -- .../REQ-*.md` being empty is not inertia — it is
  the absence of an erratum channel firing across 66 commits of downstream work.

- **§5a's downstream routing named the right layers a round before it mattered.** DEC-LAYER-01 was
  recorded because the FSPEC settled decisions belonging a layer down and manufactured Mediums at the
  rate it retired them. The rule §5a already carried routes "fixture construction and oracle
  mechanics" to "FSPEC, TSPEC and PROPERTIES" (`:602-603`) — all three, not FSPEC alone. Had it said
  "downstream to the FSPEC", it would have been a contributing cause of the very window exhaustion
  the new decision addresses, and this round would have opened with a Cross-Feature finding against
  it. Naming the full downstream set rather than the next hop is the kind of precision that only pays
  off retroactively, and it paid off here.

- **The two governed files did not drift while unattended.** `git diff e54ee26..HEAD --
  docs/_constraints/` is empty across the whole Phase F interval. That is worth noting rather than
  assuming: a shared reference file cited by an active FSPEC is exactly the artefact a downstream
  author is tempted to adjust in passing, and the ownership paragraphs the REQ wrote into both files
  (`pdlc-consolidation-vocabularies.md:18-27`, `pdlc-advisory-corpus-baseline.md:15-20`) are what
  made that temptation legible as a violation. The mechanism was tested by a real phase and held.

- **No code claim went stale, and I can prove it rather than spot-check it.** The usual risk for an
  unchanged spec is that the tree moves beneath it. Here the exclusion diff over everything outside
  `docs/` is empty, which converts a sampling exercise into a proof — and the five anchors I
  re-derived anyway all match. Sixth consecutive round with no defect row.

## Recommendation

**Approved with minor changes.** 0 High, 0 Medium, 2 Low — the same two, at the same severity, on the
same unmoved document.

I want to be exact about what that verdict does and does not assert, because "approved again with no
diff" is a shape that can hide either of two very different situations. It is not a re-approval by
inertia: the two governed files were diffed and found unmoved, the five load-bearing code anchors
were re-derived at HEAD, the version-pin sweep was re-run, and the one project-level decision that is
new since v11 was read and applied. Every one of those could have turned an unchanged document red —
a bumped constraint file, a moved `export`, a decision the REQ now contradicts — and none did. The
verdict is the result of those checks, not a default.

Nor is it a lowering of the bar to close a phase. The bar is unchanged: any open High or Medium means
Needs revision. There is no High and no Medium. Both remaining findings are of the class DEC-SEV-01
adjudicates — a gap in the scope of a governance rule over a shared normative file whose version-pin
obligation makes the breach itself a defect — and I scored them Low at v11 under a decision that went
against my own bar, before I knew the document would not move. Scoring them differently now, on
identical bytes, purely because they went unaddressed for a round, would be exactly the re-litigation
DEC-SEV-01 was recorded to stop.

The test I apply every round: handed this REQ today, is there a decision an FSPEC author cannot make?
**No** — and this round that question has an empirical answer rather than a predicted one. An FSPEC
author was handed this REQ, wrote a full FSPEC, took five rounds of review from two reviewers, hit a
round limit and produced a root-cause analysis. The postmortem's primary cause is layer absorption at
the FSPEC — decisions settled a layer above where they belong — not an underdetermined REQ. Across
all of that, no erratum was routed back to this document.

### The stopping rule, applied against itself

§5a routes "cannot be tested as written" and "needs an oracle" findings downstream. Neither finding
here is of that shape: F-02 concerns a clause's scope over its own genesis commit and F-03 which of
two files a sentence quantifies over. Both are single-clause edits to text this REQ owns, and neither
re-scopes anything downstream. They belong here — as minor changes, not as a gate. Six rounds of
clean sweeps preceded this one; a seventh round spent on two Low governance-wording fixes would cost
more review than the fixes are worth, which is precisely why they are Low.

### What should change (non-blocking, unchanged from v11)

1. **F-03** (~60 bytes against 331 of headroom) — give §4b's enumerated/prose split an explicit
   subject: "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is
   owned normative prose; the baseline's four sections are all owned normative prose, under no row
   oracle (baseline `:18-20`)."
2. **F-02** (byte-neutral in the REQ) — narrow the baseline's change-control clause from "a
   **content** change" to "a change to any **stated fact**", matching the vocabularies file's
   row-scoped wording. §4b governs the two files as a pair; their change-control rules should not be
   asymmetrically strict. Bumping the baseline to 1.1 and repinning `:202`/`:448` is the alternative,
   but it fixes the symptom rather than the wording that produced it.

Both are appropriate for a single optimizer pass. Neither warrants a further review round on its own
account, and I would not file either again if the document reaches me unchanged a third time.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17
REVIEWED-COMMIT: 455929d4687c990f10c1b00d9441d8f1f219c4a5
