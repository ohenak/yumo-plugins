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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3,4,5,6}.md` |
| Post-Mortem | `POSTMORTEM-R-pdlc-decision-ledger.md` (Phase R round budget exhausted; this version applies its Recommendation) |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1** — the measured extent of the closed-decision corpus, cited by `M-*` id |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.7 | 2026-08-28 |

**v1.7 disposition — the Baseline gained the enumeration §5 needed.** Round 6's one High is fixed in
the substrate this REQ owns, not by another clause: Baseline v1.1 adds `M-1d` and `M-2e`,
the ids it previously only counted; AC-01 transcribes them. SE F-02 widens equality to the
rendered line; SE F-03 is decided — a frozen fixture copy, not the live repository; TE F-27
lands in O-1, TE F-28 as O-6; F-04 and F-29 were Baseline-side. No recognition rule returns
to §2; findings are not restated here, see the cross-review files.

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
and the record's heading. No other field is required; where a record carries an origin
or evidence datum it may follow, and where it does not the line renders without it — not a
defect. **In scope** is a derivable set, not a per-document relevance judgement, and **its unit is the
individual decision, not the file**: the project's closed decisions, plus those of the feature
whose document is under review.

**This REQ states the outcome of that set, not the predicate that recognises it.** The outcome is
that every closed decision in scope renders exactly once, and that no rendered line is
unrenderable at its own source — the citation names a real record, and the statement field says
what was decided rather than what was asked. The **measured extent** of the set — which files
contribute records and how many, which contribute none and why, the one id block opened twice and
which of its two openings decides, and the fact that no id is recorded in two files — is taken
once against a named commit and recorded as `M-1`…`M-6` in the Baseline
(`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.1), cited here by id and not restated.
The **recognition rule** that produces that set on any other corpus — carrier markup, id grammar,
the dedupe key, cross-file precedence — is TSPEC's (O-1). This division is deliberate: a
recognition rule over a live, growing corpus is not requirements material (pm-author altitude
rule 5f), and pinning it here is what the Phase R post-mortem identifies as the loop that
exhausted the round budget.

All sources exist today — this REQ mints no new record file type, adds no field to any existing
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
| `decisionLedger.maxEntries` | `70` | non-negative integer | operator, same block | Floor taken once against the Baseline's named commit and cited, not re-derived here: `M-6b` (63), with `M-6c` recording that 70 clears it by 7. A default below `M-6b` drops a line against the standing corpus on day one. **Non-negative**, not positive: `0` is a valid admits-nothing value, not a malformed one, so it does not fall back to `70` |
| `decisionLedger.maxBytes` | `12500` | non-negative integer | operator, same block | Measured, not analogised: the Baseline's `M-7c` records that 12,500 clears the `M-7b` worst standing case (9,296 substance bytes over 63 records) by 3,204 — 50 bytes per record of framing allowance — while 8,000 sits *below* `M-7b` and drops lines on day one. Non-negative for the same reason as the row above |

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
and no other required field. The check is **equality of the rendered line
set — not containment, and not equality over ids alone**: the runs agree only where each line's
id, statement and citation all agree. Ids alone are blind to `M-3c`'s twice-opened
block, where both openings carry one id and only the second states what was decided. The expected value is the Baseline's
**enumeration**, cited by id — `M-1d` project-level, `M-2e` per feature directory, at v1.1's
`Verified at` commit — transcribed, not re-derived from a predicate here. It is asserted against
a **frozen fixture copy** of that corpus, never the live repository, which grows — on this
branch included — and would otherwise drift the test on unrelated decisions (O-6). Membership on any other corpus follows
from the recognition rule TSPEC owns (O-1) and is not asserted here, so nothing in this criterion
obliges the REQ to state that rule. Over-budget omission is REQ-DECLEDGER-07's alone. In
production the index reflects records as they exist at dispatch-construction time, never a
snapshot carried forward within the round window (mirrors the shipped `REQ-LOOPECON-01b`
recompute-at-dispatch contract); the frozen copy above is the test's corpus, not the driver's.

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
that line is omitted and the rest render (a file holding no decision record is an ordinary empty
result, not this path — Baseline `M-4e`): a decision
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
(REQ-DECLEDGER-07) is TSPEC material. So, in full, is the **recognition rule** for a decision
record: carrier markup, id grammar, the key that resolves an id recorded more than once in a
file, and precedence across files. G-1 routes membership deliberately and states only the
outcome; the Baseline supplies the measured extent to build against, including the three cases a
rule has to survive — the twice-opened block whose second opening is the deciding one (`M-3c`),
the file mixing records with question headings and back-references (`M-4d`), and the absence of
any cross-file duplicate to calibrate precedence on (`M-5a`, `M-5c`). **Membership reads the directory
glob.** Where `M-2c`'s two feature file-scope readings differ (14 ids against 22), the directory
reading governs, matching the floor C-5 already took from `M-6b`; this selects between two measured
numbers, minting no rule. A TSPEC choice that renders a set differing from `M-1d` /
`M-2e` under that reading, at the Baseline's commit, fails REQ-DECLEDGER-01; within that
constraint the rule is TSPEC's to design.

**O-2** Whether the wiring needs a `SKILL.md` edit or can go through dispatch construction is a
TSPEC choice (NG-7). Either path stays config-gated (C-1/C-2).

**O-3** How a decision id is minted and kept unique across `docs/_decisions/*` and per-feature
records (independent namespaces today, e.g. `DEC-TERM-01` vs `DEC-LOOPECON-01`) is TSPEC
material.

**O-4** The identity of C-2's committed baseline, and the pinning that stops a re-capture
silently satisfying REQ-DECLEDGER-02, is TSPEC material.

**O-5** *(carried forward from cross-review, owner te-author.)* Cross-file precedence has **no
instance in the corpus** — `M-5a` records zero ids held as records in two files — so it cannot be
covered by transcribing anything that exists. PROPERTIES owes it a **synthetic fixture**: a
constructed two-file corpus recording one id in both a project-level and a feature-level file,
exercising the precedence leg that `M-5c` names the intent of. This is a coverage obligation, not
a REQ defect, and it is recorded here rather than answered by adding a rule to G-1.

**O-6** *(owner te-author.)* REQ-DECLEDGER-04's legs are in O-5's position: none has a HEAD
instance, and Baseline `M-4e` records that an empty file and a failure to read are separable only
by construction. PROPERTIES owes a constructed fixture to each — every source unavailable, one
decision of several failing while the rest render, and a file holding no record taking the
ordinary-empty path rather than the partial one — and likewise to the frozen corpus copy
REQ-DECLEDGER-01 asserts against. Coverage obligations, not REQ defects.

**Assumptions.** Authored in an orchestrated dispatch; these are explicit, operator-vetoable
assumptions rather than blocking open questions:
- **A-1** `maxEntries` (70) derives from a measurement taken once against the Baseline's named
  commit and cited by id (C-5, `M-6b`/`M-6c`), not re-derived per revision; `maxBytes` (8000)
  remains a `learningsInjection` analogy, not measured. An operator may revise
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
