# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 3
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `91439f6` (the commit my v2 review was written against) → `fd4bced`
(`git diff 91439f6 HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`: seven commits,
`0b230d3` … `fd4bced`). Only the changed sections were re-read.

## Disposition of v2 findings

All four are resolved, and each was re-verified against the tree rather than against the revision's
own description of itself.

| v2 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | High | **Resolved** | §6.5 conjunct 1 now reads "at the three seams that can apply an action — A2, A4, A5", and a new paragraph puts A1 **and** A3 on the stronger form with the citations checked: TSPEC §4.3's "(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached" is at `TSPEC:422-423`; §5.5's gate table gives A1's row as "`permittedActions: []` means the gate is unreachable anyway" (`TSPEC:638`) and A3's as the literal "unreachable (`permittedActions: []`)" (`TSPEC:640`); PLAN A-23's "A3's `permittedActions: []` with throwing `apply`/`revert` stubs" is at `PLAN:274`. All four citations are correct to the line. The failure mode I named — a case asserting a disposition A3 cannot produce, red in A-07 and undiagnosed until A-23 — is now named in the document itself. (One residual scoping slip in the same paragraph — F-01 below, Low.) |
| F-02 | Medium | **Resolved, and better than asked.** | PROP-DIS-06 now transcribes `/\.enabled\b/` as its matcher and pins the counted set in four bullets. The reason the literal token failed is now stated with the three sites' actual shapes, all verified: driver `config.enabled === false` (`TSPEC:1240-1241`), notice gate `advisory.config.enabled` (`TSPEC:286`), distil guard `advisory.enabled` (`TSPEC:1113`) — so the old token does find exactly one. The parser exclusion is the part I did not ask for and it is right: `parseImplementationConfig`'s precedent reads keys through a computed `section[key]` (`orchestrate-dev.js:203-209` — verified, `const v = section[key]`), which produces no `.enabled` match, so counting the parser would make the expected total depend on an unmade choice. The exclusion carries its own non-empty-slice control keyed on `invalidKeys`, which closes the "a slice removing zero bytes passes" hole. I re-ran the grounding: `grep -c '\.enabled\b'` returns **0** on `orchestrate-dev.js` and **0** on `orchestrate-queue.js` at branch head, as stated. `ADVISORY_DEFAULTS`' `enabled: false` (`TSPEC:241`) is a property definition, not a read, so it does not perturb the count. |
| F-03 | Medium | **Resolved** | Both source-scan properties now take their controls from `pdlc/workflows/__tests__/fixtures/scanFixtures.js`, outside both scanned globs. The exclusion is real, not asserted: `pdlc/workflows/package.json`'s jest block lists `"/__tests__/fixtures/"` in `testPathIgnorePatterns`, so the module is never collected as a suite. §2.1 also rejects the runtime-assembly alternative with a reason I agree with (a scan hardened against fragment assembly would match its own control). §10.3 gained the matching rewrite and both properties now assert the scanned set **non-empty** first, which answers v2 Q-06 without my having to file it as a finding. |
| F-04 | Low | **Resolved** | (a) §12.4 now states the declaration "lives in PROP-A4-09 and nowhere else" and tells a scan that two occurrences are the declaration plus the audit's own sentence, three a real invented case. (b) PROP-BUD-03's Home cell names `advisoryDriver.test.js`, block `A-22 — driver lifecycle`; §12.2's A-07 and A-22 rows and §12.3's `advisoryDriver.test.js` row all carry the driver half now, so the A-07 author has the matrix row they lacked. |

## Findings

Three, all Low, all in text this revision added. No High or Medium remains open — old or new.
Nothing in the unchanged sections is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Conjunct 2 was not scoped along with conjunct 1.** §6.5 still opens "Two conjuncts, both required", and the repair carved A1/A3 out of **conjunct 1** only ("A1 and A3 take the stronger form stated below"). Conjunct 2 is the mutation control: "replacing the gate with `async () => ({ passed: true })` must make the case fail". At A1 that replacement is a no-op — TSPEC §5.5 gives A1's `verifyGate` as literally `async () => ({ passed: true })` (`TSPEC:638`) — so the control cannot fail, and at A3 there is no gate to replace at all (`TSPEC:640`). The new paragraph's closing sentence ("For **both** rows the assertion is therefore: `resolved` is unreachable on every path…") does read as replacing the whole two-conjunct form for those two rows, and it says "neither has a post-action gate to stub", so a careful implementer gets this right — which is why this is Low, not a repeat of v2 F-01. One clause fixes it for good: make the opening read "Two conjuncts, both required **at A2, A4 and A5**; A1 and A3 take the single stronger form below." | §6.5, PROP-GATE-01/-03 |
| F-02 | Low | Local | **Two stale cross-references in the new §2.1 text.** (a) "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)" — the fact is true (`pdlc/workflows/package.json`'s jest block lists `"/__tests__/fixtures/"` under `testPathIgnorePatterns`), but neither half of the citation resolves: **A-00 was deleted** in PLAN v1.2 and its work restated as the §2.4 operator pre-flight step (`PLAN:1017`), and PLAN §2.2 is `BL-PREREQ` — baseline symbols (`PLAN:85`). The exclusion is explained in PLAN §2.4 at `PLAN:138-141`. Cite that, or cite `package.json` directly, which is the primary source and cannot go stale under a PLAN revision. (b) §12.3's preamble now says the three non-collected rows are "created by the 🔴 task named in PLAN §4's manifest" — true of `advisoryDoubles.js` (A-02) and `created-files-26c3f1c.json` (A-15), but the third row is `scanFixtures.js`, whose own cell says it has no manifest row. One qualifier ("…apart from `scanFixtures.js`, see §13.1 item 5") makes the sentence true again. | §2.1, §12.3 |
| F-03 | Low | Cross-Feature | **§13.1 item 5 names the wrong enforcer, and the wrong one reports success.** The item closes "the manifest row must exist before Phase I, since `validatePlanContract` is what enforces it." `validatePlanContract` (`orchestrate-dev.js:2344-2367`) compares only the **task-id** sets in both directions — it never inspects a row's file paths, and its own doc comment says so (`:2330-2336`). A PLAN with `scanFixtures.js` missing from A-01's cell returns `{ ok: true }`, so a PLAN author who checks the claim as written will conclude no row is needed. The mechanism that actually bites is the Phase I wave commit: it stages `task.files` and nothing else (`orchestrate-dev.js:8143-8159`, `paths = task.files` → `commitPaths({ paths, … })`), so the fixture would be created in the shared tree, satisfy every later wave, and never enter a commit. PLAN §4 states this correctly already (`PLAN:293-295`, citing `:5849`, `:8143-8159`) — quote that instead. The erratum's **ask** is right and the routing is right; only the justification sentence is wrong. Tagged Cross-Feature because "the parse gate proves my ownership manifest is complete" is a general misreading of `validatePlanContract` that will recur in any PLAN that adds a file mid-feature. | §13.1 item 5 |

## Questions

v2's Q-06 and Q-07 are both answered in place, correctly and at the right altitude — Q-06 by the
non-empty-set assertion plus the "it stays green as files arrive" statement in §2.1, Q-07 by the new
§4.2 paragraph. I verified Q-07's answer end to end: `resolveAdvisoryRung`'s return shape is declared
at `TSPEC:316` (`@returns {Promise<{ model: string, fallback: boolean }>}`) with `fallback` on the
disposition typedef at `TSPEC:390`, R-3's "the fallback path ships as the likely production path" is
at `TSPEC:1483`, and `isModelResolutionError` is a real exported predicate (`TSPEC:332`, listed in
§12.1's pure-function unit row at `TSPEC:1364`) — so PROP-RUNG-04 does own the substitution direction
through the double, and no property's green depends on BL-01. One new question, and it is a question
rather than a finding because §10.1 already states the resolution procedure for it:

| ID | Question |
|----|---------|
| Q-08 | PROP-DIS-06 counts `/\.enabled\b/` over **both** modules and expects three, but TSPEC §3.2's C-3 row says `readAdvisoryConfigSafely` is "called once in each `main()`" — the queue's read is wired at TSPEC §6.1 (`TSPEC:651-663`). If the queue's run report is ever expected to carry the C-2 substitution notice, its emit gate is a fourth `.enabled` read and the expected total becomes four. TSPEC §6.1 does not mention a queue-side notice and §3.2's snippet is captioned "caller, in `main()`" (singular), so today three is right — is the queue's silence on the substitution notice a deliberate D-5 consequence, or the gap that produces the "legitimate fourth read" §10.1 now tells Phase I how to handle? |

## Positive Observations

## Recommendation

## Verdict
