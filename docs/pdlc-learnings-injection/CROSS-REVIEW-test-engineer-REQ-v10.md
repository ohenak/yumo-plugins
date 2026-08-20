# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 10
**Round type:** delta confirmation under decision freeze — delta present (`a2353445`, erratum v0.9)
**Scope:** the v0.9 diff (`386e4f0c..a2353445`, +14/-8, four hunks) and the three findings v9 left open.

## Problem / Context

Round 9 was a no-delta round: the erratum dispatch had not landed, so its three findings
(F-01 High, F-02 Medium, F-03 Low) stood against unedited bytes. Round 10 has a real delta.
`a2353445` ("REQ erratum v0.9 — v9 findings: unlistable divergence, AC-3.1 closure scope")
touches exactly four passages: the changelog row, §1.2 claim 2, AC-3.1's closure sentence with
an adjacent AC-3.2 clause, and AC-5.1b's sibling-reader attribution. That is one passage per
routed item plus the version bump, with no collateral edits elsewhere in the 493-line document.

All three routed items landed, and all three landed *correctly against HEAD source* — I
re-derived each code claim from the working tree rather than accepting the erratum's own
account of it. F-01, which had survived three rounds, is now stated in terms that match
`consolidate-learnings.js` line for line and, more importantly, names the divergence the
previous phrasing concealed. No High finding remains open.

Under the decision freeze, two observations about the delta are recorded as Low findings and
one as a `DEFERRED:` line; none meets the blocking bar, since none is a defect the delta
introduced and none contradicts the repository at HEAD.

## Goals

- Confirm the v0.9 delta resolves v9's F-01, F-02 and F-03 without breaking approved sections.
- Re-verify every code-level premise the delta touches directly against HEAD, not against the
  erratum's summary of HEAD.
- Scan only the four changed passages for new issues, and check the delta against the sections
  that cite them (§1.3, C-3, AC-3.3) for contradictions the edit could have opened.

## Non-Goals

- Re-litigating unchanged sections already approved in earlier rounds.
- Opening any new decision. The round is frozen; improvements I would have argued for in an
  open round are recorded as `DEFERRED:` lines, not findings.
- TSPEC-altitude mechanics. Findings below ask only whether the REQ's black-box observables are
  writable as tests today and whether its premises match shipped code.

## Constraints

- Decision freeze: a finding blocks only if (i) the delta broke something that worked before, or
  (ii) a load-bearing claim contradicts the repository at HEAD. Neither applies below.
- Delta-confirmation tagging: findings carry `{delta|inherited}` and `{local|nonlocal}`. Both
  Lows below are `delta, local` — introduced by this edit, inside the passages it changed.
- REQ altitude: findings ask only for black-box observables. Where the delta's wording affects
  what a completeness or oracle test can assert, that is in-lens; where it affects test-double
  or seam design, it is not, and I have not filed it.
- Rigour bar: any open High, old or new, means Needs revision. There is none.

## Delta disposition

| Check | Result |
|---|---|
| Last REQ commit | `a2353445` (erratum v0.9) — new since v9's `386e4f0c` |
| `git diff 386e4f0c a2353445 -- REQ` | 4 hunks, +14/-8 |
| Sections changed | changelog row; §1.2 claim 2; AC-3.1 closure sentence + AC-3.2 mirror clause; AC-5.1b attribution |
| Collateral edits outside routed passages | none |
| Working-tree modification to REQ | none (`git status --short` shows only `.claude/workflows/.pdlc-drift-state.json`) |
| Version / changelog | header now 0.9, changelog row names all three fixes |
| Size budget | 493 lines / 40,164 bytes — inside the 700-line, 60 KB REQ budget |

## Routed-item disposition

| # | Routed item (v9 id) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | F-01 High — §1.2 claim 2 asserted a fail-open-on-unlistable outcome the sibling does not ship, and sourced it to DEC-CONS-05 | **Yes, and correctly** | REQ:71-75 now reads "Its listing failure is **not** fail-open: `consolidate-learnings.js`'s `enumerateCorpus` is total — it returns an unlistable outcome rather than throwing — but the pass around it then marks itself `failed` and stops on that outcome. This feature deliberately diverges and fails **open** (`RSN-UNLISTABLE`, AC-3.2) … (G-4, C-7)". Both halves verified: `enumerateCorpus` returns `{unlistable: true, detail}` on a non-ok reply (`pdlc/workflows/consolidate-learnings.js:1348-1355`), and the pass sets `state.status = "failed"` and returns `finishPass` on that outcome (`:587-593`, comment "§10.3 row 1a — `failed` … Never `no-op`"). The DEC-CONS-05 citation is gone from the fail-open sentence; the surviving use at REQ:79-80 ("one predicate, two enumerations, and nothing in it claims readers agree on sets") matches the decision's own title (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:54,:422`) |
| 2 | F-02 Medium — AC-3.1's closure carve-out named only AC-3.3, leaving erratum v0.8's co-located AC-3.2 fields undecidable | **Yes** | AC-3.1 REQ:315-320 now scopes the closure explicitly — "that closure is over each **selected document's row**, not over the dispatch record as a whole. AC-3.2's per-dispatch not-selected rows and corpus-level outcomes, and AC-3.3's rule inputs, share the dispatch record but sit outside AC-3.1's set, each closed by its own completeness test at the loci AC-3.2 and AC-3.3 name." A test author can now mechanically place every field. Cross-checked against AC-3.3's own closure sentence (REQ:345, "set equality, one per locus, as AC-3.2's catalogues do") — consistent, no second reading left |
| 3 | F-03 Low — AC-5.1b's unattributed "the sibling reader" | **Yes** | AC-5.1b REQ:391-393 now names `orchestrate-dev.js`'s `parseImplementationConfig`. Verified: `parseImplementationConfig` (`pdlc/workflows/orchestrate-dev.js:191`) returns `IMPLEMENTATION_DEFAULTS` with `sectionMalformed: true` for a non-object section (`:209`), and the wave-mode caller emits the operator notice (`:14128-14134`) |

No routed item is partly landed, and no previously approved section changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **(delta, local)** AC-5.1b attributes the notice to the reader, but the reader only returns a flag. REQ:392-393 says the malformed section "yields defaults plus an explicit operator notice" of `parseImplementationConfig`; at HEAD the function returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}` (`orchestrate-dev.js:192-209`) and emits nothing — the notice is the caller's, at `:14130-14134`, and the function's own JSDoc says so ("The caller emits a notice naming each degraded key", `:300-301`). The second call site keeps only `.config` (`:11913`) and drops the flag, so at that site the same malformed section yields defaults with **no** notice. The precedent AC-5.1b leans on is real — defaults plus notice is what the shipped pipeline does in wave mode — so this does not disturb the decision; it is an attribution imprecision that a TSPEC author pinning "the reader reports" would encode as the wrong seam. **Fix (non-gating):** attribute the notice to the caller — "…yields defaults, on which its caller emits an explicit operator notice (`orchestrate-dev.js:14130-14134`)". | AC-5.1b (REQ:391-393) |
| F-02 | Low | Local | **(delta, local)** AC-3.2's new mirror clause exempts a report field from every oracle. The run-level mirror is now "additive, is not the oracle, and has a **deliberately unconstrained value that nothing asserts on**" (REQ:326-327). The pre-delta text already made the mirror non-authoritative, so falsifiability of the per-dispatch oracle is unchanged and nothing regressed — but the added clause goes one step further and licenses an operator-visible field that no test may constrain. A mirror carrying a value that contradicts the per-dispatch record it mirrors would then be undetectable by the suite and still green, while an operator reading the report top-down sees the contradiction first. Recorded rather than raised: it is a decision the author took inside a frozen round, and the AC that carries the oracle (the per-dispatch corpus-level outcome, present with AC-3.1's rows empty) remains positively asserted. **Fix (non-gating, or defer to TSPEC):** either drop the clause and stay silent on the mirror, or bound it with one consistency assertion — if a mirror is carried, it agrees with the dispatch records it summarises. | AC-3.2 (REQ:326-327) |

DEFERRED: AC-3.1's set-equality test is vacuous for a dispatch that selected nothing, now that the closure is scoped to each selected document's row — AC-3.2's "that dispatch's AC-3.1 rows are present and empty" is what actually holds that case, and TSPEC should route the empty-dispatch assertion there rather than to AC-3.1's completeness test.
DEFERRED: §1.2 claim 2 now carries three code claims in one sentence (totality of `enumerateCorpus`, the pass's `failed` transition, this feature's divergence); TSPEC should pin the first two against `consolidate-learnings.js:1348-1355` and `:587-593` as a literal restatement pin, per C-3/O-7's existing pinning discipline, so a future sibling change surfaces as a red test rather than a stale premise.

## Questions

None. The delta answers everything v9 asked, and no new question arose in the changed passages.

## Risks

- **F-01's divergence is now stated but not yet owned by a test.** The REQ says this feature
  fails open where the sibling fails its run. That is exactly the kind of deliberate divergence
  a later reader "corrects" back to parity. It needs to reach PROPERTIES as a positive
  assertion — dispatch proceeds, `RSN-UNLISTABLE` recorded, run not halted — not merely as
  prose in §1.2.
- **The `RSN-UNLISTABLE` path is the one corpus-level outcome with no natural fixture.** It
  requires a failing `git ls-files` reply, so it will be reached through the injected git seam.
  A suite that never exercises it leaves the feature's most-argued behaviour unproven while
  every catalogue set-equality test still passes.
- **Ten rounds of erratum edits on one document.** The changed passages are correct, but §1.2
  claim 2 has now been rewritten in four separate rounds. TSPEC should treat it as pinned text
  rather than paraphrasable background.

## Obligations

- Both Lows are single-clause edits and neither blocks. They can ride the next erratum touching
  this document, or be absorbed at TSPEC time, at the author's discretion.
- O-7's pinning obligation now covers more surface than when it was written: the restatement pin
  should cover the pass-side failure transition, not only `LS_FILES_ARGV`.

## Positive Observations

- **F-01 is fixed in the strongest available form.** The erratum did not merely delete the false
  clause; it replaced it with a checkable mechanism ("`enumerateCorpus` is total … the pass around
  it then marks itself `failed`") and then named the divergence and sourced it to G-4 and C-7.
  Both halves verify against HEAD without adjustment, and the misattributed DEC-CONS-05 citation
  is gone from the sentence it did not support while the citation that *is* supported survives.
- **AC-3.1's new closure sentence resolves the contention exactly.** It answers the question
  erratum v0.8 opened — which fields belong to which closed set once three catalogues share one
  dispatch record — by scoping the closure to the row rather than by adding a second carve-out.
  Three loci, three completeness tests, no field unclaimed. The "write the test right now" check
  passes on all three.
- **The delta is minimal and legible.** Four hunks, one per routed item plus the version bump,
  no collateral drift, changelog row naming all three fixes. Round-over-round diffs of this
  shape are what make delta confirmation cheap and reliable.
- **Verification held at HEAD across the whole premise section**, not just the edited clause:
  the two `:(glob)` pathspecs still match the "one level under `docs/` and one under
  `docs/completed/`" claim (`consolidate-learnings.js:1337-1346`), and the vendoring premise
  behind C-3/G-6 still holds — `prepack.mjs`'s `MODULE_NAMES` is exactly
  `["orchestrate-dev.js", "orchestrate-queue.js"]` (`pdlc/engine/scripts/prepack.mjs:20`).

## Recommendation

**Approved with minor changes**

No High findings remain. All three items routed by v9 landed, each verified against HEAD source
rather than against the erratum's description of it, and no previously approved section was
disturbed. The two Low findings are attribution and scope-of-assertion refinements that do not
block, and the two `DEFERRED:` lines are TSPEC-time routing notes, not REQ defects.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
APPROVAL-HASH-NORMALIZED: sha256:6a9544d4bbf0f0c09fbb863337f8cb41c5afec98138a76c47a7b40216bf5a958
REVIEWED-COMMIT: a2353445280c5f08b8938da272ba4e42ec9becb9
