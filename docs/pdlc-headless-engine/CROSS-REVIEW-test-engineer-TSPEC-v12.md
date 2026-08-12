# Cross-Review: test-engineer — TSPEC (Delta Confirmation, erratum round 10)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 12
**Scope:** Delta confirmation only — erratum round 10 (`deriveRoundWindow` citation re-grounding).
Not a re-review of the whole document. Prior approval (v11, TSPEC v1.9) stands except as
confirmed below.

## Delta reviewed

Commit `b8bae50a` — *docs(tspec): re-ground deriveRoundWindow citation to HEAD (erratum round 10)*.
Diff against the previously approved state (`03d28fc6`) is 12 insertions / 2 deletions in one file:

| Hunk | Change |
|---|---|
| Header block | Version `1.9` → `1.10`; new v1.10 changelog entry recording the erratum as citation re-grounding only, upstream pins explicitly unchanged (REQ v0.10, FSPEC v1.7) |
| §7.3 (line 1799) | `deriveRoundWindow` anchor `orchestrate-dev.js:2151` → `orchestrate-dev.js:6366` |

No other lines changed. No prose in §7.3 outside the parenthetical anchor was touched.

## Erratum items — disposition

| Item | Raised by | Resolved | Evidence |
|---|---|---|---|
| ERR-01: §7.3 cites `orchestrate-dev.js:2151` for `deriveRoundWindow`; that line at HEAD is an `out-of-envelope` return inside the envelope check | se-review | Yes | Anchor now reads `orchestrate-dev.js:6366` |
| ERR-02: same finding — stale `deriveRoundWindow` anchor, supported claim unaffected | te-author | Yes | Same edit; both items are the same defect and are jointly discharged |

Both items named one anchor and one anchor only, and both agreed the supported claim was sound.
A single edit therefore discharges both.

## Verification performed against HEAD

Anchors were re-derived from HEAD rather than taken from the edit's own assertion:

- `grep -n "export function deriveRoundWindow" pdlc/workflows/orchestrate-dev.js` → **`6366:export function deriveRoundWindow(basenames, docType)`**. The new anchor is exact — it lands on the
  export declaration, not merely inside the function body.
- `sed -n '2149,2153p'` at the old anchor confirms line 2151 is the `out-of-envelope` return inside
  the envelope check, as both erratum items reported. The old anchor was genuinely stale, not a
  false alarm.
- `grep -n "2151\|6366"` over the document: the only surviving `2151` occurrences are inside the
  v1.10 changelog, where they correctly describe the *former* stale anchor. No live citation still
  points at 2151.

## Nothing previously approved was disturbed

Checked specifically, since a version bump plus an edit inside a testability section is exactly
where silent regression would hide:

- **The testability claim is intact.** §7.3 still requires that the double derive the round index
  from the directory listing the same way the module does, and still requires a test asserting that
  two successive reviewer dispatches for one document produce two files rather than one rewritten
  one. That is the oracle I approved at v11; it is unchanged verbatim.
- **The oracle remains non-vacuous.** The finding it guards — keying the double on `_phase` run
  state rather than on skill alone, so a round-2 dispatch cannot replay round 1's writes over
  `-v1.md` — is untouched. The anchor is supporting evidence for that claim, not the claim itself,
  so re-grounding it strengthens the citation without weakening the parity oracle.
- **No test-level, fixture, double-design or coverage commitment moved.** No assertion, test level
  assignment or property strategy anywhere in the document was edited.
- **Upstream pins unchanged.** REQ v0.10 and FSPEC v1.7 as before; no upstream approval is made
  stale by this edit.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. The delta resolves both erratum items and introduces no new testability gap. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The edit is minimal and surgical: one anchor, one changelog entry, nothing else. This is the
  right shape for an erratum round — it makes the delta confirmation cheap to verify and leaves no
  ambiguity about whether design changed.
- The changelog states plainly that the supported claim is unaffected and that only the anchor was
  stale, and it names both raisers. That preserves the audit trail without re-litigating a settled
  decision.
- Retaining the old `2151` anchor inside the changelog (rather than scrubbing it) means a future
  reader can tell what was corrected and why. Good practice for citation errata.

## Recommendation

**Approved** — the delta fully resolves both erratum items with no High, Medium or Low findings,
and disturbs nothing previously approved. My v11 approval of the TSPEC carries forward to v1.10.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:b6685103e8575a15d1477ad99724c1132bed1ef376939175c91490e4d2de96d5
REVIEWED-COMMIT: b8bae50a9d3a71a2831da79b592923b20496d850
