# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md (v0.5)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** delta re-review of the round-1 revision (`ec674e63`…`4610b312`) — round-1 finding
disposition, plus new-issue scan over changed sections only. Lens unchanged: derivability of a
failing test from each criterion, oracle falsifiability, enumeration completeness.

## Round-1 disposition

| v1 finding | Sev | Status | Evidence in v0.5 |
|---|---|---|---|
| F-01 transport-bound oracles | High | **Resolved** | C-2, C-5, C-6, AC-2.3, AC-4.3, AC-5.1, AC-6.1, AC-6.3 each state the obligation per transport; NG-6 fixes both transports in scope (answers Q-01) |
| F-02 AC-2.4 no observable oracle | High | **Resolved** | AC-2.4 now positive: every dispatch reports `apiKeySource == "none"` **and** completes |
| F-03 two closed sets, no mapping | High | **Resolved in form** | AC-2.1 carries a literal state→catalogue-id table; C-1 split into C-1a/C-1b. New defect in the table itself — F-03 below |
| F-04 model map derived from code | High | **Partly resolved** | AC-3.3 transcribes literals, but the enumeration is incomplete and the both-directions check is unsatisfiable as scoped — F-02 below |
| F-05 self-contradictory taxonomy | High | **Resolved** | AC-4.1 "exactly one member of exactly this six-member catalogue", set-equality asserted, extension is an AC change |
| F-06 skill catalogue containment | High | **Resolved** | AC-3.5 set-equality both directions at startup, count demoted to observation |
| F-07 no HEAD baseline | High | **Resolved** | §1.2a per-AC red/green table; five cited commits all resolve (`059750de`…`f6f8029a`). One misclassified row — F-05 below |
| F-08 AC-1.1 parity not derivable | High | **Resolved** | AC-1.1 is structural, five transcribed observables, no comparison arm. Residual scoping gap — F-06 below |
| F-09 AC-1.2 absence-only | High | **Resolved in form** | (a)/(b) positive reads added on the same observed run. Expected-set defect — F-01 below |
| F-10 timeout/retry budget | Medium | **Resolved** | AC-4.2's six-row arithmetic table; re-derived each row against `retryAttempts: 3` — internally consistent |
| F-11 C-8 had no AC | Medium | **Resolved** | AC-6.4(a) set-equality over catalogue ids, (b) malformed-input outcomes |
| F-12 AC-1.5 unfalsifiable | Medium | **Resolved** | two observable halves; HEAD row honestly marks the specifier half weaker than stated (`run.test.js:64` asserts a `file:` URL) |
| F-13 AC-6.1 counterfactual | Medium | **Resolved** | guard fails the suite on real-transport construction + no-outbound-connection assertion |
| F-14 AC-4.3 orphan-child absence | Medium | **Resolved** | positive halt-artifact half named as the liveness proof; empty-by-construction noted for the SDK path |
| F-15 R-3 wrong section ref | Low | **Resolved** | R-3 now cites §1.3 |
| F-16 non-threshold tunable row | Low | **Resolved** | `queue.loopIdleExit` row dropped from §4.1 |

All eleven code citations added or changed this round were re-checked at HEAD and hold:
`orchestrate-dev.js:1603/:1646/:1653/:7463/:9968`, `orchestrate-queue.js:70/:64/:1074/:1040/:1422`,
`pdlc/engine/package.json:10` (`pdlcPluginCompat: "^0.22.0"`), `transport.mjs:180-205`,
`skills.mjs:68/:204/:267`, `startup.mjs:20/:102`, `run.test.js:48/:64`. §1.2a's "no hook or
settings wiring exists in `pdlc/engine/lib/`" is true (only `transport.mjs:82`'s permission-mode
comment matches). Grounding quality remains the document's strongest feature.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-1.2(c)'s expected read-set contradicts the posture the same AC declares.** The AC fixes the engine's queue posture as `distribution.checkEnabled: false` in `.claude/pdlc.config.json`, then states the drift gate "reads `.claude/workflows/.pdlc-drift-state.json` through the injected `_readFile` before `QUEUE.md` is read at all". At HEAD the config-side opt-out is evaluated **first and short-circuits the record read**: `parseDistributionCheckEnabledOptOut(...) ? distributionOptOutGate() : mapDriftState(validateDriftRecord(await readDriftStateSafely(...)))` (`orchestrate-queue.js:1071-1074`). Under the declared posture the drift-state file is never opened, so the observed set of `.claude/workflows/` reads is **empty** and the stated exception never occurs. A test cannot tell whether the exception is *required* (then it fails on a conforming engine) or merely *permitted* (then the "empty except" set-equality is really containment and a stray read passes). Restate (c) as two posture-indexed expectations: with the opt-out present the set is exactly empty; with it absent the only member is `.pdlc-drift-state.json` and the run is blocked at row 1. | AC-1.2 |
| F-02 | High | Local | **AC-3.3's model map omits a live dispatch value and two of its five rows are unexercisable in the run it scopes, so the both-directions check fails on a conforming engine.** (a) `MODEL_ADVISORY = "fable"` (`orchestrate-dev.js:1652`) is the advisory rung's *primary* dispatch model (`:1853`); `MODEL_ADVISORY_FALLBACK` is reached only after a model-resolution error (`:1863`). The map lists the fallback and omits `fable` — direction one ("every dispatch's model value appears in the map") fails the moment the advisory tier is enabled. (b) Direction two ("every map row is exercised by at least one dispatch") cannot hold for the run the AC scopes — *a dry run of the full phase graph*: the advisory tier ships disabled (`advisory.enabled` defaults `false`), and `MODEL_QUEUE` (`orchestrate-queue.js:70`, applied at `:1053`) belongs to `pdlc queue`, not to the dev phase graph. Either scope the oracle to a named dispatch corpus that provably exercises every row (dev dry run ∪ queue dry run ∪ advisory-enabled dry run) and add the `fable` row, or split the table per entry point with one set-equality per corpus. As written the strongest anti-drift check in §5 is one no engine can pass. | AC-3.3 |
| F-03 | High | Local | **AC-2.1's "total mapping" is neither total nor disjoint, and the state AC-2.4 tests has no row.** Rows are unordered predicates: `CLAUDE_CODE_OAUTH_TOKEN` set **and** `ANTHROPIC_API_KEY` present with the flag passed satisfies rows 1 and 3 simultaneously (no precedence rule is stated), so the banner id is not a function of the state. Worse, the state `{ANTHROPIC_API_KEY present, subscription credential present, flag not passed}` matches **no** row — row 2 requires no API key, row 4 requires no subscription credential — yet that is exactly AC-2.4's *given*, a run the REQ requires to proceed. A test transcribing the expected banner string from this table, which is what the AC instructs, has nothing to transcribe for its own headline billing scenario. Fix: declare first-match precedence over an ordered list and add the missing row (API key present but subscription credential present, flag not passed) with its own id. | AC-2.1, AC-2.4, C-1a |
| F-04 | Medium | Local | **AC-1.2's opt-out citation points at the wrong mechanism.** The sentence claims "the documented opt-out the module honours **ahead of the drift-state record** (`orchestrate-queue.js:1947`)", but `:1947` is `mapDriftState`'s row 2, `record.checkEnabled === false` — an opt-out read *out of the drift-state record itself*, which is precisely the one a repo with no `.claude/workflows/` tree can never reach. The config-side opt-out the AC actually means lives at `:1071-1073` with its parser at `:2077-2081`. Per DC-02 a cited line must support the claim; re-cite. | AC-1.2 |
| F-05 | Medium | Local | **§1.2a files AC-4.5 as fully green, but its per-dispatch auth clause is red.** AC-4.5 requires "the transport-reported auth source observed **per dispatch**"; HEAD records a single most-recent value — `adapter.mjs:320` keeps `lastApiKeySource`, surfaced once as `report.mjs:51`'s scalar `apiKeySource` (`bin/pdlc.mjs:227`). AC-2.4's "the run report records that value per dispatch" is the same clause and is correctly filed red one row below, so the two rows contradict each other. A test engineer reading the green row would re-assert an existing scalar instead of writing the red test the criterion demands. Split AC-4.5 across the two rows, or note the per-dispatch clause as the open part. | §1.2a, AC-4.5 |
| F-06 | Medium | Local | **AC-1.1's "set-equality" degrades to containment for two of its five members.** Item 1's expected set contains run-dependent members — `DECISIONS` "when warranted" and "one `CROSS-REVIEW-{role}-{doc}[-v{N}].md` **per review round run**" — neither of which is fixed before the run, so no expected set can be transcribed and the check becomes "every observed file is explainable", which a missing artifact passes. Same leak reaches AC-6.2, which reuses "the same structural set". Name the fixture that fixes them (a scratch feature whose enabled phases, DECISIONS disposition and round count are pinned), and state that items 1's equality is over that fixture, with the general case asserted as the weaker containment it is. | AC-1.1, AC-6.2 |
| F-07 | Low | Local | **§1.2a cites a test that does not support its row.** The "partially green" row for AC-1.4/4.3/6.1 cites `smoke.test.js:294`, `:309`; `:294` is the halt/git-state test and does support it, but `:309` is "a bad REQ path is refused by the module, not by the engine" — a different property. Drop or re-cite. | §1.2a |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-3.5 asserts set-equality between "the set of skill identifiers the modules can dispatch" and the files present in the plugin. Where does the left side come from at test time, given C-7's spirit that the engine holds no such table? At HEAD it is `startup.mjs:20`'s frozen `EXPECTED_SKILLS`, which is exactly the containment list the AC replaces — if the engine keeps a hardcoded list, the "equality" only proves the list matches the disk, never that it matches what the modules dispatch. Does the AC intend a third source (e.g. a static scan of the modules' dispatch sites)? |
| Q-02 | AC-4.2's table fixes attempt counts for six sequences. Is `timeout`'s "at most once" a per-run cap or a per-dispatch-position cap? Row 4 (`timeout, timeout` → terminal) reads as per-run; row 6 (`timeout, retryable, retryable` → 4) is consistent with either. A seventh row (`retryable, timeout, timeout`) would disambiguate. |
| Q-03 | O-2 names hook/settings provenance as "the largest open safety gap" and AC-5.1 requires the refusal on **either** transport. If the SDK path turns out to accept no PreToolUse-equivalent, is AC-5.1 a blocking gate on the primary transport, or does the fallback become mandatory for runs that can delete review artifacts? |

## Positive Observations

- §1.2a is the single best change this round. A per-AC red/green table with commit-level
  evidence turns "write the tests" into two distinct, sized jobs, and it is honest where it
  hurts — "no auth check exists in `startup.mjs`", "no hook/settings wiring exists in
  `pdlc/engine/lib/`" both verify at HEAD. I would like this subsection to become a template.
- AC-4.2's arithmetic table is the model for what a threshold-bearing AC should look like:
  six literal sequences, literal totals, literal terminal classifications. Re-derived all six
  against `dispatch.retryAttempts: 3`; they are consistent, and every one can fail.
- The C-1a/C-1b split is a genuinely better decomposition than my F-03 asked for: it separates
  a billing-free inspectable check from an in-band assertion and states explicitly that a run
  may pass the first and stop at the second — the ordering is documented as intended rather
  than discovered by a confused test.
- AC-6.4(b) naming an unrecognised `apiKeySource` and unparseable transport output as the two
  malformed-input cases ties C-8's total-function claim to concrete, writable tests.
- AC-3.5's "the count (17 at HEAD) is an observation, never the assertion" is exactly the
  right instinct, and worth copying wherever a magic number survives elsewhere in the family.

## Recommendation

**Needs revision**

Thirteen of sixteen round-1 findings are resolved outright, and the revision broke nothing that
was previously approved — the grounding, the §4.1 discipline and the transport-neutral restatement
all hold up under re-check. The three remaining Highs are all inside criteria rewritten *this*
round, and all have the same shape: an enumeration that is asserted to be closed or total but is
not (AC-2.1's mapping, AC-3.3's model map) or an expected set contradicted by the configuration
the same AC declares (AC-1.2's read set). Each is a bounded edit — add the missing row, state a
precedence rule, scope the corpus that exercises every row, split the read-set by posture. None
requires reopening a settled decision.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}
