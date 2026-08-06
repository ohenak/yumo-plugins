# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 3
**Scope:** Local (delta re-review — v2 findings + changed sections only)
**Baseline diffed:** `502e0e0..HEAD` (6 revision commits, +274/−63; REQ v1.1 → v1.2)

## Prior-Finding Disposition

All nine v2 findings, checked against the revision. Nothing below is re-litigated.

| v2 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BL-01 is split. BL-01 now claims only the model ladder (`MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` `orchestrate-dev.js:1652-1653`, resolver `:1833`) and is correctly **Met**; BL-01a books the escalation corpus as **"Not met, and not expected to be"**, with the `advisoryTierOn` `:9653` / `enabled: false` `:1663` chain and the missing `advisory` key in this repo's config all restated correctly. AC-6.1 gains a three-row corpus-state table whose first row is the shipping state, and AC-6.3 now requires a non-empty corpus **and** at least one *other* seam having escalated — so the day-one "widen all five `ADVISORY_SEAMS` (`:1669`)" firing I flagged is closed by construction. The preamble's "a tier that could not escalate is not a tier whose seams worked" is the exact distinction I asked for. |
| F-02 | High | **Resolved** | AC-5.5 no longer borrows AC-5.3's `counted` population. It defines an **evaluated pass** — non-empty consumed set, any AC-5.2 verdict produced for this promotion — and says plainly why (`counted` "excludes `insufficient-evidence` by construction and would make this state unreachable"). AC-5.3 gains the reciprocal sentence bounding its own population to the `ineffective` streak. `unmeasurable` is now reachable and `consolidation.unmeasurablePasses` has an effect. AC-1.4's parenthetical is rewritten to "restating each prior promotion's **standing** verdict and state", which is the correct weaker claim. (One residue in the rewrite — v3 F-03, a new finding, not this one reopened.) |
| F-03 | Medium | **Resolved as scoped** | AC-3.8's isolation clause is narrowed to branch operations and enumerated (`checkout` / `switch` / `stash` / `reset` / `rebase` / no fetch into its refs), with an assertable observable ("its HEAD must be identical before and after the pass"). AC-3.8b is new and answers the second half: the writes land in the invoking tree, the pass commits them itself once at terminal outcome, pathspec-scoped, never `-a`, never pushed, and the marker is never committed. The contract exists now. Two problems with *how it is specified* are new findings (v3 F-01, F-04), not this one reopened. |
| F-04 | Medium | **Resolved** | §4b is a single enumerated-vocabulary table with a Category column and a "May accompany status" column, and `promoted-degraded` is added as a sixth terminal status. The two joins I named are settled explicitly: promoted + AC-3.5 fallback ⇒ `promoted-degraded`; all-promotions-`duplicate-suppressed` ⇒ `no-op`. I checked the vocabulary for orphans — every backticked lowercase token used as a status, reason code, trigger, route, verdict, state, action or `credential:` value elsewhere in the REQ has a §4b row, and §4b has no row for a token the REQ never uses. Set-equal. |
| F-05 | Medium | **Resolved** | The predicate's corpus is now a delimited `<!-- pdlc:consumed {passId} -->` block, "no other record type may appear inside one", and the feature commits to updating `nudge-consolidation.sh:41` so the hook and the pass keep one predicate. NFR-5 is rewritten against the block and names the three would-be false positives (PR title, `artifact` field, effectiveness row). The mechanism is right; whether it can be *reached* from the file that exists at HEAD is v3 F-02. |
| F-06 | Medium | **Resolved** | The tick order is stated as four numbered steps (enumerate → volume → cadence → `skipped-cadence`), and the enumerate/read distinction I guessed at is made explicit and twice repeated: "Enumeration is basenames only, which is all `nudge-consolidation.sh:41` does", and AC-1.1's "having read **no LEARNINGS body**". AC-1.2 is re-grounded on step 1 rather than asserting availability. |
| F-07 | Medium | **Resolved** | AC-7.2 exempts `skipped-cadence` from the log-row obligation — the option I recommended — and NFR-3a keeps its three-member trigger set with the reason stated rather than a `none` member bolted on. The exemption's second consequence is written down too ("it is that same log the AC-1.1 predicate and the AC-1.1 cadence datum are read from"). |
| F-08 | Low | **Resolved** | Both trailers now point at the REQ-CONS-03 preamble ("Pass identity and artifact naming") — AC-3.7(c) and NFR-4 alike. |
| F-09 | Low | **Resolved** | `nudge-consolidation.sh` `(:47-48, header :4)`. Confirmed: `:47` opens the `print(json.dumps(...))`, `:48` carries `"additionalContext": msg`. |

Nine of nine resolved. The findings below are **new**, and all arise in sections the revision
changed.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
