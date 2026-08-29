# Post-Mortem: Phase D — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `TSPEC-pdlc-decision-ledger.md` (v0.6, `88fe6dbae`) ← `REQ` v1.9 `sha256:ce6b133f…`, `FSPEC` v1.3 `sha256:2bd5c3ef…`, Baseline v1.2 |
| Downstream | Phase D re-entry; PROPERTIES, PLAN (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..7}.md`, `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1..3}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | se-author |
| Date | 2026-08-28 |

RESOLVED: no

**Failure class:** ERRATUM-PROTOCOL. Phase D halted because the delta confirmation of the
TSPEC erratum round did not pass — non-approving: `te-review` — and the follow-up budget of
**1 round** was already spent.

## Phase

**D** — technical design: TSPEC authoring and review, DECISIONS authoring and review, and the
erratum channel opened against the approved TSPEC when its upstream moved.

The document itself reached approval. TSPEC **v0.4** was approved by both reviewers at round 4
(`product-manager`: *Approved with minor changes*, 0 High; `test-engineer`: *Approved with minor
changes*, 0 High). DECISIONS reached the same state at round 3. What halted the phase is
downstream of that approval: REQ moved to v1.8 and then v1.9 under its own erratum channel,
changing `C-5`'s `maxBytes` default from `8000` to `12500`; the cascade re-opened the TSPEC
(rounds 5–7). Round 7 was the **delta confirmation** of round 6's erratum edit. It returned
`VERDICT: Needs revision` from `te-review` with one High, the follow-up budget was spent, and
the phase stopped.

No requirement, threshold or acceptance criterion is in dispute. The open defect is a single
arithmetic conjunct in one test assertion (§7.3), and **both reviewers identified it
independently in the same round** — they differ only on severity.

## Iterations

**7 on TSPEC** (4 review rounds, then an upstream-cascade confirmation and two erratum rounds);
**3 on DECISIONS** (converged).

| Round | TSPEC version | Kind | product-manager | test-engineer |
|---|---|---|---|---|
| 1 | v0.1 | review | Needs revision (1 H, 2 M, 2 L) | Needs revision (5 H, 4 M, 3 L) |
| 2 | v0.2 | delta re-review | Approved with minor changes (0 H, 2 M, 3 L) | Needs revision (1 H, 1 M) |
| 3 | v0.3 | delta re-review | Approved with minor changes (0 H, 1 M, 1 L) | Needs revision (1 H, 1 M, 2 L) |
| 4 | v0.4 | delta re-review | **Approved** with minor changes (0 H, 1 M, 1 L) | **Approved** with minor changes (0 H, 1 M, 1 L) |
| 5 | v0.4 (bytes unchanged) | upstream-cascade confirmation (REQ v1.8) | Needs revision (2 H, 3 M) | Needs revision (3 H, 3 M, 1 L) |
| 6 | v0.5 | erratum delta confirmation | Approved with minor changes (0 H, 1 M) | Needs revision (1 H, 0 M, 3 L) |
| 7 | v0.6 | erratum delta confirmation | Approved with minor changes (0 H, **2 M**) | **Needs revision (1 H, 0 M, 1 L)** ← halt |

DECISIONS, for completeness — it converged and is not part of the halt:

| Round | DECISIONS version | product-manager | test-engineer |
|---|---|---|---|
| 1 | v1.0 | Needs revision (2 H, 1 M, 2 L) | Needs revision (4 H, 1 M, 1 L) |
| 2 | v1.1 | Approved with minor changes (0 H, 1 M) | Needs revision (1 H, 1 M) |
| 3 | v1.2 | Approved with minor changes (0 H, 1 M) | Approved with minor changes (0 H, 1 M) |

Round 7's delta landed in four commits (`04a6dc249`, `fa41f8680`, `1b3bc5004`, `88fe6dbae`,
+90/−19) across §0, §3.6, §4.1, §6.1 F-13, §7.3, §7.6 AT-14, §9.2, §9.4 and D-10. Both
reviewers verified the diff touched nothing outside the declared list and that every routed
item landed. **Five of five routed items landed; the sixth item is new, minted by one of the
five fixes.**

## Reviewers

| Role | File series | Terminal verdict | Open at halt |
|---|---|---|---|
| product-manager | `CROSS-REVIEW-product-manager-TSPEC-v{1..7}.md` | Approved with minor changes | F-01 Medium (§3.6 retired-default sentence names one of two retired inputs), F-02 Medium (§7.3 conjunct (5) pins the framing *ceiling*), Q-01 open (what re-opens the 12,059 pin) |
| test-engineer | `CROSS-REVIEW-test-engineer-TSPEC-v{1..7}.md` | Needs revision | F-01 **High** (§7.3 conjunct (5) / D-10 — same defect as PM F-02), F-02 Low (§9.2 ERR-2 "the only test that reads the value" is stale by one) |

**The reviewers agree on the facts.** PM F-02 and TE F-01 are the same finding, arrived at
independently, with the same diagnosis (`12,059 = 10,859 + 1,200`, where `1,200` is §4.3/D-9's
framing **budget ceiling** over constants that do not exist yet, not a measurement) and
compatible remedies. The only divergence is the severity bar:

- `te-review` scored it **High**: a conforming implementation whose framing renders under
  budget reds the assertion on day one, and `12,059` is not hand-transcribable from the fixture
  (the fixture holds decision records, not `DECISION_LEDGER_PREAMBLE` / `DECISION_LEDGER_RULE_TEXT`).
- `pm-review` scored it **Medium** and wrote the gate reasoning explicitly into its
  recommendation: *"Both findings are Medium, neither High, so this confirmation does not halt
  the phase."*

That is the whole disagreement. Neither reviewer was wrong on the merits and neither was
low-quality: both re-executed the arithmetic against HEAD, both confirmed the five routed items
landed, both refused to re-litigate approved sections, and both filed **Positive Observations**
noting the round-6 remedy was structurally the right shape (a second assertion over the
`M-6b` slice, not a restatement of the whole-fixture pin). This was not a reviewer-quality
failure and not a substantive disagreement — it is a severity-calibration difference on a
defect nobody disputes.

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation

## Provenance
