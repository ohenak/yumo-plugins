# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.6, 2026-08-18)
**Date:** 2026-08-17
**Iteration:** 8
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-FSPEC-v7.md`. Delta scanned with
`git diff b6f0516b..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(20 insertions, 4 deletions) in one commit, `9f2e5107` ("accept TSPEC erratum 9 into FSPEC v0.6").
Three hunks: the header version row (`0.5` → `0.6`), BR-SWEEP-6 (:283–290), AT-1.3 (:619–624) and
the new §7.3 "Downstream errata — accepted" (:829–838). Unchanged sections already approved were
not re-litigated.

## Resolution of round-7 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (Medium) — AT-5.2 clause 2 / E-21 say the eight exempt collections are compared "by presence and shape" where REQ AC-5.2 says "by presence, not content", and `loop` legitimately differs between runs | **Not addressed** | Delta touches neither §6.5 nor §5's E-21. Text at :781 and :581 is byte-identical to the v7-reviewed bytes. Carried forward as F-03 below, still non-gating. |
| F-02 (Low) — header Cross-Reviews field stops at v4 | **Not addressed** | :11 still enumerates SE v1/v3/v4 and TE v1–v4; TE v5, v6, v7 and SE v5/v7 exist on disk. Carried forward as F-04, still non-gating. |

Neither was gating in round 7 and neither is gating now. The blocking findings below are new and
arise from the delta itself.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The narrowed AT-1.3 is still unsatisfiable at HEAD, and the delta's own new clause is what makes it so: `guardMatrix.test.js` survives the sweep and holds pending rows by design.** The delta adds "a bare `it.skip` or unregistered pending marker still fails" (:288–289, :621–623, and the §7.3 row at :838) while keeping the clause **repo-wide**. At HEAD `pdlc/workflows/__tests__/guardMatrix.test.js:325` registers `it.skip.each(NON_BESPOKE_BLOCK)` and `:334` selects `it.skip` for every non-live bespoke row; the module header at `:22–31` states this is deliberate and pending an unrelated guard rewrite ("Restore the pending rows to `it`/`it.each` in lockstep with the guard rewrite"). `guardMatrix` is **not** in M-8's 21 deleted modules (FSPEC L-5, :374–378) nor in M-11p, so it survives the sweep with its pending rows intact. `helpers/skipSink.js:17–21` names exactly this case as out of the comparator's domain ("the 70 `it.skip.each` rows in `guardMatrix.test.js` … never reach the sink"). As written, AT-1.3 can therefore never be green post-sweep on **any** runner, root or not — which is the same class of defect erratum 9 set out to fix, re-created one level down. Fix: scope the bare-`it.skip` half to the swept surface (M-8's modules and their re-homing hosts) or exempt suites that carry a declared pending block, and say which. | §4.4 BR-SWEEP-6 :283–290; §6.1 AT-1.3 :619–624; §7.3 :838 |
| F-02 | High | Local | **The exemption boundary is `SKIP_INVENTORY` membership, but HEAD's mechanism and the TSPEC's own oracle both draw it at the sink's *records*; a surviving module already registers off-inventory skips.** The delta exempts only "a skip registered through `itOrSkip` with a `SKIP_INVENTORY` entry declaring its capability gap" (:284–287, :621–623). `helpers/skipSink.js:38–47` documents the opposite by design: closure ("every registered skip is a member of the inventory") is **deliberately not enforced**, because several suites legitimately gate fixtures on `uid-nonroot` with their own invariant strings; `driftHelpers.test.js:134` pins that an off-inventory record yields zero violations. That is not confined to deleted modules: `documentOracles.test.js` — a survivor, absent from L-5's 22 — registers `itOrSkip("a well-formed manifest naming an UNREADABLE packaged file reaches the backstop: 6.2(a), not a throw", "uid-nonroot", …)` at `:572` and `itOrSkip("every fixture-inventory file is git-tracked, not merely present on disk", "git", …)` at `:340`; neither title appears in `SKIP_INVENTORY` (`helpers/driftCapabilities.js:93–123`, ten entries, all `uid-nonroot`). On a root runner the first of those skips and AT-1.3 fails on a correct, declared skip. TSPEC §5.5 already defines the operative join with the right set as "**the sink's records** for the same run, keyed by `name`, after `validateSkipRecords` returns zero violations" — i.e. all registered skips, not inventory members — so the FSPEC text is strictly stricter than the downstream oracle that implements it and than HEAD's mechanism. Since the FSPEC binds, an implementer following it either reds a green suite or widens `SKIP_INVENTORY` past its spec-derived contents, which `skipSink.js:44–47` calls a spec change. Fix: word the exemption as "absent from the skip sink's **records for that run**" and let `validateSkipRecords`' C1–C3 carry inventory agreement. | §4.4 BR-SWEEP-6 :283–290; §6.1 AT-1.3 :619–624 |
| F-03 | Medium | Local | **Carried from v7, unchanged:** AT-5.2 clause 2 (:781) and E-21 (:581) compare the eight exempt collections "by presence and shape", where REQ AC-5.2 (`REQ-…:475–476`) says "by presence, not content", and `loop` legitimately differs between a `/loop`-driven and a non-loop run (`pdlc/engine/__tests__/report-engine.test.js:78`, `:168–169`). Either drop "and shape" or define the JSON kind admitted. | §6.5 AT-5.2 clause 2; §5 E-21 |
| F-04 | Low | Process | **Carried from v7, unchanged:** the header's Cross-Reviews field (:11) stops at v4 and omits TE FSPEC v5–v7 and SE FSPEC v5/v7, all present under `docs/pdlc-plugin-retirement/`. Provenance trail is incomplete for a later reader. | Header table, :11 |

FINDING: High | delta | local | §6.1 AT-1.3 / §4.4 BR-SWEEP-6 | repo-wide bare-`it.skip` clause is falsified by surviving `guardMatrix.test.js:325`/`:334` pending rows; AT-1.3 cannot be green post-sweep
FINDING: High | delta | local | §6.1 AT-1.3 / §4.4 BR-SWEEP-6 | exemption keyed to `SKIP_INVENTORY` membership contradicts `skipSink.js:38–47` non-closure and TSPEC §5.5's sink-records join; `documentOracles.test.js:572`/`:340` are off-inventory registered skips in a survivor

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3–v7, still open at TSPEC level, recorded not re-raised: AT-3.3's consolidation-nudge entry does not name the stale-LEARNINGS count at which the nudge fires. `pdlc/hooks/scripts/nudge-consolidation.sh:25` sets `THRESHOLD=5` and `:81` gates on `n >= THRESHOLD`, so a four-file fixture yields silence and an absence-shaped false green. Fixture construction is the TSPEC's lens; flagged so it is not lost. |
| Q-02 | Does the sweep intend to leave `guardMatrix.test.js`'s pending block untouched? If yes, F-01's fix is a scoping sentence; if the block is expected to be flipped live by the guard rewrite before this sweep lands, AT-1.3 acquires an unstated dependency on another feature and should say so. |

## Positive Observations

- **§7.3 is the right instrument, and the acceptance is recorded where a reader will find it.** The row states what was raised, what edit was made here, and why REQ AC-1.3 needs no matching edit — and that last claim checks out: `REQ-…:325–330` scopes AC-1.3 to "no skipped test belonging to M-8" and is silent on registered skips, so the FSPEC narrowing does not contradict its upstream.
- **The erratum's premise is true at HEAD.** `SKIP_INVENTORY` does already carry `uid-nonroot` entries (`helpers/driftCapabilities.js:94–121`, ten of them), so the pre-delta "no skipped or pending test at all" was indeed already false on a root runner. The delta identified a real defect; the disagreement below is only over where the new boundary was drawn.
- **`itOrSkip` / `SKIP_INVENTORY` / `skipSink.js` are all real at HEAD and cited accurately** (`driftCapabilities.js:324`, `:93`; `skipSink.js`), so the mechanism the FSPEC now leans on exists and needs no new infrastructure.

## Recommendation

**Needs revision**

Two High findings. Both sit inside the text this delta wrote, and both are contradictions with the
repository at HEAD rather than matters of preference: `guardMatrix.test.js:325`/`:334` survive the
sweep carrying pending rows the new bare-`it.skip` clause forbids (F-01), and the exemption is
keyed to `SKIP_INVENTORY` membership where `skipSink.js:38–47` and TSPEC §5.5 both key it to the
sink's records, with `documentOracles.test.js:572`/`:340` already off-inventory in a surviving
module (F-02). Left as written, AT-1.3 is a gate no post-sweep run can pass, which converts the
suite's own green into an unreachable target. Both are one-sentence edits: scope the bare-skip half
to the swept surface, and word the exemption as "absent from the skip sink's records for that run".
F-03 and F-04 are carried, non-gating, and cheap to fold into the same edit.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
