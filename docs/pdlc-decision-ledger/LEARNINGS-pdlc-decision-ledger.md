# LEARNINGS — pdlc-decision-ledger

| Field | Detail |
|---|---|
| Feature | pdlc-decision-ledger |
| REQ | docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md |
| Date Completed | *(in flight — this file was seeded at the POSTMORTEM-D resolution, per its recommendation item 7; the harvest pass extends it when the feature completes)* |
| Harvested from | Nothing yet. Seeded from `POSTMORTEM-D-pdlc-decision-ledger.md` only; no `CROSS-REVIEW-*` file has been harvested and none may be deleted on the strength of this file existing |

## 4. Process Learnings

**1. Do not transcribe a reviewer's suggested numbers into a specification — re-derive them first.**
The TSPEC erratum channel's round-7 High was round 6's suggested remedy landed verbatim: the
round-6 finding proposed its fix in concrete byte literals (`12,059`), the author transcribed them
without re-deriving, and the number turned out to be a budget **ceiling** added to a
**measurement** — arithmetically true, dimensionally false, and red on any conforming
implementation drafted under budget (see `POSTMORTEM-D-pdlc-decision-ledger.md`, Best-Guess Root
Cause, and DEC-DECLEDGER-16). A suggested remedy is evidence about the defect, not a verified fact
about the design. When a finding supplies a concrete literal: re-derive it before it becomes
normative, state the derivation next to it, and have the next confirmation round check the
derivation — the same discipline the TSPEC already applies to claims about existing code ("every
claim cites file and line"), applied to numbers a reviewer supplied.
