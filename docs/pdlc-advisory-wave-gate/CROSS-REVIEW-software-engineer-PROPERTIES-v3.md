# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 3 (delta re-confirmation — PROPERTIES bytes unchanged; TSPEC moved v1.7 → v1.8)

## Scope of this round

This is an upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are unchanged since
the v2 approval (`REVIEWED-COMMIT: 7f8dcda6`). The anchor recorded
`UPSTREAM-STATE: TSPEC sha256:c0ee14a4…`, which is TSPEC at commit `61a9605d` (v1.7); HEAD is
`a349767b` (v1.8, `sha256:79777fa6…`). The delta is therefore exactly one commit and one
document region.

I read my own v2 cross-review, then `git show a349767b -- .../TSPEC-…md` in full (43 insertions,
3 deletions: a changelog block plus a rewrite of §3.1's `ADVISORY_SEAM_PHASES` paragraph). The
other four upstream documents are byte-identical to the hashes on my anchor — I re-hashed REQ
against the dispatch-supplied `sha256:a10396e8…` and it matches, and the FSPEC/DECISIONS/PLAN
anchors are unmoved — so nothing in this pass concerns them.

The one question I answer: does PROPERTIES still hold as a faithful compression of TSPEC as it now
stands? I re-read the whole of the edited §3.1 region at HEAD, PROP-REC-07 at HEAD, every
PROPERTIES row that cites TSPEC §3.1 or §5.6, and the two shipped line anchors the new TSPEC text
introduces.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | PROPERTIES' Overview still scopes itself to **"TSPEC v1.6 (§2–§5)"** (`PROPERTIES-pdlc-advisory-wave-gate.md:25`, echoed in the v1.0 changelog row at `:12`), while TSPEC HEAD is v1.8. The cited version predates my own approval too — v1.7 was already the approved state — so this is not a regression from this round's edit, and no *substantive* claim in PROPERTIES depends on it: every §3.1 and §5.6 assertion I re-checked matches HEAD prose. It is a stale provenance label on an otherwise accurate document, and cheapest to fix while the document is open. | Overview → Scope; changelog v1.0 row |

FINDING: Low | inherited | nonlocal | Overview → Scope (`:25`) | Version label cites TSPEC v1.6; TSPEC HEAD is v1.8. Pre-existed the v1.7 approval, no dependent claim is wrong, label-only.

No High and no Medium findings. The single Low is not gating.

## Questions

None. The one open question from v2 (the two-document anchor reconciliation for `ADVISORY_SEAM_PHASES`)
is closed by this very edit, in the direction PROPERTIES had already taken.

## Positive Observations

- The v1.8 edit resolves the last disagreement between the two documents **by moving TSPEC to
  PROPERTIES**, not the other way round. §3.1 now marks the table *(module-private)*, states its
  absence from the export list as construction rather than omission, and names the behavioural
  oracle. That is exactly the shape PROP-REC-07 was re-homed to in v1.1 — so the confirmation
  question resolves as "PROPERTIES was already right", with no property text owed.

- I verified the two shipped anchors the new TSPEC prose introduces rather than trusting them:
  `const ADVISORY_SEAM_PHASES = Object.freeze({…})` is at `pdlc/workflows/orchestrate-dev.js:3108`
  with five rows (A1–A5) and no `export`, and the fallback is at `:3338`
  (`phase: placement ? placement.id : "unknown"`, with the `phaseOutcome` line beside it). Both
  PROPERTIES' own citations of those same anchors at `:157` therefore remain true at HEAD, and the
  `unknown`/`unknown` negative control is genuinely reachable from outside the module.

- `ADVISORY_SEAM_PHASES` appears in PROPERTIES exactly once, inside PROP-REC-07. There is no
  export-set property anywhere in the document that the "stays module-private" ruling could
  contradict — PROP-CFG-01's set-equality is over `ADVISORY_DEFAULTS`' keys, an unrelated surface.
  Nothing widened, nothing to re-scope.

- The downstream homing survives intact: PROP-REC-07 maps onto `advisoryEscalationLog.test.js`,
  which PLAN owns under task A6-17 (`PLAN-…:152`), and A6-17's RED row already carries AT-06-3/-5/-6
  for that file. The reconciliation mints no new file, no new owner, and no new task — which is
  what TSPEC §3.1 now asserts in as many words.

- TSPEC §6 OQ-12, cited in PROP-REC-07's Traces cell, still exists at `:1594` and its answer
  ("the constant is construction, not convention") reinforces rather than contradicts the fixed
  `outcome: "halted"` that PROP-REC-07 asserts for A6.

## Recommendation

**Approved with minor changes**

PROPERTIES still holds against TSPEC as it now stands. The v1.8 delta touches one region, §3.1's
`ADVISORY_SEAM_PHASES` paragraph, and it moves that region *toward* PROPERTIES rather than away
from it: the module-private ruling, the `orchestrate-dev.js:3108` / `:3338` anchors, the
written-entry oracle, and the `unknown`/`unknown` negative control are all things PROP-REC-07
already said. I re-read the current upstream text every affected property leans on and found no
sentence PROPERTIES cites that upstream no longer says, or now says differently. The lone Low
finding is a stale version label in the Overview, inherited from before the v1.7 approval and
carrying no dependent claim — worth correcting on the next touch, not worth a round. My v2 approval
stands, re-anchored to TSPEC v1.8.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
