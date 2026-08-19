# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 6 (delta confirmation; last reviewed `7815b76a`, delta `7815b76a..HEAD` = `bc603aa0`)

## Scope of this round

Delta confirmation only. The revision is 10 insertions / 6 deletions across the §1 changelog row,
§1.2 claim 2, AC-3.2's third catalogue sentence, AC-5.1b's article typo, and a new O-8. I re-read
the three v5 findings, diffed each changed existing-code claim against HEAD sources, and
cross-checked the changed AC text against FSPEC BR-9 and BR-14. No unchanged section re-litigated.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §1.2 claim 2's new depth phrase "reaching one directory level under `docs/`" is exact for the `docs/*/` shape but off by one for the `docs/completed/*/` shape, which sits two levels under `docs/` | §1.2 claim 2 (line 68) |

### F-01 (Low, Local) — `delta | local`

The v5 High is closed: the retracted "excluded by pathspec" mechanism is gone, and what replaces
it is depth, which is what `LS_FILES_ARGV` actually encodes
(`pdlc/workflows/consolidate-learnings.js:1337-1345`: `ls-files --cached --others
--exclude-standard -- :(glob)docs/*/LEARNINGS-*.md :(glob)docs/completed/*/LEARNINGS-*.md`).
"Tracked and untracked but not ignored" maps to `--cached --others --exclude-standard`, and the
fail-open outcome matches `enumerateCorpus`'s `{unlistable: true}` branch
(`consolidate-learnings.js:1347-1349`).

The residue is only precision. Read literally, "those two path shapes … reaching one directory
level under `docs/`" is true of `docs/{p}/LEARNINGS-*.md` and false of
`docs/completed/{p}/LEARNINGS-*.md`, which reaches one level under `docs/completed/`, i.e. two
under `docs/`. The intended reading — one wildcard directory segment per shape — is recoverable,
and nothing load-bearing rests on this sentence: C-3 (lines 163-167) states the corpus by path
shape, AC-2.6 (lines 300-303) states the `docs/discarded/` consequences by depth and both are
correct, and O-7 obliges TSPEC to pin by literal restatement of the predicate rather than by this
prose. Optional one-word fix: "each reaching one wildcard directory level".

## Verifications performed

| Change | Check against HEAD / FSPEC | Result |
|---|---|---|
| §1.2 claim 2 rewritten (v5 F-01) | `consolidate-learnings.js:1337-1345`, `:1347-1349` | **Resolved** — no exclusion-pathspec claim survives; flags, globs and fail-open all match. Precision residue only (F-01) |
| §1.2 claim 2 vs C-3 and AC-2.6 | REQ:163-167, REQ:300-303 | Coherent — all three now say depth/shape, none says exclusion |
| AC-3.2 third catalogue enumerated | FSPEC BR-9:501-505 (`NTC-MALFORMED`, `NTC-KEYTYPE`) | Set equality holds: two members, same two states (AC-5.1b present-not-object, AC-5.1c wrong-typed key); FSPEC AT-32 already asserts set equality over exactly those two (FSPEC:873-874) |
| Other two catalogues unchanged by this edit | FSPEC BR-9:483-497 | 6 per-document ids and 2 corpus-level ids still match REQ verbatim; "Three set-equality tests, one per catalogue" still holds |
| AC-5.1b article typo (v5 F-03) | REQ:369-372 | **Resolved** — reads "so a malformed section is distinguishable from a deliberate disable" |
| O-8 added (count cap unexercised at default thresholds) | AC-2.1 (REQ:271-275), AC-3.2's `RSN-COUNT`, FSPEC BR-5 | Consistent and correct: AC-2.1 already declines to claim cap equality because byte bounds bind first, so `RSN-COUNT` genuinely has no default-threshold exercise. Deferring a named non-default-threshold fixture to TSPEC is the right home; DC-09's second clause makes this closable as a deferral |
| v5 F-02 (AC-5.1c has no FSPEC traceability row) | FSPEC:117, FSPEC:584 | Still open **in FSPEC**, unchanged by this REQ edit — as v5 recorded, the fix lands there. Behaviour is legislated (FSPEC:593-594, E-23/E-34 → AT-32); the gap is matrix/heading bookkeeping, not coverage, and does not gate this REQ |
| Size budget | 472 lines, 36.7 KB | Within the 700-line / 60 KB REQ budget |
| Changelog row | REQ:18 | Names all three edits by id, so the next reviewer can scope the delta without reconstructing the diff |

## Questions

| ID | Question |
|----|---------|
| Q-01 | O-8 asks TSPEC for a non-default-threshold fixture that makes the count cut binding. Is the intended lever `maxDocuments` lowered, or `maxBytesPerDocument`/`maxTotalBytes` raised? Either exercises `RSN-COUNT`, but only the first keeps §4.1's byte values as shipped in the fixture, which reads as the cheaper choice. TSPEC's call; noting it so it is decided rather than defaulted. |

## Positive Observations

- The §1.2 correction was made as the minimal one-clause edit v5 asked for; no adjacent sentence
  drifted, and the claim now describes the shipped predicate's actual mechanism (depth plus a
  literal `completed` prefix) rather than a mechanism that was never there.
- O-8 is a good catch to volunteer: an AC whose id can never fire under shipped defaults is
  exactly the kind of vacuous-green risk that surfaces late, and naming the missing fixture at REQ
  altitude — obligation, not fixture design — keeps it TSPEC's to solve without losing it.
- AC-3.2's third catalogue is now enumerated rather than referenced by AC id, which makes the
  set-equality obligation checkable from the REQ alone and matches FSPEC BR-9's table one-for-one.

## Recommendation

**Approved with minor changes**

The v5 High is closed and no new blocking finding is open. F-01 is a one-word precision fix in a
sentence nothing depends on; it can land with the next touch of this document or be left as is.
The remaining AC-5.1c traceability gap is FSPEC's, already recorded, and is not a REQ blocker.

## Delta-confirmation findings (tagged)

FINDING: Low | delta | local | §1.2 claim 2 | "reaching one directory level under `docs/`" is exact for `docs/*/LEARNINGS-*.md` but off by one for `docs/completed/*/LEARNINGS-*.md`; intended reading is one wildcard directory segment per shape, and C-3, AC-2.6 and O-7 carry the load-bearing statements correctly.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
