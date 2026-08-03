# CR errata for harvest — pdlc-merge-phase

Findings from the Phase CR cross-reviews (`CROSS-REVIEW-product-manager-CODE-v1.md`,
`CROSS-REVIEW-test-engineer-CODE-v1.md`) that are advisory and not code-shaped —
spec erratum or LEARNINGS material, not a source/test change. Recorded here so
`harvest-learnings` picks them up. The code was judged correct in every case
below; only a document or a future LEARNINGS entry needs to change.

## 1. TSPEC §5.3's guard 22/23 ordering table is wrong; the code and FSPEC agree

PM finding 2 (`CROSS-REVIEW-product-manager-CODE-v1.md:25`–`:27`). `decideMerge`
(`orchestrate-dev.js:977`–`:996`) checks "the last attempt succeeded" before "an
untried candidate remains" — the opposite order TSPEC §5.3's table states. This
is deliberate: under the TSPEC's stated order a success with an untried
candidate still in the chain would trigger a second `gh pr merge`. The shipped
behaviour matches FSPEC §6.2 ("The first candidate that succeeds ends the
chain") and NFR-2. **Action for a future TSPEC revision:** swap guards 22/23's
order in §5.3's table to match the code; the code comment already carries the
reasoning, so this is a table-only fix.

## 2. TSPEC §2.4 says row ids are `number | string`; every row id ships as a string

PM finding 4 (`CROSS-REVIEW-product-manager-CODE-v1.md:33`–`:35`). Every
resolution carries a string (`row: "2"`, `"3"`, `"11a"`, `String(row)` at
`orchestrate-dev.js:1299`), while TSPEC §2.4 declares `row: number | string`
and PROPERTIES PROP-M-17 writes `row === 3`. Code and tests are internally
consistent (`mergePhase.test.js` asserts `"3"`, `"18"`, `"4"` throughout), so
nothing is broken — but a reader diffing PROPERTIES against the suite will
stop here. **Action for a future TSPEC revision:** one line in §2.4 ("row ids
are strings throughout") retires the ambiguity. Do not change the code.

## 3. US-05's sanctioned gap: the §2.5 non-overwrite case is a silent, not escalated, hole

PM finding 5 (`CROSS-REVIEW-product-manager-CODE-v1.md:37`–`:39`). US-05 asks
that the queue row and the merge always agree. The §2.5 non-overwrite case —
PR merged, row not `done`, because the row read something other than the
expected pre-merge status — is precisely the state US-05 excludes, and the
operator's only signal is a plain note (`orchestrate-dev.js:1443`), not an
escalation. FSPEC §7.4 and §11 row 18 sanction this deliberately (the row
describes work this run did not drive; overwriting would destroy the
operator's own record) — **not a code defect, no change requested**.
**Action for LEARNINGS:** record this as the one residual gap between US-05's
promise and the shipped behaviour, so the next queue stall on a `blocked` row
is diagnosed in seconds rather than rediscovered.
