# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 3
**Round type:** Upstream-cascade confirmation (PLAN bytes unchanged; upstream TSPEC edited after approval)

## Overview

**The one question.** PLAN was approved at round v2 (`CROSS-REVIEW-test-engineer-PLAN-v2.md`,
`Approved with minor changes`, anchors recorded at `88677711`). Its own bytes have not moved since:
the PLAN blob at that approval commit and at HEAD are both `4df3434e`. What moved is TSPEC, which
took a round-4 erratum edit. So the question is narrow and singular — **is PLAN still a faithful
compression of TSPEC as TSPEC now stands?** Not "is PLAN good", which round v2 already answered, and
not "did the routed items land", which is necessary but not sufficient (DEC-ERR-03).

**What the upstream edit did.** Three commits (`91f93b8e`, `6ac1df9f`, `5d5bbd75`), +9/−4 lines,
touching exactly three places in TSPEC: the version cell (1.2 → 1.3), a new revision-history row,
§5.8's coverage-floor assignment, and the RT-7 mitigation cell of §6.4. The substance in one
sentence: the 85% per-file branch floor is **re-assigned from "the last implementation wave's
`postWaveCommand`" to "the last implementation task (PLAN T-10, RK-2)"**, on the reasoning that
V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a
per-wave-scoped setting is not expressible and a global one would run `test:coverage` after every
wave. Threshold, backstop and the floor itself are unchanged.

**The shape of the answer.** This erratum moved TSPEC *toward* PLAN, not away from it. PLAN had
already refused the `postWaveCommand` framing, assigned the floor to T-10, and raised the divergence
as an erratum in RK-2 and §3.4 — the erratum this very round landed. So every **obligation** PLAN
carries is now exactly what TSPEC asks for; the mechanism, the runner, the threshold and the
reporting requirement all agree. Nothing in the task table, the batch DAG, the ownership manifest,
the AT mapping, the oracle rules or the DoD is disturbed.

What *is* disturbed is narrower and entirely descriptive: PLAN's §3.4 and RK-2 still describe TSPEC
as asking for the `postWaveCommand` framing and still describe the erratum as one *this dispatch
raises*. Both sentences were true when written and are false against TSPEC v1.3. They are
rationale prose in a hand-off position, not gate text, and correcting them changes no test, no
oracle and no batch — so they are recorded at Medium, not High, per the demotion bar in
`docs/_decisions/DECISIONS-review-severity-bars.md` (DEC-ERR-01: a false statement about upstream
confined to a hand-off/rationale section is demoted, not gating).

**Scope of this round.** Delta-confirmation only. I re-read my own v2 cross-review, the full diff of
the upstream edit, TSPEC §5.8 and §6.4 at HEAD, and every PLAN section that leans on them (§3.4,
§4.4/RK-2, T-10's task row, §4.5/§4.5.1's DoD checkboxes). I did not re-litigate the three v2
findings F-11/F-12/F-13, which were non-gating Mediums and Lows left to the author's judgement, and
I did not re-derive conclusions that rest only on PLAN bytes that have not changed.

## Batches

The cascade question, asked task by task. PLAN's batch structure is untouched by this edit — I am
checking whether any **task's stated obligation** now diverges from what upstream asks for.

| Task | Batch | Does TSPEC v1.3 change what this task owes? | Verdict |
|---|---|---|---|
| T-01 | 1 | Pre-flight gate: baseline exports, tracked baseline doc, `package.json` carrying `test:coverage`/`c8`/`fast-check`, and the `implementation.testCommand` string-equality arm. TSPEC §5.8 v1.3 still presumes `npm run test:coverage` exists in `pdlc/workflows` — T-01's existence check is the thing that proves it before T-10 relies on it. Strengthened, not disturbed. | Holds |
| T-02 | 2 | `classifyWaveLedger` extraction. Untouched by the edit. | Holds |
| T-03 | 2 | `.gitignore` / `WAVE_STATE_PATH` / baseline-mechanism arms. Untouched. | Holds |
| T-04 | 2 | Untouched. | Holds |
| T-07 | 3 | Harness extensions, assertion updates, integration cases, announcement suffixes, report-row branch, four mutation runs. TSPEC's edit does not touch §2.4, §5.3 or §5.7. Untouched. | Holds |
| T-08 | 3 | Generative suite, `numRuns: 500`. RT-7's backstop sentence still names "the generative suite of §5.7" as the degradation path — unchanged in substance, and T-08 is what makes that backstop real. | Holds |
| T-10 | 4 | **The task the erratum lands on.** TSPEC v1.3 now asks that the floor be closed by "the last implementation task (PLAN T-10, RK-2), which runs it explicitly and reports the measured per-file branch number". T-10's row already says exactly that: run `npm run test:coverage` from `pdlc/workflows` (`--per-file --branches 85`), oracle (i) "exits 0, with the measured per-file branch number for `orchestrate-dev.js` reported". Word for word what upstream now asks. | Holds — and is now *ratified* rather than divergent |

**T-10 is the interesting row and it gets stronger, not weaker.** Before this edit, T-10's design was
a deliberate departure from TSPEC, defended in RK-2 and flagged as an erratum. After it, T-10's
design *is* the TSPEC. That is the best possible outcome for a cascade confirmation: the downstream
document did not need to move because upstream moved to meet it.

Two things I checked specifically, because "the item landed" is not the same as "the compression is
faithful":

1. **Does TSPEC now demand anything of T-10 that T-10 does not carry?** The new §5.8 adds one
   reporting obligation beyond the exit code — "reports the measured per-file branch number". T-10's
   oracle (i) carries it verbatim, and §4.5's DoD checkbox at line 412 repeats the `exits 0`
   conjunct. The per-file *number* is reported by T-10's own oracle text rather than being a
   separate DoD checkbox, which is sufficient: the DoD's line 412 checkbox and T-10's oracle are
   both binding, and neither is absence-shaped.
2. **Does TSPEC now forbid something PLAN still does?** §5.8 v1.3 says the floor is "deliberately
   **not** `implementation.postWaveCommand`". PLAN §3.4 sets `implementation.postWaveCommand` to
   `node pdlc/workflows/build-runtime.mjs` — a *different* purpose (RT-5, stale `dist/`), not the
   coverage floor. No conflict: the key is used, but not for the floor, which is precisely the
   distinction TSPEC v1.3 draws. PLAN's §3.4 already carries a separate `Coverage floor` row saying
   `**T-10**, not postWaveCommand`, so the two uses are held apart explicitly.

**Batch-DAG re-derivation is not re-run this round, by design.** The batch column is a pure function
of PLAN's declared dependency edges, and PLAN's bytes are byte-identical to the blob I parsed and
approved at v2 (`4df3434e` at both `88677711` and HEAD). A mechanical check whose inputs have not
changed cannot produce a different answer; re-running it would be theatre. The v2 result stands:
seven tasks, batches `1, 2, 2, 2, 3, 3, 4`, no desync, no cycle, no same-batch same-new-file
collision.

## Dependencies

_(pending)_

## Verification

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
