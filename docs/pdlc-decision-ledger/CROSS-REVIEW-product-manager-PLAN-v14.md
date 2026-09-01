# Cross-Review: product-manager — PLAN (round 14)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-09-01
**Iteration:** 14 (delta confirmation — erratum-absorption round)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Summary

This round asks one narrow question, and I judged only that question: are the three rewritten PLAN loci
truthful against TSPEC **v1.4** and the shipped code, does the v1.1 → v1.2 delta stay inside the author's
claimed no-move envelope, and does my round-13 approval still hold? The delta is `8 insertions(+),
6 deletions(-)` in one file — five hunks: the header TSPEC pin, the status row, the new revision entry,
and the three named loci. It is an erratum absorption: TSPEC corrected **itself** (v1.3 → v1.4) to match
code that was already right, and the PLAN, which had faithfully reproduced the two inverted claims, is
corrected on the same axis. No product surface moves. **Approved, no findings.**

## The three loci

I checked each against `pdlc/workflows/orchestrate-dev.js` at HEAD and against TSPEC v1.4, not against
the author's account of either.

**(1) The reuse-surface row (§HEAD-verified reuse surface, ~:122).** It previously said `reviewLoop` and
`reviewerPrompt` each gain a parameter. That was false in both directions of interest: `reviewLoop` does
gain `_injectDecisionLedger = null` (`:9680`), but `reviewerPrompt` is untouched — its declaration at
`:11906` is `function reviewerPrompt(doc, phase, feature, iteration, reviewer, docType, frozen = false,
findingGrammar = false)`, eight parameters, no ledger argument, with a standing source comment recording
that a ninth was unreachable and removed. The revised row names `dispatchAndVerify` as the second symbol,
states that `reviewerPrompt`'s return becomes its `basePrompt`, and cites TSPEC §2.4 alongside §4.5. TSPEC
§4.5's shipped-signature block says the same thing in the same words. Truthful.

**(2) T-18's `[green]` instruction (~:174).** The old text told the implementer to add `ledgerBlock = ""`
to `reviewerPrompt` and append on its two return paths — an instruction that, followed literally, produces
dead code. Shipped: `dispatchAndVerify` destructures `ledgerBlock = ""` (`:11485`) and builds
`` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` `` (`:11616`);
`reviewLoop` computes the block once per round at `:9995` as `await _injectDecisionLedger({ feature,
phaseId: phase, docType: roundDocType, round: iteration })` and forwards it as the trailing argument of the
`wrapped` / `runWrapped` closures (`:9759`, `:9785`, `:10030`, `:10038`). The revised instruction reproduces
exactly that, including the four-field payload and the reason the builder-side append was unreachable
("appended last" is true of the **delivered** prompt, not of one builder's return). The four bindings match
§5.1's `DecisionLedgerDispatchRecord` (`phaseId: string | null`, `docType: string | null`, `round: number`),
which is the field set TSPEC's erratum item 1 says was already correct and needed no change. Truthful.

**(3) The §Integration points row (~:335).** It named `reviewerPrompt`'s parameter list as the touched
surface; it now names `dispatchAndVerify`'s option object and the two dispatch closures that reach it, and
states explicitly that `reviewerPrompt`'s parameter list is unchanged. That is what the code shows and what
TSPEC §2.4 states. Truthful.

## The no-move envelope

**Verified mechanically, and the envelope holds.** I diffed the delta handed to me against the live working
tree diff — byte-identical — and confirmed `git diff HEAD --stat` reports the PLAN as the only changed
document. Within it: T-18's task id, batch (`8`), `Deps` (`T-10, T-10a, T-11, T-17`), Test File and Source
File cells are byte-identical across the hunk; no other task row appears in the diff at all, so the
file-ownership manifest, the red-before-green edges table, the §Definition of Done checklist, the batch
arithmetic paragraph, every Status cell and every measured value are untouched. T-18's other invariants
survive inside the rewritten cell — the destructured flag read against PROP-DIS-06, the conditional-spread
`report.decisionLedger`, the writes-no-census-constant rule, the delta-coverage obligations and the un-skip
list (T-10, T-10a, T-11) are all still there and still worded as approved. This corroborates the
orchestrator's parsed wave-plan hash being unchanged; the two signals are independent and they agree.

## Upstream re-grounding

**Re-measured, not taken on trust.** `shasum -a 256` at HEAD: TSPEC `b8dcac11a521…1246db6d`, which is the
pin the v1.2 header now carries, and the TSPEC status row reads `1.4 | 2026-09-01`; REQ `9bc8bc32…05f10d`,
FSPEC `48691453…a11256`, DECISIONS `48e73a41…880240` — all three byte-identical to the v1.1 header, correctly
left unrewritten. TSPEC v1.4's own changelog declares two self-corrections against that document, mints or
retires no `BR-`/`AC-`/`E-`/`M-`/`O-`/`ERR-` id, and moves no threshold, byte literal or measured value; I
read §9.2 rather than the PLAN's summary of it, and the summary is accurate. So nothing in the P0/P1
requirement set moved, and nothing was owed absorption beyond the three loci.

## Product-lens judgement

No requirement, acceptance criterion, priority ordering or scope boundary is touched by this delta. The
correction is about *where in the module* a string is concatenated; the observable product contract —
flag-off byte-identity (`REQ-DECLEDGER-02`), the ledger block reaching each reviewer dispatch exactly once
per round, the disclosure surface at T-19, REQ NG-6's no-`SKILL.md`-edits constraint — is unchanged, and the
rewritten text describes the mechanism that actually delivers it. Under the High-only bar there is nothing
to raise: my round-13 approval was of a document whose task instructions were, at three loci, describing an
unreachable wiring; v1.2 makes those instructions match shipped reality, which strictly improves the
approval's basis rather than disturbing it.

DEFERRED (restated, unchanged from v13, not defects here): `PROPERTIES-pdlc-decision-ledger.md` pin
re-grounding is PROPERTIES-phase work; the §Definition of Done "24 tasks ✅" bullet is still verified by
manual read of the Status column rather than mechanically.

## Delta-Confirmation Findings

No findings.

## Positive Observations

- **The correction was made at every locus the inversion reached, not only where TSPEC flagged it.** TSPEC's
  erratum named its own sections; the author independently found the three places this document had
  reproduced the claim, including the easily-missed §Integration points row, and left no half-corrected
  mention behind — the failure mode that makes an erratum round worse than none.
- **The claim was made checkable.** The revision entry states the shipped signature and the shipped
  concatenation expression verbatim, so a reviewer confirms it with two greps instead of reconstructing the
  call graph. That is why this round was cheap.
- **The envelope was declared before it was audited.** Naming the invariants that must not move — task id,
  batch, deps, ownership cells, measured values — converted my job from an open-ended re-read into a
  falsifiable check, and the declaration turned out to be exact.

## Recommendation

**Approved** — no findings. The three loci are truthful against TSPEC v1.4 and against shipped code, the
delta stays strictly inside the claimed no-move envelope, and the round-13 approval holds.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841
APPROVAL-HASH-NORMALIZED: sha256:1bdbd2a1b2ea237684ce9134fa5813431a5af220d69fda317f3a11345f7852bc
REVIEWED-COMMIT: e366596b8f905bc7bc5da9a6e28cf276ae5ca629
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
