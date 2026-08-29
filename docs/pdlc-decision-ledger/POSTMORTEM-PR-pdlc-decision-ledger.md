# Post-Mortem: Phase PR — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`PLAN-pdlc-decision-ledger.md` v0.4) |
| Downstream | PROPERTIES (blocked), IMPL (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..4}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | te-author |
| Date | 2026-08-29 |

RESOLVED: no

## Phase

**PR** — PLAN authoring and review, specifically the **erratum round** that follows a two-reviewer
approval. PLAN v0.3 carried an approving verdict from both reviewers with residual minor findings,
so the `DEC-ERRROUTE-01` erratum channel opened a bounded, targeted-edit round to land those items.
The phase halted at the **delta confirmation** gate: the confirmers were asked whether the routed
erratum set is now reflected in the document, and both answered no. Non-approving: `pm-review`,
`te-review`.

The halt is therefore *not* a review-loop exhaustion (`MAX_REVIEW_ROUNDS` was never reached) and
*not* a substantive disagreement about the plan's design. It is a **delivery** failure: an erratum
round produced a v0.4 in which at least one routed item is byte-unchanged from the approved v0.3.

## Iterations

**4 review rounds, then 1 erratum round (the halt).**

| Round | PLAN version | product-manager | test-engineer |
|---|---|---|---|
| 1 | v0.1 | Approved with minor changes | Needs revision |
| 2 | v0.2 | Approved with minor changes | Needs revision |
| 3 | v0.3 | Approved with minor changes | **Approved with minor changes** |
| — | — | *two-reviewer approval ⇒ erratum channel opens on the residual minor set* | |
| 4 (erratum delta confirmation) | v0.4 | **Needs revision** | **Needs revision** |

Round 3 is the convergence point: both reviewers approved, and the residual findings were routed as
erratum items rather than a fifth full round. Round 4 is the confirmation of that erratum landing,
and it failed on both sides.

Note the shape of rounds 1–3: `pm-review` approved every version from the first, while `te-review`
needed three rounds to converge. The document was never contested on product grounds; every round of
real churn was testability churn — falsifiability of acceptance conjuncts, ownership of oracles,
citation accuracy. That is the same axis the erratum round then failed on.

## Reviewers

Two confirmers, both non-approving. Findings verbatim as recorded by the gate, grouped by reviewer.

### product-manager (`pm-review`) — 3 findings

| # | Severity | Class | Locus | Finding |
|---|---|---|---|---|
| PM-1 | High | delta / nonlocal | §Batches, T-00a (`PLAN:114`) | One routed erratum item unlanded — T-00a is byte-unchanged and still asserts two-sided acceptance whose second conjunct ("the filtered count is still `102` after this PLAN's twelve new modules exist") cannot be evaluated in batch 1; it is still a terminal obligation of T-12a, which explicitly disclaims the count; the terminal home (`DoD:444–445`) is never named. The ambiguity has already produced a wrong downstream artifact (PROP-DISC-07 relocated the count to T-19, leaving T-12a's twelve-name obligation unowned). |
| PM-2 | — | delta | Header (`PLAN:9`) | `DECISIONS` pin. |
| PM-3 | — | delta | §Batches, row T-11 (`PLAN:128`) | Inserting the `decisionLedger`-exclusion paragraph into T-11's two census operands leaves the second operand ("`… and orchestrate-dev.js`'s source minus four owned regions …") stranded after a full stop as a lowercase-`and` fragment; content intact, structure not. |

### test-engineer (`te-review`) — 3 findings

| # | Severity | Class | Locus | Finding |
|---|---|---|---|---|
| TE-1 | High | delta / local | §Batches, T-00a / T-12a | Routed item unlanded — T-00a and T-12a are byte-identical to the approved v0.3 bytes; T-00a's second acceptance conjunct is still unevaluable in batch 1, T-12a still disclaims the count, and **no task id owns the terminal `102` assertion**. |
| TE-2 | Medium | delta / local | §Batches T-11, §Definition of Done | The `decisionLedger` census-token exemption cites "TSPEC v0.8 §5.5"; the authority is TSPEC §7.3 (which itself cites §5.4). §5.5 ("The one thing the driver never holds") says nothing about the census. |
| TE-3 | Medium | delta / local | Header, Upstream pins | The `DECISIONS` pin reads `sha256:13aba061…4bb89f` but the digest at HEAD is `13aba061…4fb89a` — a transposed tail. The staleness anchor does not identify the artifact it names. |

**Independently verified while writing this post-mortem:**

```
$ shasum -a 256 docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md
13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a
```

TE-3 and PM-2 are the same defect seen from two lenses, and both are correct: the header at
`PLAN:9` reads `…4bb89f`, the file digests to `…4fb89a`. The `b`/`f` pair and the `9`/`a` pair are
each transposed — a hand-transcription slip, not a stale pin.

TE-1 and PM-1 are also the same defect. Their conjunction is what makes the halt unambiguous: the
two reviewers converged on one High from independent lenses, and PM-1 additionally supplies
*downstream evidence* that the ambiguity has already escaped the document — PROP-DISC-07 in
PROPERTIES relocated the `102` count to T-19, leaving T-12a's twelve-name obligation unowned. That
is a concrete, already-materialised cost, not a hypothetical one.

## Disagreement

## Best-Guess Root Cause

## Recommendation
