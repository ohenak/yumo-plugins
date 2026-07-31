# CROSS-REVIEW-software-engineer-TSPEC-v2

Scope: docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md

## Findings

### F-11 — the append shape is quoted here, not applied here

TSPEC §7.4 appends exactly two anchor lines to the end of each cross-review file
of an approving round. The shape, quoted:

```markdown

APPROVAL-HASH: sha256:0000000000000000000000000000000000000000000000000000000000000000
REVIEWED-COMMIT: unavailable
```

The same line also appears behind a `>` quote in running prose:

> APPROVAL-HASH: sha256:1111111111111111111111111111111111111111111111111111111111111111

Neither occurrence is this file's own anchor. This file has **no** unfenced,
unquoted `APPROVAL-HASH:` line, so §7.4's idempotence pre-count over it must be
**zero** and the append must proceed normally.

## Recommendation

Keep the pre-count fenced-region-aware; without it this very review lands on the
"one present, unequal" branch and the round it approves earns nothing.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
