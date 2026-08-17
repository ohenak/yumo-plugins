# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.6, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 3
**Scope:** delta re-review of `5d8ecd7b..13cf04b2` — round-2 finding resolution, plus new
testability defects inside the sections that commit changed. Unchanged, already-approved
sections were not re-litigated.

Every existing-behaviour claim added this round was re-derived at HEAD rather than read
back from the documents that assert it.

## Round-2 disposition

| Round-2 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.2 (`REQ:233-245`) now excludes the *measured* allow-list **A-1** of `docs/_constraints/pdlc-retirement-baseline.md:48-71` instead of an inline glob list. I re-ran A-1's own sweep command (`grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs' $(git ls-files)`) at HEAD: subtracting the machinery's own files, the two M-11e fixture trees, `docs/completed/**`, `docs/_queue/QUEUE.md` and this feature's own directory leaves **exactly the nine documents** A-1 enumerates — `pdlc-retirement-baseline.md`, `DECISIONS-plugin-distribution.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` and the three `docs/discarded/` files. The allow-list is complete, and `baseline:67-71` names the two files that must survive **carrying** the retired names, reconciling AC-1.2's required-empty result with BL-06/AC-2.3 explicitly. |
| F-02 | Medium | **Resolved** | AC-1.2's M-11h term is now scoped to "the wave-gate keys of M-11h **that the sweep retires**", with the key set following the post-sweep build-step disposition resolved under O-3 (`REQ:236-238`, `REQ:443-450`). The term now names only what must be gone, so a surviving `postWaveCommand` pointing at a reduced build script is neither a pass nor a fail by accident. |
| F-03 | Medium | **Resolved** | AC-1.1 now states the branch (`dist/` set-equals `{M-9}` vs. relocated single path) is pinned at C-6 re-measurement time alongside AC-1.3's literal count, "a test author never chooses the branch" (`REQ:230-232`), and O-3 carries the matching resolution owner (`REQ:449-450`). |

New material in this round that I verified independently rather than accepting:

- **C-7's green-start claim** (`REQ:199-205`) — "the engine suite is green at pre-sweep HEAD as
  of 2026-08-17" — holds. `npm test` in `pdlc/engine` at HEAD: `# tests 842`, `# pass 840`,
  `# fail 0`, exit 0. (Local caveat, not a REQ defect: an inherited `NODE_TEST_CONTEXT`
  environment variable makes the runner collect zero files and then fail
  `_assert-suite-wide.mjs` with "empty union"; `env -u NODE_TEST_CONTEXT npm test` is the honest
  invocation. Worth a line in the FSPEC's AC-1.8 replay command set, since the replay is run
  by hand on a developer machine, not by hosted CI.)
- **The oracle's subject is back in place**: CLAUDE.md carries `### Continuous integration`
  (`CLAUDE.md:66`), which `pdlc/engine/__tests__/ci-arrangement.test.js` asserts.
- **M-11l is real**: `pdlc/OPERATIONS.md` exists, created at `a9b3e78a`, and carries the
  `unverified`/`--force`, worktree and distribution-script material AC-2.1 now names.
- **M-11m is real**: `pdlc/engine/__tests__/fs-observation.test.js:83` builds an
  `orchestrate-dev.bundle.js` path under the consumer workflows dir and `:207` exercises the
  `distribution.checkEnabled: false` opt-out.
- **AC-1.7's arithmetic checks out**: `pdlc/hooks/hooks.json` registers five entries —
  `PreToolUse:Bash` → guard-harvest-before-delete; `PostToolUse:Write|Edit` → check-scope-field,
  check-req-size; two `SessionStart` entries → nudge-consolidation, check-workflow-drift. Minus
  the drift reporter leaves four, and the surviving `SessionStart` entry is exactly the case the
  new set-equality wording protects.

## Findings (this round)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **`pdlc/OPERATIONS.md`'s `## Continuous integration` section is the one un-oracled copy of the required-check table, and no criterion of this REQ can see it go stale.** M-11l enumerates OPERATIONS.md's retired-concept sections (`baseline:45`) but omits `## Continuous integration` (`pdlc/OPERATIONS.md:57-70`), which describes all six checks including both jobs AC-1.4 deletes, plus a `Shell scripts parse` row asserting "`100755` for the two entrypoints, `100644` for the sourced library" — i.e. M-1/M-3 and M-2. Three criteria miss it: AC-1.2's search is name-based and that row names no retired file; AC-2.1's concept list (build bundles / sync / force-sync / drift / fresh-clone bootstrap / worktree) does not cover an index-mode sentence; AC-1.4c's arrangement oracle covers **CLAUDE.md**'s section only (`ci-arrangement.test.js`; OPERATIONS.md itself says so at `:59`). Post-sweep the file can truthfully-looking describe a shell job that no longer asserts those modes and a check set that no longer exists. Fix: add `## Continuous integration` to M-11l, and give AC-2.1 (or AC-1.4) a set-equality conjunct — the check rows described in tracked instructional docs set-equal the post-sweep required-check set — rather than leaving OPERATIONS.md covered only by a keyword search. | AC-1.4, AC-2.1, M-11l, O-5 |
| F-02 | Medium | Local | **AC-1.7's and AC-3.3's expected values are "the pre-sweep listing", which is pinned to neither a commit nor a literal.** AC-1.7 (`REQ:281-285`) asserts the hook-entry set equals "the pre-sweep listing minus exactly one entry"; AC-3.3 (`REQ:325-327`) compares `pdlc/skills/*/SKILL.md` against "the pre-sweep listing". Neither listing is transcribed anywhere: the baseline records the drift-reporter entry (`baseline:42`) but no hook-entry set and no skill set, and "pre-sweep" names no commit — during a multi-commit sweep (C-5) every intermediate HEAD has a different claim to it. A test author is left to derive the expected set from the artifact under change, which is exactly the echo AC-1.3 avoided by transcribing a literal. Fix: transcribe both sets as literals at C-6 re-measurement time, the mechanism AC-1.3 already names (five hook entries by script name and event; the skill-directory set by name), and pin "pre-sweep" to the sweep's base commit. | AC-1.7, AC-3.3, C-6 |
| F-03 | Low | Local | **A-1's glob column mixes a real glob with a prose placeholder.** `docs/{other feature}/PLAN-*.md` (`baseline:65`) is not evaluable; the mechanical reading `docs/*/PLAN-*.md` is wider than intended and would also swallow a future feature's PLAN that legitimately re-introduces a retired name. The "Files it covers today" cell pins today's single member (`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`), so the required-empty result is still computable today, but AC-1.2 says "excluding the measured path-glob allow-list", and one row is not a path glob. Fix: spell the glob literally, or drop the row and list the file. Related: that row's rationale reads "planning documents of already-shipped features", while `pdlc-halt-hardening` still has a live directory outside `docs/completed/` — allow-listing a live feature's PLAN is a different judgement from allow-listing an archived one. | AC-1.2, A-1 |
| F-04 | Low | Local | **Two of A-1's/M-11l's cited anchors are paraphrases, not the strings in the file.** M-11l cites `## Workflow scripts`, `## sync skips a row: \`unverified\` and \`--force\`` and `## Engine channel`; the file's actual headings are `## Workflow scripts and the runtime build` (`:5`), `## When sync skips a row: …` (`:72`) and `## The engine channel (\`pdlc/engine\`)` (`:136`). A completeness check keyed to those literals — the natural way to assert "these sections are gone" — passes vacuously today and would keep passing if the sections were merely renamed. Separately, A-1's "Files it covers today" cell reads `—` for `docs/completed/**` and `**/LEARNINGS-*.md` although 22 tracked files under `docs/completed/` match the sweep at HEAD, so that column cannot be used as a set-equality check of the allow-list's extent. Fix: quote the headings verbatim and give the archive row its measured count. | M-11l, A-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does AC-1.8's replay command set (FSPEC-owned) state the engine-suite invocation precisely enough to survive a polluted shell? At HEAD, `npm test` in `pdlc/engine` runs **zero** test files and then fails the suite-wide assertion when `NODE_TEST_CONTEXT` is inherited — a replay that pastes that output would show a red the sweep did not cause. |
| Q-02 | Which commit is "pre-sweep" for AC-1.7/AC-3.3/AC-5.2 — the branch point, or BL-08's report commit? BL-08 already pins a commit for the report; reusing it for every "pre-sweep" comparison would settle F-02 with no new machinery. |

## Positive Observations

- **The round-2 High was closed by measurement, not by argument.** Moving the allow-list into
  A-1 with the derivation command beside it means I could falsify it in one shell command
  rather than reason about glob coverage — and it reproduced exactly, nine documents, no
  residue. That is the difference between an allow-list and an allow-list you can trust after
  the tree moves.
- **`baseline:67-71` states the co-satisfiability of AC-1.2 and AC-2.3 out loud.** The previous
  round's High was really "these two criteria cannot both be green"; the fix does not just add
  a glob, it names *why* two files must survive carrying the retired names. A future reader
  deleting the allow-list will now see what breaks.
- **C-7 stopped assuming its own premise.** "Stays green at every commit" is worthless without
  a measured green start, and the new sentence supplies one with a date and a repair path. I
  re-ran it: 842 tests, 0 failures. This is the rare case of a constraint that cites evidence
  for its baseline rather than asserting an invariant into existence.
- **AC-1.7 is now falsifiable in the way that matters.** The old wording ("registers no
  drift-reporting `SessionStart` entry") passed if the whole `SessionStart` event were deleted,
  taking the consolidation nudge with it — the exact regression US-04 exists to prevent. Set
  equality minus exactly one named entry fails that mutation, and AC-3.3 was re-pointed at
  AC-1.7's surviving set so the two cannot drift apart.
- **AC-1.2's M-11h term now names only what must be gone.** A search term whose expected result
  depends on an unresolved open question can neither pass nor fail honestly; scoping it to "the
  keys the sweep retires, per O-3" makes the criterion determinate at TSPEC time instead of
  ambiguous forever.

## Recommendation

**Approved with minor changes**

All three round-2 findings are resolved, and the one High is resolved by evidence I could
reproduce rather than by re-wording. Nothing in the delta broke a previously-approved
criterion: the set-equalities of AC-1.1, AC-1.3, AC-3.3 and AC-5.2 survive intact and AC-1.7
joined them. The four findings above are all inside material this round added — the
OPERATIONS.md surface (F-01, F-04) and the "pre-sweep listing" phrase that the new AC-1.7
wording introduces (F-02) — and none of them blocks FSPEC authoring; each is a transcription
the FSPEC or the C-6 re-measurement can absorb. F-01 is the one I would not let slip past the
FSPEC: an instructional file with no oracle over it is precisely how a sweep leaves one true
story and one stale one.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
