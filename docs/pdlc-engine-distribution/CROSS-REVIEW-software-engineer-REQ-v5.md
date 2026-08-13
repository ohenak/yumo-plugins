# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10, 2026-08-13)
**Date:** 2026-08-13
**Iteration:** 5 (erratum delta-confirmation round)
**Scope:** Confirmation of the Phase F erratum items against `CROSS-REVIEW-software-engineer-REQ-v4.md`.
Diff base `2a1f910d` (the commit v4 reviewed) → HEAD `c38feb61`, three edited sites in the REQ.
Engineering lens only: feasibility, implementability, existing-code and upstream-citation
verification, integration risk.

## Erratum items — disposition

All four raised items landed, and the three distinct edits are the *only* changes to the REQ on
this diff (`git diff 2a1f910d..HEAD` touches the version row + changelog paragraph, NG-6, AC-3.5
and O-2, nothing else). Items 1–3 are three statements of one defect and are confirmed together.

| Item (raiser) | Status | Evidence at HEAD |
|---|---|---|
| NG-6/O-2 reconciled on **scope**, not on the read/write verb (se-review) | **Confirmed** | NG-6 (`:169-174`) now opens "The scope of this non-goal is **install and upgrade**, not every engine activity", forbids install/upgrade to "create, sync, write, read nor version-check any file inside a consumer project", and states the run is *outside* the non-goal and does read `engine.*` for its pin. The verb-based carve-out is gone; the residual "it still never writes it" is now a property of the run, not a reading of NG-6. |
| NG-6's own text no longer contradicted by O-2's gloss; FSPEC states it the same way (pm-author) | **Confirmed, and checked against the downstream text it cites** | The changelog's citation is accurate, not decorative: FSPEC F-3 step 5 (`FSPEC:139-142`) reads "**Install and upgrade neither read nor write consumer config**; the *run* reads the `engine.*` namespace (F-4 step 2)… The reconciliation with NG-6 is by **scope**, not by verb"; BR-2.2 (`:321-324`) scopes install/upgrade to "touch consumer config not at all" and routes the read to BR-4.7; BR-4.7 (`:374-375`) grants the run the `engine.*` namespace read and denies the write. One rule, three sites, same shape as NG-6's — downstream now inherits one rule, which was the item's whole point. |
| O-2's `:515` gloss "reading is not writing (NG-6 forbids only the latter)" misstates NG-6 (se-review) | **Confirmed removed** | O-2 (`:527-529`) now reads "This does not cross NG-6: that non-goal scopes install and upgrade, which touch no consumer file at all, while a run may read the operator-authored pin." No sentence in the REQ now characterises NG-6 by verb. |
| AC-3.5 absence-only oracle needs a positive conjunct (te-review) | **Confirmed** | AC-3.5 (`:340-346`) names the vacuity ("Absence alone holds vacuously if the credential is never consumed") and pairs two positives: (a) secret present ⇒ publish authenticates, release cut; (b) absent or empty ⇒ workflow fails at the publish step naming the missing secret, publishing nothing. Both are decidable on the same workflow run the absence claim is read from. |

Upstream re-grounding (DEC-ERR-03): `docs/_constraints/`, `docs/_decisions/` and `docs/_queue/`
are **byte-unchanged** between `2a1f910d` and HEAD (`git diff --stat` over all three is empty), so
every M-ENG citation this REQ leans on still says at HEAD exactly what it said when I approved
v0.9. Spot-checked the two the erratum sites touch or re-read: DEC-HE-02
(`DECISIONS-headless-engine-obligations.md:37-59`) still decides that `.claude/pdlc.config.json`
is "the **only** config file the engine reads" with engine knobs "overridable under a reserved
`engine.*` key" — which is what O-2 and NG-6 now claim of it, in the direction they claim it;
M-ENG-11 still records `pdlcPluginCompat` `^0.22.0` against plugin `0.22.7`, so C-1/AC-3.7 remain
satisfiable at HEAD rather than pre-failed.

## Prior findings still open

Neither v4 finding was in the erratum's item list, and neither was touched by this diff. Both are
carried forward unchanged rather than silently dropped; both remain non-gating.

| v4 ID | Sev | Status | Note at HEAD |
|---|---|---|---|
| F-25 | Medium | **Open (carried)** | AC-3.4's local-expansion carrier still puts no bound on what may appear in a job `name:`. Still true at HEAD that only `${{ matrix.os }}` / `${{ matrix.node }}` interpolate (`.github/workflows/pr-tests.yml:28`, `:78`), so the oracle is implementable today; the exposure is future — a `${{ github.event_name }}` or `matrix.include` edit makes a matrix-axis expander under-render silently. FSPEC's expected-set section is the right place to bound the expression form, and this is an FSPEC pass, not a REQ edit. |
| F-26 | Low | **Open (carried)** | `docs/_constraints/pdlc-engine-baseline.md:209` still ends M-ENG-10 with "Both columns are authoritative; a change to either is a change to this fact first" — a change-control sentence in a file whose own header calls itself a point-in-time measurement, after T-7/AC-3.4 moved change control to the FSPEC's expected set. Nothing in the REQ is wrong; the one-line fix is in the constraints file. Unchanged on this diff (that file is byte-identical to `2a1f910d`). |

## Findings

New this round, scoped to the three edited sites. Both are Low; neither blocks.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-27 | Low | Local | **AC-3.5(b)'s "naming the missing secret" is not what the channel tool does natively — it requires an explicit preflight step the FSPEC should own.** With DEC-DIST-05's channel (public npm), the natural implementation of a publish step is `npm publish` with `NODE_AUTH_TOKEN` from a secret. Absent or empty, npm fails with `ENEEDAUTH`/401 naming the *registry*, not the repository secret — the failure is loud, so (b)'s "fails, publishing nothing" half holds, but the "naming the missing secret" half does not, and a reviewer reading only the CI log cannot tell a missing secret from a revoked token. Cheap to satisfy — one guard step asserting the secret is non-empty before the publish step — but it is a step someone must author deliberately, and it is invisible in the AC as written. FSPEC's F-5/publish flow should state the preflight explicitly so the implementer does not read (b) as free. No REQ edit needed: the AC states a correct outcome, and this is the cost note the outcome hides. | AC-3.5, C-8, O-1 |
| F-28 | Low | Process | **FSPEC F-3 step 5 now carries a stale erratum-pending clause — the REQ fixed what it says is unfixed.** `FSPEC:141-142` reads "NG-6's own wording is an erratum against the REQ, not fixed here." As of v0.10 it *is* fixed: NG-6 now scopes itself to install/upgrade in its own text. Left as-is, a later reader of the FSPEC is told to distrust an NG-6 that no longer says the thing being distrusted, and the erratum channel's record of the round ends up pointing at a resolved defect as open. This is an FSPEC-side one-line deletion, not a REQ change — filed here because this confirmation round is where the two documents were read against each other, and the FSPEC pass is the natural place to land it. | FSPEC F-3 step 5 (downstream), NG-6 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried, unanswered — no text changed on this round)* O-7 settles the two version numbers and the tag, but not the cadence underneath: the plugin-only `SKILL.md` corpus moves independently of `pdlcPluginCompat` (`pdlc/engine/package.json:9`, still `^0.22.0` at HEAD against plugin `0.22.7`), so a prompt-only plugin minor can put the installed engine outside the declared range and trip AC-1.1's refusal until an engine republish lands. Is "the engine republishes on every plugin minor" the accepted operating cost, or is O-6's per-release range-widening the intended relief? |
| Q-06 | *(carried)* AC-5.6 fixes what a run does when `PDLC_PLUGIN_ROOT` stops being honoured on presence alone, but not whether `REMEDY` (`pdlc/engine/lib/handshake.mjs:131-134`) changes with it — it *advertises* the variable as the remedy. Is "ignored" scoped to dev-mode marking only, leaving plugin-root resolution untouched? Different blast radii; TSPEC needs to say which. |
| Q-08 | *(carried)* O-9 now owns three obligations of the same shape (AC-4.2's version pair, AC-4.5's authored-file enumeration, AC-6.2's load root). Is that one design decision or three? The first two are values the engine already pushes across the seam (M-ENG-13); the third is a fact only the module loader knows. If the TSPEC can settle 4.2/4.5 on one carrier but not 6.2, saying so at O-9 would keep Phase 1 scoped. |

## Positive Observations

- The NG-6 fix corrected the **non-goal itself**, not the gloss that misread it. The tempting
  cheap fix was to reword O-2 and leave NG-6 alone; that would have left the defect in the
  document downstream readers inherit from. Editing NG-6 first and then re-glossing it at O-2
  means FSPEC's three sites (F-3 step 5, BR-2.2, BR-4.7) now restate one rule instead of
  reconciling two — which is exactly what the item asked for and the harder half to do.
- The scope reconciliation is stated in a form that stays true under later edits: "install and
  upgrade touch no consumer file at all" is a property of two named operations, checkable by
  running them (C-2, AC-2.3), whereas the old verb formulation was a claim about what a
  sentence forbade — unfalsifiable and, as it turned out, wrong about its own sentence.
- AC-3.5's positives cost nothing new to observe. (a) is the same event AC-3.1 already
  requires — the first real release — so pairing the absence oracle did not invent a second
  publish to watch; (b) is observable on a deliberately-unset-secret run. The te-review item
  was answered without widening the verification surface, which is not the usual outcome when
  an absence oracle gets paired.
- The erratum landed inside the size budget again: v0.10 is 605 lines / ~51 KB against the
  700-line, 60 KB REQ budget, with a five-line changelog entry added on top of three
  substantive edits. The changelog entry is a compression ("restated on scope … no other
  change") that I could check against `git diff` in one pass and found accurate — the diff
  contains nothing the entry does not announce.
- Downstream citation direction is honest. The changelog cites FSPEC F-3/BR-2.2/BR-4.7 as
  *evidence the correction propagated*, not as authority the REQ derives from; NG-6's own text
  cites only O-2 and AC-5.1, both internal. A REQ leaning on its FSPEC for a rule would be an
  altitude inversion; this is a provenance note, and it is placed where provenance notes go.

## Recommendation

**Approved with minor changes**

No open High findings, and the erratum is confirmed on all four raised items. The three edits
are necessary *and*, on this document, sufficient: the defect was one statement made in two
places (NG-6's text and O-2's gloss), both are now scope-framed, and the downstream text that
inherits the rule states it the same way at HEAD rather than reconciling a contradiction of its
own. AC-3.5 is no longer an absence-only oracle.

The DEC-ERR-03 re-grounding turned up nothing: the REQ's upstreams — `docs/_constraints/`,
`docs/_decisions/`, `docs/_queue/` — are byte-unchanged since the commit I approved v0.9 at, so
no citation in this document points at text that has moved or changed meaning, and the two
claims the edited sites newly lean on (DEC-HE-02's config-surface decision, M-ENG-11's compat
range against the plugin version) were re-read at HEAD and hold as stated.

Two Low findings for the FSPEC pass, neither a REQ edit: AC-3.5(b) needs an explicit
secret-presence preflight in the publish flow or the channel tool's native failure will not name
the secret (F-27), and FSPEC F-3 step 5 should drop its now-stale "NG-6's own wording is an
erratum against the REQ, not fixed here" clause (F-28). Carried F-25 (Medium, AC-3.4's
expression-form bound) and F-26 (Low, M-ENG-10's residual change-control sentence) remain open
and remain non-gating — F-25 belongs in the FSPEC's expected-set section, F-26 in the
constraints file.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:f570fb72dd31d9e264b7c3d9292ef6af94e263332df0af3e74787558825457e1
APPROVAL-HASH-NORMALIZED: sha256:0b47ea40012e30684d7811672cd9c24c0259724dd2179f48e8a72be9052bc3a2
REVIEWED-COMMIT: c38feb616cd05964cf1e2327b7440ffd1e2f7d26
