# CROSS-REVIEW-test-engineer-FSPEC-v4

Scope: docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md

## Findings

### F-01 — the persisted verdict grammar, quoted verbatim

FSPEC §6.2 pins the persisted verdict record to the shape below. It is quoted here
inside a **four**-backtick wrapper, because the template's own body is a
three-backtick fenced block and a three-backtick wrapper would be closed by it:

````markdown
```markdown
## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
```
````

The wrapper above is the only correct way to quote §6.2. A scanner that treats
"the next fence line closes the block" ends the wrapper at the inner opener and
re-exposes both the heading and the `VERDICT: ` line as document content.

## Recommendation

Name the four-in-three wrapper form explicitly in §6.2, so the next reviewer does
not have to rediscover it.
