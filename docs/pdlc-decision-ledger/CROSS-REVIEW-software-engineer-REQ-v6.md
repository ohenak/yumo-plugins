# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.6)
**Date:** 2026-08-28
**Iteration:** 6
**Scope:** delta re-review of `20a551c7f..HEAD` on the REQ (v1.5 `a0cd343bc`, v1.6 `3feee9461`),
plus the new cited substrate `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.0, which this
delta makes load-bearing for §5. Findings in `CROSS-REVIEW-software-engineer-REQ-v5.md` re-checked
against HEAD. Unchanged sections already approved are not re-litigated.

## Prior-Round Disposition

Both round-5 findings are resolved, and resolved by relocation rather than by narrowing — the
post-mortem's Recommendation 1 form (a) applied as written.

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The second `DECISIONS-*.md` in a feature directory is no longer an undecided reading. `M-2c` names it outright — `docs/completed/pdlc-headless-engine/` holds `DECISIONS-pdlc-headless-engine.md` (14) and `DECISIONS-headless-engine-obligations.md` (8, `## DEC-HE-01`…`08` at `:11,37,62,87,108,130,155,184`) — states that the eight `DEC-HE-*` ids exist nowhere else, and quantifies the divergence ("the two readings differ by 8, and only on this feature"). The floor was then re-taken under the glob reading: `M-6b` = 41 + 22 = 63, and `maxEntries` moved 60 → 70 (`REQ:168`, A-1 at `:345`). I replayed both independently against HEAD: the `pdlc-headless-engine` directory yields 22 distinct ids (14 + 8), and 41 + 22 = 63. `M-6c`'s "clears M-6b by 7" is arithmetically exact. |
| F-02 | Low | **Resolved** | The cross-file leg's absence of a HEAD instance is now recorded as measurement rather than left implicit: `M-5a` states zero ids are held as records in two files, `M-5b` draws the consequence that any precedence rule is inert at this commit, and the REQ carries it forward as **O-5**, a synthetic-fixture obligation owned by te-author (`REQ:348-354`). This is the disposition I asked for — it is a coverage gap, not a REQ defect. I re-swept all 25 files: **zero** ids appear as heading-carried records in more than one file. `M-5a` holds. |

## Baseline Replay

The delta moves the corpus facts out of §2 G-1 and into a new project-level constraints file. That
file is now the expected value behind §5, so I re-derived **every** `M-*` fact from the working
tree rather than reading them. All of them reproduce exactly:

| Fact | Claim | Replayed at HEAD |
|---|---|---|
| corpus extent | 25 tracked `DECISIONS-*.md`; 12 project-level, 13 across 12 feature dirs | **matches** (a basename glob; note the 8 `CROSS-REVIEW-*-DECISIONS-v*.md` files are *not* in it, correctly) |
| `M-1a` | 41 records, 41 distinct ids under `docs/_decisions/` | **41 / 41** |
| `M-1b` | per-file breakdown 0,1,4,2,2,7,2,12,1,1,6,3 in path order, sum 41 | **matches file-for-file** |
| `M-2b` | per-directory distinct ids, `pdlc-headless-engine` 22 … `pdlc-plugin-retirement` 0 | **matches, including the ordering** |
| `M-2c` / `M-2d` | 14 + 8 = 22; largest single file 14, largest directory 22 | **matches** |
| `M-3a` | `DECISIONS-pdlc-engineering-loop.md`: 13 records over 7 distinct ids | **13 / 7** |
| `M-3c` | `:237` opens the question, `:363` opens the outcome | **verbatim** — `### DEC-LOOP-01 — where the session's state lives` vs `### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file` |
| `M-4a` | `DECISIONS-advisory-wave-gate-questions.md` contributes 0; only `DEC-` token is prose at `:14` | **matches** — single hit, `:14`, the range shorthand |
| `M-4b` | `### DEC-01`…`### DEC-10` at `:37,45,53,61,76,84,92,100,108,116`, no namespace | **all ten line numbers exact** |
| `M-4d` | 4 records (`:261,315,362,420`) + 4 question headings (`:208,217,231,251`) + 4 back-references (`:443,493,509,526`) | **all twelve line numbers exact** |
| `M-5a` | zero cross-file duplicate ids | **zero** |
| `M-6b` / `M-6c` | 63; 70 clears it by 7 | **63; 70 − 63 = 7** |

The `Verified at` pin (`8c673a09f`) is an ancestor of HEAD, and no `DECISIONS-*.md` changed between
that commit and HEAD — the only files touched since are the Baseline, the post-mortem and the REQ.
The pin is honest at HEAD today. F-03 below is about whether it stays that way.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **AC-01 asserts set equality against an expected set the cited source does not contain.** REQ-DECLEDGER-01 now reads: "the expected set is the measured extent recorded in the Baseline (`M-1`, `M-2`, `M-3`) at that file's `Verified at` commit, and equality is asserted against those ids" (`REQ:188-191`). But the Baseline records **extents, not ids**: `M-1a` gives the number 41, `M-1b` gives per-file *counts*, `M-2b` gives per-directory *counts*. Across the whole file only **10** distinct ids are ever written down (`DEC-A6-01`, `DEC-CONS-01`, `DEC-ERRROUTE-01`, `DEC-ERRROUTE-03`, `DEC-HE-01`, `DEC-LOOP-01`, `DEC-LOOP-07`, `DEC-ORACLE-06`, `DEC-TERM-01`, `DEC-TERM-02`), and every one of them appears as an illustrative exemplar inside a prose fact, not as a member of an enumerated set. The in-scope set is 63. So "those ids" has no referent: an implementer can compute a **cardinality** check against 41/22/63 but cannot compute the set equality the criterion names. Cardinality equality is strictly weaker and passes a wrong-member/right-count set — precisely the failure class five rounds were spent on, and `M-4d` is a live example of a file where a looser reading admits four headings while excluding four real records, a count-preserving swap. This is cheap to fix and squarely inside this feature's ownership: the Baseline already declares that the REQ owns every section of it, so add an owned section enumerating the in-scope ids at the pinned commit and have AC-01 cite that id, rather than `M-1`/`M-2`/`M-3`. | §5 REQ-DECLEDGER-01 |
| F-02 | Medium | Local | **An id-only set equality is invariant under the `M-3c` key choice, so AC-01 cannot detect the defect `M-3c` exists to carry.** `M-3c` is the corpus's sole witness that the *last* record in a file is the deciding one: `DEC-LOOP-01` at `:237` opens the question, at `:363` the outcome. Under either key the **id set is identical** — `DEC-LOOP-01`…`07`, 7 ids either way — because both openings carry the same id. What differs is the rendered *statement* field. §2 promises exactly that outcome ("the statement field says what was decided rather than what was asked", `REQ:76-78`), and the v1.6 disposition routes TE F-23 to `M-3a`–`M-3d` on that basis (`REQ:26`). But AC-01 asserts equality "against those ids", a field that is provably blind to it. The criterion and the outcome §2 states are inconsistent: a TSPEC that picks first-record-wins renders a question where a decision belongs and still passes AC-01 as written. The fix is a phrase — equality should range over the rendered line's fields (id, statement, citation), which AC-01 already enumerates two sentences earlier, not over ids alone. | §5 REQ-DECLEDGER-01 vs §2 |
| F-03 | Medium | Local | **The pinned corpus is a live corpus, and this feature's own pipeline will move it before merge.** AC-01 fixes the expected set at the Baseline's `Verified at` commit. That pin is honest today — I confirmed no `DECISIONS-*.md` changed between `8c673a09f` and HEAD. But the in-scope set per §2 G-1 is "the project's closed decisions, **plus those of the feature whose document is under review**", and the feature leg is a `DECISIONS-*.md` glob over the feature directory (`M-2a`, `M-2c`). `docs/pdlc-decision-ledger/` holds no `DECISIONS` file *yet*; if this feature authors one — the pipeline authors `DECISIONS` "when warranted", and a feature that has burned a Phase R budget on a contested rule is a strong candidate — it lands in that directory and changes the in-scope set on this branch, before this REQ's own acceptance test can go green. The Baseline's change-control answer is "re-take the measurement and bump `Version`", which is right for a reference document but makes a *shipped acceptance test* carry a maintenance treadmill keyed to unrelated future decisions. REQ-level question, not oracle design: state whether AC-01's equality is asserted against the live repository or against a frozen fixture copy of the pinned corpus. The latter makes the criterion stable and is what `M-5b`'s synthetic-fixture reasoning already gestures at for O-5. | §5 REQ-DECLEDGER-01; §2 G-1 |
| F-04 | Low | Local | **The Baseline's `Cited by` field is already incomplete, which weakens its own change-control rule.** It lists "§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §7 O-1". The REQ also cites the Baseline from the fail-open path at `REQ:236` (`M-4e`, inside §5 but not under REQ-DECLEDGER-01) and from **O-5** at `REQ:348-354` (`M-5a`, `M-5c`), which did not exist when the field was written. Since the file's stated discipline is that consumers cite it at its `Version` and that content changes require a bump, the consumer list is the mechanism by which a bump gets propagated; an incomplete list silently shortens that reach. | Baseline *Cited by*; §7 O-5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-03: is this feature expected to author `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md`? If yes, the pinned set moves on this branch and F-03 needs answering before FSPEC; if the feature has decided not to author one, saying so in §7 closes F-03 at the cost of one clause. |
| Q-02 | On F-01: is the intended expected value the id set, or the per-file/per-directory counts? Both are defensible acceptance criteria, but they are different oracles with different strength, and AC-01 currently names the first while citing facts that supply only the second. |

## Positive Observations

- **The split is the right one, and it was executed rather than gestured at.** Five rounds died on
  a recognition predicate being defended inside a goal clause. v1.6 does not re-word the predicate —
  it removes it, relocates the measurements to a named commit, and hands the rule to TSPEC (O-1)
  with a constraint that keeps TSPEC honest ("a TSPEC choice that renders a set differing from
  `M-1`/`M-2`/`M-3` at the Baseline's commit fails REQ-DECLEDGER-01", `REQ:332-334`). That is the
  post-mortem's Recommendation 1(a) applied literally, and it is the structurally correct move: a
  measurement taken once is not contestable with one more counterexample, which a predicate over a
  live corpus always is.
- **The measurements survive independent replay in full.** I re-derived every `M-*` fact from the
  working tree without reading the Baseline's numbers first: 41/41 project-level, the twelve-file
  breakdown in path order, 22 for the `pdlc-headless-engine` directory, 13-records-over-7-ids for
  the engineering loop, zero cross-file duplicates, and all thirty-odd cited line numbers in
  `M-3b`, `M-4b` and `M-4d`. Not one was off by one. For a document whose whole value now rests on
  a cited substrate, that substrate being reproducible is the thing that matters most.
- **`M-3c` and `M-5b`/`M-5c` are model entries.** Each states the fact, then states the
  *consequence for a consumer* separately, and `M-5c` goes further by flagging that a path-ordering
  tie-break is not equivalent to the intended precedence and is ill-defined without naming a
  collation (byte order and case-folded collation invert on `_`). That is a real implementation
  trap named before anyone hits it — exactly what a baseline is for.
- **The prior round's two findings were routed, not absorbed.** F-02 became O-5 with an explicit
  "this is a coverage obligation, not a REQ defect" and an owner. Resisting the pull to answer a
  coverage gap by adding a rule to G-1 is the discipline that was missing in rounds 2–5.

## Recommendation

**Needs revision** — one High.

The restructure is sound and I want it to land; F-01 is not a challenge to it but a gap it opened.
By moving the expected value out of the REQ and into the Baseline, §5 became a promise about a
document that does not yet carry what the promise needs: AC-01 names set equality over ids, and the
Baseline supplies extents. That is a one-section fix inside a file this REQ already owns — enumerate
the in-scope ids at the pinned commit, and have AC-01 cite that enumeration. F-02 (id-only equality
is blind to the `M-3c` key, the very case routed there) is Medium and fixable in the same edit by
letting equality range over the rendered line rather than the id. F-03 (does the pin survive this
feature authoring its own `DECISIONS` file?) and F-04 (Baseline `Cited by` incomplete) are recorded
and non-gating.

I want to be clear that this is not a re-litigation of the clause that consumed rounds 2–5. That
clause is gone from the REQ and I am not asking for it back — F-01 is satisfiable entirely inside
the constraints file, with no recognition rule returning to §2.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
