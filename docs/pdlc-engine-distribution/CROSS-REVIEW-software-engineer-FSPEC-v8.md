# Cross-Review: software-engineer — FSPEC (delta round 8)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 8
**Scope:** Delta over `a57e0547` (the v7-reviewed commit) → HEAD. `git diff` is 40 insertions /
15 deletions, entirely inside §5.1 (`06181c07`): the check table gains a **PR-gate file** column
and **row 6** (`fixture-machine.yml`), BR-7.1 widens to plural PR-gate files with a *derived* file
scope, BR-7.5 gains a trigger-not-filename clause, and a new **BR-7.7** is added. Nothing else in
the document moved. Sections settled in rounds 1–7 are not re-litigated. Frozen round: only
delta-introduced defects or contradictions with HEAD can block.

## 1. Disposition of v7's four items

| v7 item | Resolved? | Evidence |
|---|---|---|
| **F-01** (Medium) AT-1.6's three-way equality should name the structured triple, not banner text | **No — untouched** | The delta does not enter §8's AT-1.x block. Still open, still not gating: PROP-LAUNCH-5 carries the content downstream. Carried forward below as F-05. |
| **F-02** (Low) re-grounding record misdates the upstream move | **No — untouched** | `:9`/`:26-27` unchanged. Carried forward as F-06. |
| **F-03** (Low) `E-22`/`BR-8.2` still say "workflow modules" after the §5.2 rename | **No — untouched** | `:571`, `:653` unchanged. Carried forward as F-07. |
| **F-04** (Low, Cross-Feature) prose residue of the deleted literal in PLAN/PROPERTIES titles | **Not verified this round** | Out of the delta; PLAN/PROPERTIES not re-read. Left standing, non-gating. |

None of the four was High; none blocked v7's approval and none blocks now. The round was spent on
CODE_REVIEW v1's §3-1/§3-2 findings instead, which is the right ordering — those were the ones
with a live oracle hole behind them.

## 2. The delta, checked against HEAD

Every load-bearing claim the new text makes about the repository is true at HEAD:

- `.github/workflows/fixture-machine.yml` exists and declares `on: pull_request` with paths
  `pdlc/engine/**` and `.github/workflows/fixture-machine.yml` (`fixture-machine.yml:18-22`) —
  so §5.1's "triggers `on: pull_request`… path-filtered" is exact, both halves.
- Row 6's authored and rendered strings are identical because the job `name:` carries no
  interpolation: `fixture-machine.yml:43` is literally
  `Fixture machine (install/upgrade, launcher, container, two-repo)`. The two columns agreeing is
  a fact, not a transcription slip.
- The file has exactly one job (`fixture-machine`, `:42`), so a one-row entry is the whole file.
- **BR-7.7's premise is real.** `publish.yml`'s gate job now carries the fixture-machine legs
  itself — `Launcher real-spawn legs` (`publish.yml:170-172`), `Fixture-machine legs`
  (`:174-176`), skip validation (`:178-180`) — alongside the five `pr-tests.yml` command legs
  (`:59-131`). The rule is describing a state the tree is already in, not an aspiration.
- **BR-7.7's trace is exact.** Row 6's legs carry AT-2.3…AT-2.6, and those rows map to AC-2.2,
  AC-2.3, AC-2.4, AC-2.5 respectively (`FSPEC:737-748`). The parenthetical is correct
  member-for-member, not approximately.
- The derived file scope BR-7.1 now demands is carried in code, not only in prose:
  `pdlc/engine/__tests__/ci-arrangement.test.js:90-102` reads each file's top-level `on:` block,
  `:492-519` set-equals `fixture-machine.yml`'s job names against §5.1's rows, `:546` mutates a
  job name and requires red, `:559-562` asserts the trigger-not-filename reading of BR-7.5, and
  `:662-698` asserts the publish/PR-gate run-command union that BR-7.7 states.

**The correction itself is right, and the reasoning recorded for it is the valuable part.** The
old text excluded row 6 on BR-7.5's strength, and BR-7.5's reason ("gates no pull request") is
true of `publish.yml` and false of `fixture-machine.yml`. §5.1 now says exactly that, in those
words, and then removes the recurrence by making membership a *derived* property of the trigger
rather than a remembered list of filenames. A rule that can be misapplied once will be
misapplied again; converting it into an enumeration-plus-set-equality over `.github/workflows/`
is the fix that survives the next new workflow file.

**Nothing settled earlier was broken.** No `AC-` trace, `BR-` outside the 7.x block, `E-` row,
§5.2 class, count, or AT criterion changed. §5.2's 23/24 arithmetic is untouched and still agrees
with TSPEC §5.4.

## 3. Findings

No High findings. The delta is factually accurate at HEAD and improves the oracle it touches. Two
Mediums are seams the delta opened and did not close; three are v7 carry-forwards.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | **Row 6 is path-filtered, and F-5 step 2 says an absent member fails the gate — the two sentences read in opposite directions.** §5.1 now says row 6 "is a required check on the PRs it runs on and absent from the others" (`:486-488`), while F-5 step 2 still says every §5.1 member must be green and "if any member fails, or is absent, or did not run: nothing is published" (`:256-258`), and §5.1's opening still says the rendered column is "what a branch protection rule names" (`:469`). A branch-protection rule naming a path-filtered check leaves every non-engine PR pending, which is the classic form of this hazard. It is **Medium, not High, because BR-7.7 dissolves the tag-time half**: `publish.yml`'s gate re-runs row 6's commands unconditionally (`publish.yml:158-180`), so "green on the tagged commit" is achieved by re-running, never by polling an absent check. What is missing is one clause naming the PR-side treatment of a member that did not run (absent-because-path-filtered ≠ did-not-run-because-broken). | §5.1 (`:486-488`, `:469`), F-5 step 2 (`:256-258`) |
| F-02 | Medium | Local | **Two new obligations arrived without an acceptance-test row.** BR-7.1's derived file scope ("the carrier enumerates `.github/workflows/` and set-equals the PR-triggered files against §5.1's file column", `:498-501`) and all of BR-7.7 (`:532-538`) are new, and AT-3.4 (`:769-775`) is unchanged: it still asserts only the two name alphabets plus the E-19/E-29 mutations, over "fixture copies of the workflow file" (singular). Both obligations *are* carried in code (`ci-arrangement.test.js:559-562`, `:650`, `:662-698`), so this is a document-side traceability gap, not an unimplemented rule — but §8 is where this FSPEC declares what proves what, and a rule with no AT row is one nobody re-derives after the carrier is refactored. One sentence appended to AT-3.4 plus one new row for BR-7.7 closes it. | BR-7.1 (`:498-501`), BR-7.7 (`:532-538`), AT-3.4 (`:769-775`) |
| F-03 | Medium | Local | **The edit landed without a version bump or a changelog entry.** The header still reads Version **0.7**, date 2026-08-14 (`:16`), and 0.7's changelog entry closes with "No criterion, count, or oracle changed" — a true statement about round 6 that a reader now sees sitting above a table with a sixth row and a seventh rule in it. §5.1's body dates its own change ("row 6 added 2026-08-16", `:466-467`), so the information exists; it is the document's own change record that does not carry it. Given §5 opens by declaring these sets change-controlled ("changing the set here is a spec change that goes through review", `:462-463`), the changelog is the mechanism that claim relies on. | header (`:16`), 0.7 entry, §5 preamble (`:462-463`) |
| F-04 | Low | Local | **BR-7.7 is inserted between BR-7.5 and BR-7.6**, so the block reads 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.6 (`:526-544`). Appending after BR-7.6 costs nothing and keeps the list scannable; ids are stable either way, so this is presentation only. | §5.1 rules block (`:526-544`) |
| F-05 | Medium | Local | *(carried from v7 F-01, unchanged)* AT-1.6 asks that the query output's version triple equal the banner triple (`:694-697`), but at HEAD `buildBanner` renders the plugin member with an unconditional `v` prefix (`handshake.mjs:209`), so a literal-text comparison yields `vnot found` against `not found`. One clause naming the structured triple as the compared surface removes a red test that is not a defect. | AT-1.1 (`:678-681`), AT-1.6 (`:694-697`) |
| F-06 | Low | Local | *(carried from v7 F-02, unchanged)* The re-grounding record dates the REQ v0.10→v0.11 move to 2026-08-14 (`:9`, `:26-27`); `01c27ee4` is committed `2026-08-13 22:07:05 -0700`. Nothing depends on the date. | `:9`, `:26-27` |
| F-07 | Low | Local | *(carried from v7 F-03, unchanged)* §5.2's class is now "Workflow members" because `PK-22` is a JSON manifest, but `BR-8.2` (`:571`) and `E-22` (`:653`) still say "workflow modules" — the same ambiguity the rename removed, left in the two places that govern behaviour. | `:571`, `:653` |

DEFERRED: F-5's "`.github/workflows/` holds exactly one file (`pr-tests.yml`)" (`:252`) is false at HEAD — the directory holds `pr-tests.yml`, `fixture-machine.yml`, `publish.yml` — but it is an authoring-time HEAD seed for a flow this feature has since implemented, not a live claim, and rewriting HEAD seeds mid-implementation is how seeds stop meaning anything.
DEFERRED: `fixture-machine.yml:5-8`'s header comment still calls `pr-tests.yml`'s "five rendered check names … BR-7.5's contract"; §5.1 now makes that file a sixth member. Code-comment residue, one sweep on the next touch of that file, no behaviour behind it.
DEFERRED: `docs/_constraints/pdlc-engine-baseline.md:189`'s M-ENG-10 title still reads "The PR gate is five required checks". It is a *dated measurement* at `89babe8e` and remains true of that commit, and §9's Q-7 already owns the baseline's change-control tail with a bounded expiry — no second erratum needed for the same sentence.

## 4. Questions

| ID | Question |
|----|----------|
| Q-01 | When a PR touches nothing under `pdlc/engine/**`, row 6 produces no check at all. Does Phase PUB's poll treat an absent member as "not yet green" (blocking) or as "not applicable"? F-01 asks for the clause; the answer decides whether row 6 can safely be named in a branch-protection rule at all, or only in §5.1's oracle. |

## 5. Positive Observations

- **The correction was made at the reason, not at the symptom.** The cheap fix was "add row 6".
  What landed also rewrote the rule that produced the omission, and then made the file scope
  derived so the next PR-gating workflow file cannot enter the repo without entering the table.
  That is the difference between closing a finding and closing the class it came from.
- **BR-7.7 names a gap that had no finding of its own.** BR-3.1 has claimed since round 1 that
  publishing is gated on the same evidence a PR is; that claim quietly became false the moment a
  second PR-gate file existed and `publish.yml` copied only the first file's commands. Stating the
  union as a set-equality asserted by the same offline carrier keeps the two files in step by a
  test rather than by memory — and the tree already satisfies it.
- **Every citation in the delta checks out.** Trigger, path filter, job count, job name, the
  AT-2.3…AT-2.6 → AC-2.2…AC-2.5 mapping, and the publish-side legs were each read at HEAD, not
  taken on the document's word.
- **The new prose records why the old reading was wrong**, in one sentence, in the place the next
  reader will be standing. Errata that leave no trace of their own reasoning get re-litigated.

## 6. Recommendation

**Approved with minor changes**

The delta is correct, verified against HEAD line by line, and strictly strengthens the §5.1
oracle. No High findings: nothing previously approved was broken, and no claim in the changed
text contradicts the repository. F-01 and F-02 are the two seams worth closing on the next touch
of this document — a clause on the PR-side treatment of a path-filtered member, and AT rows for
BR-7.1's derived file scope and BR-7.7 — and F-03 wants the change record to carry the change.
None of the three costs a round.

One upstream defect is raised as an erratum rather than folded in here: REQ `O-B` still states the
PR gate **is five** required checks, which §5.1 now contradicts by design.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 3}

APPROVAL-HASH: sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4
APPROVAL-HASH-NORMALIZED: sha256:e2e799b4df6c22afee2d7521fc59e0ab47731b0665dc715ce93d8ed97397e326
REVIEWED-COMMIT: 5910f0c2a6da3dc95e403644c9e9c3edf3bd45f9
UPSTREAM-STATE: REQ sha256:6fc7a382654a530e553721e9995a94f4406248b813768cc18da1c4a3cabcf51a
