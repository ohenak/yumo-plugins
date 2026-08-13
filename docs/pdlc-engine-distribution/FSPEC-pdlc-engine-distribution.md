---
feature: pdlc-engine-distribution
---

# FSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9, approved round 4); `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05); `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | TSPEC, PLAN, PROPERTIES for this feature; `pdlc-plugin-retirement` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-13 |

**FSPEC ID:** `FSPEC-EDIST-01`

## 1. Purpose and scope

This FSPEC specifies the **observable behaviour** of the four things REQ-EDIST-01…06 ask for:
the compat handshake a run performs before it dispatches, the install/upgrade lifecycle on an
operator machine, the tag-driven publish pipeline, and the provenance a run leaves behind in a
consumer repo. It also carries the two **expected sets** the REQ deliberately parked here rather
than in a measurement file (§5): the required-check set (T-7) and the packed-content set (AC-1.3).

**Altitude.** Behaviour, decision points, business rules, expected sets, error text obligations.
Not here, and owned by the TSPEC: package layout, manifest schema beyond the fields the REQ
already fixed, flag and field names, module boundaries, workflow YAML, and every carrier decision
parked at O-9 and O-10. Where a rule below says "the run states X", it fixes *that X is stated and
is machine-checkable*, not the string.

**Two sources of behaviour, one product.** The engine executes the canonical workflow modules;
the prompts it dispatches are read from the **installed plugin** at dispatch time. Every flow here
treats the plugin as an external, versioned input that may be absent, present-and-compatible, or
present-and-incompatible — three states, never two.

**Grounded at HEAD.** Every claim below about shipped behaviour is either cited to a measured fact
(`M-ENG-*`) or to a symbol in the tree. Where this FSPEC describes behaviour that does **not**
exist yet, it says so in the flow that needs it and names the obligation that owns it.

## 2. Linked requirements

| Flow | Requirement | Criteria covered | User stories |
|---|---|---|---|
| **F-1** Compat handshake and version query | REQ-EDIST-01 | AC-1.1, AC-1.2, AC-1.4 | US-01, US-02 |
| **F-2** Install on a clean machine | REQ-EDIST-02 | AC-2.1, AC-2.3 (install leg), AC-2.4 | US-01 |
| **F-3** Upgrade, and the zero-per-project promise | REQ-EDIST-02 | AC-2.2, AC-2.3 (upgrade leg), AC-2.5 | US-02 |
| **F-4** Version resolution: pin, latest, dev-mode | REQ-EDIST-05 | AC-5.1…AC-5.6 | US-05, US-06 |
| **F-5** Tag-driven publish | REQ-EDIST-03 | AC-3.1…AC-3.7, AC-1.5 | US-03 |
| **F-6** Provenance emission into consumer artifacts | REQ-EDIST-04 | AC-4.1…AC-4.5 | US-04 |
| **F-7** Coexistence and non-regression of the bundle path | REQ-EDIST-06 | AC-6.1, AC-6.2 | US-02 |
| §5.1 Expected required-check set | REQ-EDIST-03 | AC-3.4, T-7, C-5 | US-03 |
| §5.2 Expected packed-content set | REQ-EDIST-01 | AC-1.3 | US-01 |

Every acceptance criterion of the REQ appears in exactly one row above; a criterion added to the
REQ without a row here is a defect in this table, not a gap for a reader to resolve.

**Values read, never re-declared.** T-1a, T-1b, T-2…T-7 are the REQ's; this document cites them
by id. Where a flow needs a value the REQ did not declare, it is raised in §9, not invented here.

## 3. Behavioral flows

## 4. Business rules

## 5. Expected sets owned by this FSPEC

## 6. Input / output

## 7. Edge cases and error scenarios

## 8. Acceptance tests

## 9. Open questions
