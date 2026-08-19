# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.5, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** Delta re-review. Round-2 findings F-10…F-14 and the sections the v1.4→v1.5 diff touched, only.
Reviewed on `feat-pdlc-advisory-wave-gate` at `afa55439`; diffed against the round-2 base `99d3eb50`.

## Round-2 Disposition

| v2 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-10 — AC-4.4's revert contract written in two incompatible units (per-path vs whole-tree) | High | **Resolved** | AC-4.4 now says a red re-gate "restores the **whole working tree** (AC-5.1), never the repair's paths alone", and states the reason (the re-run post-wave command writes at paths no envelope rule ranges over). One unit, and it is AC-5.1's. Re-measured: the shipped post-wave command here is `node pdlc/workflows/build-runtime.mjs` writing `pdlc/workflows/dist/` (`.claude/pdlc.config.json`), paths no wave task owns |
| F-11 — AC-4.2's "sole writer" claim contradicted M-WG-4 | High | **Resolved** | AC-4.2 now names both writers. Verified against HEAD: per-task `commitPaths` at `pdlc/workflows/orchestrate-dev.js:14405` over `task.files`, build-output `commitPaths` at `:14417` gated on `postWaveRan && implConfig.postWavePathspecs.length > 0`. Both sit below the gate block (`:14345-14369`), so "reached only by a green gate" holds |
| F-12 — §9's drift reassurance was false | Medium | **Resolved as to the false claim, incomplete as to the gate (F-16)** | §9 now states the recipes did not survive. Re-measured: `sed -n '10301,10319p'` (M-WG-2) lands in DoD finding-table parsing, `sed -n '10334,10364p'` (M-WG-4) in a findings-return block; the wave gate lives at `:14311-14430`. The withdrawal is correct |
| F-13 — AC-3.1's three-field envelope shape was not the shipped shape | Low | **Resolved** | AC-3.1 now says the set-equality is over member **ids** alone and that action/rule are the document's presentation. Verified: `ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4"])` (`orchestrate-dev.js:1938`) — ids only |
| F-14 — AC-1.5's notice named no set | Low | **Resolved** | AC-1.5 now requires the notice to name **every** absent prerequisite, both where both are absent. Cardinality (one per run) unchanged |
| Q-05, Q-06, Q-07 | — | Q-05 answered inside AC-4.4 ("the run then ends on the wave's own gate halt, from that restored tree"). Q-06/Q-07 carried forward untouched; neither was gating and neither is re-raised |

Size discipline (C-5) re-checked at this round: 563 lines / 44,915 bytes, inside the 700 / 61,440 budget.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-15 | High | Local | **AC-4.4's new re-gate oracle is stated in a unit that cannot hold, and is falsified by a path the same criterion sanctions.** Three problems in one sentence. (a) *Unit:* it asks that the **ordered sequence** of invocations be "**set-equal** to" `[post-wave, test, post-wave, test]`. As a set that is `{post-wave, test}` — which a run that never re-gated at all also satisfies, i.e. exactly the "resolution on a single invocation" defect the sentence says it catches. Order-sensitivity is the whole point of AC-4.4's first half (build before gate), so the oracle must be sequence equality, not set equality. (b) *Enumeration:* the same AC states that "a post-wave command that fails on the re-gate is a red re-gate, handled as one". On that path the observed sequence is `[post-wave, test, post-wave]` — the test command is never reached — so the sanctioned red-post-wave re-gate is a defect under AC-4.4's own oracle, and an implementer writing the test as written reds a legitimate run. (c) *Arithmetic:* "the shipped sequence repeated once per attempt" gives `[post-wave, test]` for the one-attempt case, not the four-element literal beside it; the first pass is not an attempt (AC-2.4: an attempt is a repair→re-gate cycle). Fix: name it a sequence (prefix) equality, give the shipped sequence once per pass with passes = 1 + attempts, and state the red-post-wave re-gate's truncated sequence as an admitted form. | §6 AC-4.4 |
| F-16 | Medium | Local | **§9 asserts an obligation BL-06 does not carry, at a phase BL-06 does not name.** §9 now says "BL-06 also requires those three reissued in grep- or symbol-anchored form before FSPEC authoring". BL-06's row is about transcribed set-equality assertions — its Dependency cell never mentions baseline recipes, and its Gating logic cell reads "Must be enumerated before implementation planning", which is downstream of FSPEC authoring, not upstream of it. So the one gate the document points at for the recipes neither covers them nor fires when §9 says. This matters because AC-4.2, AC-4.4 and AC-4.6 now rest wholly on M-WG-2/M-WG-3/M-WG-4, whose recipes are the ones that no longer resolve (verified: `10301` and `10334` land nowhere near `orchestrate-dev.js:14311-14430`). Fix: either amend BL-06's Dependency and Gating-logic cells to carry the reissue at the phase §9 claims, or add a BL-07 that does, and have §9 cite that. | §8 BL-06, §9 |
| F-17 | Low | Local | **AC-4.2's closing clause states a gap in terms the preceding sentence has just made conditional.** "only the paths a *later* task owns remain the gap AC-4.6 and O-8 close" is true where post-wave pathspecs are configured; where they are not (or no post-wave command ran), the regenerated-artifact paths are also uncommitted, because the build-output writer is gated on `postWaveRan && implConfig.postWavePathspecs.length > 0` (`orchestrate-dev.js:14417`). Not gating — this repo configures both (`.claude/pdlc.config.json`) — but the sentence reads as unconditional and will be transcribed that way. | §6 AC-4.2 |

## Questions

| ID | Question |
|----|---------|
| Q-08 | AC-4.4's whole-tree restore returns the tree to its pre-A6 state, which is *after* the first-pass post-wave command ran — so the restored tree carries first-pass build outputs, not a clean dist. That is what AC-5.1 says ("immediately before A6 acted") and I read it as intended. Worth one clause confirming it, since "restores the whole working tree" invites the reading that generated artifacts return to their pre-wave state, which would itself be a change the operator did not make. |
| Q-09 | AC-2.4 caps resolutions per run; is there a separate cap on *attempts* per wave? F-15(c) only has an answer if the attempt count is bounded and known — the oracle's "once per attempt" is unwritable against an unbounded count. If the cap is one attempt per wave, saying so in AC-4.4 makes the enumeration literal rather than a formula. |

## Positive Observations

- F-10 and F-11 were both answered by picking one unit and stating why, rather than by softening the text. AC-4.4's "the re-run post-wave command writes generated outputs at paths A6 never proposed and no envelope rule ranges over" is the reason the whole-tree unit is forced, and it is stated at REQ altitude — an observable about the halted tree, not a mechanism.
- AC-4.2 is now checkable against HEAD in one pass and comes out true on both writers, including the `postWaveRan` condition on the second. The round-2 version was the load-bearing kind of wrong; this version cites the shape the code actually has.
- §9's withdrawal is the notable edit of this round: the document retracted its own reassurance ("the earlier claim that symbol-anchored recipes survived was wrong") and kept the facts it had re-verified separately from the recipes it could no longer stand behind. Distinguishing "the fact is true" from "the reader can reproduce it" is exactly the right split, and few documents make it against themselves.
- AC-3.1's correction went to the shipped surface rather than to the prose: it now says the set-equality is over ids and that the action/rule columns are presentation. That removes a claim a test would have had to invent a record shape to satisfy.
- AC-2.2's added precedence clause ("AC-2.1 is the specific rule and wins") closes an overlap I had not raised, unprompted.

## Recommendation

**Needs revision**

One High. F-15 is a single-sentence fix inside AC-4.4 — sequence rather than set, passes rather than attempts, and the truncated red-post-wave sequence admitted — but as written the criterion is satisfied by the run it means to exclude and violated by the run it means to permit, so it cannot go to FSPEC. F-16 should land with it (one cell, or one new BL row). F-17, Q-08 and Q-09 are recorded, not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
