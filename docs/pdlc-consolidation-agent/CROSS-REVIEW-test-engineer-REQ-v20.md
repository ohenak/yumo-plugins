# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.4)
**Date:** 2026-08-10
**Iteration:** 20
**Scope:** Local (per-finding below)
**Delta base:** `c93f5032` (the tree I reviewed at v19) → HEAD

This is a delta re-review of the v2.4 round. The revision answers v19's F-64 and se's
F-01…F-04 and Q-01. The delta question is the usual pair: **did the claimed moves actually
land, and did the revision break anything previously approved?** Every anchor the delta
touches was re-measured at HEAD.

## What changed

Five commits (`546a7ee2`…`b2156952`), one document, 21 insertions / 14 deletions. Version
moves `2.3 · 2026-08-10` → `2.4 · 2026-08-10`. Three substantive edits:

1. **The anchor-epoch preamble gains a re-measurement cadence** (`:22-26`): "the role name is
   the durable locator; the number is the convenience… anchors are re-measured at review
   rounds, not on every commit, so a number that has shifted is a defect only where the named
   role no longer resolves." This is the answer to se Q-01 and it is the right shape — it
   converts an unbounded editorial obligation into a decidable one.
2. **The `orchestrate-dev.js` guard family and `build-runtime.mjs` are re-anchored with roles
   named** (`:307-311`, `:333`, `:401`) — the exact gap v19's F-64 named.
3. **§4b names a terminal status and a reason code for an all-unreadable corpus** (`:624-627`),
   and AC-1.4 carries it as a third cause (`:223-232`), with AC-5.3 (`:454`) and AC-5.5
   (`:479`) updated from "first cause" to "first or third cause".

I re-measured every anchor the delta moved. All eleven resolve, and each lands on the line
its named role claims:

| REQ claim (v2.4) | HEAD state | Correct |
|---|---|---|
| `effectiveGuardPaths` "the guard-path resolver" `:936` | `:936` `export function effectiveGuardPaths(configured)` | yes |
| `guardVerdict` `:959` | `:959` `export function guardVerdict(changed, guardPaths)` | yes |
| Phase MERGE's ladder, "`decideMerge`'s resolver/verdict call pair", `:1126-1127` | `:1126` `effectiveGuardPaths(config.guardPaths)`, `:1127` `guardVerdict(record.o5, …)` — adjacent, exactly a pair | yes |
| advisory-envelope check `:2370` | `:2370` `guardVerdict({ ok: true, files: paths }, …)` | yes |
| `mergeMode` default `:61` | `:61` `mergeMode: "off"` | yes |
| `decideMerge`'s guard-1 refusal `:1065`, reason string `:1070` | `:1065` `config.mergeMode === "off"`, `:1070` `reason: "mergeMode off"` | yes |
| the phase's early return `:1659` | `:1659` `if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode off", …)` | yes |
| `gitWithLockRetry` "the lock-retry wrapper" `:9424` | `:9424` `export async function gitWithLockRetry(argv, { … })` | yes |
| `build-runtime.mjs` fourth artifact row, `pdlc-cli.mjs`, `:564-567` | `:564` `file: "pdlc-cli.mjs"`, `:567` `id: "pdlc-cli"` | yes |

I also re-derived the reachability claim rather than trusting it: `grep -n "guardVerdict("`
returns the declaration plus exactly two call sites (`:1127`, `:2370`), both about that run's
own PR. `effectiveGuardPaths` has a third caller at `:3443` (`guardPaths:
effectiveGuardPaths(undefined)`), which seeds the advisory context the `:2370` check reads —
it does not open a route to an inbound PR, so the sentence's "reachable only from" stays true
as written (it is scoped to `guardVerdict` over `effectiveGuardPaths`, not to the resolver
alone).

v19's F-64 is **resolved**, in full and in the manner F-64 asked for: coordinates fixed *and*
roles named, so the next round can re-find them without a grep.

## Findings

**One High**, introduced by this delta. Two Lows carried and re-measured.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-65 | High | Local | **The new `corpus-unreadable` reason code breaches this REQ's own set-equality oracle, and contradicts the sentence three lines above it.** v2.4 introduces a reason code at `:226` (AC-1.4's third cause) and `:625-626` (§4b). It exists nowhere else: `grep -rn corpus-unreadable docs/ pdlc/` returns those two REQ lines and nothing more — **no row in `docs/_constraints/pdlc-consolidation-vocabularies.md` §1**, whose table ends at `:68` with `credential:`, and whose version is still `1.4 · 2026-08-06` (`:7`). Three ways this bites, all mechanical: **(a)** §4b at `:604-607` states the downstream oracle as "**set-equality** over every enumerated row this REQ owns — §1, §2 and §4 …, entire, at `Version` 1.4" and makes the rule *symmetric* — "a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects". The governed file says the same in its own words at `:38-39` ("adding a value to the REQ without a row here is a defect"). A value used in the REQ with no row in the pinned enumeration is therefore a defect **by the REQ's own definition**, not by my preference. **(b)** The oracle is now *unsatisfiable*, which is the testing cost: PROPERTIES `:132` pins the doubles module to "the literal transcription of vocabularies §1 at `Version` 1.4", and the set-equality property built on it has two authorities that disagree — transcribe §1@1.4 and the property goes red on a conforming implementation that emits `corpus-unreadable`; transcribe the REQ's used-value set and the transcription no longer matches the pinned file. There is no expected value a test author can write down. **(c)** AC-7.1 (`:517-518`) requires reason codes be "drawn from §4b's enumeration, and paired only as §4b permits" — `corpus-unreadable` has no permitted-status join, so the pairing rule is undefined for the one code the delta added. **Second limb, same fix:** the v2.1 erratum sentence at `:618` still reads "Omission needs no new field, **no new reason code** and no vocabulary row" — three sentences before `:625-626` adds one. The two are arguably scoped differently (per-entry omission vs whole-pass status), but nothing in the text says so, and this paragraph is exactly where v18's F-62 found two definitions disagreeing. **The fix is mechanical and small:** add one row to vocabularies §1 — `` | `corpus-unreadable` | reason code | `no-op` | AC-1.4, §4b | `` — bump that file's `Version` to `1.5` (a value change, unambiguously version-bumping under its own `:28-32` rule, which exempts only `file:line` re-measurement), re-pin the REQ's eight `Version 1.4` citations (`:95`, `:111`, `:214`, `:256`, `:436`, `:596`, `:605`, `:613`) — note §2/§3/§4 pins move too, since the file carries one version — and qualify `:618`'s clause to the omission mechanism it is about. | REQ `:226`, `:618`, `:625-626`, `:604-607`, `:517-518`; `pdlc-consolidation-vocabularies.md:7`, `:38-39`, `:42-68`; PROPERTIES `:132` |
| F-56 | Low | Local | **Open — re-measured, worse again.** `wc -l -c` at HEAD: **695 lines / 66,758 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`). That is 5,318 bytes over the byte budget (up 767 from v19's 65,991) and **five lines** of line-budget headroom left, down from 13. Five rounds, one direction. `check-req-size.sh` is PostToolUse and warns rather than blocks, and no oracle reads either number, so this is still Low — but the line budget is now close enough that the *next* round's edit can cross it without anyone intending to. F-65's fix is roughly byte-neutral (one row moves to the constraints file, eight pins change digit); the compaction has to come from somewhere else. | REQ file; `check-req-size.sh:41-42` |
| F-54 | Low | Cross-Feature | **Open — re-measured, unchanged.** `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `Version \| 1.0 · 2026-08-06` and the REQ still pins `1.0` at `:232`/`:504`. Self-consistent, so not gating; carried only so the pin stays deliberate. | REQ `:232`, `:504`; `pdlc-advisory-corpus-baseline.md:7` |

### Prior findings — resolution verified

| Prior ID | Status | Evidence at HEAD |
|---|---|---|
| F-64 (Medium) | **Resolved** | All four stale guard coordinates fixed and re-verified line-by-line at HEAD: `709 → 936`, `899-900 → 1126-1127` (not `1064-1065` as I predicted — the author measured the resolver/verdict *call pair* rather than the surrounding block, which is the better anchor), `2143 → 2370`, `838 → 1659`, plus `:1065`/`:1070` added for the guard-1 refusal. Every one names its role, as the preamble promises. |
| F-60 / Q-05 (Process) | **Partly answered, structurally** | The preamble's new cadence clause (`:22-26`) supplies the missing half: it defines *when* a shifted number is a defect ("only where the named role no longer resolves"), which is what made the old obligation unbounded. The grep-shaped mechanical check Q-05 asked for is still not specified anywhere, but the obligation it would enforce is now decidable, which is the harder half. Carried to Q-05 below, non-blocking. |
| F-57 follow-on (§4b termination) | **Resolved and then some** | v2.3 established that an all-unreadable corpus still fires and still terminates; v2.4 names the observable — status `no-op`, reason `corpus-unreadable` — which is what a test can assert on. The *shape* of this fix is right; F-65 is about the enumeration it was not registered in, not about the decision. |

## Questions

## Positive Observations

## Recommendation

## Verdict
