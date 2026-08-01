# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 3
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v2.md` (baseline `3405f2b`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `2e1ccec`, clean.

## 1. Delta scan

**The document under review is byte-identical to the one I reviewed in round 2.** This is not an
inference from a reading — it is the object identity of the blob:

```
git rev-parse 3405f2b:docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md
  → ab4d55f64a7f901f4248819aa4ad7a6e25a1ee17
git rev-parse HEAD:docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md
  → ab4d55f64a7f901f4248819aa4ad7a6e25a1ee17
git hash-object docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md   (working tree)
  → ab4d55f64a7f901f4248819aa4ad7a6e25a1ee17
```

`git diff 3405f2b HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is empty, and
the file is 116,569 bytes at both ends — the same figure my v2 trajectory note recorded. The three
commits between the two baselines (`cdb6ca3`, `a614f01`, `2e1ccec`) touch tests, the queue table and
artifact recovery; none touches the REQ.

There is therefore **no changed section to scan**, and the delta protocol's step 3 ("scan only the
changed sections for new issues") has an empty domain. Every round-2 finding is carried forward
unchanged, by construction rather than by re-argument.

One thing did change outside the document and is worth recording, because a finding cites it: the
line numbers in `pdlc/workflows/orchestrate-dev.js` moved (that file gained 217 lines between the two
baselines). I re-verified the one code claim my open Highs rest on against `2e1ccec` — see §2.

## 2. Disposition of round-2 findings

Six findings were open at the end of round 2 (3 High, 1 Medium, 2 Low). None can have been resolved,
since the bytes are unchanged. Each is re-checked below only for whether the *world outside* the
document moved under it — i.e. whether a code citation the finding rests on still holds at `2e1ccec`.

| Prior id | Severity | Disposition | Re-verification at `2e1ccec` |
|---|---|---|---|
| TE F-01 | High | **open, unchanged** | The load-bearing code fact survives the file's growth. `appendApprovalAnchors` is called from exactly one site, `pdlc/workflows/orchestrate-dev.js:2009`, still inside `if (gatePass) {` (`pdlc/workflows/orchestrate-dev.js:2008`), whose own comment still reads *"PASS branch — t4. The round is terminal"*. The declaration is at `pdlc/workflows/orchestrate-dev.js:2098`. A failing round still writes no anchor, so AC-4.1's `DOC-BYTES:` still cannot exist on the only class of round AC-4 classifies. **The AC-4.1 / §6 citations that pin this writer to `:1845` are now stale** — that was the line at the round-2 baseline; it is `:2009` at the review baseline. Re-carried below as F-01 with the corrected anchor. |
| TE F-02 | High | **open, unchanged** | Rests on the document and on the repo's stated POSTMORTEM lifecycle, neither of which moved. `RESOLVED: yes` is still a persistent, unconsumed file state and AC-1.5 still names no durable window-start datum. |
| TE F-03 | High | **open, unchanged** | Wholly internal to the document (AC-3.2(2)/S-9 vs §5's `blocking count`). Unaffected by anything outside it. |
| TE F-04 | Medium | **open, unchanged** | Wholly internal (AC-4.7's single-valued `notice` column vs the co-occurring S-5/S-5/S-6 of a crashed round). |
| TE F-05 | Low | **open, unchanged** | Internal cardinality drift, AC-3.5(e)/S-1. |
| TE F-06 | Low | **open, unchanged** | AC-6.4's own example cells. I re-confirmed the two example tokens are still the only non-C-1/C-2 citations in the file. |

Round-2 mechanical fixes MF-01 and MF-02 are unapplied and are re-carried in §4, joined by one new
mechanical item (the stale `:1845` anchors above). MR-01/MR-02 remain bound to
`docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`; MR-03 is re-carried.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
