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

## 3. Why the unresolved premise still blocks, in implementation terms

Restating the impact from the build side, because "a doc contradicts a doc" undersells it.

REQ-STATS-06 (`REQ-pdlc-stats.md:193-195`) makes the survive side a *shipped-behaviour fact*:
"harvest deletes cross-reviews and DoD reviews while post-mortems survive, so the numerator is only
*partially* deleted". That sentence is the entire justification for the AC's harvested trigger being
**per-family and cross-review/DoD-only** — the predicate fires when the `CROSS-REVIEW` family or the
`CODE_REVIEW` family is absent, and deliberately does not consult post-mortems at all.

Its converse is load-bearing one AC earlier. REQ-STATS-05 (`REQ-pdlc-stats.md:182-183`) ends "no
post-mortem file is zero halts, never an error" — it has **no harvested state**, alone among the
metrics, and can only be correct if a surviving post-mortem set is complete evidence.

The two ACs consume the same premise in opposite directions, so whichever way it resolves, one is
wrong today:

- **If post-mortems survive** (SKILL:28/59/129): both ACs are correct as written and the only defect
  is a missing citation for a claim the REQ asserts bare.
- **If post-mortems are deleted** (SKILL:77, OPERATIONS:296): REQ-STATS-05 prints `0 halts` for a
  harvested feature that in fact halted, and REQ-STATS-06's "only *partially* deleted" rationale is
  false — the numerator is *wholly* deleted, which changes what the harvested token even means.

The second branch is precisely the silent undercount NG-6 (`:74`) and R-6 (`:251-253`) exist to
prevent, and REQ-STATS-03/04/06 all carry harvested states specifically to avoid. An implementer
cannot resolve this at TSPEC: they would have to pick a side of a contract question about another
skill's behaviour, and picking wrong ships a metric that lies about halts on exactly the corpus
(`docs/completed/`, per R-6) the feature is aimed at.

Because F-01's bytes predate this round and this round edited nothing, it is `inherited` — it routes
back through the REQ's ordinary revision loop rather than halting the phase, which remains the right
disposition.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | inherited | nonlocal | REQ-STATS-06's rationale asserts as shipped fact that "harvest deletes cross-reviews and DoD reviews while post-mortems survive" (`REQ-pdlc-stats.md:193-195`). Unresolved at HEAD, and the contradiction is now intra-document: `harvest-learnings/SKILL.md:10,28,59,129` scopes deletion to `CROSS-REVIEW-*` / `CODE_REVIEW-*`, while `harvest-learnings/SKILL.md:77` — the LEARNINGS metadata template that same SKILL fills — and `pdlc/OPERATIONS.md:296` both record `POSTMORTEM-*` among the files "now deleted". No `docs/_decisions/` entry settles it. The premise is load-bearing twice: it justifies REQ-STATS-06's per-family predicate, and its converse justifies REQ-STATS-05 (`:182-183`) having no harvested state. If the deleted side is correct, REQ-STATS-05 reports `0 halts` for a feature that halted — the undercount NG-6 (`:74`) and R-6 (`:251-253`) exist to prevent. Fix: settle it in `docs/_decisions/` (it binds `harvest-learnings`, not just this feature), then cite the settled source in REQ-STATS-06 and give REQ-STATS-05 a harvested state if the answer is "deleted". | REQ-STATS-06 §5 (`:193-195`); knock-on REQ-STATS-05 (`:182-183`) |
| F-02 | Low | inherited | nonlocal | Carried unchanged from v5. The v1.4 changelog note (`:20-23`) justifies the edit as stopping "a foreign-feature file" from suppressing the harvested state. That holds for `CODE_REVIEW-{feature}-v{N}.md`, which carries a feature token, but not for `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, which carries none — cross-review basenames are scoped by their feature *directory*, never by the grammar. The AC text is correct; only the note's rationale overclaims. Fix: describe the win as "a non-conforming basename can no longer read as a survivor". | Metadata block, "Erratum round 3 (v1.4)" note (`:20-23`) |

FINDING: High | inherited | nonlocal | REQ-STATS-06, §5 (:193-195) — "post-mortems survive" harvest clause | Load-bearing shipped-behaviour claim still unsettled at HEAD, and self-contradictory within one upstream file: harvest-learnings/SKILL.md:10,28,59,129 delete only CROSS-REVIEW-*/CODE_REVIEW-*, but SKILL.md:77 and pdlc/OPERATIONS.md:296 record POSTMORTEM-* as deleted; no docs/_decisions/ entry resolves it. REQ-STATS-05's absence of a harvested state depends on the survive side being true.
FINDING: Low | inherited | nonlocal | Metadata block, v1.4 erratum note (:20-23) | The note's "foreign-feature file" rationale does not hold for the cross-review family, whose grammar carries no feature token; the scoping win is over non-conforming basenames, not foreign features.

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried, still open.) Which side is authoritative on post-mortem deletion at harvest? Note that `harvest-learnings/SKILL.md` now answers both ways internally — `:28`/`:59`/`:129` say survive, `:77` says deleted — so this cannot be closed by picking a document; it wants a decision plus an edit to whichever lines lose. |
| Q-02 | (Carried, still open.) If post-mortems do survive, is REQ-STATS-05's "no post-mortem file is zero halts" right for a *harvested* feature — is a surviving post-mortem set complete evidence, or does harvest fold non-convergences into LEARNINGS §1 and drop originals? |
| Q-03 | (New.) Should this REQ's harvested-state ACs depend on `harvest-learnings`' deletion scope at all, or should they key off `LEARNINGS-{feature}.md` presence plus per-family absence *without* asserting why the families are absent? The second shape is robust to Q-01 resolving either way and would let the REQ approve before the upstream decision lands. |

## Positive Observations

- Everything I approved through v4 is still approved and still verifies. C-3/C-4's document-type
  enumerations match `CLAUDE.md:93`'s artifact convention; C-4's grammars remain faithful
  quotations of `pdlc/OPERATIONS.md:292` and `:295`; C-5's deferral targets (round derivation, the
  `CODE_REVIEW-*-v{N}` version grammar, the POSTMORTEM `RESOLVED:` lifecycle) all still exist
  upstream. Zero bytes moved, so zero regressions — I diffed the whole file to say so rather than
  assuming it.
- The v1.4 erratum edit continues to look right on re-read: REQ-STATS-04 and REQ-STATS-06 express
  the survivor predicate the same way, and REQ-STATS-06 cites C-4's grammar instead of restating a
  match rule, which is what C-5 demands.
- The one open High is genuinely not a REQ-authoring failure. The REQ compressed an upstream claim
  that turned out to be unsettled *in the upstream itself*; no amount of care at this layer would
  have produced a correct sentence. Q-03 offers a way to approve this REQ without waiting for the
  upstream decision, if the operator prefers to unblock the pipeline first.

## Recommendation

**Needs revision**

The document did not change this round, so the v5 High could not have been closed by an edit, and
the off-document resolution F-01 asked for has not landed either: there is no `docs/_decisions/`
entry on harvest deletion scope, `pdlc/OPERATIONS.md:296` is unchanged, and
`harvest-learnings/SKILL.md` still contradicts itself between `:28`/`:59`/`:129` and `:77`. The
verdict is therefore unchanged, and dispatching a seventh identical review round will not change it
either — the blocker is an upstream contract decision, not REQ wording.

Two concrete paths to Approved, either sufficient:

1. **Settle it upstream.** Add a `docs/_decisions/` entry fixing whether `harvest-learnings` deletes
   `POSTMORTEM-*`, correct whichever of `harvest-learnings/SKILL.md:77` or `:28`/`:59`/`:129` and
   `OPERATIONS.md:296` loses, then cite that entry in REQ-STATS-06 in place of the bare assertion —
   and add a harvested state to REQ-STATS-05 if the answer is "deleted".
2. **Decouple the REQ from the question** (Q-03). Rewrite REQ-STATS-06's clause so the harvested
   trigger states only the observable condition — `LEARNINGS-{feature}.md` present and at least one
   C-4 family entirely absent — and drop the "post-mortems survive" causal rationale. Then give
   REQ-STATS-05 the same treatment: report `harvested` when LEARNINGS is present and no post-mortem
   file remains, `0` otherwise. That is correct under *both* resolutions of Q-01 and needs no
   upstream change, at the cost of one extra harvested state.

F-02 remains a Low nit in a changelog sentence and gates nothing.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
