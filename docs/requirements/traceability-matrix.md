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

Upstream: `docs/completed/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.0). Downstream:
`docs/completed/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v1.0). The authoritative
per-criterion mapping lives in FSPEC §15.1; roll-up below.

| User Story | Requirement | FSPEC sections |
|---|---|---|
| US-01 | REQ-CONS-03 | §5 FSPEC-CONS-04, §6 FSPEC-CONS-05 |
| US-02 | REQ-CONS-03, REQ-CONS-04 | §6.5, §7 FSPEC-CONS-06 |
| US-03 | REQ-CONS-01 | §2 FSPEC-CONS-01, §3 FSPEC-CONS-02, §4 FSPEC-CONS-03 |
| US-04 | REQ-CONS-05, REQ-CONS-07 | §8 FSPEC-CONS-07, §10 FSPEC-CONS-09 |
| US-05 | REQ-CONS-05, REQ-CONS-06 | §8.5, §8.7, §9 FSPEC-CONS-08 |

## pdlc-advisory-wave-gate

Upstream: `docs/completed/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.0). Downstream: FSPEC
not yet authored — the REQ carries `ready: false` pending operator review.

| User Story | Requirement | FSPEC |
|---|---|---|
| US-01 | REQ-AWG-01, REQ-AWG-03, REQ-AWG-05 | — (pending) |
| US-02 | REQ-AWG-01, REQ-AWG-02, REQ-AWG-05, REQ-AWG-06 | — (pending) |
| US-03 | REQ-AWG-01, REQ-AWG-02, REQ-AWG-03, REQ-AWG-04 | — (pending) |
| US-04 | REQ-AWG-02, REQ-AWG-03, REQ-AWG-05 | — (pending) |
| US-05 | REQ-AWG-01, REQ-AWG-02, REQ-AWG-06 | — (pending) |

## pdlc-wave-resume

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-WVR-01, REQ-WVR-02, REQ-WVR-05, REQ-WVR-08, REQ-WVR-10 | FSPEC-WVR-01, FSPEC-WVR-02, FSPEC-WVR-06 |
| US-02 | REQ-WVR-02, REQ-WVR-04 | FSPEC-WVR-02, FSPEC-WVR-04 |
| US-03 | REQ-WVR-03, REQ-WVR-06, REQ-WVR-09, REQ-WVR-10 | FSPEC-WVR-03, FSPEC-WVR-05, FSPEC-WVR-06 |
| US-04 | REQ-WVR-07 | FSPEC-WVR-07 |

## pdlc-engine-distribution

Upstream: `docs/completed/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9). Downstream:
`docs/completed/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (`FSPEC-EDIST-01`, v0.1).

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-EDIST-01, REQ-EDIST-02 | §3 F-1, F-2; §5.2 |
| US-02 | REQ-EDIST-01, REQ-EDIST-02, REQ-EDIST-06 | §3 F-1, F-3, F-7 |
| US-03 | REQ-EDIST-03 | §3 F-5; §5.1 |
| US-04 | REQ-EDIST-04 | §3 F-6 |
| US-05 | REQ-EDIST-05 | §3 F-4 (pin branch) |
| US-06 | REQ-EDIST-05 | §3 F-4 (dev-mode branch); §5.3 |

## pdlc-plugin-retirement

Upstream: `docs/completed/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9). Downstream:
`docs/completed/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (`FSPEC-RET-01`, v0.1).
Authoritative per-criterion mapping lives in §2 of the FSPEC; roll-up below.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | G-1, G-2, AC-1.1–AC-1.8, AC-5.1 | §3.1, §3.4, §4.1, §4.2; AT-1.1–AT-1.8, AT-5.1 |
| US-02 | G-1, C-3, AC-1.2, AC-1.4, AC-1.6 | §3.1 classes 1–9, §4.2 L-2/L-3, §4.3 L-7/L-8; AT-1.2, AT-1.4, AT-1.6 |
| US-03 | G-4, AC-4.1–AC-4.4 | §3.5, §4.5; AT-4.1–AT-4.4 |
| US-04 | G-2, NG-1, C-2, AC-1.7, AC-3.1, AC-3.3 | §3.4, §4.2 L-4/L-10, §4.4; AT-1.7, AT-3.1, AT-3.3 |

## pdlc-engineering-loop

Upstream: `docs/completed/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md`. Downstream:
`docs/completed/pdlc-engineering-loop/FSPEC-pdlc-engineering-loop.md` (`FSPEC-LOOP-01`…`FSPEC-LOOP-06`).
Authoritative per-criterion mapping lives in the FSPEC's Business Rules and Acceptance Tests
sections; roll-up below.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-LOOP-01 (AC-1.1–AC-1.3), REQ-LOOP-03 | §3.1, §3.2; BR-04, BR-10, BR-11; AT-01, AT-02, AT-11–AT-17 |
| US-02 | REQ-LOOP-04, REQ-LOOP-07 | §3.3, §3.4, §3.5; BR-12–BR-18; AT-18–AT-29 |
| US-03 | REQ-LOOP-01 (AC-1.4–AC-1.6), REQ-LOOP-02 | §3.2; BR-05–BR-09; AT-03–AT-10 |
| US-04 | REQ-LOOP-05, NFR-6 | BR-23–BR-26; AT-32, AT-33, E-23 |
| US-05 | REQ-LOOP-05 (AC-5.3), REQ-LOOP-06, NFR-2/NFR-3 | BR-19–BR-22; AT-30, AT-31, AT-35 |

## pdlc-loop-economics (2026-08-28)

Upstream: `docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md`. Downstream:
`docs/completed/pdlc-loop-economics/FSPEC-pdlc-loop-economics.md`. Authoritative per-criterion mapping
lives in the FSPEC's §6 traceability table and PROPERTIES §7; roll-up below.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-LOOPECON-01a/01b, REQ-LOOPECON-02, REQ-LOOPECON-03 | §1.2–§1.4, §2 |
| US-02 | REQ-LOOPECON-04, REQ-LOOPECON-05, REQ-LOOPECON-08 | §4, §7.3–§7.4 |
| US-03 | REQ-LOOPECON-06, REQ-LOOPECON-07, REQ-LOOPECON-08 | §5, §7.3–§7.4 |
| US-04 | REQ-LOOPECON-09 | §3 |

## pdlc-decision-ledger (2026-08-28)

Upstream: `docs/completed/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`
(proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move
M4, §3/§4(c) R3-2). FSPEC: `docs/completed/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md`
(FSPEC-DECLEDGER-01), authored against REQ v1.7 and Baseline
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.1.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-DECLEDGER-01, REQ-DECLEDGER-03, REQ-DECLEDGER-06 | §3.2, §3.4; BR-1–BR-3, BR-5, BR-6, BR-9, BR-11; AT-01–AT-03, AT-06, AT-07, AT-12 |
| US-02 | REQ-DECLEDGER-04, REQ-DECLEDGER-07 | §3.3; BR-7, BR-8, BR-12, BR-13; E-2–E-4, E-6–E-8; AT-08–AT-10, AT-13–AT-15 |
| US-03 | REQ-DECLEDGER-02, REQ-DECLEDGER-05, REQ-DECLEDGER-08 | §3.1, §3.2 step 1; BR-4, BR-10, BR-11, BR-14; E-1, E-5; AT-04, AT-05, AT-11, AT-16, AT-17 |

G-4 carries no acceptance criterion by REQ design and therefore no FSPEC row.

## pdlc-stats (2026-08-30)

Upstream: `docs/pdlc-stats/REQ-pdlc-stats.md` (design source:
`docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §4, §5.2; proposal source:
`docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §5).
FSPEC: `docs/pdlc-stats/FSPEC-pdlc-stats.md` (`FSPEC-STATS-01`); per-AC mapping in its §2.1.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-STATS-01, REQ-STATS-03, REQ-STATS-04, REQ-STATS-05, REQ-STATS-06, REQ-STATS-09 | FSPEC-STATS-01 §3.1, §4.1, §4.2, §4.3, §5 |
| US-02 | REQ-STATS-02 | FSPEC-STATS-01 §3.3, §4.4 |
| US-03 | REQ-STATS-07, REQ-STATS-08 | FSPEC-STATS-01 §3.2, §3.4, §4.5 |

## pdlc-review-tightenings (2026-08-30)

Upstream: `docs/pdlc-review-tightenings/REQ-pdlc-review-tightenings.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` R1-5, R1-6, R2-5, R2-6, R2-7). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-REVTIGHT-01, REQ-REVTIGHT-02 | — (pending) |
| US-02 | REQ-REVTIGHT-03 | — (pending) |
| US-03 | REQ-REVTIGHT-04 | — (pending) |
| US-04 | REQ-REVTIGHT-05 | — (pending) |
| US-05 | REQ-REVTIGHT-06 | — (pending) |

## pdlc-queue-autoresolve (2026-08-30)

Upstream: `docs/pdlc-queue-autoresolve/REQ-pdlc-queue-autoresolve.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §6). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-AUTORESOLVE-02, REQ-AUTORESOLVE-03, REQ-AUTORESOLVE-04, REQ-AUTORESOLVE-05 | — (pending) |
| US-02 | REQ-AUTORESOLVE-06 | — (pending) |
| US-03 | REQ-AUTORESOLVE-01, REQ-AUTORESOLVE-07 | — (pending) |
| US-04 | REQ-AUTORESOLVE-08 | — (pending) |

## pdlc-phase-g (2026-08-30)

Upstream: `docs/pdlc-phase-g/REQ-pdlc-phase-g.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §3 R3-1 §4(a)/(b)/(e)). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-GRILL-01, REQ-GRILL-02, REQ-GRILL-06, REQ-GRILL-08 | — (pending) |
| US-02 | REQ-GRILL-03, REQ-GRILL-04, REQ-GRILL-05 | — (pending) |
| US-03 | REQ-GRILL-06, REQ-GRILL-07 | — (pending) |
| US-04 | REQ-GRILL-09, REQ-GRILL-10, REQ-GRILL-11, REQ-GRILL-12 | — (pending) |

## pdlc-size-tiers (2026-08-30)

Upstream: `docs/pdlc-size-tiers/REQ-pdlc-size-tiers.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move M6, §3 R3-3). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-SIZETIER-02, REQ-SIZETIER-04, REQ-SIZETIER-05, REQ-SIZETIER-06 | — (pending) |
| US-02 | REQ-SIZETIER-03, REQ-SIZETIER-07, REQ-SIZETIER-08 | — (pending) |
| US-03 | REQ-SIZETIER-01, REQ-SIZETIER-03, REQ-SIZETIER-11 | — (pending) |
| US-04 | REQ-SIZETIER-09, REQ-SIZETIER-10, REQ-SIZETIER-12 | — (pending) |

## pdlc-two-axis-dod (2026-08-30)

Upstream: `docs/pdlc-two-axis-dod/REQ-pdlc-two-axis-dod.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3 footnote 2, §8 item 7; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 R3-4). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-TWOAXIS-01, REQ-TWOAXIS-02 | — (pending) |
| US-02 | REQ-TWOAXIS-03, REQ-TWOAXIS-05 | — (pending) |
| US-03 | REQ-TWOAXIS-04 | — (pending) |

## pdlc-init (2026-08-30)

Upstream: `docs/pdlc-init/REQ-pdlc-init.md` (design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §2, §4). FSPEC not yet authored.

| User story | Requirements | FSPEC |
|---|---|---|
| US-01 | REQ-INIT-01, REQ-INIT-05, REQ-INIT-06 | — (pending) |
| US-02 | REQ-INIT-02 | — (pending) |
| US-03 | REQ-INIT-03 | — (pending) |
| US-04 | REQ-INIT-04 | — (pending) |
