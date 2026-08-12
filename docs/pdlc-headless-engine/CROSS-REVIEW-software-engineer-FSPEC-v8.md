# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md (v1.7)
**Date:** 2026-08-11
**Iteration:** 8
**Scope:** Delta confirmation only — the Phase-T erratum round qualifying BR-START-1's probe ban as
*billable*. Diff reviewed: `e81f031b..HEAD` on `FSPEC-pdlc-headless-engine.md` (commit `b4f1a921`).
No re-review of previously approved sections.

## Delta under review

| Item | Where it landed | Resolves? |
|---|---|---|
| BR-START-1's "no probe of any kind ... while the ladder is running" (§4.1) literally contradicted BR-GUARD-6's rung-4a requirement to observe interpreter availability **by running** a candidate (§9.1); the intended scope was *billable* probes and the qualifier was never added when rung 4a was inserted | §4.1 BR-START-1, one clause, plus the v1.7 change note | **Yes** |

The resolution is checked on three points, since a "one-word" erratum can still under- or over-fix:

- **The qualifier matches the rule's own justification.** BR-START-1 argues from "zero tokens
  billed"; *billable* is the qualifier that makes the sentence say what the argument already
  assumed. The alternative fix — carving rung 4a out by name only — would have left the next local
  check to re-open the same contradiction. This fix generalises correctly.
- **The carve-out is bounded, not open-ended.** The added sentence limits non-probes to "local
  checks the ladder performs on the host's own bytes", and names rung 4a as the instance. It does
  not license network calls, and it explicitly restates "are not dispatches", so BR-START-1's other
  half (nothing dispatched) is not weakened by the billing qualifier.
- **Nothing downstream of the rule moved.** BR-GUARD-6 (§9.1) is byte-identical, as the change note
  claims — confirmed by the diff, which touches only the header block and the BR-START-1 paragraph.
  Rung 4a's ladder row, EC-START-10/11, AT-ENG-11a, the §14 constraint row and the §16 BR-index row
  are all unchanged, and none of them depended on the unqualified wording.

**Consistency sweep for the qualified term.** I grepped every occurrence of "probe" in the document
to check the erratum did not leave a second unqualified copy of the ban. Five hits outside the
change note: §4.1 (fixed), §6.x's containment-probe aside (line 399, a different mechanism), §6.x's
"never by issuing a probe dispatch, because a probe costs the very tokens" (line 436 — a *billable*
probe, so consistent with the narrowed reading and in fact reinforced by it), and §14's NG-2…NG-5
row (command-surface sense). No stale copy of the ban survives.

**Nothing previously approved is broken.** The rung numbering, the `--dry-run` exception, the
rung-5-on-a-dispatching-path clause and BR-START-0/2/3 are untouched. Exit codes and token claims
are unchanged in both directions.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | Carried forward from v7 (F-01), still open and still non-gating: §17.1's per-section EC index reads `§4.5 \| startup ladder \| EC-START-1…9`, but §4.5 now defines through EC-START-11. Fix: `EC-START-1…11`. Out of scope for this erratum item; noting so it is not lost. | §17.1 |
| F-02 | Low | Local | Carried forward from v7 (F-02), and now *more* visible given this erratum's subject: §15.2's stop-point row `startup ladder rung 1–4 \| plugin reads only, zero tokens` is the one remaining place that implies the ladder executes nothing locally. The v1.7 clause makes the honest cost "plugin reads and one interpreter probe, zero tokens" at `rung 1–4a`. Same fix as v7; the erratum did not have to reach here, but this row is the nearest neighbour to the corrected sentence. | §15.2 |
| F-03 | Low | Local | Carried forward from v7 (F-03) and one instance wider than reported then: the ladder chain is summarised without guard-executability in **two** places — §15.1 step 2 (line 1415) and §4's earlier prose summary (line 85, `plugin found, plugin version compatible, skill prompts readable, billing posture acceptable`). Both are consolidation drift, not contradiction. Fix: insert `guard executable` in both. | §15.1, §4 |
| F-04 | Low | Local | Carried forward from v7 (F-04), unchanged: §18.1 states the AT set as `AT-ENG-01…AT-ENG-68`, which does not cover the suffixed `AT-ENG-11a`. Renumber or acknowledge suffixed ids. | §18.1, §9.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The four carried-forward findings are all index/summary drift created by the v1.6 insertion, and two erratum rounds have now passed over them without a sweep. Should they be batched into the next FSPEC touch rather than waiting for a dedicated round? No blocking consequence — TSPEC and PROPERTIES both read §4 and §9 as normative, not §15/§17/§18 — but the drift is now two rounds old. |

## Positive Observations

- The fix corrects the *rule* rather than annotating the exception, so a future local check inherits
  the right reading without another erratum.
- The change note states what did **not** change (BR-GUARD-6 byte-identical, ECs and AT unchanged),
  which made this confirmation cheap to verify against the diff rather than by re-reading §9.
- Naming rung 4a inline in BR-START-1 while leaving BR-GUARD-6 untouched keeps the coupling
  one-directional: the ladder rule cites the guard rule, not the reverse.
- Four reviewers converged on the same item with the same intended scope, and the fix adopted that
  scope verbatim rather than negotiating a third reading.

## Recommendation

**Approved with minor changes** — the erratum item is fully resolved, the carve-out is bounded, the
qualified term is consistent across the document, and nothing previously approved is broken. All
four findings are Low-severity index/summary drift carried forward from v7; none gates the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}

APPROVAL-HASH: sha256:4dfe0b85572c696110f14512ccd8c375363d377e2986cbf8fc8b1d01cd46401b
REVIEWED-COMMIT: b4f1a921bd4321df98cd8adce0a12f1ec7c2a63e
