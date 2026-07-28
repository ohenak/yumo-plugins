# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v16.0, `d2f8b72`)
**Date:** 2026-07-28
**Iteration:** 15
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** `git diff 895940f..d2f8b72 -- docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v15.0 → v16.0).

> **Iteration index.** Dispatched as "iteration 3" with instructions to read `-v2` and file `-v3`.
> `CROSS-REVIEW-test-engineer-REQ-v{1..14}.md` are committed on this branch and the document under
> review is v16.0, so this is iteration **15** and is filed as `-v15`; filing `-v3` would have
> destroyed a prior review. Fourteenth consecutive wrong index — already routed to queue row 8
> (`pdlc-review-loop-hardening`, POSTMORTEM-R R-3/R-4). Not re-filed as a finding.

> **Stopping rule applied (§10 O-13).** "This AC has no oracle / no fixture / no test seam" is
> answered by §10's obligation table, not by a REQ revision, and I applied that rule literally
> again. The findings below survive it: all three concern oracles the REQ **itself elected to
> state**, and each is wrong in the falsifying direction. F-01 in particular is a *newly
> introduced* self-contradiction in v16 — not a re-litigation.

## Disposition of my v14 findings

| v14 ID | Sev | Status in v16 | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved.** AC-6.6 abandons the history walk and observes the working tree against `HEAD`, matching AC-6.3's observation point: red iff `git diff HEAD -- pdlc/workflows/dist/` is non-empty **and** working-tree `plugin.json` `version` equals `HEAD`'s. No steady-state red, no ancestor requirement, and the rationale paragraph records *why* both prior readings failed. Residue in F-02 below (untracked files), which is a different defect in the replacement command, not the one I raised. | AC-6.6 |
| F-02 | Medium | **Resolved.** §7 BL-01 now carries a positive-presence exit criterion — install a locally built package, `test -r` the installed `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json`, byte-compare against the repo copy — and explicitly states that echoing a resolved path does not discharge the row. §0 fact 3 was repointed at that wording ("closed by **measurement, not by echo**"). One implementability nit in F-04. | §7 BL-01; §0 fact 3 |
| F-03 | Low | **Resolved.** AC-6.6 enumerates four inert cases (clean `dist/`, `git` absent from `PATH`, no `.git`, unborn `HEAD`), each skipping loudly on the §10 O-11 pattern, and correctly notes shallow clones and linked worktrees are no longer inert because `git diff HEAD` needs no ancestry. O-16 carries the probe order and reason strings to TSPEC. | AC-6.6 inert cases; §10 O-16 |
| F-04 | Low | **Resolved.** §4's exits row states "`1` is reachable only under `--check`" with the derivation and the explicit instruction that no acceptance test should attempt to construct a sync run exiting `1`. | §4 exits row |
| F-05 | Low | **Resolved as to the mechanism; the assertion it added is F-01.** Exemption (ii) is now mechanical — a per-feature dir is a `docs/<X>/` containing `REQ-<X>.md` — and I reproduced the covered set at exactly 7 under that rule (below). The "5, not 3" correction to my own arithmetic is right. | AC-6.4 exemption (ii) |

All five disposed. Nothing I raised in v14 remains open.

## Verification performed on v16 (changed sections only)

- **The mechanised exemption (ii) reproduces the covered set at exactly 7.** Re-ran the five
  literal patterns (`grep -rIl`, excluding `.git`/`node_modules`): 32 matching files. Applying the
  rule "`docs/<X>/` containing `REQ-<X>.md`" classifies `docs/orchestrate-dev-workflow/` (7 hits)
  and `docs/pdlc-workflow-distribution/` (13 hits) as exempt and `docs/_queue/`, `docs/design/`,
  `docs/ideas/`, `docs/requirements/` as covered; with (i) `.claude/workflows/` (4 hits) removed,
  exactly the enumerated 7 survive. **No judgement step remained** — I did not have to decide
  anything the rule did not decide for me, which is the property the v15 text lacked.
- **The "5, not 3" figure is correct.** Under "any `docs/` subdirectory", `docs/_queue/QUEUE.md`
  and `docs/design/MASTER-PLAN-engineering-loop.md` drop out and
  `docs/PLAN-pdlc-integration-boundary-gates.md` (a file directly under `docs/`, not in a
  subdirectory) does not — 7 → 5. My v14 F-05 said 3; the REQ's arithmetic is right and mine was
  wrong.
- **AC-6.6's replacement oracle is falsifiable for the tracked-modification case.** `git diff HEAD
  -- pdlc/workflows/dist/` is non-empty for staged *and* unstaged modifications and for tracked
  deletions; combined with the `version`-equality conjunct, a dirty-`dist/`-unbumped-version tree
  is red today. It is **not** non-empty for untracked additions — F-02.
- **`pdlc/workflows/dist/` is neither present nor ignored at HEAD.** `git check-ignore` returns
  non-zero and the directory does not exist, so the tree will be tracked when created, which is
  what AC-6.6 and AC-6.3 both require. It also means the first commit that populates `dist/`
  consists entirely of *untracked* files — the exact case F-02 shows the oracle misses.
- **No contradiction introduced into §4 or AC-3.x.** Replayed the new `1`-is-`--check`-only
  sentence against AC-3.1/3.2/3.3/3.7/3.8/3.9; it is a consequence of the post-run rule, not a new
  rule.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-6.4's two stated assertions are mutually exclusive on the same input, so the AC's own oracle cannot be implemented — and the cardinality half is a steady-state red, the exact failure mode v16 just removed from AC-6.6.** The Then says a test asserts `coveredViolations(repoRoot) == ∅` "when the feature lands" — i.e. the 7 named documents are rephrased so nothing matches. The new sentence says "the test asserts **both** the exemption list itself **and** the covered set's cardinality against the enumerated 7 below". Over one `repoRoot` the covered set cannot be both `∅` and 7. Whichever the implementer picks, one of the AC's sentences is violated on the landing commit; if they pick 7 (the newer, more emphatic sentence), the test is red from the moment the rephrasing lands and stays red forever — disabled within a week, exactly as the v16 note argues about the old AC-6.6. I raised the *goal* correctly in v14 F-05 (a widened exemption must be red even when the exemption list text is unchanged) but the implementation chosen here is not writable. **Minimal repair (one clause, no altitude change):** the two assertions need two inputs — (a) over the live `repoRoot`, `coveredViolations == ∅` (the landing criterion); (b) over a **pinned fixture tree** checked into `__tests__/fixtures/` that reproduces today's pre-landing layout, `\|coveredViolations\| == 7` and the returned paths equal the enumerated 7. (b) is the anti-widening guard and is stable forever because the fixture never changes; (a) is the criterion. State which input each assertion runs against. | AC-6.4 Then (`== ∅`) vs AC-6.4 "asserts **both** … the covered set's cardinality against the enumerated 7"; the enumerated 7 list |
| F-02 | Medium | Local | **AC-6.6's oracle command is blind to untracked files under `dist/`, so it is green on the highest-risk commit — the one that first ships `dist/`.** `git diff HEAD -- <path>` reports only tracked-path differences; a new, never-added file under `pdlc/workflows/dist/` is invisible to it. Verified at HEAD: `pdlc/workflows/dist/` does not exist and is not gitignored, so **every** file in the first commit that populates it is untracked at `npm test` time, `git diff HEAD -- pdlc/workflows/dist/` is empty, the AC's inert case (a) fires ("nothing to advertise"), and the run is green with a brand-new bundle set shipping under an unchanged advertised version. The same hole reopens whenever a *new* workflow bundle is added later — precisely when the marketplace most needs a re-advertisement. This is the same class of false-green (an oracle that cannot fire when the violation occurs) that v14 F-01 closed; the replacement command reintroduces a narrower instance of it. **Minimal repair (one clause):** define non-empty as `git status --porcelain -- pdlc/workflows/dist/` producing any line (which covers `??`, `A`, `M`, `D` alike), or equivalently `git diff HEAD` **union** `git ls-files --others --exclude-standard -- pdlc/workflows/dist/`. Add the untracked-addition case to O-16's probe list so TSPEC pins it. | AC-6.6 ("Oracle: red iff `git diff HEAD -- pdlc/workflows/dist/` is non-empty"); AC-6.6 inert case (a); §10 O-16 |
| F-03 | Low | Local | **AC-6.6 has no detector for a violation that already landed, and the REQ does not record that residual.** The working-tree form is correct (F-01 of v14 stands resolved), but its scope is strictly "the commit about to be authored", and nothing forces `npm test` to run before a commit — there is no pre-commit hook in this repo and no hosted CI (D-DIST-06). Once a violating commit lands, `git diff HEAD -- dist/` is empty forever after, inert case (a) fires, and **no criterion in §6 will ever detect it**; the old history form did. The v16 rationale gestures at this ("nothing would force a later audit run anyway") but does not state it as an accepted residual or name a fallback. One sentence, on the AC-6.2a pattern: name the release checklist as the P1 fallback ("before publishing, confirm `plugin.json` `version` differs from the previously published release whenever `dist/` bytes differ"), or state explicitly that the residual is accepted and why. A TSPEC author otherwise writes a test for the landed case and cannot make it pass. | AC-6.6 rationale ("nothing would force a later audit run"); AC-6.2a (the P1 pattern to copy); D-DIST-06 |
| F-04 | Low | Local | **BL-01's exit criterion references an artifact that does not exist at the time the spike must run.** §7 gates BL-01 "Before FSPEC" and its criterion byte-compares the installed manifest against "`pdlc/workflows/dist/distribution-manifest.json` in this repo" — but `dist/` is produced by this feature's own implementation and is absent at HEAD (verified). As written the row is undischargeable until after the work it gates. The fix is one clause: say the spike may populate `pdlc/workflows/dist/` with a **placeholder** file of arbitrary bytes for the purpose of the packaging measurement (the claim under test is "a nested build-output directory survives packaging", which any file proves), and that the placeholder is removed afterwards. Without it, an implementer either blocks or silently downgrades the row back to the echo form the v16 edit just removed. | §7 BL-01 resolution form; §0 fact 3 |

## Questions

| ID | Question |
|---|---|
| Q-01 | F-01: is the enumerated-7 cardinality intended as a *fixture* assertion (stable forever) or as a live-repo assertion (red after landing)? If the latter, what makes it ever go green? |
| Q-02 | F-03: is the landed-violation case an accepted residual, or is a P1 release-checklist row intended to cover it as AC-6.2a covers packaging? |

## Positive Observations

- **All five of my v14 findings were fixed as document text, none deferred to §10 as a dodge** —
  the fourth consecutive round where that is true. AC-6.6's rewrite in particular does not merely
  patch the oracle: it records both failed readings and why each fails, which is the form that
  stops the next reviewer re-deriving the same analysis.
- **Exemption (ii) is now genuinely mechanical, and I could verify that by construction.** My v14
  complaint was that reproducing the count required judgement; this time I ran the rule and it
  decided every directory for me, including the four `docs/` subdirectories the v15 text left
  ambiguous. The covered set came out at exactly 7 with no discretionary step. This is the
  difference between a checkable AC and a plausible one.
- **The REQ corrected my arithmetic rather than accepting it.** I asserted "any `docs/`
  subdirectory" would drop the set to 3; the true figure is 5, because
  `docs/PLAN-pdlc-integration-boundary-gates.md` is not in a subdirectory. Taking the finding
  while fixing the number is the right response and I have re-verified 5 independently.
- **§0 fact 3's "closed by measurement, not by echo"** is the correct epistemic framing and the
  BL-01 row now carries the positive-presence conjunct (`test -r` + byte-compare) rather than a
  proof that succeeds by string interpolation. F-04 is an implementability nit about *when* the
  row can run, not about the criterion.
- **The `1`-is-`--check`-only note saves a fixture that cannot be built.** It is exactly the kind
  of derived fact that costs a TSPEC author a day, written down where they will hit it.

## Recommendation

**Needs revision**

One High and one Medium, both one-clause repairs to oracles the REQ elected to state. F-01 is an
internal contradiction *introduced by v16* — AC-6.4 now asserts a covered set that is
simultaneously `∅` and 7 — and the fix is to say which input each assertion runs against (live
repo for `∅`, a pinned fixture for 7). F-02 is a false-green in AC-6.6's replacement command:
`git diff HEAD` cannot see untracked files, and `dist/` is untracked at HEAD, so the first commit
that ships it passes unbumped; `git status --porcelain` closes it. The two Lows are one-sentence
clarifications and need not gate.

Neither blocking finding contests need, scope, priority or phasing, so the O-13 stopping rule's
"REQ met its bar" clause is satisfied on substance. Note for the orchestrator: the blocking count
went 2 → 2 across rounds 14 and 15, which is the POSTMORTEM-R fixed-point signal (two consecutive
rounds of non-decreasing blocking count) — but the *content* turned over completely (all five v14
findings closed; both blockers here are defects in the v16 edits themselves, one of them newly
introduced), so this is churn in the oracle text, not the plateau O-13 describes. If round 16
does not close both, escalate rather than iterate: both repairs are mechanical and neither
requires a product decision.
