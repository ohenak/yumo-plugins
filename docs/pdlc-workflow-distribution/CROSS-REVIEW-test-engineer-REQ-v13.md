# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v14.0, `09aa773`)
**Date:** 2026-07-28
**Iteration:** 13
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** `git diff 9b66cdb..09aa773 -- docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (REQ v13.0 → v14.0, −2,853 lines net).

> **Iteration index.** Dispatched as "iteration 1". `CROSS-REVIEW-test-engineer-REQ-v{1..12}.md` are
> committed on this branch and the document under review is v14.0, so this is iteration **13** and is
> filed as `-v13`; writing `-v1` would have destroyed a prior review. Twelfth consecutive wrong
> index — already routed to queue row 8 (`pdlc-review-loop-hardening`, POSTMORTEM-R R-3/R-4). Not
> re-filed as a finding here.

> **Stopping rule applied.** `POSTMORTEM-R-pdlc-workflow-distribution.md` is marked **resolved**
> (2026-07-28 Resolution section), and REQ v14 §10 O-13 binds Phase R to the R-1/R-5 rule: a finding
> of the form "this AC has no oracle / no fixture / no test seam" is answered by §10's downstream
> obligation table, not by a REQ revision. I have applied that rule literally. Every oracle,
> fixture, seam, coverage-floor and property-axis defect I would ordinarily file at this bar is
> already bound in §10 (O-1, O-3, O-4, O-5, O-7, O-9, O-10, O-11, O-12) and is **not** re-filed. The
> findings below are the residue that survives the rule: they concern an AC's observable behavior or
> the retrievability of the specification input, not its test apparatus.

## Disposition of my v12 findings

| v12 ID | Sev | Status in v14 | Evidence |
|---|---|---|---|
| F-01 | High | **Bound downstream (O-1)** — the vacuous trace assertion is gone from the REQ entirely; O-1 mandates the exact four repairs I asked for, including the positive-presence conjunct and "unwritable trace ⇒ red test while the script still ignores it". | §10 O-1 |
| F-02 | High | **Resolved as observable behavior.** AC-2.9(5) now states an unrecognised `PDLC_FAULT` token "uses the entrypoint's normal exit — 4 on `--check`/sync, **0 on the hook** (NFR-6 admits no third exception)". NFR-6's "exactly two stated exceptions" is true again, and AC-2.4's P0 has no mandated counterexample. The per-entrypoint FSPEC wording is bound as O-2. | AC-2.9(5); NFR-6; §10 O-2 |
| F-03 | Medium | **Bound downstream (O-3)** — and correctly stated: the fixture must be **non-git** because a git work tree routes a failed step 1 to step 3, plus one fault token per guard. AC-0.5 step 1 now says so normatively ("If step 1 applies and any check fails, the result is step 3 — never the walk"). | AC-0.5; §10 O-3 |
| F-04 | Medium | **Resolved.** AC-2.9(3)(ii) now reads "in practice reachable only for `ENOSPC`/quota — immutable, append-only, directory-at-the-path and read-only mounts refuse `unlink` and fall through". The three mis-stated triggers are moved to the rung-3 residual, matching the measured `unlink(2)` refusal classes. O-5 carries the derivation to FSPEC. | AC-2.9(3); §10 O-5 |
| F-05 | Medium | **Resolved as observable behavior.** AC-2.9(3)(i) now mandates `pluginVersion` "emitted as `null` unconditionally" in the fixed-literal `printf` record, so the one write path that must always emit parseable JSON can no longer emit `0.10.0` unquoted. The missing `json-tool-absent` ladder test is bound as O-4. | AC-2.9(3); §10 O-4 |
| F-06 | Low | **Bound downstream (O-7)** — delimiter/quoting and the non-row-probe question, verbatim. | §10 O-7 |
| F-07 | Low | **Resolved.** AC-1.6 now reads "degrades fail-safe to `unverified` for every row **whose bytes differ** (equal bytes still classify `in-sync`)". The contradiction a golden-output test would have pinned is gone; O-8 carries the verbatim lines. | AC-1.6; §10 O-8 |

All seven are disposed. Nothing I raised is open at REQ level.

## Verification performed on v14

- **AC-6.4's measured claim reproduces.** I re-ran the four literal patterns
  (`grep -rIl` over the repo, excluding `.git`/`node_modules`) and applied the four-member exemption
  by hand: 28 matching files, of which exactly **5** survive — `docs/_queue/QUEUE.md`,
  `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`,
  `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`. The AC's "5 files
  today" is accurate. Caveat in F-02 below.
- **The archived specification-grade record is retrievable.** `git cat-file -t 9b66cdb` is a commit
  on this branch and `git show 9b66cdb:…/REQ-…md` returns the full 3,642-line v13.0. §10's
  "regenerate the axes downstream; do not import the tables" therefore has a real, addressable
  source. Also confirmed `5630d58` (§0 grounding commit) and `dde3a5f` (v12) exist.
- **Negative and absence cases are present at REQ altitude.** AC-1.5/NFR-3 (never touch unmanaged),
  AC-2.2 ("silence means everything was verified"), AC-1.0's green-outcome conjunction
  (`resolved` ∧ non-empty `rows` ∧ empty `writeFailures`), and AC-3.3's "never green while anything
  is unverified" together make every green surface falsifiable rather than absence-only. AC-3.5's
  restore-and-byte-compare remains the one backup oracle that cannot be false-greened.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **A sync run's exit code is unstated for the case sync exists to serve — a run that actually copied something.** AC-3.3's precedence table is scoped to `--check`; §4 declares the five-member exit set for `sync-workflows.sh` but never says which observed state the code is computed over. Two readings, opposite outcomes, both defensible from v14: (a) pre-run state ⇒ a sync that repaired a `stale` row exits **1**; (b) post-run state ⇒ it exits **0**. AC-3.7 ("copies nothing … exits 0") and AC-2.6 ("`supersedingState` … sync: post-copy") lean to (b), and AC-3.6 asserts a *following* `--check` is green, but no AC binds sync's own code. Consequence for the acceptance tests: "run sync on a stale consumer, assert the exit code" cannot be written today. This is an observable behavior, so I record it rather than deferring it — but the fix is one sentence in FSPEC: sync's exit is AC-3.3's table applied to the **post-run** state, and a mixed run (copied a `stale` row, skipped an `unverified` one) therefore exits 2. | AC-3.3 (table header "Given `--check`"); AC-3.1; AC-3.2 ("the exit code reflects it"); AC-3.7; §4 `sync-workflows.sh` exits row |
| F-02 | Low | Local | **AC-6.4 calls the checker "a pure function of a root directory", but one of its four exemption members — "generated trees" — is named, not enumerated, and the AC's own measured count only reproduces under one reading of it.** My grep returns 9 non-`docs/`-artifact files; it returns the AC's stated **5** only when `.claude/workflows/` (four files: the two `.bundle.js` and the two legacy `.js`) is treated as a generated tree. That reading is right — AC-6.1/AC-3.9 make those untracked generated consumer copies — but it is inferred, and the AC's escape clause ("narrowing a pattern requires changing this AC in the same commit") makes a later disagreement about the exemption expensive. FSPEC should enumerate the generated-tree paths literally (`.claude/workflows/`, `pdlc/workflows/dist/`) so the covered set is computable without judgement, and the test should assert the exemption list itself so a silently-widened exemption is red. | AC-6.4; AC-6.1; AC-3.9 |
| F-03 | Low | Process | **O-13's promotion target does not exist in this repo.** §10 O-13 routes the REQ-scope stopping rule to `docs/_constraints/` via `consolidate-learnings`, and the te-review checklist requires reading `docs/_constraints/DOMAIN-CONSTRAINTS.md` before issuing a recommendation — but neither `docs/_constraints/` nor `docs/_decisions/` exists on this branch (verified). So the one durable artifact this ten-round phase produced currently has no home, and the next Phase R in this repo will re-derive it from scratch. `consolidate-learnings` must *create* the directory and file, not merge into it; worth saying in O-13 so the obligation is not silently satisfied by "no such file". | §10 O-13; POSTMORTEM-R R-5 |
| F-04 | Low | Local | **NFR-2's budget has no observer.** "p95 ≤ 500 ms … observed, never test-gated (NFR-2)" is the right call — a wall-clock test on a hook is flaky by construction, and I endorse the exclusion. But as written nothing and nobody ever performs the observation, which makes the number decorative rather than a requirement. Bind it the way AC-6.2a binds the packaging check: name the maintainer release checklist as the observation point, or state explicitly that the budget is a design constraint on the implementation (no unbounded enumeration, no per-row process spawn beyond the three declared tools) rather than a measured property. The second form is actually reviewable at FSPEC. | NFR-2; §4 latency-budget row; AC-6.2a (the pattern to copy) |

## Questions

| ID | Question |
|---|---|
| Q-01 | F-01: is sync's exit code computed over the pre-run or post-run state? (My reading of AC-2.6/AC-3.7 is post-run; confirming it in FSPEC closes the last AC-level exit ambiguity.) |
| Q-02 | F-03: does `consolidate-learnings` create `docs/_constraints/DOMAIN-CONSTRAINTS.md` when it is absent, or does it no-op? |

## Positive Observations

- **The de-escalation is the correct testing outcome, not a concession.** Every specification-grade
  item v14 removed is bound in §10 with the *repair* attached, not merely the defect — O-1 carries
  all four of my v12 F-01 repairs, O-3 carries the non-git fixture requirement and the per-guard
  token split, O-5 carries the `unlink` refusal derivation. A downstream author reading §10 alone
  can discharge them without reading twelve cross-reviews. That is a materially better input to
  TSPEC than v13's in-REQ apparatus was, because it is a checklist with a verifier rather than prose
  a reviewer must diff.
- **Two of my Highs and two Mediums were fixed as behavior, not deferred.** AC-2.9(5)'s hook-exits-0
  and AC-2.9(3)'s unconditional-`null` `pluginVersion` are exactly the minimal corrections: they
  restore NFR-6's "exactly two exceptions" and AC-4.1's row-4-vs-row-1 distinction without importing
  the test design that broke them. Deferring the *tests* while fixing the *contract* is the right
  split, and v14 makes it consistently.
- **AC-1.0's green-outcome conjunction survived the rewrite intact.** "Every green outcome … requires
  `baselineStatus: resolved` **and** non-empty `rows` **and** empty `writeFailures`. Absence of
  evidence is never evidence of sync" is the single most load-bearing sentence in the document for a
  test engineer: it is what stops the universal-quantifier vacuity that a size-zero managed set would
  otherwise grant to every AC in REQ-DIST-01/02/03. It is stated once, referenced from AC-2.2,
  AC-3.3 and AC-4.1, and `manifest-empty` exists as a baseline reason solely to enforce it.
- **The `--check`-exits-2 / queue-proceeds asymmetry on `unverified` is stated with its rationale and
  the instruction to test both sides.** Reviewers usually have to reconstruct why two surfaces
  disagree; here the REQ says which error each seam optimises against and that both must be pinned.
- **AC-1.8 is now the right altitude.** Stating totality, mutual exclusivity with a fixed precedence,
  and determinism as *requirements on the classifier*, then routing generation axes and fixtures to
  O-9, is exactly the boundary the previous ten rounds could not find. The property is still
  reviewable — I can check the precedence chain `unknown > missing > in-sync > unverified > stale >
  local-edit` against AC-1.1's table without a 96-cell axis table — and the part that produced 24
  undefined cells is gone.

## Recommendation

**Approved with minor changes**

Four Low findings, none blocking. F-01 and F-02 are one-sentence FSPEC clarifications; F-03 is a
process routing note for `consolidate-learnings`; F-04 is a wording choice on NFR-2. Per the O-13
stopping rule, none of them contests user need, scope, priority, phasing, or an AC's observable
behavior in a way that requires another REQ revision — F-01 identifies an unstated behavior and
proposes the reading the document already implies. Phase R should close here and the pipeline
should enter FSPEC with §10 as binding entry input.
