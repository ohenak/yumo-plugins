# Cross-Review: test-engineer — TSPEC (delta, round 13)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 13
**Scope:** Local — delta re-review of v2.3 only (`dd1f9c9f..HEAD`, TSPEC commits
`f1cba3a0`…`58ece0eb`). v12 was *Approved with minor changes*; this round verifies the three v12
findings, re-measures every new claim against HEAD, and asks of the new mechanism only the one
question this lens owes: can the oracles it mints actually be written and can they fail?

## 1. v12 findings — status

| v12 | Subject | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (Med) | §5.1's probe comment claimed the adapter and the double "agree exactly" where §11.6 says the `file_missing` *reason* has a wider producer in production | **Resolved** | The comment now reads "agree on the STATE but NOT on its provenance", cites `runtime-adapter.js:830` and `seams.js:292-306` by side, and routes the consequence to §11.6 (TSPEC §5.1). The scope is now the state alone, which is what the layer reads |
| F-02 (Low) | §11.4's `parseMarker` generator drew "leading/trailing junk" as a near-miss while §7.3 had not decided whether whitespace is junk — a property that reds on a conforming trimming implementation | **Resolved, and decided the right way round** | §7.3 gains *"Surrounding whitespace is tolerated; interior structure is not"* and pins the boundary to the same `.trim()` the `file_empty` probe already uses (`__tests__/helpers/seams.js:298`); §11.4's row moves whitespace **into the well-formed arm** and re-states the iff as "once trimmed". The near-miss arm keeps interior padding and a second line, so the property still falsifies an accept-everything parser |
| F-03 (Low) | `_now` cited as a "module-level default" at the stale `orchestrate-dev.js:1396` | **Resolved, and swept wider than the finding** | `_now = () => Date.now()` is a destructured options default at `orchestrate-dev.js:1623`, `:3182`, `:8417` — confirmed. The term is reconciled at all four sites (§5.1's protocol comment, §5.5's seam-default row, §5.6(b), §12.2's `rtConsInjections()` exclusion), and "module-level default" survives only in §5.6(b)'s narration of the error. T-13's clock pin is unaffected |

## 2. What changed, re-measured against HEAD

v2.3 is not bookkeeping: it absorbs REQ §3.1 step 1's two corpus rules, which changes the
enumeration. Every claim it makes was re-measured, the git claims on a scratch repository built to
the document's own description.

| # | v2.3 claim | Verification | Result |
|---|---|---|---|
| 1 | REQ §3.1 step 1 decides both classes, and withdrew "one enumeration as well as one predicate" | `REQ-…` §3.1 step 1: *"The second half is not deliverable and is **withdrawn**"*; *"A `.gitignore`d LEARNINGS file **is** corpus … does **not** apply `--exclude-standard`"*; *"An index entry with no working-tree file is **not** corpus"* | **Confirmed** — the absorption is faithful, and absorbing rather than re-raising is the DEC-ERR-01-correct route |
| 2 | FSPEC v11.6 re-scoped AT-P7 to the predicate | FSPEC §13.2 *The consumed predicate and the corpus*: *"the two **predicates** are evaluated"*, *"Scope is the predicate, and only the predicate"* | **Confirmed** — §13.3's "the set-equality that would have been red on correct code is gone from the register" is true, and the §13.2 re-cite is right (it was §13.7 in an earlier draft) |
| 3 | Dropping `--exclude-standard` admits an ignored LEARNINGS and changes nothing else; `docs/discarded/` stays at zero because `:(glob)` performs that exclusion | Scratch repo, ignored `docs/ign/`, a `docs/discarded/x/LEARNINGS-x.md`: without the flag ⇒ `docs/ign/LEARNINGS-ign.md` **plus** the tracked pair; with it ⇒ the pair alone; `docs/discarded/` **zero in both** | **Confirmed mechanically** — §10.4's retraction of the old "re-admits `docs/discarded/`" claim is correct |
| 4 | `ls-files --deleted` over the identical pathspecs returns exactly the staged-but-deleted path | Same tree, one committed LEARNINGS unlinked: `--cached --others` returns it, `--deleted` returns **it and nothing else** | **Confirmed** — the subtraction is the minimal mechanism, as §7.1 argues |
| 5 | The surviving divergence is a LEARNINGS inside a nested git repository | `docs/nested/` with its own `git init`: `glob.glob` returns `docs/nested/LEARNINGS-nested.md`; neither `--cached` nor `--others` does | **Confirmed** — the residue is real, correctly sized, and correctly declined |
| 6 | The hook edit "has since landed: `CORPUS_GLOBS` and its comprehension are at HEAD, located by name" | `nudge-consolidation.sh:60-61` — `CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")` and the comprehension over it; `region_split` `:29`; `pending` fall-through `:73-74`; `PDLC_PENDING:` `:77-78`; `glob.glob(` occurs **once** | **Confirmed** — §12.2's pin (b) conjuncts are satisfiable exactly as written |
| 7 | §11.1's L4 git case gains an ignored member (present) and a staged-but-deleted member (absent), each with a control | Row 3 and row 4 above are precisely what those two conjuncts assert, and each reds on a re-introduced flag / dropped call through **real** git | **Confirmed** — this is the strongest addition in v2.3, see §5 |
| 8 | AT-P1's argv pin now covers both calls, and conjunct 3 observes the subtraction | Oracle *form* is right (positive + set equality, no absence-only arm). Its *implementability* against the double §11.2 names is not — **F-01** | Partial |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **The `_git` double §11.2 mandates cannot express two `ls-files` reads, so v2.3's new oracles — and every L2 corpus fixture — red on conforming code.** §7.1 now issues two `_git` calls, and AT-P1's conjunct 3 is stated in terms of "a **first-call** stdout … and a **second-call** (`--deleted`) stdout". But §11.2's table binds `_git` to `fakeGit(script)` from `mergeDoubles.js`, whose script is keyed by the git **operation**: `let key = argv[0]` after skipping `-C`/`-c` pairs (`mergeDoubles.js:200-206`), then `script[key]`. Both of `enumerateCorpus`'s calls have key `ls-files`, so the double returns the *same* value to both — and an unscripted key returns `{ok:true, stdout:""}`. Either way the `--deleted` set equals the enumeration set and the corpus is **always empty**. That reds conjunct 2 (positive membership) and conjunct 3 (the subtraction) on a correct implementation, and it is not confined to AT-P1: every L2 fixture that scripts an `ls-files` listing — the AC-1.2 volume count, the consumed pair, the report body's unreadable-basename case, the whole-pass lifecycle rows — sees an empty corpus for the same reason. §11.2's *"Two new factories only"* closes the obvious escape, so an implementer's cheapest move is to weaken the oracle rather than the double. **The document already ships the fix and does not name it:** `seams.js`'s own `fakeGit` (`:389`) accepts a **function** `script(args, index)` (`:406`) or an **array** indexed per call (`:408`) alongside the map form, and records `.invocations` / `.calls` — which is exactly what the two-argv pin and the subtraction conjunct need. Decide one of: (a) re-point §11.2's `_git` row at `seams.js`'s `fakeGit` and say per-call scripting is why; or (b) state the argv-aware widening of `mergeDoubles.js`'s key function as an in-scope helper edit with its own row in §3.2's file-touch table and its own owning PLAN task. Whichever is chosen, say it in §11.2 rather than leaving it to the fixture author, because the failure is silent-green in one direction (an empty corpus passes any absence-shaped assertion) and red-on-correct-code in the other | §7.1 (AT-P1 conjuncts 2–3), §11.2's `_git` row, §12.2's T-08 row |
| F-02 | Medium | Local | **§13.1 row 6 still presents a settled decision as erratum-pending, and pins it to a REQ line range the REQ struck.** The row closes: *"This decision relaxes REQ `:115-116`'s 'keeping one enumeration as well as one predicate', so it is not settled here: §13.3 raises it as a REQ/FSPEC erratum, and this row records what this layer would ship if the relaxation is accepted."* All three clauses are now false — REQ §3.1 step 1 **withdrew** that half, §13.3 records the round trip as closed, and §1's own T-08 row was updated to say so this round. The row was edited at v2.3 (its alternative (b) now names the nested-repository class), so the miss is a partial sweep, not an oversight of scale. It matters to this lens because §13.1 row 6 and §12.2's T-08 row are the two things a PLAN task reads when writing the enumeration pins, and a row that says "conditional on an unresolved erratum" invites deferring or softening the very pins that now carry a decided REQ rule. Also strike the `:115-116` line pointer under §12.3's own rule (§2 row 1 gives the quotable anchor) | §13.1 row 6, §13.3, §12.2 T-08 |
| F-03 | Medium | Local | **The hook's line locators are stale at HEAD, in the same document that just declared them forbidden.** §3.2's row now says the hook's edits are *"Located by symbol, never by line index"*, and §12.3 widened the citation rule to every upstream document — but the body still locates the hook by pre-edit line index in at least six places: `:28`'s glob and `:41`'s predicate (§7.1, twice, and the PLAN-task sentence), `:29-30`'s early exit as a thing this feature *will* remove, `:43`'s threshold test, `:44-48`'s message. Measured at HEAD (the T09 commit `b22834b7` landed the edit): the glob is `CORPUS_GLOBS` at `:60-61`, the predicate is the `pending` comprehension at `:73-74`, the early exit **no longer exists**, the threshold test is `:81`, the message `:82-86`. (`:13-20`'s `PY_BIN` probe and `THRESHOLD = 5` at `:25` are still accurate.) For a test author this is a wrong-file-position pointer for AT-P7's differential and for §11.1's skip-detection reasoning; for a reader it also leaves §7.1 narrating a landed edit in the future tense. Re-anchor by symbol (`CORPUS_GLOBS`, `region_split`, `pending`, `PDLC_PENDING:`, `THRESHOLD`) — the names exist precisely so this is a mechanical repair | §7.1, §11.1, §12.2 |
| F-04 | Low | Local | **`ls-files` output order is unspecified, and no oracle says so.** Measured: `--cached --others` returned the untracked-and-ignored path **first**, ahead of the two tracked ones — the sets are not sorted and the order is not the pathspec order. §7.1 describes `parseCorpusListing` as "split on newline, drop empty lines" and AT-P1's conjuncts are stated as membership and as "the corpus is exactly the other", which is set language; but nothing states that an order-sensitive assertion is forbidden. One sentence — the enumeration's oracles are **set** oracles, and any `toEqual` over an array must sort or use a set — keeps a real-git L4 case from going intermittently red on a fact about git rather than about this feature. §11.4's determinism rows are the natural home if §7.1 is not | §7.1, §11.1's L4 git case, §11.4 |

## 4. Questions

| ID | Question |
|----|---------|
| — | None. F-01 states the two available answers rather than asking which; either closes it. |

## 5. Positive Observations

- **The absorption was routed correctly and is faithful.** Both corpus rules were decided upstream
  and are taken here rather than re-raised — the DEC-ERR-01 pattern working as intended. Every one of
  the five git facts v2.3 asserts survived independent measurement on a scratch tree, including the
  two it uses to *retract* an earlier false claim.
- **§11.1's L4 git case is the strongest thing in this revision.** Two fixture members, each paired
  with a control basename, run the two decided rules against **real** git — the ignored member reds
  on a re-introduced `--exclude-standard` and the staged-but-deleted member reds on a dropped
  `--deleted` call, neither of which any argv pin can catch, and neither of which can be satisfied by
  an empty result. A gap that was deliberately recorded three rounds ago closed the moment its reason
  expired, and closed with behaviour rather than with a token check.
- **§10.4's correction names its own reasoning error.** "Genuinely not closable at this layer" was
  wrong in one direction — the class closes by narrowing the *pass*, not by widening the hook — and
  the section says so, keeps the argument that lost as recorded history, and re-attaches the cost it
  correctly identified to the class it actually applies to. That is what a decision record is for.
- **§7.3's whitespace boundary is decided against the adjacent convention, not invented.** Trimming
  matches the `file_empty` probe's own `.trim()`, so the document adds no third convention, and
  §11.4's generator was moved rather than the property weakened.
- **F-03 aside, the citation-rule widening is the durable repair.** "A citation rule is about the
  *form* of a pointer, so it can have no per-document scope" is the correct generalisation, and it is
  what makes F-03 a mechanical sweep rather than another round of findings.

## 6. Recommendation

**Needs revision**

One High. F-01 is not a documentation defect: as written, v2.3's new subtraction cannot be exercised
by the double this document mandates, so the oracles it mints fail on a correct implementation and
every corpus fixture in the L2 band collapses to an empty corpus. It is also cheap — the capability
already ships in `seams.js`'s `fakeGit`; what is missing is one decided sentence in §11.2 (and, on
option (b), one row in §3.2). F-02 and F-03 are partial-sweep repairs of this round's own work and
F-04 is one sentence; none of them would hold the phase on their own. The mechanism itself is sound
and better than v2.2's — this is a revision to make the new oracles runnable, not to re-argue them.

## 7. Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
