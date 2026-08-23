# POSTMORTEM — Phase PR (erratum protocol) — pdlc-wave-resume

RESOLVED: no

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** (erratum round, Phase PR) |
| Downstream | PROPERTIES, IMPL (both blocked by this halt) |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PLAN-v5.md`, `CROSS-REVIEW-test-engineer-PLAN-v5.md` (delta confirmations); the v3/v4 upstream-cascade rounds are cited throughout |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |
| Failure class | ERRATUM-PROTOCOL — R4 (`erratumPostmortemHalt`): a High finding tagged `delta` and `nonlocal` |
| Scribe | te-author (post-mortem scribe only; PLAN is se-author's document) |

## Phase

**Phase PR (PROPERTIES), erratum channel, PLAN erratum round.** Phase PR opened an erratum round
against `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` — an *upstream* document, already approved —
because reviewers and authors working in Phase PR emitted `ERRATUM: PLAN` lines rather than editing
someone else's artifact. se-author landed the targeted versioned edit (PLAN v1.1 → v1.2, eight commits
`6676deed..423d6802`, +54/−15), and the PLAN's own approvers — pm-review and te-review — were
dispatched for the delta confirmation.

**The delta confirmation did not pass. Non-approving: `[pm-review, te-review]`.** Both confirmers
returned findings; pm-review's F-01 is tagged `High | delta | nonlocal`, which selects R4 of the
erratum gate (`High-delta and (nonlocal or follow-up spent)` → `erratumPostmortemHalt`). No bounded
follow-up round is available on that branch, so the pipeline halts here and the feature's `QUEUE.md`
row moves to `halted`.

What is **not** wrong: the four items the round was actually opened with all landed, and both
confirmers say so explicitly. pm-review v5: the edit "lands four routed items, and lands them well."
te-review v5 re-ran the shipped parser against v1.2 and confirmed `parsePlanTasks` now returns nine
tasks and `computeTopologicalBatches` returns `[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`
— T-11 (the `A1_GLOBS` / `pdlc-retirement-baseline.md` promotion) and T-12 (untracking the
machine-local mid-pipeline files) are correctly owned, batched and gated. The halt is about the items
the round was **not** opened with.

## Iterations

Five PLAN review rounds are on disk, but only two of them are ordinary revision rounds; the rest are
consequences of the upstream moving under an approved document.

| Round | Type | Reviewers | Outcome |
|---|---|---|---|
| v1 | Ordinary round 1 | te-review only | F-01…F-10; needs revision → PLAN v1.1 |
| v2 | Ordinary round 2 (pm's first product pass) | pm-review, te-review | Approved with minor changes; anchors recorded at `88677711` / `485d62fa` |
| v3 | Upstream-cascade re-review (TSPEC v1.2 → v1.3) | pm-review, te-review | PLAN bytes unmoved; TSPEC RT-7 reassigns the coverage floor to the last implementation **task** (PLAN T-10, RK-2). pm files F-01/F-02 — the §3.4 and RK-2 rows now describe a divergence that no longer exists |
| v4 | Upstream-cascade confirmation (TSPEC v1.3 → v1.4, nine commits) | pm-review, te-review | PLAN bytes still byte-identical to the v3 approval (`sha256:5f5b50db…`). TSPEC §5.5 goes from three mutations to **five**; both confirmers file a **High** on the missing fifth (pm F-01, te F-01) and both re-file the v3 Lows (pm F-02/F-03, te F-03) |
| v5 | **Delta confirmation of the erratum edit (this round)** | pm-review, te-review | PLAN v1.2 (`sha256:3cf0229a…`). Four routed items landed; **the v4 High and the v3/v4 Lows are unlanded and unmentioned** → non-approving → halt |

Two counts matter for the recommendation:

- **Three consecutive rounds** (v3, v4, v5) have carried the same two Low findings about §3.4's
  `Coverage floor` row and §4.4's RK-2 mitigation text. They are one-line corrections.
- **Two consecutive rounds** (v4, v5) have carried the mutation-5 High, by *both* reviewers
  independently, against a PLAN whose relevant bytes did not change between them.

The lifetime-round damping term is worth noting but is not what fired: PLAN is at five rounds on
disk, well under `MAX_LIFETIME_ROUNDS = 15`, so accept-as-is never came into play. This halt is a
genuine R4, not a budget exhaustion.

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
