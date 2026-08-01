# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.3, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 3
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v2 was the REQ as of `fa83925`; this review
covers `fa83925..94e2137` on that file (80 insertions, 69 deletions). Sections unchanged since v2
were not re-litigated.

## 1. Disposition of the v2 findings

All six v2 findings are **closed**. Each was checked against the revised text and, where it made a
claim about the shipped code or a shared file, against that file at HEAD.

| v2 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | Medium | ✅ closed | O-10 now carries the clause I asked for, and it is stronger than the ask: *"**the refusal's own operator strings** (§6) — the ❌ text `Refused — reset region corrupt at {path} ({reason})` and a recovery text naming **that reason's** sanctioned repair, both asserted character for character, with step G's shipped strings (`Refused — unresolved POSTMORTEM at …` and `set the row back to pending, then re-run the queue`) as **negative controls**, plus `postmortemStatus` asserted `resolved`-or-unset and **never** `unresolved`."* Naming the two shipped strings as explicit negative controls is what makes the fix falsifiable — the exact implementation I described in v2 F-01 (reuse `orchestrate-dev.js:4246` and `:4926`) now fails a stated leg rather than passing every one. |
| **F-02** | Medium | ✅ closed | §6's preamble now reads *"**Four rows below sit deliberately outside baseline §3's scope and are not that defect:** `budget-exhausted:` is a render fixed by catalogue §2, and the three refusal-render rows are non-catalogue operator strings this REQ alone owns. Both have a registered authority — the catalogue, or this table."* That is the second of the two resolutions I offered, taken cleanly: the preamble no longer asserts a rule its own table breaks, and each out-of-scope row now names where its authority actually lives. The arithmetic checks: six baseline-§3 rows owned + four scoped-out owned + one read-only row = the table as written. |
| **F-03** | Low | ✅ closed | §4's preamble now reads *"owns **six** catalogue ids and **reads** two"*, matching its table (S-12, S-13, S-14, S-15, S-16, S-4 owned; S-11, S-3 read). |
| **F-04** | Low | ✅ closed | AC-1.5(4) now states the positive: *"`postmortemStatus` reads `resolved` — the operator did clear it — or is unset; **never** `unresolved`"*, and O-10 asserts exactly that disjunction. §6's *Refusal phase-row text* row keeps the negative as a gloss, which is fine now the positive is stated where the behaviour is. |
| **F-05** | Low | ✅ closed | AC-1.2 gained *"**`W` is `windowEnd`'s sole production argument:** the dormant `windowEnd(startIndex)` parameter defaults (`reviewLoop`'s `endIndex`, `checkConverged`'s fallback) compute a *wider* window whenever `W ≠ startIndex`, so they must be removed or made unreachable."* Both sites are named, and the obligation is imperative rather than descriptive. |
| **F-06** | Low/Process | ✅ observed, and the constraint held | The revision is net **+436 bytes** (60,892 → 61,328) against a 61,440-byte ceiling, achieved by compressing eleven justification paragraphs to pay for the four substantive additions — exactly the shape I asked for. See F-05 below: the headroom is now 112 bytes, which is a live constraint on *this* round's revision rather than a finding against the content. |

## 2. Disposition of the v2 questions

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
