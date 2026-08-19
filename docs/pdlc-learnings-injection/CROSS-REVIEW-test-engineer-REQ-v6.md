# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.6)
**Date:** 2026-08-19
**Iteration:** 6 (delta confirmation on the v0.6 erratum answering v5's F-20..F-23)

## Scope of this round

Delta only. `git diff 7ca315ea..HEAD` over the REQ is 10 insertions / 6 deletions, touching four
sites: the version row, §1.2 claim 2, AC-3.2's third catalogue, AC-5.1b's opening article, and a
new O-8. Every claim the edit makes about HEAD was re-measured against
`pdlc/workflows/consolidate-learnings.js`; nothing outside those sites was re-litigated.

## v5 findings — resolution

| v5 ID | Sev | Landed? | Evidence in v0.6 |
|---|---|---|---|
| F-20 | High | **Yes** | §1.2 claim 2's false clause "`docs/discarded/` excluded by pathspec" is gone (REQ:70-71). `LS_FILES_ARGV` (`consolidate-learnings.js:1338-1346`) carries no exclusion pathspec, and the REQ no longer claims one. §1.2, C-3 (REQ:171-172) and AC-2.6 (REQ:300-303) now agree: `docs/discarded/` has no exclusion rule of its own, depth-1 `docs/discarded/LEARNINGS-*.md` is an ordinary member, depth-3 `docs/discarded/{p}/…` is out of glob reach. The contradiction on a black-box observable is closed. |
| F-21 | Low | **Yes** | O-8 (REQ:452-454) names the gap and routes it: TSPEC owes a named non-default-threshold fixture that makes the count cut binding, so `RSN-COUNT` is not a fixture-less catalogue member. |
| F-22 | Low | **Yes** | AC-5.1b's doubled article removed (REQ:368). |
| F-23 | Low | **Yes** | AC-3.2's third catalogue is now enumerated inline with exactly two members — the malformed-section notice (AC-5.1b) and the wrong-typed-declared-key notice (AC-5.1c) — so all three set-equality oracles are derivable from the REQ alone (REQ:321-324). |

No v5 finding is left open. Size stays inside budget (472 lines, 37,547 bytes).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-24 | Medium | Local | **The replacement phrase in §1.2 claim 2 is inaccurate on its plain reading for the second of the two path shapes it describes.** The sentence names both shapes — `docs/{feature}/LEARNINGS-{feature}.md` and `docs/completed/{feature}/` — then qualifies the enumeration as "reaching one directory level under `docs/`" (REQ:70-71). Measured at HEAD, `LS_FILES_ARGV` is `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md` (`consolidate-learnings.js:1338-1346`): a `docs/completed/{p}/LEARNINGS-{p}.md` file sits **two** directory levels under `docs/`, not one. The charitable reading ("each pathspec has exactly one wildcard directory segment") is true, but it is not what the words say, and §1.2 is the section downstream authors quote as measured fact. No test oracle is wrong today, because AC-2.6 (REQ:303) states the completed-directory case explicitly and independently — which is why this is Medium and not High. Fix is one phrase, e.g. "each shape reaching exactly one wildcard directory segment, so no LEARNINGS document deeper than the two shapes named is enumerated". | §1.2 claim 2 |
| F-25 | Low | Local | **AC-2.6's justification cites a depth statement C-3 does not contain.** AC-2.6 excludes `docs/discarded/{p}/` because "C-3's enumeration [is] not reaching that depth" (REQ:301), but C-3 (REQ:163-172) states the corpus by path shape and by ignore-status and says nothing about depth; the REQ's only depth sentence is the §1.2 phrase F-24 flags. A reader who fixes F-24 by deleting the phrase would leave AC-2.6 pointing at nothing. Either put the depth statement in C-3 alongside the two shapes, or have AC-2.6 justify itself from the shapes directly ("neither shape matches `docs/discarded/{p}/`"). | AC-2.6, C-3 |

## Questions

| ID | Question |
|----|---------|
| Q-12 | O-8 says the byte bounds "bind first on measured corpora", which is AC-2.1's concession. Does the TSPEC fixture O-8 asks for change §4.1's declared defaults for that one test only, or does it construct a corpus in which the count cut binds under the shipped defaults? The first is the cheaper fixture; the second is the stronger oracle. Worth stating the preference where TSPEC will read it. |

Q-10 (where the configuration notice lives in the run report when no injection summary key is
present) and Q-11 (FSPEC's §3 traceability table has no AC-5.1c row) are carried forward from v5,
unanswered by this edit and not gating here.

## Positive Observations

- The F-20 fix took the harder and more honest route. The erratum could have deleted the offending
  clause and left §1.2 silent; instead it replaced the false mechanism with a positive statement of
  what HEAD's enumeration does reach, so C-3, AC-2.6 and §1.2 now make the same testable claim from
  three angles rather than one making a claim the other two contradict.
- AC-3.2 now carries three inline-enumerated catalogues and an explicit non-member (truncation),
  which makes all three set-equality tests derivable from the REQ with no FSPEC round trip — and
  makes a deleted member fail, which is the point of set-equality over containment.
- O-8 is the right shape for a coverage gap that the REQ cannot itself close: it names the reason
  the default-threshold corpus cannot exercise `RSN-COUNT`, names who owes the fixture, and leaves
  no AC weakened. A reason id with no realistic fixture is exactly the kind of catalogue member that
  silently never gets asserted; this one now has an owner.
- The delta is small, targeted and internally consistent with the AC bodies it touches. Nothing in
  the edit re-opened an approved section, and the erratum's three re-measured HEAD claims still hold
  against `consolidate-learnings.js` at this commit.

## Recommendation

**Approved with minor changes** — v5's High (F-20) is resolved and no new High is open. F-24 and
F-25 are a single one-phrase precision fix in §1.2/C-3 and can ride the next ordinary revision or a
targeted erratum; neither changes an acceptance criterion or a test oracle.

## Delta-confirmation tags

FINDING: Medium | delta | local | §1.2 claim 2 | The replacement depth phrase is inaccurate on its plain reading for the `docs/completed/{feature}/` shape, which sits two directory levels under `docs/`; no oracle is wrong because AC-2.6 states that case independently.
FINDING: Low | inherited | nonlocal | AC-2.6 / C-3 | AC-2.6 justifies the discarded-depth exclusion from "C-3's enumeration not reaching that depth", but C-3 contains no depth statement.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:c13aab67f31e8c42df9b9809d2c3f571148be02407a8658a915ab375a693dfae
APPROVAL-HASH-NORMALIZED: sha256:2f38768ce8b63f13085185bd71b6d4cc216b8bd0a188305f599e4f23d6d8bc21
REVIEWED-COMMIT: bc603aa0cec3516c0d9af6ac417a8d914db879a7
