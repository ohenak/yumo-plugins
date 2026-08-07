# Baseline — the advisory tier's durable per-seam record

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only input to `pdlc-consolidation-agent` and its successors; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (§5, AC-1.5, AC-1.6, REQ-CONS-06, BL-01, BL-01a, D-CONS-06) |
| Version | 1.0 · 2026-08-06 |
| Verified at | HEAD, 2026-08-06 |

**Why this file exists.** Which advisory records survive a run, and which are destroyed, is a fact
about `orchestrate-dev` rather than about any one consuming feature. D-CONS-06 binds the successor
work to `pdlc-engineering-loop`, which will re-derive exactly these facts; stating them once keeps the
two features from drifting apart, and keeps the consuming REQ inside its size budget.

**Change control, and who owns these sections.** `REQ-pdlc-consolidation-agent` owns every section
of this file — §1–§4 entire — and changes none belonging to anyone else; a successor feature's facts
belong in its own new section of this file or in its own file, never interleaved into §1–§4. All
four sections are **owned normative prose**: no table here is transcribed row-for-row downstream, so
no set-equality oracle ranges over this file. Consumers cite this file **at its `Version`**; a
content change that is not accompanied by a version bump is itself a defect.

## 1. What is destroyed, and what survives

| Record | Where | Fate |
|---|---|---|
| `advisorySummaryRows` — the structured per-seam counts, driven by `ADVISORY_SEAMS` | `pdlc/workflows/orchestrate-dev.js:2708`; a field of one run's report (`:10663`, `:10695`) | **In memory only.** Never persisted |
| `docs/{feature}/ADVISORY-{feature}.md` — per-feature disposition record with a strict schema (`renderAdvisoryEntry`, `:2642`) | per-feature docs directory | **Deleted** after Phase H2's distil (`:10499`), whose dispatch asks only for prose with no schema (`advisoryDistilPrompt`, `:7585-7594`) — so LEARNINGS advisory text cannot carry counts |
| `docs/_queue/ESCALATIONS.md` (`ESCALATIONS_PATH`, `:2750`; appended `:2812`) | queue directory, non-feature-scoped | **Durable** — append-only, never distilled, never deleted. `renderEscalationEntry` (`:2763`) gives every entry named `Feature` and `Seam` fields |

Consequence for any consumer: `ESCALATIONS.md` is the **one** machine-readable per-seam record. A
feature that wants per-seam counts consumes that file, not an artifact that is destroyed.

## 2. Availability at HEAD

`docs/_queue/ESCALATIONS.md` **does not exist at HEAD** — `docs/_queue/` holds `QUEUE.md` alone, and
`git log --all -- docs/_queue/ESCALATIONS.md` returns nothing.

Its only writer is the advisory tier, which ships **disabled**: `advisoryTierOn`
(`pdlc/workflows/orchestrate-dev.js:9653`) resolves from `parseAdvisoryConfig` (`:1682`), whose
default is `enabled: false` (`:1663`), and this repo's `.claude/pdlc.config.json` carries an
`implementation` section only.

So any feature consuming this corpus must be specified **absent-first**: it ships and is testable with
the tier off, and availability is a tracked dependency rather than an asserted delivery.

## 3. The two-rung model ladder, and that it is reusable

The advisory tier ships **one** model-rung ladder: `MODEL_ADVISORY`
(`pdlc/workflows/orchestrate-dev.js:1652`) first, `MODEL_ADVISORY_FALLBACK` (`:1653`) on
non-resolution, with the downgrade announced rather than silent (`ADVISORY_MODEL_FALLBACK:`, `:1859`).

The two constants are module-private, but the ladder is **not**: the resolver `resolveAdvisoryRung` is
exported at `:1833`, under a doc comment at `:1800` calling it "the **one** ladder the tier ships", and
the shipped second consumer takes it through an injected seam with a threaded `rungState`
(`pdlc/workflows/orchestrate-queue.js:1245-1256`) rather than copying literals.

Consequence for any consumer: **reuse the resolver, do not restate the ladder.** Where reuse is
genuinely impossible, a restated pair of literals is acceptable only with a named drift observable — a
test asserting set-equality against `MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK`, failing when either
copy moves — never with a named risk.

## 4. The honest limit

`ESCALATIONS.md` records escalations, not resolutions. "The seam resolved it autonomously" is
observable only as the *absence* of an escalation. A resolution-**rate** input needs
`advisorySummaryRows` persisted in a defined LEARNINGS section — which is an `orchestrate-dev` change,
not a consolidation change.
