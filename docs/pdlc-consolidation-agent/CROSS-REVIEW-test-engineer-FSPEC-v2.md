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

All findings below are **new**, and every one is inside a section the revision changed. No unchanged
section was re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-01 | High | Local | **AT-Q7's domain is wrong, so the feature's central safety oracle is red on a correct implementation — the same defect v1's F-06 found in AT-L5, reintroduced one AT over.** The Given is "a pass that opens a PR, with **every** git and PR seam behind a spy that records the verb of each call"; the Then is "the observed verb multiset is **set-equal** to exactly `{create-branch, push, create-pr}`". A correct pass makes strictly more git calls than those three, and this document requires each of them: §5.4 obliges `git add -- {paths}` then `git commit -m {msg} -- {paths}` in the invoking tree — AT-M5 asserts those commits exist and AT-R3 asserts their pathspec; §6.1 obliges a **clone** (AT-Q1: "the edit is committed in a separate clone under a temporary directory cut from the fetched default branch"); §6.2 obliges **one commit per edit**, so AT-Q2's three-promotion fixture alone contributes three more commit verbs. So AT-Q7 and AT-M5/AT-Q1/AT-Q2 cannot both pass. A tester will save AT-Q7 by narrowing the spy to "the PR seam" — and at that moment the set-equality direction that catches a merge issued through a *generic* seam (`_gh(["pr","merge",…])`, a shell string, a URL built at runtime), which is the exact shape the row says it exists to catch, is silently lost. State the spy's domain as an enumerated seam set and state the expected verb set over that same domain, so the narrowing is the spec's decision rather than the implementer's. Two smaller defects in the same row: "multiset … set-equal" is self-contradictory (a multiset comparison would fail on AT-Q2's three commits even after the domain is fixed — say **set**, over verbs, and say so); and "the two permissions §7.1 grants and no more" cites a permission scope as if it bounded a verb set, which it does not — `contents:write` permits a merge commit. | §13.5 AT-Q7, §6.5 (b), §5.4, §6.1, §6.2, §13.3 AT-M5, BR-28 |
| G-02 | High | Local | **§2.6's new row-4 recurrence at steps 12 and 13 is a reachable termination that §2.2 denies, §12.1 does not enumerate, and no AT constructs.** §2.6 closes with "row 4 can [re-occur after step 8], and it terminates those steps exactly as it terminates step 8" — i.e. a `dispatch-error` on the §8.5 remediation authoring (step 12) or the §5/§6 proposal authoring (step 13) is terminal. But §2.2's own table gives steps 12 and 13 a `Terminates` cell of `—`, and §2.2's preamble says a step that does not terminate "always proceeds to the next"; §12.1's S-11b is scoped to "**The first** advisory dispatch"; and AT-M6's Given is likewise "a **first** advisory dispatch that fails". So the state is asserted to exist in one section and denied in another, and it is untested either way. It is not a hypothetical: its observables genuinely differ from step 8's, because by step 12 the effectiveness table exists and by step 13 some proposals may already be routed — does the pass still write the §5.4 commit (step 15) for the partial work, or does "terminates exactly as step 8" mean it does not? Does a partly-routed pass record `writes-uncommitted`, a `degraded` route, or nothing? A tester cannot construct the fixture, and §12.1's "every terminal status appears" audit reads green while a terminal path escapes it. Either give steps 12–13 a `Terminates` cell, a §12.1 row and an AT, or state that a post-step-8 `dispatch-error` is non-terminal and say what the pass does instead. | §2.6 (final paragraph), §2.2 steps 12–13, §12.1 S-11b, §13.3 AT-M6 |
| G-03 | High | Local | **§6.4's new consuming-repo suppression carrier — an entire second idempotence mechanism — has no acceptance test in either direction.** The revision adds a two-carrier table: the PR route keys on the `PDLC-CONSOLIDATION-PROMOTIONS` trailer, and the §5.2/§5.3 route keys on "the §8.1 failure-mode records already in `docs/_decisions/.consolidation-log.md`" over the two-member state set `enacted` / `absent`, with a stated behaviour ("the pass appends nothing to `DOMAIN-CONSTRAINTS.md` or `DECISIONS-{topic}.md` for it and records `duplicate-suppressed` naming the pair and the `passId` of the record that enacted it, in place of a PR URL"). The token `enacted` appears exactly twice in the whole document — in §6.4 and in BR-25 — and in **no** AT. §15.1 routes NFR-4 to AT-Q3, AT-Q4, AT-Q5, AT-Q9, AT-F1; BR-25 now describes both carriers but still cites AT-Q3/AT-Q4 — both PR-trailer fixtures. AT-R2 and AT-R6 exercise the append but assert nothing about suppression, so even the `absent` arm is only incidentally covered and is not paired with its positive. The consequence is precisely v1 F-03's: an implementation that never consults the log — i.e. that re-appends the same constraint on every re-run over the same corpus, the exact failure §6.4 was added to prevent — passes every test in §13. Give the carrier its own ATs: `enacted` ⇒ nothing appended **and** `duplicate-suppressed` names the pair and the enacting `passId` **and** `pr:` is empty; `absent` ⇒ the append happens exactly once; and a re-run over an unchanged corpus is idempotent on the file's bytes. | §6.4, §13.4, §13.5, §15.1 NFR-4, BR-25 |

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_
