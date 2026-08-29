# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.2, se-author)
**Date:** 2026-08-29
**Iteration:** 2
**Scope:** Local

Delta re-review. Base for the diff: `bedf68649` (the commit at which v1 was written); nine revision
commits `477e330a2..446a78692` follow it, 190 insertions / 66 deletions. I re-read my own v1
findings, diffed the document, verified that each is resolved, and scanned **only** the changed
sections for new issues. Unchanged sections approved at v1 were not re-litigated.

## Disposition of my v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Not resolved — new defect in the fix** | T-03's replacement command runs, but omits `DECISION_CORPUS_ARGV`'s fourth glob and yields 24, not the 25 the row claims. See F-01 below. |
| F-02 | Medium | **Resolved** | T-20 now names the target `0.23.7` and carries the constraint that binds it: `pdlc/engine/package.json:18` does declare `"pdlcPluginCompat": "^0.23.0"`, so a `0.24.0` bump would fall outside the range the AT-1.6 / DEC-09 handshake asserts. The constraint now travels with the task instead of being rediscovered at batch 10. |
| F-03 | Medium | **Resolved** | T-12a is a real red predecessor for T-19's three prose deliverables, and it is the right shape: every expectation **derived** from `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_NOTICES` / `DECISION_LEDGER_DEFAULTS` and **set-equal**, not containment. The Red-before-green table now pairs `T-12, T-12a → T-19` over both test files, and the coverage table carries a `FSPEC Q-3 / disclosure prose` row. The absence-only DoD checkbox is gone — the checkbox now says "mechanically asserted by T-12a, not by this checkbox alone". |
| F-04 | Low | **Resolved** | The Overview now carries a "Blast radius outside `orchestrate-dev.js`" paragraph enumerating all seven non-test paths plus the fourteen test/fixture paths, and binds itself to the manifest ("this paragraph is its prose summary and must agree with it"). |
| F-05 | Low | **Resolved** | The RED-terminal sentence now reads "the **six production-file greens** (T-13…T-18) land in batches 3–8, and the two remaining greens — T-19 and T-20 — sit in batches 9 and 10". |

Four of five resolved. F-01's fix replaced an unrunnable command with a runnable one that returns
the wrong number — the same evidence line, wrong a second time in a new way.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T-03's replacement enumeration command drops `DECISION_CORPUS_ARGV`'s fourth glob and yields 24, not the 25 the row asserts.** The row now hands the implementer `git ls-tree -r --name-only 8c673a09f \| grep -E '^(docs/_decisions/DECISIONS-[^/]*\.md\|docs/[^/]+/DECISIONS-[^/]*\.md\|docs/completed/[^/]+/DECISIONS-[^/]*\.md)$'` and states it "yields **25**", with "the live tree yields 26 under the same filter". Executed verbatim at `8c673a09f` it yields **24**; against `HEAD` it yields **25**. The regex has three alternatives but `TSPEC-pdlc-decision-ledger.md:318-324` defines `DECISION_CORPUS_ARGV` with **four** pathspecs — the missing one is `:(glob)docs/discarded/*/DECISIONS-*.md`, and the file it silently drops is `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md`. Adding a `docs/discarded/[^/]+/DECISIONS-[^/]*\.md` alternative restores 25 at `8c673a09f` and 26 live — exactly the figures the prose already carries, which are themselves correct. **Why it is not cosmetic:** the row makes agreement an acceptance condition ("the two enumerations must be shown to agree at `8c673a09f`, and T-03 records that comparison in its file header"), and under the command as written they demonstrably do not. A batch-1 implementer meets a contradiction between a command returning 24 and a fixture spec saying 25, and the wrong resolution — re-pinning the literal to 24 — drops an in-scope decisions file from the frozen corpus, narrowing a corpus TSPEC enumerates in four globs. **Fix:** add the fourth alternative to the `grep`; leave the 25 / 26 figures alone. | REQ-DECLEDGER-01 (frozen-corpus expected value); TSPEC §3.1 `DECISION_CORPUS_ARGV` |

**Nothing rises to High.** The corpus cardinality the PLAN commits to (25 frozen / 26 live) is
correct; only the reproduction command disagrees with it. T-03's own guards are two-sided —
per-file digest literals hand-transcribed plus set equality on the path list — so a 24-path fixture
fails loudly at batch 1 rather than shipping. This is a halt-and-rediscover cost, not a defect that
reaches users, which is why it stays where I put it at v1 rather than being escalated for being
wrong twice.

## Verification performed

Every factual claim the v0.2 edit newly introduced, executed against the working tree at
`feat-pdlc-decision-ledger`. Only changed sections were checked.

**T-00a's census arithmetic is exactly right, and the task is correctly placed.**
`documentOracles.test.js:398` titles the census test with the literal, `:415-418` excludes the
`learnings`, `waveResume`, `loop` and `escalationView` prefixes, and `:420` asserts
`expect(count).toBe(102)`. Live measurement confirms both halves of T-00a's premise: the directory
holds **154** `*.test.js` files and **exactly 102** after those four exclusions — so the literal is
saturated, and the three `decisionLedger*` modules batch 1 adds would redden a required check
before any production code exists. The row's count of "twelve new modules" in the namespace matches
the manifest (preflight, baselineGuard, fixtureGuard, config, recognise, render, bounds, injector,
corpus, loop, main, census). The positive control is the right instrument — asserting the filtered
count is *still* 102 after the namespace exists means a future `decisionLedger`-prefixed module
cannot vanish from every census, which a bare exclusion would allow. Declining to re-pin the
literal matches the reasoning `documentOracles.test.js`'s own comment block at `:386-391` gives.

**The coverage-gate correction is sound and materially improves the plan.** `pdlc/workflows/package.json:9`
does carry four clauses in the order quoted. `check-wave-resume-delta-coverage.mjs:56` hard-codes
`SUBJECT = "pdlc/workflows/orchestrate-dev.js"`; `:96` resolves the base by
`git merge-base HEAD <ref>`, preferring the live merge base; `:119` takes `git diff -U0 <base> HEAD -- SUBJECT`
post-image ranges; and `:225` emits `WARNING` rather than failing when the subject has uncommitted
changes — so the "commit, then run" caveat now carried in T-18's row and the DoD is real and
correctly stated. v1's flat claim that the coverage gate is not evidence for this feature was
drawn from two clauses of four; conceding clause 3 *does* bind, and assigning its outcome an owner
(T-18) rather than leaving it to surface as a batch-8 surprise, is the right correction.

**T-10a's precedent and its product justification both hold.** `advisoryDisabled.test.js`,
`advisoryWaveGateMain.test.js`, `anchorCascade.test.js` and `branchGuard.test.js` all exist, and
98 modules under `pdlc/workflows/__tests__/` import from `../orchestrate-dev.js` — the
`main()`-driven shape is the house pattern, not an invention. `assertNoLiveGitWrites` exists in
`helpers/loopEconomicsDoubles.js:181`. The three arms are the right ones from a product lens: arm 3
replaces "flag off ⇒ no `decisionLedger` key" with **set equality** over the report's key set and
the notices array, which is what makes a spuriously-added key fail; a containment check would pass
a report that gained a key. This closes the DC-07 builder-not-wired exposure I would otherwise have
raised myself — a census proves a string is present, never that a line runs.

**T-12a preserves a real confinement discipline rather than inventing one.**
`documentOracles.test.js`'s advisory family derives its count words from `ADVISORY_SEAMS` /
`ADVISORY_DEFAULTS` and its closing assertion checks that `CLAUDE.md` and `README.md` do **not**
carry the per-seam count words — mechanics prose is confined to `OPERATIONS.md`. T-12a's
"pointer, not restatement" requirement for README and CLAUDE.md is that same rule applied to the
new family, so T-19's prose cannot trip a shipped oracle.

**Engine test-module count corrected accurately.** `pdlc/engine/__tests__/` holds 73 entries: 64
`*.test.js` modules, the 7 `_`-prefixed helpers the PLAN names by hand, and `fixtures/` and
`live/`. v0.1's "73 files" in a sentence about a test suite did read as a module count. The new
sentence is right and no assertion transcribes the figure.

**Task inventory and batch re-derivation.** 24 unique task ids (`T-00, T-00a, T-01…T-12, T-12a,
T-13…T-20`), matching the DoD's updated "All 24 tasks". Re-deriving `batch = max(deps) + 1`:
T-00a is a source ⇒ 1; T-10a on T-01(1), T-02(1), T-03(1) ⇒ 2; T-12a on T-00(1), T-00a(1) ⇒ 2;
T-18 now on T-10a(2) as well ⇒ still 8; T-19 on T-12a(2) ⇒ still 9. The claim that the three new
tasks change no other row's batch checks out.

**Every file named `[new]` is genuinely absent at HEAD** — `decisionLedgerMain.test.js`,
`decisionLedgerPreflight.test.js`, `decisionLedgerCensus.test.js` and `decisionLedgerLoop.test.js`
all confirmed non-existent; the two files named "(existing)" (`documentOracles.test.js`) and the
engine oracles T-19 must re-run (`docs-uniqueness.test.js`, `ci-arrangement.test.js`) all exist.
`fast-check ^4.9.0` is already a `pdlc/workflows` devDependency, so T-05's and T-06's new property
obligations need no new tooling.

**The one-physical-line-per-decision property is the most valuable thing this round added.** T-06's
new property makes explicit that a statement carrying an embedded newline would render two lines
and desynchronise T-07's `≤ maxEntries` line count and T-09's hand-transcribed byte literals — and
the row states plainly that no named example generates one. That is a latent false-green in the
byte-literal chain, found by the reviewers and closed by a law rather than another example.

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-03's file header is to "record that comparison" between the `git ls-tree` historical enumeration and `DECISION_CORPUS_ARGV`'s runtime `git ls-files` form. Once F-01's fourth glob is restored the two agree at 25 — but is that comparison intended to be *executed* by a test, or prose in the header? If prose, it is an unfalsifiable claim about corpus scope; a set-equality assertion between the fixture's path list and a checked-in expected list of 25 literals (which T-03 already commits to) is the falsifiable form, and I read the row as already requiring it. Confirming would remove the ambiguity. |
| Q-02 | Carried from v1, still open and still not blocking: `decisionLedger.enabled` ships **false**, so nothing in this feature is operator-visible until someone edits config. Is a default-off feature the intended end state for this REQ, or is a follow-up enabling it after a bake period expected? This is a product-roadmap question for the REQ, not a defect in the PLAN. |
| Q-03 | Carried from v1: the completeness gate applied to this dispatch names `## Overview / ## Batches / ## Dependencies / ## Verification` — the **PLAN's** section contract, not a cross-review's. This file follows the `pm-review` SKILL's mandated cross-review format, which is what the round history parses. The gate configuration for reviewer dispatches still looks mis-wired. |

## Positive Observations

- **Every one of the eight TE findings and four of my five were addressed by adding falsifiable
  structure, not by adding prose.** T-00a, T-10a and T-12a are three new tasks that each close a
  specific hole — a saturated census literal, a composition root nothing executed, and three
  documentation deliverables standing on a manual checkbox. Adding tasks is the expensive,
  correct response; narrating the gaps away would have been cheaper and worthless.
- **The file-ownership manifest re-shape is a genuine machine-contract fix.** Recognising that
  `parsePlanOwnership` reads the owner cell whole — so `T-02 (batch 1)` parses as a task id no
  table contains and the file reads as unowned — and moving the batch into its own column is the
  kind of defect that would otherwise have surfaced as an inscrutable lint failure at wave time.
  The row-per-owner shape also makes the `orchestrate-dev.js` serialisation legible at a glance.
- **The disjointness premise was re-proved, not merely re-asserted, after three tasks landed in
  it.** The new paragraph walks batch 1 (six disjoint sets, T-00a alone on the existing file),
  batch 2 (T-12a the only writer of `documentOracles.test.js`), and names
  `documentOracles.test.js`'s three owners in batches 1, 2 and 9 with the real edge chain
  T-00a → T-12a → T-19 that serialises them. That is the argument a wave gate actually needs.
- **T-00a is honestly classified as green-at-both-ends rather than smuggled into the red table.**
  The "no red predecessor by construction" paragraph was extended to say why the census edit has no
  red half and what its positive control falsifies instead. Resisting the temptation to invent a
  red predecessor for a task that cannot have one keeps the red-before-green table meaningful.
- **The two new properties are aimed at laws no example set can express** — the parser accepts
  *iff* all five conjuncts hold, and last-record-wins over an arbitrary multiset of openings.
  Both are quantified statements TSPEC §3.2/§3.3 already make; turning them into properties rather
  than more examples is the right reading of "everything is tested".
- **v0.1's wrong claim was retracted explicitly, with the reasoning shown.** The coverage-gate
  section says what v0.1 asserted, why the premise was right and the conclusion wrong, and what
  changed. A plan that corrects itself in the open is far easier to review at v3 than one that
  quietly edits the sentence.

## Recommendation

**Approved with minor changes**

One Medium finding, no High. Four of my five v1 findings are resolved, the three added tasks close
real coverage holes rather than papering over them, and I found nothing out of scope and no P0/P1
acceptance criterion left without an owning task in the changed sections. F-01 is a one-line repair
to a `grep` alternation in T-03's row and should land before batch 1 begins, since T-03 builds the
frozen fixture whose cardinality every downstream byte literal assumes. It does not warrant another
full review round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
