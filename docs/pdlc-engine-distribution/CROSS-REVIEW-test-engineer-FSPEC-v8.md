# Cross-Review: test-engineer — FSPEC (delta re-review, round 8)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 8

**Scope:** Delta over `a57e0547..HEAD` — a single hunk in §5.1 (commit `06181c07`):
row 6 (`fixture-machine.yml`) added to the required-check table, a new file column,
BR-7.1 rewritten to derive its file scope from the `on:` trigger, BR-7.5 amended,
BR-7.7 added. Frozen round: only delta-introduced defects and claims false at
repository HEAD can block. Not a whole-document re-review.

## Prior-finding disposition

| v7 finding | Severity | Disposition | Evidence |
|---|---|---|---|
| `F-01` v0.7 changelog's closing sentence stale (PLAN/PROPERTIES errata already discharged) | Low | **Open, untouched** | Delta did not enter the changelog at all. Now compounded — see `F-01` below. |
| `F-02` BR-8.2 still says "workflow modules" after the Workflow-**members** rename | Low | **Open, untouched** | `:571` unchanged in delta. Deferred, not re-litigated. |
| `Q-01` AT-3.8b's ".js/.json" reading | — | **Out of delta scope** | §5.2 not touched this round. |

## Delta verification (grounded at HEAD, not in documents)

Every load-bearing claim the delta makes about the repository holds:

- **Row 6 is real and transcribed exactly.** `.github/workflows/fixture-machine.yml:43`
  carries `name: Fixture machine (install/upgrade, launcher, container, two-repo)`,
  character-for-character §5.1's row 6 in both columns. Since the job declares no
  `strategy.matrix`, authored == rendered is correct, matching rows 3–5's shape.
- **The membership reason is true.** `fixture-machine.yml:18-22` declares
  `on: pull_request:` with `paths: ['pdlc/engine/**', '.github/workflows/fixture-machine.yml']`,
  so the "path-filtered, required on the PRs it runs on" sentence (`:486-488`) is a
  property of the trigger, exactly as stated. `publish.yml:11` is tag-triggered and
  correctly stays outside — BR-7.5's exclusion is narrowed to the trigger, not the
  filename, and is now true of every file it names.
- **BR-7.1's "file scope is itself derived, not listed" is mechanised, not asserted.**
  `pdlc/engine/__tests__/ci-arrangement.test.js:553-562` enumerates `.github/workflows/`,
  filters by `isPullRequestTriggered` (`:90-102`, reads the top-level `on:` block) and
  **set-equals** the result against §5.1's file column. A new PR-gating file entering the
  repo without entering the table is red — that is a set-equality over the full
  enumeration, not containment, which is what the round needed and what the old
  hard-coded single-file scope could never give.
- **BR-7.7's claim is carried by a test, and the test is green.** `publish.yml:151-186`
  carries the fixture-machine legs verbatim, and `ci-arrangement.test.js:666-698` asserts
  the run-command set-equality across `Object.entries(PR_GATE_FILES)` — the union of *all*
  PR-gate files, not `pr-tests.yml` alone. I ran the carrier:
  `cd pdlc/engine && node --test __tests__/ci-arrangement.test.js` → **28 pass, 0 fail**,
  including `T49 … gate-command set-equality` and
  `fixture-machine.yml is a §5.1 member (BR-7.1, CODE_REVIEW v1 §3-1)`.
- **No oracle was weakened.** AT-3.4's Then clause is unchanged and still reads "authored
  set equals §5.1's authored column and expanded set equals its rendered column" — set-equality,
  so row 6's deletion or rename now fails where before it was invisible. The mutation list
  (rename / delete / add / matrix-axis edit) and E-29's negative case (step-level and
  publish-job names leave the check green) are both preserved and both still carry a positive
  counterpart, so nothing became absence-only. The expected values remain literal
  transcriptions of the workflow files; the carrier's `PR_GATE_FILES` / `RENDERED` constants
  are transcriptions of §5.1, not derivations from the code under test.

The delta strictly strengthens the AC-3.4 oracle. That was the point of CODE_REVIEW v1 §3-1
and it landed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The delta changed a criterion without touching the version cell or the changelog.** The header still reads `Version 0.7 / 2026-08-14` (`:12`) and the newest changelog entry still closes "No criterion, oracle or count changed" (`:23`) — a sentence that was about round 6 but is now the last word in a document whose expected-check set went from five members to six, gained BR-7.7 and re-scoped BR-7.1/BR-7.5. Nothing downstream transcribes the version cell, so no test is wrong; but the approval anchors on v7 pin bytes that no longer exist, and the next reader diffing "what changed since I approved" is told nothing changed. Suggested fix: a `*0.8 (2026-08-16, CODE_REVIEW v1 §3-1/§3-2): §5.1 gains row 6 …*` entry and a version bump. | Header `:12`, changelog `:18-24` |
| F-02 | Medium | Local | **§3's F-5 baseline claim is now false at HEAD.** `:250` reads "Nothing of this kind exists at HEAD: `.github/workflows/` holds exactly one file (`pr-tests.yml`), so every step below is new work." At HEAD the directory holds three (`pr-tests.yml`, `fixture-machine.yml`, `publish.yml`), two of them added by this feature. Read as a dated observation of the pre-feature baseline it is harmless; read as a present-tense claim — which is how it is written, and how BR-7.1 four hundred lines later now contradicts it by enumerating the same directory — it is wrong. No oracle depends on it. Suggested fix: date it ("at feature start, `89babe8e`"). | §3 F-5 `:250` |
| F-03 | Low | Local | **BR-7.1's tail still speaks of one file after its head went plural.** The rule now scopes "the PR-gate workflow file**(s)**" but closes "**any addition** to the PR-gate file all fail" and "that file carries ~16" step names with `pr-tests.yml`-specific line anchors (`:504-509`). The anchors are still accurate for `pr-tests.yml`; only the singular reads as if the derived scope had not landed. | `:504-509` |
| F-04 | Low | Local | **Two new obligations landed without an §8 conjunct.** BR-7.1's derived-file-scope set-equality and BR-7.7's cross-file gate-command set-equality are both new this round, and AT-3.4 (`:769-774`) was not extended to name either — §8 still describes only the two name alphabets. Both are covered in-tree today (`ci-arrangement.test.js:553-562`, `:666-698`), so this is a spec-side traceability gap, not a coverage gap: a future verifier reading §8 alone would not know to write them. | §8 AT-3.4, BR-7.1/BR-7.7 |

DEFERRED: v7 `F-01` — the v0.7 changelog's closing sentence still names PLAN/PROPERTIES errata discharged in `8980ffe7`; fold into F-01's changelog edit.
DEFERRED: v7 `F-02` — BR-8.2 (`:571`) still says "workflow modules" after the Workflow-members rename.
DEFERRED: F-04's AT-3.4 extension — new rules could carry explicit Then conjuncts; no decision opened here, the carrier already asserts both.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Row 6 is path-filtered, so on a PR that touches no `pdlc/engine/**` file the check does not run at all. §5.1 says it is "absent from the others"; F-5 step 2 says a member that "is absent, or did not run" fails the publish gate (`:256-258`). At a tag, `publish.yml`'s `gate` job runs the legs directly rather than polling, so I read no contradiction — but is Phase PUB's *PR* poll (`gh pr view --json statusCheckRollup`) expected to tolerate row 6 being absent on a docs-only PR, and is that tolerance stated anywhere? If it is not, the first docs-only PR is the test. |

## Positive Observations

- The delta fixes the exact class of bug that makes required-check oracles worthless: an
  expected set that was true of one file and silently blind to a second. It is fixed the
  right way round — the file scope is now **derived from the trigger and set-equalled**,
  so the next PR-gating file cannot be forgotten. That is the difference between a remedy
  and a patch, and the FSPEC says so in the rule text itself (`:498-501`).
- BR-7.5 was not merely narrowed, it was made unstretchable: "the exclusion reason is the
  trigger, not the filename … this rule can never again be stretched to cover a file it is
  false of" (`:526-530`). Writing down *why the old reading was wrong* next to the rule is
  what stops the same misreading recurring, and the carrier's `:559-562` message repeats it.
- BR-7.7 states its own falsifier in one sentence — "a tag gated without them is a release
  gated on strictly weaker evidence than the PR was" — and names the ATs (AT-2.3…AT-2.6)
  the missing legs would have carried. A reviewer can check the rule without reading the
  workflow.

## Recommendation

**Approved with minor changes.**

No High findings. The delta is correct against HEAD on every claim I could ground, the
AC-3.4 oracle is strictly stronger than the version I approved in round 7, and the carrier
that pays for it is green in-tree. The four findings are provenance and prose: an unrecorded
version bump (`F-01`), a stale baseline sentence in §3 (`F-02`), a singular that should be
plural (`F-03`), and two new rules whose §8 conjuncts were not written (`F-04`). None gates.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
