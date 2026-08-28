---
feature: pdlc-loop-economics
ready: true
depends-on: []
---

# REQ pdlc-loop-economics

| Field | Value |
|---|---|
| Upstream | **REQ** (root) |
| Downstream | FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-27 |

## 1. Problem / Context

The pdlc review loop (`orchestrate-dev`'s `reviewLoop`) burns rounds on findings that
carry no substantive edit, and cannot tell "still finding things" from "nothing left to
find, but nobody told the driver." Three measured failure shapes, each already promoted
to a project-level decision, motivate this feature:

1. **Stale-anchor re-filing.** On `pdlc-engineering-loop`, a single stale dispatch-hash
   defect was re-filed as a Low finding across **54 separate cross-reviews**, none of
   them owed a document edit — the round only ever needed the harness to quote the
   current hash instead of an agent transcribing it (`_evidence/report-A-learnings.md`;
   `docs/_decisions/DECISIONS-anchor-provenance.md` DEC-ANCHOR-01). The same shape
   recurred cross-repo: `longhorizon-daily-baseline` quoted a stale FSPEC sha as
   "current" across two delta re-confirmations, and `structure-directional-options-scoring`
   re-filed the same approval-anchor defect across four reviews while carrying nine
   approving rounds on a document with no anchors at all
   (`_evidence/regime-ledger-signals.md`).
2. **Verdict-at-cap masking convergence.** On the same feature, **4 of 6** tracked
   document types ran to the `MAX_LIFETIME_ROUNDS` (15) cap while the review corpus
   recorded 114 approving verdicts overall — "the cap is doing the converging, not the
   loop" (`_evidence/report-A-learnings.md`; `docs/_decisions/DECISIONS-loop-termination.md`
   DEC-TERM-01). Cross-repo, `longhorizon-product-scaffold` carried an **identical**
   own-document hash across DECISIONS v2–v7 and PLAN v2–v7 (six rounds each) inside a
   112-cross-review-file feature — every one of those rounds was a full re-review
   dispatch proving only that upstream pins had moved, not that the document itself
   needed a fresh look (`_evidence/regime-ledger-signals.md`;
   `docs/_decisions/DECISIONS-erratum-routing.md` DEC-ERRROUTE-04). `macro-nightly-job`
   shows the same shape from round 3 onward, closing at `{high: 0, medium: 1-2}` each
   time — cascade-confirmation, not substantive review.
3. **Process-artifact bloat.** `pdlc-engineering-loop`'s process artifacts (cross-reviews,
   POSTMORTEMs) totalled 3.45 MB against 617 KB of specification content — a **5.6x**
   artifact-to-spec ratio (`_evidence/report-A-learnings.md`).

`docs/_decisions/DECISIONS-loop-termination.md` DEC-TERM-02 already names the fix
shape for (1) and part of (2): a staleness-only round is not a review round, and a
staleness finding must deduplicate against an existing open item rather than being
re-filed. `pdlc/OPERATIONS.md`'s review-loop-mechanics section documents the
`deriveRoundWindow`, `MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS`, and
`APPROVAL-HASH`/`REVIEWED-COMMIT`/`UPSTREAM-STATE` anchor mechanics this feature edits
the surrounding behavior of, without changing those load-bearing contracts themselves.

## 2. Goals

- **G-1 (M1 — anchor staleness mechanics, always-on).** Eliminate the transcription
  step that causes stale-hash re-filing: anchor values are written by the engine
  itself from on-disk document bytes (or, for `REVIEWED-COMMIT`, from git HEAD) at
  the moment they become current, and any dispatch that quotes an anchor as "current"
  quotes that same on-disk-derived value, never a committed-HEAD snapshot carried
  forward and never hand-copied by an agent; a staleness-only finding against an
  already-open item does not mint a second finding. Ships always-on (defect-fix
  tier), no config gate, no behavior opt-out.
- **G-2 (M2 — pin-cascade confirmation round, config-gated, default off).** Give the
  loop a cheap path for confirming that a document whose own bytes are unchanged, and
  whose only drift is an upstream pin, still holds — without dispatching a full
  re-review for it.
- **G-3 (M3 — derivative-stop convergence signal, config-gated, default off).** Give
  the loop a convergence signal keyed on "no new ≥Medium finding for N consecutive
  rounds," distinct from and never overriding an ordinary approval or an open High
  finding, so a document that has stopped producing new substance is not forced to run
  to `MAX_LIFETIME_ROUNDS` to prove it.

## 3. Non-Goals (Scope)

- **NG-1** Moves M4–M6 of the wider pipeline-optimization proposal
  (`docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0/§3) are out of
  scope for this REQ.
- **NG-2** No SKILL.md file edits. No `orchestrate-dev.js` prompt builder instructs
  an agent to append/transcribe an approval anchor today (REQ-LOOPECON-01a pins
  that absence, it does not remove anything); three SKILL.md files still carry a
  vestigial, currently-unreachable conditional sentence for that path. Deleting
  those sentences is a permitted follow-up outside this feature, not this REQ's
  scope (SKILL.md edits trip the digest manifest and are deliberately avoided
  here).
- **NG-3** No changes under `pdlc/engine/`; that channel vendors `pdlc/workflows/*.js`
  and picks up this feature's changes automatically at the next pack/publish.
- **NG-4** Not a change to the numeric values of `MAX_REVIEW_ROUNDS`,
  `MAX_LIFETIME_ROUNDS`, or `MAX_ERRATUM_FOLLOWUP_ROUNDS`.
- **NG-5** Not a change to POSTMORTEM lifecycle semantics, the erratum-round
  `FINDING:` grammar, what a High-severity finding means, or the High-only approval
  bar already in force for round-2+ delta-scoped reviews.

## 4. Constraints

- **C-1** Config additions follow the per-key independent-fallback precedent already
  shipped for `learningsInjection`/advisory tier: one malformed key never retunes
  the rest of that block.
- **C-2** Both new config surfaces default off. Disabled behavior must be
  byte-identical, verified the way `learningsBaselineGuard.test.js` verifies its
  baseline: against a committed fixture set, not a same-branch run.
- **C-3** Config keys are spelled exactly `cascade.pinCheck.enabled`,
  `review.derivativeStop.enabled`, and `review.derivativeStop.rounds` — no other
  spelling or nesting satisfies this REQ's acceptance criteria.
- **C-4** M3's derivative-stop signal never fires while a document carries an open
  High finding, and never disturbs `MAX_LIFETIME_ROUNDS` accounting: rounds still
  count toward the lifetime cap whether or not derivative-stop is enabled.
- **C-5** M1's anchor-computation change must not change the byte shape any existing
  parser (staleness walk, harvest) reads — the grammar is unchanged; only who writes
  it changes.

### Threshold declarations

| Threshold | Default | Owner |
|---|---|---|
| `cascade.pinCheck.enabled` | `false` | `.claude/pdlc.config.json` → `cascade.pinCheck` |
| `review.derivativeStop.enabled` | `false` | `.claude/pdlc.config.json` → `review.derivativeStop` |
| `review.derivativeStop.rounds` | `2` | `.claude/pdlc.config.json` → `review.derivativeStop` |

## 5. Acceptance Criteria

### REQ-LOOPECON-01 — Anchors are harness-written and harness-quoted, never agent-transcribed (P0, M1)

**Source:** US-01.

- **REQ-LOOPECON-01a (write side — existing behavior, pinned not built).**
  - **Who:** the engine, at the moment a document reaches terminal approval.
  - **Given:** a review round for a document resolves to approval.
  - **When:** the engine writes that document's anchor block (`APPROVAL-HASH`,
    `REVIEWED-COMMIT`, any `UPSTREAM-STATE {DOCTYPE}` lines) through its injected
    IO seams.
  - **Then (absence guard):** no dispatch prompt the engine constructs contains an
    instruction to append, transcribe, or restate an approval-anchor value; this
    absence is pinned by a test over the engine's prompt builders, so a future
    change cannot silently reintroduce one. `APPROVAL-HASH`/`UPSTREAM-STATE
    {DOCTYPE}` remain hashes of on-disk bytes at write time; `REVIEWED-COMMIT`
    remains git HEAD at write time. This write path already exists; this REQ's
    obligation is regression-guarding it, not building it.
- **REQ-LOOPECON-01b (dispatch-quote side).**
  - **Who:** the engine, constructing a dispatch that renders an upstream hash as
    "current" (an erratum or cascade-confirmation dispatch, for example).
  - **Given:** a dispatch renders an `APPROVAL-HASH`, `REVIEWED-COMMIT`, or
    `UPSTREAM-STATE {DOCTYPE}` value into agent-visible prompt text as the current
    value.
  - **When:** the dispatch prompt is constructed.
  - **Then:** that value is recomputed from bytes on disk (or, for
    `REVIEWED-COMMIT`, from git HEAD) at dispatch-construction time — never a
    mint-time snapshot rendered as current. A mint-time snapshot taken earlier in
    an erratum batch stays legitimate for, and only for, detecting whether
    upstream moved since mint; it is never the value quoted as "current."

### REQ-LOOPECON-02 — Staleness-only findings deduplicate, they do not re-file (P0, M1)

**Source:** US-01.

- **Who:** the review-loop driver.
- **Given:** a round's only delta against the round it is confirming is anchor/pin
  bookkeeping — no substantive edit is owed to the document under review — and an
  open item already records that same staleness fact from an earlier round.
- **When:** the round's findings are accounted.
- **Then:** the round does not mint a second, duplicate finding for the same
  staleness fact; the existing open item is the one and only record of it.

### REQ-LOOPECON-03 — Finding identity is stable round over round (P0, M1)

**Source:** US-01.

- **Who:** the review-loop driver, computing round-over-round finding accounting.
- **Given:** a finding recorded in round N and a finding recorded in round N+1 against
  the same document.
- **When:** the two are compared for identity.
- **Then:** if they resolve to an equivalent identity (matching severity, matching
  section anchor, matching normalized finding text), the round N+1 occurrence is
  classified as **carried**, never as **new**; a finding whose identity does not match
  any prior-round finding is classified as **new**. This carried/new split is the
  input M3's derivative-stop predicate (REQ-LOOPECON-06) consumes.

### REQ-LOOPECON-04 — Disabled pin-check is byte-identical to today (P0, M2)

**Source:** US-02.

- **Who:** the review-loop driver, in the post-erratum downstream staleness walk.
- **Given:** `cascade.pinCheck.enabled` is `false` (its default) or the key is absent
  or malformed.
- **When:** the staleness walk runs.
- **Then:** the dispatch stream it produces is byte-identical to the pre-M2 baseline;
  no pin-check dispatch is ever constructed.

### REQ-LOOPECON-05 — Own-bytes-unchanged documents batch into one pin-check dispatch (P1, M2)

**Source:** US-02.

- **Who:** the review-loop driver, in the post-erratum downstream staleness walk.
- **Given:** `cascade.pinCheck.enabled` is `true`, and one or more downstream
  documents each have an unchanged own-content hash since their last approval, with
  only their `UPSTREAM-STATE` reference having moved.
- **When:** the staleness walk classifies those documents.
- **Then:** all such documents are grouped into **one** pin-check dispatch (not one
  dispatch per document), carrying a `PIN-CHECK: PASS | FAIL` verdict per document. A
  `PASS` verdict re-appends or updates that document's approval anchor without opening
  a new full review round for it. A `FAIL` verdict routes that document into an
  ordinary re-confirmation round instead of accepting it. A document whose own bytes
  changed is never eligible for pin-check batching; it always gets a full review.

### REQ-LOOPECON-06 — Derivative-stop converges on N flat rounds, never on an open High (P1, M3)

**Source:** US-03.

- **Who:** the review-loop driver, evaluating whether a document has converged.
- **Given:** the document has just completed `review.derivativeStop.rounds`
  (default 2) consecutive rounds in which no finding was classified **new**
  (REQ-LOOPECON-03) at severity ≥ Medium, and no round in that window carried an
  open High finding.
- **When:** the loop evaluates whether to continue dispatching rounds for that
  document.
- **Then:** the loop records the document's outcome as
  `converged-by-derivative-stop`, distinct in the report from an ordinary approval
  verdict, and stops dispatching further rounds for it. If any of those rounds instead
  carried an open High finding (new or carried), derivative-stop never fires for that
  document regardless of how many consecutive flat rounds preceded it. Rounds consumed
  under derivative-stop still count toward `MAX_LIFETIME_ROUNDS` (C-4); no POSTMORTEM
  is written for a `converged-by-derivative-stop` outcome.

### REQ-LOOPECON-07 — Disabled derivative-stop is byte-identical to today (P0, M3)

**Source:** US-03.

- **Who:** the review-loop driver.
- **Given:** `review.derivativeStop.enabled` is `false` (its default) or the key is
  absent or malformed.
- **When:** the loop evaluates whether to continue dispatching rounds for a document.
- **Then:** the convergence decision is identical to the pre-M3 baseline; no
  `converged-by-derivative-stop` outcome is ever recorded.

### REQ-LOOPECON-08 — Malformed config keys fail open, per key (P1, M2/M3)

**Source:** US-02, US-03.

- **Who:** the config parser reading `.claude/pdlc.config.json`.
- **Given:** one key under `cascade.pinCheck` or `review.derivativeStop` is absent,
  wrong-typed, or the config file itself is unreadable or unparseable.
- **When:** that block is parsed.
- **Then:** the affected key falls back to its stated default (§4 Threshold
  declarations); no other key in the same block, and no other config block, is
  affected by that one key's failure.

### REQ-LOOPECON-09 — DoD round index is derived from disk, never prompt-carried (P0, M1c)

**Source:** US-04.

- **Who:** the Phase DOD dispatcher.
- **Given:** zero `CODE_REVIEW-{feature}-v*.md` files exist on disk for the feature,
  or one or more already exist at various version numbers (including a resumed or
  re-run invocation where the dispatcher's own in-memory state does not necessarily
  reflect what is on disk).
- **When:** the next DoD verify round is dispatched.
- **Then:** the round's target version `v` is derived as `max(existing N among
  CODE_REVIEW-{feature}-v*.md on disk) + 1`, or `v = 1` when none exist; `v` is never
  carried forward in a dispatch prompt or an in-memory counter that could desync from
  disk. A resumed or re-run invocation of Phase DOD can never target a version that
  skips a gap or collides with a file already on disk.

## 6. Risks

- **R-1** A pin-check dispatch that only checks own-bytes hash and `UPSTREAM-STATE`
  could under-trigger on a false-negative hash match. Mitigated by REQ-LOOPECON-05
  requiring both signals (own-bytes unchanged **and** only the upstream pin moved).
- **R-2** A `review.derivativeStop.rounds` value set too low could suppress a still-
  open concern. Mitigated by REQ-LOOPECON-06's open-High override and off-by-default.
- **R-3** M1's dedup step (REQ-LOOPECON-02/03) could over-suppress if finding-identity
  normalization is too coarse, swallowing a new finding sharing a section anchor with
  an old one. Normalization itself is FSPEC/TSPEC material (O-1); this REQ only fixes
  the observable carried/new contract.

## 7. Obligations / Open Questions

- **O-1** The exact finding-identity normalization algorithm is FSPEC/TSPEC material,
  not specified here past the REQ-LOOPECON-03 triple (severity, anchor, text).
- **O-2** DECISIONS records the M1-ungated/M2-M3-gated-off rationale, pin-check
  fallback-on-FAIL, derivative-stop-never-overrides-High, and normalization choice.
- **O-3** This REQ does not change `pdlc/OPERATIONS.md`; FSPEC/downstream artifacts
  carry the obligation to keep its anchor/`UPSTREAM-STATE` description consistent.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 — as a reviewer/author, I don't want to see the same stale-anchor finding re-filed round after round with no edit owed | REQ-LOOPECON-01 (01a, 01b), REQ-LOOPECON-02, REQ-LOOPECON-03 |
| US-02 — as an operator, I want a cheap confirmation path for a document whose own content hasn't changed | REQ-LOOPECON-04, REQ-LOOPECON-05, REQ-LOOPECON-08 |
| US-03 — as an operator, I want the loop to recognize when a document has stopped producing new substance instead of running to the lifetime cap | REQ-LOOPECON-06, REQ-LOOPECON-07, REQ-LOOPECON-08 |
| US-04 — as an operator resuming or re-running Phase DOD, I want the next CODE_REVIEW round's version number derived from what's on disk, not from a counter that can desync across a resume | REQ-LOOPECON-09 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.
