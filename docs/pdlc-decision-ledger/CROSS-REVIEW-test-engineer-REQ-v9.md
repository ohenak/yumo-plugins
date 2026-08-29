# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.9)
**Date:** 2026-08-28
**Iteration:** 9
**Round type:** Delta confirmation on a previously approved REQ

## Scope

Confirmation that the v1.9 erratum edit resolves the five routed items without breaking the
approved body, plus the DEC-ERR-03 obligation to re-read the upstream this REQ now leans on
(`docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**) at its current bytes and ask
whether the REQ is still a faithful compression of it.

## Routed items — disposition

| # | Routed item | Raised by | Status |
|---|---|---|---|
| 1 | Body still pinned Baseline v1.1 while the header pinned v1.2; `M-7b`/`M-7c` did not resolve at the cited version | pm-review | **Resolved.** `grep -n "v1\.1"` over the REQ returns no live pin: §1 (`:93`) and §5 REQ-DECLEDGER-01 (`:205`) both read `v1.2`. The only remaining `v1.1` strings are the v1.9/v1.7 changelog entries (`:23-26`, `:39`), which describe history and are accurate as history |
| 2 | §-body line 84 cited Baseline v1.1 against a v1.2 header — internal inconsistency in the REQ's own pin | pm-review | **Resolved.** The §1 citation (now `:93`) reads `v1.2`; header (`:15`) and body agree |
| 3 | TSPEC header / §7.3 still pin Baseline v1.1 | se-author | **Correctly routed out.** TSPEC is se-author's document; the v1.9 note (`:27-29`) says so explicitly and restates nothing. Not a REQ defect |
| 4 | TSPEC §3.6/§7.3 retired `8000 − 1200 = 6,800` / "~495 bytes headroom" arithmetic | pm-review | **Correctly routed out**, and clean on the REQ side: no `8000`, `6,800`, `495`, `1200` arithmetic survives in the REQ. The one `8,000` mention (`:33`) is the v1.8 changelog recording its retirement |
| 5 | DECISIONS D-10 retired 8,000-based arithmetic | te-review (me, R2) | **Correctly routed out.** D-10 lives in `DECISIONS-pdlc-decision-ledger.md`, se-author's document |

## Upstream re-read (DEC-ERR-03)

Re-read `docs/_constraints/pdlc-decision-corpus-baseline.md` at HEAD (`Version | 1.2 · 2026-08-28`)
and re-derived every id the REQ now cites. All resolve at v1.2, and every transcribed number is
faithful:

- `M-7b` = 9,296 substance bytes over 63 records; `M-7c` = a 12,500 cap clears it by **3,204**,
  **50** bytes/record framing allowance, and 8,000 sits below `M-7b`. C-5's `maxBytes` row (`:182`)
  transcribes all four numbers verbatim — re-derived independently: 12500 − 9296 = 3204, 3204/63 = 50.
- `M-6b` (63) / `M-6c` (70 clears by 7) — C-5's `maxEntries` row is exact.
- `M-1d` (41 project ids) and `M-2e` (100 feature ids, `pdlc-headless-engine` 22) exist at v1.2 and
  carry the enumeration REQ-DECLEDGER-01 asserts equality against.
- `M-2c`/`M-2d` (14 single-file vs 22 directory-glob), `M-3c` (twice-opened `DEC-LOOP-01`),
  `M-4b`, `M-4d`, `M-4e`, `M-5a` (zero cross-file duplicates), `M-5c`, `M-6d`, `M-7d` — all present
  and all say what O-1/O-5/O-6 and §6 claim they say.
- The v1.9 note's load-bearing claim that no measured value moves is verifiable, not asserted:
  `git show efbf3dad9` (the v1.2 bump) leaves `| Verified at | HEAD 8c673a09f ... |` untouched and
  adds only a new §8 (M-7*); no `M-1`…`M-6` row is edited.

Cross-feature citations spot-checked at their cited files rather than trusted: `DEC-ERR-01`
(`DECISIONS-review-severity-bars.md:88`), `DEC-TERM-01`/`DEC-TERM-02`
(`DECISIONS-loop-termination.md:11,28`, including the "114 approving verdicts" figure at `:18`),
`DEC-ERRROUTE-01` (`DECISIONS-erratum-routing.md:12`), `DEC-LOOPECON-06`
(`docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163`), `REQ-LOOPECON-01b`
(`docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md:146`), and the proposal source
HTML. All exist and none has drifted from what the REQ says about it.

## Testability of the delta

The edit moves a version string only; no acceptance criterion changes shape. Re-checked the two
ACs that depend on the pin and both remain writable as tests without further clarification:
REQ-DECLEDGER-01's oracle is still exact equality of the rendered line set (id + statement +
citation) against the `M-1d`/`M-2e` enumeration on a **frozen fixture copy** at the Baseline's
`Verified at` commit — positive-presence, not containment, not ids-alone, and immune to the live
corpus growing on this branch. REQ-DECLEDGER-07's boundary outcomes (zero in-scope, `maxEntries`
`0`, one over-long line omitted whole) are each one test, and the `12500` default is now the
number a fixture would use. REQ-DECLEDGER-08 remains falsifiable via the two-run replay. No
new-untested surface is introduced by the delta.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | inherited | nonlocal | The Baseline's `Cited by` row (`pdlc-decision-corpus-baseline.md:6`) is declared to be "the propagation path for a `Version` bump", but it names only REQ §2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5. The REQ also cites the Baseline at §1 (`:93`, the version pin itself), §6 Risks (`M-6d`/`M-7d`) and §7 O-6 (`M-4e`) / Assumptions A-1 (`M-6b`/`M-6c`, `M-7b`/`M-7c`). Those sites are invisible to the declared propagation path — which is exactly how this round's stale `v1.1` pins survived a version bump. Registering them makes pin staleness mechanically checkable | §1 / §6 / §7 O-6 / A-1 vs Baseline `Cited by` |
| F-02 | Low | inherited | nonlocal | Header `Cross-Reviews` field lists `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3,4,5,6}.md`, but v7 and v8 exist on the branch (and this file is v9). A reader following the field to reconstruct which findings were dispositioned misses the last rounds | Header table, `:13` |

FINDING: Medium | inherited | nonlocal | §1 / §6 / §7 O-6 / A-1 vs Baseline `Cited by` row (`pdlc-decision-corpus-baseline.md:6`) | The Baseline's declared version-bump propagation path omits four REQ citation sites (§1's pin, §6's `M-6d`/`M-7d`, O-6's `M-4e`, A-1's `M-6b`/`M-6c`/`M-7b`/`M-7c`), so a future bump can leave those pins stale undetected — the same mechanism that produced this erratum round
FINDING: Low | inherited | nonlocal | Header table `:13` Cross-Reviews field | Field still enumerates REQ cross-reviews v1–v6 while v7/v8 exist on the branch

## Questions

None. Nothing in the delta required a clarifying question before a test could be written.

## Positive Observations

- The erratum is minimal in the right way: a version string in two places, with the changelog
  entry stating explicitly which routed items belong to other documents and why they are not
  restated here. No collateral edits to approved AC text.
- The v1.9 note's "no measured value moves" claim is independently checkable from git history
  rather than asked to be taken on trust — the `Verified at` commit is genuinely unchanged.
- C-5's `maxBytes` rationale carries the full derivation chain (9,296 / 3,204 / 50 / "8,000 sits
  below `M-7b`") by id, so a reviewer can re-derive the default without opening the Baseline, and
  a test fixture can be sized from the REQ alone.

## Recommendation

**Approved with minor changes** — the delta resolves all five routed items, the three that belong
to TSPEC/DECISIONS are correctly routed rather than half-fixed here, and the upstream re-read at
Baseline v1.2 finds the REQ still a faithful compression. Two non-gating findings, both inherited
and nonlocal.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a
APPROVAL-HASH-NORMALIZED: sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a
REVIEWED-COMMIT: 0fdbe586238a8fbbefd915f99797a9ecd32cd31d
