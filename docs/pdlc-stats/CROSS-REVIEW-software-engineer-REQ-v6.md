# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 6

## 1. Delta scope — the document did not move

**Delta base:** `e33637af2` (REQ v1.4, the commit my v5 confirmation reviewed) → `HEAD`.

```
$ git diff e33637af2 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md
(empty)
$ git status --porcelain docs/pdlc-stats/REQ-pdlc-stats.md
(empty)
```

`git log --oneline -- docs/pdlc-stats/REQ-pdlc-stats.md` still terminates at `e33637af2`; the six
commits since then touch `PROPERTIES`, PM/SE cross-review files and the approval-anchor chore,
never the REQ. So there is **no revision to delta-review**: the bytes I am reading are the bytes
that carried v5's open High.

Under the delta protocol that settles the verdict arithmetic before I read a line — an open High,
old or new, means Needs revision, and this round's edit set is empty, so nothing can have closed
one. What I did instead of a diff read is re-check whether the finding was resolved *off-document*,
since F-01's stated fix was explicitly an upstream/DECISIONS call rather than a REQ edit. That
re-check is §2. It found the contradiction not merely unresolved but wider than I reported.
