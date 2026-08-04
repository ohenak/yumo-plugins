# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Delta re-review of commit `1950734` (v1.3 → v1.4) against my v4 confirmation
(`CROSS-REVIEW-software-engineer-FSPEC-v4.md`, which reviewed `3bbf934`).

## 1. Delta under review

`git diff 3bbf934 HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` returns exactly three
hunks:

| Locus | Change |
|---|---|
| Header table (line 16) | version `1.3` → `1.4` |
| §12.1 **D-6** (line 835) | the disabled-run created-file baseline is restored to `26c3f1c` — the "feature branch's pre-feature base / fork point" wording introduced by erratum `3bbf934` is withdrawn in full, along with its justifying clause ("that pin … may sit ahead of the branch's pre-feature base") |
| §10-adjacent **T-10-3** (line 855) | the paired oracle follows D-6 back to `26c3f1c`; the "not §2's citation pin" clause is dropped |

Nothing else moved. Erratum items 2 (§4.1 step-7 / A2-6 vs R-2 ordering) and 3 (§5 C-2 gated on the
tier resolving to enabled) — both of which I confirmed resolved in v4 — are untouched by this diff
and remain exactly as approved. So this is a single-issue delta: **is the withdrawal correct?**

## 2. Correction of my own prior finding

This section exists because the withdrawn erratum cited *my* v3 questions as corroboration, and my v4
confirmation endorsed it on the strength of a git-history claim I made and did not verify. I am
retracting that claim.

**What I wrote (v4, disposition table, row 1):** "the pin is not an ancestor of
`feat-pdlc-advisory-tier` (the branch forks at `7cdfbb0`)."

**What is actually true at HEAD:**

```
git merge-base --is-ancestor 26c3f1c HEAD          ⇒ true
git merge-base HEAD main                           ⇒ 6a4548d
git merge-base --is-ancestor 26c3f1c 6a4548d       ⇒ true
git log --oneline 26c3f1c..6a4548d | wc -l         ⇒ 3
```

`26c3f1c` is an ancestor of this branch **and** of its fork point from the default branch. The fork
point is `6a4548d`, not `7cdfbb0`. The three commits between the pin and the fork point are
`dd13490` (branch-guard rev-parse re-observation), `d186bfa` (spec completeness gate by containment)
and `6a4548d` (distribution-manifest version stamp) — none of them adds, removes, or reroutes a
file-creating path in the pipeline, so the created-file set is identical at both commits.

My v3 Q-08/Q-09 and my v4 endorsement were therefore wrong on the fact, and the erratum built on
them was wrong on the same fact. `POSTMORTEM-T-pdlc-advisory-tier.md:119-131` reaches the same
conclusion independently and by the same commands. The withdrawal is a correction of my error as
much as of the author's.

## 3. Verification of the restored baseline

The erratum's load-bearing premise was that `26c3f1c` *predates* Phase PUB's file-creating path
`raisePrAndVerifyCi`, so a disabled branch-HEAD run would create files the baseline run does not.
I checked the pinned tree directly rather than reasoning from commit subjects:

```
git show 26c3f1c:pdlc/workflows/orchestrate-dev.js | grep -n raisePrAndVerifyCi
  6222: export async function raisePrAndVerifyCi({
  6875:   _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
  8250:   // … The poll-timing logic lives in raisePrAndVerifyCi.
  8257:   const pubResult = await raisePrAndVerifyCiFn({
```

Four occurrences, the definition among them — the premise is false. At HEAD the same symbol sits at
`pdlc/workflows/orchestrate-dev.js:6337` (definition), `:6990`, `:8365`, `:8372`: the same four
sites, moved by intervening churn, not added since. So Phase PUB's file-creating path is on **both**
sides of D-6's equality at `26c3f1c`, which is precisely the condition the erratum claimed was
violated.

Combined with §2's ancestry finding — `26c3f1c` is an ancestor of the fork point, and the three
commits between them touch no file-creating path — the restored baseline is sound on both counts:

| Requirement of a valid D-6 right-hand side | At `26c3f1c` |
|---|---|
| Carries every pipeline change already merged to the default branch that creates files | yes — `raisePrAndVerifyCi` defined at `26c3f1c:6222`; `26c3f1c` is an ancestor of `main` |
| Carries none of this feature's changes | yes — it is an ancestor of this branch's fork point `6a4548d`, so no branch commit is in it |
| Is not produced by running the system under test | yes — D-6 still says "observed once and transcribed into the test, never re-derived by running the code under test" |

The restored text also keeps the two properties I care about most in this oracle, unchanged from the
version I approved at v3: the expected value is a **transcribed literal**, not a re-derivation (no
implementation echo), and T-10-3 asserts **set equality** — "equals, element for element … any file
created outside that literal set fails the test, whether or not this feature named it" — not
containment, so a file the feature adds silently, or a baseline file it drops, both go red.
`TSPEC:1213-1227` independently reaches and implements the same baseline (fixture
`__tests__/fixtures/created-files-26c3f1c.json`, hand-reviewed, provenance in its header), so the
FSPEC and the TSPEC now agree again — the erratum had put them in conflict.

## 4. Non-regression check

- **No residue of the withdrawn wording.** `grep -n "fork point\|pre-feature base" FSPEC` returns
  only lines 835 and 855, and only via the surviving phrase "pre-feature baseline commit / pre-feature
  run". No dangling reference to a fork-point baseline survives anywhere in the document, so the
  withdrawal is complete rather than partial.
- **§2's citation pin is untouched.** Line 84 still reads "Every `file:line` in §2 is read at
  default-branch commit `26c3f1c`", and line 90 still stamps the baseline table with the same commit.
  The withdrawal did not have to disturb §2 because the pin was always correct.
- **Erratum items 2 and 3 are intact.** §4.1's step-7 paragraph still generalises the
  revert-before-durable-git rule to `{A2, A5}`, and §5 C-2 still gates its substitution notice on the
  tier resolving to enabled. Neither appears in the diff. My v4 confirmation of those two stands
  unchanged.
- **No test-count or traceability drift.** T-10-3 was edited in place; no test was added or removed,
  so §14's ranges and §18's count of 81 need no recount and none was made.
- **My five v3 Lows (L-05 … L-09) are untouched** and remain open and non-blocking, exactly as at v4.
  None of them sits in §12.1 or the T-10 table.

## Findings

No High and no Medium findings. One new Low, carried forward alongside the five open v3 Lows.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-10 | Low | Local | §2 introduces `26c3f1c` under the heading "**Citation pin.**" and describes only its citation role — "Every `file:line` in §2 is read at default-branch commit `26c3f1c`" (line 84). D-6 now calls that same commit "the pre-feature **baseline** commit §2 pins" (line 835) and T-10-3 calls a run there a "pre-feature run" (line 855) — a *behavioural* role §2 never claims. Both readings are true and both trace to REQ BL-02, which pins the commit for behavioural re-verification ("every §1 'Today' row was re-checked there row by row", `REQ:352-359`) — but a reader of the FSPEC alone sees only the citation role, and that gap is exactly what made the withdrawn erratum's "§2's pin is only a citation pin, so it is the wrong baseline" argument look plausible. Suggested fix: one clause in §2 — "this commit is also REQ BL-02's **behavioural** baseline, the tree §1's 'Today' rows and §12.1 D-6's created-file literal are both measured at" — so the dual role is stated where the pin is introduced rather than inferred at D-6. | §2 (line 84) ↔ §12.1 D-6 (line 835), T-10-3 (line 855) |
| L-05 … L-09 | Low | Local | Carried over from v3, unchanged and untouched by this delta: §4.1 flow-diagram terminal (L-05), its "consumes no attempt" phrasing (L-06), H-2's "deferral" wording (L-07), AT-2's membership criterion (L-08), T-07-12's final re-poll colour (L-09). | §4.1, §11 H-2, §13 AT-2, §9.4 T-07-12 |

## Questions

| ID | Question |
|----|---------|
| Q-10 | D-6's literal is captured at `26c3f1c`, which is three commits behind this branch's fork point `6a4548d`. I verified none of those three touches a file-creating path, so the sets agree **today**. If the branch is rebased forward before implementation (TSPEC §1.1 / `TSPEC:1361` make the rebase the PLAN's first task), does the FSPEC intend the literal to stay pinned at `26c3f1c`, or to be re-captured at the new fork point? My reading is "stays pinned, because REQ BL-02 pins it and a re-pin is an explicit REQ decision" — a sentence in §12.1 saying so would make the next rebase a non-event rather than a fresh argument. This is a clarification request, not a finding: the current text is not wrong. |

## Positive Observations

- **The withdrawal is surgical and complete.** Three hunks, two of them the paired D-6/T-10-3 rows
  and one the version stamp. No collateral edit, no residue of the withdrawn wording, and the two
  erratum items that *were* correct (A2/R-2 ordering, C-2 gating) were left alone rather than
  re-opened. Withdrawing a bad edit without disturbing the good ones in the same batch is the hard
  part, and it was done cleanly.
- **D-6 survived the round trip with its oracle quality intact.** The transcribed-literal
  requirement and the "a comparison whose expected value is produced by the system under test cannot
  fail" rationale are back verbatim, and T-10-3 still names the red direction explicitly. An edit and
  its withdrawal are a common way for a carefully-worded oracle to lose a clause; this one lost none.
- **The FSPEC and the TSPEC agree again.** `TSPEC:1213-1227` was already implementing the `26c3f1c`
  baseline and citing `26c3f1c:6222` for `raisePrAndVerifyCi`; the erratum had left the FSPEC
  asserting the opposite of its own downstream document. The withdrawal restores that agreement
  without needing a TSPEC edit.
- **The premise was checked against git, not against prose.** `POSTMORTEM-T:119-131` disproves the
  erratum with the two commands anyone can re-run, and names the contradiction the author was holding
  simultaneously. That is the right shape of evidence for a withdrawal, and it let me confirm it in
  one pass.

## Recommendation

**Approved with minor changes**

The v1.3 → v1.4 delta withdraws an erratum that rested on a false git-history premise and restores
D-6 / T-10-3 to the `26c3f1c` baseline. I verified the premise directly rather than by reading the
argument: `raisePrAndVerifyCi` is defined at `26c3f1c:6222` and appears four times in that tree, so
Phase PUB's file-creating path is on both sides of D-6's equality; and `26c3f1c` is an ancestor of
this branch's fork point `6a4548d`, separated from it by three commits that touch no file-creating
path. The restored baseline is therefore both complete (carries every merged pipeline change) and
clean (carries none of this feature's), which is what D-6 needs and what the withdrawn version did
not reliably give.

I also retract the ancestry claim I made in v3 (Q-08/Q-09) and repeated in v4 — that `26c3f1c` is not
an ancestor of this branch and that the branch forks at `7cdfbb0`. Both are false; the fork point is
`6a4548d` and the pin precedes it. My v4 confirmation endorsed the erratum partly on that claim, so
this v5 corrects my own record as well as the document's.

No section that carried an approval-gating finding regressed, the two correct erratum items are
untouched, and the oracle keeps its transcribed-literal and set-equality properties. One new Low
(L-10: state the pin's behavioural role in §2, where the pin is introduced) plus the five open v3
Lows — all non-blocking. **My approval stands.**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 6}

APPROVAL-HASH: sha256:179c3fe23b3ec6ed594b22e25805420363e5231da708f51969fdba1a4ce1e3e3
REVIEWED-COMMIT: 70027d2b61e28569f05873514265b68c40b31ba0
