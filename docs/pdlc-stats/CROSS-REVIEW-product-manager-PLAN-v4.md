# Cross-Review: product-manager — PLAN (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.2)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v3.md` (`REVIEWED-COMMIT: 8ed55ead`)
**Date:** 2026-08-31
**Iteration:** 4

## Overview

**Scope of this round.** Frozen delta re-review. The PLAN moved v1.1 → v1.2 in
`8ed55ead..HEAD` (58 insertions, 47 deletions) to address `CROSS-REVIEW-test-engineer-PLAN-v2.md`
(te F-01…F-05). Per the freeze, I re-read only the changed regions and asked two questions of each:
did this edit break something that worked, and does any load-bearing claim it lands contradict the
repository at HEAD? I did not re-litigate approved sections, and I did not open new product
questions.

**Changed regions.** Five, all local to the edit: (1) the changelog gains a v1.2 row; (2) the
Overview's standing-cost premise narrows `document-oracles.mjs`'s consumer set to
`documentOracles.test.js` alone; (3) T-09 gains a symbolic-link leg on the shipped seam and T-10's
`lstat`-not-`stat` conjunct gains a boundary-anchored matcher; (4) T-21, T-23 and T-24 take verbatim
transcriptions and the same consumer narrowing; (5) the File Ownership Manifest gains a `Batch(es)`
column so every `File` cell is a bare path. One further cell moved outside the te routing: T-08's
Status flipped `⬚` → `✅`.

**Answer.** The revision holds. No acceptance criterion is narrowed, dropped or reinterpreted; the
one net-new coverage claim (T-09's EC-19 leg) *adds* product fidelity rather than trading it. Every
repository claim the edit lands is true at HEAD — I checked all six by measurement, including the
T-08 status flip, which is a truthful ledger update and not a premature tick. No High findings.

## Verification

Each claim below was measured at HEAD, not read from a document.

| Claim landed by the edit | Measured | Verdict |
|---|---|---|
| `document-oracles.mjs` is **imported** only by `documentOracles.test.js`; `advisoryWaveGate.test.js` merely names it in a comment at `:140` | `grep -n document-oracles pdlc/workflows/__tests__/advisoryWaveGate.test.js` → one hit, line 140, inside a `//` comment; no import statement | **True.** The narrowing is more accurate than v1.1's "consumed only by … and …". |
| `bin/cli.mjs` at HEAD contains neither `statSync` nor `lstatSync`; its only `fs` predicate is `fs.existsSync` (`pdlc/engine/bin/cli.mjs:262`) | `grep -o "fs\.[a-zA-Z]*" pdlc/engine/bin/cli.mjs \| sort -u` → `fs.existsSync` only; the sole `statSync`-family hit in the file is that same line 262 | **True**, line anchor exact. This is what licenses T-10's whole-file, unqualified assertion. |
| The naive `source.includes("statSync")` matcher is unfalsifiable because `lstatSync` contains `statSync` | Substring containment; `/(?<![A-Za-z])statSync\s*\(/` rejects `lstatSync(` and accepts `statSync(` | **True.** The matcher is correctly boundary-anchored on the left, and `\s*\(` pins it to a call. |
| `assertAdditiveOnly`'s message is verbatim `` `${label}: delta over baseline must be exactly the two new members, got ${JSON.stringify(actual)}` `` | `pdlc/engine/__tests__/loop-distribution.test.js`, message string at line **77**; the `assert.equal` statement spans **74–78**; the function opens at 66 | **Quoted text exact**; the cited range `73-77` is off by one at both ends (F-03). |
| The second P9-02 test is titled "P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)" at `coverageInstrumentation.test.js:278` | Line 278 is exactly that `test(` call; the driver `import()`s `loop-session.mjs` and `escalation-view.mjs` as the PLAN says | **True**, anchor exact; the transcription adds backticks the source string does not carry (F-02). |
| T-08 is `✅` Done | `statsAntiDrift.test.js` is tracked and landed in `e6bf3d36b` ("T-08 — 🔴 Anti-drift reds"); the status key at `PLAN-pdlc-stats.md:86` reads `✅ Done` | **True.** Only T-01 and T-08 carry `✅`, and both have artifacts on the branch. Not a premature tick. |
| Manifest `Batch(es)` values | Compared cell-by-cell against the task table's `Batch` column for all 27 tasks | **Consistent**, including T-12…T-16 at 3/4/5/6/7 and the batch-9/10/11 tail. |
| v1.2's changelog: "`CROSS-REVIEW-product-manager-PLAN-v2.md` filed no findings — `VERDICT: Approved`" | v2 file: "No findings." plus `VERDICT: Approved` / `{"high": 0, "medium": 0, "low": 0}` | **True.** |
| T-09's new leg is faithful to EC-19 | `FSPEC-pdlc-stats.md:580` — EC-19 requires "the size of the **link itself**, not of its target"; `:923` maps EC-19 → AT-15 | **Faithful.** The leg asserts the link's own size on the production path; no reinterpretation. |

## Findings

Tagged per the delta protocol: **Provenance** (`delta` = this round's edit introduced it;
`inherited` = already in the pre-round bytes) and **Locality** (`local` = inside a section this edit
changed; `nonlocal` = anywhere else). `Scope` is the harvest routing tag.

| ID | Severity | Provenance | Locality | Scope | Finding | Requirement ref |
|----|----------|-----------|----------|-------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | Local | The Residual-risks row asked for in v3's F-01 is still absent. `Residual risks carried into implementation` (`PLAN-pdlc-stats.md:382-385`) carries RK-5's leading-underscore predicate as the one provisional-erratum row, but not TSPEC §8.3's **second** open erratum — REQ-STATS-06 v1.6's "grammatical basename outside the driver's catalogue" versus FSPEC BR-16 v1.7's `harvested` directory — whose blast radius is `computeFeatureStats`'s harvested disjunct plus T-04's AT-17 fourth-leg expected value. The DoD reviewer inherits one named open erratum where TSPEC says there are two. Non-gating and unchanged in severity from v3: no criterion is dropped, TSPEC §4.3 already directs the interim choice (implement BR-16), and every task stays executable as written. | TSPEC §8.3, §4.3; FSPEC BR-16 |
| F-02 | Low | delta | local | Local | T-24 says the second P9-02 title is "transcribed verbatim" and prints ``"P9-02: the shipped c8 config resolves the two new `lib/` modules too (F4)"``, but the source string at `coverageInstrumentation.test.js:278` has no backticks around `lib/`. Everything else — wording, `the shipped`, `(F4)` — now matches exactly, so this is the last millimetre of te F-04, not a re-opening of it. Since the shipped assertion the implementer will edit compares the title *string*, the transcription should print the bare characters. | te F-04 (round 2), TSPEC §6.4 |
| F-03 | Low | delta | local | Local | T-23's new verbatim quote of `assertAdditiveOnly`'s message is exact, but its anchor `loop-distribution.test.js:73-77` is off by one at both ends: line 73 is the closing `}` of the preceding loop, the `assert.equal` statement spans 74–78, and the message literal itself is line 77. Cite `:77` for the string, or `:74-78` for the statement. Style/precision only, per DEC-DOC-01. | DEC-DOC-01 |

FINDING: Medium | inherited | nonlocal | `## Residual risks carried into implementation` (PLAN:382-385) | TSPEC §8.3's second open erratum (REQ-STATS-06 v1.6 vs FSPEC BR-16 v1.7, blast radius = harvested disjunct + T-04's AT-17 fourth-leg expected value) is still not carried as a residual-risk row; only RK-5's provisional predicate is.
FINDING: Low | delta | local | T-24, second P9-02 title transcription | Claimed verbatim, but adds backticks around `lib/` that the source string at `coverageInstrumentation.test.js:278` does not carry.
FINDING: Low | delta | local | T-23, `assertAdditiveOnly` message citation | Quoted text is exact; the anchor `loop-distribution.test.js:73-77` is off by one at both ends (message literal is `:77`, statement `:74-78`).

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried, still non-gating: v1's Q-01 (the precedent for amending an archived feature's frozen specs, T-22) and Q-02 (REQ-STATS-07's unqualified "fails" versus FSPEC EC-10/BR-26's `unclassified` runtime reporting). v1.2's changelog now explicitly routes these to harvest and the erratum channel, which is the disposition I asked for — nothing further is owed in this round. |
| Q-02 | T-08's Status is `✅` while the PLAN it sits in is still converging. That is truthful (the suite landed in `e6bf3d36b`) and I am not raising it as a finding, but it means the PLAN is now simultaneously a spec under review and a live ledger. Worth an operator decision at harvest about whether status ticks should ride in on document-revision commits (`5962eedb0` carried this one under a te F-03 subject line). |

DEFERRED: Add the second-open-erratum row to the Residual risks table (F-01) at the next PLAN touch or in DoD hand-off — carried from v3, non-gating.
DEFERRED: Strip the added backticks from T-24's "verbatim" P9-02 title (F-02) and re-anchor T-23's message citation to `:77` (F-03).
DEFERRED: Decide at harvest whether task-Status ticks belong in document-revision commits (Q-02).

## Positive Observations

- **te F-02's fix is the strongest edit in this round, and it is a product win, not just a test-hygiene one.** The old conjunct ("`bin/cli.mjs`'s source contains no `statSync` call in the `stats` seam") could never have failed: `lstatSync` contains `statSync`, so the naive matcher matches the *correct* implementation. EC-19 — a symlink must not inflate a feature's byte total — would have shipped with an oracle that was green by construction. The new text does three things well: it names the exact matcher, it says in-line *why* the naive form is unfalsifiable, and it drops the undelimited "in the `stats` seam" qualifier by first measuring that HEAD's `bin/cli.mjs` has no `statSync`-family call at all (`:262` is `fs.existsSync`). The boundary is measured, not asserted.
- **T-09's new leg closes the gap between "the helper counts links correctly" and "the product counts links correctly".** EC-19's user-visible promise is that a symlink into a large document cannot inflate a feature's byte ratio by orders of magnitude (`FSPEC-pdlc-stats.md:580`). Before this edit the only behavioural evidence ran over T-02's `realStatsIo()` — a helper this same PLAN asks the implementer to write — with T-10's conjunct source-level on top. A correct helper plus a `statSync` shipped seam passed both. Running the leg through `main()` on the production `statsIo` under `--cwd` puts the assertion on the artifact the user actually gets, and the PLAN says exactly that in the row ("A `statSync` implementation of `statsIo().fileSize` reds here"). That is DC-07's builder-not-wired discipline applied without being asked.
- **The manifest fix chose the right shape.** Disambiguating five `stats.mjs` rows by appending prose to the path would have broken any grouping pass keyed on the `File` column — the very consumer the manifest exists for. Adding a `Batch(es)` column and restoring bare paths fixes it structurally, and the new "Reading the table" note tells the next feature to add a column rather than decorate a path. That note is the reusable part; I would expect it to survive into harvest.
- **The consumer narrowing was made in all three places at once.** `document-oracles.mjs`'s "imported only by `documentOracles.test.js`" now reads identically in the Overview premise and in T-21's promoted constraint text, with the `advisoryWaveGate.test.js` comment-not-import distinction spelled out in both. A worked exclusion that will be pasted into `DOMAIN-CONSTRAINTS.md` had to be exactly right, and it now is.
- **The changelog does not overclaim.** It states that pm v2 filed no findings and cites the verdict; that is true to the byte. It also disposes of the two open pm questions rather than dropping them silently.

## Recommendation

**Approved with minor changes.**

The round-2 revision breaks nothing and lands no false claim. Measured against HEAD, all nine
load-bearing repository claims introduced or touched by the edit are true, two of them exactly
where they say they are; the two Low findings are a stray pair of backticks and a line anchor off
by one, neither of which changes what an implementer does. The one Medium is inherited from v3 and
unchanged — it is a hand-off completeness gap in the Residual-risks table, not a fidelity break, and
it blocks no task.

On product fidelity, which is my only lens: no acceptance criterion carried by this PLAN has been
narrowed, reinterpreted or dropped by the revision, and the AC coverage table gained a row rather
than losing one. EC-19/AT-15 is the criterion the round actually moved, and it moved from
helper-level evidence to evidence on the shipped seam — strictly closer to what REQ and FSPEC
promise a user.

Changes to make, none gating, at the next PLAN touch:

1. Add the second-open-erratum row to the Residual risks table (F-01).
2. Drop the backticks from T-24's verbatim title (F-02); re-anchor T-23's citation to `:77` (F-03).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:87b439eafbb04c37b9f4419fec1d8bc3f9166e51ec91bcd6e70384ac1c3d0baf
APPROVAL-HASH-NORMALIZED: sha256:ffcff5ae7787002783194f1bb62999ea8a9b801abf1ecf131f243555c3a3c133
REVIEWED-COMMIT: 9c56d0c5d4a6088728ef47160df3bbf99a541d02
UPSTREAM-STATE: REQ sha256:5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8
UPSTREAM-STATE: FSPEC sha256:c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
UPSTREAM-STATE: DECISIONS sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
