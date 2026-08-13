# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9, 2026-08-13)
**Date:** 2026-08-13
**Iteration:** 4
**Scope:** Delta re-review against `CROSS-REVIEW-software-engineer-REQ-v3.md`. Engineering lens
only — feasibility, implementability, existing-code claim verification, integration risk.
Diff base `5f349a2d` (the commit v3 reviewed) → HEAD, eight commits touching this REQ.

## Prior findings disposition

All four round-3 findings addressed, including the one High. Every claim the revision
introduced or repointed was re-checked against HEAD in one pass.

| v3 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-21 | High | **Resolved** | AC-6.2's conjunction is now (1)+(2) only, and the distinguishing fact is named as the **load root** — "the tree the executing modules were loaded from" — not a write root. The parenthetical "no run writes `.claude/workflows/`; `sync-workflows.sh` and the SessionStart drift hook do, and the runtime's own contact with that tree is a read" is correct as written: the only writers of that tree are `pdlc/hooks/scripts/sync-workflows.sh:239` and `pdlc/hooks/scripts/lib/pdlc-drift.sh:1562`, while the runtime's single touch is the injected *read* at `orchestrate-queue.js:1089` (`readDriftStateSafely(readFileFn, DRIFT_STATE_PATH)`, path declared `:79`). The honest residue — no run-bound observation of the load root exists on the bundle side, C-4 forbids teaching that path to self-report, and "install only one channel" is an experiment's precondition rather than an observation — is stated in the AC and routed to O-9, with O-9's *Blocking for:* widened to "the AC-6.2 half of REQ-EDIST-06". The AC no longer reads as solved. |
| F-22 | Medium | **Resolved** | O-5 now cites the `REMEDY` symbol in `pdlc/engine/lib/handshake.mjs` rather than a line window. Verified: `const REMEDY` at `:131`, and its text names `PDLC_PLUGIN_ROOT` at `:134` — the string the old `:130-133` window excluded. The rationale ("drifts on any edit above it") is recorded in the same clause, and the "not M-ENG-06" disambiguation survived the compression. |
| F-23 | Medium | **Resolved** | AC-3.4 now names its carrier: read the authored `name:` strings **and expand the declared matrix axes locally**, "decidable offline, without a PR, a network or credentials, as at AC-1.3", with an explicit reason the live-run alternative is excluded ("that check cannot run inside the gate it asserts on"). That is the same standard AC-1.3 sets, and the choice — not merely the constraint — is now REQ-visible. One residual bound is missing; see F-25 (Medium, not gating). |
| F-24 | Low | **Resolved** | The change-control point moved out of the measurement: T-7 now reads "the FSPEC's expected required-check set … seeded from M-ENG-10's measurement at authoring time", AC-3.4 asserts equality against "an expected set stated in the FSPEC" and says outright "M-ENG-10 stays a point-in-time observation, not a gate", and O-B follows ("T-7's expected set is seeded from that measurement"). C-5 was repointed to "any check in T-7's set … by their literal rendered names". No REQ sentence now gates on a document declared not to be a pipeline artifact. The mirror-image residue is in the constraints file, not here; see F-26. |

## Findings

New findings only, scoped to sections changed since `5f349a2d`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-25 | Medium | Local | **AC-3.4's local-expansion carrier has no bound on which expression forms may appear in a `name:`, so the oracle can silently under-render.** "Expand the declared matrix axes locally" is exactly right for HEAD: the only interpolations in any job `name:` are `${{ matrix.os }}` and `${{ matrix.node }}` (`.github/workflows/pr-tests.yml:28`, `:78`; rows 3–5 are literals). But a matrix-axis expander is not a GitHub expression evaluator. The day a name interpolates anything else — `${{ github.event_name }}`, `${{ inputs.* }}`, a `matrix.include` entry that adds a name axis — the local expansion produces a string GitHub never reports, and the set-equality passes against the FSPEC's expected set while Phase PUB's poll breaks: precisely the failure mode F-14/F-21's two-alphabet split exists to prevent, re-entering through the renderer instead of through the column. The fix is one REQ-level clause, not a mechanism: authored `name:` strings may interpolate **matrix axes only**, and any other expression form in a job `name:` fails AC-3.4. That keeps the constraint on the artifact (decidable by reading the workflow) rather than on the verifier's evaluator, and it is REQ altitude for the same reason "in both alphabets" is. | AC-3.4, T-7, C-5 |
| F-26 | Low | Local | **M-ENG-10's own tail still claims the change-control role that T-7/AC-3.4 just took away from it.** The REQ side of F-24 is clean, but `docs/_constraints/pdlc-engine-baseline.md:214` still ends the M-ENG-10 fact with "Both columns are authoritative; a change to either is a change to this fact first" — which is the gate sentence, in a file whose own header declares it a point-in-time measurement and not a reviewed pipeline artifact. Two documents now name two different change-control points for the same set. Nothing in this REQ is wrong, and the fix is a one-line edit in the constraints file ("a change to either means this fact was re-measured", leaving the *gate* to the FSPEC's expected set), which is why this is Low and not an erratum: the baseline file is a measured-facts constraints file, not one of the pipeline doctypes. Worth doing in the same pass as the FSPEC's expected-set authoring so the seeding relationship reads in one direction only. | T-7, AC-3.4, M-ENG-10 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried, unanswered — no text changed on this round)* O-7 settles which of the two version numbers is the tag, but not the cadence underneath: the plugin-only `SKILL.md` corpus moves independently of `pdlcPluginCompat` (`pdlc/engine/package.json:9`), so a prompt-only plugin minor can put an installed engine outside its declared range and trip AC-1.1's refusal until an engine republish lands. Is "the engine republishes on every plugin minor" the accepted operating cost, or does O-6's per-release record need a range-widening path that is not a republish? |
| Q-06 | *(carried; AC-5.6 unchanged this round)* AC-5.6 permits two branches (refuse, or run the released version and announce the variable was ignored). Does the second branch mean `PDLC_PLUGIN_ROOT` stops being honoured by `handshake.mjs`/`skills.mjs` — in which case `REMEDY` (`handshake.mjs:131-134`) changes too, since it *advertises* that variable as the remedy — or is "ignored" scoped to dev-mode marking only, leaving plugin-root resolution untouched? Different blast radii; the TSPEC needs which. |
| Q-08 | O-9 now owns three obligations of "the same shape — a fact the running layer does not carry today": the version pair (AC-4.2), the authored-file enumeration (AC-4.5), and the load root (AC-6.2). Are they one design decision or three? The first two are values the engine already has and must push *across* the seam (M-ENG-13); the third is a fact only the module loader knows, which the engine cannot supply from outside. If the TSPEC can settle 4.2/4.5 with one carrier but not 6.2, saying so at O-9 now would stop Phase 1 from being scoped as though one answer closes all three. |

## Positive Observations

- The F-21 fix is the right kind of fix: it did not soften the AC, it *relocated the fact* and
  then admitted the fact is not yet observable. "A *load* root, not a write root: no run writes
  `.claude/workflows/`" is a sentence I could check against the tree in one pass, and it is true
  in both halves — the writers are the two shell scripts, the runtime's only touch is an
  injected read. Naming the precondition/observation distinction ("installing only one channel is
  the precondition of an experiment, not an observation the run makes") is the part that keeps
  this from re-converging on an absence oracle a round from now.
- Routing the residue to O-9 *and* widening O-9's `Blocking for:` line is the difference between
  a note and a commitment. The AC now ends with what does hold in the meantime — "(1)+(2)
  distinguish the channels only on a machine whose installed channels are known independently" —
  so a reader knows exactly how much of REQ-EDIST-06 is deliverable in Phase 1.
- F-24 was fixed at the layer that owns the problem rather than by re-wording the AC: the
  expected set is FSPEC-owned, seeded from the measurement, and three separate sites (O-B, T-7,
  AC-3.4) now say it the same way, with C-5 repointed to match. That is the harder edit and it
  landed consistently.
- The compression is real editing again. v0.9 is 591 lines / 49.8 KB — inside the 700-line,
  60 KB REQ budget — after *adding* the AC-6.2 load-root paragraph and the widened O-9, which
  means the byte bound was held by collapsing superseded changelog entries and duplicated
  restatement (NG-1, R-1, R-4, O-1, O-3, O-4), not by dropping conclusions. Spot-checked: NG-1
  still records the public repo and still says it weakens nothing; R-4 still names the
  retirement condition; O-1 still names DEC-DIST-05 as the carrier of the full comparison.
- The TE-driven baseline edit is the correct scope: `private: true` now says "no ordering against
  the licence or credential blockers is claimed, none was measured"
  (`pdlc-engine-baseline.md:220`). An unmeasured ordering claim was removed from a measured-facts
  file rather than defended in the REQ.

## Recommendation

**Approved with minor changes**

No open High findings. The round-3 High is genuinely closed — AC-6.2's distinguishing fact is
now the load root, the write-root claim that no run performs is gone, and the missing run-bound
observation is owned at O-9 instead of read as solved — and I re-verified both code claims the
fix rests on (`sync-workflows.sh:239` / `pdlc-drift.sh:1562` write, `orchestrate-queue.js:1089`
reads) plus the repointed `REMEDY` citation (`handshake.mjs:131-134`).

Two non-gating items for the FSPEC pass, not a further REQ round: bound AC-3.4's authored `name:`
strings to matrix-axis interpolation only, so the offline expander cannot silently under-render
(F-25); and drop the stale change-control sentence from M-ENG-10's tail now that the FSPEC owns
the expected set (F-26). Both are one clause each, and F-25 is the one I would put in the FSPEC's
expected-set section while it is being written.

The document is implementable from here. Every existing-behaviour claim I checked this round is
true at HEAD, the two-alphabet split survived the compression, and the three unfunded obligations
are named in one place instead of scattered across ACs.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
