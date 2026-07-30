# Cross-Review: product-manager — PLAN (round 5, delta)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.4)
**Previous review:** `CROSS-REVIEW-product-manager-PLAN-v4.md` (`a5d83c1`) — **Approved**, 0H/0M/0L at v1.3
**Delta reviewed:** `83a5c1e..HEAD` (`51b6a28`, `c21b3d4`, `ce32e8b`, `b760924`, `1a7fb32`)
**Date:** 2026-07-30
**Iteration:** 5 (iteration cap — delta only)
**Scope:** Local

---

## What this review is, and is not

My v1.3 approval stands and is not reopened. R-5 binds me to the surface, and the surface is the
v1.3→v1.4 delta: eight hunks, +82/−7 lines, file 174,142 B. The single question is whether that
delta regresses anything I approved. Per the round brief, only a defect that would block an
implementer is a finding; preferences and improvements go to Harvest, marked non-blocking.

Everything below is verified against the tree at HEAD (DC-02): the PLAN text as it now stands, and
`pdlc/workflows/orchestrate-dev.js` / `orchestrate-queue.js` source for every measured claim.
Citation drift is treated as mechanical, never a finding (R-6).

---

## Edited-section list — complete, no unreviewed content

`git diff -U0` yields exactly eight hunks. Every one maps to a section the author declared; none
falls outside the declared list.

| Hunk (new line) | Section | Declared? |
|---|---|---|
| `+3` | header version line `v1.3 → v1.4` | yes |
| `+93` | §2.2 exit-criterion quote + ownership note | yes |
| `+316` | §4.1 blocking row (lower bound) | yes |
| `+805` | §9.2 item 3(c) (forward half) | yes |
| `+1022` | §11.5 span rule `^}` → `^}\s*$` | yes |
| `+1203` | §12.3 `endIndex` DoD row | yes |
| `+1304` | §14 changelog, v1.4 row | yes |
| `+1540` | §14.4 (new) | yes |

**Confirmed complete.** No edit arrives at the cap unreviewed. The delta also touches no other
document — `git diff --stat 83a5c1e..HEAD` lists only this PLAN and the two round-4 review files, so
TSPEC v1.7, FSPEC and REQ are untouched, as the changelog claims.

---

## The four fixes

| # | Fix | Sound? | Regresses anything approved at v1.3? |
|---|---|---|---|
| 1 | §9.2 item 3(c) — returned-promise ruling now requires **both** halves (backward `=>`/`return`, forward first token after the matching `)` ∈ `; , ) }` / EOL), unresolvable forward walk → **unclassified** | **Yes.** It closes a genuine fail-open: `() => _agent(a) && other` was exempted silently, and a silent exemption is unreportable downstream. Degrade-to-unclassified is preserved and now stated for the new half | **No — and I checked the one way it could.** `RLH-AT-19` has an **empty** permitted-red window (§7.3 row 1), so a stricter rule that turned any currently-exempt site red would be a batch-2 regression. All three returned-promise sites survive: `orchestrate-dev.js:1569` → next token `;`; `orchestrate-dev.js:1867` → matching `)` at `:1872`, next token `)` at `:1873` (the `batch.map(` close); `orchestrate-queue.js:524` → `;`. `:615`/`:616` are decided by the combinator ruling, whose backward token is `[`, so the tightened returned-promise half cannot capture them. Site set stays 5-of-35, all exempt |
| 2 | §4.1 blocking row — lower-bound non-vacuity conjunct: ≥1 call site in each of the two files | **Yes**, with the caveat below on its strength | **No.** It is added to §4.1's blocking row, which is where I approved the site set to live. It constrains the **scan**, not the count: the advisory evidence row is untouched and the exact figures (5, 35, 27, 8) remain non-load-bearing. A bound of one cannot drift upward, so it does not recreate the four-round drift the v1.3 remedy removed |
| 3 | §11.5 / §12.3 — span end anchored on `^}\s*$` rather than `^}` | **Yes**, and the measurement is true at HEAD. Verified in the tree: `reviewLoop` declared `orchestrate-dev.js:532`, first `^}` after it is `:542` = `}) {` (destructured parameter close), first `^}\s*$` is `:669`; `checkConverged` `:496` → `:515`. Under `^}` the placement conjunct was satisfiable anywhere in `:543–669`, the region it exists to forbid | **No.** §12.3's `endIndex` row now cites §11.5 for the span rule rather than restating a competing one — single ownership preserved. The count conjunct is untouched and still genuinely red: `grep -c MAX_REVIEW_ROUNDS pdlc/workflows/orchestrate-dev.js` returns **0** at HEAD, so `RLH-LOOP-03` remains red-then-green, not a green-on-arrival tautology |
| 4 | §2.2 — exit-criterion quote gains the skip clause, attributed to §12.2 step 2 | **Yes.** §2.2 previously said "no *new* failures" and was silent on skips, so the section that claims to state the criterion "once" stated half of it while §12.2 step 2 carried the other half — the two statements were not equivalent for a skipped test | **No, and this is the check I care most about.** The added text is a *quote plus an explicit owner attribution*: "operated and owned by §12.2 step 2 … §12.2 remains the authority on how it is checked." It does not create a second authoritative statement, because it makes no independent operational claim — the equality (`skipped exactly 70`), the presence-and-executed criterion, and the checking procedure all remain in §12.2 step 2, verbatim consistent with §2.2's paraphrase. This is citation, not duplication |

---

## Ruling on the lower bound's adequacy

**It is the right trade. I endorse it as written, and I would reject a stronger one at this round.**

Stated plainly, as asked: the bound is weak. A scanner reporting 2 sites of the 35 that exist passes
§4.1's blocking row, §12.3's DoD row and `RLH-AT-19`. The bound is a **non-vacuity smoke test**, not
a completeness check, and the PLAN should be read as claiming nothing more.

Three reasons it is nonetheless the correct instrument:

1. **It is aimed at the failure mode that actually occurs.** The defect TE identified is a scanner
   whose alias regex, mask or call-site match returns the **empty** set — none of which throws. That
   is a total-blindness failure, and every plausible mechanism for it (a regex that matches nothing,
   a mask that swallows the file, a scan-set build that resolves to zero names) produces zero, not
   two. Partial blindness that returns a nonempty-but-wrong set is a different and much rarer shape.
2. **Completeness is defended elsewhere, and better.** §9.2 item 3's `RLH-SCAN-01` drives the walk
   over inline literal fixtures — one per ruling, a masked-delimiter case, and a shape matching no
   ruling — and asserts each classification. That is the positive control against a scanner that
   sees some shapes and not others; a numeric bound in §4.1 could never do that job. §4.1's row is
   the right place for "the scan is not blind" and the wrong place for "the scan is complete."
3. **The alternative is the failure this feature already suffered three times.** An exact figure was
   stated at v1.1 (one), v1.2 (three) and v1.3 (five); two of those were wrong, and each wrong one
   consumed a review round. A tighter bound is a bound that can go spuriously red on a legitimate
   source change and re-import that maintenance cost. One-per-file cannot: the PLAN's justification —
   neither module's `main()` can run its pipeline without calling at least one injected seam — is
   true of the source at HEAD and structurally true of any future version that still works.

An undriftable bound that catches the realistic failure beats a precise bound that manufactures
false halts. Approved as reasoned.

---

## Is §14 still inert?

**Yes.** I re-ran the test I applied at v1.3 — for each rule §14 states, is there an authoritative
statement outside §14 that an implementer would reach without reading the changelog?

| Rule stated in §14.4 | Authoritative owner outside §14 | Verified |
|---|---|---|
| Forward half of the returned-promise ruling, token set, degrade-to-unclassified | §9.2 item 3(c) | yes, and §14.4 states it no more precisely |
| Lower bound ≥1 site per file | §4.1 blocking row | yes |
| Span end `^}\s*$` | §11.5, restated as a citation in §12.3's `endIndex` row | yes |
| Skip clause / `skipped exactly 70` | §12.2 step 2 (operator), quoted in §2.2 | yes |
| `MAX_REVIEW_ROUNDS` occurs zero times at HEAD | §11.5 ("reds at HEAD with zero occurrences") | yes, and true in the tree |

The remainder of §14.4 — the round-4 root-cause paragraph about TSPEC v1.6's alias phrasing, and the
three Harvest-routed bullets — is retrospective and advisory. None of it gates anything, imposes an
obligation on an implementer, or is cited by a task, assertion or checklist row. §14.4's own closing
observation ("a §14 changelog row must never state a normative rule more precisely than the section
that owns it") is a Harvest lesson about §14, not a rule §14 imposes on the build; it is
self-consistent with the section remaining inert.

The ~10 KB of growth is entirely the changelog row plus §14.4, consistent with the eight-hunk
diff — the four fixes themselves are 39 of the 82 inserted lines.

---

## Findings

None. No High, Medium or Low.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings at any severity | — |

---

## Non-blocking observations, routed to Harvest

Explicitly **non-blocking**. None of these would stop an implementer; none is a finding; none
requires a v1.5.

1. **The lower bound's noun is disambiguated by its justification, not by its own wording.** §4.1's
   new conjunct says "the scan must report **at least one** call site in `orchestrate-dev.js`" — in a
   row whose subject is *non-`await`ed* sites, "call site" is momentarily ambiguous between the
   35-member scan set and the 5-member non-awaited set. The following sentence resolves it
   unambiguously (`main()` "cannot run its pipeline without calling at least one injected seam" is an
   argument about the scan set, not about non-awaited sites), and both readings are satisfied at
   HEAD, so nothing is reachable here. Worth one clarifying noun the next time §4.1 is edited for
   another reason — not worth an edit of its own at the cap.
2. **Endorsement of the two items TE and I both routed here at round 4** — the §14.3 restatement
   drift (`RLH-SCAN-01`'s fixture design and the `Q-02` oracle attribution) and the under-specified
   masking latitude. §14.4 records both correctly. I note only that item 1 above is an instance of
   the same general lesson from the opposite direction: the *owning* section, not just the changelog,
   has to carry the precision.
3. **Cross-Feature, carried forward unchanged from v4:** `RLH-AT-19`'s exemptions delegate the await
   obligation to an `await` of `_parallel`, which sits outside FSPEC AT-19's closed thirteen-name
   set. Pre-existing, out of surface under R-5, recorded so a later feature that widens the set knows
   the delegation exists.

---

## Positive Observations

- Each of the four fixes landed **in the section that already owned the material**, and each one
  either cites its owner or is cited by its dependants. The §12.3 `endIndex` row was updated to cite
  §11.5 rather than to carry its own copy of the span rule — the same single-ownership discipline
  that earned the v1.3 approval, applied without being asked.
- Fix 2 is a candid correction of a defect my own round-3 direction introduced. Demoting the count to
  advisory was right; it removed the only thing standing between the gate and a scanner reporting
  nothing, and §14.4 says so in those terms rather than presenting the bound as a refinement.
- Fix 3's measurement was taken **before** the edit and is reproducible: I re-derived `:532`, `:542`
  (`}) {`), `:669`, `:496`, `:515` and the zero `MAX_REVIEW_ROUNDS` occurrences independently in the
  tree, and every figure holds.
- Fix 1 tightened a classifier without turning a single currently-exempt site red — the one property
  that mattered, given `RLH-AT-19`'s empty permitted-red window.

---

## Recommendation

**Approved**

The v1.3→v1.4 delta regresses nothing I approved at v1.3. §4.1 still solely owns the site set with
§7.3 row 1, §9.2 item 1 and §12.3 citing and restating nothing (all three untouched by the delta);
the count remains a premise of no gate and the new bound constrains the scan, not the count, and
cannot drift; §14 remains inert; §2.2's new clause is an attributed quote, not a second authority.
The edited-section list is complete.

---

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
