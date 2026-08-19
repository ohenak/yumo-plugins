# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.5)
**Date:** 2026-08-19
**Iteration:** 5 (delta confirmation on the v0.5 erratum; base approved at v4, `REVIEWED-COMMIT: 218debf3`)

## Scope of this round

Delta only. Read `git diff 218debf3..HEAD` over the REQ (37 insertions, 30 deletions, touching
§1.2-adjacent C-3, C-9, §4.1's table, AC-2.1, AC-2.2, AC-2.6, AC-3.2, AC-4.2, AC-4.4, AC-5.1b,
new AC-5.1c, AC-6.2). Sections the edit did not touch were not re-litigated, but the erratum's
own claims were re-measured against HEAD rather than trusted from the diff.

## Erratum items — landed / not landed

| Routed item | Landed? | Evidence in v0.5 |
|---|---|---|
| AC-2.2 rank-invariance under directory rename is unsatisfiable; adopt `(key value, path)` total order (FSPEC BR-4) | **Yes** | AC-2.2 now states the ordering is "a pure function of (ordering key value, repository-relative path) and nothing else" and explicitly withdraws rename invariance ("the path is load-bearing here"). Matches BR-4 and matches the 2-of-89 measurement. |
| AC-2.1's "for `N` greater than the threshold the count equals it exactly" is falsified under §4.1's own values | **Yes** | AC-2.1 is now an upper bound for every `N` plus a conditional cap clause; equality is explicitly "not claimed". Consistent with BR-5's measured 87-of-89 / 13,278-median finding. |
| AC-3.2's catalogue lists `RSN-TRUNCATED`, omits `RSN-NO-MATERIAL` | **Yes** | AC-3.2's per-document set is now exactly BR-9's six: `RSN-COUNT`, `RSN-BYTES`, `RSN-SELF`, `RSN-UNREADABLE`, `RSN-UNPARSEABLE`, `RSN-NO-MATERIAL`, with truncation routed to eligible-or-`RSN-UNPARSEABLE`. AC-4.2's truncated-file clause follows the same routing. |
| Notice catalogue's existence must land in REQ; "two set-equality tests" undercounts | **Yes** | AC-3.2 now names a **third** closed catalogue (AC-5.1b/AC-5.1c notices) and mandates three set-equality tests; C-9 was updated in step. |
| AC-5.1b's `learningsInjectoin` typo example is not detectable; malformed means present-but-not-an-object; wrong-typed key is its own state | **Yes** | AC-5.1b restated as "present but **not an object**", misspelt section name explicitly reads as absent with no unknown-key registry owed; AC-5.1c added for the wrong-typed declared key (stays enabled, key at default, notice emitted). AC-4.4 and AC-6.2 both re-pointed; §4.1's `enabled` row now cites AC-5.1c. Matches BR-14's five states and shipped `parseAdvisoryConfig` semantics. |
| C-3 / AC-2.6 vs shipped enumeration: `docs/discarded/LEARNINGS-*.md` at depth 1 is an ordinary corpus member | **Partly** | C-3 and AC-2.6 landed correctly (see F-01 for the third site that did not). |

Re-measured at HEAD for this round: `pdlc/workflows/consolidate-learnings.js:1338-1346` freezes
`LS_FILES_ARGV` as `ls-files --cached --others --exclude-standard -- :(glob)docs/*/LEARNINGS-*.md
:(glob)docs/completed/*/LEARNINGS-*.md`. There is **no** exclusion pathspec of any kind. Depth-3
`docs/discarded/{p}/LEARNINGS-*.md` is unreached by glob depth; depth-1
`docs/discarded/LEARNINGS-x.md` **is** matched by the first glob. AC-2.6 and C-3 now say exactly
this. §1.2 claim 2 does not.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-20 | High | Local | **§1.2 claim 2 still says the shipped enumeration excludes `docs/discarded/` "by pathspec" — the erratum landed the reconciliation in C-3 and AC-2.6 but not here, so the REQ now contradicts itself on a black-box observable, and the surviving sentence is false about HEAD.** Measured: `LS_FILES_ARGV` (`consolidate-learnings.js:1338-1346`) carries no exclusion pathspec; `docs/discarded/{p}/` is out by glob *depth*, and `docs/discarded/LEARNINGS-x.md` is *matched*. C-3 now says `docs/discarded/` "gets **no exclusion rule of its own**" and AC-2.6 says a depth-1 discarded document "is a corpus member on ordinary terms", while claim 2 says the opposite. A test author writing the C-3 pin (O-7's restatement-vs-declaration test) from claim 2 asserts an exclusion pathspec that does not exist and goes red against shipped code; one written from AC-2.6 goes green. Two admissible, opposite oracles for the same behaviour is not a testable requirement. Fix is one clause: replace "`docs/discarded/` excluded by pathspec" with "`docs/discarded/{feature}/` unreached by the globs' depth, no exclusion pathspec present". | §1.2 claim 2 (vs C-3, AC-2.6) |
| F-21 | Low | Local | **AC-2.1's conceded cap makes `RSN-COUNT` unreachable under §4.1's declared values, and the AC's own cap clause with it.** The revision is correct, but it concedes that under the defaults the byte bounds bind first on measured corpora (BR-5: at most three of 89 contribute). So both "the count reaches the cap" and AC-3.2's `RSN-COUNT` row have no fixture under default thresholds — the per-document catalogue's set-equality test cannot produce that member from a realistic corpus. Nothing to change in the REQ; TSPEC owes a named non-default-threshold (or tiny-document) fixture that exercises the count cut, and should say so rather than leaving the reason id fixture-less. | AC-2.1, AC-3.2 |
| F-22 | Low | Local | **Editorial: doubled article in AC-5.1b, introduced by this edit.** "…naming it, so a\n a malformed section is distinguishable…". Harmless to meaning, but AC-5.1b is the clause three downstream ATs quote; clean it while the erratum is open. | AC-5.1b |
| F-23 | Low | Local | **AC-3.2's third catalogue is named but its membership is not, unlike the other two.** The per-document and corpus-level catalogues enumerate their members inline, which is what makes "set equality" testable from the REQ alone. The notice catalogue is referenced only as "the configuration notices of AC-5.1b and AC-5.1c" — two members by construction, so the test is derivable, but the closure is stated one way for two catalogues and another way for the third. Either enumerate the two members inline (ids are FSPEC's to fix; the *count and origin* are not) or state explicitly that the third catalogue's membership is exactly {AC-5.1b's notice, AC-5.1c's notice}. | AC-3.2 |

## Delta-confirmation tags

FINDING: High | delta | nonlocal | §1.2 claim 2 | Reconciliation of the `docs/discarded/` item landed in C-3 and AC-2.6 but not in §1.2 claim 2, which still asserts a pathspec exclusion that HEAD does not have and that AC-2.6 now contradicts.
FINDING: Low | delta | local | AC-2.1 / AC-3.2 | Conceding that byte bounds bind first leaves `RSN-COUNT` and the cap clause without a fixture under §4.1 defaults; TSPEC owes a named non-default-threshold fixture.
FINDING: Low | delta | local | AC-5.1b | Doubled article ("so a a malformed section") introduced by this edit.
FINDING: Low | delta | local | AC-3.2 | Third (notice) catalogue's membership is referenced rather than enumerated, unlike the two catalogues beside it.

## Questions

| ID | Question |
|----|---------|
| Q-10 | AC-5.1b requires a catalogued notice in the run report while AC-5.1a's behaviour — which AC-5.1b adopts — says "no injection summary is carried: the key is absent". The notice therefore lives outside the injection summary. BR-14's Record column implies the same, but the REQ never says where an operator looks. Confirm the notice's home is a report location that exists on a run with no injection key, so AC-6.2's assertion has an address to read. |
| Q-11 | FSPEC's §3 traceability table maps AC-5.1b→BR-14/AT-32 but has no AC-5.1c row. That is FSPEC's erratum, not this REQ's — flagged here only so the split does not lose a row on the way down. |

## Positive Observations

- The erratum did the hard direction on AC-2.2 and AC-2.1: both now *withdraw* a property rather
  than restate it more carefully. "Rank invariance under a directory rename is **not** claimed: the
  path is load-bearing here" is a requirement a test engineer can act on immediately — it names the
  property that must *not* be written as an AT, which is worth more than a property that would have
  been written and then quietly skipped.
- AC-5.1b/AC-5.1c is the right split. The old text asked for a detector that cannot exist (a
  misspelt section name is indistinguishable from absence without a key registry); the new text
  gives two states with different observable behaviour — disabled+notice, enabled+notice — and
  AC-6.2 asserts both notices fire. Three distinct oracles where there was one unfalsifiable one.
- AC-3.2's per-document set is now byte-for-byte BR-9's six members, with truncation explicitly
  routed rather than deleted. "Truncation is **not** a member: a truncated file is either still a
  LEARNINGS document, so eligible, or `RSN-UNPARSEABLE`" makes the removal falsifiable instead of a
  silent omission, and AC-4.2 follows it.
- Counting the notice catalogue moved "two set-equality tests" to three. Undercounting closed sets
  is exactly how a catalogue ships without a completeness test.

## Recommendation

**Needs revision** — one High (F-20), a one-clause fix inside the erratum's own subject matter.

The delta resolves five of the six routed subjects cleanly and breaks nothing that was previously
approved: AC-2.5, AC-3.1, AC-3.3, AC-5.2, AC-6.1 and the O-7 pin framing all survive intact, and the
three re-measured HEAD claims re-verified true. The sixth subject — the `docs/discarded/`
reconciliation — landed in two of its three sites, leaving §1.2 claim 2 asserting the exclusion that
C-3 and AC-2.6 just removed. Because §1.2 is the measured-claims section downstream authors quote,
that contradiction is load-bearing rather than cosmetic.

Carry-down obligations for FSPEC/TSPEC (not gating this document): TSPEC owes a `RSN-COUNT` fixture
under non-default thresholds (F-21); FSPEC owes an AC-5.1c traceability row (Q-11); the notice's
report location needs an address (Q-10). The v4 carry-downs (F-17 keyed disabled-run baseline, F-18
AC-1.2 re-pointing, F-19 two-conjunct pin, Q-08/Q-09) remain open and are untouched by this edit.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 3}
