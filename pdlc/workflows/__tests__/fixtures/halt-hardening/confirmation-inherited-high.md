# Cross-Review: Specification v4

Reviewer: product-manager
Date: 2026-08-14

## Summary

Reviewing the re-grounding of an upstream specification after a significant dependency revision. All eight routed items landed faithfully. However, the document carries inherited staleness from sections the erratum round did not open.

## Findings

FINDING: High | inherited | nonlocal | §8.3 | The domain note in section 8.3 states that features X, Y and Z "own no row", but the same document's own section 8.3 bullet three paragraphs later explicitly withdraws that claim and names features C and W as the actual no-row owners. This contradiction is inherited — both statements were in the pre-round version. The round did not edit this section.

FINDING: High | inherited | nonlocal | §8.2 | Item 7 still instructs transcribing text from a specification version that was superseded by the round's upstream re-grounding. The phrasing describes pre-v1.6 semantics. While the round re-grounded the direct items it was asked to fix, this transcription instruction references an obsolete form.

FINDING: Medium | inherited | nonlocal | §12 | The risk assessment in section 12 cites a residual count that was accurate in the pre-round upstream but is no longer valid. The count is stated without a contingency.

FINDING: Low | inherited | nonlocal | §7.3 | Two version stamps cite upstream v1.3 where the current specification is at v1.8. These are inherited stale references in unchanged text.

## Recommendation

All eight routed items were executed faithfully and verified under independent re-derivation. The document is sound in its core specifications. The residual findings are inherited staleness in sections outside the round's declared scope — they belong in the owning phase's ordinary revision cycle, not in this erratum channel.

## Verdict

Needs revision
