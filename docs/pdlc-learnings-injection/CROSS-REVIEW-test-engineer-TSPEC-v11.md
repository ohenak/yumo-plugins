# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 11
**Round type:** delta confirmation (erratum edit `e33425a6..bfe58851`, TSPEC v0.6 → v0.7)

## Overview

**Question answered:** does the v0.7 erratum (`e33425a6..bfe58851`) land the four routed items
without breaking what v10 approved, and is the TSPEC still a faithful compression of REQ
`sha256:ff605dd3…` (v0.9) and FSPEC `sha256:fb18dbda…` (v0.12) as they stand at this dispatch?

**Answer: yes, with minor changes.** All four routed items land, and two of them land better than
the item text asked: §D.1's non-`null` scoping is stated as a *reason* (the healthy value of a
corpus-outcome field) rather than a hedge, and it keeps the catalogue set-equality test intact
(`null` is deliberately not a catalogue member), so the domain oracle is narrowed without being made
unfalsifiable. The two stale-anchor items are repaired by symbol/shape citation per DEC-DOC-01, and
I re-verified both against HEAD: the three object-literal `dispatchKind: "authoring"` sites and the
one positional argument resolve exactly as §A.2 now describes them, and P-10's conditional spread is
the last of four trailing spreads in `buildFinalReport`'s returned literal. Beyond the item list,
the round also absorbed FSPEC v0.11/v0.12 into §A.2 and closed ERR-3 and ERR-7 — my v10 F-02, F-03
and F-04 — which I re-read against upstream and confirm as faithful.

**What did not land.** My v10 F-01 (Medium) survives the round: §T.6's AT-02 paragraph still
fixtures three run shapes plus an erratum-retry fourth, while upstream AT-02 at v0.12 enumerates a
different fourth — the authoring-classified dispatch whose target is none of C-1's six document
types, the one carrying the mutation obligation "reverting BR-1's second conjunct reds this test".
§A.2 *names* that obligation in this very round (TSPEC:174) without §T.6's fixture list acquiring
it, so the document now states the obligation in one section and omits it from the section a PLAN
author transcribes fixtures from. Non-gating, but it is the finding most likely to become a
coverage hole.

**Anchor residue.** The erratum de-anchored P-2a, P-2b, P-10, ERR-2 and §T.6's land-proof retry, and
in doing so confirmed the file has shifted ~40–140 lines since the anchors were minted. The
enumerations it did *not* de-anchor are stale in the same way — §A.2's six `converge()` `docType`
sites, §A.5's `notices` sink, P-7/P-8's seam definitions. Every underlying proposition is still true
at HEAD (I checked each by symbol), so these are citation-hygiene findings at DEC-DOC-01's Low bar,
not falsified claims.

**No High finding, so this confirmation does not halt the phase.**

## Architecture

**Item 3 (P-2a's stale anchors) — landed, and re-verified at HEAD.** The row no longer carries
`:13515`, `:12821`, `:12915`. It now names four sites by enclosing symbol and call shape. I checked
each against `pdlc/workflows/orchestrate-dev.js` at HEAD:

| TSPEC's claim | HEAD |
|---|---|
| `converge()`'s phase-creator `wrappedDispatch({… docType, dispatchKind: "authoring", phaseId, sessionKey })` | `converge` opens at `:13628`; the creator `wrappedDispatch` carries `dispatchKind: "authoring"` at `:13657`, with exactly the named property shape |
| two inside `erratumRound()`, both `wrappedDispatch({… docType: target, dispatchKind: "authoring", … })` | `erratumRound` opens at `:12790`; both sites (`:12861` erratum author, `:12955` land-proof retry) are inside it and both pass `docType: target` |
| `reviewLoop()`'s optimizer `runWrapped(optimizer, optPrompt, doc, "authoring", authorSessionKey(feature, roundDocType, phase))` | verbatim at `:7663` |
| **four** sites total | `grep 'dispatchKind: "authoring"'` yields exactly `:12861`, `:12955`, `:13657`; the positional `"authoring"` argument is `:7663` — four, no fifth |

The count, the symbol attribution and the two call shapes are all correct, and the citation is now
readable without a line number, which is what DEC-DOC-01 asks for.

**Item 4 (P-10's stale conditional-spread anchor) — landed, and re-verified at HEAD.**
`buildFinalReport` is defined at `:15240`; its returned object literal ends with four trailing
conditional spreads, `...(prUrl …)`, `...(ciStatus …)`, `...(haltReason …)`, `...(advisory ?
{ advisory } : {})` at `:15309`. TSPEC's new cell names exactly that quartet and exactly that
position. The old `:15167` was, as routed, a §4.7 comment. Correct.

**P-2b — landed, no regression.** The Phase CR call is restated as `reviewLoop({ doc: <the feature's
docs directory>, phase: "CR", docType: null, … })` with `roundDocType = docType === undefined ?
docTypeFromPath(doc) : docType` quoted inline. At HEAD `reviewLoop`'s `wrapped` helper forwards
`docType: roundDocType` into `dispatchAndVerify` at `:7342-7358`, so the `null`-survival chain the
`docType` conjunct rests on is intact. This is the load-bearing premise of §A.2 and it still holds.

**Absorption of FSPEC v0.11/v0.12 into §A.2 — faithful.** §A.2 no longer routes the `docType`
conjunct as a divergence. I diffed its new paraphrase against BR-1 at HEAD: BR-1 reads "**both**
hold: the pipeline classifies it as authoring, **and** its target document is one of REQ, FSPEC,
TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)", names the second conjunct "load-bearing, not
defensive", and names "the code-review phase's optimizer round at HEAD" as the excluded branch.
TSPEC's quotation and its attribution of the complement to BR-11/AT-03/AT-29/D-2 are accurate, and
D-2 at FSPEC:274 does carry the three-way branch table TSPEC credits it with.

**What the round left stale in this section.** The invariant paragraph immediately below still
enumerates `converge()`'s six `docType`s by line — `REQ` `:13766`, `FSPEC` `:13774`, `TSPEC`
`:13807`, `DECISIONS` `:13874`, `PLAN` `:13893`, `PROPERTIES` `:13996`. At HEAD those lines are
`forceParse.badTokens`, `harvestStatus: "Not run"` and `let prUrl` respectively; the real call sites
are `:13908`, `:13916`, `:13949`, `:14016`, `:14035`, `:14138`. The **claim** — that the six
`docType`s `converge()` drives equal `LEARNINGS_TARGET_DOCTYPES` — is true at HEAD, and the
set-equality oracle §A.2 specifies over it is unaffected. But this is the same defect class the
round was dispatched to fix, one paragraph below the row it fixed (F-02).

## Interfaces

The erratum touched no interface. §I.3's gate is unchanged (`config.enabled` alone, with `docType ∈
LEARNINGS_TARGET_DOCTYPES` as BR-1's second conjunct), and the round's only edit here is
interpretive: §A.2 now says that predicate "implements BR-1 directly" rather than diverging from it.
Against BR-1 at v0.12 that reading is correct, and it removes the one place where a test author
could have read two expected sets out of the same document.

**Seam citations, re-checked by symbol.** The seam contracts §I.1/§I.2 rest on all hold at HEAD, but
three of their anchors have drifted with the file:

| Row | TSPEC anchor | HEAD |
|---|---|---|
| P-7 `defaultGit` never throws, returns `{ok, stdout, stderr}` | `:11658-11676` | `export async function defaultGit` at `:11698` — contract as described |
| P-8 `defaultReadFile` returns `null` for an absent file | `:11513-11519` | `export function defaultReadFile` at `:11553` — contract as described |
| §A.4 `defaultListFiles` | `:11586-11605` | `export function defaultListFiles` at `:11626` — contract as described |
| P-3 `dispatchAndVerify` receives every seam | `:8862-8878`, prompt composed at `:8978` | both resolve exactly; **no drift** |
| P-11/P-12 `parseAdvisoryConfig` shape | `:1980-1983`, `:1985-2010` | `parseAdvisoryConfig` at `:1964`, `ADVISORY_DEFAULTS` at `:1944`; ranges resolve |

So the seam propositions this TSPEC's fakes are designed against are all true at HEAD — the fake
contracts (`_git` never throwing, `_readFile` returning `null` rather than throwing on absence) are
still the right protocol shapes, and no test-double design in §T is invalidated. The three drifted
rows are citation hygiene only (F-04).

**`present` — still unconsumed.** Unchanged this round and unchanged upstream: the field rides in
the returned config shape, §T.5 asserts its shape only, and §I.3 states the gate is `config.enabled`
alone. A field with no named consumer and no behavioural oracle is a field whose regression nothing
reds. Carried forward from v10 as F-06.

## Data Model

**Items 1 and 2 (§D.1's domain-membership wording versus `corpusOutcome`'s `null`) — landed, and
landed well.** The sentence now reads "one test per domain asserts that every **non-`null`** value it
ever carries is a member of that field's catalogue", and the paragraph explains *why* the scoping is
not a hedge: `null` is the healthy value of `dispatches[i].corpusOutcome` and of
`runMirror.corpusOutcome` (§D.2 still shows `corpusOutcome: null, // | "RSN-UNLISTABLE" |
"RSN-EMPTY"`), meaning "documents were known", so an unscoped membership assertion would red on
every happy-path run. The contradiction the item routed is gone: §D.1 and §D.2 now agree.

Three things about this edit are worth naming because they are what keeps the oracle falsifiable —
the usual failure mode of a "scope the assertion to exclude the failing case" repair is an oracle
that can no longer fail:

1. **The catalogue set-equality test is explicitly untouched.** `null` is stated as deliberately
   **not** a member of `LEARNINGS_CORPUS_OUTCOMES`, whose set-equality operand stays exactly
   `["RSN-UNLISTABLE", "RSN-EMPTY"]`. The scoping lives in the *domain* test, not in the catalogue,
   so an implementation that adds a seventh reason still reds DC-01's set equality.
2. **The scoped predicate is written out** — `v === null || catalogue.includes(v)` — rather than
   left to the PLAN author to invent. A reader cannot accidentally implement it as "skip the
   assertion when any value is null".
3. **A positive non-`null` assertion exists elsewhere and is named.** §T.6's `DIVERGENT-CORPUS`
   fixture asserts `dispatches[5].corpusOutcome === "RSN-UNLISTABLE"` on the per-dispatch locus, so
   the catalogue's members are positively exercised somewhere; the domain test is not the only thing
   standing between the implementation and an all-`null` field.

The paragraph also correctly notes the scoping is vacuous for `rejected[].reason` and
`notices[].id`, which carry no `null`, so their tests are unchanged. That is the right narrowing —
it does not weaken the two domains that never needed it.

**The residual `runMirror` domain (v10 F-08) is now weaker, not resolved.** §D.1 keeps
`runMirror.corpusOutcome` as the fourth domain while §A.5 and §T.6 forbid asserting on the mirror
("It asserts **nothing about `runMirror`**"), and §D.2 states the mirror's value is deliberately
unconstrained and may be omitted entirely by a conforming implementation. With the non-`null`
scoping added, that fourth domain test can now be satisfied by a run in which the mirror is `null`
throughout — or absent — for every fixture in the suite. It cannot red, and it cannot mislead
either; it is a documentary constraint on which ids *may* appear. Still Low, still a PLAN-time
wording repair: either name the fixture that gives the mirror a non-`null` value, or drop the fourth
domain and say the mirror is shape-tested only (F-05).

**Closure count.** No closed set moved this round: `LEARNINGS_REJECT_REASONS` (6),
`LEARNINGS_CORPUS_OUTCOMES` (2), `LEARNINGS_NOTICES` (2), `ruleInputs.thresholds` (3 keys) are
byte-identical to what v10 approved, and each still has a named set-equality operand. The
outstanding gap is the same one v10 recorded: no closure test over `Object.keys(ruleInputs)`' own key
set, so a future sibling of `thresholds` lands unrecorded without reddening anything (F-07).

## Test Strategy

**Nothing this round invalidates a test the TSPEC specifies.** The erratum's own note says "No
behavioural change", and I confirm that: every oracle, fixture, level assignment and file/AT mapping
in §T is byte-identical to what v10 approved, except §T.6's two de-anchored citations. The
`learningsDispatchSet.test.js` / `learningsRecord.test.js` split, the L1/L2/L3 assignments, and the
`DIVERGENT-CORPUS` per-dispatch oracle are unmoved.

**AT-02's fixture list is still one shape short of upstream (F-01, carried from v10).** §T.6 reads:

> Three run shapes are fixtured: a run with no DECISIONS phase (E-27), a Phase R with no creator
> (E-28), and one with five optimizer rounds (E-29). **A fourth is added that FSPEC's inventory does
> not carry:** the erratum round's land-proof retry …

Upstream AT-02 at v0.12 enumerates four fixtures, and its fourth is a different one:

> … with fixtures covering a run with no DECISIONS phase, a run whose Phase R has no creator, a run
> with five optimizer rounds, **and a run containing an authoring-classified dispatch whose target is
> none of the six C-1 document types — so reverting BR-1's second conjunct reds this test.**

This is not a coverage hole today: §A.2 states the mutation obligation in this very round (TSPEC:174,
"AT-02 gained the fixture that reds when the second conjunct is reverted") and the falsifying test
exists in the suite — `learningsDispatchSet.test.js` samples `_recordDocType` on both arms of
`injectHere`. But §T.6 is the section a PLAN author transcribes fixture lists from, and transcribed
literally it produces four shapes with the *mutation* one missing and the erratum-retry one in its
place. The repair is one sentence: make it four upstream shapes plus the erratum retry as a fifth,
and name the file that owns the mutation check. Medium, non-gating.

**Mutation-check inventory, re-read against upstream.** BR-1's second conjunct now has an explicit
revert-and-expect-RED obligation upstream, and TSPEC carries it in §A.2. BR-15's set equality
(AT-33) is stated upstream as sets of paths with the enumeration contributing no member — TSPEC's
ERR-3 closure quotes that correctly, and §I.1/§A.3's "`git ls-files`, not an open under `docs/`"
premise is exactly the ground on which upstream made the correction. No oracle in §T needs to change
for either.

**Falsifiability of the round's own repair.** The one new assertion shape introduced this round is
§D.1's `v === null || catalogue.includes(v)`. Its falsifying case is a corpus-outcome field carrying
a non-catalogue string, which the domain test still reds on; its positive-presence conjunct lives in
`DIVERGENT-CORPUS`'s `=== "RSN-UNLISTABLE"`. So the repair does not create an absence-only or
unfalsifiable oracle — the failure mode I look for in exactly this kind of edit.

## Open Questions

**ERR-7 — correctly CLOSED (my v10 F-02, resolved).** TSPEC's closure narrates the history and cites
v0.11 for the two-conjunct restatement and v0.12 for the complement's propagation. Verified against
BR-1 at HEAD: the "if and only if … **both** hold" wording, the "load-bearing, not defensive"
sentence and the naming of the code-review phase's optimizer round as the excluded branch are all
present. §A.2's routing clause is gone. A test author now reads one expected set for AT-02, not two.

**ERR-3 — correctly CLOSED (my v10 F-03, resolved).** Verified against BR-15 at HEAD: "Both sides
are compared as **sets of paths**, not as counts" and "The corpus enumeration that lists candidate
paths contributes **no** member: it opens no file under `docs/`, so this instrument does not see
it." That is precisely the correction ERR-3 asked for, and TSPEC's closure text attributes it to
v0.11 with v0.12's set-not-count refinement — accurate.

**ERR-2 — correctly still open.** I re-checked upstream: E-30 still reads "An erratum dispatch is
made" in the singular, and AT-02's fixture list still does not name the land-proof retry. HEAD does
fire a second authoring dispatch for the same document (`erratumRound()`'s second `wrappedDispatch`,
whose prompt opens "Your previous edit to this ${target} did not land the following expected
token" — I confirmed that prompt text verbatim at `:12955`). The citation is now by symbol and
prompt-opening rather than by line, which is both DEC-DOC-01-compliant and more durable than the
line was. Leaving ERR-2 open is right.

**ERR-4 and ERR-6** are unchanged and still correctly closed against REQ v0.9, whose sha matches
this dispatch.

**Version-string residue.** The header's Upstream row now reads FSPEC v0.12, but five body passages
still say "FSPEC v0.9" — §A.5 (`REQ v0.9 AC-3.2/AC-3.3 and FSPEC v0.9 BR-9/BR-10 settle the loci`),
§I.3's E-21…E-34 row-ownership sentence, §T's `learningsRecord.test.js` row, and ERR-4/ERR-6's
closure text. I re-checked each cited proposition against FSPEC at HEAD: BR-9/BR-10's loci, the
E-21…E-34 rows and BR-9/BR-10's ordering-key wording are all still present and still say the same
thing, so nothing is falsified — the document simply names a version that no longer exists in five
places while its header names the right one (F-03). Repair at the next TSPEC edit.

**Nothing new routed upstream.** This round raises no question that FSPEC or REQ must answer; every
finding below is repairable inside this TSPEC or at PLAN-transcription time.

## Positive Observations

- **The `null`-scoping repair was made falsifiable on purpose.** The obvious way to close items 1
  and 2 was to write "non-`null`" and move on. Instead §D.1 states the reason (`null` is the healthy
  value, not an out-of-catalogue one), pins that `null` is deliberately not a catalogue member, keeps
  the set-equality operand exactly `["RSN-UNLISTABLE", "RSN-EMPTY"]`, spells the predicate out as
  `v === null || catalogue.includes(v)`, and notes the scoping is vacuous for the two domains that
  never carry `null`. That is four separate guards against the repair degrading into a
  can-only-pass oracle.
- **The de-anchoring is genuinely better than corrected line numbers would have been.** P-2a now
  cites by enclosing symbol *and* call shape, so a reader can locate all four sites with one grep and
  the citation survives the next 140-line shift. Same for ERR-2, which now cites the retry by its
  prompt opening — a string that is itself load-bearing.
- **Both stale anchors were verified as stale, not assumed.** The v0.7 note says the previous line
  anchors "having been stale at HEAD", and every replacement I re-checked resolves exactly.
- **ERR-3 and ERR-7 were closed with their history intact.** Both entries keep the original defect
  narration and then record what upstream did about it, with versions attributed. A future reader
  learns why BR-1 has two conjuncts, not merely that it does.
- **§A.2 now states the mutation obligation.** "AT-02 gained the fixture that reds when the second
  conjunct is reverted" is exactly the sentence a load-bearing invariant deserves.

## Recommendation

**Approved with minor changes.** All four routed items land and re-verify at HEAD; the TSPEC is
still a faithful compression of REQ v0.9 and FSPEC v0.12 in every load-bearing respect — BR-1's
two-conjunct rule, BR-15's set-of-paths expected set, the four authoring dispatch sites, the
conditional-spread precedent, the catalogues, the loci and the closure counts all check out. Nothing
the erratum touched broke anything v10 approved, and the `null` scoping strengthened rather than
weakened the domain oracle. The residue is one transcription gap in §T.6's AT-02 fixture list
(Medium, carried from v10), one unconsumed report field (Medium, carried from v10), and four
documentary items — stale line anchors the round did not reach, and five stale "FSPEC v0.9" version
strings. No High finding, so the confirmation does not halt the phase.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | local | §T.6 fixtures three AT-02 run shapes plus an erratum-retry fourth; upstream AT-02 at v0.12 enumerates four, its fourth being the authoring-classified dispatch whose target is none of C-1's six types, carrying the obligation "reverting BR-1's second conjunct reds this test". §A.2 states that obligation this round; §T.6's fixture list did not acquire it. The mutation check does exist in the suite (`learningsDispatchSet.test.js` sampling `_recordDocType` on both arms of `injectHere`), so this is transcription drift, not a coverage hole — but §T.6 is where a PLAN author reads fixtures from. Make it four upstream shapes plus the retry as a fifth, and name the file owning the mutation check. | §T.6 "AT-02 — the dispatch-universe set equality" |
| F-06 | Medium | inherited | nonlocal | `present` is carried in the returned config shape with no named consumer and no behavioural oracle — §T.5 asserts shape only, §I.3 states the gate is `config.enabled` alone. Either name the real consumer (the `NTC-MALFORMED`-vs-absent-section reporting split) and give it a behavioural assertion, or state that `present` survives as parser-diagnostic state tested for shape only. Untouched this round. | §I.3, §T.5 |
| F-02 | Low | delta | local | §A.2's invariant paragraph, one paragraph below the P-2a row this round de-anchored, still enumerates `converge()`'s six `docType` sites by line — `:13766`, `:13774`, `:13807`, `:13874`, `:13893`, `:13996`. At HEAD those are `forceParse.badTokens`, `harvestStatus: "Not run"` and `let prUrl`; the real sites are `:13908`, `:13916`, `:13949`, `:14016`, `:14035`, `:14138`. The claim (six `docType`s equal `LEARNINGS_TARGET_DOCTYPES`) is true and its set-equality oracle is unaffected — same defect class the round was dispatched to fix, left unlanded in the adjacent paragraph. Restate by symbol per DEC-DOC-01. | §A.2 "The coincidence is an invariant" |
| F-03 | Low | inherited | nonlocal | The header's Upstream row now reads FSPEC v0.12, but five body passages still say "FSPEC v0.9" (§A.5's loci sentence, §I.3's E-21…E-34 row-ownership sentence, §T's `learningsRecord.test.js` row, ERR-4 and ERR-6). Each cited proposition is still verbatim-present upstream, so nothing is falsified; the document names two different upstream versions of itself. Repair at the next TSPEC edit. | TSPEC front matter vs §A.5, §I.3, §T, ERR-4, ERR-6 |
| F-04 | Low | inherited | nonlocal | Seam anchors drifted with the same file shift the round confirmed: P-7 cites `defaultGit` at `:11658-11676` (HEAD `:11698`), P-8 cites `defaultReadFile` at `:11513-11519` (HEAD `:11553`), §A.4 cites `defaultListFiles` at `:11586-11605` (HEAD `:11626`), and §A.5 cites the run-scoped `notices` sink at `:12110`, which at HEAD is a POSTMORTEM comment (the sink is `:12150`). Every contract described is correct at HEAD, so no fake design is invalidated. Restate by symbol per DEC-DOC-01. | §Ground-truth P-7/P-8; §A.4; §A.5 |
| F-05 | Low | inherited | local | §D.1 keeps `runMirror.corpusOutcome` as a fourth field domain while §A.5/§T.6 assert nothing on the mirror and §D.2 permits omitting it entirely. With the new non-`null` scoping, that domain test is satisfiable by an all-`null`-or-absent mirror across every fixture, so it can no longer red on anything the suite runs. Harmless but inert: name a fixture that gives the mirror a non-`null` value, or drop the fourth domain and say the mirror is shape-tested only. | §D.1, §A.5, §D.2 |
| F-07 | Low | inherited | nonlocal | No closure test over `Object.keys(ruleInputs)`' own key set. BR-10's two per-locus completeness tests are satisfied without it, so a future sibling of `thresholds` can land unrecorded without reddening anything. Additive to BR-10's two tests, not a substitute. | §T.2, §D.2 |

FINDING: Medium | inherited | local | §T.6 AT-02 | §T.6 fixtures three AT-02 shapes plus the erratum retry; upstream AT-02 at v0.12 enumerates four, the fourth being the authoring-classified dispatch with no C-1 target that carries the mutation obligation "reverting BR-1's second conjunct reds this test" — transcribe it and name the file owning the mutation check
FINDING: Medium | inherited | nonlocal | §I.3, §T.5 | `present` is carried in the returned config shape with no named consumer and no behavioural oracle — §T.5 asserts shape only while §I.3 states the gate is `config.enabled` alone
FINDING: Low | delta | local | §A.2 "The coincidence is an invariant" | the six `converge()` `docType` line anchors (`:13766`, `:13774`, `:13807`, `:13874`, `:13893`, `:13996`) are stale at HEAD — the real sites are `:13908`, `:13916`, `:13949`, `:14016`, `:14035`, `:14138`; same defect class the round fixed one paragraph above, restate by symbol per DEC-DOC-01
FINDING: Low | inherited | nonlocal | TSPEC front matter vs §A.5, §I.3, §T, ERR-4, ERR-6 | the header now cites FSPEC v0.12 while five body passages still say "FSPEC v0.9"; every cited proposition is still verbatim-present upstream, so nothing is falsified
FINDING: Low | inherited | nonlocal | §Ground-truth P-7/P-8; §A.4; §A.5 | seam anchors stale at HEAD — `defaultGit` `:11658-11676` (real `:11698`), `defaultReadFile` `:11513-11519` (real `:11553`), `defaultListFiles` `:11586-11605` (real `:11626`), `notices` sink `:12110` (real `:12150`); all described contracts still hold
FINDING: Low | inherited | local | §D.1, §A.5, §D.2 | with the non-`null` scoping added, the `runMirror.corpusOutcome` domain test is satisfiable by an all-`null`-or-absent mirror across every fixture and can no longer red — name a fixture giving it a non-`null` value, or drop the domain and state the mirror is shape-tested only
FINDING: Low | inherited | nonlocal | §T.2, §D.2 | no closure test over `Object.keys(ruleInputs)`' own key set, so a future sibling of `thresholds` can land unrecorded without reddening anything

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 5}

APPROVAL-HASH: sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5
APPROVAL-HASH-NORMALIZED: sha256:04c060742cee190626955e7dee9cb39bdbb46b3d7ab872adf188c2d134660261
REVIEWED-COMMIT: bfe58851239e83a3e2091667e5c59b0f8d84d610
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c
