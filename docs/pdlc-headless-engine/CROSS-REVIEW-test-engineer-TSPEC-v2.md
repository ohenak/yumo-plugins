# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** delta re-review of the v1.1 revision — whether v1's blocking findings are resolved and
whether the revision introduced anything new that breaks. Diffed against `54b0e667` (the commit
carrying v1 of this review); unchanged sections are not re-reviewed. Every claim below is grounded
in HEAD source on `feat-pdlc-headless-engine`, cited `file:line`, or in a measurement run here.

## Prior findings — disposition

All seven v1 High findings are resolved, and I checked each against HEAD rather than against the
changelog:

| v1 | Disposition | Verification |
|---|---|---|
| F-01 High — `resolveTransport` selector contradicted FSPEC §3.2 | **Resolved.** §3.4 now states there is no selector, `kind` is constant, `"cli"` is reachable only by direct unit construction, and §4.5's field carries one value | consistent with `FSPEC:193-196`; §6.4 no longer disagrees with §3.4 |
| F-03 High — module-scoped accumulator is per test *file*, outcome harness vacuously green | **Resolved in principle**, new defect in the replacement mechanism — see F-18. §7.0 replaces it with per-pid JSONL files unioned by a post-`&&` step, and makes an empty union a failure | measured again here: `node --test` still runs one child per file (pids differ) |
| F-04 High — guard-parity oracle had no execution mechanism, clauses absence-shaped | **Resolved.** §6.3 step 3 ("perform the deletion the verdict permits") is the missing half, and the three-row falsifier table gives each clause a counterpart | the allow-path control is what makes clause (b) falsifiable, exactly as asked |
| F-05 High — `agent-reported-failure` had no predicate, any predicate broke R-ARCH-2 | **Resolved.** Literal regex, stated in the spec, owned by layer 2; `outcome.mjs` receives a boolean. The `VERDICT:`-is-not-a-failure paragraph is the right guard | the "mentions the token mid-line ⇒ `ok`" falsifier is the transcription check I wanted |
| F-06 High — queue's declared set wrong; rung-4 scope unstated | **Resolved and correct.** `se-author` is the Phase-0 triage dispatch (`orchestrate-queue.js:1216`), the advisory identifier reaches the queue via `runAdvisorySeamFn` (`:1252`) with `_agent: rawAgentFn` (`:1258`) → `ADVISORY_RUNG_SKILL` (`orchestrate-dev.js:1797`, dispatched `:1841`), and rung 4 now checks the union | all four citations resolve exactly |
| F-07 High — source-scan derivation reached only 3 of 10 identifiers | **Resolved, and mechanically verified.** I ran §3.3's derivation against HEAD's exported `PHASE_DISPATCH`: the five role keys yield `{dod-verify, pm-author, pm-review, se-author, se-implement, se-review, te-author, te-review}` (8), plus `ship-pr` and `harvest-learnings` from the named constants = **exactly 10**. `verifier` and `remediator` are real keys (`orchestrate-dev.js:3434`, `:3435`) | derivation executed against the module, not read |
| F-08 High — AC-1.2 had no observation instrument | **Resolved.** §7.7 designs one, and the two positive clauses plus the "recording is non-empty" and "planted `.claude/workflows/` read must fail clause 3" controls are what stop clause 3 being absence-only. The populated-fixture point is the detail that makes it real | §2.5's decision not to override the modules' IO seams is correctly load-bearing here (`orchestrate-dev.js:8492`) |

All seven v1 Mediums and both Lows are addressed too: `BR-TRANS-*` removed in favour of `R-TRANS-1`
(F-02); §4.1 relabelled adapter-internal with §3.4 named as the boundary (F-09, but see F-20); the
timeout backoff arm stated with a testable 30 s at attempt 0 (F-10); `--import` replacing "installed
by the bootstrap" (F-11); the three generated `dist/` rows and the same-task rebuild obligation added
to §8.3 (F-12); the scanner's positive control and named pattern (F-13); M-ENG-09 as a durable record
with an unrecorded-is-red gate (F-14); and the three off-by-N citations corrected — `report.mjs:50`,
`adapter.mjs:278`, `orchestrate-queue.js:1041` all resolve now (F-15), and AC-1.5 repointed to §2.4
with `run.mjs:52`/`:58` and `__tests__/run.test.js:48`/`:64`, all four exact (F-16).

## Findings

All five are on material **new in v1.1**. Nothing previously approved is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-17 | High | Local | **§7.4's new model-map harness restates AC-3.3 as a stricter oracle that cannot be written at HEAD.** The row asserts "the observed `(phase, model)` pairs ≡ **M-ENG-07's seven rows**, in both directions". REQ AC-3.3 (`REQ:479-495`) asserts something different and writable: forward, "every dispatch descriptor's **model value** in the corpus appears in the map"; reverse, "every **map row** is exercised by at least one descriptor". The pairs formulation fails on both halves of the enumeration it claims set-equality over. (a) M-ENG-07's first row is a **wildcard** — "every phase except Phase I → `opus`" — so it expands to one pair per phase label, and no rule is given for collapsing observed pairs onto it; a literal `pairs ≡ rows` comparison is red at HEAD in the forward direction for reasons unrelated to any defect. (b) The two `haiku` rows carry **no phase at all**: both recovery dispatches pass `{ model: "haiku" }` with **no `label`** — `_agent(reviewer, recoveryPrompt, { model: "haiku" })` (`orchestrate-dev.js:7463`) and `agentFn("se-author", …, { model: "haiku" })` (`:9968`) — so the seam's recorded `{skill, label, model}` has `label === undefined` for both, and the pair `(undefined, "haiku")` cannot witness two distinct rows. The corpus and the accumulator are right; the *oracle statement* is not. Transcribe AC-3.3's two directions instead (model values forward, rows-exercised reverse) and state how a descriptor witnesses a row — `skill` + the fixture's provocation distinguishes v(a) from v(b), where `label` does not. | §7.4, §4.1, `REQ:479-495` |
| F-18 | High | Local | **§7.0's run-id inheritance is false on the target runtime — measured — so the four suite-wide unions do not in fact share a run directory.** §7.0 specifies the run dir is "keyed by `PDLC_TEST_RUN_ID` (set by the bootstrap on first use, **inherited by every child**)". I ran exactly the specified invocation on this repo's node (v20.20.1): `node --test --import=./__tests__/_bootstrap.mjs __tests__/` over two test files printed **two** bootstrap lines, one per test-file process, and **no root-process line** — the runner does not preload `--import` into a parent that then seeds the env, so each child minted its own id (`6109-…`, `6110-…`) and each would write to a **different** `${PDLC_TEST_RUN_DIR}`. `_assert-suite-wide.mjs` then reads one directory holding a fraction of the run (or, minting its own id, an empty one). The failure is red rather than vacuously green — §7.0's emptiness guard earns its place — but it is red *by construction on every run*, and the tempting repair under time pressure is to scan all run dirs or drop the emptiness guard, which walks straight back into the vacuity §7.0 exists to prevent. Fix it where the id is minted, not where it is read: generate `PDLC_TEST_RUN_ID` in `scripts.test` **before** `node --test` (so every child inherits one value from the shell) and have the assertion step consume and clear that same dir. Whatever the mechanism, §7.0 should state the check that proves it: a two-file self-test asserting both files' records land in one directory. | §7.0, §7.4, §3.5, §5.1 |
| F-19 | Medium | Local | **§3.3's new no-bare-literal test is red at HEAD on a legitimate non-dispatch use, and no exemption is stated.** The oracle is "no string literal equal to a member of the union appears in either module's source outside the constant declarations and `PHASE_DISPATCH`". HEAD has a reviewer-role map whose **keys are three of those identifiers**: `"se-review": "software-engineer"` (`orchestrate-dev.js:6229`), `"pm-review": "product-manager"` (`:6230`), `"te-review": "test-engineer"` (`:6231`). These are not dispatch sites and promoting them to computed keys is churn, so as written the test fails on correct code — and the only repairs are an exemption or a loosened pattern, which is the pressure §3.3 itself warns about. Name the exemption in the spec (an allow-list of non-dispatch literal sites, asserted to be exactly that map) so the loosening is a reviewed decision rather than an implementer's. | §3.3, §8.3 |
| F-20 | Medium | Local | **The transport-boundary oracle says "set-equality over its keys", but HEAD's object has one required key and three optional ones, so `≡` is unsatisfiable.** §3.4 asserts "set-equality over its keys, not containment" for `{ model, cwd, timeoutMs, maxTurns }`, and §4.1 repeats it. HEAD builds `const dispatchOpts = { cwd }` and adds `model`, `timeoutMs`, `maxTurns` only when defined (`adapter.mjs:278-281`) — and §4.1 itself notes `maxTurns` is *never* set by the modules, so no real dispatch can ever present four keys. The written assertion therefore fails on every dispatch. What is meant, and what should be written, is a two-part contract: observed keys **⊆** the four-member permitted set (the completeness half, which catches a fifth key leaking to the transport), **and** `cwd` always present. State both; "set-equality over the *permitted* set" is the sentence, not set-equality over the instance. | §3.4, §4.1 |
| F-21 | Low | Local | **§3.3's `SKILL_SE_IMPLEMENT` comment undercounts its dispatch sites, which understates §8.3's edit surface.** The constant is annotated `// :8064, :10142, :10251, :10448`; HEAD also dispatches `"se-implement"` as a bare literal at `orchestrate-dev.js:10028` and `:10068`. Since §8.3 commits to "bare skill literals replaced by those constants at their dispatch sites", the omission propagates into a PLAN task's file-edit estimate, and the F-19 allow-list would have to cover the two stragglers if they are missed. Add them to the comment. | §3.3, §8.3 |

## Questions

| ID | Question |
|----|---------|
| Q-06 | §3.3's derived set is 10; `startup.mjs:20`'s `EXPECTED_SKILLS` is 17 prompt files over 15 skills, and rung 4 currently checks that wider set. Deleting it narrows rung 4's readability check by five skills (`consolidate-learnings`, `tech-lead`, `tech-lead-python`, the two orchestrator SKILLs). That is the correct reading of AC-3.5 — dispatchable ≡ readable, and those five are not dispatched by either module — but it is a deliberate *reduction* in what startup catches, and the TSPEC does not say so. Worth one sentence, so a later reader does not "restore" the missing five and reintroduce the declaration BR-START-4 forbids. |
| Q-07 | §7.0's `_bootstrap.mjs` and `_assert-suite-wide.mjs` sit inside `__tests__/` but must not be discovered as test files. Under `node --test __tests__/` on node 20 they are not (neither matches the runner's naming patterns), so this works — but it works by filename convention, and a rename to `bootstrap.test.mjs` would silently make the bootstrap a test. Is the leading underscore load-bearing enough to state? |
| Q-08 | §6.5's gate fails the hermetic suite when no M-ENG-09 row exists for the running platform, and §7.6 runs on ubuntu + macos. On a contributor's machine that is neither (a Linux distro reporting differently, or a container), does the gate fail on a platform key it will never have a row for? O-ENG-T4 opens the staleness predicate; this is the *unknown-platform* case, which is a different question. |

## Positive Observations

- The revision did the hard version of every fix rather than the cheap one. §6.3's step 3 — "then
  perform the deletion the callback's verdict permits" — is the single sentence that turns the whole
  guard-parity suite from well-formedness checking into behaviour checking, and the allow-path
  control that proves the harness *can* delete is the right way to prove it.
- §5.1's predicate resolves F-05 without weakening R-ARCH-2, and the paragraph explaining why
  `VERDICT: Needs revision` is a **successful** dispatch is the kind of reasoning that stops a future
  implementer "improving" the classifier into a pipeline-aware one. The falsifying companion (token
  mid-line ⇒ `ok`) is a transcription of the stated predicate, not an echo of an implementation.
- §3.3's derivation is genuinely computed, and I verified it executes to exactly the claimed 10
  against HEAD's `PHASE_DISPATCH`. Changing the oracle from "parse source" to "read imported data"
  is the correct move: the property is now true by construction and the no-bare-literal test guards
  only the one escape hatch (modulo F-19's exemption).
- §7.7's insistence on a **populated** `.claude/workflows/` fixture — "an empty directory would
  satisfy clause 3 for the wrong reason" — is exactly the instinct this review keeps asking for, and
  it is applied here without being asked.
- §4.6 answering a tunable question I did not raise (`queue.maxIterations` unbounded, with a test
  asserting `runQueueLoop`'s own `100` is never the effective value) is a real catch: `run.mjs:273`'s
  default and `bin/pdlc.mjs:304-305`'s `Infinity` do disagree, and a `bound-reached` report on a queue
  the operator believed unbounded is precisely the silent failure that would follow.
- §9.2's O-ENG-T2 correcting itself against HEAD (`withCwd` at `run.mjs:155` **does** `process.chdir`,
  so the in-process case is settled by exclusion, not coherence) is a document arguing against its own
  earlier claim on evidence. Verified: `run.mjs:158`.

## Recommendation

**Needs revision**

Two High findings, both narrow, both on text added in v1.1, and neither on the design:

1. **F-18** is the same shape as v1's F-03 one layer down — the replacement mechanism is right in
   architecture and wrong in one detail I could measure in a minute. Fix where the run id is minted.
2. **F-17** is a restatement error, not a design error: §7.4 states a stricter oracle than AC-3.3
   asks for, and the stricter one is unwritable at HEAD because M-ENG-07's first row is a wildcard
   and both `haiku` dispatch sites carry no label. Transcribing AC-3.3's own two directions resolves
   it.

The three Mediums/Lows are one sentence each. Everything v1 blocked on is genuinely resolved, and I
checked the resolutions against the code rather than the changelog — the derivation executes to 10,
the queue's corrected citations all resolve, and the guard oracle now has a falsifier per clause.
One more round should close this.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 1}
