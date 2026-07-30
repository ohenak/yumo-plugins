# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.0)
**Sources of truth:** `REQ-…` v1.5, `FSPEC-…` v1.5 (both converged and approved)
**Date:** 2026-07-30
**Iteration:** 1
**Scope:** Whole document (iteration 1 — no delta). Product lens only: fidelity to REQ acceptance
criteria and FSPEC obligations, scope discipline in both directions, observable operator behaviour,
and decisions taken at the wrong altitude. Technical design, test mechanics and code quality are out
of scope for this review.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §2.5's POSTMORTEM gate is placed **before** the approval skip and refuses the phase unconditionally, inverting the precedence AC-2.3b fixes and FSPEC §12.4 carries through. AC-2.3b: "AC-4.1's approved-phase skip is evaluated **first**. When a phase is skipped under AC-4, it does not run, so AC-2.3 has nothing to refuse and the run proceeds." FSPEC §12.4 makes this a two-step table — step 1 skip, step 2 `checkPostmortem`, "only reached when the phase **would otherwise run**". TSPEC §2.5 instead states: "A POSTMORTEM already on disk is consulted **before** step 1 by `checkPostmortem({ phase, feature })` (§5.8): an unresolved POSTMORTEM refuses the run for that phase". Steps 3–4 (approval search, staleness) sit *after* that gate, so the skip can never fire ahead of the refusal. FSPEC §12.4's **worked example A** — the pre-harvest case where Phase R is approved, an unresolved POSTMORTEM is present, the phase is skipped and the run continues to Phase F — becomes unreachable under this control flow; the run halts instead. §6.2 row 13 restates the same unconditional refusal. Operator impact is concrete and adverse: a feature that has already converged Phase R but still carries an open POSTMORTEM for it cannot proceed at all, and the only stated recovery is hand-editing `RESOLVED: yes` onto a POSTMORTEM for a phase that was never going to run. Root cause is visible in §9.1's own O-9 note — §11.5's narrow rule ("a force does not override a recorded failure", which applies to the *forced* path only) has been lifted to a global pre-step-1 gate on *every* path, where it collides with §12.4. | AC-2.3b, AC-4.6a, FSPEC §12.4, §11.5 |
| F-02 | High | Local | §5.6's terminal test is **mode-blind** and requires the `REVISION-COMPLETE:` trailer for every episode, dropping the greenfield/revision split AC-3.5b fixes and FSPEC §8.4 states in terms. §5.6's algorithm is `trailer ← parseRevisionComplete(response)` … `if trailer.complete && isComplete(...)` — a conjunction with no mode condition — and §4.3 / §6.2 row 9 make an absent trailer "non-terminal; continue". FSPEC §8.4 for greenfield says the criterion is structural completeness alone and "**No trailer is required or expected**"; AC-3.5 scope (d) rule 3 and FSPEC §15.2 rule 3 put every non-authoring wrapped dispatch (review, `dod-verify`, `harvest-learnings`) in greenfield by construction. §7.4 then amends **only** `se-author`, `pm-author` and `te-author` to emit the trailer — the reviewer, `dod-verify` and `harvest-learnings` SKILLs are not amended and will never emit it. The composed consequence is a guaranteed false halt across the numerically dominant episode population: every wrapped `pm-review` / `se-review` / `te-review` / `dod-verify` / `harvest-learnings` episode can never reach terminal, burns `MAX_AUTHORING_DISPATCHES` (6) dispatches, and halts the phase. That is H-3's own failure mode — a correct artifact scored not-done and the run killed — reconstructed by the mechanism built to remove it. | AC-3.5b, AC-3.5 scope (d) rule 3, FSPEC §8.4, §8.5, §15.2 |
| F-03 | Medium | Local | **Mode selection is absent from the TSPEC**, and the selection rule §5.6 *does* state is the one FSPEC §15.2 explicitly withdrew. `mode` appears only as an `EpisodeKey` field (§4.5), as a tuple coordinate (§5.6), as "the progress predicate is mode-independent" (§5.6), and as an AT reference (§8.3). AC-3.5 scope (d) and FSPEC §15.2 fix selection at episode entry from **what the phase is dispatching an author to do** — the revision test first, decided from the review artifacts on the branch, *regardless of the artifact's structural state*, failing toward revision. The only selection rule §5.6 supplies is the prompt-kind rule "**Fresh authoring** — `invocation === 1` and target absent or empty", i.e. derived from the artifact's structural state, which is precisely v1.3/v1.4's derivation that FSPEC §15.2 records as retracted ("**The retracted derivation, stated so it is not reinstated**"). An implementer working from §5.6 alone reproduces the withdrawn rule and, with it, the failure §15.2 describes: a resumed episode re-enters greenfield, carries a prompt naming no findings, and reports success on a round whose findings were never addressed. The TSPEC is not obliged to re-narrate the FSPEC, but it *is* the document that supplies §5.6's algorithm, and here the omission plus the substitute rule combine into a reinstatement. | AC-3.5 scope (d), FSPEC §15.2 |
| F-04 | Medium | Cross-Feature | Carried and accepted items are bound to **prose owners, not named successor surfaces**, contrary to `DC-08`. §10.2 and §10.3 carry Q-05 (owner "whoever revises `harvest-learnings/SKILL.md`"), Q-06 ("REQ/product"), **Q-09** ("REQ/product", and self-described as "a real risk … the failure mode is a correct document scored incomplete — a false halt"), T-Q-03 ("post-implementation observation") and T-Q-05 ("se-review"). None names a queue row, a hand-off row or a follow-up REQ. DC-08 is explicit that this is the failure mode: "'This will change when X' with no row is read downstream as an unhandled deferral", and cites the contrasting case where `pdlc-workflow-distribution`'s deferral check passed three DoD rounds *because* D-DIST-01/02/03/05/07 were bound to queue row 6. Q-09 is the acute one — a live false-halt risk, owned by a role that has already converged its documents, mitigated only by test fixtures that catch drift in CI rather than preventing it, and with no surface on which anyone will ever pick it up. Bind Q-09, T-Q-03 and T-Q-05 to rows in `docs/_queue/QUEUE.md` (or a named follow-up REQ) before this TSPEC converges. | DC-08 |
| F-05 | Medium | Cross-Feature | **Phase `PR` (PROPERTIES) is excluded from the skip-eligible set by a slip, not by a decision** — see the determination in §T-Q-01 below for the full evidence. The TSPEC implemented the enumeration literally and raised the question rather than deciding it silently, which is the right call at TSPEC altitude; the finding is recorded here because the fix must land at REQ/FSPEC altitude and the product call is mine to make. Effect if left as-is: Phase PR is the one document-review phase that pays the full H-4 cost on every re-entry, and it sits immediately before Phase I, so it is re-run on exactly the re-entries that follow implementation work. Fix sequence: amend AC-4.7's enumeration to `R, F, T, P, D, PR`; propagate to FSPEC §10.7, §11.2 and §11.3; then TSPEC §5.5, §5.7's `valid` array, and AT-29's expected operator string `Valid: R, F, T, P, D, PR, all.`. Approximately one array literal and one string per document — cheap now, and the TSPEC is correct that it is cheaper before implementation than after. | AC-4.7, AC-4.7a, FSPEC §4.3, §10.7, §11.2, DEC-ORACLE-04 |

---

## T-Q-01 — determination: this is a **slip**, not a deliberate exclusion

The task asks for a product ruling on whether `PR` (PROPERTIES) is deliberately outside AC-4.7's
skip-eligible set. It is not. Five independent lines of evidence, ordered by weight:

**1. AC-4.7's own functional criterion admits `PR`.** The criterion is "phases whose convergence is
established by a reviewer-pair cross-review artifact for a named document". `PHASE_DISPATCH.PR` in
`pdlc/workflows/orchestrate-dev.js` — verified against the tree at HEAD — has
`creator: "te-author"`, `creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md"`,
`reviewers: ["pm-review", "se-review"]` and `optimizer: "te-author"`. It is structurally
indistinguishable from `R`, `F`, `T`, `P` and `D` on every attribute the criterion names. A
deliberate exclusion would have to explain why a phase that *satisfies* the stated test is
nonetheless outside it. AC-4.7 offers no such explanation.

**2. AC-4.7 rationalises only `CR` and `DOD` — and it was written to answer a question about only
`CR` and `DOD`.** The clause's justification is entirely about tree-review phases: they "review the
tree rather than a document, produce no `CROSS-REVIEW-{role}-{doc-type}` pair in AC-1.1's sense, and
are cheap relative to the risk of skipping a verification phase". None of those three reasons is true
of `PR`. AC-4.7 is annotated *(v1.1, SE Q-04)*, and SE Q-04 in
`CROSS-REVIEW-software-engineer-REQ-v1.md` reads, verbatim: "Does AC-4.1's skip apply to Phase CR
(final codebase review) and Phase DOD, which have no `CROSS-REVIEW-{role}-{doc-type}` artifact pair
in the AC-1.1 sense?" The question posed a binary about two named phases; the answer enumerated the
complement of those two from a list that was miscounted. `PR` was never considered.

**3. Every other enumeration in all three documents treats PROPERTIES as first-class.** REQ AC-3.1
lists six spec documents including PROPERTIES; AC-3.5 scope (a) wraps `te-author` authoring
PROPERTIES; O-7 demands completeness criteria for six spec documents. FSPEC §4.3's closed doc-type
catalogue is "`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`. There is no seventh, **and
Phase CR is deliberately absent**" — it names the deliberate exclusion and PROPERTIES is not it.
FSPEC §16.2 gives PROPERTIES its own completeness criterion. TSPEC §4.4's tier-2 Document Type domain
includes `PROPERTIES`. The five-member set in AC-4.7, FSPEC §10.7 and FSPEC §11.2 is the *only* place
in ~380 KB of specification where PROPERTIES is absent from a document enumeration.

**4. Decisively: the exclusion creates approval evidence with no reader — the exact anti-pattern
AC-4.7a invokes to refuse a field.** Both approval tiers record PROPERTIES rounds unconditionally.
Tier 1 writes `APPROVAL-HASH:` / `REVIEWED-COMMIT:` onto the `CROSS-REVIEW-{role}-PROPERTIES-v{N}.md`
pair (TSPEC §5.3, on every gate pass, with no phase filter); tier 2's `## 6. Approval Record` admits
`PROPERTIES` as a Document Type. If `PR` is not skip-eligible, nothing ever reads either record. That
is precisely the condition AC-4.7a uses to *decline* a contract — "a persisted verdict on it would
have no reader, and adding an unread field is the kind of speculative contract this REQ declines".
An intentional AC-4.7 would have had to also strike `PROPERTIES` from the tier-2 domain and gate the
tier-1 append. It does neither. The two clauses are inconsistent under the "deliberate" reading and
consistent under the "slip" reading.

**5. The motivating harm applies to `PR` identically, and worst.** H-4's harm is re-running a
converged document-review phase on re-entry. Phase PR is the last phase before Phase I, so it is on
the path of every re-entry that follows implementation work — the commonest re-entry there is. Under
`DEC-ORACLE-04` ("when spec and code disagree, ask which error is more expensive to live with"), the
spec's five-member enumeration and the code's six document phases disagree, and the asymmetry is
clear: wrongly *including* `PR` costs the same risk already accepted for the other five (a skip
backed by a same-round approving pair with a fresh hash, revocable by `forcePhases`), while wrongly
*excluding* it costs a full creator + two-reviewer + optimizer round on every re-entry, forever, plus
two tiers of unread records. The expensive error is exclusion.

**Ruling: slip.** Fix it at REQ altitude per F-05. I would not accept "carried" as the disposition
for this one: it is a one-literal change whose cost rises sharply once `parseForcePhases`, AT-29's
operator string and the tier-2 domain are implemented and tested against the five-member set.

---

## Assessments requested on the other carried items

**Q-05 (approval-record heading renumbering) — correctly carried; no product exposure.** §5.9's
heading matcher normalises numeric prefixes, so both answers work today. Nothing operator-facing
changes under either. Agreed it is not a TSPEC decision. It does still need a successor surface under
F-04, but it is the lowest-value of the carried items.

**Q-06 (`RESOLVED:` provenance — who resolved it and when) — correctly carried, and I decline the
widening.** Adding provenance fields to the marker would put a second, agent-unwritable field on the
one artifact whose entire contract is "a person says it did". Nothing in the pipeline branches on
provenance, so it would be an unread field — AC-4.7a's own test for refusing a contract. The
audit-trail need it gestures at is already served by git: the commit that adds `RESOLVED: yes`
carries the author and the timestamp. Recommend the REQ **close** this question as declined with that
reason rather than carrying it further.

**Q-09 (per-class heading lists in the workflow script vs templates in the SKILLs) — the author's
risk assessment is correct and I am escalating the disposition, not the severity.** The failure mode
is a correct document scored incomplete, i.e. a false halt, which is the same class of harm this
whole feature exists to remove; the mitigation (fixtures copied verbatim from the SKILL templates)
converts a silent production halt into a red suite, which is a genuine improvement but is a *drift
detector*, not a *contract*. It also depends on the fixtures being re-copied whenever a SKILL
template changes, which is exactly the manual step that rots. I accept that closing it means editing
six SKILLs and is out of this feature's mechanism scope — but it must be bound to a queue row, not
left to "REQ/product" in prose (F-04). It is the single most likely source of the next false halt in
this pipeline.

**T-Q-05 (queue module in the dev bundle; ~1,150 lines; no documented size budget) — answerable by
measurement, and the answer is that no new size territory is entered.** Measured at HEAD:
`orchestrate-dev.bundle.js` is 92,525 bytes / 2,377 lines; `orchestrate-queue.bundle.js` is 140,096
bytes / 3,540 lines; `orchestrate-queue.js` source is 47,733 bytes / 1,158 lines. The queue bundle
**already inlines both modules today** and ships. So edit 4 grows the dev bundle to approximately the
size of an artifact that has been in production since `pdlc-workflow-distribution` — the largest
shipped artifact already contains exactly this union. There is no size budget because the ceiling has
already been demonstrated to be above the proposed value. The TSPEC's stated alternative (duplicating
the two row helpers, and with them a second copy of the queue's table grammar) is the worse trade and
should be declined on the merits, not left open. Per `DC-02` (measured, not inferred), state that
measurement in §7.2 and close T-Q-05 rather than carrying it to `se-review`. No finding — the
proposed edit is right; only its disposition should change from "asking" to "settled, with the
numbers".

---

## Spot-check of §9.1's obligation-discharge claim

Checked against the FSPEC's own obligation map (§2.2, §21.1) rather than accepted as stated.

- The claimed set — O-1…O-9 plus O-16…O-21 — **matches** FSPEC §2.2 exactly, including its statement
  that "Rows not landing in FSPEC and therefore not discharged here: O-10..O-15". §9.1's opening
  paragraph gives the right reason for their absence (retracted during FSPEC review, absent from the
  FSPEC's own map), so this is not a silent drop.
- Spot-checked rows: **O-3** (§5.8 does carry `parseResolvedMarker`, `checkPostmortem` and
  `extractRecommendation` with the 4,000-byte truncation); **O-7** (§5.9 carries four wrapped classes
  and six spec-class heading tables, matching FSPEC §16.6); **O-21** (§4.4 carries placement, six
  columns, copy-never-recompute, exclusive tier selection and the `unavailable` marker); **O-17**
  (§5.1/§5.3/§4.3 carry one grammar family with three carriers, matching FSPEC §2.3). All hold.
- **One row is discharged in text but contradicted by the design it points at.** O-9's note reads
  "precedence over approval but not over an unresolved POSTMORTEM". That is an accurate summary of
  FSPEC §11.4/§11.5, which govern the *forced* path. §2.5 then generalises it into a gate ahead of
  every phase entry, which is where F-01 lives. The discharge table is right and the control flow is
  wrong; fixing §2.5 requires no change to §9.1.
- `O-18` is listed out of numeric order at the end of the table. Cosmetic; not a finding.

---

## Scope discipline

Checked in both directions, per the brief.

- **Nothing silently widened that I can find.** The two candidates I chased both cleared: the
  worst-case dispatch bound of 36 in §4.5 looks like a divergence from REQ AC-3.5c's "5 × 6 = **30**",
  but FSPEC v1.5 already corrected it (SE F-13: "the dispatch bound is
  `(1 + MAX_REVIEW_ROUNDS) × MAX_AUTHORING_DISPATCHES` = 6 × 6 = **36**, not 30; the shown product had
  dropped the greenfield episode the five-coordinate key introduced"). The TSPEC follows the approved
  FSPEC and the REQ's 30 is the stale figure. The four new constants, the six new `main()` parameters
  and the four `build-runtime.mjs` edits all trace to named FSPEC sections.
- **Two things quietly dropped**, both recorded above: AC-2.3b's precedence *and* its report
  obligation ("The skip report must nevertheless name any unresolved POSTMORTEM for that (phase,
  feature)") — §4.7 defines the skip notice line but never gives it that content, and under §2.5's
  ordering the skip path is unreachable in that state anyway (F-01); and AC-3.5b's greenfield terminal
  test (F-02).
- **No retracted rule is reinstated as normative text.** §10.3 T-Q-04 correctly carries FSPEC v1.5's
  accepted shallowness of the placeholder test rather than re-opening it. The one near-miss is
  §5.6's artifact-state-derived prompt-kind rule standing in for mode selection (F-03), which
  *reads* as the retracted v1.4 derivation even though the TSPEC never claims it as the mode rule.

---

## Positive Observations

- **T-Q-01 was raised rather than silently decided.** The TSPEC identified the discrepancy between
  AC-4.7's five-member set and `PHASE_DISPATCH`'s six document phases, named the altitude at which it
  must be settled, implemented the approved spec literally in the meantime, and priced the fix. That
  is exactly the right behaviour for an engineering document that has spotted a product defect, and
  it is why this review could make the call cheaply. §10.3 as a whole models this well.
- **`DC-02` is honoured throughout.** §9.3 records that every claim about existing code was verified
  against the tree at a named HEAD, and the spot-checks I ran (the `PHASE_DISPATCH.PR` entry, the dev
  bundle's composition array, `DEV_META`'s missing `inputs`, both bundles' sizes) all matched what
  the document asserts. Given how many findings in this feature's earlier phases came from asserting
  something existed when it did not, this is a visible improvement.
- **§4.7's operator-facing distinctions are well judged.** Reusing the existing `"⏭"` marker so an
  approval skip is visibly distinct from a run and from a `"❌"` failure, and separating
  `"halted (uncommitted)"` from `"error"` because "the operator's remaining action is a manual commit,
  not a re-run" — with the original halt reason reported first — are both the right calls for
  attributable failure.
- **§8.5's seam set is derived from `main()`, not hand-listed**, with the exemption list itself
  asserted to be fully consumed. This is the rare guard that cannot rot silently, and it directly
  addresses the failure class the FSPEC identified as this repo's most repeated.
- **§4.8 states plainly that `MAX_AUTHORING_WRITE_BYTES` has no oracle**, and §10.3 T-Q-03 repeats it
  rather than letting the constant look enforced. Naming an unenforceable control as advisory is
  better product hygiene than a control that reads as binding and is not.

---

## Recommendation

**Needs revision**

Required before approval:

1. **F-01** — Restore AC-2.3b's ordering in §2.5: the approval skip is evaluated first;
   `checkPostmortem` is reached only when the phase would otherwise run. Keep the unconditional
   refusal on the *forced* path only (§11.5 / AC-4.6a), and give the §4.7 skip notice the content
   AC-2.3b requires — naming any unresolved POSTMORTEM for that (phase, feature). Confirm FSPEC
   §12.4's worked example A is reachable under the revised flow.
2. **F-02** — Condition §5.6's terminal test on mode: greenfield terminates on structural
   completeness alone, with no trailer required or expected; revision requires completeness **and**
   `parseRevisionComplete → { complete: true }`. Per lesson R-5 the preferred shape is to *delete*
   the unconditional trailer conjunction from the greenfield path, not to add a clause reconciling
   the two.
3. **F-03** — State AC-3.5 scope (d)'s mode-selection rule in §5.6: selected once at episode entry
   from what the phase is dispatching an author to do, revision test first, from the review artifacts
   on the branch, independent of structural state, failing toward revision. Make clear that §5.6's
   `invocation === 1 && target absent or empty` rule selects the *prompt kind*, not the mode.
4. **F-04** — Bind Q-09, T-Q-03 and T-Q-05 to rows in `docs/_queue/QUEUE.md` or to a named follow-up
   REQ, per `DC-08`. Owners in prose are not successor surfaces.
5. **F-05 / T-Q-01** — Settle the PROPERTIES exclusion as a slip at REQ altitude: amend AC-4.7's
   enumeration to `R, F, T, P, D, PR`, propagate to FSPEC §10.7 / §11.2 / §11.3, then to TSPEC §5.5,
   §5.7's `valid` array and AT-29's expected string. If product instead rules it deliberate, AC-4.7
   must state the reason `PR` fails its own functional criterion, and the tier-1 append and tier-2
   Document Type domain must be gated to match — otherwise both tiers keep writing records that
   nothing reads.

Suggested, not blocking: close Q-06 as declined with the git-provenance reason, and close T-Q-05 in
§7.2 with the measured bundle sizes above rather than carrying it to `se-review`.

VERDICT: Needs revision
