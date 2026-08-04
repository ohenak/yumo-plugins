---
feature: pdlc-advisory-tier
---

# PROPERTIES — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/advisory*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-04 |

## 1. Overview — scope, sources, and how to read this document

This document is the proof system for the advisory tier: the observable invariants an implementer
must be able to falsify, stated precisely enough that every one of PLAN §3's 36 tasks knows which
properties its test file carries.

**Sources.** REQ §3 (AC-1.1 … AC-10.5) and §4 (NFR-1 … NFR-5); FSPEC's rule families
(C-*, M-*, V-*, E-R*, E-1…E-4, X-a…X-e, P-1…P-4, A1-*…A5-*, R-*, H-*, S-*, L-*, N-*, D-*, F-*,
BR-1…BR-6) and its 81 acceptance cases T-01-1 … T-10-5; TSPEC §§3–11 (the shipped signatures and
constants); PLAN §3 (tasks), §4 (file ownership), §6.5 (the nine generator-driven properties) and
§8 (case → file → task map).

**Grounding.** Every claim about *existing* behaviour below cites the working tree. Verified while
authoring, at branch head:

| Cited symbol | Location | Used by |
|---|---|---|
| `guardVerdict`, `effectiveGuardPaths` | `pdlc/workflows/orchestrate-dev.js:731`, `:708` | X-e reuse (§6) |
| `commitPaths` (module-private at HEAD), `gitWithLockRetry` | `orchestrate-dev.js:6905`, `:6862` | A2 `verifyGate` (§7) |
| `checkPrCi` | `orchestrate-dev.js:5927` | A5 gate + `ciStatus` provenance (§8) |
| `raisePrAndVerifyCi`, `rebaseOntoDefault` | `orchestrate-dev.js:6337`, `:6254` | Phase PUB / A4 gate |
| `dodVerifyLoop`, `parseDodStatus`, `DOD_MAX_ITERATIONS = 3` | `orchestrate-dev.js:6273`, `:6059`, `:25` | A3 evidence + P-1 prohibition |
| `defaultAppendFile` | `orchestrate-dev.js:6805` | record + escalation append |
| `MERGE_ESCALATIONS` | `orchestrate-dev.js:1321` | N-1 unchanged-snapshot |
| `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION` | `orchestrate-dev.js:1578`, `:1621` | constant placement |
| `buildFinalReport` (module-private) | `orchestrate-dev.js:8595` | advisory summary |
| `parsePlanTasks`, `parseImplementationConfig` | `orchestrate-dev.js:2039`, `:181` | `declaredScope`, A4 gate command |
| Phase I wave gate `const gate = await runCommandFn(implConfig.testCommand)` | `orchestrate-dev.js:8113` | why no property may ship red (§2) |
| wave prompt `You own EXACTLY these files` / `Do NOT run git add or git commit` | `orchestrate-dev.js:5850`, `:5851` | test-file ownership discipline |
| `parseTriageVerdict`, `triagePrompt`, `precheckDependencies`, `parseQueue` | `orchestrate-queue.js:302`, `:653`, `:630`, `:116` | A1/A2 routing |
| `parseReqFrontmatter`, `updateQueueStatus`, `rewriteStatus`, `buildQueueReport` | `orchestrate-queue.js:232`, `:358`, `:1086`, `:1221` | P-2/P-4 prohibitions, S-5 |
| guard hook: early-exit test, token regex, refusal message | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43`, `:57-59` | §9 harvest guard |
| guard-message consumers in the pipeline | `orchestrate-dev.js:8342`, `:8348` | the coupling regression |

**Property form.**

> **PROP-{DOMAIN}-{NN}** — {component} must / must not {observable behaviour} {given condition}.

Each row carries: **Category** (Functional / Contract / Error Handling / Data Integrity /
Integration / Security / Idempotency / Observability), **Level** (Unit / Integration / E2E),
**Traces** (REQ AC or NFR, FSPEC rule, FSPEC acceptance case where one exists), and **Home**
(the test file from PLAN §4 and the 🔴/🟢 task pair that owns it). A property with no FSPEC case id
in `Traces` is a PLAN- or PROPERTIES-level obligation and says so.

**What this document does not do.** It does not restate PLAN §5.2's per-batch gates, PLAN §6.4's
coverage floor, or PLAN §9's Definition of Done; those are execution mechanics and belong there. It
does not choose the framework (jest 29.7.0, pinned in `pdlc/workflows/package.json`) or invent a
generator (`__tests__/helpers/driftGenerators.js` already ships one — §2).

**Test-pyramid budget for this feature.** 78 of the properties below are Unit, 21 Integration, and
**zero E2E** — deliberately. The feature has no UI and no deployable surface; its "end to end" is a
whole-pipeline run of the workflow module against injected seams, which is exactly what the
Integration level already means here (PLAN §6.2's three harnesses). Anything that would be an E2E
test is instead PLAN A-34's *manual* runtime verification, which is a recorded fact, not a suite
member.

## 2. Fixtures, generators, and test doubles

## 3. Oracles — the falsifiability rules every property below obeys

## 4. Properties — configuration and model rung

## 5. Properties — verdict contract, invocation lifecycle, budgets

## 6. Properties — envelope, refusal ladder, prohibitions

## 7. Properties — seams A1 and A2 (queue module)

## 8. Properties — seams A3, A4 and A5 (dev module)

## 9. Properties — advisory record, escalation log, summary, harvest

## 10. Properties — disabled-tier equivalence and regression

## 11. Generator-driven properties (P-1 … P-9)

## 12. Coverage matrix

## 13. Gaps, negative space, and errata
