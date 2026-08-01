# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` (v1.0)
**Date:** 2026-07-31
**Iteration:** 1
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Verification baseline:** working tree at `950d781` (branch `main`, clean). Every `M-*` row in §4 of
the REQ was re-read against `pdlc/workflows/orchestrate-dev.js` at that tree.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **AC-4's round growth has no durable observable, so on any resumed invocation AC-4.5 fires and silently defeats AC-3.** AC-4.1 defines growth as `bytes(doc at start of round N+1) − bytes(doc at start of round N)`, read through `_readFile`. `_readFile` reads the current worktree; the round-N start bytes exist only in the memory of the invocation that took them. The REQ applies exactly this reasoning to AC-3.5(a) — *"the reader that needs it runs on a later invocation with nothing but the branch to read"* — and does not apply it to AC-4. A phase that resumes (the normal case: `refreshReviewState` exists precisely because the loop's state is re-derived from the branch each invocation) therefore has an **unmeasurable** growth for every round, AC-4.2 row 3 classifies it *unmeasurable*, and AC-4.5 dispatches the full panel every round — i.e. AC-3 is inert on any resumed run, permanently and without an operator-visible signal that this happened for a structural reason rather than an incidental one. Testability consequence: a test cannot derive the expected panel of round 2 from the REQ, because the answer depends on whether the process that opened round 1 is the process that opens round 2 — a fact no AC states. Either name a durable anchor for the start-of-round byte count (recorded in the round's cross-review file, or derived from the commit the round anchored on — the REQ's own §4.7 says the optimizer episode has *"returned and committed"*), or state explicitly that a resumed phase escalates. | AC-4.1, AC-4.2, AC-4.5, AC-3.5(a), M-3e, M-5c |
| F-02 | High | Local | **AC-6.4's citation grammar does not match the citation grammar this corpus actually uses, so the specified checker would report every good citation as bad and would still miss the defect class it exists to catch.** AC-6.4 specifies extraction of `path:line` and `path:12-18`, and check 1 fails when *"the cited path does not exist under the repo root"*. Measured over this REQ at `950d781`: **3** citations are repo-root-relative paths (`pdlc/workflows/orchestrate-dev.js:52`), **13** are bare basenames (`orchestrate-dev.js:1436`, `orchestrate-dev.js:2528`, …) which do not exist under the repo root and so fail check 1, and **14** are bare `:NNN` forms with no path at all (`` `:1574` ``, `` `:2490` ``, `` `:1934` ``) which the specified extractor does not match and therefore never checks. Ranges are written with an **en dash** (`orchestrate-dev.js:2215–2217`, `:1803–1812`, `:1–12`), not the ASCII hyphen AC-6.4 specifies. The document that motivates the checker is thus ~82% invisible or false-positive to it. The recurring P-4 defect — *"off-by-two line numbers at the very sha the header row named"* — lived in exactly the bare and basename forms. Also DC-01 (receive side): no AC states what the extractor does with a citation form it cannot parse (skip silently, report, or fail), so the parser is specified only for well-formed input. Fix by fixing the **grammar contract**: state the accepted forms as a closed catalogue, state the resolution rule for basename-only and bare-`:NNN` forms (nearest preceding full path? refuse?), state the range separators accepted, and state the unparseable-form behaviour. | AC-6.4, AC-6.3, §1.2 P-4, DC-01 |
| F-03 | Medium | Local | **AC-2.6's arithmetic is falsified by AC-4.2 + AC-3.1, so the expected fire-sites of the fixed-point rule cannot be derived.** AC-2.6 asserts *"the only consecutive same-shape pair inside the window is (round 2, round 3), both verifier rounds, so the rule fires at most once per phase and saves one optimizer episode … It does not save a round of reviewers."* But AC-3.1 dispatches a **full panel** at round N when AC-4 classified round N−1's revision as new-mechanism, and AC-4.3 records that **every one of the predecessor's five rounds** would have classified new-mechanism. On the measured trajectory, therefore, rounds 1, 2 and 3 are all dual: (1,2) and (2,3) are both same-shape comparable pairs, the rule can fire at **round 2**, and firing at round 2 suppresses round 3's reviewers entirely — i.e. it *does* save a round of reviewers. AC-2.6 is stated as a flat consequence, not as a default-configuration approximation, and R-2 restates it (*"the only comparable consecutive same-shape pair is (2, 3)"*). A test author reading §5 cannot say whether a fixed-point halt at round 2 is expected behaviour or a defect. Reconcile AC-2.6/R-2 with AC-4.2 and enumerate the reachable panel-shape sequences. | AC-2.6, AC-3.1, AC-4.2, AC-4.3, R-2 |
| F-04 | Medium | Local | **"Panel shape" is defined over an in-memory fact (`dispatched`) while every other AC-2/AC-3 observable is defined over the branch.** §5's vocabulary table: *"the set of reviewer role slugs **dispatched** in that round"*. On a resumed invocation nothing records what was dispatched; the only available evidence is which `CROSS-REVIEW-{role}-{doc}-v{N}.md` files exist — which is what `deriveRoundWindow` and `refreshReviewState` already read. Two states then alias: a dual round one of whose reviewers crashed leaves one file, and a verifier round leaves one file. AC-3.5(b) recognises this aliasing exactly and resolves it for **approval** with the `REVIEW-MODE: verification` marker; AC-2.4's comparability test does not use that marker and has no stated rule for the crash case. As written the panel-shape predicate is unobservable across invocations and ambiguous within one. Restate panel shape over the on-disk role slugs at the round, plus the marker, and state the crashed-round behaviour (fail-closed to *not comparable* would match AC-2.3's spirit). | §5 vocabulary, AC-2.4, AC-3.5(b), M-3b, M-3e |
| F-05 | Medium | Local | **AC-3.2 clause 2 is an unfalsifiable constraint: nothing the verifier writes records which text it judged "new mechanism".** The clause restricts *where* a blocking finding may be raised — *"only in text that adds new mechanism — a clause that changes what the system does. Text that restates, tightens, retracts, cites, or records a risk is not new mechanism"* — but the cross-review grammar is explicitly unchanged (N-3, AC-3.4) and no AC requires the verifier to name the clause it classified. A verifier that obeys the rule and one that ignores it produce byte-identical artifacts. That makes the AC untestable in principle (no oracle at any level), and it also removes the operator's recourse: a wrongly-blocked round is indistinguishable from a correctly-blocked one. Contrast AC-5.2, which gives its routing an exact heading and is therefore checkable. Minimum fix: require each blocking finding raised by a verifier to cite the specific clause/section it judged new-mechanism, in a named field of the findings table — the same way `Scope:` and `## Verdict` are named, machine-locatable contracts. | AC-3.2(2), AC-3.4, N-3, AC-5.2 |
| F-06 | Medium | Local | **AC-3.2 clause 1's per-finding disposition has no structural artifact, so "every prior blocking finding is resolved" cannot be verified by anything but reading prose.** The clause requires the verifier to verify *"every prior blocking finding from every prior round"* and to state *"a per-finding disposition"*, but N-3 freezes the file grammar and §6 declares only `## Measurement Required` and `REVIEW-MODE:` as new named literals. Nothing lets the loop, the run report, or a test assert that the disposition covers the prior rounds' finding ids — and the count trailer (`{"high","medium","low"}`) carries counts, not ids, so a verifier that silently drops a prior High is indistinguishable from one that resolved it. Given that AC-3 removes the *second* reader whose duplicated disposition check was the existing redundancy (§1.3), this is the coverage that AC-3 is spending, and it is spent against no oracle. Either give the disposition an exactly-named section with prior-round finding ids, or demote clause 1 from an AC to guidance and say plainly that it is unverified. | AC-3.2(1), N-3, §1.3, §6 |
| F-07 | Medium | Cross-Feature | **`REVIEW-MODE: verification` is a machine-read cross-component contract whose receive side is specified only for present/absent, contrary to DC-01.** DC-01 requires the receiving side of any such marker to be a **total function** — *"the REQ must state the behaviour for absent, malformed, and truncated input, with an exact fallback and an observable log signal"* — *before* FSPEC authoring. AC-3.5(a) states the write; AC-3.5(b) states absent ⇒ fail-closed. Duplicated markers, a marker with an unexpected value, a marker on a file that fails `approvalAnchorPreCount`'s `≥2` ambiguity rule (M-4b), and a marker present on **both** files of a dual round are all deferred to O-4. Each of those decides whether an approval is granted, which is externally observable behaviour and therefore in scope for this document under its own stopping rule. State each case (fail-closed throughout would be consistent with M-3d and M-4b). | AC-3.5(a), AC-3.5(b), O-4, M-4b, DC-01 |
| F-08 | Low | Local | **AC-4.1 and §4.7 name two different measurement boundaries.** AC-4.1: *"after the optimizer episode has returned"*. §4.7: *"after the optimizer episode has returned and committed"*. These differ, and the difference is load-bearing for F-01 — the committed variant makes the start-of-round byte count derivable from git and therefore durable, the returned variant does not. Pick one and state it in the AC. | AC-4.1, §4.7 |
| F-09 | Low | Local | **AC-5's routing has no oracle distinguishing a clean `Approved` from an `Approved` with open Measurement Required items.** AC-5.2 makes the section non-blocking and states its presence *"never prevents an `Approved` verdict"*; AC-5.4 carries the items into the run report. Nothing marks the resulting approval as conditional, so a document can reach terminal approval with an unsettled measurement recorded only in a report that is not part of the branch state a later invocation reads. R-5 anticipates this class and directs that it be filed Low; filed accordingly. Consider a one-line note in the run report's phase outcome (`approved, N measurements outstanding`). | AC-5.2, AC-5.4, R-5 |

## Mechanical fixes (AC-6.5 class — not findings)

Applied per AC-6.5 and the header convention: reported as a fix list, not as blocking findings, and
excluded from the counts below. All were checked against the working tree at `950d781`; every `M-*`
row's line number and distinctive literal is otherwise **correct** at that tree.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-01 | §4.3 M-3f | `tier2ApprovalRecord` is described as a *"method"* and its literal is quoted in method form, `async tier2ApprovalRecord({ feature, docType, … })`. At `pdlc/workflows/orchestrate-dev.js:2528` it is a standalone declaration: `async function tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile })`. This is the same defect shape §1.2 P-4 names (*"a function cited in call form that does not exist at HEAD"*), recurring inside the document that specifies the checker for it. | Quote the declaration form; drop "method". |
| MF-02 | throughout §4 | 13 citations use a bare basename (`orchestrate-dev.js:1436`) and 14 use a bare `:NNN` (`` `:1574` ``, `` `:2490` ``). Only 3 are repo-root-relative. | Normalise to repo-root-relative paths — the same fix `eb53ded` already applied to one citation. See F-02: until the grammar is fixed, this is also the reason the checker cannot be trusted on this corpus. |
| MF-03 | §4.1 M-1b, §4.3 M-3a, §4.5 M-5b, §4.6 M-6a | Ranges use an en dash (`2215–2217`, `1803–1812`, `2725–2743`, `1–12`); AC-6.4's own example uses an ASCII hyphen (`path:12-18`). | Pick one separator and use it in both places. |

## Measurement Required

Filed under AC-5.2's convention (self-applied ahead of the AC shipping). Non-blocking; excluded from
the counts below.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-01 | Does a review-loop phase in practice run its rounds inside **one** workflow invocation, or across several? | Instrument one real `orchestrate-dev` Phase R run (a throwaway feature) and record the process/invocation boundary against each round index. | Whether F-01's resumed-invocation path is the common case or the rare one — i.e. whether AC-4 is mostly live or mostly inert. It does not change the fact that the AC is undefined for the resumed case, but it sizes the consequence. |
| MR-02 | What byte length does the injected `_readFile` return for a document mid-authoring-episode, given the pacing contract's per-section commits? | Read the document through the adapter at two known points of one authoring dispatch. | Whether AC-4.1's "returned" boundary and §4.7's "returned and committed" boundary (F-08) can ever observe different values. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-3.1 exempts Phase CR by name. Phase DOD runs its own evaluator→optimizer loop (`dod-verify` → `se-implement`, 3 rounds) with `CODE_REVIEW-{feature}-v{N}.md` artifacts. Is that loop in or out of scope for AC-1, AC-3 and AC-4? It is neither `reviewLoop` nor Phase CR, and no non-goal names it. |
| Q-02 | AC-2.1 evaluates the rule *"before round N's optimizer episode is dispatched"*. `MAX_REVIEW_ROUNDS` also bounds the window via `windowEnd`. On the final round of the window, does the fixed-point check run at all, or does budget exhaustion pre-empt it — and if both would fire, which halt reason does AC-2.2 require the operator to see? |
| Q-03 | AC-3.5(c) requires same-round approval to be judged against *"the roles dispatched at the round being judged"*. For a round with **no** cross-review files at all (both dispatches crashed), what is that set — empty, and therefore vacuously approved under a `roles.every(...)` predicate (M-3c's `roles.length > 0` guard is over the accumulated set, not the per-round one)? |

## Positive Observations

- **Every `M-*` row in §4 verifies.** All 24 cited line numbers and distinctive literals were checked
  against `pdlc/workflows/orchestrate-dev.js`, `lib/document-oracles.mjs`, `build-runtime.mjs` and
  `package.json` at `950d781` and are accurate, including the subtle ones — `windowEnd`'s
  sole-arithmetic-site claim (M-1b), `parseVerdict`'s genuine-zeros path at `:451` (M-2c), and the
  role-asymmetry comment plus `records.some((r) => r === null)` guard at `:2490` (M-3d). The
  symbol-plus-literal convention did its job for a reviewer; MF-01/MF-02 are the residue.
- **The negative cases are unusually complete for a REQ.** AC-2.5 (`0 ≥ 0` must not fire, justified
  from M-2c rather than asserted), AC-2.3 (an unreliable count breaks the chain **in both
  directions**), AC-2.4 (unequal panel shape is not comparable), AC-3.5(b) (lone file without marker
  stays fail-closed) and AC-4.5 (unmeasurable growth escalates rather than degrades) are each stated
  as a *non*-behaviour with a reason. O-10 then re-lists them as a PROPERTIES obligation. This is the
  right shape: the falsifying cases are named at REQ altitude, so PROPERTIES cannot quietly omit them.
- **AC-4.3 derives its threshold instead of guessing it.** Reusing `MAX_AUTHORING_WRITE_BYTES` and
  saying explicitly that the two must not drift into two numbers removes a whole class of
  "where did 12,000 come from" review round, and the calibration against the five measured rounds
  (25.8 / 22.3 / 25.0 / 28.1 / 38.2 KB) is a real back-test, not a plausibility argument.
- **AC-6.2 (import-safety) is stated as an AC rather than left to convention**, with the concrete
  counter-example in this repo (`build-runtime.mjs`) named. That is directly testable — import the
  module in a test and assert no IO — and it is the precondition for AC-6.7 being meaningful at all.
- **§4.7 self-applies AC-5**: the two unmeasured runtime facts are named and each AC is shown not to
  depend on them. That is exactly the discipline AC-5.1 asks of reviewers, demonstrated on the
  document's own body, and it is why F-01 is a gap in *observability plumbing* rather than another
  instance of the predecessor's P-3.
- **§9.3 refuses to paper over the unbound deferrals.** Three deferrals, three named successors, all
  marked **Unbound** with the operator action stated. A REQ that says "this is not satisfied at
  authoring time" is easier to test against than one that offers prose intent as a binding.

## Recommendation

**Needs revision**

Mandatory per the approval rules: two High and five Medium findings are open.

What must change before this document can be approved:

1. **F-01** — give AC-4's round growth a durable observable, or state that a resumed phase always
   escalates to the full panel and that AC-3's saving is therefore per-invocation. As written, the
   expected panel of round 2 is underivable from the document.
2. **F-02** — restate AC-6.4's citation grammar as a closed catalogue that covers the forms this
   corpus actually contains (repo-relative, basename-only, bare `:NNN`, en-dash ranges), with a
   stated behaviour for unparseable forms (DC-01 receive side).
3. **F-03** — reconcile AC-2.6 and R-2 with AC-4.2/AC-3.1; enumerate the reachable panel-shape
   sequences so the rule's fire-sites are derivable.
4. **F-04** — restate "panel shape" over on-disk role slugs plus the `REVIEW-MODE:` marker, and say
   what a crashed round's shape is.
5. **F-05, F-06** — give AC-3.2's two clauses a structural artifact (a named field for the
   new-mechanism citation; a named section carrying prior-round finding ids for the disposition), or
   demote them from ACs and record that they are unverified.
6. **F-07** — state the total receive-side behaviour of `REVIEW-MODE: verification` (duplicated,
   unexpected value, both-files, interaction with the `≥2` ambiguity rule) at REQ altitude, since
   each case decides whether an approval is granted.

F-08 and F-09 are Low and may be taken as mechanical. The mechanical-fix list (MF-01…MF-03) and the
Measurement Required items are non-blocking and contribute nothing to the counts.

Nothing in this review contests user need, scope, priority, phasing, or whether the six changes
should be made — per the stopping rule, that is out of scope and the decision is settled. Every
finding above is that an AC's externally observable behaviour is undefined, unobservable, or
self-contradictory.

## Verdict

VERDICT: Needs revision
