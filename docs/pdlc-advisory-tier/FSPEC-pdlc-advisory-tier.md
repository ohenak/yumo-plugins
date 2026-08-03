---
feature: pdlc-advisory-tier
---

# FSPEC — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## 1. Scope and reading order

This FSPEC specifies the **observable behaviour** of the advisory tier described by
`REQ-pdlc-advisory-tier.md`. It covers the five judgment seams A1–A5, the advisory verdict
lifecycle, the envelope and its refusal ladder, the advisory record, and the escalation log.

**Behavioural complexity is why each of these has an FSPEC entry.** Every one has branching that an
engineer should not decide alone: a resolution path and a refusal path that must be observably
identical in their effect on the pipeline, an ordered reason ladder where two triggers can fire at
once, and a disabled mode that must be byte-for-byte inert.

| FSPEC | Requirement(s) | Behaviour specified |
|---|---|---|
| FSPEC-ADV-01 | REQ-ADV-01 | rung resolution, declared fallback, unresolvable failure, configuration |
| FSPEC-ADV-02 | REQ-ADV-02 | one advisory invocation from dispatch to disposition |
| FSPEC-ADV-03 | REQ-ADV-03, REQ-ADV-04 | envelope membership, prohibitions, ordered refusal reasons |
| FSPEC-ADV-04 | REQ-ADV-05 | seams A1 (triage abstention) and A2 (stale-REQ re-grounding) |
| FSPEC-ADV-05 | REQ-ADV-06 | seam A3 (DoD exhaustion classification) |
| FSPEC-ADV-06 | REQ-ADV-07 | seam A4 (rebase conflict) |
| FSPEC-ADV-07 | REQ-ADV-08 | seam A5 (CI failure) |
| FSPEC-ADV-08 | REQ-ADV-09 | advisory record, its harvest, the delete guard |
| FSPEC-ADV-09 | REQ-ADV-10 | escalation log and report notices |
| FSPEC-ADV-10 | AC-1.6, NFR-3 | disabled-tier equivalence |

**Not specified here** (owned downstream by TSPEC / PLAN): module and constant placement, seam and
function signatures, the literal advisory model alias, prompt text, file formats at the byte level,
and the order in which code is written. Where this document names a value it is a **product-visible
value** (a config key, a verdict word, a refusal reason) that a reviewer or an operator reads.

**Terminology.** *Seam* — one of the five points A1–A5 where the pipeline stops today.
*Invocation* — one advisory dispatch at one seam within one pipeline run. *Attempt* — one
diagnose-and-act cycle inside an invocation. *Resolution* — an in-envelope action applied and
verified. *Escalation* — an invocation that ends without an applied resolution, recorded for the
operator, leaving the pipeline's pre-advisory behaviour intact.

**Citation pin.** Every `file:line` in §2 is read at default-branch commit `26c3f1c`, the commit
REQ BL-02 pins for re-verification. Later sections cite those observations **by baseline id (B-n)**
rather than repeating line numbers, so a re-pin touches one section.

## 2. Baseline — the five seams as they behave today

Observed at default-branch commit `26c3f1c`. Paths are repo-relative; `dev` =
`pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`.

| id | Observed fact | Evidence |
|---|---|---|
| B-1 | Phase-0 triage yields exactly three verdicts — `ready`, `blocked`, `needs-human`; `blocked` and `needs-human` both skip the candidate and continue to the next queue entry, differing only in the free-text reason recorded | `queue:653-668`, `queue:907-921` |
| B-2 | The dependency pre-check is one-sided: it reports blocked only when a declared dependency has a queue row whose status is not `done`; a dependency that is `done`, or absent from the queue, is inconclusive and falls through to triage | `queue:631-649` |
| B-3 | The triage prompt carries **no** stale-REQ re-grounding obligation. Its only staleness-adjacent instruction is "Also flag if the REQ references subsystems that do not yet exist" | `queue:656-666` |
| B-4 | Phase DOD alternates verify → remediate, capped at 3 iterations; the third failing verify returns without remediating again | `dev:25`, `dev:6164`, `dev:6190-6191` |
| B-5 | A DoD loop that returns not-passed records a ❌ phase row and halts the pipeline with the last finding counts in the message | `dev:8179-8188` |
| B-6 | Phase DOD step 0 rebases the feature branch onto the default branch; a `conflict` result records ❌ and halts, branch unchanged | `dev:8161-8172` |
| B-7 | Phase PUB polls the PR's check rollup: `passed` returns success; `failed` halts; checks that register but never complete halt at the completion cap; **no check ever registering returns a pass** with status `no-checks` | `dev:6250-6286` |
| B-8 | The `no-checks` pass is *reported*, not silent: the phase row reads "no GHA checks detected within timeout (assumed none configured)" | `dev:8267-8271` |
| B-9 | CI state is read mechanically from GitHub's own rollup, with no agent in the poll loop | `dev:5812-5824`, `dev:6245-6250` |
| B-10 | Model rungs are named by one constant each: `MODEL_DEFAULT` = `"opus"`, `MODEL_IMPLEMENTATION` = `"sonnet"` in dev; `MODEL_QUEUE` = `"sonnet"` in queue. All three are bare alias strings | `dev:1578`, `dev:1621`, `queue:69` |
| B-11 | Per-repo configuration lives at `.claude/pdlc.config.json`, read as named top-level sections, each parsed independently and each degrading to its own defaults rather than failing the run | `dev:43`, `dev:101-152`, `dev:181-200` |
| B-12 | This repo's own config file exists and currently carries an `implementation` section only — no `merge` section — so an absent section is the normal case, not an error case | `.claude/pdlc.config.json` |
| B-13 | The final report carries a `notices` channel; Phase MERGE contributes escalation lines under a frozen, merge-specific prefix, all of which share the `ESCALATION:` token | `dev:1319-1328`, `dev:8291-8292`, `dev:8395`, `dev:8402` |
| B-14 | The harvest-before-delete guard matches only the tokens `CROSS-REVIEW` and `CODE_REVIEW`, and refuses a delete when no `LEARNINGS-*.md` exists in the same directory | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43`, `:52-59` |
| B-15 | Phase order at the tail of a run is DOD → H (harvest) → PUB → MERGE. Harvest therefore runs **before** the phase that raises the PR and polls CI | `dev:8151`, `dev:8192`, `dev:8248`, `dev:8274` |
| B-16 | `docs/_queue/` contains `QUEUE.md` only — there is no escalation log today | `docs/_queue/` |

**Consequences that shape this spec.**

1. B-1 + B-3: A1 and A2 are not two signals today, they are one. A2's gate does not exist to fire —
   §6 therefore specifies A2's trigger as a **new** obligation, not as the routing of an existing one.
2. B-15: the advisory record cannot be harvested by Phase H, because Phase PUB — which appends to it
   at seam A5 — has not run yet. §10 specifies a distinct post-PUB step.
3. B-7 + B-8: the `no-checks` pass is already visible on the phase row, so the advisory tier's job
   there is to name it in the advisory summary, not to make it visible for the first time.
4. B-11 + B-12: an absent `advisory` section is normal and means "tier off", which is also the
   shipped default — so a repo that never edits its config never changes behaviour.

## 3. FSPEC-ADV-01 — Advisory rung resolution and declared fallback

## 4. FSPEC-ADV-02 — Advisory invocation lifecycle

## 5. FSPEC-ADV-03 — Envelope, prohibitions, and the refusal ladder

## 6. FSPEC-ADV-04 — Seams A1 and A2: queue triage and re-grounding

## 7. FSPEC-ADV-05 — Seam A3: DoD exhaustion

## 8. FSPEC-ADV-06 — Seam A4: rebase conflict

## 9. FSPEC-ADV-07 — Seam A5: CI failure

## 10. FSPEC-ADV-08 — Advisory record and its harvest

## 11. FSPEC-ADV-09 — Escalation output

## 12. FSPEC-ADV-10 — Disabled-tier equivalence

## 13. Open questions
