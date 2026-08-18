# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.2)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** testing lens only — is each decision falsifiable, does a named oracle exist that can go
red, and can PLAN/PROPERTIES derive a contract from it. Delta re-review: v1 findings F-01…F-08
checked for resolution; only sections changed by `git diff 65a23537..HEAD` scanned for new issues
(DEC-02, DEC-03, DEC-04, DEC-06, DEC-07, DEC-08, DEC-09, new DEC-10, the Decision table's new
owning-oracle column, cross-cutting rules 1–4, Consequences, triggers 2a/2b/2c, downstream
obligations). Unchanged prose already reviewed at v1 is not re-litigated.

**Verification base:** HEAD `1053b7fd` on `feat-pdlc-plugin-retirement`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-10's block is transitively wider than the decision prices it, and three owning-oracle rows do not know they are gated.** DEC-10 gates classes 7 and 11 on erratum 3 and calls that "the narrowest possible gate"; the Consequences row prices it as "two of eleven classes". FSPEC's class table makes the gate reach further by its own ordering column: class 8 lands "at the same time as class 7", class 9 "same commit as class 7", class 10 "after class 7" (`FSPEC-pdlc-plugin-retirement.md:160`, `:161`, `:162`). Blocking class 7 therefore blocks 8, 9 and 10 as well — five classes, not two. The testing consequence is concrete: DEC-01's owning oracle is AC-1.1's `dist/` set-equality, DEC-02's is AC-5.3 + `consolidationBuild.test.js` T32, and DEC-09's is the class-9 `version`/`satisfiesRange` assertion this revision added — all three are named in the Decision table with no gate marker, yet none can go green until erratum 3 lands, because class 7 carries the bundle deletion (M-4/M-5/M-10) and class 9 must share its commit. PLAN reads this table to build dependency edges and PROPERTIES reads it to place ATs; as written, both derive an ordering that cannot pass. State the closure of the gate (7, 8, 9, 10, 11), correct the price row, and mark the DEC-01/DEC-02/DEC-09 oracle cells "gated by DEC-10". | DEC-10; Decision table rows DEC-01/DEC-02/DEC-09; Consequences row 5 |
| F-02 | High | Local | **DEC-09's new positive oracle mis-transcribes the callee's return contract, and its nearest rendering is unfalsifiable.** The decision requires class 9 to assert that `satisfiesRange(version, pdlcPluginCompat)` "returns true". The shipped function returns an object, not a boolean: `satisfiesRange` (`pdlc/engine/lib/handshake.mjs:93`) returns `{ ok: false, reason: "…" }` on every reject path and `{ ok: true, reason: null }` on accept. An implementer transcribing the decision literally writes `expect(satisfiesRange(...)).toBe(true)`, which is red by construction; the sloppier rendering, `toBeTruthy()`, passes for *every* object the function can return — including `{ok:false}` — so the assertion that exists to keep BR-VER-1's signal falsifiable cannot fail. This re-opens v1 F-03 in a new shape. Fix by naming the field and adding the negative arm that actually exercises range semantics: assert `satisfiesRange("0.23.2", pdlcPluginCompat).ok === true` **and** that a version outside the window (`0.24.0`, which `^0.23.0` excludes — upper bound computed at `handshake.mjs:113`–`:118`) returns `ok === false` with a non-null `reason`. Without the negative arm the call is a dead-config assertion wearing a function call. | DEC-09 option A; Decision table row DEC-09 |
| F-03 | Medium | Local | **"eleven classes" is a wrong pinned literal, in the one document whose rule 2 forbids exactly this.** FSPEC §3.1 enumerates **thirteen** classes (`FSPEC-pdlc-plugin-retirement.md:153`–`:165`, rows 1…13), and TSPEC states the count in words — "FSPEC §3.1's thirteen classes" (`TSPEC-pdlc-plugin-retirement.md:288`). DECISIONS says "two of eleven classes" twice (DEC-10's price paragraph and the Consequences row). Cross-cutting rule 2 requires literals to be transcribed from the owning upstream document; a count word inside a decision's own price statement should meet the bar the decision sets for implementation. Correct to thirteen, together with F-01's numerator. | DEC-10 "Price of A"; Consequences row 5 |
| F-04 | Low | Local | **DEC-10's owning-oracle cell says "not an assertion" when the gate is mechanically checkable.** The cell reads "**None yet** — the gate is a PLAN dependency edge, not an assertion". A dependency edge *is* assertable before implementation starts: PLAN's batch column must satisfy `batch == max(dep batch) + 1` over the edge set, and a reviewer re-derives it without running anything. Say so — "owned by PLAN's batch-DAG check over the class-7 predecessor edge" — so the gate has a named check rather than reading as unowned until erratum 3 arrives. | Decision table row DEC-10 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With classes 7–11 gated by DEC-10, is any deletion commit landable before erratum 3? Classes 1–6 cover CI jobs, engine-side drift coverage, the queue gate, the drift hook, the drift library and the test corpus — and class 6 is itself gated on erratum 6 by DEC-07. If the answer is "classes 1–5 only", PLAN should say it, because that is the sweep's real first wave. |
| Q-02 | Does the class-9 assertion DEC-09 requires live in a module that survives the sweep? The decision names the assertion but not its host file; `consolidationPreflight.test.js` and `consolidationRoute.test.js` are outside M-8's deletion set (`FSPEC:378`) and would qualify, but an assertion placed in a deleted module ships nothing. |
| Q-03 | DEC-08 asks class 10 to tighten `postWavePathspecs` to `toEqual(["pdlc/workflows/dist/"])`. Class 10 lands *after* class 7, which is gated — does the tightening move earlier, or does the containment-shaped assertion (`consolidationPreflight.test.js:208`) stay shipped for the whole gated period? |

## Positive Observations

- **v1 F-01 resolved cleanly, and in the right direction.** Cross-cutting rule 2 now separates the two halves that were conflated: implementation transcribes the spec's literal, a disagreement with the tree halts to an erratum, and the re-measurement is that erratum's evidence rather than the assertion's input. The added sentence distinguishing C-6's "re-measured, never loosened" (how a *spec's* literal is corrected) from how a *test* obtains its expected value is the precise cut that was missing, and the downstream-obligations paragraph hands PROPERTIES the transcription direction explicitly.
- **v1 F-04 resolved with a real oracle, not a claim.** DEC-03 now names `consolidationRoute.test.js`'s `routeOf reads the IMPORTED constant` test, and it holds on inspection: `:106`–`:112` asserts `new Set(MERGE_GUARD_DEFAULTS)` set-equals the four literal members, and the module is absent from M-8's 21-module deletion list (`FSPEC:378`), so it survives. The decision also records *why* the two nearby assertions are not the oracle (`mergeGuard.test.js`'s snapshot-of-itself, `mergeConfig.test.js`'s shape-only checks) — that note saves the next reader from adding a redundant echo, which is what DC-08 asks for.
- **v1 F-05, F-06, F-07 all resolved.** DEC-08 now cites TSPEC §6.1 erratum 5, carries it as trigger 2b, and calls for set-equality over `postWavePathspecs` — correctly identifying `consolidationPreflight.test.js:208`'s `toContain` as the weakest assertion in the config surface. DEC-06's 509 test lines are re-scoped to `pdlc-cli.mjs`'s probe transport and explicitly removed from the price, matching the module header. DEC-04 now decides `--dry-run` ships, records the 4a/4b split with the reason only one half is assertable as "removes nothing", and routes the missing criterion as trigger 2c.
- **v1 F-08 resolved and then some.** The owning-oracle column is the most useful addition in this revision: three rows honestly say **None yet**, and two of them explain *why* the absence is structural (DEC-06 has no disposition to assert; DEC-10's gate precedes the criterion). An honest "none yet" is worth more than a plausible-sounding oracle id, and it is what lets F-01 above be stated mechanically.
- **Every code citation added in v0.2 re-measures true at `1053b7fd`.** `satisfiesRange` at `handshake.mjs:93`; `OPERATOR_ONLY_SKILLS` containing `consolidate-learnings` at `startup.mjs:52`; `build-runtime.mjs`'s `OUT_DIR :32`, adapter read `:97`, `CLI_SOURCES :530`, `cliArtifact :532`, `bundles :694`, `manifestRows :773` — five emitters against five tracked `dist/` entries, so DEC-02's corrected count is right; the nine `runtime-adapter.js` cite sites distribute exactly 1/2/2/4 across `orchestrate-dev.js`, `orchestrate-queue.js`, `consolidate-learnings.js` and `pdlc/engine/lib/adapter.mjs`; `advertisedVersionViolation`'s `S_NOTHING_STAGED` early return at `document-oracles.mjs:596`; the `nudge-consolidation` SessionStart registration at `hooks/hooks.json:34`; `consolidate-learnings/SKILL.md`'s bundle reference in the lines DEC-10 quotes. DEC-09 option B's caret arithmetic also checks out against the implementation rather than intuition: `handshake.mjs:113`–`:118` computes the upper bound as `0.24.0` for `^0.23.0`, so `0.24.0` is excluded and `0.23.2` admitted.
- **DEC-10 is the right call for the right reason.** Refusing to make a capability-loss decision inside an engineering document, and naming the unfalsifiable contract option B would hand PROPERTIES ("no oracle distinguishes 'the human did the pass' from 'nobody did'"), is exactly the reasoning this lens wants to see. Rule 4 generalises it in one sentence. F-01 is about the gate's stated extent, not its existence.

## Recommendation

**Needs revision**

Two High findings, both inside content added by this revision; all eight v1 findings are resolved,
and none of the fixes broke a section that was previously sound. The remaining work is narrow:

1. **F-01** — restate DEC-10's gate as its transitive closure (classes 7, 8, 9, 10, 11, per FSPEC's
   ordering column), correct the price row, and mark the DEC-01/DEC-02/DEC-09 oracle cells as gated
   so PLAN's dependency edges and PROPERTIES' AT placement derive an ordering that can go green.
2. **F-02** — restate DEC-09's oracle against the shipped signature: assert
   `satisfiesRange(version, pdlcPluginCompat).ok === true`, and add the negative arm (`0.24.0` →
   `ok === false`, non-null `reason`) so the call exercises range semantics instead of resting on an
   object that is truthy no matter what it says.

F-03 (the "eleven classes" literal) travels with F-01's edit; F-04 is a one-cell wording change.

An upstream item is routed separately rather than folded into this verdict: TSPEC §6.4's T-5 states
the same blocked set as "classes 7 and 11", which is where DEC-10 inherited the understatement, so
the erratum is raised against TSPEC as well as fixed here.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
