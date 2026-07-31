# Requirements Traceability Matrix

## pdlc-workflow-distribution

Authoritative per-AC mapping lives in §9 of
`docs/completed/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md`; this is the roll-up.

| User Story | Requirement | FSPEC |
|---|---|---|
| US-01 | REQ-DIST-00, REQ-DIST-01, REQ-DIST-02 | — (pending) |
| US-02 | REQ-DIST-00, REQ-DIST-02, REQ-DIST-03, REQ-DIST-06 | — (pending) |
| US-03 | REQ-DIST-01, REQ-DIST-02, REQ-DIST-03, REQ-DIST-05 | — (pending) |
| US-04 | REQ-DIST-00, REQ-DIST-04, REQ-DIST-06 | — (pending) |

## orchestrate-dev-workflow

| User Story | Requirement | FSPEC |
|---|---|---|
| US-01 | REQ-PIPELINE-01 | — |
| US-01 | REQ-PIPELINE-02 | — |
| US-01 | REQ-OBS-02 | — |
| US-01 | REQ-NFR-02 | — |
| US-02 | REQ-PIPELINE-01 | — |
| US-02 | REQ-GATE-01 | — |
| US-02 | REQ-GATE-02 | — |
| US-02 | REQ-NFR-01 | — |
| US-03 | REQ-PIPELINE-03 | — |
| US-04 | REQ-OBS-01 | — |
| US-04 | REQ-OBS-02 | — |
| US-05 | REQ-GATE-04 | — |
| US-06 | REQ-PIPELINE-02 | — |
| US-06 | REQ-COMPAT-01 | — |
| US-06 | REQ-COMPAT-02 | — |
| US-06 | REQ-COMPAT-03 | — |
| US-06 | REQ-ARTIFACTS-01 | — |
| US-06 | REQ-ARTIFACTS-02 | — |
| US-06 | REQ-SKILL-01 | — |
| US-07 | REQ-GATE-03 | — |

## pdlc-review-loop-hardening

Upstream: `docs/completed/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md` (v1.5).
Downstream: `docs/completed/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md` (v1.0).

| Defect | AC group | FSPEC sections |
|---|---|---|
| H-1 (iteration index ignores the branch) | AC-1 | §3 FSPEC-DISC-01, §4 FSPEC-NAME-01, §17.1 FSPEC-CONST-01 |
| H-2 (non-terminal non-convergence exit) | AC-2 | §12 FSPEC-PMORT-01, §13 FSPEC-QUEUE-01, §14 FSPEC-ROWLOC-01 |
| H-3 (monolithic authoring unsurvivable) | AC-3 | §8 FSPEC-TRAILER-01, §15 FSPEC-PACE-01, §16 FSPEC-COMPLETE-01 |
| H-4 (no approved-phase skip) | AC-4 | §5 FSPEC-ROUND-01, §6 FSPEC-VERDICT-01, §7 FSPEC-DIGEST-01, §9 FSPEC-APPROVAL-01, §10 FSPEC-STALE-01, §11 FSPEC-FORCE-01 |
| — (harness consistency) | AC-5 | §17 FSPEC-CONST-01 |
