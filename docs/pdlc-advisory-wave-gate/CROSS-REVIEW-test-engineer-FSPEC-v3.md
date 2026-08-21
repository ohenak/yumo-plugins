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

Two §5 rows sit directly under the delta; both survive, and one is the reason the delta is
non-gating.

- **E-23 (run ends on the wave's own gate halt).** This row already enumerates all three carriers
  REQ v1.15 now lists: "the halt path still appends the record and escalation entries BR-13
  requires and still rewrites and commits the `halted` queue row (M-WG-7), and those writes are
  the halt's, not a restoration defect." Read together, BR-9 + E-23 cover REQ's excluded set
  exactly — which is why F-02 is a Low enumeration gap and not a coverage gap. The residual risk
  is only that a fixture author working from BR-9 alone never reaches E-23; the fix is one clause
  in BR-9, not a new rule.
- **E-34 (pre-A6 state cannot be captured at all).** REQ v1.15's new sentence — "no repair is
  proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different outcome
  from a failed restoration" — is E-34 verbatim in substance, including the *distinctness from
  E-28* that my v1 F-04 asked for and FSPEC v1.6 landed. Upstream converged onto the FSPEC here;
  the compression is ahead of its source, not behind it.
- **E-28 (restoration fails)** — untouched, and still the contrasting row REQ now implicitly
  points at.
- **E-22** — untouched; the post-gate-halt disclosure obligation is unaffected by carrier
  exclusion.

No new edge case is created by the delta, and no §5 row is falsified by it.

## Acceptance Tests

The testability question: does any AT become unwritable, or silently false-green, under REQ v1.15?

| AT | Leans on | Under REQ v1.15 |
|---|---|---|
| AT-05-1 | AC-5.1 whole-tree identity, BR-9 map | Still writable. The oracle domain (tracked + non-ignored untracked, content-hash map) and the observation point are unchanged by the delta. The *When*/oracle-moment ambiguity I filed as v2 F-03 (Medium) is still open — it is inherited, not created here, and remains non-gating. |
| AT-05-2 | BR-9's per-path-restore failure case | Untouched; the delta does not weaken the case this AT exists to fail. |
| AT-06-1 | BR-13 record shape, read after the carriers land | Consistent: REQ now says explicitly that those carriers are outside AT-05-1's comparison, which is precisely the AT-05-1/AT-06-1 division FSPEC already drew. The delta *removes* a latent conflict between the two ATs rather than creating one. |
| AT-01-1, AT-07-2, AT-04-5 (first companion) | §2's "before" base | Still writable, and now double-pinned: FSPEC and REQ name the same `c8aa22a4` before-base and the same `11420461` post-change reading. A stale-base false-green is now blocked from both documents. |
| AT-02-x, AT-03-x, AT-04-1/-1a/-1b | AC-2.x, AC-3.x, AC-4.x | Untouched by the delta; not re-reviewed. |

**Falsifiability spot-check on the delta's own new REQ sentence.** REQ's failed-capture clause is
an absence-shaped claim ("no repair is proposed, none is applied"). FSPEC E-34 gives it a positive
conjunct — "A6 escalates without dispatching a repair … the escalation names the capture as the
cause" — so a test can assert an exact escalation with a named cause rather than merely the
absence of a dispatch. No absence-only oracle is introduced by this cascade.

No AT is falsified, and none becomes unwritable. No High.

## Open Questions

| ID | Question |
|---|---|
| Q-01 | Should BR-9's excluded-carrier sentence be kept in sync with AC-5.1's list mechanically (three carriers named at the rule site), or is the current BR-9 + E-23 split deliberate — BR-9 excluding only the two step-9 writes it is temporally adjacent to, E-23 owning the step-10 queue row? Either answer is fine; the FSPEC should state which, so the next upstream erratum does not re-open it. (F-02.) |
| Q-02 | Carried from v2 F-03, still open and still non-gating: AT-05-1's *When* says "each terminates" while BR-9's oracle is read mid-run at restoration completion. REQ v1.15 now pins the observation point explicitly, which makes the AT's framing the only remaining ambiguity — does the TSPEC obligation O-1 also carry the *post-restoration* observation seam, or only the *pre-A6 capture* point it names today? |

**Obligations unchanged.** §7.1 O-1 still routes the restoration mechanism and its capture point to
the TSPEC, and REQ v1.15's AC-5.1 still closes with "the mechanism of restoration is TSPEC's to
choose (O-1)". The altitude split is intact in both directions — REQ gained precision about the
*observable*, not about the mechanism, so no obligation moved.

**Positive observations.**

- The erratum landed upstream what FSPEC had already specified. AC-5.1's observation point,
  ignored-path exclusion and failed-capture branch existed in BR-9/E-34 before REQ said them; the
  cascade closed a gap in REQ, not in FSPEC. That is the cheap direction for a cascade to run.
- AC-1.1 and R-5 now carry the same `c8aa22a4` / `11420461` pair FSPEC §2 already carried. A
  before-base false-green — the most expensive failure available to this feature, since three ATs
  define themselves against a state HEAD no longer holds — is now pinned in two documents that
  would have to drift together to lose it.
- REQ explicitly declines two items as "inherited and nonlocal" rather than absorbing them
  silently. Recording what was *not* taken, and why, is what makes this confirmation cheap to run.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | §2's preamble pins traceability to `REQ-pdlc-advisory-wave-gate` v1.13; upstream is now v1.15 (`approved (shipped)`). The clauses still trace correctly — the version token is what is stale. Bump to v1.15 in §2 (and note the header's Status change if FSPEC mirrors it). | §2 Linked Requirements, preamble |
| F-02 | Low | delta | local | BR-9 excludes "the record and escalation writes … **both** carriers"; AC-5.1 v1.15 excludes **three** — AC-6.1's record append, AC-6.2's escalation-log append, AC-5.2's queue-row write (M-WG-7). E-23 names the queue row, and the observation point precedes it structurally, so no oracle is wrong; the rule site AT-05-1 reads from just under-counts. Add the queue row to BR-9's clause (or cross-reference E-23) and drop "both". | §4 BR-9, "Observation point" |

FINDING: Low | delta | local | §2 Linked Requirements preamble | FSPEC pins its upstream at REQ v1.13; REQ is now v1.15 (approved/shipped) — the version token is stale, the traces themselves still resolve
FINDING: Low | delta | local | §4 BR-9 observation point | BR-9 names two excluded record carriers ("both"), AC-5.1 v1.15 names three (record append, escalation-log append, M-WG-7 queue-row write); E-23 covers the third, so the gap is enumerative, not a coverage hole

## Recommendation

**Approved with minor changes.** FSPEC v1.6 still holds as approved against REQ v1.15. Every
substantive clause the erratum rounds added upstream — AC-5.1's observation point, its ignored-path
exclusion in both directions, its failed-capture outcome, and AC-1.1/R-5's `c8aa22a4` /
`11420461` base pins — was already present in FSPEC v1.6, at equal or finer testability. No AT is
falsified, none becomes unwritable, and no oracle loses falsifiability. The two Low findings are
citation-fidelity gaps at the seam the erratum moved: one stale version token, one under-counted
enumeration whose missing member is stated one section away. Neither gates; both are one clause
each and are worth folding into the next touch of this document so the next cascade has nothing
to catch. My v2 Mediums (F-01…F-03) and Low (F-04) remain open, inherited, and non-gating.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:91ef25574e678b3c5433467ff31f800bdcb17bcff54e5f1a59c2e6da28e5cb34
APPROVAL-HASH-NORMALIZED: sha256:91ef25574e678b3c5433467ff31f800bdcb17bcff54e5f1a59c2e6da28e5cb34
REVIEWED-COMMIT: 0361675ee4778dc7072d759473ed4e831c875e1a
UPSTREAM-STATE: REQ sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
