# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.5, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 2
**Scope:** delta-scoped — round-1 finding resolution, plus new testability/edge-case defects in the changed sections

Delta base: `b9548b38..5d8ecd7b` on `feat-pdlc-plugin-retirement`, plus the relocated
measurement surface `docs/_constraints/pdlc-retirement-baseline.md`. Every existing-behaviour
claim below was re-verified against the tree at HEAD, not against what the documents say.

## Round-1 disposition

| Round-1 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | Baseline adds M-10 `dist/consolidate-learnings.bundle.js` (417,952 B measured, matches HEAD `wc -c`); baseline's §M note states `dist/` holds five entries; AC-1.1 is now **set-equality** over `dist/`'s entry set against `{M-9}`, not containment; G-1 names M-4/M-5/M-10 as the three retiring bundles. Q-01 answered: M-10 retires with M-4/M-5, M-9 alone survives. |
| F-02 | High | **Resolved** | AC-1.4c added: engine suite green at each sweep commit, naming the arrangement oracle's CI job set, the CLAUDE.md CI-table set-equality **and the prose count word** (M-11c), and the drift-gate smoke cases (M-11d). Verified against `pdlc/engine/__tests__/ci-arrangement.test.js`: `GATE_JOB_IDS` (`:47-53`) hard-codes `artifact-freshness`/`fresh-clone-bootstrap`, CLAUDE.md CI-section set-equality (`:589-642`), count-word regex (`:702`), `publish.yml`-vs-PR-gate set-equality (`:679-710`). R-2 now names all four easy-miss dependents. Q-02 answered by NG-5's carve-out. |
| F-03 | High | **Resolved** | AC-1.4b added, and it enumerates exactly the steps that exist: `publish.yml:77` (`build-runtime.mjs --check`), `:81/:93` (rebuild-and-diff), `:98-106` (two-command bootstrap incl. the exit-126 branch), `:111` (`sync-workflows.sh --check`), `:151` (`check_mode 100755`). M-11b carries the same list. |
| F-04 | High | **Partially resolved — see F-01 (v2)** | AC-1.2 now carries an enumerated path-glob allow-list (form fixed) and settles the two tracked fixture trees ("deleted or re-fixtured by the sweep", with NG-5 carving engine-side fixtures M-11e into scope). But the enumeration is provably incomplete at HEAD and now contradicts BL-06/AC-2.3 — new High below. |
| F-05 | High | **Resolved** | AC-1.3 no longer self-derives: it asserts the `*.test.js` count equals a **literal** number transcribed into FSPEC at C-6 re-measurement time, plus a positive survivor conjunct (each named retained module, including R-8's re-homed queue-triage and hook-manifest assertions, present and passing). Baseline M-8 records 119 `*.test.js`; `git ls-files pdlc/workflows/__tests__ \| grep -c '\.test\.js$'` → 119 at HEAD. |
| F-06 | Medium | Resolved | AC-3.2/3.5/3.6 each tagged *(pre-satisfied at HEAD — regression guard, verified 2026-08-17)* and re-pointed at the post-sweep version pair. |
| F-07 | Medium | Resolved | BL-08 added: pre-sweep engine-path run report captured, committed at a fixed path, cited path+commit, gating the **first** deletion commit; AC-5.2 now asserts field-set equality with an enumerated allowed-difference set. |
| F-08 | Medium | Resolved | AC-1.8 makes the replay the criterion ("sweep range replayed commit-by-commit, gate command set run at each"), states why hosted CI cannot supply it, and requires pasted output rather than inspection; FSPEC enumerates the command set. |
| F-09 | Medium | Resolved | AC-4.3 now names all three conjuncts (file byte-identical, refused path on stderr, non-zero exit); AC-4.4 pairs the absences with a positive conjunct (run reaches configured final phase; report set-equals the clean-repo run). |
| F-10 | Medium | Resolved | AC-3.3 is set-equality of `pdlc/skills/*/SKILL.md` at HEAD against the pre-sweep listing, plus named surviving-hook assertions. |
| F-11 | Medium | Resolved | BL-05 and O-7 re-derived and correct at HEAD: `pdlc-install-mechanism` discharged (removed from the table 2026-08-13, closed superseded); the one live retired-channel row is `pdlc-release-ci`, status `blocked`, at Order 8 (`docs/_queue/QUEUE.md:79`); row 6 is `pdlc-engineering-loop`, `pending` (`:78`). |
| F-12 | Low | Resolved | Sizes moved into the baseline and re-measured; all eight spot-checks match HEAD exactly (M-1 32,939 B; M-2 75,617 B; M-3 19,240 B; M-4 401,716 B; M-5 401,020 B; M-6 1,464 B; M-7 831 lines; M-9 679,956 B; M-10 417,952 B). |
| F-13 | Low | Resolved | AC-1.5 now requires the `.gitignore` row's second effect (keeping the nested fixture tree addable) to be discharged by the fixture's own disposition under AC-1.2 rather than left implicit. |
| F-14 | Low | Resolved | AC-1.6 pins the invocation to a **clean tracked-files-only checkout** and says why (untracked caches/backups otherwise move the oracle's result independently of the diff). |

## Findings (this round)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-1.2's allow-list is enumerated but incomplete at HEAD, and one omission makes the criterion unsatisfiable against BL-06/AC-2.3.** Running the criterion's own search over tracked files today (`git grep -lE 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs'`) and subtracting the four listed globs plus this feature's directory leaves **nine tracked documents**: `docs/_constraints/pdlc-retirement-baseline.md`, `docs/_decisions/DECISIONS-plugin-distribution.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`, and three under `docs/discarded/`. Two of those the sweep must not empty. (a) `DECISIONS-plugin-distribution.md` carries the retired names at `:49, :65, :75, :101, :104`, and BL-06 + AC-2.3 require that file to survive **carrying a superseding entry** — a superseding entry that does not name the channel it supersedes is not one. AC-1.2 (result empty) and AC-2.3 (superseded decisions carry an explicit superseding note) therefore cannot both go green. (b) `docs/_constraints/pdlc-retirement-baseline.md` is the file v0.5 itself created, and C-6/AC-1.3 depend on it being readable after the sweep; it names every retired artifact by construction. The historical docs under `docs/discarded/**` and other features' shipped PLANs are the same class NG-4 protects for `docs/completed/**`, but the glob list stops at `docs/completed/**`. Fix: extend the allow-list to `docs/_constraints/pdlc-retirement-baseline.md`, `docs/_decisions/**`, `docs/discarded/**`, and the other-feature historical planning docs (or state a rule — "documents whose subject is the retirement itself, plus already-shipped or discarded feature docs" — and enumerate the HEAD membership in FSPEC at C-6 re-measurement time, same as AC-1.3's literal count). Until the list is closed against a measured HEAD, the criterion is a search a test engineer cannot write an expected value for. | AC-1.2, BL-06, AC-2.3, NG-4 |
| F-02 | Medium | Local | **AC-1.2's M-11h conjunct has no decided disposition, and O-3 leaves it undecidable.** The criterion requires the wave-gate key names to return empty, but M-7 `build-runtime.mjs` is *reduced, not deleted* (baseline M-7; G-5/AC-5.3 keep M-9 generated by it), so `postWaveCommand: "node pdlc/workflows/build-runtime.mjs"` in `.claude/pdlc.config.example.json:1` may legitimately survive — and its sibling `postWavePathspecs: ["pdlc/workflows/dist/"]` points at a directory whose post-sweep fate is explicitly still open in O-3. A hit on `postWaveCommand` after the sweep is therefore neither provably a pass nor provably a fail. R-2 additionally notes this feature's own implementation phase runs under those keys, so the value is live during the sweep. Fix: state whether the wave-gate rebuild survives (pointing at the reduced build script and M-9's new home) or retires with the bundles, and scope AC-1.2's M-11h term to whichever names must be gone. | AC-1.2, M-11h, O-3, AC-5.3 |
| F-03 | Medium | Local | **AC-1.1's second branch names a path the REQ never fixes, so the set-equality has two possible expected values.** AC-1.1 passes either when `dist/`'s entry set set-equals `{M-9}` **or** when the directory is gone and M-9 is "relocated to a single named surviving path" — but the name is owned by O-3, still open. F-01 (round 1) asked for set-equality and got it; this is the residue: a test author at FSPEC time still has to choose the branch before writing the assertion, and the two branches have different oracles (directory listing vs. path existence + generation check shared with AC-5.3). Fix: have the FSPEC pin the branch and the literal path at C-6 re-measurement time, the way AC-1.3 now pins its count. | AC-1.1, O-3, G-5 |

ERRATUM: CONSTRAINT: `docs/_constraints/pdlc-retirement-baseline.md` M-11c/M-11d omit `pdlc/engine/__tests__/fs-observation.test.js`, which is a real engine-side dependent at HEAD (`:83` builds `path.join(workflowsDir, "orchestrate-dev.bundle.js")`; `:207` exercises the `distribution.checkEnabled: false` opt-out). AC-1.4c's whole-suite greenness still catches it, so no REQ criterion is falsified, but R-2's "hidden dependents" control leans on M-11 being the enumerated set and the row is short by one file.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is `docs/_decisions/**` meant to be inside AC-1.2's allow-list wholesale, or only `DECISIONS-plugin-distribution.md` plus the consolidation log? The wholesale reading is simpler but would also exempt any *new* decision doc that re-mandates the retired channel — which AC-2.3 exists to catch (F-01). |
| Q-02 | Does the post-sweep repo still run a post-wave rebuild for M-9, or does M-9 regenerate only on demand? The answer decides both AC-1.2's M-11h term and whether AC-5.3's "still produced by a build step" has a wired invoker or only a documented one (F-02). |

## Positive Observations

- **The relocation of §1.2 into `docs/_constraints/pdlc-retirement-baseline.md` is the single best change in this round.** Every one of the nine measurements I spot-checked reproduces exactly at HEAD, and the file carries its own re-measurement command block — so C-6 is now a replayable procedure rather than an instruction to remember. That is the difference between a stale table and a baseline.
- **AC-1.4b did not settle for "publish.yml is in scope".** It enumerates the five step shapes, and all five exist at the lines the baseline claims. A test engineer can write the assertion straight off the criterion, which is exactly what round 1 asked for.
- **AC-1.4c names the CLAUDE.md prose *count word*.** That was the subtlest dependent in the whole M-11 set — a regex over English numerals in prose (`ci-arrangement.test.js:702`) that no reasonable sweep would think to look for — and the criterion names it explicitly rather than hiding behind "engine suite green".
- **AC-1.3 replaced a tautology with a literal plus a positive conjunct.** "File count dropped by the number removed" was true of any deletion; "equals the literal number transcribed at C-6 time, and each named survivor is retained and passing" can fail. The re-homed assertions (queue triage, hook-manifest compatibility) being named in the same breath closes R-8's loop.
- **AC-4.4 now has a positive outcome in front of its absences**, and AC-4.3 has an exit code, a stream, and a byte-identity clause. Both were absence-only in v0.4; neither is now.
- **BL-08 is correctly placed in time.** It gates the *first* deletion commit, not the sweep's end — which is the only placement under which AC-5.2's comparison is still capturable.

## Recommendation

**Needs revision** — one High.

The revision resolved four of five round-1 Highs cleanly and verifiably; F-04's fix landed in form (the allow-list is enumerated) but not in extent (the enumeration is short by nine tracked documents, two of which the sweep is required elsewhere in the REQ to leave naming the retired channel). Closing F-01 above is a bounded edit to AC-1.2's glob list plus one sentence reconciling it with BL-06/AC-2.3; the two Mediums ask the FSPEC to pin M-11h's disposition and AC-1.1's branch at C-6 re-measurement time, the same mechanism AC-1.3 already uses.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
