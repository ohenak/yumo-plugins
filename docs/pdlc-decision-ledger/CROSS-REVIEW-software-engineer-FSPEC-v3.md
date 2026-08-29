# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.1)
**Upstream at dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8, sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba)
**Date:** 2026-08-28
**Iteration:** 3 (upstream-cascade confirmation — FSPEC's own bytes unchanged)

## Scope

Upstream-cascade confirmation, not a re-review. FSPEC v1.1 is byte-unchanged since my v2
approval (`REVIEWED-COMMIT: a8175794`); the approval's `UPSTREAM-STATE` pinned REQ
sha256:c18b7e88…, and that version of the REQ no longer exists. The erratum round moved the REQ
across three commits — `4e197abe5` (§4 C-5), `0756cefed` (§6 R-5, §7 A-1), `273d0ce00` (§1
changelog and Baseline pin) — plus the Baseline to v1.2 in `efbf3dad9`.

What the upstream edit actually changed, read at its current text, not from the changelog:

| Upstream site | Before (my approved version) | Now (v1.8) |
|---|---|---|
| §4 C-5 `decisionLedger.maxEntries` | `70`, **positive** integer | `70`, **non-negative** integer — `0` is a valid admits-nothing value |
| §4 C-5 `decisionLedger.maxBytes` | **`8000`**, positive integer, author analogy to `learningsInjection` | **`12500`**, non-negative integer, derived from Baseline v1.2's `M-7b`/`M-7c` |
| §6 R-5 | "`maxBytes` is an author analogy, not measured" | "Both bounds are now measured … but against one commit rather than a growth model" |
| §7 A-1 | `maxEntries` measured, `maxBytes` "remains a `learningsInjection` analogy, not measured" | Both defaults measured and cited by id (`M-6b`/`M-6c`, `M-7b`/`M-7c`) |
| Baseline pin | v1.1 | v1.2 (§8 `M-7a`…`M-7e` added; §1–§7, and the `Verified at` commit `8c673a09f`, unchanged) |

The one question asked: **does FSPEC still hold against the REQ as it now stands?** I read the
current upstream text at every site FSPEC leans on, not just the changelog's item list. The
type retyping and the R-5 rewrite cascade cleanly — FSPEC never restates a config type, and E-7
already treated `maxEntries` `0` as valid rather than as a fallback, which is exactly the
outcome the retyping was made to license. Two sites do **not** hold: FSPEC recites the old
`maxBytes` default as a literal, and FSPEC's §7 Assumptions restate A-1 in its retired form
while claiming to carry it "unchanged". A third is a version-pin staleness with no semantic
drift behind it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | FSPEC recites the retired `maxBytes` default as a literal: `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md:111` reads "Defaults are `enabled` `false`, `maxEntries` `70`, `maxBytes` `8000` (REQ C-5)". REQ C-5 now says `12500` (`docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md:173`), and the Baseline the REQ derives it from records that `8000` "is *below* M-7b outright, so it drops lines against the standing corpus on day one" (`docs/_constraints/pdlc-decision-corpus-baseline.md:111`). The citation `(REQ C-5)` now attributes to the REQ a number the REQ does not carry. This is the single site the erratum's own cascade note predicted, and TSPEC/PLAN read the value from here | §3.1, defaults sentence (FSPEC:111) |
| F-02 | High | delta | local | FSPEC's §7 Assumptions carry A-1 in its **retired** form while asserting fidelity: `FSPEC:544-546` reads "Carried from REQ §7 unchanged … `maxBytes` (8000) is a `learningsInjection` analogy and is not measured". REQ §7 A-1 now reads the opposite — "Both defaults derive from measurements taken once against the Baseline's named commit and cited by id … `maxBytes` (12500) from `M-7b`/`M-7c`" (`REQ:377-380`) — and R-5's residual risk moved with it, from "not measured" to "measured against one commit rather than a growth model" (`REQ:330-333`). A-1 is an **operator-vetoable** assumption: an operator reading FSPEC would veto or resize a bound on a rationale the REQ has withdrawn. "Unchanged" is the load-bearing word and it is now false | §7 Assumptions, A-1 (FSPEC:544) |
| F-03 | Medium | delta | nonlocal | FSPEC's header pins are both stale: `Upstream … **v1.7**` (`FSPEC:9`) against REQ v1.8, and `Baseline … **v1.1**` (`FSPEC:11`, repeated at `FSPEC:43` and `FSPEC:331`) against Baseline v1.2. I checked the Baseline bump for semantic drift and found none — v1.2 is purely additive (§8 `M-7a`…`M-7e`), §1–§7 and the `Verified at` commit `8c673a09f` are byte-identical, so `M-1d`/`M-2e` and every AT-01/AT-03 fixture claim still hold. Medium, not High, for that reason. But the Baseline's own change control makes the pin normative — "Consumers cite this file **at its `Version`**" (`baseline:27`) — so a v1.1 pin is a defect in form even where the facts survive. Fix in the same edit as F-01/F-02 | Header table (FSPEC:9, :11); FSPEC:43; FSPEC:331 |
| F-04 | Low | delta | local | The erratum's own cascade note mis-routes the fix: `REQ:27` says "FSPEC **§3.3**'s recital of the default cascades". §3.3 is the fail-open path (`FSPEC:139`); the recital is in **§3.1** (`FSPEC:111`). The pointer is off by one subsection in the one sentence whose job is to aim the downstream edit. Correct the REQ's changelog reference to §3.1 | REQ §1 v1.8 changelog (REQ:27) |

FINDING: High | delta | local | §3.1 defaults sentence (FSPEC:111) recites `maxBytes` `8000` and attributes it to REQ C-5, which now says `12500`
FINDING: High | delta | local | §7 A-1 (FSPEC:544) carries the retired "`maxBytes` is an unmeasured `learningsInjection` analogy" claim while asserting it is carried from REQ §7 unchanged
FINDING: Medium | delta | nonlocal | Header pins Upstream REQ v1.7 (FSPEC:9) and Baseline v1.1 (FSPEC:11, :43, :331); upstream is REQ v1.8 and Baseline v1.2 (additive only, no fact drift)
FINDING: Low | delta | local | REQ:27's cascade note points at FSPEC §3.3; the recital it means is in §3.1

## Questions

## Positive Observations

## Recommendation

## Verdict
