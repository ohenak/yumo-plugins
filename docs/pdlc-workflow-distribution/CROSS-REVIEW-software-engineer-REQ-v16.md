# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v17.0, `ba9ab18`)
**Date:** 2026-07-28
**Iteration:** 16 (SE round 16, against REQ v17)
**Scope:** REQ — delta re-review of the diff `d2f8b72..ba9ab18` against `CROSS-REVIEW-software-engineer-REQ-v15.md`. Changed sections only.

> **Numbering note (Process, third consecutive round).** The orchestrator dispatched this round as
> "iteration 4" and asked for `…-REQ-v4.md` against a previous `…-REQ-v3.md`. Both already exist
> and are committed on this branch: SE and TE cross-reviews `v1..v15` are here, the REQ under
> review is **v17.0**, and my review of record is **v15** (of REQ v16.0, commit `d2f8b72`).
> Writing `v4` would have clobbered committed history, so this file is **v16** and the delta was
> taken against `d2f8b72` — the commit v15 actually reviewed. The orchestrator's iteration
> counter resets when the queue re-runs; artifact numbering does not. Already routed by REQ §11
> to queue row 8 (`pdlc-review-loop-hardening`) — no action on this REQ.

## Delta scope

Reviewed only what v17 changed: the v17.0 header note, AC-6.4 (two-root split + fixture guard),
AC-6.6 (porcelain oracle, inert case (a), accepted-residual paragraph), §6 (new "Enforcement
surface" paragraph), §7 BL-01 (placeholder-manifest clause), §10 O-16/O-17, §11. Unchanged
sections already approved in v14/v15 were not re-litigated.

## Disposition of my v15 findings

| v15 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | Low | **Resolved (verified by measurement)** | AC-6.6's oracle is now `git status --porcelain -- pdlc/workflows/dist/` producing any line. I reproduced both halves in a scratch repo: with a never-added `pdlc/workflows/dist/b.js`, `git diff HEAD -- pdlc/workflows/dist/` is **empty** (the v16 hole — inert case (a) would have fired on the landing commit) while `git status --porcelain -- pdlc/workflows/dist/` emits `?? pdlc/workflows/dist/`; after `git add`, `A  pdlc/workflows/dist/b.js`. The AC's supporting claims also check out at HEAD: `pdlc/workflows/dist/` does not exist (`ls pdlc/workflows/` — only `__tests__`, `build-runtime.mjs`, `orchestrate-{dev,queue}.js`, `runtime-adapter.js`, `package*.json`, `node_modules`) and is not ignored (`git check-ignore -v pdlc/workflows/dist/x.js` exits 1; `.gitignore` covers only `.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, `node_modules/`). The wording — "staged, unstaged, deleted, or untracked-and-new" plus "`--porcelain` covers `??`, `A`, `M` and `D` alike" — is exactly right, and O-16 gains the untracked-addition red fixture. |
| F-02 | Low | **Resolved** | §6 now carries an explicit "Enforcement surface, stated explicitly" paragraph naming AC-6.2/6.3/6.4/6.5/6.6 as enforced by maintainer discipline plus `npm test` until D-DIST-06, stating no pre-commit hook is in scope or implied, and tying the residual to the AC-6.2a-pattern release checklist. AC-6.6 additionally carries the landed-violation case as a named accepted residual with the same P1 fallback and an explicit "no acceptance test should attempt to detect the landed case". That is the stronger of the two dispositions I offered. |
| Q-01 | — | **Answered** | BL-01 may populate `dist/` with a placeholder `distribution-manifest.json` of arbitrary bytes and remove it afterwards; the circularity with AC-6.1 is dissolved. |
| Q-02 | — | **Answered** | BL-01 now says what to do if the local marketplace install copies committed rather than working-tree content (placeholder committed on a throwaway branch, never merged), and states that AC-6.2's "no test may write into `pdlc/workflows/dist/`" binds the jest suite, not the manual spike. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-6.4's exemption members are path *patterns* but the AC never says whether they are matched against paths relative to the checker's root or absolute paths — and under the absolute reading the new fixture guard is vacuously red.** The fixture tree lives at `pdlc/workflows/__tests__/fixtures/…`, and exemption (iv) is "any `__tests__/`". Matched against absolute (or repo-relative) paths, **every** file in the fixture is exempt, so `coveredViolations(fixtureRoot)` is `∅`, not the asserted 7 — the anti-widening guard is red from the day it is written. The same ambiguity flips exemptions (i) and (ii): `<fixtureRoot>/pdlc/workflows/dist/` and `<fixtureRoot>/docs/<X>/REQ-<X>.md` only satisfy their rules under the root-relative reading. The intended reading is clearly root-relative ("the checker is a pure function of a root directory"), and the live-root assertion is unaffected either way — it is the fixture-root assertion that depends on it, and it is the assertion v17 just added. One clause: state that exemptions (i)–(iv) are evaluated against paths **relative to the checker's root argument**, which is also what makes exemption (iv) correctly shield the fixture tree from the live scan. | AC-6.4 exemption list, assertion 2; §10 O-17 |
| F-02 | Low | Local | **AC-6.6's oracle says "produces any line" but the command emits a non-empty *stderr* warning in exactly the pre-landing state that must be inert.** Measured at HEAD today: `git status --porcelain -- pdlc/workflows/dist/` prints `warning: could not open directory 'pdlc/workflows/dist/': No such file or directory` on stderr, empty stdout, exit 0. An implementation that captures combined output (`2>&1`, or a `spawnSync` helper that concatenates streams — the ordinary jest shape) reads a line and goes red on a tree where nothing is to be advertised: a steady-state red on every clone that has not yet built `dist/`, which is the failure mode this AC has now twice been rewritten to avoid. The neighbouring inert cases already discriminate on stream/exit (`git` absent from `PATH`, no `.git` — both exit non-zero *with* stderr), so the distinction is load-bearing across the whole branch table, not just here. One clause: "any line **on stdout**"; stderr and exit status are what discriminate inert cases (b)–(d). Pin the stream in O-16 alongside the probe order. | AC-6.6 oracle + inert cases (a)–(d); §10 O-16 |

No High or Medium findings.

## Questions

| ID | Question |
|---|---|
| Q-01 | AC-6.6's oracle keys on `git status --porcelain` output, which is silent for ignored paths. Nothing in §3 forbids a future `.gitignore` entry for `pdlc/workflows/dist/` — it would contradict AC-6.1's tracked-and-committed requirement, but the contradiction is only detectable by AC-6.3, not by AC-6.6, which would simply go permanently inert under case (a). Is that worth one sentence in AC-6.6's inert list ("`dist/` ignored ⇒ skip loudly, not silently"), or is AC-6.1 considered sufficient cover? |
| Q-02 | O-17 pins the fixture's construction and expected 7 paths but not its *provenance*. Is the fixture intended to be a literal copy of today's seven files (in which case it drifts from being "today's pre-landing layout" only by intent) or minimal synthetic stubs containing the five patterns? The second is stable and cheap; the first re-creates the maintenance coupling the fixture exists to avoid. |

## Positive Observations

- Both v15 findings are resolved, and F-01's repair is independently reproducible — I built the untracked-`dist/` tree and watched `git diff HEAD` return empty where `git status --porcelain` returns `??`. That is three consecutive rounds where the delta was verifiable by measurement rather than asserted.
- AC-6.4's two-root split is the right structural answer to the TE finding, not a patch over it: emptiness is the property that must hold on a moving tree, cardinality is the property that must hold on a frozen one, and putting each on the input where it is stable removes the contradiction rather than choosing a winner. The explicit sentence "they are never both evaluated over the same tree" is what stops the next reader re-merging them.
- AC-6.6's `--porcelain` rationale generalises correctly beyond the landing commit — "the same hole would reopen on every later commit that adds a *new* bundle" is the observation that turns a one-off fix into an invariant.
- §6's "Enforcement surface, stated explicitly" paragraph is the honest form: it names the bypass (a maintainer who commits without running `npm test`), scopes it to five ACs by ID, and says which pre-existing property became load-bearing and why. Specs usually leave this implicit and downstream reviewers rediscover it.
- AC-6.6's "accepted residual" paragraph, ending in "no acceptance test should attempt to detect the landed case", saves a test engineer a round trying to construct a state the design deliberately does not cover.

## Recommendation

**Approved with minor changes**

Both round-15 findings are closed with verified repairs, and the two remaining findings are Low,
Local, single-clause corrections to oracles the REQ itself elected to state — one naming the
matching base for AC-6.4's exemptions, one naming the stream for AC-6.6's. Neither contests need,
scope, priority or phasing; per §10 O-13's stopping rule this REQ is past its bar. F-01 should
land as a one-clause REQ edit in the FSPEC-entry commit (the fixture assertion is currently
under-determined and has a plausible reading under which it can never pass); F-02 may equally be
discharged there or bound into O-16 with the probe order.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
