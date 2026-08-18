# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.7, 2026-08-18)
**Upstream re-read:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` v0.12 (sha256:41fb21e8…)
**Date:** 2026-08-18
**Iteration:** 10 (upstream-cascade confirmation; FSPEC bytes unchanged since v9 approval)

## Overview

Not a re-review. The FSPEC's own bytes are unchanged since the v9 approval
(`REVIEWED-COMMIT: fe306b11`); the upstream REQ moved from the approved
sha256:1038b816… (v0.11, commit `68e72db2`) to sha256:41fb21e8… (v0.12, commit `cc009367`).
This round answers one question: does the FSPEC still hold as a faithful compression of the
REQ as it now stands?

Method: re-read `CROSS-REVIEW-test-engineer-FSPEC-v9.md`, took
`git diff 68e72db2 cc009367 -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`,
then re-read the *current* upstream text behind every FSPEC clause that leans on C-7, C-8,
AC-1.1 or the commit-ordering rules — not just the item the round announced. Scope is measured
against upstream at HEAD (DEC-ERR-03), so anything the FSPEC cites that the REQ no longer says,
or no longer says the same way, is in scope whether or not it was on the dispatch list.

## Upstream delta re-read

## Upstream delta re-read

The delta is a **pure addition** — no line of REQ v0.11 was deleted or reworded. Two hunks:

1. Version row `0.11 → 0.12` plus a changelog paragraph (one correction, SE erratum).
2. A new subsection under **C-7**, *"Held classes and the interim state"* (REQ :263–272),
   holding four claims: (a) C-7 governs the repo's own CI checks at each commit and **does not**
   govern this REQ's completion criteria, which are evaluated when the sweep is complete
   (AC-1.1's *given*); (b) while a deletion class is held, AC-1.1 being unsatisfied is an
   incomplete feature on an unmerged branch, not a C-7 red and not a registered expected failure;
   (c) "There is no skip-list, no expected-failure inventory and no tolerated-red register in this
   feature: C-8 already forbids that shape"; (d) where a check observing a held class would
   otherwise run red in repo CI before that class lands, the resolution is **ordering** — never
   registration — and the branch does not merge on a green subset.

Nothing the FSPEC quotes verbatim from the REQ changed: C-5, C-6, C-8, R-8, AC-1.1's
set-equality, AC-1.2's term set, AC-1.3, AC-5.2's eight run-variable collections and O-3's
manifest disposition are byte-identical to the text the v9 approval was taken against.

## Does the FSPEC still hold?

**Yes, with one wording tension recorded below.** Clause by clause, against the current upstream:

- **BR-SWEEP-2 "Green at every commit"** (:264–266) compresses C-7 as *every commit passes the
  L-9 gate command set when run at that commit*. The new subsection says exactly this and narrows
  nothing: it separates gate-greenness-per-commit from criterion-satisfaction-at-completion. The
  FSPEC never claimed a criterion is satisfied at every commit, so no clause is falsified.
- **AT-1.1** (:602–606) is stated *"Given HEAD after the sweep"*. That is the same evaluation
  point the REQ now makes explicit ("evaluated when the sweep is complete, AC-1.1's *given* says
  so"). The oracle is unchanged and still black-box checkable: `dist/` entry set **set-equals**
  `{pdlc-cli.mjs}`, or the directory is absent and the probe CLI exists at the single TSPEC path.
- **AT-1.8** (:664–669) drives the per-commit oracle — each commit checked out in turn, L-9's
  three commands run, each passes, each hunk belongs to one class. The addition endorses this
  shape and adds no per-commit obligation the AT would now miss.
- **§3.1's ordering column and BR-SWEEP-4** are precisely the mechanism the REQ now names as the
  sanctioned resolution ("the check becomes live with the class it covers"). Class 9's document
  oracles land *"same commit as, or after, class 7"*; class 7 lands after class 6; class 1 lands
  first and whole. A check observing a held class 7–12 therefore cannot be live before its class,
  which is what the new text requires — already spec'd, no edit needed.
- **The held set is class-consistent.** The REQ changelog's "classes 7–12" maps onto §3.1's
  numbering: AC-1.1's `dist/` set-equality is discharged by class 7 (bundles, manifest, the
  reduced build step), so classes 7–12 held ⇒ AC-1.1 unsatisfied, exactly as the REQ says. No
  renumbering is implied and no §3.1 row needs restating.
- **No FSPEC clause promises a green-subset merge.** AT-5.1 is scoped *"Given every deletion
  merged"*, and §2's BL rows gate the start of work, not a partial finish. The REQ's
  "branch does not merge on a green subset" adds a constraint the FSPEC already respects.

The one place where the new upstream prose and the FSPEC's wording pull against each other is
BR-SWEEP-6's sink-record exemption — F-01 below. It is recorded as Medium, not High: on the
paragraph's own framing the FSPEC's oracle remains the stricter one, and no acceptance test
changes its verdict under either reading.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **REQ v0.12's blanket "no register" sentence has a surface reading that revokes BR-SWEEP-6's sink-record exemption.** The new C-7 subsection states "There is no skip-list, no expected-failure inventory and no tolerated-red register in this feature: C-8 already forbids that shape, and a criterion that is allowed to be red by registration stops being a criterion." BR-SWEEP-6 (:285–294) and AT-1.3 (:622–632) exempt, inside the swept surface, a skip **that reaches the run's skip sink as a registered record** — an exemption keyed to registration. That is exactly the erratum FSPEC §7.3 (:843) closed *without* a REQ edit, on the ground that AC-1.3 and C-8 are M-8-scoped. Read literally and out of context, the new sentence now reaches that exemption and an implementer gets two incompatible oracles for one test: *any* registered pending marker fails (REQ reading) vs. a capability-gated registered skip passes and only bare/unregistered markers fail (FSPEC reading). Non-gating because the paragraph's own framing scopes it — "C-7 governs the repo's own CI checks at each commit", "a **criterion** allowed to be red by registration" — and a runner-capability skip in a surviving module is not a criterion held red by registration; the FSPEC oracle also remains the stricter of the two on every case it decides. Cheapest close: one scoping clause upstream ("this forbids registering a *criterion* as expected-red; it does not reach runner-capability skips recorded by the run's skip sink"), or a sentence in FSPEC §7.3 noting that REQ v0.12's sentence is criterion-scoped. No FSPEC behaviour changes either way. | §4.4 BR-SWEEP-6; §6.1 AT-1.3; §7.3; REQ C-7 *Held classes and the interim state* |
| F-02 | Low | Process | **Upstream version pins are stale.** The header's Upstream field (:9) reads `REQ-pdlc-plugin-retirement.md (v0.11)` and §7.2 (:827) states "REQ v0.11 (2026-08-17) is the version this FSPEC now traces". Upstream is now v0.12 (2026-08-18). Nothing §7.2 claims is falsified — all three closed errata resolve identically in v0.12 — but the provenance trail names a version that is no longer HEAD, and a later reader diffing the pin against the REQ header sees a mismatch with no note explaining it. Refresh both pins to v0.12 and add a one-line §7.2 row (or §7.3 note) recording that v0.12's C-7 addition required no FSPEC edit. | :9; §7.2 (:827) |
| F-03 | Low | Process | **Upstream now cites downstream numbering.** REQ v0.12's changelog line pins its held set as "classes 7–12", a partition defined only in FSPEC §3.1. The mapping is correct today (verified row by row), but the coupling runs upstream-to-downstream: a future FSPEC renumbering or class split silently invalidates a REQ sentence, and no oracle observes the pairing. Prefer naming the held artifacts (bundles, manifest, reduced build step and everything ordered after them) over the class indices, or note in §3.1 that the class numbering is now cited upstream and is not free to change. | §3.1; REQ v0.12 changelog |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the held state have any operator-visible surface this feature owes a check — e.g. does anything record *which* classes are held while the branch sits unmerged? The REQ says the state is deliberately unregistered, which reads as "nothing to test", and the FSPEC accordingly specifies nothing. Confirming that reading is intended (rather than an omission) would close the last thing this delta could have implied for §6. |
| Q-02 | Carried from v9, still open for the TSPEC round: does §7.3's SE-v8 F-04 routing oblige TSPEC §5.5 to answer whether the sink comparator pins a join, or may it close as "no join, C2 agreement suffices"? F-01 above makes the answer slightly more load-bearing, since the sink record is now the only thing standing between the two readings. |

## Positive Observations

- **The delta strengthens the FSPEC rather than straining it.** The two rules the addition
  endorses — ordering over registration, and gate-greenness measured per commit while criteria are
  measured at completion — were already the FSPEC's §3.1 ordering column, BR-SWEEP-2 and
  BR-SWEEP-4. The upstream caught up to the compression, not the reverse.
- **AT-1.1's *given* survived contact with the change.** It was written "Given HEAD after the
  sweep" long before the REQ made the evaluation point explicit; had it been written "at every
  commit" this round would have been a High. The altitude discipline paid off.
- **The held-class set is verifiable against §3.1 without interpretation.** Classes 7–12 are
  exactly the classes downstream of the bundles/manifest, so the REQ's claim about AC-1.1 can be
  checked mechanically against the ordering column rather than taken on trust.
- **The addition is purely additive.** Every literal the FSPEC transcribes (L-1's five entries,
  L-2's seven terms, AC-5.2's eight run-variable collections, O-3's manifest disposition) is
  byte-identical to the approved upstream, so no pinned value needs re-transcription and the
  document's citation surface is unaffected.
- Carried and still non-gating from v9: AT-5.2 clause 2 / E-21's "presence" reading (closed by
  TSPEC's non-empty oracle), and the Cross-Reviews field stopping at v4 — folded into F-02's
  provenance refresh.

## Recommendation

**Approved with minor changes.** The FSPEC still holds against REQ v0.12: no clause it compresses
was reworded upstream, no citation points at text that no longer exists, and every acceptance test
keeps the same verdict on the same evidence. F-01 is a wording tension worth one scoping clause,
not a behavioural divergence; F-02 and F-03 are provenance hygiene. No High finding, so the v9
approval carries forward and no revision round is owed.

FINDING: Medium | delta | nonlocal | §4.4 BR-SWEEP-6 / §6.1 AT-1.3 / REQ C-7 held-classes subsection | REQ v0.12's "no skip-list, no expected-failure inventory and no tolerated-red register in this feature" reads, out of context, as revoking the sink-record exemption AT-1.3 and BR-SWEEP-6 rely on; criterion-scoping clause needed upstream or a §7.3 note downstream
FINDING: Low | delta | nonlocal | :9 and §7.2 (:827) | Upstream version pins still read REQ v0.11; upstream is now v0.12 and no note records that the C-7 addition required no FSPEC edit
FINDING: Low | delta | nonlocal | §3.1 / REQ v0.12 changelog | REQ now pins its held set to FSPEC §3.1's class numbering, so a downstream renumbering silently invalidates upstream text and no oracle observes the pairing

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
