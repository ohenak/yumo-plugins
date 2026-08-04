# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 7
**Scope:** Delta confirmation of the Phase PR erratum round only (TSPEC v1.2 → v1.3, commits `77f81ca`, `657ae5a`, `75281a3`, `7e9ea4e`, `9d49cdc`, `2e8227e`). Not a re-review of the document; every section outside the edited passages was approved at v5 and re-confirmed at v6 and is not re-litigated.

## Delta reviewed

Six routed erratum items collapsing to **three distinct defects** — three of the six are the same §11.1 grep-token defect (se-review ×2, te-author ×1), two are the same `waitMs` surface gap (se-review, te-author), and one is the A1 passing-stub defect I raised myself.

| # | Routed item (raisers) | Edit that answers it | Where |
|---|---|---|---|
| 1 | A1's `verifyGate = async () => ({ passed: true })` is the trivially-passing stub FSPEC T-03-6's gate-exclusivity criterion treats as a falsifying mutation (pm-review) | A1 **and** A3 now declare `verifyGate: null`; §4.3's typedef makes the member nullable and states why the driver never invokes a `null` gate; §5.5, §6.3 and §7.2 all carry the same reason (`permittedActions: []` ⇒ step 3's envelope gate refuses ⇒ step 6 unreachable ⇒ `resolved` never reached), and §5.5 says outright that the passing stub "must not appear as a shipped implementation" | `TSPEC:416-419` (typedef), `:434-438`, `:655`, `:657`, `:740`, `:865` (commits `77f81ca`, `75281a3`) |
| 2 | `SeamOps` declares no member through which a seam reports `waitMs`, so PROP-BUD-03 has no surface to assert against (se-review, te-author) | §4.3 gains a paragraph stating `SeamOps` stays at **nine** members and that `waitMs` is deliberately not a tenth: `runAdvisorySeam` owns the counter and passes a `recordWait(ms)` sink into seam construction that only A5 calls, so the asserted surface is the `waitMs` argument the driver hands `budgetExceeded`. §4.5 and §8.2 (A5-3) are restated to match | `TSPEC:424-429`, `:489-492`, `:1015-1016` (commits `77f81ca`, `657ae5a`) |
| 3 | §11.1's "a grep for `advisory.enabled` returning exactly three sites" matches one site, not three (se-review ×2, te-author) | §11.1 replaces the sentence with a matcher-and-set statement: the scan is `/\.enabled\b/` over the named file set `orchestrate-dev.js` + `orchestrate-queue.js` only (never `dist/*.bundle.js`, which inlines both and would double every hit), expecting **exactly three** matches, enumerated; `parseAdvisoryConfig`'s body is explicitly sliced out before counting, and the report's disabled/enabled-but-quiet distinction is stated as derived from `_state`, not from a fourth `enabled` read | `TSPEC:1263-1283` (commit `7e9ea4e`) |

Also in the delta: front-matter version 1.2 → 1.3 and a §18 row describing all three edits.

**Verification performed against source, not accepted on assertion:**

- **The unreachability argument is the document's own rule, not a new one.** §6.3 gives A1 `permittedActions: []` with "any proposal is `out-of-envelope`" (`TSPEC:737`), and §4.4's step table puts the envelope gate at **step 3**, before ACT (step 4) and VERIFY (step 6) (`TSPEC:445-461`). So "never reaches step 6" follows from an ordering already approved at v5; the edit invents no new gate.
- **The nullable member is never dereferenced as `null`.** §4.3's claim that the driver reaches `verifyGate` only on a non-empty `permittedActions` holds for the one seam that computes the field per invocation: A5's `permittedActions` may be `[]` (`TSPEC:994`), and in that case the same step-3 refusal applies before step 6.
- **`verifyGate: null` for A1 is faithful to the REQ.** REQ AC-4.5's gate table gives A1 "**none** — A1 changes no file … n/a — pre-condition, not post-action gate". `null` is the literal expression of that row; the previously-shipped passing stub was not.
- **The downstream documents already say what the TSPEC now specifies.** PLAN A-31 asserts "`verifyGate == null` and `resolved` unreachable at A1 at all" (`PLAN:282`, `:869`), and PROPERTIES' own revision note records A3 joining A1's stronger unreachability form at SE F-01 (`PROPERTIES:19`). The erratum closes the TSPEC↔PLAN/PROPERTIES gap in the direction the downstream documents had already converged on, rather than forcing them to move.
- **PROP-BUD-03 now has the surface it lacked.** `PROPERTIES:408` asserts over `arg.waitMs` — the argument the driver passes — with a positive control, and `PROPERTIES:411` records explicitly why the property is not stated over `SeamOps`. §4.3's "nine members, `waitMs` is not a tenth" and that property agree.
- **The §11.1 matcher matches PROP-DIS-06 verbatim.** `PROPERTIES:787` and `:796-812` carry the same matcher (`/\.enabled\b/`), the same two-file set with the same `dist/*.bundle.js` exclusion and the same reason, the same expected count of three with the same enumeration, and the same `parseAdvisoryConfig` slice — plus a grounding check that both modules currently return 0. The TSPEC's "PROPERTIES transcribes this verbatim as PROP-DIS-06" is a claim I could falsify and could not.
- **The three enumerated sites are the three the document actually describes.** Driver early return (`config.enabled === false`, §4.4 entry row), config-notice emit gate (`advisory.config.enabled`, §3.2), distil-step guard (`advisory.enabled`, §9.3) — three different spellings, which is exactly why the old token-grep found one. The restatement names the divergence rather than silently normalising it.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings. All three distinct defects are resolved at the site each was raised against, and nothing I approved at v5/v6 moved. | — |

**Nothing previously approved was broken.** The delta is additive prose plus one type-level widening and one sentence replacement:

- **No requirement mapping changed.** §17's traceability row `ADV-03 | REQ-ADV-04 | §5.4, §5.5 | structural non-calls + SeamOps.verifyGate` (`TSPEC:1480`) still resolves: §5.5 still names a `verifyGate` disposition for all five seams, and A1/A3's disposition is now the one REQ AC-4.5's own table describes. AC-4.5's "Given a resolution is applied" antecedent is unaffected — A1 and A3 apply nothing by construction (A1-4, A3-6).
- **No prohibition weakened.** P-1's reliance on "A3's `permittedActions` is `[]`" (`TSPEC:634`) is untouched, and the A1/A3 edits *strengthen* the same argument by removing the one shipped artefact that could have been mistaken for a passing gate.
- **No budget, enum, error-handling row, or acceptance criterion moved.** §4.5's arithmetic is character-for-character the same relation (`elapsedMs - waitMs >= seamBudgetMinutes * 60_000`, NFR-4); only the provenance sentence for `waitMs` changed. `SeamOps`' member count is explicitly held at nine, so no seam implementer inherits a new obligation.
- **§11.1's claim is narrowed to what is true, not weakened.** The old sentence asserted three sites and named a token matching one — an assertion that would have passed as written only by not being run. The new one is stricter (a named file set, an explicit exclusion of the `dist/` copies, an explicit exclusion of the parser body, an exact count) and is now mechanically checkable. D-1/D-2's product claim — one enabled-check on the dispatch path, no model resolution when disabled — is unchanged; only its proof is now executable.
- **The §18 changelog stays an honest audit trail.** The 1.3 row describes all three edits at enough detail to reconstruct them without `git log`, and is candid that the A1 stub was wrong rather than glossing it as a refactor.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.5's A1 row justifies `null` by pointing at "§5.4's '—' row", which is right for A1. A3's §5.4 row is *not* a dash — it names "Phase DOD's verify step" reaching "no findings remaining" — yet §5.5 now describes A3 as "no gate declared". Both are true at different levels (the DOD verify step is Phase DOD's own next iteration, outside the seam; the seam declares no *post-action* gate because it takes no action), and this reading was already implicit in the v5-approved "unreachable" wording, so nothing is wrong. Would a half-sentence on the A3 row — "the §5.4 re-run is Phase DOD's own next verify iteration, outside the seam" — save the next reader the reconciliation? Legibility only; no product consequence, and not a change I am asking for in this round. |
| Q-02 | §5.5 and §18 cite "FSPEC T-03-6(b)". FSPEC `:387` / `:1107` state T-03-6 without an (a)/(b) split — the split is a PLAN/PROPERTIES construct (`PLAN:258`, `:869`) that the routed erratum items also used. The cited criterion genuinely covers the case ("every gate row of §5.4 … a negative assertion alone is satisfied by accident"), so the citation resolves in substance. Is the `(a)`/`(b)` sub-label worth adding to FSPEC §18.2 so the shorthand three documents now use has an upstream referent? Flagging as possible `Process`/FSPEC hygiene for harvest, not an erratum against this document. |

## Positive Observations

- **The A1 fix generalised to A3 instead of stopping at the reported instance.** I raised the passing stub against A1 only. The edit found the sibling — A3's "unreachable" row, which was not a stub but was the same under-specification one refactor away from becoming one — and gave both seams the same explicit `null`, the same reason, and the same "not a passing stub" note. Fixing the class rather than the instance is what stops this defect from re-entering through the other door.
- **`null` is expressed as a type, not just as prose.** §4.3's `verifyGate` becomes `null | (() => Promise<…>)` in the typedef, so an implementer reading only the contract sees the nullability, and the accompanying sentence explains why the driver never invokes it as `null`. A prose-only fix would have left the typedef asserting a total function while two seams shipped `null`.
- **The `waitMs` answer refused the easy tenth member.** Adding a `waitMs()` accessor to `SeamOps` would have closed the item in one line and put a member on all five seams that only A5 could meaningfully implement. Naming the driver as the owner and the `recordWait(ms)` sink as the reporting channel keeps the interface at nine, keeps four seams free of a member they would have to stub, and lands the assertion on the argument PROP-BUD-03 was already written against. The property did not have to move.
- **§11.1 now states an assertion that can fail.** "A grep for `advisory.enabled` returning exactly three sites" was a claim that read as rigour and would have been quietly wrong the first time anyone ran it — the sharpest kind of spec defect, because the reviewer and the implementer both nod at it. The replacement names the matcher, the file set, the exclusions, the count, and each counted site, and closes the obvious escape hatch by stating that the report's disabled/quiet distinction comes from `_state` and must not become a fourth read. That last clause is the part that keeps the count from drifting later.
- **The `dist/*.bundle.js` exclusion is the detail that would have bitten.** The bundles inline both modules, so an unscoped scan would return six and a maintainer would "fix" the expected count rather than the scan. Stating the exclusion *with its reason* means the next person to widen the scan knows why they must not.
- **The round again fixed mis-grounded claims without introducing new ones.** Every citation I checked held: REQ AC-4.5's A1 row, §4.4's step ordering, `TSPEC:737`/`:994`'s `permittedActions`, `PLAN:282`/`:869`, `PROPERTIES:408`/`:411`/`:787`/`:796-812`. For a document on its third erratum round, that consistency is worth naming.

## Recommendation

## Verdict
