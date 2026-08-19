# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.6, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** Delta re-review. Round-3 findings F-15, F-16, F-17 and the v1.5→v1.6 diff only.
Reviewed on `feat-pdlc-advisory-wave-gate` at `6565080a`; diffed from round-3 base `afa55439`.

## Round-3 Disposition

| v3 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-15 — AC-4.4's re-gate oracle stated in a unit that cannot hold (set equality), with the red-post-wave path unenumerated and the per-attempt arithmetic wrong | High | **Resolved**, all three parts | AC-4.4 now reads "equals, **as a sequence**, the shipped sequence concatenated once per gate pass — passes = 1 + attempts, the first pass not being an attempt (AC-2.4) — each pass truncated at its first failing command", enumerates `[post-wave, test, post-wave, test]`, `[post-wave, test, post-wave]` and `[test, test]`, and states outright that set equality "collapses the duplicates and admits a resolution declared on one invocation, the defect this criterion excludes". Arithmetic re-checked against AC-2.4's attempt definition and against the shipped order (build before gate, `orchestrate-dev.js:14345-14352` comment and code): the one-attempt literal is now reachable, and the truncated form is sanctioned rather than a defect |
| F-16 — §9 said BL-06 owns reissuing the drifted recipes, but BL-06's own cells did not | Medium | **Resolved**, and widened beyond what I asked | BL-06's Dependency cell now names two enumerations and the Gating-logic cell splits the phases ("Set-equality enumeration before implementation planning; reissue and BL-03 measurement before FSPEC authoring"). The prose no longer confines the drift to the three rows AC-4.2/4.4/4.6 rest on |
| F-17 — AC-4.2's closing clause stated unconditionally what the preceding sentence had just made conditional | Low | **Resolved** | AC-4.2 now reads "Where both writers are configured — as in this repo — … otherwise those artifacts are uncommitted too and fall to O-8 alike". Re-verified at HEAD: the build-output commit is gated on `postWaveRan && implConfig.postWavePathspecs.length > 0` (`pdlc/workflows/orchestrate-dev.js:14417`) |
| Q-08 — did the restored tree carry first-pass build outputs? | — | **Answered in the text** | AC-4.4 now ends "which is the tree as it stood before A6 acted, first-pass build outputs included" |
| Q-09 — pick one unit and say why | — | **Answered** | v1.6's changelog and AC-4.4 both state the unit and the reason for it |

Size discipline (C-5) re-checked this round: 574 lines / 45,913 bytes, inside the 700 / 61,440 budget.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-18 | Medium | Local | **AC-1.5's "exactly one inapplicability notice per run" is unscoped for runs that never execute Phase I, where the count is zero and the criterion as written reds a legitimate run.** Wave mode is a Phase I property, evaluated at `pdlc/workflows/orchestrate-dev.js:14039`. Two shipped run shapes never reach it: a run halting in an earlier phase (any review-loop halt), and a run whose Phase I is skipped outright by the wave ledger — `startWave = waves.length + 1` with the "Skipping Phase I (wave ledger …)" notice, `orchestrate-dev.js:14267-14283`. In both, "wave mode is not in effect" is literally true and no inapplicability notice exists, so a set-equality oracle over the run's notice surface fails on a run that has nothing wrong with it. Fix: scope the cardinality to runs that execute Phase I ("exactly one per run that enters Phase I"), which is the population the criterion actually means. | §6 AC-1.5 |
| F-19 | Medium | Local | **AC-1.5 names two shipped carriers that are mutually exclusive at HEAD, so in the both-absent run the BL-04 carrier never emits and cannot receive the text AC-1.5 adds to it.** The two notices sit in opposite arms of one branch: BL-03's legacy notice inside `if (!waveMode) {` (`orchestrate-dev.js:14041-14045`), BL-04's script-gate notice inside that `if`'s `else` (branch opens `:14119`, `scriptGate` computed `:14143`, notice `:14149-14153`). A run lacking the manifest never evaluates `scriptGate` at all. AC-1.5 requires one notice "naming **every** absent prerequisite (both, in a run lacking manifest and script-owned gate alike)" while also saying the inapplicability is "added to" both shipped notices — the two halves are only jointly satisfiable because the carriers are exclusive, and that fact is not stated. An implementer who adds the naming to the BL-04 carrier alone ships text that is unreachable in exactly the run the parenthetical is about. Fix: one clause recording that the carriers are exclusive and that the BL-03 carrier is the sole one in a both-absent run. | §6 AC-1.5 |
| F-20 | Low | Local | **AC-4.4's "each pass truncated at its first failing command" does not say whether the failing command is included, and the two readings give different sequences.** Exclusive truncation makes the one-attempt case `[post-wave, post-wave, test]`, contradicting the literal `[post-wave, test, post-wave, test]` printed beside it. The enumerated examples do settle it — `[post-wave, test, post-wave]` for a re-gate whose post-wave command failed only parses under the inclusive reading — so this is recoverable, but it is recoverable by inference from examples rather than from the rule. One word ("truncated after its first failing command, that command included") removes the inference. | §6 AC-4.4 |
| F-21 | Low | Local | **BL-06's universal drift claim has a resolving counterexample at HEAD, so an enumeration that transcribes it as "all recipes were wrong" would itself be wrong.** The text says "every positional line-range recipe in §1–§2, the M-WG-1…M-WG-8 rows and §1's V-wave trailer sentence alike, is drifted until re-run". Re-measured: M-WG-1 `:8283`/`:10299` → `10730`/`14338`; M-WG-6 `:4585` → `5576`; M-WG-7 `:10805` → `14955`; M-WG-8's `ADVISORY_SEAMS` `:1669` → `1947` — all drifted; but M-WG-8's second citation, `grep -n 'toEqual(\["A1"' pdlc/workflows/__tests__/advisoryEnvelope.test.js` → `:317`, resolves exactly at HEAD. Read as a status claim ("treat as unverified until re-run") the sentence is fine and the reissue obligation is a superset either way; read as a fact it is false for one citation. Fix: say "unverified until re-run" rather than "drifted", or exempt the one that holds. | §9 BL-06 |

## Questions

| ID | Question |
|----|---------|
| Q-10 | AC-4.4's new sentence says a green re-gate lets the wave proceed past the gate and that "a later check on that path may still halt the wave". At HEAD the post-gate path is the per-task `commitPaths` loop, the conditional build-output commit and the ledger write (`orchestrate-dev.js:14395-14440`) — the halt it alludes to would be a commit failure. Naming the class in one parenthetical would keep a reader from hunting for a post-gate verification step that does not exist. Not gating; the sentence is a "may", not a claim about a specific mechanism. |
| Q-11 | Carried forward from round 3 (was Q-06/Q-07 lineage): does any consumer of the run report need to distinguish a wave resolved on the first attempt from one resolved after a truncated re-gate? AC-6.x records the invocation, not the pass count. Still not gating. |

## Positive Observations

- The AC-4.4 rewrite fixed the unit, the enumeration and the arithmetic in one pass and, unusually, states the rejected alternative and why it is rejected ("set equality … collapses the duplicates and admits a resolution declared on one invocation, the defect this criterion excludes"). A reader who later wonders why the criterion is written the awkward way now finds the answer in the criterion.
- AC-1.5's central existing-behaviour claim reversed direction this round — v1.5 said BL-03's case "has no equivalent today and acquires one", v1.6 says both prerequisites already emit a once-per-run notice — and the new direction is the correct one: `orchestrate-dev.js:14041-14045` emits exactly that notice, once, on the same `emit` surface BL-04's uses. A reversal that lands on the true statement is worth more than one that was never wrong, because it means the claim was actually measured rather than carried.
- BL-06 was widened past what the round-3 finding asked for: I raised three drifted rows, the document enumerated the whole of §1–§2 plus the V-wave trailer and the BL-03 measurement. Fixing the class rather than the instances is the right instinct and it is the one that keeps the baseline usable for the next feature, not just this one.
- AC-4.2's conditional now matches the shape the code actually has on both arms — configured and unconfigured — rather than describing this repo's configuration as if it were the contract.

## Recommendation

**Approved with minor changes**

No High findings. Round-3's F-15 and F-16 are resolved, F-17 with them, and the three claims this round rests on — the BL-03 notice, the two commit writers, the shipped gate order — each check out at HEAD. F-18 and F-19 are both in AC-1.5's oracle and both are one clause each; they are worth landing before FSPEC transcribes the cardinality, but neither makes the criterion mean the opposite of what it says, which is the bar F-15 failed. F-20 and F-21 are recorded, not gating.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
