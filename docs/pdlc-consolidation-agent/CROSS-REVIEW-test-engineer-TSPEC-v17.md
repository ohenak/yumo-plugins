# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v2.7)
**Date:** 2026-08-10
**Iteration:** 17
**Scope:** Delta confirmation only — erratum commit `e192d6e7` (two stale HEAD claims raised by te-review v15/v16). Not a re-review of the document.

## What changed

`git show e192d6e7` touches four hunks and nothing else: the version row (2.6 → 2.7) plus a v2.7 erratum note, §3.2's `CLAUDE.md` row, §8.3's manifest-ids clause, and §12.2's `CLAUDE.md` enumeration row. No oracle, decision, level assignment, register id or scope changed.

## Verification of both errata against HEAD

Both re-anchored claims were checked against the tracked files, not against the document's own prose.

| Claim (as now written) | Check run | Result |
|---|---|---|
| §3.2: "HEAD carries five bullets at `CLAUDE.md:58-62` and the count-free sentence 'These are the tracked, shipped outputs.' at `:64`" | read `CLAUDE.md:50-66` | Confirmed exactly — bullets occupy 58–62, sentence sits at 64, verbatim |
| §3.2: landed in `927ecd15` (T33) | `git show --stat 927ecd15` | Confirmed — commit touches `CLAUDE.md` and `consolidationBuild.test.js` |
| §3.2/§12.2: baseline was `:58-60` enumerated, `:62` counted, three of four tracked paths | `git ls-files pdlc/workflows/dist/` | Confirmed — five tracked paths at HEAD, four at baseline; `pdlc-cli.mjs` was the unadvertised one |
| §12.2/§8.3: `rows[].id` at HEAD is `consolidate-learnings`, `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` — four rows, none the manifest itself | parsed `HEAD:pdlc/workflows/dist/distribution-manifest.json` | Confirmed, including the stated order |
| §12.2: "a fourth row needed no oracle edit" — set equality holds in both directions at HEAD | `npm test -- __tests__/consolidationBuild.test.js -t "T33"` | **Both cases green**: enumeration-minus-manifest ≡ `rows[]`, and manifest bundle rows ≡ `runtimeBundle.test.js`'s `BUNDLES` |

The last row is the one that matters for this lens. The erratum's substantive assertion is that the oracle was written as set equality against the manifest read at run time, so a fourth row is absorbed without a spec or test edit. That is not taken on the document's word here — the shipped case was executed at the four-row HEAD and passes, and the exclusion of `distribution-manifest.json` itself is still named rather than absorbed, so the case remains green-on-correct-code rather than green-by-structure.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | The superseded **v1.8** changelog entry (`:197-198`) still carries the pre-erratum phrasing in the present tense — "`:62` 'Those three' is already false at HEAD". v2.7's note re-anchors the live rows correctly, and changelog entries are by convention a record of what was believed at that version, so this is not a live citation and gates nothing. Noting it only so a later reader who greps `:62` finds the resolution rather than the stale claim; a parenthetical "(as of v1.8; see v2.7)" would close it, or it can be left as historical record | §1 changelog, v1.8 entry |

## Questions

None.

## Positive Observations

- The re-anchoring separates baseline from HEAD explicitly in both places rather than deleting the baseline history — the rationale for *why* the edit took the count-free shape (rather than `three` → `four`, stale again on the next artifact) survives, which is the part a future maintainer needs.
- §8.3 was re-anchored in the same pass, so the three-id claim does not survive in a second location. The erratum found its own sibling; that is the failure mode these rounds usually miss.
- The erratum is genuinely citation-only. It edits location text, not oracles — which is exactly the bounded shape an erratum round is supposed to have, and it kept the shipped test untouched because the test never needed touching.

## Recommendation

**Approved with minor changes**

The delta resolves both raised errata and breaks nothing previously approved. No oracle, level assignment, register id or set-equality bar moved; the one Low finding is a superseded changelog line with no downstream reader.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
