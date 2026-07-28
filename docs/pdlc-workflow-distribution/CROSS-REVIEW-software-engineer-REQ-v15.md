# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v16.0, `d2f8b72`)
**Date:** 2026-07-28
**Iteration:** 15 (SE round 15, against REQ v16)
**Scope:** REQ — delta re-review of the diff `cd57fa8..d2f8b72` against `CROSS-REVIEW-software-engineer-REQ-v14.md`. Changed sections only.

> **Numbering note (Process).** The orchestrator labelled this round "iteration 3" and asked for
> `…-REQ-v3.md` against a previous `…-REQ-v2.md`. Both already exist on this branch: SE and TE
> cross-reviews `v1..v14` are committed here, the REQ under review is **v16.0**, and my previous
> review of record is **v14** (of REQ v15.0, commit `630b478`). Writing `v3` would have clobbered
> committed history, so this file is **v15** and the delta was taken against `cd57fa8` — the
> commit v14 actually reviewed. The orchestrator's iteration counter reset when the queue re-ran;
> the artifact numbering did not. Same disposition as the note in v14.

## Delta scope

Reviewed only what v16 changed: the v16.0 header note, §0 fact 3, AC-6.4 (exemption (ii) +
cardinality assertion), AC-6.6 (rewritten oracle), §4 (`sync-workflows.sh` exits row), §7 BL-01,
§10 O-15/O-16, §11. Unchanged sections already approved in v14 were not re-litigated.

## Disposition of my v14 findings

| v14 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | Low | **Resolved** | AC-6.6 no longer walks history. The oracle is now `git diff HEAD -- pdlc/workflows/dist/` non-empty **and** working-tree `plugin.json` `version` equal to `HEAD`'s ⇒ red. Verified on this branch: `git diff HEAD -- pdlc/workflows/dist/` is empty at a clean HEAD, so the steady-state-red failure mode I demonstrated with `e56ccc7` is gone by construction — a docs-only commit never trips it. The AC also states *why* it prefers the working-tree form (pre-commit observation point; no hosted CI to run a later audit), which is the right shape. |
| F-02 | Low | **Resolved (verified by measurement)** | Exemption (ii) is now the mechanical predicate "`docs/<X>/` containing `REQ-<X>.md`". I reproduced it independently: the five-pattern `git grep -l` returns 33 files; applying (i)–(iv) with (ii) evaluated by that predicate yields **exactly the 7 files the AC enumerates** — `docs/_queue/QUEUE.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`, `pdlc/skills/orchestrate-{dev,queue}/SKILL.md`, `pdlc/workflows/orchestrate-{dev,queue}.js`. The predicate exempts 6 of the 10 `docs/*/` dirs and correctly leaves `docs/_queue/`, `docs/design/`, `docs/ideas/`, `docs/requirements/` covered, so the 7→5 collapse I flagged cannot occur. Asserting the cardinality alongside the exemption list closes the "widened exemption, unchanged list text" hole. |
| F-03 | Low | **Resolved** | AC-6.6's inert set is now four enumerated causes — clean `dist/` vs `HEAD`, `git` absent from `PATH`, no `.git`, unborn `HEAD` — each skipping loudly on the §10 O-11 pattern. The shallow-clone and linked-worktree cases I raised are genuinely dissolved rather than papered over: `git diff HEAD` reads no ancestry. O-16 routes the probe order and reason strings to TSPEC. |
| Q-01 | — | Bound | §10 O-15 — monotonicity is an explicit FSPEC decision, not an omission. |
| Q-02 | — | Answered | Dissolved by the working-tree form, *modulo* F-01 below (the landing commit's `dist/` is **untracked**, not merely dirty). |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-6.6's oracle misses untracked additions, which is exactly the landing-commit case the v16.0 note claims it now covers.** The AC says the check is red when `dist/` bytes "differ from `HEAD` (staged or unstaged)", oracle `git diff HEAD -- pdlc/workflows/dist/` non-empty. `git diff HEAD` compares HEAD against index+worktree **for tracked paths only** — untracked files are never in its output. On the landing commit `pdlc/workflows/dist/` does not exist at `HEAD` and its files are untracked until `git add`, so an unstaged landing tree produces empty output and the check falls into inert case (a) ("`dist/` is unchanged relative to `HEAD`") and skips. The v16.0 note's claim that "SE Q-02 dissolves … the landing commit's own dirty `dist/` triggers the check" therefore holds only after `git add`. One-clause repair: state the observation as `git status --porcelain -- pdlc/workflows/dist/` non-empty (which reports `??` for untracked), or add "with untracked files under `dist/` counted as differing". Wording only — the intent is unambiguous and the parenthetical "(staged or unstaged)" already says what is meant. | AC-6.6 oracle + inert case (a) |
| F-02 | Low | Local | **AC-6.6 and AC-6.3 both name `npm test` as their enforcement surface but nothing in scope makes it run before a commit.** AC-6.6's rationale rests on "`npm test` runs pre-commit"; §6 in-scope enumerates the SessionStart hook wiring and the build/publish work, and D-DIST-06 defers hosted CI — so there is no pre-commit hook, no CI, and no other gate that guarantees the surface is exercised. Combined with the working-tree form (which is inert once the commit exists), a maintainer who commits without running `npm test` leaves the invariant permanently unenforced with no later detector. This is the same dependency AC-6.3 already carries and was approved with, so it is not a regression introduced by v16 — but the working-tree pivot makes it load-bearing where the history form was at least retroactively auditable. Either name the pre-commit hook as an in-scope deliverable, or state explicitly in §6/§10 that enforcement is maintainer-discipline-plus-`npm test` until D-DIST-06 lands. | AC-6.6 rationale; AC-6.3; §6; D-DIST-06 |

No High or Medium findings.

## Questions

| ID | Question |
|----|---------|
| Q-01 | BL-01's new exit criterion requires installing "a locally built package … whose `pdlc/workflows/dist/` is populated" **before FSPEC**, but populating `dist/` is what AC-6.1 delivers. Confirming the intent: a hand-placed stub `distribution-manifest.json` is sufficient for the spike (the row tests *packaging survival*, not the builder), so the spike does not block on implementation? If a real build is intended, BL-01 and AC-6.1 are circular. |
| Q-02 | Does the marketplace `"source": "./pdlc"` local-install path BL-01 now prescribes copy the working tree or the committed tree? If it copies committed content, the spike's `dist/` must be committed first — which interacts with AC-6.6 (F-01 above) and with §6's "no test may write into this repository's `pdlc/workflows/dist/`". |

## Positive Observations

- All three of my v14 findings are resolved, and two of them by measurement I could independently reproduce (AC-6.4's covered set lands on 7 under my own grep + predicate; AC-6.6's steady-state red is gone at a clean HEAD). That is the second consecutive round where the delta was verifiable rather than asserted.
- AC-6.6's rewrite is the stronger of the two dispositions available: it does not merely gate the buggy comparison, it moves the observation point to match AC-6.3's, and it says out loud why (`npm test` is pre-commit; no hosted CI would run a later audit). Reasoning about *when* an oracle is evaluated, not just *what* it compares, is the thing most freshness checks get wrong.
- AC-6.4's mechanical exemption predicate is a good pattern generally: it replaces a judgement call ("is this a per-feature dir?") with a filesystem fact, and pins the result with a cardinality assertion so that widening the rule is red even when the prose is unchanged.
- §4's new consequence sentence — exit `1` is reachable only under `--check` — is exactly the kind of derived-and-stated fact that stops a test engineer burning a round trying to construct an unreachable state.
- §7 BL-01's replacement of an echo with a `test -r` + byte-compare is the right instinct: string interpolation cannot fail, so it could never have discharged the row.

## Recommendation

**Approved with minor changes**

Every finding from round 14 is closed, and the two remaining findings are Low, Local, wording-level
corrections to an oracle the REQ itself elected to state. Neither contests need, scope, priority
or phasing. Per §10 O-13's stopping rule, this is the signal that the REQ has met its bar: F-01
should land as a one-clause REQ edit in the FSPEC-entry commit (the normative sentence is
currently false for the landing commit), and F-02 may equally be discharged by an explicit §6
sentence or deferred to FSPEC alongside O-16.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
