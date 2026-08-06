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

## Positive Observations

## Recommendation

## Verdict
