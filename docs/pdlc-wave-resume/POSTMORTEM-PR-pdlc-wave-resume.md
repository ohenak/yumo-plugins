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

Both of the PLAN's recorded approvers were dispatched, and both returned non-approving verdicts.
Their findings, as parsed from the `FINDING:` lines of the v5 cross-reviews:

**pm-review** (`CROSS-REVIEW-product-manager-PLAN-v5.md`) — 3 findings, 1 High:

| # | Severity | Provenance | Locality | Anchor | Substance |
|---|---|---|---|---|---|
| F-01 | **High** | delta | **nonlocal** | §4.3 Mutation resistance / T-07 mutation duty / RK-1 / §4.5 DoD checkbox | TSPEC §5.5 at HEAD enumerates five mutations; PLAN §4.3 transcribes four. The fifth — suppress the record write while `explicitPointer` is true, killed only by AT-05's write-side conjunct — has no owning task, no oracle pairing, no execution step, no DoD checkbox. Routed into this round as v4 F-01 and left unlanded without mention in v1.2's revision history |
| F-02 | Low | delta | nonlocal | §3.4 Configuration points — `Coverage floor` row | Row cites "the erratum this dispatch raises"; TSPEC RT-7 at HEAD already assigns the floor to the last implementation task and cites PLAN T-10 / RK-2 (v3 F-01, v4 F-02, unlanded) |
| F-03 | Low | delta | nonlocal | §4.4 Risk register — RK-2 | RK-2's "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" and "the difference from TSPEC's wording is raised as an erratum" are both false against TSPEC RT-7 at HEAD (v3 F-02, v4 F-03, unlanded) |

**te-review** (`CROSS-REVIEW-test-engineer-PLAN-v5.md`) — 5 findings, 1 High:

| # | Severity | Provenance | Locality | Anchor | Substance |
|---|---|---|---|---|---|
| F-01 | **High** | **inherited** | **local** | §4.3 mutation table, T-07 mutation-duty cell, §4.5 DoD checkbox | Same defect as pm F-01: five mutations upstream, four enumerated in the PLAN (measured in five places), leaving mutation 5 with no owner, no observation duty and no DoD coverage |
| F-02 | Medium | delta | local | §2.1 T-12 task row | T-12's rationale claims `pdlc/workflows/coverage/**` "reds no oracle today". Measured: running `npm run test:coverage` — which T-10 must run for batch 4's gate — deletes tracked `coverage/tmp/*.json` and reds `PROP-SWEEP-2(a)` (clean tree → 3 reds; after the command → 4). The coverage half of T-12 **gates batch 4**, it is not tidiness |
| F-03 | Medium | inherited | nonlocal | §3.4 "Coverage floor" row; §4.4 RK-2 mitigation | Same substance as pm F-02+F-03: the PLAN still describes itself as diverging from TSPEC §5.8 and raising an erratum |
| F-04 | Medium | inherited | local | §2.1 T-10 oracle (i), §2.2 batch-4 gate, §4.5 coverage DoD line | T-10 binds `npm run test:coverage` to exit 0 unconditionally, but TSPEC §5.8's four-entry `c8.include` applies the per-file floor to an external module this feature cannot fix (measured margin today: 89.47% against an 85 floor) |
| F-05 | Low | delta | local | §4.6 parse-verification table, "Retired ids" row | The row still reads "the parser sees seven tasks"; the same table now correctly reports nine, and nine is what the parser returns |

Both reviewers grounded their rounds in measurement rather than in the document: te-review re-ran the
shipped `parsePlanTasks` / `computeTopologicalBatches` against v1.2 and ran `npm run test:coverage` in
the working tree; pm-review re-hashed the PLAN and all four upstreams and diffed the erratum edit
commit-range. Neither non-approval rests on taste.

## Pattern of Disagreement

**The reviewers do not disagree with each other. They disagree with the round's item list — and,
fatally, they tag the same defect differently.**

*1. Unanimity on substance.* Every finding in this round is held by both reviewers or is uncontested
new measurement. pm F-01 and te F-01 are the same defect, discovered independently, described in the
same terms (mutation 5, `explicitPointer`, AT-05's write-side conjunct). pm F-02+F-03 and te F-03 are
the same two stale sentences. There is no lens conflict here of the ordinary kind — no
product-versus-testing tension, no feasibility argument. That is unusual and it is diagnostic: when
both lenses converge on the identical defect for two rounds running, the failure is not in the
reviewing.

*2. The tag divergence is the whole halt.* The one true disagreement between the confirmers is
metadata, not content:

| | pm-review F-01 | te-review F-01 |
|---|---|---|
| Severity | High | High |
| Provenance | `delta` | `inherited` |
| Locality | `nonlocal` | `local` |
| Gate branch it selects | **R4 → `erratumPostmortemHalt`** | R3 → one bounded follow-up erratum round |

Both readings are defensible. te-review reads provenance against the *document*: the PLAN's
mutation-table bytes did not move in v1.2, so the defect is inherited from v4, and it lives in three
named sections of the PLAN, so it is local. pm-review reads provenance against the *round*: the item
was routed into this round (as v4 F-01), the round shipped without landing it and without recording
it in the revision history, so the omission is a property of the delta; and because the fix must also
correct count claims in §1.1, §1.2, §4.3, T-07, RK-1, RK-5 and §4.5, it is nonlocal. The gate takes
the union of findings, so pm's tagging wins and the pipeline halts.

*3. Divergent breadth, same direction.* pm-review filed three findings, all of them carried-forward;
te-review filed five, adding two fresh measured ones (F-02, F-05) that only a run against the tree
would surface, and keeping alive the coverage-floor unconditional-exit-0 Medium (F-04) that pm did
not re-file. Neither reviewer contradicts the other's extra findings — pm simply did not measure
where te measured. Nothing in this round needs adjudication.

*4. The repeat structure.* This is the signature to remember: **the same three items have now been
raised in three successive rounds by two independent reviewers and have never been contested, argued
against, deferred, or rejected — they have simply never been in an item list.** A finding that is
disagreed with generates argument; a finding that is unrouted generates silence. This round has
silence: v1.2's revision history names `CROSS-REVIEW-product-manager-PLAN-v4.md` as an input and then
accounts only for the routed items, saying nothing about v4's High at all — not landed, not absorbed,
not rejected.

## Best-Guess Root Cause

## Recommendation
