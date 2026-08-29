# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.9)
**Date:** 2026-08-28
**Iteration:** 9
**Scope:** delta confirmation of the erratum edit `273d0ce00..0fdbe5862` (v1.8 → v1.9), plus the
cited substrate `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2 (`efbf3dad9`) re-read at
HEAD. Changed sections only: the header version cell, the new v1.9 note, and the two body
Baseline pins (`REQ:93`, `REQ:205`). Unchanged sections already approved were not re-litigated;
the REQ at HEAD was re-read for this confirmation (DEC-ERR-03).

## Routed Items — Disposition

Five items were routed to this round. Two are REQ-owned and both landed; three belong to
se-author's TSPEC and DECISIONS and are correctly absent from this document rather than restated
in it.

| Routed item (raisers) | Disposition |
|---|---|
| §2 G-1 and §5 REQ-DECLEDGER-01 still pinned Baseline `v1.1` while the header, the FSPEC and the Baseline itself are at `v1.2`, so C-5's `M-7b`/`M-7c` could not resolve at the cited version (pm-review) | **Resolved.** Both body pins now read `v1.2` (`REQ:93`, `REQ:205`), matching the header (`REQ:15`) and `FSPEC:11`. `M-7b`/`M-7c` resolve at the cited version: they were minted in `efbf3dad9`, the v1.2 bump. |
| The §-body pin disagreed with the v1.8 changelog's own `v1.2` (pm-review) | **Resolved, and the internal disagreement is gone.** The only surviving `v1.1` strings in the REQ are historical and correct: `REQ:26` ("the same `Verified at` commit as v1.1") and `REQ:39` ("Baseline v1.1 adds `M-1d` and `M-2e`", true of `3bdf541b6`). Neither is a live pin. |
| TSPEC header and §7.3 still pin Baseline v1.1 while REQ/FSPEC/Baseline are at v1.2 (se-author) | **Correctly routed away.** TSPEC-owned; the v1.9 note names it as se-author's and does not restate it (`REQ:27-29`). No REQ text depends on the TSPEC pin. |
| TSPEC §3.6/§7.3 still compute `8000 − 1200 = 6,800` and name `8000` as C-5's shipped default (pm-review) | **Correctly routed away, and the REQ is clean of the retired arithmetic.** A grep of the REQ for `8000` / `6,800` / `495` / `1,200` returns only the two changelog sentences that *retire* the value (`REQ:28`, `REQ:33`) and C-5's contrast clause explaining why 8,000 is below `M-7b` (`REQ:182`). No live 8,000-based arithmetic survives in this document. |
| DECISIONS D-10 still carries 8,000-based arithmetic; TSPEC §3.6 owes a re-measure at 12,500 (te-review) | **Correctly routed away.** DECISIONS- and TSPEC-owned. It does bear on the REQ indirectly — see F-02 — but as a stale *claim about slack* in C-5, not as a stale value. |

**Independent re-verification of the substrate.** I re-read the Baseline at HEAD rather than
trusting the v1.9 note's claim that nothing measured moved. `efbf3dad9` (v1.1 → v1.2) changes
exactly four things: the `Version` cell, two "seven sections"→"eight sections" words in *Change
control*, and the new §8. `Verified at` is unchanged at `8c673a09f`, and §1–§7 are byte-identical,
so `M-1`…`M-6` — and therefore `M-1d`/`M-2e`, which REQ-DECLEDGER-01 transcribes, and `M-6b`/`M-6c`,
which C-5's `maxEntries` rests on — are the same facts at the same commit. The note's "no measured
value moves" is accurate, and `M-7e` is a fair citation for it (it records §8 as measured on the
same tree, at the same commit, by the same re-derivation). Every `M-*` id the REQ cites
(`M-1d`, `M-2c`, `M-2e`, `M-3c`, `M-4d`, `M-4e`, `M-5a`, `M-5c`, `M-6b`, `M-6c`, `M-6d`, `M-7b`,
`M-7c`, `M-7d`, `M-7e` — checked one by one) exists in v1.2. So do the non-Baseline citations
I re-checked at HEAD: `DEC-ERR-01` and its "absorbed, not routed" wording
(`DECISIONS-review-severity-bars.md:88`, summarised at `pdlc/OPERATIONS.md:29`), `DEC-TERM-01`'s
114 approving verdicts and 15-round cap on `pdlc-engineering-loop`
(`DECISIONS-loop-termination.md:17-18`), `DEC-TERM-02`, `DEC-LOOPECON-06`
(`docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163`), `DEC-ERRROUTE-01`
(`DECISIONS-erratum-routing.md:12`), and the proposal's `M4` / `R3-2` anchors. No
nonexistent-authority citation in this document.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
