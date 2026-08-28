# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.4, `20a551c7f`)
**Date:** 2026-08-28
**Iteration:** 5

**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v4.md`. Diff base `1d951e5ee`
(v1.3, what v4 reviewed) → `20a551c7f` (v1.4). The diff is 47 lines across two sites: §2 G-1's
in-scope paragraph (rewritten) and §7 O-1 (rewritten), plus the header's version and
cross-review roll. Unchanged sections already approved in earlier rounds are not re-litigated.

## Round-4 finding disposition

| v4 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-20 | High | **Resolved** | The predicate no longer admits line-leading list items, so the `.consolidation-log.md` residue is gone by construction, and the file is now excluded a second way — by file scope (`DECISIONS-*.md`), which `.consolidation-log.md` and the three `CONSOLIDATION-PROPOSAL-*.md` files fail. Both legs reproduce at HEAD: the log's four corroboration items sit at `docs/_decisions/.consolidation-log.md:275,277,279,281` under its `:271` "Corroborated, not re-promoted" heading, and all four ids (`DEC-ERRROUTE-01`, `DEC-ERRROUTE-03`, `DEC-TERM-02`, `DEC-ORACLE-06`) are heading-recorded in sibling files (`DECISIONS-erratum-routing.md`, `DECISIONS-loop-termination.md`, `DECISIONS-test-oracle-mechanics.md`) — so the "already recorded besides" clause is true, not decorative. Critically, C-5's 41 now *derives*: the strict predicate (heading marker, optional section number, then the id, `NUMBER` numeric, in `docs/_decisions/DECISIONS-*.md`) yields exactly 41 lines and 41 distinct ids at HEAD. AC-01's expected id set is now single-valued. |
| F-21 | Medium | **Resolved** | O-1 was rewritten to draw exactly the line the finding asked for: recognition detail *within* the carrier form (heading numbering, bold or backticked ids) is TSPEC's; membership is not, and "adding a carrier form — a table row, a list item — is a REQ revision, not a TSPEC choice." G-1's closing sentence states the same contract from the other side. The overlap between G-1's carrier enumeration and O-1's routing is gone. |
| F-22 | Low | **Resolved** | The superlative "the sole non-numeric token" is dropped; `DEC-AWG-Q1` is now described as "a citation twice over (prose, non-numeric)", which is true at HEAD (`DECISIONS-advisory-wave-gate-questions.md:14`, one prose occurrence) and no longer asserts a uniqueness that `DEC-LI-NN` falsifies. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-23 | High | Local | **The new "first record wins" key selects the wrong heading on the one HEAD file that exercises it — G-1's own exemplar — so AC-01's expected line for `DEC-LOOP-01` is still two different values depending on which sentence the tester transcribes.** G-1 now says the distinct id is the key and "the first record wins", citing `DEC-LOOP-01`…`06` in `docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md` as the twice-opened case that "renders once". Rendering once is right; *which* one it renders is the defect. That file opens each of the six ids twice: once under `## Options Considered` (`:232`) at `:237`–`:337`, and once under `## Decision` (`:355`) at `:363`–`:582`. The first occurrence is the option-framing heading — `### DEC-LOOP-01 — where the session's state lives` (`:237`) — which decides nothing; the decision is `### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file` (`:363`). "First wins" therefore selects `:237`. But G-1's field contract in the same paragraph requires each line to carry "a one-line statement of **what it decided**" plus "a source citation naming the record file and **the record's heading**". Applied to `:237` those two clauses cannot both be honoured: the winning record's heading is a question, and the section under it is a comparison of rejected alternatives (`A. Durable state file … rejected on semantics`, `C. Caller-echoed token … Chosen`), not a decision statement. So a test author building AC-01's set-equality fixture for a feature whose own `DECISIONS-{feature}.md` has this shape gets one expected citation from the key clause (`— where the session's state lives`) and a different one from the field clause (`: Session state travels in a caller-echoed token, not a durable file`) — the exact "two values depending on which sentence you transcribe" failure F-20 raised, relocated from the count to the content fields. This is not hypothetical: sweeping every in-scope-shaped file at HEAD, `pdlc-engineering-loop` is the **only** one with a twice-opened id (13 heading carriers, 7 distinct ids); every other feature file and all 41 project-level records are 1:1, so this file is the sole HEAD witness for the clause and it witnesses against it. The fix is one clause at REQ altitude, not a re-scope. Cheapest: make the key **last record wins** — at HEAD that selects `:363`…`:582` for all six ids, i.e. the `## Decision` blocks, satisfies the field contract, and changes nothing else (every other id is recorded once, so first and last coincide; `DEC-LOOP-07` at `:618` is single and unaffected, and `DEC-CONS-01` at `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:65` is single). Alternatively state that where a file separates options from decisions the record is the occurrence under the decision heading — but that adds a section-context notion the predicate does not otherwise carry, so "last wins" is the smaller edit. Either way the exemplar then follows from the rule instead of contradicting it. | §2 G-1; §5 REQ-DECLEDGER-01 |
| F-24 | Medium | Local | **"files in path order" is asserted as the cross-file tie-break but never defined, and nothing at HEAD exercises it — so the first fixture that does will be written against an invented ordering.** G-1 says the first record wins "files in path order", making the winner for a duplicated id a function of an ordering the REQ does not state: lexicographic byte order, locale collation, case-sensitivity, and whether the ordering is over full paths or basenames all differ in outcome (`docs/_decisions/…` vs `docs/{feature}/…` invert under byte order vs case-folded collation, since `_` is `0x5F`). Checking HEAD, the clause is currently vacuous: sweeping all 41 project-level ids against every non-`_decisions` `DECISIONS-*.md`, **zero** ids are heading-recorded in two different files, so no live corpus distinguishes any ordering. That is what keeps this Medium rather than High — AC-01's *id set* is order-invariant, and only the statement/citation fields of a collided id depend on the tie-break. But it is precisely the case a synthetic fixture must construct (a feature decision later promoted to `docs/_decisions/` is the pipeline's own promotion pattern, so collisions are expected, not exotic), and at that point the expected value is not derivable from the REQ. One clause fixes it: name the ordering, or state that the project-level record under `docs/_decisions/` wins over a feature's own copy regardless of path ordering — which is the semantically intended answer and sidesteps collation entirely. | §2 G-1 |
| F-25 | Low | Local | **"the feature's own `DECISIONS-{feature}.md`" does not pin the directory, and both live directories are populated at HEAD.** The file-scope clause names `docs/_decisions/` explicitly but leaves the feature leg as a bare filename. At HEAD feature decision records exist under both `docs/{feature}/` (in-flight) and `docs/completed/{feature}/` (shipped) — G-1's own exemplars cite the `docs/completed/` form twice. Since the feature leg is scoped to *the document under review's* feature, the intended directory is unambiguous in practice, so no expected value moves; but a fixture author laying out the two-file corpus has to infer the layout. Naming the directory the feature leg resolves against costs a few words. | §2 G-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-23: is "first wins" load-bearing for anything I have not found, or was it chosen only to make the `DEC-LOOP` file render once? If the latter, "last wins" delivers the same de-duplication and lands on the decision blocks. |
| Q-02 | F-24: when a feature decision is promoted into `docs/_decisions/` and the feature's own record survives, is the promoted project-level line the one that should render? If yes, say so directly and the path-order clause can go. |

## Positive Observations

- **C-5's 41 now derives from the rule rather than standing beside it — verified against HEAD, not taken on trust.** The strict predicate (heading marker, optional section number, id, numeric `NUMBER`, `docs/_decisions/DECISIONS-*.md`) yields exactly 41 carrier lines and 41 distinct ids. This was the whole of F-20 and it is fully closed: AC-01's set-equality oracle now has a single-valued expected id set derivable from the document alone, which is the promise AC-01 makes.
- **Restricting the carrier to headings was the right simplification.** Dropping line-leading list items removed a four-line swing on the real corpus *and* made the `.consolidation-log.md` disposition over-determined — the file now falls out on file scope before the carrier rule is even reached. Two independent reasons for the same exclusion is a robust place for a fixture to sit.
- **Every one of the round's HEAD claims reproduces exactly.** `DEC-AWG-Q1` once in prose at `DECISIONS-advisory-wave-gate-questions.md:14` with that file contributing zero heading carriers; the four log items at `:275`–`:281` under the `:271` heading, all four ids recorded in the named sibling files; `DECISIONS-pdlc-plugin-retirement.md` opening `### DEC-01` with no namespace segment; `DEC-CONS-01` at `DECISIONS-pdlc-consolidation-agent.md:65` in exactly the `## 3. DEC-CONS-01: …` section-numbered form the predicate cites. Four for four.
- **C-5's arithmetic survives the new key.** "Largest feature record (14)" still holds under distinct-id counting — `docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` is 14 unique / 14 raw — so `41 + 14 = 55` and the `maxEntries` 60 headroom are unchanged by the rewrite. A dedupe key introduced late in a document often invalidates a measurement taken before it; this one did not, and I checked rather than assumed.
- **O-1's rewrite closes the routing gap cleanly (F-21).** "Membership is *not* routed … adding a carrier form is a REQ revision, not a TSPEC choice" is a testable boundary: a TSPEC that widens the carrier set is now a spec-layer violation a reviewer can cite, not a judgement call.

## Recommendation

**Needs revision** — one High (F-23), and the revision is again one clause. G-1's key clause and
its field clause disagree on the single HEAD file that exercises the key, and the exemplar G-1
cites is that file. Changing "the first record wins" to "the last record wins" resolves it at
HEAD for all six affected ids, leaves every 1:1 record untouched, and lets the
`DEC-LOOP-01`…`06` exemplar follow from the rule — the same shape of fix that closed F-20 last
round. F-24 (name the ordering, or give the project-level record precedence) and F-25 (pin the
feature leg's directory) are non-gating and cost a clause each.

Everything else in the changed sections landed cleanly: all three round-4 findings are fully
resolved, C-5's 41 and 14 both re-derive from the new rule, and no unchanged section regressed.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
