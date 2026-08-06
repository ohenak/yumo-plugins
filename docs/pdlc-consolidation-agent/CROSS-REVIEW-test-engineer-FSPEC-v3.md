# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v3.0)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `2557055` (the commit v2 was
written against); the revision is twelve commits, `f7cc78c`…`15f1ef0`, +229/−77 lines. Prior findings
G-01…G-06 and Q-01…Q-04 are verified for disposition; new findings are drawn **only** from changed
sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

All six v2 findings are **resolved**, and all four v2 questions are answered in the document rather
than in a commit message. Each was checked against the revised text.

| v2 ID | Sev | Disposition | Evidence in v3 |
|----|---|---|---|
| G-01 | High | **Resolved** | §6.5 now enumerates **two** seam domains with a permitted verb set each, AT-Q7 asserts one set-equality **per domain** (PR seam `{read-pr, create-pr}`, git seam `{clone, fetch, create-branch, add, commit, push}`), "multiset" is gone and stated as a set with AT-Q2's three commits named as the reason, and control (a)'s permission appeal is explicitly withdrawn ("`contents:write` alone permits a merge commit … control (b) cannot be derived from this row"). BR-28 carries the per-domain form. The generic-seam direction survives: the spy "classifies by the verb it resolves to rather than by the function name". Two residual scoping defects are new finding H-04 below — the shape is now right |
| G-02 | High | **Resolved** | §2.2 gives steps 12 and 13 a `Terminates` cell; §2.2 adds "**Terminates names a jump, not an exit**" (to step 14, steps 15–16 unchanged); §2.6 adds a six-row observables table distinguishing S-11c from S-11b; §12.1 adds S-11c; AT-M9 constructs it with a routed/unrouted split; §10.2 order 3, §15.1 AC-1.6, §15.2 `failed`, §17's flow and shape-3 paragraph all realigned. One cell of the new observables table is internally contradictory — Low finding H-05 |
| G-03 | High | **Resolved** | AT-Q10 (`enacted` ⇒ nothing appended ∧ `duplicate-suppressed` names the pair and the enacting `passId` ∧ `pr:` empty), AT-Q11 (`absent` ⇒ exactly one append, then **byte-identity** of `DOMAIN-CONSTRAINTS.md` across a re-run), AT-Q12 (a `route: degraded` record must **not** suppress). §15.1 NFR-4 and BR-25 route to them. AT-Q11's byte-identity conjunct is the oracle that fails a never-consults-the-log implementation, which is exactly what was missing. The field these rows write into was not extended with them — Medium finding H-02 |
| G-04 | Med | **Resolved** | §5.2's `{topic}` is now the **whole** `failure-mode-id`; the basename derivation is withdrawn by name with the collapse argued (15 skill directories at HEAD verified, `ls pdlc/skills` → 15); a fourth property row ("Discriminating on the full `artifact`") is added; the path-stability property is honestly demoted to readability ("path stability buys the carrier nothing and is not claimed to"); the convention change and the three hand-named files at HEAD (`DECISIONS-plugin-distribution.md`, `DECISIONS-review-severity-bars.md`, `DECISIONS-test-oracle-mechanics.md` — all verified present) are listed with the SKILL.md:41 edit; AT-R6 updated and AT-R6b added. AT-R6b's second fixture is new finding H-01 |
| G-05 | Med | **Resolved** | §15.3 gains the `pdlc/workflows/orchestrate-dev.js` guard-set row and a bundle-rebuild row; §14.1 T-05 constrains the widening (optional `skill` defaulting to `ADVISORY_RUNG_SKILL`, threaded to the dispatch and the memoised path, exactly one ladder) and answers the deadline question; AT-M10 is the regression test that the omitted-argument call site still dispatches `se-review`. Verified at HEAD: `ADVISORY_RUNG_SKILL = "se-review"` (`pdlc/workflows/orchestrate-dev.js:1797`), `resolveAdvisoryRung({ _agent, _log, _state, prompt })` (`:1833`), the single `_agent` call inside `dispatchAt` (`:1841`), the memoised branch (`:1843-1849`), the `{kind: "preempted"}` race at the shipped call site (`:3130-3134`). The row's artifact count is wrong — Medium finding H-03 |
| G-06 | Med | **Resolved** | AT-F15 is restated over a **constructed** fixture, says in its own row that it is receive-side, and names O-C6 as the carrier of the producing-side gap; §8.4's "both asserted rather than hoped for" is replaced by "the second is asserted by a test; the first is a convention whose **violation** is detected", with AT-F16 named as the detector. Verified: the convention is natural language in `pdlc/skills/harvest-learnings/SKILL.md` — nothing at this layer can assert compliance, which the document now says |
| Q-01 | — | **Answered** | §10.1 row 3 now reads "yes — the status alone", and AT-C3 carries that returned body as its named positive conjunct with the reason spelled out ("the four absences alone are satisfied by a pass that never ran") |
| Q-02 | — | **Answered** | §12.1 S-03 names the bootstrap conjunction (empty datum set ∧ empty consumed set) and resolves it to `no-op`, stating that S-03 and S-05 compose rather than compete |
| Q-03 | — | **Answered** | §8.4 adds "**Open** is a harvest-side filter, and it is deliberately not §8.3's population" — §8.3 emits one row per distinct recorded id, retired included; step 1's filter only bounds the harvest question list, and its own limit (a `retire` on an unmerged PR stays open) is stated with the failure direction ("one extra question, never a missed one") |
| Q-04 | — | **Answered** | §14.4 ER-2 states the shipping assumption: every AT is written against `Version` 1.4, implementation does not wait, and if the row lands the reason-code assertion is **added to** — never replacing — AT-M6/AT-M9's report-body assertion |

## Findings

All findings below are **new**, and every one is inside a section the revision changed. No unchanged
section was re-litigated.

## Questions

## Positive Observations

## Recommendation

## Verdict
