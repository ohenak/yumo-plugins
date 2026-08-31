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

**Approved with minor changes.** Zero High, zero Medium, two Low — both `inherited`/`nonlocal`,
neither actionable inside the document while its bytes are frozen. **DECISIONS still holds as
approved against REQ v1.7.**

Every REQ claim DECISIONS leans on, re-read at the current version rather than trusted from v10:

| Claim DECISIONS makes about REQ | Status against REQ v1.7 |
|---|---|
| **C-5** requires every artifact classification `pdlc stats` makes to be the driver's classification over the same bytes (DEC-STATS-01 premise) | True — C-5's text is byte-unchanged by this erratum; the diff cites it, does not amend it |
| C-5's four classifiers are shipped exports of `orchestrate-dev.js` — `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex` | True at HEAD; and REQ v1.7 adds no fifth rule — the document-type catalogue is internal to `parseReviewFilename`, surfaced as `reason: "bad_doc_type"` |
| C-5 is "the constraint the whole design exists to satisfy" (DEC-STATS-03) | Still true, and now more so: a catalogue divergence flips a row to **harvested** rather than shifting a denominator |
| **REQ-STATS-02** requires the JSON top-level key set to be set-equal to the printed metric set plus one schema-version field (DEC-STATS-02) | True — REQ-STATS-02 untouched this round |
| **REQ R-5** rests a consumer-stability guarantee on `schemaVersion` existing | True — untouched |
| **REQ G-4** frames this as a read-only reporting command | True — untouched |
| This REQ carries no non-goal forbidding edits to `pdlc/engine/` (DEC-STATS-01's trade is open) | True — the non-goal set is untouched; NG-6 still concerns harvest deletion only |

**The bar I am applying is the one set at v9 and held at v10, unchanged.** Under a decision freeze,
only two things block: a defect the revision introduced (there is no revision to this document, so
that limb is vacuous), or a factual contradiction between the document and upstream/repository HEAD.
The second limb is this round's whole job, and it produced no contradiction. The one substantive
risk the erratum opened — a catalogue rule escaping the injected four-classifier bundle — I tested
against the source and it does not obtain.

**Both Low findings are inherited and carried, not new.** F-01 is the K-3 routing clause that still
says an include-count divergence is "owed upstream in TSPEC, not resolved here" after TSPEC v1.7
resolved it; TSPEC did not move this round, so the staleness is unchanged from v10. F-02 is the v1.6
changelog's present-tense upstream-grounding line, which asserts *"REQ HEAD (v1.4) matches its
pin"*; REQ is now v1.7, so this round widens a gap that was already there at v10 (REQ was v1.6
then). Neither is `delta`: this round's edit created neither, it only made F-02's staleness more
conspicuous. Tagging both `inherited` is the honest reading, and it is what keeps this round
non-gating.

## Consequences

**For Phase D / PLAN.** Not blocked, and not changed from v10. PLAN reads DECISIONS' ten-site
co-change table, the K-row partition and the falsifier column. All three are intact, and none of
them is downstream of the edited REQ clause: REQ-STATS-06's survivor-versus-harvested semantics
settle what a *reported value* is, not where the module lives or how the parser seam is guarded. No
PLAN task's boundary, ordering or falsifier moves because of this erratum.

**For the implementer.** Unchanged from v8/v9/v10. The array-equality warning on `c8.include`
(P9-02 asserts `toEqual`, so position matters, not just membership); the `MODULE_NAMES`
copied-class (4 → 5) versus packed-class (5 → 6) distinction that must **not** be synchronised; and
K-9's `pdlc/README.md` site having no red test behind it — all still matter, all still stated
correctly.

**For upstream (REQ).** Nothing owed by this document. I want to record the shape of this erratum
approvingly, because it is the second time in this feature that the erratum channel has produced the
outcome it exists for: a clause that contradicted its own preceding rationale, contradicted C-5, and
dissented from every downstream reading of the same file was withdrawn at the source rather than
being propagated into four downstream documents. The v1.7 changelog's *"one clause decided, no rule
added… No other change"* is exactly the attestation a frozen downstream reviewer needs to bound the
re-check, and it was accurate — I verified the diff is two hunks and +12/−3.

**For upstream (FSPEC / TSPEC).** Nothing owed from this document. Neither moved this round. I note
without raising it that FSPEC and TSPEC now carry the downstream renderings of REQ-STATS-06, and
their own confirmation rounds — not this one — are where that propagation is checked; it is outside
what DECISIONS decides.

**On DEC-STATS-03, a positive observation worth preserving.** This round is the first time the
parser-seam decision has been stress-tested by an upstream change rather than argued on its merits,
and it held: because the decision was framed as *"never diverge from the driver's classification"*
rather than as a list of the specific classifications in force at the time, a REQ erratum that
changed what one classification *means* required no amendment to the decision at all. That is the
property a good constraint-shaped decision has, and it is the reason the freeze is cheap here.

**Third consecutive round of substantial upstream movement landing outside this document's subject
matter.** v9 (TSPEC erratum), v10 (TSPEC v1.7) and now v11 (REQ v1.7) have each moved an upstream
this document is pinned to, and none has required a byte of it to change. That is the healthy signal
of a correctly-scoped DECISIONS — it compresses constraints, not the ACs those constraints govern —
and it is worth carrying to harvest as corroboration of the co-change discipline in
`DOMAIN-CONSTRAINTS.md`.

DEFERRED (carried, unchanged from v10): nothing in the pipeline retires a downstream routing clause
once the erratum it routes is discharged upstream — F-01 is discovered only by a cascade
confirmation like this one. Worth a line in the erratum checklist: when an erratum lands upstream,
name the downstream documents whose routing clauses it retires.

DEFERRED (carried, now fourth consecutive round): the dispatch's TSPEC pin (`f2261510…`) does not
resolve to the blob on the branch (`a06a6032…`). The *version* it names is unambiguous, so no round
has been impeded, but four rounds is a pattern. Pipeline observation, not a document defect.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | K-3's obligation cell still routes the include-count divergence upstream — *"Upstream divergence, owed in TSPEC, not resolved here (TE F-05)"* — but TSPEC v1.7 resolved it and now states the same *seven → eight* the document carries. The clause describes a debt already paid. TSPEC did not move this round, so this is unchanged from v10, not created by the REQ erratum. No number, obligation, falsifier or task boundary changes. Fix when the freeze lifts: re-word to record the divergence as resolved in TSPEC v1.7. | K-3 row, *Obligations the decisions create* |
| F-02 | Low | inherited | nonlocal | The v1.6 changelog's upstream-grounding line asserts *"REQ HEAD (v1.4) matches its pin"* in the present tense. REQ is now v1.7, so the line reads as a live claim about a superseded pin — this round widens a gap that already existed at v10 (REQ was v1.6 then), rather than creating it. Non-gating: the grounding is a changelog attestation, not a load-bearing decision input. Future changelog attestations should use version-scoped past tense. | v1.6 changelog, upstream-grounding line |

FINDING: Low | inherited | nonlocal | K-3 row, Obligations the decisions create | K-3 still routes the include-count divergence upstream as "owed in TSPEC, not resolved here", but TSPEC v1.7 resolved it and now states the same seven-to-eight the document carries; the clause describes a paid debt. TSPEC did not move this round so the staleness is unchanged from v10. No number, obligation, falsifier or task boundary changes; re-word to "resolved in TSPEC v1.7" when the freeze lifts.
FINDING: Low | inherited | nonlocal | v1.6 changelog, upstream-grounding line | The grounding attestation says "REQ HEAD (v1.4) matches its pin" in the present tense; REQ is now v1.7, so it reads as a live claim about a superseded pin. Pre-existing at v10 and widened, not created, by this erratum; version-scoped past tense in changelog attestations would stop a later reader treating a superseded pin as current.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
APPROVAL-HASH-NORMALIZED: sha256:d298b24c3b488e3fa5985ce3a8cf1ed0fc882b151b0c9b7de18fded6f3a9d034
REVIEWED-COMMIT: 930d65c49d6c308b73f1084da19b852bafe08887
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
