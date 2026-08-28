---
feature: pdlc-decision-ledger
ready:
depends-on:
---

# REQ pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move M4, §3 R3-2 |
| Downstream | FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.3 | 2026-08-28 |

## 1. Problem / Context

Reviewers re-open decisions that are already closed, and pay for it every round. Project-level
decision files already name the pattern, with no gate behind it:
`docs/_decisions/DECISIONS-review-severity-bars.md` (`DEC-ERR-01`, "A collision whose upstream
has already decided is absorbed, not routed", summarised in `pdlc/OPERATIONS.md`'s
erratum-channel section) states that routing a question the upstream has already decided is a
false statement in a hand-off section, not a demoted finding, and
`docs/_decisions/DECISIONS-loop-termination.md` (`DEC-TERM-02`) establishes that a
staleness-only round is not a review round.

Both are enforced only as prompt instructions — `pdlc/OPERATIONS.md`'s review-loop mechanics
section records that round-2+ delta-scoped dispatches already tell the optimizer "settled
decisions are not re-litigated" — and the corpus shows the instruction does not hold:
`DEC-TERM-01` records 114 approving verdicts on documents that still ran to the 15-round cap on
`pdlc-engineering-loop`. The adjacent D4 class (staleness re-filed as findings) recurs there
(one hash re-filed as a Low across 54 cross-reviews), on `pdlc-wave-resume` (eight hand-copied
version pins), and — from the separate `regime-ledger` corpus the proposal's §2 cites, not this
repository — on `structure-directional-options-scoring`. Re-litigation is the same waste one
layer up: not a stale citation, but a settled question asked again.

The proposal's Move M4 (§0, Tier 3, risk Medium) and its R3-2 mechanism (§3/§4(c)) name the fix:
a one-line-per-closed-decision index injected into every review dispatch, plus a rule that a
reviewer re-opens a closed decision only with a High finding citing new evidence and naming the
id. It reuses the shipped learnings-injection budget machinery as precedent
(`pdlc/OPERATIONS.md`, `learningsInjection`, per-key independent fallback). It is the
counterpart to shipped `docs/completed/pdlc-loop-economics/`, which fixed round-level staleness
re-filing; this one addresses decision-level re-litigation.

## 2. Goals

**G-1 (decision index in review dispatches, config-gated, default off).** When enabled, every
review dispatch includes a rendered index of the closed decisions in scope for the document
under review: one line per decision carrying **exactly two required fields** — the decision id
and a one-line statement of what it decided — plus a **source citation** naming the record file
and, where the record places the decision under a heading, that heading. No other field is
required; where a record carries an origin
or evidence datum it may follow, and where it does not the line renders without it — not a
defect. **In scope** is a derivable set, not a per-document relevance judgement, and **its unit
is the individual decision, not the file**: a decision is in scope when it carries a decision id
in the project's `DEC-{NAMESPACE}-{NUMBER}` convention (O-3) and lives under `docs/_decisions/`
or the feature's own `DECISIONS-{feature}.md`, **on the line that is the decision's own record,
not a line citing it**: the id opens the line as its subject (a heading or a line-leading list
item), and `NUMBER` is numeric. So at HEAD `DEC-AWG-Q1` — the sole non-numeric token, occurring
once in prose as a range shorthand in `DECISIONS-advisory-wave-gate-questions.md` — is a
citation, and that file contributes zero lines; and a record may open a numbered heading and be
cited again later in its own file without contributing a second line (`DEC-CONS-01`,
`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`). A file with no
decision record contributes zero lines: an ordinary empty result, not a failure — the three
`CONSOLIDATION-PROPOSAL-*.md` files and `.consolidation-log.md` under `docs/_decisions/` cite
ids but record none, and are on this path. C-5's 41 is this count. Which markup forms the
renderer recognises as record carriers is TSPEC material (O-1). All sources exist today — this REQ mints no new record file type, adds no field to any existing
record shape, and does not require every feature to author one.

**G-2 (never-re-litigate rule is reviewer-side, config-gated, default off, one key with G-1 —
C-3).** The rule reaches the reviewer as prompt text accompanying the index, the way prior-feature learnings
do; **it changes no driver-side accounting whatsoever.** The observable is the reviewer's own
output — the cross-review artifact and its counts. Stated once as a criterion in
REQ-DECLEDGER-03, its no-change guarantee in REQ-DECLEDGER-08.

**G-3 (currency and fail-open safety).** A stale or wrong index is worse than none (proposal §6
Gating), so it is derived fresh at dispatch-construction time from whatever records exist then;
where sources are missing, unreadable or unparseable it degrades per REQ-DECLEDGER-04, never as
a new halt or operator-facing failure class.

**G-4 (measurable outcome — non-binding rationale, no acceptance criterion).** The intended
effect is that findings restating an indexed decision id without new evidence trend to zero
across a feature's review rounds, measured retrospectively from the **committed `CROSS-REVIEW-*`
artifacts on the branch** (present every round regardless of any flag) read against G-1's
in-scope decision ids. It carries no acceptance criterion by design: no gate, test or phase
outcome depends on it.

## 3. Non-Goals

**NG-1** Front-loaded grilling (Phase G, proposal M5 / R3-1) is out of scope: its output, a
per-feature ledger produced by interrogating an approved REQ, is a different mechanism from this
index, which only renders decisions that already exist. A future Phase G may become an extra
*source*; it is not a prerequisite here.

**NG-2** The `CONTEXT.md` domain glossary (proposal R3-5) is out of scope; the proposal calls a
glossary entry "a decision like any other," but that mechanism is a separate feature.

**NG-3** Size-tiered pipelines (R3-3) and the CR/DoD two-axis collapse (R3-4) are out of scope;
neither is a prerequisite.

**NG-4** No change to any driver-side scoring or gate. Because G-2 is reviewer-side, every
finding reaching the driver is scored exactly as today, and a finding the reviewer declines to
file is absent rather than suppressed — no driver-side "discounted finding" state exists for a
gate to disagree about. The affected mechanisms are enumerated once, and pinned as falsifiable,
in REQ-DECLEDGER-08.

**NG-5** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, or
`MAX_ERRATUM_FOLLOWUP_ROUNDS`.

**NG-6** No engine **runtime** changes under `pdlc/engine/`; the engine vendors
`pdlc/workflows/*.js` and picks up changes at the next pack/publish, per repo convention. This
does **not** forbid the shipped per-block config-disclosure test precedent
(`pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js`): if
this feature discloses its block in `.claude/pdlc.config.example.json`, the matching
engine-side disclosure test is in scope.

**NG-7** Whether wiring the index and rule text into reviewer-facing prompt text requires a
`SKILL.md` edit (routing through the consolidation contract's `CONSOLIDATION-PROPOSAL` review,
per `pdlc/OPERATIONS.md`) or can be delivered through dispatch construction as learnings
injection is today, is not decided here; it is TSPEC material (O-2).

## 4. Constraints

**C-1** Config keys follow the shipped per-key independent-fallback precedent
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`): one malformed key inside
`decisionLedger` never retunes the rest of the block or any other block.

**C-2** The disabled path is byte-identical to the pre-feature baseline, verified against a
committed fixture baseline (not a same-branch before/after assertion) — mirrors the shipped
`learningsBaselineGuard.test.js` precedent named in `pdlc/OPERATIONS.md`. Which commit, and how
that pointer is pinned so a re-capture cannot silently satisfy the check, is TSPEC material
(O-4).

**C-3** The block holds **exactly three keys**, spelled `decisionLedger.enabled`,
`decisionLedger.maxEntries`, `decisionLedger.maxBytes`. The enumeration is exhaustive: a fourth
key does not satisfy this REQ, and no other spelling or nesting does.

**C-4** This REQ does not touch `MAX_REVIEW_ROUNDS` or `MAX_LIFETIME_ROUNDS` math (NG-5). Since
G-2 is reviewer-side, round budgeting is untouched by construction: a round where a reviewer
declined to re-open a decision consumes budget as any other.

**C-5** Per the threshold-declaration obligation, the following thresholds are declared here,
not left to TSPEC to invent:

| Key | Default | Type | Config owner | Rationale |
|---|---|---|---|---|
| `decisionLedger.enabled` | `false` | boolean | operator, `.claude/pdlc.config.json` → `decisionLedger` | Tier 3: off by default per proposal §6 |
| `decisionLedger.maxEntries` | `60` | positive integer | operator, same block | Measured floor at HEAD: 41 ids under `docs/_decisions/` + largest feature record (14) = 55, plus headroom; a default under the standing corpus drops a line on day one |
| `decisionLedger.maxBytes` | `8000` | positive integer | operator, same block | Author default by analogy to `learningsInjection.maxBytesPerDocument` (6000) / `maxTotalBytes` (20000); vetoable per A-1 |

`maxBytes` bounds **the rendered index text alone** — the index block as it appears in the
prompt, not its contribution to total dispatch size, nor the underlying records. When the
in-scope set exceeds either bound, whole lines are omitted rather than the dispatch being
oversized or aborted, and no line is truncated mid-line; which lines are omitted is TSPEC
material (O-1).

## 5. Acceptance Criteria

### REQ-DECLEDGER-01 Decision index rendered when enabled, sourced fresh at dispatch time (P0)

**Source:** US-01.

**Who:** review-loop driver, constructing a review dispatch.
**Given:** `decisionLedger.enabled` is `true`, and the in-scope set is within C-5's bounds.
**When:** a dispatch prompt for a document under review is constructed.
**Then:** the prompt includes a rendered index with one line per decision in G-1's in-scope set,
each line carrying the decision id, a one-line statement and a source citation as G-1 defines it,
and no other required field. Derivable, so the
expected index is checkable as **set equality, not containment**, over G-1's in-scope set;
over-budget omission is REQ-DECLEDGER-07's alone. The index reflects records as they exist at
dispatch-construction time, never a snapshot carried forward within the round window (mirrors
the shipped `REQ-LOOPECON-01b` recompute-at-dispatch contract).

### REQ-DECLEDGER-02 Disabled path is byte-identical to today (P0)

**Source:** US-03.

**Who:** review-loop driver.
**Given:** `decisionLedger.enabled` is `false` (the default), absent, or malformed.
**When:** any dispatch prompt is constructed.
**Then:** the dispatch stream is byte-identical to the pre-feature baseline; no index text or
rule text is ever rendered.

### REQ-DECLEDGER-03 Never-re-litigate gating requires citation and new evidence (P0)

**Source:** US-01.

**Who:** the reviewer authoring a cross-review (reviewer-side; the driver never reads a
decision id — NG-4, REQ-DECLEDGER-08).
**Given:** `decisionLedger.enabled` is `true`.
**When:** a review dispatch prompt is constructed.
**Then:** the prompt carries, adjacent to the index, rule text instructing the reviewer not to
file a finding re-opening an indexed decision unless **both** hold: it is High severity, and it
cites evidence not part of that decision's own record. Evidence novelty is a reviewer judgement,
deliberately not a machine predicate — no parser compares citations. The test reads the **cited
record**, not the line alone: the line need not carry the decision's own citations. The rule
text must make the boundary decidable via these exemplars: *in* — a shipped behaviour that changed after the
decision was recorded, cited at the changed source; *out* — a source the decision already cites,
re-cited at a different line or later commit with no behavioural change.

### REQ-DECLEDGER-04 Index construction fails open, never silently stale (P0)

**Source:** US-02.

**Who:** review-loop driver.
**Given:** `decisionLedger.enabled` is `true`; a decision-record source (`docs/_decisions/*`
and/or the feature's own records) is missing, unreadable, or fails to parse at
dispatch-construction time.
**When:** the dispatch prompt is constructed.
**Then:** where **every** source is unavailable, the dispatch falls back to REQ-DECLEDGER-02's
disabled behavior — no index, no rule text. Where **one decision of several** fails to render,
that line is omitted and the rest render (files with no decision record are not this path — G-1): a decision
absent from the index is one a reviewer may freely challenge, the safe direction. Neither path is a halt or a new operator-facing failure class;
it degrades as `learningsInjection`'s fail-open path does.

### REQ-DECLEDGER-05 Config keys fail open independently (P0)

**Source:** US-03.

**Who:** config loader.
**Given:** the `decisionLedger` block in `.claude/pdlc.config.json` has one wrong-typed or
malformed key among `enabled`, `maxEntries`, `maxBytes`.
**When:** config is parsed for a dispatch.
**Then:** only that key falls back to its declared default (C-5); the block's other keys, and
every other config block, are unaffected. The key set is exactly C-3's three, so this is
verifiable as set equality over that enumeration crossed with {wrong type, malformed, absent},
not containment — mirrors shipped `REQ-LOOPECON-08`.

### REQ-DECLEDGER-06 Decision id is the reopening dedupe key across rounds (P1)

**Source:** US-01.

**Who:** the reviewer authoring a cross-review.
**Given:** `decisionLedger.enabled` is `true`; a prior round of this document recorded a
reopening attempt against an indexed decision id that did not clear REQ-DECLEDGER-03's bar.
**When:** the reviewer would raise that reopening again.
**Then:** the rule text directs the reviewer to treat the decision id as the reopening key and
record the repeat as a repeat naming that id, not a fresh finding. **The observable is the
prompt text**, as in REQ-DECLEDGER-03; the reviewer's prose is the intended effect, not an
asserted outcome. **Driver-side finding identity is unchanged:**
`DEC-LOOPECON-06`'s exact-match triple (severity, section anchor, normalised text) stays the sole
key the driver dedupes on; this REQ does not re-key it. The keys govern different consumers and
never compete — the id guides reviewer prose, the triple is the driver's ledger.

### REQ-DECLEDGER-07 Index size stays within declared bounds (P1)

**Source:** US-02.

**Who:** review-loop driver, constructing a review dispatch.
**Given:** `decisionLedger.enabled` is `true`; the in-scope set for a dispatch exceeds
`decisionLedger.maxEntries` rows or `decisionLedger.maxBytes` bytes.
**When:** the index for that dispatch is rendered.
**Then:** the rendered index text never exceeds either bound (`maxBytes` per C-5, over the index
block alone), and the dispatch is neither oversized nor aborted over index size.
Rendering is total, one stated outcome per boundary case: zero in-scope decisions, no index block
at all; `maxEntries` of `0`, as zero in-scope decisions, not an error; a single line alone
exceeding `maxBytes`, omitted whole, never truncated mid-line, without aborting the rest.

### REQ-DECLEDGER-08 Driver-side scoring is identical whether the flag is on or off (P0)

**Source:** US-03.

**Who:** review-loop driver.
**Given:** one fixed set of reviewer outputs (verdict lines, counts, any `FINDING:` lines) for a
round, replayed twice — once with `decisionLedger.enabled` `true`, once `false`. Reviewer
output is a recorded fixture, and the replay compares the **accounting** leg; the
dispatch-construction leg differs in exactly one way, asserted not merely allowed: the `false`
run's dispatch is byte-identical to C-2's baseline (REQ-DECLEDGER-02) and the `true` run's
carries the rendered index (REQ-DECLEDGER-01).
**When:** the driver accounts for that round.
**Then:** every driver-side outcome is identical across the two runs: the convergence decision,
`DEC-LOOPECON-06`'s identity-triple dedupe and the resulting open-finding ledger, the
`review.derivativeStop` flat/non-flat classification, the erratum items minted under
`DEC-ERRROUTE-01` (`docs/_decisions/DECISIONS-erratum-routing.md`), and the fail-closed read of
a non-approving confirmation carrying no parseable `FINDING:` line. In particular, a High
finding re-opening an indexed decision that a reviewer files anyway is scored and routed as any
other High finding — it still mints its erratum item and satisfies the confirmation-presence
check. This makes NG-4 falsifiable.

## 6. Risks

**R-1** A stale or wrong index is worse than none (proposal §6). Mitigated by G-3 /
REQ-DECLEDGER-04: fresh at dispatch time, failing open rather than stale.

**R-2** The rule could discourage a legitimately new concern that reuses a decision id in
passing. Mitigated by its reviewer-side form: nothing is mechanically suppressed, the High +
new-evidence path stays open, and a reviewer who files anyway is scored as today (REQ-DECLEDGER-08).

**R-3** Reviewer-side enforcement means compliance is not guaranteed and no gate catches a
lapse. Accepted deliberately: driver-side scoring was rejected because the driver holds neither
the decision id nor any decidable evidence-novelty predicate, so it could only be faked.
Measured retrospectively per G-4, not enforced.

**R-4** Default-off means zero effect until an operator opts in — by design (proposal §6),
mirroring the `cascade.pinCheck` / `review.derivativeStop` rollout.

**R-5** `maxBytes` is an author analogy, not measured (`maxEntries` is measured, C-5).
Mitigated by A-1's vetoable label
and REQ-DECLEDGER-07 pinning the bound whatever the values.

## 7. Obligations / Open

**O-1** Which lines are omitted when the set exceeds `maxEntries` / `maxBytes`
(REQ-DECLEDGER-07), and which markup forms count as record carriers, is TSPEC material. The in-scope set
itself is *not* routed — G-1 states it.

**O-2** Whether the wiring needs a `SKILL.md` edit or can go through dispatch construction is a
TSPEC choice (NG-7). Either path stays config-gated (C-1/C-2).

**O-3** How a decision id is minted and kept unique across `docs/_decisions/*` and per-feature
records (independent namespaces today, e.g. `DEC-TERM-01` vs `DEC-LOOPECON-01`) is TSPEC
material.

**O-4** The identity of C-2's committed baseline, and the pinning that stops a re-capture
silently satisfying REQ-DECLEDGER-02, is TSPEC material.

**Assumptions.** Authored in an orchestrated dispatch; these are explicit, operator-vetoable
assumptions rather than blocking open questions:
- **A-1** `maxEntries` (60) derives from a HEAD measurement (C-5); `maxBytes` (8000) remains a
  `learningsInjection` analogy, not measured. An operator may revise
  either before FSPEC authoring without a REQ revision.
- **A-2** Same rollout posture as `pdlc-loop-economics` (config-gated, default off); Tier 3 risk
  (Medium, proposal §0) is read as requiring it, not merely permitting it.
- **A-3** Reviewer-side enforcement (G-2) is the intended reading of proposal R3-2, which
  describes injected prompt text and a reviewer rule, not a driver-side score. An operator
  wanting a mechanical gate should veto this before FSPEC authoring; it changes the feature.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As a reviewer, I don't want to re-litigate an already-closed decision unless there's a High-severity reason with new evidence, because re-opening a settled question burns a round for no substantive change | REQ-DECLEDGER-01, REQ-DECLEDGER-03, REQ-DECLEDGER-06 |
| US-02 As an operator, I need the index never silently stale, and never letting a dispatch grow unbounded | REQ-DECLEDGER-04, REQ-DECLEDGER-07 |
| US-03 As an operator, I need this safe to enable per project: disabled path unchanged, config keys failing open independently, driver-side scoring identical either way | REQ-DECLEDGER-02, REQ-DECLEDGER-05, REQ-DECLEDGER-08 |

G-4 is a non-binding rationale note with no acceptance criterion, by design (§2). Roll-up
recorded in `docs/requirements/traceability-matrix.md`.
