# pdlc-halt-hardening follow-ups (backlog)

Status: **ideas only — not built.** Field findings from live 0.23.0 consumer runs,
captured for a 0.23.1-class pickup. Source of truth for the shipped behavior:
`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`.

---

## 1. Inverted/mislabeled qualifying ownership table poisons the manifest union

**Reported:** 2026-08-15, first live 0.23.0 run (regime-ledger, resuming its in-flight
feature), via the architect session. Not urgent — the shipped diagnostics named every
offending row verbatim and the consumer-side fix was one header rename.

**The edge.** A consumer PLAN carried BOTH a machine-read `Task | Files` manifest AND a
legacy prose per-file table headed `File (subpackage-qualified) | Owning task(s) | …`.
Under 0.22.7 the prose table was invisible (the bug T7 fixed); under 0.23.0 the header
normalization makes it *qualify* too, and `parsePlanOwnership` unions qualifying blocks —
so the prose table's **inverted orientation** (file→tasks) fed its multi-task cells in as
task ids, producing five "manifest row names a task id that is not in the task table"
errors. T7's near-miss design contemplated a *missing* manifest, not a semantically
inverted *qualifying* one.

**Suggested hardening.** When a qualifying block's task-cell values mostly fail
task-table membership (or mostly parse as paths while its files cells parse as id
lists), report it as a probable inverted/mislabeled table — same loud diagnostic
discipline, naming the header row and the orientation evidence — and **exclude it from
the union** rather than poisoning the merged manifest.

**Regression-test candidate.** Fixture with one valid manifest + one inverted qualifying
table; assert the valid manifest alone is consumed and the inverted table is named in a
notice, never merged.

**What went right, keep it:** the mint-time oracle-contract lint's drop-with-notice, the
per-row verbatim manifest diagnostics, and the lifetime-cap accept-as-is notice all fired
as designed in the same run.
