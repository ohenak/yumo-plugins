# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v6.1)
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md:10-39`). Baseline for the diff is `7ad57c9` —
the commit v5 was written against; the revision is six commits, `561dd89`…`87a6cb7`, +76/−14 lines.
Prior findings M-01, M-02 and L-01 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All three v5 findings are **resolved**, and all three v5 questions are answered in the document.
Each was checked against the revised text and, where it made a claim about this repository, against
HEAD — I re-derived every line number rather than trusting the postmortem's, as its own
Recommendation asked (`POSTMORTEM-F:265-266`).

| v5 ID | Sev | Disposition | Evidence in v6.1 |
|----|---|---|---|
| M-01 | Medium | **Resolved**, in the form the finding asked for | §8.1 gains a **per-field reader table** (`FSPEC:1126-1136`) enumerating six readers and the arm each takes on a short record, and §13.7 gains **AT-F21** (`:2028`) — the falsifier that was missing. Its Given is a constructed `.consolidation-log.md` carrying two short records (`E` missing `route`, `F` missing `target`) plus one well-formed record, and its Then is the five conjuncts I specified on **one path**: the pass reaches its terminal status and does not halt; a parse notice names each short record and its missing field; the positive downstream state (`E`'s proposal re-proposed rather than suppressed, and `E` present in AT-F19's open list); the short records' **bytes unchanged**; the well-formed record unaffected. The row states which prohibited behaviour each conjunct catches — halt on `undefined`, `route ?? "degraded"` (the direction that would close an id, re-opening the v4 H-06 hazard by another door), silent rewrite — so no conjunct is decorative. The negative half is never asserted alone. Traceability landed too: **E-12b** (`:2475`) sits beside E-12 as the sibling error row, BR-33a (`:2420`) now cites `AT-F20 (the writer half)` and `AT-F21 (the reader half)` in place of AT-F16/AT-F20, and §15.1's AC-5.1 row (`:2162`) names AT-F21 |
| M-02 | Medium | **Resolved**, and beyond what the finding asked for | I asked for a fourth AT-R6b fixture covering the (2, 3) pair. The row (`:1971`) was rewritten to **five named fixtures**, and fixtures 3, 4 and 5 range over **all three** ordered pairs the three-member order admits — (1,3), (2,3), (1,2) — one pair each, with the (1,2) pair pinned by "**no** `DECISIONS-*` file is created or appended", which is the conjunct that stops that rank being inferred from the other two. The (2,3) fixture asserts exactly the four observables I named (`target = docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route = decisions`, no guard-set write, no PR) and states in its own text why it exists: "an implementation whose rule is 'constraints wins, otherwise keep whichever proposal arrived first' is green on every other row in §13 and red only here". The row closes with the set-equality reasoning I asked for — "The three together range over **every** pair the three-member order admits … sampled at one pair, the enumeration is not covered" — and BR-33b (`:2421`) names fixture 2 for the tie-break and fixtures 3/4/5 for the pairs |
| L-01 | Low | **Resolved**, at the seam and at the call site | §6.5 now cites `parseAbbrevRef` (`:3491-3496`), "the read itself is `readHeadBranch` (`:3520`), which issues `_git(["rev-parse", "--abbrev-ref", "HEAD"])` through the seam at **`:3524`**, and the branch guard calls it at `:3580`". Verified every one at HEAD: `function parseAbbrevRef(result)` is `orchestrate-dev.js:3492` (JSDoc `:3491`), `async function readHeadBranch(git)` is `:3520`, `result = await git(["rev-parse", "--abbrev-ref", "HEAD"]);` is `:3524`, `const head = await readHeadBranch(git);` is `:3580`, `gitWithLockRetry` `:8617`, `commitPaths` `:8669`. The stale `:3585` is gone from the document |
| Q-01 | — | **Answered, as an assertion** | AT-F19's report-body conjunct is now the **literal `3`** — "the cardinality of `{B, C, D}` on this fixture — not merely as present: a report emitting a constant, or the count of every recorded id (`4` here), satisfies presence". Naming the wrong-answer literal `4` is what makes the conjunct falsifiable rather than merely stronger |
| Q-02 | — | **Answered, closed** | §6.5 gains a paragraph (`:937-941`): "**The permitted read set is the closed two-member enumeration the table spells** … a pass that needs a third read verb (`git log`, `git diff`, a `gh pr list`) is a change to this table, made here, not a reading of it", and the table cell now reads "the two **non-mutating reads**" rather than "every non-mutating read" (`:917`). A test author reading §6.5 alone reaches the closed set — which was the postmortem's own housekeeping check (`POSTMORTEM-F:324-326`) |
| Q-03 | — | **Answered** | ER-5 (`:2122`) now spells its on-landing delta in ER-2's form: "'no AT changes' is not the permanent answer … once the value grammar is vocabulary-owned, a **value-level** check over `suppressed-by:`'s two spellings becomes available to AT-L5 (or to a sibling row), and AT-Q10's literal-text conjunct becomes an assertion against §1 rather than against §10.3 alone. Values staying outside AT-L5's domain is a consequence of the erratum being open, not a non-goal." That is the distinction I asked for |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
