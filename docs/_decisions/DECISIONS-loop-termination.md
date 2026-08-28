# DECISIONS — loop termination

Project-level decisions about what signal a review loop converges on. Promoted 2026-08-27 by
`/pdlc:consolidate-learnings` from LEARNINGS `pdlc-engineering-loop`, `pdlc-wave-resume`,
`pdlc-learnings-injection`, `pdlc-review-convergence` and `pdlc-rcv-budget-stop`.

Read by `orchestrate-dev` (review-loop driver) and reviewer skills.

---

## DEC-TERM-01: Convergence is a derivative signal, not verdict-at-cap

**Decision.** Review-loop convergence must key on a **derivative** signal — no new ≥Medium finding
for N consecutive rounds ⇒ converged — not on verdict-at-cap, i.e. not on simply running every
document to its round ceiling and reading the final verdict.

**Evidence.** In two features, 4 of 6 tracked documents ran to the 15-round cap while verdicts
were overwhelmingly approving: `pdlc-engineering-loop` recorded 114 approving verdicts across its
review corpus yet still ran to ceiling on most documents — "the cap is doing the converging, not
the loop." A loop that only stops at its ceiling cannot distinguish "still finding things" from
"nothing left to find, but nobody told the driver."

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-engineering-loop (P-2), pdlc-wave-resume
(O-5), pdlc-learnings-injection, pdlc-review-convergence, pdlc-rcv-budget-stop.

---

## DEC-TERM-02: A staleness-only round is not a review round

**Decision.** A round whose only delta is staleness bookkeeping — pins, hashes, or line numbers
drifting because an upstream document moved, with no substantive edit owed to the document under
review — is not a review round. Staleness findings must deduplicate against an existing open item
instead of being re-filed each round.

**Evidence.** `pdlc-engineering-loop` re-filed one stale dispatch-hash defect as a Low finding 54
separate times with zero document edits ever owed — the largest single token-burn in the corpus
traced to pure staleness. `pdlc-wave-resume` produced 8 findings in a single erratum round that
were hand-copied version pins rather than hash-derived citations, none of which changed the
document.

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-engineering-loop, pdlc-wave-resume.
