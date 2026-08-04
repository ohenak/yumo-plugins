# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** product lens — traceability to REQ/FSPEC, scope compliance, acceptance-criteria fidelity, and whether each recorded decision rests on a premise that is true against the branch.

## Grounding method

The document opens with a grounding pin and invites verification by symbol name. I took that
invitation literally and re-ran every mechanical claim in it against the working tree, plus the two
upstream documents it derives from. What reproduced exactly:

| Claim in the document | Verified against |
|---|---|
| five `outcome: "halted"` sites in dev, one halt + two `blocked` in queue | `pdlc/workflows/orchestrate-dev.js:7635,7650,7673,7695,8498`; `pdlc/workflows/orchestrate-queue.js:794,847,1012` |
| file sizes 8,642 / 1,587 / 383 lines | `wc -l` on the three files — exact |
| `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` are bare aliases | `orchestrate-dev.js:1578`, `:1621`, `orchestrate-queue.js:69` |
| pure-function-plus-injected-seam idiom | `orchestrate-dev.js:101,181,380,708,731,835,1361,6862,6905` — all present at the cited lines |
| `stripModuleSyntax` deletes `import` lines; `wrapModule` publishes an explicit export set | `build-runtime.mjs:44-52`, `:54-65` |
| `devModule` **and** `queueModule` are inlined into **both** bundles; ordering hazard documented | `build-runtime.mjs:281`, `:288`, hazard comment `:285-287` |
| queue prelude `const realMain = __dev.main;` consumed at `queue:764` | `build-runtime.mjs:102`; `orchestrate-queue.js:764` |
| `AWAIT_SCAN_SOURCES` is a hand-written two-element literal | `__tests__/runtimeBundle.test.js:997`, driven at `:1011` |
| `commitPaths` and `gitWithLockRetry` are module-private | `orchestrate-dev.js:6905`, `:6862` — neither carries `export` |
| manifest rows are per **artifact**, three today; a fourth source adds none | `build-runtime.mjs:277-296` — the `bundles` array has exactly three entries |
| Phase H precedes Phase PUB in `main()` | `orchestrate-dev.js:8307` (Phase H), `:8363` (Phase PUB) |
| `MERGE_GUARD_DEFAULTS`, `MERGE_DEFAULTS.mergeMode === "off"`, skipped outcome | `orchestrate-dev.js:47`, `:60`, `:1407` |
| adapter passes `model` through untouched | `runtime-adapter.js:58`, `:61` |
| `advertisedVersionViolation`; plugin at `0.20.2`; fifteen skills | `lib/document-oracles.mjs:575`; `pdlc/.claude-plugin/plugin.json:4`; `ls pdlc/skills` ⇒ 15 |
| all four DEC-ADV-10 baseline checks | `26c3f1c` is an ancestor of HEAD ⇒ true; `4d5e4dc` ("Add Phase PUB…") is an ancestor of `26c3f1c` ⇒ true; `git grep -c raisePrAndVerifyCi 26c3f1c` ⇒ 4, defined at `26c3f1c:pdlc/workflows/orchestrate-dev.js:6222`; 8,527 lines at that pin |
| DC-01/03/04/08, DEC-DIST-01/02 exist as cited | `docs/_constraints/DOMAIN-CONSTRAINTS.md:20,79,122,216`; `docs/_decisions/DECISIONS-plugin-distribution.md:15,38` |

That is an unusually high hit rate and it is the document's chief strength. The findings below are
the residue: three places where a premise is stale against the upstream documents on this branch,
and four smaller precision gaps.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **DEC-ADV-08 rests on a premise FSPEC no longer holds.** The entry states "FSPEC never reconciles the two" (C-2 vs D-5/S-4) and routes the conflict "upstream as an erratum against FSPEC". FSPEC C-2 **already reconciles it, in exactly this entry's direction**: `FSPEC-pdlc-advisory-tier.md:145` reads "The substitution is reported on the run report **only when the resolved configuration leaves the tier enabled** — a bad value that resolves the tier to disabled (e.g. a malformed `advisory.enabled`) produces a disabled run, which carries **no** advisory content on its report at all (§12 D-5, §10.3 S-4), this substitution notice included." That text landed in commit `3bbf934` ("erratum round — … gate C-2 report on enabled", 2026-08-03 17:03), i.e. ~3.5 hours **before** this document's first commit (`8d00bf8`, 20:30), and it is present at the document's own grounding pin `22b310e`. **Fix:** rewrite DEC-ADV-08's Context to cite FSPEC C-2's current wording as the settled upstream rule, delete the erratum routing and the "the conflict is routed upstream" sentence, and keep the decision itself — the emit-side placement is still the right call and is now a *conformance* choice, not a conflict resolution. | AC-1.6; FSPEC C-2, D-5, S-4 |
| F-02 | High | Local | **DEC-ADV-03 rests on the same stale premise.** Its Context says FSPEC "numbers the lifecycle 1…7 with RECORD last, but two of its own rules pull the other way — A2-6 … and R-2 …", that read literally this "demands undoing a commit", and that "A5 has the same shape". The same erratum round (`3bbf934`) settled this too — its own subject line says "decide A2 record/commit order" — and the shipped FSPEC now states it twice: the §10.1 preamble added by that commit reads "at **both** [A2 and A5], steps 5 and 7 complete **before** that durable git operation … an A2 re-grounding whose record cannot be written is reverted before it is committed, and an A5 fix whose record cannot be written is reverted before it is pushed", and `FSPEC:635` (A5-8) independently states "produced-change check and record write both complete **before** push". `FSPEC:690` (R-2) carries the matching clause. So there is no live contradiction to resolve and no erratum to route. **Fix:** restate the Context as "FSPEC v1.3 fixed the record-before-durable-act order for both A2 and A5; this entry records the *TSPEC-side expression* of that rule — the `apply` / `verifyGate` split — and why a per-seam driver branch was rejected instead", and delete the erratum routing at the end of the "Verified cost" paragraph. The `commitPaths`-export half of that paragraph is real and must stay (see Positive Observations). | FSPEC A2-6, A5-8, R-2, BR-5 |
| F-03 | Medium | Local | **The closing paragraph propagates F-01 and F-02.** "Two upstream defects are recorded but not decided here … The A2-6 / R-2 ordering gap and the C-2 / D-5 conflict are FSPEC defects … routed through the erratum channel to FSPEC's author" (§ "Decisions deliberately NOT taken here", lines 655–659) asserts both stale claims a third time, and the DEC-ADV-08 re-evaluation trigger ("FSPEC resolving the C-2 / D-5 conflict differently via the erratum channel") depends on them. **Fix:** rewrite that paragraph to name the **one** genuinely open upstream defect this document found — TSPEC's `commitPaths` export gap — and update DEC-ADV-08's first re-evaluation trigger so it no longer waits on an erratum that will not be raised. Left as-is, the document contradicts the FSPEC a reader will open next to it. | FSPEC C-2, A2-6, R-2 |
| F-04 | Low | Local | **`CLI_DEV_EXPORTS` is a ten-name allow-list, not eleven.** § "Options Considered" describes the CLI bundle as reaching `orchestrate-dev.js` "through an explicit eleven-name allow-list, `CLI_DEV_EXPORTS` (`build:243-254`)". The array at `build-runtime.mjs:243-254` holds ten names (`isComplete`, `approvalHashOf`, `sha256Hex`, `approvalAnchorPreCount`, `artifactClassOf`, `firstUnwrittenSection`, `refreshReviewState`, `checkPostmortem`, `defaultReadFile`, `defaultListFiles`). The argument is unaffected; the count is not. **Fix:** "ten-name". | — (precision of a verified-fact claim) |
| F-05 | Low | Local | **DEC-ADV-07 answers an open question outside the option set the REQ and FSPEC offered, without saying so.** AC-8.3 says "what restores a verified state — re-verification inside PUB, or a halt for the operator — is TSPEC's to choose", and FSPEC OQ-3's resolution column says "TSPEC chooses restoration path". The entry rejects both offered options — with reasoning I verified (Phase H at `orchestrate-dev.js:8307` genuinely precedes Phase PUB at `:8363`) — and provides **no** restoration path, yet frames this as report-only satisfying "AC-8.3's wording … exactly". It does satisfy the *testable* clause. **Fix:** add one sentence stating plainly that the restoration path chosen is "none — the divergence is made visible and left to the operator", so a future reader does not read the open question as answered by omission. The entry's re-evaluation trigger 3 (Phase MERGE and `dodVerifiedCommit`) already carries the downstream consequence and should be cross-referenced there. | AC-8.3; FSPEC A5-7, OQ-3 |
| F-06 | Low | Local | **DEC-ADV-04's "the tier ships working whichever branch fires" reads as a two-outcome design; REQ AC-1.4 mandates a third.** AC-1.4: "Given **neither** rung resolves, Then no advisory agent ever runs on an unresolved model, and the run fails loudly with a model-resolution error. There is no third fallback and no silent revert to `MODEL_DEFAULT`." A reader of this entry alone would conclude that non-resolution is always survivable, which is the one reading AC-1.4 forbids. **Fix:** add a clause — "and where neither rung resolves, AC-1.4's loud failure applies; 'non-fatal by construction' covers the fallback branch, not the no-rung branch". | AC-1.2, AC-1.3, AC-1.4 |
| F-07 | Low | Local | **`dev:6298` does not support the sentence it is attached to.** DEC-ADV-07 says harvest "deletes the `CODE_REVIEW-*` files that `dodVerifyLoop` writes and reads (`dev:6298`)". `orchestrate-dev.js:6297-6300` is a `_log` call naming the file; `dodVerifyLoop` itself neither writes nor reads it — the `dod-verify` agent writes it. The phase-ordering argument is correct and independently verified; only the citation is doing work it cannot do. **Fix:** cite `dodVerifyLoop` at `dev:6273` and the log at `dev:6297`, and reword to "the `CODE_REVIEW-{feature}-v{N}` files the DoD loop's verifier produces (`dev:6273`, named at `dev:6297`)". | — (grounding-pin discipline the document sets for itself) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | **The working tree has diverged from `origin/feat-pdlc-advisory-tier`.** Local HEAD is `6703b20` (2026-08-03 20:48); the remote tip is `eaa1f74` (11:36); their merge-base is `7cdfbb0` (2026-07-27). The remote tip predates the FSPEC v1.3 erratum round (`3bbf934`, 17:03) and the TSPEC revisions, so it is the stale side — I reviewed the local tree, which is what the orchestrator placed and what this document was authored against. Per the reviewer git protocol I did not pull or push in the shared tree. Confirm before the next push that the remote is intended to be overwritten rather than merged. |
| Q-02 | DEC-ADV-03 identifies a real, unfixed TSPEC gap: `commitPaths` (`orchestrate-dev.js:6905`) is module-private, is absent from TSPEC §2.3's proposed dev export list and queue prelude, yet TSPEC §6.4.1's A2 `verifyGate` calls it from the queue module. The entry says "the PLAN must carry" the export edit. Since the PLAN does not exist yet, does the Phase P author inherit this obligation from the DECISIONS Consequences table alone, or should it also be recorded against TSPEC §2.3 so the PLAN's file-ownership manifest picks up `pdlc/workflows/build-runtime.mjs`? (I have raised the TSPEC side as an erratum.) |
| Q-03 | `advisory.envelope` is an operator-editable config key (AC-1.7) whose default is the AC-3.3 allow-list, while US-03 asks for a boundary "un-widenable by the agent". No entry records why an operator-widenable envelope is acceptable where an agent-widenable one is not. That is arguably a decision worth its own entry — was it weighed and judged obvious, or not weighed? |

## Positive Observations

- **The cost claims are honest in the direction that costs the author something.** The review brief
  asks me to confirm every "this alternative is simpler/cheaper" claim against real files. DEC-ADV-01
  does the opposite of the usual failure: it *raises* its own estimate of the rejected alternative
  ("Roughly a dozen lines, not two"), then explicitly declines to inflate it — "the fourth source is
  **feasible and modest in `build.mjs`** … Rejected on that balance, not on an inflated cost." I
  checked the enumerated touch-points and each is real (`build-runtime.mjs:256` precedent, `:87-94`
  and `:96-103` prelude edits, `:281`/`:288` array insertions, the `:285-287` ordering hazard). Keep
  this shape.
- **It corrects an upstream over-claim rather than inheriting it.** TSPEC asserts twice
  (`TSPEC:115`, `TSPEC:1439`) that a fourth build source "changes the artifact-composition rule that
  `runtimeBundle.test.js` **and `distribution-manifest.json`** are written against". DEC-ADV-01
  checks and finds the manifest half false — rows are per artifact, three today, and a fourth
  *source* inlined into existing bundles adds none. I reproduced that at `build-runtime.mjs:277-296`.
  This is exactly what the erratum channel is for, and I have raised it.
- **It identifies the one genuinely unfixed upstream defect.** `commitPaths` is module-private
  (`orchestrate-dev.js:6905`, no `export`) and absent from TSPEC §2.3's export list, while §6.4.1
  requires the queue-side A2 seam to call it. Finding that required reading both documents against
  the code rather than trusting either.
- **DEC-ADV-10 is the strongest entry in the document.** D-6 is the feature's central safety claim
  (a disabled run creates exactly the files a pre-feature run creates), and the entry's four
  supporting facts all reproduce exactly: `26c3f1c` is an ancestor of HEAD; `4d5e4dc` ("Add Phase
  PUB…") is an ancestor of `26c3f1c`; `raisePrAndVerifyCi` is defined at `26c3f1c:…:6222` with four
  occurrences; 8,527 lines at the pin. The rejected alternatives are the right four, and "**one-way
  in spirit**" is the correct reversibility reading — refreshing the fixture against a tree that
  contains the feature destroys the property and cannot be recovered from the repo alone. This
  entry also aligns with the branch's own recent history, which restored the disabled-run baseline
  to `26c3f1c`.
- **US-05 is preserved everywhere it could have leaked.** No entry lets the tier declare a gate
  passed: DEC-ADV-03 makes the record a precondition of an action surviving, DEC-ADV-06 reuses the
  shipped guard matcher rather than a looser one, and DEC-ADV-07 reports an unverified head instead
  of asserting a verified one. The "widen the authority of the agents already dispatched" option is
  rejected on US-05 by name, which is the correct trace.
- **"Decisions deliberately NOT taken here" is a genuinely useful section** — recording where a
  question is settled (a runtime fact, the PLAN, another feature's decision record) is what stops a
  future agent concluding it was overlooked. Its content needs the F-03 correction, but the section
  should stay.

## Recommendation

**Needs revision**

The ten decisions are, as decisions, sound: each traces to a real product or scope constraint, none
narrows or reinterprets an acceptance criterion, no rejected alternative is required by a REQ
requirement, and the re-evaluation triggers are conditions an operator would recognise (file size,
a second consumer, a rung that will not resolve, Phase H moving, an escalation-log consumer). No
scope creep: no entry adds behaviour the REQ does not ask for, and "Make `advisory.enabled` default
to true — rejected" correctly keeps the shipped default off, matching `MERGE_DEFAULTS`
(`orchestrate-dev.js:60`).

What blocks approval is not a decision — it is that **two of ten entries are argued from an upstream
conflict that the FSPEC on this branch already resolved**, and both propose to raise an erratum
against it. Merged as written, the document tells every future reader that FSPEC contradicts itself
where it does not, and it aims two erratum rounds at a document that would reject them. That matters
beyond tidiness here: an erratum round is bounded at one per upstream document per phase, and a
rejected confirmation halts the phase to a POSTMORTEM.

Exactly what must change:

1. **F-01** — rewrite DEC-ADV-08's Context against `FSPEC:145`'s current text; delete the erratum
   routing; keep the emit-side decision.
2. **F-02** — rewrite DEC-ADV-03's Context against FSPEC's §10.1 R-2 preamble and `FSPEC:635`
   (A5-8); delete the erratum routing; keep both the decision and the real `commitPaths` finding.
3. **F-03** — rewrite the closing "Two upstream defects" paragraph to name the one live upstream
   defect (TSPEC's `commitPaths` export gap), and update DEC-ADV-08's first re-evaluation trigger.
4. **F-04 – F-07** — four one-line precision fixes: the ten-name `CLI_DEV_EXPORTS` count; an
   explicit "restoration path: none" sentence in DEC-ADV-07; an AC-1.4 clause in DEC-ADV-04; a
   citation swap for `dev:6298`.

None of these requires re-deciding anything. The revision is a rewrite of three Context paragraphs
plus four sentences.

## Verdict
