# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md (v1.12, HEAD `28dd256b`)
**Date:** 2026-08-20
**Iteration:** 3 (delta re-review of v1.11 → v1.12)

## Scope

Delta re-review, not a re-read. I approved v1.11 with one Low (F-01, a DoD-leg wording gap on
A6-10's ignored-path conjuncts) and no High or Medium. Round 12 landed four commits over the PLAN —
`50b12a4d` (Overview), `0d024193` (Batches), `99c9724d` (Verification), `d703e81d` + `28dd256b`
(changelog and lineage). I read my v2 file, diffed `b3d877a1..HEAD` over the PLAN (34 insertions,
13 deletions across eleven hunks — the lineage header, the twelve/thirteen file count, A6-18's and
A6-21's task rows, the file-ownership manifest, the AT-05-1 and AT-06-4 traceability rows and three
DoD legs), and scanned only those surfaces plus the mechanical invariants the round claims it did
not move.

**What the round is answering.** PM v2 F-01/F-02 (two shipped exact-shape oracles that A6-18's
`snapshotRef` widening reddens), PM v2 F-03 (AT-06-4's un-skip arm has a different owner than the
seam arm) and my own v2 F-01. The round's central factual claim — that
`pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` must join A6-18's owned set — is correct and
I verified it from both ends: the file exists at HEAD (19 KB) and its
`expect(result.haltAdvisory).toEqual({…})` at `advisoryWaveGateMain.test.js:373-378` is exactly the
four-key literal the PLAN describes, and TSPEC §5.1 gives it an `edited` row
(`TSPEC-pdlc-advisory-wave-gate.md:1537`) saying "it gains `snapshotRef` in the same task".

**Where the round goes wrong is the value, not the ownership.** A6-18's row tells the implementer to
widen that assertion with `snapshotRef: null`. That fixture's `_git` double returns `ok: true` for
every plumbing verb `captureTreeSnapshot` issues, so the capture succeeds and the field is a ref
string, not `null` — the widening as written reddens the very file it was added to protect. That is
F-01 below, and it is the one open High.

**Upstream re-grounding first (DEC-ERR-03).** I re-derived the four lineage digests locally rather
than reading them: REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…`, DECISIONS `dc7a8d65…` —
all four match the header. The TSPEC label bump (v1.13 → v1.15) carries the *same* digest, and that
is correct rather than suspicious: `git diff b3d877a1..HEAD` over the TSPEC is empty and TSPEC's own
version cell already read `1.15` (`TSPEC-pdlc-advisory-wave-gate.md:12`, landed in `ffbc2b18`), so
the round corrected a stale *label* against unchanged bytes. No finding — this is the round fixing
something my v2 pass did not catch, because I checked digests and not version labels.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
