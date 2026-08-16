# Cross-Review: test-engineer — REQ (delta re-review, round 9)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Delta only. Previously approved at `20c87cd3` (v8, all-clear). One commit has
touched the REQ since: `3605092b`, +11 / -0, a single new bullet under NG-5 recording the
engine-side version bump (0.1.0 → 0.2.0) and naming the test that guards it. Everything
outside that bullet is unchanged approved bytes and was not re-litigated.

## Delta verification

1. **`pdlc/engine/package.json` really is 0.2.0.** `pdlc/engine/package.json:3`. The REQ's
   "0.1.0 → 0.2.0" is a statement about HEAD, and HEAD agrees.
2. **The stated cause is true of the repository, not just of the prose.** `engine-v0.1.0`
   is the only engine tag on the branch, and `git diff engine-v0.1.0..HEAD` over the packed
   members reports changed bytes in `pdlc/engine/bin/pdlc.mjs`, `lib/catalogue.mjs`,
   `lib/startup.mjs` (and more) — so the pre-bump state genuinely was HEAD re-claiming a
   published number. The named tasks exist and own those files: T41 (`PLAN:221`, workflow-root
   resolver), T43 (`:223`), T45 (`:225`), T46 (`:226`), T48 (`:228`), T50 (`:229`), with the
   file-ownership rows at `PLAN:350`–`:359` confirming the engine paths.
3. **The evidence file says what the REQ says it says.** `EVIDENCE-BR-3.9.md:7-8` records
   `@kaneho/pdlc-engine@0.1.0`, tag `engine-v0.1.0`, commit `30773d0c`. The REQ's "dated
   record… is not edited" matches how the oracle consumes it (read-only, `git ls-files`).
4. **The named guard exists and is honest about its own bar.** `version-skew.test.js` carries
   two assertions matching the REQ sentence one-for-one: `!published.has(pkg.version)`
   (the "equals" leg) and `compareSemver(pkg.version, highest) === 1` (the "fails to exceed"
   leg). Both are positive-form oracles — the second asserts an exact comparison value, not
   `!== -1`, so it cannot be satisfied by an accidental equal. The published set is harvested
   only from registry-shaped tokens (`{name}@X.Y.Z`, `engine-vX.Y.Z`), with bare version
   mentions in prose deliberately excluded, so the enumeration cannot be widened by unrelated
   documentation text.
5. **Mutation-checked, not just read.** Reverting `package.json` to `0.1.0` and re-running
   the file takes it from 3 pass / 0 fail to 1 pass / 2 fail; both skew legs go red, and the
   unrelated §3-2 README leg stays green. The guard the REQ advertises is falsifiable by the
   exact defect it claims to close. `package.json` was restored; tree clean.
6. **Nothing approved was weakened.** The bullet is additive, sits inside NG-5's recorded-
   exception commentary, and states its own boundary ("a version number, not pipeline
   semantics, so it is not itself an NG-5 exception"). It introduces no acceptance criterion,
   retires none, and changes no testable surface. No AC, BR or AT text moved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| — | — | — | None. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The bullet does the thing that makes version-skew notes durable rather than decorative: it
  names a mechanical guard in the same breath as the fact. A future reader who doubts the
  claim can run one file; a future contributor who re-introduces the skew is stopped by CI's
  `Engine tests` job rather than by this paragraph.
- Reading the evidence file rather than the registry keeps the oracle hermetic and offline,
  and the comment block explains why a tag commit is not red on account of its own release —
  the one false-positive an eager version of this check would have had.
- The symmetry with the plugin-side note above it is stated explicitly ("the second half of
  the same reasoning") instead of being left for the reader to infer, which is what keeps
  NG-5 legible as one argument with two axes rather than two ad-hoc exceptions.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
