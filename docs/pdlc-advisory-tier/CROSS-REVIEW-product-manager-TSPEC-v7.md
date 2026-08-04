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

## Questions

## Positive Observations

## Recommendation

## Verdict
