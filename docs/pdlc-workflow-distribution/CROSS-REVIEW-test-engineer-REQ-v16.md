# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v17.0, `ba9ab18`)
**Date:** 2026-07-28
**Iteration:** 16
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** `git diff d2f8b72..ba9ab18 -- docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v16.0 → v17.0).

> **Iteration index.** Dispatched as "iteration 4" with instructions to read `-v3` and file `-v4`.
> `CROSS-REVIEW-test-engineer-REQ-v{1..15}.md` are committed on this branch and the document under
> review is v17.0, so this is iteration **16** and is filed as `-v16`; filing `-v4` would have
> overwritten a prior review. Fifteenth consecutive wrong index — already routed to queue row 8
> (`pdlc-review-loop-hardening`, POSTMORTEM-R R-3/R-4) and acknowledged in §11 of the REQ. Not
> re-filed as a finding.

> **Stopping rule (§10 O-13) applied.** All four of my v15 findings are closed. The three findings
> below are one-clause implementability defects in the *replacement* command v17 introduced; none
> contests need, scope, priority or phasing, and each is routable to TSPEC as written. Under O-13
> that is the signal the REQ met its bar. Recommendation is **Approved with minor changes**.

## Disposition of my v15 findings

| v15 ID | Sev | Status in v17 | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved.** AC-6.4 now names two roots and states explicitly that the two assertions "are never both evaluated over the same tree": `coveredViolations(liveRepoRoot) == ∅` is the landing criterion; `\|coveredViolations(fixtureRoot)\| == 7` + exact paths + literal exemption list run over a pinned fixture under `pdlc/workflows/__tests__/fixtures/`. The self-contradiction is gone and the anti-widening guard survives it. I verified the fixture location is viable: `pdlc/workflows/__tests__/fixtures/` already exists and is in jest's `testPathIgnorePatterns`, so fixture content is not collected as a suite; and fixture files carrying the five superseded patterns cannot break the live-root `== ∅` assertion, because exemption (iv) (`any __tests__/`) covers them. | AC-6.4 items 1–2; §10 O-17; `pdlc/workflows/package.json` jest config |
| F-02 | Medium | **Resolved.** The oracle is now `git status --porcelain -- pdlc/workflows/dist/` producing any line, with the reasoning for the change recorded inline, and O-16 gains the untracked-addition red fixture. I re-verified the mechanics at HEAD: `git status --porcelain` reports `??` for never-added paths, so the landing commit that first populates `dist/` is red under an unbumped version — the false-green I raised is closed. Residue in F-01/F-02 below concerns *other* properties of the same replacement command. | AC-6.6 oracle; §10 O-16 |
| F-03 | Low | **Resolved.** AC-6.6 now carries an explicit "**Accepted residual — a violation that already landed is not detected here**" paragraph, names the release-checklist P1 fallback on the AC-6.2a pattern, and instructs that no acceptance test should attempt to detect the landed case — which is exactly what a TSPEC author needs so they do not write an unpassable test. | AC-6.6 accepted-residual paragraph |
| F-04 | Low | **Resolved.** §7 BL-01 states the spike may populate `dist/` with an arbitrary-bytes placeholder, removes it afterwards, covers the committed-vs-working-tree install case via a throwaway branch, and scopes AC-6.2's write prohibition to the jest suite. The row is now dischargeable before FSPEC. | §7 BL-01 |

All four disposed. Nothing I raised in v15 remains open.

## Verification performed on v17 (changed sections only)

All commands run at `ba9ab18` in this working tree.

- **`git status --porcelain -- pdlc/workflows/dist/` on the absent directory writes a warning to
  stderr and nothing to stdout, exiting 0.** Measured: stdout length 0; combined output
  `warning: could not open directory 'pdlc/workflows/dist/': No such file or directory`. The
  superseded `git diff HEAD -- pdlc/workflows/dist/` is silent on the same input (measured). This
  is a behaviour difference introduced by the v17 replacement — F-01 below.
- **`--porcelain` suppresses ignored paths.** Built a throwaway repo, gitignored a directory
  containing an untracked file: `git status --porcelain -- d/` is empty while `git check-ignore -q
  d/` exits 0. So a future `.gitignore` entry for `dist/` silently converts the oracle to inert
  case (a) — F-02 below. Confirmed the guard is available and cheap.
- **`dist/` is still neither present nor ignored at HEAD** (`git check-ignore` exits 1, directory
  absent), so the REQ's parenthetical verification claim in AC-6.6 is accurate as written.
- **The fixture location is sound.** `pdlc/workflows/__tests__/fixtures/` exists today (holds
  `tmpGitFixture.js`) and jest's `testPathIgnorePatterns` already excludes both `__tests__/helpers/`
  and `__tests__/fixtures/`, so O-17's tree will not be collected as tests and, per exemption (iv),
  will not pollute the live-root `== ∅` assertion. No new infrastructure is implied by O-17.
- **AC-6.4's pattern set is unchanged from v16**, only the assertion structure changed, so the
  measured covered set of 7 that I reproduced mechanically in v15 still holds. Not re-derived.
- **No contradiction introduced into AC-6.1/6.2/6.3 by the new §6 enforcement paragraph.** It
  restates the absence of a pre-commit hook and of hosted CI (D-DIST-06) — both already normative —
  and does not add a rule. One labelling nit is Q-01.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-6.6's "produces any line" does not say which stream, and the new command writes a line to stderr on the ordinary pre-`dist/` tree.** Measured at HEAD: `git status --porcelain -- pdlc/workflows/dist/` exits 0 with empty stdout but emits `warning: could not open directory 'pdlc/workflows/dist/': No such file or directory` on stderr; the superseded `git diff HEAD` form was silent on the same input. An implementation that captures combined output (`$(cmd 2>&1)`, or `execSync` with merged stdio) reads that warning as "any line", and since working-tree `plugin.json` `version` equals `HEAD`'s on a clean tree, the AC is **red on every run** until `dist/` exists — the steady-state red this REQ twice designed against (AC-6.6's own rationale; the v16 AC-6.4 repair). The direction is false-red, so it is loud rather than silent, which is why this is Low and not blocking. **Minimal repair (two words):** "produces any line **on stdout** (stderr is advisory; `git` warns when the directory does not exist)". Add the absent-`dist/` case to O-16's probe list so TSPEC pins stdout-only capture. | AC-6.6 oracle ("produces **any** line"); AC-6.6 inert case (a); §10 O-16 |
| F-02 | Low | Local | **`git status --porcelain` does not report ignored paths, so a later `.gitignore` entry for `dist/` converts AC-6.6 to permanently inert-green — and this REQ adds gitignore entries for generated bundles in the same landing commit.** Verified in a scratch repo: with `d/` gitignored, `git status --porcelain -- d/` is empty even though `d/f.js` exists untracked. AC-6.1 simultaneously declares `pdlc/workflows/dist/` "tracked and committed" **and** makes this repo's `.claude/workflows/*.bundle.js` "untracked, gitignored consumer copies" — two generated bundle trees with opposite git treatment, landing together. The natural future mistake (gitignore the build-output directory) makes case (a) fire forever with the reason string "nothing to advertise", which is indistinguishable from the true ordinary case. AC-6.2's packaged-set assertion is a partial backstop but tests a different property. **Minimal repair (one clause):** make an ignored `dist/` a **hard fail, not an inert skip** — `git check-ignore -q pdlc/workflows/dist/` exiting 0 fails with "`dist/` is gitignored; AC-6.1 requires it tracked, and this oracle cannot see ignored paths". Verified the probe is available and exits 0/1 cleanly. Route to O-16 as a fifth probe. | AC-6.6 oracle + inert case (a); AC-6.1 ("tracked and committed" vs gitignored `.claude/workflows/`); §10 O-16 |
| F-03 | Low | Local | **BL-01's placeholder clause turns the spike into an AC-6.6 red, and the row does not say so.** §7 BL-01 now instructs the spike to populate `pdlc/workflows/dist/` with a placeholder `distribution-manifest.json`. With that placeholder present, `git status --porcelain -- pdlc/workflows/dist/` is non-empty; if `plugin.json` `version` is unchanged (it will be — the spike is a measurement, not a release), any `npm test` run during the spike is red by AC-6.6. The row anticipates the AC-6.2 write prohibition but not this one. Cost of missing it: a maintainer discharging BL-01 sees a red suite, assumes they broke something, and reverts the placeholder — silently downgrading the row back to the echo form v16 removed. **Minimal repair (one clause on BL-01):** "AC-6.6 will be red while the placeholder is present; that is expected — the spike does not run `npm test`, or bumps `version` on the throwaway branch." | §7 BL-01 placeholder clause vs AC-6.6 oracle |

## Questions

| ID | Question |
|---|---|
| Q-01 | §6's new enforcement paragraph lists AC-6.4 among "every AC in §3 that names `npm test` as its Who", but AC-6.4's Who is "the maintainer" while its Then says "a test asserts …" (and AC-6.6's Who is "the jest suite (assertion) and the maintainer (the act)"). A TSPEC author reads Who to assign ownership. Is AC-6.4's Who intended to be the jest suite, with the maintainer owning only the rephrasing act? One word, and it does not gate. |
| Q-02 | F-02: is `pdlc/workflows/dist/` intended to stay tracked indefinitely, or is a future gitignore anticipated once the marketplace packages from a build step? If the latter, AC-6.6 needs a different observation point and this is worth deciding at FSPEC rather than discovering it. |

## Positive Observations

- **Both blocking findings from round 15 were closed by document text, with the *reasoning* for the
  replacement recorded inline** — the fifth consecutive round where that is true. AC-6.6 now carries
  a paragraph explaining why `--porcelain` and not `git diff HEAD`, including the specific untracked
  landing-commit case; the next reviewer does not have to re-derive it, and neither does the TSPEC
  author.
- **The AC-6.4 two-roots repair is the right shape and is verifiable today.** I checked the two
  properties that could have made it unimplementable — fixture files must not break the live `== ∅`
  assertion (exemption (iv) covers them), and jest must not collect the fixture tree
  (`testPathIgnorePatterns` already excludes `__tests__/fixtures/`) — and both hold without any new
  infrastructure. The landing criterion and the anti-widening guard are now independently
  falsifiable, which is what my v15 F-01 asked for.
- **The accepted-residual paragraph in AC-6.6 is the honest form.** It names the gap, names the P1
  surface that covers it, and explicitly instructs that no acceptance test be written for the landed
  case. A TSPEC author would otherwise spend a day on a test that cannot pass. This is the pattern I
  would want copied to every AC that trades detection scope for oracle stability.
- **§6's enforcement paragraph closes the honesty gap the whole §6 rested on.** Stating outright
  that AC-6.2–6.6 are enforced by maintainer discipline plus `npm test` until D-DIST-06 means no
  downstream reader mistakes "the jest suite asserts" for "CI blocks the merge".
- **BL-01 is now dischargeable before FSPEC** and, unusually, says what to do when the packaging
  mechanism copies committed rather than working-tree content — a failure mode most spike rows
  discover only by hitting it.

## Recommendation

**Approved with minor changes**

No High or Medium findings. All four of my v15 findings are closed by document text, and both v15
blockers — AC-6.4's self-contradiction and AC-6.6's untracked-file blind spot — are verifiably
repaired against the real `git` behaviours I measured in this tree.

The three remaining findings are Low and mechanical: name the stream in AC-6.6's "any line" (F-01),
make a gitignored `dist/` a hard fail rather than an inert skip (F-02), and note in BL-01 that the
placeholder makes AC-6.6 red (F-03). Each is one clause and each is routable to §10 O-16 as a TSPEC
obligation rather than a REQ revision. None contests need, scope, priority or phasing — the §10 O-13
condition for moving findings downstream instead of iterating. Blocking count went 2 → 0; the loop
has converged and should not spend another round on Lows.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
