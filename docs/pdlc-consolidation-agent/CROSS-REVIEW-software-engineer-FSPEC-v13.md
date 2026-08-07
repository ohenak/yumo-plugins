# Cross-Review: software-engineer — FSPEC (delta confirmation, erratum round v11.3)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** Delta confirmation only. Diff reviewed: `5d3765ce..HEAD` (commits `b68dddea`,
`fcb8a4bc`, `858797f6`, `838868e3`, `b9f66cb4`, `0499e532`) against the FSPEC I approved at v12
(`369c323e`, anchors `37feef64`). No section outside that diff was re-reviewed.

## 1. Erratum item disposition

Seven errata were routed to this document (two pairs are the same defect raised by two roles).
Every one is resolved. I re-verified each codebase claim the edit added rather than accepting it.

| # | Erratum (raised by) | Disposition | Evidence |
|---|---|---|---|
| 1 | §4.1 marker lifetime says "Removed at step 16", but no seam can remove a file (te-review, se-author — same defect) | **Resolved** | `:424-425` replaces the `Removed` row with **`Released`** — "an **in-place rewrite** of the same file to a single line, `RELEASED: {passId} {ISO-8601}`" — and a new `Removed` row reading "**never by the pass.** Only an operator removes the file". `:431-435` states the reason and carries the falsifiable claim. I re-ran it: `grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` → **`0`** at HEAD. The adapter ships `rtReadFile` / `rtWriteFile` (`runtime-adapter.js:802-811`) / `rtCheckFile` (`:817-838`) and no deletion, so the spec now names the one operation that exists |
| 2 | §4.2's fourth row / E-11 / AT-M3 bind an unreachable "empty (truncated write)" arm; and the product question — must the durable log witness a pass that dies mid-take? (te-review, se-author — same defect) | **Resolved, and the product question is answered** | The release form is now a **sentinel line, not a truncation** (`:437-442`), which is what makes the arm reachable *and* keeps released ≠ half-written distinguishable. The FSPEC states the mechanism it relies on and cites it: `rtCheckFile` maps present-but-empty → `file_empty` and absent → `file_missing`. Verified at `runtime-adapter.js:817-838` — `test -f && test -s` ⇒ `OK`, `test -f` alone ⇒ `EMPTY`, else `MISSING`; the cited `:817-831` range covers the function's decision. `:479-491` answers the question explicitly and in the product's voice: **yes, the log must witness it** — "a take that stepped over an empty marker silently would erase the only trace of an abandonment", because the abandoned pass appended no terminal row by construction. `unknown` is justified as the honest id rather than a placeholder |
| 2b | Consequences of (2) propagated | **Resolved** | §4.2 becomes **four** outcomes (`:456-471`): a new `RELEASED:` row taken like an absent file **at any age, recording nothing**, with the explicit statement that age is not consulted on a released marker ("staleness is a property of a *held* marker"). New **E-11b** (`:2645`), new **BR-14a** (`:2551`), BR-14 narrowed to `IN-PROGRESS:` (`:2550`), E-11 re-Given onto empty/neither-form (`:2644`). AT-M3 gains two explicit fixtures (`:2084`) and the new **AT-M11** (`:2085`) is its paired negative — two fixtures, one fresh and one older than `staleLockMinutes`. The older fixture is the one that falsifies "route every non-`IN-PROGRESS:` file through the stale-lock arm", which was the real mutation risk. AC-1.3's map row gains AT-M11 (`:2311`) |
| 3 | AT-P7's *When* ("run the hook") and set-equality *Then* would be red on correct code (se-author) | **Resolved** | `:2069` re-scopes the *When* from executing the hook to evaluating **the two predicates** over a materialised fixture root, and states the exclusion that caused the false red: the hook's `THRESHOLD` gate and its advisory line "govern whether the hook *speaks*, not what it counts, and are asserted neither way here". Citations verified against the shipped script: `THRESHOLD = 5` at `nudge-consolidation.sh:25`, the corpus glob at `:28`, the read-and-membership block at `:36-41` (`pending = [p for p in learnings if os.path.basename(p) not in logtext]` is `:41`). The oracle is now the decided set, which is the thing §3.1 actually constrains. The forward-compatibility clause (if T-08 resolves to shared code, the fixture table is unchanged) is correct and keeps T-08 genuinely open |
| 4 | AC-3.2's PR-body obligation has no acceptance test; the map binds it to AT-Q2, which asserts only the trailers (se-author) | **Resolved** | New **AT-Q13** (`:2126`) reads the PR **body** and asserts all three obligations — sources by feature name (set-equality, so a body naming one of two is red), the `symptom` line verbatim, and the AC-2.3 evidence in the form the fixture cleared the bar with. Two fixtures, recurrence and single-occurrence-under-standing-invariant; fixture (b) is what stops an unconditional recurrence list. The AC→AT map row is updated with both bindings and their division of labour (`:2320`), and §6.2 now says the three body obligations are "separate from the three trailers and not discharged by them" (`:828-830`) |
| 5 | §5.3's "when, and only when" has no test binding the "only when" half (se-author) | **Resolved** | New **AT-R7** (`:2106`): three fixtures, two negative — (a) a `promoted` pass with no §5.3 cause, (b) a `no-op` pass whose promotions were all duplicate-suppressed — plus (c) a positive control. The oracle is the `CONSOLIDATION-PROPOSAL-*` file set before and after, so "unchanged" is asserted positively rather than as an absence-only check on one path. Fixture (b) is well chosen: it reaches "no cause" by a different route *and* a different terminal status than (a), which is what pins §5.3's decision to causes rather than status. §5.3 now names both halves and their tests (`:688-690`); AC-1.4's map row gains AT-R7 (`:2312`) |
| 6-7 | Two Low repairs from my v12 (T-10 and BR-33a `phase`-arm subjects) | **Resolved** | T-10 (`:2211`) now excludes **§8.3's** `phase` arm rather than "§8.1's `phase` … arms", and states why: §8.4 steps 2-3's `phase` half *is* collected by the cell's first clause, field-agnostically. BR-33a (`:2197`) adds the matching conjunct — "§8.4 steps 2-3's question is still asked, with the `phase` half stated unavailable". Both now agree with E-12b's reader enumeration (`:2649`, `phase` for §8.3 / §8.4's harvest question), which is the three-way consistency that was off by one arm |

## 2. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §4.1's justification sentence overloads "the existence seam alone": *"they stay distinguishable through the existence seam alone … `RELEASED:` is a parseable line, empty is not, and neither is `IN-PROGRESS:`."* The existence seam separates absent / empty / non-empty; it cannot separate `RELEASED:` from `IN-PROGRESS:` — that needs the read §4.2 already performs ("Read the file … parse its single line"). The intended reading (the *pair* the paragraph is arguing about — released vs. mid-flush-empty — is separable by existence alone, and neither empty nor `IN-PROGRESS:` is a `RELEASED:` line) is recoverable and correct, and §4.2's table is normative and unambiguous, so nothing is under-specified. It is prose imprecision at a spot an implementer will read closely. Suggested: "…the two are separable by the existence seam alone: a released marker is non-empty, a half-written one is `file_empty`. Which of the two non-empty forms is present is decided by §4.2's read of the line." | §4.1, `:437-442` |

No High or Medium findings. Nothing in the delta blocks implementation.

## 3. Regression check — did the delta break anything previously approved?

## 4. Questions

## 5. Positive Observations

## Verdict
