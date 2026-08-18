# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.2)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** testing lens only — is each decision falsifiable, does a named oracle exist that can go
red, and can PLAN/PROPERTIES derive a contract from it. Delta re-review: v1 findings F-01…F-08
checked for resolution; only sections changed by `git diff 65a23537..HEAD` scanned for new issues
(DEC-02, DEC-03, DEC-04, DEC-06, DEC-07, DEC-08, DEC-09, new DEC-10, the Decision table's new
owning-oracle column, cross-cutting rules 1–4, Consequences, triggers 2a/2b/2c, downstream
obligations). Unchanged prose already reviewed at v1 is not re-litigated.

**Verification base:** HEAD `1053b7fd` on `feat-pdlc-plugin-retirement`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-10's block is transitively wider than the decision prices it, and three owning-oracle rows do not know they are gated.** DEC-10 gates classes 7 and 11 on erratum 3 and calls that "the narrowest possible gate"; the Consequences row prices it as "two of eleven classes". FSPEC's class table makes the gate reach further by its own ordering column: class 8 lands "at the same time as class 7", class 9 "same commit as class 7", class 10 "after class 7" (`FSPEC-pdlc-plugin-retirement.md:160`, `:161`, `:162`). Blocking class 7 therefore blocks 8, 9 and 10 as well — five classes, not two. The testing consequence is concrete: DEC-01's owning oracle is AC-1.1's `dist/` set-equality, DEC-02's is AC-5.3 + `consolidationBuild.test.js` T32, and DEC-09's is the class-9 `version`/`satisfiesRange` assertion this revision added — all three are named in the Decision table with no gate marker, yet none can go green until erratum 3 lands, because class 7 carries the bundle deletion (M-4/M-5/M-10) and class 9 must share its commit. PLAN reads this table to build dependency edges and PROPERTIES reads it to place ATs; as written, both derive an ordering that cannot pass. State the closure of the gate (7, 8, 9, 10, 11), correct the price row, and mark the DEC-01/DEC-02/DEC-09 oracle cells "gated by DEC-10". | DEC-10; Decision table rows DEC-01/DEC-02/DEC-09; Consequences row 5 |
| F-02 | High | Local | **DEC-09's new positive oracle mis-transcribes the callee's return contract, and its nearest rendering is unfalsifiable.** The decision requires class 9 to assert that `satisfiesRange(version, pdlcPluginCompat)` "returns true". The shipped function returns an object, not a boolean: `satisfiesRange` (`pdlc/engine/lib/handshake.mjs:93`) returns `{ ok: false, reason: "…" }` on every reject path and `{ ok: true, reason: null }` on accept. An implementer transcribing the decision literally writes `expect(satisfiesRange(...)).toBe(true)`, which is red by construction; the sloppier rendering, `toBeTruthy()`, passes for *every* object the function can return — including `{ok:false}` — so the assertion that exists to keep BR-VER-1's signal falsifiable cannot fail. This re-opens v1 F-03 in a new shape. Fix by naming the field and adding the negative arm that actually exercises range semantics: assert `satisfiesRange("0.23.2", pdlcPluginCompat).ok === true` **and** that a version outside the window (`0.24.0`, which `^0.23.0` excludes — upper bound computed at `handshake.mjs:113`–`:118`) returns `ok === false` with a non-null `reason`. Without the negative arm the call is a dead-config assertion wearing a function call. | DEC-09 option A; Decision table row DEC-09 |
| F-03 | Medium | Local | **"eleven classes" is a wrong pinned literal, in the one document whose rule 2 forbids exactly this.** FSPEC §3.1 enumerates **thirteen** classes (`FSPEC-pdlc-plugin-retirement.md:153`–`:165`, rows 1…13), and TSPEC states the count in words — "FSPEC §3.1's thirteen classes" (`TSPEC-pdlc-plugin-retirement.md:288`). DECISIONS says "two of eleven classes" twice (DEC-10's price paragraph and the Consequences row). Cross-cutting rule 2 requires literals to be transcribed from the owning upstream document; a count word inside a decision's own price statement should meet the bar the decision sets for implementation. Correct to thirteen, together with F-01's numerator. | DEC-10 "Price of A"; Consequences row 5 |
| F-04 | Low | Local | **DEC-10's owning-oracle cell says "not an assertion" when the gate is mechanically checkable.** The cell reads "**None yet** — the gate is a PLAN dependency edge, not an assertion". A dependency edge *is* assertable before implementation starts: PLAN's batch column must satisfy `batch == max(dep batch) + 1` over the edge set, and a reviewer re-derives it without running anything. Say so — "owned by PLAN's batch-DAG check over the class-7 predecessor edge" — so the gate has a named check rather than reading as unowned until erratum 3 arrives. | Decision table row DEC-10 |

## Questions

_(section written below)_

## Positive Observations

_(section written below)_

## Recommendation

_(section written below)_
