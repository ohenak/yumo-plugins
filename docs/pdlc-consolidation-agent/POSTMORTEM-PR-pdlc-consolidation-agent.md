# POSTMORTEM — Phase PR — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → `PLAN` → `PROPERTIES` → **POSTMORTEM-PR** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{1..4}.md` (8 files, converged); `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v17.md` (the erratum delta confirmation this halt is about) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (te-author) | 2.0 | 2026-08-09 |

RESOLVED: no

## Phase

**Phase PR — PROPERTIES authoring and cross-review. The review loop is not what failed.**
PROPERTIES converged at **v1.3** in **four** rounds, inside the `MAX_REVIEW_ROUNDS = 5` window, with
both reviewers approving and approval anchors recorded by the workflow itself
(`00c9028f`, `sha256:8c8a4024ae87d944e105e9dad771c7dc1469fa006fdbd922beb065921466e4ac`). What halted
the phase is the **erratum channel that runs after convergence** — the same structural position as
Phase P's halt (`POSTMORTEM-P`, 2026-08-06), a different mechanism.

| | |
|---|---|
| Document (converged) | `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` — v1.3, approved by `pm-review` and `se-review` at round 4 |
| Document (halted on) | `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` — **v2.2**, the upstream document Phase PR's errata were routed to |
| Branch | `feat-pdlc-consolidation-agent` |
| PROPERTIES window | rounds 1–4, closing 09:10 — 4 of 5 rounds consumed, anchors appended |
| Erratum round | REQ erratum edit `202441d0` at 09:12 (v2.1 → v2.2; three hunks, 12 insertions / 5 deletions, one file), confirmed as REQ cross-review round **17** at 09:15 (`54a46433`, se) and 09:17 (`33fbc907`, te) |
| Terminal state | orchestrator recorded the delta confirmation as **not passing** — non-approving: **`te-review`** |
| Erratum items routed | REQ AC-6.3 — "across the consumed window" contradicts FSPEC §9.5 / BR-37a, which range both conjuncts over the whole `ESCALATIONS.md`; REQ AC-3.4 — the second carrier (`CONSOLIDATION-PROPOSAL-{passId}.md`) is unreachable on the happy path, so the conjunct is satisfied vacuously |

Both items were raised by **`te-author`** while deriving PROPERTIES — the erratum channel doing exactly
what it exists for: a downstream author who finds an upstream defect files it upward instead of
quietly picking a reading in the test layer.

## Iterations

**Four review rounds on PROPERTIES, then one erratum round on REQ. Neither exhausted its budget.**

| Round | Document | Author commit(s) | Reviewers | Outcome |
|---|---|---|---|---|
| 1 | PROPERTIES v1.0 | (initial authoring) | pm, se | Needs revision |
| 2 | PROPERTIES v1.1 | `de788bca` … `05c07075` | pm (approved w/ minor), se (Needs revision) | not converged |
| 3 | PROPERTIES v1.2 | `d090ef08` … `fab33844` | pm (approved w/ minor), se (**Needs revision, 1 High**) | not converged |
| 4 | PROPERTIES v1.3 | `f0efc6a4` … `c568c4c3` | pm (**Approved**), se (**Approved**, 0 findings) | **converged**, anchors at `00c9028f` |
| erratum (REQ) | REQ v2.2 | `202441d0` | se v17 (`54a46433`), te v17 (`33fbc907`) | **halt recorded** |

Round budget: **4 of 5** consumed on PROPERTIES. Erratum budget: **1 of 1** consumed on REQ
(`MAX_ERRATUM_ROUNDS_PER_DOC = 1` per upstream doc per phase). Elapsed for the erratum round: 09:12 →
09:17, **five minutes**, one file touched.

The erratum edit itself is scope-exact: `git diff 809dd114..202441d0` over the REQ is three hunks —
the version row plus erratum note (`:15-22`), AC-3.4 (`:271-274`), AC-6.3 (`:497-499`). Nothing else in
the 681-line document moved, and no other file moved with it.

## Reviewers

**PROPERTIES (Phase PR's own document):** `pm-review`, `se-review`. Both approved at round 4;
`se-review`'s round-4 file records 0 findings.

**REQ erratum delta confirmation (where the halt lands):** `se-review` and `te-review` — REQ's own
approvers, dispatched by `erratumRound` step 4c into REQ's append-only window at round 17.

| Reviewer | File | Verdict line in the file | Counts | Anchors appended |
|---|---|---|---|---|
| `se-review` | `CROSS-REVIEW-software-engineer-REQ-v17.md:60` | `VERDICT: Approved with minor changes` | `{"high": 0, "medium": 0, "low": 2}` | **no** (workflow's `appendApprovalAnchors` never ran — the halt preempts it) |
| `te-review` | `CROSS-REVIEW-test-engineer-REQ-v17.md:130` | `VERDICT: Approved with minor changes` | `{"high": 0, "medium": 0, "low": 7}` | yes — `APPROVAL-HASH: sha256:cac4eac81935b3218ac9389538b5fe4b99415bae3daeea5a325f7af9c0c00254`, `REVIEWED-COMMIT: 54a464331c8b0ef120d27bc0ef8627833e044071` (self-appended by the reviewer) |

**Both files are approving, and both are approving under the High-only convergence bar** — one
non-fenced `VERDICT:` line each, both `Approved with minor changes`, both `high === 0`. The reviewer
the orchestrator named as non-approving, `te-review`, wrote the *more* affirmative of the two files:
it verified each item against the downstream oracle rather than against the prose (AT-A6's disjoint
arm for AC-6.3; the `AC-3.4 → AT-L1` trace row and FSPEC §5.3 for AC-3.4), and its Recommendation
answers the delta-confirmation question in terms — *"Yes, on both halves."*

## Pattern / Disagreement

**There is no reviewer disagreement to record. The disagreement is between the orchestrator's read of
a dispatch and the artifact that dispatch committed.**

- **The two confirmers agree with each other, item by item.** Both judged AC-6.3 resolved against
  BR-37a (`FSPEC:2648`) and AC-3.4 resolved against FSPEC §5.3. Where their residual findings overlap
  they reconciled them explicitly rather than filing twice: te F-59 ≡ se F-01 (AC-3.8b's cause list is
  one short of AC-3.4's), te F-60 ≡ se F-02 (downstream cautions still cite the *old* AC-6.3 wording).
  te tagged the second `Process` deliberately, se `Local`; that is a lens difference, agreed in text.
- **They agree with the author.** The erratum edit did not soften a test to fit the document — it moved
  the document to meet BR-37a, leaving AT-A6's differential arm, the strongest oracle in the advisory
  suite, untouched.
- **Nine Low findings stand between them, none gating.** Under the High-only bar (`isPassResult`:
  `high === 0` on a non-malformed parse), Lows are recorded, not gating.
- **The only conflict is channel-shaped.** The `VERDICT:` bytes committed to
  `CROSS-REVIEW-test-engineer-REQ-v17.md` say `Approved with minor changes`. The verdict the
  orchestrator attributed to the same reviewer, in the same round, says non-approving. Both cannot be
  descriptions of the same evidence, and only one of them is on the branch.

The recurring pattern worth naming — this is the **second consecutive phase halted by the erratum
channel rather than by the review loop** (`POSTMORTEM-P`, TSPEC erratum round 8, 2026-08-06; this one,
REQ erratum round 17, 2026-08-09). In Phase P the halt was substantive: te genuinely wrote
`Needs revision` with 1 High. Here it is not. The channel's cost profile is asymmetric — one
confirmation dispatch is the only thing standing between a converged phase and a halt, and it is the
one dispatch in the loop with no second reading of its own artifact.

## Best-Guess Root Cause

**Best guess, stated as such: the erratum confirmation was judged from the reviewer's *response text*,
which lacked a parseable trailer, while the reviewer's *file* — the artifact of record — carried an
approving verdict. The halt is a channel defect, not a review outcome.**

The mechanism is visible in three lines of the shipped runtime:

1. `erratumRound` step 4c reads the verdict **only** from the dispatch return value —
   `const verdicts = reviewers.map((skill, i) => parseVerdict(responses[i], skill))`
   (`pdlc/workflows/orchestrate-dev.js:9383`), then halts on
   `!isPassResult(...)` (`:9384`). No path in that function reads `confirmPaths[i]` back off disk.
2. `parseVerdict` (`:4136`) scans the response's lines in reverse for one beginning `VERDICT: `. If it
   finds none — or finds a value outside `VALID_VERDICTS` — it returns the fail-closed fallback
   `{ verdict: "Needs revision", high: 0, …, malformed: true }` (`:4137-4172`).
3. `isPassResult` (`:5270`) refuses a malformed parse **before** it ever looks at the High count:
   `return parsed.malformed !== true && parsed.high === 0`. So a missing trailer is indistinguishable
   from a High-bearing rejection, by design — "not read" is never "no findings".

Every one of those three behaviours is correct in isolation and load-bearing where the review loop
uses it. What makes this halt possible is what the erratum path *lacks*: the review loop has a
**second, file-side reading** — `extractFileVerdict` (`:4677`, used at `:6675`) — precisely so that a
verdict written to the branch survives a response that did not carry it across the invocation
boundary. The erratum confirmation has no such fallback. It is single-channel, and the channel it
trusts is the transcript, not the tree.

Consistent with that account, and checkable on the branch:

- `CROSS-REVIEW-test-engineer-REQ-v17.md` exists, is committed (`33fbc907`, 09:17), and carries exactly
  one non-fenced `VERDICT:` line, approving, with `high: 0`. Under file-side parsing it passes; under
  response-side parsing it passes **only if the response repeated the trailer**.
- `te-review` self-appended `APPROVAL-HASH` / `REVIEWED-COMMIT` to its own file — the sanctioned write
  that a reviewer performs *after* reaching a terminal approving verdict. A reviewer that had concluded
  "Needs revision" would not have appended approval anchors. The reviewer's own behaviour contradicts
  the verdict attributed to it.
- The workflow-side `appendApprovalAnchors` (`:9398`) did **not** run: `se-review`'s v17 file has no
  anchors. That is the halt's signature, not an independent defect.

Alternatives considered and judged less likely, in order:

| Candidate | Why it is less likely |
|---|---|
| te-review genuinely rejected and the file was written to say otherwise | The file's reasoning, its per-item resolutions, its Recommendation and its self-appended anchors are internally consistent and consistent with se's independent read. No text anywhere on the branch argues for rejection. |
| A High finding is hiding in the file | Zero rows are severity High; the counts JSON says `"high": 0`. Both reviewers' Lows are itemised and explicitly non-gating. |
| Round-index collision (v17 already existed, review overwrote history) | `deriveRoundWindow` is content-addressed over basenames present; v16 was the highest before this round, and both v17 files are new. Append-only history is intact. |
| Dispatch transport failure (empty response) | Possible, and it collapses into the same root cause: `parseVerdict(null)` returns the same fallback. The remedy is identical. |

The residual uncertainty is honest and narrow: the run's transcript is not on the branch, so what
`responses[1]` actually contained cannot be recovered from the repository. The defect is located at the
seam either way — **a converged phase should not halt on a signal that the tree contradicts.**

## Recommendation

**Clear the halt on evidence, then close the seam that produced it. In that order — the second is not a
precondition for the first.**

### 1. Verify, then flip the marker (operator judgment, not a mechanical step)

Two checks, both decidable from the branch at `33fbc907`:

```bash
grep -n '^VERDICT:' docs/pdlc-consolidation-agent/CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v17.md
# both must print exactly one approving line, and the counts line beneath must read "high": 0
git log --oneline 00c9028f..HEAD -- docs/pdlc-consolidation-agent/
# the erratum edit and both confirmations, nothing else
```

If both confirmations read approving with zero High — as they do at the time of writing — the delta
confirmation **passed on the record**, and the halt reflects a reading of the run, not of the work. Set
`RESOLVED: yes` in this file and commit, naming the two verdict lines as the evidence.

### 2. Repair the half-recorded approval before re-invoking

`se-review`'s v17 file has no approval anchors because the workflow's `appendApprovalAnchors` was
preempted by the halt. Append the same pair `te-review` recorded, beneath its `## Verdict` section —
`APPROVAL-HASH: sha256:cac4eac81935b3218ac9389538b5fe4b99415bae3daeea5a325f7af9c0c00254`,
`REVIEWED-COMMIT: 54a464331c8b0ef120d27bc0ef8627833e044071` — so REQ's recorded approval points at
v2.2's bytes rather than v2.1's. Without this, the next invocation may judge REQ's approval stale and
re-open Phase R over a document its approvers just re-confirmed.

### 3. Re-invoke

```
/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md"}
```

Phases R, F, T, D, P skip on recorded approvals. Phase PR re-enters, finds PROPERTIES v1.3 converged
and anchored at `00c9028f`, and should route **no** REQ erratum this time — both items are landed in
v2.2, so the condition that raised them is gone. **Phase I (Implementation) follows.** The queue row is
already back to `pending`; leave it there.

### 4. Durable fix — the finding worth carrying past this feature

Give the erratum delta confirmation the **file-side second reading the review loop already has**: when
`parseVerdict(responses[i])` returns `malformed: true`, fall back to `extractFileVerdict` over
`confirmPaths[i]` before halting, exactly as `:6675` does for cross-invocation reads. This preserves
fail-closed behaviour — an unreadable verdict in *both* channels still halts — while removing the case
this postmortem documents, where a phase halts on a transcript that the branch contradicts.

Two smaller companions, cheap and in the same area:

- **Report which channel decided.** When the erratum halt fires, state whether the verdict was read
  from the response or the file. This postmortem cost an hour of forensics that one clause would have
  answered.
- **Sweep cautions the erratum falsified** (te F-60 / se F-02, `Process`). Six lines across TSPEC
  (`:1328`, `:2382`), PLAN (`:262`, `:616`) and PROPERTIES (`:831`, `:1861`) still assert that REQ
  AC-6.3 reads "across the consumed window". The *instruction* in each is still correct; the *premise*
  is false as of v2.2. The erratum wave's downward propagation should retire cautions that cite
  corrected wording, not only consumers of corrected behaviour.

Non-gating residue to land whenever the REQ next opens: te F-58 (one qualifier in AC-3.4's
justification), te F-59 / se F-01 (`, AC-6.3` in AC-3.8b's list), F-54/F-55/F-57 in §4b, and F-56 —
the REQ is **3,704 bytes over** `check-req-size.sh`'s 61,440-byte advisory ceiling, which retiring a
spent erratum note would fix.

## Superseded Record — the 2026-08-06 stop order

This file previously held a **v1.0 record of a different event at the same phase**, kept here so the
history is not lost to the overwrite.

On **2026-08-06** the operator (Kane Ho) ordered the pipeline stopped **before Phase I**, to ship the
specification work (REQ v2.1, FSPEC v11.3, TSPEC v2.0, DECISIONS v1.1, PLAN v1.2) and no further. That
was an operator stop order, not a review failure: zero iterations ran, no reviewer was dispatched, no
PROPERTIES existed, and `RESOLVED: no` was used as the gate that held Phase PR closed. The
specification work merged as PR #39.

On **2026-08-09** the stop order was lifted and that record flipped to `RESOLVED: yes`. Phase PR then
ran for real — PROPERTIES authored and converged in four rounds — and halted on the erratum channel
described above. The two events share a file name and nothing else: the first was a deliberate gate,
this one is a defect at a seam.

`RESOLVED: no` at the top of this file now governs **the erratum halt only**. Flipping it re-opens
Phase PR under §Recommendation step 1.
