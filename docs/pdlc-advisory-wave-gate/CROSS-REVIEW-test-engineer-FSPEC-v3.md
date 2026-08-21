# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6, bytes unchanged)
**Upstream under confirmation:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (sha256:c62cfc35…, v1.15)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation)

## Overview

Upstream-cascade confirmation, not a re-review. My FSPEC approval (v2,
`REVIEWED-COMMIT: 9f80247a`) recorded `UPSTREAM-STATE: REQ sha256:8963a0c0…` — REQ v1.13 at
`53fe0b73`. REQ has since moved through two erratum rounds to v1.15 at `0cef7148`
(sha256:c62cfc35…), so the approval was taken against a version of REQ that no longer exists.

**Question answered here:** does FSPEC v1.6, byte-identical since `9f80247a`, still read as a
faithful compression of REQ as it now stands?

**Method.** Re-read `CROSS-REVIEW-test-engineer-FSPEC-v2.md`; ran
`git diff 53fe0b73 0cef7148 -- …/REQ-pdlc-advisory-wave-gate.md` (the full upstream delta across
both erratum rounds, not only the round named in the dispatch); then re-read, at their current
version, the REQ clauses this FSPEC leans on — AC-1.1, AC-5.1, AC-5.2, R-5, and the lineage
header — against the FSPEC sites that compress them (§2 preamble, BR-9, BR-10, E-23, E-34,
§7.1 O-1). I did not re-open sections untouched by the upstream delta, and I re-litigate nothing
settled in v1 or v2.

**Answer in one line.** Yes — every substantive AC-5.1 and AC-1.1/R-5 change the erratum rounds
landed was *already* stated in FSPEC v1.6, in some cases more precisely than REQ stated it before;
two Low citation-fidelity gaps remain, neither gating.

## Linked Requirements

The upstream delta `53fe0b73…0cef7148` touches five REQ sites. Disposition of each against FSPEC:

| REQ site (v1.15) | What changed | FSPEC site that compresses it | Still faithful? |
|---|---|---|---|
| Lineage header | `Upstream` restored to a resolvable path; `Downstream` now names FSPEC/TSPEC/PLAN/PROPERTIES; `Cross-Reviews` scoped to harvested rounds | FSPEC header rows 5–7 | Yes — FSPEC's own header names REQ as its upstream and does not restate REQ's `Cross-Reviews` scope, so nothing here is compressed downstream |
| Status/version row | `draft` 1.13 → `approved (shipped)` 1.15 | §2 preamble, "traces to `REQ-…` v1.13" | **Stale pin** — F-01 below |
| AC-1.1 | Adds the base pin: five-member "before" is at `c8aa22a4`; post-change reading at `11420461` (baseline v1.2 §4, M-WG-13) | §2 "Where 'before' is measured" (lines 74–78) | Yes — FSPEC already carries both anchors verbatim, and adds the "green at any later base is a vacuum, not a pass" rule REQ does not state |
| AC-5.1 | Pins the observation point (restoration completes); excludes three record carriers — AC-6.1 record append, **AC-6.2 escalation-log append**, AC-5.2 queue-row write (M-WG-7); excludes `.gitignore`d paths in both directions; states the failed-capture outcome | BR-9 (observation point + domain), E-23 (halt's own writes), E-34 (capture failure), §7.1 O-1 | Substantively yes; BR-9's excluded-carrier enumeration names two of REQ's three — F-02 below |
| R-5 | Pre-change readings measured at `c8aa22a4`; M-WG-13/M-WG-14 post-change at `11420461` | §2, same paragraph | Yes — identical anchors, same direction |

**Direction of the cascade matters here.** AC-5.1's erratum was raised by *my own* v1 finding on
REQ and lands upstream what FSPEC BR-9 had already specified independently. This is the benign
cascade shape: upstream converged onto the downstream compression, so the compression did not
drift. The one asymmetry left is enumerative, not semantic (F-02).

## Behavioral Flow

§3's ten-step flow and the 3.3 decision table are untouched by this delta, and the delta creates
no pressure on them: AC-5.1's erratum constrains *when the reversibility oracle is read*, not what
the flow does. Two checks, both clean:

- **Step 9 → step 10 ordering still carries the observation point.** REQ v1.15 places the
  observation "the moment restoration completes", with the record append (AC-6.1), the
  escalation-log append (AC-6.2) and the queue-row write (AC-5.2/M-WG-7) all *after* it. FSPEC
  §3 step 9 (record + escalation entries) and step 10 (halt + M-WG-3 reason + M-WG-7 queue row)
  both sit downstream of the restore that step 3b/BR-9 triggers. A test author reading FSPEC in
  order arrives at the same seam REQ now names. No re-ordering is required.
- **The failed-capture branch has a flow home.** REQ's new "cannot be captured at all" sentence
  routes to *no dispatch* — FSPEC's step 1/3 inapplicability path plus E-34 ("A6 escalates without
  dispatching a repair"). The flow already refuses to act before it writes, so the new REQ
  sentence does not introduce a step the flow lacks.

Nothing in §3.3's rows changes truth value under REQ v1.15.

## Business Rules

**BR-9 — the load-bearing rule under this cascade.** REQ AC-5.1 now says three things BR-9 must
still compress faithfully.

1. *Observation point.* REQ: "the moment restoration completes". BR-9: "the map is taken
   immediately after restoration completes and **before** the record and escalation writes BR-13
   requires". Same moment, stated with the seam a fixture author can instrument. Faithful.
2. *Ignored paths.* REQ: excluded, "operator files A6 never wrote and never restores over".
   BR-9: `.gitignore`d paths are "outside the map in both directions, and an ignored path the
   re-gate mutated is not a restoration defect", with examples (`node_modules/`, tool caches,
   `.env`, the run's own untracked wave ledger). BR-9 is strictly more testable than REQ here —
   the "in both directions" clause is what stops a fixture from asserting an ignored path was
   *restored*. Faithful, and this is the right altitude split.
3. *Excluded carriers.* REQ names **three**: AC-6.1's record append, AC-6.2's escalation-log
   append, AC-5.2's queue-row write (M-WG-7). BR-9's exclusion sentence names **two** — "the
   record and escalation writes … **both** carriers are files inside the tree". The queue-row
   write is excluded elsewhere (E-23 names it with M-WG-7 explicitly), and it is excluded *by
   construction* anyway, since it happens at step 10, strictly after the step-9 writes the
   observation already precedes. So the oracle a test author writes from BR-9 is unaffected in
   behaviour — but the enumeration and the word "both" now under-count REQ's list at the rule
   site AT-05-1 cites. That is F-02: Low, delta, local.

**BR-10** — unchanged in truth value. It leans on AC-5.1/AC-5.3's *no-restoration-trigger* case,
which the erratum did not touch; its "repair stays in the working tree, and the record and halt
report say so" consequence is untouched by the carrier-exclusion edit (the carriers are excluded
from the *comparison*, not from being written).

**BR-13/BR-14** — the record-and-escalation write contract BR-9's observation point references.
REQ's carrier list is now the same set BR-13 mandates plus the queue row; no BR-13 clause is
contradicted.

No business rule needs to change for FSPEC to hold. No High finding here.

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
