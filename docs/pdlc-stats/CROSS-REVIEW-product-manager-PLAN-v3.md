# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.1, own bytes unchanged)
**Upstream that moved:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.3 → v1.7)
**Date:** 2026-08-31
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)

## Overview

**Question answered.** Does `PLAN-pdlc-stats.md` (v1.1, approved at `CROSS-REVIEW-product-manager-PLAN-v2.md`,
`REVIEWED-COMMIT: 628cf244`) still hold as a faithful product-level compression of the TSPEC as it now
stands at HEAD? The PLAN's own bytes have not moved; the TSPEC has moved four erratum rounds
(v1.3 → v1.7), so the version I approved against no longer exists.

**Method.** Read my v2 cross-review first (it pinned `UPSTREAM-STATE: TSPEC sha256:512a9fcf…`), then
`git diff 628cf244..HEAD -- docs/pdlc-stats/TSPEC-pdlc-stats.md` (153 insertions, 22 deletions), then
re-read the current text of every TSPEC passage the PLAN leans on — §1's cost sentence, §2.1's
co-change table, §4.3's BR-16 paragraphs, §6.4's enumeration subset, §7.3/RK-1 and §8.3 — and asked of
each whether the PLAN's compression of it is still true. Scope is product lens only: requirements
traceability, scope compliance, acceptance-criteria fidelity. Per DEC-ERR-03 I measured the PLAN
against the upstream at HEAD, not against the dispatched item list.

**Answer.** The PLAN holds. Four of the five substantive TSPEC deltas make the PLAN *more* accurate,
not less, because the PLAN was already written against the measurements the erratum rounds moved the
TSPEC onto. One delta — TSPEC §8.3 going from "One remains open" to "**Two** remain open", the new
item being a REQ-versus-FSPEC conflict that decides a named acceptance test's expected value — is not
reflected anywhere in the PLAN, and the PLAN has exactly the mechanism (its Residual risks table) that
exists to carry such an item into implementation. That is one Medium finding, not gating.

## Batches

The five substantive TSPEC deltas, each checked against the PLAN task or Overview claim that leans on it.

| # | TSPEC delta at HEAD | PLAN text that leans on it | Still faithful? |
|---|---|---|---|
| D-1 | **§2.1's `coverageInstrumentation.test.js` row**: the P9-02 title/comment move is corrected from *six → seven* to **seven → eight**, because HEAD's literal measures `4 + 1 + 2` = seven members (`REQUIRED_INCLUDES` holds four, not three, since `CODE_REVIEW v1 §1-1` added `scripts/check-wave-resume-delta-coverage.mjs`); the printed word `six` is stale at HEAD, before this feature touches anything. The v1.3 changelog's `six → seven` narration is neutralised in place. | Overview's "Claims verified" table row: `` `pdlc/workflows/package.json` `` / `c8.include` / "**seven** `**/`-anchored entries"; the Verification bullet repeating "`c8.include`'s seven `**/`-anchored entries are all as the TSPEC describes them"; T-24, which says "correcting the stale count words in P9-02's title and comment". | **Yes — and the PLAN was right first.** The PLAN never transcribed the wrong `six`; it measured seven at HEAD and told T-24 to correct "the stale count words" without printing a number. The TSPEC has moved onto the PLAN's measurement, so the two now agree where before the PLAN silently disagreed. Nothing in T-24 needs an edit. |
| D-2 | **§1's cost sentence** now cites §2.1's derived **ten** and states the sibling-feature carve-out sits **outside** that ten; **RK-1** takes the same correction ("together with the two sibling-feature document edits that sit **outside** the ten"). | Overview's "standing cost" paragraph and its ten-row site table (`prepack.mjs` … `pdlc/README.md`); T-22, which handles the two `docs/completed/pdlc-engine-distribution/` edits as the `K-7` cluster; the DoD line "complete across all **ten in-repo sites and both sibling-feature documents**". | **Yes.** The PLAN already drew the boundary the TSPEC has just corrected itself onto: exactly ten rows in the site table, all in-repo, with the two sibling documents carried separately under T-22 and named separately in the DoD. The mis-scoping the TSPEC fixed never entered the PLAN. |
| D-3 | **§6.4** renames "the four **script-side** enumerations" to "the four enumerations `assertAdditiveOnly` reads" (§2.1's sites 1–4, three under `scripts/` and one helper under `__tests__/`), and adds "'Four' here is the subset this oracle reaches, not §2.1's ten-site total." | T-20's co-change oracle (`prepack.mjs`, `publish-preflight.mjs`, `_tspec-packed-set.mjs`, `fixture-machine.mjs`, with `MODULE_NAMES.length + 1` **derived**); T-23's `assertAdditiveOnly` message edit. | **Yes.** The PLAN names the four sites by file rather than by any collective noun, so the renamed label has no PLAN referent to go stale. T-20's four files are precisely the subset §6.4 now describes. |
| D-4 | **§4.3** rewrites the BR-16 passage: `docs/completed/pdlc-advisory-wave-gate/` is a basename *shape* citation, **not** a harvested-directory verdict — measured at HEAD the directory holds 62 `CROSS-REVIEW-*` files, 4 out-of-catalogue and 58 grammatical, so it reports a **measured** ratio. The BR-16 pin moves v1.4 → v1.7. | T-18's AT-09 leg (`pdlc-advisory-wave-gate` — "TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed"); the Verification bullet "`pdlc-advisory-wave-gate`'s four `…-REVIEW-v{1,2}.md` basenames". | **Yes.** The PLAN cites this directory only for AT-09's *review-round* count and for the existence of the four malformed basenames — both of which §7.2 and §6.1 carried unchanged through the erratum and which the rewritten §4.3 explicitly re-affirms ("§7.2's AT-09 row and §6.1's measured baselines already record the same four-file count"). The PLAN never asserted `harvested` for this directory, so the corrected reading costs it nothing. |
| D-5 | **§8.3 goes from "One remains open" to "Two remain open."** The new item: REQ-STATS-06 (v1.6) calls a grammatical basename outside the driver's catalogue **a survivor** → directory **measured**; FSPEC BR-16 (v1.7) calls the same file no-file-remaining → directory **`harvested`**. §4.3 implements BR-16 and names the exactly three sites that re-stamp when it settles — the contested paragraph, the BR-16 pin, and **AT-17's fourth-leg expected value**. | T-04, which claims "AT-17's four directories" as red tests with no marker; the AC coverage table's row `AT-17 | T-04`; the DoD line "All 29 FSPEC acceptance tests pass"; the **Residual risks** table, which carries one open-erratum row (RK-5's leading-underscore predicate) and not this one. | **Partly — F-01.** Every task remains executable and correct *as written against BR-16*, so nothing here blocks. But one of the three re-stamp sites the TSPEC names is a PLAN-owned assertion, and the PLAN's own inheritance mechanism does not mention it. See Delta-Confirmation Findings. |

## Dependencies

Nothing in the TSPEC delta touches the PLAN's ordering, and I checked the three places where it could
have.

- **Batch graph.** The erratum rounds changed no type, signature, exit code, oracle or code sketch —
  each round's changelog says so and the diff bears it out (the only structural insertions are
  changelog rows, §4.3's two new paragraphs and §8.3's new bullet). The PLAN's 27 tasks over 11
  batches therefore depend on the same seams they did at approval, and the batches-3-to-7 serial
  chain over `pdlc/workflows/lib/stats.mjs` is unaffected.
- **The `K-7` / `K-8` pair.** D-2's re-scoping ("the two sibling-feature document edits sit outside
  the ten") is a wording correction to how the cost is *counted*, not to who owns it. `DEC-STATS-01`'s
  `K-7` still owns both sibling documents, T-22 still executes them in one versioned change, and
  T-23 still re-bases `loop-distribution.test.js` behind it in batch 10. No dependency edge moves.
- **The open-erratum item (D-5) creates no new dependency.** §4.3 decides to implement BR-16 now and
  route the reconciliation to the owning phase, so no PLAN task blocks on the reconciliation landing.
  This is why F-01 is Medium and not High: the gap is inheritance of a named risk, not a blocked or
  mis-sequenced task.

## Verification

What I re-measured at HEAD rather than taking from either document.

- `shasum -a 256` on the three upstreams matches the dispatch pins: REQ `5f3e8051…`, FSPEC
  `c7d2c832…`. My v2 approval pinned `TSPEC 512a9fcf…`; HEAD's TSPEC is `a06a6032…`, confirming the
  cascade is real and single-upstream (REQ and FSPEC also moved since `628cf244`, but they moved
  *before* the pins this dispatch carries, and v1.6/v1.7 absorbed them — the TSPEC is the only
  upstream whose absorbed state changed relative to my PLAN approval).
- `git diff --stat 628cf244..HEAD` on the TSPEC: 153 insertions, 22 deletions across §1, §2.1, §4.3,
  §6.4, §7.3/RK-1 and §8.3 — the six passages walked in `## Batches`. No other section moved, so
  no PLAN claim outside those six could have been invalidated by this cascade.
- PLAN v1.1 is byte-identical to the version I approved apart from a one-line change (`git diff`
  shows `1 insertion, 1 deletion` on the PLAN across the same range), so this is a genuine
  own-bytes-unchanged confirmation and the delta re-review protocol's "scan only changed sections"
  rule applies to the *upstream* diff, which is what I scanned.
- The PLAN's seven-entry `c8.include` measurement, its ten-row site table and its "three `lib/`
  modules at HEAD" claim were all re-confirmed against the tree in my v2 review and none of them is
  disturbed by the TSPEC delta; D-1 in fact retires the last disagreement between the two documents.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor |
|----|----------|-----------|----------|----------------|
| F-01 | Medium | delta | nonlocal | `## Residual risks carried into implementation` (and T-04 / the AC coverage table's `AT-17` row / the DoD's "All 29 FSPEC acceptance tests pass"). TSPEC §8.3 now reads "**Two** remain open", and the second open erratum — REQ-STATS-06 v1.6 ("a grammatical basename outside the driver's document-type catalogue is **a survivor**", so a directory holding only those is **measured**) against FSPEC BR-16 v1.7 (same file counts as no file remaining, directory reports **`harvested`**) — decides the expected value of a named acceptance test. §4.3 says so in terms: AT-17's fourth leg "is the single place the contested scoping above becomes an assertion", and it is one of exactly three sites that re-stamp when the reconciliation lands. The PLAN routes AT-17 wholly to T-04 ("AT-17's four directories") with no marker, and its Residual risks table — the table whose stated purpose is "Named so the DoD reviewer inherits them rather than discovering them" — carries the *other* open erratum (RK-5's leading-underscore predicate, with an explicit blast radius) and not this one. Fix: add one Residual row sourced to TSPEC §8.3 / §4.3 — contested REQ-STATS-06-versus-BR-16 scoping, blast radius `computeFeatureStats`'s harvested disjunct plus T-04's AT-17 fourth-leg expectation, disposition "T-04 asserts BR-16's `harvested` as TSPEC §4.3 directs; re-stamps if the reconciliation lands on REQ-STATS-06's reading" — and a half-sentence in T-04 flagging that leg. No task, dependency or DoD item changes. |

FINDING: Medium | delta | nonlocal | Residual risks table does not inherit TSPEC §8.3's second open erratum (REQ-STATS-06 v1.6 vs FSPEC BR-16 v1.7), whose reconciliation re-stamps T-04's AT-17 fourth-leg expected value

Provenance is `delta` because the TSPEC edit under confirmation is what created the second open
erratum — at the version I approved the PLAN against, §8.3 said "One remains open" and the PLAN's
single provisional-erratum row was a complete inheritance. Locality is `nonlocal` because the PLAN's
own bytes did not move, so no PLAN section is inside the round's edit. Severity is Medium, not High:
no acceptance criterion is dropped, narrowed or reinterpreted by the PLAN, every task is executable
as written, and the TSPEC has already made the interim choice (implement BR-16) that keeps
implementation unblocked. What is missing is the hand-off of a named, upstream-acknowledged risk to
the DoD reviewer — a completeness gap in the PLAN's own inheritance mechanism, not a fidelity break.
Scope, for the harvest phase, is `Local`: the row belongs in this feature's PLAN, and the general
lesson (a downstream document's residual-risk table should be re-checked whenever an upstream's open-
erratum count moves) is already carried by the cascade-confirmation protocol itself.

## Questions

## Positive Observations

## Recommendation

## Verdict
