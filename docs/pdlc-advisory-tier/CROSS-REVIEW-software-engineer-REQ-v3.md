# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review — v2 findings F-16…F-19, plus new issues in changed sections only

## Review base

Diffed `0bc2841..HEAD` on the REQ (+53/−25, 7 revision commits, 343→371 lines). Every
existing-behaviour claim in the changed text was re-checked against the base the REQ now **pins**,
default-branch commit `26c3f1c` — which I confirmed is a real commit, is an ancestor of
`origin/main`, and is in fact `origin/main`'s tip today (`git merge-base --is-ancestor 26c3f1c
origin/main` → 0; `git log -1 origin/main` → `26c3f1c`). Pinning it was the right move: this branch
is still behind that tree, so an unpinned "written against main" would have drifted silently.

Facts re-verified at `26c3f1c` for the changed text only:

| Claim in changed text | Verified at `26c3f1c` |
|---|---|
| The A1 gate is `precheckDependencies`, and it is one-sided — it can only prove *blocked* | `pdlc/workflows/orchestrate-queue.js:630-648`; `done`/absent-from-queue fall through, doc comment `:618-627` |
| That pre-check runs **before** any agent, and a `blocked` result skips the candidate outright | `orchestrate-queue.js:890-899` (`precheck.blocked` → `emit` + `skipped.push` + `continue`); triage dispatch only after, `:901-905` |
| The harvest delete-guard refuses by denying the tool call, so the file survives | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:52-60` (stderr message + `sys.exit(2)`); two-prefix match `:35`, `:43` |
| The shipped in-process notices are merge-specific and frozen | `orchestrate-dev.js:1321-1328` (`MERGE_ESCALATIONS`, `Object.freeze`), emitted `:908`, `:920`, `:950`, `:1509`, `:1542` |
| Every shipped literal contains the substring `ESCALATION:`, so AC-10.5's one-grep claim holds | same lines — each begins `MERGE ESCALATION: ` |
| `gh run rerun` is a *write* against Actions, unlike every CI surface used today | BL-06's premise; the shipped surface is the read `gh pr view --json statusCheckRollup` (`orchestrate-dev.js:323`) |

Still no `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is
contradicted.

## Disposition of v2 findings

All four are closed.

| v2 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-16 | Medium | **Resolved** | AC-4.5's A1 row no longer claims a state the pre-check cannot observe: it now reads "the pre-check returns not-blocked (AC-5.1)". AC-5.1 states the one-sidedness in the REQ's own words ("establishes only that no declared dependency has a not-`done` queue row, never that a dependency is present in base") and answers "who establishes presence in base" honestly — **nobody**: where presence is unsettled the advisory verdict is `escalate`, and "no advisory agent adjudicates presence in base". That matches `orchestrate-queue.js:630-648` exactly. A residual wording point about the re-run's falsifiability is filed as F-20, Low. |
| F-17 | Medium | **Resolved** | AC-3.6 is now an **ordered** eight-row trigger→reason table with first-match-wins, which makes the mapping injective by construction: the v2 collision between `revert-on-test-touch` and `out-of-envelope` is resolved by rank (2 before 3), and the missing case is added as `post-action-verification-failed` (rank 4), explicitly citing the AC-4.5 gate and the AC-7.4 re-run — both of the events I named. The closing sentence commits to set-equality over the full enumeration, which is the completeness oracle I asked for rather than a containment check. One residual, non-blocking totality gap is filed as F-21, Low. |
| F-18 | Low | **Resolved** | Both halves are declared. **BL-06** is new and names the E-1 capability precisely as a *write* against Actions requiring the token scope, distinguishing it from every read the pipeline performs today, and carries the same unavailable-behaviour clause ("E-1 is out of envelope and the seam escalates under the same clause as BL-05"). **BL-05** is widened to cover "AC-8.4's comparison **and** E-2's *introduced* test", which is the shared merge-base/default-branch check-history surface E-2 now depends on. |
| F-19 | Low | **Resolved** | AC-10.5 stops asserting a literal it does not own. It now describes the shipped channel as "Phase MERGE's, under its own frozen, merge-specific prefix" — accurate against the frozen `MERGE_ESCALATIONS` catalogue (`orchestrate-dev.js:1321-1328`) — states that catalogue is "left exactly as it is, **not widened**", and gives the advisory tier a distinct sibling prefix whose literal is TSPEC's. The added invariant that both prefixes carry the shared `ESCALATION:` token is true of the shipped side: every one of the five emission sites begins `MERGE ESCALATION: `, which contains `ESCALATION:`. |

## Findings

Numbering continues from v2. Both are in text this round introduced, and both are Low — neither
questions the design, and neither blocks FSPEC authoring.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-20 | Low | Local | **AC-4.5's A1 re-run is unfalsifiable, and the row should say so rather than imply verification.** The revision correctly narrows the A1 gate to what `precheckDependencies` can observe — but that pre-check has already run, and already returned not-blocked, before A1 can exist: `orchestrate-queue.js:890-899` skips a `precheck.blocked` candidate with `continue` and never dispatches triage, and §1's own A1 row says the seam fires on a `needs-human` **triage** verdict. So the state "the pre-check returns not-blocked" is entailed by A1 having fired at all, and re-running the gate after an A1 verdict — which produces no diff, only `run-candidate`/`hold`/`escalate` — cannot change its answer. Consequences worth pre-empting: (i) AC-4.5's framing ("a gate re-runs and reaches its own verdict — the advisory tier fixes causes; gates decide outcomes") is not true at A1, where no cause is fixed and no gate decides; (ii) AC-4.6 requires every prohibition to carry "a failing test proving the prohibition holds", and the A1 row has no reachable state in which the gate could be red, so that test cannot be written to fail — the TE will otherwise chase it. Likewise AC-5.1's "may never return `run-candidate` for a candidate the pre-check reports blocked" is vacuously satisfied for the same reason. Suggested fix, purely textual: say in the A1 row that A1 has **no falsifiable post-check** — the pre-check is a precondition of the seam, not a verification of its output — and that A1's safety therefore rests on AC-5.1's abstention-only restriction plus the escalate-when-unsettled rule, with AC-4.6's test obligation for A1 discharged against those instead. | AC-4.5 (A1 row), AC-4.6, AC-5.1 |
| F-21 | Low | Local | **AC-3.6's reason set is total for every *action* refusal but has no row for an advisory agent's own abstention.** AC-5.1 now creates exactly that outcome: "where presence in base is therefore unsettled, the advisory verdict is `escalate`" — an escalation with high confidence, no proposed diff, no prohibition, no budget or parse failure. Walking the ordered table: rows 1, 2, 4, 5, 6, 8 plainly do not match; row 7 requires `confidence != high`; row 3's trigger is worded "any other out-of-envelope **proposal** or reverted diff", and there is no proposal. Since AC-3.6 declares the set closed and commits to a set-equality assertion, an implementer facing this outcome has to either invent a token (breaking set-equality) or stretch row 3. The cheapest fix is one sentence rather than a ninth member: state that an advisory verdict that declines to act reports `withinEnvelope: false` per AC-2.1/AC-2.2 and therefore takes row 3, and reword row 3's trigger to "any other verdict that is out of envelope (proposal, reverted diff, or a decline to act)". If instead a distinct token is wanted for a considered abstention, add it explicitly — the `ESCALATIONS.md` consumer (`pdlc-engineering-loop`, AC-10.4) reads these as a log and a mislabelled abstention is durable noise. | AC-3.6, AC-5.1, AC-2.1/AC-2.2 |

## Questions

Q-06 is answered: AC-9.3 now names the last appender explicitly — Phase PUB, seam A5, "no seam
fires at Phase MERGE, merging being out of scope" — and gives the observable ("`ADVISORY-{feature}.md`
is absent at end of run and its content is in LEARNINGS"). Q-01 is answered in substance by the
same clause and downgraded to a note.

| ID | Question |
|----|---------|
| Q-07 | AC-9.3 requires distil-and-delete **after** Phase PUB, but harvest runs at Phase H, which precedes PUB. The REQ states this as an outcome and leaves the mechanism to TSPEC, which is the right altitude — I raise it only so the TSPEC author knows it is a real structural change (a second, post-PUB distil pass, or moving the advisory record's delete out of `harvest-learnings`), not a parameter tweak. Is the intent that `harvest-learnings` itself gains a post-PUB invocation, or that the advisory record is harvested by a separate step the H-phase guard simply never sees? |
| Q-08 | (note, not blocking) §7 still carries no entry for "the tier never diagnoses a `deferred`/`refused` Phase MERGE outcome". AC-9.3's parenthetical settles that no *seam* fires there, which answers v2's Q-01 as scoping. Worth a one-line D-ADV row so a later reader sees it was decided rather than overlooked? |

## Positive Observations

- The pin in BL-02 is the single best change in this round. "Written against `main`" was a claim
  that decays; "pinned for re-verification at default-branch commit `26c3f1c`" is one an approver
  can check years later, and the added sentence "a later default-branch commit is a fresh check,
  not an inherited one" states the decay rule instead of leaving it to be re-litigated.
- AC-3.6's move from an unordered closed set to an **ordered** table with first-match-wins is the
  right structural answer to injectivity: it makes a multi-trigger refusal decidable without
  enumerating pairs, and it survives adding a ninth member later.
- AC-5.1's resolution of F-16 is more honest than what I asked for. I asked which non-advisory
  actor establishes presence in base; the answer "none, and where it is unsettled the verdict is
  `escalate`" is a better fit to US-05 than inventing a checker would have been.
- The E-2 / AC-8.4 precedence sentence makes two rules that were independently stated into one
  ordered evaluation, and it costs nothing at runtime — the two predicates are mutually exclusive
  by construction (E-2 needs the check *passing* at the tip, AC-8.4 fires when it *fails* there),
  so declaring an order removes an ambiguity that could never actually bite. Cheap and correct.
- AC-3.4(d) pinning the scope baseline to "its head at the seam's dispatch (at A4, the pre-rebase
  head)" closes the one place where the envelope could have widened itself: without it, a rebase
  that pulls in files would have enlarged "files the branch had already touched" mid-seam.
- AC-9.3's new observable — refusal message plus the file surviving — is exactly what the guard
  does (`guard-harvest-before-delete.sh:52-60`, stderr then `sys.exit(2)`), so the extension to
  `ADVISORY-*` is a one-token change to a mechanism that already behaves as described.

## Recommendation
