# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.15)
**Date:** 2026-08-20
**Iteration:** 6 (delta re-review)
**Delta reviewed:** `6f00074c..HEAD` (5 commits, 76 insertions / 13 deletions)

## Scope

A delta re-review, not a re-read. v5 closed **Approved with minor changes** — zero High, two Low
(F-01: §4.5 cited `TEST_GATE_MESSAGE` as a production symbol that does not exist; F-02: §5.2's
stale "six positive assertions" numeral). This round landed five commits — `5824d064`, `aac5dc9e`,
`f41e280f`, `c450e6cb`, `ffbc2b18` — touching only §4.5 (the push site, the gate-message anchor,
the un-skip row), §5.1 (the shipped four-key oracles named as edits, a new row for
`advisoryWaveGateMain.test.js`), §5.2 (five-key equality *replaces* four-key, numeral dropped),
§5.6 (AT-06-4's quantifier coverage of the un-skip arm) and the lineage header / changelog.

I read only those sections, plus every production and test symbol the new prose names. Sections
approved in earlier rounds and untouched by this delta are not re-litigated. Every claim below was
checked against `pdlc/workflows` at HEAD, not against the TSPEC's own account of it.

## Prior findings disposition

Both v5 Lows are resolved on the merits, not reworded away.

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v5 F-01 | Low | **Resolved** | §4.5's survival paragraph now names the real thing: "the per-wave template `Error: Wave ${waveNum} test gate failed — …` built at the call site, *not* a module constant", and states explicitly that `TEST_GATE_MESSAGE` is §2.3 pseudocode shorthand with "no such symbol exists in `pdlc/workflows`" (TSPEC `:1470-1477`). Confirmed: `grep -rn TEST_GATE_MESSAGE pdlc/` returns nothing; the literal is `orchestrate-dev.js:15359`, thrown at `:15399`. The round went further than the finding asked and corrected the *oracle form* too — AT-05-3 ships as **containment**, not equality: `advisoryWaveGateMain.test.js:368` `expect(result.haltReason).toContain("Wave 1 test gate failed")` and `waveExecution.test.js:571` / `:1092` `.toContain("Error: Wave 1 test gate failed")`. Both transcriptions are exact. |
| v5 F-02 | Low | **Resolved** | The numeral is gone; the claim it carried is kept: "Every item in this inventory is a positive assertion on one fixture, not an absence check" (TSPEC `:1642-1647`), with a one-clause note on why the count went stale. This is the right repair — the count was never the point. |

## New findings in changed sections

Nothing in the delta reopens an approved section, and no product decision is taken at TSPEC
altitude: BR-14's wording still lives in FSPEC, and this round only names *where* the already-agreed
notice is pushed and *which shipped oracles* the fifth field moves. I verified the load-bearing new
claims at HEAD, since this round's whole content is claims about existing test and production code.

**The push site is real and reachable (§4.5, `:1459`).** `runWaveGateSeam` does take `_notice`
(`orchestrate-dev.js:3383`) and opens with `const notice = typeof _notice === "function" ? _notice : () => {}`
(`:3385`) — transcribed exactly. The wave-loop call site passes `_notice: advisoryNotice` (`:15387`),
the sink is `const advisoryNotice = (line) => notices.push(line)` (`:14635`), and the unresolved
return is turned into a halt at `:15399`, quoted correctly as
`if (!a6.resolved) throw haltError(testGateMessage, …)`. The claim that both §5.6 fixtures are
seam-level runs that already wire `_notice` holds: `makeA6RunArgs` defaults `_notice: () => {}`
(`advisoryWaveGate.test.js:996`) and the Oracle-G runs override it with
`_notice: (m) => notices.push(m)` (`:3412`, `:3452`, `:3494`) — the exact snippet §4.5 cites.

**TE F-01's four counterparty oracles are enumerated correctly (§5.1 `:1528`, §5.2 `:1626`).** All
four exist, all four are four-key `toEqual`s over `haltFields`: Oracle G's own literal
(`advisoryWaveGate.test.js:1699-1705`), the `ORACLE_G_HALT_FIELDS` literal (`:3369-3375`) and its two
comparisons (`:3425`, `:3462`), the escalation-path literal (`:2676`), and the only key-*set*
assertion, `expect(Object.keys(result.haltFields).sort()).toEqual(["diagnosis","repairApplied","repairPaths","rootCause"])`
(`:2714-2719`). The reasoning is right and the product consequence is stated in the form that
matters: dropping `snapshotRef` from the capture-failure `fields` to stay green would delete the only
positive oracle for the `null` value and false-green **both** AT-06-4 arms (`:1631-1637`). That is a
falsifiability argument, not a bookkeeping one.

**The new §5.1 row is accurate.** `advisoryWaveGateMain.test.js` exists, runs `mainDev` with no
`_runWaveGateSeam` injection (`:1`, `:9`, `:21`), and its halt oracle is the four-key
`expect(result.haltAdvisory).toEqual({rootCause: "plan-ordering-defect", diagnosis: …, repairApplied: false, repairPaths: []})`
(`:373-378`). The contrast drawn against `waveExecution.test.js` checks out: that file has exactly two
`haltAdvisory` `toEqual`s (`:1094`, `:1275`) and both compare against fields the fixture handed the
loop, so they follow the fake's shape and need no widening.

**I re-ran the counterparty sweep myself rather than trusting "the one exact-count oracle".** §4.5
claims `advisoryEscalationLog.test.js`'s `expect(failed.notices).toHaveLength(2)` is the only exact
count the push moves. Confirmed at `:821`, on a `runA6Escalation` pair over a real temp repo, with
the two `arrayContaining` content assertions intact at `:822-828`. Sweeping the whole suite for
run-derived notice counts turns up nothing else that reddens: `advisoryEscalationLog.test.js:497`
counts a locally constructed two-element array in a pure PROP-ESC-09 unit test; `waveExecution.test.js:590`,
`:749`, `:2648` count *filtered log lines* on non-A6 paths; and `advisoryWaveGateMain.test.js`'s
AC-1.5 cardinality arms count only strings matching the specific inapplicability predicate
(`:182-185`), so an overwrite notice cannot perturb them. The "one" is genuinely one.

**PM Q-02 is answered in scope, and the answer is the product-correct one (§4.5 `:1498`, §5.6 `:1942`).**
The un-skip arm is owed the notice: BR-14's operator story reads identically on a resolved wave whose
un-skip guard then halts. The mechanism named is sound at HEAD — the seam has returned by then, and
`advisoryNotice` is indeed still in scope at the un-skip halt site, which sits in the same `main` body
(`orchestrate-dev.js:15434`, sink declared `:14635`). Adding no AT id keeps §5.6's set-equality at
forty-eight, which is the right call: a third arm of one AT is not a new acceptance test.

Two Low items remain, both narrow.

### §4.5's un-skip row names the push site but not where the value comes from (F-01, Low)

The row says the push "is emitted at the un-skip halt site from the same
`renderSnapshotOverwriteNotice(snapshotRef)` helper" (`:1498`). At that site the seam's return value
is no longer in hand; what survives is `resolvedAdvisoryFields = a6.haltFields`
(`orchestrate-dev.js:15402`), which is what the un-skip halt forwards (`:15434`). Under this design
`haltFields` gains `snapshotRef` as its fifth key, so the value *is* reachable — but the TSPEC leaves
the implementer to rediscover the carrier. One clause naming `resolvedAdvisoryFields.snapshotRef`
closes it, and costs nothing given §5.1 already names every other edit site.

### §5.6 asserts PLAN coverage that PLAN does not yet carry (F-02, Low)

§5.6's new quantifier note states "PLAN covers it under this AT's task rather than minting a witness"
(`:1942`), and §4.5's row makes the same present-tense claim. At HEAD, PLAN mentions neither the
overwrite notice nor `renderSnapshotOverwriteNotice` (`grep -n "overwrite\|renderSnapshotOverwriteNotice" PLAN-…md` → no matches),
`AT-06-4b` appears nowhere in it, and `PLAN:527` maps `AT-06-4` alone. PLAN is downstream of this
TSPEC and will absorb all of it, so this is not a defect of PLAN's — it is a tense problem here.
Writing it as an obligation on PLAN ("PLAN is to cover…") rather than as a statement of PLAN's
current content keeps the document honest between now and Phase P.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
