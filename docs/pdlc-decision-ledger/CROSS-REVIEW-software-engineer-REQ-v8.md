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

## Questions

## Positive Observations

## Recommendation

## Verdict
