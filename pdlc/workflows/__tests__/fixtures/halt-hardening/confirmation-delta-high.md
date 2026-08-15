# Cross-Review: Test Document v2

Reviewer: test-engineer
Date: 2026-08-14

## Summary

Reviewing the erratum edits made to the specification. Four of five routed items landed clearly. One item (noun transcription miss) remains incomplete.

## Findings

FINDING: High | delta | local | §3-02 | The owner cell in the expected rows table still reads "owner **tuple**" in the first occurrence. Per TSPEC §10.4 and the column types declaration, this should read "owner **frozenset[str]**". The second occurrence in the same cell ("every owner tuple non-empty", referring to the parsed-row domain check) is correct and should be left untouched. The remedy is to change one word in one location: the first "tuple" on line 136, not the second.

FINDING: Medium | delta | local | §3-02 | The description mentions three specifications but the changelog only names two. This is a scope issue rather than a correctness issue — the section handles it correctly downstream.

FINDING: Low | inherited | nonlocal | §8 | The document-order precedence note is still phrased for the pre-v1.9 form. Inherited, not introduced by this round.

## Recommendation

The erratum round successfully landed four distinct items (placeholder lifetime, three oracle extensions, coverage notation correction). The frozenset transcription miss is the only delta-introduced defect and it is one-noun in one cell. This is a localizable fix that a follow-up erratum round can address cleanly.

## Verdict

Needs revision
