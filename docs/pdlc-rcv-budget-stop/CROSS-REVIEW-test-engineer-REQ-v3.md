# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.0)
**Date:** 2026-08-01
**Iteration:** 3 (delta re-review of v2.9 → v3.0; baseline `bbe491e`, the commit carrying my v2 findings; document at `2f3cfd9`)
**Scope:** resolution of my v2 findings, plus the changed sections only — §0 revision row, §2 Value, §4 (the new *one refusal* note), §4.1, AC-1.1 scope note, AC-1.2, AC-1.3, AC-1.4 clauses 1 and 3 and the new *ordering and its report* paragraph, AC-1.5(1)/(2), §6 rows, NB-3/NB-6, O-5, O-10, O-12, O-13, O-14, R-14, §10 — and the paired edits made in the same revision at `docs/_constraints/pdlc-rcv-catalogue.md` §4, `docs/_constraints/pdlc-rcv-split.md` §5.4/§5.7 and `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` AC-7.6. Unchanged sections I approved in v1/v2 are not re-litigated.

## Prior findings — disposition

| v2 | Severity | Status | Evidence in v3.0 |
|----|----------|--------|------------------|
| F-01 | High | **Resolved, and resolved outward** | The lost-`HALT-REASON:` refusal now has a declared surface, taken from the option I named: §4's new note says its ❌ text and recovery are **catalogue §4's row-B *unconfirmable-append* render**, generalised there from *answering line* to **region line**, `notice` **empty**, no S-16 and no eighteenth id. The paired edits landed **in the same revision**, as the paired-edge rule requires: `REQ-RCV-07` AC-7.6's *Given* now names it (*"a third source, not a third variant"*), its ❌ row reads `Refused — region line unconfirmed at {path}`, and catalogue §4's ❌ and recovery cells carry the generalisation with the date and both citing REQs. Split §5.4 leg (iii) is corrected to **`notice` empty**, and §10's *"v2.9 carries no change to that edge"* is replaced by *"v3.0 does change that edge, and carries the change here"*. AC-1.5(1)'s complementarity is re-stated over the right discriminator — **halt *recorded*, not intent** — so the rows are exhaustive again. |
| F-02 | Medium | **Resolved** | AC-1.4 clause 3 now says the Iterations write *"carries clause 1's confirmation obligation and fail-closed disposition"*, and the new **ordering** paragraph makes the disposition concrete: an unconfirmed write of clause 3 or clause 1 ends the entry, no halt recorded, no strip. O-10's leg (iii) is widened from *"a lost `HALT-REASON:` append"* to *"either halt-path write left unconfirmed … a lost `HALT-REASON:` append, and a failed Iterations write"*, with split §5.4 carrying *"The same leg covers a failed Iterations write, whose disposition is identical."* The categorical promise is now bounded — *"where the write cannot be confirmed, no halt at all"*. |
| F-03 | Low | **Resolved** | §6's render is fixed as the Iterations **heading's own text** — *"`## ` followed by the render, replacing whatever the heading carried (M-1c): one line, not a heading plus a body line, so O-10 leg (i)'s equality has a single target"* — and §6's own row repeats it. O-14 drops the blanket carve-out for exactly this point (*"Mechanism only, with one routed exception"* — placement). Leg (i)'s third fixture is now writable. |
| Q-01 | — | **Answered in the document** | The new ordering paragraph states the two-clearance cost as an **accepted cost**, in the direction I read it: *"a creating halt whose append fails leaves an unresolved post-mortem with `H = 0`, so the operator's first `RESOLVED: yes` grants nothing and the re-halt needs a second — fail-closed in the right direction."* |
| Q-02 | — | **Answered, and made total** | Clause 3's not-found disposition no longer depends on the region being last: *"immediately **above** `## Reset Region` wherever that section sits, or at the end of the file when there is none — total in the section order."* Leg (ii)'s expected file is now derivable on every fixture. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
