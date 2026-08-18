# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.9, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 12 (delta confirmation)

## Scope of this round

Per dispatch: re-review only whether the erratum wave landed in commit `c14048ed` (FSPEC v0.9)
resolves the three High-severity findings from `CROSS-REVIEW-test-engineer-FSPEC-v11.md` — F-01,
F-02, F-03 — without breaking previously approved material. Decisions settled in rounds ≤10 are
under decision freeze and are not re-litigated here; only a new, unresolved High-severity defect
would block.

Method: `git diff c5907f3c..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`,
cross-checked against `REQ-pdlc-plugin-retirement.md` v0.15, `docs/_constraints/pdlc-retirement-baseline.md`
(M-11h, M-11n as re-measured), `docs/_queue/QUEUE.md` Order 24,
`docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md`, and the live repo state of
`.claude/pdlc.config.example.json` and `pdlc/workflows/__tests__/consolidationPreflight.test.js`.

## Delta verification

- **F-01 (class 11's disposition promise vs. its scoped edit).** Resolved. §3.1 class 11's row and
  §3.3 step 4 now widen the edit from the bundle reference alone to `consolidate-learnings/SKILL.md`'s
  delegation contract as well (`:8`–`:13`), matching baseline M-11n's re-measured two-obligation
  scope. The capability question F-01 raised — an in-session hand-run that bypasses the log
  boundary, failure-mode-id derivation, duplicate suppression and in-progress marker — is no longer
  asserted away; §3.3 step 4 states the loss as real and accepted, and binds a successor
  (`pdlc-consolidation-rehost`, `docs/_queue/QUEUE.md` Order 24, confirmed present with
  `ready: false` and `depends-on: [pdlc-plugin-retirement, pdlc-headless-engine]`). The new
  black-box oracle at §3.3 step 4 ("every path `consolidate-learnings/SKILL.md` names exists at
  HEAD and the file references no retired host") is decidable by inspecting the file and the tree —
  it clears the "write a test right now" check at FSPEC altitude and closes the gap between the
  promised outcome ("no SKILL.md advertises a dead host") and what the scoped edit actually produces.
- **F-02 (class 11's "deleted, not rewritten" contradicting REQ §A-1 baseline M-11n).** Resolved.
  §7.2 gains row 5, correctly routing this as an upstream-decided correction (REQ v0.14's §A-1 and
  the v0.15-bound REQ O-8) rather than a downstream note; §7.3's erratum-3 row now reads "Decided
  upstream ... Applied here," matching the routing F-02 asked for. Confirmed against
  `docs/_constraints/pdlc-retirement-baseline.md`: M-11n's re-measurement text states the bundle
  reference is deleted and the delegation-contract disposition is an REQ O-8 operator decision, not
  a baseline assumption — consistent with the FSPEC's current text and with REQ v0.15.
- **F-03 (class 10's tightened assertion pinned to the wrong, untracked file).** Resolved. §3.1
  class 10's row now states the tightened set-equality pin is asserted over the **tracked**
  `.claude/pdlc.config.example.json`, while `consolidationPreflight.test.js`'s existing assertions
  over the operator's untracked `.claude/pdlc.config.json` stay at containment — matching the actual
  test at `pdlc/workflows/__tests__/consolidationPreflight.test.js:197`–`:210` (presence-gated via
  `existsSync`, `toContain` only) and the tracked file's current single-entry
  `postWavePathspecs: ["pdlc/workflows/dist/"]`, which a set-equality pin against the probe CLI's
  build path could actually hold without going red on a legitimate operator config addition.

No previously-approved material regressed: the held-class ledger, AC-1.1/O-C reasoning, and
errata 5/9 dispositions carried forward from v11 are untouched by this delta, and §7.2's new rows
4–5 are additive, not replacements of the three already-closed rows.

## Findings

None open at High severity. (Not gating this round, but noted: v11's F-04, F-05, F-06 and F-07 all
appear incidentally addressed by this same delta — class 10's O-C dependency is now stated
explicitly, the survival-claim oracle F-05 asked for now exists, class 6's row carries the
contested-count flag F-06 asked for, and §7.3's table now correctly separates "decided upstream" from
"applied here" per F-07. These were out of this round's scope and are not re-verified line-by-line
here; flagging only so the next full-scope pass can confirm rather than re-derive them.)

## Questions

None new this round.

## Positive Observations

- The oracle added for the survival claim is exactly the kind of black-box, no-execution check FSPEC
  altitude calls for: "every path the file names exists at HEAD, and the file names no retired
  host" is inspectable without running the skill or the workflow it delegates to.
- Re-pointing the tightened pin at the tracked example file rather than the operator's untracked
  config fixes the false-red risk cleanly, without weakening the required-check set: the untracked
  file's existing assertions are left exactly as strong as they were (containment), and the new
  set-equality strength lands only where it can be measured deterministically in CI.
- Routing the capability-loss question to a bound, queued successor (rather than leaving it an
  unbound deferral) closes the gap F-01/F-02 both pointed at without inventing a machinery-backed
  substitute this feature was never scoped to build.

## Recommendation

**Approved.** All three routed High-severity findings (F-01, F-02, F-03) are resolved by the v0.9
delta, checked against the current repo state and REQ v0.15, with no new defect introduced and no
previously-approved material broken.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
