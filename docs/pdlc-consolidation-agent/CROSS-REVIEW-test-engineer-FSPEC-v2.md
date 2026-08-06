# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v2.0)
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `132e9f9` (the commit v1 was
written against); the revision is thirteen commits, `8090db0`…`2557055`, +399/−97 lines. Prior
findings F-01…F-16 are verified for resolution; new findings are drawn **only** from changed
sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

All sixteen v1 findings are **resolved**. Each was checked against the revised text, not against the
commit message.

| v1 ID | Sev | Disposition | Evidence in v2 |
|----|---|---|---|
| F-01 | High | **Resolved** | §2.3's HEAD measurement is demoted to "a worked illustration … **not** the Given of any acceptance test", and AT-C1's Given is a constructed fixture parameterised on `(n, k, volumeThreshold)` instantiated at `(5, 2, 5)`. AT-C1b adds the `(6, 0, 5)` instance so the same family exercises both sides of the threshold — the fixture no longer inverts on this feature's own PR |
| F-02 | High | **Resolved** | Step 8 is now "Read the consumed LEARNINGS bodies … and issue the pass's **first advisory dispatch**", and §2.6 justifies the fusion from the seam itself: the resolver's doc comment states non-resolution is detected "by classifying the rejection of the **real** dispatch … never by a separate probe" (verified verbatim, `orchestrate-dev.js:1811-1813`). O-C1's loss is restated over *value extracted* rather than *bodies read*, which is the honest form once the steps are fused |
| F-03 | High | **Resolved** | AT-M7 asserts the fallback branch with three required conjuncts (proceeds to non-`failed`; `ADVISORY_MODEL_FALLBACK:` verbatim in the body; `rung:` names the **fallback**), and AT-M8 is its paired negative on the primary branch. §15.1 re-routes AC-1.5 to AT-M7/AT-M8 and AC-1.6 to AT-M4/AT-M6/AT-M7. A silent downgrade now fails a named test |
| F-04 | High | **Resolved** | §8.5 row 3's predicate is now "the promotion's `artifact` exists at the pass's HEAD" and the withdrawal of the `symptom` match is argued explicitly; AT-F17/AT-F18 give rows 3 and 4 tests, and AT-F17 asserts the choice is identical on a re-run. §8.3's determinism claim survives because the predicate is now a filesystem check |
| F-05 | High | **Resolved** in kind | AT-Q7 is a runtime spy with set-equality plus a positive `open`-state assertion; AT-Q7b is demoted to supplementary and says so in its own row; AT-M5 is restated as a positive pathspec set-equality and explicitly notes an absence-only form is satisfied by a pass that commits nothing. §6.5 control (b) and BR-28 carry the positive form. The oracle *shape* is right — its **domain** is now wrong, which is new finding F-01 below |
| F-06 | High | **Resolved** | §10.3 splits the row into enumerated and free-form classes, AT-L5's domain is the enumerated class named field-by-field, the free-form class is excluded by name, and both set-equality directions are retained with a stated reason each ("no enumerated value without a §1 row" / "no §1 row unused across the fixture set", the latter forcing a §12.1-spanning fixture set) |
| F-07 | High | **Resolved** | AT-C5's fixture now places the `promoted` row **first** and the `refused` row last, and the Then asserts the datum is the earlier `promoted` date. An implementation that takes the last row unconditionally now fails |
| F-08 | Med | **Resolved** | AT-R6 is AC-2.2's own test and §15.1 re-routes AC-2.2 to it; §5.2 states the `{topic}` derivation, and AT-R6 asserts create-vs-append in both trees. (The derivation's collision behaviour is new finding F-04 below) |
| F-09 | Med | **Resolved** | AT-C8 is the comparative test — one corpus, two triggers, promotion sets **set-equal** by `(failure-mode-id, action)` — and §15.1 re-routes NFR-3 to it |
| F-10 | Med | **Resolved** | AT-K7 asserts terminal `promoted-degraded` verbatim on a ≥2-promotion fixture with exactly one §6.3 failure, plus the landed promotions' observables; §12.1's closing line now names the AT for each terminal status |
| F-11 | Med | **Resolved** | §19 gains an explicit "the AT column is a per-row obligation, not a family citation" rule naming the six offending rows; E-02→AT-P8, E-05→AT-P9, E-06→AT-P11, E-23→AT-Q8, and each new AT states what distinguishes its Given from its neighbour's |
| F-12 | Med | **Resolved** | E-09→AT-P10, whose Then asserts the §10.4 report names the collision (the row explicitly notes the set-size assertion alone cannot distinguish "reported" from "silently resolved"); E-29→AT-Q9 |
| F-13 | Med | **Resolved** | §14.1 T-09 obliges ≥1 property strategy per parameterisable component, names the four components, and states the invariant each property must range over. "TSPEC may not discharge T-09 by citing the existing ATs" closes the escape hatch |
| F-14 | Med | **Resolved** | §10.3 disambiguates `credential: absent` by status and gives the discriminator an independent observable (`credential-unavailable` is illegal with `refused`); AT-K6 asserts the pairing in both directions; BR-41a, E-20b and §12.1 S-09 carry it |
| F-15 | Low | **Resolved** | AT-C7 is the date-rollover Given, and folds E-10's unparseable row into the same fixture |
| F-16 | Low | **Resolved** | AT-P7 is now a differential test over a shared fixture table with a set-equality oracle, and states why source inspection is unavailable (the hook's predicate is a Python heredoc in bash at `nudge-consolidation.sh:41`, glob at `:28` — both verified at HEAD) |

## Findings

_(filled below)_

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_
