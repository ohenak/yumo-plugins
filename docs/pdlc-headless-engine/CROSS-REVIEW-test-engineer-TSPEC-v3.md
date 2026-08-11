# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review of the v1.2 revision — whether v2's two blocking findings are
resolved and whether the revision broke anything. Diffed against `5a63d159` (the commit
carrying the v2 review); unchanged sections are not re-reviewed. Every claim below is
grounded in HEAD source on `feat-pdlc-headless-engine` and cited by `file:line`; two claims
were measured by execution rather than read.

## Prior findings disposition

All five v2 findings are addressed. I checked each resolution against HEAD rather than
against the changelog, and two of them by running the mechanism:

| v2 finding | Disposition | Verification |
|---|---|---|
| F-17 High — §7.4's `(phase, model)` pair oracle was not AC-3.3's assertion and was unwritable at HEAD | **Resolved in form, one new defect in the replacement — F-22.** §7.4 now transcribes AC-3.3's two directions verbatim (`REQ:479-495`) and adds a per-row witness table; rows 6/7 are separated by `skill` + fixture rather than by `label`, exactly as the finding asked | the two `haiku` sites still pass `{ model }` with no label (`orchestrate-dev.js:7463`, `:9968`); row 4's advisory pair resolves (`:1841` dispatch body, `:1861` fallback), and `MODEL_ADVISORY = "fable"` (`:1652`) |
| F-18 High — the suite-wide run id was minted per child process, so no two test files shared a directory | **Resolved, and I measured the fix's premise.** §7.0 moves minting into `__tests__/_run-suite.mjs` before any child exists, adds the two-file inheritance self-test the finding asked for, and empties the run dir as an ordered step | measured on node v20.20.1: with `PDLC_TEST_RUN_ID` set by the parent, both test-file processes and the `--import` preload read the one value (`runid=parent-minted` in both children, distinct pids) |
| F-19 Medium — the no-bare-literal test was red on HEAD's reviewer-role map with no stated exemption | **Resolved, and the closed list is complete as measured.** §3.3 names a fixed allow-list and asserts the observed exempt sites are *exactly* that list | scanning both modules for a quoted member of the derived union outside comments returns exactly the constant declaration (`:1797`), `PHASE_DISPATCH` rows (`:3344`–`:3435`), the three role-map keys (`:6229`–`:6231`), and dispatch sites — no fourth exemption is needed |
| F-20 Medium — "set-equality over transport option keys" was red on every real dispatch | **Resolved.** §3.4 is now containment over the permitted four plus `cwd` presence, with the reason (`model`/`timeoutMs`/`maxTurns` assigned only when defined) stated | `adapter.mjs:278` builds `{ cwd }`, `:279`–`:281` add the other three conditionally |
| F-21 Low — `SKILL_SE_IMPLEMENT`'s comment undercounted its dispatch sites | **Resolved for `se-implement`** (`:10028`, `:10068` added), **not for `harvest-learnings`** — see F-25 | `:10448` and `:10542` both name `harvest-learnings`; the constant comment carries only `:10542` (TSPEC:300) |

v2's three questions are answered: Q-06 by §3.3's narrowing decision, Q-07 by the
collection measurement (which I reproduced — a directory holding `a.test.js`, `b.test.js`
and `_bootstrap.mjs` reports `# pass 2` and never collects the helper), Q-08 by O-ENG-T5.

## Findings

Scoped to text added in v1.2. Nothing already approved is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | High | Local | **§7.4's row-1 and row-2 witnesses are red on correct HEAD, because Phase I's V-wave is announced under a different phase than it is pinned by.** Row 1 asserts "in run i, *every* descriptor with `phase !== "Phase I"` has `model === "opus"`" and row 2 the converse over `phase === "Phase I"`. Under §4.1's normalisation (prefix up to the first `:`), the V-wave PROPERTIES-tests dispatch normalises to **`"Phase PT"`** — `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` (`orchestrate-dev.js:10248`) — while its model is `MODEL_IMPLEMENTATION`, i.e. `sonnet` (`:10253`). So in wave mode row 1's *every* is falsified by a correct dispatch and row 2 misses it. M-ENG-07's prose row ("Phase I implementation waves", `pdlc-engine-baseline.md:132-133`) covers this dispatch fine — it is the *mechanised transcription onto normalised phase* that breaks, which is precisely the translation this section owns. Compounding it: whether run i is red is currently decided by an **unstated fixture choice**, since the legacy worktree path pins the same PT dispatch on Opus (`:10068`, no model option) while wave mode pins Sonnet (`:10253`); the spec never says which Phase-I mode run i executes, so two implementers can build run i and disagree about whether the suite is green. Both halves need fixing in the spec, not in the eventual assertion: state which Phase-I mode run i drives, and state the rule that puts the V-wave on the Phase-I side of rows 1/2 (normalise the V-wave banner to `"Phase I"`, or make rows 1/2 quantify over *model-pinning site* rather than normalised phase). | §7.4, §4.1, `pdlc-engine-baseline.md:132-133` |
| F-23 | Medium | Local | **Row 4's `seq`-adjacency conjunct is a flakiness source that the row does not need.** The witness requires the fallback `opus` descriptor's "immediately preceding descriptor by `seq`" to be the same skill on `fable`. `seq` is §4.1's *run-wide* monotonic index, and adjacency in it is guaranteed only if no other dispatch is in flight across the `.then` hop between `dispatchAt(MODEL_ADVISORY)` and `dispatchAt(MODEL_ADVISORY_FALLBACK)` (`orchestrate-dev.js:1851`→`:1861`). Nothing in the spec establishes that: run iv is a whole pipeline run (rows 1/2 require one), and the A3/A4 seams sit in Phase DOD beside the verifier and remediator dispatches. The row already carries a sufficient and stable discriminator — the forced model-resolution failure the fixture plants, which no other `opus` `se-review` dispatch can exhibit. Replace global-`seq` adjacency with a seam-scoped pairing (both descriptors carrying the same advisory-seam invocation id), or drop the adjacency conjunct and keep the forced-failure one. Also, the sentence's second `whose` is ambiguous about which descriptor raised the error — it is the `fable` one (`:1861` is reached only behind `isModelResolutionError`); as written an implementer can read it as the `opus` descriptor, which is never true. | §7.4 |
| F-24 | Low | Local | **§4.1's `label:` accounting is presented as exhaustive and is not.** It says "of the 13 `label:` occurrences in `orchestrate-dev.js`, eight are `PHASE_DISPATCH` row fields (`:3340`–`:3433`) and the rest are git-helper seam options (`:8710`, `:8730`) and JSDoc". The thirteenth is `label: dispatch.label` passed into `routeErrata`'s options object (`:9574`) — neither a git-helper option nor JSDoc. The conclusion the paragraph draws ("none is a dispatch argument") is **true**, and I verified it independently; only the enumeration is short one row, and an enumeration offered as a count is the kind of claim a later reader re-checks. Add `:9574` to the list. | §4.1 |
| F-25 | Low | Local | **`SKILL_HARVEST`'s comment undercounts its dispatch sites — the unfixed half of v2's F-21.** TSPEC:300 annotates the constant `// :10542`; HEAD also names `harvest-learnings` at `orchestrate-dev.js:10448` (`skill: "harvest-learnings"`). Since §8.3 commits to replacing bare skill literals *at their dispatch sites*, the omission propagates into the PLAN task's edit surface exactly as the `se-implement` omission did. One comment edit. | §3.3, §8.3 |

## Questions

## Questions

| ID | Question |
|----|---------|
| Q-09 | §3.4's presence half asserts `cwd` is *present* on every dispatch. `adapter.mjs:278` builds `{ cwd }` unconditionally, so the key exists even when the value is `undefined` (§4.1 types it `string\|undefined`) — a key-presence assertion would pass on a run where the cwd discipline silently degraded. AC-2.5's value is traced elsewhere (§2.3, `run.mjs:155`), so this may be deliberate division of labour; if so, one clause saying the *value* is asserted in the AC-2.5 test and not here would keep a later reader from taking §3.4's row as the whole guarantee. |
| Q-10 | §4.1's "at HEAD no dispatch is composed before the first `_phase` call, so a non-zero `(no phase)` count is a finding" is the right shape, but it reads as an expectation rather than an assertion. Is the `(no phase)` bucket being zero part of the suite-wide assertion set (§7.4's table), or only reported? If only reported, the first dispatch that drifts ahead of a phase banner lands in a bucket nobody fails on. |

## Positive Observations

- The F-18 fix is the honest version, not the cheap one. Moving the mint into
  `_run-suite.mjs` and adding the two-file inheritance self-test attacks the property that
  was silently false, and the paragraph naming the *tempting repair* ("scan all run
  directories and drop the emptiness guard") is the sentence that will stop a future
  implementer walking back into the vacuity. I reproduced the premise: one parent-set
  `PDLC_TEST_RUN_ID` reaches both child test-file processes and the `--import` preload.
- The Q-07 answer is a measurement, and it is correct — I re-ran it. `node --test` on a
  directory holding `a.test.js`, `b.test.js` and `_bootstrap.mjs` reports `# pass 2` and
  never executes the helper, so the `_`-prefixed helpers can live in `__tests__/` without a
  double-execution guard.
- §3.3's exemption is a *closed list asserted as exactly that list*, not a loosened regex,
  and it is complete: scanning both modules for quoted members of the derived union turns up
  nothing outside the constant declaration, `PHASE_DISPATCH`, the three role-map keys, and
  real dispatch sites. That is the difference between an exemption and a hole.
- §4.4's phase correction is the finding chased to its root. `byPhase` keyed on `label` would
  have reported `{ "null": N }` for a whole run and *looked* satisfied — a false-green of the
  worst kind, since it answers FSPEC §12.2 with strictly less than `bySkill` already carries.
  Taking the phase from the `_phase` seam the modules already call (`orchestrate-dev.js:10136`
  and siblings; `adapter.mjs:357` logs it today) buys the per-phase view without touching a
  workflow module, which keeps §8.3's claim true rather than quietly false.
- §7.4's own admission that the v1.1 oracle "would have been red on correct code for three
  separate reasons" — and then enumerating them — is the kind of writing that makes a spec
  auditable. F-22 is one more instance of the same class the section is already hunting.

## Recommendation

**Needs revision**

One High, and it is narrow: **F-22**. Both of v2's blocking findings are genuinely fixed —
I verified the run-id fix by execution, not by reading — but the F-17 fix introduced one
defect of the same family it was curing. §7.4's rows 1 and 2 quantify over the *normalised
phase*, and HEAD's Phase-I V-wave is announced as `"Phase PT"` while pinned on Sonnet, so
row 1's *every* is red on correct code in wave mode; and the spec does not say which
Phase-I mode run i drives, so two implementers can build run i and disagree about green.
Two sentences fix both halves — a normalisation rule for the V-wave banner, and one line
naming run i's Phase-I mode.

F-23 is a Medium worth taking in the same pass because it is the same shape: an
over-strong conjunct (`seq` adjacency) that the row does not need, sitting next to a
discriminator that is already sufficient. F-24 and F-25 are one edit each.

Nothing in v1.2 broke a previously approved section. The phase-provenance change is the
right root fix and it preserves §8.3's "no other file under `pdlc/workflows/` is modified",
which I checked rather than assumed: the phase comes from a seam the modules already call.
One round from close.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
