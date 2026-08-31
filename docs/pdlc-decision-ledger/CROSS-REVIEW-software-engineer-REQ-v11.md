# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.10)
**Date:** 2026-08-30
**Iteration:** 11 (erratum delta confirmation, not a full re-review)

## Scope of this confirmation

Routed item under confirmation: the stale `TSPEC v0.7` HEAD-tuple literals — the `§ Context`
passage reading "so at HEAD (TSPEC **v0.7**, REQ **v1.9** / FSPEC **v1.3** / Baseline **v1.2**)"
and the DEC-DECLEDGER-10/-12 re-evaluation-trigger row repeating `TSPEC v0.7` — against a TSPEC
HEAD that is now **v1.2**.

Scope is the REQ measured against its upstreams at HEAD, not the item list alone.

## Routed item — disposition

Verified at HEAD:

- `TSPEC-pdlc-decision-ledger.md` status row reads `| Draft | se-author | 1.2 | 2026-08-30 |`, so
  `v0.7` is indeed stale by five errata.
- The stale literals are **not** in this REQ. They sit in
  `DECISIONS-pdlc-decision-ledger.md`:36 (`is now **v0.7** and pinned at REQ`), :97–98 (the
  `§ Context` HEAD tuple) and :398 (the DEC-DECLEDGER-10/-12 re-evaluation-trigger row).
- `grep -n "v0\.7" REQ-pdlc-decision-ledger.md` returns exactly two hits, both inside the v1.10
  erratum note that routes the item away (see F-02).

The v1.10 note's routing claim — "live in `DECISIONS-pdlc-decision-ledger.md` (`§ Context`, the
DEC-DECLEDGER-10/-12 re-evaluation-trigger row), not in this REQ … routed to se-author, unedited
here" — is accurate against HEAD, both as to where the literals are and as to who owns that
document. **The routed item is correctly dispositioned.** The substantive claim the tuple
supports (that the one-pass `maxBytes` re-measurement is discharged, every site reading against
`12500`) is unaffected by the version literal and still holds.

## Upstream re-verification at current versions

- **Baseline pin.** Header pins `v1.2`; `docs/_constraints/pdlc-decision-corpus-baseline.md`
  header reads `| Version | 1.2 · 2026-08-28 |`. Every `M-*` id the REQ cites resolves at that
  version: `M-1d`:57, `M-2e`:67, `M-6b`:101, `M-6c`:102, `M-7b`:110, `M-7c`:111, `M-7e`:113. The
  v1.9 sweep is complete — no `v1.1` pin survives in the body (lines 15, 105, 217 all read v1.2;
  the only `v1.1` mention, line 51, is a historical statement about what v1.1 added and is
  correct as tensed).
- **Transcribed values.** `M-6b` = 63, `M-6c` = 70 clears by 7, `M-7b` = 9,296 over 63 records,
  `M-7c` = 12,500 clears by 3,204 — all four match the REQ's §4 C-5 row verbatim.
- **Baseline propagation list.** The Baseline's *Cited by* row now carries `§6 R-5`, `§7 O-6` and
  `§7 Assumptions A-1`, so the omission that raised the sibling item is closed (commit
  `5af3ebe82`). See F-04 for the one consequence.
- **Divergence found.** One clause of the C-5 rationale no longer compresses `M-7c` faithfully;
  see F-01.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §4 C-5 `maxBytes` row attributes to `M-7c` a slack reading `M-7c` does not carry: the REQ now says the 3,204 bytes are "the allowance covering the rendered index's per-line *and* block framing", inside the clause "the Baseline's `M-7c` records that …". Baseline:111 `M-7c` reads "**50** bytes per record of **per-line** framing allowance across all 63", and `M-7d`:113 excludes only "every per-line separator, prefix and newline". The widening is substantively right — C-5 bounds the whole rendered block, so block framing does come out of the same slack — but it is the REQ's inference, not the cited id's statement, and a reader resolving `M-7c` gets a narrower sentence. Fix in one of two ways, both cheap: split the attribution (`M-7c` records the 3,204-byte slack; C-5 bounds the rendered block, so that slack must absorb block framing as well as per-line), or bump the Baseline so `M-7c`/`M-7d` say it and re-pin. Do not leave the widened reading inside the `M-7c` attribution | §4 C-5, `decisionLedger.maxBytes` row (REQ:194) |
| F-02 | Low | delta | local | The v1.10 erratum note asserts the REQ "names no TSPEC version anywhere" in the same sentence that carries the literal `` `TSPEC v0.7` ``. It is a mention, not a use, but the claim is a grep-checkable universal and a grep falsifies it — which is exactly how the next sweep will read it. Rephrase to "carries no TSPEC version pin of its own; the literals quoted above belong to DECISIONS", or drop the literal from the note | § header, v1.10 erratum note (REQ:30–32) |
| F-03 | Low | delta | local | Header *Cross-Reviews* row was corrected this round from `v{1,2,3,4,5,6}` to `v{1,…,9}`, but `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v10.md` already exist on disk and this file is v11. A hand-enumerated list of reviews of the document cannot be current in the document being reviewed; it re-stales every round and will be re-raised every round. Replace the enumeration with a glob (`CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v*.md`) so the row stops being a moving target | § header, *Cross-Reviews* row (REQ:12) |
| F-04 | Low | delta | local | The v1.10 note records the Baseline propagation-list omission as "fixed in the Baseline itself with no REQ change and no id moving". True as to ids, but commit `5af3ebe82` changed Baseline content while leaving `| Version | 1.2 · 2026-08-28 |` standing, and that file's own *Change control* paragraph says "a content change that is not accompanied by a version bump is itself a defect", unqualified. Either bump the Baseline (and re-pin the REQ/FSPEC consumers, cheap — no measured value moves), or amend the rule to exempt the *Cited by* row, which the same row already describes as the propagation path *for* bumps rather than a measured fact | § header, v1.10 erratum note (REQ:27–29); Baseline *Cited by* / *Change control* |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is the intended contract that `maxBytes`' slack absorbs block framing (index heading, blank lines, fence) as well as per-line prefixes? If yes, that belongs in the Baseline at `M-7c`/`M-7d`, since TSPEC will size its rendering against those ids, not against the REQ's paraphrase. |

## Positive Observations

- The routed item was routed rather than absorbed. The REQ names the owning document, the two
  exact loci inside it and the owning role; all three check out at HEAD. That is the cheap
  disposition, and it is the right one — the REQ has no TSPEC pin to keep current.
- The v1.9 Baseline sweep is genuinely complete this time: every body pin resolves at v1.2 and
  every cited `M-*` id exists at that version. The sweep-site correction (`§1` → `§2` G-1) is
  accurate.
- Round-9's non-REQ items (Baseline propagation list, AC-01's expected-value basis) are each
  named with their owner and their disposition rather than silently dropped, which is what makes
  a confirmation like this one checkable at all.

## Recommendation

**Approved with minor changes**

The erratum resolves the routed item without breaking anything previously approved: the routing
is factually correct at HEAD, every Baseline pin and `M-*` id still resolves, and no measured
value moved. F-01 is a Medium fidelity gap between the C-5 rationale and the `M-7c` text it
cites — it should land, but it does not gate this confirmation. F-02 through F-04 are Low.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}
