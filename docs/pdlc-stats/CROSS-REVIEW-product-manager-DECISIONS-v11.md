# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, bytes unchanged)
**Base reviewed v10:** `10963e85dcf2d62fb869f704f02d9d2c76484ba7`
**Upstream at this round:** REQ `f75c348f…` (v1.7) · FSPEC `c7d2c832…` (v1.7) · TSPEC blob `a06a6032…` (v1.7)
**REQ reviewed v10:** `5f3e8051…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — REQ erratum round)

## Context

**No document bytes moved: upstream only.** `git diff 10963e85..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is empty. DECISIONS is unchanged at v1.6 — the same bytes approved at v8 and re-confirmed at v9 and
v10 (`sha256:48522bf9…`).

**What moved is REQ.** `docs/pdlc-stats/REQ-pdlc-stats.md` advanced `5f3e8051…` (v1.6) →
`f75c348f…` (v1.7) in one commit, `e12b78fd8` — a targeted erratum, +12/−3, two hunks: the
changelog row, and one paragraph of REQ-STATS-06. My v10 approval was taken against REQ v1.6, which
no longer exists; this round answers the single question **is DECISIONS still a faithful compression
of REQ as it now stands**.

**FSPEC and TSPEC did not move this round.** The dispatch's FSPEC pin (`c7d2c832…`) and REQ pin
(`f75c348f…`) both reconcile exactly against the files on the branch. The TSPEC pin (`f2261510…`)
again does not resolve to the branch blob (`a06a6032…`, v1.7) — the fourth consecutive round with
that mismatch. It does not impede this round: TSPEC's own bytes are byte-identical to what I
measured at v10, so the version it names is unambiguous and nothing about TSPEC is re-opened here.
Recorded as a pipeline observation, not a finding against DECISIONS, exactly as at v10.

**The REQ erratum, precisely.** REQ-STATS-06 previously read: *"The predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor
even where REQ-STATS-03 reports it malformed."* v1.7 withdraws that clause. It now reads that the
predicate is evaluated over exactly the file set whose bytes the process side sums, so a basename the
driver's catalogue does not recognise — the same one REQ-STATS-03 reports malformed (C-5) —
contributes no process bytes and **counts as no file of its family remaining**: a feature whose only
`CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio. The
changelog states the scope itself: *"one clause decided, no rule added… No other change."*

**Why this is the erratum I flagged as possible at v10, and why it lands outside DECISIONS.** At v10
I recorded that TSPEC §8.3's REQ-STATS-06-versus-BR-16 conflict was open upstream and outside what
DECISIONS decides, with one conditional: *"if reconciliation ever reaches the parser-catalogue seam,
`DEC-STATS-03`'s bundle-identity oracle is where to re-check."* That reconciliation has now landed,
and it does reach the catalogue — so this round is not a formality. I re-opened the seam and tested
it rather than asserting the carve-out held.

## Options Considered

DECISIONS' bytes are frozen for me. What is under test is the relationship between those bytes and
REQ v1.7, so the readings are about that relationship, not about re-opening a decision.

**Reading 1 — REQ-STATS-06 is not cited by DECISIONS, so nothing re-grounds. Insufficient on its
own.** True as far as it goes: `grep` over DECISIONS returns no occurrence of `REQ-STATS-06`,
`survivor`, `catalogue`, or `harvested`. But DEC-ERR-03 asks whether the document is still a faithful
compression of upstream *as it now stands*, not whether the edited id appears in it. A REQ edit can
change what a constraint DECISIONS **does** cite means. So I tested the citations rather than the
id list.

**Reading 2 — the erratum widens what C-5 costs, so DEC-STATS-03's seam must be re-checked.
Adopted, and it passes.** DECISIONS leans on REQ **C-5** four times (DEC-STATS-01's opening premise,
DEC-STATS-03's rationale, the option table's "why not discharge REQ C-5" column, K-4's
construction-site conjunct). C-5's own text is byte-unchanged by this erratum — the diff touches it
only as a parenthetical cite inside REQ-STATS-06. What changed is the *consequence* of a C-5
divergence at the catalogue: before v1.7, a basename outside the driver's document-type catalogue
was a survivor, so a stats-side catalogue that disagreed with the driver's shifted a ratio's
denominator; after v1.7, the same disagreement flips a whole feature-row between **harvested** and a
measured ratio. That is a larger, more visible product failure for the same underlying defect.
DEC-STATS-03 chose Option A — an injected `StatsParsers` bundle with an identity oracle asserting
`===` against `orchestrate-dev.js`'s exports at the single production construction site — precisely
*because* injection is the capability that can hide a production divergence from C-5. The erratum
raises the stakes of that divergence; it does not change which option discharges it. **The erratum
corroborates DEC-STATS-03 rather than straining it.**

**The one way this could have broken, tested mechanically.** If the driver's document-type catalogue
were a *fifth* export — separate from the four classifiers DECISIONS names — then REQ v1.7 would have
made a parsing rule load-bearing that DECISIONS' four-classifier bundle does not reach, and K-4's
"four-classifier object literal occurs exactly once" conjunct would be understated. That would be a
High. I read the source rather than assuming: in `pdlc/workflows/orchestrate-dev.js`,
`parseReviewFilename` tests catalogue membership internally (`REVIEW_DOC_TYPES.includes(docType)`)
and returns the outcome as `{ ok: false, reason: "bad_doc_type" }`. The catalogue is not a separate
seam — its verdict is already carried on the return value of a classifier DECISIONS injects. Nothing
in REQ v1.7 requires a fifth member, so DEC-STATS-03's bundle shape and K-4's exactly-once
construction-site conjunct are both still correctly sized.

**Reading 3 — edit the frozen bytes to record the erratum. Rejected, for the reason v10 gave.**
Nothing in DECISIONS is falsified by REQ v1.7, so there is no false sentence to repair; and editing
frozen bytes would open a downstream re-confirmation obligation on PLAN and PROPERTIES that nobody
asked to discharge.

**Not re-opened:** `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`'s option table,
K-1 through K-9 on their merits, or the standing-costs bullets. None changed; all approved across
v5–v10.

## Decision

_(pending)_

## Consequences

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
