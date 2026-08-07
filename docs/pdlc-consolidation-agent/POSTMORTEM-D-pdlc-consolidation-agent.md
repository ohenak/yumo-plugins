# POSTMORTEM — Phase D — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-D** |
| Downstream | operator decision |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v15.md` (the delta confirmations at issue) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-07 |

RESOLVED: no

## Phase

**Phase D — DECISIONS. Halted in the erratum channel, not in the review loop.**

Phase D's own convergence (DECISIONS authoring + PM/TE review) is not what failed. What failed is
the **erratum round Phase D routed upstream against the FSPEC** (`orchestrate-dev.js:9235-9317`,
step 4b/4c): seven `ERRATUM: FSPEC: …` items were collected during the phase, the FSPEC's own
author applied them, the FSPEC's own approvers were dispatched to write the delta confirmation as
the next append-only round of the FSPEC window (v15), and the orchestrator judged `se-review`
non-approving:

> Phase D halted: the delta confirmation of the FSPEC erratum round did not pass — non-approving:
> [se-review].

The seven routed items are seven restatements of **one** defect, raised independently by several
dispatches over the phase:

> AT-Q7c (`FSPEC:2154`) spelled the invoking-tree seam domain's upper bound
> `{add, commit, read-branch, read-status}` and called it "its permitted set" — that is FSPEC
> §6.5's **pre-widening** literal. TSPEC §9.3 (`TSPEC:1724`) has since recorded three non-mutating
> widenings against that domain under `DEC-LAYER-01` — ⊕ `read-object`, ⊕ `read-remote`,
> ⊕ `read-index` (`TSPEC:1743-1745`) — and at least one of them, `read-index`, is observed on
> AT-Q7c's **own** `promoted` Given, through §7.1's corpus enumeration (`enumerateCorpus(_git)`,
> `TSPEC:672`, `TSPEC:1745`). A property transcribing the FSPEC row as it stood would therefore be
> **red on correct code**.

## Iterations

| # | What ran | Outcome |
|---|---|---|
| 1 | Phase D converged; the erratum collector accumulated 7 `ERRATUM: FSPEC:` items (one defect, 7 spellings) | routed |
| 2 | Step 4b — the FSPEC author applied the erratum (`91059d41`, FSPEC v11.5) | applied |
| 3 | Step 4c — `te-review` wrote `CROSS-REVIEW-test-engineer-FSPEC-v15.md` (`858b2bba`, `ee059cf1`, `41b08496`, `b2296e77`) | `VERDICT: Approved with minor changes` **on disk** |
| 4 | Step 4c — `se-review` wrote `CROSS-REVIEW-software-engineer-FSPEC-v15.md` (`54ae309b`, `9751e750`, `7c04bc73`, `be9eed8b`, `2f18dbd7`) | `VERDICT: Approved` **on disk** |
| 5 | `parseVerdict(responses[i], skill)` over the two dispatch **responses** | `se-review` ⇒ non-approving ⇒ halt |

One erratum round, one confirmation attempt. `MAX_ERRATUM_ROUNDS_PER_DOC = 1`, so there was no
second attempt to make; the bound was not what stopped the phase — the confirmation verdict read
was.

## Reviewers

| Role | Confirmation file | Verdict written to disk | Verdict the orchestrator scored |
|---|---|---|---|
| `te-review` | `CROSS-REVIEW-test-engineer-FSPEC-v15.md:176` | `VERDICT: Approved with minor changes` | pass |
| `se-review` | `CROSS-REVIEW-software-engineer-FSPEC-v15.md:176` | `VERDICT: Approved` | **Needs revision** (fallback) |

Both files are committed, both are structurally well-formed, each carries a trailing `## Verdict`
section with **exactly one** `VERDICT:` line (verified: `grep -ci "verdict:"` returns 1 for the
se file), and both values are members of `isPass` (`orchestrate-dev.js:5203`). Neither file carries
`APPROVAL-HASH` / `REVIEWED-COMMIT` — the halt fires at `:9309`, immediately **before**
`appendApprovalAnchors` at `:9319`, so the anchors were never appended.
