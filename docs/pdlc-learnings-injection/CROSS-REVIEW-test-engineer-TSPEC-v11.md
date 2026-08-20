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

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
