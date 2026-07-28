# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v15.0, `cd57fa8`)
**Date:** 2026-07-28
**Iteration:** 14 (SE round 14, against REQ v15; the orchestrator labelled this loop "iteration 2" — v1..v13 already exist on this branch, so this file is v14 to avoid clobbering history)
**Scope:** REQ — delta re-review of the diff `09aa773..cd57fa8`, per the v14 stopping rule and §10 O-13

## Delta scope

Reviewed only the sections v15 changed: the v15.0 header note, §0 fact 3, §1 (SKILL quotations,
diagram annotation, A′→B decomposition table), AC-6.4, the new AC-6.6, §4 (`sync-workflows.sh`
exits row), NFR-2, §6 (in-scope additions), §9 US-04, §10 O-7/O-13/O-14, §11. Unchanged sections
already approved in v13 were not re-litigated.

## Disposition of my v13 findings

| v13 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-6.6 assigns the version-bump step an owner and an `npm test` oracle; §1's new two-row table splits A′→B into "the pin moves" (this REQ) and "the bump reaches the cache" (D-DIST-05); §9 US-04 is narrowed accordingly. Disposition (a) of the three I offered — the strongest. |
| F-02 | Medium | **Resolved (verified by measurement)** | AC-6.4's fifth pattern `opying the bundle into a consumer repo` matches exactly and only the two SKILLs — `pdlc/skills/orchestrate-dev/SKILL.md:98`, `pdlc/skills/orchestrate-queue/SKILL.md:183` — and none of the other four patterns matches either file, so the fifth is load-bearing, not decorative. I re-ran the full five-pattern grep minus the four exemptions: **7 files**, exactly the seven the AC lists. §1 now quotes both lines verbatim with file:line and both quotations are byte-accurate. The retitle ("No document states a superseded distribution convention") now claims what the checker computes. |
| F-03 | Low | **Resolved** | §0 fact 3 separates the measured clause from the evidenced one and cites `…/pdlc/0.10.0/workflows/__tests__/`; confirmed present in the installed cache. BL-01 extended to echo a `workflows/dist/` path. |
| F-04 | Low | **Resolved** | O-7 now reads "existence is mandated by AC-2.9(5) … only the grammar is downstream". No residual conditionality against AC-2.9(5)/§4. |
| F-05 | Low | **Resolved** | `pdlc/hooks/hooks.json` is now an enumerated §6 item with the reason ("Without this edit the hook never fires"). Confirmed today's `hooks.json` carries exactly one `SessionStart` entry, so a second entry is additive. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-6.6's oracle is stated ungated over `HEAD`, so a literal implementation goes red on every commit that does *not* touch `dist/`.** The Given clause scopes the criterion to "a commit that changes the bytes of any file under `pdlc/workflows/dist/`", but the Oracle sentence states the comparison unconditionally: "compare `plugin.json` `version` at `HEAD` against its value at the most recent earlier commit whose diff touched `pdlc/workflows/dist/`; equal ⇒ red." Walk it: commit C1 changes `dist/` and bumps to `0.11.0`; commit C2 is a docs-only commit at `0.11.0`. At `HEAD = C2` the most recent earlier `dist/`-touching commit is C1, both versions are `0.11.0`, so the oracle is red on a commit that did nothing wrong — and stays red until someone bumps the version for no reason. The AC's own restatement inherits the bug: "the advertised version is never equal to the version advertised by the previous commit that touched `dist/`" is false for any non-`dist/` commit by construction. This branch is the live proof case: `e56ccc7` changed `.claude/workflows/` (today's A′) with no `plugin.json` change, and the last `plugin.json` bump was `3c72025`, several commits earlier. Repair is one clause — add the gate to the oracle, not only to the Given: *"if `HEAD`'s own diff does not touch `pdlc/workflows/dist/`, the check passes without comparing; otherwise compare against the most recent **earlier** `dist/`-touching commit."* The intent is unambiguous, so this is a wording correction rather than a scope defect, and it is an oracle defect in O-13's sense — but it belongs in the REQ because the false invariant is written into the criterion's normative sentence, not into its test design. | AC-6.6 |
| F-02 | Low | Local | **AC-6.4 claims its exemption list is "enumerated literally so the set is computable without judgement", but member (ii) is not literal — and it is the discriminator for 2 of the 7 covered files.** (i), (iii) and (iv) are literal paths/filenames. (ii) is "per-feature `docs/<feature>/` artifact dirs", which requires deciding which `docs/*/` subdirectories are per-feature. Under the narrow reading the covered set is the 7 files the AC lists; under a naive literal `docs/*/` glob, `docs/_queue/QUEUE.md` and `docs/design/MASTER-PLAN-engineering-loop.md` are exempted too and the set silently drops to **5** — i.e. the two most normative non-SKILL documents fall out and the oracle stays green while they contradict the manifest. Since the AC asserts the exemption list itself (good), pin (ii) with a mechanical predicate: exempt `docs/<dir>/` iff `<dir>` contains a `REQ-*.md` (the per-feature marker), or simply exempt by explicit directory name and let a new feature dir be added in the same commit that creates it. Either makes the 7 reproducible without judgement. | AC-6.4 exemption (ii) |
| F-03 | Low | Local | **AC-6.6 introduces a fourth dependency on `git` history and does not say what happens when history is absent or truncated.** §4 declares `git` as the third external tool (≥ 2.7.0, for `worktree list --porcelain`) with a defined absence behaviour; AC-6.6 needs a materially different capability — `git log`/`git rev-list` over ancestry — and its stated inert-with-skip-reason branch is scoped only to "no such ancestor (fresh clone / initial landing commit)". A shallow clone (`--depth 1`, the common CI/agent checkout) presents the same symptom from a different cause and would skip silently forever, and `git` absent entirely is unhandled here. Add both to the skip-reason vocabulary, or state that the check is maintainer-repo-only and skips with a reason whenever ancestry is unavailable for any cause. | AC-6.6; §4 `git` row |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-6.6 asserts only that the pin *moved*, not that it increased. Is a downgrade (`0.11.0` → `0.10.0`) an accepted pass, or should FSPEC add the monotonicity assertion? The AC says "no semver policy" deliberately — confirming this is a decision, not an omission. |
| Q-02 | AC-6.6's landing commit is itself the first commit to create `dist/`, and §6 says `plugin.json` is bumped in it. With no earlier `dist/`-touching ancestor the oracle skips, so the landing bump is unenforced by its own test. Accepted (the bump is a §6 checklist item), or should the skip branch assert "no ancestor ⇒ `dist/` must be new in this commit"? |

## Positive Observations

- The v15 header note maps every round-13 finding to the section that answers it, which made this
  delta review mechanical. Diff-plus-disposition-note is the pattern that finally broke the loop.
- AC-6.4's covered set reproduces at exactly 7 under an independent five-pattern grep, and the
  fifth pattern is provably the only one matching the two SKILLs. The stem form
  (`opying the bundle into a consumer repo`) correctly tolerates both the capitalised and
  lower-case phrasings without a regex.
- §1's A′→B decomposition table is the right structural answer to v13 F-01: it names the failure
  mode, the owner, and the boundary against D-DIST-05, so the deferral is now a statement about a
  different step rather than a hole.
- NFR-2's restatement is a genuine improvement over "observed, not gated": bounded enumeration,
  no per-row spawn beyond the three declared tools, no network — all reviewable by reading the
  spec, none of them a flaky wall-clock assertion.
- O-13 now records that `docs/_constraints/` and `docs/_decisions/` do not exist on this branch
  and must be *created*. Confirmed — neither directory exists. That would otherwise have been
  discharged as "no such file".

## Recommendation

**Approved with minor changes**

Both v13 blocking findings are resolved, and resolved by measurement rather than by assertion.
The three findings above are one-line corrections; none contests need, scope, priority or
phasing, and none blocks FSPEC entry. Per §10 O-13, a round whose remaining findings are all of
this class is the signal that the REQ has met its bar — F-01 and F-03 should land as REQ wording
fixes in the FSPEC-entry commit (they are cheap and they change a normative sentence), and F-02
may equally land as an FSPEC-level pinning of the exemption predicate.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
