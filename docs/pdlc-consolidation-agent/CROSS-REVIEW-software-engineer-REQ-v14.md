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

## Questions

## Positive Observations

## Recommendation

## Verdict
