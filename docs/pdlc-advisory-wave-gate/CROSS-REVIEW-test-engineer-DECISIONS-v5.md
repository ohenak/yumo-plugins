# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.3)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v4.md` (v1.2)
**Delta reviewed:** `9a569157..HEAD` (four commits, DECISIONS only)
**Date:** 2026-08-19
**Iteration:** 5

## Context

Both v4 findings were non-gating (one Medium, one Low), and the round that followed spent its four
commits on them plus two citation repoints and one status correction routed from the PM's v4. Scope
held to the delta: `git diff 9a569157..HEAD` touches this file only, 56 insertions and 27 deletions,
no decision line altered. I re-read only the changed passages and re-grounded every anchor they cite
against HEAD source rather than against the upstream documents' description of HEAD.

Four things in the delta are checkable, and I checked all four: the two repointed TSPEC citations,
the re-derived envelope enumeration, and the new engine-channel ordering claim — which is the one
statement in this round that asserts something about a *running* test rather than about a document.

## Options Considered

The delta's substantive choice was how to record a status that keeps expiring. v1.2 said the engine
channel's expectation was still ahead of the config edit; at HEAD the reverse holds. The author
could have re-stated the corrected status here (a third round of transcribing upstream state into
this record), or stated only what the decision fixes and named the carrier for the rest. The
revision takes the second option and says so in-line: "This record deliberately stops restating that
status: TSPEC §5.1's status caveat and §1.3 are the carriers of repo state for this feature." That
is the shape I asked for in v4's durable observation, taken without being asked for it directly.

## Decision

**Both v4 findings resolved. No open High finding, old or new.** Every anchor the delta adds or
repoints was re-verified at HEAD:

| v4 finding | Resolution | Verified against HEAD |
|---|---|---|
| F-01 (Medium) — envelope enumeration named a site that had already migrated and omitted the production definition | Enumeration re-derived from HEAD: one production definition, five test-side transcriptions, one prose comment; a new bullet names the two already-six-member sites explicitly as needing no envelope edit | `orchestrate-dev.js:1942` is the four-member definition; transcriptions at `advisoryDisabled.test.js:136` and `:623`, `advisoryHarvest.test.js:203`, `helpers/advisoryDoubles.js:325` and `:423`; the prose site is `advisoryDoubles.js:317`. Seven total, and the arithmetic (1 + 5 + 1) now closes |
| F-02 (Low) — v1.2 dated earlier than v1.1 with no note | v1.3 carries the note the correction was owed, and adds a resolution-vintage convention: a finding is resolved against upstream at the time of the edit, not the version the finding cited | Metadata table, `DECISIONS:9-21` |

Two citation repoints in the delta, both correct at TSPEC v1.10:

- The `-m`-less `commit-tree` passage moved its oracle citation from §5.5 to **§5.2**. §5.2 spans
  `TSPEC:1333-1467` and is where the argv-sequence assertion lives (`commit-tree === 1` plus an
  `update-ref` on the snapshot ref, `TSPEC:1383`, `TSPEC:1419`); §5.5 (`TSPEC:1520`) is the
  prohibitions section and never carried it. The repoint fixes a real mis-anchor.
- The AT-04-5 promotion-commit oracle moved from §7 to **§5.6**. `TSPEC:1659` is that row, and it
  identifies the commit "by the `message` literal and its pathspec" verbatim as quoted; §3.6 fixes
  the literal at `TSPEC:1039` ("the message is spelled here rather than left to Phase I"). Both
  halves of the sentence hold.

**The new engine-channel ordering claim is the strongest item in the delta, and it is true.** The
record now says the expectation "has already been authored and is **red**, precisely because the
example carries no `advisory` section yet". I did not take that on the document's word:
`pdlc/engine/__tests__/advisory-config-example.test.js` exists at HEAD, `.claude/pdlc.config.example.json`
carries exactly `dispatch` and `implementation` with no `advisory` key, and running the file
(`node --test __tests__/advisory-config-example.test.js`) fails at line 29 — the `typeof advisory
=== "object"` assertion — for one test, zero passing. The stated cause is the observed cause, not a
plausible one. `ci-arrangement.test.js` still contains zero occurrences of `advisory`, so the
"nothing relocates" evidence also holds, and the delta's rewrite correctly re-labels those two facts
as *evidence that nothing relocates* rather than as guidance about where the new expectation belongs
— which is what made the v1.2 phrasing readable as pointing at the wrong file.

## Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
