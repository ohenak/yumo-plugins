# PROPERTIES: Opt-in M2 chain mode

| ID | Requirement | Property and test oracle |
| --- | --- | --- |
| PROP-CHAIN-01 | REQ-CHAIN-01 | With no chain option, identical injected inputs produce the same phase sequence, review dispatch count, and report as the existing path. Invalid issue input produces no writes or agent calls. |
| PROP-CHAIN-02 | REQ-CHAIN-02 | Deleting or emptying a handoff input halts before authoring. A missing later artifact triggers one author pass; if it remains empty, the run halts. Removing a REQ ID from FSPEC, or adding an ID absent from REQ, fails its gate. Other semantic disagreement is outside this deterministic validator. |
| PROP-CHAIN-03 | REQ-CHAIN-03 | Every successful chain spec phase reports `chain-validated`; each later artifact has at most one author pass, review/optimizer counts stay zero, and no `CROSS-REVIEW-*` path is written. |
| PROP-CHAIN-04 | REQ-CHAIN-04 | One chain DoD dispatch produces one pre-PR verdict. A missing/empty `CODE_REVIEW` file, absent accepted issue URL, or failed verdict halts before PUB without a remediation dispatch. Green local tests and a passed DoD permit PUB; PR/head CI/red-repair evidence is deferred there. Chain mode cannot disable DoD or PUB and never dispatches Phase MERGE. |
| PROP-CHAIN-05 | REQ-CHAIN-05 | Replacing a returned run `headSha` with a stale SHA or returning an empty list changes green to halt. Changing any returned matching push run from completed success to pending, failed, or unknown also prevents pass. A synthetic-merge `pull_request` check alone never passes. |
| PROP-CHAIN-06 | REQ-CHAIN-06 | One red result yields at most one repair dispatch and one repair push; a second red result yields a halt and no second repair. A successful repair is checked against its new head SHA. |
| PROP-CHAIN-07 | REQ-CHAIN-07 | Reports contain exactly the observed issue URL, artifact gates, PR URL, feature-branch-head SHA, Actions run URL/result, and repair count. Replaying the same observations yields byte-identical normalized report fields; private payload fields never enter the report. |

Tests should use fixed clocks and injected GitHub observations so the result is deterministic. The real consumer run supplies the point-in-time evidence: each CI result must name the observed PR head at that moment.
