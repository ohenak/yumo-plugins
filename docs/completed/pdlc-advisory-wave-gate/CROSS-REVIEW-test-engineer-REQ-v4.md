# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Delta reviewed:** `4b925b1a..c58fd61d` (three erratum commits: lineage/Status, `c8aa22a4` base, AC-5.1)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation — this REQ was previously approved at v1.13)

## Problem / Context

This is an erratum delta confirmation, not a fresh review. I approved this REQ at v1.13. A targeted
erratum landed in three commits and bumped it to v1.14, addressing eight routed items — two of mine
(the pre-A6 catalogue argued at an unnamed base; AC-5.1's "observably identical" tree contradicted by
the run's own record writes) and six of pm-author's (ignored-path boundary, failed-capture observable,
lineage `Downstream`/`Upstream`/`Cross-Reviews` rows, and the `draft` Status).

Per DEC-ERR-03 my scope is this REQ measured against its upstream **at HEAD**, not the item list. The
upstream this REQ leans on is `docs/_constraints/pdlc-wave-gate-baseline.md` (cited at v1.2),
`docs/_constraints/pdlc-advisory-corpus-baseline.md`, and
`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`. I re-read all three at their current
bytes and re-measured the two runtime facts the delta now pins.

## Goals

Answer one question: does the delta resolve the routed items without breaking what I previously
approved, and is the document still a faithful compression of its upstream at HEAD?

## Non-Goals

- Re-reviewing unchanged sections of the REQ (REQ-AWG-01..04, 06, 07, §1–§5, §9–§10) beyond the
  citations the delta newly leans on.
- The relocation of this feature's directory to `docs/completed/` — routed to SE Q-02 and still open
  there; the erratum correctly disposed only the `Status` field and said so.
- Product framing, technical mechanism, or TSPEC-altitude test design. Under the altitude rule my
  findings here ask only for black-box-testable outcomes.

## Constraints

Upstream re-read at HEAD (`origin/main` = `11420461`), with what I verified:

| Upstream | Checked | Result |
|---|---|---|
| `pdlc-wave-gate-baseline.md` **v1.2** | Version row, `Verified at` row, §4 preamble | Matches the REQ's citation. §4 states verbatim that PR #66 (`bb4d36fb`) "makes M-WG-8's five-member reading a **pre-change** fact: true at `c8aa22a4`, false at this base", and that M-WG-8 is deliberately left as measured because AC-1.1 and R-5 argue from the pre-change state. The delta's `c8aa22a4` naming is exactly what upstream says. |
| M-WG-13 / M-WG-14 | Re-ran both recipes at HEAD | `ADVISORY_SEAMS` = frozen `["A1".."A6"]` (`orchestrate-dev.js:1952`); `ENVELOPE_DEFAULTS` = frozen `["E-1".."E-6"]` (`:1942`). Both readings hold. |
| `pdlc-advisory-corpus-baseline.md` §1, §4 | Record/escalation carriers | `docs/_queue/ESCALATIONS.md` is the one durable, append-only per-seam record — a tracked working-tree file. Feeds F-01 below. |
| `REQ-pdlc-advisory-tier` (v1.4) AC-1.6, AC-2.2, AC-3.4, AC-3.6, AC-9.2 | Each cited id read at its current bytes | All five exist and still say what this REQ compresses them to. AC-9.2 still carries both halves the REQ restates (action-without-record is a defect; a failed record write refuses the action). No drift. |
| Referenced commits | `git cat-file` | `c8aa22a4` and `bb4d36fb` both resolve; `bb4d36fb` is the PR #66 merge. |

Constraint carried into the findings: an erratum may not introduce a new internal contradiction in
the section it edits. AC-5.1 is a black-box tree-equality criterion, so its exclusion list must be
exhaustive over the carriers the run writes on AC-5.1's **own** trigger path — otherwise the criterion
cannot be satisfied by a correct implementation and the acceptance test written from it is
unpassable-by-construction rather than merely imprecise.

## Acceptance Criteria

Item-by-item landing check against the erratum diff (`4b925b1a..c58fd61d`):

| # | Routed item | Landed? | Evidence in the delta |
|---|---|---|---|
| 1 | AC-1.1 / R-5 name the pre-A6 base (`c8aa22a4`) | **Yes** | AC-1.1 now reads "The five-member 'before' this argues from is the reading at base commit `c8aa22a4`; HEAD already carries A6 (baseline v1.2 §4, M-WG-13)." R-5 adds "The pre-change readings are measured at `c8aa22a4`; M-WG-13/M-WG-14 are the post-change ones." Both agree with upstream §4 verbatim. See F-03 for the one loose end. |
| 2 | AC-5.1 observation point pinned / record carriers excluded | **Partly** | The observation point is now pinned ("the moment restoration completes") and two carriers are excluded. The enumeration is not exhaustive over AC-5.1's own trigger path — see **F-01**. |
| 3 | AC-5.1 ignored-path boundary | **Yes** | "So are paths ignored by `.gitignore`, which are operator files A6 never wrote and never restores over." This closes the destructive-restore reading cleanly and is black-box checkable (compare tracked + non-ignored untracked paths only). |
| 4 | Observable for a failed **capture** | **Yes** | "Given the pre-A6 state cannot be captured at all, Then no repair is proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different outcome from a failed restoration." Three positive conjuncts, all observable at REQ altitude, and it correctly routes to AC-5.2 rather than inventing a new halt. This is now writable as its own acceptance test. |
| 5 | `Downstream` row names artifacts, not a feature | **Yes** | Now `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)`; all four files verified present in `docs/pdlc-advisory-wave-gate/`. |
| 6 | `Upstream` row carries the ordered chain | **Yes**, with a regression | Now `` `pdlc-advisory-tier` REQ (the five-seam tier this extends) → **REQ** ``. Chain shape and bolding are as requested; the resolvable path was dropped in the process — see **F-02**. |
| 7 | `Cross-Reviews` row | **Yes** | Now `harvested into `LEARNINGS-pdlc-advisory-wave-gate.md``; that file exists on the branch (32.8 KB). |
| 8 | `Status` disposed | **Yes** | `approved (shipped)`, v1.14, with the changelog naming PR #66 (`bb4d36fb`), queue row 19 `done`, and explicitly leaving relocation with SE Q-02. The changelog paragraph is accurate against the diff it describes. |

Nothing I previously approved was broken: the delta touches only the header block, AC-1.1's closing
sentence, AC-5.1's body, and R-5's closing sentence. AC-5.2, AC-5.3 and all of REQ-AWG-06 are
byte-identical, so the halt contract and the record contract I approved at v1.13 stand unchanged.

## Risks

- **A partially-exhaustive exclusion list is worse than none.** Because AC-5.1 now enumerates
  carriers explicitly with an em-dash list, a reader takes the list as closed. An implementer writing
  the acceptance test will diff the tree against the snapshot, see the `ESCALATIONS.md` append that
  AC-6.2 *requires* on the same path, and either (a) file a defect against a correct implementation,
  or (b) quietly widen the oracle to "no source files changed" — an absence-shaped oracle that no
  longer proves the wave's uncommitted work survived. Both outcomes lose the property AC-5.1 exists
  to protect. F-01 is one clause away from closed.
- **"HEAD already carries A6" is a moving reference in a document that otherwise pins its bases.**
  The baseline's own re-verification rule ("A later default-branch commit is a fresh check, not an
  inherited one") means an unpinned "HEAD" claim silently decays. Today it is true — I re-measured —
  so this is Low, not a correctness defect (F-03).

## Obligations

| ID | Question |
|----|---------|
| Q-01 | Does A6's escalation-log append (AC-6.2) happen strictly **after** restoration completes on every one of AC-5.1's three Givens (refusal, budget exhaustion, red re-gate)? If any of them can append before restoration, the exclusion clause needs an ordering statement as well as a carrier list. Answering this inside AC-5.1 is what makes F-01's fix complete rather than partial. |
| Q-02 | Is AC-6.3's halt-report carrier a working-tree file on this path, or run-transient output? If it is a file, it belongs in the same exclusion list; if it is transient, saying so in one clause pre-empts the next reader asking. |

Carried forward unchanged and still non-gating: SE Q-01/Q-02 and my own TE Q-01/Q-02 from v1.13.
SE Q-02 (relocation to `docs/completed/`) remains the right owner for the directory move; the
erratum was correct not to pre-empt it.

## Positive Observations

- The failed-capture clause (routed item 4) is the strongest thing in this delta. It states three
  positive conjuncts — no repair proposed, none applied, wave halts on its own gate — rather than the
  absence-shaped "nothing bad happens" a lesser edit would have written, and it names AC-5.2 as the
  halt owner so the test has a status to assert rather than a status to rule out. That is a
  falsifiable acceptance test at black-box altitude, written without reaching into TSPEC mechanism.
- The `.gitignore` boundary is scoped by *provenance* ("operator files A6 never wrote"), not merely
  by path class. That reasoning generalises: it is the same rule any future restore-shaped seam will
  need, and it is stated in one sentence a reader can apply.
- `c8aa22a4` is not just named but named consistently in both places that argue from the pre-change
  catalogue, and both agree with what the upstream baseline §4 says about M-WG-8 being deliberately
  left as a pre-change measurement. The erratum resisted the tempting wrong fix — rewriting AC-1.1 to
  the six-member reading — which would have broken the argument the criterion is making.
- The v1.14 changelog paragraph accurately describes its own diff and explicitly says what it did
  **not** dispose (relocation, still SE Q-02's). An erratum that states its own boundary is one a
  later reader can trust.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | AC-5.1's carrier exclusion list is not exhaustive over its own trigger path: it excludes AC-6.1's record append and AC-5.2's queue-row write, but a refusal / budget exhaustion / red re-gate is exactly what AC-6.2 requires an escalation-log append for, and `docs/_queue/ESCALATIONS.md` is a tracked working-tree file (corpus baseline §1). Read literally, the "observably identical" tree is still contradicted at run end on every path AC-5.1 governs. Fix: add AC-6.2's escalation-log append — and AC-6.3's report carrier if it is a file (Q-02) — to the same exclusion clause. | §6, REQ-AWG-05, AC-5.1 |
| F-02 | Low | delta | local | The `Upstream` row gained the ordered chain but lost the resolvable path: `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` is now named only as `` `pdlc-advisory-tier` REQ ``, and that file lives under `docs/completed/`, not beside this REQ. A reader cannot follow the chain without a search. Fix: keep both — `` `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` → **REQ** ``. | Lineage header, `Upstream` row |
| F-03 | Low | delta | local | The "before" reading is pinned to `c8aa22a4` but the "after" is not: AC-1.1 asserts "HEAD already carries A6" and R-5 says "M-WG-13/M-WG-14 are the post-change ones", while upstream measures §4 at `origin/main` `11420461` and its re-verification rule makes an unpinned HEAD claim decay silently. I re-measured and both readings hold today. Fix: name `11420461` alongside the §4 citation, symmetrically with the `c8aa22a4` naming. | §6 AC-1.1; §7 R-5 |
| F-04 | Low | inherited | nonlocal | Traceability asymmetry with upstream: `pdlc-wave-gate-baseline.md`'s `Cited by` row records this REQ as citing it from "§1, §4, §5, §8", but the REQ cites `M-WG-*` ids from §6 (AC-1.1, AC-1.2, AC-4.2, AC-5.1, AC-5.2) and §7 (R-5) as well. The stale row is upstream's to fix, but it means a change-control sweep over the baseline would not consult this REQ's acceptance criteria. Pre-existing at v1.13; the delta neither caused nor worsened it. | Cross-doc: baseline `Cited by` row vs REQ §6/§7 |

FINDING: High | delta | local | §6 REQ-AWG-05 AC-5.1 | the record-carrier exclusion list omits AC-6.2's `ESCALATIONS.md` append, which the same refusal/budget/red-re-gate Given requires, so the "observably identical" tree criterion is still self-contradictory at run end
FINDING: Low | delta | local | Lineage header `Upstream` row | the ordered chain landed but the resolvable path to `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` was dropped
FINDING: Low | delta | local | §6 AC-1.1 and §7 R-5 | the pre-change base is pinned to `c8aa22a4` but the post-change reading is left on an unpinned "HEAD" rather than upstream's `11420461`
FINDING: Low | inherited | nonlocal | baseline `Cited by` row vs REQ §6/§7 | upstream records this REQ as citing the baseline from §1/§4/§5/§8 only, while §6 and §7 cite `M-WG-*` ids too

## Recommendation

**Needs revision** — one High finding (F-01), local to the section this erratum edited.

Seven of the eight routed items landed cleanly and nothing I approved at v1.13 was broken. The eighth
— AC-5.1's observation point — landed the hard half (the observation point, the ignored-path
boundary, the failed-capture outcome) and left the mechanical half incomplete: the carrier list omits
the one carrier that AC-5.1's own Given guarantees will be written. This is a one-clause fix inside
the already-edited paragraph, which is why F-01 is tagged `delta, local` rather than left to route
back through the ordinary revision loop. F-02 and F-03 are worth folding into the same touch since
they sit in the same two edited regions; F-04 is upstream's and gates nothing.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 3}
