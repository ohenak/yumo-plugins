# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.9 + one erratum line)
**Date:** 2026-08-28
**Iteration:** 10
**Round type:** Delta confirmation on a previously approved REQ (frozen round)

## Scope

The delta since my v9 review (`REVIEWED-COMMIT: 0fdbe586`) is a **single line**, commit `4f03479e1`,
inside the v1.8 changelog entry at `:36`. It re-points the claim about where FSPEC recites the
default cascade. Nothing in §1–§8 — no goal, constraint, AC, risk or obligation — moved.

Scope of this round: does that one line now state something true of FSPEC at HEAD, and does the
edit break anything that was approved? Everything else in the REQ stays approved and un-relitigated.

## The delta, verified against FSPEC at HEAD

Before: *"FSPEC §3.3's recital of the default cascades; nothing else moves."*
After: *"FSPEC's recitals of the default cascade — §3.1's defaults sentence and §7 A-1, not §3.3,
which carries no bound literal; nothing else moves."*

The new sentence makes three checkable claims. All three hold, and I checked them by reading FSPEC,
not by trusting the commit message:

| Claim | Verification | Verdict |
|---|---|---|
| §3.1 recites the defaults with bound literals | `FSPEC:127` — "Defaults are `enabled` `false`, `maxEntries` `70`, `maxBytes` `12500` (REQ C-5)" | **True** |
| §7 A-1 recites them | `FSPEC:562` — "`maxEntries` (70) from `M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c`" | **True** |
| §3.3 carries **no** bound literal | Ran the negative check over the whole §3.3 body (`FSPEC:155-186`) for `12500`/`12,500`/`8000`/`8,000`/`70`: zero hits. §3.3 is the fail-open leg table; it names conditions and behaviors, never a number | **True** |

The old pointer was therefore wrong in both directions at once — it named a section carrying no
literal and omitted both sections that do. The correction is exact, not merely closer.

**Set-equality on the literal sites, not containment.** I did not stop at confirming the two named
sites exist. `grep -n "12500\|12,500"` over the whole FSPEC returns exactly three lines: `:28` (the
FSPEC's own changelog note), `:127` (§3.1) and `:562` (§7 A-1). Excluding the changelog, the set of
live recital sites is exactly {§3.1, §7 A-1} — precisely what the delta enumerates. A fourth recital
site appearing later, or either of these being deleted, would falsify the sentence; today it is
complete, so this is an enumeration claim I can hold to set equality rather than "at least these".

**No stale `8000` survives as a live default.** Every remaining `8,000`/`8000` occurrence in REQ and
FSPEC is either a changelog note (`REQ:28`, `REQ:33`, `FSPEC:28`) or C-5's `:182` rationale
explaining *why* 8,000 was rejected ("8,000 sits *below* `M-7b` and drops lines on day one"). None is
a live binding. The retired analogy has not leaked back in.

**Internal consistency of the corrected pointer.** `§3.3` now appears exactly once in the REQ
(`:36`, the corrected sentence itself), so there is no second site still carrying the old claim. The
same correction is independently recorded upstream in FSPEC's own changelog (`FSPEC:30-31`), so REQ
and FSPEC now agree rather than the REQ asserting something its downstream contradicts.

**The clause the delta was defending is also true.** The v1.8 note's neighbouring claim, "R-5 and
A-1 carried the retired analogy claim and are decided, not reconciled", still matches the body:
`REQ:339-341` R-5 reads "Both bounds are now measured (C-5, `M-6b`/`M-6c` and `M-7b`/`M-7c`)" and
`REQ:386` A-1 reads "Both defaults derive from measurements taken once against the Baseline's named
commit". Neither retains the `learningsInjection` analogy. The edit corrected the pointer without
disturbing the sentence around it.

## Did the delta break anything previously approved?

No. The edit touches one line of a historical changelog note. It adds no requirement, retires none,
and moves no measured value, so every acceptance criterion I approved at v9 — REQ-DECLEDGER-01's
positive-presence and set-equality obligations, REQ-DECLEDGER-07's `0` and over-long `12500` cases,
REQ-DECLEDGER-08's two-run oracle — is byte-identical and stands. C-5's row at `:182` is untouched,
so the `12500`/`70` figures a test fixture would transcribe are unchanged from the approved round.

## Disposition of my v9 findings

| v9 ID | Severity | Status at v10 |
|---|---|---|
| F-01 | Medium | **Partially addressed, still open.** The commit added `§7 Assumptions A-1` to the Baseline's `Cited by` row — but only on the **FSPEC** side. The REQ side of that row (`pdlc-decision-corpus-baseline.md:6`) still reads "(§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5)", so REQ §1's own pin, §6's `M-6d`/`M-7d`, §7 O-6's `M-4e` and Assumptions A-1's `M-6b`/`M-6c`/`M-7b`/`M-7c` remain invisible to the declared propagation path. Those are exactly the REQ sites whose pins went stale at the v1.1→v1.2 bump and needed the v1.9 erratum. Re-raised unchanged as F-01 below — inherited, non-gating |
| F-02 | Low | **Still open.** Header `Cross-Reviews` field (`REQ:13`) still lists `v{1,2,3,4,5,6}`; v7, v8, v9 and now v10 exist on the branch. Re-raised as F-02 — inherited, non-gating |

Neither was gating at v9 and neither is gating now. Both live in files this frozen round is not
chartered to reopen, and F-01's fix belongs in the Baseline (a shared reference, not a pipeline
artifact), not in the REQ under review.

## Positive Observations

- The correction is the **harder, less flattering** version of the fix. The lazy repair would have
  been to delete the §3.3 pointer and say nothing; instead the note now names both real recital
  sites and states explicitly that §3.3 carries no bound literal — a claim that is mechanically
  falsifiable by grep, which is what makes it worth writing.
- Scope discipline held under a decision freeze. A one-line changelog correction stayed a one-line
  changelog correction; no requirement, threshold or AC was opportunistically edited alongside it.
- The commit message's factual claims match the tree: the Baseline `Version` correctly stayed at 1.2
  because no measured value moved, which is the right call — bumping it would have invalidated the
  `M-*` pins the REQ transcribes for no reason.
- REQ and FSPEC now record the same correction independently (`REQ:36`, `FSPEC:30-31`), so a future
  reader who consults either document alone gets the true pointer.

## Deferred

DEFERRED: Baseline `Cited by` row omits four REQ-side citation sites (§1 pin, §6 `M-6d`/`M-7d`, §7 O-6 `M-4e`, Assumptions A-1) — the FSPEC half was fixed this round, the REQ half was not.
DEFERRED: REQ header `Cross-Reviews` field still enumerates v1–v6 only; v7–v10 exist on the branch.
DEFERRED: This edit changed REQ bytes without minting a version row — the header still reads 1.9 — so the changelog no longer describes the file exactly.

## Recommendation

**Approved with minor changes** — the delta's three claims about FSPEC are each true at HEAD, the
enumeration of recital sites is complete under set equality rather than containment, nothing
previously approved moved, and the two findings carried forward are inherited, non-local and
non-gating. No High finding is open.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | Baseline's `Cited by` row is declared to be "the propagation path for a `Version` bump", but its REQ-side list omits §1's pin, §6's `M-6d`/`M-7d`, §7 O-6's `M-4e` and Assumptions A-1's `M-6b`/`M-6c`/`M-7b`/`M-7c`. This round added the FSPEC-side §7 A-1 only. A future bump would again leave those REQ sites stale with no mechanical check — the precise failure the v1.9 erratum had to repair by hand | `pdlc-decision-corpus-baseline.md:6` |
| F-02 | Low | inherited | nonlocal | Header `Cross-Reviews` field lists v1–v6; v7–v10 exist on the branch, so a reader cannot reconstruct which findings were dispositioned where | `REQ:13` header table |
| F-03 | Low | delta | local | The edit changed REQ bytes without adding a version row; the header still reads 1.9, so the changelog no longer exactly describes the file it heads | `REQ:20-22` version table |

FINDING: Medium | inherited | nonlocal | Baseline `Cited by` propagation path (`pdlc-decision-corpus-baseline.md:6`) | REQ-side citation list still omits §1's pin, §6's `M-6d`/`M-7d`, §7 O-6's `M-4e` and Assumptions A-1's measurement ids, so a future Baseline version bump again leaves those REQ sites stale unchecked; only the FSPEC-side A-1 was added this round
FINDING: Low | inherited | nonlocal | REQ header `Cross-Reviews` field (`REQ:13`) | Field enumerates v1–v6 while v7–v10 exist on the branch
FINDING: Low | delta | local | REQ version table (`REQ:20-22`) | Bytes changed without minting a version row; header still reads 1.9

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
APPROVAL-HASH-NORMALIZED: sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
REVIEWED-COMMIT: cd38979467ddeb500a332820c6b3035fed531716
