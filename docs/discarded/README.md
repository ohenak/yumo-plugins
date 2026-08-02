# docs/discarded

Features that were **superseded or abandoned before implementation**. Nothing here is queue-eligible,
nothing here is a specification of record, and nothing here should be cited for a normative claim —
cite the successor instead. The documents are kept unchanged, as the historical record of work that
was done and of why it did not ship.

Contrast with `docs/completed/`, which archives features that **did** ship.

| Entry | Discarded | Why |
|---|---|---|
| `pdlc-review-convergence/` | 2026-08-01 | Superseded by the four `docs/pdlc-rcv-*` REQs (`budget-stop`, `fixed-point-stop`, `panel-topology`, `finding-quality`) plus the shared read-only `docs/_constraints/pdlc-rcv-baseline.md`. Its REQ ran nine review rounds without converging and reached 311 KB; the six requirements were carried forward with their ids unchanged. See `LEARNINGS-pdlc-review-convergence.md` in that directory. |
| `pdlc-review-convergence-calibration/` | 2026-08-01 | A deferral stub created only to bind `pdlc-review-convergence`'s open calibration questions to a named successor surface (DC-08). With the parent superseded, those questions belong to `pdlc-rcv-fixed-point-stop/` (now also discarded, below), so the stub has no independent scope. |
| `pdlc-rcv-budget-stop/` | 2026-08-02 | Abandoned at TSPEC stage by operator decision: process cost disproportionate to the code delta (~19 review artifacts for a change of one constant and a few pure functions). REQ v3.1 and FSPEC v1.3 were dual-approved, TSPEC reached v1.1; all process artifacts harvested into `LEARNINGS-pdlc-rcv-budget-stop.md` in that directory. The family's intent — bounded review rounds, deterministic stop, operator clearance — moves to the `orchestrate-dev` closed-loop rewrite (`pdlc-engineering-loop` / `pdlc-merge-phase` / `pdlc-advisory-tier`). |
| `pdlc-rcv-fixed-point-stop/` | 2026-08-02 | Abandoned unstarted with the rest of the `pdlc-rcv` family (depended on `pdlc-rcv-budget-stop`). |
| `pdlc-rcv-panel-topology/` | 2026-08-02 | Abandoned unstarted with the rest of the `pdlc-rcv` family. |
| `pdlc-rcv-finding-quality/` | 2026-08-02 | Abandoned unstarted with the rest of the `pdlc-rcv` family. |
| `pdlc-rcv-reset-region/` | 2026-08-02 | Abandoned unstarted with the rest of the `pdlc-rcv` family (the row-18 altitude split of `pdlc-rcv-budget-stop`). |
| `pdlc-runtime-measurement-spike/` | 2026-08-02 | Deferral stub bound to the discarded `pdlc-rcv` family's calibration questions; no independent scope once the family was abandoned. |
