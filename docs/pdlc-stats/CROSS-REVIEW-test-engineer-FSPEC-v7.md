# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7 (delta confirmation on an erratum edit)
**Scope:** Delta only — measured against upstream `docs/pdlc-stats/REQ-pdlc-stats.md` at HEAD

## Overview

This is a delta confirmation, not a review. One question: does the erratum edit resolve the routed
item without breaking anything previously approved?

**Measured answer: no erratum edit landed on this document.** `FSPEC-pdlc-stats.md` is byte-identical
to the state I approved in round v6.

| Check | Command | Result |
|---|---|---|
| Bytes changed since v6 approval | `git diff 7ca956d0e..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` | empty |
| Last commit touching the file | `git log -1 --format=%H -- docs/pdlc-stats/FSPEC-pdlc-stats.md` | `6e7985d14`, which is exactly v6's `REVIEWED-COMMIT` |
| Upstream REQ at dispatch | `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` | `sha256:60a516fb…a8f1c9` — matches both the dispatch hash and v6's `UPSTREAM-STATE` |

So there are zero delta bytes to confirm, and the DEC-ERR-03 upstream-fidelity sweep has a null
result by construction: the REQ has not moved since the round that approved this FSPEC against it, so
no passage of this FSPEC can have gone stale *this round*. What v6 recorded as already-stale (its
F-04/F-05/F-06, against REQ v1.3 deletions) is still stale, unchanged, and is carried forward below
as inherited.

**The routed item is not this document's to discharge.** The item reads: *"§2.1's co-change table
lists only five in-repo sites; the two sibling-feature document edits (`docs/completed/pdlc-engine-distribution/`
TSPEC §5.4 `PK-26`, FSPEC §5.2's per-class count 5 → 6) are missing, so the implementation-visible
site list does not match DEC-STATS-01's K-7."* Measured against this FSPEC:

- `FSPEC-pdlc-stats.md` §2.1 is **"Acceptance criteria coverage"** — a REQ-criterion → flow → BR → AT
  traceability table. It is not a co-change table.
- The document contains **zero** occurrences of `co-change`, `MODULE_NAMES`, `vendor`,
  `pdlc-engine-distribution`, `PK-26`, `DEC-STATS-01` or `K-7` (case-insensitive grep; the one
  `site` hit is the substring inside "oppo*site*" at line 684).
- The five-row site table the item describes is in **`TSPEC-pdlc-stats.md` §2.1**, *"Module placement,
  and the enumeration co-change it costs"* (`prepack.mjs`, `publish-preflight.mjs`,
  `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json` `c8.include`), whose prose says the
  member list is *"enumerated at four sites plus a fifth that counts it"*.

The item is a real defect — it is just filed against the wrong document, and no edit to this FSPEC
could resolve it. I record that as a Medium (below) rather than a High: this document is not wrong,
the routing is, and halting the FSPEC phase over a TSPEC-scoped item would be a spurious halt.

## Linked Requirements

DEC-ERR-03 asks me to re-read the upstream this FSPEC leans on *in its current version*, independently
of the item list. I did, and the sweep is null for a verifiable reason rather than by assumption:

- The REQ's last commit is `e33637af2` (*"REQ v1.4 — erratum round 3, scope REQ-STATS-06's harvested
  predicate to C-4 grammars"*), and `git merge-base --is-ancestor e33637af2 6e7985d14` confirms that
  commit is an **ancestor of the commit v6 reviewed**. The REQ has not moved since; its sha still
  matches v6's `UPSTREAM-STATE` byte for byte.
- The id surface FSPEC §2.1–§2.4 pins is intact at HEAD: REQ-STATS-01…09 all present, C-1…C-5 all
  present, NG-1…NG-8 all present. Every §2.1 row therefore still names a live criterion, and §2.4's
  four silences still name live non-goals (NG-1, NG-2, NG-3, NG-4, NG-5, NG-8 are all cited and all
  exist).
- The passages v6 flagged as quoting deleted REQ v1.3 text — BR-27's *"reports it by name as
  missing/malformed"* quote, EC-09/D-9's dissent from REQ-STATS-09's *Given*, §1/BR-12/D-8's appeal
  to a C-5 silence and a REQ-STATS-03 indecision — are unchanged in both documents, so they are
  exactly as stale as v6 recorded and no more. They are carried below as **inherited**, not
  re-litigated.

Nothing in this FSPEC cites upstream text that has changed since the approval. Traceability is
undisturbed: no §2.1 row lost its cover, because no row moved.

## Behavioral Flow

Unchanged. §3.1 (Flow A), §3.2 (Flow B), §3.3 (Flow C) and §3.4 (the read-only invariant) carry zero
delta bytes this round, so every branch I walked in v6 is the branch that stands today. No new
decision point appeared that would need a test, and none disappeared that would orphan one.

## Business Rules

Unchanged: BR-01…BR-30 are byte-identical to the approved state. The two BR-level Mediums v6 raised
against the *then*-new BR-16 text are still open verbatim, because the text was never revised:

- BR-16's appositive still reads, on its nearest antecedent, as a claim that
  `docs/completed/pdlc-advisory-wave-gate/` reports `harvested`, where measured at HEAD it reports a
  **measured** ratio (v6 F-02).
- BR-16's *"contributes no bytes to the process side"* half still has no falsifying oracle (v6 F-03) —
  this remains the one carried finding that leaves real behavior unpinned, and it is the one I would
  fix first.

These are inherited, not delta, and stay non-gating.

## Edge Cases and Error Scenarios

Unchanged: the 32 `EC-*` rows in §5 carry no delta. EC-09's Behavior cell still frames the decided
root-failure handling as a *departure* from REQ-STATS-09's *Given* — framing REQ v1.3 already
obsoleted (v6 F-05). The behavior itself, and AT-27's eight root-failure legs, remain correct; only
the dissent prose is stale.

## Acceptance Tests

Unchanged: AT-01…AT-28 (including AT-14b) are all still present and all still referenced from §2.1's
coverage table, so no criterion lost its acceptance cover this round. AT-15's neither-list still
omits a `CROSS-REVIEW-`-prefixed non-matching basename, which is why v6 F-03's second claim stays
unfalsifiable — an implementation that globs `CROSS-REVIEW-*` into `processBytes` while parsing the
grammar for round counts still passes every test in §6.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Was this confirmation meant for `TSPEC-pdlc-stats.md`? Its §2.1 is the five-row co-change table the routed item describes, and at HEAD it is the document out of step with DEC-STATS-01's post-v1.3 site set (K-1 now derives **nine** sites from a mechanical sweep; TSPEC §2.1 still lists five, and §8/RK-1 still say "five sites" / "five-site vendoring co-change"). If so, please re-dispatch against the TSPEC — the FSPEC cannot carry that edit. |
| Q-02 | Should the six findings v6 recorded be re-routed into the FSPEC's ordinary revision loop rather than re-confirmed round after round? They are all still open and all non-gating, so nothing forces them to land; the byte-ratio one (v6 F-03 / this round's F-03) is a genuine test gap and will otherwise ship unpinned. |

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
