# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (bytes unchanged since v4 approval)
**Upstream that moved:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.6 → v0.7)
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation)

## Overview

**Question answered.** PLAN's own bytes have not moved since the v4 approval anchor. This round the
upstream that moved is **TSPEC**, from v0.6 (`ccc739d1`, the version my v5 confirmation recorded as
`UPSTREAM-STATE: TSPEC sha256:eff5a19b…`) to v0.7 at HEAD (`bfe58851`, `sha256:f629d29d…`) — six
commits, +66/−37 lines. I re-read my v5 cross-review, diffed TSPEC across `ccc739d1..HEAD`, and
measured only the PLAN material that leans on the changed TSPEC text. I did not re-open the batch
DAG, the file-ownership manifest, the AT partition, the expected-red ledger, or the fail-open arm
table — the TSPEC edit touches none of the sections those are derived from.

**What TSPEC now says that it did not say at approval time.**

| TSPEC section | Before (v0.6) | After (v0.7) |
|---|---|---|
| Front matter | grounded on FSPEC v0.9 | grounded on FSPEC v0.12; v0.7 erratum note added |
| §Open Questions ERR-7 | open divergence: BR-1 forbids the `docType` conjunct, AT-02 has two contradictory expected sets | **CLOSED**, resolved by FSPEC v0.11/v0.12 |
| §Open Questions ERR-3 | open: BR-15's expected read set includes an enumeration that contributes no member | **CLOSED**, resolved by FSPEC v0.11 |
| §A.2 | the `docType` conjunct is "routed as ERR-7", a divergence from BR-1 | the conjunct **implements BR-1 as written**; §I.3's predicate is BR-1 directly. Byte-identity restated as "dispatches **outside BR-1's rule**", not "non-authoring" |
| §D.1 | domain-membership tests assert every value is a catalogue member | tests assert every **non-`null`** value is a member; `null` is the healthy `corpusOutcome` and deliberately not a catalogue member |
| P-2a, P-2b, P-10, ERR-2, §T.6 land-proof retry | `orchestrate-dev.js:13515`, `:7663`, `:12821`, `:12915`, `:14551-14556`, `:15167` line anchors | restated as enclosing-symbol / call-shape citations per DEC-DOC-01; P-2a reworded to "carry the authoring classification" (three object literals + one positional argument) |

**Direction of travel is again toward PLAN, not away from it.** Every substantive TSPEC change in
this round adopts a reading PLAN was already written to:

- §D.1's non-`null` scoping is **PLAN's own** correction, raised as TE F-01 against PLAN v0.3 and
  carried in LI-23's row ("the `corpusOutcome` equality is scoped to non-`null` observations, and
  that scoping is load-bearing") with the positive half delegated by name to LI-10's
  `DIVERGENT-CORPUS` dispatches 1, 2 and 4. TSPEC has now absorbed it verbatim, including the
  "do not repair this by expecting `LEARNINGS_CORPUS_OUTCOMES ∪ {null}`" prohibition. The two
  documents agree; no task row changes.
- P-2a's rewording matches LI-01's premise-suite phrasing exactly — "three object-literal
  `dispatchKind: \"authoring\"` sites plus one positional `\"authoring\"` argument", the
  distinction PLAN raised as TE F-12 because a literal grep returns 3, not 4. LI-01's injective key
  `(enclosing named function, prompt-source symbol)` still resolves cleanly against TSPEC's new
  symbol-level citation: `(converge, creatorPrompt)`, `(erratumRound, erratumAuthorPrompt)`,
  `(erratumRound, land-proof-retry template)`, `(reviewLoop, optimizerPrompt)`. The premise suite
  is still authorable, still structural, still green at batch 1.
- The DEC-DOC-01 de-anchoring is a citation-form change with no behavioural content. LI-01 already
  asserts its premises **structurally, never positionally** — the row says so in as many words — so
  a TSPEC that stopped naming line numbers removes a hazard for this PLAN rather than creating one.
  ERR-2's re-citation likewise leaves LI-11's fourth run-shape fixture untouched.
- ERR-3's closure explicitly says "AT-33 tracks the correction; **nothing in this TSPEC changes**",
  so LI-11's hand-transcribed AT-33 read set — enumeration excluded — is still the right oracle.

**What does not survive the edit is PLAN's description of its upstream**, in exactly the same way
and in exactly the same place as v5's findings: §Errata still presents ERR-3 and ERR-7 as live
defects and still describes TSPEC §A.2 as diverging from BR-1. Both statements were true of TSPEC
v0.6 and are false of TSPEC v0.7. That is prose about the state of two other documents, not an
oracle, a fixture, a batch or a dependency edge — so it is Medium, not gating, and it is the same
one-line-edit class of repair v5 already asked for.

## Batches

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
