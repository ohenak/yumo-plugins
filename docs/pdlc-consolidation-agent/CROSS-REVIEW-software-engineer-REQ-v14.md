# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 14
**Scope:** Local (delta re-review — v13 findings + changed sections only)
**Baseline diffed:** `1cebcce..HEAD` (v13's `REVIEWED-COMMIT`; HEAD = `22564a6`).

## Prior-Finding Disposition

`git diff 1cebcce..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is
**empty**. For the third consecutive round the document under review is byte-identical to the one I
approved — 637 lines / 61,109 bytes,
`sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`, the same digest v12 and
v13 both recorded as their `APPROVAL-HASH`. `git diff 1cebcce..HEAD -- . ':(exclude)docs/'` is
likewise empty: across all 145 intervening commits no source file, script, workflow bundle or config
moved, so every `file:line` anchor verified at v13 is verified at HEAD by construction rather than by
sampling.

The 145 commits are Phase T work — the TSPEC, five PM and five TE cross-reviews, a `POSTMORTEM-T`
and its resolution, two amendments to `docs/_decisions/`, and queue-status commits. Not one touches
the REQ or `docs/_constraints/`.

| v13 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`); the `Cited by` row still carries the `§5` entry added by the same commit (`:6`); `Version` is still `1.0 · 2026-08-06` (`:7`). Neither offered fix was taken. The asymmetry against the vocabularies file's **row**-scoped clause (`pdlc-consolidation-vocabularies.md:27-28`) stands. |
| F-03 | Low | **Open — unchanged** | §4b still reads "§1–§4 entire in both" and, with no change of subject, "§1, §2 and §4 are enumerations … §3 is owned normative prose" (REQ `:560-563`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:17-19`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-28`). The ~60-byte subject-scoping clause was not written. |

I re-derived both from the two governed files at HEAD rather than copying v13's text, because those
files could have moved without the REQ moving. `git diff 1cebcce..HEAD -- docs/_constraints/` is
empty and the line numbers above are current.

## Standing-Decision Check

Five project-level decisions now bind reviewer scoring; one is new since v13 and one gained a
companion clause. All are read against the document before scoring, not after.

**`DEC-SEV-03`** (`DECISIONS-review-severity-bars.md:60-84`, new at HEAD) demotes to **Low** a
downstream document's collision with an *enumerated* upstream artifact, provided the collision is
named, priced and routed through the `ERRATUM:` channel. I checked whether it reaches either open
finding and it does **not**: both F-02 and F-03 are findings by a reviewer against the *upstream*
document itself, not a downstream layer's absorbed collision, so the rule's subject does not match.
It changes neither score. I record the check because the rule is new and its non-application should
be explicit rather than assumed.

**`DEC-LAYER-01`'s new companion clause** (`DECISIONS-spec-layer-boundary.md:50-55`) states that
decisions this rule moves down arrive at the receiving layer *with* DEC-SEV-03 — i.e. the cost it
priced ("TSPEC inherits four open decisions") is paid through the erratum channel, not through the
severity bar. That is a statement about Phase T's disposition, not about the REQ. §5a's routing
sentence — "fixture construction and oracle mechanics belong to FSPEC, TSPEC and PROPERTIES"
(`:602-603`) — still names all three receiving layers rather than the next hop, which is exactly
what the companion clause presumes upstream documents do.

**`DEC-CONV-01`** (`DECISIONS-review-convergence.md`) makes an approval **stand** into later rounds
of the same phase, re-openable only by the reviewer who issued it, and only when the intervening
diff touches a section that approval's `Scope` named or the reviewer scores a new Medium-or-higher
against that diff. I hold standing `Approved with minor changes` verdicts from v11, v12 and v13; the
intervening diff on this document is empty; I have no new finding of any severity. The decision's
own re-issue clause describes this round exactly. It governs the verdict, not the diligence — the
sweeps below are the same ones I ran at v13.

**`DEC-SEV-02`** scores a falsified bookkeeping-completeness assertion as Low where no observable,
rule, arm or downstream artefact is wrong and the repair is deleting or narrowing the assertion.
F-03 is squarely of that class and holds at Low on that ground independently of DEC-SEV-01.

**`DEC-SEV-01`** scores a REQ-layer finding about the scope of a governance rule over a shared
normative file as Low when the governed file carries a version-pin obligation whose breach is itself
a defect. Both governed files still carry it (`pdlc-consolidation-vocabularies.md:27-28`,
`pdlc-advisory-corpus-baseline.md:19-20`), so both findings stay Low. A Low surviving another
unaddressed round is not grounds to escalate: the bar keys on detectability, and neither became less
detectable by going unfixed.

No violation of `docs/_constraints/DOMAIN-CONSTRAINTS.md`. DC-09 (REQ altitude, `:245`) is satisfied
for the reason given above; DC-13 (accurate Scope tags, `:356`) is why F-02 remains `Cross-Feature`.

## Findings

Two, carried at the same severity from v13, v12 and v11, both in the governance layer rather than in
the requirements an FSPEC or TSPEC author reads. **No new finding.** There is no changed section to
scan, and under DEC-CONV-01 a standing approval is re-opened only by a Medium-or-higher scored
against the intervening diff — there is no intervening diff.

At v13 I wrote that I would not file these a fourth time. I am recording them here because the
disposition table must account for every prior finding, and because dropping a still-open finding
from the table would make the record say they were resolved. They are stated once, in the table, and
I do not re-argue them below.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 | Low | Cross-Feature | **The baseline file's change-control clause is worded strictly enough to be breached by the commit that introduced it, and the file did not bump.** `pdlc-advisory-corpus-baseline.md:19-20` — "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect." The commit that added that paragraph also added the `§5` entry to `Cited by` (`:6`) and left `Version \| 1.0 · 2026-08-06` unchanged (`:7`). The vocabularies file's escape is unavailable as worded: its clause is scoped to a **row** change (`pdlc-consolidation-vocabularies.md:27-28`). Real size: `Version 1.0` denotes two byte-states, so the pin no longer discriminates provenance — but no *fact* changed, the REQ's two baseline citations transcribe the literal "1.0" and are unaffected as expected values (REQ `:202`, `:448`), and the drift is visible in git. Fix, either: bump the baseline to `1.1` and repin those two citations, **or** narrow the clause to "a change to any **stated fact**". I still prefer the second — the asymmetry is the defect, and §4b governs the two files as a pair. | `pdlc-advisory-corpus-baseline.md:15-20`, `:6-7`; cf. `pdlc-consolidation-vocabularies.md:27-28` |
| F-03 | Low | Local | **§4b's enumerated/prose split is written under an "in both" quantifier, so read literally it contradicts what the baseline file says about itself.** §4b quantifies over both governed files — "§1–§4 entire in both" (`:560-561`) — and the next sentence, with no change of subject, says "§1, §2 and §4 are enumerations … §3 is owned normative prose" (`:562-563`). Applied to the baseline that is false in both directions: `pdlc-advisory-corpus-baseline.md:17-19` states "All four sections are **owned normative prose** … no set-equality oracle ranges over this file", while its §1 *is* a three-row table (`:24-28`) a literal §4b would drag under a row oracle the file disclaims. Non-blocking on three independent grounds: the oracle sentence pins "at Version 1.4" (`:565-566`) and 1.4 is the vocabularies file alone (baseline is 1.0, `:7`), so the intended subject is recoverable inside the sentence; the baseline answers the question itself in a file §4b declares binding; and DEC-SEV-02's class fits exactly. Fix is one clause (~60 bytes against 331 of headroom, Q-01), or deletion of the universal per DEC-SEV-02's preferred repair. | §4b `:560-569`; `pdlc-advisory-corpus-baseline.md:17-19`, `:24-28` |

## Existing-Code Claim Verification (changed sections)

No section changed, so there is no new claim to verify. The live question for an unmoved document is
the inverse: did the codebase move beneath it? It did not. `git diff 1cebcce..HEAD -- .
':(exclude)docs/'` is empty across all 145 commits — no source file, script, workflow bundle or
config differs from the tree v13's table was verified against. That is a proof, not a sample.

I re-derived the five load-bearing anchors anyway, because the exclusion diff cannot catch a claim
that was already wrong at v13, and a version-pin regression is cheap to check.

| # | Claim | Verdict | Evidence re-derived at HEAD |
|---|---|---|---|
| 1 | BL-01 / AC-1.5 / AC-1.6: the two-rung ladder's resolver exists at `orchestrate-dev.js:1833` | **Confirmed** | `:1833` is `export function resolveAdvisoryRung({ _agent, _log, _state, prompt }) {` |
| 2 | REQ-CONS-06 / D-CONS-06: `advisorySummaryRows` at `:2708`, `ESCALATIONS_PATH` at `:2750`, `renderEscalationEntry` at `:2763` | **Confirmed, all three** | `:2708` `export function advisorySummaryRows(dispositions, pubOutcome = {}) {`; `:2750` `const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";`; `:2763` `export function renderEscalationEntry(disposition, ctx, { now }) {` |
| 3 | BL-01a and baseline §2: `ESCALATIONS.md` does not exist at HEAD | **Confirmed** | `git ls-files docs/_queue/` returns `docs/_queue/QUEUE.md` alone — the absent-first framing is still a fact about HEAD |
| 4 | §5's `nudge-consolidation.sh:41` predicate anchor | **Confirmed** | `:41` is still `pending = [p for p in learnings if os.path.basename(p) not in logtext]` — the bare substring test the REQ's predicate change targets |
| 5 | Q-01's size ceiling, and the version-pin sweep | **Confirmed, and no pin regressed** | `check-req-size.sh:41-42` are `LINE_LIMIT=700` / `BYTE_LIMIT=61440`; the REQ is 637 lines / 61,109 bytes — 331 bytes of headroom. `grep -c 'Version. 1\.3'` over the REQ returns **0**; all 13 `1.4` occurrences stand, so every vocabularies citation remains pinned at 1.4 |

No defect row, for the eighth consecutive round. Neither open finding is a row here: both are about
governance text, not about the codebase.

## Questions

Q-01 to Q-03 and Q-05 are carried; Q-05 is materially stronger this round. No new question.

| ID | Question |
|----|---------|
| Q-01 | Not blocking; it bounds F-03's fix. The REQ is **61,109 bytes** against the 61,440-byte hard ceiling (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **331 bytes** of headroom, unchanged because the document is unchanged. F-03's fix is ~60 bytes and F-02's preferred fix is byte-neutral in the REQ, so neither forces a relocation. |
| Q-02 | Carried, still open. Is the version-pin/defect clause meant to bind the commit that *introduces* it? I read it as prospective — a rule cannot govern its own genesis — which is why F-02 is Low and why I prefer narrowing the wording to a retroactive bump. The clause sits in two shared files `pdlc-engineering-loop` will read and may copy, so whichever reading is intended is worth stating once. |
| Q-03 | `Process`, carried. There are now **five** decisions binding reviewer scoring (DEC-SEV-01/02/03, DEC-LAYER-01 + companion, DEC-CONV-01), all recorded by phase-POSTMORTEM resolutions, none cited by either reviewer's skill prompt. DEC-CONV-01 changes the *verdict rule*; DEC-SEV-03 changes how a whole class of downstream finding is scored. A reviewer who does not read `docs/_decisions/` will now mis-score two distinct classes. Should harvest promote them into `DOMAIN-CONSTRAINTS.md` next to DC-13? Not a REQ question and not blocking, but the cost of a miss keeps rising. |
| Q-05 | `Process`, carried and stronger. This is the **fourth** consecutive Phase R round on byte-identical input and the fourth to reach the same verdict from the same two Lows. Three of those four rounds also had an empty diff over everything outside `docs/`. DEC-CONV-01's own logic says a round whose only input is "nothing changed" has no work in it — the standing approval was never re-openable, because re-opening requires an intervening diff. Is there a cheap precondition (an empty-diff check before dispatching Phase R) that would let the orchestrator re-issue a standing approval without spending a round? Workflow question, not a REQ one. |

## Positive Observations

- **The REQ has now survived a full TSPEC review window without an erratum, on top of two FSPEC
  windows.** Between v13 and HEAD a TSPEC was authored and reviewed five times by two reviewers, hit
  the round limit, produced `POSTMORTEM-T`, and was resolved (`:14` `RESOLVED: yes`). Phase T is the
  first layer that must actually *decide* the decisions DEC-LAYER-01 pushed down, so it is the layer
  most likely to discover that an upstream requirement was underdetermined. `grep -n ERRATUM
  POSTMORTEM-T` returns nothing, and `git diff 1cebcce..HEAD -- .../REQ-*.md` is empty across 145
  commits. Twenty-five cross-reviews and three root-cause analyses have now read this REQ without
  routing a single erratum to it.

- **DEC-SEV-03 is evidence *for* this REQ, read carefully.** Both of Phase T's blocking Highs were
  one class: a TSPEC-layer decision rendering an *enumerated upstream artifact* unreachable. That is
  a finding about the TSPEC's collision-disclosure discipline, not about the enumerations. Had the
  REQ's enumerations been underspecified, the postmortem's repair would have been to change them;
  instead every repair was "name the artifact, state what ships instead, raise the erratum" and
  "neither repair changed the decision the finding named" (`DECISIONS-review-severity-bars.md:66-68`).
  The upstream enumerations survived contact with the layer that had to implement them.

- **§5a's three-layer routing paid off a second time.** DEC-LAYER-01's new companion clause
  (`DECISIONS-spec-layer-boundary.md:50-55`) assumes upstream documents route to the receiving layer
  *and* hand down a disposition rule with the decision. §5a already routes "fixture construction and
  oracle mechanics" to "FSPEC, TSPEC and PROPERTIES" (`:602-603`) — all three, not the next hop —
  which is why Phase T inherited the decisions with a named owner rather than discovering them.

- **The two governed files did not drift across a third window.** `git diff 1cebcce..HEAD --
  docs/_constraints/` is empty. A shared reference file cited by an actively-revised TSPEC is exactly
  what a downstream author adjusts in passing; the ownership paragraphs this REQ wrote into both
  files (`pdlc-consolidation-vocabularies.md:18-28`, `pdlc-advisory-corpus-baseline.md:15-20`) are
  what made that temptation legible as a violation, and they have now held through 257 commits.

- **No code claim went stale, and it is provable rather than sampled.** The exclusion diff over
  everything outside `docs/` is empty, converting a spot-check into a proof — and the five anchors I
  re-derived anyway all match, with no version pin regressed. Eighth consecutive round with no defect
  row.

## Recommendation

**Approved with minor changes.** 0 High, 0 Medium, 2 Low — the same two, at the same severity, on
the same unmoved document. Under `DEC-CONV-01` this is a **re-issue of a standing approval**, not a
fresh one: my v11, v12 and v13 approvals stand, the intervening diff on this document is empty, and
I have no Medium-or-higher finding against that diff because there is no diff.

What the verdict asserts, precisely, because "approved again with no diff" can conceal two very
different situations. It is not re-approval by inertia: the two governed files were diffed and found
unmoved; the five load-bearing code anchors were re-derived at HEAD; the version-pin sweep was
re-run; the exclusion diff over everything outside `docs/` was checked across 145 commits; and the
one new decision plus the one amended decision were read and applied before scoring. Any of those
could have turned an unchanged document red — a bumped constraint file, a moved `export`, a decision
the REQ now contradicts, an erratum routed home from Phase T. None did.

Nor is it a lowered bar. Any open High or Medium means Needs revision; there is neither. Both
findings are Low on grounds recorded before this round: F-02 under DEC-SEV-01, F-03 under DEC-SEV-01
**and** DEC-SEV-02. DEC-SEV-03, the new rule, was checked against both and reaches neither. Escalating
identical bytes purely because they went unaddressed for another round is the re-litigation
DEC-SEV-01 and DEC-CONV-01 were recorded to stop.

The test I apply every round: handed this REQ today, is there a decision a downstream author cannot
make? **No** — and the answer is now empirical at three layers. Phase T, the layer that must decide
what DEC-LAYER-01 moved down, exhausted its window on its own collision-disclosure discipline
(DEC-SEV-03's context paragraph, `DECISIONS-review-severity-bars.md:63-70`) and routed no erratum
here.

### The stopping rule, applied against itself

§5a routes "cannot be tested as written" and "needs an oracle" findings downstream. Neither finding
here is of that shape: F-02 concerns a clause's scope over its own genesis commit, F-03 which of two
files a sentence quantifies over. Both are single-clause edits to text this REQ owns; neither
re-scopes anything downstream. They belong here as minor changes, not as a gate. Eight consecutive
clean code sweeps precede this one; a fifth Phase R round spent on two Low governance-wording fixes
would cost more review than the fixes are worth, which is what Low means.

### What should change (non-blocking, unchanged from v13)

1. **F-03** (~60 bytes against 331 of headroom) — give §4b's split an explicit subject: "Of the
   vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned normative
   prose; the baseline's four sections are all owned normative prose, under no row oracle (baseline
   `:17-19`)." DEC-SEV-02's preferred repair — deleting the universal — is cheaper still.
2. **F-02** (byte-neutral in the REQ) — narrow the baseline's change-control clause from "a
   **content** change" to "a change to any **stated fact**", matching the vocabularies file's
   row-scoped wording. §4b governs the two files as a pair; their change-control rules should not be
   asymmetrically strict.

Both fit a single optimizer pass. This phase has converged as far as I am concerned, and I will not
open a further round on either finding's account.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17
REVIEWED-COMMIT: 22564a6f47f6ff4989e64ca6007eac7cf9ca9998
