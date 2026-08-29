# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-29
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, over
`git diff bc06b9bba..HEAD` on the document (106 insertions, 38 deletions across eight commits
`6229b0b05`…`ae0a4a5f0`). Only changed sections were scanned for new issues; sections approved in
round 1 were not re-litigated.

## Prior findings — disposition

| v1 | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | All three misattributed AT rows now name the property that *states* the criterion. `AT-15` leads with **PROP-BND-10** ("absent in full, no fragment") and demotes `-05/-06/-11` to the guarantees the drop relies on; `AT-17` leads with **PROP-INV-04** ("states the criterion verbatim"); `AT-02` now reads `PROP-REND-03, PROP-FAIL-05`, which is byte-for-byte ORC-02's own `Decides` line (`:483`). `AT-16` was correspondingly re-pointed to `PROP-INV-01, -02, -03`, and PROP-INV-01 (`:372`) does state that row's criterion — the five named driver-side outcomes identical across the flag. The BND block header's AT-13/AT-15 claim is now discharged by an explicit twelve-way split (`01…04, 07, 12` at AT-13; `08, 09` at AT-14; `05, 06, 10, 11` at AT-15), which I checked covers each of the twelve exactly once and agrees with the AT rows as rewritten. |
| F-02 | Medium | **Resolved** | The `BR-11 / NG-4` row now discharges to **PROP-INV-06** (the source census cloning `loopEconomicsAnchorGuard.test.js`) with `-07`/`-08` as non-vacuity guards, and says in terms that "PROP-DISC-07 is a repo-hygiene count and discharges nothing here". The INV family's `Traces` line already cited `FSPEC` BR-11 and `REQ` NG-4, so the pointer and the coverage now agree. |
| F-03 | Medium | **Resolved, with a residue** | `T-00a` and `T-20` are both traced now, and I verified every one of `PLAN`'s 24 task ids appears in the document. `T-20` owns PROP-DISC-08, matching `PLAN`:121, which names `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` in its ownership rows. The residue is *how* T-00a and T-12a were split — F-01 below. |
| F-04 | Medium | **Resolved** | The pyramid is now a partition and the arithmetic holds in both directions: `10+11+9+6+12+11+5+10+11+6+10 = 101` by family, and `36 + 12 + 37 + 6 + 10 = 101` by level, with OFF and DISC given their own buckets instead of being left outside the breakdown. The document also says plainly where the old "47 / 11 / 37" reading went wrong. |
| F-05 | Low | **Resolved** | FAIL's `Traces` now cites `TSPEC` §6.1 **F-14** explicitly, with the case named ("no directory among the three globs, or a directory yielding zero records — PROP-FAIL-11"). |
| F-06 | Low | **Partly resolved** | The REC half is fixed — AT-01 now says ORC-01 decides `PROP-REC-01…08` and places `-09…11` at the cheaper levels the corpus oracle cannot reach, matching ORC-01's `Decides` line (`:435`). The REND half was not — F-03 below. |
| Q-01 | — | **Answered** | AT-14 now says PROP-FAIL-06 is on that row **deliberately**, and gives the reason: a corpus reading to zero records shares E-6's byte outcome, and PROP-FAIL-06 is the only conjunct separating it from a *failed* read behind identical bytes. PROP-OFF-06 was added as the property that states the criterion. |
| Q-02 | — | **Answered, and acted on** | ORC-04 (b) now requires the capture to be invoked with a resolved 40-hex sha and adds a `/^[0-9a-f]{40}$/` assertion on the recorded value. I confirmed the underlying mechanism: `runCaptureScript` forwards `mergeBaseRef` to `_captureFixtures`, which writes `mergeBaseSha: mergeBaseRef` verbatim (`scripts/capture-learnings-baseline.mjs:96,132`), so a symbolic ref would indeed be recorded as a ref string. |
| Q-03 | — | **Answered** | The twelve-module enumeration is now a table (§Module manifest) rather than a note inside PROP-DISC-07, with an owning `PLAN` task and batch per module. |

## Findings

Three findings, none High. All three are traceability repairs inside text this round added; no
property is re-derived, no fixture or byte literal moves, and no acceptance criterion is affected.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **PROP-DISC-07 relocates the terminal `102` conjunct to a task `PLAN` says does not carry it, and leaves T-12a's actual obligation with no property.** The new sentence reads "the terminal conjunct — the filtered count is still `102` once all twelve exist — is `PLAN` **T-12a → T-19**, batch 9." `PLAN` says otherwise in two places. T-00a's own acceptance is "two-sided: the exclusion lands **and** the filtered count is still `102` after this PLAN's twelve new modules exist" (`PLAN`:99), so the count conjunct is T-00a's; and T-12a's terminal conjunct is a *different* assertion — "the set of `pdlc/workflows/__tests__/decisionLedger*.test.js` module names is **set-equal** to the twelve names hand-transcribed from this PLAN's file-ownership manifest … **It is a set, not a count**" (`PLAN`:104). The consequence is a real coverage gap, not just a mis-citation: I checked all ten DISC rows and **no property states T-12a's twelve-name set-equality census**. PROP-DISC-07 is a count over the *complement* — the document says so itself two paragraphs later ("it does not count this feature's own modules") — so the assertion that names a dropped or renamed `decisionLedger*` module is specified nowhere. §Module manifest's claim that the mapping "is set-equal to `PLAN`'s manifest in both directions" is exactly the claim T-12a's census would make checkable in code; right now it is checkable only by a human reading two documents. **Fix:** give T-12a's set census its own row (PROP-DISC-11, set equality over the twelve module names, owner T-12a → T-19), and return PROP-DISC-07's terminal count to T-00a's acceptance as `PLAN` states it. See also the `PLAN` erratum raised alongside this review — `PLAN` itself is ambiguous about when T-00a's second conjunct becomes satisfiable, which is plausibly what prompted the relocation. | `FSPEC` Q-3; `REQ` NG-6 |
| F-02 | Medium | Local | **A fourth BND range survives the reconciliation that claims to cover them all.** The new paragraph is titled "**The three BND ranges quoted elsewhere, reconciled once here**" and enumerates `01…07` (the conjunct table), `01…12` (the family) and `01…04` (the members carrying a named falsifying mutation). But §Overview's O-8 obligation row still reads "**PROP-BND-01…06** (`TSPEC` §7.5's four conjuncts, each with its own falsifying mutation)" (`:61`) — a fourth range, and one that is self-inconsistent on its own line, since `01…06` is six ids described as "four conjuncts". It also disagrees with both of the document's other O-8 discharges, which now read `PROP-BND-01…04` plus `-07` (`:889`) and `PROP-BND-01…04`, `-07`, `-12` (`:873`). O-8 is an `FSPEC` §7 obligation assigned to te-author and the document names discharging it as its "completion condition", so a reader auditing O-8 lands on the one range the reconciliation does not mention. **Fix:** restate `:61` as `PROP-BND-01…04` (the four conjuncts, each with its own mutation) with `-07` named as the model discipline that keeps `-03` falsifiable, matching `:873`/`:889`, and add it to the reconciliation paragraph's enumeration so the "three ranges" claim is true. | `FSPEC` O-8; `REQ-DECLEDGER-07` |
| F-03 | Low | Local | **AT-01's rewrite fixed the REC half of v1 F-06 and left the REND half wrong.** The row now reads "ORC-01 (which decides **PROP-REC-01…08** and PROP-REND-01…09 against the frozen corpus)". ORC-01's own `Decides` line is "PROP-REC-01…08, PROP-PRE-01…05, and `FSPEC` AT-01" (`:435`) — it names no REND property at all, and names a PRE range the AT-01 row does not mention. The document's own §Module manifest confirms the REND properties are not ORC-01's: `PROP-REND-01…09` live in `decisionLedgerRender.test.js` under T-06 → T-15 (batch 2 → 5) as pure-unit properties, while ORC-01 is a corpus oracle owned by T-09 → T-17 (batch 2 → 7). So nine properties are attributed to an oracle in a different module and a different task. **Fix:** on the AT-01 row, list `PROP-REND-01…09` as discharging the AC at the pure-unit level alongside ORC-01 rather than as decided *by* it — the same construction the row already uses correctly for `PROP-REC-09…11`. | `REQ-DECLEDGER-01` |

## Questions

## Positive Observations

## Recommendation

## Verdict
