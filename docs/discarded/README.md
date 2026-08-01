# docs/discarded

Features that were **superseded or abandoned before implementation**. Nothing here is queue-eligible,
nothing here is a specification of record, and nothing here should be cited for a normative claim —
cite the successor instead. The documents are kept unchanged, as the historical record of work that
was done and of why it did not ship.

Contrast with `docs/completed/`, which archives features that **did** ship.

| Entry | Discarded | Why |
|---|---|---|
| `pdlc-review-convergence/` | 2026-08-01 | Superseded by the four `docs/pdlc-rcv-*` REQs (`budget-stop`, `fixed-point-stop`, `panel-topology`, `finding-quality`) plus the shared read-only `docs/_constraints/pdlc-rcv-baseline.md`. Its REQ ran nine review rounds without converging and reached 311 KB; the six requirements were carried forward with their ids unchanged. See `LEARNINGS-pdlc-review-convergence.md` in that directory. |
| `pdlc-review-convergence-calibration/` | 2026-08-01 | A deferral stub created only to bind `pdlc-review-convergence`'s open calibration questions to a named successor surface (DC-08). With the parent superseded, those questions belong to `docs/pdlc-rcv-fixed-point-stop/`, so the stub has no independent scope. |
