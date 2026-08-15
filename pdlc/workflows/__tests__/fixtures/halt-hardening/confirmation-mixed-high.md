# Cross-Review: Test Document v2

Reviewer: test-engineer
Date: 2026-08-14

## Summary

Reviewing the erratum edits against the specification. The routed items landed, but the
round leaves two blocking findings of different kinds: one the edit introduced inside the
section it touched, and one that predates the round and lives outside it.

## Findings

FINDING: High | delta | local | §3-02 | The owner cell in the expected rows table still reads "owner **tuple**" in the first occurrence. Per TSPEC §10.4 and the column types declaration, this should read "owner **frozenset[str]**". The remedy is to change one word in one location.

FINDING: High | inherited | nonlocal | §8.3 | The domain note in section 8.3 describes the pre-v1.6 precedence rule. It is wrong today, but it was wrong before this round as well and no routed item asked for it. Inherited, and outside the sections this round edited.

FINDING: Low | inherited | nonlocal | §7.3 | Two version stamps still cite upstream v1.3 against a current specification at v1.8. Inherited stale references in otherwise unchanged text.

## Recommendation

The delta-introduced transcription miss is a one-word fix inside the edited cell. The
inherited precedence note is a different piece of work in a different section and belongs
to the owning phase's ordinary revision cycle. The two do not compose into a single
targeted follow-up edit.

## Verdict

Needs revision
