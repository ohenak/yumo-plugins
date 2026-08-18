# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.3)
**Date:** 2026-08-17
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v2.md`. Prior findings verified against
the revised text; only the changed hunks (`git diff 0b2a0615..HEAD`, 77 insertions / 37 deletions,
one file) were scanned for new issues. Unchanged sections already approved were not re-litigated.

## Prior findings disposition

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Partially resolved** — see F-01 below | §5.2's TT-3 is now two named halves and does re-home the mode-bit block over an enumerated, set-equal script set, with a companion assertion tying that enumeration to the executables tracked under `pdlc/hooks/scripts/`. That is the right shape. The enumeration itself is one script short: it lists `cleanup-consumer-workflows.sh` plus `check-scope-field.sh`, `guard-harvest-before-delete.sh` and `nudge-consolidation.sh`, and omits `check-req-size.sh`, which is tracked `100755` (`git ls-files -s pdlc/hooks/scripts/`), registered at `pdlc/hooks/hooks.json:24`, and named by AC-3.3 ("the scope-field and REQ-size warnings emit"). The gap that made the v2 finding High therefore still exists for one hook, and the companion set-equality assertion cannot pass as written. |
| F-02 | High | **Resolved** | §4.5 clause 1(b) now stops at the run-variable *key* level and enumerates the fixed schema in a table: `engine.dispatches.{bySkill,byPhase}` enumerated, `…bySkill.<skill-name>`/`…byPhase.<phase>` not; `engine.outcomes.{ran,halted,blocked,refused,"max-passes",idle}` enumerated. Verified against the source: `pdlc/engine/lib/report.mjs:64` seeds `dispatches = { bySkill: {}, byPhase: {} }` and `:71` seeds `outcomes = { ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 }` — the six transcribed keys are exactly the six in the code, in the code's own spelling including the quoted `"max-passes"`. The `:21` docstring is quoted accurately ("the zero-valued shape for `dispatches`/`outcomes`, never a missing key"). A vanished outcome kind or dispatch axis now reds clause 1, which is what AC-5.2's "no field, no phase, no gate disappeared" needs; a differing dispatched skill set still passes. |
| F-03 | Low | **Resolved** | §4.4 now reads "**2 deleted / 3 surviving**, not 4 + 1" and names the members correctly against `const FIVE_SCRIPTS` (`bootstrap.test.js`): `check-workflow-drift.sh` (class 4) and `sync-workflows.sh` (class 5) deleted; `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` surviving. Verified — those five are the array's members, and the three named survivors are tracked `100755` at HEAD. The arithmetic is right; the attribution of those three to AC-3.3 is not (F-01). |

Both High findings were acted on in the same round, and the surrounding new material (§2.6 helper
survivorship, §2.7's `MERGE_GUARD_DEFAULTS` anchor correction, §3.2's 4a/4b split, §6.1 erratum 7's
amendment) checks out against the tree — see Positive Observations. The findings below are new;
F-01 is the unclosed remainder of the v2 finding, F-02 and F-03 are Low.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **TT-3's set-equal enumeration omits `check-req-size.sh`, so one AC-3.3 hook still loses its mode-bit oracle, and the row's own companion assertion contradicts the enumeration.** §5.2 row TT-3 half (b) enumerates `{ pdlc/hooks/scripts/cleanup-consumer-workflows.sh, check-scope-field.sh, guard-harvest-before-delete.sh, nudge-consolidation.sh }` and then requires that enumeration to "**set-equal** the executable scripts actually tracked under `pdlc/hooks/scripts/` (excluding the sourced, deliberately non-executable `lib/`)". Measured at HEAD, `git ls-files -s pdlc/hooks/scripts/` returns six tracked `100755` files — `check-req-size.sh`, `check-scope-field.sh`, `check-workflow-drift.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh`, `sync-workflows.sh` — plus `lib/pdlc-drift.sh` at `100644`. The sweep deletes exactly two of the six (`check-workflow-drift.sh`, class 4; `sync-workflows.sh`, class 5) and adds one, so the post-sweep executable set has **five** members: the four enumerated plus `check-req-size.sh`. Two consequences, both product-visible. (i) `check-req-size.sh` is a hook AC-3.3 explicitly names — "the scope-field and **REQ-size** warnings emit" (REQ AC-3.3) — and is one of the four surviving `hooks.json` entries the TSPEC's own §4.4 L-6 row 2 counts (`pdlc/hooks/hooks.json:9,20,24,34`; `:24` is `check-req-size.sh`). It has no mode-bit oracle today (it was never in `FIVE_SCRIPTS`) and gains none here, so the post-sweep tree ships a hook whose lost execute bit fails silently — the exact failure mode the v2 finding was raised about. (ii) As written the row cannot go green: the enumeration and the tracked-executable set are not set-equal, so the companion assertion reds on a correct sweep, or gets quietly relaxed to containment during implementation, which is the guard the row exists to provide. Fix: add `pdlc/hooks/scripts/check-req-size.sh` to TT-3's enumeration (five members post-sweep) and keep the set-equality companion as stated. | REQ AC-3.3, AC-1.7; FSPEC AT-3.3 |
| F-02 | Low | Local | **§4.4 attributes three hooks to AC-3.3; AC-3.3 names four.** The paragraph reads "`check-scope-field.sh`, `guard-harvest-before-delete.sh` and `nudge-consolidation.sh` survive unchanged as **the three hooks AC-3.3 names**", and §5.2's TT-3 inherits the same framing ("the three surviving hook scripts"). AC-3.3 names four surviving behaviours — "harvest guard refuses a premature review-file deletion; the scope-field **and REQ-size** warnings emit; the consolidation nudge reaches the human session" (`REQ-pdlc-plugin-retirement.md`, AC-3.3) — and AC-1.7's surviving hook-entry set is likewise four. The correct statement is that three of `FIVE_SCRIPTS`'s five members survive, and that `FIVE_SCRIPTS` was never coextensive with AC-3.3's hook set. This is the sentence that produced F-01's short enumeration, so the two corrections land together; recorded separately because the miscited requirement will otherwise propagate into PLAN and PROPERTIES as "three hooks". | REQ AC-3.3 |
| F-03 | Low | Local | **§5.2's AT-3.3 clause 2 row names two different host modules for the same new assertion, and overstates what is uncovered today.** The row opens "Both conjuncts land in the retained `hookCompatibility.test.js` (§2.6) in class 6's reduction commit, because **neither is covered today**", then says of `nudge-consolidation.sh` that "a new stdout-JSON-plus-exit-`0` assertion for it is added **there**" in a sentence whose immediately preceding subject is `consolidationHookParity.test.js`. An implementer cannot tell which module owns the nudge oracle. Separately, "neither is covered today" is too strong for `check-scope-field.sh`: `PROP-COMPAT-04` already asserts `expect(exitCode).toBe(0)` (`pdlc/workflows/__tests__/hookCompatibility.test.js:100`) alongside the two `toContain` lines (`:102`–`:103`), so what is missing is the parsed-JSON conjunct, not the exit conjunct. The substance of the row is right and the strengthening is worth doing; the fix is to name one host module explicitly for the nudge assertion and to narrow the "neither is covered" clause to the JSON shape. | REQ AC-3.3; FSPEC AT-3.3 |

FINDING: High | delta | local | §5.2 row TT-3 half (b) / §4.4 bootstrap paragraph | TT-3's set-equal enumeration omits `check-req-size.sh`, an AC-3.3/AC-1.7 surviving hook tracked `100755`, so that hook still ships with no mode-bit oracle and the row's own tracked-executable set-equality assertion cannot pass
FINDING: Low | delta | local | §4.4 bootstrap paragraph | "the three hooks AC-3.3 names" miscites AC-3.3, which names four surviving hooks including the REQ-size warning
FINDING: Low | delta | local | §5.2 AT-3.3 clause 2 row | host module for the new nudge assertion is stated as both `hookCompatibility.test.js` and `consolidationHookParity.test.js`; "neither is covered today" overstates the gap for `check-scope-field.sh` (`hookCompatibility.test.js:100` already asserts exit `0`)

## Questions

| ID | Question |
|----|---------|
| Q-01 | TT-3's set-equality companion is scoped to executables under `pdlc/hooks/scripts/`. Should it also pin the *converse* direction that matters to AC-1.7 — that every enumerated script is still registered in `pdlc/hooks/hooks.json`, `cleanup-consumer-workflows.sh` excepted as the deliberate non-hook (§3.2, "Never registered as a hook")? Without it, a hook could keep its mode bit while losing its manifest entry and TT-3 would stay green; AC-1.7's own hook-set equality covers that today, so this may be redundant by design — worth one sentence either way so the next reader does not add it twice. |
| Q-02 | §2.6's new helper-survivorship paragraph resolves `helpers/freshClone.js` as surviving with `consumerCleanup.test.js` as its sole post-sweep consumer. Verified against the tree (`grep -rln "helpers/freshClone"` returns `bootstrap.test.js` alone today). Is that survivorship pinned anywhere an implementer would trip over it — a class-3 exclusion note in the PLAN task, say — or does it rely on the sweeper reading §2.6? The same paragraph's `helpers/driftOrdering.js` deletion is the mirror case and is easier to get wrong in the other direction. |

## Positive Observations

- **§4.5's clause 1(b) rewrite is the model fix for a spec-level oracle defect.** It did not merely
  restate the rule: it replaced prose with a five-row table that says, per path, enumerated or not
  and why, transcribes the six `outcomes` keys in the code's own spelling (quoted `"max-passes"`
  included, matching `pdlc/engine/lib/report.mjs:71` exactly), and then states in plain terms what
  the old shape let through ("it let `engine.outcomes.blocked` or `engine.dispatches.byPhase` vanish
  in the sweep while clause 1 passed on set-equality and clause 2 skipped the same paths as
  excluded"). Naming the false-green the previous version admitted is what lets a reviewer check the
  fix instead of trusting it.
- **§3.2's 4a/4b split is a genuine spec improvement, not a bookkeeping response.** The v2 row 4
  bundled an argument-parse error with a mid-`rm` runtime failure under one expectation, and TT-1
  asserted "removes nothing" over both — true only of the first. The revision splits the row, scopes
  TT-1 to 4a where the conjunct is true by construction, and gives 4b a weaker but *codeable*
  expectation (exit `4`, no further removal attempted, partial state reported). The reasoning is
  stated: "Bundling the two under one row left the second arm with neither an oracle nor an
  expectation an implementer could code to." That is the right instinct — an oracle that cannot be
  true is worse than an honest weaker one — and §6.1 erratum 7 was amended to route the pair
  upstream rather than annexing the product decision here.
- **§2.7's anchor correction is exactly the DEC-DOC-01 discipline.** The document corrected its own
  `:47` to `:48` and said what `:47` actually is (the "no code path can mutate a shipped default"
  comment). Verified: `pdlc/workflows/orchestrate-dev.js:47` is that comment line and `:48` opens
  `export const MERGE_GUARD_DEFAULTS = Object.freeze([`. Elsewhere in the same round the document
  moved *away* from line anchors toward symbol anchors (`const FIVE_SCRIPTS`, `describe("§9.3: …")`),
  which is the more durable citation form for a doc whose subject file is being deleted.
- **§4.4's withdrawal of the v0.2 `consolidationHookParity.test.js` citation is honest and correct.**
  The row now states that file's `expect(result.status).toBe(0)` is a `git ls-files` call, not the
  hook's exit. Verified at `consolidationHookParity.test.js:414` — the assertion sits directly under
  a `git ls-files --cached --others --exclude-standard` invocation, and `grep -n "exitCode"` over that
  module returns only the helper's construction site at `:148`, never an assertion. A citation that
  turned out not to cover what it was cited for was withdrawn in writing rather than quietly dropped.
- **§2.6's helper survivorship paragraph closes a collateral-damage gap nobody asked about.** Each of
  the four claims checks out at HEAD: `driftCapabilities.js` keeps `documentOracles.test.js` and
  `skipSinkTransport.test.js`; `skipSink.js` keeps `skipSinkTransport.test.js`; `freshClone.js`'s only
  consumer today is `bootstrap.test.js` and TT-3 regains it; `driftOrdering.js` is consumed only by
  `bootstrap.test.js` and `drift*.test.js` modules, all of which the sweep deletes. Stating
  survivorship rather than leaving it implicit is what keeps a "delete the drift helpers" task from
  taking a surviving helper with it.

## Recommendation

**Needs revision** — one High finding, narrow and mechanical.

Required changes:

1. **F-01 (High)** — Add `pdlc/hooks/scripts/check-req-size.sh` to §5.2 TT-3 half (b)'s enumeration,
   so the set-equal list is the five post-sweep executables (`cleanup-consumer-workflows.sh`,
   `check-req-size.sh`, `check-scope-field.sh`, `guard-harvest-before-delete.sh`,
   `nudge-consolidation.sh`). Keep the companion tracked-executable set-equality assertion exactly as
   drafted — with the fifth member present it holds, and it is what keeps a later-added script from
   shipping unlisted without a mode bit.
2. **F-02 (Low, lands with F-01)** — In §4.4, replace "the three hooks AC-3.3 names" with a statement
   that three of `FIVE_SCRIPTS`'s members survive and that `FIVE_SCRIPTS` never covered AC-3.3's
   fourth hook, `check-req-size.sh` — which is why the re-homed set is wider than the surviving
   subset of `FIVE_SCRIPTS`.
3. **F-03 (Low)** — In §5.2's AT-3.3 clause 2 row, name one host module for the new
   `nudge-consolidation.sh` stdout-JSON-plus-exit-`0` assertion, and narrow "neither is covered today"
   to the parsed-JSON conjunct, since `PROP-COMPAT-04` already asserts exit `0`
   (`hookCompatibility.test.js:100`).

Nothing else in this round's diff needs change. §4.5 clause 1(b) is closed against the code, §3.2's
row split and §6.1 erratum 7's amendment are sound, §2.6's survivorship claims and §2.7's anchor
correction verify at HEAD, and no unchanged section was re-opened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
