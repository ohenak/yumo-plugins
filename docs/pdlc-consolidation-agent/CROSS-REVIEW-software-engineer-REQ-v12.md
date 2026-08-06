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

## Questions

## Positive Observations

## Recommendation

## Verdict
