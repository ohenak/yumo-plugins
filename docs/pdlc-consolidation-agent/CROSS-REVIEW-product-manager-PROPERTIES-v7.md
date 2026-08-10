# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 7
**Scope:** Delta re-review of the v1.6 revision (`01841250..HEAD`), which closes my v6 F-01 and F-02.
Product lens only.

## Method

Delta protocol. `git diff 01841250..HEAD` on the document is **five hunks, 55 insertions / 11
deletions**, landed in five commits (`8b2d155b`, `aca59b1d`, `2e5684a2`, `1c5f5332`, `7545fea1`):
the version/changelog block (`:13-30`), PROP-COR-09's body (`:437-458`), PROP-PASS-11's title and
body (`:1415-1431`), §12.4's preamble and AT-K row (`:1840-1853`), §12.4's `(no FSPEC AT)` roll
(`:1866-1868`), and §13.3 errata 8–9 (`:2003-2024`). No property added, removed or renumbered. I
re-verified my two prior findings, then read only the changed regions plus the upstream cells they
newly cite.

**Prior findings.**

- **F-01 (High) — resolved.** PROP-COR-09's trailer now reads `AT-K3b, TSPEC §12.2` (`:458`) in
  place of `(no FSPEC AT)`, the body binds the second fixture to the register row explicitly
  (`:437-441`), §12.4's AT-K row carries `AT-K3b → PROP-COR-09` (`:1853`), and PROP-COR-09 is struck
  from the `(no FSPEC AT)` roll (`:1866-1868`). Q-01's placement question is answered on the record
  (`:454-457`): the id stays in `consolidationPass.test.js` on the subject argument, and the
  divergence from AT-K1…AT-K7's home is disclosed rather than glossed.
- **F-02 (Medium) — resolved.** PROP-PASS-11's title and body no longer claim AC-1.4 has two causes;
  they state three (`REQ:224-233`), pin the two that differ on consumed-set emptiness, and point the
  third at PROP-COR-09 (`:1415-1424`).

**Grounding checks.**

- `AT-K3b` exists at `FSPEC-…:2210` and is bound to AC-1.4 in FSPEC §15's map (`:2388`) — the claim
  is real, not asserted.
- `grep AT-K3b` returns **zero** hits in TSPEC and PLAN at HEAD, so §13.3 erratum 8 is accurate.
  TSPEC §12.2 (`:2850`) still asserts *"which no register AT reaches either"*; PLAN T20 (`:365`)
  still requires *"contains **both** basenames"*. Both are correctly routed as errata and correctly
  **not** edited here.
- §12.4's "one id post-dates the v11.5 measurement" is **true**: enumerating register ids over FSPEC
  §13 (`:2116-2267`) at v11.7 gives **100**, against the 99 recorded at v11.5. The delta is exactly
  `AT-K3b`.
- The id set is unchanged at **118** unique `PROP-…` ids, matching the changelog.
- `consolidationPass.test.js` exists at HEAD (`pdlc/workflows/__tests__/`), and PLAN T20 owns it as
  a **new** file — the named carrier is planned, not invented.
- REQ AC-1.4 (`REQ:224-233`) does enumerate three causes and does decide streaks on consumed-set
  emptiness, so PROP-PASS-11's revised framing transcribes the REQ rather than reinterpreting it.

One thing the revision added is not sound, and it is new text in a changed region: F-01 below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **PROP-COR-09 claims `AT-K3b` but delegates one of its four Then-conjuncts to a property whose fixture is a different cause, so no fixture proves it.** New text at `:441-442` reads: *"Its `no CONSOLIDATION-PROPOSAL-*.md for that passId` conjunct is PROP-RTE-06(b)'s, **on the same terminal status**, and is not restated here."* PROP-RTE-06(b) (`:1052-1054`) is *"a `no-op` pass where everything was **duplicate-suppressed**"* — AC-1.4's **second** cause. AT-K3b's Given is the **all-unreadable corpus** — the third cause. Two different passes. The delegation therefore transfers a conjunct across Givens, and the justification offered for it is exactly the reasoning PROP-RTE-06's own body rejects three lines later: *"(a) and (b) sit side by side because they reach 'no cause' by different routes while **§5.3 decides on causes rather than on terminal status**"* (`:1057-1058`). If status does not decide the proposal file for (a) vs (b), it does not decide it for the third cause either. Net effect on the product contract: AC-1.4 promises a `no-op` pass *"exits successfully **without opening a PR or writing a proposal file**"*, and on the all-unreadable cause **no property asserts the proposal file is absent** — an implementation that writes `CONSOLIDATION-PROPOSAL-{passId}.md` whenever the corpus is unreadable is green across the whole suite. Fix (either is sufficient, and neither adds a task): add the `no CONSOLIDATION-PROPOSAL-*.md for that passId` conjunct to PROP-COR-09's all-unreadable fixture, asserted through the write double's recorded path set as PROP-RTE-06 does; **or** add a fourth fixture to PROP-RTE-06 with the all-unreadable Given, and say so in PROP-COR-09's trailer. Prefer the first — PROP-COR-09 already owns the id and already drives this pass. | AC-1.4 (third cause), REQ §4b, AT-K3b (`FSPEC:2210`) |
| F-02 | Medium | Local | **PROP-TRC-01's version pins are stale in both cells, and the revision makes the staleness self-evident without fixing it.** PROP-TRC-01 (`:1615`) pins *"FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`"*, and declares the property *"**green on write**"* with no `describe.skip` (`:1622-1625`). At HEAD FSPEC's cell reads **11.7** (`FSPEC:12`) and TSPEC's reads **2.7** (`TSPEC:12`), so both conjuncts are false as written, and the set-equality conjunct is short one id until erratum 8 lands. The v1.6 revision states this itself at `:1840-1844` — *"One id post-dates that measurement"* — three lines above a table whose header still reads *"Read against the register at FSPEC **v11.5**"*, so the document now names the drift in §12.4 while §10.4 still tells an implementer the property is green. The pins are the right mechanism (a failure should read *"the register moved"*); they just need re-pinning to 11.7 / 2.7, the 99 re-measured to 100, and PROP-TRC-01's green-on-write claim qualified as *green once erratum 8 lands*. Not gating: the failure mode is a **red** test with a legible message, not a false green, and the version-pin half predates this revision. | NFR-5, PROP-TRC-01 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's cheaper fix puts a `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` path-set assertion inside `consolidationPass.test.js`, where PROP-RTE-06 owns that observable in `consolidationRoute.test.js`. That is not a register-id collision (PROP-COR-09 claims `AT-K3b`, PROP-RTE-06 claims `AT-R7`, no file claims either twice), but it does put the same observable in two files. Is that acceptable under §12.3's one-file-per-**id** rule as you read it, or do you prefer PROP-RTE-06 growing a fourth fixture to keep the observable in one place? No product stake in the answer — I raise it because F-01's fix has to choose. |

## Positive Observations

- **The register claim is grounded in the FSPEC row, not in the changelog.** PROP-COR-09 quotes
  AT-K3b's own Given and Then (`:438-441`) and maps them onto the fixture's four observables, so a
  reader can check the binding without opening the FSPEC. That is the form of claim that survives an
  erratum round, and it is what my v6 F-01 asked for.
- **The placement divergence is disclosed, not hidden.** §12.4's AT-K row (`:1853`) says plainly that
  the AT-K **family** now spans two files, gives the subject argument for it, and names erratum 8 as
  the route by which TSPEC and PLAN catch up. An author optimising for a clean-looking table would
  have quietly filed AT-K3b under the credential file and broken the subject rule; this one wrote
  down the cost instead.
- **The `(no FSPEC AT)` roll was maintained, not just appended to.** PROP-COR-09 was **removed** from
  the roll (`:1866-1868`) with the reason inline. Enumerations that only ever grow are how these
  tables rot; this one was edited in both directions in the same revision.
- **The one-id delta is stated so a future counter can reconcile it.** §12.4 names AT-K3b as the
  single id post-dating the v11.5 measurement rather than silently re-counting — and it checks out
  (100 at v11.7 vs 99 at v11.5). A reader who re-measures and gets a different number now knows
  whether they found a new drift or the known one.
- **PROP-PASS-11's correction went further than my finding asked.** I flagged only the stale "two
  causes" phrasing; the revision also qualifies the PROP-PASS-09 set-equality sentence (`:1424-1426`)
  so it no longer implies closure over the status's whole cause set. The narrower claim is the true
  one.
- **The errata are routed, not folded.** Both TSPEC §12.2/§12.3/§12.4 and PLAN T20 are named with
  file:line evidence and left unedited (`:2003-2024`), and erratum 9 correctly identifies that PLAN
  T20's *"contains **both** basenames"* would have an implementer build the behaviour REQ §4b exists
  to prevent. That is the finding I would most want caught before Phase I.

## Recommendation

**Needs revision**

One High finding. Both of my v6 findings are closed, and the way they were closed is right —
AT-K3b is claimed with its oracle quoted, the placement cost is on the record, and the roll and the
map were both maintained. The one High is a defect the revision **introduced** in changed text, not
a re-litigation: in binding PROP-COR-09 to AT-K3b, the revision delegated one of the register row's
four Then-conjuncts to PROP-RTE-06(b), whose fixture is AC-1.4's second cause, on a status argument
that PROP-RTE-06's own body rejects. The result is that AC-1.4's "no proposal file" promise has no
carrier on the third cause.

To close:

1. Add the `no CONSOLIDATION-PROPOSAL-*.md exists for that passId` conjunct to PROP-COR-09's
   all-unreadable fixture — asserted through the write double's recorded path set, as PROP-RTE-06
   does — and delete the delegation sentence at `:441-442`. Or take Q-01's alternative and grow
   PROP-RTE-06 to a fourth fixture, saying so in PROP-COR-09's trailer. Either way, all four of
   AT-K3b's Then-conjuncts must have a fixture on AT-K3b's Given.
2. Re-pin PROP-TRC-01 to FSPEC `11.7` / TSPEC `2.7`, re-measure 99 → 100, and qualify the
   green-on-write claim as conditional on erratum 8 (Medium; not gating).

Errata 8 and 9 route upstream and are not this document's to fix. I raise no new errata this round.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
