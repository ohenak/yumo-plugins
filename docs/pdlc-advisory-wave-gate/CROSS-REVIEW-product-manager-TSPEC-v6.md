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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §4.5's un-skip overwrite-notice row (`:1498`) names the helper and the sink but not where `snapshotRef` is read at that site: the seam has returned, and the surviving carrier is `resolvedAdvisoryFields` (`orchestrate-dev.js:15402`), forwarded to the un-skip halt at `:15434`. Fix: one clause naming `resolvedAdvisoryFields.snapshotRef` as the value the un-skip push renders from. | BR-14, AC-6.3 (REQ v1.16), AT-06-4 |
| F-02 | Low | Local | §5.6 (`:1942`) and §4.5 (`:1498`) state in the present tense that "PLAN covers it under this AT's task". PLAN at HEAD carries no mention of the overwrite notice, `renderSnapshotOverwriteNotice`, or `AT-06-4b`; `PLAN:527` maps `AT-06-4` alone and A6-18's coverage list (`PLAN:331`) stops at `AT-05-3, AT-06-4, AT-07-1`. Fix: state it as the obligation on PLAN that it is, not as PLAN's current content. | BR-14, AT-06-4 / AT-06-4b |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v5 and still open at Phase P, not against this document: PLAN needs a home for `AT-06-4b`, for the notice push in `runWaveGateSeam`, for the separate un-skip push site, and for the three shipped-oracle widenings §5.1 now names (`advisoryWaveGate.test.js`'s four, `advisoryWaveGateMain.test.js`'s one, `advisoryEscalationLog.test.js`'s count). §5.1's row text is precise enough to transcribe directly — this is a routing note, not a gap in the TSPEC. |
| Q-02 | `PLAN:331`'s A6-18 still says "Capture failure: **six** positive assertions on one run" — the very numeral §5.2 dropped this round for going stale. Worth sweeping when PLAN absorbs v1.15 so the two documents do not disagree about a count neither of them needs. |

## Positive Observations

- **The round found a defect nobody had asked about, and it was the expensive one.** TE F-01's
  observation — that `toEqual` fails on an *extra* key exactly as on a missing one, so the four
  shipped four-key halt-field equalities are counterparties of the new five-key one, not bystanders —
  is the difference between a design that lands red-to-green in one task and one that ships a
  surprise red suite at a wave boundary with no expected-red channel. §5.1 and §5.2 now name each
  affected assertion individually, and every one of the five checks out at HEAD.
- **The trap is named, not just the fix.** §5.2 states the cheap way to go green — leave `snapshotRef`
  off the capture-failure `fields` — and why it is a false green: it deletes the only positive oracle
  for the `null` value and neuters both AT-06-4 arms. Writing down the failure mode an implementer
  under gate pressure would actually reach for is worth more than the widening instruction itself.
- **The exact-count consequence was volunteered before a reviewer could find it.** `advisoryEscalationLog.test.js`'s
  `toHaveLength(2)` becoming three is the kind of collateral that normally surfaces as a red suite
  three tasks later. Naming it in §4.5 *and* owning it in §5.1's row is the right discipline, and my
  own sweep of the suite found no second one it missed.
- **The v5 Low was over-repaired in the useful direction.** The finding asked only that
  `TEST_GATE_MESSAGE` stop being called a symbol. The round also corrected AT-05-3's oracle *form* to
  the containment the suite actually ships — so the next reader is not told to preserve an equality
  that was never there.
- **PM Q-02 was answered on the operator's story, not on convenience.** The un-skip arm is in scope
  because "you are about to lose the capture you might want to inspect" reads identically there — and
  the answer accepts the cost that this one push cannot live in the seam. Declining to mint an AT id
  for a third arm of one AT keeps the AT set-equality at forty-eight and keeps the id namespace
  meaningful.
- **The delta stayed inside its lens.** Five commits, one per section, no design change, nothing
  previously approved reopened, and BR-14's wording still owned by FSPEC.

## Recommendation

**Approved**

Both v5 Low findings are resolved on the merits, and every load-bearing claim this round added was
verified against `pdlc/workflows` at HEAD rather than against the TSPEC's prose: the `_notice` seam
parameter and its default (`orchestrate-dev.js:3383`, `:3385`), the call site and sink (`:15387`,
`:14635`), the halt throw (`:15399`), the un-skip forward (`:15402`, `:15434`), all five shipped
four-key oracles (`advisoryWaveGate.test.js:1699`, `:2676`, `:2714`, `:3369`, `:3425`, `:3462`;
`advisoryWaveGateMain.test.js:373`), AT-05-3's containment oracles (`advisoryWaveGateMain.test.js:368`,
`waveExecution.test.js:571`), and the single moving exact count (`advisoryEscalationLog.test.js:821`).
Nothing previously approved is broken: AT-05-3's oracle is explicitly preserved, §1.2's no-new-file
constraint holds, and §5.6's AT set-equality is unchanged at forty-eight.

The two Low findings are recorded and not gating — F-01's one-clause value-source note and F-02's
tense correction can ride whichever edit next touches §4.5/§5.6, or be absorbed by PLAN's author at
Phase P alongside Q-01 and Q-02.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:1f6ea4869d10dad1112510d588bf8d836bb4fd9f688dbde0ad5ece6ff9393f0b
APPROVAL-HASH-NORMALIZED: sha256:ef2278cb9cd10674860de447e52507401639f69213fb0bff1b72c28d59475272
REVIEWED-COMMIT: ffbc2b18b5652165760168f12da657efd66d2635
UPSTREAM-STATE: REQ sha256:f97f4f6601406b5a6b5adb6dbc2e6f79d81218119c9b4238854f3431e8e6fab7
UPSTREAM-STATE: FSPEC sha256:d602c440fc9f3e76904419399c787d617e541d798d0348e07b9c2005b39dfe0e
