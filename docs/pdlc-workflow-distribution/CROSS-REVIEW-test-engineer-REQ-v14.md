# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v15.0, `cd57fa8`)
**Date:** 2026-07-28
**Iteration:** 14
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** `git diff 09aa773..cd57fa8 -- docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v14.0 → v15.0).

> **Iteration index.** Dispatched as "iteration 2" with instructions to read `-v1` and file `-v2`.
> `CROSS-REVIEW-test-engineer-REQ-v{1..13}.md` are committed on this branch and the document under
> review is v15.0, so this is iteration **14** and is filed as `-v14`; filing `-v2` would have
> destroyed a prior review. Thirteenth consecutive wrong index — already routed to queue row 8
> (`pdlc-review-loop-hardening`, POSTMORTEM-R R-3/R-4). Not re-filed as a finding.

> **Stopping rule applied (§10 O-13).** A finding of the form "this AC has no oracle / no fixture /
> no test seam" is answered by §10's obligation table, not by a REQ revision, and I have applied
> that rule literally again. The findings below survive it: F-01 and F-02 are about oracles the REQ
> **itself chose to state**, and both are wrong in the falsifying direction — an oracle the REQ
> writes down is reviewable where it is written. This is not a re-litigation of deferred apparatus.

## Disposition of my v13 findings

| v13 ID | Sev | Status in v15 | Evidence |
|---|---|---|---|
| F-01 | Low | **Resolved.** §4's exits row now states the code is computed over the observed state at end of run — pre-run for `--check`, post-run for sync — with the mixed-run example (copied `stale`, skipped `unverified` ⇒ 2). O-14 carries per-entrypoint wording to FSPEC. "Run sync on a stale consumer, assert the exit code" is now writable. | §4 exits row; §10 O-14 |
| F-02 | Low | **Mostly resolved.** AC-6.4 enumerates the generated-tree exemption literally (`.claude/workflows/`, `pdlc/workflows/dist/`) and asserts the exemption list. Residue in F-05 below: exemption member (ii) is still named, not mechanised. | AC-6.4 |
| F-03 | Low | **Resolved.** O-13 now states neither `docs/_constraints/` nor `docs/_decisions/` exists on this branch and that `consolidate-learnings` must *create* `DOMAIN-CONSTRAINTS.md`; "no such file" does not discharge the row. Re-verified: both directories are still absent. | §10 O-13 |
| F-04 | Low | **Resolved.** NFR-2 is restated as a reviewable design constraint (bounded walk, no per-row spawn beyond the three declared tools, no network) plus one advisory release-checklist observation, on the AC-6.2a pattern. That is checkable at FSPEC by reading the spec. | NFR-2 |

All four disposed. Nothing I raised in v13 is open.

## Verification performed on v15 (changed sections only)

- **AC-6.4's re-measured count reproduces exactly.** I re-ran the five literal patterns
  (`grep -rIl`, excluding `.git`/`node_modules`) and applied the four-member exemption by hand:
  31 matching files, of which exactly **7** survive — `docs/_queue/QUEUE.md`,
  `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`,
  `pdlc/workflows/orchestrate-{dev,queue}.js`, `pdlc/skills/orchestrate-{dev,queue}/SKILL.md`.
  The AC's list is byte-for-byte the set I derived.
- **§1's two SKILL citations are accurate.** `pdlc/skills/orchestrate-dev/SKILL.md:98` and
  `pdlc/skills/orchestrate-queue/SKILL.md:183` carry the quoted manual-copy phrasings, and the new
  fifth pattern's case-tolerant stem (`opying the bundle into a consumer repo`) matches both.
- **The post-run exit rule is internally consistent.** I replayed AC-3.3's precedence table against
  AC-3.1, AC-3.2, AC-3.7, AC-3.8 and AC-3.9 post-run: repaired-`stale` ⇒ 0; skipped-`unverified`
  ⇒ 2; failed copy ⇒ 4; retired path left because its row was skipped ⇒ 2 (1 is outranked). No
  contradiction with any AC-3.x. One derivable consequence recorded as F-04.
- **The observation point of the existing gate is the working tree, not git.**
  `pdlc/workflows/__tests__/runtimeBundle.test.js` reads bytes with `readFileSync` and never shells
  to git. AC-6.6 would be the suite's first history-dependent test; that asymmetry is the substance
  of F-01.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-6.6's stated oracle cannot fire when the violation occurs, and under its literal reading fires when there is no violation. Neither reading yields a writable test.** The oracle is "compare `plugin.json` `version` at `HEAD` against its value at the most recent earlier commit whose diff touched `pdlc/workflows/dist/`; equal ⇒ red." (a) *Literal reading — evaluate on every run.* After a legitimate bump commit `C`, take the next commit `D` that does not touch `dist/`: `version(HEAD=D)` equals `version(C)`, and `C` is the most recent earlier `dist/`-touching commit, so the test is **red on every commit that changes nothing relevant**, permanently, until someone bumps again — which makes the next commit red too. A test that is red in the steady state is disabled within a week and the AC delivers nothing. (b) *Charitable reading — the Given scopes it, evaluate only when `HEAD` itself touched `dist/`.* Then the check is inert at the only moment the AC's own When names: `npm test` runs **pre-commit**, when the `dist/` change is unstaged/staged and `HEAD` has not touched `dist/`. The stated When/Then ("When `npm test` runs, Then it fails unless the version also changes in that same commit") is unachievable — the failing commit does not exist yet at test time, so the violating commit lands green and is caught, at best, on some later run. With no hosted CI (D-DIST-06) nothing forces that later run, and the highest-risk case — the last commit before a release — is exactly the one never caught. This is the inverse of the false-green AC-6.6 exists to close. I cannot write this test today without asking which reading is intended, so it is a REQ-level defect, not a downstream oracle-design deferral. **Minimal repair (one clause, no altitude change):** observe the working tree, matching AC-6.3's observation point — red iff `git diff HEAD -- pdlc/workflows/dist/` is non-empty (staged or unstaged) **and** the working-tree `plugin.json` `version` equals its value at `HEAD`; inert with a printed reason when `dist/` is unchanged relative to `HEAD`. That is falsifiable (dirty `dist/` + unbumped version ⇒ red), has no steady-state red, and needs no history walk. | AC-6.6 ("Oracle:" sentence vs the "When `npm test` runs" clause); AC-6.3 (the observation point to match); §1 A′→B table |
| F-02 | Medium | Local | **BL-01's extended exit criterion is a vacuous oracle, and the §0 prose and the §7 blocking-assumption row now disagree about what BL-01 must show.** §0 fact 3 correctly de-claims the packaging assumption ("the second is evidenced, not yet measured for a build-output directory") and then discharges the remainder with "BL-01's spike closes the remainder by **also echoing a `workflows/dist/` path resolution**." Echoing a resolved path is string interpolation — `echo "${CLAUDE_PLUGIN_ROOT}/workflows/dist/x.bundle.js"` succeeds identically whether or not `dist/` shipped, so the spike passes with the assumption unproven. This is a positive-presence-conjunct gap: the proof must assert the *file exists and is readable at that path in an installed plugin* (`test -r`, plus a byte-compare against `pdlc/workflows/dist/`), which requires installing a locally built package whose `dist/` is populated. Compounding it, the §7 BL-01 row still reads only "hook echoes the resolved path in a consumer session" — the row that gates FSPEC entry was not updated when §0 extended it, so a spike run against the row alone discharges nothing about `dist/`. Consequence if wrong: the entire A′→B edge, and therefore REQ-DIST-06, fails after implementation, with AC-6.2a (P1, release checklist, post-release) as the only remaining detector. Fix in §7: restate BL-01's exit criterion as "an installed plugin built from this repo has a **readable** `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` whose bytes equal `pdlc/workflows/dist/distribution-manifest.json`", and make §0 fact 3 point at that wording. | §0 fact 3 (new sentences); §7 BL-01 row; AC-6.2a |
| F-03 | Low | Local | **AC-6.6 makes the jest suite depend on git history without stating the environment preconditions or the skip behaviour for the cases that lack one.** The suite is today pure-filesystem (verified: `runtimeBundle.test.js` uses `readFileSync` only). AC-6.6 names one inert case (no `dist/`-touching ancestor) but not: shallow clone (`--depth 1`), a source tarball with no `.git`, a detached worktree, or `git` absent from `PATH` — all of which make a history walk impossible rather than merely ancestor-less. Each must skip **loudly**, printing the reason and the invariant left unverified (the O-11 uid-0 pattern already established in this REQ), never pass silently. Adopting F-01's working-tree repair reduces this to a single `git diff HEAD` call but does not remove it. | AC-6.6 ("inert in a working tree with no such ancestor"); §10 O-11 (the pattern to copy) |
| F-04 | Low | Local | **Exit `1` is unreachable on a sync run under the new post-run rule, and the REQ does not say so — an acceptance test will be written for a state that cannot be constructed.** Post-run, every `stale`/`missing` row has been copied (⇒ `in-sync`) or has failed (⇒ 4); a retired path still present implies its row was skipped as `local-edit`/`unverified`/`unknown`, which outranks 1 at 2 or 3. So `1` is a `--check`-only code. That is a correct consequence, not a defect, but it is exactly the kind of derived fact a TSPEC author burns a day on: §4's exits row or O-14 should state "`1` is reachable only under `--check`" so nobody tries to build the fixture. | §4 exits row; AC-3.3 table row 4; AC-3.9 |
| F-05 | Low | Local | **AC-6.4 calls the checker "a pure function of a root directory" but exemption member (ii) is still named rather than mechanised — and it is the load-bearing member.** (i), (iii) and (iv) are now literal paths or filename globs; (ii) "per-feature `docs/<feature>/` artifact dirs" is a judgement. My reproduction of the measured 7 required deciding that `docs/orchestrate-dev-workflow/` and `docs/pdlc-workflow-distribution/` are per-feature dirs while `docs/design/` and `docs/_queue/` are not. Code it as "any `docs/` subdirectory" and the covered set silently drops to 3 — and the AC's new "the test asserts the exemption list itself" guard does **not** catch it, because the list is unchanged; only its interpretation widened. A mechanical rule exists and should be written down: a per-feature dir is a `docs/<X>/` containing `REQ-<X>.md`. Under that rule my grep reproduces 7 exactly. Also pin the assertion to the enumerated 7 rather than to `∅` alone, so a widened exemption is red on the count as well as on the list. | AC-6.4 exemption (ii); my v13 F-02 (partially carried) |

## Questions

| ID | Question |
|---|---|
| Q-01 | F-01: is AC-6.6 intended to gate the commit being authored (working tree) or to audit committed history? The rest of §6 gates the working tree; if history-audit is genuinely intended, what runs it, given D-DIST-06 says there is no hosted CI? |
| Q-02 | F-02: can BL-01's spike install a locally built package (marketplace `"source": "./pdlc"`) with `dist/` populated, so the packaging claim is *measured* rather than echoed, before FSPEC? |

## Positive Observations

- **Every one of my four v13 findings was fixed as text in the document, none deferred to §10 as a
  dodge.** The NFR-2 rewrite is the strongest of them: "no unbounded filesystem enumeration, no
  process spawn per row beyond the three declared tools, no network" converts a decorative p95 into
  three statements a FSPEC reviewer can falsify by reading the spec — which is precisely what a
  latency requirement on a hook should be, since the wall-clock form is flaky by construction.
- **AC-6.4's re-measurement is the right response to being wrong.** The AC did not add the two
  SKILLs as hand-corrections; it widened the *pattern* so the SKILLs fall inside the computed
  covered set and reintroducing the manual-copy convention into either is red forever. That is the
  difference between fixing an instance and fixing the class, and the count re-derived exactly.
- **The post-run exit rule is stated with the mixed-run example, which is the only case that
  disambiguates it.** "Copied a `stale` row, skipped an `unverified` one ⇒ 2" pins precedence
  *and* the observation point in one sentence; I replayed it against all nine AC-3.x criteria
  without finding a contradiction.
- **§0 fact 3 now separates measured from evidenced instead of asserting both.** Naming the
  installed `workflows/__tests__/` directory as the actual evidence, and admitting nothing under a
  nested build output has shipped, is the honest form. F-02 is a complaint about the discharge
  mechanism, not about the framing — the framing is exactly right.
- **AC-6.6 is the correct missing criterion.** SE's F-01 identified a real unowned edge, and the
  §1 two-row decomposition (this REQ owns "the pin moves"; D-DIST-05 owns "the bump reaches the
  cache") is the right split with the right failure mode attached to each. My F-01 contests only
  the oracle, not the criterion.

## Recommendation

**Needs revision**

One High and one Medium. F-01 is a one-clause repair to AC-6.6's oracle sentence (observe the
working tree against `HEAD`, matching AC-6.3, instead of walking ancestors); F-02 is a rewrite of
the §7 BL-01 exit criterion to a readable-file-plus-byte-compare, with §0 fact 3 repointed at it.
Both concern oracles the REQ elected to state in the REQ, and both are wrong in the falsifying
direction — the O-13 stopping rule defers *absent* test apparatus, not *stated* apparatus that
cannot fail when it should or fails when it should not. The three Lows are one-sentence
clarifications and need not gate.

Neither finding contests need, scope, priority or phasing, and the blocking count moved 0 → 2
rather than plateauing, so this is not the POSTMORTEM-R fixed point: one targeted revision of two
sentences should close Phase R.
