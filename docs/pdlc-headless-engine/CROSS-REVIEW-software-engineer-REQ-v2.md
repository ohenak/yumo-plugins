# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.5, 2026-08-11)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Delta re-review. Technical lens — feasibility, implementability, completeness of
error handling, architectural compatibility. Product framing, UX and test-pyramid choices are
out of lens.

## Method

Delta protocol. Diffed `be7b69e1..HEAD` on the REQ (320 insertions, 163 deletions across 14
commits, `ec674e63`…`4610b312`) against my own v1 review, then re-verified every
existing-behaviour claim the revision *added* — every `file:line` in §1.2a, G-2, AC-1.2, AC-3.3,
C-10, O-1, O-8 — against HEAD on `feat-pdlc-headless-engine`. Unchanged sections already
approved in round 1 were not re-litigated.

## Round-1 Findings — Disposition

| v1 | Severity | State | Evidence in v0.5 |
|----|----------|-------|------------------|
| F-01 | High | **Resolved** | The transport sweep reached the mechanism layer: G-3 "through the configured transport", G-5 "the same composed prompt on either transport", C-2/C-6 per-transport, C-7 "the transport in use owns alias resolution", AC-2.3 "dispatch options' environment on the primary transport, the child process environment on the fallback", AC-6.1 "SDK `query` or a `claude` child spawn". No item still asserts a spawned child on the primary path. |
| F-02 | High | **Resolved** | C-1 split into C-1a (startup, billing-free, environment + settings only) and C-1b (per-dispatch fail-closed), with the ordering consequence stated ("a run may pass C-1a and still stop at its first dispatch; that ordering is intended"). AC-2.2 now says "no probe dispatch, zero tokens billed". |
| F-03 | High | **Resolved in mechanism, one cell short** — see F-14 | AC-2.1 now carries a literal state→catalogue-id table, states the banner reports no `apiKeySource`, and routes the session-vs-token discriminator to the new O-9. The table is not total; that residue is F-14, not a re-raise. |
| F-04 | High | **Partially resolved** — see F-13 | AC-1.2 now names the drift gate and fixes a posture (`distribution.checkEnabled: false`) instead of denying the read. The posture and its file location are right; the control-flow claim attached to it is false at HEAD. |
| F-05 | High | **Resolved** | G-2 drops the enumeration, states "the seam set is not enumerated here and differs per module", and cites the measured asymmetry exactly — `orchestrate-queue.js:1040` (`_runPipeline: runPipelineFn = realMain`), `:1422` (`runPipelineFn({ reqPath: entry.reqPath })`, no seams forwarded), `orchestrate-dev.js:8458` (throwing `agent()` stub). All three verified verbatim. |
| F-06 | Medium | **Resolved** | AC-5.1 is transport-neutral ("whichever transport the run uses"); O-2 is rescoped to per-transport mechanism and now states the measured gap plainly ("no hook or settings wiring exists in `pdlc/engine/lib/` at HEAD"), which I re-confirmed. |
| F-07 | Medium | **Resolved** | §1.2a added with a per-AC red/green table; O-1 marked partially discharged, O-8 discharged with citations. All five commits named (`059750de`, `2ed13815`, `054d5292`, `d0d2288b`, `f6f8029a`) exist with the described contents. |
| F-08 | Low | **Resolved** | R-3 now reads "§1.3's auth facts". |
| F-09 | Low | **Resolved** | NG-6 restated with the withdrawal made explicit and both transports declared in scope. |
| F-10 | Low | **Resolved** | `queue.loopIdleExit` removed from §4.1; the table is four rows, each a real tunable an AC names. |
| F-11 | Low | **Resolved** | `ready: false` now carries the frontmatter comment recording the intent. |

## Findings

All three High findings are in sections the revision *changed*, and each is the same shape:
a new literal oracle that a test engineer would transcribe faithfully and get a test that
cannot pass at HEAD.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-12 | High | Local | **AC-3.3's model map omits `MODEL_ADVISORY = "fable"`, so the set-equality it demands is unsatisfiable in every configuration.** The map's advisory row is `MODEL_ADVISORY_FALLBACK` → `opus` (`orchestrate-dev.js:1653`), but that constant is never the model of a first dispatch: the advisory rung dispatches at `MODEL_ADVISORY` (`:1652`, literal `"fable"`) via `dispatchAt(MODEL_ADVISORY)` (`:1851`), and substitutes the fallback *only* after `isModelResolutionError` on that first attempt (`:1861`). Take the three reachable configurations: (a) advisory tier disabled — which is how it ships (`advisory.enabled` defaults false; `orchestrate-dev.js:9689` reads `advisoryConfigResult.config.enabled`) — no advisory dispatch occurs at all, so the `MODEL_ADVISORY_FALLBACK` row is exercised by **zero** dispatches and the map's "every map row is exercised by at least one dispatch" direction fails; (b) advisory enabled and `"fable"` resolves — a dispatch carries model value `fable`, which appears in no map row, so the "every dispatch's model value appears in the map" direction fails; (c) advisory enabled and `"fable"` does not resolve — both a `fable` dispatch and the fallback occur, so (b)'s failure stands. There is no configuration in which the stated set-equality holds. Fix: add the `fable` row (`MODEL_ADVISORY`, `orchestrate-dev.js:1652`), and state which configuration the "full phase graph" dry run is taken under — advisory-enabled, or advisory-disabled with both advisory rows excluded from the expected set. The set-equality is the right bar; the enumeration under it is incomplete. | AC-3.3; C-7 |
| F-13 | High | Local | **AC-1.2's drift-gate carve-out describes a read that cannot occur under the posture the same AC declares, and cites the wrong opt-out.** AC-1.2(c) exempts the drift-state read from the empty-set assertion, asserting the module "reads `.claude/workflows/.pdlc-drift-state.json` through the injected `_readFile` before `QUEUE.md` is read at all (`orchestrate-queue.js:64`, `:1074`)", and in the same sentence fixes the engine's posture as `distribution.checkEnabled: false`. At HEAD those two cannot both be observed: the config-side opt-out is evaluated **first** and short-circuits the read — `const driftGate = parseDistributionCheckEnabledOptOut(distributionConfigRaw) ? distributionOptOutGate() : mapDriftState(validateDriftRecord(await readDriftStateSafely(readFileFn, DRIFT_STATE_PATH)))` (`orchestrate-queue.js:1072-1074`); the `await` sits in the untaken else-branch, and the module's own comment on `distributionOptOutGate` says so outright ("bypasses `mapDriftState`/`validateDriftRecord` entirely (no drift-state record is read at all)", `:2085-2086`). So under the declared posture the observable is that the set of paths opened under `.claude/workflows/` is **empty, full stop** — the carve-out is not merely unnecessary, it is an assertion that starts red and stays red. Two readings, two tests (must the read be observed, or merely tolerated?), which is the bar this AC was rewritten to clear. Separately the citations are off by one mechanism: `:1074` is the `mapDriftState` else-branch, not the opt-out; the config-side opt-out is `parseDistributionCheckEnabledOptOut` (`:2068`, matching `distribution.checkEnabled === false` in `.claude/pdlc.config.json`) called at `:1072`; and the cited `:1947` is `record.checkEnabled === false` — row 2 of `mapDriftState`'s ten-row precedence table, a field **of the drift-state record**, a different opt-out from the config-file one the posture actually sets. Fix: state that under the declared posture no path under `.claude/workflows/` is opened at all, make (c) an unqualified empty-set assertion, and re-cite `:1071-1072` / `:2068` for the opt-out (keep `:64` for `DRIFT_STATE_PATH`). The posture itself, and its home in `.claude/pdlc.config.json`, are correct — only the mechanism prose is. | AC-1.2; G-2; C-4; NG-7 |
| F-14 | High | Local | **AC-2.1's mapping is declared total but leaves uncovered exactly the state AC-2.4 exercises.** The table is introduced as "this total mapping", and a test is told to transcribe the expected string from it. Enumerate the cells for the state AC-2.4 fixes — subscription credential present (logged-in settings state), `ANTHROPIC_API_KEY` **also** present, `auth.allowApiKeyBilling` **not** passed: row 1 needs `CLAUDE_CODE_OAUTH_TOKEN` (absent); row 2 needs "no `ANTHROPIC_API_KEY`" (present); row 3 needs the flag (not passed); row 4 needs "no subscription credential" (there is one); row 5 needs "no credential the engine can see" (there is one). **No row matches.** AC-2.4 says that run proceeds and every dispatch reports `apiKeySource == "none"` — so a start banner is printed, and AC-2.1 supplies no id for it. C-1a agrees the run should proceed (its refusal is scoped to "`ANTHROPIC_API_KEY` present **with no** subscription credential"), which confirms the gap is in the table, not in the constraint. This is the same value-space defect F-03 named, one cell smaller: a closed operator-facing set that does not cover the state space it is mapped from. Fix: add the row (key present + subscription credential + no flag → its own id, e.g. `auth.session-key-ignored`, which is also the more useful banner — it tells the operator a key is present and is *not* being billed), or make the table's precedence explicit and first-match so row 2's "no `ANTHROPIC_API_KEY`" clause can be dropped. | AC-2.1; AC-2.4; C-1a |
| F-15 | Medium | Local | **AC-4.2's last retry-arithmetic row is internally inconsistent with the other five.** Every other row's "Observed sequence" enumerates one outcome per attempt and the "Total attempts" equals that count (`retryable × 3, then success` → 4; `retryable × 4` → 4; `timeout, then success` → 2). The row `timeout, retryable, retryable` lists three outcomes but claims **4** total attempts and a terminal classification of "`retryable`, budget exhausted" — which requires a fourth attempt whose outcome the row never states. Under the stated rule (timeout retry drawn from the same `dispatch.retryAttempts` budget, never resetting it) attempts 1-3 consume two retries, a third retry is still owed, so the sequence as written is not yet terminal. A test transcribing this row cannot construct the fixture. Fix: write it `timeout, retryable, retryable, retryable` → 4 attempts → `retryable`, budget exhausted; or keep three outcomes and give the row 3 attempts with a non-terminal state. | AC-4.2; §4.1 |
| F-16 | Low | Process | **The 0.5 change note again claims a blast radius slightly wider than the edit achieved.** It states "AC-1.1, AC-1.5, AC-2.4, AC-3.3, AC-4.1–4.3, AC-6.1/6.3 are restated with derivable oracles"; AC-3.3 (F-12) and AC-4.2 (F-15) are not yet derivable. This is the identical failure mode as round 1's F-01 root cause (a change note enumerating intent rather than verified coverage), which is why it is tagged Process rather than Local: the cheap discipline is to write the change note last, from the diff, rather than from the plan. | change note (0.5); §5 |

## Questions

Round-1 Q-01 (alias resolution ownership) and Q-04 (timeout vs retry budget) are answered by
C-7's rewrite and AC-4.2's table respectively; only the arithmetic residue (F-15) remains. Two
new questions, both narrow:

| ID | Question |
|----|---------|
| Q-05 | Who writes `distribution.checkEnabled: false` into a consumer's `.claude/pdlc.config.json` (AC-1.2)? NG-7 forbids the engine writing any engine-owned file into a consumer repo, and this is engine-required configuration, so I read it as an operator precondition — the same class as "be on `feat-{f}`". If that is right, AC-1.1's *Given* should carry it, since AC-1.1 as written specifies a repo with no `.claude/workflows/` and no such config, which AC-1.2 says is "**expected** to be blocked by the gate". Two ACs, one repo state, opposite expectations — resolvable by one clause in AC-1.1's *Given*. |
| Q-06 | How does AC-6.2's opt-in live smoke coexist with AC-6.1's hermeticity guard, given AC-6.1 states the guard "fails the suite on any attempt to construct the real transport"? Presumably the guard is armed per-suite rather than per-process, but which one owns the switch is a TSPEC decision that AC-6.1's wording currently forecloses ("every test constructs the transport through the injected seam"). |

## Positive Observations

- **§1.2a is the highest-value addition in this revision, and it is accurate.** I checked every
  claim: `pdlc/engine/lib/` holds exactly 7 `.mjs` modules, `__tests__/` exactly 9 `.test.js`
  files, `pdlc/engine/package.json:10` carries `"pdlcPluginCompat": "^0.22.0"`, and all five
  commits carry the described payloads. More importantly the red/green column is honest where
  it would have been easy not to be: AC-1.5 is marked green *with* the caveat that the specifier
  check is weaker than stated (`run.test.js:64` asserts `url.startsWith("file://")`, not the
  repo-relative path) — I verified that, and a weaker-than-stated green flagged by the author is
  worth more than a clean-looking table.
- **The "red — open work" row is measured, not estimated.** `startup.mjs` really does carry only
  an `apiKeyPolicy` banner row (`:49`, `:64`) and no auth check; there really is no hook/settings
  wiring under `pdlc/engine/lib/`; and the skill probe really is containment over a frozen list —
  `for (const skill of expectedSkills) { try { loadSkillFn(...) } catch { missing.push(...) } }`
  (`startup.mjs:102-108`), which detects a missing file but never an extra one, exactly as AC-3.5
  now requires it not to be.
- **AC-3.5's set-equality survives the 15-vs-17 cardinality trap.** "Skill identifiers the modules
  can dispatch" and "skill prompt files present" are different-sized sets under a naive reading,
  which would make set-equality impossible. It works because `EXPECTED_SKILLS` (`startup.mjs:20-38`)
  carries 17 entries including the two supplement pseudo-identifiers
  (`se-implement:SKILL-typescript.md`, `se-implement:SKILL-python.md`) — and the REQ correctly
  demotes the count to "an observation, never the assertion".
- **G-2's rewrite is the model for how to close a finding.** It removed the false enumeration,
  stated the asymmetry as a measured fact with three exact citations, and routed the exhaustive
  contract to TSPEC while keeping a REQ-level pass/fail condition ("complete enough for AC-1.1 and
  AC-1.3 to pass"). Nothing was left for the reader to reconstruct.
- **C-1's split is the right decomposition, not a wording patch.** C-1a/C-1b separate what is
  knowable for free from what costs a dispatch, and the REQ states the ordering consequence
  explicitly rather than leaving a reader to discover that a run can pass startup and die at its
  first dispatch.
- **AC-4.5 handles the underivable-value problem correctly** — presence plus internal consistency
  for arbitrary runs, exact values only for a fixture run whose sequence the fixture fixes. That is
  the right shape for an observable no spec can predict.

## Recommendation

**Needs revision**

All five round-1 High findings were addressed, and the transport sweep that produced most of
them (F-01) is genuinely complete — I could not find a surviving item that still assumes a
spawned child on the primary path. The document is substantially closer to implementable than
v0.4, and §1.2a makes it honest about being a brownfield REQ.

What blocks approval is a narrower and more mechanical class than last round. v0.5 replaced
vague clauses with **literal oracles** — a model map, a banner mapping table, a retry
arithmetic table — which is exactly right, and three of those literal enumerations are
incomplete against HEAD. A literal table is a stronger contract than prose, so an incomplete
one fails louder: a test engineer transcribing AC-3.3 or AC-2.1 faithfully gets a test that
cannot pass in any configuration.

Three changes, all additive, none structural:

1. **F-12** — add the `MODEL_ADVISORY` / `fable` row to AC-3.3's map (`orchestrate-dev.js:1652`,
   dispatched at `:1851`; the listed `MODEL_ADVISORY_FALLBACK` is reached only via `:1861`), and
   name the advisory-tier configuration the "full phase graph" dry run assumes.
2. **F-13** — make AC-1.2(c) an unqualified empty-set assertion: under the posture the AC itself
   declares, the config-side opt-out (`orchestrate-queue.js:1072`, `parseDistributionCheckEnabledOptOut`
   at `:2068`) short-circuits the drift-state read entirely, so no path under `.claude/workflows/`
   is opened. Re-cite accordingly; `:1947` names a different opt-out.
3. **F-14** — add the missing cell to AC-2.1's table (API key present **with** a subscription
   credential, flag not passed) — the state AC-2.4 exercises and currently has no banner id for.

F-15 (AC-4.2's last row) and F-16 (change note) are recorded, not gating.

No erratum: this REQ is the root document of its chain, and I found no defect in the upstream
DECISIONS or DOMAIN-CONSTRAINTS material it cites.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 1, "low": 1}
