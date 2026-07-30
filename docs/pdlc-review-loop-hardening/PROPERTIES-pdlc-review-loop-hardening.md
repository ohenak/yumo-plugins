---
feature: pdlc-review-loop-hardening
---

# PROPERTIES — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-review-loop-hardening.md` v1.6 → `FSPEC-pdlc-review-loop-hardening.md` v1.8 → `TSPEC-pdlc-review-loop-hardening.md` v1.7 → `PLAN-pdlc-review-loop-hardening.md` v1.4 → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-30 |

> **Altitude.** The REQ states the observable behaviour, the FSPEC how it is produced and pins the
> sixty-six acceptance tests, the TSPEC how it is built and proved with *examples*, the PLAN when each
> assertion is allowed to be red. This document states what must hold over **generated** inputs: the
> domains, the invariants quantified over them, the shrink order, and — for every property — the
> concrete source mutation that would falsify it. It restates no FSPEC behaviour; behaviour is cited
> by section.

## 1. Overview

### 1.1 What this document decides

Seventeen properties, each one an invariant over a generated input space rather than over a hand-picked
example. Each carries five things, and a property missing any of them is not finished:

1. a **stable id** (`PROP-{DOMAIN}-{NN}`), unique in this document and namespaced away from both the
   FSPEC's `AT-{N}` range and the PLAN's fifteen `RLH-`-prefixed non-AT ids (PLAN §7.5);
2. the **invariant**, stated precisely enough that two engineers write the same assertion;
3. the **generator strategy**, built on the primitives `__tests__/helpers/driftGenerators.js` already
   ships (§3);
4. the **falsifying condition** — a named mutation to `pdlc/workflows/orchestrate-dev.js` (or its
   sibling) that turns the property red, recorded in §5;
5. the **owning task** from PLAN §4, or an explicit statement that the property is verification-only.

### 1.2 The floor of seven, and why this document carries more

TSPEC §8.2 names **seven** properties — one per component in a table it owns — and PLAN §7.2 restates
that table's two corrections. Those seven are the floor. They are reproduced here as
`PROP-DIGEST-01/-02`, `PROP-SCAN-01`, `PROP-NAME-01`, `PROP-ROUND-01`, `PROP-FORCE-01` and
`PROP-COMPLETE-01`, **citing** §8.2 rather than restating its wording, because §8.2 owns them.

The ten beyond the floor are derived, not invented, and each closes a gap this document had to
measure rather than assume:

- **TSPEC §8.1 and §8.2 do not agree on the count.** §8.1 says *"Every parameterisable component in
  the L1 row carries at least one property"*, and the L1 row is `every parser, sha256Hex, scanLines,
  isStale, isComplete, deriveRoundWindow, parseForcePhases, updateQueueStatus`. §8.2's table has seven
  rows and leaves **`parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`,
  `extractRecommendation`, `isStale` and `updateQueueStatus`** without one. `PROP-HASH-01`,
  `PROP-TRAILER-01`, `PROP-RESOLVE-01` and `PROP-STALE-01` close four of those six; §8 records the
  two that are deliberately left open and why.
- **Four invariants in the TSPEC are stated as invariants and proved only by enumeration.** `G-INV`
  (§2.5), the `ListFailure` disposition table (§4.2), `S-INV` with its 36-dispatch bound (§4.5,
  §5.6.1), and §8.5's await-classification rulings are each written as a **predicate over paths or
  positions, never as a list of the sites that satisfy it today** — and each is currently discharged
  by an AT that enumerates four exits, two call sites, one interleaving or three shipped lines
  respectively. A predicate stated over a space and checked at four points is exactly the shape a
  generated quantifier is for. `PROP-GATE-01`, `PROP-LIST-01a/-01b`, `PROP-EPISODE-01` and
  `PROP-AWAIT-01` are those four quantified.
- **Two more** — `PROP-APPROVE-01` (TSPEC §5.4's unanimity, a conjunction over a reviewer pair × two
  carriers) and `PROP-WINDOW-01` (§11.5's `N-a` threading over arbitrary start indices) — generalise
  assertions the PLAN already owns at a single point.

### 1.3 Relationship to PLAN §7.3, the permitted-red ledger

**PLAN §7.3 is the gate, and this document does not amend it.** §7.3 carries the seven floor
properties inside four of its rows (`scanLines property`, `both digest properties`, `both
round-derivation properties`, `parseForcePhases catalogue-closure`, `isComplete property`). The nine
new properties are named in no ledger row, because the PLAN converged before they existed.

Each new property therefore declares, in §7's coverage matrix, the `Green from` batch and
`Permitted red` window it **would** occupy, derived mechanically from the batch of its greening task
— the same derivation §7.3 uses. Adopting those rows into §7.3 is a mechanical PLAN edit owned by the
property's implementing task; it is not deferred work and it needs no new surface. Where a new
property's derived window is **identical** to an existing row's, this document says so and the
property rides that row rather than proposing another (this is true of `PROP-HASH-01`,
`PROP-TRAILER-01` and `PROP-AWAIT-01`).

Where a property lands in a file with a **sole** owning task (PLAN §5.3's single-writer rule), that
task is the owner. Where an invariant genuinely spans two files, it is split into two named halves
with distinct jest ids and one owner each — the same construction PLAN §7.4 uses for
`RLH-AT-30-module` / `-30-orch`. No property is owned twice.

### 1.4 What is out of scope here

- **Oracle *wording* for the example-based ATs.** FSPEC §19 owns AT-01…AT-66 and TSPEC §8.3 maps them
  to files. A property that merely re-ran one AT over generated inputs would be weak; §7's matrix
  states, per property, what it covers that the examples cannot.
- **Any change to the seven-name reviewer/doc-type catalogues, the halt strings, or the constants.**
  Those are TSPEC §4.1, §4.8 and §6.4 literals. Fixtures here **cite** them (§6.1) and never retype
  them.
- **A shared generator module.** PLAN §7.2 records the decision that domain generators stay per-file,
  file-local and unexported, and that a second *primitive* library is not written. That decision was
  reviewed and accepted twice; §3 builds on `driftGenerators.js` and proposes nothing beside it.

## 2. Conventions

## 3. Generators

## 4. Properties

## 5. Oracles

## 6. Fixtures

## 7. Coverage matrix

## 8. Gaps, residuals, and measured inconsistencies
