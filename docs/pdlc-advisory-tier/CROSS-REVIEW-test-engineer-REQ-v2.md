# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review of REQ-pdlc-advisory-tier v1.1 → v1.2. Closure of the v1 findings (F-01…F-13), plus a fresh testability scan of the changed sections only. Unchanged sections already approved in v1 are not re-litigated. Not product strategy, not architecture.
**Diff reviewed:** `e6ff9f9..b8ce721` on `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (+165 / −87)

## Prior-Finding Closure

All thirteen v1 findings are closed. Each row names the change that closes it.

| v1 ID | Sev | Closed by | Status |
|---|---|---|---|
| F-01 | High | **AC-5.5** — the `needs-human` result carries a machine-readable seam token; an unrecognised/absent token routes to the A1 adjudicator. §1's A2 row now states the indistinguishability as today's fact rather than assuming a seam exists. AC-5.2/AC-5.3 now have a testable precondition. | Closed |
| F-02 | High | **AC-3.6** — one refusal path with a positive observable triple: outcome `escalated`, a refusal reason drawn from a closed seven-value set, and the pre-advisory behavior proceeding unchanged. **AC-4.6** now requires every prohibition test to assert that triple on the same path, which is exactly the paired positive conjunct the project standard demands. | Closed |
| F-03 | High | **AC-3.3** gives each of E-1…E-4 a decidable rule (flaky = identical sha, no push between; introduced = passes at merge-base, fails at head; branch-created = absent from merge-base tree and default-branch tip; re-grounding = symbol still exists). **AC-3.4(d)** defines *declared scope* as PLAN-named files ∪ files the branch had already touched. Four undefined terms → four checkable predicates. | Closed (see F-16 for one residual ambiguity, and F-15 for a baseline conflict E-2 introduces) |
| F-04 | High | **AC-1.1** now states the observable property (one constant, the Fable 5 rung, resolvable by the runtime) and explicitly hands the literal alias to TSPEC once BL-01 resolves. The implementation-echo trap is gone; AC-1.4 remains the falsifiable oracle. | Closed |
| F-05 | Medium | **AC-1.7** ships a config table with values: `attemptBudget: 3`, `seamBudgetMinutes: 10`. **NFR-4** now names the unit and the measurement window ("wall-clock, measured from dispatch to verdict") and routes the overrun through AC-3.6 with reason `budget-exhausted`. | Closed |
| F-06 | Medium | **AC-4.5** is now a per-seam table naming the gate and the state it must reach, and it correctly declines to claim Phase-0 triage is deterministic. The A2 row also resolves the AC-5.4 interaction by deferring the re-run to the next invocation. | Closed as a structure; the A1 row's content is wrong — see F-14 |
| F-07 | Medium | **AC-9.3** states the `ADVISORY-*` extension of the LEARNINGS-precedes-delete protection explicitly, and adds the "no delete while a later phase can still append" rule that makes A5's Phase-PUB entries reachable. **AC-9.2** gives the failed record write its positive outcome (action not taken or reverted, AC-3.6 path, reason `record-write-failed`). | Closed (residual: F-17) |
| F-08 | Medium | **AC-10.4** fixes append order (newest-last), the entry unit (one entry per escalation under its own heading), and the repeat rule (append again, never update in place). **AC-10.1** defines *pipeline state* as phase id + that phase's outcome. A downstream `pdlc-engineering-loop` parser test is now writable. | Closed |
| F-09 | Medium | **NFR-3** is restated as an equality on named artifacts (phase table, per-phase outcomes, no `ADVISORY-*`, no `ESCALATIONS.md` entry, no advisory summary) and says why. **AC-1.6** carries the same positive observable. | Closed |
| F-10 | Medium | **AC-3.4(a)** enumerates the seven evasions as a closed set; **AC-3.5** requires each enumerated operation to be asserted by its own test and states the set-equality intent ("a dropped case must fail the suite"). | Closed |
| F-11 | Low | **AC-2.1** collapses the enum to `{high, low}` and says why. | Closed |
| F-12 | Low | **AC-9.4** requires all five seams A1–A5 with zero counts included — a set-equality assertion is now available. | Closed |
| F-13 | Low | **AC-8.2** states the interaction: one attempt = one fix→push→re-poll cycle, and a re-poll that hits Phase PUB's own completion timeout consumes an attempt rather than escalating separately. | Closed |

## Verification Log

Every **new or changed** existing-behavior claim, checked against code. **BL-02 declares the base to
be the default branch (`main`), not this feature branch's tree**, so every row below is verified
against `main` — currently `26c3f1c` — and the branch tree is cited only where the two differ.
`feat-pdlc-advisory-tier` is **21 commits behind `main`** (`git log --oneline HEAD..main`;
merge-base `7cdfbb0`), and `main` has since landed Slices A/B/C of the orchestrate-dev rewrite
(`91c5421`, `f6518de`, `26c3f1c`) — `pdlc/workflows/orchestrate-dev.js` is **8527 lines on `main`
vs 2139 on this branch**. That gap is the subject of F-15.

| REQ claim (new/changed in v1.2) | Verified at | Result |
|---|---|---|
| AC-1.7: `.claude/pdlc.config.json` is the per-repo config home Phase MERGE already uses | `main:pdlc/workflows/orchestrate-dev.js:43` (`MERGE_CONFIG_PATH = ".claude/pdlc.config.json"`), `:60` (`mergeMode: "off"`), `:122-124` | Confirmed |
| AC-1.7: …and the distribution gate uses it too | `main:pdlc/workflows/orchestrate-queue.js:1308`, `:1484-1488` (`record.checkEnabled` opt-out) | Confirmed |
| AC-1.1: `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` are the existing constants | `main:pdlc/workflows/orchestrate-dev.js:1578`, `:1621`; `main:pdlc/workflows/orchestrate-queue.js:69` | Confirmed |
| §1 A1: Phase-0 triage `needs-human` → skip the candidate | `main:pdlc/workflows/orchestrate-queue.js:314` (`/^TRIAGE:\s*(ready\|blocked\|needs-human)\b/`), `:305` (defaults to `needs-human`) | Confirmed |
| AC-5.1: `blocked` is a real triage verdict distinct from `needs-human` | same regex, `main:pdlc/workflows/orchestrate-queue.js:314`; prompt catalogue `:664-666` | Confirmed |
| AC-4.5 A1 / AC-5.1: dependency presence in base is a **deterministic check** | `main:pdlc/workflows/orchestrate-queue.js:630` (`precheckDependencies`); branch copy `pdlc/workflows/orchestrate-queue.js:401-419` | **False.** The pre-check is one-sided — it returns `blocked` only when a declared dependency has a **non-`done` row in QUEUE.md**, and its own docstring says a dependency that is `done` *or absent from the queue* is "inconclusive here; defer to triage" (branch `:394-396`, `:416`). Presence-in-base is judged by the **agent** (`triagePrompt`, branch `:429`: "must already be merged into the base branch"). See F-14 |
| §1 A3 / AC-6.1: Phase DOD verify→remediate is capped at 3 iterations | `main:pdlc/workflows/orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`), flag `:22` | Confirmed |
| §1 A4 / AC-7.1: `ship-pr` reports `REBASE_STATUS: conflict` and the pipeline reads it | `main:pdlc/workflows/orchestrate-dev.js` — **no `REBASE_STATUS` token anywhere; no `ship-pr` dispatch anywhere** (only `TSPEC-SHIP-01/02` flag comments at `:27`, `:30`). The trailer still exists on the branch tree (`pdlc/workflows/orchestrate-dev.js:852-853`, `:974-990`) and in the skill (`main:pdlc/skills/ship-pr/SKILL.md:41`, `:54-55`) | **Not verifiable at the declared base.** See F-15 |
| §1 A5 / AC-8.6: Phase PUB has a 10-minute no-checks window and passes when none registers | `main:pdlc/workflows/orchestrate-dev.js:33` (`CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000`) | Confirmed |
| AC-4.3 / AC-4.5 A5: `ciStatus` derives from the GHA rollup, no agent in the loop | `main:pdlc/workflows/orchestrate-dev.js:323` (`gh pr view … --json statusCheckRollup`) | Confirmed |
| AC-9.3: the LEARNINGS-precedes-delete protection today covers only `CROSS-REVIEW-*` / `CODE_REVIEW-*` | `main:pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43` (token regex `(?:CROSS-REVIEW\|CODE_REVIEW)-[\w.\-]*`) | Confirmed — the REQ's "without that extension 'exactly like' would be untrue" is accurate |
| AC-9.3: Phase PUB runs after Phase H, so A5 entries land after harvest | phase catalogue `main:pdlc/workflows/orchestrate-dev.js:1648-1745` (R, F, T, D, P, PR, CR, DOD) + Phase H/PUB/MERGE ordering per `CLAUDE.md` | Confirmed |
| AC-10.5: the pipeline already emits in-process `ESCALATION:` notices on the final report | `main:pdlc/workflows/orchestrate-dev.js:908`, `:950`, `:1324` — the literal token is **`MERGE ESCALATION:`**, emitted only by Phase MERGE for its closed set of conditions. Absent entirely from this branch's tree | Confirmed in substance; the prefix is not the bare `ESCALATION:` — see F-18 |
| BL-02: `pdlc-merge-phase` has landed on the default branch | `b5d68c2` is on `main` (and `300af4f` archives it); Phase MERGE code present at `main:pdlc/workflows/orchestrate-dev.js:43-124`, `:836-950` | Confirmed |
| BL-04: `docs/_queue/ESCALATIONS.md` does not exist yet | `docs/_queue/` contains only `QUEUE.md` | Confirmed |

## Findings

All findings are **new**, and all fall inside sections the v1.2 revision changed. Numbering
continues from v1 so cross-references stay unambiguous.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Local | **AC-4.5's A1 row and AC-5.1 both rest on a "deterministic dependency-presence pre-check" that does not exist, so the A1 acceptance test cannot be written.** The pre-check that does exist — `precheckDependencies` (`main:pdlc/workflows/orchestrate-queue.js:630`; branch `:401-419`) — is a **one-sided oracle**: it returns `blocked` only when a declared dependency has a **non-`done` row in QUEUE.md**, and it explicitly abstains otherwise, in its own words: *"Dependency done, or not in the queue at all → inconclusive here; defer to triage"* (branch `:416`, docstring `:391-395`). Presence-in-base is judged by the **triage agent**, whose prompt asks it to confirm dependencies are "already merged into the base branch" (branch `:429`). Two consequences: (a) AC-4.5's A1 state-to-reach — *"every declared dependency present in base"* — is unreachable by the named gate, so the A1 row of the re-run matrix has no assertable post-state; (b) AC-5.1's *"that remains a deterministic check"* is false at the base, and the case it protects — a dependency absent from base — is precisely the case where the pre-check abstains and hands the decision to an agent. As written, the strongest A1 test possible asserts an agent verdict, which is the thing AC-4.5 exists to avoid. **Resolution:** either (i) state that A1's re-run gate is the pre-check *in its actual, one-sided form* and set the state-to-reach to what it can decide (`precheckDependencies` returns not-blocked), and drop AC-5.1's "deterministic" claim; or (ii) require the pre-check be strengthened to a total presence check as part of this feature's scope, and say what "present in base" is decided against (merge-base tree? `git log` on the default branch? a merged-PR lookup?). Either way the A1 row must name an oracle a test can call. | AC-4.5 (A1 row), AC-5.1 |
| F-15 | High | Local | **BL-02's re-grounding claim is false for seam A4, and the branch's base is 21 commits stale — so the "before" half of the A4 regression test is unwritable.** BL-02 asserts the REQ "is written against that base, not against this branch's older tree; every §1 'Today' row was re-checked against it and all five still hold." Checked: on `main` (`26c3f1c`), `pdlc/workflows/orchestrate-dev.js` contains **no `REBASE_STATUS` token and no `ship-pr` dispatch at all** — only the `TSPEC-SHIP-01/02` flag comments at `:27`/`:30`. The trailer the REQ cites lives only on this branch's older tree (`pdlc/workflows/orchestrate-dev.js:852-853`, `:974-990`) and in the skill (`main:pdlc/skills/ship-pr/SKILL.md:41`, `:54-55`), which now emits a trailer the base pipeline does not read. This is not an isolated drift: `main` landed Slices A/B/C of the orchestrate-dev rewrite (`91c5421`, `f6518de`, `26c3f1c` — converge() primitive, wave-based Phase I, delta-scoped reviews) and grew `orchestrate-dev.js` from **2139 → 8527 lines**. Because Phase DOD rebases the feature branch onto the default branch before the PR, tests written against the branch tree are tests written against code that will be deleted mid-pipeline. **Resolution:** re-ground §1's A4 row and AC-7.1 against `main` — name the mechanism that reports a rebase conflict *there*, or state that this feature must introduce it — and restate BL-02's claim to name the commit it was verified at, per row, rather than asserting all five hold. A REQ that pins its base to a moving branch needs a pinned sha to be re-verifiable. | BL-02, §1 (A4 row), AC-7.1 |
| F-16 | Medium | Local | **E-2 and AC-8.4 use different baselines for the same question and no precedence is stated, so the A5 oracle can false-green.** E-2 (AC-3.3) defines *introduced* as "the same check **passes at the merge-base commit** and fails at the branch head" → in envelope, fix it. AC-8.4 says a failing check "also present on the **default branch**" → escalate, attempt no fix. A check that regressed on the default branch after the merge-base satisfies **both**: passes at merge-base (E-2: fix) and fails on the default branch tip (AC-8.4: escalate). This is a precedence-chain false-green — a test asserting only the terminal state passes whichever branch the implementation happens to evaluate first, so it cannot falsify the wrong ordering. Note E-3 already resolves the analogous ambiguity by requiring **both** baselines ("absent from the merge-base tree **and** absent from the default-branch tip"); E-2 should do the same. **Resolution:** state the precedence explicitly (AC-8.4's default-branch comparison is evaluated **first**; only a check that is green on the default-branch tip can be "introduced") and make E-2's rule name both commits, so a fixture that defeats the earlier branch is constructible. | AC-3.3 (E-2), AC-8.4 |
| F-17 | Medium | Local | **AC-9.3 makes the advisory record undeletable at the only harvest phase there is, but never names where it *is* deleted — so the "and deleted" half of the AC has no test.** AC-9.3 says the record is "a harvested process artifact — distilled into LEARNINGS and **deleted**", then adds that no record may be deleted "while a later phase can still append to it", and correctly notes A5 writes during Phase PUB, which runs after Phase H. Harvest-then-delete is Phase H's job and nothing else's (`main:pdlc/skills/harvest-learnings/SKILL.md:28`, `:59` — the delete step; `main:pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43` — the guard). With Phase H forbidden from deleting `ADVISORY-*`, the REQ leaves no phase that does. A tester cannot decide between two incompatible oracles: *"`ADVISORY-{feature}.md` is absent at end of run"* and *"…is present at end of run and deleted by a later run"*. The second half of the AC — the guard extension — also lacks its observable: state that an `ADVISORY-*` delete with no sibling `LEARNINGS-*` is **refused with the guard's message**, so the extension has a positive assertion rather than "the file still exists". **Resolution:** name the deletion point as an outcome (end of Phase PUB? end of Phase MERGE? the next run's Phase H?) and give the extended guard its positive refusal observable. | AC-9.3 |
| F-18 | Low | Local | **AC-10.5's notice-channel claim is one token off, which matters because the channel is the operator's grep.** The REQ says "the pipeline already emits in-process `ESCALATION:` notices". At the base the literal prefix is **`MERGE ESCALATION:`** (`main:pdlc/workflows/orchestrate-dev.js:908`, `:950`, `:1324`), emitted only by Phase MERGE for its closed condition set. If advisory escalations emit a bare `ESCALATION:` the channel has two grammars and a set-equality assertion over "every escalation notice on the report" needs to know both; if they emit `ADVISORY ESCALATION:` that should be said. **Resolution:** state the exact prefix advisory notices use and whether the channel's notices are expected to share one parseable prefix. | AC-10.5 |
| F-19 | Low | Local | **AC-3.6's refusal-reason set has no condition→reason mapping when two conditions hold at once, so a set-equality test over the closed set is under-determined.** The set is closed and well-formed, but: an out-of-envelope proposal returned with `confidence: low` satisfies both `out-of-envelope` and `low-confidence`; a malformed verdict that also exhausts the budget (AC-2.3 says a malformed verdict *consumes an attempt*, so the last attempt does exactly this) satisfies both `malformed-verdict` and `budget-exhausted`. A test asserting the reason cell must know which wins. **Resolution:** state the reasons as an ordered precedence list rather than an unordered set — one sentence. | AC-3.6, AC-2.2, AC-2.3 |
| F-20 | Low | Local | **AC-3.4(d)'s "the files the branch had already touched when the seam fired" has no named ref at seam A4, where the seam fires mid-rebase.** At A4 the working tree at the moment of firing is a conflicted rebase state, so "already touched" could mean the pre-rebase branch head, the rebase's `ORIG_HEAD`, or the conflicted index. The three differ exactly on the files a conflict resolution would touch — the case the rule governs. **Resolution:** name the ref (e.g. the branch head as of the seam's dispatch, `ORIG_HEAD` at A4). | AC-3.4(d) |

## Questions

| ID | Question |
|----|---------|
| Q-06 | *(carries over from v1 Q-03, now sharper.)* AC-3.4(e) excludes REQ-MERGE-03's self-modification paths — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` at the base (`main:pdlc/workflows/orchestrate-dev.js:60`ff, `:908`). In **this** repo essentially every feature diff lands under those paths, so A4 and A5 have no reachable in-envelope case here and their acceptance tests can only ever exercise the escalation branch. Is that intended (the tier is for consuming repos)? If so, saying it in §5 would tell the test author that the A4/A5 in-envelope tests need a synthetic fixture repo rather than a self-hosted run. |
| Q-07 | AC-8.3 says the report's DoD status "names the verified commit, and a branch head beyond it is reported unverified", and leaves the restoration mechanism to TSPEC. For the acceptance test: is *"DoD status reports `unverified` after an A5 fix push"* the terminal, passing outcome of a successful A5 resolution, or an intermediate state that some later step must clear before the run is reported complete? The two give opposite expected values for the same run. |
| Q-08 | AC-1.7 makes `advisory.envelope` operator-configurable while AC-3.1 says the envelope is "not inferable, extendable, or negotiable by **any agent** at runtime". Does an operator-widened envelope still have to be a subset of AC-3.3's four entries, or may it add entries? The answer decides whether the envelope test is a set-equality over exactly E-1…E-4 (which would fail on any operator addition) or a subset check. |
| Q-09 | AC-5.5 requires the `needs-human` result to carry a machine-readable seam token. Is that token expected to be added to the existing `TRIAGE:` trailer grammar (`main:pdlc/workflows/orchestrate-queue.js:314`, regex `^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$` — the trailing group is currently free text), or emitted on a separate line? Existing parser tests pin that regex, so the answer decides whether this feature changes a pinned contract. |

## Positive Observations

- **Every v1 finding is genuinely closed, and closed at the right altitude.** The revision resisted the common failure of answering a testability finding with implementation detail: AC-1.1 hands the alias literal to TSPEC rather than guessing it, AC-1.4 and AC-8.3 both say "the detection point / what restores it is TSPEC's to choose" while still naming the observable. That is exactly the REQ/TSPEC split.
- **AC-3.6 is the strongest addition.** Collapsing six distinct refusal causes into one observable triple — fixed outcome, closed reason set, unchanged pre-advisory behavior — turns what were six absence-only oracles into six positive assertions that differ only in one cell. It also makes AC-4.6's "each such test asserts the AC-3.6 positive triple on the same path" a mechanical instruction rather than an aspiration.
- **AC-3.3's rule column and AC-3.4(a)'s enumeration are both written so a deleted case fails.** E-3 in particular gets the baseline question right by requiring *both* the merge-base tree and the default-branch tip — the discipline F-16 asks E-2 to adopt.
- **The document verifies well.** Fifteen of the seventeen new existing-behavior claims checked out against `main` line-for-line, including the two easy ones to get wrong: the config path Phase MERGE actually uses (`:43`) and the 10-minute no-checks window (`:33`). The two that did not (F-14, F-15) are both drift against a base that moved, not invention.
- **AC-9.3's "no advisory record is deleted while a later phase can still append to it"** identifies a real ordering hazard that the existing harvest design would have hit silently — Phase PUB genuinely runs after Phase H. Naming it in the REQ is the right call even though F-17 asks for one more sentence.
- **AC-2.1's justification for collapsing the enum** ("two-valued because nothing in this REQ reads any third value") is the right way to close a testability finding: it removes the untestable distinction rather than inventing an observable for it.

## Recommendation

**Needs revision**

This is a strong revision: all thirteen v1 findings are closed, and the four v1 Highs are closed
well. The bar is unchanged, though, and two open High findings remain — both introduced by the
revision itself, and both about a named gate that is not there.

1. **F-14** — AC-4.5's A1 row and AC-5.1 name a "deterministic dependency-presence pre-check". The
   pre-check that exists is one-sided: it can prove *blocked*, never *present*, and abstains on
   exactly the case A1 handles (`main:pdlc/workflows/orchestrate-queue.js:630`). Either restate the
   A1 row against what that function can decide, or put the strengthening of it in scope and say
   what "present in base" is decided against. The A1 row of the re-run matrix currently has no
   assertable post-state.
2. **F-15** — BL-02 claims all five §1 "Today" rows were re-checked against the default branch. A4's
   was not: `REBASE_STATUS` and the `ship-pr` dispatch are absent from `main`'s
   `orchestrate-dev.js` entirely. The branch is 21 commits behind a base that has grown 2139 → 8527
   lines. Re-ground §1's A4 row and AC-7.1 against `main`, and pin BL-02's claim to a sha so it
   stays re-verifiable.

Two Mediums must also close:

3. **F-16** — give E-2 and AC-8.4 one baseline and a stated precedence, so the A5 oracle cannot
   pass by evaluation order.
4. **F-17** — name where the advisory record is deleted, and give the extended harvest guard its
   positive refusal observable.

The three Lows (F-18, F-19, F-20) are each a single clarifying sentence and should close in the
same pass.

Everything else in the document is ready to carry a test suite. The seam table, the envelope rules,
the closed test-tamper set, the refusal triple and the config table together give this REQ a
mechanical acceptance matrix — which is more than most REQs reach at round two.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 3}
