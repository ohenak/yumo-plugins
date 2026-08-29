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

No High findings. The delta is three edits — a version cell, a new note, two pins — and it breaks
nothing previously approved: every clause downstream of the two re-pinned sites (§4 C-5's
threshold table, §5 REQ-DECLEDGER-01's expected value, §7 O-1's `M-1d`/`M-2e` constraint) reads
correctly at v1.2 because v1.2 changed no fact those clauses depend on. The Mediums below are all
carried from round 8, unchanged and out of this erratum's declared scope; they are recorded so the
round-8 disposition is not lost when v9 supersedes v8 as the latest cross-review.

| ID | Severity | Provenance | Locality | Section anchor |
|----|----------|-----------|----------|----------------|
| F-01 | Medium | inherited | nonlocal | Baseline *Cited by* (`baseline:6`) vs `REQ:339`, `REQ:378`, `REQ:386` — round 8's F-02 still open, and v1.8 widened it: `§6 R-5`, `§7 A-1` and `§7 O-6` cite `M-*` ids from a document the propagation list does not name |
| F-02 | Medium | inherited | nonlocal | §4 C-5 `maxBytes` rationale (`REQ:182`) — round 8's F-01: the 3,204 slack is stated as per-record framing allowance, but the TSPEC's re-measured rendering leaves ~441 B of real headroom |
| F-03 | Medium | inherited | nonlocal | §5 REQ-DECLEDGER-01 (`REQ:202-206`) — round 7's F-01 / round 8's F-03: the equality basis is still wider than the expected value backing it |
| F-04 | Low | delta | local | v1.9 note (`REQ:23`) — the note names the two re-pinned sites as "§1 and §5", but the first is §2 G-1 (`REQ:74`, `REQ:93`); the Baseline's own propagation list calls the same site `§2 G-1` |
| F-05 | Low | inherited | nonlocal | Header *Cross-Reviews* row (`REQ:13`) — still enumerates `v{1,2,3,4,5,6}`, now three rounds stale |

FINDING: Medium | inherited | nonlocal | Baseline *Cited by* (baseline:6) against REQ:339, REQ:378, REQ:386 | Round 8's F-02, unresolved and now one site wider. The Baseline states its *Cited by* list "is the propagation path for a `Version` bump, so a new citation is added here in the same edit that mints it" (`baseline:6`). The list still reads `§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5`, while the REQ cites `M-*` ids from three sites it omits: `§6 R-5` (`M-6b`/`M-6c`/`M-6d`/`M-7b`/`M-7c`/`M-7d`, minted by v1.8), `§7 A-1` (`M-6b`/`M-6c`/`M-7b`/`M-7c`) and `§7 O-6` (`M-4e`). This round is exactly the failure the rule exists to prevent — a version moved and a body site was missed — so the omission is no longer theoretical: R-5 and A-1 are precisely the clauses a re-measurement must move, since they are where both defaults are labelled revisable. Fix is three entries in the Baseline's list, no REQ change and no further `Version` bump, since the ids themselves are unchanged. Non-gating and repairable in the next edit that touches the Baseline.

FINDING: Medium | inherited | nonlocal | §4 C-5 maxBytes rationale (REQ:182) | Round 8's F-01, untouched by this erratum and now corroborated from the TSPEC side. C-5 justifies `12500` as clearing `M-7b` "by 3,204 — 50 bytes per record of framing allowance", which reads as 3,204 bytes available for framing. The value is right; the slack is not. The te-review item routed into this round records the TSPEC re-measuring the same 63-record set at 11,300 rendered bytes with ~441 B of headroom against 12,500 — an order of magnitude less than the sentence implies, and about three records at the `M-7b` mean of 148. This matters because C-5 itself scopes the bound to "the index block as it appears in the prompt" (`REQ:184-185`), the form that includes block framing. Fix is one clause: state the allowance as covering both per-line and block framing, or cite the TSPEC's measured rendered figure as what is cleared. No value change; A-1's operator-revisability already absorbs a later re-size. Recorded here for continuity — the TSPEC-side re-measure is se-author's and is already routed.

FINDING: Medium | inherited | nonlocal | §5 REQ-DECLEDGER-01 (REQ:202-206) | Round 7's F-01 and round 8's F-03, unchanged and correctly outside this erratum's scope. AC-01 asserts equality over each line's id, statement and citation, while the expected value it cites — `M-1d` project-level and `M-2e` per feature directory — supplies ids only, so for the great majority of lines two of the three compared fields have no stated source. The v1.7 note routes this to the FSPEC-opening edit and `FSPEC:52` now carries the same id-only basis, so the home is unchanged. No re-derivation is asked for here; recorded so the item survives the supersession of v8.

FINDING: Low | delta | local | v1.9 erratum note (REQ:23) | The note says "§1 and §5 REQ-DECLEDGER-01 still read `v1.1`". The second is right (`REQ:205`), the first is off by a section: the re-pinned line is `REQ:93`, inside `## 2. Goals` (`REQ:74`) in the G-1 elaboration, not §1 Problem / Context (`REQ:45-73`), which cites the Baseline nowhere. The Baseline's own propagation list names that same site `§2 G-1`, so the note and the substrate now disagree about where the edit landed. The pin itself is correct, so nothing downstream is wrong — but under DEC-ERR-01 the change note *is* the sweep record, and a sweep record that misnames a swept site is the artifact a later re-measurement greps. One-character fix at the next edit.

FINDING: Low | inherited | nonlocal | Header *Cross-Reviews* row (REQ:13) | The row still enumerates `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3,4,5,6}.md`; v7 and v8 exist on both sides and v9 lands with this file. Pure hygiene, carried from round 8, but this row is the REQ's only pointer to its own review history, so a reader following it silently misses the three rounds that produced the current thresholds and pins.

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the Baseline's *Cited by* list meant to name every citing site, or only the ones a `Version` bump must re-verify? I have read it as the former, since it calls itself "the propagation path" — but if the intent is the latter, `§6 R-5` and `§7 A-1` still qualify, because both restate a measured *number*, not just an id. |
| Q-02 | Round 8's Q-01 is now answered from the TSPEC side (the bound includes block framing, headroom ~441 B). Does that answer want to land back in C-5 as F-02 proposes, or does the REQ deliberately keep the substance floor and leave the rendered figure entirely to the TSPEC? Either is defensible; only C-5 can settle which. |

## Positive Observations

- **The erratum did exactly what it declared and nothing more.** Three sites changed; the diff is
  twelve inserted lines, nine of them the note itself. I checked every clause that reads the
  Baseline at a version (`§4 C-5`, `§5 REQ-DECLEDGER-01`, `§5 REQ-DECLEDGER-04`, `§7 O-1`, `§7 O-5`,
  `§7 O-6`) and none needed to move, because v1.2 added §8 without disturbing §1–§7. "No measured
  value moves" is a checkable claim and it checks out.
- **The claim is backed by an id rather than by assertion.** The note could have said "nothing
  moved"; instead it cites `M-7e`, which is the fact that §8 was measured on the same tree at the
  same `Verified at` commit. That is the form the pm-author altitude rule asks for, and it is why
  I could confirm the claim from the Baseline alone.
- **The routing is clean and explicit.** Three of the five routed items belong to se-author's
  documents, and the note names them as such rather than silently dropping them or restating them
  here. Restating them would have been the tempting error — they concern C-5's own default — and
  it was not made. Under DEC-ERR-01 that is the difference between an absorbed decision and a
  question re-asked one layer down.
- **The FSPEC cascade the v1.8 note promised has landed.** Round 8's F-05 named two lines
  (`FSPEC:111`, `FSPEC:545`) still carrying `8000` and the retired analogy. Both now read
  `12500` derived from `M-7b`/`M-7c` (`FSPEC:120`, `FSPEC:554-555`), and the FSPEC's own Baseline
  pin is `v1.2` (`FSPEC:11`). The declared debt was paid, unprompted, before this confirmation.
- **No stale live pin survives anywhere in the REQ.** The two remaining `v1.1` strings are
  historical statements about what v1.1 contained, and both are true of the v1.1 commit. That
  distinction — a pin versus a fact about a past version — is the one an incautious sweep would
  have flattened.

## Recommendation

**Approved with minor changes** — no High findings.

Both REQ-owned routed items are resolved, and resolved at the substrate rather than by rewording:
the two body pins now agree with the header, the FSPEC and the Baseline itself, so the `M-7b`/`M-7c`
ids C-5's default rests on resolve at the cited version. The three items belonging to se-author's
TSPEC and DECISIONS are correctly routed rather than restated. Nothing previously approved
regressed, and the REQ is now free of any live `v1.1` pin and of every 8,000-based figure.

The three Mediums are all carried from earlier rounds and none is created by this edit: F-01 is
three entries in the Baseline's propagation list, F-02 is one clause in C-5 that follows the TSPEC
re-measure already routed to se-author, and F-03 is round 7's open item whose home remains the
FSPEC-opening edit. F-04 and F-05 are one-line hygiene. None warrants another erratum round;
folding them into the next edit that touches these files is proportionate.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}

APPROVAL-HASH: sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a
APPROVAL-HASH-NORMALIZED: sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a
REVIEWED-COMMIT: 0fdbe586238a8fbbefd915f99797a9ecd32cd31d
