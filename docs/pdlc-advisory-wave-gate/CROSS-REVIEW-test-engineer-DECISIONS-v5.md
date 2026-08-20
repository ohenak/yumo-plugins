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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The re-derived enumeration is framed as "a count of what still moves", but three of its five transcriptions do not move.** The bullet closes with "the reason the enumeration above is stated as a count of what still moves, not as a file list to walk". Measured at HEAD, only one non-production site carries an oracle that can drift from `ENVELOPE_DEFAULTS`: `advisoryEnvelope.test.js:284`'s set-equality against the exported constant. The other envelope literals are **inputs, never assertions** — `advisoryDisabled.test.js:136` is a locally-declared `disabledConfig()` fixture whose own header says it deliberately keeps one local literal and is "never imported from a canonical double"; `advisoryDisabled.test.js:623` and `advisoryHarvest.test.js:203` are config JSON fed to the code under test; `advisoryDoubles.js:325`/`:423` are a double's shape and a generator's shuffle. Grepping `envelope` across those two test files returns only those input sites plus `advisoryDisabled.test.js:696`'s `["not-a-real-code"]` — no comparison against the production constant anywhere. When `ENVELOPE_DEFAULTS` gains `E-5`/`E-6`, all five stay green and none *needs* editing. Upstream agrees: TSPEC §1.3's `ENVELOPE_DEFAULTS` change row names only `orchestrate-dev.js` "asserted in `advisoryEnvelope.test.js`", and lists none of these five. They are genuine hand-*copy* surfaces (a later editor can find them stale), which is a real maintenance argument and the one the following bullet about the shared double actually rests on — but that is a different claim from "still moves", and an implementer sizing A6 off this sentence would budget five edits that no gate asks for and that would silently re-scope three fixtures | "What follows is the whole feature", envelope-literal bullet |
| F-02 | Low | Local | **"Both assert against a production default that still has four members" is true of one of the two sites, not both.** `advisoryEnvelope.test.js:284` does assert `[...ENVELOPE_DEFAULTS].sort()` equals the six-member list against `orchestrate-dev.js:1942`'s four-member export, so it is red against production today. `advisoryConfig.test.js:51`'s six-member envelope sits inside a re-declared local `ADVISORY_DEFAULTS`, and nothing asserts that value: PROP-CFG-01 asserts the *key set* (`advisoryConfig.test.js:104-106`), the `waveBudgetPerRun` value (`:111`), and key-set equality against `parseAdvisoryConfig(null)` (`:117`) — the envelope member list is never compared to anything. It is an un-oracled transcription, which is why §1.3 records that file's drift row against `waveBudgetPerRun`, not against the envelope. The bullet's conclusion (a reader arriving expecting a four-member literal to edit finds the target value already in place) survives the correction for both sites | "Two envelope sites are already at the post-A6 six-member value" bullet |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 and F-02 both reduce to one distinction the enumeration does not currently draw: a literal that an **oracle** compares against production (one site, red today) versus a literal a later editor must **read and copy** (six sites, green forever). If the next edit to this file separates the two counts, does the "sequence the shared-double edits together" conclusion still need the seven? My reading is that it does — the coupling argument is about an editor finding a stale copy, which is exactly the six — so the conclusion survives the split and gets cheaper to defend. Worth one clause if the file opens again; not worth a round. |

## Positive Observations

- **The engine-channel bullet stopped restating expiring state, and said why.** Two of my four v3
  findings and one of my two v4 findings existed only because this record transcribed upstream
  *coverage status* that upstream then changed. The delta's "This record deliberately stops
  restating that status … whether the early-landed edits are reverted or PLAN's batches are
  re-derived around them is PLAN's call" removes the recurring cost at its source rather than paying
  it again. The v4 durable observation was that the cost was not one-off; this is the structural fix
  for it, and it arrived without being filed as a finding.
- **The ordering correction is falsifiable and I falsified it in the intended direction.** "Authored
  and red" is a claim a reviewer can execute, and executing it reproduced the exact stated cause
  (missing `advisory` section, assertion at line 29). Compare the v1.2 phrasing it replaces —
  "requires no engine edit to stay green" — which was equally checkable and was wrong. The record
  now states repo claims in a form that fails loudly when it goes stale rather than reading
  plausibly forever.
- **The resolution-vintage convention is worth more than the date it was written to explain.** A
  finding is resolved against upstream *at the time of the edit*, and where that differs from the
  version the finding cited, the resolving text names the version it landed on. Three of my last
  five findings were pure cascade artefacts. This convention converts the next such cascade from a
  finding into a sentence, and the engine-channel and O-8 passages already demonstrate it.
- **Both repointed citations were mis-anchors, not style nits.** §5.5 does not contain the
  argv-sequence oracle and §7 does not contain the AT-04-5 mapping row; a reader following either
  would have landed on prohibitions and open questions respectively and concluded the oracle did not
  exist. Repointing to §5.2 and §5.6 restores one-hop checkability, which is the only property that
  makes a coverage claim in a decision record reviewable at all.

## Consequences

- No High finding, old or new, so DECISIONS is not blocking on this lens. Both recorded findings are
  narrow corrections to a sizing enumeration whose conclusion — sequence the shared-double edits
  together — holds under either reading.
- Neither F-01 nor F-02 earns its own round. Both live in the same bullet pair and both resolve in a
  single clause; they should ride the next edit that opens this file, which the envelope literal's
  own migration to six members during implementation will force anyway.
- One thing PLAN and the implementing task should take from F-01 rather than from this record: the
  only envelope oracle that fails on drift is `advisoryEnvelope.test.js:284`. If the intent is that
  the five copies *cannot* silently drift, that is a test the feature does not have — a single
  assertion that every transcribed envelope literal is set-equal to the exported constant would
  convert six hand-copy surfaces into one oracle. That is a PROPERTIES/TSPEC call, not a DECISIONS
  one, and I am not filing it here.

## Recommendation

**Approved with minor changes.**

Both v4 findings are resolved without weakening any claim: the envelope enumeration is re-derived
from HEAD and now closes arithmetically, and the date correction carries the note it was owed plus a
convention that prevents the next cascade from becoming a finding. The delta's two citation repoints
land on sections that actually carry the cited oracles, and its one new repo claim — the engine
expectation authored and red — reproduces on execution with the stated cause. No open High finding,
old or new. Two non-gating findings are recorded against the same bullet pair; both resolve in a
clause and should ride the next edit that opens the file.

## Verdict

FINDING: Medium | delta | local | "What follows is the whole feature", envelope-literal bullet | enumeration is framed as "a count of what still moves", but only `advisoryEnvelope.test.js:284` compares the literal against production; the five transcriptions are inputs (`advisoryDisabled.test.js:136`, `:623`, `advisoryHarvest.test.js:203`, `advisoryDoubles.js:325`, `:423`) that stay green when `ENVELOPE_DEFAULTS` grows, and TSPEC §1.3 lists none of them.
FINDING: Low | delta | local | "Two envelope sites are already at the post-A6 six-member value" bullet | "Both assert against a production default that still has four members" holds for `advisoryEnvelope.test.js:284` only; `advisoryConfig.test.js:51`'s envelope value is never asserted (PROP-CFG-01 asserts key set at `:104-106`, `waveBudgetPerRun` at `:111`, key-set equality at `:117`).

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
