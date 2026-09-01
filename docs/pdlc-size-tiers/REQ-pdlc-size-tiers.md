---
feature: pdlc-size-tiers
ready: true
depends-on: pdlc-phase-g
---

# REQ — pdlc-size-tiers

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3 (tier table + footnotes 1–2); proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move M6, §3 R3-3 |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-size-tiers/LEARNINGS-pdlc-size-tiers.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

Every feature pays the same document toll regardless of how much feature there is. The
pipeline authors and cross-reviews REQ, FSPEC, TSPEC, PLAN, DECISIONS (when warranted) and
PROPERTIES, each through its own convergence loop with its own round window, for a
one-constant change exactly as for a multi-module one.

The archetype is measured, not asserted. `pdlc-rcv-budget-stop` is the feature the proposal
names as the S archetype ("one constant, four pure functions"; `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html`
§3 R3-3, Saving column). Its artifacts survive at `docs/discarded/pdlc-rcv-budget-stop/`, and
they measure as follows at HEAD:

| Artifact | Lines | Bytes |
|---|---|---|
| `REQ-pdlc-rcv-budget-stop.md` | 401 | 61,314 |
| `FSPEC-pdlc-rcv-budget-stop.md` | 1,109 | 100,669 |
| `TSPEC-pdlc-rcv-budget-stop.md` | 1,872 | 152,625 |
| `DECISIONS-pdlc-rcv-budget-stop.md` | 130 | 7,163 |
| `LEARNINGS-pdlc-rcv-budget-stop.md` | 116 | 13,506 |
| **Total** | **3,628** | **335,277** |

335 KB of specification for one constant and four pure functions, across five separate
documents each of which carried its own review window. The feature was then discarded — the
toll was paid in full and shipped nothing.

The proposal's diagnosis (§3 R3-3) is that document count, not document quality, is the
lever: S features should merge TSPEC+PLAN into one document and skip DECISIONS and
PROPERTIES entirely, because a PROPERTIES doc on a wiring-shaped feature "will likely produce
absence-only oracles" while the DoD mutation floor and the implementation wave gate still
gate the diff. The design doc's §3 tier table turns that into a three-tier pipeline with one
spine: S, M (default) and L differ only in how many documents and how many review rounds they
spend, never in whether implementation, verification or shipping runs.

Two properties of that design are what make it safe to try, and both are requirements rather
than niceties. First, **the tier is a floor, not a ceiling** — misclassification is recovered
by any reviewer escalating upward, and nothing may ever move a feature downward mid-run, so
the failure mode of a wrong guess is "we spent more than we needed", never "we skipped a
document we needed". Second, **the classification is recorded, not inferred** — it lives in
the REQ's frontmatter as `tier: S|M|L`, so an auditor months later reads why a feature has no
PROPERTIES doc from the feature's own root artifact rather than reconstructing it.

This REQ is the third of the design's §7 sequencing steps to be specified (after
`pdlc-decision-ledger`, queue row 30's `pdlc-phase-g`), and it is where the design's document
merges land. It is deliberately narrow: it decides **which documents a feature owes and how
that is recorded**, and nothing about how any of those documents is reviewed, grilled,
verified or shipped.

## 2. Goals

**G-1 (a feature carries a recorded, auditable tier).** Every feature run under this
capability has exactly one tier value — `S`, `M` or `L` — recorded in its REQ frontmatter as
`tier:`, together with how that value was arrived at (derived by the pipeline at intake, or
set by a human). A reader of the REQ alone can tell which tier the feature ran at and who
chose it. The default, when nothing is recorded and nothing can be derived, is `M`.

**G-2 (classification is derived from three intake signals, and is overridable).** At REQ
approval the pipeline proposes a tier from three signals named by the design (§3) and the
proposal (§3 R3-3, Mechanism): REQ size, file-ownership breadth, and dependency count. A
human may replace the proposed value with any tier before the feature's next phase runs, and
the recorded provenance says so. No signal is authoritative alone; each may only raise the
proposed tier, never lower one another's.

**G-3 (the tier decides document count, and only document count).** The tier selects which
specification documents a feature owes:

| | S | M (default) | L |
|---|---|---|---|
| REQ + FSPEC | merged into one SPEC document | merged into one SPEC document | separate REQ and FSPEC |
| TSPEC + PLAN | merged into one document | merged into one document | separate TSPEC and PLAN |
| DECISIONS document | never — decisions live as ledger rows | never — decisions live as ledger rows | full document |
| PROPERTIES document | never | only when TSPEC review names an algorithmic or stateful core | always |

Implementation waves, the Definition-of-Done verification, and shipping (PR, CI gate, merge)
run identically at every tier — the design's §3 table marks those three rows `unchanged` at
S, M and L, and this REQ keeps them so.

**G-4 (fewer documents never means fewer pins).** Merging two documents into one must not
leave any downstream document's approval pinned to fewer upstream documents than it derives
from. Whatever a document depends on, its recorded approval says so, and the staleness walk
still re-opens it when that upstream moves — the guarantee described in `pdlc/OPERATIONS.md`
(§Artifact convention, approval-anchor and `UPSTREAM-STATE` bullets) holds unchanged in shape
at every tier.

**G-5 (escalation is one-way and forward-only).** Any reviewer in any phase may raise a
feature's tier; nothing in the pipeline may lower it. A raise applies to phases that have not
yet run; documents already authored and approved at the lower tier are not re-authored, and
no phase already recorded as approved is re-opened by the raise alone.

**G-6 (config-gated, default off, disabled path byte-identical).** The whole capability sits
behind one config block that ships off. With it off — or absent, or malformed — the pipeline
produces byte-identical output to the pre-feature baseline: no tier is derived, no document
is merged, no document is skipped, and a `tier:` key sitting in a REQ's frontmatter changes
nothing. This mirrors the rollout posture already shipped for `learningsInjection`,
`cascade.pinCheck` and `review.derivativeStop` (`pdlc/OPERATIONS.md`, §Review loop mechanics).

**G-7 (measurable outcome).** For a feature classified `S`, the count of specification
documents authored and cross-reviewed drops from six (REQ, FSPEC, TSPEC, PLAN, DECISIONS,
PROPERTIES) to two, and the count of review windows opened drops correspondingly — the saving
the proposal's R3-3 row estimates as "two of six windows removed on S features". The count is
derivable from the artifacts on disk (`docs/{feature}/` document set and
`CROSS-REVIEW-*-v{N}` basenames), requiring no new instrumentation.

## 3. Non-Goals

**NG-1 Phase G is not specified here.** The design's §3 table gives Phase G a per-tier round
budget (none at S, ≤2 at M, ≤3 at L), but the grilling phase itself — its authority ladder,
its ESCALATE path, its ≤8-dispatch cost bound, its ledger-row output — is owned entirely by
`docs/pdlc-phase-g/REQ-pdlc-phase-g.md` (queue row 30). This REQ makes the tier value
available to that phase and says nothing else about it. If Phase G ships with a different
budget shape than the design table sketches, that is Phase G's decision to make, not a
conflict with this REQ.

**NG-2 The two-axis DoD collapse (R3-4) is out of scope.** The design's §3 footnote 2 is
explicit that this row is the only one requiring an operator re-decision because it
contradicts the standing 2026-08-02 decision to keep CR and DOD as separate gates
(`pdlc/OPERATIONS.md`, §Phase graph). It is queue row 32 (`pdlc-two-axis-dod`), it depends on
this feature, and nothing in this REQ presumes it.

**NG-3 No change to the Ship phases.** Phase PUB's CI gate and Phase MERGE's decision ladder
run identically at every tier. This REQ introduces no tier-dependent CI check, no
tier-dependent required-check set, and no tier-dependent merge condition.

**NG-4 No change to the Definition-of-Done gate.** DoD runs at every tier (§3 table, `Verify`
row: `always / always / always`). Its stub/mock/coverage scan, its mutation floor and its
remediation loop are untouched. In particular, a tier that skips PROPERTIES does not thereby
weaken DoD — the proposal's R3-3 Correctness column rests on exactly that: "DoD's mutation
floor and the V-wave still gate the diff".

**NG-5 No fail-closed gate is relaxed.** Untagged High findings still fail closed, the
erratum channel's R4 POSTMORTEM halt is unchanged, the structural-completeness probe still
runs (against whatever heading set the tier's document set implies — see O-2), the wave gate
and the document oracles are untouched.

**NG-6 No automatic tier lowering, ever.** Nothing in the pipeline may lower a recorded tier:
not a reviewer, not a heuristic that decides in hindsight the feature was smaller than it
looked, not a re-derivation at a later phase. Only a human editing the frontmatter may lower
a tier, and only before the feature's next phase runs (see AC REQ-SIZETIER-07).

**NG-7 No retroactive re-tiering of in-flight features.** A feature whose pipeline has
already begun when this capability is enabled keeps running exactly as it started: all six
documents, no merges. The capability applies from a feature's intake classification forward,
never backward into a run already under way.

**NG-8 No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS` or
`MAX_ERRATUM_FOLLOWUP_ROUNDS`.** The design's §3 closing paragraph proposes dropping the
per-invocation cap from 5 to 3 and the lifetime cap from 15 to 8 as part of the review-loop
end state; that is a separate change on a separate feature (queue row 28,
`pdlc-review-tightenings`). S's ≤1-round SPEC budget (REQ-SIZETIER-05) is a per-document
budget layered under today's caps, not a change to them.

**NG-9 No new document type for consuming repos to learn.** The merged documents keep the
existing artifact convention's directory and naming shape (`docs/{feature-name}/`,
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`). What the merged documents are *named* is FSPEC
material (O-1), but they are not a new class of artifact with a new lifecycle.

**NG-10 No changes under `pdlc/engine/`.** The engine vendors `pdlc/workflows/*.js` and picks
up changes at the next pack/publish, per repo convention.

## 4. Prerequisites

Hard prerequisites, checkable at gate time:

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-phase-g` — the tier's Phase G round budget has a phase to budget | Feature merged to `main` (queue row 30, `docs/pdlc-phase-g/REQ-pdlc-phase-g.md`) | Must exist at HEAD before FSPEC authoring |
| BL-02 | `pdlc-decision-ledger` — S and M record decisions as ledger rows instead of a DECISIONS document (G-3), so the ledger must be the place decisions can live | Feature merged to `main` (`docs/completed/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`; developed as a direct single-feature run, so it carries no queue row of its own — `docs/_queue/QUEUE.md` records this under row 30's dependency note) | Must exist at HEAD before FSPEC authoring; transitively implied by BL-01, whose `Depends-On` cell names it |
| BL-03 | Queue row 31 (`pdlc-size-tiers`, `depends-on: pdlc-phase-g`) exists in `docs/_queue/QUEUE.md` and is the row this REQ runs under | Queue row present | Checked at intake; already present at authoring time |

BL-02 is load-bearing for G-3's "ledger rows only" cells rather than decorative: without a
place for a decision to be recorded, "no DECISIONS document at S or M" would mean decisions
are not recorded at all, which is a loss of the record the pipeline exists to keep. If
`pdlc-decision-ledger` ships in a form that does not accept per-feature decisions, the S and
M rows of G-3's table must fall back to a DECISIONS document and this REQ needs a revision
round — that is the check BL-02 exists to force.

## 5. Constraints

**C-1 Per-key independent fallback.** Config keys follow the shipped precedent
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`,
`advisory`): one malformed or wrong-typed key inside the `sizeTiers` block falls back to its
own declared default and never retunes another key in the block or any other config block.

**C-2 Disabled path proven against a committed baseline.** The `sizeTiers.enabled: false`
path is byte-identical to the pre-feature baseline, verified against committed fixture
baselines rather than a same-branch before/after assertion — the precedent
`pdlc/OPERATIONS.md` names for `learningsInjection` and `cascade.pinCheck`.

**C-3 Config key spellings are fixed.** The keys are spelled exactly as declared in C-5. No
other spelling or nesting satisfies this REQ's criteria.

**C-4 The frontmatter key is `tier`, and its value set is closed.** The recorded tier is the
frontmatter key `tier`, whose only accepted values are `S`, `M` and `L`. Any other value —
lowercase, a synonym, a number, a range — is not a tier; a REQ carrying one is treated as
carrying none and takes the default (`M`), and the discrepancy is surfaced to the operator
rather than silently coerced. A `tier` key present while the capability is disabled is inert
(G-6).

**C-5 Declared thresholds.** Per the threshold-declaration obligation, every threshold this
REQ's criteria depend on is declared here rather than left to TSPEC to invent:

| Key | Default | Type | Config owner | Rationale |
|---|---|---|---|---|
| `sizeTiers.enabled` | `false` | boolean | operator, `.claude/pdlc.config.json` → `sizeTiers` | Design §7 experiment discipline: one feature per experiment, gate ships off |
| `sizeTiers.defaultTier` | `"M"` | one of `S`/`M`/`L` | operator | Design §3: "default M" — the tier taken whenever classification is unavailable, unparseable, or disagrees with itself |
| `sizeTiers.sMaxReqPaths` | `4` | positive integer | operator | S-ceiling on file-ownership breadth (distinct repo paths the REQ names as touched) |
| `sizeTiers.sMaxDependencies` | `1` | non-negative integer | operator | S-ceiling on dependency count |
| `sizeTiers.sMaxReqLines` | `450` | positive integer | operator | S-ceiling on REQ size; derivation below |
| `sizeTiers.lMinReqPaths` | `12` | positive integer | operator | L-floor on file-ownership breadth |
| `sizeTiers.lMinDependencies` | `3` | positive integer | operator | L-floor on dependency count |
| `sizeTiers.lMinReqLines` | `600` | positive integer | operator | L-floor on REQ size; derivation below |

A feature is proposed `S` only when every S-ceiling holds, proposed `L` when any L-floor is
reached, and proposed `M` otherwise — the three signals may only raise the proposal relative
to one another, never lower it (G-2). The evaluation order, the tie-breaking when a signal is
unmeasurable, and where the derived value is written are FSPEC/TSPEC material (O-3), not
specified here.

**Derivation of the REQ-size cutoffs (measured, not guessed).** The S-ceiling is anchored on
the one feature the proposal names as the S archetype. `REQ-pdlc-rcv-budget-stop.md` measures
401 lines / 61,314 bytes at HEAD (§1 table). Any S-ceiling below 401 lines classifies the
archetype as M and the tier scheme fails on its own reference case, so 401 is the measured
floor for this cutoff; `450` is that floor rounded up to the next 50-line step, still below
the 500-line upper end of the REQ authoring target recorded in the pm-author REQ Size Budget.
The L-floor of `600` is the same budget's hard ceiling (700 lines) less one 100-line step: a
REQ within 15 % of the ceiling has, by that budget's own standing rule, reached the size at
which relocation or splitting is already in question, which is not an S- or M-shaped feature.
Both cutoffs are author defaults over a single measured anchor and are explicitly vetoable
(A-1).

**C-6 Byte budgets are unchanged.** Merging two documents into one does not raise any size
budget. The merged SPEC document is subject to the same 700-line / 61,440-byte ceiling every
REQ is subject to today (`pdlc/hooks/scripts/check-req-size.sh`). A feature whose merged SPEC
cannot fit that ceiling is evidence the feature is not S or M — it is a split, or a tier
escalation, never a budget waiver.

**C-7 The tier never gates correctness machinery.** No acceptance criterion in this REQ makes
any of the following tier-dependent: the DoD scan and its mutation floor, the implementation
wave gate, the document oracles, the required CI check set, the fail-closed finding grammar,
or the POSTMORTEM halt lifecycle (NG-3, NG-4, NG-5).

## 6. Acceptance Criteria

### REQ-SIZETIER-01 The tier is recorded in the REQ with its provenance (P0)

**Source:** US-03.

**Who:** an engineer or auditor reading a feature's REQ.
**Given:** `sizeTiers.enabled` is `true` and a feature has been classified.
**When:** they read the REQ's frontmatter.
**Then:** it carries `tier:` with exactly one of `S`, `M`, `L`, and the run's operator-facing
output states, for that feature, both the tier and whether it was derived by the pipeline or
set by a human — the same `(provenance: automatic)` / `(provenance: operator-set)`
distinction the wave-ledger announcements already make (`pdlc/OPERATIONS.md`, §wave ledger).
No feature runs with an unrecorded tier.

### REQ-SIZETIER-02 The tier is proposed at intake from three declared signals (P0)

**Source:** US-01.

**Who:** the pipeline, classifying a feature at intake.
**Given:** `sizeTiers.enabled` is `true`; a REQ has reached approval and carries no
human-set `tier`.
**When:** the tier is proposed.
**Then:** the proposal is a function of exactly three signals — REQ size, the count of
distinct repo paths the REQ names as touched, and the feature's dependency count (the union
of the REQ frontmatter's `depends-on` and the queue row's `Depends-On` cell, the same union
the queue already reads) — evaluated against the cutoffs declared in C-5, and no other input.
Where a signal cannot be measured, it does not lower the proposal; the feature takes at least
`sizeTiers.defaultTier`.

### REQ-SIZETIER-03 A human may set or replace the tier before the next phase runs (P0)

**Source:** US-02, US-03.

**Who:** an operator.
**Given:** `sizeTiers.enabled` is `true`; a feature's REQ carries a `tier` value, derived or
not.
**When:** the operator edits `tier:` in the REQ frontmatter, and the feature's next phase
begins.
**Then:** the phase runs at the human-set tier, the run's output records the tier's
provenance as operator-set, and the pipeline never overwrites a human-set value with a
derived one on any later phase of that feature.

### REQ-SIZETIER-04 The tier decides exactly which documents the feature owes (P0)

**Source:** US-01.

**Who:** the pipeline, running a feature's specification phases.
**Given:** `sizeTiers.enabled` is `true` and the feature's tier is `T`.
**When:** the specification phases run.
**Then:** the document set is exactly G-3's table row for `T`: at `S`, one merged SPEC
document and one merged TSPEC+PLAN document, no DECISIONS document and no PROPERTIES
document; at `M`, the same two merged documents, no DECISIONS document, and a PROPERTIES
document only under REQ-SIZETIER-06; at `L`, separate REQ, FSPEC, TSPEC, PLAN, DECISIONS and
PROPERTIES documents exactly as today. No document outside that set is authored, and no
document inside it is skipped.

### REQ-SIZETIER-05 An S feature's SPEC document gets one review round (P0)

**Source:** US-01.

**Who:** the review loop, converging an S feature's merged SPEC document.
**Given:** `sizeTiers.enabled` is `true`; the feature's tier is `S`.
**When:** the SPEC document's review loop runs.
**Then:** at most one review round is dispatched for that document. If that round does not
converge the document, the outcome is exactly today's per-invocation round-cap exhaustion
outcome — no new halt class, no new outcome string, no new operator-facing failure mode (see
A-2, which records this reading as vetoable).

### REQ-SIZETIER-06 PROPERTIES at M is authored only when TSPEC review names a core (P0)

**Source:** US-01.

**Who:** the pipeline, deciding whether an M-tier feature owes a PROPERTIES document.
**Given:** `sizeTiers.enabled` is `true`; the feature's tier is `M`; its merged TSPEC+PLAN
document has completed review.
**When:** the PROPERTIES phase would run.
**Then:** it runs only if a reviewer in that review named an algorithmic or stateful core in
the feature (the design's §3 footnote 1 examples: parser, scheduler, money math,
concurrency). Absence of such a naming means no PROPERTIES document, and the absence is
recorded in the run's output as the reason the phase did not run — never as a silent skip.
The grammar a reviewer uses to name a core, and how that naming is read, is FSPEC/TSPEC
material (O-4).

### REQ-SIZETIER-07 Escalation is one-way, forward-only, and never rewrites the past (P0)

**Source:** US-02.

**Who:** any reviewer in any phase of a running feature.
**Given:** `sizeTiers.enabled` is `true`; the feature's recorded tier is `T`; a reviewer
raises it to `T'` where `T'` is strictly higher in the order S, then M, then L.
**When:** the raise is recorded.
**Then:** every phase that has not yet run for that feature runs at `T'`; documents already
authored and approved at `T` are not re-authored and their approvals are not re-opened by the
raise alone; and no path in the pipeline — reviewer, heuristic, re-derivation or fallback —
ever records a tier strictly lower than the one already recorded for that feature (NG-6).

### REQ-SIZETIER-08 A merged document leaves no downstream approval unpinned (P0)

**Source:** US-02, US-04.

**Who:** the staleness walk, evaluating whether a downstream document's approval is stale.
**Given:** `sizeTiers.enabled` is `true`; a feature ran at `S` or `M`, so its upstream
documents are merged rather than separate.
**When:** an upstream document is edited after a downstream document was approved.
**Then:** the downstream document's approval is recognised as stale exactly as it would have
been had the upstream documents been separate — every upstream a document derives from is
pinned by that document's approval record, and merging two upstream documents into one never
produces a downstream approval that survives an upstream edit it should not survive. The
concrete anchor form for a merged document is TSPEC material (O-2).

### REQ-SIZETIER-09 The disabled path is byte-identical, and a stray `tier` key is inert (P0)

**Source:** US-04.

**Who:** the pipeline, running any feature.
**Given:** `sizeTiers.enabled` is `false` (the default), absent, or malformed — whether or
not any REQ in the repo carries a `tier` frontmatter key.
**When:** any phase of any feature runs.
**Then:** every dispatch, artifact and report is byte-identical to the pre-feature baseline:
no tier is derived or recorded, no document is merged, no document is skipped, no PROPERTIES
trigger is evaluated, and the `tier` key changes nothing about which feature the queue picks
or how it runs.

### REQ-SIZETIER-10 Config keys fail open independently (P0)

**Source:** US-04.

**Who:** the config loader.
**Given:** the `sizeTiers` block in `.claude/pdlc.config.json` carries one malformed or
wrong-typed key among those declared in C-5.
**When:** config is parsed for a run.
**Then:** only that key falls back to its declared default; the block's other keys and every
other config block are unaffected — the shipped per-key fallback precedent (C-1).

### REQ-SIZETIER-11 An unrecognised tier value takes the default and is surfaced (P1)

**Source:** US-03.

**Who:** the pipeline, reading a feature's recorded tier.
**Given:** `sizeTiers.enabled` is `true`; a REQ's `tier` key carries a value outside the
closed set `S`/`M`/`L` (C-4).
**When:** the feature's next phase runs.
**Then:** the feature runs at `sizeTiers.defaultTier`, the run's operator-facing output names
the rejected value and the tier actually used, and the unrecognised value is never coerced
into a neighbouring tier and never silently ignored. This is not a halt.

### REQ-SIZETIER-12 A feature already in flight is never re-tiered (P1)

**Source:** US-04.

**Who:** the pipeline, running a feature whose specification phases began before
`sizeTiers.enabled` became `true`.
**Given:** the feature already has separate REQ and FSPEC documents on disk, or otherwise
began under the pre-feature document set.
**When:** a later phase of that same feature runs after the capability is enabled.
**Then:** the feature completes on the document set it started with; no already-authored
document is merged, superseded or retired mid-run, and no phase is skipped on account of a
tier the feature never ran under (NG-7).

## 7. Risks

**R-1 Misclassification (the proposal's own named risk, R3-3 Risk column: "Medium —
misclassification").** A feature classified S that is really M or L skips documents it
needed. Mitigated exactly as the proposal prescribes: default M (C-5), one-way escalation
available to any reviewer in any phase (REQ-SIZETIER-07), and no automatic lowering (NG-6).
The residual exposure is an S feature nobody escalates — bounded by NG-4, since DoD's scan
and mutation floor gate the diff at every tier.

**R-2 The intake signals are proxies, and one of them is measured late.** File-ownership
breadth is the strongest of the three signals (the archetype's REQ was 401 lines yet the
feature touched almost nothing), but the pipeline's authoritative ownership record is the
PLAN's file-ownership manifest, which does not exist at intake. Classification therefore uses
the paths the REQ *names*, which is an estimate. Mitigated by escalation: when the PLAN's
manifest proves the feature broader than intake believed, a reviewer raises the tier and only
un-run phases are affected. O-5 carries the question of whether that comparison should be
made mechanically.

**R-3 Merging documents can silently thin the pin graph.** Two documents merged into one is
one fewer thing a downstream approval can pin. If the merged document's anchoring is not
handled deliberately, a downstream approval survives an upstream edit it should have been
re-opened by — a staleness false negative, which is strictly worse than the false positives
the pipeline already knows how to handle. REQ-SIZETIER-08 states the outcome; the anchor form
is routed to TSPEC (O-2) precisely because it is a contract, not a requirement.

**R-4 One review round at S is a thin margin.** REQ-SIZETIER-05 gives an S feature's SPEC
document a single round; a feature that genuinely needed two now consumes a cap-exhaustion
outcome instead. The counter-argument is the design's: with Phase G in front of authoring
(BL-01), discovery has already happened before the round is spent. If S features start
exhausting the budget routinely, that is evidence Phase G is not doing its job on those
features — diagnose upstream rather than raising the budget.

**R-5 The C-5 defaults rest on a single measured anchor.** Only one feature
(`pdlc-rcv-budget-stop`) has been measured as an S archetype, and the L-floors are derived
from the REQ size budget rather than from observed L features. The cutoffs are therefore
author defaults with one real datum behind them, labelled vetoable (A-1). Mitigated by the
acceptance criteria pinning the observable behaviour rather than the numbers:
REQ-SIZETIER-02, -04 and -07 hold for any cutoff values.

**R-6 Config-gated, default-off means zero effect until an operator opts in.** By design
(design §7 sequencing; proposal §6 "one feature per experiment"), and the same posture
`cascade.pinCheck` and `review.derivativeStop` shipped under. The risk is the flag outliving
the experiment; the design's §5.3 rule applies — every gate carries a retirement version in
its decision row, and this gate should carry one at TSPEC time (O-6).

**R-7 The tier vocabulary can leak into places this REQ does not govern.** `S`/`M`/`L` are
cheap to reach for, and a later feature may be tempted to make CI, DoD or merge behaviour
tier-dependent. NG-3, NG-4 and C-7 exist to make that a visible contradiction of this REQ
rather than an unremarked extension of it.

## 8. Obligations / Open Questions

**O-1** What the merged documents are called — whether the merged REQ+FSPEC is a new `SPEC`
document type or a REQ that absorbs the FSPEC's sections, and likewise for TSPEC+PLAN — is
FSPEC material. It is a naming and lifecycle question with real downstream consequences (the
structural-completeness heading sets, the cross-review file naming, the operator's
phase-forcing token catalogue `R, F, T, P, D, PR` documented in `pdlc/OPERATIONS.md`), and
this REQ deliberately does not decide it.

**O-2** The concrete approval-anchor and upstream-pin form for a merged document
(REQ-SIZETIER-08) is TSPEC material. This REQ states only the outcome that must hold.

**O-3** The evaluation order of the three intake signals, the behaviour when a signal is
unmeasurable, and where the derived value is written are FSPEC/TSPEC material (C-5).

**O-4** The grammar by which a TSPEC reviewer names an algorithmic or stateful core, and how
that naming is read to fire the M-tier PROPERTIES trigger (REQ-SIZETIER-06), is FSPEC
material. It should reuse an existing reviewer-output grammar rather than mint a new one.

**O-5** Whether the PLAN's file-ownership manifest should be compared mechanically against
the intake ownership estimate, and a tier raise proposed when they disagree (R-2), is left
open. It is a plausible follow-on, not a requirement of this REQ; if adopted it must respect
NG-6 — a narrower-than-estimated manifest never lowers a tier.

**O-6** The retirement version for the `sizeTiers` gate (design §5.3: every flag carries a
death date recorded in the decision row that introduces it) is TSPEC material and should be
recorded when the gate is introduced, not later.

**Open question — scoping of this REQ itself.** This REQ carries two separable concerns:
(a) **classification and its record** — REQ-SIZETIER-01, -02, -03, -07, -09, -10, -11, -12,
which are self-contained and could ship with the tier recorded and read but no document set
changed; and (b) **merged-document mechanics** — REQ-SIZETIER-04, -05, -06, -08, which is
where the real behaviour change and the real risk (R-3) live. A split along that line, wired
as two queue rows with a `depends-on` edge, may well be warranted. It is raised here rather
than pre-emptively executed because the honest scoping of the design's §3 table pushes this
REQ toward the upper end of its size budget, and thinning the acceptance criteria to fit
would be the wrong remedy — the split is. The decision belongs to the first review round: a
reviewer who judges (b) too large to carry alongside (a) should say so as a finding, and the
split then happens under the pm-author split trigger with its own queue row, rather than
being decided unilaterally at authoring time.

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch. The
following are explicit, operator-vetoable choices rather than open questions blocking
authoring:

- **A-1** The C-5 cutoffs (`4` / `1` / `450` for S; `12` / `3` / `600` for L) are author
  defaults over one measured anchor (§1). An operator may revise any of them before FSPEC
  authoring without requiring a REQ revision round; only the derivation narrative in C-5 and
  the measured anchor itself are load-bearing.
- **A-2** REQ-SIZETIER-05's "≤1 review round" is read as a per-document review budget whose
  exhaustion behaves exactly as today's per-invocation cap exhaustion behaves — no new
  outcome class. The alternative reading (exhaustion accepts the document as-is, the way the
  lifetime cap does) is coherent and cheaper, and an operator may choose it; it is not chosen
  here because it would create a second accept-as-is path, and the design's §3 framing treats
  caps as tripwires rather than convergence mechanisms.
- **A-3** The design's §3 table is read as authoritative for scope and the proposal's R3-3 row
  as its rationale. Where they differ in detail, the design doc wins — it is the later
  document and states itself as the successor.
- **A-4** "File-ownership breadth" at intake is read as the count of distinct repo paths the
  REQ names as touched, because the authoritative ownership manifest does not exist until
  PLAN (R-2). An operator who prefers a different intake proxy may substitute one without
  changing any acceptance criterion.
- **A-5** This REQ assumes the design's §3 Phase G budgets (none at S, ≤2 at M, ≤3 at L) are
  specified by `pdlc-phase-g` and not here (NG-1). If Phase G ships without per-tier budgets,
  nothing in this REQ fails — the tier is still available to it.

## 9. Traceability

| User Story | Requirements |
|---|---|
| US-01 As an engineer shipping a small feature, I want to pay two specification documents instead of six, so the toll matches the change | REQ-SIZETIER-02, REQ-SIZETIER-04, REQ-SIZETIER-05, REQ-SIZETIER-06 |
| US-02 As a reviewer, I need to raise a feature's tier when it was classified too small, and to know nothing can lower it behind me | REQ-SIZETIER-03, REQ-SIZETIER-07, REQ-SIZETIER-08 |
| US-03 As an auditor reading a feature months later, I need the REQ itself to tell me which tier it ran at and who chose it | REQ-SIZETIER-01, REQ-SIZETIER-03, REQ-SIZETIER-11 |
| US-04 As an operator, I need this to be safe to enable per project — disabled path unchanged, every config key failing open independently, in-flight features untouched | REQ-SIZETIER-09, REQ-SIZETIER-10, REQ-SIZETIER-12 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.
