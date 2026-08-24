# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 2

## Scope and method

Product lens only, and — per the delta protocol — a **narrower scope of attention, not a lower
standard**. I re-read my own `CROSS-REVIEW-product-manager-REVIEW-v1.md`, diffed the branch since
the commit v1 reviewed, and checked each of my seven prior findings against the tree at HEAD. I did
not re-litigate the requirement-by-requirement trace in v1 §"Requirement-by-requirement trace",
which I already signed off; I re-checked only what the remediation commits touched.

**Note on this file's prior content.** A `CROSS-REVIEW-product-manager-REVIEW-v2.md` already existed
on this branch, but its commits (`9c415a75`…`97e783ca`) land **before** the v1 round's commits
(`0bd2f670`…`c23696b9`) — it is an earlier, mis-numbered round reviewing an older tree, not a
partial draft of this round. Its verdict turned on a finding (T-10 unimplemented) that has since
been remediated. Shipping it as iteration 2 would have blocked the feature on already-closed work,
so I replaced it. Its findings were already reconciled into v1's Scope tags, so no signal is lost.

**The delta under review.** Nine commits since v1:

| Commit | What it claims to close |
|---|---|
| `7bd94446` | TSPEC D-1 landed; `waveResume*` census mechanised (v1 F-02, F-03) |
| `e6f9f776` | TE F-01 — over-count end-to-end |
| `6502b422` | Queue-parity citation corrected to DEC-WVR-07 / TSPEC §5.4 (v1 F-04) |
| `76171bf6` | Wave ledger documented for operators (v1 F-05) |
| `08f6d814`, `2d36dd3e` | TE F-04, TE F-06 |
| `780971b5`, `b487e3d7`, `799ae90b` | T-10's two coverage oracles + §4.5.1's table (v1 F-01) |

**Evidence I ran, not read:**

- `npm test -- __tests__/waveResume __tests__/waveExecution.test.js` in `pdlc/workflows` →
  **6 suites, 191 tests, all passing** (v1 measured 177; the delta adds 14).
- `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`, exit 0. The tracked runtime artifact
  was regenerated in the same branch as the source change, per this repo's standing rule.
- Read `scripts/check-wave-resume-delta-coverage.mjs` end to end and traced its wiring into
  `pdlc/workflows/package.json:9`'s `test:coverage` chain.

**Production wiring, re-checked on the delta only.** The one new executable artifact this round adds
is `scripts/check-wave-resume-delta-coverage.mjs`. It is **not** a zero-caller seam: it is the third
step of `test:coverage` (`package.json:9`), which is what CI's `Unit tests (ubuntu-latest, node 20)`
check runs — so it executes on every PR, not only when someone remembers to invoke it. The
assertion that it *stays* wired is itself a test
(`waveResumeRepoState.test.js` › `the delta line-coverage oracle is wired into the coverage runner`),
which reads `package.json` rather than trusting the wiring to persist. That is the AC → production
caller → test-that-drives-that-caller chain I ask for, applied to a tooling artifact.

## Disposition of my round-1 findings

| v1 ID | Sev | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | **High** | ✅ **Resolved** | `scripts/check-wave-resume-delta-coverage.mjs` exists and is wired at `pdlc/workflows/package.json:9`; §4.5.1's fourth column is filled and its completeness is mechanised by four tests in `waveResumeRepoState.test.js:264-369` |
| F-02 | Medium | ✅ Resolved | `grep -rn INTERIM` over `orchestrate-dev.js`, `dist/pdlc-cli.mjs` and `waveExecution.test.js` → **no matches** |
| F-03 | Medium | ✅ Resolved | `waveResumeRepoState.test.js:210-246` — two-way set-equality between on-disk `waveResume*.test.js` and PLAN §3.3's manifest, plus a binding test that the exclusion it compensates for still exists |
| F-04 | Medium | ✅ Resolved (locally) | `waveResumeQueueParity.test.js` header now cites DEC-WVR-07 / TSPEC §5.4 verbatim and explicitly disowns the FSPEC attribution. The underlying FSPEC↔DECISIONS disagreement is upstream → **ERRATUM**, not a finding here |
| F-05 | Medium | ✅ Resolved | `pdlc/OPERATIONS.md:30-42` — the ledger, its path, the three outcomes with their verbatim announcements, and the deletion hatch; indexed from `CLAUDE.md:106` |
| F-06 | Low | ✅ Resolved | `waveExecution.test.js:2685-2699` — the second invocation now lives **inside** AT-09's own fixture, with the comment recording exactly the false-green it closes |
| F-07 | Low | ✅ Resolved | `waveResumeRepoState.test.js:144-166` — `M-WVR-1`/`M-WVR-2` rows pinned by their **measured phrases**, not by id-containment |

**All seven prior findings are closed, including the one High.** Taking each in turn on the two that
mattered most:

### F-01 (High) — the completeness oracle now exists, and it is the oracle the PLAN promised

This was the blocker, and the fix is the right shape rather than a box-tick. PLAN §2.1's T-10 row
promised two oracles. Both are present:

**Oracle (i), the per-file branch floor.** `package.json:9`'s chain ends in
`c8 report --check-coverage --per-file --branches 85`, and `coverageInstrumentation.test.js:87-97`
asserts that the per-file stage's branch floor is ≥ 85 by *parsing the script string*, plus
`:99-106` asserting the per-file stage runs **in addition to** the aggregate stage, not instead of
it. §4.5's DoD box records the measured number, **88.90 %**.

**Oracle (ii), the delta oracle — this is the one that matters.** My v1 finding was that a
whole-file percentage is blind to this feature: `orchestrate-dev.js` is ~16,300 lines and the
feature adds ~24 branches, so every new branch could be uncovered and the floor would still pass.
The compensating control now exists and is genuinely falsifiable:
`check-wave-resume-delta-coverage.mjs:82-98` derives this feature's introduced line ranges from
`git diff -U0` against the merge-base, `:104-134` reads c8's per-file uncovered-line list from the
Istanbul report (both zero-hit statements **and** never-taken branch locations), and `:165-173`
exits non-zero listing the offending lines. A new branch that loses its cover reds this — which is
exactly the mechanism v1 said the feature shipped without.

Two details I checked because they are where this class of oracle usually rots:

- **It cannot vacuously pass.** `:145-150` fails when the introduced-range set is empty, so a wrong
  base or a renamed path is a red, not a silent green. This is the "absence-only oracle" trap, and
  it was avoided without being asked.
- **It is rebase-safe.** `b487e3d7` moved it to prefer the *live* merge-base and keep the pinned sha
  only as a fallback (`:57-78`). The reasoning is written down at `:24-31`: Phase DOD rebases the
  branch, and diffing against a stale sha would attribute `main`'s lines to this feature. That is a
  real operational failure mode caught before it fired.

**The §4.5.1 table's completeness is itself checked, by set-equality.** `waveResumeRepoState.test.js`
carries three independent conjuncts (`:337`, `:343`, `:350`): the branch-class column set-equals a
**literal transcription** taken from TSPEC §3.1/§3.2/§2.4 — with the comment at `:325-326` stating
outright that it is "never read back out of the PLAN, which is the document under test here", which
is the no-implementation-echo rule applied correctly; no cell is still a `filled in by T-10`
placeholder; and every backticked test title a cell names must exist in the test file that cell
names, so renaming or deleting a covering test reds. The `expect(checked).toBeGreaterThanOrEqual(20)`
floor at `:369` closes the empty-table vacuity hole in the third conjunct. A deleted row fails
set-equality, as §2.1 promised.

### F-05 (Medium) — the ledger is now documented where an operator would look

`pdlc/OPERATIONS.md:30-42` is a better answer than the one I asked for. It gives the path, the
git-ignored status, when the record is written, the three outcomes each with its **verbatim**
announcement string, and — the part that matters for REQ-WVR-04's "documented … escape hatch" —
`:42` states plainly that `implementation.forcePhases` **cannot** name Phase I and will not override
the ledger, so deletion is the hatch. That negative is the thing an operator would otherwise waste a
run discovering. `CLAUDE.md:106` indexes it from the file people actually read first.

## Findings

Two new findings, both non-gating. Neither is a regression: the delta broke nothing I had approved,
and I re-ran the feature's suites and the full coverage gate to say that with evidence rather than
by inspection.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Process | PLAN §4.5's Definition of Done ships **16 of 18 boxes unticked**, including boxes for work that demonstrably landed. The completed feature's own completion record therefore reads as incomplete. | PLAN §4.5; REQ §1 |
| F-02 | Low | Local | `check-wave-resume-delta-coverage.mjs`'s header comment misstates its own position in the `test:coverage` chain — it says it runs *after* `c8 report --check-coverage`, but the chain runs it *before*. | PLAN T-10 oracle (ii) |

### F-01 (Medium, Process) — the DoD checklist is not a record of what happened

`docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` §4.5 carries 18 checkboxes. **Two** are ticked —
both added by `780971b5`, both T-10's, both carrying a measured number and a named oracle. That is
exactly the right form, and it is what makes the other sixteen conspicuous. The unticked ones
include claims I independently verified as **true** at HEAD this round:

- "All eleven TSPEC delta rows D-1 … D-11 are landed" — D-1 is the row v1 F-02 said was unlanded, and
  it is now landed (`grep -rn INTERIM` over production, the shipped runtime and the integration suite
  returns nothing).
- "`node pdlc/workflows/build-runtime.mjs --check` exits 0" — I ran it: `in-sync`, exit 0.
- "`.claude/pdlc-wave-state.json` appears in no owned-path set … `git check-ignore -v` resolves a
  root-anchored rule" — asserted by `waveResumeRepoState.test.js:63-83`, green in the run above.

So the gap is bookkeeping, not behaviour, which is why this is Medium and not High: no user-visible
capability is missing and no oracle is absent. But the product cost is real and it is not
cosmetic. §4.5 is the artifact a future maintainer reads to answer "was this feature finished, or
did it stop early?" — it is the *only* durable record of that, since `POSTMORTEM-PR-…` covers the PR
phase and PLAN §2.1's status column is likewise still `⬚` for tasks that shipped. A checklist that
reads "incomplete" on a complete feature trains the next reader to ignore checklists, which is how
the *next* feature's genuinely-skipped batch gets missed. That is precisely the failure v1 F-01
caught by hand.

I tag this **Process**, not Local, deliberately and per the tag-selection discipline: the lesson is
reusable regardless of where the fix lands, and it recurred across phases — the earlier mis-numbered
review round raised the same defect as its own F-02, also tagged `Process`. I am reconciling to that
tag rather than shipping a conflicting one for the same defect.

**What to change:** tick §4.5's boxes against observed evidence, recording the evidence beside each
as T-10's two boxes already model (a measured number, or the named oracle that proves it). Where a
box is genuinely not satisfied, leave it unticked and say why — an honest unticked box is useful;
an unticked box on landed work is noise. Additionally, and this is the durable half: a mechanical
"PLAN task ids minus landed task ids must be empty, and every id in the remainder must be an
index-only task whose stated effect is already true" check belongs in the DoD phase, where it would
have caught v1 F-01 before it reached a product reviewer.

### F-02 (Low, Local) — the delta oracle's header misdescribes when it runs

`scripts/check-wave-resume-delta-coverage.mjs:13-16` reads:

> It runs as the third step of `npm run test:coverage`, after `c8 report --check-coverage`, so it
> reads the coverage artifact that run just produced rather than re-running the suite

The chain at `pdlc/workflows/package.json:9` is:

```
c8 npm test -- --runInBand && c8 report --reporter=json
  && node scripts/check-wave-resume-delta-coverage.mjs
  && c8 report --check-coverage --per-file --branches 85 …
```

It *is* the third step, but the step it follows is `c8 report --reporter=json` — the one that
produces `coverage/coverage-final.json`, which is what the script actually reads
(`:46`, `:105`). `--check-coverage` runs *after* it. The substance of the sentence (it consumes a
freshly-produced artifact rather than re-running the suite) is correct and the wiring is correct;
only the named neighbour is wrong.

Low, and Local, because nothing depends on the ordering claim: the script fails loudly and
actionably if the artifact is missing (`:105-110`). But this comment is load-bearing documentation —
it is the explanation of *why* this script is not a jest test, and the very next reader debugging a
red delta oracle will use it to reason about ordering. **What to change:** replace "after
`c8 report --check-coverage`" with "after `c8 report --reporter=json`, and before
`c8 report --check-coverage`".

## Questions

| ID | Question |
|----|---------|
| Q-01 | On the FSPEC/DECISIONS disagreement behind v1 F-04: `6502b422` correctly re-pointed the test's citation at DEC-WVR-07 and TSPEC §5.4, but FSPEC AT-16 (`FSPEC-pdlc-wave-resume.md:406-412`) still asks for behavioural parity without qualification — "*Then:* both resolve the same outcome, the same resume point and the same provenance, **and the queue run's own report states them**". No shipped test observes a delegated run's report, by design (DEC-WVR-07 option O-9). So AT-16 as written is unmet while AT-16 as narrowed is met. I have routed this as an **ERRATUM to FSPEC** rather than folding it into my verdict, since the document at fault is upstream of the code. Should AT-16's text be amended to carry DEC-WVR-07's narrowing, or should DEC-WVR-07 be re-opened? Either resolves it; leaving the two documents disagreeing does not. |
| Q-02 | On F-01: is the intent that §4.5's boxes are ticked at Phase DOD rather than by the implementing tasks? If so that is a reasonable division and I would only ask that it be written down, because right now the two ticked boxes were ticked *by* a task (T-10, `780971b5`) and the sixteen unticked ones were owned by tasks that completed — which reads as an inconsistent convention rather than a deliberate one. |
| Q-03 | `check-wave-resume-delta-coverage.mjs:43` pins `PINNED_BASE_SHA = b029e853…` as the fallback base. The live merge-base is preferred and resolved cleanly in my run (the output names `merge-base with origin/main`), so the pin is dormant here. After this feature merges, is the pin expected to be removed, or to stay as a permanent artefact of a now-merged branch? I am not filing it as a finding — it is inert and the comment at `:24-31` explains the design — but a stale pin nobody owns is the kind of thing that outlives its reason. |

## Positive Observations

## Recommendation

## Verdict
