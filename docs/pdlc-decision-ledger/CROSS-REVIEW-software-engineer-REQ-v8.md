# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8)
**Date:** 2026-08-28
**Iteration:** 8
**Scope:** delta confirmation of the erratum edit `6fd604320..HEAD` (v1.7 → v1.8, commits
`4e197abe5`, `0756cefed`, `273d0ce00`) plus the cited substrate
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2 (`efbf3dad9`). Changed sections only:
the header pin and v1.8 note, §4 C-5's threshold table, §6 R-5, §7 A-1. Unchanged sections
already approved were not re-litigated. The REQ at HEAD was re-read for this confirmation
(DEC-ERR-03).

## Routed Items — Disposition

All routed items reduce to two: the *type* of the two thresholds, and the *value* of `maxBytes`.
Both are resolved, and resolved by measurement rather than by rewording.

| Routed item (raisers) | Disposition |
|---|---|
| `maxEntries`/`maxBytes` typed "positive integer" while FSPEC E-7 requires `maxEntries: 0` to be a valid admits-nothing value (pm-review; se-author, TSPEC ERR-1, four restatements) | **Resolved.** Both rows now read `non-negative integer` (`REQ:172-173`), and C-5's `maxEntries` cell states the consequence in the terms E-7 uses — "`0` is a valid admits-nothing value, not a malformed one falling back to `70`". This matches FSPEC E-7 verbatim in outcome ("Not an error, not a fallback to the default, not a halt", `FSPEC:311`) and matches the shipped `parseLearningsConfig` precedent the raisers cited. The positive-integer/`0`-rejects-to-`70` inversion is gone. |
| `maxBytes` default `8000` was an unmeasured `learningsInjection` analogy, falsified as below the standing corpus (pm-review, te-review, se-author, TSPEC ERR-2) | **Resolved.** The default is now `12500`, derived by id from Baseline v1.2's new `M-7b`/`M-7c` (`REQ:173`), and the header pin moves `v1.1` → `v1.2` in the same edit (`REQ:15`). |
| R-5 still flagged `maxBytes` as an unmeasured analogy (pm-review, se-author) | **Resolved, and re-aimed rather than deleted.** R-5 now records the residual risk that actually remains — both bounds are measured against *one commit*, not a growth model, citing `M-6d`/`M-7d` (`REQ:329-333`). That is the honest successor risk, not a softened restatement of the retired one. |
| A-1 still carried "`maxBytes` (8000) remains a `learningsInjection` analogy" (pm-review, se-author) | **Resolved.** A-1 now derives both defaults from measurements cited by id and keeps the operator-revisability the raisers asked be preserved (`REQ:377-380`). |

**Independent replay of the substrate, before reading it.** I re-derived Baseline v1.2's §8 from
the working tree rather than trusting the transcription: summing id + heading statement + file
path over every `DECISIONS-*.md` record gives **5,262** bytes over 41 project-level records
(`M-7a`), and **9,296** over the 63-record `M-6b` worst standing case once
`docs/completed/pdlc-headless-engine/` (22 records, 4,034 B) is added — mean 148, maximum 238.
Every figure in `M-7a`/`M-7b` matches exactly. `M-7c`'s arithmetic follows: `12,500 - 9,296 =
3,204`, and `3,204 / 63 = 50.9`, so "50 bytes per record" is a floor, correctly stated. The
value is not an analogy any more; it is reproducible from the tree.

**Cross-check against the rendering, not just the substance.** The TSPEC measures the same
63-record set *rendered* at 10,859 index bytes, and 12,059 with its ≤1,200 B framing budget
charged (`TSPEC:422`, `TSPEC:434`, `TSPEC:1312`). `12,500` clears 12,059, and `TSPEC:472`
already names 12,500 as the value that does — so REQ and TSPEC now agree on the number from two
independent directions (substance floor plus framing allowance; measured rendering plus block
budget). That agreement is the strongest evidence the erratum landed. It also exposes F-01
below: the two derivations agree on the value but not on how much slack it buys.

## Delta-Confirmation Findings

No High findings. Nothing in the delta breaks anything previously approved: the edit touches
four sites, all inside C-5's blast radius, and every previously-approved clause that depends on
these thresholds (§5 REQ-DECLEDGER-07's bound-pinning, §5's Then-clause at `REQ:286-290`, §7 O-1's
omission-order obligation) reads correctly at the new values without change. The three Mediums
below are one-clause edits; none reopens the erratum.

| ID | Severity | Provenance | Locality | Section anchor |
|----|----------|-----------|----------|----------------|
| F-01 | Medium | delta | local | §4 C-5, `maxBytes` rationale (`REQ:173`) — the 3,204 slack is described as per-record framing allowance, but ~1,200 B of it is a fixed block budget, so real headroom is 441 B, not 3,204 |
| F-02 | Medium | delta | local | §7 A-1 (`REQ:377-380`) / Baseline *Cited by* (`baseline:6`) — this edit mints `M-7b`/`M-7c` citations at A-1, a site the Baseline's own propagation list still omits, in the same edit that bumps its `Version` |
| F-03 | Medium | inherited | nonlocal | §5 REQ-DECLEDGER-01 (`REQ:185-189`) — round 7's F-01 is untouched: the comparison basis is still wider than the expected value backing it |
| F-04 | Low | inherited | nonlocal | Header *Cross-Reviews* row (`REQ:13`) — still enumerates `v{1,2,3,4,5,6}`, now two rounds stale |
| F-05 | Low | delta | nonlocal | `FSPEC:111` and `FSPEC:545` — the cascade the v1.8 note declares is owed, not yet taken: FSPEC still recites `maxBytes` `8000` and the retired analogy claim |

FINDING: Medium | delta | local | §4 C-5 `maxBytes` rationale (REQ:173) | The value is right but the slack it claims is not. C-5 justifies 12500 as clearing `M-7b` "by 3,204 — 50 bytes per record of framing allowance", which reads as 3,204 bytes available for framing. The TSPEC's measured rendering of the same 63-record set charges two different things against the same bound: per-line framing of 10,859 − 9,296 = 1,563 (≈25 B/record), *plus* a fixed block framing budget of ≤1,200 B (TSPEC:434, TSPEC:1312). Total 2,763, leaving 441 B of real headroom — roughly three records at the M-7b mean, not the 50-B-per-record cushion the sentence implies. This matters because C-5 itself scopes the bound to "the index block as it appears in the prompt" (REQ:175-176), which is the form that includes the block framing. Fix is one clause: state the allowance as covering both per-line and block framing, or cite `TSPEC:472`'s 12,059 directly as the figure cleared. No value change, and A-1's operator-revisability already absorbs a later re-size.

FINDING: Medium | delta | local | §7 A-1 (REQ:377-380) and Baseline *Cited by* (baseline:6) | Round 7's F-02 is not just still open, this round re-minted it. The Baseline states its *Cited by* list "is the propagation path for a `Version` bump, so a new citation is added here in the same edit that mints it". This edit mints `M-7b`/`M-7c` citations at §7 A-1 and bumps the Baseline to v1.2 — and the list at `baseline:6` still reads `§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5`, with no `§7 A-1` and no `§7 O-6` (`REQ:368`, cites `M-4e`). A-1 is precisely the clause a future re-measurement must move, since it is where both defaults are justified as revisable, so the omission costs exactly what the rule exists to prevent. Fix is two entries in the Baseline's list, no REQ change and no Baseline `Version` bump beyond the one already taken.

FINDING: Medium | inherited | nonlocal | §5 REQ-DECLEDGER-01 (REQ:185-189) | Round 7's F-01, unchanged and correctly out of this erratum's scope — recorded so the round-7 disposition is not lost when v8 supersedes v7 as the latest cross-review. AC-01 still asserts equality over id, statement and citation while the expected value it cites (`M-1d`/`M-2e`) supplies ids only, so for 62 of 63 lines two compared fields have no stated source. The v1.7 note routes this to the FSPEC-opening edit; that remains the proportionate home. Non-gating, and no re-derivation is asked for here.

FINDING: Low | inherited | nonlocal | Header *Cross-Reviews* row (REQ:13) | The row enumerates `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3,4,5,6}.md`; v7 exists on both sides and v8 lands with this file. Pure hygiene, but the row is the only pointer from the REQ to its own review history, so a reader following it silently misses the two rounds that produced the current thresholds. One-character fix at the next edit.

FINDING: Low | delta | nonlocal | FSPEC §3.3 (FSPEC:111) and §7 (FSPEC:545) | The v1.8 note says "FSPEC §3.3's recital of the default cascades", and it has not cascaded yet: `FSPEC:111` still reads "`maxEntries` `70`, `maxBytes` `8000` (REQ C-5)", and `FSPEC:545` still carries "`maxBytes` (8000) is a `learningsInjection` analogy". Neither is a REQ defect — the REQ correctly declares the debt — and both are downstream-owned, so this is recorded to name the exact two lines the cascade must reach rather than to contest the REQ. Filed Low because the pin machinery owns it; it would be High if it were still open when FSPEC is next approved.

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is `maxBytes` intended to bind the index block *including* the ≤1,200 B framing the TSPEC charges (in which case standing headroom is 441 B), or the joined index lines alone (1,641 B)? C-5:175-176 reads as the former and the TSPEC's 12,059 assumes the former, so I have reviewed it that way — but the two readings differ by 1,200 B, which is ~8 records, and only C-5 can settle it. |
| Q-02 | `maxBytes` is now non-negative, so `0` is admissible — under E-8 plus E-6 that composes to "no line fits, therefore no index block", the same terminal outcome E-7 gives for `maxEntries: 0`. Is that the intended reading, or is a symmetric `maxBytes: 0` edge owed in the FSPEC alongside E-7? I did not file it as a finding because the composition is already derivable from REQ:289-290. |

## Positive Observations

- **The fix is reproducible, which is the whole point of the erratum.** Round 7 approved a
  `maxBytes` value that no one could check; v1.8 replaced it with one I could re-derive from the
  tree in a single pass, byte-exact against `M-7a`/`M-7b` including the mean and the maximum.
  The move from "author analogy" to "cited measured fact by id" is exactly the pattern this
  feature is trying to institutionalise, applied to itself.
- **R-5 was re-aimed, not deleted.** The easy erratum would have struck the risk once the value
  became measured. Instead R-5 now names the risk that genuinely survives — a default sized to
  one commit's floor is outgrown as the corpus grows — and cites `M-6d`/`M-7d`, the two Baseline
  facts that say so. That is a strictly better risk register than v1.7 had, and it keeps A-1's
  revisability load-bearing rather than decorative.
- **The type fix is stated in the consuming document's own terms.** C-5 does not merely say
  "non-negative"; it says why `0` is admissible in the same vocabulary FSPEC E-7 uses. An
  implementer reading C-5 alone now cannot write the positive-integer validator that produced
  the inversion, which is the failure mode `parseLearningsConfig` already solved once.
- **Blast radius was bounded and the bound held.** Four sites changed; I checked every clause
  downstream of the thresholds inside the REQ (REQ-DECLEDGER-07, the §5 Then-clause, O-1) and
  none needed to move. The v1.8 note's "nothing else moves" is accurate, and it names the one
  thing that does move outside this document (F-05) instead of leaving it silent.

## Recommendation

**Approved with minor changes** — no High findings.

The delta resolves every routed item and breaks nothing previously approved. Both thresholds are
now measured facts cited by id, the type inversion against FSPEC E-7 is closed, and R-5/A-1 no
longer carry the retired analogy. The three Mediums are all one-clause or one-list-entry edits:
F-01 corrects how much slack 12,500 buys without changing the value, F-02 adds two entries to the
Baseline's propagation list, and F-03 is round 7's open item recorded for continuity, already
routed to the FSPEC-opening edit. None of them warrants another erratum round — folding F-01 and
F-02 into the next edit that touches these files is proportionate, and F-05 belongs to the FSPEC
cascade the REQ itself declares.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}
