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

## Pattern of Disagreement

**There is no disagreement.** That is the whole shape of this failure, and it is what distinguishes
it from every other POSTMORTEM in this feature.

1. **The erratum is resolved, and both approvers say so.** `FSPEC:2168` (AT-Q7c) now states the
   bound as "§6.5's frozen `{add, commit, read-branch, read-status}` ∪ every widening TSPEC has
   recorded against it under DEC-LAYER-01, which at TSPEC §9.3 is ⊕ `read-object`, ⊕ `read-remote`,
   ⊕ `read-index`", and adds the row-defence in the reviewers' own words: "a test transcribing
   §6.5's pre-widening literal is red on correct code". §6.5 itself was **not** edited — the frozen
   statement stays frozen and the widening stays a recorded TSPEC decision, which is what
   `DEC-LAYER-01` requires. The `se-review` v15 §2 explicitly re-verified the premise against
   `TSPEC:1724` and concluded "the delta resolves the routed erratum".
2. **The two approvers agree with each other.** `te-review` and `se-review` both approve, on the
   same bytes, in the same round.
3. **The disagreement is between `se-review`'s file and `se-review`'s dispatch response** — the
   file says `Approved`, the response the orchestrator scored did not carry a parseable trailer.

The secondary pattern worth recording: **seven erratum items for one defect**. `collectErrata`
unions the raw `ERRATUM:` lines from every creator, optimizer and reviewer response in the phase
without de-duplicating by subject, so one defect that four agents each noticed produced seven
near-identical routed items, a 2 KB halt message, and seven redundant instructions to an author who
had one edit to make.

## Best-Guess Root Cause

**The erratum channel's confirmation gate reads the dispatch response only, with none of the two
recovery paths the review loop has — so a lost trailer on a substantively approving review halts
the phase.**

`orchestrate-dev.js:9306-9317`:

```js
const verdicts = reviewers.map((skill, i) => parseVerdict(responses[i], skill));
const nonApproving = reviewers.filter((_, i) => !isPass(verdicts[i].verdict));
if (nonApproving.length > 0) { await erratumPostmortemHalt({ … }); }
```

`parseVerdict` (`:4136`) reverse-scans the response for a `VERDICT: ` line and, finding none,
returns `{verdict: "Needs revision", …, malformed: true}` after logging "returned no VERDICT".
The erratum gate then treats that fallback as a substantive verdict and halts. Compare the review
loop, `:5961-5977`, which on the **same** `malformed: true` signal makes a cheap Haiku
`recoverVerdict` attempt before paying for another round; and compare the cross-invocation
approval read, which uses `extractFileVerdict` (`:4631`) against the committed review **file** —
the carrier CLAUDE.md calls the parsed data contract. The erratum gate uses neither. It is the one
verdict read in the pipeline with no fallback and the only one whose failure mode is an immediate
halt.

Why the trailer was lost is secondary and not decidable from the artifacts, but the commit shape
narrows it: the `se-review` v15 file was built across five paced commits, and the last one
(`2f18dbd7`) is the one that wrote `## Findings`, `## Positive Observations`, `## Recommendation`
and `## Verdict` together. A dispatch that is terminated by the runtime's 180-second no-progress
watchdog after its final commit, or whose response is truncated before the trailer, leaves exactly
this evidence: correct, committed, approving file; empty or trailer-less response. `te-review`'s
dispatch, built over four commits with a smaller terminal write, returned its trailer and passed —
consistent with a per-dispatch transport failure rather than anything about the FSPEC.

**Contributing cause (blast radius).** Because the halt fires before `appendApprovalAnchors`, the
FSPEC's recorded approval still pins the **pre-erratum** bytes: both v14 confirmations carry
`APPROVAL-HASH: sha256:310f88a0…` / `REVIEWED-COMMIT: 99aff9bc…`, while the FSPEC at HEAD is
v11.5 (`sha256:18df4716…` at HEAD `2f18dbd7`). So a naive re-invocation will find the FSPEC
approval stale and re-open **Phase F**, discarding a converged 15-round review window over a defect
that was already fixed and confirmed. Clearing this POSTMORTEM without repairing the anchors turns
a lost trailer into a re-run of the most expensive phase in the feature.

## Recommendation

Ordered. Steps 1–3 clear the halt; step 4 is the fix that stops it recurring and should land before
the next feature runs, not after.

1. **Confirm the erratum is closed on the branch** (it is, at the time of writing — re-verify at
   whatever HEAD you resume from):
   - `FSPEC:2168` states the AT-Q7c bound as §6.5's frozen set ∪ the TSPEC §9.3 widenings, and
     FSPEC §6.5 (`:1031`) is unchanged.
   - `CROSS-REVIEW-software-engineer-FSPEC-v15.md` ⇒ `VERDICT: Approved`;
     `CROSS-REVIEW-test-engineer-FSPEC-v15.md` ⇒ `VERDICT: Approved with minor changes`.
     Both are `isPass` members; each file has exactly one `VERDICT:` line.
2. **Append the approval anchors the halt skipped**, so the confirmed approval points at the bytes
   that were confirmed. Append to the end of **both** v15 confirmation files — this is the one
   sanctioned post-verdict write, adds no second `VERDICT:` line, and is exactly what
   `appendApprovalAnchors` would have written at `:9319`:

   ```
   APPROVAL-HASH: sha256:18df4716504e48c1c3cf1124471b4ca7eb8b2e3e1847a35a1b445549e390dd13
   REVIEWED-COMMIT: 2f18dbd7349fba72f0c0e61b52fc061491d5dfb8
   ```

   Recompute both before writing if the branch has moved:
   `shasum -a 256 docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` and
   `git rev-parse HEAD`. Do **not** recompute them later — harvest copies anchors verbatim.
3. **Flip the marker with evidence.** Set `RESOLVED: yes` in this file and name, in the commit
   message, what addressed each finding: the erratum fix at `91059d41` (FSPEC v11.5), the two
   approving confirmations at v15, and the anchor append from step 2. Then re-invoke directly:
   `/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md"}`.
   Phases R and F skip on their (now current) approvals, Phase T skips, Phase D re-enters — and
   with the erratum already applied upstream, the phase raises no new `ERRATUM: FSPEC:` items, so
   the channel that halted is not re-entered. **Do not pass `forcePhases`**: forcing R or F would
   re-open windows that are converged.
4. **Close the gate asymmetry in `orchestrate-dev.js` (the durable fix).** Before halting at
   `:9309`, the erratum confirmation must exhaust the same recovery the rest of the pipeline
   already has. Smallest correct change, in this order:
   1. On `verdict.malformed`, call `recoverVerdict({reviewer, rawResult, _agent})` — the identical
      call the review loop makes at `:5962-5977`.
   2. If still malformed, read the confirmation file at `confirmPaths[i]` and score it with
      `extractFileVerdict` — the file **is** the data contract, and here it is committed before the
      gate runs.
   3. Halt only when both recoveries fail, and say which: a halt message that reads "no parseable
      verdict from `se-review` (response trailer absent; `confirmPaths[i]` unreadable/malformed)"
      is diagnosable; the current one asserts a substantive rejection that never happened.

   Two smaller follow-ons worth carrying in the same change: **de-duplicate routed erratum items**
   by (docType, normalised subject) in `collectErrata` so one defect routes once rather than seven
   times; and consider moving `appendApprovalAnchors` to run on the approving reviewers already
   scored, so a halt on one reviewer does not silently invalidate the other's approval.

This is not a specification defect and no artifact needs re-authoring. The document is correct, the
reviewers approved it, and the pipeline stopped on how it read one of those approvals.
