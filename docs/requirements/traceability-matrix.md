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

## pdlc-adapter-read-cache

Authoritative per-AC mapping lives in §7 of
`docs/pdlc-adapter-read-cache/REQ-pdlc-adapter-read-cache.md`; this is the roll-up.

| User Story | Requirement | FSPEC |
|---|---|---|
| US-01 | REQ-RTCACHE-01, REQ-RTCACHE-02 | — (pending) |
| US-02 | REQ-RTCACHE-02, REQ-RTCACHE-05 | — (pending) |
| US-03 | REQ-RTCACHE-01, REQ-RTCACHE-03, REQ-RTCACHE-04 | — (pending) |

## pdlc-rcv-budget-stop

Upstream: `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.1).
Downstream: `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.0).
Authoritative per-criterion mapping lives in §13.1 of the FSPEC; this is the roll-up.

| User Story | Requirement | AC group | FSPEC sections |
|---|---|---|---|
| US-01, US-02 | REQ-RCV-01 | AC-1.1, AC-1.2 | §3 FSPEC-BUD-01, §4 FSPEC-WIN-01 |
| US-01 | REQ-RCV-01 | AC-1.3 | §8 FSPEC-RPT-01 |
| US-01, US-04 | REQ-RCV-01 | AC-1.4 | §7 FSPEC-HALT-01, §9 FSPEC-PROMPT-01 |
| US-02, US-04 | REQ-RCV-01 | AC-1.5(1)–(3) | §4 FSPEC-WIN-01, §6 FSPEC-CLR-01, §8 FSPEC-RPT-01 |
| US-04 | REQ-RCV-01 | AC-1.5(4)–(5) | §5 FSPEC-REG-01, §6 FSPEC-CLR-01 |

## pdlc-merge-phase

Upstream: `docs/completed/pdlc-merge-phase/REQ-pdlc-merge-phase.md` (v1.1). Downstream:
`docs/completed/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.0). Authoritative section mapping lives in §14
of the FSPEC; roll-up below.

| User Story | Requirement | FSPEC sections |
|---|---|---|
| US-01 | REQ-MERGE-01, REQ-MERGE-05, REQ-MERGE-06 | §2 FSPEC-MERGE-01, §7 FSPEC-MERGE-06, §8 FSPEC-MERGE-07, §9 FSPEC-MERGE-08 |
| US-02 | REQ-MERGE-02 | §6 FSPEC-MERGE-05 |
| US-03 | REQ-MERGE-03, REQ-MERGE-07 | §4 FSPEC-MERGE-03, §10 FSPEC-MERGE-09 |
| US-04 | REQ-MERGE-04, REQ-MERGE-07 | §3 FSPEC-MERGE-02, §5 FSPEC-MERGE-04, §10 FSPEC-MERGE-09 |
| US-05 | REQ-MERGE-05, REQ-MERGE-06 | §7 FSPEC-MERGE-06, §9 FSPEC-MERGE-08, §11 |

## pdlc-advisory-tier

| User Story | Requirement | FSPEC |
|---|---|---|
| US-01 | REQ-ADV-05, REQ-ADV-07, REQ-ADV-08 | FSPEC-ADV-04, FSPEC-ADV-06, FSPEC-ADV-07 |
| US-02 | REQ-ADV-06, REQ-ADV-10 | FSPEC-ADV-05, FSPEC-ADV-09 |
| US-03 | REQ-ADV-01, REQ-ADV-03 | FSPEC-ADV-01, FSPEC-ADV-03, FSPEC-ADV-10 |
| US-04 | REQ-ADV-09 | FSPEC-ADV-08 |
| US-05 | REQ-ADV-02, REQ-ADV-04 | FSPEC-ADV-02, FSPEC-ADV-03 |

## pdlc-consolidation-agent

Upstream: `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.0). Downstream:
`docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v1.0). The authoritative
per-criterion mapping lives in FSPEC §15.1; roll-up below.

| User Story | Requirement | FSPEC sections |
|---|---|---|
| US-01 | REQ-CONS-03 | §5 FSPEC-CONS-04, §6 FSPEC-CONS-05 |
| US-02 | REQ-CONS-03, REQ-CONS-04 | §6.5, §7 FSPEC-CONS-06 |
| US-03 | REQ-CONS-01 | §2 FSPEC-CONS-01, §3 FSPEC-CONS-02, §4 FSPEC-CONS-03 |
| US-04 | REQ-CONS-05, REQ-CONS-07 | §8 FSPEC-CONS-07, §10 FSPEC-CONS-09 |
| US-05 | REQ-CONS-05, REQ-CONS-06 | §8.5, §8.7, §9 FSPEC-CONS-08 |
