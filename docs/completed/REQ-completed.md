# docs/completed/ — archive marker

Not a feature REQ. This file exists so `docs/completed/` satisfies FSPEC §7.5
exemption (ii) — "feature-docs: docs/<X>/ containing REQ-<X>.md" — mechanically
checked by `coveredViolations` (`pdlc/workflows/lib/document-oracles.mjs`).
Without it, every archived doc under `docs/completed/<feature>/` is scanned for
the covered-violations patterns and reports historical mentions of the
pre-distribution manual-copy convention as live drift, even though the feature
merged and the docs are historical record, not active guidance.

`docs/completed/` holds per-feature doc directories (`REQ`, `FSPEC`, `TSPEC`,
`PLAN`, `PROPERTIES`, `LEARNINGS`, `POSTMORTEM-*`, …) for features whose PR has
merged to `main`, moved there verbatim from `docs/{feature}/` once the queue
row is removed. See `docs/completed/QUEUE-HISTORY-rows-0-1.md` for the first
two archived rows.
