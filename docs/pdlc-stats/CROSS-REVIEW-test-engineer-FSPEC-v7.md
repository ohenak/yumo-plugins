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

- The approval anchors did their job. `REVIEWED-COMMIT` and `UPSTREAM-STATE` in v6 let me establish
  "nothing moved on either side" in two commands instead of re-reading 979 lines — this is exactly
  the staleness check those anchors exist for, and it held.
- Nothing regressed. Whatever went wrong in routing, no approved acceptance test became wrong, no
  business rule shifted under a test, and the read-only invariant (§3.4 / BR-28, BR-29 / AT-21,
  AT-22) is untouched.
- The routed item itself is good testing work: DEC-STATS-01's K-7 does own two sibling-feature
  document edits that no site table in this feature's TSPEC lists, and `loop-distribution.test.js`'s
  P7-02 oracle covers only the *count* sentences, not `PK-26`'s existence as a row. That gap deserves
  to land — against the document that actually holds the table.

## Recommendation

**Approved with minor changes.**

No delta landed on this FSPEC, so nothing previously approved could break, and the upstream it leans
on has not moved since the round that approved it. The document stands as approved.

The routed item cannot be discharged here — it names a co-change table this document does not
contain — so I am recording it as a Medium routing defect (F-01) rather than a High unlanded delta.
Halting the FSPEC phase over an item that belongs to `TSPEC-pdlc-stats.md` §2.1 would be a spurious
halt, and the fail-closed rule exists to catch *unlanded* edits, not *unlandable* ones.

What should change: re-dispatch the item against the TSPEC, and route v6's six still-open findings
into the FSPEC's ordinary revision loop — F-03's missing AT-15 leg is the only one that leaves real
behavior unpinned by any test.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | The routed erratum edit did not land: `FSPEC-pdlc-stats.md` is byte-identical to v6's `REVIEWED-COMMIT`. The item is also unlandable here — FSPEC §2.1 is the acceptance-criteria coverage table, and the document has zero occurrences of `co-change`, `MODULE_NAMES`, `vendor`, `PK-26` or `K-7`. The five-site table is `TSPEC-pdlc-stats.md` §2.1 | §2.1 Acceptance criteria coverage / routing |
| F-02 | Medium | inherited | nonlocal | v6's four Medium findings other than the byte-ratio gap are still open verbatim (§7.3's five re-affirmed errata that REQ v1.3 closed; BR-16's `pdlc-advisory-wave-gate` citation; BR-27's quote of deleted REQ text; EC-09/D-9's dissent from a *Given* that no longer sweeps the case in) | §7.3 / BR-16 / BR-27 / EC-09 |
| F-03 | Medium | inherited | nonlocal | BR-16's "contributes no bytes to the process side" half is still unpinned: BR-14 does not close `{doc-type}` to BR-09's six, and AT-15's neither-list still carries no `CROSS-REVIEW-`-prefixed non-matching basename, so an implementation globbing `CROSS-REVIEW-*` into `processBytes` passes §6 in full | BR-16 / AT-15 |
| F-04 | Low | inherited | nonlocal | §1's fidelity anchor, BR-12 and D-8 still argue toward a C-5 silence and a REQ-STATS-03 indecision that REQ v1.3 removed; they should cite the carve-out and the "one label stands" decision instead | §1 Fidelity anchor / BR-12 / §7.1 D-8 |

FINDING: Medium | delta | nonlocal | §2.1 Acceptance criteria coverage / routing | The erratum edit this confirmation was dispatched for did not land on `docs/pdlc-stats/FSPEC-pdlc-stats.md`: `git diff` against v6's `REVIEWED-COMMIT` (`6e7985d14`) is empty and that commit is still the file's last. The item is also not this document's to discharge — FSPEC §2.1 is "Acceptance criteria coverage", and a case-insensitive grep finds zero occurrences of `co-change`, `MODULE_NAMES`, `vendor`, `pdlc-engine-distribution`, `PK-26`, `DEC-STATS-01` or `K-7` (the single `site` hit is the substring in "opposite", line 684). The five-row co-change table the item describes lives in `TSPEC-pdlc-stats.md` §2.1, whose prose reads "enumerated at four sites plus a fifth that counts it". Re-dispatch against the TSPEC; no edit to this FSPEC can resolve it. Filed Medium, not High, because this document is not wrong — the routing is — and a High delta here would halt the FSPEC phase for a TSPEC-scoped defect.
FINDING: Medium | inherited | nonlocal | §7.3 / BR-16 / BR-27 / EC-09 | Four of v6's five Mediums are unchanged because the document is unchanged: §7.3 still re-affirms five errata as open that REQ v1.3 closed (two of them labelled High, sitting in the fail-closed erratum channel harvest reads); BR-16's appositive still reads as a claim that `docs/completed/pdlc-advisory-wave-gate/` reports `harvested` when it reports a measured ratio; BR-27 still quotes REQ-STATS-07 text v1.3 deleted and points at a dead erratum; EC-09 and §7.1 D-9 still frame the decided root-failure behavior as a departure from a *Given* that now explicitly excludes it. Behavior and acceptance tests are unaffected in all four cases — this is stale self-description, not a wrong spec. Route them into the ordinary revision loop rather than re-confirming them each round.
FINDING: Medium | inherited | nonlocal | BR-16 / AT-15 | BR-16's two-claim sentence still has one oracle. AT-17 leg 4 pins "counts as no file remaining"; nothing pins "contributes no bytes to the process side", because BR-14 does not close `{doc-type}` to BR-09's six document types and AT-15's neither-list enumeration is still only `LEARNINGS-*.md` / `MUTATION-EVIDENCE-*.md` / `SIZING-*.md`. An implementation that parses the grammar for round counts but globs `CROSS-REVIEW-*` into `processBytes` is green across all 29 acceptance tests. Fix: add `CROSS-REVIEW-{role}-REVIEW-v1.md` to AT-15's neither-list and assert both totals unchanged. This is the only carried finding that leaves real behavior unpinned by any test.
FINDING: Low | inherited | nonlocal | §1 Fidelity anchor / BR-12 / §7.1 D-8 | §1 and BR-12 still argue that post-mortem selection is not a C-5 divergence "because there is no driver classification of that listing to diverge from", and D-8 still leaves the malformed label as "the REQ's to decide". C-5 now states the carve-out and REQ-STATS-03 now decides the label. The conclusions remain correct; the reasoning implies an upstream silence and an upstream indecision that no longer exist.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}
