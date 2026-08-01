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

F-01 … F-06 are my round-2 findings carried forward against an unchanged document. Their full
argument, evidence and suggested fix are in
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v2.md` §2 and are not restated at length
here; the summary below is sufficient to identify each one and nothing about any of them has been
narrowed or widened. F-07 is new — it is about this round, not about the document's content.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`DOC-BYTES:` is specified to be written by a writer that runs only on the approving terminal round, so no failing round ever carries the anchor — and a failing round is the only kind whose growth AC-4 classifies.** Carried verbatim from v2 F-01. Re-verified at `2e1ccec`: the sole call site is `pdlc/workflows/orchestrate-dev.js:2009`, inside `if (gatePass)` at `pdlc/workflows/orchestrate-dev.js:2008`. Consequence unchanged: every boundary reads `no-anchor` ⇒ *unmeasurable* ⇒ AC-4.5 dispatches the full panel ⇒ AC-3.1's single-verifier path is structurally dead, and the operator is told a defect is present rather than that the mechanism does not apply. The second expression also stands: AC-4.1 reads the byte length *"when round N is opened"* and writes it *"into every cross-review file of round N"*, which do not exist at round-open. Fix remains REQ-altitude: name a writer that runs on every round regardless of verdict, and separate the read instant from the persist instant. | AC-4.1, AC-4.2, AC-4.5, §6 `DOC-BYTES:`, M-4a, §5 durability table, O-4 |
| F-02 | High | Local | **AC-1.5's operator reset has no durable window-start anchor, and `RESOLVED: yes` is a persistent, unconsumed file state — so after the first reset the absolute cap degrades to the per-invocation budget AC-1.1 was written to abolish, on every subsequent invocation.** Carried verbatim from v2 F-02. A test author still cannot derive the admitted-round set for a document that has ever been reset, which makes AC-1.1 untestable on that branch. | AC-1.1, AC-1.5(1)(2)(3), M-1d, §5 durability table, S-4 |
| F-03 | High | Local | **AC-3.2(2)/S-9 define `blocking(N)` a second, incompatible way, and require a machine-parsed findings-table grammar that N-3 says this REQ does not introduce and whose receive side is not total.** Carried verbatim from v2 F-03. The expected value of `blocking(N)` — the operand of AC-2's halt — is underivable for a verifier round, so the expected halt/no-halt outcome of a whole class of rounds cannot be derived from the document, and AC-4.7's "derivable from the branch alone" claim fails under one of the two readings. | AC-3.2(2), S-9, §5 vocabulary, AC-2.1, AC-4.7, N-3 |
| F-04 | Medium | Local | **AC-4.7's `notice` column admits exactly one of S-3 … S-6, but a crashed round raises two S-5s and one S-6 at once, with no stated precedence.** Carried verbatim from v2 F-04. O-10 obliges PROPERTIES to assert the report row for exactly that case, so this blocks a named downstream test. | AC-4.7, AC-2.4, AC-2.7, AC-4.5, S-5, S-6, O-10 |
| F-05 | Low | Local | **AC-3.5(e) announces "all five cases" and tabulates six rows**, two of which are one predicate seen from two sides; S-1 repeats the count of five. A PROPERTIES author counting from S-1 writes five tests for six rows. Carried from v2 F-05. | AC-3.5(e), S-1 |
| F-06 | Low | Local | **AC-6.4's own C-3/C-4 example cells are, by AC-6.4's rule, permanent must-not-fix defect reports against this document**, with no fenced-region or example-cell exemption stated — though `scanLines` (`pdlc/workflows/orchestrate-dev.js`) already establishes the exemption pattern. Carried from v2 F-06. | AC-6.4, AC-6.5, M-4b |
| F-07 | Medium | Process | **Round 3 was dispatched over a byte-identical document: the optimizer episode between round 2 and round 3 produced no revision at all, and the loop did not detect it.** The blob hash is unchanged across all three of `3405f2b`, `HEAD` and the working tree (§1). A zero-delta round is the strongest possible form of the non-convergence this very REQ exists to detect — AC-2's fixed-point test compares *blocking counts*, which are trivially equal here, but nothing in the loop compares the **document bytes** across rounds, so a round that changed nothing consumes budget and produces a review that cannot differ from its predecessor. Two consequences for testing. (a) The panel's round-3 verdicts carry no information: no reviewer can resolve a finding against an unchanged file, so the round is guaranteed to reproduce round 2's verdict — an unfalsifiable round. (b) This REQ's own AC-4 has the datum needed to catch it: `DOC-BYTES(N) == DOC-BYTES(N-1)` with identical content is a *zero-growth* boundary, which AC-4.2's regime table does not currently distinguish from a small legitimate revision. Recommend AC-2 (or AC-4) gain an explicit clause: a round whose document is byte-identical to the previous round's is a halt with its own reason code, not a consumed round — and that the run report say so. Filed `Process` because the immediate defect is in the orchestration that dispatched this round, and `Cross-Feature`-adjacent because the durable lesson (compare bytes, not just counts, before spending a round) belongs with the convergence mechanism wherever it lands. | AC-2.1, AC-2.5, AC-4.1, AC-4.2, §1 above |

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
