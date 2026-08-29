# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.4)
**Date:** 2026-08-29
**Iteration:** 5
**Round type:** delta re-review under DECISION FREEZE
**Last reviewed commit:** `25a19ff885a58e7ce7d1b55daacfb1d619704db5` (v4)

## Context

**The document under review did not change.** `git diff 25a19ff88 HEAD --
docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` is empty, and
`git log 25a19ff88..HEAD -- <that path>` lists no commit. The last commit touching it is
`25a19ff88` — the v1.4 discharge commit I reviewed at iteration 4. So there is no delta in
this document's own bytes to re-review, and no prior finding of mine could have been
addressed by an edit that does not exist.

**What did move is the upstream this document derives from.** Between `25a19ff88` and HEAD,
`TSPEC-pdlc-decision-ledger.md` advanced through nine commits — `039555ea9`, `d462a9475`,
`471d3a4b9`, `396a7b0f3`, `cc2c09e53` (**v0.8**, the Phase P erratum round over §7),
`1a2d78cba`, `4b28af44a`, `588f4323e`, `5189b73fb` (**v0.9**, round 9's confirmation
findings over §5.4, §7, §7.2, §7.3 and the changelog). REQ and FSPEC did not move: their
HEAD digests are `sha256:ce6b133f…3c7b7c` and `sha256:2bd5c3ef…5aed39`, byte-identical to
the `UPSTREAM-STATE` anchors my v4 recorded. The TSPEC digest is now
`sha256:eef45ef3…0623c8`, against v4's `sha256:1f1d7752…afc77`.

That makes this round a **re-confirmation against moved upstream**, not a re-review of a
revision. Under the freeze, the only thing that can block is a load-bearing claim in this
document that the moved TSPEC has made false. So my scope is exactly: every claim
DECISIONS-v1.4 makes *about TSPEC bytes*, re-checked against TSPEC at HEAD rather than
against the v0.7 bytes I checked it against last round.

**Result of that check, stated up front:** every derived figure, every mechanism claim, and
every erratum-status claim in this document still reads true at TSPEC v0.9. One literal is
now stale — the document names TSPEC's HEAD version as **v0.7**, and HEAD is **v0.9** — but
the payload that literal carries (the 8,000-based arithmetic is retired, the re-measurement
is discharged) is unchanged and still correct. That is recorded as a Medium, `inherited`,
and it does not block.

## Options Considered

*(pending)*

## Decision

*(pending)*

## Consequences

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
