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

## 2. Was F-01 settled off-document? No — and the contradiction is intra-document

F-01 asked for one thing before the REQ could be touched: settle which upstream is authoritative on
whether `harvest-learnings` deletes `POSTMORTEM-*` files, ideally as a `docs/_decisions/` entry,
because the answer binds more than this feature. I checked all three places that answer could have
landed.

**No decision entry exists.** `ls docs/_decisions/` at HEAD lists fifteen files
(`DECISIONS-anchor-provenance.md`, `DECISIONS-erratum-routing.md`, `DECISIONS-review-convergence.md`,
`DECISIONS-seam-defaults.md`, … ) and none concerns harvest deletion scope. A
`grep -rn "post-mortem\|POSTMORTEM" docs/_decisions/ docs/_constraints/` filtered for
harvest/delete/survive language returns only unrelated RCV-baseline and retirement-baseline rows —
`docs/_constraints/pdlc-retirement-baseline.md:108` treats `POSTMORTEM-*` as a *retained* archive
glob, which is suggestive of the survive side but is a sweep-exclusion table, not a harvest
contract, and I will not read it as one.

**`pdlc/OPERATIONS.md:296` is unchanged.** The `LEARNINGS` bullet still defines the required
`Harvested from` row as "the record of which `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*`
files harvest deleted".

**The harvest SKILL is unchanged — and now reads as self-contradictory, which is new evidence.** In
v5 I framed this as OPERATIONS versus the SKILL. Re-reading the SKILL in full at HEAD, the
contradiction lives *inside one file*:

| Line | Text | Side |
|---|---|---|
| `harvest-learnings/SKILL.md:10` | "then remove the harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files" | survive |
| `harvest-learnings/SKILL.md:28` | "delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files in a second commit" | survive |
| `harvest-learnings/SKILL.md:59` | "Then delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files" | survive |
| `harvest-learnings/SKILL.md:129` | "All harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files deleted" | survive |
| **`harvest-learnings/SKILL.md:77`** | **`\| Harvested from \| {list of CROSS-REVIEW + CODE_REVIEW + POSTMORTEM files, now deleted} \|`** | **deleted** |

Line 77 is the LEARNINGS metadata-table template the SKILL tells its own agent to fill in, and it
says post-mortems are "now deleted" — verbatim agreement with `OPERATIONS.md:296` and flat
disagreement with the four procedural clauses in the same file. So the authoring agent is
instructed both to delete only two families and to record three as deleted. This is not a
doc-versus-doc drift that a citation could resolve; it is an unresolved contract.

**The guard hook remains no tie-breaker**, as in v5: `guard-harvest-before-delete.sh:35,43,49`
matches only the `CROSS-REVIEW`, `CODE_REVIEW` and `ADVISORY` tokens, so a `POSTMORTEM-*` deletion
is neither permitted nor blocked by it — the hook is simply blind to the family.

F-01 therefore stands exactly as filed, with its evidence strengthened rather than weakened.
