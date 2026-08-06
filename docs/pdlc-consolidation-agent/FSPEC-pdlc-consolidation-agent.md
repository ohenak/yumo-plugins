# FSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

## 1. Scope and entry obligations

This FSPEC specifies the behaviour of **one consolidation pass** — the workflow script invoked as
`/pdlc:consolidate-learnings`, shipping beside the existing skill of that name in the
`orchestrate-queue` shape (REQ §5). It is written against `REQ-pdlc-consolidation-agent` v2.0 and
adds no requirement of its own; where the REQ names a value, this document names the branch that
produces it and the observation that decides it.

**Two upstream reference files are binding and are not restated here**, only cited by section at
their pinned `Version`:

| File | Version | What this FSPEC takes from it |
|---|---|---|
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | 1.4 | §1 enumerated vocabularies (statuses, reason codes, trigger, route, verdicts, states, `action`, `pr:` / `suppressed-by:` / `credential:` fields, the 13-member phase catalogue); §2 the phase observable; §3 the log's record grammar; §4 pass identity and the PR trailer grammar |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | 1.0 | §1 which advisory records survive; §2 `ESCALATIONS.md` absent at HEAD; §3 the two-rung ladder is reused via `resolveAdvisoryRung`, not restated; §4 the escalations-not-resolutions limit |

Every enumerated value used below is a member of vocabularies §1. **No value is introduced here that
has no §1 row**, and this document uses every §1 row — the set-equality obligation of REQ §4b binds
this layer first, and §15 records where each row is used.

**Decisions the REQ delegated to this layer**, each discharged at a named section:

| Delegated by | Question | Discharged at |
|---|---|---|
| REQ AC-5.3 | Which of `revision` / `retirement` a pass proposes for an `ineffective` promotion | §8.5 |
| REQ AC-5.1 | The deterministic derivation of `failure-mode-id` from `phase` and `artifact` | §8.1 |
| REQ vocabularies §4 | How the `{n}` of `passId` is derived on a given calendar date | §2.5 |
| REQ AC-1.1, AC-7.2 | The order in which a pass appends its records, and the log row's field grammar | §10.2, §10.3 |
| REQ AC-5.2 | How a promotion's `phase` population is decided per consumed LEARNINGS | §8.3 |
| REQ AC-6.1 | How `ESCALATIONS.md` entries are counted per `Seam` per `Feature` | §9.2 |
| DC-01 | Absent / malformed / truncated behaviour for every parsed input | §3.4, §9.3, §10.4, §11 |

**Out of scope here, as in the REQ §5:** merging any PR; changing the AC-2.3 promotion bar;
session-free execution; a new notification channel; multi-consumer consolidation; persisting
`advisorySummaryRows`; retiring the manual entry point; repository-side branch protection.

**Altitude.** Per DC-09 (`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`) the REQ carries no oracle
mechanics; per DC-05 (`:143`) every named behavioural branch below carries an acceptance test in
§13, and §12 is the terminal outcome table those tests range over. Function names, seam signatures,
module placement and the bundle's build-manifest row are TSPEC's (§14).

## 2. FSPEC-CONS-01 — Tick evaluation and pass lifecycle

## 3. FSPEC-CONS-02 — The consumed predicate and the LEARNINGS corpus

## 4. FSPEC-CONS-03 — The in-progress marker

## 5. FSPEC-CONS-04 — Promotion routing and the consuming-repo writes

## 6. FSPEC-CONS-05 — The pull-request route

## 7. FSPEC-CONS-06 — Credential handling

## 8. FSPEC-CONS-07 — Falsifiability

## 9. FSPEC-CONS-08 — Advisory-corpus input

## 10. FSPEC-CONS-09 — Reporting and the log record grammar

## 11. Configuration parse behaviour

## 12. Observable outcomes per scenario

## 13. Acceptance tests

## 14. Obligations and open questions

## 15. Traceability
